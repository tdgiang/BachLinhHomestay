import { describe, expect, it } from 'vitest';
import { MOCK_BRANCHES } from './branches';

const BANNED_LOCATIONS = ['Đà Nẵng', 'Hội An', 'Phú Quốc', 'Đà Lạt', 'Sài Gòn'];

describe('MOCK_BRANCHES', () => {
  it('has exactly 3 branches', () => {
    expect(MOCK_BRANCHES).toHaveLength(3);
  });

  it('places every branch in Hà Nội', () => {
    for (const branch of MOCK_BRANCHES) {
      expect(branch.city).toBe('Hà Nội');
    }
  });

  it('preserves the original branch ids referenced by rooms.ts and bookings.ts', () => {
    expect(MOCK_BRANCHES.map((b) => b.id)).toEqual([
      'branch-da-nang-001',
      'branch-da-nang-002',
      'branch-hoi-an-001',
    ]);
  });

  it('uses the real Ha Noi branch names', () => {
    expect(MOCK_BRANCHES.map((b) => b.name)).toEqual([
      'Ba.Li — Cầu Giấy',
      'Ba.Li — Đống Đa',
      'Ba.Li — Ba Đình',
    ]);
  });

  it('contains no mismatched sample-location copy in any field', () => {
    for (const branch of MOCK_BRANCHES) {
      const text = [branch.name, branch.nameEn, branch.address, branch.city, branch.description, branch.descriptionEn].join(' ');
      for (const banned of BANNED_LOCATIONS) {
        expect(text).not.toContain(banned);
      }
    }
  });
});
