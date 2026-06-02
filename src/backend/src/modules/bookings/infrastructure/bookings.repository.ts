import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, Booking } from '@prisma/client';
import { BaseRepository } from '../../../common/infrastructure/base.repository';

@Injectable()
export class BookingsRepository extends BaseRepository<
  Booking,
  Prisma.BookingCreateInput,
  Prisma.BookingUpdateInput,
  Prisma.BookingWhereUniqueInput,
  Prisma.BookingWhereInput,
  Prisma.BookingOrderByWithRelationInput
> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService, prismaService.booking as any);
  }

  readonly bookingWithRelations: Prisma.BookingSelect = {
    id: true,
    bookingCode: true,
    roomId: true,
    userId: true,
    bookingType: true,
    checkIn: true,
    checkOut: true,
    numHours: true,
    numGuests: true,
    guestName: true,
    guestPhone: true,
    guestEmail: true,
    guestNote: true,
    baseAmount: true,
    discountAmount: true,
    extraAmount: true,
    totalAmount: true,
    voucherId: true,
    voucherCode: true,
    paymentMethod: true,
    paymentStatus: true,
    bookingStatus: true,
    cancelReason: true,
    refundAmount: true,
    adminNote: true,
    createdAt: true,
    updatedAt: true,
    room: {
      select: {
        id: true, name: true, roomNumber: true, checkInTime: true, checkOutTime: true,
        branch: { select: { id: true, name: true, address: true, city: true } },
        images: { where: { isCover: true }, select: { url: true, isCover: true }, take: 1 },
      },
    },
    payment: {
      select: { id: true, gateway: true, gatewayTxnId: true, status: true, paidAt: true, amount: true },
    },
  };

  /** Creates booking + payment atomically in a transaction */
  async createWithPayment(
    bookingData: Prisma.BookingCreateInput,
    paymentGateway: 'vnpay' | 'cash',
  ) {
    return this.prismaService.$transaction(async (tx) => {
      const booking = await tx.booking.create({ data: bookingData, include: { payment: true } });

      await tx.payment.create({
        data: {
          booking: { connect: { id: booking.id } },
          gateway: paymentGateway,
          amount: bookingData.totalAmount as number,
          status: 'pending',
        },
      });

      return tx.booking.findUnique({
        where: { id: booking.id },
        select: this.bookingWithRelations,
      });
    });
  }
}
