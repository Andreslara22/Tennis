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
- **Persistencia local**: tus datos se guardan en el dispositivo (localStorage).

---

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

## 📱 Empaquetar para Android (Capacitor)

Requisitos: Android Studio + JDK instalados en tu máquina local.

```bash
npm run build                 # genera dist/
npx cap add android           # solo la primera vez (crea la carpeta android/)
npx cap sync android          # copia el build al proyecto nativo
npx cap open android          # abre Android Studio para compilar/ejecutar
```

Atajo: `npm run android` hace build + sync + open de una vez (tras el primer `cap add`).

La carpeta `android/` está en `.gitignore` porque se regenera con Capacitor.

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
   importan los entrenamientos de los últimos 30 días (duración, FC media/máx, calorías).
3. En web (sin reloj) puedes probar el flujo con el botón de **datos de demo**.

Los entrenos importados se marcan con ⌚, no se duplican al re-sincronizar, y el **coach de
IA** incluye la frecuencia cardíaca y las calorías en su análisis.

**Setup nativo (una vez creado el proyecto Android):**

```bash
npm i capacitor-health-connect
npx cap sync android
```

Y en `android/app/src/main/AndroidManifest.xml` añade los permisos de lectura de Health
Connect que pida el plugin (ejercicio, frecuencia cardíaca y calorías). El usuario final
necesita la app **Health Connect** de Google Play y su reloj vinculado.

> Nota: la capa de integración está en `src/lib/wearable.ts` con carga dinámica del plugin —
> la app web compila y funciona aunque el plugin no esté instalado. Si usas otro plugin de
> Health Connect, solo hay que ajustar ese archivo.

---

## 🔐 Seguridad de la clave de API (importante)

Actualmente el coach llama a la API de Claude **directamente desde el cliente**
(`dangerouslyAllowBrowser: true`), con la clave que el usuario introduce en Ajustes. Esto es
cómodo para un MVP, pero **expone la clave en el dispositivo**.

Para una app pública/producción, lo correcto es:

1. Un **backend/proxy** (por ejemplo una función serverless) que guarde la clave del servidor.
2. La app llama a *tu* backend, y el backend reenvía la petición a la API de Claude.

Así la clave nunca vive en el cliente. Cuando quieras dar ese paso, se cambia únicamente el
módulo `src/ai/coach.ts` para que apunte a tu endpoint en lugar de al SDK directo.

---

## 🗂️ Estructura

```
src/
  ai/coach.ts        # Integración con Claude + coach offline por reglas
  lib/tennis.ts      # Cálculo de estadísticas, rachas y tendencias
  screens/           # Onboarding, Home, LogSession, Progress, Coach, Settings
  store.tsx          # Estado global (React Context) + persistencia
  storage.ts         # Carga/guardado en localStorage
  types.ts           # Modelos de datos
  index.css          # Estilos (tema oscuro, mobile-first)
capacitor.config.ts  # Configuración de la app nativa
```

---

## 🧰 Stack

- React 18 + Vite 5 + TypeScript
- `@anthropic-ai/sdk` (modelo `claude-opus-4-8`)
- Capacitor 6 (Android)
- Sin backend: datos en el dispositivo

Hecho con 🎾 y Claude.
