/* Gera os arquivos da nova hero a partir dos originais entregues.
   O recorte da Karin tem canal alfa: webp e png o preservam, então a
   figura pousa direto no campo claro, sem retângulo. */
import sharp from 'sharp';
import { copyFile } from 'node:fs/promises';

const foto = 'karin foto pra hero conforme referencia.avif';
const logo = 'logo pra usar na hero conforme referencia.png';

await copyFile(foto, 'assets/img/hero-karin.avif');
await sharp(foto).webp({ quality: 92, alphaQuality: 100 }).toFile('assets/img/hero-karin.webp');
await sharp(foto).png({ compressionLevel: 9 }).toFile('assets/img/hero-karin.png');

await copyFile(logo, 'assets/img/logo-hero.png');
await sharp(logo).webp({ quality: 95, alphaQuality: 100 }).toFile('assets/img/logo-hero.webp');
await sharp(logo).resize({ width: 858 }).png({ compressionLevel: 9 }).toFile('assets/img/logo-hero@2x.png');

for (const a of ['hero-karin.avif', 'hero-karin.webp', 'hero-karin.png',
                 'logo-hero.png', 'logo-hero.webp', 'logo-hero@2x.png']) {
  const m = await sharp('assets/img/' + a).metadata();
  const { size } = await sharp('assets/img/' + a).toBuffer({ resolveWithObject: true }).then(r => r.info)
    .then(i => ({ size: i.size }));
  console.log(`${a.padEnd(20)} ${m.width}x${m.height}  alfa=${m.hasAlpha}`);
}
