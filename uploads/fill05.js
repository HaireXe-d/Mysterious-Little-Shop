const fs = require('fs');
const p = 'e:/前端/♂神秘小店/05.html';
let s = fs.readFileSync(p, 'utf8');

const empty = '    <div class="g4"></div>\r\n    <div class="g5"></div>\r\n    <div class="g6"></div>';
if (!s.includes(empty)) {
  // 兼容 LF
  const alt = empty.replace(/\r\n/g, '\n');
  if (!s.includes(alt)) { console.log('EMPTY DIVS NOT FOUND, abort'); process.exit(1); }
}

const block = [
'    <!-- g4 套餐选择 -->',
'    <div class="g4">',
'      <h3 class="g4-title">套餐选择 <span>雨天应急 · 校园常备</span></h3>',
'      <ul class="g4-list">',
'        <li class="g4-plan on">',
'          <div class="ph"><p class="pn">基础款</p><p class="pp"><span class="rmb">¥</span>39</p></div>',
'          <p class="pd">雨伞 + 雨衣 + 手电<br>应对突发小雨</p>',
'        </li>',
'        <li class="g4-plan">',
'          <div class="ph"><p class="pn">安心款</p><p class="pp"><span class="rmb">¥</span>59</p></div>',
'          <p class="pd">基础款 + 应急急救包<br>小伤小痛不用慌</p>',
'        </li>',
'        <li class="g4-plan">',
'          <div class="ph"><p class="pn">出行款</p><p class="pp"><span class="rmb">¥</span>79</p></div>',
'          <p class="pd">安心款 + 防水手机袋<br>雨天骑行无忧</p>',
'        </li>',
'      </ul>',
'    </div>',
'',
'    <!-- g5 更多推荐 -->',
'    <div class="g5">',
'      <h3 class="g5-title">更多推荐</h3>',
'      <ul class="g5-list">',
'        <li class="g5-card">',
'          <div class="pic"><img src="image/product/img-013.png" alt="便携雨伞"></div>',
'          <p class="nm">便携雨伞</p>',
'          <p class="pr"><span class="rmb">¥</span>19<span class="qi">起</span></p>',
'        </li>',
'        <li class="g5-card">',
'          <div class="pic"><img src="image/product/img-011.png" alt="防水手机袋"></div>',
'          <p class="nm">防水手机袋</p>',
'          <p class="pr"><span class="rmb">¥</span>15<span class="qi">起</span></p>',
'        </li>',
'        <li class="g5-card">',
'          <div class="pic"><img src="image/product/img-010.png" alt="应急急救包"></div>',
'          <p class="nm">应急急救包</p>',
'          <p class="pr"><span class="rmb">¥</span>25<span class="qi">起</span></p>',
'        </li>',
'        <li class="g5-card">',
'          <div class="pic"><img src="image/product/img-012.png" alt="LED手电筒"></div>',
'          <p class="nm">LED手电筒</p>',
'          <p class="pr"><span class="rmb">¥</span>18<span class="qi">起</span></p>',
'        </li>',
'        <li class="g5-card">',
'          <div class="pic"><img src="image/product/img-014.png" alt="一次性雨衣"></div>',
'          <p class="nm">一次性雨衣</p>',
'          <p class="pr"><span class="rmb">¥</span>9<span class="qi">起</span></p>',
'        </li>',
'        <li class="g5-card">',
'          <div class="pic"><img src="image/product/img-009.png" alt="雨天应急包全套"></div>',
'          <p class="nm">雨天应急包全套</p>',
'          <p class="pr"><span class="rmb">¥</span>39<span class="qi">起</span></p>',
'        </li>',
'      </ul>',
'      <div class="g5-more"><img src="image/icon/03_Icons_SVG/arrow_forward.svg" alt=""></div>',
'    </div>',
'',
'    <!-- g6 服务保障 -->',
'    <div class="g6">',
'      <ul class="g6-list">',
'        <li class="g6-item">',
'          <img src="image/icon/03_Icons_SVG/shield.svg" alt="" width="40">',
'          <div class="txt">',
'            <h4>正品保障</h4>',
'            <p>所有商品正规渠道</p>',
'          </div>',
'        </li>',
'        <li class="g6-item">',
'          <img src="image/icon/03_Icons_SVG/customer_service.svg" alt="" width="40">',
'          <div class="txt">',
'            <h4>售后无忧</h4>',
'            <p>7天无理由退换</p>',
'          </div>',
'        </li>',
'        <li class="g6-item">',
'          <img src="image/icon/03_Icons_SVG/lightning.svg" alt="" width="40">',
'          <div class="txt">',
'            <h4>快速响应</h4>',
'            <p>平均15分钟响应</p>',
'          </div>',
'        </li>',
'      </ul>',
'    </div>'
].join('\r\n');

let before = s;
s = s.replace(empty, block);
if (s === before) {
  s = s.replace(empty.replace(/\r\n/g, '\n'), block.replace(/\r\n/g, '\n'));
}
if (s === before) { console.log('REPLACE FAILED'); process.exit(1); }
fs.writeFileSync(p, s);
const after = fs.readFileSync(p, 'utf8');
console.log('written. g5-card count:', (after.match(/g5-card/g)||[]).length,
            ' g4-plan:', (after.match(/g4-plan/g)||[]).length,
            ' g6-item:', (after.match(/g6-item/g)||[]).length,
            ' 应急 imgs:', (after.match(/应急_/g)||[]).length);
