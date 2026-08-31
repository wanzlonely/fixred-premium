module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');

  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>WALZY STORE PRO</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  :root {
    --bg-main: #070a11;
    --bg-card: rgba(18, 25, 41, 0.75);
    --border-card: rgba(255, 255, 255, 0.08);
    --accent-blue: #3b82f6;
    --accent-purple: #8b5cf6;
    --accent-emerald: #10b981;
    --accent-amber: #f59e0b;
    --accent-rose: #f43f5e;
    --text-primary: #f3f4f6;
    --text-secondary: #9ca3af;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; -webkit-tap-highlight-color: transparent; }

  body {
    background: var(--bg-main);
    background-image: 
      radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.15) 0%, transparent 40%),
      radial-gradient(circle at 90% 80%, rgba(139, 92, 246, 0.12) 0%, transparent 40%);
    color: var(--text-primary);
    min-height: 100vh;
    padding-bottom: 95px;
    overflow-x: hidden;
  }

  .icon-svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: all 0.3s ease; }
  .pulse { animation: pulseAnim 2s infinite; }
  .float { animation: floatAnim 3s ease-in-out infinite; }
  .spin-slow { animation: spinAnim 8s linear infinite; }
  .glow-box { box-shadow: 0 0 24px rgba(59, 130, 246, 0.25); }

  @keyframes pulseAnim { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.96); } }
  @keyframes floatAnim { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  @keyframes spinAnim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(7, 10, 17, 0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border-card);
    height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 18px;
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .brand-icon {
    width: 38px; height: 38px; border-radius: 12px;
    background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
    display: grid; place-items: center; color: #fff; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
  .brand-title { font-weight: 800; font-size: 16px; letter-spacing: -0.3px; background: linear-gradient(90deg, #fff, var(--text-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

  .container { max-width: 520px; margin: 0 auto; padding: 16px; }
  .glass-card {
    background: var(--bg-card);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border-card);
    border-radius: 20px; padding: 18px; margin-bottom: 14px;
    position: relative; overflow: hidden;
  }
  .glass-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  }

  .user-badge {
    display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 700; background: rgba(59, 130, 246, 0.15); color: var(--accent-blue);
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 14px; }

  .stat-card {
    background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px; padding: 14px;
    display: flex; flex-direction: column; gap: 4px; position: relative;
  }
  .stat-val { font-size: 20px; font-weight: 800; color: #fff; }
  .stat-lbl { font-size: 11px; color: var(--text-secondary); }

  .btn-custom {
    width: 100%; padding: 14px; border-radius: 14px; border: none; font-weight: 700; font-size: 14px;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s ease; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
    color: #fff; box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  }
  .btn-custom:active { transform: scale(0.97); }
  .btn-custom:disabled { opacity: 0.5; cursor: not-allowed; }

  .input-custom {
    width: 100%; padding: 14px; border-radius: 14px; background: rgba(255,255,255,0.05);
    border: 1px solid var(--border-card); color: #fff; outline: none; font-size: 13px;
    transition: all 0.3s ease;
  }
  .input-custom:focus { border-color: var(--accent-blue); box-shadow: 0 0 12px rgba(59,130,246,0.25); }

  .nav-bar {
    position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
    width: calc(100% - 32px); max-width: 440px; background: rgba(13, 18, 30, 0.88);
    backdrop-filter: blur(20px); border: 1px solid var(--border-card); border-radius: 24px;
    display: flex; justify-content: space-around; padding: 6px; z-index: 80;
    box-shadow: 0 12px 32px rgba(0,0,0,0.5);
  }
  .nav-tab {
    display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 10px;
    border-radius: 16px; color: var(--text-secondary); text-decoration: none; font-size: 10px; font-weight: 700;
    cursor: pointer; transition: all 0.3s ease; flex: 1; text-align: center;
  }
  .nav-tab.active { color: #fff; background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2)); border: 1px solid rgba(59,130,246,0.3); }

  .view { display: none; opacity: 0; transform: translateY(10px); transition: all 0.3s ease; }
  .view.active { display: block; opacity: 1; transform: translateY(0); }

  .toast {
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px);
    width: calc(100% - 40px); max-width: 380px; background: var(--bg-card); backdrop-filter: blur(20px);
    border: 1px solid var(--accent-blue); border-radius: 16px; padding: 14px 18px; z-index: 100;
    display: flex; align-items: center; gap: 12px; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  }
  .toast.show { transform: translateX(-50%) translateY(0); }

  .streak-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin: 14px 0; }
  .streak-day {
    background: rgba(255,255,255,0.05); border: 1px solid var(--border-card); border-radius: 12px;
    padding: 10px 2px; text-align: center; font-size: 10px; font-weight: 700; display: flex; flex-direction: column; gap: 4px; align-items: center;
  }
  .streak-day.active { background: rgba(16, 185, 129, 0.2); border-color: var(--accent-emerald); color: var(--accent-emerald); }

  .sub-tab-bar { display: flex; gap: 8px; margin-bottom: 14px; overflow-x: auto; padding-bottom: 4px; }
  .sub-tab { padding: 8px 14px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border-card); font-size: 12px; font-weight: 700; color: var(--text-secondary); cursor: pointer; white-space: nowrap; }
  .sub-tab.active { background: var(--accent-blue); color: #fff; border-color: var(--accent-blue); }

  .product-shop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
  .shop-item {
    background: rgba(255,255,255,0.03); border: 1px solid var(--border-card); border-radius: 16px; padding: 14px;
    display: flex; flex-direction: column; justify-content: space-between; gap: 10px;
  }

  .loader-screen {
    position: fixed; inset: 0; background: var(--bg-main); z-index: 99;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
  }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
    z-index: 90; display: none; place-items: center; padding: 16px;
  }
  .modal-overlay.active { display: grid; }
</style>
</head>
<body>

<div class="loader-screen" id="loader">
  <div class="brand-icon float" style="width:64px;height:64px;border-radius:20px;">
    <svg class="icon-svg spin-slow" style="width:32px;height:32px" viewBox="0 0 24 24"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
  </div>
  <div style="font-weight:800;font-size:18px;letter-spacing:1px">WALZY STORE PRO</div>
  <div style="font-size:12px;color:var(--text-secondary)" id="loadText">Menghubungkan ke server...</div>
</div>

<div class="toast" id="toast">
  <div id="toastIcon" style="color:var(--accent-blue)">
    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  </div>
  <div>
    <div id="toastTitle" style="font-weight:700;font-size:13px">Notifikasi</div>
    <div id="toastMsg" style="font-size:11px;color:var(--text-secondary)">Pesan deskripsi</div>
  </div>
</div>

<div class="modal-overlay" id="invoiceModal">
  <div class="glass-card" style="width:100%;max-width:400px;margin:0">
    <div style="font-weight:800;font-size:16px;margin-bottom:8px">Detail Invoice Pembayaran</div>
    <div id="modalInvoiceContent" style="font-size:12px;line-height:1.6;color:var(--text-secondary)"></div>
    <button class="btn-custom" style="margin-top:14px" onclick="closeInvoiceModal()">Tutup Modal</button>
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
    <span style="width:6px;height:6px;border-radius:50%;background:var(--accent-emerald)" class="pulse"></span> ONLINE
  </div>
</div>

<div class="container">

  <div id="viewHome" class="view active">
    <div class="glass-card glow-box">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
        <div style="width:52px;height:52px;border-radius:16px;background:rgba(255,255,255,0.08);display:grid;place-items:center;color:var(--accent-blue)">
          <svg class="icon-svg float" style="width:28px;height:28px" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div>
          <div id="uName" style="font-weight:800;font-size:16px">Memuat User...</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:2px" id="uIdText">ID: --</div>
          <div style="display:flex;gap:6px;margin-top:6px">
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
        <div style="font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px">
          <svg class="icon-svg spin-slow" style="color:var(--accent-amber)" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Spin Wheel Hadiah
        </div>
      </div>
      <button class="btn-custom" id="spinBtn" onclick="triggerSpin()">
        Putar Spin Harian
      </button>
    </div>

    <div class="glass-card">
      <div style="font-weight:700;font-size:14px;margin-bottom:10px;display:flex;align-items:center;gap:8px">
        <svg class="icon-svg" style="color:var(--accent-emerald)" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Redeem Kode Voucher
      </div>
      <input class="input-custom" id="vCodeInput" placeholder="Masukkan Kode Voucher Promo">
      <button class="btn-custom" style="margin-top:10px;background:linear-gradient(135deg, var(--accent-emerald), #059669)" onclick="claimVoucher()">
        Tukarkan Kode
      </button>
    </div>

    <div class="glass-card">
      <div style="font-weight:700;font-size:14px;margin-bottom:8px;display:flex;align-items:center;gap:8px">
        <svg class="icon-svg" style="color:var(--accent-purple)" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Program Referral Undangan
      </div>
      <div style="font-size:11px;color:var(--text-secondary);margin-bottom:10px">Dapatkan +50 Poin setiap kali ada user baru yang mendaftar menggunakan link Anda.</div>
      <input class="input-custom" id="refUrlInput" readonly value="Memuat link...">
      <button class="btn-custom" style="margin-top:10px" onclick="copyRefLink()">
        Salin Link Referral
      </button>
    </div>
  </div>

  <div id="viewOrder" class="view">
    <div style="font-weight:800;font-size:18px;margin-bottom:4px">Katalog VIP Store</div>
    <div style="font-size:12px;color:var(--text-secondary);margin-bottom:14px">Pilih paket langganan VIP dan nikmati seluruh akses bot tanpa batas!</div>

    <div id="activeInvoiceBox"></div>

    <div class="glass-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700;font-size:15px">VIP Trial 3 Hari</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">Akses VIP 3 Hari Full</div>
        </div>
        <div style="font-weight:800;font-size:16px;color:var(--accent-blue)">Rp 7.000</div>
      </div>
      <button class="btn-custom" style="margin-top:12px;padding:10px" onclick="createOrder(3, 7000)">Beli VIP 3 Hari</button>
    </div>

    <div class="glass-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700;font-size:15px">VIP Hemat 5 Hari</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">Akses VIP 5 Hari Full</div>
        </div>
        <div style="font-weight:800;font-size:16px;color:var(--accent-blue)">Rp 10.000</div>
      </div>
      <button class="btn-custom" style="margin-top:12px;padding:10px" onclick="createOrder(5, 10000)">Beli VIP 5 Hari</button>
    </div>

    <div class="glass-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700;font-size:15px">VIP Starter 7 Hari</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">Akses VIP 7 Hari Popular</div>
        </div>
        <div style="font-weight:800;font-size:16px;color:var(--accent-emerald)">Rp 15.000</div>
      </div>
      <button class="btn-custom" style="margin-top:12px;padding:10px;background:linear-gradient(135deg, var(--accent-emerald), #059669)" onclick="createOrder(7, 15000)">Beli VIP 7 Hari</button>
    </div>

    <div class="glass-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700;font-size:15px">VIP Pro 14 Hari</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">Akses VIP 14 Hari Best Value</div>
        </div>
        <div style="font-weight:800;font-size:16px;color:var(--accent-purple)">Rp 25.000</div>
      </div>
      <button class="btn-custom" style="margin-top:12px;padding:10px;background:linear-gradient(135deg, var(--accent-purple), #7c3aed)" onclick="createOrder(14, 25000)">Beli VIP 14 Hari</button>
    </div>

    <div class="glass-card" style="border-color:rgba(245, 158, 11, 0.4)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700;font-size:15px">VIP Sultan 30 Hari</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">Akses VIP 30 Hari Priority Support</div>
        </div>
        <div style="font-weight:800;font-size:16px;color:var(--accent-amber)">Rp 45.000</div>
      </div>
      <button class="btn-custom" style="margin-top:12px;padding:10px;background:linear-gradient(135deg, var(--accent-amber), #d97706)" onclick="createOrder(30, 45000)">Beli VIP 30 Hari</button>
    </div>
  </div>

  <div id="viewCheckin" class="view">
    <div style="font-weight:800;font-size:18px;margin-bottom:4px">Daily Check-in Poin</div>
    <div style="font-size:12px;color:var(--text-secondary);margin-bottom:14px">Check-in harian untuk mendapatkan poin bertingkat setiap minggunya!</div>

    <div class="glass-card glow-box">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:11px;color:var(--text-secondary)">Poin Anda saat ini</div>
          <div style="font-size:24px;font-weight:800;color:var(--accent-amber)" id="checkinPointsVal">0 PTS</div>
        </div>
        <button class="btn-custom" id="checkinBtn" style="width:auto;padding:10px 18px" onclick="triggerCheckin()">
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

    <div style="font-weight:800;font-size:16px;margin:18px 0 10px">Point Shop - Tukar Poin Jadi VIP</div>

    <div class="product-shop-grid">
      <div class="shop-item">
        <div>
          <div style="font-weight:700;font-size:14px">1 Hari VIP</div>
          <div style="font-size:11px;color:var(--accent-amber);margin-top:2px">100 PTS</div>
        </div>
        <button class="btn-custom" style="padding:8px;font-size:12px" onclick="redeemPoints(1)">Tukarkan</button>
      </div>

      <div class="shop-item">
        <div>
          <div style="font-weight:700;font-size:14px">3 Hari VIP</div>
          <div style="font-size:11px;color:var(--accent-amber);margin-top:2px">250 PTS</div>
        </div>
        <button class="btn-custom" style="padding:8px;font-size:12px" onclick="redeemPoints(2)">Tukarkan</button>
      </div>

      <div class="shop-item">
        <div>
          <div style="font-weight:700;font-size:14px">7 Hari VIP</div>
          <div style="font-size:11px;color:var(--accent-amber);margin-top:2px">500 PTS</div>
        </div>
        <button class="btn-custom" style="padding:8px;font-size:12px;background:linear-gradient(135deg, var(--accent-emerald), #059669)" onclick="redeemPoints(3)">Tukarkan</button>
      </div>

      <div class="shop-item">
        <div>
          <div style="font-weight:700;font-size:14px">14 Hari VIP</div>
          <div style="font-size:11px;color:var(--accent-amber);margin-top:2px">900 PTS</div>
        </div>
        <button class="btn-custom" style="padding:8px;font-size:12px;background:linear-gradient(135deg, var(--accent-purple), #7c3aed)" onclick="redeemPoints(4)">Tukarkan</button>
      </div>

      <div class="shop-item" style="grid-column: span 2">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700;font-size:14px">30 Hari VIP Sultan</div>
            <div style="font-size:11px;color:var(--accent-amber);margin-top:2px">1.600 PTS</div>
          </div>
          <button class="btn-custom" style="width:auto;padding:8px 20px;font-size:12px;background:linear-gradient(135deg, var(--accent-amber), #d97706)" onclick="redeemPoints(5)">Tukarkan</button>
        </div>
      </div>
    </div>
  </div>

  <div id="viewOwner" class="view">
    <div id="ownerLoginBox" class="glass-card">
      <div style="font-weight:800;font-size:16px;margin-bottom:12px;text-align:center">OWNER STUDIO AUTHENTICATION</div>
      <input type="password" class="input-custom" id="ownerPassInput" placeholder="Masukkan Password Owner">
      <button class="btn-custom" style="margin-top:12px" onclick="verifyOwner()">Verifikasi Akses Owner</button>
    </div>

    <div id="ownerContent" style="display:none">
      <div class="sub-tab-bar">
        <div class="sub-tab active" onclick="switchOwnerSubTab('Analytics', event)">Analitik</div>
        <div class="sub-tab" onclick="switchOwnerSubTab('Orders', event)">Katalog Order</div>
        <div class="sub-tab" onclick="switchOwnerSubTab('Users', event)">Kelola User</div>
        <div class="sub-tab" onclick="switchOwnerSubTab('Vouchers', event)">Buat Voucher</div>
        <div class="sub-tab" onclick="switchOwnerSubTab('Broadcast', event)">Broadcast</div>
      </div>

      <div id="oTabAnalytics">
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

      <div id="oTabOrders" style="display:none">
        <div style="font-weight:700;font-size:14px;margin-bottom:10px">Pending Pembayaran Deposit</div>
        <div id="oPendingList"></div>
      </div>

      <div id="oTabUsers" style="display:none">
        <div style="font-weight:700;font-size:14px;margin-bottom:10px">Daftar Pengguna Valid</div>
        <div id="oUserList"></div>
      </div>

      <div id="oTabVouchers" style="display:none">
        <div class="glass-card">
          <div style="font-weight:700;font-size:14px;margin-bottom:10px">Generator Voucher Promo</div>
          <input class="input-custom" id="vGenCode" placeholder="Kode Voucher (cth: SULTAN100)" style="margin-bottom:8px">
          <div class="grid2" style="margin-bottom:8px">
            <input class="input-custom" id="vGenDays" type="number" placeholder="Durasi (Hari)">
            <input class="input-custom" id="vGenQuota" type="number" placeholder="Kuota (0 = ∞)">
          </div>
          <button class="btn-custom" onclick="createVoucher()">Buat Voucher</button>
        </div>
        <div style="font-weight:700;font-size:14px;margin:12px 0 8px">Voucher Aktif</div>
        <div id="oVoucherList"></div>
      </div>

      <div id="oTabBroadcast" style="display:none">
        <div class="glass-card">
          <div style="font-weight:700;font-size:14px;margin-bottom:8px">Kirim Broadcast Pesan Massal</div>
          <textarea class="input-custom" id="bcTextInput" style="height:120px;resize:none;margin-bottom:10px" placeholder="Tuliskan pesan HTML yang akan dikirimkan langsung ke seluruh user..."></textarea>
          <button class="btn-custom" id="btnSendBc" onclick="sendBroadcast()">
            Kirim Broadcast Sekarang
          </button>
        </div>
      </div>
    </div>
  </div>

</div>

<div class="nav-bar">
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
  <div class="nav-tab" onclick="switchTab('Owner', event)">
    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    Studio
  </div>
</div>

<script>
  let tg = window.Telegram ? window.Telegram.WebApp : null;
  if (tg) { tg.ready(); tg.expand(); }

  let currentUserId = null;
  let ownerPassword = '';

  function initApp() {
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      currentUserId = tg.initDataUnsafe.user.id;
    } else {
      let sp = new URLSearchParams(window.location.search);
      currentUserId = sp.get('user_id') || sp.get('userId');
    }

    if (!currentUserId) {
      document.getElementById('loadText').textContent = 'Silakan buka WebApp melalui Telegram Bot!';
      return;
    }

    loadUserData();
  }

  async function loadUserData() {
    try {
      let res = await fetch('/api/user?user_id=' + currentUserId);
      let data = await res.json();

      if (data.ok) {
        let u = data.user;
        document.getElementById('uName').textContent = u.first_name;
        document.getElementById('uIdText').textContent = 'ID: ' + u.id;
        document.getElementById('uRankBadge').textContent = u.rank.name;
        document.getElementById('uStatusBadge').textContent = u.isPremium ? 'VIP (' + u.premiumLeftDays + 'H)' : 'Gratis (' + u.dailyFixRemaining + '/3)';
        document.getElementById('sOrders').textContent = u.totalFix;
        document.getElementById('sRefs').textContent = u.referralCount;
        document.getElementById('sPoints').textContent = u.points;
        document.getElementById('checkinPointsVal').textContent = u.points + ' PTS';
        document.getElementById('refUrlInput').value = u.referralLink;

        let spinBtn = document.getElementById('spinBtn');
        spinBtn.disabled = !u.canSpin;

        let chkBtn = document.getElementById('checkinBtn');
        chkBtn.disabled = !u.canCheckin;

        for (let i = 1; i <= 7; i++) {
          let el = document.getElementById('stDay' + i);
          if (i <= u.checkinStreak) el.classList.add('active');
          else el.classList.remove('active');
        }

        let invBox = document.getElementById('activeInvoiceBox');
        if (data.currentInvoice) {
          let inv = data.currentInvoice;
          invBox.innerHTML = \`
            <div class="glass-card" style="border-color:var(--accent-amber)">
              <div style="font-weight:700;font-size:14px;color:var(--accent-amber)">Invoice Aktif: \${inv.id}</div>
              <div style="font-size:12px;margin-top:4px">Paket \${inv.days} Hari - \${inv.amountFormatted || 'Rp ' + inv.amount}</div>
              <button class="btn-custom" style="margin-top:10px;padding:8px;font-size:12px" onclick="showInvoiceDetails('\${inv.id}', '\${inv.days}', '\${inv.amountFormatted || 'Rp ' + inv.amount}')">Lihat Detail Pembayaran</button>
            </div>
          \`;
        } else {
          invBox.innerHTML = '';
        }

        document.getElementById('loader').style.display = 'none';
      } else {
        showToast('Error', data.message);
      }
    } catch (e) {
      showToast('Error', 'Gagal memuat data dari server');
    }
  }

  function showInvoiceDetails(invId, days, amount) {
    let modalContent = document.getElementById('modalInvoiceContent');
    modalContent.innerHTML = \`
      <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:12px;margin-top:10px">
        <b>ID Invoice:</b> \${invId}<br>
        <b>Paket VIP:</b> \${days} Hari<br>
        <b>Total Bayar:</b> \${amount}<br>
        <b>Status:</b> Menunggu Konfirmasi/Persetujuan Admin
      </div>
      <div style="margin-top:10px;font-size:11px">Silakan selesaikan pembayaran dan notifikasi persetujuan akan otomatis dikirimkan via Bot & WebApp.</div>
    \`;
    document.getElementById('invoiceModal').classList.add('active');
  }

  function closeInvoiceModal() {
    document.getElementById('invoiceModal').classList.remove('active');
  }

  function switchTab(tabName, event) {
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

    document.getElementById('view' + tabName).classList.add('active');
    if (event && event.currentTarget) {
      event.currentTarget.classList.add('active');
    }
  }

  function switchOwnerSubTab(subName, event) {
    document.querySelectorAll('#ownerContent > div[id^="oTab"]').forEach(d => d.style.display = 'none');
    document.querySelectorAll('.sub-tab').forEach(st => st.classList.remove('active'));

    document.getElementById('oTab' + subName).style.display = 'block';
    if (event && event.currentTarget) event.currentTarget.classList.add('active');
  }

  function showToast(title, msg) {
    let t = document.getElementById('toast');
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMsg').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
  }

  async function triggerSpin() {
    try {
      let res = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId })
      });
      let data = await res.json();
      showToast(data.ok ? 'Spin Berhasil' : 'Informasi', data.message);
      if (data.ok) loadUserData();
    } catch (e) {
      showToast('Error', 'Gagal memproses spin');
    }
  }

  async function triggerCheckin() {
    try {
      let res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId })
      });
      let data = await res.json();
      showToast(data.ok ? 'Check-in Berhasil' : 'Informasi', data.message);
      if (data.ok) loadUserData();
    } catch (e) {
      showToast('Error', 'Gagal melakukan check-in');
    }
  }

  async function redeemPoints(option) {
    try {
      let res = await fetch('/api/redeem_points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId, option })
      });
      let data = await res.json();
      showToast(data.ok ? 'Point Store' : 'Gagal', data.message);
      if (data.ok) loadUserData();
    } catch (e) {
      showToast('Error', 'Gagal menukarkan poin');
    }
  }

  async function createOrder(days, amount) {
    try {
      let res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId, days, amount })
      });
      let data = await res.json();
      if (data.ok) {
        showToast('Invoice Berhasil Dibuat', 'Invoice: ' + (data.invoice.invoice || data.invoice.id));
        loadUserData();
      } else {
        showToast('Gagal Order', data.message);
      }
    } catch (e) {
      showToast('Error', 'Gagal membuat invoice');
    }
  }

  async function claimVoucher() {
    let code = document.getElementById('vCodeInput').value.trim();
    if (!code) return showToast('Peringatan', 'Masukkan kode voucher!');

    try {
      let res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId, code })
      });
      let data = await res.json();
      showToast(data.ok ? 'Sukses' : 'Gagal', data.message);
      if (data.ok) {
        document.getElementById('vCodeInput').value = '';
        loadUserData();
      }
    } catch (e) {
      showToast('Error', 'Gagal mengklaim voucher');
    }
  }

  function copyRefLink() {
    let input = document.getElementById('refUrlInput');
    input.select();
    document.execCommand('copy');
    showToast('Berhasil', 'Tautan referral telah disalin!');
  }

  async function verifyOwner() {
    let pass = document.getElementById('ownerPassInput').value.trim();
    if (!pass) return showToast('Error', 'Masukkan password owner!');

    try {
      let res = await fetch('/api/verify_owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: currentUserId, password: pass })
      });
      let data = await res.json();
      if (data.ok) {
        ownerPassword = pass;
        document.getElementById('ownerLoginBox').style.display = 'none';
        document.getElementById('ownerContent').style.display = 'block';
        showToast('Akses Diterima', 'Selamat datang Owner!');
        loadOwnerData();
      } else {
        showToast('Akses Ditolak', data.message);
      }
    } catch (e) {
      showToast('Error', 'Gagal verifikasi owner');
    }
  }

  async function loadOwnerData() {
    try {
      let res = await fetch('/api/stats?user_id=' + currentUserId);
      let d = await res.json();

      if (d.ok) {
        document.getElementById('oRev').textContent = 'Rp ' + (d.revenue || 0).toLocaleString('id-ID');
        document.getElementById('oUsers').textContent = d.usersValid || 0;
        document.getElementById('oVip').textContent = d.premium || 0;
        document.getElementById('oFix').textContent = d.totalFix || 0;

        let pendingList = document.getElementById('oPendingList');
        if (d.pendingPayments && d.pendingPayments.length > 0) {
          pendingList.innerHTML = d.pendingPayments.map(p => \`
            <div class="glass-card">
              <div style="font-weight:700;font-size:13px">Invoice: \${p.id}</div>
              <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">User: \${p.userId} | Paket: \${p.days} Hari (\${p.amountFormatted || 'Rp ' + p.amount})</div>
              <div style="display:flex;gap:8px;margin-top:10px">
                <button class="btn-custom" style="padding:8px;font-size:12px;background:linear-gradient(135deg, var(--accent-emerald), #059669)" onclick="ownerAct('\${p.id}', 'approve')">Setujui Pembayaran</button>
                <button class="btn-custom" style="padding:8px;font-size:12px;background:linear-gradient(135deg, var(--accent-rose), #e11d48)" onclick="ownerAct('\${p.id}', 'reject')">Tolak</button>
              </div>
            </div>
          \`).join('');
        } else {
          pendingList.innerHTML = '<div style="font-size:12px;color:var(--text-secondary)">Tidak ada pending deposit.</div>';
        }

        let userList = document.getElementById('oUserList');
        if (d.recentUsers && d.recentUsers.length > 0) {
          userList.innerHTML = d.recentUsers.slice(0, 15).map(u => \`
            <div class="glass-card" style="padding:12px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div style="font-weight:700;font-size:13px">\${u.first_name || 'User'}</div>
                  <div style="font-size:11px;color:var(--text-secondary)">ID: \${u.id} | Order: \${u.totalFix || 0}</div>
                </div>
                <span class="user-badge">\${u.premiumUntil && u.premiumUntil > Date.now() ? 'VIP' : 'Free'}</span>
              </div>
            </div>
          \`).join('');
        }

        let vList = document.getElementById('oVoucherList');
        if (d.codes && d.codes.length > 0) {
          vList.innerHTML = d.codes.map(c => \`
            <div class="glass-card" style="padding:12px">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                  <div style="font-weight:700;font-size:13px">\${c.code}</div>
                  <div style="font-size:11px;color:var(--text-secondary)">\${c.days} Hari | Terpakai: \${c.used || 0}/\${c.quota || '∞'}</div>
                </div>
                <button class="btn-custom" style="width:auto;padding:6px 12px;font-size:11px;background:linear-gradient(135deg, var(--accent-rose), #e11d48)" onclick="deleteVoucher('\${c.code}')">Hapus</button>
              </div>
            </div>
          \`).join('');
        } else {
          vList.innerHTML = '<div style="font-size:12px;color:var(--text-secondary)">Belum ada voucher aktif.</div>';
        }
      }
    } catch (e) {}
  }

  async function ownerAct(invoice, action) {
    try {
      let res = await fetch('/api/owner_action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: currentUserId, password: ownerPassword, invoice, action })
      });
      let data = await res.json();
      showToast(data.ok ? 'Sukses' : 'Gagal', data.message);
      if (data.ok) loadOwnerData();
    } catch (e) {
      showToast('Error', 'Gagal memproses aksi');
    }
  }

  async function createVoucher() {
    let code = document.getElementById('vGenCode').value.trim();
    let days = document.getElementById('vGenDays').value;
    let quota = document.getElementById('vGenQuota').value;

    if (!code || !days) return showToast('Error', 'Lengkapi kode dan durasi hari!');

    try {
      let res = await fetch('/api/create_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: currentUserId, password: ownerPassword, code, days, quota })
      });
      let data = await res.json();
      showToast(data.ok ? 'Sukses' : 'Gagal', data.message);
      if (data.ok) {
        document.getElementById('vGenCode').value = '';
        document.getElementById('vGenDays').value = '';
        document.getElementById('vGenQuota').value = '';
        loadOwnerData();
      }
    } catch (e) {
      showToast('Error', 'Gagal membuat voucher');
    }
  }

  async function deleteVoucher(code) {
    try {
      let res = await fetch('/api/delete_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: currentUserId, password: ownerPassword, code })
      });
      let data = await res.json();
      showToast(data.ok ? 'Sukses' : 'Gagal', data.message);
      if (data.ok) loadOwnerData();
    } catch (e) {
      showToast('Error', 'Gagal menghapus voucher');
    }
  }

  async function sendBroadcast() {
    let text = document.getElementById('bcTextInput').value.trim();
    if (!text) return showToast('Error', 'Pesan broadcast tidak boleh kosong!');

    let btn = document.getElementById('btnSendBc');
    btn.disabled = true;
    btn.textContent = 'Mengirim Broadcast...';

    try {
      let res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: currentUserId, password: ownerPassword, text })
      });
      let data = await res.json();

      if (data.ok) {
        showToast('Broadcast Selesai', data.message);
        document.getElementById('bcTextInput').value = '';
        loadOwnerData();
      } else {
        showToast('Gagal Broadcast', data.message);
      }
    } catch (e) {
      showToast('Error', 'Gagal mengirim broadcast');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Kirim Broadcast Sekarang';
    }
  }

  window.onload = initApp;
</script>
</body>
</html>`);
};
