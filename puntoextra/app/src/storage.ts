import type { AppState } from './types'

const KEY = 'puntoextra.v1'

export const estadoInicial: AppState = {
  familia: null,
  interacciones: [],
  mensajes: [],
  simulacros: [],
  ajustes: { apiKey: '', telefonoWhatsApp: '' },
}

export function cargar(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return estadoInicial
    const data = JSON.parse(raw)
    return { ...estadoInicial, ...data, ajustes: { ...estadoInicial.ajustes, ...data.ajustes } }
  } catch {
    return estadoInicial
  }
}

export function guardar(state: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // almacenamiento lleno o no disponible: la app sigue funcionando en memoria
  }
}

export function borrarTodo() {
  localStorage.removeItem(KEY)
}
