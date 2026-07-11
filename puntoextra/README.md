# Punto Extra — marca, landing y app Android

**El tutor de toda la familia por $99 al mes.** Membresía educativa familiar para México:
tutor de tareas con IA (socrático, temario SEP), clase en vivo semanal, prep UNAM/IPN y
reporte dominical para mamá y papá. Basado en el modelo de negocio
"Membresía educativa familiar" (julio 2026).

```
puntoextra/
  BRAND.md            # Guía de marca: esencia, voz, color, tipografía, logo, reglas
  brand/
    logo.svg          # Wordmark horizontal
    icon.svg          # Icono de app (burbuja + ficha "+")
  landing/
    index.html        # Landing autocontenida (HTML+CSS, es-MX, mobile-first)
    privacidad.html   # Aviso de privacidad (borrador para revisión legal)
  app/                # App Android (React + Vite + TS + Capacitor 7)
```

## Landing

Sin build: abre `landing/index.html` o publica la carpeta `landing/` completa en cualquier
hosting estático (GitHub Pages, Netlify, Vercel). Incluye demo interactivo del tutor,
contador de lugares fundadores (edita `FAMILIAS_FUNDADORAS` en el script de `index.html`
conforme se unan familias), SEO completo (OG, JSON-LD de producto y FAQ) y el portal de la
app web en `landing/app/` (regenerable con `npm run portal`). El WhatsApp configurado es
`wa.me/526141062426`.

## App (React + Vite + Capacitor)

```bash
cd puntoextra/app
npm install
npm run dev          # desarrollo web en http://localhost:5174
npm run build        # typecheck + build de producción
npm run android      # build + sync + abrir Android Studio
npm run android:apk  # APK release (requiere Android SDK y firma)
npm run assets       # regenera iconos launcher, splash y ficha de Play
npm run portal       # build de la app web → landing/app/ (el "Portal" de la landing)
```

El proyecto nativo está versionado en `app/android/` (appId `mx.puntoextra.app`, nombre
"Punto Extra", iconos adaptativos y splash de marca ya generados). Los recursos de la ficha de
Google Play están en `app/store-assets/`.

### Qué hace la app (Fase 1 del modelo)

- **Onboarding familiar**: mamá/papá crea la cuenta, agrega hasta 4 hijos con su grado
  (1º primaria → 3º prepa) y elige plan ($79 individual / $99 familiar / $899 anual).
- **Inicio**: panel por hijo con actividades de la semana, racha 🔥 y puntos.
- **Tutor 💬**: chat socrático por hijo. Sin clave de API funciona en modo offline con
  guías por reglas (fracciones, ecuaciones, porcentajes, acentuación, física, inglés…);
  con una clave de Anthropic (Ajustes) responde con IA completa. **Nunca da la respuesta.**
- **Quiz 🏅**: quiz del día por nivel (muestra del banco alineado a temario SEP + reactivos
  tipo UNAM/IPN para prepa), con pista al primer error y explicación al acertar.
- **Reporte 📊**: el "reporte del domingo" — ejercicios, días activos, aciertos, materias
  y *en qué se atora* cada hijo — listo para compartir por WhatsApp.
- **Persistencia local** (localStorage) — sin backend en el MVP.
- **Familia de ejemplo**: desde el onboarding, "Explora con una familia de ejemplo"
  carga a los García (3 hijos, 2 semanas de actividad, simulacros y medallas) para
  demostrar la app poblada a mamás, aliados o inversionistas. Se borra en Ajustes.
- **Simulacro UNAM/IPN** cronometrado (secundaria/prepa), logros y gráfica semanal.

### Nota de producción

La clave de API nunca debe vivir en el cliente: antes de publicar, apunta
`src/ai/tutor.ts` a un backend/proxy propio (igual que cobros y banco de quizzes).
El canal principal del negocio es WhatsApp; esta app es el complemento (Fase 1).
