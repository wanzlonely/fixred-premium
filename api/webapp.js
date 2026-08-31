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
:root{--bg:#f6f7fb;--bg2:#eef1f8;--card:#ffffff;--card2:#fafbff;--border:#e7e9f3;--border2:#eef0f7;--text:#0f172a;--muted:#7c859c;--muted2:#a3acc2;--blue:#0a7cff;--blue2:#6a5cff;--blue-light:#eef4ff;--green:#10b981;--green-light:#dcfce7;--red:#ef4444;--red-light:#fee2e2;--orange:#f59e0b;--orange-light:#fef3c7;--purple:#8b5cf6;--purple-light:#ede9fe;--shadow:0 8px 30px rgba(15,23,42,0.06);--shadow2:0 20px 60px rgba(15,23,42,0.12);--r:22px;--r2:28px}
@media(prefers-color-scheme:dark){:root{--bg:#0b101f;--bg2:#11182f;--card:#151d32;--card2:#1c2640;--border:#1e2a4a;--border2:#1c2846;--text:#eef2ff;--muted:#8b9ab8;--muted2:#6b7ea1;--blue-light:#162a5a;--purple-light:#1e1a4a;--shadow:0 8px 30px rgba(0,0,0,0.3);--shadow2:0 20px 60px rgba(0,0,0,0.5)}}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:linear-gradient(180deg,var(--bg),var(--bg2));color:var(--text);min-height:100vh}
.mono{font-family:'JetBrains Mono',monospace}
.header{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.84);backdrop-filter:blur(22px);border-bottom:1px solid var(--border);height:62px;display:flex;align-items:center;justify-content:space-between;padding:0 16px}
@media(prefers-color-scheme:dark){.header{background:rgba(21,29,50,0.88)}}
.brand{display:flex;align-items:center;gap:10px}
.brand-icon{width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,var(--blue),var(--blue2));display:grid;place-items:center;color:#fff;font-weight:800;font-size:16px;box-shadow:0 8px 20px rgba(10,124,255,0.32)}
.brand-text{font-weight:800;font-size:15px;letter-spacing:-0.02em}
.brand-sub{font-size:9px;color:var(--muted);font-weight:700;letter-spacing:0.07em;text-transform:uppercase;margin-top:-2px}
.live{display:flex;align-items:center;gap:6px;font-size:10px;color:var(--muted);font-weight:700;background:var(--card);border:1px solid var(--border);padding:5px 10px;border-radius:100px}
.live-dot{width:7px;height:7px;background:var(--green);border-radius:50%;animation:pulse 1.5s infinite}
.container{max-width:780px;margin:0 auto;padding:14px 12px 110px}
.view{display:none;animation:pageIn 0.38s cubic-bezier(0.16,1,0.3,1) both}
.view.active{display:block}
@keyframes pageIn{from{opacity:0;transform:translateY(18px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}
.card{background:var(--card);border-radius:var(--r2);border:1px solid var(--border);box-shadow:var(--shadow);margin-bottom:12px;overflow:hidden;position:relative}
.card-h{padding:14px 16px;border-bottom:1px solid var(--border2);display:flex;justify-content:space-between;align-items:center}
.card-t{font-size:10px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;gap:6px}
.card-t b{color:var(--text);text-transform:none;font-size:12px;letter-spacing:-0.01em}
.card-b{padding:14px 16px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.hero{background:linear-gradient(135deg,var(--card) 0%,var(--card2) 100%);border:1px solid var(--border);border-radius:var(--r2);padding:18px;position:relative;overflow:hidden;box-shadow:var(--shadow);margin-bottom:12px}
.hero::before{content:'';position:absolute;top:-40%;right:-20%;width:260px;height:260px;background:radial-gradient(circle,rgba(10,124,255,0.12),transparent 70%);pointer-events:none}
.hero-top{display:flex;gap:14px;align-items:center;position:relative}
.avatar{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);border:2px solid #fff;box-shadow:0 8px 24px rgba(10,124,255,0.22),0 0 0 4px rgba(10,124,255,0.08);display:grid;place-items:center;font-weight:800;font-size:22px;color:var(--blue);flex-shrink:0}
@media(prefers-color-scheme:dark){.avatar{background:linear-gradient(135deg,#1e2a5a,#2a3f7a);border-color:#1e2a4a;color:#93c5fd}}
.badge{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:100px;font-size:10px;font-weight:800;border:1px solid transparent;letter-spacing:0.01em}
.badge-blue{background:var(--blue-light);color:var(--blue)}
.badge-vip{background:linear-gradient(135deg,#fef3c7,#fde68a);color:#92400e;border-color:#fcd34d;box-shadow:0 2px 8px rgba(245,158,11,0.18)}
.badge-green{background:var(--green-light);color:#065f46}
.badge-orange{background:var(--orange-light);color:#92400e}
.badge-purple{background:var(--purple-light);color:var(--purple)}
.stat-premium{background:var(--card);border-radius:20px;border:1px solid var(--border);padding:14px;position:relative;overflow:hidden;box-shadow:var(--shadow)}
.stat-premium::after{content:'';position:absolute;top:0;right:0;width:80px;height:80px;background:radial-gradient(circle at top right,rgba(10,124,255,0.08),transparent 60%);pointer-events:none}
.stat-icon2{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;font-size:18px;margin-bottom:10px;box-shadow:0 4px 12px rgba(0,0,0,0.06)}
.stat-v2{font-size:22px;font-weight:800;letter-spacing:-0.03em;line-height:1}
.stat-v2 small{font-size:11px;font-weight:600;color:var(--muted);margin-left:3px}
.stat-l2{font-size:9px;color:var(--muted);text-transform:uppercase;margin-top:6px;font-weight:700;letter-spacing:0.06em}
.progress-premium{height:6px;background:var(--border);border-radius:100px;overflow:hidden;position:relative;margin-top:10px}
.progress-bar-premium{height:100%;background:linear-gradient(90deg,var(--blue),var(--blue2),var(--purple));border-radius:100px;transition:width 0.8s cubic-bezier(0.16,1,0.3,1);position:relative;overflow:hidden}
.progress-bar-premium::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);animation:shimmer 1.8s infinite}
@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
.btn{width:100%;padding:12px 14px;border-radius:13px;border:1px solid var(--border);background:var(--card);font-weight:700;font-size:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:all 0.18s;letter-spacing:-0.01em}
.btn:active{transform:scale(0.97)}
.btn-primary{background:linear-gradient(135deg,var(--blue),var(--blue2));color:#fff;border:0;box-shadow:0 10px 24px rgba(10,124,255,0.28)}
.btn-ghost{background:transparent;border:1px dashed var(--border);color:var(--muted)}
.btn-small{padding:7px 13px;font-size:10px;width:auto;border-radius:100px;font-weight:700}
.btn:disabled{opacity:0.5;pointer-events:none}
.input{width:100%;padding:11px 12px;border-radius:12px;border:1px solid var(--border);font-size:12px;outline:none;font-family:inherit;background:var(--card);color:var(--text);font-weight:500;transition:all 0.18s}
.input:focus{border-color:var(--blue);box-shadow:0 0 0 4px var(--blue-light)}
.pkg-premium{display:flex;justify-content:space-between;align-items:center;padding:16px;border-radius:18px;background:var(--card);border:1px solid var(--border);margin-bottom:10px;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden}
.pkg-premium:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(15,23,42,0.08);border-color:var(--blue)}
.pkg-premium.popular{border-color:#fcd34d;background:linear-gradient(135deg,var(--card),#fffbeb);box-shadow:0 8px 24px rgba(245,158,11,0.12)}
@media(prefers-color-scheme:dark){.pkg-premium.popular{background:linear-gradient(135deg,var(--card),#2a2410)}}
.pkg-left{display:flex;gap:12px;align-items:center}
.pkg-icon{width:44px;height:44px;border-radius:13px;display:grid;place-items:center;font-size:20px;flex-shrink:0}
.pkg-name{font-weight:800;font-size:13px;letter-spacing:-0.01em}
.pkg-desc{font-size:10px;color:var(--muted);margin-top:3px;font-weight:500}
.pkg-price{font-weight:800;font-size:14px;text-align:right}
.pkg-action{font-size:10px;color:var(--blue);font-weight:800;margin-top:3px}
.nav{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.92);backdrop-filter:blur(22px);border:1px solid var(--border);display:flex;gap:4px;padding:6px;border-radius:20px;box-shadow:0 18px 44px rgba(15,23,42,0.14);z-index:90;max-width:400px;width:calc(100% - 16px);transition:all 0.3s}
.nav.hidden{transform:translateX(-50%) translateY(120px);opacity:0;pointer-events:none}
@media(prefers-color-scheme:dark){.nav{background:rgba(21,29,50,0.92)}}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 4px;border-radius:13px;cursor:pointer;color:var(--muted);font-size:8px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;transition:all 0.2s}
.nav-item i{font-size:17px;font-style:normal;transition:transform 0.2s}
.nav-item.active{background:linear-gradient(135deg,var(--text),#1e293b);color:#fff;box-shadow:0 8px 20px rgba(15,23,42,0.18)}
.nav-item.active i{transform:scale(1.1)}
@media(prefers-color-scheme:dark){.nav-item.active{background:linear-gradient(135deg,var(--blue),var(--blue2))}}
.table{width:100%;border-collapse:collapse;font-size:11px}
.table th{font-size:8px;color:var(--muted);text-align:left;padding:10px;border-bottom:1px solid var(--border2);text-transform:uppercase;letter-spacing:0.07em;font-weight:800}
.table td{padding:10px;border-bottom:1px solid var(--border2);font-weight:500}
.owner-tab{display:flex;gap:6px;overflow-x:auto;padding-bottom:8px;scrollbar-width:none}
.owner-tab::-webkit-scrollbar{display:none}
.tab{padding:8px 13px;border-radius:100px;background:var(--card);border:1px solid var(--border);font-size:10px;font-weight:800;white-space:nowrap;cursor:pointer;color:var(--muted);transition:all 0.18s}
.tab.active{background:var(--text);color:#fff;border-color:var(--text);box-shadow:0 6px 16px rgba(15,23,42,0.12)}
.toast{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.92);width:300px;background:var(--card);border:1px solid var(--border);border-radius:22px;box-shadow:0 24px 64px rgba(15,23,42,0.18);padding:22px 18px;display:none;flex-direction:column;align-items:center;text-align:center;z-index:500;opacity:0;transition:all 0.36s cubic-bezier(0.34,1.56,0.64,1)}
.toast.show{display:flex;transform:translate(-50%,-50%) scale(1);opacity:1}
.toast-icon{width:60px;height:60px;border-radius:18px;display:grid;place-items:center;margin-bottom:12px;font-size:26px}
.invoice-id{font-family:'JetBrains Mono',monospace;font-weight:700;background:var(--bg2);padding:5px 9px;border-radius:8px;border:1px solid var(--border);display:inline-flex;font-size:10px}
.empty{padding:32px 16px;text-align:center;color:var(--muted)}
.empty-icon{width:64px;height:64px;margin:0 auto 12px;background:linear-gradient(135deg,var(--bg2),var(--card));border:1px solid var(--border);border-radius:18px;display:grid;place-items:center;font-size:28px;box-shadow:var(--shadow)}
.empty-title{font-weight:800;color:var(--text);margin-bottom:5px;font-size:13px}
.empty-desc{font-size:10px;line-height:1.5}
.loading{position:fixed;inset:0;background:var(--bg);z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;transition:opacity 0.4s}
.loading.hide{opacity:0;visibility:hidden;pointer-events:none}
.logo{width:60px;height:60px;border-radius:18px;background:linear-gradient(135deg,var(--blue),var(--blue2));display:grid;place-items:center;color:#fff;font-weight:800;font-size:26px;animation:float 2s ease-in-out infinite;box-shadow:0 14px 28px rgba(10,124,255,0.32)}
.dots{display:flex;gap:5px}
.dots span{width:7px;height:7px;background:var(--blue);border-radius:50%;animation:dot 1.4s infinite}
.dots span:nth-child(2){animation-delay:0.2s}
.dots span:nth-child(3){animation-delay:0.4s}
.page-header{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.page-header h1{font-size:18px;font-weight:800;letter-spacing:-0.02em}
.page-header p{font-size:10px;color:var(--muted);margin-top:2px;font-weight:500}
.back-btn{width:40px;height:40px;border-radius:12px;background:var(--card);border:1px solid var(--border);display:grid;place-items:center;cursor:pointer;box-shadow:var(--shadow);transition:all 0.18s}
.back-btn:active{transform:scale(0.95)}
.login-full{position:fixed;inset:0;z-index:200;background:linear-gradient(180deg,var(--bg),var(--bg2));display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px}
.login-card{width:100%;max-width:340px;background:var(--card);border:1px solid var(--border);border-radius:28px;box-shadow:0 24px 64px rgba(15,23,42,0.12);overflow:hidden;animation:pageIn 0.5s both}
.login-top{height:4px;background:linear-gradient(90deg,var(--blue),var(--blue2),var(--purple))}
@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.08)}100%{transform:scale(1)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes dot{0%,80%,100%{transform:scale(0.8);opacity:0.5}40%{transform:scale(1.15);opacity:1}}
</style>
</head>
<body>
<div class="loading" id="loading"><div class="logo">W</div><div style="text-align:center"><div style="font-weight:800;font-size:17px">walzy store</div><div style="font-size:10px;color:var(--muted);margin-top:4px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase" id="loadTxt">Memuat profil asli...</div></div><div class="dots"><span></span><span></span><span></span></div></div>

<div class="toast" id="toast"><div id="tIcon" class="toast-icon" style="background:var(--blue-light)">✅</div><div style="font-weight:800;font-size:14px" id="tTitle">Berhasil</div><div style="font-size:11px;color:var(--muted);margin-top:6px;line-height:1.5" id="tMsg">Ok</div><button class="btn btn-primary" style="margin-top:16px;width:auto;padding:9px 22px;border-radius:100px" onclick="hideT()">Tutup</button></div>

<div class="header" id="mainHeader"><div class="brand"><div class="brand-icon">W</div><div><div class="brand-text" id="headerTitle">walzy store</div><div class="brand-sub" id="headerSub">Realtime • Premium</div></div></div><div class="live"><span class="live-dot"></span><span id="time">--:--</span></div></div>

<div class="container">

<div id="userRoot" style="display:none">

<div id="uHome" class="view active">
<div class="hero"><div class="hero-top"><div class="avatar" id="uAv">W</div><div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><div style="font-weight:800;font-size:16px;letter-spacing:-0.02em" id="uName">Memuat...</div><span id="uRank" class="badge badge-vip">BASIC 🌱</span></div><div style="font-size:11px;color:var(--muted);margin-top:5px;font-weight:500" id="uStatus">Menghubungkan Telegram...</div><div style="font-size:10px;color:var(--muted2);margin-top:3px;font-weight:600" id="uId">ID: --</div></div></div><div style="margin-top:16px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><span style="font-size:10px;font-weight:700;color:var(--muted);letter-spacing:0.05em;text-transform:uppercase">Daily Usage</span><span style="font-size:10px;font-weight:700;color:var(--blue)" id="uProgLabel">0/3</span></div><div class="progress-premium"><div id="uProg" class="progress-bar-premium" style="width:0%"></div></div><div style="font-size:10px;color:var(--muted);margin-top:7px;font-weight:500" id="uProgTxt">Memuat data order...</div></div></div>

<div class="grid-2"><div class="stat-premium"><div class="stat-icon2" style="background:linear-gradient(135deg,var(--blue-light),#dbeafe);color:var(--blue)">📦</div><div class="stat-v2" id="sTotal">0<small>order</small></div><div class="stat-l2">Total Order</div></div><div class="stat-premium"><div class="stat-icon2" style="background:linear-gradient(135deg,var(--orange-light),#fef3c7);color:#92400e">👥</div><div class="stat-v2" id="sRef">0<small>orang</small></div><div class="stat-l2">Referral</div></div></div>

<div class="card"><div class="card-h"><div class="card-t"><span>🎰</span><b>Daily Spin & Reward</b></div><span class="badge badge-orange">Harian</span></div><div class="card-b"><button id="spinBtn" class="btn btn-primary" onclick="doSpin()" style="padding:13px;font-size:13px">🎰 Putar Spin Harian</button><div style="font-size:10px;color:var(--muted);margin-top:8px;text-align:center;font-weight:500">Reset setiap 00:00 WIB • Bonus VIP & pesanan</div></div></div>

<div class="card"><div class="card-h"><div class="card-t"><span>💎</span><b>Paket Premium</b></div><span class="badge badge-blue">Best Price</span></div><div class="card-b" id="pkgHome" style="padding:8px 14px"></div><div style="padding:0 14px 14px"><button class="btn btn-ghost" onclick="showUserView('uOrder')">Lihat Semua Paket →</button></div></div>

<div class="grid-2"><div class="card"><div class="card-b"><div style="font-size:9px;font-weight:800;color:var(--muted);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:5px">🔗 Referral Link</div><div class="mono" id="refLink" style="font-size:10px;background:var(--bg2);border:1px solid var(--border);padding:10px;border-radius:12px;word-break:break-all;color:var(--muted);min-height:36px">Memuat...</div><button class="btn btn-small" style="margin-top:10px;width:100%;padding:9px" onclick="copyRef()">📋 Salin Link</button></div></div><div class="card"><div class="card-b"><div style="font-size:9px;font-weight:800;color:var(--muted);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:10px">🎟️ Redeem Voucher</div><input id="redeemInput" class="input mono" placeholder="KODEVOUCHER" style="text-transform:uppercase;text-align:center;font-weight:700;letter-spacing:0.05em"><button class="btn btn-primary btn-small" style="margin-top:10px;width:100%;padding:9px" onclick="doRedeem()">🎫 Tukar Voucher</button></div></div></div>
</div>

<div id="uOrder" class="view">
<div class="page-header"><div class="back-btn" onclick="showUserView('uHome')">←</div><div><h1>Pilih Paket</h1><p>Upgrade VIP untuk unlimited fix</p></div></div>
<div id="pkgOrder"></div>
<div class="card" id="invoiceCard" style="display:none;margin-top:12px"><div class="card-h"><div class="card-t"><span>🧾</span><b>Invoice Aktif</b></div><span class="badge badge-orange" id="invStatus">Menunggu</span></div><div class="card-b"><div id="invoiceBox"></div></div></div>
</div>

<div id="uTrans" class="view">
<div class="page-header"><div class="back-btn" onclick="showUserView('uHome')">←</div><div><h1>Riwayat Transaksi</h1><p>Semua pembayaran & order kamu</p></div></div>
<div class="card"><div class="card-b" style="padding:0"><div style="overflow:auto"><table class="table"><thead><tr><th>Invoice</th><th>Paket</th><th>Status</th><th>Tanggal</th></tr></thead><tbody id="hTable"><tr><td colspan="4" style="text-align:center;padding:22px;color:var(--muted)">Memuat riwayat...</td></tr></tbody></table></div></div></div>
<div class="grid-2"><div class="stat-premium"><div class="stat-v2" id="stFix">0</div><div class="stat-l2">Fix Sukses</div></div><div class="stat-premium"><div class="stat-v2" id="stRate">0%</div><div class="stat-l2">Success Rate</div></div><div class="stat-premium"><div class="stat-v2" id="stDay">0/3</div><div class="stat-l2">Hari Ini</div></div><div class="stat-premium"><div class="stat-v2" id="stTotal2">0</div><div class="stat-l2">Total Order</div></div></div>
</div>

<div id="uProfil" class="view">
<div class="page-header"><div class="back-btn" onclick="showUserView('uHome')">←</div><div><h1>Profil</h1><p>Kelola akun kamu</p></div></div>
<div class="hero" style="text-align:center"><div class="avatar" id="pAv" style="margin:0 auto;width:72px;height:72px;font-size:26px">W</div><div style="font-weight:800;font-size:18px;margin-top:12px" id="pName">--</div><div style="font-size:11px;color:var(--muted);margin-top:4px" id="pId">ID --</div><div style="margin-top:12px" id="pRank"></div></div>
<div class="card"><div class="card-h"><div class="card-t"><span>⚙️</span><b>Detail Akun</b></div></div><div class="card-b"><div style="font-size:12px;line-height:1.8"><div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Status</span><b id="pStatus">--</b></div><div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Bergabung</span><span id="pJoin">--</span></div><div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Referral</span><span id="pRef">--</span></div><div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Total Fix</span><span id="pFix">--</span></div></div></div></div>
<div class="card"><div class="card-b"><button class="btn btn-ghost" onclick="closeApp()">↩️ Tutup WebApp</button></div></div>
</div>

<div class="nav" id="uNav"><div class="nav-item active" data-view="uHome" onclick="showUserView('uHome')"><i>🏠</i><span>Home</span></div><div class="nav-item" data-view="uOrder" onclick="showUserView('uOrder')"><i>💎</i><span>Order</span></div><div class="nav-item" data-view="uTrans" onclick="showUserView('uTrans')"><i>📜</i><span>Riwayat</span></div><div class="nav-item" data-view="uProfil" onclick="showUserView('uProfil')"><i>👤</i><span>Profil</span></div></div>

</div>

<div id="ownerRoot" style="display:none">

<div id="oLogin" class="view">
<div class="login-full" id="loginFull"><div class="login-card"><div class="login-top"></div><div style="padding:28px 22px;text-align:center"><div style="width:64px;height:64px;margin:0 auto 14px;background:linear-gradient(135deg,var(--text),#1e293b);border-radius:18px;display:grid;place-items:center;color:#fff;font-size:26px;box-shadow:0 12px 24px rgba(15,23,42,0.18)">🔒</div><div style="font-size:18px;font-weight:800;letter-spacing:-0.02em">Owner Access</div><div style="height:32px"></div><input type="password" id="ownerPass" class="input" placeholder="••••••••" style="text-align:center;font-size:18px;letter-spacing:0.4em;padding:14px"><div id="oLoginErr" style="font-size:11px;color:var(--red);margin-top:10px;display:none;font-weight:600"></div><button class="btn btn-primary" style="margin-top:16px;padding:14px;font-size:13px" onclick="verifyOwner()">Masuk</button></div></div></div>
</div>

<div id="oDash" class="view">
<div class="page-header"><div><h1>Owner Studio</h1><p>Dark Pro • Full Control via WebApp</p></div><div class="back-btn" onclick="logoutOwner()" style="width:auto;padding:0 14px;font-size:11px;font-weight:700">Keluar</div></div>
<div class="grid-2"><div class="stat-premium"><div class="stat-icon2" style="background:linear-gradient(135deg,var(--blue-light),#dbeafe);color:var(--blue)">👥</div><div class="stat-v2" id="oUsers">0</div><div class="stat-l2">Valid User</div></div><div class="stat-premium"><div class="stat-icon2" style="background:linear-gradient(135deg,#fef3c7,#fde68a);color:#92400e">💎</div><div class="stat-v2" id="oVip">0</div><div class="stat-l2">VIP Member</div></div><div class="stat-premium"><div class="stat-icon2" style="background:linear-gradient(135deg,var(--green-light),#dcfce7);color:#065f46">📦</div><div class="stat-v2" id="oToday">0</div><div class="stat-l2">Order Hari Ini</div></div><div class="stat-premium"><div class="stat-icon2" style="background:linear-gradient(135deg,var(--purple-light),#ede9fe);color:var(--purple)">💰</div><div class="stat-v2" id="oRev">0</div><div class="stat-l2">Revenue</div></div></div>
<div class="grid-2" style="margin-top:12px"><div class="pkg-premium" style="flex-direction:column;align-items:flex-start;gap:8px;padding:16px" onclick="openOwnerPage('pending')"><div class="stat-icon2" style="background:var(--orange-light);color:#92400e">📦</div><div><div class="pkg-name">Pending ACC</div><div class="pkg-desc" id="oPendingCount">0 menunggu</div></div></div><div class="pkg-premium" style="flex-direction:column;align-items:flex-start;gap:8px;padding:16px" onclick="openOwnerPage('users')"><div class="stat-icon2" style="background:var(--blue-light);color:var(--blue)">👥</div><div><div class="pkg-name">Kelola Users</div><div class="pkg-desc" id="oUsersCount">0 pengguna</div></div></div><div class="pkg-premium" style="flex-direction:column;align-items:flex-start;gap:8px;padding:16px" onclick="openOwnerPage('voucher')"><div class="stat-icon2" style="background:var(--purple-light);color:var(--purple)">🎟️</div><div><div class="pkg-name">Voucher</div><div class="pkg-desc">Buat & kelola kode</div></div></div><div class="pkg-premium" style="flex-direction:column;align-items:flex-start;gap:8px;padding:16px" onclick="openOwnerPage('broadcast')"><div class="stat-icon2" style="background:var(--green-light);color:#065f46">📢</div><div><div class="pkg-name">Broadcast</div><div class="pkg-desc">Siaran ke semua user</div></div></div></div>
<div class="card" style="margin-top:12px"><div class="card-h"><div class="card-t"><span>💰</span><b>Revenue Terbaru</b></div></div><div class="card-b" style="padding:0"><div style="overflow:auto"><table class="table"><thead><tr><th>Invoice</th><th>User</th><th>Jumlah</th></tr></thead><tbody id="oRevTable"><tr><td colspan="3" style="text-align:center;padding:16px;color:var(--muted)">Memuat...</td></tr></tbody></table></div></div></div>
</div>

<div id="oPending" class="view">
<div class="page-header"><div class="back-btn" onclick="openOwnerPage('dash')">←</div><div><h1>Pending ACC</h1><p>Invoice menunggu persetujuan</p></div></div>
<div id="oPendingList"></div>
</div>

<div id="oUsers" class="view">
<div class="page-header"><div class="back-btn" onclick="openOwnerPage('dash')">←</div><div><h1>Kelola Users</h1><p id="oUsersSub">0 pengguna valid</p></div></div>
<div class="card"><div class="card-b" style="padding:0"><div style="overflow:auto"><table class="table"><thead><tr><th>ID</th><th>Nama</th><th>Order</th><th>Status</th></tr></thead><tbody id="oUsersTable"></tbody></table></div></div></div>
</div>

<div id="oVoucher" class="view">
<div class="page-header"><div class="back-btn" onclick="openOwnerPage('dash')">←</div><div><h1>Voucher</h1><p>Buat kode redeem premium</p></div></div>
<div class="card"><div class="card-h"><div class="card-t"><span>🎟️</span><b>Buat Voucher Baru</b></div></div><div class="card-b"><div class="grid-2"><div><div style="font-size:9px;font-weight:700;color:var(--muted);margin-bottom:6px;letter-spacing:0.05em">KODE VOUCHER</div><input id="vCode" class="input mono" placeholder="WALZY30" style="text-transform:uppercase;font-weight:700"></div><div><div style="font-size:9px;font-weight:700;color:var(--muted);margin-bottom:6px">DURASI HARI</div><input id="vDays" class="input" type="number" placeholder="30"></div></div><div class="grid-2" style="margin-top:10px"><div><div style="font-size:9px;font-weight:700;color:var(--muted);margin-bottom:6px">KUOTA (0=∞)</div><input id="vQuota" class="input" type="number" placeholder="10"></div><div><div style="font-size:9px;font-weight:700;color:var(--muted);margin-bottom:6px">TIPE</div><select id="vType" class="input"><option value="public">Public - Banyak pakai</option><option value="private">Private - Sekali pakai</option></select></div></div><button class="btn btn-primary" style="margin-top:14px;padding:12px" onclick="createVoucher()">✨ Buat Voucher</button></div></div>
<div class="card"><div class="card-h"><div class="card-t"><span>📋</span><b>Daftar Voucher</b></div><span class="badge badge-blue" id="vCount">0</span></div><div class="card-b" id="oVoucherList"></div></div>
</div>

<div id="oBroadcast" class="view">
<div class="page-header"><div class="back-btn" onclick="openOwnerPage('dash')">←</div><div><h1>Broadcast</h1><p>Kirim siaran ke semua user</p></div></div>
<div class="card"><div class="card-b"><div style="font-size:10px;font-weight:700;color:var(--muted);letter-spacing:0.05em;margin-bottom:8px">PESAN BROADCAST</div><textarea id="bcText" class="input" style="min-height:120px;resize:none;line-height:1.5" placeholder="Tulis pesan yang akan dikirim ke semua pengguna..."></textarea><div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><span style="font-size:10px;color:var(--muted)" id="bcCount">0 / 1000 karakter • 0 user</span><span class="badge badge-orange">Secure</span></div><button class="btn btn-primary" style="margin-top:12px;padding:12px" onclick="sendBc()">📢 Kirim Broadcast Sekarang</button></div></div>
</div>

<div class="nav" id="oNav"><div class="nav-item active" onclick="openOwnerPage('dash')"><i>📊</i><span>Dashboard</span></div><div class="nav-item" onclick="openOwnerPage('pending')"><i>📦</i><span>Pending</span></div><div class="nav-item" onclick="openOwnerPage('users')"><i>👥</i><span>Users</span></div><div class="nav-item" onclick="openOwnerPage('voucher')"><i>🎟️</i><span>Voucher</span></div><div class="nav-item" onclick="openOwnerPage('broadcast')"><i>📢</i><span>Broadcast</span></div></div>

</div>

</div>

<script>
let userId=null;
let tgUser=null;
let isOwner=false;
let ownerPass=sessionStorage.getItem('walzy_pass')||'';
let ownerVerified=sessionStorage.getItem('walzy_verified')==='true';
let curUserView='uHome';
let currentInvoice=null;
let cacheUser=null;
let cacheStats=null;

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
function hideAllNav(){document.querySelectorAll('.nav').forEach(n=>n.classList.add('hidden'));document.getElementById('mainHeader').style.display='none';}
function showNavForUser(){document.getElementById('mainHeader').style.display='flex';document.getElementById('uNav').classList.remove('hidden');document.getElementById('oNav').classList.add('hidden');}
function showNavForOwner(){document.getElementById('mainHeader').style.display='flex';document.getElementById('oNav').classList.remove('hidden');document.getElementById('uNav').classList.add('hidden');}

function renderTelegram(){
if(!tgUser) return;
let name=tgUser.first_name||'User';
if(tgUser.last_name) name+=' '+tgUser.last_name;
let els=['uName','pName'];
els.forEach(id=>{let el=document.getElementById(id);if(el)el.textContent=name;});
let avs=['uAv','pAv'];
avs.forEach(id=>{let el=document.getElementById(id);if(el)el.textContent=name.trim()[0].toUpperCase();});
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
document.getElementById('uStatus').textContent=u.isPremium?'💎 VIP • '+u.premiumLeft+' hari lagi':'🎫 Gratis • Sisa '+u.dailyFix.remaining+'/3 hari ini';
document.getElementById('uId').textContent='ID: '+u.id+' • Bergabung '+new Date(u.joinedAt).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});
document.getElementById('uProg').style.width=Math.min(100,(u.dailyFix.used/3*100))+'%';
document.getElementById('uProgLabel').textContent=u.dailyFix.used+'/3';
document.getElementById('uProgTxt').textContent='Terpakai '+u.dailyFix.used+' dari 3 • Total order '+u.totalFix;
document.getElementById('sTotal').innerHTML=u.totalFix+'<small>order</small>';
document.getElementById('sRef').innerHTML=u.referralCount+'<small>orang</small>';
document.getElementById('stFix').textContent=d.global.totalSuccess||0;
document.getElementById('stRate').textContent=(d.global.totalFix?Math.round((d.global.totalSuccess/d.global.totalFix)*100):0)+'%';
document.getElementById('stDay').textContent=u.dailyFix.used+'/3';
document.getElementById('stTotal2').textContent=u.totalFix;
document.getElementById('pStatus').textContent=u.isPremium?'VIP '+u.premiumLeft+' hari':'Gratis '+u.dailyFix.remaining+'/3';
document.getElementById('pJoin').textContent=new Date(u.joinedAt).toLocaleDateString('id-ID');
document.getElementById('pRef').textContent=u.referralCount+' orang • '+u.rank.name;
document.getElementById('pFix').textContent=u.totalFix+' order';
document.getElementById('pRank').innerHTML='<span class="badge badge-vip">'+u.rank.name+' '+u.rank.icon+'</span> <span style="font-size:11px;color:var(--muted)">• '+u.totalFix+' order</span>';
let botName='walzystore_bot';
let link='https://t.me/'+botName+'?start='+u.id;
let rl=document.getElementById('refLink'); if(rl) rl.textContent=link;
let pkgs=[{days:7,name:'Starter',full:'Starter 7 Hari',desc:'Pemula • Hemat',price:'Rp 15K',priceNum:15000,icon:'🌱',color:'var(--blue-light)',iconBg:'linear-gradient(135deg,#dbeafe,#bfdbfe)',pop:false,feat:['Unlimited Fix','Support 24/7','Reset harian']},{days:30,name:'Pro',full:'Pro 30 Hari',desc:'Terlaris • Hemat 40%',price:'Rp 45K',priceNum:45000,icon:'🔥',color:'var(--orange-light)',iconBg:'linear-gradient(135deg,#fef3c7,#fde68a)',pop:true,feat:['Unlimited Fix','Bonus Spin','Prioritas','Hemat 40%']},{days:90,name:'Sultan',full:'Sultan 90 Hari',desc:'Power • Best Value',price:'Rp 99K',priceNum:99000,icon:'👑',color:'var(--purple-light)',iconBg:'linear-gradient(135deg,#ede9fe,#ddd6fe)',pop:false,feat:['Semua fitur','Prioritas tertinggi','Support VIP','Best value']}];
let htmlHome=pkgs.slice(0,2).map(p=>'<div class="pkg-premium '+(p.pop?'popular':'')+'" onclick="buyPkg('+p.days+')"><div class="pkg-left"><div class="pkg-icon" style="background:'+p.iconBg+'">'+p.icon+'</div><div><div class="pkg-name">'+p.full+' '+(p.pop?'<span class="badge badge-orange" style="font-size:8px;margin-left:5px">🔥 POPULER</span>':'')+'</div><div class="pkg-desc">'+p.desc+'</div></div></div><div style="text-align:right"><div class="pkg-price">'+p.price+'</div><div class="pkg-action">BELI →</div></div></div>').join('');
let htmlOrder=pkgs.map(p=>'<div class="pkg-premium '+(p.pop?'popular':'')+'" onclick="buyPkg('+p.days+')"><div class="pkg-left"><div class="pkg-icon" style="background:'+p.iconBg+'">'+p.icon+'</div><div><div class="pkg-name">'+p.full+'</div><div class="pkg-desc">'+p.feat.join(' • ')+'</div></div></div><div style="text-align:right"><div class="pkg-price">'+p.price+'</div><div class="pkg-action">BELI →</div></div></div>').join('');
let ph=document.getElementById('pkgHome'); if(ph) ph.innerHTML=htmlHome;
let po=document.getElementById('pkgOrder'); if(po) po.innerHTML=htmlOrder;
if(d.currentInvoice){
currentInvoice=d.currentInvoice.id;
let ic=document.getElementById('invoiceCard'); if(ic) ic.style.display='block';
let inv=d.currentInvoice;
let st=inv.status==='waiting_approval'?'Menunggu ACC':inv.status==='waiting_payment'?'Menunggu Bayar':'Diproses';
let iss=document.getElementById('invStatus'); if(iss) iss.textContent=st;
let ib=document.getElementById('invoiceBox');
if(ib) ib.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span class="invoice-id">'+inv.id+'</span><span class="badge badge-orange">'+inv.status+'</span></div><div style="font-size:11px;line-height:1.6"><div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Paket</span><b>'+inv.days+' Hari</b></div><div style="display:flex;justify-content:space-between;margin-top:4px"><span style="color:var(--muted)">Total</span><b style="color:var(--blue)">'+(inv.amountFormatted||'Rp '+inv.amount)+'</b></div><div style="margin-top:8px;padding:8px;background:var(--bg2);border-radius:10px;font-size:10px;color:var(--muted)">Bayar ke DANA 083124469855 a.n WALZY STORE, lalu upload bukti</div></div>'+(inv.status!=='waiting_approval'?'<div style="margin-top:12px;position:relative"><button class="btn btn-primary">📤 Upload Bukti Transfer</button><input type="file" accept="image/*" onchange="uploadProof(event)" style="position:absolute;inset:0;opacity:0;cursor:pointer"></div><div id="upStat" style="margin-top:8px;font-size:10px;color:var(--muted);text-align:center"></div>':'<div style="margin-top:12px;padding:10px;background:var(--orange-light);border:1px solid #fcd34d;border-radius:12px;font-size:11px;text-align:center;font-weight:600;color:#92400e">⏳ Bukti terkirim • Menunggu ACC Owner</div>');
}else{let ic=document.getElementById('invoiceCard'); if(ic) ic.style.display='none';}
if(d.invoices){
let tb=document.getElementById('hTable');
if(tb){
if(d.invoices.length===0) tb.innerHTML='<tr><td colspan="4" style="text-align:center;padding:24px"><div class="empty" style="padding:0"><div class="empty-icon">📭</div><div class="empty-title">Belum ada transaksi</div><div class="empty-desc">Order paket untuk mulai</div></div></td></tr>';
else tb.innerHTML=d.invoices.slice(0,20).map(inv=>'<tr><td><span class="invoice-id" style="font-size:9px;padding:4px 7px">'+inv.id.slice(-8)+'</span></td><td><b>'+inv.days+'H</b></td><td><span class="badge '+(inv.status==='paid'?'badge-green':inv.status==='rejected'?'badge-orange':'badge-blue')+'" style="font-size:8px">'+inv.status+'</span></td><td style="font-size:10px;color:var(--muted)">'+new Date(inv.createdAt).toLocaleDateString('id-ID')+'</td></tr>').join('');
}
}
let btn=document.getElementById('spinBtn');
if(btn){
if(u.canSpin){btn.disabled=false;btn.textContent='🎰 Putar Spin Harian • Menang VIP';}
else{btn.disabled=true;btn.textContent='✅ Sudah Diklaim Hari Ini';}
}
}

function renderStats(d){
if(!d) return;
cacheStats=d;
isOwner=d.isOwner||false;
if(isOwner){
document.getElementById('headerTitle').textContent='walzy owner';
document.getElementById('headerSub').textContent='SECURE • DARK PRO';
if(ownerVerified){
showOwnerRoot();
document.getElementById('oUsers').textContent=d.usersValid||0;
document.getElementById('oVip').textContent=d.premium||0;
document.getElementById('oToday').textContent=d.todayOrders||0;
document.getElementById('oRev').textContent=d.revenue?'Rp '+(d.revenue/1000).toFixed(0)+'K':'Rp 0';
document.getElementById('oPendingCount').textContent=(d.pendingPayments?.length||0)+' menunggu ACC';
document.getElementById('oUsersCount').textContent=(d.usersValid||0)+' pengguna valid';
let revTable=document.getElementById('oRevTable');
if(revTable){
if((d.paidPayments||[]).length===0) revTable.innerHTML='<tr><td colspan="3" style="text-align:center;padding:14px;color:var(--muted)">Belum ada revenue</td></tr>';
else revTable.innerHTML=d.paidPayments.slice(0,6).map(p=>'<tr><td><span class="invoice-id" style="font-size:9px">'+p.id.slice(-6)+'</span></td><td style="font-size:10px">'+p.userId+'</td><td style="font-weight:700">Rp '+p.amount+'</td></tr>').join('');
}
let bc=document.getElementById('bcCount');
if(bc) bc.textContent='0 / 1000 karakter • '+(d.usersValid||0)+' user';
}else{
showOwnerLogin();
}
}else{
document.getElementById('headerTitle').textContent='walzy store';
document.getElementById('headerSub').textContent='Realtime • Premium';
showUserRoot();
}
}

function showUserRoot(){
document.getElementById('userRoot').style.display='block';
document.getElementById('ownerRoot').style.display='none';
document.getElementById('oLogin').classList.remove('active');
showNavForUser();
hideLoad();
}
function showOwnerRoot(){
document.getElementById('userRoot').style.display='none';
document.getElementById('ownerRoot').style.display='block';
document.getElementById('oLogin').classList.remove('active');
document.getElementById('oDash').classList.add('active');
document.getElementById('oPending').classList.remove('active');
document.getElementById('oUsers').classList.remove('active');
document.getElementById('oVoucher').classList.remove('active');
document.getElementById('oBroadcast').classList.remove('active');
showNavForOwner();
hideLoad();
}
function showOwnerLogin(){
document.getElementById('userRoot').style.display='none';
document.getElementById('ownerRoot').style.display='block';
document.getElementById('oLogin').classList.add('active');
document.getElementById('oDash').classList.remove('active');
document.getElementById('oPending').classList.remove('active');
document.getElementById('oUsers').classList.remove('active');
document.getElementById('oVoucher').classList.remove('active');
document.getElementById('oBroadcast').classList.remove('active');
hideAllNav();
hideLoad();
}

function showUserView(v){
document.querySelectorAll('#userRoot .view').forEach(x=>x.classList.remove('active'));
let t=document.getElementById(v);
if(t) t.classList.add('active');
document.querySelectorAll('#uNav .nav-item').forEach(n=>n.classList.remove('active'));
let nav=document.querySelector('#uNav .nav-item[data-view="'+v+'"]');
if(nav) nav.classList.add('active');
if(window.Telegram&&Telegram.WebApp&&Telegram.WebApp.HapticFeedback){try{Telegram.WebApp.HapticFeedback.impactOccurred('light');}catch(e){}}
window.scrollTo({top:0,behavior:'smooth'});
}

function openOwnerPage(page){
document.querySelectorAll('#ownerRoot .view').forEach(x=>x.classList.remove('active'));
if(page==='dash'){document.getElementById('oDash').classList.add('active');}
else if(page==='pending'){document.getElementById('oPending').classList.add('active');renderPendingPage();}
else if(page==='users'){document.getElementById('oUsers').classList.add('active');renderUsersPage();}
else if(page==='voucher'){document.getElementById('oVoucher').classList.add('active');renderVoucherPage();}
else if(page==='broadcast'){document.getElementById('oBroadcast').classList.add('active');}
document.querySelectorAll('#oNav .nav-item').forEach(n=>n.classList.remove('active'));
let map={dash:0,pending:1,users:2,voucher:3,broadcast:4};
let idx=map[page]||0;
let navs=document.querySelectorAll('#oNav .nav-item');
if(navs[idx]) navs[idx].classList.add('active');
window.scrollTo({top:0,behavior:'smooth'});
}

function renderPendingPage(){
if(!cacheStats) {loadStats();return;}
let list=cacheStats.pendingPayments||[];
let el=document.getElementById('oPendingList');
if(!el) return;
if(list.length===0){el.innerHTML='<div class="card"><div class="empty"><div class="empty-icon">✅</div><div class="empty-title">Semua Clear</div><div class="empty-desc">Tidak ada invoice pending</div></div></div>';return;}
el.innerHTML=list.map(p=>'<div class="card" style="margin-bottom:10px"><div class="card-b"><div style="display:flex;justify-content:space-between;align-items:center"><div><div class="invoice-id">'+p.id+'</div><div style="font-size:11px;color:var(--muted);margin-top:5px">User <b>'+p.userId+'</b> • '+p.days+' Hari • Rp '+p.amount+'</div><div style="font-size:10px;color:var(--muted);margin-top:3px">'+new Date(p.createdAt).toLocaleString('id-ID')+'</div></div><span class="badge badge-orange">PENDING</span></div><div style="display:flex;gap:8px;margin-top:12px"><button class="btn btn-primary" style="flex:1" onclick="ownerAct(\\''+p.id+'\\',\\'approve\\')">✅ Setujui</button><button class="btn" style="flex:1" onclick="ownerAct(\\''+p.id+'\\',\\'reject\\')">❌ Tolak</button></div></div></div>').join('');
}
function renderUsersPage(){
if(!cacheStats) return;
let users=cacheStats.recentUsers||[];
let sub=document.getElementById('oUsersSub'); if(sub) sub.textContent=cacheStats.usersValid+' pengguna valid • '+(cacheStats.premium||0)+' VIP';
let table=document.getElementById('oUsersTable');
if(!table) return;
if(users.length===0){table.innerHTML='<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--muted)">Belum ada user</td></tr>';return;}
table.innerHTML=users.map(u=>'<tr><td class="mono" style="font-size:10px">'+u.id+'</td><td><div style="font-weight:700;font-size:11px">'+(u.first_name||'User').substring(0,12)+'</div><div style="font-size:9px;color:var(--muted)">Ref '+(u.referralCount||0)+'</div></td><td><b>'+(u.totalFix||0)+'</b></td><td><span class="badge '+(u.premiumUntil&&u.premiumUntil>Date.now()?'badge-vip':'badge-blue')+'" style="font-size:8px">'+(u.premiumUntil&&u.premiumUntil>Date.now()?'VIP':'FREE')+'</span></td></tr>').join('');
}
function renderVoucherPage(){
if(!cacheStats) return;
let codes=cacheStats.codes||[];
let listEl=document.getElementById('oVoucherList');
let countEl=document.getElementById('vCount');
if(countEl) countEl.textContent=codes.length;
if(!listEl) return;
if(codes.length===0){listEl.innerHTML='<div class="empty" style="padding:16px"><div class="empty-icon">🎟️</div><div class="empty-title">Belum ada voucher</div></div>';return;}
listEl.innerHTML=codes.map(c=>'<div class="pkg-premium" style="margin-bottom:8px;padding:12px"><div><div style="font-weight:800;font-size:12px" class="mono">'+c.code+' • '+c.days+'H</div><div style="font-size:10px;color:var(--muted);margin-top:3px">Kuota '+(c.quota||'∞')+' • Pakai '+(c.used||0)+' • '+c.type+' • '+(c.quota>0&&c.used>=c.quota?'❌ Habis':'✅ Aktif')+'</div></div><button class="btn btn-small" style="background:var(--red-light);color:var(--red)" onclick="delVoucher(\\''+c.code+'\\')">Hapus</button></div>').join('');
}

async function verifyOwner(){
let pass=document.getElementById('ownerPass').value.trim();
let errEl=document.getElementById('oLoginErr');
if(!pass){errEl.style.display='block';errEl.textContent='Masukkan password';return;}
errEl.style.display='none';
try{
let r=await fetchJson('/api/verify_owner',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,password:pass})});
if(r.ok){
ownerPass=pass;
ownerVerified=true;
sessionStorage.setItem('walzy_pass',pass);
sessionStorage.setItem('walzy_verified','true');
showT('Berhasil','Akses owner dibuka','success');
showOwnerRoot();
loadStats();
}else{
errEl.style.display='block';
errEl.textContent=r.message||'Password salah';
showT('Gagal',r.message||'Salah','error');
}
}catch(e){
errEl.style.display='block';
errEl.textContent=e.message;
showT('Gagal',e.message,'error');
}
}

function logoutOwner(){
sessionStorage.removeItem('walzy_pass');
sessionStorage.removeItem('walzy_verified');
ownerPass='';
ownerVerified=false;
showT('Keluar','Logout berhasil','success');
setTimeout(()=>{location.reload();},700);
}

async function loadUser(){
if(!userId) return;
try{
let data=await fetchJson('/api/user?user_id='+userId);
if(data.ok) renderUser(data);
}catch(e){
if(!cacheUser) showT('Error','Gagal load user','error');
}
}

async function loadStats(){
if(!userId) return;
try{
let data=await fetchJson('/api/stats?user_id='+userId);
if(data.ok) renderStats(data);
}catch(e){}
}

async function ownerAct(inv,act){
try{
let r=await fetchJson('/api/owner_action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,action:act,invoice:inv,password:ownerPass})});
showT(act==='approve'?'ACC':'Tolak',r.message,'success');
loadStats();
if(cacheStats && cacheStats.pendingPayments){
let pendingEl=document.getElementById('oPendingList');
if(pendingEl && document.getElementById('oPending').classList.contains('active')) renderPendingPage();
}
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
if(r.ok){showT('Berhasil','Voucher '+code,'success');document.getElementById('vCode').value='';document.getElementById('vDays').value='';document.getElementById('vQuota').value='';loadStats();setTimeout(()=>renderVoucherPage(),600);}
else showT('Gagal',r.message,'error');
}catch(e){showT('Error',e.message,'error');}
}

async function delVoucher(code){
if(!confirm('Hapus '+code+'?')) return;
try{
let r=await fetchJson('/api/delete_code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,code,password:ownerPass})});
if(r.ok){showT('Hapus',code+' dihapus','success');loadStats();setTimeout(()=>renderVoucherPage(),600);}
else showT('Gagal',r.message,'error');
}catch(e){showT('Error',e.message,'error');}
}

async function sendBc(){
let text=document.getElementById('bcText').value.trim();
if(!text) return showT('Gagal','Isi pesan','error');
let btn=document.querySelector('#oBroadcast .btn-primary');
if(btn){btn.disabled=true;btn.textContent='Mengirim...';}
try{
let r=await fetchJson('/api/broadcast',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,text,password:ownerPass})});
showT('Terkirim','Ke '+r.sent+' user','success');
document.getElementById('bcText').value='';
}catch(e){showT('Gagal',e.message,'error');}
if(btn){btn.disabled=false;btn.textContent='📢 Kirim Broadcast Sekarang';}
}

async function doSpin(){
let btn=document.getElementById('spinBtn');
if(btn){btn.disabled=true;btn.textContent='Memutar...';}
try{
let r=await fetchJson('/api/spin?user_id='+userId,{method:'POST'});
if(r.ok){showT('Menang! '+r.reward.label,'Bonus diklaim','success');loadUser();}
else{showT('Info',r.message,'error');if(btn){btn.disabled=r.alreadySpun;btn.textContent=r.alreadySpun?'✅ Sudah Diklaim':'🎰 Putar';}}
}catch(e){showT('Error',e.message,'error');if(btn){btn.disabled=false;btn.textContent='🎰 Putar Spin';}}
}

async function buyPkg(days){
try{
let r=await fetchJson('/api/deposit?user_id='+userId+'&days='+days,{method:'POST'});
if(r.ok){
currentInvoice=r.invoice.id;
showUserView('uOrder');
setTimeout(()=>loadUser(),400);
showT('Invoice Dibuat',r.invoice.id,'success');
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
document.getElementById('loadTxt').textContent='Buka via Telegram Bot';
hideLoad();
return;
}
renderTelegram();
loadUser();
loadStats();
setInterval(()=>{let el=document.getElementById('time');if(el)el.textContent=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Jakarta'})+' WIB';},1000);
let passEl=document.getElementById('ownerPass');
if(passEl) passEl.addEventListener('keypress',e=>{if(e.key==='Enter') verifyOwner();});
let bcText=document.getElementById('bcText');
if(bcText) bcText.addEventListener('input',e=>{let c=document.getElementById('bcCount');if(c){let users=cacheStats?.usersValid||0;c.textContent=e.target.value.length+' / 1000 karakter • '+users+' user';}});
setTimeout(hideLoad,2200);
})();
</script>
</body>
</html>`);
};
