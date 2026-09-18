'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Loader2, MessageSquare, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import { ApiError } from '@/lib/api';
import { COMPLAINT_SLA } from '@/lib/legal';
import type {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
} from '@/types';

const STATUS_META: Record<
  ComplaintStatus,
  { label: string; bg: string; fg: string }
> = {
  received: { label: 'Đã tiếp nhận', bg: '#FEF3C7', fg: '#92400E' },
  in_progress: { label: 'Đang xử lý', bg: '#DBEAFE', fg: '#1E40AF' },
  resolved: { label: 'Đã giải quyết', bg: '#DCFCE7', fg: '#166534' },
  rejected: { label: 'Không có cơ sở', bg: '#FEE2E2', fg: '#991B1B' },
};

const CATEGORY_LABEL: Record<ComplaintCategory, string> = {
  booking: 'Đặt phòng',
  payment: 'Thanh toán',
  refund: 'Hoàn tiền',
  service: 'Dịch vụ',
  privacy: 'Dữ liệu cá nhân',
  other: 'Khác',
};

const FILTERS: { value: ComplaintStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'received', label: 'Đã tiếp nhận' },
  { value: 'in_progress', label: 'Đang xử lý' },
  { value: 'resolved', label: 'Đã giải quyết' },
  { value: 'rejected', label: 'Không có cơ sở' },
];

/** Số ngày theo lịch đã trôi qua kể từ khi tiếp nhận. */
function calendarDaysOpen(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);
}

/**
 * Phiếu đã quá thời hạn giải quyết chưa.
 *
 * SLA công bố tính theo NGÀY LÀM VIỆC, còn ở đây chỉ có ngày theo lịch, nên
 * nhân hệ số 1,4 (5 ngày làm việc ≈ 7 ngày lịch) để tránh báo động giả vào
 * cuối tuần. Ngưỡng lấy theo đúng nhóm vấn đề của phiếu, không dùng một con
 * số chung.
 */
function isOverdue(c: Complaint): boolean {
  if (c.status === 'resolved' || c.status === 'rejected') return false;
  const limitCalendarDays = Math.ceil(COMPLAINT_SLA[c.category].resolutionDays * 1.4);
  return calendarDaysOpen(c.createdAt) > limitCalendarDays;
}

function StatusBadge({ status }: { status: ComplaintStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: meta.bg, color: meta.fg }}
    >
      {meta.label}
    </span>
  );
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div
      className={`fixed bottom-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg text-sm text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
      }`}
    >
      {message}
    </div>
  );
}

export default function AdminComplaintsPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string })?.accessToken ?? '';

  const [items, setItems] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<ComplaintStatus | 'all'>('all');
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [response, setResponse] = useState('');
  const [nextStatus, setNextStatus] = useState<ComplaintStatus>('in_progress');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiClient.getAdminComplaints(
        { limit: 100, status: filter === 'all' ? undefined : filter },
        token,
      );
      setItems(res.items);
      setTotal(res.meta.total);
    } catch {
      showToast('Không tải được danh sách khiếu nại', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => {
    reload();
  }, [reload]);

  function openDetail(c: Complaint) {
    setSelected(c);
    setResponse(c.response ?? '');
    setNextStatus(c.status === 'received' ? 'in_progress' : c.status);
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await apiClient.updateComplaint(
        selected.id,
        {
          status: nextStatus,
          response: response.trim() ? response.trim() : undefined,
        },
        token,
      );
      setItems((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)));
      setSelected(null);
      showToast('Đã cập nhật phiếu khiếu nại', 'success');
    } catch (err) {
      // Hiện thông báo thật từ API (ví dụ "response phải từ 10 ký tự"), nếu
      // không admin không biết vì sao lưu hỏng.
      showToast(
        err instanceof ApiError ? err.message : 'Cập nhật thất bại',
        'error',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Phản ánh, khiếu nại
        </h1>
        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {total} phiếu
          {total > items.length && ` (đang hiển thị ${items.length} mới nhất)`}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="px-3.5 py-1.5 rounded-xl text-sm font-medium transition-colors"
            style={
              filter === f.value
                ? { background: 'var(--color-primary)', color: 'white' }
                : {
                    background: 'white',
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border)',
                  }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--color-primary)' }} />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm py-12 text-center" style={{ color: 'var(--color-text-muted)' }}>
          Chưa có phiếu khiếu nại nào.
        </p>
      ) : (
        <div
          className="overflow-x-auto rounded-2xl"
          style={{ background: 'white', border: '1px solid var(--color-border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-surface)' }}>
                {['Mã phiếu', 'Người gửi', 'Nhóm', 'Tiêu đề', 'Ngày gửi', 'Trạng thái', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left font-semibold px-4 py-3 whitespace-nowrap"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const overdue = isOverdue(c);
                return (
                  <tr
                    key={c.id}
                    className="border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{c.code}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {c.fullName}
                      </p>
                      <p className="text-xs">{c.phone}</p>
                    </td>
                    <td
                      className="px-4 py-3 whitespace-nowrap"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {CATEGORY_LABEL[c.category]}
                    </td>
                    <td
                      className="px-4 py-3 max-w-xs truncate"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {c.subject}
                    </td>
                    <td
                      className="px-4 py-3 whitespace-nowrap text-xs"
                      style={{ color: overdue ? '#DC2626' : 'var(--color-text-secondary)' }}
                    >
                      {format(new Date(c.createdAt), 'dd/MM/yyyy', { locale: vi })}
                      {overdue && (
                        <span className="block font-semibold">
                          Quá hạn {COMPLAINT_SLA[c.category].resolutionDays} ngày làm việc
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="outline"
                        className="h-8 px-3 text-xs rounded-lg"
                        style={{ borderColor: 'var(--color-border)' }}
                        onClick={() => openDetail(c)}
                      >
                        Xử lý
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8"
            style={{ background: 'white' }}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="font-mono text-sm" style={{ color: 'var(--color-primary)' }}>
                  {selected.code}
                </p>
                <h2
                  className="text-lg font-bold mt-1"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {selected.subject}
                </h2>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Đóng">
                <X className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>

            <dl
              className="grid sm:grid-cols-2 gap-3 text-sm mb-5 rounded-2xl p-4"
              style={{ background: 'var(--color-surface)' }}
            >
              {[
                ['Người gửi', selected.fullName],
                ['Điện thoại', selected.phone],
                ['Email', selected.email],
                ['Mã đặt phòng', selected.bookingCode || '—'],
                ['Nhóm vấn đề', CATEGORY_LABEL[selected.category]],
                [
                  'Ngày tiếp nhận',
                  format(new Date(selected.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi }),
                ],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {k}
                  </dt>
                  <dd className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {v}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
              Nội dung khách gửi
            </p>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap rounded-2xl p-4 mb-6"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
              }}
            >
              {selected.content}
            </p>

            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Trạng thái
            </label>
            <select
              className="w-full h-9 px-3 rounded-md border text-sm mb-5"
              style={{ borderColor: 'var(--color-border)', background: 'white' }}
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value as ComplaintStatus)}
            >
              {(Object.keys(STATUS_META) as ComplaintStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>

            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Nội dung phản hồi gửi khách hàng
            </label>
            <Textarea
              rows={5}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Tối thiểu 10 ký tự. Nội dung này hiển thị cho khách khi tra cứu bằng mã phiếu."
              style={{ borderColor: 'var(--color-border)' }}
            />

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                className="rounded-xl"
                style={{ borderColor: 'var(--color-border)' }}
                onClick={() => setSelected(null)}
              >
                Hủy
              </Button>
              <Button
                disabled={saving}
                className="rounded-xl gap-2"
                style={{ background: 'var(--color-primary)', color: 'white' }}
                onClick={save}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Lưu phản hồi
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
