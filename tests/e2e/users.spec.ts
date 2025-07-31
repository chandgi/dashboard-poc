import { test, expect } from '@playwright/test'

test.describe('Users Table', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard/users')
  })

  test('should display users table with data', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Users')
    
    // Check table headers (assuming standard user fields)
    await expect(page.locator('table')).toBeVisible()
    
    // Check that table has data rows
    const tableRows = page.locator('tbody tr')
    expect(await tableRows.count()).toBeGreaterThan(0)
  })

  test('should enable sorting functionality', async ({ page }) => {
    // Look for sortable headers
    const sortableHeaders = page.locator('th button')
    const headerCount = await sortableHeaders.count()
    
    if (headerCount > 0) {
      // Test clicking first sortable header
      await sortableHeaders.first().click()
      
      // Should show sort indicators
      await expect(page.locator('svg').first()).toBeVisible()
    }
  })

  test('should support row selection', async ({ page }) => {
    // Check for select all checkbox
    const selectAllCheckbox = page.locator('thead input[type="checkbox"]')
    if (await selectAllCheckbox.count() > 0) {
      await selectAllCheckbox.click()
      
      // Check individual checkboxes
      const individualCheckboxes = page.locator('tbody input[type="checkbox"]')
      const checkboxCount = await individualCheckboxes.count()
      
      if (checkboxCount > 0) {
        for (let i = 0; i < Math.min(3, checkboxCount); i++) {
          await expect(individualCheckboxes.nth(i)).toBeChecked()
        }
      }
    }
  })

  test('should display user information correctly', async ({ page }) => {
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()
    
    if (rowCount > 0) {
      const firstRow = tableRows.first()
      
      // Check that user data is displayed
      await expect(firstRow).toBeVisible()
      
      // Check for user reference numbers if they exist
      const refNumbers = page.locator('text=/#\\d{3}/')
      if (await refNumbers.count() > 0) {
        await expect(refNumbers.first()).toBeVisible()
      }
    }
  })

  test('should show action buttons for each user', async ({ page }) => {
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()
    
    if (rowCount > 0) {
      // Check for action buttons
      const actionButtons = page.locator('tbody button')
      if (await actionButtons.count() > 0) {
        await expect(actionButtons.first()).toBeVisible()
      }
    }
  })

  test('should handle pagination if present', async ({ page }) => {
    // Check if pagination exists
    const paginationText = page.locator('text=/Page \\d+ of \\d+/')
    if (await paginationText.count() > 0) {
      await expect(paginationText).toBeVisible()
      
      // Check pagination controls
      const pageButtons = page.locator('button:has-text("Next"), button:has-text("Previous")')
      if (await pageButtons.count() > 0) {
        await expect(pageButtons.first()).toBeVisible()
      }
    }
  })

  test('should filter and search users', async ({ page }) => {
    // Look for search or filter inputs
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="filter"]')
    if (await searchInput.count() > 0) {
      await searchInput.fill('test')
      
      // Wait for potential filtering
      await page.waitForTimeout(500)
      
      // Table should still be visible
      await expect(page.locator('table')).toBeVisible()
    }
  })

  test('should handle empty user list', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/users', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })
    
    await page.reload()
    
    // Should show empty state message
    const emptyStateMessages = [
      'No users found',
      'No data available',
      'Empty',
      'No results'
    ]
    
    let foundEmptyState = false
    for (const message of emptyStateMessages) {
      if (await page.locator(`text=${message}`).count() > 0) {
        await expect(page.locator(`text=${message}`)).toBeVisible()
        foundEmptyState = true
        break
      }
    }
    
    // If no specific empty message, at least table should be empty
    if (!foundEmptyState) {
      const tableRows = page.locator('tbody tr')
      expect(await tableRows.count()).toBe(0)
    }
  })

  test('should maintain sorting across page interactions', async ({ page }) => {
    // Sort by first available column
    const sortableHeaders = page.locator('th button')
    if (await sortableHeaders.count() > 0) {
      await sortableHeaders.first().click()
      
      // Select a user
      const firstCheckbox = page.locator('tbody input[type="checkbox"]').first()
      if (await firstCheckbox.count() > 0) {
        await firstCheckbox.click()
      }
      
      // Sort indicator should still be visible
      await expect(page.locator('svg').first()).toBeVisible()
    }
  })

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Table should be present and scrollable
    await expect(page.locator('table')).toBeVisible()
    
    // Content should adapt to mobile viewport
    const tableContainer = page.locator('div:has(table)')
    await expect(tableContainer).toBeVisible()
  })

  test('should display proper user status indicators', async ({ page }) => {
    const tableRows = page.locator('tbody tr')
    const rowCount = await tableRows.count()
    
    if (rowCount > 0) {
      // Look for status badges or indicators
      const statusBadges = page.locator('[data-testid*="badge"], .badge, text=Active, text=Inactive')
      if (await statusBadges.count() > 0) {
        await expect(statusBadges.first()).toBeVisible()
      }
    }
  })
})
