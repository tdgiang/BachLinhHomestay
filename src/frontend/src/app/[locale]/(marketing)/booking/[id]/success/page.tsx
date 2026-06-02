'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { CheckCircle, MapPin, Calendar, Users, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import type { Booking } from '@/types';
import { use } from 'react';

export default function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations('booking');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiClient.getBooking(id)
      .then((b) => { setBooking(b); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleCopy = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#D1FAE5' }}>
          <CheckCircle className="w-10 h-10" style={{ color: 'var(--color-success)' }} />
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          {t('success')}
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
          Chúng tôi sẽ liên hệ xác nhận sớm nhất
        </p>

        {/* Booking code */}
        <div
          className="rounded-2xl border p-6 mb-6 text-left"
          style={{ borderColor: 'var(--color-border)', background: 'white' }}
        >
          <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-secondary)' }}>
            {t('bookingCode')}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold tracking-widest" style={{ color: 'var(--color-primary)' }}>
              {booking.bookingCode}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Sao chép"
            >
              {copied ? <Check className="w-4 h-4" style={{ color: 'var(--color-success)' }} /> : <Copy className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />}
            </button>
          </div>
        </div>

        {/* Details */}
        <div
          className="rounded-2xl border p-5 mb-6 text-left space-y-3"
          style={{ borderColor: 'var(--color-border)', background: 'white' }}
        >
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            {booking.room?.name}
          </p>
          {booking.room?.branch && (
            <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              <MapPin className="w-4 h-4 shrink-0" />{booking.room.branch.name} · {booking.room.branch.address}
            </p>
          )}
          <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            <Calendar className="w-4 h-4 shrink-0" />
            {checkIn.toLocaleDateString('vi-VN', { dateStyle: 'medium' })} →{' '}
            {checkOut.toLocaleDateString('vi-VN', { dateStyle: 'medium' })}
          </p>
          <p className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
            <Users className="w-4 h-4 shrink-0" />{booking.numGuests} khách
          </p>
          <div className="pt-1 flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Tổng cộng</span>
            <span className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
              {booking.totalAmount.toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>

        {/* Guest suggestion to register */}
        {!booking.userId && (
          <div
            className="rounded-2xl border p-5 mb-6 text-left"
            style={{ borderColor: 'var(--color-border)', background: '#EFF6FF' }}
          >
            <p className="text-sm font-semibold mb-1" style={{ color: '#1D4ED8' }}>
              Lưu lịch sử đặt phòng?
            </p>
            <p className="text-xs mb-3" style={{ color: '#3B82F6' }}>
              Tạo tài khoản để theo dõi đơn và nhận ưu đãi thành viên
            </p>
            <Link href="/register">
              <Button size="sm" className="text-white text-xs" style={{ background: '#2563EB' }}>
                Đăng ký miễn phí
              </Button>
            </Link>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button variant="outline">Về trang chủ</Button>
          </Link>
          <Link href={`/rooms/${booking.roomId}`}>
            <Button className="text-white" style={{ background: 'var(--color-primary)' }}>
              Xem phòng
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
