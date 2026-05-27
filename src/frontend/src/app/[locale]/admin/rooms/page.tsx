'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getSession } from 'next-auth/react';
import {
  Plus, Search, Edit2, Star, Trash2, Loader2, AlertTriangle,
  BedDouble, TrendingUp, Wrench, XCircle, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import type { Branch, Room } from '@/types';

const STATUS_CFG = {
  active:      { label: 'Hoạt động',  cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  maintenance: { label: 'Bảo trì',    cls: 'bg-amber-100   text-amber-700   border-amber-200'   },
  inactive:    { label: 'Ngừng',      cls: 'bg-gray-100    text-gray-500    border-gray-200'     },
} as Record<string, { label: string; cls: string }>;

async function getToken() {
  const s = await getSession();
  return (s as { accessToken?: string })?.accessToken ?? '';
}

export default function AdminRoomsPage() {
  const { locale } = useParams<{ locale: string }>();

  const [rooms, setRooms]       = useState<Room[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [deleteError, setDeleteError]   = useState('');

  useEffect(() => {
    Promise.all([
      apiClient.getRooms({ limit: 100 }),
      apiClient.getBranches(),
    ]).then(([r, b]) => { setRooms(r.items); setBranches(b); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = rooms.filter((r) => {
    if (branchFilter && r.branchId !== branchFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return r.name.toLowerCase().includes(q) || r.roomNumber.includes(q);
  });

  const stats = {
    total:       rooms.length,
    active:      rooms.filter((r) => r.status === 'active').length,
    maintenance: rooms.filter((r) => r.status === 'maintenance').length,
    inactive:    rooms.filter((r) => r.status === 'inactive').length,
  };

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true); setDeleteError('');
    try {
      await apiClient.deleteRoom(deleteTarget.id, await getToken());
      setRooms((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Xóa thất bại.');
    } finally { setDeleting(false); }
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý phòng</h1>
          <p className="text-sm text-gray-500 mt-0.5">Quản lý toàn bộ phòng trong hệ thống</p>
        </div>
        <Link href={`/${locale}/admin/rooms/new`}>
          <Button className="gap-2 bg-[#00B4D8] hover:bg-[#0077B6] shadow-sm">
            <Plus size={16} /> Thêm phòng mới
          </Button>
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Tổng phòng',  value: stats.total,       icon: BedDouble,   color: 'bg-blue-50   text-blue-600'   },
          { label: 'Hoạt động',   value: stats.active,      icon: TrendingUp,  color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Bảo trì',     value: stats.maintenance, icon: Wrench,      color: 'bg-amber-50  text-amber-600'  },
          { label: 'Ngừng hđ',    value: stats.inactive,    icon: XCircle,     color: 'bg-gray-50   text-gray-500'   },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52 max-w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm theo tên, số phòng..."
            className="pl-8 h-9 text-sm bg-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none pl-3 pr-8 h-9 text-sm border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/30 cursor-pointer"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="">Tất cả chi nhánh</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            className="appearance-none pl-3 pr-8 h-9 text-sm border rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/30 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="maintenance">Bảo trì</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        {(search || branchFilter || statusFilter) && (
          <button
            className="text-xs text-gray-400 hover:text-gray-600 underline"
            onClick={() => { setSearch(''); setBranchFilter(''); setStatusFilter(''); }}
          >
            Xóa bộ lọc
          </button>
        )}
        <span className="ml-auto text-sm text-gray-400">{filtered.length} phòng</span>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border">
          <BedDouble size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm text-gray-400">
            {search || branchFilter || statusFilter ? 'Không tìm thấy phòng phù hợp.' : 'Chưa có phòng nào.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-3.5 text-left font-semibold">Phòng</th>
                <th className="px-5 py-3.5 text-left font-semibold">Chi nhánh</th>
                <th className="px-5 py-3.5 text-right font-semibold">Giá/giờ</th>
                <th className="px-5 py-3.5 text-right font-semibold">Giá/ngày</th>
                <th className="px-5 py-3.5 text-center font-semibold">Đánh giá</th>
                <th className="px-5 py-3.5 text-center font-semibold">Trạng thái</th>
                <th className="px-5 py-3.5 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((room) => {
                const cover = room.images?.find((i) => i.isCover) ?? room.images?.[0];
                const cfg = STATUS_CFG[room.status] ?? STATUS_CFG.inactive;
                return (
                  <tr key={room.id} className="hover:bg-gray-50/60 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100 border">
                          {cover
                            ? <img src={cover.url} alt={room.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><BedDouble size={18} className="text-gray-300" /></div>
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 group-hover:text-[#00B4D8] transition-colors">
                            {room.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Phòng {room.roomNumber}{room.floor != null ? ` · Tầng ${room.floor}` : ''} · {room.capacity} người
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-gray-600">{room.branch?.name ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-medium text-gray-800">{room.pricePerHour.toLocaleString('vi-VN')}₫</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-medium text-gray-800">{room.pricePerDay.toLocaleString('vi-VN')}₫</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="font-medium text-gray-700">{Number(room.ratingAvg).toFixed(1)}</span>
                        <span className="text-gray-400 text-xs">({room.ratingCount})</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/${locale}/admin/rooms/${room.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#00B4D8]/10 hover:text-[#00B4D8]">
                            <Edit2 size={14} />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
                          onClick={() => { setDeleteTarget(room); setDeleteError(''); }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Delete dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!deleting && !o) setDeleteTarget(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <AlertTriangle size={18} className="text-red-500" /> Xóa phòng
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-2 text-sm text-gray-600">
            <p>Xóa phòng <span className="font-semibold text-gray-900">"{deleteTarget?.name}"</span>?</p>
            <p className="text-xs text-gray-400">Phòng chỉ có thể xóa khi không có đặt phòng liên kết.</p>
            {deleteError && <p className="text-red-500 bg-red-50 rounded-lg px-3 py-2 text-xs">{deleteError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Hủy</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="min-w-20">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
