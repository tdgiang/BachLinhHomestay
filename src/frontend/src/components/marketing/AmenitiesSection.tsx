'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { RoomAmenity } from '@/types';
import * as LucideIcons from 'lucide-react';

function AmenityIcon({ name, className }: { name: string | null; className?: string }) {
  if (!name) return <LucideIcons.CheckCircle className={className} />;
  const iconName = name.charAt(0).toUpperCase() + name.slice(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[iconName] as React.ComponentType<{ className?: string }> | undefined;
  if (!Icon) return <LucideIcons.CheckCircle className={className} />;
  return <Icon className={className} />;
}

interface AmenitiesSectionProps {
  amenities: RoomAmenity[];
}

export function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  const t = useTranslations('room');
  const [open, setOpen] = useState(false);

  const featured = amenities.slice(0, 6);
  const remaining = amenities.length - featured.length;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
        {t('amenities')}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {featured.map((a) => (
          <AmenityRow key={a.id} amenity={a} t={t} />
        ))}
      </div>

      {remaining > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="mt-4 text-sm font-medium underline hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {t('showMore', { count: remaining })}
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('amenities')}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-2 mt-4">
            {amenities.map((a) => (
              <AmenityRow key={a.id} amenity={a} t={t} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AmenityRow({ amenity, t }: { amenity: RoomAmenity; t: ReturnType<typeof useTranslations<'room'>> }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
      <AmenityIcon
        name={amenity.amenity?.icon ?? null}
        className="w-5 h-5 shrink-0"
        // @ts-ignore
        style={{ color: 'var(--color-primary)' }}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
          {amenity.amenity?.name ?? ''}
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {amenity.isFree ? t('free') : `${amenity.price?.toLocaleString('vi-VN')}₫`}
        </p>
      </div>
    </div>
  );
}
