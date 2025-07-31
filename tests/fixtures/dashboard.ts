import { test as base } from '@playwright/test'
import type { Page } from '@playwright/test'

// Define custom fixtures types
type DashboardPage = {
  navigateTo(tenant: string, section?: string): Promise<void>
  waitForTableLoad(): Promise<void>
  sortTableBy(columnName: string): Promise<void>
  selectAllRows(): Promise<void>
  getTableRowCount(): Promise<number>
  searchTable(query: string): Promise<void>
  expectTableHeaders(headers: string[]): Promise<void>
  expectPageTitle(title: string): Promise<void>
}

type MockApi = {
  mockEmptyResponse(endpoint: string): Promise<void>
  mockErrorResponse(endpoint: string, statusCode?: number): Promise<void>
  mockSlowResponse(endpoint: string, delay?: number): Promise<void>
}

// Extend the base test with custom fixtures
export const test = base.extend<{ dashboardPage: DashboardPage; mockApi: MockApi }>({
  // Custom fixture for dashboard pages
  dashboardPage: async ({ page }, use) => {
    // Helper methods for dashboard interactions
    const dashboardPage: DashboardPage = {
      async navigateTo(tenant: string, section?: string) {
        const url = section 
          ? `/tenants/${tenant}/dashboard/${section}`
          : `/tenants/${tenant}/dashboard`
        await page.goto(url)
        await page.waitForLoadState('networkidle')
      },

      async waitForTableLoad() {
        await page.waitForSelector('table', { state: 'visible' })
        await page.waitForTimeout(500) // Allow for any animations
      },

      async sortTableBy(columnName: string) {
        const header = page.locator(`text=${columnName}`).first()
        await header.click()
        await page.waitForTimeout(300)
      },

      async selectAllRows() {
        const selectAllCheckbox = page.locator('thead input[type="checkbox"]')
        if (await selectAllCheckbox.count() > 0) {
          await selectAllCheckbox.click()
          await page.waitForTimeout(300)
        }
      },

      async getTableRowCount() {
        return await page.locator('tbody tr').count()
      },

      async searchTable(query: string) {
        const searchInput = page.locator('input[type="search"], input[placeholder*="search"]')
        if (await searchInput.count() > 0) {
          await searchInput.fill(query)
          await page.waitForTimeout(500)
        }
      },

      async expectTableHeaders(headers: string[]) {
        for (const header of headers) {
          await base.expect(page.locator(`text=${header}`)).toBeVisible()
        }
      },

      async expectPageTitle(title: string) {
        await base.expect(page.locator('h1')).toContainText(title)
      }
    }

    await use(dashboardPage)
  },

  // Mock API responses fixture
  mockApi: async ({ page }, use) => {
    const mockApi: MockApi = {
      async mockEmptyResponse(endpoint: string) {
        await page.route(`**/${endpoint}`, route => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([])
          })
        })
      },

      async mockErrorResponse(endpoint: string, statusCode = 500) {
        await page.route(`**/${endpoint}`, route => {
          route.fulfill({
            status: statusCode,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'API Error' })
          })
        })
      },

      async mockSlowResponse(endpoint: string, delay = 2000) {
        await page.route(`**/${endpoint}`, async route => {
          await new Promise(resolve => setTimeout(resolve, delay))
          route.continue()
        })
      }
    }

    await use(mockApi)
  }
})

export { expect } from '@playwright/test'
