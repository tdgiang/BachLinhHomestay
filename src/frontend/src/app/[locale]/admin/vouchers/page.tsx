'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit2, Trash2, Tag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';
import type { Voucher } from '@/types';

function fmtDate(iso: string) {
  return format(new Date(iso), 'dd/MM/yyyy');
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg text-sm text-white flex items-center gap-2 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
      {message}
    </div>
  );
}

export default function AdminVouchersPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string })?.accessToken ?? '';

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // form state
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [minBooking, setMinBooking] = useState('0');
  const [usageLimit, setUsageLimit] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const reload = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const r = await apiClient.getVouchers(token);
      setVouchers(r.items);
    } catch {
      showToast('Không tải được danh sách voucher', 'error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { reload(); }, [reload]);

  function openNew() {
    setEditVoucher(null);
    setCode(''); setDescription(''); setDiscountValue(''); setMaxDiscount('');
    setMinBooking('0'); setUsageLimit(''); setValidFrom(''); setValidUntil('');
    setDiscountType('percentage');
    setOpen(true);
  }

  function openEdit(v: Voucher) {
    setEditVoucher(v);
    setCode(v.code);
    setDescription(v.description ?? '');
    setDiscountType(v.discountType);
    setDiscountValue(String(v.discountValue));
    setMaxDiscount(v.maxDiscountAmount ? String(v.maxDiscountAmount) : '');
    setMinBooking(String(v.minBookingAmount));
    setUsageLimit(v.usageLimit ? String(v.usageLimit) : '');
    setValidFrom(v.validFrom.split('T')[0]);
    setValidUntil(v.validUntil.split('T')[0]);
    setOpen(true);
  }

  async function handleSubmit() {
    if (!code.trim() || !discountValue || !validFrom || !validUntil) {
      showToast('Vui lòng điền đầy đủ các trường bắt buộc', 'error');
      return;
    }
    setSaving(true);
    try {
      const dto = {
        code: code.trim(),
        description: description.trim() || undefined,
        discountType,
        discountValue: Number(discountValue),
        maxDiscountAmount: maxDiscount ? Number(maxDiscount) : undefined,
        minBookingAmount: minBooking ? Number(minBooking) : 0,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        validFrom: new Date(validFrom).toISOString(),
        validUntil: new Date(validUntil).toISOString(),
      };
      if (editVoucher) {
        await apiClient.updateVoucher(editVoucher.id, dto, token);
        showToast('Đã cập nhật voucher', 'success');
      } else {
        await apiClient.createVoucher(dto, token);
        showToast('Đã tạo voucher mới', 'success');
      }
      setOpen(false);
      reload();
    } catch (err: any) {
      showToast(err?.message ?? 'Lưu thất bại', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiClient.deleteVoucher(deleteId, token);
      showToast('Đã xóa voucher', 'success');
      setDeleteId(null);
      reload();
    } catch {
      showToast('Xóa thất bại', 'error');
    } finally {
      setDeleting(false);
    }
  }

  const now = new Date();

  return (
    <div className="space-y-5">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý voucher</h1>
          <p className="text-sm text-gray-500 mt-0.5">{vouchers.length} voucher</p>
        </div>
        <Button onClick={openNew} className="gap-2 bg-[#00B4D8] hover:bg-[#0077B6] text-sm">
          <Plus size={15} /> Tạo voucher
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
          <Loader2 size={18} className="animate-spin" /> Đang tải...
        </div>
      )}

      {!loading && vouchers.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">Chưa có voucher nào</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {vouchers.map((v) => {
          const expired = new Date(v.validUntil) < now;
          const notStarted = new Date(v.validFrom) > now;
          const active = v.isActive && !expired && !notStarted;

          return (
            <div key={v.id} className="bg-white rounded-xl border p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Tag size={16} className="text-orange-500" />
                  </div>
                  <div>
                    <p className="font-bold font-mono text-gray-900">{v.code}</p>
                    <span className={`text-xs font-medium ${
                      active ? 'text-green-600' : expired ? 'text-gray-400' : 'text-yellow-600'
                    }`}>
                      {active ? 'Đang hoạt động' : expired ? 'Hết hạn' : 'Chưa bắt đầu'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button onClick={() => openEdit(v)} variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-gray-600">
                    <Edit2 size={13} />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-7 w-7 text-red-400 hover:text-red-600"
                    onClick={() => setDeleteId(v.id)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <Row label="Giảm giá">
                  {v.discountType === 'percentage'
                    ? `${v.discountValue}%${v.maxDiscountAmount ? ` (tối đa ${v.maxDiscountAmount.toLocaleString('vi-VN')}₫)` : ''}`
                    : `${v.discountValue.toLocaleString('vi-VN')}₫`}
                </Row>
                <Row label="Đơn tối thiểu">{v.minBookingAmount.toLocaleString('vi-VN')}₫</Row>
                {v.usageLimit != null && (
                  <Row label="Đã dùng">{v.usedCount}/{v.usageLimit}</Row>
                )}
                <Row label="Hiệu lực">{fmtDate(v.validFrom)} – {fmtDate(v.validUntil)}</Row>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={(o) => { if (!saving) setOpen(o); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editVoucher ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FormField label="Mã voucher *">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SUMMER30"
                className="font-mono"
                disabled={!!editVoucher}
              />
            </FormField>
            <FormField label="Mô tả">
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nhập mô tả (tùy chọn)" />
            </FormField>
            <FormField label="Loại giảm giá">
              <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'percentage' | 'fixed_amount')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                  <SelectItem value="fixed_amount">Số tiền cố định (₫)</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={discountType === 'percentage' ? 'Giảm (%) *' : 'Giảm (₫) *'}>
                <Input value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} type="number" min="0" />
              </FormField>
              {discountType === 'percentage' && (
                <FormField label="Giảm tối đa (₫)">
                  <Input value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} type="number" min="0" />
                </FormField>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Đơn tối thiểu (₫)">
                <Input value={minBooking} onChange={(e) => setMinBooking(e.target.value)} type="number" min="0" />
              </FormField>
              <FormField label="Giới hạn dùng">
                <Input value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} type="number" min="1" placeholder="Không giới hạn" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Từ ngày *">
                <Input value={validFrom} onChange={(e) => setValidFrom(e.target.value)} type="date" />
              </FormField>
              <FormField label="Đến ngày *">
                <Input value={validUntil} onChange={(e) => setValidUntil(e.target.value)} type="date" />
              </FormField>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Hủy</Button>
            <Button
              className="bg-[#00B4D8] hover:bg-[#0077B6]"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving
                ? <><Loader2 size={13} className="animate-spin mr-1" /> Đang lưu...</>
                : editVoucher ? 'Lưu thay đổi' : 'Tạo voucher'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="font-semibold text-gray-900 mb-1">Xóa voucher?</h3>
            <p className="text-sm text-gray-500 mb-5">Hành động này không thể hoàn tác.</p>
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-400 text-xs">{label}:</span>
      <span className="text-gray-700 text-xs font-medium text-right">{children}</span>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      {children}
    </div>
  );
}
