import {
  Injectable, NotFoundException, BadRequestException,
  ConflictException, Inject, Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { VouchersRepository } from '../infrastructure/vouchers.repository';
import { CreateVoucherDto } from '../interface/dto/create-voucher.dto';
import { UpdateVoucherDto } from '../interface/dto/update-voucher.dto';
import { ValidateVoucherDto } from '../interface/dto/validate-voucher.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class VouchersService {
  private readonly logger = new Logger(VouchersService.name);
  private readonly listCacheKeys = new Set<string>();

  constructor(
    private readonly repository: VouchersRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(dto: CreateVoucherDto) {
    const existing = await this.repository.findFirst({ code: dto.code } as any);
    if (existing) throw new ConflictException(`Mã voucher "${dto.code}" đã tồn tại`);

    const voucher = await this.repository.create({
      code: dto.code,
      description: dto.description,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      maxDiscountAmount: dto.maxDiscountAmount,
      minBookingAmount: dto.minBookingAmount ?? 0,
      usageLimit: dto.usageLimit,
      validFrom: new Date(dto.validFrom),
      validUntil: new Date(dto.validUntil),
      isActive: dto.isActive ?? true,
    } as Prisma.VoucherCreateInput);

    await this.invalidateListCache();
    this.logger.log(`Voucher created: ${voucher.code}`);
    return voucher;
  }

  async findAll(query: PaginationDto) {
    const cacheKey = `vouchers_list_${JSON.stringify(query)}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const { page = 1, limit = 20 } = query;

    const [vouchers, total] = await this.repository.findAll({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const result = {
      items: vouchers,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };

    this.listCacheKeys.add(cacheKey);
    await this.cacheManager.set(cacheKey, result, 60000);
    return result;
  }

  async findOne(id: string) {
    const voucher = await this.repository.findOne({ id });
    if (!voucher) throw new NotFoundException(`Không tìm thấy voucher với ID: ${id}`);
    return voucher;
  }

  async update(id: string, dto: UpdateVoucherDto) {
    await this.findOne(id);
    const voucher = await this.repository.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.validFrom ? { validFrom: new Date(dto.validFrom) } : {}),
        ...(dto.validUntil ? { validUntil: new Date(dto.validUntil) } : {}),
      },
    });
    await this.cacheManager.del(`voucher_${id}`);
    await this.invalidateListCache();
    return voucher;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.remove({ id });
    await this.cacheManager.del(`voucher_${id}`);
    await this.invalidateListCache();
    return { id };
  }

  async findByCode(code: string) {
    return this.repository.findFirst({ code } as any);
  }

  /**
   * Validates a voucher code against a booking amount.
   * Returns discountAmount and finalAmount. Does NOT increment usedCount.
   * Call incrementUsedCount() separately when the booking is confirmed.
   */
  async validate(dto: ValidateVoucherDto) {
    const voucher = await this.findByCode(dto.code);

    if (!voucher || !voucher.isActive) {
      return { valid: false, discountAmount: 0, finalAmount: dto.bookingAmount, message: 'Mã voucher không hợp lệ hoặc đã hết hạn' };
    }

    const now = new Date();
    if (new Date(voucher.validFrom) > now) {
      return { valid: false, discountAmount: 0, finalAmount: dto.bookingAmount, message: 'Voucher chưa có hiệu lực' };
    }
    if (new Date(voucher.validUntil) < now) {
      return { valid: false, discountAmount: 0, finalAmount: dto.bookingAmount, message: 'Voucher đã hết hạn' };
    }
    if (voucher.usageLimit !== null && voucher.usedCount >= voucher.usageLimit) {
      return { valid: false, discountAmount: 0, finalAmount: dto.bookingAmount, message: 'Voucher đã hết lượt sử dụng' };
    }
    if (dto.bookingAmount < Number(voucher.minBookingAmount)) {
      return {
        valid: false, discountAmount: 0, finalAmount: dto.bookingAmount,
        message: `Đơn hàng tối thiểu ${Number(voucher.minBookingAmount).toLocaleString('vi-VN')}₫`,
      };
    }

    let discountAmount = 0;
    if (voucher.discountType === 'percentage') {
      discountAmount = (dto.bookingAmount * Number(voucher.discountValue)) / 100;
      if (voucher.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, Number(voucher.maxDiscountAmount));
      }
    } else {
      discountAmount = Math.min(Number(voucher.discountValue), dto.bookingAmount);
    }

    discountAmount = Math.round(discountAmount);

    return {
      valid: true,
      discountAmount,
      finalAmount: dto.bookingAmount - discountAmount,
      voucherId: voucher.id,
    };
  }

  async incrementUsedCount(id: string) {
    return this.repository.incrementUsedCount(id);
  }

  private async invalidateListCache() {
    await Promise.all([...this.listCacheKeys].map((k) => this.cacheManager.del(k)));
    this.listCacheKeys.clear();
  }
}
