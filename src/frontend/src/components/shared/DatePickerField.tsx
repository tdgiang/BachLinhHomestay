'use client';

import * as React from 'react';
import { format, isValid, parse, startOfDay } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';
import { CalendarIcon, ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const dateLocales = { vi, en: enUS } as const;

export function startOfToday(): Date {
  return startOfDay(new Date());
}

export function dateToIsoDate(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function parseIsoDate(s: string | undefined): Date | undefined {
  if (!s) return undefined;
  const d = parse(s, 'yyyy-MM-dd', new Date());
  return isValid(d) ? startOfDay(d) : undefined;
}

export type DatePickerFieldProps = {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  disabled?: boolean;
  variant?: 'inline' | 'field';
  id?: string;
  className?: string;
};

export function DatePickerField({
  value,
  onChange,
  placeholder,
  minDate,
  disabled,
  variant = 'inline',
  id,
  className,
}: DatePickerFieldProps) {
  const locale = useLocale() as keyof typeof dateLocales;
  const dateLocale = dateLocales[locale] ?? vi;
  const t = useTranslations('common');
  const [open, setOpen] = React.useState(false);

  const resolvedPlaceholder = placeholder ?? t('pickDate');
  const today = startOfToday();

  const handleClear = () => {
    onChange(undefined);
    setOpen(false);
  };

  const handleToday = () => {
    const day = minDate && today < minDate ? minDate : today;
    onChange(day);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        render={
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className={cn(
              'w-full font-normal shadow-none cursor-pointer',
              variant === 'inline' &&
                'justify-start gap-2 h-auto min-h-0 border-0 bg-transparent px-0 py-0.5 text-sm hover:bg-transparent',
              variant === 'field' &&
                'justify-between gap-2 h-9 rounded-lg border bg-background px-3 py-2 text-sm hover:bg-background focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]',
              !value && 'text-[var(--color-text-muted)]',
              value && 'text-[var(--color-text-primary)]',
              className,
            )}
            style={
              variant === 'field'
                ? { borderColor: 'var(--color-border)' }
                : undefined
            }
          />
        }
      >
        {variant === 'inline' && (
          <CalendarIcon className="size-4 shrink-0 opacity-60" />
        )}
        <span className="flex-1 text-left truncate">
          {value
            ? format(value, 'dd/MM/yyyy', { locale: dateLocale })
            : resolvedPlaceholder}
        </span>
        {variant === 'field' ? (
          <CalendarIcon className="size-4 shrink-0 opacity-50" />
        ) : (
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
        <Calendar
          mode="single"
          selected={value}
          onSelect={(day) => {
            onChange(day);
            setOpen(false);
          }}
          locale={dateLocale}
          disabled={minDate ? { before: minDate } : undefined}
          defaultMonth={value ?? minDate ?? today}
        />
        <div
          className="flex items-center justify-between border-t px-3 py-2"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm font-medium"
            style={{ color: 'var(--color-primary)' }}
            onClick={handleClear}
            disabled={!value}
          >
            {t('clearDate')}
          </Button>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm font-medium"
            style={{ color: 'var(--color-primary)' }}
            onClick={handleToday}
          >
            {t('today')}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Homepage hero — borderless inline trigger */
export function HeroDatePicker(
  props: Omit<DatePickerFieldProps, 'variant'>,
) {
  return <DatePickerField variant="inline" {...props} />;
}
