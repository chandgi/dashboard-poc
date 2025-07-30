'use client'

import { Settings, Monitor, Sun, Moon, X, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useLayout } from '@/contexts/LayoutContext'
import { THEME_PRESET_OPTIONS } from '@/types/preferences/theme'

interface LayoutSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function LayoutSettings({ isOpen, onClose }: LayoutSettingsProps) {
  const { config, updateConfig, resetConfig } = useLayout()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Settings Popover */}
      <div className="absolute top-full right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <h2 className="text-sm font-semibold">Layout Settings</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={resetConfig}
              title="Reset to default"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="p-3 space-y-4 max-h-96 overflow-y-auto">
          <div className="text-xs text-muted-foreground">
            Customize your dashboard layout preferences.
          </div>

          {/* Preset */}
          <div>
            <h3 className="text-xs font-medium mb-2">Preset</h3>
            <div className="grid grid-cols-2 gap-1">
              {THEME_PRESET_OPTIONS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateConfig('preset', preset.value)}
                  className={cn(
                    "flex items-center gap-2 p-2 border rounded-md transition-colors text-left text-xs",
                    config.preset === preset.value 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:bg-muted"
                  )}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full border"
                    style={{
                      backgroundColor: config.mode === "dark" ? preset.primary.dark : preset.primary.light,
                    }}
                  />
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Mode */}
          <div>
            <h3 className="text-xs font-medium mb-2">Mode</h3>
            <div className="flex border rounded-md overflow-hidden">
              <button
                onClick={() => updateConfig('mode', 'light')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs transition-colors",
                  config.mode === 'light' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-background hover:bg-muted"
                )}
              >
                <Sun className="h-3 w-3" />
                Light
              </button>
              <button
                onClick={() => updateConfig('mode', 'dark')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs transition-colors border-x",
                  config.mode === 'dark' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-background hover:bg-muted"
                )}
              >
                <Moon className="h-3 w-3" />
                Dark
              </button>
            </div>
          </div>

          <Separator />

          {/* Sidebar Variant */}
          <div>
            <h3 className="text-xs font-medium mb-2">Sidebar Variant</h3>
            <div className="grid grid-cols-3 gap-1">
              {(['inset', 'sidebar', 'floating'] as const).map((variant) => (
                <button
                  key={variant}
                  onClick={() => updateConfig('sidebarVariant', variant)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 border rounded-md transition-colors capitalize",
                    config.sidebarVariant === variant 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:bg-muted"
                  )}
                >
                  <div className="w-6 h-4 border rounded-sm bg-background relative">
                    {variant === 'inset' && (
                      <div className="absolute left-0.5 top-0.5 bottom-0.5 w-1.5 bg-muted rounded-sm" />
                    )}
                    {variant === 'sidebar' && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-muted" />
                    )}
                    {variant === 'floating' && (
                      <div className="absolute left-0.5 top-0.5 bottom-0.5 w-1.5 bg-muted rounded-sm shadow-sm" />
                    )}
                  </div>
                  <span className="text-xs">{variant}</span>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Sidebar Collapsible */}
          <div>
            <h3 className="text-xs font-medium mb-2">Sidebar Collapsible</h3>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => updateConfig('sidebarCollapsible', 'icon')}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 border rounded-md transition-colors capitalize",
                  config.sidebarCollapsible === 'icon' 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-muted"
                )}
              >
                <div className="w-6 h-4 border rounded-sm bg-background relative">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-muted" />
                </div>
                <span className="text-xs">Icon</span>
              </button>
              <button
                onClick={() => updateConfig('sidebarCollapsible', 'offcanvas')}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 border rounded-md transition-colors capitalize",
                  config.sidebarCollapsible === 'offcanvas' 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-muted"
                )}
              >
                <div className="w-6 h-4 border rounded-sm bg-background relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-muted" />
                </div>
                <span className="text-xs">OffCanvas</span>
              </button>
            </div>
          </div>

          <Separator />

          {/* Content Layout */}
          <div>
            <h3 className="text-xs font-medium mb-2">Content Layout</h3>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => updateConfig('contentLayout', 'centered')}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 border rounded-md transition-colors capitalize",
                  config.contentLayout === 'centered' 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-muted"
                )}
              >
                <div className="w-6 h-4 border rounded-sm bg-background relative">
                  <div className="absolute left-1 right-1 top-0.5 bottom-0.5 bg-muted rounded-sm" />
                </div>
                <span className="text-xs">Centered</span>
              </button>
              <button
                onClick={() => updateConfig('contentLayout', 'full-width')}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 border rounded-md transition-colors capitalize",
                  config.contentLayout === 'full-width' 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:bg-muted"
                )}
              >
                <div className="w-6 h-4 border rounded-sm bg-background relative">
                  <div className="absolute inset-0.5 bg-muted rounded-sm" />
                </div>
                <span className="text-xs">Full Width</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}