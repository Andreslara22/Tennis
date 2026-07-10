/**
 * AceCoach — proxy de IA (Cloudflare Worker)
 *
 * La clave de Anthropic vive AQUÍ (secreto del servidor), nunca en la app.
 * La app envía {system, messages, max_tokens} y recibe {text}.
 *
 * Despliegue (5 minutos):
 *   1. npm i -g wrangler && wrangler login
 *   2. cd server && wrangler deploy
 *   3. wrangler secret put ANTHROPIC_API_KEY   (pega tu clave sk-ant-…)
 *   4. Copia la URL del worker en AceCoach → Ajustes → "URL del proxy"
 */

const MODEL = 'claude-opus-4-8'
const MAX_TOKENS_CAP = 2048

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...CORS },
  })
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS })
    if (request.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: 'Falta el secreto ANTHROPIC_API_KEY en el worker' }, 500)
    }

    let payload
    try {
      payload = await request.json()
    } catch {
      return json({ error: 'JSON inválido' }, 400)
    }

    const { system, messages, max_tokens } = payload || {}
    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: 'Falta "messages"' }, 400)
    }

    // Validación del formato de mensajes.
    // content puede ser texto plano o bloques (texto + imágenes base64 para
    // el análisis de vídeo con Claude Vision).
    const MAX_IMAGES = 8
    const MAX_IMAGE_B64 = 600_000 // ~450KB por fotograma JPEG

    function cleanContent(content) {
      if (typeof content === 'string') {
        return content.length > 0 ? content.slice(0, 8000) : null
      }
      if (!Array.isArray(content)) return null
      let images = 0
      const blocks = []
      for (const b of content) {
        if (b?.type === 'text' && typeof b.text === 'string' && b.text.length > 0) {
          blocks.push({ type: 'text', text: b.text.slice(0, 8000) })
        } else if (
          b?.type === 'image' &&
          b.source?.type === 'base64' &&
          (b.source.media_type === 'image/jpeg' || b.source.media_type === 'image/png') &&
          typeof b.source.data === 'string' &&
          b.source.data.length > 0 &&
          b.source.data.length <= MAX_IMAGE_B64
        ) {
          if (++images > MAX_IMAGES) return null
          blocks.push({
            type: 'image',
            source: { type: 'base64', media_type: b.source.media_type, data: b.source.data },
          })
        } else {
          return null // bloque desconocido o imagen demasiado grande
        }
      }
      return blocks.length > 0 ? blocks : null
    }

    const clean = []
    for (const m of messages.slice(-12)) {
      if (!m || (m.role !== 'user' && m.role !== 'assistant')) continue
      const content = cleanContent(m.content)
      if (content) clean.push({ role: m.role, content })
    }

    if (clean.length === 0) return json({ error: 'Mensajes con formato inválido' }, 400)

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: Math.min(Number(max_tokens) || 1200, MAX_TOKENS_CAP),
        system: typeof system === 'string' ? system.slice(0, 8000) : undefined,
        messages: clean,
      }),
    })

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '')
      return json(
        { error: `La API de Claude respondió ${upstream.status}`, detail: detail.slice(0, 300) },
        502,
      )
    }

    const data = await upstream.json()
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()

    return json({ text })
  },
}
