/*
 * Generates an SVG anatomy figure for muscle group selection.
 * Two views side-by-side: front (left) and back (right).
 * Each region is clickable and highlights when active.
 */
function buildBodyFigure(activeMuscle) {
  const accent   = "#4f8cff";
  const base     = "#2a2f3a";
  const bodyFill = "#1f232c";
  const bodyLine = "#3a4052";
  const textCol  = "#9aa3b2";

  // Returns fill/stroke for a region based on whether it matches the active muscle.
  function regionStyle(muscle) {
    const active = activeMuscle === muscle;
    return `fill="${active ? accent : base}" stroke="${active ? accent : bodyLine}"
            stroke-width="1" style="cursor:pointer;transition:fill .15s;" opacity="${active ? 1 : 0.85}"`;
  }

  // Body skin/outline fill
  const skin = `fill="${bodyFill}" stroke="${bodyLine}" stroke-width="1.2"`;

  /*
   * Each figure is drawn in a 130×365 local space.
   * Front = offset x=0, back = offset x=150.
   * Human proportions (head ~20px r, total height ~350px).
   */

  function fig(ox) { // ox = x offset
    const cx = ox + 65; // center x of figure
    return `<g transform="translate(${ox},0)">`;
  }

  // ---------- FRONT FIGURE (ox=0, cx=65) ----------
  const front = `
  <!-- body silhouette outlines (non-interactive) -->
  <ellipse ${skin} cx="65" cy="22" rx="16" ry="19"/>
  <rect    ${skin} x="60" y="39" width="10" height="12" rx="3"/>

  <!-- arms outline -->
  <path ${skin} d="M14,68 Q6,90 8,152 Q16,160 28,153 Q36,95 34,68 Z"/>
  <path ${skin} d="M116,68 Q124,90 122,152 Q114,160 102,153 Q94,95 96,68 Z"/>
  <!-- forearms outline -->
  <path ${skin} d="M8,152 Q4,188 7,220 Q16,226 27,220 Q32,188 28,153 Z"/>
  <path ${skin} d="M122,152 Q126,188 123,220 Q114,226 103,220 Q98,188 102,153 Z"/>

  <!-- torso outline -->
  <path ${skin} d="M32,54 Q22,60 16,72 L16,148 Q28,155 38,150 L38,236 L92,236 L92,150 Q102,155 114,148 L114,72 Q108,60 98,54 Q83,50 65,50 Q47,50 32,54 Z"/>

  <!-- legs outline -->
  <path ${skin} d="M38,236 Q33,268 34,310 Q43,318 54,312 Q62,270 65,236 Z"/>
  <path ${skin} d="M92,236 Q97,268 96,310 Q87,318 76,312 Q68,270 65,236 Z"/>
  <path ${skin} d="M34,310 Q31,338 34,362 Q42,368 52,363 Q56,338 54,312 Z"/>
  <path ${skin} d="M96,310 Q99,338 96,362 Q88,368 78,363 Q74,338 76,312 Z"/>

  <!-- feet -->
  <ellipse ${skin} cx="44" cy="367" rx="12" ry="5"/>
  <ellipse ${skin} cx="86" cy="367" rx="12" ry="5"/>

  <!-- ===== CLICKABLE MUSCLE REGIONS ===== -->

  <!-- Chest (two pecs) -->
  <path ${regionStyle("Chest")} data-muscle="Chest"
    d="M38,60 Q38,54 52,52 L65,55 L65,108 Q42,110 38,98 Z"/>
  <path ${regionStyle("Chest")} data-muscle="Chest"
    d="M92,60 Q92,54 78,52 L65,55 L65,108 Q88,110 92,98 Z"/>

  <!-- Shoulders (front delts) -->
  <ellipse ${regionStyle("Shoulders")} data-muscle="Shoulders" cx="22" cy="74" rx="14" ry="18"/>
  <ellipse ${regionStyle("Shoulders")} data-muscle="Shoulders" cx="108" cy="74" rx="14" ry="18"/>

  <!-- Biceps -->
  <path ${regionStyle("Biceps")} data-muscle="Biceps"
    d="M10,88 Q6,108 8,148 Q16,156 28,149 Q34,108 30,88 Z"/>
  <path ${regionStyle("Biceps")} data-muscle="Biceps"
    d="M120,88 Q124,108 122,148 Q114,156 102,149 Q96,108 100,88 Z"/>

  <!-- Core -->
  <path ${regionStyle("Core")} data-muscle="Core"
    d="M40,108 L90,108 Q92,148 90,186 Q78,192 65,192 Q52,192 40,186 Q38,148 40,108 Z"/>

  <!-- Quads -->
  <path ${regionStyle("Quads")} data-muscle="Quads"
    d="M40,200 Q35,242 36,304 Q46,312 55,306 Q62,264 65,200 Z"/>
  <path ${regionStyle("Quads")} data-muscle="Quads"
    d="M90,200 Q95,242 94,304 Q84,312 75,306 Q68,264 65,200 Z"/>

  <!-- Calves (front shin area) -->
  <path ${regionStyle("Calves")} data-muscle="Calves"
    d="M36,308 Q32,336 35,360 Q43,366 52,361 Q56,336 55,308 Z"/>
  <path ${regionStyle("Calves")} data-muscle="Calves"
    d="M94,308 Q98,336 95,360 Q87,366 78,361 Q74,336 75,308 Z"/>

  <!-- Labels -->
  <text x="65" y="14" text-anchor="middle" font-size="8" fill="${textCol}" font-family="sans-serif">FRONT</text>
  `;

  // ---------- BACK FIGURE (ox=150, cx=215) ----------
  const back = `
  <!-- body silhouette outlines -->
  <ellipse ${skin} cx="215" cy="22" rx="16" ry="19"/>
  <rect    ${skin} x="210" y="39" width="10" height="12" rx="3"/>

  <path ${skin} d="M164,68 Q156,90 158,152 Q166,160 178,153 Q186,95 184,68 Z"/>
  <path ${skin} d="M266,68 Q274,90 272,152 Q264,160 252,153 Q244,95 246,68 Z"/>
  <path ${skin} d="M158,152 Q154,188 157,220 Q166,226 177,220 Q182,188 178,153 Z"/>
  <path ${skin} d="M272,152 Q276,188 273,220 Q264,226 253,220 Q248,188 252,153 Z"/>

  <path ${skin} d="M182,54 Q172,60 166,72 L166,148 Q178,155 188,150 L188,236 L242,236 L242,150 Q252,155 264,148 L264,72 Q258,60 248,54 Q233,50 215,50 Q197,50 182,54 Z"/>

  <path ${skin} d="M188,236 Q183,268 184,310 Q193,318 204,312 Q212,270 215,236 Z"/>
  <path ${skin} d="M242,236 Q247,268 246,310 Q237,318 226,312 Q218,270 215,236 Z"/>
  <path ${skin} d="M184,310 Q181,338 184,362 Q192,368 202,363 Q206,338 204,312 Z"/>
  <path ${skin} d="M246,310 Q249,338 246,362 Q238,368 228,363 Q224,338 226,312 Z"/>

  <ellipse ${skin} cx="194" cy="367" rx="12" ry="5"/>
  <ellipse ${skin} cx="236" cy="367" rx="12" ry="5"/>

  <!-- ===== CLICKABLE MUSCLE REGIONS (back) ===== -->

  <!-- Back / Lats + Traps -->
  <path ${regionStyle("Back")} data-muscle="Back"
    d="M184,56 Q172,62 168,78 L168,182 Q182,188 188,184 L192,192 L238,192 L242,184 Q248,188 262,182 L262,78 Q258,62 246,56 Q232,52 215,52 Q198,52 184,56 Z"/>

  <!-- Rear Delts / Shoulders -->
  <ellipse ${regionStyle("Shoulders")} data-muscle="Shoulders" cx="172" cy="74" rx="14" ry="18"/>
  <ellipse ${regionStyle("Shoulders")} data-muscle="Shoulders" cx="258" cy="74" rx="14" ry="18"/>

  <!-- Triceps -->
  <path ${regionStyle("Triceps")} data-muscle="Triceps"
    d="M160,88 Q156,108 158,148 Q166,156 178,149 Q184,108 180,88 Z"/>
  <path ${regionStyle("Triceps")} data-muscle="Triceps"
    d="M270,88 Q274,108 272,148 Q264,156 252,149 Q246,108 250,88 Z"/>

  <!-- Glutes -->
  <path ${regionStyle("Glutes")} data-muscle="Glutes"
    d="M188,196 Q183,216 184,248 Q196,256 215,256 Q234,256 246,248 Q247,216 242,196 Z"/>

  <!-- Hamstrings -->
  <path ${regionStyle("Hamstrings")} data-muscle="Hamstrings"
    d="M184,250 Q180,278 182,308 Q192,316 203,310 Q210,278 215,250 Z"/>
  <path ${regionStyle("Hamstrings")} data-muscle="Hamstrings"
    d="M246,250 Q250,278 248,308 Q238,316 227,310 Q220,278 215,250 Z"/>

  <!-- Calves (back) -->
  <path ${regionStyle("Calves")} data-muscle="Calves"
    d="M184,310 Q180,338 183,360 Q191,366 201,361 Q205,336 203,312 Z"/>
  <path ${regionStyle("Calves")} data-muscle="Calves"
    d="M246,310 Q250,338 247,360 Q239,366 229,361 Q225,336 227,312 Z"/>

  <text x="215" y="14" text-anchor="middle" font-size="8" fill="${textCol}" font-family="sans-serif">BACK</text>
  `;

  return `
  <svg viewBox="0 0 280 378" xmlns="http://www.w3.org/2000/svg"
       class="body-fig" style="width:100%;max-width:320px;display:block;margin:0 auto;">
    <g id="bodyFront">${front}</g>
    <g id="bodyBack">${back}</g>
  </svg>`;
}
