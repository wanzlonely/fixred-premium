module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>WALZY STORE HUB</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
  :root {
    --bg-main: #0f172a;
    --bg-card: #1e293b;
    --border-card: #334155;
    --accent-cyan: #38bdf8;
    --accent-blue: #3b82f6;
    --accent-purple: #8b5cf6;
    --accent-emerald: #10b981;
    --accent-amber: #f59e0b;
    --accent-pink: #ef4444;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; -webkit-tap-highlight-color: transparent; }
  body { background: var(--bg-main); color: var(--text-primary); min-height: 100vh; padding-bottom: 75px; }
  .header { position: sticky; top: 0; z-index: 50; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px); border-bottom: 1px solid var(--border-card); height: 60px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; }
  .brand { font-size: 18px; font-weight: 800; color: var(--accent-cyan); letter-spacing: 0.5px; }
  .container { max-width: 520px; margin: 0 auto; padding: 16px; }
  .cyber-card { background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px; padding: 16px; margin-bottom: 14px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 14px; }
  .stat-card { background: #0f172a; border: 1px solid var(--border-card); border-radius: 12px; padding: 12px; text-align: center; }
  .stat-val { font-size: 18px; font-weight: 800; color: var(--accent-cyan); }
  .stat-lbl { font-size: 11px; color: var(--text-secondary); margin-top: 4px; }
  .btn-custom { width: 100%; padding: 12px; border-radius: 10px; border: none; font-weight: 800; font-size: 13px; cursor: pointer; background: var(--accent-blue); color: #fff; text-align: center; display: block; margin-top: 8px; }
  .btn-custom:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-success { background: var(--accent-emerald); }
  .btn-danger { background: var(--accent-pink); }
  .input-custom { width: 100%; padding: 12px; border-radius: 8px; background: #0f172a; border: 1px solid var(--border-card); color: #fff; font-size: 13px; margin-top: 6px; outline: none; }
  .nav-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 60px; background: #020617; border-top: 1px solid var(--border-card); display: flex; justify-content: space-around; align-items: center; z-index: 80; }
  .nav-tab { display: flex; flex-direction: column; align-items: center; gap: 2px; color: var(--text-secondary); font-size: 11px; font-weight: 700; cursor: pointer; flex: 1; text-align: center; }
  .nav-tab.active { color: var(--accent-cyan); }
  .view { display: none; }
  .view.active { display: block; }
  .wheel-container { position: relative; width: 260px; height: 260px; margin: 16px auto; }
  .wheel-pointer { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 12px solid transparent; border-right: 12px solid transparent; border-top: 24px solid var(--accent-pink); z-index: 20; }
  #spinCanvas { width: 260px; height: 260px; border-radius: 50%; border: 4px solid var(--accent-cyan); }
  .badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; display: inline-block; }
  .badge-vip { background: var(--accent-amber); color: #000; }
  .badge-free { background: var(--text-secondary); color: #fff; }
  .product-shop-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .shop-item { background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 12px; padding: 14px; text-align: center; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
  th, td { padding: 8px; text-align: left; border-bottom: 1px solid var(--border-card); }
  th { color: var(--text-secondary); }
  .proof-preview-img { width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; margin-top: 8px; }
</style>
</head>
<body>

<div class="header">
  <div class="brand">WALZY STORE</div>
  <div id="liveBadge" class="badge badge-free">ONLINE</div>
</div>

<div class="container">
  <div id="viewUserArea">
    <div id="viewHome" class="view active">
      <div class="cyber-card" style="border-left: 4px solid var(--accent-cyan);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h2 id="uName" style="font-size:16px;">User</h2>
            <div id="uIdText" style="font-size:12px; color:var(--text-secondary);">ID: -</div>
          </div>
          <span id="uStatusBadge" class="badge badge-free">FREE</span>
        </div>
        <div style="margin-top:10px; font-size:12px; color:var(--text-secondary);">
          Rank: <b id="uRankBadge" style="color:#fff;">Beginner</b> | Premium Left: <b id="uVipLeft" style="color:#fff;">Non-Aktif</b>
        </div>
      </div>

      <div class="grid3">
        <div class="stat-card"><div class="stat-val" id="sQuota">5/5</div><div class="stat-lbl">Kuota Harian</div></div>
        <div class="stat-card"><div class="stat-val" id="sFix">0</div><div class="stat-lbl">Total Fix</div></div>
        <div class="stat-card"><div class="stat-val" id="sPoints">0</div><div class="stat-lbl">Poin</div></div>
      </div>
      <div class="grid3">
        <div class="stat-card"><div class="stat-val" id="sRefs">0</div><div class="stat-lbl">Referral</div></div>
        <div class="stat-card"><div class="stat-val" id="sStreak">0</div><div class="stat-lbl">Streak</div></div>
        <div class="stat-card"><div class="stat-val" id="sVipStatus">FREE</div><div class="stat-lbl">Status VIP</div></div>
      </div>

      <div class="cyber-card">
        <h3 style="font-size:14px; margin-bottom:6px;">Link Referral</h3>
        <input class="input-custom" id="refUrlInput" readonly onclick="this.select()">
      </div>

      <div class="cyber-card">
        <h3 style="font-size:14px; margin-bottom:6px;">Redeem Voucher</h3>
        <input class="input-custom" id="vCodeInput" placeholder="Masukkan Kode Voucher">
        <button class="btn-custom btn-success" onclick="claimVoucher()">Redeem</button>
      </div>

      <div class="cyber-card">
        <h3 style="font-size:14px; margin-bottom:6px;">Invoice & Riwayat Pembelian</h3>
        <div id="activeInvoiceBox"></div>
        <div id="historyInvoiceBox" style="margin-top:8px;"></div>
      </div>
    </div>

    <div id="viewOrder" class="view">
      <h2 style="font-size:16px; margin-bottom:12px;">Pilihan Paket VIP</h2>
      <div class="cyber-card">
        <h3>Trial 3 Hari</h3>
        <p style="font-size:18px; font-weight:bold; color:var(--accent-cyan); margin:4px 0;">Rp 7.000</p>
        <button class="btn-custom" onclick="createOrder('trial')">Beli Sekarang</button>
      </div>
      <div class="cyber-card">
        <h3>Hemat 5 Hari</h3>
        <p style="font-size:18px; font-weight:bold; color:var(--accent-cyan); margin:4px 0;">Rp 10.000</p>
        <button class="btn-custom" onclick="createOrder('hemat')">Beli Sekarang</button>
      </div>
      <div class="cyber-card">
        <h3>Starter 7 Hari</h3>
        <p style="font-size:18px; font-weight:bold; color:var(--accent-cyan); margin:4px 0;">Rp 15.000</p>
        <button class="btn-custom" onclick="createOrder('starter')">Beli Sekarang</button>
      </div>
      <div class="cyber-card">
        <h3>Pro 14 Hari</h3>
        <p style="font-size:18px; font-weight:bold; color:var(--accent-cyan); margin:4px 0;">Rp 25.000</p>
        <button class="btn-custom" onclick="createOrder('pro')">Beli Sekarang</button>
      </div>
      <div class="cyber-card" style="border: 2px solid var(--accent-amber);">
        <span class="badge badge-vip" style="float:right;">BEST</span>
        <h3>Sultan 30 Hari</h3>
        <p style="font-size:18px; font-weight:bold; color:var(--accent-amber); margin:4px 0;">Rp 40.000</p>
        <button class="btn-custom" style="background:var(--accent-amber); color:#000;" onclick="createOrder('sultan')">Beli Sekarang</button>
      </div>
    </div>

    <div id="viewDaily" class="view">
      <div class="cyber-card" style="text-align:center;">
        <h3 style="font-size:14px;">Daily Check-in</h3>
        <p style="font-size:11px; color:var(--text-secondary); margin:4px 0 10px 0;">Klaim poin harian bertingkat setiap minggunya!</p>
        <button class="btn-custom btn-success" id="checkinBtn" onclick="triggerCheckin()">Claim Check-in Harian</button>
      </div>

      <div class="cyber-card" style="text-align:center;">
        <h3 style="font-size:14px;">Spin Wheel Keberuntungan</h3>
        <div class="wheel-container">
          <div class="wheel-pointer"></div>
          <canvas id="spinCanvas" width="260" height="260"></canvas>
        </div>
        <button class="btn-custom" id="spinBtn" onclick="triggerSpin()">SPIN NOW</button>
      </div>

      <h3 style="font-size:14px; margin:14px 0 8px 0;">Toko Poin</h3>
      <div class="product-shop-grid">
        <div class="shop-item">
          <h4>+1 Kuota</h4>
          <p style="color:var(--accent-cyan); font-weight:bold;">100 PTS</p>
          <button class="btn-custom" onclick="redeemPoints('quota1')">Tukar</button>
        </div>
        <div class="shop-item">
          <h4>+3 Kuota</h4>
          <p style="color:var(--accent-cyan); font-weight:bold;">250 PTS</p>
          <button class="btn-custom" onclick="redeemPoints('quota3')">Tukar</button>
        </div>
        <div class="shop-item">
          <h4>Reset Spin</h4>
          <p style="color:var(--accent-cyan); font-weight:bold;">150 PTS</p>
          <button class="btn-custom" onclick="redeemPoints('spin')">Tukar</button>
        </div>
        <div class="shop-item">
          <h4>VIP 1 Hari</h4>
          <p style="color:var(--accent-cyan); font-weight:bold;">500 PTS</p>
          <button class="btn-custom" onclick="redeemPoints('vip1')">Tukar</button>
        </div>
        <div class="shop-item">
          <h4>VIP 3 Hari</h4>
          <p style="color:var(--accent-cyan); font-weight:bold;">1200 PTS</p>
          <button class="btn-custom" onclick="redeemPoints('vip3')">Tukar</button>
        </div>
        <div class="shop-item">
          <h4>+200 Bonus</h4>
          <p style="color:var(--accent-cyan); font-weight:bold;">300 PTS</p>
          <button class="btn-custom" onclick="redeemPoints('bonus200')">Tukar</button>
        </div>
      </div>
    </div>
  </div>

  <div id="viewOwnerArea" style="display:none;">
    <div id="oTabDashboard" class="view active">
      <div class="grid2">
        <div class="stat-card"><div class="stat-val" id="oRev">Rp 0</div><div class="stat-lbl">Revenue</div></div>
        <div class="stat-card"><div class="stat-val" id="oUsers">0</div><div class="stat-lbl">Users</div></div>
        <div class="stat-card"><div class="stat-val" id="oPending">0</div><div class="stat-lbl">Pending</div></div>
        <div class="stat-card"><div class="stat-val" id="oVip">0</div><div class="stat-lbl">VIP Users</div></div>
        <div class="stat-card"><div class="stat-val" id="oFix">0</div><div class="stat-lbl">Total Fix</div></div>
        <div class="stat-card"><div class="stat-val" id="oVoucher">0</div><div class="stat-lbl">Voucher Active</div></div>
      </div>
    </div>
    <div id="oTabUsers" class="view">
      <h3>List 30 User Terbaru</h3>
      <table>
        <thead>
          <tr><th>ID</th><th>Nama</th><th>Fix</th><th>Poin</th><th>Status</th></tr>
        </thead>
        <tbody id="oUserTable"></tbody>
      </table>
    </div>
    <div id="oTabDeposit" class="view">
      <h3>Deposit Masuk (Pending)</h3>
      <div id="oPendingList"></div>
      <h3 style="margin-top:16px;">Riwayat Lunas</h3>
      <div id="oPaidList"></div>
    </div>
    <div id="oTabVoucher" class="view">
      <div class="cyber-card">
        <h3>Buat Voucher</h3>
        <input class="input-custom" id="vGenCode" placeholder="Kode Voucher">
        <input class="input-custom" id="vGenDays" type="number" placeholder="Durasi (Hari)">
        <input class="input-custom" id="vGenQuota" type="number" placeholder="Kuota (0 = ∞)">
        <button class="btn-custom btn-success" onclick="createVoucher()">Generate Voucher</button>
      </div>
      <h3>Daftar Voucher</h3>
      <div id="oVoucherList"></div>
    </div>
    <div id="oTabBroadcast" class="view">
      <div class="cyber-card">
        <h3>Kirim Broadcast Massal</h3>
        <textarea class="input-custom" id="bcTextInput" style="height:130px; resize:none;" placeholder="Tuliskan pesan broadcast..."></textarea>
        <button class="btn-custom" onclick="sendBroadcast()">Kirim Broadcast</button>
      </div>
    </div>
  </div>
</div>

<div class="nav-bar" id="userNavBar">
  <div class="nav-tab active" onclick="switchTab('Home', event)">BERANDA</div>
  <div class="nav-tab" onclick="switchTab('Order', event)">PRODUK</div>
  <div class="nav-tab" onclick="switchTab('Daily', event)">DAILY</div>
</div>

<div class="nav-bar" id="ownerNavBar" style="display:none;">
  <div class="nav-tab active" onclick="switchOwnerTab('Dashboard', event)">DASHBOARD</div>
  <div class="nav-tab" onclick="switchOwnerTab('Users', event)">USERS</div>
  <div class="nav-tab" onclick="switchOwnerTab('Deposit', event)">DEPOSIT</div>
  <div class="nav-tab" onclick="switchOwnerTab('Voucher', event)">VOUCHER</div>
  <div class="nav-tab" onclick="switchOwnerTab('Broadcast', event)">BROADCAST</div>
</div>

<input type="file" id="proofFileInput" accept="image/*" style="display:none;" onchange="submitProofFile(event)">

<script>
  var tg = window.Telegram ? window.Telegram.WebApp : null;
  if (tg) tg.expand();
  var currentUserId = tg?.initDataUnsafe?.user?.id || '123456';
  var currentFirstName = tg?.initDataUnsafe?.user?.first_name || 'User';
  var isOwnerUser = false;
  var currentWheelRotation = 0;
  var activeInvoiceId = null;

  var wheelPrizes = ['+50 Poin', 'ZONK', '+25 Poin', '+100 Poin', '+3 Kuota', 'VIP 1H'];
  var wheelColors = ['#f59e0b', '#334155', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

  function drawWheel() {
    var canvas = document.getElementById('spinCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var numSlices = wheelPrizes.length;
    var arc = (2 * Math.PI) / numSlices;

    ctx.clearRect(0, 0, 260, 260);
    for (var i = 0; i < numSlices; i++) {
      var angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = wheelColors[i];
      ctx.moveTo(130, 130);
      ctx.arc(130, 130, 125, angle, angle + arc);
      ctx.lineTo(130, 130);
      ctx.fill();

      ctx.save();
      ctx.translate(130, 130);
      ctx.rotate(angle + arc / 2);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(wheelPrizes[i], 50, 4);
      ctx.restore();
    }
  }

  function switchTab(tabName, event) {
    document.querySelectorAll('#viewUserArea .view').forEach(function(v) { v.classList.remove('active'); });
    document.querySelectorAll('#userNavBar .nav-tab').forEach(function(t) { t.classList.remove('active'); });
    document.getElementById('view' + tabName).classList.add('active');
    if (event) event.currentTarget.classList.add('active');
    if (tabName === 'Daily') drawWheel();
  }

  function switchOwnerTab(tabName, event) {
    document.querySelectorAll('#viewOwnerArea .view').forEach(function(v) { v.classList.remove('active'); });
    document.querySelectorAll('#ownerNavBar .nav-tab').forEach(function(t) { t.classList.remove('active'); });
    document.getElementById('oTab' + tabName).classList.add('active');
    if (event) event.currentTarget.classList.add('active');
  }

  async function loadUserData(isSilent) {
    try {
      var res = await fetch('/api/api?endpoint=user&user_id=' + currentUserId + '&name=' + encodeURIComponent(currentFirstName));
      var json = await res.json();
      if (!json.status) return;
      var d = json.data;

      isOwnerUser = d.isOwner;
      if (isOwnerUser) {
        document.getElementById('viewUserArea').style.display = 'none';
        document.getElementById('userNavBar').style.display = 'none';
        document.getElementById('viewOwnerArea').style.display = 'block';
        document.getElementById('ownerNavBar').style.display = 'flex';
        loadOwnerData();
        return;
      }

      document.getElementById('uName').innerText = d.name;
      document.getElementById('uIdText').innerText = 'ID: ' + d.id;
      document.getElementById('uRankBadge').innerText = d.rank;
      document.getElementById('uVipLeft').innerText = d.premiumLeft;
      document.getElementById('sQuota').innerText = d.quota + '/5';
      document.getElementById('sFix').innerText = d.totalFix;
      document.getElementById('sPoints').innerText = d.points;
      document.getElementById('sRefs').innerText = d.referrals;
      document.getElementById('sStreak').innerText = d.streak;
      document.getElementById('sVipStatus').innerText = d.isVip ? 'VIP' : 'FREE';
      document.getElementById('refUrlInput').value = d.referralLink;

      var badge = document.getElementById('uStatusBadge');
      if (d.isVip) {
        badge.className = 'badge badge-vip';
        badge.innerText = 'VIP';
      } else {
        badge.className = 'badge badge-free';
        badge.innerText = 'FREE';
      }

      renderInvoices(d.orders, d.dana);
    } catch(e) {}
  }

  function renderInvoices(orders, dana) {
    var invBox = document.getElementById('activeInvoiceBox');
    var histBox = document.getElementById('historyInvoiceBox');
    invBox.innerHTML = '';
    histBox.innerHTML = '';

    var active = orders.find(function(o) { return o.status === 'pending' || o.status === 'waiting_approval'; });
    if (active) {
      activeInvoiceId = active.invoiceId;
      invBox.innerHTML = 
        '<div style="background:#0f172a; padding:12px; border-radius:8px; border:1px solid var(--accent-blue);">' +
          '<div><b>' + active.invoiceId + '</b> - ' + active.planName + '</div>' +
          '<div>Total: Rp ' + active.amount.toLocaleString() + '</div>' +
          '<div>Transfer DANA: <b>' + dana + '</b></div>' +
          '<div>Status: <b style="color:var(--accent-amber);">' + active.status + '</b></div>' +
          (active.proof ? '<img src="' + active.proof + '" class="proof-preview-img">' : '') +
          (active.status === 'pending' ? 
            '<button class="btn-custom btn-success" onclick="triggerUploadProof()">Upload Bukti Transfer</button>' +
            '<button class="btn-custom btn-danger" onclick="cancelOrder(\'' + active.invoiceId + '\')">Batalkan Invoice</button>' : 
            '<p style="font-size:11px; color:var(--accent-emerald); margin-top:6px;">Bukti terkirim. Menunggu verifikasi owner.</p>') +
        '</div>';
    } else {
      activeInvoiceId = null;
    }

    orders.forEach(function(o) {
      histBox.innerHTML += '<div style="font-size:12px; padding:6px 0; border-bottom:1px solid var(--border-card); display:flex; justify-content:space-between;"><span>' + o.invoiceId + ' (' + o.planName + ')</span><b>' + o.status + '</b></div>';
    });
  }

  async function createOrder(planId) {
    var res = await fetch('/api/api?endpoint=create_order', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ user_id: currentUserId, plan_id: planId })
    });
    var json = await res.json();
    if (json.status) {
      alert('Invoice berhasil dibuat!');
      switchTab('Home');
      loadUserData();
    } else {
      alert(json.message);
    }
  }

  async function cancelOrder(invoiceId) {
    var res = await fetch('/api/api?endpoint=cancel_order', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ user_id: currentUserId, invoice_id: invoiceId })
    });
    var json = await res.json();
    if (json.status) loadUserData();
  }

  function triggerUploadProof() {
    document.getElementById('proofFileInput').click();
  }

  function submitProofFile(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = async function(e) {
      var base64 = e.target.result;
      var res = await fetch('/api/api?endpoint=upload_proof', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_id: currentUserId, invoice_id: activeInvoiceId, image_base64: base64 })
      });
      var json = await res.json();
      alert(json.message);
      loadUserData();
    };
    reader.readAsDataURL(file);
  }

  async function claimVoucher() {
    var code = document.getElementById('vCodeInput').value;
    if (!code) return alert('Masukkan kode');
    var res = await fetch('/api/api?endpoint=claim_code', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ user_id: currentUserId, code: code })
    });
    var json = await res.json();
    alert(json.message);
    if (json.status) loadUserData();
  }

  async function triggerCheckin() {
    var res = await fetch('/api/api?endpoint=checkin', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ user_id: currentUserId })
    });
    var json = await res.json();
    alert(json.message);
    if (json.status) loadUserData();
  }

  async function triggerSpin() {
    var btn = document.getElementById('spinBtn');
    btn.disabled = true;
    var res = await fetch('/api/api?endpoint=spin', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ user_id: currentUserId })
    });
    var json = await res.json();
    if (!json.status) {
      alert(json.message);
      btn.disabled = false;
      return;
    }
    var prizeIdx = json.prizeIndex;
    var degreesPerSlice = 360 / wheelPrizes.length;
    var centerAngle = (prizeIdx * degreesPerSlice) + (degreesPerSlice / 2);
    var targetRotation = currentWheelRotation + (360 * 6) + (270 - centerAngle - (currentWheelRotation % 360));
    currentWheelRotation = targetRotation;

    var canvas = document.getElementById('spinCanvas');
    canvas.style.transition = 'transform 4s cubic-bezier(0.15, 0.99, 0.35, 1)';
    canvas.style.transform = 'rotate(' + targetRotation + 'deg)';

    setTimeout(function() {
      alert('Selamat! Anda mendapatkan: ' + json.prize.label);
      btn.disabled = false;
      loadUserData();
    }, 4500);
  }

  async function redeemPoints(itemKey) {
    var res = await fetch('/api/api?endpoint=redeem', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ user_id: currentUserId, item_key: itemKey })
    });
    var json = await res.json();
    alert(json.message);
    if (json.status) loadUserData();
  }

  async function loadOwnerData() {
    try {
      var res = await fetch('/api/api?endpoint=stats&owner_id=' + currentUserId);
      var json = await res.json();
      if (!json.status) return;
      var d = json.data;

      document.getElementById('oRev').innerText = 'Rp ' + d.revenue.toLocaleString();
      document.getElementById('oUsers').innerText = d.totalUsers;
      document.getElementById('oPending').innerText = d.pendingCount;
      document.getElementById('oVip').innerText = d.vipCount;
      document.getElementById('oFix').innerText = d.totalFix;
      document.getElementById('oVoucher').innerText = d.voucherCount;

      var tbody = document.getElementById('oUserTable');
      tbody.innerHTML = '';
      d.recentUsers.forEach(function(u) {
        var isVip = u.premiumUntil > Date.now();
        tbody.innerHTML += '<tr><td>' + u.id + '</td><td>' + u.name + '</td><td>' + u.totalFix + '</td><td>' + u.points + '</td><td><span style="color:' + (isVip ? '#f59e0b' : '#94a3b8') + '; font-weight:bold;">' + (isVip ? 'VIP' : 'FREE') + '</span></td></tr>';
      });

      var pendCont = document.getElementById('oPendingList');
      pendCont.innerHTML = '';
      d.pendingOrders.forEach(function(p) {
        pendCont.innerHTML += 
          '<div class="cyber-card">' +
            '<div><b>' + p.invoiceId + '</b> - ' + p.planName + ' (Rp ' + p.amount.toLocaleString() + ')</div>' +
            '<div>User ID: ' + p.userId + '</div>' +
            (p.proof ? '<img src="' + p.proof + '" class="proof-preview-img">' : '<p style="color:var(--accent-pink);">Belum upload bukti</p>') +
            '<div class="grid2" style="margin-top:8px;">' +
              '<button class="btn-custom btn-success" onclick="ownerAct(\'' + p.invoiceId + '\', \'approve\')">Setujui</button>' +
              '<button class="btn-custom btn-danger" onclick="ownerAct(\'' + p.invoiceId + '\', \'reject\')">Tolak</button>' +
            '</div>' +
          '</div>';
      });

      var paidCont = document.getElementById('oPaidList');
      paidCont.innerHTML = '';
      d.paidOrders.forEach(function(pd) {
        paidCont.innerHTML += '<div class="cyber-card"><div><b>' + pd.invoiceId + '</b> - ' + pd.planName + ' (Rp ' + pd.amount.toLocaleString() + ')</div><div style="font-size:11px; color:var(--accent-emerald);">LUNAS</div></div>';
      });

      var vList = document.getElementById('oVoucherList');
      vList.innerHTML = '';
      d.codes.forEach(function(c) {
        var isFull = c.quota !== 0 && c.used >= c.quota;
        vList.innerHTML += 
          '<div class="cyber-card" style="display:flex; justify-content:space-between; align-items:center;">' +
            '<div><b>' + c.code + '</b> (' + c.days + ' Hari)<div style="font-size:11px; color:var(--text-secondary);">Kuota: ' + c.used + '/' + (c.quota === 0 ? '∞' : c.quota) + '</div></div>' +
            '<button class="btn-custom btn-danger" style="width:auto; padding:6px 12px; margin:0;" onclick="deleteVoucher(\'' + c.code + '\')">Hapus</button>' +
          '</div>';
      });
    } catch(e) {}
  }

  async function ownerAct(invoiceId, action) {
    var res = await fetch('/api/api?endpoint=owner_action', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ owner_id: currentUserId, invoice_id: invoiceId, action: action })
    });
    var json = await res.json();
    alert(json.message);
    loadOwnerData();
  }

  async function createVoucher() {
    var code = document.getElementById('vGenCode').value;
    var days = document.getElementById('vGenDays').value;
    var quota = document.getElementById('vGenQuota').value;
    if (!code || !days) return alert('Lengkapi form');
    var res = await fetch('/api/api?endpoint=create_code', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ owner_id: currentUserId, code: code, days: days, quota: quota || 0 })
    });
    var json = await res.json();
    alert(json.message);
    loadOwnerData();
  }

  async function deleteVoucher(code) {
    var res = await fetch('/api/api?endpoint=delete_code', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ owner_id: currentUserId, code: code })
    });
    var json = await res.json();
    alert(json.message);
    loadOwnerData();
  }

  async function sendBroadcast() {
    var msg = document.getElementById('bcTextInput').value;
    if (!msg) return alert('Isi pesan');
    var res = await fetch('/api/api?endpoint=broadcast', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ owner_id: currentUserId, message: msg })
    });
    var json = await res.json();
    alert(json.message);
  }

  setInterval(function() { loadUserData(true); }, 2000);
  loadUserData();
</script>
</body>
</html>`;

  res.send(htmlContent);
};
