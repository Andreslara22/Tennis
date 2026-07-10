# 🚀 Plan de publicación en Google Play — AceCoach

Guía paso a paso para publicar y **actualizar sin desinstalar**. Léela entera una vez antes
de empezar.

---

## 0. La regla de oro de la firma 🔐

Android solo instala una actualización encima de la app existente si el APK/AAB nuevo está
**firmado con la misma clave** que el instalado. Si cambias de clave, el usuario tiene que
desinstalar. Por eso:

1. **Genera la clave UNA vez** → `./scripts/generate-keystore.sh`
   (crea `android/keystore/acecoach-upload.jks`)
2. Copia `android/keystore.properties.example` → `android/keystore.properties` y rellena las
   contraseñas.
3. **Haz copia de seguridad** del `.jks` y las contraseñas (gestor de contraseñas, disco
   cifrado…). El `.jks` y `keystore.properties` están en `.gitignore` — **nunca** se suben.
4. A partir de ahí, `./gradlew bundleRelease` firma siempre con esa clave y todas las
   versiones futuras actualizan limpiamente.

> ✅ **Usa Play App Signing** (activado por defecto al crear la app en Play Console): Google
> guarda la clave de firma final y tú firmas con tu "upload key". Si algún día pierdes la
> upload key, Google puede resetearla y no pierdes la app. Es la red de seguridad definitiva.

---

## 1. Preparación técnica (ya hecho en este repo ✅)

- [x] `applicationId` estable: `com.acecoach.app` (⚠️ no se puede cambiar tras publicar)
- [x] Firma de release por `keystore.properties` en `android/app/build.gradle`
- [x] `versionCode 2` / `versionName "0.2.0"` — **sube `versionCode` en cada subida a Play**
  (entero siempre creciente: 3, 4, 5…)
- [x] Permisos de Health Connect declarados en `AndroidManifest.xml`
- [x] Proyecto `android/` versionado en git (sin claves ni builds)

## 2. Compilar el bundle firmado

```bash
# App Bundle (.aab) — lo que sube a Google Play
npm run android:release
# → android/app/build/outputs/bundle/release/app-release.aab

# APK firmado (para probar en tu móvil sin Play)
npm run android:apk
# → android/app/build/outputs/apk/release/app-release.apk
```

Requisitos en tu máquina: Android Studio (SDK + JDK). Primera vez: acepta las licencias del
SDK y crea `android/local.properties` apuntando al SDK si Android Studio no lo hizo.

## 3. Cuenta y ficha en Play Console

1. Crea la cuenta de desarrollador en [play.google.com/console](https://play.google.com/console)
   (pago único de 25 USD).
2. **Crear app** → nombre "AceCoach", idioma español, tipo App, gratis.
3. Acepta **Play App Signing** (viene activado por defecto). Sube el `.aab`.

## 4. Ficha de la tienda (checklist)

- [ ] Descripción corta (80 chars) y larga (4000 chars)
- [ ] Icono 512×512 px y "feature graphic" 1024×500 px
- [ ] Mínimo 2 capturas de teléfono (usa las de la app: inicio, progreso, coach, ajustes)
- [ ] Categoría: Salud y bienestar (o Deportes)
- [ ] Datos de contacto del desarrollador

## 5. Requisitos de política (importantes por los datos de salud) ⚠️

Como la app lee datos de **Health Connect** (FC, ejercicio, calorías), Google exige extra:

- [ ] **Política de privacidad publicada en una URL** (obligatoria siempre, crítica aquí).
      Debe explicar qué datos de salud se leen, para qué, y que se quedan en el dispositivo.
      (Una página de GitHub Pages sirve.)
- [ ] **Formulario "Data safety"** en Play Console: declarar que se accede a datos de salud
      y que NO se comparten con terceros (en AceCoach todo queda en el dispositivo).
- [ ] **Declaración de Health Connect**: Play Console → Contenido de la app → hay un
      formulario específico para justificar cada permiso `android.permission.health.*`.
      Justificación: "importar los entrenamientos de tenis del reloj del usuario para
      mostrar su progreso deportivo". La revisión puede tardar unos días.
- [ ] Cuestionario de clasificación de contenido (apto para todos).
- [ ] Si usas la clave de API de Claude del usuario: menciona en la política de privacidad
      que las conversaciones del coach se envían a la API de Anthropic.

## 6. Lanzamiento por fases (recomendado)

1. **Pruebas internas** (hasta 100 testers por email) → súbete el primer `.aab` aquí y
   pruébalo tú con tu reloj. Se instala vía enlace de Play.
2. **Pruebas cerradas** → amigos del club de tenis 🎾
3. **Producción** → lanzamiento gradual (p.ej. 20% → 100%).

> Nota 2024+: las cuentas personales nuevas requieren un periodo de prueba cerrada con
> ≥12 testers durante 14 días antes de poder publicar en producción. Planifícalo.

## 7. Cada actualización futura (rutina)

```text
1. Sube versionCode (+1) y versionName en android/app/build.gradle
2. npm run android:release
3. Play Console → Producción → Crear versión → subir .aab → notas de la versión
4. Los usuarios reciben el update automáticamente, SIN desinstalar ✅
   (misma clave de firma + versionCode mayor = update limpio)
```

## 8. Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| "App not installed" al actualizar | Firma distinta a la instalada | Usa siempre el mismo `.jks`; en Play esto no pasa si no cambias la upload key |
| Play rechaza el `.aab` | `versionCode` repetido | Incrementa `versionCode` |
| Rechazo por permisos de salud | Falta la declaración de Health Connect | Rellena el formulario en Contenido de la app |
| El sync del reloj no hace nada | Falta la app Health Connect o permisos | Instalar Health Connect de Play y conceder permisos |
