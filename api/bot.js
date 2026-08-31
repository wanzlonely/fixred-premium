const { loadDB, saveDB } = require('../lib/utils');
const { getTodayString, esc, getRank, isValidNumber } = require('../lib/utils');
const { sendToTarget } = require('../lib/client');
const config = require('../config');

const rateLimitMap = new Map();
const supportRateMap = new Map();
const joinCache = new Map();

setInterval(() => {
  const now = Date.now();
  for (let [k, v] of rateLimitMap) if (now - v > 60000) rateLimitMap.delete(k);
  for (let [k, v] of supportRateMap) if (now - v.ts > 60000) supportRateMap.delete(k);
  for (let [k, v] of joinCache) if (now - v.ts > 300000) joinCache.delete(k);
  if (rateLimitMap.size > 2000) {
    const first = rateLimitMap.keys().next().value;
    rateLimitMap.delete(first);
  }
}, 60000);

function isOwner(id) {
  return Array.isArray(config.OWNER_IDS) && config.OWNER_IDS.map(String).includes(String(id));
}

function isSuspiciousId(id) {
  const s = String(id);
  const n = Number(id);
  if (!n || n <= 0) return true;
  if (s.startsWith('-')) return true;
  if (s.length > 20) return true;
  if (s.includes('.')) return true;
  if (s.includes('e')) return true;
  return false;
}

function ensureDB(db) {
  if (!db.users) db.users = {};
  if (!db.payments) db.payments = {};
  if (!db.codes) db.codes = {};
  if (!db.stats) db.stats = { totalFix: 0, totalSuccess: 0, totalFailed: 0, revenue: 0, revenueHistory: [], lastReset: Date.now() };
  if (!db.history) db.history = {};
  if (!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
}

function cleanDB(db) {
  for (let k of Object.keys(db.users)) if (isSuspiciousId(k)) delete db.users[k];
  for (let k of Object.keys(db.payments)) {
    const p = db.payments[k];
    if (!p || isSuspiciousId(p.userId)) delete db.payments[k];
  }
}

function getUniqueUsers(usersObj) {
  const map = new Map();
  for (let u of Object.values(usersObj || {})) {
    if (!u || isSuspiciousId(u.id)) continue;
    const key = String(u.id);
    const name = (u.first_name || '').trim().toLowerCase();
    if (!name) continue;
    if (name.includes('exploit') && (u.totalFix || 0) === 0 && (u.referralCount || 0) === 0) continue;
    if (!map.has(key)) map.set(key, u);
  }
  return Array.from(map.values());
}

function checkRateLimit(id) {
  const now = Date.now();
  const key = String(id);
  const last = rateLimitMap.get(key) || 0;
  if (now - last < 1000) return false;
  rateLimitMap.set(key, now);
  return true;
}

function checkSupportRate(id) {
  const now = Date.now();
  const key = String(id);
  const entry = supportRateMap.get(key);
  if (entry && now - entry.ts < 60000) return false;
  supportRateMap.set(key, { ts: now });
  return true;
}

function getUser(db, id) {
  const k = String(id);
  if (isSuspiciousId(k)) return null;
  if (!db.users[k]) {
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
      awaitingNumber: false,
      awaitingSupport: false,
      pendingDeposit: null
    };
  }
  if (!db.users[k].dailyFix || db.users[k].dailyFix.date !== getTodayString()) {
    db.users[k].dailyFix = { date: getTodayString(), count: 0 };
  }
  if (db.users[k].totalFix === undefined) db.users[k].totalFix = 0;
  if (db.users[k].referralCount === undefined) db.users[k].referralCount = 0;
  if (!Array.isArray(db.users[k].referrals)) db.users[k].referrals = [];
  return db.users[k];
}

function isPremium(u) {
  return u && u.premiumUntil && u.premiumUntil > Date.now();
}

function getPremiumLeft(u) {
  if (!isPremium(u)) return null;
  return Math.ceil((u.premiumUntil - Date.now()) / 86400000);
}

function canUseFix(db, u) {
  if (!u) return { allowed: false, remaining: 0, isPremium: false };
  if (isOwner(u.id) || isPremium(u)) return { allowed: true, remaining: 999, isPremium: true };
  if ((u.dailyFix?.count || 0) >= 3) return { allowed: false, remaining: 0, isPremium: false };
  return { allowed: true, remaining: 3 - (u.dailyFix?.count || 0), isPremium: false };
}

function incrementFixCount(db, u) {
  if (!u.dailyFix || u.dailyFix.date !== getTodayString()) {
    u.dailyFix = { date: getTodayString(), count: 0 };
  }
  u.dailyFix.count += 1;
  u.totalFix = (u.totalFix || 0) + 1;
  db.stats.totalFix = (db.stats.totalFix || 0) + 1;
  const k = String(u.id);
  if (!db.history[k]) db.history[k] = [];
  db.history[k].unshift({ date: new Date().toISOString(), count: 1 });
  if (db.history[k].length > 100) db.history[k] = db.history[k].slice(0, 100);
}

async function checkJoin(bot, uid) {
  if (isOwner(uid)) return { joined: true, notJoined: [] };
  const cacheKey = String(uid);
  const cached = joinCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < 300000) return cached.data;
  let notJoined = [];
  const forceJoin = Array.isArray(config.FORCE_JOIN) ? config.FORCE_JOIN : [];
  for (let ch of forceJoin) {
    try {
      const m = await bot.getChatMember(ch.id, uid);
      if (!['member', 'administrator', 'creator'].includes(m.status)) notJoined.push(ch);
    } catch (e) {
      if (e.message && (e.message.includes('chat not found') || e.message.includes('user not found'))) {
        continue;
      }
      if (e.code === 'ETELEGRAM' && e.response && e.response.body && e.response.body.error_code === 400) {
        continue;
      }
      notJoined.push(ch);
    }
  }
  const result = { joined: notJoined.length === 0, notJoined };
  joinCache.set(cacheKey, { ts: Date.now(), data: result });
  return result;
}

function fmtMoney(n) {
  return 'Rp ' + (n || 0).toLocaleString('id-ID');
}

function bq(text) {
  return `<blockquote>${text}</blockquote>`;
}

function getWebAppUrl() {
  const envUrl = process.env.PUBLIC_URL || (process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : '');
  if (!envUrl) return '/webapp';
  return envUrl.replace(/\/$/, '') + '/webapp';
}

function getOwnerMenu(chatId, db, user) {
  const validUsers = getUniqueUsers(db.users);
  const pendingOrders = Object.values(db.payments || {}).filter(p => p.status === 'waiting_approval').length;
  const revenue = db.stats.revenue || 0;
  const vipCount = validUsers.filter(u => isPremium(u)).length;
  const todayOrders = Object.values(db.payments || {}).filter(p => {
    const d = new Date(p.createdAt || 0);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const text = `👑 <b>WALZY STORE • Owner Panel Premium</b> ✨

💎 Halo <b>${esc(user.first_name)}</b>! Dashboard premium siap.

${bq(`<b>📊 Users Valid:</b> ${validUsers.length}
<b>💠 VIP Active:</b> ${vipCount}
<b>⏳ Pending ACC:</b> ${pendingOrders}
<b>📦 Order Hari Ini:</b> ${todayOrders}
<b>💰 Revenue:</b> ${fmtMoney(revenue)}`)}

🚀 <i>Kelola semua via WebApp premium — desain baru glassmorphism + animasi SVG!</i>`;

  return {
    text,
    opts: {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎨✨ Buka Owner WebApp Premium', web_app: { url: getWebAppUrl() } }],
          [{ text: '⏳ Pending ACC', callback_data: 'owner_pending' }, { text: '👥 Users', callback_data: 'owner_users' }],
          [{ text: '🎟️ Voucher', callback_data: 'owner_voucher' }, { text: '📢 Broadcast', callback_data: 'owner_broadcast' }],
          [{ text: '🔄 Refresh', callback_data: 'menu_main' }]
        ]
      }
    }
  };
}

function getUserMenu(chatId, db, user) {
  const rnk = getRank(user.referralCount || 0);
  const can = canUseFix(db, user);
  const status = isPremium(user)
    ? `💠 <b>VIP Aktif</b> ${getPremiumLeft(user)} hari lagi 🔥`
    : `⚡️ <b>Gratis</b> sisa ${can.remaining}/3 hari ini`;

  const text = `🚀 <b>WALZY STORE Premium</b> ✨

👋 Halo <b>${esc(user.first_name)}</b>! ${rnk.icon || '🔰'} Rank: <b>${esc(rnk.name || 'BASIC')}</b>

${bq(`<b>💎 Status:</b> ${status}
<b>🆔 ID:</b> <code>${user.id}</code>
<b>🏆 Total Fix:</b> ${user.totalFix || 0}
<b>🔗 Referral:</b> ${user.referralCount || 0} orang
<b>📅 Gabung:</b> ${new Date(user.joinedAt).toLocaleDateString('id-ID')}`)}

${isPremium(user) ? '🌟 <i>Kamu VIP! Unlimited fix + prioritas.</i>' : '💡 <i>Upgrade VIP untuk unlimited & akses premium!</i>'}

🎁 Buka WebApp di bawah — <b>desain baru premium</b> dengan animasi SVG keren!`;

  return {
    text,
    opts: {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🚀✨ Buka Walzy Store Premium', web_app: { url: getWebAppUrl() } }],
          [{ text: '🎁 Paket VIP', callback_data: 'menu_packages' }, { text: '🎰 Lucky Spin', callback_data: 'menu_spin' }],
          [{ text: '🔗 Referral', callback_data: 'menu_ref' }, { text: '🎟️ Redeem', callback_data: 'menu_redeem' }],
          [{ text: '💬 Bantuan Owner', callback_data: 'user_contact_owner' }]
        ]
      }
    }
  };
}

async function handleMessage(bot, db, msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || '').trim();
  const user = getUser(db, chatId);
  if (!user) return;
  user.first_name = msg.from.first_name || user.first_name;
  user.username = msg.from.username || user.username;

  if (!checkRateLimit(chatId)) {
    return bot.sendMessage(chatId, '⏳ <b>Tunggu sebentar</b>, jangan spam ya! Coba lagi 1 detik.', { parse_mode: 'HTML' });
  }

  const joinCheck = await checkJoin(bot, chatId);
  if (!joinCheck.joined) {
    const joinButtons = joinCheck.notJoined.map(ch => [{ text: '📢 Join ' + (ch.title || ch.id), url: ch.url || ('https://t.me/' + String(ch.id).replace('@','')) }]);
    joinButtons.push([{ text: '✅ Sudah Join - Cek Lagi', callback_data: 'check_join' }]);
    return bot.sendMessage(
      chatId,
      `🔒 <b>Wajib Join Channel Dulu</b> ✨\n\n${bq(joinCheck.notJoined.map(c => `• ${esc(c.title || c.id)}`).join('\n'))}\n\n👇 Join dulu lalu klik cek lagi!`,
      { parse_mode: 'HTML', reply_markup: { inline_keyboard: joinButtons } }
    );
  }

  if (user.awaitingSupport) {
    if (text.toLowerCase() === 'batal') {
      user.awaitingSupport = false;
      await saveDB(db);
      const m = isOwner(chatId) ? getOwnerMenu(chatId, db, user) : getUserMenu(chatId, db, user);
      return bot.sendMessage(chatId, m.text, m.opts);
    }
    if (!checkSupportRate(chatId)) {
      return bot.sendMessage(chatId, '⏳ Tunggu 1 menit sebelum kirim lagi ya!');
    }
    if (text.length < 10) return bot.sendMessage(chatId, '❌ Keluhan terlalu pendek, min 10 karakter. Tulis yang jelas ya!');
    if (text.length > 500) return bot.sendMessage(chatId, '❌ Max 500 karakter. Persingkat keluhanmu!');
    user.awaitingSupport = false;
    await saveDB(db);
    for (let ownerId of config.OWNER_IDS || []) {
      try {
        await bot.sendMessage(ownerId, `💬 <b>Keluhan Baru</b> dari ${esc(user.first_name)} (<code>${chatId}</code>):\n${bq(esc(text))}`, { parse_mode: 'HTML' });
      } catch (e) {}
    }
    return bot.sendMessage(chatId, '✅ <b>Keluhan terkirim ke owner!</b> 🚀\nOwner akan segera merespon.', { parse_mode: 'HTML' });
  }

  if (user.awaitingNumber) {
    if (text.toLowerCase() === 'batal') {
      user.awaitingNumber = false;
      await saveDB(db);
      const m = isOwner(chatId) ? getOwnerMenu(chatId, db, user) : getUserMenu(chatId, db, user);
      return bot.sendMessage(chatId, m.text, m.opts);
    }
    if (!isValidNumber(text)) {
      return bot.sendMessage(chatId, `❌ <b>Nomor salah format!</b>\n\nFormat: 08xxxx\nContoh: 08123456789\n\nKetik <b>batal</b> untuk batal.`, { parse_mode: 'HTML' });
    }
    const can = canUseFix(db, user);
    if (!can.allowed) {
      user.awaitingNumber = false;
      await saveDB(db);
      return bot.sendMessage(chatId, `🚫 <b>Limit habis 3x hari ini!</b>\nBesok reset atau upgrade VIP untuk unlimited! ✨\n\n${bq(`💎 VIP: Unlimited fix + prioritas`)}`, {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [[{ text: '🚀 Upgrade VIP', web_app: { url: getWebAppUrl() } }]] }
      });
    }
    const procMsg = await bot.sendMessage(chatId, `⚙️ <b>Proses fix ${esc(text)}...</b>\n⏳ Tunggu 10-25 detik ya!`, { parse_mode: 'HTML' });
    try {
      const result = await sendToTarget(text);
      if (result.ok) {
        incrementFixCount(db, user);
        db.stats.totalSuccess = (db.stats.totalSuccess || 0) + 1;
        await saveDB(db);
        await bot.editMessageText(`✅ <b>Fix Berhasil!</b> 🎉\n\n${bq(`<b>📱 Nomor:</b> ${esc(text)}\n<b>🎯 Sisa:</b> ${can.remaining - 1}/3\n\n${esc((result.text || 'Berhasil').substring(0, 700))}`)}`, {
          chat_id: chatId,
          message_id: procMsg.message_id,
          parse_mode: 'HTML'
        });
      } else {
        db.stats.totalFailed = (db.stats.totalFailed || 0) + 1;
        await saveDB(db);
        await bot.editMessageText(`❌ <b>Fix Gagal</b>\n\n${bq(`<b>📱 Nomor:</b> ${esc(text)}\n<b>💡 Alasan:</b> ${esc(result.message || 'Tidak ada respon')}`)}`, {
          chat_id: chatId,
          message_id: procMsg.message_id,
          parse_mode: 'HTML'
        });
      }
    } catch (e) {
      await bot.editMessageText(`⚠️ <b>Error:</b> ${esc(e.message)}`, {
        chat_id: chatId,
        message_id: procMsg.message_id,
        parse_mode: 'HTML'
      });
    }
    user.awaitingNumber = false;
    await saveDB(db);
    return;
  }

  if (msg.photo && user.pendingDeposit) {
    const pay = db.payments[user.pendingDeposit];
    if (!pay) {
      user.pendingDeposit = null;
      await saveDB(db);
      return;
    }
    pay.status = 'waiting_approval';
    pay.proofPhoto = msg.photo[msg.photo.length - 1].file_id;
    pay.proofAt = Date.now();
    await saveDB(db);
    for (let ownerId of config.OWNER_IDS || []) {
      try {
        await bot.sendPhoto(ownerId, pay.proofPhoto, {
          caption: `💰 <b>Bukti Transfer Baru</b> ✨\n${bq(`<b>Invoice:</b> ${esc(pay.id)}\n<b>User:</b> ${esc(user.first_name)} (<code>${chatId}</code>)\n<b>Paket:</b> ${pay.days}H ${fmtMoney(pay.amount)}`)}`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '✅ ACC', callback_data: 'approve_' + pay.id }, { text: '❌ Tolak', callback_data: 'reject_' + pay.id }]]
          }
        });
      } catch (e) {}
    }
    return bot.sendMessage(chatId, `✅ <b>Bukti terkirim!</b>\nMenunggu ACC owner ya! ⏳\nInvoice: <code>${esc(pay.id)}</code>`, { parse_mode: 'HTML' });
  }

  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    if (parts.length > 1) {
      const refId = parts[1].trim();
      if (refId && refId !== String(chatId) && !isSuspiciousId(refId) && !user.referredBy) {
        user.referredBy = refId;
        const refUser = db.users[refId];
        if (refUser) {
          refUser.referralCount = (refUser.referralCount || 0) + 1;
          if (!refUser.referrals.includes(String(chatId))) refUser.referrals.push(String(chatId));
          try {
            await bot.sendMessage(refId, `🎉 <b>Referral Baru!</b> ✨\n\n${esc(user.first_name)} join via link kamu!\nTotal referral: <b>${refUser.referralCount}</b> 🔗`, { parse_mode: 'HTML' });
          } catch (e) {}
        }
      }
    }
    const m = isOwner(chatId) ? getOwnerMenu(chatId, db, user) : getUserMenu(chatId, db, user);
    return bot.sendMessage(chatId, m.text, m.opts);
  }

  if (text.startsWith('/redeem')) {
    const code = text.split(/\s+/)[1];
    if (!code) return bot.sendMessage(chatId, '❌ Format: <code>/redeem KODE</code>', { parse_mode: 'HTML' });
    const c = db.codes[code.toUpperCase()];
    if (!c) return bot.sendMessage(chatId, `❌ Kode <b>${esc(code.toUpperCase())}</b> tidak ada.`, { parse_mode: 'HTML' });
    const days = typeof c === 'object' ? c.days : c;
    const quota = typeof c === 'object' ? (c.quota || 0) : 0;
    const used = typeof c === 'object' ? (c.used || 0) : 0;
    if (quota > 0 && used >= quota) return bot.sendMessage(chatId, `❌ Kode habis <b>${used}/${quota}</b>`, { parse_mode: 'HTML' });
    if (days <= 0 || days > 365) return bot.sendMessage(chatId, '❌ Days invalid', { parse_mode: 'HTML' });
    user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + days * 86400000;
    if (typeof c === 'object') {
      c.used = (c.used || 0) + 1;
      if (c.type === 'private' && quota === 1) delete db.codes[code.toUpperCase()];
    } else {
      delete db.codes[code.toUpperCase()];
    }
    await saveDB(db);
    return bot.sendMessage(chatId, `✅ <b>Berhasil redeem ${esc(code.toUpperCase())}!</b> 🎉\n\n${bq(`<b>🎁 Paket:</b> ${days} hari\n<b>📅 Sampai:</b> ${new Date(user.premiumUntil).toLocaleDateString('id-ID')}`)}`, { parse_mode: 'HTML' });
  }

  if (isValidNumber(text)) {
    user.awaitingNumber = true;
    await saveDB(db);
    const can = canUseFix(db, user);
    if (!can.allowed) {
      user.awaitingNumber = false;
      await saveDB(db);
      return bot.sendMessage(chatId, '🚫 <b>Limit habis 3x hari ini!</b> Besok reset atau upgrade VIP! ✨', {
        parse_mode: 'HTML',
        reply_markup: { inline_keyboard: [[{ text: '🚀 Buka Walzy Store Premium', web_app: { url: getWebAppUrl() } }]] }
      });
    }
    return bot.sendMessage(chatId, `📱 <b>Konfirmasi Fix Nomor</b> ${esc(text)}\n\n${bq(`<b>🎯 Sisa:</b> ${can.remaining}/3\n<b>💎 Status:</b> ${can.isPremium ? 'VIP Unlimited' : 'Gratis'}`)}\n\nKetik <b>YA</b> untuk lanjut, <b>batal</b> untuk batal.`, { parse_mode: 'HTML' });
  }

  if (text.toLowerCase() === 'ya' && user.awaitingNumber) {
    return bot.sendMessage(chatId, 'Kirim ulang nomornya ya! Format 08xxxx');
  }

  const m = isOwner(chatId) ? getOwnerMenu(chatId, db, user) : getUserMenu(chatId, db, user);
  return bot.sendMessage(chatId, m.text, m.opts);
}

async function handleCallback(bot, db, query) {
  const chatId = query.message.chat.id;
  const msgId = query.message.message_id;
  const data = query.data;
  const user = getUser(db, chatId);
  if (!user) return;

  if (data === 'check_join') {
    joinCache.delete(String(chatId));
    const joinCheck = await checkJoin(bot, chatId);
    if (joinCheck.joined) {
      const m = isOwner(chatId) ? getOwnerMenu(chatId, db, user) : getUserMenu(chatId, db, user);
      await bot.editMessageText(m.text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: m.opts.reply_markup });
    } else {
      await bot.answerCallbackQuery(query.id, { text: '❌ Belum join semua channel!' });
    }
    return;
  }

  if (data === 'menu_main') {
    const m = isOwner(chatId) ? getOwnerMenu(chatId, db, user) : getUserMenu(chatId, db, user);
    return bot.editMessageText(m.text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: m.opts.reply_markup });
  }

  if (data === 'menu_packages' || data === 'menu_spin' || data === 'menu_ref' || data === 'menu_redeem') {
    const m = getUserMenu(chatId, db, user);
    await bot.answerCallbackQuery(query.id, { text: '✨ Buka WebApp untuk fitur premium!' });
    return bot.sendMessage(chatId, m.text, m.opts);
  }

  if (data === 'owner_pending' || data === 'owner_users' || data === 'owner_voucher' || data === 'owner_broadcast') {
    if (!isOwner(chatId)) return bot.answerCallbackQuery(query.id, { text: '⛔ Bukan owner!' });
    const m = getOwnerMenu(chatId, db, user);
    await bot.answerCallbackQuery(query.id, { text: '🎨 Buka Owner WebApp!' });
    return bot.sendMessage(chatId, m.text, m.opts);
  }

  if (data.startsWith('approve_')) {
    if (!isOwner(chatId)) return bot.answerCallbackQuery(query.id, { text: '⛔ Bukan owner' });
    const inv = data.split('approve_')[1];
    const pay = db.payments[inv];
    if (!pay) return bot.answerCallbackQuery(query.id, { text: '❌ Tidak ada' });
    if (pay.status === 'paid') return bot.editMessageText(`✅ Sudah ACC ${esc(inv)}`, { chat_id: chatId, message_id: msgId });
    pay.status = 'paid';
    pay.paidAt = Date.now();
    const u = getUser(db, pay.userId);
    if (!u) return bot.answerCallbackQuery(query.id, { text: '❌ User tidak ada' });
    u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + pay.days * 86400000;
    u.pendingDeposit = null;
    db.stats.revenue = (db.stats.revenue || 0) + pay.amount;
    if (!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
    db.stats.revenueHistory.unshift({ date: new Date().toISOString(), amount: pay.amount, invoice: inv, userId: pay.userId });
    if (db.stats.revenueHistory.length > 100) db.stats.revenueHistory = db.stats.revenueHistory.slice(0, 100);
    await saveDB(db);
    await bot.editMessageText(`✅ <b>ACC Berhasil ${esc(inv)}</b> 🎉\n${fmtMoney(pay.amount)}`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML' });
    try { await bot.sendMessage(pay.userId, `🎉 <b>LUNAS!</b> Invoice <code>${esc(inv)}</code> disetujui!\n\n${bq(`<b>📦 Paket:</b> ${pay.days}H\n<b>💎 Status:</b> VIP Aktif`)}`, { parse_mode: 'HTML' }); } catch (e) {}
    return;
  }

  if (data.startsWith('reject_')) {
    if (!isOwner(chatId)) return bot.answerCallbackQuery(query.id, { text: '⛔ Bukan owner' });
    const inv = data.split('reject_')[1];
    const pay = db.payments[inv];
    if (!pay) return bot.answerCallbackQuery(query.id, { text: '❌ Tidak ada' });
    pay.status = 'rejected';
    pay.rejectedAt = Date.now();
    const u = getUser(db, pay.userId);
    if (u) u.pendingDeposit = null;
    await saveDB(db);
    await bot.editMessageText(`❌ <b>Ditolak ${esc(inv)}</b>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML' });
    try { await bot.sendMessage(pay.userId, `❌ Invoice <code>${esc(inv)}</code> ditolak owner. Hubungi owner untuk detail.`, { parse_mode: 'HTML' }); } catch (e) {}
    return;
  }

  if (data === 'user_contact_owner') {
    if (!checkSupportRate(chatId)) return bot.answerCallbackQuery(query.id, { text: '⏳ Tunggu 1 menit!' });
    db.users[String(chatId)].awaitingSupport = true;
    await saveDB(db);
    return bot.editMessageText('💬 <b>Tulis Keluhan Kamu</b> (max 500 karakter)\n\n✍️ Ketik keluhan dengan jelas, atau ketik <b>batal</b> untuk batal.', {
      chat_id: chatId,
      message_id: msgId,
      parse_mode: 'HTML',
      reply_markup: { inline_keyboard: [[{ text: '❌ Batal', callback_data: 'cancel_action' }]] }
    });
  }

  if (data === 'cancel_action') {
    user.awaitingSupport = false;
    user.awaitingNumber = false;
    await saveDB(db);
    const m = isOwner(chatId) ? getOwnerMenu(chatId, db, user) : getUserMenu(chatId, db, user);
    return bot.editMessageText(m.text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: m.opts.reply_markup });
  }
}

module.exports = async (req, res) => {
  const bot = new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
  try {
    const db = await loadDB();
    ensureDB(db);
    cleanDB(db);
    if (req.method === 'POST') {
      const update = req.body;
      if (update.message) await handleMessage(bot, db, update.message);
      if (update.callback_query) {
        await handleCallback(bot, db, update.callback_query);
        try { await bot.answerCallbackQuery(update.callback_query.id); } catch (e) {}
      }
      await saveDB(db);
    }
    res.status(200).json({ ok: true, ts: Date.now() });
  } catch (e) {
    console.error(e);
    res.status(200).json({ ok: false, error: e.message });
  }
};
