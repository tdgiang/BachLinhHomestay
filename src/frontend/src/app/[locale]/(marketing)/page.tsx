import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { HeroSection } from '@/components/marketing/HeroSection';
import { HomeFiltersBar } from '@/components/marketing/HomeFiltersBar';
import { FeaturedRooms } from '@/components/marketing/FeaturedRooms';
import { HomeValueProps } from '@/components/marketing/HomeValueProps';
import { HomeHowItWorks } from '@/components/marketing/HomeHowItWorks';
import { HomeCtaSection } from '@/components/marketing/HomeCtaSection';
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
    checkIn?: string;
    checkOut?: string;
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
    checkIn: sp.checkIn,
    checkOut: sp.checkOut,
  };

  const branches = await apiClient.getBranches().catch(() => []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-surface)' }}>
      <HeroSection branches={branches} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-2 relative z-20">
        <Suspense fallback={<FiltersSkeleton />}>
          <HomeFiltersBar />
        </Suspense>
      </div>

      <Suspense key={JSON.stringify(query)} fallback={<FeaturedRoomsSkeleton />}>
        <FeaturedRooms query={query} />
      </Suspense>

      <HomeValueProps />
      <HomeHowItWorks />
      <HomeCtaSection />
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div
      className="rounded-2xl border p-4 mb-2"
      style={{ borderColor: 'var(--color-border)', background: 'rgba(255,255,255,0.9)' }}
    >
      <Skeleton className="h-4 w-48 mb-3" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-[42px] w-24 rounded-full shrink-0" />
        ))}
      </div>
    </div>
  );
}

function FeaturedRoomsSkeleton() {
  return (
    <section className="py-12 md:py-16 px-4 max-w-7xl mx-auto">
      <div className="space-y-3 mb-8">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-4/3 rounded-[20px]" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  );
}
