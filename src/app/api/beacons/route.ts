import { NextResponse } from 'next/server'
import { Beacon } from '@/features/beacons/types'

// Mock data - in production this would come from a database
const beacons: Beacon[] = [
  {
    id: "1",
    name: "Entrance Beacon",
    macAddress: "AA:BB:CC:DD:EE:01",
    location: "Main Entrance",
    status: "online",
    batteryLevel: 85,
    lastSeen: "2024-01-15T10:30:00Z",
    signalStrength: -45,
    firmware: "v2.1.0"
  },
  {
    id: "2",
    name: "Conference Room A",
    macAddress: "AA:BB:CC:DD:EE:02",
    location: "Conference Room A",
    status: "online",
    batteryLevel: 92,
    lastSeen: "2024-01-15T10:25:00Z",
    signalStrength: -38,
    firmware: "v2.1.0"
  },
  {
    id: "3",
    name: "Cafeteria Beacon",
    macAddress: "AA:BB:CC:DD:EE:03",
    location: "Cafeteria",
    status: "offline",
    batteryLevel: 23,
    lastSeen: "2024-01-14T18:45:00Z",
    signalStrength: -72,
    firmware: "v2.0.5"
  },
  {
    id: "4",
    name: "Parking Lot",
    macAddress: "AA:BB:CC:DD:EE:04",
    location: "North Parking",
    status: "online",
    batteryLevel: 67,
    lastSeen: "2024-01-15T10:20:00Z",
    signalStrength: -52,
    firmware: "v2.1.0"
  },
  {
    id: "5",
    name: "Emergency Exit",
    macAddress: "AA:BB:CC:DD:EE:05",
    location: "Emergency Exit B",
    status: "maintenance",
    batteryLevel: 78,
    lastSeen: "2024-01-15T10:28:00Z",
    signalStrength: -41,
    firmware: "v2.0.8"
  }
]

export async function GET() {
  try {
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 150))
    
    return NextResponse.json(beacons)
  } catch (error) {
    console.error('Error fetching beacons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch beacons' },
      { status: 500 }
    )
  }
}
