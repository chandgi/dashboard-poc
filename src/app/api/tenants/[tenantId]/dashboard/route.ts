/**
 * Secure tenant API endpoint with authentication and authorization
 * Demonstrates proper API security implementation
 */

import { NextRequest } from 'next/server'
import { withAuth } from '@/lib/api'
import { Permission } from '@/lib/security'
import { usersApi } from '@/features/users/api'
import { beaconsApi } from '@/features/beacons/api'
import { alertsApi } from '@/features/alerts/api'

// GET /api/tenants/[tenantId]/dashboard
export const GET = withAuth([Permission.VIEW_ANALYTICS])(async (req: NextRequest & { user: any }) => {
  const url = new URL(req.url)
  const pathSegments = url.pathname.split('/')
  const tenantIdIndex = pathSegments.indexOf('tenants') + 1
  const tenantId = pathSegments[tenantIdIndex]
  
  // Fetch all dashboard data for the tenant
  const [users, beacons, alerts] = await Promise.all([
    usersApi.getUsers(),
    beaconsApi.getBeacons(),
    alertsApi.getAlerts()
  ])

  // Filter data by tenant (in a real app, this would be done in the database query)
  const tenantUsers = users.filter(u => u.tenantId === tenantId || !u.tenantId)
  const tenantBeacons = beacons.filter(b => b.tenantId === tenantId || !b.tenantId)
  const tenantAlerts = alerts.filter(a => a.tenantId === tenantId || !a.tenantId)

  return {
    tenant: {
      id: tenantId,
      name: tenantId // In real app, fetch from tenant service
    },
    summary: {
      totalUsers: tenantUsers.length,
      activeUsers: tenantUsers.filter(u => u.status === 'active').length,
      totalBeacons: tenantBeacons.length,
      onlineBeacons: tenantBeacons.filter(b => b.status === 'online').length,
      totalAlerts: tenantAlerts.length,
      activeAlerts: tenantAlerts.filter(a => a.status === 'active').length
    },
    data: {
      users: tenantUsers.slice(0, 10), // Limit for dashboard view
      beacons: tenantBeacons.slice(0, 10),
      alerts: tenantAlerts.filter(a => a.status === 'active').slice(0, 5)
    }
  }
})
