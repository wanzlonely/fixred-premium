const TelegramBot = require('node-telegram-bot-api');
const { loadDB, saveDB, getTodayString, esc, getRank } = require('../lib/utils');
const config = require('../config');

const rateLimitMap = new Map();
const userState = new Map();

function isOwner(id) {
  if (!config.OWNER_IDS || !Array.isArray(config.OWNER_IDS)) return false;
  return config.OWNER_IDS.map(String).includes(String(id));
}

function isSuspiciousId(id) {
  if (!id) return true;
  const s = String(id);
  const n = Number(id);
  if (!n || n <= 0 || s.startsWith('-')) return true;
  return false;
}

function ensureDB(db) {
  if (!db.users) db.users = {};
  if (!db.payments) db.payments = {};
  if (!db.codes) db.codes = {};
  if (!db.stats) db.stats = { totalFix: 0, totalSuccess: 0, totalFailed: 0, revenue: 0, revenueHistory: [], lastReset: Date.now() };
}

function checkRateLimit(id) {
  const now = Date.now();
  const last = rateLimitMap.get(String(id)) || 0;
  if (now - last < 800) return false;
  rateLimitMap.set(String(id), now);
  return true;
}

function getUser(db, id, msgFrom) {
  const k = String(id);
  if (isSuspiciousId(k)) return null;
  const firstName = msgFrom && msgFrom.first_name ? msgFrom.first_name : 'User';
  const username = msgFrom && msgFrom.username ? msgFrom.username : '';

  if (!db.users[k]) {
    db.users[k] = {
      id: Number(id) || id,
      first_name: firstName,
      username: username,
      joinedAt: Date.now(),
      referralCount: 0,
      referrals: [],
      referredBy: null,
      totalFix: 0,
      dailyFix: { date: getTodayString(), count: 0 },
      premiumUntil: 0,
      lastSpin: null,
      points: 0,
      checkinStreak: 0,
      lastCheckin: null
    };
  } else {
    if (firstName && db.users[k].first_name !== firstName) db.users[k].first_name = firstName;
    if (username !== undefined && db.users[k].username !== username) db.users[k].username = username;
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

function getWebappUrl(req) {
  if (config.PUBLIC_URL && config.PUBLIC_URL.startsWith('http')) {
    return config.PUBLIC_URL.endsWith('/') ? `${config.PUBLIC_URL}webapp` : `${config.PUBLIC_URL}/webapp`;
  }
  const host = req.headers.host || req.headers['x-forwarded-host'] || 'localhost';
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return `${proto}://${host}/webapp`;
}

function getOwnerMenu(user, chatId, db, webappUrl) {
  const allPayments = Object.values(db.payments || {});
  const pendingCount = allPayments.filter(p => p.status === 'waiting_approval' || p.status === 'pending').length;
  const validUsersCount = Object.keys(db.users || {}).length;
  const totalRev = (db.stats && db.stats.revenue) ? db.stats.revenue : 0;
  const dispName = esc(user.first_name || 'Owner Executive');

  const text = `👑 <b>Walzy Dashboard</b>\n\nHalo, <b>${dispName}</b>\n\n💰 Pendapatan: <code>Rp ${totalRev.toLocaleString('id-ID')}</code>\n👥 Pengguna: <code>${validUsersCount}</code>\n📥 Pending: <code>${pendingCount}</code>`;

  const keyboard = [
    [
      { text: '🛠️ Fix Merah', callback_data: 'fix_merah' },
      { text: `📥 Pending (${pendingCount})`, callback_data: 'owner_check_pending' }
    ],
    [
      { text: '🌐 Admin Studio', web_app: { url: webappUrl } }
    ],
    [
      { text: '❓ Bantuan', callback_data: 'help' }
    ]
  ];

  return { text, opts: { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } } };
}

function getUserMenu(user, chatId, webappUrl) {
  const rnk = getRank(user.referralCount || 0);
  const isPrem = isPremium(user);
  const statusBadge = isPrem ? `💎 VIP (${getPremiumLeft(user)} Hari)` : `🎫 Free Member`;
  const dispName = esc(user.first_name || 'User Walzy');
  
  if (!user.dailyFix || user.dailyFix.date !== getTodayString()) {
    user.dailyFix = { date: getTodayString(), count: 0 };
  }
  const remainingQuota = isPrem ? 'Unlimited' : `${Math.max(0, 5 - (user.dailyFix.count || 0))}/5`;

  const text = `⚡ <b>Walzy Store</b>\n\nHalo <b>${dispName}</b>\n\n${rnk.icon} Peringkat: <code>${rnk.name}</code>\n🪙 Poin: <code>${user.points || 0} PTS</code>\n⚡ Kuota Harian: <b>${remainingQuota}</b>\n💎 Status: <b>${statusBadge}</b>`;

  const keyboard = [
    [
      { text: '🛠️ Fix Merah', callback_data: 'fix_merah' },
      { text: '🌐 Mini Web', web_app: { url: webappUrl } }
    ],
    [
      { text: '🎁 Check-in', callback_data: 'user_checkin_info' },
      { text: '💬 Support', callback_data: 'contact_owner' }
    ],
    [
      { text: '❓ Bantuan', callback_data: 'help' }
    ]
  ];

  return { text, opts: { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } } };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(200).send('Bot API Ready');

  const bot = new TelegramBot(config.BOT_TOKEN);

  try {
    const db = await loadDB();
    ensureDB(db);

    const update = req.body;
    if (!update) return res.status(200).send('OK');

    const webappUrl = getWebappUrl(req);

    if (update.callback_query) {
      const q = update.callback_query;
      const qId = q.id;
      const uid = q.from.id;
      const data = q.data;

      if (data === 'fix_merah') {
        await bot.answerCallbackQuery(qId, { text: '🛠️ Modul Fix Merah Aktif', show_alert: false });
        userState.set(String(uid), { action: 'awaiting_fixmerah_number' });
        await bot.sendMessage(uid, `🛠️ <b>Fix Merah</b>\n\nKirim nomor WhatsApp target yang ingin diproses.\nContoh: <code>+628123456789</code>`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (data === 'owner_check_pending') {
        await bot.answerCallbackQuery(qId, { text: '📑 Membuka daftar pending...', show_alert: false });
        const allPayments = Object.values(db.payments || {});
        const pending = allPayments.filter(p => p.status === 'waiting_approval' || p.status === 'pending');

        if (pending.length === 0) {
          await bot.sendMessage(uid, `🟢 <b>Tidak Ada Pending</b>\n\nAntrean transaksi bersih.`, { parse_mode: 'HTML' });
        } else {
          let listTxt = pending.slice(0, 5).map(p => `• <b>${p.id}</b> — <code>${p.userId}</code> — ${p.days} Hari (${p.amountFormatted})`).join('\n');
          await bot.sendMessage(uid, `📥 <b>Pending Invoices (${pending.length})</b>\n\n${listTxt}\n\nBuka Admin Studio untuk approval.`, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: '🌐 Admin Studio', web_app: { url: webappUrl } }]] }
          });
        }
        return res.status(200).send('OK');
      }

      if (data === 'user_checkin_info') {
        await bot.answerCallbackQuery(qId, { text: '🎁 Info Check-in', show_alert: false });
        await bot.sendMessage(uid, `🎁 <b>Daily Check-in</b>\n\nKlaim poin harian melalui Mini Web:\n\nHari 1: +30 · Hari 2: +50 · Hari 3: +75\nHari 4: +100 · Hari 5: +150\nHari 6: +200 · Hari 7: +350\n\nTukarkan poin dengan akses VIP gratis.`, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🌐 Claim di Mini Web', web_app: { url: webappUrl } }]] }
        });
        return res.status(200).send('OK');
      }

      if (data === 'help') {
        await bot.answerCallbackQuery(qId, { text: '✨ Bantuan', show_alert: false });
        await bot.sendMessage(uid, `❓ <b>Panduan Walzy Store</b>\n\n1. <b>Fix Merah</b> — kirim nomor target lewat tombol utama.\n2. <b>Beli VIP</b> — buka Mini Web, halaman Order VIP.\n3. <b>Redeem Voucher</b> — masukkan kode promo di Mini Web.\n4. <b>Spin & Check-in</b> — putar harian untuk poin gratis.`, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🌐 Buka Mini Web', web_app: { url: webappUrl } }]] }
        });
        return res.status(200).send('OK');
      }

      if (data === 'contact_owner') {
        await bot.answerCallbackQuery(qId, { text: '💬 Support Mode Active', show_alert: false });
        userState.set(String(uid), { action: 'awaiting_owner_msg' });
        await bot.sendMessage(uid, `💬 <b>Customer Support</b>\n\nTuliskan pertanyaan Anda. Pesan akan diteruskan ke Operator.`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (data.startsWith('reply_user_')) {
        await bot.answerCallbackQuery(qId);
        const targetUserId = data.replace('reply_user_', '');
        userState.set(String(uid), { action: 'replying_to_user', targetId: targetUserId });
        await bot.sendMessage(uid, `✏️ <b>Balas User (${targetUserId})</b>\n\nKetik pesan balasan Anda.`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }
    }

    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const uid = msg.from.id;

      if (isSuspiciousId(uid)) return res.status(200).send('OK');
      if (!checkRateLimit(uid)) return res.status(200).send('OK');

      const user = getUser(db, uid, msg.from);
      if (!user) return res.status(200).send('OK');

      const text = (msg.text || '').trim();
      const st = userState.get(String(uid));

      if (st && st.action === 'awaiting_fixmerah_number' && text) {
        userState.delete(String(uid));

        let cleanDigits = text.replace(/[^\d]/g, '');
        if (!cleanDigits) {
          await bot.sendMessage(chatId, `❌ <b>Format nomor tidak valid!</b> Silakan masukkan angka nomor telepon yang benar.`, { parse_mode: 'HTML' });
          return res.status(200).send('OK');
        }

        const isPrem = isPremium(user);
        if (!isPrem) {
          if (!user.dailyFix || user.dailyFix.date !== getTodayString()) {
            user.dailyFix = { date: getTodayString(), count: 0 };
          }
          if (user.dailyFix.count >= 5) {
            await bot.sendMessage(chatId, `⚠️ <b>Kuota Harian Habis</b>\n\nKuota gratis Fix Merah Anda hari ini sudah mencapai batas (5/5).\n\nUpgrade ke VIP di Mini Web untuk kuota unlimited.`, {
              parse_mode: 'HTML',
              reply_markup: { inline_keyboard: [[{ text: '💎 Upgrade VIP', web_app: { url: webappUrl } }]] }
            });
            return res.status(200).send('OK');
          }
          user.dailyFix.count += 1;
          await saveDB(db);
        }

        let formattedNum = cleanDigits;
        if (formattedNum.startsWith('08')) formattedNum = '628' + formattedNum.slice(2);
        else if (!formattedNum.startsWith('62')) formattedNum = '62' + formattedNum;

        const displayNum = '+' + formattedNum;

        const clientHelper = require('../lib/client');
        const initRes = await clientHelper.sendToTarget(displayNum);
        const sessionCode = initRes.targetId || `CPHX ${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

        const initialMsgTxt = `🛠️ <b>Proses Fix Merah</b>\n\n✅ Terkirim\n📱 <code>${displayNum}</code>\n🆔 <code>${sessionCode}</code>\n\nUpdate status dikirim otomatis jika ada balasan.`;

        await bot.sendMessage(chatId, initialMsgTxt, { parse_mode: 'HTML' });

        const statusRes = await clientHelper.monitorTargetResponse(displayNum, sessionCode, 6000);

        if (statusRes.status === 'SUCCESS') {
          const succReport = `✅ <b>Fix Merah Berhasil</b>\n\n📱 <code>${displayNum}</code>\n🆔 <code>${sessionCode}</code>\n\nWhatsApp sudah merespon. Silakan coba login/verifikasi akun Anda sekarang.`;
          await bot.sendMessage(chatId, succReport, { parse_mode: 'HTML' });
        } else {
          const failReport = `⚠️ <b>Belum Ada Respons</b>\n\n📱 <code>${displayNum}</code>\n🆔 <code>${sessionCode}</code>\n\nWhatsApp belum merespon. Silakan periksa berkala.`;
          await bot.sendMessage(chatId, failReport, { parse_mode: 'HTML' });
        }

        return res.status(200).send('OK');
      }

      if (st && st.action === 'awaiting_owner_msg' && text) {
        userState.delete(String(uid));
        for (let ownerId of (config.OWNER_IDS || [])) {
          try {
            await bot.sendMessage(ownerId, `📨 <b>Pesan Masuk</b>\n\n👤 <b>${esc(user.first_name)}</b>\n🆔 <code>${uid}</code>\n💬 ${esc(text)}`, {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [[{ text: `💬 Balas User (${uid})`, callback_data: `reply_user_${uid}` }]]
              }
            });
          } catch (e) {}
        }
        await bot.sendMessage(chatId, `✅ <b>Pesan Terkirim</b>\n\nPesan Anda telah diteruskan ke Customer Service. Harap menunggu balasan.`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (st && st.action === 'replying_to_user' && text && isOwner(uid)) {
        userState.delete(String(uid));
        try {
          await bot.sendMessage(st.targetId, `💬 <b>Balasan Operator</b>\n\n${esc(text)}`, { parse_mode: 'HTML' });
          await bot.sendMessage(chatId, `✅ Balasan berhasil dikirim ke user ID <code>${st.targetId}</code>!`, { parse_mode: 'HTML' });
        } catch (e) {
          await bot.sendMessage(chatId, `❌ Gagal mengirim balasan ke user.`, { parse_mode: 'HTML' });
        }
        return res.status(200).send('OK');
      }

      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts[1] && parts[1].startsWith('ref_')) {
          const refId = parts[1].replace('ref_', '');
          if (refId !== String(uid) && !user.referredBy) {
            const inviter = db.users[refId];
            if (inviter) {
              user.referredBy = refId;
              inviter.referralCount = (inviter.referralCount || 0) + 1;
              inviter.points = (inviter.points || 0) + 50;
              if (!Array.isArray(inviter.referrals)) inviter.referrals = [];
              inviter.referrals.push(uid);
              try {
                await bot.sendMessage(refId, `🎉 <b>Referral Baru</b>\n\n<b>${esc(user.first_name)}</b> bergabung melalui link Anda!\n🪙 +50 PTS`, { parse_mode: 'HTML' });
              } catch (e) {}
            }
          }
        }
        await saveDB(db);
        const menu = isOwner(uid) ? getOwnerMenu(user, chatId, db, webappUrl) : getUserMenu(user, chatId, webappUrl);
        await bot.sendMessage(chatId, menu.text, menu.opts);
        return res.status(200).send('OK');
      }

      const menu = isOwner(uid) ? getOwnerMenu(user, chatId, db, webappUrl) : getUserMenu(user, chatId, webappUrl);
      await bot.sendMessage(chatId, menu.text, menu.opts);
      await saveDB(db);
      return res.status(200).send('OK');
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Bot Error:', err);
    res.status(500).send('Internal Error');
  }
};
