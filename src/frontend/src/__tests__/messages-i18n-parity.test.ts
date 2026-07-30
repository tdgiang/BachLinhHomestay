import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vi from '../../messages/vi.json';
import en from '../../messages/en.json';

function collectKeyPaths(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
    collectKeyPaths(value, prefix ? `${prefix}.${key}` : key),
  );
}

describe('i18n message key parity (vi.json vs en.json)', () => {
  it('both files exist at the expected path', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../../messages/vi.json'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../../messages/en.json'))).toBe(true);
  });

  it('every key path in vi.json also exists in en.json (and vice versa)', () => {
    const viKeys = collectKeyPaths(vi).sort();
    const enKeys = collectKeyPaths(en).sort();
    expect(viKeys).toEqual(enKeys);
  });

  it('footer namespace has the legal representative and business registration keys in both locales', () => {
    const required = ['legalRepLabel', 'legalRepName', 'legalRepTitle', 'bizRegLabel', 'bizRegDate', 'bizRegIssuer'];
    for (const key of required) {
      expect(vi.footer, `vi.footer.${key}`).toHaveProperty(key);
      expect(en.footer, `en.footer.${key}`).toHaveProperty(key);
    }
  });
});
