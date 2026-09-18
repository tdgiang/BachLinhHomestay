import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../..'); // src/frontend
// Quét cả backend: dữ liệu seed từng tạo chi nhánh ở Phú Quốc, Đà Lạt và
// TP. Hồ Chí Minh trong khi trang Điều khoản công bố nền tảng chỉ cung cấp
// dịch vụ tại Hà Nội. Guard cũ chỉ quét frontend nên không thấy.
const SCAN_DIRS = ['src', 'messages', '../backend/src', '../backend/prisma'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.json']);

// Vietnamese diacritic forms and their common ASCII/English transliterations.
const BANNED = [
  'Đà Nẵng', 'Da Nang',
  'Hội An', 'Hoi An',
  'Phú Quốc', 'Phu Quoc',
  'Đà Lạt', 'Da Lat',
  'Sài Gòn', 'Sai Gon',
];

/**
 * File có lý do chính đáng để chứa các địa danh trên: chúng dùng tên đó làm dữ
 * liệu nhận diện chứ không phải nội dung hiển thị cho người dùng.
 */
const ALLOWLIST = ['hide-demo-branches.ts'];

function listFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') return [];
      return listFiles(full);
    }
    // Test files legitimately reference these banned strings as fixtures/comparisons.
    if (entry.name.includes('.test.')) return [];
    if (ALLOWLIST.includes(entry.name)) return [];
    return EXTENSIONS.has(path.extname(entry.name)) ? [full] : [];
  });
}

describe('no mismatched sample-location content (ND 248 CR-02 regression guard)', () => {
  it('contains no banned location references anywhere under src/ or messages/', () => {
    const offenders: string[] = [];
    for (const dir of SCAN_DIRS) {
      const fullDir = path.join(ROOT, dir);
      if (!fs.existsSync(fullDir)) continue;
      for (const file of listFiles(fullDir)) {
        const content = fs.readFileSync(file, 'utf-8');
        for (const banned of BANNED) {
          if (content.includes(banned)) {
            offenders.push(`${path.relative(ROOT, file)}: "${banned}"`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
