'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api-client';
import type { Review } from '@/types';

interface ReviewsSectionProps {
  roomId: string;
  initialReviews: Review[];
  initialTotal: number;
}

export function ReviewsSection({ roomId, initialReviews, initialTotal }: ReviewsSectionProps) {
  const t = useTranslations('room');
  const tc = useTranslations('common');
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState(initialReviews);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  const loadPage = async (p: number) => {
    setLoading(true);
    try {
      const res = await apiClient.getReviews(roomId, p);
      setReviews(res.items);
      setTotal(res.meta.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
        {t('reviews')} · {total}
      </h2>

      {reviews.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {t('noReviews')}
        </p>
      ) : (
        <>
          <div className="space-y-4">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))
              : reviews.map((r) => <ReviewItem key={r.id} review={r} />)}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 mt-6 justify-center">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => loadPage(p)}
                  className="w-8 h-8 rounded-lg text-sm font-medium transition-colors border"
                  style={{
                    background: p === page ? 'var(--color-primary)' : 'white',
                    color: p === page ? 'white' : 'var(--color-text-primary)',
                    borderColor: p === page ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const initials = review.user?.fullName?.charAt(0)?.toUpperCase() ?? '?';
  const date = new Date(review.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <div className="py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex items-start gap-3 mb-2">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: 'var(--color-primary)' }}
        >
          {initials}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {review.user?.fullName ?? 'Khách'}
          </p>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {date}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="w-3 h-3"
              style={{ color: i < review.rating ? 'var(--color-warning)' : '#E5E7EB', fill: i < review.rating ? 'var(--color-warning)' : '#E5E7EB' }}
            />
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
          {review.comment}
        </p>
      )}
    </div>
  );
}
