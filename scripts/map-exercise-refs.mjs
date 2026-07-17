// Maps this app's exercise catalog to free-exercise-db entries and downloads
// their start/end reference photos into image-refs/<our-id>-0.jpg / -1.jpg.
// Public domain source: github.com/yuhonas/free-exercise-db
// Run: node scripts/map-exercise-refs.mjs
// Idempotent: skips refs already downloaded. Review the printed report and
// extend OVERRIDES for anything mismatched, then re-run.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const DB_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/'
const OUT_DIR = 'image-refs'

// our-id -> free-exercise-db name (exact). null = no usable match, skip.
// The ref only anchors the pose; the generation prompt carries our exercise
// name and muscles, so a close-cousin pose is fine.
const OVERRIDES = {
  'reverse-grip-incline-smith-machine-bench-press': 'Smith Machine Incline Bench Press',
  'machine-chest-press': 'Leverage Chest Press',
  'incline-machine-chest-press': 'Leverage Incline Chest Press',
  'decline-machine-chest-press': 'Leverage Decline Chest Press',
  'diamond-push-up': 'Push-Ups - Close Triceps Position',
  'cable-chest-fly': 'Cable Crossover',
  'dumbbell-chest-fly': 'Dumbbell Flyes',
  'pec-deck': 'Butterfly',
  'seated-low-to-high-cable-fly': 'Low Cable Crossover',
  'machine-pullover': 'Straight-Arm Dumbbell Pullover',
  'machine-chest-supported-row': 'Leverage Iso Row',
  'dumbbell-chest-supported-row': 'Dumbbell Incline Row',
  'barbell-chest-supported-row': 'Dumbbell Incline Row',
  'wide-grip-machine-row': 'Leverage High Row',
  'close-grip-machine-row': 'Leverage Iso Row',
  'kelso-shrug': 'Middle Back Shrug',
  'keenan-flaps-frontal': null,
  'keenan-flaps-sagittal': null,
  'overhead-press': 'Standing Military Press',
  'landmine-press': 'Landmine Linear Jammer',
  'machine-lateral-raise': 'Side Lateral Raise',
  'incline-dumbbell-y-raise': 'Front Incline Dumbbell Raise',
  'machine-front-raise': 'Front Dumbbell Raise',
  'unilateral-preacher-curl': 'One Arm Dumbbell Preacher Curl',
  'bayesian-curl': null,
  'recline-curl': null,
  'behind-the-back-curl': null,
  'unilateral-overhead-tricep-extension': 'Standing One-Arm Dumbbell Triceps Extension',
  'underhand-cable-extension': 'Reverse Grip Triceps Pushdown',
  'machine-tricep-dip': 'Dip Machine',
  squat: 'Barbell Squat',
  'bulgarian-split-squat': 'One Leg Barbell Squat',
  'landmine-squat': null,
  'single-leg-romanian-deadlift': 'Kettlebell One-Legged Deadlift',
  'dumbbell-romanian-deadlift': 'Stiff-Legged Dumbbell Deadlift',
  'hex-bar-deadlift': 'Trap Bar Deadlift',
  'stiff-leg-deadlift': 'Stiff-Legged Barbell Deadlift',
  'machine-hip-abduction': 'Thigh Abductor',
  'machine-hip-adduction': 'Thigh Adductor',
  'leg-press-calf-raise': 'Calf Press On The Leg Press Machine',
  'decline-sit-up': 'Decline Crunch',
  'side-plank': 'Side Bridge',
  'ab-wheel': 'Ab Roller',
}

function ourExercises() {
  return readFile('src/data/exercises.ts', 'utf8').then(src =>
    [...src.matchAll(/id: '([^']+)', name: '([^']+)'/g)].map(m => ({ id: m[1], name: m[2] }))
  )
}

const norm = s =>
  s
    .toLowerCase()
    .replace(/[-_/(),]/g, ' ')
    .replace(/\b(with|the|on|a|an|of)\b/g, ' ')
    .replace(/s\b/g, '')
    .split(/\s+/)
    .filter(Boolean)

const SYNONYMS = {
  pushup: 'push up',
  pullup: 'pull up',
  situp: 'sit up',
  triceps: 'tricep',
  bicep: 'biceps',
  pulldown: 'pull down',
  pushdown: 'push down',
}

function tokens(name) {
  let n = name.toLowerCase()
  for (const [from, to] of Object.entries(SYNONYMS)) n = n.replaceAll(from, to)
  return new Set(norm(n))
}

function score(ourTokens, theirTokens) {
  let overlap = 0
  for (const t of ourTokens) if (theirTokens.has(t)) overlap++
  const union = new Set([...ourTokens, ...theirTokens]).size
  // favor entries that cover all of our tokens
  const coverage = overlap / ourTokens.size
  return coverage + overlap / union
}

const db = await fetch(DB_URL).then(r => r.json())
const ours = await ourExercises()
await mkdir(OUT_DIR, { recursive: true })

const dbByName = new Map(db.map(e => [e.name, e]))
const matched = []
const unmatched = []

for (const ex of ours) {
  let entry = null
  if (ex.id in OVERRIDES) {
    entry = OVERRIDES[ex.id] === null ? null : dbByName.get(OVERRIDES[ex.id])
    if (OVERRIDES[ex.id] !== null && !entry) console.warn(`override name not found: ${OVERRIDES[ex.id]}`)
  } else {
    const ourT = tokens(ex.name)
    const ranked = db
      .map(e => ({ e, s: score(ourT, tokens(e.name)) }))
      .sort((a, b) => b.s - a.s)
    if (ranked[0].s >= 1.5) entry = ranked[0].e
    else {
      unmatched.push({
        id: ex.id,
        name: ex.name,
        candidates: ranked.slice(0, 3).map(r => `${r.e.name} (${r.s.toFixed(2)})`),
      })
      continue
    }
  }
  if (entry) matched.push({ id: ex.id, name: ex.name, db: entry.name, images: entry.images })
  else unmatched.push({ id: ex.id, name: ex.name, candidates: ['<explicitly skipped>'] })
}

let downloaded = 0
for (const m of matched) {
  for (let i = 0; i < Math.min(2, m.images.length); i++) {
    const dest = path.join(OUT_DIR, `${m.id}-${i}.jpg`)
    if (existsSync(dest)) continue
    const res = await fetch(IMG_BASE + m.images[i])
    if (!res.ok) {
      console.warn(`download failed: ${m.images[i]}`)
      continue
    }
    await writeFile(dest, Buffer.from(await res.arrayBuffer()))
    downloaded++
  }
}

await writeFile(path.join(OUT_DIR, 'mapping.json'), JSON.stringify({ matched, unmatched }, null, 2))

console.log(`matched ${matched.length} / ${ours.length}, downloaded ${downloaded} new images`)
console.log(`\nunmatched (${unmatched.length}):`)
for (const u of unmatched) console.log(`  ${u.id}\n    ? ${u.candidates.join('\n    ? ')}`)
