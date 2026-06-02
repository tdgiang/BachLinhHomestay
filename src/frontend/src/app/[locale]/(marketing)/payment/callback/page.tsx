'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  // Backend redirects here only on failure:
  // /payment/callback?error=<vnp_ResponseCode>&bookingCode=<HMS-xxx>
  // or /payment/callback?error=invalid_signature
  // or /payment/callback?error=booking_not_found
  const errorCode = searchParams.get('error');
  const bookingCode = searchParams.get('bookingCode');

  const errorMessages: Record<string, string> = {
    invalid_signature: 'Chữ ký xác thực không hợp lệ.',
    booking_not_found: 'Không tìm thấy đơn đặt phòng.',
    '24': 'Giao dịch bị huỷ bởi khách hàng.',
    '11': 'Giao dịch hết hạn. Vui lòng thử lại.',
    '51': 'Tài khoản không đủ số dư.',
    '65': 'Tài khoản vượt quá giới hạn giao dịch.',
    '75': 'Ngân hàng đang bảo trì.',
  };

  const friendlyMessage = errorCode
    ? (errorMessages[errorCode] ?? `Thanh toán thất bại (mã lỗi: ${errorCode}).`)
    : 'Thanh toán thất bại.';

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-sm mx-auto px-4 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#FEE2E2' }}>
          <XCircle className="w-8 h-8" style={{ color: 'var(--color-danger)' }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Thanh toán thất bại
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          {friendlyMessage}
        </p>
        {bookingCode && (
          <p className="text-xs mb-6 font-mono" style={{ color: 'var(--color-text-secondary)' }}>
            Mã đặt phòng: <strong>{bookingCode}</strong>
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button variant="outline">Về trang chủ</Button>
          </Link>
          {bookingCode && (
            <Link href={`/track?code=${bookingCode}`}>
              <Button className="text-white" style={{ background: 'var(--color-primary)' }}>
                Tra cứu đơn
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
