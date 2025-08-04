export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'viewer'
  status: 'active' | 'inactive' | 'pending'
  avatar?: string
  lastLogin?: string
  createdAt: string
  tenantId?: string // Add tenant support for multi-tenancy
  firmwareVersion?: string // Add firmware version for users
}