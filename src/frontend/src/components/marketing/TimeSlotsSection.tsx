'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DatePickerField,
  dateToIsoDate,
  startOfToday,
} from '@/components/shared/DatePickerField';
import { PriceDisplay } from '@/components/shared/PriceDisplay';
import { apiClient } from '@/lib/api-client';
import type { TimeSlotSuggestion } from '@/types';

interface TimeSlotsSectionProps {
  roomId: string;
}

export function TimeSlotsSection({ roomId }: TimeSlotsSectionProps) {
  const t = useTranslations('room');
  const router = useRouter();

  const today = startOfToday();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const date = dateToIsoDate(selectedDate);
  const [slots, setSlots] = useState<TimeSlotSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiClient.getTimeSlots(roomId, date).then((data) => {
      setSlots(data);
      setLoading(false);
    });
  }, [roomId, date]);

  const handleBook = (slot: TimeSlotSuggestion) => {
    const params = new URLSearchParams({
      type: 'hourly',
      checkIn: `${date}T${slot.startTime}:00`,
      checkOut: `${date}T${slot.endTime}:00`,
    });
    router.push(`/booking/${roomId}?${params.toString()}`);
  };

  if (!loading && slots.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {t('timeSlots')}
        </h2>
        <DatePickerField
          variant="field"
          className="w-[160px]"
          value={selectedDate}
          onChange={(d) => d && setSelectedDate(d)}
          minDate={today}
        />
      </div>

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))
          : slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-4 rounded-xl border"
                style={{ borderColor: 'var(--color-border)', background: 'white' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: '#E6F4FB' }}
                  >
                    <Clock className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {slot.label}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {slot.startTime} – {slot.endTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {slot.priceOverride && (
                    <PriceDisplay
                      price={slot.priceOverride}
                      originalPrice={slot.priceOriginal}
                      size="sm"
                    />
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleBook(slot)}
                    className="text-white gap-1"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {t('bookNow')} <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
