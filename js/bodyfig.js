/*
 * Anatomy figure — styled to match a clean flat vector anatomy illustration.
 * Front + back views. Each figure is 140px wide in a 290×385 viewBox.
 * Includes body silhouette, muscle definition lines, and clickable regions.
 */
function buildBodyFigure(activeMuscle) {
  const isLight = document.body.classList.contains("theme-light");

  const bodyFill   = isLight ? "#cdd2db" : "#28303f";
  const bodyStroke = isLight ? "#a8b2c0" : "#38435a";
  const defLine    = isLight ? "rgba(80,95,120,0.35)"  : "rgba(180,200,240,0.22)"; // muscle def lines
  const labelCol   = isLight ? "#7a8494" : "#6b7585";
  const accent     = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#4f8cff";

  // Inactive region: subtle tinted overlay; active: solid accent
  function rFill(m)   { return activeMuscle === m ? accent : (isLight ? "rgba(90,110,150,0.15)" : "rgba(100,130,200,0.14)"); }
  function rStroke(m) { return activeMuscle === m ? accent : (isLight ? "rgba(90,110,150,0.5)"  : "rgba(120,150,220,0.4)"); }
  function rW(m)      { return activeMuscle === m ? "1.4" : "0.9"; }

  // Clickable region — front figure
  function reg(m, d) {
    return `<path d="${d}" fill="${rFill(m)}" stroke="${rStroke(m)}" stroke-width="${rW(m)}"
      stroke-linejoin="round" data-muscle="${m}"
      style="cursor:pointer;transition:fill .15s,stroke .15s;"/>`;
  }
  // Clickable region — back figure (shifted 150px right)
  function regB(m, d) {
    return `<path d="${d}" fill="${rFill(m)}" stroke="${rStroke(m)}" stroke-width="${rW(m)}"
      stroke-linejoin="round" data-muscle="${m}" transform="translate(150,0)"
      style="cursor:pointer;transition:fill .15s,stroke .15s;"/>`;
  }
  // Decorative line
  function dl(d) { return `<path d="${d}" fill="none" stroke="${defLine}" stroke-width="0.9" stroke-linecap="round"/>`; }
  function dlB(d){ return `<path d="${d}" fill="none" stroke="${defLine}" stroke-width="0.9" stroke-linecap="round" transform="translate(150,0)"/>`; }

  const sk = `fill="${bodyFill}" stroke="${bodyStroke}" stroke-width="1.3" stroke-linejoin="round"`;

  // ─── FRONT SILHOUETTE ───────────────────────────────────────
  const frontBody = `
    <ellipse ${sk} cx="70" cy="20" rx="12.5" ry="15.5"/>
    <path ${sk} d="
      M 64,34
      C 52,38 36,48 16,63
      C 5,70 0,85 0,115
      C -1,142 3,168 7,192
      C 8,203 11,212 13,216
      C 15,213 17,207 18,199
      C 17,174 21,148 27,120
      C 34,93 39,77 40,74
      C 39,92 37,132 37,167
      C 35,184 30,200 27,220
      C 23,240 21,264 23,292
      C 23,317 21,338 19,356
      C 18,364 24,370 36,372
      C 46,374 55,371 59,365
      C 61,358 60,347 58,337
      C 56,312 56,288 59,266
      C 63,243 66,231 70,220
      C 74,231 77,243 81,266
      C 84,288 84,312 82,337
      C 80,347 79,358 81,365
      C 85,371 94,374 104,372
      C 116,370 122,364 121,356
      C 119,338 117,317 117,292
      C 119,264 117,240 113,220
      C 110,200 105,184 103,167
      C 103,132 101,92 100,74
      C 101,77 106,93 113,120
      C 119,148 123,174 122,199
      C 123,207 125,213 127,216
      C 129,212 132,203 133,192
      C 137,168 141,142 140,115
      C 140,85 135,70 124,63
      C 104,48 88,38 76,34
      Z
    "/>`;

  // ─── FRONT MUSCLE REGIONS ───────────────────────────────────
  const fChest = `
    ${reg("Chest","M 40,74 C 38,63 48,56 64,54 C 70,53 70,56 70,58 L 70,116 C 60,119 47,116 42,110 C 38,102 38,86 40,74 Z")}
    ${reg("Chest","M 100,74 C 102,63 92,56 76,54 C 70,53 70,56 70,58 L 70,116 C 80,119 93,116 98,110 C 102,102 102,86 100,74 Z")}`;

  const fShoulders = `
    ${reg("Shoulders","M 16,63 C 3,69 -1,86 0,108 C 1,122 8,132 20,135 C 30,138 38,132 40,120 C 41,108 37,88 40,74 C 32,67 24,62 16,63 Z")}
    ${reg("Shoulders","M 124,63 C 137,69 141,86 140,108 C 139,122 132,132 120,135 C 110,138 102,132 100,120 C 99,108 103,88 100,74 C 108,67 116,62 124,63 Z")}`;

  const fBiceps = `
    ${reg("Biceps","M 27,120 C 20,132 16,152 18,170 C 20,180 26,185 33,183 C 39,181 41,172 41,160 C 41,144 39,126 40,120 C 35,118 31,118 27,120 Z")}
    ${reg("Biceps","M 113,120 C 120,132 124,152 122,170 C 120,180 114,185 107,183 C 101,181 99,172 99,160 C 99,144 101,126 100,120 C 105,118 109,118 113,120 Z")}`;

  const fForearms = `
    ${reg("Forearms","M 18,172 C 11,186 6,202 13,216 C 15,213 17,207 18,199 C 18,186 21,174 26,170 C 23,170 20,170 18,172 Z")}
    ${reg("Forearms","M 122,172 C 129,186 134,202 127,216 C 125,213 123,207 122,199 C 122,186 119,174 114,170 C 117,170 120,170 122,172 Z")}`;

  const fCore = `
    ${reg("Core","M 43,117 C 39,136 37,158 38,180 C 44,188 56,193 70,193 C 84,193 96,188 102,180 C 103,158 101,136 97,117 C 88,120 79,122 70,122 C 61,122 52,120 43,117 Z")}`;

  const fQuads = `
    ${reg("Quads","M 27,220 C 21,240 19,264 21,292 C 23,308 27,322 31,334 C 41,338 53,337 59,331 C 61,312 59,284 59,266 C 63,243 66,231 70,220 C 55,217 39,217 27,220 Z")}
    ${reg("Quads","M 113,220 C 119,240 121,264 119,292 C 117,308 113,322 109,334 C 99,338 87,337 81,331 C 79,312 81,284 81,266 C 77,243 74,231 70,220 C 85,217 101,217 113,220 Z")}`;

  const fCalves = `
    ${reg("Calves","M 21,336 C 19,344 18,354 19,356 C 24,370 36,372 59,365 C 61,358 60,347 58,337 C 48,336 34,335 21,336 Z")}
    ${reg("Calves","M 119,336 C 121,344 122,354 121,356 C 116,370 104,372 81,365 C 79,358 80,347 82,337 C 92,336 106,335 119,336 Z")}`;

  // ─── FRONT DEFINITION LINES ─────────────────────────────────
  const frontLines = `
    ${dl("M 70,54 L 70,120")}
    ${dl("M 70,122 L 70,194")}
    ${dl("M 42,140 C 55,143 70,143 C 85,143 98,140")}
    ${dl("M 41,160 C 54,163 70,163 C 86,163 99,160")}
    ${dl("M 41,180 C 54,183 70,183 C 86,183 99,180")}
    ${dl("M 39,120 C 36,128 32,142 30,158")}
    ${dl("M 101,120 C 104,128 108,142 110,158")}
    ${dl("M 18,170 C 20,178 22,186 23,194")}
    ${dl("M 122,170 C 120,178 118,186 117,194")}
    ${dl("M 60,332 C 58,322 57,306 57,288")}
    ${dl("M 80,332 C 82,322 83,306 83,288")}
    ${dl("M 44,286 C 50,292 58,295 59,302")}
    ${dl("M 96,286 C 90,292 82,295 81,302")}
  `;

  // ─── BACK SILHOUETTE ────────────────────────────────────────
  const backBody = `
    <ellipse ${sk} cx="70" cy="20" rx="12.5" ry="15.5" transform="translate(150,0)"/>
    <path ${sk} transform="translate(150,0)" d="
      M 64,34
      C 52,38 36,48 16,63
      C 5,70 0,85 0,115
      C -1,142 3,168 7,192
      C 8,203 11,212 13,216
      C 15,213 17,207 18,199
      C 17,174 21,148 27,120
      C 34,93 39,77 40,74
      C 39,92 37,132 37,167
      C 35,184 30,200 27,220
      C 23,240 21,264 23,292
      C 23,317 21,338 19,356
      C 18,364 24,370 36,372
      C 46,374 55,371 59,365
      C 61,358 60,347 58,337
      C 56,312 56,288 59,266
      C 63,243 66,231 70,220
      C 74,231 77,243 81,266
      C 84,288 84,312 82,337
      C 80,347 79,358 81,365
      C 85,371 94,374 104,372
      C 116,370 122,364 121,356
      C 119,338 117,317 117,292
      C 119,264 117,240 113,220
      C 110,200 105,184 103,167
      C 103,132 101,92 100,74
      C 101,77 106,93 113,120
      C 119,148 123,174 122,199
      C 123,207 125,213 127,216
      C 129,212 132,203 133,192
      C 137,168 141,142 140,115
      C 140,85 135,70 124,63
      C 104,48 88,38 76,34
      Z
    "/>`;

  // ─── BACK MUSCLE REGIONS ────────────────────────────────────
  // Traps (upper diamond) + Lats
  const bBack = `
    ${regB("Back","M 70,34 C 88,40 108,50 124,63 C 130,76 130,94 124,110 C 114,118 100,120 100,120 C 101,92 101,77 100,74 C 108,67 116,62 124,63 C 88,40 70,34 70,34 Z")}
    ${regB("Back","M 70,34 C 52,40 32,50 16,63 C 10,76 10,94 16,110 C 26,118 40,120 40,120 C 39,92 39,77 40,74 C 32,67 24,62 16,63 C 52,40 70,34 70,34 Z")}
    ${regB("Back","M 40,74 C 38,92 37,132 37,167 C 39,180 48,188 70,190 C 92,188 101,180 103,167 C 103,132 102,92 100,74 C 90,80 80,84 70,84 C 60,84 50,80 40,74 Z")}`;

  const bShoulders = `
    ${regB("Shoulders","M 16,63 C 3,69 -1,86 0,108 C 1,122 8,132 20,135 C 30,138 38,132 40,120 C 41,108 37,88 40,74 C 32,67 24,62 16,63 Z")}
    ${regB("Shoulders","M 124,63 C 137,69 141,86 140,108 C 139,122 132,132 120,135 C 110,138 102,132 100,120 C 99,108 103,88 100,74 C 108,67 116,62 124,63 Z")}`;

  const bTriceps = `
    ${regB("Triceps","M 27,120 C 19,134 15,154 17,172 C 19,182 25,187 32,185 C 38,183 40,174 40,160 C 40,144 40,126 40,120 C 35,118 31,118 27,120 Z")}
    ${regB("Triceps","M 113,120 C 121,134 125,154 123,172 C 121,182 115,187 108,185 C 102,183 100,174 100,160 C 100,144 100,126 100,120 C 105,118 109,118 113,120 Z")}`;

  const bForearms = `
    ${regB("Forearms","M 18,172 C 11,186 6,202 13,216 C 15,213 17,207 18,199 C 18,186 21,174 26,170 C 23,170 20,170 18,172 Z")}
    ${regB("Forearms","M 122,172 C 129,186 134,202 127,216 C 125,213 123,207 122,199 C 122,186 119,174 114,170 C 117,170 120,170 122,172 Z")}`;

  const bGlutes = `
    ${regB("Glutes","M 27,220 C 21,236 19,256 23,272 C 27,284 40,292 56,293 C 64,293 70,291 70,285 C 70,263 68,240 66,227 C 58,220 42,217 27,220 Z")}
    ${regB("Glutes","M 113,220 C 119,236 121,256 117,272 C 113,284 100,292 84,293 C 76,293 70,291 70,285 C 70,263 72,240 74,227 C 82,220 98,217 113,220 Z")}`;

  const bHamstrings = `
    ${regB("Hamstrings","M 23,274 C 19,292 19,316 21,336 C 27,338 38,337 58,337 C 58,318 57,290 59,266 C 44,265 30,268 23,274 Z")}
    ${regB("Hamstrings","M 117,274 C 121,292 121,316 119,336 C 113,338 102,337 82,337 C 82,318 83,290 81,266 C 96,265 110,268 117,274 Z")}`;

  const bCalves = `
    ${regB("Calves","M 21,338 C 19,346 18,354 19,356 C 24,370 36,372 59,365 C 61,358 60,347 58,337 C 46,337 32,337 21,338 Z")}
    ${regB("Calves","M 119,338 C 121,346 122,354 121,356 C 116,370 104,372 81,365 C 79,358 80,347 82,337 C 94,337 108,337 119,338 Z")}`;

  // ─── BACK DEFINITION LINES ──────────────────────────────────
  const backLines = `
    ${dlB("M 70,34 L 70,195")}
    ${dlB("M 70,84 C 60,80 50,78 40,74")}
    ${dlB("M 70,84 C 80,80 90,78 100,74")}
    ${dlB("M 40,120 C 52,116 62,115 70,116 C 78,115 88,116 100,120")}
    ${dlB("M 70,190 C 60,186 50,180 40,168")}
    ${dlB("M 70,190 C 80,186 90,180 100,168")}
    ${dlB("M 56,292 C 60,282 66,270 70,262")}
    ${dlB("M 84,292 C 80,282 74,270 70,262")}
    ${dlB("M 44,270 C 48,280 56,288 58,298")}
    ${dlB("M 96,270 C 92,280 84,288 82,298")}
    ${dlB("M 38,120 C 36,130 33,145 31,162")}
    ${dlB("M 102,120 C 104,130 107,145 109,162")}
  `;

  return `
  <svg viewBox="-2 0 292 388" xmlns="http://www.w3.org/2000/svg"
       class="body-fig" style="width:100%;max-width:340px;display:block;margin:0 auto;">

    <!-- FRONT -->
    ${frontBody}
    ${fChest}
    ${fShoulders}
    ${fBiceps}
    ${fForearms}
    ${fCore}
    ${fQuads}
    ${fCalves}
    ${frontLines}
    <text x="70" y="386" text-anchor="middle" font-size="9" fill="${labelCol}"
          font-family="-apple-system,sans-serif" font-weight="600" letter-spacing="1">FRONT</text>

    <!-- BACK -->
    ${backBody}
    ${bBack}
    ${bShoulders}
    ${bTriceps}
    ${bForearms}
    ${bGlutes}
    ${bHamstrings}
    ${bCalves}
    ${backLines}
    <text x="220" y="386" text-anchor="middle" font-size="9" fill="${labelCol}"
          font-family="-apple-system,sans-serif" font-weight="600" letter-spacing="1">BACK</text>

  </svg>`;
}
