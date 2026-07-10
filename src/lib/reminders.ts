import { LocalNotifications } from '@capacitor/local-notifications'
import type { ReminderSettings } from '../types'
import { isNativeAndroid } from './wearable'

/**
 * Recordatorios de entrenamiento — notificaciones locales semanales.
 * Solo disponibles en la app nativa (Android). En web se muestra un aviso.
 */

const MESSAGES = [
  '¡Hora de entrenar! 🎾 Tu revés no se mejora solo.',
  'A la pista 🎾 La constancia gana partidos.',
  '¡Entrenamiento de hoy! 🎾 Suma un día más a tu racha.',
  'Tu coach te espera 🎾 ¿50 saques antes de empezar?',
]

/** IDs reservados: 1000 + día ISO (1..7) para poder cancelarlos siempre. */
const BASE_ID = 1000

/** ISO (1=lunes..7=domingo) → constante weekday del plugin (1=domingo..7=sábado) */
function isoToPluginWeekday(isoDay: number): number {
  return isoDay === 7 ? 1 : isoDay + 1
}

export const DAY_LABELS: { iso: number; label: string }[] = [
  { iso: 1, label: 'L' },
  { iso: 2, label: 'M' },
  { iso: 3, label: 'X' },
  { iso: 4, label: 'J' },
  { iso: 5, label: 'V' },
  { iso: 6, label: 'S' },
  { iso: 7, label: 'D' },
]

/** Cancela todos los recordatorios programados por la app. */
export async function cancelReminders(): Promise<void> {
  if (!isNativeAndroid()) return
  const pending = await LocalNotifications.getPending()
  const ours = pending.notifications.filter((n) => n.id >= BASE_ID && n.id < BASE_ID + 10)
  if (ours.length) {
    await LocalNotifications.cancel({ notifications: ours.map((n) => ({ id: n.id })) })
  }
}

/**
 * (Re)programa los recordatorios semanales según los ajustes.
 * Devuelve true si quedaron programados.
 */
export async function applyReminders(settings: ReminderSettings): Promise<boolean> {
  if (!isNativeAndroid()) return false

  await cancelReminders()
  if (!settings.enabled || settings.days.length === 0) return false

  const perm = await LocalNotifications.requestPermissions()
  if (perm.display !== 'granted') {
    throw new Error(
      'Permiso de notificaciones denegado. Actívalo en Ajustes de Android → Apps → AceCoach → Notificaciones.',
    )
  }

  const [hourStr, minuteStr] = settings.time.split(':')
  const hour = parseInt(hourStr, 10) || 18
  const minute = parseInt(minuteStr, 10) || 0

  await LocalNotifications.schedule({
    notifications: settings.days.map((isoDay, i) => ({
      id: BASE_ID + isoDay,
      title: 'AceCoach',
      body: MESSAGES[i % MESSAGES.length],
      schedule: {
        on: { weekday: isoToPluginWeekday(isoDay), hour, minute },
        allowWhileIdle: true,
      },
      smallIcon: 'ic_launcher_foreground',
    })),
  })
  return true
}
