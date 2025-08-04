import { NextResponse } from 'next/server'
import { Alert } from '@/features/alerts/types'

// Mock data - in production this would come from a database
const alerts: Alert[] = [
  {
    id: "1",
    title: "Low Battery Warning",
    message: "Beacon in Cafeteria has low battery (23%)",
    severity: "medium",
    status: "active",
    source: "Beacon Monitor",
    timestamp: "2024-01-15T09:30:00Z"
  },
  {
    id: "2",
    title: "Connection Lost",
    message: "Lost connection to Parking Lot beacon",
    severity: "high",
    status: "acknowledged",
    source: "Network Monitor",
    timestamp: "2024-01-15T08:45:00Z",
    assignedTo: "John Doe"
  },
  {
    id: "3",
    title: "Maintenance Required",
    message: "Emergency Exit beacon scheduled for maintenance",
    severity: "low",
    status: "resolved",
    source: "Maintenance System",
    timestamp: "2024-01-14T16:20:00Z",
    resolvedAt: "2024-01-15T10:00:00Z",
    assignedTo: "Jane Smith"
  },
  {
    id: "4",
    title: "Security Breach Detected",
    message: "Unauthorized access attempt detected at Main Entrance",
    severity: "critical",
    status: "active",
    source: "Security System",
    timestamp: "2024-01-15T10:15:00Z"
  },
  {
    id: "5",
    title: "Signal Strength Low",
    message: "Conference Room A beacon signal strength below threshold",
    severity: "medium",
    status: "acknowledged",
    source: "Signal Monitor",
    timestamp: "2024-01-15T09:50:00Z",
    assignedTo: "Bob Johnson"
  },
  {
    id: "6",
    title: "System Update Available",
    message: "Firmware update available for 3 beacons",
    severity: "low",
    status: "active",
    source: "Update Manager",
    timestamp: "2024-01-15T07:30:00Z"
  }
]

export async function GET() {
  try {
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 120))
    
    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}
