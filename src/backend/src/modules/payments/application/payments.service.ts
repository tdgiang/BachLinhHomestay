import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { BookingsService } from '../../bookings/application/bookings.service';
import { VnpayService } from './vnpay.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingsService: BookingsService,
    private readonly vnpayService: VnpayService,
  ) {}

  async createVnpayUrl(bookingId: string, ipAddr?: string): Promise<{ paymentUrl: string }> {
    const booking = await this.bookingsService.findOne(bookingId);
    const b = booking as any;

    const paymentUrl = this.vnpayService.createPaymentUrl({
      bookingCode: b.bookingCode,
      amount: Number(b.totalAmount),
      ipAddr,
      orderInfo: `Dat phong ${b.bookingCode}`,
    });

    return { paymentUrl };
  }

  /** Handles VNPay callback — verifies signature, updates DB, returns redirect URL */
  async handleVnpayCallback(query: Record<string, string>): Promise<string> {
    const frontendUrl = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
    const { valid, responseCode } = this.vnpayService.verifyCallback(query);

    const bookingCode = query.vnp_TxnRef;

    if (!valid) {
      this.logger.warn(`VNPay callback signature invalid for ${bookingCode}`);
      return `${frontendUrl}/payment/callback?error=invalid_signature`;
    }

    try {
      const booking = await this.bookingsService.findByCode(bookingCode);
      const b = booking as any;

      if (responseCode === '00') {
        await this.bookingsService.updatePaymentStatus(
          b.id, 'paid', query.vnp_TransactionNo,
        );
        return `${frontendUrl}/booking/${b.id}/success`;
      } else {
        await this.bookingsService.updatePaymentStatus(b.id, 'failed');
        return `${frontendUrl}/payment/callback?error=${responseCode}&bookingCode=${bookingCode}`;
      }
    } catch {
      return `${frontendUrl}/payment/callback?error=booking_not_found`;
    }
  }

  /** IPN endpoint — VNPay server-to-server notification */
  async handleVnpayIpn(query: Record<string, string>): Promise<{ RspCode: string; Message: string }> {
    const { valid, responseCode } = this.vnpayService.verifyCallback(query);

    if (!valid) {
      return { RspCode: '97', Message: 'Invalid signature' };
    }

    const bookingCode = query.vnp_TxnRef;

    try {
      const booking = await this.bookingsService.findByCode(bookingCode);
      const b = booking as any;

      // Idempotency: skip if already processed
      if (b.paymentStatus === 'paid') {
        return { RspCode: '02', Message: 'Order already confirmed' };
      }

      if (responseCode === '00') {
        await this.bookingsService.updatePaymentStatus(
          b.id, 'paid', query.vnp_TransactionNo,
        );
        this.logger.log(`VNPay IPN: payment confirmed for ${bookingCode}`);
        return { RspCode: '00', Message: 'Confirm Success' };
      } else {
        await this.bookingsService.updatePaymentStatus(b.id, 'failed');
        return { RspCode: '00', Message: 'Confirm Success' };
      }
    } catch {
      return { RspCode: '01', Message: 'Order not found' };
    }
  }

  async findPaymentByBooking(bookingId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { bookingId } });
    if (!payment) throw new NotFoundException('Không tìm thấy thông tin thanh toán');
    return payment;
  }
}
