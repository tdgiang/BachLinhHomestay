import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { ArrowRight, SearchX } from 'lucide-react';
import { RoomCard } from './RoomCard';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import type { RoomQuery } from '@/types';

interface FeaturedRoomsProps {
  query?: Omit<RoomQuery, 'limit' | 'page'>;
}

export async function FeaturedRooms({ query }: FeaturedRoomsProps = {}) {
  const t = await getTranslations('home');
  const result = await apiClient.getRooms({ ...query, limit: 100 });
  const rooms = result.items;

  const hasActiveFilter = Boolean(
    query?.branchId || query?.type || query?.priceMax || query?.search,
  );

  return (
    <section id="rooms" className="py-12 md:py-16 px-4 max-w-7xl mx-auto scroll-mt-32">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-10">
        <div>
          <p
            className="text-sm font-medium mb-1.5"
            style={{ color: 'var(--color-primary-light)' }}
          >
            {t('featuredEyebrow')}
          </p>
          <h2
            className="text-2xl md:text-3xl font-bold tracking-tight"
            style={{
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {t('featuredTitle')}
          </h2>
          <p
            className="mt-2 text-sm md:text-base"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {rooms.length > 0
              ? t('roomsAvailable', { count: rooms.length })
              : t('featuredSubtitle')}
          </p>
        </div>

        {rooms.length > 0 && (
          <Button
            render={<Link href="/rooms" />}
            nativeButton={false}
            variant="outline"
            className="shrink-0 rounded-xl gap-2 h-10 font-semibold cursor-pointer self-start sm:self-auto"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-primary)',
            }}
          >
            {t('viewAllRooms')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {rooms.length === 0 ? (
        <div
          className="text-center py-16 md:py-20 rounded-3xl"
          style={{
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--color-surface-alt)' }}
          >
            <SearchX className="w-7 h-7" style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <p
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t('noRoomsTitle')}
          </p>
          <p
            className="text-sm max-w-sm mx-auto mb-6 leading-relaxed"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {t('noRoomsHint')}
          </p>
          {hasActiveFilter && (
            <Button
              render={<Link href="/#rooms" />}
              nativeButton={false}
              className="rounded-xl font-semibold cursor-pointer"
              style={{
                background: 'var(--color-primary)',
                color: '#fff',
              }}
            >
              {t('clearFilters')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </section>
  );
}
