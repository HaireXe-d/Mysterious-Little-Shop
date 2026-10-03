const fs = require('fs');
const p = 'e:/前端/♂神秘小店/07.html';
let s = fs.readFileSync(p, 'utf8');
const map = {
  'ee355e2e-db1e-406c-94b2-92230e1bebb6.png': '毕业代售_提交.png',
  'e015af4f-8c99-4976-ae91-6866375c32ca.png': '毕业代售_上架.png',
  '62487d3e-27a9-4027-9a38-d8ce131405ae.png': '毕业代售_下单.png',
  '535e1940-237a-4352-a5de-a3124f30e097.png': '毕业代售_收款.png',
  'd5acdbe8-31e0-4210-bdff-8f6b6a8db359.png': '毕业代售_相机.png',
  '51be3c7b-5a9f-40e9-9a87-3275285d92be.png': '毕业代售_收纳.png',
  '53048c5d-8596-4796-8147-2d04a89b51c6.png': '毕业代售_充电线.png',
  'eb9a381a-e0bc-49c8-add7-c6f4b3676367.png': '毕业代售_包袋.png'
};
for (const [k, v] of Object.entries(map)) {
  const n = s.split(k).length - 1;
  s = s.split(k).join(v);
  console.log(v, 'replaced', n);
}
fs.writeFileSync(p, s);
console.log('done');
