import { Module } from '@nestjs/common';
import { AmenitiesService } from './application/amenities.service';
import { AmenitiesRepository } from './infrastructure/amenities.repository';
import { AmenitiesController } from './interface/amenities.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AmenitiesController],
  providers: [AmenitiesService, AmenitiesRepository],
  exports: [AmenitiesService],
})
export class AmenitiesModule {}
