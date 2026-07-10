import { useState } from 'react'
import { useStore } from '../store'
import { FOCUS_OPTIONS, type MatchStats, type SessionType } from '../types'

function todayISO(): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

export default function LogSession({ onDone }: { onDone: () => void }) {
  const { addSession } = useStore()
  const [type, setType] = useState<SessionType>('entrenamiento')
  const [date, setDate] = useState(todayISO())
  const [duration, setDuration] = useState(60)
  const [intensity, setIntensity] = useState(3)
  const [focus, setFocus] = useState<string[]>([])
  const [notes, setNotes] = useState('')

  // Partido
  const [opponent, setOpponent] = useState('')
  const [won, setWon] = useState<boolean | undefined>(undefined)
  const [score, setScore] = useState('')

  // Estadísticas (opcionales)
  const [showStats, setShowStats] = useState(false)
  const [firstServe, setFirstServe] = useState('')
  const [aces, setAces] = useState('')
  const [doubleFaults, setDoubleFaults] = useState('')
  const [winners, setWinners] = useState('')
  const [unforced, setUnforced] = useState('')

  const toggleFocus = (f: string) =>
    setFocus((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]))

  const num = (s: string): number | undefined => {
    const n = parseFloat(s)
    return Number.isFinite(n) ? n : undefined
  }

  const save = () => {
    const stats: MatchStats = {
      firstServePct: num(firstServe),
      aces: num(aces),
      doubleFaults: num(doubleFaults),
      winners: num(winners),
      unforcedErrors: num(unforced),
    }
    const hasStats = Object.values(stats).some((v) => v !== undefined)

    addSession({
      date: new Date(date + 'T12:00:00').toISOString(),
      type,
      durationMin: duration,
      intensity,
      focus,
      notes: notes.trim() || undefined,
      stats: hasStats ? stats : undefined,
      opponent: type === 'partido' ? opponent.trim() || undefined : undefined,
      won: type === 'partido' ? won : undefined,
      score: type === 'partido' ? score.trim() || undefined : undefined,
    })
    onDone()
  }

  return (
    <div className="screen">
      <header className="topbar">
        <h1>Registrar sesión</h1>
      </header>

      <div className="segmented">
        <button
          className={type === 'entrenamiento' ? 'on' : ''}
          onClick={() => setType('entrenamiento')}
        >
          🏸 Entrenamiento
        </button>
        <button className={type === 'partido' ? 'on' : ''} onClick={() => setType('partido')}>
          🎯 Partido
        </button>
      </div>

      <div className="card">
        <div className="row2">
          <label className="field">
            <span>Fecha</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label className="field">
            <span>Duración (min)</span>
            <input
              type="number"
              min={5}
              step={5}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value || '0', 10))}
            />
          </label>
        </div>

        <label className="field">
          <span>
            Intensidad: <strong>{intensity}/5</strong>
          </span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
          />
        </label>

        <div className="field">
          <span>¿Qué trabajaste?</span>
          <div className="chips">
            {FOCUS_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                className={`chip ${focus.includes(f) ? 'on' : ''}`}
                onClick={() => toggleFocus(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {type === 'partido' && (
        <div className="card">
          <label className="field">
            <span>Rival</span>
            <input
              type="text"
              placeholder="Nombre del rival"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
            />
          </label>
          <div className="field">
            <span>Resultado</span>
            <div className="segmented small">
              <button className={won === true ? 'on win' : ''} onClick={() => setWon(true)}>
                Victoria
              </button>
              <button className={won === false ? 'on loss' : ''} onClick={() => setWon(false)}>
                Derrota
              </button>
            </div>
          </div>
          <label className="field">
            <span>Marcador</span>
            <input
              type="text"
              placeholder="p.ej. 6-4 3-6 7-5"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
          </label>
        </div>
      )}

      <div className="card">
        <button className="collapse-toggle" onClick={() => setShowStats((v) => !v)}>
          📊 Estadísticas (opcional) {showStats ? '▲' : '▼'}
        </button>
        {showStats && (
          <div className="stats-grid">
            <StatInput label="1º saque %" value={firstServe} onChange={setFirstServe} />
            <StatInput label="Aces" value={aces} onChange={setAces} />
            <StatInput label="Dobles faltas" value={doubleFaults} onChange={setDoubleFaults} />
            <StatInput label="Winners" value={winners} onChange={setWinners} />
            <StatInput label="Errores no forzados" value={unforced} onChange={setUnforced} />
          </div>
        )}
      </div>

      <label className="field card">
        <span>Notas</span>
        <textarea
          rows={3}
          placeholder="¿Cómo te sentiste? ¿Qué aprendiste?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      <button className="btn primary big" onClick={save}>
        Guardar sesión ✅
      </button>
    </div>
  )
}

function StatInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        placeholder="—"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
