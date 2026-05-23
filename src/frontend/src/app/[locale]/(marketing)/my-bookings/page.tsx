import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';
import { MyBookingsList } from '@/components/marketing/MyBookingsList';

type Props = { params: Promise<{ locale: string }> };

export const metadata = { title: 'Lịch sử đặt phòng' };

export default async function MyBookingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session) redirect('/login');

  const result = await apiClient.getMyBookings(session.accessToken);

  return (
    <div className="min-h-screen pt-16" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Lịch sử đặt phòng
        </h1>
        <MyBookingsList initialBookings={result.items} />
      </div>
    </div>
  );
}
