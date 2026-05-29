import { test, expect, type Page } from '@playwright/test';
import { execSync } from 'child_process';

// ─── DB seed helpers ──────────────────────────────────────────────────────────

function seedReviews() {
  execSync(`psql "postgresql://homestay_user:homestay_pass@localhost:5432/homestay" -c "
    DELETE FROM reviews WHERE booking_id IN ('bk-004', 'bk-006', 'bk-008');
    INSERT INTO reviews (id, booking_id, user_id, room_id, rating, comment, is_visible, created_at)
    VALUES
      (gen_random_uuid(), 'bk-004', '91145981-bebd-405d-8866-4c90ba9c61eb', 'room-004', 5, 'Phòng duplex rất rộng rãi, phù hợp gia đình. View đẹp, sẽ quay lại!', true, NOW() - INTERVAL '5 days'),
      (gen_random_uuid(), 'bk-008', '91145981-bebd-405d-8866-4c90ba9c61eb', 'room-002', 4, 'Gác xép tạo không gian độc đáo, nhưng cầu thang hơi dốc.', true, NOW() - INTERVAL '3 days'),
      (gen_random_uuid(), 'bk-006', '91145981-bebd-405d-8866-4c90ba9c61eb', 'room-001', 3, 'Phòng ổn, nhưng wifi hơi chậm vào giờ cao điểm.', false, NOW() - INTERVAL '1 day')
    ON CONFLICT (booking_id) DO NOTHING;
  "`, { stdio: 'pipe' });
}

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function loginAsAdmin(page: Page) {
  await page.goto('/vi/login');
  await page.fill('[data-slot="input"]', 'admin@homestay.vn');
  await page.fill('[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

// ─── User Journeys: Quản lý đánh giá ─────────────────────────────────────────
//
// Journey 1: Admin xem danh sách đánh giá từ API thật
// Journey 2: Admin lọc đánh giá theo trạng thái hiển thị / đã ẩn
// Journey 3: Admin toggle ẩn/hiện một đánh giá
// Journey 4: Admin xóa đánh giá với dialog xác nhận

test.describe('Quản lý đánh giá — Journey 1: Danh sách từ API thật', () => {
  test.beforeAll(() => seedReviews());

  test('trang hiển thị đánh giá từ cơ sở dữ liệu thật (không phải mock)', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reviews');
    await page.waitForLoadState('networkidle');

    // DB has reviews for room-004 "Phòng Duplex Gia Đình" — mock data does NOT have this room
    await expect(page.locator('body')).toContainText('Phòng Duplex', { timeout: 10000 });
  });

  test('hiển thị đúng số lượng đánh giá', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reviews');
    await page.waitForLoadState('networkidle');

    // Subtitle should show "3 đánh giá" matching our seeded data
    await expect(page.locator('p').filter({ hasText: /\d+ đánh giá/ })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('p').filter({ hasText: /\d+ đánh giá/ })).toContainText('3');
  });

  test('mỗi hàng có tên phòng, sao đánh giá, nội dung và trạng thái', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reviews');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });

    // At least one row shows a rating number — use .first() to avoid strict mode
    await expect(page.locator('text=/[1-5]\\/5/').first()).toBeVisible();

    // Status badge present
    await expect(page.locator('text=Hiển thị').first()).toBeVisible();
  });
});

test.describe('Quản lý đánh giá — Journey 2: Lọc trạng thái', () => {
  test.beforeAll(() => seedReviews());

  test('lọc "Hiển thị" chỉ hiện đánh giá đang active', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reviews');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Hiển thị")');
    await page.waitForTimeout(500);

    // All visible rows should show "Hiển thị" badge, none "Đã ẩn"
    const hiddenBadges = page.locator('tbody').locator('text=Đã ẩn');
    await expect(hiddenBadges).toHaveCount(0, { timeout: 5000 });

    const visibleBadges = page.locator('tbody').locator('text=Hiển thị');
    await expect(visibleBadges.first()).toBeVisible();
  });

  test('lọc "Ẩn" chỉ hiện đánh giá đã bị ẩn', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reviews');
    await page.waitForLoadState('networkidle');

    await page.click('button:has-text("Ẩn")');
    await page.waitForTimeout(500);

    // Must show at least 1 hidden review (seeded room-001 review has is_visible=false)
    const hiddenBadge = page.locator('tbody').locator('text=Đã ẩn').first();
    await expect(hiddenBadge).toBeVisible({ timeout: 5000 });

    // No "Hiển thị" badge should appear
    const visibleBadges = page.locator('tbody').locator('text=Hiển thị');
    await expect(visibleBadges).toHaveCount(0, { timeout: 5000 });
  });

  test('lọc "Tất cả" hiện đầy đủ 3 đánh giá', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reviews');
    await page.waitForLoadState('networkidle');

    // Switch to hidden, then back to all
    await page.click('button:has-text("Ẩn")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Tất cả")');
    await page.waitForTimeout(300);

    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(3, { timeout: 5000 });
  });
});

test.describe('Quản lý đánh giá — Journey 3: Toggle ẩn/hiện', () => {
  test.beforeAll(() => seedReviews());

  test('click nút Eye trên đánh giá "Hiển thị" → badge đổi thành "Đã ẩn"', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reviews');
    await page.waitForLoadState('networkidle');

    // Count hidden badges BEFORE toggle
    const hiddenBadges = page.locator('tbody').locator('text=Đã ẩn');
    const countBefore = await hiddenBadges.count();

    // Find first visible row by index — more stable than text filter which changes
    const firstVisibleRow = page.locator('tbody tr').filter({ has: page.locator('text=Hiển thị') }).first();
    await expect(firstVisibleRow).toBeVisible({ timeout: 10000 });

    // Nth row index to re-locate after state change
    const rowIndex = await page.locator('tbody tr').all().then(rows =>
      rows.findIndex(async (_, i) =>
        (await page.locator('tbody tr').nth(i).locator('text=Hiển thị').count()) > 0,
      ),
    );

    // Click the toggle button (last button in the row)
    const toggleBtn = firstVisibleRow.locator('button').last();
    await toggleBtn.click();

    // Count of hidden badges should increase by 1
    await expect(hiddenBadges).toHaveCount(countBefore + 1, { timeout: 8000 });
  });

  test('click nút Eye trên đánh giá "Đã ẩn" → badge đổi thành "Hiển thị"', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reviews');
    await page.waitForLoadState('networkidle');

    // Count visible badges BEFORE toggle
    const visibleBadges = page.locator('tbody').locator('text=Hiển thị');
    const countBefore = await visibleBadges.count();

    // Find first hidden row
    const firstHiddenRow = page.locator('tbody tr').filter({ has: page.locator('text=Đã ẩn') }).first();
    await expect(firstHiddenRow).toBeVisible({ timeout: 10000 });

    // Click the toggle button (last button in the row)
    const toggleBtn = firstHiddenRow.locator('button').last();
    await toggleBtn.click();

    // Count of visible badges should increase by 1
    await expect(visibleBadges).toHaveCount(countBefore + 1, { timeout: 8000 });
  });
});

test.describe('Quản lý đánh giá — Journey 4: Xóa đánh giá', () => {
  test.beforeAll(() => seedReviews());

  test('mỗi hàng có nút xóa (icon trash)', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reviews');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });

    // Each row must have at least 2 action buttons (delete + toggle)
    const firstRowBtns = rows.first().locator('button');
    await expect(firstRowBtns).toHaveCount(2, { timeout: 5000 });
  });

  test('click xóa → dialog xác nhận xuất hiện', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reviews');
    await page.waitForLoadState('networkidle');

    const firstRow = page.locator('tbody tr').first();
    await firstRow.waitFor({ timeout: 10000 });

    // Click delete button (first button = Trash2)
    const deleteBtn = firstRow.locator('button').first();
    await deleteBtn.click();

    // Confirmation dialog should appear
    await expect(page.locator('text=Xóa đánh giá')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Xác nhận xóa")')).toBeVisible();
  });

  test('xác nhận xóa → đánh giá biến khỏi danh sách', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reviews');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    const initialCount = await rows.count();

    // Click delete on first row, then confirm
    const deleteBtn = rows.first().locator('button').first();
    await deleteBtn.click();
    await page.click('button:has-text("Xác nhận xóa")');

    // Row count should decrease by 1
    await expect(rows).toHaveCount(initialCount - 1, { timeout: 8000 });
  });

  test('hủy dialog xóa → đánh giá vẫn còn trong danh sách', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reviews');
    await page.waitForLoadState('networkidle');

    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    const initialCount = await rows.count();

    // Click delete then cancel
    const deleteBtn = rows.first().locator('button').first();
    await deleteBtn.click();
    await page.click('button:has-text("Giữ lại")');

    // Count should remain the same
    await expect(rows).toHaveCount(initialCount, { timeout: 5000 });
  });
});
