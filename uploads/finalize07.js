const fs = require('fs');
const { decodePNG, encodePNG } = require('e:/前端/♂神秘小店/uploads/pnglib.js');
const dir = 'e:/前端/♂神秘小店/image/product/';
const files = ['毕业代售_主图.png','毕业代售_手推车.png','毕业代售_提交.png','毕业代售_上架.png','毕业代售_下单.png','毕业代售_收款.png','毕业代售_相机.png','毕业代售_书籍.png','毕业代售_收纳.png','毕业代售_充电线.png','毕业代售_包袋.png'];
// 这些图全部用在 #faf7ef 米色卡片上：残留的浅色低饱和（烤入棋盘格透出/亮白水彩）统一压成米色不透明
const CR = 247, CG = 243, CB = 234;
files.forEach(f => {
  const img = decodePNG(dir + f);
  const w = img.w, h = img.h, d = img.data;
  let n = 0;
  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    if (d[o + 3] === 0) continue;
    const r = d[o], g = d[o + 1], b = d[o + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mn >= 225 && (mx - mn) <= 8) { d[o] = CR; d[o + 1] = CG; d[o + 2] = CB; n++; }
  }
  fs.writeFileSync(dir + f, encodePNG(w, h, d));
  console.log(f, 'flattened', n, 'px');
});
