const TelegramBot = require('node-telegram-bot-api');
const { loadDB, saveDB, getTodayString, genInvoiceID, getRank } = require('../lib/utils');
const config = require('../config');
const rateCache = new Map();

function isOwner(id){
  try{
    if(config && config.OWNER_IDS) return config.OWNER_IDS.map(String).includes(String(id));
  }catch(e){}
  return false;
}

function isSuspiciousId(id){
  if(!id) return true;
  const s=String(id);
  const n=Number(id);
  if(!n || n<=0 || s.startsWith('-') || s.length>20 || s.includes('.')) return true;
  return false;
}

function getUniqueUsers(usersObj){
  const map=new Map();
  for(let u of Object.values(usersObj||{})){
    if(!u || isSuspiciousId(u.id)) continue;
    map.set(String(u.id),u);
  }
  return Array.from(map.values());
}

function isPremium(u){
  return u && u.premiumUntil && u.premiumUntil>Date.now();
}

function checkRate(ip){
  const now=Date.now();
  const key=ip||'unknown';
  const entry=rateCache.get(key);
  if(!entry){
    rateCache.set(key,{count:1,ts:now});
    return true;
  }
  if(now-entry.ts>60000){
    rateCache.set(key,{count:1,ts:now});
    return true;
  }
  if(entry.count>120) return false;
  entry.count++;
  return true;
}

function ensureUserInDB(db, userId, nameData, usernameData){
  const k=String(userId);
  if(!db.users[k]){
    db.users[k]={
      id:Number(userId)||userId,
      first_name:nameData||'User',
      username:usernameData||'',
      joinedAt:Date.now(),
      referralCount:0,
      referrals:[],
      referredBy:null,
      totalFix:0,
      dailyFix:{date:getTodayString(),count:0},
      premiumUntil:0,
      lastSpin:null,
      points:0,
      checkinStreak:0,
      lastCheckin:null
    };
  }else{
    if(nameData && db.users[k].first_name!==nameData) db.users[k].first_name=nameData;
    if(usernameData!==undefined && db.users[k].username!==usernameData) db.users[k].username=usernameData;
  }
  if(Array.isArray(db.users[k].referrals)){
    db.users[k].referralCount=db.users[k].referrals.length;
  }
  const userPaidInvoices=Object.values(db.payments||{}).filter(p=>String(p.userId)===k && (p.status==='paid' || p.status==='approved'));
  db.users[k].totalFix=userPaidInvoices.length;
  return db.users[k];
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
  
  if(req.method==='OPTIONS') return res.status(200).json({ok:true});
  
  const clientIp=req.headers['x-forwarded-for']||req.headers['x-real-ip']||'unknown';
  if(!checkRate(clientIp)) return res.status(200).json({ok:false,message:'Batas Permintaan Terlampaui'});
  
  const fullUrl=req.url||'';
  const queryString=fullUrl.includes('?') ? fullUrl.split('?').slice(1).join('?') : '';
  const parsedParams=new URLSearchParams(queryString);
  const query={};
  
  for(const [k,v] of parsedParams.entries()) query[k]=v;
  if(req.query) Object.assign(query, req.query);
  
  let body=req.body||{};
  if(typeof body==='string'){
    try{ body=JSON.parse(body); }catch(e){ body={}; }
  }
  
  const endpoint=query.endpoint||body.endpoint||'';
  
  try{
    const db=await loadDB();
    if(!db.users) db.users={};
    if(!db.payments) db.payments={};
    if(!db.codes) db.codes={};
    if(!db.stats) db.stats={totalFix:0,totalSuccess:0,totalFailed:0,revenue:0,revenueHistory:[],lastReset:Date.now()};
    
    if(endpoint==='user'){
      const userId=query.user_id||body.user_id;
      const firstName=query.first_name||body.first_name||null;
      const userName=query.username||body.username||null;
      
      if(!userId || isSuspiciousId(userId)){
        return res.status(200).json({ok:false, message:'User ID Invalid'});
      }
      
      let user=ensureUserInDB(db,userId,firstName,userName);
      const isPrem=isPremium(user);
      const premiumLeft=isPrem ? Math.ceil((user.premiumUntil-Date.now())/86400000) : 0;
      
      if(!user.dailyFix || user.dailyFix.date!==getTodayString()){
        user.dailyFix={date:getTodayString(),count:0};
      }
      
      const canSpin=!user.lastSpin || user.lastSpin!==getTodayString();
      const canCheckin=!user.lastCheckin || user.lastCheckin!==getTodayString();
      const rankInfo=getRank(user.referralCount||0);
      const userInvoices=Object.values(db.payments).filter(p=>String(p.userId)===String(userId));
      const activeInvoice=userInvoices.find(p=>p.status==='pending' || p.status==='waiting_approval' || p.status==='waiting_payment')||null;
      const remainingQuota=isPrem ? 'Unlimited ♾️' : `${Math.max(0,5-(user.dailyFix.count||0))}/5`;
      
      await saveDB(db);
      
      return res.status(200).json({
        ok:true,
        user:{
          id:user.id,
          first_name:user.first_name||'User',
          username:user.username||'',
          referralCount:user.referralCount||0,
          totalFix:user.totalFix||0,
          points:user.points||0,
          checkinStreak:user.checkinStreak||0,
          dailyFixRemaining:remainingQuota,
          isPremium:isPrem,
          premiumLeftDays:premiumLeft,
          canSpin:canSpin,
          canCheckin:canCheckin,
          rank:rankInfo,
          isOwner:isOwner(userId),
          referralLink:`https://t.me/${config.BOT_USERNAME||'walzystore_bot'}?start=ref_${user.id}`
        },
        currentInvoice:activeInvoice,
        invoices:userInvoices
      });
    }
    
    if(endpoint==='spin'){
      const userId=String(body.user_id||query.user_id||'');
      let dbUser=db.users[userId];
      if(!dbUser) return res.status(200).json({ok:false,message:'User ID tidak valid'});
      if(dbUser.lastSpin===getTodayString()) return res.status(200).json({ok:false,message:'Spin harian sudah digunakan hari ini!'});
      
      const prizes=[
        {label:'+50 PTS',type:'points',value:50,weight:30},
        {label:'ZONK',type:'zonk',value:0,weight:15},
        {label:'+25 PTS',type:'points',value:25,weight:25},
        {label:'+100 PTS',type:'points',value:100,weight:10},
        {label:'+3 KUOTA',type:'quota',value:3,weight:15},
        {label:'VIP 1 HARI',type:'vip',value:1,weight:5}
      ];
      
      let r=Math.random()*100;
      let selected=prizes[0];
      let idx=0;
      for(let i=0;i<prizes.length;i++){
        if(r<prizes[i].weight){ selected=prizes[i]; idx=i; break; }
        r-=prizes[i].weight;
      }
      
      dbUser.lastSpin=getTodayString();
      if(selected.type==='points') dbUser.points=(dbUser.points||0)+selected.value;
      else if(selected.type==='quota'){
        if(!dbUser.dailyFix || dbUser.dailyFix.date!==getTodayString()) dbUser.dailyFix={date:getTodayString(),count:0};
        dbUser.dailyFix.count=Math.max(0,(dbUser.dailyFix.count||0)-selected.value);
      }else if(selected.type==='vip'){
        dbUser.premiumUntil=Math.max(Date.now(),dbUser.premiumUntil||0)+86400000*selected.value;
      }
      await saveDB(db);
      return res.status(200).json({ok:true,message:`Selamat! Kamu mendapatkan ${selected.label}`,prize:selected,prizeIndex:idx});
    }
    
    if(endpoint==='checkin'){
      const userId=String(body.user_id||query.user_id||'');
      let user=db.users[userId];
      if(!user) return res.status(200).json({ok:false,message:'User ID tidak valid'});
      if(user.lastCheckin===getTodayString()) return res.status(200).json({ok:false,message:'Kamu sudah check-in hari ini!'});
      
      const lastDate=user.lastCheckin;
      const today=getTodayString();
      const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
      
      if(lastDate===yesterday) user.checkinStreak=(user.checkinStreak||0)+1;
      else user.checkinStreak=1;
      
      if(user.checkinStreak>7) user.checkinStreak=1;
      user.lastCheckin=today;
      const bonus=10 + (user.checkinStreak*5);
      user.points=(user.points||0)+bonus;
      
      await saveDB(db);
      return res.status(200).json({ok:true,message:`Check-in Day ${user.checkinStreak} berhasil! +${bonus} PTS`});
    }
    
    if(endpoint==='redeem'){
      const userId=String(body.user_id||query.user_id||'');
      const option=body.option||query.option;
      let user=db.users[userId];
      if(!user) return res.status(200).json({ok:false,message:'User tidak valid'});
      
      if(option==='quota'){
        if((user.points||0)<100) return res.status(200).json({ok:false,message:'Poin tidak cukup! Butuh 100 PTS'});
        user.points-=100;
        if(!user.dailyFix || user.dailyFix.date!==getTodayString()) user.dailyFix={date:getTodayString(),count:0};
        user.dailyFix.count=Math.max(0,(user.dailyFix.count||0)-1);
        await saveDB(db);
        return res.status(200).json({ok:true,message:'Redeem berhasil! +1 Kuota Fix Merah'});
      }else if(option==='spin'){
        if((user.points||0)<150) return res.status(200).json({ok:false,message:'Poin tidak cukup! Butuh 150 PTS'});
        user.points-=150;
        user.lastSpin=null;
        await saveDB(db);
        return res.status(200).json({ok:true,message:'Redeem berhasil! Spin direset!'});
      }
      return res.status(200).json({ok:false,message:'Opsi tidak valid'});
    }
    
    if(endpoint==='create_order'){
      const userId=String(body.user_id||query.user_id||'');
      const days=parseInt(body.days||query.days)||0;
      const amount=parseInt(body.amount||query.amount)||0;
      
      let user=db.users[userId];
      if(!user) return res.status(200).json({ok:false,message:'User ID tidak valid'});
      
      const existingPending=Object.values(db.payments).find(p=>String(p.userId)===userId && (p.status==='pending' || p.status==='waiting_approval'));
      if(existingPending) return res.status(200).json({ok:false,message:'Masih ada invoice pending!'});
      
      const invoiceId=genInvoiceID();
      const invoice={id:invoiceId, invoice:invoiceId, userId:userId, days:days, amount:amount, status:'pending', proofImage:null, createdAt:Date.now()};
      db.payments[invoiceId]=invoice;
      await saveDB(db);
      return res.status(200).json({ok:true,message:'Invoice dibuat',invoice:invoice});
    }
    
    if(endpoint==='cancel_order'){
      const userId=String(body.user_id||query.user_id||'');
      const invoiceId=String(body.invoice||query.invoice||'');
      const pay=db.payments[invoiceId];
      if(!pay) return res.status(200).json({ok:false,message:'Invoice tidak ditemukan'});
      if(String(pay.userId)!==userId && !isOwner(userId)) return res.status(200).json({ok:false,message:'Akses ditolak'});
      if(pay.status==='paid' || pay.status==='approved') return res.status(200).json({ok:false,message:'Invoice sudah lunas'});
      
      delete db.payments[invoiceId];
      await saveDB(db);
      return res.status(200).json({ok:true,message:'Invoice dibatalkan'});
    }
    
    if(endpoint==='upload_proof'){
      const userId=String(body.user_id||query.user_id||'');
      const invoiceId=String(body.invoice||query.invoice||'');
      const imageData=body.image_data||'';
      
      const pay=db.payments[invoiceId];
      if(!pay) return res.status(200).json({ok:false,message:'Invoice tidak ditemukan'});
      
      pay.proofImage=imageData;
      pay.status='waiting_approval';
      await saveDB(db);
      
      try{
        const bot=new TelegramBot(config.BOT_TOKEN);
        for(let oid of (config.OWNER_IDS||[])){
          try{ await bot.sendMessage(oid, `📥 <b>BUKTI TRANSFER MASUK</b>\n\n🧾 Invoice: <code>${invoiceId}</code>\n👤 User: <code>${userId}</code>\n💰 Rp ${pay.amount.toLocaleString('id-ID')} • ${pay.days} Hari`, {parse_mode:'HTML'}); }catch(e){}
        }
      }catch(e){}
      return res.status(200).json({ok:true,message:'Bukti berhasil diupload! Menunggu verifikasi.'});
    }
    
    if(endpoint==='claim_code'){
      const userId=String(body.user_id||query.user_id||'');
      const code=String(body.code||query.code||'').toUpperCase().trim();
      let user=db.users[userId];
      if(!user) return res.status(200).json({ok:false,message:'Data tidak lengkap'});
      
      const vCode=db.codes[code];
      if(!vCode) return res.status(200).json({ok:false,message:'Kode Voucher Tidak Valid / Expired'});
      
      const days=Number(vCode.days);
      const quota=Number(vCode.quota||0);
      const used=Number(vCode.used||0);
      
      if(quota > 0 && used >= quota){
        delete db.codes[code];
        await saveDB(db);
        return res.status(200).json({ok:false,message:'Kuota Voucher Habis'});
      }
      
      user.premiumUntil=Math.max(Date.now(),user.premiumUntil||0)+(days*86400000);
      vCode.used = used + 1;
      
      if(quota > 0 && vCode.used >= quota) {
        delete db.codes[code];
      }
      
      await saveDB(db);
      return res.status(200).json({ok:true,message:`Voucher Berhasil Diklaim! +${days} Hari VIP`});
    }
    
    // ================= OWNER ENDPOINTS =================
    if(endpoint==='stats'){
      const userId=query.user_id||body.user_id;
      const ownerCheck=userId ? isOwner(userId) : false;
      const validUsers=getUniqueUsers(db.users);
      const premiumUsers=validUsers.filter(u=>isPremium(u)).length;
      const allPayments=Object.values(db.payments||{});
      const pending=allPayments.filter(p=>p.status==='waiting_approval' || p.status==='pending');
      const paid=allPayments.filter(p=>p.status==='paid' || p.status==='approved');
      
      return res.status(200).json({
        ok:true,
        isOwner:ownerCheck,
        usersValid:validUsers.length,
        premium:premiumUsers,
        totalFix:db.stats.totalFix||0,
        pendingPayments:pending.slice(-50).reverse(),
        paidPayments:ownerCheck ? paid.slice(-30).reverse() : [],
        recentUsers:ownerCheck ? validUsers.slice(-50).reverse() : [],
        codes:ownerCheck ? Object.values(db.codes).slice(-50) : [],
        revenue:ownerCheck ? (db.stats.revenue||0) : 0
      });
    }
    
    if(endpoint==='owner_action'){
      const ownerId=String(body.owner_id||query.owner_id||'');
      if(!isOwner(ownerId)) return res.status(200).json({ok:false,message:'Akses Ditolak'});
      
      const invoice=body.invoice;
      const action=body.action;
      const pay=db.payments[invoice];
      if(!pay) return res.status(200).json({ok:false,message:'Invoice Tidak Ditemukan'});
      
      if(action==='approve'){
        pay.status='paid';
        const u=db.users[String(pay.userId)];
        if(u){
          u.premiumUntil=Math.max(Date.now(),u.premiumUntil||0)+(pay.days*86400000);
          u.pendingDeposit=null;
        }
        db.stats.revenue=(db.stats.revenue||0)+pay.amount;
        await saveDB(db);
        
        try{
          const bot=new TelegramBot(config.BOT_TOKEN);
          await bot.sendMessage(pay.userId, `✅ <b>VERIFIKASI LUNAS</b>\n━━━━━━━━━━━━━━━━━━━━\n\n🧾 <b>Invoice:</b> <code>${invoice}</code>\n🔰 <b>Status:</b> APPROVED\n💎 <b>Paket:</b> VIP +${pay.days} Hari Aktif!`, {parse_mode:'HTML'});
        }catch(e){}
        return res.status(200).json({ok:true,message:`Invoice ${invoice} Disetujui!`});
      }else if(action==='reject'){
        pay.status='rejected';
        const u=db.users[String(pay.userId)];
        if(u) u.pendingDeposit=null;
        await saveDB(db);
        try{
          const bot=new TelegramBot(config.BOT_TOKEN);
          await bot.sendMessage(pay.userId, `❌ <b>VERIFIKASI DITOLAK</b>\n━━━━━━━━━━━━━━━━━━━━\n\nInvoice <code>${invoice}</code> ditolak Admin.`, {parse_mode:'HTML'});
        }catch(e){}
        return res.status(200).json({ok:true,message:`Invoice ${invoice} Ditolak!`});
      }
    }
    
    if(endpoint==='create_code'){
      const ownerId=String(body.owner_id||query.owner_id||'');
      if(!isOwner(ownerId)) return res.status(200).json({ok:false,message:'Akses Ditolak'});
      
      const code=String(body.code||'').toUpperCase().trim();
      const days=parseInt(body.days);
      const quota=parseInt(body.quota)||0;
      
      if(!code || code.length<3) return res.status(200).json({ok:false,message:'Kode minimal 3 karakter'});
      if(!days || days<=0) return res.status(200).json({ok:false,message:'Durasi tidak valid'});
      
      db.codes[code]={code,days,quota,used:0,createdAt:Date.now()};
      await saveDB(db);
      return res.status(200).json({ok:true,message:`Voucher ${code} Dibuat`});
    }
    
    if(endpoint==='delete_code'){
      const ownerId=String(body.owner_id||query.owner_id||'');
      if(!isOwner(ownerId)) return res.status(200).json({ok:false,message:'Akses Ditolak'});
      const code=String(body.code||'').toUpperCase().trim();
      delete db.codes[code];
      await saveDB(db);
      return res.status(200).json({ok:true,message:`Voucher Dihapus`});
    }
    
    if(endpoint==='broadcast'){
      const ownerId=String(body.owner_id||query.owner_id||'');
      if(!isOwner(ownerId)) return res.status(200).json({ok:false,message:'Akses Ditolak'});
      const text=String(body.text||'').trim();
      if(!text) return res.status(200).json({ok:false,message:'Pesan kosong'});
      
      const validUsers=getUniqueUsers(db.users);
      let sent=0, failed=0;
      try{
        const bot=new TelegramBot(config.BOT_TOKEN);
        for(let u of validUsers){
          try{
            await bot.sendMessage(u.id, `📢 <b>WALZY ANNOUNCEMENT</b>\n━━━━━━━━━━━━━━━━━━━━\n\n${text}`, {parse_mode:'HTML'});
            sent++;
          }catch(e){ failed++; }
          await new Promise(r=>setTimeout(r,50));
        }
      }catch(e){}
      return res.status(200).json({ok:true,message:`Broadcast Selesai! Berhasil: ${sent}, Gagal: ${failed}`});
    }
    
    return res.status(200).json({ok:false,message:'Endpoint Tidak Ditemukan'});
  }catch(err){
    console.error('API Error:',err);
    return res.status(200).json({ok:false,message:'Internal Server Error'});
  }
};
