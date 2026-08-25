/* Gera a arte do hero de seção inteira em webp + png, nas larguras
   que a página realmente usa (1672 no desktop, 940 no celular). */
import sharp from 'sharp';

const src = 'hero seção inteira.png';

await sharp(src).webp({ quality: 90 }).toFile('assets/img/hero-secao.webp');
await sharp(src).png({ compressionLevel: 9, palette: false }).toFile('assets/img/hero-secao.png');
await sharp(src).resize({ width: 940 }).webp({ quality: 90 }).toFile('assets/img/hero-secao-940.webp');
await sharp(src).resize({ width: 940 }).png({ compressionLevel: 9 }).toFile('assets/img/hero-secao-940.png');

/* cor das bordas: é ela que o campo da seção precisa repetir para a
   foto dissolver no empilhamento do celular */
const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const px = (x, y) => { const i = (y * info.width + x) * 3; return [data[i], data[i+1], data[i+2]]; };
const hex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
const media = (x0, x1, y0, y1) => {
  let r = 0, g = 0, b = 0, n = 0;
  for (let x = x0; x < x1; x += 2) for (let y = y0; y < y1; y += 2) { const c = px(x, y); r += c[0]; g += c[1]; b += c[2]; n++; }
  return hex([r, g, b].map(v => Math.round(v / n)));
};
console.log('borda superior esquerda:', media(0, 600, 0, 6));
console.log('borda inferior esquerda:', media(0, 600, info.height - 6, info.height));
console.log('campo claro (miolo):    ', media(60, 900, 200, 740));

for (const a of ['hero-secao.webp', 'hero-secao.png', 'hero-secao-940.webp', 'hero-secao-940.png']) {
  const m = await sharp('assets/img/' + a).metadata();
  console.log(`${a.padEnd(20)} ${m.width}x${m.height}`);
}
