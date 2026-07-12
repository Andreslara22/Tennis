# Punto Extra — Guía de marca

**Producto:** membresía educativa familiar · $99 MXN/mes por toda la familia · México
**Dominio sugerido:** `puntoextra.mx` (alternativas: `puntoextra.com.mx`, `puntoextra.app`)

---

## 0. Por qué este nombre

**Punto Extra** es el punto que dan los maestros mexicanos por esforzarse, participar y
entregar bien la tarea. Todo niño lo persigue y toda mamá sabe lo que significa. Es la
recompensa perfecta para un producto que premia la constancia (rachas, quizzes, reportes)
— y también describe lo que la membresía es para la familia: *el punto extra* que sus
hijos necesitan para destacar.

**Historia de la decisión (julio 2026):**

1. El nombre provisional del modelo de negocio era "Tarea+". **Descartado:**
   [Tareasplus](https://es.wikipedia.org/wiki/Tareasplus) es una plataforma edtech en
   español fundada en 2012 (apps iOS/Android) y además existe tareasplus.com.mx —
   confusión directa en la misma categoría.
2. Segundo candidato: "Cae el Veinte" (del dicho *ya me cayó el veinte*). **Descartado:**
   muy distintivo, pero quien no conoce el modismo no lo entiende a la primera.
3. **Elegido: Punto Extra.** Verificación: sin apps educativas ni marcas de tutoría con
   este nombre en búsquedas web y Google Play; `puntoextra.mx` sin DNS (aparentemente
   libre — confirmar en un registrar). Lo más cercano: *PuntoEdu* (app colombiana para
   docentes, nombre y público distintos). **Pendiente antes de invertir en la marca:**
   búsqueda fonética formal en IMPI (clase 41, educación) con abogado.

## 1. Esencia

**Punto Extra es el tutor de toda la familia.** Un tutor con IA disponible todos los días
por WhatsApp que explica paso a paso (nunca da la respuesta), alineado al temario SEP, con
una clase en vivo semanal y un reporte cada domingo para mamá y papá.

- **Promesa:** "Por menos de lo que cuesta UNA hora de regularización al mes, un tutor
  disponible todos los días para todos tus hijos."
- **Posicionamiento en una frase:** *El tutor de toda la familia por $99 al mes.*
- **La frase de producto:** *El punto extra que tus hijos necesitan.*
- **A quién le hablamos:** a la mamá (30–45, NSE C+/C/C-, urbana, 2–3 hijos). Ella compra,
  ella recibe el reporte. Los hijos usan el tutor.
- **Contra qué competimos:** Kumon a $1,300/mes por materia y por hijo, clases particulares
  de $200–350/hora, y "ChatGPT gratis" que hace la tarea en vez de enseñar.

## 2. Nombre y tagline

| Elemento | Valor |
|---|---|
| Nombre | **Punto Extra** (wordmark: `punto` + píldora ámbar `extra`) |
| Tagline principal | **El tutor de toda la familia.** |
| Tagline de producto | *El punto extra que tus hijos necesitan.* |
| Tagline de precio | *Todos tus hijos, todas las materias, $99 al mes.* |
| Nombre de la app | Punto Extra |
| Paquete Android | `mx.puntoextra.app` |

La **insignia "+1"** es el activo gráfico central: círculo ámbar con "+1" en tinta y
destellos. Es el punto extra recién ganado — aparece en logros, rachas y celebraciones.

## 2.5 Punti, la mascota 🖍️

**Punti** es el lápiz kawaii de Punto Extra: goma rosa, banda lavanda, cuerpo ámbar,
ojos grandes brillosos y manitas juntas al frente (pose oficial del logo/icono).
Archivo maestro: `brand/punti.svg` · icono: `brand/icon.svg` · en la app: `app/src/components/Punti.tsx`.

- **Poses:** *manitas juntas* (logo oficial), *saluda* (bienvenidas), *celebra* (aciertos,
  logros, simulacros — con destellos).
- **Animación:** flotadito suave, parpadeo cada ~4.6s, saludo de bracito, destellos
  pulsantes. Siempre en CSS/SVG (nunca GIF) y respetando `prefers-reduced-motion`.
- **Reglas:** Punti nunca regaña ni llora; celebra o acompaña. No se estira, no se
  recolorea, no habla en primera persona en el copy de precios/legal.

## 3. Voz

Cercana, de mamá a mamá, español mexicano, cero tecnicismos. Hablamos de "tu hijo",
"la tarea", "el examen de la UNAM" — no de "modelos de lenguaje" ni "plataformas".
El lenguaje de la escuela es nuestro: puntos extra, palomitas, rachas, "se ganó su punto".

- ✅ "Diego practicó fracciones 4 veces esta semana y se ganó 3 puntos extra."
- ✅ "No le damos la respuesta: lo llevamos paso a paso hasta que lo resuelve él solo."
- ❌ "Nuestra plataforma de tutoría potenciada por IA generativa…"

Regla de oro: **el reporte del domingo es la voz de la marca.** Todo copy debería sonar
como ese reporte: concreto, útil y tranquilizador.

## 4. Color

| Rol | Nombre | Hex | Uso |
|---|---|---|---|
| Primario | Mora | `#5B3DF5` | Marca, botones primarios, títulos sobre claro |
| Primario oscuro | Mora noche | `#4527D8` | Hover, gradientes |
| Tinta | Tinta | `#221A4A` | Texto principal, fondo del footer |
| Fondo | Crema | `#FFF8EF` | Fondo de landing y app (cálido, no clínico) |
| Acento | Punto (ámbar) | `#FFC53D` | La insignia "+1", highlights, rachas y logros |
| CTA WhatsApp | Verde WA | `#25D366` | Solo botones que abren WhatsApp |
| Alerta suave | Coral | `#FF6B5E` | "Se atora en…", avisos |
| Superficie | Blanco | `#FFFFFF` | Tarjetas |

Contrastes verificados: Tinta sobre Crema y Blanco sobre Mora superan AA para texto normal.
El ámbar (`#FFC53D`) solo lleva encima texto Tinta, nunca blanco.

## 5. Tipografía

- **Titulares y UI:** [Nunito](https://fonts.google.com/specimen/Nunito) (redondeada,
  amable, excelente en pesos 700–900). Fallback: `system-ui, -apple-system, "Segoe UI", sans-serif`.
- **Números y datos del reporte:** Nunito 800 tabular.
- Nunca usar tipografías "infantiles" (Comic Sans y similares): la compradora es la mamá.

## 6. Logo

- **Wordmark:** `punto` en Tinta (Nunito 900, minúsculas) + **píldora ámbar con "extra"**
  y destellos. Archivo: `brand/logo.svg`.
- **Icono de app:** **Punti** (manitas juntas) sobre gradiente Mora con destellos ámbar.
  Archivo: `brand/icon.svg` (usado también como favicon y en la ficha de Play).
- Área de protección: el diámetro de la insignia alrededor de todo el logo.
- No inclinar, no delinear, no cambiar la insignia de color, no ponerla sobre fotos ocupadas.

## 7. Reglas de aplicación

1. **WhatsApp primero:** el CTA principal de cualquier pieza es "Empieza por WhatsApp"
   en Verde WA. La app es complemento.
2. **El precio siempre visible:** $99/mes familiar aparece en el primer pantallazo de
   cualquier pieza. El precio *es* el posicionamiento.
3. **Mostrar el reporte:** en anuncios y landing siempre se enseña un reporte semanal real
   (es el arma anti-churn y el diferenciador frente a ChatGPT).
4. **Nunca prometer respuestas:** prohibido copy tipo "te resolvemos la tarea". Somos el
   tutor que enseña — el "+1" se gana, no se regala.
