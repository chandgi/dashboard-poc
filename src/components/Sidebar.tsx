'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Home, Users, Wifi, AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  tenantId: string
  variant?: 'inset' | 'sidebar' | 'floating'
  collapsible?: 'icon' | 'offcanvas'
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Beacons', href: '/dashboard/beacons', icon: Wifi },
  { name: 'Alerts', href: '/dashboard/alerts', icon: AlertTriangle },
]

export default function Sidebar({ 
  sidebarOpen, 
  setSidebarOpen, 
  tenantId, 
  variant = 'sidebar', 
  collapsible = 'offcanvas' 
}: SidebarProps) {
  const pathname = usePathname()

  const sidebarWidth = collapsible === 'icon' ? 'lg:w-16' : 'lg:w-72'
  const sidebarClasses = cn(
    "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
    sidebarWidth,
    {
      'lg:bg-background lg:border-r': variant === 'sidebar',
      'lg:bg-background lg:border lg:rounded-lg lg:m-2 lg:shadow-sm': variant === 'inset',
      'lg:bg-background lg:border lg:rounded-lg lg:m-4 lg:shadow-lg': variant === 'floating',
    }
  )

  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarOpen(false)}
                      className="text-muted-foreground"
                    >
                      <span className="sr-only">Close sidebar</span>
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                </Transition.Child>
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background border-r px-6 pb-2">
                  <div className="flex h-16 shrink-0 items-center">
                    <h1 className="text-lg font-semibold">Dashboard</h1>
                  </div>
                  <Separator />
                  <nav className="flex flex-1 flex-col space-y-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={`/tenants/${tenantId}${item.href}`}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          pathname === `/tenants/${tenantId}${item.href}`
                            ? 'bg-secondary text-secondary-foreground'
                            : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <div className={sidebarClasses}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6">
          <div className="flex h-16 shrink-0 items-center">
            {collapsible === 'icon' ? (
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">D</span>
              </div>
            ) : (
              <h1 className="text-lg font-semibold">Dashboard</h1>
            )}
          </div>
          <Separator />
          <nav className="flex flex-1 flex-col space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={`/tenants/${tenantId}${item.href}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === `/tenants/${tenantId}${item.href}`
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground',
                  collapsible === 'icon' && 'justify-center'
                )}
                title={collapsible === 'icon' ? item.name : undefined}
              >
                <item.icon className="h-4 w-4" />
                {collapsible !== 'icon' && item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}