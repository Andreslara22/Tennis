import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { PLANES } from '../types'
import { capturarInstalacion, esNativo, instalarPWA, programarRecordatorio, puedeInstalar } from '../lib/nativo'

export default function Ajustes() {
  const { state, setAjustes, setFamilia, reiniciar } = useStore()
  const familia = state.familia!
  const [confirmar, setConfirmar] = useState(false)
  const [instalable, setInstalable] = useState(puedeInstalar())

  useEffect(() => {
    capturarInstalacion(() => setInstalable(puedeInstalar()))
  }, [])

  const toggleRecordatorio = async () => {
    const nuevo = !state.ajustes.recordatorio
    const ok = await programarRecordatorio(nuevo)
    if (nuevo && !ok) return // sin permiso de notificaciones: no encender
    setAjustes({ recordatorio: nuevo })
  }

  return (
    <>
      <h1 style={{ fontSize: '1.4rem', marginBottom: 14 }}>⚙️ Ajustes</h1>

      <div className="card">
        <h3>Tu plan</h3>
        {PLANES.map((p) => (
          <button
            key={p.id}
            className={`plan-opt ${familia.plan === p.id ? 'on' : ''}`}
            onClick={() => setFamilia({ ...familia, plan: p.id })}
          >
            <span>
              <b>{p.nombre}</b>
              <br />
              <small style={{ color: 'var(--gris)' }}>{p.nota}</small>
            </span>
            <span className="precio">{p.precio}</span>
          </button>
        ))}
        {familia.fundadora && (
          <p className="muted">🎉 Familia fundadora: tu precio queda congelado en $49/mes de por vida.</p>
        )}
      </div>

      <div className="card">
        <h3>Reporte por WhatsApp</h3>
        <p className="muted">Número (con lada, ej. 52155…) al que se comparte el reporte semanal.</p>
        <input
          value={state.ajustes.telefonoWhatsApp}
          onChange={(e) => setAjustes({ telefonoWhatsApp: e.target.value })}
          placeholder="5215512345678"
          inputMode="tel"
        />
      </div>

      <div className="card">
        <h3>Recordatorio del quiz 🔔</h3>
        {esNativo() ? (
          <>
            <p className="muted">Una notificación diaria a las 7:00 pm para que nadie pierda su racha.</p>
            <button className={`btn btn-sm ${state.ajustes.recordatorio ? 'btn-mora' : 'btn-ghost'}`} onClick={toggleRecordatorio}>
              {state.ajustes.recordatorio ? 'Activado · 7:00 pm ✓' : 'Activar recordatorio'}
            </button>
          </>
        ) : (
          <p className="muted">Disponible en la app de Android. En el portal web puedes instalar la app abajo.</p>
        )}
      </div>

      {!esNativo() && instalable && (
        <div className="card">
          <h3>📲 Instalar en tu teléfono</h3>
          <p className="muted">Agrega Punto Extra a tu pantalla de inicio: abre al instante y funciona sin conexión.</p>
          <button className="btn btn-mora btn-sm" onClick={() => instalarPWA().then(() => setInstalable(puedeInstalar()))}>
            Instalar app
          </button>
        </div>
      )}

      <div className="card">
        <h3>Tutor con IA</h3>
        <p className="muted">
          Sin clave, el tutor funciona en modo básico (guía por reglas). Con una clave de API de Anthropic responde
          con IA completa. La clave se guarda solo en este dispositivo.
        </p>
        <input
          type="password"
          value={state.ajustes.apiKey}
          onChange={(e) => setAjustes({ apiKey: e.target.value })}
          placeholder="sk-ant-…"
          autoComplete="off"
        />
      </div>

      <div className="card">
        <h3>Borrar todos los datos</h3>
        <p className="muted">Elimina perfiles, chats y actividad de este dispositivo. No se puede deshacer.</p>
        {confirmar ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmar(false)}>
              Cancelar
            </button>
            <button
              className="btn btn-sm"
              style={{ background: 'var(--coral)', color: '#fff' }}
              onClick={() => {
                reiniciar()
                setConfirmar(false)
              }}
            >
              Sí, borrar todo
            </button>
          </div>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={() => setConfirmar(true)}>
            Borrar datos…
          </button>
        )}
      </div>

      <p className="muted" style={{ textAlign: 'center', fontSize: '0.78rem' }}>
        Punto Extra v0.1 · El tutor de toda la familia
        <br />
        Tutoría complementaria; no somos escuela ni otorgamos validez oficial.
      </p>
    </>
  )
}
