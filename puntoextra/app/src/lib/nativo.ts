import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { LocalNotifications } from '@capacitor/local-notifications'

export const esNativo = () => Capacitor.isNativePlatform()

/** Botón atrás de Android: regresa a Inicio; si ya está ahí, minimiza. */
export function manejarBotonAtras(alInicio: () => boolean) {
  if (!esNativo()) return
  CapApp.addListener('backButton', () => {
    const yaEstaba = alInicio()
    if (yaEstaba) CapApp.minimizeApp()
  })
}

const ID_RECORDATORIO = 71

/** Programa (o cancela) el recordatorio diario del quiz a las 7:00 pm. */
export async function programarRecordatorio(activo: boolean): Promise<boolean> {
  if (!esNativo()) return false
  try {
    if (!activo) {
      await LocalNotifications.cancel({ notifications: [{ id: ID_RECORDATORIO }] })
      return true
    }
    const permiso = await LocalNotifications.requestPermissions()
    if (permiso.display !== 'granted') return false
    await LocalNotifications.schedule({
      notifications: [
        {
          id: ID_RECORDATORIO,
          title: 'Quiz del día 🏅',
          body: '5 preguntas y a seguir la racha. ¡El punto extra de hoy se gana en 3 minutos!',
          schedule: { on: { hour: 19, minute: 0 }, allowWhileIdle: true },
          smallIcon: 'ic_launcher_foreground',
        },
      ],
    })
    return true
  } catch {
    return false
  }
}

/** Prompt de instalación del portal web (PWA). */
let promptDiferido: (Event & { prompt: () => Promise<void> }) | null = null

export function capturarInstalacion(alCambiar: () => void) {
  if (esNativo()) return
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    promptDiferido = e as typeof promptDiferido
    alCambiar()
  })
  window.addEventListener('appinstalled', () => {
    promptDiferido = null
    alCambiar()
  })
}

export const puedeInstalar = () => promptDiferido !== null

export async function instalarPWA() {
  if (!promptDiferido) return
  await promptDiferido.prompt()
  promptDiferido = null
}
