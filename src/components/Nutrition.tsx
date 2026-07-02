import { useState } from 'react'
import type { FoodEntry, NutritionGoals } from '../types'
import { calories } from '../types'
import { useNutrition } from '../hooks/useNutrition'
import { DonutChart } from './DonutChart'

const COLORS = {
  calories: '#f5a623',
  protein: '#5b9dff',
  carbs: '#6ed08a',
  fats: '#e26fb0',
}

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function Nutrition() {
  const { entries, addEntry, deleteEntry, goals, setGoals } = useNutrition()

  const [name, setName] = useState('')
  const [carbs, setCarbs] = useState('')
  const [protein, setProtein] = useState('')
  const [fats, setFats] = useState('')
  const [editingGoals, setEditingGoals] = useState(false)

  const today = todayISO()
  const todaysEntries = entries.filter(e => e.date === today)

  const totals = todaysEntries.reduce(
    (acc, e) => ({
      carbs: acc.carbs + e.carbs,
      protein: acc.protein + e.protein,
      fats: acc.fats + e.fats,
    }),
    { carbs: 0, protein: 0, fats: 0 }
  )

  const calorieGoal = calories(goals)
  const calorieTotal = calories(totals)

  function handleAdd() {
    const entry: FoodEntry = {
      id: crypto.randomUUID(),
      date: today,
      name: name.trim() || 'Food',
      carbs: parseFloat(carbs) || 0,
      protein: parseFloat(protein) || 0,
      fats: parseFloat(fats) || 0,
    }
    addEntry(entry)
    setName('')
    setCarbs('')
    setProtein('')
    setFats('')
  }

  function updateGoal(key: keyof NutritionGoals, value: string) {
    setGoals({ ...goals, [key]: parseFloat(value) || 0 })
  }

  const canAdd = (parseFloat(carbs) || 0) + (parseFloat(protein) || 0) + (parseFloat(fats) || 0) > 0

  return (
    <div className="nutrition">
      <div className="section-head">
        <h2>Today’s Goals</h2>
        <button className="btn-ghost small" onClick={() => setEditingGoals(v => !v)}>
          {editingGoals ? 'Done' : 'Edit Goals'}
        </button>
      </div>

      <div className="donut-grid">
        <DonutChart label="Calories" value={calorieTotal} goal={calorieGoal} unit="kcal" color={COLORS.calories} />
        <DonutChart label="Protein" value={totals.protein} goal={goals.protein} color={COLORS.protein} />
        <DonutChart label="Carbs" value={totals.carbs} goal={goals.carbs} color={COLORS.carbs} />
        <DonutChart label="Fats" value={totals.fats} goal={goals.fats} color={COLORS.fats} />
      </div>

      {editingGoals && (
        <div className="goal-editor">
          <label>
            Protein (g)
            <input type="number" min="0" value={goals.protein} onChange={e => updateGoal('protein', e.target.value)} />
          </label>
          <label>
            Carbs (g)
            <input type="number" min="0" value={goals.carbs} onChange={e => updateGoal('carbs', e.target.value)} />
          </label>
          <label>
            Fats (g)
            <input type="number" min="0" value={goals.fats} onChange={e => updateGoal('fats', e.target.value)} />
          </label>
          <p className="goal-hint">Calorie goal ({calorieGoal} kcal) is calculated from your macros.</p>
        </div>
      )}

      <div className="log-food">
        <h2>Log Food</h2>
        <div className="food-form">
          <label className="food-name">
            Name
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chicken & rice" />
          </label>
          <label>
            Carbs (g)
            <input type="number" min="0" value={carbs} onChange={e => setCarbs(e.target.value)} placeholder="0" />
          </label>
          <label>
            Protein (g)
            <input type="number" min="0" value={protein} onChange={e => setProtein(e.target.value)} placeholder="0" />
          </label>
          <label>
            Fats (g)
            <input type="number" min="0" value={fats} onChange={e => setFats(e.target.value)} placeholder="0" />
          </label>
          <div className="food-calc">
            <span className="food-calc-value">
              {calories({
                carbs: parseFloat(carbs) || 0,
                protein: parseFloat(protein) || 0,
                fats: parseFloat(fats) || 0,
              })}
            </span>
            <span className="food-calc-label">kcal</span>
          </div>
          <button className="btn-primary" onClick={handleAdd} disabled={!canAdd}>Add</button>
        </div>
      </div>

      <div className="food-log">
        <h2>Today’s Log</h2>
        {todaysEntries.length === 0 ? (
          <p className="empty-hint">Nothing logged yet today.</p>
        ) : (
          <div className="food-list">
            {todaysEntries.map(e => (
              <div key={e.id} className="food-row">
                <div className="food-row-main">
                  <span className="food-row-name">{e.name}</span>
                  <span className="food-row-macros">
                    <span style={{ color: COLORS.protein }}>{e.protein}p</span>
                    <span style={{ color: COLORS.carbs }}>{e.carbs}c</span>
                    <span style={{ color: COLORS.fats }}>{e.fats}f</span>
                  </span>
                </div>
                <span className="food-row-cal">{calories(e)} kcal</span>
                <button className="btn-ghost danger small" onClick={() => deleteEntry(e.id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
