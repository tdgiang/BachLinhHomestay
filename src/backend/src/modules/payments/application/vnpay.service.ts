import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { format } from 'date-fns';

@Injectable()
export class VnpayService {
  private readonly logger = new Logger(VnpayService.name);

  constructor(private readonly config: ConfigService) {}

  createPaymentUrl(params: {
    bookingCode: string;
    amount: number;  // VNĐ
    ipAddr?: string;
    orderInfo?: string;
  }): string {
    const tmnCode = this.config.get<string>('VNPAY_TMN_CODE', '');
    const hashSecret = this.config.get<string>('VNPAY_HASH_SECRET', '');
    const vnpUrl = this.config.get<string>('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
    const returnUrl = this.config.get<string>('VNPAY_RETURN_URL', 'http://localhost:3000/payment/callback');

    const createDate = format(new Date(), 'yyyyMMddHHmmss');

    const rawParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: String(Math.round(params.amount) * 100),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: params.bookingCode,
      vnp_OrderInfo: params.orderInfo ?? `Dat phong ${params.bookingCode}`,
      vnp_OrderType: 'other',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: params.ipAddr ?? '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    // Sort params alphabetically
    const sorted = Object.keys(rawParams).sort().reduce<Record<string, string>>((acc, key) => {
      acc[key] = rawParams[key];
      return acc;
    }, {});

    const signData = new URLSearchParams(sorted).toString();
    const hmac = createHmac('sha512', hashSecret);
    const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;
  }

  verifyCallback(query: Record<string, string>): { valid: boolean; responseCode: string } {
    const hashSecret = this.config.get<string>('VNPAY_HASH_SECRET', '');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { vnp_SecureHash, vnp_SecureHashType, ...rest } = query;

    const sorted = Object.keys(rest)
      .filter((k) => k.startsWith('vnp_'))
      .sort()
      .reduce<Record<string, string>>((acc, key) => {
        acc[key] = rest[key];
        return acc;
      }, {});

    const signData = new URLSearchParams(sorted).toString();
    const hmac = createHmac('sha512', hashSecret);
    const expectedHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return {
      valid: expectedHash === vnp_SecureHash,
      responseCode: query.vnp_ResponseCode ?? '',
    };
  }
}
