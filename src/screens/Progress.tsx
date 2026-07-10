import { useStore } from '../store'
import { aggregate, weeklyTrend } from '../lib/tennis'

export default function Progress() {
  const { state, deleteSession } = useStore()
  const { sessions } = state
  const agg = aggregate(sessions)
  const trend = weeklyTrend(sessions, 8)
  const maxMin = Math.max(60, ...trend.map((t) => t.minutes))

  return (
    <div className="screen">
      <header className="topbar">
        <h1>Tu progreso</h1>
      </header>

      <div className="card">
        <h2 className="section-title">Minutos por semana</h2>
        {sessions.length === 0 ? (
          <p className="muted">Registra sesiones para ver tu evolución.</p>
        ) : (
          <div className="chart">
            {trend.map((t, i) => (
              <div className="chart-col" key={i}>
                <div className="chart-bar-wrap">
                  <div
                    className="chart-bar"
                    style={{ height: `${(t.minutes / maxMin) * 100}%` }}
                    title={`${t.minutes} min · ${t.sessions} sesiones`}
                  />
                </div>
                <span className="chart-label">{t.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">Métricas medias</h2>
        <div className="metrics">
          <Metric
            label="1º saque dentro"
            value={agg.avgFirstServe != null ? `${agg.avgFirstServe.toFixed(0)}%` : '—'}
          />
          <Metric
            label="Winners / sesión"
            value={agg.avgWinners != null ? agg.avgWinners.toFixed(1) : '—'}
          />
          <Metric
            label="Errores / sesión"
            value={agg.avgUnforced != null ? agg.avgUnforced.toFixed(1) : '—'}
          />
          <Metric
            label="Ratio W/E"
            value={agg.winnersToErrors != null ? agg.winnersToErrors.toFixed(2) : '—'}
          />
          <Metric label="Victorias" value={`${agg.wins}`} />
          <Metric label="Derrotas" value={`${agg.losses}`} />
        </div>
      </div>

      {(agg.avgHr != null || agg.totalCalories > 0) && (
        <div className="card">
          <h2 className="section-title">⌚ Datos del reloj</h2>
          <div className="metrics">
            <Metric
              label="FC media"
              value={agg.avgHr != null ? `${agg.avgHr.toFixed(0)} ppm` : '—'}
            />
            <Metric
              label="FC máxima"
              value={agg.maxHrEver != null ? `${agg.maxHrEver} ppm` : '—'}
            />
            <Metric
              label="Calorías"
              value={agg.totalCalories > 0 ? `${agg.totalCalories}` : '—'}
            />
          </div>
          <p className="muted small">
            {agg.wearableSessions} sesión(es) sincronizadas desde el reloj.
          </p>
        </div>
      )}

      <section>
        <h2 className="section-title">Historial ({sessions.length})</h2>
        {sessions.length === 0 ? (
          <p className="muted">Sin sesiones todavía.</p>
        ) : (
          <ul className="session-list">
            {[...sessions].reverse().map((s) => (
              <li key={s.id} className="session-item">
                <div className={`session-tag ${s.type === 'partido' ? 'match' : 'practice'}`}>
                  {s.source === 'wearable' ? '⌚' : s.type === 'partido' ? '🎯' : '🏸'}
                </div>
                <div className="session-main">
                  <div className="session-title">
                    {s.type === 'partido' ? `vs ${s.opponent || '?'}` : 'Entrenamiento'}
                    {s.type === 'partido' && s.won != null && (
                      <span className={`pill ${s.won ? 'win' : 'loss'}`}>
                        {s.won ? 'V' : 'D'}
                      </span>
                    )}
                    {s.score && <span className="score">{s.score}</span>}
                  </div>
                  <div className="session-sub">
                    {new Date(s.date).toLocaleDateString('es-ES')} · {s.durationMin}min ·
                    intensidad {s.intensity}/5
                    {s.focus.length ? ` · ${s.focus.join(', ')}` : ''}
                    {s.avgHr ? ` · ❤️ ${s.avgHr}ppm` : ''}
                    {s.calories ? ` · 🔥 ${s.calories}kcal` : ''}
                  </div>
                  {s.notes && <div className="session-notes">“{s.notes}”</div>}
                </div>
                <button
                  className="icon-btn"
                  aria-label="Eliminar"
                  onClick={() => {
                    if (confirm('¿Eliminar esta sesión?')) deleteSession(s.id)
                  }}
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  )
}
