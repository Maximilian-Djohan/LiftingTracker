/*
 * Anatomy figure SVG — front + back views, clickable muscle regions.
 * Paths are hand-crafted bezier curves in a 130×370 local space.
 * The back figure shares the same paths shifted 150px to the right.
 */
function buildBodyFigure(activeMuscle) {
  const isLight = document.body.classList.contains("theme-light");

  const bodyFill   = isLight ? "#c8cdd8" : "#252b38";
  const bodyStroke = isLight ? "#a8b0bf" : "#353d50";
  const labelCol   = isLight ? "#7a8494" : "#6b7585";
  const accent     = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#4f8cff";

  // Each muscle region: slightly visible when inactive, bright accent when active
  function rFill(m)   { return activeMuscle === m ? accent : (isLight ? "rgba(100,120,160,0.18)" : "rgba(80,110,180,0.18)"); }
  function rStroke(m) { return activeMuscle === m ? accent : (isLight ? "rgba(100,120,160,0.45)" : "rgba(100,130,200,0.35)"); }
  function rW(m)      { return activeMuscle === m ? "1.2" : "0.8"; }
  function reg(m, d)  {
    return `<path d="${d}" fill="${rFill(m)}" stroke="${rStroke(m)}" stroke-width="${rW(m)}"
      stroke-linejoin="round" data-muscle="${m}" style="cursor:pointer;transition:fill .15s,stroke .15s;"/>`;
  }

  const sk = `fill="${bodyFill}" stroke="${bodyStroke}" stroke-width="1.2" stroke-linejoin="round"`;

  // ─────────────────────────────────────────────
  // FRONT FIGURE  (local coords, cx≈65, h≈365)
  // ─────────────────────────────────────────────
  const frontSilhouette = `
    <ellipse ${sk} cx="65" cy="20" rx="13" ry="16"/>
    <path ${sk} d="
      M 60,34
      C 50,38 36,46 18,62
      C 8,68 2,80 2,110
      C 0,135 2,162 5,188
      C 6,200 9,210 11,215
      C 13,213 15,207 16,200
      C 14,174 17,148 22,118
      C 30,88 36,74 37,70
      C 36,95 34,135 34,172
      C 32,190 29,207 26,222
      C 22,240 20,264 22,292
      C 22,318 20,338 18,356
      C 17,364 24,370 36,372
      C 46,374 55,371 58,366
      C 59,358 58,346 56,338
      C 54,314 54,290 57,268
      C 61,244 63,232 65,220
      C 67,232 69,244 73,268
      C 76,290 76,314 74,338
      C 72,346 71,358 72,366
      C 75,371 84,374 94,372
      C 106,370 113,364 112,356
      C 110,338 108,318 108,292
      C 110,264 108,240 104,222
      C 101,207 98,190 96,172
      C 96,135 94,95 93,70
      C 94,74 100,88 108,118
      C 113,148 116,174 114,200
      C 115,207 117,213 119,215
      C 121,210 124,200 125,188
      C 128,162 130,135 128,110
      C 128,80 122,68 112,62
      C 94,46 80,38 70,34
      Z
    "/>`;

  // Chest — two pec fan shapes
  const frontChest = `
    ${reg("Chest", "M 37,70 C 37,60 48,54 65,54 C 82,54 93,60 93,70 C 92,86 88,102 84,108 C 76,114 66,114 65,114 C 64,114 54,114 46,108 C 42,102 38,86 37,70 Z")}`;

  // Shoulders — rounded caps
  const frontShoulders = `
    ${reg("Shoulders", "M 18,62 C 6,66 1,78 1,96 C 1,110 8,120 20,124 C 28,127 36,122 37,112 C 38,100 33,80 37,70 C 30,64 24,60 18,62 Z")}
    ${reg("Shoulders", "M 112,62 C 124,66 129,78 129,96 C 129,110 122,120 110,124 C 102,127 94,122 93,112 C 92,100 97,80 93,70 C 100,64 106,60 112,62 Z")}`;

  // Biceps — front of upper arms
  const frontBiceps = `
    ${reg("Biceps", "M 22,118 C 16,130 14,148 16,164 C 18,172 24,176 30,174 C 36,172 38,164 38,154 C 38,140 36,122 37,112 C 32,112 26,114 22,118 Z")}
    ${reg("Biceps", "M 108,118 C 114,130 116,148 114,164 C 112,172 106,176 100,174 C 94,172 92,164 92,154 C 92,140 94,122 93,112 C 98,112 104,114 108,118 Z")}`;

  // Forearms
  const frontForearms = `
    ${reg("Forearms", "M 16,166 C 10,178 6,196 11,215 C 13,213 15,207 16,200 C 16,186 18,172 22,166 C 20,165 18,165 16,166 Z")}
    ${reg("Forearms", "M 114,166 C 120,178 124,196 119,215 C 117,213 115,207 114,200 C 114,186 112,172 108,166 C 110,165 112,165 114,166 Z")}`;

  // Abs — segmented core
  const frontCore = `
    ${reg("Core", "M 46,110 C 40,120 37,148 38,170 C 44,178 54,182 65,182 C 76,182 86,178 92,170 C 93,148 90,120 84,110 C 76,115 66,115 65,115 C 64,115 54,115 46,110 Z")}`;

  // Quads
  const frontQuads = `
    ${reg("Quads", "M 26,222 C 20,240 18,264 20,292 C 22,310 26,324 30,332 C 40,336 52,336 58,330 C 60,310 58,280 57,268 C 61,244 63,232 65,220 C 52,218 36,218 26,222 Z")}
    ${reg("Quads", "M 104,222 C 110,240 112,264 110,292 C 108,310 104,324 100,332 C 90,336 78,336 72,330 C 70,310 72,280 73,268 C 69,244 67,232 65,220 C 78,218 94,218 104,222 Z")}`;

  // Calves (front — tibialis)
  const frontCalves = `
    ${reg("Calves", "M 20,334 C 18,342 17,354 18,356 C 24,370 36,372 58,366 C 59,358 58,346 56,338 C 54,336 44,335 34,335 C 28,335 24,335 20,334 Z")}
    ${reg("Calves", "M 110,334 C 112,342 113,354 112,356 C 106,370 94,372 72,366 C 71,358 72,346 74,338 C 76,336 86,335 96,335 C 102,335 106,335 110,334 Z")}`;

  // ─────────────────────────────────────────────
  // BACK FIGURE  (same local coords, shifted +150)
  // ─────────────────────────────────────────────
  const backSilhouette = `
    <ellipse ${sk} cx="65" cy="20" rx="13" ry="16" transform="translate(150,0)"/>
    <path ${sk} transform="translate(150,0)" d="
      M 60,34
      C 50,38 36,46 18,62
      C 8,68 2,80 2,110
      C 0,135 2,162 5,188
      C 6,200 9,210 11,215
      C 13,213 15,207 16,200
      C 14,174 17,148 22,118
      C 30,88 36,74 37,70
      C 36,95 34,135 34,172
      C 32,190 29,207 26,222
      C 22,240 20,264 22,292
      C 22,318 20,338 18,356
      C 17,364 24,370 36,372
      C 46,374 55,371 58,366
      C 59,358 58,346 56,338
      C 54,314 54,290 57,268
      C 61,244 63,232 65,220
      C 67,232 69,244 73,268
      C 76,290 76,314 74,338
      C 72,346 71,358 72,366
      C 75,371 84,374 94,372
      C 106,370 113,364 112,356
      C 110,338 108,318 108,292
      C 110,264 108,240 104,222
      C 101,207 98,190 96,172
      C 96,135 94,95 93,70
      C 94,74 100,88 108,118
      C 113,148 116,174 114,200
      C 115,207 117,213 119,215
      C 121,210 124,200 125,188
      C 128,162 130,135 128,110
      C 128,80 122,68 112,62
      C 94,46 80,38 70,34
      Z
    "/>`;

  function regB(m, d) { // back region helper — applies translate
    return `<path d="${d}" fill="${rFill(m)}" stroke="${rStroke(m)}" stroke-width="${rW(m)}"
      stroke-linejoin="round" data-muscle="${m}" transform="translate(150,0)"
      style="cursor:pointer;transition:fill .15s,stroke .15s;"/>`;
  }

  // Back / Lats — traps upper + lats wide V
  const backBack = `
    ${regB("Back", "M 65,34 C 80,38 98,46 112,62 C 116,76 114,96 110,108 C 100,116 84,118 65,118 C 46,118 30,116 20,108 C 16,96 14,76 18,62 C 32,46 50,38 65,34 Z")}
    ${regB("Back", "M 37,70 C 34,95 34,135 34,172 C 38,184 48,192 65,194 C 82,192 92,184 96,172 C 96,135 96,95 93,70 C 84,78 75,82 65,82 C 55,82 46,78 37,70 Z")}`;

  // Rear Shoulders
  const backShoulders = `
    ${regB("Shoulders", "M 18,62 C 6,66 1,78 1,96 C 1,110 8,120 20,124 C 28,127 36,122 37,112 C 38,100 33,80 37,70 C 30,64 24,60 18,62 Z")}
    ${regB("Shoulders", "M 112,62 C 124,66 129,78 129,96 C 129,110 122,120 110,124 C 102,127 94,122 93,112 C 92,100 97,80 93,70 C 100,64 106,60 112,62 Z")}`;

  // Triceps — back of upper arms
  const backTriceps = `
    ${regB("Triceps", "M 22,118 C 16,130 14,148 16,164 C 18,172 24,176 30,174 C 36,172 38,164 38,154 C 38,140 36,122 37,112 C 32,112 26,114 22,118 Z")}
    ${regB("Triceps", "M 108,118 C 114,130 116,148 114,164 C 112,172 106,176 100,174 C 94,172 92,164 92,154 C 92,140 94,122 93,112 C 98,112 104,114 108,118 Z")}`;

  // Rear forearms
  const backForearms = `
    ${regB("Forearms", "M 16,166 C 10,178 6,196 11,215 C 13,213 15,207 16,200 C 16,186 18,172 22,166 C 20,165 18,165 16,166 Z")}
    ${regB("Forearms", "M 114,166 C 120,178 124,196 119,215 C 117,213 115,207 114,200 C 114,186 112,172 108,166 C 110,165 112,165 114,166 Z")}`;

  // Glutes
  const backGlutes = `
    ${regB("Glutes", "M 26,222 C 20,236 18,254 22,270 C 30,282 48,286 65,286 C 82,286 100,282 108,270 C 112,254 110,236 104,222 C 90,218 78,218 65,220 C 52,218 40,218 26,222 Z")}`;

  // Hamstrings
  const backHamstrings = `
    ${regB("Hamstrings", "M 22,272 C 20,290 20,314 22,334 C 28,337 40,338 56,336 C 58,318 57,292 57,268 C 46,270 34,272 22,272 Z")}
    ${regB("Hamstrings", "M 108,272 C 110,290 110,314 108,334 C 102,337 90,338 74,336 C 72,318 73,292 73,268 C 84,270 96,272 108,272 Z")}`;

  // Calves (back — gastrocnemius)
  const backCalves = `
    ${regB("Calves", "M 20,336 C 18,344 17,354 18,356 C 24,370 36,372 58,366 C 59,358 58,346 56,338 C 46,337 32,337 20,336 Z")}
    ${regB("Calves", "M 110,336 C 112,344 113,354 112,356 C 106,370 94,372 72,366 C 71,358 72,346 74,338 C 84,337 98,337 110,336 Z")}`;

  return `
  <svg viewBox="0 0 280 382" xmlns="http://www.w3.org/2000/svg"
       class="body-fig" style="width:100%;max-width:340px;display:block;margin:0 auto;">

    <!-- FRONT -->
    ${frontSilhouette}
    ${frontChest}
    ${frontShoulders}
    ${frontBiceps}
    ${frontForearms}
    ${frontCore}
    ${frontQuads}
    ${frontCalves}
    <text x="65" y="382" text-anchor="middle" font-size="9" fill="${labelCol}"
          font-family="-apple-system,sans-serif" font-weight="600">FRONT</text>

    <!-- BACK -->
    ${backSilhouette}
    ${backBack}
    ${backShoulders}
    ${backTriceps}
    ${backForearms}
    ${backGlutes}
    ${backHamstrings}
    ${backCalves}
    <text x="215" y="382" text-anchor="middle" font-size="9" fill="${labelCol}"
          font-family="-apple-system,sans-serif" font-weight="600">BACK</text>

  </svg>`;
}
