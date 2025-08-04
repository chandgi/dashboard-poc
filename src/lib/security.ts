/**
 * Security utilities for authentication, authorization, and data protection
 * Implements JWT-based auth, RBAC, input sanitization, and rate limiting
 */

import { logger } from './logger'

// Types for authentication and authorization
export interface User {
  id: string
  email: string
  name: string
  tenantId: string
  role: UserRole
  permissions: Permission[]
  lastLogin?: string
  isActive: boolean
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT_ADMIN = 'tenant_admin',
  USER = 'user',
  VIEWER = 'viewer'
}

export enum Permission {
  READ_USERS = 'read:users',
  WRITE_USERS = 'write:users',
  DELETE_USERS = 'delete:users',
  READ_BEACONS = 'read:beacons',
  WRITE_BEACONS = 'write:beacons',
  DELETE_BEACONS = 'delete:beacons',
  READ_ALERTS = 'read:alerts',
  WRITE_ALERTS = 'write:alerts',
  DELETE_ALERTS = 'delete:alerts',
  MANAGE_TENANT = 'manage:tenant',
  VIEW_ANALYTICS = 'view:analytics'
}

export interface AuthToken {
  sub: string // user ID
  email: string
  tenantId: string
  role: UserRole
  permissions: Permission[]
  iat: number
  exp: number
}

// Role-based permission mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.TENANT_ADMIN]: [
    Permission.READ_USERS,
    Permission.WRITE_USERS,
    Permission.READ_BEACONS,
    Permission.WRITE_BEACONS,
    Permission.READ_ALERTS,
    Permission.WRITE_ALERTS,
    Permission.MANAGE_TENANT,
    Permission.VIEW_ANALYTICS
  ],
  [UserRole.USER]: [
    Permission.READ_USERS,
    Permission.READ_BEACONS,
    Permission.READ_ALERTS,
    Permission.WRITE_ALERTS,
    Permission.VIEW_ANALYTICS
  ],
  [UserRole.VIEWER]: [
    Permission.READ_USERS,
    Permission.READ_BEACONS,
    Permission.READ_ALERTS,
    Permission.VIEW_ANALYTICS
  ]
}

// Authentication utilities
export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
  private static readonly TOKEN_EXPIRY = '24h'

  static async validateToken(token: string): Promise<AuthToken | null> {
    try {
      // In a real implementation, use a proper JWT library like jsonwebtoken
      // For now, we'll simulate token validation
      const decoded = this.decodeToken(token)
      
      if (!decoded || this.isTokenExpired(decoded)) {
        logger.securityEvent('Invalid or expired token', 'medium', { token: token.substring(0, 10) + '...' })
        return null
      }

      logger.info('Token validated successfully', { userId: decoded.sub, tenantId: decoded.tenantId })
      return decoded
    } catch (error) {
      logger.error('Token validation failed', error as Error, { token: token.substring(0, 10) + '...' })
      return null
    }
  }

  static generateToken(user: User): string {
    const payload: AuthToken = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      permissions: ROLE_PERMISSIONS[user.role],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }

    // In production, use proper JWT signing
    return btoa(JSON.stringify(payload))
  }

  private static decodeToken(token: string): AuthToken | null {
    try {
      return JSON.parse(atob(token))
    } catch {
      return null
    }
  }

  private static isTokenExpired(token: AuthToken): boolean {
    return token.exp < Math.floor(Date.now() / 1000)
  }
}

// Authorization utilities
export class AuthorizationService {
  static hasPermission(user: User, permission: Permission): boolean {
    const userPermissions = ROLE_PERMISSIONS[user.role]
    return userPermissions.includes(permission)
  }

  static canAccessTenant(user: User, tenantId: string): boolean {
    // Super admins can access any tenant
    if (user.role === UserRole.SUPER_ADMIN) {
      return true
    }
    
    // Other users can only access their own tenant
    return user.tenantId === tenantId
  }

  static requirePermission(user: User, permission: Permission): void {
    if (!this.hasPermission(user, permission)) {
      logger.securityEvent('Unauthorized access attempt', 'high', {
        userId: user.id,
        tenantId: user.tenantId,
        requiredPermission: permission,
        userRole: user.role
      })
      throw new UnauthorizedError(`Missing permission: ${permission}`)
    }
  }

  static requireTenantAccess(user: User, tenantId: string): void {
    if (!this.canAccessTenant(user, tenantId)) {
      logger.securityEvent('Cross-tenant access attempt', 'critical', {
        userId: user.id,
        userTenantId: user.tenantId,
        requestedTenantId: tenantId
      })
      throw new ForbiddenError(`Access denied to tenant: ${tenantId}`)
    }
  }
}

// Input sanitization and validation
export class SecurityValidator {
  // Prevent XSS attacks
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate tenant ID format (alphanumeric, hyphens, underscores)
  static isValidTenantId(tenantId: string): boolean {
    const tenantIdRegex = /^[a-zA-Z0-9_-]+$/
    return tenantIdRegex.test(tenantId) && tenantId.length >= 2 && tenantId.length <= 50
  }

  // Check for SQL injection patterns
  static detectSQLInjection(input: string): boolean {
    const sqlInjectionPatterns = [
      /('|(\\')|(--)|(%27)|(%22)|(%3D)|(\\\\))/i,
      /(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)/i
    ]
    
    return sqlInjectionPatterns.some(pattern => pattern.test(input))
  }

  // Validate API request data
  static validateApiInput(data: unknown): Record<string, unknown> {
    if (typeof data !== 'object' || data === null) {
      throw new ValidationError('Invalid request data')
    }

    const sanitized: Record<string, unknown> = {}
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        if (this.detectSQLInjection(value)) {
          logger.securityEvent('SQL injection attempt detected', 'critical', { 
            field: key, 
            value: value.substring(0, 100) 
          })
          throw new SecurityError('Potentially malicious input detected')
        }
        sanitized[key] = this.sanitizeInput(value)
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }
}

// Rate limiting
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>()

  static checkRateLimit(
    identifier: string, 
    maxRequests: number = 100, 
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): boolean {
    const now = Date.now()
    const requestData = this.requests.get(identifier)

    if (!requestData || now > requestData.resetTime) {
      this.requests.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (requestData.count >= maxRequests) {
      logger.securityEvent('Rate limit exceeded', 'medium', { 
        identifier, 
        requestCount: requestData.count,
        maxRequests 
      })
      return false
    }

    requestData.count++
    return true
  }

  static getRemainingRequests(identifier: string, maxRequests: number = 100): number {
    const requestData = this.requests.get(identifier)
    if (!requestData || Date.now() > requestData.resetTime) {
      return maxRequests
    }
    return Math.max(0, maxRequests - requestData.count)
  }
}

// Custom error classes
export class SecurityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SecurityError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Middleware for Next.js API routes
export function withSecurity(handler: (req: any, res: any) => Promise<void>) {
  return async (req: any, res: any) => {
    try {
      // Rate limiting
      const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      if (!RateLimiter.checkRateLimit(clientIp)) {
        return res.status(429).json({ error: 'Too many requests' })
      }

      // Input validation for POST/PUT/PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        req.body = SecurityValidator.validateApiInput(req.body)
      }

      // Authentication check
      const authHeader = req.headers.authorization
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const authToken = await AuthService.validateToken(token)
        if (authToken) {
          req.user = authToken
        }
      }

      await handler(req, res)
    } catch (error) {
      logger.error('Security middleware error', error as Error)
      
      if (error instanceof SecurityError || error instanceof ValidationError) {
        return res.status(400).json({ error: error.message })
      }
      if (error instanceof UnauthorizedError) {
        return res.status(401).json({ error: error.message })
      }
      if (error instanceof ForbiddenError) {
        return res.status(403).json({ error: error.message })
      }
      
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}
