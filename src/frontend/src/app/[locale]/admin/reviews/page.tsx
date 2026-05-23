'use client';

import { useEffect, useState } from 'react';
import { Star, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MOCK_REVIEWS, MOCK_ROOMS } from '@/lib/mock';
import type { Review } from '@/types';

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
        />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<(Review & { roomName?: string })[]>([]);
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  useEffect(() => {
    const withRoom = MOCK_REVIEWS.map((r) => ({
      ...r,
      roomName: MOCK_ROOMS.find((room) => room.id === r.roomId)?.name ?? r.roomId,
    }));
    setReviews(withRoom);
  }, []);

  const filtered = reviews.filter((r) => {
    if (filter === 'visible') return r.isVisible;
    if (filter === 'hidden') return !r.isVisible;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý đánh giá</h1>
          <p className="text-sm text-gray-500 mt-0.5">{reviews.length} đánh giá</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['all', 'visible', 'hidden'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === f ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              {f === 'all' ? 'Tất cả' : f === 'visible' ? 'Hiển thị' : 'Ẩn'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50/50 text-xs text-gray-500 uppercase">
              <th className="px-4 py-3 text-left font-medium">Phòng</th>
              <th className="px-4 py-3 text-center font-medium">Điểm</th>
              <th className="px-4 py-3 text-left font-medium">Nội dung</th>
              <th className="px-4 py-3 text-left font-medium">Thời gian</th>
              <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800 max-w-32 truncate">
                  {r.roomName}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-0.5">
                    <StarRow rating={r.rating} />
                    <span className="text-xs text-gray-500">{r.rating}/5</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs">
                  {r.comment ? (
                    <p className="truncate">{r.comment}</p>
                  ) : (
                    <span className="text-gray-300 italic text-xs">Không có nhận xét</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">
                  {format(new Date(r.createdAt), 'dd/MM/yyyy', { locale: vi })}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.isVisible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {r.isVisible ? 'Hiển thị' : 'Đã ẩn'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400">
                    {r.isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                  Không có đánh giá nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
