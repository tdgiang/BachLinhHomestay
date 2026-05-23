import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { HeroSection } from '@/components/marketing/HeroSection';
import { FilterChipsSection } from '@/components/marketing/FilterChipsSection';
import { FeaturedRooms } from '@/components/marketing/FeaturedRooms';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import type { BookingType } from '@/types';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    branchId?: string;
    type?: string;
    priceMax?: string;
    search?: string;
  }>;
};

export default async function HomePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;
  const query = {
    branchId: sp.branchId,
    type: sp.type as BookingType | undefined,
    priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
    search: sp.search,
  };

  const branches = await apiClient.getBranches();

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <HeroSection branches={branches} />

      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Suspense>
          <FilterChipsSection />
        </Suspense>
      </div>

      <Suspense key={JSON.stringify(query)} fallback={<FeaturedRoomsSkeleton />}>
        <FeaturedRooms query={query} />
      </Suspense>
    </div>
  );
}

function FeaturedRoomsSkeleton() {
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <div className="h-8 w-48 mb-2"><Skeleton className="h-full w-full" /></div>
      <div className="h-4 w-64 mb-6"><Skeleton className="h-full w-full" /></div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square rounded-[12px]" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}
