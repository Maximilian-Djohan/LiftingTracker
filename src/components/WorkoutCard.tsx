import { useState } from 'react'
import type { Workout } from '../types'

interface Props {
  workout: Workout
  onDelete: (id: string) => void
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  // Day-first, e.g. "Wed, 15 Jul 2026"
  const weekday = d.toLocaleDateString(undefined, { weekday: 'short' })
  const month = d.toLocaleDateString(undefined, { month: 'short' })
  return `${weekday}, ${d.getDate()} ${month} ${d.getFullYear()}`
}

export function WorkoutCard({ workout, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)
  const setCount = workout.exercises.reduce((s, ex) => s + ex.sets.length, 0)

  return (
    <div className={`workout-card${expanded ? ' expanded' : ''}`}>
      <div className="workout-card-header" onClick={() => setExpanded(e => !e)}>
        <div className="workout-card-summary">
          <div className="workout-title-row">
            <h3>{workout.name}</h3>
            {workout.splitDay && workout.splitDay.trim().toLowerCase() !== workout.name.trim().toLowerCase() && (
              <span className="split-badge">{workout.splitDay}</span>
            )}
          </div>
          <span className="workout-date">{formatDate(workout.date)}</span>
          <div className="workout-stats">
            <span><strong>{workout.exercises.length}</strong> exercises</span>
            <span><strong>{setCount}</strong> sets</span>
          </div>
        </div>
        <div className="workout-header-side">
          <button
            className="btn-ghost danger small workout-delete"
            onClick={e => {
              e.stopPropagation()
              onDelete(workout.id)
            }}
          >
            Delete
          </button>
          <span className="collapse-chevron" aria-hidden="true">▸</span>
        </div>
      </div>

      {/* Grid-rows collapse: animates to the content's height without measuring */}
      <div className="workout-collapse">
        <div className="workout-collapse-inner">
          <div className="workout-exercises">
            {workout.exercises.map(ex => (
              <div key={ex.id} className="workout-exercise-row">
                <span className="ex-name">{ex.exerciseName}</span>
                <span className="ex-sets">
                  {ex.sets.map(set => (
                    <span key={set.id} className="set-pill">
                      {set.weight}×{set.reps}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>

          {workout.notes && <p className="workout-notes">{workout.notes}</p>}
        </div>
      </div>
    </div>
  )
}
