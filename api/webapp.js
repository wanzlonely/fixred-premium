module.exports = async (req, res) => {
  res.setHeader('Content-Type','text/html');
  res.send(`<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>WALZY STORE</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#f5f7fb;--card:#fff;--border:#e8ebf2;--border2:#eef0f7;--text:#111827;--muted:#6b7280;--blue:#0a7cff;--blue2:#6a5cff;--blue-light:#eef4ff;--green:#10b981;--red:#ef4444;--shadow:0 4px 24px rgba(0,0,0,0.06);--radius:16px;--radius2:20px}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.mono{font-family:'JetBrains Mono',monospace}
.header{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.9);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);height:64px;display:flex;align-items:center;justify-content:space-between;padding:0 20px}
.brand{display:flex;align-items:center;gap:10px}
.brand-icon{width:40px;height:40px;border-radius:12px;background:linear-gradient(135deg,var(--blue),var(--blue2));display:grid;place-items:center;color:#fff;font-weight:800;box-shadow:0 8px 20px rgba(10,124,255,0.25)}
.brand-text{font-weight:800;font-size:18px}
.live{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:600}
.live-dot{width:8px;height:8px;background:var(--green);border-radius:50%;animation:pulse 1.5s infinite}
.container{max-width:720px;margin:0 auto;padding:20px 16px 110px}
.card{background:var(--card);border-radius:var(--radius2);border:1px solid var(--border);box-shadow:var(--shadow);margin-bottom:16px;overflow:hidden;animation:slideUp 0.4s both}
.card-h{padding:16px 20px;border-bottom:1px solid var(--border2);display:flex;justify-content:space-between;align-items:center}
.card-t{font-size:14px;font-weight:700}
.card-b{padding:16px 20px}
.avatar{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#e0e7ff,#dbeafe);border:1px solid #c7d2fe;display:grid;place-items:center;font-weight:800;font-size:24px;color:var(--blue)}
.badge{display:inline-flex;padding:6px 12px;border-radius:100px;font-size:12px;font-weight:700}
.badge-blue{background:var(--blue-light);color:var(--blue)}
.badge-vip{background:#fef3c7;color:#92400e}
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.stat{padding:16px;border-radius:16px;background:#fff;border:1px solid var(--border)}
.stat-v{font-size:22px;font-weight:800}
.stat-l{font-size:11px;color:var(--muted);text-transform:uppercase;margin-top:6px;font-weight:600}
.btn{width:100%;padding:12px 16px;border-radius:12px;border:1px solid var(--border);background:#fff;font-weight:600;font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:all 0.2s}
.btn-primary{background:linear-gradient(135deg,var(--blue),var(--blue2));color:#fff;border:0;box-shadow:0 8px 20px rgba(10,124,255,0.25)}
.btn:disabled{opacity:0.5}
.input{width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--border);font-size:14px;outline:none;font-family:inherit}
.input:focus{border-color:var(--blue);box-shadow:0 0 0 4px var(--blue-light)}
.pkg{display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--border2)}
.pkg:last-child{border-bottom:0}
.nav{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.92);backdrop-filter:blur(20px);border:1px solid var(--border);display:flex;gap:6px;padding:8px;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.12);z-index:90;max-width:360px;width:calc(100% - 32px)}
.nav-item{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;border-radius:14px;cursor:pointer;color:var(--muted);font-size:11px;font-weight:600;transition:all 0.2s}
.nav-item.active{background:linear-gradient(135deg,var(--blue),var(--blue2));color:#fff;box-shadow:0 8px 20px rgba(10,124,255,0.25)}
.owner-tab{display:flex;gap:8px;overflow-x:auto;padding-bottom:8px}
.tab{padding:8px 16px;border-radius:100px;background:#fff;border:1px solid var(--border);font-size:13px;font-weight:600;white-space:nowrap;cursor:pointer;color:var(--muted)}
.tab.active{background:var(--text);color:#fff}
.table{width:100%;border-collapse:collapse;font-size:13px}
.table th{font-size:11px;color:var(--muted);text-align:left;padding:10px 12px;border-bottom:1px solid var(--border2);text-transform:uppercase}
.table td{padding:10px 12px;border-bottom:1px solid var(--border2)}
.square-toast{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.9);width:300px;background:#fff;border-radius:20px;box-shadow:0 30px 80px rgba(0,0,0,0.2);padding:24px;display:none;flex-direction:column;align-items:center;text-align:center;z-index:400;opacity:0;transition:all 0.3s}
.square-toast.show{display:flex;transform:translate(-50%,-50%) scale(1);opacity:1}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%{transform:scale(1)}50%{transform:scale(1.2)}100%{transform:scale(1)}}
</style>
</head>
<body>
<div class="square-toast" id="squareToast"><div id="squareIcon" style="width:56px;height:56px;border-radius:16px;background:#eef4ff;display:grid;place-items:center;margin-bottom:12px">✅</div><div style="font-weight:700" id="squareTitle">Berhasil</div><div style="font-size:13px;color:var(--muted);margin-top:6px" id="squareMsg">Ok</div><button class="btn btn-primary" style="margin-top:16px;width:auto;padding:8px 20px" onclick="hideToast()">Tutup</button></div>
<div class="header"><div class="brand"><div class="brand-icon">W</div><div class="brand-text">walzy store</div></div><div class="live"><span class="live-dot"></span><span id="time">--:--</span></div></div>

<div class="container" id="ownerLogin" style="display:none">
  <div class="card" style="max-width:360px;margin:80px auto"><div class="card-b" style="text-align:center;padding:28px 20px"><div style="width:64px;height:64px;margin:0 auto 16px;background:linear-gradient(135deg,var(--blue),var(--blue2));border-radius:18px;display:grid;place-items:center;color:#fff">🔒</div><div style="font-size:18px;font-weight:800">Owner Access</div><div style="font-size:13px;color:var(--muted);margin-top:6px">Keamanan tingkat tinggi - Password tidak ditampilkan</div><input type="password" id="ownerPass" class="input" placeholder="••••••••" style="margin-top:20px;text-align:center;letter-spacing:0.4em"><button class="btn btn-primary" style="margin-top:12px" onclick="unlockOwner()">Masuk</button><button class="btn" style="margin-top:8px" onclick="backToUser()">Kembali</button></div></div>
</div>

<div class="container" id="userView" style="display:none">
  <div class="card"><div class="card-b"><div style="display:flex;gap:16px;align-items:center"><div class="avatar" id="avatar">?</div><div style="flex:1"><div style="font-size:18px;font-weight:700" id="name">Memuat...</div><div class="mono" style="font-size:12px;color:var(--muted)" id="uid">ID: -</div><div id="badges" style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap"></div></div></div><div style="margin-top:14px;height:8px;background:#eef2f7;border-radius:100px;overflow:hidden"><div id="limitBar" style="height:100%;background:linear-gradient(90deg,var(--blue),var(--blue2));width:0%"></div></div><div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px;color:var(--muted)"><span>Batas harian</span><span id="limitText">-</span></div></div></div>
  <div class="stat-grid"><div class="stat"><div class="stat-v" id="myFix">-</div><div class="stat-l">Pesanan Saya</div></div><div class="stat"><div class="stat-v" id="globalFix">-</div><div class="stat-l">Global</div></div><div class="stat"><div class="stat-v" id="refCount">-</div><div class="stat-l">Referral</div></div><div class="stat"><div class="stat-v" id="successRate">-</div><div class="stat-l">Sukses</div></div></div>
  <div class="card" style="margin-top:16px"><div class="card-h"><div class="card-t">🎁 Hadiah Harian</div><div style="font-size:11px;color:var(--muted)" id="spinLast">-</div></div><div class="card-b" style="text-align:center"><div style="width:64px;height:64px;margin:0 auto;background:#fef3c7;border-radius:16px;display:grid;place-items:center">🎁</div><div style="margin-top:10px;font-weight:600" id="spinStatus">-</div><button class="btn btn-primary" style="margin-top:12px" id="spinBtn" onclick="doSpin()">Putar Sekarang</button></div></div>
  <div class="card"><div class="card-h"><div class="card-t">Paket Premium</div></div><div class="card-b" style="padding:0 20px"><div class="pkg"><div><b>1 Hari</b><div style="font-size:12px;color:var(--muted)">Rp 2.000</div></div><button class="btn btn-primary" style="width:auto" onclick="buyPackage(1)">Beli</button></div><div class="pkg"><div><b>5 Hari</b> <span style="background:#fef3c7;padding:2px 8px;border-radius:100px;font-size:11px;font-weight:700">Populer</span><div style="font-size:12px;color:var(--muted)">Rp 5.000</div></div><button class="btn btn-primary" style="width:auto" onclick="buyPackage(5)">Beli</button></div><div class="pkg"><div><b>10 Hari</b><div style="font-size:12px;color:var(--muted)">Rp 10.000</div></div><button class="btn btn-primary" style="width:auto" onclick="buyPackage(10)">Beli</button></div><div class="pkg"><div><b>30 Hari</b><div style="font-size:12px;color:var(--muted)">Rp 60.000</div></div><button class="btn btn-primary" style="width:auto" onclick="buyPackage(30)">Beli</button></div></div><div id="invoiceBox" style="display:none;margin:12px 20px;padding:12px;background:#eef4ff;border-radius:12px;font-size:13px"></div></div>
</div>

<div class="container" id="userOrderView" style="display:none">
  <div class="card"><div class="card-h"><div class="card-t">🛒 Order - Beli Akses Premium</div><div style="font-size:11px;color:var(--muted)">Transaksi rapih</div></div><div class="card-b" style="padding:0"><div id="userTransSteps" style="padding:12px 20px"></div></div></div>
  <div class="card"><div class="card-h"><div class="card-t">Riwayat Pembelian</div></div><div id="userTransHistory">Memuat...</div></div>
  <div class="card"><div class="card-h"><div class="card-t">Kode Voucher</div></div><div class="card-b"><div style="display:flex;gap:8px"><input id="redeemInput" class="input" placeholder="Kode voucher"><button class="btn btn-primary" style="width:auto" onclick="doRedeem()">Tukar</button></div></div></div>
  <div class="card"><div class="card-h"><div class="card-t">Undang Teman</div></div><div class="card-b"><div style="background:#f5f7fb;padding:10px;border-radius:10px;font-size:13px;word-break:break-all" id="refLink">-</div><button class="btn" style="margin-top:10px" onclick="copyRef()">Salin Tautan</button></div></div>
</div>

<div class="container" id="ownerView" style="display:none">
  <div class="card" style="background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;border:0"><div class="card-b"><div style="display:flex;align-items:center;gap:12px"><div style="width:48px;height:48px;background:rgba(255,255,255,0.1);border-radius:14px;display:grid;place-items:center">👑</div><div><div style="font-weight:700">Panel Owner - Super Lengkap</div><div style="font-size:12px;opacity:0.6">Beda 360° dari user - Full fitur</div></div><button class="btn" style="width:auto;margin-left:auto;background:rgba(255,255,255,0.1);color:#fff;border:0" onclick="lockOwner()">Keluar</button></div></div></div>
  <div class="owner-tab" style="margin-bottom:16px"><div class="tab active" data-tab="dash" onclick="switchOwnerTab('dash')">Dashboard</div><div class="tab" data-tab="users" onclick="switchOwnerTab('users')">Pengguna</div><div class="tab" data-tab="trans" onclick="switchOwnerTab('trans')">Transaksi</div><div class="tab" data-tab="voucher" onclick="switchOwnerTab('voucher')">Voucher</div><div class="tab" data-tab="broadcast" onclick="switchOwnerTab('broadcast')">Siaran</div></div>
  <div id="ownerDash"><div class="stat-grid"><div class="stat"><div class="stat-v" id="oUsers">-</div><div class="stat-l">Pengguna Valid</div></div><div class="stat"><div class="stat-v" id="oPremium">-</div><div class="stat-l">VIP Aktif</div></div><div class="stat"><div class="stat-v" id="oFix">-</div><div class="stat-l">Total Pesanan</div></div><div class="stat" style="background:#eef4ff;border-color:#bfdbfe"><div class="stat-v" id="oToday" style="color:var(--blue)">-</div><div class="stat-l">Pesanan Hari Ini</div></div></div><div class="card" style="margin-top:16px"><div class="card-h"><div class="card-t">Ringkasan</div></div><div class="card-b" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;padding-top:0"><div style="background:#f8fafc;padding:12px;border-radius:12px"><div style="font-size:11px;color:var(--muted)">SUKSES</div><div style="font-size:18px;font-weight:700;color:var(--green)" id="oSuccess">-</div></div><div style="background:#f8fafc;padding:12px;border-radius:12px"><div style="font-size:11px;color:var(--muted)">GAGAL</div><div style="font-size:18px;font-weight:700;color:var(--red)" id="oFailed">-</div></div><div style="background:#f8fafc;padding:12px;border-radius:12px"><div style="font-size:11px;color:var(--muted)">MENUNGGU ACC</div><div style="font-size:18px;font-weight:700" id="oPending">-</div></div><div style="background:#f8fafc;padding:12px;border-radius:12px"><div style="font-size:11px;color:var(--muted)">RASIO</div><div style="font-size:18px;font-weight:700" id="oRate">-</div></div></div></div></div>
  <div id="ownerUsers" style="display:none"><div class="card"><div class="card-h"><div class="card-t">Pengguna - Real-time Anti Double</div></div><table class="table" id="userTable"><tr><th>ID</th><th>Nama</th><th>Status</th><th>Pesanan</th></tr></table></div></div>
  <div id="ownerTrans" style="display:none"><div class="card"><div class="card-h"><div class="card-t">Menunggu ACC - Proses Rapih</div></div><div id="queueBox">Memuat...</div></div><div class="card"><div class="card-h"><div class="card-t">Pembelian Terbaru</div></div><div id="purchaseBox">Memuat...</div></div></div>
  <div id="ownerVoucher" style="display:none"><div class="card"><div class="card-h"><div class="card-t">Buat Voucher - Hadiah Akses</div></div><div class="card-b"><div style="display:grid;gap:12px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><input id="voucherCode" class="input" placeholder="Kode WALZY2024"><input id="voucherDays" class="input" type="number" placeholder="Hari"></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><input id="voucherQuota" class="input" type="number" placeholder="Kuota orang"><select id="voucherType" class="input"><option value="public">Publik</option><option value="private">Private Sekali Pakai</option></select></div><button class="btn btn-primary" onclick="createVoucher()">Buat Voucher</button></div></div></div><div class="card"><div class="card-h"><div class="card-t">Daftar Voucher</div></div><div id="voucherList">Memuat...</div></div></div>
  <div id="ownerBroadcast" style="display:none"><div class="card"><div class="card-h"><div class="card-t">Siaran</div></div><div class="card-b"><textarea id="broadcastText" class="input" rows="4" placeholder="Tulis pesan siaran..."></textarea><button class="btn btn-primary" style="margin-top:12px" onclick="sendBroadcast()">Kirim Siaran</button></div></div></div>
</div>

<div class="nav">
  <div class="nav-item active" id="navHome" onclick="switchTab('home')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg><span>Beranda</span></div>
  <div class="nav-item" id="navOrder" onclick="switchTab('order')"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg><span>Order</span></div>
  <div class="nav-item" id="navBack" onclick="goBack()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg><span>Kembali</span></div>
</div>

<script>
const tg = window.Telegram ? window.Telegram.WebApp : null;
if(tg){ tg.ready(); tg.expand(); }
const tgUser = tg && tg.initDataUnsafe ? tg.initDataUnsafe.user : null;
const OWNER_IDS = ${JSON.stringify(require('../config').OWNER_IDS.map(String))};
const BOT_USERNAME = ${JSON.stringify(require('../config').BOT_USERNAME || 'fixedredbot')};
const OWNER_PASSWORD = 'SUPER777';
let userId = tgUser ? String(tgUser.id) : (new URLSearchParams(location.search).get('user_id') || null);
let isOwnerUser = userId && OWNER_IDS.includes(userId);
let currentTab = 'home';
let ownerSubTab = 'dash';
let lastKnownPremium = null;
let currentInvoice = null;

function showToast(title, msg, type){
  document.getElementById('squareTitle').textContent = title;
  document.getElementById('squareMsg').textContent = msg;
  document.getElementById('squareToast').classList.add('show');
  setTimeout(()=>hideToast(), 3500);
}
function hideToast(){ document.getElementById('squareToast').classList.remove('show'); }
function updateTime(){
  try{ document.getElementById('time').textContent = new Date().toLocaleString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit'}) + ' WIB'; }catch{}
}
setInterval(updateTime,60000);updateTime();
function isOwnerAuthed(){ try{ return localStorage.getItem('owner_auth_v2') === OWNER_PASSWORD; }catch{ return false; } }
function unlockOwner(){
  const v = document.getElementById('ownerPass').value.trim();
  if(v === OWNER_PASSWORD){
    try{ localStorage.setItem('owner_auth_v2', OWNER_PASSWORD); }catch{}
    document.getElementById('ownerLogin').style.display='none';
    document.getElementById('ownerView').style.display='block';
    showToast('Berhasil','Panel owner terbuka','success');
    loadOwnerData();
  }else{
    showToast('Gagal','Kata sandi salah','error');
    document.getElementById('ownerPass').value='';
  }
}
function lockOwner(){ try{ localStorage.removeItem('owner_auth_v2'); }catch{} document.getElementById('ownerView').style.display='none'; document.getElementById('ownerLogin').style.display='block'; }
function backToUser(){ document.getElementById('ownerLogin').style.display='none'; document.getElementById('userView').style.display='block'; loadUser(); }
function goBack(){ if(tg) tg.close(); else history.back(); }
function switchTab(tab){
  currentTab = tab;
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  if(tab==='home') document.getElementById('navHome').classList.add('active');
  else if(tab==='order') document.getElementById('navOrder').classList.add('active');
  else document.getElementById('navBack').classList.add('active');
  document.getElementById('userView').style.display='none';
  document.getElementById('userOrderView').style.display='none';
  document.getElementById('ownerView').style.display='none';
  document.getElementById('ownerLogin').style.display='none';
  if(isOwnerUser && isOwnerAuthed()){
    document.getElementById('ownerView').style.display='block';
    if(tab==='home'){ switchOwnerTab('dash'); }
    else if(tab==='order'){ switchOwnerTab('trans'); }
  }else{
    if(tab==='home'){ document.getElementById('userView').style.display='block'; loadUser(); }
    else if(tab==='order'){ document.getElementById('userOrderView').style.display='block'; loadUserTransactions(); }
    else{ goBack(); }
  }
}
function switchOwnerTab(sub){
  ownerSubTab = sub;
  document.querySelectorAll('.owner-tab .tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.owner-tab .tab').forEach(t=>{ if(t.dataset.tab===sub) t.classList.add('active'); });
  document.getElementById('ownerDash').style.display = sub==='dash' ? 'block' : 'none';
  document.getElementById('ownerUsers').style.display = sub==='users' ? 'block' : 'none';
  document.getElementById('ownerTrans').style.display = sub==='trans' ? 'block' : 'none';
  document.getElementById('ownerVoucher').style.display = sub==='voucher' ? 'block' : 'none';
  document.getElementById('ownerBroadcast').style.display = sub==='broadcast' ? 'block' : 'none';
}
function dedupUsers(users){
  const map=new Map();
  for(let u of users){
    const idNum=Number(u.id);
    if(!idNum||idNum<=0) continue;
    if(String(u.id).startsWith('-')) continue;
    const name=(u.first_name||'').trim();
    if(!name) continue;
    const key=name.toLowerCase();
    if(key.includes('exploit') && (u.totalFix||0)===0 && (u.referralCount||0)===0) continue;
    if(!map.has(key)) map.set(key,u);
    else{
      const ex=map.get(key);
      if((u.totalFix||0)+(u.referralCount||0) > (ex.totalFix||0)+(ex.referralCount||0)) map.set(key,u);
    }
  }
  return Array.from(map.values());
}
async function apiFetch(path, opts){
  const url = path + (path.includes('?') ? '&' : '?') + 'user_id=' + (userId||'');
  const r = await fetch(url, opts);
  const j = await r.json();
  if(!r.ok) throw new Error(j.message||'Error');
  return j;
}
async function loadUser(){
  if(!userId){
    document.getElementById('userView').style.display='block';
    document.getElementById('name').textContent='Buka via Telegram';
    return;
  }
  if(isOwnerUser){
    if(isOwnerAuthed()){
      document.getElementById('ownerView').style.display='block';
      return loadOwnerData();
    }else{
      document.getElementById('ownerLogin').style.display='block';
      return;
    }
  }
  try{
    const data = await apiFetch('/api/user');
    if(!data.ok) return;
    const u=data.user; const g=data.global;
    if(lastKnownPremium===false && u.isPremium) showToast('Premium Aktif','Paket aktif','success');
    lastKnownPremium=u.isPremium;
    document.getElementById('name').textContent=u.first_name;
    document.getElementById('uid').textContent='ID: '+u.id;
    document.getElementById('avatar').textContent=u.first_name.charAt(0).toUpperCase();
    document.getElementById('badges').innerHTML='<span class="badge badge-blue">'+u.rank.name+'</span>' + (u.isPremium ? '<span class="badge badge-vip">VIP '+u.premiumLeft+' hari</span>' : '<span class="badge" style="background:#e4e6eb">Gratis</span>');
    document.getElementById('limitBar').style.width = u.isPremium ? '100%' : Math.min(100,(u.dailyFix.used/3)*100)+'%';
    document.getElementById('limitText').textContent = u.isPremium ? 'Tak terbatas' : u.dailyFix.used+'/3';
    document.getElementById('myFix').textContent=u.totalFix;
    document.getElementById('globalFix').textContent=g.totalFix;
    document.getElementById('refCount').textContent=u.referralCount;
    document.getElementById('successRate').textContent = g.totalFix ? Math.round((g.totalSuccess/g.totalFix)*100)+'%' : '0%';
    document.getElementById('spinLast').textContent = u.lastSpin ? 'Terakhir: '+u.lastSpin : 'Belum pernah';
    document.getElementById('spinStatus').textContent = u.canSpin ? 'Siap diklaim' : 'Sudah diklaim';
    document.getElementById('spinBtn').disabled = !u.canSpin;
    document.getElementById('spinBtn').textContent = u.canSpin ? 'Putar Sekarang' : 'Sudah Diklaim';
    const botUser = ${JSON.stringify(require('../config').BOT_USERNAME || 'fixedredbot')};
    document.getElementById('refLink').textContent = 'https://t.me/'+botUser+'?start='+u.id;
  }catch(e){ console.error(e); }
}
async function loadUserTransactions(){
  if(!userId) return;
  try{
    const data = await apiFetch('/api/user');
    if(!data.ok) return;
    const u=data.user; const inv=data.currentInvoice;
    let html='';
    html+='<div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border2)"><div style="width:28px;height:28px;border-radius:8px;background:'+(u.isPremium?'#dcfce7':'#f1f5f9')+';display:grid;place-items:center">1</div><div><div style="font-weight:600">Pilih Paket</div><div style="font-size:12px;color:var(--muted)">1H 2k, 5H 5k, 10H 10k, 30H 60k</div></div></div>';
    html+='<div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border2)"><div style="width:28px;height:28px;border-radius:8px;background:'+(inv?'#dcfce7':'#f1f5f9')+';display:grid;place-items:center">2</div><div><div style="font-weight:600">Invoice</div><div style="font-size:12px;color:var(--muted)">'+(inv?inv.id:'Belum ada')+'</div></div></div>';
    html+='<div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border2)"><div style="width:28px;height:28px;border-radius:8px;background:'+(data.hasProof?'#dcfce7':(inv?'#0a7cff':'#f1f5f9'))+';color:'+(inv?'#fff':'#000')+';display:grid;place-items:center">3</div><div><div style="font-weight:600">Upload Bukti</div><div style="font-size:12px;color:var(--muted)">Kirim foto bukti</div></div></div>';
    html+='<div style="display:flex;gap:12px;padding:12px 0"><div style="width:28px;height:28px;border-radius:8px;background:'+(u.isPremium?'#dcfce7':'#f1f5f9')+';display:grid;place-items:center">4</div><div><div style="font-weight:600">ACC Owner</div><div style="font-size:12px;color:var(--muted)">'+(u.isPremium?'Disetujui':'Maks 24 jam')+'</div></div></div>';
    document.getElementById('userTransSteps').innerHTML=html;
    const invoices=data.invoices||[];
    const histEl=document.getElementById('userTransHistory');
    if(invoices.length===0) histEl.innerHTML='<div style="padding:20px;text-align:center;color:var(--muted)">Belum ada</div>';
    else histEl.innerHTML=invoices.map(i=>'<div style="display:flex;justify-content:space-between;padding:12px 20px;border-bottom:1px solid var(--border2)"><div><div style="font-weight:600">'+i.id+'</div><div style="font-size:12px;color:var(--muted)">'+i.days+' hari | Rp '+(i.amount||0).toLocaleString('id-ID')+'</div></div><div style="font-size:12px;font-weight:600;color:'+(i.status==='paid'?'var(--green)':'var(--muted)')+'">'+i.status+'</div></div>').join('');
  }catch(e){}
}
async function loadOwnerData(){
  if(!userId) return;
  try{
    const data = await apiFetch('/api/stats');
    if(!data.ok || !data.isOwner) return;
    const recent=dedupUsers(data.recentUsers||[]);
    const pending=(data.pendingPayments||[]).filter(p=>Number(p.userId)>0);
    document.getElementById('oUsers').textContent=data.usersValid||recent.length;
    document.getElementById('oPremium').textContent=data.premium;
    document.getElementById('oFix').textContent=data.totalFix;
    document.getElementById('oToday').textContent=data.todayOrders||pending.length;
    document.getElementById('oSuccess').textContent=data.totalSuccess||0;
    document.getElementById('oFailed').textContent=data.totalFailed||0;
    document.getElementById('oPending').textContent=pending.length;
    document.getElementById('oRate').textContent=data.totalFix ? Math.round((data.totalSuccess/data.totalFix)*100)+'%' : '0%';
    document.getElementById('userTable').innerHTML='<tr><th>ID</th><th>Nama</th><th>Status</th><th>Pesanan</th></tr>'+recent.map(u=>'<tr><td>'+u.id+'</td><td>'+(u.first_name||'User').substring(0,12)+'</td><td>'+(u.isPremium?'VIP':'Free')+'</td><td>'+u.totalFix+'</td></tr>').join('');
    const qBox=document.getElementById('queueBox');
    if(pending.length===0) qBox.innerHTML='<div style="padding:20px;text-align:center;color:var(--muted)">Tidak ada antrean</div>';
    else qBox.innerHTML=pending.map(p=>'<div style="padding:12px 20px;border-bottom:1px solid var(--border2)"><div style="display:flex;justify-content:space-between"><b>'+p.invoice+'</b><span style="background:#fef3c7;padding:2px 8px;border-radius:100px;font-size:11px">'+p.status+'</span></div><div style="font-size:12px;color:var(--muted);margin-top:4px">User: '+p.userId+' | '+p.days+'H | Rp '+(p.amount||0).toLocaleString('id-ID')+'</div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-primary" style="padding:8px" onclick="ownerAction(\\''+p.invoice+'\\',\\'approve\\')">Setujui</button><button class="btn" style="padding:8px" onclick="ownerAction(\\''+p.invoice+'\\',\\'reject\\')">Tolak</button></div></div>').join('');
    const pBox=document.getElementById('purchaseBox');
    const paid=(data.paidPayments||[]).slice(0,10);
    if(paid.length===0) pBox.innerHTML='<div style="padding:20px;text-align:center;color:var(--muted)">Belum ada</div>';
    else pBox.innerHTML=paid.map(p=>'<div style="display:flex;justify-content:space-between;padding:12px 20px;border-bottom:1px solid var(--border2)"><div><div style="font-weight:600">'+p.invoice+'</div><div style="font-size:12px;color:var(--muted)">User '+p.userId+' | '+p.days+'H</div></div><div style="color:var(--green);font-weight:600">PAID</div></div>').join('');
    const vList=document.getElementById('voucherList');
    const codes=data.codes||[];
    if(codes.length===0) vList.innerHTML='<div style="padding:20px;text-align:center;color:var(--muted)">Belum ada voucher</div>';
    else vList.innerHTML=codes.map(c=>'<div style="display:flex;justify-content:space-between;padding:12px 20px;border-bottom:1px solid var(--border2)"><div><div style="font-weight:600">'+c.code+'</div><div style="font-size:12px;color:var(--muted)">'+c.days+' hari | Kuota: '+(c.quota||'∞')+' | Pakai: '+(c.used||0)+'</div></div><button class="btn" style="width:auto;padding:6px 12px" onclick="deleteVoucher(\\''+c.code+'\\')">Hapus</button></div>').join('');
  }catch(e){ console.error(e); }
}
async function ownerAction(inv,act){
  try{
    const r=await fetch('/api/owner_action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,action:act,invoice:inv,password:OWNER_PASSWORD})});
    const d=await r.json();
    showToast(act==='approve'?'Disetujui':'Ditolak',d.message,act==='approve'?'success':'error');
    loadOwnerData();
  }catch(e){ showToast('Error',e.message,'error'); }
}
async function createVoucher(){
  const code=document.getElementById('voucherCode').value.trim().toUpperCase();
  const days=parseInt(document.getElementById('voucherDays').value);
  const quota=parseInt(document.getElementById('voucherQuota').value)||0;
  const type=document.getElementById('voucherType').value;
  if(!code||!days) return showToast('Gagal','Isi kode dan hari','error');
  try{
    const r=await fetch('/api/create_code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,code,days,quota,type,password:OWNER_PASSWORD})});
    const d=await r.json();
    if(d.ok){ showToast('Berhasil','Voucher '+code+' dibuat','success'); document.getElementById('voucherCode').value=''; document.getElementById('voucherDays').value=''; document.getElementById('voucherQuota').value=''; loadOwnerData(); }
    else showToast('Gagal',d.message,'error');
  }catch(e){ showToast('Error',e.message,'error'); }
}
async function deleteVoucher(code){
  try{
    const r=await fetch('/api/delete_code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,code,password:OWNER_PASSWORD})});
    const d=await r.json();
    if(d.ok){ showToast('Dihapus','Voucher '+code+' dihapus','success'); loadOwnerData(); }
    else showToast('Gagal',d.message,'error');
  }catch(e){ showToast('Error',e.message,'error'); }
}
async function sendBroadcast(){
  const text=document.getElementById('broadcastText').value.trim();
  if(!text) return showToast('Gagal','Isi pesan','error');
  try{
    const r=await fetch('/api/broadcast',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({owner_id:userId,text,password:OWNER_PASSWORD})});
    const d=await r.json();
    if(d.ok){ showToast('Terkirim','Ke '+d.sent+' pengguna','success'); document.getElementById('broadcastText').value=''; }
    else showToast('Gagal',d.message,'error');
  }catch(e){ showToast('Error',e.message,'error'); }
}
async function doSpin(){
  if(!userId) return;
  const btn=document.getElementById('spinBtn');
  btn.disabled=true; btn.textContent='Memutar...';
  try{
    const r=await fetch('/api/spin?user_id='+userId,{method:'POST'});
    const d=await r.json();
    if(d.ok){ showToast('Hadiah',d.reward.label,'success'); loadUser(); }
    else{ showToast('Info',d.message,'error'); btn.disabled=d.alreadySpun; btn.textContent=d.alreadySpun?'Sudah Diklaim':'Putar'; }
  }catch(e){ showToast('Error',e.message,'error'); btn.disabled=false; }
}
async function buyPackage(days){
  if(!userId) return;
  try{
    const r=await fetch('/api/deposit?user_id='+userId+'&days='+days,{method:'POST'});
    const d=await r.json();
    if(d.ok){
      currentInvoice=d.invoice.id;
      const box=document.getElementById('invoiceBox');
      box.style.display='block';
      box.innerHTML='Invoice: '+d.invoice.id+'<br>Total: '+(d.invoice.amountFormatted||'')+'<br><br><div style="position:relative"><button class="btn btn-primary">Unggah Bukti</button><input type="file" accept="image/*" onchange="handleProofUpload(event)" style="position:absolute;inset:0;opacity:0"></div><div id="uploadStatus" style="margin-top:8px;font-size:12px;color:var(--muted)"></div>';
      showToast('Invoice Dibuat',d.invoice.id,'success');
      switchTab('order');
    }else showToast('Gagal',d.message,'error');
  }catch(e){ showToast('Error',e.message,'error'); }
}
function handleProofUpload(evt){
  const file=evt.target.files[0];
  if(!file||!currentInvoice) return;
  const statusEl=document.getElementById('uploadStatus');
  statusEl.textContent='Mengompresi...';
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement('canvas');
      const maxDim=1024;
      let w=img.width,h=img.height;
      if(w>h&&w>maxDim){ h=h*maxDim/w; w=maxDim; } else if(h>maxDim){ w=w*maxDim/h; h=maxDim; }
      canvas.width=w; canvas.height=h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      const base64=canvas.toDataURL('image/jpeg',0.7);
      uploadProof(base64,statusEl);
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
}
async function uploadProof(base64,statusEl){
  statusEl.textContent='Mengunggah...';
  try{
    const r=await fetch('/api/upload_proof',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:userId,invoice:currentInvoice,image_base64:base64})});
    const d=await r.json();
    if(d.ok){ statusEl.textContent='Terkirim - Menunggu ACC'; showToast('Terkirim','Menunggu persetujuan','success'); }
    else{ statusEl.textContent=d.message; showToast('Gagal',d.message,'error'); }
  }catch(e){ statusEl.textContent=e.message; }
}
function doRedeem(){
  const code=document.getElementById('redeemInput').value.trim().toUpperCase();
  if(!code) return showToast('Gagal','Masukkan kode','error');
  fetch('/api/redeem?user_id='+userId+'&code='+code,{method:'POST'}).then(r=>r.json()).then(d=>{
    if(d.ok){ showToast('Berhasil','Voucher ditukar','success'); loadUser(); }
    else showToast('Gagal',d.message,'error');
  });
}
function copyRef(){
  const txt=document.getElementById('refLink')?.textContent||'';
  if(!txt||txt.includes('Memuat')) return;
  if(navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>showToast('Disalin','Tautan disalin','success'));
}
document.getElementById('ownerPass').addEventListener('keypress',e=>{ if(e.key==='Enter') unlockOwner(); });
loadUser();
setInterval(()=>{
  if(isOwnerUser && isOwnerAuthed()) loadOwnerData();
  else{
    if(currentTab==='order') loadUserTransactions();
    else if(currentTab==='home') loadUser();
  }
},3000);
</script>
</body>
</html>`);
};
