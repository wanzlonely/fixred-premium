const { loadDB, saveDB } = require('../lib/utils');
const { getTodayString, genID, genInvoiceID, esc, getRank, isValidNumber } = require('../lib/utils');
const { sendToTarget } = require('../lib/client');
const config = require('../config');

const rateLimitMap = new Map();
const supportRateMap = new Map();
const joinCache = new Map(); // cache join check 5 menit

function isOwner(id){ return config.OWNER_IDS.map(String).includes(String(id)); }
function isSuspiciousId(id){ const s=String(id); const n=Number(id); if(!n||n<=0) return true; if(s.startsWith('-')) return true; if(s.length>20) return true; return false; }

function ensureDB(db){
  if(!db.users) db.users={};
  if(!db.payments) db.payments={};
  if(!db.codes) db.codes={};
  if(!db.stats) db.stats={ totalFix:0, totalSuccess:0, totalFailed:0, revenue:0, revenueHistory:[], lastReset: Date.now() };
  if(!db.history) db.history={};
  if(!db.pending) db.pending={};
  if(!db.supportMap) db.supportMap={};
}
function cleanDB(db){
  for(let k of Object.keys(db.users)){ if(isSuspiciousId(k)) delete db.users[k]; }
  for(let k of Object.keys(db.payments)){ const p=db.payments[k]; if(p && isSuspiciousId(p.userId)) delete db.payments[k]; }
}

// FIXED: deduplicate by ID, not name (bug lama bikin user hilang)
function getUniqueUsers(usersObj){
  const map=new Map();
  for(let u of Object.values(usersObj||{})){
    if(!u || isSuspiciousId(u.id)) continue;
    const key = String(u.id); // FIX: pakai ID bukan nama
    const name=(u.first_name||'').trim().toLowerCase();
    if(!name) continue;
    if(name.includes('exploit') && (u.totalFix||0)===0 && (u.referralCount||0)===0) continue;
    if(!map.has(key)) map.set(key,u);
    else{
      const ex=map.get(key);
      if((u.totalFix||0)+(u.referralCount||0) > (ex.totalFix||0)+(ex.referralCount||0)) map.set(key,u);
    }
  }
  return Array.from(map.values());
}

function checkRateLimit(id){
  const now=Date.now();
  const key=String(id);
  const last=rateLimitMap.get(key)||0;
  if(now-last<1000) return false; // naikin ke 1 detik biar gak spam
  rateLimitMap.set(key,now);
  // auto cleanup biar gak memory leak
  if(rateLimitMap.size>1000){ const first=rateLimitMap.keys().next().value; rateLimitMap.delete(first); }
  return true;
}
function checkSupportRate(id){
  const now=Date.now();
  const key=String(id);
  const last=supportRateMap.get(key)||0;
  if(now-last<60000) return false;
  supportRateMap.set(key,now);
  return true;
}
function getUser(db,id){
  const k=String(id);
  if(isSuspiciousId(k)) return null;
  if(!db.users[k]){
    db.users[k]={ id:Number(id)||id, first_name:'', username:'', joinedAt:Date.now(), referralCount:0, referrals:[], referredBy:null, totalFix:0, dailyFix:{date:getTodayString(),count:0}, premiumUntil:0, lastSpin:null, awaitingNumber:false, awaitingBroadcast:false, awaitingSupport:false, pendingDeposit:null };
  }
  if(!db.users[k].dailyFix || db.users[k].dailyFix.date!==getTodayString()) db.users[k].dailyFix={date:getTodayString(),count:0};
  if(db.users[k].totalFix===undefined) db.users[k].totalFix=0;
  if(db.users[k].referralCount===undefined) db.users[k].referralCount=0;
  if(!Array.isArray(db.users[k].referrals)) db.users[k].referrals=[];
  return db.users[k];
}
function isPremium(u){ return u && u.premiumUntil && u.premiumUntil>Date.now(); }
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

// Optimized join check with cache
async function checkJoin(bot,uid){
  if(isOwner(uid)) return {joined:true,notJoined:[]};
  const cacheKey = String(uid);
  const cached = joinCache.get(cacheKey);
  if(cached && Date.now()-cached.ts < 300000) return cached.data; // 5 menit cache
  
  let notJoined=[];
  for(let ch of config.FORCE_JOIN){
    try{ 
      const m=await bot.getChatMember(ch.id,uid); 
      if(!['member','administrator','creator'].includes(m.status)) notJoined.push(ch); 
    }catch(e){ notJoined.push(ch); }
  }
  const result = {joined:notJoined.length===0,notJoined};
  joinCache.set(cacheKey,{ts:Date.now(),data:result});
  return result;
}

// === NEW BLOCKQUOTE DESIGN SYSTEM ===
function bq(t){ 
  // Bersihkan double newline dan rapikan
  const clean = t.trim().replace(/\n{3,}/g,'\n\n');
  return `<blockquote>${clean}</blockquote>`; 
}
function fmtMoney(n){ return 'Rp '+(n||0).toLocaleString('id-ID'); }

// DESIGN BARU - OWNER MENU SUPER RAPIH
function getOwnerMenu(chatId, db, user){
  const validUsers=getUniqueUsers(db.users);
  const premiumCount=validUsers.filter(u=>isPremium(u)).length;
  const todayOrders=Object.values(db.payments||{}).filter(p=>{
    if(isSuspiciousId(p.userId)) return false;
    const d=new Date(p.createdAt); const now=new Date();
    return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }).length;
  const pendingOrders=Object.values(db.payments||{}).filter(p=>p.status==='waiting_approval').length;
  const successRate=db.stats.totalFix ? Math.round((db.stats.totalSuccess/db.stats.totalFix)*100) : 0;
  const revenue = db.stats.revenue||0;

  const text=`⚡️ <b>WALZY OWNER STUDIO</b>
<i>Panel Kontrol Premium — Super Cepat & Rapi</i>

${bq(`👑 <b>Owner:</b> ${esc(user.first_name)}
🛡️ <b>Status:</b> <code>ACTIVE • DARK PRO</code>
⏰ <b>Waktu:</b> ${new Date().toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta'})} WIB

📊 <b>Statistik Real-Time</b>
├ Pengguna Valid: <code>${validUsers.length}</code>
├ VIP Member: <code>${premiumCount}</code>
├ Order Hari Ini: <code>${todayOrders}</code>
├ Pending ACC: <code>${pendingOrders}</code>
└ Success Rate: <code>${successRate}%</code>

💰 <b>Performa Bisnis</b>
├ Total Order: <code>${db.stats.totalFix||0}</code>
├ Revenue: <code>${fmtMoney(revenue)}</code>
└ Sukses: <code>${db.stats.totalSuccess||0}</code> | Gagal: <code>${db.stats.totalFailed||0}</code>

🔧 <b>Layanan:</b> Jual akses scraping bot target
✨ <b>Fitur:</b> Anti lag, cache, blockquote rapi`)}

🚀 <i>walzy store • Sistem super cepat, bukan gimmick</i>`;

  return {
    text,
    opts:{
      parse_mode:'HTML',
      reply_markup:{
        inline_keyboard:[
          [{ text:'🎨 Buka Studio WebApp', web_app:{ url:`${process.env.PUBLIC_URL || ''}/webapp` } }],
          [{ text:'📦 Order Pending ('+pendingOrders+')', callback_data:'menu_order' }, { text:'🔧 Fix Merah', callback_data:'menu_fix' }],
          [{ text:'👥 Pengguna ('+validUsers.length+')', callback_data:'owner_users' }, { text:'🎟️ Voucher', callback_data:'owner_voucher' }],
          [{ text:'📢 Broadcast', callback_data:'menu_broadcast' }, { text:'📊 Statistik Lengkap', callback_data:'menu_stats' }]
        ]
      }
    }
  };
}

function getUserMenu(chatId, db, user){
  const rnk=getRank(user.referralCount||0);
  const can=canUseFix(db,user);
  const status=isPremium(user) ? `💎 VIP Aktif • ${getPremiumLeft(user)} Hari lagi` : `🎫 Gratis • Sisa ${can.remaining}/3 hari ini`;
  const totalFix = user.totalFix||0;
  const refCount = user.referralCount||0;

  const text=`👋 <b>Halo, ${esc(user.first_name)}!</b>
<i>Selamat datang di Walzy Store</i>

${bq(`💎 <b>Status Akun</b>
├ ${status}
├ Rank: <b>${rnk.name}</b> ${rnk.icon}
└ Referral: <code>${refCount}</code> orang

📈 <b>Statistik Kamu</b>
├ Total Order: <code>${totalFix}</code>
├ Sisa Hari Ini: <code>${can.remaining}</code>
└ Bergabung: <code>${new Date(user.joinedAt).toLocaleDateString('id-ID')}</code>

🎯 <b>Cara Pakai:</b>
1. Pilih paket premium di bawah
2. Upload bukti transfer
3. Tunggu ACC owner (super cepat)
4. Langsung bisa pakai bot!`)}

<i>Pilih menu di bawah ini 👇 • 🚀 walzy</i>`;

  return {
    text,
    opts:{
      parse_mode:'HTML',
      reply_markup:{
        inline_keyboard:[
          [{ text:'🎨 Buka Walzy Store', web_app:{ url:`${process.env.PUBLIC_URL || ''}/webapp` } }],
          [{ text:'💎 Paket Premium', callback_data:'menu_packages' }, { text:'🎰 Spin Harian', callback_data:'menu_spin' }],
          [{ text:'👤 Profil Saya', callback_data:'menu_profile' }, { text:'🔗 Referral', callback_data:'menu_referral' }],
          [{ text:'💬 Hubungi Owner', callback_data:'user_contact_owner' }, { text:'📜 Bantuan', callback_data:'menu_help' }]
        ]
      }
    }
  };
}

async function handleMessage(bot, db, msg){
  const chatId = msg.chat.id;
  const text = (msg.text||'').trim();
  const user = getUser(db, chatId);
  if(!user) return;
  
  // Update info user
  user.first_name = msg.from.first_name||user.first_name;
  user.username = msg.from.username||user.username;
  
  if(!checkRateLimit(chatId)){
    return bot.sendMessage(chatId, `⏳ <b>Santai dulu</b>\n${bq('Jangan spam ya, tunggu 1 detik\nSistem anti spam aktif')} \n🚀 walzy`, {parse_mode:'HTML'});
  }

  // Cek join channel
  const joinCheck = await checkJoin(bot, chatId);
  if(!joinCheck.joined){
    const joinButtons = joinCheck.notJoined.map(ch=>[{text:'📢 Join '+ch.title, url:ch.url}]);
    joinButtons.push([{text:'✅ Sudah Join - Cek Lagi', callback_data:'check_join'}]);
    return bot.sendMessage(chatId, `🔒 <b>Akses Terkunci</b>\n${bq(`Kamu harus join channel dulu untuk pakai bot\n\nChannel wajib:\n${joinCheck.notJoined.map(c=>`• ${c.title}`).join('\n')}\n\nSetelah join, klik tombol cek lagi`)} \n🚀 walzy`, {parse_mode:'HTML', reply_markup:{inline_keyboard:joinButtons}});
  }

  // Awaiting broadcast (owner)
  if(user.awaitingBroadcast && isOwner(chatId)){
    if(text.toLowerCase()==='batal'){
      user.awaitingBroadcast=false;
      await saveDB(db);
      const m=getOwnerMenu(chatId,db,user);
      return bot.sendMessage(chatId,m.text,m.opts);
    }
    if(text.length<5) return bot.sendMessage(chatId, `❌ <b>Pesan Terlalu Pendek</b>\n${bq('Minimal 5 karakter ya')} \n🚀 walzy`, {parse_mode:'HTML'});
    if(text.length>1000) return bot.sendMessage(chatId, `❌ <b>Pesan Terlalu Panjang</b>\n${bq('Maksimal 1000 karakter\nSaat ini: '+text.length+' karakter')} \n🚀 walzy`, {parse_mode:'HTML'});
    
    const unique=getUniqueUsers(db.users);
    let sent=0, failed=0;
    const statusMsg = await bot.sendMessage(chatId, `📢 <b>Broadcast Dimulai</b>\n${bq(`Mengirim ke ${unique.length} pengguna...\n0/${unique.length} terkirim`)} \n🚀 walzy`, {parse_mode:'HTML'});
    
    // Batch broadcast biar gak timeout
    for(let i=0;i<unique.length;i++){
      const u=unique[i];
      try{ 
        await bot.sendMessage(u.id, `📢 <b>Siaran dari Walzy Store</b>\n\n${bq(esc(text))}\n\n🚀 <i>walzy store</i>`, {parse_mode:'HTML'}); 
        sent++; 
      }catch(e){ failed++; }
      if(i%10===0){
        try{ await bot.editMessageText(`📢 <b>Broadcast Berjalan</b>\n${bq(`${i}/${unique.length} terkirim\n✅ Sukses: ${sent} | ❌ Gagal: ${failed}`)} \n🚀 walzy`, {chat_id:chatId,message_id:statusMsg.message_id,parse_mode:'HTML'}); }catch(e){}
        await new Promise(r=>setTimeout(r,300)); // jeda biar gak kena limit Telegram
      }else{
        await new Promise(r=>setTimeout(r,70));
      }
    }
    user.awaitingBroadcast=false;
    await saveDB(db);
    return bot.editMessageText(`✅ <b>Broadcast Selesai</b>\n${bq(`Total: ${unique.length} pengguna\n✅ Terkirim: ${sent}\n❌ Gagal: ${failed}\n\nPesan:\n${esc(text.substring(0,200))}${text.length>200?'...':''}`)} \n🚀 walzy`, {chat_id:chatId,message_id:statusMsg.message_id,parse_mode:'HTML'});
  }

  // Awaiting support
  if(user.awaitingSupport){
    if(text.toLowerCase()==='batal'){
      user.awaitingSupport=false;
      await saveDB(db);
      const m=getUserMenu(chatId,db,user);
      return bot.sendMessage(chatId,m.text,m.opts);
    }
    if(!checkSupportRate(chatId)){
      return bot.sendMessage(chatId, `⏳ <b>Tunggu Dulu</b>\n${bq('Kamu baru saja mengirim keluhan\nTunggu 1 menit sebelum kirim lagi')} \n🚀 walzy`, {parse_mode:'HTML'});
    }
    if(text.length<10) return bot.sendMessage(chatId, `❌ <b>Keluhan Terlalu Pendek</b>\n${bq('Minimal 10 karakter\nJelaskan keluhanmu dengan jelas')} \n🚀 walzy`, {parse_mode:'HTML'});
    if(text.length>500) return bot.sendMessage(chatId, `❌ <b>Keluhan Terlalu Panjang</b>\n${bq('Maksimal 500 karakter\nSaat ini: '+text.length+' karakter')} \n🚀 walzy`, {parse_mode:'HTML'});
    
    user.awaitingSupport=false;
    await saveDB(db);
    
    // Kirim ke owner
    for(let ownerId of config.OWNER_IDS){
      try{
        await bot.sendMessage(ownerId, `💬 <b>Keluhan Baru Masuk</b>\n${bq(`👤 Dari: ${esc(user.first_name)} (<code>${chatId}</code>)\n📝 Keluhan:\n${esc(text)}\n\n⏰ ${new Date().toLocaleString('id-ID',{timeZone:'Asia/Jakarta'})}`)} \n🚀 walzy`, {parse_mode:'HTML'});
      }catch(e){}
    }
    return bot.sendMessage(chatId, `✅ <b>Keluhan Terkirim</b>\n${bq(`Terima kasih, ${esc(user.first_name)}!\nKeluhanmu sudah diteruskan ke owner\nOwner akan segera merespon\n\nRingkasan keluhan:\n${esc(text.substring(0,100))}${text.length>100?'...':''}`)} \n🚀 walzy`, {parse_mode:'HTML'});
  }

  // Handle photo proof
  if(msg.photo && user.pendingDeposit){
    const pay = db.payments[user.pendingDeposit];
    if(!pay) { user.pendingDeposit=null; await saveDB(db); return; }
    pay.status='waiting_approval';
    pay.proofPhoto = msg.photo[msg.photo.length-1].file_id;
    pay.proofAt = Date.now();
    await saveDB(db);
    
    // Notif ke owner
    for(let ownerId of config.OWNER_IDS){
      try{
        await bot.sendPhoto(ownerId, pay.proofPhoto, {
          caption:`📤 <b>Bukti Transfer Masuk</b>\n${bq(`Invoice: <code>${pay.id}</code>\nUser: ${esc(user.first_name)} (<code>${chatId}</code>)\nPaket: ${pay.days} Hari\nJumlah: ${fmtMoney(pay.amount)}\n\nCek dan ACC segera!`)}\n🚀 walzy`,
          parse_mode:'HTML',
          reply_markup:{inline_keyboard:[[{text:'✅ Setujui',callback_data:'approve_'+pay.id},{text:'❌ Tolak',callback_data:'reject_'+pay.id}]]}
        });
      }catch(e){}
    }
    return bot.sendMessage(chatId, `✅ <b>Bukti Diterima</b>\n${bq(`Invoice: <code>${pay.id}</code>\nStatus: <code>Menunggu ACC Owner</code>\n\nBukti transfer kamu sudah diteruskan ke owner\nOwner akan cek maksimal 5-10 menit\nKamu akan dapat notifikasi setelah di-ACC\n\nTerima kasih! 🙏`)} \n🚀 walzy`, {parse_mode:'HTML'});
  }

  // Commands
  if(text.startsWith('/start')){
    const refMatch = text.match(/\/start\s+(\d+)/);
    if(refMatch){
      const refId = refMatch[1];
      if(refId!==String(chatId) && !isSuspiciousId(refId) && db.users[refId] && !user.referredBy){
        user.referredBy = refId;
        const refUser = db.users[refId];
        if(refUser){
          refUser.referralCount = (refUser.referralCount||0)+1;
          if(!refUser.referrals.includes(String(chatId))) refUser.referrals.push(String(chatId));
          try{ await bot.sendMessage(refId, `🎉 <b>Referral Baru!</b>\n${bq(`${esc(user.first_name)} bergabung via link kamu\nTotal referral: ${refUser.referralCount}`)} \n🚀 walzy`, {parse_mode:'HTML'}); }catch(e){}
        }
      }
    }
    const m = isOwner(chatId) ? getOwnerMenu(chatId,db,user) : getUserMenu(chatId,db,user);
    return bot.sendMessage(chatId,m.text,m.opts);
  }

  if(text.startsWith('/gen') && isOwner(chatId)){
    const parts=text.split(/\s+/);
    if(parts.length<3) return bot.sendMessage(chatId, `❌ <b>Format Salah</b>\n${bq(`Cara pakai:\n/gen KODE HARI [KUOTA]\n\nContoh:\n/gen WALZY30 30\n/gen VIP7 7 10\n\nKODE = nama voucher\nHARI = durasi VIP\nKUOTA = batas pakai (opsional, 0=unlimited)`)} \n🚀 walzy`, {parse_mode:'HTML'});
    const code=parts[1].toUpperCase();
    const days=parseInt(parts[2]);
    const quota=parseInt(parts[3])||0;
    if(!code || !days || days<=0) return bot.sendMessage(chatId, `❌ <b>Data Tidak Valid</b>\n${bq('Kode dan hari harus diisi dengan benar')} \n🚀 walzy`, {parse_mode:'HTML'});
    if(db.codes[code]) return bot.sendMessage(chatId, `❌ <b>Kode Sudah Ada</b>\n${bq(`Voucher ${code} sudah ada\nPakai kode lain`)} \n🚀 walzy`, {parse_mode:'HTML'});
    db.codes[code]={code,days,quota,used:0,createdAt:Date.now(),type:quota===1?'private':'public',createdBy:String(chatId)};
    await saveDB(db);
    return bot.sendMessage(chatId, `✅ <b>Voucher Dibuat</b>\n${bq(`🎫 Kode: <code>${code}</code>\n⏰ Durasi: ${days} Hari\n👥 Kuota: ${quota||'Unlimited'}\n📅 Dibuat: ${new Date().toLocaleDateString('id-ID')}`)} \n🚀 walzy`, {parse_mode:'HTML'});
  }

  if(text.startsWith('/redeem')){
    const code=text.split(/\s+/)[1];
    if(!code) return bot.sendMessage(chatId, `❌ <b>Kode Kosong</b>\n${bq('Ketik: /redeem KODE\nContoh: /redeem WALZY30')} \n🚀 walzy`, {parse_mode:'HTML'});
    const c=db.codes[code.toUpperCase()];
    if(!c) return bot.sendMessage(chatId, `❌ <b>Kode Tidak Valid</b>\n${bq(`Voucher ${code.toUpperCase()} tidak ditemukan\nCek kembali kodenya`)} \n🚀 walzy`, {parse_mode:'HTML'});
    const days=typeof c==='object' ? c.days : c;
    const quota=typeof c==='object' ? (c.quota||0) : 0;
    const used=typeof c==='object' ? (c.used||0) : 0;
    if(quota>0 && used>=quota) return bot.sendMessage(chatId, `❌ <b>Voucher Habis</b>\n${bq(`Voucher ${code.toUpperCase()} sudah habis\nTerpakai: ${used}/${quota}`)} \n🚀 walzy`, {parse_mode:'HTML'});
    user.premiumUntil=Math.max(Date.now(),user.premiumUntil||0)+days*86400000;
    if(typeof c==='object'){
      c.used=(c.used||0)+1;
      if(c.type==='private' && quota===1) delete db.codes[code.toUpperCase()];
    }else delete db.codes[code.toUpperCase()];
    await saveDB(db);
    return bot.sendMessage(chatId, `✅ <b>Voucher Berhasil Ditukar!</b>\n${bq(`🎫 Kode: ${code.toUpperCase()}\n💎 VIP: ${days} Hari\n📅 Aktif sampai: ${new Date(user.premiumUntil).toLocaleDateString('id-ID')}\n\nSelamat! Akun kamu sekarang VIP ✨`)} \n🚀 walzy`, {parse_mode:'HTML'});
  }

  // Default menu
  const m = isOwner(chatId) ? getOwnerMenu(chatId,db,user) : getUserMenu(chatId,db,user);
  return bot.sendMessage(chatId,m.text,m.opts);
}

async function handleCallback(bot, db, query){
  const chatId = query.message.chat.id;
  const msgId = query.message.message_id;
  const data = query.data;
  const user = getUser(db, chatId);
  if(!user) return;

  if(data==='check_join'){
    joinCache.delete(String(chatId));
    const joinCheck = await checkJoin(bot, chatId);
    if(joinCheck.joined){
      const m = isOwner(chatId) ? getOwnerMenu(chatId,db,user) : getUserMenu(chatId,db,user);
      await bot.editMessageText(m.text, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:m.opts.reply_markup});
    }else{
      await bot.answerCallbackQuery(query.id,{text:'Belum join semua channel!'});
    }
    return;
  }

  if(data==='menu_main'){
    const m = isOwner(chatId) ? getOwnerMenu(chatId,db,user) : getUserMenu(chatId,db,user);
    return bot.editMessageText(m.text, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:m.opts.reply_markup});
  }

  if(data==='menu_fix'){
    const can = canUseFix(db,user);
    if(!can.allowed){
      return bot.editMessageText(`⏳ <b>Batas Harian Habis</b>\n${bq(`Kamu sudah pakai 3x hari ini\n\n💡 <b>Solusi:</b>\n• Tunggu besok reset jam 00:00 WIB\n• Atau upgrade ke VIP unlimited\n• VIP mulai dari Rp 15K aja`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'💎 Upgrade VIP',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
    }
    return bot.editMessageText(`🔧 <b>Fix Merah - Scraping Bot</b>\n${bq(`Sisa hari ini: ${can.remaining}x\nStatus: ${can.isPremium?'💎 VIP Unlimited':'🎫 Gratis'}\n\nKirim nomor target yang mau di-fix\n\nFormat: 08xxxx atau 62xxxx\nContoh: 08123456789`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='menu_order'){
    const payments = Object.values(db.payments||{}).filter(p=>p.status==='waiting_approval').slice(-10);
    if(payments.length===0){
      return bot.editMessageText(`📦 <b>Order Pending</b>\n${bq(`✅ Semua clear!\nTidak ada order yang menunggu ACC\n\nSemua pembayaran sudah diproses`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
    }
    let t=`📦 <b>Order Pending (${payments.length})</b>\n<i>Perlu ACC segera</i>\n\n`;
    payments.forEach(p=>{
      t+=`${bq(`🧾 <code>${p.id}</code>\n👤 ${p.userId} • ${p.days}H • ${fmtMoney(p.amount)}\n📅 ${new Date(p.createdAt).toLocaleString('id-ID')}`)}\n`;
    });
    t+=`\n🚀 walzy`;
    const kb = payments.slice(0,5).map(p=>[{text:`✅ ACC ${p.id.slice(-6)}`,callback_data:'approve_'+p.id},{text:`❌ Tolak`,callback_data:'reject_'+p.id}]);
    kb.push([{text:'◁ Kembali',callback_data:'menu_main'}]);
    return bot.editMessageText(t,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:kb}});
  }

  if(data.startsWith('confirm_')){
    const inv=data.split('confirm_')[1];
    const pay=db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id,{text:'Invoice tidak ditemukan'});
    pay.status='waiting_proof';
    db.users[String(chatId)].pendingDeposit=inv;
    await saveDB(db);
    return bot.editMessageText(`📤 <b>Konfirmasi Pembayaran</b>\n${bq(`Invoice: <code>${inv}</code>\nJumlah: ${fmtMoney(pay.amount)}\nPaket: ${pay.days} Hari\n\n📸 Silakan kirim foto bukti transfer sekarang\nPastikan foto jelas dan terbaca`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
  }

  if(data.startsWith('approve_')){
    if(!isOwner(chatId)) return bot.answerCallbackQuery(query.id,{text:'Kamu bukan owner!'});
    const inv=data.split('approve_')[1];
    const pay=db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id,{text:'Invoice tidak ditemukan'});
    if(pay.status==='paid') return bot.editMessageText(`✅ <b>Sudah Disetujui</b>\n${bq(`Invoice ${inv} sudah disetujui sebelumnya`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
    if(isSuspiciousId(pay.userId)) return bot.editMessageText(`⚠️ <b>User Tidak Valid</b>\n${bq(`${inv} user tidak valid`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
    pay.status='paid';
    const u=getUser(db,pay.userId);
    if(!u) return;
    u.premiumUntil=Math.max(Date.now(),u.premiumUntil||0)+pay.days*86400000;
    u.pendingDeposit=null;
    db.stats.revenue=(db.stats.revenue||0)+pay.amount;
    if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory=[];
    db.stats.revenueHistory.push({date:new Date().toISOString(),amount:pay.amount,invoice:inv,userId:pay.userId});
    await saveDB(db);
    await bot.editMessageText(`✅ <b>Berhasil Disetujui</b>\n${bq(`Invoice: ${inv}\nUser: ${pay.userId}\nPaket: ${pay.days} Hari\nNotifikasi sudah dikirim ke user`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
    try{ await bot.sendMessage(pay.userId, `✅ <b>Pembayaran Disetujui!</b>\n${bq(`Invoice: ${inv} LUNAS\nPaket: ${pay.days} Hari VIP\nAktif sampai: ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}\n\nTerima kasih sudah berlangganan!\nSekarang kamu bisa pakai semua fitur VIP ✨`)} \n🚀 walzy`, {parse_mode:'HTML'}); }catch{}
    return;
  }

  if(data.startsWith('reject_')){
    if(!isOwner(chatId)) return;
    const inv=data.split('reject_')[1];
    const pay=db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id,{text:'Invoice tidak ditemukan'});
    pay.status='rejected';
    const u=getUser(db,pay.userId);
    if(u) u.pendingDeposit=null;
    await saveDB(db);
    await bot.editMessageText(`❌ <b>Ditolak</b>\n${bq(`Invoice ${inv} ditolak\nUser akan diberi tahu`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
    try{ await bot.sendMessage(pay.userId, `❌ <b>Pembayaran Ditolak</b>\n${bq(`Invoice: ${inv} ditolak\n\nSilakan hubungi owner jika ada kesalahan\nAtau buat invoice baru`)} \n🚀 walzy`, {parse_mode:'HTML'}); }catch{}
    return;
  }

  if(data==='owner_users' && isOwner(chatId)){
    const unique=getUniqueUsers(db.users);
    let t=`👥 <b>Daftar Pengguna - Real Data</b>\n<i>Data valid anti double</i>\n\n${bq(`Total valid: ${unique.length} pengguna\nData real-time bukan gimmick`)}\n\n`;
    unique.slice(-12).reverse().forEach(u=>{
      const icn=isPremium(u) ? '💎' : '🎫';
      const status = isPremium(u) ? `VIP ${getPremiumLeft(u)}H` : `Free ${u.dailyFix?.count||0}/3`;
      t+=`${bq(`${icn} <code>${u.id}</code>\n├ ${esc((u.first_name||'User').substring(0,16))} • ${u.totalFix||0} order\n└ ${status}`)}\n`;
    });
    t+=`\n🚀 <i>walzy store • ${unique.length} total pengguna</i>`;
    return bot.editMessageText(t,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎨 Buka di WebApp',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='owner_voucher' && isOwner(chatId)){
    const codes=Object.values(db.codes||{}).slice(-12);
    let t=`🎟️ <b>Manajemen Voucher</b>\n<i>Buat & kelola kode redeem</i>\n\n${bq(`Fitur lengkap owner:\n• Buat voucher dengan kuota custom\n• Atur durasi VIP berapa hari\n• Public / Private voucher\n\nCara buat:\nVia WebApp atau /gen KODE HARI KUOTA`)}\n\n`;
    if(codes.length>0){
      t+=`<b>Voucher Terbaru:</b>\n`;
      codes.reverse().forEach(c=>{
        const code=typeof c==='object' ? c.code : 'CODE';
        const days=typeof c==='object' ? c.days : c;
        const quota=typeof c==='object' ? (c.quota||0) : 0;
        const used=typeof c==='object' ? (c.used||0) : 0;
        const type=typeof c==='object' ? (c.type||'public') : 'legacy';
        t+=`${bq(`🎫 <code>${code}</code> • ${days}H • ${type}\n├ Kuota: ${quota||'∞'} • Pakai: ${used}\n└ Status: ${quota>0 && used>=quota?'❌ Habis':'✅ Aktif'}`)}\n`;
      });
    }else{
      t+=`${bq('Belum ada voucher\nBuat voucher pertama sekarang!')}\n`;
    }
    t+=`\n🚀 walzy`;
    return bot.editMessageText(t,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎨 Buat di Studio',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='menu_stats'){
    const validUsers=getUniqueUsers(db.users);
    const todayOrders=Object.values(db.payments||{}).filter(p=>{
      if(isSuspiciousId(p.userId)) return false;
      const d=new Date(p.createdAt); const now=new Date();
      return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
    }).length;
    const pending=Object.values(db.payments||{}).filter(p=>p.status==='waiting_approval').length;
    const revenue=db.stats.revenue||0;
    const txt=`📊 <b>Statistik Lengkap Walzy</b>\n<i>Data real-time anti gimmick</i>\n\n${bq(`👥 <b>Pengguna</b>\n├ Valid: <code>${validUsers.length}</code> orang\n├ VIP: <code>${validUsers.filter(u=>isPremium(u)).length}</code> orang\n└ Free: <code>${validUsers.length - validUsers.filter(u=>isPremium(u)).length}</code> orang\n\n📦 <b>Order</b>\n├ Total: <code>${db.stats.totalFix||0}</code>\n├ Hari Ini: <code>${todayOrders}</code>\n├ Pending: <code>${pending}</code>\n├ Sukses: <code>${db.stats.totalSuccess||0}</code>\n└ Gagal: <code>${db.stats.totalFailed||0}</code>\n\n💰 <b>Revenue</b>\n├ Total: <code>${fmtMoney(revenue)}</code>\n└ Rasio Sukses: <code>${db.stats.totalFix ? Math.round((db.stats.totalSuccess/db.stats.totalFix)*100) : 0}%</code>`)} \n\n🚀 <i>walzy store • Update: ${new Date().toLocaleTimeString('id-ID')}</i>`;
    return bot.editMessageText(txt,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎨 Lihat di WebApp',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='menu_broadcast' && isOwner(chatId)){
    db.users[String(chatId)].awaitingBroadcast=true;
    await saveDB(db);
    return bot.editMessageText(`📢 <b>Broadcast ke Semua User</b>\n${bq(`Kirim pesan siaran ke semua pengguna valid\n\n📝 <b>Cara pakai:</b>\n• Ketik pesan yang mau disiarkan\n• Maksimal 1000 karakter\n• Gunakan bahasa yang jelas & sopan\n• Sistem akan kirim otomatis\n\nKetik "batal" untuk membatalkan`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'❌ Batal',callback_data:'cancel_action'}]]}});
  }

  if(data==='menu_packages'){
    return bot.editMessageText(`💎 <b>Paket Premium Walzy</b>\n${bq(`🔥 <b>Starter 7 Hari - Rp 15K</b>\n├ Cocok untuk pemula\n├ Unlimited fix\n└ Support prioritas\n\n⭐ <b>Pro 30 Hari - Rp 45K (Best Seller)</b>\n├ Paling laris, hemat 40%\n├ Unlimited fix + bonus\n└ Bonus spin harian\n\n👑 <b>Sultan 90 Hari - Rp 99K</b>\n├ Untuk power user\n├ Semua fitur + prioritas tertinggi\n└ Bonus referral 2x`)} \n\n<i>Buka WebApp untuk beli paket 👇</i>\n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎨 Buka Store',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='menu_profile'){
    const rnk=getRank(user.referralCount||0);
    const can=canUseFix(db,user);
    return bot.editMessageText(`👤 <b>Profil Saya</b>\n${bq(`Nama: <b>${esc(user.first_name)}</b>\nID: <code>${user.id}</code>\nUsername: @${esc(user.username||'tidak ada')}\n\n💎 Status: ${isPremium(user)?`VIP ${getPremiumLeft(user)} Hari`:`Free ${can.remaining}/3`}\n🏆 Rank: ${rnk.name} ${rnk.icon}\n👥 Referral: ${user.referralCount||0} orang\n📦 Total Order: ${user.totalFix||0}\n📅 Gabung: ${new Date(user.joinedAt).toLocaleDateString('id-ID')}\n\n📊 Penggunaan Hari Ini: ${user.dailyFix.count}/3`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='menu_spin'){
    const canSpin = !user.lastSpin || user.lastSpin!==getTodayString();
    return bot.editMessageText(`🎰 <b>Spin Harian</b>\n${bq(`${canSpin?'🎉 Kamu bisa spin hari ini!':'⏳ Sudah spin hari ini, coba lagi besok'}\n\n🎁 <b>Hadiah yang bisa didapat:</b>\n• Bonus 1 Pesanan\n• VIP 1 Hari Gratis\n• 5 Poin Referral\n\nSpin reset setiap jam 00:00 WIB`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:canSpin?'🎰 Putar Sekarang':'✅ Sudah Diklaim',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='menu_referral'){
    const botUsername = (await bot.getMe()).username;
    const link = `https://t.me/${botUsername}?start=${chatId}`;
    return bot.editMessageText(`🔗 <b>Referral Saya</b>\n${bq(`Ajak teman pakai Walzy Store\nDapat bonus setiap teman bergabung\n\n🔗 Link Referral Kamu:\n${link}\n\n👥 Total Referral: ${user.referralCount||0} orang\n🏆 Rank: ${getRank(user.referralCount||0).name}\n\n💡 <b>Keuntungan Referral:</b>\n• Naik rank lebih cepat\n• Bonus VIP\n• Prioritas support`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'📋 Salin Link',callback_data:'copy_ref'}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='menu_help'){
    return bot.editMessageText(`📜 <b>Bantuan Walzy Store</b>\n${bq(`❓ <b>FAQ:</b>\n\nQ: Gimana cara pakai bot?\nA: Pilih paket premium, bayar, upload bukti, tunggu ACC\n\nQ: Berapa lama ACC?\nA: Maksimal 5-10 menit (owner online)\n\nQ: Gratis bisa berapa kali?\nA: 3x per hari, reset jam 00:00 WIB\n\nQ: VIP unlimited?\nA: Ya, VIP bisa pakai tanpa batas\n\nQ: Cara redeem voucher?\nA: Ketik /redeem KODE atau via WebApp\n\n💬 Butuh bantuan lebih?\nKlik Hubungi Owner`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'💬 Hubungi Owner',callback_data:'user_contact_owner'}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
  }

  if(data==='user_contact_owner'){
    db.users[String(chatId)].awaitingSupport=true;
    await saveDB(db);
    return bot.editMessageText(`💬 <b>Hubungi Owner</b>\n${bq(`Tulis keluhan atau pertanyaan kamu\nMaksimal 500 karakter\nGunakan bahasa yang jelas & sopan\n\nContoh:\n"Min, saya sudah transfer tapi belum di-ACC"\n"Min, bot error pas fix nomor 08xxx"\n\nKetik "batal" untuk membatalkan`)} \n🚀 walzy`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'❌ Batal',callback_data:'cancel_action'}]]}});
  }

  if(data==='cancel_action'){
    user.awaitingBroadcast=false;
    user.awaitingSupport=false;
    user.awaitingNumber=false;
    await saveDB(db);
    const m = isOwner(chatId) ? getOwnerMenu(chatId,db,user) : getUserMenu(chatId,db,user);
    return bot.editMessageText(m.text,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:m.opts.reply_markup});
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
    res.status(200).json({ok:true,ts:Date.now()});
  }catch(e){
    console.error('BOT ERROR:',e);
    res.status(200).json({ok:false,error:e.message});
  }
};
