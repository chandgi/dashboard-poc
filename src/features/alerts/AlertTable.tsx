'use client'

import { useState } from 'react'
import { Alert } from './types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table'
import { SortableTableHead } from '@/components/data-table/data-table-column-header'
import { MoreHorizontal } from 'lucide-react'

interface AlertTableProps {
  alerts: Alert[]
}

type SortField = 'title' | 'severity' | 'status' | 'source' | 'timestamp' | 'resolvedAt'
type SortDirection = 'asc' | 'desc' | null

const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 }
const statusOrder = { resolved: 1, acknowledged: 2, active: 3 }

export default function AlertTable({ alerts }: AlertTableProps) {
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlerts(new Set(alerts.map(alert => alert.id)))
    } else {
      setSelectedAlerts(new Set())
    }
  }

  const handleSelectAlert = (alertId: string, checked: boolean) => {
    const newSelected = new Set(selectedAlerts)
    if (checked) {
      newSelected.add(alertId)
    } else {
      newSelected.delete(alertId)
    }
    setSelectedAlerts(newSelected)
  }

  const sortedAlerts = [...alerts].sort((a, b) => {
    if (!sortField || !sortDirection) return 0

    let aValue: string | number = a[sortField] as string | number
    let bValue: string | number = b[sortField] as string | number

    // Handle special sorting for severity and status
    if (sortField === 'severity') {
      aValue = severityOrder[a.severity as keyof typeof severityOrder]
      bValue = severityOrder[b.severity as keyof typeof severityOrder]
    } else if (sortField === 'status') {
      aValue = statusOrder[a.status as keyof typeof statusOrder]
      bValue = statusOrder[b.status as keyof typeof statusOrder]
    } else if (sortField === 'timestamp' || sortField === 'resolvedAt') {
      aValue = aValue ? new Date(aValue as string).getTime() : 0
      bValue = bValue ? new Date(bValue as string).getTime() : 0
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const getSeverityVariant = (severity: Alert['severity']) => {
    switch (severity) {
      case 'low': return 'default'
      case 'medium': return 'secondary'
      case 'high': return 'destructive'
      case 'critical': return 'destructive'
      default: return 'default'
    }
  }

  const getStatusVariant = (status: Alert['status']) => {
    switch (status) {
      case 'active': return 'destructive'
      case 'acknowledged': return 'secondary'
      case 'resolved': return 'default'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedAlerts.size === alerts.length && alerts.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </TableHead>
            <TableHead>Ref</TableHead>
            <SortableTableHead
              field="title"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Alert
            </SortableTableHead>
            <SortableTableHead
              field="severity"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Severity
            </SortableTableHead>
            <SortableTableHead
              field="status"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Status
            </SortableTableHead>
            <SortableTableHead
              field="source"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Source
            </SortableTableHead>
            <SortableTableHead
              field="timestamp"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Created
            </SortableTableHead>
            <SortableTableHead
              field="resolvedAt"
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Resolved
            </SortableTableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedAlerts.map((alert, index) => (
            <TableRow key={alert.id} data-state={selectedAlerts.has(alert.id) ? "selected" : undefined}>
              <TableCell>
                <Checkbox
                  checked={selectedAlerts.has(alert.id)}
                  onChange={(e) => handleSelectAlert(alert.id, e.target.checked)}
                />
              </TableCell>
              <TableCell className="font-medium text-muted-foreground">
                #{String(index + 1).padStart(3, '0')}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{alert.title}</div>
                  <div className="text-sm text-muted-foreground">{alert.message}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getSeverityVariant(alert.severity)} className="capitalize">
                  {alert.severity}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(alert.status)} className="capitalize">
                  {alert.status}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{alert.source}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(alert.timestamp).toLocaleString()}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : '-'}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {alerts.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          No alerts found
        </div>
      )}
    </div>
  )
}