const { decodePNG } = require('e:/前端/♂神秘小店/uploads/pnglib.js');
const dir = 'e:/前端/♂神秘小店/image/product/';
const files = ['毕业代售_提交.png','毕业代售_上架.png','毕业代售_下单.png','毕业代售_手推车.png','毕业代售_收款.png','毕业代售_相机.png','毕业代售_书籍.png','毕业代售_收纳.png','毕业代售_充电线.png','毕业代售_包袋.png','毕业代售_主图.png'];
files.forEach(f => {
  const img = decodePNG(dir + f);
  const w = img.w, h = img.h, d = img.data;
  const p = (x, y) => { const i = (y * w + x) * 4; return d[i+3]; };
  console.log(f, w + 'x' + h,
    'corners a=', p(0,0), p(w-1,0), p(0,h-1), p(w-1,h-1),
    'mid-edge a=', p(w>>1, 2), p(2, h>>1));
});
