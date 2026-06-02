import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, Room } from '@prisma/client';
import { BaseRepository } from '../../../common/infrastructure/base.repository';

@Injectable()
export class RoomsRepository extends BaseRepository<
  Room,
  Prisma.RoomCreateInput,
  Prisma.RoomUpdateInput,
  Prisma.RoomWhereUniqueInput,
  Prisma.RoomWhereInput,
  Prisma.RoomOrderByWithRelationInput
> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService, prismaService.room as any);
  }

  readonly roomListSelect: Prisma.RoomSelect = {
    id: true,
    branchId: true,
    name: true,
    nameEn: true,
    roomNumber: true,
    floor: true,
    capacity: true,
    pricePerHour: true,
    pricePerHourOriginal: true,
    pricePerDay: true,
    pricePerDayOriginal: true,
    minHours: true,
    allowHourly: true,
    status: true,
    isFeatured: true,
    isGuestFavorite: true,
    ratingAvg: true,
    ratingCount: true,
    checkInTime: true,
    checkOutTime: true,
    createdAt: true,
    updatedAt: true,
    branch: { select: { id: true, name: true, city: true, address: true } },
    images: {
      select: { id: true, url: true, sortOrder: true, isCover: true },
      orderBy: { sortOrder: 'asc' },
    },
  };

  readonly roomDetailSelect: Prisma.RoomSelect = {
    ...this.roomListSelect,
    description: true,
    descriptionEn: true,
    extraHourPrice: true,
    extraPersonPrice: true,
    amenities: {
      select: {
        id: true,
        amenityId: true,
        isFeatured: true,
        isFree: true,
        price: true,
        amenity: {
          select: { id: true, name: true, nameEn: true, icon: true, category: true },
        },
      },
    },
    timeSlotSuggestions: {
      where: { isActive: true },
      select: {
        id: true, label: true, startTime: true, endTime: true,
        priceOverride: true, priceOriginal: true, dayOfWeek: true, isActive: true,
      },
    },
    cancellationPolicies: {
      select: {
        id: true, daysBefore: true, refundPercentage: true,
        description: true, descriptionEn: true,
      },
    },
  };

  async findBookingConflicts(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
    excludeBookingId?: string,
  ) {
    return this.prismaService.booking.findMany({
      where: {
        roomId,
        bookingStatus: { notIn: ['cancelled'] },
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        OR: [{ checkIn: { lt: checkOut }, checkOut: { gt: checkIn } }],
      },
      select: { id: true, bookingCode: true, checkIn: true, checkOut: true },
    });
  }

  async getTimeSlotsForDate(roomId: string, dayOfWeek: number) {
    return this.prismaService.timeSlotSuggestion.findMany({
      where: {
        roomId,
        isActive: true,
        OR: [{ dayOfWeek: null }, { dayOfWeek }],
      },
      orderBy: { startTime: 'asc' },
    });
  }
}
