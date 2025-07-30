import { Beacon } from './types'

const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-api.vercel.app/api' 
  : 'http://localhost:3001'

export const beaconsApi = {
  async getBeacons(): Promise<Beacon[]> {
    const response = await fetch(`${API_BASE}/beacons`)
    if (!response.ok) {
      throw new Error('Failed to fetch beacons')
    }
    return response.json()
  },

  async createBeacon(beacon: Omit<Beacon, 'id'>): Promise<Beacon> {
    const response = await fetch(`${API_BASE}/beacons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...beacon,
        id: crypto.randomUUID(),
      }),
    })
    if (!response.ok) {
      throw new Error('Failed to create beacon')
    }
    return response.json()
  },

  async updateBeacon(id: string, beacon: Partial<Beacon>): Promise<Beacon> {
    const response = await fetch(`${API_BASE}/beacons/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(beacon),
    })
    if (!response.ok) {
      throw new Error('Failed to update beacon')
    }
    return response.json()
  },

  async deleteBeacon(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/beacons/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete beacon')
    }
  },
}