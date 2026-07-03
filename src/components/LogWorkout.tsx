import { useState } from 'react'
import type { Split, Workout, WorkoutExercise, WorkoutSet } from '../types'
import { DEFAULT_EXERCISES } from '../data/exercises'

interface Props {
  onSave: (workout: Workout) => void
  onCancel: () => void
  defaultUnit: 'kg' | 'lbs'
  activeSplit: Split | null
  workouts: Workout[]
}

function newSet(unit: 'kg' | 'lbs'): WorkoutSet {
  return { id: crypto.randomUUID(), weight: 0, reps: 0, unit, done: false }
}

function newWorkoutExercise(exerciseId: string, exerciseName: string, unit: 'kg' | 'lbs'): WorkoutExercise {
  return {
    id: crypto.randomUUID(),
    exerciseId,
    exerciseName,
    sets: [newSet(unit)],
  }
}

export function LogWorkout({ onSave, onCancel, defaultUnit, activeSplit, workouts }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const [name, setName] = useState('')
  const [date, setDate] = useState(today)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState(DEFAULT_EXERCISES[0].id)
  const [notes, setNotes] = useState('')
  const [unit, setUnit] = useState(defaultUnit)
  const [splitDay, setSplitDay] = useState<string | null>(null)

  // Most recent workout logged against the same split day (workouts are newest-first)
  const lastSameDay = splitDay ? workouts.find(w => w.splitDay === splitDay) ?? null : null

  function selectSplitDay(dayName: string) {
    if (splitDay === dayName) {
      setSplitDay(null)
      return
    }
    setSplitDay(dayName)
    if (!name.trim()) setName(dayName)

    // Load the day's planned exercises (only when nothing has been logged yet,
    // so a mid-workout tap doesn't wipe entered sets)
    if (exercises.length === 0 && activeSplit) {
      const day = activeSplit.days.find(d => d.name === dayName)
      if (day) {
        setExercises(
          day.exerciseIds.flatMap(exId => {
            const ex = DEFAULT_EXERCISES.find(e => e.id === exId)
            return ex ? [newWorkoutExercise(ex.id, ex.name, unit)] : []
          })
        )
      }
    }
  }

  function copyFromLast() {
    if (!lastSameDay) return
    setExercises(
      lastSameDay.exercises.map(ex => ({
        ...ex,
        id: crypto.randomUUID(),
        sets: ex.sets.map(s => ({ ...s, id: crypto.randomUUID(), done: false })),
      }))
    )
  }

  function addExercise() {
    const ex = DEFAULT_EXERCISES.find(e => e.id === selectedExerciseId)
    if (!ex) return
    setExercises(prev => [...prev, newWorkoutExercise(ex.id, ex.name, unit)])
  }

  function removeExercise(id: string) {
    setExercises(prev => prev.filter(e => e.id !== id))
  }

  function addSet(exerciseId: string) {
    setExercises(prev =>
      prev.map(e => (e.id === exerciseId ? { ...e, sets: [...e.sets, newSet(unit)] } : e))
    )
  }

  function removeSet(exerciseId: string, setId: string) {
    setExercises(prev =>
      prev.map(e =>
        e.id === exerciseId ? { ...e, sets: e.sets.filter(s => s.id !== setId) } : e
      )
    )
  }

  function updateSet(exerciseId: string, setId: string, field: 'weight' | 'reps', value: number) {
    setExercises(prev =>
      prev.map(e =>
        e.id === exerciseId
          ? { ...e, sets: e.sets.map(s => (s.id === setId ? { ...s, [field]: value } : s)) }
          : e
      )
    )
  }

  function toggleSetDone(exerciseId: string, setId: string) {
    setExercises(prev =>
      prev.map(e =>
        e.id === exerciseId
          ? { ...e, sets: e.sets.map(s => (s.id === setId ? { ...s, done: !s.done } : s)) }
          : e
      )
    )
  }

  function handleSave() {
    const workout: Workout = {
      id: crypto.randomUUID(),
      date,
      name: name.trim() || `Workout – ${date}`,
      exercises,
      notes: notes.trim() || undefined,
      splitDay: splitDay ?? undefined,
    }
    onSave(workout)
  }

  const categories = Array.from(new Set(DEFAULT_EXERCISES.map(e => e.category)))
  const doneSets = exercises.reduce((s, e) => s + e.sets.filter(x => x.done).length, 0)
  const totalSets = exercises.reduce((s, e) => s + e.sets.length, 0)

  return (
    <div className="log-workout">
      <h2>Log Workout</h2>

      {activeSplit && (
        <div className="split-day-picker">
          <span className="split-day-picker-label">{activeSplit.name}:</span>
          {activeSplit.days.map(day => (
            <button
              key={day.id}
              className={`preset-chip${splitDay === day.name ? ' active' : ''}`}
              onClick={() => selectSplitDay(day.name)}
            >
              {day.name}
            </button>
          ))}
        </div>
      )}

      {lastSameDay && (
        <div className="copy-last-bar">
          <span>
            Last <strong>{splitDay}</strong> was {lastSameDay.date} — copy its exercises, weights &
            reps?
          </span>
          <button className="btn-secondary" onClick={copyFromLast}>Copy last {splitDay}</button>
        </div>
      )}

      <div className="form-row">
        <label>
          Name
          <input value={name} onChange={e => setName(e.target.value)} placeholder={`Workout – ${date}`} />
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </label>
        <label>
          Unit
          <select value={unit} onChange={e => setUnit(e.target.value as 'kg' | 'lbs')}>
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </label>
      </div>

      <div className="add-exercise-row">
        <select value={selectedExerciseId} onChange={e => setSelectedExerciseId(e.target.value)}>
          {categories.map(cat => (
            <optgroup key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)}>
              {DEFAULT_EXERCISES.filter(e => e.category === cat).map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <button className="btn-secondary" onClick={addExercise}>+ Add Exercise</button>
      </div>

      {totalSets > 0 && (
        <div className="set-progress">
          <div className="set-progress-track">
            <div
              className="set-progress-fill"
              style={{ width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%` }}
            />
          </div>
          <span className="set-progress-label">
            {doneSets} / {totalSets} sets done
          </span>
        </div>
      )}

      <div className="exercises-list">
        {exercises.map(ex => (
          <div key={ex.id} className="exercise-card">
            <div className="exercise-header">
              <h3>{ex.exerciseName}</h3>
              <button className="btn-ghost danger" onClick={() => removeExercise(ex.id)}>Remove</button>
            </div>

            <table className="sets-table">
              <thead>
                <tr>
                  <th>Set</th>
                  <th>Weight ({unit})</th>
                  <th>Reps</th>
                  <th>Done</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ex.sets.map((set, si) => (
                  <tr key={set.id} className={set.done ? 'set-done' : ''}>
                    <td className="set-num">{si + 1}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={set.weight || ''}
                        onChange={e => updateSet(ex.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={set.reps || ''}
                        onChange={e => updateSet(ex.id, set.id, 'reps', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <button
                        className={`set-check${set.done ? ' checked' : ''}`}
                        onClick={() => toggleSetDone(ex.id, set.id)}
                        aria-label={set.done ? 'Mark set not done' : 'Mark set done'}
                      >
                        ✓
                      </button>
                    </td>
                    <td>
                      {ex.sets.length > 1 && (
                        <button className="btn-ghost danger small" onClick={() => removeSet(ex.id, set.id)}>✕</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn-ghost" onClick={() => addSet(ex.id)}>+ Add Set</button>
          </div>
        ))}
      </div>

      {exercises.length === 0 && (
        <p className="empty-hint">
          {activeSplit
            ? 'Pick a split day above or add exercises to start logging.'
            : 'Add exercises above to start logging your workout.'}
        </p>
      )}

      <label className="notes-label">
        Notes
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" rows={2} />
      </label>

      <div className="form-actions">
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} disabled={exercises.length === 0}>
          Save Workout
        </button>
      </div>
    </div>
  )
}
