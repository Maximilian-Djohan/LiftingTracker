import { useState } from 'react'
import type { Workout, WorkoutExercise, WorkoutSet } from '../types'
import { DEFAULT_EXERCISES } from '../data/exercises'

interface Props {
  onSave: (workout: Workout) => void
  onCancel: () => void
  defaultUnit: 'kg' | 'lbs'
}

function newSet(unit: 'kg' | 'lbs'): WorkoutSet {
  return { id: crypto.randomUUID(), weight: 0, reps: 0, unit }
}

function newWorkoutExercise(exerciseId: string, exerciseName: string, unit: 'kg' | 'lbs'): WorkoutExercise {
  return {
    id: crypto.randomUUID(),
    exerciseId,
    exerciseName,
    sets: [newSet(unit)],
  }
}

export function LogWorkout({ onSave, onCancel, defaultUnit }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const [name, setName] = useState('')
  const [date, setDate] = useState(today)
  const [exercises, setExercises] = useState<WorkoutExercise[]>([])
  const [selectedExerciseId, setSelectedExerciseId] = useState(DEFAULT_EXERCISES[0].id)
  const [notes, setNotes] = useState('')
  const [unit, setUnit] = useState(defaultUnit)

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

  function handleSave() {
    const workout: Workout = {
      id: crypto.randomUUID(),
      date,
      name: name.trim() || `Workout – ${date}`,
      exercises,
      notes: notes.trim() || undefined,
    }
    onSave(workout)
  }

  const categories = Array.from(new Set(DEFAULT_EXERCISES.map(e => e.category)))

  return (
    <div className="log-workout">
      <h2>Log Workout</h2>

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
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {ex.sets.map((set, si) => (
                  <tr key={set.id}>
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
        <p className="empty-hint">Add exercises above to start logging your workout.</p>
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
