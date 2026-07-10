import { useMemo, useState } from 'react'
import { useStore } from '../store'
import { quizDelDia } from '../lib/quizzes'
import { nivelDeGrado, uid } from '../types'

export default function Quiz({ hijoId, setHijoId }: { hijoId: string | null; setHijoId: (id: string) => void }) {
  const { state, addInteraccion, registrarActividad } = useStore()
  const familia = state.familia!
  const hijo = familia.hijos.find((h) => h.id === hijoId) ?? familia.hijos[0]

  const preguntas = useMemo(() => quizDelDia(nivelDeGrado(hijo.grado)), [hijo.grado])
  const [idx, setIdx] = useState(0)
  const [elegida, setElegida] = useState<number | null>(null)
  const [fallos, setFallos] = useState(0) // fallos en la pregunta actual
  const [aciertos, setAciertos] = useState(0)
  const [fin, setFin] = useState(false)

  // reinicia el quiz al cambiar de hijo
  const [hijoActual, setHijoActual] = useState(hijo.id)
  if (hijoActual !== hijo.id) {
    setHijoActual(hijo.id)
    setIdx(0)
    setElegida(null)
    setFallos(0)
    setAciertos(0)
    setFin(false)
  }

  const p = preguntas[idx]

  const responder = (i: number) => {
    if (elegida !== null && elegida === p.correcta) return
    const ok = i === p.correcta
    setElegida(i)
    if (ok) {
      const primerIntento = fallos === 0
      if (primerIntento) setAciertos((a) => a + 1)
      addInteraccion({
        id: uid(),
        hijoId: hijo.id,
        fecha: new Date().toISOString(),
        tipo: 'quiz',
        materia: p.materia,
        tema: p.tema,
        correcto: primerIntento,
      })
      registrarActividad(hijo.id, primerIntento ? 10 : 5)
    } else {
      setFallos((f) => f + 1)
    }
  }

  const siguiente = () => {
    if (idx + 1 >= preguntas.length) {
      setFin(true)
    } else {
      setIdx(idx + 1)
      setElegida(null)
      setFallos(0)
    }
  }

  const otraVez = () => {
    setIdx(0)
    setElegida(null)
    setFallos(0)
    setAciertos(0)
    setFin(false)
  }

  const acerto = elegida !== null && elegida === p?.correcta

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

      {!preguntas.length ? (
        <div className="card">
          <h3>Sin quiz para este nivel todavía</h3>
          <p className="muted">Muy pronto agregamos más preguntas para el grado de {hijo.nombre}.</p>
        </div>
      ) : fin ? (
        <div className="card" style={{ textAlign: 'center', padding: 28 }}>
          <div style={{ fontSize: '3rem' }}>{aciertos >= 4 ? '🏆' : aciertos >= 2 ? '🏅' : '💪'}</div>
          <h3 style={{ fontSize: '1.3rem' }}>
            {aciertos}/{preguntas.length} a la primera
          </h3>
          <p className="muted" style={{ margin: '8px 0 16px' }}>
            {aciertos >= 4
              ? `¡Impresionante, ${hijo.nombre}! Esto sale en tu reporte del domingo 🎉`
              : aciertos >= 2
                ? '¡Buen trabajo! Mañana hay quiz nuevo para seguir tu racha 🔥'
                : 'Lo importante es intentarlo. Pregúntale al tutor lo que no salió y mañana lo vuelves a intentar.'}
          </p>
          <button className="btn btn-mora btn-block" onClick={otraVez}>
            Repasar otra vez
          </button>
        </div>
      ) : (
        <div className="card">
          <div className="progreso">
            {preguntas.map((_, i) => (
              <span key={i} className={i < idx || (i === idx && acerto) ? 'done' : ''} />
            ))}
          </div>
          <span className="muted">
            {p.materia} · {p.tema}
          </span>
          <div className="quiz-q">{p.pregunta}</div>

          {fallos > 0 && !acerto && <div className="pista">💡 Pista: {p.pista}</div>}
          {acerto && <div className="explica">✅ {p.explicacion}</div>}

          {p.opciones.map((op, i) => (
            <button
              key={i}
              className={`opcion ${elegida === i ? (i === p.correcta ? 'ok' : 'mal') : ''} ${acerto && i === p.correcta ? 'ok' : ''}`}
              onClick={() => responder(i)}
              disabled={acerto}
            >
              {String.fromCharCode(65 + i)}) {op}
            </button>
          ))}

          {acerto && (
            <button className="btn btn-sol btn-block" onClick={siguiente} style={{ marginTop: 8 }}>
              {idx + 1 >= preguntas.length ? 'Ver mi resultado' : 'Siguiente →'}
            </button>
          )}
        </div>
      )}
    </>
  )
}
