'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSession } from 'next-auth/react';
import {
  Plus, Pencil, Trash2, X, Loader2, CheckCircle, Search, Package,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api-client';
import type { Amenity, AmenityCategory } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<AmenityCategory, string> = {
  basic: 'Cơ bản',
  entertainment: 'Giải trí',
  convenience: 'Tiện lợi',
  safety: 'An toàn',
};

const CATEGORY_CONFIG: Record<AmenityCategory, { color: string; bg: string; dot: string }> = {
  basic:         { color: 'text-blue-700',   bg: 'bg-blue-50',   dot: 'bg-blue-400' },
  entertainment: { color: 'text-violet-700', bg: 'bg-violet-50', dot: 'bg-violet-400' },
  convenience:   { color: 'text-amber-700',  bg: 'bg-amber-50',  dot: 'bg-amber-400' },
  safety:        { color: 'text-emerald-700',bg: 'bg-emerald-50',dot: 'bg-emerald-400' },
};

const SUGGESTED_ICONS = [
  'Wifi','Tv','Wind','Car','Coffee','Utensils','Dumbbell','Waves',
  'Shield','Camera','Key','Lock','Bath','Refrigerator','Microwave',
  'WashingMachine','Sparkles','Package','CheckCircle2','Music',
  'Projector','Gamepad2','Star','Zap','Droplets','Flame',
  'Snowflake','Sun','Bed','Phone','Globe','MapPin',
];

function AmenityIconPreview({ name, className }: { name: string | null; className?: string }) {
  if (!name) return <Package className={className} />;
  const Icon = (LucideIcons as any)[name] as React.ComponentType<{ className?: string }> | undefined;
  return Icon ? <Icon className={className} /> : <Package className={className} />;
}

async function getToken() {
  const s = await getSession();
  return (s as { accessToken?: string })?.accessToken ?? '';
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const AmenitySchema = z.object({
  name:     z.string().min(1, 'Bắt buộc'),
  nameEn:   z.string().optional(),
  icon:     z.string().optional(),
  category: z.enum(['basic', 'entertainment', 'convenience', 'safety']),
});
type AmenityFormData = z.infer<typeof AmenitySchema>;

// ─── Modal ────────────────────────────────────────────────────────────────────

function AmenityModal({
  initial, onClose, onSaved,
}: {
  initial: Amenity | null;
  onClose: () => void;
  onSaved: (a: Amenity) => void;
}) {
  const isEdit = !!initial;
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [iconSearch, setIconSearch] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<AmenityFormData>({
      resolver: zodResolver(AmenitySchema),
      defaultValues: {
        name:     initial?.name ?? '',
        nameEn:   initial?.nameEn ?? '',
        icon:     initial?.icon ?? '',
        category: (initial?.category as AmenityCategory) ?? 'basic',
      },
    });

  const selectedIcon     = watch('icon');
  const selectedCategory = watch('category') as AmenityCategory;

  const filteredIcons = SUGGESTED_ICONS.filter(
    (i) => !iconSearch || i.toLowerCase().includes(iconSearch.toLowerCase()),
  );

  const onSubmit = async (data: AmenityFormData) => {
    setSaving(true); setError('');
    try {
      const token = await getToken();
      const dto   = { ...data, icon: data.icon || null, nameEn: data.nameEn || null };
      const result = isEdit
        ? await apiClient.updateAmenity(initial!.id, dto, token)
        : await apiClient.createAmenity(dto, token);
      onSaved(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  };

  const catCfg = CATEGORY_CONFIG[selectedCategory];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${catCfg.bg}`}>
              <AmenityIconPreview name={selectedIcon || null} className={`w-4 h-4 ${catCfg.color}`} />
            </div>
            <h2 className="font-semibold text-gray-800">
              {isEdit ? 'Chỉnh sửa tiện ích' : 'Thêm tiện ích mới'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">Tên Tiếng Việt *</Label>
              <Input {...register('name')} placeholder="WiFi tốc độ cao" className="h-9 text-sm" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">Tên Tiếng Anh</Label>
              <Input {...register('nameEn')} placeholder="High-speed WiFi" className="h-9 text-sm" />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">Danh mục</Label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_LABELS) as AmenityCategory[]).map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setValue('category', cat)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-xl border-2 text-xs font-medium transition-all ${
                      active
                        ? `border-current ${cfg.bg} ${cfg.color}`
                        : 'border-gray-100 text-gray-500 hover:border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${active ? cfg.dot : 'bg-gray-300'}`} />
                    {CATEGORY_LABELS[cat]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-600">
              Biểu tượng
              {selectedIcon && <span className={`ml-2 font-normal ${catCfg.color}`}>{selectedIcon}</span>}
            </Label>

            {/* Preview + Input */}
            <div className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-colors ${
              selectedIcon ? `border-current ${catCfg.bg}` : 'border-gray-100 bg-gray-50'
            }`}>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${catCfg.bg}`}>
                <AmenityIconPreview name={selectedIcon || null} className={`w-5 h-5 ${catCfg.color}`} />
              </div>
              <Input
                placeholder="VD: Wifi, Car, Bath..."
                value={selectedIcon ?? ''}
                onChange={(e) => setValue('icon', e.target.value)}
                className="border-0 bg-transparent h-8 text-sm focus-visible:ring-0 px-1"
              />
              {selectedIcon && (
                <button type="button" onClick={() => setValue('icon', '')}
                  className="p-1 text-gray-400 hover:text-gray-600">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Icon grid */}
            <div className="border rounded-xl overflow-hidden bg-gray-50">
              <div className="p-2 border-b bg-white">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm icon..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-gray-50 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00B4D8]"
                  />
                </div>
              </div>
              <div className="p-2 grid grid-cols-8 gap-1 max-h-[120px] overflow-y-auto">
                {filteredIcons.map((iconName) => {
                  const Icon = (LucideIcons as any)[iconName] as React.ComponentType<{ className?: string }> | undefined;
                  if (!Icon) return null;
                  const active = selectedIcon === iconName;
                  return (
                    <button key={iconName} type="button" title={iconName}
                      onClick={() => setValue('icon', iconName)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                        active ? `${catCfg.bg} ${catCfg.color} scale-110 shadow-sm` : 'hover:bg-white text-gray-500 hover:shadow-sm'
                      }`}>
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <X size={14} className="shrink-0" /> {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9">Hủy</Button>
            <Button type="submit" disabled={saving} size="sm"
              className="bg-[#00B4D8] hover:bg-[#0077B6] h-9 min-w-28 gap-2">
              {saving && <Loader2 size={13} className="animate-spin" />}
              {isEdit ? 'Lưu thay đổi' : 'Tạo tiện ích'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ category, count, active, onClick }: {
  category: AmenityCategory; count: number; active: boolean; onClick: () => void;
}) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
        active
          ? `${cfg.bg} border-current ${cfg.color} shadow-sm`
          : 'bg-white border-gray-100 hover:border-gray-200 text-gray-600'
      }`}
    >
      <div className={`w-2 h-2 rounded-full shrink-0 ${active ? cfg.dot : 'bg-gray-300'}`} />
      <div>
        <p className="text-xs font-medium leading-none">{CATEGORY_LABELS[category]}</p>
        <p className={`text-lg font-bold mt-0.5 leading-none ${active ? '' : 'text-gray-800'}`}>{count}</p>
      </div>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AmenitiesPage() {
  const [amenities, setAmenities]       = useState<Amenity[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [catFilter, setCatFilter]       = useState<AmenityCategory | 'all'>('all');
  const [modal, setModal]               = useState<{ open: boolean; amenity: Amenity | null }>({ open: false, amenity: null });
  const [deleteConfirm, setDeleteConfirm] = useState<Amenity | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [toast, setToast]               = useState('');

  const showToast = useCallback((msg: string) => {
    setToast(msg); setTimeout(() => setToast(''), 3000);
  }, []);

  useEffect(() => {
    apiClient.getAmenities()
      .then((res) => setAmenities(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (saved: Amenity) => {
    setAmenities((prev) => {
      const exists = prev.find((a) => a.id === saved.id);
      return exists ? prev.map((a) => (a.id === saved.id ? saved : a)) : [saved, ...prev];
    });
    setModal({ open: false, amenity: null });
    showToast(modal.amenity ? 'Đã cập nhật tiện ích' : 'Đã tạo tiện ích mới');
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await apiClient.deleteAmenity(deleteConfirm.id, token);
      setAmenities((prev) => prev.filter((a) => a.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      showToast('Đã xóa tiện ích');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Xóa thất bại');
    } finally { setDeleting(false); }
  };

  const filtered = amenities.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || (a.nameEn ?? '').toLowerCase().includes(q);
    const matchCat = catFilter === 'all' || a.category === catFilter;
    return matchSearch && matchCat;
  });

  const countByCategory = (cat: AmenityCategory) =>
    amenities.filter((a) => a.category === cat).length;

  const grouped = (Object.keys(CATEGORY_LABELS) as AmenityCategory[])
    .map((cat) => ({ category: cat, items: filtered.filter((a) => a.category === cat) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý tiện ích</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Danh mục tiện ích gán cho phòng — {amenities.length} tiện ích tổng
          </p>
        </div>
        <Button onClick={() => setModal({ open: true, amenity: null })}
          className="bg-[#00B4D8] hover:bg-[#0077B6] gap-2 shrink-0">
          <Plus size={15} /> Thêm tiện ích
        </Button>
      </div>

      {/* Stat cards */}
      {!loading && amenities.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.keys(CATEGORY_LABELS) as AmenityCategory[]).map((cat) => (
            <StatCard key={cat} category={cat} count={countByCategory(cat)}
              active={catFilter === cat}
              onClick={() => setCatFilter(catFilter === cat ? 'all' : cat)} />
          ))}
        </div>
      )}

      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tiện ích..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCatFilter('all'); }}
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/30 bg-white"
          />
        </div>
        {(search || catFilter !== 'all') && (
          <button onClick={() => { setSearch(''); setCatFilter('all'); }}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl border hover:bg-gray-50 transition-colors">
            <X size={12} /> Xóa bộ lọc
          </button>
        )}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} kết quả</span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-[#00B4D8]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Package size={24} className="text-gray-300" />
          </div>
          <p className="font-semibold text-gray-600">
            {search ? 'Không tìm thấy tiện ích nào' : 'Chưa có tiện ích nào'}
          </p>
          <p className="text-sm text-gray-400 mt-1 mb-5">
            {search ? `Không có kết quả cho "${search}"` : 'Thêm tiện ích để gán cho các phòng'}
          </p>
          {!search && (
            <Button onClick={() => setModal({ open: true, amenity: null })}
              className="bg-[#00B4D8] hover:bg-[#0077B6] gap-2">
              <Plus size={15} /> Thêm tiện ích đầu tiên
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ category, items }) => {
            const cfg = CATEGORY_CONFIG[category];
            return (
              <div key={category}>
                {/* Category header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className={`text-xs font-semibold uppercase tracking-wider ${cfg.color}`}>
                    {CATEGORY_LABELS[category]}
                  </span>
                  <span className="text-xs text-gray-400">{items.length}</span>
                  <div className="flex-1 border-t border-gray-100 ml-1" />
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((amenity) => (
                    <AmenityCard key={amenity.id} amenity={amenity} category={category}
                      onEdit={() => setModal({ open: true, amenity })}
                      onDelete={() => setDeleteConfirm(amenity)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <AmenityModal initial={modal.amenity}
          onClose={() => setModal({ open: false, amenity: null })}
          onSaved={handleSaved} />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="font-semibold text-gray-900 text-center mb-1">Xóa tiện ích?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              <span className="font-medium text-gray-700">"{deleteConfirm.name}"</span> sẽ bị xóa khỏi hệ thống và tất cả phòng đang dùng.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 h-10"
                onClick={() => setDeleteConfirm(null)}>Hủy</Button>
              <Button className="flex-1 h-10 bg-red-500 hover:bg-red-600 gap-2"
                onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl z-50 animate-in slide-in-from-bottom-2">
          <CheckCircle size={15} className="text-emerald-400 shrink-0" />
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Amenity Card ─────────────────────────────────────────────────────────────

function AmenityCard({ amenity, category, onEdit, onDelete }: {
  amenity: Amenity;
  category: AmenityCategory;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <div className="group flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg} group-hover:scale-105 transition-transform`}>
        <AmenityIconPreview name={amenity.icon} className={`w-5 h-5 ${cfg.color}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{amenity.name}</p>
        {amenity.nameEn && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{amenity.nameEn}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button title="Sửa" onClick={onEdit}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors">
          <Pencil size={13} />
        </button>
        <button title="Xóa" onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
