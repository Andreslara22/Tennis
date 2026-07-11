import { useStore } from '../store'
import { linkWhatsApp, reporteSemanal, reporteTexto } from '../lib/reporte'
import { actividad7Dias } from '../lib/logros'
import { labelGrado } from '../types'

export default function Reporte() {
  const { state } = useStore()
  const familia = state.familia!
  const reportes = reporteSemanal(familia, state.interacciones)
  const texto = reporteTexto(familia, reportes)

  return (
    <>
      <h1 style={{ fontSize: '1.4rem', marginBottom: 4 }}>📊 Reporte semanal</h1>
      <p className="muted" style={{ marginBottom: 14 }}>
        Lo que practicó cada uno en los últimos 7 días. Cada domingo también te llega por WhatsApp.
      </p>

      <div className="card">
        {reportes.map((r) => (
          <div className="rep-hijo" key={r.hijo.id}>
            <div className="nombre">
              {r.hijo.nombre} · <span style={{ fontWeight: 600, color: 'var(--gris)' }}>{labelGrado(r.hijo.grado)}</span>
            </div>
            {r.ejercicios + r.preguntasTutor === 0 ? (
              <div className="rep-dato">Sin actividad esta semana 😴 — anímalo a mandar su primera duda.</div>
            ) : (
              <>
                <div className="rep-dato">
                  {r.ejercicios} ejercicios · {r.preguntasTutor} dudas al tutor · {r.diasActivo} día(s) activo
                </div>
                {r.intentos > 0 && (
                  <div className="rep-dato bien">
                    ✓ Aciertos a la primera: {r.aciertos}/{r.intentos}
                  </div>
                )}
                {r.materias.length > 0 && <div className="rep-dato">Practicó: {r.materias.join(', ')}</div>}
                {r.temasAtorados.length > 0 && (
                  <div className="rep-dato atora">⚠️ Se atora en: {r.temasAtorados.join(' y ')}</div>
                )}
                {r.hijo.racha > 1 && <div className="rep-dato">🔥 Racha de {r.hijo.racha} días (récord: {r.hijo.mejorRacha})</div>}
                {(() => {
                  const sims = state.simulacros.filter((s) => s.hijoId === r.hijo.id)
                  const ult = sims[sims.length - 1]
                  if (!ult) return null
                  const prev = sims.length >= 2 ? sims[sims.length - 2] : null
                  const delta = prev ? ult.aciertos - prev.aciertos : null
                  return (
                    <div className="rep-dato">
                      ⏱️ Simulacro: {ult.aciertos}/{ult.total}
                      {delta !== null && <b className={delta >= 0 ? 'bien' : 'atora'}> ({delta >= 0 ? '+' : ''}{delta} vs. anterior)</b>}
                    </div>
                  )
                })()}
                <div className="spark" aria-label="Actividad de los últimos 7 días">
                  {actividad7Dias(r.hijo.id, state.interacciones).map((v, i) => (
                    <span key={i} className={v > 0 ? 'on' : ''} style={{ height: `${v > 0 ? Math.min(100, 25 + v * 15) : 12}%` }} />
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <a className="btn btn-wa btn-block" href={linkWhatsApp(state.ajustes.telefonoWhatsApp, texto)} target="_blank" rel="noopener">
        Compartir por WhatsApp
      </a>
      <p className="muted" style={{ marginTop: 10, fontSize: '0.8rem' }}>
        Consejo: compártelo con el papá, la abuela o el grupo familiar — que toda la casa celebre las rachas 🔥
      </p>
    </>
  )
}
