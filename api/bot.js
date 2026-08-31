const { loadDB, saveDB } = require('../lib/utils');
const { getTodayString, esc, getRank, isValidNumber } = require('../lib/utils');
const { sendToTarget } = require('../lib/client');
const config = require('../config');

const rateLimitMap = new Map();
const supportRateMap = new Map();
const joinCache = new Map();

function isOwner(id) {
  return config.OWNER_IDS.map(String).includes(String(id));
}

function isSuspiciousId(id) {
  const s = String(id);
  const n = Number(id);
  if (!n || n <= 0) return true;
  if (s.startsWith('-')) return true;
  if (s.length > 20) return true;
  if (s.includes('.')) return true;
  return false;
}

function ensureDB(db) {
  if (!db.users) db.users = {};
  if (!db.payments) db.payments = {};
  if (!db.codes) db.codes = {};
  if (!db.stats) db.stats = { totalFix: 0, totalSuccess: 0, totalFailed: 0, revenue: 0, revenueHistory: [], lastReset: Date.now() };
  if (!db.history) db.history = {};
  if (!db.pending) db.pending = {};
  if (!db.supportMap) db.supportMap = {};
}

function cleanDB(db) {
  for (let k of Object.keys(db.users)) {
    if (isSuspiciousId(k)) delete db.users[k];
  }
  for (let k of Object.keys(db.payments)) {
    const p = db.payments[k];
    if (p && isSuspiciousId(p.userId)) delete db.payments[k];
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
  if (rateLimitMap.size > 1000) {
    const first = rateLimitMap.keys().next().value;
    rateLimitMap.delete(first);
  }
  return true;
}

function checkSupportRate(id) {
  const now = Date.now();
  const key = String(id);
  const last = supportRateMap.get(key) || 0;
  if (now - last < 60000) return false;
  supportRateMap.set(key, now);
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
      awaitingBroadcast: false,
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
  if (u.dailyFix.count >= 3) return { allowed: false, remaining: 0, isPremium: false };
  return { allowed: true, remaining: 3 - u.dailyFix.count, isPremium: false };
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
  for (let ch of config.FORCE_JOIN) {
    try {
      const m = await bot.getChatMember(ch.id, uid);
      if (!['member', 'administrator', 'creator'].includes(m.status)) notJoined.push(ch);
    } catch (e) {
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

function getOwnerMenu(chatId, db, user) {
  const validUsers = getUniqueUsers(db.users);
  const pendingOrders = Object.values(db.payments || {}).filter(p => p.status === 'waiting_approval').length;
  const revenue = db.stats.revenue || 0;
  const now = new Date();

  const text =
`Owner Panel 👑

Halo ${esc(user.first_name)}!

Users Valid: ${validUsers.length}
VIP Active: ${validUsers.filter(u => isPremium(u)).length}
Pending ACC: ${pendingOrders}
Revenue: ${fmtMoney(revenue)}

Jam: ${now.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB

Buka Owner WebApp di bawah untuk kelola semua fitur.
Semua fitur owner sudah pindah ke WebApp.`;

  return {
    text,
    opts: {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎨 Buka Owner WebApp', web_app: { url: `${process.env.PUBLIC_URL || ''}/webapp` } }]
        ]
      }
    }
  };
}

function getUserMenu(chatId, db, user) {
  const rnk = getRank(user.referralCount || 0);
  const can = canUseFix(db, user);
  const status = isPremium(user)
    ? `VIP Aktif ${getPremiumLeft(user)} hari`
    : `Gratis sisa ${can.remaining}/3 hari ini`;

  const text =
`Halo ${esc(user.first_name)}! 👋

Status: ${status}
Rank: ${rnk.name} ${rnk.icon}
ID: ${user.id}

Total Order: ${user.totalFix || 0}
Referral: ${user.referralCount || 0} orang
Gabung: ${new Date(user.joinedAt).toLocaleDateString('id-ID')}

Buka Walzy Store di bawah untuk beli paket premium dan fix merah.
Bayar via DANA ${config.DANA_NUMBER}`;

  return {
    text,
    opts: {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎨 Buka Walzy Store', web_app: { url: `${process.env.PUBLIC_URL || ''}/webapp` } }],
          [{ text: '💬 Bantuan', callback_data: 'user_contact_owner' }]
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
    return bot.sendMessage(chatId, '⏳ Tunggu sebentar, jangan spam.', { parse_mode: 'HTML' });
  }

  const joinCheck = await checkJoin(bot, chatId);
  if (!joinCheck.joined) {
    const joinButtons = joinCheck.notJoined.map(ch => [{ text: 'Join ' + ch.title, url: ch.url }]);
    joinButtons.push([{ text: '✅ Sudah Join', callback_data: 'check_join' }]);
    return bot.sendMessage(
      chatId,
      `Wajib join channel dulu:\n${joinCheck.notJoined.map(c => '- ' + c.title).join('\n')}\n\nKlik Sudah Join setelah join.`,
      { parse_mode: 'HTML', reply_markup: { inline_keyboard: joinButtons } }
    );
  }

  if (user.awaitingBroadcast && isOwner(chatId)) {
    if (text.toLowerCase() === 'batal') {
      user.awaitingBroadcast = false;
      await saveDB(db);
      const m = getOwnerMenu(chatId, db, user);
      return bot.sendMessage(chatId, m.text, m.opts);
    }
    if (text.length < 5) return bot.sendMessage(chatId, 'Pesan terlalu pendek, min 5 karakter.');
    if (text.length > 1000) return bot.sendMessage(chatId, 'Pesan kepanjangan, max 1000.');
    
    const unique = getUniqueUsers(db.users);
    let sent = 0, failed = 0;
    const statusMsg = await bot.sendMessage(chatId, `Mulai broadcast ke ${unique.length} user...`);
    
    for (let i = 0; i < unique.length; i++) {
      const u = unique[i];
      try {
        await bot.sendMessage(u.id, `📢 Info dari Walzy Store:\n\n${esc(text)}`);
        sent++;
      } catch (e) {
        failed++;
      }
      await new Promise(r => setTimeout(r, 80));
    }
    
    user.awaitingBroadcast = false;
    await saveDB(db);
    return bot.editMessageText(
      `Broadcast selesai\nTotal: ${unique.length}\nBerhasil: ${sent}\nGagal: ${failed}`,
      { chat_id: chatId, message_id: statusMsg.message_id }
    );
  }

  if (user.awaitingSupport) {
    if (text.toLowerCase() === 'batal') {
      user.awaitingSupport = false;
      await saveDB(db);
      const m = getUserMenu(chatId, db, user);
      return bot.sendMessage(chatId, m.text, m.opts);
    }
    if (!checkSupportRate(chatId)) {
      return bot.sendMessage(chatId, 'Tunggu 1 menit sebelum kirim lagi.');
    }
    if (text.length < 10) return bot.sendMessage(chatId, 'Keluhan terlalu pendek, min 10 karakter.');
    if (text.length > 500) return bot.sendMessage(chatId, 'Keluhan kepanjangan, max 500.');

    user.awaitingSupport = false;
    await saveDB(db);

    for (let ownerId of config.OWNER_IDS) {
      try {
        await bot.sendMessage(
          ownerId,
          `Keluhan baru dari ${esc(user.first_name)} (${chatId}):\n${esc(text)}`
        );
      } catch (e) {}
    }
    return bot.sendMessage(chatId, 'Keluhan terkirim ke owner, akan dibalas segera.');
  }

  if (user.awaitingNumber) {
    if (text.toLowerCase() === 'batal') {
      user.awaitingNumber = false;
      await saveDB(db);
      const m = getUserMenu(chatId, db, user);
      return bot.sendMessage(chatId, m.text, m.opts);
    }
    if (!isValidNumber(text)) {
      return bot.sendMessage(chatId, 'Nomor salah. Format 08xxxx atau 62xxxx\nContoh: 08123456789\nKetik batal untuk batal.');
    }

    const can = canUseFix(db, user);
    if (!can.allowed) {
      user.awaitingNumber = false;
      await saveDB(db);
      return bot.sendMessage(chatId, 'Limit habis, sudah 3x hari ini. Tunggu besok atau upgrade VIP.', {
        reply_markup: {
          inline_keyboard: [[{ text: 'Buka Walzy Store', web_app: { url: `${process.env.PUBLIC_URL || ''}/webapp` } }]]
        }
      });
    }

    const procMsg = await bot.sendMessage(chatId, `Proses fix nomor ${esc(text)}...\nTarget: ${config.TARGET_BOT}\nTunggu 10-25 detik.`);

    try {
      const result = await sendToTarget(text);
      if (result.ok) {
        incrementFixCount(db, user);
        db.stats.totalSuccess = (db.stats.totalSuccess || 0) + 1;
        await saveDB(db);
        await bot.editMessageText(
          `Fix berhasil!\nNomor: ${esc(text)}\nSisa: ${can.remaining - 1}/3\n\nHasil: ${(result.text || 'Berhasil').substring(0, 800)}`,
          { chat_id: chatId, message_id: procMsg.message_id }
        );
      } else {
        db.stats.totalFailed = (db.stats.totalFailed || 0) + 1;
        await saveDB(db);
        await bot.editMessageText(
          `Fix gagal\nNomor: ${esc(text)}\nAlasan: ${esc(result.message || 'Tidak respon')}`,
          { chat_id: chatId, message_id: procMsg.message_id }
        );
      }
    } catch (e) {
      await bot.editMessageText(`Error: ${esc(e.message)}`, {
        chat_id: chatId,
        message_id: procMsg.message_id
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

    for (let ownerId of config.OWNER_IDS) {
      try {
        await bot.sendPhoto(ownerId, pay.proofPhoto, {
          caption: `Bukti baru\nInvoice: ${pay.id}\nUser: ${esc(user.first_name)} (${chatId})\nPaket: ${pay.days}H ${fmtMoney(pay.amount)}`,
          reply_markup: {
            inline_keyboard: [
              [{ text: '✅ ACC', callback_data: 'approve_' + pay.id }, { text: '❌ Tolak', callback_data: 'reject_' + pay.id }]
            ]
          }
        });
      } catch (e) {}
    }
    return bot.sendMessage(chatId, `Bukti diterima\nInvoice: ${pay.id}\nMenunggu ACC owner 5-10 menit.`);
  }

  if (text.startsWith('/start')) {
    const refMatch = text.match(/\/start\s+(\d+)/);
    if (refMatch) {
      const refId = refMatch[1];
      if (refId !== String(chatId) && !isSuspiciousId(refId) && db.users[refId] && !user.referredBy) {
        user.referredBy = refId;
        const refUser = db.users[refId];
        if (refUser) {
          refUser.referralCount = (refUser.referralCount || 0) + 1;
          if (!refUser.referrals.includes(String(chatId))) refUser.referrals.push(String(chatId));
          try {
            await bot.sendMessage(refId, `Referral baru: ${esc(user.first_name)} join via link kamu. Total: ${refUser.referralCount}`);
          } catch (e) {}
        }
      }
    }
    const m = isOwner(chatId) ? getOwnerMenu(chatId, db, user) : getUserMenu(chatId, db, user);
    return bot.sendMessage(chatId, m.text, m.opts);
  }

  if (text.startsWith('/redeem')) {
    const code = text.split(/\s+/)[1];
    if (!code) return bot.sendMessage(chatId, 'Format: /redeem KODE');
    const c = db.codes[code.toUpperCase()];
    if (!c) return bot.sendMessage(chatId, `Kode ${code.toUpperCase()} tidak ada.`);
    const days = typeof c === 'object' ? c.days : c;
    const quota = typeof c === 'object' ? (c.quota || 0) : 0;
    const used = typeof c === 'object' ? (c.used || 0) : 0;
    if (quota > 0 && used >= quota) return bot.sendMessage(chatId, `Kode habis ${used}/${quota}`);
    user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + days * 86400000;
    if (typeof c === 'object') {
      c.used = (c.used || 0) + 1;
      if (c.type === 'private' && quota === 1) delete db.codes[code.toUpperCase()];
    } else {
      delete db.codes[code.toUpperCase()];
    }
    await saveDB(db);
    return bot.sendMessage(chatId, `Berhasil redeem ${code.toUpperCase()} ${days} hari\nAktif sampai ${new Date(user.premiumUntil).toLocaleDateString('id-ID')}`);
  }

  if (isValidNumber(text)) {
    user.awaitingNumber = true;
    await saveDB(db);
    const can = canUseFix(db, user);
    if (!can.allowed) {
      user.awaitingNumber = false;
      await saveDB(db);
      return bot.sendMessage(chatId, 'Limit habis 3x hari ini. Besok reset atau upgrade VIP.', {
        reply_markup: {
          inline_keyboard: [[{ text: 'Buka Walzy Store', web_app: { url: `${process.env.PUBLIC_URL || ''}/webapp` } }]]
        }
      });
    }
    return bot.sendMessage(chatId, `Konfirmasi fix nomor ${esc(text)}\nSisa: ${can.remaining}/3\nKetik YA untuk lanjut, batal untuk batal.`);
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
      await bot.editMessageText(m.text, {
        chat_id: chatId,
        message_id: msgId,
        reply_markup: m.opts.reply_markup
      });
    } else {
      await bot.answerCallbackQuery(query.id, { text: 'Belum join semua channel' });
    }
    return;
  }

  if (data === 'menu_main') {
    const m = isOwner(chatId) ? getOwnerMenu(chatId, db, user) : getUserMenu(chatId, db, user);
    return bot.editMessageText(m.text, {
      chat_id: chatId,
      message_id: msgId,
      reply_markup: m.opts.reply_markup
    });
  }

  if (data.startsWith('approve_')) {
    if (!isOwner(chatId)) return bot.answerCallbackQuery(query.id, { text: 'Bukan owner' });
    const inv = data.split('approve_')[1];
    const pay = db.payments[inv];
    if (!pay) return bot.answerCallbackQuery(query.id, { text: 'Invoice tidak ada' });
    if (pay.status === 'paid') return bot.editMessageText(`Sudah ACC ${inv}`, { chat_id: chatId, message_id: msgId });
    if (isSuspiciousId(pay.userId)) return bot.editMessageText(`User tidak valid ${inv}`, { chat_id: chatId, message_id: msgId });
    pay.status = 'paid';
    const u = getUser(db, pay.userId);
    if (!u) return;
    u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + pay.days * 86400000;
    u.pendingDeposit = null;
    db.stats.revenue = (db.stats.revenue || 0) + pay.amount;
    if (!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
    db.stats.revenueHistory.push({ date: new Date().toISOString(), amount: pay.amount, invoice: inv, userId: pay.userId });
    await saveDB(db);
    await bot.editMessageText(`ACC berhasil ${inv}`, { chat_id: chatId, message_id: msgId });
    try {
      await bot.sendMessage(pay.userId, `LUNAS! Invoice ${inv} disetujui\nPaket ${pay.days}H sampai ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}`);
    } catch (e) {}
    return;
  }

  if (data.startsWith('reject_')) {
    if (!isOwner(chatId)) return;
    const inv = data.split('reject_')[1];
    const pay = db.payments[inv];
    if (!pay) return bot.answerCallbackQuery(query.id, { text: 'Tidak ada' });
    pay.status = 'rejected';
    const u = getUser(db, pay.userId);
    if (u) u.pendingDeposit = null;
    await saveDB(db);
    await bot.editMessageText(`Ditolak ${inv}`, { chat_id: chatId, message_id: msgId });
    try {
      await bot.sendMessage(pay.userId, `Ditolak ${inv} ditolak, hubungi owner.`);
    } catch (e) {}
    return;
  }

  if (data === 'user_contact_owner') {
    db.users[String(chatId)].awaitingSupport = true;
    await saveDB(db);
    return bot.editMessageText('Tulis keluhan kamu (max 500 karakter)\nKetik batal untuk batal.', {
      chat_id: chatId,
      message_id: msgId,
      reply_markup: { inline_keyboard: [[{ text: 'Batal', callback_data: 'cancel_action' }]] }
    });
  }

  if (data === 'cancel_action') {
    user.awaitingBroadcast = false;
    user.awaitingSupport = false;
    user.awaitingNumber = false;
    await saveDB(db);
    const m = isOwner(chatId) ? getOwnerMenu(chatId, db, user) : getUserMenu(chatId, db, user);
    return bot.editMessageText(m.text, {
      chat_id: chatId,
      message_id: msgId,
      reply_markup: m.opts.reply_markup
    });
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
