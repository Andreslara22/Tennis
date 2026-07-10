# 🔐 Proxy de IA para AceCoach

Pequeño backend (Cloudflare Worker, capa gratuita) que guarda tu clave de Anthropic en el
servidor. Así la app **nunca** contiene la clave y puedes publicarla en Google Play con
tranquilidad.

```
App (móvil) ──POST {system, messages}──▶ Worker (tu clave aquí) ──▶ API de Claude
     ◀───────────── {text} ◀──────────────────┘
```

## Desplegar (≈5 minutos, gratis)

```bash
npm i -g wrangler
wrangler login                          # abre el navegador
cd server
wrangler deploy                         # → https://acecoach-ai-proxy.<tu-cuenta>.workers.dev
wrangler secret put ANTHROPIC_API_KEY   # pega tu clave sk-ant-…
```

## Conectar la app

AceCoach → **Ajustes → Coach con IA → URL del proxy** → pega la URL del worker.
Cuando hay proxy configurado, la app lo usa siempre y la clave local deja de ser necesaria.

## Notas

- El worker limita historial (12 mensajes), tamaño de mensaje y `max_tokens` (2048) para
  controlar el gasto.
- CORS abierto (`*`) para simplificar; si quieres, restringe `Access-Control-Allow-Origin`
  a tu dominio o añade una cabecera secreta compartida con la app.
- Alternativas equivalentes: Vercel Functions, Netlify Functions, una lambda… el contrato
  es el mismo: `POST {system, messages, max_tokens}` → `{text}`.
