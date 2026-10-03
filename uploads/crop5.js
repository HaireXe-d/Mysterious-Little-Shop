// 寝室生活素材裁图
const fs = require('fs');
const { decodePNG, encodePNG } = require('./pnglib');

const P = 'e:/前端/♂神秘小店/image/product/';
const PAD = 12;

function cut(src, out, rect) {
  const img = decodePNG(P + src);
  let [x1, y1, x2, y2] = rect;
  if (!rect) { x1 = 0; y1 = 0; x2 = img.w; y2 = img.h; }

  const w = x2 - x1, h = y2 - y1;
  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const so = ((y + y1) * img.w + x1) * 4;
    img.data.copy(data, y * w * 4, so, so + w * 4);
  }

  // 修剪透明边界
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

// 主图直接复制（三个收纳箱+盆栽）
fs.copyFileSync(P + '5eb39bb2-a7fa-49fc-abbf-3bb9892f9440.png', P + '宿舍收纳_主图.png');
const b = fs.readFileSync(P + '宿舍收纳_主图.png');
console.log('宿舍收纳_主图.png', b.readUInt32BE(16) + 'x' + b.readUInt32BE(20));

// 邮戳：右上角绿色圆形印章区
cut('5eb39bb2-a7fa-49fc-abbf-3bb9892f9440.png', '宿舍收纳_邮戳.png', [1200, 50, 1448, 300]);

// 抽屉收纳盒（中上方）：大概 x180-900, y100-600
cut('5eb39bb2-a7fa-49fc-abbf-3bb9892f9440.png', '宿舍收纳_桌面收纳柜.png', [180, 80, 950, 600]);

// 分隔收纳盒（右侧）：大概 x850-1400, y300-800
cut('5eb39bb2-a7fa-49fc-abbf-3bb9892f9440.png', '宿舍收纳_门后挂袋.png', [850, 280, 1400, 800]);

// 扁平床底收纳袋（左下方）：大概 x0-600, y500-1000
cut('5eb39bb2-a7fa-49fc-abbf-3bb9892f9440.png', '宿舍收纳_床底收纳袋.png', [0, 480, 650, 1086]);
