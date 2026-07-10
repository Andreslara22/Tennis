// Modelos de datos de AceCoach

export type Hand = 'diestro' | 'zurdo'
export type PlayStyle =
  | 'agresivo (saque y volea)'
  | 'de fondo (baseliner)'
  | 'contragolpeador'
  | 'todoterreno (all-court)'
  | 'sin definir'

export interface PlayerProfile {
  name: string
  /** Nivel NTRP aproximado, 1.0–7.0 */
  ntrp: number
  hand: Hand
  style: PlayStyle
  /** Objetivos que persigue el jugador */
  goals: string[]
  /** Año de nacimiento (opcional) — personaliza las zonas de FC del reloj */
  birthYear?: number
  createdAt: string
}

export type SessionType = 'entrenamiento' | 'partido'

/** Origen del registro: manual o importado de un wearable (reloj) */
export type SessionSource = 'manual' | 'wearable'

export interface MatchStats {
  /** % de primeros saques dentro (0–100) */
  firstServePct?: number
  aces?: number
  doubleFaults?: number
  winners?: number
  unforcedErrors?: number
}

export interface Session {
  id: string
  date: string // ISO
  type: SessionType
  durationMin: number
  /** Aspectos trabajados: 'derecha', 'revés', 'saque', 'volea', 'físico', etc. */
  focus: string[]
  /** Intensidad percibida 1–5 */
  intensity: number
  notes?: string
  stats?: MatchStats

  /** Datos de wearable / salud (reloj Android, banda, etc.) */
  avgHr?: number // frecuencia cardíaca media (ppm)
  maxHr?: number // frecuencia cardíaca máxima (ppm)
  calories?: number // kcal estimadas
  source?: SessionSource // por defecto 'manual'

  // Solo partidos:
  opponent?: string
  /** true = victoria, false = derrota, undefined = no aplica */
  won?: boolean
  score?: string // p.ej. "6-4 3-6 7-5"
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  at: string
}

export interface WearableSettings {
  /** Sincronización con el reloj activada */
  enabled: boolean
  /** Fecha del último sync (ISO) o null si nunca */
  lastSync: string | null
}

export interface ReminderSettings {
  enabled: boolean
  /** Días de la semana: 1=lunes … 7=domingo (formato ISO) */
  days: number[]
  /** Hora local "HH:MM" */
  time: string
}

export interface AppState {
  profile: PlayerProfile | null
  sessions: Session[]
  chat: ChatMessage[]
  /** Clave de API de Claude introducida por el usuario (guardada solo en el dispositivo) */
  apiKey: string
  /** URL de un proxy propio para el coach IA (recomendado en producción) */
  proxyUrl: string
  onboarded: boolean
  wearable: WearableSettings
  reminders: ReminderSettings
}

/** Copia de seguridad exportable (sin credenciales) */
export interface BackupFile {
  app: 'acecoach'
  version: 1
  exportedAt: string
  profile: PlayerProfile | null
  sessions: Session[]
  chat: ChatMessage[]
  wearable: WearableSettings
  reminders: ReminderSettings
}

export const FOCUS_OPTIONS = [
  'Derecha',
  'Revés',
  'Saque',
  'Resto',
  'Volea',
  'Globo / defensa',
  'Dejada',
  'Físico',
  'Táctica',
  'Mental',
] as const

export const GOAL_OPTIONS = [
  'Mejorar el saque',
  'Ganar consistencia de fondo',
  'Reducir errores no forzados',
  'Subir de nivel NTRP',
  'Mejorar la forma física',
  'Preparar un torneo',
  'Trabajar la mentalidad competitiva',
] as const
