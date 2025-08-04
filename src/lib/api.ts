/**
 * Enhanced API utilities with proper error handling, health checks, and middleware
 */

import { NextRequest, NextResponse } from 'next/server'
import { logger } from './logger'
import { withSecurity, AuthService, AuthorizationService, Permission, User, UserRole } from './security'
import { HealthChecker, performanceTracker } from './scalability'

// API Response wrapper for consistent error handling
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Enhanced API wrapper with proper error handling
export function createApiHandler<T = unknown>(
  handler: (req: NextRequest) => Promise<T>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const requestId = crypto.randomUUID()
    const startTime = performance.now()
    
    try {
      logger.info(`API Request: ${req.method} ${req.url}`, {
        requestId,
        method: req.method,
        url: req.url,
        userAgent: req.headers.get('user-agent')
      })

      const result = await handler(req)
      const duration = performance.now() - startTime
      
      performanceTracker.recordOperation(`${req.method} ${req.url}`, duration)
      
      logger.apiRequest(req.method, req.url, duration, 200, { requestId })

      const response: ApiResponse<T> = {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: '1.0.0'
        }
      }

      return NextResponse.json(response, { status: 200 })
    } catch (error) {
      const duration = performance.now() - startTime
      
      if (error instanceof ApiError) {
        logger.warn(`API Error: ${error.code}`, {
          requestId,
          statusCode: error.statusCode,
          code: error.code,
          message: error.message,
          details: error.details
        })

        const response: ApiResponse = {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
            version: '1.0.0'
          }
        }

        return NextResponse.json(response, { status: error.statusCode })
      }

      // Unexpected errors
      logger.error('Unexpected API error', error as Error, { requestId })
      
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          version: '1.0.0'
        }
      }

      return NextResponse.json(response, { status: 500 })
    }
  }
}

// Authentication middleware for API routes
export function withAuth(requiredPermissions: Permission[] = []) {
  return function <T>(
    handler: (req: NextRequest & { user: User }) => Promise<T>
  ) {
    return createApiHandler(async (req: NextRequest) => {
      const authHeader = req.headers.get('authorization')
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'MISSING_TOKEN', 'Authentication token required')
      }

      const token = authHeader.substring(7)
      const authToken = await AuthService.validateToken(token)
      
      if (!authToken) {
        throw new ApiError(401, 'INVALID_TOKEN', 'Invalid or expired token')
      }

      // Convert AuthToken to User
      const user: User = {
        id: authToken.sub,
        email: authToken.email,
        name: authToken.email, // Use email as name for simplicity
        tenantId: authToken.tenantId,
        role: authToken.role,
        permissions: authToken.permissions,
        isActive: true
      }

      // Check required permissions
      for (const permission of requiredPermissions) {
        if (!user.permissions.includes(permission)) {
          throw new ApiError(403, 'INSUFFICIENT_PERMISSIONS', `Missing permission: ${permission}`)
        }
      }

      // Add user to request
      const authenticatedReq = req as NextRequest & { user: User }
      authenticatedReq.user = user

      return handler(authenticatedReq)
    })
  }
}

// Tenant isolation middleware
export function withTenantIsolation<T>(
  handler: (req: NextRequest & { user: User; tenantId: string }) => Promise<T>
) {
  return function (req: NextRequest & { user: User }) {
    return async (req: NextRequest & { user: User }) => {
      const url = new URL(req.url)
      const pathSegments = url.pathname.split('/')
      const tenantIdIndex = pathSegments.indexOf('tenants') + 1
      
      if (tenantIdIndex === 0 || !pathSegments[tenantIdIndex]) {
        throw new ApiError(400, 'MISSING_TENANT_ID', 'Tenant ID required in URL')
      }

      const tenantId = pathSegments[tenantIdIndex]
      
      // Verify user has access to this tenant
      if (req.user && !AuthorizationService.canAccessTenant(req.user, tenantId)) {
        throw new ApiError(403, 'TENANT_ACCESS_DENIED', `Access denied to tenant: ${tenantId}`)
      }

      const tenantReq = req as NextRequest & { user: User; tenantId: string }
      tenantReq.tenantId = tenantId

      return handler(tenantReq)
    }
  }
}
