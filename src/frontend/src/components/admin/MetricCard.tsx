import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  icon: React.ReactNode;
  iconBg?: string;
}

export function MetricCard({ label, value, sub, trend, icon, iconBg = 'bg-blue-50' }: MetricCardProps) {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <div className="bg-white rounded-xl border p-5 flex items-start gap-4">
      <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
        {(sub || trend !== undefined) && (
          <div className="flex items-center gap-1 mt-1">
            {trend !== undefined && (
              <>
                {trendPositive && <TrendingUp size={12} className="text-green-500" />}
                {trendNegative && <TrendingDown size={12} className="text-red-500" />}
                {!trendPositive && !trendNegative && <Minus size={12} className="text-gray-400" />}
                <span className={cn('text-xs font-medium',
                  trendPositive ? 'text-green-600' : trendNegative ? 'text-red-500' : 'text-gray-400',
                )}>
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              </>
            )}
            {sub && <span className="text-xs text-gray-400">{sub}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
