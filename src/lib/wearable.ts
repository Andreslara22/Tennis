import { Capacitor } from '@capacitor/core'
import { HealthConnect } from '@kiwi-health/capacitor-health-connect'
import type { Session } from '../types'

/**
 * Integración con wearables (relojes Android / Wear OS).
 *
 * En Android, los relojes (Galaxy Watch, Pixel Watch, etc.) vuelcan sus
 * entrenamientos en **Health Connect**, el almacén central de salud de
 * Google. Leemos de ahí: cualquier reloj compatible funciona sin integrar
 * cada marca por separado.
 *
 * - App nativa (Capacitor + Android): plugin @kiwi-health/capacitor-health-connect.
 * - Web / desarrollo: no hay Health Connect, así que ofrecemos una
 *   importación de DEMO claramente etiquetada para probar el flujo.
 */

export interface WearableWorkout {
  /** Inicio del entrenamiento (ISO) — se usa también para deduplicar */
  start: string
  durationMin: number
  avgHr?: number
  maxHr?: number
  calories?: number
  title?: string
}

/** ¿Estamos corriendo como app nativa Android (Capacitor)? */
export function isNativeAndroid(): boolean {
  return Capacitor.getPlatform() === 'android'
}

const READ_TYPES = ['ExerciseSession', 'HeartRateSeries', 'TotalCaloriesBurned'] as const

/**
 * Lee entrenamientos desde Health Connect (solo Android nativo).
 * Correlaciona FC y calorías con cada sesión por solapamiento temporal.
 */
export async function readWorkoutsFromHealthConnect(sinceDays = 30): Promise<WearableWorkout[]> {
  const { availability } = await HealthConnect.checkAvailability()
  if (availability === 'NotInstalled') {
    throw new Error(
      'Health Connect no está instalado. Instálalo desde Google Play y vincula tu reloj.',
    )
  }
  if (availability !== 'Available') {
    throw new Error('Health Connect no está disponible en este dispositivo.')
  }

  const perms = await HealthConnect.requestHealthPermissions({
    read: [...READ_TYPES],
    write: [],
  })
  if (!perms.hasAllPermissions && perms.grantedPermissions.length === 0) {
    throw new Error(
      'Permisos de Health Connect denegados. Concédelos en Ajustes → Health Connect → Permisos de apps.',
    )
  }

  const timeRangeFilter = {
    type: 'between' as const,
    startTime: new Date(Date.now() - sinceDays * 86400_000),
    endTime: new Date(),
  }

  const [exercises, hrSeries, calRecords] = await Promise.all([
    readAll('ExerciseSession', timeRangeFilter),
    readAll('HeartRateSeries', timeRangeFilter),
    readAll('TotalCaloriesBurned', timeRangeFilter),
  ])

  return exercises.map((ex) => {
    const start = new Date(ex.startTime as unknown as string | Date)
    const end = new Date(ex.endTime as unknown as string | Date)

    // FC: muestras dentro de la ventana del ejercicio
    const samples: number[] = []
    for (const serie of hrSeries) {
      const s = serie as unknown as {
        samples?: { time: string | Date; beatsPerMinute: number }[]
      }
      for (const smp of s.samples ?? []) {
        const t = new Date(smp.time)
        if (t >= start && t <= end) samples.push(smp.beatsPerMinute)
      }
    }

    // Calorías: registros que solapan con la ventana del ejercicio
    let kcal = 0
    for (const c of calRecords) {
      const cr = c as unknown as {
        startTime: string | Date
        endTime: string | Date
        energy?: { unit: string; value: number }
      }
      const cs = new Date(cr.startTime)
      const ce = new Date(cr.endTime)
      if (cs < end && ce > start && cr.energy?.value) kcal += cr.energy.value
    }

    const exr = ex as unknown as { title?: string }
    return {
      start: start.toISOString(),
      durationMin: Math.max(1, Math.round((+end - +start) / 60000)),
      title: exr.title || 'Entrenamiento del reloj',
      avgHr: samples.length
        ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)
        : undefined,
      maxHr: samples.length ? Math.max(...samples) : undefined,
      calories: kcal > 0 ? Math.round(kcal) : undefined,
    }
  })
}

type TimeRange = { type: 'between'; startTime: Date; endTime: Date }

/** Lee todas las páginas de un tipo de registro. */
async function readAll(
  type: (typeof READ_TYPES)[number],
  timeRangeFilter: TimeRange,
): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = []
  let pageToken: string | undefined
  do {
    const res = await HealthConnect.readRecords({
      type,
      timeRangeFilter,
      pageSize: 1000,
      pageToken,
    })
    out.push(...(res.records as unknown as Record<string, unknown>[]))
    pageToken = res.pageToken
  } while (pageToken)
  return out
}

/**
 * Entrenamientos de DEMO para probar el flujo en web / sin reloj.
 * Genera 3 sesiones plausibles en la última semana.
 */
export function demoWorkouts(): WearableWorkout[] {
  const out: WearableWorkout[] = []
  const daysAgo = [1, 3, 6]
  for (const d of daysAgo) {
    const start = new Date()
    start.setDate(start.getDate() - d)
    start.setHours(18, 30, 0, 0)
    const durationMin = 45 + Math.floor(Math.random() * 45) // 45–90 min
    const avgHr = 120 + Math.floor(Math.random() * 30) // 120–150
    out.push({
      start: start.toISOString(),
      durationMin,
      avgHr,
      maxHr: avgHr + 20 + Math.floor(Math.random() * 15),
      calories: Math.round(durationMin * (6 + Math.random() * 3)),
      title: 'Tenis (demo reloj)',
    })
  }
  return out
}

// ---------- Zonas de frecuencia cardíaca ----------

export interface HrZones {
  /** FC máxima teórica (220 − edad) */
  hrMax: number
  /** Límites superiores de las zonas 1–5 en ppm */
  z1: number // recuperación (<60%)
  z2: number // aeróbico suave (60–70%)
  z3: number // aeróbico (70–80%)
  z4: number // umbral (80–90%)
  // z5: >90% hasta hrMax
}

/** Zonas de FC personalizadas a partir del año de nacimiento (fórmula 220 − edad). */
export function hrZonesFromBirthYear(birthYear?: number): HrZones | null {
  if (!birthYear) return null
  const age = new Date().getFullYear() - birthYear
  if (age < 8 || age > 100) return null
  const hrMax = 220 - age
  return {
    hrMax,
    z1: Math.round(hrMax * 0.6),
    z2: Math.round(hrMax * 0.7),
    z3: Math.round(hrMax * 0.8),
    z4: Math.round(hrMax * 0.9),
  }
}

/** Nombre de la zona en la que cae una FC dada. */
export function hrZoneLabel(avgHr: number, zones: HrZones): string {
  if (avgHr <= zones.z1) return 'Z1 · recuperación'
  if (avgHr <= zones.z2) return 'Z2 · aeróbico suave'
  if (avgHr <= zones.z3) return 'Z3 · aeróbico'
  if (avgHr <= zones.z4) return 'Z4 · umbral'
  return 'Z5 · máxima'
}

/**
 * Estima la intensidad 1–5. Con zonas personalizadas usa el % de FC máx;
 * sin ellas, umbrales genéricos.
 */
export function intensityFromHr(avgHr?: number, zones?: HrZones | null): number {
  if (!avgHr) return 3
  if (zones) {
    if (avgHr <= zones.z1) return 1
    if (avgHr <= zones.z2) return 2
    if (avgHr <= zones.z3) return 3
    if (avgHr <= zones.z4) return 4
    return 5
  }
  if (avgHr < 110) return 2
  if (avgHr < 130) return 3
  if (avgHr < 150) return 4
  return 5
}

/**
 * Convierte workouts del reloj en sesiones de la app, descartando los que ya
 * fueron importados (misma fecha de inicio y origen 'wearable').
 */
export function workoutsToSessions(
  workouts: WearableWorkout[],
  existing: Session[],
  zones?: HrZones | null,
): Omit<Session, 'id'>[] {
  const imported = new Set(
    existing.filter((s) => s.source === 'wearable').map((s) => s.date),
  )
  return workouts
    .filter((w) => !imported.has(w.start))
    .map((w) => ({
      date: w.start,
      type: 'entrenamiento' as const,
      durationMin: w.durationMin,
      intensity: intensityFromHr(w.avgHr, zones),
      focus: ['Físico'],
      notes: w.title ? `⌚ ${w.title}` : '⌚ Importado del reloj',
      avgHr: w.avgHr,
      maxHr: w.maxHr,
      calories: w.calories,
      source: 'wearable' as const,
    }))
}
