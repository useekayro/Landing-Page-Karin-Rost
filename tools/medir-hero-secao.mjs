/* Mapa de luminância do novo hero de seção inteira: onde o texto
   escuro sobrevive e onde começa a fotografia. */
import sharp from 'sharp';

const arq = 'hero seção inteira.png';
const m = await sharp(arq).metadata();
console.log(`${arq}: ${m.width}x${m.height} ${m.format} alfa=${m.hasAlpha}`);

const { data, info } = await sharp(arq).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const L = (x, y) => {
  const i = (y * info.width + x) * 3;
  return 0.2126 * lin(data[i]) + 0.7152 * lin(data[i + 1]) + 0.0722 * lin(data[i + 2]);
};
const hex = (x, y) => {
  const i = (y * info.width + x) * 3;
  return '#' + [data[i], data[i+1], data[i+2]].map(v => v.toString(16).padStart(2, '0')).join('');
};

/* mapa: '.' claro o bastante para tinta escura, 'o' meio, '#' escuro */
const cols = 46, rows = 16;
console.log("\nmapa ('.' claro / 'o' meio / '#' escuro)");
for (let r = 0; r < rows; r++) {
  let linha = '';
  for (let c = 0; c < cols; c++) {
    let min = 1;
    for (let x = Math.floor(info.width * c / cols); x < info.width * (c + 1) / cols; x += 4)
      for (let y = Math.floor(info.height * r / rows); y < info.height * (r + 1) / rows; y += 4)
        min = Math.min(min, L(x, y));
    linha += min > 0.62 ? '.' : min > 0.25 ? 'o' : '#';
  }
  console.log(String(r).padStart(2) + ': ' + linha);
}

/* pior caso (mais escuro) em janelas candidatas para texto escuro */
function janela(x0, x1, y0, y1, nome) {
  let min = 1, onde = '';
  for (let x = Math.floor(info.width * x0); x < info.width * x1; x += 3)
    for (let y = Math.floor(info.height * y0); y < info.height * y1; y += 3) {
      const l = L(x, y);
      if (l < min) { min = l; onde = hex(x, y) + ` em ${(x / info.width * 100).toFixed(0)}%,${(y / info.height * 100).toFixed(0)}%`; }
    }
  const razao = t => ((min + 0.05) / (t + 0.05)).toFixed(2);
  console.log(`  ${nome.padEnd(26)} pior ${onde.padEnd(24)} tinta-escura ${razao(0.0063)}:1  azul-neblina ${razao(0.181)}:1  bronze ${razao(0.118)}:1`);
}
console.log('\njanelas candidatas (texto escuro sobre a foto)');
janela(0.00, 0.50, 0.00, 1.00, 'metade esquerda');
janela(0.04, 0.52, 0.10, 0.90, 'x 4-52%, y 10-90%');
janela(0.04, 0.58, 0.12, 0.88, 'x 4-58%, y 12-88%');
janela(0.04, 0.62, 0.15, 0.85, 'x 4-62%, y 15-85%');
