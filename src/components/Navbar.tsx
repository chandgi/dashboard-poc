'use client'

import { useState } from 'react'
import { Menu, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import LayoutSettings from './LayoutSettings'

interface NavbarProps {
  setSidebarOpen: (open: boolean) => void
  tenantId: string
}

export default function Navbar({ setSidebarOpen, tenantId }: NavbarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </Button>

          <Separator orientation="vertical" className="mx-4 h-6 lg:hidden" />

          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-4">
              <Separator orientation="vertical" className="hidden lg:block h-6" />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Tenant:</span>
                <span className="font-semibold">{tenantId}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome back!</span>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSettingsOpen(true)}
                  className="relative"
                >
                  <span className="sr-only">Layout settings</span>
                  <Settings className="h-4 w-4" />
                </Button>
                <LayoutSettings 
                  isOpen={settingsOpen}
                  onClose={() => setSettingsOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}