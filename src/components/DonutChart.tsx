interface Props {
  label: string
  value: number
  goal: number
  unit?: string
  color: string
}

const RADIUS = 42
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function DonutChart({ label, value, goal, unit = 'g', color }: Props) {
  const fraction = goal > 0 ? Math.min(value / goal, 1) : 0
  const offset = CIRCUMFERENCE * (1 - fraction)
  const pct = goal > 0 ? Math.round((value / goal) * 100) : 0

  return (
    <div className="donut">
      <div className="donut-ring">
        <svg viewBox="0 0 100 100" width="110" height="110">
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="var(--border)"
            strokeWidth="9"
          />
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="donut-center">
          <span className="donut-pct">{pct}%</span>
        </div>
      </div>
      <div className="donut-meta">
        <span className="donut-label">{label}</span>
        <span className="donut-values">
          {Math.round(value)} / {goal} {unit}
        </span>
      </div>
    </div>
  )
}
