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
