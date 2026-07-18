import { useState } from 'react'
import type { Workout } from '../types'

interface Props {
  workout: Workout
  onDelete: (id: string) => void
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
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
        <div className="workout-header-right">
          <button
            className="btn-ghost danger small"
            onClick={e => {
              e.stopPropagation()
              onDelete(workout.id)
            }}
          >
            Delete
          </button>
          <span className="collapse-chevron">{expanded ? '▾' : '▸'}</span>
        </div>
      </div>

      {expanded && (
        <>
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
        </>
      )}
    </div>
  )
}
