import { useState } from 'react'
import { useStore } from '../store'
import { extractFrames, type VideoFrame } from '../lib/video'
import { analyzeVideoFrames } from '../ai/coach'

const STROKES = ['Saque', 'Derecha', 'Revés', 'Volea', 'Resto', 'General']

export default function VideoCoach({ onDone }: { onDone: () => void }) {
  const { state, addChat } = useStore()
  const { profile, apiKey, proxyUrl } = state
  const hasAI = Boolean(proxyUrl || apiKey)

  const [frames, setFrames] = useState<VideoFrame[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [stroke, setStroke] = useState('Saque')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState<'extract' | 'analyze' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const onFile = async (file: File) => {
    setError(null)
    setResult(null)
    setFrames([])
    setFileName(file.name)
    setBusy('extract')
    try {
      setFrames(await extractFrames(file, 6))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo procesar el vídeo.')
      setFileName(null)
    } finally {
      setBusy(null)
    }
  }

  const analyze = async () => {
    if (frames.length === 0 || busy) return
    setBusy('analyze')
    setError(null)
    try {
      const analysis = await analyzeVideoFrames(
        { proxyUrl: proxyUrl || undefined, apiKey: apiKey || undefined },
        profile,
        { frames: frames.map((f) => f.base64), stroke, note },
      )
      setResult(analysis)
      // Guardar también en el historial del coach
      const at = new Date().toISOString()
      addChat({ role: 'user', content: `📹 Análisis de vídeo: ${stroke}${note ? ` (${note})` : ''}`, at })
      addChat({ role: 'assistant', content: analysis, at })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al analizar.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="screen">
      <header className="topbar">
        <h1>📹 Video Coach</h1>
        <button className="icon-btn" onClick={onDone} aria-label="Cerrar">✖</button>
      </header>

      {!hasAI && (
        <div className="banner">
          El análisis de vídeo necesita el coach con IA: configura tu <strong>proxy</strong> o
          clave de Claude en <strong>Ajustes</strong>.
        </div>
      )}

      <div className="card">
        <h2 className="section-title">1 · Graba o elige un clip</h2>
        <p className="muted small">
          Clip corto (&lt;2 min, p. ej. 3-6 saques). 📱 Cómo grabar: móvil{' '}
          <strong>detrás de la pista, elevado 2-3 m, en horizontal y a 60 fps</strong>, con tu
          cuerpo completo en el encuadre. Solo se envían 6 fotogramas comprimidos a la IA,
          nunca el vídeo.
        </p>
        <label className="btn primary file-btn">
          {fileName ? `🎞 ${fileName}` : '🎥 Grabar / elegir vídeo'}
          <input
            type="file"
            accept="video/*"
            capture="environment"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onFile(f)
              e.target.value = ''
            }}
          />
        </label>
        {busy === 'extract' && <p className="muted small">Extrayendo fotogramas…</p>}
        {frames.length > 0 && (
          <div className="frames-row">
            {frames.map((f, i) => (
              <img key={i} src={f.dataUrl} alt={`Fotograma ${i + 1} (${f.atSec}s)`} className="frame-thumb" />
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">2 · ¿Qué golpe analizamos?</h2>
        <div className="chips">
          {STROKES.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${stroke === s ? 'on' : ''}`}
              onClick={() => setStroke(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <label className="field">
          <span>Nota para el coach (opcional)</span>
          <input
            type="text"
            placeholder="p. ej. «siento que pierdo potencia»"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
      </div>

      <button
        className="btn primary big"
        disabled={frames.length === 0 || busy !== null || !hasAI}
        onClick={analyze}
      >
        {busy === 'analyze' ? 'Analizando tu técnica… 🎾' : '🤖 Analizar con el coach'}
      </button>

      {error && <div className="bubble error">{error}</div>}

      {result && (
        <div className="card analysis">
          <h2 className="section-title">Análisis del coach</h2>
          {result.split('\n').map((line, i) => (
            <p key={i} className="md-line">
              {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={j}>{part.slice(2, -2)}</strong>
                ) : (
                  <span key={j}>{part}</span>
                ),
              )}
            </p>
          ))}
          <p className="muted small">Guardado también en el chat del Coach 🤖</p>
        </div>
      )}
    </div>
  )
}
