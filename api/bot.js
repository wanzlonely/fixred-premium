const TelegramBot = require('node-telegram-bot-api');
const { loadDB, saveDB, getTodayString, esc, getRank } = require('../lib/utils');
const config = require('../config');

const rateLimitMap = new Map();

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
      lastCheckin: null,
      state: null
    };
  } else {
    if (firstName && db.users[k].first_name !== firstName) db.users[k].first_name = firstName;
    if (username !== undefined && db.users[k].username !== username) db.users[k].username = username;
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

  const text = `⚡ <b>WALZY SYSTEM HUB - OWNER MODE</b> ⚡\n━ Framework Executive System ━\n\nSelamat Datang, <b>${dispName}</b> 👋\n\n┌ 💸 <b>Ringkasan Finansial:</b> <code>Rp ${totalRev.toLocaleString('id-ID')}</code>\n├ 👥 <b>Total Pengguna:</b> <code>${validUsersCount} Akun</code>\n└ 📥 <b>Transaksi Antrean:</b> <code>${pendingCount} Pending</code>\n\nPilih modul kontrol di bawah untuk mengelola sistem:`;

  const keyboard = [
    [
      { text: '🚀 PROSES FIX MERAH', callback_data: 'fix_merah' }
    ],
    [
      { text: '🖥️ PANEL WEBAPP ADMIN', web_app: { url: webappUrl } }
    ],
    [
      { text: `📑 Cek Pending (${pendingCount})`, callback_data: 'owner_check_pending' },
      { text: '📖 Panduan Admin', callback_data: 'help' }
    ]
  ];

  return { text, opts: { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } } };
}

function getUserMenu(user, chatId, webappUrl) {
  const rnk = getRank(user.referralCount || 0);
  const isPrem = isPremium(user);
  const statusBadge = isPrem ? `💎 VIP MEMBER (${getPremiumLeft(user)} Hari)` : `🎫 REGULAR MEMBER`;
  const dispName = esc(user.first_name || 'User Walzy');
  
  if (!user.dailyFix || user.dailyFix.date !== getTodayString()) {
    user.dailyFix = { date: getTodayString(), count: 0 };
  }
  const remainingQuota = isPrem ? 'UNLIMITED ♾️' : `${Math.max(0, 5 - (user.dailyFix.count || 0))}/5`;

  const text = `✨ <b>WALZY CYBER SYSTEM HUB</b> ✨\n━ Platform Sinkronisasi Merah ━\n\nHalo <b>${dispName}</b>, selamat datang kembali!\n\n┌ 👤 <b>ID Pengguna:</b> <code>${chatId}</code>\n├ 🎖️ <b>Peringkat:</b> ${rnk.icon} <code>${rnk.name}</code>\n├ 🪙 <b>Poin Vault:</b> <code>${user.points || 0} PTS</code>\n├ ⚡ <b>Kuota Harian:</b> <code>${remainingQuota}</code>\n└ 🔰 <b>Status Akses:</b> <b>${statusBadge}</b>\n\nFitur siap digunakan. Klik tombol di bawah untuk memulai:`;

  const keyboard = [
    [
      { text: '⚡ SINKRONISASI FIX MERAH', callback_data: 'fix_merah' }
    ],
    [
      { text: '🌐 BUKA WEBAPP STORE', web_app: { url: webappUrl } }
    ],
    [
      { text: '🎁 Claim Poin Harian', callback_data: 'user_checkin_info' },
      { text: '💬 Customer Service', callback_data: 'contact_owner' }
    ],
    [
      { text: '❓ Panduan Penggunaan', callback_data: 'help' }
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

      const user = getUser(db, uid, q.from);

      if (data === 'fix_merah') {
        await bot.answerCallbackQuery(qId, { text: '🛠️ Modul Fix Merah Siap', show_alert: false });
        if (user) {
          user.state = { action: 'awaiting_fixmerah_number' };
          await saveDB(db);
        }
        await bot.sendMessage(uid, `🛠️ <b>MODE SINKRONISASI FIX MERAH</b>\n\nSilakan kirimkan nomor WhatsApp target yang ingin diproses.\nFormat wajib: <code>+628xxxxxxxxxx</code> atau <code>08xxxxxxxxxx</code>`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (data === 'owner_check_pending') {
        await bot.answerCallbackQuery(qId, { text: '📑 Memuat antrean pending...', show_alert: false });
        const allPayments = Object.values(db.payments || {});
        const pending = allPayments.filter(p => p.status === 'waiting_approval' || p.status === 'pending');

        if (pending.length === 0) {
          await bot.sendMessage(uid, `🟢 <b>ANTREAN BERSIH</b>\n\nSaat ini tidak ada transaksi pending deposit.`, { parse_mode: 'HTML' });
        } else {
          let listTxt = pending.slice(0, 5).map(p => `• <code>${p.id}</code> | User: <code>${p.userId}</code> | Paket: ${p.days} Hari (${p.amountFormatted})`).join('\n');
          await bot.sendMessage(uid, `📥 <b>TRANSAKSI PENDING (${pending.length})</b>\n\n${listTxt}\n\nBuka WebApp Admin Studio untuk approval cepat.`, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: '🌐 Buka WebApp Admin', web_app: { url: webappUrl } }]] }
          });
        }
        return res.status(200).send('OK');
      }

      if (data === 'user_checkin_info') {
        await bot.answerCallbackQuery(qId, { text: '🎁 Info Check-in', show_alert: false });
        await bot.sendMessage(uid, `🎁 <b>BONUS POIN HARIAN WALZY</b>\n\nKlaim poin harian kamu langsung dari WebApp:\n\n• Hari 1: +30 PTS\n• Hari 2: +50 PTS\n• Hari 3: +75 PTS\n• Hari 4: +100 PTS\n• Hari 5: +150 PTS\n• Hari 6: +200 PTS\n• Hari 7: +350 PTS\n\nPoin dapat ditukarkan dengan Akses VIP Gratis!`, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🌐 Claim di WebApp Store', web_app: { url: webappUrl } }]] }
        });
        return res.status(200).send('OK');
      }

      if (data === 'help') {
        await bot.answerCallbackQuery(qId, { text: '📖 Panduan Penggunaan', show_alert: false });
        await bot.sendMessage(uid, `📖 <b>PANDUAN LENGKAP PENGGUNAAN BOT</b>\n\n1. <b>SINKRONISASI FIX MERAH:</b>\nTekan tombol ⚡ <b>SINKRONISASI FIX MERAH</b>, lalu ketik nomor WhatsApp target.\n\n2. <b>PEMBELIAN AKSES VIP:</b>\nTekan 🌐 <b>BUKA WEBAPP STORE</b> -> pilih tab <b>Order VIP</b> -> pilih paket & bayar.\n\n3. <b>REDEEM VOUCHER PROMO:</b>\nBuka WebApp -> masukkan kode voucher promo di halaman utama.\n\n4. <b>BONUS POIN & SPIN:</b>\nCheck-in harian dan putar Spin Wheel di WebApp untuk klaim poin gratis.`, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🌐 Masuk WebApp Store', web_app: { url: webappUrl } }]] }
        });
        return res.status(200).send('OK');
      }

      if (data === 'contact_owner') {
        await bot.answerCallbackQuery(qId, { text: '💬 Support Mode Active', show_alert: false });
        if (user) {
          user.state = { action: 'awaiting_owner_msg' };
          await saveDB(db);
        }
        await bot.sendMessage(uid, `💬 <b>CUSTOMER SUPPORT WALZY</b>\n\nKetik dan kirimkan pesan Anda sekarang. Operator akan segera memberikan tanggapan.`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (data.startsWith('reply_user_')) {
        await bot.answerCallbackQuery(qId);
        const targetUserId = data.replace('reply_user_', '');
        if (user) {
          user.state = { action: 'replying_to_user', targetId: targetUserId };
          await saveDB(db);
        }
        await bot.sendMessage(uid, `✏️ <b>BALAS USER (ID: ${targetUserId})</b>\n\nKetik pesan balasan resmi Anda di sini.`, { parse_mode: 'HTML' });
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
      const st = user.state;

      if (st && st.action === 'awaiting_fixmerah_number' && text && !text.startsWith('/')) {
        user.state = null;

        let cleanDigits = text.replace(/[^\d]/g, '');
        if (!cleanDigits) {
          await saveDB(db);
          await bot.sendMessage(chatId, `❌ <b>Nomor tidak valid!</b> Silakan kirimkan format nomor HP yang benar.`, { parse_mode: 'HTML' });
          return res.status(200).send('OK');
        }

        const isPrem = isPremium(user);
        if (!isPrem) {
          if (!user.dailyFix || user.dailyFix.date !== getTodayString()) {
            user.dailyFix = { date: getTodayString(), count: 0 };
          }
          if (user.dailyFix.count >= 5) {
            await saveDB(db);
            await bot.sendMessage(chatId, `⚠️ <b>KUOTA HARIAN TELAH HABIS</b>\n\nKuota harian pengguna gratis telah habis (5/5).\n\nUpgrade ke <b>VIP Member</b> untuk akses tanpa batas.`, {
              parse_mode: 'HTML',
              reply_markup: { inline_keyboard: [[{ text: '💎 Upgrade VIP Sekarang', web_app: { url: webappUrl } }]] }
            });
            return res.status(200).send('OK');
          }
          user.dailyFix.count += 1;
        }

        await saveDB(db);

        let formattedNum = cleanDigits;
        if (formattedNum.startsWith('08')) formattedNum = '628' + formattedNum.slice(2);
        else if (!formattedNum.startsWith('62')) formattedNum = '62' + formattedNum;

        const displayNum = '+' + formattedNum;

        const clientHelper = require('../lib/client');
        const initRes = await clientHelper.sendToTarget(displayNum);
        const sessionCode = initRes.targetId || `CPHX ${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

        const initialMsgTxt = `🛠️ <b>STATUS PROSES FIX MERAH</b>\n\n📱 Target: <code>${displayNum}</code>\n🆔 Kode Sesi: <code>${sessionCode}</code>\n📩 Status: <b>TERKIRIM</b>\n\nMemantau tanggapan dari server WhatsApp...`;

        await bot.sendMessage(chatId, initialMsgTxt, { parse_mode: 'HTML' });

        const statusRes = await clientHelper.monitorTargetResponse(displayNum, sessionCode, 5000);

        if (statusRes.status === 'SUCCESS') {
          const succReport = `✅ <b>BERHASIL SINKRONISASI</b>\n\n📱 Target: <code>${displayNum}</code>\n🆔 Kode Sesi: <code>${sessionCode}</code>\n📩 Status: <b>SUKSES</b>\n\nSilakan verifikasi/login akun Anda sekarang.`;
          await bot.sendMessage(chatId, succReport, { parse_mode: 'HTML' });
        } else {
          const failReport = `⚠️ <b>BELUM ADA RESPONS</b>\n\n📱 Target: <code>${displayNum}</code>\n🆔 Kode Sesi: <code>${sessionCode}</code>\n📩 Status: <b>BELUM ADA BALASAN</b>\n\nSilakan lakukan pengecekan secara berkala.`;
          await bot.sendMessage(chatId, failReport, { parse_mode: 'HTML' });
        }

        return res.status(200).send('OK');
      }

      if (st && st.action === 'awaiting_owner_msg' && text && !text.startsWith('/')) {
        user.state = null;
        await saveDB(db);

        for (let ownerId of (config.OWNER_IDS || [])) {
          try {
            await bot.sendMessage(ownerId, `📨 <b>PESAN DARI PENGGUNA</b>\n\n👤 Pengirim: <b>${esc(user.first_name)}</b>\n🆔 ID: <code>${uid}</code>\n💬 Isi Pesan:\n${esc(text)}`, {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [[{ text: `💬 Balas User (${uid})`, callback_data: `reply_user_${uid}` }]]
              }
            });
          } catch (e) {}
        }
        await bot.sendMessage(chatId, `✅ <b>PESAN TERKIRIM</b>\n\nPesan telah disampaikan ke Operator Support.`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (st && st.action === 'replying_to_user' && text && !text.startsWith('/') && isOwner(uid)) {
        const targetId = st.targetId;
        user.state = null;
        await saveDB(db);

        try {
          await bot.sendMessage(targetId, `💬 <b>BALASAN OPERATOR SUPPORT</b>\n\n${esc(text)}`, { parse_mode: 'HTML' });
          await bot.sendMessage(chatId, `✅ Pesan berhasil dikirim ke ID <code>${targetId}</code>.`, { parse_mode: 'HTML' });
        } catch (e) {
          await bot.sendMessage(chatId, `❌ Gagal mengirim pesan ke pengguna.`, { parse_mode: 'HTML' });
        }
        return res.status(200).send('OK');
      }

      if (text.startsWith('/start')) {
        user.state = null;
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
                await bot.sendMessage(refId, `🎉 <b>REFERRAL BARU</b>\n\n<b>${esc(user.first_name)}</b> telah mendaftar!\nBonus: 🪙 <b>+50 PTS</b>`, { parse_mode: 'HTML' });
              } catch (e) {}
            }
          }
        }
        await saveDB(db);
        const menu = isOwner(uid) ? getOwnerMenu(user, chatId, db, webappUrl) : getUserMenu(user, chatId, webappUrl);
        await bot.sendMessage(chatId, menu.text, menu.opts);
        return res.status(200).send('OK');
      }

      user.state = null;
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
