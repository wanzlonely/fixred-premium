module.exports = async (req, res) => {
  res.setHeader('Content-Type','text/html');
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>FIXRED WALZY - Premium Mini App</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#080a0c;
  --card:#111416;
  --card2:#191e22;
  --border:#232a2f;
  --accent:#00ff88;
  --accent2:#00d4ff;
  --text:#e8f0f2;
  --muted:#7a8a93;
  --danger:#ff3b5c;
  --vip:#ffcc33;
}
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:'Space Grotesk',system-ui,sans-serif;
  background:radial-gradient(1200px 600px at 20% -10%, rgba(0,255,136,0.15), transparent), radial-gradient(800px 400px at 90% 0%, rgba(0,212,255,0.12), transparent), var(--bg);
  color:var(--text);
  min-height:100vh;
  padding:0;
}
.mono{font-family:'JetBrains Mono',monospace}
.header{
  position:sticky;top:0;z-index:50;
  backdrop-filter:blur(20px);
  background:rgba(8,10,12,0.8);
  border-bottom:1px solid var(--border);
  padding:14px 20px;
  display:flex;align-items:center;justify-content:space-between;
}
.brand{display:flex;align-items:center;gap:10px}
.brand-icon{width:36px;height:36px;background:linear-gradient(135deg,var(--accent),var(--accent2));border-radius:10px;display:grid;place-items:center;font-weight:700;color:#000}
.brand-text{font-weight:700;letter-spacing:-0.02em}
.brand-text span{color:var(--accent)}
.container{max-width:480px;margin:0 auto;padding:16px 16px 100px}
.card{
  background:linear-gradient(180deg,var(--card),var(--card2));
  border:1px solid var(--border);
  border-radius:20px;
  padding:18px;
  margin-bottom:14px;
  position:relative;
  overflow:hidden;
}
.card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,var(--accent),transparent);
  opacity:0.6;
}
.card-title{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);margin-bottom:12px;font-weight:700;display:flex;align-items:center;gap:8px}
.profile-grid{display:flex;gap:14px;align-items:center}
.avatar{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#1a2a22,#0f1f1a);border:1px solid var(--border);display:grid;place-items:center;font-size:24px;font-weight:700}
.rank-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:100px;background:rgba(0,255,136,0.12);border:1px solid rgba(0,255,136,0.2);font-size:11px;font-weight:700;color:var(--accent)}
.vip-badge{background:linear-gradient(135deg,#332a00,#4a3d00);border-color:rgba(255,204,51,0.3);color:var(--vip)}
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.stat{padding:14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid var(--border)}
.stat-value{font-size:22px;font-weight:700;letter-spacing:-0.02em}
.stat-label{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-top:4px}
.progress{height:6px;background:rgba(255,255,255,0.06);border-radius:100px;overflow:hidden;margin-top:10px}
.progress-bar{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:100px;transition:width 0.6s ease}
.btn{
  width:100%;padding:14px 16px;border-radius:14px;border:1px solid var(--border);
  background:linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02));
  color:var(--text);font-weight:700;font-size:14px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:8px;
  transition:all 0.2s;
}
.btn:hover{transform:translateY(-1px);border-color:rgba(0,255,136,0.3)}
.btn:disabled{opacity:0.5;cursor:not-allowed;transform:none}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#000;border-color:transparent}
.btn-vip{background:linear-gradient(135deg,#ffcc33,#ffaa00);color:#000}
.btn-danger{background:linear-gradient(135deg,#ff3b5c,#c81c3a);color:#fff}
.referral-box{
  background:#0a0e0b;border:1px dashed rgba(0,255,136,0.3);border-radius:12px;padding:12px;
  font-family:'JetBrains Mono',monospace;font-size:12px;word-break:break-all;color:var(--accent);
}
.spin-wheel{
  width:120px;height:120px;margin:0 auto;
  border-radius:50%;
  background:conic-gradient(from 0deg,var(--accent),var(--accent2),#ffcc33,var(--accent));
  display:grid;place-items:center;
  animation:rotate 3s linear infinite paused;
  position:relative;
}
.spin-wheel.spinning{animation-play-state:running}
.spin-wheel::after{
  content:'';position:absolute;inset:8px;background:var(--card);border-radius:50%;
}
.spin-inner{position:relative;z-index:1;font-size:32px}
@keyframes rotate{to{transform:rotate(360deg)}}
.package-grid{display:grid;gap:10px}
.package{
  display:flex;justify-content:space-between;align-items:center;
  padding:14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid var(--border);
}
.package-popular{border-color:rgba(255,204,51,0.4);background:linear-gradient(135deg,rgba(255,204,51,0.08),rgba(255,170,0,0.05))}
.badge{font-size:9px;padding:3px 8px;border-radius:100px;background:var(--vip);color:#000;font-weight:700;letter-spacing:0.08em}
.nav{
  position:fixed;bottom:0;left:0;right:0;
  background:rgba(8,10,12,0.9);backdrop-filter:blur(20px);
  border-top:1px solid var(--border);
  display:flex;justify-content:space-around;padding:10px 0 20px;
  max-width:480px;margin:0 auto;
}
.nav-item{display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10px;color:var(--muted);cursor:pointer}
.nav-item.active{color:var(--accent)}
.toast{
  position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-100px);
  background:var(--card2);border:1px solid var(--border);padding:12px 18px;border-radius:12px;
  font-size:13px;font-weight:600;z-index:100;transition:all 0.4s;opacity:0;
}
.toast.show{transform:translateX(-50%) translateY(0);opacity:1}
.loading{opacity:0.6;pointer-events:none}
.table{width:100%;border-collapse:collapse;font-size:12px}
.table th{font-size:9px;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);text-align:left;padding:8px 6px;border-bottom:1px solid var(--border)}
.table td{padding:8px 6px;border-bottom:1px solid rgba(255,255,255,0.04)}
.queue-item{padding:12px;border-radius:12px;background:rgba(255,255,255,0.03);border:1px solid var(--border);margin-bottom:10px}
.queue-actions{display:flex;gap:8px;margin-top:10px}
.confetti-layer{position:fixed;inset:0;pointer-events:none;z-index:999;overflow:hidden;display:none}
.confetti-piece{position:absolute;top:-20px;border-radius:2px;animation:fall linear forwards}
@keyframes fall{to{transform:translateY(110vh) rotate(720deg);opacity:0.3}}
.vip-toast{
  position:fixed;inset:0;z-index:1000;display:none;place-items:center;
  background:rgba(0,0,0,0.7);backdrop-filter:blur(6px);
}
.vip-toast-card{background:linear-gradient(135deg,#191e22,#0a0e0b);border:1px solid rgba(255,204,51,0.4);border-radius:24px;padding:32px;text-align:center;max-width:300px}
.vip-toast-card .icon{font-size:48px;margin-bottom:10px}
.vip-toast-card h2{color:var(--vip);font-size:20px;margin-bottom:6px}
.vip-toast-card p{color:var(--muted);font-size:13px}
.file-input-wrap{position:relative}
.file-input-wrap input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer}
</style>
</head>
<body>
<div class="confetti-layer" id="confettiLayer"></div>
<div class="vip-toast" id="vipToast"><div class="vip-toast-card"><div class="icon">🎉</div><h2>VIP Aktif!</h2><p>Selamat, VIP kamu sudah aktif sekarang</p></div></div>

<div class="header">
  <div class="brand">
    <div class="brand-icon">🦖</div>
    <div class="brand-text">FIXRED <span>WALZY</span></div>
  </div>
  <div class="mono" style="font-size:11px;color:var(--muted)" id="time">--:-- WIB</div>
</div>

<div class="toast" id="toast"></div>

<div class="container" id="userView" style="display:none">
  <div class="card">
    <div class="card-title">👤 PROFIL AKUN</div>
    <div class="profile-grid">
      <div class="avatar" id="avatar">?</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:16px" id="name">Memuat data...</div>
        <div class="mono" style="font-size:11px;color:var(--muted)" id="uid">ID: -</div>
        <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap" id="badges"></div>
      </div>
    </div>
    <div class="progress"><div class="progress-bar" id="limitBar" style="width:0%"></div></div>
    <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:var(--muted)"><span>Daily Limit</span><span class="mono" id="limitText">Memuat...</span></div>
  </div>

  <div class="stat-grid">
    <div class="stat"><div class="stat-value mono" id="myFix">-</div><div class="stat-label">Total Fix</div></div>
    <div class="stat"><div class="stat-value mono" id="globalFix">-</div><div class="stat-label">Global Fix</div></div>
    <div class="stat"><div class="stat-value mono" id="refCount">-</div><div class="stat-label">Referral</div></div>
    <div class="stat"><div class="stat-value mono" id="revCount">-</div><div class="stat-label">Revenue</div></div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-title">🎰 DAILY SPIN</div>
    <div class="spin-wheel" id="wheel"><div class="spin-inner">🎰</div></div>
    <div style="text-align:center;margin-top:14px">
      <div class="mono" style="font-size:12px;color:var(--muted)" id="spinStatus">Memuat status spin...</div>
      <div class="mono" style="font-size:10px;color:var(--muted);margin-top:4px" id="spinLast">Last spin: -</div>
      <button class="btn btn-primary" style="margin-top:10px" id="spinBtn" onclick="doSpin()">🎰 PUTAR SEKARANG</button>
    </div>
  </div>

  <div class="card">
    <div class="card-title">💎 VIP MANUAL DEPOSIT</div>
    <div style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:12px" id="vipDesc">
      Upgrade VIP untuk unlimited fix 5 baris.
    </div>
    <div class="package-grid">
      <div class="package"><div><b>1 Hari</b><div class="mono" style="font-size:11px;color:var(--muted)">Rp 2.000</div></div><button class="btn" style="width:auto;padding:8px 14px" onclick="buyPackage(1)">Beli</button></div>
      <div class="package package-popular"><div><b>5 Hari</b> <span class="badge">POPULAR</span><div class="mono" style="font-size:11px;color:var(--muted)">Rp 5.000</div></div><button class="btn btn-vip" style="width:auto;padding:8px 14px" onclick="buyPackage(5)">Beli</button></div>
      <div class="package"><div><b>10 Hari</b><div class="mono" style="font-size:11px;color:var(--muted)">Rp 10.000</div></div><button class="btn" style="width:auto;padding:8px 14px" onclick="buyPackage(10)">Beli</button></div>
      <div class="package"><div><b>30 Hari</b><div class="mono" style="font-size:11px;color:var(--muted)">Rp 60.000</div></div><button class="btn" style="width:auto;padding:8px 14px" onclick="buyPackage(30)">Beli</button></div>
    </div>
    <div id="invoiceBox" style="display:none;margin-top:12px;padding:12px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);border-radius:12px" class="mono"></div>
  </div>

  <div class="card">
    <div class="card-title">🤝 REFERRAL PROGRAM</div>
    <div class="referral-box" id="refLink">Memuat link...</div>
    <button class="btn" style="margin-top:10px" onclick="copyRef()">📋 Copy Link</button>
  </div>

  <div class="card">
    <div class="card-title">📜 HISTORY FIX</div>
    <div id="historyBox" class="mono" style="font-size:11px;color:var(--muted)">Memuat history...</div>
  </div>
</div>

<div class="container" id="ownerView" style="display:none">
  <div class="stat-grid">
    <div class="stat"><div class="stat-value mono" id="oUsers">-</div><div class="stat-label">Total User</div></div>
    <div class="stat"><div class="stat-value mono" id="oPremium">-</div><div class="stat-label">VIP Aktif</div></div>
    <div class="stat"><div class="stat-value mono" id="oFix">-</div><div class="stat-label">Total Fix</div></div>
    <div class="stat"><div class="stat-value mono" id="oRevenue">-</div><div class="stat-label">Revenue</div></div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-title">💳 ANTREAN BUKTI TRANSFER</div>
    <div id="queueBox">Memuat antrean...</div>
  </div>

  <div class="card">
    <div class="card-title">👥 USER TERBARU</div>
    <table class="table" id="userTable"><tr><th>ID</th><th>Nama</th><th>Status</th><th>Fix</th></tr></table>
  </div>
</div>

<div class="nav">
  <div class="nav-item active"><span>🏠</span><span>Home</span></div>
  <div class="nav-item" onclick="location.href='/admin'"><span>📊</span><span>Dashboard</span></div>
  <div class="nav-item" onclick="Telegram.WebApp.close()"><span>❌</span><span>Close</span></div>
</div>

<script>
const tg = Telegram.WebApp;
tg.ready();
tg.expand();
const tgUser = tg.initDataUnsafe.user;
const timeEl = document.getElementById('time');
const toastEl = document.getElementById('toast');
const OWNER_IDS = ${JSON.stringify(require('../config').OWNER_IDS.map(String))};

function showToast(msg, duration=3000){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(()=>toastEl.classList.remove('show'), duration);
}

function updateTime(){
  const now = new Date().toLocaleString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',second:'2-digit'}).replace(/\\./g,':');
  timeEl.textContent = now + ' WIB';
}
setInterval(updateTime,1000);updateTime();

let userId = tgUser ? String(tgUser.id) : null;
let isOwnerUser = userId && OWNER_IDS.includes(userId);
let lastKnownPremium = null;

function launchConfetti(){
  const layer = document.getElementById('confettiLayer');
  layer.style.display = 'block';
  layer.innerHTML = '';
  const colors = ['#00ff88','#00d4ff','#ffcc33','#ff3b5c'];
  for(let i=0;i<80;i++){
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random()*100 + 'vw';
    p.style.width = (6+Math.random()*6) + 'px';
    p.style.height = (6+Math.random()*10) + 'px';
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.animationDuration = (2+Math.random()*2) + 's';
    p.style.animationDelay = (Math.random()*0.5) + 's';
    layer.appendChild(p);
  }
  const vipToast = document.getElementById('vipToast');
  vipToast.style.display = 'grid';
  tg.HapticFeedback.notificationOccurred('success');
  setTimeout(()=>{
    vipToast.style.display = 'none';
    layer.style.display = 'none';
    layer.innerHTML = '';
  }, 3500);
}

async function loadUser(){
  if(!userId){
    document.getElementById('userView').style.display = 'block';
    document.getElementById('name').textContent = 'Buka via Telegram untuk data akun';
    document.getElementById('uid').textContent = 'User ID tidak terdeteksi';
    return;
  }

  if(isOwnerUser){
    document.getElementById('ownerView').style.display = 'block';
    document.getElementById('userView').style.display = 'none';
    return loadOwnerData();
  }

  document.getElementById('userView').style.display = 'block';

  try{
    const r = await fetch('/api/user?user_id=' + userId);
    const data = await r.json();

    if(!data.ok){
      document.getElementById('name').textContent = data.message || 'User tidak ditemukan';
      document.getElementById('uid').textContent = 'Silakan /start di bot dulu';
      return;
    }

    const u = data.user;
    const g = data.global;

    if(lastKnownPremium === false && u.isPremium === true){
      launchConfetti();
    }
    lastKnownPremium = u.isPremium;

    document.getElementById('name').textContent = u.first_name + (u.username ? ' @' + u.username : '');
    document.getElementById('uid').textContent = 'ID: ' + u.id + ' | Bergabung: ' + new Date(u.joinedAt).toLocaleDateString('id-ID');
    document.getElementById('avatar').textContent = u.first_name.charAt(0).toUpperCase();

    const badgesEl = document.getElementById('badges');
    let badgesHtml = '<span class="rank-badge">' + u.rank.icon + ' ' + u.rank.name + '</span>';
    if(u.isPremium){
      badgesHtml += '<span class="rank-badge vip-badge">👑 VIP ' + u.premiumLeft + ' Hari</span>';
    } else {
      badgesHtml += '<span class="rank-badge">🎫 FREE</span>';
    }
    badgesEl.innerHTML = badgesHtml;

    const limitPct = u.isPremium ? 100 : ((u.dailyFix.used / 3) * 100);
    document.getElementById('limitBar').style.width = Math.min(100, limitPct) + '%';
    document.getElementById('limitText').textContent = u.isPremium ? 'Unlimited (VIP)' : u.dailyFix.used + '/3 - Sisa ' + u.dailyFix.remaining;

    document.getElementById('myFix').textContent = u.totalFix;
    document.getElementById('globalFix').textContent = g.totalFix;
    document.getElementById('refCount').textContent = u.referralCount;
    document.getElementById('revCount').textContent = 'Rp ' + g.revenue.toLocaleString('id-ID');

    if(u.canSpin){
      document.getElementById('spinStatus').textContent = 'Siap spin!';
      document.getElementById('spinLast').textContent = 'Last spin: ' + (u.lastSpin || 'Belum pernah');
      document.getElementById('spinBtn').disabled = false;
      document.getElementById('spinBtn').textContent = '🎰 PUTAR SEKARANG';
    } else {
      document.getElementById('spinStatus').textContent = 'Spin hari ini sudah dipakai';
      document.getElementById('spinLast').textContent = 'Last spin: ' + u.lastSpin + ' - Kembali besok';
      document.getElementById('spinBtn').disabled = true;
      document.getElementById('spinBtn').textContent = '✅ Sudah Spin Hari Ini';
    }

    document.getElementById('refLink').textContent = 'https://t.me/' + (u.username ? u.username : 'fixedredbot') + '?start=' + u.id;

    const histBox = document.getElementById('historyBox');
    if(u.history && u.history.length>0){
      histBox.innerHTML = u.history.map(h=>'<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)">📅 ' + new Date(h.date).toLocaleString('id-ID') + ' - Fix +1</div>').join('');
    } else {
      histBox.textContent = 'Belum ada history fix';
    }

    document.getElementById('vipDesc').textContent = u.isPremium ? 'VIP aktif sampai ' + new Date(u.premiumUntil).toLocaleDateString('id-ID') + ' (' + u.premiumLeft + ' hari lagi)' : 'Upgrade VIP untuk unlimited fix 5 baris.';

  }catch(e){
    console.error(e);
    document.getElementById('name').textContent = 'Gagal load data: ' + e.message;
    showToast('Gagal load data: ' + e.message);
  }
}

async function loadOwnerData(){
  try{
    const r = await fetch('/api/stats?user_id=' + userId);
    const data = await r.json();
    if(!data.ok || !data.isOwner) return;

    document.getElementById('oUsers').textContent = data.users;
    document.getElementById('oPremium').textContent = data.premium;
    document.getElementById('oFix').textContent = data.totalFix;
    document.getElementById('oRevenue').textContent = 'Rp ' + data.revenue.toLocaleString('id-ID');

    const queueBox = document.getElementById('queueBox');
    const pending = data.pendingPayments || [];
    if(pending.length === 0){
      queueBox.innerHTML = '<div style="color:var(--muted);font-size:12px">Tidak ada antrean</div>';
    } else {
      queueBox.innerHTML = pending.map(p => \`
        <div class="queue-item">
          <div style="font-weight:700;font-size:13px">\${p.invoice}</div>
          <div class="mono" style="font-size:11px;color:var(--muted)">User: \${p.userId} | \${p.days} Hari | Rp \${(p.amount||0).toLocaleString('id-ID')}</div>
          <div class="mono" style="font-size:10px;color:var(--muted)">Status: \${p.status}</div>
          <div class="queue-actions">
            <button class="btn btn-primary" style="padding:8px" onclick="ownerAction('\${p.invoice}','approve')">✅ Approve</button>
            <button class="btn btn-danger" style="padding:8px" onclick="ownerAction('\${p.invoice}','reject')">❌ Reject</button>
          </div>
        </div>
      \`).join('');
    }

    const userTable = document.getElementById('userTable');
    const recent = data.recentUsers || [];
    userTable.innerHTML = '<tr><th>ID</th><th>Nama</th><th>Status</th><th>Fix</th></tr>' + recent.map(u => \`
      <tr><td class="mono">\${u.id}</td><td>\${(u.first_name||'User').substring(0,12)}</td><td>\${u.isPremium?'💎 VIP':'🎫 FREE'}</td><td class="mono">\${u.totalFix}</td></tr>
    \`).join('');
  }catch(e){
    console.error(e);
    showToast('Gagal load data owner: ' + e.message);
  }
}

async function ownerAction(invoice, action){
  try{
    const r = await fetch('/api/owner_action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner_id: userId, action, invoice })
    });
    const data = await r.json();
    if(data.ok){
      showToast('✅ ' + data.message);
      tg.HapticFeedback.notificationOccurred('success');
      loadOwnerData();
    } else {
      showToast('❌ ' + data.message);
    }
  }catch(e){
    showToast('Error: ' + e.message);
  }
}

async function doSpin(){
  if(!userId) return showToast('Buka via Telegram untuk spin');

  const wheel = document.getElementById('wheel');
  const btn = document.getElementById('spinBtn');
  const statusEl = document.getElementById('spinStatus');

  wheel.classList.add('spinning');
  btn.disabled = true;
  btn.textContent = 'Memutar...';
  statusEl.textContent = 'Menghubungi server...';

  try{
    const r = await fetch('/api/spin?user_id=' + userId, { method:'POST' });
    const data = await r.json();

    setTimeout(()=>{
      wheel.classList.remove('spinning');
      if(data.ok){
        statusEl.textContent = '🎉 ' + data.message;
        document.getElementById('spinLast').textContent = 'Last spin: ' + new Date().toLocaleDateString('id-ID');
        btn.textContent = '✅ Hadiah: ' + data.reward.label;
        showToast('🎉 Reward: ' + data.reward.label + ' - ' + data.reward.desc);
        tg.HapticFeedback.notificationOccurred('success');
        setTimeout(loadUser, 1000);
      } else {
        statusEl.textContent = '❌ ' + data.message;
        btn.textContent = data.alreadySpun ? '✅ Sudah Spin' : '🎰 Coba Lagi';
        btn.disabled = !!data.alreadySpun;
        showToast(data.message);
      }
    }, 2000);
  }catch(e){
    wheel.classList.remove('spinning');
    btn.disabled = false;
    statusEl.textContent = 'Gagal spin: ' + e.message;
    showToast('Error spin: ' + e.message);
  }
}

let currentInvoice = null;

async function buyPackage(days){
  if(!userId) return showToast('Buka via Telegram untuk beli');

  try{
    const r = await fetch('/api/deposit?user_id=' + userId + '&days=' + days, { method:'POST' });
    const data = await r.json();

    if(data.ok){
      const inv = data.invoice;
      currentInvoice = inv.id;
      const box = document.getElementById('invoiceBox');
      box.style.display = 'block';
      box.innerHTML = '<b>✅ Invoice Dibuat:</b><br>ID: ' + inv.id + '<br>Paket: ' + inv.days + ' Hari<br>Total: ' + inv.amountFormatted + '<br>Transfer ke: ' + inv.transferTo.bank + ' ' + inv.transferTo.number +
        '<br><br><div class="file-input-wrap"><button class="btn btn-vip" type="button">📤 Upload Bukti Transfer</button><input type="file" accept="image/*" onchange="handleProofUpload(event)"></div>' +
        '<div id="uploadStatus" style="margin-top:8px;font-size:11px;color:var(--muted)"></div>';
      showToast('✅ Invoice: ' + inv.id + ' - ' + inv.amountFormatted);
      tg.HapticFeedback.notificationOccurred('success');
    } else {
      showToast('❌ Gagal: ' + data.message);
    }
  }catch(e){
    showToast('Error buat invoice: ' + e.message);
  }
}

function handleProofUpload(evt){
  const file = evt.target.files[0];
  if(!file || !currentInvoice) return;
  const statusEl = document.getElementById('uploadStatus');
  statusEl.textContent = 'Mengompresi gambar...';

  const reader = new FileReader();
  reader.onload = function(e){
    const img = new Image();
    img.onload = function(){
      const canvas = document.createElement('canvas');
      const maxDim = 1024;
      let w = img.width, h = img.height;
      if(w > h && w > maxDim){ h = h*maxDim/w; w = maxDim; }
      else if(h > maxDim){ w = w*maxDim/h; h = maxDim; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      uploadProof(base64, statusEl);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function uploadProof(base64, statusEl){
  statusEl.textContent = 'Mengunggah ke admin...';
  try{
    const r = await fetch('/api/upload_proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, invoice: currentInvoice, image_base64: base64 })
    });
    const data = await r.json();
    if(data.ok){
      statusEl.textContent = '✅ Bukti terkirim, menunggu approval admin';
      showToast('✅ Bukti transfer terkirim');
      tg.HapticFeedback.notificationOccurred('success');
    } else {
      statusEl.textContent = '❌ ' + data.message;
      showToast('❌ ' + data.message);
    }
  }catch(e){
    statusEl.textContent = '❌ Error: ' + e.message;
    showToast('Error upload: ' + e.message);
  }
}

function copyRef(){
  const txt = document.getElementById('refLink').textContent;
  if(txt.includes('Memuat')){
    return showToast('Link belum ready');
  }
  navigator.clipboard.writeText(txt).then(()=>{
    showToast('✅ Link disalin: ' + txt.slice(0,40) + '...');
    tg.HapticFeedback.notificationOccurred('success');
  });
}

loadUser();
setInterval(loadUser, 8000);
</script>
</body>
</html>`);
};
