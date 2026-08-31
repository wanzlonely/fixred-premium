const TelegramBot = require('node-telegram-bot-api');
const { loadDB, saveDB } = require('../lib/utils');
const { getTodayString, genID, genInvoiceID, esc, getRank, isValidNumber } = require('../lib/utils');
const { sendToTarget } = require('../lib/client');
const config = require('../config');

const rateLimitMap = new Map();
const supportRateMap = new Map();

function isOwner(id){ return config.OWNER_IDS.map(String).includes(String(id)); }
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
  if(!db.codes) db.codes = {};
  if(!db.stats) db.stats = { totalFix:0, totalSuccess:0, totalFailed:0, revenue:0, revenueHistory:[], lastReset: Date.now() };
  if(!db.history) db.history = {};
  if(!db.pending) db.pending = {};
  if(!db.supportMap) db.supportMap = {};
  if(!db.securityLog) db.securityLog = [];
  if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
  if(!db.stats.lastReset) db.stats.lastReset = Date.now();
}
function cleanDB(db){
  for(let k of Object.keys(db.users)){ if(isSuspiciousId(k)) delete db.users[k]; }
  for(let k of Object.keys(db.payments)){ const p=db.payments[k]; if(p && isSuspiciousId(p.userId)) delete db.payments[k]; }
}
function getUniqueUsers(usersObj){
  const map = new Map();
  for(let u of Object.values(usersObj)){
    if(isSuspiciousId(u.id)) continue;
    const name = (u.first_name||'').trim();
    if(!name) continue;
    const lower = name.toLowerCase();
    if(lower.includes('exploit') && (u.totalFix||0)===0 && (u.referralCount||0)===0) continue;
    if(!map.has(lower)) map.set(lower,u);
    else{
      const ex = map.get(lower);
      if((u.totalFix||0)+(u.referralCount||0) > (ex.totalFix||0)+(ex.referralCount||0)) map.set(lower,u);
    }
  }
  return Array.from(map.values());
}
function checkRateLimit(id){ const now=Date.now(); const last=rateLimitMap.get(String(id))||0; if(now-last<800) return false; rateLimitMap.set(String(id),now); return true; }
function checkSupportRate(id){ const now=Date.now(); const last=supportRateMap.get(String(id))||0; if(now-last<60000) return false; supportRateMap.set(String(id),now); return true; }
function getUser(db,id){
  const k=String(id);
  if(isSuspiciousId(k)) return null;
  if(!db.users[k]){
    db.users[k]={ id:Number(id)||id, first_name:'', username:'', joinedAt:Date.now(), referralCount:0, referrals:[], referredBy:null, totalFix:0, dailyFix:{date:getTodayString(),count:0}, premiumUntil:0, lastSpin:null, notifiedExp:false, awaitingNumber:false, awaitingBroadcast:false, awaitingSupport:false, pendingDeposit:null };
  }
  if(!db.users[k].dailyFix || db.users[k].dailyFix.date!==getTodayString()) db.users[k].dailyFix={date:getTodayString(),count:0};
  if(db.users[k].totalFix===undefined) db.users[k].totalFix=0;
  if(db.users[k].referralCount===undefined) db.users[k].referralCount=0;
  if(!Array.isArray(db.users[k].referrals)) db.users[k].referrals=[];
  return db.users[k];
}
function isPremium(u){ return u.premiumUntil && u.premiumUntil>Date.now(); }
function getPremiumLeft(u){ if(!isPremium(u)) return null; return Math.ceil((u.premiumUntil-Date.now())/86400000); }
function canUseFix(db,u){
  if(!u) return {allowed:false,remaining:0,isPremium:false};
  if(isOwner(u.id) || isPremium(u)) return {allowed:true,remaining:999,isPremium:true};
  if(u.dailyFix.count>=3) return {allowed:false,remaining:0,isPremium:false};
  return {allowed:true,remaining:3-u.dailyFix.count,isPremium:false};
}
function incrementFixCount(db,u){
  if(!u.dailyFix || u.dailyFix.date!==getTodayString()) u.dailyFix={date:getTodayString(),count:0};
  u.dailyFix.count+=1; u.totalFix=(u.totalFix||0)+1; db.stats.totalFix=(db.stats.totalFix||0)+1;
  const k=String(u.id); if(!db.history[k]) db.history[k]=[]; db.history[k].unshift({date:new Date().toISOString(),count:1}); if(db.history[k].length>100) db.history[k]=db.history[k].slice(0,100);
}
async function checkJoin(bot,uid){
  if(isOwner(uid)) return {joined:true,notJoined:[]};
  let notJoined=[];
  for(let ch of config.FORCE_JOIN){
    try{ const m=await bot.getChatMember(ch.id,uid); if(!['member','administrator','creator'].includes(m.status)) notJoined.push(ch); }catch(e){ notJoined.push(ch); }
  }
  return {joined:notJoined.length===0,notJoined};
}
function bq(t){ return `<blockquote>${t}</blockquote>`; }

// DESAIN SUPER KEREN - BEDA 360° - META HIDUP BUKAN FLAT
function getOwnerMenu(chatId, db, user){
  const validUsers = getUniqueUsers(db.users);
  const premiumCount = validUsers.filter(u=>isPremium(u)).length;
  const todayOrders = Object.values(db.payments||{}).filter(p=>{
    if(isSuspiciousId(p.userId)) return false;
    const d=new Date(p.createdAt); const now=new Date();
    return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }).length;
  const successRate = db.stats.totalFix ? Math.round((db.stats.totalSuccess/db.stats.totalFix)*100) : 0;

  const text = `⚡️ <b>WALZY OWNER STUDIO</b>\n` +
  `🎨 <i>Super App - Hidup, Bukan Flat - Meta Level</i>\n` +
  `━━━━━━━━━━━━━━━━━━━━━━━\n` +
  `${bq(`👑 Owner: <b>${esc(user.first_name)}</b>\n🛡️ Mode: <code>DARK PRO - BEDA 360°</code>\n\n📊 <b>STATISTIK REAL</b>\n• Pengguna Valid: <code>${validUsers.length}</code> orang\n• VIP Aktif: <code>${premiumCount}</code> orang\n• Total Pesanan: <code>${db.stats.totalFix||0}</code>\n• Hari Ini: <code>${todayOrders}</code> pesanan ✨\n• Sukses: <code>${db.stats.totalSuccess||0}</code> | Gagal: <code>${db.stats.totalFailed||0}</code>\n• Rasio: <code>${successRate}%</code>\n\n💎 Lebih bermanfaat dari revenue - Fokus pertumbuhan`)} \n` +
  `${bq(`🔧 <b>FIX MERAH</b> - Jualan akses scraping bot target\nBot ini jualan akses fix merah yang meng-scraping bot target - Fitur utama bot`)} \n` +
  `━━━━━━━━━━━━━━━━━━━━━━━\n` +
  `🚀 <b>walzy</b> • Super Keren & Rapih • ${new Date().toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta'})} WIB`;

  return {
    text,
    opts:{
      parse_mode:'HTML',
      reply_markup:{
        inline_keyboard:[
          [{ text:'🎨 Buka Studio Owner', web_app:{ url:`${process.env.PUBLIC_URL || ''}/webapp` } }],
          [{ text:'🔧 Fix Merah', callback_data:'menu_fix' }, { text:'📦 Order', callback_data:'menu_order' }],
          [{ text:'👥 Pengguna', callback_data:'owner_users' }, { text:'🎟️ Voucher', callback_data:'owner_voucher' }],
          [{ text:'📢 Siaran', callback_data:'menu_broadcast' }, { text:'📊 Statistik', callback_data:'menu_stats' }]
        ]
      }
    }
  };
}

function getUserMenu(chatId, db, user){
  const rnk = getRank(user.referralCount||0);
  const can = canUseFix(db,user);
  const status = isPremium(user) ? `💎 VIP ${getPremiumLeft(user)} Hari` : `🎫 Gratis ${can.remaining}/3`;
  const text = `✨ <b>WALZY STORE</b> - <i>Toko Resmi Super Keren</i>\n` +
  `🎨 <i>Desain Hidup - Meta Level - Bukan Flat</i>\n` +
  `━━━━━━━━━━━━━━━━━━━━━━━\n` +
  `${bq(`Halo <b>${esc(user.first_name)}</b>! 👋\n\n🆔 ID: <code>${chatId}</code>\n⭐ ${status}\n🏅 Level: ${rnk.icon} ${rnk.name}\n👥 Referral: <code>${user.referralCount||0}</code>\n📦 Pesanan: <code>${user.totalFix||0}</code>\n\n🔧 <b>Fix Merah Ready</b> - Bot jualan akses scraping bot target`)} \n` +
  `${bq(`🎁 <b>Fitur di Toko:</b>\n• Fix Merah - Scraping bot target\n• Order Paket Premium\n• Hadiah Harian & Voucher\n• Transaksi rapih tidak bingung`)} \n` +
  `━━━━━━━━━━━━━━━━━━━━━━━\n` +
  `🚀 <b>walzy</b> • Super Keren • ${new Date().toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta'})} WIB`;

  return {
    text,
    opts:{
      parse_mode:'HTML',
      reply_markup:{
        inline_keyboard:[
          [{ text:'🛍️ Buka Toko', web_app:{ url:`${process.env.PUBLIC_URL || ''}/webapp` } }],
          [{ text:'🔧 Fix Merah', callback_data:'menu_fix' }, { text:'📦 Order Paket', callback_data:'menu_order' }],
          [{ text:'🎁 Hadiah & Voucher', callback_data:'menu_rewards' }, { text:'👤 Profil', callback_data:'menu_profile' }],
          [{ text:'💬 Bantuan', callback_data:'user_contact_owner' }]
        ]
      }
    }
  };
}

function getDashboardMenu(chatId,db,user){
  if(isOwner(chatId)) return getOwnerMenu(chatId,db,user);
  return getUserMenu(chatId,db,user);
}

async function handleMessage(bot,db,msg){
  ensureDB(db); cleanDB(db);
  if(!msg.from) return;
  if(msg.from.is_bot) return;
  if(isSuspiciousId(msg.from.id)) return;
  if(!checkRateLimit(msg.from.id)) return;
  const chatId = msg.chat.id;
  if(isSuspiciousId(chatId)) return;
  const text = msg.text ? msg.text.trim() : '';
  const user = getUser(db,chatId);
  if(!user) return;
  user.first_name = msg.from.first_name || 'User';
  user.username = msg.from.username || '';

  if(msg.photo && db.users[String(chatId)] && db.users[String(chatId)].pendingDeposit){
    const inv = db.users[String(chatId)].pendingDeposit;
    const pay = db.payments[inv];
    if(pay && (pay.status==='waiting_proof' || pay.status==='waiting_payment')){
      const fileId = msg.photo[msg.photo.length-1].file_id;
      pay.proofFileId = fileId;
      pay.status='waiting_approval';
      db.users[String(chatId)].pendingDeposit=null;
      await saveDB(db);
      await bot.sendMessage(chatId, `✅ <b>Bukti Diterima</b>\n${bq(`Invoice <code>${inv}</code>\nMenunggu ACC maksimal 24 jam\nNotifikasi persegi akan muncul`)} \n🚀 walzy`, {parse_mode:'HTML'});
      for(let oid of config.OWNER_IDS){
        try{
          await bot.sendPhoto(oid,fileId,{
            caption:`📩 <b>Deposit Baru</b>\n🧾 ${inv}\n👤 ${chatId}\n💎 ${pay.days}H - Rp ${pay.amount.toLocaleString()}`,
            parse_mode:'HTML',
            reply_markup:{inline_keyboard:[[{text:'✅ Setujui',callback_data:`approve_${inv}`},{text:'❌ Tolak',callback_data:`reject_${inv}`}]]}
          });
        }catch(e){}
      }
      return;
    }
  }

  if(isOwner(chatId) && msg.reply_to_message && text){
    const targetUid = db.supportMap && db.supportMap[String(msg.reply_to_message.message_id)];
    if(targetUid && !isSuspiciousId(targetUid)){
      try{
        await bot.sendMessage(targetUid, `💬 <b>Balasan Admin</b>\n${bq(esc(text))}\n🚀 walzy`, {parse_mode:'HTML'});
        await bot.sendMessage(chatId, `Balasan terkirim ke ${targetUid}`);
      }catch(e){ await bot.sendMessage(chatId, `Gagal: ${e.message}`); }
      return;
    }
  }

  if(!isOwner(chatId) && db.users[String(chatId)] && db.users[String(chatId)].awaitingSupport && text){
    if(!checkSupportRate(chatId)){
      return bot.sendMessage(chatId, `⏳ <b>Tunggu</b>\n${bq('Tunggu 1 menit sebelum keluhan baru')}\n🚀 walzy`, {parse_mode:'HTML'});
    }
    if(text.length>500) return bot.sendMessage(chatId, `⚠️ <b>Panjang</b>\n${bq('Maks 500 karakter')}\n🚀 walzy`, {parse_mode:'HTML'});
    db.users[String(chatId)].awaitingSupport=false;
    await saveDB(db);
    await bot.sendMessage(chatId, `✅ <b>Terkirim</b>\n${bq(`Keluhan diteruskan\nID: <code>${genID()}</code>`)} \n🚀 walzy`, {parse_mode:'HTML'});
    if(!db.supportMap) db.supportMap={};
    for(let oid of config.OWNER_IDS){
      try{
        const sent = await bot.sendMessage(oid, `🎧 <b>Tiket Baru</b>\n${bq(`👤 ${chatId} @${msg.from.username||'-'}\n\n${esc(text)}`)} \n🚀 walzy`, {parse_mode:'HTML'});
        db.supportMap[String(sent.message_id)]=String(chatId);
      }catch(e){}
    }
    await saveDB(db);
    return;
  }

  if(!text) return;

  if(text.startsWith('/gen ')){
    if(!isOwner(chatId)) return;
    const parts=text.split(' ').filter(Boolean);
    if(parts.length<3) return bot.sendMessage(chatId, `❌ <b>Salah</b>\n${bq('/gen KODE HARI')}\n🚀 walzy`, {parse_mode:'HTML'});
    const code=parts[1].toUpperCase(); const days=parseInt(parts[2]);
    db.codes[code]={code,days,quota:0,used:0,createdAt:Date.now(),type:'legacy'};
    await saveDB(db);
    return bot.sendMessage(chatId, `✅ <b>Voucher Dibuat</b>\n${bq(`Kode: <code>${code}</code>\n${days} Hari`)}\n🚀 walzy`, {parse_mode:'HTML'});
  }

  if(text.startsWith('/redeem ')){
    const parts=text.split(' ').filter(Boolean);
    if(parts.length<2) return bot.sendMessage(chatId, `❌ <b>Gagal</b>\n${bq('/redeem KODE')}\n🚀 walzy`, {parse_mode:'HTML'});
    const code=parts[1].toUpperCase();
    const c = db.codes[code];
    if(c){
      const days = typeof c==='object' ? c.days : c;
      const quota = typeof c==='object' ? (c.quota||0) : 0;
      const used = typeof c==='object' ? (c.used||0) : 0;
      if(quota>0 && used>=quota){
        return bot.sendMessage(chatId, `❌ <b>Kuota Habis</b>\n${bq(`Kode ${code} sudah habis dipakai ${used}/${quota}`)}\n🚀 walzy`, {parse_mode:'HTML'});
      }
      user.premiumUntil=Math.max(Date.now(),user.premiumUntil||0)+days*86400000;
      if(typeof c==='object'){
        c.used=(c.used||0)+1;
        if(c.type==='private' && quota===1){
          delete db.codes[code];
        }
      }else{
        delete db.codes[code];
      }
      await saveDB(db);
      return bot.sendMessage(chatId, `🎉 <b>Berhasil</b>\n${bq(`VIP ${days} Hari aktif`)} \n🚀 walzy`, {parse_mode:'HTML'});
    }else{
      return bot.sendMessage(chatId, `❌ <b>Gagal</b>\n${bq('Kode tidak valid')}\n🚀 walzy`, {parse_mode:'HTML'});
    }
  }

  if(text.startsWith('/start')){
    const p=text.split(' ')[1] ? text.split(' ')[1].trim() : '';
    if(p && !isNaN(p) && !isSuspiciousId(p) && String(p)!==String(chatId) && !user.referredBy && db.users[p] && !isOwner(chatId)){
      user.referredBy=String(p);
      db.users[p].referralCount=(db.users[p].referralCount||0)+1;
      if(!db.users[p].referrals.includes(String(chatId))) db.users[p].referrals.push(String(chatId));
    }
    await saveDB(db);
    const jc=await checkJoin(bot,chatId);
    if(!jc.joined){
      const txt=`🔒 <b>Akses Terkunci</b>\n${bq(`Gabung saluran resmi:\n${jc.notJoined.map(c=>`• ${c.id}`).join('\n')}`)}\n🚀 walzy`;
      const btns=jc.notJoined.map(c=>[{text:`Gabung ${c.name}`,url:c.link}]);
      btns.push([{text:'Verifikasi',callback_data:'verify_join'}]);
      return bot.sendMessage(chatId,txt,{parse_mode:'HTML',reply_markup:{inline_keyboard:btns}});
    }
    const menu=getDashboardMenu(chatId,db,user);
    return bot.sendMessage(chatId,menu.text,{parse_mode:'HTML',disable_web_page_preview:true,...menu.opts});
  }

  if(db.users[String(chatId)] && db.users[String(chatId)].awaitingNumber){
    if(text.startsWith('/')){
      db.users[String(chatId)].awaitingNumber=false;
      await saveDB(db);
      const menu=getDashboardMenu(chatId,db,user);
      return bot.sendMessage(chatId,menu.text,{parse_mode:'HTML',...menu.opts});
    }
    const rawLines=text.split('\n').map(x=>x.trim()).filter(Boolean);
    let lines=rawLines.map(x=>x.replace(/[^0-9+]/g,'')).filter(x=>isValidNumber(x));
    if(lines.length===0){
      return bot.sendMessage(chatId, `❌ <b>Salah</b>\n${bq('Masukkan angka valid')}\n🚀 walzy`, {parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'Batal',callback_data:'cancel_action'}]]}});
    }
    if(lines.length>1 && !isPremium(user) && !isOwner(chatId)){
      return bot.sendMessage(chatId, `⚠️ <b>Ditolak</b>\n${bq('Multi-baris khusus VIP')}\n🚀 walzy`, {parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'Upgrade',callback_data:'menu_order'}]]}});
    }
    if(lines.length>5) lines=lines.slice(0,5);
    const batchId=genID();
    incrementFixCount(db,user);
    const pendingId=`${Date.now()}_${chatId}`;
    if(!db.pending) db.pending={};
    db.pending[pendingId]={chatId,batchId,originalNumbers:lines,timestamp:Date.now(),handled:false};
    db.users[String(chatId)].awaitingNumber=false;
    await saveDB(db);
    await bot.sendMessage(chatId, `⚡ <b>Memproses Fix Merah</b>\n${bq(`Batch: <code>${batchId}</code>\nJumlah: ${lines.length}\nScraping bot target...`)} \n🚀 walzy`, {parse_mode:'HTML'});
    const joinedNumbers=lines.join('\n');
    const resTarget=await sendToTarget(joinedNumbers);
    if(!resTarget.ok){
      await bot.sendMessage(chatId, `⚠️ <b>Error</b>\n${bq(`Gagal: ${resTarget.error}`)}\n🚀 walzy`, {parse_mode:'HTML'});
    }
    return;
  }

  if(db.users[String(chatId)] && db.users[String(chatId)].awaitingBroadcast && isOwner(chatId)){
    if(text.startsWith('/')){
      db.users[String(chatId)].awaitingBroadcast=false;
      await saveDB(db);
      return;
    }
    const validUsers=getUniqueUsers(db.users);
    const uids=validUsers.map(u=>String(u.id));
    let s=0,f=0;
    await bot.sendMessage(chatId, `⏳ <b>Mengirim Siaran</b>\n${bq(`Ke ${uids.length} pengguna valid`)}\n🚀 walzy`, {parse_mode:'HTML'});
    for(let uid of uids){
      if(isSuspiciousId(uid)) continue;
      try{ await bot.sendMessage(uid, `📢 <b>Siaran Walzy</b>\n${bq(esc(text))}\n🚀 walzy`, {parse_mode:'HTML'}); s++; }catch{ f++; }
      await new Promise(r=>setTimeout(r,80));
    }
    db.users[String(chatId)].awaitingBroadcast=false;
    await saveDB(db);
    return bot.sendMessage(chatId, `✅ <b>Selesai</b>\n${bq(`Sukses: ${s}\nGagal: ${f}`)}\n🚀 walzy`, {parse_mode:'HTML'});
  }
}

async function handleCallback(bot,db,query){
  ensureDB(db); cleanDB(db);
  if(!query.from || query.from.is_bot) return;
  if(isSuspiciousId(query.from.id)) return;
  const chatId=query.message.chat.id;
  if(isSuspiciousId(chatId)) return;
  const msgId=query.message.message_id;
  const data=query.data;
  const user=getUser(db,chatId);
  if(!user) return;
  if(!checkRateLimit(chatId)) return bot.answerCallbackQuery(query.id,{text:'Tunggu'});

  if(data==='verify_join'){
    const jc=await checkJoin(bot,chatId);
    if(jc.joined){
      const menu=getDashboardMenu(chatId,db,user);
      return bot.editMessageText(menu.text,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',disable_web_page_preview:true,...menu.opts});
    }else{
      return bot.answerCallbackQuery(query.id,{text:'Belum gabung',show_alert:true});
    }
  }

  if(data==='cancel_action' || data==='menu_main'){
    db.users[String(chatId)].awaitingNumber=false;
    db.users[String(chatId)].awaitingBroadcast=false;
    db.users[String(chatId)].awaitingSupport=false;
    db.users[String(chatId)].pendingDeposit=null;
    await saveDB(db);
    const menu=getDashboardMenu(chatId,db,user);
    return bot.editMessageText(menu.text,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',disable_web_page_preview:true,...menu.opts});
  }

  if(data==='menu_fix'){
    const c=canUseFix(db,user);
    if(!c.allowed){
      return bot.editMessageText(`🚫 <b>Batas Habis</b>\n${bq('Batas harian habis - Buka toko untuk upgrade\n\n🔧 Fix Merah - Jualan akses scraping bot target')}\n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🛍️ Buka Toko',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
    }
    db.users[String(chatId)].awaitingNumber=true;
    await saveDB(db);
    return bot.editMessageText(`🔧 <b>FIX MERAH - SCRAPING BOT TARGET</b>\n${bq(`Bot jualan akses fix merah - Fitur utama\n\nSisa: ${c.isPremium ? 'Tak terbatas' : c.remaining}\nFormat: <code>628xxxxxxxxxx</code>\nPisah baris untuk multi`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='menu_order'){
    return bot.editMessageText(`📦 <b>ORDER PAKET PREMIUM</b>\n${bq(`Jualan akses fix merah & bot store\n\n1 Hari 2k - Trial\n5 Hari 5k - Populer\n10 Hari 10k - Terbaik\n30 Hari 60k - Sultan\n\nTransfer: ${config.DANA_NAME} ${config.DANA_NUMBER}\n\nBuka toko untuk proses rapih - Halaman Order`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🛍️ Buka Halaman Order',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='menu_rewards'){
    const txt=`🎁 <b>HADIAH & VOUCHER</b>\n${bq(`Hadiah harian, kode voucher, dan referral\n\n🎰 Spin Harian - Hadiah setiap hari\n🎟️ Redeem Code - Tukar kode voucher\n👥 Referral - Ajak teman dapat level`)} \n🚀 walzy`;
    return bot.editMessageText(txt,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎰 Spin Harian',callback_data:'menu_spin'},{text:'🎟️ Voucher',callback_data:'menu_redeem'}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='menu_spin'){
    const canSpin=!user.lastSpin || user.lastSpin!==getTodayString();
    const txt=`🎰 <b>HADIAH HARIAN</b>\n${bq(`${canSpin ? '✅ Siap spin hari ini!' : '⏳ Sudah spin hari ini - Besok lagi'}\n\nTerakhir: ${user.lastSpin || 'Belum pernah'}`)} \n🚀 walzy`;
    return bot.editMessageText(txt,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:canSpin ? '🎰 Putar Sekarang' : 'Sudah Spin',callback_data:canSpin ? 'do_spin' : 'menu_main'}],[{text:'◁ Kembali',callback_data:'menu_rewards'}]]}});
  }

  if(data==='do_spin'){
    const today=getTodayString();
    if(user.lastSpin===today) return bot.answerCallbackQuery(query.id,{text:'Sudah spin',show_alert:true});
    const rewards=[{label:'Bonus 1 Fix',desc:'+1 batas'},{label:'VIP 1 Hari',desc:'Gratis 1 hari'},{label:'5 Poin',desc:'Bonus'}];
    const reward=rewards[Math.floor(Math.random()*rewards.length)];
    user.lastSpin=today;
    if(reward.label.includes('VIP')) user.premiumUntil=Math.max(Date.now(),user.premiumUntil||0)+86400000;
    await saveDB(db);
    return bot.editMessageText(`🎉 <b>SPIN BERHASIL</b>\n${bq(`Hadiah: <b>${reward.label}</b>\n${reward.desc}`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_rewards'}]]}});
  }

  if(data==='menu_redeem'){
    return bot.editMessageText(`🎟️ <b>KODE VOUCHER</b>\n${bq(`Kirim: <code>/redeem KODE</code>\nContoh: /redeem WALZY2024`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_rewards'}]]}});
  }

  if(data==='menu_profile'){
    const rnk=getRank(user.referralCount||0);
    const can=canUseFix(db,user);
    const txt=`👤 <b>PROFIL SAYA</b>\n${bq(`Nama: <b>${esc(user.first_name)}</b>\nID: <code>${chatId}</code>\nStatus: ${isPremium(user) ? `VIP ${getPremiumLeft(user)} Hari` : `Gratis ${can.remaining}/3`}\nLevel: ${rnk.icon} ${rnk.name}\nReferral: ${user.referralCount||0}\nPesanan: ${user.totalFix||0}`)} \n🚀 walzy`;
    return bot.editMessageText(txt,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data.startsWith('buy_')){
    const days=parseInt(data.split('_')[1]);
    const amountMap={1:2000,5:5000,10:10000,30:60000};
    const amount=amountMap[days]||2000;
    const inv=genInvoiceID();
    db.payments[inv]={userId:chatId,days,amount,status:'waiting_payment',createdAt:Date.now(),proofFileId:null};
    await saveDB(db);
    return bot.editMessageText(`🧾 <b>INVOICE</b>\n${bq(`ID: <code>${inv}</code>\nPaket: ${days} Hari\nTotal: Rp ${amount.toLocaleString()}\nTransfer: ${config.DANA_NAME} ${config.DANA_NUMBER}\n\nLangkah ACC rapih di halaman Order`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'✅ Sudah Transfer',callback_data:`confirm_${inv}`}],[{text:'◁ Kembali',callback_data:'menu_order'}]]}});
  }

  if(data.startsWith('confirm_')){
    const inv=data.split('confirm_')[1];
    const pay=db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id,{text:'Tidak ditemukan'});
    pay.status='waiting_proof';
    db.users[String(chatId)].pendingDeposit=inv;
    await saveDB(db);
    return bot.editMessageText(`📤 <b>KONFIRMASI</b>\n${bq(`Invoice <code>${inv}</code>\nKirim foto bukti transfer sekarang`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
  }

  if(data.startsWith('approve_')){
    if(!isOwner(chatId)) return bot.answerCallbackQuery(query.id,{text:'Bukan owner'});
    const inv=data.split('approve_')[1];
    const pay=db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id,{text:'Tidak ditemukan'});
    if(pay.status==='paid') return bot.editMessageText(`✅ <b>Sudah Disetujui</b>\n${bq(`${inv} sudah disetujui`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
    if(isSuspiciousId(pay.userId)) return bot.editMessageText(`⚠️ <b>Tidak Valid</b>\n${bq(`${inv} pengguna tidak valid`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
    pay.status='paid';
    const u=getUser(db,pay.userId);
    if(!u) return;
    u.premiumUntil=Math.max(Date.now(),u.premiumUntil||0)+pay.days*86400000;
    u.pendingDeposit=null;
    db.stats.revenue=(db.stats.revenue||0)+pay.amount;
    if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory=[];
    db.stats.revenueHistory.push({date:new Date().toISOString(),amount:pay.amount,invoice:inv,userId:pay.userId});
    await saveDB(db);
    await bot.editMessageText(`✅ <b>Disetujui</b>\n${bq(`${inv} untuk ${pay.userId}\nNotifikasi persegi terkirim`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
    try{ await bot.sendMessage(pay.userId, `✅ <b>Disetujui</b>\n${bq(`Deposit ${inv} disetujui\nPaket ${pay.days} Hari sampai ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}`)} \n🚀 walzy`, {parse_mode:'HTML'}); }catch{}
    return;
  }

  if(data.startsWith('reject_')){
    if(!isOwner(chatId)) return;
    const inv=data.split('reject_')[1];
    const pay=db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id,{text:'Tidak ditemukan'});
    pay.status='rejected';
    const u=getUser(db,pay.userId);
    if(u) u.pendingDeposit=null;
    await saveDB(db);
    await bot.editMessageText(`❌ <b>Ditolak</b>\n${bq(`${inv} ditolak`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
    try{ await bot.sendMessage(pay.userId, `❌ <b>Ditolak</b>\n${bq(`Deposit ${inv} ditolak`)} \n🚀 walzy`, {parse_mode:'HTML'}); }catch{}
    return;
  }

  if(data==='owner_users' && isOwner(chatId)){
    const unique=getUniqueUsers(db.users);
    let t=`👥 <b>PENGGUNA - REAL-TIME</b>\n${bq(`Total valid: ${unique.length} - Anti double - Bukan gimmick`)} \n`;
    unique.slice(-10).reverse().forEach(u=>{
      const icn=isPremium(u) ? '💎' : '🎫';
      t+=`${bq(`${icn} <code>${u.id}</code> | ${esc((u.first_name||'User').substring(0,12))} | ${u.totalFix||0} pesanan`)}\n`;
    });
    t+=`\n🚀 walzy`;
    return bot.editMessageText(t,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='owner_voucher' && isOwner(chatId)){
    const codes=Object.values(db.codes||{}).slice(-10);
    let t=`🎟️ <b>VOUCHER - BUAT KODE REDEEM</b>\n${bq(`Buat kode dengan hari & kuota berapa orang - Fitur lengkap owner\n\nFormat: /gen KODE HARI\nAtau via webapp owner - Buat dengan kuota`)} \n`;
    if(codes.length>0){
      codes.forEach(c=>{
        const code = typeof c==='object' ? c.code : 'CODE';
        const days = typeof c==='object' ? c.days : c;
        const quota = typeof c==='object' ? (c.quota||0) : 0;
        const used = typeof c==='object' ? (c.used||0) : 0;
        t+=`${bq(`🎫 ${code} - ${days}H | Kuota ${quota||'∞'} | Pakai ${used}`)}\n`;
      });
    }
    t+=`\n🚀 walzy`;
    return bot.editMessageText(t,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎨 Buka Studio Voucher',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='menu_stats'){
    const validUsers=getUniqueUsers(db.users);
    const todayOrders=Object.values(db.payments||{}).filter(p=>{
      if(isSuspiciousId(p.userId)) return false;
      const d=new Date(p.createdAt); const now=new Date();
      return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
    }).length;
    const txt=`📊 <b>STATISTIK SUPER</b>\n${bq(`Pengguna Valid: <code>${validUsers.length}</code>\nPesanan: <code>${db.stats.totalFix||0}</code>\nHari Ini: <code>${todayOrders}</code> - Lebih bermanfaat\nSukses: <code>${db.stats.totalSuccess||0}</code>\nRasio: <code>${db.stats.totalFix ? Math.round((db.stats.totalSuccess/db.stats.totalFix)*100) : 0}%</code>\n\nReal-time bukan gimmick`)} \n🚀 walzy`;
    return bot.editMessageText(txt,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎨 Buka Studio',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='menu_broadcast' && isOwner(chatId)){
    db.users[String(chatId)].awaitingBroadcast=true;
    await saveDB(db);
    return bot.editMessageText(`📢 <b>SIARAN</b>\n${bq('Kirim teks untuk siaran ke semua pengguna valid - Real bukan gimmick')}\n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'Batal',callback_data:'cancel_action'}]]}});
  }

  if(data==='user_contact_owner'){
    db.users[String(chatId)].awaitingSupport=true;
    await saveDB(db);
    return bot.editMessageText(`💬 <b>BANTUAN</b>\n${bq('Ketik keluhan - Maks 500 karakter')}\n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'Batal',callback_data:'cancel_action'}]]}});
  }
}

module.exports = async (req,res)=>{
  const bot=new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
  try{
    const db=await loadDB();
    ensureDB(db); cleanDB(db);
    if(req.method==='POST'){
      const update=req.body;
      if(update.message) await handleMessage(bot,db,update.message);
      if(update.callback_query){
        await handleCallback(bot,db,update.callback_query);
        try{ await bot.answerCallbackQuery(update.callback_query.id); }catch{}
      }
      await saveDB(db);
    }
    res.status(200).json({ok:true});
  }catch(e){
    console.error(e);
    res.status(200).json({ok:false,error:e.message});
  }
};
