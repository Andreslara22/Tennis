import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { preguntarTutor } from '../ai/tutor'
import { uid, type Materia } from '../types'

/** Detección ligera de materia para el registro de actividad. */
function materiaDe(texto: string): Materia {
  if (/fracci|ecuaci|suma|resta|multiplic|divid|porcentaje|área|area|algebra|álgebra|geometr|número|numero|math|mate/i.test(texto)) return 'Matemáticas'
  if (/acent|sílaba|silaba|verbo|sujeto|ortograf|leer|lectura|cuento|español|espanol/i.test(texto)) return 'Español'
  if (/ciencia|célula|celula|newton|fuerza|planeta|animal|planta|química|quimica|física|fisica/i.test(texto)) return 'Ciencias'
  if (/historia|independencia|revoluci|guerra|imperio|azteca|maya/i.test(texto)) return 'Historia'
  if (/inglés|ingles|english|verb|past|present/i.test(texto)) return 'Inglés'
  return 'Matemáticas'
}

export default function Tutor({ hijoId, setHijoId }: { hijoId: string | null; setHijoId: (id: string) => void }) {
  const { state, addMensaje, addInteraccion, registrarActividad } = useStore()
  const familia = state.familia!
  const hijo = familia.hijos.find((h) => h.id === hijoId) ?? familia.hijos[0]
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const finRef = useRef<HTMLDivElement>(null)

  const mensajes = state.mensajes.filter((m) => m.hijoId === hijo.id)

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes.length, pensando])

  const enviar = async () => {
    const t = texto.trim()
    if (!t || pensando) return
    setTexto('')
    const userMsg = { id: uid(), hijoId: hijo.id, role: 'user' as const, text: t, fecha: new Date().toISOString() }
    addMensaje(userMsg)
    addInteraccion({
      id: uid(),
      hijoId: hijo.id,
      fecha: new Date().toISOString(),
      tipo: 'tutor',
      materia: materiaDe(t),
      tema: t.slice(0, 60),
    })
    registrarActividad(hijo.id, 5)
    setPensando(true)
    const respuesta = await preguntarTutor(hijo, [...mensajes, userMsg], state.ajustes.apiKey)
    addMensaje({ id: uid(), hijoId: hijo.id, role: 'tutor', text: respuesta, fecha: new Date().toISOString() })
    setPensando(false)
  }

  return (
    <>
      <div className="hijos-chips">
        {familia.hijos.map((h) => (
          <button key={h.id} className={`chip ${h.id === hijo.id ? 'on' : ''}`} onClick={() => setHijoId(h.id)}>
            <span className="avatar" style={{ background: h.color }}>
              {h.nombre.slice(0, 1).toUpperCase()}
            </span>
            {h.nombre}
          </button>
        ))}
      </div>

      <div className="chat">
        {mensajes.length === 0 && (
          <div className="msg tutor">
            ¡Hola {hijo.nombre}! 👋 Soy tu tutor de Punto Extra. Mándame tu duda o escribe el problema de tu tarea y lo
            resolvemos <b>juntos, paso a paso</b>. (Yo no doy respuestas… ¡te ayudo a encontrarlas! 😉)
          </div>
        )}
        {mensajes.map((m) => (
          <div key={m.id} className={`msg ${m.role}`}>
            {m.text}
          </div>
        ))}
        {pensando && <div className="escribiendo">El tutor está escribiendo…</div>}
        <div ref={finRef} />
      </div>

      <div className="chat-input">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviar()}
          placeholder="Escribe tu duda o tu tarea…"
        />
        <button className="btn btn-mora" onClick={enviar} disabled={!texto.trim() || pensando}>
          ➤
        </button>
      </div>
    </>
  )
}
