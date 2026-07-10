import Anthropic from '@anthropic-ai/sdk'
import type { ChatMessage, PlayerProfile, Session } from '../types'
import { aggregate, ntrpLabel, type Aggregates } from '../lib/tennis'

const MODEL = 'claude-opus-4-8'

const SYSTEM_PROMPT = `Eres "AceCoach", un entrenador de tenis personal, cercano y motivador que se comunica en español.
Tu trabajo es ayudar al jugador a mejorar y a entender su progreso a partir de sus datos.

Directrices:
- Sé concreto y práctico: propón ejercicios, drills y consejos accionables, no generalidades.
- Adapta todo al nivel NTRP, la mano hábil, el estilo de juego y los objetivos del jugador.
- Apóyate en los datos que te doy (sesiones, estadísticas, racha) para personalizar la respuesta.
- Si detectas un patrón (p.ej. muchos errores no forzados o pocos primeros saques), coméntalo.
- Respuestas breves y bien estructuradas: usa listas cortas cuando ayude. Evita párrafos largos.
- Tono positivo pero honesto. Anima, pero di la verdad sobre lo que hay que mejorar.
- No inventes datos que no tienes. Si faltan datos, dilo y sugiere qué registrar.`

function buildContext(
  profile: PlayerProfile | null,
  sessions: Session[],
  agg: Aggregates,
): string {
  const lines: string[] = []
  if (profile) {
    lines.push(
      `Perfil del jugador:`,
      `- Nombre: ${profile.name || 'sin nombre'}`,
      `- Nivel NTRP: ${profile.ntrp.toFixed(1)} (${ntrpLabel(profile.ntrp)})`,
      `- Mano: ${profile.hand}`,
      `- Estilo: ${profile.style}`,
      `- Objetivos: ${profile.goals.length ? profile.goals.join(', ') : 'sin definir'}`,
    )
  }
  lines.push(
    '',
    `Resumen de actividad:`,
    `- Sesiones totales: ${agg.totalSessions} (${agg.practices} entrenamientos, ${agg.matches} partidos)`,
    `- Partidos ganados/perdidos: ${agg.wins}/${agg.losses}` +
      (agg.winRate != null ? ` (${agg.winRate.toFixed(0)}% victorias)` : ''),
    `- Minutos acumulados: ${agg.totalMinutes}`,
    `- Racha actual: ${agg.currentStreakDays} día(s) seguidos`,
  )
  if (agg.avgFirstServe != null)
    lines.push(`- Media primeros saques dentro: ${agg.avgFirstServe.toFixed(0)}%`)
  if (agg.avgWinners != null) lines.push(`- Media winners por sesión: ${agg.avgWinners.toFixed(1)}`)
  if (agg.avgUnforced != null)
    lines.push(`- Media errores no forzados por sesión: ${agg.avgUnforced.toFixed(1)}`)
  if (agg.winnersToErrors != null)
    lines.push(`- Ratio winners/errores: ${agg.winnersToErrors.toFixed(2)}`)
  if (agg.avgHr != null)
    lines.push(
      `- Datos del reloj (wearable): FC media ${agg.avgHr.toFixed(0)} ppm` +
        (agg.maxHrEver != null ? `, FC máx ${agg.maxHrEver} ppm` : '') +
        (agg.totalCalories > 0 ? `, ${agg.totalCalories} kcal acumuladas` : '') +
        ` en ${agg.wearableSessions} sesión(es) sincronizadas`,
    )

  const recent = sessions.slice(-6).reverse()
  if (recent.length) {
    lines.push('', 'Últimas sesiones (más reciente primero):')
    for (const s of recent) {
      const d = new Date(s.date).toLocaleDateString('es-ES')
      const focus = s.focus.length ? ` — trabajó: ${s.focus.join(', ')}` : ''
      const match =
        s.type === 'partido'
          ? ` vs ${s.opponent || '?'} (${s.won === true ? 'victoria' : s.won === false ? 'derrota' : '—'}${s.score ? ' ' + s.score : ''})`
          : ''
      const hr = s.avgHr ? ` · FC ${s.avgHr}ppm` : ''
      const src = s.source === 'wearable' ? ' · ⌚reloj' : ''
      lines.push(
        `- ${d} · ${s.type} · ${s.durationMin}min · intensidad ${s.intensity}/5${match}${focus}${hr}${src}`,
      )
    }
  }
  return lines.join('\n')
}

/**
 * Pide una respuesta al coach con IA. Requiere una clave de API de Anthropic.
 * ⚠️ Llamar a la API de Claude directamente desde el cliente expone la clave
 * en el dispositivo. Para producción, usar un backend/proxy (ver README).
 */
export async function getCoachReply(
  apiKey: string,
  profile: PlayerProfile | null,
  sessions: Session[],
  history: ChatMessage[],
  userMessage: string,
): Promise<string> {
  const agg = aggregate(sessions)
  const context = buildContext(profile, sessions, agg)

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const messages: Anthropic.MessageParam[] = [
    ...history.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    })),
    {
      role: 'user' as const,
      content: `${userMessage}\n\n---\nDatos actuales del jugador (para tu contexto, no los repitas literalmente):\n${context}`,
    },
  ]

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system: SYSTEM_PROMPT,
    messages,
  })

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()

  return text || 'No he podido generar una respuesta. Inténtalo de nuevo.'
}

/**
 * Coach offline (sin IA): consejos por reglas heurísticas a partir de los datos.
 * Se usa cuando no hay clave de API configurada.
 */
export function offlineCoachAdvice(profile: PlayerProfile | null, sessions: Session[]): string {
  const agg = aggregate(sessions)
  const tips: string[] = []

  if (agg.totalSessions === 0) {
    return [
      '👋 ¡Bienvenido a AceCoach!',
      '',
      'Aún no has registrado sesiones. Empieza por añadir tu primer entrenamiento o partido en la pestaña **Registrar**.',
      'Cuando tengas algunos datos podré analizar tu progreso y darte consejos personalizados.',
      '',
      '💡 Añade tu clave de API de Claude en **Ajustes** para desbloquear el coach con IA (respuestas conversacionales de verdad).',
    ].join('\n')
  }

  tips.push(`Llevas **${agg.totalSessions} sesiones** y una racha de **${agg.currentStreakDays} día(s)**. 👏`)

  if (agg.avgFirstServe != null && agg.avgFirstServe < 55) {
    tips.push(
      `Tu media de primeros saques (${agg.avgFirstServe.toFixed(0)}%) es baja. Objetivo: 60%+. Prioriza colocación sobre potencia y practica 50 saques al final de cada entreno.`,
    )
  }
  if (agg.winnersToErrors != null) {
    if (agg.winnersToErrors < 0.7) {
      tips.push(
        `Tu ratio winners/errores es ${agg.winnersToErrors.toFixed(2)} (por debajo de 1). Estás regalando puntos: juega con más margen sobre la red y reduce riesgos hasta tener la bola clara.`,
      )
    } else if (agg.winnersToErrors > 1.2) {
      tips.push(
        `Buen ratio winners/errores (${agg.winnersToErrors.toFixed(2)}). Estás siendo agresivo con criterio, sigue así.`,
      )
    }
  }
  if (agg.winRate != null) {
    if (agg.winRate < 40) {
      tips.push(
        `Tu % de victorias es ${agg.winRate.toFixed(0)}%. Analiza tus derrotas: ¿pierdes por errores propios o por winners del rival? Registra las estadísticas del partido para saberlo.`,
      )
    } else if (agg.winRate >= 60) {
      tips.push(`¡${agg.winRate.toFixed(0)}% de victorias! Vas sobrado, plantéate rivales de más nivel.`)
    }
  }

  // Datos del reloj
  if (agg.avgHr != null) {
    if (agg.avgHr < 115) {
      tips.push(
        `Tu FC media en pista es ${agg.avgHr.toFixed(0)} ppm: intensidad baja. Si buscas mejorar físico, añade drills de desplazamiento o puntos jugados a ritmo alto.`,
      )
    } else if (agg.avgHr > 155) {
      tips.push(
        `Tu FC media en pista es ${agg.avgHr.toFixed(0)} ppm: intensidad muy alta. Vigila la recuperación entre sesiones para evitar sobrecarga.`,
      )
    } else {
      tips.push(`FC media en pista: ${agg.avgHr.toFixed(0)} ppm — buena zona de trabajo. ⌚`)
    }
  }

  // Variedad de trabajo
  const focusCounts = new Map<string, number>()
  for (const s of sessions) for (const f of s.focus) focusCounts.set(f, (focusCounts.get(f) || 0) + 1)
  const worked = [...focusCounts.keys()]
  const neglected = ['Saque', 'Revés', 'Volea', 'Físico'].filter((f) => !worked.includes(f))
  if (neglected.length) {
    tips.push(`No has registrado trabajo de: ${neglected.join(', ')}. Intenta incluirlos para un juego más completo.`)
  }

  if (profile?.goals?.length) {
    tips.push(`Recuerda tus objetivos: ${profile.goals.join(', ')}. Enfoca las próximas sesiones hacia ellos.`)
  }

  tips.push('', '💡 Añade tu clave de API de Claude en **Ajustes** para un coach con IA conversacional y análisis más profundo.')

  return tips.join('\n\n')
}
