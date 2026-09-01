module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>WALZY CYBER SUITE - PREMIUM</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet">
<style>
:root{
--bg:#050814;
--bg2:#080d1f;
--card:rgba(18,24,50,0.72);
--card2:rgba(22,30,64,0.86);
--bd:rgba(255,255,255,0.07);
--bd2:rgba(255,255,255,0.12);
--cyan:#00f5ff;
--blue:#5b8def;
--purple:#a855f7;
--pink:#ff3b6e;
--emerald:#00ffa3;
--amber:#ffb800;
--text:#f8fbff;
--muted:#8b95b5;
--shadow:0 24px 60px rgba(0,0,0,0.55);
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
body{
background:var(--bg);
background-image:
radial-gradient(1200px 600px at 15% -10%, rgba(0,245,255,0.18), transparent 60%),
radial-gradient(900px 600px at 90% 10%, rgba(168,85,247,0.22), transparent 60%),
radial-gradient(800px 500px at 50% 120%, rgba(91,141,239,0.15), transparent 70%),
linear-gradient(180deg, var(--bg), var(--bg2));
color:var(--text);
min-height:100vh;
padding-bottom:120px;
overflow-x:hidden;
}
body::before{
content:'';
position:fixed;inset:0;
background-image:linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
background-size:42px 42px;
mask-image:radial-gradient(800px 600px at 50% 0%, black 20%, transparent 80%);
pointer-events:none;
z-index:0;
}
.icon{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.loader{
position:fixed;inset:0;z-index:9999;
display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;
background:
radial-gradient(1000px 600px at 50% -10%, rgba(0,245,255,0.22), transparent 60%),
radial-gradient(800px 600px at 80% 110%, rgba(168,85,247,0.22), transparent 60%),
linear-gradient(180deg, #060a1a, #050814);
transition:opacity .5s ease, visibility .5s ease;
}
.loader.hidden{opacity:0;visibility:hidden;pointer-events:none}
.loader-card{
width:88px;height:88px;border-radius:28px;
background:linear-gradient(135deg, var(--cyan), var(--purple));
box-shadow:0 0 40px rgba(0,245,255,0.45), inset 0 1px 1px rgba(255,255,255,0.6);
display:grid;place-items:center;
animation:float 3s ease-in-out infinite;
position:relative;
}
.loader-card::after{
content:'';position:absolute;inset:-2px;border-radius:30px;
background:linear-gradient(135deg, var(--cyan), var(--purple));
filter:blur(18px);opacity:.6;z-index:-1;
}
.loader-title{
font-family:'Outfit',sans-serif;font-weight:900;font-size:22px;letter-spacing:1.2px;
background:linear-gradient(90deg, #fff, #cbd5ff);
-webkit-background-clip:text;background-clip:text;color:transparent;
}
.loader-sub{font-size:12.5px;color:var(--muted);font-weight:600;letter-spacing:.3px}
.loader-bar{width:168px;height:4px;border-radius:999px;background:rgba(255,255,255,0.08);overflow:hidden;margin-top:4px}
.loader-bar-inner{height:100%;width:40%;border-radius:999px;background:linear-gradient(90deg, var(--cyan), var(--purple));animation:loaderBar 1.2s ease-in-out infinite}
@keyframes loaderBar{0%{transform:translateX(-100%)}50%{width:70%}100%{transform:translateX(250%)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.9)}}
@keyframes viewIn{from{opacity:0;transform:translateY(18px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
.header{
position:sticky;top:0;z-index:40;
height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;
background:rgba(7,12,28,0.72);backdrop-filter:blur(24px) saturate(1.4);-webkit-backdrop-filter:blur(24px) saturate(1.4);
border-bottom:1px solid var(--bd);
}
.brand{display:flex;align-items:center;gap:12px}
.brand-logo{
width:44px;height:44px;border-radius:14px;
background:linear-gradient(135deg, var(--cyan), var(--blue) 45%, var(--purple));
box-shadow:0 8px 24px rgba(0,245,255,0.28);
display:grid;place-items:center;color:#001018;
font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:20px;
position:relative;
}
.brand-logo::after{content:'';position:absolute;inset:-1px;border-radius:15px;background:linear-gradient(135deg, var(--cyan), var(--purple));filter:blur(12px);opacity:.5;z-index:-1}
.brand-name{font-family:'Outfit',sans-serif;font-weight:900;font-size:18px;letter-spacing:-.3px}
.brand-sub{font-size:10px;color:var(--muted);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-top:1px}
.live{
display:flex;align-items:center;gap:8px;
padding:8px 14px;border-radius:999px;
background:rgba(0,255,163,0.08);border:1px solid rgba(0,255,163,0.22);
font-size:10px;font-weight:800;letter-spacing:.8px;color:var(--emerald);
}
.live-dot{width:8px;height:8px;border-radius:50%;background:var(--emerald);box-shadow:0 0 12px var(--emerald);animation:pulse 1.8s infinite}
.container{max-width:520px;margin:0 auto;padding:18px 16px;position:relative;z-index:1}
.card{
background:linear-gradient(180deg, var(--card2), var(--card));
border:1px solid var(--bd);
border-radius:26px;
padding:20px;
position:relative;
overflow:hidden;
backdrop-filter:blur(18px) saturate(1.2);
-webkit-backdrop-filter:blur(18px) saturate(1.2);
box-shadow:var(--shadow);
transition:transform .28s ease, border-color .28s ease, box-shadow .28s ease;
}
.card::before{
content:'';position:absolute;top:0;left:0;right:0;height:1px;
background:linear-gradient(90deg, transparent, rgba(0,245,255,0.7), rgba(168,85,247,0.7), transparent);
opacity:.9;
}
.card::after{
content:'';position:absolute;top:-60%;left:-30%;width:160%;height:120%;
background:radial-gradient(400px 200px at 30% 20%, rgba(0,245,255,0.08), transparent 70%);
pointer-events:none;
}
.card:hover{transform:translateY(-2px);border-color:var(--bd2);box-shadow:0 28px 70px rgba(0,0,0,0.6)}
.profile{
display:flex;align-items:center;gap:16px;
}
.avatar{
width:62px;height:62px;border-radius:20px;
background:
radial-gradient(120% 120% at 30% 20%, rgba(255,255,255,0.22), transparent 50%),
linear-gradient(135deg, rgba(0,245,255,0.18), rgba(168,85,247,0.22));
border:1px solid rgba(255,255,255,0.14);
display:grid;place-items:center;
color:var(--cyan);
box-shadow:inset 0 1px 0 rgba(255,255,255,0.2);
}
.badge{
display:inline-flex;align-items:center;gap:6px;
padding:6px 12px;border-radius:999px;
font-size:10.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;
background:rgba(255,255,255,0.06);border:1px solid var(--bd);color:var(--muted);
}
.badge.cyan{background:rgba(0,245,255,0.1);border-color:rgba(0,245,255,0.28);color:var(--cyan)}
.badge.purple{background:rgba(168,85,247,0.12);border-color:rgba(168,85,247,0.28);color:#d8b4fe}
.badge.emerald{background:rgba(0,255,163,0.1);border-color:rgba(0,255,163,0.24);color:var(--emerald)}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:14px 0 16px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.stat{
background:linear-gradient(180deg, rgba(18,24,50,0.9), rgba(14,20,44,0.7));
border:1px solid var(--bd);
border-radius:22px;
padding:14px 12px;
position:relative;
overflow:hidden;
}
.stat::before{content:'';position:absolute;inset:0;background:radial-gradient(200px 120px at 80% 0%, rgba(0,245,255,0.12), transparent 70%);pointer-events:none}
.stat-v{font-family:'Outfit',sans-serif;font-weight:900;font-size:22px;color:#fff;position:relative}
.stat-l{font-size:10px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;color:var(--muted);margin-top:3px}
.btn{
width:100%;padding:15px 18px;border-radius:18px;border:none;
font-family:'Outfit',sans-serif;font-weight:800;font-size:13.5px;letter-spacing:.4px;text-transform:uppercase;
cursor:pointer;display:flex;align-items:center;justify-content:center;gap:9px;
transition:transform .2s ease, box-shadow .2s ease, filter .2s ease, opacity .2s ease;
position:relative;overflow:hidden;
}
.btn::before{content:'';position:absolute;inset:0;background:linear-gradient(180deg, rgba(255,255,255,0.18), transparent 60%);pointer-events:none}
.btn:active{transform:scale(.97)}
.btn:disabled{opacity:.45;filter:grayscale(.4);cursor:not-allowed}
.btn-primary{background:linear-gradient(135deg, var(--cyan), var(--blue));color:#00131a;box-shadow:0 10px 28px rgba(0,245,255,0.32)}
.btn-emerald{background:linear-gradient(135deg, var(--emerald), #059669);color:#00140a;box-shadow:0 10px 28px rgba(0,255,163,0.28)}
.btn-purple{background:linear-gradient(135deg, #a855f7, #6d28d9);color:#fff;box-shadow:0 10px 28px rgba(168,85,247,0.32)}
.btn-pink{background:linear-gradient(135deg, #ff3b6e, #be123c);color:#fff}
.btn-ghost{background:rgba(255,255,255,0.06);border:1px solid var(--bd);color:#fff}
.input{
width:100%;padding:15px 16px;border-radius:18px;
background:rgba(10,16,36,0.86);border:1px solid var(--bd);
color:#fff;outline:none;font-size:13px;font-weight:600;
transition:border-color .25s ease, box-shadow .25s ease, background .25s ease;
}
.input:focus{border-color:rgba(0,245,255,0.5);box-shadow:0 0 0 4px rgba(0,245,255,0.12), inset 0 1px 0 rgba(255,255,255,0.08);background:rgba(12,20,48,0.96)}
.input::placeholder{color:#5b668c}
.view{display:none;opacity:0}
.view.active{display:block;opacity:1;animation:viewIn .42s cubic-bezier(.2,.8,.2,1)}
.nav{
position:fixed;bottom:18px;left:50%;transform:translateX(-50%);
width:calc(100% - 28px);max-width:500px;
background:rgba(12,18,40,0.84);backdrop-filter:blur(28px) saturate(1.6);-webkit-backdrop-filter:blur(28px) saturate(1.6);
border:1px solid rgba(255,255,255,0.1);
border-radius:28px;
display:flex;justify-content:space-around;padding:8px;z-index:60;
box-shadow:0 18px 50px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08);
}
.tab{
flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;
padding:10px 6px;border-radius:20px;
color:var(--muted);font-size:9.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;
cursor:pointer;transition:all .28s ease;text-decoration:none;
border:1px solid transparent;
}
.tab.active{color:var(--cyan);background:rgba(0,245,255,0.1);border-color:rgba(0,245,255,0.22);box-shadow:inset 0 1px 0 rgba(255,255,255,0.08), 0 6px 18px rgba(0,245,255,0.12)}
.wheel-wrap{position:relative;width:280px;height:280px;margin:0 auto}
.wheel{
width:280px;height:280px;border-radius:50%;
border:4px solid rgba(255,255,255,0.08);
box-shadow:0 0 0 1px rgba(255,255,255,0.04) inset, 0 12px 40px rgba(0,0,0,0.45), 0 0 40px rgba(0,245,255,0.15);
transition:transform 4s cubic-bezier(.15,.85,.2,1);
position:relative;overflow:hidden;
}
.wheel-pointer{
position:absolute;top:-6px;left:50%;transform:translateX(-50%);
width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-top:18px solid var(--cyan);
filter:drop-shadow(0 4px 10px rgba(0,245,255,0.6));
z-index:2;
}
.shop-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.shop-item{
background:linear-gradient(180deg, rgba(22,30,64,0.9), rgba(16,22,48,0.72));
border:1px solid var(--bd);
border-radius:22px;
padding:16px;
position:relative;overflow:hidden;
transition:transform .25s ease, border-color .25s ease;
}
.shop-item:hover{transform:translateY(-3px);border-color:rgba(0,245,255,0.22)}
.shop-item.best{border-color:rgba(255,184,0,0.32);box-shadow:0 0 0 1px rgba(255,184,0,0.12) inset}
.shop-badge{position:absolute;top:10px;right:10px;padding:4px 8px;border-radius:999px;font-size:9px;font-weight:900;letter-spacing:.6px;background:linear-gradient(135deg, var(--amber), #ff8c00);color:#000}
.toast{
position:fixed;top:18px;left:50%;transform:translateX(-50%) translateY(-20px);
background:rgba(14,20,44,0.92);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
border:1px solid rgba(255,255,255,0.12);border-radius:22px;
padding:14px 16px;display:flex;gap:12px;align-items:center;
min-width:300px;max-width:92vw;
box-shadow:0 18px 50px rgba(0,0,0,0.6);
opacity:0;pointer-events:none;transition:all .38s cubic-bezier(.2,.8,.2,1);z-index:10000;
}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto}
.toast-bar{position:absolute;bottom:0;left:0;height:3px;background:linear-gradient(90deg, var(--cyan), var(--purple));border-radius:0 0 22px 22px;animation:toastProg 3s linear forwards}
@keyframes toastProg{from{width:100%}to{width:0%}}
.modal{position:fixed;inset:0;background:rgba(0,0,0,0.72);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);display:none;place-items:center;z-index:9000;padding:18px}
.modal.open{display:grid}
.modal-box{max-width:94vw;max-height:90vh;display:flex;flex-direction:column;gap:16px;align-items:center}
.proof-preview{position:relative;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);margin-top:12px}
.proof-preview img{width:100%;max-height:240px;object-fit:cover;display:block}
.zoom-overlay{position:absolute;inset:0;background:linear-gradient(0deg, rgba(0,0,0,0.65), transparent 60%);display:flex;align-items:flex-end;justify-content:center;padding:12px;opacity:0;transition:opacity .25s ease}
.proof-preview:hover .zoom-overlay{opacity:1}
.streak{display:flex;gap:8px;margin-top:12px}
.streak-day{width:36px;height:44px;border-radius:12px;background:rgba(255,255,255,0.05);border:1px solid var(--bd);display:grid;place-items:center;font-size:11px;font-weight:800;color:var(--muted);transition:all .25s ease}
.streak-day.active{background:linear-gradient(135deg, rgba(0,245,255,0.18), rgba(168,85,247,0.18));border-color:rgba(0,245,255,0.32);color:#fff;box-shadow:0 6px 18px rgba(0,245,255,0.18)}
.invoice{
background:linear-gradient(135deg, rgba(0,245,255,0.08), rgba(168,85,247,0.08));
border:1px solid rgba(0,245,255,0.22);
border-radius:22px;padding:16px;margin-bottom:14px;position:relative;overflow:hidden;
}
.skeleton{background:linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%);background-size:200% 100%;animation:skeleton 1.2s infinite}
@keyframes skeleton{0%{background-position:200% 0}100%{background-position:-200% 0}}
@media (max-width:380px){.grid3{grid-template-columns:1fr 1fr;gap:10px}.shop-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="loader" id="loader">
  <div class="loader-card">
    <svg class="icon" style="width:40px;height:40px;animation:spin 1.6s linear infinite;color:#fff" viewBox="0 0 24 24"><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>
  </div>
  <div class="loader-title">WALZY CYBER STORE</div>
  <div class="loader-sub" id="loadText">Initializing Quantum Protocol...</div>
  <div class="loader-bar"><div class="loader-bar-inner"></div></div>
</div>

<div class="toast" id="toast">
  <div id="toastIcon" style="width:38px;height:38px;border-radius:14px;background:rgba(0,245,255,0.12);display:grid;place-items:center;color:var(--cyan)"><svg class="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
  <div style="flex:1">
    <div id="toastTitle" style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;color:#fff">System</div>
    <div id="toastMsg" style="font-size:12px;color:var(--muted);margin-top:2px;font-weight:600">Message</div>
  </div>
  <div class="toast-bar" id="toastProgress"></div>
</div>

<div class="modal" id="imageZoomModal" onclick="closeZoomModal()">
  <div class="modal-box" onclick="event.stopPropagation()">
    <img id="zoomedImageSrc" src="" style="max-width:100%;max-height:78vh;object-fit:contain;border-radius:22px;box-shadow:0 20px 70px rgba(0,0,0,0.8);border:1px solid rgba(255,255,255,0.12)">
    <button class="btn btn-ghost" style="width:auto;padding:12px 28px" onclick="closeZoomModal()">Tutup</button>
  </div>
</div>

<div class="header">
  <div class="brand">
    <div class="brand-logo">W</div>
    <div>
      <div class="brand-name">WALZY STORE</div>
      <div class="brand-sub">CYBER SUITE • PREMIUM</div>
    </div>
  </div>
  <div class="live" id="liveBadge"><span class="live-dot"></span> ONLINE REALTIME</div>
</div>

<div class="container">
  <div id="viewUserArea">
    <div id="viewHome" class="view active">
      <div class="card">
        <div class="profile">
          <div class="avatar"><svg class="icon" style="width:30px;height:30px" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <div style="flex:1">
            <div id="uName" style="font-family:'Outfit',sans-serif;font-weight:800;font-size:18px;color:#fff">User Walzy</div>
            <div id="uIdText" style="font-size:11px;color:var(--muted);margin-top:2px;font-weight:700">ID: --</div>
            <div style="display:flex;gap:8px;margin-top:10px">
              <span class="badge cyan" id="uRankBadge">BASIC</span>
              <span class="badge purple" id="uStatusBadge">Gratis</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid3">
        <div class="stat"><div class="stat-v" style="color:var(--cyan)" id="sQuota">5/5</div><div class="stat-l">Kuota Fix</div></div>
        <div class="stat"><div class="stat-v" id="sRefs">0</div><div class="stat-l">Referral</div></div>
        <div class="stat"><div class="stat-v" style="color:var(--amber)" id="sPoints">0</div><div class="stat-l">Poin Store</div></div>
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:16px;display:flex;align-items:center;gap:10px"><span style="width:28px;height:28px;border-radius:10px;background:rgba(255,184,0,0.12);display:grid;place-items:center;color:var(--amber)"><svg class="icon" style="width:16px;height:16px" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span> Spin Wheel Harian</div>
          <span class="badge">Daily Rewards</span>
        </div>
        <div class="wheel-wrap"><div class="wheel-pointer"></div><canvas id="spinCanvas" class="wheel" width="280" height="280"></canvas></div>
        <button class="btn btn-primary" id="spinBtn" style="margin-top:16px" onclick="triggerSpin(this)">Putar Spin Keberuntungan</button>
      </div>

      <div class="card">
        <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:15px;margin-bottom:10px;display:flex;align-items:center;gap:10px"><span style="width:28px;height:28px;border-radius:10px;background:rgba(0,255,163,0.12);display:grid;place-items:center;color:var(--emerald)"><svg class="icon" style="width:16px;height:16px" viewBox="0 0 24 24"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h16v5"/><path d="M20 12v5H6a2 2 0 0 0-2 2c0 1.1.9 2 2 2h16v-5"/><path d="M16 8l4 4-4 4"/></svg></span> Redeem Voucher</div>
        <input class="input" id="vCodeInput" placeholder="Masukkan kode promo VIP">
        <button class="btn btn-emerald" style="margin-top:12px" onclick="claimVoucher(this)">Tukarkan Sekarang</button>
      </div>

      <div class="card">
        <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:15px;margin-bottom:6px;display:flex;align-items:center;gap:10px"><span style="width:28px;height:28px;border-radius:10px;background:rgba(168,85,247,0.14);display:grid;place-items:center;color:var(--purple)"><svg class="icon" style="width:16px;height:16px" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span> Referral System</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:12px;font-weight:600">Dapat +50 Poin setiap user baru bergabung via link kamu</div>
        <input class="input" id="refUrlInput" readonly value="Memuat link...">
        <button class="btn btn-primary" style="margin-top:12px" onclick="copyRefLink()">Salin Link Referral</button>
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:15px">Check-in Harian</div>
          <div class="badge emerald" id="checkinPointsVal">0 PTS</div>
        </div>
        <div class="streak" id="streakContainer">
          <div class="streak-day" id="stDay1">D1</div>
          <div class="streak-day" id="stDay2">D2</div>
          <div class="streak-day" id="stDay3">D3</div>
          <div class="streak-day" id="stDay4">D4</div>
          <div class="streak-day" id="stDay5">D5</div>
          <div class="streak-day" id="stDay6">D6</div>
          <div class="streak-day" id="stDay7">D7</div>
        </div>
        <button class="btn btn-emerald" id="checkinBtn" style="margin-top:14px" onclick="triggerCheckin(this)">Check-in Hari Ini</button>
        <div style="margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <button class="btn btn-ghost" style="padding:12px;font-size:12px" onclick="redeemPoints('quota', this)">Tukar 100 PTS = +1 Kuota</button>
          <button class="btn btn-ghost" style="padding:12px;font-size:12px" onclick="redeemPoints('spin', this)">Tukar 150 PTS = Spin</button>
        </div>
      </div>
    </div>

    <div id="viewOrder" class="view">
      <div style="font-family:'Outfit',sans-serif;font-weight:900;font-size:22px;letter-spacing:-.4px">VIP Marketplace</div>
      <div style="font-size:13px;color:var(--muted);margin:6px 0 18px;font-weight:600">Upgrade ke VIP untuk kuota unlimited & fitur eksklusif</div>
      <div id="activeInvoiceBox"></div>
      <div class="shop-grid">
        <div class="shop-item">
          <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:15px">VIP Trial</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px;font-weight:600">3 Hari Full Access</div>
          <div style="font-family:'Outfit',sans-serif;font-weight:900;font-size:18px;color:var(--cyan);margin-top:10px">Rp 7.000</div>
          <button class="btn btn-primary btn-buy-pkg" style="padding:11px;font-size:11px;margin-top:12px" onclick="createOrder(3,7000,this)">Beli 3 Hari</button>
        </div>
        <div class="shop-item">
          <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:15px">VIP Hemat</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px;font-weight:600">5 Hari Best Deal</div>
          <div style="font-family:'Outfit',sans-serif;font-weight:900;font-size:18px;color:var(--cyan);margin-top:10px">Rp 10.000</div>
          <button class="btn btn-primary btn-buy-pkg" style="padding:11px;font-size:11px;margin-top:12px" onclick="createOrder(5,10000,this)">Beli 5 Hari</button>
        </div>
        <div class="shop-item">
          <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:15px">VIP Starter</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px;font-weight:600">7 Hari Popular</div>
          <div style="font-family:'Outfit',sans-serif;font-weight:900;font-size:18px;color:var(--emerald);margin-top:10px">Rp 15.000</div>
          <button class="btn btn-emerald btn-buy-pkg" style="padding:11px;font-size:11px;margin-top:12px" onclick="createOrder(7,15000,this)">Beli 7 Hari</button>
        </div>
        <div class="shop-item">
          <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:15px">VIP Pro</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px;font-weight:600">14 Hari Value</div>
          <div style="font-family:'Outfit',sans-serif;font-weight:900;font-size:18px;color:var(--purple);margin-top:10px">Rp 25.000</div>
          <button class="btn btn-purple btn-buy-pkg" style="padding:11px;font-size:11px;margin-top:12px" onclick="createOrder(14,25000,this)">Beli 14 Hari</button>
        </div>
        <div class="shop-item best" style="grid-column:span 2">
          <span class="shop-badge">🔥 BEST SELLER</span>
          <div style="font-family:'Outfit',sans-serif;font-weight:900;font-size:18px">VIP Sultan 30 Hari</div>
          <div style="font-size:12px;color:var(--muted);margin-top:4px;font-weight:600">Unlimited Fix • Prioritas • Bonus 500 PTS</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px">
            <div style="font-family:'Outfit',sans-serif;font-weight:900;font-size:22px;color:var(--amber)">Rp 40.000</div>
            <button class="btn btn-primary btn-buy-pkg" style="width:auto;padding:12px 22px;background:linear-gradient(135deg, var(--amber), #ff7a00);color:#000" onclick="createOrder(30,40000,this)">Beli Sultan</button>
          </div>
        </div>
      </div>
    </div>

    <div id="viewProfile" class="view">
      <div style="font-family:'Outfit',sans-serif;font-weight:900;font-size:22px">Profil & Statistik</div>
      <div style="font-size:13px;color:var(--muted);margin:6px 0 18px;font-weight:600">Kelola akun dan lihat progress kamu</div>
      <div class="card"><div style="font-weight:800;font-family:'Outfit',sans-serif;margin-bottom:12px">Invoice Saya</div><div id="profileInvoiceList" style="font-size:12px;color:var(--muted)">Memuat invoice...</div></div>
    </div>
  </div>

  <div id="viewOwnerArea" style="display:none">
    <div id="viewOwnerHome" class="view active">
      <div class="card">
        <div style="font-family:'Outfit',sans-serif;font-weight:900;font-size:18px;display:flex;align-items:center;gap:10px">👑 Executive Dashboard</div>
        <div class="grid2" style="margin-top:16px">
          <div class="stat"><div class="stat-v" style="color:var(--emerald)" id="oRev">Rp 0</div><div class="stat-l">Revenue</div></div>
          <div class="stat"><div class="stat-v" id="oUsers">0</div><div class="stat-l">Total User</div></div>
          <div class="stat"><div class="stat-v" style="color:var(--amber)" id="oPending">0</div><div class="stat-l">Pending</div></div>
          <div class="stat"><div class="stat-v" style="color:var(--cyan)" id="oPremium">0</div><div class="stat-l">VIP Active</div></div>
        </div>
      </div>
      <div class="card"><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:15px;margin-bottom:12px">Pending Deposit</div><div id="oPendingList"></div></div>
      <div class="card"><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:15px;margin-bottom:12px">Manajemen Voucher</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px"><input class="input" id="vGenCode" placeholder="Kode VOUCHER"><input class="input" id="vGenDays" placeholder="Hari" type="number"><input class="input" id="vGenQuota" placeholder="Kuota (0=∞)" type="number" style="grid-column:span 2"></div>
        <button class="btn btn-purple" onclick="createVoucher(this)">Buat Voucher</button>
        <div id="oVoucherList" style="margin-top:14px"></div>
      </div>
      <div class="card"><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:15px;margin-bottom:12px">Broadcast</div><textarea class="input" id="bcTextInput" style="min-height:110px;resize:none" placeholder="Pesan broadcast ke semua user..."></textarea><button class="btn btn-primary" style="margin-top:12px" onclick="sendBroadcast(this)">Kirim Broadcast Sekarang</button></div>
      <div class="card"><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:15px;margin-bottom:12px">User Terbaru</div><div id="oUserList"></div></div>
    </div>
  </div>
</div>

<div class="nav" id="userNavBar">
  <div class="tab active" onclick="switchTab('viewHome', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Home</div>
  <div class="tab" onclick="switchTab('viewOrder', this)"><svg class="icon" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Store</div>
  <div class="tab" onclick="switchTab('viewProfile', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Profil</div>
</div>

<div class="nav" id="ownerNavBar" style="display:none">
  <div class="tab active" onclick="switchOwnerTab('viewOwnerHome', this)"><svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Dashboard</div>
  <div class="tab" onclick="loadOwnerData()"><svg class="icon" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>Refresh</div>
</div>

<input type="file" id="proofFileInput" accept="image/*" style="display:none" onchange="submitProofFile(event)">

<script>
var tg=null;
var currentUserId=null;
var currentFirstName='';
var currentUsername='';
var activeInvoiceId=null;
var isUserOwner=false;
var toastTimeout=null;
var isSpinning=false;
var pollingTimer=null;
var wheelRotation=0;
var wheelPrizes=[
{label:"+50 PTS",color:"#a855f7"},
{label:"ZONK",color:"#1e293b"},
{label:"+25 PTS",color:"#00f5ff"},
{label:"+100 PTS",color:"#ffb800"},
{label:"+3 KUOTA",color:"#00ffa3"},
{label:"VIP 1 HARI",color:"#5b8def"}
];

function hideLoader(){
  var ldr=document.getElementById('loader');
  if(!ldr) return;
  if(ldr.classList.contains('hidden')) return;
  ldr.classList.add('hidden');
  setTimeout(function(){ ldr.style.display='none'; }, 600);
}

function forceHideLoader(){
  hideLoader();
  setTimeout(hideLoader, 400);
  setTimeout(hideLoader, 1200);
}

function showToast(title, msg, type){
  var toast=document.getElementById('toast');
  var tTitle=document.getElementById('toastTitle');
  var tMsg=document.getElementById('toastMsg');
  var tIcon=document.getElementById('toastIcon');
  if(!toast) return;
  tTitle.textContent=title||'System';
  tMsg.textContent=msg||'';
  var colors={success:'var(--emerald)',error:'var(--pink)',warning:'var(--amber)',info:'var(--cyan)'};
  var c=colors[type]||'var(--cyan)';
  tIcon.style.color=c;
  tIcon.style.background='rgba(255,255,255,0.06)';
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  var prog=document.getElementById('toastProgress');
  if(prog){ prog.style.animation='none'; void prog.offsetWidth; prog.style.animation='toastProg 3s linear forwards'; prog.style.background='linear-gradient(90deg,'+c+', '+c+')'; }
  toastTimeout=setTimeout(function(){ toast.classList.remove('show'); }, 3200);
  if(tg && tg.HapticFeedback){ try{ tg.HapticFeedback.notificationOccurred(type==='error'?'error':type==='success'?'success':'warning'); }catch(e){} }
}

function drawWheel(){
  var canvas=document.getElementById('spinCanvas');
  if(!canvas) return;
  var ctx=canvas.getContext('2d');
  if(!ctx) return;
  var w=canvas.width;
  var h=canvas.height;
  var cx=w/2;
  var cy=h/2;
  var r=Math.min(w,h)/2 - 6;
  ctx.clearRect(0,0,w,h);
  var slices=wheelPrizes.length;
  var anglePer=slices>0 ? (Math.PI*2)/slices : 0;
  for(var i=0;i<slices;i++){
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,i*anglePer,(i+1)*anglePer);
    ctx.closePath();
    ctx.fillStyle=wheelPrizes[i].color;
    ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.18)';
    ctx.lineWidth=2;
    ctx.stroke();
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(i*anglePer + anglePer/2);
    ctx.textAlign='right';
    ctx.fillStyle='#fff';
    ctx.font='bold 12px Outfit';
    ctx.fillText(wheelPrizes[i].label, r-18, 4);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(cx,cy,42,0,Math.PI*2);
  ctx.fillStyle='rgba(10,16,36,0.92)';
  ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.14)';
  ctx.lineWidth=2;
  ctx.stroke();
  ctx.fillStyle='#fff';
  ctx.font='900 13px Outfit';
  ctx.textAlign='center';
  ctx.fillText('WALZY', cx, cy-2);
  ctx.fillStyle='var(--muted)';
  ctx.font='700 9px Plus Jakarta Sans';
  ctx.fillText('SPIN', cx, cy+10);
}

function openZoomModal(src){
  var m=document.getElementById('imageZoomModal');
  var img=document.getElementById('zoomedImageSrc');
  if(!m||!img) return;
  img.src=src;
  m.classList.add('open');
}
function closeZoomModal(){
  var m=document.getElementById('imageZoomModal');
  if(m) m.classList.remove('open');
}

function switchTab(viewId, el){
  var views=document.querySelectorAll('#viewUserArea .view');
  views.forEach(function(v){ v.classList.remove('active'); });
  var target=document.getElementById(viewId);
  if(target) target.classList.add('active');
  var tabs=document.querySelectorAll('#userNavBar .tab');
  tabs.forEach(function(t){ t.classList.remove('active'); });
  if(el) el.classList.add('active');
  if(tg && tg.HapticFeedback){ try{ tg.HapticFeedback.selectionChanged(); }catch(e){} }
  window.scrollTo({top:0, behavior:'smooth'});
}

function switchOwnerTab(viewId, el){
  var views=document.querySelectorAll('#viewOwnerArea .view');
  views.forEach(function(v){ v.classList.remove('active'); });
  var target=document.getElementById(viewId);
  if(target) target.classList.add('active');
  var tabs=document.querySelectorAll('#ownerNavBar .tab');
  tabs.forEach(function(t){ t.classList.remove('active'); });
  if(el) el.classList.add('active');
}

function initApp(){
  try{
    tg=window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    if(tg){
      try{ tg.ready(); tg.expand(); if(tg.setHeaderColor){ tg.setHeaderColor('#050814'); } if(tg.setBackgroundColor){ tg.setBackgroundColor('#050814'); } }catch(e){}
    }
    if(tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id){
      currentUserId=tg.initDataUnsafe.user.id;
      currentFirstName=tg.initDataUnsafe.user.first_name||'';
      currentUsername=tg.initDataUnsafe.user.username||'';
    }else{
      var sp=new URLSearchParams(window.location.search);
      currentUserId=sp.get('user_id')||sp.get('userId')||sp.get('id')||localStorage.getItem('walzy_uid')||null;
      currentFirstName=sp.get('first_name')||sp.get('firstName')||'';
      currentUsername=sp.get('username')||'';
    }
    if(currentUserId){
      try{ localStorage.setItem('walzy_uid', String(currentUserId)); }catch(e){}
    }
    drawWheel();
    var lt=document.getElementById('loadText');
    if(lt) lt.textContent='Menghubungkan ke server realtime...';
    setTimeout(function(){ hideLoader(); }, 700);
    setTimeout(function(){ hideLoader(); }, 1500);
    if(currentUserId){
      loadUserData(false);
      if(!pollingTimer){
        pollingTimer=setInterval(function(){ loadUserData(true); }, 4000);
      }
    }else{
      hideLoader();
      showToast('Mode Tamu', 'Buka via Telegram untuk akses penuh', 'info');
    }
  }catch(err){
    hideLoader();
  }
}

async function loadUserData(isSilent){
  try{
    if(!currentUserId) return;
    var queryUrl='/api/api?endpoint=user&user_id='+encodeURIComponent(currentUserId);
    if(currentFirstName) queryUrl+='&first_name='+encodeURIComponent(currentFirstName);
    if(currentUsername) queryUrl+='&username='+encodeURIComponent(currentUsername);
    var controller=new AbortController();
    var to=setTimeout(function(){ controller.abort(); }, 8000);
    var res=await fetch(queryUrl, {signal:controller.signal, headers:{'Accept':'application/json'}});
    clearTimeout(to);
    var data=await res.json();
    if(!data || !data.ok || !data.user) {
      if(!isSilent) hideLoader();
      return;
    }
    var u=data.user;
    isUserOwner=!!u.isOwner;
    var elName=document.getElementById('uName');
    if(elName) elName.textContent=u.first_name||'User Walzy';
    var elId=document.getElementById('uIdText');
    if(elId) elId.textContent='ID: '+u.id;
    var elRank=document.getElementById('uRankBadge');
    if(elRank) elRank.textContent=u.rank ? u.rank.name : 'BASIC';
    var elStatus=document.getElementById('uStatusBadge');
    if(elStatus) elStatus.textContent=u.isPremium ? 'VIP ('+u.premiumLeftDays+'H)' : 'Gratis';
    var elQuota=document.getElementById('sQuota');
    if(elQuota) elQuota.textContent=u.dailyFixRemaining||'5/5';
    var elRefs=document.getElementById('sRefs');
    if(elRefs) elRefs.textContent=u.referralCount||0;
    var elPts=document.getElementById('sPoints');
    if(elPts) elPts.textContent=u.points||0;
    var elChkPts=document.getElementById('checkinPointsVal');
    if(elChkPts) elChkPts.textContent=(u.points||0)+' PTS';
    var elRefUrl=document.getElementById('refUrlInput');
    if(elRefUrl) elRefUrl.value=u.referralLink||'';
    var spinBtn=document.getElementById('spinBtn');
    if(spinBtn && !isSpinning) spinBtn.disabled=!u.canSpin;
    var chkBtn=document.getElementById('checkinBtn');
    if(chkBtn){ chkBtn.disabled=!u.canCheckin; chkBtn.textContent=u.canCheckin ? 'Check-in Hari Ini' : 'Sudah Check-in'; }
    for(var i=1;i<=7;i++){
      var el=document.getElementById('stDay'+i);
      if(el){
        if(i <= (u.checkinStreak||0)) el.classList.add('active');
        else el.classList.remove('active');
      }
    }
    if(isUserOwner){
      var ua=document.getElementById('viewUserArea');
      if(ua) ua.style.display='none';
      var un=document.getElementById('userNavBar');
      if(un) un.style.display='none';
      var oa=document.getElementById('viewOwnerArea');
      if(oa) oa.style.display='block';
      var onb=document.getElementById('ownerNavBar');
      if(onb) onb.style.display='flex';
      loadOwnerData();
    }else{
      var ua2=document.getElementById('viewUserArea');
      if(ua2) ua2.style.display='block';
      var un2=document.getElementById('userNavBar');
      if(un2) un2.style.display='flex';
      var oa2=document.getElementById('viewOwnerArea');
      if(oa2) oa2.style.display='none';
      var onb2=document.getElementById('ownerNavBar');
      if(onb2) onb2.style.display='none';
    }
    var invBox=document.getElementById('activeInvoiceBox');
    var buyBtns=document.querySelectorAll('.btn-buy-pkg');
    if(data.currentInvoice && invBox){
      var inv=data.currentInvoice;
      activeInvoiceId=inv.id||inv.invoice;
      buyBtns.forEach(function(btn){ btn.disabled=true; });
      var proofHtml=inv.proofImage ? '<div class="proof-preview"><img src="'+inv.proofImage+'" onclick="openZoomModal(\\''+inv.proofImage+'\\')"><div class="zoom-overlay"><span class="badge cyan">Perbesar Foto</span></div></div>' : '<div style="font-size:12px;color:var(--muted);margin-top:8px">Belum upload bukti • Invoice: <b style="color:#fff">'+(inv.id||inv.invoice)+'</b></div>';
      var statusText=inv.status==='waiting_approval' ? 'Menunggu Verifikasi Admin' : inv.status==='paid' ? 'Lunas - VIP Aktif' : 'Menunggu Pembayaran';
      invBox.innerHTML='<div class="invoice"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-family:Outfit;font-weight:800;font-size:14px">Invoice Aktif</div><span class="badge cyan">'+statusText+'</span></div><div style="margin-top:10px;font-size:12px;color:var(--muted)">ID: <b style="color:#fff">'+(inv.id||inv.invoice)+'</b> • '+inv.days+' Hari • Rp '+(inv.amount||0).toLocaleString('id-ID')+'</div>'+proofHtml+'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px"><button class="btn btn-primary" style="padding:11px;font-size:11px" onclick="triggerUploadProof()">Upload Bukti</button><button class="btn btn-ghost" style="padding:11px;font-size:11px" onclick="cancelOrder(\\''+(inv.id||inv.invoice)+'\\', this)">Batalkan</button></div></div>';
      var pil=document.getElementById('profileInvoiceList');
      if(pil) pil.innerHTML=invBox.innerHTML;
    }else{
      if(invBox) invBox.innerHTML='';
      buyBtns.forEach(function(btn){ btn.disabled=false; });
      if(data.invoices && data.invoices.length>0){
        var pil2=document.getElementById('profileInvoiceList');
        if(pil2){
          pil2.innerHTML=data.invoices.slice(-5).reverse().map(function(iv){
            return '<div class="invoice" style="padding:12px"><div style="font-weight:800;font-size:13px">'+(iv.id||iv.invoice)+' • '+(iv.days||0)+' Hari</div><div style="font-size:11px;color:var(--muted);margin-top:4px">Rp '+(iv.amount||0).toLocaleString('id-ID')+' • '+iv.status+'</div></div>';
          }).join('');
        }
      }
    }
    hideLoader();
  }catch(e){
    hideLoader();
  }
}

async function triggerSpin(btn){
  if(isSpinning) return;
  if(!currentUserId) return showToast('Error','User ID tidak ditemukan','error');
  if(btn){ btn.disabled=true; btn.textContent='Memutar...'; }
  isSpinning=true;
  try{
    var res=await fetch('/api/api?endpoint=spin', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId})});
    var data=await res.json();
    if(data && data.ok){
      var pIndex=data.prizeIndex!==undefined ? data.prizeIndex : Math.floor(Math.random()*wheelPrizes.length);
      var slices=wheelPrizes.length;
      var anglePer=360/slices;
      var targetAngle=360*5 + (360 - (pIndex*anglePer + anglePer/2));
      wheelRotation+=targetAngle;
      var canvas=document.getElementById('spinCanvas');
      if(canvas) canvas.style.transform='rotate('+wheelRotation+'deg)';
      setTimeout(function(){
        showToast('Spin Berhadiah', data.message||'Kamu mendapatkan hadiah!', 'success');
        loadUserData();
        if(btn){ btn.disabled=false; btn.textContent='Putar Spin Harian'; }
        isSpinning=false;
      }, 4200);
    }else{
      showToast('Gagal Spin', data ? data.message : 'Gagal memutar spin', 'error');
      if(btn){ btn.disabled=false; btn.textContent='Putar Spin Harian'; }
      isSpinning=false;
    }
  }catch(e){
    showToast('Error','Gagal memutar spin','error');
    if(btn){ btn.disabled=false; btn.textContent='Putar Spin Harian'; }
    isSpinning=false;
  }
}

async function triggerCheckin(btn){
  if(!currentUserId) return;
  if(btn){ btn.disabled=true; btn.textContent='Memproses...'; }
  try{
    var res=await fetch('/api/api?endpoint=checkin', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId})});
    var data=await res.json();
    showToast(data.ok ? 'Check-in Berhasil' : 'Info', data.message, data.ok ? 'success' : 'warning');
    loadUserData();
  }catch(e){ showToast('Error','Gagal check-in','error'); }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Check-in Hari Ini'; } }
}

async function redeemPoints(option, btn){
  if(!currentUserId) return;
  if(btn){ btn.disabled=true; }
  try{
    var res=await fetch('/api/api?endpoint=redeem', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, option:option})});
    var data=await res.json();
    showToast(data.ok ? 'Point Vault' : 'Gagal', data.message, data.ok ? 'success' : 'error');
    if(data.ok) loadUserData();
  }catch(e){ showToast('Error','Gagal redeem','error'); }
  finally{ if(btn) btn.disabled=false; }
}

async function createOrder(days, amount, btn){
  if(!currentUserId) return showToast('Error','User ID tidak ditemukan','error');
  if(btn){ btn.disabled=true; btn.textContent='Membuat...'; }
  try{
    var res=await fetch('/api/api?endpoint=create_order', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, days:days, amount:amount})});
    var data=await res.json();
    if(data.ok){
      showToast('Invoice Dibuat','ID: '+(data.invoice.invoice||data.invoice.id),'success');
      loadUserData();
    }else{
      showToast('Gagal',''+(data.message||'Gagal membuat invoice'),'error');
    }
  }catch(e){ showToast('Error','Gagal membuat pesanan','error'); }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Beli VIP '+days+'H'; if(days===30) btn.textContent='Beli Sultan'; } }
}

async function cancelOrder(invoiceId, btn){
  if(!currentUserId) return;
  if(btn){ btn.disabled=true; }
  try{
    var res=await fetch('/api/api?endpoint=cancel_order', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, invoice:invoiceId})});
    var data=await res.json();
    showToast(data.ok ? 'Dibatalkan' : 'Gagal', data.message, data.ok ? 'success' : 'error');
    if(data.ok) loadUserData();
  }catch(e){ showToast('Error','Gagal membatalkan','error'); }
  finally{ if(btn) btn.disabled=false; }
}

function triggerUploadProof(){
  var input=document.getElementById('proofFileInput');
  if(input) input.click();
}

async function submitProofFile(event){
  var file=event.target.files && event.target.files[0];
  if(!file) return;
  if(!activeInvoiceId) return showToast('Error','Tidak ada invoice aktif','error');
  if(file.size>5*1024*1024) return showToast('Error','File maksimal 5MB','error');
  var reader=new FileReader();
  reader.onload=function(e){
    (async function(){
      try{
        var base64=e.target.result;
        showToast('Uploading','Mengunggah bukti...','info');
        var res=await fetch('/api/api?endpoint=upload_proof', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, invoice:activeInvoiceId, image_data:base64})});
        var data=await res.json();
        showToast(data.ok ? 'Sukses Upload' : 'Gagal', data.message, data.ok ? 'success' : 'error');
        if(data.ok) loadUserData();
      }catch(err){ showToast('Error','Gagal upload bukti','error'); }
    })();
  };
  reader.readAsDataURL(file);
  event.target.value='';
}

async function claimVoucher(btn){
  var codeEl=document.getElementById('vCodeInput');
  if(!codeEl) return;
  var code=codeEl.value.trim();
  if(!code) return showToast('Error','Masukkan kode voucher!','warning');
  if(!currentUserId) return showToast('Error','User ID tidak ditemukan','error');
  if(btn){ btn.disabled=true; btn.textContent='Memproses...'; }
  try{
    var res=await fetch('/api/api?endpoint=claim_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, code:code})});
    var data=await res.json();
    showToast(data.ok ? 'Sukses Klaim' : 'Gagal Klaim', data.message, data.ok ? 'success' : 'error');
    if(data.ok){ codeEl.value=''; loadUserData(); }
  }catch(e){ showToast('Error','Gagal klaim voucher','error'); }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Tukarkan Sekarang'; } }
}

function copyRefLink(){
  var el=document.getElementById('refUrlInput');
  if(!el||!el.value) return showToast('Error','Link referral belum tersedia','warning');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(el.value).then(function(){ showToast('Berhasil','Link referral disalin!','success'); }).catch(function(){
      el.select(); document.execCommand('copy'); showToast('Berhasil','Link disalin!','success');
    });
  }else{
    el.select(); document.execCommand('copy'); showToast('Berhasil','Link disalin!','success');
  }
}

async function loadOwnerData(){
  try{
    if(!currentUserId) return;
    var res=await fetch('/api/api?endpoint=stats&user_id='+encodeURIComponent(currentUserId));
    var d=await res.json();
    if(d && d.ok){
      var elRev=document.getElementById('oRev');
      if(elRev) elRev.textContent='Rp '+(d.revenue||0).toLocaleString('id-ID');
      var elUsers=document.getElementById('oUsers');
      if(elUsers) elUsers.textContent=d.usersValid||0;
      var elPend=document.getElementById('oPending');
      if(elPend) elPend.textContent=(d.pendingPayments||[]).length;
      var elPrem=document.getElementById('oPremium');
      if(elPrem) elPrem.textContent=d.premium||0;
      var pendingList=document.getElementById('oPendingList');
      if(pendingList){
        if(d.pendingPayments && d.pendingPayments.length>0){
          pendingList.innerHTML=d.pendingPayments.map(function(p){
            return '<div class="card" style="padding:14px;margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-family:Outfit;font-weight:800;font-size:13px;color:#fff">Invoice '+p.id+'</div><div style="font-size:11px;color:var(--muted);margin-top:2px">User: '+p.userId+' | '+p.days+' Hari | Rp '+(p.amount||0).toLocaleString('id-ID')+'</div>'+(p.proofImage ? '<div class="proof-preview" style="margin-top:10px"><img src="'+p.proofImage+'" onclick="openZoomModal(\\''+p.proofImage+'\\')"></div>' : '<div style="font-size:11px;color:var(--amber);margin-top:8px">Belum upload bukti</div>')+'</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px"><button class="btn btn-emerald" style="padding:10px;font-size:11px" onclick="ownerAct(\\''+p.id+'\\', \\'approve\\', this)">Setujui</button><button class="btn btn-pink" style="padding:10px;font-size:11px" onclick="ownerAct(\\''+p.id+'\\', \\'reject\\', this)">Tolak</button></div></div>';
          }).join('');
        }else{
          pendingList.innerHTML='<div style="font-size:12px;color:var(--muted);font-weight:600">Tidak ada pending deposit.</div>';
        }
      }
      var userList=document.getElementById('oUserList');
      if(userList){
        if(d.recentUsers && d.recentUsers.length>0){
          userList.innerHTML=d.recentUsers.slice(0,15).map(function(u){
            var isVip=u.premiumUntil && u.premiumUntil>Date.now();
            return '<div class="card" style="padding:14px"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-family:Outfit;font-weight:800;font-size:13px;color:#fff">'+(u.first_name||'User Walzy')+'</div><div style="font-size:11px;color:var(--muted);font-weight:600">ID: '+u.id+' | Order: '+(u.totalFix||0)+'</div></div><span class="badge '+(isVip?'cyan':'')+'">'+(isVip?'VIP':'Free')+'</span></div></div>';
          }).join('');
        }
      }
      var vList=document.getElementById('oVoucherList');
      if(vList){
        if(d.codes && d.codes.length>0){
          vList.innerHTML=d.codes.map(function(c){
            return '<div class="card" style="padding:14px"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-family:Outfit;font-weight:800;font-size:13px;color:#fff">'+c.code+'</div><div style="font-size:11px;color:var(--muted);margin-top:2px;font-weight:600">'+c.days+' Hari | Terpakai: '+(c.used||0)+'/'+(c.quota||'∞')+'</div></div><button class="btn btn-pink" style="width:auto;padding:8px 14px;font-size:10px" onclick="deleteVoucher(\\''+c.code+'\\', this)">Hapus</button></div></div>';
          }).join('');
        }else{
          vList.innerHTML='<div style="font-size:12px;color:var(--muted);font-weight:600">Belum ada voucher aktif.</div>';
        }
      }
    }
  }catch(e){}
}

async function ownerAct(invoice, action, btn){
  if(btn){ btn.disabled=true; btn.textContent='Memproses...'; }
  try{
    var res=await fetch('/api/api?endpoint=owner_action', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, invoice:invoice, action:action})});
    var data=await res.json();
    showToast(data.ok ? 'Sukses' : 'Gagal', data.message, data.ok ? 'success' : 'error');
    if(data.ok) loadOwnerData();
  }catch(e){ showToast('Error','Gagal memproses aksi','error'); }
  finally{ if(btn){ btn.disabled=false; btn.textContent=action==='approve'?'Setujui':'Tolak'; } }
}

async function createVoucher(btn){
  var code=document.getElementById('vGenCode').value.trim();
  var days=document.getElementById('vGenDays').value;
  var quota=document.getElementById('vGenQuota').value;
  if(!code||!days) return showToast('Error','Lengkapi kode dan durasi!','warning');
  if(btn){ btn.disabled=true; btn.textContent='Membuat...'; }
  try{
    var res=await fetch('/api/api?endpoint=create_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, code:code, days:days, quota:quota})});
    var data=await res.json();
    showToast(data.ok ? 'Voucher Dibuat' : 'Gagal', data.message, data.ok ? 'success' : 'error');
    if(data.ok){ document.getElementById('vGenCode').value=''; document.getElementById('vGenDays').value=''; document.getElementById('vGenQuota').value=''; loadOwnerData(); }
  }catch(e){ showToast('Error','Gagal membuat voucher','error'); }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Buat Voucher'; } }
}

async function deleteVoucher(code, btn){
  if(btn){ btn.disabled=true; btn.textContent='Hapus...'; }
  try{
    var res=await fetch('/api/api?endpoint=delete_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, code:code})});
    var data=await res.json();
    showToast(data.ok ? 'Dihapus' : 'Gagal', data.message, data.ok ? 'success' : 'error');
    if(data.ok) loadOwnerData();
  }catch(e){ showToast('Error','Gagal menghapus','error'); }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Hapus'; } }
}

async function sendBroadcast(btn){
  var text=document.getElementById('bcTextInput').value.trim();
  if(!text) return showToast('Error','Pesan broadcast kosong!','warning');
  if(btn){ btn.disabled=true; btn.textContent='Mengirim...'; }
  try{
    var res=await fetch('/api/api?endpoint=broadcast', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, text:text})});
    var data=await res.json();
    if(data && data.ok){ showToast('Broadcast Selesai', data.message, 'success'); document.getElementById('bcTextInput').value=''; loadOwnerData(); }
    else{ showToast('Gagal', data ? data.message : 'Gagal', 'error'); }
  }catch(e){ showToast('Error','Gagal mengirim broadcast','error'); }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Kirim Broadcast Sekarang'; } }
}

window.addEventListener('error', function(){ hideLoader(); });
window.addEventListener('unhandledrejection', function(){ hideLoader(); });
document.addEventListener('DOMContentLoaded', function(){
  initApp();
  setTimeout(hideLoader, 1200);
  setTimeout(hideLoader, 2500);
});
window.addEventListener('load', function(){ hideLoader(); setTimeout(hideLoader, 500); });
setTimeout(function(){ hideLoader(); }, 3000);
</script>
</body>
</html>`;
  res.send(htmlContent);
};
