import { useEffect, useRef, useState } from 'react'

// Backend base URL: a Cloudflare Worker in production, the local rag-bot
// server (http://localhost:8787) in dev. Set VITE_RAG_API_URL to override.
const API_URL = import.meta.env.VITE_RAG_API_URL ?? 'http://localhost:8787'

type Level = 'beginner' | 'intermediate' | 'advanced'
const LEVELS: Level[] = ['beginner', 'intermediate', 'advanced']
const LEVEL_KEY = 'coach-level'

interface Message {
  role: 'user' | 'coach'
  text: string
  error?: boolean
}

export function CoachChat() {
  const [open, setOpen] = useState(false)
  const [level, setLevel] = useState<Level>(
    () => (localStorage.getItem(LEVEL_KEY) as Level) || 'intermediate'
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Keep the newest message in view as it streams in.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open])

  function pickLevel(next: Level) {
    setLevel(next)
    localStorage.setItem(LEVEL_KEY, next)
  }

  async function send(event: React.FormEvent) {
    event.preventDefault()
    const question = input.trim()
    if (!question || busy) return

    setInput('')
    setBusy(true)
    setMessages(prev => [...prev, { role: 'user', text: question }, { role: 'coach', text: '' }])

    function updateLast(patch: Partial<Message>) {
      setMessages(prev => {
        const copy = prev.slice()
        copy[copy.length - 1] = { ...copy[copy.length - 1], ...patch }
        return copy
      })
    }

    try {
      const res = await fetch(`${API_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, level }),
      })
      if (!res.ok || !res.body) throw new Error(await res.text())

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
        updateLast({ text })
      }
    } catch {
      updateLast({
        text: "Couldn't reach the coach. Make sure the backend is running.",
        error: true,
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        className="btn-ghost coach-btn"
        onClick={() => setOpen(true)}
        aria-label="Ask the coach"
      >
        💬
      </button>

      {open && (
        <div className="coach-overlay" onClick={() => setOpen(false)}>
          <div className="coach-modal" onClick={e => e.stopPropagation()}>
            <div className="coach-head">
              <h3>Coach</h3>
              <button className="btn-ghost small" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>

            <div className="unit-toggle coach-levels">
              {LEVELS.map(l => (
                <button
                  key={l}
                  className={`unit-option${l === level ? ' active' : ''}`}
                  onClick={() => pickLevel(l)}
                >
                  {l[0].toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>

            <div className="coach-messages" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="coach-empty">
                  Ask me anything about training, form, or nutrition.
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={`coach-msg ${m.role}${m.error ? ' error' : ''}`}
                  >
                    {m.text || (busy && i === messages.length - 1 ? '…' : '')}
                  </div>
                ))
              )}
            </div>

            <form className="coach-input" onSubmit={send}>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask a question…"
                autoComplete="off"
                autoFocus
              />
              <button className="btn-primary" type="submit" disabled={busy || !input.trim()}>
                Ask
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
