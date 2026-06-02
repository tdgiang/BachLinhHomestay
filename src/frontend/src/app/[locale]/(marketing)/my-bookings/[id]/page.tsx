import { notFound, redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, MapPin, Calendar, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { apiClient } from '@/lib/api-client';

type Props = { params: Promise<{ locale: string; id: string }> };

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Chờ xác nhận', color: '#F59E0B', bg: '#FEF3C7' },
  confirmed:  { label: 'Đã xác nhận',  color: '#2563EB', bg: '#DBEAFE' },
  checked_in: { label: 'Đang ở',        color: '#10B981', bg: '#D1FAE5' },
  completed:  { label: 'Hoàn thành',   color: '#6B7280', bg: '#F3F4F6' },
  cancelled:  { label: 'Đã hủy',       color: '#EF4444', bg: '#FEE2E2' },
};

export default async function BookingDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session) redirect('/login');

  const booking = await apiClient.getBooking(id, session.accessToken).catch(() => null);
  if (!booking) notFound();

  const cfg = STATUS_CONFIG[booking.bookingStatus] ?? STATUS_CONFIG.pending;
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);

  return (
    <div className="min-h-screen pt-16" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-xl mx-auto px-4 py-8">
        <Link href="/my-bookings" className="flex items-center gap-1.5 text-sm mb-6 hover:underline" style={{ color: 'var(--color-text-secondary)' }}>
          <ChevronLeft className="w-4 h-4" /> Lịch sử đặt phòng
        </Link>

        {/* Status + code */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </span>
          <span className="font-mono font-bold text-lg" style={{ color: 'var(--color-primary)' }}>
            {booking.bookingCode}
          </span>
        </div>

        {/* Room */}
        <div className="rounded-2xl border mb-4 overflow-hidden" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
          {booking.room?.images?.[0] && (
            <img
              src={booking.room.images[0].url}
              alt={booking.room.name ?? ''}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-5 space-y-2">
            <p className="font-semibold text-base" style={{ color: 'var(--color-text-primary)' }}>
              {booking.room?.name}
            </p>
            {booking.room?.branch && (
              <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                <MapPin className="w-4 h-4 shrink-0" />{booking.room.branch.name} · {booking.room.branch.address}
              </p>
            )}
            <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              <Calendar className="w-4 h-4 shrink-0" />
              {checkIn.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
              {' → '}
              {checkOut.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
            <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              <Users className="w-4 h-4 shrink-0" />{booking.numGuests} khách · {booking.guestName}
            </p>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-2xl border p-5 mb-4 space-y-2" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>Chi tiết thanh toán</h3>
          <Row label="Giá phòng" value={`${booking.baseAmount.toLocaleString('vi-VN')}₫`} />
          {booking.extraAmount > 0 && <Row label="Phụ phí" value={`+${booking.extraAmount.toLocaleString('vi-VN')}₫`} />}
          {booking.discountAmount > 0 && <Row label="Giảm giá" value={`-${booking.discountAmount.toLocaleString('vi-VN')}₫`} color="var(--color-success)" />}
          {booking.voucherCode && <Row label="Voucher" value={booking.voucherCode} />}
          <Separator />
          <div className="flex justify-between items-center">
            <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Tổng cộng</span>
            <span className="font-bold text-xl" style={{ color: 'var(--color-text-primary)' }}>
              {booking.totalAmount.toLocaleString('vi-VN')}₫
            </span>
          </div>
          <Row
            label="Phương thức"
            value={booking.paymentMethod === 'vnpay' ? 'VNPay' : 'Tiền mặt'}
          />
          <Row
            label="Trạng thái thanh toán"
            value={booking.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
          />
        </div>

        {booking.cancelReason && (
          <div className="rounded-xl p-4 mb-4" style={{ background: '#FEF2F2' }}>
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-danger)' }}>Lý do hủy</p>
            <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{booking.cancelReason}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Link href="/rooms" className="flex-1">
            <Button variant="outline" className="w-full">Đặt phòng khác</Button>
          </Link>
          {booking.room && (
            <Link href={`/rooms/${booking.roomId}`} className="flex-1">
              <Button className="w-full text-white" style={{ background: 'var(--color-primary)' }}>
                Xem phòng
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      <span className="font-medium" style={{ color: color ?? 'var(--color-text-primary)' }}>{value}</span>
    </div>
  );
}
