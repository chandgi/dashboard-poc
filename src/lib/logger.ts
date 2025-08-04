/**
 * Centralized logging system with structured logging and different log levels
 * Supports both client and server-side logging with proper error handling
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  error?: Error
  userId?: string
  tenantId?: string
  requestId?: string
  performanceMetrics?: {
    duration?: number
    memoryUsage?: number
  }
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO
  private isDevelopment = process.env.NODE_ENV === 'development'

  constructor() {
    // Set log level based on environment
    if (this.isDevelopment) {
      this.logLevel = LogLevel.DEBUG
    } else if (process.env.LOG_LEVEL) {
      this.logLevel = parseInt(process.env.LOG_LEVEL) as LogLevel
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, error, userId, tenantId, requestId, performanceMetrics } = entry
    
    const logData = {
      timestamp,
      level: LogLevel[level],
      message,
      ...(userId && { userId }),
      ...(tenantId && { tenantId }),
      ...(requestId && { requestId }),
      ...(context && { context }),
      ...(performanceMetrics && { performanceMetrics }),
      ...(error && { 
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    }

    return JSON.stringify(logData, null, this.isDevelopment ? 2 : 0)
  }

  private log(level: LogLevel, message: string, options: Partial<LogEntry> = {}): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...options
    }

    const formattedLog = this.formatLog(entry)

    // In development, use console methods for better DX
    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.ERROR:
          console.error(formattedLog)
          break
        case LogLevel.WARN:
          console.warn(formattedLog)
          break
        case LogLevel.INFO:
          console.info(formattedLog)
          break
        case LogLevel.DEBUG:
          console.debug(formattedLog)
          break
      }
    } else {
      // In production, send to logging service (e.g., DataDog, LogRocket, Sentry)
      console.log(formattedLog)
      
      // TODO: Send to external logging service
      // await this.sendToExternalService(entry)
    }
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, { error, context })
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, { context })
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, { context })
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, { context })
  }

  // Specialized logging methods
  apiRequest(method: string, url: string, duration: number, statusCode: number, context?: Record<string, unknown>): void {
    this.info(`API Request: ${method} ${url}`, {
      ...context,
      performanceMetrics: { duration },
      api: { method, url, statusCode }
    })
  }

  userAction(action: string, userId: string, tenantId: string, context?: Record<string, unknown>): void {
    this.info(`User Action: ${action}`, {
      ...context,
      userId,
      tenantId,
      userAction: action
    })
  }

  securityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: Record<string, unknown>): void {
    this.warn(`Security Event: ${event}`, {
      ...context,
      security: { event, severity }
    })
  }

  performanceMetric(operation: string, duration: number, context?: Record<string, unknown>): void {
    this.info(`Performance: ${operation}`, {
      ...context,
      performanceMetrics: { duration }
    })
  }

  // Method to set user context for the logger
  setUserContext(userId: string, tenantId: string): void {
    // This would typically be stored in a context or async local storage
    // For now, we'll pass it explicitly to each log method
  }
}

export const logger = new Logger()

// Performance monitoring utility
export class PerformanceMonitor {
  private startTime: number
  private operation: string

  constructor(operation: string) {
    this.operation = operation
    this.startTime = performance.now()
  }

  end(context?: Record<string, unknown>): void {
    const duration = performance.now() - this.startTime
    logger.performanceMetric(this.operation, duration, context)
  }
}

// Higher-order function for monitoring API calls
export function withPerformanceMonitoring<T extends (...args: unknown[]) => Promise<unknown>>(
  operation: string,
  fn: T
): T {
  return (async (...args: unknown[]) => {
    const monitor = new PerformanceMonitor(operation)
    try {
      const result = await fn(...args)
      monitor.end({ success: true })
      return result
    } catch (error) {
      monitor.end({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  }) as T
}
