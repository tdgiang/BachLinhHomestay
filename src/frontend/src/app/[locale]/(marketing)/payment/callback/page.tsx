'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    const responseCode = searchParams.get('vnp_ResponseCode');
    const txnRef = searchParams.get('vnp_TxnRef'); // bookingCode như HMS-XXXX

    if (responseCode === '00') {
      setStatus('success');
      // Tìm booking id từ txnRef nếu cần — trong mock dùng bookingCode
      setBookingId(txnRef ?? '');
      // Tự redirect sau 2s
      setTimeout(() => {
        if (txnRef) router.push(`/booking/${txnRef}/success`);
        else router.push('/');
      }, 2000);
    } else {
      setStatus('error');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-sm mx-auto px-4 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Đang xử lý thanh toán...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#D1FAE5' }}>
              <CheckCircle className="w-8 h-8" style={{ color: 'var(--color-success)' }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Thanh toán thành công!</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>Đang chuyển hướng...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#FEE2E2' }}>
              <XCircle className="w-8 h-8" style={{ color: 'var(--color-danger)' }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Thanh toán thất bại</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Mã lỗi: {searchParams.get('vnp_ResponseCode') ?? 'Không xác định'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.back()}>Thử lại</Button>
              <Link href="/">
                <Button className="text-white" style={{ background: 'var(--color-primary)' }}>Về trang chủ</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
