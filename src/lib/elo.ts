import type { Session } from '../types'

/**
 * Escalera de rivales — ranking ELO local.
 *
 * Se calcula a partir de tus partidos registrados: tú y cada rival empezáis
 * con 1000 puntos y cada resultado transfiere puntos según lo esperado
 * (ganar a alguien con más ELO da más puntos). Todo local, sin servidores.
 */

export interface LadderEntry {
  name: string
  elo: number
  wins: number
  losses: number
  played: number
  isPlayer: boolean
}

const START_ELO = 1000
const K = 32

function expected(a: number, b: number): number {
  return 1 / (1 + Math.pow(10, (b - a) / 400))
}

export function computeLadder(sessions: Session[], playerName: string): LadderEntry[] {
  const matches = sessions
    .filter((s) => s.type === 'partido' && s.opponent?.trim() && s.won !== undefined)
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))

  if (matches.length === 0) return []

  const elo = new Map<string, number>()
  const wins = new Map<string, number>()
  const losses = new Map<string, number>()
  const PLAYER = '__player__'
  elo.set(PLAYER, START_ELO)

  for (const m of matches) {
    const rival = m.opponent!.trim()
    if (!elo.has(rival)) elo.set(rival, START_ELO)

    const rp = elo.get(PLAYER)!
    const rr = elo.get(rival)!
    const scorePlayer = m.won ? 1 : 0

    elo.set(PLAYER, rp + K * (scorePlayer - expected(rp, rr)))
    elo.set(rival, rr + K * (1 - scorePlayer - expected(rr, rp)))

    if (m.won) {
      wins.set(PLAYER, (wins.get(PLAYER) || 0) + 1)
      losses.set(rival, (losses.get(rival) || 0) + 1)
    } else {
      losses.set(PLAYER, (losses.get(PLAYER) || 0) + 1)
      wins.set(rival, (wins.get(rival) || 0) + 1)
    }
  }

  const entries: LadderEntry[] = [...elo.entries()].map(([key, rating]) => ({
    name: key === PLAYER ? playerName || 'Tú' : key,
    elo: Math.round(rating),
    wins: wins.get(key) || 0,
    losses: losses.get(key) || 0,
    played: (wins.get(key) || 0) + (losses.get(key) || 0),
    isPlayer: key === PLAYER,
  }))

  return entries.sort((a, b) => b.elo - a.elo)
}
