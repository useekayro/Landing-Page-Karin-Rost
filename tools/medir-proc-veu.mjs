/* Mede o contraste da abertura do Processo sobre karin-processo.png,
   com e sem o véu de .cena--proc .cena__texto::before.

   Por que existe: na arte nova o emblema cinza cai exatamente na faixa
   onde o lead e o parágrafo pousam. A varredura por células de 5% dizia
   3,5:1 ali — abaixo dos 4,5:1 de texto corrido —, e foi por isso que a
   abertura chegou a descer para baixo da foto. O véu resolve sem mexer
   na diagramação, e este script é a prova.

   Diferente de medir-bordas.mjs, aqui as janelas não são estimadas pela
   grade: são os retângulos de LINHA lidos do DOM no navegador, nos dois
   extremos do modo sobreposto (1200px, onde o texto é mais largo em %,
   e 1440px). Medir a célula e não a linha foi o que deixou passar o
   3,89:1 do lead na primeira rodada — ver DESIGN.md.

   Uso:  node tools/medir-proc-veu.mjs                                */

import sharp from 'sharp'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = dirname(dirname(fileURLToPath(import.meta.url)))
const FOTO = join(raiz, 'assets', 'img', 'karin-processo.png')

/* --tinta-clara é oklch(); o canvas não converte por nós. */
const oklch = (L, C, H) => {
  const h = (H * Math.PI) / 180
  const a = C * Math.cos(h), b = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
  const enc = v => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055
    return Math.min(1, Math.max(0, c)) * 255
  }
  return [
    enc(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    enc(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    enc(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
  ]
}

const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
const razao = (A, B) => { const a = lum(A) + 0.05, b = lum(B) + 0.05; return a > b ? a / b : b / a }

const TINTA = oklch(0.945, 0.008, 250)   // --tinta-clara
const AZUL = [0x19, 0x21, 0x2c]          // --azul, a cor do véu

/* O véu do CSS: inset 0 22% 0 0 (cobre 0–78% da foto) com paradas em
   0/38/58/100 DO ELEMENTO — aqui convertidas para % da foto. Mexeu no
   CSS, mexe aqui: as duas listas têm de contar a mesma história. */
const PARADAS = [[0, 0.62], [29.64, 0.62], [45.24, 0.52], [78, 0]]
const alfa = x => {
  for (let i = 0; i < PARADAS.length - 1; i++) {
    const [p0, a0] = PARADAS[i], [p1, a1] = PARADAS[i + 1]
    if (x <= p1) return a0 + (a1 - a0) * Math.max(0, (x - p0) / (p1 - p0))
  }
  return 0
}

/* Retângulos de linha em % da foto: [x0, x1, y0, y1].
   Lidos com Range.getClientRects() sobre a página servida. */
const JANELAS = [
  ['corrido 1200px', 4.5, [
    [5.06, 31.13, 28.09, 31.68], [5.06, 37.49, 33.20, 36.79], [5.06, 29.98, 40.55, 42.80],
    [5.06, 28.83, 44.21, 46.46], [5.06, 30.40, 47.87, 50.12], [5.06, 13.40, 51.53, 53.77],
  ]],
  ['corrido 1440px', 4.5, [
    [5.05, 26.73, 29.09, 32.08], [5.05, 32.02, 33.34, 36.33], [5.05, 25.83, 39.46, 41.32],
    [5.05, 24.87, 42.51, 44.38], [5.05, 26.19, 45.56, 47.43], [5.05, 12.00, 48.61, 50.48],
  ]],
  /* O título é grande: o mínimo dele é 3:1, não 4,5:1. */
  ['titulo 1200px', 3.0, [[5.06, 39.22, 3.17, 16.35], [8.77, 37.38, 12.03, 26.61]]],
  ['titulo 1440px', 3.0, [[5.05, 36.15, 6.84, 18.80], [8.43, 34.47, 14.91, 28.14]]],
]

const { width: W, height: H } = await sharp(FOTO).metadata()
const { data, info } = await sharp(FOTO).raw().toBuffer({ resolveWithObject: true })
const canais = info.channels

console.log(`\n${FOTO.split(/[\\/]/).pop()} — ${W}x${H}\n`)
console.log('  janela            sem véu   com véu   mínimo')

let reprovou = false
for (const [nome, minimo, rects] of JANELAS) {
  let sem = Infinity, com = Infinity
  for (const [x0, x1, y0, y1] of rects) {
    for (let y = Math.floor((y0 / 100) * H); y < Math.ceil((y1 / 100) * H); y++) {
      for (let x = Math.floor((x0 / 100) * W); x < Math.ceil((x1 / 100) * W); x++) {
        const i = (y * W + x) * canais
        const px = [data[i], data[i + 1], data[i + 2]]
        sem = Math.min(sem, razao(TINTA, px))
        const a = alfa((x / W) * 100)
        com = Math.min(com, razao(TINTA, px.map((v, k) => v * (1 - a) + AZUL[k] * a)))
      }
    }
  }
  const ok = com >= minimo
  if (!ok) reprovou = true
  console.log(`  ${nome.padEnd(16)}  ${sem.toFixed(2).padStart(6)}:1  ${com.toFixed(2).padStart(6)}:1  ` +
              `${String(minimo).padStart(5)}:1   ${ok ? 'passa' : 'REPROVA'}`)
}

console.log()
process.exit(reprovou ? 1 : 0)
