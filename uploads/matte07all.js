const fs = require('fs');
const { decodePNG, encodePNG } = require('e:/前端/♂神秘小店/uploads/pnglib.js');
const dir = 'e:/前端/♂神秘小店/image/product/';

const jobs = [
  ['ee355e2e-db1e-406c-94b2-92230e1bebb6.png', '毕业代售_提交.png'],
  ['e015af4f-8c99-4976-ae91-6866375c32ca.png', '毕业代售_上架.png'],
  ['62487d3e-27a9-4027-9a38-d8ce131405ae.png', '毕业代售_下单.png'],
  ['535e1940-237a-4352-a5de-a3124f30e097.png', '毕业代售_收款.png'],
  ['d5acdbe8-31e0-4210-bdff-8f6b6a8db359.png', '毕业代售_相机.png'],
  ['51be3c7b-5a9f-40e9-9a87-3275285d92be.png', '毕业代售_收纳.png'],
  ['53048c5d-8596-4796-8147-2d04a89b51c6.png', '毕业代售_充电线.png'],
  ['eb9a381a-e0bc-49c8-add7-c6f4b3676367.png', '毕业代售_包袋.png'],
  ['毕业代售_书籍.png', '毕业代售_书籍.png']
];

function matte(inFile, outFile) {
  const img = decodePNG(inFile);
  const w = img.w, h = img.h, d = img.data;
  const isBgP = (i) => {
    const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
    if (a === 0) return true;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return mn > 225 && (mx - mn) < 14;
  };
  const isFringe = (i) => {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return mn > 205 && (mx - mn) < 18;
  };
  const bg = new Uint8Array(w * h);
  const stack = [];
  const seedIdx = (idx) => { if (!bg[idx] && isBgP(idx * 4)) { bg[idx] = 1; stack.push(idx); } };
  for (let x = 0; x < w; x++) { seedIdx(x); seedIdx((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seedIdx(y * w); seedIdx(y * w + w - 1); }
  // 已透明像素全部作为种子（覆盖透明边距内侧）
  for (let i = 0; i < w * h; i++) if (d[i * 4 + 3] === 0 && !bg[i]) { bg[i] = 1; stack.push(i); }
  while (stack.length) {
    const idx = stack.pop();
    const x = idx % w, y = (idx / w) | 0;
    if (x > 0) { const n = idx - 1; if (!bg[n] && isBgP(n * 4)) { bg[n] = 1; stack.push(n); } }
    if (x < w - 1) { const n = idx + 1; if (!bg[n] && isBgP(n * 4)) { bg[n] = 1; stack.push(n); } }
    if (y > 0) { const n = idx - w; if (!bg[n] && isBgP(n * 4)) { bg[n] = 1; stack.push(n); } }
    if (y < h - 1) { const n = idx + w; if (!bg[n] && isBgP(n * 4)) { bg[n] = 1; stack.push(n); } }
  }
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        if (bg[idx] || d[idx * 4 + 3] === 0) continue;
        if (bg[idx - 1] || bg[idx + 1] || bg[idx - w] || bg[idx + w]) {
          if (isFringe(idx * 4)) bg[idx] = 2;
        }
      }
    }
    for (let i = 0; i < bg.length; i++) if (bg[i] === 2) bg[i] = 1;
  }
  let minX = w, minY = h, maxX = -1, maxY = -1, kept = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!bg[y * w + x]) { kept++; if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
  }
  const PAD = 12;
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
  fs.writeFileSync(outFile, encodePNG(nw, nh, out));
  console.log(outFile.split('/').pop(), 'kept', (kept / (w * h) * 100).toFixed(1) + '%', nw + 'x' + nh);
}

jobs.forEach(([s, o]) => matte(dir + s, dir + o));
