import { useEffect, useRef, useState } from 'react'

function beep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
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

export function useRestTimer() {
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
    const next = Math.max(0, remaining + delta)
    setRemaining(next)
    if (next > duration) setDuration(next)
  }

  // A timer is "active" once started and not reset back to full.
  const active = running || remaining < duration

  return { duration, remaining, running, active, selectPreset, toggle, reset, adjust }
}
