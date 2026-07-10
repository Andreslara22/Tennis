import { useState } from 'react'
import { useStore } from '../store'
import { GOAL_OPTIONS, type Hand, type PlayStyle } from '../types'
import { ntrpLabel } from '../lib/tennis'
import {
  demoWorkouts,
  hrZonesFromBirthYear,
  isNativeAndroid,
  readWorkoutsFromHealthConnect,
  workoutsToSessions,
} from '../lib/wearable'

const STYLES: PlayStyle[] = [
  'de fondo (baseliner)',
  'agresivo (saque y volea)',
  'contragolpeador',
  'todoterreno (all-court)',
  'sin definir',
]

export default function Settings() {
  const { state, setProfile, setApiKey, setWearable, addSessions, reset } = useStore()
  const { profile, wearable, sessions } = state

  const [name, setName] = useState(profile?.name ?? '')
  const [birthYear, setBirthYear] = useState(profile?.birthYear ? String(profile.birthYear) : '')
  const [ntrp, setNtrp] = useState(profile?.ntrp ?? 3.0)
  const [hand, setHand] = useState<Hand>(profile?.hand ?? 'diestro')
  const [style, setStyle] = useState<PlayStyle>(profile?.style ?? 'de fondo (baseliner)')
  const [goals, setGoals] = useState<string[]>(profile?.goals ?? [])
  const [savedProfile, setSavedProfile] = useState(false)

  const [key, setKey] = useState(state.apiKey)
  const [showKey, setShowKey] = useState(false)
  const [savedKey, setSavedKey] = useState(false)

  // Wearables
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const native = isNativeAndroid()

  const toggleGoal = (g: string) =>
    setGoals((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]))

  const saveProfile = () => {
    const by = parseInt(birthYear, 10)
    setProfile({
      name: name.trim() || 'Jugador/a',
      ntrp,
      hand,
      style,
      goals,
      birthYear: Number.isFinite(by) && by > 1900 ? by : undefined,
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

  const syncWearable = async (demo: boolean) => {
    if (syncing) return
    setSyncing(true)
    setSyncMsg(null)
    try {
      const workouts = demo ? demoWorkouts() : await readWorkoutsFromHealthConnect(30)
      const zones = hrZonesFromBirthYear(profile?.birthYear)
      const fresh = workoutsToSessions(workouts, sessions, zones)
      if (fresh.length > 0) addSessions(fresh)
      setWearable({ lastSync: new Date().toISOString() })
      setSyncMsg(
        fresh.length > 0
          ? `✅ ${fresh.length} entrenamiento(s) importado(s) del reloj${demo ? ' (demo)' : ''}.`
          : 'No hay entrenamientos nuevos que importar.',
      )
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      setSyncMsg(`⚠️ ${msg}`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="screen">
      <header className="topbar">
        <h1>Ajustes</h1>
      </header>

      <div className="card">
        <h2 className="section-title">Perfil</h2>
        <div className="row2">
          <label className="field">
            <span>Nombre</span>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">
            <span>Año de nacimiento</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="p.ej. 1995"
              min={1920}
              max={new Date().getFullYear()}
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
            />
          </label>
        </div>
        {hrZonesFromBirthYear(parseInt(birthYear, 10)) && (
          <p className="muted small">
            ⌚ FC máx estimada: {hrZonesFromBirthYear(parseInt(birthYear, 10))!.hrMax} ppm — se
            usa para personalizar tus zonas de intensidad.
          </p>
        )}
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
        <h2 className="section-title">⌚ Wearables — relojes Android</h2>
        <p className="muted small">
          Sincroniza tus entrenamientos desde un reloj Android (Wear OS: Galaxy Watch, Pixel
          Watch…) a través de <strong>Health Connect</strong>. Se importan duración, frecuencia
          cardíaca y calorías, y el coach los usa en su análisis.
        </p>

        <label className="switch-row">
          <span>Sincronización con el reloj</span>
          <input
            type="checkbox"
            checked={wearable.enabled}
            onChange={(e) => setWearable({ enabled: e.target.checked })}
          />
        </label>

        {wearable.enabled && (
          <>
            {native ? (
              <button className="btn primary" disabled={syncing} onClick={() => syncWearable(false)}>
                {syncing ? 'Sincronizando…' : '🔄 Sincronizar ahora (Health Connect)'}
              </button>
            ) : (
              <>
                <p className="muted small">
                  Estás en la versión web: Health Connect solo existe en Android. Puedes probar
                  el flujo con datos de demostración.
                </p>
                <button className="btn ghost" disabled={syncing} onClick={() => syncWearable(true)}>
                  {syncing ? 'Importando…' : '🧪 Probar con datos de demo'}
                </button>
              </>
            )}

            {wearable.lastSync && (
              <p className="muted small">
                Último sync: {new Date(wearable.lastSync).toLocaleString('es-ES')}
              </p>
            )}
            {syncMsg && <p className="muted small">{syncMsg}</p>}

            <p className="muted small">
              Los entrenamientos importados aparecen en tu historial marcados con ⌚ y no se
              duplican al re-sincronizar.
            </p>
          </>
        )}
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
