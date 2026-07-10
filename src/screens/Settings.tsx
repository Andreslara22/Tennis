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

export default function Settings() {
  const { state, setProfile, setApiKey, reset } = useStore()
  const { profile } = state

  const [name, setName] = useState(profile?.name ?? '')
  const [ntrp, setNtrp] = useState(profile?.ntrp ?? 3.0)
  const [hand, setHand] = useState<Hand>(profile?.hand ?? 'diestro')
  const [style, setStyle] = useState<PlayStyle>(profile?.style ?? 'de fondo (baseliner)')
  const [goals, setGoals] = useState<string[]>(profile?.goals ?? [])
  const [savedProfile, setSavedProfile] = useState(false)

  const [key, setKey] = useState(state.apiKey)
  const [showKey, setShowKey] = useState(false)
  const [savedKey, setSavedKey] = useState(false)

  const toggleGoal = (g: string) =>
    setGoals((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]))

  const saveProfile = () => {
    setProfile({
      name: name.trim() || 'Jugador/a',
      ntrp,
      hand,
      style,
      goals,
      createdAt: profile?.createdAt ?? new Date().toISOString(),
    })
    setSavedProfile(true)
    setTimeout(() => setSavedProfile(false), 1500)
  }

  const saveKey = () => {
    setApiKey(key.trim())
    setSavedKey(true)
    setTimeout(() => setSavedKey(false), 1500)
  }

  return (
    <div className="screen">
      <header className="topbar">
        <h1>Ajustes</h1>
      </header>

      <div className="card">
        <h2 className="section-title">Perfil</h2>
        <label className="field">
          <span>Nombre</span>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field">
          <span>
            Nivel NTRP: <strong>{ntrp.toFixed(1)}</strong> · {ntrpLabel(ntrp)}
          </span>
          <input
            type="range"
            min={1}
            max={7}
            step={0.5}
            value={ntrp}
            onChange={(e) => setNtrp(parseFloat(e.target.value))}
          />
        </label>
        <div className="row2">
          <label className="field">
            <span>Mano</span>
            <select value={hand} onChange={(e) => setHand(e.target.value as Hand)}>
              <option value="diestro">Diestro</option>
              <option value="zurdo">Zurdo</option>
            </select>
          </label>
          <label className="field">
            <span>Estilo</span>
            <select value={style} onChange={(e) => setStyle(e.target.value as PlayStyle)}>
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="field">
          <span>Objetivos</span>
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
        <button className="btn primary" onClick={saveProfile}>
          {savedProfile ? '✅ Guardado' : 'Guardar perfil'}
        </button>
      </div>

      <div className="card">
        <h2 className="section-title">Coach con IA (Claude)</h2>
        <p className="muted small">
          Introduce tu clave de API de Anthropic para activar el coach con IA. Se guarda
          <strong> solo en este dispositivo</strong> y no se envía a ningún servidor propio.
        </p>
        <label className="field">
          <span>Clave de API</span>
          <div className="key-row">
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="sk-ant-…"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <button className="icon-btn" onClick={() => setShowKey((v) => !v)} type="button">
              {showKey ? '🙈' : '👁'}
            </button>
          </div>
        </label>
        <button className="btn primary" onClick={saveKey}>
          {savedKey ? '✅ Guardada' : 'Guardar clave'}
        </button>
        <p className="muted small warn">
          ⚠️ Llamar a la API desde el móvil expone la clave en el dispositivo. Para una app
          pública se recomienda un backend/proxy que guarde la clave en el servidor (ver README).
        </p>
      </div>

      <div className="card danger">
        <h2 className="section-title">Zona peligrosa</h2>
        <p className="muted small">Borra todos tus datos (perfil, sesiones y conversación).</p>
        <button
          className="btn danger"
          onClick={() => {
            if (confirm('¿Seguro? Se borrarán TODOS tus datos.')) reset()
          }}
        >
          Borrar todo y reiniciar
        </button>
      </div>

      <p className="footer-note">AceCoach v0.1 · Hecho con 🎾 y Claude</p>
    </div>
  )
}
