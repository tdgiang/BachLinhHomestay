import {
  Injectable, NotFoundException, BadRequestException,
  ForbiddenException, Inject, Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Prisma, BookingStatus, RoomStatus } from '@prisma/client';
import { BookingsRepository } from '../infrastructure/bookings.repository';
import { RoomsService } from '../../rooms/application/rooms.service';
import { VouchersService } from '../../vouchers/application/vouchers.service';
import { CreateBookingDto } from '../interface/dto/create-booking.dto';
import { CancelBookingDto } from '../interface/dto/cancel-booking.dto';
import { UpdateBookingStatusDto } from '../interface/dto/update-status.dto';
import { BookingQueryDto } from '../interface/dto/booking-query.dto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  private readonly listCacheKeys = new Set<string>();

  constructor(
    private readonly repository: BookingsRepository,
    private readonly roomsService: RoomsService,
    private readonly vouchersService: VouchersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateBookingDto, userId?: string) {
    // 1. Verify room is active
    const room = await this.roomsService.findOne(dto.roomId);
    if ((room as any).status !== RoomStatus.active) {
      throw new BadRequestException('Phòng hiện không nhận đặt');
    }

    // 2. Check availability
    const { available } = await this.roomsService.checkAvailability(
      dto.roomId, dto.checkIn, dto.checkOut,
    );
    if (!available) {
      throw new BadRequestException('Phòng đã được đặt trong khoảng thời gian này');
    }

    // 3. Calculate pricing
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);
    const diffMs = checkOut.getTime() - checkIn.getTime();

    let baseAmount: number;
    if (dto.bookingType === 'hourly') {
      if (!dto.numHours) throw new BadRequestException('numHours bắt buộc cho bookingType=hourly');
      const minHours = Number((room as any).minHours ?? 1);
      if (dto.numHours < minHours) {
        throw new BadRequestException(`Phòng này yêu cầu đặt tối thiểu ${minHours} giờ`);
      }
      baseAmount = Number((room as any).pricePerHour) * dto.numHours;
    } else {
      const nights = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      baseAmount = Number((room as any).pricePerDay) * Math.max(1, nights);
    }

    const numGuests = dto.numGuests ?? 1;
    const extraPersonPrice = Number((room as any).extraPersonPrice ?? 0);
    const extraAmount = Math.max(0, numGuests - 1) * extraPersonPrice;

    // 4. Validate voucher
    let discountAmount = 0;
    let voucherId: string | undefined;
    if (dto.voucherCode) {
      const result = await this.vouchersService.validate({
        code: dto.voucherCode,
        bookingAmount: baseAmount + extraAmount,
      });
      if (!result.valid) throw new BadRequestException(result.message);
      discountAmount = result.discountAmount;
      voucherId = result.voucherId;
    }

    const totalAmount = baseAmount + extraAmount - discountAmount;

    // 5. Generate booking code
    const bookingCode = `HMS-${Date.now().toString(36).toUpperCase()}`;

    // 6. Create booking + payment in transaction
    const bookingData: Prisma.BookingCreateInput = {
      bookingCode,
      room: { connect: { id: dto.roomId } },
      ...(userId ? { user: { connect: { id: userId } } } : {}),
      bookingType: dto.bookingType,
      checkIn,
      checkOut,
      numHours: dto.numHours,
      numGuests,
      guestName: dto.guestName,
      guestPhone: dto.guestPhone,
      guestEmail: dto.guestEmail,
      guestNote: dto.guestNote,
      baseAmount,
      discountAmount,
      extraAmount,
      totalAmount,
      ...(voucherId ? { voucher: { connect: { id: voucherId } } } : {}),
      voucherCode: dto.voucherCode,
      paymentMethod: dto.paymentMethod,
      paymentStatus: 'pending',
      bookingStatus: 'pending',
    };

    const booking = await this.repository.createWithPayment(bookingData, dto.paymentMethod);

    // 7. Increment voucher usedCount
    if (voucherId) {
      await this.vouchersService.incrementUsedCount(voucherId);
    }

    await this.invalidateListCache();
    await this.roomsService.invalidateAvailabilityCache();
    this.logger.log(`Booking created: ${bookingCode}`);
    return booking;
  }

  async findAll(query: BookingQueryDto) {
    const cacheKey = `bookings_list_${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const {
      page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc',
      roomId, userId, bookingStatus, paymentStatus, paymentMethod, fromDate, toDate,
    } = query;

    const where: Prisma.BookingWhereInput = {};
    if (roomId) where.roomId = roomId;
    if (userId) where.userId = userId;
    if (bookingStatus) where.bookingStatus = bookingStatus;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (fromDate || toDate) {
      where.checkIn = {
        ...(fromDate ? { gte: new Date(fromDate) } : {}),
        ...(toDate ? { lte: new Date(toDate) } : {}),
      };
    }

    const [bookings, total] = await this.repository.findAll({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: { [sortBy]: sortOrder } as Prisma.BookingOrderByWithRelationInput,
      select: this.repository.bookingWithRelations,
    });

    const result = {
      items: bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    this.listCacheKeys.add(cacheKey);
    await this.cacheManager.set(cacheKey, result, 30000);
    return result;
  }

  async findOne(id: string) {
    const booking = await this.repository.findOne({ id }, this.repository.bookingWithRelations);
    if (!booking) throw new NotFoundException(`Không tìm thấy booking với ID: ${id}`);
    return booking;
  }

  async findByCode(code: string) {
    const booking = await this.repository.findFirst(
      { bookingCode: code },
      this.repository.bookingWithRelations,
    );
    if (!booking) throw new NotFoundException(`Không tìm thấy booking với mã: ${code}`);
    return booking;
  }

  async findMyBookings(userId: string, query: BookingQueryDto) {
    return this.findAll({ ...query, userId });
  }

  async cancel(id: string, dto: CancelBookingDto, userId?: string, isAdmin = false) {
    const booking = await this.findOne(id);
    const b = booking as any;

    if (!isAdmin && b.userId && b.userId !== userId) {
      throw new ForbiddenException('Không có quyền hủy booking này');
    }

    if (!['pending', 'confirmed'].includes(b.bookingStatus)) {
      throw new BadRequestException(`Không thể hủy booking ở trạng thái ${b.bookingStatus}`);
    }

    const updated = await this.repository.update({
      where: { id },
      data: {
        bookingStatus: 'cancelled',
        cancelReason: dto.reason,
      },
    });

    await this.invalidateBookingCache(id);
    await this.roomsService.invalidateAvailabilityCache();
    this.logger.log(`Booking cancelled: ${id}`);
    return updated;
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    await this.findOne(id);
    const updated = await this.repository.update({
      where: { id },
      data: {
        bookingStatus: dto.bookingStatus,
        ...(dto.adminNote ? { adminNote: dto.adminNote } : {}),
      },
    });
    await this.invalidateBookingCache(id);
    await this.roomsService.invalidateAvailabilityCache();
    this.logger.log(`Booking status updated: ${id} → ${dto.bookingStatus}`);
    return updated;
  }

  async updatePaymentStatus(
    bookingId: string,
    paymentStatus: 'paid' | 'failed' | 'refunded',
    gatewayTxnId?: string,
  ) {
    await this.repository.update({
      where: { id: bookingId },
      data: {
        paymentStatus,
        ...(paymentStatus === 'paid' ? { bookingStatus: BookingStatus.confirmed } : {}),
      },
    });

    // Update payment record
    await (this.repository as any).prismaService.payment.updateMany({
      where: { bookingId },
      data: {
        status: paymentStatus,
        ...(gatewayTxnId ? { gatewayTxnId } : {}),
        ...(paymentStatus === 'paid' ? { paidAt: new Date() } : {}),
      },
    });

    await this.invalidateBookingCache(bookingId);
  }

  private async invalidateBookingCache(id: string) {
    await this.cacheManager.del(`booking_${id}`);
    await this.invalidateListCache();
  }

  private async invalidateListCache() {
    await Promise.all([...this.listCacheKeys].map((k) => this.cacheManager.del(k)));
    this.listCacheKeys.clear();
  }
}
