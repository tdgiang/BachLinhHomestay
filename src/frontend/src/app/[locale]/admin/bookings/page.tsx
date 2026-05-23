'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookingsTable } from '@/components/admin/BookingsTable';
import type { Booking } from '@/types';
import { MOCK_BOOKINGS } from '@/lib/mock';

export default function AdminBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // In mock mode, use MOCK_BOOKINGS directly
    setBookings(MOCK_BOOKINGS);
  }, [session]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý đặt phòng</h1>
          <p className="text-sm text-gray-500 mt-0.5">Xem và xử lý tất cả booking</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Download size={14} /> Xuất CSV
        </Button>
      </div>

      <BookingsTable bookings={bookings} />
    </div>
  );
}
