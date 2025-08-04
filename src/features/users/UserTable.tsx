'use client'

import { User } from './types'
import Table, { Column } from '@/components/Table'
import { clsx } from 'clsx'

interface UserTableProps {
  users: User[]
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
}

const roleColors = {
  admin: 'bg-purple-100 text-purple-800',
  user: 'bg-blue-100 text-blue-800',
  viewer: 'bg-gray-100 text-gray-800',
}

export default function UserTable({ users }: UserTableProps) {
  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: (user) => (
        <div>
          <div className="font-medium text-gray-900">{user.name}</div>
          <div className="text-gray-500">{user.email}</div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      accessor: (user) => (
        <span
          className={clsx(
            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
            roleColors[user.role]
          )}
        >
          {user.role}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (user) => (
        <span
          className={clsx(
            'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
            statusColors[user.status]
          )}
        >
          {user.status}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      accessor: (user) => user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
    },
    {
      key: 'firmwareVersion',
      header: 'Firmware Version',
      accessor: (user) => (
        <span className="inline-flex px-2 py-1 text-xs font-mono bg-gray-100 text-gray-700 rounded">
          {user.firmwareVersion || 'N/A'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      accessor: (user) => new Date(user.createdAt).toLocaleDateString(),
    },
  ]

  return <Table data={users} columns={columns} emptyMessage="No users found" />
}