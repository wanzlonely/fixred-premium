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
  if(now-last<600) return false;
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
  const validUsersCount=Object.keys(db.users||{}).length;
  const totalRev=(db.stats && db.stats.revenue) ? db.stats.revenue : 0;
  const dispName=esc(user.first_name||'Owner Executive');
  const text=`👑 <b>WALZY EXECUTIVE CYBER SUITE</b> 👑
◈━━━━━━━━━━━━━━━━━━━━◈

Selamat datang kembali, <b>${dispName}</b>! System Premium Active 🟢

<blockquote>📊 <b>REALTIME ANALYTICS ENGINE</b>
├ 💎 <b>Total Revenue:</b> <code>Rp ${totalRev.toLocaleString('id-ID')}</code>
├ 👥 <b>Registered Users:</b> <code>${validUsersCount} Accounts</code>
├ 📥 <b>Pending Deposit:</b> <code>${pendingCount} Orders</code>
└ ⚡ <b>System Status:</b> <code>OPTIMIZED & ONLINE</code></blockquote>

✨ <i>Kontrol penuh sistem premium tersedia. Akses WebApp Admin Studio untuk manajemen lanjutan.</i>

🚀 <b>Quick Actions:</b> Fix Merah, Verifikasi Deposit, Broadcast.`;

  const keyboard=[
    [{text:'⚡ SINKRONISASI FIX MERAH', callback_data:'fix_merah'}],
    [{text:'🖥️ BUKA ADMIN STUDIO PREMIUM', web_app:{url:webappUrl}}],
    [{text:`📑 Pending (${pendingCount})`, callback_data:'owner_check_pending'}, {text:'📊 Statistik', callback_data:'owner_stats'}],
    [{text:'💎 Kelola Voucher', callback_data:'owner_voucher'}, {text:'📢 Broadcast', callback_data:'owner_broadcast'}],
    [{text:'❓ Bantuan Admin', callback_data:'help'}]
  ];
  return {text, opts:{parse_mode:'HTML', reply_markup:{inline_keyboard:keyboard}}};
}

function getUserMenu(user, chatId, webappUrl){
  const rnk=getRank(user.referralCount||0);
  const isPrem=isPremium(user);
  const statusBadge=isPrem ? `💎 VIP PREMIUM • ${getPremiumLeft(user)} HARI LAGI` : `🎫 FREE MEMBER • UPGRADE TO VIP`;
  const dispName=esc(user.first_name||'User Walzy');
  if(!user.dailyFix || user.dailyFix.date!==getTodayString()){
    user.dailyFix={date:getTodayString(),count:0};
  }
  const remainingQuota=isPrem ? 'UNLIMITED ♾️' : `${Math.max(0,5-(user.dailyFix.count||0))}/5`;
  const points=user.points||0;
  const streak=user.checkinStreak||0;

  const text=`✨ <b>WALZY CYBER STORE • PREMIUM SUITE</b> ✨
◈━━━━━━━━━━━━━━━━━━━━◈

Halo <b>${dispName}</b>! Selamat datang di ekosistem cyber premium 🦖💎

<blockquote>👤 <b>PREMIUM IDENTITY CARD</b>
├ 🆔 <b>Telegram ID:</b> <code>${chatId}</code>
├ 🏅 <b>Rank Level:</b> ${rnk.icon} <code>${rnk.name}</code>
├ 🪙 <b>Vault Points:</b> <code>${points} PTS</code>
├ 🔥 <b>Streak Login:</b> <code>${streak} Days</code>
├ ⚡ <b>Quota Fix Merah:</b> <code>${remainingQuota}</code>
└ 🔰 <b>Status Akses:</b> <b>${statusBadge}</b></blockquote>

🎁 <b>Fitur Premium Aktif:</b>
• Spin Wheel Harian • Check-in Rewards
• Referral Bonus +50 PTS • VIP Marketplace

💡 <i>Klik <b>FIX MERAH</b> untuk mulai, atau buka <b>WEBAPP STORE</b> untuk pengalaman full premium dengan desain cyber glassmorphism!</i>`;

  const keyboard=[
    [{text:'⚡ SINKRONISASI FIX MERAH PREMIUM', callback_data:'fix_merah'}],
    [{text:'🌐 BUKA WEBAPP CYBER STORE • PREMIUM', web_app:{url:webappUrl}}],
    [{text:'🎁 Claim Poin Harian', callback_data:'user_checkin_info'}, {text:'🎡 Spin Wheel', callback_data:'user_spin_info'}],
    [{text:'💎 Upgrade VIP Unlimited', web_app:{url:webappUrl}}, {text:'👥 Referral', callback_data:'user_ref'}],
    [{text:'💬 Customer Support', callback_data:'contact_owner'}, {text:'❓ Panduan Premium', callback_data:'help'}]
  ];
  return {text, opts:{parse_mode:'HTML', reply_markup:{inline_keyboard:keyboard}}};
}

module.exports = async (req, res) => {
  if(req.method!=='POST') return res.status(200).send('WALZY BOT PREMIUM ONLINE 🟢');
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
        try{ await bot.answerCallbackQuery(qId,{text:'⏳ Terlalu cepat!'}); }catch(e){}
        return res.status(200).send('OK');
      }
      const user=getUser(db, uid, q.from);
      if(!user) return res.status(200).send('OK');

      if(data==='fix_merah'){
        await bot.answerCallbackQuery(qId,{text:'🛠️ Modul Fix Merah Premium Aktif',show_alert:false});
        if(user){
          user.state={action:'awaiting_fixmerah_number'};
          await saveDB(db);
          await bot.sendMessage(uid, `⚡ <b>FIX MERAH PREMIUM ENGINE</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n\nSilakan kirimkan <b>Nomor WhatsApp Target</b> dengan format:\n\n<code>08xxxxxxxxxx</code> atau <code>628xxxxxxxxxx</code>\n\n<blockquote>💡 <b>Tips Premium:</b> Pastikan nomor aktif dan gunakan format internasional untuk hasil maksimal.</blockquote>\n\n<i>Kirim nomor sekarang untuk memulai sinkronisasi quantum...</i> 🚀`, {parse_mode:'HTML'});
        }
        return res.status(200).send('OK');
      }

      if(data==='owner_check_pending'){
        await bot.answerCallbackQuery(qId,{text:'📑 Memuat pending...'});
        const pending=Object.values(db.payments||{}).filter(p=>p.status==='waiting_approval' || p.status==='pending').slice(-10).reverse();
        if(pending.length===0){
          await bot.sendMessage(uid, `✅ <b>TIDAK ADA PENDING</b>\n\nSemua transaksi sudah diproses! System clean.`, {parse_mode:'HTML'});
        }else{
          let txt=`📑 <b>PENDING DEPOSIT (${pending.length})</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n\n`;
          pending.forEach(p=>{
            txt+=`🧾 <code>${p.id}</code> | User: <code>${p.userId}</code> | ${p.days} Hari | Rp ${p.amount}\n`;
          });
          txt+=`\n<i>Buka WebApp Admin untuk verifikasi bukti transfer.</i>`;
          await bot.sendMessage(uid, txt, {parse_mode:'HTML', reply_markup:{inline_keyboard:[[{text:'🖥️ Buka Admin Studio', web_app:{url:webappUrl}}]]}});
        }
        return res.status(200).send('OK');
      }

      if(data==='owner_stats'){
        await bot.answerCallbackQuery(qId,{text:'📊 Statistik'});
        const valid=Object.keys(db.users||{}).length;
        const prem=Object.values(db.users||{}).filter(u=>isPremium(u)).length;
        const rev=db.stats.revenue||0;
        await bot.sendMessage(uid, `📊 <b>WALZY STATS PREMIUM</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n\n👥 Total Users: <code>${valid}</code>\n💎 VIP Active: <code>${prem}</code>\n💰 Revenue: <code>Rp ${rev.toLocaleString('id-ID')}</code>\n📈 Total Fix: <code>${db.stats.totalFix||0}</code>\n\n<i>Data realtime dari database cyber suite.</i>`, {parse_mode:'HTML'});
        return res.status(200).send('OK');
      }

      if(data==='help'){
        await bot.answerCallbackQuery(qId,{text:'❓ Panduan'});
        const helpText=`📚 <b>WALZY CYBER STORE - PANDUAN PREMIUM</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n\n<blockquote>⚡ <b>FIX MERAH PREMIUM</b>\nFitur untuk sinkronisasi nomor WhatsApp. Klik tombol Fix Merah dan kirim nomor target.\nKuota Free: 5/hari, VIP: Unlimited ♾️</blockquote>\n\n<blockquote>🎡 <b>SPIN WHEEL</b>\nPutar setiap hari untuk dapatkan poin, kuota, atau VIP gratis! Buka via WebApp.</blockquote>\n\n<blockquote>🎁 <b>CHECK-IN HARIAN</b>\nLogin setiap hari untuk streak dan bonus poin. 7 hari berturut dapat bonus besar!</blockquote>\n\n<blockquote>👥 <b>REFERRAL SYSTEM</b>\nUndang teman via link referral, dapat +50 PTS setiap yang bergabung.</blockquote>\n\n<blockquote>💎 <b>VIP MARKETPLACE</b>\nBeli paket VIP 3H/5H/7H/14H/30H untuk unlimited akses & fitur eksklusif.</blockquote>\n\n💬 Butuh bantuan? Klik Customer Support untuk hubungi admin.\n\n<i>Powered by WALZY CYBER SUITE PREMIUM</i> 🦖✨`;
        await bot.sendMessage(uid, helpText, {parse_mode:'HTML'});
        return res.status(200).send('OK');
      }

      if(data==='contact_owner'){
        await bot.answerCallbackQuery(qId,{text:'💬 Hubungi Admin'});
        user.state={action:'awaiting_owner_msg'};
        await saveDB(db);
        await bot.sendMessage(uid, `💬 <b>HUBUNGI CUSTOMER SUPPORT PREMIUM</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n\nSilakan ketik pesan kamu untuk admin. Admin akan membalas langsung ke kamu.\n\n<i>Tulis pesan kamu sekarang...</i>`, {parse_mode:'HTML'});
        return res.status(200).send('OK');
      }

      if(data==='user_checkin_info'){
        await bot.answerCallbackQuery(qId,{text:'🎁 Check-in'});
        await bot.sendMessage(uid, `🎁 <b>CHECK-IN HARIAN PREMIUM</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n\nStreak kamu: <b>${user.checkinStreak||0} Hari</b>\nPoin: <b>${user.points||0} PTS</b>\n\nBuka WebApp untuk claim check-in harian dan dapatkan bonus poin!\n\n<blockquote>💡 Check-in 7 hari berturut dapat bonus spesial!</blockquote>`, {parse_mode:'HTML', reply_markup:{inline_keyboard:[[{text:'🌐 Buka WebApp & Check-in', web_app:{url:webappUrl}}]]}});
        return res.status(200).send('OK');
      }

      if(data==='user_spin_info'){
        await bot.answerCallbackQuery(qId,{text:'🎡 Spin'});
        await bot.sendMessage(uid, `🎡 <b>SPIN WHEEL PREMIUM</b>\n\nPutar roda keberuntungan dan dapatkan hadiah:\n• +25 / +50 / +100 PTS\n• +3 Kuota Fix Merah\n• VIP 1 Hari Gratis\n• Zonk (coba lagi besok!)\n\nBuka WebApp untuk spin sekarang!`, {parse_mode:'HTML', reply_markup:{inline_keyboard:[[{text:'🌐 Buka WebApp & Spin', web_app:{url:webappUrl}}]]}});
        return res.status(200).send('OK');
      }

      if(data==='user_ref'){
        await bot.answerCallbackQuery(qId,{text:'👥 Referral'});
        const link=`https://t.me/${config.BOT_USERNAME||'walzystore_bot'}?start=ref_${uid}`;
        await bot.sendMessage(uid, `👥 <b>REFERRAL SYSTEM PREMIUM</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n\nLink referral kamu:\n<code>${link}</code>\n\n<blockquote>🎁 Reward: +50 PTS setiap user baru bergabung via link kamu!\n📊 Total referral: ${user.referralCount||0}</blockquote>\n\n<i>Bagikan link ke teman-teman kamu!</i>`, {parse_mode:'HTML'});
        return res.status(200).send('OK');
      }

      if(data.startsWith('reply_user_')){
        const targetId=data.replace('reply_user_','');
        if(!isOwner(uid)) return res.status(200).send('OK');
        user.state={action:'replying_to_user',targetId:targetId};
        await saveDB(db);
        await bot.answerCallbackQuery(qId,{text:'💬 Mode balas aktif'});
        await bot.sendMessage(uid, `💬 <b>BALAS USER ${targetId}</b>\n\nKetik pesan balasan untuk user ID <code>${targetId}</code>. Pesan akan dikirim langsung ke user.`, {parse_mode:'HTML'});
        return res.status(200).send('OK');
      }

      await bot.answerCallbackQuery(qId,{text:'✅'});
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
          await bot.sendMessage(chatId, `❌ <b>Format nomor tidak valid!</b>\n\nSilakan kirim angka nomor telepon yang benar.\n\nContoh: <code>08123456789</code>`, {parse_mode:'HTML'});
          return res.status(200).send('OK');
        }
        const isPrem=isPremium(user);
        if(!isPrem){
          if(!user.dailyFix || user.dailyFix.date!==getTodayString()){
            user.dailyFix={date:getTodayString(),count:0};
          }
          if(user.dailyFix.count>=5){
            await saveDB(db);
            await bot.sendMessage(chatId, `⚠️ <b>KUOTA HARIAN HABIS PREMIUM</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n\nKuota gratis Fix Merah hari ini sudah <b>5/5</b>.\n\n💡 <i>Upgrade ke <b>VIP Member</b> di WebApp untuk kuota Unlimited ♾️!</i>`, {
              parse_mode:'HTML',
              reply_markup:{inline_keyboard:[[{text:'💎 Upgrade VIP Unlimited Premium', web_app:{url:webappUrl}}]]}
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
        const initialMsgTxt=`🛠️ <b>HASIL PROSES FIX MERAH PREMIUM</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n<blockquote>✅ <b>STATUS PROSES (1)</b>\n📱 Nomor: <code>${displayNum}</code>\n🆔 Session ID: <code>${sessionCode}</code>\n📩 Hasil: <b>TERKIRIM KE TARGET</b>\n⚡ Engine: <b>QUANTUM SYNC V2</b></blockquote>\n\n<i>Notifikasi update status akan dikirim otomatis jika ada balasan. Tetap di chat ini! 🔥💎</i>`;
        await bot.sendMessage(chatId, initialMsgTxt, {parse_mode:'HTML'});
        const statusRes=await clientHelper.monitorTargetResponse(displayNum, sessionCode, 5000);
        if(statusRes.status==='SUCCESS'){
          const succReport=`✅ <b>SUCCESS FIX MERAH PREMIUM</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n<blockquote>📱 Nomor: <code>${displayNum}</code>\n🆔 ID: <code>${sessionCode}</code>\n📩 Status: <b>SUCCESS • TERHUBUNG</b>\n💎 Engine: <b>PREMIUM SYNC ACTIVE</b></blockquote>\n\n💬 <i>WhatsApp sudah merespon! Silakan coba login/verifikasi akun Anda sekarang! Jika belum, tunggu 1-2 menit lagi.</i>\n\n🚀 <b>Powered by WALZY CYBER SUITE</b>`;
          await bot.sendMessage(chatId, succReport, {parse_mode:'HTML'});
        }else{
          const failReport=`⚠️ <b>PROSES TERKIRIM - MENUNGGU RESPON</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n<blockquote>📱 Nomor: <code>${displayNum}</code>\n🆔 ID: <code>${sessionCode}</code>\n📩 Status: <b>WAITING RESPONSE</b>\n⏳ Estimasi: <b>1-3 Menit</b></blockquote>\n\n💬 <i>WhatsApp belum merespon secara instant. Ini normal! Silakan cek berkala. Jika butuh bantuan, hubungi support.</i>\n\n💎 <b>Tips Premium:</b> Pastikan nomor dalam kondisi sinyal bagus.`;
          await bot.sendMessage(chatId, failReport, {parse_mode:'HTML'});
        }
        return res.status(200).send('OK');
      }

      if(st && st.action==='awaiting_owner_msg' && text && !text.startsWith('/')){
        user.state=null;
        await saveDB(db);
        for(let ownerId of (config.OWNER_IDS||[])){
          try{
            await bot.sendMessage(ownerId, `📨 <b>PESAN MASUK USER PREMIUM</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n\n👤 Pengirim: <b>${esc(user.first_name)}</b>\n🆔 User ID: <code>${uid}</code>\n💬 Username: @${user.username||'-'}\n\n💬 Pesan:\n${esc(text)}\n\n━━━━━━\n<i>Balas cepat via tombol di bawah</i>`, {
              parse_mode:'HTML',
              reply_markup:{inline_keyboard:[[{text:`💬 Balas User (${uid})`, callback_data:`reply_user_${uid}`}]]}
            });
          }catch(e){}
        }
        await bot.sendMessage(chatId, `✅ <b>PESAN PREMIUM TERKIRIM!</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n\nPesan Anda telah diteruskan ke Customer Service Premium. Admin akan membalas secepatnya!\n\n⏳ <i>Mohon tunggu balasan...</i>`, {parse_mode:'HTML'});
        return res.status(200).send('OK');
      }

      if(st && st.action==='replying_to_user' && text && !text.startsWith('/') && isOwner(uid)){
        const targetId=st.targetId;
        user.state=null;
        await saveDB(db);
        try{
          await bot.sendMessage(targetId, `💬 <b>BALASAN OPERATOR WALZY PREMIUM</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n\n${esc(text)}\n\n━━━━━━\n<i>Pesan dari Admin Executive WALZY STORE 💎</i>`, {parse_mode:'HTML'});
          await bot.sendMessage(chatId, `✅ Balasan premium berhasil dikirim ke user ID <code>${targetId}</code>!`, {parse_mode:'HTML'});
        }catch(e){
          await bot.sendMessage(chatId, `❌ Gagal mengirim balasan ke user. User mungkin block bot.`, {parse_mode:'HTML'});
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
                await bot.sendMessage(refId, `🎉 <b>REFERRAL BARU PREMIUM!</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n\n<b>${esc(user.first_name)}</b> bergabung via link kamu!\nBonus: 🪙 <b>+50 PTS</b>\nTotal Referral: <b>${inviter.referralCount} Users</b>\n\n<i>Terus undang teman untuk poin lebih banyak!</i> 💎`, {parse_mode:'HTML'});
              }catch(e){}
            }
          }
        }
        await saveDB(db);
        const menu=isOwner(uid) ? getOwnerMenu(user, chatId, db, webappUrl) : getUserMenu(user, chatId, webappUrl);
        await bot.sendMessage(chatId, menu.text, menu.opts);
        return res.status(200).send('OK');
      }

      if(text.startsWith('/help') || text.startsWith('/bantuan')){
        const helpText=`📚 <b>WALZY CYBER STORE - PANDUAN PREMIUM</b>\n◈━━━━━━━━━━━━━━━━━━━━◈\n\nGunakan /start untuk membuka menu utama premium.\n\n⚡ Fix Merah: Kirim nomor WA target\n💎 VIP: Beli di WebApp Store\n🎡 Spin: Harian di WebApp\n🎁 Check-in: Harian di WebApp\n\n<i>Butuh bantuan? Klik Customer Support di menu.</i>`;
        await bot.sendMessage(chatId, helpText, {parse_mode:'HTML'});
        await saveDB(db);
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
