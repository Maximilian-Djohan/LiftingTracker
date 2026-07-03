import type { Split } from '../types'

export const FEATURED_SPLITS: Split[] = [
  {
    id: 'ppl',
    name: 'Push Pull Legs',
    description: 'The classic 3-day rotation: pushing muscles, pulling muscles, then legs.',
    days: [
      { id: 'ppl-push', name: 'Push', exerciseIds: ['bench-press', 'overhead-press', 'incline-bench', 'dips', 'lateral-raise'] },
      { id: 'ppl-pull', name: 'Pull', exerciseIds: ['deadlift', 'barbell-row', 'pull-up', 'bicep-curl', 'face-pull'] },
      { id: 'ppl-legs', name: 'Legs', exerciseIds: ['squat', 'romanian-deadlift', 'leg-press', 'leg-curl', 'calf-raise'] },
    ],
  },
  {
    id: 'upper-lower',
    name: 'Upper Lower',
    description: 'Two-way split alternating upper-body and lower-body sessions.',
    days: [
      { id: 'ul-upper', name: 'Upper', exerciseIds: ['bench-press', 'barbell-row', 'overhead-press', 'lat-pulldown', 'bicep-curl', 'dips'] },
      { id: 'ul-lower', name: 'Lower', exerciseIds: ['squat', 'romanian-deadlift', 'leg-press', 'leg-curl', 'hip-thrust', 'calf-raise'] },
    ],
  },
  {
    id: 'full-body',
    name: 'Full Body',
    description: 'Hit everything each session with two alternating full-body days.',
    days: [
      { id: 'fb-a', name: 'Full Body A', exerciseIds: ['squat', 'bench-press', 'barbell-row', 'plank'] },
      { id: 'fb-b', name: 'Full Body B', exerciseIds: ['deadlift', 'overhead-press', 'pull-up', 'cable-crunch'] },
    ],
  },
  {
    id: 'anterior-posterior',
    name: 'Anterior Posterior',
    description: 'Front-of-body chain one day, back-of-body chain the next.',
    days: [
      { id: 'ap-anterior', name: 'Anterior', exerciseIds: ['squat', 'bench-press', 'overhead-press', 'leg-press', 'ab-wheel'] },
      { id: 'ap-posterior', name: 'Posterior', exerciseIds: ['deadlift', 'barbell-row', 'romanian-deadlift', 'pull-up', 'face-pull', 'calf-raise'] },
    ],
  },
  {
    id: 'arnold',
    name: 'Arnold',
    description: "Arnold's 3-way split: chest & back, shoulders & arms, then legs.",
    days: [
      { id: 'arnold-chest-back', name: 'Chest & Back', exerciseIds: ['bench-press', 'incline-bench', 'barbell-row', 'pull-up', 'dips'] },
      { id: 'arnold-shoulders-arms', name: 'Shoulders & Arms', exerciseIds: ['overhead-press', 'lateral-raise', 'face-pull', 'bicep-curl'] },
      { id: 'arnold-legs', name: 'Legs', exerciseIds: ['squat', 'romanian-deadlift', 'leg-curl', 'calf-raise'] },
    ],
  },
]
