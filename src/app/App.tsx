import { useEffect, useRef, useState } from 'react'
import { useWorkouts } from '../hooks/useWorkouts'
import { useSettings } from '../hooks/useSettings'
import { LogWorkout } from '../components/LogWorkout'
import { WorkoutCard } from '../components/WorkoutCard'
import { Stats } from '../components/Stats'
import { Nutrition } from '../components/Nutrition'
import { Exercises } from '../components/Exercises'
import { Splits } from '../components/Splits'
import { SettingsMenu } from '../components/SettingsMenu'
import { RestTimerWidget } from '../components/RestTimerWidget'
import { useSplits } from '../hooks/useSplits'
import './styles.css'

type Page = 'workouts' | 'splits' | 'exercises' | 'nutrition'

const PAGES: Page[] = ['workouts', 'splits', 'exercises', 'nutrition']

const SWIPE_MIN_X = 60 // px of horizontal travel to count as a swipe
const SWIPE_RATIO = 2 // horizontal travel must dominate vertical scroll

export default function App() {
  const { workouts, addWorkout, deleteWorkout } = useWorkouts()
  const { settings, updateSettings } = useSettings()
  const {
    allSplits,
    activeSplit,
    activeSplitId,
    editedFeaturedIds,
    setActiveSplitId,
    addCustomSplit,
    updateSplit,
    resetSplit,
    deleteCustomSplit,
  } = useSplits()
  const [logging, setLogging] = useState(false)
  const [page, setPage] = useState<Page>('workouts')
  const [slideDir, setSlideDir] = useState<'forward' | 'back' | null>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    document.body.classList.toggle('theme-light', settings.theme === 'light')
  }, [settings.theme])

  function goToPage(next: Page) {
    if (next === page) return
    setSlideDir(PAGES.indexOf(next) > PAGES.indexOf(page) ? 'forward' : 'back')
    setPage(next)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current
    touchStart.current = null
    // Don't swipe away from a half-filled workout form
    if (!start || logging) return

    const dx = e.changedTouches[0].clientX - start.x
    const dy = e.changedTouches[0].clientY - start.y
    if (Math.abs(dx) < SWIPE_MIN_X || Math.abs(dx) < Math.abs(dy) * SWIPE_RATIO) return

    const idx = PAGES.indexOf(page)
    const next = dx < 0 ? PAGES[idx + 1] : PAGES[idx - 1]
    if (next) goToPage(next)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <h1>Lifting Tracker</h1>
        </div>
        <SettingsMenu settings={settings} onChange={updateSettings} />
      </header>

      <main className="app-main" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div key={page} className={`page-view${slideDir ? ` slide-${slideDir}` : ''}`}>
          {page === 'workouts' && (
            logging ? (
              <LogWorkout
                defaultUnit={settings.defaultUnit}
                activeSplit={activeSplit}
                workouts={workouts}
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

          {page === 'splits' && (
            <Splits
              splits={allSplits}
              activeSplitId={activeSplitId}
              editedFeaturedIds={editedFeaturedIds}
              onSetActive={setActiveSplitId}
              onCreate={addCustomSplit}
              onUpdate={updateSplit}
              onReset={resetSplit}
              onDelete={deleteCustomSplit}
            />
          )}

          {page === 'exercises' && <Exercises showBodyMap={settings.showBodyMap} />}

          {page === 'nutrition' && <Nutrition />}
        </div>
      </main>

      <nav className="bottom-nav">
        <button
          className={`nav-item${page === 'workouts' ? ' active' : ''}`}
          onClick={() => goToPage('workouts')}
        >
          <span className="nav-icon">🏋️</span>
          Workouts
        </button>
        <button
          className={`nav-item${page === 'splits' ? ' active' : ''}`}
          onClick={() => goToPage('splits')}
        >
          <span className="nav-icon">📅</span>
          Splits
        </button>
        <button
          className={`nav-item${page === 'exercises' ? ' active' : ''}`}
          onClick={() => goToPage('exercises')}
        >
          <span className="nav-icon">📖</span>
          Exercises
        </button>
        <button
          className={`nav-item${page === 'nutrition' ? ' active' : ''}`}
          onClick={() => goToPage('nutrition')}
        >
          <span className="nav-icon">🍎</span>
          Nutrition
        </button>
      </nav>

      <RestTimerWidget />
    </div>
  )
}
