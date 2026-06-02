import type { MetadataRoute } from 'next';
import { apiClient } from '@/lib/api-client';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
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
