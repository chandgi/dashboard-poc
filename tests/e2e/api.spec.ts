import { test, expect } from '@playwright/test'

test.describe('API Integration Tests', () => {
  test('should load dashboard data correctly', async ({ page }) => {
    // Monitor API calls
    const apiCalls: string[] = []
    
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push(request.url())
      }
    })
    
    await page.goto('/tenants/demo-tenant/dashboard')
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle')
    
    // Verify API calls were made
    expect(apiCalls.length).toBeGreaterThan(0)
    
    // Check that data is displayed
    await expect(page.locator('text=Active Users')).toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      })
    })
    
    await page.goto('/tenants/demo-tenant/dashboard')
    
    // Should still render page structure
    await expect(page.locator('h1')).toBeVisible()
    
    // Should handle error state gracefully
    await page.waitForTimeout(2000)
  })

  test('should load alerts data via API', async ({ page }) => {
    let alertsApiCalled = false
    
    page.on('request', request => {
      if (request.url().includes('/api/alerts')) {
        alertsApiCalled = true
      }
    })
    
    await page.goto('/tenants/demo-tenant/dashboard/alerts')
    await page.waitForLoadState('networkidle')
    
    // Verify alerts API was called
    expect(alertsApiCalled).toBe(true)
    
    // Verify alerts table is rendered
    await expect(page.locator('table')).toBeVisible()
  })

  test('should load beacons data via API', async ({ page }) => {
    let beaconsApiCalled = false
    
    page.on('request', request => {
      if (request.url().includes('/api/beacons')) {
        beaconsApiCalled = true
      }
    })
    
    await page.goto('/tenants/demo-tenant/dashboard/beacons')
    await page.waitForLoadState('networkidle')
    
    // Verify beacons API was called
    expect(beaconsApiCalled).toBe(true)
    
    // Verify beacons table is rendered
    await expect(page.locator('table')).toBeVisible()
  })

  test('should load users data via API', async ({ page }) => {
    let usersApiCalled = false
    
    page.on('request', request => {
      if (request.url().includes('/api/users')) {
        usersApiCalled = true
      }
    })
    
    await page.goto('/tenants/demo-tenant/dashboard/users')
    await page.waitForLoadState('networkidle')
    
    // Verify users API was called
    expect(usersApiCalled).toBe(true)
    
    // Verify users table is rendered
    await expect(page.locator('table')).toBeVisible()
  })

  test('should handle slow API responses', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      route.continue()
    })
    
    await page.goto('/tenants/demo-tenant/dashboard')
    
    // Should show loading state or handle gracefully
    await expect(page.locator('h1')).toBeVisible()
    
    // Wait for eventual data load
    await page.waitForTimeout(3000)
  })

  test('should handle different tenant contexts', async ({ page }) => {
    const tenants = ['tenant-a', 'tenant-b', 'tenant-c']
    
    for (const tenant of tenants) {
      await page.goto(`/tenants/${tenant}/dashboard`)
      
      // Should load successfully for each tenant
      await expect(page.locator('h1')).toContainText('Dashboard Overview')
      
      // Check tenant-specific context
      await expect(page.locator(`text=${tenant}`)).toBeVisible()
    }
  })
})
