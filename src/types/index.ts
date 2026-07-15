export interface Exercise {
  id: string
  name: string
  category:
    | 'chest'
    | 'back'
    | 'shoulders'
    | 'biceps'
    | 'triceps'
    | 'quads'
    | 'hamstrings-glutes'
    | 'calves'
    | 'core'
    | 'other'
  muscleGroups: string[]
}

export interface WorkoutSet {
  id: string
  weight: number
  reps: number
  unit: 'kg' | 'lbs'
  done?: boolean
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
  /** Name of the split day this workout was logged against, e.g. "Pull" */
  splitDay?: string
}

export interface SplitDay {
  id: string
  name: string
  exerciseIds: string[]
}

export interface Split {
  id: string
  name: string
  description: string
  days: SplitDay[]
  custom?: boolean
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
