import { useStore } from '../store'
import { interaccionesSemana } from '../lib/reporte'
import { logrosDeHijo } from '../lib/logros'
import { labelGrado } from '../types'

export default function Home({ onTutor, onQuiz }: { onTutor: (id: string) => void; onQuiz: (id: string) => void }) {
  const { state } = useStore()
  const familia = state.familia!
  const semana = interaccionesSemana(state.interacciones)

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const domingo = new Date().getDay() === 0

  return (
    <>
      <div className="saludo" style={{ marginBottom: 14 }}>
        <h1>
          {saludo}, {familia.nombreTutor} 👋
        </h1>
        <p className="muted">Así van tus hijos esta semana:</p>
      </div>

      {familia.hijos.map((h) => {
        const acts = semana.filter((i) => i.hijoId === h.id)
        const medallas = logrosDeHijo(h, state.interacciones, state.simulacros).filter((g) => g.ganado)
        return (
          <div className="card hijo-card" key={h.id}>
            <span className="avatar" style={{ background: h.color }}>
              {h.nombre.slice(0, 2).toUpperCase()}
            </span>
            <div className="info">
              <h3>{h.nombre}</h3>
              <div className="muted">{labelGrado(h.grado)}</div>
              <div className="stats">
                <span>
                  <b>{acts.length}</b> actividades
                </span>
                <span className="racha">
                  🔥 <b>{h.racha}</b> días
                </span>
                <span>
                  ⭐ <b>{h.puntos}</b> pts
                </span>
              </div>
              {medallas.length > 0 && (
                <div className="medallas">
                  {medallas.map((m) => (
                    <span key={m.id} title={`${m.titulo}: ${m.desc}`}>{m.emoji}</span>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="btn btn-mora btn-sm" onClick={() => onTutor(h.id)}>
                💬 Tutor
              </button>
              <button className="btn btn-sol btn-sm" onClick={() => onQuiz(h.id)}>
                🏅 Quiz
              </button>
            </div>
          </div>
        )
      })}

      {domingo && (
        <div className="banner">
          <h3>📊 ¡Hoy es domingo de reporte!</h3>
          <p className="muted">Tu resumen semanal ya está listo en la pestaña Reporte.</p>
        </div>
      )}

      <div className="banner">
        <h3>👩‍🏫 Clase en vivo de la semana</h3>
        <p className="muted">
          Jueves 6:00 pm — “Fracciones sin miedo” con la Miss Vale. El enlace llega por WhatsApp a todas las familias.
        </p>
      </div>

      <div className="card">
        <h3>🎯 ¿Aspirante a prepa UNAM/IPN?</h3>
        <p className="muted">
          Los simulacros cronometrados están en el Quiz seleccionando a tu hijo de 3º de secundaria o prepa.
        </p>
      </div>
    </>
  )
}
