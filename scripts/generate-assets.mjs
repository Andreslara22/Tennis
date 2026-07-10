#!/usr/bin/env node
/**
 * Generador de recursos de marca de AceCoach 🎾
 *
 * Genera desde SVG (sin depender de herramientas externas):
 *  - Iconos de launcher Android (legacy + round + adaptive foreground)
 *  - Splash screens (portrait/landscape, todas las densidades)
 *  - Recursos para la ficha de Google Play (icono 512 y feature graphic 1024×500)
 *
 * Uso:  node scripts/generate-assets.mjs
 */
import sharp from 'sharp'
import { mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const RES = join(ROOT, 'android/app/src/main/res')
const STORE = join(ROOT, 'store-assets')

const BG = '#0f1720'
const BG2 = '#17212b'
const LIME = '#d7f24a'
const LIME_DIM = '#a9c020'
const GRAY = '#9fb0bd'

/** Pelota de tenis con costuras, centrada en (cx,cy) con radio r. */
function ball(cx, cy, r, seamW = r * 0.07) {
  const k = r * 1.45 // curvatura de las costuras
  return `
  <defs>
    <radialGradient id="ballGrad" cx="0.35" cy="0.3" r="1">
      <stop offset="0%" stop-color="#e8fb7a"/>
      <stop offset="55%" stop-color="${LIME}"/>
      <stop offset="100%" stop-color="${LIME_DIM}"/>
    </radialGradient>
    <clipPath id="ballClip"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>
  </defs>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#ballGrad)"/>
  <g clip-path="url(#ballClip)" stroke="${BG}" stroke-width="${seamW}" fill="none" stroke-linecap="round">
    <path d="M ${cx - r * 1.15} ${cy - r * 0.05} A ${k} ${k} 0 0 0 ${cx - r * 0.05} ${cy - r * 1.15}"/>
    <path d="M ${cx + r * 0.05} ${cy + r * 1.15} A ${k} ${k} 0 0 1 ${cx + r * 1.15} ${cy + r * 0.05}"/>
  </g>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${BG}" stroke-width="${seamW * 0.5}" opacity="0.35"/>`
}

const svgIconSquare = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BG2}"/><stop offset="100%" stop-color="${BG}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  ${ball(512, 512, 360)}
</svg>`

const svgIconRound = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BG2}"/><stop offset="100%" stop-color="${BG}"/>
    </linearGradient>
  </defs>
  <circle cx="512" cy="512" r="512" fill="url(#bg)"/>
  ${ball(512, 512, 340)}
</svg>`

// Adaptive foreground: la zona segura es el 66% central (Android recorta el resto).
const svgForeground = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  ${ball(512, 512, 280)}
</svg>`

function svgSplash(w, h) {
  const cx = w / 2
  const cy = h / 2 - h * 0.06
  const r = Math.min(w, h) * 0.17
  const titleSize = Math.min(w, h) * 0.115
  const subSize = titleSize * 0.34
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <radialGradient id="bgGlow" cx="0.5" cy="0.42" r="0.9">
      <stop offset="0%" stop-color="${BG2}"/><stop offset="100%" stop-color="${BG}"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bgGlow)"/>
  ${ball(cx, cy, r)}
  <text x="${cx}" y="${cy + r + titleSize * 1.15}" text-anchor="middle"
        font-family="DejaVu Sans" font-weight="bold" font-size="${titleSize}"
        fill="${LIME}">AceCoach</text>
  <text x="${cx}" y="${cy + r + titleSize * 1.15 + subSize * 1.9}" text-anchor="middle"
        font-family="DejaVu Sans" font-size="${subSize}" fill="${GRAY}">Tu coach de tenis con IA</text>
</svg>`
}

const svgFeature = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BG2}"/><stop offset="100%" stop-color="${BG}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  ${ball(830, 250, 190)}
  <text x="70" y="215" font-family="DejaVu Sans" font-weight="bold" font-size="104" fill="${LIME}">AceCoach</text>
  <text x="72" y="285" font-family="DejaVu Sans" font-size="40" fill="#e8eef3">Tu coach de tenis con IA</text>
  <text x="72" y="345" font-family="DejaVu Sans" font-size="27" fill="${GRAY}">Registra · Sincroniza tu reloj · Mejora con tu coach</text>
</svg>`

async function render(svg, w, h, out) {
  mkdirSync(dirname(out), { recursive: true })
  await sharp(Buffer.from(svg)).resize(w, h).png().toFile(out)
  console.log('✓', out.replace(ROOT + '/', ''), `${w}x${h}`)
}

// ── Launcher icons ─────────────────────────────────────────────
const MIPMAP = { 'mipmap-mdpi': 48, 'mipmap-hdpi': 72, 'mipmap-xhdpi': 96, 'mipmap-xxhdpi': 144, 'mipmap-xxxhdpi': 192 }
const FG = { 'mipmap-mdpi': 108, 'mipmap-hdpi': 162, 'mipmap-xhdpi': 216, 'mipmap-xxhdpi': 324, 'mipmap-xxxhdpi': 432 }

for (const [dir, size] of Object.entries(MIPMAP)) {
  await render(svgIconSquare, size, size, join(RES, dir, 'ic_launcher.png'))
  await render(svgIconRound, size, size, join(RES, dir, 'ic_launcher_round.png'))
}
for (const [dir, size] of Object.entries(FG)) {
  await render(svgForeground, size, size, join(RES, dir, 'ic_launcher_foreground.png'))
}

// ── Splash screens ─────────────────────────────────────────────
const PORT = { 'drawable-port-mdpi': [320, 480], 'drawable-port-hdpi': [480, 800], 'drawable-port-xhdpi': [720, 1280], 'drawable-port-xxhdpi': [960, 1600], 'drawable-port-xxxhdpi': [1280, 1920] }
const LAND = { 'drawable-land-mdpi': [480, 320], 'drawable-land-hdpi': [800, 480], 'drawable-land-xhdpi': [1280, 720], 'drawable-land-xxhdpi': [1600, 960], 'drawable-land-xxxhdpi': [1920, 1280] }

for (const [dir, [w, h]] of Object.entries(PORT)) {
  await render(svgSplash(w, h), w, h, join(RES, dir, 'splash.png'))
}
for (const [dir, [w, h]] of Object.entries(LAND)) {
  await render(svgSplash(w, h), w, h, join(RES, dir, 'splash.png'))
}
await render(svgSplash(480, 320), 480, 320, join(RES, 'drawable', 'splash.png'))

// ── Google Play store assets ───────────────────────────────────
await render(svgIconSquare, 512, 512, join(STORE, 'play-icon-512.png'))
await render(svgFeature, 1024, 500, join(STORE, 'feature-graphic-1024x500.png'))

console.log('\n🎾 Recursos generados. Recuerda: android/.../values/ic_launcher_background.xml debe ser', BG)
