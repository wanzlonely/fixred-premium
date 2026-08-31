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
:root{--bg:#f6f7fb;--bg2:#eef1f8;--card:#ffffff;--card2:#fafbff;--border:#e7e9f3;--border2:#eef0f7;--text:#0f172a;--muted:#7c859c;--muted2:#a3acc2;--blue:#0a7cff;--blue2:#6a5cff;--blue-light:#eef4ff;--green:#10b981;--green-light:#dcfce7;--red:#ef4444;--red-light:#fee2e2;--orange:#f59e0b;--orange-light:#fef3c7;--shadow:0 8px 30px rgba(15,23,42,0.06);--shadow2:0 20px 60px rgba(15,23,42,0.12);--radius2:24px}
@media(prefers-color-scheme:dark){:root{--bg:#0b101f;--bg2:#11182f;--card:#151d32;--card2:#1c2640;--border:#1e2a4a;--border2:#1c2846;--text:#eef2ff;--muted:#8b9ab8;--muted2:#6b7ea1;--blue-light:#162a5a;--shadow:0 8px 30px rgba(0,0,0,0.3);--shadow2:0 20px 60px rgba(0,0,0,0.5)}}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:linear-gradient(180deg,var(--bg),var(--bg2));color:var(--text);min-height:100vh}
.mono{font-family:'JetBrains Mono',monospace}
.header{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.82);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 16px}
@media(prefers-color-scheme:dark){.header{background:rgba(21,29,50,0.86)}}
.brand{display:flex;align-items:center;gap:10px}
.brand-icon{width:40px;height:40px;border-radius:13px;background:linear-gradient(135deg,var(--blue),var(--blue2));display:grid;place-items:center;color:#fff;font-weight:800;font-size:17px;box-shadow:0 10px 24px rgba(10,124,255,0.32)}
.brand-text{font-weight:800;font-size:16px}
.brand-sub{font-size:10px;color:var(--muted);font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin-top:-2px}
.live{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--muted);font-weight:600;background:var(--card);border:1px solid var(--border);padding:5px 10px;border-radius:100px}
.live-dot{width:7px;height:7px;background:var(--green);border-radius:50%;animation:pulse 1.5s infinite}
.container{max-width:760px;margin:0 auto;padding:16px 12px 110px}
.view{display:none;animation:slideUp 0.35s both}
.view.active{display:block}
.card{background:var(--card);border-radius:var(--radius2);border:1px solid var(--border);box-shadow:var(--shadow);margin-bottom:12px;overflow:hidden}
.card-h{padding:14px 16px;border-bottom:1px solid var(--border2);display:flex;justify-content:space-between;align-items:center}
.card-t{font-size:11px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;gap:6px}
.card-t b{color:var(--text);text-transform:none;font-size:12px}
.card-b{padding:14px 16px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.avatar{width:60px;height:60px;border-radius:17px;background:linear-gradient(135deg,#e0e7ff,#dbeafe 60%,#bfdbfe);border:1px solid #c7d2fe;display:grid;place-items:center;font-weight:800;font-size:21px;color:var(--blue)}
.badge{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:100px;font-size:10px;font-weight:800;border:1px solid transparent}
.badge-blue{background:var(--blue-light);color:var(--blue)}
.badge-green{background:var(--green-light);color:#065f46}
.badge-orange{background:var(--orange-light);color:#92400e}
.badge-vip{background:linear-gradient(135deg,#fef3c7,#fde68a);color:#92400e;border-color:#fcd34d}
.stat{padding:13px;border-radius:18px;background:var(--card);border:1px solid var(--border)}
.stat-v{font-size:20px;font-weight:800;letter-spacing:-0.02em}
.stat-l{font-size:9px;color:var(--muted);text-transform:uppercase;margin-top:6px;font-weight:700;letter-spacing:0.06em}
.stat-icon{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;font-size:16px;margin-bottom:8px}
.btn{width:100%;padding:11px 14px;border-radius:12px;border:1px solid var(--border);background:var(--card);font-weight:700;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:all 0.18s}
.btn:active{transform:scale(0.98)}
.btn-primary{background:linear-gradient(135deg,var(--blue),var(--blue2));color:#fff;border:0;box-shadow:0 8px 20px rgba(10,124,255,0.28)}
.btn-ghost{background:transparent;border:1px dashed var(--border)}
.btn-small{padding:7px 12px;font-size:11px;width:auto;border-radius:100px}
.btn:disabled{opacity:0.5;pointer-events:none}
.input{width:100%;padding:11px 12px;border-radius:11px;border:1px solid var(--border);font-size:12px;outline:none;font-family:inherit;background:var(--card);color:var(--text)}
.input:focus{border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-light)}
.pkg{display:flex;justify-content:space-between;align-items:center;padding:13px 0;border-bottom:1px solid var(--border2);gap:10px}
.pkg:last-child{border-bottom:0}
.pkg-name{font-weight:700;font-size:12px}
.pkg-desc{font-size:10px;color:var(--muted);margin-top:2px}
.pkg-price{font-weight:800;font-size:13px}
.nav{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.9);backdrop-filter:blur(18px);border:1px solid var(--border);display:flex;gap:4px;padding:6px;border-radius:18px;box-shadow:0 16px 40px rgba(15,23,42,0.12);z-index:90;max-width:380px;width:calc(100% - 16px)}
@media(prefers-color-scheme:dark){.nav{background:rgba(21,29,50,0.9)}}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:12px;cursor:pointer;color:var(--muted);font-size:8px;font-weight:700;letter-spacing:0.03em;text-transform:uppercase}
.nav-item i{font-size:16px;font-style:normal}
.nav-item.active{background:linear-gradient(135deg,var(--text),#1e293b);color:#fff}
.table{width:100%;border-collapse:collapse;font-size:11px}
.table th{font-size:8px;color:var(--muted);text-align:left;padding:9px 10px;border-bottom:1px solid var(--border2);text-transform:uppercase;letter-spacing:0.06em;font-weight:700}
.table td{padding:9px 10px;border-bottom:1px solid var(--border2);font-weight:500}
.owner-tab{display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none}
.owner-tab::-webkit-scrollbar{display:none}
.tab{padding:7px 12px;border-radius:100px;background:var(--card);border:1px solid var(--border);font-size:10px;font-weight:700;white-space:nowrap;cursor:pointer;color:var(--muted)}
.tab.active{background:var(--text);color:#fff;border-color:var(--text)}
.toast{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.92);width:290px;background:var(--card);border:1px solid var(--border);border-radius:20px;box-shadow:var(--shadow2);padding:20px 18px;display:none;flex-direction:column;align-items:center;text-align:center;z-index:500;opacity:0;transition:all 0.32s cubic-bezier(0.34,1.56,0.64,1)}
.toast.show{display:flex;transform:translate(-50%,-50%) scale(1);opacity:1}
.toast-icon{width:56px;height:56px;border-radius:16px;display:grid;place-items:center;margin-bottom:12px;font-size:24px}
.invoice-id{font-family:'JetBrains Mono',monospace;font-weight:700;background:var(--bg2);padding:4px 8px;border-radius:7px;border:1px solid var(--border);display:inline-flex;font-size:10px}
.empty{padding:28px 16px;text-align:center;color:var(--muted)}
.empty-icon{width:60px;height:60px;margin:0 auto 10px;background:var(--bg2);border:1px solid var(--border);border-radius:16px;display:grid;place-items:center;font-size:26px}
.empty-title{font-weight:700;color:var(--text);margin-bottom:4px;font-size:12px}
.empty-desc{font-size:10px;line-height:1.4}
.progress{height:5px;background:var(--border);border-radius:100px;overflow:hidden}
.progress-bar{height:100%;background:linear-gradient(90deg,var(--blue),var(--blue2));border-radius:100px;transition:width 0.5s}
.loading{position:fixed;inset:0;background:var(--bg);z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;transition:opacity 0.4s}
.loading.hide{opacity:0;visibility:hidden;pointer-events:none}
.logo{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,var(--blue),var(--blue2));display:grid;place-items:center;color:#fff;font-weight:800;font-size:24px;animation:float 2s infinite;box-shadow:0 12px 24px rgba(10,124,255,0.3)}
.dots{display:flex;gap:5px}
.dots span{width:6px;height:6px;background:var(--blue);border-radius:50%;animation:dot 1.4s infinite}
.dots span:nth-child(2){animation-delay:0.2s}
.dots span:nth-child(3){animation-delay:0.4s}
@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.1)}100%{transform:scale(1)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes dot{0%,80%,100%{transform:scale(0.8);opacity:0.5}40%{transform:scale(1.1);opacity:1}}
</style>
</head>
<body>
<div class="loading" id="loading"><div class="logo">W</div><div style="text-align:center"><div style="font-weight:800;font-size:16px">walzy store</div><div style="font-size:10px;color:var(--muted);margin-top:3px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase" id="loadTxt">Memuat profil asli...</div></div><div class="dots"><span></span><span></span><span></span></div></div>

<div class="toast" id="toast"><div id="tIcon" class="toast-icon" style="background:var(--blue-light)">✅</div><div style="font-weight:800;font-size:13px" id="tTitle">Berhasil</div><div style="font-size:10px;color:var(--muted);margin-top:5px;line-height:1.4" id="tMsg">Ok</div><button class="btn btn-primary" style="margin-top:14px;width:auto;padding:8px 20px;border-radius:100px" onclick="hideT()">Tutup</button></div>

<div class="header"><div class="brand" id="brandBtn"><div class="brand-icon">W</div><div><div class="brand-text" id="headerTitle">walzy store</div><div class="brand-sub" id="headerSub">Realtime • Premium</div></div></div><div class="live"><span class="live-dot"></span><span id="time">--:--</span></div></div>

<div class="container">

<div id="userRoot" style="display:none">

<div id="uHome" class="view active">
<div class="card"><div class="card-b" style="display:flex;gap:12px;align-items:center"><div class="avatar" id="uAv">W</div><div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><div style="font-weight:800;font-size:14px" id="uName">Memuat...</div><span id="uRank" class="badge badge-vip">BASIC 🌱</span></div><div style="font-size:10px;color:var(--muted);margin-top:3px" id="uStatus">Menghubungkan Telegram...</div><div style="font-size:9px;color:var(--muted2);margin-top:3px" id="uId">ID: --</div><div style="margin-top:9px"><div class="progress"><div id="uProg" class="progress-bar" style="width:0%"></div></div><div style="font-size:8px;color:var(--muted);margin-top:4px;font-weight:600" id="uProgTxt">Memuat...</div></div></div></div></div>

<div class="grid-2"><div class="stat"><div class="stat-icon" style="background:var(--blue-light);color:var(--blue)">📦</div><div class="stat-v" id="sTotal">0</div><div class="stat-l">Total Order</div></div><div class="stat"><div class="stat-icon" style="background:var(--orange-light);color:#92400e">👥</div><div class="stat-v" id="sRef">0</div><div class="stat-l">Referral</div></div></div>

<div class="card"><div class="card-h"><div class="card-t"><span>🎰</span><b>Daily Spin</b></div><span class="badge badge-orange">Harian</span></div><div class="card-b"><button id="spinBtn" class="btn btn-primary" onclick="doSpin()">🎰 Putar Spin</button><div style="font-size:9px;color:var(--muted);margin-top:7px;text-align:center">Spin harian dapat bonus VIP & pesanan</div></div></div>

<div class="card"><div class="card-h"><div class="card-t"><span>💎</span><b>Paket Premium</b></div><span class="badge badge-blue">Terlaris</span></div><div class="card-b" id="pkgHome"></div></div>

<div class="grid-2"><div class="card"><div class="card-b"><div style="font-size:9px;font-weight:800;color:var(--muted);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px">🔗 Referral</div><div class="mono" id="refLink" style="font-size:9px;background:var(--bg2);border:1px solid var(--border);padding:8px;border-radius:10px;word-break:break-all;color:var(--muted);min-height:30px">Memuat...</div><button class="btn btn-small" style="margin-top:8px;width:100%" onclick="copyRef()">📋 Salin</button></div></div><div class="card"><div class="card-b"><div style="font-size:9px;font-weight:800;color:var(--muted);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px">🎟️ Redeem</div><input id="redeemInput" class="input mono" placeholder="KODE" style="text-transform:uppercase;text-align:center;font-weight:700"><button class="btn btn-primary btn-small" style="margin-top:8px;width:100%" onclick="doRedeem()">Tukar</button></div></div></div>
</div>

<div id="uOrder" class="view">
<div class="card"><div class="card-h"><div class="card-t"><span>💎</span><b>Pilih Paket</b></div></div><div class="card-b" id="pkgOrder"></div></div>
<div class="card" id="invoiceCard" style="display:none"><div class="card-h"><div class="card-t"><span>🧾</span><b>Invoice Aktif</b></div><span class="badge badge-orange" id="invStatus">Menunggu</span></div><div class="card-b"><div id="invoiceBox"></div></div></div>
</div>

<div id="uTrans" class="view">
<div class="card"><div class="card-h"><div class="card-t"><span>📜</span><b>Riwayat Transaksi</b></div><span class="badge badge-blue" id="hCount">0</span></div><div class="card-b" style="padding:0"><div style="overflow:auto"><table class="table"><thead><tr><th>Invoice</th><th>Paket</th><th>Status</th><th>Tgl</th></tr></thead><tbody id="hTable"><tr><td colspan="4" style="text-align:center;padding:18px;color:var(--muted)">Memuat...</td></tr></tbody></table></div></div></div>
<div class="card"><div class="card-h"><div class="card-t"><span>📊</span><b>Statistik Pribadi</b></div></div><div class="card-b"><div class="grid-2"><div class="stat"><div class="stat-v" id="stFix">0</div><div class="stat-l">Fix Berhasil</div></div><div class="stat"><div class="stat-v" id="stFail">0</div><div class="stat-l">Fix Gagal</div></div><div class="stat"><div class="stat-v" id="stRate">0%</div><div class="stat-l">Success Rate</div></div><div class="stat"><div class="stat-v" id="stDay">0/3</div><div class="stat-l">Hari Ini</div></div></div></div></div>
</div>

<div id="uProfil" class="view">
<div class="card"><div class="card-b" style="text-align:center;padding:20px"><div class="avatar" id="pAv" style="margin:0 auto">W</div><div style="font-weight:800;margin-top:10px" id="pName">--</div><div style="font-size:10px;color:var(--muted);margin-top:4px" id="pId">ID --</div><div style="margin-top:12px" id="pRank"></div></div></div>
<div class="card"><div class="card-h"><div class="card-t"><span>⚙️</span><b>Akun</b></div></div><div class="card-b"><div style="font-size:11px;line-height:1.7"><div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Status</span><b id="pStatus">--</b></div><div style="display:flex;justify-content:space-between;margin-top:6px"><span style="color:var(--muted)">Bergabung</span><span id="pJoin">--</span></div><div style="display:flex;justify-content:space-between;margin-top:6px"><span style="color:var(--muted)">Referral</span><span id="pRef">--</span></div></div></div></div>
<div class="card"><div class="card-b"><button class="btn btn-ghost" onclick="closeApp()">↩️ Tutup WebApp</button></div></div>
</div>

<div class="nav" id="uNav"><div class="nav-item active" data-view="uHome" onclick="showUserView('uHome')"><i>🏠</i><span>Home</span></div><div class="nav-item" data-view="uOrder" onclick="showUserView('uOrder')"><i>💎</i><span>Order</span></div><div class="nav-item" data-view="uTrans" onclick="showUserView('uTrans')"><i>📜</i><span>Riwayat</span></div><div class="nav-item" data-view="uProfil" onclick="showUserView('uProfil')"><i>👤</i><span>Profil</span></div></div>

</div>

<div id="ownerRoot" style="display:none">

<div id="oLogin" class="view active">
<div class="card" style="max-width:360px;margin:40px auto"><div style="height:4px;background:linear-gradient(90deg,var(--blue),var(--blue2))"></div><div class="card-b" style="text-align:center;padding:24px 18px"><div style="width:60px;height:60px;margin:0 auto 12px;background:linear-gradient(135deg,var(--text),#1e293b);border-radius:16px;display:grid;place-items:center;color:#fff;font-size:24px">🔒</div><div style="font-size:17px;font-weight:800">Owner Login</div><div style="font-size:10px;color:var(--muted);margin-top:5px;line-height:1.4">Hanya password SUPER777 yang valid<br>Sistem verifikasi server-side</div><input type="password" id="ownerPass" class="input" placeholder="Password Owner" style="margin-top:16px;text-align:center;letter-spacing:0.3em"><div id="oLoginErr" style="font-size:10px;color:var(--red);margin-top:8px;display:none"></div><button class="btn btn-primary" style="margin-top:12px" onclick="verifyOwner()">🔓 Masuk Dashboard</button><button class="btn btn-ghost" style="margin-top:8px" onclick="closeApp()">Kembali</button></div></div>
</div>

<div id="oDash" class="view">
<div class="grid-2" style="margin-bottom:10px"><div class="stat"><div class="stat-icon" style="background:var(--blue-light);color:var(--blue)">👥</div><div class="stat-v" id="oUsers">0</div><div class="stat-l">Valid User</div></div><div class="stat"><div class="stat-icon" style="background:var(--orange-light);color:#92400e">💎</div><div class="stat-v" id="oVip">0</div><div class="stat-l">VIP Member</div></div><div class="stat"><div class="stat-icon" style="background:var(--green-light);color:#065f46">📦</div><div class="stat-v" id="oToday">0</div><div class="stat-l">Order Hari Ini</div></div><div class="stat"><div class="stat-icon" style="background:var(--blue-light);color:var(--blue)">💰</div><div class="stat-v" id="oRev">0</div><div class="stat-l">Revenue</div></div></div>

<div class="card"><div class="card-h"><div class="card-t"><span>🎛️</span><b>Owner Studio • Pisah Total</b></div><span class="badge badge-blue">SECURE</span></div><div class="card-b"><div class="owner-tab"><div class="tab active" onclick="switchOTab('pending',this)">Pending</div><div class="tab" onclick="switchOTab('users',this)">Users</div><div class="tab" onclick="switchOTab('voucher',this)">Voucher</div><div class="tab" onclick="switchOTab('broadcast',this)">Broadcast</div><div class="tab" onclick="switchOTab('revenue',this)">Revenue</div></div><div id="oContent" style="margin-top:12px"></div></div></div>

<div class="card" id="vCard" style="display:none"><div class="card-h"><div class="card-t"><span>🎟️</span><b>Buat Voucher</b></div></div><div class="card-b"><div class="grid-2"><div><div style="font-size:9px;font-weight:700;color:var(--muted);margin-bottom:5px">KODE</div><input id="vCode" class="input mono" placeholder="WALZY30" style="text-transform:uppercase"></div><div><div style="font-size:9px;font-weight:700;color:var(--muted);margin-bottom:5px">HARI</div><input id="vDays" class="input" type="number" placeholder="30"></div></div><div class="grid-2" style="margin-top:8px"><div><div style="font-size:9px;font-weight:700;color:var(--muted);margin-bottom:5px">KUOTA 0=∞</div><input id="vQuota" class="input" type="number" placeholder="10"></div><div><div style="font-size:9px;font-weight:700;color:var(--muted);margin-bottom:5px">TIPE</div><select id="vType" class="input"><option value="public">Public</option><option value="private">Private</option></select></div></div><button class="btn btn-primary" style="margin-top:10px" onclick="createVoucher()">Buat Voucher</button></div></div>
</div>

<div class="nav" id="oNav"><div class="nav-item active" data-oview="oDash" onclick="showOwnerDash()"><i>📊</i><span>Dashboard</span></div><div class="nav-item" onclick="switchOTabFromNav('pending')"><i>📦</i><span>Pending</span></div><div class="nav-item" onclick="switchOTabFromNav('users')"><i>👥</i><span>Users</span></div><div class="nav-item" onclick="switchOTabFromNav('voucher')"><i>🎟️</i><span>Voucher</span></div><div class="nav-item" onclick="logoutOwner()"><i>🚪</i><span>Keluar</span></div></div>

</div>

</div>

<script>
let userId=null;
let tgUser=null;
let isOwner=false;
let ownerPass=sessionStorage.getItem('walzy_pass')||'';
let ownerVerified=sessionStorage.getItem('walzy_verified')==='true';
let curUserView='uHome';
let curOwnerTab='pending';
let currentInvoice=null;
let cacheUser=null;
let cacheStats=null;

function safeFetchJson(txt){
if(typeof txt!=='string') return txt;
if(txt.trim().startsWith('<') || txt.includes('<!DOCTYPE')) throw new Error('API_HTML');
return JSON.parse(txt);
}

async function fetchJson(url,opts){
opts=opts||{};
let r;
try{r=await fetch(url,opts);}catch(e){throw new Error('NETWORK');}
let txt=await r.text();
if(!r.ok){
try{let j=JSON.parse(txt);throw new Error(j.message||'SERVER_ERROR');}catch(e2){
if(txt.includes('<!DOCTYPE')||txt.trim().startsWith('<')) throw new Error('API_404');
throw new Error(e2.message||'SERVER_'+r.status);
}
}
if(txt.trim().startsWith('<')||txt.includes('<!DOCTYPE')) throw new Error('API_HTML');
try{return JSON.parse(txt);}catch(e){throw new Error('JSON_PARSE');}
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
setTimeout(hideT,3000);
}
function hideT(){document.getElementById('toast').classList.remove('show');}
function hideLoad(){let el=document.getElementById('loading');if(el)el.classList.add('hide');}
function closeApp(){if(window.Telegram&&Telegram.WebApp){try{Telegram.WebApp.close();}catch(e){window.history.back();}}else window.history.back();}

function renderTelegram(){
if(!tgUser) return;
let name=tgUser.first_name||'User';
if(tgUser.last_name) name+=' '+tgUser.last_name;
let ids=['uName','pName'];
ids.forEach(id=>{let el=document.getElementById(id);if(el)el.textContent=name;});
let avs=['uAv','pAv'];
avs.forEach(id=>{let el=document.getElementById(id);if(el)el.textContent=name.trim()[0].toUpperCase();});
let uidEl=document.getElementById('uId');
if(uidEl) uidEl.textContent='ID: '+userId+' • @'+(tgUser.username||'-');
let pId=document.getElementById('pId');
if(pId) pId.textContent='ID: '+userId+' • @'+(tgUser.username||'-');
}

function renderUser(d){
if(!d||!d.user) return;
cacheUser=d;
let u=d.user;
document.getElementById('uName').textContent=u.first_name||tgUser?.first_name||'User';
document.getElementById('pName').textContent=u.first_name||tgUser?.first_name||'User';
let av=document.getElementById('uAv'); if(av) av.textContent=(u.first_name||'W')[0].toUpperCase();
let av2=document.getElementById('pAv'); if(av2) av2.textContent=(u.first_name||'W')[0].toUpperCase();
document.getElementById('uRank').textContent=u.rank.name+' '+u.rank.icon;
document.getElementById('uStatus').textContent=u.isPremium?'💎 VIP • '+u.premiumLeft+' hari':'🎫 Gratis • Sisa '+u.dailyFix.remaining+'/3';
document.getElementById('uId').textContent='ID: '+u.id+' • Gabung '+new Date(u.joinedAt).toLocaleDateString('id-ID',{day:'2-digit',month:'short'});
document.getElementById('uProg').style.width=Math.min(100,(u.dailyFix.used/3*100))+'%';
document.getElementById('uProgTxt').textContent='Pakai '+u.dailyFix.used+'/3 • Total '+u.totalFix+' order';
document.getElementById('sTotal').textContent=u.totalFix;
document.getElementById('sRef').textContent=u.referralCount;
document.getElementById('stFix').textContent=d.global.totalSuccess||0;
document.getElementById('stFail').textContent=d.global.totalFailed||0;
let rate=d.global.totalFix?Math.round((d.global.totalSuccess/d.global.totalFix)*100):0;
document.getElementById('stRate').textContent=rate+'%';
document.getElementById('stDay').textContent=u.dailyFix.used+'/3';
document.getElementById('pStatus').textContent=u.isPremium?'VIP '+u.premiumLeft+' hari':'Gratis';
document.getElementById('pJoin').textContent=new Date(u.joinedAt).toLocaleDateString('id-ID');
document.getElementById('pRef').textContent=u.referralCount+' orang • '+u.rank.name;
document.getElementById('pRank').innerHTML='<span class="badge badge-vip">'+u.rank.name+' '+u.rank.icon+'</span> • '+u.totalFix+' order';
let botName='walzystore_bot';
let link='https://t.me/'+botName+'?start='+u.id;
let rl=document.getElementById('refLink'); if(rl) rl.textContent=link;
let pkgs=[{days:7,name:'Starter 7 Hari',desc:'Pemula • Hemat',price:'Rp 15K',pop:false},{days:30,name:'Pro 30 Hari',desc:'Terlaris • Hemat 40%',price:'Rp 45K',pop:true},{days:90,name:'Sultan 90 Hari',desc:'Power • Best value',price:'Rp 99K',pop:false}];
let html=pkgs.map(p=>'<div class="pkg" onclick="buyPkg('+p.days+')"><div><div class="pkg-name">'+p.name+' '+(p.pop?'<span class="badge badge-orange" style="font-size:8px;margin-left:5px">🔥 POPULER</span>':'')+'</div><div class="pkg-desc">'+p.desc+'</div></div><div style="text-align:right"><div class="pkg-price">'+p.price+'</div><div style="font-size:9px;color:var(--blue);font-weight:700;margin-top:2px">BELI →</div></div></div>').join('');
let ph=document.getElementById('pkgHome'); if(ph) ph.innerHTML=html;
let po=document.getElementById('pkgOrder'); if(po) po.innerHTML=html;
if(d.currentInvoice){
currentInvoice=d.currentInvoice.id;
let ic=document.getElementById('invoiceCard'); if(ic) ic.style.display='block';
let inv=d.currentInvoice;
let st=inv.status==='waiting_approval'?'Menunggu ACC':inv.status==='waiting_payment'?'Menunggu Bayar':'Diproses';
let iss=document.getElementById('invStatus'); if(iss) iss.textContent=st;
let ib=document.getElementById('invoiceBox');
if(ib) ib.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span class="invoice-id">'+inv.id+'</span><span class="badge badge-orange">'+inv.status+'</span></div><div style="font-size:11px;line-height:1.5"><div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Paket</span><b>'+inv.days+' Hari</b></div><div style="display:flex;justify-content:space-between;margin-top:3px"><span style="color:var(--muted)">Total</span><b style="color:var(--blue)">'+(inv.amountFormatted||'Rp '+inv.amount)+'</b></div></div>'+(inv.status!=='waiting_approval'?'<div style="margin-top:12px;position:relative"><button class="btn btn-primary">📤 Upload Bukti</button><input type="file" accept="image/*" onchange="uploadProof(event)" style="position:absolute;inset:0;opacity:0;cursor:pointer"></div><div id="upStat" style="margin-top:7px;font-size:10px;color:var(--muted);text-align:center"></div>':'<div style="margin-top:10px;padding:9px;background:var(--orange-light);border:1px solid #fcd34d;border-radius:10px;font-size:10px;text-align:center;font-weight:600;color:#92400e">⏳ Menunggu ACC Owner</div>');
}else{let ic=document.getElementById('invoiceCard'); if(ic) ic.style.display='none';}
if(d.invoices){
let tb=document.getElementById('hTable');
let hc=document.getElementById('hCount');
if(hc) hc.textContent=d.invoices.length;
if(tb){
if(d.invoices.length===0) tb.innerHTML='<tr><td colspan="4" style="text-align:center;padding:18px"><div class="empty" style="padding:0"><div class="empty-icon">📭</div><div class="empty-title">Belum ada transaksi</div></div></td></tr>';
else tb.innerHTML=d.invoices.slice(0,20).map(inv=>'<tr><td><span class="invoice-id" style="font-size:9px;padding:3px 6px">'+inv.id.slice(-8)+'</span></td><td><b>'+inv.days+'H</b></td><td><span class="badge '+(inv.status==='paid'?'badge-green':inv.status==='rejected'?'badge-orange':'badge-blue')+'" style="font-size:8px">'+inv.status+'</span></td><td style="font-size:9px;color:var(--muted)">'+new Date(inv.createdAt).toLocaleDateString('id-ID')+'</td></tr>').join('');
}
}
let btn=document.getElementById('spinBtn');
if(btn){
if(u.canSpin){btn.disabled=false;btn.textContent='🎰 Putar Spin Harian';}
else{btn.disabled=true;btn.textContent='✅ Sudah Diklaim';}
}
}

function renderStats(d){
if(!d) return;
cacheStats=d;
isOwner=d.isOwner||false;
if(isOwner){
document.getElementById('headerTitle').textContent='walzy owner';
document.getElementById('headerSub').textContent='SECURE • OWNER ONLY';
if(ownerVerified){
showOwnerRoot();
}else{
showOwnerLogin();
}
document.getElementById('oUsers').textContent=d.usersValid||0;
document.getElementById('oVip').textContent=d.premium||0;
document.getElementById('oToday').textContent=d.todayOrders||0;
document.getElementById('oRev').textContent=d.revenue?'Rp '+(d.revenue/1000).toFixed(0)+'K':'Rp 0';
if(curOwnerTab==='pending') renderPending(d);
else if(curOwnerTab==='users') renderUsers(d);
else if(curOwnerTab==='voucher') renderVoucherList(d);
else if(curOwnerTab==='broadcast') renderBroadcast(d);
else if(curOwnerTab==='revenue') renderRevenue(d);
}else{
document.getElementById('headerTitle').textContent='walzy store';
document.getElementById('headerSub').textContent='Realtime • Premium';
showUserRoot();
}
}

function showUserRoot(){
document.getElementById('userRoot').style.display='block';
document.getElementById('ownerRoot').style.display='none';
hideLoad();
}
function showOwnerRoot(){
document.getElementById('userRoot').style.display='none';
document.getElementById('ownerRoot').style.display='block';
document.getElementById('oLogin').classList.remove('active');
let dash=document.getElementById('oDash');
if(dash){dash.classList.add('active');}
hideLoad();
}
function showOwnerLogin(){
document.getElementById('userRoot').style.display='none';
document.getElementById('ownerRoot').style.display='block';
document.getElementById('oLogin').classList.add('active');
let dash=document.getElementById('oDash');
if(dash) dash.classList.remove('active');
hideLoad();
}

function showUserView(v){
document.querySelectorAll('#userRoot .view').forEach(x=>x.classList.remove('active'));
let t=document.getElementById(v);
if(t) t.classList.add('active');
document.querySelectorAll('#uNav .nav-item').forEach(n=>n.classList.remove('active'));
let nav=document.querySelector('#uNav .nav-item[data-view="'+v+'"]');
if(nav) nav.classList.add('active');
curUserView=v;
window.scrollTo({top:0,behavior:'smooth'});
}

function showOwnerDash(){
document.querySelectorAll('#ownerRoot .view').forEach(x=>x.classList.remove('active'));
let dash=document.getElementById('oDash');
if(dash) dash.classList.add('active');
document.querySelectorAll('#oNav .nav-item').forEach(n=>n.classList.remove('active'));
let first=document.querySelector('#oNav .nav-item');
if(first) first.classList.add('active');
curOwnerTab='pending';
switchOTab('pending',document.querySelector('.owner-tab .tab'));
}

function switchOTab(type,el){
curOwnerTab=type;
document.querySelectorAll('.owner-tab .tab').forEach(t=>t.classList.remove('active'));
if(el) el.classList.add('active');
if(type==='pending'){document.getElementById('vCard').style.display='none';if(cacheStats) renderPending(cacheStats); else loadStats();}
else if(type==='users'){document.getElementById('vCard').style.display='none';if(cacheStats) renderUsers(cacheStats); else loadStats();}
else if(type==='voucher'){if(cacheStats) renderVoucherList(cacheStats); else loadStats();}
else if(type==='broadcast'){document.getElementById('vCard').style.display='none';renderBroadcast(cacheStats);}
else if(type==='revenue'){document.getElementById('vCard').style.display='none';renderRevenue(cacheStats);}
}

function switchOTabFromNav(type){
showOwnerDash();
setTimeout(()=>{
let tabs=document.querySelectorAll('.owner-tab .tab');
let map={pending:0,users:1,voucher:2,broadcast:3,revenue:4};
let idx=map[type]||0;
if(tabs[idx]) switchOTab(type,tabs[idx]);
},50);
}

function renderPending(d){
let list=(d&&d.pendingPayments)||[];
let c=document.getElementById('oContent');
if(!c) return;
if(list.length===0){c.innerHTML='<div class="empty"><div class="empty-icon">✅</div><div class="empty-title">Semua Clear</div><div class="empty-desc">Tidak ada pending</div></div>';return;}
c.innerHTML=list.map(p=>'<div class="card" style="margin-bottom:8px"><div class="card-b"><div style="display:flex;justify-content:space-between;align-items:center"><div><div class="invoice-id">'+p.id+'</div><div style="font-size:10px;color:var(--muted);margin-top:4px">User '+p.userId+' • '+p.days+'H • Rp '+p.amount+'</div></div><span class="badge badge-orange">WAIT</span></div><div style="display:flex;gap:6px;margin-top:10px"><button class="btn btn-primary" style="flex:1" onclick="ownerAct(\\''+p.id+'\\',\\'approve\\')">✅ ACC</button><button class="btn" style="flex:1" onclick="ownerAct(\\''+p.id+'\\',\\'reject\\')">❌ Tolak</button></div></div></div>').join('');
}
function renderUsers(d){
let users=(d&&d.recentUsers)||[];
let c=document.getElementById('oContent');
if(!c) return;
c.innerHTML='<div style="overflow:auto"><table class="table"><thead><tr><th>User</th><th>Nama</th><th>Fix</th><th>Status</th></tr></thead><tbody>'+users.map(u=>'<tr><td class="mono" style="font-size:10px">'+u.id+'</td><td>'+(u.first_name||'User').substring(0,12)+'</td><td><b>'+(u.totalFix||0)+'</b></td><td><span class="badge '+(u.premiumUntil&&u.premiumUntil>Date.now()?'badge-vip':'badge-blue')+'" style="font-size:8px">'+(u.premiumUntil&&u.premiumUntil>Date.now()?'VIP':'FREE')+'</span></td></tr>').join('')+'</tbody></table></div>';
}
function renderVoucherList(d){
let codes=(d&&d.codes)||[];
let c=document.getElementById('oContent');
if(!c) return;
document.getElementById('vCard').style.display='block';
if(codes.length===0){c.innerHTML='<div class="empty"><div class="empty-icon">🎟️</div><div class="empty-title">Belum ada voucher</div></div>';return;}
c.innerHTML=codes.map(cc=>'<div class="pkg"><div><div class="pkg-name mono">'+cc.code+' • '+cc.days+'H</div><div class="pkg-desc">Kuota '+(cc.quota||'∞')+' • Pakai '+(cc.used||0)+' • '+cc.type+'</div></div><button class="btn btn-small" style="background:var(--red-light);color:var(--red)" onclick="delVoucher(\\''+cc.code+'\\')">Hapus</button></div>').join('');
}
function renderBroadcast(d){
let c=document.getElementById('oContent');
if(!c) return;
let count=(d&&d.usersValid)||0;
c.innerHTML='<div><div style="font-size:9px;font-weight:700;color:var(--muted);margin-bottom:5px">PESAN BROADCAST KE '+count+' USER</div><textarea id="bcText" class="input" style="min-height:90px;resize:none" placeholder="Tulis pesan broadcast..."></textarea><button class="btn btn-primary" style="margin-top:8px" onclick="sendBc()">📢 Kirim Broadcast</button><div style="font-size:9px;color:var(--muted);margin-top:6px">Hanya SUPER777 yang bisa kirim, server-side verified</div></div>';
}
function renderRevenue(d){
let c=document.getElementById('oContent');
if(!c) return;
let rev=(d&&d.revenue)||0;
let history=(d&&d.paidPayments)||[];
c.innerHTML='<div class="stat" style="margin-bottom:10px"><div class="stat-v">Rp '+rev.toLocaleString('id-ID')+'</div><div class="stat-l">Total Revenue</div></div><div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:6px">TRANSAKSI TERAKHIR</div><div style="overflow:auto"><table class="table"><thead><tr><th>Invoice</th><th>User</th><th>Amount</th></tr></thead><tbody>'+history.slice(0,15).map(p=>'<tr><td><span class="invoice-id" style="font-size:9px">'+p.id.slice(-6)+'</span></td><td>'+p.userId+'</td><td>Rp '+p.amount+'</td></tr>').join('')+'</tbody></table></div>';
}

async function verifyOwner(){
let pass=document.getElementById('ownerPass').value.trim();
let errEl=document.getElementById('oLoginErr');
if(!pass){errEl.style.display='block';errEl.textContent='Isi password';return;}
errEl.style.display='none';
try{
let r=await fetchJson('/api/verify_owner',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,password:pass})});
if(r.ok){
ownerPass=pass;
ownerVerified=true;
sessionStorage.setItem('walzy_pass',pass);
sessionStorage.setItem('walzy_verified','true');
showT('Berhasil','Owner verified','success');
showOwnerRoot();
loadStats();
}else{
errEl.style.display='block';
errEl.textContent=r.message||'Password salah';
showT('Gagal',r.message||'Password salah','error');
}
}catch(e){
errEl.style.display='block';
errEl.textContent=e.message==='API_HTML'?'API error':e.message;
showT('Gagal',e.message,'error');
}
}

function logoutOwner(){
sessionStorage.removeItem('walzy_pass');
sessionStorage.removeItem('walzy_verified');
ownerPass='';
ownerVerified=false;
showT('Keluar','Logout owner','success');
setTimeout(()=>{location.reload();},800);
}

async function loadUser(){
if(!userId) return;
try{
let data=await fetchJson('/api/user?user_id='+userId);
if(data.ok){renderUser(data);}
}catch(e){
if(!cacheUser) showT('Error','Gagal load user: '+e.message,'error');
}
}

async function loadStats(){
if(!userId) return;
try{
let data=await fetchJson('/api/stats?user_id='+userId);
if(data.ok){renderStats(data);}
}catch(e){
showT('Error','Gagal load stats','error');
}
}

async function ownerAct(inv,act){
try{
let r=await fetchJson('/api/owner_action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,action:act,invoice:inv,password:ownerPass})});
showT(act==='approve'?'ACC':'Tolak',r.message,act==='approve'?'success':'error');
loadStats();
}catch(e){showT('Gagal',e.message,'error');}
}

async function createVoucher(){
let code=document.getElementById('vCode').value.trim().toUpperCase();
let days=parseInt(document.getElementById('vDays').value);
let quota=parseInt(document.getElementById('vQuota').value)||0;
let type=document.getElementById('vType').value;
if(!code||!days) return showT('Gagal','Isi kode & hari','error');
try{
let r=await fetchJson('/api/create_code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,code,days,quota,type,password:ownerPass})});
if(r.ok){showT('Berhasil','Voucher '+code,'success');document.getElementById('vCode').value='';document.getElementById('vDays').value='';document.getElementById('vQuota').value='';loadStats();}
else showT('Gagal',r.message,'error');
}catch(e){showT('Error',e.message,'error');}
}

async function delVoucher(code){
if(!confirm('Hapus '+code+'?')) return;
try{
let r=await fetchJson('/api/delete_code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,code,password:ownerPass})});
if(r.ok){showT('Hapus',code,'success');loadStats();}
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
if(btn){btn.disabled=true;btn.textContent='Memutar...';}
try{
let r=await fetchJson('/api/spin?user_id='+userId,{method:'POST'});
if(r.ok){showT('Menang!',r.reward.label,'success');loadUser();}
else{showT('Info',r.message,'error');if(btn){btn.disabled=r.alreadySpun;btn.textContent=r.alreadySpun?'✅ Sudah':'🎰 Putar';}}
}catch(e){showT('Error',e.message,'error');if(btn){btn.disabled=false;btn.textContent='🎰 Putar';}}
}

async function buyPkg(days){
try{
let r=await fetchJson('/api/deposit?user_id='+userId+'&days='+days,{method:'POST'});
if(r.ok){
currentInvoice=r.invoice.id;
showUserView('uOrder');
setTimeout(()=>loadUser(),400);
showT('Invoice',r.invoice.id,'success');
}else showT('Gagal',r.message,'error');
}catch(e){showT('Error',e.message,'error');}
}

function uploadProof(evt){
let file=evt.target.files[0];
if(!file||!currentInvoice) return;
if(file.size>5*1024*1024) return showT('Gagal','Max 5MB','error');
let stat=document.getElementById('upStat');
if(stat) stat.textContent='Compress...';
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
if(el) el.textContent='Upload...';
try{
let r=await fetchJson('/api/upload_proof',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:userId,invoice:currentInvoice,image_base64:b64})});
if(r.ok){if(el) el.textContent='✅ Terkirim';showT('Terkirim','Menunggu ACC','success');}
else{if(el) el.textContent='❌ '+r.message;showT('Gagal',r.message,'error');}
}catch(e){if(el) el.textContent='❌ '+e.message;showT('Error',e.message,'error');}
}

async function doRedeem(){
let code=document.getElementById('redeemInput').value.trim().toUpperCase();
if(!code) return showT('Gagal','Masukkan kode','error');
try{
let r=await fetchJson('/api/redeem?user_id='+userId+'&code='+code,{method:'POST'});
if(r.ok){showT('Berhasil','VIP aktif','success');document.getElementById('redeemInput').value='';loadUser();}
else showT('Gagal',r.message,'error');
}catch(e){showT('Error',e.message,'error');}
}

function copyRef(){
let txt=document.getElementById('refLink').textContent||'';
if(!txt||txt.includes('Memuat')) return;
if(navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>showT('Disalin','Link disalin','success'));
else{let ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();showT('Disalin','Link','success');}
}

(function(){
let tg=window.Telegram&&window.Telegram.WebApp;
if(tg){
tg.ready();tg.expand();
try{tg.setHeaderColor('#f6f7fb');tg.setBackgroundColor('#f6f7fb');}catch(e){}
let u=tg.initDataUnsafe&&tg.initDataUnsafe.user;
if(u&&u.id){userId=String(u.id);tgUser=u;renderTelegram();}
}
if(!userId){
let sp=new URLSearchParams(window.location.search);
userId=sp.get('user_id')||sp.get('userId')||null;
}
if(!userId){
document.getElementById('loadTxt').textContent='Buka via Telegram';
document.getElementById('uName').textContent='Buka via Telegram Bot';
document.getElementById('uStatus').textContent='Silakan buka dari tombol di bot untuk data real';
hideLoad();
return;
}
renderTelegram();
loadUser();
loadStats();
setInterval(()=>{let el=document.getElementById('time');if(el) el.textContent=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Jakarta'})+' WIB';},1000);
let passEl=document.getElementById('ownerPass');
if(passEl) passEl.addEventListener('keypress',e=>{if(e.key==='Enter') verifyOwner();});
setTimeout(hideLoad,2500);
})();
</script>
</body>
</html>`);
};
