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
}
function cleanDB(db){
  for(let k of Object.keys(db.users)){
    if(isSuspiciousId(k)) delete db.users[k];
  }
  for(let k of Object.keys(db.payments)){
    const p = db.payments[k];
    if(p && isSuspiciousId(p.userId)) delete db.payments[k];
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
    if(!map.has(lower)) map.set(lower, u);
    else{
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
  if(isOwner(user.id) || isPremium(user)) return { allowed:true, remaining:999, isPremium:true };
  if(user.dailyFix.count >= 3) return { allowed:false, remaining:0, isPremium:false };
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
function bq(text){ return `<blockquote>${text}</blockquote>`; }
function hdr(title, icon){ return `${icon} <b>${title}</b>\n━━━━━━━━━━━━━━━━━━━━━━`; }
function ftr(){ return `━━━━━━━━━━━━━━━━━━━━━━\n🚀 <b>WALZY STORE</b> | ${new Date().toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta'})} WIB`; }

function getOwnerMenu(chatId, db, user){
  const validUsers = getUniqueUsers(db.users);
  const premiumCount = validUsers.filter(u => isPremium(u)).length;
  const todayOrders = Object.values(db.payments||{}).filter(p => {
    if(isSuspiciousId(p.userId)) return false;
    const d = new Date(p.createdAt);
    const now = new Date();
    return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  }).length;
  const text = `${hdr('𝗣𝗔𝗡𝗘𝗟 𝗢𝗪𝗡𝗘𝗥 - 𝗪𝗔𝗟𝗭𝗬', '👑')}\n${bq(`🛡️ <b>Sistem Aman & Real-time</b>\n🎨 Mode gelap eksklusif - Beda 360° dari pengguna\n\n👥 Pengguna Valid : <code>${validUsers.length}</code>\n💎 VIP Aktif     : <code>${premiumCount}</code>\n📦 Total Pesanan : <code>${db.stats.totalFix || 0}</code>\n📈 Pesanan Hari Ini : <code>${todayOrders}</code> (Lebih bermanfaat)\n✅ Sukses        : <code>${db.stats.totalSuccess || 0}</code>\n📊 Rasio         : <code>${db.stats.totalFix ? Math.round((db.stats.totalSuccess/db.stats.totalFix)*100) : 0}%</code>`)} \n\n${bq(`Semua data real-time di webapp owner - Tanpa gimmick`)} \n${ftr()}`;
  return {
    text,
    opts: {
      parse_mode:'HTML',
      reply_markup:{
        inline_keyboard:[
          [{ text:'Panel Owner', web_app:{ url: `${process.env.PUBLIC_URL || ''}/webapp` } }],
          [{ text:'Statistik', callback_data:'menu_stats' }, { text:'Siaran', callback_data:'menu_broadcast' }],
          [{ text:'Bantuan', callback_data:'user_contact_owner' }]
        ]
      }
    }
  };
}

function getUserMenu(chatId, db, user){
  const rnk = getRank(user.referralCount || 0);
  const can = canUseFix(db, user);
  const status = isPremium(user) ? `VIP ${getPremiumLeft(user)} Hari` : `Gratis ${can.remaining}/3`;
  const text = `${hdr('𝗪𝗔𝗟𝗭𝗬 - 𝗧𝗢𝗞𝗢 𝗥𝗘𝗦𝗠𝗜', '🛍️')}\n${bq(`Halo, <b>${esc(user.first_name)}</b>\n\n🆔 ID : <code>${chatId}</code>\n⭐ Status : ${status}\n🏅 Level : ${rnk.icon} ${rnk.name}\n👥 Referral : <code>${user.referralCount || 0}</code>\n📦 Pesanan : <code>${user.totalFix || 0}</code>`)} \n\n${bq(`Buka toko untuk pembelian, hadiah harian, kode voucher, dan transaksi rapih`)} \n${ftr()}`;
  return {
    text,
    opts:{
      parse_mode:'HTML',
      reply_markup:{
        inline_keyboard:[
          [{ text:'Buka Toko', web_app:{ url: `${process.env.PUBLIC_URL || ''}/webapp` } }],
          [{ text:'Profil', callback_data:'menu_profile' }, { text:'Bantuan', callback_data:'user_contact_owner' }]
        ]
      }
    }
  };
}

function getDashboardMenu(chatId, db, user){
  if(isOwner(chatId)) return getOwnerMenu(chatId, db, user);
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
      await bot.sendMessage(chatId, `${hdr('𝗕𝗨𝗞𝗧𝗜 𝗗𝗜𝗧𝗘𝗥𝗜𝗠𝗔', '✅')}\n${bq(`Bukti untuk <code>${inv}</code> diterima\n⏳ Menunggu persetujuan maksimal 24 jam\n📲 Notifikasi persegi akan muncul saat disetujui`)} \n${ftr()}`, { parse_mode:'HTML' });
      for(let oid of config.OWNER_IDS){
        try{
          await bot.sendPhoto(oid, fileId, {
            caption: `📩 <b>Deposit Baru</b>\n🧾 ${inv}\n👤 ${chatId} @${msg.from.username || '-'}\n💎 ${pay.days} Hari - Rp ${pay.amount.toLocaleString()}`,
            parse_mode:'HTML',
            reply_markup:{ inline_keyboard:[[{ text:'Setujui', callback_data:`approve_${inv}` }, { text:'Tolak', callback_data:`reject_${inv}` }]] }
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
        await bot.sendMessage(targetUid, `${hdr('𝗕𝗔𝗟𝗔𝗦𝗔𝗡 𝗔𝗗𝗠𝗜𝗡', '💬')}\n${bq(esc(text))}\n${ftr()}`, { parse_mode:'HTML' });
        await bot.sendMessage(chatId, `Balasan terkirim ke ${targetUid}`);
      }catch(e){ await bot.sendMessage(chatId, `Gagal: ${e.message}`); }
      return;
    }
  }

  if(!isOwner(chatId) && db.users[String(chatId)] && db.users[String(chatId)].awaitingSupport && text){
    if(!checkSupportRate(chatId)){
      return bot.sendMessage(chatId, `${hdr('𝗧𝗨𝗡𝗚𝗚𝗨', '⏳')}\n${bq('Tunggu 1 menit sebelum mengirim keluhan baru')} \n${ftr()}`, { parse_mode:'HTML' });
    }
    if(text.length > 500){
      return bot.sendMessage(chatId, `${hdr('𝗧𝗘𝗥𝗟𝗔𝗟𝗨 𝗣𝗔𝗡𝗝𝗔𝗡𝗚', '⚠️')}\n${bq('Maksimal 500 karakter')} \n${ftr()}`, { parse_mode:'HTML' });
    }
    db.users[String(chatId)].awaitingSupport = false;
    await saveDB(db);
    await bot.sendMessage(chatId, `${hdr('𝗧𝗜𝗞𝗘𝗧 𝗧𝗘𝗥𝗞𝗜𝗥𝗜𝗠', '✅')}\n${bq(`Keluhan diteruskan ke admin\n🎫 ID: <code>${genID()}</code>`)} \n${ftr()}`, { parse_mode:'HTML' });
    if(!db.supportMap) db.supportMap = {};
    for(let oid of config.OWNER_IDS){
      try{
        const sent = await bot.sendMessage(oid, `${hdr('𝗧𝗜𝗞𝗘𝗧 𝗕𝗔𝗥𝗨', '🎧')}\n${bq(`👤 ${chatId} @${msg.from.username || '-'}\n\n${esc(text)}`)} \n${ftr()}`, { parse_mode:'HTML' });
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
    if(parts.length < 3) return bot.sendMessage(chatId, `${hdr('𝗦𝗔𝗟𝗔𝗛', '❌')}\n${bq('Gunakan: /gen KODE HARI')} \n${ftr()}`, { parse_mode:'HTML' });
    const code = parts[1].toUpperCase();
    const days = parseInt(parts[2]);
    db.codes[code] = days;
    await saveDB(db);
    return bot.sendMessage(chatId, `${hdr('𝗩𝗢𝗨𝗖𝗛𝗘𝗥 𝗗𝗜𝗕𝗨𝗔𝗧', '✅')}\n${bq(`Kode: <code>${code}</code>\nDurasi: ${days} Hari`)} \n${ftr()}`, { parse_mode:'HTML' });
  }

  if(text.startsWith('/redeem ')){
    const parts = text.split(' ').filter(Boolean);
    if(parts.length < 2) return bot.sendMessage(chatId, `${hdr('𝗚𝗔𝗚𝗔𝗟', '❌')}\n${bq('Format: /redeem KODE')} \n${ftr()}`, { parse_mode:'HTML' });
    const code = parts[1].toUpperCase();
    if(db.codes[code]){
      const days = db.codes[code];
      user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + days * 86400000;
      user.notifiedExp = false;
      delete db.codes[code];
      await saveDB(db);
      return bot.sendMessage(chatId, `${hdr('𝗕𝗘𝗥𝗛𝗔𝗦𝗜𝗟', '🎉')}\n${bq(`VIP ${days} Hari aktif`)} \n${ftr()}`, { parse_mode:'HTML' });
    }else{
      return bot.sendMessage(chatId, `${hdr('𝗚𝗔𝗚𝗔𝗟', '❌')}\n${bq('Kode tidak valid')} \n${ftr()}`, { parse_mode:'HTML' });
    }
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
      const txt = `${hdr('𝗔𝗞𝗦𝗘𝗦 𝗧𝗘𝗥𝗞𝗨𝗡𝗖𝗜', '🔒')}\n${bq(`Bergabung ke saluran resmi untuk akses:\n${jc.notJoined.map(c => `• ${c.id}`).join('\n')}`)} \n${ftr()}`;
      const btns = jc.notJoined.map(c => [{ text:`Gabung ${c.name}`, url:c.link }]);
      btns.push([{ text:'Verifikasi', callback_data:'verify_join' }]);
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
      return bot.sendMessage(chatId, `${hdr('𝗦𝗔𝗟𝗔𝗛', '❌')}\n${bq('Masukkan angka valid 8-15 digit')} \n${ftr()}`, { parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'Batal', callback_data:'cancel_action' }]] } });
    }
    if(lines.length > 1 && !isPremium(user) && !isOwner(chatId)){
      return bot.sendMessage(chatId, `${hdr('𝗗𝗜𝗧𝗢𝗟𝗔𝗞', '⚠️')}\n${bq('Multi-baris khusus VIP')} \n${ftr()}`, { parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'Upgrade', callback_data:'menu_premium' }]] } });
    }
    if(lines.length > 5) lines = lines.slice(0,5);
    const batchId = genID();
    incrementFixCount(db, user);
    const pendingId = `${Date.now()}_${chatId}`;
    if(!db.pending) db.pending = {};
    db.pending[pendingId] = { chatId, batchId, originalNumbers: lines, timestamp: Date.now(), handled:false };
    db.users[String(chatId)].awaitingNumber = false;
    await saveDB(db);
    await bot.sendMessage(chatId, `${hdr('𝗠𝗘𝗠𝗣𝗥𝗢𝗦𝗘𝗦', '⚡')}\n${bq(`Batch: <code>${batchId}</code>\nJumlah: ${lines.length}`)} \n${ftr()}`, { parse_mode:'HTML' });
    const joinedNumbers = lines.join('\n');
    const resTarget = await sendToTarget(joinedNumbers);
    if(!resTarget.ok){
      await bot.sendMessage(chatId, `${hdr('𝗘𝗥𝗥𝗢𝗥', '⚠️')}\n${bq(`Gagal: ${resTarget.error}`)} \n${ftr()}`, { parse_mode:'HTML' });
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
    await bot.sendMessage(chatId, `${hdr('𝗠𝗘𝗡𝗚𝗜𝗥𝗜𝗠', '⏳')}\n${bq(`Broadcast ke ${uids.length} pengguna valid`)} \n${ftr()}`, { parse_mode:'HTML' });
    for(let uid of uids){
      if(isSuspiciousId(uid)) continue;
      try{ await bot.sendMessage(uid, `${hdr('𝗣𝗘𝗡𝗚𝗨𝗠𝗨𝗠𝗔𝗡', '📢')}\n${bq(esc(text))}\n${ftr()}`, { parse_mode:'HTML' }); s++; }catch{ f++; }
      await new Promise(r => setTimeout(r, 80));
    }
    db.users[String(chatId)].awaitingBroadcast = false;
    await saveDB(db);
    return bot.sendMessage(chatId, `${hdr('𝗦𝗘𝗟𝗘𝗦𝗔𝗜', '✅')}\n${bq(`Sukses: ${s}\nGagal: ${f}`)} \n${ftr()}`, { parse_mode:'HTML' });
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
    return bot.answerCallbackQuery(query.id, { text:'Tunggu sebentar' });
  }

  if(data === 'verify_join'){
    const jc = await checkJoin(bot, chatId);
    if(jc.joined){
      const menu = getDashboardMenu(chatId, db, user);
      return bot.editMessageText(menu.text, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', disable_web_page_preview:true, ...menu.opts });
    }else{
      return bot.answerCallbackQuery(query.id, { text:'Belum bergabung', show_alert:true });
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
      return bot.editMessageText(`${hdr('𝗕𝗔𝗧𝗔𝗦 𝗛𝗔𝗕𝗜𝗦', '🚫')}\n${bq('Batas harian habis - Buka toko untuk upgrade')}\n${ftr()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'Buka Toko', web_app:{ url: `${process.env.PUBLIC_URL || ''}/webapp` } }], [{ text:'Kembali', callback_data:'menu_main' }]] } });
    }
    db.users[String(chatId)].awaitingNumber = true;
    await saveDB(db);
    return bot.editMessageText(`${hdr('𝗞𝗔𝗧𝗔𝗟𝗢𝗚', '📦')}\n${bq(`Kirim nomor tujuan\nSisa: ${c.isPremium ? 'Tak terbatas' : c.remaining}`)}\n${ftr()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_premium'){
    return bot.editMessageText(`${hdr('𝗣𝗔𝗞𝗘𝗧 𝗣𝗥𝗘𝗠𝗜𝗨𝗠', '⭐')}\n${bq(`1 Hari 2k\n5 Hari 5k\n10 Hari 10k\n30 Hari 60k\n\nTransfer: ${config.DANA_NAME} ${config.DANA_NUMBER}\n\nBuka toko untuk proses lebih mudah`)} \n${ftr()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'Buka Toko', web_app:{ url: `${process.env.PUBLIC_URL || ''}/webapp` } }], [{ text:'Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_profile'){
    const rnk = getRank(user.referralCount || 0);
    const can = canUseFix(db, user);
    const txt = `${hdr('𝗣𝗥𝗢𝗙𝗜𝗟 𝗦𝗔𝗬𝗔', '👤')}\n${bq(`Nama: <b>${esc(user.first_name)}</b>\nID: <code>${chatId}</code>\nStatus: ${isPremium(user) ? `VIP ${getPremiumLeft(user)} Hari` : `Gratis ${can.remaining}/3`}\nLevel: ${rnk.icon} ${rnk.name}\nReferral: ${user.referralCount || 0}\nPesanan: ${user.totalFix || 0}`)} \n${ftr()}`;
    return bot.editMessageText(txt, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'Kembali', callback_data:'menu_main' }]] } });
  }

  if(data.startsWith('buy_')){
    const days = parseInt(data.split('_')[1]);
    const amountMap = { 1:2000, 5:5000, 10:10000, 30:60000 };
    const amount = amountMap[days] || 2000;
    const inv = genInvoiceID();
    db.payments[inv] = { userId: chatId, days, amount, status:'waiting_payment', createdAt: Date.now(), proofFileId: null };
    await saveDB(db);
    return bot.editMessageText(`${hdr('𝗜𝗡𝗩𝗢𝗜𝗖𝗘', '🧾')}\n${bq(`ID: <code>${inv}</code>\nPaket: ${days} Hari\nTotal: Rp ${amount.toLocaleString()}\nTransfer: ${config.DANA_NAME} ${config.DANA_NUMBER}`)}\n${ftr()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'Sudah Transfer', callback_data:`confirm_${inv}` }], [{ text:'Kembali', callback_data:'menu_main' }]] } });
  }

  if(data.startsWith('confirm_')){
    const inv = data.split('confirm_')[1];
    const pay = db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id, { text:'Tidak ditemukan' });
    pay.status = 'waiting_proof';
    db.users[String(chatId)].pendingDeposit = inv;
    await saveDB(db);
    return bot.editMessageText(`${hdr('𝗞𝗢𝗡𝗙𝗜𝗥𝗠𝗔𝗦𝗜', '📤')}\n${bq(`Invoice <code>${inv}</code>\nKirim foto bukti transfer sekarang`)} \n${ftr()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML' });
  }

  if(data.startsWith('approve_')){
    if(!isOwner(chatId)) return bot.answerCallbackQuery(query.id, { text:'Bukan owner' });
    const inv = data.split('approve_')[1];
    const pay = db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id, { text:'Tidak ditemukan' });
    if(pay.status === 'paid') return bot.editMessageText(`${hdr('𝗦𝗨𝗗𝗔𝗛 𝗗𝗜𝗦𝗘𝗧𝗨𝗝𝗨𝗜', '✅')}\n${bq(`${inv} sudah disetujui`)} \n${ftr()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML' });
    if(isSuspiciousId(pay.userId)) return bot.editMessageText(`${hdr('𝗧𝗜𝗗𝗔𝗞 𝗩𝗔𝗟𝗜𝗗', '⚠️')}\n${bq(`${inv} pengguna tidak valid`)} \n${ftr()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML' });
    pay.status = 'paid';
    const u = getUser(db, pay.userId);
    if(!u) return;
    u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + pay.days * 86400000;
    u.pendingDeposit = null;
    db.stats.revenue = (db.stats.revenue || 0) + pay.amount;
    if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
    db.stats.revenueHistory.push({ date: new Date().toISOString(), amount: pay.amount, invoice: inv, userId: pay.userId });
    await saveDB(db);
    await bot.editMessageText(`${hdr('𝗗𝗜𝗦𝗘𝗧𝗨𝗝𝗨𝗜', '✅')}\n${bq(`${inv} disetujui untuk ${pay.userId}\nNotifikasi persegi terkirim`)} \n${ftr()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML' });
    try{
      await bot.sendMessage(pay.userId, `${hdr('𝗗𝗜𝗦𝗘𝗧𝗨𝗝𝗨𝗜', '✅')}\n${bq(`Deposit ${inv} disetujui\nPaket ${pay.days} Hari aktif sampai ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}`)} \n${ftr()}`, { parse_mode:'HTML' });
    }catch{}
    return;
  }

  if(data.startsWith('reject_')){
    if(!isOwner(chatId)) return;
    const inv = data.split('reject_')[1];
    const pay = db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id, { text:'Tidak ditemukan' });
    pay.status = 'rejected';
    const u = getUser(db, pay.userId);
    if(u) u.pendingDeposit = null;
    await saveDB(db);
    await bot.editMessageText(`${hdr('𝗗𝗜𝗧𝗢𝗟𝗔𝗞', '❌')}\n${bq(`${inv} ditolak`)} \n${ftr()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML' });
    try{ await bot.sendMessage(pay.userId, `${hdr('𝗗𝗜𝗧𝗢𝗟𝗔𝗞', '❌')}\n${bq(`Deposit ${inv} ditolak`)} \n${ftr()}`, { parse_mode:'HTML' }); }catch{}
    return;
  }

  if(data === 'menu_stats'){
    const validUsers = getUniqueUsers(db.users);
    const todayOrders = Object.values(db.payments||{}).filter(p => {
      if(isSuspiciousId(p.userId)) return false;
      const d = new Date(p.createdAt);
      const now = new Date();
      return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
    }).length;
    const txt = `${hdr('𝗦𝗧𝗔𝗧𝗜𝗦𝗧𝗜𝗞', '📊')}\n${bq(`Pengguna Valid: <code>${validUsers.length}</code>\nPesanan: <code>${db.stats.totalFix || 0}</code>\nPesanan Hari Ini: <code>${todayOrders}</code>\nSukses: <code>${db.stats.totalSuccess || 0}</code>\nRasio: <code>${db.stats.totalFix ? Math.round((db.stats.totalSuccess/db.stats.totalFix)*100) : 0}%</code>`)} \n${ftr()}`;
    return bot.editMessageText(txt, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'Buka Toko', web_app:{ url: `${process.env.PUBLIC_URL || ''}/webapp` } }], [{ text:'Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_broadcast' && isOwner(chatId)){
    db.users[String(chatId)].awaitingBroadcast = true;
    await saveDB(db);
    return bot.editMessageText(`${hdr('𝗦𝗜𝗔𝗥𝗔𝗡', '📢')}\n${bq('Kirim teks untuk siaran ke semua pengguna valid')} \n${ftr()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'Batal', callback_data:'cancel_action' }]] } });
  }

  if(data === 'user_contact_owner'){
    db.users[String(chatId)].awaitingSupport = true;
    await saveDB(db);
    return bot.editMessageText(`${hdr('𝗕𝗔𝗡𝗧𝗨𝗔𝗡', '💬')}\n${bq('Ketik keluhan Anda - Maks 500 karakter')} \n${ftr()}`, { chat_id:chatId, message_id:msgId, parse_mode:'HTML', reply_markup:{ inline_keyboard:[[{ text:'Batal', callback_data:'cancel_action' }]] } });
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
