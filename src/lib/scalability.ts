/**
 * Scalability utilities for caching, database optimization, and performance
 * Implements Redis-like caching, connection pooling, and query optimization
 */

import { logger, PerformanceMonitor } from './logger'

// Cache interface for different implementations
export interface CacheProvider {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  exists(key: string): Promise<boolean>
}

// In-memory cache implementation (for development/small scale)
class InMemoryCache implements CacheProvider {
  private cache = new Map<string, { value: unknown; expiry?: number }>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (entry.expiry && Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }
    
    logger.debug('Cache hit', { key })
    return entry.value as T
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiry = ttlSeconds ? Date.now() + (ttlSeconds * 1000) : undefined
    this.cache.set(key, { value, expiry })
    logger.debug('Cache set', { key, ttlSeconds })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
    logger.debug('Cache delete', { key })
  }

  async clear(): Promise<void> {
    this.cache.clear()
    logger.debug('Cache cleared')
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key)
  }

  private cleanup(): void {
    const now = Date.now()
    let expiredCount = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry && now > entry.expiry) {
        this.cache.delete(key)
        expiredCount++
      }
    }
    
    if (expiredCount > 0) {
      logger.debug('Cache cleanup completed', { expiredEntries: expiredCount })
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.cache.clear()
  }
}

// Redis cache implementation (for production)
class RedisCache implements CacheProvider {
  // In a real implementation, this would use a Redis client like ioredis
  // For now, we'll provide the interface structure
  
  async get<T>(key: string): Promise<T | null> {
    // TODO: Implement Redis get
    logger.debug('Redis cache get', { key })
    return null
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    // TODO: Implement Redis set with TTL
    logger.debug('Redis cache set', { key, ttlSeconds })
  }

  async delete(key: string): Promise<void> {
    // TODO: Implement Redis delete
    logger.debug('Redis cache delete', { key })
  }

  async clear(): Promise<void> {
    // TODO: Implement Redis clear
    logger.debug('Redis cache clear')
  }

  async exists(key: string): Promise<boolean> {
    // TODO: Implement Redis exists
    logger.debug('Redis cache exists', { key })
    return false
  }
}

// Cache manager with different strategies
export class CacheManager {
  private provider: CacheProvider
  private hitCount = 0
  private missCount = 0

  constructor() {
    // Use Redis in production, in-memory for development
    if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
      this.provider = new RedisCache()
    } else {
      this.provider = new InMemoryCache()
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const monitor = new PerformanceMonitor(`cache_get_${key}`)
    try {
      const result = await this.provider.get<T>(key)
      if (result !== null) {
        this.hitCount++
        logger.debug('Cache hit', { key, hitRate: this.getHitRate() })
      } else {
        this.missCount++
        logger.debug('Cache miss', { key, hitRate: this.getHitRate() })
      }
      return result
    } finally {
      monitor.end()
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.provider.set(key, value, ttlSeconds)
  }

  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttlSeconds?: number
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await fetcher()
    await this.set(key, value, ttlSeconds)
    return value
  }

  async delete(key: string): Promise<void> {
    await this.provider.delete(key)
  }

  async clear(): Promise<void> {
    await this.provider.clear()
    this.hitCount = 0
    this.missCount = 0
  }

  getHitRate(): number {
    const total = this.hitCount + this.missCount
    return total === 0 ? 0 : this.hitCount / total
  }

  getStats(): { hits: number; misses: number; hitRate: number } {
    return {
      hits: this.hitCount,
      misses: this.missCount,
      hitRate: this.getHitRate()
    }
  }
}

// Database connection pool and optimization
export class DatabaseManager {
  private connectionPool: unknown[] = [] // In real implementation, use proper DB pool
  private maxConnections = 20
  private activeConnections = 0

  async getConnection(): Promise<unknown> {
    if (this.activeConnections >= this.maxConnections) {
      logger.warn('Connection pool exhausted', { 
        active: this.activeConnections, 
        max: this.maxConnections 
      })
      // In real implementation, wait for available connection or timeout
      throw new Error('Connection pool exhausted')
    }

    this.activeConnections++
    logger.debug('Database connection acquired', { active: this.activeConnections })
    return {} // Mock connection
  }

  async releaseConnection(connection: unknown): Promise<void> {
    this.activeConnections--
    logger.debug('Database connection released', { active: this.activeConnections })
  }

  async executeQuery<T>(query: string, params?: unknown[]): Promise<T[]> {
    const monitor = new PerformanceMonitor(`db_query_${query.split(' ')[0]}`)
    const connection = await this.getConnection()
    
    try {
      logger.debug('Executing database query', { query, params })
      
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
      
      // Mock result
      return [] as T[]
    } catch (error) {
      logger.error('Database query failed', error as Error, { query, params })
      throw error
    } finally {
      await this.releaseConnection(connection)
      monitor.end()
    }
  }

  getPoolStats(): { active: number; max: number; usage: number } {
    return {
      active: this.activeConnections,
      max: this.maxConnections,
      usage: this.activeConnections / this.maxConnections
    }
  }
}

// Query optimization utilities
export class QueryOptimizer {
  static buildSelectQuery(
    table: string, 
    fields: string[] = ['*'], 
    conditions: Record<string, unknown> = {},
    options: { limit?: number; offset?: number; orderBy?: string } = {}
  ): { query: string; params: unknown[] } {
    let query = `SELECT ${fields.join(', ')} FROM ${table}`
    const params: unknown[] = []

    // WHERE clause
    if (Object.keys(conditions).length > 0) {
      const whereConditions = Object.keys(conditions).map((key, index) => {
        params.push(conditions[key])
        return `${key} = $${index + 1}`
      })
      query += ` WHERE ${whereConditions.join(' AND ')}`
    }

    // ORDER BY
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`
    }

    // LIMIT
    if (options.limit) {
      query += ` LIMIT ${options.limit}`
    }

    // OFFSET
    if (options.offset) {
      query += ` OFFSET ${options.offset}`
    }

    return { query, params }
  }

  static buildCacheKey(operation: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    
    return `${operation}:${sortedParams}`
  }
}

// Performance monitoring and metrics
export class PerformanceTracker {
  private metrics = new Map<string, { count: number; totalTime: number; avgTime: number }>()

  recordOperation(operation: string, duration: number): void {
    const existing = this.metrics.get(operation) || { count: 0, totalTime: 0, avgTime: 0 }
    existing.count++
    existing.totalTime += duration
    existing.avgTime = existing.totalTime / existing.count
    
    this.metrics.set(operation, existing)

    // Log slow operations
    if (duration > 1000) { // More than 1 second
      logger.warn('Slow operation detected', { operation, duration })
    }
  }

  getMetrics(): Record<string, { count: number; totalTime: number; avgTime: number }> {
    return Object.fromEntries(this.metrics)
  }

  getSlowestOperations(limit = 5): Array<{ operation: string; avgTime: number }> {
    return Array.from(this.metrics.entries())
      .map(([operation, metrics]) => ({ operation, avgTime: metrics.avgTime }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit)
  }
}

// Batch processing for efficient data operations
export class BatchProcessor<T> {
  private batch: T[] = []
  private batchSize: number
  private processor: (items: T[]) => Promise<void>
  private flushTimeout?: NodeJS.Timeout

  constructor(
    batchSize: number,
    processor: (items: T[]) => Promise<void>,
    autoFlushMs = 5000
  ) {
    this.batchSize = batchSize
    this.processor = processor
    
    // Auto-flush every 5 seconds
    this.flushTimeout = setInterval(() => {
      if (this.batch.length > 0) {
        this.flush()
      }
    }, autoFlushMs)
  }

  add(item: T): void {
    this.batch.push(item)
    
    if (this.batch.length >= this.batchSize) {
      this.flush()
    }
  }

  async flush(): Promise<void> {
    if (this.batch.length === 0) return

    const items = [...this.batch]
    this.batch = []

    try {
      await this.processor(items)
      logger.debug('Batch processed successfully', { itemCount: items.length })
    } catch (error) {
      logger.error('Batch processing failed', error as Error, { itemCount: items.length })
      // Re-add items to batch for retry logic if needed
      this.batch.unshift(...items)
    }
  }

  destroy(): void {
    if (this.flushTimeout) {
      clearInterval(this.flushTimeout)
    }
    this.flush() // Final flush
  }
}

// Global instances
export const cacheManager = new CacheManager()
export const databaseManager = new DatabaseManager()
export const performanceTracker = new PerformanceTracker()

// Utility decorators for caching
export function cached(ttlSeconds = 300) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`
      
      return await cacheManager.getOrSet(
        cacheKey,
        () => method.apply(this, args),
        ttlSeconds
      )
    }

    return descriptor
  }
}

// Health check utilities
export class HealthChecker {
  static async checkDatabase(): Promise<{ healthy: boolean; responseTime: number }> {
    const start = performance.now()
    try {
      await databaseManager.executeQuery('SELECT 1')
      return { healthy: true, responseTime: performance.now() - start }
    } catch (error) {
      logger.error('Database health check failed', error as Error)
      return { healthy: false, responseTime: performance.now() - start }
    }
  }

  static async checkCache(): Promise<{ healthy: boolean; responseTime: number; stats: any }> {
    const start = performance.now()
    try {
      await cacheManager.set('health_check', 'ok', 60)
      const value = await cacheManager.get('health_check')
      await cacheManager.delete('health_check')
      
      return {
        healthy: value === 'ok',
        responseTime: performance.now() - start,
        stats: cacheManager.getStats()
      }
    } catch (error) {
      logger.error('Cache health check failed', error as Error)
      return { 
        healthy: false, 
        responseTime: performance.now() - start, 
        stats: null 
      }
    }
  }

  static async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: Record<string, any>
    timestamp: string
  }> {
    const checks = {
      database: await this.checkDatabase(),
      cache: await this.checkCache(),
      memory: {
        healthy: process.memoryUsage().heapUsed < 500 * 1024 * 1024, // 500MB limit
        usage: process.memoryUsage()
      }
    }

    const unhealthyChecks = Object.values(checks).filter(check => !check.healthy).length
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    
    if (unhealthyChecks > 0) {
      status = unhealthyChecks >= 2 ? 'unhealthy' : 'degraded'
    }

    return {
      status,
      checks,
      timestamp: new Date().toISOString()
    }
  }
}
