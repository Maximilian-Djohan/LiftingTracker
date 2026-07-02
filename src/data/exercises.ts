import type { Exercise } from '../types'

export const DEFAULT_EXERCISES: Exercise[] = [
  { id: 'bench-press', name: 'Bench Press', category: 'push', muscleGroups: ['chest', 'triceps', 'shoulders'] },
  { id: 'incline-bench', name: 'Incline Bench Press', category: 'push', muscleGroups: ['upper chest', 'shoulders', 'triceps'] },
  { id: 'overhead-press', name: 'Overhead Press', category: 'push', muscleGroups: ['shoulders', 'triceps', 'upper chest', 'core'] },
  { id: 'dips', name: 'Dips', category: 'push', muscleGroups: ['chest', 'triceps', 'shoulders'] },
  { id: 'lateral-raise', name: 'Lateral Raise', category: 'push', muscleGroups: ['shoulders'] },

  { id: 'deadlift', name: 'Deadlift', category: 'pull', muscleGroups: ['back', 'hamstrings', 'glutes', 'forearms', 'core'] },
  { id: 'barbell-row', name: 'Barbell Row', category: 'pull', muscleGroups: ['back', 'biceps', 'rear delts', 'forearms'] },
  { id: 'pull-up', name: 'Pull-up', category: 'pull', muscleGroups: ['back', 'biceps', 'forearms', 'core'] },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'pull', muscleGroups: ['back', 'biceps', 'forearms'] },
  { id: 'bicep-curl', name: 'Bicep Curl', category: 'pull', muscleGroups: ['biceps', 'forearms'] },
  { id: 'face-pull', name: 'Face Pull', category: 'pull', muscleGroups: ['rear delts', 'upper back'] },

  { id: 'squat', name: 'Squat', category: 'legs', muscleGroups: ['quads', 'glutes', 'hamstrings', 'core'] },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'legs', muscleGroups: ['hamstrings', 'glutes', 'back', 'forearms'] },
  { id: 'leg-press', name: 'Leg Press', category: 'legs', muscleGroups: ['quads', 'glutes'] },
  { id: 'leg-curl', name: 'Leg Curl', category: 'legs', muscleGroups: ['hamstrings', 'calves'] },
  { id: 'calf-raise', name: 'Calf Raise', category: 'legs', muscleGroups: ['calves'] },
  { id: 'hip-thrust', name: 'Hip Thrust', category: 'legs', muscleGroups: ['glutes', 'hamstrings', 'quads'] },

  { id: 'plank', name: 'Plank', category: 'core', muscleGroups: ['core', 'shoulders', 'glutes'] },
  { id: 'ab-wheel', name: 'Ab Wheel', category: 'core', muscleGroups: ['core', 'shoulders', 'back'] },
  { id: 'cable-crunch', name: 'Cable Crunch', category: 'core', muscleGroups: ['core'] },
]
