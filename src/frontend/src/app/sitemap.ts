import type { MetadataRoute } from 'next';
import { apiClient } from '@/lib/api-client';
import { APP_URL as SITE_URL } from '@/lib/constants';
const LOCALES = ['vi', 'en'] as const;

function loc(path: string): string[] {
  return LOCALES.map((l) => `${SITE_URL}/${l}${path}`);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    ...loc('').map((url) => ({
      url,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    })),
    ...loc('/rooms').map((url) => ({
      url,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
    ...loc('/about').map((url) => ({
      url,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    ...loc('/contact').map((url) => ({
      url,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
    // Nội dung công bố bắt buộc theo NĐ 248/2026/NĐ-CP — cần được index để
    // cơ quan quản lý và người dùng tra cứu được.
    ...['/chinh-sach', '/chinh-sach-nd248', '/privacy', '/terms', '/payment-policy']
      .flatMap(loc)
      .map((url) => ({
        url,
        changeFrequency: 'monthly' as const,
        priority: 0.4,
      })),
  ];

  // Dynamic room pages
  let roomRoutes: MetadataRoute.Sitemap = [];
  try {
    const { items } = await apiClient.getRooms({ limit: 100 });
    roomRoutes = items.flatMap((room) =>
      LOCALES.map((l) => ({
        url:              `${SITE_URL}/${l}/rooms/${room.id}`,
        lastModified:     new Date(room.updatedAt),
        changeFrequency:  'weekly' as const,
        priority:         0.8,
      })),
    );
  } catch {
    // silently skip if backend unavailable
  }

  return [...staticRoutes, ...roomRoutes];
}
