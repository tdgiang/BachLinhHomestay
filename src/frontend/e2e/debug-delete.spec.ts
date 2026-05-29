import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';

function seedReviews() {
  execSync(`psql "postgresql://homestay_user:homestay_pass@localhost:5432/homestay" -c "
    DELETE FROM reviews WHERE booking_id IN ('bk-004', 'bk-006', 'bk-008');
    INSERT INTO reviews (id, booking_id, user_id, room_id, rating, comment, is_visible, created_at)
    VALUES
      (gen_random_uuid(), 'bk-004', '91145981-bebd-405d-8866-4c90ba9c61eb', 'room-004', 5, 'Test review A', true, NOW()),
      (gen_random_uuid(), 'bk-008', '91145981-bebd-405d-8866-4c90ba9c61eb', 'room-002', 4, 'Test review B', true, NOW()),
      (gen_random_uuid(), 'bk-006', '91145981-bebd-405d-8866-4c90ba9c61eb', 'room-001', 3, 'Test review C', false, NOW())
    ON CONFLICT (booking_id) DO NOTHING;
  "`, { stdio: 'pipe' });
}

test.beforeAll(() => seedReviews());

test('debug: intercept delete and toggle API calls', async ({ page }) => {
  const apiCalls: { method: string; url: string; status: number; body: string }[] = [];
  
  page.on('response', async response => {
    if (response.url().includes('localhost:4000')) {
      try {
        const body = await response.text();
        apiCalls.push({ method: response.request().method(), url: response.url(), status: response.status(), body: body.substring(0, 300) });
      } catch {}
    }
  });

  await page.goto('/vi/login');
  await page.fill('[data-slot="input"]', 'admin@homestay.vn');
  await page.fill('[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  
  await page.goto('/vi/admin/reviews');
  await page.waitForLoadState('networkidle');

  const rows = page.locator('tbody tr');
  await expect(rows.first()).toBeVisible({ timeout: 10000 });
  console.log('Initial row count:', await rows.count());

  // Try delete
  const deleteBtn = rows.first().locator('button').first();
  await deleteBtn.click();
  await page.waitForTimeout(500);
  await page.click('button:has-text("Xác nhận xóa")');
  await page.waitForTimeout(2000);

  console.log('After delete row count:', await rows.count());
  console.log('API calls made:', JSON.stringify(apiCalls, null, 2));
});
