import sharp from 'sharp';
const arq = 'foto da hero 9,16.png';
const { data, info } = await sharp(arq).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const L = (x, y) => { const i = (y * info.width + x) * 3; return 0.2126*lin(data[i]) + 0.7152*lin(data[i+1]) + 0.0722*lin(data[i+2]); };
const hex = (x, y) => { const i = (y * info.width + x) * 3; return '#' + [data[i],data[i+1],data[i+2]].map(v=>v.toString(16).padStart(2,'0')).join(''); };

const cols = 24, rows = 34;
console.log(`${info.width}x${info.height}  ('.' claro p/ tinta escura · 'o' meio · '#' escuro)`);
for (let r = 0; r < rows; r++) {
  let s = '';
  for (let c = 0; c < cols; c++) {
    let min = 1;
    for (let x = Math.floor(info.width*c/cols); x < info.width*(c+1)/cols; x += 3)
      for (let y = Math.floor(info.height*r/rows); y < info.height*(r+1)/rows; y += 3)
        min = Math.min(min, L(x, y));
    s += min > 0.62 ? '.' : min > 0.25 ? 'o' : '#';
  }
  console.log(String(Math.round(r/rows*100)).padStart(3) + '% ' + s);
}
function janela(x0,x1,y0,y1,nome){
  let min=1, onde='';
  for (let x=Math.floor(info.width*x0); x<info.width*x1; x+=2)
    for (let y=Math.floor(info.height*y0); y<info.height*y1; y+=2) {
      const l=L(x,y); if (l<min){min=l; onde=hex(x,y)+` (${(x/info.width*100).toFixed(0)}%,${(y/info.height*100).toFixed(0)}%)`;}
    }
  const raz = t => ((min+0.05)/(t+0.05)).toFixed(2);
  console.log(`  ${nome.padEnd(28)} pior ${onde.padEnd(22)} escura ${raz(0.0063)}  neblina ${raz(0.181)}  bronze ${raz(0.118)}`);
}
console.log('\njanelas para texto escuro:');
janela(0.00,0.45,0.00,1.00,'coluna clara 0-45%');
janela(0.04,0.42,0.03,0.55,'x 4-42%, y 3-55%');
janela(0.04,0.40,0.55,0.97,'x 4-40%, y 55-97%');
