import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { RoomCard } from './RoomCard';
import { RoomsMobileFilter } from './RoomsMobileFilter';
import { Pagination } from '@/components/shared/Pagination';
import { apiClient } from '@/lib/api-client';
import type { Branch, RoomQuery } from '@/types';

interface RoomsContentProps {
  query: RoomQuery;
  branches: Branch[];
}

export async function RoomsContent({ query, branches }: RoomsContentProps) {
  const [t, tc] = await Promise.all([
    getTranslations('room'),
    getTranslations('common'),
  ]);

  const result = await apiClient.getRooms(query);
  const { items: rooms, meta } = result;

  return (
    <div>
      {/* Mobile filter button */}
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {meta.total} phòng
        </p>
        <RoomsMobileFilter branches={branches} currentQuery={query} />
      </div>

      {/* Desktop count */}
      <p className="text-sm mb-4 hidden lg:block" style={{ color: 'var(--color-text-secondary)' }}>
        {meta.total} phòng phù hợp
      </p>

      {rooms.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {tc('noResults')}
          </p>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Thử thay đổi bộ lọc hoặc
          </p>
          <Link
            href="/rooms"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Xem tất cả phòng
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          {meta.totalPages > 1 && (
            <div className="mt-8">
              <Pagination currentPage={meta.page} totalPages={meta.totalPages} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
