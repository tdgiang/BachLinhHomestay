'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { LayoutGrid, Clock, CalendarDays, Tag, Trees, Waves, Building, Layers } from 'lucide-react';

const CHIPS = [
  { key: 'filterAll',       value: '',           icon: LayoutGrid },
  { key: 'filterHourly',    value: 'hourly',     icon: Clock },
  { key: 'filterDaily',     value: 'daily',      icon: CalendarDays },
  { key: 'filterUnder500k', value: 'under500k',  icon: Tag },
  { key: 'filterBalcony',   value: 'balcony',    icon: Trees },
  { key: 'filterBathtub',   value: 'bathtub',    icon: Waves },
  { key: 'filterDuplex',    value: 'duplex',     icon: Building },
  { key: 'filterLoft',      value: 'loft',       icon: Layers },
] as const;

interface FilterChipsProps {
  active?: string;
  onSelect?: (value: string) => void;
}

export function FilterChips({ active = '', onSelect }: FilterChipsProps) {
  const t = useTranslations('home');

  return (
    <div
      className="flex gap-2 overflow-x-auto pb-0.5 -mx-1 px-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
    >
      {CHIPS.map(({ key, value, icon: Icon }) => {
        const isActive = active === value;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect?.(value)}
            className={cn(
              'shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap cursor-pointer min-h-[42px]',
              isActive
                ? 'text-white border-transparent shadow-sm scale-[1.02]'
                : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-alt)] hover:border-[var(--color-primary-light)]/40',
            )}
            style={
              isActive
                ? {
                    background:
                      'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%)',
                    borderColor: 'transparent',
                  }
                : {
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {t(key)}
          </button>
        );
      })}
    </div>
  );
}
