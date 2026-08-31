module.exports = async (req, res) => {
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','no-cache');
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>WALZY STORE</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#f6f7fb;--bg2:#eef1f8;--card:#ffffff;--card2:#fafbff;--border:#e7e9f3;--border2:#eef0f7;--text:#0f172a;--muted:#7c859c;--muted2:#a3acc2;--blue:#0a7cff;--blue2:#6a5cff;--blue-light:#eef4ff;--green:#10b981;--green-light:#dcfce7;--red:#ef4444;--red-light:#fee2e2;--orange:#f59e0b;--orange-light:#fef3c7;--shadow:0 8px 30px rgba(15,23,42,0.06);--shadow2:0 20px 60px rgba(15,23,42,0.12);--radius:18px;--radius2:24px}
@media(prefers-color-scheme:dark){:root{--bg:#0b101f;--bg2:#11182f;--card:#151d32;--card2:#1c2640;--border:#1e2a4a;--border2:#1c2846;--text:#eef2ff;--muted:#8b9ab8;--muted2:#6b7ea1;--blue-light:#162a5a;--shadow:0 8px 30px rgba(0,0,0,0.3);--shadow2:0 20px 60px rgba(0,0,0,0.5)}}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:linear-gradient(180deg,var(--bg),var(--bg2));color:var(--text);min-height:100vh;overflow-x:hidden}
.mono{font-family:'JetBrains Mono',monospace}
.header{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.8);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border);height:66px;display:flex;align-items:center;justify-content:space-between;padding:0 18px}
@media(prefers-color-scheme:dark){.header{background:rgba(21,29,50,0.85)}}
.brand{display:flex;align-items:center;gap:11px;cursor:pointer;user-select:none}
.brand-icon{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,var(--blue),var(--blue2));display:grid;place-items:center;color:#fff;font-weight:800;font-size:18px;box-shadow:0 10px 24px rgba(10,124,255,0.32)}
.brand-text{font-weight:800;font-size:17px;letter-spacing:-0.02em}
.brand-sub{font-size:10px;color:var(--muted);font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin-top:-1px}
.live{display:flex;align-items:center;gap:7px;font-size:11px;color:var(--muted);font-weight:600;background:var(--card);border:1px solid var(--border);padding:6px 11px;border-radius:100px}
.live-dot{width:7px;height:7px;background:var(--green);border-radius:50%;animation:pulse 1.5s infinite}
.container{max-width:760px;margin:0 auto;padding:18px 14px 110px}
.view{display:none;animation:slideUp 0.38s both}
.view.active{display:block}
.card{background:var(--card);border-radius:var(--radius2);border:1px solid var(--border);box-shadow:var(--shadow);margin-bottom:14px;overflow:hidden;animation:slideUp 0.4s both;position:relative}
.card-h{padding:16px 18px;border-bottom:1px solid var(--border2);display:flex;justify-content:space-between;align-items:center}
.card-t{font-size:12px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;gap:7px}
.card-t b{color:var(--text);text-transform:none;font-size:13px;letter-spacing:-0.02em}
.card-b{padding:16px 18px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.avatar{width:62px;height:62px;border-radius:18px;background:linear-gradient(135deg,#e0e7ff,#dbeafe 60%,#bfdbfe);border:1px solid #c7d2fe;display:grid;place-items:center;font-weight:800;font-size:22px;color:var(--blue)}
@media(prefers-color-scheme:dark){.avatar{background:linear-gradient(135deg,#1e2a5a,#1a2f5e);border-color:#25407a;color:#93c5fd}}
.badge{display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:100px;font-size:10px;font-weight:800;letter-spacing:0.02em;border:1px solid transparent}
.badge-blue{background:var(--blue-light);color:var(--blue);border-color:rgba(10,124,255,0.14)}
.badge-green{background:var(--green-light);color:#065f46}
.badge-orange{background:var(--orange-light);color:#92400e}
.badge-vip{background:linear-gradient(135deg,#fef3c7,#fde68a);color:#92400e;border-color:#fcd34d}
.stat{padding:14px;border-radius:18px;background:var(--card);border:1px solid var(--border);position:relative;overflow:hidden}
.stat-v{font-size:22px;font-weight:800;letter-spacing:-0.03em;display:flex;align-items:baseline;gap:5px}
.stat-v small{font-size:11px;font-weight:600;color:var(--muted)}
.stat-l{font-size:10px;color:var(--muted);text-transform:uppercase;margin-top:7px;font-weight:700;letter-spacing:0.06em}
.stat-icon{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;font-size:17px;margin-bottom:9px}
.btn{width:100%;padding:12px 15px;border-radius:13px;border:1px solid var(--border);background:var(--card);font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all 0.18s}
.btn:active{transform:scale(0.98)}
.btn-primary{background:linear-gradient(135deg,var(--blue),var(--blue2));color:#fff;border:0;box-shadow:0 10px 24px rgba(10,124,255,0.28)}
.btn-ghost{background:transparent;border:1px dashed var(--border)}
.btn-small{padding:8px 13px;font-size:11px;width:auto;border-radius:100px}
.btn:disabled{opacity:0.5;pointer-events:none}
.input{width:100%;padding:12px 13px;border-radius:12px;border:1px solid var(--border);font-size:13px;outline:none;font-family:inherit;background:var(--card);color:var(--text);transition:all 0.18s;font-weight:500}
.input:focus{border-color:var(--blue);box-shadow:0 0 0 4px var(--blue-light)}
.pkg{display:flex;justify-content:space-between;align-items:center;padding:15px 0;border-bottom:1px solid var(--border2);gap:10px}
.pkg:last-child{border-bottom:0}
.pkg-name{font-weight:700;font-size:13px}
.pkg-desc{font-size:11px;color:var(--muted);margin-top:3px}
.pkg-price{font-weight:800;font-size:14px}
.nav{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.88);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid var(--border);display:flex;gap:5px;padding:7px;border-radius:20px;box-shadow:0 20px 60px rgba(15,23,42,0.14);z-index:90;max-width:380px;width:calc(100% - 20px)}
@media(prefers-color-scheme:dark){.nav{background:rgba(21,29,50,0.88)}}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 5px;border-radius:13px;cursor:pointer;color:var(--muted);font-size:9px;font-weight:700;letter-spacing:0.03em;text-transform:uppercase;transition:all 0.2s}
.nav-item i{font-size:17px;font-style:normal}
.nav-item.active{background:linear-gradient(135deg,var(--text),#1e293b);color:#fff;box-shadow:0 8px 20px rgba(15,23,42,0.22)}
@media(prefers-color-scheme:dark){.nav-item.active{background:linear-gradient(135deg,var(--blue),var(--blue2))}}
.owner-tab{display:flex;gap:7px;overflow-x:auto;padding-bottom:9px;scrollbar-width:none}
.owner-tab::-webkit-scrollbar{display:none}
.tab{padding:8px 14px;border-radius:100px;background:var(--card);border:1px solid var(--border);font-size:11px;font-weight:700;white-space:nowrap;cursor:pointer;color:var(--muted);transition:all 0.18s;display:flex;align-items:center;gap:5px}
.tab.active{background:var(--text);color:#fff;border-color:var(--text)}
.table{width:100%;border-collapse:collapse;font-size:12px}
.table th{font-size:9px;color:var(--muted);text-align:left;padding:10px 11px;border-bottom:1px solid var(--border2);text-transform:uppercase;letter-spacing:0.07em;font-weight:700}
.table td{padding:10px 11px;border-bottom:1px solid var(--border2);font-weight:500}
.toast{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.92);width:300px;background:var(--card);border:1px solid var(--border);border-radius:22px;box-shadow:var(--shadow2);padding:24px 20px;display:none;flex-direction:column;align-items:center;text-align:center;z-index:500;opacity:0;transition:all 0.34s cubic-bezier(0.34,1.56,0.64,1)}
.toast.show{display:flex;transform:translate(-50%,-50%) scale(1);opacity:1}
.toast-icon{width:60px;height:60px;border-radius:18px;display:grid;place-items:center;margin-bottom:14px;font-size:26px}
.invoice-card{background:linear-gradient(135deg,var(--card),var(--card2));border:2px dashed var(--border);border-radius:18px;padding:18px;position:relative}
.invoice-id{font-family:'JetBrains Mono',monospace;font-weight:700;background:var(--bg2);padding:5px 9px;border-radius:8px;border:1px solid var(--border);display:inline-flex;font-size:11px}
.empty{padding:32px 18px;text-align:center;color:var(--muted)}
.empty-icon{width:64px;height:64px;margin:0 auto 12px;background:var(--bg2);border:1px solid var(--border);border-radius:18px;display:grid;place-items:center;font-size:28px}
.empty-title{font-weight:700;color:var(--text);margin-bottom:5px;font-size:13px}
.empty-desc{font-size:11px;line-height:1.5}
.progress{height:5px;background:var(--border);border-radius:100px;overflow:hidden}
.progress-bar{height:100%;background:linear-gradient(90deg,var(--blue),var(--blue2));border-radius:100px;transition:width 0.5s ease}
.loading{position:fixed;inset:0;background:var(--bg);z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;transition:opacity 0.4s}
.loading.hide{opacity:0;visibility:hidden;pointer-events:none}
.logo{width:60px;height:60px;border-radius:18px;background:linear-gradient(135deg,var(--blue),var(--blue2));display:grid;place-items:center;color:#fff;font-weight:800;font-size:26px;animation:float 2s ease-in-out infinite;box-shadow:0 14px 28px rgba(10,124,255,0.3)}
.dots{display:flex;gap:5px}
.dots span{width:7px;height:7px;background:var(--blue);border-radius:50%;animation:dot 1.4s infinite}
.dots span:nth-child(2){animation-delay:0.2s}
.dots span:nth-child(3){animation-delay:0.4s}
.skeleton{background:linear-gradient(90deg,var(--border) 25%,var(--border2) 50%,var(--border) 75%);background-size:200% 100%;animation:shim 1.2s infinite;border-radius:8px;min-height:12px}
@keyframes slideUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.1)}100%{transform:scale(1)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes dot{0%,80%,100%{transform:scale(0.8);opacity:0.5}40%{transform:scale(1.1);opacity:1}}
@keyframes shim{0%{background-position:-200% 0}100%{background-position:200% 0}}
</style>
</head>
<body>
<div class="loading" id="loading"><div class="logo">W</div><div style="text-align:center"><div style="font-weight:800;font-size:17px">walzy store</div><div style="font-size:11px;color:var(--muted);margin-top:3px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase">Memuat profil asli...</div></div><div class="dots"><span></span><span></span><span></span></div></div>

<div class="toast" id="toast"><div id="tIcon" class="toast-icon" style="background:var(--blue-light)">✅</div><div style="font-weight:800;font-size:14px" id="tTitle">Berhasil</div><div style="font-size:11px;color:var(--muted);margin-top:6px;line-height:1.5" id="tMsg">Ok</div><button class="btn btn-primary" style="margin-top:16px;width:auto;padding:9px 22px;border-radius:100px" onclick="hideT()">Tutup</button></div>

<div class="header">
<div class="brand" id="brandBtn"><div class="brand-icon">W</div><div><div class="brand-text">walzy store</div><div class="brand-sub">Realtime • Premium</div></div></div>
<div class="live"><span class="live-dot"></span><span id="time">--:--</span></div>
</div>

<div class="container">

<div id="ownerLoginView" class="view">
<div class="card" style="max-width:360px;margin:50px auto"><div style="height:4px;background:linear-gradient(90deg,var(--blue),var(--blue2))"></div><div class="card-b" style="text-align:center;padding:28px 20px"><div style="width:64px;height:64px;margin:0 auto 14px;background:linear-gradient(135deg,var(--text),#1e293b);border-radius:18px;display:grid;place-items:center;color:#fff;font-size:26px">🔒</div><div style="font-size:18px;font-weight:800">Owner Access</div><div style="font-size:11px;color:var(--muted);margin-top:6px;line-height:1.4">Masukkan password owner untuk buka dashboard</div><input type="password" id="ownerPass" class="input" placeholder="••••••••" style="margin-top:18px;text-align:center;letter-spacing:0.4em"><button class="btn btn-primary" style="margin-top:12px" onclick="unlockOwner()">Buka Dashboard</button><button class="btn btn-ghost" style="margin-top:8px" onclick="showView('homeView')">Kembali</button></div></div>
</div>

<div id="homeView" class="view active">
<div class="card" id="profileCard"><div class="card-b" style="display:flex;gap:14px;align-items:center"><div class="avatar" id="av">W</div><div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap"><div style="font-weight:800;font-size:15px" id="uName">Memuat...</div><span id="uRank" class="badge badge-vip">BASIC 🌱</span></div><div style="font-size:11px;color:var(--muted);margin-top:4px;display:flex;align-items:center;gap:5px"><span id="uStatus">Menghubungkan Telegram...</span></div><div style="font-size:10px;color:var(--muted2);margin-top:4px" id="uId">ID: --</div><div style="margin-top:10px"><div class="progress"><div id="uProg" class="progress-bar" style="width:0%"></div></div><div style="font-size:9px;color:var(--muted);margin-top:5px;font-weight:600;letter-spacing:0.04em" id="uProgTxt">Memuat data...</div></div></div></div></div>

<div class="grid-2"><div class="stat"><div class="stat-icon" style="background:var(--blue-light);color:var(--blue)">📦</div><div class="stat-v" id="sTotal">0<small>order</small></div><div class="stat-l">Total Order</div></div><div class="stat"><div class="stat-icon" style="background:var(--orange-light);color:#92400e">👥</div><div class="stat-v" id="sRef">0<small>orang</small></div><div class="stat-l">Referral</div></div></div>

<div class="card"><div class="card-h"><div class="card-t"><span>🎰</span><b>Daily Spin</b></div><span class="badge badge-orange">Harian</span></div><div class="card-b"><button id="spinBtn" class="btn btn-primary" onclick="doSpin()">🎰 Putar Spin Harian</button><div style="font-size:10px;color:var(--muted);margin-top:8px;text-align:center">Spin setiap hari dapat bonus VIP & pesanan</div></div></div>

<div class="card"><div class="card-h"><div class="card-t"><span>💎</span><b>Paket Premium</b></div><span class="badge badge-blue">Terlaris</span></div><div class="card-b" id="pkgHome"><div class="skeleton" style="height:48px;margin-bottom:10px"></div><div class="skeleton" style="height:48px"></div></div><div style="padding:0 18px 16px"><button class="btn" onclick="showView('orderView')">Lihat Semua Paket →</button></div></div>

<div class="grid-2"><div class="card"><div class="card-b"><div style="font-size:10px;font-weight:800;color:var(--muted);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:9px">🔗 Referral Link</div><div class="mono" id="refLink" style="font-size:10px;background:var(--bg2);border:1px solid var(--border);padding:9px;border-radius:11px;word-break:break-all;color:var(--muted);min-height:34px">Memuat...</div><button class="btn btn-small" style="margin-top:9px;width:100%" onclick="copyRef()">📋 Salin</button></div></div><div class="card"><div class="card-b"><div style="font-size:10px;font-weight:800;color:var(--muted);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:9px">🎟️ Redeem Voucher</div><input id="redeemInput" class="input mono" placeholder="KODE" style="text-transform:uppercase;text-align:center;font-weight:700"><button class="btn btn-primary btn-small" style="margin-top:9px;width:100%" onclick="doRedeem()">Tukar</button></div></div></div>
</div>

<div id="orderView" class="view">
<div class="card"><div class="card-h"><div class="card-t"><span>💎</span><b>Pilih Paket Premium</b></div><span class="badge badge-blue">Best Price</span></div><div class="card-b" id="pkgOrder"></div></div>
<div class="card" id="invoiceCard" style="display:none"><div class="card-h"><div class="card-t"><span>🧾</span><b>Invoice Aktif</b></div><span class="badge badge-orange" id="invStatus">Menunggu</span></div><div class="card-b"><div id="invoiceBox"></div></div></div>
<div class="card"><div class="card-h"><div class="card-t"><span>📜</span><b>Riwayat Transaksi</b></div><span class="badge badge-blue" id="hCount">0</span></div><div class="card-b" style="padding:0"><div style="overflow:auto"><table class="table"><thead><tr><th>Invoice</th><th>Paket</th><th>Status</th><th>Tgl</th></tr></thead><tbody id="hTable"><tr><td colspan="4" style="text-align:center;padding:20px;color:var(--muted)">Memuat...</td></tr></tbody></table></div></div></div>
<div style="margin-top:10px"><button class="btn btn-ghost" onclick="showView('homeView')">← Kembali ke Home</button></div>
</div>

<div id="ownerView" class="view">
<div class="grid-2" style="margin-bottom:12px"><div class="stat"><div class="stat-icon" style="background:var(--blue-light);color:var(--blue)">👥</div><div class="stat-v" id="oUsers">0</div><div class="stat-l">Pengguna Valid</div></div><div class="stat"><div class="stat-icon" style="background:var(--orange-light);color:#92400e">💎</div><div class="stat-v" id="oVip">0</div><div class="stat-l">VIP Member</div></div><div class="stat"><div class="stat-icon" style="background:var(--green-light);color:#065f46">📦</div><div class="stat-v" id="oToday">0</div><div class="stat-l">Order Hari Ini</div></div><div class="stat"><div class="stat-icon" style="background:var(--blue-light);color:var(--blue)">💰</div><div class="stat-v" id="oRev">0</div><div class="stat-l">Revenue</div></div></div>
<div class="card"><div class="card-h"><div class="card-t"><span>🎛️</span><b>Owner Studio</b></div><span class="badge badge-blue">DARK PRO</span></div><div class="card-b"><div class="owner-tab" id="oTabs"><div class="tab active" onclick="switchOwnerTab('pending',this)">Pending</div><div class="tab" onclick="switchOwnerTab('users',this)">Users</div><div class="tab" onclick="switchOwnerTab('voucher',this)">Voucher</div><div class="tab" onclick="switchOwnerTab('broadcast',this)">Broadcast</div></div><div id="ownerContent" style="margin-top:14px"></div></div></div>
<div class="card" id="voucherCard" style="display:none"><div class="card-h"><div class="card-t"><span>🎟️</span><b>Buat Voucher</b></div></div><div class="card-b"><div class="grid-2"><div><div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:6px">KODE</div><input id="vCode" class="input mono" placeholder="WALZY30" style="text-transform:uppercase"></div><div><div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:6px">HARI</div><input id="vDays" class="input" type="number" placeholder="30"></div></div><div class="grid-2" style="margin-top:10px"><div><div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:6px">KUOTA 0=∞</div><input id="vQuota" class="input" type="number" placeholder="10"></div><div><div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:6px">TIPE</div><select id="vType" class="input"><option value="public">Public</option><option value="private">Private</option></select></div></div><button class="btn btn-primary" style="margin-top:12px" onclick="createVoucher()">Buat Voucher</button></div></div>
<div style="margin-top:10px"><button class="btn btn-ghost" onclick="showView('homeView')">← Kembali ke Home</button></div>
</div>

</div>

<div class="nav" id="nav"><div class="nav-item active" data-v="homeView" id="navHome" onclick="showView('homeView')"><i>🏠</i><span>Home</span></div><div class="nav-item" data-v="orderView" id="navOrder" onclick="showView('orderView')"><i>📦</i><span>Order</span></div><div class="nav-item" data-v="back" id="navBack" onclick="goBack()"><i>↩️</i><span>Kembali</span></div><div class="nav-item" data-v="ownerView" id="navOwner" style="display:none" onclick="openOwner()"><i>👑</i><span>Owner</span></div></div>

<script>
let userId=null;
let tgUser=null;
let isOwner=false;
let ownerPass=sessionStorage.getItem('walzy_pass')||'';
let currentInvoice=null;
let cacheUser=null;
let cacheStats=null;
let clickCount=0;
let lastClick=0;
let curView='homeView';

function safeJson(t){
try{
if(typeof t!=='string') return t;
if(t.trim().startsWith('<')) throw new Error('HTML');
return JSON.parse(t);
}catch(e){
throw new Error('JSON_INVALID');
}
}

async function fetchJson(url,opts){
opts=opts||{};
let r;
try{
r=await fetch(url,opts);
}catch(e){
throw new Error('NETWORK');
}
let txt=await r.text();
if(!r.ok){
try{
let j=JSON.parse(txt);
throw new Error(j.message||'SERVER_ERROR');
}catch{
if(txt.includes('<!DOCTYPE')||txt.trim().startsWith('<')) throw new Error('API_404');
throw new Error('SERVER_'+r.status);
}
}
if(txt.trim().startsWith('<')||txt.includes('<!DOCTYPE')){
throw new Error('API_HTML');
}
try{
return JSON.parse(txt);
}catch(e){
throw new Error('JSON_PARSE');
}
}

function showT(t,m,type){
let el=document.getElementById('toast');
let ic=document.getElementById('tIcon');
document.getElementById('tTitle').textContent=t;
document.getElementById('tMsg').textContent=m;
if(type==='error'){ic.style.background='var(--red-light)';ic.textContent='❌';}
else if(type==='success'){ic.style.background='var(--green-light)';ic.textContent='✅';}
else{ic.style.background='var(--orange-light)';ic.textContent='ℹ️';}
el.classList.add('show');
if(window.Telegram&&Telegram.WebApp&&Telegram.WebApp.HapticFeedback){try{Telegram.WebApp.HapticFeedback.notificationOccurred(type==='success'?'success':'error');}catch(e){}}
setTimeout(hideT,3200);
}
function hideT(){document.getElementById('toast').classList.remove('show');}

function hideLoad(){let el=document.getElementById('loading');if(el)el.classList.add('hide');}

function showView(v){
if(v==='back'){goBack();return;}
document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
let target=document.getElementById(v);
if(target)target.classList.add('active');
document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
let nav=document.querySelector('.nav-item[data-v="'+v+'"]');
if(nav)nav.classList.add('active');
curView=v;
if(window.Telegram&&Telegram.WebApp&&Telegram.WebApp.HapticFeedback){try{Telegram.WebApp.HapticFeedback.impactOccurred('light');}catch(e){}}
if(v==='orderView') loadHistory();
if(v==='ownerView') loadOwner();
window.scrollTo({top:0,behavior:'smooth'});
}

function goBack(){
if(curView!=='homeView'){showView('homeView');return;}
if(window.Telegram&&Telegram.WebApp){
try{Telegram.WebApp.close();}catch(e){window.history.back();}
}else{window.history.back();}
}

function renderTelegramProfile(){
if(!tgUser) return;
let name=tgUser.first_name||'User';
if(tgUser.last_name) name+=' '+tgUser.last_name;
document.getElementById('uName').textContent=name;
document.getElementById('av').textContent=name.trim()[0].toUpperCase();
document.getElementById('uId').textContent='ID: '+userId+' • @'+(tgUser.username||'-');
document.getElementById('uStatus').textContent='🔵 Terhubung sebagai '+(tgUser.username?'@'+tgUser.username:name);
}

function renderUser(d){
if(!d||!d.user) return;
cacheUser=d;
let u=d.user;
document.getElementById('uName').textContent=u.first_name||tgUser?.first_name||'User';
document.getElementById('av').textContent=(u.first_name||tgUser?.first_name||'W')[0].toUpperCase();
document.getElementById('uRank').textContent=u.rank.name+' '+u.rank.icon;
document.getElementById('uStatus').textContent=u.isPremium?'💎 VIP • '+u.premiumLeft+' hari lagi':'🎫 Gratis • Sisa '+u.dailyFix.remaining+'/3';
document.getElementById('uId').textContent='ID: '+u.id+' • Bergabung '+new Date(u.joinedAt).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
document.getElementById('uProg').style.width=Math.min(100,(u.dailyFix.used/3*100))+'%';
document.getElementById('uProgTxt').textContent='Terpakai '+u.dailyFix.used+'/3 hari ini • Total order '+u.totalFix;
document.getElementById('sTotal').innerHTML=u.totalFix+'<small>order</small>';
document.getElementById('sRef').innerHTML=u.referralCount+'<small>orang</small>';
let botName='walzystore_bot';
let link='https://t.me/'+botName+'?start='+u.id;
document.getElementById('refLink').textContent=link;
let pkgs=[{days:7,name:'Starter 7 Hari',desc:'Pemula • Hemat',price:'Rp 15K',pop:false},{days:30,name:'Pro 30 Hari',desc:'Terlaris • Hemat 40%',price:'Rp 45K',pop:true},{days:90,name:'Sultan 90 Hari',desc:'Power user • Best value',price:'Rp 99K',pop:false}];
let html=pkgs.map(p=>'<div class="pkg" onclick="buyPkg('+p.days+')"><div><div class="pkg-name">'+p.name+' '+(p.pop?'<span class="badge badge-orange" style="font-size:9px;margin-left:6px">🔥 POPULER</span>':'')+'</div><div class="pkg-desc">'+p.desc+'</div></div><div style="text-align:right"><div class="pkg-price">'+p.price+'</div><div style="font-size:10px;color:var(--blue);font-weight:700;margin-top:3px">BELI →</div></div></div>').join('');
document.getElementById('pkgHome').innerHTML=html;
document.getElementById('pkgOrder').innerHTML=html;
if(d.currentInvoice){
currentInvoice=d.currentInvoice.id;
document.getElementById('invoiceCard').style.display='block';
let inv=d.currentInvoice;
let st=inv.status==='waiting_approval'?'Menunggu ACC':inv.status==='waiting_payment'?'Menunggu Bayar':'Diproses';
document.getElementById('invStatus').textContent=st;
document.getElementById('invoiceBox').innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span class="invoice-id">'+inv.id+'</span><span class="badge badge-orange">'+inv.status+'</span></div><div style="font-size:12px;line-height:1.6"><div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Paket</span><b>'+inv.days+' Hari</b></div><div style="display:flex;justify-content:space-between;margin-top:4px"><span style="color:var(--muted)">Total</span><b style="color:var(--blue)">'+(inv.amountFormatted||'Rp '+inv.amount)+'</b></div></div>'+(inv.status!=='waiting_approval'?'<div style="margin-top:14px;position:relative"><button class="btn btn-primary">📤 Upload Bukti Transfer</button><input type="file" accept="image/*" onchange="uploadProof(event)" style="position:absolute;inset:0;opacity:0;cursor:pointer"></div><div id="upStat" style="margin-top:8px;font-size:11px;color:var(--muted);text-align:center"></div>':'<div style="margin-top:12px;padding:10px;background:var(--orange-light);border:1px solid #fcd34d;border-radius:11px;font-size:11px;text-align:center;font-weight:600;color:#92400e">⏳ Bukti terkirim - Menunggu ACC Owner</div>');
}else{document.getElementById('invoiceCard').style.display='none';}
if(d.invoices){
let tb=document.getElementById('hTable');
document.getElementById('hCount').textContent=d.invoices.length;
if(d.invoices.length===0) tb.innerHTML='<tr><td colspan="4" style="text-align:center;padding:22px"><div class="empty" style="padding:0"><div class="empty-icon">📭</div><div class="empty-title">Belum ada transaksi</div></div></td></tr>';
else tb.innerHTML=d.invoices.slice(0,20).map(inv=>'<tr><td><span class="invoice-id" style="font-size:10px;padding:3px 7px">'+inv.id.slice(-8)+'</span></td><td><b>'+inv.days+'H</b></td><td><span class="badge '+(inv.status==='paid'?'badge-green':inv.status==='rejected'?'badge-orange':'badge-blue')+'" style="font-size:9px">'+inv.status+'</span></td><td style="font-size:10px;color:var(--muted)">'+new Date(inv.createdAt).toLocaleDateString('id-ID')+'</td></tr>').join('');
}
let btn=document.getElementById('spinBtn');
if(u.canSpin){btn.disabled=false;btn.textContent='🎰 Putar Spin Harian';}
else{btn.disabled=true;btn.textContent='✅ Sudah Diklaim Hari Ini';}
}

function renderStats(d){
if(!d) return;
cacheStats=d;
isOwner=d.isOwner||false;
if(isOwner||ownerPass){
document.getElementById('navOwner').style.display='flex';
if(curView==='homeView'&&isOwner) document.getElementById('navOwner').classList.remove('active');
}
document.getElementById('oUsers').textContent=d.usersValid||0;
document.getElementById('oVip').textContent=d.premium||0;
document.getElementById('oToday').textContent=d.todayOrders||0;
document.getElementById('oRev').textContent=d.revenue?'Rp '+(d.revenue/1000).toFixed(0)+'K':'Rp 0';
if(curView==='ownerView'){
let activeTab=document.querySelector('#oTabs .tab.active');
let txt=activeTab?activeTab.textContent.toLowerCase():'pending';
if(txt.includes('pending')) renderPending(d);
else if(txt.includes('user')) renderUsers(d);
else if(txt.includes('vouch')) renderVoucherList(d);
}
}

function renderPending(d){
let list=d.pendingPayments||[];
if(list.length===0){document.getElementById('ownerContent').innerHTML='<div class="empty"><div class="empty-icon">✅</div><div class="empty-title">Semua Clear</div><div class="empty-desc">Tidak ada pembayaran pending</div></div>';return;}
document.getElementById('ownerContent').innerHTML=list.map(p=>'<div class="card" style="margin-bottom:10px"><div class="card-b"><div style="display:flex;justify-content:space-between;align-items:center"><div><div class="invoice-id">'+p.id+'</div><div style="font-size:11px;color:var(--muted);margin-top:5px">User '+p.userId+' • '+p.days+'H • Rp '+p.amount+'</div></div><span class="badge badge-orange">WAITING</span></div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-primary" style="flex:1" onclick="ownerAct(\\''+p.id+'\\',\\'approve\\')">✅ Setujui</button><button class="btn" style="flex:1" onclick="ownerAct(\\''+p.id+'\\',\\'reject\\')">❌ Tolak</button></div></div></div>').join('');
}
function renderUsers(d){
let users=d.recentUsers||[];
document.getElementById('ownerContent').innerHTML='<div style="overflow:auto"><table class="table"><thead><tr><th>User</th><th>Nama</th><th>Fix</th><th>Status</th></tr></thead><tbody>'+users.map(u=>'<tr><td class="mono" style="font-size:11px">'+u.id+'</td><td>'+(u.first_name||'User').substring(0,14)+'</td><td><b>'+(u.totalFix||0)+'</b></td><td><span class="badge '+(u.premiumUntil&&u.premiumUntil>Date.now()?'badge-vip':'badge-blue')+'" style="font-size:9px">'+(u.premiumUntil&&u.premiumUntil>Date.now()?'VIP':'FREE')+'</span></td></tr>').join('')+'</tbody></table></div>';
}
function renderVoucherList(d){
let codes=d.codes||[];
document.getElementById('voucherCard').style.display='block';
if(codes.length===0){document.getElementById('ownerContent').innerHTML='<div class="empty"><div class="empty-icon">🎟️</div><div class="empty-title">Belum ada voucher</div></div>';return;}
document.getElementById('ownerContent').innerHTML=codes.map(c=>'<div class="pkg"><div><div class="pkg-name mono">'+c.code+' • '+c.days+'H</div><div class="pkg-desc">Kuota '+(c.quota||'∞')+' • Pakai '+(c.used||0)+' • '+c.type+'</div></div><button class="btn btn-small" style="background:var(--red-light);color:var(--red);border-color:var(--red-light)" onclick="delVoucher(\\''+c.code+'\\')">Hapus</button></div>').join('');
}

async function loadUser(){
if(!userId) return;
try{
let data=await fetchJson('/api/user?user_id='+userId);
if(data.ok){renderUser(data);hideLoad();}
}catch(e){
let msg='Gagal memuat data';
if(e.message==='API_HTML'||e.message==='API_404') msg='API belum terhubung, cek deployment';
else if(e.message==='NETWORK') msg='Jaringan lambat';
else if(e.message==='JSON_PARSE') msg='Format data salah';
if(!cacheUser) showT('Koneksi',msg,'error');
hideLoad();
}
}

async function loadStats(){
if(!userId) return;
try{
let data=await fetchJson('/api/stats?user_id='+userId);
if(data.ok) renderStats(data);
}catch(e){}
}

async function loadOwner(){
try{
let data=await fetchJson('/api/stats?user_id='+userId);
if(data.ok) renderStats(data);
}catch(e){showT('Error','Gagal load owner','error');}
}

function loadHistory(){
if(cacheUser) renderUser(cacheUser);
else loadUser();
}

function switchOwnerTab(type,el){
document.querySelectorAll('#oTabs .tab').forEach(t=>t.classList.remove('active'));
el.classList.add('active');
if(type==='pending'){document.getElementById('voucherCard').style.display='none';if(cacheStats)renderPending(cacheStats);else loadOwner();}
else if(type==='users'){document.getElementById('voucherCard').style.display='none';if(cacheStats)renderUsers(cacheStats);else loadOwner();}
else if(type==='voucher'){if(cacheStats)renderVoucherList(cacheStats);else loadOwner();}
else if(type==='broadcast'){document.getElementById('voucherCard').style.display='none';document.getElementById('ownerContent').innerHTML='<div><div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:6px">PESAN BROADCAST</div><textarea id="bcText" class="input" style="min-height:90px;resize:none" placeholder="Tulis pesan untuk semua user..."></textarea><button class="btn btn-primary" style="margin-top:10px" onclick="sendBc()">📢 Kirim ke '+(cacheStats?.usersValid||0)+' User</button></div>';}
}

async function ownerAct(inv,act){
try{
let r=await fetchJson('/api/owner_action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,action:act,invoice:inv,password:ownerPass})});
showT(act==='approve'?'Disetujui':'Ditolak',r.message,act==='approve'?'success':'error');
loadOwner();
}catch(e){showT('Gagal',e.message,'error');}
}

async function createVoucher(){
let code=document.getElementById('vCode').value.trim().toUpperCase();
let days=parseInt(document.getElementById('vDays').value);
let quota=parseInt(document.getElementById('vQuota').value)||0;
let type=document.getElementById('vType').value;
if(!code||!days) return showT('Gagal','Isi kode dan hari','error');
try{
let r=await fetchJson('/api/create_code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,code,days,quota,type,password:ownerPass})});
if(r.ok){showT('Berhasil','Voucher '+code+' dibuat','success');document.getElementById('vCode').value='';document.getElementById('vDays').value='';document.getElementById('vQuota').value='';loadOwner();}
else showT('Gagal',r.message,'error');
}catch(e){showT('Error',e.message,'error');}
}

async function delVoucher(code){
if(!confirm('Hapus '+code+'?')) return;
try{
let r=await fetchJson('/api/delete_code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,code,password:ownerPass})});
if(r.ok){showT('Dihapus',code+' dihapus','success');loadOwner();}
else showT('Gagal',r.message,'error');
}catch(e){showT('Error',e.message,'error');}
}

async function sendBc(){
let text=document.getElementById('bcText').value.trim();
if(!text) return showT('Gagal','Isi pesan','error');
try{
let r=await fetchJson('/api/broadcast',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,text,password:ownerPass})});
showT('Terkirim','Ke '+r.sent+' user','success');
document.getElementById('bcText').value='';
}catch(e){showT('Gagal',e.message,'error');}
}

async function doSpin(){
let btn=document.getElementById('spinBtn');
btn.disabled=true;btn.textContent='Memutar...';
try{
let r=await fetchJson('/api/spin?user_id='+userId,{method:'POST'});
if(r.ok){showT('Menang!',r.reward.label,'success');loadUser();}
else{showT('Info',r.message,'error');btn.disabled=r.alreadySpun;btn.textContent=r.alreadySpun?'✅ Sudah Diklaim':'🎰 Putar';}
}catch(e){showT('Error',e.message,'error');btn.disabled=false;btn.textContent='🎰 Putar';}
}

async function buyPkg(days){
try{
let r=await fetchJson('/api/deposit?user_id='+userId+'&days='+days,{method:'POST'});
if(r.ok){
currentInvoice=r.invoice.id;
showView('orderView');
setTimeout(()=>{loadUser();},300);
showT('Invoice Dibuat',r.invoice.id,'success');
}else showT('Gagal',r.message,'error');
}catch(e){showT('Error',e.message,'error');}
}

function uploadProof(evt){
let file=evt.target.files[0];
if(!file||!currentInvoice) return;
if(file.size>5*1024*1024) return showT('Gagal','File max 5MB','error');
let stat=document.getElementById('upStat');
if(stat)stat.textContent='Mengompresi...';
let reader=new FileReader();
reader.onload=e=>{
let img=new Image();
img.onload=()=>{
let canvas=document.createElement('canvas');
let max=1024;let w=img.width,h=img.height;
if(w>h&&w>max){h=h*max/w;w=max;}else if(h>max){w=w*max/h;h=max;}
canvas.width=w;canvas.height=h;
canvas.getContext('2d').drawImage(img,0,0,w,h);
let b64=canvas.toDataURL('image/jpeg',0.72);
sendProof(b64,stat);
};
img.src=e.target.result;
};
reader.readAsDataURL(file);
}

async function sendProof(b64,el){
if(el)el.textContent='Mengunggah...';
try{
let r=await fetchJson('/api/upload_proof',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:userId,invoice:currentInvoice,image_base64:b64})});
if(r.ok){if(el)el.textContent='✅ Terkirim - Menunggu ACC';showT('Terkirim','Menunggu persetujuan','success');}
else{if(el)el.textContent='❌ '+r.message;showT('Gagal',r.message,'error');}
}catch(e){if(el)el.textContent='❌ '+e.message;showT('Error',e.message,'error');}
}

async function doRedeem(){
let code=document.getElementById('redeemInput').value.trim().toUpperCase();
if(!code) return showT('Gagal','Masukkan kode','error');
try{
let r=await fetchJson('/api/redeem?user_id='+userId+'&code='+code,{method:'POST'});
if(r.ok){showT('Berhasil','VIP aktif!','success');document.getElementById('redeemInput').value='';loadUser();}
else showT('Gagal',r.message,'error');
}catch(e){showT('Error',e.message,'error');}
}

function copyRef(){
let txt=document.getElementById('refLink').textContent||'';
if(!txt||txt.includes('Memuat')) return;
if(navigator.clipboard)navigator.clipboard.writeText(txt).then(()=>showT('Disalin','Link disalin','success'));
else{let ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();showT('Disalin','Link disalin','success');}
}

function openOwner(){
if(ownerPass){showView('ownerView');return;}
showView('ownerLoginView');
}

function unlockOwner(){
let p=document.getElementById('ownerPass').value.trim();
if(!p) return showT('Gagal','Isi password','error');
ownerPass=p;
sessionStorage.setItem('walzy_pass',p);
document.getElementById('navOwner').style.display='flex';
showView('ownerView');
showT('Berhasil','Dashboard owner dibuka','success');
loadOwner();
}

(function(){
let tg=window.Telegram&&window.Telegram.WebApp;
if(tg){
tg.ready();tg.expand();
try{tg.setHeaderColor('#f6f7fb');tg.setBackgroundColor('#f6f7fb');}catch(e){}
let u=tg.initDataUnsafe&&tg.initDataUnsafe.user;
if(u&&u.id){userId=String(u.id);tgUser=u;renderTelegramProfile();}
}
if(!userId){
let sp=new URLSearchParams(window.location.search);
userId=sp.get('user_id')||sp.get('userId')||null;
}
if(!userId){
document.getElementById('uName').textContent='Buka via Telegram';
document.getElementById('uStatus').textContent='Silakan buka webapp dari tombol di bot Telegram untuk data real';
hideLoad();
return;
}
renderTelegramProfile();
loadUser();
loadStats();
setInterval(()=>{let el=document.getElementById('time');if(el)el.textContent=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Jakarta'})+' WIB';},1000);
document.getElementById('ownerPass').addEventListener('keypress',e=>{if(e.key==='Enter')unlockOwner();});
let brand=document.getElementById('brandBtn');
if(brand){
brand.addEventListener('click',()=>{
let now=Date.now();
if(now-lastClick>3000) clickCount=0;
lastClick=now;
clickCount++;
if(clickCount>=5){
clickCount=0;
openOwner();
showT('Owner','Mode owner dibuka','success');
}
});
}
setTimeout(hideLoad,2500);
})();
</script>
</body>
</html>`);
};
