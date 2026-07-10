#!/usr/bin/env node
/**
 * Parche post-install para @kiwi-health/capacitor-health-connect.
 *
 * Capacitor 7 compila con Java 21, pero el plugin fija Kotlin 1.8.20
 * (no soporta JVM target 21) y Java 17. Este script alinea el módulo:
 *   - Kotlin 1.8.20 → 1.9.25 (soporta JVM 21)
 *   - Java source/target 17 → 21
 *   - kotlinOptions.jvmTarget = 21
 *
 * Es idempotente: se ejecuta en cada `npm install` (postinstall).
 */
import { existsSync, readFileSync, writeFileSync } from 'fs'

const FILE = 'node_modules/@kiwi-health/capacitor-health-connect/android/build.gradle'

if (!existsSync(FILE)) {
  console.log('[patch-health-connect] plugin no instalado; nada que parchear')
  process.exit(0)
}

let src = readFileSync(FILE, 'utf8')
const before = src

src = src.replace('ext.kotlin_version = "1.8.20"', 'ext.kotlin_version = "1.9.25"')
src = src.replace(/sourceCompatibility JavaVersion\.VERSION_17/g, 'sourceCompatibility JavaVersion.VERSION_21')
src = src.replace(/targetCompatibility JavaVersion\.VERSION_17/g, 'targetCompatibility JavaVersion.VERSION_21')

if (!src.includes('kotlinOptions')) {
  src = src.replace(
    /(compileOptions \{[\s\S]*?\}\n)/,
    `$1    kotlinOptions {\n        jvmTarget = "21"\n    }\n`,
  )
}

if (src !== before) {
  writeFileSync(FILE, src)
  console.log('[patch-health-connect] ✅ plugin parcheado (Kotlin 1.9.25 / JVM 21)')
} else {
  console.log('[patch-health-connect] ya estaba parcheado')
}
