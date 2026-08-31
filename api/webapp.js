module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');

  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>WALZY STORE</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f6fa; color: #1a1a2e; min-height: 100vh; }
  .header { position: sticky; top: 0; z-index: 50; background: #fff; border-bottom: 1px solid #e5e7eb; height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand-icon { width: 36px; height: 36px; border-radius: 10px; background: #2563eb; display: grid; place-items: center; color: #fff; font-weight: 800; }
  .brand-text { font-weight: 700; font-size: 15px; }
  .live { font-size: 11px; color: #6b7280; background: #f3f4f6; padding: 4px 10px; border-radius: 20px; }
  .container { max-width: 600px; margin: 0 auto; padding: 12px 12px 90px; }
  .view { display: none; }
  .view.active { display: block; }
  .card { background: #fff; border-radius: 16px; border: 1px solid #e5e7eb; margin-bottom: 10px; overflow: hidden; }
  .card-head { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; font-weight: 600; font-size: 13px; display: flex; justify-content: space-between; }
  .card-body { padding: 14px 16px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .stat { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px; }
  .stat-num { font-size: 20px; font-weight: 700; }
  .stat-label { font-size: 11px; color: #6b7280; margin-top: 4px; }
  .btn { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e5e7eb; background: #fff; font-weight: 600; cursor: pointer; text-align: center; }
  .btn-primary { background: #2563eb; color: #fff; border: 0; }
  .btn:active { transform: scale(0.98); }
  .input { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #e5e7eb; outline: none; font-size: 13px; }
  .input:focus { border-color: #2563eb; }
  .pkg { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #f3f4f6; cursor: pointer; }
  .pkg:last-child { border-bottom: 0; }
  .pkg-name { font-weight: 600; font-size: 13px; }
  .pkg-desc { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .pkg-price { font-weight: 700; font-size: 13px; color: #2563eb; }
  .nav { position: fixed; bottom: 12px; left: 50%; transform: translateX(-50%); background: #fff; border: 1px solid #e5e7eb; display: flex; gap: 4px; padding: 6px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); z-index: 40; width: calc(100% - 24px); max-width: 400px; }
  .nav.hidden { display: none; }
  .nav-item { flex: 1; text-align: center; padding: 8px 4px; border-radius: 10px; cursor: pointer; color: #6b7280; font-size: 10px; font-weight: 600; }
  .nav-item.active { background: #1a1a2e; color: #fff; }
  .toast { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 280px; background: #fff; border: 1px solid #e5e7eb; border-radius: 16px; box-shadow: 0 16px 40px rgba(0,0,0,0.12); padding: 20px; display: none; text-align: center; z-index: 100; }
  .toast.show { display: block; }
  .loading { position: fixed; inset: 0; background: #f5f6fa; z-index: 99; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 12px; }
  .loading.hide { display: none; }
  .login-full { position: fixed; inset: 0; background: #f5f6fa; z-index: 60; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .login-card { width: 100%; max-width: 320px; background: #fff; border: 1px solid #e5e7eb; border-radius: 20px; padding: 24px 20px; text-align: center; }
  .page-title { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .page-sub { font-size: 12px; color: #6b7280; margin-bottom: 16px; }
  .back { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; cursor: pointer; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; padding: 8px; font-size: 10px; color: #6b7280; border-bottom: 1px solid #f3f4f6; text-transform: uppercase; }
  td { padding: 8px; border-bottom: 1px solid #f3f4f6; }
  .badge { display: inline-block; padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-orange { background: #fef3c7; color: #92400e; }
</style>
</head>
<body>

<div class="loading" id="loading">
  <div style="width:48px;height:48px;border-radius:12px;background:#2563eb;display:grid;place-items:center;color:#fff;font-weight:800;font-size:20px">W</div>
  <div style="font-weight:600">Walzy Store</div>
  <div style="font-size:12px;color:#6b7280" id="loadTxt">Memuat...</div>
</div>

<div class="toast" id="toast">
  <div id="tTitle" style="font-weight:700">Berhasil</div>
  <div id="tMsg" style="font-size:12px;color:#6b7280;margin-top:6px">Ok</div>
  <button class="btn btn-primary" style="margin-top:12px" onclick="hideT()">Tutup</button>
</div>

<div class="header" id="mainHeader">
  <div class="brand">
    <div class="brand-icon">W</div>
    <div class="brand-text" id="headerTitle">walzy store</div>
  </div>
  <div class="live" id="time">--:--</div>
</div>

<div class="container">

  <!-- USER ROOT -->
  <div id="userRoot" style="display:none">

    <div id="uHome" class="view active">
      <div class="card">
        <div class="card-body" style="display:flex;gap:12px;align-items:center">
          <div id="uAv" style="width:56px;height:56px;border-radius:14px;background:#dbeafe;display:grid;place-items:center;font-weight:700;color:#2563eb">W</div>
          <div style="flex:1">
            <div id="uName" style="font-weight:700">Memuat...</div>
            <div id="uRank" class="badge badge-blue" style="margin-top:4px">BASIC</div>
            <div id="uStatus" style="font-size:11px;color:#6b7280;margin-top:4px">Memuat status...</div>
          </div>
        </div>
      </div>

      <div class="grid2">
        <div class="stat"><div class="stat-num" id="sTotal">0</div><div class="stat-label">Total Order</div></div>
        <div class="stat"><div class="stat-num" id="sRef">0</div><div class="stat-label">Referral</div></div>
      </div>

      <div class="card">
        <div class="card-head">Daily Spin</div>
        <div class="card-body">
          <button id="spinBtn" class="btn btn-primary" onclick="doSpin()">Putar Spin</button>
        </div>
      </div>

      <div class="card">
        <div class="card-head">Paket Premium <span style="font-size:10px;color:#6b7280">Terlaris</span></div>
        <div class="card-body" id="pkgHome"></div>
      </div>

      <div class="grid2">
        <div class="card">
          <div class="card-body">
            <div style="font-size:11px;font-weight:600;margin-bottom:8px">Referral</div>
            <div id="refLink" style="font-size:10px;background:#f3f4f6;padding:8px;border-radius:8px;word-break:break-all;color:#6b7280">Memuat...</div>
            <button class="btn" style="margin-top:8px;padding:8px;font-size:11px" onclick="copyRef()">Salin Link</button>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div style="font-size:11px;font-weight:600;margin-bottom:8px">Redeem</div>
            <input id="redeemInput" class="input" placeholder="KODE" style="text-transform:uppercase;text-align:center">
            <button class="btn btn-primary" style="margin-top:8px;padding:8px;font-size:11px" onclick="doRedeem()">Tukar</button>
          </div>
        </div>
      </div>
    </div>

    <div id="uOrder" class="view">
      <div class="back" onclick="showUserView('uHome')">← Kembali</div>
      <div class="page-title">Order Paket</div>
      <div class="page-sub">Pilih paket premium</div>
      <div class="card"><div class="card-body" id="pkgOrder"></div></div>
      <div class="card" id="invoiceCard" style="display:none">
        <div class="card-head">Invoice Aktif <span id="invStatus" class="badge badge-orange">Menunggu</span></div>
        <div class="card-body"><div id="invoiceBox"></div></div>
      </div>
    </div>

    <div id="uTrans" class="view">
      <div class="back" onclick="showUserView('uHome')">← Kembali</div>
      <div class="page-title">Riwayat</div>
      <div class="page-sub">Transaksi dan statistik</div>
      <div class="card"><div class="card-body" style="padding:0">
        <table><thead><tr><th>Invoice</th><th>Paket</th><th>Status</th><th>Tgl</th></tr></thead><tbody id="hTable"><tr><td colspan="4" style="text-align:center;padding:16px;color:#6b7280">Memuat...</td></tr></tbody></table>
      </div></div>
      <div class="grid2">
        <div class="stat"><div class="stat-num" id="stFix">0</div><div class="stat-label">Fix Sukses</div></div>
        <div class="stat"><div class="stat-num" id="stRate">0%</div><div class="stat-label">Success Rate</div></div>
      </div>
    </div>

    <div id="uProfil" class="view">
      <div class="back" onclick="showUserView('uHome')">← Kembali</div>
      <div class="page-title">Profil</div>
      <div class="page-sub">Info akun</div>
      <div class="card"><div class="card-body" style="text-align:center">
        <div id="pAv" style="width:64px;height:64px;border-radius:16px;background:#dbeafe;display:grid;place-items:center;margin:0 auto;font-weight:700;color:#2563eb">W</div>
        <div id="pName" style="font-weight:700;margin-top:10px">--</div>
        <div id="pId" style="font-size:11px;color:#6b7280">ID --</div>
      </div></div>
      <div class="card"><div class="card-body" style="font-size:12px;line-height:2">
        <div style="display:flex;justify-content:space-between"><span style="color:#6b7280">Status</span><span id="pStatus">--</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:#6b7280">Referral</span><span id="pRef">--</span></div>
        <div style="display:flex;justify-content:space-between"><span style="color:#6b7280">Order</span><span id="pFix">--</span></div>
      </div></div>
    </div>

    <div class="nav" id="uNav">
      <div class="nav-item active" data-view="uHome" onclick="showUserView('uHome')">Home</div>
      <div class="nav-item" data-view="uOrder" onclick="showUserView('uOrder')">Order</div>
      <div class="nav-item" data-view="uTrans" onclick="showUserView('uTrans')">Riwayat</div>
      <div class="nav-item" data-view="uProfil" onclick="showUserView('uProfil')">Profil</div>
    </div>

  </div>

  <!-- OWNER ROOT -->
  <div id="ownerRoot" style="display:none">

    <div id="oLogin" class="view active">
      <div class="login-full">
        <div class="login-card">
          <div style="width:48px;height:48px;background:#1a1a2e;border-radius:12px;display:grid;place-items:center;color:#fff;margin:0 auto 12px;font-size:20px">🔒</div>
          <div style="font-weight:700;font-size:16px">Owner Login</div>
          <div style="height:20px"></div>
          <input type="password" id="ownerPass" class="input" placeholder="Password" style="text-align:center">
          <div id="oLoginErr" style="font-size:11px;color:#ef4444;margin-top:8px;display:none"></div>
          <button class="btn btn-primary" style="margin-top:12px" onclick="verifyOwner()">Masuk</button>
        </div>
      </div>
    </div>

    <div id="oDash" class="view">
      <div class="page-title">Owner Dashboard</div>
      <div class="page-sub">Kelola semua via WebApp</div>

      <div class="grid2">
        <div class="stat"><div class="stat-num" id="oUsers">0</div><div class="stat-label">Users Valid</div></div>
        <div class="stat"><div class="stat-num" id="oVip">0</div><div class="stat-label">VIP</div></div>
        <div class="stat"><div class="stat-num" id="oToday">0</div><div class="stat-label">Order Hari Ini</div></div>
        <div class="stat"><div class="stat-num" id="oRev">Rp 0</div><div class="stat-label">Revenue</div></div>
      </div>

      <div class="grid2" style="margin-top:10px">
        <div class="card" style="cursor:pointer" onclick="openOwnerPage('pending')"><div class="card-body"><div style="font-weight:600">Pending ACC</div><div style="font-size:11px;color:#6b7280;margin-top:4px" id="oPendingCount">0 menunggu</div></div></div>
        <div class="card" style="cursor:pointer" onclick="openOwnerPage('users')"><div class="card-body"><div style="font-weight:600">Users</div><div style="font-size:11px;color:#6b7280;margin-top:4px" id="oUsersCount">0 user</div></div></div>
        <div class="card" style="cursor:pointer" onclick="openOwnerPage('voucher')"><div class="card-body"><div style="font-weight:600">Voucher</div><div style="font-size:11px;color:#6b7280;margin-top:4px">Buat kode</div></div></div>
        <div class="card" style="cursor:pointer" onclick="openOwnerPage('broadcast')"><div class="card-body"><div style="font-weight:600">Broadcast</div><div style="font-size:11px;color:#6b7280;margin-top:4px">Kirim pesan</div></div></div>
      </div>

      <div class="card">
        <div class="card-head">Revenue Terbaru</div>
        <div class="card-body" style="padding:0">
          <table><thead><tr><th>Invoice</th><th>User</th><th>Jumlah</th></tr></thead><tbody id="oRevTable"><tr><td colspan="3" style="text-align:center;padding:12px;color:#6b7280">Memuat...</td></tr></tbody></table>
        </div>
      </div>

      <button class="btn" style="margin-top:10px" onclick="logoutOwner()">Keluar</button>
    </div>

    <div id="oPending" class="view">
      <div class="back" onclick="openOwnerPage('dash')">← Kembali ke Dashboard</div>
      <div class="page-title">Pending ACC</div>
      <div id="oPendingList"></div>
    </div>

    <div id="oUsers" class="view">
      <div class="back" onclick="openOwnerPage('dash')">← Kembali ke Dashboard</div>
      <div class="page-title">Users</div>
      <div class="card"><div class="card-body" style="padding:0">
        <table><thead><tr><th>ID</th><th>Nama</th><th>Order</th><th>Status</th></tr></thead><tbody id="oUsersTable"></tbody></table>
      </div></div>
    </div>

    <div id="oVoucher" class="view">
      <div class="back" onclick="openOwnerPage('dash')">← Kembali ke Dashboard</div>
      <div class="page-title">Voucher</div>
      <div class="card">
        <div class="card-head">Buat Voucher</div>
        <div class="card-body">
          <input id="vCode" class="input" placeholder="Kode (contoh WALZY30)" style="text-transform:uppercase">
          <div class="grid2" style="margin-top:8px">
            <input id="vDays" class="input" type="number" placeholder="Hari">
            <input id="vQuota" class="input" type="number" placeholder="Kuota 0=∞">
          </div>
          <select id="vType" class="input" style="margin-top:8px"><option value="public">Public</option><option value="private">Private</option></select>
          <button class="btn btn-primary" style="margin-top:10px" onclick="createVoucher()">Buat</button>
        </div>
      </div>
      <div class="card"><div class="card-head">Daftar Voucher</div><div class="card-body" id="oVoucherList"></div></div>
    </div>

    <div id="oBroadcast" class="view">
      <div class="back" onclick="openOwnerPage('dash')">← Kembali ke Dashboard</div>
      <div class="page-title">Broadcast</div>
      <div class="card"><div class="card-body">
        <textarea id="bcText" class="input" style="min-height:100px;resize:none" placeholder="Tulis pesan broadcast..."></textarea>
        <div style="font-size:11px;color:#6b7280;margin-top:6px" id="bcCount">0 / 1000 • 0 user</div>
        <button class="btn btn-primary" style="margin-top:10px" onclick="sendBc()">Kirim Broadcast</button>
      </div></div>
    </div>

    <div class="nav" id="oNav">
      <div class="nav-item active" onclick="openOwnerPage('dash')">Dashboard</div>
      <div class="nav-item" onclick="openOwnerPage('pending')">Pending</div>
      <div class="nav-item" onclick="openOwnerPage('users')">Users</div>
      <div class="nav-item" onclick="openOwnerPage('voucher')">Voucher</div>
      <div class="nav-item" onclick="openOwnerPage('broadcast')">Broadcast</div>
    </div>

  </div>

</div>

<script>
let userId = null;
let tgUser = null;
let isOwner = false;
let ownerPass = sessionStorage.getItem('walzy_pass') || '';
let ownerVerified = sessionStorage.getItem('walzy_verified') === 'true';
let currentInvoice = null;
let cacheUser = null;
let cacheStats = null;

async function fetchJson(url, opts) {
  opts = opts || {};
  let r = await fetch(url, opts);
  let txt = await r.text();
  if (!r.ok) {
    try { let j = JSON.parse(txt); throw new Error(j.message || 'Error'); } catch(e) {
      if (txt.includes('<!DOCTYPE')) throw new Error('API Error');
      throw e;
    }
  }
  if (txt.trim().startsWith('<')) throw new Error('API HTML Error');
  return JSON.parse(txt);
}

function showT(title, msg, type) {
  document.getElementById('tTitle').textContent = title;
  document.getElementById('tMsg').textContent = msg;
  document.getElementById('toast').classList.add('show');
  setTimeout(hideT, 2500);
}
function hideT() { document.getElementById('toast').classList.remove('show'); }
function hideLoad() { document.getElementById('loading').classList.add('hide'); }

function showUserRoot() {
  document.getElementById('userRoot').style.display = 'block';
  document.getElementById('ownerRoot').style.display = 'none';
  document.getElementById('mainHeader').style.display = 'flex';
  document.getElementById('uNav').classList.remove('hidden');
  document.getElementById('oNav').classList.add('hidden');
  hideLoad();
}

function showOwnerRoot() {
  document.getElementById('userRoot').style.display = 'none';
  document.getElementById('ownerRoot').style.display = 'block';
  document.getElementById('oLogin').classList.remove('active');
  document.getElementById('oDash').classList.add('active');
  document.getElementById('mainHeader').style.display = 'flex';
  document.getElementById('uNav').classList.add('hidden');
  document.getElementById('oNav').classList.remove('hidden');
  hideLoad();
}

function showOwnerLogin() {
  document.getElementById('userRoot').style.display = 'none';
  document.getElementById('ownerRoot').style.display = 'block';
  document.getElementById('oLogin').classList.add('active');
  document.getElementById('oDash').classList.remove('active');
  document.getElementById('mainHeader').style.display = 'none';
  document.getElementById('uNav').classList.add('hidden');
  document.getElementById('oNav').classList.add('hidden');
  hideLoad();
}

function showUserView(v) {
  document.querySelectorAll('#userRoot .view').forEach(x => x.classList.remove('active'));
  document.getElementById(v).classList.add('active');
  document.querySelectorAll('#uNav .nav-item').forEach(n => n.classList.remove('active'));
  let nav = document.querySelector('#uNav .nav-item[data-view="' + v + '"]');
  if (nav) nav.classList.add('active');
  window.scrollTo({ top: 0 });
}

function openOwnerPage(page) {
  document.querySelectorAll('#ownerRoot .view').forEach(x => x.classList.remove('active'));
  if (page === 'dash') document.getElementById('oDash').classList.add('active');
  if (page === 'pending') { document.getElementById('oPending').classList.add('active'); renderPendingPage(); }
  if (page === 'users') { document.getElementById('oUsers').classList.add('active'); renderUsersPage(); }
  if (page === 'voucher') { document.getElementById('oVoucher').classList.add('active'); renderVoucherPage(); }
  if (page === 'broadcast') { document.getElementById('oBroadcast').classList.add('active'); }
  document.querySelectorAll('#oNav .nav-item').forEach(n => n.classList.remove('active'));
  let map = { dash:0, pending:1, users:2, voucher:3, broadcast:4 };
  let navs = document.querySelectorAll('#oNav .nav-item');
  if (navs[map[page]] !== undefined) navs[map[page]].classList.add('active');
  window.scrollTo({ top: 0 });
}

function renderUser(d) {
  if (!d || !d.user) return;
  cacheUser = d;
  let u = d.user;
  document.getElementById('uName').textContent = u.first_name || 'User';
  document.getElementById('uAv').textContent = (u.first_name || 'W')[0].toUpperCase();
  document.getElementById('uRank').textContent = u.rank.name + ' ' + u.rank.icon;
  document.getElementById('uStatus').textContent = u.isPremium ? 'VIP ' + u.premiumLeft + ' hari' : 'Gratis sisa ' + u.dailyFix.remaining + '/3';
  document.getElementById('sTotal').textContent = u.totalFix;
  document.getElementById('sRef').textContent = u.referralCount;
  document.getElementById('stFix').textContent = d.global.totalSuccess || 0;
  document.getElementById('stRate').textContent = (d.global.totalFix ? Math.round((d.global.totalSuccess/d.global.totalFix)*100) : 0) + '%');
  document.getElementById('pAv').textContent = (u.first_name || 'W')[0].toUpperCase();
  document.getElementById('pName').textContent = u.first_name || 'User';
  document.getElementById('pId').textContent = 'ID: ' + u.id;
  document.getElementById('pStatus').textContent = u.isPremium ? 'VIP ' + u.premiumLeft + ' hari' : 'Gratis';
  document.getElementById('pRef').textContent = u.referralCount + ' orang';
  document.getElementById('pFix').textContent = u.totalFix + ' order';

  let link = 'https://t.me/walzystore_bot?start=' + u.id;
  document.getElementById('refLink').textContent = link;

  let pkgs = [
    { days: 7, name: 'Starter 7 Hari', price: 'Rp 15K', desc: 'Pemula' },
    { days: 30, name: 'Pro 30 Hari', price: 'Rp 45K', desc: 'Terlaris Hemat 40%' },
    { days: 90, name: 'Sultan 90 Hari', price: 'Rp 99K', desc: 'Best value' }
  ];

  let htmlHome = pkgs.slice(0,2).map(p => '<div class="pkg" onclick="buyPkg(' + p.days + ')"><div><div class="pkg-name">' + p.name + '</div><div class="pkg-desc">' + p.desc + '</div></div><div class="pkg-price">' + p.price + '</div></div>').join('');
  let htmlOrder = pkgs.map(p => '<div class="pkg" onclick="buyPkg(' + p.days + ')"><div><div class="pkg-name">' + p.name + '</div><div class="pkg-desc">' + p.desc + '</div></div><div class="pkg-price">' + p.price + '</div></div>').join('');

  document.getElementById('pkgHome').innerHTML = htmlHome;
  document.getElementById('pkgOrder').innerHTML = htmlOrder;

  if (d.currentInvoice) {
    currentInvoice = d.currentInvoice.id;
    document.getElementById('invoiceCard').style.display = 'block';
    let inv = d.currentInvoice;
    document.getElementById('invStatus').textContent = inv.status;
    document.getElementById('invoiceBox').innerHTML =
      '<div>Invoice: ' + inv.id + '</div>' +
      '<div style="margin-top:6px">Paket: ' + inv.days + ' Hari - ' + (inv.amountFormatted || 'Rp ' + inv.amount) + '</div>' +
      '<div style="margin-top:8px;font-size:11px;color:#6b7280">Bayar ke DANA 083124469855 a.n WALZY STORE lalu upload bukti</div>' +
      (inv.status !== 'waiting_approval' ?
      '<div style="margin-top:10px;position:relative"><button class="btn btn-primary">Upload Bukti</button><input type="file" accept="image/*" onchange="uploadProof(event)" style="position:absolute;inset:0;opacity:0;cursor:pointer"></div><div id="upStat" style="margin-top:6px;font-size:11px;color:#6b7280"></div>' :
      '<div style="margin-top:10px;background:#fef3c7;padding:8px;border-radius:8px;font-size:11px;text-align:center">Menunggu ACC Owner</div>');
  } else {
    document.getElementById('invoiceCard').style.display = 'none';
  }

  if (d.invoices) {
    let tb = document.getElementById('hTable');
    if (d.invoices.length === 0) tb.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:16px;color:#6b7280">Belum ada transaksi</td></tr>';
    else tb.innerHTML = d.invoices.slice(0,15).map(inv => '<tr><td>' + inv.id.slice(-6) + '</td><td>' + inv.days + 'H</td><td><span class="badge ' + (inv.status==='paid'?'badge-green':'badge-blue') + '">' + inv.status + '</span></td><td>' + new Date(inv.createdAt).toLocaleDateString('id-ID') + '</td></tr>').join('');
  }

  let btn = document.getElementById('spinBtn');
  if (btn) btn.textContent = u.canSpin ? 'Putar Spin Harian' : 'Sudah Diklaim Hari Ini';
  if (btn) btn.disabled = !u.canSpin;
}

function renderStats(d) {
  if (!d) return;
  cacheStats = d;
  isOwner = d.isOwner || false;

  if (isOwner) {
    if (ownerVerified) {
      showOwnerRoot();
      document.getElementById('oUsers').textContent = d.usersValid || 0;
      document.getElementById('oVip').textContent = d.premium || 0;
      document.getElementById('oToday').textContent = d.todayOrders || 0;
      document.getElementById('oRev').textContent = d.revenue ? 'Rp ' + (d.revenue/1000).toFixed(0) + 'K' : 'Rp 0';
      document.getElementById('oPendingCount').textContent = (d.pendingPayments?.length || 0) + ' menunggu';
      document.getElementById('oUsersCount').textContent = (d.usersValid || 0) + ' user';
      let revTable = document.getElementById('oRevTable');
      if (revTable) {
        if ((d.paidPayments||[]).length === 0) revTable.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:12px;color:#6b7280">Belum ada</td></tr>';
        else revTable.innerHTML = d.paidPayments.slice(0,5).map(p => '<tr><td>' + p.id.slice(-6) + '</td><td>' + p.userId + '</td><td>Rp ' + p.amount + '</td></tr>').join('');
      }
      let bc = document.getElementById('bcCount');
      if (bc) bc.textContent = '0 / 1000 • ' + (d.usersValid || 0) + ' user';
    } else {
      showOwnerLogin();
    }
  } else {
    showUserRoot();
  }
}

function renderPendingPage() {
  if (!cacheStats) return;
  let list = cacheStats.pendingPayments || [];
  let el = document.getElementById('oPendingList');
  if (list.length === 0) { el.innerHTML = '<div class="card"><div class="card-body" style="text-align:center;color:#6b7280">Tidak ada pending</div></div>'; return; }
  el.innerHTML = list.map(p => '<div class="card"><div class="card-body"><div>Invoice: ' + p.id + '</div><div style="font-size:12px;color:#6b7280;margin-top:4px">User ' + p.userId + ' • ' + p.days + 'H • Rp ' + p.amount + '</div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-primary" style="flex:1" onclick="ownerAct(\\'' + p.id + '\\',\\'approve\\')">ACC</button><button class="btn" style="flex:1" onclick="ownerAct(\\'' + p.id + '\\',\\'reject\\')">Tolak</button></div></div></div>').join('');
}

function renderUsersPage() {
  if (!cacheStats) return;
  let users = cacheStats.recentUsers || [];
  let table = document.getElementById('oUsersTable');
  if (users.length === 0) { table.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:16px;color:#6b7280">Belum ada</td></tr>'; return; }
  table.innerHTML = users.map(u => '<tr><td>' + u.id + '</td><td>' + (u.first_name||'User').substring(0,10) + '</td><td>' + (u.totalFix||0) + '</td><td>' + (u.premiumUntil && u.premiumUntil>Date.now() ? 'VIP' : 'FREE') + '</td></tr>').join('');
}

function renderVoucherPage() {
  if (!cacheStats) return;
  let codes = cacheStats.codes || [];
  let el = document.getElementById('oVoucherList');
  if (codes.length === 0) { el.innerHTML = '<div style="text-align:center;padding:12px;color:#6b7280">Belum ada voucher</div>'; return; }
  el.innerHTML = codes.map(c => '<div class="pkg"><div><div style="font-weight:600">' + c.code + ' • ' + c.days + 'H</div><div style="font-size:11px;color:#6b7280">Kuota ' + (c.quota||'∞') + ' • Pakai ' + (c.used||0) + '</div></div><button class="btn" style="width:auto;padding:6px 12px;font-size:11px" onclick="delVoucher(\\'' + c.code + '\\')">Hapus</button></div>').join('');
}

async function verifyOwner() {
  let pass = document.getElementById('ownerPass').value.trim();
  let err = document.getElementById('oLoginErr');
  if (!pass) { err.style.display = 'block'; err.textContent = 'Isi password'; return; }
  err.style.display = 'none';
  try {
    let r = await fetchJson('/api/verify_owner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ owner_id: userId, password: pass }) });
    if (r.ok) {
      ownerPass = pass;
      ownerVerified = true;
      sessionStorage.setItem('walzy_pass', pass);
      sessionStorage.setItem('walzy_verified', 'true');
      showT('Berhasil', 'Login owner berhasil');
      showOwnerRoot();
      loadStats();
    } else {
      err.style.display = 'block';
      err.textContent = r.message || 'Password salah';
      showT('Gagal', r.message || 'Password salah');
    }
  } catch(e) {
    err.style.display = 'block';
    err.textContent = e.message;
    showT('Gagal', e.message);
  }
}

function logoutOwner() {
  sessionStorage.removeItem('walzy_pass');
  sessionStorage.removeItem('walzy_verified');
  ownerPass = '';
  ownerVerified = false;
  location.reload();
}

async function loadUser() {
  if (!userId) return;
  try {
    let d = await fetchJson('/api/user?user_id=' + userId);
    if (d.ok) renderUser(d);
  } catch(e) {}
}

async function loadStats() {
  if (!userId) return;
  try {
    let d = await fetchJson('/api/stats?user_id=' + userId);
    if (d.ok) renderStats(d);
  } catch(e) {}
}

async function ownerAct(inv, act) {
  try {
    let r = await fetchJson('/api/owner_action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ owner_id: userId, action: act, invoice: inv, password: ownerPass }) });
    showT('Berhasil', r.message);
    loadStats();
  } catch(e) { showT('Gagal', e.message); }
}

async function createVoucher() {
  let code = document.getElementById('vCode').value.trim().toUpperCase();
  let days = parseInt(document.getElementById('vDays').value);
  let quota = parseInt(document.getElementById('vQuota').value) || 0;
  let type = document.getElementById('vType').value;
  if (!code || !days) return showT('Gagal', 'Isi kode dan hari');
  try {
    let r = await fetchJson('/api/create_code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ owner_id: userId, code, days, quota, type, password: ownerPass }) });
    if (r.ok) { showT('Berhasil', 'Voucher ' + code + ' dibuat'); document.getElementById('vCode').value = ''; document.getElementById('vDays').value = ''; document.getElementById('vQuota').value = ''; loadStats(); }
    else showT('Gagal', r.message);
  } catch(e) { showT('Gagal', e.message); }
}

async function delVoucher(code) {
  if (!confirm('Hapus ' + code + '?')) return;
  try {
    let r = await fetchJson('/api/delete_code', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ owner_id: userId, code, password: ownerPass }) });
    if (r.ok) { showT('Hapus', code + ' dihapus'); loadStats(); }
    else showT('Gagal', r.message);
  } catch(e) { showT('Gagal', e.message); }
}

async function sendBc() {
  let text = document.getElementById('bcText').value.trim();
  if (!text) return showT('Gagal', 'Isi pesan');
  try {
    let r = await fetchJson('/api/broadcast', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ owner_id: userId, text, password: ownerPass }) });
    showT('Terkirim', 'Ke ' + r.sent + ' user');
    document.getElementById('bcText').value = '';
  } catch(e) { showT('Gagal', e.message); }
}

async function doSpin() {
  let btn = document.getElementById('spinBtn');
  if (btn) btn.disabled = true;
  try {
    let r = await fetchJson('/api/spin?user_id=' + userId, { method: 'POST' });
    if (r.ok) { showT('Menang!', r.reward.label); loadUser(); }
    else { showT('Info', r.message); if (btn) btn.disabled = r.alreadySpun; }
  } catch(e) { showT('Gagal', e.message); if (btn) btn.disabled = false; }
}

async function buyPkg(days) {
  try {
    let r = await fetchJson('/api/deposit?user_id=' + userId + '&days=' + days, { method: 'POST' });
    if (r.ok) { currentInvoice = r.invoice.id; showUserView('uOrder'); setTimeout(loadUser, 400); showT('Invoice', r.invoice.id); }
    else showT('Gagal', r.message);
  } catch(e) { showT('Gagal', e.message); }
}

function uploadProof(evt) {
  let file = evt.target.files[0];
  if (!file || !currentInvoice) return;
  if (file.size > 5*1024*1024) return showT('Gagal', 'Max 5MB');
  let reader = new FileReader();
  reader.onload = e => {
    let img = new Image();
    img.onload = () => {
      let canvas = document.createElement('canvas');
      let max = 1024; let w = img.width, h = img.height;
      if (w > h && w > max) { h = h*max/w; w = max; } else if (h > max) { w = w*max/h; h = max; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      let b64 = canvas.toDataURL('image/jpeg', 0.72);
      sendProof(b64);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function sendProof(b64) {
  try {
    let r = await fetchJson('/api/upload_proof', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, invoice: currentInvoice, image_base64: b64 }) });
    if (r.ok) showT('Terkirim', 'Menunggu ACC');
    else showT('Gagal', r.message);
  } catch(e) { showT('Gagal', e.message); }
}

async function doRedeem() {
  let code = document.getElementById('redeemInput').value.trim().toUpperCase();
  if (!code) return showT('Gagal', 'Isi kode');
  try {
    let r = await fetchJson('/api/redeem?user_id=' + userId + '&code=' + code, { method: 'POST' });
    if (r.ok) { showT('Berhasil', 'VIP aktif'); document.getElementById('redeemInput').value = ''; loadUser(); }
    else showT('Gagal', r.message);
  } catch(e) { showT('Gagal', e.message); }
}

function copyRef() {
  let txt = document.getElementById('refLink').textContent || '';
  if (!txt || txt.includes('Memuat')) return;
  navigator.clipboard.writeText(txt).then(() => showT('Disalin', 'Link disalin'));
}

(function(){
  let tg = window.Telegram && window.Telegram.WebApp;
  if (tg) {
    tg.ready(); tg.expand();
    let u = tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (u && u.id) { userId = String(u.id); tgUser = u; }
  }
  if (!userId) {
    let sp = new URLSearchParams(window.location.search);
    userId = sp.get('user_id') || sp.get('userId') || null;
  }
  if (!userId) {
    document.getElementById('loadTxt').textContent = 'Buka via Telegram Bot';
    document.getElementById('loading').classList.add('hide');
    return;
  }
  loadUser();
  loadStats();
  setInterval(() => {
    let el = document.getElementById('time');
    if (el) el.textContent = new Date().toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' }) + ' WIB';
  }, 1000);
  let passEl = document.getElementById('ownerPass');
  if (passEl) passEl.addEventListener('keypress', e => { if (e.key === 'Enter') verifyOwner(); });
  let bc = document.getElementById('bcText');
  if (bc) bc.addEventListener('input', e => {
    let c = document.getElementById('bcCount');
    if (c) c.textContent = e.target.value.length + ' / 1000 • ' + (cacheStats?.usersValid || 0) + ' user';
  });
  setTimeout(() => document.getElementById('loading').classList.add('hide'), 1500);
})();
</script>
</body>
</html>`);
};
