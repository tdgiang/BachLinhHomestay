'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Loader2,
  Search,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import { ApiError } from '@/lib/api';
import type {
  ComplaintCategory,
  ComplaintReceipt,
  ComplaintStatus,
  ComplaintTracking,
} from '@/types';

/** Nhóm vấn đề — khớp enum ComplaintCategory ở backend. */
const CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: 'booking', label: 'Đặt phòng / nhận phòng' },
  { value: 'payment', label: 'Thanh toán' },
  { value: 'refund', label: 'Hủy phòng, hoàn tiền' },
  { value: 'service', label: 'Chất lượng dịch vụ, cơ sở vật chất' },
  { value: 'privacy', label: 'Dữ liệu cá nhân, bảo mật' },
  { value: 'other', label: 'Vấn đề khác' },
];

const STATUS_LABEL: Record<ComplaintStatus, string> = {
  received: 'Đã tiếp nhận',
  in_progress: 'Đang xử lý',
  resolved: 'Đã giải quyết',
  rejected: 'Không có cơ sở giải quyết',
};

const schema = z.object({
  fullName: z.string().trim().min(2, 'Vui lòng nhập họ tên').max(100),
  email: z.string().trim().email('Email không hợp lệ').max(150),
  phone: z
    .string()
    .trim()
    .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ'),
  bookingCode: z.string().trim().max(50).optional().or(z.literal('')),
  category: z.enum([
    'booking',
    'payment',
    'refund',
    'service',
    'privacy',
    'other',
  ]),
  subject: z.string().trim().min(5, 'Tiêu đề tối thiểu 5 ký tự').max(200),
  content: z.string().trim().min(20, 'Nội dung tối thiểu 20 ký tự').max(5000),
});

type FormData = z.infer<typeof schema>;

const inputStyle = {
  borderColor: 'var(--color-border)',
  background: 'white',
} as const;

/**
 * Đổi lỗi kỹ thuật thành câu tiếng Việt người dùng hiểu được.
 *
 * Nội dung lỗi từ máy chủ không phải lúc nào cũng dành cho người dùng cuối:
 * ThrottlerGuard trả nguyên văn "ThrottlerException: Too Many Requests".
 */
function describeSubmitError(err: unknown): string {
  const fallback =
    'Không gửi được. Vui lòng thử lại hoặc gọi hotline 0931 708 256.';
  if (!(err instanceof ApiError)) return fallback;

  if (err.status === 429) {
    return 'Bạn đã gửi quá nhiều phản ánh trong thời gian ngắn. Vui lòng thử lại sau ít phút, hoặc gọi hotline 0931 708 256 nếu việc gấp.';
  }
  if (err.isValidation) return err.message;
  if (err.isServer) return fallback;
  return err.message || fallback;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: '#DC2626' }}>
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  );
}

export function ComplaintForm() {
  const [receipt, setReceipt] = useState<ComplaintReceipt | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'booking' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      const data = await apiClient.createComplaint({
        ...values,
        bookingCode: values.bookingCode || undefined,
      });
      setReceipt(data);
      reset();
    } catch (err) {
      setSubmitError(describeSubmitError(err));
    }
  });

  async function copyCode() {
    if (!receipt) return;
    try {
      await navigator.clipboard.writeText(receipt.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard bị chặn (http, quyền trình duyệt) — mã vẫn hiển thị để chép tay.
    }
  }

  if (receipt) {
    return (
      <div
        className="rounded-3xl p-8 text-center"
        style={{ background: 'white', border: '1px solid var(--color-border)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-5"
          style={{ background: 'rgba(22,163,74,0.10)' }}
        >
          <CheckCircle2 className="w-7 h-7" style={{ color: '#16A34A' }} />
        </div>

        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
        >
          Đã tiếp nhận phản ánh của bạn
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Vui lòng lưu mã phiếu để tra cứu tiến độ xử lý.
        </p>

        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl font-mono text-lg font-bold transition-colors"
          style={{
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-primary)',
            color: 'var(--color-primary)',
          }}
        >
          {receipt.code}
          <Copy className="w-4 h-4" />
        </button>
        {copied && (
          <p className="mt-2 text-xs" style={{ color: '#16A34A' }}>
            Đã chép mã
          </p>
        )}

        <div
          className="mt-7 text-sm leading-relaxed text-left rounded-2xl p-5"
          style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}
        >
          <p className="mb-2">
            <strong style={{ color: 'var(--color-text-primary)' }}>
              Phản hồi ban đầu:
            </strong>{' '}
            trong {receipt.initialResponseHours} giờ.
          </p>
          <p>
            <strong style={{ color: 'var(--color-text-primary)' }}>
              Thời hạn giải quyết:
            </strong>{' '}
            tối đa {receipt.resolutionDays}{' '}
            {/* Yêu cầu về dữ liệu cá nhân tính theo ngày lịch, giống bảng
                thời hạn công bố ở trên — không được ghi khác đi. */}
            {receipt.resolutionDays >= 30 ? 'ngày' : 'ngày làm việc'} kể từ ngày tiếp nhận,
            theo nhóm vấn đề bạn đã chọn. Vụ việc phức tạp sẽ được thông báo gia
            hạn trước khi hết thời hạn.
          </p>
        </div>

        <Button
          variant="outline"
          className="mt-6 rounded-xl"
          style={{ borderColor: 'var(--color-border)' }}
          onClick={() => setReceipt(null)}
        >
          Gửi phản ánh khác
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      // Zod là nguồn kiểm tra duy nhất. Thiếu noValidate, native validation của
      // trình duyệt (input type="email") chặn submit trước khi handleSubmit
      // chạy — người dùng không thấy thông báo lỗi tiếng Việt nào.
      noValidate
      className="rounded-3xl p-6 md:p-8 space-y-5"
      style={{ background: 'white', border: '1px solid var(--color-border)' }}
    >
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <Label htmlFor="fullName" className="mb-2 block text-sm font-medium">
            Họ và tên <span style={{ color: '#DC2626' }}>*</span>
          </Label>
          <Input id="fullName" style={inputStyle} {...register('fullName')} />
          <FieldError message={errors.fullName?.message} />
        </div>

        <div>
          <Label htmlFor="phone" className="mb-2 block text-sm font-medium">
            Số điện thoại <span style={{ color: '#DC2626' }}>*</span>
          </Label>
          <Input id="phone" inputMode="tel" style={inputStyle} {...register('phone')} />
          <FieldError message={errors.phone?.message} />
        </div>

        <div>
          <Label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email nhận phản hồi <span style={{ color: '#DC2626' }}>*</span>
          </Label>
          <Input id="email" type="email" style={inputStyle} {...register('email')} />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <Label htmlFor="bookingCode" className="mb-2 block text-sm font-medium">
            Mã đặt phòng{' '}
            <span style={{ color: 'var(--color-text-muted)' }}>(nếu có)</span>
          </Label>
          <Input id="bookingCode" style={inputStyle} {...register('bookingCode')} />
          <FieldError message={errors.bookingCode?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor="category" className="mb-2 block text-sm font-medium">
          Nhóm vấn đề <span style={{ color: '#DC2626' }}>*</span>
        </Label>
        <select
          id="category"
          className="w-full h-9 px-3 rounded-md border text-sm"
          style={inputStyle}
          {...register('category')}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.category?.message} />
      </div>

      <div>
        <Label htmlFor="subject" className="mb-2 block text-sm font-medium">
          Tiêu đề <span style={{ color: '#DC2626' }}>*</span>
        </Label>
        <Input id="subject" style={inputStyle} {...register('subject')} />
        <FieldError message={errors.subject?.message} />
      </div>

      <div>
        <Label htmlFor="content" className="mb-2 block text-sm font-medium">
          Nội dung chi tiết <span style={{ color: '#DC2626' }}>*</span>
        </Label>
        <Textarea id="content" rows={6} style={inputStyle} {...register('content')} />
        <FieldError message={errors.content?.message} />
      </div>

      {submitError && (
        <div
          className="flex items-start gap-2.5 rounded-2xl p-4 text-sm"
          style={{ background: 'rgba(220,38,38,0.06)', color: '#DC2626' }}
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {submitError}
        </div>
      )}

      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
        Thông tin bạn gửi chỉ dùng để tiếp nhận và xử lý phản ánh, theo Chính sách
        bảo vệ thông tin cá nhân của Ba.Li Homestay.
      </p>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 rounded-2xl font-semibold gap-2"
        style={{ background: 'var(--color-primary)', color: 'white' }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Đang gửi…
          </>
        ) : (
          <>
            <Send className="w-4 h-4" /> Gửi phản ánh
          </>
        )}
      </Button>
    </form>
  );
}

/** Tra cứu tiến độ xử lý bằng mã phiếu — không cần đăng nhập. */
export function ComplaintTracker() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<ComplaintTracking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await apiClient.trackComplaint(code.trim()));
    } catch (err) {
      setError(
        err instanceof ApiError && err.isNotFound
          ? 'Không tìm thấy phiếu với mã này. Kiểm tra lại mã đã hiển thị khi bạn gửi phản ánh.'
          : 'Không tra cứu được. Vui lòng thử lại sau.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-3xl p-6 md:p-8"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <h3
        className="text-lg font-bold mb-1.5"
        style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}
      >
        Tra cứu tiến độ xử lý
      </h3>
      <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
        Nhập mã phiếu đã nhận khi gửi phản ánh.
      </p>

      <form onSubmit={onSearch} className="flex gap-2.5">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="KN-20260918-A7K2M9PQ"
          className="font-mono"
          style={inputStyle}
        />
        <Button
          type="submit"
          disabled={loading}
          className="h-9 px-4 rounded-xl gap-1.5 shrink-0"
          style={{ background: 'var(--color-primary)', color: 'white' }}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Tra cứu
        </Button>
      </form>

      {error && (
        <p className="mt-4 text-sm" style={{ color: '#DC2626' }}>
          {error}
        </p>
      )}

      {result && (
        <div
          className="mt-5 rounded-2xl p-5 space-y-2.5 text-sm"
          style={{ background: 'white', border: '1px solid var(--color-border)' }}
        >
          <p style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Mã phiếu:</strong>{' '}
            <span className="font-mono">{result.code}</span>
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Tiêu đề:</strong>{' '}
            {result.subject}
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Trạng thái:</strong>{' '}
            {STATUS_LABEL[result.status]}
          </p>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            <strong style={{ color: 'var(--color-text-primary)' }}>Ngày tiếp nhận:</strong>{' '}
            {new Date(result.createdAt).toLocaleDateString('vi-VN')}
          </p>
          {result.response && (
            <div
              className="mt-3 pt-3 border-t"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                Phản hồi từ Ba.Li Homestay
              </p>
              <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                {result.response}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
