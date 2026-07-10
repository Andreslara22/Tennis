import type { ChatMsg, Hijo } from '../types'
import { labelGrado, nivelDeGrado } from '../types'

/**
 * Tutor socrático de Cae el Veinte.
 *
 * Con clave de API responde con Claude (modo tutor: guía paso a paso, jamás
 * da la respuesta directa). Sin clave funciona en modo offline con guía por
 * reglas — suficiente para probar el flujo completo del MVP.
 *
 * Nota de producción: la clave nunca debe vivir en el cliente; este módulo
 * se apunta a un backend/proxy propio antes de publicar (igual que el
 * reporte y el banco de quizzes).
 */

const SYSTEM = (hijo: Hijo) => `Eres el tutor de Cae el Veinte, un servicio mexicano de apoyo escolar.
Tu alumno es ${hijo.nombre}, de ${labelGrado(hijo.grado)} (temario SEP).

Reglas de oro (NUNCA las rompas):
1. JAMÁS des la respuesta final ni resuelvas el ejercicio completo. Guía paso a paso con preguntas (método socrático).
2. Un paso a la vez: haz UNA pregunta guía y espera su respuesta.
3. Habla en español mexicano, cálido y breve (máximo 4 oraciones), con emojis con moderación.
4. Adapta el nivel al grado del alumno; usa ejemplos cotidianos (pizzas, canchas, mandado).
5. Celebra los aciertos y trata los errores como pistas ("¡casi!, revisa el signo…").
6. Si pide la respuesta directa, recuérdale con cariño que aprender es el trato, y dale una pista más.
7. Solo temas escolares; si pregunta otra cosa, redirígelo amablemente a su tarea.`

export async function preguntarTutor(
  hijo: Hijo,
  historial: ChatMsg[],
  apiKey: string,
): Promise<string> {
  if (!apiKey) return tutorOffline(hijo, historial)
  try {
    const messages = historial.slice(-12).map((m) => ({
      role: m.role === 'tutor' ? 'assistant' : 'user',
      content: m.text,
    }))
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 400,
        system: SYSTEM(hijo),
        messages,
      }),
    })
    if (!res.ok) throw new Error(`API ${res.status}`)
    const data = await res.json()
    const texto = (data.content ?? [])
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('\n')
      .trim()
    return texto || tutorOffline(hijo, historial)
  } catch {
    return tutorOffline(hijo, historial) + '\n\n_(sin conexión con la IA — te guío en modo básico)_'
  }
}

// ─────────────────────────────────────────────────────────────
// Modo offline: guía socrática por reglas, por materia detectada
// ─────────────────────────────────────────────────────────────

interface Guia {
  claves: RegExp
  pasos: string[]
}

const GUIAS: Guia[] = [
  {
    claves: /fracci|quebrad|numerador|denominador/i,
    pasos: [
      'Va 💪 Primero dime: ¿qué número es el numerador (arriba) y cuál el denominador (abajo) en tu fracción?',
      '¡Bien! Ahora: ¿hay algún número que divida exactamente arriba Y abajo? Ese es el truco para simplificar.',
      '¿Ya las dejaste con el mismo denominador? Si sí, solo trabajas con los de arriba. Inténtalo y me dices qué te sale.',
    ],
  },
  {
    claves: /ecuaci|despej|incógnit|álgebra|algebra|\bx\b/i,
    pasos: [
      'Vamos por partes 🧩 ¿Qué es lo que está "estorbando" junto a la x? Eso es lo primero que pasamos al otro lado (con la operación contraria).',
      '¡Eso! Ahora la x quedó multiplicada o dividida por algo, ¿verdad? Haz la operación contraria en ambos lados.',
      'Último paso: sustituye tu resultado en la ecuación original. ¿Se cumple la igualdad? Si sí, ¡lo lograste tú solito! 🎉',
    ],
  },
  {
    claves: /porcentaje|%|descuento|iva/i,
    pasos: [
      'Truco de tutor 💡 Empieza siempre por el 10%: ¿cuánto es el 10% de tu cantidad? (Solo recorre el punto decimal.)',
      '¡Bien! Ahora arma el porcentaje que te piden con pedazos de 10% y de 5%. ¿Cuántos necesitas?',
      'Suma tus pedazos y dime qué te sale. Luego pregúntate: ¿el resultado suena lógico comparado con el total?',
    ],
  },
  {
    claves: /área|area|perímetro|perimetro|triángulo|triangulo|rectángulo|rectangulo|círculo|circulo/i,
    pasos: [
      'Primero lo primero 📐 ¿Qué figura es y qué te piden: el contorno (perímetro) o lo que cabe adentro (área)?',
      'Bien. ¿Qué fórmula corresponde? Escríbela antes de poner números — esa es la mitad del examen.',
      'Ahora sustituye los valores con calma, con sus unidades (cm o cm²). ¿Qué resultado te da?',
    ],
  },
  {
    claves: /acent|tilde|sílaba|silaba|esdrújula|esdrujula|aguda|grave/i,
    pasos: [
      'Hagámoslo con música 🎵 Separa la palabra en sílabas con palmadas. ¿Cuántas te salen?',
      '¿En cuál sílaba suena más fuerte? Cuenta desde el final: última = aguda, penúltima = grave, antepenúltima = esdrújula.',
      'Ya que sabes qué tipo es, aplica su regla de tilde. ¿Lleva o no lleva? ¿Por qué?',
    ],
  },
  {
    claves: /newton|fuerza|velocidad|aceleraci|física|fisica/i,
    pasos: [
      'Física sin miedo 🚀 Primero: ¿qué datos te da el problema y qué te pide? Escríbelos con sus unidades.',
      '¿Qué fórmula conecta esos datos con lo que buscas? (Pista: si hay fuerza y masa, piensa en F = m·a.)',
      'Sustituye y resuelve. Al final revisa: ¿las unidades del resultado tienen sentido?',
    ],
  },
  {
    claves: /english|inglés|ingles|verb|past|present/i,
    pasos: [
      "Let's go! 🇬🇧 ¿La oración habla de ahora (present) o de ayer (past)? Esa es la primera decisión.",
      '¿Tu verbo es regular (termina en -ed en pasado) o irregular (cambia de forma, como go → went)?',
      'Arma la oración y léela en voz alta. ¿Suena como algo que dirías? Escríbemela y la revisamos juntos.',
    ],
  },
]

const GENERICO = [
  '¡Va! 💪 Cuéntame: ¿qué es exactamente lo que te piden? Dímelo con tus palabras, sin ver el libro.',
  'Bien. ¿Qué datos o información tienes para lograrlo? Haz tu lista.',
  '¿Qué paso se te ocurre dar primero? No importa equivocarse — inténtalo y me cuentas qué salió.',
  '¡Así se hace! Revisa tu resultado: ¿tiene lógica? Si sí, explícame cómo llegaste — si me lo puedes explicar, ya lo dominas 🎉',
]

export function tutorOffline(hijo: Hijo, historial: ChatMsg[]): string {
  const miosUser = historial.filter((m) => m.role === 'user')
  const ultima = miosUser[miosUser.length - 1]?.text ?? ''
  const guia = GUIAS.find((g) => g.claves.test(ultima)) ?? GUIAS.find((g) => miosUser.some((m) => g.claves.test(m.text)))

  // ¿Pidió la respuesta directa?
  if (/dame la respuesta|cu[aá]l es la respuesta|resu[eé]lvelo|hazme la tarea/i.test(ultima)) {
    return `Jaja buen intento, ${hijo.nombre} 😄 Pero el trato es que TÚ aprendas. Te doy una pista más: vuelve a leer el problema y dime qué es lo que te piden encontrar.`
  }

  const pasos = guia?.pasos ?? GENERICO
  // avanza un paso por cada mensaje del alumno dentro del tema
  const idx = Math.min(miosUser.length - 1, pasos.length - 1)
  const saludo = miosUser.length === 1 ? `¡Hola ${hijo.nombre}! ` : ''
  const nivel = nivelDeGrado(hijo.grado)
  const extra = idx === pasos.length - 1 && nivel !== 'PB' ? '\n\nCuando termines, hay un quiz del día esperándote para reforzar 🏅' : ''
  return saludo + pasos[idx] + extra
}
