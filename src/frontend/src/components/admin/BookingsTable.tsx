'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Search, Filter, MoreHorizontal, Check, ArrowRightLeft, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { BookingStatusBadge, PaymentStatusBadge } from './StatusBadge';
import type { Booking, BookingStatus } from '@/types';

interface BookingsTableProps {
  bookings: Booking[];
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
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

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = bookings.filter((b) => {
    const matchSearch =
      !search ||
      b.bookingCode.toLowerCase().includes(search.toLowerCase()) ||
      b.guestName.toLowerCase().includes(search.toLowerCase()) ||
      b.guestPhone.includes(search);
    const matchStatus = statusFilter === 'all' || b.bookingStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
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
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
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
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} kết quả</span>
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                  Không tìm thấy booking nào
                </td>
              </tr>
            )}
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-mono font-medium text-[#0077B6]">{b.bookingCode}</span>
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
                      <MoreHorizontal size={14} className="text-gray-500" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {b.bookingStatus === 'pending' && (
                        <DropdownMenuItem className="gap-2 text-blue-600">
                          <Check size={13} /> Xác nhận
                        </DropdownMenuItem>
                      )}
                      {b.bookingStatus === 'confirmed' && (
                        <DropdownMenuItem className="gap-2 text-green-600">
                          <ArrowRightLeft size={13} /> Check-in
                        </DropdownMenuItem>
                      )}
                      {b.bookingStatus === 'checked_in' && (
                        <DropdownMenuItem className="gap-2 text-gray-600">
                          <ArrowRightLeft size={13} /> Check-out
                        </DropdownMenuItem>
                      )}
                      {['pending','confirmed'].includes(b.bookingStatus) && (
                        <DropdownMenuItem className="gap-2 text-red-500">
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
    </div>
  );
}
