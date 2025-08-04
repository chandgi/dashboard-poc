import { NextResponse } from 'next/server'
import { User } from '@/features/users/types'

// Mock data - in production this would come from a database
const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
    status: "active",
    lastLogin: "2024-01-15T10:30:00Z",
    createdAt: "2023-12-01T09:00:00Z",
    firmwareVersion: "v1.2.5"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "user",
    status: "active",
    lastLogin: "2024-01-14T16:45:00Z",
    createdAt: "2023-12-02T11:30:00Z",
    firmwareVersion: "v1.2.3"
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "viewer",
    status: "inactive",
    lastLogin: "2024-01-10T08:20:00Z",
    createdAt: "2023-12-03T14:15:00Z",
    firmwareVersion: "v1.1.9"
  },
  {
    id: "4",
    name: "Alice Brown",
    email: "alice.brown@example.com",
    role: "user",
    status: "pending",
    createdAt: "2023-12-04T16:45:00Z",
    firmwareVersion: "v1.2.4"
  }
]

export async function GET() {
  try {
    // Add a small delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
