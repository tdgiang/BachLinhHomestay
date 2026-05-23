import { getTranslations } from 'next-intl/server';
import { RoomCard } from './RoomCard';
import { apiClient } from '@/lib/api-client';
import type { RoomQuery } from '@/types';

interface FeaturedRoomsProps {
  query?: Omit<RoomQuery, 'limit' | 'page'>;
}

export async function FeaturedRooms({ query }: FeaturedRoomsProps = {}) {
  const t = await getTranslations('home');
  const result = await apiClient.getRooms({ ...query, limit: 100 });
  const rooms = result.items;

  return (
    <section id="rooms" className="py-16 px-4 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="mb-10 text-center">
        <p
          className="text-xs font-medium uppercase tracking-[0.18em] mb-3"
          style={{ color: 'var(--color-primary-light)' }}
        >
          Chọn phòng của bạn
        </p>
        <h2
          className="text-3xl md:text-4xl font-bold"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)', letterSpacing: '-0.01em' }}
        >
          {t('featuredTitle')}
        </h2>
        <p className="mt-3 text-sm font-light" style={{ color: 'var(--color-text-secondary)' }}>
          {rooms.length > 0 ? `${rooms.length} phòng sẵn sàng đón tiếp` : t('featuredSubtitle')}
        </p>
        {/* Warm underline decoration */}
        <div className="flex items-center justify-center gap-2 mt-5">
          <div className="h-px w-12" style={{ background: 'var(--color-border)' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-primary-light)' }} />
          <div className="h-px w-12" style={{ background: 'var(--color-border)' }} />
        </div>
      </div>

      {rooms.length === 0 ? (
        <div
          className="text-center py-24 rounded-[20px]"
          style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)' }}
        >
          <p className="text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            Không tìm thấy phòng phù hợp
          </p>
          <p className="text-sm font-light" style={{ color: 'var(--color-text-secondary)' }}>
            Thử thay đổi bộ lọc để xem thêm lựa chọn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </section>
  );
}
