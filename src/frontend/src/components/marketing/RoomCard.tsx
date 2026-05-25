'use client';

import { Heart, Star, Clock, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { ImageCarousel } from '@/components/shared/ImageCarousel';
import type { Room } from '@/types';

function formatVND(price: number) {
  return new Intl.NumberFormat('vi-VN').format(price) + '₫';
}

interface RoomCardProps {
  room: Room;
  className?: string;
}

export function RoomCard({ room, className }: RoomCardProps) {
  const t = useTranslations('room');
  const [liked, setLiked] = useState(false);

  const images = room.images ?? [];

  return (
    <Link
      href={`/rooms/${room.id}`}
      className={cn('group block cursor-pointer', className)}
    >
      {/* Card wrapper — subtle lift on hover */}
      <div
        className="rounded-[20px] overflow-hidden bg-white transition-all duration-350"
        style={{
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-hover)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ borderRadius: '20px 20px 0 0' }}>
          <ImageCarousel
            images={images}
            alt={room.name}
            aspectRatio="4/3"
            showCounter={false}
            showDots={true}
            showArrows={true}
          />

          {/* Heart */}
          <button
            onClick={(e) => { e.preventDefault(); setLiked((v) => !v); }}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer"
            style={{
              background: liked ? 'rgba(192,98,79,0.9)' : 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(6px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
            aria-label="Yêu thích"
          >
            <Heart
              className="w-4 h-4 transition-colors"
              style={{ color: liked ? '#fff' : 'var(--color-text-secondary)', fill: liked ? '#fff' : 'transparent' }}
            />
          </button>

          {/* Guest favorite */}
          {room.isGuestFavorite && (
            <div
              className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(255,255,255,0.90)',
                backdropFilter: 'blur(6px)',
                color: 'var(--color-primary)',
                border: '1px solid rgba(46,111,170,0.25)',
              }}
            >
              {t('guestFavorite')}
            </div>
          )}

          {/* Booking type badges — bottom */}
          <div className="absolute bottom-3 left-3 z-10 flex gap-1.5">
            {room.allowHourly && (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ background: 'rgba(26,74,122,0.88)', color: '#fff', backdropFilter: 'blur(4px)' }}
              >
                <Clock className="w-2.5 h-2.5" />{t('hourly')}
              </span>
            )}
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ background: 'rgba(46,111,170,0.88)', color: '#fff', backdropFilter: 'blur(4px)' }}
            >
              <CalendarDays className="w-2.5 h-2.5" />{t('daily')}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 py-3.5 space-y-2">
          {/* Name + Rating */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className="text-sm font-semibold leading-snug line-clamp-2"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
            >
              {room.name}
            </h3>
            {room.ratingAvg > 0 && (
              <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                <Star className="w-3.5 h-3.5" style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {room.ratingAvg.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Branch */}
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {room.branch?.name ?? ''} · {room.capacity} {t('capacity', { count: room.capacity })}
          </p>

          {/* Divider */}
          <div className="h-px" style={{ background: 'var(--color-border)' }} />

          {/* Price */}
          <div className="flex items-center gap-3 flex-wrap">
            {room.allowHourly && (
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                  {formatVND(room.pricePerHour)}
                </span>
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {t('perHour')}
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
                {formatVND(room.pricePerDay)}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {t('perDay')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
