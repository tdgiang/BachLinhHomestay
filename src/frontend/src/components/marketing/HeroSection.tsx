'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Search, Clock, CalendarDays, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { Branch } from '@/types';

const TIME_OPTIONS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
  '19:00', '20:00', '21:00', '22:00',
];

interface HeroSectionProps {
  branches: Branch[];
}

export function HeroSection({ branches }: HeroSectionProps) {
  const t = useTranslations('home');
  const router = useRouter();

  const [tab, setTab] = useState<'hourly' | 'daily'>('hourly');
  const [branchId, setBranchId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('14:00');
  const [numHours, setNumHours] = useState(2);
  const [checkout, setCheckout] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (branchId) params.set('branchId', branchId);
    params.set('type', tab);
    if (date) {
      const checkIn = tab === 'hourly' ? `${date}T${time}:00` : `${date}T14:00:00`;
      params.set('checkIn', checkIn);
    }
    if (tab === 'daily' && checkout) params.set('checkOut', `${checkout}T11:00:00`);
    if (tab === 'hourly') params.set('numHours', String(numHours));
    router.push(`/?${params.toString()}#rooms`);
  };

  const selectBase = 'w-full bg-transparent border-0 outline-none text-sm appearance-none cursor-pointer';

  return (
    <section
      className="relative overflow-hidden grain-overlay"
      style={{ background: 'var(--color-hero-bg)', paddingTop: '96px', paddingBottom: '64px' }}
    >
      {/* Decorative warm blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div
          className="warm-blob absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full opacity-40"
          style={{ background: 'radial-gradient(circle at 40% 40%, #E8C9A0 0%, #F3E4D0 45%, transparent 72%)' }}
        />
        <div
          className="warm-blob-delay absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle at 60% 60%, #D4B8A0 0%, transparent 68%)' }}
        />
        {/* Subtle warm horizontal line accents */}
        <div className="absolute top-1/3 left-0 right-0 h-px opacity-20"
          style={{ background: 'linear-gradient(to right, transparent, #C9A882 30%, #C9A882 70%, transparent)' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
        {/* Korean-style pill badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7 text-xs font-medium tracking-wider"
          style={{
            background: 'rgba(160,117,80,0.08)',
            border: '1px solid rgba(160,117,80,0.2)',
            color: 'var(--color-primary)',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--color-primary-light)' }} />
          {t('heroEyebrow')}
        </div>

        {/* Main heading — Noto Sans KR, thin weight, warm */}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-[1.2] tracking-tight"
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          {t('heroTitle')}
        </h1>

        <p
          className="text-base md:text-lg mb-10 leading-relaxed max-w-lg mx-auto font-light"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {t('heroSubtitle')}
        </p>

        {/* Search card — white, warm shadow */}
        <div
          className="rounded-2xl overflow-hidden text-left"
          style={{
            background: '#FFFFFF',
            border: '1px solid var(--color-border)',
            boxShadow: '0 8px 40px rgba(100,60,20,0.10), 0 1px 0 rgba(255,255,255,0.8) inset',
          }}
        >
          {/* Tabs */}
          <div className="flex gap-1 p-1.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
            {(['hourly', 'daily'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTab(type)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer',
                  tab === type ? 'text-white' : 'hover:bg-[#FAF8F5]'
                )}
                style={tab === type
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { color: 'var(--color-text-secondary)' }
                }
              >
                {type === 'hourly' ? <Clock className="w-3.5 h-3.5" /> : <CalendarDays className="w-3.5 h-3.5" />}
                {type === 'hourly' ? t('tabHourly') : t('tabDaily')}
              </button>
            ))}
          </div>

          {/* Form grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <FormField label={t('selectBranch')} icon={<MapPin className="w-3.5 h-3.5" />}>
              <select
                className={selectBase}
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                style={{ color: branchId ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
              >
                <option value="">{t('selectBranch')}</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label={t('date')} icon={<CalendarDays className="w-3.5 h-3.5" />} bordered>
              <input
                type="date" min={today} value={date}
                onChange={(e) => setDate(e.target.value)}
                className={cn(selectBase, !date && 'text-[var(--color-text-muted)]')}
                style={{ color: date ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
              />
            </FormField>

            {tab === 'hourly' ? (
              <>
                <FormField label={t('time')} icon={<Clock className="w-3.5 h-3.5" />} bordered>
                  <select
                    className={selectBase}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {TIME_OPTIONS.map((t2) => (
                      <option key={t2} value={t2}>{t2}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label={t('numHours')} icon={<Clock className="w-3.5 h-3.5" />} bordered>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNumHours((n) => Math.max(1, n - 1))}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer hover:bg-[#F3EDE5]"
                      style={{ color: 'var(--color-primary)' }}
                      aria-label="Giảm"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <span className="font-semibold w-8 text-center text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {numHours}h
                    </span>
                    <button
                      type="button"
                      onClick={() => setNumHours((n) => Math.min(24, n + 1))}
                      className="w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer hover:bg-[#F3EDE5]"
                      style={{ color: 'var(--color-primary)' }}
                      aria-label="Tăng"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  </div>
                </FormField>
              </>
            ) : (
              <FormField label={t('checkout')} icon={<CalendarDays className="w-3.5 h-3.5" />} bordered className="sm:col-span-2">
                <input
                  type="date" min={date || today} value={checkout}
                  onChange={(e) => setCheckout(e.target.value)}
                  className={selectBase}
                  style={{ color: checkout ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
                />
              </FormField>
            )}
          </div>

          {/* Search button */}
          <div className="p-3">
            <Button
              onClick={handleSearch}
              className="w-full font-semibold py-3.5 rounded-xl gap-2 text-white transition-all duration-300 cursor-pointer hover:opacity-90"
              style={{
                background: 'var(--color-primary)',
                boxShadow: '0 4px 16px rgba(160,117,80,0.28)',
              }}
            >
              <Search className="w-4 h-4" />
              {t('searchButton')}
            </Button>
          </div>
        </div>

        {/* Trust stats */}
        <div className="flex items-center justify-center gap-6 mt-8 flex-wrap">
          {[
            { value: '20+', label: 'Phòng' },
            { value: '5+', label: 'Chi nhánh' },
            { value: '4.8', label: 'Đánh giá' },
          ].map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              {i > 0 && <span className="w-1 h-1 rounded-full" style={{ background: 'var(--color-border)' }} />}
              <span className="font-semibold" style={{ color: 'var(--color-primary)' }}>{value}</span>
              <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FormField({
  label, icon, children, bordered, className,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn('px-4 py-3.5 flex flex-col gap-1.5 transition-colors duration-200 hover:bg-[#FDFBF9]', className)}
      style={bordered ? { borderLeft: '1px solid var(--color-border)' } : undefined}
    >
      <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide" style={{ color: 'var(--color-primary-light)' }}>
        {icon} {label}
      </span>
      {children}
    </div>
  );
}
