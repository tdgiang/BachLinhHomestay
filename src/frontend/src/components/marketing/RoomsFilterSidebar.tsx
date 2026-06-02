'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Branch, RoomQuery, BookingType } from '@/types';

const PRICE_OPTS = [
  { label: 'Tất cả mức giá', value: '' },
  { label: 'Dưới 200.000₫', value: '200000' },
  { label: 'Dưới 500.000₫', value: '500000' },
  { label: 'Dưới 1.000.000₫', value: '1000000' },
  { label: 'Dưới 2.000.000₫', value: '2000000' },
];

const TYPE_OPTS: { label: string; value: BookingType | '' }[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Theo giờ', value: 'hourly' },
  { label: 'Theo ngày', value: 'daily' },
];

interface Props {
  branches: Branch[];
  currentQuery: RoomQuery;
}

export function RoomsFilterSidebar({ branches, currentQuery }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams();
    if (currentQuery.branchId) params.set('branchId', currentQuery.branchId);
    if (currentQuery.type) params.set('type', currentQuery.type);
    if (currentQuery.priceMax) params.set('priceMax', String(currentQuery.priceMax));
    if (currentQuery.search) params.set('search', currentQuery.search);
    params.delete('page');

    if (value) params.set(key, value);
    else params.delete(key);

    router.push(`${pathname}?${params.toString()}`);
  }, [currentQuery, pathname, router]);

  const clearAll = () => router.push(pathname);

  const hasFilter = !!(currentQuery.branchId || currentQuery.type || currentQuery.priceMax || currentQuery.search);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
          Bộ lọc
        </h3>
        {hasFilter && (
          <button
            onClick={clearAll}
            className="text-xs hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Branch */}
      <FilterGroup label="Chi nhánh">
        <div className="space-y-1">
          <FilterOption
            label="Tất cả chi nhánh"
            active={!currentQuery.branchId}
            onClick={() => updateFilter('branchId', '')}
          />
          {branches.map((b) => (
            <FilterOption
              key={b.id}
              label={b.name}
              active={currentQuery.branchId === b.id}
              onClick={() => updateFilter('branchId', b.id)}
            />
          ))}
        </div>
      </FilterGroup>

      {/* Type */}
      <FilterGroup label="Loại thuê">
        <div className="space-y-1">
          {TYPE_OPTS.map(({ label, value }) => (
            <FilterOption
              key={label}
              label={label}
              active={currentQuery.type === value || (!currentQuery.type && value === '')}
              onClick={() => updateFilter('type', value)}
            />
          ))}
        </div>
      </FilterGroup>

      {/* Price */}
      <FilterGroup label="Giá">
        <div className="space-y-1">
          {PRICE_OPTS.map(({ label, value }) => (
            <FilterOption
              key={label}
              label={label}
              active={String(currentQuery.priceMax ?? '') === value}
              onClick={() => updateFilter('priceMax', value)}
            />
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-secondary)' }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function FilterOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left text-sm px-3 py-2 rounded-lg transition-colors',
        active ? 'font-medium' : 'hover:bg-[#F5F8FA]'
      )}
      style={{
        color: active ? 'var(--color-primary)' : 'var(--color-text-primary)',
        background: active ? '#E6F4FB' : undefined,
      }}
    >
      {label}
    </button>
  );
}
