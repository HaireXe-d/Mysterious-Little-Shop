// 全站共用：登录 / 注册弹窗
// 样式在 css/common.css 中，任意页面引入本文件即可，
// 顶栏所有包含「登录」文字的链接都会自动绑定为弹窗入口。
(function () {
  // ====== 整站等比缩放适配 ======
  // 页面按 1920px 设计稿做固定宽度（容器 1835px），
  // 视口窄于 1920（小屏笔记本 / 手机）时整体等比缩小，避免内容被放大、横向溢出；
  // 视口宽于 1920 时保持原样（页面居中留白），不模糊放大。
  function fitPageZoom() {
    var designWidth = 1920;
    var scale = window.innerWidth / designWidth;
    document.body.style.zoom = scale < 1 ? String(scale) : '';
  }
  fitPageZoom();
  window.addEventListener('resize', fitPageZoom);

  // ====== 动态创建弹窗结构（避免每个页面重复写 HTML） ======
  const mask = document.createElement('div');
  mask.className = 'auth-mask';
  mask.innerHTML = `
    <div class="auth-modal">
      <span class="auth-close" title="关闭">&times;</span>
      <p class="auth-brand">涛哥神秘小店</p>
      <p class="auth-welcome">校园生活的轻松帮手，欢迎回来～</p>
      <div class="auth-tabs">
        <span class="auth-tab active" data-tab="login">登 录</span>
        <span class="auth-tab" data-tab="register">注 册</span>
      </div>
      <!-- 登录面板 -->
      <div class="auth-panel active" id="panel-login">
        <div class="auth-field">
          <i class="iconfont icon-user"></i>
          <input type="text" id="login-account" placeholder="请输入手机号 / 校园账号">
        </div>
        <div class="auth-field">
          <i class="iconfont icon-anquanbaozhang"></i>
          <input type="password" id="login-pwd" placeholder="请输入密码">
          <span class="eye" data-target="login-pwd">显示</span>
        </div>
        <div class="auth-row">
          <label><input type="checkbox" checked> 记住我</label>
          <a href="#">忘记密码？</a>
        </div>
        <button class="auth-submit" id="login-btn">登 录</button>
        <p class="auth-switch">还没有账号？<span data-switch="register">立即注册</span></p>
      </div>
      <!-- 注册面板 -->
      <div class="auth-panel" id="panel-register">
        <div class="auth-field">
          <i class="iconfont icon-user"></i>
          <input type="text" id="reg-phone" placeholder="请输入手机号" maxlength="11">
        </div>
        <div class="auth-field">
          <i class="iconfont icon-bianji"></i>
          <input type="text" id="reg-code" placeholder="请输入验证码" maxlength="6">
          <span class="auth-code-btn" id="code-btn">获取验证码</span>
        </div>
        <div class="auth-field">
          <i class="iconfont icon-anquanbaozhang"></i>
          <input type="password" id="reg-pwd" placeholder="设置密码（至少6位）" maxlength="16">
          <span class="eye" data-target="reg-pwd">显示</span>
        </div>
        <label class="auth-agree">
          <input type="checkbox" id="reg-agree">
          <span>我已阅读并同意 <a href="#">《用户协议》</a> 和 <a href="#">《隐私政策》</a></span>
        </label>
        <button class="auth-submit" id="reg-btn">注 册</button>
        <p class="auth-switch">已有账号？<span data-switch="login">去登录</span></p>
      </div>
    </div>
    <div class="auth-toast" id="auth-toast"></div>`;
  document.body.appendChild(mask);

  // ====== 轻提示 ======
  const toast = mask.querySelector('#auth-toast');
  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2000);
  }

  // ====== 打开 / 关闭 ======
  function openModal(tab) {
    switchTab(tab || 'login');
    mask.classList.add('show');
    document.body.style.overflow = 'hidden'; // 弹窗打开时禁止页面滚动
  }
  function closeModal() {
    mask.classList.remove('show');
    document.body.style.overflow = '';
  }

  // 顶栏所有「登录 / 注册」链接绑定为弹窗入口
  document.querySelectorAll('.shortcut a').forEach(function (a) {
    if (a.textContent.indexOf('登录') !== -1) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        openModal('login');
      });
    }
  });

  mask.querySelector('.auth-close').addEventListener('click', closeModal);
  mask.addEventListener('click', function (e) { if (e.target === mask) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  // ====== 登录 / 注册面板切换 ======
  const tabs = mask.querySelectorAll('.auth-tab');
  function switchTab(name) {
    tabs.forEach(function (t) { t.classList.toggle('active', t.dataset.tab === name); });
    mask.querySelector('#panel-login').classList.toggle('active', name === 'login');
    mask.querySelector('#panel-register').classList.toggle('active', name === 'register');
  }
  tabs.forEach(function (t) { t.addEventListener('click', function () { switchTab(t.dataset.tab); }); });
  mask.querySelectorAll('[data-switch]').forEach(function (s) {
    s.addEventListener('click', function () { switchTab(s.dataset.switch); });
  });

  // ====== 密码显示 / 隐藏 ======
  mask.querySelectorAll('.eye').forEach(function (eye) {
    eye.addEventListener('click', function () {
      const input = mask.querySelector('#' + eye.dataset.target);
      const hidden = input.type === 'password';
      input.type = hidden ? 'text' : 'password';
      eye.textContent = hidden ? '隐藏' : '显示';
    });
  });

  // ====== 获取验证码（60s 倒计时，演示用） ======
  const codeBtn = mask.querySelector('#code-btn');
  codeBtn.addEventListener('click', function () {
    if (codeBtn.classList.contains('disabled')) return;
    const phone = mask.querySelector('#reg-phone').value.trim();
    if (!/^1[3-9]\d{9}$/.test(phone)) { showToast('请先输入正确的手机号'); return; }
    let sec = 60;
    codeBtn.classList.add('disabled');
    codeBtn.textContent = sec + 's 后重发';
    const timer = setInterval(function () {
      sec--;
      if (sec <= 0) {
        clearInterval(timer);
        codeBtn.classList.remove('disabled');
        codeBtn.textContent = '获取验证码';
      } else {
        codeBtn.textContent = sec + 's 后重发';
      }
    }, 1000);
    showToast('验证码已发送（演示：任意6位数字均可）');
  });

  // ====== 登录提交（演示：无后端，仅校验 + 提示） ======
  mask.querySelector('#login-btn').addEventListener('click', function () {
    const account = mask.querySelector('#login-account').value.trim();
    const pwd = mask.querySelector('#login-pwd').value;
    if (!account) { showToast('请输入手机号 / 校园账号'); return; }
    if (pwd.length < 6) { showToast('密码不能少于 6 位'); return; }
    showToast('登录成功，欢迎回来！');
    setTimeout(closeModal, 600);
  });

  // ====== 注册提交（演示：无后端，仅校验 + 提示） ======
  mask.querySelector('#reg-btn').addEventListener('click', function () {
    const phone = mask.querySelector('#reg-phone').value.trim();
    const code = mask.querySelector('#reg-code').value.trim();
    const pwd = mask.querySelector('#reg-pwd').value;
    const agree = mask.querySelector('#reg-agree').checked;
    if (!/^1[3-9]\d{9}$/.test(phone)) { showToast('请输入正确的手机号'); return; }
    if (!/^\d{6}$/.test(code)) { showToast('请输入 6 位数字验证码'); return; }
    if (pwd.length < 6) { showToast('密码不能少于 6 位'); return; }
    if (!agree) { showToast('请先阅读并同意用户协议'); return; }
    showToast('注册成功，欢迎加入！');
    setTimeout(closeModal, 600);
  });

  // ====== 预约 / 购买按钮：弹出支付二维码 ======
  // 所有包含「预约 / 下单 / 购买 / 加入购物车」文案的按钮点击后弹出二维码扫码框
  const qrMask = document.createElement('div');
  qrMask.className = 'qr-mask';
  qrMask.innerHTML = `
    <div class="qr-box">
      <span class="qr-close" title="关闭">&times;</span>
      <p class="qr-title">扫码支付</p>
      <img class="qr-img" src="./image/all/6f5dbecfe97affdfdf0f0945394a7c8b.jpg" alt="支付二维码">
      <p class="qr-tip">微信扫一扫，即可完成预约 / 下单</p>
      <button class="qr-btn">知道啦</button>
    </div>`;
  document.body.appendChild(qrMask);

  function showQr() { qrMask.classList.add('show'); }
  function closeQr() { qrMask.classList.remove('show'); }
  qrMask.querySelector('.qr-close').addEventListener('click', closeQr);
  qrMask.querySelector('.qr-btn').addEventListener('click', closeQr);
  qrMask.addEventListener('click', function (e) { if (e.target === qrMask) closeQr(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeQr(); });

  // 直接绑定所有显式标记了 js-qr-trigger 的按钮
  document.querySelectorAll('.js-qr-trigger').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      showQr();
    });
  });

  // ====== 空链接统一提示：功能开发中（配小鸡动图） ======
  // 所有 href="#" 的空链接点击后弹出「开发中.......」，自动关闭或点击关闭；
  // 登录 / 注册入口、预约 / 购买入口除外（它们各自有专属弹窗）。
  const wipMask = document.createElement('div');
  wipMask.className = 'wip-mask';
  wipMask.innerHTML = `
    <div class="wip-box">
      <img src="./image/product/webwxgetmsgimg.gif" alt="小鸡">
      <p class="wip-text">开发中.......</p>
    </div>`;
  document.body.appendChild(wipMask);

  let wipTimer = null;
  function showWip() {
    wipMask.classList.add('show');
    clearTimeout(wipTimer);
    wipTimer = setTimeout(function () { wipMask.classList.remove('show'); }, 1800);
  }
  wipMask.addEventListener('click', function () { wipMask.classList.remove('show'); });

  document.querySelectorAll('a[href="#"]').forEach(function (a) {
    if (a.closest('.shortcut') && a.textContent.indexOf('登录') !== -1) return;
    // 预约 / 购买按钮已绑定 .js-qr-trigger 且 stopPropagation，不会冒泡到此
    a.addEventListener('click', function (e) {
      e.preventDefault();
      showWip();
    });
  });

  // ====== 进站自动弹出登录 / 注册弹窗（同一浏览器会话只弹一次） ======
  // 配合首页的温馨提示 alert：alert 是阻塞的，用户点确定后才会执行到这里
  // 用 sessionStorage 控制：本次会话已弹过就不再弹
  if (!sessionStorage.getItem('authAutoShown')) {
    sessionStorage.setItem('authAutoShown', '1');
    setTimeout(function () { openModal('login'); }, 1800);
  }
})();
