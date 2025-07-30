'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { ThemeMode, ThemePreset } from '@/types/preferences/theme'
import { updateThemeMode, updateThemePreset } from '@/lib/theme-utils'

export type LayoutConfig = {
  preset: ThemePreset
  mode: ThemeMode
  sidebarVariant: 'inset' | 'sidebar' | 'floating'
  sidebarCollapsible: 'icon' | 'offcanvas'
  contentLayout: 'centered' | 'full-width'
}

const defaultConfig: LayoutConfig = {
  preset: 'default',
  mode: 'light',
  sidebarVariant: 'sidebar',
  sidebarCollapsible: 'offcanvas',
  contentLayout: 'full-width'
}

interface LayoutContextType {
  config: LayoutConfig
  updateConfig: (key: keyof LayoutConfig, value: string | boolean) => void
  resetConfig: () => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<LayoutConfig>(defaultConfig)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('dashboard-layout-config')
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig))
      } catch (error) {
        console.error('Error parsing layout config:', error)
      }
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Save config to localStorage
    localStorage.setItem('dashboard-layout-config', JSON.stringify(config))
    
    // Apply theme mode
    updateThemeMode(config.mode as "light" | "dark")
    
    // Apply theme preset
    updateThemePreset(config.preset)
  }, [config, mounted])

  const updateConfig = (key: keyof LayoutConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const resetConfig = () => {
    setConfig(defaultConfig)
  }

  return (
    <LayoutContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}
