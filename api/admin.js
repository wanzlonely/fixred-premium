
const { loadDB } = require('../lib/utils');
module.exports = async (req, res) => {
  const db = await loadDB();
  const totalUsers = Object.keys(db.users).length;
  const premiumUsers = Object.values(db.users).filter(u=>u.premiumUntil && u.premiumUntil>Date.now()).length;
  const totalFix = db.stats.totalFix||0;
  const totalSuccess = db.stats.totalSuccess||0;
  const totalFailed = db.stats.totalFailed||0;
  const revenue = db.stats.revenue||0;
  const pendingPayments = Object.values(db.payments).filter(p=>p.status!=='paid').slice(-20);
  const recentUsers = Object.values(db.users).slice(-12).reverse();

  res.setHeader('Content-Type','text/html');
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WALZY ADMIN - Vercel</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
:root{--bg:#080a0c;--card:#111416;--card2:#191e22;--border:#232a2f;--accent:#00ff88;--accent2:#00d4ff;--text:#e8f0f2;--muted:#7a8a93;--vip:#ffcc33}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Space Grotesk',sans-serif;background:var(--bg);color:var(--text);padding:20px}
.mono{font-family:'JetBrains Mono',monospace}
.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px}
.brand{display:flex;align-items:center;gap:12px}
.brand-icon{width:42px;height:42px;background:linear-gradient(135deg,var(--accent),var(--accent2));border-radius:12px;display:grid;place-items:center;font-weight:800;color:#000;font-size:20px}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:20px}
.card{background:linear-gradient(180deg,var(--card),var(--card2));border:1px solid var(--border);border-radius:18px;padding:18px;position:relative;overflow:hidden}
.card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent)}
.card-title{font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:8px}
.card-value{font-size:28px;font-weight:800;letter-spacing:-0.03em}
.card-sub{font-size:11px;color:var(--muted);margin-top:4px}
.chart-grid{display:grid;grid-template-columns:1.2fr 0.8fr;gap:14px;margin-bottom:20px}
@media(max-width:900px){.chart-grid{grid-template-columns:1fr}}
.table{width:100%;border-collapse:collapse;font-size:13px}
.table th{font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);text-align:left;padding:10px 8px;border-bottom:1px solid var(--border)}
.table td{padding:10px 8px;border-bottom:1px solid rgba(255,255,255,0.04)}
.badge{padding:3px 8px;border-radius:100px;font-size:10px;font-weight:700}
.badge-vip{background:rgba(255,204,51,0.15);color:var(--vip);border:1px solid rgba(255,204,51,0.2)}
.badge-free{background:rgba(255,255,255,0.06);color:var(--muted)}
.badge-pending{background:rgba(255,59,92,0.12);color:#ff6b8a;border:1px solid rgba(255,59,92,0.2)}
.btn{padding:8px 14px;border-radius:10px;border:1px solid var(--border);background:rgba(255,255,255,0.05);color:var(--text);font-weight:600;font-size:12px;cursor:pointer}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#000;border:0}
</style>
</head>
<body>
<div class="header">
  <div class="brand">
    <div class="brand-icon">🦖</div>
    <div><div style="font-weight:800;font-size:18px">FIXRED WALZY <span style="color:var(--accent)">ADMIN</span></div><div class="mono" style="font-size:11px;color:var(--muted)">Vercel Manual Deposit Edition - Code Rapih</div></div>
  </div>
  <div style="display:flex;gap:8px">
    <a href="/webapp" class="btn">🌐 Mini App</a>
    <a href="/api/stats" class="btn">📊 JSON</a>
  </div>
</div>

<div class="grid">
  <div class="card"><div class="card-title">👥 Total User</div><div class="card-value mono">${totalUsers}</div><div class="card-sub">${premiumUsers} VIP aktif</div></div>
  <div class="card"><div class="card-title">🔧 Total Fix</div><div class="card-value mono">${totalFix}</div><div class="card-sub">${totalSuccess} success / ${totalFailed} failed</div></div>
  <div class="card"><div class="card-title">💰 Revenue Manual</div><div class="card-value mono">Rp ${revenue.toLocaleString('id-ID')}</div><div class="card-sub">Deposit DANA ${pendingPayments.length} pending</div></div>
  <div class="card"><div class="card-title">📡 Vercel Status</div><div class="card-value" style="font-size:18px">🟢 Webhook Aktif</div><div class="card-sub">Cron: /check tiap 2 menit</div></div>
</div>

<div class="chart-grid">
  <div class="card"><div class="card-title">📈 Statistik Fix</div><canvas id="mainChart" height="140"></canvas></div>
  <div class="card"><div class="card-title">💎 Distribusi User</div><canvas id="pieChart" height="140"></canvas></div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
  <div class="card">
    <div class="card-title">👥 12 User Terbaru - Desain Asli</div>
    <table class="table">
      <tr><th>ID</th><th>Nama</th><th>Status</th><th>Fix</th></tr>
      ${recentUsers.map(u=>{
        const isVip = u.premiumUntil && u.premiumUntil>Date.now();
        return `<tr><td class="mono">${u.id}</td><td>${(u.first_name||'User').substring(0,12)}</td><td><span class="badge ${isVip?'badge-vip':'badge-free'}">${isVip?'VIP':'FREE'}</span></td><td class="mono">${u.totalFix||0}</td></tr>`;
      }).join('')}
    </table>
  </div>
  <div class="card">
    <div class="card-title">💳 Deposit Manual Pending (Perlu Approve)</div>
    <table class="table">
      <tr><th>Invoice</th><th>User</th><th>Paket</th><th>Status</th></tr>
      ${pendingPayments.map(p=>`<tr><td class="mono">${p.invoice||Object.keys(db.payments).find(k=>db.payments[k]===p)||'INV'}</td><td class="mono">${p.userId}</td><td>${p.days} Hari<br>Rp ${p.amount}</td><td><span class="badge badge-pending">${p.status}</span></td></tr>`).join('') || '<tr><td colspan=4 style="color:var(--muted)">Tidak ada pending</td></tr>'}
    </table>
    <div style="margin-top:12px;font-size:11px;color:var(--muted)">Gunakan Telegram: /approve INVxxx atau tombol Approve di foto bukti</div>
  </div>
</div>

<div class="card" style="margin-top:14px">
  <div class="card-title">📜 Panduan Code Rapih</div>
  <div class="mono" style="font-size:11px;line-height:1.6;color:var(--muted)">
  Folder lib/ -> logic terpisah rapih:<br>
  - redis.js : Load/Save DB Upstash<br>
  - client.js : TelegramClient on-demand untuk Vercel<br>
  - helpers.js : UI.header, UI.footer, genID, getRank (desain asli)<br>
  <br>
  Folder api/ -> Serverless Functions:<br>
  - bot.js : Webhook Telegram + semua handler menu asli (Fix Merah, VIP/VVIP, Profil, Referral, Klasemen, Spin, Statistik, Mini App)<br>
  - cron/check.js : Cek balasan dari cphxfixmerahBot tiap 2 menit<br>
  - cron/notify.js : Notif expired & reset kuota<br>
  - admin.js : Dashboard ini<br>
  - webapp.js : Mini App premium<br>
  <br>
  Desain bot dikembalikan 100% seperti punya lo: header unicode bold, blockquote, footer WIB, keyboard emoji lengkap.
  </div>
</div>

<script>
new Chart(document.getElementById('mainChart'),{type:'bar',data:{labels:['Total Fix','Success','Failed','VIP'],datasets:[{label:'Stats',data:[${totalFix},${totalSuccess},${totalFailed},${premiumUsers}],backgroundColor:['#00ff88','#00d4ff','#ff3b5c','#ffcc33'],borderRadius:8}]},options:{plugins:{legend:{display:false}},scales:{y:{grid:{color:'rgba(255,255,255,0.06)'},ticks:{color:'#7a8a93'}},x:{grid:{display:false},ticks:{color:'#7a8a93'}}}}});
new Chart(document.getElementById('pieChart'),{type:'doughnut',data:{labels:['FREE','VIP'],datasets:[{data:[${totalUsers-premiumUsers},${premiumUsers}],backgroundColor:['#232a2f','#ffcc33']}]},options:{plugins:{legend:{labels:{color:'#7a8a93'}}}}});
setInterval(()=>location.reload(),30000);
</script>
</body>
</html>`);
};
