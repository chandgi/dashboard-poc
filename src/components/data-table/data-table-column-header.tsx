import * as React from "react"
import { Button } from "@/components/ui/button"
import { TableHead } from "@/components/ui/table"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column?: {
    getIsSorted: () => false | "asc" | "desc"
    toggleSorting: (desc?: boolean) => void
    getCanSort: () => boolean
  }
  title: string
  onSort?: () => void
  sortDirection?: 'asc' | 'desc' | null
  className?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  onSort,
  sortDirection,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const getSortIcon = () => {
    if (!sortDirection) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />
    }
    if (sortDirection === 'desc') {
      return <ArrowDown className="ml-2 h-4 w-4" />
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />
  }

  if (!onSort) {
    return <span className={cn("font-medium", className)}>{title}</span>
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "-ml-3 h-8 data-[state=open]:bg-accent",
        className
      )}
      onClick={onSort}
    >
      <span>{title}</span>
      {getSortIcon()}
    </Button>
  )
}

interface SortableTableHeadProps<T> extends React.ThHTMLAttributes<HTMLTableCellElement> {
  field: T
  sortField: T | null
  sortDirection: 'asc' | 'desc' | null
  onSort: (field: T) => void
  children: React.ReactNode
}

export function SortableTableHead<T>({ 
  field,
  sortField,
  sortDirection,
  onSort, 
  children, 
  className, 
  ...props 
}: SortableTableHeadProps<T>) {
  const isActive = sortField === field
  const currentDirection = isActive ? sortDirection : null
  
  return (
    <TableHead className={className} {...props}>
      <DataTableColumnHeader
        title={children as string}
        onSort={() => onSort(field)}
        sortDirection={currentDirection}
      />
    </TableHead>
  )
}
