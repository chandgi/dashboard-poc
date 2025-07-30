export interface Alert {
  id: string
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'active' | 'acknowledged' | 'resolved'
  source: string
  timestamp: string
  resolvedAt?: string
  resolvedBy?: string
}