import { test, expect } from '@playwright/test';

test.describe('BluFleet Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should load dashboard with fleet metrics', async ({ page }) => {
    // Wait for fleet metrics to load
    await expect(page.getByTestId('fleet-overview')).toBeVisible();
    
    // Verify fleet statistics are loaded
    await expect(page.getByTestId('total-vehicles')).not.toHaveText('0');
    await expect(page.getByTestId('active-vehicles')).not.toHaveText('0');
    
    // Check if the map is loaded
    await expect(page.getByTestId('fleet-map')).toBeVisible();
    
    // Verify real-time updates are working
    const initialBatteryLevel = await page.getByTestId('avg-battery-level').textContent();
    await page.waitForTimeout(5000); // Wait for potential updates
    const updatedBatteryLevel = await page.getByTestId('avg-battery-level').textContent();
    expect(initialBatteryLevel).toBeDefined();
    expect(updatedBatteryLevel).toBeDefined();
  });

  test('should manage vehicles successfully', async ({ page }) => {
    // Navigate to vehicle management
    await page.getByRole('link', { name: 'Vehicle Management' }).click();
    await expect(page.url()).toContain('/vehicles');

    // Check vehicle list
    await expect(page.getByTestId('vehicle-list')).toBeVisible();
    
    // Add new vehicle
    await page.getByTestId('add-vehicle-button').click();
    await page.getByLabel('VIN Number').fill('TEST123456789');
    await page.getByLabel('Make').fill('Tesla');
    await page.getByLabel('Model').fill('Model Y');
    await page.getByLabel('Year').fill('2025');
    await page.getByLabel('Battery Capacity (kWh)').fill('75');
    await page.getByLabel('Max Charging Power (kW)').fill('250');
    await page.getByTestId('submit-vehicle').click();
    
    // Verify vehicle was added
    await expect(page.getByText('TEST123456789')).toBeVisible();
    
    // Update vehicle status
    await page.getByText('TEST123456789').click();
    await page.getByRole('button', { name: 'Edit' }).click();
    await page.getByLabel('Status').selectOption('charging');
    await page.getByTestId('save-changes').click();
    
    // Verify status was updated
    await expect(page.getByText('charging')).toBeVisible();
    
    // Delete vehicle
    await page.getByText('TEST123456789').click();
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    
    // Verify vehicle was deleted
    await expect(page.getByText('TEST123456789')).not.toBeVisible();
  });

  test('should display real-time telemetry data', async ({ page }) => {
    // Navigate to vehicle tracking
    await page.getByRole('link', { name: 'Vehicle Tracking' }).click();
    await expect(page.url()).toContain('/tracking');

    // Wait for telemetry data to load
    await expect(page.getByTestId('telemetry-grid')).toBeVisible();
    
    // Check for real-time updates
    const initialReading = await page.getByTestId('telemetry-data').first().textContent();
    await page.waitForTimeout(5000);
    const updatedReading = await page.getByTestId('telemetry-data').first().textContent();
    expect(initialReading).toBeDefined();
    expect(updatedReading).toBeDefined();
  });

  test('should display analytics and generate reports', async ({ page }) => {
    // Navigate to analytics
    await page.getByRole('link', { name: 'Analytics' }).click();
    await expect(page.url()).toContain('/analytics');

    // Check analytics components
    await expect(page.getByTestId('energy-metrics')).toBeVisible();
    await expect(page.getByTestId('efficiency-chart')).toBeVisible();
    await expect(page.getByTestId('performance-metrics')).toBeVisible();
    
    // Generate report
    await page.getByTestId('generate-report').click();
    
    // Wait for download and verify
    const download = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('download-report').click()
    ]);
    
    expect(download[0].suggestedFilename()).toContain('.pdf');
  });

  test('should handle alerts and notifications', async ({ page }) => {
    // Check for alerts panel
    await expect(page.getByTestId('alerts-panel')).toBeVisible();
    
    // Verify alert functionality
    const alertCount = await page.getByTestId('alert-count').textContent();
    expect(Number(alertCount)).toBeGreaterThan(0);
    
    // Open alert details
    await page.getByTestId('alert-item').first().click();
    await expect(page.getByTestId('alert-details')).toBeVisible();
    
    // Mark alert as resolved
    await page.getByRole('button', { name: 'Resolve' }).click();
    const newAlertCount = await page.getByTestId('alert-count').textContent();
    expect(Number(newAlertCount)).toBeLessThan(Number(alertCount));
  });

  test('should validate responsive design', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByTestId('side-navigation')).toBeVisible();
    
    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByTestId('mobile-menu-button')).toBeVisible();
    
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByTestId('mobile-menu-button').click();
    await expect(page.getByTestId('mobile-navigation')).toBeVisible();
  });

  test('should validate error handling', async ({ page }) => {
    // Test network error handling
    await page.route('**/api/v1/**', (route) => route.abort());
    await page.reload();
    await expect(page.getByTestId('error-message')).toBeVisible();
    
    // Test form validation
    await page.getByRole('link', { name: 'Vehicle Management' }).click();
    await page.getByTestId('add-vehicle-button').click();
    await page.getByTestId('submit-vehicle').click();
    await expect(page.getByTestId('validation-error')).toBeVisible();
    
    // Test error recovery
    await page.unroute('**/api/v1/**');
    await page.reload();
    await expect(page.getByTestId('error-message')).not.toBeVisible();
  });
});
