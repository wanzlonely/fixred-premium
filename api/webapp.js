module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#07080f">
<title>WALZY STORE • Premium</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{--bg:#07080f;--bg2:#0d0f1c;--card:rgba(255,255,255,0.045);--card2:rgba(255,255,255,0.07);--border:rgba(255,255,255,0.08);--border2:rgba(255,255,255,0.13);--text:#f8fafc;--muted:#94a3b8;--dim:#64748b;--violet:#8b5cf6;--blue:#3b82f6;--cyan:#06b6d4;--pink:#ec4899;--green:#22c55e;--grad:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#ec4899 100%);--grad2:linear-gradient(135deg,#3b82f6 0%,#06b6d4 100%);--shadow:0 20px 60px rgba(0,0,0,0.55),0 0 0 1px var(--border);--glow:0 0 40px rgba(139,92,246,0.28)}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:'Inter',-apple-system,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;min-height:100dvh;overflow-x:hidden;-webkit-font-smoothing:antialiased;position:relative}
.mesh{position:fixed;inset:0;z-index:-2;overflow:hidden;pointer-events:none}
.mesh:before{content:'';position:absolute;width:140%;height:140%;top:-20%;left:-20%;background:radial-gradient(600px 600px at 18% 12%,rgba(99,102,241,0.2) 0%,transparent 70%),radial-gradient(800px 800px at 82% 18%,rgba(139,92,246,0.18) 0%,transparent 60%),radial-gradient(700px 700px at 52% 92%,rgba(6,182,214,0.14) 0%,transparent 60%),radial-gradient(520px 520px at 88% 78%,rgba(236,72,153,0.12) 0%,transparent 65%);animation:meshMove 22s ease-in-out infinite alternate}
.mesh:after{content:'';position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")}
@keyframes meshMove{0%{transform:translate(0,0) scale(1)}100%{transform:translate(-3%,2%) scale(1.06)}}
.ico{width:20px;height:20px;flex-shrink:0;display:inline-block;stroke-width:2}
.ico-sm{width:16px;height:16px}
.ico-lg{width:26px;height:26px}
.ico-xl{width:36px;height:36px}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes pulseGlow{0%,100%{filter:drop-shadow(0 0 6px rgba(139,92,246,0.45))}50%{filter:drop-shadow(0 0 14px rgba(139,92,246,0.9))}}
@keyframes shimmerSlide{0%{transform:translateX(-120%)}100%{transform:translateX(220%)}}
@keyframes spinSlow{to{transform:rotate(360deg)}}
@keyframes ringPulse{0%{transform:scale(0.8);opacity:1}100%{transform:scale(1.45);opacity:0}}
@keyframes barGrow{0%{transform:scaleY(0.15)}100%{transform:scaleY(1)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes strokeAnim{0%{stroke-dashoffset:80}100%{stroke-dashoffset:0}}
.anim-float{animation:float 3s ease-in-out infinite}
.anim-glow{animation:pulseGlow 2.6s ease-in-out infinite}
.anim-spin{animation:spinSlow 5s linear infinite}
.anim-bar{transform-origin:bottom;animation:barGrow .9s cubic-bezier(.16,1,.3,1) forwards}
.header{position:sticky;top:0;z-index:50;height:66px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;backdrop-filter:blur(28px) saturate(180%);-webkit-backdrop-filter:blur(28px) saturate(180%);background:rgba(7,8,15,0.72);border-bottom:1px solid var(--border)}
.brand{display:flex;align-items:center;gap:12px}
.brand-logo{width:42px;height:42px;border-radius:13px;background:var(--grad);display:grid;place-items:center;box-shadow:0 10px 24px rgba(99,102,241,0.38),inset 0 1px 0 rgba(255,255,255,0.22);position:relative;overflow:hidden}
.brand-logo:after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,transparent 0%,rgba(255,255,255,0.42) 50%,transparent 100%);transform:translateX(-120%);animation:shimmerSlide 2.8s ease-in-out infinite}
.brand-text{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;letter-spacing:-.02em}
.brand-sub{font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-top:1px}
.time-pill{display:flex;align-items:center;gap:7px;padding:7px 12px;border-radius:999px;background:var(--card);border:1px solid var(--border);font-size:11px;font-weight:700;color:var(--muted);backdrop-filter:blur(12px)}
.dot{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 10px var(--green);animation:pulseGlow 2s infinite}
.container{max-width:640px;margin:0 auto;padding:18px 14px 116px;position:relative}
.view{display:none;opacity:0;transform:translateY(10px);transition:all .38s cubic-bezier(.16,1,.3,1)}
.view.active{display:block;opacity:1;transform:translateY(0)}
.card{background:linear-gradient(180deg,rgba(255,255,255,0.065) 0%,rgba(255,255,255,0.02) 100%);backdrop-filter:blur(26px);-webkit-backdrop-filter:blur(26px);border:1px solid var(--border);border-radius:22px;overflow:hidden;box-shadow:var(--shadow);position:relative;margin-bottom:14px;transition:transform .32s ease,box-shadow .32s ease,border-color .32s ease}
.card:before{content:'';position:absolute;inset:0;border-radius:22px;padding:1px;background:linear-gradient(135deg,rgba(255,255,255,0.14),rgba(255,255,255,0.02));-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
.card:hover{transform:translateY(-2px);border-color:var(--border2);box-shadow:0 26px 70px rgba(0,0,0,0.62),var(--glow)}
.card-head{padding:16px 18px 13px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);gap:12px}
.card-title{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;letter-spacing:-.01em;display:flex;align-items:center;gap:10px}
.card-title .ico{color:var(--violet)}
.card-body{padding:18px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.stat{position:relative;padding:16px;border-radius:18px;overflow:hidden;background:linear-gradient(135deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.015) 100%);border:1px solid var(--border);backdrop-filter:blur(18px);transition:transform .32s ease}
.stat:hover{transform:translateY(-2px) scale(1.02)}
.stat:after{content:'';position:absolute;top:-22px;right:-22px;width:88px;height:88px;background:var(--grad);opacity:.09;border-radius:50%;filter:blur(14px)}
.stat-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:11px}
.stat-icon{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:rgba(139,92,246,0.14);border:1px solid rgba(139,92,246,0.22);color:var(--violet)}
.stat-num{font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;line-height:1;letter-spacing:-.03em}
.stat-num.grad{background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.stat-label{font-size:11px;color:var(--muted);font-weight:600;margin-top:7px;letter-spacing:.02em}
.btn{width:100%;padding:14px 18px;border-radius:14px;border:1px solid var(--border);background:var(--card);color:var(--text);font-weight:600;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:all .22s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;font-family:'Inter',sans-serif;backdrop-filter:blur(12px)}
.btn:active{transform:scale(.97)}
.btn-primary{background:var(--grad);border:0;color:#fff;box-shadow:0 10px 26px rgba(99,102,241,0.38),inset 0 1px 0 rgba(255,255,255,0.22)}
.btn-primary:after{content:'';position:absolute;inset:0;background:linear-gradient(100deg,transparent,rgba(255,255,255,0.28),transparent);transform:translateX(-120%);transition:transform .65s ease}
.btn-primary:hover:after{transform:translateX(120%)}
.btn-primary:hover{box-shadow:0 16px 34px rgba(99,102,241,0.48),inset 0 1px 0 rgba(255,255,255,0.28);transform:translateY(-1px)}
.btn-ghost{background:transparent;border:1px dashed var(--border);color:var(--muted)}
.btn-ghost:hover{border-style:solid;color:var(--text);background:var(--card)}
.input{width:100%;padding:14px 16px;border-radius:14px;border:1px solid var(--border);background:rgba(0,0,0,0.34);color:var(--text);outline:none;font-size:14px;font-weight:500;transition:all .22s ease;backdrop-filter:blur(12px)}
.input::placeholder{color:var(--dim)}
.input:focus{border-color:var(--violet);box-shadow:0 0 0 3px rgba(139,92,246,0.16),0 0 22px rgba(139,92,246,0.12)}
.input-group{position:relative}
.input-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--dim);pointer-events:none}
.input.has-icon{padding-left:42px}
.pkg{display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid var(--border);cursor:pointer;transition:all .22s ease;position:relative}
.pkg:last-child{border-bottom:0}
.pkg:hover{padding-left:6px}
.pkg:hover .pkg-arrow{opacity:1;transform:translateX(0)}
.pkg-left{display:flex;gap:12px;align-items:center;flex:1}
.pkg-icon{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,rgba(139,92,246,0.18),rgba(59,130,246,0.18));border:1px solid rgba(139,92,246,0.22);color:var(--violet);flex-shrink:0}
.pkg-name{font-weight:700;font-size:13.5px;letter-spacing:-.01em}
.pkg-desc{font-size:11.5px;color:var(--muted);margin-top:3px;line-height:1.45}
.pkg-right{text-align:right;display:flex;align-items:center;gap:10px}
.pkg-price{font-weight:800;font-size:14px;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.pkg-arrow{opacity:0;transform:translateX(-8px);transition:all .26s ease;color:var(--dim)}
.nav{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:rgba(12,14,26,0.82);backdrop-filter:blur(36px) saturate(180%);-webkit-backdrop-filter:blur(36px) saturate(180%);border:1px solid var(--border2);display:flex;gap:6px;padding:8px;border-radius:20px;box-shadow:0 22px 70px rgba(0,0,0,0.62),inset 0 1px 0 rgba(255,255,255,0.08);z-index:40;width:calc(100% - 28px);max-width:430px}
.nav-item{flex:1;text-align:center;padding:10px 6px;border-radius:14px;cursor:pointer;color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;display:flex;flex-direction:column;align-items:center;gap:5px;position:relative;transition:all .32s cubic-bezier(.16,1,.3,1)}
.nav-item .ico{transition:all .32s ease}
.nav-item.active{background:var(--text);color:var(--bg);box-shadow:0 10px 24px rgba(0,0,0,0.32)}
.nav-item.active .ico{transform:scale(1.18)}
.nav-item:not(.active):hover{color:var(--text);background:rgba(255,255,255,0.07)}
.toast{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(.92);width:328px;background:rgba(18,20,36,0.92);backdrop-filter:blur(36px);-webkit-backdrop-filter:blur(36px);border:1px solid var(--border2);border-radius:24px;box-shadow:0 26px 90px rgba(0,0,0,0.66),0 0 0 1px rgba(255,255,255,0.06) inset;padding:24px 20px;opacity:0;pointer-events:none;text-align:center;z-index:100;transition:all .42s cubic-bezier(.16,1,.3,1)}
.toast.show{opacity:1;pointer-events:auto;transform:translate(-50%,-50%) scale(1)}
.toast-icon{width:58px;height:58px;border-radius:16px;margin:0 auto 14px;display:grid;place-items:center;background:var(--grad);box-shadow:0 14px 28px rgba(99,102,241,0.38)}
.loading{position:fixed;inset:0;background:var(--bg);z-index:99;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:22px;transition:opacity .55s ease,visibility .55s ease}
.loading.hide{opacity:0;visibility:hidden;pointer-events:none}
.loader-logo{position:relative;width:78px;height:78px}
.loader-ring{position:absolute;inset:0;border:1px solid rgba(139,92,246,0.16);border-radius:20px;animation:ringPulse 2.1s ease-out infinite}
.loader-ring:nth-child(2){animation-delay:.42s}
.loader-ring:nth-child(3){animation-delay:.84s}
.loader-core{position:absolute;inset:13px;border-radius:15px;background:var(--grad);display:grid;place-items:center;box-shadow:0 14px 34px rgba(99,102,241,0.42),inset 0 1px 0 rgba(255,255,255,0.22);animation:float 2.6s ease-in-out infinite}
.badge{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase}
.badge-blue{background:rgba(59,130,246,0.13);color:#60a5fa;border:1px solid rgba(59,130,246,0.22)}
.badge-green{background:rgba(34,197,94,0.13);color:#4ade80;border:1px solid rgba(34,197,94,0.22)}
.badge-orange{background:rgba(251,146,60,0.14);color:#fb923c;border:1px solid rgba(251,146,60,0.24)}
.badge-violet{background:rgba(139,92,246,0.16);color:#a78bfa;border:1px solid rgba(139,92,246,0.26);box-shadow:0 0 14px rgba(139,92,246,0.18)}
blockquote{border-left:0;background:linear-gradient(135deg,rgba(139,92,246,0.09) 0%,rgba(59,130,246,0.05) 100%);border:1px solid rgba(139,92,246,0.14);border-left:3px solid var(--violet);margin:14px 0;padding:14px 16px;border-radius:0 14px 14px 0;font-size:12.5px;line-height:1.7;backdrop-filter:blur(12px)}
blockquote b{color:var(--text);font-weight:700}
table{width:100%;border-collapse:separate;border-spacing:0;font-size:12.5px}
th{text-align:left;padding:10px 12px;font-size:10px;color:var(--muted);font-weight:700;letter-spacing:.08em;text-transform:uppercase;border-bottom:1px solid var(--border);background:rgba(255,255,255,0.02)}
td{padding:12px;border-bottom:1px solid rgba(255,255,255,0.045);transition:background .2s ease}
tr:hover td{background:rgba(255,255,255,0.022)}
.login-full{position:fixed;inset:0;background:var(--bg);z-index:60;display:flex;align-items:center;justify-content:center;padding:24px}
.login-card{width:100%;max-width:368px;background:linear-gradient(180deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.02) 100%);backdrop-filter:blur(36px);border:1px solid var(--border2);border-radius:28px;padding:32px 24px;text-align:center;box-shadow:0 26px 90px rgba(0,0,0,0.54)}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.14);border-radius:999px}
.fade-in{animation:fadeIn .56s cubic-bezier(.16,1,.3,1) forwards}
</style>
</head>
<body>
<div class="mesh"></div>
<div class="loading" id="loading">
  <div class="loader-logo">
    <div class="loader-ring"></div><div class="loader-ring"></div><div class="loader-ring"></div>
    <div class="loader-core"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
  </div>
  <div style="text-align:center"><div style="font-family:'Space Grotesk';font-weight:700;font-size:18px;letter-spacing:-.02em">WALZY STORE</div><div id="loadTxt" style="font-size:12px;color:var(--muted);font-weight:500;margin-top:7px">Menghubungkan ke inti...</div></div>
</div>
<div class="toast" id="toast">
  <div class="toast-icon" id="tIcon"><svg class="ico ico-lg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M5 12l5 5l10-10"/></svg></div>
  <div id="tTitle" style="font-family:'Space Grotesk';font-weight:700;font-size:16px">Berhasil</div>
  <div id="tMsg" style="font-size:12.5px;color:var(--muted);margin-top:8px;line-height:1.55">Ok</div>
  <button class="btn btn-primary" style="margin-top:18px" onclick="hideT()">Mengerti</button>
</div>
<div class="header" id="mainHeader">
  <div class="brand">
    <div class="brand-logo"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>
    <div><div class="brand-text" id="headerTitle">WALZY STORE</div><div class="brand-sub">Premium • v3.0</div></div>
  </div>
  <div class="time-pill"><span class="dot"></span><span id="time">--:--</span></div>
</div>
<div class="container">
  <div id="userRoot" style="display:none">
    <div id="uHome" class="view active">
      <div class="card fade-in">
        <div class="card-body" style="display:flex;gap:16px;align-items:center">
          <div style="position:relative">
            <div id="uAv" style="width:66px;height:66px;border-radius:18px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:grid;place-items:center;font-weight:800;color:#fff;font-size:22px;box-shadow:0 12px 26px rgba(99,102,241,0.38);border:1px solid rgba(255,255,255,0.16)">W</div>
            <div style="position:absolute;bottom:-4px;right:-4px;width:20px;height:20px;background:#22c55e;border:2.5px solid var(--bg);border-radius:50%;display:grid;place-items:center"><div style="width:7px;height:7px;background:white;border-radius:50%"></div></div>
          </div>
          <div style="flex:1;min-width:0">
            <div id="uName" style="font-family:'Space Grotesk';font-weight:700;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Memuat...</div>
            <div id="uRank" style="margin-top:6px"><span class="badge badge-blue">BASIC</span></div>
            <div id="uStatus" style="font-size:11.5px;color:var(--muted);margin-top:6px;font-weight:500">Sinkronisasi status...</div>
          </div>
          <div style="color:var(--dim)"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
        </div>
        <div class="card-body" style="padding-top:0">
          <blockquote>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg><b>Status Fix</b></div>
            <b>Sisa:</b> <span id="bStatus" style="color:#a78bfa">Gratis 3/3</span><br>
            <b>ID:</b> <span id="bId" style="font-family:monospace">--</span><br>
            <b>Rank:</b> <span id="bRank">--</span>
          </blockquote>
        </div>
      </div>
      <div class="grid2">
        <div class="stat fade-in" style="animation-delay:.06s">
          <div class="stat-top"><div class="stat-icon"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><span class="badge badge-green" style="font-size:9px">LIVE</span></div>
          <div class="stat-num grad" id="sTotal">--</div><div class="stat-label">Total Fix</div>
        </div>
        <div class="stat fade-in" style="animation-delay:.12s">
          <div class="stat-top"><div class="stat-icon" style="background:rgba(59,130,246,0.13);border-color:rgba(59,130,246,0.22);color:#60a5fa"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg></div></div>
          <div class="stat-num" id="sRef">--</div><div class="stat-label">Referral</div>
        </div>
      </div>
      <div class="card fade-in" style="animation-delay:.18s">
        <div class="card-head"><div class="card-title"><svg class="ico anim-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>Paket Premium</div><span class="badge badge-violet"><svg class="ico" style="width:12px;height:12px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>BEST</span></div>
        <div class="card-body" style="padding-top:6px" id="pkgHome"></div>
      </div>
      <div class="grid2">
        <button class="btn" onclick="showUserView('uRef')"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Referral</button>
        <button class="btn btn-primary" onclick="showUserView('uSpin')"><svg class="ico anim-spin" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/><path d="M12 2v2"/><path d="M12 20v2"/></svg>Spin</button>
      </div>
      <div class="card fade-in" style="animation-delay:.24s;margin-top:12px">
        <div class="card-body" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><div style="font-size:11px;font-weight:700;margin-bottom:8px">Referral Link</div><div style="background:rgba(0,0,0,0.32);border:1px solid var(--border);border-radius:10px;padding:9px 10px;font-size:10px;word-break:break-all;color:var(--muted)" id="refLink">Memuat...</div><button class="btn" style="margin-top:8px;padding:9px;font-size:11px" onclick="copyRef()"><svg class="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3"/></svg>Salin</button></div>
          <div><div style="font-size:11px;font-weight:700;margin-bottom:8px">Redeem Voucher</div><div class="input-group"><span class="input-icon"><svg class="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h16v4"/><path d="M20 12v4H6a2 2 0 0 0-2 2c0 1.1.9 2 2 2h16v-4"/></svg></span><input id="redeemInput" class="input has-icon" placeholder="KODE" style="text-transform:uppercase;text-align:center"></div><button class="btn btn-primary" style="margin-top:8px;padding:9px;font-size:11px" onclick="doRedeem()">Tukar</button></div>
        </div>
      </div>
    </div>
    <div id="uOrder" class="view">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;cursor:pointer;color:var(--muted);font-size:12px;font-weight:600" onclick="showUserView('uHome')"><svg class="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>Kembali</div>
      <div style="font-family:'Space Grotesk';font-weight:700;font-size:18px;letter-spacing:-.02em">Order Paket</div>
      <div style="font-size:12px;color:var(--muted);margin-top:4px;margin-bottom:14px">Pilih paket terbaik untukmu</div>
      <div class="card"><div class="card-body" id="pkgOrder"></div></div>
      <div class="card" id="invoiceCard" style="display:none"><div class="card-head">Invoice Aktif <span id="invStatus" class="badge badge-orange">Menunggu</span></div><div class="card-body"><div id="invoiceBox"></div><input type="file" id="proofFile" accept="image/*" style="display:none" onchange="uploadProof(event)"><button class="btn btn-primary" style="margin-top:12px" onclick="document.getElementById('proofFile').click()"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Upload Bukti</button></div></div>
    </div>
    <div id="uTrans" class="view">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;cursor:pointer;color:var(--muted);font-size:12px;font-weight:600" onclick="showUserView('uHome')"><svg class="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>Kembali</div>
      <div style="font-family:'Space Grotesk';font-weight:700;font-size:18px">Riwayat Transaksi</div>
      <div style="font-size:12px;color:var(--muted);margin-top:4px;margin-bottom:14px">Semua pembayaran</div>
      <div class="card"><div class="card-body" style="padding:0"><table><thead><tr><th>Invoice</th><th>Paket</th><th>Status</th><th>Tgl</th></tr></thead><tbody id="hTable"><tr><td colspan="4" style="text-align:center;padding:18px;color:var(--muted)">Memuat...</td></tr></tbody></table></div></div>
      <div class="grid2"><div class="stat"><div class="stat-num" id="stFix">0</div><div class="stat-label">Fix Sukses</div></div><div class="stat"><div class="stat-num" id="stRate">0%</div><div class="stat-label">Success Rate</div></div></div>
    </div>
    <div id="uProfil" class="view">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;cursor:pointer;color:var(--muted);font-size:12px;font-weight:600" onclick="showUserView('uHome')"><svg class="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>Kembali</div>
      <div style="font-family:'Space Grotesk';font-weight:700;font-size:18px">Profil</div>
      <div class="card" style="margin-top:14px"><div class="card-body" style="text-align:center"><div id="pAv" style="width:68px;height:68px;border-radius:18px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:grid;place-items:center;margin:0 auto;font-weight:800;color:#fff;font-size:24px;box-shadow:0 12px 28px rgba(99,102,241,0.38)">W</div><div id="pName" style="font-weight:700;margin-top:12px;font-size:16px">--</div><div id="pId" style="font-size:11px;color:var(--muted)">ID --</div><blockquote style="text-align:left;margin-top:14px"><b>Status:</b> <span id="pStatus">--</span><br><b>Referral:</b> <span id="pRef">--</span><br><b>Order:</b> <span id="pFix">--</span></blockquote></div></div>
    </div>
    <div id="uRef" class="view">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;cursor:pointer;color:var(--muted);font-size:12px;font-weight:600" onclick="showUserView('uHome')"><svg class="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>Kembali</div>
      <div class="card"><div class="card-head"><div class="card-title"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Referral System</div></div><div class="card-body"><div style="font-size:12px;color:var(--muted);margin-bottom:12px">Ajak teman dapat bonus VIP</div><div style="display:flex;gap:8px"><input id="refLink2" class="input" style="font-size:11px" readonly value="Memuat..."><button class="btn btn-primary" style="width:auto;padding:0 18px" onclick="copyRef()"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3"/></svg></button></div><div class="grid2" style="margin-top:16px"><div class="stat"><div class="stat-num" id="refCount">--</div><div class="stat-label">Total</div></div><div class="stat"><div class="stat-num grad" id="refRank">--</div><div class="stat-label">Rank</div></div></div></div></div>
    </div>
    <div id="uSpin" class="view">
      <div class="card" style="text-align:center;background:radial-gradient(600px 300px at 50% 0%,rgba(139,92,246,0.16),transparent),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))"><div class="card-body" style="padding:32px 20px"><div style="width:90px;height:90px;margin:0 auto 16px;border-radius:24px;background:var(--grad);display:grid;place-items:center;box-shadow:0 18px 44px rgba(99,102,241,0.42);animation:float 3s ease-in-out infinite"><svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" class="anim-spin" style="animation-duration:6s"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 10 10"/><path d="M12 12l-2-2"/><path d="M12 12l4 2"/></svg></div><div style="font-family:'Space Grotesk';font-weight:700;font-size:20px">Lucky Spin Harian</div><div style="font-size:12px;color:var(--muted);margin-top:6px">Putar setiap hari menangkan VIP</div><button id="spinBtn" class="btn btn-primary" style="margin-top:20px;max-width:260px" onclick="doSpin()"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.76L23 10"/></svg>Putar Sekarang</button><div id="spinInfo" style="font-size:11px;color:var(--dim);margin-top:12px"></div></div></div>
    </div>
  </div>
  <div id="ownerRoot" style="display:none">
    <div id="oLogin" class="view active">
      <div class="login-full"><div class="login-card"><div style="width:64px;height:64px;margin:0 auto 16px;border-radius:18px;background:var(--grad);display:grid;place-items:center;box-shadow:0 12px 32px rgba(99,102,241,0.42)"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div style="font-family:'Space Grotesk';font-weight:700;font-size:18px">Owner Access</div><div style="font-size:12px;color:var(--muted);margin-top:6px">Masuk untuk kelola</div><input id="ownerPass" type="password" class="input" placeholder="Password owner..." style="margin-top:18px;text-align:center"><div id="oLoginErr" style="font-size:11px;color:#ef4444;margin-top:8px;display:none"></div><button class="btn btn-primary" style="margin-top:12px" onclick="verifyOwner()">Masuk Dashboard</button></div></div>
    </div>
    <div id="oDash" class="view">
      <div style="font-family:'Space Grotesk';font-weight:700;font-size:20px">Owner Dashboard</div><div style="font-size:12px;color:var(--muted);margin-top:4px">Kelola semua via WebApp</div>
      <div class="grid2" style="margin-top:14px"><div class="stat"><div class="stat-top"><div class="stat-icon"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div></div><div class="stat-num" id="oUsers">0</div><div class="stat-label">Users Valid</div></div><div class="stat"><div class="stat-top"><div class="stat-icon" style="background:rgba(34,197,94,0.13);border-color:rgba(34,197,94,0.22);color:#4ade80"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div></div><div class="stat-num grad" id="oRev">Rp 0</div><div class="stat-label">Revenue</div></div></div>
      <div class="grid2"><div class="stat"><div class="stat-num" id="oVip">0</div><div class="stat-label">VIP</div></div><div class="stat"><div class="stat-num" id="oToday" style="color:#fb923c">0</div><div class="stat-label">Pending</div></div></div>
      <div class="grid2" style="margin-top:12px">
        <div class="card" style="cursor:pointer" onclick="openOwnerPage('pending')"><div class="card-body"><div style="font-weight:700;display:flex;align-items:center;gap:8px"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Pending ACC</div><div style="font-size:11px;color:var(--muted);margin-top:6px" id="oPendingCount">0 menunggu</div></div></div>
        <div class="card" style="cursor:pointer" onclick="openOwnerPage('users')"><div class="card-body"><div style="font-weight:700;display:flex;align-items:center;gap:8px"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="var(--violet)" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Users</div><div style="font-size:11px;color:var(--muted);margin-top:6px" id="oUsersCount">0 user</div></div></div>
        <div class="card" style="cursor:pointer" onclick="openOwnerPage('voucher')"><div class="card-body"><div style="font-weight:700;display:flex;align-items:center;gap:8px"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h16v4"/><path d="M20 12v4H6a2 2 0 0 0-2 2c0 1.1.9 2 2 2h16v-4"/></svg>Voucher</div><div style="font-size:11px;color:var(--muted);margin-top:4px">Buat kode</div></div></div>
        <div class="card" style="cursor:pointer" onclick="openOwnerPage('broadcast')"><div class="card-body"><div style="font-weight:700;display:flex;align-items:center;gap:8px"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>Broadcast</div><div style="font-size:11px;color:var(--muted);margin-top:4px">Kirim pesan</div></div></div>
      <div class="card"><div class="card-head"><div class="card-title"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>Revenue Terbaru</div></div><div class="card-body" style="padding:0"><table><thead><tr><th>Invoice</th><th>User</th><th>Jumlah</th></tr></thead><tbody id="oRevTable"><tr><td colspan="3" style="text-align:center;padding:14px;color:var(--muted)">Memuat...</td></tr></tbody></table></div></div>
      <button class="btn" style="margin-top:12px" onclick="logoutOwner()">Keluar</button>
    </div>
    <div id="oPending" class="view"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;cursor:pointer;color:var(--muted);font-size:12px;font-weight:600" onclick="openOwnerPage('dash')"><svg class="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>Kembali</div><div style="font-family:'Space Grotesk';font-weight:700;font-size:18px">Pending ACC</div><div id="oPendingList" style="margin-top:12px"></div></div>
    <div id="oUsers" class="view"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;cursor:pointer;color:var(--muted);font-size:12px;font-weight:600" onclick="openOwnerPage('dash')"><svg class="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>Kembali</div><div style="font-family:'Space Grotesk';font-weight:700;font-size:18px">Users</div><div class="card" style="margin-top:12px"><div class="card-body" style="padding:0"><table><thead><tr><th>ID</th><th>Nama</th><th>Order</th><th>Status</th></tr></thead><tbody id="oUsersTable"></tbody></table></div></div></div>
    <div id="oVoucher" class="view"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;cursor:pointer;color:var(--muted);font-size:12px;font-weight:600" onclick="openOwnerPage('dash')"><svg class="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>Kembali</div><div style="font-family:'Space Grotesk';font-weight:700;font-size:18px">Voucher</div><div class="card" style="margin-top:12px"><div class="card-head">Buat Voucher</div><div class="card-body"><div class="grid2"><input id="vCode" class="input" placeholder="KODE" style="text-transform:uppercase"><input id="vDays" type="number" class="input" placeholder="Hari"></div><div class="grid2" style="margin-top:8px"><input id="vQuota" type="number" class="input" placeholder="Quota 0=∞"><select id="vType" class="input"><option value="public">Public</option><option value="private">Private</option></select></div><button class="btn btn-primary" style="margin-top:12px" onclick="createVoucher()"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Buat</button><div id="vList" style="margin-top:16px"></div></div></div></div>
    <div id="oBroadcast" class="view"><div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;cursor:pointer;color:var(--muted);font-size:12px;font-weight:600" onclick="openOwnerPage('dash')"><svg class="ico ico-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>Kembali</div><div style="font-family:'Space Grotesk';font-weight:700;font-size:18px">Broadcast</div><div class="card" style="margin-top:12px"><div class="card-body"><textarea id="bcText" class="input" rows="4" placeholder="Pesan ke semua user..." maxlength="1000"></textarea><div style="display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:var(--dim)"><span id="bcCount">0 / 1000 • 0 user</span><span style="color:#a78bfa">Premium</span></div><button class="btn btn-primary" style="margin-top:12px" onclick="sendBc()"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Kirim</button></div></div></div>
  </div>
</div>
<div class="nav" id="uNav">
  <div class="nav-item active" data-view="uHome" onclick="showUserView('uHome')"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>Home</span></div>
  <div class="nav-item" data-view="uOrder" onclick="showUserView('uOrder')"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><span>Order</span></div>
  <div class="nav-item" data-view="uTrans" onclick="showUserView('uTrans')"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><span>Riwayat</span></div>
  <div class="nav-item" data-view="uProfil" onclick="showUserView('uProfil')"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Profil</span></div>
</div>
<script>
let userId=null,tgUser=null,currentInvoice=null,cacheUser=null,cacheStats=null,ownerPass='';
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
function escH(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
async function fetchJson(url,opts={}){
  const ctrl=new AbortController();
  const t=setTimeout(()=>ctrl.abort(),12000);
  try{
    const r=await fetch(url,{...opts,signal:ctrl.signal});
    clearTimeout(t);
    const data=await r.json().catch(()=>({ok:false,message:'Invalid JSON'}));
    if(!r.ok&&!data.message) throw new Error('HTTP '+r.status);
    return data;
  }catch(e){
    clearTimeout(t);
    if(e.name==='AbortError') throw new Error('Timeout, coba lagi');
    throw e;
  }
}
function showT(title,msg,ok=true){
  $('#tTitle').textContent=title;
  $('#tMsg').textContent=msg;
  $('#tIcon').innerHTML=ok?'<svg class="ico ico-lg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M5 12l5 5l10-10"/></svg>':'<svg class="ico ico-lg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  $('#tIcon').style.background=ok?'var(--grad)':'linear-gradient(135deg,#ef4444,#dc2626)';
  $('#toast').classList.add('show');
}
function hideT(){$('#toast').classList.remove('show')}
function hideLoad(){$('#loading').classList.add('hide')}
function showUserRoot(){$('#userRoot').style.display='block';$('#ownerRoot').style.display='none';$('#uNav').style.display='flex'}
function showOwnerRoot(){$('#userRoot').style.display='none';$('#ownerRoot').style.display='block';$('#uNav').style.display='none'}
function showUserView(id){
  $$('#userRoot .view').forEach(v=>v.classList.remove('active'));
  const el=document.getElementById(id);
  if(el){el.classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}
  $$('.nav-item').forEach(n=>{n.classList.toggle('active',n.dataset.view===id)});
  if(window.Telegram&&window.Telegram.WebApp&&window.Telegram.WebApp.BackButton){
    if(id==='uHome') window.Telegram.WebApp.BackButton.hide();
    else window.Telegram.WebApp.BackButton.show();
  }
}
function openOwnerPage(p){
  $$('#ownerRoot .view').forEach(v=>v.classList.remove('active'));
  const map={dash:'oDash',pending:'oPending',users:'oUsers',voucher:'oVoucher',broadcast:'oBroadcast'};
  const el=document.getElementById(map[p]||'oDash');
  if(el) el.classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}
function logoutOwner(){ownerPass='';$('#ownerPass').value='';$$('#ownerRoot .view').forEach(v=>v.classList.remove('active'));$('#oLogin').classList.add('active');}
async function loadUser(){
  if(!userId) return;
  try{
    const d=await fetchJson('/api/user?user_id='+encodeURIComponent(userId));
    if(!d.ok) throw new Error(d.message||'Gagal load');
    cacheUser=d;
    renderUser(d);
    hideLoad();
  }catch(e){
    $('#loadTxt').textContent='Offline: '+e.message;
    if(cacheUser) renderUser(cacheUser);
    else{showUserRoot();$('#uName').textContent='Gagal memuat';$('#uStatus').textContent=e.message;hideLoad()}
  }
}
function renderUser(d){
  const u=d.user||{};
  const s=d.stats||{};
  const isVip=u.premiumUntil&&u.premiumUntil>Date.now();
  $('#uName').textContent=u.first_name||tgUser?.first_name||'User';
  $('#pName').textContent=u.first_name||'User';
  const avLetter=(u.first_name||'W').charAt(0).toUpperCase();
  $('#uAv').textContent=avLetter;$('#pAv').textContent=avLetter;
  const rank=u.rank||'BASIC';
  const rankCls=rank==='BASIC'?'badge-blue':isVip?'badge-violet':'badge-green';
  $('#uRank').innerHTML='<span class="badge '+rankCls+'">'+escH(rank)+(isVip?' • VIP':'')+'</span>';
  $('#uStatus').textContent=isVip?'VIP aktif • '+Math.ceil((u.premiumUntil-Date.now())/86400000)+' hari lagi':'Gratis sisa '+(s.remaining??3)+'/3 hari ini';
  $('#pStatus').textContent=isVip?'VIP '+Math.ceil((u.premiumUntil-Date.now())/86400000)+' hari':'Gratis';
  $('#bStatus').textContent=isVip?'VIP '+Math.ceil((u.premiumUntil-Date.now())/86400000)+' hari':'Gratis '+(s.remaining??3)+'/3';
  $('#bId').textContent=String(u.id||userId);$('#pId').textContent='ID '+String(u.id||userId);$('#bRank').textContent=rank;
  $('#sTotal').textContent=u.totalFix||0;$('#sRef').textContent=u.referralCount||0;
  $('#stFix').textContent=u.totalFix||0;$('#stRate').textContent=(s.successRate||0)+'%';
  $('#pRef').textContent=u.referralCount||0;$('#pFix').textContent=u.totalFix||0;
  const botU=d.botUsername||'walzystorebot';
  const link='https://t.me/'+botU+'?start='+userId;
  $('#refLink').textContent=link;const rl2=$('#refLink2');if(rl2) rl2.value=link;
  $('#refCount').textContent=u.referralCount||0;$('#refRank').textContent=rank;
  if(d.packages){
    const html=d.packages.map(p=>'<div class="pkg" onclick="buyPkg('+p.days+')"><div class="pkg-left"><div class="pkg-icon"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+(p.days>=30?'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>':'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>')+'</svg></div><div><div class="pkg-name">'+escH(p.name)+(p.popular?'<span style="font-size:9px;background:var(--grad);color:#fff;padding:2px 6px;border-radius:999px;margin-left:6px">POPULER</span>':'')+'</div><div class="pkg-desc">'+escH(p.desc||p.days+' hari VIP')+'</div></div></div><div class="pkg-right"><div class="pkg-price">Rp '+(p.price||0).toLocaleString('id-ID')+'</div><div class="pkg-arrow"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div></div></div>').join('');
    $('#pkgHome').innerHTML=html;$('#pkgOrder').innerHTML=html;
  }
  if(d.pendingInvoice){
    currentInvoice=d.pendingInvoice.id;
    $('#invoiceCard').style.display='block';
    $('#invStatus').textContent=d.pendingInvoice.status||'Menunggu';
    $('#invoiceBox').innerHTML='<div style="font-size:12.5px;line-height:1.7"><b>Invoice:</b> <span style="font-family:monospace">'+escH(d.pendingInvoice.id)+'</span><br><b>Paket:</b> '+escH(d.pendingInvoice.days)+' hari<br><b>Jumlah:</b> Rp '+(d.pendingInvoice.amount||0).toLocaleString('id-ID')+'</div>';
  }
  if(d.history){
    const rows=d.history.slice(0,20).map(h=>'<tr><td style="font-family:monospace;font-size:11px">'+escH(h.id||h.invoice||'-')+'</td><td>'+escH((h.days||'')+'H')+'</td><td><span class="badge '+(h.status==='paid'?'badge-green':h.status==='waiting_approval'?'badge-orange':'badge-blue')+'">'+escH(h.status||'-')+'</span></td><td style="font-size:11px;color:var(--muted)">'+new Date(h.date||h.createdAt||Date.now()).toLocaleDateString('id-ID')+'</td></tr>').join('');
    $('#hTable').innerHTML=rows||'<tr><td colspan="4" style="text-align:center;padding:16px;color:var(--muted)">Belum ada</td></tr>';
  }
  showUserRoot();
}
async function loadStats(){
  if(!userId) return;
  try{
    const data=await fetchJson('/api/stats?owner_id='+encodeURIComponent(userId)+'&password='+encodeURIComponent(ownerPass||''));
    if(!data.ok) return;
    cacheStats=data;
    if(data.stats){
      $('#oUsers').textContent=data.stats.usersValid??data.stats.totalUsers??'--';
      $('#oUsersCount').textContent=(data.stats.usersValid??0)+' user';
      $('#oRev').textContent='Rp '+(data.stats.revenue||0).toLocaleString('id-ID');
      $('#oVip').textContent=data.stats.vipCount??'--';
      const pend=data.stats.pendingOrders??0;
      $('#oToday').textContent=pend;$('#oPendingCount').textContent=pend+' menunggu';
      if(data.stats.revenueHistory){
        const rh=data.stats.revenueHistory.slice(0,10).map(r=>'<tr><td style="font-family:monospace;font-size:11px">'+escH(r.invoice||'')+'</td><td>'+escH(String(r.userId||''))+'</td><td style="font-weight:700;color:#a78bfa">Rp '+(r.amount||0).toLocaleString('id-ID')+'</td></tr>').join('');
        $('#oRevTable').innerHTML=rh||'<tr><td colspan="3" style="text-align:center;padding:12px;color:var(--muted)">Kosong</td></tr>';
      }
    }
    if(data.payments){
      const pend=Object.values(data.payments).filter(p=>p.status==='waiting_approval');
      const list=$('#oPendingList');
      if(!pend.length) list.innerHTML='<div style="padding:20px;text-align:center;color:var(--muted);font-size:12px">Tidak ada pending</div>';
      else list.innerHTML=pend.map(p=>'<div class="card"><div class="card-body" style="display:flex;justify-content:space-between;align-items:center;gap:12px"><div><div style="font-weight:700;font-size:12px;font-family:monospace">'+escH(p.id)+'</div><div style="font-size:11px;color:var(--muted);margin-top:4px">User '+escH(String(p.userId))+' • '+p.days+'H • Rp '+(p.amount||0).toLocaleString('id-ID')+'</div></div><div style="display:flex;gap:6px"><button class="btn" style="width:auto;padding:8px 12px;font-size:11px" onclick="ownerAct(\''+escH(p.id)+'\',\'reject\')">Tolak</button><button class="btn btn-primary" style="width:auto;padding:8px 12px;font-size:11px" onclick="ownerAct(\''+escH(p.id)+'\',\'approve\')">ACC</button></div></div></div>').join('');
      const ut=$('#oUsersTable');
      if(ut&&data.users){
        const vals=Object.values(data.users).slice(0,100).map(u=>'<tr><td style="font-family:monospace;font-size:11px">'+escH(String(u.id||''))+'</td><td style="font-weight:600">'+escH(u.first_name||'-')+'</td><td>'+(u.totalFix||0)+'</td><td><span class="badge '+(u.premiumUntil&&u.premiumUntil>Date.now()?'badge-violet':'badge-blue')+'">'+escH(u.premiumUntil&&u.premiumUntil>Date.now()?'VIP':'BASIC')+'</span></td></tr>').join('');
        ut.innerHTML=vals||'<tr><td colspan="4" style="text-align:center;padding:12px;color:var(--muted)">Kosong</td></tr>';
      }
    }
    if(data.codes){
      const vList=$('#vList');
      const codes=Object.entries(data.codes);
      if(!codes.length) vList.innerHTML='<div style="font-size:11px;color:var(--dim);text-align:center;padding:12px">Belum ada voucher</div>';
      else vList.innerHTML=codes.map(([code,c])=>{const o=typeof c==='object'?c:{days:c,quota:0,used:0};return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)"><div><div style="font-weight:700;font-family:monospace;font-size:12px">'+escH(code)+'</div><div style="font-size:10px;color:var(--muted)">'+o.days+' hari • '+(o.used||0)+'/'+(o.quota||'∞')+' • '+(o.type||'public')+'</div></div><button class="btn" style="width:auto;padding:6px 10px;font-size:10px" onclick="delVoucher(\''+escH(code)+'\')">Hapus</button></div>'}).join('');
    }
  }catch(e){}
}
async function verifyOwner(){
  const pass=$('#ownerPass').value.trim();
  if(!pass){$('#oLoginErr').style.display='block';$('#oLoginErr').textContent='Isi password';return}
  ownerPass=pass;
  try{
    const r=await fetchJson('/api/verify_owner',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,password:pass})});
    if(r.ok){$('#oLogin').classList.remove('active');$('#oDash').classList.add('active');showOwnerRoot();loadStats();showT('Berhasil','Masuk sebagai Owner')}
    else{$('#oLoginErr').style.display='block';$('#oLoginErr').textContent=r.message||'Password salah'}
  }catch(e){$('#oLoginErr').style.display='block';$('#oLoginErr').textContent=e.message}
}
async function ownerAct(inv,act){
  try{
    const r=await fetchJson('/api/owner_action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,action:act,invoice:inv,password:ownerPass})});
    showT('Berhasil',r.message||'OK');loadStats();
  }catch(e){showT('Gagal',e.message,false)}
}
async function createVoucher(){
  const code=$('#vCode').value.trim().toUpperCase();
  const days=parseInt($('#vDays').value);
  const quota=parseInt($('#vQuota').value)||0;
  const type=$('#vType').value;
  if(!code||!days||days<1) return showT('Gagal','Isi kode & hari valid',false);
  if(code.length<3) return showT('Gagal','Kode min 3 huruf',false);
  if(days>365) return showT('Gagal','Max 365 hari',false);
  try{
    const r=await fetchJson('/api/create_code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,code,days,quota,type,password:ownerPass})});
    if(r.ok){showT('Berhasil','Voucher '+code+' dibuat');$('#vCode').value='';$('#vDays').value='';$('#vQuota').value='';loadStats()}
    else showT('Gagal',r.message,false);
  }catch(e){showT('Gagal',e.message,false)}
}
async function delVoucher(code){
  if(!confirm('Hapus '+code+'?')) return;
  try{
    const r=await fetchJson('/api/delete_code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,code,password:ownerPass})});
    if(r.ok){showT('Hapus',code+' dihapus');loadStats()}else showT('Gagal',r.message,false);
  }catch(e){showT('Gagal',e.message,false)}
}
async function sendBc(){
  const text=$('#bcText').value.trim();
  if(!text) return showT('Gagal','Isi pesan',false);
  if(text.length>1000) return showT('Gagal','Max 1000 karakter',false);
  try{
    const r=await fetchJson('/api/broadcast',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,text,password:ownerPass})});
    showT('Terkirim','Ke '+r.sent+' user');$('#bcText').value='';$('#bcCount').textContent='0 / 1000 • '+(cacheStats?.stats?.usersValid||0)+' user';
  }catch(e){showT('Gagal',e.message,false)}
}
async function doSpin(){
  const btn=$('#spinBtn');
  if(btn){btn.disabled=true;btn.innerHTML='<svg class="ico anim-spin" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Memutar...'}
  try{
    const r=await fetchJson('/api/spin?user_id='+userId,{method:'POST'});
    if(r.ok){showT('Menang!',r.reward?.label||'Hadiah!');loadUser();$('#spinInfo').textContent=r.reward?.label||''}
    else{showT('Info',r.message||'Sudah spin',false);if(r.alreadySpun&&btn) btn.disabled=true}
  }catch(e){showT('Gagal',e.message,false);if(btn){btn.disabled=false;btn.innerHTML='<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.76L23 10"/></svg>Putar Sekarang'}}
}
async function buyPkg(days){
  if(!days||days<1) return showT('Gagal','Paket invalid',false);
  try{
    const r=await fetchJson('/api/deposit?user_id='+userId+'&days='+days,{method:'POST'});
    if(r.ok){currentInvoice=r.invoice.id;showUserView('uOrder');setTimeout(loadUser,600);showT('Invoice Dibuat',r.invoice.id)}
    else showT('Gagal',r.message,false);
  }catch(e){showT('Gagal',e.message,false)}
}
function uploadProof(evt){
  const file=evt.target.files[0];
  if(!file||!currentInvoice) return showT('Gagal','Tidak ada invoice',false);
  if(file.size>5*1024*1024) return showT('Gagal','Max 5MB',false);
  if(!file.type.startsWith('image/')) return showT('Gagal','Harus gambar',false);
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement('canvas');
      let w=img.width,h=img.height;const max=1280;
      if(w>h&&w>max){h=h*max/w;w=max}else if(h>max){w=w*max/h;h=max}
      canvas.width=w;canvas.height=h;
      const ctx=canvas.getContext('2d');
      if(!ctx) return showT('Gagal','Canvas error',false);
      ctx.drawImage(img,0,0,w,h);
      sendProof(canvas.toDataURL('image/jpeg',0.78));
    };
    img.onerror=()=>showT('Gagal','Gambar rusak',false);
    img.src=e.target.result;
  };
  reader.onerror=()=>showT('Gagal','Gagal baca file',false);
  reader.readAsDataURL(file);
}
async function sendProof(b64){
  if(!b64||!b64.startsWith('data:image')) return showT('Gagal','Format invalid',false);
  try{
    const r=await fetchJson('/api/upload_proof',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:userId,invoice:currentInvoice,image_base64:b64})});
    if(r.ok) showT('Terkirim','Menunggu ACC owner');else showT('Gagal',r.message,false);
  }catch(e){showT('Gagal',e.message,false)}
}
async function doRedeem(){
  const code=$('#redeemInput').value.trim().toUpperCase();
  if(!code) return showT('Gagal','Isi kode',false);
  if(code.length<3) return showT('Gagal','Kode min 3 huruf',false);
  try{
    const r=await fetchJson('/api/redeem?user_id='+userId+'&code='+code,{method:'POST'});
    if(r.ok){showT('Berhasil','VIP aktif '+code);$('#redeemInput').value='';loadUser()}
    else showT('Gagal',r.message,false);
  }catch(e){showT('Gagal',e.message,false)}
}
function copyRef(){
  const el=$('#refLink2')||$('#refLink');
  let txt='';
  if(el.tagName==='INPUT') txt=el.value;
  else txt=el.textContent||el.innerText||'';
  if(!txt||txt.includes('Memuat')) return showT('Gagal','Link belum siap',false);
  navigator.clipboard.writeText(txt).then(()=>showT('Disalin','Link referral disalin')).catch(()=>showT('Gagal','Gagal menyalin',false));
}
(function(){
  const tg=window.Telegram&&window.Telegram.WebApp;
  if(tg){
    try{
      tg.ready();tg.expand();tg.enableClosingConfirmation();
      const u=tg.initDataUnsafe&&tg.initDataUnsafe.user;
      if(u&&u.id){userId=String(u.id);tgUser=u}
      if(tg.BackButton){
        tg.BackButton.onClick(()=>{
          const active=document.querySelector('#userRoot .view.active');
          if(active&&active.id!=='uHome') showUserView('uHome');
          else tg.close();
        });
      }
    }catch(e){}
  }
  if(!userId){
    const sp=new URLSearchParams(window.location.search);
    userId=sp.get('user_id')||sp.get('userId')||null;
  }
  if(!userId){
    $('#loadTxt').textContent='Buka via Telegram Bot untuk data real';
    showUserRoot();
    $('#uName').textContent='Demo Mode';$('#pName').textContent='Demo Mode';
    $('#uStatus').textContent='Buka dari tombol di bot';
    $('#pkgHome').innerHTML='<div class="pkg"><div class="pkg-left"><div class="pkg-icon"><svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div><div><div class="pkg-name">VIP 7 Hari</div><div class="pkg-desc">Akses unlimited + prioritas</div></div></div><div class="pkg-right"><div class="pkg-price">Rp 15.000</div></div></div>';
    $('#pkgOrder').innerHTML=$('#pkgHome').innerHTML;
    setTimeout(hideLoad,900);
    return;
  }
  loadUser();loadStats();
  setTimeout(()=>{if(!$('#loading').classList.contains('hide')&&!cacheUser){showUserRoot();hideLoad()}},3800);
  setInterval(()=>{const el=$('#time');if(el) el.textContent=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})+' WIB'},1000);
  const passEl=$('#ownerPass');if(passEl) passEl.addEventListener('keypress',e=>{if(e.key==='Enter') verifyOwner()});
  const bc=$('#bcText');if(bc) bc.addEventListener('input',e=>{const c=$('#bcCount');if(c) c.textContent=e.target.value.length+' / 1000 • '+(cacheStats?.stats?.usersValid||0)+' user'});
})();
</script>
</body>
</html>`);
};
