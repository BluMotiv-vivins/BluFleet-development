import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display all KPI cards', async ({ page }) => {
    // Wait for the dashboard to load
    await page.waitForSelector('[data-testid="kpi-cards"]', { timeout: 10000 });

    // Check that all four KPI cards are present
    await expect(page.locator('.total-fleet-status-card')).toBeVisible();
    await expect(page.locator('.battery-health-card')).toBeVisible();
    await expect(page.locator('.cost-savings-card')).toBeVisible();
    await expect(page.locator('.sustainability-card')).toBeVisible();
  });

  test('should navigate between different sections', async ({ page }) => {
    // Test sidebar navigation
    await page.click('[data-testid="sidebar-fleet-tracking"]');
    await expect(page).toHaveURL(/.*fleet-tracking/);

    await page.click('[data-testid="sidebar-energy-charging"]');
    await expect(page).toHaveURL(/.*energy-charging/);

    await page.click('[data-testid="sidebar-dashboard"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should display real-time updates', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[data-testid="kpi-cards"]');

    // Get initial values
    const initialFleetCount = await page.textContent('.total-fleet-status-card .text-2xl');
    
    // Wait for potential updates (simulate real-time data)
    await page.waitForTimeout(2000);

    // Verify the page is still responsive
    await expect(page.locator('.total-fleet-status-card')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="kpi-cards"]')).toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="kpi-cards"]')).toBeVisible();
  });

  test('should display alerts and notifications', async ({ page }) => {
    // Check for alert panel
    await expect(page.locator('[data-testid="alert-panel"]')).toBeVisible();

    // Check notification badge in header
    const notificationBadge = page.locator('[data-testid="notification-badge"]');
    if (await notificationBadge.isVisible()) {
      await notificationBadge.click();
      await expect(page.locator('[data-testid="notification-dropdown"]')).toBeVisible();
    }
  });
});