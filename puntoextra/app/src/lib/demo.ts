import type { AppState, ChatMsg, Hijo, Interaccion, Materia, Simulacro } from '../types'
import { uid } from '../types'

/**
 * Familia de ejemplo (los García) con dos semanas de actividad realista.
 * Sirve para demostrar la app poblada — a una mamá, a un aliado o a un
 * inversionista — sin capturar nada. Se borra desde Ajustes → Borrar datos.
 */

function hace(dias: number, hora = 17): string {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  d.setHours(hora, 15 + ((dias * 7) % 40), 0, 0)
  return d.toISOString()
}

export function estadoDemo(): AppState {
  const diego: Hijo = { id: uid(), nombre: 'Diego', grado: '5P', color: '#5B3DF5', puntos: 215, racha: 3, mejorRacha: 5, ultimoDiaActivo: hace(0).slice(0, 10) }
  const regina: Hijo = { id: uid(), nombre: 'Regina', grado: '2S', color: '#FF6B5E', puntos: 340, racha: 6, mejorRacha: 7, ultimoDiaActivo: hace(0).slice(0, 10) }
  const santi: Hijo = { id: uid(), nombre: 'Santi', grado: '3S', color: '#178A4C', puntos: 460, racha: 2, mejorRacha: 4, ultimoDiaActivo: hace(0).slice(0, 10) }

  const interacciones: Interaccion[] = []
  const quiz = (hijo: Hijo, dias: number, materia: Materia, tema: string, correcto: boolean) =>
    interacciones.push({ id: uid(), hijoId: hijo.id, fecha: hace(dias), tipo: 'quiz', materia, tema, correcto })
  const duda = (hijo: Hijo, dias: number, materia: Materia, tema: string) =>
    interacciones.push({ id: uid(), hijoId: hijo.id, fecha: hace(dias), tipo: 'tutor', materia, tema })

  // Diego (5º): fracciones toda la semana — se atora en equivalencias
  duda(diego, 6, 'Matemáticas', 'No entiendo las fracciones equivalentes')
  quiz(diego, 6, 'Matemáticas', 'Fracciones equivalentes', false)
  quiz(diego, 5, 'Matemáticas', 'Fracciones equivalentes', true)
  quiz(diego, 5, 'Matemáticas', 'Decimales', true)
  duda(diego, 3, 'Español', 'Palabras esdrújulas')
  quiz(diego, 3, 'Español', 'Acentuación', true)
  quiz(diego, 1, 'Matemáticas', 'Fracciones equivalentes', false)
  quiz(diego, 0, 'Matemáticas', 'Perímetro y área', true)
  duda(diego, 0, 'Ciencias', '¿Por qué se evapora el agua?')

  // Regina (2º sec): constante, racha larga
  for (let d = 6; d >= 0; d--) {
    quiz(regina, d, 'Matemáticas', d % 2 ? 'Ecuaciones de primer grado' : 'Porcentajes', d !== 4)
  }
  duda(regina, 5, 'Ciencias', 'Leyes de Newton')
  quiz(regina, 5, 'Ciencias', 'Leyes de Newton', true)
  duda(regina, 2, 'Inglés', 'Pasado simple de verbos irregulares')
  quiz(regina, 2, 'Inglés', 'Pasado simple', true)
  quiz(regina, 1, 'Historia', 'Revolución Mexicana', true)

  // Santi (3º sec, aspirante): dudas de física + dos simulacros con mejora
  duda(santi, 8, 'Matemáticas', 'Teorema de Pitágoras')
  quiz(santi, 8, 'Matemáticas', 'Teorema de Pitágoras', true)
  duda(santi, 6, 'Ciencias', 'Leyes de Newton')
  quiz(santi, 6, 'Ciencias', 'Leyes de Newton', false)
  quiz(santi, 4, 'Matemáticas', 'Jerarquía de operaciones', true)
  quiz(santi, 1, 'Matemáticas', 'Proporcionalidad', true)
  duda(santi, 0, 'Español', 'Conectores lógicos para mi ensayo')

  const simDe = (hijo: Hijo, dias: number, aciertos: number, porMateria: Simulacro['porMateria']): Simulacro => ({
    id: uid(), hijoId: hijo.id, fecha: hace(dias, 19), aciertos, total: 8, duracionSeg: 415 + dias * 9, porMateria,
  })
  const simulacros: Simulacro[] = [
    simDe(santi, 7, 5, { Matemáticas: { ok: 2, total: 3 }, Español: { ok: 1, total: 2 }, Ciencias: { ok: 1, total: 2 }, Historia: { ok: 1, total: 1 } }),
    simDe(santi, 1, 7, { Matemáticas: { ok: 3, total: 3 }, Español: { ok: 2, total: 2 }, Ciencias: { ok: 1, total: 2 }, Historia: { ok: 1, total: 1 } }),
  ]
  // registra los reactivos del último simulacro como interacciones (para la gráfica)
  quiz(santi, 1, 'Ciencias', 'La célula', false)

  const mensajes: ChatMsg[] = [
    { id: uid(), hijoId: diego.id, role: 'user', text: 'No entiendo las fracciones equivalentes 😭', fecha: hace(6) },
    { id: uid(), hijoId: diego.id, role: 'tutor', text: '¡Va, Diego! 💪 Primero dime: en tu fracción, ¿qué número va arriba (numerador) y cuál abajo (denominador)?', fecha: hace(6) },
    { id: uid(), hijoId: diego.id, role: 'user', text: 'arriba 2 y abajo 8', fecha: hace(6) },
    { id: uid(), hijoId: diego.id, role: 'tutor', text: '¡Bien! Ahora el truco: ¿hay un número que divida exactamente arriba Y abajo? Ese es el secreto para simplificar.', fecha: hace(6) },
    { id: uid(), hijoId: diego.id, role: 'user', text: 'el 2!! queda 1/4', fecha: hace(6) },
    { id: uid(), hijoId: diego.id, role: 'tutor', text: '¡Exacto! 🎉 2/8 = 1/4 — la misma cantidad con otro nombre. Te ganaste tu punto extra ✨', fecha: hace(6) },
  ]

  return {
    familia: {
      nombreTutor: 'Mariana',
      hijos: [diego, regina, santi],
      plan: 'familiar',
      fundadora: true,
      creadaEl: hace(14),
    },
    interacciones,
    mensajes,
    simulacros,
    ajustes: { apiKey: '', telefonoWhatsApp: '', recordatorio: false },
  }
}
