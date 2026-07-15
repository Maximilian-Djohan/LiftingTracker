import { useEffect, useRef, useState } from 'react'
import { useWorkouts } from '../hooks/useWorkouts'
import { useSettings } from '../hooks/useSettings'
import { LogWorkout } from '../components/LogWorkout'
import { WorkoutCard } from '../components/WorkoutCard'
import { Nutrition } from '../components/Nutrition'
import { Exercises } from '../components/Exercises'
import { Splits } from '../components/Splits'
import { SettingsMenu } from '../components/SettingsMenu'
import { RestTimerWidget } from '../components/RestTimerWidget'
import { useSplits } from '../hooks/useSplits'
import './styles.css'

type Page = 'workouts' | 'splits' | 'exercises' | 'nutrition'

const PAGES: Page[] = ['workouts', 'splits', 'exercises', 'nutrition']
const PAGER_TRANSITION = 'transform 0.34s cubic-bezier(0.22, 0.61, 0.36, 1)'

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
  const [heroTucked, setHeroTucked] = useState(false)

  const index = PAGES.indexOf(page)
  const indexRef = useRef(index)
  indexRef.current = index
  const loggingRef = useRef(logging)
  loggingRef.current = logging

  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const workoutsScrollRef = useRef<HTMLDivElement>(null)
  const gesture = useRef({ startX: 0, startY: 0, width: 0, decided: false, horizontal: false, active: false })

  useEffect(() => {
    document.body.classList.toggle('theme-light', settings.theme === 'light')
  }, [settings.theme])

  // Tuck the New Workout bar while scrolling down the history, bring it back on scroll up.
  useEffect(() => {
    const el = workoutsScrollRef.current
    if (!el) return
    let lastY = el.scrollTop
    function onScroll() {
      const y = el!.scrollTop
      const dy = y - lastY
      lastY = y
      if (y < 40) setHeroTucked(false)
      else if (dy > 6) setHeroTucked(true)
      else if (dy < -6) setHeroTucked(false)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Touch carousel: the track follows the finger, both pages moving together.
  useEffect(() => {
    const vp = viewportRef.current
    const track = trackRef.current
    if (!vp || !track) return

    function onStart(e: TouchEvent) {
      if (loggingRef.current) return
      const t = e.touches[0]
      gesture.current = {
        startX: t.clientX,
        startY: t.clientY,
        width: vp!.clientWidth,
        decided: false,
        horizontal: false,
        active: true,
      }
    }

    function onMove(e: TouchEvent) {
      const g = gesture.current
      if (!g.active) return
      const t = e.touches[0]
      const dx = t.clientX - g.startX
      const dy = t.clientY - g.startY

      if (!g.decided) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        g.decided = true
        g.horizontal = Math.abs(dx) > Math.abs(dy)
      }
      if (!g.horizontal) return

      e.preventDefault() // lock vertical scroll while sliding horizontally
      const i = indexRef.current
      const atEdge = (i === 0 && dx > 0) || (i === PAGES.length - 1 && dx < 0)
      const adj = atEdge ? dx * 0.3 : dx // rubber-band at the ends
      track!.style.transition = 'none'
      track!.style.transform = `translateX(${-i * g.width + adj}px)`
    }

    function onEnd(e: TouchEvent) {
      const g = gesture.current
      if (!g.active) return
      g.active = false
      if (!g.horizontal) return

      const dx = e.changedTouches[0].clientX - g.startX
      const threshold = Math.min(g.width * 0.25, 90)
      let target = indexRef.current
      if (dx <= -threshold && target < PAGES.length - 1) target += 1
      else if (dx >= threshold && target > 0) target -= 1

      track!.style.transition = PAGER_TRANSITION
      track!.style.transform = `translateX(${-target * g.width}px)`
      setPage(PAGES[target])
    }

    vp.addEventListener('touchstart', onStart, { passive: true })
    vp.addEventListener('touchmove', onMove, { passive: false })
    vp.addEventListener('touchend', onEnd)
    vp.addEventListener('touchcancel', onEnd)
    return () => {
      vp.removeEventListener('touchstart', onStart)
      vp.removeEventListener('touchmove', onMove)
      vp.removeEventListener('touchend', onEnd)
      vp.removeEventListener('touchcancel', onEnd)
    }
  }, [])

  const workoutsPage = logging ? (
    <LogWorkout
      defaultUnit={settings.defaultUnit}
      activeSplit={activeSplit}
      workouts={workouts}
      minimalist={settings.minimalist}
      onSave={workout => {
        addWorkout(workout)
        setLogging(false)
        setHeroTucked(false)
      }}
      onCancel={() => {
        setLogging(false)
        setHeroTucked(false)
      }}
    />
  ) : (
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
  )

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <h1>Lifting Tracker</h1>
        </div>
        <SettingsMenu settings={settings} onChange={updateSettings} />
      </header>

      <div className="pager-viewport" ref={viewportRef}>
        <div
          className="pager-track"
          ref={trackRef}
          style={{ transform: `translateX(-${index * 100}%)`, transition: PAGER_TRANSITION }}
        >
          <div className="pager-page" ref={workoutsScrollRef}>{workoutsPage}</div>
          <div className="pager-page">
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
          </div>
          <div className="pager-page">
            <Exercises showBodyMap={settings.showBodyMap} minimalist={settings.minimalist} />
          </div>
          <div className="pager-page">
            <Nutrition />
          </div>
        </div>
      </div>

      <button
        className={`new-workout-bar${settings.showRestTimer ? '' : ' full'}${
          page !== 'workouts' || logging || heroTucked ? ' tucked' : ''
        }`}
        onClick={() => setLogging(true)}
      >
        + New Workout
      </button>

      <nav className="bottom-nav">
        <button
          className={`nav-item${page === 'workouts' ? ' active' : ''}`}
          onClick={() => setPage('workouts')}
        >
          <span className="nav-icon">🏋️</span>
          Workouts
        </button>
        <button
          className={`nav-item${page === 'splits' ? ' active' : ''}`}
          onClick={() => setPage('splits')}
        >
          <span className="nav-icon">📅</span>
          Splits
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

      {settings.showRestTimer && <RestTimerWidget />}
    </div>
  )
}
