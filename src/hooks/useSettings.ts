import { useState, useEffect } from 'react'

const STORAGE_KEY = 'lifting-tracker-settings'

export interface Settings {
  defaultUnit: 'kg' | 'lbs'
}

const DEFAULT_SETTINGS: Settings = { defaultUnit: 'kg' }

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  function updateSettings(patch: Partial<Settings>) {
    setSettings(prev => ({ ...prev, ...patch }))
  }

  return { settings, updateSettings }
}
