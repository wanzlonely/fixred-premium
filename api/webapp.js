
const { loadDB } = require('../lib/utils');
module.exports = async (req, res) => {
  res.setHeader('Content-Type','text/html');
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>FIXRED WALZY - Premium Mini App REAL</title>
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
</style>
</head>
<body>
<div class="header">
  <div class="brand">
    <div class="brand-icon">🦖</div>
    <div class="brand-text">FIXRED <span>WALZY</span> <span class="mono" style="font-size:10px;color:var(--muted);margin-left:6px">V9.2 REAL</span></div>
  </div>
  <div class="mono" style="font-size:11px;color:var(--muted)" id="time">--:-- WIB</div>
</div>

<div class="toast" id="toast"></div>

<div class="container">
  <!-- Profile REAL -->
  <div class="card">
    <div class="card-title">👤 PROFIL AKUN REAL</div>
    <div class="profile-grid">
      <div class="avatar" id="avatar">?</div>
      <div style="flex:1">
        <div style="font-weight:700;font-size:16px" id="name">Memuat data real...</div>
        <div class="mono" style="font-size:11px;color:var(--muted)" id="uid">ID: -</div>
        <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap" id="badges"></div>
      </div>
    </div>
    <div class="progress"><div class="progress-bar" id="limitBar" style="width:0%"></div></div>
    <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:11px;color:var(--muted)"><span>Daily Limit Real</span><span class="mono" id="limitText">Memuat...</span></div>
  </div>

  <!-- Stats REAL -->
  <div class="stat-grid">
    <div class="stat"><div class="stat-value mono" id="myFix">-</div><div class="stat-label">My Total Fix (Real)</div></div>
    <div class="stat"><div class="stat-value mono" id="globalFix">-</div><div class="stat-label">Global Fix (Real)</div></div>
    <div class="stat"><div class="stat-value mono" id="refCount">-</div><div class="stat-label">Referral Real</div></div>
    <div class="stat"><div class="stat-value mono" id="revCount">-</div><div class="stat-label">Revenue Real</div></div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-title">🎰 DAILY SPIN - REAL REWARD</div>
    <div class="spin-wheel" id="wheel"><div class="spin-inner">🎰</div></div>
    <div style="text-align:center;margin-top:14px">
      <div class="mono" style="font-size:12px;color:var(--muted)" id="spinStatus">Memuat status spin real...</div>
      <div class="mono" style="font-size:10px;color:var(--muted);margin-top:4px" id="spinLast">Last spin: -</div>
      <button class="btn btn-primary" style="margin-top:10px" id="spinBtn" onclick="doSpinReal()">🎰 PUTAR SEKARANG (REAL)</button>
    </div>
  </div>

  <div class="card">
    <div class="card-title">💎 VIP MANUAL DEPOSIT - REAL</div>
    <div style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:12px" id="vipDesc">
      Upgrade VIP untuk unlimited fix 5 baris. Data real dari server.
    </div>
    <div class="package-grid">
      <div class="package"><div><b>1 Hari</b><div class="mono" style="font-size:11px;color:var(--muted)">Rp 2.000 - Real</div></div><button class="btn" style="width:auto;padding:8px 14px" onclick="buyReal(1)">Beli Real</button></div>
      <div class="package package-popular"><div><b>5 Hari</b> <span class="badge">POPULAR</span><div class="mono" style="font-size:11px;color:var(--muted)">Rp 5.000 - Real</div></div><button class="btn btn-vip" style="width:auto;padding:8px 14px" onclick="buyReal(5)">Beli Real</button></div>
      <div class="package"><div><b>10 Hari</b><div class="mono" style="font-size:11px;color:var(--muted)">Rp 10.000 - Real</div></div><button class="btn" style="width:auto;padding:8px 14px" onclick="buyReal(10)">Beli Real</button></div>
      <div class="package"><div><b>30 Hari</b><div class="mono" style="font-size:11px;color:var(--muted)">Rp 60.000 - Real</div></div><button class="btn" style="width:auto;padding:8px 14px" onclick="buyReal(30)">Beli Real</button></div>
    </div>
    <div id="invoiceBox" style="display:none;margin-top:12px;padding:12px;background:rgba(0,255,136,0.08);border:1px solid rgba(0,255,136,0.2);border-radius:12px" class="mono"></div>
  </div>

  <div class="card">
    <div class="card-title">🤝 REFERRAL PROGRAM REAL</div>
    <div class="referral-box" id="refLink">Memuat link real...</div>
    <button class="btn" style="margin-top:10px" onclick="copyRefReal()">📋 Copy Link Real</button>
    <div style="margin-top:10px;font-size:11px;color:var(--muted)">Data referral real dari database Upstash. Top referral naik rank MASTER 👑</div>
  </div>

  <div class="card">
    <div class="card-title">📊 LIVE STATS REAL DARI SERVER</div>
    <div id="liveStats" class="mono" style="font-size:11px;color:var(--muted);white-space:pre-wrap;max-height:200px;overflow:auto">Memuat data real...</div>
    <button class="btn" style="margin-top:12px" onclick="location.href='/admin'">📊 Buka Full Dashboard Real</button>
  </div>

  <div class="card">
    <div class="card-title">📜 HISTORY FIX REAL</div>
    <div id="historyBox" class="mono" style="font-size:11px;color:var(--muted)">Memuat history real...</div>
  </div>
</div>

<div class="nav">
  <div class="nav-item active"><span>🏠</span><span>Home Real</span></div>
  <div class="nav-item" onclick="location.href='/admin'"><span>📊</span><span>Dashboard</span></div>
  <div class="nav-item" onclick="Telegram.WebApp.close()"><span>❌</span><span>Close</span></div>
</div>

<script>
const tg = Telegram.WebApp;
tg.ready();
tg.expand();
const user = tg.initDataUnsafe.user;
const timeEl = document.getElementById('time');
const toastEl = document.getElementById('toast');

function showToast(msg, duration=3000){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(()=>toastEl.classList.remove('show'), duration);
}

function updateTime(){
  const now = new Date().toLocaleString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',second:'2-digit'}).replace(/\./g,':');
  timeEl.textContent = now + ' WIB';
}
setInterval(updateTime,1000);updateTime();

let realUserId = user ? String(user.id) : null;
let realUserData = null;

async function loadRealUser(){
  if(!realUserId){
    document.getElementById('name').textContent = 'Buka via Telegram untuk data REAL';
    document.getElementById('uid').textContent = 'User ID tidak terdeteksi - Buka Mini App dari bot';
    document.getElementById('refLink').textContent = 'Buka via Telegram';
    return;
  }

  try{
    // REAL API call - no simulation
    const r = await fetch('/api/user?user_id=' + realUserId);
    const data = await r.json();
    
    if(!data.ok){
      document.getElementById('name').textContent = data.message || 'User tidak ditemukan';
      document.getElementById('uid').textContent = 'Silakan /start di bot dulu untuk registrasi REAL';
      return;
    }

    realUserData = data.user;
    const u = data.user;
    const g = data.global;

    // REAL profile
    document.getElementById('name').textContent = u.first_name + (u.username ? ' @' + u.username : '');
    document.getElementById('uid').textContent = 'ID: ' + u.id + ' | Bergabung: ' + new Date(u.joinedAt).toLocaleDateString('id-ID');
    document.getElementById('avatar').textContent = u.first_name.charAt(0).toUpperCase();
    
    // REAL badges
    const badgesEl = document.getElementById('badges');
    let badgesHtml = '<span class="rank-badge">' + u.rank.icon + ' ' + u.rank.name + '</span>';
    if(u.isPremium){
      badgesHtml += '<span class="rank-badge vip-badge">👑 VIP ' + u.premiumLeft + ' Hari</span>';
    } else {
      badgesHtml += '<span class="rank-badge">🎫 FREE</span>';
    }
    badgesEl.innerHTML = badgesHtml;

    // REAL limit
    const limitPct = u.isPremium ? 100 : ((u.dailyFix.used / 3) * 100);
    document.getElementById('limitBar').style.width = Math.min(100, limitPct) + '%';
    document.getElementById('limitText').textContent = u.isPremium ? 'Unlimited (VIP) - REAL' : u.dailyFix.used + '/3 - Sisa ' + u.dailyFix.remaining + ' (REAL)';

    // REAL stats - NO RANDOM
    document.getElementById('myFix').textContent = u.totalFix;
    document.getElementById('globalFix').textContent = g.totalFix;
    document.getElementById('refCount').textContent = u.referralCount;
    document.getElementById('revCount').textContent = 'Rp ' + g.revenue.toLocaleString('id-ID');

    // REAL spin status
    if(u.canSpin){
      document.getElementById('spinStatus').textContent = 'Siap spin! Hadiah real akan masuk DB';
      document.getElementById('spinLast').textContent = 'Last spin: ' + (u.lastSpin || 'Belum pernah - REAL');
      document.getElementById('spinBtn').disabled = false;
      document.getElementById('spinBtn').textContent = '🎰 PUTAR SEKARANG (REAL)';
    } else {
      document.getElementById('spinStatus').textContent = 'Spin hari ini sudah dipakai (REAL DB)';
      document.getElementById('spinLast').textContent = 'Last spin: ' + u.lastSpin + ' - Kembali besok (REAL)';
      document.getElementById('spinBtn').disabled = true;
      document.getElementById('spinBtn').textContent = '✅ Sudah Spin Hari Ini';
    }

    // REAL referral
    document.getElementById('refLink').textContent = 'https://t.me/' + (u.username ? u.username : 'fixedredbot') + '?start=' + u.id;

    // REAL live stats
    document.getElementById('liveStats').textContent = 'Total Fix: ' + g.totalFix + '\nSuccess: ' + g.totalSuccess + '\nFailed: ' + g.totalFailed + '\nTotal User: ' + g.totalUsers + '\nPremium: ' + g.premiumUsers + '\nRevenue: Rp ' + g.revenue.toLocaleString('id-ID') + '\n\nSemua data REAL dari Upstash Redis';

    // REAL history
    const histBox = document.getElementById('historyBox');
    if(u.history && u.history.length>0){
      histBox.innerHTML = u.history.map(h=>'<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)">📅 ' + new Date(h.date).toLocaleString('id-ID') + ' - Fix +1 (REAL)</div>').join('');
    } else {
      histBox.textContent = 'Belum ada history fix - Data real';
    }

    // REAL VIP desc
    document.getElementById('vipDesc').textContent = u.isPremium ? 'VIP aktif sampai ' + new Date(u.premiumUntil).toLocaleDateString('id-ID') + ' (' + u.premiumLeft + ' hari lagi) - REAL' : 'Upgrade VIP untuk unlimited fix 5 baris. Data real dari server Upstash.';

  }catch(e){
    console.error(e);
    document.getElementById('name').textContent = 'Gagal load data REAL: ' + e.message;
    showToast('Gagal load data real: ' + e.message);
  }
}

async function doSpinReal(){
  if(!realUserId) return showToast('Buka via Telegram untuk spin real');
  
  const wheel = document.getElementById('wheel');
  const btn = document.getElementById('spinBtn');
  const statusEl = document.getElementById('spinStatus');
  
  wheel.classList.add('spinning');
  btn.disabled = true;
  btn.textContent = 'Memutar... (REAL)';
  statusEl.textContent = 'Menghubungi server real...';

  try{
    // REAL API call to spin endpoint
    const r = await fetch('/api/spin?user_id=' + realUserId, { method:'POST' });
    const data = await r.json();
    
    setTimeout(()=>{
      wheel.classList.remove('spinning');
      if(data.ok){
        statusEl.textContent = '🎉 REAL: ' + data.message;
        document.getElementById('spinLast').textContent = 'Last spin: ' + new Date().toLocaleDateString('id-ID') + ' - REAL';
        btn.textContent = '✅ Hadiah: ' + data.reward.label + ' (REAL)';
        showToast('🎉 REAL Reward: ' + data.reward.label + ' - ' + data.reward.desc);
        tg.HapticFeedback.notificationOccurred('success');
        // Reload real data
        setTimeout(loadRealUser, 1000);
      } else {
        statusEl.textContent = '❌ ' + data.message + ' (REAL)';
        btn.textContent = data.alreadySpun ? '✅ Sudah Spin' : '🎰 Coba Lagi';
        btn.disabled = !!data.alreadySpun;
        showToast(data.message);
      }
    }, 2000);
  }catch(e){
    wheel.classList.remove('spinning');
    btn.disabled = false;
    statusEl.textContent = 'Gagal spin real: ' + e.message;
    showToast('Error spin real: ' + e.message);
  }
}

async function buyReal(days){
  if(!realUserId) return showToast('Buka via Telegram untuk beli real');
  
  if(!confirm('Buat invoice REAL untuk VIP ' + days + ' hari?\n\nTransfer manual ke DANA, upload bukti, admin approve.')){
    return;
  }

  try{
    // REAL invoice creation
    const r = await fetch('/api/deposit?user_id=' + realUserId + '&days=' + days, { method:'POST' });
    const data = await r.json();
    
    if(data.ok){
      const inv = data.invoice;
      const box = document.getElementById('invoiceBox');
      box.style.display = 'block';
      box.innerHTML = '<b>✅ Invoice REAL Dibuat:</b><br>ID: ' + inv.id + '<br>Paket: ' + inv.days + ' Hari<br>Total: ' + inv.amountFormatted + '<br>Transfer ke: ' + inv.transferTo.bank + ' ' + inv.transferTo.number + '<br><br>' + inv.nextStep + '<br><br><small>Cek chat bot untuk upload bukti foto.</small>';
      showToast('✅ Invoice REAL: ' + inv.id + ' - ' + inv.amountFormatted);
      tg.HapticFeedback.notificationOccurred('success');
    } else {
      showToast('❌ Gagal: ' + data.message);
    }
  }catch(e){
    showToast('Error buat invoice real: ' + e.message);
  }
}

function copyRefReal(){
  const txt = document.getElementById('refLink').textContent;
  if(txt.includes('Memuat') || txt.includes('Buka via')){
    return showToast('Link belum ready - data real belum load');
  }
  navigator.clipboard.writeText(txt).then(()=>{
    showToast('✅ Link REAL disalin: ' + txt.slice(0,40) + '...');
    tg.HapticFeedback.notificationOccurred('success');
  });
}

// Load real data on start
loadRealUser();
setInterval(loadRealUser, 10000);
</script>
</body>
</html>`);
};
