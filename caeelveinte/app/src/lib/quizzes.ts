import type { Materia, Nivel } from '../types'

/**
 * Banco de quizzes por nivel y materia (muestra del MVP).
 * En producción este banco vive en el backend, alineado al temario SEP
 * por grado y bimestre; aquí incluimos una muestra representativa.
 */
export interface Pregunta {
  id: string
  nivel: Nivel
  materia: Materia
  tema: string
  pregunta: string
  opciones: string[]
  correcta: number // índice en opciones
  pista: string // se muestra al primer error (modo socrático)
  explicacion: string
}

export const BANCO: Pregunta[] = [
  // ─── Primaria baja (1º–3º) ───
  { id: 'pb-m1', nivel: 'PB', materia: 'Matemáticas', tema: 'Sumas con acarreo',
    pregunta: '¿Cuánto es 47 + 25?', opciones: ['62', '72', '75', '65'], correcta: 1,
    pista: 'Suma primero las unidades: 7 + 5 = 12. ¿Qué haces con el 1 que se "lleva"?',
    explicacion: '7+5=12: escribes 2 y llevas 1. Luego 4+2+1=7. Resultado: 72.' },
  { id: 'pb-m2', nivel: 'PB', materia: 'Matemáticas', tema: 'Tablas de multiplicar',
    pregunta: '¿Cuánto es 6 × 7?', opciones: ['42', '36', '48', '40'], correcta: 0,
    pista: 'Piensa en 6 × 5 = 30 y súmale dos veces 6 más.',
    explicacion: '6×5=30, más 6×2=12 → 30+12=42.' },
  { id: 'pb-e1', nivel: 'PB', materia: 'Español', tema: 'Sílabas',
    pregunta: '¿Cuántas sílabas tiene la palabra "mariposa"?', opciones: ['2', '3', '4', '5'], correcta: 2,
    pista: 'Sepárala con palmadas: ma… ri… po…',
    explicacion: 'ma-ri-po-sa: 4 sílabas.' },
  { id: 'pb-c1', nivel: 'PB', materia: 'Ciencias', tema: 'Seres vivos',
    pregunta: '¿Cuál de estos NO es un ser vivo?', opciones: ['Árbol', 'Piedra', 'Hormiga', 'Pez'], correcta: 1,
    pista: '¿Cuál de ellos no nace, no crece y no se reproduce?',
    explicacion: 'La piedra no nace, no crece, no se alimenta ni se reproduce: no es un ser vivo.' },
  { id: 'pb-i1', nivel: 'PB', materia: 'Inglés', tema: 'Colores',
    pregunta: '¿Cómo se dice "rojo" en inglés?', opciones: ['Blue', 'Green', 'Red', 'Yellow'], correcta: 2,
    pista: 'Es el color de una manzana madura… empieza con R.',
    explicacion: '"Red" es rojo. Blue = azul, green = verde, yellow = amarillo.' },

  // ─── Primaria alta (4º–6º) ───
  { id: 'pa-m1', nivel: 'PA', materia: 'Matemáticas', tema: 'Fracciones equivalentes',
    pregunta: '¿Cuál fracción es equivalente a 2/8?', opciones: ['1/2', '1/4', '2/4', '3/8'], correcta: 1,
    pista: '¿Entre qué número puedes dividir el 2 y el 8 a la vez?',
    explicacion: 'Dividiendo arriba y abajo entre 2: 2÷2=1 y 8÷2=4 → 1/4.' },
  { id: 'pa-m2', nivel: 'PA', materia: 'Matemáticas', tema: 'Decimales',
    pregunta: '¿Cuánto es 0.5 + 0.25?', opciones: ['0.30', '0.75', '0.55', '1.25'], correcta: 1,
    pista: 'Piensa en dinero: 50 centavos más 25 centavos…',
    explicacion: '0.50 + 0.25 = 0.75, como 50¢ + 25¢ = 75¢.' },
  { id: 'pa-m3', nivel: 'PA', materia: 'Matemáticas', tema: 'Perímetro y área',
    pregunta: 'Un rectángulo mide 6 cm de largo y 4 cm de ancho. ¿Cuál es su área?',
    opciones: ['10 cm²', '20 cm²', '24 cm²', '48 cm²'], correcta: 2,
    pista: 'El área de un rectángulo se calcula multiplicando, no sumando.',
    explicacion: 'Área = largo × ancho = 6 × 4 = 24 cm². (El perímetro sería 20 cm.)' },
  { id: 'pa-e1', nivel: 'PA', materia: 'Español', tema: 'Acentuación',
    pregunta: '¿Cuál palabra es esdrújula?', opciones: ['Canción', 'Árbol', 'Música', 'Reloj'], correcta: 2,
    pista: 'Las esdrújulas llevan la fuerza en la antepenúltima sílaba… y SIEMPRE llevan tilde.',
    explicacion: 'MÚ-si-ca: la sílaba tónica es la antepenúltima → esdrújula.' },
  { id: 'pa-c1', nivel: 'PA', materia: 'Ciencias', tema: 'Estados de la materia',
    pregunta: '¿Cómo se llama el cambio de líquido a gas?', opciones: ['Condensación', 'Evaporación', 'Fusión', 'Solidificación'], correcta: 1,
    pista: 'Piensa en un charco después de la lluvia cuando sale el sol: el agua se…',
    explicacion: 'La evaporación es el paso de líquido a gas; la condensación es el camino inverso.' },
  { id: 'pa-h1', nivel: 'PA', materia: 'Historia', tema: 'Independencia de México',
    pregunta: '¿En qué año inició la Independencia de México?', opciones: ['1810', '1821', '1910', '1521'], correcta: 0,
    pista: 'El Grito de Dolores fue un 15 de septiembre… ¿de qué año? (Terminó en 1821.)',
    explicacion: 'Inició en 1810 con el Grito de Dolores y se consumó en 1821.' },

  // ─── Secundaria ───
  { id: 's-m1', nivel: 'SEC', materia: 'Matemáticas', tema: 'Ecuaciones de primer grado',
    pregunta: 'Si 3x + 5 = 20, ¿cuánto vale x?', opciones: ['3', '5', '15', '8'], correcta: 1,
    pista: 'Primero deja solo el 3x: ¿qué le haces al 5 de ambos lados?',
    explicacion: '3x = 20 − 5 = 15, entonces x = 15 ÷ 3 = 5.' },
  { id: 's-m2', nivel: 'SEC', materia: 'Matemáticas', tema: 'Porcentajes',
    pregunta: '¿Cuánto es el 15% de 200?', opciones: ['15', '20', '30', '35'], correcta: 2,
    pista: 'El 10% de 200 es 20. ¿Y el 5%? Súmalos.',
    explicacion: '10% de 200 = 20 y 5% = 10 → 15% = 30.' },
  { id: 's-m3', nivel: 'SEC', materia: 'Matemáticas', tema: 'Teorema de Pitágoras',
    pregunta: 'Un triángulo rectángulo tiene catetos de 3 y 4. ¿Cuánto mide la hipotenusa?',
    opciones: ['5', '6', '7', '12'], correcta: 0,
    pista: 'a² + b² = c². Calcula 3² + 4² y busca qué número al cuadrado da eso.',
    explicacion: '3²+4² = 9+16 = 25, y √25 = 5.' },
  { id: 's-e1', nivel: 'SEC', materia: 'Español', tema: 'Sujeto y predicado',
    pregunta: 'En "Los alumnos de tercero presentaron su proyecto", ¿cuál es el sujeto?',
    opciones: ['presentaron', 'su proyecto', 'Los alumnos de tercero', 'de tercero'], correcta: 2,
    pista: 'Pregúntale al verbo: ¿QUIÉNES presentaron?',
    explicacion: 'El sujeto es quien realiza la acción: "Los alumnos de tercero".' },
  { id: 's-c1', nivel: 'SEC', materia: 'Ciencias', tema: 'Leyes de Newton',
    pregunta: '"A toda acción corresponde una reacción igual y en sentido contrario" es la…',
    opciones: ['Primera ley', 'Segunda ley', 'Tercera ley', 'Ley de gravitación'], correcta: 2,
    pista: 'Es la ley de la ACCIÓN y REACCIÓN… ¿qué número tiene?',
    explicacion: 'Es la tercera ley de Newton (acción y reacción).' },
  { id: 's-c2', nivel: 'SEC', materia: 'Ciencias', tema: 'La célula',
    pregunta: '¿Qué organelo produce la energía de la célula?', opciones: ['Núcleo', 'Mitocondria', 'Ribosoma', 'Membrana'], correcta: 1,
    pista: 'Se le conoce como "la central energética" de la célula.',
    explicacion: 'La mitocondria produce ATP, la energía de la célula.' },
  { id: 's-h1', nivel: 'SEC', materia: 'Historia', tema: 'Revolución Mexicana',
    pregunta: '¿Quién promulgó la Constitución de 1917?', opciones: ['Porfirio Díaz', 'Francisco I. Madero', 'Venustiano Carranza', 'Emiliano Zapata'], correcta: 2,
    pista: 'Fue el "Primer Jefe" del Ejército Constitucionalista.',
    explicacion: 'Venustiano Carranza convocó al Congreso Constituyente que promulgó la Constitución de 1917.' },
  { id: 's-i1', nivel: 'SEC', materia: 'Inglés', tema: 'Pasado simple',
    pregunta: '¿Cuál es el pasado de "go"?', opciones: ['goed', 'gone', 'went', 'going'], correcta: 2,
    pista: 'Es un verbo irregular: no termina en -ed. "Yesterday I ____ to school."',
    explicacion: '"Go" es irregular: go → went → gone.' },

  // ─── Prepa / Aspirante UNAM-IPN ───
  { id: 'pr-m1', nivel: 'PREPA', materia: 'Matemáticas', tema: 'Ecuación cuadrática',
    pregunta: '¿Cuáles son las raíces de x² − 5x + 6 = 0?', opciones: ['2 y 3', '−2 y −3', '1 y 6', '−1 y 6'], correcta: 0,
    pista: 'Busca dos números que multiplicados den +6 y sumados den +5.',
    explicacion: '(x−2)(x−3)=0 → x=2 o x=3. Ambos multiplican 6 y suman 5.' },
  { id: 'pr-m2', nivel: 'PREPA', materia: 'Matemáticas', tema: 'Funciones',
    pregunta: 'Si f(x) = 2x² − 1, ¿cuánto vale f(−2)?', opciones: ['−9', '7', '−7', '9'], correcta: 1,
    pista: 'Cuidado con el signo: (−2)² es positivo.',
    explicacion: 'f(−2) = 2(4) − 1 = 8 − 1 = 7.' },
  { id: 'pr-c1', nivel: 'PREPA', materia: 'Ciencias', tema: 'Química: tabla periódica',
    pregunta: '¿Cuál es el símbolo químico del sodio?', opciones: ['So', 'S', 'Na', 'N'], correcta: 2,
    pista: 'Viene de su nombre en latín: natrium.',
    explicacion: 'Na, del latín natrium. S es azufre y N es nitrógeno.' },
  { id: 'pr-h1', nivel: 'PREPA', materia: 'Historia', tema: 'Historia universal',
    pregunta: '¿En qué año cayó el Muro de Berlín?', opciones: ['1985', '1989', '1991', '1993'], correcta: 1,
    pista: 'Dos años antes de la disolución de la URSS (1991).',
    explicacion: 'El Muro de Berlín cayó el 9 de noviembre de 1989.' },
  { id: 'pr-e1', nivel: 'PREPA', materia: 'Español', tema: 'Comprensión lectora',
    pregunta: '"Implícito" significa que algo está…', opciones: ['Dicho con claridad', 'Sobreentendido sin decirse', 'Escrito dos veces', 'En otro idioma'], correcta: 1,
    pista: 'Es lo contrario de "explícito".',
    explicacion: 'Implícito = incluido sin expresarse directamente; se sobreentiende.' },
]

/** Devuelve las preguntas del día para un nivel (rotan según la fecha). */
export function quizDelDia(nivel: Nivel, n = 5): Pregunta[] {
  const pool = BANCO.filter((p) => p.nivel === nivel)
  if (pool.length <= n) return pool
  // rotación determinista por día para que "el quiz de hoy" sea estable
  const dia = Math.floor(Date.now() / 86400000)
  const start = dia % pool.length
  return Array.from({ length: n }, (_, i) => pool[(start + i) % pool.length])
}
