import { Alert } from './types'

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URLs in production to use the same domain
  : 'http://localhost:3001'

export const alertsApi = {
  async getAlerts(): Promise<Alert[]> {
    const response = await fetch(`${API_BASE}/api/alerts`)
    if (!response.ok) {
      throw new Error('Failed to fetch alerts')
    }
    return response.json()
  },

  async createAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Promise<Alert> {
    const response = await fetch(`${API_BASE}/api/alerts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...alert,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      }),
    })
    if (!response.ok) {
      throw new Error('Failed to create alert')
    }
    return response.json()
  },

  async updateAlert(id: string, alert: Partial<Alert>): Promise<Alert> {
    const response = await fetch(`${API_BASE}/api/alerts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alert),
    })
    if (!response.ok) {
      throw new Error('Failed to update alert')
    }
    return response.json()
  },

  async deleteAlert(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/alerts/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete alert')
    }
  },
}