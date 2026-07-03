import { useEffect, useState } from 'react'
import { useWorkouts } from '../hooks/useWorkouts'
import { useSettings } from '../hooks/useSettings'
import { LogWorkout } from '../components/LogWorkout'
import { WorkoutCard } from '../components/WorkoutCard'
import { Stats } from '../components/Stats'
import { Nutrition } from '../components/Nutrition'
import { Exercises } from '../components/Exercises'
import { SettingsMenu } from '../components/SettingsMenu'
import { RestTimerWidget } from '../components/RestTimerWidget'
import './styles.css'

type Page = 'workouts' | 'exercises' | 'nutrition'

export default function App() {
  const { workouts, addWorkout, deleteWorkout } = useWorkouts()
  const { settings, updateSettings } = useSettings()
  const [logging, setLogging] = useState(false)
  const [page, setPage] = useState<Page>('workouts')

  useEffect(() => {
    document.body.classList.toggle('theme-light', settings.theme === 'light')
  }, [settings.theme])

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <h1>Lifting Tracker</h1>
        </div>
        <SettingsMenu settings={settings} onChange={updateSettings} />
      </header>

      <main className="app-main">
        {page === 'workouts' && (
          logging ? (
            <LogWorkout
              defaultUnit={settings.defaultUnit}
              onSave={workout => {
                addWorkout(workout)
                setLogging(false)
              }}
              onCancel={() => setLogging(false)}
            />
          ) : (
            <>
              <div className="new-workout-hero">
                <button className="btn-hero" onClick={() => setLogging(true)}>
                  + New Workout
                </button>
              </div>

              <Stats workouts={workouts} />

              <section className="history">
                <h2>History</h2>
                {workouts.length === 0 ? (
                  <div className="empty-state">
                    <p>No workouts yet — hit “New Workout” to log your first session.</p>
                  </div>
                ) : (
                  <div className="workout-grid">
                    {workouts.map(w => (
                      <WorkoutCard key={w.id} workout={w} onDelete={deleteWorkout} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )
        )}

        {page === 'exercises' && <Exercises showBodyMap={settings.showBodyMap} />}

        {page === 'nutrition' && <Nutrition />}
      </main>

      <nav className="bottom-nav">
        <button
          className={`nav-item${page === 'workouts' ? ' active' : ''}`}
          onClick={() => setPage('workouts')}
        >
          <span className="nav-icon">🏋️</span>
          Workouts
        </button>
        <button
          className={`nav-item${page === 'exercises' ? ' active' : ''}`}
          onClick={() => setPage('exercises')}
        >
          <span className="nav-icon">📖</span>
          Exercises
        </button>
        <button
          className={`nav-item${page === 'nutrition' ? ' active' : ''}`}
          onClick={() => setPage('nutrition')}
        >
          <span className="nav-icon">🍎</span>
          Nutrition
        </button>
      </nav>

      <RestTimerWidget />
    </div>
  )
}
