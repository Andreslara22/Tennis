/**
 * Motor de puntuación de tenis — partido en vivo.
 *
 * Reglas: al mejor de 3 sets, tie-break a 7 (diferencia de 2) en 6-6.
 * Jugador 0 = tú, jugador 1 = rival.
 */

export interface LiveScore {
  /** Sets terminados como [tusJuegos, susJuegos] */
  completedSets: Array<[number, number]>
  /** Juegos del set actual */
  games: [number, number]
  /** Puntos del juego actual (enteros; en tie-break son puntos directos) */
  points: [number, number]
  inTiebreak: boolean
  finished: boolean
  winner: 0 | 1 | null
  /** 3er set como súper tie-break a 10 (habitual en dobles) */
  superTb: boolean
}

export function newMatch(superTb = false): LiveScore {
  return {
    completedSets: [],
    games: [0, 0],
    points: [0, 0],
    inTiebreak: false,
    finished: false,
    winner: null,
    superTb,
  }
}

/** ¿Estamos en el súper tie-break decisivo (3er set a 10)? */
export function inSuperTiebreak(s: LiveScore): boolean {
  return s.superTb && s.completedSets.length === 2 && !s.finished
}

const SETS_TO_WIN = 2

function setsWon(s: LiveScore, who: 0 | 1): number {
  return s.completedSets.filter((set) => (who === 0 ? set[0] > set[1] : set[1] > set[0])).length
}

/** Registra un punto para `who` y devuelve el nuevo estado (inmutable). */
export function pointTo(state: LiveScore, who: 0 | 1): LiveScore {
  if (state.finished) return state
  const s: LiveScore = {
    ...state,
    completedSets: state.completedSets.map((x) => [...x] as [number, number]),
    games: [...state.games] as [number, number],
    points: [...state.points] as [number, number],
  }
  const other = (1 - who) as 0 | 1

  // 3er set decisivo como súper tie-break a 10 (si está activado)
  const superFinal = s.superTb && s.completedSets.length === 2
  if (superFinal) s.inTiebreak = true

  s.points[who]++

  const p = s.points[who]
  const q = s.points[other]

  const tbTarget = superFinal ? 10 : 7
  const gameWon = s.inTiebreak ? p >= tbTarget && p - q >= 2 : p >= 4 && p - q >= 2

  if (!gameWon) return s

  if (superFinal) {
    // El súper tie-break se registra con sus puntos (p.ej. 10-7) y decide el partido
    s.completedSets.push([s.points[0], s.points[1]])
    s.points = [0, 0]
    s.games = [0, 0]
    s.inTiebreak = false
    s.finished = true
    s.winner = who
    return s
  }

  // Juego ganado
  s.games[who]++
  s.points = [0, 0]

  const g = s.games[who]
  const h = s.games[other]
  const setWon = s.inTiebreak ? true : g >= 6 && g - h >= 2

  if (!setWon) {
    if (g === 6 && h === 6) s.inTiebreak = true
    return s
  }

  // Set ganado
  s.completedSets.push([s.games[0], s.games[1]])
  s.games = [0, 0]
  s.inTiebreak = false

  if (setsWon(s, who) >= SETS_TO_WIN) {
    s.finished = true
    s.winner = who
  }
  return s
}

/** Marcador del punto actual para mostrar: '0' | '15' | '30' | '40' | 'Ad' (o números en tie-break). */
export function pointLabels(s: LiveScore): [string, string] {
  if (s.inTiebreak) return [String(s.points[0]), String(s.points[1])]
  const MAP = ['0', '15', '30', '40']
  const [a, b] = s.points
  if (a >= 3 && b >= 3) {
    if (a === b) return ['40', '40'] // iguales (deuce)
    return a > b ? ['Ad', '40'] : ['40', 'Ad']
  }
  return [MAP[Math.min(a, 3)], MAP[Math.min(b, 3)]]
}

/** ¿Iguales (deuce)? */
export function isDeuce(s: LiveScore): boolean {
  return !s.inTiebreak && s.points[0] >= 3 && s.points[0] === s.points[1]
}

/** Marcador completo tipo "6-4 3-6 7-6" desde tu perspectiva (incluye el set en curso si hay juegos). */
export function scoreString(s: LiveScore): string {
  const parts = s.completedSets.map(([a, b]) => `${a}-${b}`)
  if (!s.finished && (s.games[0] > 0 || s.games[1] > 0)) {
    parts.push(`${s.games[0]}-${s.games[1]}`)
  }
  return parts.join(' ')
}

/** Sets ganados [tú, rival] */
export function setScore(s: LiveScore): [number, number] {
  return [setsWon(s, 0), setsWon(s, 1)]
}
