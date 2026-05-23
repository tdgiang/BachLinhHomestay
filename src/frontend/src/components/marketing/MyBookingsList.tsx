'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { MapPin, Calendar, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { Booking } from '@/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: 'Chờ xác nhận', color: '#F59E0B', bg: '#FEF3C7' },
  confirmed:  { label: 'Đã xác nhận',  color: '#2563EB', bg: '#DBEAFE' },
  checked_in: { label: 'Đang ở',        color: '#10B981', bg: '#D1FAE5' },
  completed:  { label: 'Hoàn thành',   color: '#6B7280', bg: '#F3F4F6' },
  cancelled:  { label: 'Đã hủy',       color: '#EF4444', bg: '#FEE2E2' },
};

interface Props { initialBookings: Booking[] }

export function MyBookingsList({ initialBookings }: Props) {
  const t = useTranslations('booking');
  const [bookings, setBookings] = useState(initialBookings);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const canCancel = (b: Booking) =>
    b.bookingStatus === 'pending' || b.bookingStatus === 'confirmed';

  const handleCancel = async () => {
    if (!cancelId || !cancelReason.trim()) return;
    setCancelling(true);
    try {
      const updated = await apiClient.cancelBooking(cancelId, cancelReason.trim(), '');
      setBookings((prev) => prev.map((b) => (b.id === cancelId ? updated : b)));
      setCancelId(null);
      setCancelReason('');
    } finally {
      setCancelling(false);
    }
  };

  if (!bookings.length) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Chưa có đặt phòng nào
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          Khám phá các phòng ngay nào!
        </p>
        <Link href="/rooms">
          <Button className="text-white" style={{ background: 'var(--color-primary)' }}>
            Tìm phòng
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => {
          const cfg = STATUS_CONFIG[booking.bookingStatus] ?? STATUS_CONFIG.pending;
          return (
            <div
              key={booking.id}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: 'var(--color-border)', background: 'white' }}
            >
              {/* Status bar */}
              <div className="px-4 py-2 flex justify-between items-center" style={{ background: cfg.bg }}>
                <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                <span className="text-xs font-mono font-bold" style={{ color: cfg.color }}>{booking.bookingCode}</span>
              </div>

              <div className="p-4 flex gap-3">
                {booking.room?.images?.[0] && (
                  <img
                    src={booking.room.images[0].url}
                    alt={booking.room.name ?? ''}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {booking.room?.name}
                  </p>
                  {booking.room?.branch && (
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                      <MapPin className="w-3 h-3" />{booking.room.branch.name}
                    </p>
                  )}
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                    <Calendar className="w-3 h-3" />
                    {new Date(booking.checkIn).toLocaleDateString('vi-VN', { dateStyle: 'medium' })}
                  </p>
                  <p className="font-semibold text-sm mt-2" style={{ color: 'var(--color-text-primary)' }}>
                    {booking.totalAmount.toLocaleString('vi-VN')}₫
                  </p>
                </div>

                <div className="flex flex-col gap-2 items-end shrink-0">
                  <Link href={`/my-bookings/${booking.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs gap-1 px-2">
                      Chi tiết <ChevronRight className="w-3 h-3" />
                    </Button>
                  </Link>
                  {canCancel(booking) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs px-2"
                      style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                      onClick={() => setCancelId(booking.id)}
                    >
                      Hủy
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cancel dialog */}
      <Dialog open={!!cancelId} onOpenChange={(o) => { if (!o) { setCancelId(null); setCancelReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cancelBooking')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label>{t('cancelReason')}</Label>
              <Input
                placeholder="Lý do hủy phòng..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setCancelId(null); setCancelReason(''); }}>
                {t('paymentStatus.pending')}
              </Button>
              <Button
                disabled={!cancelReason.trim() || cancelling}
                onClick={handleCancel}
                className="text-white"
                style={{ background: 'var(--color-danger)' }}
              >
                {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xác nhận hủy'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
