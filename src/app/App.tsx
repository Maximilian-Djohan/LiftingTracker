import { useEffect, useRef, useState } from 'react'
import { useWorkouts } from '../hooks/useWorkouts'
import { useSettings } from '../hooks/useSettings'
import { LogWorkout, hasWorkoutDraft } from '../components/LogWorkout'
import { WorkoutCard } from '../components/WorkoutCard'
import { Nutrition } from '../components/Nutrition'
import { Exercises } from '../components/Exercises'
import { Splits } from '../components/Splits'
import { SettingsMenu } from '../components/SettingsMenu'
import { RestTimerWidget } from '../components/RestTimerWidget'
import { CoachChat } from '../components/CoachChat'
import { useSplits } from '../hooks/useSplits'
import { useCustomExercises } from '../hooks/useCustomExercises'
import './styles.css'

type Page = 'workouts' | 'splits' | 'exercises' | 'nutrition'

const PAGES: Page[] = ['workouts', 'splits', 'exercises', 'nutrition']
const PAGER_TRANSITION = 'transform 0.34s cubic-bezier(0.22, 0.61, 0.36, 1)'

// Set only while the log screen is the view on screen, so a reload reopens it
// only if that was where the user actually was when they left.
const LOG_OPEN_KEY = 'lifting-tracker-log-open'

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
  const { allExercises, addCustomExercise, removeCustomExercise } = useCustomExercises()
  // Reopen an unsaved workout after a reload only if the log screen was the
  // view on screen when the user left (not if they had navigated away).
  const [logging, setLogging] = useState(
    () => hasWorkoutDraft() && localStorage.getItem(LOG_OPEN_KEY) === '1'
  )
  const [page, setPage] = useState<Page>('workouts')
  const [chromeHidden, setChromeHidden] = useState(false)

  const index = PAGES.indexOf(page)
  const indexRef = useRef(index)
  indexRef.current = index
  const loggingRef = useRef(logging)
  loggingRef.current = logging

  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const workoutsScrollRef = useRef<HTMLDivElement>(null)
  const heroBarRef = useRef<HTMLButtonElement>(null)
  const gesture = useRef({ startX: 0, startY: 0, width: 0, decided: false, horizontal: false, active: false })

  useEffect(() => {
    document.body.classList.toggle('theme-light', settings.theme === 'light')
  }, [settings.theme])

  // Display size: scale the whole app so the user can dial in how much fits
  useEffect(() => {
    document.documentElement.style.zoom = String(settings.uiScale ?? 1)
  }, [settings.uiScale])

  // Header and nav return whenever we leave the log screen
  useEffect(() => {
    if (!logging) setChromeHidden(false)
  }, [logging])

  // Remember whether the log screen is actually on screen (logging and on the
  // workouts tab), so a reload knows whether to reopen it.
  useEffect(() => {
    if (logging && page === 'workouts') localStorage.setItem(LOG_OPEN_KEY, '1')
    else localStorage.removeItem(LOG_OPEN_KEY)
  }, [logging, page])

  // The New Workout bar grows gradually as the history approaches the top:
  // full size at scrollTop 0, compact from 160px down. The size eases toward
  // the scroll target each frame so it stays fluid between scroll events.
  useEffect(() => {
    const el = workoutsScrollRef.current
    if (!el) return
    const GROW_RANGE = 160
    const targetFor = () => Math.max(0, Math.min(1, 1 - el.scrollTop / GROW_RANGE))
    let current = targetFor()
    let target = current
    let raf = 0
    const apply = () => heroBarRef.current?.style.setProperty('--hero-grow', current.toFixed(3))
    const step = () => {
      current += (target - current) * 0.15
      if (Math.abs(target - current) < 0.002) current = target
      apply()
      raf = current === target ? 0 : requestAnimationFrame(step)
    }
    let lastY = el.scrollTop
    let lastT = performance.now()
    // Trigger on scroll speed (px/ms): a gentle push down hides it, but it
    // only comes back on a faster deliberate flick up.
    const HIDE_SPEED = 0.5
    const SHOW_SPEED = 3
    const onScroll = () => {
      target = targetFor()
      if (!raf) raf = requestAnimationFrame(step)
      const y = el.scrollTop
      const now = performance.now()
      const dt = now - lastT
      if (loggingRef.current) {
        if (y < 48) {
          setChromeHidden(false)
        } else if (dt > 0 && dt < 200) {
          const v = (y - lastY) / dt // px per ms, positive is scrolling down
          if (v > HIDE_SPEED) setChromeHidden(true)
          else if (-v > SHOW_SPEED) setChromeHidden(false)
        }
      }
      lastY = y
      lastT = now
    }
    apply()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
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
      const threshold = Math.min(g.width * 0.18, 60)
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
      exerciseCatalog={allExercises}
      onCreateExercise={addCustomExercise}
      onSave={workout => {
        addWorkout(workout)
        setLogging(false)
      }}
      onCancel={() => setLogging(false)}
    />
  ) : (
    <section className="history">
      <h2>History</h2>
      {workouts.length === 0 ? (
        <div className="empty-state">
          <p>No workouts yet. Hit “New Workout” to log your first session.</p>
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
    <div className={`app${chromeHidden ? ' chrome-hidden' : ''}`}>
      <header className="app-header">
        <div className="brand">
          <h1>Lifting Tracker</h1>
        </div>
        <div className="header-actions">
          <CoachChat />
          <SettingsMenu settings={settings} onChange={updateSettings} />
        </div>
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
              exercises={allExercises}
              onSetActive={setActiveSplitId}
              onCreate={addCustomSplit}
              onUpdate={updateSplit}
              onReset={resetSplit}
              onDelete={deleteCustomSplit}
            />
          </div>
          <div className="pager-page">
            <Exercises
              showBodyMap={settings.showBodyMap}
              minimalist={settings.minimalist}
              exercises={allExercises}
              onRemoveCustom={removeCustomExercise}
              onCreate={addCustomExercise}
            />
          </div>
          <div className="pager-page">
            <Nutrition />
          </div>
        </div>
      </div>

      <button
        ref={heroBarRef}
        className={`new-workout-bar${settings.showRestTimer ? '' : ' full'}${
          page !== 'workouts' || logging ? ' tucked' : ''
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
