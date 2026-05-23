'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Plus, Search, Edit2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import type { Room } from '@/types';

const STATUS_LABELS = { active: 'Hoạt động', maintenance: 'Bảo trì', inactive: 'Ngừng' };
const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  maintenance: 'bg-yellow-100 text-yellow-700',
  inactive: 'bg-gray-100 text-gray-500',
};

export default function AdminRoomsPage() {
  const { locale } = useParams<{ locale: string }>();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiClient.getRooms({ limit: 50 }).then((r) => setRooms(r.items)).catch(() => {});
  }, []);

  const filtered = rooms.filter(
    (r) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.roomNumber.includes(search),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý phòng</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rooms.length} phòng</p>
        </div>
        <Link href={`/${locale}/admin/rooms/new`}>
          <Button className="gap-2 bg-[#00B4D8] hover:bg-[#0077B6] text-sm">
            <Plus size={15} /> Thêm phòng
          </Button>
        </Link>
      </div>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Tìm theo tên, số phòng..."
          className="pl-8 h-9 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50/50 text-xs text-gray-500 uppercase tracking-wide">
              <th className="px-4 py-3 text-left font-medium">Phòng</th>
              <th className="px-4 py-3 text-left font-medium">Chi nhánh</th>
              <th className="px-4 py-3 text-right font-medium">Giá/giờ</th>
              <th className="px-4 py-3 text-right font-medium">Giá/ngày</th>
              <th className="px-4 py-3 text-center font-medium">Đánh giá</th>
              <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
              <th className="px-4 py-3 text-center font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((room) => {
              const cover = room.images?.find((i) => i.isCover) ?? room.images?.[0];
              return (
                <tr key={room.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {cover ? (
                        <img src={cover.url} alt={room.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{room.name}</p>
                        <p className="text-xs text-gray-400">Phòng {room.roomNumber} • Tầng {room.floor ?? '?'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{room.branch?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {room.pricePerHour.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {room.pricePerDay.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="flex items-center justify-center gap-1 text-xs">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      {Number(room.ratingAvg).toFixed(1)} ({room.ratingCount})
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[room.status]}`}>
                      {STATUS_LABELS[room.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link href={`/${locale}/admin/rooms/${room.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400">
                        <Edit2 size={13} />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
