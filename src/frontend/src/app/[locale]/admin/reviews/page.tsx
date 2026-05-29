'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Star, Eye, EyeOff, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { apiClient } from '@/lib/api-client';
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

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg text-sm text-white ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      {message}
    </div>
  );
}

export default function AdminReviewsPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string })?.accessToken ?? '';

  const [reviews, setReviews] = useState<(Review & { roomName?: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiClient.getAdminReviews({ limit: 100 }, token);
      setReviews(res.items);
    } catch {
      showToast('Không tải được danh sách đánh giá', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { reload(); }, [reload]);

  const filtered = reviews.filter((r) => {
    if (filter === 'visible') return r.isVisible;
    if (filter === 'hidden') return !r.isVisible;
    return true;
  });

  async function handleToggle(r: Review) {
    setTogglingId(r.id);
    try {
      await apiClient.setReviewVisibility(r.id, !r.isVisible, token);
      setReviews((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, isVisible: !r.isVisible } : x)),
      );
      showToast(r.isVisible ? 'Đã ẩn đánh giá' : 'Đã hiển thị đánh giá', 'success');
    } catch {
      showToast('Cập nhật thất bại', 'error');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiClient.deleteReview(deleteId, token);
      setReviews((prev) => prev.filter((x) => x.id !== deleteId));
      setDeleteId(null);
      showToast('Đã xóa đánh giá', 'success');
    } catch {
      showToast('Xóa thất bại', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} />}

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
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <Loader2 size={20} className="animate-spin text-gray-300 mx-auto" />
                </td>
              </tr>
            )}
            {!loading && filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800 max-w-32 truncate">
                  {r.room?.name ?? r.roomId}
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
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-600"
                      onClick={() => setDeleteId(r.id)}
                    >
                      <Trash2 size={13} />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-7 w-7 text-gray-400 hover:text-gray-600"
                      onClick={() => handleToggle(r)}
                      disabled={togglingId === r.id}
                    >
                      {togglingId === r.id
                        ? <Loader2 size={13} className="animate-spin" />
                        : r.isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                  Không có đánh giá nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-semibold text-gray-900 mb-1">Xóa đánh giá?</h3>
            <p className="text-sm text-gray-500 mb-5">Đánh giá sẽ bị xóa vĩnh viễn.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setDeleteId(null)} disabled={deleting}>
                Giữ lại
              </Button>
              <Button
                size="sm"
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <Loader2 size={13} className="animate-spin" /> : 'Xác nhận xóa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
