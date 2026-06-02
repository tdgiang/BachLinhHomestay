'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Search, Filter, MoreHorizontal, Check, ArrowRightLeft, XCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { BookingStatusBadge, PaymentStatusBadge } from './StatusBadge';
import { apiClient } from '@/lib/api-client';
import type { Booking, BookingStatus } from '@/types';

interface Meta { total: number; page: number; limit: number; totalPages: number }

interface BookingsTableProps {
  bookings: Booking[];
  loading?: boolean;
  meta?: Meta;
  page?: number;
  statusFilter?: string;
  onPageChange?: (p: number) => void;
  onStatusChange?: (s: string) => void;
  onStatusUpdate?: () => void;
  token?: string;
}

const STATUS_OPTIONS = [
  { value: 'all',        label: 'Tất cả trạng thái' },
  { value: 'pending',    label: 'Chờ xác nhận' },
  { value: 'confirmed',  label: 'Đã xác nhận' },
  { value: 'checked_in', label: 'Đang ở' },
  { value: 'completed',  label: 'Hoàn thành' },
  { value: 'cancelled',  label: 'Đã hủy' },
];

function fmtDate(iso: string) {
  return format(new Date(iso), 'dd/MM/yy HH:mm', { locale: vi });
}
function fmtVND(n: number) {
  return n.toLocaleString('vi-VN') + '₫';
}

export function BookingsTable({
  bookings, loading, meta, page = 1, statusFilter = 'all',
  onPageChange, onStatusChange, onStatusUpdate, token = '',
}: BookingsTableProps) {
  const { locale } = useParams<{ locale: string }>();
  const [search, setSearch]     = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const filtered = search
    ? bookings.filter((b) =>
        b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
        b.guestName.toLowerCase().includes(search.toLowerCase()) ||
        b.guestPhone.includes(search),
      )
    : bookings;

  const handleAction = async (id: string, action: 'confirm' | 'checkin' | 'checkout') => {
    const statusMap = { confirm: 'confirmed', checkin: 'checked_in', checkout: 'completed' } as const;
    setActionId(id);
    try {
      await apiClient.updateBookingStatus(id, statusMap[action], token);
      onStatusUpdate?.();
    } catch { /* ignore */ } finally {
      setActionId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    setActionId(cancelId);
    try {
      await apiClient.cancelBooking(cancelId, cancelReason || 'Admin hủy', token);
      setCancelId(null);
      setCancelReason('');
      onStatusUpdate?.();
    } catch { /* ignore */ } finally {
      setActionId(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border">
        {/* Filter bar */}
        <div className="p-4 border-b flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Mã booking, tên khách, SĐT..."
              className="pl-8 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => onStatusChange?.(v ?? 'all')}>
            <SelectTrigger className="w-44 h-9 text-sm">
              <Filter size={13} className="mr-1.5 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-400 ml-auto">
            {meta ? `${meta.total} booking` : `${filtered.length} kết quả`}
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-medium">Mã booking</th>
                <th className="px-4 py-3 text-left font-medium">Khách</th>
                <th className="px-4 py-3 text-left font-medium">Phòng</th>
                <th className="px-4 py-3 text-left font-medium">Check-in</th>
                <th className="px-4 py-3 text-left font-medium">Check-out</th>
                <th className="px-4 py-3 text-right font-medium">Tổng</th>
                <th className="px-4 py-3 text-center font-medium">Thanh toán</th>
                <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-center font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <Loader2 size={20} className="animate-spin text-gray-300 mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                    Không tìm thấy booking nào
                  </td>
                </tr>
              )}
              {!loading && filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <Link
                      href={`/${locale}/admin/bookings/${b.id}`}
                      className="font-mono font-medium text-[#0077B6] hover:underline"
                    >
                      {b.bookingCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{b.guestName}</p>
                    <p className="text-xs text-gray-400">{b.guestPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-32 truncate">
                    {b.room?.name ?? b.roomId}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(b.checkIn)}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmtDate(b.checkOut)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtVND(b.totalAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <PaymentStatusBadge status={b.paymentStatus} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <BookingStatusBadge status={b.bookingStatus as BookingStatus} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-gray-100 transition-colors">
                        {actionId === b.id
                          ? <Loader2 size={14} className="animate-spin text-gray-400" />
                          : <MoreHorizontal size={14} className="text-gray-500" />}
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem render={<Link href={`/${locale}/admin/bookings/${b.id}`} className="flex items-center gap-2 text-gray-600" />}>
                          Chi tiết
                        </DropdownMenuItem>
                        {b.bookingStatus === 'pending' && (
                          <DropdownMenuItem
                            className="gap-2 text-blue-600"
                            onClick={() => handleAction(b.id, 'confirm')}
                          >
                            <Check size={13} /> Xác nhận
                          </DropdownMenuItem>
                        )}
                        {b.bookingStatus === 'confirmed' && (
                          <DropdownMenuItem
                            className="gap-2 text-green-600"
                            onClick={() => handleAction(b.id, 'checkin')}
                          >
                            <ArrowRightLeft size={13} /> Check-in
                          </DropdownMenuItem>
                        )}
                        {b.bookingStatus === 'checked_in' && (
                          <DropdownMenuItem
                            className="gap-2 text-gray-600"
                            onClick={() => handleAction(b.id, 'checkout')}
                          >
                            <ArrowRightLeft size={13} /> Check-out
                          </DropdownMenuItem>
                        )}
                        {['pending', 'confirmed'].includes(b.bookingStatus) && (
                          <DropdownMenuItem
                            className="gap-2 text-red-500"
                            onClick={() => { setCancelId(b.id); setCancelReason(''); }}
                          >
                            <XCircle size={13} /> Hủy booking
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm text-gray-500">
            <span>Trang {meta.page} / {meta.totalPages}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="icon"
                className="h-7 w-7"
                disabled={page <= 1}
                onClick={() => onPageChange?.(page - 1)}
              >
                <ChevronLeft size={13} />
              </Button>
              <Button
                variant="outline" size="icon"
                className="h-7 w-7"
                disabled={page >= meta.totalPages}
                onClick={() => onPageChange?.(page + 1)}
              >
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel dialog */}
      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-semibold text-gray-900 mb-1">Hủy booking?</h3>
            <p className="text-sm text-gray-500 mb-4">Hành động này không thể hoàn tác.</p>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
              rows={3}
              placeholder="Lý do hủy (tùy chọn)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setCancelId(null)}>
                Giữ lại
              </Button>
              <Button
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleCancel}
                disabled={!!actionId}
              >
                {actionId ? <Loader2 size={13} className="animate-spin" /> : 'Xác nhận hủy'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
