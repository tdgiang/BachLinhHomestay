import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads successfully and shows hero section', async ({ page }) => {
    await page.goto('/vi');
    await expect(page).toHaveTitle(/Ocean Blue/);
    // Hero heading visible
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('language switcher changes URL locale', async ({ page }) => {
    await page.goto('/vi');
    // Find language toggle (EN button)
    const enLink = page.locator('a[href*="/en"]').first();
    if (await enLink.isVisible()) {
      await enLink.click();
      await expect(page).toHaveURL(/\/en/);
    } else {
      test.skip();
    }
  });

  test('navigation to rooms page works', async ({ page }) => {
    await page.goto('/vi');
    await page.click('a[href*="/rooms"]');
    await expect(page).toHaveURL(/\/rooms/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('footer is present', async ({ page }) => {
    await page.goto('/vi');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('footer')).toBeVisible();
  });
});
