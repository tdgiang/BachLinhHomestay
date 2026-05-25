'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SlidersHorizontal } from 'lucide-react';
import { FilterChips } from './FilterChips';

export function HomeFiltersBar() {
  const t = useTranslations('home');
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get('type');
  const priceMax = searchParams.get('priceMax');
  const search = searchParams.get('search');

  let active = '';
  if (type === 'hourly') active = 'hourly';
  else if (type === 'daily') active = 'daily';
  else if (priceMax === '500000') active = 'under500k';
  else if (search === 'ban công') active = 'balcony';
  else if (search === 'bồn tắm') active = 'bathtub';
  else if (search === 'duplex') active = 'duplex';
  else if (search === 'gác xép') active = 'loft';

  const hasFilter = Boolean(active);

  const handleSelect = (value: string) => {
    if (!value) {
      router.push('/#rooms');
      return;
    }
    const params = new URLSearchParams();
    if (value === 'hourly') params.set('type', 'hourly');
    else if (value === 'daily') params.set('type', 'daily');
    else if (value === 'under500k') params.set('priceMax', '500000');
    else if (value === 'balcony') params.set('search', 'ban công');
    else if (value === 'bathtub') params.set('search', 'bồn tắm');
    else if (value === 'duplex') params.set('search', 'duplex');
    else if (value === 'loft') params.set('search', 'gác xép');
    router.push(`/?${params.toString()}#rooms`);
  };

  return (
    <div
      className="sticky top-[65px] z-40 -mx-4 sm:mx-0 rounded-none sm:rounded-2xl border-b sm:border px-4 py-3.5 backdrop-blur-md"
      style={{
        background: 'rgba(255, 255, 255, 0.88)',
        borderColor: 'var(--color-border)',
        boxShadow: '0 4px 20px rgba(26, 74, 122, 0.06)',
      }}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <p
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0" style={{ color: 'var(--color-primary-light)' }} />
          {t('filtersHint')}
        </p>
        {hasFilter && (
          <button
            type="button"
            onClick={() => handleSelect('')}
            className="text-xs font-semibold shrink-0 px-2.5 py-1 rounded-lg transition-colors cursor-pointer hover:bg-[var(--color-surface-alt)]"
            style={{ color: 'var(--color-primary)' }}
          >
            {t('clearFilters')}
          </button>
        )}
      </div>
      <FilterChips active={active} onSelect={handleSelect} />
    </div>
  );
}
