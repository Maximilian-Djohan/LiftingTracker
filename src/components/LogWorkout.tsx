import { useEffect, useRef, useState } from 'react'
import type { Exercise, Split, Workout, WorkoutExercise, WorkoutSet } from '../types'
import { CATEGORY_LABELS } from '../data/exercises'

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
  exerciseCatalog: Exercise[]
  onCreateExercise: (name: string) => Exercise
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

export function LogWorkout({
  onSave,
  onCancel,
  defaultUnit,
  activeSplit,
  workouts,
  minimalist,
  exerciseCatalog,
  onCreateExercise,
}: Props) {
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
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [openSetId, setOpenSetId] = useState<string | null>(null)
  const [creating, setCreating] = useState<string | null>(null)

  // Drag-to-reorder state
  const [draggingId, setDraggingId] = useState<string | null>(null)
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
        const ex = exerciseCatalog.find(e => e.id === exId)
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
    const ex = exerciseCatalog.find(e => e.id === id)
    if (!ex) return
    setExercises(prev => [...prev, newWorkoutExercise(ex.id, ex.name, unit)])
  }

  function confirmCreateExercise() {
    const name = (creating ?? '').trim()
    if (!name) return
    const ex = onCreateExercise(name)
    setExercises(prev =>
      prev.some(e => e.exerciseId === ex.id) ? prev : [...prev, newWorkoutExercise(ex.id, ex.name, unit)]
    )
    setCreating(null)
    setPickerSearch('')
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

  // Swipe a set row left to reveal its delete button
  const DELETE_W = 76
  const swipeRef = useRef<{
    id: string
    startX: number
    startY: number
    base: number
    el: HTMLElement
    decided: boolean
    horizontal: boolean
  } | null>(null)

  function startSetSwipe(e: React.PointerEvent<HTMLDivElement>, setId: string, canSwipe: boolean) {
    if (openSetId && openSetId !== setId) setOpenSetId(null)
    if (!canSwipe) return
    const el = e.currentTarget
    swipeRef.current = {
      id: setId,
      startX: e.clientX,
      startY: e.clientY,
      base: openSetId === setId ? -DELETE_W : 0,
      el,
      decided: false,
      horizontal: false,
    }

    const cleanup = () => {
      swipeRef.current = null
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
    const move = (ev: PointerEvent) => {
      const s = swipeRef.current
      if (!s) return
      const dx = ev.clientX - s.startX
      const dy = ev.clientY - s.startY
      if (!s.decided) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        s.decided = true
        s.horizontal = Math.abs(dx) > Math.abs(dy)
        if (!s.horizontal) {
          cleanup()
          return
        }
        s.el.parentElement?.classList.add('swipe-active')
      }
      const x = Math.min(0, Math.max(-DELETE_W, s.base + dx))
      s.el.style.transition = 'none'
      s.el.style.transform = `translateX(${x}px)`
    }
    const up = (ev: PointerEvent) => {
      const s = swipeRef.current
      if (!s) return
      s.el.style.transition = ''
      s.el.style.transform = ''
      s.el.parentElement?.classList.remove('swipe-active')
      if (s.decided && s.horizontal) {
        const x = s.base + (ev.clientX - s.startX)
        setOpenSetId(x < -DELETE_W / 2 ? s.id : null)
        // a swipe is not a tap: drop focus and swallow the trailing click
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
        window.addEventListener(
          'click',
          e => {
            e.stopPropagation()
            e.preventDefault()
          },
          { capture: true, once: true }
        )
      } else if (!s.decided && openSetId === s.id) {
        setOpenSetId(null) // plain tap on an open row closes it
      }
      cleanup()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  // Hold the grip: the card lifts and follows the pointer while the other
  // cards slide out of the way; the new order commits on release.
  function startDrag(e: React.PointerEvent, id: string) {
    e.preventDefault()
    const from = exercises.findIndex(x => x.id === id)
    if (from === -1) return
    const els = exercises.map(x => cardRefs.current.get(x.id))
    if (els.some(el => !el)) return
    const cards = els as HTMLDivElement[]
    const rects = cards.map(el => el.getBoundingClientRect())
    const gap = rects.length > 1 ? Math.max(0, rects[1].top - rects[0].bottom) : 16
    const lift = rects[from].height + gap
    const startY = e.clientY
    let target = from

    setDraggingId(id)

    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - startY
      const center = rects[from].top + rects[from].height / 2 + dy

      target = from
      for (let k = 0; k < rects.length; k++) {
        if (k === from) continue
        const mid = rects[k].top + rects[k].height / 2
        if (k < from && center < mid) target = Math.min(target, k)
        if (k > from && center > mid) target = Math.max(target, k)
      }

      cards.forEach((el, k) => {
        if (k === from) {
          el.style.transition = 'none'
          el.style.transform = `translateY(${dy}px) scale(1.02)`
          return
        }
        let shift = 0
        if (from < k && k <= target) shift = -lift
        else if (target <= k && k < from) shift = lift
        el.style.transition = 'transform 0.18s ease'
        el.style.transform = shift ? `translateY(${shift}px)` : ''
      })
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      cards.forEach(el => {
        el.style.transition = 'none'
        el.style.transform = ''
      })
      setDraggingId(null)
      moveExercise(id, target)
      requestAnimationFrame(() => {
        cards.forEach(el => {
          el.style.transition = ''
        })
      })
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
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
  const categories = ['all', ...Array.from(new Set(exerciseCatalog.map(e => e.category)))]
  const addedIds = new Set(exercises.map(e => e.exerciseId))
  const q = pickerSearch.trim().toLowerCase()
  const canCreate = q !== '' && !exerciseCatalog.some(ex => ex.name.trim().toLowerCase() === q)
  const pickerResults = exerciseCatalog.filter(
    ex =>
      (pickerCategory === 'all' || ex.category === pickerCategory) &&
      (q === '' || ex.name.toLowerCase().includes(q))
  )
  const shortDate = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="log-workout">
      <div className="log-head">
        <div className="log-title-row">
          <h2>
            {splitDay ? `${splitDay} Day` : name.trim() || 'Workout'}
            <span className="log-date"> · {shortDate}</span>
          </h2>
          <button
            className="btn-ghost small log-edit"
            onClick={() => setDetailsOpen(o => !o)}
            aria-label="Edit name and date"
          >
            edit
          </button>
        </div>
        <button className="btn-ghost" onClick={handleCancel}>Cancel</button>
      </div>

      {detailsOpen && (
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
      )}

      {lastSameDay && (
        <button className="copy-last-chip" onClick={copyFromLast}>
          ↺ Copy last {splitDay} · {lastSameDay.date}
        </button>
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
              <button
                className={`btn-ghost small${confirmRemove === ex.id ? ' danger' : ' dim'}`}
                onClick={() => {
                  if (confirmRemove === ex.id) {
                    removeExercise(ex.id)
                    setConfirmRemove(null)
                  } else {
                    setConfirmRemove(ex.id)
                  }
                }}
                onBlur={() => setConfirmRemove(null)}
                aria-label="Remove exercise"
              >
                {confirmRemove === ex.id ? 'Remove?' : '✕'}
              </button>
            </div>

            <div className="set-rows">
              {ex.sets.map((set, si) => (
                <div key={set.id} className={`set-row-swipe${openSetId === set.id ? ' open' : ''}`}>
                  <div
                    className="set-row"
                    style={{
                      transform: openSetId === set.id ? `translateX(-${DELETE_W}px)` : undefined,
                    }}
                    onPointerDown={e => startSetSwipe(e, set.id, ex.sets.length > 1)}
                  >
                    <span className="set-num">{si + 1}</span>
                    <label className="set-field">
                      <input
                        type="number"
                        min="0"
                        value={set.weight || ''}
                        onChange={e => updateSet(ex.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                      <span className="set-suffix">{unit}</span>
                    </label>
                    <label className="set-field">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={set.reps || ''}
                        onChange={e => updateSet(ex.id, set.id, 'reps', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                      <span className="set-suffix">reps</span>
                    </label>
                  </div>
                  <button
                    className="set-delete"
                    tabIndex={openSetId === set.id ? 0 : -1}
                    onClick={() => {
                      removeSet(ex.id, set.id)
                      setOpenSetId(null)
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="set-actions">
              <button className="btn-ghost small" onClick={() => addSet(ex.id)}>+ set</button>
            </div>
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
                {cat === 'all' ? 'All' : CATEGORY_LABELS[cat as Exercise['category']] ?? cat}
              </button>
            ))}
          </div>

          {creating !== null && (
            <div className="picker-create">
              <input
                value={creating}
                onChange={e => setCreating(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') confirmCreateExercise()
                  if (e.key === 'Escape') setCreating(null)
                }}
                placeholder="Exercise name"
                autoFocus
              />
              <button className="btn-primary" onClick={confirmCreateExercise} disabled={!creating.trim()}>
                Add
              </button>
              <button className="btn-ghost" onClick={() => setCreating(null)}>Cancel</button>
            </div>
          )}

          {pickerResults.length === 0 && !canCreate ? (
            <p className="empty-hint">No exercises match.</p>
          ) : (
            <div className="picker-grid">
              {canCreate && creating === null && (
                <button className="picker-item picker-add" onClick={() => setCreating(pickerSearch.trim())}>
                  <span className="picker-item-name">+ Add “{pickerSearch.trim()}”</span>
                  <span className="picker-item-muscles">Create custom exercise</span>
                </button>
              )}
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
