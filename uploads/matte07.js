const fs = require('fs');
const { decodePNG, encodePNG } = require('e:/前端/♂神秘小店/uploads/pnglib.js');
const dir = 'e:/前端/♂神秘小店/image/product/';

// 先确认手推车图是真透明
const dolly = decodePNG(dir + 'c5c90396-647c-43b1-9bfc-4b73309ba3e3.png');
console.log('dolly', dolly.w + 'x' + dolly.h,
  'corner alpha =', dolly.data[3]);

const src = dir + '毕业代售_主图.png';
const img = decodePNG(src);
const w = img.w, h = img.h, d = img.data;
console.log('src', w + 'x' + h);

const isBg = (i) => {
  const r = d[i], g = d[i + 1], b = d[i + 2];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mn > 225 && (mx - mn) < 14; // 白/浅灰棋盘格 + 白色贴纸描边
};
const isFringe = (i) => {
  const r = d[i], g = d[i + 1], b = d[i + 2];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  return mn > 208 && (mx - mn) < 18;
};

const bg = new Uint8Array(w * h);
const stack = [];
const seed = (x, y) => {
  const idx = y * w + x;
  if (!bg[idx] && isBg(idx * 4)) { bg[idx] = 1; stack.push(idx); }
};
for (let x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
for (let y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }

while (stack.length) {
  const idx = stack.pop();
  const x = idx % w, y = (idx / w) | 0;
  if (x > 0) { const n = idx - 1; if (!bg[n] && isBg(n * 4)) { bg[n] = 1; stack.push(n); } }
  if (x < w - 1) { const n = idx + 1; if (!bg[n] && isBg(n * 4)) { bg[n] = 1; stack.push(n); } }
  if (y > 0) { const n = idx - w; if (!bg[n] && isBg(n * 4)) { bg[n] = 1; stack.push(n); } }
  if (y < h - 1) { const n = idx + w; if (!bg[n] && isBg(n * 4)) { bg[n] = 1; stack.push(n); } }
}

// 清理残余边缘（与背景相邻的浅灰抗锯齿像素），迭代2轮
for (let pass = 0; pass < 2; pass++) {
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (bg[idx]) continue;
      if (bg[idx - 1] || bg[idx + 1] || bg[idx - w] || bg[idx + w]) {
        if (isFringe(idx * 4)) bg[idx] = 2; // 标记本轮新删，避免连锁
      }
    }
  }
  for (let i = 0; i < bg.length; i++) if (bg[i] === 2) bg[i] = 1;
}

// 内容包围盒
let minX = w, minY = h, maxX = -1, maxY = -1, kept = 0;
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  if (!bg[y * w + x]) { kept++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
}
const PAD = 16;
minX = Math.max(0, minX - PAD); minY = Math.max(0, minY - PAD);
maxX = Math.min(w - 1, maxX + PAD); maxY = Math.min(h - 1, maxY + PAD);
const nw = maxX - minX + 1, nh = maxY - minY + 1;
const out = Buffer.alloc(nw * nh * 4);
for (let y = 0; y < nh; y++) {
  for (let x = 0; x < nw; x++) {
    const si = ((y + minY) * w + (x + minX)) * 4;
    const di = (y * nw + x) * 4;
    if (bg[(y + minY) * w + (x + minX)]) { out[di + 3] = 0; }
    else { out[di] = d[si]; out[di + 1] = d[si + 1]; out[di + 2] = d[si + 2]; out[di + 3] = 255; }
  }
}
fs.writeFileSync(src, encodePNG(nw, nh, out));
console.log('done, kept', (kept / (w * h) * 100).toFixed(1) + '%', 'cropped to', nw + 'x' + nh);
