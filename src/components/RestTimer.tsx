import { useEffect, useRef, useState } from 'react'

const PRESETS = [60, 90, 120, 180]

function format(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
    osc.onended = () => ctx.close()
  } catch {
    // audio not available — ignore
  }
}

export function RestTimer() {
  const [duration, setDuration] = useState(90)
  const [remaining, setRemaining] = useState(90)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = window.setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          beep()
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    }
  }, [running])

  function selectPreset(seconds: number) {
    setDuration(seconds)
    setRemaining(seconds)
    setRunning(true)
  }

  function toggle() {
    if (remaining === 0) {
      setRemaining(duration)
      setRunning(true)
    } else {
      setRunning(r => !r)
    }
  }

  function reset() {
    setRunning(false)
    setRemaining(duration)
  }

  function adjust(delta: number) {
    setRemaining(prev => Math.max(0, prev + delta))
  }

  const done = remaining === 0

  return (
    <div className={`rest-timer${done ? ' done' : ''}`}>
      <div className="rest-timer-main">
        <span className="rest-timer-display">{format(remaining)}</span>
        <div className="rest-timer-controls">
          <button className="btn-ghost small" onClick={() => adjust(-15)} disabled={remaining === 0}>−15s</button>
          <button className="btn-secondary" onClick={toggle}>
            {done ? 'Restart' : running ? 'Pause' : 'Start'}
          </button>
          <button className="btn-ghost small" onClick={() => adjust(15)}>+15s</button>
          <button className="btn-ghost small" onClick={reset}>Reset</button>
        </div>
      </div>
      <div className="rest-timer-presets">
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
    </div>
  )
}
