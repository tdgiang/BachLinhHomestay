'use client';

import { useEffect, useState } from 'react';
import { Plus, MapPin, Phone, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';
import type { Branch } from '@/types';

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    apiClient.getBranches().then(setBranches).catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý chi nhánh</h1>
          <p className="text-sm text-gray-500 mt-0.5">{branches.length} chi nhánh</p>
        </div>
        <Button className="gap-2 bg-[#00B4D8] hover:bg-[#0077B6] text-sm">
          <Plus size={15} /> Thêm chi nhánh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <div key={branch.id} className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                <MapPin size={18} className="text-[#00B4D8]" />
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400">
                  <Edit2 size={13} />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400">
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">{branch.name}</h3>
            {branch.nameEn && <p className="text-xs text-gray-400 mt-0.5">{branch.nameEn}</p>}
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
              <MapPin size={12} className="shrink-0" />
              {branch.address}, {branch.city}
            </p>
            {branch.phone && (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                <Phone size={12} className="shrink-0" />
                {branch.phone}
              </p>
            )}
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                branch.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {branch.isActive ? 'Đang hoạt động' : 'Tạm ngừng'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
