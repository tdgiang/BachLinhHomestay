'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { MetricCard } from '@/components/admin/MetricCard';
import { apiClient } from '@/lib/api-client';
import type { RevenueData } from '@/types';
import { DollarSign, CalendarCheck, TrendingUp } from 'lucide-react';

type Tab = 'yearly' | 'monthly';

const MONTHS = ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12'];

export default function AdminReportsPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string })?.accessToken ?? '';

  const [tab, setTab] = useState<Tab>('yearly');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState<RevenueData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const fetch = tab === 'yearly'
      ? apiClient.getRevenueYearly(year, token)
      : apiClient.getRevenueMonthly(year, month, token);

    fetch.then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [tab, year, month, token]);

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalBookings = data.reduce((s, d) => s + d.bookingCount, 0);
  const avgPerBooking = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Báo cáo doanh thu</h1>
        <p className="text-sm text-gray-500 mt-0.5">Phân tích theo thời gian</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Tổng doanh thu"
          value={totalRevenue.toLocaleString('vi-VN') + '₫'}
          icon={<DollarSign size={20} className="text-blue-500" />}
          iconBg="bg-blue-50"
        />
        <MetricCard
          label="Tổng booking"
          value={totalBookings}
          icon={<CalendarCheck size={20} className="text-green-500" />}
          iconBg="bg-green-50"
        />
        <MetricCard
          label="TB/booking"
          value={avgPerBooking.toLocaleString('vi-VN') + '₫'}
          icon={<TrendingUp size={20} className="text-purple-500" />}
          iconBg="bg-purple-50"
        />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border p-5">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['yearly', 'monthly'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                }`}
              >
                {t === 'yearly' ? 'Theo năm' : 'Theo tháng'}
              </button>
            ))}
          </div>

          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-sm border rounded-lg px-3 py-1.5 bg-white"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {tab === 'monthly' && (
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="text-sm border rounded-lg px-3 py-1.5 bg-white"
            >
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-300 text-sm">
            Đang tải...
          </div>
        ) : data.length > 0 ? (
          <RevenueChart data={data} mode={tab} />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-300 text-sm">
            Không có dữ liệu
          </div>
        )}
      </div>

      {/* Detail table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900 text-sm">Chi tiết</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50 text-xs text-gray-500 uppercase">
                <th className="px-4 py-3 text-left font-medium">Kỳ</th>
                <th className="px-4 py-3 text-right font-medium">Doanh thu</th>
                <th className="px-4 py-3 text-right font-medium">Booking</th>
                <th className="px-4 py-3 text-right font-medium">TB/booking</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((d, i) => {
                const label = tab === 'yearly'
                  ? MONTHS[(d.month ?? 1) - 1]
                  : (d.date ?? '');
                const avg = d.bookingCount > 0 ? Math.round(d.revenue / d.bookingCount) : 0;
                return (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 font-medium text-gray-700">{label}</td>
                    <td className="px-4 py-2.5 text-right text-gray-800">{d.revenue.toLocaleString('vi-VN')}₫</td>
                    <td className="px-4 py-2.5 text-right text-gray-600">{d.bookingCount}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500">{avg.toLocaleString('vi-VN')}₫</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
