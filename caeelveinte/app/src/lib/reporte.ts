import type { Familia, Hijo, Interaccion, Materia } from '../types'
import { labelGrado } from '../types'

/** Estadísticas semanales por hijo — el corazón del "reporte del domingo". */
export interface ReporteHijo {
  hijo: Hijo
  ejercicios: number
  preguntasTutor: number
  diasActivo: number
  materias: Materia[]
  aciertos: number
  intentos: number
  temasAtorados: string[] // temas con más errores de quiz esta semana
}

const SEMANA_MS = 7 * 86400000

export function interaccionesSemana(interacciones: Interaccion[]): Interaccion[] {
  const desde = Date.now() - SEMANA_MS
  return interacciones.filter((i) => new Date(i.fecha).getTime() >= desde)
}

export function reporteSemanal(familia: Familia, interacciones: Interaccion[]): ReporteHijo[] {
  const semana = interaccionesSemana(interacciones)
  return familia.hijos.map((hijo) => {
    const mias = semana.filter((i) => i.hijoId === hijo.id)
    const quiz = mias.filter((i) => i.tipo === 'quiz')
    const dias = new Set(mias.map((i) => i.fecha.slice(0, 10)))
    const materias = [...new Set(mias.map((i) => i.materia))]

    const erroresPorTema = new Map<string, number>()
    for (const q of quiz) {
      if (q.correcto === false) erroresPorTema.set(q.tema, (erroresPorTema.get(q.tema) ?? 0) + 1)
    }
    const temasAtorados = [...erroresPorTema.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([tema]) => tema)

    return {
      hijo,
      ejercicios: quiz.length,
      preguntasTutor: mias.filter((i) => i.tipo === 'tutor').length,
      diasActivo: dias.size,
      materias,
      aciertos: quiz.filter((q) => q.correcto).length,
      intentos: quiz.length,
      temasAtorados,
    }
  })
}

/** Texto del reporte listo para compartir por WhatsApp a mamá/papá. */
export function reporteTexto(familia: Familia, reportes: ReporteHijo[]): string {
  const lineas: string[] = [`📊 *Reporte semanal Cae el Veinte* · Familia de ${familia.nombreTutor}`, '']
  for (const r of reportes) {
    lineas.push(`*${r.hijo.nombre}* (${labelGrado(r.hijo.grado)})`)
    if (r.ejercicios + r.preguntasTutor === 0) {
      lineas.push('· Sin actividad esta semana 😴 — ¡anímalo a mandar su primera duda!')
    } else {
      lineas.push(`· ${r.ejercicios} ejercicios y ${r.preguntasTutor} dudas al tutor, ${r.diasActivo} día(s) activo`)
      if (r.intentos > 0) lineas.push(`· Aciertos: ${r.aciertos}/${r.intentos}`)
      if (r.materias.length) lineas.push(`· Practicó: ${r.materias.join(', ')}`)
      if (r.temasAtorados.length) lineas.push(`· ⚠️ Se atora en: ${r.temasAtorados.join(' y ')}`)
      if (r.hijo.racha > 1) lineas.push(`· 🔥 Racha de ${r.hijo.racha} días`)
    }
    lineas.push('')
  }
  lineas.push('_Cae el Veinte — el tutor de toda la familia_')
  return lineas.join('\n')
}

export function linkWhatsApp(telefono: string, texto: string): string {
  const num = telefono.replace(/\D/g, '')
  const base = num ? `https://wa.me/${num}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(texto)}`
}
