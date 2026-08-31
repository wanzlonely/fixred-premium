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
    padding-bottom: 90px;
    overflow-x: hidden;
  }

  /* SVG ANIMATIONS */
  .icon-svg { width: 22px; height: 22px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; transition: all 0.3s ease; }
  .pulse { animation: pulseAnim 2s infinite; }
  .float { animation: floatAnim 3s ease-in-out infinite; }
  .spin-slow { animation: spinAnim 8s linear infinite; }
  .glow-box { box-shadow: 0 0 20px rgba(59, 130, 246, 0.25); }

  @keyframes pulseAnim { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(0.96); } }
  @keyframes floatAnim { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  @keyframes spinAnim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  /* HEADER UI */
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

  /* CONTAINER & CARDS */
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

  /* USER BADGE & USER INFO */
  .user-badge {
    display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 700; background: rgba(59, 130, 246, 0.15); color: var(--accent-blue);
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
  .stat-card {
    background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px; padding: 16px;
    display: flex; flex-direction: column; gap: 6px; position: relative;
  }
  .stat-val { font-size: 22px; font-weight: 800; color: #fff; }
  .stat-lbl { font-size: 12px; color: var(--text-secondary); }

  /* BUTTONS & INPUTS */
  .btn-custom {
    width: 100%; padding: 14px; border-radius: 14px; border: none; font-weight: 700; font-size: 14px;
    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s ease; background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
    color: #fff; box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  }
  .btn-custom:active { transform: scale(0.97); }

  .input-custom {
    width: 100%; padding: 14px; border-radius: 14px; background: rgba(255,255,255,0.05);
    border: 1px solid var(--border-card); color: #fff; outline: none; font-size: 13px;
    transition: all 0.3s ease;
  }
  .input-custom:focus { border-color: var(--accent-blue); box-shadow: 0 0 12px rgba(59,130,246,0.25); }

  /* NAVIGATION BAR */
  .nav-bar {
    position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
    width: calc(100% - 32px); max-width: 440px; background: rgba(13, 18, 30, 0.88);
    backdrop-filter: blur(20px); border: 1px solid var(--border-card); border-radius: 24px;
    display: flex; justify-content: space-around; padding: 8px; z-index: 80;
    box-shadow: 0 12px 32px rgba(0,0,0,0.5);
  }
  .nav-tab {
    display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 12px;
    border-radius: 16px; color: var(--text-secondary); text-decoration: none; font-size: 10px; font-weight: 700;
    cursor: pointer; transition: all 0.3s ease;
  }
  .nav-tab.active { color: #fff; background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2)); border: 1px solid rgba(59,130,246,0.3); }

  /* VIEWS */
  .view { display: none; opacity: 0; transform: translateY(10px); transition: all 0.3s ease; }
  .view.active { display: block; opacity: 1; transform: translateY(0); }

  /* TOAST NOTIFICATION */
  .toast {
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%) translateY(-100px);
    width: calc(100% - 40px); max-width: 380px; background: var(--bg-card); backdrop-filter: blur(20px);
    border: 1px solid var(--accent-blue); border-radius: 16px; padding: 14px 18px; z-index: 100;
    display: flex; align-items: center; gap: 12px; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  }
  .toast.show { transform: translateX(-50%) translateY(0); }

  /* LOADING OVERLAY */
  .loader-screen {
    position: fixed; inset: 0; background: var(--bg-main); z-index: 99;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;
  }
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
          <div style="display:flex;gap:6px;margin-top:4px">
            <span class="user-badge" id="uRankBadge">BASIC</span>
            <span class="user-badge" id="uStatusBadge" style="color:var(--accent-purple);border-color:rgba(139,92,246,0.3)">Gratis</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid2">
      <div class="stat-card">
        <svg class="icon-svg" style="color:var(--accent-blue)" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <div class="stat-val" id="sOrders">0</div>
        <div class="stat-lbl">Total Pesanan</div>
      </div>
      <div class="stat-card">
        <svg class="icon-svg" style="color:var(--accent-purple)" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <div class="stat-val" id="sRefs">0</div>
        <div class="stat-lbl">Pengguna Referral</div>
      </div>
    </div>

    <div class="glass-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-weight:700;font-size:14px;display:flex;align-items:center;gap:8px">
          <svg class="icon-svg spin-slow" style="color:var(--accent-amber)" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Spin Hadiah Harian
        </div>
      </div>
      <button class="btn-custom" id="spinBtn" onclick="triggerSpin()">
        <svg class="icon-svg" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Putar Wheel Hadiah
      </button>
    </div>
  </div>

  <div id="viewOrder" class="view">
    <div style="font-weight:800;font-size:18px;margin-bottom:6px">Pilih Paket VIP</div>
    <div style="font-size:12px;color:var(--text-secondary);margin-bottom:14px">Akses fitur tanpa batas dengan kecepatan prioritas</div>

    <div class="glass-card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700;font-size:15px">Paket Starter 7 Hari</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">Akses VIP 7 Hari + Kuota Unlimited</div>
        </div>
        <div style="font-weight:800;font-size:16px;color:var(--accent-blue)">Rp 15.000</div>
      </div>
      <button class="btn-custom" style="margin-top:14px;padding:10px" onclick="createOrder(7, 15000)">Pesan Sekarang</button>
    </div>

    <div class="glass-card" style="border-color:rgba(139,92,246,0.3)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:700;font-size:15px">Paket Sultan 30 Hari</div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">Akses VIP 30 Hari Full Support + VIP Rank</div>
        </div>
        <div style="font-weight:800;font-size:16px;color:var(--accent-purple)">Rp 45.000</div>
      </div>
      <button class="btn-custom" style="margin-top:14px;padding:10px;background:linear-gradient(135deg, var(--accent-purple), #ec4899)" onclick="createOrder(30, 45000)">Pesan Sekarang</button>
    </div>
  </div>

  <div id="viewRef" class="view">
    <div class="glass-card">
      <div style="font-weight:700;font-size:14px;margin-bottom:8px">Tautan Referral Anda</div>
      <input class="input-custom" id="refUrlInput" readonly value="Memuat link...">
      <button class="btn-custom" style="margin-top:10px" onclick="copyRefLink()">
        <svg class="icon-svg" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Salin Link Referral
      </button>
    </div>

    <div class="glass-card">
      <div style="font-weight:700;font-size:14px;margin-bottom:8px">Redeem Voucher Promo</div>
      <input class="input-custom" id="vCodeInput" placeholder="Masukkan Kode Voucher (cth: SULTAN77)">
      <button class="btn-custom" style="margin-top:10px;background:linear-gradient(135deg, var(--accent-emerald), #059669)" onclick="claimVoucher()">
        Klaim Voucher VIP
      </button>
    </div>
  </div>

  <div id="viewOwner" class="view">
    <div id="ownerLoginBox" class="glass-card">
      <div style="font-weight:800;font-size:16px;margin-bottom:12px;text-align:center">OWNER STUDIO AUTH</div>
      <input type="password" class="input-custom" id="ownerPassInput" placeholder="Masukkan Password Owner">
      <button class="btn-custom" style="margin-top:12px" onclick="verifyOwner()">Verifikasi Akses</button>
    </div>

    <div id="ownerContent" style="display:none">
      <div class="grid2">
        <div class="stat-card">
          <div class="stat-val" id="oRev">Rp 0</div>
          <div class="stat-lbl">Total Revenue</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" id="oUsers">0</div>
          <div class="stat-lbl">Total Users</div>
        </div>
      </div>
    </div>
  </div>

</div>

<div class="nav-bar">
  <div class="nav-tab active" onclick="switchTab('Home')">
    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    Home
  </div>
  <div class="nav-tab" onclick="switchTab('Order')">
    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
    Beli VIP
  </div>
  <div class="nav-tab" onclick="switchTab('Ref')">
    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    Referral
  </div>
  <div class="nav-tab" onclick="switchTab('Owner')">
    <svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    Studio
  </div>
</div>

<script>
  let tg = window.Telegram ? window.Telegram.WebApp : null;
  if(tg) { tg.ready(); tg.expand(); }

  let currentUserId = null;

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
        document.getElementById('uRankBadge').textContent = u.rank.name;
        document.getElementById('uStatusBadge').textContent = u.isPremium ? 'VIP (' + u.premiumLeftDays + 'H)' : 'Gratis (' + u.dailyFixRemaining + '/3)';
        document.getElementById('sOrders').textContent = u.totalFix;
        document.getElementById('sRefs').textContent = u.referralCount;
        document.getElementById('refUrlInput').value = u.referralLink;

        document.getElementById('loader').style.display = 'none';
      } else {
        showToast('Error', data.message);
      }
    } catch(e) {
      showToast('Error', 'Gagal memuat data dari server');
    }
  }

  function switchTab(tabName) {
    if(tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
    
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));

    document.getElementById('view' + tabName).classList.add('active');
    event.currentTarget.classList.add('active');
  }

  function showToast(title, msg) {
    let t = document.getElementById('toast');
    document.getElementById('toastTitle').textContent = title;
    document.getElementById('toastMsg').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  }

  async function triggerSpin() {
    try {
      let res = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId })
      });
      let data = await res.json();
      showToast(data.ok ? 'Selamat!' : 'Informasi', data.message);
      if(data.ok) loadUserData();
    } catch(e) {
      showToast('Error', 'Gagal memproses spin');
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
      if(data.ok) {
        showToast('Invoice Dibuat', 'Invoice: ' + data.invoice.invoice);
      } else {
        showToast('Gagal', data.message);
      }
    } catch(e) {
      showToast('Error', 'Gagal membuat invoice');
    }
  }

  async function claimVoucher() {
    let code = document.getElementById('vCodeInput').value.trim();
    if(!code) return showToast('Peringatan', 'Masukkan kode voucher!');

    try {
      let res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUserId, code })
      });
      let data = await res.json();
      showToast(data.ok ? 'Sukses' : 'Gagal', data.message);
      if(data.ok) {
        document.getElementById('vCodeInput').value = '';
        loadUserData();
      }
    } catch(e) {
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
    try {
      let res = await fetch('/api/verify_owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner_id: currentUserId, password: pass })
      });
      let data = await res.json();
      if(data.ok) {
        document.getElementById('ownerLoginBox').style.display = 'none';
        document.getElementById('ownerContent').style.display = 'block';
        showToast('Akses Diterima', 'Selamat datang Owner!');
      } else {
        showToast('Akses Ditolak', data.message);
      }
    } catch(e) {
      showToast('Error', 'Gagal verifikasi owner');
    }
  }

  window.onload = initApp;
</script>
</body>
</html>`);
};
