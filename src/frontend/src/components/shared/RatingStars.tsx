import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
  className?: string;
}

export function RatingStars({ rating, count, size = 'sm', showCount = true, className }: RatingStarsProps) {
  const starSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <span className={cn('flex items-center gap-1', className)}>
      <Star className={cn(starSize, 'fill-current')} style={{ color: 'var(--color-warning)' }} />
      <span className={cn(textSize, 'font-semibold')} style={{ color: 'var(--color-text-primary)' }}>
        {rating.toFixed(1)}
      </span>
      {showCount && count !== undefined && (
        <span className={cn(textSize)} style={{ color: 'var(--color-text-secondary)' }}>
          ({count})
        </span>
      )}
    </span>
  );
}
