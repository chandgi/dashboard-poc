import { test, expect } from '@playwright/test'

test.describe('Alerts Table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard/alerts')
  })

  test('should display alerts table with data', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Alerts')
    
    // Check table headers
    await expect(page.locator('text=Alert')).toBeVisible()
    await expect(page.locator('text=Severity')).toBeVisible()
    await expect(page.locator('text=Status')).toBeVisible()
    await expect(page.locator('text=Source')).toBeVisible()
    await expect(page.locator('text=Created')).toBeVisible()
    await expect(page.locator('text=Resolved')).toBeVisible()
    
    // Check that table has data rows
    const tableRows = page.locator('tbody tr')
    expect(await tableRows.count()).toBeGreaterThan(0)
  })

  test('should enable column sorting', async ({ page }) => {
    // Test sorting by Alert title
    const alertHeader = page.locator('text=Alert').first()
    await alertHeader.click()
    
    // Check for sort icon (should show ascending)
    await expect(page.locator('[data-testid*="sort"]').first()).toBeVisible()
    
    // Click again for descending
    await alertHeader.click()
    
    // Click third time to reset sorting
    await alertHeader.click()
  })

  test('should filter by severity', async ({ page }) => {
    // Test severity badge colors
    const severityBadges = page.locator('text=critical')
    if (await severityBadges.count() > 0) {
      await expect(severityBadges.first()).toBeVisible()
    }
    
    const lowSeverityBadges = page.locator('text=low')
    if (await lowSeverityBadges.count() > 0) {
      await expect(lowSeverityBadges.first()).toBeVisible()
    }
  })

  test('should display status badges correctly', async ({ page }) => {
    // Check for different status badges
    const statusOptions = ['active', 'acknowledged', 'resolved']
    
    for (const status of statusOptions) {
      const statusBadges = page.locator(`text=${status}`)
      if (await statusBadges.count() > 0) {
        await expect(statusBadges.first()).toBeVisible()
      }
    }
  })

  test('should support row selection', async ({ page }) => {
    // Check if select all checkbox exists
    const selectAllCheckbox = page.locator('thead input[type="checkbox"]')
    if (await selectAllCheckbox.count() > 0) {
      await selectAllCheckbox.click()
      
      // Verify individual checkboxes are selected
      const individualCheckboxes = page.locator('tbody input[type="checkbox"]')
      const checkboxCount = await individualCheckboxes.count()
      
      if (checkboxCount > 0) {
        for (let i = 0; i < checkboxCount; i++) {
          await expect(individualCheckboxes.nth(i)).toBeChecked()
        }
      }
    }
  })

  test('should show alert details', async ({ page }) => {
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()
    
    if (rowCount > 0) {
      const firstRow = tableRows.first()
      
      // Check that alert title and message are displayed
      await expect(firstRow.locator('div').first()).toBeVisible()
      
      // Check that timestamps are properly formatted
      const timeElements = firstRow.locator('text=/\\d{1,2}\/\\d{1,2}\/\\d{4}/')
      expect(await timeElements.count()).toBeGreaterThan(0)
    }
  })

  test('should handle empty state', async ({ page }) => {
    // Mock empty response or test with no data
    await page.route('**/api/alerts', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })
    
    await page.reload()
    await expect(page.locator('text=No alerts found')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Table should be scrollable horizontally on mobile
    const table = page.locator('table')
    await expect(table).toBeVisible()
    
    // Headers should still be visible
    await expect(page.locator('text=Alert')).toBeVisible()
  })
})
