import type { Session } from '../types'

/**
 * Integración con wearables (relojes Android / Wear OS).
 *
 * En Android, los relojes (Galaxy Watch, Pixel Watch, etc.) vuelcan sus
 * entrenamientos en **Health Connect**, el almacén central de salud de
 * Google. Leemos de ahí: cualquier reloj compatible funciona sin integrar
 * cada marca por separado.
 *
 * - App nativa (Capacitor + Android): se usa el plugin de Health Connect si
 *   está instalado (ver README → Wearables).
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
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor
  return !!cap?.getPlatform && cap.getPlatform() === 'android'
}

/**
 * Lee entrenamientos desde Health Connect (solo Android nativo).
 * Requiere el plugin `capacitor-health-connect` añadido al proyecto Android.
 */
export async function readWorkoutsFromHealthConnect(sinceDays = 30): Promise<WearableWorkout[]> {
  const pkgName = 'capacitor-health-connect'
  let mod: Record<string, unknown>
  try {
    // Import dinámico para no romper el build web si el plugin no está instalado.
    mod = (await import(/* @vite-ignore */ pkgName)) as Record<string, unknown>
  } catch {
    throw new Error(
      'Plugin de Health Connect no instalado. Ejecuta "npm i capacitor-health-connect && npx cap sync android" (ver README → Wearables).',
    )
  }

  const HealthConnect = (mod.HealthConnect ?? mod.default) as {
    checkAvailability?: () => Promise<{ availability: string }>
    requestHealthPermissions?: (o: unknown) => Promise<unknown>
    readRecords?: (o: unknown) => Promise<{ records: HCExercise[] }>
  }

  if (HealthConnect.checkAvailability) {
    const { availability } = await HealthConnect.checkAvailability()
    if (availability !== 'Available') {
      throw new Error(
        'Health Connect no está disponible en este dispositivo. Instálalo desde Google Play y vincula tu reloj.',
      )
    }
  }

  await HealthConnect.requestHealthPermissions?.({
    read: ['ExerciseSession', 'HeartRateSeries', 'TotalCaloriesBurned'],
    write: [],
  })

  const since = new Date()
  since.setDate(since.getDate() - sinceDays)

  const res = await HealthConnect.readRecords?.({
    type: 'ExerciseSession',
    timeRangeFilter: {
      type: 'between',
      startTime: since.toISOString(),
      endTime: new Date().toISOString(),
    },
  })

  return (res?.records ?? []).map(hcToWorkout)
}

interface HCExercise {
  startTime?: string
  endTime?: string
  title?: string
  metadata?: { avgHeartRate?: number; maxHeartRate?: number; totalCalories?: number }
}

function hcToWorkout(r: HCExercise): WearableWorkout {
  const start = r.startTime ?? new Date().toISOString()
  const end = r.endTime ?? start
  const durationMin = Math.max(1, Math.round((+new Date(end) - +new Date(start)) / 60000))
  return {
    start,
    durationMin,
    title: r.title,
    avgHr: r.metadata?.avgHeartRate,
    maxHr: r.metadata?.maxHeartRate,
    calories: r.metadata?.totalCalories,
  }
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

/** Estima la intensidad 1–5 a partir de la FC media. */
export function intensityFromHr(avgHr?: number): number {
  if (!avgHr) return 3
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
      intensity: intensityFromHr(w.avgHr),
      focus: ['Físico'],
      notes: w.title ? `⌚ ${w.title}` : '⌚ Importado del reloj',
      avgHr: w.avgHr,
      maxHr: w.maxHr,
      calories: w.calories,
      source: 'wearable' as const,
    }))
}
