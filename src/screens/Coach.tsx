import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { getCoachReply, offlineCoachAdvice } from '../ai/coach'

const SUGGESTIONS = [
  '¿En qué debería centrarme esta semana?',
  'Analiza mi progreso',
  'Dame un ejercicio para mejorar el saque',
  '¿Por qué cometo tantos errores no forzados?',
]

export default function Coach() {
  const { state, addChat, clearChat } = useStore()
  const { chat, apiKey, profile, sessions } = state
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat, loading])

  const send = async (text: string) => {
    const message = text.trim()
    if (!message || loading) return
    setInput('')
    setError(null)
    addChat({ role: 'user', content: message, at: new Date().toISOString() })
    setLoading(true)

    try {
      if (!apiKey) {
        // Modo offline: consejo heurístico.
        const reply = offlineCoachAdvice(profile, sessions)
        addChat({ role: 'assistant', content: reply, at: new Date().toISOString() })
      } else {
        const reply = await getCoachReply(apiKey, profile, sessions, chat, message)
        addChat({ role: 'assistant', content: reply, at: new Date().toISOString() })
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error desconocido'
      setError(`No se pudo contactar con el coach: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="screen chat-screen">
      <header className="topbar">
        <h1>Coach 🤖</h1>
        {chat.length > 0 && (
          <button className="icon-btn" onClick={clearChat} aria-label="Borrar conversación">
            🗑
          </button>
        )}
      </header>

      {!apiKey && (
        <div className="banner">
          Sin clave de API: el coach responde en <strong>modo offline</strong> (consejos por
          reglas). Añade tu clave de Claude en <strong>Ajustes</strong> para el coach con IA
          conversacional.
        </div>
      )}

      <div className="chat">
        {chat.length === 0 && (
          <div className="chat-empty">
            <div className="coach-avatar">🎾</div>
            <p>
              ¡Hola{profile?.name ? `, ${profile.name}` : ''}! Soy tu coach. Pregúntame lo que
              quieras sobre tu tenis o tu progreso.
            </p>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chip" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {chat.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {renderContent(m.content)}
          </div>
        ))}

        {loading && (
          <div className="bubble assistant">
            <span className="typing">
              <i></i>
              <i></i>
              <i></i>
            </span>
          </div>
        )}
        {error && <div className="bubble error">{error}</div>}
        <div ref={endRef} />
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <input
          type="text"
          placeholder="Escribe a tu coach…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="btn primary" type="submit" disabled={loading || !input.trim()}>
          ➤
        </button>
      </form>
    </div>
  )
}

/** Renderiza texto con **negritas** y saltos de línea de forma sencilla. */
function renderContent(text: string) {
  return text.split('\n').map((line, i) => (
    <p key={i} className="md-line">
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={j}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={j}>{part}</span>
        ),
      )}
    </p>
  ))
}
