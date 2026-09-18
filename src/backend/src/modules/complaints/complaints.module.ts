import { Module } from '@nestjs/common';
import { ComplaintsService } from './application/complaints.service';
import { ComplaintsController } from './interface/complaints.controller';
import { ComplaintsRepository } from './infrastructure/complaints.repository';

@Module({
  controllers: [ComplaintsController],
  providers: [ComplaintsService, ComplaintsRepository],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}
