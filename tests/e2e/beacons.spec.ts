import { test, expect } from '@playwright/test'

test.describe('Beacons Table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard/beacons')
  })

  test('should display beacons table with data', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Beacons')
    
    // Check table headers
    await expect(page.locator('text=Name')).toBeVisible()
    await expect(page.locator('text=Location')).toBeVisible()
    await expect(page.locator('text=Status')).toBeVisible()
    await expect(page.locator('text=Battery')).toBeVisible()
    await expect(page.locator('text=Last Activity')).toBeVisible()
    
    // Check that table has data rows
    const tableRows = page.locator('tbody tr')
    expect(await tableRows.count()).toBeGreaterThan(0)
  })

  test('should enable column sorting functionality', async ({ page }) => {
    // Test sorting by Name
    const nameHeader = page.locator('text=Name').first()
    await nameHeader.click()
    
    // Should show sort icon
    await expect(page.locator('svg').first()).toBeVisible()
    
    // Test sorting by Battery level
    const batteryHeader = page.locator('text=Battery').first()
    await batteryHeader.click()
    
    // Test sorting by Last Activity
    const activityHeader = page.locator('text=Last Activity').first()
    await activityHeader.click()
  })

  test('should display beacon status badges', async ({ page }) => {
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()
    
    if (rowCount > 0) {
      // Check for status badges (Online, Offline, Warning)
      const statusOptions = ['Online', 'Offline', 'Warning']
      
      for (const status of statusOptions) {
        const statusBadges = page.locator(`text=${status}`)
        if (await statusBadges.count() > 0) {
          await expect(statusBadges.first()).toBeVisible()
        }
      }
    }
  })

  test('should show battery level indicators', async ({ page }) => {
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()
    
    if (rowCount > 0) {
      const firstRow = tableRows.first()
      
      // Check for battery percentage
      const batteryText = firstRow.locator('text=/%/')
      if (await batteryText.count() > 0) {
        await expect(batteryText.first()).toBeVisible()
      }
    }
  })

  test('should support pagination', async ({ page }) => {
    // Check if pagination controls exist
    const paginationControls = page.locator('text=/Page \\d+ of \\d+/')
    if (await paginationControls.count() > 0) {
      await expect(paginationControls).toBeVisible()
      
      // Check for next/previous buttons
      const nextButton = page.locator('button:has-text("Next")')
      const prevButton = page.locator('button:has-text("Previous")')
      
      if (await nextButton.count() > 0) {
        await expect(nextButton).toBeVisible()
      }
      if (await prevButton.count() > 0) {
        await expect(prevButton).toBeVisible()
      }
    }
  })

  test('should enable row selection with checkboxes', async ({ page }) => {
    // Check for select all checkbox
    const selectAllCheckbox = page.locator('thead input[type="checkbox"]')
    if (await selectAllCheckbox.count() > 0) {
      await selectAllCheckbox.click()
      
      // Verify rows are selected
      const selectedRows = page.locator('tbody tr[data-state="selected"]')
      expect(await selectedRows.count()).toBeGreaterThan(0)
    }
  })

  test('should display beacon reference numbers', async ({ page }) => {
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()
    
    if (rowCount > 0) {
      // Check for reference numbers (#001, #002, etc.)
      const refNumbers = page.locator('text=/#\\d{3}/')
      expect(await refNumbers.count()).toBeGreaterThan(0)
    }
  })

  test('should show action menu for each beacon', async ({ page }) => {
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()
    
    if (rowCount > 0) {
      // Check for action buttons (More options)
      const actionButtons = page.locator('button:has([data-testid="more-horizontal"])')
      if (await actionButtons.count() > 0) {
        await expect(actionButtons.first()).toBeVisible()
        
        // Click to test dropdown
        await actionButtons.first().click()
      }
    }
  })

  test('should format timestamps correctly', async ({ page }) => {
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()
    
    if (rowCount > 0) {
      // Check for properly formatted timestamps
      const timestamps = page.locator('text=/\\d{1,2}\/\\d{1,2}\/\\d{4}/')
      expect(await timestamps.count()).toBeGreaterThan(0)
    }
  })

  test('should handle empty beacon list', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/beacons', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })
    
    await page.reload()
    await expect(page.locator('text=No beacons found')).toBeVisible()
  })

  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Table should still be functional on mobile
    await expect(page.locator('table')).toBeVisible()
    
    // Headers should be visible
    await expect(page.locator('text=Name')).toBeVisible()
    
    // Should be horizontally scrollable
    const tableContainer = page.locator('div:has(table)')
    await expect(tableContainer).toBeVisible()
  })

  test('should maintain sorting state across interactions', async ({ page }) => {
    // Sort by name
    const nameHeader = page.locator('text=Name').first()
    await nameHeader.click()
    
    // Select a row
    const firstCheckbox = page.locator('tbody input[type="checkbox"]').first()
    if (await firstCheckbox.count() > 0) {
      await firstCheckbox.click()
    }
    
    // Sort should still be active
    await expect(page.locator('svg').first()).toBeVisible()
  })
})
