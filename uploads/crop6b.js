// 重裁收紧：拆胎检查 / 补胎修复 / 安装充气
const fs = require('fs');
const { decodePNG, encodePNG } = require('./pnglib');

const P = 'e:/前端/♂神秘小店/image/product/';
const PAD = 14;

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

// 第2步 拆胎检查：只留两根撬胎扳手（工具箱在原图 x>560 区域，切掉）
cut('6c0a3942-1e95-450f-9858-ba2756d78607.png', '自行车补胎_拆胎检查.png', [120, 1000, 560, 1254]);

// 第3步 补胎修复：工具箱为主，切掉左侧扳手（x1=470）
cut('6c0a3942-1e95-450f-9858-ba2756d78607.png', '自行车补胎_补胎修复.png', [470, 690, 1010, 1200]);

// 第4步 安装充气：只留黄色立式打气筒（小打气筒在原图 x<800，切掉）
cut('097984be-c7e7-4d0d-aa85-bf5ce9e798cc.png', '自行车补胎_安装充气.png', [855, 130, 1190, 1130]);
