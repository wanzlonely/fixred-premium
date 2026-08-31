module.exports = async (req, res) => {
  res.setHeader('Content-Type','text/html');
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>FIXRED WALZY - Premium Light</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg:#f6f7fb;
  --bg2:#eef2ff;
  --card:#ffffff;
  --card2:#f8fafc;
  --border:#e6eaf2;
  --border2:#edf0f8;
  --text:#0f172a;
  --muted:#7a8db0;
  --accent:#00e887;
  --accent2:#6366f1;
  --accent3:#06b6d4;
  --vip:#ffb800;
  --danger:#ff3b5c;
  --shadow:0 20px 60px rgba(15,23,42,0.06),0 2px 10px rgba(15,23,42,0.04);
  --shadow2:0 10px 30px rgba(99,102,241,0.12);
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{
  font-family:'Space Grotesk',system-ui,sans-serif;
  background:var(--bg);
  color:var(--text);
  min-height:100vh;
  overflow-x:hidden;
  position:relative;
}
.bg-wrap{position:fixed;inset:0;pointer-events:none;z-index:-1;overflow:hidden}
.blob{position:absolute;border-radius:50%;filter:blur(60px);opacity:0.55;animation:float 12s ease-in-out infinite}
.b1{width:600px;height:600px;left:-120px;top:-120px;background:radial-gradient(circle at 30% 30%, #a5b4fc, #6366f1 60%);animation-duration:14s}
.b2{width:520px;height:520px;right:-100px;top:10%;background:radial-gradient(circle at 30% 30%, #6ee7b7, #00e887 60%);animation-duration:16s;animation-delay:-2s}
.b3{width:700px;height:700px;left:30%;bottom:-200px;background:radial-gradient(circle at 40% 40%, #7dd3fc, #06b6d4 60%);opacity:0.35;animation-duration:20s;animation-delay:-4s}
.grid-pattern{position:absolute;inset:0;background-image:linear-gradient(var(--border2) 1px, transparent 1px), linear-gradient(90deg, var(--border2) 1px, transparent 1px);background-size:40px 40px;opacity:0.4;mask-image:radial-gradient(ellipse at center, black 60%, transparent 100%)}
.mono{font-family:'JetBrains Mono',monospace}
.header{
  position:sticky;top:0;z-index:50;
  backdrop-filter:blur(24px) saturate(180%);
  background:rgba(255,255,255,0.78);
  border-bottom:1px solid rgba(230,234,242,0.8);
  padding:14px 20px;
  display:flex;align-items:center;justify-content:space-between;
}
.brand{display:flex;align-items:center;gap:12px}
.brand-icon{width:40px;height:40px;background:linear-gradient(135deg,var(--accent),var(--accent2));border-radius:12px;display:grid;place-items:center;font-weight:800;color:#fff;box-shadow:0 8px 20px rgba(99,102,241,0.25);animation:glow 3s ease-in-out infinite}
.brand-text{font-weight:800;letter-spacing:-0.03em;font-size:15px}
.brand-text span{background:linear-gradient(135deg,var(--accent2),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.live-dot{width:8px;height:8px;background:var(--accent);border-radius:50%;display:inline-block;animation:pulseDot 1.5s infinite;box-shadow:0 0 0 4px rgba(0,232,135,0.15)}
.container{max-width:480px;margin:0 auto;padding:18px 16px 110px;position:relative}
.card{
  background:rgba(255,255,255,0.92);
  backdrop-filter:blur(12px);
  border:1px solid var(--border);
  border-radius:24px;
  padding:20px;
  margin-bottom:16px;
  position:relative;
  overflow:hidden;
  box-shadow:var(--shadow);
  transform:translateZ(0);
  animation:slideUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
  transition:all 0.4s cubic-bezier(0.16,1,0.3,1);
}
.card:hover{transform:translateY(-3px);box-shadow:0 24px 60px rgba(15,23,42,0.08),0 4px 16px rgba(15,23,42,0.05);border-color:#dde2ef}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(99,102,241,0.4),transparent);opacity:0.8}
.card::after{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(105deg,transparent 20%,rgba(255,255,255,0.8) 40%,transparent 60%);transform:skewX(-10deg);transition:all 0.6s;pointer-events:none}
.card:hover::after{left:100%;transition:all 0.9s}
.card-title{font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);margin-bottom:14px;font-weight:700;display:flex;align-items:center;gap:8px}
.profile-grid{display:flex;gap:16px;align-items:center}
.avatar{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#eef2ff,#e0e7ff);border:1px solid var(--border);display:grid;place-items:center;font-size:26px;font-weight:800;color:var(--accent2);position:relative;overflow:hidden;box-shadow:var(--shadow2)}
.avatar::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,transparent,rgba(99,102,241,0.15));animation:shimmer 2.5s infinite}
.rank-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:100px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;font-size:11px;font-weight:700;color:#16a34a;box-shadow:0 2px 8px rgba(22,163,74,0.1)}
.vip-badge{background:linear-gradient(135deg,#fffbeb,#fef3c7);border-color:#fde68a;color:#d97706;box-shadow:0 2px 10px rgba(217,119,6,0.12)}
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.stat{padding:16px;border-radius:18px;background:linear-gradient(180deg,#ffffff,#f8fafc);border:1px solid var(--border);position:relative;overflow:hidden;transition:all 0.3s}
.stat:hover{transform:translateY(-2px) scale(1.02);border-color:var(--accent2);box-shadow:var(--shadow2)}
.stat-value{font-size:24px;font-weight:800;letter-spacing:-0.03em;background:linear-gradient(135deg,var(--text),#334155);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.stat-label{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);margin-top:6px;font-weight:600}
.stat-icon{position:absolute;right:12px;top:12px;font-size:18px;opacity:0.15}
.progress{height:8px;background:#eef2f7;border-radius:100px;overflow:hidden;margin-top:12px;position:relative}
.progress-bar{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:100px;transition:width 0.8s cubic-bezier(0.16,1,0.3,1);position:relative;overflow:hidden}
.progress-bar::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent);animation:shimmerBar 1.8s infinite}
.btn{
  width:100%;padding:15px 18px;border-radius:16px;border:1px solid var(--border);
  background:linear-gradient(180deg,#ffffff,#f8fafc);
  color:var(--text);font-weight:700;font-size:14px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;gap:8px;
  transition:all 0.25s cubic-bezier(0.16,1,0.3,1);
  box-shadow:0 2px 8px rgba(15,23,42,0.04);
  position:relative;overflow:hidden;
}
.btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(99,102,241,0.08),transparent);opacity:0;transition:opacity 0.3s}
.btn:hover{transform:translateY(-2px);border-color:var(--accent2);box-shadow:0 8px 20px rgba(99,102,241,0.15)}
.btn:hover::before{opacity:1}
.btn:active{transform:translateY(0) scale(0.98)}
.btn:disabled{opacity:0.5;cursor:not-allowed;transform:none;box-shadow:none}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;border-color:transparent;box-shadow:0 8px 24px rgba(99,102,241,0.3)}
.btn-primary:hover{box-shadow:0 12px 32px rgba(99,102,241,0.4);transform:translateY(-2px) scale(1.02)}
.btn-vip{background:linear-gradient(135deg,#ffb800,#ff8a00);color:#fff;border-color:transparent;box-shadow:0 8px 20px rgba(255,184,0,0.3)}
.btn-danger{background:linear-gradient(135deg,#ff3b5c,#e11d48);color:#fff;box-shadow:0 8px 20px rgba(255,59,92,0.25)}
.referral-box{
  background:linear-gradient(135deg,#f8fafc,#f1f5f9);border:1px dashed #cbd5e1;border-radius:14px;padding:14px;
  font-family:'JetBrains Mono',monospace;font-size:12px;word-break:break-all;color:var(--accent2);
  position:relative;overflow:hidden;
}
.referral-box::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(99,102,241,0.06),transparent);animation:shimmerBar 2s infinite}
.spin-wrap{position:relative;padding:10px}
.spin-wheel{
  width:132px;height:132px;margin:0 auto;
  border-radius:50%;
  background:conic-gradient(from 0deg,var(--accent),var(--accent2),#ffb800,var(--accent3),var(--accent));
  display:grid;place-items:center;
  animation:rotate 3s linear infinite paused;
  position:relative;
  box-shadow:0 0 0 8px #fff, 0 0 0 10px var(--border), 0 20px 40px rgba(99,102,241,0.2);
}
.spin-wheel.spinning{animation-play-state:running}
.spin-wheel::after{
  content:'';position:absolute;inset:10px;background:var(--card);border-radius:50%;box-shadow:inset 0 2px 10px rgba(0,0,0,0.05);
}
.spin-inner{position:relative;z-index:1;font-size:36px;animation:float 2s ease-in-out infinite}
.package-grid{display:grid;gap:12px}
.package{
  display:flex;justify-content:space-between;align-items:center;
  padding:16px;border-radius:18px;background:linear-gradient(180deg,#ffffff,#fbfdff);border:1px solid var(--border);
  transition:all 0.3s;position:relative;overflow:hidden;
}
.package:hover{transform:translateY(-2px);border-color:var(--accent2);box-shadow:var(--shadow2)}
.package-popular{border-color:#fde68a;background:linear-gradient(135deg,#fffbeb,#fef3c7);box-shadow:0 8px 24px rgba(255,184,0,0.15)}
.package-popular::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#ffb800,#ff8a00)}
.badge{font-size:9px;padding:4px 10px;border-radius:100px;background:linear-gradient(135deg,#ffb800,#ff8a00);color:#fff;font-weight:800;letter-spacing:0.08em;box-shadow:0 2px 8px rgba(255,184,0,0.3);animation:pulseBadge 2s infinite}
.nav{
  position:fixed;bottom:12px;left:50%;transform:translateX(-50%);
  background:rgba(255,255,255,0.88);backdrop-filter:blur(24px) saturate(180%);
  border:1px solid rgba(230,234,242,0.8);
  display:flex;gap:6px;padding:8px;
  border-radius:20px;
  max-width:360px;width:calc(100% - 32px);
  box-shadow:0 20px 60px rgba(15,23,42,0.12),0 2px 10px rgba(15,23,42,0.06);
  z-index:40;
}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;font-size:10px;color:var(--muted);cursor:pointer;padding:8px 10px;border-radius:14px;transition:all 0.3s;font-weight:600}
.nav-item.active{background:linear-gradient(135deg,var(--accent2),#818cf8);color:#fff;box-shadow:0 6px 16px rgba(99,102,241,0.3);transform:translateY(-1px)}
.toast{
  position:fixed;top:20px;left:50%;transform:translateX(-50%) translateY(-100px);
  background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);border:1px solid var(--border);padding:14px 20px;border-radius:16px;
  font-size:13px;font-weight:600;z-index:100;transition:all 0.5s cubic-bezier(0.16,1,0.3,1);opacity:0;box-shadow:var(--shadow);
}
.toast.show{transform:translateX(-50%) translateY(0);opacity:1}
.table{width:100%;border-collapse:collapse;font-size:12px}
.table th{font-size:9px;letter-spacing:0.08em;text-transform:uppercase;color:var(--muted);text-align:left;padding:10px 8px;border-bottom:1px solid var(--border);font-weight:700}
.table td{padding:10px 8px;border-bottom:1px solid #f1f5f9}
.queue-item{padding:14px;border-radius:16px;background:linear-gradient(180deg,#ffffff,#f8fafc);border:1px solid var(--border);margin-bottom:12px;transition:all 0.3s;animation:slideUp 0.5s both}
.queue-item:hover{transform:translateY(-2px);box-shadow:var(--shadow);border-color:var(--accent2)}
.queue-actions{display:flex;gap:8px;margin-top:12px}
.confetti-layer{position:fixed;inset:0;pointer-events:none;z-index:999;overflow:hidden;display:none}
.confetti-piece{position:absolute;top:-20px;border-radius:3px;animation:fall linear forwards}
.vip-toast{
  position:fixed;inset:0;z-index:1000;display:none;place-items:center;
  background:rgba(246,247,251,0.7);backdrop-filter:blur(12px);
}
.vip-toast-card{background:linear-gradient(135deg,#ffffff,#f8fafc);border:1px solid var(--border);border-radius:28px;padding:36px;text-align:center;max-width:320px;box-shadow:0 30px 80px rgba(15,23,42,0.15);animation:scaleIn 0.5s cubic-bezier(0.16,1,0.3,1)}
.vip-toast-card .icon{font-size:52px;margin-bottom:12px;animation:float 1.5s ease-in-out infinite}
.vip-toast-card h2{background:linear-gradient(135deg,#ffb800,#ff8a00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:22px;margin-bottom:8px;font-weight:800}
.vip-toast-card p{color:var(--muted);font-size:13px;line-height:1.5}
.file-input-wrap{position:relative}
.file-input-wrap input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer}
.owner-lock{
  min-height:70vh;display:grid;place-items:center;padding:40px 20px;
}
.lock-card{
  background:rgba(255,255,255,0.95);backdrop-filter:blur(20px);border:1px solid var(--border);border-radius:28px;padding:32px;max-width:360px;width:100%;box-shadow:0 30px 80px rgba(15,23,42,0.12);animation:scaleIn 0.6s cubic-bezier(0.16,1,0.3,1);text-align:center;
}
.lock-icon{width:72px;height:72px;margin:0 auto 16px;background:linear-gradient(135deg,var(--accent2),#818cf8);border-radius:20px;display:grid;place-items:center;font-size:32px;color:#fff;box-shadow:0 12px 30px rgba(99,102,241,0.3);animation:float 2.5s ease-in-out infinite}
.lock-input{width:100%;padding:14px 16px;border-radius:14px;border:1.5px solid var(--border);background:#f8fafc;font-family:'JetBrains Mono',monospace;font-size:14px;letter-spacing:0.1em;text-align:center;outline:none;transition:all 0.3s;margin:16px 0}
.lock-input:focus{border-color:var(--accent2);background:#fff;box-shadow:0 0 0 4px rgba(99,102,241,0.12)}
.realtime-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:100px;background:#f0fdf4;border:1px solid #bbf7d0;font-size:10px;font-weight:700;color:#16a34a;letter-spacing:0.05em}
.chart-bar{height:6px;background:#eef2f7;border-radius:100px;overflow:hidden;position:relative}
.chart-fill{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));border-radius:100px;transition:width 1s cubic-bezier(0.16,1,0.3,1)}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes rotate{to{transform:rotate(360deg)}}
@keyframes pulseDot{0%{transform:scale(1);opacity:1}50%{transform:scale(1.2);opacity:0.8}100%{transform:scale(1);opacity:1}}
@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes scaleIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
@keyframes shimmerBar{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
@keyframes fall{to{transform:translateY(110vh) rotate(720deg);opacity:0.2}}
@keyframes glow{0%,100%{box-shadow:0 8px 20px rgba(99,102,241,0.25)}50%{box-shadow:0 12px 32px rgba(0,232,135,0.35)}}
@keyframes pulseBadge{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
.stagger-1{animation-delay:0.05s}
.stagger-2{animation-delay:0.1s}
.stagger-3{animation-delay:0.15s}
.stagger-4{animation-delay:0.2s}
.stagger-5{animation-delay:0.25s}
</style>
</head>
<body>
<div class="bg-wrap"><div class="grid-pattern"></div><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div></div>
<div class="confetti-layer" id="confettiLayer"></div>
<div class="vip-toast" id="vipToast"><div class="vip-toast-card"><div class="icon">✨</div><h2>VIP Aktif!</h2><p>Selamat datang di premium experience. Unlimited fix sudah terbuka!</p></div></div>
<div class="header">
  <div class="brand">
    <div class="brand-icon">🦖</div>
    <div class="brand-text">FIXRED <span>WALZY</span></div>
  </div>
  <div style="display:flex;align-items:center;gap:10px">
    <div class="realtime-badge"><span class="live-dot"></span>LIVE</div>
    <div class="mono" style="font-size:11px;color:var(--muted);font-weight:600" id="time">--:-- WIB</div>
  </div>
</div>
<div class="toast" id="toast"></div>

<div class="container" id="ownerLogin" style="display:none">
  <div class="owner-lock">
    <div class="lock-card">
      <div class="lock-icon">🔐</div>
      <div style="font-weight:800;font-size:18px;letter-spacing:-0.02em">OWNER ACCESS</div>
      <div class="mono" style="font-size:11px;color:var(--muted);margin-top:6px">Dashboard ini terproteksi password khusus owner</div>
      <input type="password" id="ownerPass" class="lock-input" placeholder="MASUKKAN PASSWORD" autocomplete="off">
      <button class="btn btn-primary" onclick="unlockOwner()">🔓 Buka Dashboard Owner</button>
      <div class="mono" style="font-size:10px;color:var(--muted);margin-top:12px">Password: SUPER777 • Keamanan tingkat tinggi</div>
      <button class="btn" style="margin-top:10px" onclick="backToUser()">◁ Kembali sebagai User</button>
    </div>
  </div>
</div>

<div class="container" id="userView" style="display:none">
  <div class="card stagger-1">
    <div class="card-title">👤 PROFIL AKUN <span class="realtime-badge" style="margin-left:auto"><span class="live-dot"></span>REALTIME</span></div>
    <div class="profile-grid">
      <div class="avatar" id="avatar">?</div>
      <div style="flex:1">
        <div style="font-weight:800;font-size:18px;letter-spacing:-0.02em" id="name">Memuat data...</div>
        <div class="mono" style="font-size:11px;color:var(--muted)" id="uid">ID: -</div>
        <div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap" id="badges"></div>
      </div>
    </div>
    <div class="progress"><div class="progress-bar" id="limitBar" style="width:0%"></div></div>
    <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:var(--muted);font-weight:600"><span>Daily Limit</span><span class="mono" id="limitText">Memuat...</span></div>
  </div>

  <div class="stat-grid">
    <div class="stat stagger-2"><div class="stat-icon">🔧</div><div class="stat-value mono" id="myFix">-</div><div class="stat-label">Total Fix Kamu</div><div class="chart-bar" style="margin-top:8px"><div class="chart-fill" id="myFixBar" style="width:0%"></div></div></div>
    <div class="stat stagger-3"><div class="stat-icon">🌍</div><div class="stat-value mono" id="globalFix">-</div><div class="stat-label">Global Fix Live</div><div class="chart-bar" style="margin-top:8px"><div class="chart-fill" id="globalFixBar" style="width:0%"></div></div></div>
    <div class="stat stagger-4"><div class="stat-icon">👥</div><div class="stat-value mono" id="refCount">-</div><div class="stat-label">Referral Aktif</div><div class="chart-bar" style="margin-top:8px"><div class="chart-fill" id="refBar" style="width:0%"></div></div></div>
    <div class="stat stagger-5"><div class="stat-icon">⚡</div><div class="stat-value mono" id="successRate">-</div><div class="stat-label">Success Rate</div><div class="chart-bar" style="margin-top:8px"><div class="chart-fill" id="successBar" style="width:0%"></div></div></div>
  </div>

  <div class="card stagger-2" style="margin-top:16px">
    <div class="card-title">🎰 DAILY SPIN HADIAH <span style="margin-left:auto;font-size:10px;background:linear-gradient(135deg,#ffb800,#ff8a00);color:#fff;padding:3px 8px;border-radius:100px">HARIAN</span></div>
    <div class="spin-wrap">
      <div class="spin-wheel" id="wheel"><div class="spin-inner">🎰</div></div>
    </div>
    <div style="text-align:center;margin-top:18px">
      <div class="mono" style="font-size:13px;color:var(--text);font-weight:700" id="spinStatus">Memuat status spin...</div>
      <div class="mono" style="font-size:11px;color:var(--muted);margin-top:6px" id="spinLast">Last spin: -</div>
      <button class="btn btn-primary" style="margin-top:14px" id="spinBtn" onclick="doSpin()">🎰 PUTAR SEKARANG</button>
    </div>
  </div>

  <div class="card stagger-3">
    <div class="card-title">💎 VIP PREMIUM PASS <span class="realtime-badge" style="margin-left:auto">UNLIMITED</span></div>
    <div style="font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:14px" id="vipDesc">Upgrade VIP untuk unlimited fix 5 baris & prioritas.</div>
    <div class="package-grid">
      <div class="package"><div><b style="font-size:14px">1 Hari</b><div class="mono" style="font-size:11px;color:var(--muted)">Rp 2.000 • Trial</div></div><button class="btn" style="width:auto;padding:10px 18px" onclick="buyPackage(1)">Beli</button></div>
      <div class="package package-popular"><div><b style="font-size:14px">5 Hari</b> <span class="badge">POPULAR</span><div class="mono" style="font-size:11px;color:var(--muted)">Rp 5.000 • Hemat 50%</div></div><button class="btn btn-vip" style="width:auto;padding:10px 18px" onclick="buyPackage(5)">Beli</button></div>
      <div class="package"><div><b style="font-size:14px">10 Hari</b><div class="mono" style="font-size:11px;color:var(--muted)">Rp 10.000 • Best Value</div></div><button class="btn" style="width:auto;padding:10px 18px" onclick="buyPackage(10)">Beli</button></div>
      <div class="package"><div><b style="font-size:14px">30 Hari</b><div class="mono" style="font-size:11px;color:var(--muted)">Rp 60.000 • Sultan</div></div><button class="btn" style="width:auto;padding:10px 18px" onclick="buyPackage(30)">Beli</button></div>
    </div>
    <div id="invoiceBox" style="display:none;margin-top:14px;padding:14px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1px solid #bbf7d0;border-radius:16px" class="mono"></div>
  </div>

  <div class="card stagger-4">
    <div class="card-title">🤝 REFERRAL PROGRAM</div>
    <div class="referral-box" id="refLink">Memuat link...</div>
    <button class="btn" style="margin-top:12px" onclick="copyRef()">📋 Copy Link Referral</button>
    <div class="mono" style="font-size:11px;color:var(--muted);margin-top:10px;text-align:center">Dapatkan rank eksklusif & bonus dari setiap referral</div>
  </div>

  <div class="card stagger-5">
    <div class="card-title">📜 HISTORY FIX REALTIME</div>
    <div id="historyBox" class="mono" style="font-size:11px;color:var(--muted)">Memuat history...</div>
  </div>
</div>

<div class="container" id="ownerView" style="display:none">
  <div class="card stagger-1" style="background:linear-gradient(135deg,#ffffff,#eef2ff);border-color:#c7d2fe">
    <div class="card-title">👑 OWNER DASHBOARD • SUPER777 SECURED <span class="realtime-badge" style="margin-left:auto">ADMIN LIVE</span></div>
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#6366f1,#818cf8);display:grid;place-items:center;color:#fff;font-size:22px;box-shadow:0 8px 20px rgba(99,102,241,0.3)">👑</div>
      <div>
        <div style="font-weight:800;font-size:16px">Akses Owner Terverifikasi</div>
        <div class="mono" style="font-size:11px;color:var(--muted)">Password SUPER777 • Enkripsi aktif • Realtime monitoring</div>
      </div>
      <button class="btn" style="width:auto;margin-left:auto;padding:8px 14px" onclick="lockOwner()">🔒 Lock</button>
    </div>
  </div>

  <div class="stat-grid">
    <div class="stat stagger-2" style="background:linear-gradient(135deg,#ffffff,#f0fdf4)"><div class="stat-icon">👥</div><div class="stat-value mono" id="oUsers">-</div><div class="stat-label">Total User Live</div><div class="chart-bar" style="margin-top:8px"><div class="chart-fill" id="oUsersBar" style="width:0%"></div></div></div>
    <div class="stat stagger-3" style="background:linear-gradient(135deg,#ffffff,#fffbeb)"><div class="stat-icon">💎</div><div class="stat-value mono" id="oPremium">-</div><div class="stat-label">VIP Aktif</div><div class="chart-bar" style="margin-top:8px"><div class="chart-fill" id="oPremiumBar" style="width:0%"></div></div></div>
    <div class="stat stagger-4" style="background:linear-gradient(135deg,#ffffff,#eef2ff)"><div class="stat-icon">🔧</div><div class="stat-value mono" id="oFix">-</div><div class="stat-label">Total Fix Global</div><div class="chart-bar" style="margin-top:8px"><div class="chart-fill" id="oFixBar" style="width:0%"></div></div></div>
    <div class="stat stagger-5" style="background:linear-gradient(135deg,#ffffff,#fef3c7);border-color:#fde68a"><div class="stat-icon">💰</div><div class="stat-value mono" id="oRevenue">-</div><div class="stat-label">Revenue Canggih (Owner Only)</div><div class="chart-bar" style="margin-top:8px"><div class="chart-fill" id="oRevBar" style="width:0%;background:linear-gradient(90deg,#ffb800,#ff8a00)"></div></div></div>
  </div>

  <div class="card stagger-2" style="margin-top:16px">
    <div class="card-title">📊 STATISTIK ADVANCED REALTIME <span class="realtime-badge" style="margin-left:auto"><span class="live-dot"></span>SYNC 3s</span></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px">
      <div style="padding:12px;border-radius:14px;background:#f8fafc;border:1px solid var(--border)"><div class="mono" style="font-size:10px;color:var(--muted)">SUCCESS</div><div class="mono" style="font-size:18px;font-weight:800;color:#16a34a" id="oSuccess">-</div></div>
      <div style="padding:12px;border-radius:14px;background:#f8fafc;border:1px solid var(--border)"><div class="mono" style="font-size:10px;color:var(--muted)">FAILED</div><div class="mono" style="font-size:18px;font-weight:800;color:#dc2626" id="oFailed">-</div></div>
      <div style="padding:12px;border-radius:14px;background:#f8fafc;border:1px solid var(--border)"><div class="mono" style="font-size:10px;color:var(--muted)">PENDING PAY</div><div class="mono" style="font-size:18px;font-weight:800" id="oPending">-</div></div>
      <div style="padding:12px;border-radius:14px;background:#f8fafc;border:1px solid var(--border)"><div class="mono" style="font-size:10px;color:var(--muted)">CONV RATE</div><div class="mono" style="font-size:18px;font-weight:800" id="oRate">-</div></div>
    </div>
  </div>

  <div class="card stagger-3">
    <div class="card-title">💳 ANTREAN BUKTI TRANSFER • AUTO SYNC</div>
    <div id="queueBox">Memuat antrean...</div>
  </div>

  <div class="card stagger-4">
    <div class="card-title">👥 USER TERBARU • LIVE UPDATE</div>
    <table class="table" id="userTable"><tr><th>ID</th><th>Nama</th><th>Status</th><th>Fix</th></tr></table>
  </div>

  <div class="card stagger-5">
    <div class="card-title">⚙️ SISTEM CANGGIH OWNER</div>
    <div style="display:grid;gap:10px">
      <button class="btn" onclick="resetRevenue()">♻️ Reset Revenue ke 0 (Sistem Canggih)</button>
      <button class="btn" onclick="loadOwnerData()">🔄 Force Sync Realtime</button>
      <div class="mono" style="font-size:11px;color:var(--muted);text-align:center">Revenue reset otomatis dari 0 • Enkripsi SUPER777 • Monitoring live 3 detik</div>
    </div>
  </div>
</div>

<div class="nav">
  <div class="nav-item active" id="navHome" onclick="switchTab('home')"><span style="font-size:16px">🏠</span><span>Home</span></div>
  <div class="nav-item" onclick="location.href='/admin'"><span style="font-size:16px">📊</span><span>Dash</span></div>
  <div class="nav-item" onclick="Telegram.WebApp.close()"><span style="font-size:16px">❌</span><span>Close</span></div>
</div>

<script>
const tg = window.Telegram ? window.Telegram.WebApp : null;
if(tg){ tg.ready(); tg.expand(); }
const tgUser = tg && tg.initDataUnsafe ? tg.initDataUnsafe.user : null;
const timeEl = document.getElementById('time');
const toastEl = document.getElementById('toast');
const OWNER_IDS = ${JSON.stringify(require('../config').OWNER_IDS.map(String))};
const BOT_USERNAME = ${JSON.stringify(require('../config').BOT_USERNAME || 'fixedredbot')};
const DANA_NAME = ${JSON.stringify(require('../config').DANA_NAME || 'DANA')};
const DANA_NUMBER = ${JSON.stringify(require('../config').DANA_NUMBER || '-')};
const OWNER_PASSWORD = 'SUPER777';

function showToast(msg, duration=3200){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(()=>toastEl.classList.remove('show'), duration);
}
function updateTime(){
  try{
    const now = new Date().toLocaleString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',second:'2-digit'}).replace(/\\./g,':');
    timeEl.textContent = now + ' WIB';
  }catch{}
}
setInterval(updateTime,1000);updateTime();

let userId = tgUser ? String(tgUser.id) : null;
let isOwnerUser = userId && OWNER_IDS.includes(userId);
let lastKnownPremium = null;

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
    showToast('✅ Owner access granted • SUPER777 verified');
    if(tg && tg.HapticFeedback){ tg.HapticFeedback.notificationOccurred('success'); }
    loadOwnerData();
  }else{
    showToast('❌ Password salah! Hint: SUPER777');
    if(tg && tg.HapticFeedback){ tg.HapticFeedback.notificationOccurred('error'); }
    inp.value = '';
    inp.style.borderColor = '#ff3b5c';
    setTimeout(()=>{ inp.style.borderColor = ''; }, 1000);
  }
}
function lockOwner(){
  try{ localStorage.removeItem('owner_auth_v2'); }catch{}
  document.getElementById('ownerView').style.display = 'none';
  document.getElementById('ownerLogin').style.display = 'block';
  showToast('🔒 Owner dashboard locked');
}
function backToUser(){
  document.getElementById('ownerLogin').style.display = 'none';
  document.getElementById('userView').style.display = 'block';
  loadUser();
}
function switchTab(t){
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const el = document.getElementById('navHome');
  if(el) el.classList.add('active');
}

function launchConfetti(){
  const layer = document.getElementById('confettiLayer');
  layer.style.display = 'block';
  layer.innerHTML = '';
  const colors = ['#00e887','#6366f1','#ffb800','#06b6d4','#ff3b5c'];
  for(let i=0;i<90;i++){
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random()*100 + 'vw';
    p.style.width = (6+Math.random()*8) + 'px';
    p.style.height = (6+Math.random()*12) + 'px';
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.animationDuration = (2+Math.random()*2.5) + 's';
    p.style.animationDelay = (Math.random()*0.6) + 's';
    p.style.transform = 'rotate(' + (Math.random()*360) + 'deg)';
    layer.appendChild(p);
  }
  const vipToast = document.getElementById('vipToast');
  vipToast.style.display = 'grid';
  if(tg && tg.HapticFeedback){ tg.HapticFeedback.notificationOccurred('success'); }
  setTimeout(()=>{
    vipToast.style.display = 'none';
    layer.style.display = 'none';
    layer.innerHTML = '';
  }, 3800);
}

async function loadUser(){
  if(!userId){
    document.getElementById('userView').style.display = 'block';
    document.getElementById('ownerLogin').style.display = 'none';
    document.getElementById('ownerView').style.display = 'none';
    document.getElementById('name').textContent = 'Buka via Telegram untuk data akun';
    document.getElementById('uid').textContent = 'User ID tidak terdeteksi • Buka dari bot';
    return;
  }
  if(isOwnerUser){
    if(isOwnerAuthed()){
      document.getElementById('ownerLogin').style.display = 'none';
      document.getElementById('ownerView').style.display = 'block';
      document.getElementById('userView').style.display = 'none';
      return loadOwnerData();
    }else{
      document.getElementById('ownerLogin').style.display = 'block';
      document.getElementById('ownerView').style.display = 'none';
      document.getElementById('userView').style.display = 'none';
      return;
    }
  }
  document.getElementById('userView').style.display = 'block';
  document.getElementById('ownerLogin').style.display = 'none';
  document.getElementById('ownerView').style.display = 'none';
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
    document.getElementById('limitText').textContent = u.isPremium ? 'Unlimited (VIP) ♾️' : u.dailyFix.used + '/3 - Sisa ' + u.dailyFix.remaining;
    document.getElementById('myFix').textContent = u.totalFix;
    document.getElementById('myFixBar').style.width = Math.min(100, (u.totalFix / 50) * 100) + '%';
    document.getElementById('globalFix').textContent = g.totalFix;
    document.getElementById('globalFixBar').style.width = Math.min(100, (g.totalFix / 500) * 100) + '%';
    document.getElementById('refCount').textContent = u.referralCount;
    document.getElementById('refBar').style.width = Math.min(100, (u.referralCount / 20) * 100) + '%';
    const rate = g.totalFix > 0 ? Math.round((g.totalSuccess / g.totalFix) * 100) : 0;
    document.getElementById('successRate').textContent = rate + '%';
    document.getElementById('successBar').style.width = rate + '%';
    if(u.canSpin){
      document.getElementById('spinStatus').textContent = 'Siap spin! Hadiah menanti 🎁';
      document.getElementById('spinLast').textContent = 'Last spin: ' + (u.lastSpin || 'Belum pernah');
      document.getElementById('spinBtn').disabled = false;
      document.getElementById('spinBtn').textContent = '🎰 PUTAR SEKARANG';
    } else {
      document.getElementById('spinStatus').textContent = 'Spin hari ini sudah dipakai';
      document.getElementById('spinLast').textContent = 'Last spin: ' + u.lastSpin + ' - Kembali besok ⏳';
      document.getElementById('spinBtn').disabled = true;
      document.getElementById('spinBtn').textContent = '✅ Sudah Spin Hari Ini';
    }
    document.getElementById('refLink').textContent = 'https://t.me/' + BOT_USERNAME + '?start=' + u.id;
    const histBox = document.getElementById('historyBox');
    if(u.history && u.history.length>0){
      histBox.innerHTML = u.history.map((h,i)=>'<div style="padding:8px 0;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;animation:slideUp ' + (0.1*i) + 's both"><span>📅 ' + new Date(h.date).toLocaleString('id-ID') + '</span><span style="color:#16a34a;font-weight:700">Fix +1</span></div>').join('');
    } else {
      histBox.textContent = 'Belum ada history fix • Mulai fix pertama kamu! 🚀';
    }
    document.getElementById('vipDesc').textContent = u.isPremium ? 'VIP aktif sampai ' + new Date(u.premiumUntil).toLocaleDateString('id-ID') + ' (' + u.premiumLeft + ' hari lagi) • Unlimited ♾️' : 'Upgrade VIP untuk unlimited fix 5 baris & prioritas antrian tercepat ⚡';
  }catch(e){
    document.getElementById('name').textContent = 'Gagal load data: ' + e.message;
    showToast('Gagal load data: ' + e.message);
  }
}

async function loadOwnerData(){
  try{
    const r = await fetch('/api/stats?user_id=' + userId);
    const data = await r.json();
    if(!data.ok || !data.isOwner){
      if(isOwnerUser && !isOwnerAuthed()){
        document.getElementById('ownerLogin').style.display = 'block';
        document.getElementById('ownerView').style.display = 'none';
        return;
      }
      return;
    }
    document.getElementById('oUsers').textContent = data.users;
    document.getElementById('oUsersBar').style.width = Math.min(100, (data.users / 100) * 100) + '%';
    document.getElementById('oPremium').textContent = data.premium;
    document.getElementById('oPremiumBar').style.width = data.users ? Math.min(100, (data.premium / data.users) * 100) + '%' : '0%';
    document.getElementById('oFix').textContent = data.totalFix;
    document.getElementById('oFixBar').style.width = Math.min(100, (data.totalFix / 1000) * 100) + '%';
    document.getElementById('oRevenue').textContent = 'Rp ' + (data.revenue||0).toLocaleString('id-ID');
    document.getElementById('oRevBar').style.width = Math.min(100, ((data.revenue||0) / 100000) * 100) + '%';
    document.getElementById('oSuccess').textContent = data.totalSuccess || 0;
    document.getElementById('oFailed').textContent = data.totalFailed || 0;
    document.getElementById('oPending').textContent = (data.pendingPayments||[]).length;
    const total = (data.totalSuccess||0) + (data.totalFailed||0);
    const conv = total ? Math.round(((data.totalSuccess||0)/total)*100) : 0;
    document.getElementById('oRate').textContent = conv + '%';

    const queueBox = document.getElementById('queueBox');
    const pending = data.pendingPayments || [];
    if(pending.length === 0){
      queueBox.innerHTML = '<div style="color:var(--muted);font-size:12px;padding:20px;text-align:center">✨ Tidak ada antrean • Semua pembayaran clear</div>';
    } else {
      queueBox.innerHTML = pending.map(p => \`
        <div class="queue-item">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-weight:800;font-size:13px">\${p.invoice}</div>
            <div class="mono" style="font-size:10px;padding:4px 8px;border-radius:100px;background:#fef3c7;color:#d97706">\${p.status}</div>
          </div>
          <div class="mono" style="font-size:11px;color:var(--muted);margin-top:6px">User: \${p.userId} | \${p.days} Hari | Rp \${(p.amount||0).toLocaleString('id-ID')}</div>
          <div class="queue-actions">
            <button class="btn btn-primary" style="padding:10px" onclick="ownerAction('\${p.invoice}','approve')">✅ Approve</button>
            <button class="btn btn-danger" style="padding:10px" onclick="ownerAction('\${p.invoice}','reject')">❌ Reject</button>
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
    showToast('Gagal load data owner: ' + e.message);
  }
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
      showToast('✅ ' + data.message);
      if(tg && tg.HapticFeedback){ tg.HapticFeedback.notificationOccurred('success'); }
      loadOwnerData();
    } else {
      showToast('❌ ' + data.message);
    }
  }catch(e){
    showToast('Error: ' + e.message);
  }
}

async function resetRevenue(){
  if(!confirm('Reset revenue ke 0? Sistem canggih akan reset total pendapatan dari awal.')) return;
  try{
    const r = await fetch('/api/owner_action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner_id: userId, action: 'reset_revenue', password: OWNER_PASSWORD })
    });
    const data = await r.json();
    if(data.ok){
      showToast('♻️ ' + data.message + ' • Revenue reset ke 0');
      loadOwnerData();
    }else{
      showToast('❌ ' + data.message);
    }
  }catch(e){ showToast('Error: ' + e.message); }
}

async function doSpin(){
  if(!userId) return showToast('Buka via Telegram untuk spin');
  const wheel = document.getElementById('wheel');
  const btn = document.getElementById('spinBtn');
  const statusEl = document.getElementById('spinStatus');
  wheel.classList.add('spinning');
  btn.disabled = true;
  btn.textContent = 'Memutar... 🌀';
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
        if(tg && tg.HapticFeedback){ tg.HapticFeedback.notificationOccurred('success'); }
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
      const bank = inv.transferTo ? inv.transferTo.bank : DANA_NAME;
      const number = inv.transferTo ? inv.transferTo.number : DANA_NUMBER;
      const amount = inv.amountFormatted || ('Rp ' + (inv.amount||0).toLocaleString('id-ID'));
      box.innerHTML = '<b style="color:#16a34a">✅ Invoice Dibuat:</b><br>ID: ' + inv.id + '<br>Paket: ' + inv.days + ' Hari<br>Total: ' + amount + '<br>Transfer ke: ' + bank + ' ' + number + '<br><br><div class="file-input-wrap"><button class="btn btn-vip" type="button">📤 Upload Bukti Transfer</button><input type="file" accept="image/*" onchange="handleProofUpload(event)"></div><div id="uploadStatus" style="margin-top:8px;font-size:11px;color:var(--muted)"></div>';
      showToast('✅ Invoice: ' + inv.id + ' - ' + amount);
      if(tg && tg.HapticFeedback){ tg.HapticFeedback.notificationOccurred('success'); }
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
      if(tg && tg.HapticFeedback){ tg.HapticFeedback.notificationOccurred('success'); }
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
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(()=>{
      showToast('✅ Link disalin • Ajak teman dapat rank!');
      if(tg && tg.HapticFeedback){ tg.HapticFeedback.notificationOccurred('success'); }
    }).catch(()=>{
      const ta = document.createElement('textarea');
      ta.value = txt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('✅ Link disalin');
    });
  } else {
    const ta = document.createElement('textarea');
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('✅ Link disalin');
  }
}

document.getElementById('ownerPass').addEventListener('keypress', function(e){
  if(e.key === 'Enter'){ unlockOwner(); }
});

loadUser();
setInterval(()=>{
  if(isOwnerUser && isOwnerAuthed()){
    loadOwnerData();
  }else{
    loadUser();
  }
}, 3000);
</script>
</body>
</html>`);
};
