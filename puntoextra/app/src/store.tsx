import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppState, Ajustes, ChatMsg, Familia, Hijo, Interaccion, Simulacro } from './types'
import { hoy } from './types'
import { borrarTodo, cargar, guardar } from './storage'

interface Store {
  state: AppState
  setFamilia: (f: Familia) => void
  addInteraccion: (i: Interaccion) => void
  addMensaje: (m: ChatMsg) => void
  addSimulacro: (s: Simulacro) => void
  setAjustes: (a: Partial<Ajustes>) => void
  registrarActividad: (hijoId: string, puntos: number) => void
  reiniciar: () => void
}

const Ctx = createContext<Store | null>(null)

/** Actualiza racha y puntos del hijo cuando tiene actividad hoy. */
function conActividad(h: Hijo, puntos: number): Hijo {
  const d = hoy()
  if (h.ultimoDiaActivo === d) return { ...h, puntos: h.puntos + puntos }
  const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const racha = h.ultimoDiaActivo === ayer ? h.racha + 1 : 1
  return {
    ...h,
    puntos: h.puntos + puntos,
    racha,
    mejorRacha: Math.max(h.mejorRacha, racha),
    ultimoDiaActivo: d,
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(cargar)

  useEffect(() => guardar(state), [state])

  const store = useMemo<Store>(
    () => ({
      state,
      setFamilia: (familia) => setState((s) => ({ ...s, familia })),
      addInteraccion: (i) => setState((s) => ({ ...s, interacciones: [...s.interacciones, i] })),
      addMensaje: (m) => setState((s) => ({ ...s, mensajes: [...s.mensajes, m] })),
      addSimulacro: (sim) => setState((s) => ({ ...s, simulacros: [...s.simulacros, sim] })),
      setAjustes: (a) => setState((s) => ({ ...s, ajustes: { ...s.ajustes, ...a } })),
      registrarActividad: (hijoId, puntos) =>
        setState((s) =>
          s.familia
            ? {
                ...s,
                familia: {
                  ...s.familia,
                  hijos: s.familia.hijos.map((h) => (h.id === hijoId ? conActividad(h, puntos) : h)),
                },
              }
            : s,
        ),
      reiniciar: () => {
        borrarTodo()
        setState(cargar())
      },
    }),
    [state],
  )

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore fuera de StoreProvider')
  return s
}
