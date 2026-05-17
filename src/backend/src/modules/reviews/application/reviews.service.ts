import {
  Injectable, NotFoundException, BadRequestException,
  ForbiddenException, ConflictException, Inject, Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { ReviewsRepository } from '../infrastructure/reviews.repository';
import { BookingsService } from '../../bookings/application/bookings.service';
import { CreateReviewDto } from '../interface/dto/create-review.dto';
import { ReviewQueryDto } from '../interface/dto/review-query.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);
  private readonly listCacheKeys = new Set<string>();

  constructor(
    private readonly repository: ReviewsRepository,
    private readonly bookingsService: BookingsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateReviewDto, userId: string) {
    // Guard: booking must belong to current user and be completed
    const booking = await this.bookingsService.findOne(dto.bookingId);
    const b = booking as any;

    if (b.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền đánh giá booking này');
    }
    if (b.bookingStatus !== 'completed') {
      throw new BadRequestException('Chỉ có thể đánh giá sau khi hoàn thành booking');
    }

    // Check: one review per booking
    const existing = await this.repository.findFirst({ bookingId: dto.bookingId });
    if (existing) {
      throw new ConflictException('Bạn đã đánh giá booking này rồi');
    }

    const review = await this.repository.createAndUpdateRating({
      booking:  { connect: { id: dto.bookingId } },
      user:     { connect: { id: userId } },
      room:     { connect: { id: b.roomId } },
      rating:   dto.rating,
      comment:  dto.comment,
      isVisible: true,
    });

    await this.invalidateRoomReviewCache(b.roomId);
    this.logger.log(`Review created: ${review.id} for room ${b.roomId}`);
    return review;
  }

  async findAll(query: ReviewQueryDto) {
    const cacheKey = `reviews_list_${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const {
      page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc',
      roomId, userId, rating, isVisible,
    } = query;

    const where: Prisma.ReviewWhereInput = {};
    if (roomId) where.roomId = roomId;
    if (userId) where.userId = userId;
    if (rating) where.rating = rating;
    if (isVisible !== undefined) where.isVisible = isVisible;

    const [reviews, total] = await this.repository.findAll({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: { [sortBy]: sortOrder } as Prisma.ReviewOrderByWithRelationInput,
      select: this.repository.reviewSelect,
    });

    const result = {
      items: reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    this.listCacheKeys.add(cacheKey);
    await this.cacheManager.set(cacheKey, result, 60000);
    return result;
  }

  async findByRoom(roomId: string, page = 1, limit = 10) {
    return this.findAll({ page, limit, roomId, isVisible: true } as ReviewQueryDto);
  }

  async setVisibility(id: string, isVisible: boolean) {
    const review = await this.repository.findOne({ id });
    if (!review) throw new NotFoundException(`Không tìm thấy đánh giá với ID: ${id}`);

    const updated = await this.repository.update({ where: { id }, data: { isVisible } });
    await this.invalidateRoomReviewCache(review.roomId);
    this.logger.log(`Review ${id} visibility → ${isVisible}`);
    return updated;
  }

  async remove(id: string) {
    const review = await this.repository.findOne({ id });
    if (!review) throw new NotFoundException(`Không tìm thấy đánh giá với ID: ${id}`);

    await this.repository.remove({ id });
    await this.invalidateRoomReviewCache(review.roomId);
    return { id };
  }

  private async invalidateRoomReviewCache(roomId: string) {
    await this.cacheManager.del(`room_${roomId}`);
    await Promise.all([...this.listCacheKeys].map((k) => this.cacheManager.del(k)));
    this.listCacheKeys.clear();
  }
}
