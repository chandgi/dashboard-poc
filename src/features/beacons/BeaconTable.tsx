'use client'

import * as React from "react"
import { Beacon } from './types'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SortableTableHead } from "@/components/data-table/data-table-column-header"
import { MoreHorizontal, Download, Eye } from "lucide-react"

interface BeaconTableProps {
  beacons: Beacon[]
}

type SortField = 'name' | 'location' | 'status' | 'batteryLevel' | 'lastSeen'
type SortDirection = 'asc' | 'desc' | null

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  online: "default",
  offline: "destructive",
  maintenance: "secondary",
}

export default function BeaconTable({ beacons }: BeaconTableProps) {
  const [selectedBeacons, setSelectedBeacons] = React.useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = React.useState(1)
  const [sortField, setSortField] = React.useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null)
  const itemsPerPage = 10

  // Sorting function
  const sortedBeacons = React.useMemo(() => {
    if (!sortField || !sortDirection) return beacons

    return [...beacons].sort((a, b) => {
      let aValue: string | number = a[sortField] as string | number
      let bValue: string | number = b[sortField] as string | number

      // Special handling for different data types
      if (sortField === 'lastSeen') {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      } else if (sortField === 'batteryLevel') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [beacons, sortField, sortDirection])

  const totalPages = Math.ceil(sortedBeacons.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBeacons = sortedBeacons.slice(startIndex, endIndex)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
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
      setSelectedBeacons(new Set(currentBeacons.map(beacon => beacon.id)))
    } else {
      setSelectedBeacons(new Set())
    }
  }

  const handleSelectBeacon = (beaconId: string, checked: boolean) => {
    const newSelected = new Set(selectedBeacons)
    if (checked) {
      newSelected.add(beaconId)
    } else {
      newSelected.delete(beaconId)
    }
    setSelectedBeacons(newSelected)
  }

  const isAllSelected = currentBeacons.length > 0 && currentBeacons.every(beacon => selectedBeacons.has(beacon.id))
  const isIndeterminate = selectedBeacons.size > 0 && !isAllSelected

  return (
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle>Recent Beacons</CardTitle>
        <CardDescription>Track and manage your latest beacons and their status.</CardDescription>
        <CardAction>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4" />
              <span className="hidden lg:inline">View</span>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              <span className="hidden lg:inline">Export</span>
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex size-full flex-col gap-4">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableHead>
                <TableHead>Ref</TableHead>
                <SortableTableHead
                  field="name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Name
                </SortableTableHead>
                <SortableTableHead
                  field="location"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Location
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
                  field="batteryLevel"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Battery
                </SortableTableHead>
                <SortableTableHead
                  field="lastSeen"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  Last Activity
                </SortableTableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentBeacons.map((beacon) => (
                <TableRow key={beacon.id} data-state={selectedBeacons.has(beacon.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selectedBeacons.has(beacon.id)}
                      onChange={(e) => handleSelectBeacon(beacon.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{beacon.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{beacon.name}</div>
                      <div className="text-sm text-muted-foreground">{beacon.macAddress}</div>
                    </div>
                  </TableCell>
                  <TableCell>{beacon.location}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[beacon.status] || "outline"}>
                      {beacon.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            beacon.batteryLevel > 50
                              ? 'bg-green-500'
                              : beacon.batteryLevel > 20
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${beacon.batteryLevel}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{beacon.batteryLevel}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(beacon.lastSeen).toLocaleString()}
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
        </div>
        
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {selectedBeacons.size} of {currentBeacons.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <select className="h-8 w-[70px] rounded border border-input bg-background px-3 py-1 text-sm">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to first page</span>
                {"<<"}
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="sr-only">Go to previous page</span>
                {"<"}
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to next page</span>
                {">"}
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <span className="sr-only">Go to last page</span>
                {">>"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}