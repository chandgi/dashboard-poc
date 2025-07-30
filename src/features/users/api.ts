import { User } from './types'

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-api.vercel.app/api' 
  : 'http://localhost:3001'

export const usersApi = {
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/users`)
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    return response.json()
  },

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
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
      throw new Error('Failed to create user')
    }
    return response.json()
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