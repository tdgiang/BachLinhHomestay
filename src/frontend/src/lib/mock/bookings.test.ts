import { describe, expect, it } from 'vitest';
import { MOCK_BOOKINGS } from './bookings';
import { MOCK_BRANCHES } from './branches';

describe('MOCK_BOOKINGS nested room.branch', () => {
  it('matches the real branch name/address/city for each referenced branch id', () => {
    const byId = new Map(MOCK_BRANCHES.map((b) => [b.id, b]));

    for (const booking of MOCK_BOOKINGS) {
      const real = byId.get(booking.room.branch.id);
      expect(real, `unknown branch id ${booking.room.branch.id}`).toBeDefined();
      expect(booking.room.branch.name).toBe(real!.name);
      expect(booking.room.branch.address).toBe(real!.address);
      expect(booking.room.branch.city).toBe('Hà Nội');
    }
  });
});
