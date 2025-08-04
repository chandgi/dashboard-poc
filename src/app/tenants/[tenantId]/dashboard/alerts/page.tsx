'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import AlertTable from '@/features/alerts/AlertTable'
import { Alert } from '@/features/alerts/types'
import { alertsApi } from '@/features/alerts/api'

interface AlertsClientProps {
  tenantId: string
}

function AlertsClient({ tenantId }: AlertsClientProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchAlerts = () => {
      alertsApi.getAlerts()
        .then((data) => {
          if (isMounted) {
            setAlerts(data)
          }
        })
        .catch((error) => {
          if (isMounted) {
            console.error('Failed to fetch alerts:', error)
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false)
          }
        })
    }

    fetchAlerts()

    return () => {
      isMounted = false
    }
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
        <h1 className="text-2xl font-semibold text-gray-900">Alerts</h1>
        <p className="mt-2 text-sm text-gray-700">
          Monitor system alerts for tenant <span className="font-semibold">{tenantId}</span>
        </p>
      </div>

      <AlertTable alerts={alerts} />
    </Layout>
  )
}

interface AlertsPageProps {
  params: Promise<{ tenantId: string }>
}

export default async function AlertsPage({ params }: AlertsPageProps) {
  const { tenantId } = await params
  return <AlertsClient tenantId={tenantId} />
}