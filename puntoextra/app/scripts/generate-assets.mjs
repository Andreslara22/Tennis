#!/usr/bin/env node
/**
 * Generador de recursos de marca de Punto Extra
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

const MORA_CLARA = '#6A4DFF'
const MORA_OSCURA = '#4527D8'
const TINTA = '#221A4A'
const AMBAR = '#FFC53D'
const LILA = '#D9D2F9'

/** Burbuja de chat + insignia "+1" con destellos, en lienzo de 1024, escala s. */
function marca(s = 1, dx = 0, dy = 0) {
  return `
  <defs>
    <radialGradient id="badge" cx="0.35" cy="0.3" r="1">
      <stop offset="0%" stop-color="#FFD971"/>
      <stop offset="60%" stop-color="${AMBAR}"/>
      <stop offset="100%" stop-color="#E8A81E"/>
    </radialGradient>
  </defs>
  <g transform="translate(${dx} ${dy}) scale(${s})">
    <rect x="200" y="270" width="584" height="420" rx="100" fill="#FFFFFF"/>
    <path d="M280 650 L280 810 Q280 842 306 822 L450 690 Z" fill="#FFFFFF"/>
    <rect x="300" y="386" width="260" height="44" rx="22" fill="${LILA}"/>
    <rect x="300" y="474" width="188" height="44" rx="22" fill="${LILA}"/>
    <path d="M700 128 Q712 176 760 188 Q712 200 700 248 Q688 200 640 188 Q688 176 700 128 Z" fill="${AMBAR}"/>
    <path d="M852 96 Q859 124 887 131 Q859 138 852 166 Q845 138 817 131 Q845 124 852 96 Z" fill="${AMBAR}" opacity="0.7"/>
    <path d="M905 236 Q910 256 930 261 Q910 266 905 286 Q900 266 880 261 Q900 256 905 236 Z" fill="${AMBAR}" opacity="0.5"/>
    <circle cx="712" cy="520" r="168" fill="url(#badge)"/>
    <circle cx="712" cy="520" r="168" fill="none" stroke="${TINTA}" stroke-width="14" opacity="0.14"/>
    <circle cx="712" cy="520" r="128" fill="none" stroke="${TINTA}" stroke-width="10" opacity="0.26" stroke-dasharray="4 22" stroke-linecap="round"/>
    <text x="712" y="576" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="150" fill="${TINTA}">+1</text>
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
  ${marca(0.42, 10, 35)}
  <text x="462" y="212" font-family="sans-serif" font-weight="900" font-size="76" fill="#FFFFFF">punto extra</text>
  <text x="466" y="278" font-family="sans-serif" font-weight="700" font-size="34" fill="#EDE8FF">El tutor de toda la familia</text>
  <text x="466" y="340" font-family="sans-serif" font-weight="900" font-size="37" fill="${AMBAR}">$99 al mes · hasta 4 hijos</text>
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

console.log('\nListo 🎉  Recursos de marca de Punto Extra generados.')
