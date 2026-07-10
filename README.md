# 🎾 AceCoach

**Tu entrenador de tenis con IA.** Registra tus entrenamientos y partidos, visualiza tu
progreso y recibe consejos personalizados de un coach con inteligencia artificial (Claude)
que analiza tus datos.

App **mobile-first** hecha con **React + Vite (TypeScript)** y lista para empaquetarse en
**Android con Capacitor** (y más adelante iOS).

---

## ✨ Funcionalidades

- **Onboarding** con tu perfil: nombre, nivel NTRP, mano hábil, estilo de juego y objetivos.
- **Registro de sesiones**: entrenamientos y partidos, con duración, intensidad, aspectos
  trabajados, marcador y estadísticas (1º saque %, aces, dobles faltas, winners, errores no
  forzados).
- **Panel de inicio**: racha de días, sesiones, % de victorias, horas jugadas, ratio
  winners/errores…
- **Progreso**: gráfico de minutos por semana, métricas medias e historial completo.
- **Coach con IA (Claude)**: chat conversacional que analiza tus datos y te da consejos y
  ejercicios personalizados. Sin clave de API funciona en **modo offline** con consejos por
  reglas basados en tus estadísticas.
- **⌚ Wearables (relojes Android / Wear OS)**: sincroniza entrenamientos desde Health
  Connect con frecuencia cardíaca, calorías y duración. El coach usa esos datos en su
  análisis. Deduplicación automática al re-sincronizar.
- **🎾 Partido en vivo**: marcador punto a punto con juegos, sets, tie-break, iguales y
  ventajas; deshacer, contadores de aces/winners/errores y guardado automático del partido
  con su marcador y duración. **Individual o dobles** (con pareja y súper tie-break a 10
  como set decisivo).
- **📤 Compartir resultado**: genera una tarjeta-imagen del partido (marcador, rivales,
  victoria/derrota) y la comparte con la hoja nativa del móvil — perfecta para el grupo
  del club.
- **🤝 Head-to-head**: toca cualquier rival en la escalera para ver vuestro historial de
  enfrentamientos partido a partido.
- **🎯 Objetivos semanales**: metas de sesiones y minutos con barras de progreso en Inicio.
- **📊 Evolución por golpe**: gráfico semanal de minutos por golpe trabajado (saque,
  revés, volea…).
- **🏆 Escalera de rivales**: ranking ELO local calculado con tus partidos — tú y tus
  rivales, sin servidores.
- **⏰ Recordatorios de entrenamiento**: notificaciones locales semanales en Android
  (elige días y hora).
- **💾 Copia de seguridad**: exporta/importa tus datos en JSON (sin credenciales) para
  cambiar de móvil sin perder nada.
- **Persistencia local**: tus datos se guardan en el dispositivo (localStorage).

---

## 📲 Probar la app en tu Android (APK de prueba)

Cada push a la rama compila automáticamente un APK en GitHub Actions y lo publica aquí:

**👉 [Descargar última APK de prueba](https://github.com/Andreslara22/Tennis/releases/tag/apk-prueba)**

Desde el móvil: descarga `AceCoach-vX.X.X-prueba.apk`, ábrelo y acepta «instalar de origen
desconocido». Las siguientes builds de prueba se instalan encima sin desinstalar (misma
firma de test). ⚠️ Es una firma de PRUEBA: al pasar a la versión de Google Play habrá que
desinstalar esta una única vez (exporta antes tus datos en Ajustes → Copia de seguridad).

## 🚀 Empezar (desarrollo web)

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`).

Para activar el coach con IA, ve a **Ajustes** e introduce tu clave de API de Anthropic
(se guarda solo en tu dispositivo). O define `VITE_ANTHROPIC_API_KEY` en un archivo `.env`
para desarrollo (ver `.env.example`).

---

## 📱 Android (Capacitor 7)

El proyecto nativo ya está generado y **versionado** en `android/` (con permisos de Health
Connect y firma de release configurados). Requisitos: Android Studio + JDK.

```bash
npm run android           # build web + sync + abrir Android Studio
npm run android:apk       # APK release firmado (para probar en tu móvil)
npm run android:release   # App Bundle .aab firmado (para subir a Google Play)
```

**Firma (hazlo una vez):**

```bash
./scripts/generate-keystore.sh                                  # crea la clave
cp android/keystore.properties.example android/keystore.properties   # y rellénalo
```

Firmar siempre con la misma clave es lo que permite **actualizar la app sin desinstalar**.
La clave y sus contraseñas están en `.gitignore` — guarda copia de seguridad fuera del repo.

**Marca e iconos:** los iconos de launcher (legacy + adaptive), los splash screens y los
recursos de la ficha de Play (`store-assets/`) se generan con:

```bash
node scripts/generate-assets.mjs
```

📋 **Publicación en Google Play**: guía completa paso a paso en [`GOOGLE_PLAY.md`](./GOOGLE_PLAY.md)
(cuenta, ficha, política de privacidad, declaración de Health Connect, testing y rutina de
actualizaciones). La **política de privacidad** está en `docs/privacidad.html`, lista para
GitHub Pages (Settings → Pages → rama principal, carpeta `/docs`).

> iOS es análogo: `npx cap add ios` + `npx cap open ios` (requiere macOS + Xcode). Lo
> añadimos después de tener Android funcionando.

---

## ⌚ Wearables — relojes Android (Wear OS)

La app lee los entrenamientos que tu reloj (Galaxy Watch, Pixel Watch, TicWatch…) vuelca en
**Health Connect**, el almacén de salud estándar de Android. Así cualquier reloj compatible
funciona sin integraciones por marca.

**Cómo funciona:**

1. En **Ajustes → Wearables**, activa la sincronización.
2. En Android nativo, pulsa **Sincronizar ahora**: se piden permisos de Health Connect y se
   importan los entrenamientos de los últimos 30 días (duración, FC media/máx, calorías,
   correlacionados por rango temporal).
3. Con la sincronización activada, la app también **auto-sincroniza al abrirse** (máximo una
   vez cada 6 horas, en segundo plano y sin molestar si falla).
4. En web (sin reloj) puedes probar el flujo con el botón de **datos de demo**.

Los entrenos importados se marcan con ⌚, no se duplican al re-sincronizar, y el **coach de
IA** incluye la frecuencia cardíaca y las calorías en su análisis.

**Zonas de FC personalizadas:** si indicas tu año de nacimiento en el perfil, la app calcula
tu FC máxima teórica (220 − edad) y tus zonas Z1–Z5. La intensidad de los entrenos importados
se estima con tus zonas, el Progreso te dice en qué zona entrenas y el coach lo usa en su
análisis.

Todo lo nativo ya está configurado en este repo: plugin
`@kiwi-health/capacitor-health-connect`, permisos en `AndroidManifest.xml` y los intent
handlers que exige Google. El usuario final solo necesita la app **Health Connect** de
Google Play y su reloj vinculado.

> La capa de integración está en `src/lib/wearable.ts`. En web, el plugin simplemente no
> está disponible y la UI ofrece el modo demo.

---

## 🔐 Coach con IA: proxy (recomendado) o clave directa

La app soporta dos modos, configurables en **Ajustes → Coach con IA**:

1. **Proxy propio (recomendado / producción)** — incluido en [`server/`](./server/):
   un Cloudflare Worker (capa gratuita) que guarda tu clave de Anthropic como secreto del
   servidor. La app le envía `{system, messages}` y recibe `{text}` — la clave **nunca**
   está en el móvil. Despliegue en 5 minutos: ver [`server/README.md`](./server/README.md).
2. **Clave directa (solo pruebas)** — el usuario pega su clave y se guarda solo en el
   dispositivo (`dangerouslyAllowBrowser`). Si hay proxy configurado, siempre se usa el proxy.

---

## 🗂️ Estructura

```
src/
  ai/coach.ts        # Coach IA (proxy o clave directa) + coach offline por reglas
  lib/tennis.ts      # Estadísticas, rachas, tendencias y objetivo semanal
  lib/scoring.ts     # Motor de puntuación de tenis (partido en vivo)
  lib/wearable.ts    # Health Connect (reloj), zonas de FC
  lib/elo.ts         # Escalera de rivales (ELO local)
  lib/reminders.ts   # Recordatorios (notificaciones locales)
  screens/           # Onboarding, Home, LogSession, Progress, Coach, Settings
  store.tsx          # Estado global (React Context) + persistencia
  storage.ts         # Carga/guardado en localStorage
  types.ts           # Modelos de datos
  index.css          # Estilos (tema oscuro, mobile-first)
server/              # Proxy de IA (Cloudflare Worker) — la clave vive aquí
android/             # Proyecto nativo (firma, permisos, iconos, splash)
scripts/             # generate-keystore.sh · generate-assets.mjs
docs/                # Política de privacidad (GitHub Pages)
capacitor.config.ts  # Configuración de la app nativa
```

---

## 🧰 Stack

- React 18 + Vite 5 + TypeScript
- `@anthropic-ai/sdk` (modelo `claude-opus-4-8`)
- Capacitor 6 (Android)
- Sin backend: datos en el dispositivo

Hecho con 🎾 y Claude.
