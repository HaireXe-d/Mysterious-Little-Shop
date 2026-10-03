const fs = require('fs');
const { decodePNG } = require('e:/前端/♂神秘小店/uploads/pnglib.js');
const dir = 'e:/前端/♂神秘小店/image/product/';
const files = [
  '毕业代售_主图.png',
  '毕业代售_书籍.png',
  '毕业代售_发货.png',
  'd5acdbe8-31e0-4210-bdff-8f6b6a8db359.png',
  '53048c5d-8596-4796-8147-2d04a89b51c6.png',
  '51be3c7b-5a9f-40e9-9a87-3275285d92be.png',
  'eb9a381a-e0bc-49c8-add7-c6f4b3676367.png',
  'ee355e2e-db1e-406c-94b2-92230e1bebb6.png',
  'e015af4f-8c99-4976-ae91-6866375c32ca.png',
  '62487d3e-27a9-4027-9a38-d8ce131405ae.png',
  '535e1940-237a-4352-a5de-a3124f30e097.png'
];
files.forEach(f => {
  const buf = fs.readFileSync(dir + f);
  const img = decodePNG(buf);
  const w = img.width, h = img.height, ch = img.channels;
  // sample 5 corner/edge points alpha
  const pts = [[2,2],[w-3,2],[2,h-3],[w-3,h-3],[Math.floor(w/2),3]];
  const alphas = pts.map(([x,y]) => ch === 4 ? img.data[(y*w+x)*4+3] : 255);
  console.log(f, w+'x'+h, 'ch='+ch, 'alpha@corners='+alphas.join(','));
});
