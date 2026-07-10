import { useStore } from '../store'
import { aggregate, ntrpLabel } from '../lib/tennis'
import type { Tab } from '../App'

export default function Home({ go }: { go: (t: Tab) => void }) {
  const { state } = useStore()
  const { profile, sessions } = state
  const agg = aggregate(sessions)
  const recent = [...sessions].reverse().slice(0, 5)

  return (
    <div className="screen">
      <header className="topbar">
        <div>
          <p className="greeting">Hola,</p>
          <h1>{profile?.name || 'Jugador/a'} 🎾</h1>
        </div>
        <div className="level-badge">
          <span className="ntrp">{profile?.ntrp.toFixed(1)}</span>
          <span className="ntrp-label">{profile ? ntrpLabel(profile.ntrp) : ''}</span>
        </div>
      </header>

      <div className="stat-grid">
        <StatCard big value={`${agg.currentStreakDays}`} label="🔥 días de racha" />
        <StatCard value={`${agg.totalSessions}`} label="sesiones" />
        <StatCard value={`${agg.matches}`} label="partidos" />
        <StatCard
          value={agg.winRate != null ? `${agg.winRate.toFixed(0)}%` : '—'}
          label="victorias"
        />
        <StatCard value={`${Math.round(agg.totalMinutes / 60)}h`} label="jugadas" />
        <StatCard
          value={agg.winnersToErrors != null ? agg.winnersToErrors.toFixed(2) : '—'}
          label="winners/errores"
        />
      </div>

      <div className="quick-actions">
        <button className="btn primary" onClick={() => go('log')}>
          ➕ Registrar sesión
        </button>
        <button className="btn ghost" onClick={() => go('coach')}>
          🤖 Preguntar al coach
        </button>
      </div>

      <section>
        <h2 className="section-title">Últimas sesiones</h2>
        {recent.length === 0 ? (
          <div className="empty">
            <p>Todavía no hay sesiones.</p>
            <button className="btn primary" onClick={() => go('log')}>
              Registrar la primera
            </button>
          </div>
        ) : (
          <ul className="session-list">
            {recent.map((s) => (
              <li key={s.id} className="session-item">
                <div className={`session-tag ${s.type === 'partido' ? 'match' : 'practice'}`}>
                  {s.source === 'wearable' ? '⌚' : s.type === 'partido' ? '🎯' : '🏸'}
                </div>
                <div className="session-main">
                  <div className="session-title">
                    {s.type === 'partido'
                      ? `Partido vs ${s.opponent || '?'}`
                      : 'Entrenamiento'}
                    {s.type === 'partido' && s.won != null && (
                      <span className={`pill ${s.won ? 'win' : 'loss'}`}>
                        {s.won ? 'Victoria' : 'Derrota'}
                      </span>
                    )}
                  </div>
                  <div className="session-sub">
                    {new Date(s.date).toLocaleDateString('es-ES')} · {s.durationMin}min
                    {s.focus.length ? ` · ${s.focus.join(', ')}` : ''}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function StatCard({ value, label, big }: { value: string; label: string; big?: boolean }) {
  return (
    <div className={`stat-card ${big ? 'span2' : ''}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
