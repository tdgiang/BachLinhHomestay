'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';
import { CalendarIcon, ChevronDownIcon } from 'lucide-react';
import Select, { type GroupBase, type StylesConfig } from 'react-select';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const dateLocales = { vi, en: enUS } as const;

export type HeroSelectOption = { value: string; label: string };

const heroSelectStyles: StylesConfig<HeroSelectOption, false, GroupBase<HeroSelectOption>> = {
  container: (base) => ({
    ...base,
    width: '100%',
  }),
  control: (base, state) => ({
    ...base,
    minHeight: 30,
    border: 'none',
    boxShadow: 'none',
    background: 'transparent',
    cursor: 'pointer',
    '&:hover': { border: 'none' },
    ...(state.isFocused && {
      border: 'none',
      boxShadow: 'none',
    }),
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '2px 0',
    paddingLeft: 0,
  }),
  singleValue: (base) => ({
    ...base,
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
    fontWeight: 500,
    margin: 0,
  }),
  placeholder: (base) => ({
    ...base,
    color: 'var(--color-text-muted)',
    fontSize: '0.875rem',
    margin: 0,
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    color: 'var(--color-text-primary)',
    fontSize: '0.875rem',
  }),
  indicatorsContainer: (base) => ({
    ...base,
    paddingRight: 0,
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base, state) => ({
    ...base,
    padding: 0,
    color: state.isFocused ? 'var(--color-primary)' : 'var(--color-text-muted)',
    transition: 'color 0.15s ease, transform 0.2s ease',
    transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : undefined,
    '&:hover': { color: 'var(--color-primary)' },
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: '0 4px',
    color: 'var(--color-text-muted)',
    '&:hover': { color: 'var(--color-primary)' },
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-lg)',
    marginTop: 6,
    background: '#fff',
  }),
  menuList: (base) => ({
    ...base,
    padding: 6,
    maxHeight: 260,
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    fontSize: '0.875rem',
    borderRadius: 10,
    padding: '10px 12px',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease',
    backgroundColor: isSelected
      ? 'var(--color-primary)'
      : isFocused
        ? 'var(--color-surface-alt)'
        : 'transparent',
    color: isSelected ? '#fff' : 'var(--color-text-primary)',
    ':active': {
      backgroundColor: isSelected ? 'var(--color-primary-dark)' : 'var(--color-surface-alt)',
    },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    fontSize: '0.8125rem',
    color: 'var(--color-text-muted)',
  }),
};

export function HeroFormField({
  label,
  icon,
  children,
  bordered,
  className,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'px-3.5 sm:px-4 py-3 flex flex-col gap-1.5 transition-colors hover:bg-white/80',
        bordered && 'sm:border-l',
        className,
      )}
      style={bordered ? { borderColor: 'var(--color-border)' } : undefined}
    >
      <span
        className="flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wide"
        style={{ color: 'var(--color-primary-light)' }}
      >
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}

export function HeroSelect({
  id,
  value,
  onValueChange,
  placeholder,
  options,
  allowEmpty = false,
  isSearchable = false,
  noOptionsMessage,
}: {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: HeroSelectOption[];
  allowEmpty?: boolean;
  isSearchable?: boolean;
  noOptionsMessage?: string;
}) {
  const selectOptions = React.useMemo(
    () => options.filter((o) => o.value !== ''),
    [options],
  );

  const selected = React.useMemo(
    () => selectOptions.find((o) => o.value === value) ?? null,
    [selectOptions, value],
  );

  return (
    <Select<HeroSelectOption, false>
      instanceId={`hero-select-${id}`}
      inputId={`hero-select-input-${id}`}
      options={selectOptions}
      value={selected}
      onChange={(opt) => onValueChange(opt?.value ?? '')}
      placeholder={placeholder}
      isClearable={allowEmpty}
      isSearchable={isSearchable}
      styles={heroSelectStyles}
      classNamePrefix="hero-rs"
      menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      menuPosition="fixed"
      noOptionsMessage={() => noOptionsMessage ?? placeholder}
      unstyled={false}
      components={{
        IndicatorSeparator: () => null,
      }}
    />
  );
}

export function HeroDatePicker({
  value,
  onChange,
  placeholder,
  minDate,
  disabled,
}: {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
  minDate?: Date;
  disabled?: boolean;
}) {
  const locale = useLocale() as keyof typeof dateLocales;
  const dateLocale = dateLocales[locale] ?? vi;
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className={cn(
              'w-full justify-start gap-2 h-auto min-h-0 border-0 bg-transparent px-0 py-0.5 text-sm font-normal shadow-none hover:bg-transparent cursor-pointer',
              !value && 'text-[var(--color-text-muted)]',
              value && 'text-[var(--color-text-primary)]',
            )}
          />
        }
      >
        <CalendarIcon className="size-4 shrink-0 opacity-60" />
        <span className="flex-1 text-left truncate">
          {value ? format(value, 'dd/MM/yyyy', { locale: dateLocale }) : placeholder}
        </span>
        <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
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
          defaultMonth={value ?? minDate}
        />
      </PopoverContent>
    </Popover>
  );
}
