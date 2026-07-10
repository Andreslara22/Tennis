import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppState, ChatMessage, PlayerProfile, Session, WearableSettings } from './types'
import { loadState, newId, saveState } from './storage'

interface Store {
  state: AppState
  setProfile: (p: PlayerProfile) => void
  addSession: (s: Omit<Session, 'id'>) => void
  /** Importación en bloque (p.ej. sync desde el reloj). Devuelve cuántas se añadieron. */
  addSessions: (list: Omit<Session, 'id'>[]) => void
  deleteSession: (id: string) => void
  addChat: (m: ChatMessage) => void
  clearChat: () => void
  setApiKey: (k: string) => void
  setWearable: (w: Partial<WearableSettings>) => void
  finishOnboarding: () => void
  reset: () => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState())
  const first = useRef(true)

  // Persistir en cada cambio (salvo el render inicial).
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    saveState(state)
  }, [state])

  const store = useMemo<Store>(
    () => ({
      state,
      setProfile: (profile) => setState((s) => ({ ...s, profile })),
      addSession: (session) =>
        setState((s) => ({
          ...s,
          sessions: [...s.sessions, { ...session, id: newId() }].sort(
            (a, b) => +new Date(a.date) - +new Date(b.date),
          ),
        })),
      addSessions: (list) =>
        setState((s) => ({
          ...s,
          sessions: [...s.sessions, ...list.map((x) => ({ ...x, id: newId() }))].sort(
            (a, b) => +new Date(a.date) - +new Date(b.date),
          ),
        })),
      deleteSession: (id) =>
        setState((s) => ({ ...s, sessions: s.sessions.filter((x) => x.id !== id) })),
      addChat: (m) => setState((s) => ({ ...s, chat: [...s.chat, m] })),
      clearChat: () => setState((s) => ({ ...s, chat: [] })),
      setApiKey: (apiKey) => setState((s) => ({ ...s, apiKey })),
      setWearable: (w) => setState((s) => ({ ...s, wearable: { ...s.wearable, ...w } })),
      finishOnboarding: () => setState((s) => ({ ...s, onboarded: true })),
      reset: () =>
        setState({
          profile: null,
          sessions: [],
          chat: [],
          apiKey: '',
          onboarded: false,
          wearable: { enabled: false, lastSync: null },
        }),
    }),
    [state],
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}
