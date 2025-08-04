export interface Alert {
  id: string
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'resolved' | 'acknowledged'
  source: string
  timestamp: string
  resolvedAt?: string
  assignedTo?: string
  tenantId?: string // Add tenant support for multi-tenancy
}