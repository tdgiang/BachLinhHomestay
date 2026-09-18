import { describe, expect, it } from 'vitest';
import { MOCK_BOOKINGS } from './bookings';
import { MOCK_BRANCHES } from './branches';

describe('MOCK_BOOKINGS nested room.branch', () => {
  it('matches the real branch name/address/city for each referenced branch id', () => {
    const byId = new Map(MOCK_BRANCHES.map((b) => [b.id, b]));

    for (const booking of MOCK_BOOKINGS) {
      // room/branch là optional trong type Booking nên phải khẳng định trước
      // khi truy cập — cũng chính là điều test này muốn kiểm: mock phải đầy đủ.
      const nested = booking.room;
      expect(nested, `booking ${booking.bookingCode} thiếu room`).toBeDefined();
      const branch = nested!.branch;
      expect(branch, `booking ${booking.bookingCode} thiếu room.branch`).toBeDefined();

      const real = byId.get(branch!.id);
      expect(real, `unknown branch id ${branch!.id}`).toBeDefined();
      expect(branch!.name).toBe(real!.name);
      expect(branch!.address).toBe(real!.address);
      expect(branch!.city).toBe('Hà Nội');
    }
  });
});
