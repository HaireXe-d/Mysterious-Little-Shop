// 从雨天应急包合图 a06949ac 裁出单品（透明底，自动修剪）
const fs = require('fs');
const { decodePNG, encodePNG } = require('./pnglib');

const P = 'e:/前端/♂神秘小店/image/product/';
const SRC = 'a06949ac-4da6-45c8-8192-1f3d0655c65f.png';
const PAD = 16;

function cut(src, out, rect) {
  const img = decodePNG(P + src);
  let [x1, y1, x2, y2] = rect;
  x2 = Math.min(x2, img.w); y2 = Math.min(y2, img.h);
  const w = x2 - x1, h = y2 - y1;
  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const so = ((y + y1) * img.w + x1) * 4;
    img.data.copy(data, y * w * 4, so, so + w * 4);
  }
  let minx = w, miny = h, maxx = 0, maxy = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (data[(y * w + x) * 4 + 3] > 8) {
      if (x < minx) minx = x; if (x > maxx) maxx = x;
      if (y < miny) miny = y; if (y > maxy) maxy = y;
    }
  }
  if (minx > maxx || miny > maxy) { console.log('EMPTY', out); return; }
  minx = Math.max(0, minx - PAD); miny = Math.max(0, miny - PAD);
  maxx = Math.min(w - 1, maxx + PAD); maxy = Math.min(h - 1, maxy + PAD);
  const tw = maxx - minx + 1, th = maxy - miny + 1;
  const out2 = Buffer.alloc(tw * th * 4);
  for (let y = 0; y < th; y++) {
    data.copy(out2, y * tw * 4, ((y + miny) * w + minx) * 4, ((y + miny) * w + minx) * 4 + tw * 4);
  }
  fs.writeFileSync(P + out, encodePNG(tw, th, out2));
  console.log(out, tw + 'x' + th);
}

// 急救包（红）
cut(SRC, '应急_急救包.png', [540, 400, 940, 840]);
// 防水手机袋（蓝）
cut(SRC, '应急_手机袋.png', [820, 500, 1200, 960]);
// 一次性雨衣（绿折叠）
cut(SRC, '应急_雨衣.png', [200, 680, 760, 1150]);
// LED手电筒（黑）
cut(SRC, '应急_手电筒.png', [690, 920, 1130, 1170]);
// 便携雨伞（绿）
cut(SRC, '应急_雨伞.png', [40, 100, 800, 780]);
