import type { AppState } from './types'

const KEY = 'acecoach:v1'

const EMPTY: AppState = {
  profile: null,
  sessions: [],
  chat: [],
  apiKey: '',
  onboarded: false,
  wearable: { enabled: false, lastSync: null },
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    const parsed = JSON.parse(raw) as Partial<AppState>
    return { ...EMPTY, ...parsed }
  } catch {
    return { ...EMPTY }
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // almacenamiento lleno o no disponible: se ignora silenciosamente
  }
}

export function newId(): string {
  return Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36)
}
