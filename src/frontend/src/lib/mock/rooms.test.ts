import { describe, expect, it } from 'vitest';
import { MOCK_ROOMS } from './rooms';
import { MOCK_BRANCHES } from './branches';

const BANNED_LOCATIONS = [
  'Đà Nẵng', 'Hội An', 'Phú Quốc', 'Đà Lạt', 'Sài Gòn',
  'Bach Dang', 'Bạch Đằng', 'My Khe', 'Mỹ Khê', 'Hoi An',
];

function roomText(room: (typeof MOCK_ROOMS)[number]): string {
  const parts = [room.name, room.nameEn, room.description, room.descriptionEn];
  for (const a of room.amenities) {
    parts.push(a.amenity.name, a.amenity.nameEn);
  }
  for (const t of room.timeSlotSuggestions) {
    parts.push(t.label);
  }
  return parts.join(' ');
}

describe('MOCK_ROOMS', () => {
  it('every room links to a real Ha Noi branch', () => {
    const validBranchIds = new Set(MOCK_BRANCHES.map((b) => b.id));
    for (const room of MOCK_ROOMS) {
      expect(validBranchIds.has(room.branchId)).toBe(true);
      expect(room.branch.city).toBe('Hà Nội');
    }
  });

  it('contains no mismatched sample-location or sea-view copy', () => {
    for (const room of MOCK_ROOMS) {
      const text = roomText(room);
      for (const banned of BANNED_LOCATIONS) {
        expect(text).not.toContain(banned);
      }
    }
  });
});
