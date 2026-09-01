module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>WALZY EXECUTIVE STORE</title>
<script src="https://telegram.org/js/telegram-web-app.js" defer></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --bg-main: #05070f;
    --bg-card: rgba(15, 23, 42, 0.75);
    --border-card: rgba(255, 255, 255, 0.08);
    --accent-blue: #3b82f6;
    --accent-purple: #8b5cf6;
    --accent-emerald: #10b981;
    --accent-amber: #f59e0b;
    --accent-rose: #f43f5e;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }

  body {
    background: var(--bg-main);
    background-image: 
      radial-gradient(circle at 10% 0%, rgba(59, 130, 246, 0.18) 0%, transparent 45%),
      radial-gradient(circle at 90% 90%, rgba(139, 92, 246, 0.15) 0%, transparent 45%);
    color: var(--text-primary);
    min-height: 100vh;
    padding-bottom: 100px;
    overflow-x: hidden;
  }

  .icon-svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: all 0.3s ease; }
  .pulse { animation: pulseAnim 2s infinite; }
  .float { animation: floatAnim 3s ease-in-out infinite; }
  .spin-slow { animation: spinAnim 8s linear infinite; }
  .glow-box { box-shadow: 0 0 30px rgba(59, 130, 246, 0.2); }

  @keyframes pulseAnim { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.95); } }
  @keyframes floatAnim { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes spinAnim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(5, 7, 15, 0.85);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border-card);
    height: 64px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px;
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-icon {
    width: 40px; height: 40px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
    display: grid; place-items: center; color: #fff; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
  }
  .brand-title { font-weight: 800; font-size: 17px; letter-spacing: -0.4px; background: linear-gradient(90deg, #fff, var(--text-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  .container { max-width: 520px; margin: 0 auto; padding: 18px; }
  .glass-card {
    background: var(--bg-card);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border-card);
    border-radius: 22px; padding: 20px; margin-bottom: 16px;
    position: relative; overflow: hidden;
  }
  .glass-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  }

  .user-badge {
    display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px;
    font-size: 11px; font-weight: 800; background: rgba(59, 130, 246, 0.15); color: var(--accent-blue);
    border: 1px solid rgba(59, 130, 246, 0.3); text-transform: uppercase; letter-spacing: 0.5px;
  }

  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }

  .stat-card {
    background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 18px; padding: 16px;
    display: flex; flex-direction: column; gap: 4px; position: relative; backdrop-filter: blur(12px);
  }
  .stat-val { font-size: 22px; font-weight: 800; color: #fff; }
  .stat-lbl { font-size: 11px; color: var(--text-secondary); font-weight: 600; }

  .btn-custom {
    width: 100%; padding: 15px; border-radius: 16px; border: none; font-weight: 800; font-size: 14px;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.25s ease; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
    color: #fff; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.35); letter-spacing: 0.2px;
  }
  .btn-custom:active { transform: scale(0.97); }
  .btn-custom:disabled { opacity: 0.55; cursor: not-allowed; filter: grayscale(0.5); }

  .input-custom {
    width: 100%; padding: 15px; border-radius: 16px; background: rgba(255,255,255,0.04);
    border: 1px solid var(--border-card); color: #fff; outline: none; font-size: 13px; font-weight: 600;
    transition: all 0.3s ease;
  }
  .input-custom:focus { border-color: var(--accent-blue); box-shadow: 0 0 16px rgba(59,130,246,0.3); background: rgba(255,255,255,0.07); }

  .nav-bar {
    position: fixed; bottom: 18px; left: 50%; transform: translateX(-50%);
    width: calc(100% - 32px); max-width: 480px; background: rgba(10, 15, 30, 0.92);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid var(--border-card); border-radius: 26px;
    display: flex; justify-content: space-around; padding: 8px; z-index: 80;
    box-shadow: 0 16px 40px rgba(0,0,0,0.6);
  }
  .nav-tab {
    display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 8px;
    border-radius: 18px; color: var(--text-secondary); text-decoration: none; font-size: 10px; font-weight: 800;
    cursor: pointer; transition: all 0.3s ease; flex: 1; text-align: center; letter-spacing: 0.3px;
  }
  .nav-tab.active { color: #fff; background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(139, 92, 246, 0.25)); border: 1px solid rgba(59,130,246,0.4); }

  .view { display: none; opacity: 0; transform: translateY(12px); transition: all 0.3s ease; }
  .view.active { display: block; opacity: 1; transform: translateY(0); }

  .toast {
    position: fixed; top: 22px; left: 50%; transform: translateX(-50%) translateY(-120px) scale(0.9);
    width: calc(100% - 32px); max-width: 440px;
    background: rgba(10, 15, 30, 0.95); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--accent-blue); border-radius: 20px; padding: 16px 20px; z-index: 999;
    display: flex; align-items: center; gap: 14px;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 24px rgba(59, 130, 246, 0.2);
    overflow: hidden; opacity: 0; pointer-events: none;
  }
  .toast.show { transform: translateX(-50%) translateY(0) scale(1); opacity: 1; pointer-events: auto; }
  .toast-progress { position: absolute; bottom: 0; left: 0; height: 3px; background: var(--accent-blue); width: 100%; transition: width 3.5s linear; }

  .streak-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin: 16px 0; }
  .streak-day {
    background: rgba(255,255,255,0.04); border: 1px solid var(--border-card); border-radius: 14px;
    padding: 12px 2px; text-align: center; font-size: 10px; font-weight: 800; display: flex; flex-direction: column; gap: 4px; align-items: center;
    transition: all 0.3s ease;
  }
  .streak-day.active { background: rgba(16, 185, 129, 0.22); border-color: var(--accent-emerald); color: var(--accent-emerald); box-shadow: 0 0 12px rgba(16, 185, 129, 0.3); }

  .product-shop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
  .shop-item {
    background: rgba(255,255,255,0.03); border: 1px solid var(--border-card); border-radius: 20px; padding: 16px;
    display: flex; flex-direction: column; justify-content: space-between; gap: 12px; position: relative; overflow: hidden;
    backdrop-filter: blur(12px);
  }

  .wheel-container {
    position: relative; width: 270px; height: 270px; margin: 12px auto; display: flex; justify-content: center; align-items: center;
  }
  .wheel-pointer {
    position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
    width: 0; height: 0; border-left: 15px solid transparent; border-right: 15px solid transparent;
    border-top: 26px solid var(--accent-rose); z-index: 20; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.6));
  }
  #spinCanvas { width: 270px; height: 270px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.12); box-shadow: 0 0 25px rgba(59,130,246,0.35); transition: transform 4s cubic-bezier(0.15, 0.9, 0.2, 1); }

  .loader-screen {
    position: fixed; inset: 0; background: var(--bg-main); z-index: 99;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px;
    transition: opacity 0.4s ease;
  }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.88); backdrop-filter: blur(16px);
    z-index: 900; display: none; place-items: center; padding: 18px;
  }
  .modal-overlay.active { display: grid; }

  .proof-preview-container {
    position: relative; border-radius: 16px; overflow: hidden; margin-top: 10px; border: 1px solid var(--border-card);
  }
  .proof-preview-img { width: 100%; max-height: 190px; object-fit: cover; cursor: pointer; display: block; }
  .zoom-btn-overlay {
    position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.75); backdrop-filter: blur(10px);
    color: #fff; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: 800; display: flex; align-items: center; gap: 6px; cursor: pointer;
  }
</style>
</head>
<body>

<div class="loader-screen" id="loader">
  <div class="brand-icon float" style="width:68px;height:68px;border-radius:22px;">
    <svg class="icon-svg spin-slow" style="width:36px;height:36px" viewBox="0 0 24 24"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
  </div>
  <div style="font-weight:800;font-size:20px;letter-spacing:1.2px">WALZY EXECUTIVE STORE</div>
  <div style="font-size:12px;color:var(--text-secondary);font-weight:600" id="loadText">Menghubungkan ke server realtime...</div>
</div>

<div class="toast" id="toast">
  <div id="toastIcon" style="color:var(--accent-blue);display:grid;place-items:center;width:34px;height:34px;border-radius:12px;background:rgba(255,255,255,0.06)">
    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  </div>
  <div>
    <div id="toastTitle" style="font-weight:800;font-size:14px;letter-spacing:-0.2px">Notifikasi</div>
    <div id="toastMsg" style="font-size:12px;color:var(--text-secondary);margin-top:2px;font-weight:600">Pesan deskripsi</div>
  </div>
  <div class="toast-progress" id="toastProgress"></div>
</div>

<div class="modal-overlay" id="imageZoomModal" onclick="closeZoomModal()">
  <div style="position:relative;max-width:95vw;max-height:90vh;display:flex;flex-direction:column;align-items:center;gap:14px" onclick="event.stopPropagation()">
    <img id="zoomedImageSrc" src="" style="max-width:100%;max-height:80vh;object-fit:contain;border-radius:20px;box-shadow:0 16px 50px rgba(0,0,0,0.9);border:1px solid var(--border-card)">
    <button class="btn-custom" style="width:auto;padding:12px 28px;background:rgba(255,255,255,0.15)" onclick="closeZoomModal()">Tutup Gambar</button>
  </div>
</div>

<div class="header">
  <div class="brand">
    <div class="brand-icon">
      <svg class="icon-svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    </div>
    <div class="brand-title">WALZY STORE</div>
  </div>
  <div class="user-badge" id="liveBadge">
    <span style="width:7px;height:7px;border-radius:50%;background:var(--accent-emerald)" class="pulse"></span> REALTIME ACTIVE
  </div>
</div>

<div class="container">

  <div id="viewUserArea">
    <div id="viewHome" class="view active">
      <div class="glass-card glow-box">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">
          <div style="width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2));display:grid;place-items:center;color:var(--accent-blue);border:1px solid rgba(255,255,255,0.1)">
            <svg class="icon-svg float" style="width:30px;height:30px" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <div id="uName" style="font-weight:800;font-size:17px">User Walzy</div>
            <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;font-weight:600" id="uIdText">ID: --</div>
            <div style="display:flex;gap:6px;margin-top:8px">
              <span class="user-badge" id="uRankBadge">BASIC</span>
              <span class="user-badge" id="uStatusBadge" style="color:var(--accent-purple);border-color:rgba(139,92,246,0.3)">Gratis</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid3">
        <div class="stat-card">
          <div class="stat-val" id="sOrders">0</div>
          <div class="stat-lbl">Total Order</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" id="sRefs">0</div>
          <div class="stat-lbl">Referral</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color:var(--accent-amber)" id="sPoints">0</div>
          <div class="stat-lbl">Poin Store</div>
        </div>
      </div>

      <div class="glass-card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="font-weight:800;font-size:15px;display:flex;align-items:center;gap:8px">
            <svg class="icon-svg spin-slow" style="color:var(--accent-amber)" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Spin Wheel Keberuntungan
          </div>
        </div>

        <div class="wheel-container">
          <div class="wheel-pointer"></div>
          <canvas id="spinCanvas" width="300" height="300"></canvas>
        </div>

        <button class="btn-custom" id="spinBtn" style="margin-top:14px" onclick="triggerSpin(this)">
          Putar Spin Harian
        </button>
      </div>

      <div class="glass-card">
        <div style="font-weight:800;font-size:15px;margin-bottom:12px;display:flex;align-items:center;gap:8px">
          <svg class="icon-svg" style="color:var(--accent-emerald)" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Redeem Kode Voucher
        </div>
        <input class="input-custom" id="vCodeInput" placeholder="Masukkan Kode Voucher Promo">
        <button class="btn-custom" style="margin-top:12px;background:linear-gradient(135deg, var(--accent-emerald), #059669)" onclick="claimVoucher(this)">
          Tukarkan Kode
        </button>
      </div>

      <div class="glass-card">
        <div style="font-weight:800;font-size:15px;margin-bottom:8px;display:flex;align-items:center;gap:8px">
          <svg class="icon-svg" style="color:var(--accent-purple)" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Program Referral Undangan
        </div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:12px;font-weight:600">Dapatkan +50 Poin setiap kali ada user baru mendaftar menggunakan link Anda.</div>
        <input class="input-custom" id="refUrlInput" readonly value="Memuat link...">
        <button class="btn-custom" style="margin-top:12px" onclick="copyRefLink()">
          Salin Link Referral
        </button>
      </div>
    </div>

    <div id="viewOrder" class="view">
      <div style="font-weight:800;font-size:19px;margin-bottom:4px">Katalog VIP Store</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:16px;font-weight:600">Pilih paket langganan VIP dan nikmati akses penuh tanpa batas!</div>

      <div id="activeInvoiceBox"></div>

      <div class="product-shop-grid">
        <div class="shop-item">
          <div>
            <div style="font-weight:800;font-size:15px">VIP Trial</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;font-weight:600">Akses Full 3 Hari</div>
          </div>
          <div style="font-weight:800;font-size:17px;color:var(--accent-blue);margin-top:6px">Rp 7.000</div>
          <button class="btn-custom btn-buy-pkg" style="padding:11px;font-size:12px" onclick="createOrder(3, 7000, this)">Beli VIP 3H</button>
        </div>

        <div class="shop-item">
          <div>
            <div style="font-weight:800;font-size:15px">VIP Hemat</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;font-weight:600">Akses Full 5 Hari</div>
          </div>
          <div style="font-weight:800;font-size:17px;color:var(--accent-blue);margin-top:6px">Rp 10.000</div>
          <button class="btn-custom btn-buy-pkg" style="padding:11px;font-size:12px" onclick="createOrder(5, 10000, this)">Beli VIP 5H</button>
        </div>

        <div class="shop-item">
          <div>
            <div style="font-weight:800;font-size:15px">VIP Starter</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;font-weight:600">7 Hari Popular</div>
          </div>
          <div style="font-weight:800;font-size:17px;color:var(--accent-emerald);margin-top:6px">Rp 15.000</div>
          <button class="btn-custom btn-buy-pkg" style="padding:11px;font-size:12px;background:linear-gradient(135deg, var(--accent-emerald), #059669)" onclick="createOrder(7, 15000, this)">Beli VIP 7H</button>
        </div>

        <div class="shop-item">
          <div>
            <div style="font-weight:800;font-size:15px">VIP Pro</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;font-weight:600">14 Hari Best Value</div>
          </div>
          <div style="font-weight:800;font-size:17px;color:var(--accent-purple);margin-top:6px">Rp 25.000</div>
          <button class="btn-custom btn-buy-pkg" style="padding:11px;font-size:12px;background:linear-gradient(135deg, var(--accent-purple), #7c3aed)" onclick="createOrder(14, 25000, this)">Beli VIP 14H</button>
        </div>

        <div class="shop-item" style="grid-column: span 2;border-color:rgba(245, 158, 11, 0.4)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:800;font-size:16px">VIP Sultan 30 Hari</div>
              <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;font-weight:600">Priority Support & Full Unlimited</div>
            </div>
            <div style="font-weight:800;font-size:19px;color:var(--accent-amber)">Rp 45.000</div>
          </div>
          <button class="btn-custom btn-buy-pkg" style="margin-top:12px;padding:13px;font-size:13px;background:linear-gradient(135deg, var(--accent-amber), #d97706)" onclick="createOrder(30, 45000, this)">Beli VIP 30 Hari Sultan</button>
        </div>
      </div>
    </div>

    <div id="viewCheckin" class="view">
      <div style="font-weight:800;font-size:19px;margin-bottom:4px">Daily Check-in Poin</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:16px;font-weight:600">Check-in harian untuk mendapatkan poin bertingkat setiap minggunya!</div>

      <div class="glass-card glow-box">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:12px;color:var(--text-secondary);font-weight:600">Poin Anda saat ini</div>
            <div style="font-size:26px;font-weight:800;color:var(--accent-amber)" id="checkinPointsVal">0 PTS</div>
          </div>
          <button class="btn-custom" id="checkinBtn" style="width:auto;padding:12px 22px" onclick="triggerCheckin(this)">
            Check-in Hari Ini
          </button>
        </div>

        <div class="streak-grid">
          <div class="streak-day" id="stDay1"><span>H1</span><b>+30</b></div>
          <div class="streak-day" id="stDay2"><span>H2</span><b>+50</b></div>
          <div class="streak-day" id="stDay3"><span>H3</span><b>+75</b></div>
          <div class="streak-day" id="stDay4"><span>H4</span><b>+100</b></div>
          <div class="streak-day" id="stDay5"><span>H5</span><b>+150</b></div>
          <div class="streak-day" id="stDay6"><span>H6</span><b>+200</b></div>
          <div class="streak-day" id="stDay7"><span>H7</span><b>+350</b></div>
        </div>
      </div>

      <div style="font-weight:800;font-size:17px;margin:20px 0 12px">Point Shop - Tukar Poin Jadi VIP</div>

      <div class="product-shop-grid">
        <div class="shop-item">
          <div>
            <div style="font-weight:800;font-size:14px">1 Hari VIP</div>
            <div style="font-size:12px;color:var(--accent-amber);margin-top:2px;font-weight:700">100 PTS</div>
          </div>
          <button class="btn-custom" style="padding:9px;font-size:12px" onclick="redeemPoints(1, this)">Tukarkan</button>
        </div>

        <div class="shop-item">
          <div>
            <div style="font-weight:800;font-size:14px">3 Hari VIP</div>
            <div style="font-size:12px;color:var(--accent-amber);margin-top:2px;font-weight:700">250 PTS</div>
          </div>
          <button class="btn-custom" style="padding:9px;font-size:12px" onclick="redeemPoints(2, this)">Tukarkan</button>
        </div>

        <div class="shop-item">
          <div>
            <div style="font-weight:800;font-size:14px">7 Hari VIP</div>
            <div style="font-size:12px;color:var(--accent-amber);margin-top:2px;font-weight:700">500 PTS</div>
          </div>
          <button class="btn-custom" style="padding:9px;font-size:12px;background:linear-gradient(135deg, var(--accent-emerald), #059669)" onclick="redeemPoints(3, this)">Tukarkan</button>
        </div>

        <div class="shop-item">
          <div>
            <div style="font-weight:800;font-size:14px">14 Hari VIP</div>
            <div style="font-size:12px;color:var(--accent-amber);margin-top:2px;font-weight:700">900 PTS</div>
          </div>
          <button class="btn-custom" style="padding:9px;font-size:12px;background:linear-gradient(135deg, var(--accent-purple), #7c3aed)" onclick="redeemPoints(4, this)">Tukarkan</button>
        </div>

        <div class="shop-item" style="grid-column: span 2">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:800;font-size:15px">30 Hari VIP Sultan</div>
              <div style="font-size:12px;color:var(--accent-amber);margin-top:2px;font-weight:700">1.600 PTS</div>
            </div>
            <button class="btn-custom" style="width:auto;padding:9px 22px;font-size:12px;background:linear-gradient(135deg, var(--accent-amber), #d97706)" onclick="redeemPoints(5, this)">Tukarkan</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="viewOwnerArea" style="display:none">
    <div id="oTabOrders" class="view active">
      <div style="font-weight:800;font-size:19px;margin-bottom:4px">Katalog Order Pembayaran</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:16px;font-weight:600">Daftar transaksi pending & foto bukti pembayaran terkirim.</div>
      <div id="oPendingList"></div>
    </div>

    <div id="oTabUsers" class="view">
      <div style="font-weight:800;font-size:19px;margin-bottom:4px">Kelola User Valid</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:16px;font-weight:600">Daftar pengguna terverifikasi.</div>
      <div id="oUserList"></div>
    </div>

    <div id="oTabVouchers" class="view">
      <div class="glass-card">
        <div style="font-weight:800;font-size:15px;margin-bottom:12px">Generator Voucher Promo</div>
        <input class="input-custom" id="vGenCode" placeholder="Kode Voucher (cth: SULTAN100)" style="margin-bottom:10px">
        <div class="grid2" style="margin-bottom:10px">
          <input class="input-custom" id="vGenDays" type="number" placeholder="Durasi (Hari)">
          <input class="input-custom" id="vGenQuota" type="number" placeholder="Kuota (0 = ∞)">
        </div>
        <button class="btn-custom" onclick="createVoucher(this)">Buat Voucher</button>
      </div>
      <div style="font-weight:800;font-size:15px;margin:14px 0 10px">Voucher Aktif</div>
      <div id="oVoucherList"></div>
    </div>

    <div id="oTabBroadcast" class="view">
      <div class="glass-card">
        <div style="font-weight:800;font-size:15px;margin-bottom:10px">Kirim Broadcast Pesan Massal</div>
        <textarea class="input-custom" id="bcTextInput" style="height:130px;resize:none;margin-bottom:12px" placeholder="Tuliskan pesan HTML broadcast massal..."></textarea>
        <button class="btn-custom" id="btnSendBc" onclick="sendBroadcast(this)">
          Kirim Broadcast Sekarang
        </button>
      </div>
    </div>

    <div id="oTabAnalytics" class="view">
      <div style="font-weight:800;font-size:19px;margin-bottom:14px">Analitik Pendapatan Studio</div>
      <div class="grid2">
        <div class="stat-card">
          <div class="stat-val" id="oRev">Rp 0</div>
          <div class="stat-lbl">Total Revenue</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" id="oUsers">0</div>
          <div class="stat-lbl">Total User Valid</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" id="oVip">0</div>
          <div class="stat-lbl">Pengguna VIP</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" id="oFix">0</div>
          <div class="stat-lbl">Total Pesanan</div>
        </div>
      </div>
    </div>
  </div>

</div>

<div class="nav-bar" id="userNavBar">
  <div class="nav-tab active" onclick="switchTab('Home', event)">
    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    Home
  </div>
  <div class="nav-tab" onclick="switchTab('Order', event)">
    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    Order VIP
  </div>
  <div class="nav-tab" onclick="switchTab('Checkin', event)">
    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
    Check-in
  </div>
</div>

<div class="nav-bar" id="ownerNavBar" style="display:none">
  <div class="nav-tab active" onclick="switchOwnerTab('Orders', event)">
    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
    Katalog
  </div>
  <div class="nav-tab" onclick="switchOwnerTab('Users', event)">
    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    User
  </div>
  <div class="nav-tab" onclick="switchOwnerTab('Vouchers', event)">
    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
    Voucher
  </div>
  <div class="nav-tab" onclick="switchOwnerTab('Broadcast', event)">
    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    Broadcast
  </div>
  <div class="nav-tab" onclick="switchOwnerTab('Analytics', event)">
    <svg class="icon-svg" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    Analitik
  </div>
</div>

<input type="file" id="proofFileInput" accept="image/*" style="display:none" onchange="submitProofFile(event)">

<script>
  var tg = null;
  var currentUserId = null;
  var currentFirstName = '';
  var currentUsername = '';
  var activeInvoiceId = null;
  var isUserOwner = false;
  var toastTimeout = null;
  var isSpinning = false;
  var currentWheelRotation = 0;
  var pollingTimer = null;

  var wheelPrizes = [
    { label: "ZONK ❌", color: "#f43f5e" },
    { label: "+30 PTS 🪙", color: "#3b82f6" },
    { label: "+50 PTS 🪙", color: "#8b5cf6" },
    { label: "+100 PTS 🪙", color: "#f59e0b" },
    { label: "+3 KUOTA ⚡", color: "#10b981" },
    { label: "VIP 1 HARI 💎", color: "#06b6d4" }
  ];

  function hideLoader() {
    var ldr = document.getElementById('loader');
    if (ldr) {
      ldr.style.opacity = '0';
      setTimeout(function() { ldr.style.display = 'none'; }, 400);
    }
  }

  function drawWheel() {
    var canvas = document.getElementById('spinCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var numSlices = wheelPrizes.length;
    var sliceAngle = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var cx = canvas.width / 2;
    var cy = canvas.height / 2;
    var radius = cx - 10;

    for (var i = 0; i < numSlices; i++) {
      var angle = i * sliceAngle;
      ctx.beginPath();
      ctx.fillStyle = wheelPrizes[i].color;
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + sliceAngle);
      ctx.lineTo(cx, cy);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(wheelPrizes[i].label, radius - 15, 4);
      ctx.restore();
    }
  }

  var appInitialized = false;
  function initApp() {
    if (appInitialized) return;
    appInitialized = true;
    setTimeout(hideLoader, 1200);

    try {
      tg = window.Telegram ? window.Telegram.WebApp : null;
      if (tg) { tg.ready(); tg.expand(); }

      if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        currentUserId = tg.initDataUnsafe.user.id;
        currentFirstName = tg.initDataUnsafe.user.first_name || '';
        currentUsername = tg.initDataUnsafe.user.username || '';
      } else {
        var sp = new URLSearchParams(window.location.search);
        currentUserId = sp.get('user_id') || sp.get('userId');
        currentFirstName = sp.get('first_name') || '';
        currentUsername = sp.get('username') || '';
      }

      drawWheel();

      if (!currentUserId) {
        document.getElementById('loadText').textContent = 'Silakan buka WebApp melalui Telegram Bot!';
        hideLoader();
        return;
      }

      loadUserData();

      if (!pollingTimer) {
        pollingTimer = setInterval(function() {
          loadUserData(true);
        }, 3000);
      }
    } catch (err) {
      hideLoader();
    }
  }

  async function loadUserData(isSilent) {
    try {
      var queryUrl = '/api/api?endpoint=user&user_id=' + currentUserId;
      if (currentFirstName) queryUrl += '&first_name=' + encodeURIComponent(currentFirstName);
      if (currentUsername) queryUrl += '&username=' + encodeURIComponent(currentUsername);

      var res = await fetch(queryUrl);
      var data = await res.json();

      if (data.ok) {
        var u = data.user;
        isUserOwner = u.isOwner;

        document.getElementById('uName').textContent = u.first_name || 'User Walzy';
        document.getElementById('uIdText').textContent = 'ID: ' + u.id;
        document.getElementById('uRankBadge').textContent = u.rank ? u.rank.name : 'BASIC';
        document.getElementById('uStatusBadge').textContent = u.isPremium ? 'VIP (' + u.premiumLeftDays + 'H)' : 'Gratis (' + u.dailyFixRemaining + '/3)';
        document.getElementById('sOrders').textContent = u.totalFix || 0;
        document.getElementById('sRefs').textContent = u.referralCount || 0;
        document.getElementById('sPoints').textContent = u.points || 0;
        document.getElementById('checkinPointsVal').textContent = (u.points || 0) + ' PTS';
        document.getElementById('refUrlInput').value = u.referralLink || '';

        var spinBtn = document.getElementById('spinBtn');
        if (spinBtn && !isSpinning) spinBtn.disabled = !u.canSpin;

        var chkBtn = document.getElementById('checkinBtn');
        if (chkBtn) chkBtn.disabled = !u.canCheckin;

        for (var i = 1; i <= 7; i++) {
          var el = document.getElementById('stDay' + i);
          if (el) {
            if (i <= (u.checkinStreak || 0)) el.classList.add('active');
            else el.classList.remove('active');
          }
        }

        if (isUserOwner) {
          document.getElementById('viewUserArea').style.display = 'none';
          document.getElementById('userNavBar').style.display = 'none';
          document.getElementById('viewOwnerArea').style.display = 'block';
          document.getElementById('ownerNavBar').style.display = 'flex';
          loadOwnerData();
        } else {
          document.getElementById('viewUserArea').style.display = 'block';
          document.getElementById('userNavBar').style.display = 'flex';
          document.getElementById('viewOwnerArea').style.display = 'none';
          document.getElementById('ownerNavBar').style.display = 'none';
        }

        var invBox = document.getElementById('activeInvoiceBox');
        var buyBtns = document.querySelectorAll('.btn-buy-pkg');

        if (data.currentInvoice) {
          var inv = data.currentInvoice;
          activeInvoiceId = inv.id;

          buyBtns.forEach(function(btn) { btn.disabled = true; });

          var proofHtml = inv.proofImage ? 
            '<div class="proof-preview-container">' +
              '<img src="' + inv.proofImage + '" class="proof-preview-img" onclick="openZoomModal(\\'' + inv.proofImage + '\\')">' +
              '<div class="zoom-btn-overlay" onclick="openZoomModal(\\'' + inv.proofImage + '\\')">' +
                '<svg class="icon-svg" style="width:14px;height:14px" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>' +
                'Perbesar Foto Fullscreen' +
              '</div>' +
            '</div>' : '';

          invBox.innerHTML = 
            '<div class="glass-card" style="border-color:var(--accent-amber)">' +
              '<div style="font-weight:800;font-size:15px;color:var(--accent-amber)">Invoice Aktif: ' + inv.id + '</div>' +
              '<div style="font-size:13px;margin-top:4px;font-weight:700">Paket ' + inv.days + ' Hari - ' + (inv.amountFormatted || ('Rp ' + inv.amount)) + '</div>' +
              '<div style="font-size:12px;color:var(--text-secondary);margin-top:4px;font-weight:600">Status: <b>' + (inv.status === 'waiting_approval' ? 'Menunggu Konfirmasi Owner' : 'Belum Dibayar / Upload Bukti') + '</b></div>' +
              proofHtml +
              '<div style="display:flex;gap:10px;margin-top:14px">' +
                '<button class="btn-custom" style="padding:11px;font-size:12px;background:linear-gradient(135deg, var(--accent-emerald), #059669)" onclick="triggerUploadProof()">' + (inv.proofImage ? 'Ganti Foto Bukti' : 'Upload Foto Bukti') + '</button>' +
                '<button class="btn-custom" style="padding:11px;font-size:12px;background:linear-gradient(135deg, var(--accent-rose), #e11d48)" onclick="cancelOrder(\\'' + inv.id + '\\', this)">Batalkan Pembelian</button>' +
              '</div>' +
            '</div>';
        } else {
          activeInvoiceId = null;
          invBox.innerHTML = '';
          buyBtns.forEach(function(btn) { btn.disabled = false; });
        }
      } else if (!isSilent) {
        showToast('Error', data.message || 'Gagal memuat profil', 'error');
      }
    } catch (e) {
      if (!isSilent) showToast('Error', 'Gagal memuat data dari server', 'error');
    } finally {
      if (!isSilent) hideLoader();
    }
  }

  function openZoomModal(imgSrc) {
    document.getElementById('zoomedImageSrc').src = imgSrc;
    document.getElementById('imageZoomModal').classList.add('active');
  }

  function closeZoomModal() {
    document.getElementById('imageZoomModal').classList.remove('active');
  }

  function switchTab(tabName, event) {
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    document.querySelectorAll('#viewUserArea .view').forEach(function(v) { v.classList.remove('active'); });
    document.querySelectorAll('#userNavBar .nav-tab').forEach(function(t) { t.classList.remove('active'); });

    document.getElementById('view' + tabName).classList.add('active');
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
  }

  function switchOwnerTab(tabName, event) {
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    document.querySelectorAll('#viewOwnerArea .view').forEach(function(v) { v.classList.remove('active'); });
    document.querySelectorAll('#ownerNavBar .nav-tab').forEach(function(t) { t.classList.remove('active'); });

    document.getElementById('oTab' + tabName).classList.add('active');
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
  }

  function showToast(title, msg, type) {
    type = type || 'info';
    var t = document.getElementById('toast');
    var iconContainer = document.getElementById('toastIcon');
    var progress = document.getElementById('toastProgress');
    
    var colors = {
      success: 'var(--accent-emerald)',
      error: 'var(--accent-rose)',
      warning: 'var(--accent-amber)',
      info: 'var(--accent-blue)'
    };
    var color = colors[type] || colors.info;

    t.style.borderColor = color;
    iconContainer.style.color = color;
    if (progress) progress.style.background = color;

    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMsg').textContent = msg;

    if (progress) {
      progress.style.transition = 'none';
      progress.style.width = '100%';
      setTimeout(function() {
        progress.style.transition = 'width 3.5s linear';
        progress.style.width = '0%';
      }, 50);
    }

    t.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function() { t.classList.remove('show'); }, 3500);
  }

  async function triggerSpin(btn) {
    if (isSpinning) return;
    isSpinning = true;
    if (btn) btn.disabled = true;

    try {
      var res = await fetch('/api/api?endpoint=spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId })
      });
      var data = await res.json();

      if (data.ok) {
        var pIndex = data.prizeIndex !== undefined ? data.prizeIndex : 0;
        var numSlices = wheelPrizes.length;
        var sliceDeg = 360 / numSlices;
        var targetDeg = 360 - (pIndex * sliceDeg + sliceDeg / 2) - 90;

        currentWheelRotation += (360 * 5) + (targetDeg - (currentWheelRotation % 360));
        var canvas = document.getElementById('spinCanvas');
        canvas.style.transform = 'rotate(' + currentWheelRotation + 'deg)';

        setTimeout(function() {
          showToast(data.prize.type === 'zonk' ? 'Informasi Spin' : 'Selamat!', data.message, data.prize.type === 'zonk' ? 'warning' : 'success');
          loadUserData();
          isSpinning = false;
        }, 4200);
      } else {
        showToast('Informasi', data.message, 'warning');
        isSpinning = false;
      }
    } catch (e) {
      showToast('Error', 'Gagal memproses spin', 'error');
      isSpinning = false;
      if (btn) btn.disabled = false;
    }
  }

  async function triggerCheckin(btn) {
    var orig = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = 'Proses Check-in...'; }
    try {
      var res = await fetch('/api/api?endpoint=checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId })
      });
      var data = await res.json();
      showToast(data.ok ? 'Check-in Berhasil' : 'Informasi', data.message, data.ok ? 'success' : 'warning');
      if (data.ok) loadUserData();
    } catch (e) {
      showToast('Error', 'Gagal melakukan check-in', 'error');
    } finally {
      if (btn && !data.ok) { btn.disabled = false; btn.innerHTML = orig; }
    }
  }

  async function redeemPoints(option, btn) {
    var orig = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = 'Proses...'; }
    try {
      var res = await fetch('/api/api?endpoint=redeem_points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId, option: option })
      });
      var data = await res.json();
      showToast(data.ok ? 'Point Vault' : 'Gagal Transaksi', data.message, data.ok ? 'success' : 'error');
      if (data.ok) loadUserData();
    } catch (e) {
      showToast('Error', 'Gagal menukarkan poin', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = orig; }
    }
  }

  async function createOrder(days, amount, btn) {
    var orig = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = 'Memproses...'; }
    try {
      var res = await fetch('/api/api?endpoint=order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId, days: days, amount: amount })
      });
      var data = await res.json();
      if (data.ok) {
        showToast('Invoice Dibuat', 'ID: ' + (data.invoice.invoice || data.invoice.id), 'success');
        loadUserData();
      } else {
        showToast('Transaksi Tertunda', data.message, 'warning');
      }
    } catch (e) {
      showToast('Error', 'Gagal membuat invoice', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = orig; }
    }
  }

  async function cancelOrder(invoiceId, btn) {
    var orig = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = 'Membatalkan...'; }
    try {
      var res = await fetch('/api/api?endpoint=cancel_order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId, invoice: invoiceId })
      });
      var data = await res.json();
      showToast(data.ok ? 'Dibatalkan' : 'Gagal', data.message, data.ok ? 'success' : 'error');
      if (data.ok) loadUserData();
    } catch (e) {
      showToast('Error', 'Gagal membatalkan invoice', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = orig; }
    }
  }

  function triggerUploadProof() {
    document.getElementById('proofFileInput').click();
  }

  function submitProofFile(event) {
    var file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      return showToast('Error Upload', 'Bukti pembayaran harus berupa file foto!', 'error');
    }

    var reader = new FileReader();
    reader.onload = async function(e) {
      var base64 = e.target.result;
      try {
        var res = await fetch('/api/api?endpoint=upload_proof', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: currentUserId, invoice: activeInvoiceId, image_data: base64 })
        });
        var data = await res.json();
        showToast(data.ok ? 'Sukses Upload' : 'Gagal Upload', data.message, data.ok ? 'success' : 'error');
        if (data.ok) loadUserData();
      } catch (err) {
        showToast('Error', 'Gagal mengunggah foto bukti', 'error');
      }
    };
    reader.readAsDataURL(file);
  }

  async function claimVoucher(btn) {
    var code = document.getElementById('vCodeInput').value.trim();
    if (!code) return showToast('Peringatan', 'Masukkan kode voucher promo!', 'warning');

    var orig = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = 'Mengklaim...'; }

    try {
      var res = await fetch('/api/api?endpoint=redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId, code: code })
      });
      var data = await res.json();
      showToast(data.ok ? 'Sukses Klaim' : 'Gagal Klaim', data.message, data.ok ? 'success' : 'error');
      if (data.ok) {
        document.getElementById('vCodeInput').value = '';
        loadUserData();
      }
    } catch (e) {
      showToast('Error', 'Gagal mengklaim voucher', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = orig; }
    }
  }

  function copyRefLink() {
    var input = document.getElementById('refUrlInput');
    input.select();
    document.execCommand('copy');
    showToast('Berhasil Disalin', 'Link referral tersalin ke clipboard!', 'success');
  }

  async function loadOwnerData() {
    try {
      var res = await fetch('/api/api?endpoint=stats&user_id=' + currentUserId);
      var d = await res.json();

      if (d.ok) {
        document.getElementById('oRev').textContent = 'Rp ' + (d.revenue || 0).toLocaleString('id-ID');
        document.getElementById('oUsers').textContent = d.usersValid || 0;
        document.getElementById('oVip').textContent = d.premium || 0;
        document.getElementById('oFix').textContent = d.totalFix || 0;

        var pendingList = document.getElementById('oPendingList');
        if (d.pendingPayments && d.pendingPayments.length > 0) {
          pendingList.innerHTML = d.pendingPayments.map(function(p) {
            var imgHtml = p.proofImage ? 
              '<div class="proof-preview-container">' +
                '<img src="' + p.proofImage + '" class="proof-preview-img" onclick="openZoomModal(\\'' + p.proofImage + '\\')">' +
                '<div class="zoom-btn-overlay" onclick="openZoomModal(\\'' + p.proofImage + '\\')">' +
                  '<svg class="icon-svg" style="width:14px;height:14px" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>' +
                  'Lihat Foto Fullscreen' +
                '</div>' +
              '</div>' : '<div style="font-size:12px;color:var(--accent-rose);margin-top:4px;font-weight:600">Belum upload foto bukti.</div>';

            return '<div class="glass-card">' +
              '<div style="font-weight:800;font-size:14px">Invoice: ' + p.id + '</div>' +
              '<div style="font-size:12px;color:var(--text-secondary);margin-top:2px;font-weight:600">User: ' + p.userId + ' | Paket: ' + p.days + ' Hari (' + (p.amountFormatted || ('Rp ' + p.amount)) + ')</div>' +
              imgHtml +
              '<div style="display:flex;gap:10px;margin-top:12px">' +
                '<button class="btn-custom" style="padding:10px;font-size:12px;background:linear-gradient(135deg, var(--accent-emerald), #059669)" onclick="ownerAct(\\'' + p.id + '\\', \\'approve\\', this)">Setujui Pembayaran</button>' +
                '<button class="btn-custom" style="padding:10px;font-size:12px;background:linear-gradient(135deg, var(--accent-rose), #e11d48)" onclick="ownerAct(\\'' + p.id + '\\', \\'reject\\', this)">Tolak</button>' +
              '</div>' +
            '</div>';
          }).join('');
        } else {
          pendingList.innerHTML = '<div style="font-size:12px;color:var(--text-secondary);font-weight:600">Tidak ada pending deposit.</div>';
        }

        var userList = document.getElementById('oUserList');
        if (d.recentUsers && d.recentUsers.length > 0) {
          userList.innerHTML = d.recentUsers.slice(0, 15).map(function(u) {
            var isVip = u.premiumUntil && u.premiumUntil > Date.now();
            return '<div class="glass-card" style="padding:14px">' +
              '<div style="display:flex;justify-content:space-between;align-items:center">' +
                '<div>' +
                  '<div style="font-weight:800;font-size:14px">' + (u.first_name || 'User Walzy') + '</div>' +
                  '<div style="font-size:11px;color:var(--text-secondary);font-weight:600">ID: ' + u.id + ' | Order: ' + (u.totalFix || 0) + '</div>' +
                '</div>' +
                '<span class="user-badge">' + (isVip ? 'VIP' : 'Free') + '</span>' +
              '</div>' +
            '</div>';
          }).join('');
        }

        var vList = document.getElementById('oVoucherList');
        if (d.codes && d.codes.length > 0) {
          vList.innerHTML = d.codes.map(function(c) {
            return '<div class="glass-card" style="padding:14px">' +
              '<div style="display:flex;justify-content:space-between;align-items:center">' +
                '<div>' +
                  '<div style="font-weight:800;font-size:14px">' + c.code + '</div>' +
                  '<div style="font-size:11px;color:var(--text-secondary);font-weight:600">' + c.days + ' Hari | Terpakai: ' + (c.used || 0) + '/' + (c.quota || '∞') + '</div>' +
                '</div>' +
                '<button class="btn-custom" style="width:auto;padding:8px 14px;font-size:11px;background:linear-gradient(135deg, var(--accent-rose), #e11d48)" onclick="deleteVoucher(\\'' + c.code + '\\', this)">Hapus</button>' +
              '</div>' +
            '</div>';
          }).join('');
        } else {
          vList.innerHTML = '<div style="font-size:12px;color:var(--text-secondary);font-weight:600">Belum ada voucher aktif.</div>';
        }
      }
    } catch (e) {}
  }

  async function ownerAct(invoice, action, btn) {
    if (btn) { btn.disabled = true; btn.innerHTML = 'Memproses...'; }
    try {
      var res = await fetch('/api/api?endpoint=owner_action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: currentUserId, invoice: invoice, action: action })
      });
      var data = await res.json();
      showToast(data.ok ? 'Sukses' : 'Gagal', data.message, data.ok ? 'success' : 'error');
      if (data.ok) loadOwnerData();
    } catch (e) {
      showToast('Error', 'Gagal memproses aksi', 'error');
    }
  }

  async function createVoucher(btn) {
    var code = document.getElementById('vGenCode').value.trim();
    var days = document.getElementById('vGenDays').value;
    var quota = document.getElementById('vGenQuota').value;

    if (!code || !days) return showToast('Error', 'Lengkapi kode dan durasi hari!', 'warning');
    if (btn) { btn.disabled = true; btn.innerHTML = 'Membuat...'; }

    try {
      var res = await fetch('/api/api?endpoint=create_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: currentUserId, code: code, days: days, quota: quota })
      });
      var data = await res.json();
      showToast(data.ok ? 'Voucher Dibuat' : 'Gagal', data.message, data.ok ? 'success' : 'error');
      if (data.ok) {
        document.getElementById('vGenCode').value = '';
        document.getElementById('vGenDays').value = '';
        document.getElementById('vGenQuota').value = '';
        loadOwnerData();
      }
    } catch (e) {
      showToast('Error', 'Gagal membuat voucher', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = 'Buat Voucher'; }
    }
  }

  async function deleteVoucher(code, btn) {
    if (btn) { btn.disabled = true; btn.innerHTML = 'Hapus...'; }
    try {
      var res = await fetch('/api/api?endpoint=delete_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: currentUserId, code: code })
      });
      var data = await res.json();
      showToast(data.ok ? 'Voucher Dihapus' : 'Gagal', data.message, data.ok ? 'success' : 'error');
      if (data.ok) loadOwnerData();
    } catch (e) {
      showToast('Error', 'Gagal menghapus voucher', 'error');
    }
  }

  async function sendBroadcast(btn) {
    var text = document.getElementById('bcTextInput').value.trim();
    if (!text) return showToast('Error', 'Pesan broadcast tidak boleh kosong!', 'warning');
    if (btn) { btn.disabled = true; btn.innerHTML = 'Mengirim Broadcast...'; }

    try {
      var res = await fetch('/api/api?endpoint=broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: currentUserId, text: text })
      });
      var data = await res.json();

      if (data.ok) {
        showToast('Broadcast Selesai', data.message, 'success');
        document.getElementById('bcTextInput').value = '';
        loadOwnerData();
      } else {
        showToast('Gagal Broadcast', data.message, 'error');
      }
    } catch (e) {
      showToast('Error', 'Gagal mengirim broadcast', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = 'Kirim Broadcast Sekarang'; }
    }
  }

  if (document.readyState === 'complete') {
    initApp();
  } else {
    window.addEventListener('load', initApp);
    setTimeout(initApp, 2500);
  }
</script>
</body>
</html>`;

  res.send(htmlContent);
};
