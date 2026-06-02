'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import { BookingsTable } from '@/components/admin/BookingsTable';
import type { Booking, PaginatedResult } from '@/types';

const LIMIT = 20;

export default function AdminBookingsPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string })?.accessToken ?? '';

  const [result, setResult]       = useState<PaginatedResult<Booking> | null>(null);
  const [page, setPage]           = useState(1);
  const [statusFilter, setStatus] = useState('all');
  const [loading, setLoading]     = useState(false);

  const load = useCallback(async (p: number, status: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiClient.getAdminBookings(
        { page: p, limit: LIMIT, bookingStatus: status },
        token,
      );
      setResult(data);
    } catch {
      /* handle silently — table shows empty state */
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(page, statusFilter); }, [load, page, statusFilter]);

  const handleStatusChange = (s: string) => { setStatus(s); setPage(1); };
  const handleStatusUpdate = () => load(page, statusFilter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý đặt phòng</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {result ? `${result.meta.total} booking` : 'Đang tải...'}
          </p>
        </div>
      </div>

      <BookingsTable
        bookings={result?.items ?? []}
        loading={loading}
        meta={result?.meta}
        page={page}
        statusFilter={statusFilter}
        onPageChange={setPage}
        onStatusChange={handleStatusChange}
        onStatusUpdate={handleStatusUpdate}
        token={token}
      />
    </div>
  );
}
