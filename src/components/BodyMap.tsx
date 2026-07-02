import { ANTERIOR, POSTERIOR, MUSCLE_TO_REGION, type BodyMusclePolys } from '../data/bodyMap'

interface Props {
  selected: string | null
  onSelect: (region: string | null) => void
}

interface FigureProps extends Props {
  data: BodyMusclePolys[]
  label: string
}

function Figure({ data, label, selected, onSelect }: FigureProps) {
  return (
    <div className="body-figure">
      <svg viewBox="0 0 100 202">
        {data.map(group => {
          const region = MUSCLE_TO_REGION[group.muscle]
          const cls =
            'body-poly' +
            (region ? ' clickable' : '') +
            (region && region === selected ? ' active' : '')
          return group.points.map((pts, i) => (
            <polygon
              key={`${group.muscle}-${i}`}
              points={pts}
              className={cls}
              onClick={region ? () => onSelect(region === selected ? null : region) : undefined}
            >
              {region && <title>{region}</title>}
            </polygon>
          ))
        })}
      </svg>
      <span className="body-figure-label">{label}</span>
    </div>
  )
}

export function BodyMap({ selected, onSelect }: Props) {
  return (
    <div className="body-map">
      <Figure data={ANTERIOR} label="Front" selected={selected} onSelect={onSelect} />
      <Figure data={POSTERIOR} label="Back" selected={selected} onSelect={onSelect} />
    </div>
  )
}
