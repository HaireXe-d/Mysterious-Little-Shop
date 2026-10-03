const fs = require('fs');
const { decodePNG, encodePNG } = require('e:/前端/♂神秘小店/uploads/pnglib.js');
const dir = 'e:/前端/♂神秘小店/image/product/';

const jobs = [
  ['ee355e2e-db1e-406c-94b2-92230e1bebb6.png', '毕业代售_提交.png'],
  ['e015af4f-8c99-4976-ae91-6866375c32ca.png', '毕业代售_上架.png'],
  ['62487d3e-27a9-4027-9a38-d8ce131405ae.png', '毕业代售_下单.png'],
  ['535e1940-237a-4352-a5de-a3124f30e097.png', '毕业代售_收款.png'],
  ['d5acdbe8-31e0-4210-bdff-8f6b6a8db359.png', '毕业代售_相机.png'],
  ['f5c59939-df36-451e-8dd2-5b1fb703ba52.png', '毕业代售_书籍.png'],
  ['51be3c7b-5a9f-40e9-9a87-3275285d92be.png', '毕业代售_收纳.png'],
  ['53048c5d-8596-4796-8147-2d04a89b51c6.png', '毕业代售_充电线.png'],
  ['eb9a381a-e0bc-49c8-add7-c6f4b3676367.png', '毕业代售_包袋.png'],
  ['ChatGPT Image 2026年6月3日 17_29_28.png', '毕业代售_主图.png'],
  ['c5c90396-647c-43b1-9bfc-4b73309ba3e3.png', '毕业代售_手推车.png']
];

function matte(inFile, outFile) {
  const img = decodePNG(inFile);
  const w = img.w, h = img.h, d = img.data;
  const N = w * h;
  const chk = (i) => { const r = d[i], g = d[i + 1], b = d[i + 2]; return [r, g, b]; };
  const bgLike = (i) => {
    const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
    if (a === 0) return true;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return mn > 225 && (mx - mn) < 14;
  };
  const fringeLike = (i) => {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return mn > 205 && (mx - mn) < 18;
  };
  // 1) 边缘+透明像素洪水填充
  const bg = new Uint8Array(N);
  const stack = [];
  const seedIdx = (idx) => { if (!bg[idx] && bgLike(idx * 4)) { bg[idx] = 1; stack.push(idx); } };
  for (let x = 0; x < w; x++) { seedIdx(x); seedIdx((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { seedIdx(y * w); seedIdx(y * w + w - 1); }
  for (let i = 0; i < N; i++) if (d[i * 4 + 3] === 0 && !bg[i]) { bg[i] = 1; stack.push(i); }
  while (stack.length) {
    const idx = stack.pop();
    const x = idx % w, y = (idx / w) | 0;
    if (x > 0) { const n = idx - 1; if (!bg[n] && bgLike(n * 4)) { bg[n] = 1; stack.push(n); } }
    if (x < w - 1) { const n = idx + 1; if (!bg[n] && bgLike(n * 4)) { bg[n] = 1; stack.push(n); } }
    if (y > 0) { const n = idx - w; if (!bg[n] && bgLike(n * 4)) { bg[n] = 1; stack.push(n); } }
    if (y < h - 1) { const n = idx + w; if (!bg[n] && bgLike(n * 4)) { bg[n] = 1; stack.push(n); } }
  }
  // 2) 封闭残留：在"严格中性浅色"像素上找连通域，整域像素最小值仍>=240 判定为烤入棋盘格
  const cand = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    if (bg[i]) continue;
    const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2], a = d[i * 4 + 3];
    if (a === 0) { bg[i] = 1; continue; }
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    // 严格中性：仅棋盘格灰（R≈G≈B，极差≤2）；水彩米白偏暖（极差≥4）不进入
    if (mn >= 215 && (mx - mn) <= 2) cand[i] = 1;
  }
  const seen = new Uint8Array(N);
  for (let s = 0; s < N; s++) {
    if (!cand[s] || seen[s]) continue;
    const comp = [];
    let minV = 255;
    const st = [s]; seen[s] = 1;
    while (st.length) {
      const idx = st.pop(); comp.push(idx);
      const r = d[idx * 4], g = d[idx * 4 + 1], b = d[idx * 4 + 2];
      const mn = Math.min(r, g, b);
      if (mn < minV) minV = mn;
      const x = idx % w, y = (idx / w) | 0;
      const nb = x > 0 ? idx - 1 : -1, nf = x < w - 1 ? idx + 1 : -1, nu = y > 0 ? idx - w : -1, nd = y < h - 1 ? idx + w : -1;
      for (const n of [nb, nf, nu, nd]) if (n >= 0 && cand[n] && !seen[n]) { seen[n] = 1; st.push(n); }
    }
    if (comp.length >= 2000 && minV >= 215) comp.forEach(i => { bg[i] = 1; });
  }
  // 3) 边缘羽化清理
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        if (bg[idx] || d[idx * 4 + 3] === 0) continue;
        if (bg[idx - 1] || bg[idx + 1] || bg[idx - w] || bg[idx + w]) {
          if (fringeLike(idx * 4)) bg[idx] = 2;
        }
      }
    }
    for (let i = 0; i < N; i++) if (bg[i] === 2) bg[i] = 1;
  }
  // 4) 裁剪输出
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
  console.log(outFile.split('/').pop(), 'kept', (kept / N * 100).toFixed(1) + '%', nw + 'x' + nh);
}

jobs.forEach(([s, o]) => matte(dir + s, dir + o));
