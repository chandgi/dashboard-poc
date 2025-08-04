export interface Beacon {
  id: string
  name: string
  macAddress: string
  location: string
  status: 'online' | 'offline' | 'maintenance'
  batteryLevel: number
  lastSeen: string
  signalStrength: number
  firmware: string
  tenantId?: string // Add tenant support for multi-tenancy
}