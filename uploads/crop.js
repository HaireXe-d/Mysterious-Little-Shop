// 高清素材切图：裁剪 + 按透明边界修剪 + 保存
const fs = require('fs');
const { decodePNG, encodePNG } = require('./pnglib');

const P = 'e:/前端/♂神秘小店/image/product/';
const OUT = 'e:/前端/♂神秘小店/image/product/';

// 裁剪区域（基于 1254/1448 原图坐标），null = 整图
const jobs = [
  // [源文件, 输出文件, [x1,y1,x2,y2] 或 null]
  ['80b8b1f2-5fe9-4990-8a43-8a0fe19b25f0.png', '电脑清灰重装_标题.png', null],
  ['4a238af0-cc46-4b07-9a4a-5af5822359a6.png', '电脑清灰重装_主图.png', null],
  ['5eb39bb2-a7fa-49fc-abbf-3bb9892f9440.png', '电脑清灰重装_邮戳.png', [1100, 90, 1440, 340]],
  ['b3850593-c02d-4a52-ac8d-1fce749ff151.png', '电脑清灰_检测评估.png', null],
  ['4a238af0-cc46-4b07-9a4a-5af5822359a6.png', '电脑清灰_深度清灰.png', [0, 370, 300, 730]],
  ['91051efe-9a19-4a2f-9b3a-84ad0caa0894.png', '电脑清灰_系统重装.png', null],
  ['3fe98e26-0454-4a03-8f67-fb72c6a2eeb0.png', '电脑清灰_软件安装.png', [214, 360, 725, 985]],
  ['1961ab33-328b-4fc7-a35a-8052616d0205.png', '电脑清灰_测试交付.png', null],
];

const PAD = 12;

for (const [src, out, rect] of jobs) {
  const img = decodePNG(P + src);
  let x1 = 0, y1 = 0, x2 = img.w, y2 = img.h;
  if (rect) { x1 = rect[0]; y1 = rect[1]; x2 = rect[2]; y2 = rect[3]; }

  // 找内容包围盒（alpha > 8）
  let minx = x2, miny = y2, maxx = x1, maxy = y1;
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      if (img.data[(y * img.w + x) * 4 + 3] > 8) {
        if (x < minx) minx = x;
        if (x > maxx) maxx = x;
        if (y < miny) miny = y;
        if (y > maxy) maxy = y;
      }
    }
  }
  if (minx > maxx || miny > maxy) { console.log('EMPTY', out); continue; }
  minx = Math.max(0, minx - PAD); miny = Math.max(0, miny - PAD);
  maxx = Math.min(img.w - 1, maxx + PAD); maxy = Math.min(img.h - 1, maxy + PAD);

  const w = maxx - minx + 1, h = maxy - miny + 1;
  const data = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const so = ((y + miny) * img.w + minx) * 4;
    img.data.copy(data, y * w * 4, so, so + w * 4);
  }
  fs.writeFileSync(OUT + out, encodePNG(w, h, data));
  console.log(out, w + 'x' + h);
}
