'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueData } from '@/types';

const MONTH_NAMES = ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12'];

interface RevenueChartProps {
  data: RevenueData[];
  mode: 'yearly' | 'monthly';
}

function formatRevenue(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}tr`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
  return String(value);
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-[#00B4D8] font-semibold">
        {payload[0].value.toLocaleString('vi-VN')}₫
      </p>
    </div>
  );
};

export function RevenueChart({ data, mode }: RevenueChartProps) {
  const chartData = data.map((d) => ({
    name: mode === 'yearly'
      ? (d.month ? MONTH_NAMES[d.month - 1] : String(d.year))
      : (d.date ? d.date.split('-').slice(1).join('/') : ''),
    revenue: d.revenue,
    bookings: d.bookingCount,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#8EA3B3' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatRevenue}
          tick={{ fontSize: 11, fill: '#8EA3B3' }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0f9ff' }} />
        <Bar dataKey="revenue" fill="#00B4D8" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
