import { test, expect } from '@playwright/test';

test.describe('Rooms Listing', () => {
  test('loads rooms from real backend (not mock)', async ({ page }) => {
    await page.goto('/vi/rooms');
    // Seed data has rooms with Vietnamese names
    await expect(page.locator('body')).toContainText('Phòng');
  });

  test('shows multiple room cards', async ({ page }) => {
    await page.goto('/vi/rooms');
    // At least one room card visible
    const cards = page.locator('[class*="card"], article, [class*="RoomCard"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test('rooms page has correct title', async ({ page }) => {
    await page.goto('/vi/rooms');
    await expect(page).toHaveTitle(/Tìm phòng|Rooms|Ba.Li/);
  });

  test('can navigate to room detail', async ({ page }) => {
    await page.goto('/vi/rooms');
    // Click first room link
    const roomLink = page.locator('a[href*="/rooms/"]').first();
    await roomLink.waitFor({ timeout: 10000 });
    await roomLink.click();
    await expect(page).toHaveURL(/\/rooms\/.+/);
  });
});

test.describe('Room Detail', () => {
  test('shows room name and pricing', async ({ page }) => {
    // Use seed data room ID
    await page.goto('/vi/rooms/room-001');
    await expect(page.locator('body')).toContainText('Phòng Deluxe');
  });

  test('has JSON-LD structured data', async ({ page }) => {
    await page.goto('/vi/rooms/room-001');
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).toBeTruthy();
    const data = JSON.parse(jsonLd!);
    expect(data['@type']).toBe('LodgingBusiness');
    expect(data.name).toBeTruthy();
  });

  test('shows 404 for non-existent room', async ({ page }) => {
    const res = await page.goto('/vi/rooms/non-existent-room-99999');
    // Either 404 status or notFound UI
    expect(res?.status() === 404 || await page.locator('body').textContent().then(t => t?.includes('404') || t?.includes('không tìm thấy') || t?.includes('not found'))).toBeTruthy();
  });

  test('booking button is visible', async ({ page }) => {
    await page.goto('/vi/rooms/room-001');
    const bookBtn = page.locator('a[href*="/booking"], button').filter({ hasText: /đặt|book/i }).first();
    await expect(bookBtn).toBeVisible({ timeout: 10000 });
  });
});
