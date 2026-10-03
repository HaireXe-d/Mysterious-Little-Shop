const { decodePNG } = require('e:/前端/♂神秘小店/uploads/pnglib.js');
const dir = 'e:/前端/♂神秘小店/image/product/';
const files = [
  'ee355e2e-db1e-406c-94b2-92230e1bebb6.png',
  'e015af4f-8c99-4976-ae91-6866375c32ca.png',
  '62487d3e-27a9-4027-9a38-d8ce131405ae.png',
  '535e1940-237a-4352-a5de-a3124f30e097.png',
  'd5acdbe8-31e0-4210-bdff-8f6b6a8db359.png',
  '毕业代售_书籍.png',
  '51be3c7b-5a9f-40e9-9a87-3275285d92be.png',
  '53048c5d-8596-4796-8147-2d04a89b51c6.png',
  'eb9a381a-e0bc-49c8-add7-c6f4b3676367.png'
];
files.forEach(f => {
  const img = decodePNG(dir + f);
  const w = img.w, h = img.h, d = img.data;
  // 网格采样 9 点的 alpha 与灰度
  const samples = [];
  for (const [fx, fy] of [[0.15,0.15],[0.5,0.15],[0.85,0.15],[0.15,0.5],[0.85,0.5],[0.15,0.85],[0.5,0.85],[0.85,0.85]]) {
    const x = Math.floor(w*fx), y = Math.floor(h*fy);
    const i = (y*w+x)*4;
    samples.push(`(${x},${y}):${d[i]},${d[i+1]},${d[i+2]},a${d[i+3]}`);
  }
  console.log(f);
  console.log('   ', samples.join('  '));
});
