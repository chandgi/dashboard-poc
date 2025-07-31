import { test, expect } from '../fixtures/dashboard'

test.describe('Dashboard with Custom Fixtures', () => {
  test('should navigate to different sections using fixtures', async ({ dashboardPage }) => {
    // Navigate to dashboard
    await dashboardPage.navigateTo('demo-tenant')
    await dashboardPage.expectPageTitle('Dashboard Overview')
    
    // Navigate to alerts
    await dashboardPage.navigateTo('demo-tenant', 'alerts')
    await dashboardPage.expectPageTitle('Alerts')
    await dashboardPage.waitForTableLoad()
    
    // Navigate to beacons
    await dashboardPage.navigateTo('demo-tenant', 'beacons')
    await dashboardPage.expectPageTitle('Beacons')
    await dashboardPage.waitForTableLoad()
  })

  test('should handle table interactions with fixtures', async ({ dashboardPage }) => {
    await dashboardPage.navigateTo('demo-tenant', 'alerts')
    await dashboardPage.waitForTableLoad()
    
    // Check expected headers
    await dashboardPage.expectTableHeaders([
      'Alert', 'Severity', 'Status', 'Source', 'Created', 'Resolved'
    ])
    
    // Test sorting
    await dashboardPage.sortTableBy('Alert')
    
    // Test row selection
    await dashboardPage.selectAllRows()
    
    // Get row count
    const rowCount = await dashboardPage.getTableRowCount()
    expect(rowCount).toBeGreaterThan(0)
  })

  test('should handle empty state with mock API', async ({ dashboardPage, mockApi }) => {
    // Mock empty alerts response
    await mockApi.mockEmptyResponse('api/alerts')
    
    await dashboardPage.navigateTo('demo-tenant', 'alerts')
    
    // Should show empty state
    await expect(dashboardPage.expectPageTitle('Alerts'))
  })

  test('should handle API errors gracefully', async ({ dashboardPage, mockApi }) => {
    // Mock API error
    await mockApi.mockErrorResponse('api/beacons', 500)
    
    await dashboardPage.navigateTo('demo-tenant', 'beacons')
    
    // Page should still load
    await dashboardPage.expectPageTitle('Beacons')
  })

  test('should handle slow API responses', async ({ dashboardPage, mockApi }) => {
    // Mock slow response
    await mockApi.mockSlowResponse('api/users', 1000)
    
    await dashboardPage.navigateTo('demo-tenant', 'users')
    
    // Should eventually load
    await dashboardPage.expectPageTitle('Users')
  })
})
