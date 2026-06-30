import type { Exercise } from '../types'

export const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'bench-press', name: 'Bench Press', category: 'push', muscleGroups: ['chest', 'triceps', 'shoulders'] },
  { id: 'incline-bench', name: 'Incline Bench Press', category: 'push', muscleGroups: ['upper chest', 'triceps'] },
  { id: 'overhead-press', name: 'Overhead Press', category: 'push', muscleGroups: ['shoulders', 'triceps'] },
  { id: 'dips', name: 'Dips', category: 'push', muscleGroups: ['chest', 'triceps'] },
  { id: 'lateral-raise', name: 'Lateral Raise', category: 'push', muscleGroups: ['shoulders'] },

  { id: 'deadlift', name: 'Deadlift', category: 'pull', muscleGroups: ['back', 'hamstrings', 'glutes'] },
  { id: 'barbell-row', name: 'Barbell Row', category: 'pull', muscleGroups: ['back', 'biceps'] },
  { id: 'pull-up', name: 'Pull-up', category: 'pull', muscleGroups: ['back', 'biceps'] },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'pull', muscleGroups: ['back', 'biceps'] },
  { id: 'bicep-curl', name: 'Bicep Curl', category: 'pull', muscleGroups: ['biceps'] },
  { id: 'face-pull', name: 'Face Pull', category: 'pull', muscleGroups: ['rear delts', 'upper back'] },

  { id: 'squat', name: 'Squat', category: 'legs', muscleGroups: ['quads', 'glutes', 'hamstrings'] },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'legs', muscleGroups: ['hamstrings', 'glutes'] },
  { id: 'leg-press', name: 'Leg Press', category: 'legs', muscleGroups: ['quads', 'glutes'] },
  { id: 'leg-curl', name: 'Leg Curl', category: 'legs', muscleGroups: ['hamstrings'] },
  { id: 'calf-raise', name: 'Calf Raise', category: 'legs', muscleGroups: ['calves'] },
  { id: 'hip-thrust', name: 'Hip Thrust', category: 'legs', muscleGroups: ['glutes'] },

  { id: 'plank', name: 'Plank', category: 'core', muscleGroups: ['core'] },
  { id: 'ab-wheel', name: 'Ab Wheel', category: 'core', muscleGroups: ['core'] },
  { id: 'cable-crunch', name: 'Cable Crunch', category: 'core', muscleGroups: ['core'] },
]
