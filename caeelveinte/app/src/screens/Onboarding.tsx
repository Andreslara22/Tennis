import { useState } from 'react'
import { useStore } from '../store'
import { AVATAR_COLORS, GRADOS, PLANES, uid, type Grado, type Plan } from '../types'

interface HijoDraft {
  nombre: string
  grado: Grado
}

export default function Onboarding() {
  const { setFamilia } = useStore()
  const [paso, setPaso] = useState(0)
  const [nombreTutor, setNombreTutor] = useState('')
  const [hijos, setHijos] = useState<HijoDraft[]>([{ nombre: '', grado: '5P' }])
  const [plan, setPlan] = useState<Plan>('familiar')

  const hijosValidos = hijos.filter((h) => h.nombre.trim())

  const terminar = () => {
    setFamilia({
      nombreTutor: nombreTutor.trim(),
      plan,
      fundadora: true, // primeras 100 familias
      creadaEl: new Date().toISOString(),
      hijos: hijosValidos.map((h, i) => ({
        id: uid(),
        nombre: h.nombre.trim(),
        grado: h.grado,
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        puntos: 0,
        racha: 0,
        mejorRacha: 0,
        ultimoDiaActivo: null,
      })),
    })
  }

  return (
    <div className="onb">
      <div className="logo">
        cae el&nbsp;<span className="veinte">20</span>
      </div>
      <p className="sub" style={{ marginBottom: 24 }}>
        El tutor de toda la familia
      </p>
      <div className="pasitos">
        {[0, 1, 2].map((i) => (
          <span key={i} className={i <= paso ? 'done' : ''} />
        ))}
      </div>

      {paso === 0 && (
        <>
          <h1>¡Hola! 👋</h1>
          <p className="sub">Tú llevas el control: los reportes semanales llegan a ti.</p>
          <label className="field">¿Cómo te llamas? (mamá / papá / tutor)</label>
          <input
            value={nombreTutor}
            onChange={(e) => setNombreTutor(e.target.value)}
            placeholder="Ej. Mariana"
            autoFocus
          />
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-mora btn-block" disabled={!nombreTutor.trim()} onClick={() => setPaso(1)}>
              Continuar
            </button>
          </div>
        </>
      )}

      {paso === 1 && (
        <>
          <h1>Tus hijos</h1>
          <p className="sub">Cada uno tiene su perfil: el tutor les habla a su nivel.</p>
          {hijos.map((h, i) => (
            <div className="hijo-row" key={i}>
              <input
                value={h.nombre}
                placeholder={`Nombre del hijo ${i + 1}`}
                onChange={(e) => setHijos(hijos.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))}
              />
              <select
                value={h.grado}
                onChange={(e) => setHijos(hijos.map((x, j) => (j === i ? { ...x, grado: e.target.value as Grado } : x)))}
              >
                {GRADOS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
              {hijos.length > 1 && (
                <button className="del" onClick={() => setHijos(hijos.filter((_, j) => j !== i))} aria-label="Quitar">
                  ✕
                </button>
              )}
            </div>
          ))}
          {hijos.length < 4 && (
            <button className="btn btn-ghost btn-sm" onClick={() => setHijos([...hijos, { nombre: '', grado: '1S' }])}>
              + Agregar otro hijo
            </button>
          )}
          <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => setPaso(0)}>
              Atrás
            </button>
            <button className="btn btn-mora" style={{ flex: 1 }} disabled={!hijosValidos.length} onClick={() => setPaso(2)}>
              Continuar
            </button>
          </div>
        </>
      )}

      {paso === 2 && (
        <>
          <h1>Tu plan</h1>
          <p className="sub">Sin plazos forzosos. Cancela cuando quieras.</p>
          {PLANES.map((p) => (
            <button key={p.id} className={`plan-opt ${plan === p.id ? 'on' : ''}`} onClick={() => setPlan(p.id)}>
              <span>
                <b>{p.nombre}</b>
                <br />
                <small style={{ color: 'var(--gris)' }}>{p.nota}</small>
              </span>
              <span className="precio">{p.precio}</span>
            </button>
          ))}
          <p className="muted" style={{ margin: '8px 0 16px' }}>
            🎉 Eres de las <b>primeras 100 familias</b>: tu precio fundador queda en <b>$49/mes de por vida</b>.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => setPaso(1)}>
              Atrás
            </button>
            <button className="btn btn-sol" style={{ flex: 1 }} onClick={terminar}>
              ¡Empezar! 🚀
            </button>
          </div>
        </>
      )}
    </div>
  )
}
