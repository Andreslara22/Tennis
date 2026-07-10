import { useRef, useState } from 'react'
import { useStore } from '../store'
import { GOAL_OPTIONS, type BackupFile, type Hand, type PlayStyle } from '../types'
import { ntrpLabel } from '../lib/tennis'
import { applyReminders, cancelReminders, DAY_LABELS } from '../lib/reminders'
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
  const {
    state,
    setProfile,
    setApiKey,
    setProxyUrl,
    setWearable,
    setReminders,
    setWeeklyGoal,
    addSessions,
    importBackup,
    reset,
  } = useStore()
  const { profile, wearable, sessions, reminders, weeklyGoal } = state

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

  // Proxy IA
  const [proxy, setProxy] = useState(state.proxyUrl)
  const [savedProxy, setSavedProxy] = useState(false)

  // Recordatorios
  const [remMsg, setRemMsg] = useState<string | null>(null)

  // Copia de seguridad
  const fileRef = useRef<HTMLInputElement>(null)
  const [backupMsg, setBackupMsg] = useState<string | null>(null)

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

  const saveProxy = () => {
    setProxyUrl(proxy.trim())
    setSavedProxy(true)
    setTimeout(() => setSavedProxy(false), 1500)
  }

  const toggleReminderDay = async (iso: number) => {
    const days = reminders.days.includes(iso)
      ? reminders.days.filter((d) => d !== iso)
      : [...reminders.days, iso].sort()
    setReminders({ days })
    if (reminders.enabled) await reschedule({ ...reminders, days })
  }

  const reschedule = async (settings = reminders) => {
    setRemMsg(null)
    try {
      const ok = await applyReminders(settings)
      if (settings.enabled) {
        setRemMsg(
          ok
            ? '✅ Recordatorios programados.'
            : native
              ? 'Sin días seleccionados.'
              : 'ℹ️ Los recordatorios funcionan en la app Android (aquí solo se guarda la configuración).',
        )
      }
    } catch (e) {
      setRemMsg(`⚠️ ${e instanceof Error ? e.message : 'Error al programar'}`)
    }
  }

  const toggleReminders = async (enabled: boolean) => {
    setReminders({ enabled })
    if (enabled) await reschedule({ ...reminders, enabled })
    else {
      await cancelReminders().catch(() => {})
      setRemMsg(null)
    }
  }

  const exportBackup = () => {
    const backup: BackupFile = {
      app: 'acecoach',
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: state.profile,
      sessions: state.sessions,
      chat: state.chat,
      wearable: state.wearable,
      reminders: state.reminders,
      weeklyGoal: state.weeklyGoal,
    }
    const json = JSON.stringify(backup, null, 2)
    const date = new Date().toISOString().slice(0, 10)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `acecoach-backup-${date}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
    setBackupMsg(`✅ Copia exportada (${state.sessions.length} sesiones). Guárdala en un lugar seguro.`)
  }

  const importFromFile = async (file: File) => {
    setBackupMsg(null)
    try {
      const parsed = JSON.parse(await file.text()) as BackupFile
      if (parsed.app !== 'acecoach' || !Array.isArray(parsed.sessions)) {
        throw new Error('El archivo no parece una copia de AceCoach.')
      }
      if (
        !confirm(
          `Restaurar copia del ${new Date(parsed.exportedAt).toLocaleDateString('es-ES')} con ${parsed.sessions.length} sesiones?\n\nSustituirá tus datos actuales (la clave de API se conserva).`,
        )
      )
        return
      importBackup(parsed)
      setBackupMsg(`✅ Copia restaurada: ${parsed.sessions.length} sesiones.`)
    } catch (e) {
      setBackupMsg(`⚠️ ${e instanceof Error ? e.message : 'Archivo inválido'}`)
    }
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
        <h2 className="section-title">🎯 Objetivo semanal</h2>
        <p className="muted small">
          Metas de la semana (lunes a domingo). Ponlas a 0 para desactivarlas. El progreso se
          muestra en Inicio.
        </p>
        <div className="row2">
          <label className="field">
            <span>Sesiones / semana</span>
            <input
              type="number"
              min={0}
              max={14}
              inputMode="numeric"
              value={weeklyGoal.sessions}
              onChange={(e) =>
                setWeeklyGoal({ sessions: Math.max(0, parseInt(e.target.value || '0', 10)) })
              }
            />
          </label>
          <label className="field">
            <span>Minutos / semana</span>
            <input
              type="number"
              min={0}
              step={30}
              inputMode="numeric"
              value={weeklyGoal.minutes}
              onChange={(e) =>
                setWeeklyGoal({ minutes: Math.max(0, parseInt(e.target.value || '0', 10)) })
              }
            />
          </label>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">⏰ Recordatorios de entrenamiento</h2>
        <label className="switch-row">
          <span>Recordarme entrenar</span>
          <input
            type="checkbox"
            checked={reminders.enabled}
            onChange={(e) => toggleReminders(e.target.checked)}
          />
        </label>
        {reminders.enabled && (
          <>
            <div className="field">
              <span>Días</span>
              <div className="chips">
                {DAY_LABELS.map((d) => (
                  <button
                    key={d.iso}
                    type="button"
                    className={`chip day ${reminders.days.includes(d.iso) ? 'on' : ''}`}
                    onClick={() => toggleReminderDay(d.iso)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              <span>Hora</span>
              <input
                type="time"
                value={reminders.time}
                onChange={async (e) => {
                  setReminders({ time: e.target.value })
                  await reschedule({ ...reminders, time: e.target.value })
                }}
              />
            </label>
            {remMsg && <p className="muted small">{remMsg}</p>}
          </>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">Coach con IA (Claude)</h2>
        <p className="muted small">
          <strong>Opción recomendada:</strong> despliega el proxy incluido en{' '}
          <code>server/</code> (5 min, gratis) y pega aquí su URL — tu clave vive en el
          servidor y nunca en el móvil.
        </p>
        <label className="field">
          <span>URL del proxy</span>
          <input
            type="url"
            placeholder="https://acecoach-ai-proxy.tucuenta.workers.dev"
            value={proxy}
            onChange={(e) => setProxy(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        <button className="btn primary" onClick={saveProxy}>
          {savedProxy ? '✅ Guardado' : 'Guardar proxy'}
        </button>

        <p className="muted small">
          Alternativa (solo pruebas): clave de API directa. Se guarda{' '}
          <strong>solo en este dispositivo</strong>. Si hay proxy configurado, se usa el proxy.
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
        <button className="btn ghost" onClick={saveKey}>
          {savedKey ? '✅ Guardada' : 'Guardar clave'}
        </button>
      </div>

      <div className="card">
        <h2 className="section-title">💾 Copia de seguridad</h2>
        <p className="muted small">
          Exporta tus datos a un archivo JSON (perfil, sesiones y chat — sin credenciales) y
          restáuralos en otro dispositivo.
        </p>
        <div className="row2">
          <button className="btn primary" onClick={exportBackup}>
            ⬇️ Exportar
          </button>
          <button className="btn ghost" onClick={() => fileRef.current?.click()}>
            ⬆️ Importar
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) importFromFile(f)
            e.target.value = ''
          }}
        />
        {backupMsg && <p className="muted small">{backupMsg}</p>}
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

      <p className="footer-note">
        AceCoach v0.6 · Hecho con 🎾 y Claude ·{' '}
        <a
          className="footer-link"
          href="https://andreslara22.github.io/Tennis/privacidad.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          Política de privacidad
        </a>
      </p>
    </div>
  )
}
