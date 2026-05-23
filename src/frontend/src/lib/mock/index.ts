export { MOCK_BRANCHES } from './branches';
export { MOCK_ROOMS } from './rooms';
export { MOCK_BOOKINGS } from './bookings';
export { MOCK_VOUCHERS } from './vouchers';
export { MOCK_REVIEWS } from './reviews';

import type { Room, RoomQuery, ValidateVoucherDto, ValidateVoucherResult, PaginatedResult } from '@/types';
import { MOCK_ROOMS } from './rooms';
import { MOCK_BRANCHES } from './branches';
import { MOCK_BOOKINGS } from './bookings';
import { MOCK_VOUCHERS } from './vouchers';
import { MOCK_REVIEWS } from './reviews';

export const mockDelay = <T>(data: T, ms = 250): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export function filterMockRooms(query: RoomQuery): PaginatedResult<Room> {
  let filtered = [...MOCK_ROOMS];

  if (query.branchId) filtered = filtered.filter((r) => r.branchId === query.branchId);
  if (query.type === 'hourly') filtered = filtered.filter((r) => r.allowHourly);
  if (query.priceMax) filtered = filtered.filter((r) => r.pricePerDay <= query.priceMax!);
  if (query.isFeatured) filtered = filtered.filter((r) => r.isFeatured);
  if (query.search) {
    const q = query.search.toLowerCase();
    filtered = filtered.filter((r) => r.name.toLowerCase().includes(q));
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 12;
  const total = filtered.length;
  const items = filtered.slice((page - 1) * limit, page * limit);

  return { items, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export function findMockRoom(id: string): Room | null {
  return MOCK_ROOMS.find((r) => r.id === id) ?? null;
}

export function validateMockVoucher(dto: ValidateVoucherDto): ValidateVoucherResult {
  const voucher = MOCK_VOUCHERS.find((v) => v.code === dto.code);

  if (!voucher || !voucher.isActive) {
    return { valid: false, discountAmount: 0, finalAmount: dto.bookingAmount, message: 'Mã không hợp lệ hoặc đã hết hạn' };
  }

  const now = new Date();
  if (new Date(voucher.validFrom) > now || new Date(voucher.validUntil) < now) {
    return { valid: false, discountAmount: 0, finalAmount: dto.bookingAmount, message: 'Voucher đã hết hạn' };
  }

  if (dto.bookingAmount < voucher.minBookingAmount) {
    return { valid: false, discountAmount: 0, finalAmount: dto.bookingAmount, message: `Đơn tối thiểu ${voucher.minBookingAmount.toLocaleString('vi-VN')}₫` };
  }

  let discountAmount = 0;
  if (voucher.discountType === 'percentage') {
    discountAmount = (dto.bookingAmount * voucher.discountValue) / 100;
    if (voucher.maxDiscountAmount) discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
  } else {
    discountAmount = Math.min(voucher.discountValue, dto.bookingAmount);
  }

  return { valid: true, discountAmount, finalAmount: dto.bookingAmount - discountAmount };
}

export { MOCK_BRANCHES as mockBranches, MOCK_ROOMS as mockRooms, MOCK_BOOKINGS as mockBookings, MOCK_VOUCHERS as mockVouchers, MOCK_REVIEWS as mockReviews };
