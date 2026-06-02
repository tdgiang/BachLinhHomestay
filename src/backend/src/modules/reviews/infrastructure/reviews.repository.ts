import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, Review } from '@prisma/client';
import { BaseRepository } from '../../../common/infrastructure/base.repository';

@Injectable()
export class ReviewsRepository extends BaseRepository<
  Review,
  Prisma.ReviewCreateInput,
  Prisma.ReviewUpdateInput,
  Prisma.ReviewWhereUniqueInput,
  Prisma.ReviewWhereInput,
  Prisma.ReviewOrderByWithRelationInput
> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService, prismaService.review as any);
  }

  readonly reviewSelect: Prisma.ReviewSelect = {
    id: true,
    bookingId: true,
    userId: true,
    roomId: true,
    rating: true,
    comment: true,
    isVisible: true,
    createdAt: true,
    user: { select: { id: true, fullName: true, email: true } },
    room: { select: { id: true, name: true, roomNumber: true } },
  };

  /**
   * Creates a review and atomically updates Room.ratingAvg + ratingCount
   * in a single Prisma transaction.
   */
  async createAndUpdateRating(data: Prisma.ReviewCreateInput): Promise<Review> {
    return this.prismaService.$transaction(async (tx) => {
      const review = await tx.review.create({ data });

      // Recompute avg & count from scratch (accurate even after deletes/edits)
      const { _avg, _count } = await tx.review.aggregate({
        where: { roomId: review.roomId, isVisible: true },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.room.update({
        where: { id: review.roomId },
        data: {
          ratingAvg: _avg.rating ?? 0,
          ratingCount: _count.rating,
        },
      });

      return review;
    });
  }
}
