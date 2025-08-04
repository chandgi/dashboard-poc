/**
 * Health check API endpoint for monitoring system status
 * Provides detailed health information for monitoring tools
 */

import { NextRequest } from 'next/server'
import { createApiHandler } from '@/lib/api'
import { HealthChecker, performanceTracker, cacheManager, databaseManager } from '@/lib/scalability'

export const GET = createApiHandler(async (req: NextRequest) => {
  const health = await HealthChecker.getSystemHealth()
  
  // Add additional metrics
  const performanceMetrics = performanceTracker.getMetrics()
  const cacheStats = cacheManager.getStats()
  const dbStats = databaseManager.getPoolStats()
  
  return {
    ...health,
    metrics: {
      performance: {
        slowestOperations: performanceTracker.getSlowestOperations(),
        operationCount: Object.keys(performanceMetrics).length
      },
      cache: cacheStats,
      database: dbStats,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV
    }
  }
})

export const HEAD = GET // Support HEAD requests for simple health checks
