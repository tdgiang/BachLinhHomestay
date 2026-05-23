'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Plus, Trash2, GripVertical } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { MOCK_BRANCHES } from '@/lib/mock';
import type { Room } from '@/types';

const RoomSchema = z.object({
  name:              z.string().min(1, 'Bắt buộc'),
  nameEn:            z.string().optional(),
  description:       z.string().optional(),
  descriptionEn:     z.string().optional(),
  branchId:          z.string().min(1, 'Chọn chi nhánh'),
  roomNumber:        z.string().min(1, 'Bắt buộc'),
  floor:             z.coerce.number().optional(),
  capacity:          z.coerce.number().min(1),
  pricePerHour:      z.coerce.number().min(0),
  pricePerHourOriginal: z.coerce.number().optional(),
  pricePerDay:       z.coerce.number().min(0),
  pricePerDayOriginal:  z.coerce.number().optional(),
  minHours:          z.coerce.number().min(1),
  extraHourPrice:    z.coerce.number().optional(),
  extraPersonPrice:  z.coerce.number().optional(),
  checkInTime:       z.string(),
  checkOutTime:      z.string(),
  allowHourly:       z.boolean(),
  status:            z.enum(['active', 'maintenance', 'inactive']),
  isFeatured:        z.boolean(),
  isGuestFavorite:   z.boolean(),
});

type RoomFormData = z.infer<typeof RoomSchema>;

const TABS = [
  'Thông tin', 'Giá', 'Cài đặt', 'Ảnh', 'Tiện nghi', 'Khung giờ', 'Chính sách hủy',
] as const;

export default function RoomEditPage() {
  const { id, locale } = useParams<{ id: string; locale: string }>();
  const isNew = id === 'new';

  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Thông tin');
  const [room, setRoom] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RoomFormData>({
    resolver: zodResolver(RoomSchema),
    defaultValues: {
      capacity: 2, minHours: 2, allowHourly: true,
      status: 'active', isFeatured: false, isGuestFavorite: false,
      checkInTime: '14:00', checkOutTime: '11:00',
    },
  });

  useEffect(() => {
    if (!isNew) {
      apiClient.getRoom(id).then((r) => {
        setRoom(r);
        Object.entries(r).forEach(([k, v]) => {
          if (v !== null && v !== undefined) setValue(k as keyof RoomFormData, v as never);
        });
      }).catch(() => {});
    }
  }, [id, isNew, setValue]);

  const onSubmit = async (data: RoomFormData) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    console.log('Save room:', data);
    setSaving(false);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/admin/rooms`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          {isNew ? 'Thêm phòng mới' : room?.name ?? 'Chỉnh sửa phòng'}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 bg-gray-100 rounded-lg p-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border p-6">
          {/* Tab: Thông tin */}
          {activeTab === 'Thông tin' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tên phòng (VI) *" error={errors.name?.message}>
                  <Input {...register('name')} placeholder="Phòng Deluxe Hướng Phố" />
                </Field>
                <Field label="Tên phòng (EN)">
                  <Input {...register('nameEn')} placeholder="Deluxe City View Room" />
                </Field>
              </div>
              <Field label="Mô tả (VI)">
                <Textarea {...register('description')} rows={3} placeholder="Mô tả phòng..." />
              </Field>
              <Field label="Mô tả (EN)">
                <Textarea {...register('descriptionEn')} rows={3} placeholder="Room description..." />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Chi nhánh *" error={errors.branchId?.message}>
                  <Select onValueChange={(v) => setValue('branchId', v ?? '')} defaultValue={watch('branchId')}>
                    <SelectTrigger><SelectValue placeholder="Chọn chi nhánh" /></SelectTrigger>
                    <SelectContent>
                      {MOCK_BRANCHES.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Số phòng *" error={errors.roomNumber?.message}>
                  <Input {...register('roomNumber')} placeholder="101" />
                </Field>
                <Field label="Tầng">
                  <Input {...register('floor')} type="number" placeholder="1" />
                </Field>
              </div>
              <Field label="Sức chứa (người) *" error={errors.capacity?.message}>
                <Input {...register('capacity')} type="number" className="w-32" />
              </Field>
            </div>
          )}

          {/* Tab: Giá */}
          {activeTab === 'Giá' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Giá theo giờ (₫) *" error={errors.pricePerHour?.message}>
                  <Input {...register('pricePerHour')} type="number" placeholder="150000" />
                </Field>
                <Field label="Giá gốc/giờ (₫)">
                  <Input {...register('pricePerHourOriginal')} type="number" placeholder="200000" />
                </Field>
                <Field label="Giá theo ngày (₫) *" error={errors.pricePerDay?.message}>
                  <Input {...register('pricePerDay')} type="number" placeholder="1200000" />
                </Field>
                <Field label="Giá gốc/ngày (₫)">
                  <Input {...register('pricePerDayOriginal')} type="number" placeholder="1500000" />
                </Field>
                <Field label="Số giờ tối thiểu *">
                  <Input {...register('minHours')} type="number" placeholder="2" />
                </Field>
                <Field label="Phụ thu thêm giờ (₫)">
                  <Input {...register('extraHourPrice')} type="number" placeholder="50000" />
                </Field>
                <Field label="Phụ thu thêm người (₫)">
                  <Input {...register('extraPersonPrice')} type="number" placeholder="100000" />
                </Field>
              </div>
            </div>
          )}

          {/* Tab: Cài đặt */}
          {activeTab === 'Cài đặt' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Giờ check-in">
                  <Input {...register('checkInTime')} type="time" />
                </Field>
                <Field label="Giờ check-out">
                  <Input {...register('checkOutTime')} type="time" />
                </Field>
              </div>
              <Field label="Trạng thái">
                <Select onValueChange={(v) => v && setValue('status', v as 'active' | 'maintenance' | 'inactive')} defaultValue={watch('status')}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoạt động</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                    <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="space-y-3">
                <CheckboxField
                  label="Cho phép đặt theo giờ"
                  checked={watch('allowHourly')}
                  onChange={(v) => setValue('allowHourly', v)}
                />
                <CheckboxField
                  label="Phòng nổi bật (Featured)"
                  checked={watch('isFeatured')}
                  onChange={(v) => setValue('isFeatured', v)}
                />
                <CheckboxField
                  label="Được khách yêu thích (Guest Favorite)"
                  checked={watch('isGuestFavorite')}
                  onChange={(v) => setValue('isGuestFavorite', v)}
                />
              </div>
            </div>
          )}

          {/* Tab: Ảnh */}
          {activeTab === 'Ảnh' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-xl p-10 text-center hover:border-[#00B4D8] transition-colors cursor-pointer bg-gray-50">
                <Upload size={28} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-medium text-gray-600">Kéo thả ảnh vào đây</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — tối đa 5MB/ảnh, tối đa 10 ảnh</p>
                <Button type="button" variant="outline" size="sm" className="mt-3">
                  Chọn file
                </Button>
              </div>
              {room?.images && room.images.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {room.images.map((img, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden aspect-video bg-gray-100">
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button type="button" className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                          <GripVertical size={13} className="text-gray-600" />
                        </button>
                        <button type="button" className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
                          <Trash2 size={13} className="text-white" />
                        </button>
                      </div>
                      {img.isCover && (
                        <span className="absolute top-1.5 left-1.5 bg-[#00B4D8] text-white text-xs px-1.5 py-0.5 rounded font-medium">
                          Bìa
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Tiện nghi */}
          {activeTab === 'Tiện nghi' && (
            <div className="space-y-4">
              {room?.amenities?.map((amenity, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <span className="flex-1 font-medium text-sm">{amenity.name}</span>
                  {amenity.nameEn && <span className="text-xs text-gray-400">{amenity.nameEn}</span>}
                  <span className="text-xs text-gray-500">{amenity.isFree ? 'Miễn phí' : `${amenity.price?.toLocaleString('vi-VN')}₫`}</span>
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-400">
                    <Trash2 size={13} />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-1.5">
                <Plus size={13} /> Thêm tiện nghi
              </Button>
            </div>
          )}

          {/* Tab: Khung giờ */}
          {activeTab === 'Khung giờ' && (
            <div className="space-y-4">
              {room?.timeSlotSuggestions?.map((slot, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg text-sm">
                  <span className="font-medium flex-1">{slot.label}</span>
                  <span className="text-gray-500">{slot.startTime} – {slot.endTime}</span>
                  {slot.priceOverride && (
                    <span className="text-[#00B4D8] font-medium">{slot.priceOverride.toLocaleString('vi-VN')}₫</span>
                  )}
                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-400">
                    <Trash2 size={13} />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="gap-1.5">
                <Plus size={13} /> Thêm khung giờ
              </Button>
            </div>
          )}

          {/* Tab: Chính sách hủy */}
          {activeTab === 'Chính sách hủy' && (
            <div className="space-y-4">
              <div className="rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                      <th className="px-4 py-3 text-left">Hủy trước (ngày)</th>
                      <th className="px-4 py-3 text-center">Hoàn tiền (%)</th>
                      <th className="px-4 py-3 text-left">Mô tả</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {room?.cancellationPolicies?.map((p, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium">{p.daysBefore} ngày</td>
                        <td className="px-4 py-3 text-center">{p.refundPercentage}%</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{p.description ?? '—'}</td>
                        <td className="px-4 py-3">
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-400">
                            <Trash2 size={13} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button type="button" variant="outline" size="sm" className="gap-1.5">
                <Plus size={13} /> Thêm chính sách
              </Button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-4">
          <Link href={`/${locale}/admin/rooms`}>
            <Button type="button" variant="outline">Hủy</Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#00B4D8] hover:bg-[#0077B6] min-w-24"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function CheckboxField({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          checked ? 'bg-[#00B4D8] border-[#00B4D8]' : 'border-gray-300 group-hover:border-[#00B4D8]'
        }`}
      >
        {checked && <span className="text-white text-xs font-bold">✓</span>}
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}
