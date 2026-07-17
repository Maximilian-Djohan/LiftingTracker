// Secondary reference source: wger.de (openly licensed exercise database).
// Fills image-refs/ for exercises that have no reference yet, or re-fetches
// specific ones on demand:
//   node scripts/fetch-wger-refs.mjs                      -> fill missing only
//   IDS=machine-chest-press,pec-deck node scripts/fetch-wger-refs.mjs
//      -> replace the refs for those ids with wger images (if matched)
// License metadata for downloaded images lands in image-refs/wger-licenses.json.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const API = 'https://wger.de/api/v2'
const OUT_DIR = 'image-refs'
const IDS = process.env.IDS ? process.env.IDS.split(',').map(s => s.trim()) : null

// our-id -> exact wger exercise name, for when auto-matching picks wrong
const WGER_OVERRIDES = {}

async function fetchAll(endpoint, params) {
  const items = []
  let url = `${API}/${endpoint}/?format=json&limit=100&${params ?? ''}`
  while (url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${endpoint} ${res.status}`)
    const data = await res.json()
    items.push(...data.results)
    url = data.next
  }
  return items
}

const norm = s =>
  s
    .toLowerCase()
    .replace(/[-_/(),]/g, ' ')
    .replace(/\b(with|the|on|a|an|of)\b/g, ' ')
    .replace(/s\b/g, '')
    .split(/\s+/)
    .filter(Boolean)

const tokens = name => new Set(norm(name))

function score(ourTokens, theirTokens) {
  let overlap = 0
  for (const t of ourTokens) if (theirTokens.has(t)) overlap++
  const union = new Set([...ourTokens, ...theirTokens]).size
  return overlap / ourTokens.size + overlap / union
}

const ourExercises = [
  ...(await readFile('src/data/exercises.ts', 'utf8')).matchAll(/id: '([^']+)', name: '([^']+)'/g),
].map(m => ({ id: m[1], name: m[2] }))

console.log('fetching wger catalog...')
const images = await fetchAll('exerciseimage')
const translations = await fetchAll('exercise-translation', 'language=2')

const nameByBase = new Map()
for (const t of translations) if (!nameByBase.has(t.exercise)) nameByBase.set(t.exercise, t.name)

const candidates = images
  .filter(img => img.is_main && nameByBase.has(img.exercise))
  .map(img => ({
    name: nameByBase.get(img.exercise),
    url: img.image,
    license: img.license,
    author: img.license_author,
  }))
console.log(`wger: ${candidates.length} named main images available`)

const targets = ourExercises.filter(ex =>
  IDS ? IDS.includes(ex.id) : !existsSync(path.join(OUT_DIR, `${ex.id}-0.jpg`)) && !existsSync(path.join(OUT_DIR, `${ex.id}-0.png`))
)
if (targets.length === 0) {
  console.log('nothing to do: all targets already have references')
  process.exit(0)
}

await mkdir(OUT_DIR, { recursive: true })
const licenses = existsSync(path.join(OUT_DIR, 'wger-licenses.json'))
  ? JSON.parse(await readFile(path.join(OUT_DIR, 'wger-licenses.json'), 'utf8'))
  : {}

for (const ex of targets) {
  let pick = null
  if (ex.id in WGER_OVERRIDES) {
    pick = candidates.find(c => c.name === WGER_OVERRIDES[ex.id]) ?? null
    if (!pick) console.warn(`${ex.id}: override name not found in wger`)
  } else {
    const ourT = tokens(ex.name)
    const ranked = candidates.map(c => ({ c, s: score(ourT, tokens(c.name)) })).sort((a, b) => b.s - a.s)
    if (ranked[0] && ranked[0].s >= 1.5) pick = ranked[0].c
    else {
      console.log(
        `no match  ${ex.id}\n  ? ${ranked
          .slice(0, 3)
          .map(r => `${r.c.name} (${r.s.toFixed(2)})`)
          .join('\n  ? ')}`
      )
      continue
    }
  }
  if (!pick) continue

  const res = await fetch(pick.url)
  if (!res.ok) {
    console.warn(`${ex.id}: download failed (${res.status})`)
    continue
  }
  const ext = pick.url.toLowerCase().endsWith('.png') ? 'png' : 'jpg'
  const dest = path.join(OUT_DIR, `${ex.id}-0.${ext}`)
  await writeFile(dest, Buffer.from(await res.arrayBuffer()))
  licenses[ex.id] = { source: pick.url, wgerName: pick.name, license: pick.license, author: pick.author }
  console.log(`ok  ${ex.id}  <-  ${pick.name}`)
}

await writeFile(path.join(OUT_DIR, 'wger-licenses.json'), JSON.stringify(licenses, null, 2))
console.log('done. Re-roll affected renders by deleting them from public/exercises/ and re-running the generator.')
