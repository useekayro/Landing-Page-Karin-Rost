/* Acha onde a pessoa está dentro da fotografia.

   Serve para ancorar tipografia SOBRE a arte sem cobrir o rosto. A
   pergunta que ele responde é uma só: de onde até onde vai a faixa
   limpa acima da cabeça?

   Por que não dá para estimar no olho: a arte do CTA mudou três vezes
   em 2026-09-22 e a faixa livre saltou de 34,7% (na vertical 2:3) para
   7,3% (na horizontal 16:9). São composições diferentes do mesmo
   ensaio, e um número chutado cobriria a cabeça dela numa delas.

   Método: "fundo de estúdio" é pixel claro e pouco saturado
   (luminância > 218 e amplitude RGB < 16). O que foge disso é a
   pessoa, a poltrona ou a sombra. O topo da CABEÇA é medido só no
   miolo horizontal (25-78%), senão a sombra no chão e a poltrona
   puxariam a leitura para cima.

   Uso:  node tools/medir-sujeito.mjs                                */

import sharp from 'sharp'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = dirname(dirname(fileURLToPath(import.meta.url)))
const img = join(raiz, 'assets', 'img')

/* [arquivo, rótulo] — as artes que hoje carregam texto por cima. */
const ARTES = [
  ['karin-convidar.png', 'CTA desktop 16:9'],
  ['karin convidar 9,16.jpeg', 'CTA mobile 2:3'],
]

const CLARO = 218      // luminância mínima do fundo de estúdio
const CINZA = 16       // amplitude RGB máxima para contar como neutro
const MIOLO = [0.25, 0.78]

const ehFundo = (r, g, b) =>
  Math.max(r, g, b) > CLARO && Math.max(r, g, b) - Math.min(r, g, b) < CINZA

const pc = (v, t) => ((v / t) * 100).toFixed(1) + '%'

console.log('\narte                 cabeça começa em   faixa livre   corpo sugerido')
console.log('─'.repeat(72))

for (const [arquivo, rotulo] of ARTES) {
  const origem = join(img, arquivo)
  const { width: W, height: H } = await sharp(origem).metadata()
  const { data, info } = await sharp(origem).raw().toBuffer({ resolveWithObject: true })
  const ch = info.channels

  let cabeca = H
  const x0 = Math.floor(W * MIOLO[0])
  const x1 = Math.floor(W * MIOLO[1])

  for (let y = 0; y < H && cabeca === H; y++) {
    let n = 0
    for (let x = x0; x < x1; x++) {
      const i = (y * W + x) * ch
      if (!ehFundo(data[i], data[i + 1], data[i + 2])) n++
    }
    if (n > 12) cabeca = y
  }

  /* A chamada é centrada no meio da faixa: é esse número que vai para
     o `top` de .cta__h em 05-sections.css. */
  const meio = ((cabeca / H) * 100) / 2

  console.log(
    `${rotulo.padEnd(20)} ${pc(cabeca, H).padStart(6)}            ` +
    `${String(cabeca).padStart(4)}px       top: ${meio.toFixed(2)}%`
  )
}

console.log(
  '\nO `top` acima já é o MEIO da faixa; .cta__h usa translateY(-50%)\n' +
  'por cima dele, para o número não depender da altura do tipo.\n'
)
