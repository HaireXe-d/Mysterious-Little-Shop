const fs = require('fs');
const dir = 'e:/前端/♂神秘小店/';
const html = fs.readFileSync(dir + '07.html', 'utf8');
const re = /(?:src|href)="((?!#|http)[^"]+\.(?:png|jpg|jpeg|svg|css|ico))"/gi;
let m, bad = 0, total = 0;
while ((m = re.exec(html))) {
  total++;
  const p = dir + m[1].replace(/^\.\//, '').split('/').join('\\');
  const ok = fs.existsSync(p);
  if (!ok) { bad++; console.log('MISSING:', m[1]); }
}
console.log('checked', total, 'assets, missing', bad);
