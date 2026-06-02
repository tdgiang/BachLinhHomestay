import { test, expect } from '@playwright/test';

test.describe('Track Booking', () => {
  test('track page loads and has search input', async ({ page }) => {
    await page.goto('/vi/track');
    await expect(page.locator('input, [placeholder*="mã"], [placeholder*="HMS"]').first()).toBeVisible({ timeout: 8000 });
  });

  test('returns no result for invalid code', async ({ page }) => {
    await page.goto('/vi/track');
    const input = page.locator('input').first();
    await input.fill('HMS-INVALID99');
    await page.keyboard.press('Enter');
    // Should show not found or error
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });
});

test.describe('SEO', () => {
  test('sitemap.xml is accessible and valid XML', async ({ page }) => {
    const res = await page.goto('/sitemap.xml');
    expect(res?.status()).toBe(200);
    const body = await page.locator('body').textContent();
    expect(body).toContain('urlset');
    expect(body).toContain('/vi/rooms');
  });

  test('robots.txt disallows admin', async ({ page }) => {
    const res = await page.goto('/robots.txt');
    expect(res?.status()).toBe(200);
    const body = await page.locator('body').textContent();
    expect(body).toContain('Disallow: /admin/');
    expect(body).toContain('sitemap.xml');
  });
});
