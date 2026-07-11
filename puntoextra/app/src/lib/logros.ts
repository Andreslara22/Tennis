import type { Hijo, Interaccion, Simulacro } from '../types'

/** Medallas por hijo, derivadas del estado (sin almacenamiento extra). */
export interface Logro {
  id: string
  emoji: string
  titulo: string
  desc: string
  ganado: boolean
}

export function logrosDeHijo(hijo: Hijo, interacciones: Interaccion[], simulacros: Simulacro[]): Logro[] {
  const mias = interacciones.filter((i) => i.hijoId === hijo.id)
  const quiz = mias.filter((i) => i.tipo === 'quiz')
  const aciertos = quiz.filter((q) => q.correcto).length
  const materias = new Set(mias.map((i) => i.materia))
  const misSim = simulacros.filter((s) => s.hijoId === hijo.id)

  return [
    { id: 'primera', emoji: '🌱', titulo: 'Primera duda', desc: 'Preguntó al tutor por primera vez', ganado: mias.some((i) => i.tipo === 'tutor') },
    { id: 'diez', emoji: '🏅', titulo: '10 ejercicios', desc: 'Respondió 10 preguntas de quiz', ganado: quiz.length >= 10 },
    { id: 'certero', emoji: '🎯', titulo: '5 a la primera', desc: '5 aciertos al primer intento', ganado: aciertos >= 5 },
    { id: 'racha3', emoji: '🔥', titulo: 'Racha de 3', desc: '3 días seguidos estudiando', ganado: hijo.mejorRacha >= 3 },
    { id: 'racha7', emoji: '🚀', titulo: 'Semana perfecta', desc: '7 días seguidos estudiando', ganado: hijo.mejorRacha >= 7 },
    { id: 'multi', emoji: '🌈', titulo: 'Todólogo', desc: 'Practicó 3 materias distintas', ganado: materias.size >= 3 },
    { id: 'sim', emoji: '⏱️', titulo: 'Primer simulacro', desc: 'Terminó un simulacro cronometrado', ganado: misSim.length > 0 },
    { id: 'sim-mejora', emoji: '📈', titulo: 'En ascenso', desc: 'Mejoró su marca en el simulacro', ganado: misSim.length >= 2 && misSim[misSim.length - 1].aciertos > misSim[0].aciertos },
  ]
}

/** Actividad de los últimos 7 días (para la gráfica del reporte). Devuelve [hace 6 días … hoy]. */
export function actividad7Dias(hijoId: string, interacciones: Interaccion[]): number[] {
  const dias: number[] = Array(7).fill(0)
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  for (const i of interacciones) {
    if (i.hijoId !== hijoId) continue
    const f = new Date(i.fecha)
    f.setHours(0, 0, 0, 0)
    const diff = Math.round((hoy.getTime() - f.getTime()) / 86400000)
    if (diff >= 0 && diff < 7) dias[6 - diff]++
  }
  return dias
}
