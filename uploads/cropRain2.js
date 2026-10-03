// 雨天应急推荐单品：清晰独立图 + 紧裁急救包/手机袋
const fs = require('fs');
const { decodePNG, encodePNG } = require('./pnglib');

const P = 'e:/前端/♂神秘小店/image/product/';
const SRC = 'a06949ac-4da6-45c8-8192-1f3d0655c65f.png';
const PAD = 16;

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

function cp(src, dst) {
  fs.copyFileSync(P + src, P + dst);
  const b = fs.readFileSync(P + dst);
  console.log(dst, '<-', src, b.readUInt32BE(16) + 'x' + b.readUInt32BE(20));
}

// 清晰独立图
cp('70bbd879-35b8-40c4-81ce-30c196cbb72e.png', '应急_雨伞.png');      // 便携雨伞
cp('9d78d921-79e6-44f5-b830-7f68217ea255.png', '应急_手电筒.png');   // LED手电筒
cp('54735f1d-258e-46f2-a950-61becf840341.png', '应急_雨衣.png');     // 一次性雨衣
cp(SRC, '应急_全套.png');                                             // 全套应急包

// 急救包：x1=600 去掉大部分伞柄，保留完整包体
cut(SRC, '应急_急救包.png', [600, 415, 918, 812]);
// 手机袋：x1=960 去掉红色急救包，保留TAOGE夹与袋体
cut(SRC, '应急_手机袋.png', [945, 470, 1198, 958]);
