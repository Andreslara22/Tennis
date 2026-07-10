/**
 * Compartir resultado de partido como imagen (Canvas, sin dependencias).
 * Genera un PNG 1080×1080 con estética de la app y lo comparte con la hoja
 * nativa (Web Share API) o lo descarga como archivo si no está disponible.
 */

export interface MatchShareData {
  me: string
  partner?: string
  rival: string
  won: boolean
  score: string
  date: string // ISO
  doubles?: boolean
}

const BG = '#0f1720'
const BG2 = '#1e2b38'
const LIME = '#d7f24a'
const LIME_DIM = '#a9c020'
const GRAY = '#9fb0bd'
const WIN = '#34d399'
const LOSS = '#f87171'

function drawBall(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.4, r * 0.1, cx, cy, r * 1.1)
  grad.addColorStop(0, '#e8fb7a')
  grad.addColorStop(0.55, LIME)
  grad.addColorStop(1, LIME_DIM)
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()

  // Costuras (dos arcos recortados a la pelota)
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.clip()
  ctx.strokeStyle = BG
  ctx.lineWidth = r * 0.08
  ctx.beginPath()
  ctx.arc(cx - r * 1.15, cy - r * 1.15, r * 1.45, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx + r * 1.15, cy + r * 1.15, r * 1.45, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

export function renderMatchImage(d: MatchShareData): Promise<Blob> {
  const W = 1080
  const H = 1080
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Fondo
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, BG2)
  bg.addColorStop(1, BG)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'
  ctx.textAlign = 'center'

  // Pelota + marca
  drawBall(ctx, W / 2, 190, 95)
  ctx.fillStyle = LIME
  ctx.font = `bold 56px ${FONT}`
  ctx.fillText('AceCoach', W / 2, 360)

  // Resultado
  ctx.fillStyle = d.won ? WIN : LOSS
  ctx.font = `bold 96px ${FONT}`
  ctx.fillText(d.won ? '¡VICTORIA!' : 'DERROTA', W / 2, 490)

  // Enfrentamiento
  const meLabel = d.doubles && d.partner ? `${d.me} y ${d.partner}` : d.me
  ctx.fillStyle = '#e8eef3'
  ctx.font = `600 52px ${FONT}`
  const vsText = `${meLabel}  vs  ${d.rival}`
  ctx.fillText(vsText.length > 34 ? `${meLabel} vs ${d.rival}`.slice(0, 34) + '…' : vsText, W / 2, 585)
  if (d.doubles) {
    ctx.fillStyle = GRAY
    ctx.font = `500 36px ${FONT}`
    ctx.fillText('Dobles', W / 2, 638)
  }

  // Marcador
  ctx.fillStyle = LIME
  ctx.font = `bold 140px ${FONT}`
  ctx.fillText(d.score || '—', W / 2, d.doubles ? 800 : 780)

  // Fecha + pie
  ctx.fillStyle = GRAY
  ctx.font = `400 38px ${FONT}`
  ctx.fillText(
    new Date(d.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
    W / 2,
    900,
  )
  ctx.font = `400 32px ${FONT}`
  ctx.fillText('🎾 Registrado con AceCoach', W / 2, 1000)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen'))), 'image/png')
  })
}

/**
 * Comparte la imagen con la hoja nativa; si no se puede, la descarga.
 * Devuelve 'shared' o 'downloaded'.
 */
export async function shareMatchImage(d: MatchShareData): Promise<'shared' | 'downloaded'> {
  const blob = await renderMatchImage(d)
  const file = new File([blob], 'acecoach-partido.png', { type: 'image/png' })

  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: 'Resultado del partido',
        text: `${d.won ? '¡Victoria' : 'Partido'} ${d.score} vs ${d.rival}! 🎾`,
      })
      return 'shared'
    } catch (e) {
      // usuario canceló la hoja de compartir → no hacer nada más
      if (e instanceof Error && e.name === 'AbortError') return 'shared'
      // otro error → caer a descarga
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'acecoach-partido.png'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  return 'downloaded'
}
