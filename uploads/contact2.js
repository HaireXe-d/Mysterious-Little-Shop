// 第二张联络表：只放未识别的候选图，更大格子
const fs = require('fs');
const path = require('path');
const { decodePNG, encodePNG } = require('./pnglib');

const dir = 'e:/前端/♂神秘小店/image/product';
const outPath = 'e:/前端/♂神秘小店/uploads/contact2.png';
const CELL = 240, COLS = 4;

const skip = new Set([
  '01_lock_and_keys_artwork_only.png', '02_parcel_cart_artwork_only.png',
  '097984be-c7e7-4d0d-aa85-bf5ce9e798cc.png', '13dd8297-71d4-4a02-b4fb-2c15107644e9.png',
  '2d7428b9-e21b-42df-9271-cdf4d45521c1.png', '38a5fd51-4423-4ff2-a359-d13fd3e5e776.png',
  '4a238af0-cc46-4b07-9a4a-5af5822359a6.png', '51be3c7b-5a9f-40e9-9a87-3275285d92be.png',
  '5eb39bb2-a7fa-49fc-abbf-3bb9892f9440.png', '77172631-59ff-40b7-95fb-5a61030d044e.png',
  '80b8b1f2-5fe9-4990-8a43-8a0fe19b25f0.png', '87eb54de-3440-4b76-94cd-9899dabc9df6.png',
  '91051efe-9a19-4a2f-9b3a-84ad0caa0894.png', '91d4bf48-e9ef-4dd3-9a5c-c37a7c2e2c99.png',
  '98a7a127-a51f-4f36-9f42-2e7feaddfd66.png', 'a11cc20a-5e63-4b17-a510-c0d9bc8a707e.png',
  'a223a276-f30c-4fd0-8fa9-0bfe84fd2ad6.png', 'b3850593-c02d-4a52-ac8d-1fce749ff151.png',
  'ChatGPT Image 2026年6月3日 17_28_58.png', 'ChatGPT Image 2026年6月3日 22_37_34.png',
  '学习资料整理包_抠图.png', '打印装订服务_抠图.png', '文件收纳盒_抠图.png',
  '活页笔记本_抠图.png', '便利贴套装_抠图.png', '二手标牌.png',
]);

const files = fs.readdirSync(dir).filter(f => /\.png$/i.test(f) && !skip.has(f)).sort();
const thumbs = [];
for (const f of files) {
  try {
    const img = decodePNG(path.join(dir, f));
    if (img.w >= 900 && img.h >= 600) thumbs.push({ name: f, img });
  } catch (e) { }
}

const rows = Math.ceil(thumbs.length / COLS);
const W = COLS * CELL, H = rows * (CELL + 14);
const canvas = Buffer.alloc(W * H * 4, 0xff);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const o = (y * W + x) * 4;
  const v = (((x >> 3) + (y >> 3)) & 1) ? 0xe8 : 0xd8;
  canvas[o] = canvas[o + 1] = canvas[o + 2] = v; canvas[o + 3] = 255;
}

thumbs.forEach((t, i) => {
  const cx = (i % COLS) * CELL, cy = Math.floor(i / COLS) * (CELL + 14);
  const scale = Math.min((CELL - 8) / t.img.w, (CELL - 8) / t.img.h);
  const tw = Math.round(t.img.w * scale), th = Math.round(t.img.h * scale);
  const ox = cx + ((CELL - tw) >> 1), oy = cy + ((CELL - th) >> 1);
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const sx = Math.min(t.img.w - 1, Math.floor(x / scale));
      const sy = Math.min(t.img.h - 1, Math.floor(y / scale));
      const so = (sy * t.img.w + sx) * 4;
      const a = t.img.data[so + 3] / 255;
      if (a < 0.02) continue;
      const o = ((y + oy) * W + (x + ox)) * 4;
      canvas[o] = Math.round(t.img.data[so] * a + canvas[o] * (1 - a));
      canvas[o + 1] = Math.round(t.img.data[so + 1] * a + canvas[o + 1] * (1 - a));
      canvas[o + 2] = Math.round(t.img.data[so + 2] * a + canvas[o + 2] * (1 - a));
    }
  }
});

fs.writeFileSync(outPath, encodePNG(W, H, canvas));
console.log('saved', outPath, W + 'x' + H, 'count=' + thumbs.length);
thumbs.forEach((t, i) => console.log('r' + Math.floor(i / COLS) + 'c' + (i % COLS), t.name));
