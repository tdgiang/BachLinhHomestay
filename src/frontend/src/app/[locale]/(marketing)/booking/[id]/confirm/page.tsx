'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Loader2, CreditCard, Banknote, ShieldCheck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api-client';
import type { Booking } from '@/types';
import { use } from 'react';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  checked_in: 'Đang ở',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export default function ConfirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('booking');
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [payMethod, setPayMethod] = useState<'vnpay' | 'cash'>('vnpay');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiClient.getBooking(id)
      .then((b) => { setBooking(b); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleConfirm = async () => {
    if (!booking) return;
    setSubmitting(true);
    try {
      if (payMethod === 'vnpay') {
        const { paymentUrl } = await apiClient.createVnpayPayment(booking.id);
        window.location.href = paymentUrl;
      } else {
        router.push(`/booking/${booking.id}/success`);
      }
    } catch {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  if (!booking) return null;

  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);

  return (
    <div className="min-h-screen pt-16" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Xác nhận đặt phòng
        </h1>

        {/* Booking summary */}
        <div className="rounded-2xl border p-5 mb-4" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
          <div className="flex items-start gap-3 mb-4">
            {booking.room?.images?.[0] && (
              <img
                src={booking.room.images[0].url}
                alt={booking.room.name ?? ''}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
            )}
            <div>
              <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{booking.room?.name}</p>
              {booking.room?.branch && (
                <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                  <MapPin className="w-3 h-3" />{booking.room.branch.name}
                </p>
              )}
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ background: 'var(--color-primary)' }}>
                {STATUS_LABEL[booking.bookingStatus] ?? booking.bookingStatus}
              </span>
            </div>
          </div>

          <Separator className="mb-4" />

          <div className="space-y-2 text-sm">
            <InfoRow label="Khách" value={booking.guestName} />
            <InfoRow label="SĐT" value={booking.guestPhone} />
            <InfoRow label="Nhận phòng" value={checkIn.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })} />
            <InfoRow label="Trả phòng" value={checkOut.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })} />
            <InfoRow label="Số khách" value={`${booking.numGuests} người`} />
            {booking.voucherCode && <InfoRow label="Voucher" value={booking.voucherCode} />}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1.5 text-sm">
            {booking.discountAmount > 0 && <InfoRow label="Giảm giá" value={`-${booking.discountAmount.toLocaleString('vi-VN')}₫`} />}
            {booking.extraAmount > 0 && <InfoRow label="Phụ phí" value={`+${booking.extraAmount.toLocaleString('vi-VN')}₫`} />}
            <div className="flex justify-between font-bold pt-1">
              <span style={{ color: 'var(--color-text-primary)' }}>Tổng cộng</span>
              <span style={{ color: 'var(--color-text-primary)' }}>{booking.totalAmount.toLocaleString('vi-VN')}₫</span>
            </div>
          </div>
        </div>

        {/* Payment method */}
        <div className="rounded-2xl border p-5 mb-4" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Phương thức thanh toán
          </h3>
          <div className="space-y-2">
            <PayOption
              value="vnpay"
              icon={<CreditCard className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />}
              label={t('payVnpay')}
              active={payMethod === 'vnpay'}
              onClick={() => setPayMethod('vnpay')}
            />
            <PayOption
              value="cash"
              icon={<Banknote className="w-5 h-5" style={{ color: 'var(--color-success)' }} />}
              label={t('payCash')}
              active={payMethod === 'cash'}
              onClick={() => setPayMethod('cash')}
            />
          </div>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={submitting}
          className="w-full text-white font-semibold py-3"
          style={{ background: 'var(--color-primary)' }}
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t('confirm')}
        </Button>

        <p className="text-xs text-center mt-3 flex items-center justify-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
          <ShieldCheck className="w-3.5 h-3.5" /> Thông tin được bảo mật
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
    </div>
  );
}

function PayOption({ value, icon, label, active, onClick }: {
  value: string; icon: React.ReactNode; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors text-left"
      style={{
        borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
        background: active ? '#E6F4FB' : 'white',
      }}
    >
      {icon}
      <span className="text-sm font-medium flex-1" style={{ color: 'var(--color-text-primary)' }}>{label}</span>
      <div
        className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
        style={{ borderColor: active ? 'var(--color-primary)' : 'var(--color-border)' }}
      >
        {active && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-primary)' }} />}
      </div>
    </button>
  );
}
