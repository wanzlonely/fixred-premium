module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>WALZY CYBER HUB</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@600;800;900&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet">
<style>
:root{
  --bg-main: #0B0E14;
  --card-bg: rgba(22, 27, 34, 0.65);
  --card-border: rgba(255, 255, 255, 0.08);
  --cyan: #00F0FF;
  --blue: #3B82F6;
  --purple: #9D4EDD;
  --emerald: #10B981;
  --pink: #F43F5E;
  --amber: #F59E0B;
  --text-main: #F8FAFC;
  --text-muted: #94A3B8;
  --font-head: 'Outfit', sans-serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}
*{ box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; font-family:var(--font-body); }
body{
  background-color: var(--bg-main);
  background-image: 
    radial-gradient(circle at 10% 0%, rgba(0, 240, 255, 0.12), transparent 40%),
    radial-gradient(circle at 90% 100%, rgba(157, 78, 221, 0.12), transparent 40%);
  color: var(--text-main);
  min-height: 100vh;
  padding-bottom: 90px;
  overflow-x: hidden;
}
.icon{ width:22px; height:22px; fill:none; stroke:currentColor; stroke-width:2.2; stroke-linecap:round; stroke-linejoin:round; }
.header{
  position:sticky; top:0; z-index:40; height:70px;
  display:flex; align-items:center; justify-content:space-between; padding:0 20px;
  background: rgba(11, 14, 20, 0.85); backdrop-filter:blur(20px); border-bottom:1px solid var(--card-border);
}
.brand{ display:flex; align-items:center; gap:12px; }
.brand-logo{
  width:42px; height:42px; border-radius:14px;
  background: linear-gradient(135deg, var(--cyan), var(--purple));
  display:grid; place-items:center; color:#fff;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.3); font-family:var(--font-head); font-weight:900; font-size:22px;
}
.brand-title{ font-family:var(--font-head); font-weight:800; font-size:18px; color:#fff; letter-spacing:0.5px;}
.live-badge{
  display:flex; align-items:center; gap:6px; padding:6px 12px; border-radius:20px;
  background:rgba(16, 185, 129, 0.15); border:1px solid rgba(16, 185, 129, 0.3);
  font-size:11px; font-weight:800; color:var(--emerald); text-transform:uppercase;
}
.live-dot{ width:6px; height:6px; border-radius:50%; background:var(--emerald); animation:pulse 2s infinite; }
.container{ max-width:500px; margin:0 auto; padding:16px; position:relative; }

/* Cyber Cards */
.card{
  background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px;
  padding: 18px; margin-bottom: 14px; position: relative; overflow: hidden;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.card::before{ content:''; position:absolute; top:0; left:0; width:100%; height:2px; background:linear-gradient(90deg, var(--cyan), var(--purple)); }

.grid-3{ display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin:14px 0; }
.grid-2{ display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin:14px 0; }
.stat-box{
  background: rgba(0,0,0,0.2); border: 1px solid var(--card-border); border-radius: 16px;
  padding: 14px 12px; text-align: left;
}
.stat-val{ font-family:var(--font-head); font-weight:800; font-size:22px; color:#fff; }
.stat-label{ font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; margin-top:4px; }

/* Buttons & Inputs */
.btn{
  width:100%; padding:14px; border-radius:16px; border:none;
  font-family:var(--font-head); font-weight:800; font-size:13px; text-transform:uppercase;
  display:flex; align-items:center; justify-content:center; gap:8px; cursor:pointer;
  transition:all 0.2s; color:#fff;
}
.btn:active{ transform:scale(0.96); }
.btn:disabled{ opacity:0.5; cursor:not-allowed; }
.btn-cyan{ background:linear-gradient(135deg, var(--cyan), var(--blue)); color:#000; box-shadow:0 0 15px rgba(0,240,255,0.3); }
.btn-purple{ background:linear-gradient(135deg, var(--purple), #581C87); box-shadow:0 0 15px rgba(157,78,221,0.3); }
.btn-amber{ background:linear-gradient(135deg, var(--amber), #B45309); }
.btn-emerald{ background:linear-gradient(135deg, var(--emerald), #047857); }
.btn-pink{ background:linear-gradient(135deg, var(--pink), #BE123C); }
.btn-dark{ background:rgba(255,255,255,0.05); border:1px solid var(--card-border); color:#fff; }

.input{
  width:100%; padding:14px 16px; border-radius:16px; background:rgba(0,0,0,0.3);
  border:1px solid var(--card-border); color:#fff; font-size:13px; font-weight:600; outline:none;
  transition:border 0.3s;
}
.input:focus{ border-color:var(--cyan); box-shadow:0 0 10px rgba(0,240,255,0.2); }

/* Bottom Navigation */
.nav-bottom{
  position:fixed; bottom:16px; left:50%; transform:translateX(-50%);
  width:calc(100% - 32px); max-width:480px;
  background: rgba(11, 14, 20, 0.95); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
  border:1px solid var(--card-border); border-radius:24px;
  display:flex; justify-content:space-around; align-items:center; padding:8px 6px; z-index:90;
  box-shadow:0 20px 40px rgba(0,0,0,0.8);
}
.nav-item{
  display:flex; flex-direction:column; align-items:center; gap:4px; padding:10px 8px;
  border-radius:18px; color:var(--text-muted); cursor:pointer; flex:1; transition:all 0.3s;
}
.nav-item span{ font-family:var(--font-head); font-weight:800; font-size:10px; text-transform:uppercase; letter-spacing:0.5px; }
.nav-item.active{ color:var(--cyan); background:rgba(0,240,255,0.1); border:1px solid rgba(0,240,255,0.2); }

.view{ display:none; opacity:0; animation:fadeIn 0.3s forwards; }
.view.active{ display:block; }
@keyframes fadeIn{ from{opacity:0; transform:translateY(10px);} to{opacity:1; transform:translateY(0);} }
@keyframes pulse{ 0%,100%{opacity:1;} 50%{opacity:0.5;} }
@keyframes spin{ 100%{transform:rotate(360deg);} }

/* Spin Wheel */
.wheel-wrapper{ position:relative; width:260px; height:260px; margin:20px auto; }
.wheel-pointer{ position:absolute; top:-10px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:14px solid transparent; border-right:14px solid transparent; border-top:22px solid var(--pink); z-index:10; filter:drop-shadow(0 0 10px var(--pink)); }
.wheel-canvas{ width:100%; height:100%; border-radius:50%; border:4px solid rgba(255,255,255,0.1); box-shadow:0 0 30px rgba(0,240,255,0.2); transition:transform 4s cubic-bezier(0.1, 0.9, 0.2, 1); }

/* Badges */
.badge{ padding:4px 10px; border-radius:20px; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; border:1px solid transparent; }
.badge-cyan{ background:rgba(0,240,255,0.1); color:var(--cyan); border-color:rgba(0,240,255,0.3); }
.badge-purple{ background:rgba(157,78,221,0.1); color:var(--purple); border-color:rgba(157,78,221,0.3); }

/* Toast */
.toast{ position:fixed; top:20px; left:50%; transform:translate(-50%, -100px); background:rgba(11,14,20,0.95); border:1px solid var(--card-border); border-radius:18px; padding:14px 18px; display:flex; align-items:center; gap:12px; min-width:300px; box-shadow:0 10px 30px rgba(0,0,0,0.8); z-index:10000; transition:transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); backdrop-filter:blur(10px); }
.toast.show{ transform:translate(-50%, 0); }
.toast-icon{ display:grid; place-items:center; width:36px; height:36px; border-radius:12px; }

/* Loader */
.loader-overlay{ position:fixed; inset:0; background:var(--bg-main); z-index:9999; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; transition:opacity 0.4s; }

/* Modal */
.modal{ position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(10px); display:none; place-items:center; z-index:9000; padding:20px; }
.modal.open{ display:grid; }
.img-preview{ width:100%; border-radius:16px; border:1px solid var(--card-border); margin-top:10px; max-height:180px; object-fit:cover; cursor:pointer; }
</style>
</head>
<body>

<div class="loader-overlay" id="loader">
  <div class="brand-logo" style="width:70px; height:70px; font-size:36px; animation:pulse 1.5s infinite;">W</div>
  <div style="font-family:var(--font-head); font-weight:800; font-size:20px; color:#fff;">WALZY SYSTEM</div>
</div>

<div class="toast" id="toast">
  <div class="toast-icon" id="toastIcon"><svg class="icon" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
  <div>
    <div id="toastTitle" style="font-family:var(--font-head); font-weight:800; font-size:14px; color:#fff;">Notifikasi</div>
    <div id="toastMsg" style="font-size:11px; color:var(--text-muted); margin-top:2px; font-weight:600;">Message</div>
  </div>
</div>

<div class="modal" id="imageModal" onclick="this.classList.remove('open')">
  <img id="modalImg" src="" style="max-width:100%; max-height:80vh; border-radius:20px; border:1px solid var(--cyan); box-shadow:0 0 30px rgba(0,240,255,0.2);">
</div>

<div class="header">
  <div class="brand">
    <div class="brand-logo">W</div>
    <div class="brand-title">WALZY HUB</div>
  </div>
  <div class="live-badge"><div class="live-dot"></div> Online</div>
</div>

<div class="container" id="appContainer">
  
  <!-- ================= USER VIEWS ================= -->
  <div id="userViews">
    <!-- TAB 1: HOME -->
    <div id="vUserHome" class="view active">
      <div class="card" style="display:flex; align-items:center; gap:16px;">
        <div style="width:60px; height:60px; border-radius:16px; background:rgba(0,240,255,0.1); border:1px solid rgba(0,240,255,0.2); display:grid; place-items:center; color:var(--cyan);">
          <svg class="icon" style="width:30px; height:30px;" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div>
          <div id="uName" style="font-family:var(--font-head); font-weight:800; font-size:18px; color:#fff;">Loading...</div>
          <div id="uId" style="font-size:11px; color:var(--text-muted); font-weight:600; margin-bottom:6px;">ID: --</div>
          <div style="display:flex; gap:6px;"><span class="badge badge-cyan" id="uRank">BASIC</span> <span class="badge badge-purple" id="uStatus">GRATIS</span></div>
        </div>
      </div>
      <div class="grid-3">
        <div class="stat-box"><div class="stat-val" style="color:var(--cyan);" id="uQuota">0/5</div><div class="stat-label">Kuota Fix</div></div>
        <div class="stat-box"><div class="stat-val" style="color:var(--amber);" id="uPoints">0</div><div class="stat-label">Poin Vault</div></div>
        <div class="stat-box"><div class="stat-val" style="color:var(--emerald);" id="uRefs">0</div><div class="stat-label">Referral</div></div>
      </div>
      <div class="card">
        <div style="font-family:var(--font-head); font-weight:800; font-size:15px; margin-bottom:4px;">Wheel Keberuntungan</div>
        <div class="wheel-wrapper"><div class="wheel-pointer"></div><canvas id="spinCanvas" class="wheel-canvas" width="260" height="260"></canvas></div>
        <button class="btn btn-cyan" id="btnSpin" onclick="triggerSpin()">Putar Spin Harian</button>
      </div>
    </div>

    <!-- TAB 2: STORE -->
    <div id="vUserStore" class="view">
      <div style="font-family:var(--font-head); font-weight:900; font-size:22px; margin-bottom:6px;">VIP Access</div>
      <div style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">Beli paket VIP untuk kuota Fix Merah tanpa batas.</div>
      
      <!-- Container yang di-update via innerHTML (Aman karena tidak ada input form) -->
      <div id="userActiveInvoice"></div>

      <div class="grid-2">
        <div class="card" style="padding:16px; margin-bottom:0;">
          <div style="font-family:var(--font-head); font-weight:800; font-size:15px;">Trial 3H</div>
          <div style="font-family:var(--font-head); font-weight:800; font-size:18px; color:var(--cyan); margin:6px 0;">Rp 7.000</div>
          <button class="btn btn-cyan" style="padding:10px; font-size:11px;" onclick="createOrder(3, 7000)">Beli</button>
        </div>
        <div class="card" style="padding:16px; margin-bottom:0;">
          <div style="font-family:var(--font-head); font-weight:800; font-size:15px;">Hemat 5H</div>
          <div style="font-family:var(--font-head); font-weight:800; font-size:18px; color:var(--cyan); margin:6px 0;">Rp 10.000</div>
          <button class="btn btn-cyan" style="padding:10px; font-size:11px;" onclick="createOrder(5, 10000)">Beli</button>
        </div>
        <div class="card" style="padding:16px; margin-bottom:0;">
          <div style="font-family:var(--font-head); font-weight:800; font-size:15px;">Starter 7H</div>
          <div style="font-family:var(--font-head); font-weight:800; font-size:18px; color:var(--emerald); margin:6px 0;">Rp 15.000</div>
          <button class="btn btn-emerald" style="padding:10px; font-size:11px;" onclick="createOrder(7, 15000)">Beli</button>
        </div>
        <div class="card" style="padding:16px; margin-bottom:0;">
          <div style="font-family:var(--font-head); font-weight:800; font-size:15px;">Pro 14H</div>
          <div style="font-family:var(--font-head); font-weight:800; font-size:18px; color:var(--purple); margin:6px 0;">Rp 25.000</div>
          <button class="btn btn-purple" style="padding:10px; font-size:11px;" onclick="createOrder(14, 25000)">Beli</button>
        </div>
        <div class="card" style="grid-column:span 2; border-color:rgba(245,158,11,0.4);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-family:var(--font-head); font-weight:800; font-size:18px;">Sultan 30 Hari</div>
              <div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Unlimited + Priority Support</div>
            </div>
            <div style="font-family:var(--font-head); font-weight:800; font-size:22px; color:var(--amber);">Rp 45.000</div>
          </div>
          <button class="btn btn-amber" style="margin-top:14px;" onclick="createOrder(30, 45000)">Beli Akses Sultan</button>
        </div>
      </div>
    </div>

    <!-- TAB 3: CHECK-IN / MISSIONS -->
    <div id="vUserCheckin" class="view">
      <div style="font-family:var(--font-head); font-weight:900; font-size:22px; margin-bottom:16px;">Daily Tasks</div>
      
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div><div style="font-size:11px; color:var(--text-muted); font-weight:700;">Total Poin</div><div style="font-family:var(--font-head); font-weight:800; font-size:24px; color:var(--amber);" id="cPoints">0 PTS</div></div>
          <button class="btn btn-amber" id="btnCheckin" style="width:auto; padding:10px 20px;" onclick="triggerCheckin()">Check-in</button>
        </div>
        <div style="display:flex; gap:6px; margin-top:16px;" id="streakBox">
          <!-- Update class via JS -->
          <div class="streak-bx" id="st1" style="flex:1; background:rgba(0,0,0,0.3); border:1px solid var(--card-border); border-radius:10px; padding:8px 0; text-align:center; font-size:10px; font-weight:800; color:var(--text-muted);">H1</div>
          <div class="streak-bx" id="st2" style="flex:1; background:rgba(0,0,0,0.3); border:1px solid var(--card-border); border-radius:10px; padding:8px 0; text-align:center; font-size:10px; font-weight:800; color:var(--text-muted);">H2</div>
          <div class="streak-bx" id="st3" style="flex:1; background:rgba(0,0,0,0.3); border:1px solid var(--card-border); border-radius:10px; padding:8px 0; text-align:center; font-size:10px; font-weight:800; color:var(--text-muted);">H3</div>
          <div class="streak-bx" id="st4" style="flex:1; background:rgba(0,0,0,0.3); border:1px solid var(--card-border); border-radius:10px; padding:8px 0; text-align:center; font-size:10px; font-weight:800; color:var(--text-muted);">H4</div>
          <div class="streak-bx" id="st5" style="flex:1; background:rgba(0,0,0,0.3); border:1px solid var(--card-border); border-radius:10px; padding:8px 0; text-align:center; font-size:10px; font-weight:800; color:var(--text-muted);">H5</div>
          <div class="streak-bx" id="st6" style="flex:1; background:rgba(0,0,0,0.3); border:1px solid var(--card-border); border-radius:10px; padding:8px 0; text-align:center; font-size:10px; font-weight:800; color:var(--text-muted);">H6</div>
          <div class="streak-bx" id="st7" style="flex:1; background:rgba(0,0,0,0.3); border:1px solid var(--card-border); border-radius:10px; padding:8px 0; text-align:center; font-size:10px; font-weight:800; color:var(--text-muted);">H7</div>
        </div>
      </div>
      
      <div class="card">
        <div style="font-family:var(--font-head); font-weight:800; font-size:15px; margin-bottom:10px;">Klaim Voucher Promo</div>
        <input class="input" id="inpVoucher" placeholder="Masukkan Kode (cth: PROMO2024)">
        <button class="btn btn-emerald" style="margin-top:12px;" onclick="claimVoucher()">Tukarkan Voucher</button>
      </div>

      <div class="card">
        <div style="font-family:var(--font-head); font-weight:800; font-size:15px; margin-bottom:10px;">Tukar Poin</div>
        <div class="grid-2">
          <button class="btn btn-dark" style="font-size:11px; padding:12px;" onclick="redeemPts('quota')">100 PTS = +1 Kuota</button>
          <button class="btn btn-dark" style="font-size:11px; padding:12px;" onclick="redeemPts('spin')">150 PTS = 1x Spin</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ================= OWNER VIEWS ================= -->
  <div id="ownerViews" style="display:none;">
    <div id="vOwnerDash" class="view active">
      <div style="font-family:var(--font-head); font-weight:900; font-size:22px; margin-bottom:16px;">Executive Dash</div>
      <div class="grid-2">
        <div class="card" style="padding:14px; margin-bottom:0;"><div style="font-size:11px; color:var(--text-muted); font-weight:700;">Revenue</div><div id="oRev" style="font-family:var(--font-head); font-size:18px; font-weight:800; color:var(--emerald); margin-top:4px;">Rp 0</div></div>
        <div class="card" style="padding:14px; margin-bottom:0;"><div style="font-size:11px; color:var(--text-muted); font-weight:700;">Total Users</div><div id="oUsers" style="font-family:var(--font-head); font-size:18px; font-weight:800; color:#fff; margin-top:4px;">0</div></div>
        <div class="card" style="padding:14px; margin-bottom:0;"><div style="font-size:11px; color:var(--text-muted); font-weight:700;">VIP Users</div><div id="oVip" style="font-family:var(--font-head); font-size:18px; font-weight:800; color:var(--cyan); margin-top:4px;">0</div></div>
        <div class="card" style="padding:14px; margin-bottom:0;"><div style="font-size:11px; color:var(--text-muted); font-weight:700;">Pending Order</div><div id="oPend" style="font-family:var(--font-head); font-size:18px; font-weight:800; color:var(--amber); margin-top:4px;">0</div></div>
      </div>
    </div>

    <div id="vOwnerPay" class="view">
      <div style="font-family:var(--font-head); font-weight:900; font-size:22px; margin-bottom:16px;">Verifikasi Order</div>
      <div id="ownerPendingList"></div>
    </div>

    <div id="vOwnerVouch" class="view">
      <div style="font-family:var(--font-head); font-weight:900; font-size:22px; margin-bottom:16px;">Kelola Voucher</div>
      <div class="card">
        <input class="input" id="oVouchCode" placeholder="Kode (Misal: GRATISVIP)" style="margin-bottom:10px;">
        <div class="grid-2" style="margin-top:0; margin-bottom:10px;">
          <input class="input" id="oVouchDays" type="number" placeholder="Hari (cth: 3)">
          <input class="input" id="oVouchQuota" type="number" placeholder="Kuota (0 = ∞)">
        </div>
        <button class="btn btn-purple" onclick="createCode()">Buat Voucher</button>
      </div>
      <div style="font-family:var(--font-head); font-weight:800; font-size:16px; margin:16px 0 10px;">Voucher Aktif</div>
      <div id="ownerVouchList"></div>
    </div>

    <div id="vOwnerUser" class="view">
      <div style="font-family:var(--font-head); font-weight:900; font-size:22px; margin-bottom:16px;">Database User</div>
      <div id="ownerUserList"></div>
    </div>

    <div id="vOwnerBroad" class="view">
      <div style="font-family:var(--font-head); font-weight:900; font-size:22px; margin-bottom:16px;">Broadcast Pesan</div>
      <div class="card">
        <textarea class="input" id="oBroadText" style="min-height:120px; resize:none; margin-bottom:12px;" placeholder="Tuliskan pesan broadcast HTML..."></textarea>
        <button class="btn btn-cyan" onclick="sendBroadcast()">Kirim Massal</button>
      </div>
    </div>
  </div>

</div>

<!-- USER NAV -->
<div class="nav-bottom" id="navUser">
  <div class="nav-item active" onclick="switchTab('User', 'Home', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>Beranda</span></div>
  <div class="nav-item" onclick="switchTab('User', 'Store', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><span>Produk</span></div>
  <div class="nav-item" onclick="switchTab('User', 'Checkin', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg><span>Check-in</span></div>
</div>

<!-- OWNER NAV -->
<div class="nav-bottom" id="navOwner" style="display:none;">
  <div class="nav-item active" onclick="switchTab('Owner', 'Dash', this)"><svg class="icon" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg><span>Dash</span></div>
  <div class="nav-item" onclick="switchTab('Owner', 'Pay', this)"><svg class="icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>Orders</span></div>
  <div class="nav-item" onclick="switchTab('Owner', 'Vouch', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg><span>Voucher</span></div>
  <div class="nav-item" onclick="switchTab('Owner', 'User', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>Users</span></div>
  <div class="nav-item" onclick="switchTab('Owner', 'Broad', this)"><svg class="icon" viewBox="0 0 24 24"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg><span>Broad</span></div>
</div>

<input type="file" id="inpFile" accept="image/*" style="display:none" onchange="handleProofUpload(event)">

<script>
var tg = window.Telegram ? window.Telegram.WebApp : null;
var uid = null, ufirst = '', uuser = '';
var isOwner = false;
var toastTimer = null, pollTimer = null;
var isSpinning = false, currentRot = 0;
var activeInvoiceId = null;

// Tracking state to avoid innerHTML flickering
var lastUserHash = '', lastOwnerHash = '';

var prizes = [
  {l:"+50 PTS", c:"#9D4EDD"}, {l:"ZONK", c:"#334155"}, {l:"+25 PTS", c:"#00F0FF"},
  {l:"+100 PTS", c:"#F59E0B"}, {l:"+3 KUOTA", c:"#10B981"}, {l:"VIP 1 H", c:"#3B82F6"}
];

function init(){
  if(tg){ try{ tg.ready(); tg.expand(); tg.setHeaderColor('#0B0E14'); tg.setBackgroundColor('#0B0E14'); }catch(e){} }
  if(tg && tg.initDataUnsafe?.user?.id){
    uid = tg.initDataUnsafe.user.id;
    ufirst = tg.initDataUnsafe.user.first_name || '';
    uuser = tg.initDataUnsafe.user.username || '';
  }else{
    const sp = new URLSearchParams(window.location.search);
    uid = sp.get('user_id') || sp.get('id');
  }
  
  drawWheel();
  
  if(uid){
    fetchData(); // Initial load
    pollTimer = setInterval(fetchData, 3000);
  } else {
    document.getElementById('loader').style.opacity = '0';
    setTimeout(()=>document.getElementById('loader').style.display='none', 400);
  }
}

async function fetchData(){
  try{
    const res = await fetch(\`/api/api?endpoint=user&user_id=\${uid}&first_name=\${encodeURIComponent(ufirst)}\`);
    const d = await res.json();
    if(d?.ok){
      isOwner = d.user.isOwner;
      
      if(isOwner){
        document.getElementById('userViews').style.display = 'none';
        document.getElementById('navUser').style.display = 'none';
        document.getElementById('ownerViews').style.display = 'block';
        document.getElementById('navOwner').style.display = 'flex';
        fetchOwnerData(); // Owner polling
      }
      
      const cHash = JSON.stringify({u:d.user, i:d.currentInvoice});
      if(cHash !== lastUserHash){
        lastUserHash = cHash;
        renderUser(d.user, d.currentInvoice);
      }
    }
  }catch(e){}
  
  // Ensure loader is gone
  const ldr = document.getElementById('loader');
  if(ldr && ldr.style.display !== 'none'){
    ldr.style.opacity = '0';
    setTimeout(()=>ldr.style.display='none', 400);
  }
}

async function fetchOwnerData(){
  try{
    const res = await fetch(\`/api/api?endpoint=stats&user_id=\${uid}\`);
    const d = await res.json();
    if(d?.ok){
      const cHash = JSON.stringify(d);
      if(cHash !== lastOwnerHash){
        lastOwnerHash = cHash;
        renderOwner(d);
      }
    }
  }catch(e){}
}

function renderUser(u, inv){
  document.getElementById('uName').innerText = u.first_name;
  document.getElementById('uId').innerText = 'ID: ' + u.id;
  document.getElementById('uRank').innerText = u.rank.name;
  document.getElementById('uStatus').innerText = u.isPremium ? 'VIP ' + u.premiumLeftDays + 'H' : 'GRATIS';
  document.getElementById('uStatus').className = u.isPremium ? 'badge badge-cyan' : 'badge badge-purple';
  
  document.getElementById('uQuota').innerText = u.dailyFixRemaining;
  document.getElementById('uPoints').innerText = u.points;
  document.getElementById('cPoints').innerText = u.points + ' PTS';
  document.getElementById('uRefs').innerText = u.referralCount;
  
  const bSpin = document.getElementById('btnSpin');
  if(!isSpinning) {
    bSpin.disabled = !u.canSpin;
    bSpin.innerText = u.canSpin ? 'Putar Spin Harian' : 'Sudah Diputar Hari Ini';
  }
  
  const bChk = document.getElementById('btnCheckin');
  bChk.disabled = !u.canCheckin;
  bChk.innerText = u.canCheckin ? 'Check-in Sekarang' : 'Selesai Check-in';

  for(let i=1; i<=7; i++){
    const el = document.getElementById('st'+i);
    if(i <= u.checkinStreak){ el.style.background = 'rgba(16, 185, 129, 0.15)'; el.style.color = 'var(--emerald)'; el.style.borderColor = 'rgba(16,185,129,0.3)'; }
    else{ el.style.background = 'rgba(0,0,0,0.3)'; el.style.color = 'var(--text-muted)'; el.style.borderColor = 'var(--card-border)'; }
  }

  const invBox = document.getElementById('userActiveInvoice');
  if(inv){
    activeInvoiceId = inv.id;
    const st = inv.status==='waiting_approval' ? 'Verifikasi Admin' : 'Belum Dibayar';
    const img = inv.proofImage ? \`<img src="\${inv.proofImage}" class="img-preview" onclick="openModal('\${inv.proofImage}')">\` : \`<div style="font-size:11px; color:var(--pink); margin-top:8px;">Belum upload bukti.</div>\`;
    invBox.innerHTML = \`
      <div class="card" style="border-color:var(--amber);">
        <div style="display:flex; justify-content:space-between;">
          <div style="font-family:var(--font-head); font-weight:800; font-size:14px;">Invoice: \${inv.id}</div>
          <div class="badge" style="background:rgba(245,158,11,0.1); color:var(--amber);">\${st}</div>
        </div>
        <div style="font-size:12px; margin-top:4px; color:var(--text-muted);">\${inv.days} Hari VIP • Rp \${inv.amount.toLocaleString('id-ID')}</div>
        \${img}
        <div class="grid-2" style="margin-top:12px; margin-bottom:0;">
          <button class="btn btn-cyan" style="padding:10px; font-size:11px;" onclick="document.getElementById('inpFile').click()">Upload Bukti</button>
          <button class="btn btn-dark" style="padding:10px; font-size:11px; color:var(--pink);" onclick="cancelOrder('\${inv.id}')">Batal</button>
        </div>
      </div>\`;
  } else {
    activeInvoiceId = null;
    invBox.innerHTML = '';
  }
}

function renderOwner(d){
  document.getElementById('oRev').innerText = 'Rp ' + d.revenue.toLocaleString('id-ID');
  document.getElementById('oUsers').innerText = d.usersValid;
  document.getElementById('oVip').innerText = d.premium;
  document.getElementById('oPend').innerText = d.pendingPayments.length;
  
  const pList = document.getElementById('ownerPendingList');
  if(d.pendingPayments.length > 0){
    pList.innerHTML = d.pendingPayments.map(p => {
      const img = p.proofImage ? \`<img src="\${p.proofImage}" class="img-preview" onclick="openModal('\${p.proofImage}')">\` : \`<div style="font-size:11px; color:var(--pink); margin-top:6px;">Tanpa Bukti</div>\`;
      return \`<div class="card">
        <div style="font-family:var(--font-head); font-weight:800; font-size:14px;">\${p.id}</div>
        <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">User: \${p.userId} | \${p.days}H | Rp \${p.amount.toLocaleString('id-ID')}</div>
        \${img}
        <div class="grid-2" style="margin-top:12px; margin-bottom:0;">
          <button class="btn btn-emerald" style="padding:10px; font-size:11px;" onclick="actOrder('\${p.id}','approve')">Setujui</button>
          <button class="btn btn-pink" style="padding:10px; font-size:11px;" onclick="actOrder('\${p.id}','reject')">Tolak</button>
        </div>
      </div>\`;
    }).join('');
  } else pList.innerHTML = '<div style="font-size:12px; color:var(--text-muted);">Tidak ada transaksi pending.</div>';

  const vList = document.getElementById('ownerVouchList');
  if(d.codes.length > 0){
    vList.innerHTML = d.codes.map(c => \`<div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; margin-bottom:8px;">
      <div>
        <div style="font-family:var(--font-head); font-weight:800; font-size:14px;">\${c.code}</div>
        <div style="font-size:11px; color:var(--text-muted);">\${c.days}H | \${c.used}/\${c.quota||'∞'} Terpakai</div>
      </div>
      <button class="btn btn-dark" style="width:auto; padding:8px 14px; font-size:10px; color:var(--pink);" onclick="delCode('\${c.code}')">Hapus</button>
    </div>\`).join('');
  } else vList.innerHTML = '<div style="font-size:12px; color:var(--text-muted);">Voucher kosong.</div>';

  const uList = document.getElementById('ownerUserList');
  if(d.recentUsers.length > 0){
    uList.innerHTML = d.recentUsers.slice(0, 15).map(u => {
      const isVip = u.premiumUntil > Date.now();
      return \`<div class="card" style="display:flex; justify-content:space-between; align-items:center; padding:12px 16px; margin-bottom:8px;">
        <div>
          <div style="font-family:var(--font-head); font-weight:800; font-size:14px;">\${u.first_name}</div>
          <div style="font-size:11px; color:var(--text-muted);">ID: \${u.id} | Order: \${u.totalFix}</div>
        </div>
        <div class="badge \${isVip ? 'badge-emerald' : 'badge-purple'}">\${isVip ? 'VIP' : 'FREE'}</div>
      </div>\`;
    }).join('');
  }
}

function showToast(t, m, type){
  const el = document.getElementById('toast');
  const ic = document.getElementById('toastIcon');
  document.getElementById('toastTitle').innerText = t;
  document.getElementById('toastMsg').innerText = m;
  
  const clr = type==='error'?'var(--pink)':type==='success'?'var(--emerald)':'var(--cyan)';
  el.style.borderColor = clr;
  ic.style.background = \`rgba(\${type==='error'?'244,63,94':type==='success'?'16,185,129':'0,240,255'}, 0.1)\`;
  ic.style.color = clr;
  
  el.classList.add('show');
  if(tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred(type==='error'?'error':type==='success'?'success':'warning');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>el.classList.remove('show'), 3000);
}

function switchTab(role, tab, btn){
  document.querySelectorAll(\`#\${role.toLowerCase()}Views .view\`).forEach(v=>v.classList.remove('active'));
  document.getElementById(\`v\${role}\${tab}\`).classList.add('active');
  document.querySelectorAll(\`#nav\${role} .nav-item\`).forEach(n=>n.classList.remove('active'));
  btn.classList.add('active');
  if(tg && tg.HapticFeedback) tg.HapticFeedback.selectionChanged();
  window.scrollTo(0,0);
}

function drawWheel(){
  const cv = document.getElementById('spinCanvas');
  if(!cv) return;
  const ctx = cv.getContext('2d');
  const cx = cv.width/2, cy = cv.height/2, r = cx - 6, sl = prizes.length, ang = (Math.PI*2)/sl;
  ctx.clearRect(0,0,cv.width,cv.height);
  for(let i=0; i<sl; i++){
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r, i*ang, (i+1)*ang); ctx.closePath();
    ctx.fillStyle = prizes[i].c; ctx.fill(); ctx.lineWidth=2; ctx.strokeStyle='rgba(0,0,0,0.5)'; ctx.stroke();
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(i*ang + ang/2);
    ctx.textAlign='right'; ctx.fillStyle='#fff'; ctx.font='800 12px Outfit';
    ctx.fillText(prizes[i].l, r-14, 4); ctx.restore();
  }
  ctx.beginPath(); ctx.arc(cx,cy,30,0,Math.PI*2); ctx.fillStyle='#0B0E14'; ctx.fill();
  ctx.lineWidth=2; ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.stroke();
  ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.font='900 12px Outfit'; ctx.fillText('SPIN', cx, cy+4);
}

async function triggerSpin(){
  if(isSpinning || !uid) return;
  isSpinning = true;
  document.getElementById('btnSpin').disabled = true;
  try{
    const res = await fetch('/api/api?endpoint=spin', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:uid})});
    const d = await res.json();
    if(d.ok){
      const i = d.prizeIndex;
      const ang = 360/prizes.length;
      const target = 360*5 + (360 - (i*ang + ang/2));
      currentRot += target;
      document.getElementById('spinCanvas').style.transform = \`rotate(\${currentRot}deg)\`;
      setTimeout(()=>{
        showToast('Berhasil', d.message, 'success');
        isSpinning = false;
        fetchData(); // Trigger immediate update
      }, 4000);
    }else{
      showToast('Gagal', d.message, 'error');
      isSpinning = false; fetchData();
    }
  }catch(e){ showToast('Error', 'Gagal memutar spin', 'error'); isSpinning = false; }
}

async function triggerCheckin(){
  if(!uid) return;
  try{
    const res = await fetch('/api/api?endpoint=checkin', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:uid})});
    const d = await res.json();
    showToast(d.ok?'Sukses':'Gagal', d.message, d.ok?'success':'error');
    if(d.ok) fetchData();
  }catch(e){}
}

async function redeemPts(opt){
  try{
    const res = await fetch('/api/api?endpoint=redeem', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:uid, option:opt})});
    const d = await res.json();
    showToast(d.ok?'Sukses':'Gagal', d.message, d.ok?'success':'error');
    if(d.ok) fetchData();
  }catch(e){}
}

async function claimVoucher(){
  const code = document.getElementById('inpVoucher').value.trim();
  if(!code) return showToast('Error','Masukkan kode voucher!','error');
  try{
    const res = await fetch('/api/api?endpoint=claim_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:uid, code:code})});
    const d = await res.json();
    showToast(d.ok?'Sukses':'Gagal', d.message, d.ok?'success':'error');
    if(d.ok){ document.getElementById('inpVoucher').value = ''; fetchData(); }
  }catch(e){}
}

async function createOrder(d, a){
  try{
    const res = await fetch('/api/api?endpoint=create_order', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:uid, days:d, amount:a})});
    const data = await res.json();
    showToast(data.ok?'Dibuat':'Gagal', data.message, data.ok?'success':'error');
    if(data.ok) fetchData();
  }catch(e){}
}

async function cancelOrder(inv){
  try{
    const res = await fetch('/api/api?endpoint=cancel_order', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:uid, invoice:inv})});
    const d = await res.json();
    showToast(d.ok?'Batal':'Gagal', d.message, d.ok?'success':'error');
    if(d.ok) fetchData();
  }catch(e){}
}

function handleProofUpload(e){
  const file = e.target.files[0];
  if(!file || !activeInvoiceId) return;
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try{
      showToast('Uploading...', 'Mengunggah bukti transfer', 'info');
      const res = await fetch('/api/api?endpoint=upload_proof', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:uid, invoice:activeInvoiceId, image_data:ev.target.result})});
      const d = await res.json();
      showToast(d.ok?'Sukses':'Gagal', d.message, d.ok?'success':'error');
      if(d.ok) fetchData();
    }catch(err){}
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function openModal(src){
  document.getElementById('modalImg').src = src;
  document.getElementById('imageModal').classList.add('open');
}

// ================= OWNER ACTIONS =================
async function actOrder(inv, act){
  try{
    const res = await fetch('/api/api?endpoint=owner_action', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:uid, invoice:inv, action:act})});
    const d = await res.json();
    showToast(d.ok?'Sukses':'Gagal', d.message, d.ok?'success':'error');
    if(d.ok) fetchOwnerData();
  }catch(e){}
}

async function createCode(){
  const c = document.getElementById('oVouchCode').value.trim();
  const d = document.getElementById('oVouchDays').value;
  const q = document.getElementById('oVouchQuota').value;
  if(!c || !d) return showToast('Error','Isi kode dan durasi!','error');
  try{
    const res = await fetch('/api/api?endpoint=create_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:uid, code:c, days:d, quota:q})});
    const data = await res.json();
    showToast(data.ok?'Sukses':'Gagal', data.message, data.ok?'success':'error');
    if(data.ok){ document.getElementById('oVouchCode').value=''; fetchOwnerData(); }
  }catch(e){}
}

async function delCode(c){
  try{
    const res = await fetch('/api/api?endpoint=delete_code', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:uid, code:c})});
    const d = await res.json();
    showToast(d.ok?'Dihapus':'Gagal', d.message, d.ok?'success':'error');
    if(d.ok) fetchOwnerData();
  }catch(e){}
}

async function sendBroadcast(){
  const t = document.getElementById('oBroadText').value.trim();
  if(!t) return showToast('Error','Pesan kosong!','error');
  showToast('Proses','Mengirim broadcast...','info');
  try{
    const res = await fetch('/api/api?endpoint=broadcast', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({owner_id:uid, text:t})});
    const d = await res.json();
    showToast(d.ok?'Selesai':'Gagal', d.message, d.ok?'success':'error');
    if(d.ok){ document.getElementById('oBroadText').value=''; fetchOwnerData(); }
  }catch(e){}
}

window.onload = init;
</script>
</body>
</html>`;
  res.send(htmlContent);
};
