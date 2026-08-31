const { loadDB, saveDB, getTodayString, genID, esc, getRank } = require('../lib/utils');
const { sendToTarget } = require('../lib/client');
const config = require('../config');

const rateLimitMap = new Map();
const supportRateMap = new Map();

function isOwner(id) {
  return config.OWNER_IDS.map(String).includes(String(id));
}

function isSuspiciousId(id) {
  const s = String(id);
  const n = Number(id);
  if (!n || n <= 0) return true;
  if (s.startsWith('-')) return true;
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
  for (let k of Object.keys(db.users)) { if (isSuspiciousId(k)) delete db.users[k]; }
  for (let k of Object.keys(db.payments)) { const p = db.payments[k]; if (p && isSuspiciousId(p.userId)) delete db.payments[k]; }
}

function getUniqueUsers(usersObj) {
  const map = new Map();
  for (let u of Object.values(usersObj || {})) {
    if (isSuspiciousId(u.id)) continue;
    const name = (u.first_name || '').trim();
    if (!name) continue;
    const lower = name.toLowerCase();
    if (lower.includes('exploit') && (u.totalFix || 0) === 0 && (u.referralCount || 0) === 0) continue;
    if (!map.has(lower)) map.set(lower, u);
  }
  return Array.from(map.values());
}

function checkRateLimit(id) {
  const now = Date.now();
  const last = rateLimitMap.get(String(id)) || 0;
  if (now - last < 800) return false;
  rateLimitMap.set(String(id), now);
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

async function checkJoin(bot, uid) {
  if (isOwner(uid)) return { joined: true, notJoined: [] };
  let notJoined = [];
  if (!config.FORCE_JOIN || !Array.isArray(config.FORCE_JOIN)) return { joined: true, notJoined: [] };
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

function bq(t) { return `<blockquote>${t}</blockquote>`; }

function getOwnerMenu(chatId, db, user) {
  const validUsers = getUniqueUsers(db.users);
  const premiumCount = validUsers.filter(u => isPremium(u)).length;
  const webappUrl = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/webapp` : '';

  const text = `⚡️ <b>WALZY OWNER STUDIO PRO</b>
━━━━━━━━━━━━━━━━━━━━━━━
${bq(`👑 <b>Owner:</b> ${esc(user.first_name)}\n🛡️ <b>Mode:</b> Studio Admin\n\n📊 <b>METRIK UTAMA</b>\n• Total Pengguna: <code>${validUsers.length}</code>\n• Anggota VIP: <code>${premiumCount}</code>\n• Total Permintaan: <code>${db.stats.totalFix || 0}</code>\n• Total Pendapatan: <code>Rp ${(db.stats.revenue || 0).toLocaleString('id-ID')}</code>`)}
━━━━━━━━━━━━━━━━━━━━━━━
🕒 <i>${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</i>`;

  const keyboard = [
    [{ text: '🎨 Buka WebApp Studio Pro', web_app: { url: webappUrl } }],
    [{ text: '🔧 Fitur Fix Merah', callback_data: 'menu_fix' }, { text: '📦 Katalog Order', callback_data: 'menu_order' }],
    [{ text: '👥 Kelola User', callback_data: 'owner_users' }, { text: '🎟️ Buat Voucher', callback_data: 'owner_voucher' }],
    [{ text: '📢 Broadcast Pesan', callback_data: 'menu_broadcast' }, { text: '📊 Analitik Bot', callback_data: 'menu_stats' }]
  ];

  return { text, opts: { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } } };
}

function getUserMenu(chatId, db, user) {
  const rnk = getRank(user.referralCount || 0);
  const can = canUseFix(db, user);
  const status = isPremium(user) ? `💎 <b>VIP (${getPremiumLeft(user)} Hari)</b>` : `🎫 <b>Gratis (${can.remaining}/3 Kuota)</b>`;
  const webappUrl = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/webapp` : '';

  const text = `✨ <b>WALZY STORE OFFICIAL</b>
━━━━━━━━━━━━━━━━━━━━━━━
${bq(`Selamat Datang, <b>${esc(user.first_name)}</b>! 👋\n\n🆔 <b>ID Anda:</b> <code>${chatId}</code>\n⭐ <b>Status Akses:</b> ${status}\n🏅 <b>Peringkat:</b> ${rnk.icon} ${rnk.name}\n👥 <b>Referral:</b> <code>${user.referralCount || 0} Orang</code>`)}
━━━━━━━━━━━━━━━━━━━━━━━
💡 <i>Gunakan WebApp interaktif kami untuk pengalaman visual super keren!</i>`;

  const keyboard = [
    [{ text: '🛍️ Buka Toko WebApp', web_app: { url: webappUrl } }],
    [{ text: '🔧 Fix Merah Instant', callback_data: 'menu_fix' }, { text: '📦 Beli VIP / Order', callback_data: 'menu_order' }],
    [{ text: '👤 Profil Saya', callback_data: 'menu_profile' }, { text: '💬 Layanan Bantuan', callback_data: 'user_contact_owner' }]
  ];

  return { text, opts: { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } } };
}

module.exports = async (req, res) => {
  const TelegramBot = require('node-telegram-bot-api');
  const bot = new TelegramBot(config.BOT_TOKEN);

  try {
    const db = await loadDB();
    ensureDB(db);
    cleanDB(db);

    if (req.method === 'POST') {
      const update = req.body;
      if (!update) return res.status(200).send('OK');

      // HANDLER MESSAGE
      if (update.message) {
        const msg = update.message;
        const chatId = msg.chat.id;
        const uid = msg.from.id;

        if (isSuspiciousId(uid)) return res.status(200).send('OK');
        if (!checkRateLimit(uid)) return res.status(200).send('OK');

        const user = getUser(db, uid);
        if (!user) return res.status(200).send('OK');

        user.first_name = msg.from.first_name || '';
        user.username = msg.from.username || '';

        // Checking Force Join
        const joinCheck = await checkJoin(bot, uid);
        if (!joinCheck.joined) {
          const btns = joinCheck.notJoined.map(ch => [{ text: `📢 Join ${ch.name}`, url: ch.link }]);
          btns.push([{ text: '🔄 Saya Sudah Join', callback_data: 'check_join' }]);
          await bot.sendMessage(chatId, `⚠️ <b>WAJIB JOIN CHANNEL</b>\n\nSilakan bergabung ke saluran resmi kami terlebih dahulu untuk menggunakan layanan bot:`, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: btns }
          });
          await saveDB(db);
          return res.status(200).send('OK');
        }

        const text = (msg.text || '').trim();

        // Broadcast State (Owner)
        if (user.awaitingBroadcast && isOwner(uid)) {
          user.awaitingBroadcast = false;
          await saveDB(db);
          const validUsers = getUniqueUsers(db.users);
          let sent = 0;
          await bot.sendMessage(chatId, `⏳ Sending broadcast to ${validUsers.length} users...`);
          for (let u of validUsers) {
            try {
              await bot.sendMessage(u.id, text, { parse_mode: 'HTML' });
              sent++;
            } catch (e) {}
          }
          await bot.sendMessage(chatId, `✅ <b>SIARAN SELESAI!</b>\nBerhasil terkirim ke <b>${sent}</b> pengguna.`, { parse_mode: 'HTML' });
          return res.status(200).send('OK');
        }

        // Support Message State
        if (user.awaitingSupport) {
          user.awaitingSupport = false;
          await saveDB(db);
          const ownerMsg = `💬 <b>PESAN BANTUAN BARU</b>\n\nDari: <b>${esc(user.first_name)}</b> (<code>${uid}</code>)\nUsername: @${user.username || '-'}\n\n<b>Pesan:</b>\n${esc(text)}`;
          for (let oId of config.OWNER_IDS) {
            try {
              await bot.sendMessage(oId, ownerMsg, {
                parse_mode: 'HTML',
                reply_markup: { inline_keyboard: [[{ text: '✍️ Balas Pesan', callback_data: `reply_support_${uid}` }]] }
              });
            } catch (e) {}
          }
          await bot.sendMessage(chatId, `✅ Pesan bantuan Anda telah dikirim ke Tim Support. Kami akan segera merespons!`);
          return res.status(200).send('OK');
        }

        // COMMAND /start
        if (text.startsWith('/start')) {
          const parts = text.split(' ');
          if (parts[1] && parts[1].startsWith('ref_')) {
            const refId = parts[1].replace('ref_', '');
            if (refId !== String(uid) && !user.referredBy) {
              const inviter = db.users[refId];
              if (inviter) {
                user.referredBy = refId;
                inviter.referralCount = (inviter.referralCount || 0) + 1;
                if (!Array.isArray(inviter.referrals)) inviter.referrals = [];
                inviter.referrals.push(uid);
                try {
                  await bot.sendMessage(refId, `🎉 <b>REFERRAL BARU!</b>\n<b>${esc(user.first_name)}</b> bergabung menggunakan tautan Anda!`, { parse_mode: 'HTML' });
                } catch (e) {}
              }
            }
          }
          await saveDB(db);

          const menu = isOwner(uid) ? getOwnerMenu(chatId, db, user) : getUserMenu(chatId, db, user);
          await bot.sendMessage(chatId, menu.text, menu.opts);
          return res.status(200).send('OK');
        }

        // Default Reply Menu
        const menu = isOwner(uid) ? getOwnerMenu(chatId, db, user) : getUserMenu(chatId, db, user);
        await bot.sendMessage(chatId, menu.text, menu.opts);
        await saveDB(db);
        return res.status(200).send('OK');
      }

      // HANDLER CALLBACK QUERY
      if (update.callback_query) {
        const cq = update.callback_query;
        const chatId = cq.message.chat.id;
        const msgId = cq.message.message_id;
        const uid = cq.from.id;
        const data = cq.data;

        const user = getUser(db, uid);
        if (!user) return res.status(200).send('OK');

        const editOrSend = async (text, opts) => {
          try {
            await bot.editMessageText(text, { chat_id: chatId, message_id: msgId, ...opts });
          } catch (e) {
            if (!e.message.includes('message is not modified')) {
              await bot.sendMessage(chatId, text, opts);
            }
          }
        };

        if (data === 'check_join' || data === 'menu_main') {
          const menu = isOwner(uid) ? getOwnerMenu(chatId, db, user) : getUserMenu(chatId, db, user);
          await editOrSend(menu.text, menu.opts);
          return res.status(200).send('OK');
        }

        if (data === 'menu_profile') {
          const rnk = getRank(user.referralCount || 0);
          const isPrem = isPremium(user);
          const txt = `👤 <b>PROFIL PENGGUNA</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n${bq(`• Nama: <b>${esc(user.first_name)}</b>\n• ID: <code>${uid}</code>\n• Status VIP: <b>${isPrem ? `VIP (${getPremiumLeft(user)} Hari)` : 'Gratis'}</b>\n• Rank: ${rnk.icon} ${rnk.name}\n• Total Referral: <code>${user.referralCount || 0}</code>\n• Total Order: <code>${user.totalFix || 0}</code>`)}`;
          await editOrSend(txt, { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: '◁ Kembali', callback_data: 'menu_main' }]] } });
          return res.status(200).send('OK');
        }

        if (data === 'menu_broadcast' && isOwner(uid)) {
          user.awaitingBroadcast = true;
          await saveDB(db);
          await editOrSend(`📢 <b>SIARAN BROADCAST</b>\n\nKetik dan kirimkan teks/format pesan HTML yang ingin disiarkan ke semua pengguna:`, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: '❌ Batal', callback_data: 'menu_main' }]] }
          });
          return res.status(200).send('OK');
        }

        if (data === 'user_contact_owner') {
          user.awaitingSupport = true;
          await saveDB(db);
          await editOrSend(`💬 <b>LAYANAN BANTUAN</b>\n\nKetikkan keluhan atau pertanyaan Anda di bawah ini (Maksimal 500 karakter):`, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: '❌ Batal', callback_data: 'menu_main' }]] }
          });
          return res.status(200).send('OK');
        }
      }
    }

    res.status(200).send('WALZY BOT RUNNING');
  } catch (err) {
    console.error('Bot Error:', err);
    res.status(500).send('Internal Error');
  }
};
