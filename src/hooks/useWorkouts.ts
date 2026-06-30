import { useState, useEffect } from 'react'
import type { Workout } from '../types'

const STORAGE_KEY = 'lifting-tracker-workouts'

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
  }, [workouts])

  function addWorkout(workout: Workout) {
    setWorkouts(prev => [workout, ...prev])
  }

  function deleteWorkout(id: string) {
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }

  function updateWorkout(updated: Workout) {
    setWorkouts(prev => prev.map(w => (w.id === updated.id ? updated : w)))
  }

  return { workouts, addWorkout, deleteWorkout, updateWorkout }
}
