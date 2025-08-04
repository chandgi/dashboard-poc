'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import BeaconTable from '@/features/beacons/BeaconTable'
import { Beacon } from '@/features/beacons/types'
import { beaconsApi } from '@/features/beacons/api'

interface BeaconsClientProps {
  tenantId: string
}

function BeaconsClient({ tenantId }: BeaconsClientProps) {
  const [beacons, setBeacons] = useState<Beacon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchBeacons = () => {
      beaconsApi.getBeacons()
        .then((data) => {
          if (isMounted) {
            setBeacons(data)
          }
        })
        .catch((error) => {
          if (isMounted) {
            console.error('Failed to fetch beacons:', error)
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false)
          }
        })
    }

    fetchBeacons()

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Beacons</h1>
          <p className="text-muted-foreground">
            Monitor and manage beacons for tenant <span className="font-semibold">{tenantId}</span>
          </p>
        </div>

        <BeaconTable beacons={beacons} />
      </div>
    </Layout>
  )
}

interface BeaconsPageProps {
  params: Promise<{ tenantId: string }>
}

export default async function BeaconsPage({ params }: BeaconsPageProps) {
  const { tenantId } = await params
  return <BeaconsClient tenantId={tenantId} />
}