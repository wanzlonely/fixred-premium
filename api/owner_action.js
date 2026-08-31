module.exports = async (req, res) => {
  const { loadDB, saveDB } = require('../lib/utils');
  const config = require('../config');
  const OWNER_PASSWORD = 'SUPER777';
  function isOwner(id){
    return config.OWNER_IDS.map(String).includes(String(id));
  }
  function isSuspiciousId(id){
    const s = String(id);
    const n = Number(id);
    if(!n || n <= 0) return true;
    if(s.startsWith('-')) return true;
    return false;
  }
  function ensureDB(db){
    if(!db.users) db.users = {};
    if(!db.payments) db.payments = {};
    if(!db.stats) db.stats = { totalFix:0, totalSuccess:0, totalFailed:0, revenue:0, revenueHistory:[], lastReset: Date.now() };
    if(db.stats.revenue === undefined) db.stats.revenue = 0;
    if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
    if(!db.stats.lastReset) db.stats.lastReset = Date.now();
  }
  try{
    const db = await loadDB();
    ensureDB(db);
    if(req.method !== 'POST'){
      return res.status(405).json({ ok:false, message:'Method not allowed' });
    }
    const body = req.body || {};
    const ownerId = String(body.owner_id || body.ownerId || '');
    const action = body.action;
    const invoice = body.invoice;
    const password = body.password;
    if(!ownerId || !isOwner(ownerId)){
      return res.status(403).json({ ok:false, message:'Bukan owner' });
    }
    if(password !== OWNER_PASSWORD){
      return res.status(403).json({ ok:false, message:'Password SUPER777 salah - Keamanan tingkat tinggi' });
    }
    if(action === 'reset_revenue'){
      const old = db.stats.revenue || 0;
      db.stats.revenueHistory.push({ date: new Date().toISOString(), amount: -old, invoice: 'RESET', userId: 'SYSTEM', note: 'Reset via webapp SUPER777 - Sistem canggih' });
      db.stats.revenue = 0;
      db.stats.lastReset = Date.now();
      await saveDB(db);
      return res.json({ ok:true, message: `Revenue reset dari Rp ${old.toLocaleString('id-ID')} ke 0 - Sistem canggih`, revenue: 0 });
    }
    if(!invoice){
      return res.json({ ok:false, message:'Invoice kosong' });
    }
    const pay = db.payments[invoice];
    if(!pay){
      return res.json({ ok:false, message:'Invoice tidak ditemukan' });
    }
    if(isSuspiciousId(pay.userId)){
      delete db.payments[invoice];
      await saveDB(db);
      return res.json({ ok:false, message:'Invoice user tidak valid - Dihapus sistem keamanan' });
    }
    if(action === 'approve'){
      if(pay.status === 'paid'){
        return res.json({ ok:false, message:'Sudah approved sebelumnya' });
      }
      pay.status = 'paid';
      const k = String(pay.userId);
      if(!db.users[k]){
        db.users[k] = { id: pay.userId, first_name: 'User', totalFix:0, dailyFix:{ date: '', count:0 }, premiumUntil:0 };
      }
      const u = db.users[k];
      u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + pay.days * 86400000;
      u.pendingDeposit = null;
      u.notifiedExp = false;
      u.notifiedExp2 = false;
      db.stats.revenue = (db.stats.revenue || 0) + pay.amount;
      db.stats.revenueHistory.push({ date: new Date().toISOString(), amount: pay.amount, invoice, userId: pay.userId, days: pay.days });
      if(db.stats.revenueHistory.length > 300) db.stats.revenueHistory = db.stats.revenueHistory.slice(-300);
      await saveDB(db);
      try{
        const bot = new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
        await bot.sendMessage(pay.userId, `PEMBAYARAN DISETUJUI - WALZY STORE\nDeposit ${invoice} disetujui\nPaket: ${pay.days} Hari Premium\nNominal: Rp ${pay.amount.toLocaleString()}\nAktif sampai: ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}\n\nWebApp akan otomatis menampilkan VIP aktif - Notifikasi realtime - Halaman pembelian owner terupdate`);
      }catch{}
      return res.json({ ok:true, message: `${invoice} approved - Notifikasi terkirim ke user via bot dan webapp akan sync realtime - Halaman pembelian owner terupdate`, revenue: db.stats.revenue });
    }
    if(action === 'reject'){
      pay.status = 'rejected';
      const u = db.users[String(pay.userId)];
      if(u) u.pendingDeposit = null;
      await saveDB(db);
      try{
        const bot = new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
        await bot.sendMessage(pay.userId, `PEMBAYARAN DITOLAK - WALZY STORE\nDeposit ${invoice} ditolak\nHubungi admin untuk detail - Sistem penanganan keluhan aktif`);
      }catch{}
      return res.json({ ok:true, message: `${invoice} rejected - User dinotifikasi` });
    }
    return res.json({ ok:false, message:'Action tidak dikenal' });
  }catch(e){
    return res.status(500).json({ ok:false, message:e.message });
  }
};
