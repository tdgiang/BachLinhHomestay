'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
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

export default function AdminVouchersPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string })?.accessToken ?? '';

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [open, setOpen] = useState(false);
  const [editVoucher, setEditVoucher] = useState<Voucher | null>(null);

  // form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [minBooking, setMinBooking] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  useEffect(() => {
    apiClient.getVouchers(token).then((r) => setVouchers(r.items)).catch(() => {});
  }, [token]);

  function openNew() {
    setEditVoucher(null);
    setCode(''); setDiscountValue(''); setMaxDiscount('');
    setMinBooking(''); setUsageLimit(''); setValidFrom(''); setValidUntil('');
    setDiscountType('percentage');
    setOpen(true);
  }

  function openEdit(v: Voucher) {
    setEditVoucher(v);
    setCode(v.code);
    setDiscountType(v.discountType);
    setDiscountValue(String(v.discountValue));
    setMaxDiscount(v.maxDiscountAmount ? String(v.maxDiscountAmount) : '');
    setMinBooking(String(v.minBookingAmount));
    setUsageLimit(v.usageLimit ? String(v.usageLimit) : '');
    setValidFrom(v.validFrom.split('T')[0]);
    setValidUntil(v.validUntil.split('T')[0]);
    setOpen(true);
  }

  const now = new Date();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý voucher</h1>
          <p className="text-sm text-gray-500 mt-0.5">{vouchers.length} voucher</p>
        </div>
        <Button onClick={openNew} className="gap-2 bg-[#00B4D8] hover:bg-[#0077B6] text-sm">
          <Plus size={15} /> Tạo voucher
        </Button>
      </div>

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
                  <Button onClick={() => openEdit(v)} variant="ghost" size="icon" className="h-7 w-7 text-gray-400">
                    <Edit2 size={13} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400">
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
                {v.usageLimit && (
                  <Row label="Đã dùng">{v.usedCount}/{v.usageLimit}</Row>
                )}
                <Row label="Hiệu lực">{fmtDate(v.validFrom)} – {fmtDate(v.validUntil)}</Row>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editVoucher ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <FormField label="Mã voucher *">
              <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="SUMMER30" className="font-mono" />
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
              <FormField label={discountType === 'percentage' ? 'Giảm (%)' : 'Giảm (₫)'}>
                <Input value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} type="number" />
              </FormField>
              {discountType === 'percentage' && (
                <FormField label="Giảm tối đa (₫)">
                  <Input value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} type="number" />
                </FormField>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Đơn tối thiểu (₫)">
                <Input value={minBooking} onChange={(e) => setMinBooking(e.target.value)} type="number" />
              </FormField>
              <FormField label="Giới hạn dùng">
                <Input value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} type="number" placeholder="Không giới hạn" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Từ ngày">
                <Input value={validFrom} onChange={(e) => setValidFrom(e.target.value)} type="date" />
              </FormField>
              <FormField label="Đến ngày">
                <Input value={validUntil} onChange={(e) => setValidUntil(e.target.value)} type="date" />
              </FormField>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Hủy</Button>
            <Button className="bg-[#00B4D8] hover:bg-[#0077B6]">
              {editVoucher ? 'Lưu thay đổi' : 'Tạo voucher'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
