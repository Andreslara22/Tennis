/** Modelos de datos de Punto Extra */

export type Grado =
  | '1P' | '2P' | '3P' | '4P' | '5P' | '6P'
  | '1S' | '2S' | '3S'
  | '1PR' | '2PR' | '3PR'

export const GRADOS: { id: Grado; label: string }[] = [
  { id: '1P', label: '1º de primaria' },
  { id: '2P', label: '2º de primaria' },
  { id: '3P', label: '3º de primaria' },
  { id: '4P', label: '4º de primaria' },
  { id: '5P', label: '5º de primaria' },
  { id: '6P', label: '6º de primaria' },
  { id: '1S', label: '1º de secundaria' },
  { id: '2S', label: '2º de secundaria' },
  { id: '3S', label: '3º de secundaria' },
  { id: '1PR', label: '1º de prepa' },
  { id: '2PR', label: '2º de prepa' },
  { id: '3PR', label: '3º de prepa' },
]

/** Nivel didáctico agregado, usado por el banco de quizzes y el tutor. */
export type Nivel = 'PB' | 'PA' | 'SEC' | 'PREPA'

export function nivelDeGrado(g: Grado): Nivel {
  if (g === '1P' || g === '2P' || g === '3P') return 'PB'
  if (g === '4P' || g === '5P' || g === '6P') return 'PA'
  if (g === '1S' || g === '2S' || g === '3S') return 'SEC'
  return 'PREPA'
}

export function labelGrado(g: Grado): string {
  return GRADOS.find((x) => x.id === g)?.label ?? g
}

export type Materia = 'Matemáticas' | 'Español' | 'Ciencias' | 'Historia' | 'Inglés'

export const MATERIAS: Materia[] = ['Matemáticas', 'Español', 'Ciencias', 'Historia', 'Inglés']

export interface Hijo {
  id: string
  nombre: string
  grado: Grado
  color: string // color de avatar
  puntos: number
  racha: number // días seguidos con actividad
  mejorRacha: number
  ultimoDiaActivo: string | null // YYYY-MM-DD
}

export type Plan = 'ninguno' | 'individual' | 'familiar' | 'anual'

export interface Familia {
  nombreTutor: string // mamá / papá
  hijos: Hijo[]
  plan: Plan
  fundadora: boolean
  creadaEl: string
}

/** Registro de actividad: cada pregunta al tutor o pregunta de quiz respondida. */
export interface Interaccion {
  id: string
  hijoId: string
  fecha: string // ISO
  tipo: 'tutor' | 'quiz'
  materia: Materia
  tema: string
  correcto?: boolean // solo quiz
}

export interface ChatMsg {
  id: string
  hijoId: string
  role: 'user' | 'tutor'
  text: string
  fecha: string
}

export interface Simulacro {
  id: string
  hijoId: string
  fecha: string // ISO
  aciertos: number
  total: number
  duracionSeg: number // tiempo usado
  porMateria: Record<string, { ok: number; total: number }>
}

export interface Ajustes {
  apiKey: string // clave Anthropic opcional (el tutor funciona offline sin ella)
  telefonoWhatsApp: string // a dónde se manda el reporte
}

export interface AppState {
  familia: Familia | null
  interacciones: Interaccion[]
  mensajes: ChatMsg[]
  simulacros: Simulacro[]
  ajustes: Ajustes
}

export const PLANES: { id: Plan; nombre: string; precio: string; nota: string }[] = [
  { id: 'individual', nombre: 'Individual', precio: '$79/mes', nota: '1 hijo' },
  { id: 'familiar', nombre: 'Familiar', precio: '$99/mes', nota: 'Hasta 4 hijos · el favorito' },
  { id: 'anual', nombre: 'Familiar anual', precio: '$899/año', nota: '≈ $75/mes · pagable en OXXO' },
]

export const AVATAR_COLORS = ['#5B3DF5', '#FF6B5E', '#178A4C', '#E0861A', '#0E7490', '#C026D3']

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export function hoy(): string {
  return new Date().toISOString().slice(0, 10)
}
