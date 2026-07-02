import { useState, useEffect } from 'react'
import type { FoodEntry, NutritionGoals } from '../types'

const ENTRIES_KEY = 'lifting-tracker-food'
const GOALS_KEY = 'lifting-tracker-nutrition-goals'

const DEFAULT_GOALS: NutritionGoals = { carbs: 250, protein: 150, fats: 70 }

function load<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

export function useNutrition() {
  const [entries, setEntries] = useState<FoodEntry[]>(() => load(ENTRIES_KEY, []))
  const [goals, setGoals] = useState<NutritionGoals>(() => load(GOALS_KEY, DEFAULT_GOALS))

  useEffect(() => {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
  }, [goals])

  function addEntry(entry: FoodEntry) {
    setEntries(prev => [entry, ...prev])
  }

  function deleteEntry(id: string) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return { entries, addEntry, deleteEntry, goals, setGoals }
}
