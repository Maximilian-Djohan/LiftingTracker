import { useState } from 'react'
import type { Settings } from '../hooks/useSettings'

interface Props {
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
}

export function SettingsMenu({ settings, onChange }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="btn-ghost settings-btn" onClick={() => setOpen(true)} aria-label="Settings">
        ⚙
      </button>

      {open && (
        <div className="settings-overlay" onClick={() => setOpen(false)}>
          <div className="settings-panel" onClick={e => e.stopPropagation()}>
            <div className="settings-head">
              <h3>Settings</h3>
              <button className="btn-ghost small" onClick={() => setOpen(false)}>✕</button>
            </div>

            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Minimalist mode</span>
                <span className="settings-row-hint">Hide extra detail like muscle groups</span>
              </div>
              <div className="unit-toggle">
                <button
                  className={`unit-option${settings.minimalist ? ' active' : ''}`}
                  onClick={() => onChange({ minimalist: true })}
                >
                  On
                </button>
                <button
                  className={`unit-option${!settings.minimalist ? ' active' : ''}`}
                  onClick={() => onChange({ minimalist: false })}
                >
                  Off
                </button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Default unit</span>
                <span className="settings-row-hint">Used when starting a new workout</span>
              </div>
              <div className="unit-toggle">
                <button
                  className={`unit-option${settings.defaultUnit === 'kg' ? ' active' : ''}`}
                  onClick={() => onChange({ defaultUnit: 'kg' })}
                >
                  kg
                </button>
                <button
                  className={`unit-option${settings.defaultUnit === 'lbs' ? ' active' : ''}`}
                  onClick={() => onChange({ defaultUnit: 'lbs' })}
                >
                  lbs
                </button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Theme</span>
                <span className="settings-row-hint">App colour scheme</span>
              </div>
              <div className="unit-toggle">
                <button
                  className={`unit-option${settings.theme === 'dark' ? ' active' : ''}`}
                  onClick={() => onChange({ theme: 'dark' })}
                >
                  Dark
                </button>
                <button
                  className={`unit-option${settings.theme === 'light' ? ' active' : ''}`}
                  onClick={() => onChange({ theme: 'light' })}
                >
                  Light
                </button>
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-text">
                <span className="settings-row-label">Body map</span>
                <span className="settings-row-hint">Clickable figure on the Exercises page</span>
              </div>
              <div className="unit-toggle">
                <button
                  className={`unit-option${settings.showBodyMap ? ' active' : ''}`}
                  onClick={() => onChange({ showBodyMap: true })}
                >
                  On
                </button>
                <button
                  className={`unit-option${!settings.showBodyMap ? ' active' : ''}`}
                  onClick={() => onChange({ showBodyMap: false })}
                >
                  Off
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
