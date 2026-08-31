const TelegramBot = require('node-telegram-bot-api');
const { loadDB, saveDB, getTodayString, getWIB, genID, esc, getRank, UI } = require('../lib/utils');
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
      awaitingNumber: false,
      awaitingSupport: false,
      awaitingBroadcast: false
    };
  }
  if (!db.users[k].dailyFix || db.users[k].dailyFix.date !== getTodayString()) {
    db.users[k].dailyFix = { date: getTodayString(), count: 0 };
  }
  return db.users[k];
}

function isPremium(user) {
  return user.premiumUntil && user.premiumUntil > Date.now();
}

function canUseFix(db, user) {
  if (isOwner(user.id) || isPremium(user)) return { allowed: true, remaining: 999, isPremium: true };
  if (user.dailyFix.count >= 3) return { allowed: false, remaining: 0, isPremium: false };
  return { allowed: true, remaining: 3 - user.dailyFix.count, isPremium: false };
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

function getDashboardMenu(chatId, db, user) {
  const rnk = getRank(user.referralCount || 0);
  const isVip = isPremium(user);
  const status = isVip ? `VIP Premium (${Math.ceil((user.premiumUntil - Date.now()) / 86400000)} Hari)` : `Free Basic (${canUseFix(db, user).remaining}/3)`;
  
  let kb = [
    [{ text: '🔧 Fix Merah', callback_data: 'menu_fix' }, { text: '💎 VIP & Spin', callback_data: 'menu_premium' }],
    [{ text: '📊 Statistik', callback_data: 'menu_stats' }, { text: '🎁 Referral', callback_data: 'menu_referral' }],
    [{ text: '🌐 Buka Mini App', web_app: { url: `${config.PUBLIC_URL}/webapp` } }],
    [{ text: '🎧 Support Admin', callback_data: 'user_contact_owner' }]
  ];

  if (isOwner(chatId)) {
    kb = [
      [{ text: '🔧 Deploy Fix', callback_data: 'menu_fix' }, { text: '📢 Broadcast', callback_data: 'owner_broadcast' }],
      [{ text: '📊 Dashboard Admin (Web)', web_app: { url: `${config.PUBLIC_URL}/admin` } }],
      [{ text: '🌐 Buka Mini App User', web_app: { url: `${config.PUBLIC_URL}/webapp` } }]
    ];
  }

  const text = `${UI.header(isOwner(chatId) ? '𝗔𝗗𝗠𝗜𝗡 𝗣𝗔𝗡𝗘𝗟' : '𝗠𝗔𝗜𝗡 𝗗𝗔𝗦𝗛𝗕𝗢𝗔𝗥𝗗', isOwner(chatId) ? '👨‍💻' : '🖥')}
👋 Halo, <b>${esc(user.first_name)}</b>!

<b>[ 👤 INFORMASI AKUN ]</b>
├ <b>ID Akses</b> : <code>${chatId}</code>
├ <b>Status</b>   : <b>${status}</b>
├ <b>Pangkat</b>  : ${rnk.icon} ${rnk.name}
├ <b>Referral</b> : <code>${user.referralCount || 0}</code> Pengguna
└ <b>Fix Line</b> : <code>${user.totalFix || 0}</code> Eksekusi

💡 <i>Pilih menu interaktif di bawah ini untuk memulai.</i>${UI.footer()}`;

  return {
    text: text,
    opts: { reply_markup: { inline_keyboard: kb } }
  };
}

async function handleMessage(bot, db, msg) {
  const chatId = msg.chat.id;
  const text = msg.text ? msg.text.trim() : '';
  const user = getUser(db, chatId);
  user.first_name = msg.from.first_name || 'Boss';
  user.username = msg.from.username || '';

  if (isOwner(chatId) && msg.reply_to_message && msg.reply_to_message.text && msg.reply_to_message.text.includes('SUPPORT TIKET')) {
    const match = msg.reply_to_message.text.match(/User:\s*(\d+)/);
    if (match && match[1]) {
      try {
        await bot.sendMessage(match[1], `${UI.header('𝗕𝗔𝗟𝗔𝗦𝗔𝗡 𝗔𝗗𝗠𝗜𝗡', '🎧')}\n${esc(text)}${UI.footer()}`, { parse_mode: 'HTML' });
        return bot.sendMessage(chatId, '✅ Balasan berhasil dikirim ke user.');
      } catch (e) {
        return bot.sendMessage(chatId, '❌ Gagal mengirim balasan: ' + e.message);
      }
    }
  }

  if (!text) return;

  if (user.awaitingSupport) {
    user.awaitingSupport = false;
    await saveDB(db);
    for (let oid of config.OWNER_IDS) {
      try {
        await bot.sendMessage(oid, `📩 <b>SUPPORT TIKET</b>\n👤 User: <code>${chatId}</code> @${user.username}\n\nIsi pesan:\n${esc(text)}`, { parse_mode: 'HTML' });
      } catch (e) {}
    }
    return bot.sendMessage(chatId, `${UI.header('𝗣𝗘𝗦𝗔𝗡 𝗧𝗘𝗥𝗞𝗜𝗥𝗜𝗠', '✅')}\nKeluhan Anda telah diteruskan ke tim admin. Harap tunggu balasan dari kami.`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '◁ Kembali ke Menu', callback_data: 'menu_main' }]] } });
  }

  if (user.awaitingNumber) {
    let lines = text.split('\n').map(x => x.replace(/[^0-9+]/g, '')).filter(x => x.length >= 8);
    if (lines.length === 0) {
      return bot.sendMessage(chatId, `${UI.header('𝗙𝗢𝗥𝗠𝗔𝗧 𝗦𝗔𝗟𝗔𝗛', '❌')}\nHarap masukkan angka yang valid (contoh: 628xxx).`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '❌ Batalkan', callback_data: 'cancel_action' }]] } });
    }
    if (lines.length > 1 && !isPremium(user) && !isOwner(chatId)) {
      return bot.sendMessage(chatId, `${UI.header('𝗔𝗞𝗦𝗘𝗦 𝗗𝗜𝗧𝗢𝗟𝗔𝗞', '⚠️')}\nFitur Multi-Line eksklusif untuk VIP. Silakan upgrade via WebApp.`, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '❌ Batalkan', callback_data: 'cancel_action' }]] } });
    }
    if (lines.length > 5) lines = lines.slice(0, 5);
    
    const batchId = genID();
    const procText = lines.map(l => `📱 <code>${l}</code>`).join('\n');
    user.dailyFix.count += 1;
    user.totalFix = (user.totalFix || 0) + 1;
    db.stats.totalFix = (db.stats.totalFix || 0) + 1;
    
    const pendingId = `${Date.now()}_${chatId}`;
    db.pending[pendingId] = { chatId, batchId, originalNumbers: lines, timestamp: Date.now(), handled: false };
    user.awaitingNumber = false;
    await saveDB(db);
    
    await bot.sendMessage(chatId, `${UI.header('𝗠𝗘𝗠𝗣𝗥𝗢𝗦𝗘𝗦 𝗗𝗔𝗧𝗔', '⚡')}\n<b>Menyinkronkan ke jaringan...</b>\n\n<b>[ 📝 TASK INFO ]</b>\n├ <b>Target</b> : ${lines.length} Nomor\n└ <b>Batch ID</b> : <code>${batchId}</code>\n\n${procText}${UI.footer()}`, { parse_mode: 'HTML' });
    const res = await sendToTarget(text);
    if (!res.ok) await bot.sendMessage(chatId, `${UI.header('𝗘𝗥𝗥𝗢𝗥 𝗦𝗜𝗦𝗧𝗘𝗠', '⚠️')}\nGagal mengirim ke server target: ${res.error}`, { parse_mode: 'HTML' });
    return;
  }

  if (db.users[String(chatId)]?.awaitingBroadcast && isOwner(chatId)) {
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

  if (text.startsWith('/start')) {
    user.awaitingNumber = false;
    user.awaitingSupport = false;
    if(user.awaitingBroadcast) user.awaitingBroadcast = false;
    
    const p = text.split(' ')[1] ? text.split(' ')[1].trim() : '';
    if (p && !isNaN(p) && String(p) !== String(chatId) && !user.referredBy && db.users[p] && !isOwner(chatId)) {
      user.referredBy = String(p);
      db.users[p].referralCount = (db.users[p].referralCount || 0) + 1;
      if (!db.users[p].referrals.includes(chatId)) db.users[p].referrals.push(chatId);
    }
    await saveDB(db);
    
    const jc = await checkJoin(bot, chatId);
    if (!jc.joined) {
      const txt = `${UI.header('𝗔𝗞𝗦𝗘𝗦 𝗧𝗘𝗥𝗞𝗨𝗡𝗖𝗜', '🔒')}\nBergabunglah ke saluran resmi kami untuk mengakses sistem:\n\n${jc.notJoined.map(c => `• ${c.id}`).join('\n')}\n\n📌 <i>Lakukan verifikasi setelah bergabung.</i>`;
      const btns = jc.notJoined.map(c => [{ text: `✨ JOIN ${c.name}`, url: c.link }]);
      btns.push([{ text: '✅ VERIFIKASI', callback_data: 'verify_join' }]);
      return bot.sendMessage(chatId, txt, { parse_mode: 'HTML', reply_markup: { inline_keyboard: btns, remove_keyboard: true } });
    }
    
    const menu = getDashboardMenu(chatId, db, user);
    await bot.sendMessage(chatId, "🔄 <i>Mengautentikasi antarmuka...</i>", { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } }).then(m => bot.deleteMessage(chatId, m.message_id)).catch(()=>{});
    return bot.sendMessage(chatId, menu.text, { parse_mode: 'HTML', disable_web_page_preview: true, ...menu.opts });
  }

  if (['🏠 Menu Utama', '👑 OWNER DESK', '🔧 Fix Merah', '💎 VIP/VVIP', '🎰 Daily Spin', '⚙️ Setup Gmail', '👤 Profil Akun'].includes(text)) {
    const menu = getDashboardMenu(chatId, db, user);
    return bot.sendMessage(chatId, `${UI.header('𝗦𝗜𝗦𝗧𝗘𝗠 𝗗𝗜𝗣𝗘𝗥𝗕𝗔𝗥𝗨𝗜', '🔄')}\nHarap gunakan tombol di bawah pesan ini. Keyboard mode lama telah dinonaktifkan secara permanen untuk stabilitas server.`, { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } }).then(() => bot.sendMessage(chatId, menu.text, { parse_mode: 'HTML', ...menu.opts }));
  }
}

async function handleCallback(bot, db, query) {
  const chatId = query.message.chat.id;
  const msgId = query.message.message_id;
  const data = query.data;
  const user = getUser(db, chatId);

  if (data === 'menu_main' || data === 'cancel_action') {
    user.awaitingNumber = false;
    user.awaitingSupport = false;
    if(user.awaitingBroadcast) user.awaitingBroadcast = false;
    await saveDB(db);
    const menu = getDashboardMenu(chatId, db, user);
    return bot.editMessageText(menu.text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', ...menu.opts });
  }

  if (data === 'verify_join') {
    const jc = await checkJoin(bot, chatId);
    if (jc.joined) {
      const menu = getDashboardMenu(chatId, db, user);
      return bot.editMessageText(menu.text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', ...menu.opts });
    }
    return bot.answerCallbackQuery(query.id, { text: '❌ Anda belum bergabung di semua channel yang diwajibkan!', show_alert: true });
  }

  if (data === 'menu_fix') {
    const c = canUseFix(db, user);
    if (!c.allowed) return bot.editMessageText(`${UI.header('𝗟𝗜𝗠𝗜𝗧 𝗛𝗔𝗕𝗜𝗦', '🚫')}\nLimit harian Anda telah habis. Upgrade lisensi VIP melalui WebApp untuk eksekusi tanpa batas.`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🌐 Buka Mini App', web_app: { url: `${config.PUBLIC_URL}/webapp` } }], [{ text: '◁ Kembali', callback_data: 'menu_main' }]] } });
    
    user.awaitingNumber = true;
    await saveDB(db);
    const text = `${UI.header('𝗙𝗜𝗫 𝗠𝗘𝗥𝗔𝗛 𝗘𝗫𝗘𝗖𝗨𝗧𝗢𝗥', '⚙️')}
<b>Sistem Siap Beroperasi.</b>
Silakan kirim nomor target pada kolom chat.

<b>[ 📊 STATUS EKSKUSI ]</b>
├ <b>Akses</b> : ${c.isPremium ? 'VIP Priority' : 'Free User'}
├ <b>Limit</b> : ${c.isPremium ? 'Maks 5 Baris sekaligus' : c.remaining + ' Kuota (1 Baris)'}
└ <b>Format</b> : <code>628xxxxxxxxxx</code>`;
    
    return bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '❌ Batalkan', callback_data: 'cancel_action' }]] } });
  }

  if (data === 'menu_premium') {
    return bot.editMessageText(`${UI.header('𝗩𝗜𝗣 & 𝗦𝗣𝗜𝗡 𝗔𝗥𝗘𝗔', '💎')}\nSistem Lisensi VIP dan fitur Daily Spin kini beroperasi eksklusif di dalam Mini App untuk pengalaman transaksi yang lebih cepat dan aman.\n\nKlik tombol di bawah untuk membuka panel:`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🌐 Buka Mini App', web_app: { url: `${config.PUBLIC_URL}/webapp` } }], [{ text: '◁ Kembali', callback_data: 'menu_main' }]] } });
  }

  if (data === 'menu_stats') {
    const text = `${UI.header('𝗦𝗧𝗔𝗧𝗜𝗦𝗧𝗜𝗖𝗦 𝗗𝗔𝗧𝗔', '📊')}
<b>[ 👤 DATA PERSONAL ]</b>
├ <b>Eksekusi Total</b> : <code>${user.totalFix || 0}</code> Kali
└ <b>Tanggal Join</b>   : <code>${new Date(user.joinedAt).toLocaleDateString('id-ID')}</code>

<b>[ 🌍 DATA SERVER GLOBAL ]</b>
├ <b>Total Trafik Fix</b> : <code>${db.stats.totalFix || 0}</code>
├ <b>Total Success</b>    : <code>${db.stats.totalSuccess || 0}</code>
└ <b>Total Failed</b>     : <code>${db.stats.totalFailed || 0}</code>`;

    return bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '◁ Kembali', callback_data: 'menu_main' }]] } });
  }

  if (data === 'menu_referral') {
    const rnk = getRank(user.referralCount || 0);
    const text = `${UI.header('𝗥𝗘𝗙𝗘𝗥𝗥𝗔𝗟 𝗣𝗥𝗢𝗚𝗥𝗔𝗠', '🤝')}
<b>[ 🏆 STATUS AFILIASI ]</b>
├ <b>Pangkat Anda</b> : ${rnk.icon} ${rnk.name}
└ <b>Total Invite</b> : <code>${user.referralCount || 0}</code> Orang

🔗 <b>Tautan Undangan Khusus Anda:</b>
<code>https://t.me/${config.BOT_USERNAME}?start=${chatId}</code>`;

    return bot.editMessageText(text, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '🏆 Klasemen', callback_data: 'ref_leaderboard' }], [{ text: '◁ Kembali', callback_data: 'menu_main' }]] } });
  }

  if (data === 'ref_leaderboard') {
    const sort = Object.values(db.users).sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0)).slice(0, 10);
    let t = `${UI.header('𝗟𝗘𝗔𝗗𝗘𝗥𝗕𝗢𝗔𝗥𝗗 𝗧𝗢𝗣 𝟭𝟬', '🏆')}\n`;
    sort.forEach((u, i) => {
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `🎗`;
      t += `${medal} <b>${esc((u.first_name || 'User').substring(0, 15))}</b>\n   └ <code>${u.referralCount || 0}</code> Referral\n\n`;
    });
    t += UI.footer();
    return bot.editMessageText(t, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '◁ Kembali', callback_data: 'menu_referral' }]] } });
  }

  if (data === 'user_contact_owner') {
    user.awaitingSupport = true;
    await saveDB(db);
    return bot.editMessageText(`${UI.header('𝗦𝗨𝗣𝗣𝗢𝗥𝗧 𝗧𝗜𝗞𝗘𝗧', '🎧')}\nSistem siap menerima pesan Anda.\nSilakan ketik keluhan, pertanyaan, atau laporan kendala Anda di bawah ini.\n\n<i>Pesan akan diteruskan secara langsung ke tim server kami...</i>`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '❌ Batalkan', callback_data: 'cancel_action' }]] } });
  }

  if (data === 'owner_broadcast' && isOwner(chatId)) {
    user.awaitingBroadcast = true;
    await saveDB(db);
    return bot.editMessageText(`${UI.header('𝗠𝗔𝗦𝗦 𝗕𝗥𝗢𝗔𝗗𝗖𝗔𝗦𝗧', '📢')}\nKirimkan teks yang ingin disiarkan ke seluruh database pengguna saat ini.`, { chat_id: chatId, message_id: msgId, parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '❌ Batalkan', callback_data: 'cancel_action' }]] } });
  }
}

module.exports = async (req, res) => {
  const bot = new TelegramBot(config.BOT_TOKEN);
  try {
    const db = await loadDB();
    if (req.method === 'POST') {
      const update = req.body;
      if (update.message) await handleMessage(bot, db, update.message);
      if (update.callback_query) {
        await handleCallback(bot, db, update.callback_query);
        try { await bot.answerCallbackQuery(update.callback_query.id); } catch {}
      }
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: false, error: e.message });
  }
};
