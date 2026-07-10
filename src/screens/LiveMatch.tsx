import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import {
  inSuperTiebreak,
  isDeuce,
  newMatch,
  pointLabels,
  pointTo,
  scoreString,
  setScore,
  type LiveScore,
} from '../lib/scoring'
import { shareMatchImage } from '../lib/shareImage'
import { isVoiceAvailable, parseCommand, startListening, type VoiceSession } from '../lib/voice'

interface Tally {
  aces: number
  winners: number
  doubleFaults: number
  unforcedErrors: number
}

export default function LiveMatch({ onDone }: { onDone: () => void }) {
  const { state, addSession } = useStore()

  // Configuración previa
  const [mode, setMode] = useState<'single' | 'doubles'>('single')
  const [opponent, setOpponent] = useState('')
  const [partner, setPartner] = useState('')
  const [rival2, setRival2] = useState('')
  const [superTb, setSuperTb] = useState(false)
  const [started, setStarted] = useState(false)

  const [score, setScoreState] = useState<LiveScore>(() => newMatch())
  const [history, setHistory] = useState<LiveScore[]>([])
  const [tally, setTally] = useState<Tally>({ aces: 0, winners: 0, doubleFaults: 0, unforcedErrors: 0 })
  const startedAt = useRef<number>(0)
  const [elapsed, setElapsed] = useState(0)
  const [shareMsg, setShareMsg] = useState<string | null>(null)

  // Dictado por voz
  const [voiceOk, setVoiceOk] = useState(false)
  const [listening, setListening] = useState(false)
  const [heard, setHeard] = useState<string | null>(null)
  const voiceRef = useRef<VoiceSession | null>(null)
  // Refs para que el callback de voz vea siempre el estado actual
  const scoreRef = useRef(score)
  scoreRef.current = score
  const historyRef = useRef(history)
  historyRef.current = history

  useEffect(() => {
    isVoiceAvailable().then(setVoiceOk).catch(() => setVoiceOk(false))
    return () => {
      voiceRef.current?.stop().catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!started) return
    startedAt.current = Date.now()
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 60000)), 15000)
    return () => clearInterval(t)
  }, [started])

  const applyVoice = (text: string) => {
    const cmd = parseCommand(text)
    if (!cmd) {
      setHeard(`🎤 "${text}" — no entendido`)
      return
    }
    const cur = scoreRef.current
    const doPoint = (who: 0 | 1) => {
      if (cur.finished) return
      setHistory((h) => [...h, cur])
      setScoreState(pointTo(cur, who))
    }
    switch (cmd.type) {
      case 'point':
        doPoint(cmd.who)
        setHeard(`🎤 Punto ${cmd.who === 0 ? 'tuyo' : 'del rival'}`)
        break
      case 'ace':
        setTally((t) => ({ ...t, aces: t.aces + 1 }))
        doPoint(0)
        setHeard('🎤 Ace: +1 y punto tuyo')
        break
      case 'winner':
        setTally((t) => ({ ...t, winners: t.winners + 1 }))
        doPoint(0)
        setHeard('🎤 Winner: +1 y punto tuyo')
        break
      case 'doubleFault':
        setTally((t) => ({ ...t, doubleFaults: t.doubleFaults + 1 }))
        doPoint(1)
        setHeard('🎤 Doble falta: +1 y punto rival')
        break
      case 'unforcedError':
        setTally((t) => ({ ...t, unforcedErrors: t.unforcedErrors + 1 }))
        doPoint(1)
        setHeard('🎤 Error: +1 y punto rival')
        break
      case 'undo': {
        const h = historyRef.current
        if (h.length > 0) {
          setScoreState(h[h.length - 1])
          setHistory(h.slice(0, -1))
          setHeard('🎤 Punto deshecho')
        }
        break
      }
    }
  }

  const toggleVoice = async () => {
    if (listening) {
      await voiceRef.current?.stop().catch(() => {})
      voiceRef.current = null
      setListening(false)
      setHeard(null)
      return
    }
    try {
      voiceRef.current = await startListening(applyVoice, (msg) => setHeard(`🎤 ${msg}`))
      setListening(true)
      setHeard('🎤 Escuchando… di "punto mío", "ace", "winner", "error", "doble falta"…')
    } catch (e) {
      setHeard(`🎤 ${e instanceof Error ? e.message : 'No disponible'}`)
    }
  }

  const start = () => {
    setScoreState(newMatch(superTb))
    setStarted(true)
  }

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

  const doubles = mode === 'doubles'
  const rivalName = doubles
    ? [opponent.trim() || 'Rival 1', rival2.trim() || 'Rival 2'].join(' y ')
    : opponent.trim() || 'Rival'
  const meLabel = doubles
    ? `${state.profile?.name || 'Tú'}${partner.trim() ? ` y ${partner.trim()}` : ' y pareja'}`
    : state.profile?.name || 'Tú'

  const save = () => {
    const durationMin = Math.max(1, Math.round((Date.now() - startedAt.current) / 60000))
    addSession({
      date: new Date().toISOString(),
      type: 'partido',
      durationMin,
      intensity: 4,
      focus: [],
      opponent: rivalName,
      won: score.winner === 0,
      score: scoreString(score),
      notes: doubles ? '🎾 Dobles · puntuado en vivo' : '🎾 Puntuado en vivo',
      doubles: doubles || undefined,
      partner: doubles ? partner.trim() || undefined : undefined,
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

  const share = async () => {
    setShareMsg(null)
    try {
      const how = await shareMatchImage({
        me: state.profile?.name || 'Yo',
        partner: doubles ? partner.trim() || 'pareja' : undefined,
        rival: rivalName,
        won: score.winner === 0,
        score: scoreString(score),
        date: new Date().toISOString(),
        doubles,
      })
      setShareMsg(how === 'downloaded' ? '✅ Imagen descargada.' : null)
    } catch {
      setShareMsg('⚠️ No se pudo generar la imagen.')
    }
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

        <div className="segmented">
          <button className={mode === 'single' ? 'on' : ''} onClick={() => { setMode('single'); setSuperTb(false) }}>
            👤 Individual
          </button>
          <button className={mode === 'doubles' ? 'on' : ''} onClick={() => { setMode('doubles'); setSuperTb(true) }}>
            👥 Dobles
          </button>
        </div>

        <div className="card">
          {doubles && (
            <label className="field">
              <span>Tu pareja</span>
              <input
                type="text"
                placeholder="Nombre de tu pareja"
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
              />
            </label>
          )}
          <label className="field">
            <span>{doubles ? 'Rival 1' : '¿Contra quién juegas?'}</span>
            <input
              type="text"
              placeholder="Nombre del rival"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
            />
          </label>
          {doubles && (
            <label className="field">
              <span>Rival 2</span>
              <input
                type="text"
                placeholder="Nombre del otro rival"
                value={rival2}
                onChange={(e) => setRival2(e.target.value)}
              />
            </label>
          )}

          <label className="switch-row">
            <span>3er set: súper tie-break a 10</span>
            <input type="checkbox" checked={superTb} onChange={(e) => setSuperTb(e.target.checked)} />
          </label>

          <p className="muted small">
            Al mejor de 3 sets, tie-break a 7 en 6-6
            {superTb ? ' y súper tie-break a 10 como set decisivo' : ''}. Marca cada punto y
            AceCoach lleva juegos, sets, iguales y ventajas.
          </p>
          <button className="btn primary big" onClick={start}>
            Empezar partido 🚀
          </button>
        </div>
      </div>
    )
  }

  const [pMe, pRival] = pointLabels(score)
  const [setsMe, setsRival] = setScore(score)

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
          <span className="sb-name me">{meLabel}</span>
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
          {!score.finished && inSuperTiebreak(score) && <span className="pill win">SÚPER TB a 10</span>}
          {score.inTiebreak && !inSuperTiebreak(score) && <span className="pill win">TIE-BREAK</span>}
          {isDeuce(score) && <span className="pill">IGUALES</span>}
        </div>
      </div>

      {!score.finished ? (
        <>
          <div className="point-buttons">
            <button className="btn primary point-btn" onClick={() => point(0)}>
              {doubles ? 'Punto nuestro 💪' : 'Punto mío 💪'}
            </button>
            <button className="btn ghost point-btn" onClick={() => point(1)}>
              Punto rival
            </button>
          </div>

          <div className="row2">
            <button className="btn ghost" onClick={undo} disabled={history.length === 0}>
              ↩️ Deshacer
            </button>
            {voiceOk && (
              <button className={`btn ${listening ? 'primary' : 'ghost'}`} onClick={toggleVoice}>
                {listening ? '🎤 Escuchando…' : '🎤 Dictar por voz'}
              </button>
            )}
          </div>
          {heard && <p className="muted small voice-heard">{heard}</p>}

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
          <div className="row2 full-width">
            <button className="btn ghost" onClick={share}>
              📤 Compartir
            </button>
            <button className="btn primary" onClick={save}>
              Guardar ✅
            </button>
          </div>
          {shareMsg && <p className="muted small">{shareMsg}</p>}
        </div>
      )}
    </div>
  )
}
