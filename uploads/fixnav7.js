const fs = require('fs');
const dir = 'e:/前端/♂神秘小店/';
const files = ['index.html', '01.html', '02.html', '03.html', '04.html', '05.html', '06.html'];
const old = '<li><a href="#">毕业专区</a></li>';
const neu = '<li><a href="07.html">毕业专区</a></li>';
files.forEach(f => {
  let s = fs.readFileSync(dir + f, 'utf8');
  const n = s.split(old).length - 1;
  s = s.split(old).join(neu);
  fs.writeFileSync(dir + f, s);
  console.log(f, 'replaced', n);
});
