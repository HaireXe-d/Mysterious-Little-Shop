// 最终精修
const fs = require('fs');
const { decodePNG, encodePNG } = require('./pnglib');

const P = 'e:/前端/♂神秘小店/image/product/';
const PAD = 12;

function cut(src, out, rect, erases) {
  const img = decodePNG(P + src);
  const [x1, y1, x2, y2] = rect;
  const w = x2 - x1, h = y2 - y1;
  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const so = ((y + y1) * img.w + (x + x1)) * 4;
      const do_ = (y * w + x) * 4;
      const ax = x + x1, ay = y + y1;
      let keep = true;
      if (erases) for (const [ex1, ey1, ex2, ey2] of erases) {
        if (ax >= ex1 && ax < ex2 && ay >= ey1 && ay < ey2) { keep = false; break; }
      }
      if (keep) { data[do_] = img.data[so]; data[do_ + 1] = img.data[so + 1]; data[do_ + 2] = img.data[so + 2]; data[do_ + 3] = img.data[so + 3]; }
    }
  }
  let minx = w, miny = h, maxx = 0, maxy = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (data[(y * w + x) * 4 + 3] > 8) {
      if (x < minx) minx = x; if (x > maxx) maxx = x;
      if (y < miny) miny = y; if (y > maxy) maxy = y;
    }
  }
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

// 风扇：追加擦除右侧白色残片(喷罐底角)
cut('4a238af0-cc46-4b07-9a4a-5af5822359a6.png', '电脑清灰_深度清灰.png',
  [0, 370, 300, 780], [[245, 370, 300, 576], [266, 576, 300, 700], [232, 695, 300, 780], [258, 565, 300, 612]]);

// 纸箱堆：擦除右上保险柜边缘
cut('3fe98e26-0454-4a03-8f67-fb72c6a2eeb0.png', '电脑清灰_软件安装.png', [214, 360, 638, 775], [[622, 360, 638, 445]]);
