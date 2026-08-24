/* ════════════════════════════════════════════════════════════════
   Gera as variantes mobile das fotos verticais 9:16 da cliente.

   REGRA Nº 1 DO PRODUCT.md: as fotografias não podem ser modificadas.
   Este script só REDIMENSIONA — nada de corte, proporção forçada,
   filtro ou reencode com perda. A proporção 941:1672 sai idêntica em
   todas as saídas, e a variante grande é uma CÓPIA byte a byte do
   arquivo original.

   Duas variantes por foto:
     -m-941  cópia exata do arquivo entregue (largura nativa)
     -m-640  redução para telas estreitas / DPR menor

   O briefing sugeria 940 como variante grande, mas o nativo é 941:
   reencodar a foto inteira para economizar 1 pixel seria mexer na
   compressão sem ganho nenhum. Copiar preserva o arquivo original.

   Uso:  node tools/gerar-mobile.mjs
   ════════════════════════════════════════════════════════════════ */

import sharp from 'sharp'
import { copyFile, stat } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = dirname(dirname(fileURLToPath(import.meta.url)))
const img = join(raiz, 'assets', 'img')

/* Os nomes de origem têm espaço e vírgula — sempre por variável,
   nunca montando string de shell. */
const MAPA = [
  ['karin foto 6 9,16.png', 'hero-colunas'],
  ['karin foto 4 9,16.png', 'emblema'],
  ['karin foto 7 9,16.png', 'justica-direito'],
  ['karin foto 3 9,16.png', 'karin-escritorio'],
  ['karin foto 1 9,16.png', 'karin-azul'],
  ['karin foto 2 9,16.png', 'karin-conversa'],
]

const NATIVA = 941
const REDUZIDA = 640

const kb = (n) => Math.round(n / 1024)

for (const [arquivo, nome] of MAPA) {
  const origem = join(img, arquivo)

  const meta = await sharp(origem).metadata()
  if (meta.width !== NATIVA) {
    throw new Error(`${arquivo}: largura ${meta.width}, esperava ${NATIVA}`)
  }

  // Variante grande: cópia exata, sem passar pelo encoder.
  const grande = join(img, `${nome}-m-${NATIVA}.png`)
  await copyFile(origem, grande)

  // Variante reduzida: só resize, proporção calculada pelo sharp.
  const pequena = join(img, `${nome}-m-${REDUZIDA}.png`)
  await sharp(origem)
    .resize({ width: REDUZIDA, withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(pequena)

  const [a, b, c] = await Promise.all([stat(origem), stat(grande), stat(pequena)])
  const dim = await sharp(pequena).metadata()

  console.log(
    `${nome.padEnd(18)} ${meta.width}x${meta.height} ${String(kb(a.size)).padStart(5)}KB` +
    `  ->  941 ${String(kb(b.size)).padStart(5)}KB (copia)` +
    `  |  ${dim.width}x${dim.height} ${String(kb(c.size)).padStart(4)}KB`
  )
}
