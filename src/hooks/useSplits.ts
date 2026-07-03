import { useState, useEffect } from 'react'
import type { Split } from '../types'
import { FEATURED_SPLITS } from '../data/splits'

const CUSTOM_KEY = 'lifting-tracker-custom-splits'
const ACTIVE_KEY = 'lifting-tracker-active-split'
const OVERRIDE_KEY = 'lifting-tracker-split-overrides'

const FEATURED_IDS = new Set(FEATURED_SPLITS.map(s => s.id))

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
  const [overrides, setOverrides] = useState<Record<string, Split>>(() => load(OVERRIDE_KEY, {}))
  const [activeSplitId, setActiveSplitId] = useState<string | null>(() => load(ACTIVE_KEY, null))

  useEffect(() => {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(customSplits))
  }, [customSplits])

  useEffect(() => {
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify(overrides))
  }, [overrides])

  useEffect(() => {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(activeSplitId))
  }, [activeSplitId])

  // Featured splits show their edited version when one exists
  const allSplits = [
    ...FEATURED_SPLITS.map(s => overrides[s.id] ?? s),
    ...customSplits,
  ]
  const activeSplit = allSplits.find(s => s.id === activeSplitId) ?? null
  const editedFeaturedIds = Object.keys(overrides)

  function addCustomSplit(split: Split) {
    setCustomSplits(prev => [...prev, split])
  }

  function updateSplit(split: Split) {
    if (FEATURED_IDS.has(split.id)) {
      setOverrides(prev => ({ ...prev, [split.id]: split }))
    } else {
      setCustomSplits(prev => prev.map(s => (s.id === split.id ? split : s)))
    }
  }

  function resetSplit(id: string) {
    setOverrides(prev => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  function deleteCustomSplit(id: string) {
    setCustomSplits(prev => prev.filter(s => s.id !== id))
    if (activeSplitId === id) setActiveSplitId(null)
  }

  return {
    allSplits,
    activeSplit,
    activeSplitId,
    editedFeaturedIds,
    setActiveSplitId,
    addCustomSplit,
    updateSplit,
    resetSplit,
    deleteCustomSplit,
  }
}
