import type { Workout } from '../types'

interface Props {
  workouts: Workout[]
}

function totalVolume(workouts: Workout[]): number {
  return workouts.reduce(
    (sum, w) =>
      sum +
      w.exercises.reduce(
        (s, ex) => s + ex.sets.reduce((ss, set) => ss + set.weight * set.reps, 0),
        0
      ),
    0
  )
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
  const unit = workouts[0]?.exercises[0]?.sets[0]?.unit ?? 'kg'

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
      <div className="stat-tile">
        <span className="stat-value">{totalVolume(workouts).toLocaleString()}</span>
        <span className="stat-label">Volume ({unit})</span>
      </div>
    </div>
  )
}
