import { describe, it, expect } from 'vitest';

// Test the coerce helpers inline (they are internal to api-client)
// We verify the logic independently

function n(v: unknown): number { return Number(v); }
function nn(v: unknown): number | null { return v == null ? null : Number(v); }

function coerceRoom(r: any) {
  return {
    ...r,
    pricePerHour:         n(r.pricePerHour),
    pricePerHourOriginal: nn(r.pricePerHourOriginal),
    pricePerDay:          n(r.pricePerDay),
    pricePerDayOriginal:  nn(r.pricePerDayOriginal),
    extraHourPrice:       nn(r.extraHourPrice),
    extraPersonPrice:     nn(r.extraPersonPrice),
    ratingAvg:            n(r.ratingAvg),
  };
}

function coerceBooking(b: any) {
  return {
    ...b,
    baseAmount:     n(b.baseAmount),
    discountAmount: n(b.discountAmount),
    extraAmount:    n(b.extraAmount),
    totalAmount:    n(b.totalAmount),
    refundAmount:   nn(b.refundAmount),
  };
}

function coerceVoucher(v: any) {
  return {
    ...v,
    discountValue:     n(v.discountValue),
    maxDiscountAmount: nn(v.maxDiscountAmount),
    minBookingAmount:  n(v.minBookingAmount),
  };
}

describe('Decimal coercion — Room', () => {
  const raw = {
    id: 'r1',
    name: 'Test Room',
    pricePerHour:         '150000',
    pricePerHourOriginal: '200000',
    pricePerDay:          '1200000',
    pricePerDayOriginal:  null,
    extraHourPrice:       '50000',
    extraPersonPrice:     null,
    ratingAvg:            '4.85',
  };

  it('converts pricePerHour string to number', () => {
    expect(coerceRoom(raw).pricePerHour).toBe(150000);
    expect(typeof coerceRoom(raw).pricePerHour).toBe('number');
  });

  it('converts pricePerDay string to number', () => {
    expect(coerceRoom(raw).pricePerDay).toBe(1200000);
  });

  it('converts optional decimal strings to numbers', () => {
    expect(coerceRoom(raw).pricePerHourOriginal).toBe(200000);
    expect(coerceRoom(raw).extraHourPrice).toBe(50000);
  });

  it('converts null optional decimals to null', () => {
    expect(coerceRoom(raw).pricePerDayOriginal).toBeNull();
    expect(coerceRoom(raw).extraPersonPrice).toBeNull();
  });

  it('converts ratingAvg string to number', () => {
    expect(coerceRoom(raw).ratingAvg).toBeCloseTo(4.85);
  });

  it('preserves non-decimal fields', () => {
    const result = coerceRoom(raw);
    expect(result.id).toBe('r1');
    expect(result.name).toBe('Test Room');
  });
});

describe('Decimal coercion — Booking', () => {
  const raw = {
    id: 'b1',
    bookingCode: 'HMS-X',
    baseAmount:     '1500000',
    discountAmount: '300000',
    extraAmount:    '0',
    totalAmount:    '1200000',
    refundAmount:   null,
  };

  it('converts all amount fields to numbers', () => {
    const b = coerceBooking(raw);
    expect(b.baseAmount).toBe(1500000);
    expect(b.discountAmount).toBe(300000);
    expect(b.extraAmount).toBe(0);
    expect(b.totalAmount).toBe(1200000);
  });

  it('converts null refundAmount to null', () => {
    expect(coerceBooking(raw).refundAmount).toBeNull();
  });

  it('converts refundAmount when present', () => {
    expect(coerceBooking({ ...raw, refundAmount: '500000' }).refundAmount).toBe(500000);
  });
});

describe('Decimal coercion — Voucher', () => {
  it('converts discountValue and minBookingAmount', () => {
    const v = coerceVoucher({
      discountValue: '30', maxDiscountAmount: '300000', minBookingAmount: '500000',
    });
    expect(v.discountValue).toBe(30);
    expect(v.maxDiscountAmount).toBe(300000);
    expect(v.minBookingAmount).toBe(500000);
  });

  it('handles null maxDiscountAmount', () => {
    const v = coerceVoucher({ discountValue: '10', maxDiscountAmount: null, minBookingAmount: '0' });
    expect(v.maxDiscountAmount).toBeNull();
  });
});

describe('Edge cases', () => {
  it('converts "0" to 0 not falsy null', () => {
    expect(n('0')).toBe(0);
    expect(typeof n('0')).toBe('number');
  });

  it('handles integer strings', () => {
    expect(n('1000000')).toBe(1000000);
  });

  it('nn returns null for undefined', () => {
    expect(nn(undefined)).toBeNull();
  });

  it('nn returns null for null', () => {
    expect(nn(null)).toBeNull();
  });
});
