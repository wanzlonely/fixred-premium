module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>WALZY STORE</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet">
<style>
:root{
--bg:#f5f7fb;
--bg2:#eef2ff;
--card:#ffffffd9;
--card2:#ffffff;
--bd:rgba(15,23,42,0.06);
--bd2:rgba(15,23,42,0.10);
--cyan:#06b6d4;
--blue:#3b82f6;
--purple:#8b5cf6;
--pink:#ef4444;
--emerald:#10b981;
--amber:#f59e0b;
--text:#0f172a;
--muted:#64748b;
--shadow:0 10px 30px rgba(15,23,42,0.06), 0 1px 0 rgba(255,255,255,0.8) inset;
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;font-family:'Plus Jakarta Sans',system-ui,sans-serif}
body{
background:var(--bg);
background-image:
radial-gradient(800px 400px at 15% 0%, rgba(6,182,212,0.10), transparent 60%),
radial-gradient(800px 400px at 85% 0%, rgba(139,92,246,0.12), transparent 60%),
linear-gradient(180deg, var(--bg), var(--bg2));
color:var(--text);
min-height:100vh;
padding-bottom:110px;
overflow-x:hidden;
}
.icon{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.loader{
position:fixed;inset:0;z-index:9999;
display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
background:
radial-gradient(900px 500px at 50% 0%, rgba(6,182,212,0.14), transparent 60%),
linear-gradient(180deg, #ffffff, #f5f7fb);
transition:opacity .45s ease, visibility .45s ease;
}
.loader.hidden{opacity:0;visibility:hidden;pointer-events:none}
.loader-icon{
width:72px;height:72px;border-radius:22px;
background:linear-gradient(135deg, #06b6d4, #8b5cf6);
box-shadow:0 12px 28px rgba(6,182,212,0.28);
display:grid;place-items:center;color:#fff;
animation:float 2.8s ease-in-out infinite;
}
.loader-title{font-family:'Outfit',sans-serif;font-weight:800;font-size:20px;letter-spacing:.6px;color:#0f172a}
.loader-sub{font-size:12px;color:var(--muted);font-weight:600}
.loader-bar{width:160px;height:4px;border-radius:999px;background:rgba(15,23,42,0.08);overflow:hidden}
.loader-bar-inner{height:100%;width:45%;border-radius:999px;background:linear-gradient(90deg, var(--cyan), var(--purple));animation:loadbar 1.1s ease-in-out infinite}
@keyframes loadbar{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.9)}}
@keyframes viewIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.header{
position:sticky;top:0;z-index:40;
height:66px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;
background:rgba(255,255,255,0.78);backdrop-filter:blur(18px) saturate(1.2);-webkit-backdrop-filter:blur(18px) saturate(1.2);
border-bottom:1px solid var(--bd);
}
.brand{display:flex;align-items:center;gap:12px}
.brand-logo{
width:42px;height:42px;border-radius:13px;
background:linear-gradient(135deg, #06b6d4, #8b5cf6);
box-shadow:0 8px 20px rgba(6,182,212,0.24);
display:grid;place-items:center;color:#fff;
font-family:'Outfit',sans-serif;font-weight:800;font-size:20px;
}
.brand-name{font-family:'Outfit',sans-serif;font-weight:800;font-size:17px;letter-spacing:-.3px;color:#0f172a}
.live{
display:flex;align-items:center;gap:7px;
padding:7px 12px;border-radius:999px;
background:rgba(16,185,129,0.10);border:1px solid rgba(16,185,129,0.18);
font-size:10px;font-weight:800;letter-spacing:.7px;color:var(--emerald);
}
.live-dot{width:7px;height:7px;border-radius:50%;background:var(--emerald);box-shadow:0 0 10px var(--emerald);animation:pulse 1.8s infinite}
.container{max-width:520px;margin:0 auto;padding:18px 16px;position:relative;z-index:1}
.card{
background:var(--card);
border:1px solid var(--bd);
border-radius:22px;
padding:18px;
position:relative;
overflow:hidden;
backdrop-filter:blur(14px);
-webkit-backdrop-filter:blur(14px);
box-shadow:var(--shadow);
transition:transform .22s ease, border-color .22s ease;
}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg, transparent, rgba(6,182,212,0.35), rgba(139,92,246,0.35), transparent)}
.badge{
display:inline-flex;align-items:center;gap:5px;
padding:5px 10px;border-radius:999px;
font-size:10px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;
background:rgba(15,23,42,0.05);border:1px solid var(--bd);color:var(--muted);
}
.badge.cyan{background:rgba(6,182,212,0.10);border-color:rgba(6,182,212,0.18);color:var(--cyan)}
.badge.purple{background:rgba(139,92,246,0.10);border-color:rgba(139,92,246,0.18);color:var(--purple)}
.badge.emerald{background:rgba(16,185,129,0.10);border-color:rgba(16,185,129,0.18);color:var(--emerald)}
.badge.amber{background:rgba(245,158,11,0.12);border-color:rgba(245,158,11,0.20);color:var(--amber)}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin:14px 0}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.stat{
background:var(--card2);
border:1px solid var(--bd);
border-radius:18px;
padding:13px 12px;
position:relative;
box-shadow:0 4px 14px rgba(15,23,42,0.04);
}
.stat-v{font-family:'Outfit',sans-serif;font-weight:800;font-size:20px;color:#0f172a}
.stat-l{font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--muted);margin-top:2px}
.btn{
width:100%;padding:14px 16px;border-radius:16px;border:none;
font-family:'Outfit',sans-serif;font-weight:800;font-size:13px;letter-spacing:.3px;text-transform:uppercase;
cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
transition:transform .18s ease, opacity .18s ease, box-shadow .18s ease;
position:relative;
}
.btn:active{transform:scale(.97)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.btn-primary{background:linear-gradient(135deg, #06b6d4, #3b82f6);color:#fff;box-shadow:0 8px 20px rgba(59,130,246,0.24)}
.btn-emerald{background:linear-gradient(135deg, #10b981, #059669);color:#fff;box-shadow:0 8px 20px rgba(16,185,129,0.22)}
.btn-purple{background:linear-gradient(135deg, #8b5cf6, #6d28d9);color:#fff}
.btn-pink{background:linear-gradient(135deg, #ef4444, #be123c);color:#fff}
.btn-ghost{background:rgba(15,23,42,0.06);border:1px solid var(--bd);color:#0f172a}
.input{
width:100%;padding:14px 14px;border-radius:16px;
background:rgba(255,255,255,0.9);border:1px solid var(--bd);
color:#0f172a;outline:none;font-size:13px;font-weight:600;
transition:border-color .2s ease, box-shadow .2s ease;
}
.input:focus{border-color:rgba(6,182,212,0.35);box-shadow:0 0 0 4px rgba(6,182,212,0.10)}
.view{display:none;opacity:0}
.view.active{display:block;opacity:1;animation:viewIn .35s ease}
.nav{
position:fixed;bottom:16px;left:50%;transform:translateX(-50%);
width:calc(100% - 28px);max-width:480px;
background:rgba(255,255,255,0.86);backdrop-filter:blur(22px) saturate(1.3);-webkit-backdrop-filter:blur(22px) saturate(1.3);
border:1px solid var(--bd);
border-radius:24px;
display:flex;justify-content:space-around;padding:6px;z-index:60;
box-shadow:0 14px 40px rgba(15,23,42,0.10);
}
.tab{
flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;
padding:10px 6px;border-radius:18px;
color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;
cursor:pointer;transition:all .22s ease;
border:1px solid transparent;
}
.tab.active{color:var(--cyan);background:rgba(6,182,212,0.10);border-color:rgba(6,182,212,0.18)}
.wheel-wrap{position:relative;width:280px;height:280px;margin:0 auto}
.wheel{
width:280px;height:280px;border-radius:50%;
border:4px solid rgba(255,255,255,0.9);
box-shadow:0 10px 30px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.06) inset;
transition:transform 4s cubic-bezier(.15,.85,.2,1);
overflow:hidden;
}
.wheel-pointer{
position:absolute;top:-6px;left:50%;transform:translateX(-50%);
width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:16px solid var(--cyan);
filter:drop-shadow(0 4px 8px rgba(6,182,212,0.35));
z-index:2;
}
.shop-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.shop-item{
background:var(--card2);
border:1px solid var(--bd);
border-radius:18px;
padding:14px;
position:relative;
transition:transform .2s ease, border-color .2s ease;
box-shadow:0 4px 14px rgba(15,23,42,0.04);
}
.shop-item:hover{transform:translateY(-2px);border-color:var(--bd2)}
.shop-item.best{border-color:rgba(245,158,11,0.28)}
.shop-badge{position:absolute;top:8px;right:8px;padding:3px 7px;border-radius:999px;font-size:9px;font-weight:800;background:linear-gradient(135deg, #f59e0b, #ff7a00);color:#fff}
.toast{
position:fixed;top:16px;left:50%;transform:translateX(-50%) translateY(-16px);
background:rgba(255,255,255,0.94);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
border:1px solid var(--bd);border-radius:18px;
padding:12px 14px;display:flex;gap:10px;align-items:center;
min-width:300px;max-width:92vw;
box-shadow:0 14px 36px rgba(15,23,42,0.12);
opacity:0;pointer-events:none;transition:all .32s ease;z-index:10000;
}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto}
.toast-bar{position:absolute;bottom:0;left:0;height:3px;background:linear-gradient(90deg, var(--cyan), var(--purple));border-radius:0 0 18px 18px;animation:toastProg 3s linear forwards}
@keyframes toastProg{from{width:100%}to{width:0%}}
.modal{position:fixed;inset:0;background:rgba(15,23,42,0.38);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:none;place-items:center;z-index:9000;padding:18px}
.modal.open{display:grid}
.proof-preview{position:relative;border-radius:16px;overflow:hidden;border:1px solid var(--bd);margin-top:10px}
.proof-preview img{width:100%;max-height:220px;object-fit:cover;display:block}
.streak{display:flex;gap:7px;margin-top:10px;flex-wrap:wrap}
.streak-day{width:34px;height:40px;border-radius:10px;background:rgba(15,23,42,0.05);border:1px solid var(--bd);display:grid;place-items:center;font-size:10px;font-weight:800;color:var(--muted);transition:all .2s ease}
.streak-day.active{background:rgba(6,182,212,0.12);border-color:rgba(6,182,212,0.22);color:#0f172a}
.invoice{
background:linear-gradient(135deg, rgba(6,182,212,0.06), rgba(139,92,246,0.06));
border:1px solid var(--bd);
border-radius:18px;padding:14px;margin-bottom:10px;
}
.profile-head{display:flex;align-items:center;gap:14px}
.avatar{
width:56px;height:56px;border-radius:16px;
background:linear-gradient(135deg, rgba(6,182,212,0.18), rgba(139,92,246,0.18));
border:1px solid var(--bd);
display:grid;place-items:center;color:var(--cyan);
}
</style>
</head>
<body>
<div class="loader" id="loader">
  <div class="loader-icon">
    <svg class="icon" style="width:36px;height:36px;animation:spin 1.2s linear infinite" viewBox="0 0 24 24"><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>
  </div>
  <div class="loader-title">WALZY STORE</div>
  <div class="loader-sub" id="loadText">Menghubungkan ke server realtime...</div>
  <div class="loader-bar"><div class="loader-bar-inner"></div></div>
</div>

<div class="toast" id="toast">
  <div id="toastIcon" style="width:36px;height:36px;border-radius:12px;background:rgba(6,182,212,0.12);display:grid;place-items:center;color:var(--cyan)"><svg class="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
  <div style="flex:1">
    <div id="toastTitle" style="font-family:'Outfit',sans-serif;font-weight:800;font-size:13px;color:#0f172a">System</div>
    <div id="toastMsg" style="font-size:11px;color:var(--muted);margin-top:1px;font-weight:600">Message</div>
  </div>
  <div class="toast-bar" id="toastProgress"></div>
</div>

<div class="modal" id="imageZoomModal" onclick="closeZoomModal()">
  <div style="display:flex;flex-direction:column;gap:14px;align-items:center" onclick="event.stopPropagation()">
    <img id="zoomedImageSrc" src="" style="max-width:92vw;max-height:78vh;object-fit:contain;border-radius:18px;box-shadow:0 18px 50px rgba(15,23,42,0.18);border:1px solid var(--bd)">
    <button class="btn btn-ghost" style="width:auto;padding:10px 24px" onclick="closeZoomModal()">Tutup</button>
  </div>
</div>

<div class="header">
  <div class="brand">
    <div class="brand-logo">W</div>
    <div class="brand-name">WALZY STORE</div>
  </div>
  <div class="live" id="liveBadge"><span class="live-dot"></span> REALTIME</div>
</div>

<div class="container">
  <div id="viewUserArea">
    <div id="viewHome" class="view active">
      <div class="card">
        <div class="profile-head">
          <div class="avatar"><svg class="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <div style="flex:1">
            <div id="uName" style="font-family:'Outfit',sans-serif;font-weight:800;font-size:17px;color:#0f172a">Memuat...</div>
            <div id="uIdText" style="font-size:11px;color:var(--muted);margin-top:2px;font-weight:600">ID: --</div>
            <div style="display:flex;gap:6px;margin-top:8px">
              <span class="badge cyan" id="uRankBadge">BASIC</span>
              <span class="badge purple" id="uStatusBadge">Gratis</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid3">
        <div class="stat"><div class="stat-v" style="color:var(--cyan)" id="sQuota">5/5</div><div class="stat-l">Kuota Fix</div></div>
        <div class="stat"><div class="stat-v" id="sRefs">0</div><div class="stat-l">Referral</div></div>
        <div class="stat"><div class="stat-v" style="color:var(--amber)" id="sPoints">0</div><div class="stat-l">Poin</div></div>
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;display:flex;align-items:center;gap:8px"><span style="width:24px;height:24px;border-radius:8px;background:rgba(245,158,11,0.12);display:grid;place-items:center;color:var(--amber)"><svg class="icon" style="width:14px;height:14px" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></span> Spin Harian</div>
          <span class="badge">Daily</span>
        </div>
        <div class="wheel-wrap"><div class="wheel-pointer"></div><canvas id="spinCanvas" class="wheel" width="280" height="280"></canvas></div>
        <button class="btn btn-primary" id="spinBtn" style="margin-top:14px" onclick="triggerSpin(this)">Putar Sekarang</button>
      </div>

      <div class="card">
        <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;margin-bottom:8px">Redeem Voucher</div>
        <input class="input" id="vCodeInput" placeholder="Kode voucher">
        <button class="btn btn-emerald" style="margin-top:10px" onclick="claimVoucher(this)">Tukarkan</button>
      </div>

      <div class="card">
        <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;margin-bottom:4px">Referral</div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:10px;font-weight:600">+50 Poin per undangan</div>
        <input class="input" id="refUrlInput" readonly value="Memuat link...">
        <button class="btn btn-ghost" style="margin-top:10px" onclick="copyRefLink()">Salin Link</button>
      </div>
    </div>

    <div id="viewOrder" class="view">
      <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:20px;margin-bottom:4px">VIP Store</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:16px;font-weight:600">Pilih paket untuk unlimited fix</div>
      <div id="activeInvoiceBox"></div>
      <div class="shop-grid">
        <div class="shop-item"><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px">Trial 3H</div><div style="font-size:11px;color:var(--muted);margin-top:2px">3 Hari</div><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:16px;color:var(--cyan);margin-top:8px">Rp 7.000</div><button class="btn btn-primary btn-buy-pkg" style="padding:10px;font-size:11px;margin-top:10px" onclick="createOrder(3,7000,this)">Beli</button></div>
        <div class="shop-item"><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px">Hemat 5H</div><div style="font-size:11px;color:var(--muted);margin-top:2px">5 Hari</div><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:16px;color:var(--cyan);margin-top:8px">Rp 10.000</div><button class="btn btn-primary btn-buy-pkg" style="padding:10px;font-size:11px;margin-top:10px" onclick="createOrder(5,10000,this)">Beli</button></div>
        <div class="shop-item"><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px">Starter 7H</div><div style="font-size:11px;color:var(--muted);margin-top:2px">7 Hari Popular</div><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:16px;color:var(--emerald);margin-top:8px">Rp 15.000</div><button class="btn btn-emerald btn-buy-pkg" style="padding:10px;font-size:11px;margin-top:10px" onclick="createOrder(7,15000,this)">Beli</button></div>
        <div class="shop-item"><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px">Pro 14H</div><div style="font-size:11px;color:var(--muted);margin-top:2px">14 Hari</div><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:16px;color:var(--purple);margin-top:8px">Rp 25.000</div><button class="btn btn-purple btn-buy-pkg" style="padding:10px;font-size:11px;margin-top:10px" onclick="createOrder(14,25000,this)">Beli</button></div>
        <div class="shop-item best" style="grid-column:span 2"><span class="shop-badge">BEST</span><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:16px">Sultan 30 Hari</div><div style="font-size:11px;color:var(--muted);margin-top:3px">Unlimited + Bonus 500 PTS</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px"><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:20px;color:var(--amber)">Rp 40.000</div><button class="btn btn-primary btn-buy-pkg" style="width:auto;padding:10px 18px;background:linear-gradient(135deg, #f59e0b, #ff7a00);color:#fff" onclick="createOrder(30,40000,this)">Beli Sultan</button></div></div>
      </div>
    </div>

    <div id="viewProfile" class="view">
      <div class="card">
        <div class="profile-head">
          <div class="avatar" style="width:64px;height:64px;border-radius:18px"><svg class="icon" style="width:28px;height:28px" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <div style="flex:1">
            <div id="pName" style="font-family:'Outfit',sans-serif;font-weight:800;font-size:18px;color:#0f172a">Memuat...</div>
            <div id="pIdText" style="font-size:11px;color:var(--muted);margin-top:2px;font-weight:700">ID: --</div>
            <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
              <span class="badge cyan" id="pRankBadge">BASIC</span>
              <span class="badge purple" id="pStatusBadge">Gratis</span>
              <span class="badge emerald" id="pPremiumLeft">0 Hari</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid3">
        <div class="stat"><div class="stat-v" id="pQuota">5/5</div><div class="stat-l">Kuota</div></div>
        <div class="stat"><div class="stat-v" id="pTotalFix">0</div><div class="stat-l">Total Fix</div></div>
        <div class="stat"><div class="stat-v" style="color:var(--amber)" id="pPoints">0</div><div class="stat-l">Poin</div></div>
      </div>
      <div class="grid2">
        <div class="stat"><div class="stat-v" id="pRefs">0</div><div class="stat-l">Referral</div></div>
        <div class="stat"><div class="stat-v" id="pStreak">0</div><div class="stat-l">Streak</div></div>
      </div>

      <div class="card">
        <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;margin-bottom:8px">Link Referral</div>
        <input class="input" id="pRefUrl" readonly value="Memuat...">
        <button class="btn btn-ghost" style="margin-top:10px" onclick="copyRefLink2()">Salin Link</button>
      </div>

      <div class="card">
        <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;margin-bottom:10px">Streak Harian</div>
        <div class="streak" id="streakContainer">
          <div class="streak-day" id="stDay1">1</div>
          <div class="streak-day" id="stDay2">2</div>
          <div class="streak-day" id="stDay3">3</div>
          <div class="streak-day" id="stDay4">4</div>
          <div class="streak-day" id="stDay5">5</div>
          <div class="streak-day" id="stDay6">6</div>
          <div class="streak-day" id="stDay7">7</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <div style="font-size:11px;color:var(--muted);font-weight:600">Poin: <b id="checkinPointsVal" style="color:#0f172a">0 PTS</b></div>
        </div>
        <button class="btn btn-emerald" id="checkinBtn" style="margin-top:12px" onclick="triggerCheckin(this)">Check-in Hari Ini</button>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
          <button class="btn btn-ghost" style="padding:10px;font-size:11px" onclick="redeemPoints('quota', this)">100 PTS = +1 Kuota</button>
          <button class="btn btn-ghost" style="padding:10px;font-size:11px" onclick="redeemPoints('spin', this)">150 PTS = Spin</button>
        </div>
      </div>

      <div class="card">
        <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;margin-bottom:10px">Invoice & Riwayat</div>
        <div id="profileInvoiceList" style="font-size:12px;color:var(--muted)">Memuat invoice...</div>
      </div>
    </div>
  </div>

  <div id="viewOwnerArea" style="display:none">
    <div id="viewOwnerHome" class="view active">
      <div class="card">
        <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:16px">Executive Dashboard</div>
        <div class="grid2" style="margin-top:14px">
          <div class="stat"><div class="stat-v" style="color:var(--emerald)" id="oRev">Rp 0</div><div class="stat-l">Revenue</div></div>
          <div class="stat"><div class="stat-v" id="oUsers">0</div><div class="stat-l">Users</div></div>
          <div class="stat"><div class="stat-v" style="color:var(--amber)" id="oPending">0</div><div class="stat-l">Pending</div></div>
          <div class="stat"><div class="stat-v" style="color:var(--cyan)" id="oPremium">0</div><div class="stat-l">VIP</div></div>
        </div>
      </div>
      <div class="card"><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;margin-bottom:10px">Pending Deposit</div><div id="oPendingList"></div></div>
      <div class="card"><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;margin-bottom:10px">Voucher</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px"><input class="input" id="vGenCode" placeholder="Kode"><input class="input" id="vGenDays" placeholder="Hari" type="number"><input class="input" id="vGenQuota" placeholder="Kuota (0=∞)" type="number" style="grid-column:span 2"></div>
        <button class="btn btn-purple" onclick="createVoucher(this)">Buat Voucher</button>
        <div id="oVoucherList" style="margin-top:12px"></div>
      </div>
      <div class="card"><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;margin-bottom:10px">Broadcast</div><textarea class="input" id="bcTextInput" style="min-height:100px;resize:none" placeholder="Pesan broadcast..."></textarea><button class="btn btn-primary" style="margin-top:10px" onclick="sendBroadcast(this)">Kirim Broadcast</button></div>
      <div class="card"><div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;margin-bottom:10px">User Terbaru</div><div id="oUserList"></div></div>
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
{label:"+50 PTS",color:"#8b5cf6"},
{label:"ZONK",color:"#e2e8f0"},
{label:"+25 PTS",color:"#06b6d4"},
{label:"+100 PTS",color:"#f59e0b"},
{label:"+3 KUOTA",color:"#10b981"},
{label:"VIP 1 HARI",color:"#3b82f6"}
];

function hideLoader(){
  var ldr=document.getElementById('loader');
  if(!ldr) return;
  if(ldr.classList.contains('hidden')) return;
  ldr.classList.add('hidden');
  setTimeout(function(){ ldr.style.display='none'; }, 500);
}

function showToast(title, msg, type){
  var toast=document.getElementById('toast');
  var tTitle=document.getElementById('toastTitle');
  var tMsg=document.getElementById('toastMsg');
  var tIcon=document.getElementById('toastIcon');
  if(!toast) return;
  tTitle.textContent=title||'System';
  tMsg.textContent=msg||'';
  var colors={success:'#10b981',error:'#ef4444',warning:'#f59e0b',info:'#06b6d4'};
  var c=colors[type]||'#06b6d4';
  tIcon.style.color=c;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  var prog=document.getElementById('toastProgress');
  if(prog){ prog.style.animation='none'; void prog.offsetWidth; prog.style.animation='toastProg 3s linear forwards'; prog.style.background='linear-gradient(90deg,'+c+','+c+')'; }
  toastTimeout=setTimeout(function(){ toast.classList.remove('show'); }, 3000);
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
    ctx.strokeStyle='rgba(15,23,42,0.06)';
    ctx.lineWidth=2;
    ctx.stroke();
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(i*anglePer + anglePer/2);
    ctx.textAlign='right';
    ctx.fillStyle=i===1 ? '#64748b' : '#fff';
    ctx.font='bold 12px Outfit';
    ctx.fillText(wheelPrizes[i].label, r-18, 4);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(cx,cy,38,0,Math.PI*2);
  ctx.fillStyle='#ffffff';
  ctx.fill();
  ctx.strokeStyle='rgba(15,23,42,0.08)';
  ctx.lineWidth=2;
  ctx.stroke();
  ctx.fillStyle='#0f172a';
  ctx.font='800 12px Outfit';
  ctx.textAlign='center';
  ctx.fillText('WALZY', cx, cy-2);
  ctx.fillStyle='#64748b';
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
      try{ tg.ready(); tg.expand(); if(tg.setHeaderColor){ tg.setHeaderColor('#ffffff'); } if(tg.setBackgroundColor){ tg.setBackgroundColor('#f5f7fb'); } }catch(e){}
    }
    if(tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id){
      currentUserId=tg.initDataUnsafe.user.id;
      currentFirstName=tg.initDataUnsafe.user.first_name||'';
      currentUsername=tg.initDataUnsafe.user.username||'';
    }else{
      var sp=new URLSearchParams(window.location.search);
      currentUserId=sp.get('user_id')||sp.get('userId')||sp.get('id')||localStorage.getItem('walzy_uid')||null;
      currentFirstName=sp.get('first_name')||'';
      currentUsername=sp.get('username')||'';
    }
    if(currentUserId){
      try{ localStorage.setItem('walzy_uid', String(currentUserId)); }catch(e){}
    }
    drawWheel();
    setTimeout(function(){ hideLoader(); }, 600);
    setTimeout(function(){ hideLoader(); }, 1400);
    if(currentUserId){
      loadUserData(false);
      if(!pollingTimer){
        pollingTimer=setInterval(function(){ loadUserData(true); }, 3000);
      }
    }else{
      hideLoader();
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
    var to=setTimeout(function(){ controller.abort(); }, 7000);
    var res=await fetch(queryUrl, {signal:controller.signal});
    clearTimeout(to);
    var data=await res.json();
    if(!data || !data.ok || !data.user){
      hideLoader();
      return;
    }
    var u=data.user;
    isUserOwner=!!u.isOwner;

    var elName=document.getElementById('uName');
    if(elName) elName.textContent=u.first_name||'User';
    var elId=document.getElementById('uIdText');
    if(elId) elId.textContent='ID: '+u.id;
    var elRank=document.getElementById('uRankBadge');
    if(elRank) elRank.textContent=u.rank ? u.rank.name : 'BASIC';
    var elStatus=document.getElementById('uStatusBadge');
    if(elStatus) elStatus.textContent=u.isPremium ? 'VIP ('+u.premiumLeftDays+'H)' : 'Gratis';

    var pName=document.getElementById('pName');
    if(pName) pName.textContent=u.first_name||'User';
    var pId=document.getElementById('pIdText');
    if(pId) pId.textContent='ID: '+u.id;
    var pRank=document.getElementById('pRankBadge');
    if(pRank) pRank.textContent=u.rank ? u.rank.name : 'BASIC';
    var pStatus=document.getElementById('pStatusBadge');
    if(pStatus) pStatus.textContent=u.isPremium ? 'VIP' : 'Gratis';
    var pLeft=document.getElementById('pPremiumLeft');
    if(pLeft) pLeft.textContent=u.isPremium ? u.premiumLeftDays+' Hari' : 'Free';

    var elQuota=document.getElementById('sQuota');
    if(elQuota) elQuota.textContent=u.dailyFixRemaining||'5/5';
    var elRefs=document.getElementById('sRefs');
    if(elRefs) elRefs.textContent=u.referralCount||0;
    var elPts=document.getElementById('sPoints');
    if(elPts) elPts.textContent=u.points||0;

    var pQuota=document.getElementById('pQuota');
    if(pQuota) pQuota.textContent=u.dailyFixRemaining||'5/5';
    var pTotal=document.getElementById('pTotalFix');
    if(pTotal) pTotal.textContent=u.totalFix||0;
    var pPts=document.getElementById('pPoints');
    if(pPts) pPts.textContent=u.points||0;
    var pRefs=document.getElementById('pRefs');
    if(pRefs) pRefs.textContent=u.referralCount||0;
    var pStreak=document.getElementById('pStreak');
    if(pStreak) pStreak.textContent=u.checkinStreak||0;

    var elChkPts=document.getElementById('checkinPointsVal');
    if(elChkPts) elChkPts.textContent=(u.points||0)+' PTS';

    var elRefUrl=document.getElementById('refUrlInput');
    if(elRefUrl) elRefUrl.value=u.referralLink||'';
    var pRefUrl=document.getElementById('pRefUrl');
    if(pRefUrl) pRefUrl.value=u.referralLink||'';

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
      var proofHtml=inv.proofImage ? '<div class="proof-preview"><img src="'+inv.proofImage+'" onclick="openZoomModal(\\''+inv.proofImage+'\\')"></div>' : '<div style="font-size:11px;color:var(--muted);margin-top:6px">Belum upload bukti • Invoice: <b style="color:#0f172a">'+(inv.id||inv.invoice)+'</b></div>';
      var statusText=inv.status==='waiting_approval' ? 'Menunggu Verifikasi' : inv.status==='paid' ? 'Lunas' : 'Menunggu Bayar';
      invBox.innerHTML='<div class="invoice"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-family:Outfit;font-weight:800;font-size:13px">'+(inv.id||inv.invoice)+'</div><span class="badge cyan">'+statusText+'</span></div><div style="margin-top:8px;font-size:11px;color:var(--muted)">'+inv.days+' Hari • Rp '+(inv.amount||0).toLocaleString('id-ID')+'</div>'+proofHtml+'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px"><button class="btn btn-primary" style="padding:10px;font-size:11px" onclick="triggerUploadProof()">Upload Bukti</button><button class="btn btn-ghost" style="padding:10px;font-size:11px" onclick="cancelOrder(\\''+(inv.id||inv.invoice)+'\\', this)">Batalkan</button></div></div>';
    }else{
      if(invBox) invBox.innerHTML='';
      buyBtns.forEach(function(btn){ btn.disabled=false; });
    }

    var pil=document.getElementById('profileInvoiceList');
    if(pil){
      if(data.invoices && data.invoices.length>0){
        pil.innerHTML=data.invoices.slice(-10).reverse().map(function(iv){
          var st=iv.status==='paid' ? 'Lunas' : iv.status==='waiting_approval' ? 'Verifikasi' : iv.status==='pending' ? 'Pending' : iv.status;
          return '<div class="invoice" style="padding:12px"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:800;font-size:12px">'+(iv.id||iv.invoice)+' • '+ (iv.days||0)+' Hari</div><span class="badge '+(iv.status==='paid'?'emerald':iv.status==='waiting_approval'?'amber':'')+'" style="font-size:9px">'+st+'</span></div><div style="font-size:11px;color:var(--muted);margin-top:4px">Rp '+(iv.amount||0).toLocaleString('id-ID')+' • '+new Date(iv.createdAt||Date.now()).toLocaleDateString('id-ID')+'</div>'+(iv.proofImage ? '<div class="proof-preview" style="margin-top:8px"><img src="'+iv.proofImage+'" onclick="openZoomModal(\\''+iv.proofImage+'\\')"></div>' : '')+'</div>';
        }).join('');
      }else{
        pil.innerHTML='<div style="font-size:11px;color:var(--muted)">Belum ada invoice.</div>';
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
        showToast('Spin Berhadiah', data.message||'Hadiah!', 'success');
        loadUserData();
        if(btn){ btn.disabled=false; btn.textContent='Putar Sekarang'; }
        isSpinning=false;
      }, 3800);
    }else{
      showToast('Gagal', data ? data.message : 'Gagal spin', 'error');
      if(btn){ btn.disabled=false; btn.textContent='Putar Sekarang'; }
      isSpinning=false;
    }
  }catch(e){
    showToast('Error','Gagal spin','error');
    if(btn){ btn.disabled=false; btn.textContent='Putar Sekarang'; }
    isSpinning=false;
  }
}

async function triggerCheckin(btn){
  if(!currentUserId) return;
  if(btn){ btn.disabled=true; btn.textContent='Memproses...'; }
  try{
    var res=await fetch('/api/api?endpoint=checkin', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId})});
    var data=await res.json();
    showToast(data.ok ? 'Check-in' : 'Info', data.message, data.ok ? 'success' : 'warning');
    loadUserData();
  }catch(e){ showToast('Error','Gagal check-in','error'); }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Check-in Hari Ini'; } }
}

async function redeemPoints(option, btn){
  if(!currentUserId) return;
  if(btn) btn.disabled=true;
  try{
    var res=await fetch('/api/api?endpoint=redeem', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, option:option})});
    var data=await res.json();
    showToast(data.ok ? 'Berhasil' : 'Gagal', data.message, data.ok ? 'success' : 'error');
    if(data.ok) loadUserData();
  }catch(e){ showToast('Error','Gagal','error'); }
  finally{ if(btn) btn.disabled=false; }
}

async function createOrder(days, amount, btn){
  if(!currentUserId) return showToast('Error','User ID tidak ditemukan','error');
  if(btn){ btn.disabled=true; btn.textContent='Membuat...'; }
  try{
    var res=await fetch('/api/api?endpoint=create_order', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, days:days, amount:amount})});
    var data=await res.json();
    if(data.ok){ showToast('Invoice Dibuat','ID: '+(data.invoice.invoice||data.invoice.id),'success'); loadUserData(); }
    else{ showToast('Gagal',''+(data.message||'Gagal'),'error'); }
  }catch(e){ showToast('Error','Gagal membuat pesanan','error'); }
  finally{ if(btn){ btn.disabled=false; btn.textContent=days===30 ? 'Beli Sultan' : 'Beli'; } }
}

async function cancelOrder(invoiceId, btn){
  if(!currentUserId) return;
  if(btn) btn.disabled=true;
  try{
    var res=await fetch('/api/api?endpoint=cancel_order', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, invoice:invoiceId})});
    var data=await res.json();
    showToast(data.ok ? 'Dibatalkan' : 'Gagal', data.message, data.ok ? 'success' : 'error');
    if(data.ok) loadUserData();
  }catch(e){ showToast('Error','Gagal','error'); }
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
        showToast(data.ok ? 'Sukses' : 'Gagal', data.message, data.ok ? 'success' : 'error');
        if(data.ok) loadUserData();
      }catch(err){ showToast('Error','Gagal upload','error'); }
    })();
  };
  reader.readAsDataURL(file);
  event.target.value='';
}

async function claimVoucher(btn){
  var codeEl=document.getElementById('vCodeInput');
  if(!codeEl) return;
  var code=codeEl.value.trim();
  if(!code) return showToast('Error','Masukkan kode!','warning');
  if(!currentUserId) return showToast('Error','User ID tidak ditemukan','error');
  if(btn){ btn.disabled=true; btn.textContent='Memproses...'; }
  try{
    var res=await fetch('/api/api?endpoint=claim_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, code:code})});
    var data=await res.json();
    showToast(data.ok ? 'Sukses' : 'Gagal', data.message, data.ok ? 'success' : 'error');
    if(data.ok){ codeEl.value=''; loadUserData(); }
  }catch(e){ showToast('Error','Gagal klaim','error'); }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Tukarkan'; } }
}

function copyRefLink(){
  var el=document.getElementById('refUrlInput');
  if(!el||!el.value) return showToast('Error','Link belum tersedia','warning');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(el.value).then(function(){ showToast('Berhasil','Link disalin!','success'); }).catch(function(){ el.select(); document.execCommand('copy'); showToast('Berhasil','Link disalin!','success'); });
  }else{ el.select(); document.execCommand('copy'); showToast('Berhasil','Link disalin!','success'); }
}

function copyRefLink2(){
  var el=document.getElementById('pRefUrl');
  if(!el||!el.value) return showToast('Error','Link belum tersedia','warning');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(el.value).then(function(){ showToast('Berhasil','Link disalin!','success'); }).catch(function(){ el.select(); document.execCommand('copy'); showToast('Berhasil','Link disalin!','success'); });
  }else{ el.select(); document.execCommand('copy'); showToast('Berhasil','Link disalin!','success'); }
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
            return '<div class="invoice" style="padding:12px;margin-bottom:8px"><div style="display:flex;justify-content:space-between"><div><div style="font-family:Outfit;font-weight:800;font-size:12px">'+p.id+'</div><div style="font-size:10px;color:var(--muted);margin-top:2px">User: '+p.userId+' | '+p.days+'H | Rp '+(p.amount||0).toLocaleString('id-ID')+'</div>'+(p.proofImage ? '<div class="proof-preview" style="margin-top:8px"><img src="'+p.proofImage+'" onclick="openZoomModal(\\''+p.proofImage+'\\')"></div>' : '<div style="font-size:10px;color:var(--amber);margin-top:6px">Belum upload bukti</div>')+'</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px"><button class="btn btn-emerald" style="padding:8px;font-size:10px" onclick="ownerAct(\\''+p.id+'\\', \\'approve\\', this)">Setujui</button><button class="btn btn-pink" style="padding:8px;font-size:10px" onclick="ownerAct(\\''+p.id+'\\', \\'reject\\', this)">Tolak</button></div></div>';
          }).join('');
        }else{
          pendingList.innerHTML='<div style="font-size:11px;color:var(--muted)">Tidak ada pending.</div>';
        }
      }
      var userList=document.getElementById('oUserList');
      if(userList){
        if(d.recentUsers && d.recentUsers.length>0){
          userList.innerHTML=d.recentUsers.slice(0,15).map(function(u){
            var isVip=u.premiumUntil && u.premiumUntil>Date.now();
            return '<div class="card" style="padding:12px;margin-bottom:8px;box-shadow:none"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-family:Outfit;font-weight:800;font-size:12px">'+(u.first_name||'User')+'</div><div style="font-size:10px;color:var(--muted)">ID: '+u.id+' | Fix: '+(u.totalFix||0)+'</div></div><span class="badge '+(isVip?'emerald':'')+'">'+(isVip?'VIP':'Free')+'</span></div></div>';
          }).join('');
        }
      }
      var vList=document.getElementById('oVoucherList');
      if(vList){
        if(d.codes && d.codes.length>0){
          vList.innerHTML=d.codes.map(function(c){
            return '<div class="card" style="padding:12px;margin-bottom:8px;box-shadow:none"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:800;font-size:12px">'+c.code+'</div><div style="font-size:10px;color:var(--muted);margin-top:2px">'+c.days+' Hari | '+(c.used||0)+'/'+(c.quota||'∞')+'</div></div><button class="btn btn-pink" style="width:auto;padding:6px 12px;font-size:10px" onclick="deleteVoucher(\\''+c.code+'\\', this)">Hapus</button></div></div>';
          }).join('');
        }else{
          vList.innerHTML='<div style="font-size:11px;color:var(--muted)">Belum ada voucher.</div>';
        }
      }
    }
  }catch(e){}
}

async function ownerAct(invoice, action, btn){
  if(btn){ btn.disabled=true; btn.textContent='...'; }
  try{
    var res=await fetch('/api/api?endpoint=owner_action', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, invoice:invoice, action:action})});
    var data=await res.json();
    showToast(data.ok ? 'Sukses' : 'Gagal', data.message, data.ok ? 'success' : 'error');
    if(data.ok) loadOwnerData();
  }catch(e){ showToast('Error','Gagal','error'); }
}

async function createVoucher(btn){
  var code=document.getElementById('vGenCode').value.trim();
  var days=document.getElementById('vGenDays').value;
  var quota=document.getElementById('vGenQuota').value;
  if(!code||!days) return showToast('Error','Lengkapi data!','warning');
  if(btn){ btn.disabled=true; btn.textContent='Membuat...'; }
  try{
    var res=await fetch('/api/api?endpoint=create_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, code:code, days:days, quota:quota})});
    var data=await res.json();
    showToast(data.ok ? 'Voucher Dibuat' : 'Gagal', data.message, data.ok ? 'success' : 'error');
    if(data.ok){ document.getElementById('vGenCode').value=''; document.getElementById('vGenDays').value=''; document.getElementById('vGenQuota').value=''; loadOwnerData(); }
  }catch(e){ showToast('Error','Gagal','error'); }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Buat Voucher'; } }
}

async function deleteVoucher(code, btn){
  if(btn) btn.disabled=true;
  try{
    var res=await fetch('/api/api?endpoint=delete_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, code:code})});
    var data=await res.json();
    showToast(data.ok ? 'Dihapus' : 'Gagal', data.message, data.ok ? 'success' : 'error');
    if(data.ok) loadOwnerData();
  }catch(e){ showToast('Error','Gagal','error'); }
}

async function sendBroadcast(btn){
  var text=document.getElementById('bcTextInput').value.trim();
  if(!text) return showToast('Error','Pesan kosong!','warning');
  if(btn){ btn.disabled=true; btn.textContent='Mengirim...'; }
  try{
    var res=await fetch('/api/api?endpoint=broadcast', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, text:text})});
    var data=await res.json();
    if(data && data.ok){ showToast('Broadcast Selesai', data.message, 'success'); document.getElementById('bcTextInput').value=''; loadOwnerData(); }
    else{ showToast('Gagal', data ? data.message : 'Gagal', 'error'); }
  }catch(e){ showToast('Error','Gagal broadcast','error'); }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Kirim Broadcast'; } }
}

window.addEventListener('error', function(){ hideLoader(); });
window.addEventListener('unhandledrejection', function(){ hideLoader(); });
document.addEventListener('DOMContentLoaded', function(){
  initApp();
  setTimeout(hideLoader, 1000);
  setTimeout(hideLoader, 2500);
});
window.addEventListener('load', function(){ hideLoader(); });
setTimeout(function(){ hideLoader(); }, 3000);
</script>
</body>
</html>`;
  res.send(htmlContent);
};
