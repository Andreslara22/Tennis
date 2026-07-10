#!/usr/bin/env node
/**
 * Generador de recursos de marca de Tarea+
 *
 * Genera desde SVG (sin herramientas externas):
 *  - Iconos de launcher Android (legacy + round + adaptive foreground)
 *  - Splash screens (portrait/landscape, todas las densidades)
 *  - Recursos para la ficha de Google Play (icono 512 y feature graphic 1024×500)
 *
 * Uso:  node scripts/generate-assets.mjs
 */
import sharp from 'sharp'
import { mkdirSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const RES = join(ROOT, 'android/app/src/main/res')
const STORE = join(ROOT, 'store-assets')

const MORA = '#5B3DF5'
const MORA_CLARA = '#6A4DFF'
const MORA_OSCURA = '#4527D8'
const TINTA = '#221A4A'
const SOL = '#FFC53D'
const LILA = '#D9D2F9'

/** Burbuja de chat + ficha "+" centrada en un lienzo de 1024, escala s. */
function marca(s = 1, dx = 0, dy = 0) {
  const t = (v) => v * s
  return `
  <g transform="translate(${dx} ${dy}) scale(${s})">
    <rect x="220" y="240" width="584" height="420" rx="100" fill="#FFFFFF"/>
    <path d="M300 620 L300 780 Q300 812 326 792 L470 660 Z" fill="#FFFFFF"/>
    <rect x="320" y="356" width="260" height="44" rx="22" fill="${LILA}"/>
    <rect x="320" y="444" width="188" height="44" rx="22" fill="${LILA}"/>
    <rect x="556" y="468" width="316" height="316" rx="86" fill="${SOL}"/>
    <rect x="678" y="536" width="72" height="180" rx="36" fill="${TINTA}"/>
    <rect x="624" y="590" width="180" height="72" rx="36" fill="${TINTA}"/>
  </g>`
}

const fondo = (w = 1024, h = 1024) => `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${MORA_CLARA}"/>
      <stop offset="100%" stop-color="${MORA_OSCURA}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>`

const svgIconSquare = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${fondo()}${marca()}</svg>`

// Foreground adaptativo: el contenido debe caber en la zona segura (66% central)
const svgForeground = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${marca(0.62, 195, 195)}</svg>`

function svgSplash(w, h) {
  const s = Math.min(w, h) * 0.00055
  const dx = w / 2 - 512 * s
  const dy = h / 2 - 512 * s
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${fondo(w, h)}${marca(s, dx, dy)}</svg>`
}

const svgFeature = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500">
  ${fondo(1024, 500)}
  ${marca(0.4, 30, 45)}
  <text x="470" y="225" font-family="sans-serif" font-weight="900" font-size="100" fill="#FFFFFF">tarea+</text>
  <text x="474" y="288" font-family="sans-serif" font-weight="700" font-size="34" fill="#EDE8FF">El tutor de toda la familia</text>
  <text x="474" y="348" font-family="sans-serif" font-weight="900" font-size="37" fill="${SOL}">$99 al mes · hasta 4 hijos</text>
</svg>`

async function png(svg, size, dest, w = size, h = size) {
  mkdirSync(dirname(dest), { recursive: true })
  await sharp(Buffer.from(svg)).resize(w, h).png().toFile(dest)
  console.log('✓', dest.replace(ROOT + '/', ''))
}

const LAUNCHER = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 }
const FG = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 }
const SPLASH_LAND = { mdpi: [480, 320], hdpi: [800, 480], xhdpi: [1280, 720], xxhdpi: [1600, 960], xxxhdpi: [1920, 1280] }

for (const [dpi, size] of Object.entries(LAUNCHER)) {
  await png(svgIconSquare, size, join(RES, `mipmap-${dpi}/ic_launcher.png`))
  await png(svgIconSquare, size, join(RES, `mipmap-${dpi}/ic_launcher_round.png`))
}
for (const [dpi, size] of Object.entries(FG)) {
  await png(svgForeground, size, join(RES, `mipmap-${dpi}/ic_launcher_foreground.png`))
}
for (const [dpi, [w, h]] of Object.entries(SPLASH_LAND)) {
  await png(svgSplash(w, h), 0, join(RES, `drawable-land-${dpi}/splash.png`), w, h)
  await png(svgSplash(h, w), 0, join(RES, `drawable-port-${dpi}/splash.png`), h, w)
}
await png(svgSplash(480, 320), 0, join(RES, 'drawable/splash.png'), 480, 320)

// Color de fondo del icono adaptativo
mkdirSync(join(RES, 'values'), { recursive: true })
writeFileSync(
  join(RES, 'values/ic_launcher_background.xml'),
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">${MORA_OSCURA}</color>\n</resources>\n`,
)
console.log('✓ values/ic_launcher_background.xml')

// Ficha de Google Play
await png(svgIconSquare, 512, join(STORE, 'play-icon-512.png'))
await png(svgFeature, 0, join(STORE, 'feature-graphic-1024x500.png'), 1024, 500)

console.log('\nListo 🎉  Recursos de marca de Tarea+ generados.')
