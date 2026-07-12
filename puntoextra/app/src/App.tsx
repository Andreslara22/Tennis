import { useEffect, useRef, useState } from 'react'
import { useStore } from './store'
import { manejarBotonAtras } from './lib/nativo'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import Tutor from './screens/Tutor'
import Quiz from './screens/Quiz'
import Reporte from './screens/Reporte'
import Ajustes from './screens/Ajustes'

export type Tab = 'home' | 'tutor' | 'quiz' | 'reporte' | 'ajustes'

const TABS: { id: Tab; ico: string; label: string }[] = [
  { id: 'home', ico: '🏠', label: 'Inicio' },
  { id: 'tutor', ico: '💬', label: 'Tutor' },
  { id: 'quiz', ico: '🏅', label: 'Quiz' },
  { id: 'reporte', ico: '📊', label: 'Reporte' },
  { id: 'ajustes', ico: '⚙️', label: 'Ajustes' },
]

export default function App() {
  const { state } = useStore()
  const [tab, setTab] = useState<Tab>('home')
  const [hijoId, setHijoId] = useState<string | null>(null)
  const tabRef = useRef(tab)
  tabRef.current = tab

  useEffect(() => {
    manejarBotonAtras(() => {
      if (tabRef.current === 'home') return true // ya en inicio → minimizar
      setTab('home')
      return false
    })
  }, [])

  if (!state.familia) return <Onboarding />

  const irATutor = (id: string) => {
    setHijoId(id)
    setTab('tutor')
  }
  const irAQuiz = (id: string) => {
    setHijoId(id)
    setTab('quiz')
  }

  return (
    <>
      <div className="app">
        <div className="top">
          <div className="logo">
            Punto&nbsp;<span className="extra">Extra</span>
          </div>
          <span className="plan-pill">
            {state.familia.plan === 'ninguno' ? 'Sin plan' : `Plan ${state.familia.plan}`}
            {state.familia.fundadora ? ' · fundadora 🎉' : ''}
          </span>
        </div>
        {tab === 'home' && <Home onTutor={irATutor} onQuiz={irAQuiz} />}
        {tab === 'tutor' && <Tutor hijoId={hijoId} setHijoId={setHijoId} />}
        {tab === 'quiz' && <Quiz hijoId={hijoId} setHijoId={setHijoId} />}
        {tab === 'reporte' && <Reporte />}
        {tab === 'ajustes' && <Ajustes />}
      </div>
      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            <span className="ico">{t.ico}</span>
            {t.label}
          </button>
        ))}
      </nav>
    </>
  )
}
