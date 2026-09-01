const TelegramBot = require('node-telegram-bot-api');
const { loadDB, saveDB, getTodayString, esc, getRank } = require('../lib/utils');
const config = require('../config');
const rateLimitMap = new Map();

function isOwner(id){
  if(!config.OWNER_IDS || !Array.isArray(config.OWNER_IDS)) return false;
  return config.OWNER_IDS.map(String).includes(String(id));
}

function isSuspiciousId(id){
  if(!id) return true;
  const s=String(id);
  const n=Number(id);
  if(!n || n<=0 || s.startsWith('-')) return true;
  return false;
}

function ensureDB(db){
  if(!db.users) db.users={};
  if(!db.payments) db.payments={};
  if(!db.codes) db.codes={};
  if(!db.stats) db.stats={totalFix:0,totalSuccess:0,totalFailed:0,revenue:0,revenueHistory:[],lastReset:Date.now()};
}

function checkRateLimit(id){
  const now=Date.now();
  const last=rateLimitMap.get(String(id))||0;
  if(now-last<500) return false;
  rateLimitMap.set(String(id),now);
  return true;
}

function getUser(db, id, msgFrom){
  const k=String(id);
  if(isSuspiciousId(k)) return null;
  const firstName=msgFrom && msgFrom.first_name ? msgFrom.first_name : 'User';
  const username=msgFrom && msgFrom.username ? msgFrom.username : '';
  if(!db.users[k]){
    db.users[k]={
      id:Number(id)||id,
      first_name:firstName,
      username:username,
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
      lastCheckin:null,
      state:null
    };
  }else{
    if(firstName && db.users[k].first_name!==firstName) db.users[k].first_name=firstName;
    if(username!==undefined && db.users[k].username!==username) db.users[k].username=username;
  }
  return db.users[k];
}

function isPremium(u){
  return u && u.premiumUntil && u.premiumUntil>Date.now();
}

function getPremiumLeft(u){
  if(!isPremium(u)) return null;
  return Math.ceil((u.premiumUntil-Date.now())/86400000);
}

function getWeekIndex(){
  return Math.floor(Date.now()/(7*24*3600*1000))%4;
}

function getWebappUrl(req){
  if(config.PUBLIC_URL && config.PUBLIC_URL.startsWith('http')){
    return config.PUBLIC_URL.endsWith('/') ? `${config.PUBLIC_URL}webapp` : `${config.PUBLIC_URL}/webapp`;
  }
  const host=req.headers.host||req.headers['x-forwarded-host']||'localhost';
  const proto=req.headers['x-forwarded-proto']||'https';
  return `${proto}://${host}/webapp`;
}

function getOwnerMenu(user, chatId, db, webappUrl){
  const allPayments=Object.values(db.payments||{});
  const pendingCount=allPayments.filter(p=>p.status==='waiting_approval' || p.status==='pending').length;
  const usersCount=Object.keys(db.users||{}).length;
  const revenue=db.stats && db.stats.revenue ? db.stats.revenue : 0;
  const dispName=esc(user.first_name||'Owner');
  const week=getWeekIndex()+1;
  const text=`<b>👑 WALZY OWNER • EXECUTIVE CONTROL</b>\n\nHalo <b>${dispName}</b> 👋\n\n<blockquote>📊 <b>Live Executive Stats</b>\n├ 👥 Users: <code>${usersCount}</code>\n├ 💰 Revenue: <code>Rp ${revenue.toLocaleString('id-ID')}</code>\n├ 📥 Pending: <code>${pendingCount}</code> transaksi\n└ 📅 Week: <code>Minggu ${week}</code></blockquote>\n\n🎛️ <i>Kelola semua transaksi, user, voucher & broadcast langsung dari Web Control di bawah. System realtime & auto refresh.</i>`;
  const keyboard=[
    [{text:'⚡ FIX MERAH • Quantum Engine', callback_data:'fix_merah'}],
    [{text:'🖥️ WEB CONTROL • Premium Dashboard', web_app:{url:webappUrl}}]
  ];
  return {text, opts:{parse_mode:'HTML', reply_markup:{inline_keyboard:keyboard}}};
}

function getUserMenu(user, chatId, webappUrl){
  const rnk=getRank(user.referralCount||0);
  const isPrem=isPremium(user);
  if(!user.dailyFix || user.dailyFix.date!==getTodayString()){
    user.dailyFix={date:getTodayString(),count:0};
  }
  const quota=isPrem ? 'Unlimited ♾️' : `${Math.max(0,5-(user.dailyFix.count||0))}/5`;
  const dispName=esc(user.first_name||'User');
  const status=isPrem ? `VIP ${getPremiumLeft(user)}H • Unlimited` : 'Free Member';
  const week=getWeekIndex()+1;
  const text=`<b>✨ WALZY STORE • PREMIUM</b>\n\nHalo <b>${dispName}</b> 👋\n\n<blockquote>👤 <b>${rnk.icon} ${rnk.name} • ${status}</b>\n├ ⚡ Kuota: <code>${quota}</code>\n├ 🪙 Poin: <code>${user.points||0} PTS</code>\n├ 👥 Referral: <code>${user.referralCount||0}</code>\n├ 🔥 Streak: <code>${user.checkinStreak||0} Hari</code>\n└ 📅 Week: <code>Minggu ${week}</code> • Poin berbeda tiap minggu</blockquote>\n\n🎁 <i>Beranda = Profil real kamu, Produk = Beli VIP lengkap upload bukti, Daily = Check-in mingguan + Spin presisi + Toko Poin rapi.</i>\n\n👇 Pilih menu:`;
  const keyboard=[
    [{text:'⚡ FIX MERAH • Premium', callback_data:'fix_merah'}],
    [{text:'🛒 WEB STORE • Produk', web_app:{url:webappUrl}}, {text:'🎡 SPIN WHEEL • Daily', callback_data:'open_spin'}],
    [{text:'💬 HUBUNGI ADMIN', callback_data:'contact_owner'}, {text:'❓ PANDUAN LENGKAP', callback_data:'help'}]
  ];
  return {text, opts:{parse_mode:'HTML', reply_markup:{inline_keyboard:keyboard}}};
}

module.exports = async (req, res) => {
  if(req.method!=='POST') return res.status(200).send('WALZY BOT V5 FINAL ONLINE');
  const bot=new TelegramBot(config.BOT_TOKEN);
  try{
    const db=await loadDB();
    ensureDB(db);
    const update=req.body;
    if(!update) return res.status(200).send('OK');
    const webappUrl=getWebappUrl(req);

    if(update.callback_query){
      const q=update.callback_query;
      const qId=q.id;
      const uid=q.from.id;
      const data=q.data;
      if(!checkRateLimit(uid)){
        try{ await bot.answerCallbackQuery(qId,{text:'Tunggu sebentar'}); }catch(e){}
        return res.status(200).send('OK');
      }
      const user=getUser(db, uid, q.from);
      if(!user) return res.status(200).send('OK');

      if(data==='fix_merah'){
        await bot.answerCallbackQuery(qId,{text:'Fix Merah Engine'});
        user.state={action:'awaiting_fixmerah_number'};
        await saveDB(db);
        await bot.sendMessage(uid, `<b>⚡ FIX MERAH • QUANTUM ENGINE</b>\n\nKirim nomor WA target dengan format:\n\n<code>08123456789</code> atau <code>628xxx</code>\n\n<blockquote>💡 Tips: Nomor aktif & sinyal bagus untuk hasil maksimal. Kuota Free 5/hari, VIP Unlimited.</blockquote>`, {parse_mode:'HTML'});
        return res.status(200).send('OK');
      }

      if(data==='open_spin'){
        await bot.answerCallbackQuery(qId,{text:'Buka Daily'});
        await bot.sendMessage(uid, `<b>🎡 DAILY REWARDS</b>\n\nBuka Web Store > Tab Daily untuk:\n• Check-in mingguan (poin berbeda tiap minggu)\n• Spin Wheel presisi (berhenti sesuai hadiah)\n• Toko Poin rapi (kuota, VIP, bonus)\n\nSemua realtime tanpa logout.`, {parse_mode:'HTML', reply_markup:{inline_keyboard:[[{text:'🛒 BUKA WEB STORE • Daily', web_app:{url:webappUrl}}]]}});
        return res.status(200).send('OK');
      }

      if(data==='contact_owner'){
        await bot.answerCallbackQuery(qId,{text:'Hubungi Admin'});
        user.state={action:'awaiting_owner_msg'};
        await saveDB(db);
        await bot.sendMessage(uid, `<b>💬 HUBUNGI ADMIN • Real Support</b>\n\nKetik pesan kamu, akan diteruskan realtime ke owner & owner bisa balas langsung ke kamu di sini.`, {parse_mode:'HTML'});
        return res.status(200).send('OK');
      }

      if(data==='help'){
        await bot.answerCallbackQuery(qId,{text:'Panduan Lengkap'});
        const helpText=`<b>📚 WALZY STORE • PANDUAN LENGKAP</b>\n\n<blockquote>⚡ <b>FIX MERAH</b>\nKlik Fix Merah > kirim nomor WA > tunggu proses quantum. Kuota Free 5/hari, VIP Unlimited ♾️</blockquote>\n\n<blockquote>🏠 <b>BERANDA</b>\nProfil real kamu disatukan di Beranda: ID, Rank, Status, Premium, Kuota, Total Fix, Poin, Referral, Streak, Link Referral, Voucher redeem, Invoice & Riwayat realtime.</blockquote>\n\n<blockquote>🛒 <b>PRODUK</b>\nBeli VIP Trial 3H, Hemat 5H, Starter 7H, Pro 14H, Sultan 30H. Invoice lengkap dengan upload bukti pembayaran DANA, verifikasi realtime owner.</blockquote>\n\n<blockquote>📅 <b>DAILY</b>\n• Check-in: Poin berbeda tiap minggu (Minggu 1-4)\n• Spin: Fix presisi berhenti sesuai hadiah (formula 270°)\n• Toko Poin: Toko rapi +1 Kuota 100PTS, +3 Kuota 250PTS, Reset Spin 150PTS, VIP 1H 500PTS, VIP 3H 1200PTS, +200 Bonus 300PTS</blockquote>\n\n<blockquote>💬 <b>HUBUNGI ADMIN</b>\nPesan diteruskan ke owner dengan tombol balas.</blockquote>\n\n<i>Semua data realtime auto refresh 2.5 detik tanpa logout.</i>`;
        await bot.sendMessage(uid, helpText, {parse_mode:'HTML'});
        return res.status(200).send('OK');
      }

      if(data.startsWith('reply_user_')){
        const targetId=data.replace('reply_user_','');
        if(!isOwner(uid)) return res.status(200).send('OK');
        user.state={action:'replying_to_user',targetId:targetId};
        await saveDB(db);
        await bot.answerCallbackQuery(qId,{text:'Mode balas'});
        await bot.sendMessage(uid, `<b>💬 BALAS USER ${targetId}</b>\n\nKetik pesan balasan untuk user ID <code>${targetId}</code>`, {parse_mode:'HTML'});
        return res.status(200).send('OK');
      }

      await bot.answerCallbackQuery(qId,{text:'OK'});
      return res.status(200).send('OK');
    }

    if(update.message){
      const msg=update.message;
      const chatId=msg.chat.id;
      const uid=msg.from.id;
      if(!checkRateLimit(uid)) return res.status(200).send('OK');
      const user=getUser(db, uid, msg.from);
      if(!user) return res.status(200).send('OK');
      const text=(msg.text||'').trim();
      const st=user.state;

      if(st && st.action==='awaiting_fixmerah_number' && text && !text.startsWith('/')){
        user.state=null;
        let cleanDigits=text.replace(/[^\d]/g,'');
        if(!cleanDigits){
          await saveDB(db);
          await bot.sendMessage(chatId, `<b>Format nomor tidak valid</b>\n\nContoh: <code>08123456789</code>`, {parse_mode:'HTML'});
          return res.status(200).send('OK');
        }
        const isPrem=isPremium(user);
        if(!isPrem){
          if(!user.dailyFix || user.dailyFix.date!==getTodayString()){
            user.dailyFix={date:getTodayString(),count:0};
          }
          if(user.dailyFix.count>=5){
            await saveDB(db);
            await bot.sendMessage(chatId, `<b>⚠️ KUOTA HABIS</b>\n\nKuota Free 5/5 habis hari ini. Upgrade VIP untuk Unlimited di Web Store > Produk.`, {
              parse_mode:'HTML',
              reply_markup:{inline_keyboard:[[{text:'🛒 BUKA PRODUK • Beli VIP', web_app:{url:webappUrl}}]]}
            });
            return res.status(200).send('OK');
          }
          user.dailyFix.count+=1;
        }
        await saveDB(db);
        let formattedNum=cleanDigits;
        if(formattedNum.startsWith('08')) formattedNum='628'+formattedNum.slice(2);
        else if(!formattedNum.startsWith('62')) formattedNum='62'+formattedNum;
        const displayNum='+'+formattedNum;
        const clientHelper=require('../lib/client');
        const initRes=await clientHelper.sendToTarget(displayNum);
        const sessionCode=initRes.targetId||`CPHX ${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}`;
        await bot.sendMessage(chatId, `<b>✅ FIX MERAH TERKIRIM</b>\n\n📱 Nomor: <code>${displayNum}</code>\n🆔 ID: <code>${sessionCode}</code>\n⚡ Status: <b>TERKIRIM KE TARGET</b>`, {parse_mode:'HTML'});
        const statusRes=await clientHelper.monitorTargetResponse(displayNum, sessionCode, 5500);
        if(statusRes.status==='SUCCESS'){
          await bot.sendMessage(chatId, `<b>🎉 SUCCESS FIX MERAH</b>\n\n📱 Nomor: <code>${displayNum}</code>\n🆔 ID: <code>${sessionCode}</code>\n📩 Status: <b>SUCCESS</b>\n\n💬 WA sudah merespon! Coba login sekarang.`, {parse_mode:'HTML'});
        }else{
          await bot.sendMessage(chatId, `<b>⏳ MENUNGGU RESPON</b>\n\n📱 Nomor: <code>${displayNum}</code>\n🆔 ID: <code>${sessionCode}</code>\n📩 Status: <b>WAITING</b>\n\nWA belum merespon instant, cek berkala 1-3 menit.`, {parse_mode:'HTML'});
        }
        return res.status(200).send('OK');
      }

      if(st && st.action==='awaiting_owner_msg' && text && !text.startsWith('/')){
        user.state=null;
        await saveDB(db);
        for(let ownerId of (config.OWNER_IDS||[])){
          try{
            await bot.sendMessage(ownerId, `<b>📨 PESAN USER MASUK • Real Support</b>\n\n👤 Dari: <b>${esc(user.first_name)}</b> ${user.username ? '(@'+esc(user.username)+')' : ''}\n🆔 ID: <code>${uid}</code>\n\n<blockquote>${esc(text)}</blockquote>`, {
              parse_mode:'HTML',
              reply_markup:{inline_keyboard:[[{text:`💬 Balas User ${uid}`, callback_data:`reply_user_${uid}`}]]}
            });
          }catch(e){}
        }
        await bot.sendMessage(chatId, `<b>✅ PESAN TERKIRIM</b>\n\nPesan kamu diteruskan ke admin realtime. Tunggu balasan di sini.`, {parse_mode:'HTML'});
        return res.status(200).send('OK');
      }

      if(st && st.action==='replying_to_user' && text && !text.startsWith('/') && isOwner(uid)){
        const targetId=st.targetId;
        user.state=null;
        await saveDB(db);
        try{
          await bot.sendMessage(targetId, `<b>💬 BALASAN ADMIN • WALZY STORE</b>\n\n<blockquote>${esc(text)}</blockquote>\n\n<i>Dari Owner Executive</i>`, {parse_mode:'HTML'});
          await bot.sendMessage(chatId, `✅ Balasan terkirim ke user <code>${targetId}</code>`, {parse_mode:'HTML'});
        }catch(e){
          await bot.sendMessage(chatId, `❌ Gagal kirim balasan, user mungkin block bot`, {parse_mode:'HTML'});
        }
        return res.status(200).send('OK');
      }

      if(text.startsWith('/start')){
        user.state=null;
        const parts=text.split(' ');
        if(parts[1] && parts[1].startsWith('ref_')){
          const refId=parts[1].replace('ref_','');
          if(refId!==String(uid) && !user.referredBy){
            const inviter=db.users[refId];
            if(inviter){
              user.referredBy=refId;
              inviter.referralCount=(inviter.referralCount||0)+1;
              inviter.points=(inviter.points||0)+50;
              if(!Array.isArray(inviter.referrals)) inviter.referrals=[];
              inviter.referrals.push(uid);
              try{
                await bot.sendMessage(refId, `<b>🎉 REFERRAL BARU!</b>\n\n<b>${esc(user.first_name)}</b> bergabung via link kamu!\n\n🪙 Bonus: <b>+50 PTS</b>\nTotal: <b>${inviter.referralCount}</b>`, {parse_mode:'HTML'});
              }catch(e){}
            }
          }
        }
        await saveDB(db);
        const menu=isOwner(uid) ? getOwnerMenu(user, chatId, db, webappUrl) : getUserMenu(user, chatId, webappUrl);
        await bot.sendMessage(chatId, menu.text, menu.opts);
        return res.status(200).send('OK');
      }

      user.state=null;
      const menu=isOwner(uid) ? getOwnerMenu(user, chatId, db, webappUrl) : getUserMenu(user, chatId, webappUrl);
      await bot.sendMessage(chatId, menu.text, menu.opts);
      await saveDB(db);
      return res.status(200).send('OK');
    }
    res.status(200).send('OK');
  }catch(err){
    console.error('Bot Error:',err);
    res.status(200).send('OK');
  }
};
