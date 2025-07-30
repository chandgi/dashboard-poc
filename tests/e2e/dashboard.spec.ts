import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000')
  })

  test('should redirect to demo tenant dashboard', async ({ page }) => {
    await expect(page).toHaveURL('/tenants/demo-tenant/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard Overview')
  })

  test('should display key metrics cards', async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard')
    
    // Check for metric cards
    await expect(page.locator('text=Active Users')).toBeVisible()
    await expect(page.locator('text=Online Beacons')).toBeVisible()
    await expect(page.locator('text=Active Alerts')).toBeVisible()
    await expect(page.locator('text=Total Beacons')).toBeVisible()
  })

  test('should navigate to users page', async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard')
    await page.click('text=Users')
    
    await expect(page).toHaveURL('/tenants/demo-tenant/dashboard/users')
    await expect(page.locator('h1')).toContainText('Users')
  })

  test('should navigate to beacons page', async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard')
    await page.click('text=Beacons')
    
    await expect(page).toHaveURL('/tenants/demo-tenant/dashboard/beacons')
    await expect(page.locator('h1')).toContainText('Beacons')
  })

  test('should navigate to alerts page', async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard')
    await page.click('text=Alerts')
    
    await expect(page).toHaveURL('/tenants/demo-tenant/dashboard/alerts')
    await expect(page.locator('h1')).toContainText('Alerts')
  })

  test('should display tenant information', async ({ page }) => {
    await page.goto('/tenants/demo-tenant/dashboard')
    
    await expect(page.locator('text=demo-tenant')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/tenants/demo-tenant/dashboard')
    
    // Mobile menu button should be visible
    await expect(page.locator('button[aria-label="Open sidebar"]')).toBeVisible()
    
    // Desktop sidebar should be hidden
    await expect(page.locator('.lg\\:fixed')).toBeHidden()
  })
})