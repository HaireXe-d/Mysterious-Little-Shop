// 输出风扇裁剪区的 alpha ASCII 图用于定位残片
const { decodePNG } = require('./pnglib');
const img = decodePNG('e:/前端/♂神秘小店/image/product/4a238af0-cc46-4b07-9a4a-5af5822359a6.png');
// 输出图是 crop [0,370,300,780] trim 后 278x410；直接扫原区域 [0,370,300,780]，每格 5x5 像素
const X1 = 0, Y1 = 370, X2 = 300, Y2 = 780;
let head = '    ';
for (let x = X1; x < X2; x += 10) head += String(Math.floor(x / 10) % 10);
console.log(head);
for (let y = Y1; y < Y2; y += 5) {
  let row = String(y).padStart(4) + ' ';
  for (let x = X1; x < X2; x += 5) {
    // 找该 5x5 块内最大 alpha
    let m = 0;
    for (let dy = 0; dy < 5; dy++) for (let dx = 0; dx < 5; dx++) {
      const a = img.data[((y + dy) * img.w + (x + dx)) * 4 + 3];
      if (a > m) m = a;
    }
    row += m > 8 ? (m > 200 ? '#' : (m > 100 ? '+' : '.')) : ' ';
  }
  console.log(row);
}
