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
      className="flex gap-2 overflow-x-auto py-3"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
    >
      {CHIPS.map(({ key, value, icon: Icon }) => {
        const isActive = active === value;
        return (
          <button
            key={key}
            onClick={() => onSelect?.(value)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 whitespace-nowrap cursor-pointer',
              isActive ? 'text-white border-transparent' : 'bg-white hover:bg-[#F3EDE5]'
            )}
            style={isActive
              ? { background: 'var(--color-primary)', borderColor: 'transparent' }
              : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }
            }
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {t(key)}
          </button>
        );
      })}
    </div>
  );
}
