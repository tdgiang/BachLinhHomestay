'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  DollarSign, CalendarCheck, BedDouble, BarChart2,
} from 'lucide-react';
import { MetricCard } from '@/components/admin/MetricCard';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { BookingStatusBadge, PaymentStatusBadge } from '@/components/admin/StatusBadge';
import { apiClient } from '@/lib/api-client';
import type { BookingSummary, RevenueData, Booking } from '@/types';
import { MOCK_BOOKINGS } from '@/lib/mock';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

function fmtVND(n: number) {
  return n.toLocaleString('vi-VN') + '₫';
}

function calcTrend(today: number, yesterday: number) {
  if (yesterday === 0) return 0;
  return Math.round(((today - yesterday) / yesterday) * 100);
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string })?.accessToken ?? '';

  const [summary, setSummary] = useState<BookingSummary | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    apiClient.getReportSummary(token).then(setSummary).catch(() => {});
    apiClient.getRevenueYearly(year, token).then(setRevenueData).catch(() => {});
  }, [token, year]);

  const recentBookings: Booking[] = MOCK_BOOKINGS.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Tổng quan hoạt động kinh doanh</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Doanh thu hôm nay"
          value={summary ? fmtVND(summary.todayRevenue) : '—'}
          trend={summary ? calcTrend(summary.todayRevenue, summary.yesterdayRevenue) : undefined}
          sub="so với hôm qua"
          icon={<DollarSign size={20} className="text-blue-500" />}
          iconBg="bg-blue-50"
        />
        <MetricCard
          label="Booking hôm nay"
          value={summary?.todayBookings ?? '—'}
          trend={summary ? calcTrend(summary.todayBookings, summary.yesterdayBookings) : undefined}
          sub="so với hôm qua"
          icon={<CalendarCheck size={20} className="text-green-500" />}
          iconBg="bg-green-50"
        />
        <MetricCard
          label="Đang được thuê"
          value={summary?.checkedIn ?? '—'}
          sub="phòng"
          icon={<BedDouble size={20} className="text-[#00B4D8]" />}
          iconBg="bg-cyan-50"
        />
        <MetricCard
          label="Tỷ lệ lấp đầy"
          value={summary ? `${summary.occupancyRate}%` : '—'}
          icon={<BarChart2 size={20} className="text-purple-500" />}
          iconBg="bg-purple-50"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Doanh thu {year}</h2>
            <p className="text-xs text-gray-400">Theo tháng</p>
          </div>
        </div>
        {revenueData.length > 0 ? (
          <RevenueChart data={revenueData} mode="yearly" />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-300 text-sm">
            Đang tải dữ liệu...
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl border">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Booking gần đây</h2>
          <a href="./bookings" className="text-xs text-[#00B4D8] hover:underline">Xem tất cả →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50 text-xs text-gray-500">
                <th className="px-4 py-3 text-left font-medium">Mã</th>
                <th className="px-4 py-3 text-left font-medium">Khách</th>
                <th className="px-4 py-3 text-left font-medium">Phòng</th>
                <th className="px-4 py-3 text-left font-medium">Check-in</th>
                <th className="px-4 py-3 text-right font-medium">Tổng</th>
                <th className="px-4 py-3 text-center font-medium">TT</th>
                <th className="px-4 py-3 text-center font-medium">Booking</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-[#0077B6] text-xs">{b.bookingCode}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{b.guestName}</p>
                    <p className="text-xs text-gray-400">{b.guestPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-28 truncate text-xs">{b.room?.name ?? b.roomId}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {format(new Date(b.checkIn), 'dd/MM/yy HH:mm', { locale: vi })}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-xs">{b.totalAmount.toLocaleString('vi-VN')}₫</td>
                  <td className="px-4 py-3 text-center"><PaymentStatusBadge status={b.paymentStatus} /></td>
                  <td className="px-4 py-3 text-center"><BookingStatusBadge status={b.bookingStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
