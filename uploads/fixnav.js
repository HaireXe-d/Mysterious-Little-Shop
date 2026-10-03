const fs = require('fs');
const files = ['01.html', '02.html', '03.html', '04.html', 'index.html'];
files.forEach(f => {
  const p = 'e:/前端/♂神秘小店/' + f;
  let s = fs.readFileSync(p, 'utf8');
  const before = s;
  s = s.replace(/<li><a href="#">寝室生活<\/a><\/li>/g, '<li><a href="05.html">寝室生活</a></li>');
  if (s !== before) { fs.writeFileSync(p, s); console.log('UPDATED', f); }
  else { console.log('OK', f); }
});
