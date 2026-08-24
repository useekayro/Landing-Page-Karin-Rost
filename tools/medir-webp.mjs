// Mede o que WebP economizaria. NAO escreve nada no projeto.
import sharp from 'sharp'
import { mkdtemp, stat, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const img = 'C:\\lp karin rost certo\\assets\\img'
const dir = await mkdtemp(join(tmpdir(), 'webp-'))

const FOTOS = [
  ['karin foto 6 9,16.png', 'hero-colunas'],
  ['karin foto 4 9,16.png', 'emblema'],
  ['karin foto 7 9,16.png', 'justica-direito'],
  ['karin foto 3 9,16.png', 'karin-escritorio'],
  ['karin foto 1 9,16.png', 'karin-azul'],
  ['karin foto 2 9,16.png', 'karin-conversa'],
]

const kb = n => Math.round(n / 1024)
let tPng640 = 0, tLl640 = 0, tQ90_640 = 0, tQ90_941 = 0, tPng941 = 0

console.log('foto                png941   png640 | webp-lossless640  webp-q90-640  webp-q90-941')
for (const [arq, nome] of FOTOS) {
  const src = join(img, arq)
  const p941 = (await stat(src)).size
  const p640 = (await stat(join(img, `${nome}-m-640.png`))).size

  const base = () => sharp(src).resize({ width: 640 })
  const a = join(dir, nome + '-ll.webp')
  const b = join(dir, nome + '-q90.webp')
  const c = join(dir, nome + '-941.webp')
  await base().webp({ lossless: true }).toFile(a)
  await base().webp({ quality: 90 }).toFile(b)
  await sharp(src).webp({ quality: 90 }).toFile(c)

  const [sa, sb, sc] = await Promise.all([stat(a), stat(b), stat(c)])
  tPng941 += p941; tPng640 += p640; tLl640 += sa.size; tQ90_640 += sb.size; tQ90_941 += sc.size

  console.log(
    nome.padEnd(18) +
    String(kb(p941)).padStart(6) + 'KB' + String(kb(p640)).padStart(8) + 'KB |' +
    String(kb(sa.size)).padStart(14) + 'KB' + String(kb(sb.size)).padStart(13) + 'KB' +
    String(kb(sc.size)).padStart(13) + 'KB'
  )
}

const mb = n => (n / 1048576).toFixed(2)
console.log('\nTOTAIS das 6 fotos')
console.log('  PNG 941 (hoje, desktop) : ' + mb(tPng941) + ' MB')
console.log('  PNG 640 (gerado agora)  : ' + mb(tPng640) + ' MB')
console.log('  WebP lossless 640       : ' + mb(tLl640) + ' MB  (-' + Math.round((1 - tLl640 / tPng640) * 100) + '% vs png640)')
console.log('  WebP q90 640            : ' + mb(tQ90_640) + ' MB  (-' + Math.round((1 - tQ90_640 / tPng640) * 100) + '% vs png640)')
console.log('  WebP q90 941            : ' + mb(tQ90_941) + ' MB  (-' + Math.round((1 - tQ90_941 / tPng941) * 100) + '% vs png941)')

await rm(dir, { recursive: true, force: true })
