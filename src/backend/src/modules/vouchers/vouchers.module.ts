import { Module } from '@nestjs/common';
import { VouchersService } from './application/vouchers.service';
import { VouchersController } from './interface/vouchers.controller';
import { VouchersRepository } from './infrastructure/vouchers.repository';

@Module({
  controllers: [VouchersController],
  providers: [VouchersService, VouchersRepository],
  exports: [VouchersService],
})
export class VouchersModule {}
