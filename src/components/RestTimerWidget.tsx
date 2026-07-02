import { useState } from 'react'
import { useRestTimer } from '../hooks/useRestTimer'

const PRESETS = [60, 90, 120, 180]

function format(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const RING_R = 28
const RING_C = 2 * Math.PI * RING_R

export function RestTimerWidget() {
  const { duration, remaining, running, active, selectPreset, toggle, reset, adjust } = useRestTimer()
  const [open, setOpen] = useState(false)

  const done = active && remaining === 0
  const fraction = active && duration > 0 ? Math.min(remaining / duration, 1) : 0

  return (
    <>
      <button
        className={`timer-fab${done ? ' done' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Rest timer"
      >
        <svg className="timer-fab-ring" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={RING_R} fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle
            cx="32"
            cy="32"
            r={RING_R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={RING_C}
            strokeDashoffset={RING_C * (1 - fraction)}
            transform="rotate(-90 32 32)"
          />
        </svg>
        <span className="timer-fab-label">{active ? format(remaining) : '⏱'}</span>
      </button>

      {open && (
        <div className="timer-overlay" onClick={() => setOpen(false)}>
          <div className="timer-modal" onClick={e => e.stopPropagation()}>
            <div className="timer-modal-head">
              <h3>Rest Timer</h3>
              <button className="btn-ghost small" onClick={() => setOpen(false)}>Minimize ▾</button>
            </div>

            <div className={`timer-display${done ? ' done' : ''}`}>{format(remaining)}</div>

            <div className="timer-presets">
              {PRESETS.map(p => (
                <button
                  key={p}
                  className={`preset-chip${p === duration ? ' active' : ''}`}
                  onClick={() => selectPreset(p)}
                >
                  {format(p)}
                </button>
              ))}
            </div>

            <button className="btn-primary timer-primary" onClick={toggle}>
              {done ? 'Restart' : running ? 'Pause' : 'Start'}
            </button>

            <div className="timer-adjust">
              <button className="btn-secondary" onClick={() => adjust(-15)} disabled={remaining === 0}>−15s</button>
              <button className="btn-secondary" onClick={reset}>Reset</button>
              <button className="btn-secondary" onClick={() => adjust(15)}>+15s</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
