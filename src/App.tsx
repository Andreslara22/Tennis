import { useState } from 'react'
import { StoreProvider, useStore } from './store'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import LogSession from './screens/LogSession'
import Progress from './screens/Progress'
import Coach from './screens/Coach'
import Settings from './screens/Settings'

export type Tab = 'home' | 'log' | 'progress' | 'coach' | 'settings'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Inicio', icon: '🏠' },
  { id: 'log', label: 'Registrar', icon: '➕' },
  { id: 'progress', label: 'Progreso', icon: '📈' },
  { id: 'coach', label: 'Coach', icon: '🤖' },
  { id: 'settings', label: 'Ajustes', icon: '⚙️' },
]

function Shell() {
  const { state } = useStore()
  const [tab, setTab] = useState<Tab>('home')

  if (!state.onboarded) {
    return <Onboarding />
  }

  return (
    <div className="app">
      <main className="content">
        {tab === 'home' && <Home go={setTab} />}
        {tab === 'log' && <LogSession onDone={() => setTab('home')} />}
        {tab === 'progress' && <Progress />}
        {tab === 'coach' && <Coach />}
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
