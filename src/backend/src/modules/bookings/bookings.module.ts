import { Module } from '@nestjs/common';
import { BookingsService } from './application/bookings.service';
import { BookingsController } from './interface/bookings.controller';
import { BookingsRepository } from './infrastructure/bookings.repository';
import { RoomsModule } from '../rooms/rooms.module';
import { VouchersModule } from '../vouchers/vouchers.module';

@Module({
  imports: [RoomsModule, VouchersModule],
  controllers: [BookingsController],
  providers: [BookingsService, BookingsRepository],
  exports: [BookingsService],
})
export class BookingsModule {}
