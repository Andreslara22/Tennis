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
