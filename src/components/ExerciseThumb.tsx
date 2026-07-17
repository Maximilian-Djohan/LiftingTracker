import { useState } from 'react'
import type { Exercise } from '../types'
import { ANTERIOR, POSTERIOR, musclesForGroups, type BodyMusclePolys } from '../data/bodyMap'

const BASE = import.meta.env.BASE_URL

function MiniFigure({ data, lit }: { data: BodyMusclePolys[]; lit: Set<string> }) {
  return (
    <svg viewBox="0 0 100 202" className="thumb-figure">
      {data.flatMap(group =>
        group.points.map((pts, i) => (
          <polygon
            key={`${group.muscle}-${i}`}
            points={pts}
            className={lit.has(group.muscle) ? 'thumb-poly lit' : 'thumb-poly'}
          />
        ))
      )}
    </svg>
  )
}

/** Generated exercise render when present, body-map highlight otherwise */
export function ExerciseThumb({ exercise }: { exercise: Exercise }) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    const lit = musclesForGroups(exercise.muscleGroups)
    return (
      <div className="exercise-thumb">
        <MiniFigure data={ANTERIOR} lit={lit} />
        <MiniFigure data={POSTERIOR} lit={lit} />
      </div>
    )
  }

  return (
    <div className="exercise-thumb">
      <img
        src={`${BASE}exercises/${exercise.id}.png`}
        alt={`${exercise.name} start and end positions`}
        loading="lazy"
        onError={() => setImgError(true)}
      />
    </div>
  )
}
