'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import UserTable from '@/features/users/UserTable'
import { User } from '@/features/users/types'
import { usersApi } from '@/features/users/api'

interface UsersClientProps {
  tenantId: string
}

function UsersClient({ tenantId }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await usersApi.getUsers()
        setUsers(data)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return (
      <Layout tenantId={tenantId}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="bg-white shadow rounded-lg h-96"></div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout tenantId={tenantId}>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="mt-2 text-sm text-gray-700">
          Manage users for tenant <span className="font-semibold">{tenantId}</span>
        </p>
      </div>

      <UserTable users={users} />
    </Layout>
  )
}

interface UsersPageProps {
  params: Promise<{ tenantId: string }>
}

export default async function UsersPage({ params }: UsersPageProps) {
  const { tenantId } = await params
  return <UsersClient tenantId={tenantId} />
}