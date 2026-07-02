export interface Exercise {
  id: string
  name: string
  category: 'push' | 'pull' | 'legs' | 'core' | 'cardio' | 'other'
  muscleGroups: string[]
}

export interface WorkoutSet {
  id: string
  weight: number
  reps: number
  unit: 'kg' | 'lbs'
}

export interface WorkoutExercise {
  id: string
  exerciseId: string
  exerciseName: string
  sets: WorkoutSet[]
  notes?: string
}

export interface Workout {
  id: string
  date: string
  name: string
  exercises: WorkoutExercise[]
  durationMinutes?: number
  notes?: string
}

export interface FoodEntry {
  id: string
  date: string
  name: string
  carbs: number
  protein: number
  fats: number
}

export interface NutritionGoals {
  carbs: number
  protein: number
  fats: number
}

/** Calories from macros: carbs & protein 4 kcal/g, fats 9 kcal/g. */
export function calories(macros: { carbs: number; protein: number; fats: number }): number {
  return Math.round(macros.carbs * 4 + macros.protein * 4 + macros.fats * 9)
}
