// Generates anatomical-render exercise images with Gemini, using the
// free-exercise-db photos in image-refs/ as pose references.
// Output: public/exercises/<id>.png, one image per exercise with a single
// figure in one position of the movement.
//
// Setup: create an API key at https://aistudio.google.com/apikey
// Run:   GEMINI_API_KEY=... node scripts/generate-exercise-images.mjs
// Trial: GEMINI_API_KEY=... LIMIT=3 node scripts/generate-exercise-images.mjs
// One exercise: ... ONLY=bench-press node scripts/generate-exercise-images.mjs
//
// Idempotent: skips images that already exist in public/exercises/.
// Delete a bad image and re-run to re-roll it.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const KEY = process.env.GEMINI_API_KEY
const MODEL = 'gemini-2.5-flash-image'
const OUT_DIR = 'public/exercises'
const REF_DIR = 'image-refs'
const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity
const ONLY = process.env.ONLY
// Optional but recommended: one approved render used as the style anchor for
// the whole set. Generate a first image you like, save it as style-ref.png.
const STYLE_REF = process.env.STYLE_REF ?? 'style-ref.png'

if (!KEY) {
  console.error('Set GEMINI_API_KEY first (create one at https://aistudio.google.com/apikey).')
  process.exit(1)
}

// Pose descriptions for exercises with no photo reference
const POSITION_HINTS = {
  'keenan-flaps-frontal':
    'lying chest-down on an incline bench, arms hanging with light dumbbells, sweeping the arms out to the sides in the frontal plane to work the upper back',
  'keenan-flaps-sagittal':
    'lying chest-down on an incline bench, arms hanging with light dumbbells, sweeping the arms forward and back in the sagittal plane to work the upper back',
  'bayesian-curl':
    'standing facing away from a low cable pulley, arm extended behind the body holding the cable handle, curling the forearm up while the upper arm stays behind the torso',
  'recline-curl':
    'reclining on a bench set at a low incline, arms hanging straight down holding dumbbells, curling the weights up',
  'behind-the-back-curl':
    'standing with a low cable pulley behind the body, arm slightly behind the torso, curling the handle upward',
  'landmine-squat':
    'standing holding the end of a landmine barbell at the chest with both hands, squatting down while the barbell pivots',
}

const src = await readFile('src/data/exercises.ts', 'utf8')
const exercises = [...src.matchAll(/id: '([^']+)', name: '([^']+)', category: '([^']+)', muscleGroups: \[([^\]]*)\]/g)].map(
  m => ({
    id: m[1],
    name: m[2],
    muscles: [...m[4].matchAll(/'([^']+)'/g)].map(x => x[1]),
  })
)

await mkdir(OUT_DIR, { recursive: true })

const STYLE_SPEC = `STYLE SPECIFICATION (follow every rule exactly; identical for every image in the set):

FIGURE
- Exactly one male figure rendered as a smooth, matte, light-gray 3D mannequin, like a sculpted statue.
- Muscle groups appear ONLY as smooth surface contours: clearly shaped but completely smooth. NO fiber striations, NO tendons, NO veins, NO skinned-anatomy or exposed-flesh look, NO skin texture or pores.
- Soft gray ambient-occlusion shading defines the muscle shapes.
- The head is a completely blank, smooth mannequin head: NO eyes, NO nose, NO mouth, NO ears, NO hair, NO face at all. It only follows the natural gaze direction of the movement.
- Bare feet and bare hands. No shoes, socks, shirt, gloves, belt, straps, or wristbands.

CLOTHING
- The figure is shirtless: bare torso, bare chest, bare arms. NO shirt, NO tank top, NO vest.
- The ONLY clothing is a pair of fitted plain dark charcoal, almost black, compression shorts ending mid-thigh.

COLOR
- The entire image is strictly grayscale. No red highlights, no colored muscles, no color anywhere.

EQUIPMENT
- Show only the equipment this exercise requires, nothing extra: no storage racks, no spare plates, no extra machines in the scene.
- If the exercise uses a machine, render THAT machine. Never substitute or add a squat rack, bench-press rack, barbell, or bench that the exercise does not use.
- Metal frames: pale desaturated gray-white with soft shading. Upholstery and pads: dark charcoal gray. Weight plates and collars: dark charcoal. Bar shafts: mid-gray steel.

BACKGROUND
- Bright pure white (#ffffff), not gray, and completely empty: no floor line, no wall, no horizon, no gym environment, no props, no other people.
- The white fills the ENTIRE canvas edge to edge: no gray bars, bands, borders, letterboxing, or vignette anywhere.
- Only very soft light-gray contact shadows directly beneath the figure and equipment.

LIGHTING AND CAMERA
- Soft, even studio ambient light. Gentle shading, no harsh highlights, no color cast.
- Slightly elevated three-quarter camera view. The whole figure and equipment fit inside the frame with a small white margin.

FORBIDDEN
- No text, numbers, labels, arrows, logos, watermarks, borders, UI elements, or photorealistic skin. Not cartoon style.`

function prompt(ex, refCount, hasStyle) {
  if (refCount > 0) {
    return (
      `Transform the LAST attached photograph into a stylized 3D illustration for the exercise "${ex.name}".\n` +
      `Preserve from the photo EXACTLY: the body position, grip, limb angles, the equipment and its shape ` +
      `and proportions, and the camera angle. Do not invent, add, or remove equipment.\n` +
      `Apply ONLY these style changes:\n` +
      `- Replace the person with the mannequin figure described in the style specification below.\n` +
      `- Recolor the equipment as described below, keeping its exact shape from the photo.\n` +
      `- Replace the background with pure white as described below.\n` +
      (hasStyle
        ? `The FIRST attached image shows the rendering style only: copy its materials, colors, lighting, and background treatment. Do NOT copy its exercise, pose, or any of its equipment into this image.\n`
        : '') +
      `\n${STYLE_SPEC}`
    )
  }
  return (
    `${STYLE_SPEC}\n\nTASK\n- Exercise: "${ex.name}", shown as a single figure in one position of the movement. ` +
    `Position: ${
      POSITION_HINTS[ex.id] ??
      'standard textbook form for this exercise, mid-repetition, with the appropriate equipment'
    }.` +
    (hasStyle
      ? '\n- The attached image shows the rendering style only: copy its materials, colors, lighting, and background treatment. Do NOT copy its exercise, pose, or any of its equipment into this image.'
      : '')
  )
}

async function generate(text, refs, refMime, styleB64, attempt = 1) {
  const parts = [{ text }]
  if (styleB64) parts.push({ inline_data: { mime_type: 'image/png', data: styleB64 } })
  for (const refB64 of refs) parts.push({ inline_data: { mime_type: refMime, data: refB64 } })
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: { 'x-goog-api-key': KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
    }
  )
  if (res.status === 429 || res.status >= 500) {
    const detail = await res.text().catch(() => '')
    if (attempt === 1) console.log(`  ${res.status} detail: ${detail.replace(/\s+/g, ' ').slice(0, 400)}`)
    if (/limit: 0|free_tier|FreeTier/i.test(detail)) {
      throw new Error(
        'quota is zero: this API key has no image-generation quota. Enable billing for the project at https://aistudio.google.com (Settings > Plan) and retry.'
      )
    }
    if (attempt > 4) throw new Error(`giving up after ${attempt} attempts: ${res.status}`)
    const wait = attempt * 15000
    console.log(`  ${res.status}, retrying in ${wait / 1000}s...`)
    await new Promise(r => setTimeout(r, wait))
    return generate(text, refs, refMime, styleB64, attempt + 1)
  }
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  const imgPart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData ?? p.inline_data)
  if (!imgPart) {
    const finish = data.candidates?.[0]?.finishReason
    throw new Error(`no image in response (finishReason: ${finish})`)
  }
  const inline = imgPart.inlineData ?? imgPart.inline_data
  return Buffer.from(inline.data, 'base64')
}

const styleB64 = existsSync(STYLE_REF) ? (await readFile(STYLE_REF)).toString('base64') : null
console.log(styleB64 ? `using style anchor: ${STYLE_REF}` : 'no style anchor yet (style-ref.png); relying on the text prompt')

let done = 0
let failed = 0
for (const ex of exercises) {
  if (ONLY && ex.id !== ONLY) continue
  if (done >= LIMIT) break
  const out = path.join(OUT_DIR, `${ex.id}.png`)
  if (existsSync(out)) continue
  // one pose only: prefer the start-position image, fall back to the end one
  const refs = []
  let refMime = 'image/jpeg'
  outer: for (const phase of [0, 1]) {
    for (const ext of ['jpg', 'png']) {
      const refPath = path.join(REF_DIR, `${ex.id}-${phase}.${ext}`)
      if (existsSync(refPath)) {
        refs.push((await readFile(refPath)).toString('base64'))
        refMime = ext === 'png' ? 'image/png' : 'image/jpeg'
        break outer
      }
    }
  }
  try {
    const img = await generate(prompt(ex, refs.length, !!styleB64), refs, refMime, styleB64)
    await writeFile(out, img)
    console.log(`ok  ${ex.id}${refs.length === 0 ? ' (text only)' : ''}`)
    done++
  } catch (err) {
    failed++
    console.error(`ERR ${ex.id}: ${err.message}`)
  }
  await new Promise(r => setTimeout(r, 1500))
}

console.log(`\ndone: ${done} exercises processed, ${failed} failures`)
console.log('Review public/exercises/, delete any bad renders, and re-run to re-roll them.')
