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

test('debug: toggle visibility action', async ({ page }) => {
  const apiCalls: any[] = [];
  page.on('response', async response => {
    if (response.url().includes('localhost:4000') && response.url().includes('review')) {
      try {
        const body = await response.text();
        apiCalls.push({ method: response.request().method(), url: response.url(), status: response.status(), body: body.substring(0, 200) });
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
  
  // Count "Đã ẩn" before
  const hiddenCount = await page.locator('tbody').locator('text=Đã ẩn').count();
  console.log('Hidden count before:', hiddenCount);
  
  // Find first visible row
  const firstVisibleRow = rows.filter({ has: page.locator('text=Hiển thị') }).first();
  const buttons = firstVisibleRow.locator('button');
  console.log('Button count in row:', await buttons.count());
  
  // Click toggle (last button)
  await buttons.last().click();
  await page.waitForTimeout(2000);
  
  const hiddenCountAfter = await page.locator('tbody').locator('text=Đã ẩn').count();
  console.log('Hidden count after:', hiddenCountAfter);
  console.log('API calls:', JSON.stringify(apiCalls, null, 2));
});
