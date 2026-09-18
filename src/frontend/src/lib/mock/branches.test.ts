import { describe, expect, it } from 'vitest';
import { MOCK_BRANCHES } from './branches';
import { BRANCHES } from '@/lib/legal';

const BANNED_LOCATIONS = ['Đà Nẵng', 'Hội An', 'Phú Quốc', 'Đà Lạt', 'Sài Gòn'];

describe('MOCK_BRANCHES', () => {
  it('chỉ có đúng một chi nhánh, khớp thực tế vận hành', () => {
    // Ba.Li Homestay hiện chỉ vận hành cơ sở Cầu Giấy. Con số này cũng là nội
    // dung công bố theo Điều 9b NĐ 248 (phạm vi địa lý cung cấp dịch vụ).
    expect(MOCK_BRANCHES).toHaveLength(1);
  });

  it('places every branch in Hà Nội', () => {
    for (const branch of MOCK_BRANCHES) {
      expect(branch.city).toBe('Hà Nội');
    }
  });

  it('id chi nhánh không mang tên địa phương đã bỏ', () => {
    // Trước đây id vẫn là 'branch-da-nang-001' dù chi nhánh ở Hà Nội.
    for (const branch of MOCK_BRANCHES) {
      for (const banned of ['da-nang', 'hoi-an', 'phu-quoc', 'da-lat']) {
        expect(branch.id, branch.id).not.toContain(banned);
      }
    }
  });

  it('uses the real Ha Noi branch names', () => {
    expect(MOCK_BRANCHES.map((b) => b.name)).toEqual(['Ba.Li — Cầu Giấy']);
  });

  it('khớp với BRANCHES công bố trong legal.ts', () => {
    expect(MOCK_BRANCHES).toHaveLength(BRANCHES.length);
    for (const [i, branch] of MOCK_BRANCHES.entries()) {
      expect(branch.name).toContain(BRANCHES[i].name);
    }
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
