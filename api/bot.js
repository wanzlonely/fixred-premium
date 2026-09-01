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

  const text = `👑 <b>WALZY EXECUTIVE DASHBOARD</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nSelamat datang kembali, <b>${dispName}</b>!\n\n<blockquote>📊 <b>METRIK UTAMA SISTEM</b>\n├ Total Pendapatan: <code>Rp ${totalRev.toLocaleString('id-ID')}</code>\n├ Pengguna Terdaftar: <code>${validUsersCount} User</code>\n└ Pending Deposit: <code>${pendingCount} Transaksi</code></blockquote>\n\n💡 <i>Gunakan menu di bawah untuk mengelola sistem.</i>`;

  const keyboard = [
    [
      { text: '🛠️ Fix Merah', callback_data: 'fix_merah' }
    ],
    [
      { text: '🌐 Buka WebApp Admin Studio', web_app: { url: webappUrl } }
    ],
    [
      { text: `📥 Cek Pending (${pendingCount})`, callback_data: 'owner_check_pending' },
      { text: '❓ Pusat Bantuan', callback_data: 'help' }
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

  const text = `⚡ <b>WALZY STORE OFFICIAL PLATFORM</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nHalo <b>${dispName}</b>!\n\n<blockquote>👤 <b>RINGKASAN AKUN</b>\n├ ID Telegram: <code>${chatId}</code>\n├ Peringkat: ${rnk.icon} <code>${rnk.name}</code>\n├ Saldo Poin: 🪙 <code>${user.points || 0} PTS</code>\n├ Kuota Harian: ⚡ <b>${remainingQuota}</b>\n└ Status Layanan: <b>${statusBadge}</b></blockquote>\n\n💡 <i>Klik <b>Fix Merah</b> untuk memulai sinkronisasi nomor target!</i>`;

  const keyboard = [
    [
      { text: '🛠️ Fix Merah', callback_data: 'fix_merah' }
    ],
    [
      { text: '🌐 Buka Mini Web Walzy Store', web_app: { url: webappUrl } }
    ],
    [
      { text: '🎁 Daily Check-in', callback_data: 'user_checkin_info' },
      { text: '💬 Customer Support', callback_data: 'contact_owner' }
    ],
    [
      { text: '❓ Pusat Bantuan', callback_data: 'help' }
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
        await bot.answerCallbackQuery(qId, { text: '🛠️ Modul Fix Merah Aktif', show_alert: false });
        if (user) {
          user.state = { action: 'awaiting_fixmerah_number' };
          await saveDB(db);
        }
        await bot.sendMessage(uid, `🛠️ <b>MODUL SINKRONISASI FIX MERAH WALZY</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nSilakan kirimkan nomor WhatsApp target yang ingin diproses.\nContoh: <code>+628123456789</code>`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (data === 'owner_check_pending') {
        await bot.answerCallbackQuery(qId, { text: '📑 Membuka daftar pending...', show_alert: false });
        const allPayments = Object.values(db.payments || {});
        const pending = allPayments.filter(p => p.status === 'waiting_approval' || p.status === 'pending');

        if (pending.length === 0) {
          await bot.sendMessage(uid, `🟢 <b>TIDAK ADA PENDING DEPOSIT</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nSaat ini antrean transaksi bersih.`, { parse_mode: 'HTML' });
        } else {
          let listTxt = pending.slice(0, 5).map(p => `• <b>${p.id}</b> | User: <code>${p.userId}</code> | Paket: ${p.days} Hari (${p.amountFormatted})`).join('\n');
          await bot.sendMessage(uid, `📥 <b>PENDING INVOICES (${pending.length})</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n${listTxt}\n\n<i>Buka WebApp Admin Studio untuk approval.</i>`, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: '🌐 Buka WebApp Admin', web_app: { url: webappUrl } }]] }
          });
        }
        return res.status(200).send('OK');
      }

      if (data === 'user_checkin_info') {
        await bot.answerCallbackQuery(qId, { text: '🎁 Info Check-in', show_alert: false });
        await bot.sendMessage(uid, `🎁 <b>DAILY CHECK-IN VAULT</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nKlaim poin harian melalui WebApp:\n\n<blockquote>• Hari 1: +30 PTS\n• Hari 2: +50 PTS\n• Hari 3: +75 PTS\n• Hari 4: +100 PTS\n• Hari 5: +150 PTS\n• Hari 6: +200 PTS\n• Hari 7: +350 PTS</blockquote>\n\n<i>Poin dapat kamu tukarkan dengan Akses VIP Gratis!</i>`, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🌐 Claim Poin di WebApp', web_app: { url: webappUrl } }]] }
        });
        return res.status(200).send('OK');
      }

      if (data === 'help') {
        await bot.answerCallbackQuery(qId, { text: '✨ Bantuan', show_alert: false });
        await bot.sendMessage(uid, `❓ <b>PANDUAN PENGGUNAAN WALZY STORE</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nSelamat datang! Berikut langkah penggunaan fitur:\n\n1. <b>Fix Merah:</b> Kirim nomor target melalui tombol utama.\n2. <b>Beli VIP:</b> Buka Mini Web -> Halaman <b>Order VIP</b>.\n3. <b>Redeem Voucher:</b> Masukkan kode voucher promo di Mini Web.\n4. <b>Daily Spin & Points:</b> Putar Spin & Check-in harian untuk poin gratis.`, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🌐 Buka Mini Web Walzy Store', web_app: { url: webappUrl } }]] }
        });
        return res.status(200).send('OK');
      }

      if (data === 'contact_owner') {
        await bot.answerCallbackQuery(qId, { text: '💬 Support Mode Active', show_alert: false });
        if (user) {
          user.state = { action: 'awaiting_owner_msg' };
          await saveDB(db);
        }
        await bot.sendMessage(uid, `💬 <b>HUBUNGI CUSTOMER SUPPORT</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nTuliskan pertanyaan Anda. Pesan akan langsung diteruskan ke Operator.`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (data.startsWith('reply_user_')) {
        await bot.answerCallbackQuery(qId);
        const targetUserId = data.replace('reply_user_', '');
        if (user) {
          user.state = { action: 'replying_to_user', targetId: targetUserId };
          await saveDB(db);
        }
        await bot.sendMessage(uid, `✏️ <b>BALAS USER (${targetUserId})</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nKetik pesan balasan resmi Anda.`, { parse_mode: 'HTML' });
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
          await bot.sendMessage(chatId, `❌ <b>Format nomor tidak valid!</b> Silakan masukkan angka nomor telepon yang benar.`, { parse_mode: 'HTML' });
          return res.status(200).send('OK');
        }

        const isPrem = isPremium(user);
        if (!isPrem) {
          if (!user.dailyFix || user.dailyFix.date !== getTodayString()) {
            user.dailyFix = { date: getTodayString(), count: 0 };
          }
          if (user.dailyFix.count >= 5) {
            await saveDB(db);
            await bot.sendMessage(chatId, `⚠️ <b>KUOTA HARIAN HABIS</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nKuota gratis Fix Merah Anda hari ini sudah mencapai batas maksimum <b>(5/5)</b>.\n\n💡 <i>Tingkatkan akun Anda ke <b>VIP Member</b> di Mini Web untuk kuota Tanpa Batas (Unlimited)!</i>`, {
              parse_mode: 'HTML',
              reply_markup: { inline_keyboard: [[{ text: '💎 Upgrade VIP Unlimited', web_app: { url: webappUrl } }]] }
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

        const initialMsgTxt = `🛠️ <b>HASIL PROSES FIXMERAH</b>\n◈────────────────────◈\n<blockquote>✅ <b>BERHASIL ( 1 )</b>\n📱 <code>${displayNum}</code>\n🆔 <code>${sessionCode}</code>\n📩 TERKIRIM</blockquote>\n\nNotifikasi update status akan dikirim otomatis jika ada balasan. 🔥`;

        await bot.sendMessage(chatId, initialMsgTxt, { parse_mode: 'HTML' });

        const statusRes = await clientHelper.monitorTargetResponse(displayNum, sessionCode, 5000);

        if (statusRes.status === 'SUCCESS') {
          const succReport = `✅ <b>SUCCESS FIXMERAH CPHX</b>\n◈────────────────────◈\n<blockquote>📱 Nomor: <code>${displayNum}</code>\n🆔 ID: <code>${sessionCode}</code>\n📩 Status: <b>SUCCESS</b></blockquote>\n\n💬 <i>WhatsApp sudah merespon. Silakan coba login/verifikasi akun Anda sekarang!</i>`;
          await bot.sendMessage(chatId, succReport, { parse_mode: 'HTML' });
        } else {
          const failReport = `⚠️ <b>BELUM ADA RESPONS WHATSAPP</b>\n◈────────────────────◈\n<blockquote>📱 Nomor: <code>${displayNum}</code>\n🆔 ID: <code>${sessionCode}</code>\n📩 Status: <b>TIDAK ADA BALASAN</b></blockquote>\n\n💬 <i>WhatsApp belum merespon. Silakan periksa berkala.</i>`;
          await bot.sendMessage(chatId, failReport, { parse_mode: 'HTML' });
        }

        return res.status(200).send('OK');
      }

      if (st && st.action === 'awaiting_owner_msg' && text && !text.startsWith('/')) {
        user.state = null;
        await saveDB(db);

        for (let ownerId of (config.OWNER_IDS || [])) {
          try {
            await bot.sendMessage(ownerId, `📨 <b>PESAN MASUK USER</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n👤 Pengirim: <b>${esc(user.first_name)}</b>\n🆔 User ID: <code>${uid}</code>\n💬 Pesan:\n${esc(text)}`, {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [[{ text: `💬 Balas User (${uid})`, callback_data: `reply_user_${uid}` }]]
              }
            });
          } catch (e) {}
        }
        await bot.sendMessage(chatId, `✅ <b>PESAN BERHASIL TERKIRIM!</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nPesan Anda telah diteruskan ke Customer Service. Harap menunggu balasan.`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (st && st.action === 'replying_to_user' && text && !text.startsWith('/') && isOwner(uid)) {
        const targetId = st.targetId;
        user.state = null;
        await saveDB(db);

        try {
          await bot.sendMessage(targetId, `💬 <b>BALASAN OPERATOR WALZY</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n${esc(text)}`, { parse_mode: 'HTML' });
          await bot.sendMessage(chatId, `✅ Balasan berhasil dikirim ke user ID <code>${targetId}</code>!`, { parse_mode: 'HTML' });
        } catch (e) {
          await bot.sendMessage(chatId, `❌ Gagal mengirim balasan ke user.`, { parse_mode: 'HTML' });
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
                await bot.sendMessage(refId, `🎉 <b>REFERRAL BARU!</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n<b>${esc(user.first_name)}</b> bergabung melalui link Anda!\nBonus Poin: 🪙 <b>+50 PTS</b>`, { parse_mode: 'HTML' });
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
