/**
 * Extracción de fotogramas de un vídeo en el cliente (sin subir el vídeo).
 * Se usan para el análisis de técnica con Claude Vision: solo los fotogramas
 * (JPEG comprimidos) viajan a la IA, nunca el vídeo completo.
 */

export interface VideoFrame {
  /** JPEG en base64 (sin el prefijo data:) */
  base64: string
  /** data-URL completo para previsualizar */
  dataUrl: string
  /** Segundo del vídeo del que procede */
  atSec: number
}

const MAX_WIDTH = 768
const JPEG_QUALITY = 0.72

/** Extrae `count` fotogramas repartidos entre el 5% y el 95% del vídeo. */
export async function extractFrames(file: File, count = 6): Promise<VideoFrame[]> {
  const url = URL.createObjectURL(file)
  try {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.src = url

    await once(video, 'loadedmetadata', 15000)
    const duration = video.duration
    if (!isFinite(duration) || duration <= 0) {
      throw new Error('No se pudo leer la duración del vídeo.')
    }
    if (duration > 120) {
      throw new Error('Vídeo demasiado largo: usa un clip de menos de 2 minutos (p. ej. 3-6 saques).')
    }

    const scale = Math.min(1, MAX_WIDTH / (video.videoWidth || MAX_WIDTH))
    const w = Math.round((video.videoWidth || MAX_WIDTH) * scale)
    const h = Math.round((video.videoHeight || MAX_WIDTH) * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!

    const frames: VideoFrame[] = []
    for (let i = 0; i < count; i++) {
      const t = duration * (0.05 + (0.9 * i) / Math.max(1, count - 1))
      video.currentTime = t
      await once(video, 'seeked', 10000)
      ctx.drawImage(video, 0, 0, w, h)
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY)
      frames.push({
        dataUrl,
        base64: dataUrl.split(',')[1],
        atSec: Math.round(t * 10) / 10,
      })
    }
    return frames
  } finally {
    URL.revokeObjectURL(url)
  }
}

function once(el: HTMLMediaElement, event: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('El vídeo tardó demasiado en cargar. Prueba con un clip más corto.'))
    }, timeoutMs)
    const ok = () => {
      cleanup()
      resolve()
    }
    const err = () => {
      cleanup()
      reject(new Error('No se pudo leer el vídeo (formato no soportado).'))
    }
    const cleanup = () => {
      clearTimeout(timer)
      el.removeEventListener(event, ok)
      el.removeEventListener('error', err)
    }
    el.addEventListener(event, ok, { once: true })
    el.addEventListener('error', err, { once: true })
  })
}
