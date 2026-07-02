import type { Workout } from '../types'

interface Props {
  workouts: Workout[]
}

function thisWeekCount(workouts: Workout[]): number {
  const now = new Date()
  const weekAgo = new Date(now)
  weekAgo.setDate(now.getDate() - 7)
  return workouts.filter(w => new Date(w.date + 'T00:00:00') >= weekAgo).length
}

export function Stats({ workouts }: Props) {
  const totalSets = workouts.reduce(
    (s, w) => s + w.exercises.reduce((ss, ex) => ss + ex.sets.length, 0),
    0
  )

  return (
    <div className="stats-grid">
      <div className="stat-tile">
        <span className="stat-value">{workouts.length}</span>
        <span className="stat-label">Total Workouts</span>
      </div>
      <div className="stat-tile">
        <span className="stat-value">{thisWeekCount(workouts)}</span>
        <span className="stat-label">This Week</span>
      </div>
      <div className="stat-tile">
        <span className="stat-value">{totalSets}</span>
        <span className="stat-label">Total Sets</span>
      </div>
    </div>
  )
}
