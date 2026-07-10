import { useState } from 'react'
import { useStore } from '../store'
import { GOAL_OPTIONS, type Hand, type PlayStyle } from '../types'
import { ntrpLabel } from '../lib/tennis'

const STYLES: PlayStyle[] = [
  'de fondo (baseliner)',
  'agresivo (saque y volea)',
  'contragolpeador',
  'todoterreno (all-court)',
  'sin definir',
]

export default function Onboarding() {
  const { setProfile, finishOnboarding } = useStore()
  const [name, setName] = useState('')
  const [ntrp, setNtrp] = useState(3.0)
  const [hand, setHand] = useState<Hand>('diestro')
  const [style, setStyle] = useState<PlayStyle>('de fondo (baseliner)')
  const [goals, setGoals] = useState<string[]>([])

  const toggleGoal = (g: string) =>
    setGoals((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]))

  const start = () => {
    setProfile({
      name: name.trim() || 'Jugador/a',
      ntrp,
      hand,
      style,
      goals,
      createdAt: new Date().toISOString(),
    })
    finishOnboarding()
  }

  return (
    <div className="onboarding">
      <div className="hero">
        <div className="logo">🎾</div>
        <h1>AceCoach</h1>
        <p className="subtitle">Tu entrenador de tenis con IA. Registra, analiza y mejora.</p>
      </div>

      <div className="card">
        <label className="field">
          <span>¿Cómo te llamas?</span>
          <input
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="field">
          <span>
            Tu nivel (NTRP): <strong>{ntrp.toFixed(1)}</strong> · {ntrpLabel(ntrp)}
          </span>
          <input
            type="range"
            min={1}
            max={7}
            step={0.5}
            value={ntrp}
            onChange={(e) => setNtrp(parseFloat(e.target.value))}
          />
          <div className="range-hints">
            <span>Principiante</span>
            <span>Competición</span>
          </div>
        </label>

        <label className="field">
          <span>Mano hábil</span>
          <select value={hand} onChange={(e) => setHand(e.target.value as Hand)}>
            <option value="diestro">Diestro</option>
            <option value="zurdo">Zurdo</option>
          </select>
        </label>

        <label className="field">
          <span>Estilo de juego</span>
          <select value={style} onChange={(e) => setStyle(e.target.value as PlayStyle)}>
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <div className="field">
          <span>¿Qué quieres mejorar?</span>
          <div className="chips">
            {GOAL_OPTIONS.map((g) => (
              <button
                key={g}
                type="button"
                className={`chip ${goals.includes(g) ? 'on' : ''}`}
                onClick={() => toggleGoal(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button className="btn primary big" onClick={start}>
        Empezar a entrenar 🚀
      </button>
    </div>
  )
}
