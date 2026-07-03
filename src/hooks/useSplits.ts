import { useState, useEffect } from 'react'
import type { Split } from '../types'
import { FEATURED_SPLITS } from '../data/splits'

const CUSTOM_KEY = 'lifting-tracker-custom-splits'
const ACTIVE_KEY = 'lifting-tracker-active-split'

function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

export function useSplits() {
  const [customSplits, setCustomSplits] = useState<Split[]>(() => load(CUSTOM_KEY, []))
  const [activeSplitId, setActiveSplitId] = useState<string | null>(() => load(ACTIVE_KEY, null))

  useEffect(() => {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(customSplits))
  }, [customSplits])

  useEffect(() => {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(activeSplitId))
  }, [activeSplitId])

  const allSplits = [...FEATURED_SPLITS, ...customSplits]
  const activeSplit = allSplits.find(s => s.id === activeSplitId) ?? null

  function addCustomSplit(split: Split) {
    setCustomSplits(prev => [...prev, split])
  }

  function deleteCustomSplit(id: string) {
    setCustomSplits(prev => prev.filter(s => s.id !== id))
    if (activeSplitId === id) setActiveSplitId(null)
  }

  return { allSplits, activeSplit, activeSplitId, setActiveSplitId, addCustomSplit, deleteCustomSplit }
}
