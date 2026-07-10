import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import {
  isDeuce,
  newMatch,
  pointLabels,
  pointTo,
  scoreString,
  setScore,
  type LiveScore,
} from '../lib/scoring'

interface Tally {
  aces: number
  winners: number
  doubleFaults: number
  unforcedErrors: number
}

export default function LiveMatch({ onDone }: { onDone: () => void }) {
  const { state, addSession } = useStore()
  const [opponent, setOpponent] = useState('')
  const [started, setStarted] = useState(false)
  const [score, setScoreState] = useState<LiveScore>(newMatch)
  const [history, setHistory] = useState<LiveScore[]>([])
  const [tally, setTally] = useState<Tally>({ aces: 0, winners: 0, doubleFaults: 0, unforcedErrors: 0 })
  const startedAt = useRef<number>(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!started) return
    startedAt.current = Date.now()
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 60000)), 15000)
    return () => clearInterval(t)
  }, [started])

  const point = (who: 0 | 1) => {
    if (score.finished) return
    setHistory((h) => [...h, score])
    setScoreState(pointTo(score, who))
  }

  const undo = () => {
    if (history.length === 0) return
    setScoreState(history[history.length - 1])
    setHistory((h) => h.slice(0, -1))
  }

  const bump = (k: keyof Tally) => setTally((t) => ({ ...t, [k]: t[k] + 1 }))

  const save = () => {
    const durationMin = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000))
    addSession({
      date: new Date().toISOString(),
      type: 'partido',
      durationMin,
      intensity: 4,
      focus: [],
      opponent: opponent.trim() || undefined,
      won: score.winner === 0,
      score: scoreString(score),
      notes: '🎾 Puntuado en vivo',
      stats: {
        aces: tally.aces || undefined,
        winners: tally.winners || undefined,
        doubleFaults: tally.doubleFaults || undefined,
        unforcedErrors: tally.unforcedErrors || undefined,
      },
      source: 'manual',
    })
    onDone()
  }

  const quit = () => {
    if (!started || confirm('¿Salir sin guardar el partido?')) onDone()
  }

  if (!started) {
    return (
      <div className="screen">
        <header className="topbar">
          <h1>🎾 Partido en vivo</h1>
          <button className="icon-btn" onClick={quit} aria-label="Cerrar">✖</button>
        </header>
        <div className="card">
          <label className="field">
            <span>¿Contra quién juegas?</span>
            <input
              type="text"
              placeholder="Nombre del rival"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
            />
          </label>
          <p className="muted small">
            Al mejor de 3 sets, con tie-break a 7 en 6-6. Marca cada punto y AceCoach lleva
            juegos, sets, iguales y ventajas. Al terminar se guarda como partido con su
            marcador y estadísticas.
          </p>
          <button className="btn primary big" onClick={() => setStarted(true)}>
            Empezar partido 🚀
          </button>
        </div>
      </div>
    )
  }

  const [pMe, pRival] = pointLabels(score)
  const [setsMe, setsRival] = setScore(score)
  const rivalName = opponent.trim() || 'Rival'

  return (
    <div className="screen live-screen">
      <header className="topbar">
        <h1>🎾 En juego</h1>
        <span className="muted small">{elapsed} min</span>
        <button className="icon-btn" onClick={quit} aria-label="Salir">✖</button>
      </header>

      <div className="card scoreboard">
        <div className="sb-row sb-head">
          <span></span>
          <span>Sets</span>
          <span>Juegos</span>
          <span>Puntos</span>
        </div>
        <div className="sb-row">
          <span className="sb-name me">{state.profile?.name || 'Tú'}</span>
          <span className="sb-val">{setsMe}</span>
          <span className="sb-val">{score.games[0]}</span>
          <span className="sb-val points">{pMe}</span>
        </div>
        <div className="sb-row">
          <span className="sb-name">{rivalName}</span>
          <span className="sb-val">{setsRival}</span>
          <span className="sb-val">{score.games[1]}</span>
          <span className="sb-val points">{pRival}</span>
        </div>
        <div className="sb-footer">
          {score.completedSets.length > 0 && (
            <span className="muted small">Sets: {score.completedSets.map(([a, b]) => `${a}-${b}`).join('  ')}</span>
          )}
          {score.inTiebreak && <span className="pill win">TIE-BREAK</span>}
          {isDeuce(score) && <span className="pill">IGUALES</span>}
        </div>
      </div>

      {!score.finished ? (
        <>
          <div className="point-buttons">
            <button className="btn primary point-btn" onClick={() => point(0)}>
              Punto mío 💪
            </button>
            <button className="btn ghost point-btn" onClick={() => point(1)}>
              Punto {rivalName}
            </button>
          </div>

          <button className="btn ghost" onClick={undo} disabled={history.length === 0}>
            ↩️ Deshacer último punto
          </button>

          <div className="card">
            <h2 className="section-title">Mis estadísticas (toca para sumar)</h2>
            <div className="tally-grid">
              <button className="chip" onClick={() => bump('aces')}>Ace · {tally.aces}</button>
              <button className="chip" onClick={() => bump('winners')}>Winner · {tally.winners}</button>
              <button className="chip" onClick={() => bump('doubleFaults')}>Doble falta · {tally.doubleFaults}</button>
              <button className="chip" onClick={() => bump('unforcedErrors')}>Error · {tally.unforcedErrors}</button>
            </div>
          </div>
        </>
      ) : (
        <div className="card match-end">
          <div className="match-end-emoji">{score.winner === 0 ? '🏆' : '💪'}</div>
          <h2>{score.winner === 0 ? '¡Victoria!' : 'Derrota — a por la próxima'}</h2>
          <p className="final-score">{scoreString(score)}</p>
          <button className="btn primary big" onClick={save}>
            Guardar partido ✅
          </button>
        </div>
      )}
    </div>
  )
}
