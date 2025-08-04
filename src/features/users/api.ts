import { User } from './types'

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URLs in production to use the same domain
  : 'http://localhost:3001'

export const usersApi = {
  async getUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE}/api/users`)
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      
      const users = await response.json()
      return users
    } catch (error) {
      console.error('Users API error:', error)
      throw error
    }
  },

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      const response = await fetch(`${API_BASE}/api/users`, {
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
        throw new Error('Failed to create user')
      }
      
      const newUser = await response.json()
      return newUser
    } catch (error) {
      console.error('Create user API error:', error)
      throw error
    }
  },

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    const response = await fetch(`${API_BASE}/api/users/${id}`, {
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
    const response = await fetch(`${API_BASE}/api/users/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete user')
    }
  },
}