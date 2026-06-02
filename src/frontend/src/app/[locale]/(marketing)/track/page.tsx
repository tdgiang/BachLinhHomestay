'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Search, MapPin, Calendar, Users, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import type { Booking } from '@/types';
import type { Metadata } from 'next';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Chờ xác nhận', color: '#F59E0B', bg: '#FEF3C7' },
  confirmed:  { label: 'Đã xác nhận',  color: '#2563EB', bg: '#DBEAFE' },
  checked_in: { label: 'Đang ở',        color: 'var(--color-success)', bg: '#D1FAE5' },
  completed:  { label: 'Hoàn thành',   color: '#6B7280', bg: '#F3F4F6' },
  cancelled:  { label: 'Đã hủy',       color: 'var(--color-danger)', bg: '#FEE2E2' },
};

export default function TrackBookingPage() {
  const t = useTranslations('booking');
  const [code, setCode] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setBooking(null);
    try {
      const result = await apiClient.getBookingByCode(trimmed);
      setBooking(result);
    } catch {
      setError('Không tìm thấy đặt phòng với mã này. Kiểm tra lại mã hoặc thử mã khác.');
    } finally {
      setLoading(false);
    }
  };

  const statusCfg = booking ? STATUS_CONFIG[booking.bookingStatus] : null;

  return (
    <div className="min-h-screen pt-16" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {t('trackBooking')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Nhập mã đặt phòng để xem trạng thái
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-2 mb-6">
          <Input
            placeholder={t('trackPlaceholder')}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="uppercase font-mono text-base tracking-wider"
          />
          <Button
            onClick={handleSearch}
            disabled={loading || !code.trim()}
            className="text-white shrink-0 gap-1.5"
            style={{ background: 'var(--color-primary)' }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {t('trackButton')}
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl flex items-start gap-3 p-4 mb-4" style={{ background: '#FEF2F2' }}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--color-danger)' }} />
            <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
          </div>
        )}

        {/* Result */}
        {booking && statusCfg && (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
            {/* Status banner */}
            <div className="px-5 py-3 flex items-center justify-between" style={{ background: statusCfg.bg }}>
              <span className="text-sm font-semibold" style={{ color: statusCfg.color }}>
                {statusCfg.label}
              </span>
              <span className="text-xs font-mono font-bold" style={{ color: statusCfg.color }}>
                {booking.bookingCode}
              </span>
            </div>

            {/* Room info */}
            <div className="p-5 space-y-3">
              {booking.room?.images?.[0] && (
                <img
                  src={booking.room.images[0].url}
                  alt={booking.room.name ?? ''}
                  className="w-full h-40 object-cover rounded-xl"
                />
              )}

              <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {booking.room?.name}
              </p>

              {booking.room?.branch && (
                <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                  <MapPin className="w-4 h-4 shrink-0" />
                  {booking.room.branch.name} · {booking.room.branch.address}
                </p>
              )}

              <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                <Calendar className="w-4 h-4 shrink-0" />
                {new Date(booking.checkIn).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
                {' → '}
                {new Date(booking.checkOut).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>

              <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                <Users className="w-4 h-4 shrink-0" />
                {booking.numGuests} khách · {booking.guestName}
              </p>

              <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Tổng cộng</span>
                <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                  {booking.totalAmount.toLocaleString('vi-VN')}₫
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-secondary)' }}>Thanh toán</span>
                <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {booking.paymentMethod === 'vnpay' ? 'VNPay' : 'Tiền mặt'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
