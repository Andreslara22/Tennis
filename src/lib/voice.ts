import { Capacitor } from '@capacitor/core'
import { SpeechRecognition } from '@capacitor-community/speech-recognition'

/**
 * Dictado por voz para el partido en vivo.
 * - Android nativo: plugin @capacitor-community/speech-recognition
 * - Web (Chrome): Web Speech API
 *
 * Comandos entendidos (español, sin importar acentos):
 *   "punto mío / nuestro"  → punto para ti
 *   "punto rival / de él"  → punto para el rival
 *   "ace"                  → +1 ace Y punto para ti
 *   "winner / ganador"     → +1 winner Y punto para ti
 *   "doble falta"          → +1 doble falta Y punto para el rival
 *   "error"                → +1 error no forzado Y punto para el rival
 *   "deshacer / corrige"   → deshace el último punto
 */

export type VoiceCommand =
  | { type: 'point'; who: 0 | 1 }
  | { type: 'ace' }
  | { type: 'winner' }
  | { type: 'doubleFault' }
  | { type: 'unforcedError' }
  | { type: 'undo' }

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quitar acentos
    .trim()
}

/** Interpreta una frase dictada. Devuelve null si no se reconoce el comando. */
export function parseCommand(raw: string): VoiceCommand | null {
  const t = normalize(raw)
  if (!t) return null

  if (/(deshacer|deshaz|corrige|corregir|atras|quita el punto)/.test(t)) return { type: 'undo' }
  if (/doble\s*falta/.test(t)) return { type: 'doubleFault' }
  if (/\bace\b|saque directo/.test(t)) return { type: 'ace' }
  if (/winner|ganador/.test(t)) return { type: 'winner' }
  if (/error/.test(t)) return { type: 'unforcedError' }
  if (/punto/.test(t)) {
    if (/(mio|mia|nuestro|nuestra|para mi|yo)/.test(t)) return { type: 'point', who: 0 }
    if (/(rival|contrario|de el|del otro|para el|ellos)/.test(t)) return { type: 'point', who: 1 }
  }
  return null
}

// ---------- Motor de escucha ----------

export interface VoiceSession {
  stop(): Promise<void>
}

interface WebSpeechRecognition {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onend: (() => void) | null
  onerror: ((e: { error: string }) => void) | null
  start(): void
  stop(): void
}

function getWebSpeech(): (new () => WebSpeechRecognition) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => WebSpeechRecognition
    webkitSpeechRecognition?: new () => WebSpeechRecognition
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export async function isVoiceAvailable(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const { available } = await SpeechRecognition.available()
      return available
    } catch {
      return false
    }
  }
  return getWebSpeech() !== null
}

/**
 * Escucha continua: llama a onText con cada frase final reconocida.
 * Se reinicia sola hasta que se llame a stop().
 */
export async function startListening(
  onText: (text: string) => void,
  onError: (msg: string) => void,
  lang = 'es-ES',
): Promise<VoiceSession> {
  let active = true

  if (Capacitor.isNativePlatform()) {
    const perm = await SpeechRecognition.requestPermissions()
    if (perm.speechRecognition !== 'granted') {
      throw new Error('Permiso de micrófono denegado.')
    }

    const listener = await SpeechRecognition.addListener('partialResults', (data: { matches?: string[] }) => {
      // En Android el evento trae la mejor hipótesis en matches[0]
      const text = data.matches?.[0]
      if (text) onText(text)
    })

    const run = async () => {
      while (active) {
        try {
          await SpeechRecognition.start({
            language: lang,
            partialResults: false,
            popup: false,
          })
        } catch {
          if (active) onError('Escucha interrumpida, reintentando…')
          await new Promise((r) => setTimeout(r, 400))
        }
      }
    }
    void run()

    return {
      stop: async () => {
        active = false
        await SpeechRecognition.stop().catch(() => {})
        await listener.remove()
      },
    }
  }

  // Web (Chrome)
  const Ctor = getWebSpeech()
  if (!Ctor) throw new Error('Este navegador no soporta dictado por voz (usa Chrome o la app Android).')
  const rec = new Ctor()
  rec.lang = lang
  rec.continuous = true
  rec.interimResults = false
  rec.onresult = (e) => {
    const last = e.results[e.results.length - 1]
    if (last?.isFinal && last[0]?.transcript) onText(last[0].transcript)
  }
  rec.onerror = (e) => {
    if (e.error === 'not-allowed') onError('Permiso de micrófono denegado.')
  }
  rec.onend = () => {
    if (active) {
      try {
        rec.start() // reinicio automático
      } catch {
        /* ya arrancado */
      }
    }
  }
  rec.start()

  return {
    stop: async () => {
      active = false
      rec.stop()
    },
  }
}
