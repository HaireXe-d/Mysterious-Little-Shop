const { decodePNG } = require('e:/前端/♂神秘小店/uploads/pnglib.js');
const dir = 'e:/前端/♂神秘小店/image/product/';
const img = decodePNG(dir + 'c5c90396-647c-43b1-9bfc-4b73309ba3e3.png');
const w = img.w, h = img.h, d = img.data;
const pts = [[0,0],[10,10],[w-11,10],[10,h-11],[w-11,h-11],[Math.floor(w/2),5],[5,Math.floor(h/2)],[Math.floor(w/2),h-6]];
pts.forEach(([x,y]) => {
  const i = (y*w+x)*4;
  console.log(`(${x},${y}) rgba=`, d[i], d[i+1], d[i+2], d[i+3]);
});
