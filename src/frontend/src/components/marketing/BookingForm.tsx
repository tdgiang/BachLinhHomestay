'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Clock, CalendarDays, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ImageCarousel } from '@/components/shared/ImageCarousel';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { RatingStars } from '@/components/shared/RatingStars';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { Room } from '@/types';

const TIME_OPTIONS = [
  '07:00','08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00',
  '19:00','20:00','21:00','22:00',
];

const schema = z.object({
  guestName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
  guestPhone: z.string().regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ (VD: 0901234567)'),
  guestEmail: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  guestNote: z.string().optional(),
});
type GuestFormData = z.infer<typeof schema>;

interface BookingFormProps {
  room: Room;
  defaultType?: 'hourly' | 'daily';
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultNumHours?: number;
}

function calcNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

export function BookingForm({ room, defaultType = 'hourly', defaultCheckIn, defaultCheckOut, defaultNumHours }: BookingFormProps) {
  const t = useTranslations('booking');
  const router = useRouter();
  const { data: session } = useSession();

  const today = new Date().toISOString().split('T')[0];
  const [tab, setTab] = useState<'hourly' | 'daily'>(room.allowHourly ? defaultType : 'daily');
  const [date, setDate] = useState(defaultCheckIn?.split('T')[0] ?? today);
  const [time, setTime] = useState(defaultCheckIn?.split('T')[1]?.slice(0, 5) ?? '14:00');
  const [numHours, setNumHours] = useState(defaultNumHours ?? room.minHours ?? 2);
  const [numGuests, setNumGuests] = useState(1);
  const [checkoutDate, setCheckoutDate] = useState(defaultCheckOut?.split('T')[0] ?? '');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherResult, setVoucherResult] = useState<{ valid: boolean; discountAmount: number; message?: string } | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<GuestFormData>({
    resolver: zodResolver(schema),
  });

  // Pricing
  const numNights = tab === 'daily' ? calcNights(date, checkoutDate) : 0;
  const baseAmount = tab === 'hourly'
    ? room.pricePerHour * numHours
    : room.pricePerDay * numNights;
  const extraAmount = Math.max(0, numGuests - 1) * (room.extraPersonPrice ?? 0);
  const discountAmount = voucherResult?.valid ? voucherResult.discountAmount : 0;
  const totalAmount = baseAmount + extraAmount - discountAmount;

  // Debounced voucher check
  useEffect(() => {
    if (!voucherCode.trim()) { setVoucherResult(null); return; }
    const timer = setTimeout(async () => {
      setVoucherLoading(true);
      const res = await apiClient.validateVoucher({ code: voucherCode.trim(), bookingAmount: baseAmount + extraAmount });
      setVoucherResult(res);
      setVoucherLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [voucherCode, baseAmount, extraAmount]);

  const onSubmit = async (guestData: GuestFormData) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const checkIn = tab === 'hourly'
        ? new Date(`${date}T${time}:00`).toISOString()
        : new Date(`${date}T14:00:00`).toISOString();
      const checkOut = tab === 'hourly'
        ? new Date(new Date(`${date}T${time}:00`).getTime() + numHours * 3600000).toISOString()
        : new Date(`${checkoutDate}T11:00:00`).toISOString();

      const booking = await apiClient.createBooking({
        roomId: room.id,
        bookingType: tab,
        checkIn,
        checkOut,
        numHours: tab === 'hourly' ? numHours : undefined,
        numGuests,
        guestName: guestData.guestName,
        guestPhone: guestData.guestPhone,
        guestEmail: guestData.guestEmail || undefined,
        guestNote: guestData.guestNote || undefined,
        voucherCode: voucherResult?.valid ? voucherCode.trim() : undefined,
        paymentMethod: 'cash',
      }, session?.accessToken);

      router.push(`/booking/${booking.id}/confirm`);
    } catch (err: unknown) {
      setSubmitting(false);
      const message = err instanceof Error ? err.message : 'Đặt phòng thất bại. Vui lòng thử lại.';
      setSubmitError(message);
    }
  };

  const images = room.images ?? [];

  return (
    <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
      {/* Left: Form */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
            {t('title')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {room.name} · {room.branch?.name}
          </p>
        </div>

        {/* Tab type */}
        {room.allowHourly && (
          <div className="flex gap-2 p-1 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: '#F5F8FA' }}>
            {(['hourly', 'daily'] as const).map((t2) => (
              <button
                key={t2}
                type="button"
                onClick={() => setTab(t2)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all',
                  tab === t2 ? 'bg-white shadow text-[#1A2A3A]' : 'text-[#8EA3B3] hover:text-[#1A2A3A]'
                )}
              >
                {t2 === 'hourly' ? <Clock className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                {t2 === 'hourly' ? t('hourlyTab') : t('dailyTab')}
              </button>
            ))}
          </div>
        )}

        {/* Date/time fields */}
        <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Thời gian
          </h3>

          {tab === 'hourly' ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t('selectDate')}</Label>
                <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('selectTime')}</Label>
                <select
                  className="w-full h-9 rounded-lg border px-3 text-sm outline-none focus:ring-1 focus:ring-[#00B4D8]"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  {TIME_OPTIONS.map((t2) => <option key={t2} value={t2}>{t2}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('numHours')}</Label>
                <div className="flex items-center gap-2 h-9 border rounded-lg px-3" style={{ borderColor: 'var(--color-border)' }}>
                  <button type="button" onClick={() => setNumHours((n) => Math.max(room.minHours ?? 1, n - 1))}>
                    <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                  </button>
                  <span className="flex-1 text-center text-sm font-semibold">{numHours} giờ</span>
                  <button type="button" onClick={() => setNumHours((n) => Math.min(24, n + 1))}>
                    <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t('numGuests')}</Label>
                <div className="flex items-center gap-2 h-9 border rounded-lg px-3" style={{ borderColor: 'var(--color-border)' }}>
                  <button type="button" onClick={() => setNumGuests((n) => Math.max(1, n - 1))}>
                    <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                  </button>
                  <span className="flex-1 text-center text-sm font-semibold">{numGuests} khách</span>
                  <button type="button" onClick={() => setNumGuests((n) => Math.min(room.capacity, n + 1))}>
                    <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t('checkin')}</Label>
                <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('checkout')}</Label>
                <Input type="date" min={date || today} value={checkoutDate} onChange={(e) => setCheckoutDate(e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>{t('numGuests')}</Label>
                <div className="flex items-center gap-2 h-9 border rounded-lg px-3 w-48" style={{ borderColor: 'var(--color-border)' }}>
                  <button type="button" onClick={() => setNumGuests((n) => Math.max(1, n - 1))}>
                    <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                  </button>
                  <span className="flex-1 text-center text-sm font-semibold">{numGuests} khách</span>
                  <button type="button" onClick={() => setNumGuests((n) => Math.min(room.capacity, n + 1))}>
                    <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Guest info */}
        <form id="booking-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {t('guestInfo')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="guestName">{t('guestNameRequired')}</Label>
                <Input id="guestName" placeholder="Nguyễn Văn A" {...register('guestName')} />
                {errors.guestName && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{errors.guestName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="guestPhone">{t('guestPhoneRequired')}</Label>
                <Input id="guestPhone" placeholder="0901234567" {...register('guestPhone')} />
                {errors.guestPhone && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{errors.guestPhone.message}</p>}
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="guestEmail">{t('guestEmail')}</Label>
                <Input id="guestEmail" type="email" placeholder="email@example.com" {...register('guestEmail')} />
                {errors.guestEmail && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{errors.guestEmail.message}</p>}
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="guestNote">{t('guestNote')}</Label>
                <Textarea id="guestNote" rows={2} placeholder="Yêu cầu đặc biệt, giờ đến muộn..." {...register('guestNote')} />
              </div>
            </div>
          </div>

          {/* Voucher */}
          <div className="rounded-2xl border p-5 mt-4" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
              {t('voucher')}
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder={t('voucherPlaceholder')}
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                className="uppercase"
              />
              {voucherLoading && <Loader2 className="w-5 h-5 animate-spin self-center shrink-0" style={{ color: 'var(--color-text-secondary)' }} />}
            </div>
            {voucherResult && (
              <div className="mt-2 flex items-center gap-1.5 text-sm">
                {voucherResult.valid ? (
                  <>
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-success)' }} />
                    <span style={{ color: 'var(--color-success)' }}>
                      Giảm {voucherResult.discountAmount.toLocaleString('vi-VN')}₫
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-danger)' }} />
                    <span style={{ color: 'var(--color-danger)' }}>{voucherResult.message}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Right: Summary + room info */}
      <div className="mt-6 lg:mt-0">
        <div className="sticky top-24 space-y-4">
          {/* Room card mini */}
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
            {images.length > 0 && (
              <div className="h-48">
                <ImageCarousel images={images} alt={room.name} aspectRatio="16/9" showDots={false} showArrows={false} showCounter={false} />
              </div>
            )}
            <div className="p-4">
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{room.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{room.branch?.name}</p>
              <RatingStars rating={room.ratingAvg} count={room.ratingCount} size="sm" className="mt-1.5" />
            </div>
          </div>

          {/* Price summary */}
          <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>Tóm tắt đơn</h3>

            <SummaryRow
              label={tab === 'hourly'
                ? `${room.pricePerHour.toLocaleString('vi-VN')}₫ × ${numHours} giờ`
                : `${room.pricePerDay.toLocaleString('vi-VN')}₫ × ${numNights} đêm`
              }
              value={baseAmount}
            />
            {extraAmount > 0 && (
              <SummaryRow label={`Phụ phí (${numGuests - 1} khách thêm)`} value={extraAmount} prefix="+" />
            )}
            {discountAmount > 0 && (
              <SummaryRow label="Giảm giá voucher" value={discountAmount} prefix="-" color="var(--color-success)" />
            )}

            <Separator />
            <div className="flex justify-between items-center">
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Tổng cộng</span>
              <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {totalAmount > 0 ? `${totalAmount.toLocaleString('vi-VN')}₫` : '—'}
              </span>
            </div>

            {submitError && (
              <div className="flex items-start gap-2 rounded-lg p-3 text-sm" style={{ background: '#FEF2F2', color: 'var(--color-danger)' }}>
                <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            <Button
              type="submit"
              form="booking-form"
              disabled={submitting || (tab === 'daily' && numNights === 0) || (tab === 'hourly' && !date)}
              className="w-full text-white font-semibold mt-2"
              style={{ background: 'var(--color-primary)' }}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('continue')}
            </Button>
            <p className="text-xs text-center" style={{ color: 'var(--color-text-secondary)' }}>
              Chưa bị tính phí — xác nhận ở bước tiếp theo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, prefix = '', color }: { label: string; value: number; prefix?: string; color?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      <span style={{ color: color ?? 'var(--color-text-primary)' }}>
        {prefix}{value.toLocaleString('vi-VN')}₫
      </span>
    </div>
  );
}
