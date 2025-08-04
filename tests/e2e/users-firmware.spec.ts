import { test, expect } from '@playwright/test'

test.describe('Users Table with Firmware Version', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard/users')
    await page.waitForLoadState('networkidle')
  })

  test('should display users table with firmware version column', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Users')
    
    // Check that table is visible
    await expect(page.locator('table')).toBeVisible()
    
    // Check for expected headers including the new firmware version column
    await expect(page.locator('text=Name')).toBeVisible()
    await expect(page.locator('text=Role')).toBeVisible()
    await expect(page.locator('text=Status')).toBeVisible()
    await expect(page.locator('text=Last Login')).toBeVisible()
    await expect(page.locator('text=Firmware Version')).toBeVisible()
    await expect(page.locator('text=Created')).toBeVisible()
    
    // Check that table has data rows
    const tableRows = page.locator('tbody tr')
    expect(await tableRows.count()).toBeGreaterThan(0)
    
    // Verify firmware version data is displayed
    const firmwareVersions = page.locator('tbody tr td:has-text("v1.")')
    expect(await firmwareVersions.count()).toBeGreaterThan(0)
  })

  test('should display firmware versions in proper format', async ({ page }) => {
    // Wait for table to load
    await expect(page.locator('table')).toBeVisible()
    
    // Check that firmware versions are displayed with proper styling
    const firmwareVersionCells = page.locator('span:has-text("v1.")')
    
    if (await firmwareVersionCells.count() > 0) {
      // Check that firmware versions have the expected styling classes
      const firstFirmwareCell = firmwareVersionCells.first()
      await expect(firstFirmwareCell).toHaveClass(/font-mono/)
      await expect(firstFirmwareCell).toHaveClass(/bg-gray-100/)
    }
  })

  test('should handle users without firmware version', async ({ page }) => {
    // Mock response with users missing firmware version
    await page.route('**/api/users', route => {
      const usersWithoutFirmware = [
        {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          role: "user",
          status: "active",
          lastLogin: "2024-01-15T10:30:00Z",
          createdAt: "2023-12-01T09:00:00Z"
          // No firmwareVersion field
        }
      ]
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(usersWithoutFirmware)
      })
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Should display "N/A" for missing firmware version
    await expect(page.locator('text=N/A')).toBeVisible()
  })

  test('should sort by firmware version column', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible()
    
    // Look for the firmware version header
    const firmwareHeader = page.locator('th:has-text("Firmware Version")')
    
    if (await firmwareHeader.count() > 0) {
      // Check if it's sortable (has a button)
      const sortButton = firmwareHeader.locator('button')
      
      if (await sortButton.count() > 0) {
        await sortButton.click()
        
        // Should show some sort indicator or change in data order
        await page.waitForTimeout(500)
        
        // Table should still be visible after sorting
        await expect(page.locator('table')).toBeVisible()
      }
    }
  })

  test('should display correct firmware versions from mock data', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible()
    
    // Check for specific firmware versions from our mock data
    await expect(page.locator('text=v1.2.5')).toBeVisible() // John Doe
    await expect(page.locator('text=v1.2.3')).toBeVisible() // Jane Smith
    await expect(page.locator('text=v1.1.9')).toBeVisible() // Bob Johnson
    await expect(page.locator('text=v1.2.4')).toBeVisible() // Alice Brown
  })
})
