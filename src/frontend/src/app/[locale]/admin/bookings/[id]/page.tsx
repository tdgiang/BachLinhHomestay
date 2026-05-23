'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Check, ArrowRightLeft, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/admin/StatusBadge';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Booking } from '@/types';

function fmtDate(iso: string) {
  return format(new Date(iso), 'dd/MM/yyyy HH:mm', { locale: vi });
}

function fmtVND(n: number) {
  return n.toLocaleString('vi-VN') + '₫';
}

export default function BookingDetailPage() {
  const { id, locale } = useParams<{ id: string; locale: string }>();
  const { data: session } = useSession();
  const token = (session as { accessToken?: string })?.accessToken ?? '';
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    apiClient.getBooking(id, token).then(setBooking).catch(() => {});
  }, [id, token]);

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/admin/bookings`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            {booking.bookingCode}
            <BookingStatusBadge status={booking.bookingStatus} />
          </h1>
          <p className="text-sm text-gray-400">Tạo lúc {fmtDate(booking.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Thông tin phòng */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Thông tin phòng</h2>
          <div className="space-y-2 text-sm">
            <Row label="Phòng" value={booking.room?.name ?? booking.roomId} />
            <Row label="Chi nhánh" value={booking.room?.branch?.name ?? '—'} />
            <Row label="Loại" value={booking.bookingType === 'hourly' ? 'Theo giờ' : 'Theo ngày'} />
            <Row label="Check-in" value={fmtDate(booking.checkIn)} />
            <Row label="Check-out" value={fmtDate(booking.checkOut)} />
            {booking.numHours && <Row label="Số giờ" value={`${booking.numHours} giờ`} />}
            <Row label="Số khách" value={String(booking.numGuests)} />
          </div>
        </div>

        {/* Thông tin khách */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Thông tin khách</h2>
          <div className="space-y-2 text-sm">
            <Row label="Họ tên" value={booking.guestName} />
            <Row label="SĐT" value={booking.guestPhone} />
            <Row label="Email" value={booking.guestEmail ?? '—'} />
            {booking.guestNote && <Row label="Ghi chú" value={booking.guestNote} />}
          </div>
        </div>

        {/* Thanh toán */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Thanh toán</h2>
          <div className="space-y-2 text-sm">
            <Row label="Giá phòng" value={fmtVND(booking.baseAmount)} />
            {booking.discountAmount > 0 && <Row label="Giảm giá" value={`-${fmtVND(booking.discountAmount)}`} />}
            {booking.extraAmount > 0 && <Row label="Phụ phí" value={`+${fmtVND(booking.extraAmount)}`} />}
            <div className="border-t pt-2 mt-2">
              <Row label="Tổng cộng" value={<span className="font-bold text-base">{fmtVND(booking.totalAmount)}</span>} />
            </div>
            <Row label="Phương thức" value={booking.paymentMethod === 'vnpay' ? 'VNPay' : 'Tiền mặt'} />
            <Row label="TT thanh toán" value={<PaymentStatusBadge status={booking.paymentStatus} />} />
            {booking.voucherCode && <Row label="Voucher" value={booking.voucherCode} />}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Thao tác</h2>
          <div className="space-y-2">
            {booking.bookingStatus === 'pending' && (
              <Button className="w-full gap-2 bg-blue-500 hover:bg-blue-600">
                <Check size={15} /> Xác nhận booking
              </Button>
            )}
            {booking.bookingStatus === 'confirmed' && (
              <Button className="w-full gap-2 bg-green-500 hover:bg-green-600">
                <ArrowRightLeft size={15} /> Check-in
              </Button>
            )}
            {booking.bookingStatus === 'checked_in' && (
              <Button className="w-full gap-2" variant="outline">
                <ArrowRightLeft size={15} /> Check-out
              </Button>
            )}
            {['pending', 'confirmed'].includes(booking.bookingStatus) && (
              <Button className="w-full gap-2" variant="outline">
                <XCircle size={15} className="text-red-500" />
                <span className="text-red-500">Hủy booking</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500 shrink-0">{label}:</span>
      <span className="text-gray-800 text-right">{value}</span>
    </div>
  );
}
