import { useEffect, useRef, useState } from 'react'
import type { Split, Workout, WorkoutExercise, WorkoutSet } from '../types'
import { DEFAULT_EXERCISES } from '../data/exercises'

const DRAFT_KEY = 'lifting-tracker-workout-draft'

interface Draft {
  name: string
  date: string
  exercises: WorkoutExercise[]
  notes: string
  splitDay: string | null
}

function loadDraft(): Draft | null {
  try {
    const stored = localStorage.getItem(DRAFT_KEY)
    if (!stored) return null
    const draft = JSON.parse(stored) as Draft
    // Only restore a draft that actually has logged exercises
    return draft.exercises?.length ? draft : null
  } catch {
    return null
  }
}

interface Props {
  onSave: (workout: Workout) => void
  onCancel: () => void
  defaultUnit: 'kg' | 'lbs'
  activeSplit: Split | null
  workouts: Workout[]
  minimalist: boolean
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

export function LogWorkout({ onSave, onCancel, defaultUnit, activeSplit, workouts, minimalist }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const unit = defaultUnit

  // Restore an unsaved in-progress workout if one was left behind
  const [initialDraft] = useState(loadDraft)
  const [step, setStep] = useState<'day' | 'log'>(initialDraft ? 'log' : 'day')
  const [name, setName] = useState(initialDraft?.name ?? '')
  const [date, setDate] = useState(initialDraft?.date ?? today)
  const [exercises, setExercises] = useState<WorkoutExercise[]>(initialDraft?.exercises ?? [])
  const [notes, setNotes] = useState(initialDraft?.notes ?? '')
  const [splitDay, setSplitDay] = useState<string | null>(initialDraft?.splitDay ?? null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerCategory, setPickerCategory] = useState<string>('all')

  // Drag-to-reorder state
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const draggingIdRef = useRef<string | null>(null)
  const exercisesRef = useRef(exercises)
  exercisesRef.current = exercises
  const cardRefs = useRef(new Map<string, HTMLDivElement>())

  // Continuously persist the in-progress workout so leaving the site never loses it
  useEffect(() => {
    if (step !== 'log') return
    const draft: Draft = { name, date, exercises, notes, splitDay }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [step, name, date, exercises, notes, splitDay])

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY)
  }

  function handleCancel() {
    clearDraft()
    onCancel()
  }

  const lastSameDay = splitDay ? workouts.find(w => w.splitDay === splitDay) ?? null : null

  function preloadDay(dayName: string) {
    const day = activeSplit?.days.find(d => d.name === dayName)
    if (!day) return
    setExercises(
      day.exerciseIds.flatMap(exId => {
        const ex = DEFAULT_EXERCISES.find(e => e.id === exId)
        return ex ? [newWorkoutExercise(ex.id, ex.name, unit)] : []
      })
    )
  }

  function startSplitDay(dayName: string) {
    setSplitDay(dayName)
    setName(dayName)
    preloadDay(dayName)
    setPickerOpen(false)
    setStep('log')
  }

  function startBlank() {
    setSplitDay(null)
    setName('')
    setExercises([])
    setPickerOpen(true)
    setStep('log')
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
    setPickerOpen(false)
  }

  function addExerciseById(id: string) {
    const ex = DEFAULT_EXERCISES.find(e => e.id === id)
    if (!ex) return
    setExercises(prev => [...prev, newWorkoutExercise(ex.id, ex.name, unit)])
  }

  function removeExercise(id: string) {
    setExercises(prev => prev.filter(e => e.id !== id))
  }

  function addSet(exerciseId: string) {
    setExercises(prev =>
      prev.map(e => {
        if (e.id !== exerciseId) return e
        const last = e.sets[e.sets.length - 1]
        const set = newSet(unit)
        if (last) set.weight = last.weight // carry over the previous set's weight
        return { ...e, sets: [...e.sets, set] }
      })
    )
  }

  function removeSet(exerciseId: string, setId: string) {
    setExercises(prev =>
      prev.map(e => (e.id === exerciseId ? { ...e, sets: e.sets.filter(s => s.id !== setId) } : e))
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

  function moveExercise(id: string, toIndex: number) {
    setExercises(prev => {
      const from = prev.findIndex(e => e.id === id)
      if (from === -1 || from === toIndex) return prev
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(toIndex, 0, item)
      return next
    })
  }

  function startDrag(e: React.PointerEvent, id: string) {
    e.preventDefault()
    draggingIdRef.current = id
    setDraggingId(id)

    const move = (ev: PointerEvent) => {
      if (!draggingIdRef.current) return
      const ordered = exercisesRef.current
      let target = ordered.length - 1
      for (let i = 0; i < ordered.length; i++) {
        const el = cardRefs.current.get(ordered[i].id)
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (ev.clientY < rect.top + rect.height / 2) {
          target = i
          break
        }
      }
      moveExercise(draggingIdRef.current, target)
    }
    const up = () => {
      draggingIdRef.current = null
      setDraggingId(null)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
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
    clearDraft()
    onSave(workout)
  }

  // ---- Step 1: pick the day ----
  if (step === 'day') {
    return (
      <div className="log-workout">
        <div className="log-head">
          <h2>New Workout</h2>
          <button className="btn-ghost" onClick={handleCancel}>Cancel</button>
        </div>

        {activeSplit ? (
          <>
            <p className="day-pick-prompt">
              Which day of <strong>{activeSplit.name}</strong>?
            </p>
            <div className="day-pick-grid">
              {activeSplit.days.map(day => (
                <button key={day.id} className="day-pick-btn" onClick={() => startSplitDay(day.name)}>
                  <span className="day-pick-name">{day.name}</span>
                  <span className="day-pick-sub">{day.exerciseIds.length} exercises</span>
                </button>
              ))}
              <button className="day-pick-btn other" onClick={startBlank}>
                <span className="day-pick-name">Other day</span>
                <span className="day-pick-sub">Start from scratch</span>
              </button>
            </div>
          </>
        ) : (
          <div className="no-split-warning">
            <span className="warn-icon">⚠️</span>
            <p className="warn-title">No split set</p>
            <p className="warn-text">
              Set a training split in the <strong>Splits</strong> tab to pick a day and copy your
              last session. You can also just log manually.
            </p>
            <button className="btn-primary" onClick={startBlank}>Continue manually</button>
          </div>
        )}
      </div>
    )
  }

  // ---- Step 2: log the workout ----
  const categories = ['all', ...Array.from(new Set(DEFAULT_EXERCISES.map(e => e.category)))]
  const addedIds = new Set(exercises.map(e => e.exerciseId))
  const q = pickerSearch.trim().toLowerCase()
  const pickerResults = DEFAULT_EXERCISES.filter(
    ex =>
      (pickerCategory === 'all' || ex.category === pickerCategory) &&
      (q === '' ||
        ex.name.toLowerCase().includes(q) ||
        ex.muscleGroups.some(m => m.toLowerCase().includes(q)))
  )
  const doneSets = exercises.reduce((s, e) => s + e.sets.filter(x => x.done).length, 0)
  const totalSets = exercises.reduce((s, e) => s + e.sets.length, 0)

  return (
    <div className="log-workout">
      <div className="log-head">
        <div>
          <h2>{splitDay ? `${splitDay} Day` : 'Workout'}</h2>
          {splitDay && activeSplit && <span className="log-sub">{activeSplit.name}</span>}
        </div>
        <button className="btn-ghost" onClick={handleCancel}>Cancel</button>
      </div>

      {lastSameDay && (
        <div className="copy-last-bar">
          <span>
            Last <strong>{splitDay}</strong> was {lastSameDay.date}
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
      </div>

      {totalSets > 0 && (
        <div className="set-progress">
          <div className="set-progress-track">
            <div
              className="set-progress-fill"
              style={{ width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%` }}
            />
          </div>
          <span className="set-progress-label">{doneSets} / {totalSets} sets done</span>
        </div>
      )}

      <div className="exercises-list">
        {exercises.map(ex => (
          <div
            key={ex.id}
            className={`exercise-card${draggingId === ex.id ? ' dragging' : ''}`}
            ref={el => {
              if (el) cardRefs.current.set(ex.id, el)
              else cardRefs.current.delete(ex.id)
            }}
          >
            <div className="exercise-header">
              <span
                className="exercise-grip"
                onPointerDown={e => startDrag(e, ex.id)}
                title="Hold and drag to reorder"
                aria-label="Drag to reorder"
              >
                ⠿
              </span>
              <h3>{ex.exerciseName}</h3>
              <button className="btn-ghost danger small" onClick={() => removeExercise(ex.id)}>Remove</button>
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
                        step="0.5"
                        value={set.reps || ''}
                        onChange={e => updateSet(ex.id, set.id, 'reps', parseFloat(e.target.value) || 0)}
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

      {pickerOpen ? (
        <div className="exercise-picker">
          <div className="picker-head">
            <input
              className="picker-search"
              value={pickerSearch}
              onChange={e => setPickerSearch(e.target.value)}
              placeholder="Search exercises…"
            />
            <button className="btn-ghost small" onClick={() => setPickerOpen(false)}>Done ▴</button>
          </div>

          <div className="category-filters">
            {categories.map(cat => (
              <button
                key={cat}
                className={`preset-chip${pickerCategory === cat ? ' active' : ''}`}
                onClick={() => setPickerCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {pickerResults.length === 0 ? (
            <p className="empty-hint">No exercises match.</p>
          ) : (
            <div className="picker-grid">
              {pickerResults.map(ex => {
                const added = addedIds.has(ex.id)
                return (
                  <button
                    key={ex.id}
                    className={`picker-item${added ? ' added' : ''}`}
                    onClick={() => addExerciseById(ex.id)}
                    disabled={added}
                  >
                    <span className="picker-item-name">
                      {ex.name}
                      {added && <span className="picker-added">✓</span>}
                    </span>
                    {!minimalist && (
                      <span className="picker-item-muscles">{ex.muscleGroups.slice(0, 3).join(' · ')}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        <button className="btn-secondary add-exercise-toggle" onClick={() => setPickerOpen(true)}>
          + Add Exercise
        </button>
      )}

      <label className="notes-label">
        Notes
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes…" rows={2} />
      </label>

      <div className="form-actions">
        <button className="btn-primary" onClick={handleSave} disabled={exercises.length === 0}>
          Save Workout
        </button>
      </div>
    </div>
  )
}
