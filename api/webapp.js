module.exports = async (req, res) => {
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Cache-Control','no-cache');
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>WALZY STORE • Premium</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#f6f7fb; --bg2:#eef1f8;
  --card:#ffffff; --card2:#fafbff;
  --border:#e7e9f3; --border2:#eef0f7;
  --text:#0f172a; --muted:#7c859c; --muted2:#a3acc2;
  --blue:#0a7cff; --blue2:#6a5cff; --blue3:#3b82f6;
  --blue-light:#eef4ff; --blue-light2:#dbeafe;
  --green:#10b981; --green-light:#dcfce7;
  --red:#ef4444; --red-light:#fee2e2;
  --orange:#f59e0b; --orange-light:#fef3c7;
  --shadow:0 8px 30px rgba(15,23,42,0.06); --shadow2:0 20px 60px rgba(15,23,42,0.10);
  --radius:18px; --radius2:24px; --radius-full:999px;
}
@media(prefers-color-scheme:dark){
  :root{ --bg:#0b101f; --bg2:#11182f; --card:#151d32; --card2:#1c2640; --border:#1e2a4a; --border2:#1c2846; --text:#eef2ff; --muted:#8b9ab8; --muted2:#6b7ea1; --blue-light:#162a5a; --shadow:0 8px 30px rgba(0,0,0,0.3); --shadow2:0 20px 60px rgba(0,0,0,0.4); }
}
*{box-sizing:border-box;margin:0;padding:0; -webkit-tap-highlight-color:transparent}
html{scroll-behavior:smooth}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:linear-gradient(180deg,var(--bg),var(--bg2));color:var(--text);min-height:100vh;overflow-x:hidden;letter-spacing:-0.01em}
.mono{font-family:'JetBrains Mono',monospace}
.shimmer{background:linear-gradient(90deg,var(--border) 25%,var(--border2) 50%,var(--border) 75%);background-size:200% 100%;animation:shimmer 1.2s infinite}

/* HEADER */
.header{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.75);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-bottom:1px solid var(--border);height:68px;display:flex;align-items:center;justify-content:space-between;padding:0 20px}
@media(prefers-color-scheme:dark){ .header{background:rgba(21,29,50,0.8)} }
.brand{display:flex;align-items:center;gap:12px}
.brand-icon{width:42px;height:42px;border-radius:14px;background:linear-gradient(135deg,var(--blue),var(--blue2));display:grid;place-items:center;color:#fff;font-weight:800;font-size:18px;box-shadow:0 10px 24px rgba(10,124,255,0.35), inset 0 1px 0 rgba(255,255,255,0.3)}
.brand-text{font-weight:800;font-size:18px;letter-spacing:-0.03em}
.brand-sub{font-size:11px;color:var(--muted);font-weight:600;margin-top:-2px;letter-spacing:0.05em;text-transform:uppercase}
.live{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);font-weight:600;background:var(--card);border:1px solid var(--border);padding:6px 12px;border-radius:100px}
.live-dot{width:8px;height:8px;background:var(--green);border-radius:50%;animation:pulse 1.6s infinite;box-shadow:0 0 0 4px rgba(16,185,129,0.15)}
.live-bullet{width:3px;height:3px;background:var(--muted2);border-radius:50%}

/* LAYOUT */
.container{max-width:760px;margin:0 auto;padding:20px 16px 120px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(max-width:500px){ .grid-2{grid-template-columns:1fr 1fr} }

/* CARD SYSTEM */
.card{background:var(--card);border-radius:var(--radius2);border:1px solid var(--border);box-shadow:var(--shadow);margin-bottom:16px;overflow:hidden;animation:slideUp 0.45s both;position:relative}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent);pointer-events:none}
.card-h{padding:18px 20px;border-bottom:1px solid var(--border2);display:flex;justify-content:space-between;align-items:center;gap:12px}
.card-t{font-size:13px;font-weight:800;letter-spacing:-0.02em;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;gap:8px}
.card-t b{color:var(--text);font-size:14px;text-transform:none;letter-spacing:-0.02em}
.card-b{padding:18px 20px}
.card-premium{background:linear-gradient(135deg,var(--card),var(--card2));border:1px solid var(--border);position:relative;overflow:hidden}
.card-premium::after{content:'';position:absolute;top:-50%;right:-30%;width:60%;height:200%;background:radial-gradient(ellipse,rgba(10,124,255,0.08),transparent 60%);pointer-events:none}

/* AVATAR & BADGE */
.avatar{width:64px;height:64px;border-radius:20px;background:linear-gradient(135deg,#e0e7ff,#dbeafe 60%,#bfdbfe);border:1px solid #c7d2fe;display:grid;place-items:center;font-weight:800;font-size:24px;color:var(--blue);box-shadow:0 8px 20px rgba(59,130,246,0.15)}
@media(prefers-color-scheme:dark){ .avatar{background:linear-gradient(135deg,#1e2a5a,#1a2f5e);border-color:#25407a;color:#93c5fd} }
.badge{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:100px;font-size:11px;font-weight:800;letter-spacing:0.02em;border:1px solid transparent}
.badge-blue{background:var(--blue-light);color:var(--blue);border-color:rgba(10,124,255,0.15)}
.badge-green{background:var(--green-light);color:#065f46;border-color:rgba(16,185,129,0.15)}
.badge-orange{background:var(--orange-light);color:#92400e;border-color:rgba(245,158,11,0.2)}
.badge-vip{background:linear-gradient(135deg,#fef3c7,#fde68a);color:#92400e;border-color:#fcd34d;box-shadow:0 4px 12px rgba(245,158,11,0.2)}

/* STAT */
.stat{padding:16px;border-radius:var(--radius);background:var(--card);border:1px solid var(--border);position:relative;overflow:hidden;transition:all 0.2s}
.stat:hover{transform:translateY(-2px);box-shadow:var(--shadow)}
.stat-v{font-size:24px;font-weight:800;letter-spacing:-0.03em;display:flex;align-items:baseline;gap:6px}
.stat-v small{font-size:12px;font-weight:600;color:var(--muted)}
.stat-l{font-size:10px;color:var(--muted);text-transform:uppercase;margin-top:8px;font-weight:700;letter-spacing:0.08em;display:flex;align-items:center;gap:6px}
.stat-icon{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;font-size:18px;margin-bottom:10px}
.stat-bar{position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--blue),var(--blue2));opacity:0.8}

/* BUTTONS */
.btn{width:100%;padding:13px 16px;border-radius:14px;border:1px solid var(--border);background:var(--card);font-weight:700;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s;letter-spacing:-0.01em;position:relative;overflow:hidden}
.btn::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,0.1),transparent);opacity:0;transition:opacity 0.2s}
.btn:hover::before{opacity:1}
.btn:active{transform:scale(0.98)}
.btn-primary{background:linear-gradient(135deg,var(--blue),var(--blue2));color:#fff;border:0;box-shadow:0 10px 24px rgba(10,124,255,0.30), inset 0 1px 0 rgba(255,255,255,0.2)}
.btn-primary:hover{box-shadow:0 12px 28px rgba(10,124,255,0.38)}
.btn-ghost{background:transparent;border:1px dashed var(--border)}
.btn-small{padding:8px 14px;font-size:12px;width:auto;border-radius:100px}
.btn:disabled{opacity:0.5;pointer-events:none}

/* INPUTS */
.input{width:100%;padding:13px 14px;border-radius:14px;border:1px solid var(--border);font-size:14px;outline:none;font-family:inherit;background:var(--card);color:var(--text);transition:all 0.2s;font-weight:500}
.input:focus{border-color:var(--blue);box-shadow:0 0 0 4px var(--blue-light);background:var(--card)}
.input::placeholder{color:var(--muted2)}
.input-group{position:relative}
.input-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted2);pointer-events:none}

/* PACKAGE */
.pkg{display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid var(--border2);gap:12px;transition:all 0.15s}
.pkg:hover{background:linear-gradient(90deg,transparent,var(--card2),transparent);margin:0 -20px;padding-left:20px;padding-right:20px;border-radius:12px}
.pkg:last-child{border-bottom:0}
.pkg-info{flex:1}
.pkg-name{font-weight:700;font-size:14px;letter-spacing:-0.01em}
.pkg-desc{font-size:12px;color:var(--muted);margin-top:3px}
.pkg-price{font-weight:800;font-size:15px}
.pkg-badge{font-size:10px;font-weight:800;padding:4px 8px;border-radius:100px;background:var(--orange-light);color:#92400e}

/* NAV */
.nav{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.88);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border:1px solid var(--border);display:flex;gap:6px;padding:8px;border-radius:22px;box-shadow:0 20px 60px rgba(15,23,42,0.15), 0 2px 0 rgba(255,255,255,0.8) inset;z-index:90;max-width:400px;width:calc(100% - 24px)}
@media(prefers-color-scheme:dark){ .nav{background:rgba(21,29,50,0.88);box-shadow:0 20px 60px rgba(0,0,0,0.5)} }
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 6px;border-radius:14px;cursor:pointer;color:var(--muted);font-size:10px;font-weight:700;transition:all 0.22s;letter-spacing:0.02em;text-transform:uppercase;position:relative}
.nav-item i{font-size:18px;font-style:normal;transition:transform 0.2s}
.nav-item.active{background:linear-gradient(135deg,var(--text),#1e293b);color:#fff;box-shadow:0 8px 20px rgba(15,23,42,0.25)}
@media(prefers-color-scheme:dark){ .nav-item.active{background:linear-gradient(135deg,var(--blue),var(--blue2))} }
.nav-item.active i{transform:scale(1.15)}
.nav-item:active{transform:scale(0.96)}

/* TABS OWNER */
.owner-tab{display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;scrollbar-width:none}
.owner-tab::-webkit-scrollbar{display:none}
.tab{padding:9px 16px;border-radius:100px;background:var(--card);border:1px solid var(--border);font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer;color:var(--muted);transition:all 0.2s;letter-spacing:0.02em;display:flex;align-items:center;gap:6px}
.tab:hover{border-color:var(--blue);color:var(--blue)}
.tab.active{background:var(--text);color:#fff;border-color:var(--text);box-shadow:0 6px 16px rgba(15,23,42,0.15)}
.tab-dot{width:6px;height:6px;border-radius:50%;background:currentColor}

/* TABLE */
.table{width:100%;border-collapse:collapse;font-size:13px}
.table th{font-size:10px;color:var(--muted);text-align:left;padding:12px 12px;border-bottom:1px solid var(--border2);text-transform:uppercase;letter-spacing:0.08em;font-weight:700}
.table td{padding:12px 12px;border-bottom:1px solid var(--border2);font-weight:500}
.table tr:last-child td{border-bottom:0}
.table tr:hover td{background:var(--card2)}

/* LOADING & SKELETON */
.skeleton{border-radius:12px;background:var(--border);animation:shimmer 1.2s infinite;min-height:16px}
.skeleton-text{height:14px;width:70%;margin:8px 0;border-radius:8px}
.skeleton-avatar{width:64px;height:64px;border-radius:20px}
.skeleton-card{height:120px;border-radius:var(--radius2)}
.loading-screen{position:fixed;inset:0;background:var(--bg);z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;transition:opacity 0.4s, visibility 0.4s}
.loading-screen.hide{opacity:0;visibility:hidden;pointer-events:none}
.loading-logo{width:64px;height:64px;border-radius:20px;background:linear-gradient(135deg,var(--blue),var(--blue2));display:grid;place-items:center;color:#fff;font-weight:800;font-size:28px;animation:logoFloat 2s ease-in-out infinite;box-shadow:0 16px 32px rgba(10,124,255,0.3)}
.loading-dots{display:flex;gap:6px}
.loading-dots span{width:8px;height:8px;background:var(--blue);border-radius:50%;animation:dotPulse 1.4s infinite}
.loading-dots span:nth-child(2){animation-delay:0.2s}
.loading-dots span:nth-child(3){animation-delay:0.4s}

/* TOAST */
.square-toast{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.92);width:320px;background:var(--card);border:1px solid var(--border);border-radius:24px;box-shadow:var(--shadow2);padding:28px 24px;display:none;flex-direction:column;align-items:center;text-align:center;z-index:400;opacity:0;transition:all 0.36s cubic-bezier(0.34,1.56,0.64,1)}
.square-toast.show{display:flex;transform:translate(-50%,-50%) scale(1);opacity:1}
.toast-icon{width:64px;height:64px;border-radius:20px;display:grid;place-items:center;margin-bottom:16px;font-size:28px}

/* INVOICE CARD */
.invoice-card{background:linear-gradient(135deg,var(--card),var(--card2));border:2px dashed var(--border);border-radius:20px;padding:20px;position:relative;overflow:hidden}
.invoice-card::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:60%;height:4px;background:linear-gradient(90deg,var(--blue),var(--blue2));border-radius:0 0 8px 8px}
.invoice-id{font-family:'JetBrains Mono',monospace;font-weight:700;letter-spacing:0.05em;background:var(--bg2);padding:6px 10px;border-radius:8px;border:1px solid var(--border);display:inline-flex;font-size:13px}

/* EMPTY */
.empty{padding:40px 20px;text-align:center;color:var(--muted)}
.empty-icon{width:72px;height:72px;margin:0 auto 16px;background:var(--bg2);border:1px solid var(--border);border-radius:20px;display:grid;place-items:center;font-size:32px}
.empty-title{font-weight:700;color:var(--text);margin-bottom:6px}
.empty-desc{font-size:13px;line-height:1.5}

/* PROGRESS */
.progress{height:6px;background:var(--border);border-radius:100px;overflow:hidden}
.progress-bar{height:100%;background:linear-gradient(90deg,var(--blue),var(--blue2));border-radius:100px;transition:width 0.6s ease}

/* ANIMATIONS */
@keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%{transform:scale(1);box-shadow:0 0 0 0 rgba(16,185,129,0.4)}50%{transform:scale(1.08);box-shadow:0 0 0 6px rgba(16,185,129,0)}100%{transform:scale(1)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes logoFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes dotPulse{0%,80%,100%{transform:scale(0.8);opacity:0.5}40%{transform:scale(1.2);opacity:1}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
</style>
</head>
<body>
<!-- LOADING SCREEN - ANTI LAG -->
<div class="loading-screen" id="loadingScreen">
  <div class="loading-logo">W</div>
  <div style="text-align:center">
    <div style="font-weight:800;font-size:18px;letter-spacing:-0.02em">walzy store</div>
    <div style="font-size:12px;color:var(--muted);margin-top:4px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase">Memuat data super cepat...</div>
  </div>
  <div class="loading-dots"><span></span><span></span><span></span></div>
</div>

<div class="square-toast" id="squareToast">
  <div id="squareIcon" class="toast-icon" style="background:var(--blue-light);color:var(--blue)">✅</div>
  <div style="font-weight:800;font-size:16px;letter-spacing:-0.02em" id="squareTitle">Berhasil</div>
  <div style="font-size:13px;color:var(--muted);margin-top:8px;line-height:1.5" id="squareMsg">Ok</div>
  <button class="btn btn-primary" style="margin-top:20px;width:auto;padding:10px 24px;border-radius:100px" onclick="hideToast()">Tutup</button>
</div>

<div class="header">
  <div class="brand">
    <div class="brand-icon">W</div>
    <div>
      <div class="brand-text">walzy store</div>
      <div class="brand-sub">Premium • Super Cepat</div>
    </div>
  </div>
  <div class="live">
    <span class="live-dot"></span>
    <span id="time">--:--</span>
    <span class="live-bullet"></span>
    <span style="font-size:10px;opacity:0.7">LIVE</span>
  </div>
</div>

<!-- OWNER LOGIN - REDESIGNED -->
<div class="container" id="ownerLogin" style="display:none">
  <div class="card" style="max-width:380px;margin:60px auto;overflow:hidden">
    <div style="height:4px;background:linear-gradient(90deg,var(--blue),var(--blue2))"></div>
    <div class="card-b" style="text-align:center;padding:32px 24px">
      <div style="width:72px;height:72px;margin:0 auto 18px;background:linear-gradient(135deg,var(--text),#1e293b);border-radius:20px;display:grid;place-items:center;color:#fff;font-size:28px;box-shadow:0 12px 24px rgba(15,23,42,0.2)">🔒</div>
      <div style="font-size:20px;font-weight:800;letter-spacing:-0.03em">Owner Access</div>
      <div style="font-size:13px;color:var(--muted);margin-top:8px;line-height:1.5">Keamanan tingkat tinggi • Enkripsi end-to-end<br>Password tidak akan ditampilkan</div>
      <div class="input-group" style="margin-top:24px">
        <span class="input-icon">🔑</span>
        <input type="password" id="ownerPass" class="input" placeholder="••••••••" style="padding-left:40px;text-align:center;letter-spacing:0.5em;font-size:16px">
      </div>
      <button class="btn btn-primary" style="margin-top:14px" onclick="unlockOwner()">🔓 Buka Studio Owner</button>
      <button class="btn btn-ghost" style="margin-top:10px" onclick="backToUser()">← Kembali ke User</button>
      <div style="margin-top:18px;font-size:11px;color:var(--muted2)">Dilindungi oleh Walzy Security System</div>
    </div>
  </div>
</div>

<!-- OWNER DASHBOARD - SUPER PREMIUM -->
<div class="container" id="ownerPanel" style="display:none">
  <!-- Stats Grid Instant Load -->
  <div class="grid-2" style="margin-bottom:16px">
    <div class="stat">
      <div class="stat-icon" style="background:var(--blue-light);color:var(--blue)">👥</div>
      <div class="stat-v" id="o_users">--</div>
      <div class="stat-l"><span class="tab-dot" style="background:var(--blue)"></span>Pengguna Valid</div>
      <div class="stat-bar"></div>
    </div>
    <div class="stat">
      <div class="stat-icon" style="background:var(--orange-light);color:#92400e">💎</div>
      <div class="stat-v" id="o_vip">--</div>
      <div class="stat-l"><span class="tab-dot" style="background:var(--orange)"></span>VIP Member</div>
      <div class="stat-bar" style="background:linear-gradient(90deg,var(--orange),#fbbf24)"></div>
    </div>
    <div class="stat">
      <div class="stat-icon" style="background:var(--green-light);color:#065f46">📦</div>
      <div class="stat-v" id="o_today">--</div>
      <div class="stat-l"><span class="tab-dot" style="background:var(--green)"></span>Order Hari Ini</div>
      <div class="stat-bar" style="background:linear-gradient(90deg,var(--green),#34d399)"></div>
    </div>
    <div class="stat">
      <div class="stat-icon" style="background:var(--blue-light);color:var(--blue)">💰</div>
      <div class="stat-v" id="o_rev">--</div>
      <div class="stat-l"><span class="tab-dot" style="background:var(--blue)"></span>Total Revenue</div>
      <div class="stat-bar"></div>
    </div>
  </div>

  <div class="card">
    <div class="card-h">
      <div class="card-t"><span>🎛️</span><b>Studio Kontrol Owner</b></div>
      <span class="badge badge-blue">DARK PRO • LIVE</span>
    </div>
    <div class="card-b">
      <div class="owner-tab" id="ownerTabs">
        <div class="tab active" onclick="switchOwnerTab('pending')"><span class="tab-dot" style="background:var(--orange)"></span>Pending</div>
        <div class="tab" onclick="switchOwnerTab('users')"><span class="tab-dot" style="background:var(--blue)"></span>Users</div>
        <div class="tab" onclick="switchOwnerTab('voucher')"><span class="tab-dot" style="background:var(--green)"></span>Voucher</div>
        <div class="tab" onclick="switchOwnerTab('broadcast')"><span class="tab-dot" style="background:#ec4899"></span>Broadcast</div>
        <div class="tab" onclick="switchOwnerTab('revenue')"><span class="tab-dot" style="background:var(--blue2)"></span>Revenue</div>
      </div>
      <div id="ownerContent" style="margin-top:16px">
        <div class="empty"><div class="empty-icon">⏳</div><div class="empty-title">Memuat data owner...</div><div class="empty-desc">Data diambil dengan cache super cepat</div></div>
      </div>
    </div>
  </div>

  <!-- Voucher Creator - Premium -->
  <div class="card" id="voucherCreateCard" style="display:none">
    <div class="card-h"><div class="card-t"><span>🎟️</span><b>Buat Voucher Baru</b></div><span class="badge badge-green">Instant</span></div>
    <div class="card-b">
      <div class="grid-2">
        <div><div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Kode Voucher</div><input id="voucherCode" class="input mono" placeholder="WALZY2025" style="text-transform:uppercase"></div>
        <div><div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Durasi Hari</div><input id="voucherDays" class="input" type="number" placeholder="30"></div>
      </div>
      <div class="grid-2" style="margin-top:12px">
        <div><div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Kuota (0 = Unlimited)</div><input id="voucherQuota" class="input" type="number" placeholder="10"></div>
        <div><div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Tipe</div><select id="voucherType" class="input"><option value="public">Public</option><option value="private">Private (1x pakai)</option></select></div>
      </div>
      <button class="btn btn-primary" style="margin-top:16px" onclick="createVoucher()">✨ Buat Voucher Sekarang</button>
    </div>
  </div>
</div>

<!-- USER PANEL - PREMIUM UPGRADED -->
<div class="container" id="userPanel">
  <!-- Profile Card with Skeleton -->
  <div class="card card-premium" id="profileCard">
    <div class="card-b" style="display:flex;gap:16px;align-items:center">
      <div class="avatar" id="userAvatar">W</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <div style="font-weight:800;font-size:16px;letter-spacing:-0.02em" id="userName"><span class="skeleton skeleton-text" style="width:120px;display:inline-block"></span></div>
          <span id="userRankBadge" class="badge badge-vip">BASIC 🌱</span>
        </div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px;display:flex;align-items:center;gap:6px">
          <span id="userStatus"><span class="skeleton skeleton-text" style="width:80px;display:inline-block"></span></span>
          <span class="live-bullet"></span>
          <span id="userJoined">--</span>
        </div>
        <div style="margin-top:12px"><div class="progress"><div id="dailyProgress" class="progress-bar" style="width:0%"></div></div><div style="font-size:10px;color:var(--muted);margin-top:6px;font-weight:600;letter-spacing:0.05em"><span id="dailyText">Memuat...</span></div></div>
      </div>
    </div>
  </div>

  <div class="grid-2">
    <div class="stat"><div class="stat-v" id="statTotal"><span class="skeleton skeleton-text" style="width:40px"></span></div><div class="stat-l">Total Order</div></div>
    <div class="stat"><div class="stat-v" id="statRef"><span class="skeleton skeleton-text" style="width:30px"></span></div><div class="stat-l">Referral</div></div>
  </div>

  <!-- Spin & Actions -->
  <div class="card">
    <div class="card-h"><div class="card-t"><span>🎰</span><b>Daily Spin & Reward</b></div><span class="badge badge-orange">Harian</span></div>
    <div class="card-b">
      <div style="display:flex;gap:12px">
        <button id="spinBtn" class="btn btn-primary" style="flex:1" onclick="doSpin()">🎰 Putar Spin</button>
        <button class="btn" style="width:auto;padding:13px 18px" onclick="switchTab('profile')">👤 Profil</button>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:10px;text-align:center">Spin setiap hari untuk dapat bonus VIP, pesanan, dan poin referral!</div>
    </div>
  </div>

  <!-- Packages -->
  <div class="card" id="packagesCard">
    <div class="card-h"><div class="card-t"><span>💎</span><b>Paket Premium Walzy</b></div><span class="badge badge-blue">Best Seller</span></div>
    <div class="card-b" id="packagesList">
      <div class="pkg" style="opacity:0.6"><div class="pkg-info"><div class="pkg-name"><span class="skeleton skeleton-text" style="width:100px"></span></div><div class="pkg-desc"><span class="skeleton skeleton-text" style="width:140px"></span></div></div><div class="pkg-price"><span class="skeleton skeleton-text" style="width:60px"></span></div></div>
      <div class="pkg" style="opacity:0.6"><div class="pkg-info"><div class="pkg-name"><span class="skeleton skeleton-text" style="width:90px"></span></div><div class="pkg-desc"><span class="skeleton skeleton-text" style="width:120px"></span></div></div><div class="pkg-price"><span class="skeleton skeleton-text" style="width:60px"></span></div></div>
    </div>
  </div>

  <!-- Referral & Redeem -->
  <div class="grid-2">
    <div class="card"><div class="card-b">
      <div style="font-size:11px;font-weight:800;color:var(--muted);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px">🔗 Referral Link</div>
      <div class="mono" id="refLink" style="font-size:11px;background:var(--bg2);border:1px solid var(--border);padding:10px;border-radius:12px;word-break:break-all;color:var(--muted)">Memuat link...</div>
      <button class="btn btn-small" style="margin-top:10px;width:100%" onclick="copyRef()">📋 Salin Link</button>
    </div></div>
    <div class="card"><div class="card-b">
      <div style="font-size:11px;font-weight:800;color:var(--muted);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:10px">🎟️ Redeem Voucher</div>
      <input id="redeemInput" class="input mono" placeholder="KODEVOUCHER" style="text-transform:uppercase;text-align:center;font-weight:700;letter-spacing:0.1em">
      <button class="btn btn-primary btn-small" style="margin-top:10px;width:100%" onclick="doRedeem()">🎫 Tukar Voucher</button>
    </div></div>
  </div>

  <!-- Invoice -->
  <div class="card" id="invoiceCard" style="display:none">
    <div class="card-h"><div class="card-t"><span>🧾</span><b>Invoice Aktif</b></div><span class="badge badge-orange">Menunggu</span></div>
    <div class="card-b"><div id="invoiceBox" class="invoice-card"></div></div>
  </div>

  <!-- History -->
  <div class="card">
    <div class="card-h"><div class="card-t"><span>📜</span><b>Riwayat Transaksi</b></div><span class="badge badge-blue" id="historyCount">0</span></div>
    <div class="card-b" style="padding:0"><div style="overflow:auto"><table class="table"><thead><tr><th>Invoice</th><th>Paket</th><th>Status</th><th>Tanggal</th></tr></thead><tbody id="historyTable"><tr><td colspan="4" style="text-align:center;padding:24px;color:var(--muted)">Memuat riwayat...</td></tr></tbody></table></div></div>
  </div>
</div>

<!-- BOTTOM NAV - PREMIUM -->
<div class="nav" id="bottomNav">
  <div class="nav-item active" data-tab="home" onclick="switchTab('home')"><i>🏠</i><span>Home</span></div>
  <div class="nav-item" data-tab="order" onclick="switchTab('order')"><i>📦</i><span>Order</span></div>
  <div class="nav-item" data-tab="profile" onclick="switchTab('profile')"><i>👤</i><span>Profil</span></div>
  <div class="nav-item" data-tab="owner" onclick="switchTab('owner')"><i>👑</i><span>Owner</span></div>
</div>

<script>
// ================= PERFORMANCE CORE - ANTI LAG =================
let userId = null;
let OWNER_PASSWORD = sessionStorage.getItem('walzy_owner_pass') || '';
let isOwnerUser = false;
let currentTab = 'home';
let currentInvoice = null;
let cachedUserData = null;
let cachedStatsData = null;
let fetchController = null;
let isLoading = false;
const CACHE_KEY = 'walzy_cache_v3';
const CACHE_TTL = 30000; // 30 detik cache

// Instant cache load
function loadCache(){
  try{
    const c = JSON.parse(localStorage.getItem(CACHE_KEY)||'{}');
    if(c.user && Date.now()-c.ts < CACHE_TTL){
      cachedUserData = c.user;
      renderUserFromCache(c.user);
      hideLoadingScreen();
    }
  }catch(e){}
}
function saveCache(user){
  try{ localStorage.setItem(CACHE_KEY, JSON.stringify({user, ts:Date.now()})); }catch(e){}
}

function hideLoadingScreen(){
  const el = document.getElementById('loadingScreen');
  if(el) el.classList.add('hide');
}
function showToast(title,msg,type='success'){
  const t=document.getElementById('squareToast');
  const icon=document.getElementById('squareIcon');
  document.getElementById('squareTitle').textContent=title;
  document.getElementById('squareMsg').textContent=msg;
  if(type==='success'){ icon.style.background='var(--green-light)'; icon.textContent='✅'; }
  else if(type==='error'){ icon.style.background='var(--red-light)'; icon.textContent='❌'; }
  else{ icon.style.background='var(--orange-light)'; icon.textContent='ℹ️'; }
  t.classList.add('show');
  if(window.Telegram?.WebApp?.HapticFeedback){ try{ Telegram.WebApp.HapticFeedback.notificationOccurred(type==='success'?'success':'error'); }catch(e){} }
  setTimeout(()=>hideToast(),3500);
}
function hideToast(){ document.getElementById('squareToast').classList.remove('show'); }

function isOwnerAuthed(){ return OWNER_PASSWORD && OWNER_PASSWORD.length>=4; }

// FAST USER LOAD - PARALLEL + CACHE + ABORT
async function loadUser(){
  if(isLoading) return;
  if(!userId){ hideLoadingScreen(); return; }
  if(fetchController) fetchController.abort();
  fetchController = new AbortController();
  isLoading = true;
  
  try{
    // Load cache first instant
    loadCache();
    
    // Parallel fetch - 2x faster
    const [userRes, statsRes] = await Promise.allSettled([
      fetch('/api/user?user_id='+userId, {signal: fetchController.signal}).then(r=>r.json()),
      fetch('/api/stats?user_id='+userId, {signal: fetchController.signal}).then(r=>r.json())
    ]);
    
    const userData = userRes.status==='fulfilled' ? userRes.value : null;
    const statsData = statsRes.status==='fulfilled' ? statsRes.value : null;
    
    if(userData && userData.ok){
      cachedUserData = userData;
      saveCache(userData);
      renderUser(userData);
      isOwnerUser = statsData?.isOwner || false;
    }
    if(statsData && statsData.ok){
      cachedStatsData = statsData;
      if(isOwnerUser && isOwnerAuthed()){
        renderOwnerStats(statsData);
      }
    }
    hideLoadingScreen();
  }catch(e){
    if(e.name!=='AbortError'){
      console.error(e);
      // Try cache fallback
      if(cachedUserData) renderUser(cachedUserData);
      else showToast('Koneksi Lambat','Menggunakan data offline','error');
      hideLoadingScreen();
    }
  }finally{
    isLoading = false;
  }
}

function renderUserFromCache(data){
  if(!data || !data.user) return;
  const u = data.user;
  document.getElementById('userName').textContent = u.first_name || 'User';
  document.getElementById('userAvatar').textContent = (u.first_name||'W')[0].toUpperCase();
  document.getElementById('userStatus').textContent = u.isPremium ? '💎 VIP '+u.premiumLeft+' Hari' : '🎫 Gratis '+u.dailyFix.remaining+'/3';
  document.getElementById('statTotal').textContent = u.totalFix||0;
  document.getElementById('statRef').textContent = u.referralCount||0;
  document.getElementById('dailyProgress').style.width = ((u.dailyFix.used||0)/3*100)+'%';
  document.getElementById('dailyText').textContent = 'Terpakai '+u.dailyFix.used+'/3 hari ini';
}

function renderUser(data){
  if(!data || !data.user) return;
  const u = data.user;
  const global = data.global||{};
  renderUserFromCache(data);
  
  document.getElementById('userJoined').textContent = new Date(u.joinedAt).toLocaleDateString('id-ID',{day:'2-digit',month:'short'});
  document.getElementById('userRankBadge').textContent = u.rank.name+' '+u.rank.icon;
  document.getElementById('statTotal').innerHTML = u.totalFix+'<small>order</small>';
  document.getElementById('statRef').innerHTML = u.referralCount+'<small>orang</small>';
  
  // Referral link
  const botUsername = 'walzystore_bot'; // ganti sesuai bot kamu
  const link = 'https://t.me/'+botUsername+'?start='+u.id;
  document.getElementById('refLink').textContent = link;
  
  // Packages
  const pkgs = [
    {days:7, name:'Starter 7 Hari', desc:'Cocok untuk pemula', price:'Rp 15K', popular:false},
    {days:30, name:'Pro 30 Hari', desc:'Paling laris • Hemat 40%', price:'Rp 45K', popular:true},
    {days:90, name:'Sultan 90 Hari', desc:'Untuk power user', price:'Rp 99K', popular:false}
  ];
  document.getElementById('packagesList').innerHTML = pkgs.map(p=>\`
    <div class="pkg" onclick="buyPackage(\${p.days})">
      <div class="pkg-info"><div class="pkg-name">\${p.name} \${p.popular?'<span class="pkg-badge">🔥 POPULER</span>':''}</div><div class="pkg-desc">\${p.desc}</div></div>
      <div style="text-align:right"><div class="pkg-price">\${p.price}</div><div style="font-size:10px;color:var(--blue);font-weight:700;margin-top:4px">BELI →</div></div>
    </div>
  \`).join('');
  
  // Invoice
  if(data.currentInvoice){
    currentInvoice = data.currentInvoice.id;
    document.getElementById('invoiceCard').style.display='block';
    const inv = data.currentInvoice;
    document.getElementById('invoiceBox').innerHTML = \`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <span class="invoice-id">\${inv.id}</span>
        <span class="badge \${inv.status==='waiting_approval'?'badge-orange':'badge-blue'}">\${inv.status.replace('_',' ').toUpperCase()}</span>
      </div>
      <div style="font-size:13px;line-height:1.6">
        <div style="display:flex;justify-content:space-between"><span style="color:var(--muted)">Paket</span><b>\${inv.days} Hari</b></div>
        <div style="display:flex;justify-content:space-between;margin-top:6px"><span style="color:var(--muted)">Total</span><b style="color:var(--blue)">\${inv.amountFormatted||'Rp '+inv.amount}</b></div>
        <div style="display:flex;justify-content:space-between;margin-top:6px"><span style="color:var(--muted)">Status</span><span style="font-weight:700">\${inv.status==='waiting_payment'?'Menunggu Pembayaran':inv.status==='waiting_approval'?'Menunggu ACC Owner':'Diproses'}</span></div>
      </div>
      \${inv.status!=='waiting_approval'?'<div style="margin-top:16px;position:relative"><button class="btn btn-primary">📤 Unggah Bukti Transfer</button><input type="file" accept="image/*" onchange="handleProofUpload(event)" style="position:absolute;inset:0;opacity:0;cursor:pointer"></div><div id="uploadStatus" style="margin-top:10px;font-size:12px;color:var(--muted);text-align:center"></div>':'<div style="margin-top:14px;padding:12px;background:var(--orange-light);border:1px solid #fcd34d;border-radius:12px;font-size:12px;text-align:center;font-weight:600;color:#92400e">⏳ Bukti sudah dikirim - Menunggu ACC Owner</div>'}
    \`;
  }else{
    document.getElementById('invoiceCard').style.display='none';
  }
  
  // History
  if(data.invoices){
    const tbody = document.getElementById('historyTable');
    if(data.invoices.length===0) tbody.innerHTML='<tr><td colspan="4" style="text-align:center;padding:28px"><div class="empty" style="padding:0"><div class="empty-icon">📭</div><div class="empty-title">Belum ada transaksi</div><div class="empty-desc">Paket yang kamu beli akan muncul di sini</div></div></td></tr>';
    else{
      document.getElementById('historyCount').textContent = data.invoices.length;
      tbody.innerHTML = data.invoices.slice(0,10).map(inv=>\`
        <tr><td><span class="invoice-id" style="font-size:11px;padding:4px 8px">\${inv.id.slice(-8)}</span></td><td><b>\${inv.days}H</b></td><td><span class="badge \${inv.status==='paid'?'badge-green':inv.status==='rejected'?'badge-orange':'badge-blue'}" style="font-size:10px">\${inv.status}</span></td><td style="font-size:11px;color:var(--muted)">\${new Date(inv.createdAt).toLocaleDateString('id-ID')}</td></tr>
      \`).join('');
    }
  }
  
  // Spin button
  const spinBtn = document.getElementById('spinBtn');
  if(u.canSpin){ spinBtn.disabled=false; spinBtn.textContent='🎰 Putar Spin Harian'; }
  else{ spinBtn.disabled=true; spinBtn.textContent='✅ Sudah Diklaim Hari Ini'; }
}

function renderOwnerStats(data){
  document.getElementById('o_users').textContent = data.usersValid||0;
  document.getElementById('o_vip').textContent = data.premium||0;
  document.getElementById('o_today').textContent = data.todayOrders||0;
  document.getElementById('o_rev').textContent = data.revenue ? 'Rp '+(data.revenue/1000).toFixed(0)+'K' : 'Rp 0';
}

async function loadOwnerData(){
  if(!isOwnerUser || !isOwnerAuthed()) return;
  try{
    const r = await fetch('/api/stats?user_id='+userId);
    const d = await r.json();
    if(!d.ok) return;
    renderOwnerStats(d);
    const tab = document.querySelector('.owner-tab .tab.active')?.textContent?.toLowerCase()||'pending';
    if(tab.includes('pending')) renderOwnerPending(d);
    else if(tab.includes('user')) renderOwnerUsers(d);
    else if(tab.includes('voucher')) renderOwnerVoucher(d);
  }catch(e){ console.error(e); }
}

function renderOwnerPending(data){
  const pending = data.pendingPayments||[];
  if(pending.length===0){
    document.getElementById('ownerContent').innerHTML='<div class="empty"><div class="empty-icon">✅</div><div class="empty-title">Semua Clear!</div><div class="empty-desc">Tidak ada pembayaran pending saat ini</div></div>';
    return;
  }
  document.getElementById('ownerContent').innerHTML = pending.map(p=>\`
    <div class="card" style="margin-bottom:12px"><div class="card-b">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><div class="invoice-id">\${p.id}</div><div style="font-size:12px;color:var(--muted);margin-top:6px">User: <code>\${p.userId}</code> • \${p.days}H • Rp \${p.amount}</div></div>
        <span class="badge badge-orange">WAITING</span>
      </div>
      <div style="display:flex;gap:8px;margin-top:14px">
        <button class="btn btn-primary" style="flex:1" onclick="ownerAction('\${p.id}','approve')">✅ Setujui</button>
        <button class="btn" style="flex:1" onclick="ownerAction('\${p.id}','reject')">❌ Tolak</button>
      </div>
    </div></div>
  \`).join('');
}
function renderOwnerUsers(data){
  const users = data.recentUsers||[];
  document.getElementById('ownerContent').innerHTML = '<div style="overflow:auto"><table class="table"><thead><tr><th>User</th><th>Nama</th><th>Fix</th><th>Status</th></tr></thead><tbody>'+users.map(u=>\`<tr><td class="mono">\${u.id}</td><td>\${(u.first_name||'User').substring(0,14)}</td><td><b>\${u.totalFix||0}</b></td><td><span class="badge \${u.premiumUntil && u.premiumUntil>Date.now()?'badge-vip':'badge-blue'}" style="font-size:10px">\${u.premiumUntil && u.premiumUntil>Date.now()?'VIP':'FREE'}</span></td></tr>\`).join('')+'</tbody></table></div>';
}
function renderOwnerVoucher(data){
  const codes = data.codes||[];
  document.getElementById('voucherCreateCard').style.display='block';
  if(codes.length===0){
    document.getElementById('ownerContent').innerHTML='<div class="empty"><div class="empty-icon">🎟️</div><div class="empty-title">Belum ada voucher</div><div class="empty-desc">Buat voucher pertama kamu di atas</div></div>';
    return;
  }
  document.getElementById('ownerContent').innerHTML = codes.map(c=>\`
    <div class="pkg"><div class="pkg-info"><div class="pkg-name mono">\${c.code} • \${c.days}H</div><div class="pkg-desc">Kuota: \${c.quota||'∞'} • Terpakai: \${c.used||0} • Tipe: \${c.type||'public'}</div></div><button class="btn btn-small" style="background:var(--red-light);color:var(--red);border-color:var(--red-light)" onclick="deleteVoucher('\${c.code}')">🗑️ Hapus</button></div>
  \`).join('');
}

function switchOwnerTab(tab){
  document.querySelectorAll('.owner-tab .tab').forEach(t=>t.classList.remove('active'));
  event.target.closest('.tab').classList.add('active');
  if(tab==='pending'){ document.getElementById('voucherCreateCard').style.display='none'; loadOwnerData(); }
  else if(tab==='users'){ document.getElementById('voucherCreateCard').style.display='none'; const d=cachedStatsData; if(d) renderOwnerUsers(d); }
  else if(tab==='voucher'){ const d=cachedStatsData; if(d) renderOwnerVoucher(d); else loadOwnerData(); }
  else if(tab==='broadcast'){
    document.getElementById('voucherCreateCard').style.display='none';
    document.getElementById('ownerContent').innerHTML=\`<div class="card-b" style="padding:0"><div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:8px;text-transform:uppercase">Pesan Broadcast ke Semua User</div><textarea id="broadcastText" class="input" style="min-height:100px;resize:none" placeholder="Tulis pesan broadcast yang akan dikirim ke semua pengguna valid..."></textarea><button class="btn btn-primary" style="margin-top:12px" onclick="sendBroadcast()">📢 Kirim ke \${cachedStatsData?.usersValid||0} User</button><div style="font-size:11px;color:var(--muted);margin-top:8px">* Broadcast menggunakan sistem antrian - tidak akan timeout</div></div>\`;
  }
  else if(tab==='revenue'){
    document.getElementById('voucherCreateCard').style.display='none';
    document.getElementById('ownerContent').innerHTML=\`<div class="stat" style="margin-bottom:12px"><div class="stat-v">Rp \${cachedStatsData?.revenue||0}</div><div class="stat-l">Total Revenue</div></div><div style="font-size:12px;color:var(--muted)">Fitur revenue detail akan segera hadir dengan chart premium</div>\`;
  }
}

function switchTab(tab){
  currentTab = tab;
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const active = document.querySelector('.nav-item[data-tab="'+tab+'"]');
  if(active) active.classList.add('active');
  
  if(tab==='owner'){
    if(!isOwnerUser){ showToast('Akses Ditolak','Kamu bukan owner','error'); return; }
    if(!isOwnerAuthed()){ document.getElementById('ownerLogin').style.display='block'; document.getElementById('userPanel').style.display='none'; document.getElementById('ownerPanel').style.display='none'; }
    else{ document.getElementById('ownerLogin').style.display='none'; document.getElementById('userPanel').style.display='none'; document.getElementById('ownerPanel').style.display='block'; loadOwnerData(); }
  }else{
    document.getElementById('ownerLogin').style.display='none'; document.getElementById('ownerPanel').style.display='none'; document.getElementById('userPanel').style.display='block';
    if(tab==='order'){ document.getElementById('packagesCard')?.scrollIntoView({behavior:'smooth'}); }
    if(tab==='profile'){ document.getElementById('profileCard')?.scrollIntoView({behavior:'smooth'}); }
  }
  if(window.Telegram?.WebApp?.HapticFeedback){ try{ Telegram.WebApp.HapticFeedback.impactOccurred('light'); }catch(e){} }
}

function unlockOwner(){
  const pass = document.getElementById('ownerPass').value.trim();
  if(!pass){ showToast('Gagal','Isi password','error'); return; }
  OWNER_PASSWORD = pass;
  sessionStorage.setItem('walzy_owner_pass', pass);
  document.getElementById('ownerLogin').style.display='none';
  document.getElementById('ownerPanel').style.display='block';
  document.getElementById('userPanel').style.display='none';
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.querySelector('.nav-item[data-tab="owner"]').classList.add('active');
  loadOwnerData();
  showToast('Berhasil','Owner studio dibuka','success');
}
function backToUser(){ switchTab('home'); }

async function ownerAction(inv,act){
  try{
    const r=await fetch('/api/owner_action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,action:act,invoice:inv,password:OWNER_PASSWORD})});
    const d=await r.json();
    showToast(act==='approve'?'Disetujui':'Ditolak',d.message,act==='approve'?'success':'error');
    loadOwnerData();
  }catch(e){ showToast('Error',e.message,'error'); }
}
async function createVoucher(){
  const code=document.getElementById('voucherCode').value.trim().toUpperCase();
  const days=parseInt(document.getElementById('voucherDays').value);
  const quota=parseInt(document.getElementById('voucherQuota').value)||0;
  const type=document.getElementById('voucherType').value;
  if(!code||!days) return showToast('Gagal','Isi kode dan hari','error');
  if(code.length<3) return showToast('Gagal','Kode minimal 3 huruf','error');
  try{
    const r=await fetch('/api/create_code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,code,days,quota,type,password:OWNER_PASSWORD})});
    const d=await r.json();
    if(d.ok){ showToast('Berhasil','Voucher '+code+' dibuat','success'); document.getElementById('voucherCode').value=''; document.getElementById('voucherDays').value=''; document.getElementById('voucherQuota').value=''; loadOwnerData(); }
    else showToast('Gagal',d.message,'error');
  }catch(e){ showToast('Error',e.message,'error'); }
}
async function deleteVoucher(code){
  if(!confirm('Hapus voucher '+code+'?')) return;
  try{
    const r=await fetch('/api/delete_code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,code,password:OWNER_PASSWORD})});
    const d=await r.json();
    if(d.ok){ showToast('Dihapus','Voucher '+code+' dihapus','success'); loadOwnerData(); }
    else showToast('Gagal',d.message,'error');
  }catch(e){ showToast('Error',e.message,'error'); }
}
async function sendBroadcast(){
  const text=document.getElementById('broadcastText').value.trim();
  if(!text) return showToast('Gagal','Isi pesan','error');
  if(text.length>1000) return showToast('Gagal','Pesan maksimal 1000 karakter','error');
  try{
    const r=await fetch('/api/broadcast',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,text,password:OWNER_PASSWORD})});
    const d=await r.json();
    if(d.ok){ showToast('Terkirim','Ke '+d.sent+' pengguna','success'); document.getElementById('broadcastText').value=''; }
    else showToast('Gagal',d.message,'error');
  }catch(e){ showToast('Error',e.message,'error'); }
}
async function doSpin(){
  if(!userId) return;
  const btn=document.getElementById('spinBtn');
  btn.disabled=true; btn.textContent='Memutar... 🎰';
  try{
    const r=await fetch('/api/spin?user_id='+userId,{method:'POST'});
    const d=await r.json();
    if(d.ok){ showToast('Hadiah Menang!',d.reward.label+' - '+d.reward.desc,'success'); loadUser(); }
    else{ showToast('Info',d.message,'error'); btn.disabled=d.alreadySpun; btn.textContent=d.alreadySpun?'✅ Sudah Diklaim':'🎰 Putar'; }
  }catch(e){ showToast('Error',e.message,'error'); btn.disabled=false; }
}
async function buyPackage(days){
  if(!userId) return;
  if(window.Telegram?.WebApp?.HapticFeedback){ try{ Telegram.WebApp.HapticFeedback.impactOccurred('medium'); }catch(e){} }
  try{
    const r=await fetch('/api/deposit?user_id='+userId+'&days='+days,{method:'POST'});
    const d=await r.json();
    if(d.ok){
      currentInvoice=d.invoice.id;
      const box=document.getElementById('invoiceBox');
      document.getElementById('invoiceCard').style.display='block';
      box.innerHTML='Invoice: '+d.invoice.id+'<br>Total: '+(d.invoice.amountFormatted||'')+'<br><br><div style="position:relative"><button class="btn btn-primary">📤 Unggah Bukti</button><input type="file" accept="image/*" onchange="handleProofUpload(event)" style="position:absolute;inset:0;opacity:0;cursor:pointer"></div><div id="uploadStatus" style="margin-top:8px;font-size:12px;color:var(--muted);text-align:center"></div>';
      showToast('Invoice Dibuat',d.invoice.id+' berhasil dibuat','success');
      switchTab('order');
      setTimeout(()=>document.getElementById('invoiceCard').scrollIntoView({behavior:'smooth'}),300);
    }else showToast('Gagal',d.message,'error');
  }catch(e){ showToast('Error',e.message,'error'); }
}
function handleProofUpload(evt){
  const file=evt.target.files[0];
  if(!file||!currentInvoice) return;
  if(file.size>5*1024*1024) return showToast('Gagal','File maksimal 5MB','error');
  const statusEl=document.getElementById('uploadStatus');
  statusEl.textContent='⏳ Mengompresi gambar...';
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement('canvas');
      const maxDim=1024;
      let w=img.width,h=img.height;
      if(w>h&&w>maxDim){ h=h*maxDim/w; w=maxDim; } else if(h>maxDim){ w=w*maxDim/h; h=maxDim; }
      canvas.width=w; canvas.height=h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      const base64=canvas.toDataURL('image/jpeg',0.72);
      uploadProof(base64,statusEl);
    };
    img.onerror=()=>{ statusEl.textContent='Gagal memuat gambar'; };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}
async function uploadProof(base64,statusEl){
  statusEl.textContent='⏳ Mengunggah bukti...';
  try{
    const r=await fetch('/api/upload_proof',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:userId,invoice:currentInvoice,image_base64:base64})});
    const d=await r.json();
    if(d.ok){ statusEl.textContent='✅ Terkirim - Menunggu ACC Owner'; showToast('Terkirim','Bukti terkirim, menunggu persetujuan','success'); }
    else{ statusEl.textContent='❌ '+d.message; showToast('Gagal',d.message,'error'); }
  }catch(e){ statusEl.textContent='❌ '+e.message; }
}
function doRedeem(){
  const code=document.getElementById('redeemInput').value.trim().toUpperCase();
  if(!code) return showToast('Gagal','Masukkan kode voucher','error');
  fetch('/api/redeem?user_id='+userId+'&code='+code,{method:'POST'}).then(r=>r.json()).then(d=>{
    if(d.ok){ showToast('Berhasil!','Voucher berhasil ditukar - VIP aktif','success'); document.getElementById('redeemInput').value=''; loadUser(); }
    else showToast('Gagal',d.message,'error');
  });
}
function copyRef(){
  const txt=document.getElementById('refLink')?.textContent||'';
  if(!txt||txt.includes('Memuat')) return;
  if(navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>showToast('Disalin','Tautan referral disalin','success'));
  else{ const ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); showToast('Disalin','Tautan disalin','success'); }
}

// INIT - SUPER FAST
(function init(){
  const tg = window.Telegram?.WebApp;
  if(tg){
    tg.ready(); tg.expand();
    try{ tg.setHeaderColor('#f6f7fb'); tg.setBackgroundColor('#f6f7fb'); }catch(e){}
    const p = tg.initDataUnsafe?.user;
    if(p && p.id){ userId = String(p.id); }
  }
  // Fallback for testing
  if(!userId){
    const urlParams = new URLSearchParams(window.location.search);
    userId = urlParams.get('user_id') || urlParams.get('userId') || '123456';
  }
  
  loadCache();
  loadUser();
  
  setInterval(()=>{ const el=document.getElementById('time'); if(el){ el.textContent=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Jakarta'})+' WIB'; } },1000);
  
  // Smart polling - only when visible & not loading
  let pollInterval = null;
  function startPolling(){
    if(pollInterval) clearInterval(pollInterval);
    pollInterval = setInterval(()=>{
      if(document.hidden || isLoading) return;
      if(isOwnerUser && isOwnerAuthed() && document.getElementById('ownerPanel').style.display!=='none') loadOwnerData();
    },10000); // 10 detik, bukan 3 detik - hemat resource
  }
  startPolling();
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) loadUser(); });
  
  document.getElementById('ownerPass').addEventListener('keypress',e=>{ if(e.key==='Enter') unlockOwner(); });
  hideLoadingScreen(); // fallback hide after 2s max
  setTimeout(hideLoadingScreen,2000);
})();
</script>
</body>
</html>`);
};
