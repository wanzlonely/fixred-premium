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
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
:root{
--bg:#fbfbfd;
--card:#ffffff;
--bd:rgba(15,23,42,0.07);
--bd2:rgba(15,23,42,0.12);
--text:#0f172a;
--muted:#7b869e;
--black:#0f172a;
--shadow:0 10px 26px rgba(15,23,42,0.05);
--shadow2:0 20px 50px rgba(15,23,42,0.12);
}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;font-family:'Plus Jakarta Sans',sans-serif}
body{background:var(--bg);color:var(--text);min-height:100vh;padding-bottom:116px;overflow-x:hidden}
.icon{width:20px;height:20px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.loader{position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:#fff;transition:opacity .35s ease, visibility .35s ease}
.loader.hidden{opacity:0;visibility:hidden;pointer-events:none}
.loader-logo{width:62px;height:62px;border-radius:16px;background:#0f172a;display:grid;place-items:center;color:#fff;font-family:'Outfit',sans-serif;font-weight:900;font-size:26px}
.loader-bar{width:110px;height:3px;border-radius:999px;background:rgba(15,23,42,0.07);overflow:hidden}
.loader-bar i{display:block;height:100%;width:34%;background:#0f172a;border-radius:999px;animation:bar 1s ease-in-out infinite}
@keyframes bar{0%{transform:translateX(-100%)}100%{transform:translateX(320%)}}
@keyframes in{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.header{position:sticky;top:0;z-index:30;height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:rgba(255,255,255,0.9);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid var(--bd)}
.brand{display:flex;align-items:center;gap:9px}
.brand-logo{width:30px;height:30px;border-radius:8px;background:#0f172a;display:grid;place-items:center;color:#fff;font-family:'Outfit',sans-serif;font-weight:900;font-size:14px}
.brand-name{font-family:'Outfit',sans-serif;font-weight:800;font-size:14px}
.live{display:flex;align-items:center;gap:5px;padding:5px 9px;border-radius:999px;background:#0f172a;color:#fff;font-size:9px;font-weight:800}
.live b{width:5px;height:5px;border-radius:50%;background:#22c55e;animation:pulse 1.5s infinite;display:inline-block}
.container{max-width:480px;margin:0 auto;padding:10px 10px}
.card{background:var(--card);border:1px solid var(--bd);border-radius:22px;padding:16px;box-shadow:var(--shadow)}
.hero{background:#0f172a;border-radius:22px;padding:18px;color:#fff;position:relative;overflow:hidden}
.hero::after{content:'';position:absolute;top:-40px;right:-40px;width:120px;height:120px;background:rgba(255,255,255,0.06);border-radius:50%}
.badge{display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;font-size:9px;font-weight:800;letter-spacing:.3px;text-transform:uppercase;border:1px solid var(--bd);background:rgba(15,23,42,0.03);color:var(--muted)}
.badge.black{background:#0f172a;color:#fff;border-color:#0f172a}
.badge.white{background:#fff;color:#0f172a;border-color:var(--bd)}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:10px 0}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
.stat{background:var(--card);border:1px solid var(--bd);border-radius:18px;padding:12px 10px}
.stat-v{font-family:'Outfit',sans-serif;font-weight:800;font-size:18px}
.stat-l{font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--muted);margin-top:2px}
.stat-dark{background:#0f172a;border-color:#0f172a;color:#fff}
.stat-dark .stat-l{color:rgba(255,255,255,0.6)}
.btn{width:100%;padding:13px 14px;border-radius:14px;border:none;font-family:'Outfit',sans-serif;font-weight:800;font-size:12px;letter-spacing:.2px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;transition:transform .14s ease}
.btn:active{transform:scale(.97)}
.btn:disabled{opacity:.42;cursor:not-allowed}
.btn-black{background:#0f172a;color:#fff}
.btn-white{background:#fff;color:#0f172a;border:1px solid var(--bd)}
.btn-ghost{background:#f3f4f8;border:1px solid var(--bd);color:#0f172a}
.input{width:100%;padding:12px 12px;border-radius:14px;background:#f8f9fc;border:1px solid var(--bd);color:#0f172a;outline:none;font-size:13px;font-weight:600}
.input:focus{border-color:var(--bd2)}
.view{display:none;opacity:0}
.view.active{display:block;opacity:1;animation:in .28s ease}
.nav{position:fixed;bottom:10px;left:50%;transform:translateX(-50%);width:calc(100% - 16px);max-width:480px;background:rgba(255,255,255,0.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid var(--bd);border-radius:20px;display:flex;justify-content:space-around;padding:6px;z-index:60;box-shadow:var(--shadow2)}
.tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:14px;color:var(--muted);font-size:9px;font-weight:800;cursor:pointer;transition:all .18s ease;border:1px solid transparent}
.tab.active{color:#0f172a;background:#f3f4f8;border-color:var(--bd)}
.wheel-wrap{position:relative;width:260px;height:260px;margin:0 auto}
.wheel{width:260px;height:260px;border-radius:50%;border:4px solid #fff;box-shadow:0 10px 26px rgba(15,23,42,0.07), 0 0 0 1px rgba(15,23,42,0.07) inset;transition:transform 4s cubic-bezier(.15,.85,.2,1);overflow:hidden}
.wheel-pointer{position:absolute;top:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:9px solid transparent;border-right:9px solid transparent;border-top:14px solid #0f172a;z-index:2}
.shop-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.shop-item{background:var(--card);border:1px solid var(--bd);border-radius:20px;padding:14px;position:relative}
.shop-item.best{border-color:#0f172a;border-width:1.5px}
.shop-badge{position:absolute;top:8px;right:8px;padding:3px 7px;border-radius:999px;font-size:8px;font-weight:800;background:#0f172a;color:#fff}
.point-shop{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.point-item{background:var(--card);border:1px solid var(--bd);border-radius:18px;padding:12px}
.point-price{font-family:'Outfit',sans-serif;font-weight:800;font-size:12px;margin-top:6px}
.toast{position:fixed;top:12px;left:50%;transform:translateX(-50%) translateY(-10px);background:#0f172a;border-radius:16px;padding:12px 14px;display:flex;gap:10px;align-items:center;min-width:280px;max-width:92vw;box-shadow:var(--shadow2);opacity:0;pointer-events:none;transition:all .26s ease;z-index:10000;color:#fff}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto}
.toast-bar{position:absolute;bottom:0;left:0;height:3px;background:#fff;border-radius:0 0 16px 16px;animation:prog 3s linear forwards}
@keyframes prog{from{width:100%}to{width:0%}}
.modal{position:fixed;inset:0;background:rgba(15,23,42,0.36);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:none;place-items:center;z-index:9000;padding:16px}
.modal.open{display:grid}
.proof{position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--bd);margin-top:8px}
.proof img{width:100%;max-height:210px;object-fit:cover;display:block}
.streak{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}
.streak-day{width:34px;height:38px;border-radius:10px;background:#f3f4f8;border:1px solid var(--bd);display:grid;place-items:center;font-size:10px;font-weight:800;color:var(--muted)}
.streak-day.active{background:#0f172a;border-color:#0f172a;color:#fff}
.invoice{background:#f8f9fc;border:1px solid var(--bd);border-radius:16px;padding:12px;margin-bottom:8px}
.page-title{font-family:'Outfit',sans-serif;font-weight:900;font-size:22px;letter-spacing:-.4px;margin-bottom:2px}
.page-sub{font-size:12px;color:var(--muted);font-weight:600;margin-bottom:12px}
.section-title{font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;margin-bottom:10px}
.owner-hero{background:#0f172a;border-radius:22px;padding:18px;color:#fff;position:relative;overflow:hidden}
.owner-stat-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
@media (max-width:360px){.owner-stat-grid{grid-template-columns:1fr 1fr}.grid3{grid-template-columns:1fr 1fr}.shop-grid{grid-template-columns:1fr}.point-shop{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="loader" id="loader">
  <div class="loader-logo">W</div>
  <div class="loader-bar"><i></i></div>
</div>

<div class="toast" id="toast">
  <div id="toastIcon" style="width:32px;height:32px;border-radius:10px;background:rgba(255,255,255,0.12);display:grid;place-items:center;color:#fff"><svg class="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
  <div style="flex:1"><div id="toastTitle" style="font-family:'Outfit',sans-serif;font-weight:800;font-size:12px">System</div><div id="toastMsg" style="font-size:11px;color:rgba(255,255,255,0.72);font-weight:600;margin-top:1px">Message</div></div>
  <div class="toast-bar" id="toastProgress"></div>
</div>

<div class="modal" id="imageZoomModal" onclick="closeZoomModal()"><div onclick="event.stopPropagation()" style="display:flex;flex-direction:column;gap:12px;align-items:center"><img id="zoomedImageSrc" src="" style="max-width:92vw;max-height:76vh;object-fit:contain;border-radius:16px;box-shadow:var(--shadow2)"><button class="btn btn-white" style="width:auto;padding:9px 22px" onclick="closeZoomModal()">Tutup</button></div></div>

<div class="header">
  <div class="brand"><div class="brand-logo">W</div><div class="brand-name">WALZY STORE</div></div>
  <div class="live"><b></b> <span id="liveText">LIVE</span></div>
</div>

<div class="container">
  <div id="viewUserArea">
    <div id="viewBeranda" class="view active">
      <div class="hero">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:52px;height:52px;border-radius:14px;background:rgba(255,255,255,0.12);display:grid;place-items:center"><svg class="icon" style="color:#fff" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
          <div style="flex:1">
            <div id="uName" style="font-family:'Outfit',sans-serif;font-weight:800;font-size:17px">Memuat</div>
            <div id="uIdText" style="font-size:11px;color:rgba(255,255,255,0.6);font-weight:700;margin-top:1px">ID: --</div>
            <div style="display:flex;gap:5px;margin-top:7px;flex-wrap:wrap"><span class="badge white" id="uRankBadge">BASIC</span><span class="badge" style="background:rgba(255,255,255,0.12);color:#fff;border-color:rgba(255,255,255,0.12)" id="uStatusBadge">Gratis</span><span class="badge" style="background:rgba(255,255,255,0.12);color:#fff;border-color:rgba(255,255,255,0.12)" id="uWeekBadge">M1</span></div>
          </div>
        </div>
      </div>
      <div class="grid3" style="margin-top:10px">
        <div class="stat stat-dark"><div class="stat-v" id="sQuota">5/5</div><div class="stat-l">Kuota</div></div>
        <div class="stat"><div class="stat-v" id="sTotalFix">0</div><div class="stat-l">Total Fix</div></div>
        <div class="stat"><div class="stat-v" id="sPoints">0</div><div class="stat-l">Poin</div></div>
      </div>
      <div class="grid3" style="margin-top:0">
        <div class="stat"><div class="stat-v" id="sRefs">0</div><div class="stat-l">Referral</div></div>
        <div class="stat"><div class="stat-v" id="sStreak">0</div><div class="stat-l">Streak</div></div>
        <div class="stat"><div class="stat-v" id="sPremium">Free</div><div class="stat-l">VIP</div></div>
      </div>

      <div class="card" style="margin-top:10px">
        <div class="page-title" style="font-size:16px;margin-bottom:8px">Referral</div>
        <input class="input" id="refUrlInput" readonly value="Memuat">
        <button class="btn btn-black" style="margin-top:8px" onclick="copyRefLink()">Salin Link</button>
      </div>

      <div class="card">
        <div class="page-title" style="font-size:16px;margin-bottom:8px">Voucher</div>
        <input class="input" id="vCodeInput" placeholder="Kode voucher">
        <button class="btn btn-black" style="margin-top:8px" onclick="claimVoucher(this)">Tukarkan</button>
        <div id="voucherStatus" style="font-size:11px;color:var(--muted);margin-top:8px;font-weight:600"></div>
      </div>

      <div class="card">
        <div class="page-title" style="font-size:16px;margin-bottom:8px">Riwayat</div>
        <div id="profileInvoiceList" style="font-size:12px;color:var(--muted)">Memuat</div>
      </div>
    </div>

    <div id="viewProduk" class="view">
      <div class="card" style="background:#0f172a;border-color:#0f172a;color:#fff">
        <div class="page-title" style="color:#fff">Produk VIP</div>
        <div class="page-sub" style="color:rgba(255,255,255,0.6)">Pilih paket & upload bukti DANA</div>
        <div style="display:flex;gap:6px;margin-top:8px"><span class="badge" style="background:rgba(255,255,255,0.12);color:#fff;border-color:rgba(255,255,255,0.12)">Realtime</span><span class="badge" style="background:rgba(255,255,255,0.12);color:#fff;border-color:rgba(255,255,255,0.12)">Upload Bukti</span></div>
      </div>
      <div id="activeInvoiceBox" style="margin-top:10px"></div>
      <div class="shop-grid" style="margin-top:10px">
        <div class="shop-item"><div style="font-weight:800;font-size:13px">Trial 3H</div><div style="font-size:10px;color:var(--muted)">3 Hari</div><div style="font-weight:800;font-size:17px;margin-top:8px">Rp 7.000</div><button class="btn btn-black btn-buy-pkg" style="padding:10px;font-size:11px;margin-top:10px" onclick="createOrder(3,7000,this)">Beli</button></div>
        <div class="shop-item"><div style="font-weight:800;font-size:13px">Hemat 5H</div><div style="font-size:10px;color:var(--muted)">5 Hari</div><div style="font-weight:800;font-size:17px;margin-top:8px">Rp 10.000</div><button class="btn btn-black btn-buy-pkg" style="padding:10px;font-size:11px;margin-top:10px" onclick="createOrder(5,10000,this)">Beli</button></div>
        <div class="shop-item"><div style="font-weight:800;font-size:13px">Starter 7H</div><div style="font-size:10px;color:var(--muted)">Popular</div><div style="font-weight:800;font-size:17px;margin-top:8px">Rp 15.000</div><button class="btn btn-black btn-buy-pkg" style="padding:10px;font-size:11px;margin-top:10px" onclick="createOrder(7,15000,this)">Beli</button></div>
        <div class="shop-item"><div style="font-weight:800;font-size:13px">Pro 14H</div><div style="font-size:10px;color:var(--muted)">Best Value</div><div style="font-weight:800;font-size:17px;margin-top:8px">Rp 25.000</div><button class="btn btn-black btn-buy-pkg" style="padding:10px;font-size:11px;margin-top:10px" onclick="createOrder(14,25000,this)">Beli</button></div>
        <div class="shop-item best" style="grid-column:span 2"><span class="shop-badge">BEST</span><div style="font-weight:800;font-size:16px">Sultan 30H</div><div style="font-size:11px;color:var(--muted)">Unlimited + 500 PTS Bonus</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px"><div style="font-weight:900;font-size:20px">Rp 40.000</div><button class="btn btn-black btn-buy-pkg" style="width:auto;padding:10px 18px" onclick="createOrder(30,40000,this)">Beli Sultan</button></div></div>
      </div>
      <div class="card" style="margin-top:10px">
        <div class="section-title">Pembayaran</div>
        <div style="font-size:11px;color:var(--muted);line-height:1.7;font-weight:600">
          1. Pilih paket & Beli<br>
          2. Invoice muncul di atas<br>
          3. Transfer DANA sesuai nominal<br>
          4. Upload bukti screenshot<br>
          5. Verifikasi realtime owner<br>
          6. VIP aktif otomatis
        </div>
        <div style="margin-top:10px;padding:12px;border-radius:14px;background:#0f172a;color:#fff;font-size:11px;font-weight:700">DANA: <span id="danaNumber">Memuat</span> • <span id="danaName">WALZY</span></div>
      </div>
    </div>

    <div id="viewDaily" class="view">
      <div class="card" style="background:#0f172a;border-color:#0f172a;color:#fff">
        <div class="page-title" style="color:#fff;font-size:18px">Daily Rewards</div>
        <div class="page-sub" style="color:rgba(255,255,255,0.6)">Check-in mingguan beda + Spin presisi + Toko Poin</div>
      </div>

      <div class="card" style="margin-top:10px">
        <div class="section-title">Check-in Mingguan</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="font-size:11px;color:var(--muted);font-weight:600">Streak <b id="dailyStreakText" style="color:#0f172a">0 Hari</b> • <span id="weekText">Minggu 1</span></div>
          <span class="badge black" id="dailyStatusBadge">Belum</span>
        </div>
        <div style="font-size:10px;color:var(--muted);margin-bottom:8px;font-weight:600" id="weeklyInfo">Memuat</div>
        <div class="streak" id="streakContainer">
          <div class="streak-day" id="stDay1">1</div><div class="streak-day" id="stDay2">2</div><div class="streak-day" id="stDay3">3</div><div class="streak-day" id="stDay4">4</div><div class="streak-day" id="stDay5">5</div><div class="streak-day" id="stDay6">6</div><div class="streak-day" id="stDay7">7</div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:10px">
          <div style="font-size:11px;color:var(--muted);font-weight:600">Poin <b id="checkinPointsVal" style="color:#0f172a">0</b></div>
          <div style="font-size:11px;color:var(--muted);font-weight:600">Bonus <b id="todayBonus" style="color:#0f172a">+0</b></div>
        </div>
        <button class="btn btn-black" id="checkinBtn" style="margin-top:10px" onclick="triggerCheckin(this)">Check-in</button>
      </div>

      <div class="card">
        <div class="section-title">Spin Wheel Presisi</div>
        <div class="wheel-wrap"><div class="wheel-pointer"></div><canvas id="spinCanvas" class="wheel" width="260" height="260"></canvas></div>
        <button class="btn btn-black" id="spinBtn" style="margin-top:12px" onclick="triggerSpin(this)">Putar Spin</button>
        <div id="spinResult" style="font-size:11px;color:var(--muted);text-align:center;margin-top:8px;font-weight:600"></div>
      </div>

      <div class="card">
        <div class="section-title">Toko Poin Rapi</div>
        <div class="point-shop">
          <div class="point-item"><div style="font-weight:800;font-size:12px">+1 Kuota</div><div style="font-size:10px;color:var(--muted)">1 kuota</div><div class="point-price">100 PTS</div><button class="btn btn-ghost" style="padding:8px;font-size:10px;margin-top:8px" onclick="redeemPoints('quota1', this)">Tukar</button></div>
          <div class="point-item"><div style="font-weight:800;font-size:12px">+3 Kuota</div><div style="font-size:10px;color:var(--muted)">Hemat</div><div class="point-price">250 PTS</div><button class="btn btn-ghost" style="padding:8px;font-size:10px;margin-top:8px" onclick="redeemPoints('quota3', this)">Tukar</button></div>
          <div class="point-item"><div style="font-weight:800;font-size:12px">Reset Spin</div><div style="font-size:10px;color:var(--muted)">Spin lagi</div><div class="point-price">150 PTS</div><button class="btn btn-ghost" style="padding:8px;font-size:10px;margin-top:8px" onclick="redeemPoints('spin', this)">Tukar</button></div>
          <div class="point-item"><div style="font-weight:800;font-size:12px">VIP 1H</div><div style="font-size:10px;color:var(--muted)">Unlimited</div><div class="point-price">500 PTS</div><button class="btn btn-black" style="padding:8px;font-size:10px;margin-top:8px" onclick="redeemPoints('vip1', this)">Tukar</button></div>
          <div class="point-item"><div style="font-weight:800;font-size:12px">VIP 3H</div><div style="font-size:10px;color:var(--muted)">Best</div><div class="point-price">1200 PTS</div><button class="btn btn-black" style="padding:8px;font-size:10px;margin-top:8px" onclick="redeemPoints('vip3', this)">Tukar</button></div>
          <div class="point-item"><div style="font-weight:800;font-size:12px">+200 Bonus</div><div style="font-size:10px;color:var(--muted)">300→500</div><div class="point-price">300 PTS</div><button class="btn btn-black" style="padding:8px;font-size:10px;margin-top:8px" onclick="redeemPoints('bonus200', this)">Tukar</button></div>
        </div>
      </div>
    </div>
  </div>

  <div id="viewOwnerArea" style="display:none">
    <div id="viewOwnerDashboard" class="view active">
      <div class="owner-hero">
        <div class="page-title" style="color:#fff">Dashboard</div>
        <div class="page-sub" style="color:rgba(255,255,255,0.6)">Executive overview realtime</div>
        <div class="owner-stat-grid" style="margin-top:14px">
          <div class="stat" style="background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.12)"><div class="stat-v" style="color:#fff" id="oRev">Rp 0</div><div class="stat-l" style="color:rgba(255,255,255,0.6)">Revenue</div></div>
          <div class="stat" style="background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.12)"><div class="stat-v" style="color:#fff" id="oUsers">0</div><div class="stat-l" style="color:rgba(255,255,255,0.6)">Users</div></div>
          <div class="stat" style="background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.12)"><div class="stat-v" style="color:#fff" id="oPending">0</div><div class="stat-l" style="color:rgba(255,255,255,0.6)">Pending</div></div>
          <div class="stat" style="background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.12)"><div class="stat-v" style="color:#fff" id="oPremium">0</div><div class="stat-l" style="color:rgba(255,255,255,0.6)">VIP</div></div>
          <div class="stat" style="background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.12)"><div class="stat-v" style="color:#fff" id="oTotalFix">0</div><div class="stat-l" style="color:rgba(255,255,255,0.6)">Total Fix</div></div>
          <div class="stat" style="background:rgba(255,255,255,0.08);border-color:rgba(255,255,255,0.12)"><div class="stat-v" style="color:#fff" id="oCodes">0</div><div class="stat-l" style="color:rgba(255,255,255,0.6)">Voucher</div></div>
        </div>
      </div>
      <div class="card" style="margin-top:10px"><div class="section-title">Pembayaran Masuk</div><div id="oPendingList"></div></div>
    </div>

    <div id="viewOwnerUsers" class="view">
      <div class="card" style="background:#0f172a;border-color:#0f172a;color:#fff">
        <div class="page-title" style="color:#fff">Users</div>
        <div class="page-sub" style="color:rgba(255,255,255,0.6)">Total user realtime</div>
      </div>
      <div class="card" style="margin-top:10px"><div id="oUserList"></div></div>
    </div>

    <div id="viewOwnerDeposit" class="view">
      <div class="card" style="background:#0f172a;border-color:#0f172a;color:#fff">
        <div class="page-title" style="color:#fff">Deposit</div>
        <div class="page-sub" style="color:rgba(255,255,255,0.6)">Kelola pembayaran masuk</div>
      </div>
      <div class="card" style="margin-top:10px"><div class="section-title">Masuk</div><div id="oDepositList"></div></div>
      <div class="card"><div class="section-title">Lunas</div><div id="oPaidList"></div></div>
    </div>

    <div id="viewOwnerVoucher" class="view">
      <div class="card" style="background:#0f172a;border-color:#0f172a;color:#fff">
        <div class="page-title" style="color:#fff">Voucher</div>
        <div class="page-sub" style="color:rgba(255,255,255,0.6)">Buat & kelola kode voucher</div>
      </div>
      <div class="card" style="margin-top:10px">
        <div class="section-title">Buat Voucher</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
          <input class="input" id="vGenCode" placeholder="KODE" style="grid-column:span 2">
          <input class="input" id="vGenDays" placeholder="Hari" type="number">
          <input class="input" id="vGenQuota" placeholder="Kuota 0=∞" type="number">
        </div>
        <button class="btn btn-black" onclick="createVoucher(this)">Buat Voucher</button>
        <div id="voucherCreateStatus" style="font-size:11px;color:var(--muted);margin-top:8px;font-weight:600"></div>
      </div>
      <div class="card"><div class="section-title">Daftar Voucher</div><div id="oVoucherList"></div></div>
    </div>

    <div id="viewOwnerBroadcast" class="view">
      <div class="card" style="background:#0f172a;border-color:#0f172a;color:#fff">
        <div class="page-title" style="color:#fff">Broadcast</div>
        <div class="page-sub" style="color:rgba(255,255,255,0.6)">Kirim ke semua user</div>
      </div>
      <div class="card" style="margin-top:10px">
        <textarea class="input" id="bcTextInput" style="min-height:130px;resize:none" placeholder="Tulis pesan broadcast"></textarea>
        <button class="btn btn-black" style="margin-top:10px" onclick="sendBroadcast(this)">Kirim Broadcast</button>
        <div id="broadcastStatus" style="font-size:11px;color:var(--muted);margin-top:8px;font-weight:600"></div>
      </div>
    </div>
  </div>
</div>

<div class="nav" id="userNavBar">
  <div class="tab active" onclick="switchTab('viewBeranda', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Beranda</div>
  <div class="tab" onclick="switchTab('viewProduk', this)"><svg class="icon" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Produk</div>
  <div class="tab" onclick="switchTab('viewDaily', this)"><svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Daily</div>
</div>

<div class="nav" id="ownerNavBar" style="display:none">
  <div class="tab active" onclick="switchOwnerTab('viewOwnerDashboard', this)"><svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>Dashboard</div>
  <div class="tab" onclick="switchOwnerTab('viewOwnerUsers', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Users</div>
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
var wheelPrizes=[{label:"+50 PTS",color:"#0f172a"},{label:"ZONK",color:"#e2e8f0"},{label:"+25 PTS",color:"#334155"},{label:"+100 PTS",color:"#475569"},{label:"+3 KUOTA",color:"#64748b"},{label:"VIP 1H",color:"#0f172a"}];
var weeklyPoints=[[10,15,20,25,30,50,100],[15,20,25,30,40,60,120],[20,25,30,40,50,70,140],[25,30,40,50,60,80,160]];
function getWeekIndex(){return Math.floor(Date.now()/(7*24*3600*1000))%4;}
function hideLoader(){var ldr=document.getElementById('loader');if(!ldr) return;if(ldr.classList.contains('hidden')) return;ldr.classList.add('hidden');setTimeout(function(){ldr.style.display='none';},350);}
function showToast(title, msg, type){var toast=document.getElementById('toast');var tTitle=document.getElementById('toastTitle');var tMsg=document.getElementById('toastMsg');if(!toast) return;tTitle.textContent=title||'System';tMsg.textContent=msg||'';toast.classList.add('show');clearTimeout(toastTimeout);var prog=document.getElementById('toastProgress');if(prog){prog.style.animation='none';void prog.offsetWidth;prog.style.animation='prog 3s linear forwards';}toastTimeout=setTimeout(function(){toast.classList.remove('show');},3000);if(tg && tg.HapticFeedback){try{tg.HapticFeedback.notificationOccurred(type==='error'?'error':type==='success'?'success':'warning');}catch(e){}}}
function drawWheel(){var canvas=document.getElementById('spinCanvas');if(!canvas) return;var ctx=canvas.getContext('2d');if(!ctx) return;var w=canvas.width;var h=canvas.height;var cx=w/2;var cy=h/2;var r=Math.min(w,h)/2 - 6;ctx.clearRect(0,0,w,h);var slices=wheelPrizes.length;var anglePer=(Math.PI*2)/slices;for(var i=0;i<slices;i++){ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,i*anglePer,(i+1)*anglePer);ctx.closePath();ctx.fillStyle=wheelPrizes[i].color;ctx.fill();ctx.strokeStyle='rgba(15,23,42,0.06)';ctx.lineWidth=2;ctx.stroke();ctx.save();ctx.translate(cx,cy);ctx.rotate(i*anglePer + anglePer/2);ctx.textAlign='right';ctx.fillStyle=i===1 ? '#64748b' : '#fff';ctx.font='bold 11px Outfit';ctx.fillText(wheelPrizes[i].label, r-14, 4);ctx.restore();}ctx.beginPath();ctx.arc(cx,cy,32,0,Math.PI*2);ctx.fillStyle='#ffffff';ctx.fill();ctx.strokeStyle='rgba(15,23,42,0.08)';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#0f172a';ctx.font='800 10px Outfit';ctx.textAlign='center';ctx.fillText('WALZY', cx, cy-2);ctx.fillStyle='#64748b';ctx.font='700 8px Plus Jakarta Sans';ctx.fillText('SPIN', cx, cy+8);}
function openZoomModal(src){var m=document.getElementById('imageZoomModal');var img=document.getElementById('zoomedImageSrc');if(!m||!img) return;img.src=src;m.classList.add('open');}
function closeZoomModal(){var m=document.getElementById('imageZoomModal');if(m) m.classList.remove('open');}
function switchTab(viewId, el){var views=document.querySelectorAll('#viewUserArea .view');views.forEach(function(v){v.classList.remove('active');});var target=document.getElementById(viewId);if(target) target.classList.add('active');var tabs=document.querySelectorAll('#userNavBar .tab');tabs.forEach(function(t){t.classList.remove('active');});if(el) el.classList.add('active');if(tg && tg.HapticFeedback){try{tg.HapticFeedback.selectionChanged();}catch(e){}}window.scrollTo({top:0, behavior:'smooth'});}
function switchOwnerTab(viewId, el){var views=document.querySelectorAll('#viewOwnerArea .view');views.forEach(function(v){v.classList.remove('active');});var target=document.getElementById(viewId);if(target) target.classList.add('active');var tabs=document.querySelectorAll('#ownerNavBar .tab');tabs.forEach(function(t){t.classList.remove('active');});if(el) el.classList.add('active');if(viewId==='viewOwnerDashboard' || viewId==='viewOwnerUsers' || viewId==='viewOwnerDeposit' || viewId==='viewOwnerVoucher' || viewId==='viewOwnerBroadcast') loadOwnerData();window.scrollTo({top:0, behavior:'smooth'});}
function initApp(){try{tg=window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;if(tg){try{tg.ready();tg.expand();if(tg.setHeaderColor) tg.setHeaderColor('#ffffff');if(tg.setBackgroundColor) tg.setBackgroundColor('#fbfbfd');}catch(e){}}if(tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.id){currentUserId=tg.initDataUnsafe.user.id;currentFirstName=tg.initDataUnsafe.user.first_name||'';currentUsername=tg.initDataUnsafe.user.username||'';}else{var sp=new URLSearchParams(window.location.search);currentUserId=sp.get('user_id')||sp.get('userId')||sp.get('id')||localStorage.getItem('walzy_uid')||null;currentFirstName=sp.get('first_name')||'';currentUsername=sp.get('username')||'';}if(currentUserId){try{localStorage.setItem('walzy_uid', String(currentUserId));}catch(e){}}drawWheel();setTimeout(hideLoader, 400);setTimeout(hideLoader, 1100);if(currentUserId){loadUserData(false);if(!pollingTimer){pollingTimer=setInterval(function(){loadUserData(true);}, 2500);}if(!ownerPollingTimer){ownerPollingTimer=setInterval(function(){if(isUserOwner) loadOwnerData();}, 3500);}}else{hideLoader();}var week=getWeekIndex();var weekText=document.getElementById('weekText');if(weekText) weekText.textContent='Minggu '+(week+1);var weekBadge=document.getElementById('uWeekBadge');if(weekBadge) weekBadge.textContent='M'+(week+1);var weeklyInfo=document.getElementById('weeklyInfo');if(weeklyInfo){var pts=weeklyPoints[week];weeklyInfo.textContent='Minggu ini: D1 '+pts[0]+' | D2 '+pts[1]+' | D3 '+pts[2]+' | D4 '+pts[3]+' | D5 '+pts[4]+' | D6 '+pts[5]+' | D7 '+pts[6]+' PTS';}}catch(err){hideLoader();}}
async function loadUserData(isSilent){
try{
if(!currentUserId) return;
var url='/api/api?endpoint=user&user_id='+encodeURIComponent(currentUserId);
if(currentFirstName) url+='&first_name='+encodeURIComponent(currentFirstName);
if(currentUsername) url+='&username='+encodeURIComponent(currentUsername);
var ctrl=new AbortController();
var t=setTimeout(function(){ctrl.abort();}, 6500);
var r=await fetch(url, {signal:ctrl.signal});
clearTimeout(t);
var data=await r.json();
if(!data || !data.ok || !data.user){if(!isSilent) hideLoader();return;}
var u=data.user;
isUserOwner=!!u.isOwner;
var elName=document.getElementById('uName');if(elName) elName.textContent=u.first_name||'User';
var elId=document.getElementById('uIdText');if(elId) elId.textContent='ID: '+u.id;
var rankText=u.rank ? u.rank.name : 'BASIC';
var statusText=u.isPremium ? 'VIP '+u.premiumLeftDays+'H' : 'Gratis';
var elRank=document.getElementById('uRankBadge');if(elRank) elRank.textContent=rankText;
var elStatus=document.getElementById('uStatusBadge');if(elStatus) elStatus.textContent=statusText;
var quotaText=u.dailyFixRemaining||'5/5';
var elQuota=document.getElementById('sQuota');if(elQuota) elQuota.textContent=quotaText;
var elTotal=document.getElementById('sTotalFix');if(elTotal) elTotal.textContent=u.totalFix||0;
var elPts=document.getElementById('sPoints');if(elPts) elPts.textContent=u.points||0;
var elRefs=document.getElementById('sRefs');if(elRefs) elRefs.textContent=u.referralCount||0;
var elStreak=document.getElementById('sStreak');if(elStreak) elStreak.textContent=u.checkinStreak||0;
var elPrem=document.getElementById('sPremium');if(elPrem) elPrem.textContent=u.isPremium ? u.premiumLeftDays+'H' : 'Free';
var refInput=document.getElementById('refUrlInput');if(refInput) refInput.value=u.referralLink||'';
var chkVal=document.getElementById('checkinPointsVal');if(chkVal) chkVal.textContent=(u.points||0)+' PTS';
var dailyStreak=document.getElementById('dailyStreakText');if(dailyStreak) dailyStreak.textContent=(u.checkinStreak||0)+' Hari';
var dailyBadge=document.getElementById('dailyStatusBadge');if(dailyBadge){dailyBadge.textContent=u.canCheckin ? 'Belum' : 'Sudah';}
var week=getWeekIndex();
var bonusToday=0;
if(u.checkinStreak>=0 && u.checkinStreak<7){var nextDay=u.checkinStreak;if(nextDay>=0 && nextDay<7) bonusToday=weeklyPoints[week][nextDay];}else if(u.canCheckin){bonusToday=weeklyPoints[week][0];}
var todayBonus=document.getElementById('todayBonus');if(todayBonus) todayBonus.textContent='+'+bonusToday;
var spinBtn=document.getElementById('spinBtn');if(spinBtn && !isSpinning){spinBtn.disabled=!u.canSpin;spinBtn.textContent=u.canSpin ? 'Putar Spin' : 'Sudah Spin';}
var chkBtn=document.getElementById('checkinBtn');if(chkBtn){chkBtn.disabled=!u.canCheckin;chkBtn.textContent=u.canCheckin ? 'Check-in +'+bonusToday : 'Sudah';}
for(var i=1;i<=7;i++){var el=document.getElementById('stDay'+i);if(el){if(i <= (u.checkinStreak||0)) el.classList.add('active');else el.classList.remove('active');}}
if(isUserOwner){
var ua=document.getElementById('viewUserArea');if(ua) ua.style.display='none';
var un=document.getElementById('userNavBar');if(un) un.style.display='none';
var oa=document.getElementById('viewOwnerArea');if(oa) oa.style.display='block';
var onb=document.getElementById('ownerNavBar');if(onb) onb.style.display='flex';
loadOwnerData();
}else{
var ua2=document.getElementById('viewUserArea');if(ua2) ua2.style.display='block';
var un2=document.getElementById('userNavBar');if(un2) un2.style.display='flex';
var oa2=document.getElementById('viewOwnerArea');if(oa2) oa2.style.display='none';
var onb2=document.getElementById('ownerNavBar');if(onb2) onb2.style.display='none';
}
var invBox=document.getElementById('activeInvoiceBox');
var buyBtns=document.querySelectorAll('.btn-buy-pkg');
var danaNum=document.getElementById('danaNumber');
var danaName=document.getElementById('danaName');
if(data.dana){if(danaNum) danaNum.textContent=data.dana.number||'083124469855';if(danaName) danaName.textContent=data.dana.name||'WALZY';}
if(data.currentInvoice && invBox){
var inv=data.currentInvoice;
activeInvoiceId=inv.id||inv.invoice;
buyBtns.forEach(function(b){b.disabled=true;});
var proofHtml=inv.proofImage ? '<div class="proof"><img src="'+inv.proofImage+'" onclick="openZoomModal(\\''+inv.proofImage+'\\')"></div>' : '<div style="font-size:11px;color:var(--muted);margin-top:6px">Belum upload bukti</div>';
var stText=inv.status==='waiting_approval' ? 'Verifikasi' : inv.status==='paid' ? 'Lunas' : 'Pending';
invBox.innerHTML='<div class="invoice"><div style="display:flex;justify-content:space-between;align-items:center"><div style="font-weight:800;font-size:12px">'+(inv.id||inv.invoice)+' • '+inv.days+'H • Rp '+(inv.amount||0).toLocaleString('id-ID')+'</div><span class="badge black">'+stText+'</span></div>'+proofHtml+'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px"><button class="btn btn-black" style="padding:9px;font-size:11px" onclick="triggerUploadProof()">Upload Bukti</button><button class="btn btn-ghost" style="padding:9px;font-size:11px" onclick="cancelOrder(\\''+(inv.id||inv.invoice)+'\\', this)">Batal</button></div></div>';
}else{if(invBox) invBox.innerHTML='';buyBtns.forEach(function(b){b.disabled=false;});}
var pil=document.getElementById('profileInvoiceList');
if(pil){
if(data.invoices && data.invoices.length>0){
pil.innerHTML=data.invoices.slice(-10).reverse().map(function(iv){
var st=iv.status==='paid' ? 'Lunas' : iv.status==='waiting_approval' ? 'Verifikasi' : iv.status==='pending' ? 'Pending' : iv.status;
return '<div class="invoice"><div style="display:flex;justify-content:space-between"><div style="font-weight:800;font-size:11px">'+(iv.id||iv.invoice)+' • '+(iv.days||0)+'H</div><span class="badge" style="font-size:9px">'+st+'</span></div><div style="font-size:10px;color:var(--muted);margin-top:3px">Rp '+(iv.amount||0).toLocaleString('id-ID')+' • '+new Date(iv.createdAt||Date.now()).toLocaleDateString('id-ID')+'</div>'+(iv.proofImage ? '<div class="proof" style="margin-top:6px"><img src="'+iv.proofImage+'" onclick="openZoomModal(\\''+iv.proofImage+'\\')"></div>' : '')+'</div>';
}).join('');
}else{pil.innerHTML='<div style="font-size:11px;color:var(--muted)">Belum ada invoice</div>';}
}
var lt=document.getElementById('liveText');
if(lt) lt.textContent='LIVE • '+new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
hideLoader();
}catch(e){hideLoader();}
}
async function triggerSpin(btn){
if(isSpinning) return;
if(!currentUserId) return showToast('Error','User ID tidak ada','error');
if(btn){btn.disabled=true;btn.textContent='Memutar';}
isSpinning=true;
try{
var res=await fetch('/api/api?endpoint=spin', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId})});
var data=await res.json();
if(data && data.ok){
var pIndex=data.prizeIndex!==undefined ? data.prizeIndex : Math.floor(Math.random()*wheelPrizes.length);
var anglePer=360/wheelPrizes.length;
var center=pIndex*anglePer + anglePer/2;
var target=270 - center;
while(target<0) target+=360;
var finalRotation=360*6 + target;
wheelRotation+=finalRotation;
var canvas=document.getElementById('spinCanvas');
if(canvas) canvas.style.transform='rotate('+wheelRotation+'deg)';
var sr=document.getElementById('spinResult');
if(sr) sr.textContent='Memutar ke '+wheelPrizes[pIndex].label;
setTimeout(function(){
showToast('Spin', data.message||'Hadiah', 'success');
var sr2=document.getElementById('spinResult');
if(sr2) sr2.textContent=data.message||wheelPrizes[pIndex].label;
loadUserData(false);
if(btn){btn.disabled=false;btn.textContent='Sudah Spin';}
isSpinning=false;
}, 4100);
}else{
showToast('Gagal', data ? data.message : 'Gagal', 'error');
var sr3=document.getElementById('spinResult');
if(sr3) sr3.textContent=data ? data.message : 'Gagal';
if(btn){btn.disabled=false;btn.textContent='Putar Spin';}
isSpinning=false;
}
}catch(e){
showToast('Error','Gagal spin','error');
if(btn){btn.disabled=false;btn.textContent='Putar Spin';}
isSpinning=false;
}
}
async function triggerCheckin(btn){
if(!currentUserId) return;
if(btn){btn.disabled=true;btn.textContent='Memproses';}
try{
var res=await fetch('/api/api?endpoint=checkin', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId})});
var data=await res.json();
showToast(data.ok ? 'Check-in' : 'Info', data.message, data.ok ? 'success' : 'warning');
await loadUserData(false);
}catch(e){showToast('Error','Gagal','error');}
finally{if(btn){btn.disabled=false;btn.textContent='Check-in';}}
}
async function redeemPoints(option, btn){
if(!currentUserId) return;
if(btn) btn.disabled=true;
try{
var res=await fetch('/api/api?endpoint=redeem', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, option:option})});
var data=await res.json();
showToast(data.ok ? 'Berhasil' : 'Gagal', data.message, data.ok ? 'success' : 'error');
if(data.ok) await loadUserData(false);
}catch(e){showToast('Error','Gagal','error');}
finally{if(btn) btn.disabled=false;}
}
async function createOrder(days, amount, btn){
if(!currentUserId) return showToast('Error','User ID tidak ada','error');
if(btn){btn.disabled=true;btn.textContent='Membuat';}
try{
var res=await fetch('/api/api?endpoint=create_order', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, days:days, amount:amount})});
var data=await res.json();
if(data.ok){showToast('Invoice Dibuat', 'ID: '+(data.invoice.invoice||data.invoice.id), 'success');await loadUserData(false);switchTab('viewProduk', document.querySelectorAll('#userNavBar .tab')[1]);}
else showToast('Gagal', data.message||'Gagal', 'error');
}catch(e){showToast('Error','Gagal invoice','error');}
finally{if(btn){btn.disabled=false;btn.textContent=days===30 ? 'Beli Sultan' : 'Beli';}}
}
async function cancelOrder(invoiceId, btn){
if(!currentUserId) return;
if(btn) btn.disabled=true;
try{
var res=await fetch('/api/api?endpoint=cancel_order', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, invoice:invoiceId})});
var data=await res.json();
showToast(data.ok ? 'Batal' : 'Gagal', data.message, data.ok ? 'success' : 'error');
if(data.ok) await loadUserData(false);
}catch(e){showToast('Error','Gagal','error');}
finally{if(btn) btn.disabled=false;}
}
function triggerUploadProof(){var input=document.getElementById('proofFileInput');if(input) input.click();}
async function submitProofFile(event){
var file=event.target.files && event.target.files[0];
if(!file) return;
if(!activeInvoiceId) return showToast('Error','Tidak ada invoice','error');
if(file.size>6*1024*1024) return showToast('Error','Maks 6MB','error');
var reader=new FileReader();
reader.onload=function(e){
(async function(){
try{
var base64=e.target.result;
showToast('Upload','Mengunggah','info');
var res=await fetch('/api/api?endpoint=upload_proof', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, invoice:activeInvoiceId, image_data:base64})});
var data=await res.json();
showToast(data.ok ? 'Sukses' : 'Gagal', data.message, data.ok ? 'success' : 'error');
if(data.ok) await loadUserData(false);
}catch(err){showToast('Error','Gagal upload','error');}
})();
};
reader.readAsDataURL(file);
event.target.value='';
}
async function claimVoucher(btn){
var codeEl=document.getElementById('vCodeInput');
if(!codeEl) return;
var code=codeEl.value.trim();
if(!code) return showToast('Error','Masukkan kode','warning');
if(!currentUserId) return showToast('Error','User ID tidak ada','error');
if(btn){btn.disabled=true;btn.textContent='Memproses';}
var statusEl=document.getElementById('voucherStatus');
if(statusEl) statusEl.textContent='Memproses';
try{
var res=await fetch('/api/api?endpoint=claim_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:currentUserId, code:code})});
var data=await res.json();
showToast(data.ok ? 'Sukses' : 'Gagal', data.message, data.ok ? 'success' : 'error');
if(statusEl) statusEl.textContent=data.message||'';
if(data.ok){codeEl.value='';await loadUserData(false);}
}catch(e){showToast('Error','Gagal klaim','error');if(statusEl) statusEl.textContent='Gagal klaim';}
finally{if(btn){btn.disabled=false;btn.textContent='Tukarkan';}}
}
function copyRefLink(){
var el=document.getElementById('refUrlInput');
if(!el||!el.value) return showToast('Error','Link belum ada','warning');
if(navigator.clipboard && navigator.clipboard.writeText){navigator.clipboard.writeText(el.value).then(function(){showToast('Berhasil','Link disalin','success');}).catch(function(){el.select();document.execCommand('copy');showToast('Berhasil','Link disalin','success');});}
else{el.select();document.execCommand('copy');showToast('Berhasil','Link disalin','success');}
}
async function loadOwnerData(){
try{
if(!currentUserId) return;
var res=await fetch('/api/api?endpoint=stats&user_id='+encodeURIComponent(currentUserId));
var d=await res.json();
if(d && d.ok){
var els={oRev:'Rp '+(d.revenue||0).toLocaleString('id-ID'),oUsers:d.usersValid||0,oPending:(d.pendingPayments||[]).length,oPremium:d.premium||0,oTotalFix:d.totalFix||0,oCodes:(d.codes||[]).length};
Object.keys(els).forEach(function(k){var el=document.getElementById(k);if(el) el.textContent=els[k];});
var pendingList=document.getElementById('oPendingList');
var depositList=document.getElementById('oDepositList');
var paidList=document.getElementById('oPaidList');
var pendingHtml='';
if(d.pendingPayments && d.pendingPayments.length>0){
pendingHtml=d.pendingPayments.map(function(p){
return '<div class="invoice"><div style="display:flex;justify-content:space-between"><div><div style="font-weight:800;font-size:12px">'+p.id+' • '+p.days+'H • Rp '+(p.amount||0).toLocaleString('id-ID')+'</div><div style="font-size:10px;color:var(--muted)">User: '+p.userId+'</div>'+(p.proofImage ? '<div class="proof" style="margin-top:6px"><img src="'+p.proofImage+'" onclick="openZoomModal(\\''+p.proofImage+'\\')"></div>' : '<div style="font-size:10px;color:var(--amber);margin-top:4px">Belum bukti</div>')+'</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px"><button class="btn btn-black" style="padding:8px;font-size:10px" onclick="ownerAct(\\''+p.id+'\\', \\'approve\\', this)">Setujui</button><button class="btn btn-ghost" style="padding:8px;font-size:10px" onclick="ownerAct(\\''+p.id+'\\', \\'reject\\', this)">Tolak</button></div></div>';
}).join('');
}else{pendingHtml='<div style="font-size:11px;color:var(--muted)">Tidak ada pending</div>';}
if(pendingList) pendingList.innerHTML=pendingHtml;
if(depositList) depositList.innerHTML=pendingHtml;
if(paidList){
if(d.paidPayments && d.paidPayments.length>0){
paidList.innerHTML=d.paidPayments.slice(0,10).map(function(p){return '<div class="invoice" style="padding:10px"><div style="font-weight:800;font-size:11px">'+p.id+' • '+p.userId+'</div><div style="font-size:10px;color:var(--muted)">Rp '+(p.amount||0).toLocaleString('id-ID')+' • '+p.days+'H • Lunas</div></div>';}).join('');
}else{paidList.innerHTML='<div style="font-size:11px;color:var(--muted)">Belum ada lunas</div>';}
}
var userList=document.getElementById('oUserList');
if(userList){
if(d.recentUsers && d.recentUsers.length>0){
userList.innerHTML=d.recentUsers.slice(0,30).map(function(u){
var isVip=u.premiumUntil && u.premiumUntil>Date.now();
var left=isVip ? Math.ceil((u.premiumUntil-Date.now())/86400000)+'H' : '';
return '<div class="card" style="padding:10px;margin-bottom:6px;box-shadow:none"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:800;font-size:12px">'+(u.first_name||'User')+'</div><div style="font-size:10px;color:var(--muted)">ID: '+u.id+' | Fix: '+(u.totalFix||0)+' | Poin: '+(u.points||0)+'</div></div><span class="badge '+(isVip?'black':'')+'">'+(isVip ? 'VIP '+left : 'Free')+'</span></div></div>';
}).join('');
}else{userList.innerHTML='<div style="font-size:11px;color:var(--muted)">Belum ada user</div>';}
}
var vList=document.getElementById('oVoucherList');
if(vList){
if(d.codes && d.codes.length>0){
vList.innerHTML=d.codes.map(function(c){
var quotaText=c.quota && c.quota>0 ? (c.used||0)+'/'+c.quota : (c.used||0)+'/∞';
var status=c.quota>0 && (c.used||0)>=c.quota ? 'Habis' : 'Aktif';
return '<div class="card" style="padding:10px;margin-bottom:6px;box-shadow:none"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:800;font-size:12px">'+c.code+' <span class="badge '+(status==='Aktif'?'black':'')+'" style="font-size:8px;margin-left:4px">'+status+'</span></div><div style="font-size:10px;color:var(--muted);margin-top:2px">'+c.days+' Hari | '+quotaText+'</div></div><button class="btn btn-ghost" style="width:auto;padding:6px 10px;font-size:10px" onclick="deleteVoucher(\\''+c.code+'\\', this)">Hapus</button></div></div>';
}).join('');
}else{vList.innerHTML='<div style="font-size:11px;color:var(--muted)">Belum ada voucher</div>';}
}
}
}catch(e){}
}
async function ownerAct(invoice, action, btn){
if(btn){btn.disabled=true;btn.textContent='...';}
try{
var res=await fetch('/api/api?endpoint=owner_action', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, invoice:invoice, action:action})});
var data=await res.json();
showToast(data.ok ? 'Sukses' : 'Gagal', data.message, data.ok ? 'success' : 'error');
if(data.ok){await loadOwnerData();await loadUserData(true);}
}catch(e){showToast('Error','Gagal','error');}
}
async function createVoucher(btn){
var code=document.getElementById('vGenCode').value.trim().toUpperCase();
var days=document.getElementById('vGenDays').value;
var quota=document.getElementById('vGenQuota').value;
var statusEl=document.getElementById('voucherCreateStatus');
if(!code||!days) return showToast('Error','Lengkapi','warning');
if(btn){btn.disabled=true;btn.textContent='Membuat';}
if(statusEl) statusEl.textContent='Membuat';
try{
var res=await fetch('/api/api?endpoint=create_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, code:code, days:days, quota:quota})});
var data=await res.json();
showToast(data.ok ? 'Voucher Dibuat' : 'Gagal', data.message, data.ok ? 'success' : 'error');
if(statusEl) statusEl.textContent=data.message||'';
if(data.ok){document.getElementById('vGenCode').value='';document.getElementById('vGenDays').value='';document.getElementById('vGenQuota').value='';await loadOwnerData();}
}catch(e){showToast('Error','Gagal','error');if(statusEl) statusEl.textContent='Gagal';}
finally{if(btn){btn.disabled=false;btn.textContent='Buat';}}
}
async function deleteVoucher(code, btn){
if(btn) btn.disabled=true;
try{
var res=await fetch('/api/api?endpoint=delete_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, code:code})});
var data=await res.json();
showToast(data.ok ? 'Hapus' : 'Gagal', data.message, data.ok ? 'success' : 'error');
if(data.ok) await loadOwnerData();
}catch(e){showToast('Error','Gagal','error');}
finally{if(btn) btn.disabled=false;}
}
async function sendBroadcast(btn){
var text=document.getElementById('bcTextInput').value.trim();
var statusEl=document.getElementById('broadcastStatus');
if(!text) return showToast('Error','Kosong','warning');
if(btn){btn.disabled=true;btn.textContent='Mengirim';}
if(statusEl) statusEl.textContent='Mengirim';
try{
var res=await fetch('/api/api?endpoint=broadcast', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:currentUserId, text:text})});
var data=await res.json();
if(data && data.ok){showToast('Broadcast', data.message, 'success');document.getElementById('bcTextInput').value='';if(statusEl) statusEl.textContent=data.message;await loadOwnerData();}
else{showToast('Gagal', data ? data.message : 'Gagal', 'error');if(statusEl) statusEl.textContent=data ? data.message : 'Gagal';}
}catch(e){showToast('Error','Gagal','error');if(statusEl) statusEl.textContent='Gagal';}
finally{if(btn){btn.disabled=false;btn.textContent='Kirim Broadcast';}}
}
window.addEventListener('error', function(){hideLoader();});
window.addEventListener('unhandledrejection', function(){hideLoader();});
document.addEventListener('DOMContentLoaded', function(){
initApp();
setTimeout(hideLoader, 800);
setTimeout(hideLoader, 2000);
});
window.addEventListener('load', function(){hideLoader();});
setTimeout(function(){hideLoader();}, 2800);
</script>
</body>
</html>`;
  res.send(html);
};
