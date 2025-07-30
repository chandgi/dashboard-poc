'use client'

import { useEffect, useState } from 'react'
import Layout from '@/components/Layout'
import MetricCard from '@/components/MetricCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from '@/features/users/types'
import { Beacon } from '@/features/beacons/types'
import { Alert } from '@/features/alerts/types'
import { usersApi } from '@/features/users/api'
import { beaconsApi } from '@/features/beacons/api'
import { alertsApi } from '@/features/alerts/api'
import { Users, Wifi, AlertTriangle, Activity } from 'lucide-react'

interface DashboardClientProps {
  tenantId: string
}

function DashboardClient({ tenantId }: DashboardClientProps) {
  const [users, setUsers] = useState<User[]>([])
  const [beacons, setBeacons] = useState<Beacon[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, beaconsData, alertsData] = await Promise.all([
          usersApi.getUsers(),
          beaconsApi.getBeacons(),
          alertsApi.getAlerts(),
        ])
        setUsers(usersData)
        setBeacons(beaconsData)
        setAlerts(alertsData)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const activeAlerts = alerts.filter(alert => alert.status === 'active')
  const onlineBeacons = beacons.filter(beacon => beacon.status === 'online')
  const activeUsers = users.filter(user => user.status === 'active')

  if (loading) {
    return (
      <Layout tenantId={tenantId}>
        <div className="space-y-8">
          <div>
            <div className="h-8 bg-muted rounded w-64 mb-2"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-24"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout tenantId={tenantId}>
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome to the dashboard for tenant <span className="font-semibold">{tenantId}</span>
          </p>
        </div>

        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value="$1,250.00"
            trend={{ value: 12.5, label: "Trending up this month" }}
            secondaryDescription="Visitors for the last 6 months"
          />
          <MetricCard
            title="New Customers"
            value="1,234"
            trend={{ value: -20, label: "Down 20% this period" }}
            secondaryDescription="Acquisition needs attention"
          />
          <MetricCard
            title="Active Accounts"
            value="45,678"
            trend={{ value: 12.5, label: "Strong user retention" }}
            secondaryDescription="Engagement exceed targets"
          />
          <MetricCard
            title="Growth Rate"
            value="4.5%"
            trend={{ value: 4.5, label: "Steady performance increase" }}
            secondaryDescription="Meets growth projections"
          />
        </div>

        <div className="grid gap-6 md:gap-8 grid-cols-1 xl:grid-cols-2 *:data-[slot=card]:shadow-xs">
          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Latest system alerts requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeAlerts.length > 0 ? (
                activeAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/20">
                    <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500' :
                      alert.severity === 'high' ? 'bg-orange-500' :
                      alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium leading-none">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No active alerts</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current operational status of all systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">User Management</p>
                  <p className="text-xs text-muted-foreground">All user operations running smoothly</p>
                </div>
                <div className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Operational
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Beacon Network</p>
                  <p className="text-xs text-muted-foreground">All beacons connected and reporting</p>
                </div>
                <div className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Operational
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Alert System</p>
                  <p className="text-xs text-muted-foreground">Monitoring and alerting active</p>
                </div>
                <div className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  Operational
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Data Processing</p>
                  <p className="text-xs text-muted-foreground">Processing pipeline experiencing delays</p>
                </div>
                <div className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                  Degraded
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

interface DashboardPageProps {
  params: Promise<{ tenantId: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { tenantId } = await params
  return <DashboardClient tenantId={tenantId} />
}