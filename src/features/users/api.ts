import { User } from './types'
import { logger, PerformanceMonitor } from '@/lib/logger'
import { cacheManager } from '@/lib/scalability'

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-api.vercel.app/api' 
  : 'http://localhost:3001'

export const usersApi = {
  async getUsers(): Promise<User[]> {
    const monitor = new PerformanceMonitor('fetch_users')
    try {
      // Try cache first
      const cached = await cacheManager.get<User[]>('users:all')
      if (cached) {
        logger.debug('Users loaded from cache')
        return cached
      }

      const response = await fetch(`${API_BASE}/users`)
      if (!response.ok) {
        logger.error('Failed to fetch users', new Error(`HTTP ${response.status}`), {
          status: response.status,
          statusText: response.statusText
        })
        throw new Error('Failed to fetch users')
      }
      
      const users = await response.json()
      
      // Cache for 5 minutes
      await cacheManager.set('users:all', users, 300)
      
      logger.info('Users fetched successfully', { count: users.length })
      return users
    } catch (error) {
      logger.error('Users API error', error as Error)
      throw error
    } finally {
      monitor.end()
    }
  },

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const monitor = new PerformanceMonitor('create_user')
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...user,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }),
      })
      
      if (!response.ok) {
        logger.error('Failed to create user', new Error(`HTTP ${response.status}`), {
          status: response.status,
          user: { name: user.name, email: user.email }
        })
        throw new Error('Failed to create user')
      }
      
      const newUser = await response.json()
      
      // Invalidate cache
      await cacheManager.delete('users:all')
      
      logger.info('User created successfully', { userId: newUser.id, email: newUser.email })
      return newUser
    } catch (error) {
      logger.error('Create user API error', error as Error)
      throw error
    } finally {
      monitor.end()
    }
  },

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
    if (!response.ok) {
      throw new Error('Failed to update user')
    }
    return response.json()
  },

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete user')
    }
  },
}