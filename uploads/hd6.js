const fs = require('fs');
const P = 'e:/前端/♂神秘小店/image/product/';
// 高清裁图 -> 用户手改的英文文件名（覆盖模糊/错误图，HTML 路径不变）
const map = [
  ['自行车补胎_故障检查.png', '06_bicycle_fault_wheel.png'],
  ['自行车补胎_拆胎检查.png', '02_parcel_cart_artwork_only.png'],
  ['自行车补胎_安装充气.png', '09_bicycle_pump.png'],
  ['自行车补胎_试骑交付.png', '10_bicycle_complete_bike.png'],
];
map.forEach(([src, dst]) => {
  fs.copyFileSync(P + src, P + dst);
  const b = fs.readFileSync(P + dst);
  console.log(dst, '<-', src, b.readUInt32BE(16) + 'x' + b.readUInt32BE(20));
});
