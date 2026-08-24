/* ════════════════════════════════════════════════════════════════
   Gera as variantes de imagem do site.

   REGRA Nº 1 DO PRODUCT.md: as fotografias não podem ser modificadas.
   Nada aqui corta, estica, força proporção ou aplica filtro. As duas
   únicas operações são:

     • redimensionar  — reduzir resolução não é corte nem mudança de
                        proporção; é o que qualquer srcset faz;
     • WebP LOSSLESS  — recompressão sem perda. Os pixels decodificados
                        são idênticos ao PNG, bit a bit. Escolha do
                        cliente sobre a alternativa com perda (q90, que
                        daria 0,71 MB em vez de 7,65 MB).

   Saídas por foto vertical (mobile, ≤60rem):
     -m-941.png / .webp   cópia da largura nativa entregue
     -m-640.png / .webp   redução para telas estreitas

   Saídas por foto horizontal (desktop, >60rem):
     .webp                mesma resolução, só recomprimido

   Logo: 1276px de origem para exibir a 56px. Uma variante de 256px
   cobre 4× DPI com folga. O arquivo original continua na pasta.

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
const VERTICAIS = [
  ['karin foto 6 9,16.png', 'hero-colunas'],
  ['karin foto 4 9,16.png', 'emblema'],
  ['karin foto 7 9,16.png', 'justica-direito'],
  ['karin foto 3 9,16.png', 'karin-escritorio'],
  ['karin foto 1 9,16.png', 'karin-azul'],
  ['karin foto 2 9,16.png', 'karin-conversa'],
]

const HORIZONTAIS = [
  'hero-colunas', 'emblema', 'justica-direito',
  'karin-escritorio', 'karin-azul', 'karin-conversa',
]

const NATIVA = 941
const REDUZIDA = 640
const LOGO = 256

const SEM_PERDA = { lossless: true, effort: 6 }

const kb = (n) => Math.round(n / 1024)
const tam = async (p) => (await stat(p)).size

let antes = 0, depois = 0

console.log('── verticais (mobile) ' + '─'.repeat(46))
for (const [arquivo, nome] of VERTICAIS) {
  const origem = join(img, arquivo)
  const meta = await sharp(origem).metadata()
  if (meta.width !== NATIVA) {
    throw new Error(`${arquivo}: largura ${meta.width}, esperava ${NATIVA}`)
  }

  // Largura nativa: cópia exata em PNG, e o mesmo conteúdo em WebP.
  const png941 = join(img, `${nome}-m-${NATIVA}.png`)
  await copyFile(origem, png941)
  const webp941 = join(img, `${nome}-m-${NATIVA}.webp`)
  await sharp(origem).webp(SEM_PERDA).toFile(webp941)

  // Reduzida: só resize, proporção calculada pelo sharp.
  const menor = sharp(origem).resize({ width: REDUZIDA, withoutEnlargement: true })
  const png640 = join(img, `${nome}-m-${REDUZIDA}.png`)
  await menor.clone().png({ compressionLevel: 9 }).toFile(png640)
  const webp640 = join(img, `${nome}-m-${REDUZIDA}.webp`)
  await menor.clone().webp(SEM_PERDA).toFile(webp640)

  const [a, b] = [await tam(png941), await tam(webp941)]
  antes += a; depois += b
  console.log(
    `${nome.padEnd(18)} 941: ${String(kb(a)).padStart(5)}KB png -> ${String(kb(b)).padStart(5)}KB webp` +
    `   640: ${String(kb(await tam(png640))).padStart(5)}KB png -> ${String(kb(await tam(webp640))).padStart(4)}KB webp`
  )
}

console.log('\n── horizontais (desktop) ' + '─'.repeat(43))
for (const nome of HORIZONTAIS) {
  const origem = join(img, `${nome}.png`)
  const saida = join(img, `${nome}.webp`)
  await sharp(origem).webp(SEM_PERDA).toFile(saida)
  const [a, b] = [await tam(origem), await tam(saida)]
  antes += a; depois += b
  console.log(`${nome.padEnd(18)} ${String(kb(a)).padStart(5)}KB png -> ${String(kb(b)).padStart(5)}KB webp`)
}

console.log('\n── logo ' + '─'.repeat(60))
{
  const origem = join(img, 'logo.png')
  const meta = await sharp(origem).metadata()
  const menor = sharp(origem).resize({ width: LOGO, withoutEnlargement: true })
  const png = join(img, `logo-${LOGO}.png`)
  const webp = join(img, `logo-${LOGO}.webp`)
  await menor.clone().png({ compressionLevel: 9 }).toFile(png)
  await menor.clone().webp(SEM_PERDA).toFile(webp)
  const [a, b, c] = [await tam(origem), await tam(png), await tam(webp)]
  console.log(
    `logo               ${meta.width}px ${String(kb(a)).padStart(5)}KB` +
    `  ->  ${LOGO}px ${kb(b)}KB png / ${kb(c)}KB webp  (exibido a 56px)`
  )
}

const mb = (n) => (n / 1048576).toFixed(2)
console.log('\n' + '─'.repeat(68))
console.log(`Fotos em resolucao de entrega: ${mb(antes)} MB png -> ${mb(depois)} MB webp lossless`)
console.log(`Reducao: ${Math.round((1 - depois / antes) * 100)}% — pixels identicos ao PNG.`)
