#!/usr/bin/env node
/**
 * Generador de recursos de marca de Punto Extra — con Punti, la mascota 🖍️
 *
 * Genera desde SVG: iconos de launcher (legacy + adaptive), splash screens,
 * icono 512 y feature graphic de Google Play, og-image y favicon de la landing.
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
const LANDING = join(ROOT, '../landing')

const TINTA = '#221A4A', ROSA = '#FF9FB2', ROSA_CLARO = '#FFC4D0', RUBOR = '#FFA3B5'
const LAVANDA = '#A79BF5', LAVANDA_HONDA = '#8F80F0'
const CUERPO = '#FFD36B', CUERPO_CLARO = '#FFE59A', CUERPO_HONDO = '#F2B94B'
const MADERA = '#F7E6C4', GRAFITO = '#4A4160', AMBAR = '#FFC53D'

/** Punti oficial (manitas juntas al frente). Lienzo nativo 240×300, sin sombra. */
export function punti(s = 1, dx = 0, dy = 0) {
  return `
  <g transform="translate(${dx} ${dy}) scale(${s})">
    <path d="M74 84 v-14 q0 -40 46 -40 q46 0 46 40 v14 Z" fill="${ROSA}"/>
    <ellipse cx="98" cy="52" rx="14" ry="7" fill="${ROSA_CLARO}" transform="rotate(-12 98 52)"/>
    <rect x="68" y="80" width="104" height="26" rx="11" fill="${LAVANDA}"/>
    <line x1="79" y1="88" x2="161" y2="88" stroke="${LAVANDA_HONDA}" stroke-width="4" stroke-linecap="round"/>
    <line x1="79" y1="98" x2="161" y2="98" stroke="${LAVANDA_HONDA}" stroke-width="4" stroke-linecap="round"/>
    <path d="M74 106 h92 v128 h-92 Z" fill="${CUERPO}"/>
    <path d="M74 106 h20 v128 h-20 Z" fill="${CUERPO_CLARO}"/>
    <path d="M146 106 h20 v128 h-20 Z" fill="${CUERPO_HONDO}"/>
    <path d="M74 232 Q85.5 224 97 232 Q108.5 240 120 232 Q131.5 224 143 232 Q154.5 240 166 232 L133 276 Q120 288 107 276 Z" fill="${MADERA}"/>
    <path d="M107 258 Q120 249 133 258 L126 271 Q120 277 114 271 Z" fill="${GRAFITO}"/>
    <circle cx="100.2" cy="146" r="11.2" fill="${TINTA}"/>
    <circle cx="139.8" cy="146" r="11.2" fill="${TINTA}"/>
    <circle cx="96.9" cy="142" r="4.3" fill="#fff"/>
    <circle cx="136.5" cy="142" r="4.3" fill="#fff"/>
    <circle cx="105" cy="150" r="1.9" fill="#fff" opacity="0.9"/>
    <circle cx="144.4" cy="150" r="1.9" fill="#fff" opacity="0.9"/>
    <circle cx="84.4" cy="163" r="7.3" fill="${RUBOR}" opacity="0.7"/>
    <circle cx="155.6" cy="163" r="7.3" fill="${RUBOR}" opacity="0.7"/>
    <path d="M112 168 Q120 175 128 168" stroke="${TINTA}" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M74 172 Q60 206 92 222" fill="none" stroke="${CUERPO_HONDO}" stroke-width="15" stroke-linecap="round"/>
    <path d="M166 172 Q180 206 148 222" fill="none" stroke="${CUERPO_HONDO}" stroke-width="15" stroke-linecap="round"/>
    <circle cx="103" cy="225" r="13" fill="${CUERPO}"/>
    <circle cx="137" cy="225" r="13" fill="${CUERPO}"/>
  </g>`
}

const destello = (cx, cy, r, op = 1) =>
  `<path d="M${cx} ${cy - r} Q${cx + r * 0.2} ${cy - r * 0.2} ${cx + r} ${cy} Q${cx + r * 0.2} ${cy + r * 0.2} ${cx} ${cy + r} Q${cx - r * 0.2} ${cy + r * 0.2} ${cx - r} ${cy} Q${cx - r * 0.2} ${cy - r * 0.2} ${cx} ${cy - r} Z" fill="${AMBAR}" opacity="${op}"/>`

const fondo = (w = 1024, h = 1024) => `
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#6A4DFF"/><stop offset="100%" stop-color="#4527D8"/>
  </linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>`

// Icono cuadrado: Punti centrado con destellos
const svgIconSquare = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  ${fondo()}
  ${destello(210, 200, 52, 0.95)} ${destello(830, 168, 40, 0.7)} ${destello(862, 700, 34, 0.5)}
  ${punti(2.9, 164, 78)}
</svg>`

// Foreground adaptativo (zona segura 66%)
const svgForeground = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${punti(2.0, 272, 212)}</svg>`

function svgSplash(w, h) {
  const s = (Math.min(w, h) / 300) * 0.62
  const dx = w / 2 - 120 * s
  const dy = h / 2 - 150 * s
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${fondo(w, h)}${punti(s, dx, dy)}</svg>`
}

const svgFeature = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500">
  ${fondo(1024, 500)}
  ${destello(90, 90, 30, 0.9)} ${destello(390, 420, 22, 0.6)}
  ${punti(1.42, 60, 40)}
  <text x="460" y="210" font-family="Georgia,serif" font-weight="700" font-size="78" fill="#FFFFFF">Punto Extra</text>
  <text x="464" y="280" font-family="Georgia,serif" font-style="italic" font-weight="400" font-size="38" fill="#EDE8FF">El tutor de toda la familia</text>
</svg>`

const svgOg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  ${fondo(1200, 630)}
  ${destello(110, 110, 34, 0.9)} ${destello(470, 540, 26, 0.6)}
  ${punti(1.8, 60, 45)}
  <text x="540" y="270" font-family="Georgia,serif" font-weight="700" font-size="96" fill="#FFFFFF">Punto Extra</text>
  <text x="545" y="350" font-family="Georgia,serif" font-style="italic" font-weight="400" font-size="44" fill="#EDE8FF">El tutor de toda la familia</text>
  <text x="545" y="425" font-family="sans-serif" font-weight="700" font-size="30" fill="#C9BFF7">Tutor por WhatsApp · Temario SEP · Prep UNAM/IPN</text>
</svg>`

// Favicon / icono web: Punti sobre tesela violeta
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#6A4DFF"/><stop offset="100%" stop-color="#4527D8"/>
  </linearGradient></defs>
  <rect width="1024" height="1024" rx="224" fill="url(#bg)"/>
  ${destello(210, 200, 52, 0.95)} ${destello(830, 168, 40, 0.7)}
  ${punti(2.9, 164, 78)}
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

mkdirSync(join(RES, 'values'), { recursive: true })
writeFileSync(join(RES, 'values/ic_launcher_background.xml'),
  `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#4527D8</color>\n</resources>\n`)
console.log('✓ values/ic_launcher_background.xml')

// Ficha de Google Play + landing + PWA
await png(svgIconSquare, 512, join(STORE, 'play-icon-512.png'))
await png(svgFeature, 0, join(STORE, 'feature-graphic-1024x500.png'), 1024, 500)
await png(svgOg, 0, join(LANDING, 'og-image.png'), 1200, 630)
writeFileSync(join(LANDING, 'favicon.svg'), svgFavicon)
writeFileSync(join(ROOT, 'public/icon.svg'), svgFavicon)
writeFileSync(join(ROOT, '../brand/punti.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 300">${punti()}</svg>\n`)
writeFileSync(join(ROOT, '../brand/icon.svg'), svgFavicon + '\n')
await png(svgFavicon, 180, join(LANDING, 'apple-touch-icon.png'))
await png(svgFavicon, 192, join(ROOT, 'public/icon-192.png'))
await png(svgFavicon, 512, join(ROOT, 'public/icon-512.png'))

console.log('\nListo 🎉  Punti aplicado en todos los recursos de marca.')
