import { describe, it, expect } from 'vitest';
import { RoomSchema, BookingSchema, BranchSchema, paginatedSchema } from '@/types/schemas';

describe('BranchSchema', () => {
  const validBranch = {
    id: 'b1', name: 'Test Branch', address: '123 St', city: 'DN',
    isActive: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  };

  it('parses a valid branch', () => {
    expect(() => BranchSchema.parse(validBranch)).not.toThrow();
  });

  it('coerces latitude string to number', () => {
    const result = BranchSchema.parse({ ...validBranch, latitude: '16.0544' });
    expect(typeof result.latitude).toBe('number');
    expect(result.latitude).toBeCloseTo(16.0544);
  });

  it('accepts null latitude', () => {
    const result = BranchSchema.parse({ ...validBranch, latitude: null });
    expect(result.latitude).toBeNull();
  });

  it('fails without required field name', () => {
    expect(() => BranchSchema.parse({ ...validBranch, name: undefined })).toThrow();
  });
});

describe('RoomSchema', () => {
  const validRoom = {
    id: 'r1', branchId: 'b1', name: 'Deluxe Room', roomNumber: '101',
    floor: 1, capacity: 2,
    pricePerHour: '150000', pricePerDay: '1200000',
    minHours: 2, allowHourly: true, status: 'active',
    isFeatured: false, isGuestFavorite: false,
    ratingAvg: '4.8', ratingCount: 10,
    checkInTime: '14:00', checkOutTime: '11:00',
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  };

  it('parses a valid room and coerces decimals', () => {
    const result = RoomSchema.parse(validRoom);
    expect(typeof result.pricePerHour).toBe('number');
    expect(result.pricePerHour).toBe(150000);
    expect(result.ratingAvg).toBeCloseTo(4.8);
  });

  it('rejects invalid status enum', () => {
    expect(() => RoomSchema.parse({ ...validRoom, status: 'unknown' })).toThrow();
  });

  it('accepts valid status values', () => {
    for (const s of ['active', 'maintenance', 'inactive']) {
      expect(() => RoomSchema.parse({ ...validRoom, status: s })).not.toThrow();
    }
  });

  it('coerces numeric pricePerDay correctly', () => {
    const result = RoomSchema.parse({ ...validRoom, pricePerDay: '999999' });
    expect(result.pricePerDay).toBe(999999);
  });
});

describe('BookingSchema', () => {
  const validBooking = {
    id: 'bk1', bookingCode: 'HMS-ABC',
    roomId: 'r1', bookingType: 'daily',
    checkIn: '2026-07-01T14:00:00Z', checkOut: '2026-07-03T11:00:00Z',
    numGuests: 2, guestName: 'Test', guestPhone: '0901',
    baseAmount: '1200000', discountAmount: '0',
    extraAmount: '0', totalAmount: '1200000',
    paymentMethod: 'cash', paymentStatus: 'pending',
    bookingStatus: 'confirmed',
    createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z',
  };

  it('parses valid booking and coerces amounts', () => {
    const result = BookingSchema.parse(validBooking);
    expect(result.baseAmount).toBe(1200000);
    expect(result.discountAmount).toBe(0);
    expect(result.totalAmount).toBe(1200000);
  });

  it('rejects invalid bookingStatus', () => {
    expect(() => BookingSchema.parse({ ...validBooking, bookingStatus: 'unknown' })).toThrow();
  });

  it('accepts all valid booking statuses', () => {
    const statuses = ['pending','confirmed','checked_in','completed','cancelled'];
    for (const s of statuses) {
      expect(() => BookingSchema.parse({ ...validBooking, bookingStatus: s })).not.toThrow();
    }
  });

  it('accepts all valid payment methods', () => {
    for (const m of ['vnpay', 'cash']) {
      expect(() => BookingSchema.parse({ ...validBooking, paymentMethod: m })).not.toThrow();
    }
  });
});

describe('paginatedSchema', () => {
  it('validates a paginated result', () => {
    const schema = paginatedSchema(BranchSchema);
    const data = {
      items: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
    expect(() => schema.parse(data)).not.toThrow();
  });
});
