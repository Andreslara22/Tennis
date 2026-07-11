import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { quizDelDia, simulacroPreguntas, type Pregunta } from '../lib/quizzes'
import { nivelDeGrado, uid, type Nivel, type Simulacro as SimT } from '../types'

const SIM_SEGUNDOS = 8 * 60 // 8 preguntas · 8 minutos
const SIM_PREGUNTAS = 8

type Modo = 'diario' | 'simulacro'

export default function Quiz({ hijoId, setHijoId }: { hijoId: string | null; setHijoId: (id: string) => void }) {
  const { state, addInteraccion, addSimulacro, registrarActividad } = useStore()
  const familia = state.familia!
  const hijo = familia.hijos.find((h) => h.id === hijoId) ?? familia.hijos[0]
  const nivel = nivelDeGrado(hijo.grado)
  const esAspirante = nivel === 'SEC' || nivel === 'PREPA'

  const [modo, setModo] = useState<Modo>('diario')

  // reinicia el modo al cambiar de hijo
  const [hijoActual, setHijoActual] = useState(hijo.id)
  if (hijoActual !== hijo.id) {
    setHijoActual(hijo.id)
    setModo('diario')
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

      {esAspirante && (
        <div className="modo-toggle">
          <button className={modo === 'diario' ? 'on' : ''} onClick={() => setModo('diario')}>
            🏅 Quiz del día
          </button>
          <button className={modo === 'simulacro' ? 'on' : ''} onClick={() => setModo('simulacro')}>
            ⏱️ Simulacro UNAM/IPN
          </button>
        </div>
      )}

      {modo === 'diario' ? (
        <QuizDiario key={`d-${hijo.id}`} hijoId={hijo.id} nivel={nivel} nombre={hijo.nombre}
          addInteraccion={addInteraccion} registrarActividad={registrarActividad} />
      ) : (
        <Simulacro key={`s-${hijo.id}`} hijoId={hijo.id} nivel={nivel} nombre={hijo.nombre}
          addInteraccion={addInteraccion} addSimulacro={addSimulacro} registrarActividad={registrarActividad}
          historial={state.simulacros.filter((s) => s.hijoId === hijo.id)} />
      )}
    </>
  )
}

// ────────────────────────────────────────────────────────────
// Quiz del día (con pistas, sin cronómetro)
// ────────────────────────────────────────────────────────────
function QuizDiario(props: {
  hijoId: string
  nivel: Nivel
  nombre: string
  addInteraccion: (i: Parameters<ReturnType<typeof useStore>['addInteraccion']>[0]) => void
  registrarActividad: (hijoId: string, puntos: number) => void
}) {
  const { hijoId, nivel, nombre, addInteraccion, registrarActividad } = props
  const preguntas = useMemo(() => quizDelDia(nivel), [nivel])
  const [idx, setIdx] = useState(0)
  const [elegida, setElegida] = useState<number | null>(null)
  const [fallos, setFallos] = useState(0)
  const [aciertos, setAciertos] = useState(0)
  const [fin, setFin] = useState(false)
  const [celebra, setCelebra] = useState(false)

  const p = preguntas[idx]
  const acerto = elegida !== null && elegida === p?.correcta

  const responder = (i: number) => {
    if (acerto) return
    const ok = i === p.correcta
    setElegida(i)
    if (ok) {
      const primerIntento = fallos === 0
      if (primerIntento) setAciertos((a) => a + 1)
      addInteraccion({ id: uid(), hijoId, fecha: new Date().toISOString(), tipo: 'quiz', materia: p.materia, tema: p.tema, correcto: primerIntento })
      registrarActividad(hijoId, primerIntento ? 10 : 5)
      setCelebra(true)
      setTimeout(() => setCelebra(false), 900)
    } else {
      setFallos((f) => f + 1)
    }
  }

  const siguiente = () => {
    if (idx + 1 >= preguntas.length) setFin(true)
    else { setIdx(idx + 1); setElegida(null); setFallos(0) }
  }

  if (!preguntas.length)
    return (
      <div className="card">
        <h3>Sin quiz para este nivel todavía</h3>
        <p className="muted">Muy pronto agregamos más preguntas para el grado de {nombre}.</p>
      </div>
    )

  if (fin)
    return (
      <div className="card" style={{ textAlign: 'center', padding: 28 }}>
        <div style={{ fontSize: '3rem' }}>{aciertos >= 4 ? '🏆' : aciertos >= 2 ? '🏅' : '💪'}</div>
        <h3 style={{ fontSize: '1.3rem' }}>{aciertos}/{preguntas.length} a la primera</h3>
        <p className="muted" style={{ margin: '8px 0 16px' }}>
          {aciertos >= 4
            ? `¡Impresionante, ${nombre}! Esto sale en tu reporte del domingo 🎉`
            : aciertos >= 2
              ? '¡Buen trabajo! Mañana hay quiz nuevo para seguir tu racha 🔥'
              : 'Lo importante es intentarlo. Pregúntale al tutor lo que no salió y mañana lo vuelves a intentar.'}
        </p>
        <button className="btn btn-mora btn-block" onClick={() => { setIdx(0); setElegida(null); setFallos(0); setAciertos(0); setFin(false) }}>
          Repasar otra vez
        </button>
      </div>
    )

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      {celebra && <span className="mas-uno-flotante" aria-hidden="true">+1</span>}
      <div className="progreso">
        {preguntas.map((_, i) => (
          <span key={i} className={i < idx || (i === idx && acerto) ? 'done' : ''} />
        ))}
      </div>
      <span className="muted">{p.materia} · {p.tema}</span>
      <div className="quiz-q">{p.pregunta}</div>

      {fallos > 0 && !acerto && <div className="pista">💡 Pista: {p.pista}</div>}
      {acerto && <div className="explica">✅ {p.explicacion}</div>}

      {p.opciones.map((op, i) => (
        <button key={i}
          className={`opcion ${elegida === i ? (i === p.correcta ? 'ok' : 'mal') : ''} ${acerto && i === p.correcta ? 'ok' : ''}`}
          onClick={() => responder(i)} disabled={acerto}>
          {String.fromCharCode(65 + i)}) {op}
        </button>
      ))}

      {acerto && (
        <button className="btn btn-sol btn-block" onClick={siguiente} style={{ marginTop: 8 }}>
          {idx + 1 >= preguntas.length ? 'Ver mi resultado' : 'Siguiente →'}
        </button>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Simulacro cronometrado (sin pistas, una sola oportunidad)
// ────────────────────────────────────────────────────────────
function Simulacro(props: {
  hijoId: string
  nivel: Nivel
  nombre: string
  addInteraccion: (i: Parameters<ReturnType<typeof useStore>['addInteraccion']>[0]) => void
  addSimulacro: (s: SimT) => void
  registrarActividad: (hijoId: string, puntos: number) => void
  historial: SimT[]
}) {
  const { hijoId, nivel, nombre, addInteraccion, addSimulacro, registrarActividad, historial } = props
  const [fase, setFase] = useState<'intro' | 'examen' | 'resultado'>('intro')
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [idx, setIdx] = useState(0)
  const [respuestas, setRespuestas] = useState<number[]>([])
  const [segundos, setSegundos] = useState(SIM_SEGUNDOS)
  const [resultado, setResultado] = useState<SimT | null>(null)
  const inicioRef = useRef(0)
  const preguntasRef = useRef<Pregunta[]>([])
  const respuestasRef = useRef<number[]>([])

  useEffect(() => {
    if (fase !== 'examen') return
    const t = setInterval(() => setSegundos((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [fase])

  useEffect(() => {
    if (fase === 'examen' && segundos <= 0) terminar(respuestasRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segundos, fase])

  const empezar = () => {
    const ps = simulacroPreguntas(nivel, SIM_PREGUNTAS)
    preguntasRef.current = ps
    respuestasRef.current = []
    setPreguntas(ps)
    setIdx(0)
    setRespuestas([])
    setSegundos(SIM_SEGUNDOS)
    inicioRef.current = Date.now()
    setFase('examen')
  }

  const terminar = (resps: number[]) => {
    const pgs = preguntasRef.current
    const porMateria: Record<string, { ok: number; total: number }> = {}
    let aciertos = 0
    pgs.forEach((p, i) => {
      const ok = resps[i] === p.correcta
      if (ok) aciertos++
      porMateria[p.materia] = porMateria[p.materia] ?? { ok: 0, total: 0 }
      porMateria[p.materia].total++
      if (ok) porMateria[p.materia].ok++
      addInteraccion({ id: uid(), hijoId, fecha: new Date().toISOString(), tipo: 'quiz', materia: p.materia, tema: p.tema, correcto: ok })
    })
    const sim: SimT = {
      id: uid(), hijoId, fecha: new Date().toISOString(),
      aciertos, total: pgs.length,
      duracionSeg: Math.round((Date.now() - inicioRef.current) / 1000),
      porMateria,
    }
    addSimulacro(sim)
    registrarActividad(hijoId, aciertos * 10)
    setResultado(sim)
    setFase('resultado')
  }

  const responder = (i: number) => {
    const nuevas = [...respuestas]
    nuevas[idx] = i
    respuestasRef.current = nuevas
    setRespuestas(nuevas)
    if (idx + 1 >= preguntas.length) terminar(nuevas)
    else setIdx(idx + 1)
  }

  const mmss = `${Math.floor(Math.max(segundos, 0) / 60)}:${String(Math.max(segundos, 0) % 60).padStart(2, '0')}`

  if (fase === 'intro') {
    const ultimo = historial[historial.length - 1]
    return (
      <div className="card" style={{ textAlign: 'center', padding: 24 }}>
        <div style={{ fontSize: '2.6rem' }}>⏱️</div>
        <h3 style={{ fontSize: '1.25rem', margin: '6px 0' }}>Simulacro tipo UNAM/IPN</h3>
        <p className="muted" style={{ marginBottom: 6 }}>
          {SIM_PREGUNTAS} preguntas · {SIM_SEGUNDOS / 60} minutos · sin pistas, como el día del examen.
        </p>
        {ultimo && (
          <p className="muted" style={{ marginBottom: 6 }}>
            Última marca de {nombre}: <b>{ultimo.aciertos}/{ultimo.total}</b> — a superarla 💪
          </p>
        )}
        <button className="btn btn-mora btn-block" onClick={empezar} style={{ marginTop: 12 }}>
          Empezar simulacro
        </button>
      </div>
    )
  }

  if (fase === 'resultado' && resultado) {
    const pct = Math.round((resultado.aciertos / resultado.total) * 100)
    const anterior = historial.length >= 2 ? historial[historial.length - 2] : null
    const delta = anterior ? resultado.aciertos - anterior.aciertos : null
    return (
      <div className="card" style={{ textAlign: 'center', padding: 26 }}>
        <div style={{ fontSize: '3rem' }}>{pct >= 75 ? '🏆' : pct >= 50 ? '📈' : '🧗'}</div>
        <h3 style={{ fontSize: '1.5rem' }}>{resultado.aciertos}/{resultado.total}</h3>
        {delta !== null && (
          <p className={delta >= 0 ? 'sim-mejor' : 'sim-peor'} style={{ fontWeight: 800 }}>
            {delta > 0 ? `+${delta} vs. tu marca anterior 🎉` : delta === 0 ? 'Igualaste tu marca anterior' : `${delta} vs. tu marca anterior — el próximo es tuyo`}
          </p>
        )}
        <div className="sim-materias">
          {Object.entries(resultado.porMateria).map(([mat, r]) => (
            <div key={mat} className="sim-materia">
              <span>{mat}</span>
              <b className={r.ok === r.total ? 'sim-mejor' : r.ok === 0 ? 'sim-peor' : ''}>{r.ok}/{r.total}</b>
            </div>
          ))}
        </div>
        <p className="muted" style={{ margin: '10px 0 14px' }}>
          Quedó guardado en el reporte del domingo. Repítelo cada semana: la mejora constante es la que pasa exámenes.
        </p>
        <button className="btn btn-mora btn-block" onClick={() => setFase('intro')}>Hacer otro</button>
      </div>
    )
  }

  const p = preguntas[idx]
  if (!p) return null
  return (
    <div className="card">
      <div className="sim-cab">
        <span className="muted">Pregunta {idx + 1} de {preguntas.length}</span>
        <span className={`sim-timer ${segundos <= 60 ? 'urgente' : ''}`}>⏱ {mmss}</span>
      </div>
      <div className="progreso">
        {preguntas.map((_, i) => (
          <span key={i} className={i < idx ? 'done' : ''} />
        ))}
      </div>
      <span className="muted">{p.materia}</span>
      <div className="quiz-q">{p.pregunta}</div>
      {p.opciones.map((op, i) => (
        <button key={i} className="opcion" onClick={() => responder(i)}>
          {String.fromCharCode(65 + i)}) {op}
        </button>
      ))}
    </div>
  )
}
