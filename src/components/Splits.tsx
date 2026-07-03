import { useState } from 'react'
import type { Split, SplitDay } from '../types'
import { DEFAULT_EXERCISES } from '../data/exercises'

interface Props {
  splits: Split[]
  activeSplitId: string | null
  editedFeaturedIds: string[]
  onSetActive: (id: string | null) => void
  onCreate: (split: Split) => void
  onUpdate: (split: Split) => void
  onReset: (id: string) => void
  onDelete: (id: string) => void
}

function exerciseName(id: string): string {
  return DEFAULT_EXERCISES.find(e => e.id === id)?.name ?? id
}

interface DraftDay {
  id: string
  name: string
  exerciseIds: string[]
}

type Editor =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; id: string }

export function Splits({
  splits,
  activeSplitId,
  editedFeaturedIds,
  onSetActive,
  onCreate,
  onUpdate,
  onReset,
  onDelete,
}: Props) {
  const [editor, setEditor] = useState<Editor>({ mode: 'closed' })
  const [draftName, setDraftName] = useState('')
  const [draftDays, setDraftDays] = useState<DraftDay[]>([])

  const activeSplit = splits.find(s => s.id === activeSplitId) ?? null
  const editedSet = new Set(editedFeaturedIds)
  function isFeatured(split: Split) {
    return !split.custom
  }

  function openCreate() {
    setDraftName('')
    setDraftDays([{ id: crypto.randomUUID(), name: 'Day 1', exerciseIds: [] }])
    setEditor({ mode: 'create' })
  }

  function openEdit(split: Split) {
    setDraftName(split.name)
    setDraftDays(split.days.map(d => ({ id: d.id, name: d.name, exerciseIds: [...d.exerciseIds] })))
    setEditor({ mode: 'edit', id: split.id })
  }

  function closeEditor() {
    setEditor({ mode: 'closed' })
    setDraftName('')
    setDraftDays([])
  }

  function addDraftDay() {
    setDraftDays(prev => [
      ...prev,
      { id: crypto.randomUUID(), name: `Day ${prev.length + 1}`, exerciseIds: [] },
    ])
  }

  function updateDraftDay(id: string, patch: Partial<DraftDay>) {
    setDraftDays(prev => prev.map(d => (d.id === id ? { ...d, ...patch } : d)))
  }

  function removeDraftDay(id: string) {
    setDraftDays(prev => prev.filter(d => d.id !== id))
  }

  function addExerciseToDay(dayId: string, exerciseId: string) {
    setDraftDays(prev =>
      prev.map(d =>
        d.id === dayId && !d.exerciseIds.includes(exerciseId)
          ? { ...d, exerciseIds: [...d.exerciseIds, exerciseId] }
          : d
      )
    )
  }

  function removeExerciseFromDay(dayId: string, exerciseId: string) {
    setDraftDays(prev =>
      prev.map(d =>
        d.id === dayId ? { ...d, exerciseIds: d.exerciseIds.filter(e => e !== exerciseId) } : d
      )
    )
  }

  function saveDraft() {
    const days = draftDays
      .filter(d => d.exerciseIds.length > 0)
      .map<SplitDay>(d => ({ id: d.id, name: d.name.trim() || 'Day', exerciseIds: d.exerciseIds }))

    if (editor.mode === 'edit') {
      const existing = splits.find(s => s.id === editor.id)
      onUpdate({
        id: editor.id,
        name: draftName.trim() || 'My Split',
        description: existing?.description ?? 'Custom split',
        days,
        custom: existing?.custom,
      })
    } else {
      const split: Split = {
        id: crypto.randomUUID(),
        name: draftName.trim() || 'My Split',
        description: 'Custom split',
        days,
        custom: true,
      }
      onCreate(split)
      onSetActive(split.id)
    }
    closeEditor()
  }

  const canSaveDraft = draftDays.some(d => d.exerciseIds.length > 0)

  return (
    <div className="splits-page">
      <section className="my-split">
        <h2>Your Split</h2>
        {activeSplit ? (
          <div className="split-card active-split">
            <div className="split-card-head">
              <h3>{activeSplit.name}</h3>
              <button className="btn-ghost small" onClick={() => onSetActive(null)}>Unset</button>
            </div>
            <div className="split-days">
              {activeSplit.days.map(day => (
                <div key={day.id} className="split-day">
                  <span className="split-day-name">{day.name}</span>
                  <span className="split-day-exercises">
                    {day.exerciseIds.map(exerciseName).join(' · ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="empty-hint">No split selected — pick one below or create your own.</p>
        )}
      </section>

      <section className="explore-splits">
        <h2>Explore Splits</h2>
        <div className="split-list">
          {splits.map(split => (
            <div key={split.id} className={`split-card${split.id === activeSplitId ? ' is-active' : ''}`}>
              <div className="split-card-head">
                <div>
                  <div className="split-title-row">
                    <h3>{split.name}</h3>
                    {isFeatured(split) && editedSet.has(split.id) && (
                      <span className="edited-badge">Edited</span>
                    )}
                    {split.custom && <span className="edited-badge custom">Custom</span>}
                  </div>
                  <p className="split-desc">{split.description}</p>
                </div>
                <div className="split-card-actions">
                  {split.id === activeSplitId ? (
                    <span className="active-badge">✓ Active</span>
                  ) : (
                    <button className="btn-secondary" onClick={() => onSetActive(split.id)}>Use</button>
                  )}
                </div>
              </div>

              <div className="split-days">
                {split.days.map(day => (
                  <div key={day.id} className="split-day">
                    <span className="split-day-name">{day.name}</span>
                    <span className="split-day-exercises">
                      {day.exerciseIds.map(exerciseName).join(' · ')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="split-card-footer">
                <button className="btn-ghost small" onClick={() => openEdit(split)}>✎ Edit</button>
                {isFeatured(split) && editedSet.has(split.id) && (
                  <button className="btn-ghost small" onClick={() => onReset(split.id)}>↺ Reset to default</button>
                )}
                {split.custom && (
                  <button className="btn-ghost danger small" onClick={() => onDelete(split.id)}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="create-split">
        {editor.mode !== 'closed' ? (
          <div className="split-card">
            <div className="split-card-head">
              <h3>{editor.mode === 'edit' ? 'Edit Split' : 'New Custom Split'}</h3>
              <button className="btn-ghost small" onClick={closeEditor}>Cancel</button>
            </div>

            <label className="draft-name-label">
              Split name
              <input
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                placeholder="e.g. My PPL variant"
              />
            </label>

            {draftDays.map(day => (
              <div key={day.id} className="draft-day">
                <div className="draft-day-head">
                  <input
                    className="draft-day-name"
                    value={day.name}
                    onChange={e => updateDraftDay(day.id, { name: e.target.value })}
                  />
                  <button className="btn-ghost danger small" onClick={() => removeDraftDay(day.id)}>Remove day</button>
                </div>

                <div className="draft-day-add">
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value) addExerciseToDay(day.id, e.target.value)
                    }}
                  >
                    <option value="">+ Add exercise…</option>
                    {DEFAULT_EXERCISES.filter(ex => !day.exerciseIds.includes(ex.id)).map(ex => (
                      <option key={ex.id} value={ex.id}>{ex.name}</option>
                    ))}
                  </select>
                </div>

                {day.exerciseIds.length > 0 && (
                  <div className="draft-exercise-pills">
                    {day.exerciseIds.map(exId => (
                      <span key={exId} className="draft-pill">
                        {exerciseName(exId)}
                        <button onClick={() => removeExerciseFromDay(day.id, exId)}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="draft-actions">
              <button className="btn-secondary" onClick={addDraftDay}>+ Add Day</button>
              <button className="btn-primary" onClick={saveDraft} disabled={!canSaveDraft}>
                {editor.mode === 'edit' ? 'Save Changes' : 'Save & Use Split'}
              </button>
            </div>
          </div>
        ) : (
          <button className="btn-secondary create-split-btn" onClick={openCreate}>
            + Create Your Own Split
          </button>
        )}
      </section>
    </div>
  )
}
