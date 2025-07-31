import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test('dashboard overview visual snapshot', async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard')
    await page.waitForLoadState('networkidle')
    
    // Wait for any animations to complete
    await page.waitForTimeout(1000)
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('dashboard-overview.png', {
      fullPage: true,
      animations: 'disabled'
    })
  })

  test('alerts table visual snapshot', async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard/alerts')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Screenshot of alerts table
    await expect(page.locator('table')).toHaveScreenshot('alerts-table.png')
  })

  test('beacons table visual snapshot', async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard/beacons')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Screenshot of beacons table
    await expect(page.locator('table')).toHaveScreenshot('beacons-table.png')
  })

  test('users table visual snapshot', async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard/users')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Screenshot of users table
    await expect(page.locator('table')).toHaveScreenshot('users-table.png')
  })

  test('mobile dashboard visual snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/tenants/demo-tenant/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Mobile screenshot
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      animations: 'disabled'
    })
  })

  test('dark mode visual snapshot', async ({ page }) => {
    // Set dark mode if available
    await page.goto('/tenants/demo-tenant/dashboard')
    
    // Look for theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme"], button:has-text("Dark"), button:has-text("Light")')
    if (await themeToggle.count() > 0) {
      await themeToggle.click()
      await page.waitForTimeout(500)
    }
    
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Dark mode screenshot
    await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
      fullPage: true,
      animations: 'disabled'
    })
  })

  test('table sorting visual states', async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard/alerts')
    await page.waitForLoadState('networkidle')
    
    // Click sort on first column
    const sortableHeader = page.locator('th button').first()
    if (await sortableHeader.count() > 0) {
      await sortableHeader.click()
      await page.waitForTimeout(500)
      
      // Screenshot with sort indicator
      await expect(page.locator('table')).toHaveScreenshot('table-sorted-asc.png')
      
      // Click again for descending
      await sortableHeader.click()
      await page.waitForTimeout(500)
      
      await expect(page.locator('table')).toHaveScreenshot('table-sorted-desc.png')
    }
  })

  test('table selection visual states', async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard/beacons')
    await page.waitForLoadState('networkidle')
    
    // Select all rows
    const selectAllCheckbox = page.locator('thead input[type="checkbox"]')
    if (await selectAllCheckbox.count() > 0) {
      await selectAllCheckbox.click()
      await page.waitForTimeout(500)
      
      // Screenshot with selected rows
      await expect(page.locator('table')).toHaveScreenshot('table-selected-rows.png')
    }
  })

  test('empty state visual snapshots', async ({ page }) => {
    // Mock empty responses
    await page.route('**/api/alerts', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      })
    })
    
    await page.goto('/tenants/demo-tenant/dashboard/alerts')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Empty state screenshot
    await expect(page).toHaveScreenshot('alerts-empty-state.png', {
      fullPage: true
    })
  })

  test('responsive breakpoints visual snapshots', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-xl' },
      { width: 1024, height: 768, name: 'tablet-landscape' },
      { width: 768, height: 1024, name: 'tablet-portrait' },
      { width: 375, height: 667, name: 'mobile' }
    ]
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/tenants/demo-tenant/dashboard')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
      
      await expect(page).toHaveScreenshot(`dashboard-${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled'
      })
    }
  })
})
