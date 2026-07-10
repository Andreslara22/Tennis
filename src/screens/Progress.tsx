import { useState } from 'react'
import { useStore } from '../store'
import { aggregate, weeklyTrend } from '../lib/tennis'
import { hrZoneLabel, hrZonesFromBirthYear } from '../lib/wearable'
import { computeLadder } from '../lib/elo'
import { shareMatchImage } from '../lib/shareImage'
import { FOCUS_OPTIONS, type Session } from '../types'

export default function Progress() {
  const { state, deleteSession } = useStore()
  const { sessions, profile } = state
  const agg = aggregate(sessions)
  const zones = hrZonesFromBirthYear(profile?.birthYear)
  const ladder = computeLadder(sessions, profile?.name || 'Tú')

  // Head-to-head
  const [h2hRival, setH2hRival] = useState<string | null>(null)
  const h2hMatches = h2hRival
    ? sessions
        .filter((s) => s.type === 'partido' && !s.doubles && s.opponent?.trim() === h2hRival)
        .reverse()
    : []
  const h2hWins = h2hMatches.filter((m) => m.won === true).length
  const h2hLosses = h2hMatches.filter((m) => m.won === false).length

  const shareMatch = (s: Session) => {
    if (s.won === undefined) return
    shareMatchImage({
      me: profile?.name || 'Yo',
      partner: s.partner,
      rival: s.opponent || 'Rival',
      won: s.won,
      score: s.score || '',
      date: s.date,
      doubles: s.doubles,
    }).catch(() => {})
  }

  // Evolución por golpe
  const [stroke, setStroke] = useState<string>('Saque')
  const strokeSessions = sessions.filter((s) => s.focus.includes(stroke))
  const strokeTrend = weeklyTrend(strokeSessions, 8)
  const strokeMax = Math.max(30, ...strokeTrend.map((t) => t.minutes))
  const strokeTotalMin = strokeSessions.reduce((a, s) => a + s.durationMin, 0)
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

      <div className="card">
        <h2 className="section-title">🎾 Evolución por golpe</h2>
        <div className="chips">
          {FOCUS_OPTIONS.map((f) => (
            <button
              key={f}
              type="button"
              className={`chip ${stroke === f ? 'on' : ''}`}
              onClick={() => setStroke(f)}
            >
              {f}
            </button>
          ))}
        </div>
        {strokeSessions.length === 0 ? (
          <p className="muted small">
            Aún no has registrado sesiones trabajando «{stroke}». Márcalo en «¿Qué
            trabajaste?» al registrar.
          </p>
        ) : (
          <>
            <div className="chart">
              {strokeTrend.map((t, i) => (
                <div className="chart-col" key={i}>
                  <div className="chart-bar-wrap">
                    <div
                      className="chart-bar"
                      style={{ height: `${(t.minutes / strokeMax) * 100}%` }}
                      title={`${t.minutes} min`}
                    />
                  </div>
                  <span className="chart-label">{t.label}</span>
                </div>
              ))}
            </div>
            <p className="muted small">
              {stroke}: {strokeSessions.length} sesión(es) · {Math.round(strokeTotalMin / 60)}h{' '}
              {strokeTotalMin % 60}min en total (minutos/semana, últimas 8 semanas).
            </p>
          </>
        )}
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
            {zones && agg.avgHr != null && (
              <>
                {' '}
                Tu FC media cae en <strong>{hrZoneLabel(agg.avgHr, zones)}</strong> (FC máx
                teórica: {zones.hrMax} ppm).
              </>
            )}
          </p>
        </div>
      )}

      {ladder.length > 0 && (
        <div className="card">
          <h2 className="section-title">🏆 Escalera de rivales (ELO)</h2>
          <ul className="ladder">
            {ladder.map((e, i) => (
              <li key={e.name}>
                <button
                  className={`ladder-row ${e.isPlayer ? 'me' : ''} ${h2hRival === e.name ? 'open' : ''}`}
                  onClick={() =>
                    !e.isPlayer && setH2hRival((cur) => (cur === e.name ? null : e.name))
                  }
                >
                  <span className="ladder-pos">{i + 1}</span>
                  <span className="ladder-name">
                    {e.isPlayer ? `${e.name} (tú)` : e.name}
                  </span>
                  <span className="ladder-record">
                    {e.wins}V–{e.losses}D
                  </span>
                  <span className="ladder-elo">{e.elo}</span>
                </button>

                {h2hRival === e.name && (
                  <div className="h2h">
                    <div className="h2h-head">
                      <strong>Head-to-head vs {e.name}</strong>
                      <span className={`pill ${h2hWins >= h2hLosses ? 'win' : 'loss'}`}>
                        {h2hWins}–{h2hLosses}
                      </span>
                    </div>
                    <ul className="h2h-list">
                      {h2hMatches.map((m) => (
                        <li key={m.id} className="h2h-item">
                          <span className={`h2h-dot ${m.won ? 'win' : 'loss'}`}>
                            {m.won ? 'V' : 'D'}
                          </span>
                          <span className="h2h-date">
                            {new Date(m.date).toLocaleDateString('es-ES')}
                          </span>
                          <span className="h2h-score">{m.score || '—'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <p className="muted small">
            Ranking local de individuales (ELO, K=32). Toca un rival para ver vuestro
            head-to-head. Gana a rivales mejor clasificados para subir más rápido.
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
                    {s.doubles && <span className="pill">Dobles</span>}
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
                <div className="session-actions">
                  {s.type === 'partido' && s.won != null && (
                    <button
                      className="icon-btn"
                      aria-label="Compartir"
                      onClick={() => shareMatch(s)}
                    >
                      📤
                    </button>
                  )}
                  <button
                    className="icon-btn"
                    aria-label="Eliminar"
                    onClick={() => {
                      if (confirm('¿Eliminar esta sesión?')) deleteSession(s.id)
                    }}
                  >
                    🗑
                  </button>
                </div>
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
