import { Module } from '@nestjs/common';
import { PaymentsService } from './application/payments.service';
import { PaymentsController } from './interface/payments.controller';
import { VnpayService } from './application/vnpay.service';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [BookingsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, VnpayService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
