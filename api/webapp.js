module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>WALZY STORE</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet">
<style>
:root{
--bg:#f7f8fc;
--bg2:#eef1ff;
--card:rgba(255,255,255,0.92);
--card2:#ffffff;
--bd:rgba(15,23,42,0.06);
--bd2:rgba(15,23,42,0.10);
--text:#0f172a;
--muted:#6b7a99;
--cyan:#06b6d4;
--blue:#3b82f6;
--purple:#8b5cf6;
--emerald:#10b981;
--amber:#f59e0b;
--pink:#ef4444;
--shadow:0 8px 24px rgba(15,23,42,0.05), 0 1px 0 rgba(255,255,255,0.9) inset;
--shadow2:0 16px 40px rgba(15,23,42,0.08);
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;font-family:'Plus Jakarta Sans',sans-serif}
body{background:var(--bg);background-image:radial-gradient(700px 380px at 15% 0%, rgba(6,182,212,0.09), transparent 60%), radial-gradient(700px 380px at 85% 0%, rgba(139,92,246,0.10), transparent 60%), linear-gradient(180deg, var(--bg), var(--bg2));color:var(--text);min-height:100vh;padding-bottom:110px;overflow-x:hidden}
.icon{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.loader{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:linear-gradient(180deg,#ffffff,#f7f8fc);transition:opacity .4s ease, visibility .4s ease}
.loader.hidden{opacity:0;visibility:hidden;pointer-events:none}
.loader-logo{width:68px;height:68px;border-radius:20px;background:linear-gradient(135deg,#06b6d4,#8b5cf6);box-shadow:0 12px 28px rgba(6,182,212,0.26);display:grid;place-items:center;color:#fff;font-family:'Outfit',sans-serif;font-weight:800;font-size:28px;animation:float 2.6s ease-in-out infinite}
.loader-title{font-family:'Outfit',sans-serif;font-weight:800;font-size:19px;color:#0f172a}
.loader-sub{font-size:12px;color:var(--muted);font-weight:600}
.loader-bar{width:148px;height:4px;border-radius:999px;background:rgba(15,23,42,0.07);overflow:hidden}
.loader-bar i{display:block;height:100%;width:40%;background:linear-gradient(90deg,#06b6d4,#8b5cf6);border-radius:999px;animation:bar 1.1s ease-in-out infinite}
@keyframes bar{0%{transform:translateX(-100%)}100%{transform:translateX(350%)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.9)}}
@keyframes in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.header{position:sticky;top:0;z-index:30;height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:rgba(255,255,255,0.82);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--bd)}
.brand{display:flex;align-items:center;gap:10px}
.brand-logo{width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#06b6d4,#8b5cf6);display:grid;place-items:center;color:#fff;font-family:'Outfit',sans-serif;font-weight:800;font-size:18px;box-shadow:0 6px 16px rgba(6,182,212,0.22)}
.brand-name{font-family:'Outfit',sans-serif;font-weight:800;font-size:16px}
.live{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;background:rgba(16,185,129,0.09);border:1px solid rgba(16,185,129,0.16);font-size:10px;font-weight:800;color:var(--emerald)}
.live b{width:7px;height:7px;border-radius:50%;background:var(--emerald);box-shadow:0 0 8px var(--emerald);animation:pulse 1.6s infinite;display:inline-block}
.container{max-width:520px;margin:0 auto;padding:16px 14px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:20px;padding:16px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);box-shadow:var(--shadow);position:relative;overflow:hidden}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg, transparent, rgba(6,182,212,0.28), rgba(139,92,246,0.28), transparent)}
.badge{display:inline-flex;align-items:center;padding:4px 9px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;border:1px solid var(--bd);background:rgba(15,23,42,0.04);color:var(--muted)}
.badge.cyan{background:rgba(6,182,212,0.09);border-color:rgba(6,182,212,0.16);color:var(--cyan)}
.badge.purple{background:rgba(139,92,246,0.09);border-color:rgba(139,92,246,0.16);color:var(--purple)}
.badge.emerald{background:rgba(16,185,129,0.09);border-color:rgba(16,185,129,0.16);color:var(--emerald)}
.badge.amber{background:rgba(245,158,11,0.11);border-color:rgba(245,158,11,0.18);color:var(--amber)}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:12px 0}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}
.stat{background:var(--card2);border:1px solid var(--bd);border-radius:16px;padding:12px 10px;box-shadow:0 4px 12px rgba(15,23,42,0.03)}
.stat-v{font-family:'Outfit',sans-serif;font-weight:800;font-size:18px;color:#0f172a}
.stat-l{font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--muted);margin-top:2px}
.btn{width:100%;padding:13px 14px;border-radius:14px;border:none;font-family:'Outfit',sans-serif;font-weight:800;font-size:12.5px;letter-spacing:.3px;text-transform:uppercase;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:transform .15s ease, opacity .15s ease}
.btn:active{transform:scale(.97)}
.btn:disabled{opacity:.45;cursor:not-allowed}
.btn-primary{background:linear-gradient(135deg,#06b6d4,#3b82f6);color:#fff;box-shadow:0 8px 18px rgba(59,130,246,0.20)}
.btn-emerald{background:linear-gradient(135deg,#10b981,#059669);color:#fff}
.btn-purple{background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff}
.btn-pink{background:linear-gradient(135deg,#ef4444,#be123c);color:#fff}
.btn-ghost{background:rgba(15,23,42,0.05);border:1px solid var(--bd);color:#0f172a}
.input{width:100%;padding:13px 12px;border-radius:14px;background:rgba(255,255,255,0.9);border:1px solid var(--bd);color:#0f172a;outline:none;font-size:13px;font-weight:600}
.input:focus{border-color:rgba(6,182,212,0.28);box-shadow:0 0 0 4px rgba(6,182,212,0.08)}
.view{display:none;opacity:0}
.view.active{display:block;opacity:1;animation:in .32s ease}
.nav{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);width:calc(100% - 22px);max-width:500px;background:rgba(255,255,255,0.90);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid var(--bd);border-radius:22px;display:flex;justify-content:space-around;padding:6px;z-index:60;box-shadow:var(--shadow2)}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px;border-radius:16px;color:var(--muted);font-size:9.5px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;cursor:pointer;transition:all .2s ease;border:1px solid transparent}
.tab.active{color:var(--cyan);background:rgba(6,182,212,0.09);border-color:rgba(6,182,212,0.14)}
.wheel-wrap{position:relative;width:270px;height:270px;margin:0 auto}
.wheel{width:270px;height:270px;border-radius:50%;border:4px solid #fff;box-shadow:0 8px 24px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.05) inset;transition:transform 4s cubic-bezier(.15,.85,.2,1);overflow:hidden}
.wheel-pointer{position:absolute;top:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:14px solid var(--cyan);filter:drop-shadow(0 3px 6px rgba(6,182,212,0.3));z-index:2}
.shop-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.shop-item{background:var(--card2);border:1px solid var(--bd);border-radius:16px;padding:12px;box-shadow:0 4px 10px rgba(15,23,42,0.03);transition:transform .18s ease}
.shop-item:hover{transform:translateY(-2px)}
.shop-item.best{border-color:rgba(245,158,11,0.26)}
.shop-badge{position:absolute;top:7px;right:7px;padding:2px 6px;border-radius:999px;font-size:8px;font-weight:800;background:linear-gradient(135deg,#f59e0b,#ff7a00);color:#fff}
.toast{position:fixed;top:14px;left:50%;transform:translateX(-50%) translateY(-12px);background:rgba(255,255,255,0.96);border:1px solid var(--bd);border-radius:16px;padding:11px 12px;display:flex;gap:9px;align-items:center;min-width:280px;max-width:92vw;box-shadow:0 12px 28px rgba(15,23,42,0.10);opacity:0;pointer-events:none;transition:all .28s ease;z-index:10000}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto}
.toast-bar{position:absolute;bottom:0;left:0;height:3px;background:linear-gradient(90deg,var(--cyan),var(--purple));border-radius:0 0 16px 16px;animation:prog 3s linear forwards}
@keyframes prog{from{width:100%}to{width:0%}}
.modal{position:fixed;inset:0;background:rgba(15,23,42,0.32);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:none;place-items:center;z-index:9000;padding:16px}
.modal.open{display:grid}
.proof{position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--bd);margin-top:8px}
.proof img{width:100%;max-height:210px;object-fit:cover;display:block}
.streak{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.streak-day{width:32px;height:36px;border-radius:9px;background:rgba(15,23,42,0.04);border:1px solid var(--bd);display:grid;place-items:center;font-size:10px;font-weight:800;color:var(--muted)}
.streak-day.active{background:rgba(6,182,212,0.11);border-color:rgba(6,182,212,0.18);color:#0f172a}
.invoice{background:linear-gradient(135deg, rgba(6,182,212,0.05), rgba(139,92,246,0.05));border:1px solid var(--bd);border-radius:16px;padding:12px;margin-bottom:8px}
.avatar{width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg, rgba(6,182,212,0.16), rgba(139,92,246,0.16));border:1px solid var(--bd);display:grid;place-items:center;color:var(--cyan)}
.section-title{font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;margin-bottom:10px;display:flex;align-items:center;gap:8px}
</style>
</head>
<body>
<div class="loader" id="loader">
  <div class="loader-logo">W</div>
  <div class="loader-title">WALZY STORE</div>
  <div class="loader-sub" id="loadText">Menghubungkan ke server realtime...</div>
  <div class="loader-bar"><i></i></div>
</div>

<div class="toast" id="toast">
  <div id="toastIcon" style="width:32px;height:32px;border-radius:10px;background:rgba(6,182,212,0.10);display:grid;place-items:center;color:var(--cyan)"><svg class="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
  <div style="flex:1"><div id="toastTitle" style="font-family:'Outfit',sans-serif;font-weight:800;font-size:12px;color:#0f172a">System</div><div id="toastMsg" style="font-size:11px;color:var(--muted);font-weight:600;margin-top:1px">Message</div></div>
  <div class="toast-bar" id="toastProgress"></div>
</div>

<div class="modal" id="imageZoomModal" onclick="closeZoomModal()"><div onclick="event.stopPropagation()" style="display:flex;flex-direction:column;gap:12px;align-items:center"><img id="zoomedImageSrc" src="" style="max-width:92vw;max-height:76vh;object-fit:contain;border-radius:16px;box-shadow:0 16px 40px rgba(15,23,42,0.14)"><button class="btn btn-ghost" style="width:auto;padding:9px 22px" onclick="closeZoomModal()">Tutup</button></div></div>

<div class="header">
  <div class="brand"><div class="brand-logo">W</div><div class="brand-name">WALZY</div></div>
  <div class="live"><b></b> <span id="liveText">REALTIME</span></div>
</div>

<div class="container">
  <div id="viewUserArea">
    <div id="viewHome" class="view active">
      <div class="card">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="avatar"><svg class="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <div style="flex:1">
            <div id="uName" style="font-family:'Outfit',sans-serif;font-weight:800;font-size:16px">Memuat...</div>
            <div id="uIdText" style="font-size:11px;color:var(--muted);font-weight:600;margin-top:1px">ID: --</div>
            <div style="display:flex;gap:5px;margin-top:7px"><span class="badge cyan" id="uRankBadge">BASIC</span><span class="badge purple" id="uStatusBadge">Gratis</span><span class="badge emerald" id="uPremiumBadge" style="display:none"></span></div>
          </div>
        </div>
      </div>
      <div class="grid3">
        <div class="stat"><div class="stat-v" style="color:var(--cyan)" id="sQuota">5/5</div><div class="stat-l">Kuota Fix</div></div>
        <div class="stat"><div class="stat-v" id="sRefs">0</div><div class="stat-l">Referral</div></div>
        <div class="stat"><div class="stat-v" style="color:var(--amber)" id="sPoints">0</div><div class="stat-l">Poin</div></div>
      </div>
      <div class="card">
        <div class="section-title">🚀 Akses Cepat</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button class="btn btn-primary" onclick="switchTab('viewProduk', document.querySelectorAll('#userNavBar .tab')[1])">🛒 Beli VIP</button>
          <button class="btn btn-ghost" onclick="switchTab('viewDaily', document.querySelectorAll('#userNavBar .tab')[2])">🎡 Daily Rewards</button>
        </div>
      </div>
      <div class="card">
        <div class="section-title">🎟️ Redeem Voucher</div>
        <input class="input" id="vCodeInput" placeholder="Masukkan kode voucher">
        <button class="btn btn-emerald" style="margin-top:8px" onclick="claimVoucher(this)">Tukarkan Sekarang</button>
        <div id="voucherStatus" style="font-size:11px;color:var(--muted);margin-top:8px"></div>
      </div>
    </div>

    <div id="viewProduk" class="view">
      <div style="font-family:'Outfit',sans-serif;font-weight:800;font-size:20px;margin-bottom:2px">Produk VIP</div>
      <div style="font-size:12px;color:var(--muted);margin-bottom:14px;font-weight:600">Pilih paket unlimited fix</div>
      <div id="activeInvoiceBox"></div>
      <div class="shop-grid">
        <div class="shop-item"><div style="font-weight:800;font-size:13px">Trial 3 Hari</div><div style="font-size:10px;color:var(--muted)">Akses 3H</div><div style="font-weight:800;font-size:16px;color:var(--cyan);margin-top:6px">Rp 7.000</div><button class="btn btn-primary btn-buy-pkg" style="padding:9px;font-size:11px;margin-top:8px" onclick="createOrder(3,7000,this)">Beli</button></div>
        <div class="shop-item"><div style="font-weight:800;font-size:13px">Hemat 5 Hari</div><div style="font-size:10px;color:var(--muted)">5 Hari</div><div style="font-weight:800;font-size:16px;color:var(--cyan);margin-top:6px">Rp 10.000</div><button class="btn btn-primary btn-buy-pkg" style="padding:9px;font-size:11px;margin-top:8px" onclick="createOrder(5,10000,this)">Beli</button></div>
        <div class="shop-item"><div style="font-weight:800;font-size:13px">Starter 7 Hari</div><div style="font-size:10px;color:var(--muted)">Popular</div><div style="font-weight:800;font-size:16px;color:var(--emerald);margin-top:6px">Rp 15.000</div><button class="btn btn-emerald btn-buy-pkg" style="padding:9px;font-size:11px;margin-top:8px" onclick="createOrder(7,15000,this)">Beli</button></div>
        <div class="shop-item"><div style="font-weight:800;font-size:13px">Pro 14 Hari</div><div style="font-size:10px;color:var(--muted)">Best Value</div><div style="font-weight:800;font-size:16px;color:var(--purple);margin-top:6px">Rp 25.000</div><button class="btn btn-purple btn-buy-pkg" style="padding:9px;font-size:11px;margin-top:8px" onclick="createOrder(14,25000,this)">Beli</button></div>
        <div class="shop-item best" style="grid-column:span 2;position:relative"><span class="shop-badge">BEST</span><div style="font-weight:800;font-size:15px">Sultan 30 Hari</div><div style="font-size:11px;color:var(--muted)">Unlimited + Bonus 500 PTS</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px"><div style="font-weight:800;font-size:19px;color:var(--amber)">Rp 40.000</div><button class="btn btn-primary btn-buy-pkg" style="width:auto;padding:9px 16px;background:linear-gradient(135deg,#f59e0b,#ff7a00)" onclick="createOrder(30,40000,this)">Beli Sultan</button></div></div>
      </div>
    </div>

    <div id="viewDaily" class="view">
      <div class="card">
        <div class="section-title">📅 Daily Check-in</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="font-size:11px;color:var(--muted);font-weight:600">Streak: <b id="dailyStreakText" style="color:#0f172a">0 Hari</b> • Poin: <b id="checkinPointsVal" style="color:#0f172a">0 PTS</b></div>
          <span class="badge emerald" id="dailyStatusBadge">Belum</span>
        </div>
        <div class="streak" id="streakContainer">
          <div class="streak-day" id="stDay1">1</div><div class="streak-day" id="stDay2">2</div><div class="streak-day" id="stDay3">3</div><div class="streak-day" id="stDay4">4</div><div class="streak-day" id="stDay5">5</div><div class="streak-day" id="stDay6">6</div><div class="streak-day" id="stDay7">7</div>
        </div>
        <button class="btn btn-emerald" id="checkinBtn" style="margin-top:12px" onclick="triggerCheckin(this)">Check-in Hari Ini</button>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px">
          <button class="btn btn-ghost" style="padding:9px;font-size:10px" onclick="redeemPoints('quota', this)">100 PTS = Kuota</button>
          <button class="btn btn-ghost" style="padding:9px;font-size:10px" onclick="redeemPoints('spin', this)">150 PTS = Spin</button>
        </div>
      </div>

      <div class="card">
        <div class="section-title">🎡 Spin Wheel Harian</div>
        <div class="wheel-wrap"><div class="wheel-pointer"></div><canvas id="spinCanvas" class="wheel" width="270" height="270"></canvas></div>
        <button class="btn btn-primary" id="spinBtn" style="margin-top:12px" onclick="triggerSpin(this)">Putar Spin</button>
        <div id="spinResult" style="font-size:11px;color:var(--muted);text-align:center;margin-top:8px;font-weight:600"></div>
      </div>

      <div class="card">
        <div class="section-title">👥 Referral</div>
        <div style="font-size:11px;color:var(--muted);margin-bottom:8px;font-weight:600">+50 Poin per teman bergabung • Total: <b id="refCountText" style="color:#0f172a">0</b></div>
        <input class="input" id="refUrlInput" readonly value="Memuat...">
        <button class="btn btn-ghost" style="margin-top:8px" onclick="copyRefLink()">Salin Link</button>
      </div>
    </div>

    <div id="viewProfil" class="view">
      <div class="card">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="avatar" style="width:60px;height:60px;border-radius:16px"><svg class="icon" style="width:26px;height:26px" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <div style="flex:1">
            <div id="pName" style="font-family:'Outfit',sans-serif;font-weight:800;font-size:17px">Memuat...</div>
            <div id="pIdText" style="font-size:11px;color:var(--muted);font-weight:700">ID: --</div>
            <div style="display:flex;gap:5px;margin-top:6px;flex-wrap:wrap"><span class="badge cyan" id="pRankBadge">BASIC</span><span class="badge purple" id="pStatusBadge">Gratis</span><span class="badge emerald" id="pPremiumLeft">Free</span></div>
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
      <div class="card"><div class="section-title">🔗 Link Referral</div><input class="input" id="pRefUrl" readonly value="Memuat..."><button class="btn btn-ghost" style="margin-top:8px" onclick="copyRefLink2()">Salin Link</button></div>
      <div class="card"><div class="section-title">🧾 Invoice & Riwayat</div><div id="profileInvoiceList" style="font-size:12px;color:var(--muted)">Memuat...</div></div>
    </div>
  </div>

  <div id="viewOwnerArea" style="display:none">
    <div id="viewOwnerDashboard" class="view active">
      <div class="card"><div class="section-title">👑 Dashboard Owner</div>
        <div class="grid2">
          <div class="stat"><div class="stat-v" style="color:var(--emerald)" id="oRev">Rp 0</div><div class="stat-l">Revenue</div></div>
          <div class="stat"><div class="stat-v" id="oUsers">0</div><div class="stat-l">Total User</div></div>
          <div class="stat"><div class="stat-v" style="color:var(--amber)" id="oPending">0</div><div class="stat-l">Pending</div></div>
          <div class="stat"><div class="stat-v" style="color:var(--cyan)" id="oPremium">0</div><div class="stat-l">VIP Aktif</div></div>
        </div>
        <div class="grid2" style="margin-top:8px">
          <div class="stat"><div class="stat-v" id="oTotalFix">0</div><div class="stat-l">Total Fix</div></div>
          <div class="stat"><div class="stat-v" id="oCodes">0</div><div class="stat-l">Voucher Aktif</div></div>
        </div>
      </div>
      <div class="card"><div class="section-title">💳 Pembayaran Masuk</div><div id="oPendingList"></div></div>
    </div>

    <div id="viewOwnerUsers" class="view">
      <div class="card"><div class="section-title">👥 Total User</div><div id="oUserList"></div></div>
    </div>

    <div id="viewOwnerDeposit" class="view">
      <div class="card"><div class="section-title">📥 Deposit & Invoice</div><div id="oDepositList"></div></div>
      <div class="card"><div class="section-title">✅ Riwayat Lunas</div><div id="oPaidList"></div></div>
    </div>

    <div id="viewOwnerVoucher" class="view">
      <div class="card"><div class="section-title">🎟️ Buat Kode Voucher</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <input class="input" id="vGenCode" placeholder="KODE (contoh WALZYVIP)" style="grid-column:span 2">
          <input class="input" id="vGenDays" placeholder="Hari (contoh 7)" type="number">
          <input class="input" id="vGenQuota" placeholder="Kuota (0=unlimited)" type="number">
        </div>
        <button class="btn btn-purple" onclick="createVoucher(this)">Buat Voucher</button>
        <div id="voucherCreateStatus" style="font-size:11px;color:var(--muted);margin-top:8px"></div>
      </div>
      <div class="card"><div class="section-title">📋 Daftar Voucher</div><div id="oVoucherList"></div></div>
    </div>

    <div id="viewOwnerBroadcast" class="view">
      <div class="card"><div class="section-title">📢 Broadcast</div>
        <textarea class="input" id="bcTextInput" style="min-height:120px;resize:none" placeholder="Tulis pesan broadcast ke semua user..."></textarea>
        <button class="btn btn-primary" style="margin-top:8px" onclick="sendBroadcast(this)">Kirim Broadcast Sekarang</button>
        <div id="broadcastStatus" style="font-size:11px;color:var(--muted);margin-top:8px"></div>
      </div>
    </div>
  </div>
</div>

<div class="nav" id="userNavBar">
  <div class="tab active" onclick="switchTab('viewHome', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Beranda</div>
  <div class="tab" onclick="switchTab('viewProduk', this)"><svg class="icon" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Produk</div>
  <div class="tab" onclick="switchTab('viewDaily', this)"><svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Daily</div>
  <div class="tab" onclick="switchTab('viewProfil', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Profil</div>
</div>

<div class="nav" id="ownerNavBar" style="display:none">
  <div class="tab active" onclick="switchOwnerTab('viewOwnerDashboard', this)"><svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Dashboard</div>
  <div class="tab" onclick="switchOwnerTab('viewOwnerUsers', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Users</div>
  <div class="tab" onclick="switchOwnerTab('viewOwnerDeposit', this)"><svg class="icon" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>Deposit</div>
  <div class="tab" onclick="switchOwnerTab('viewOwnerVoucher', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h16v5"/><path d="M20 12v5H6a2 2 0 0 0-2 2c0 1.1.9 2 2 2h16v-5"/></svg>Voucher</div>
  <div class="tab" onclick="switchOwnerTab('viewOwnerBroadcast', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>Broadcast</div>
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
var ownerPollingTimer=null;
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
  setTimeout(function(){ ldr.style.display='none'; }, 450);
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
  if(prog){ prog.style.animation='none'; void prog.offsetWidth; prog.style.animation='prog 3s linear forwards'; prog.style.background='linear-gradient(90deg,'+c+','+c+')'; }
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
  var anglePer=(Math.PI*2)/slices;
  for(var i=0;i<slices;i++){
    ctx.beginPath();
    ctx.moveTo(cx,cy);
    ctx.arc(cx,cy,r,i*anglePer,(i+1)*anglePer);
    ctx.closePath();
    ctx.fillStyle=wheelPrizes[i].color;
    ctx.fill();
    ctx.strokeStyle='rgba(15,23,42,0.05)';
    ctx.lineWidth=2;
    ctx.stroke();
    ctx.save();
    ctx.translate(cx,cy);
    ctx.rotate(i*anglePer + anglePer/2);
    ctx.textAlign='right';
    ctx.fillStyle=i===1 ? '#64748b' : '#fff';
    ctx.font='bold 12px Outfit';
    ctx.fillText(wheelPrizes[i].label, r-16, 4);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(cx,cy,36,0,Math.PI*2);
  ctx.fillStyle='#ffffff';
  ctx.fill();
  ctx.strokeStyle='rgba(15,23,42,0.07)';
  ctx.lineWidth=2;
  ctx.stroke();
  ctx.fillStyle='#0f172a';
  ctx.font='800 11px Outfit';
  ctx.textAlign='center';
  ctx.fillText('WALZY', cx, cy-2);
  ctx.fillStyle='#64748b';
  ctx.font='700 8px Plus Jakarta Sans';
  ctx.fillText('SPIN', cx, cy+9);
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
  if(viewId==='viewOwnerDashboard' || viewId==='viewOwnerUsers' || viewId==='viewOwnerDeposit' || viewId==='viewOwnerVoucher') loadOwnerData();
  window.scrollTo({top:0, behavior:'smooth'});
}

function initApp(){
  try{
    tg=window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
    if(tg){
      try{ tg.ready(); tg.expand(); if(tg.setHeaderColor) tg.setHeaderColor('#ffffff'); if(tg.setBackgroundColor) tg.setBackgroundColor('#f7f8fc'); }catch(e){}
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
    setTimeout(hideLoader, 500);
    setTimeout(hideLoader, 1300);
    if(currentUserId){
      loadUserData(false);
      if(!pollingTimer){
        pollingTimer=setInterval(function(){ loadUserData(true); }, 2500);
      }
      if(!ownerPollingTimer){
        ownerPollingTimer=setInterval(function(){ if(isUserOwner) loadOwnerData(); }, 3500);
      }
    }else{
      hideLoader();
      var el=document.getElementById('uName');
      if(el) el.textContent='Guest Mode';
    }
  }catch(err){
    hideLoader();
  }
}

async function loadUserData(isSilent){
  try{
    if(!currentUserId) return;
    var url='/api/api?endpoint=user&user_id='+encodeURIComponent(currentUserId);
    if(currentFirstName) url+='&first_name='+encodeURIComponent(currentFirstName);
    if(currentUsername) url+='&username='+encodeURIComponent(currentUsername);
    var ctrl=new AbortController();
    var t=setTimeout(function(){ ctrl.abort(); }, 6500);
    var r=await fetch(url, {signal:ctrl.signal});
    clearTimeout(t);
    var data=await r.json();
    if(!data || !data.ok || !data.user){
      if(!isSilent) hideLoader();
      return;
    }
    var u=data.user;
    isUserOwner=!!u.isOwner;

    var map=[
      ['uName', u.first_name||'User'],
      ['uIdText', 'ID: '+u.id],
      ['pName', u.first_name||'User'],
      ['pIdText', 'ID: '+u.id]
    ];
    map.forEach(function(pair){
      var el=document.getElementById(pair[0]);
      if(el) el.textContent=pair[1];
    });

    var rankText=u.rank ? u.rank.name : 'BASIC';
    var statusText=u.isPremium ? 'VIP ('+u.premiumLeftDays+'H)' : 'Gratis';
    var premiumText=u.isPremium ? u.premiumLeftDays+' Hari' : 'Free';

    [['uRankBadge', rankText], ['pRankBadge', rankText], ['uStatusBadge', statusText], ['pStatusBadge', u.isPremium ? 'VIP' : 'Gratis'], ['pPremiumLeft', premiumText]].forEach(function(p){
      var el=document.getElementById(p[0]);
      if(el) el.textContent=p[1];
    });

    var premiumBadge=document.getElementById('uPremiumBadge');
    if(premiumBadge){
      if(u.isPremium){ premiumBadge.style.display='inline-flex'; premiumBadge.textContent='VIP '+u.premiumLeftDays+'H'; }
      else premiumBadge.style.display='none';
    }

    var quotaText=u.dailyFixRemaining||'5/5';
    [['sQuota', quotaText], ['pQuota', quotaText]].forEach(function(p){
      var el=document.getElementById(p[0]); if(el) el.textContent=p[1];
    });

    var pointsText=u.points||0;
    [['sPoints', pointsText], ['pPoints', pointsText]].forEach(function(p){
      var el=document.getElementById(p[0]); if(el) el.textContent=p[1];
    });

    [['sRefs', u.referralCount||0], ['pRefs', u.referralCount||0], ['pTotalFix', u.totalFix||0], ['pStreak', u.checkinStreak||0], ['refCountText', u.referralCount||0]].forEach(function(p){
      var el=document.getElementById(p[0]); if(el) el.textContent=p[1];
    });

    var chkVal=document.getElementById('checkinPointsVal');
    if(chkVal) chkVal.textContent=(u.points||0)+' PTS';
    var dailyStreak=document.getElementById('dailyStreakText');
    if(dailyStreak) dailyStreak.textContent=(u.checkinStreak||0)+' Hari';
    var dailyBadge=document.getElementById('dailyStatusBadge');
    if(dailyBadge){
      dailyBadge.textContent=u.canCheckin ? 'Belum' : 'Sudah';
      dailyBadge.className='badge '+(u.canCheckin ? 'amber' : 'emerald');
    }

    var refLink=u.referralLink||'';
    var ref1=document.getElementById('refUrlInput');
    if(ref1) ref1.value=refLink;
    var ref2=document.getElementById('pRefUrl');
    if(ref2) ref2.value=refLink;

    var spinBtn=document.getElementById('spinBtn');
    if(spinBtn && !isSpinning){
      spinBtn.disabled=!u.canSpin;
      spinBtn.textContent=u.canSpin ? 'Putar Spin' : 'Sudah Spin Hari Ini';
    }
    var chkBtn=document.getElementById('checkinBtn');
    if(chkBtn){
      chkBtn.disabled=!u.canCheckin;
      chkBtn.textContent=u.canCheckin ? 'Check-in Hari Ini' : 'Sudah Check-in';
    }

    for(var i=1;i<=7;i++){
      var el=document.getElementById('stDay'+i);
      if(el){
        if(i <= (u.checkinStreak||0)) el.classList.add('active');
        else el.classList.remove('active');
      }
    }

    if(isUserOwner){
      var ua=document.getElementById('viewUserArea'); if(ua) ua.style.display='none';
      var un=document.getElementById('userNavBar'); if(un) un.style.display='none';
      var oa=document.getElementById('viewOwnerArea'); if(oa) oa.style.display='block';
      var onb=document.getElementById('ownerNavBar'); if(onb) onb.style.display='flex';
      loadOwnerData();
    }else{
      var ua2=document.getElementById('viewUserArea'); if(ua2) ua2.style.display='block';
      var un2=document.getElementById('userNavBar'); if(un2) un2.style.display='flex';
      var oa2=document.getElementById('viewOwnerArea'); if(oa2) oa2.style.display='none';
      var onb2=document.getElementById('ownerNavBar'); if(onb2) onb2.style.display='none';
    }

    var invBox=document.getElementById('activeInvoiceBox');
    var buyBtns=document.querySelectorAll('.btn-buy-pkg');
    if(data.currentInvoice && invBox){
      var inv=data.currentInvoice;
      activeInvoiceId=inv.id||inv.invoice;
      buyBtns.forEach(function(b){ b.disabled=true; });
      var proofHtml=inv.proofImage ? '<div class="proof"><img src="'+inv.proofImage+'" onclick="openZoomModal(\\''+inv.proofImage+'\\')"></div>' : '<div style="font-size:11px;color:var(--muted);margin-top:6px">Belum upload bukti</div>';
      var stText=inv.status==='waiting_approval' ? 'Menunggu Verifikasi' : inv.status==='paid' ? 'Lunas' : 'Menunggu Bayar';
      invBox.innerHTML='<div class="invoice"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:800;font-size:12px">'+(inv.id||inv.invoice)+' • '+inv.days+'H</div><span class="badge cyan">'+stText+'</span></div><div style="font-size:11px;color:var(--muted);margin-top:4px">Rp '+(inv.amount||0).toLocaleString('id-ID')+'</div>'+proofHtml+'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px"><button class="btn btn-primary" style="padding:9px;font-size:11px" onclick="triggerUploadProof()">Upload Bukti</button><button class="btn btn-ghost" style="padding:9px;font-size:11px" onclick="cancelOrder(\\''+(inv.id||inv.invoice)+'\\', this)">Batal</button></div></div>';
    }else{
      if(invBox) invBox.innerHTML='';
      buyBtns.forEach(function(b){ b.disabled=false; });
    }

    var pil=document.getElementById('profileInvoiceList');
    if(pil){
      if(data.invoices && data.invoices.length>0){
        pil.innerHTML=data.invoices.slice(-10).reverse().map(function(iv){
          var st=iv.status==='paid' ? 'Lunas' : iv.status==='waiting_approval' ? 'Verifikasi' : iv.status==='pending' ? 'Pending' : iv.status;
          var badgeClass=iv.status==='paid' ? 'emerald' : iv.status==='waiting_approval' ? 'amber' : 'cyan';
          return '<div class="invoice"><div style="display:flex;justify-content:space-between"><div style="font-weight:800;font-size:11px">'+(iv.id||iv.invoice)+' • '+(iv.days||0)+'H</div><span class="badge '+badgeClass+'" style="font-size:9px">'+st+'</span></div><div style="font-size:10px;color:var(--muted);margin-top:3px">Rp '+(iv.amount||0).toLocaleString('id-ID')+' • '+new Date(iv.createdAt||Date.now()).toLocaleDateString('id-ID')+'</div>'+(iv.proofImage ? '<div class="proof" style="margin-top:6px"><img src="'+iv.proofImage+'" onclick="openZoomModal(\\''+iv.proofImage+'\\')"></div>' : '')+'</div>';
        }).join('');
      }else{
        pil.innerHTML='<div style="font-size:11px;color:var(--muted)">Belum ada invoice.</div>';
      }
    }

    var lt=document.getElementById('liveText');
    if(lt) lt.textContent='REALTIME • '+new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});

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
      var anglePer=360/wheelPrizes.length;
      var target=360*6 + (360 - (pIndex*anglePer + anglePer/2));
      wheelRotation+=target;
      var canvas=document.getElementById('spinCanvas');
      if(canvas) canvas.style.transform='rotate('+wheelRotation+'deg)';
      var sr=document.getElementById('spinResult');
      if(sr) sr.textContent='Memutar...';
      setTimeout(function(){
        showToast('Spin Berhadiah', data.message||'Hadiah!', 'success');
        var sr2=document.getElementById('spinResult');
        if(sr2) sr2.textContent=data.message||'Selamat!';
        loadUserData(false);
        if(btn){ btn.disabled=false; btn.textContent='Sudah Spin Hari Ini'; }
        isSpinning=false;
      }, 3800);
    }else{
      showToast('Gagal Spin', data ? data.message : 'Gagal', 'error');
      var sr3=document.getElementById('spinResult');
      if(sr3) sr3.textContent=data ? data.message : 'Gagal';
      if(btn){ btn.disabled=false; btn.textContent='Putar Spin'; }
      isSpinning=false;
    }
  }catch(e){
    showToast('Error','Gagal spin','error');
    if(btn){ btn.disabled=false; btn.textContent='Putar Spin'; }
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
    await loadUserData(false);
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
    if(data.ok) await loadUserData(false);
  }catch(e){ showToast('Error','Gagal redeem','error'); }
  finally{ if(btn) btn.disabled=false; }
}

async function createOrder(days, amount, btn){
  if(!currentUserId) return showToast('Error','User ID tidak ditemukan','error');
  if(btn){ btn.disabled=true; btn.textContent='Membuat...'; }
  try{
    var res=await fetch('/api/api?endpoint=create_order', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, days:days, amount:amount})});
    var data=await res.json();
    if(data.ok){ showToast('Invoice Dibuat', 'ID: '+(data.invoice.invoice||data.invoice.id), 'success'); await loadUserData(false); }
    else showToast('Gagal', data.message||'Gagal', 'error');
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
    if(data.ok) await loadUserData(false);
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
  if(!activeInvoiceId) return showToast('Error','Tidak ada invoice','error');
  if(file.size>5*1024*1024) return showToast('Error','Maks 5MB','error');
  var reader=new FileReader();
  reader.onload=function(e){
    (async function(){
      try{
        var base64=e.target.result;
        showToast('Uploading','Mengunggah...','info');
        var res=await fetch('/api/api?endpoint=upload_proof', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, invoice:activeInvoiceId, image_data:base64})});
        var data=await res.json();
        showToast(data.ok ? 'Sukses' : 'Gagal', data.message, data.ok ? 'success' : 'error');
        if(data.ok) await loadUserData(false);
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
  var statusEl=document.getElementById('voucherStatus');
  if(statusEl) statusEl.textContent='Memproses voucher...';
  try{
    var res=await fetch('/api/api?endpoint=claim_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, code:code})});
    var data=await res.json();
    showToast(data.ok ? 'Sukses Klaim' : 'Gagal Klaim', data.message, data.ok ? 'success' : 'error');
    if(statusEl) statusEl.textContent=data.message||'';
    if(data.ok){ codeEl.value=''; await loadUserData(false); }
  }catch(e){
    showToast('Error','Gagal klaim','error');
    if(statusEl) statusEl.textContent='Gagal klaim voucher';
  }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Tukarkan Sekarang'; } }
}

function copyRefLink(){
  var el=document.getElementById('refUrlInput');
  if(!el||!el.value) return showToast('Error','Link belum ada','warning');
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(el.value).then(function(){ showToast('Berhasil','Link disalin!','success'); }).catch(function(){ el.select(); document.execCommand('copy'); showToast('Berhasil','Link disalin!','success'); });
  }else{ el.select(); document.execCommand('copy'); showToast('Berhasil','Link disalin!','success'); }
}

function copyRefLink2(){
  var el=document.getElementById('pRefUrl');
  if(!el||!el.value) return showToast('Error','Link belum ada','warning');
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
      var els={
        oRev:'Rp '+(d.revenue||0).toLocaleString('id-ID'),
        oUsers:d.usersValid||0,
        oPending:(d.pendingPayments||[]).length,
        oPremium:d.premium||0,
        oTotalFix:d.totalFix||0,
        oCodes:(d.codes||[]).length
      };
      Object.keys(els).forEach(function(k){
        var el=document.getElementById(k);
        if(el) el.textContent=els[k];
      });

      var pendingList=document.getElementById('oPendingList');
      var depositList=document.getElementById('oDepositList');
      var paidList=document.getElementById('oPaidList');
      var pendingHtml='';
      if(d.pendingPayments && d.pendingPayments.length>0){
        pendingHtml=d.pendingPayments.map(function(p){
          return '<div class="invoice"><div style="display:flex;justify-content:space-between"><div><div style="font-weight:800;font-size:12px">'+p.id+'</div><div style="font-size:10px;color:var(--muted)">User: '+p.userId+' | '+p.days+'H | Rp '+(p.amount||0).toLocaleString('id-ID')+'</div>'+(p.proofImage ? '<div class="proof" style="margin-top:6px"><img src="'+p.proofImage+'" onclick="openZoomModal(\\''+p.proofImage+'\\')"></div>' : '<div style="font-size:10px;color:var(--amber);margin-top:4px">Belum upload bukti</div>')+'</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px"><button class="btn btn-emerald" style="padding:8px;font-size:10px" onclick="ownerAct(\\''+p.id+'\\', \\'approve\\', this)">Setujui</button><button class="btn btn-pink" style="padding:8px;font-size:10px" onclick="ownerAct(\\''+p.id+'\\', \\'reject\\', this)">Tolak</button></div></div>';
        }).join('');
      }else{
        pendingHtml='<div style="font-size:11px;color:var(--muted)">Tidak ada pending.</div>';
      }
      if(pendingList) pendingList.innerHTML=pendingHtml;
      if(depositList) depositList.innerHTML=pendingHtml;

      if(paidList){
        if(d.paidPayments && d.paidPayments.length>0){
          paidList.innerHTML=d.paidPayments.slice(0,10).map(function(p){
            return '<div class="invoice" style="padding:10px"><div style="font-weight:800;font-size:11px">'+p.id+' • '+p.userId+'</div><div style="font-size:10px;color:var(--muted)">Rp '+(p.amount||0).toLocaleString('id-ID')+' • '+p.days+'H • Lunas</div></div>';
          }).join('');
        }else{
          paidList.innerHTML='<div style="font-size:11px;color:var(--muted)">Belum ada riwayat lunas.</div>';
        }
      }

      var userList=document.getElementById('oUserList');
      if(userList){
        if(d.recentUsers && d.recentUsers.length>0){
          userList.innerHTML=d.recentUsers.slice(0,20).map(function(u){
            var isVip=u.premiumUntil && u.premiumUntil>Date.now();
            var left=isVip ? Math.ceil((u.premiumUntil-Date.now())/86400000)+'H' : '';
            return '<div class="card" style="padding:10px;margin-bottom:6px;box-shadow:none"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:800;font-size:12px">'+(u.first_name||'User')+'</div><div style="font-size:10px;color:var(--muted)">ID: '+u.id+' | Fix: '+(u.totalFix||0)+' | Poin: '+(u.points||0)+'</div></div><span class="badge '+(isVip?'emerald':'')+'">'+(isVip ? 'VIP '+left : 'Free')+'</span></div></div>';
          }).join('');
        }else{
          userList.innerHTML='<div style="font-size:11px;color:var(--muted)">Belum ada user.</div>';
        }
      }

      var vList=document.getElementById('oVoucherList');
      if(vList){
        if(d.codes && d.codes.length>0){
          vList.innerHTML=d.codes.map(function(c){
            var quotaText=c.quota && c.quota>0 ? (c.used||0)+'/'+c.quota : (c.used||0)+'/∞';
            var status=c.quota>0 && (c.used||0)>=c.quota ? 'Habis' : 'Aktif';
            return '<div class="card" style="padding:10px;margin-bottom:6px;box-shadow:none"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:800;font-size:12px">'+c.code+' <span class="badge '+(status==='Aktif'?'emerald':'amber')+'" style="font-size:8px;margin-left:4px">'+status+'</span></div><div style="font-size:10px;color:var(--muted);margin-top:2px">'+c.days+' Hari | '+quotaText+'</div></div><button class="btn btn-pink" style="width:auto;padding:6px 10px;font-size:10px" onclick="deleteVoucher(\\''+c.code+'\\', this)">Hapus</button></div></div>';
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
    if(data.ok){ await loadOwnerData(); await loadUserData(true); }
  }catch(e){ showToast('Error','Gagal','error'); }
}

async function createVoucher(btn){
  var code=document.getElementById('vGenCode').value.trim().toUpperCase();
  var days=document.getElementById('vGenDays').value;
  var quota=document.getElementById('vGenQuota').value;
  var statusEl=document.getElementById('voucherCreateStatus');
  if(!code||!days) return showToast('Error','Lengkapi kode & hari!','warning');
  if(btn){ btn.disabled=true; btn.textContent='Membuat...'; }
  if(statusEl) statusEl.textContent='Membuat voucher...';
  try{
    var res=await fetch('/api/api?endpoint=create_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, code:code, days:days, quota:quota})});
    var data=await res.json();
    showToast(data.ok ? 'Voucher Dibuat' : 'Gagal', data.message, data.ok ? 'success' : 'error');
    if(statusEl) statusEl.textContent=data.message||'';
    if(data.ok){ document.getElementById('vGenCode').value=''; document.getElementById('vGenDays').value=''; document.getElementById('vGenQuota').value=''; await loadOwnerData(); }
  }catch(e){ showToast('Error','Gagal','error'); if(statusEl) statusEl.textContent='Gagal membuat voucher'; }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Buat Voucher'; } }
}

async function deleteVoucher(code, btn){
  if(btn) btn.disabled=true;
  try{
    var res=await fetch('/api/api?endpoint=delete_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, code:code})});
    var data=await res.json();
    showToast(data.ok ? 'Dihapus' : 'Gagal', data.message, data.ok ? 'success' : 'error');
    if(data.ok) await loadOwnerData();
  }catch(e){ showToast('Error','Gagal','error'); }
  finally{ if(btn) btn.disabled=false; }
}

async function sendBroadcast(btn){
  var text=document.getElementById('bcTextInput').value.trim();
  var statusEl=document.getElementById('broadcastStatus');
  if(!text) return showToast('Error','Pesan kosong!','warning');
  if(btn){ btn.disabled=true; btn.textContent='Mengirim...'; }
  if(statusEl) statusEl.textContent='Mengirim broadcast...';
  try{
    var res=await fetch('/api/api?endpoint=broadcast', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, text:text})});
    var data=await res.json();
    if(data && data.ok){ showToast('Broadcast Selesai', data.message, 'success'); document.getElementById('bcTextInput').value=''; if(statusEl) statusEl.textContent=data.message; await loadOwnerData(); }
    else{ showToast('Gagal', data ? data.message : 'Gagal', 'error'); if(statusEl) statusEl.textContent=data ? data.message : 'Gagal'; }
  }catch(e){ showToast('Error','Gagal broadcast','error'); if(statusEl) statusEl.textContent='Gagal broadcast'; }
  finally{ if(btn){ btn.disabled=false; btn.textContent='Kirim Broadcast Sekarang'; } }
}

window.addEventListener('error', function(){ hideLoader(); });
window.addEventListener('unhandledrejection', function(){ hideLoader(); });
document.addEventListener('DOMContentLoaded', function(){
  initApp();
  setTimeout(hideLoader, 900);
  setTimeout(hideLoader, 2200);
});
window.addEventListener('load', function(){ hideLoader(); });
setTimeout(function(){ hideLoader(); }, 3000);
</script>
</body>
</html>`;
  res.send(html);
};
