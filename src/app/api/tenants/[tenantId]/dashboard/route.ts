/**
 * Secure tenant API endpoint with authentication and authorization
 * Demonstrates proper API security implementation
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api'
import { Permission, User } from '@/lib/security'
import { usersApi } from '@/features/users/api'
import { beaconsApi } from '@/features/beacons/api'
import { alertsApi } from '@/features/alerts/api'
import { logger } from '@/lib/logger'

// GET /api/tenants/[tenantId]/dashboard
export const GET = withAuth([Permission.VIEW_ANALYTICS])(async (req: NextRequest & { user: User }) => {
  try {
    const tenantId = req.user.tenantId;
    
    // Mock dashboard data - in production, this would come from your database
    const dashboardData = {
      users: {
        total: 150,
        active: 142,
        new: 8
      },
      beacons: {
        total: 45,
        online: 42,
        offline: 3
      },
      alerts: {
        total: 23,
        critical: 3,
        warning: 12,
        info: 8
      },
      performance: {
        uptime: '99.9%',
        responseTime: '120ms',
        throughput: '1.2K req/min'
      }
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    logger.error('Failed to fetch dashboard data', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
});
