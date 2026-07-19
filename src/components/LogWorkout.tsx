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

/** True when an unsaved in-progress workout is waiting to be restored. */
export function hasWorkoutDraft(): boolean {
  return loadDraft() !== null
}

/** Select the whole value on focus so typing overwrites it. */
function focusSelectAll(e: React.FocusEvent<HTMLInputElement>) {
  const el = e.target
  requestAnimationFrame(() => {
    try {
      el.select()
    } catch {
      /* some input types reject selection */
    }
  })
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
  editing?: Workout | null
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
  editing,
}: Props) {
  const today = new Date().toISOString().split('T')[0]
  const unit = defaultUnit

  // Editing an existing workout takes priority over any saved draft.
  const [initialDraft] = useState<Draft | null>(() =>
    editing
      ? {
          name: editing.name,
          date: editing.date,
          exercises: editing.exercises,
          notes: editing.notes ?? '',
          splitDay: editing.splitDay ?? null,
        }
      : loadDraft()
  )
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
  const [openSetId, setOpenSetId] = useState<string | null>(null)
  const [creating, setCreating] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [copyOpen, setCopyOpen] = useState(false)

  // Drag-to-reorder state
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const cardRefs = useRef(new Map<string, HTMLDivElement>())

  // Continuously persist the in-progress workout so leaving the site never loses it
  useEffect(() => {
    if (step !== 'log' || editing) return
    const draft: Draft = { name, date, exercises, notes, splitDay }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }, [step, name, date, exercises, notes, splitDay, editing])

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY)
  }

  function handleCancel() {
    if (!editing) clearDraft()
    onCancel()
  }

  function requestCancel() {
    if (exercises.length > 0) setConfirmCancel(true)
    else handleCancel()
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

  function copyExercisesFrom(source: Workout) {
    setExercises(
      source.exercises.map(ex => ({
        ...ex,
        id: crypto.randomUUID(),
        sets: ex.sets.map(s => ({ ...s, id: crypto.randomUUID(), done: false })),
      }))
    )
    // Log this session as the same split day the copied workout was
    setSplitDay(source.splitDay ?? null)
    setName(source.name)
    setPickerOpen(false)
    setCopyOpen(false)
  }

  function copyFromLast() {
    if (lastSameDay) copyExercisesFrom(lastSameDay)
  }

  function addExerciseById(id: string) {
    const ex = exerciseCatalog.find(e => e.id === id)
    if (!ex) return
    setExercises(prev => [...prev, newWorkoutExercise(ex.id, ex.name, unit)])
  }

  function confirmCreateExercise() {
    const trimmed = (creating ?? '').trim()
    if (!trimmed) return
    const ex = onCreateExercise(trimmed)
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

  // Press and hold the grip for ~320ms, then the card follows the pointer while
  // the others slide out of the way. A short tap or an early scroll does nothing.
  const HOLD_MS = 320
  function onGripPointerDown(e: React.PointerEvent, id: string) {
    const startX = e.clientX
    const startY = e.clientY
    let curY = startY
    let started = false

    const preMove = (ev: PointerEvent) => {
      curY = ev.clientY
      if (!started && (Math.abs(ev.clientX - startX) > 10 || Math.abs(ev.clientY - startY) > 10)) {
        cancel() // moved before the hold completed: treat as a scroll, not a drag
      }
    }
    const cancel = () => {
      clearTimeout(timer)
      window.removeEventListener('pointermove', preMove)
      window.removeEventListener('pointerup', cancel)
      window.removeEventListener('pointercancel', cancel)
    }
    const timer = window.setTimeout(() => {
      started = true
      window.removeEventListener('pointermove', preMove)
      window.removeEventListener('pointerup', cancel)
      window.removeEventListener('pointercancel', cancel)
      navigator.vibrate?.(15)
      beginDrag(curY, id)
    }, HOLD_MS)

    window.addEventListener('pointermove', preMove)
    window.addEventListener('pointerup', cancel)
    window.addEventListener('pointercancel', cancel)
  }

  function beginDrag(anchorY: number, id: string) {
    const from = exercises.findIndex(x => x.id === id)
    if (from === -1) return
    const els = exercises.map(x => cardRefs.current.get(x.id))
    if (els.some(el => !el)) return
    const cards = els as HTMLDivElement[]
    const rects = cards.map(el => el.getBoundingClientRect())
    const gap = rects.length > 1 ? Math.max(0, rects[1].top - rects[0].bottom) : 16
    const lift = rects[from].height + gap
    let target = from

    setDraggingId(id)

    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - anchorY
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
    if (exercises.length === 0) return
    const workout: Workout = {
      id: editing?.id ?? crypto.randomUUID(),
      date,
      name: name.trim() || `Workout ${date}`,
      exercises,
      notes: notes.trim() || undefined,
      splitDay: splitDay ?? undefined,
    }
    if (!editing) clearDraft()
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
  const otherWorkouts = workouts.filter(w => w.id !== lastSameDay?.id)

  return (
    <div className="log-workout">
      <div className="log-head">
        <div className="log-title-block">
          <div className="log-title-row">
            <h2>{splitDay ? `${splitDay} Day` : name.trim() || 'Workout'}</h2>
            <button
              className="btn-ghost small log-edit"
              onClick={() => setDetailsOpen(o => !o)}
              aria-label="Edit name and date"
            >
              edit
            </button>
          </div>
          <span className="log-date">{shortDate}</span>
        </div>
        <button className="btn-ghost" onClick={requestCancel}>Cancel</button>
      </div>

      {detailsOpen && (
        <div className="form-row">
          <label>
            Name
            <input value={name} onChange={e => setName(e.target.value)} placeholder={`Workout ${date}`} />
          </label>
          <label>
            Date
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </label>
        </div>
      )}

      {workouts.length > 0 && (
        <div className="copy-row">
          <button
            className={`copy-last-chip${copyOpen ? ' active' : ''}`}
            onClick={() => setCopyOpen(o => !o)}
          >
            ⧉ Copy a past workout
          </button>
        </div>
      )}

      {copyOpen && (
        <div className="copy-panel">
          {lastSameDay && (
            <button className="copy-last-featured" onClick={copyFromLast}>
              <span className="copy-last-icon">↺</span>
              <span className="copy-last-text">
                <span className="copy-last-title">Copy last {splitDay}</span>
                <span className="copy-last-meta">
                  {lastSameDay.date} · {lastSameDay.exercises.length} exercise
                  {lastSameDay.exercises.length === 1 ? '' : 's'}
                </span>
              </span>
              <span className="copy-last-arrow">→</span>
            </button>
          )}
          {otherWorkouts.length > 0 && (
            <div className="copy-list">
              {otherWorkouts.map(w => (
                <button key={w.id} className="copy-list-item" onClick={() => copyExercisesFrom(w)}>
                  <span className="copy-list-name">{w.name}</span>
                  <span className="copy-list-sub">
                    {w.date} · {w.exercises.length} exercise{w.exercises.length === 1 ? '' : 's'}
                  </span>
                </button>
              ))}
            </div>
          )}
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
                onPointerDown={e => onGripPointerDown(e, ex.id)}
                title="Hold and drag to reorder"
                aria-label="Drag to reorder"
              >
                ⠿
              </span>
              <h3>{ex.exerciseName}</h3>
              <button
                className="btn-ghost small dim"
                onClick={() => removeExercise(ex.id)}
                aria-label="Remove exercise"
              >
                ✕
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
                        type="text"
                        inputMode="decimal"
                        value={set.weight || ''}
                        onFocus={focusSelectAll}
                        onChange={e => updateSet(ex.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                      <span className="set-suffix">{unit}</span>
                    </label>
                    <label className="set-field">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={set.reps || ''}
                        onFocus={focusSelectAll}
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

          <button className="btn-primary picker-done" onClick={() => setPickerOpen(false)}>
            Done
          </button>
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

      {confirmCancel && (
        <div className="confirm-overlay" onClick={() => setConfirmCancel(false)}>
          <div className="confirm-box" onClick={e => e.stopPropagation()}>
            <h3>Save this workout?</h3>
            <p>You have unsaved exercises. Save them before leaving?</p>
            <div className="confirm-actions">
              <button className="btn-primary" onClick={handleSave}>Save</button>
              <button className="btn-secondary" onClick={() => setConfirmCancel(false)}>Keep editing</button>
              <button
                className="btn-ghost danger"
                onClick={() => {
                  setConfirmCancel(false)
                  handleCancel()
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
