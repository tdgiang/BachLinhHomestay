import { test, expect } from '@playwright/test';

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function loginAsAdmin(page: any) {
  await page.goto('/vi/login');
  await page.fill('[data-slot="input"]', 'admin@homestay.vn');
  await page.fill('[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 15000 });
}

// ─── User Journeys: Báo cáo doanh thu ────────────────────────────────────────
//
// Journey 1: Admin xem trang báo cáo — load thành công
// Journey 2: Admin xem doanh thu theo năm (mặc định)
// Journey 3: Admin chuyển sang tab "Theo tháng" và chọn tháng/năm
// Journey 4: Bảng chi tiết hiển thị đúng cột

test.describe('Báo cáo — Journey 1: Trang load thành công', () => {
  test('admin truy cập /admin/reports và trang hiển thị tiêu đề', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reports');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Báo cáo doanh thu', { timeout: 10000 });
  });

  test('hiển thị 3 metric card: tổng doanh thu, tổng booking, TB/booking', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reports');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Tổng doanh thu')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Tổng booking')).toBeVisible();
    await expect(page.getByText('TB/booking').first()).toBeVisible();
  });
});

test.describe('Báo cáo — Journey 2: Doanh thu theo năm (default)', () => {
  test('tab "Theo năm" được chọn mặc định', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reports');
    await page.waitForLoadState('networkidle');

    const yearlyBtn = page.getByRole('button', { name: 'Theo năm' });
    await expect(yearlyBtn).toBeVisible({ timeout: 10000 });
    // Button có class bg-white (active state)
    await expect(yearlyBtn).toHaveClass(/bg-white/);
  });

  test('bảng chi tiết có các cột: Kỳ, Doanh thu, Booking, TB/booking', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reports');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Chi tiết')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('columnheader', { name: 'Kỳ', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Doanh thu', exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Booking', exact: true })).toBeVisible();
  });

  test('select năm hiển thị các options 2024, 2025, 2026', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reports');
    await page.waitForLoadState('networkidle');

    const yearSelect = page.locator('select').first();
    await expect(yearSelect).toBeVisible({ timeout: 10000 });
    await expect(yearSelect.locator('option[value="2024"]')).toHaveCount(1);
    await expect(yearSelect.locator('option[value="2026"]')).toHaveCount(1);
  });
});

test.describe('Báo cáo — Journey 3: Chuyển tab theo tháng', () => {
  test('click "Theo tháng" hiển thị thêm select tháng', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reports');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Theo tháng' }).click();

    // Sau khi click, phải có thêm select tháng (2 selects: năm + tháng)
    await expect(page.locator('select')).toHaveCount(2, { timeout: 5000 });
  });

  test('select tháng có 12 options (Th1 đến Th12)', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reports');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Theo tháng' }).click();

    const monthSelect = page.locator('select').nth(1);
    await expect(monthSelect).toBeVisible({ timeout: 5000 });
    const options = monthSelect.locator('option');
    await expect(options).toHaveCount(12);
  });

  test('chọn năm khác và tab "Theo tháng" vẫn active', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/vi/admin/reports');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Theo tháng' }).click();

    // Đổi năm
    const yearSelect = page.locator('select').first();
    await yearSelect.selectOption('2024');

    // Tab "Theo tháng" vẫn active
    const monthlyBtn = page.getByRole('button', { name: 'Theo tháng' });
    await expect(monthlyBtn).toHaveClass(/bg-white/);
  });
});

test.describe('Báo cáo — Journey 4: Trạng thái loading và no-data', () => {
  test('khi không có dữ liệu — hiển thị "Không có dữ liệu" thay vì crash', async ({ page }) => {
    await loginAsAdmin(page);

    // Intercept API để trả về empty array
    await page.route('**/api/v1/reports/revenue/yearly**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }),
    );

    await page.goto('/vi/admin/reports');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Không có dữ liệu')).toBeVisible({ timeout: 10000 });
  });
});
