'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useLayout } from '@/contexts/LayoutContext'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
  tenantId: string
}

export default function Layout({ children, tenantId }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { config } = useLayout()

  const sidebarWidth = config.sidebarCollapsible === 'icon' ? 'lg:pl-16' : 'lg:pl-72'
  const contentPadding = config.contentLayout === 'centered' 
    ? 'max-w-7xl mx-auto px-4 md:px-6 lg:px-8' 
    : 'px-4 md:px-6 lg:px-8'

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        tenantId={tenantId}
        variant={config.sidebarVariant}
        collapsible={config.sidebarCollapsible}
      />
      <div className={cn(sidebarWidth)}>
        <Navbar setSidebarOpen={setSidebarOpen} tenantId={tenantId} />
        <main className={cn("flex-1 py-4", contentPadding)}>
          {children}
        </main>
      </div>
    </div>
  )
}