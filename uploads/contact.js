// 生成联络表：把大图缩略拼成网格，用于人工识别内容
const fs = require('fs');
const path = require('path');
const { decodePNG, encodePNG } = require('./pnglib');

const dir = 'e:/前端/♂神秘小店/image/product';
const outPath = 'e:/前端/♂神秘小店/uploads/contact.png';
const CELL = 170, COLS = 6;

const files = fs.readdirSync(dir).filter(f => /\.png$/i.test(f)).sort();
const thumbs = [];
for (const f of files) {
  const p = path.join(dir, f);
  try {
    const { w, h } = decodePNG.head(p) || {};
  } catch (e) { }
  try {
    const img = decodePNG(p);
    if (img.w >= 900 && img.h >= 600) thumbs.push({ name: f, img });
  } catch (e) {
    // 跳过无法解码的
  }
}

const rows = Math.ceil(thumbs.length / COLS);
const W = COLS * CELL, H = rows * (CELL + 14);
const canvas = Buffer.alloc(W * H * 4, 0xff);
// 背景画成浅灰棋盘方便看透明
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
  // 底部画一条索引色条：i 的二进制用4个色块表示（蓝=1）
  for (let k = 0; k < 4; k++) {
    const bit = (i >> k) & 1;
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const o = ((cy + CELL + 3 + y) * W + (cx + 8 + k * 14 + x)) * 4;
      if (bit) { canvas[o] = 30; canvas[o + 1] = 60; canvas[o + 2] = 220; }
      else { canvas[o] = 200; canvas[o + 1] = 200; canvas[o + 2] = 200; }
    }
  }
});

fs.writeFileSync(outPath, encodePNG(W, H, canvas));
console.log('saved', outPath, W + 'x' + H);
thumbs.forEach((t, i) => console.log(i, t.name, t.img.w + 'x' + t.img.h));
