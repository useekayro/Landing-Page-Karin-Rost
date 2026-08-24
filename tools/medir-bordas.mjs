/* Mede as bordas de topo e base das fotos verticais.

   No mobile a foto ocupa 100% da largura, então só topo e base
   encostam no fundo da seção — são essas que precisam casar.

   Além da média, reporta o DESVIO da faixa: se a borda variar muito,
   nenhum hex chapado vai dissolver e o certo é assumir a aresta em
   vez de fingir uma fusão. Sem desvio não dá para decidir isso.

   Uso:  node tools/medir-bordas.mjs                                */

import sharp from 'sharp'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = dirname(dirname(fileURLToPath(import.meta.url)))
const img = join(raiz, 'assets', 'img')

const FOTOS = [
  ['karin foto 6 9,16.png', 'hero-colunas',     '.hero'],
  ['karin foto 4 9,16.png', 'emblema',          '.cena--emblema'],
  ['karin foto 7 9,16.png', 'justica-direito',  '.banda'],
  ['karin foto 3 9,16.png', 'karin-escritorio', '.cena--sobre'],
  ['karin foto 1 9,16.png', 'karin-azul',       '.cena--proc'],
  ['karin foto 2 9,16.png', 'karin-conversa',   '.cena--cta'],
]

const FAIXA = 6   // linhas de pixel amostradas em cada borda

const hex = (r, g, b) =>
  '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0').toUpperCase()).join('')

const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) }
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)

const mediana = (arr) => {
  arr.sort((a, b) => a - b)
  return arr[arr.length >> 1]
}

async function faixa(caminho, largura, altura, y0) {
  const { data } = await sharp(caminho)
    .extract({ left: 0, top: y0, width: largura, height: FAIXA })
    .raw().toBuffer({ resolveWithObject: true })

  const n = largura * FAIXA
  const canais = data.length / n
  const R = [], G = [], B = []
  let soma = [0, 0, 0], lmin = 2, lmax = -1

  for (let i = 0; i < n; i++) {
    const r = data[i * canais], g = data[i * canais + 1], b = data[i * canais + 2]
    R.push(r); G.push(g); B.push(b)
    soma[0] += r; soma[1] += g; soma[2] += b
    const L = lum(r, g, b)
    if (L < lmin) lmin = L
    if (L > lmax) lmax = L
  }

  return {
    // Mediana, não média: a borda desta arte cruza arco dourado e bloco
    // pêssego. A média mistura tudo e devolve um tom que não existe em
    // lugar nenhum da imagem; a mediana devolve a cor de campo real.
    mediana: hex(mediana(R), mediana(G), mediana(B)),
    media: hex(soma[0] / n, soma[1] / n, soma[2] / n),
    espalhamento: (lmax + 0.05) / (lmin + 0.05),
  }
}

console.log('foto              seção            TOPO mediana/média    BASE mediana/média    desvio')
for (const [arquivo, nome, secao] of FOTOS) {
  const caminho = join(img, arquivo)
  const { width, height } = await sharp(caminho).metadata()
  const topo = await faixa(caminho, width, height, 0)
  const base = await faixa(caminho, width, height, height - FAIXA)
  console.log(
    nome.padEnd(18) + secao.padEnd(17) +
    topo.mediana + '/' + topo.media + '   ' +
    base.mediana + '/' + base.media + '   ' +
    topo.espalhamento.toFixed(1) + 'x /' + base.espalhamento.toFixed(1) + 'x'
  )
}
console.log('\nUse a MEDIANA para casar o fundo da seção.')
console.log('Desvio alto so indica que a borda cruza um elemento grafico;')
console.log('nao impede o encaixe, desde que o fundo case com a cor de campo.')
