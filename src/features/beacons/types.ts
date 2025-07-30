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
}