'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    return `${pathname}?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
  );

  return (
    <nav className="flex items-center justify-center gap-1">
      <Link
        href={getPageUrl(Math.max(1, currentPage - 1))}
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center border transition-colors',
          currentPage === 1
            ? 'pointer-events-none opacity-40'
            : 'hover:border-[#00B4D8] hover:text-[#00B4D8]'
        )}
        style={{ borderColor: 'var(--color-border)' }}
      >
        <ChevronLeft className="w-4 h-4" />
      </Link>

      {pages.map((page, i) => {
        const prev = pages[i - 1];
        const showEllipsis = prev && page - prev > 1;
        return (
          <span key={page} className="flex items-center gap-1">
            {showEllipsis && (
              <span className="w-9 h-9 flex items-center justify-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>…</span>
            )}
            <Link
              href={getPageUrl(page)}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium border transition-colors',
                page === currentPage
                  ? 'text-white border-transparent'
                  : 'hover:border-[#00B4D8] hover:text-[#00B4D8]'
              )}
              style={{
                borderColor: page === currentPage ? 'transparent' : 'var(--color-border)',
                background: page === currentPage ? 'var(--color-primary)' : undefined,
                color: page === currentPage ? 'white' : 'var(--color-text-primary)',
              }}
            >
              {page}
            </Link>
          </span>
        );
      })}

      <Link
        href={getPageUrl(Math.min(totalPages, currentPage + 1))}
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center border transition-colors',
          currentPage === totalPages
            ? 'pointer-events-none opacity-40'
            : 'hover:border-[#00B4D8] hover:text-[#00B4D8]'
        )}
        style={{ borderColor: 'var(--color-border)' }}
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </nav>
  );
}
