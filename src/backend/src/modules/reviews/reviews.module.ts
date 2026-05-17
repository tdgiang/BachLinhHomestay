import { Module } from '@nestjs/common';
import { ReviewsService } from './application/reviews.service';
import { ReviewsController } from './interface/reviews.controller';
import { ReviewsRepository } from './infrastructure/reviews.repository';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [BookingsModule],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsService],
})
export class ReviewsModule {}
