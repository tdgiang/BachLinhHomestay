'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: { url: string; isCover?: boolean }[];
  alt: string;
  aspectRatio?: '1/1' | '4/3' | '16/9';
  className?: string;
  showCounter?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
}

export function ImageCarousel({
  images,
  alt,
  aspectRatio = '1/1',
  className,
  showCounter = true,
  showArrows = true,
  showDots = true,
}: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (!images.length) return null;

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  const aspectClass = {
    '1/1': 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
  }[aspectRatio];

  return (
    <div
      className={cn('relative overflow-hidden rounded-[var(--radius-card)] group', aspectClass, className)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images */}
      {images.map((img, i) => (
        <div
          key={i}
          className={cn('absolute inset-0 transition-opacity duration-300', i === current ? 'opacity-100' : 'opacity-0 pointer-events-none')}
        >
          <Image
            src={img.url}
            alt={`${alt} ${i + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      {showCounter && images.length > 1 && (
        <div className="absolute bottom-2 right-3 text-white text-xs font-medium bg-black/40 rounded-full px-2 py-0.5">
          {current + 1}/{images.length}
        </div>
      )}

      {/* Arrows */}
      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && images.length > 1 && images.length <= 10 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.preventDefault(); setCurrent(i); }}
              className={cn('w-1.5 h-1.5 rounded-full transition-all', i === current ? 'bg-white w-3' : 'bg-white/60')}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
