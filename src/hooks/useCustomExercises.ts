import { useState, useEffect } from 'react'
import type { Exercise } from '../types'
import { DEFAULT_EXERCISES } from '../data/exercises'

const STORAGE_KEY = 'lifting-tracker-custom-exercises'

export function useCustomExercises() {
  const [customExercises, setCustomExercises] = useState<Exercise[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customExercises))
  }, [customExercises])

  const allExercises = [...DEFAULT_EXERCISES, ...customExercises]

  /** Creates a custom exercise, or returns the existing one with the same name. */
  function addCustomExercise(name: string): Exercise {
    const trimmed = name.trim()
    const existing = allExercises.find(e => e.name.toLowerCase() === trimmed.toLowerCase())
    if (existing) return existing
    const exercise: Exercise = {
      id: `custom-${crypto.randomUUID()}`,
      name: trimmed,
      category: 'other',
      muscleGroups: [],
    }
    setCustomExercises(prev => [...prev, exercise])
    return exercise
  }

  function removeCustomExercise(id: string) {
    setCustomExercises(prev => prev.filter(e => e.id !== id))
  }

  return { customExercises, allExercises, addCustomExercise, removeCustomExercise }
}
