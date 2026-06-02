import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page loads correctly', async ({ page }) => {
    await page.goto('/vi/login');
    // @base-ui Input renders as native input with type attribute
    await expect(page.locator('[data-slot="input"]').first()).toBeVisible();
    await expect(page.locator('[type="password"]').first()).toBeVisible();
  });

  test('login page has submit button', async ({ page }) => {
    await page.goto('/vi/login');
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows error for wrong credentials', async ({ page }) => {
    await page.goto('/vi/login');
    await page.fill('[data-slot="input"]', 'wrong@email.com');
    await page.fill('[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    const errorMsg = page.locator('text=/không đúng|sai|lỗi/i');
    await expect(errorMsg).toBeVisible({ timeout: 8000 });
  });

  test('admin login redirects away from login page', async ({ page }) => {
    await page.goto('/vi/login');
    await page.fill('[data-slot="input"]', 'admin@homestay.vn');
    await page.fill('[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 12000 });
    expect(page.url()).not.toContain('/login');
  });

  test('unauthenticated access to admin redirects to login', async ({ page }) => {
    await page.goto('/vi/admin/dashboard');
    await expect(page).toHaveURL(/\/(vi|en)\/(login|$)/, { timeout: 8000 });
  });

  test('register page loads with form fields', async ({ page }) => {
    await page.goto('/vi/register');
    const inputs = page.locator('[data-slot="input"]');
    await expect(inputs.first()).toBeVisible({ timeout: 8000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
