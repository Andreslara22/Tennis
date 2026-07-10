import { useEffect, useRef, useState } from 'react'
import { StoreProvider, useStore } from './store'
import {
  hrZonesFromBirthYear,
  isNativeAndroid,
  readWorkoutsFromHealthConnect,
  workoutsToSessions,
} from './lib/wearable'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import LogSession from './screens/LogSession'
import LiveMatch from './screens/LiveMatch'
import VideoCoach from './screens/VideoCoach'
import Progress from './screens/Progress'
import Coach from './screens/Coach'
import Settings from './screens/Settings'

export type Tab = 'home' | 'log' | 'live' | 'video' | 'progress' | 'coach' | 'settings'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Inicio', icon: '🏠' },
  { id: 'log', label: 'Registrar', icon: '➕' },
  { id: 'progress', label: 'Progreso', icon: '📈' },
  { id: 'coach', label: 'Coach', icon: '🤖' },
  { id: 'settings', label: 'Ajustes', icon: '⚙️' },
]

/** Sincroniza el reloj en segundo plano al abrir la app (máx. 1 vez cada 6h). */
function useWearableAutoSync() {
  const { state, addSessions, setWearable } = useStore()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const { wearable, sessions, profile, onboarded } = state
    if (!onboarded || !wearable.enabled || !isNativeAndroid()) return
    const SIX_HOURS = 6 * 3600_000
    if (wearable.lastSync && Date.now() - +new Date(wearable.lastSync) < SIX_HOURS) return

    readWorkoutsFromHealthConnect(30)
      .then((workouts) => {
        const zones = hrZonesFromBirthYear(profile?.birthYear)
        const fresh = workoutsToSessions(workouts, sessions, zones)
        if (fresh.length > 0) addSessions(fresh)
        setWearable({ lastSync: new Date().toISOString() })
      })
      .catch(() => {
        // Silencioso: sin permisos o sin Health Connect. El usuario puede
        // sincronizar manualmente desde Ajustes, donde sí mostramos el error.
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

function Shell() {
  const { state } = useStore()
  const [tab, setTab] = useState<Tab>('home')
  useWearableAutoSync()

  if (!state.onboarded) {
    return <Onboarding />
  }

  // Partido en vivo: pantalla completa sin barra de pestañas (evita salidas accidentales)
  if (tab === 'live') {
    return (
      <div className="app">
        <main className="content">
          <LiveMatch onDone={() => setTab('home')} />
        </main>
      </div>
    )
  }

  // Video Coach: análisis de técnica con IA a partir de un clip
  if (tab === 'video') {
    return (
      <div className="app">
        <main className="content">
          <VideoCoach onDone={() => setTab('coach')} />
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <main className="content">
        {tab === 'home' && <Home go={setTab} />}
        {tab === 'log' && <LogSession onDone={() => setTab('home')} />}
        {tab === 'progress' && <Progress />}
        {tab === 'coach' && <Coach go={setTab} />}
        {tab === 'settings' && <Settings />}
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
