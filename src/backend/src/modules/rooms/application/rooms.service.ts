import {
  Injectable, NotFoundException, BadRequestException, Inject, Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Prisma, RoomStatus, BookingType } from '@prisma/client';
import { RoomsRepository } from '../infrastructure/rooms.repository';
import { CreateRoomDto } from '../interface/dto/create-room.dto';
import { UpdateRoomDto } from '../interface/dto/update-room.dto';
import { RoomQueryDto } from '../interface/dto/room-query.dto';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);
  private readonly listCacheKeys = new Set<string>();

  constructor(
    private readonly repository: RoomsRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateRoomDto) {
    const room = await this.repository.create({
      branch: { connect: { id: dto.branchId } },
      name: dto.name,
      nameEn: dto.nameEn,
      description: dto.description,
      descriptionEn: dto.descriptionEn,
      roomNumber: dto.roomNumber,
      floor: dto.floor,
      capacity: dto.capacity ?? 2,
      pricePerHour: dto.pricePerHour,
      pricePerHourOriginal: dto.pricePerHourOriginal,
      pricePerDay: dto.pricePerDay,
      pricePerDayOriginal: dto.pricePerDayOriginal,
      minHours: dto.minHours ?? 2,
      extraHourPrice: dto.extraHourPrice,
      extraPersonPrice: dto.extraPersonPrice,
      checkInTime: dto.checkInTime ?? '14:00',
      checkOutTime: dto.checkOutTime ?? '11:00',
      allowHourly: dto.allowHourly ?? true,
      status: dto.status ?? RoomStatus.active,
      isFeatured: dto.isFeatured ?? false,
      isGuestFavorite: dto.isGuestFavorite ?? false,
    });
    await this.invalidateListCache();
    this.logger.log(`Room created: ${room.id}`);
    return room;
  }

  async findAll(query: RoomQueryDto) {
    const cacheKey = `rooms_list_${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const {
      page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc',
      branchId, type, status, search, priceMax, priceMin, isFeatured, isGuestFavorite,
    } = query;

    const where: Prisma.RoomWhereInput = { deletedAt: null };

    if (branchId) where.branchId = branchId;
    if (status) where.status = status;
    else where.status = RoomStatus.active; // default: only active rooms for public
    if (type === BookingType.hourly) where.allowHourly = true;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isGuestFavorite !== undefined) where.isGuestFavorite = isGuestFavorite;
    if (priceMax !== undefined) where.pricePerDay = { lte: priceMax };
    if (priceMin !== undefined) {
      where.pricePerDay = { ...(where.pricePerDay as object), gte: priceMin };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [rooms, total] = await this.repository.findAll({
      skip: (page - 1) * limit,
      take: limit,
      where,
      orderBy: { [sortBy]: sortOrder } as Prisma.RoomOrderByWithRelationInput,
      select: this.repository.roomListSelect,
    });

    const result = {
      items: rooms,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    this.listCacheKeys.add(cacheKey);
    await this.cacheManager.set(cacheKey, result, 60000);
    return result;
  }

  async findOne(id: string) {
    const cacheKey = `room_${id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const room = await this.repository.findOne({ id }, this.repository.roomDetailSelect);
    if (!room || (room as any).deletedAt) {
      throw new NotFoundException(`Không tìm thấy phòng với ID: ${id}`);
    }

    await this.cacheManager.set(cacheKey, room, 60000);
    return room;
  }

  async update(id: string, dto: UpdateRoomDto) {
    await this.findOne(id);
    const { branchId, ...rest } = dto;
    const data: Prisma.RoomUpdateInput = { ...rest };
    if (branchId) data.branch = { connect: { id: branchId } };

    const room = await this.repository.update({ where: { id }, data });
    await this.invalidateRoomCache(id);
    this.logger.log(`Room updated: ${id}`);
    return room;
  }

  async remove(id: string) {
    await this.findOne(id);
    const room = await this.repository.softRemove({ id });
    await this.invalidateRoomCache(id);
    this.logger.log(`Room soft-deleted: ${id}`);
    return room;
  }

  async checkAvailability(id: string, checkIn: string, checkOut: string) {
    await this.findOne(id); // ensure exists
    const conflicts = await this.repository.findBookingConflicts(
      id,
      new Date(checkIn),
      new Date(checkOut),
    );
    return {
      available: conflicts.length === 0,
      conflicts,
    };
  }

  async getTimeSlots(id: string, date: string) {
    await this.findOne(id);
    const dayOfWeek = new Date(date).getDay(); // 0=Sun, 1=Mon, ...
    return this.repository.getTimeSlotsForDate(id, dayOfWeek);
  }

  private async invalidateRoomCache(id: string) {
    await this.cacheManager.del(`room_${id}`);
    await this.invalidateListCache();
  }

  private async invalidateListCache() {
    await Promise.all([...this.listCacheKeys].map((k) => this.cacheManager.del(k)));
    this.listCacheKeys.clear();
  }
}
