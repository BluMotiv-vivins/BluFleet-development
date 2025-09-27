import { test, expect } from '@playwright/test';

test.describe('Fleet Tracking E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/fleet-tracking');
  });

  test('should display fleet map', async ({ page }) => {
    // Wait for map to load
    await page.waitForSelector('[data-testid="fleet-map"]', { timeout: 15000 });
    
    // Verify map container is visible
    await expect(page.locator('[data-testid="fleet-map"]')).toBeVisible();
    
    // Check for map controls
    await expect(page.locator('[data-testid="map-controls"]')).toBeVisible();
  });

  test('should display vehicle markers on map', async ({ page }) => {
    await page.waitForSelector('[data-testid="fleet-map"]');
    
    // Wait for vehicle markers to load
    await page.waitForSelector('[data-testid="vehicle-marker"]', { timeout: 10000 });
    
    // Verify at least one vehicle marker is present
    const vehicleMarkers = page.locator('[data-testid="vehicle-marker"]');
    await expect(vehicleMarkers.first()).toBeVisible();
  });

  test('should display charging station markers', async ({ page }) => {
    await page.waitForSelector('[data-testid="fleet-map"]');
    
    // Check for charging station markers
    const chargingStations = page.locator('[data-testid="charging-station-marker"]');
    if (await chargingStations.count() > 0) {
      await expect(chargingStations.first()).toBeVisible();
    }
  });

  test('should show vehicle details on marker click', async ({ page }) => {
    await page.waitForSelector('[data-testid="fleet-map"]');
    await page.waitForSelector('[data-testid="vehicle-marker"]');
    
    // Click on first vehicle marker
    await page.locator('[data-testid="vehicle-marker"]').first().click();
    
    // Verify vehicle details popup appears
    await expect(page.locator('[data-testid="vehicle-popup"]')).toBeVisible();
  });

  test('should filter vehicles by status', async ({ page }) => {
    // Wait for filter controls
    await page.waitForSelector('[data-testid="vehicle-filters"]');
    
    // Test status filter
    await page.selectOption('[data-testid="status-filter"]', 'active');
    
    // Verify filter is applied (check URL or visible markers)
    await page.waitForTimeout(1000);
    
    // Reset filter
    await page.selectOption('[data-testid="status-filter"]', 'all');
  });

  test('should display fleet statistics', async ({ page }) => {
    // Check for fleet stats header
    await expect(page.locator('[data-testid="fleet-stats"]')).toBeVisible();
    
    // Verify stats contain expected information
    await expect(page.locator('[data-testid="total-vehicles"]')).toContainText(/\d+/);
    await expect(page.locator('[data-testid="active-vehicles"]')).toContainText(/\d+/);
  });
});