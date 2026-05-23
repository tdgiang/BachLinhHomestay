import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  originalPrice?: number | null;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { price: 'text-sm font-semibold', original: 'text-xs', suffix: 'text-xs' },
  md: { price: 'text-base font-bold', original: 'text-sm', suffix: 'text-sm' },
  lg: { price: 'text-xl font-bold', original: 'text-base', suffix: 'text-base' },
};

export function PriceDisplay({ price, originalPrice, suffix, size = 'md', className }: PriceDisplayProps) {
  const s = sizeMap[size];

  return (
    <span className={cn('flex items-baseline gap-1 flex-wrap', className)}>
      <span className={s.price} style={{ color: 'var(--color-text-primary)' }}>
        {price.toLocaleString('vi-VN')}₫
      </span>
      {originalPrice && originalPrice > price && (
        <span className={cn(s.original, 'line-through')} style={{ color: 'var(--color-text-secondary)' }}>
          {originalPrice.toLocaleString('vi-VN')}₫
        </span>
      )}
      {suffix && (
        <span className={s.suffix} style={{ color: 'var(--color-text-secondary)' }}>
          {suffix}
        </span>
      )}
    </span>
  );
}
