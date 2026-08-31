const { loadDB, saveDB } = require('../lib/utils');
const { getTodayString, genInvoiceID, isValidNumber } = require('../lib/utils');
const { sendToTarget } = require('../lib/client');
const config = require('../config');

const OWNER_PASSWORD = 'SUPER777';
function isOwner(id){ return config.OWNER_IDS.map(String).includes(String(id)); }
function isSuspiciousId(id){ const s=String(id); const n=Number(id); if(!n||n<=0) return true; if(s.startsWith('-')) return true; return false; }
function getUniqueUsers(usersObj){
  const map=new Map();
  for(let u of Object.values(usersObj||{})){
    if(isSuspiciousId(u.id)) continue;
    const name=(u.first_name||'').trim();
    if(!name) continue;
    const lower=name.toLowerCase();
    if(lower.includes('exploit') && (u.totalFix||0)===0 && (u.referralCount||0)===0) continue;
    if(!map.has(lower)) map.set(lower,u);
    else{
      const ex=map.get(lower);
      if((u.totalFix||0)+(u.referralCount||0) > (ex.totalFix||0)+(ex.referralCount||0)) map.set(lower,u);
    }
  }
  return Array.from(map.values());
}
function isPremium(u){ return u && u.premiumUntil && u.premiumUntil>Date.now(); }
function getRank(count){
  if(count>=100) return {name:'SULTAN',icon:'👑'};
  if(count>=50) return {name:'DIAMOND',icon:'💎'};
  if(count>=20) return {name:'GOLD',icon:'🥇'};
  if(count>=10) return {name:'SILVER',icon:'🥈'};
  if(count>=5) return {name:'BRONZE',icon:'🥉'};
  return {name:'BASIC',icon:'🌱'};
}

module.exports = async (req, res) => {
  const url = req.url || '';
  const method = req.method;
  const query = req.query || {};
  const body = req.body || {};

  try{
    const db = await loadDB();
    if(!db.users) db.users={};
    if(!db.payments) db.payments={};
    if(!db.codes) db.codes={};
    if(!db.stats) db.stats={ totalFix:0, totalSuccess:0, totalFailed:0, revenue:0, revenueHistory:[], lastReset:Date.now() };
    if(!db.history) db.history={};

    for(let k of Object.keys(db.users)){ if(isSuspiciousId(k)) delete db.users[k]; }
    for(let k of Object.keys(db.payments)){ const p=db.payments[k]; if(p && isSuspiciousId(p.userId)) delete db.payments[k]; }

    if(url.includes('/api/user')){
      const userId = query.user_id || body.user_id;
      if(!userId) return res.status(400).json({ok:false,message:'user_id required'});
      if(isSuspiciousId(userId)) return res.json({ok:false,message:'User tidak valid'});
      let user = db.users[String(userId)];
      if(!user) return res.json({ok:false,message:'User tidak ditemukan'});
      const isPremiumUser = isPremium(user);
      const premiumLeft = isPremiumUser ? Math.ceil((user.premiumUntil-Date.now())/86400000) : null;
      if(!user.dailyFix || user.dailyFix.date!==getTodayString()) user.dailyFix={date:getTodayString(),count:0};
      const canSpin = !user.lastSpin || user.lastSpin!==getTodayString();
      const invoices = Object.values(db.payments).filter(p=>String(p.userId)===String(userId)).sort((a,b)=>b.createdAt-a.createdAt);
      const currentInvoice = invoices.find(p=>p.status==='waiting_payment' || p.status==='waiting_proof' || p.status==='waiting_approval') || null;
      const hasProof = currentInvoice && currentInvoice.status==='waiting_approval';
      const global = { totalFix:db.stats.totalFix||0, totalSuccess:db.stats.totalSuccess||0, totalFailed:db.stats.totalFailed||0 };
      const rank = getRank(user.referralCount||0);
      const userData = {
        id:user.id,
        first_name:user.first_name,
        username:user.username,
        joinedAt:user.joinedAt,
        referralCount:user.referralCount||0,
        totalFix:user.totalFix||0,
        dailyFix:{ used:user.dailyFix.count, remaining: isPremiumUser ? 999 : Math.max(0,3-user.dailyFix.count), date:user.dailyFix.date },
        isPremium:isPremiumUser,
        premiumLeft,
        rank,
        canSpin,
        lastSpin:user.lastSpin||null,
        history:db.history[String(userId)]||[]
      };
      return res.json({ok:true,user:userData,global,currentInvoice,hasProof,invoices,pendingInvoice:currentInvoice});
    }

    if(url.includes('/api/stats')){
      const userId = query.user_id || body.user_id;
      if(!userId) return res.status(400).json({ok:false,message:'user_id required'});
      const isOwnerUser = isOwner(userId);
      const unique=getUniqueUsers(db.users);
      const premiumCount=unique.filter(u=>isPremium(u)).length;
      const allPayments=Object.values(db.payments||{});
      const pending=allPayments.filter(p=>p.status==='waiting_approval' && !isSuspiciousId(p.userId));
      const paid=allPayments.filter(p=>p.status==='paid' && !isSuspiciousId(p.userId));
      const todayOrders=allPayments.filter(p=>{
        if(isSuspiciousId(p.userId)) return false;
        const d=new Date(p.createdAt); const now=new Date();
        return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
      }).length;
      const codesList=[];
      for(let k of Object.keys(db.codes)){
        const v=db.codes[k];
        if(typeof v==='object' && v.code) codesList.push(v);
        else if(typeof v==='number') codesList.push({code:k,days:v,quota:0,used:0,createdAt:Date.now(),type:'legacy'});
        else codesList.push({code:k,days:v.days||0,quota:v.quota||0,used:v.used||0,createdAt:v.createdAt||Date.now(),type:v.type||'public'});
      }
      return res.json({
        ok:true,
        isOwner:isOwnerUser,
        users:Object.keys(db.users).length,
        usersValid:unique.length,
        premium:premiumCount,
        totalFix:db.stats.totalFix||0,
        totalSuccess:db.stats.totalSuccess||0,
        totalFailed:db.stats.totalFailed||0,
        todayOrders,
        paidToday:paid.filter(p=>{ const d=new Date(p.createdAt); const now=new Date(); return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); }).length,
        pendingPayments:pending,
        paidPayments:isOwnerUser ? paid.slice(-20).reverse() : [],
        recentUsers:isOwnerUser ? unique.slice(-20).reverse() : [],
        codes:isOwnerUser ? codesList.slice(-20) : [],
        revenue:isOwnerUser ? db.stats.revenue||0 : undefined,
        timestamp:Date.now()
      });
    }

    if(url.includes('/api/deposit')){
      const userId = query.user_id || body.user_id;
      const days = parseInt(query.days || body.days);
      if(!userId) return res.status(400).json({ok:false,message:'user_id required'});
      if(isSuspiciousId(userId)) return res.json({ok:false,message:'User tidak valid'});
      if(!days || ![1,5,10,30].includes(days)) return res.json({ok:false,message:'Paket tidak valid'});
      const amountMap={1:2000,5:5000,10:10000,30:60000};
      const amount=amountMap[days];
      const invoice=genInvoiceID();
      db.payments[invoice]={ userId, days, amount, status:'waiting_payment', createdAt:Date.now(), proofFileId:null };
      await saveDB(db);
      return res.json({ok:true,invoice:{ id:invoice, days, amount, amountFormatted:'Rp '+amount.toLocaleString('id-ID'), transferTo:{ bank:config.DANA_NAME, number:config.DANA_NUMBER } }});
    }

    if(url.includes('/api/upload_proof')){
      const userId = body.user_id;
      const invoice = body.invoice;
      const imageBase64 = body.image_base64;
      if(!userId || !invoice) return res.json({ok:false,message:'user_id dan invoice required'});
      const pay=db.payments[invoice];
      if(!pay) return res.json({ok:false,message:'Invoice tidak ditemukan'});
      if(String(pay.userId)!==String(userId)) return res.json({ok:false,message:'Bukan invoice Anda'});
      pay.proofFileId = imageBase64 ? 'base64_uploaded' : pay.proofFileId;
      pay.status='waiting_approval';
      if(db.users[String(userId)]) db.users[String(userId)].pendingDeposit=null;
      try{
        const bot = new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
        for(let oid of config.OWNER_IDS){
          await bot.sendMessage(oid, `📩 Deposit Baru\n🧾 ${invoice}\n👤 ${userId}\n💎 ${pay.days}H - Rp ${pay.amount.toLocaleString()}\nStatus: Menunggu ACC - Cek webapp owner`, {parse_mode:'HTML'});
        }
      }catch(e){}
      await saveDB(db);
      return res.json({ok:true,message:'Bukti terkirim - Menunggu ACC owner'});
    }

    if(url.includes('/api/spin')){
      const userId = query.user_id || body.user_id;
      if(!userId) return res.status(400).json({ok:false,message:'user_id required'});
      const user=db.users[String(userId)];
      if(!user) return res.json({ok:false,message:'User tidak ditemukan'});
      const today=getTodayString();
      if(user.lastSpin===today) return res.json({ok:false,message:'Sudah spin hari ini',alreadySpun:true});
      const rewards=[{label:'Bonus 1 Pesanan',desc:'+1 batas hari ini'},{label:'VIP 1 Hari',desc:'Gratis 1 hari'},{label:'5 Poin Referral',desc:'Bonus'}];
      const reward=rewards[Math.floor(Math.random()*rewards.length)];
      user.lastSpin=today;
      if(reward.label.includes('VIP')) user.premiumUntil=Math.max(Date.now(),user.premiumUntil||0)+86400000;
      await saveDB(db);
      return res.json({ok:true,message:'Spin berhasil',reward});
    }

    if(url.includes('/api/redeem')){
      const userId = query.user_id || body.user_id;
      const code = (query.code || body.code || '').toUpperCase().trim();
      if(!userId) return res.status(400).json({ok:false,message:'user_id required'});
      if(!code) return res.json({ok:false,message:'Kode kosong'});
      const c=db.codes[code];
      if(!c) return res.json({ok:false,message:'Kode tidak valid'});
      const days=typeof c==='object' ? c.days : c;
      const quota=typeof c==='object' ? (c.quota||0) : 0;
      const used=typeof c==='object' ? (c.used||0) : 0;
      if(quota>0 && used>=quota) return res.json({ok:false,message:`Kode habis ${used}/${quota}`});
      const user=db.users[String(userId)];
      if(!user) return res.json({ok:false,message:'User tidak ditemukan'});
      user.premiumUntil=Math.max(Date.now(),user.premiumUntil||0)+days*86400000;
      if(typeof c==='object'){
        c.used=(c.used||0)+1;
        if(c.type==='private' && quota===1) delete db.codes[code];
      }else{
        delete db.codes[code];
      }
      await saveDB(db);
      return res.json({ok:true,message:`VIP ${days} Hari aktif`});
    }

    if(url.includes('/api/create_code')){
      const ownerId=String(body.owner_id||'');
      const password=body.password;
      const code=(body.code||'').toUpperCase().trim();
      const days=parseInt(body.days);
      const quota=parseInt(body.quota)||0;
      const type=body.type||'public';
      if(!ownerId || !isOwner(ownerId)) return res.status(403).json({ok:false,message:'Bukan owner'});
      if(password!==OWNER_PASSWORD) return res.status(403).json({ok:false,message:'Password salah'});
      if(!code || !days || days<=0) return res.json({ok:false,message:'Isi kode dan hari'});
      if(db.codes[code]) return res.json({ok:false,message:'Kode sudah ada'});
      db.codes[code]={code,days,quota,used:0,createdAt:Date.now(),type,createdBy:ownerId};
      await saveDB(db);
      return res.json({ok:true,message:`Voucher ${code} dibuat`});
    }

    if(url.includes('/api/delete_code')){
      const ownerId=String(body.owner_id||'');
      const password=body.password;
      const code=(body.code||'').toUpperCase().trim();
      if(!ownerId || !isOwner(ownerId)) return res.status(403).json({ok:false,message:'Bukan owner'});
      if(password!==OWNER_PASSWORD) return res.status(403).json({ok:false,message:'Password salah'});
      if(!db.codes[code]) return res.json({ok:false,message:'Kode tidak ditemukan'});
      delete db.codes[code];
      await saveDB(db);
      return res.json({ok:true,message:`Voucher ${code} dihapus`});
    }

    if(url.includes('/api/broadcast')){
      const ownerId=String(body.owner_id||'');
      const password=body.password;
      const text=(body.text||'').trim();
      if(!ownerId || !isOwner(ownerId)) return res.status(403).json({ok:false,message:'Bukan owner'});
      if(password!==OWNER_PASSWORD) return res.status(403).json({ok:false,message:'Password salah'});
      if(!text) return res.json({ok:false,message:'Teks kosong'});
      const unique=getUniqueUsers(db.users);
      let sent=0, failed=0;
      const bot = new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
      for(let u of unique){
        try{ await bot.sendMessage(u.id, `📢 <b>Siaran Walzy Store</b>\n\n${text}\n\n🚀 walzy`, {parse_mode:'HTML'}); sent++; }catch{ failed++; }
        await new Promise(r=>setTimeout(r,80));
      }
      return res.json({ok:true,sent,failed,message:`Terkirim ke ${sent} pengguna`});
    }

    if(url.includes('/api/owner_action')){
      const ownerId=String(body.owner_id||'');
      const password=body.password;
      const action=body.action;
      const invoice=body.invoice;
      if(!ownerId || !isOwner(ownerId)) return res.status(403).json({ok:false,message:'Bukan owner'});
      if(password!==OWNER_PASSWORD) return res.status(403).json({ok:false,message:'Password salah'});
      const pay=db.payments[invoice];
      if(!pay) return res.json({ok:false,message:'Invoice tidak ditemukan'});
      if(action==='approve'){
        if(pay.status==='paid') return res.json({ok:false,message:'Sudah lunas'});
        pay.status='paid';
        const u=db.users[String(pay.userId)];
        if(!u) return res.json({ok:false,message:'User tidak ditemukan'});
        u.premiumUntil=Math.max(Date.now(),u.premiumUntil||0)+pay.days*86400000;
        if(u) u.pendingDeposit=null;
        db.stats.revenue=(db.stats.revenue||0)+pay.amount;
        if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory=[];
        db.stats.revenueHistory.push({date:new Date().toISOString(),amount:pay.amount,invoice,userId:pay.userId});
        await saveDB(db);
        try{
          const bot = new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
          await bot.sendMessage(pay.userId, `✅ <b>Disetujui</b>\nDeposit ${invoice} disetujui\nPaket ${pay.days} Hari sampai ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}\n\n🚀 walzy`, {parse_mode:'HTML'});
        }catch(e){}
        return res.json({ok:true,message:`${invoice} disetujui - Notifikasi persegi terkirim`});
      }else if(action==='reject'){
        pay.status='rejected';
        const u=db.users[String(pay.userId)];
        if(u) u.pendingDeposit=null;
        await saveDB(db);
        try{
          const bot = new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
          await bot.sendMessage(pay.userId, `❌ <b>Ditolak</b>\nDeposit ${invoice} ditolak\n\n🚀 walzy`, {parse_mode:'HTML'});
        }catch(e){}
        return res.json({ok:true,message:`${invoice} ditolak`});
      }else{
        return res.json({ok:false,message:'Action tidak valid'});
      }
    }

    return res.status(404).json({ok:false,message:'Endpoint tidak ditemukan: '+url});
  }catch(e){
    console.error(e);
    return res.status(500).json({ok:false,message:e.message});
  }
};
