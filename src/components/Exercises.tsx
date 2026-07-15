import { useState } from 'react'
import type { Exercise } from '../types'
import { CATEGORY_LABELS } from '../data/exercises'
import { REGION_MATCHERS } from '../data/bodyMap'
import { BodyMap } from './BodyMap'

const CATEGORIES = [
  'all',
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'quads',
  'hamstrings-glutes',
  'calves',
  'core',
] as const
type Category = (typeof CATEGORIES)[number]

interface Props {
  showBodyMap: boolean
  minimalist: boolean
  exercises: Exercise[]
  onRemoveCustom: (id: string) => void
  onCreate: (name: string) => void
}

const isCustom = (ex: Exercise) => ex.id.startsWith('custom-')

export function Exercises({ showBodyMap, minimalist, exercises, onRemoveCustom, onCreate }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('all')
  const [region, setRegion] = useState<string | null>(null)
  const [creating, setCreating] = useState<string | null>(null)

  function confirmCreate() {
    const name = (creating ?? '').trim()
    if (!name) return
    onCreate(name)
    setCreating(null)
    setSearch('')
  }

  const filtered = exercises.filter(ex => {
    const matchesCategory = category === 'all' || ex.category === category

    const q = search.trim().toLowerCase()
    const matchesSearch = q === '' || ex.name.toLowerCase().includes(q)

    const terms = region ? REGION_MATCHERS[region] ?? [] : []
    const matchesRegion =
      !region || ex.muscleGroups.some(m => terms.some(t => m.toLowerCase().includes(t)))

    return matchesCategory && matchesSearch && matchesRegion
  })

  return (
    <div className="exercises-page">
      <h2>Explore Exercises</h2>

      {showBodyMap && <BodyMap selected={region} onSelect={setRegion} />}

      {region && (
        <div className="region-filter-bar">
          <span>
            Showing exercises for <strong>{region}</strong>
          </span>
          <button className="btn-ghost small" onClick={() => setRegion(null)}>✕ Clear</button>
        </div>
      )}

      <input
        className="exercise-search"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search exercises…"
      />

      <div className="category-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`preset-chip${category === cat ? ' active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {creating !== null && (
        <div className="picker-create">
          <input
            value={creating}
            onChange={e => setCreating(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') confirmCreate()
              if (e.key === 'Escape') setCreating(null)
            }}
            placeholder="Exercise name"
            autoFocus
          />
          <button className="btn-primary" onClick={confirmCreate} disabled={!creating.trim()}>
            Add
          </button>
          <button className="btn-ghost" onClick={() => setCreating(null)}>Cancel</button>
        </div>
      )}

      <div className="exercise-grid">
          {creating === null && (
            <button className="exercise-tile add-tile" onClick={() => setCreating(search.trim())}>
              + Add {search.trim() && !filtered.some(ex => ex.name.trim().toLowerCase() === search.trim().toLowerCase())
                ? `“${search.trim()}”`
                : 'exercise'}
            </button>
          )}
          {filtered.map(ex => (
            <div key={ex.id} className="exercise-tile">
              <div className="exercise-tile-head">
                <h3>{ex.name}</h3>
                <span className={`category-badge ${ex.category}`}>
                  {isCustom(ex) ? 'custom' : CATEGORY_LABELS[ex.category]}
                </span>
                {isCustom(ex) && (
                  <button
                    className="btn-ghost small dim"
                    onClick={() => onRemoveCustom(ex.id)}
                    aria-label={`Remove ${ex.name}`}
                  >
                    ✕
                  </button>
                )}
              </div>
              {!minimalist && (
                <div className="muscle-tags">
                  {ex.muscleGroups.map(m => (
                    <span key={m} className="muscle-tag">{m}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>

      {filtered.length === 0 && (
        <p className="empty-hint">No exercises match your filters.</p>
      )}
    </div>
  )
}
