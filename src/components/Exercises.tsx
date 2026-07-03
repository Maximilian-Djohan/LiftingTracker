import { useState } from 'react'
import { DEFAULT_EXERCISES } from '../data/exercises'
import { REGION_MATCHERS } from '../data/bodyMap'
import { BodyMap } from './BodyMap'

const CATEGORIES = ['all', 'push', 'pull', 'legs', 'core'] as const
type Category = (typeof CATEGORIES)[number]

interface Props {
  showBodyMap: boolean
  minimalist: boolean
}

export function Exercises({ showBodyMap, minimalist }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('all')
  const [region, setRegion] = useState<string | null>(null)

  const filtered = DEFAULT_EXERCISES.filter(ex => {
    const matchesCategory = category === 'all' || ex.category === category

    const q = search.trim().toLowerCase()
    const matchesSearch =
      q === '' ||
      ex.name.toLowerCase().includes(q) ||
      ex.muscleGroups.some(m => m.toLowerCase().includes(q))

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
        placeholder="Search by name or muscle…"
      />

      <div className="category-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`preset-chip${category === cat ? ' active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty-hint">No exercises match your filters.</p>
      ) : (
        <div className="exercise-grid">
          {filtered.map(ex => (
            <div key={ex.id} className="exercise-tile">
              <div className="exercise-tile-head">
                <h3>{ex.name}</h3>
                <span className={`category-badge ${ex.category}`}>{ex.category}</span>
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
      )}
    </div>
  )
}
