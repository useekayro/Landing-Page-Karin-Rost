/* Acha as colunas livres de uma fotografia, para pousar texto ESCURO
   ao lado da pessoa em vez de por cima dela.

   Complementa medir-sujeito.mjs, que responde "de onde até onde vai a
   faixa livre ACIMA da cabeça". Aqui a pergunta é lateral: até onde
   posso escrever pela esquerda, e a partir de onde pela direita?

   Por que não serve a varredura de "coluna 100% fundo": num estúdio o
   chão tem sombra e o fundo tem gradiente, então quase nenhuma coluna
   é limpa de cima a baixo — a primeira tentativa devolveu 0% de
   coluna livre numa arte que tem 451px deles. O que importa não é ser
   fundo puro, e sim não ser ESCURO: o que derruba tinta escura é a
   massa da pessoa e da poltrona, não um cinza de 92% de luminância.

   Limiar: luminância relativa < 0,40. Uma coluna entra na conta de
   "massa escura" quando 0,4% da altura dela passa desse limiar, o que
   filtra fios de cabelo soltos e ruído de compressão.

   Uso:  node tools/medir-escuro.mjs                                 */

import sharp from 'sharp'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = dirname(dirname(fileURLToPath(import.meta.url)))
const img = join(raiz, 'assets', 'img')

/* As artes que hoje carregam texto ao lado da figura. */
const ARTES = [
  ['karin-convidar.png', 'CTA desktop 16:9'],
  ['karin-convidar-m-853.webp', 'CTA mobile 2:3'],
]

const ESCURO = 0.40          // luminância relativa
const FRACAO = 0.004         // da altura, para uma coluna contar

const lin = (v) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)

console.log('\narte                 massa escura        livre à esquerda   livre à direita')
console.log('─'.repeat(78))

for (const [arquivo, rotulo] of ARTES) {
  const origem = join(img, arquivo)
  const { width: W, height: H } = await sharp(origem).metadata()
  const { data, info } = await sharp(origem).raw().toBuffer({ resolveWithObject: true })
  const ch = info.channels

  const porColuna = new Array(W).fill(0)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * ch
      if (lum(data[i], data[i + 1], data[i + 2]) < ESCURO) porColuna[x]++
    }
  }

  const limiar = Math.max(3, Math.floor(H * FRACAO))
  let esq = 0
  while (esq < W && porColuna[esq] < limiar) esq++
  let dir = W - 1
  while (dir >= 0 && porColuna[dir] < limiar) dir--

  const pc = (v) => ((v / W) * 100).toFixed(1) + '%'
  console.log(
    `${rotulo.padEnd(20)} ${pc(esq)} a ${pc(dir + 1)}`.padEnd(41) +
    `${String(esq).padStart(4)}px (${pc(esq)})`.padEnd(19) +
    `${String(W - dir - 1).padStart(4)}px (a partir de ${pc(dir + 1)})`
  )
}

console.log(
  '\nO bloco do CTA para ANTES do início da massa escura; ver .cta__bloco\n' +
  'em 05-sections.css, onde a largura no desktop é `25% - gutter`.\n'
)
