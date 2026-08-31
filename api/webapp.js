module.exports = async (req, res) => {
  res.setHeader('Content-Type','text/html');
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>WALZY STORE</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
:root{
  --bg:#f0f2f5;
  --card:#ffffff;
  --border:#dddfe2;
  --border-light:#e4e6eb;
  --text:#050505;
  --text2:#65676b;
  --blue:#0866ff;
  --blue-hover:#075ce5;
  --blue-light:#e7f3ff;
  --green:#31a24c;
  --yellow:#f7b928;
  --red:#e41e3f;
  --shadow:0 1px 2px rgba(0,0,0,0.1);
  --shadow2:0 12px 28px rgba(0,0,0,0.12),0 2px 4px rgba(0,0,0,0.08);
  --radius:8px;
  --radius2:12px;
}
*{box-sizing:border-box;margin:0;padding:0}
body{
  font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  background:var(--bg);
  color:var(--text);
  min-height:100vh;
  -webkit-font-smoothing:antialiased;
}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
.header{
  position:sticky;top:0;z-index:100;
  background:var(--card);
  border-bottom:1px solid var(--border);
  height:56px;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 16px;
  box-shadow:var(--shadow);
}
.brand{display:flex;align-items:center;gap:10px}
.brand-icon{width:36px;height:36px;background:var(--blue);border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:700;font-size:18px}
.brand-text{font-weight:700;font-size:20px;letter-spacing:-0.02em;color:var(--blue)}
.live{font-size:12px;color:var(--text2);display:flex;align-items:center;gap:6px}
.live-dot{width:8px;height:8px;background:var(--green);border-radius:50%;display:inline-block}
.container{max-width:680px;margin:0 auto;padding:16px 16px 90px}
.card{
  background:var(--card);
  border-radius:var(--radius);
  box-shadow:var(--shadow);
  border:1px solid var(--border-light);
  margin-bottom:16px;
  overflow:hidden;
}
.card-header{padding:12px 16px;border-bottom:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between}
.card-title{font-size:15px;font-weight:600;color:var(--text)}
.card-title-meta{font-size:13px;color:var(--text2);font-weight:400}
.card-body{padding:12px 16px}
.profile-row{display:flex;gap:12px;align-items:center}
.avatar{width:60px;height:60px;border-radius:50%;background:#e4e6eb;display:grid;place-items:center;font-weight:700;font-size:22px;color:var(--text2);flex-shrink:0}
.rank{display:inline-flex;align-items:center;padding:4px 8px;border-radius:12px;background:var(--blue-light);color:var(--blue);font-size:12px;font-weight:600;margin-top:6px}
.rank.vip{background:#fff4cc;color:#8a6d00}
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.stat{background:var(--card);border:1px solid var(--border-light);border-radius:var(--radius);padding:12px}
.stat-value{font-size:20px;font-weight:700;color:var(--text);line-height:1.2}
.stat-label{font-size:12px;color:var(--text2);margin-top:4px}
.btn{width:100%;padding:10px 16px;border-radius:6px;border:0;font-weight:500;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background 0.15s}
.btn-primary{background:var(--blue);color:#fff}
.btn-primary:hover{background:var(--blue-hover)}
.btn-secondary{background:var(--border-light);color:var(--text)}
.btn-secondary:hover{background:#d8dade}
.btn:disabled{opacity:0.5;cursor:not-allowed}
.input{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:6px;background:var(--card);font-size:15px;outline:none}
.input:focus{border-color:var(--blue);box-shadow:0 0 0 2px var(--blue-light)}
.package{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--border-light)}
.package:last-child{border-bottom:0}
.package-info b{font-size:15px;color:var(--text)}
.package-meta{font-size:13px;color:var(--text2);margin-top:2px}
.badge{font-size:11px;padding:2px 6px;border-radius:4px;background:var(--yellow);color:#000;font-weight:600;margin-left:6px}
.nav{position:fixed;bottom:0;left:0;right:0;background:var(--card);border-top:1px solid var(--border);display:flex;justify-content:space-around;padding:6px 0;z-index:90;max-width:680px;margin:0 auto}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px;cursor:pointer;color:var(--text2);font-size:11px;font-weight:500;border-radius:6px;margin:0 4px}
.nav-item.active{color:var(--blue);background:var(--blue-light)}
.nav-item svg{width:24px;height:24px}
.square-toast{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.9);width:320px;background:var(--card);border-radius:var(--radius2);box-shadow:var(--shadow2);padding:24px;display:none;flex-direction:column;align-items:center;text-align:center;z-index:300;opacity:0;transition:all 0.25s cubic-bezier(0.08,0.52,0.52,1)}
.square-toast.show{display:flex;transform:translate(-50%,-50%) scale(1);opacity:1}
.square-icon{width:60px;height:60px;border-radius:50%;display:grid;place-items:center;margin-bottom:12px}
.square-title{font-size:17px;font-weight:600;margin-bottom:6px}
.square-msg{font-size:14px;color:var(--text2);line-height:1.4}
.confetti-layer{position:fixed;inset:0;pointer-events:none;z-index:999;overflow:hidden;display:none}
.confetti-piece{position:absolute;top:-20px;border-radius:2px;animation:fall linear forwards}
.table{width:100%;border-collapse:collapse;font-size:14px}
.table th{font-size:12px;color:var(--text2);font-weight:500;text-align:left;padding:10px 12px;border-bottom:1px solid var(--border-light)}
.table td{padding:10px 12px;border-bottom:1px solid var(--border-light);font-size:14px}
.trans-step{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border-light)}
.trans-step:last-child{border-bottom:0}
.trans-icon{width:28px;height:28px;border-radius:50%;background:var(--border-light);display:grid;place-items:center;font-size:13px;font-weight:600;color:var(--text2);flex-shrink:0}
.trans-icon.done{background:var(--green);color:#fff}
.trans-icon.active{background:var(--blue);color:#fff}
.trans-content{flex:1}
.trans-title{font-size:14px;font-weight:500}
.trans-desc{font-size:12px;color:var(--text2);margin-top:2px}
@keyframes fall{to{transform:translateY(110vh) rotate(720deg);opacity:0.2}}
</style>
</head>
<body>
<div class="confetti-layer" id="confettiLayer"></div>
<div class="square-toast" id="squareToast"><div class="square-icon" id="squareIcon" style="background:var(--blue-light);color:var(--blue)"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div><div class="square-title" id="squareTitle">Berhasil</div><div class="square-msg" id="squareMsg">Transaksi diproses</div><button class="btn btn-primary" style="margin-top:16px;width:auto;padding:8px 20px" onclick="hideSquareToast()">Tutup</button></div>
<div class="header">
  <div class="brand"><div class="brand-icon">W</div><div class="brand-text">walzy</div></div>
  <div class="live"><span class="live-dot"></span><span id="time">--:--</span></div>
</div>

<div class="container" id="ownerLogin" style="display:none">
  <div class="card" style="max-width:400px;margin:60px auto;padding:0">
    <div class="card-header" style="justify-content:center;border-bottom:0;padding:20px 16px 0"><div style="width:60px;height:60px;background:var(--blue);border-radius:50%;display:grid;place-items:center;color:#fff"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div></div>
    <div class="card-body" style="text-align:center">
      <div style="font-size:20px;font-weight:700;margin-bottom:4px">Masuk sebagai Owner</div>
      <div style="font-size:14px;color:var(--text2);margin-bottom:16px">Keamanan tingkat tinggi - Enkripsi aktif</div>
      <input type="password" id="ownerPass" class="input" placeholder="Masukkan kata sandi" autocomplete="current-password" style="text-align:center">
      <button class="btn btn-primary" style="margin-top:12px" onclick="unlockOwner()">Masuk</button>
      <button class="btn btn-secondary" style="margin-top:8px" onclick="backToUser()">Kembali</button>
    </div>
  </div>
</div>

<div class="container" id="userView" style="display:none">
  <div class="card">
    <div class="card-body">
      <div class="profile-row"><div class="avatar" id="avatar">?</div><div style="flex:1"><div style="font-size:17px;font-weight:600" id="name">Memuat...</div><div class="mono" style="font-size:12px;color:var(--text2)" id="uid">ID: -</div><div id="badges" style="margin-top:6px"></div></div></div>
      <div style="margin-top:12px;height:6px;background:var(--border-light);border-radius:3px;overflow:hidden"><div id="limitBar" style="height:100%;background:var(--blue);width:0%;transition:width 0.5s"></div></div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:12px;color:var(--text2)"><span>Batas harian</span><span id="limitText">-</span></div>
    </div>
  </div>
  <div class="stat-grid">
    <div class="stat"><div class="stat-value" id="myFix">-</div><div class="stat-label">Pesanan Saya</div></div>
    <div class="stat"><div class="stat-value" id="globalFix">-</div><div class="stat-label">Total Pesanan</div></div>
    <div class="stat"><div class="stat-value" id="refCount">-</div><div class="stat-label">Referral</div></div>
    <div class="stat"><div class="stat-value" id="successRate">-</div><div class="stat-label">Keberhasilan</div></div>
  </div>
  <div class="card" style="margin-top:16px">
    <div class="card-header"><div class="card-title">Hadiah Harian</div><div class="card-title-meta" id="spinLast">-</div></div>
    <div class="card-body" style="text-align:center">
      <div style="width:80px;height:80px;margin:0 auto 12px;background:var(--blue-light);border-radius:50%;display:grid;place-items:center;color:var(--blue)" id="wheel"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg></div>
      <div style="font-size:14px;font-weight:500" id="spinStatus">Memuat...</div>
      <button class="btn btn-primary" style="margin-top:12px" id="spinBtn" onclick="doSpin()">Putar Sekarang</button>
    </div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">Paket Premium</div></div>
    <div class="card-body" style="padding:0 16px">
      <div class="package"><div class="package-info"><b>1 Hari</b><div class="package-meta">Rp 2.000 - Trial</div></div><button class="btn btn-secondary" style="width:auto;padding:6px 14px;font-size:14px" onclick="buyPackage(1)">Beli</button></div>
      <div class="package"><div class="package-info"><b>5 Hari</b> <span class="badge">Populer</span><div class="package-meta">Rp 5.000 - Hemat 50%</div></div><button class="btn btn-primary" style="width:auto;padding:6px 14px;font-size:14px" onclick="buyPackage(5)">Beli</button></div>
      <div class="package"><div class="package-info"><b>10 Hari</b><div class="package-meta">Rp 10.000 - Nilai terbaik</div></div><button class="btn btn-secondary" style="width:auto;padding:6px 14px;font-size:14px" onclick="buyPackage(10)">Beli</button></div>
      <div class="package"><div class="package-info"><b>30 Hari</b><div class="package-meta">Rp 60.000 - Sultan</div></div><button class="btn btn-secondary" style="width:auto;padding:6px 14px;font-size:14px" onclick="buyPackage(30)">Beli</button></div>
    </div>
    <div id="invoiceBox" style="display:none;margin:12px 16px;padding:12px;background:var(--blue-light);border-radius:6px;font-size:13px"></div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">Kode Voucher</div></div>
    <div class="card-body"><div style="display:flex;gap:8px"><input id="redeemInput" class="input" placeholder="Masukkan kode voucher" style="flex:1"><button class="btn btn-primary" style="width:auto;padding:10px 16px" onclick="doRedeem()">Tukar</button></div></div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">Undang Teman</div></div>
    <div class="card-body"><div style="font-size:13px;background:var(--bg);padding:10px;border-radius:6px;word-break:break-all" id="refLink">Memuat...</div><button class="btn btn-secondary" style="margin-top:10px" onclick="copyRef()">Salin Tautan</button></div>
  </div>
</div>

<div class="container" id="userTransactionView" style="display:none">
  <div class="card">
    <div class="card-header"><div class="card-title">Transaksi Saya</div><div class="card-title-meta">Proses ACC rapih</div></div>
    <div class="card-body" style="padding:0">
      <div id="userTransSteps" style="padding:12px 16px"></div>
    </div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">Riwayat Pembelian</div></div>
    <div id="userTransHistory">Memuat...</div>
  </div>
</div>

<div class="container" id="ownerView" style="display:none">
  <div class="card" style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%);color:#fff;border:0">
    <div class="card-body">
      <div style="display:flex;align-items:center;gap:12px"><div style="width:48px;height:48px;background:rgba(255,255,255,0.1);border-radius:50%;display:grid;place-items:center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg></div><div><div style="font-weight:600;font-size:16px;color:#fff">Panel Owner</div><div style="font-size:12px;color:#94a3b8">Beda 360° dari pengguna - Mode gelap eksklusif</div></div><button class="btn btn-secondary" style="width:auto;margin-left:auto;background:rgba(255,255,255,0.1);color:#fff;border:0" onclick="lockOwner()">Keluar</button></div>
    </div>
  </div>
  <div class="stat-grid">
    <div class="stat"><div class="stat-value" id="oUsers">-</div><div class="stat-label">Pengguna Valid</div></div>
    <div class="stat"><div class="stat-value" id="oPremium">-</div><div class="stat-label">VIP Aktif</div></div>
    <div class="stat"><div class="stat-value" id="oFix">-</div><div class="stat-label">Total Pesanan</div></div>
    <div class="stat" style="background:var(--blue-light)"><div class="stat-value" id="oToday" style="color:var(--blue)">-</div><div class="stat-label">Pesanan Hari Ini - Lebih Bermanfaat</div></div>
  </div>
  <div class="card" style="margin-top:16px">
    <div class="card-header"><div class="card-title">Ringkasan Real-time</div><div class="card-title-meta">Bukan gimmick</div></div>
    <div class="card-body" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 12px 12px">
      <div style="background:var(--bg);padding:10px;border-radius:6px"><div style="font-size:12px;color:var(--text2)">Sukses</div><div style="font-size:18px;font-weight:600;color:var(--green)" id="oSuccess">-</div></div>
      <div style="background:var(--bg);padding:10px;border-radius:6px"><div style="font-size:12px;color:var(--text2)">Gagal</div><div style="font-size:18px;font-weight:600;color:var(--red)" id="oFailed">-</div></div>
      <div style="background:var(--bg);padding:10px;border-radius:6px"><div style="font-size:12px;color:var(--text2)">Menunggu ACC</div><div style="font-size:18px;font-weight:600" id="oPending">-</div></div>
      <div style="background:var(--bg);padding:10px;border-radius:6px"><div style="font-size:12px;color:var(--text2)">Rasio</div><div style="font-size:18px;font-weight:600" id="oRate">-</div></div>
    </div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">Pengguna Terbaru - Real-time</div><div class="card-title-meta">Anti double</div></div>
    <table class="table" id="userTable"><tr><th>ID</th><th>Nama</th><th>Status</th><th>Pesanan</th></tr></table>
  </div>
</div>

<div class="container" id="ownerTransactionView" style="display:none">
  <div class="card">
    <div class="card-header"><div class="card-title">Transaksi - Proses ACC Rapih</div><div class="card-title-meta">Halaman pembelian terintegrasi</div></div>
    <div class="card-body" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div style="background:var(--bg);padding:12px;border-radius:6px"><div style="font-size:12px;color:var(--text2)">Menunggu ACC</div><div style="font-size:20px;font-weight:700" id="oTransPending">-</div></div>
      <div style="background:var(--blue-light);padding:12px;border-radius:6px"><div style="font-size:12px;color:var(--blue)">Dibayar Hari Ini</div><div style="font-size:20px;font-weight:700;color:var(--blue)" id="oTransPaid">-</div></div>
    </div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">Menunggu Persetujuan</div></div>
    <div id="queueBox">Memuat...</div>
  </div>
  <div class="card">
    <div class="card-header"><div class="card-title">Pembelian Terbaru</div></div>
    <div id="purchaseBox">Memuat...</div>
  </div>
</div>

<div class="nav">
  <div class="nav-item active" id="navHome" onclick="switchTab('home')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>Beranda</span></div>
  <div class="nav-item" id="navTrans" onclick="switchTab('transaksi')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg><span>Transaksi</span></div>
  <div class="nav-item" id="navProfile" onclick="switchTab('profile')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Profil</span></div>
</div>

<script>
const tg = window.Telegram ? window.Telegram.WebApp : null;
if(tg){ tg.ready(); tg.expand(); }
const tgUser = tg && tg.initDataUnsafe ? tg.initDataUnsafe.user : null;
const timeEl = document.getElementById('time');
const OWNER_IDS = ${JSON.stringify(require('../config').OWNER_IDS.map(String))};
const BOT_USERNAME = ${JSON.stringify(require('../config').BOT_USERNAME || 'fixedredbot')};
const OWNER_PASSWORD = 'SUPER777';

function showSquareToast(title, msg, type){
  const sq = document.getElementById('squareToast');
  const iconEl = document.getElementById('squareIcon');
  const titleEl = document.getElementById('squareTitle');
  const msgEl = document.getElementById('squareMsg');
  titleEl.textContent = title;
  msgEl.textContent = msg;
  if(type === 'success'){
    iconEl.style.background = '#e7f3ff';
    iconEl.style.color = '#0866ff';
    iconEl.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
  }else if(type === 'error'){
    iconEl.style.background = '#ffe0e0';
    iconEl.style.color = '#e41e3f';
    iconEl.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  }else{
    iconEl.style.background = '#f0f2f5';
    iconEl.style.color = '#65676b';
    iconEl.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
  }
  sq.classList.add('show');
  setTimeout(()=>{ hideSquareToast(); }, 3500);
}
function hideSquareToast(){ document.getElementById('squareToast').classList.remove('show'); }
function updateTime(){
  try{
    const now = new Date().toLocaleString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit'});
    timeEl.textContent = now + ' WIB';
  }catch{}
}
setInterval(updateTime,60000);updateTime();

let userId = tgUser ? String(tgUser.id) : null;
let isOwnerUser = userId && OWNER_IDS.includes(userId);
let lastKnownPremium = null;
let currentTab = 'home';

function isOwnerAuthed(){
  try{ return localStorage.getItem('owner_auth_v2') === OWNER_PASSWORD; }catch{ return false; }
}
function unlockOwner(){
  const inp = document.getElementById('ownerPass');
  const val = inp.value.trim();
  if(val === OWNER_PASSWORD){
    try{ localStorage.setItem('owner_auth_v2', OWNER_PASSWORD); }catch{}
    document.getElementById('ownerLogin').style.display = 'none';
    document.getElementById('ownerView').style.display = 'block';
    document.getElementById('userView').style.display = 'none';
    document.getElementById('userTransactionView').style.display = 'none';
    document.getElementById('ownerTransactionView').style.display = 'none';
    showSquareToast('Berhasil Masuk', 'Panel owner - Beda 360° dari pengguna', 'success');
    currentTab = 'home';
    updateNav();
    loadOwnerData();
  }else{
    showSquareToast('Kata Sandi Salah', 'Periksa kembali kata sandi owner', 'error');
    inp.value = '';
  }
}
function lockOwner(){
  try{ localStorage.removeItem('owner_auth_v2'); }catch{}
  document.getElementById('ownerView').style.display = 'none';
  document.getElementById('ownerTransactionView').style.display = 'none';
  document.getElementById('ownerLogin').style.display = 'block';
}
function backToUser(){
  document.getElementById('ownerLogin').style.display = 'none';
  document.getElementById('userView').style.display = 'block';
  loadUser();
}
function switchTab(tab){
  currentTab = tab;
  updateNav();
  if(isOwnerUser && isOwnerAuthed()){
    if(tab === 'home'){
      document.getElementById('ownerView').style.display = 'block';
      document.getElementById('ownerTransactionView').style.display = 'none';
      document.getElementById('userView').style.display = 'none';
      document.getElementById('userTransactionView').style.display = 'none';
      document.getElementById('ownerLogin').style.display = 'none';
      loadOwnerData();
    }else if(tab === 'transaksi'){
      document.getElementById('ownerView').style.display = 'none';
      document.getElementById('ownerTransactionView').style.display = 'block';
      document.getElementById('userView').style.display = 'none';
      document.getElementById('userTransactionView').style.display = 'none';
      loadOwnerData();
    }else{
      document.getElementById('ownerView').style.display = 'block';
      document.getElementById('ownerTransactionView').style.display = 'none';
    }
  }else{
    if(tab === 'home'){
      document.getElementById('userView').style.display = 'block';
      document.getElementById('userTransactionView').style.display = 'none';
      document.getElementById('ownerView').style.display = 'none';
      document.getElementById('ownerTransactionView').style.display = 'none';
      document.getElementById('ownerLogin').style.display = 'none';
      loadUser();
    }else if(tab === 'transaksi'){
      document.getElementById('userView').style.display = 'none';
      document.getElementById('userTransactionView').style.display = 'block';
      document.getElementById('ownerView').style.display = 'none';
      document.getElementById('ownerTransactionView').style.display = 'none';
      loadUserTransactions();
    }else{
      document.getElementById('userView').style.display = 'block';
      document.getElementById('userTransactionView').style.display = 'none';
    }
  }
}
function updateNav(){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  if(currentTab === 'home') document.getElementById('navHome').classList.add('active');
  else if(currentTab === 'transaksi') document.getElementById('navTrans').classList.add('active');
  else document.getElementById('navProfile').classList.add('active');
}
function dedupUsers(users){
  const map = new Map();
  for(let u of users){
    const idNum = Number(u.id);
    if(!idNum || idNum <= 0) continue;
    const idStr = String(u.id);
    if(idStr.startsWith('-')) continue;
    const name = (u.first_name || '').trim();
    if(!name) continue;
    const key = name.toLowerCase();
    if(key.includes('exploit') && (u.totalFix||0)===0 && (u.referralCount||0)===0) continue;
    if(!map.has(key)) map.set(key, u);
    else{
      const ex = map.get(key);
      const exScore = (ex.totalFix||0) + (ex.referralCount||0)*10;
      const curScore = (u.totalFix||0) + (u.referralCount||0)*10;
      if(curScore > exScore) map.set(key, u);
    }
  }
  return Array.from(map.values());
}

async function loadUser(){
  if(!userId){
    document.getElementById('userView').style.display = 'block';
    document.getElementById('name').textContent = 'Buka via Telegram';
    document.getElementById('uid').textContent = 'ID tidak terdeteksi';
    return;
  }
  if(isOwnerUser){
    if(isOwnerAuthed()){
      if(currentTab === 'transaksi'){
        document.getElementById('ownerTransactionView').style.display = 'block';
        document.getElementById('ownerView').style.display = 'none';
      }else{
        document.getElementById('ownerView').style.display = 'block';
        document.getElementById('ownerTransactionView').style.display = 'none';
      }
      document.getElementById('userView').style.display = 'none';
      document.getElementById('userTransactionView').style.display = 'none';
      document.getElementById('ownerLogin').style.display = 'none';
      return loadOwnerData();
    }else{
      document.getElementById('ownerLogin').style.display = 'block';
      document.getElementById('ownerView').style.display = 'none';
      document.getElementById('ownerTransactionView').style.display = 'none';
      document.getElementById('userView').style.display = 'none';
      document.getElementById('userTransactionView').style.display = 'none';
      return;
    }
  }
  document.getElementById('userView').style.display = currentTab === 'home' ? 'block' : 'none';
  document.getElementById('userTransactionView').style.display = currentTab === 'transaksi' ? 'block' : 'none';
  document.getElementById('ownerLogin').style.display = 'none';
  document.getElementById('ownerView').style.display = 'none';
  document.getElementById('ownerTransactionView').style.display = 'none';
  try{
    const r = await fetch('/api/user?user_id=' + userId);
    const data = await r.json();
    if(!data.ok) return;
    const u = data.user;
    const g = data.global;
    if(lastKnownPremium === false && u.isPremium === true){
      showSquareToast('Premium Aktif', 'Paket premium kamu sudah aktif', 'success');
    }
    lastKnownPremium = u.isPremium;
    document.getElementById('name').textContent = u.first_name + (u.username ? ' @' + u.username : '');
    document.getElementById('uid').textContent = 'ID: ' + u.id;
    document.getElementById('avatar').textContent = u.first_name.charAt(0).toUpperCase();
    const badgesEl = document.getElementById('badges');
    let badgesHtml = '<span class="rank">' + u.rank.name + '</span>';
    if(u.isPremium) badgesHtml += '<span class="rank vip">VIP ' + u.premiumLeft + ' hari</span>';
    badgesEl.innerHTML = badgesHtml;
    document.getElementById('limitBar').style.width = u.isPremium ? '100%' : Math.min(100, (u.dailyFix.used / 3) * 100) + '%';
    document.getElementById('limitText').textContent = u.isPremium ? 'Tak terbatas' : u.dailyFix.used + '/3';
    document.getElementById('myFix').textContent = u.totalFix;
    document.getElementById('globalFix').textContent = g.totalFix;
    document.getElementById('refCount').textContent = u.referralCount;
    const rate = g.totalFix > 0 ? Math.round((g.totalSuccess / g.totalFix) * 100) : 0;
    document.getElementById('successRate').textContent = rate + '%';
    document.getElementById('spinLast').textContent = u.lastSpin ? 'Terakhir: ' + u.lastSpin : 'Belum pernah';
    document.getElementById('spinStatus').textContent = u.canSpin ? 'Siap diklaim' : 'Sudah diklaim hari ini';
    document.getElementById('spinBtn').disabled = !u.canSpin;
    document.getElementById('spinBtn').textContent = u.canSpin ? 'Putar Sekarang' : 'Sudah Diklaim';
    document.getElementById('refLink').textContent = 'https://t.me/' + BOT_USERNAME + '?start=' + u.id;
    if(currentTab === 'transaksi') loadUserTransactionsData(u, data);
  }catch(e){}
}

async function loadUserTransactions(){
  if(!userId) return;
  try{
    const r = await fetch('/api/user?user_id=' + userId);
    const data = await r.json();
    if(data.ok) loadUserTransactionsData(data.user, data);
  }catch(e){}
}
function loadUserTransactionsData(u, data){
  const stepsEl = document.getElementById('userTransSteps');
  const currentInv = data.currentInvoice || null;
  let html = '';
  html += '<div class="trans-step"><div class="trans-icon ' + (u.isPremium ? 'done' : '') + '">1</div><div class="trans-content"><div class="trans-title">Pilih paket</div><div class="trans-desc">1 hari, 5 hari, 10 hari, 30 hari</div></div></div>';
  html += '<div class="trans-step"><div class="trans-icon ' + (currentInv ? 'done' : '') + '">2</div><div class="trans-content"><div class="trans-title">Invoice dibuat</div><div class="trans-desc">' + (currentInv ? currentInv.id : 'Belum ada') + '</div></div></div>';
  html += '<div class="trans-step"><div class="trans-icon ' + (data.hasProof ? 'done' : (currentInv ? 'active' : '')) + '">3</div><div class="trans-content"><div class="trans-title">Unggah bukti</div><div class="trans-desc">Kirim foto bukti transfer</div></div></div>';
  html += '<div class="trans-step"><div class="trans-icon ' + (u.isPremium ? 'done' : '') + '">4</div><div class="trans-content"><div class="trans-title">Menunggu persetujuan</div><div class="trans-desc">' + (u.isPremium ? 'Disetujui - Premium aktif' : 'Proses maksimal 24 jam') + '</div></div></div>';
  stepsEl.innerHTML = html;
  const histEl = document.getElementById('userTransHistory');
  const invoices = data.invoices || [];
  if(invoices.length === 0){
    histEl.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text2);font-size:14px">Belum ada transaksi</div>';
  }else{
    histEl.innerHTML = invoices.map(inv => {
      const color = inv.status === 'paid' ? 'var(--green)' : inv.status === 'waiting_approval' ? 'var(--yellow)' : 'var(--text2)';
      return '<div style="display:flex;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border-light)"><div><div style="font-size:14px;font-weight:500">' + inv.id + '</div><div style="font-size:12px;color:var(--text2)">' + inv.days + ' hari | Rp ' + (inv.amount||0).toLocaleString('id-ID') + '</div></div><div style="font-size:12px;color:' + color + ';font-weight:600">' + inv.status + '</div></div>';
    }).join('');
  }
}

async function loadOwnerData(){
  try{
    const r = await fetch('/api/stats?user_id=' + userId);
    const data = await r.json();
    if(!data.ok || !data.isOwner) return;
    let recentFiltered = dedupUsers(data.recentUsers || []);
    let pendingFiltered = (data.pendingPayments || []).filter(p => Number(p.userId) > 0 && !String(p.userId).startsWith('-'));
    document.getElementById('oUsers').textContent = data.usersValid !== undefined ? data.usersValid : recentFiltered.length;
    document.getElementById('oPremium').textContent = data.premium;
    document.getElementById('oFix').textContent = data.totalFix;
    const todayCount = data.todayOrders !== undefined ? data.todayOrders : pendingFiltered.length + (data.paidToday||0);
    document.getElementById('oToday').textContent = todayCount;
    document.getElementById('oSuccess').textContent = data.totalSuccess || 0;
    document.getElementById('oFailed').textContent = data.totalFailed || 0;
    document.getElementById('oPending').textContent = pendingFiltered.length;
    const total = (data.totalSuccess||0) + (data.totalFailed||0);
    const conv = total ? Math.round(((data.totalSuccess||0)/total)*100) : 0;
    document.getElementById('oRate').textContent = conv + '%';
    document.getElementById('oTransPending').textContent = pendingFiltered.length;
    document.getElementById('oTransPaid').textContent = (data.paidPayments||[]).length;
    const purchaseBox = document.getElementById('purchaseBox');
    const paid = data.paidPayments || [];
    const paidFiltered = paid.filter(p => Number(p.userId) > 0).slice(0,10);
    if(paidFiltered.length === 0){
      purchaseBox.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text2);font-size:14px">Belum ada pembelian</div>';
    }else{
      purchaseBox.innerHTML = paidFiltered.map(p => '<div style="display:flex;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border-light)"><div><div style="font-size:14px;font-weight:500">' + p.invoice + '</div><div style="font-size:12px;color:var(--text2)">User: ' + p.userId + ' | ' + p.days + ' hari | Rp ' + (p.amount||0).toLocaleString('id-ID') + '</div></div><div style="font-size:12px;color:var(--green);font-weight:600">PAID</div></div>').join('');
    }
    const queueBox = document.getElementById('queueBox');
    if(pendingFiltered.length === 0){
      queueBox.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text2);font-size:14px">Tidak ada antrean</div>';
    }else{
      queueBox.innerHTML = pendingFiltered.map(p => '<div style="padding:12px 16px;border-bottom:1px solid var(--border-light)"><div style="display:flex;justify-content:space-between"><div style="font-size:14px;font-weight:500">' + p.invoice + '</div><div style="font-size:12px;background:#fff4cc;padding:2px 6px;border-radius:4px">' + p.status + '</div></div><div style="font-size:12px;color:var(--text2);margin-top:4px">User: ' + p.userId + ' | ' + p.days + ' hari | Rp ' + (p.amount||0).toLocaleString('id-ID') + '</div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-primary" style="padding:8px 12px;font-size:13px" onclick="ownerAction(\\'' + p.invoice + '\\',\\'approve\\')">Setujui</button><button class="btn btn-secondary" style="padding:8px 12px;font-size:13px" onclick="ownerAction(\\'' + p.invoice + '\\',\\'reject\\')">Tolak</button></div></div>').join('');
    }
    const userTable = document.getElementById('userTable');
    userTable.innerHTML = '<tr><th>ID</th><th>Nama</th><th>Status</th><th>Pesanan</th></tr>' + recentFiltered.map(u => '<tr><td>' + u.id + '</td><td>' + (u.first_name||'User').substring(0,12) + '</td><td>' + (u.isPremium?'VIP':'Free') + '</td><td>' + u.totalFix + '</td></tr>').join('');
  }catch(e){}
}

async function ownerAction(invoice, action){
  try{
    const r = await fetch('/api/owner_action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner_id: userId, action, invoice, password: OWNER_PASSWORD })
    });
    const data = await r.json();
    if(data.ok){
      showSquareToast(action === 'approve' ? 'Disetujui' : 'Ditolak', data.message, action === 'approve' ? 'success' : 'error');
      loadOwnerData();
    }else{
      showSquareToast('Gagal', data.message, 'error');
    }
  }catch(e){ showSquareToast('Error', e.message, 'error'); }
}

async function doSpin(){
  if(!userId) return showSquareToast('Gagal', 'Buka via Telegram', 'error');
  const btn = document.getElementById('spinBtn');
  btn.disabled = true;
  btn.textContent = 'Memutar...';
  try{
    const r = await fetch('/api/spin?user_id=' + userId, { method:'POST' });
    const data = await r.json();
    if(data.ok){
      showSquareToast('Hadiah Didapat', data.reward.label, 'success');
      loadUser();
    }else{
      showSquareToast('Info', data.message, 'error');
      btn.disabled = data.alreadySpun;
      btn.textContent = data.alreadySpun ? 'Sudah Diklaim' : 'Putar Sekarang';
    }
  }catch(e){ showSquareToast('Error', e.message, 'error'); btn.disabled = false; }
}

let currentInvoice = null;
async function buyPackage(days){
  if(!userId) return showSquareToast('Gagal', 'Buka via Telegram', 'error');
  try{
    const r = await fetch('/api/deposit?user_id=' + userId + '&days=' + days, { method:'POST' });
    const data = await r.json();
    if(data.ok){
      const inv = data.invoice;
      currentInvoice = inv.id;
      const box = document.getElementById('invoiceBox');
      box.style.display = 'block';
      const amount = inv.amountFormatted || ('Rp ' + (inv.amount||0).toLocaleString('id-ID'));
      box.innerHTML = 'Invoice: ' + inv.id + '<br>Paket: ' + inv.days + ' hari<br>Total: ' + amount + '<br><br><div style="position:relative"><button class="btn btn-primary" style="padding:8px 12px">Unggah Bukti</button><input type="file" accept="image/*" onchange="handleProofUpload(event)" style="position:absolute;inset:0;opacity:0"></div><div id="uploadStatus" style="margin-top:8px;font-size:12px;color:var(--text2)"></div>';
      showSquareToast('Invoice Dibuat', inv.id + ' - Buka Transaksi untuk lanjut', 'success');
      switchTab('transaksi');
    }else{
      showSquareToast('Gagal', data.message, 'error');
    }
  }catch(e){ showSquareToast('Error', e.message, 'error'); }
}
function handleProofUpload(evt){
  const file = evt.target.files[0];
  if(!file || !currentInvoice) return;
  const statusEl = document.getElementById('uploadStatus');
  statusEl.textContent = 'Mengompresi...';
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
  statusEl.textContent = 'Mengunggah...';
  try{
    const r = await fetch('/api/upload_proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, invoice: currentInvoice, image_base64: base64 })
    });
    const data = await r.json();
    if(data.ok){
      statusEl.textContent = 'Bukti terkirim - Menunggu persetujuan';
      showSquareToast('Terkirim', 'Menunggu persetujuan owner', 'success');
    }else{
      statusEl.textContent = data.message;
      showSquareToast('Gagal', data.message, 'error');
    }
  }catch(e){ statusEl.textContent = e.message; showSquareToast('Error', e.message, 'error'); }
}
function doRedeem(){
  const code = document.getElementById('redeemInput').value.trim().toUpperCase();
  if(!code) return showSquareToast('Gagal', 'Masukkan kode', 'error');
  fetch('/api/redeem?user_id=' + userId + '&code=' + code, { method:'POST' }).then(r=>r.json()).then(data=>{
    if(data.ok){
      showSquareToast('Berhasil', 'Voucher ' + code + ' ditukar', 'success');
      loadUser();
    }else{
      showSquareToast('Gagal', data.message, 'error');
    }
  });
}
function copyRef(){
  const txt = document.getElementById('refLink').textContent;
  if(txt.includes('Memuat')) return;
  if(navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>showSquareToast('Disalin', 'Tautan referral disalin', 'success'));
}
document.getElementById('ownerPass').addEventListener('keypress', function(e){ if(e.key === 'Enter') unlockOwner(); });
loadUser();
setInterval(()=>{
  if(isOwnerUser && isOwnerAuthed()) loadOwnerData();
  else{
    if(currentTab === 'transaksi') loadUserTransactions();
    else loadUser();
  }
}, 3000);
</script>
</body>
</html>`);
};
