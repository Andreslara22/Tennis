import type { Session } from '../types'

export interface Aggregates {
  totalSessions: number
  matches: number
  practices: number
  wins: number
  losses: number
  winRate: number | null // 0–100 o null si no hay partidos
  totalMinutes: number
  currentStreakDays: number
  avgFirstServe: number | null
  avgWinners: number | null
  avgUnforced: number | null
  winnersToErrors: number | null
  // Datos de wearable
  avgHr: number | null
  maxHrEver: number | null
  totalCalories: number
  wearableSessions: number
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Días consecutivos (incluyendo hoy o ayer) con al menos una sesión. */
export function computeStreak(sessions: Session[]): number {
  if (sessions.length === 0) return 0
  const days = new Set(
    sessions.map((s) => {
      const d = new Date(s.date)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    }),
  )
  let streak = 0
  const cursor = new Date()
  // Permitir que la racha empiece hoy o ayer.
  const todayKey = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`
  if (!days.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1)
  }
  for (;;) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`
    if (days.has(key)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function aggregate(sessions: Session[]): Aggregates {
  const matches = sessions.filter((s) => s.type === 'partido')
  const practices = sessions.filter((s) => s.type === 'entrenamiento')
  const wins = matches.filter((m) => m.won === true).length
  const losses = matches.filter((m) => m.won === false).length
  const decided = wins + losses

  const firstServe = sessions
    .map((s) => s.stats?.firstServePct)
    .filter((n): n is number => typeof n === 'number')
  const winners = sessions
    .map((s) => s.stats?.winners)
    .filter((n): n is number => typeof n === 'number')
  const unforced = sessions
    .map((s) => s.stats?.unforcedErrors)
    .filter((n): n is number => typeof n === 'number')

  const totalWinners = winners.reduce((a, b) => a + b, 0)
  const totalUnforced = unforced.reduce((a, b) => a + b, 0)

  const hrs = sessions.map((s) => s.avgHr).filter((n): n is number => typeof n === 'number')
  const maxHrs = sessions.map((s) => s.maxHr).filter((n): n is number => typeof n === 'number')
  const cals = sessions.map((s) => s.calories).filter((n): n is number => typeof n === 'number')

  return {
    totalSessions: sessions.length,
    matches: matches.length,
    practices: practices.length,
    wins,
    losses,
    winRate: decided > 0 ? (wins / decided) * 100 : null,
    totalMinutes: sessions.reduce((a, s) => a + (s.durationMin || 0), 0),
    currentStreakDays: computeStreak(sessions),
    avgFirstServe: avg(firstServe),
    avgWinners: avg(winners),
    avgUnforced: avg(unforced),
    winnersToErrors: totalUnforced > 0 ? totalWinners / totalUnforced : null,
    avgHr: avg(hrs),
    maxHrEver: maxHrs.length ? Math.max(...maxHrs) : null,
    totalCalories: cals.reduce((a, b) => a + b, 0),
    wearableSessions: sessions.filter((s) => s.source === 'wearable').length,
  }
}

export interface TrendPoint {
  label: string
  minutes: number
  sessions: number
}

/** Minutos y nº de sesiones por semana (últimas `weeks` semanas). */
export function weeklyTrend(sessions: Session[], weeks = 8): TrendPoint[] {
  const now = new Date()
  const points: TrendPoint[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(now)
    end.setDate(now.getDate() - i * 7)
    const start = new Date(end)
    start.setDate(end.getDate() - 6)
    const inWeek = sessions.filter((s) => {
      const d = new Date(s.date)
      return d >= startOfDay(start) && d <= endOfDay(end)
    })
    points.push({
      label: `${start.getDate()}/${start.getMonth() + 1}`,
      minutes: inWeek.reduce((a, s) => a + (s.durationMin || 0), 0),
      sessions: inWeek.length,
    })
  }
  return points
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function endOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

/** Actividad de la semana actual (lunes 00:00 → ahora). */
export function currentWeekActivity(sessions: Session[]): { sessions: number; minutes: number } {
  const now = new Date()
  const monday = new Date(now)
  const day = (now.getDay() + 6) % 7 // 0 = lunes
  monday.setDate(now.getDate() - day)
  monday.setHours(0, 0, 0, 0)
  const inWeek = sessions.filter((s) => new Date(s.date) >= monday)
  return {
    sessions: inWeek.length,
    minutes: inWeek.reduce((a, s) => a + (s.durationMin || 0), 0),
  }
}

export function ntrpLabel(ntrp: number): string {
  if (ntrp < 2) return 'Principiante'
  if (ntrp < 3) return 'Iniciación'
  if (ntrp < 3.5) return 'Intermedio bajo'
  if (ntrp < 4) return 'Intermedio'
  if (ntrp < 4.5) return 'Intermedio alto'
  if (ntrp < 5) return 'Avanzado'
  return 'Competición'
}

export { isSameDay }
