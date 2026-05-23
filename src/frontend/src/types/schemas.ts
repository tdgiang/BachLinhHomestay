/**
 * Zod schemas for runtime API response validation.
 * All Decimal fields coerced to number (Prisma serializes Decimal as string).
 */
import { z } from 'zod';

const decimal = z.coerce.number();
// null/undefined → null; string/number → Number(v)
const decimalNull = z.preprocess(
  (v) => (v == null ? null : Number(v)),
  z.number().nullable(),
).optional();

// ─── Branch ──────────────────────────────────────────────────────────────────

export const BranchSchema = z.object({
  id:            z.string(),
  name:          z.string(),
  nameEn:        z.string().nullable().optional(),
  address:       z.string(),
  city:          z.string(),
  latitude:      decimalNull,
  longitude:     decimalNull,
  phone:         z.string().nullable().optional(),
  description:   z.string().nullable().optional(),
  descriptionEn: z.string().nullable().optional(),
  isActive:      z.boolean(),
  createdAt:     z.string(),
  updatedAt:     z.string(),
});

// ─── Room ─────────────────────────────────────────────────────────────────────

const RoomImageSchema = z.object({
  id:        z.string().optional(),
  url:       z.string(),
  sortOrder: z.number().optional(),
  isCover:   z.boolean().optional(),
});

const RoomAmenitySchema = z.object({
  id:        z.string(),
  name:      z.string(),
  nameEn:    z.string().nullable().optional(),
  icon:      z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  isFree:    z.boolean(),
  price:     decimalNull,
});

const TimeSlotSchema = z.object({
  id:            z.string(),
  label:         z.string(),
  startTime:     z.string(),
  endTime:       z.string(),
  priceOverride: decimalNull,
  priceOriginal: decimalNull,
  dayOfWeek:     z.number().nullable().optional(),
  isActive:      z.boolean().optional(),
});

const CancellationPolicySchema = z.object({
  id:               z.string(),
  daysBefore:       z.number(),
  refundPercentage: z.number(),
  description:      z.string().nullable().optional(),
  descriptionEn:    z.string().nullable().optional(),
});

export const RoomSchema = z.object({
  id:                   z.string(),
  branchId:             z.string(),
  name:                 z.string(),
  nameEn:               z.string().nullable().optional(),
  description:          z.string().nullable().optional(),
  descriptionEn:        z.string().nullable().optional(),
  roomNumber:           z.string(),
  floor:                z.number().nullable().optional(),
  capacity:             z.number(),
  pricePerHour:         decimal,
  pricePerHourOriginal: decimalNull,
  pricePerDay:          decimal,
  pricePerDayOriginal:  decimalNull,
  minHours:             z.number(),
  extraHourPrice:       decimalNull,
  extraPersonPrice:     decimalNull,
  checkInTime:          z.string(),
  checkOutTime:         z.string(),
  allowHourly:          z.boolean(),
  status:               z.enum(['active', 'maintenance', 'inactive']),
  isFeatured:           z.boolean(),
  isGuestFavorite:      z.boolean(),
  ratingAvg:            decimal,
  ratingCount:          z.number(),
  createdAt:            z.string(),
  updatedAt:            z.string(),
  branch:               BranchSchema.pick({ id: true, name: true, city: true, address: true }).optional(),
  images:               z.array(RoomImageSchema).optional(),
  amenities:            z.array(RoomAmenitySchema).optional(),
  timeSlotSuggestions:  z.array(TimeSlotSchema).optional(),
  cancellationPolicies: z.array(CancellationPolicySchema).optional(),
});

// ─── Booking ──────────────────────────────────────────────────────────────────

export const BookingSchema = z.object({
  id:             z.string(),
  bookingCode:    z.string(),
  roomId:         z.string(),
  userId:         z.string().nullable().optional(),
  bookingType:    z.enum(['hourly', 'daily']),
  checkIn:        z.string(),
  checkOut:       z.string(),
  numHours:       z.number().nullable().optional(),
  numGuests:      z.number(),
  guestName:      z.string(),
  guestPhone:     z.string(),
  guestEmail:     z.string().nullable().optional(),
  guestNote:      z.string().nullable().optional(),
  baseAmount:     decimal,
  discountAmount: decimal,
  extraAmount:    decimal,
  totalAmount:    decimal,
  voucherId:      z.string().nullable().optional(),
  voucherCode:    z.string().nullable().optional(),
  paymentMethod:  z.enum(['vnpay', 'cash']),
  paymentStatus:  z.enum(['pending', 'paid', 'failed', 'refunded']),
  bookingStatus:  z.enum(['pending', 'confirmed', 'checked_in', 'completed', 'cancelled']),
  cancelReason:   z.string().nullable().optional(),
  refundAmount:   decimalNull,
  adminNote:      z.string().nullable().optional(),
  createdAt:      z.string(),
  updatedAt:      z.string(),
});

// ─── Paginated result helper ──────────────────────────────────────────────────

export const PaginatedMeta = z.object({
  total:      z.number(),
  page:       z.number(),
  limit:      z.number(),
  totalPages: z.number(),
});

export function paginatedSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({ items: z.array(itemSchema), meta: PaginatedMeta });
}
