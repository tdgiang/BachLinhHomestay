import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { BookingForm } from '@/components/marketing/BookingForm';
import { apiClient } from '@/lib/api-client';

type Props = {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ type?: string; checkIn?: string; checkOut?: string; numHours?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const room = await apiClient.getRoom(id);
    return { title: `Đặt phòng — ${room.name}` };
  } catch {
    return { title: 'Đặt phòng' };
  }
}

export default async function BookingPage({ params, searchParams }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const sp = await searchParams;

  const room = await apiClient.getRoom(id).catch(() => null);
  if (!room) notFound();

  return (
    <div className="min-h-screen pt-16" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <BookingForm
          room={room}
          defaultType={(sp.type as 'hourly' | 'daily') ?? 'hourly'}
          defaultCheckIn={sp.checkIn}
          defaultCheckOut={sp.checkOut}
          defaultNumHours={sp.numHours ? Number(sp.numHours) : undefined}
        />
      </div>
    </div>
  );
}
