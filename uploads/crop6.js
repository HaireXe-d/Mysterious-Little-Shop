// 自行车补胎素材裁图
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

// 主图：6c0a3942（车轮+枝叶+补胎工具箱+打气筒+扳手）
fs.copyFileSync(P + '6c0a3942-1e95-450f-9858-ba2756d78607.png', P + '自行车补胎_主图.png');
console.log('自行车补胎_主图.png 1254x1254');

// 第1步 故障检查：13dd8297（车轮+放大镜）整图
fs.copyFileSync(P + '13dd8297-71d4-4a02-b4fb-2c15107644e9.png', P + '自行车补胎_故障检查.png');
console.log('自行车补胎_故障检查.png 1254x1254');

// 第2步 拆胎检查：从主图裁左下角两根撬胎扳手
cut('6c0a3942-1e95-450f-9858-ba2756d78607.png', '自行车补胎_拆胎检查.png', [100, 980, 580, 1254]);

// 第3步 补胎修复：从主图裁棕色补胎工具箱
cut('6c0a3942-1e95-450f-9858-ba2756d78607.png', '自行车补胎_补胎修复.png', [390, 680, 1010, 1200]);

// 第4步 安装充气：从 097984be 裁右侧黄色立式打气筒
cut('097984be-c7e7-4d0d-aa85-bf5ce9e798cc.png', '自行车补胎_安装充气.png', [740, 120, 1190, 1130]);

// 第5步 试骑交付：从 91d4bf48 图标表裁自行车（第3行左）
cut('91d4bf48-e9ef-4dd3-9a5c-c37a7c2e2c99.png', '自行车补胎_试骑交付.png', [280, 750, 720, 1060]);
