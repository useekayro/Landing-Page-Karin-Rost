/* Arte vertical 9:16 do hero, nas duas larguras que o celular usa.
   Mesma convenção de nome do resto do projeto: -m-640 e -m-941. */
import sharp from 'sharp';
const src = 'foto da hero 9,16.png';

await sharp(src).webp({ quality: 90 }).toFile('assets/img/hero-secao-m-941.webp');
await sharp(src).png({ compressionLevel: 9 }).toFile('assets/img/hero-secao-m-941.png');
await sharp(src).resize({ width: 640 }).webp({ quality: 90 }).toFile('assets/img/hero-secao-m-640.webp');
await sharp(src).resize({ width: 640 }).png({ compressionLevel: 9 }).toFile('assets/img/hero-secao-m-640.png');

for (const a of ['hero-secao-m-941.webp','hero-secao-m-941.png','hero-secao-m-640.webp','hero-secao-m-640.png']) {
  const m = await sharp('assets/img/' + a).metadata();
  const { size } = await import('node:fs').then(fs => fs.statSync('assets/img/' + a));
  console.log(`${a.padEnd(24)} ${m.width}x${m.height}  ${(size/1024).toFixed(0)} KB`);
}
