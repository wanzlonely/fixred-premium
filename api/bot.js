const TelegramBot = require('node-telegram-bot-api');
const { loadDB, saveDB } = require('../lib/utils');
const { getTodayString, genID, genInvoiceID, esc, getRank, isValidNumber } = require('../lib/utils');
const { sendToTarget } = require('../lib/client');
const config = require('../config');

const rateLimitMap = new Map();
const supportRateMap = new Map();

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
  if(!db.codes) db.codes = {};
  if(!db.stats) db.stats = { totalFix:0, totalSuccess:0, totalFailed:0, revenue:0, revenueHistory:[], lastReset: Date.now() };
  if(!db.history) db.history = {};
  if(!db.pending) db.pending = {};
  if(!db.supportMap) db.supportMap = {};
  if(!db.securityLog) db.securityLog = [];
  if(db.stats.totalFix === undefined) db.stats.totalFix = 0;
  if(db.stats.totalSuccess === undefined) db.stats.totalSuccess = 0;
  if(db.stats.totalFailed === undefined) db.stats.totalFailed = 0;
  if(db.stats.revenue === undefined) db.stats.revenue = 0;
  if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
  if(!db.stats.lastReset) db.stats.lastReset = Date.now();
  if(!Array.isArray(db.securityLog)) db.securityLog = [];
}
function cleanDB(db){
  let removed = 0;
  for(let k of Object.keys(db.users)){
    if(isSuspiciousId(k)){
      delete db.users[k];
      removed++;
    }
  }
  for(let k of Object.keys(db.payments)){
    const p = db.payments[k];
    if(p && isSuspiciousId(p.userId)){
      delete db.payments[k];
      removed++;
    }
  }
  if(removed > 0){
    db.securityLog.push({ date: new Date().toISOString(), action: 'clean_suspicious', removed });
    if(db.securityLog.length > 100) db.securityLog = db.securityLog.slice(-100);
  }
}
function getUniqueUsers(usersObj){
  const map = new Map();
  for(let u of Object.values(usersObj)){
    if(isSuspiciousId(u.id)) continue;
    const name = (u.first_name || '').trim();
    if(!name) continue;
    const lower = name.toLowerCase();
    if(lower.includes('exploit') && (u.totalFix||0)===0 && (u.referralCount||0)===0) continue;
    if(!map.has(lower)){
      map.set(lower, u);
    }else{
      const ex = map.get(lower);
      const exScore = (ex.totalFix||0) + (ex.referralCount||0)*10;
      const curScore = (u.totalFix||0) + (u.referralCount||0)*10;
      if(curScore > exScore) map.set(lower, u);
    }
  }
  return Array.from(map.values());
}
function checkRateLimit(userId){
  const now = Date.now();
  const last = rateLimitMap.get(String(userId)) || 0;
  if(now - last < 800) return false;
  rateLimitMap.set(String(userId), now);
  return true;
}
function checkSupportRate(userId){
  const now = Date.now();
  const last = supportRateMap.get(String(userId)) || 0;
  if(now - last < 60000) return false;
  supportRateMap.set(String(userId), now);
  return true;
}
function getUser(db, id){
  const k = String(id);
  if(isSuspiciousId(k)) return null;
  if(!db.users[k]){
    db.users[k] = {
      id: Number(id) || id,
      first_name: '',
      username: '',
      joinedAt: Date.now(),
      referralCount: 0,
      referrals: [],
      referredBy: null,
      totalFix: 0,
      dailyFix: { date: getTodayString(), count: 0 },
      premiumUntil: 0,
      lastSpin: null,
      notifiedExp: false,
      notifiedExp2: false,
      awaitingNumber: false,
      awaitingBroadcast: false,
      awaitingSupport: false,
      pendingDeposit: null,
      supportReplyTo: null,
      securityFlags: 0
    };
  }
  if(!db.users[k].dailyFix || db.users[k].dailyFix.date !== getTodayString()){
    db.users[k].dailyFix = { date: getTodayString(), count: 0 };
  }
  if(db.users[k].totalFix === undefined) db.users[k].totalFix = 0;
  if(db.users[k].referralCount === undefined) db.users[k].referralCount = 0;
  if(!Array.isArray(db.users[k].referrals)) db.users[k].referrals = [];
  return db.users[k];
}
function isPremium(user){
  if(!user) return false;
  return user.premiumUntil && user.premiumUntil > Date.now();
}
function getPremiumLeft(user){
  if(!isPremium(user)) return null;
  return Math.ceil((user.premiumUntil - Date.now()) / 86400000);
}
function canUseFix(db, user){
  if(!user) return { allowed:false, remaining:0, isPremium:false };
  if(isOwner(user.id) || isPremium(user)){
    return { allowed:true, remaining:999, isPremium:true };
  }
  if(user.dailyFix.count >= 3){
    return { allowed:false, remaining:0, isPremium:false };
  }
  return { allowed:true, remaining:3 - user.dailyFix.count, isPremium:false };
}
function incrementFixCount(db, user){
  if(!user.dailyFix || user.dailyFix.date !== getTodayString()){
    user.dailyFix = { date: getTodayString(), count: 0 };
  }
  user.dailyFix.count += 1;
  user.totalFix = (user.totalFix || 0) + 1;
  db.stats.totalFix = (db.stats.totalFix || 0) + 1;
  const k = String(user.id);
  if(!db.history[k]) db.history[k] = [];
  db.history[k].unshift({ date: new Date().toISOString(), count: 1 });
  if(db.history[k].length > 100) db.history[k] = db.history[k].slice(0,100);
}
async function checkJoin(bot, uid){
  if(isOwner(uid)) return { joined:true, notJoined:[] };
  let notJoined = [];
  for(let ch of config.FORCE_JOIN){
    try{
      const m = await bot.getChatMember(ch.id, uid);
      if(!['member','administrator','creator'].includes(m.status)) notJoined.push(ch);
    }catch(e){
      notJoined.push(ch);
    }
  }
  return { joined:notJoined.length===0, notJoined };
}

function blockQuote(text){
  return `<blockquote>${text}</blockquote>`;
}
function headerBlock(title, emoji){
  return `${emoji} <b>${title}</b>\n━━━━━━━━━━━━━━━━━━━━━━`;
}
function footerBlock(){
  return `━━━━━━━━━━━━━━━━━━━━━━\n🚀 <b>FIXRED WALZY</b> | ⏱ ${new Date().toLocaleTimeString('id-ID', {timeZone:'Asia/Jakarta'})} WIB`;
}

function getOwnerMenu(chatId, db, user){
  const validUsers = getUniqueUsers(db.users);
  const premiumCount = validUsers.filter(u => isPremium(u)).length;
  const text = `${headerBlock('𝗢𝗪𝗡𝗘𝗥 𝗖𝗢𝗡𝗧𝗥𝗢𝗟 𝗣𝗔𝗡𝗘𝗟 - 𝟯𝟲𝟬° 𝗕𝗘𝗗𝗔', '👑')}\n${blockQuote(`🛡️ <b>Sistem Beroperasi Optimal</b>\n🔐 <b>Password:</b> <code>SUPER777</code>\n🎨 <b>Mode:</b> <code>DARK ADMIN - BEDA 360°</code>\n\n👥 <b>Total User Valid</b>  : <code>${validUsers.length}</code>\n💎 <b>Premium Aktif</b>     : <code>${premiumCount}</code>\n🔧 <b>Total Order</b>       : <code>${db.stats.totalFix || 0}</code>\n✅ <b>Success</b>           : <code>${db.stats.totalSuccess || 0}</code>\n❌ <b>Failed</b>            : <code>${db.stats.totalFailed || 0}</code>\n💰 <b>Revenue</b>           : <code>Rp ${(db.stats.revenue || 0).toLocaleString()}</code>\n🔄 <b>Last Reset</b>        : <code>${new Date(db.stats.lastReset||Date.now()).toLocaleDateString('id-ID')}</code>\n🛡️ <b>Security Logs</b>     : <code>${db.securityLog.length}</code>`)} \n\n${blockQuote(`📦 <b>Halaman Pembelian & Transaksi Tersusun Rapih</b>\nProses ACC tidak bingung - Semua transaksi di webapp owner`)} \n${footerBlock()}`;
  return {
    text,
    opts: {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🌐 CONTROL PANEL (WEBAPP)', web_app: { url: `${process.env.PUBLIC_URL || ''}/webapp` } }],
          [{ text: '📦 DATABASE VALID', callback_data: 'menu_database' }, { text: '🏆 KLASEMEN', callback_data: 'ref_leaderboard' }],
          [{ text: '📢 BROADCAST', callback_data: 'menu_broadcast' }, { text: '📊 STATISTIK', callback_data: 'menu_stats' }],
          [{ text: '🛒 PEMBELIAN', callback_data: 'menu_purchases' }, { text: '♻️ RESET REVENUE', callback_data: 'reset_revenue' }],
          [{ text: '🔧 FIX MERAH', callback_data: 'menu_fix' }, { text: '🎰 SPIN HARIAN', callback_data: 'menu_spin' }],
          [{ text: '🎟️ REDEEM CODE', callback_data: 'menu_redeem' }, { text: '👤 DATA PROFILE', callback_data: 'menu_profile' }]
        ]
      }
    }
  };
}

function getUserMenu(chatId, db, user){
  const rnk = getRank(user.referralCount || 0);
  const can = canUseFix(db, user);
  const premiumText = isPremium(user) ? `👑 VIP (${getPremiumLeft(user)} Hari)` : `🎫 FREE (${can.remaining}/3)`;
  const text = `${headerBlock('𝗪𝗔𝗟𝗭𝗬 𝗦𝗧𝗢𝗥𝗘 - 𝗖𝗘𝗡𝗧𝗥𝗔𝗟 𝗗𝗔𝗦𝗛𝗕𝗢𝗔𝗥𝗗', '🌱')}\n${blockQuote(`👋 Halo, <b>${esc(user.first_name)}</b>!\n\n🆔 <b>ID Anda</b>   : <code>${chatId}</code>\n⚜️ <b>Status</b>    : ${premiumText}\n🏆 <b>Pangkat</b>   : ${rnk.icon} ${rnk.name}\n👥 <b>Referral</b>  : <code>${user.referralCount || 0}</code> Pengguna\n🔧 <b>Total Order</b> : <code>${user.totalFix || 0}</code>\n📊 <b>Limit</b>     : <code>${can.remaining} tersisa</code>`)} \n\n${blockQuote(`💡 <b>Fokus Bot Store - Bersih & Simetris</b>\nGunakan tombol dibawah dengan layout simetris`)} \n${footerBlock()}`;
  return {
    text,
    opts: {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔧 Fix Merah', callback_data: 'menu_fix' }],
          [{ text: '🛒 Halaman Pembelian', callback_data: 'menu_purchases' }, { text: '📊 Dashboard', callback_data: 'menu_dashboard' }],
          [{ text: '🎰 Spin Harian', callback_data: 'menu_spin' }, { text: '🎟️ Redeem Code', callback_data: 'menu_redeem' }],
          [{ text: '👤 Data Profile', callback_data: 'menu_profile' }, { text: '📈 Statistik', callback_data: 'menu_stats' }],
          [{ text: '🌐 Mini App Light', web_app: { url: `${process.env.PUBLIC_URL || ''}/webapp` } }, { text: '🎧 Support', callback_data: 'user_contact_owner' }]
        ]
      }
    }
  };
}

function getDashboardMenu(chatId, db, user){
  if(isOwner(chatId)){
    return getOwnerMenu(chatId, db, user);
  }
  return getUserMenu(chatId, db, user);
}

async function handleMessage(bot, db, msg){
  ensureDB(db);
  cleanDB(db);
  if(!msg.from) return;
  if(msg.from.is_bot) return;
  if(isSuspiciousId(msg.from.id)) return;
  if(msg.chat && msg.chat.type && msg.chat.type !== 'private'){
    if(isSuspiciousId(msg.chat.id)) return;
  }
  if(!checkRateLimit(msg.from.id)) return;
  const chatId = msg.chat.id;
  if(isSuspiciousId(chatId)) return;
  const text = msg.text ? msg.text.trim() : '';
  const user = getUser(db, chatId);
  if(!user) return;
  user.first_name = msg.from.first_name || 'User';
  user.username = msg.from.username || '';

  if(msg.photo && db.users[String(chatId)] && db.users[String(chatId)].pendingDeposit){
    const inv = db.users[String(chatId)].pendingDeposit;
    const pay = db.payments[inv];
    if(pay && (pay.status === 'waiting_proof' || pay.status === 'waiting_payment')){
      const fileId = msg.photo[msg.photo.length - 1].file_id;
      pay.proofFileId = fileId;
      pay.status = 'waiting_approval';
      db.users[String(chatId)].pendingDeposit = null;
      await saveDB(db);
      await bot.sendMessage(chatId, `${headerBlock('𝗕𝗨𝗞𝗧𝗜 𝗗𝗜𝗧𝗘𝗥𝗜𝗠𝗔', '✅')}\n${blockQuote(`Bukti transfer untuk <code>${inv}</code> berhasil diterima\n\n⏳ <b>Menunggu konfirmasi admin max 1x24 jam</b>\n📲 <b>Notifikasi persegi akan muncul saat di-ACC</b>`)} \n${footerBlock()}`, { parse_mode:'HTML' });
      for(let oid of config.OWNER_IDS){
        try{
          await bot.sendPhoto(oid, fileId, {
            caption: `📩 <b>DEPOSIT BARU - HALAMAN TRANSAKSI</b>\n━━━━━━━━━━━━━━━━━━━━━━\n🧾 Invoice: <code>${inv}</code>\n👤 User: <code>${chatId}</code> @${msg.from.username || '-'}\n💎 Paket: ${pay.days} Hari - Rp ${pay.amount.toLocaleString()}\n🏦 Tujuan: ${config.DANA_NAME} ${config.DANA_NUMBER}\n\n📋 <b>Proses ACC tersusun rapih di webapp transaksi</b>`,
            parse_mode:'HTML',
            reply_markup: {
              inline_keyboard: [[{ text:'✅ APPROVE', callback_data:`approve_${inv}` }, { text:'❌ REJECT', callback_data:`reject_${inv}` }]]
            }
          });
        }catch(e){}
      }
      return;
    }
  }

  if(isOwner(chatId) && msg.reply_to_message && text){
    const targetUid = db.supportMap && db.supportMap[String(msg.reply_to_message.message_id)];
    if(targetUid){
      if(isSuspiciousId(targetUid)) return;
      try{
        await bot.sendMessage(targetUid, `${headerBlock('𝗕𝗔𝗟𝗔𝗦𝗔𝗡 𝗔𝗗𝗠𝗜𝗡', '🎧')}\n${blockQuote(esc(text))}\n${footerBlock()}`, { parse_mode:'HTML' });
        await bot.sendMessage(chatId, `✅ Balasan terkirim ke user ${targetUid} - Penanganan keluhan selesai`);
      }catch(e){
        await bot.sendMessage(chatId, `❌ Gagal kirim: ${e.message}`);
      }
      return;
    }
  }

  if(!isOwner(chatId) && db.users[String(chatId)] && db.users[String(chatId)].awaitingSupport && text){
    if(!checkSupportRate(chatId)){
      return bot.sendMessage(chatId, `${headerBlock('𝗔𝗡𝗧𝗜 𝗦𝗣𝗔𝗠', '⏳')}\n${blockQuote('Mohon tunggu 1 menit sebelum kirim keluhan baru')} \n${footerBlock()}`, { parse_mode:'HTML' });
    }
    if(text.length > 500){
      return bot.sendMessage(chatId, `${headerBlock('𝗧𝗘𝗥𝗟𝗔𝗟𝗨 𝗣𝗔𝗡𝗝𝗔𝗡𝗚', '⚠️')}\n${blockQuote('Maks 500 karakter')} \n${footerBlock()}`, { parse_mode:'HTML' });
    }
    db.users[String(chatId)].awaitingSupport = false;
    await saveDB(db);
    await bot.sendMessage(chatId, `${headerBlock('𝗧𝗜𝗞𝗘𝗧 𝗧𝗘𝗥𝗞𝗜𝗥𝗜𝗠', '✅')}\n${blockQuote(`Keluhan Anda diteruskan ke admin Walzy Store\n🎫 ID Tiket: <code>${genID()}</code>\n⏳ Mohon tunggu balasan`)} \n${footerBlock()}`, { parse_mode:'HTML' });
    if(!db.supportMap) db.supportMap = {};
    for(let oid of config.OWNER_IDS){
      try{
        const sent = await bot.sendMessage(oid, `${headerBlock('𝗧𝗜𝗞𝗘𝗧 𝗦𝗨𝗣𝗣𝗢𝗥𝗧 𝗕𝗔𝗥𝗨', '🎧')}\n${blockQuote(`👤 User: <code>${chatId}</code> @${msg.from.username || '-'}\n\n${esc(text)}\n\n💡 Balas pesan ini untuk membalas user`)} \n${footerBlock()}`, { parse_mode:'HTML' });
        db.supportMap[String(sent.message_id)] = String(chatId);
      }catch(e){}
    }
    await saveDB(db);
    return;
  }

  if(!text) return;

  if(text.startsWith('/gen ')){
    if(!isOwner(chatId)) return;
    const parts = text.split(' ').filter(Boolean);
    if(parts.length < 3) return bot.sendMessage(chatId, `${headerBlock('𝗙𝗢𝗥𝗠𝗔𝗧 𝗦𝗔𝗟𝗔𝗛', '❌')}\n${blockQuote('Gunakan: /gen KODE HARI')} \n${footerBlock()}`, { parse_mode:'HTML' });
    const code = parts[1].toUpperCase();
    const days = parseInt(parts[2]);
    if(!days || days <= 0) return bot.sendMessage(chatId, `Hari tidak valid`);
    db.codes[code] = days;
    await saveDB(db);
    return bot.sendMessage(chatId, `${headerBlock('𝗩𝗢𝗨𝗖𝗛𝗘𝗥 𝗗𝗜𝗕𝗨𝗔𝗧', '✅')}\n${blockQuote(`Kode: <code>${code}</code>\nDurasi: ${days} Hari`)} \n${footerBlock()}`, { parse_mode:'HTML' });
  }

  if(text.startsWith('/redeem ')){
    const parts = text.split(' ').filter(Boolean);
    if(parts.length < 2) return bot.sendMessage(chatId, `${headerBlock('𝗚𝗔𝗚𝗔𝗟', '❌')}\n${blockQuote('Format: /redeem KODE')} \n${footerBlock()}`, { parse_mode:'HTML' });
    const code = parts[1].toUpperCase();
    if(db.codes[code]){
      const days = db.codes[code];
      user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + days * 86400000;
      user.notifiedExp = false;
      user.notifiedExp2 = false;
      delete db.codes[code];
      await saveDB(db);
      return bot.sendMessage(chatId, `${headerBlock('𝗥𝗘𝗗𝗘𝗘𝗠 𝗕𝗘𝗥𝗛𝗔𝗦𝗜𝗟', '🎉')}\n${blockQuote(`Selamat! VIP ${days} Hari aktif di Walzy Store`)} \n${footerBlock()}`, { parse_mode:'HTML' });
    }else{
      return bot.sendMessage(chatId, `${headerBlock('𝗚𝗔𝗚𝗔𝗟', '❌')}\n${blockQuote('Kode tidak valid')} \n${footerBlock()}`, { parse_mode:'HTML' });
    }
  }

  if(text.startsWith('/approve ')){
    if(!isOwner(chatId)) return;
    const inv = text.split(' ')[1].trim();
    const pay = db.payments[inv];
    if(!pay) return bot.sendMessage(chatId, `Invoice ${inv} tidak ditemukan`);
    if(pay.status === 'paid') return bot.sendMessage(chatId, `Invoice ${inv} sudah lunas`);
    pay.status = 'paid';
    const u = getUser(db, pay.userId);
    if(!u) return;
    u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + pay.days * 86400000;
    u.notifiedExp = false;
    u.notifiedExp2 = false;
    u.pendingDeposit = null;
    db.stats.revenue = (db.stats.revenue || 0) + pay.amount;
    if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
    db.stats.revenueHistory.push({ date: new Date().toISOString(), amount: pay.amount, invoice: inv, userId: pay.userId });
    await saveDB(db);
    await bot.sendMessage(chatId, `${headerBlock('𝗔𝗣𝗣𝗥𝗢𝗩𝗘𝗗', '✅')}\n${blockQuote(`${inv} approved untuk ${pay.userId} - Notifikasi persegi terkirim ke webapp user`)} \n${footerBlock()}`, { parse_mode:'HTML' });
    try{
      await bot.sendMessage(pay.userId, `${headerBlock('𝗣𝗘𝗠𝗕𝗔𝗬𝗔𝗥𝗔𝗡 𝗗𝗜𝗦𝗘𝗧𝗨𝗝𝗨𝗜', '✅')}\n${blockQuote(`🎉 Deposit <code>${inv}</code> disetujui!\n💎 Paket: ${pay.days} Hari VIP\n💰 Nominal: Rp ${pay.amount.toLocaleString()}\n⏳ Aktif sampai: ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}\n\n📲 Cek halaman transaksi untuk detail - Notifikasi persegi`)} \n${footerBlock()}`, { parse_mode:'HTML' });
    }catch{}
    return;
  }

  if(text.startsWith('/resetrevenue') || text.startsWith('/reset_revenue')){
    if(!isOwner(chatId)) return;
    const arg = text.split(' ')[1] || '';
    if(arg !== 'SUPER777'){
      return bot.sendMessage(chatId, `${headerBlock('𝗞𝗢𝗡𝗙𝗜𝗥𝗠𝗔𝗦𝗜 𝗥𝗘𝗦𝗘𝗧', '⚠️')}\n${blockQuote('Gunakan: /resetrevenue SUPER777\n\nReset revenue ke 0 dari awal')} \n${footerBlock()}`, { parse_mode:'HTML' });
    }
    const old = db.stats.revenue || 0;
    if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
    db.stats.revenueHistory.push({ date: new Date().toISOString(), amount: -old, invoice: 'RESET', userId: 'SYSTEM', note: 'Reset to 0' });
    db.stats.revenue = 0;
    db.stats.lastReset = Date.now();
    await saveDB(db);
    return bot.sendMessage(chatId, `${headerBlock('𝗥𝗘𝗦𝗘𝗧 𝗕𝗘𝗥𝗛𝗔𝗦𝗜𝗟', '♻️')}\n${blockQuote(`Revenue direset dari Rp ${old.toLocaleString()} ke Rp 0`)} \n${footerBlock()}`, { parse_mode:'HTML' });
  }

  if(text.startsWith('/start')){
    const p = text.split(' ')[1] ? text.split(' ')[1].trim() : '';
    if(p && !isNaN(p) && !isSuspiciousId(p) && String(p) !== String(chatId) && !user.referredBy && db.users[p] && !isOwner(chatId)){
      user.referredBy = String(p);
      db.users[p].referralCount = (db.users[p].referralCount || 0) + 1;
      if(!db.users[p].referrals.includes(String(chatId))) db.users[p].referrals.push(String(chatId));
    }
    await saveDB(db);
    const jc = await checkJoin(bot, chatId);
    if(!jc.joined){
      const txt = `${headerBlock('𝗔𝗞𝗦𝗘𝗦 𝗧𝗘𝗥𝗞𝗨𝗡𝗖𝗜', '🔒')}\n${blockQuote(`Bergabunglah ke saluran resmi Walzy Store untuk akses:\n\n${jc.notJoined.map(c => `• ${c.id}`).join('\n')}\n\n📌 Lakukan verifikasi setelah bergabung`)} \n${footerBlock()}`;
      const btns = jc.notJoined.map(c => [{ text:`✨ JOIN ${c.name}`, url:c.link }]);
      btns.push([{ text:'✅ VERIFIKASI', callback_data:'verify_join' }]);
      return bot.sendMessage(chatId, txt, { parse_mode:'HTML', reply_markup:{ inline_keyboard:btns } });
    }
    const menu = getDashboardMenu(chatId, db, user);
    return bot.sendMessage(chatId, menu.text, { parse_mode:'HTML', disable_web_page_preview:true, ...menu.opts });
  }

  if(db.users[String(chatId)] && db.users[String(chatId)].awaitingNumber){
    if(text.startsWith('/')){
      db.users[String(chatId)].awaitingNumber = false;
      await saveDB(db);
      const menu = getDashboardMenu(chatId, db, user);
      return bot.sendMessage(chatId, menu.text, { parse_mode:'HTML', ...menu.opts });
    }
    const rawLines = text.split('\n').map(x => x.trim()).filter(Boolean);
    let lines = rawLines.map(x => x.replace(/[^0-9+]/g, '')).filter(x => isValidNumber(x));
    if(lines.length === 0){
      return bot.sendMessage(chatId, `${headerBlock('𝗙𝗢𝗥𝗠𝗔𝗧 𝗦𝗔𝗟𝗔𝗛', '❌')}\n${blockQuote(`Harap masukkan angka valid 8-15 digit\n📝 Contoh: <code>628123456789</code>`)} \n${footerBlock()}`, { parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'❌ Batalkan', callback_data:'cancel_action' }]] } });
    }
    if(lines.length > 1 && !isPremium(user) && !isOwner(chatId)){
      return bot.sendMessage(chatId, `${headerBlock('𝗔𝗞𝗦𝗘𝗦 𝗗𝗜𝗧𝗢𝗟𝗔𝗞', '⚠️')}\n${blockQuote('Fitur Multi-Line eksklusif untuk VIP')} \n${footerBlock()}`, { parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'💎 UPGRADE VIP', callback_data:'menu_premium' }, { text:'❌ Batalkan', callback_data:'cancel_action' }]] } });
    }
    if(lines.length > 5) lines = lines.slice(0,5);
    const batchId = genID();
    const procText = lines.map(l => `📱 <code>${l}</code>`).join('\n');
    incrementFixCount(db, user);
    const pendingId = `${Date.now()}_${chatId}`;
    if(!db.pending) db.pending = {};
    db.pending[pendingId] = { chatId, batchId, originalNumbers: lines, timestamp: Date.now(), handled:false };
    db.users[String(chatId)].awaitingNumber = false;
    await saveDB(db);
    await bot.sendMessage(chatId, `${headerBlock('𝗠𝗘𝗠𝗣𝗥𝗢𝗦𝗘𝗦 𝗗𝗔𝗧𝗔 - 𝗕𝗢𝗧 𝗦𝗧𝗢𝗥𝗘', '⚡')}\n${blockQuote(`${procText}\n🔖 <b>Batch ID</b>: <code>${batchId}</code>\n🎯 <b>Target</b>: ${config.TARGET_BOT}`)} \n${footerBlock()}`, { parse_mode:'HTML' });
    const joinedNumbers = lines.join('\n');
    const resTarget = await sendToTarget(joinedNumbers);
    if(!resTarget.ok){
      await bot.sendMessage(chatId, `${headerBlock('𝗘𝗥𝗥𝗢𝗥 𝗦𝗜𝗦𝗧𝗘𝗠', '⚠️')}\n${blockQuote(`Gagal kirim: ${resTarget.error}`)} \n${footerBlock()}`, { parse_mode:'HTML' });
    }
    return;
  }

  if(db.users[String(chatId)] && db.users[String(chatId)].awaitingBroadcast && isOwner(chatId)){
    if(text.startsWith('/')){
      db.users[String(chatId)].awaitingBroadcast = false;
      await saveDB(db);
      return;
    }
    const validUsers = getUniqueUsers(db.users);
    const uids = validUsers.map(u => String(u.id));
    let s = 0, f = 0;
    await bot.sendMessage(chatId, `${headerBlock('𝗠𝗘𝗡𝗚𝗜𝗥𝗜𝗠 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧', '⏳')}\n${blockQuote(`Broadcast ke ${uids.length} user valid anti double`)} \n${footerBlock()}`, { parse_mode:'HTML' });
    for(let uid of uids){
      if(isSuspiciousId(uid)) continue;
      try{ await bot.sendMessage(uid, `📢 <b>BROADCAST WALZY STORE</b>\n${blockQuote(esc(text))}\n${footerBlock()}`, { parse_mode:'HTML' }); s++; }catch{ f++; }
      await new Promise(r => setTimeout(r, 80));
    }
    db.users[String(chatId)].awaitingBroadcast = false;
    await saveDB(db);
    return bot.sendMessage(chatId, `${headerBlock('𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 𝗦𝗘𝗟𝗘𝗦𝗔𝗜', '✅')}\n${blockQuote(`✅ Sukses: ${s}\n❌ Gagal: ${f}\n👥 Valid: ${validUsers.length}`)} \n${footerBlock()}`, { parse_mode:'HTML' });
  }
}

async function handleCallback(bot, db, query){
  ensureDB(db);
  cleanDB(db);
  if(!query.from || query.from.is_bot) return;
  if(isSuspiciousId(query.from.id)) return;
  const chatId = query.message.chat.id;
  if(isSuspiciousId(chatId)) return;
  const msgId = query.message.message_id;
  const data = query.data;
  const user = getUser(db, chatId);
  if(!user) return;
  if(!checkRateLimit(chatId)){
    return bot.answerCallbackQuery(query.id, { text:'Terlalu cepat' });
  }

  if(data === 'verify_join'){
    const jc = await checkJoin(bot, chatId);
    if(jc.joined){
      const menu = getDashboardMenu(chatId, db, user);
      return bot.editMessageText(menu.text, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', disable_web_page_preview:true, ...menu.opts });
    }else{
      return bot.answerCallbackQuery(query.id, { text:'Belum join semua channel', show_alert:true });
    }
  }

  if(data === 'cancel_action' || data === 'menu_main'){
    db.users[String(chatId)].awaitingNumber = false;
    db.users[String(chatId)].awaitingBroadcast = false;
    db.users[String(chatId)].awaitingSupport = false;
    db.users[String(chatId)].pendingDeposit = null;
    await saveDB(db);
    const menu = getDashboardMenu(chatId, db, user);
    return bot.editMessageText(menu.text, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', disable_web_page_preview:true, ...menu.opts });
  }

  if(data === 'menu_fix'){
    const c = canUseFix(db, user);
    if(!c.allowed){
      return bot.editMessageText(`${headerBlock('𝗟𝗜𝗠𝗜𝗧 𝗛𝗔𝗕𝗜𝗦', '🚫')}\n${blockQuote(`Limit harian habis 3/3 - Upgrade VIP untuk unlimited\n\n💎 VIP: Unlimited 5 baris\n🎫 FREE: 3x per hari`)} \n${footerBlock()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'💎 UPGRADE VIP', callback_data:'menu_premium' }], [{ text:'◁ Kembali', callback_data:'menu_main' }]] } });
    }
    db.users[String(chatId)].awaitingNumber = true;
    await saveDB(db);
    return bot.editMessageText(`${headerBlock('𝗙𝗜𝗫 𝗠𝗘𝗥𝗔𝗛 - 𝗕𝗢𝗧 𝗦𝗧𝗢𝗥𝗘', '🔧')}\n${blockQuote(`Silakan kirim nomor target untuk order\n\n📊 Status: ${c.isPremium ? 'VIP Unlimited' : c.remaining + ' kuota tersisa'}\n📝 Format: <code>628xxxxxxxxxx</code>\n${c.isPremium ? '📦 Max 5 nomor per batch' : '📦 1 nomor per batch FREE'}\n\n💡 Ketik nomor langsung pisah baris untuk multi`)} \n${footerBlock()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'◁ Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_premium'){
    return bot.editMessageText(`${headerBlock('𝗩𝗜𝗣 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗣𝗔𝗦𝗦 - 𝗕𝗢𝗧 𝗦𝗧𝗢𝗥𝗘', '💎')}\n${blockQuote(`Keunggulan VIP:\n⚡ Multi-Line 5 nomor per batch\n🚀 Prioritas antrian\n🛡️ Success rate lebih tinggi\n♾️ Unlimited order\n\n💳 Harga Manual:\n• 1 Hari 2k\n• 5 Hari 5k Popular\n• 10 Hari 10k Best Value\n• 30 Hari 60k Sultan\n\n🏦 ${config.DANA_NAME} ${config.DANA_NUMBER}`)} \n${footerBlock()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'💎 1 Hari - 2k', callback_data:'buy_1' }, { text:'💎 5 Hari - 5k', callback_data:'buy_5' }], [{ text:'💎 10 Hari - 10k', callback_data:'buy_10' }, { text:'💎 30 Hari - 60k', callback_data:'buy_30' }], [{ text:'◁ Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_referral'){
    const rnk = getRank(user.referralCount || 0);
    return bot.editMessageText(`${headerBlock('𝗥𝗘𝗙𝗘𝗥𝗥𝗔𝗟 𝗣𝗥𝗢𝗚𝗥𝗔𝗠', '🤝')}\n${blockQuote(`Total: ${user.referralCount || 0}\nRank: ${rnk.icon} ${rnk.name}\nLink: https://t.me/${config.BOT_USERNAME}?start=${chatId}\n\nAnti double akun aktif`)} \n${footerBlock()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'🏆 Klasemen', callback_data:'ref_leaderboard' }], [{ text:'◁ Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'ref_leaderboard'){
    const unique = getUniqueUsers(db.users);
    const sort = unique.sort((a,b) => (b.referralCount||0) - (a.referralCount||0)).slice(0,10);
    let t = `${headerBlock('𝗧𝗢𝗣 𝟭𝟬 𝗔𝗙𝗜𝗟𝗜𝗔𝗧𝗢𝗥 - 𝗔𝗡𝗧𝗜 𝗗𝗢𝗨𝗕𝗟𝗘', '🏆')}\n`;
    sort.forEach((u,i)=>{
      const medal = i===0 ? '🥇' : i===1 ? '🥈' : i===2 ? '🥉' : `${i+1}.`;
      t += `${medal} ${esc(u.first_name)} - ${u.referralCount} Ref\n`;
    });
    t += `\n${blockQuote(`Total valid: ${unique.length} user`)} \n${footerBlock()}`;
    return bot.editMessageText(t, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'◁ Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_dashboard'){
    const rnk = getRank(user.referralCount || 0);
    const can = canUseFix(db, user);
    const txt = `${headerBlock('𝗗𝗔𝗦𝗛𝗕𝗢𝗔𝗥𝗗 - 𝗪𝗔𝗟𝗭𝗬 𝗦𝗧𝗢𝗥𝗘', '📊')}\n${blockQuote(`👤 <b>${esc(user.first_name)}</b>\n🆔 ID: <code>${chatId}</code>\n⚜️ Status: ${isPremium(user) ? `VIP ${getPremiumLeft(user)} Hari` : `FREE ${can.remaining}/3`}\n🏆 Pangkat: ${rnk.icon} ${rnk.name}\n👥 Referral: ${user.referralCount || 0}\n🔧 Total Order: ${user.totalFix || 0}\n\n📋 <b>Menu Dashboard Lengkap</b>`)} \n${footerBlock()}`;
    return bot.editMessageText(txt, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'🎰 Spin Harian', callback_data:'menu_spin' }, { text:'🎟️ Redeem Code', callback_data:'menu_redeem' }], [{ text:'👤 Data Profile', callback_data:'menu_profile' }, { text:'📈 Statistik', callback_data:'menu_stats' }], [{ text:'◁ Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_purchases'){
    const all = Object.values(db.payments || {}).filter(p => !isSuspiciousId(p.userId));
    const userPays = isOwner(chatId) ? all.filter(p => p.status === 'paid').slice(-5) : all.filter(p => String(p.userId) === String(chatId)).slice(-5);
    let txt = `${headerBlock('𝗛𝗔𝗟𝗔𝗠𝗔𝗡 𝗣𝗘𝗠𝗕𝗘𝗟𝗜𝗔𝗡 - 𝗧𝗥𝗔𝗡𝗦𝗔𝗞𝗦𝗜 𝗥𝗔𝗣𝗜𝗛', '🛒')}\n${blockQuote(`Proses ACC tersusun rapih agar tidak bingung\n\n${isOwner(chatId) ? 'Owner: Cek antrean & approve di webapp transaksi' : 'User: Beli paket, upload bukti, tunggu ACC'}\n\n📦 <b>5 Transaksi Terakhir</b>`)} \n`;
    if(userPays.length === 0){
      txt += `${blockQuote('Belum ada transaksi')}\n`;
    }else{
      userPays.forEach(p=>{
        txt += `${blockQuote(`🧾 ${p.invoice} | ${p.days}H | Rp ${p.amount.toLocaleString()} | ${p.status}`)}\n`;
      });
    }
    txt += `${footerBlock()}`;
    return bot.editMessageText(txt, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'💎 Beli VIP', callback_data:'menu_premium' }, { text:'📊 Dashboard', callback_data:'menu_dashboard' }], [{ text:'🌐 Buka Halaman Transaksi', web_app:{ url: `${process.env.PUBLIC_URL || ''}/webapp` } }], [{ text:'◁ Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_spin'){
    const canSpin = !user.lastSpin || user.lastSpin !== getTodayString();
    const txt = `${headerBlock('𝗦𝗣𝗜𝗡 𝗛𝗔𝗥𝗜𝗔𝗡 - 𝗗𝗔𝗜𝗟𝗬 𝗥𝗘𝗪𝗔𝗥𝗗', '🎰')}\n${blockQuote(`${canSpin ? '✅ Siap spin hari ini! Hadiah menanti' : '⏳ Spin hari ini sudah dipakai - Kembali besok'}\n\nLast: ${user.lastSpin || 'Belum pernah'}\n\n🎁 Hadiah: VIP gratis, bonus limit, dll`)} \n${footerBlock()}`;
    return bot.editMessageText(txt, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text: canSpin ? '🎰 PUTAR SEKARANG' : '✅ SUDAH SPIN', callback_data: canSpin ? 'do_spin' : 'menu_main' }], [{ text:'◁ Kembali', callback_data:'menu_dashboard' }]] } });
  }

  if(data === 'do_spin'){
    const today = getTodayString();
    if(user.lastSpin === today){
      return bot.answerCallbackQuery(query.id, { text:'Sudah spin hari ini', show_alert:true });
    }
    const rewards = [{ label:'Bonus 1 Fix', desc:'+1 limit hari ini' }, { label:'VIP 1 Hari', desc:'Gratis VIP 1 hari' }, { label:'5 Referral Poin', desc:'Bonus referral' }];
    const reward = rewards[Math.floor(Math.random()*rewards.length)];
    user.lastSpin = today;
    if(reward.label.includes('VIP')){
      user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + 86400000;
    }
    await saveDB(db);
    const txt = `${headerBlock('𝗦𝗣𝗜𝗡 𝗕𝗘𝗥𝗛𝗔𝗦𝗜𝗟', '🎉')}\n${blockQuote(`🎁 Hadiah: <b>${reward.label}</b>\n📝 ${reward.desc}\n\n✅ Spin berhasil - Notifikasi persegi akan muncul di webapp`)} \n${footerBlock()}`;
    return bot.editMessageText(txt, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'◁ Kembali', callback_data:'menu_dashboard' }]] } });
  }

  if(data === 'menu_redeem'){
    const txt = `${headerBlock('𝗥𝗘𝗗𝗘𝗘𝗠 𝗖𝗢𝗗𝗘 - 𝗩𝗢𝗨𝗖𝗛𝗘𝗥', '🎟️')}\n${blockQuote(`Kirim format:\n<code>/redeem KODE</code>\n\nContoh: /redeem WALZY2024\n\nDapatkan kode dari admin atau event`)} \n${footerBlock()}`;
    return bot.editMessageText(txt, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'◁ Kembali', callback_data:'menu_dashboard' }]] } });
  }

  if(data === 'menu_profile'){
    const rnk = getRank(user.referralCount || 0);
    const can = canUseFix(db, user);
    const txt = `${headerBlock('𝗗𝗔𝗧𝗔 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 - 𝗪𝗔𝗟𝗭𝗬 𝗦𝗧𝗢𝗥𝗘', '👤')}\n${blockQuote(`👤 Nama: <b>${esc(user.first_name)}</b>\n🆔 ID: <code>${chatId}</code>\n📛 Username: @${user.username || '-'}\n⚜️ Status: ${isPremium(user) ? `VIP ${getPremiumLeft(user)} Hari` : `FREE ${can.remaining}/3`}\n🏆 Pangkat: ${rnk.icon} ${rnk.name}\n👥 Referral: ${user.referralCount || 0}\n🔧 Total Order: ${user.totalFix || 0}\n📅 Bergabung: ${new Date(user.joinedAt).toLocaleDateString('id-ID')}\n\n📊 <b>Limit Harian: ${can.remaining} tersisa</b>`)} \n${footerBlock()}`;
    return bot.editMessageText(txt, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'◁ Kembali', callback_data:'menu_dashboard' }]] } });
  }

  if(data.startsWith('buy_')){
    const days = parseInt(data.split('_')[1]);
    const amountMap = { 1:2000, 5:5000, 10:10000, 30:60000 };
    const amount = amountMap[days] || 2000;
    const inv = genInvoiceID();
    db.payments[inv] = { userId: chatId, days, amount, status:'waiting_payment', createdAt: Date.now(), proofFileId: null };
    await saveDB(db);
    return bot.editMessageText(`${headerBlock('𝗜𝗡𝗩𝗢𝗜𝗖𝗘 - 𝗛𝗔𝗟𝗔𝗠𝗔𝗡 𝗣𝗘𝗠𝗕𝗘𝗟𝗜𝗔𝗡', '💳')}\n${blockQuote(`🧾 ID: <code>${inv}</code>\n💎 Paket: ${days} Hari VIP\n💰 Total: Rp ${amount.toLocaleString()}\n🏦 Transfer ke: ${config.DANA_NAME}\n📱 ${config.DANA_NUMBER}\n\n📋 <b>Langkah ACC Rapih:</b>\n1. Transfer sesuai nominal\n2. Klik Sudah Transfer\n3. Upload bukti\n4. Tunggu ACC owner\n5. Notifikasi persegi muncul`)} \n${footerBlock()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'✅ Sudah Transfer', callback_data:`confirm_${inv}` }], [{ text:'◁ Kembali', callback_data:'menu_premium' }]] } });
  }

  if(data.startsWith('confirm_')){
    const inv = data.split('confirm_')[1];
    const pay = db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id, { text:'Invoice tidak ditemukan' });
    pay.status = 'waiting_proof';
    db.users[String(chatId)].pendingDeposit = inv;
    await saveDB(db);
    return bot.editMessageText(`${headerBlock('𝗞𝗢𝗡𝗙𝗜𝗥𝗠𝗔𝗦𝗜 - 𝗨𝗣𝗟𝗢𝗔𝗗 𝗕𝗨𝗞𝗧𝗜', '📤')}\n${blockQuote(`Invoice <code>${inv}</code>\n\nSilakan kirim foto bukti transfer sekarang\nKirim sebagai foto langsung bukan file\n\n📲 Setelah upload cek halaman transaksi untuk status ACC`)} \n${footerBlock()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML' });
  }

  if(data.startsWith('approve_')){
    if(!isOwner(chatId)) return bot.answerCallbackQuery(query.id, { text:'Bukan owner' });
    const inv = data.split('approve_')[1];
    const pay = db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id, { text:'Invoice tidak ditemukan' });
    if(pay.status === 'paid') return bot.editMessageText(`${headerBlock('𝗦𝗨𝗗𝗔𝗛 𝗔𝗣𝗣𝗥𝗢𝗩𝗘𝗗', '✅')}\n${blockQuote(`${inv} sudah approved sebelumnya`)} \n${footerBlock()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML' });
    if(isSuspiciousId(pay.userId)) return bot.editMessageText(`${headerBlock('𝗨𝗦𝗘𝗥 𝗧𝗜𝗗𝗔𝗞 𝗩𝗔𝗟𝗜𝗗', '⚠️')}\n${blockQuote(`${inv} user tidak valid - Dibuang sistem keamanan`)} \n${footerBlock()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML' });
    pay.status = 'paid';
    const u = getUser(db, pay.userId);
    if(!u) return;
    u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + pay.days * 86400000;
    u.notifiedExp = false;
    u.notifiedExp2 = false;
    u.pendingDeposit = null;
    db.stats.revenue = (db.stats.revenue || 0) + pay.amount;
    if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
    db.stats.revenueHistory.push({ date: new Date().toISOString(), amount: pay.amount, invoice: inv, userId: pay.userId });
    await saveDB(db);
    await bot.editMessageText(`${headerBlock('𝗔𝗣𝗣𝗥𝗢𝗩𝗘𝗗 - 𝗡𝗢𝗧𝗜𝗙𝗜𝗞𝗔𝗦𝗜 𝗣𝗘𝗥𝗦𝗘𝗚𝗜', '✅')}\n${blockQuote(`${inv} APPROVED untuk ${pay.userId}\n💎 ${pay.days} hari\n💰 Rp ${pay.amount.toLocaleString()}\n\n✅ Notifikasi persegi terkirim ke user\n📊 Webapp akan sync realtime\n🛒 Halaman transaksi terupdate`)} \n${footerBlock()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML' });
    try{
      await bot.sendMessage(pay.userId, `${headerBlock('𝗣𝗘𝗠𝗕𝗔𝗬𝗔𝗥𝗔𝗡 𝗗𝗜𝗦𝗘𝗧𝗨𝗝𝗨𝗜', '✅')}\n${blockQuote(`🎉 Deposit <code>${inv}</code> disetujui!\n💎 Paket: ${pay.days} Hari VIP\n💰 Nominal: Rp ${pay.amount.toLocaleString()}\n⏳ Aktif sampai: ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}\n\n📲 Cek halaman transaksi - Notifikasi persegi muncul\n🛒 Halaman pembelian terupdate`)} \n${footerBlock()}`, { parse_mode:'HTML' });
    }catch{}
    return;
  }

  if(data.startsWith('reject_')){
    if(!isOwner(chatId)) return;
    const inv = data.split('reject_')[1];
    const pay = db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id, { text:'Invoice tidak ditemukan' });
    pay.status = 'rejected';
    const u = getUser(db, pay.userId);
    if(u) u.pendingDeposit = null;
    await saveDB(db);
    await bot.editMessageText(`${headerBlock('𝗥𝗘𝗝𝗘𝗖𝗧𝗘𝗗', '❌')}\n${blockQuote(`${inv} REJECTED - User dinotifikasi`)} \n${footerBlock()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML' });
    try{ await bot.sendMessage(pay.userId, `${headerBlock('𝗗𝗜𝗧𝗢𝗟𝗔𝗞', '❌')}\n${blockQuote(`Deposit ${inv} ditolak - Hubungi admin`)} \n${footerBlock()}`, { parse_mode:'HTML' }); }catch{}
    return;
  }

  if(data === 'menu_stats'){
    const validUsers = getUniqueUsers(db.users);
    const txt = `${headerBlock('𝗦𝗧𝗔𝗧𝗜𝗦𝗧𝗜𝗞 𝗥𝗘𝗔𝗟𝗧𝗜𝗠𝗘 - 𝗕𝗘𝗗𝗔 𝟯𝟲𝟬°', '📊')}\n${blockQuote(`${isOwner(chatId) ? `👑 <b>MODE OWNER - DARK ADMIN</b>\n` : `🌱 <b>MODE USER - LIGHT STORE</b>\n`}\n🔧 Kamu: <code>${user.totalFix || 0}</code>\n🌍 Global Valid: <code>${db.stats.totalFix || 0}</code>\n✅ Success: <code>${db.stats.totalSuccess || 0}</code>\n❌ Failed: <code>${db.stats.totalFailed || 0}</code>\n👥 User Valid: <code>${validUsers.length}</code>\n👥 User Raw: <code>${Object.keys(db.users).length}</code>\n${isOwner(chatId) ? `💰 Revenue: <code>Rp ${(db.stats.revenue || 0).toLocaleString()}</code>\n🔄 Reset: <code>${new Date(db.stats.lastReset||Date.now()).toLocaleDateString('id-ID')}</code>` : ''}\n\n📊 Realtime bukan simulasi`)} \n${footerBlock()}`;
    return bot.editMessageText(txt, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'🌐 Dashboard Light', web_app:{ url: `${process.env.PUBLIC_URL || ''}/webapp` } }], [{ text:'◁ Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_database' && isOwner(chatId)){
    const unique = getUniqueUsers(db.users);
    let t = `${headerBlock('𝟭𝟬 𝗨𝗦𝗘𝗥 𝗩𝗔𝗟𝗜𝗗 𝗧𝗘𝗥𝗕𝗔𝗥𝗨 - 𝗔𝗡𝗧𝗜 𝗗𝗢𝗨𝗕𝗟𝗘', '👥')}\n${blockQuote(`Total valid: ${unique.length} dari ${Object.keys(db.users).length} raw\nAnti double aktif - 360 beda dari user`)} \n`;
    unique.slice(-10).reverse().forEach(u=>{
      const icn = isPremium(u) ? '💎 VIP' : '🎫 FREE';
      const nm = esc((u.first_name || 'User').substring(0,15));
      t += `${blockQuote(`${icn} <code>${u.id}</code> | ${nm} | ${u.dailyFix?.count || 0}/3 | Order:${u.totalFix || 0}`)}\n`;
    });
    t += `${blockQuote(`📊 Global Fix: ${db.stats.totalFix || 0} | Revenue: ${db.stats.revenue || 0}`)}\n${footerBlock()}`;
    return bot.editMessageText(t, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'🧹 Bersihkan DB', callback_data:'clean_db' }], [{ text:'◁ Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'clean_db' && isOwner(chatId)){
    const before = Object.keys(db.users).length;
    cleanDB(db);
    const after = Object.keys(db.users).length;
    const unique = getUniqueUsers(db.users);
    await saveDB(db);
    return bot.editMessageText(`${headerBlock('𝗖𝗟𝗘𝗔𝗡 𝗗𝗕 𝗕𝗘𝗥𝗛𝗔𝗦𝗜𝗟 - 𝟯𝟲𝟬° 𝗕𝗘𝗗𝗔', '🧹')}\n${blockQuote(`Sebelum: ${before} raw\nSesudah: ${after} raw\nValid unik: ${unique.length}\n\nDouble akun & ID negatif dihapus - Sistem keamanan canggih`)} \n${footerBlock()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'◁ Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_broadcast' && isOwner(chatId)){
    db.users[String(chatId)].awaitingBroadcast = true;
    await saveDB(db);
    return bot.editMessageText(`${headerBlock('𝗠𝗔𝗦𝗦 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 - 𝗢𝗪𝗡𝗘𝗥 𝟯𝟲𝟬°', '📢')}\n${blockQuote('Kirimkan teks untuk disebarkan ke seluruh database valid anti double\n\nKeamanan: hanya user valid yang menerima')} \n${footerBlock()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'❌ Batalkan', callback_data:'cancel_action' }]] } });
  }

  if(data === 'user_contact_owner'){
    db.users[String(chatId)].awaitingSupport = true;
    await saveDB(db);
    return bot.editMessageText(`${headerBlock('𝗛𝗨𝗕𝗨𝗡𝗚𝗜 𝗔𝗗𝗠𝗜𝗡 - 𝗪𝗔𝗟𝗭𝗬 𝗦𝗧𝗢𝗥𝗘', '🎧')}\n${blockQuote('Silakan ketik keluhan atau pertanyaan Anda\nPesan akan diteruskan langsung ke admin dengan sistem penanganan keamanan dan prioritas\n\nMaks 500 karakter - Anti spam 1 menit')} \n${footerBlock()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'❌ Batalkan', callback_data:'cancel_action' }]] } });
  }

  if(data === 'reset_revenue' && isOwner(chatId)){
    return bot.editMessageText(`${headerBlock('𝗥𝗘𝗦𝗘𝗧 𝗥𝗘𝗩𝗘𝗡𝗨𝗘 - 𝗦𝗜𝗦𝗧𝗘𝗠 𝗖𝗔𝗡𝗚𝗚𝗜𝗛', '♻️')}\n${blockQuote('Yakin reset revenue ke 0 dari awal?\n\nKetik: /resetrevenue SUPER777\n\nHistory tetap tercatat - Last reset akan terupdate\n\nMode owner 360 beda dari user')} \n${footerBlock()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'◁ Kembali', callback_data:'menu_main' }]] } });
  }
}

module.exports = async (req, res) => {
  const bot = new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
  try{
    const db = await loadDB();
    ensureDB(db);
    cleanDB(db);
    if(req.method === 'POST'){
      const update = req.body;
      if(update.message) await handleMessage(bot, db, update.message);
      if(update.callback_query){
        await handleCallback(bot, db, update.callback_query);
        try{ await bot.answerCallbackQuery(update.callback_query.id); }catch{}
      }
      await saveDB(db);
    }
    res.status(200).json({ ok:true });
  }catch(e){
    console.error(e);
    res.status(200).json({ ok:false, error:e.message });
  }
};
