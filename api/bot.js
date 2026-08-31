const TelegramBot = require('node-telegram-bot-api');
const { loadDB, saveDB } = require('../lib/utils');
const { getTodayString, getWIB, genID, genInvoiceID, esc, getRank, extractEntries, UI, rankLine, isValidNumber } = require('../lib/utils');
const { sendToTarget } = require('../lib/client');
const config = require('../config');

function isOwner(id) {
  return config.OWNER_IDS.map(String).includes(String(id));
}

function getUser(db, id) {
  const k = String(id);
  if (!db.users[k]) {
    db.users[k] = {
      id,
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
      supportReplyTo: null
    };
  }
  // Reset daily if date changed
  if (!db.users[k].dailyFix || db.users[k].dailyFix.date !== getTodayString()) {
    db.users[k].dailyFix = { date: getTodayString(), count: 0 };
  }
  if (db.users[k].totalFix === undefined) db.users[k].totalFix = 0;
  return db.users[k];
}

function isPremium(user) {
  return user.premiumUntil && user.premiumUntil > Date.now();
}

function getPremiumLeft(user) {
  if (!isPremium(user)) return null;
  return Math.ceil((user.premiumUntil - Date.now()) / 86400000);
}

function canUseFix(db, user) {
  if (isOwner(user.id) || isPremium(user)) {
    return { allowed: true, remaining: 999, isPremium: true };
  }
  if (user.dailyFix.count >= 3) {
    return { allowed: false, remaining: 0, isPremium: false };
  }
  return { allowed: true, remaining: 3 - user.dailyFix.count, isPremium: false };
}

function incrementFixCount(db, user) {
  if (!user.dailyFix || user.dailyFix.date !== getTodayString()) {
    user.dailyFix = { date: getTodayString(), count: 0 };
  }
  user.dailyFix.count += 1;
  user.totalFix = (user.totalFix || 0) + 1;
  db.stats.totalFix = (db.stats.totalFix || 0) + 1;
  const k = String(user.id);
  if (!db.history[k]) db.history[k] = [];
  db.history[k].unshift({ date: new Date().toISOString(), count: 1 });
  if (db.history[k].length > 100) db.history[k] = db.history[k].slice(0, 100);
}

async function checkJoin(bot, uid) {
  if (isOwner(uid)) return { joined: true, notJoined: [] };
  let notJoined = [];
  for (let ch of config.FORCE_JOIN) {
    try {
      const m = await bot.getChatMember(ch.id, uid);
      if (!['member', 'administrator', 'creator'].includes(m.status)) notJoined.push(ch);
    } catch (e) {
      notJoined.push(ch);
    }
  }
  return { joined: notJoined.length === 0, notJoined };
}

// ==================== UI - Inline Button Only ====================
function getDashboardMenu(chatId, db, user) {
  const rnk = getRank(user.referralCount || 0);
  const BRAND = { NAME: '𝗙𝗜𝗫𝗥𝗘𝗗 𝗪𝗔𝗟𝗭𝗬' };

  if (isOwner(chatId)) {
    return {
      text: `${UI.header('𝗢𝗪𝗡𝗘𝗥 𝗖𝗢𝗡𝗧𝗥𝗢𝗟 𝗣𝗔𝗡𝗘𝗟', '👑')}\n🛡️ <b>Sistem Utama Beroperasi Optimal (Vercel).</b>\n\n<blockquote>👥 <b>Total User</b>  : <code>${Object.keys(db.users).length}</code>\n💎 <b>Premium</b>     : <code>${Object.values(db.users).filter(u => isPremium(u)).length}</code>\n🔧 <b>Total Fix</b>  : <code>${db.stats.totalFix || 0}</code>\n✅ <b>Success</b>    : <code>${db.stats.totalSuccess || 0}</code>\n💰 <b>Revenue</b>    : <code>Rp ${(db.stats.revenue || 0).toLocaleString()}</code></blockquote>${UI.footer()}`,
      opts: {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🌐 CONTROL PANEL (WEBAPP)', web_app: { url: `${process.env.PUBLIC_URL || ''}/webapp` } }],
            [{ text: '👥 DATABASE', callback_data: 'menu_database' }, { text: '🏆 KLASEMEN', callback_data: 'ref_leaderboard' }],
            [{ text: '📢 BROADCAST', callback_data: 'menu_broadcast' }, { text: '📊 STATISTIK', callback_data: 'menu_stats' }]
          ]
        }
      }
    };
  }

  if (isPremium(user)) {
    return {
      text: `${UI.header('𝗩𝗜𝗣 𝗟𝗢𝗨𝗡𝗚𝗘 𝗔𝗥𝗘𝗔', '💎')}\n👋 Selamat datang, <b>${esc(user.first_name)}</b>!\n\n<blockquote>🆔 <b>ID Anda</b>   : <code>${chatId}</code>\n⚜️ <b>Status</b>    : 👑 VIP (${getPremiumLeft(user)} Hari)\n🏆 <b>Pangkat</b>   : ${rnk.icon} ${rnk.name}\n👥 <b>Referral</b>  : ${user.referralCount || 0} Pengguna\n🔧 <b>Total Fix</b> : ${user.totalFix || 0}</blockquote>\n\n💡 <i>Gunakan menu navigasi untuk mengontrol sistem.</i>${UI.footer()}`,
      opts: {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔧 Fix Merah', callback_data: 'menu_fix' }, { text: '📊 Statistik', callback_data: 'menu_stats' }],
            [{ text: '🌐 Mini App', web_app: { url: `${process.env.PUBLIC_URL || ''}/webapp` } }, { text: '🎧 Support', callback_data: 'user_contact_owner' }]
          ]
        }
      }
    };
  }

  return {
    text: `${UI.header('𝗖𝗘𝗡𝗧𝗥𝗔𝗟 𝗗𝗔𝗦𝗛𝗕𝗢𝗔𝗥𝗗', '🌱')}\n👋 Halo, <b>${esc(user.first_name)}</b>!\n\n<blockquote>🆔 <b>ID Anda</b>   : <code>${chatId}</code>\n⚜️ <b>Status</b>    : 🎫 FREE (${canUseFix(db, user).remaining}/3 Limit)\n🏆 <b>Pangkat</b>   : ${rnk.icon} ${rnk.name}\n👥 <b>Referral</b>  : ${user.referralCount || 0} Pengguna\n🔧 <b>Total Fix</b> : ${user.totalFix || 0}</blockquote>\n\n💡 <i>Kirim /redeem [kode] jika memiliki voucher.</i>${UI.footer()}`,
    opts: {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔧 Fix Merah', callback_data: 'menu_fix' }, { text: '💎 VIP/VVIP', callback_data: 'menu_premium' }],
          [{ text: '🎁 Referral', callback_data: 'menu_referral' }, { text: '📊 Statistik', callback_data: 'menu_stats' }],
          [{ text: '🌐 Mini App', web_app: { url: `${process.env.PUBLIC_URL || ''}/webapp` } }, { text: '🎧 Support', callback_data: 'user_contact_owner' }]
        ]
      }
    }
  };
}

// ==================== Message Handler ====================
async function handleMessage(bot, db, msg) {
  const chatId = msg.chat.id;
  const text = msg.text ? msg.text.trim() : '';
  const user = getUser(db, chatId);
  user.first_name = msg.from.first_name || 'Boss';
  user.username = msg.from.username || '';

  // Handle photo bukti transfer untuk deposit manual
  if (msg.photo && db.users[String(chatId)]?.pendingDeposit) {
    const inv = db.users[String(chatId)].pendingDeposit;
    const pay = db.payments[inv];
    if (pay && pay.status === 'waiting_proof') {
      const fileId = msg.photo[msg.photo.length - 1].file_id;
      pay.proofFileId = fileId;
      pay.status = 'waiting_approval';
      db.users[String(chatId)].pendingDeposit = null;
      await saveDB(db);

      await bot.sendMessage(chatId, `${UI.header('𝗕𝗨𝗞𝗧𝗜 𝗗𝗜𝗧𝗘𝗥𝗜𝗠𝗔', '✅')}\nBukti transfer untuk <code>${inv}</code> berhasil diterima.\n\n⏳ <i>Menunggu konfirmasi admin max 1x24 jam.</i>${UI.footer()}`, { parse_mode: 'HTML' });

      for (let oid of config.OWNER_IDS) {
        try {
          await bot.sendPhoto(oid, fileId, {
            caption: `📩 <b>DEPOSIT MANUAL BARU</b>\n━━━━━━━━━━━━━━\n🧾 Invoice: <code>${inv}</code>\n👤 User: <code>${chatId}</code> @${msg.from.username || '-'}\n💎 Paket: ${pay.days} Hari - Rp ${pay.amount.toLocaleString()}\n🏦 Tujuan: ${config.DANA_NAME} ${config.DANA_NUMBER}`,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[{ text: '✅ APPROVE', callback_data: `approve_${inv}` }, { text: '❌ REJECT', callback_data: `reject_${inv}` }]]
            }
          });
        } catch (e) {}
      }
      return;
    }
  }

  // Owner membalas tiket support (reply ke pesan forward)
  if (isOwner(chatId) && msg.reply_to_message && text) {
    const targetUid = db.supportMap && db.supportMap[String(msg.reply_to_message.message_id)];
    if (targetUid) {
      try {
        await bot.sendMessage(targetUid, `${UI.header('𝗕𝗔𝗟𝗔𝗦𝗔𝗡 𝗔𝗗𝗠𝗜𝗡', '🎧')}\n${esc(text)}${UI.footer()}`, { parse_mode: 'HTML' });
        await bot.sendMessage(chatId, `✅ Balasan terkirim ke user ${targetUid}`);
      } catch (e) {
        await bot.sendMessage(chatId, `❌ Gagal kirim balasan: ${e.message}`);
      }
      return;
    }
  }

  // State: awaiting support message
  if (!isOwner(chatId) && db.users[String(chatId)]?.awaitingSupport && text) {
    db.users[String(chatId)].awaitingSupport = false;
    await saveDB(db);
    await bot.sendMessage(chatId, `${UI.header('𝗧𝗜𝗞𝗘𝗧 𝗧𝗘𝗥𝗞𝗜𝗥𝗜𝗠', '✅')}\nKeluhan Anda telah diteruskan ke admin. Mohon tunggu balasan.${UI.footer()}`, { parse_mode: 'HTML' });
    if (!db.supportMap) db.supportMap = {};
    for (let oid of config.OWNER_IDS) {
      try {
        const sent = await bot.sendMessage(oid, `${UI.header('𝗧𝗜𝗞𝗘𝗧 𝗦𝗨𝗣𝗣𝗢𝗥𝗧 𝗕𝗔𝗥𝗨', '🎧')}\n👤 User: <code>${chatId}</code> @${msg.from.username || '-'}\n\n<blockquote>${esc(text)}</blockquote>\n\n💡 <i>Balas pesan ini untuk membalas user.</i>${UI.footer()}`, { parse_mode: 'HTML' });
        db.supportMap[String(sent.message_id)] = String(chatId);
      } catch (e) {}
    }
    await saveDB(db);
    return;
  }

  if (!text) return;

  // Owner commands
  if (text.startsWith('/gen ')) {
    if (!isOwner(chatId)) return;
    const parts = text.split(' ');
    const code = parts[1].toUpperCase();
    const days = parseInt(parts[2]);
    db.codes[code] = days;
    await saveDB(db);
    return bot.sendMessage(chatId, `${UI.header('𝗩𝗢𝗨𝗖𝗛𝗘𝗥 𝗗𝗜𝗕𝗨𝗔𝗧', '✅')}\nKode: <code>${code}</code>\nDurasi: ${days} Hari${UI.footer()}`, { parse_mode: 'HTML' });
  }

  if (text.startsWith('/redeem ')) {
    const code = text.split(' ')[1].toUpperCase();
    if (db.codes[code]) {
      const days = db.codes[code];
      user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + days * 86400000;
      user.notifiedExp = false;
      delete db.codes[code];
      await saveDB(db);
      return bot.sendMessage(chatId, `${UI.header('𝗥𝗘𝗗𝗘𝗘𝗠 𝗕𝗘𝗥𝗛𝗔𝗦𝗜𝗟', '🎉')}\nSelamat! VIP ${days} Hari aktif.${UI.footer()}`, { parse_mode: 'HTML' });
    } else {
      return bot.sendMessage(chatId, `${UI.header('𝗚𝗔𝗚𝗔𝗟', '❌')}\nKode tidak valid${UI.footer()}`, { parse_mode: 'HTML' });
    }
  }

  if (text.startsWith('/approve ')) {
    if (!isOwner(chatId)) return;
    const inv = text.split(' ')[1].trim();
    const pay = db.payments[inv];
    if (!pay) return bot.sendMessage(chatId, `Invoice ${inv} tidak ditemukan`);
    pay.status = 'paid';
    const u = getUser(db, pay.userId);
    u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + pay.days * 86400000;
    u.notifiedExp = false;
    db.stats.revenue = (db.stats.revenue || 0) + pay.amount;
    await saveDB(db);
    await bot.sendMessage(chatId, `✅ ${inv} approved untuk ${pay.userId}`);
    try {
      await bot.sendMessage(pay.userId, `${UI.header('𝗣𝗘𝗠𝗕𝗔𝗬𝗔𝗥𝗔𝗡 𝗗𝗜𝗦𝗘𝗧𝗨𝗝𝗨𝗜', '✅')}\n🎉 Deposit <code>${inv}</code> disetujui!\n\n<blockquote>💎 Paket: ${pay.days} Hari VIP\n💰 Nominal: Rp ${pay.amount.toLocaleString()}\n⏳ Aktif sampai: ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}</blockquote>${UI.footer()}`, { parse_mode: 'HTML' });
    } catch {}
    return;
  }

  if (text.startsWith('/reject ')) {
    if (!isOwner(chatId)) return;
    const inv = text.split(' ')[1].trim();
    const pay = db.payments[inv];
    if (!pay) return;
    pay.status = 'rejected';
    await saveDB(db);
    await bot.sendMessage(chatId, `❌ ${inv} rejected`);
    try { await bot.sendMessage(pay.userId, `${UI.header('𝗗𝗜𝗧𝗢𝗟𝗔𝗞', '❌')}\nDeposit ${inv} ditolak. Hubungi admin.${UI.footer()}`, { parse_mode: 'HTML' }); } catch {}
    return;
  }

  if (text.startsWith('/paydone ')) {
    if (!isOwner(chatId)) return;
    const inv = text.split(' ')[1].trim();
    const pay = db.payments[inv];
    if (!pay) return bot.sendMessage(chatId, `Invoice ${inv} tidak ditemukan`);
    if (pay.status === 'paid') return bot.sendMessage(chatId, `Sudah lunas`);
    pay.status = 'paid';
    const u = getUser(db, pay.userId);
    u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + pay.days * 86400000;
    db.stats.revenue = (db.stats.revenue || 0) + pay.amount;
    await saveDB(db);
    await bot.sendMessage(chatId, `✅ ${inv} set LUNAS`);
    try {
      await bot.sendMessage(pay.userId, `${UI.header('𝗣𝗘𝗠𝗕𝗔𝗬𝗔𝗥𝗔𝗡 𝗕𝗘𝗥𝗛𝗔𝗦𝗜𝗟', '✅')}\n🎉 Pembayaran <code>${inv}</code> berhasil!${UI.footer()}`, { parse_mode: 'HTML' });
    } catch {}
    return;
  }

  // Start
  if (text.startsWith('/start')) {
    const p = text.split(' ')[1] ? text.split(' ')[1].trim() : '';
    if (p && !isNaN(p) && String(p) !== String(chatId) && !user.referredBy && db.users[p] && !isOwner(chatId)) {
      user.referredBy = String(p);
      db.users[p].referralCount = (db.users[p].referralCount || 0) + 1;
      if (!db.users[p].referrals.includes(chatId)) db.users[p].referrals.push(chatId);
    }
    await saveDB(db);
    const jc = await checkJoin(bot, chatId);
    if (!jc.joined) {
      const txt = `${UI.header('𝗔𝗞𝗦𝗘𝗦 𝗧𝗘𝗥𝗞𝗨𝗡𝗖𝗜', '🔒')}\nBergabunglah ke saluran resmi kami untuk mengakses bot:\n\n${jc.notJoined.map(c => `• ${c.id}`).join('\n')}\n\n📌 <i>Lakukan verifikasi setelah Anda bergabung.</i>${UI.footer()}`;
      const btns = jc.notJoined.map(c => [{ text: `✨ JOIN ${c.name}`, url: c.link }]);
      btns.push([{ text: '✅ VERIFIKASI', callback_data: 'verify_join' }]);
      return bot.sendMessage(chatId, txt, { parse_mode: 'HTML', reply_markup: { inline_keyboard: btns } });
    }
    const menu = getDashboardMenu(chatId, db, user);
    return bot.sendMessage(chatId, menu.text, { parse_mode: 'HTML', disable_web_page_preview: true, ...menu.opts });
  }

  // State: awaiting number - filter regex ketat, tolak command/teks bebas
  if (db.users[String(chatId)]?.awaitingNumber) {
    if (text.startsWith('/')) {
      db.users[String(chatId)].awaitingNumber = false;
      await saveDB(db);
    } else {
      const rawLines = text.split('\n').map(x => x.trim()).filter(Boolean);
      let lines = rawLines.filter(x => isValidNumber(x.replace(/[^0-9+]/g, '')) ).map(x => x.replace(/[^0-9+]/g, ''));
      if (lines.length === 0) {
        return bot.sendMessage(chatId, `${UI.header('𝗙𝗢𝗥𝗠𝗔𝗧 𝗦𝗔𝗟𝗔𝗛', '❌')}\nHarap masukkan angka valid (8-15 digit).\n\n<blockquote>📝 Contoh: <code>628123456789</code></blockquote>${UI.footer()}`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '❌ Batalkan', callback_data: 'cancel_action' }]] } });
      }
      if (lines.length > 1 && !isPremium(user) && !isOwner(chatId)) {
        return bot.sendMessage(chatId, `${UI.header('𝗔𝗞𝗦𝗘𝗦 𝗗𝗜𝗧𝗢𝗟𝗔𝗞', '⚠️')}\nFitur Multi-Line eksklusif untuk VIP.${UI.footer()}`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '💎 UPGRADE VIP', callback_data: 'menu_premium' }, { text: '❌ Batalkan', callback_data: 'cancel_action' }]] } });
      }
      if (lines.length > 5) lines = lines.slice(0, 5);
      const batchId = genID();
      const procText = lines.map(l => `📱 <code>${l}</code>`).join('\n');
      incrementFixCount(db, user);
      const pendingId = `${Date.now()}_${chatId}`;
      if (!db.pending) db.pending = {};
      db.pending[pendingId] = { chatId, batchId, originalNumbers: lines, timestamp: Date.now(), handled: false };
      db.users[String(chatId)].awaitingNumber = false;
      await saveDB(db);
      await bot.sendMessage(chatId, `${UI.header('𝗠𝗘𝗠𝗣𝗥𝗢𝗦𝗘𝗦 𝗗𝗔𝗧𝗔', '⚡')}\n🔄 <b>Menyinkronkan ke jaringan...</b>\n\n<blockquote>${procText}\n🔖 <b>Batch ID</b>: <code>${batchId}</code>\n🎯 <b>Target</b>: ${config.TARGET_BOT}</blockquote>${UI.footer()}`, { parse_mode: 'HTML' });
      const res = await sendToTarget(text);
      if (!res.ok) {
        await bot.sendMessage(chatId, `${UI.header('𝗘𝗥𝗥𝗢𝗥 𝗦𝗜𝗦𝗧𝗘𝗠', '⚠️')}\nGagal kirim: ${res.error}${UI.footer()}`, { parse_mode: 'HTML' });
      }
      return;
    }
  }

  // State: broadcast
  if (db.users[String(chatId)]?.awaitingBroadcast && isOwner(chatId)) {
    if (text.startsWith('/')) {
      db.users[String(chatId)].awaitingBroadcast = false;
      await saveDB(db);
      return;
    }
    const uids = Object.keys(db.users);
    let s = 0, f = 0;
    await bot.sendMessage(chatId, `${UI.header('𝗠𝗘𝗡𝗚𝗜𝗥𝗜𝗠...', '⏳')}\nBroadcast ke ${uids.length} user...${UI.footer()}`, { parse_mode: 'HTML' });
    for (let uid of uids) {
      try { await bot.sendMessage(uid, `📢 <b>BROADCAST</b>\n\n${text}${UI.footer()}`, { parse_mode: 'HTML' }); s++; } catch { f++; }
      await new Promise(r => setTimeout(r, 100));
    }
    db.users[String(chatId)].awaitingBroadcast = false;
    await saveDB(db);
    return bot.sendMessage(chatId, `${UI.header('𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧 𝗦𝗘𝗟𝗘𝗦𝗔𝗜', '✅')}\n✅ Sukses: ${s}\n❌ Gagal: ${f}${UI.footer()}`, { parse_mode: 'HTML' });
  }
}

// ==================== Callback Handler ====================
async function handleCallback(bot, db, query) {
  const chatId = query.message.chat.id;
  const msgId = query.message.message_id;
  const data = query.data;
  const user = getUser(db, chatId);

  if (data === 'verify_join') {
    const jc = await checkJoin(bot, chatId);
    if (jc.joined) {
      const menu = getDashboardMenu(chatId, db, user);
      return bot.editMessageText(menu.text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', ...menu.opts });
    }
  }

  if (data === 'cancel_action' || data === 'menu_main') {
    db.users[String(chatId)].awaitingNumber = false;
    db.users[String(chatId)].awaitingBroadcast = false;
    db.users[String(chatId)].awaitingSupport = false;
    await saveDB(db);
    const menu = getDashboardMenu(chatId, db, user);
    return bot.editMessageText(menu.text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', ...menu.opts });
  }

  if (data === 'menu_fix') {
    const c = canUseFix(db, user);
    if (!c.allowed) return bot.editMessageText(`${UI.header('𝗟𝗜𝗠𝗜𝗧 𝗛𝗔𝗕𝗜𝗦', '🚫')}\nLimit habis${UI.footer()}`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '💎 UPGRADE VIP', callback_data: 'menu_premium' }], [{ text: '◁ Kembali', callback_data: 'menu_main' }]] } });
    db.users[String(chatId)].awaitingNumber = true;
    await saveDB(db);
    return bot.editMessageText(`${UI.header('𝗙𝗜𝗫 𝗠𝗘𝗥𝗔𝗛 𝗘𝗫𝗘𝗖𝗨𝗧𝗢𝗥', '⚙️')}\nSilakan kirim nomor target.\n\n<blockquote>📊 Status: ${c.isPremium ? 'VIP' : c.remaining + ' kuota'}\n📝 Format: <code>628xxxxxxxxxx</code></blockquote>${UI.footer()}`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '◁ Kembali', callback_data: 'menu_main' }]] } });
  }

  if (data === 'menu_premium') {
    return bot.editMessageText(`${UI.header('𝗩𝗜𝗣 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗣𝗔𝗦𝗦', '💎')}\nKeunggulan VIP:\n<blockquote>⚡ Multi-Line 5 nomor\n🚀 Prioritas\n🛡️ Success tinggi</blockquote>\n\n💳 Harga MANUAL:\n• 1 Hari 2k\n• 5 Hari 5k\n• 10 Hari 10k\n• 30 Hari 60k\n\n🏦 ${config.DANA_NAME} ${config.DANA_NUMBER}${UI.footer()}`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '💎 1 Hari - 2k', callback_data: 'buy_1' }, { text: '💎 5 Hari - 5k', callback_data: 'buy_5' }], [{ text: '💎 10 Hari - 10k', callback_data: 'buy_10' }, { text: '💎 30 Hari - 60k', callback_data: 'buy_30' }], [{ text: '◁ Kembali', callback_data: 'menu_main' }]] } });
  }

  if (data === 'menu_referral') {
    const rnk = getRank(user.referralCount || 0);
    return bot.editMessageText(`${UI.header('𝗥𝗘𝗙𝗘𝗥𝗥𝗔𝗟 𝗣𝗥𝗢𝗚𝗥𝗔𝗠', '🤝')}\nTotal: ${user.referralCount || 0}\nRank: ${rnk.icon} ${rnk.name}\nLink: https://t.me/${config.BOT_USERNAME}?start=${chatId}${UI.footer()}`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🏆 Klasemen', callback_data: 'ref_leaderboard' }], [{ text: '◁ Kembali', callback_data: 'menu_main' }]] } });
  }

  if (data === 'ref_leaderboard') {
    const sort = Object.values(db.users).sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0)).slice(0, 10);
    let t = `${UI.header('𝗧𝗢𝗣 𝟭𝟬 𝗔𝗙𝗜𝗟𝗜𝗔𝗧𝗢𝗥', '🏆')}\n`;
    sort.forEach((u, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
      t += `${rankLine(medal, u.first_name, u.referralCount)}\n`;
    });
    t += `${UI.footer()}`;
    return bot.editMessageText(t, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '◁ Kembali', callback_data: 'menu_main' }]] } });
  }

  if (data.startsWith('buy_')) {
    const days = parseInt(data.split('_')[1]);
    const amountMap = { 1: 2000, 5: 5000, 10: 10000, 30: 60000 };
    const amount = amountMap[days] || 2000;
    const inv = genInvoiceID();
    db.payments[inv] = { userId: chatId, days, amount, status: 'waiting_payment', createdAt: Date.now() };
    await saveDB(db);
    return bot.editMessageText(`${UI.header('𝗜𝗡𝗩𝗢𝗜𝗖𝗘 𝗠𝗔𝗡𝗨𝗔𝗟', '💳')}\n<blockquote>🧾 ID: <code>${inv}</code>\n💎 Paket: ${days} Hari VIP\n💰 Total: Rp ${amount.toLocaleString()}\n🏦 Transfer ke: ${config.DANA_NAME}\n📱 ${config.DANA_NUMBER}</blockquote>\n\nSilakan transfer lalu klik Sudah Transfer dan kirim bukti foto.${UI.footer()}`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '✅ Sudah Transfer', callback_data: `confirm_${inv}` }], [{ text: '◁ Kembali', callback_data: 'menu_premium' }]] } });
  }

  if (data.startsWith('confirm_')) {
    const inv = data.split('confirm_')[1];
    const pay = db.payments[inv];
    if (!pay) return;
    pay.status = 'waiting_proof';
    db.users[String(chatId)].pendingDeposit = inv;
    await saveDB(db);
    return bot.editMessageText(`${UI.header('𝗞𝗢𝗡𝗙𝗜𝗥𝗠𝗔𝗦𝗜', '📤')}\nInvoice <code>${inv}</code> - Silakan kirim foto bukti transfer sekarang (kirim sebagai foto).${UI.footer()}`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML' });
  }

  if (data.startsWith('approve_')) {
    if (!isOwner(chatId)) return;
    const inv = data.split('approve_')[1];
    const pay = db.payments[inv];
    if (!pay) return;
    pay.status = 'paid';
    const u = getUser(db, pay.userId);
    u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + pay.days * 86400000;
    db.stats.revenue = (db.stats.revenue || 0) + pay.amount;
    await saveDB(db);
    await bot.editMessageText(`✅ ${inv} APPROVED untuk ${pay.userId}`, { chat_id: chatId, message_id: msgId });
    try { await bot.sendMessage(pay.userId, `${UI.header('𝗣𝗘𝗠𝗕𝗔𝗬𝗔𝗥𝗔𝗡 𝗗𝗜𝗦𝗘𝗧𝗨𝗝𝗨𝗜', '✅')}\n🎉 Deposit <code>${inv}</code> disetujui! VIP ${pay.days} hari aktif sampai ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}${UI.footer()}`, { parse_mode: 'HTML' }); } catch {}
    return;
  }

  if (data.startsWith('reject_')) {
    if (!isOwner(chatId)) return;
    const inv = data.split('reject_')[1];
    const pay = db.payments[inv];
    if (!pay) return;
    pay.status = 'rejected';
    await saveDB(db);
    await bot.editMessageText(`❌ ${inv} REJECTED`, { chat_id: chatId, message_id: msgId });
    try { await bot.sendMessage(pay.userId, `${UI.header('𝗗𝗜𝗧𝗢𝗟𝗔𝗞', '❌')}\nDeposit ${inv} ditolak. Hubungi admin.${UI.footer()}`, { parse_mode: 'HTML' }); } catch {}
    return;
  }

  if (data === 'menu_stats') {
    return bot.editMessageText(`${UI.header('𝗦𝗧𝗔𝗧𝗜𝗦𝗧𝗜𝗞', '📊')}\n<blockquote>🔧 Kamu: ${user.totalFix || 0}\n🌍 Global: ${db.stats.totalFix || 0}\n✅ Success: ${db.stats.totalSuccess || 0}\n❌ Failed: ${db.stats.totalFailed || 0}\n👥 User: ${Object.keys(db.users).length}\n💰 Revenue: Rp ${(db.stats.revenue || 0).toLocaleString()}</blockquote>${UI.footer()}`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🌐 Dashboard', url: `${process.env.PUBLIC_URL || ''}/admin` }], [{ text: '◁ Kembali', callback_data: 'menu_main' }]] } });
  }

  if (data === 'menu_database' && isOwner(chatId)) {
    let t = `${UI.header('𝟭𝟬 𝗨𝗦𝗘𝗥 𝗧𝗘𝗥𝗔𝗞𝗛𝗜𝗥', '👥')}\n`;
    Object.values(db.users).slice(-10).reverse().forEach(u => {
      const icn = isPremium(u) ? '💎' : '🎫';
      const nm = esc((u.first_name || 'User').substring(0, 15));
      t += `${icn} <code>${u.id}</code> | ${nm} | ${u.dailyFix?.count || 0}/3 | Fix:${u.totalFix || 0}\n`;
    });
    t += `\n📊 Global Fix: ${db.stats.totalFix || 0} | Revenue: ${db.stats.revenue || 0}${UI.footer()}`;
    return bot.editMessageText(t, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '◁ Kembali', callback_data: 'menu_main' }]] } });
  }

  if (data === 'menu_broadcast' && isOwner(chatId)) {
    db.users[String(chatId)].awaitingBroadcast = true;
    await saveDB(db);
    return bot.editMessageText(`${UI.header('𝗠𝗔𝗦𝗦 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧', '📢')}\nKirimkan teks untuk disebarkan ke seluruh database.${UI.footer()}`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '❌ Batalkan', callback_data: 'cancel_action' }]] } });
  }

  if (data === 'user_contact_owner') {
    db.users[String(chatId)].awaitingSupport = true;
    await saveDB(db);
    return bot.editMessageText(`${UI.header('𝗛𝗨𝗕𝗨𝗡𝗚𝗜 𝗔𝗗𝗠𝗜𝗡', '🎧')}\nSilakan ketik keluhan atau pertanyaan Anda. Pesan akan diteruskan langsung ke admin.${UI.footer()}`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '❌ Batalkan', callback_data: 'cancel_action' }]] } });
  }
}

// Main handler for Vercel
module.exports = async (req, res) => {
  const bot = new (require('node-telegram-bot-api'))(require('../config').BOT_TOKEN);
  try {
    const { loadDB, saveDB } = require('../lib/utils');
    const db = await loadDB();
    if (req.method === 'POST') {
      const update = req.body;
      if (update.message) await handleMessage(bot, db, update.message);
      if (update.callback_query) {
        await handleCallback(bot, db, update.callback_query);
        try { await bot.answerCallbackQuery(update.callback_query.id); } catch {}
      }
      await saveDB(db);
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(200).json({ ok: false, error: e.message });
  }
};
