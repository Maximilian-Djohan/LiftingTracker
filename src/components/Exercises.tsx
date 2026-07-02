import { useState } from 'react'
import { DEFAULT_EXERCISES } from '../data/exercises'

const CATEGORIES = ['all', 'push', 'pull', 'legs', 'core'] as const
type Category = (typeof CATEGORIES)[number]

export function Exercises() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('all')

  const filtered = DEFAULT_EXERCISES.filter(ex => {
    const matchesCategory = category === 'all' || ex.category === category
    const q = search.trim().toLowerCase()
    const matchesSearch =
      q === '' ||
      ex.name.toLowerCase().includes(q) ||
      ex.muscleGroups.some(m => m.toLowerCase().includes(q))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="exercises-page">
      <h2>Explore Exercises</h2>

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
        <p className="empty-hint">No exercises match your search.</p>
      ) : (
        <div className="exercise-grid">
          {filtered.map(ex => (
            <div key={ex.id} className="exercise-tile">
              <div className="exercise-tile-head">
                <h3>{ex.name}</h3>
                <span className={`category-badge ${ex.category}`}>{ex.category}</span>
              </div>
              <div className="muscle-tags">
                {ex.muscleGroups.map(m => (
                  <span key={m} className="muscle-tag">{m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
