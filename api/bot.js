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

  const text = `👑 <b>WALZY EXECUTIVE CONTROL</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n🛡️ <b>OPERATOR AKUN</b>\n├ Operator: <b>${dispName}</b>\n├ User ID: <code>${chatId}</code>\n└ Status Server: 🟢 <code>ONLINE</code>\n\n📊 <b>RINGKASAN METRIK</b>\n├ 💰 Total Pendapatan: <code>Rp ${totalRev.toLocaleString('id-ID')}</code>\n├ 👥 Total Pengguna: <code>${validUsersCount} User</code>\n└ ⏳ Pending Deposit: <code>${pendingCount} Transaksi</code>\n\n💡 <i>Klik tombol <b>Fix Merah</b> di bawah untuk memproses nomor WhatsApp target secara instan.</i>`;

  const keyboard = [
    [
      { text: '🛠️ Fix Merah (Utama)', callback_data: 'fix_merah' }
    ],
    [
      { text: '🌐 Buka Mini Web Admin', web_app: { url: webappUrl } }
    ],
    [
      { text: `📥 Cek Pending ${pendingCount}`, callback_data: 'owner_check_pending' },
      { text: '❓ Pusat Bantuan', callback_data: 'help' }
    ]
  ];

  return { text, opts: { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } } };
}

function getUserMenu(user, chatId, webappUrl) {
  const rnk = getRank(user.referralCount || 0);
  const isPrem = isPremium(user);
  const statusBadge = isPrem ? `💎 <b>VIP MEMBER (${getPremiumLeft(user)} Hari)</b>` : `🎫 <b>FREE MEMBER</b>`;
  const dispName = esc(user.first_name || 'User Walzy');

  const text = `⚡ <b>WALZY PLATFORM STORE</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n👤 <b>IDENTITAS AKUN</b>\n├ Nama Pengguna: <b>${dispName}</b>\n├ ID Telegram: <code>${chatId}</code>\n├ Peringkat: ${rnk.icon} <code>${rnk.name}</code>\n└ Saldo Poin: 🪙 <code>${user.points || 0} PTS</code>\n\n🛡️ <b>STATUS LAYANAN VIP</b>\n├ Status Akun: ${statusBadge}\n└ Sistem Database: 🟢 <code>ONLINE</code>\n\n💡 <i>Klik tombol <b>Fix Merah</b> di bawah untuk langsung menggunakan layanan sinkronisasi target!</i>`;

  const keyboard = [
    [
      { text: '🛠️ Fix Merah', callback_data: 'fix_merah' }
    ],
    [
      { text: '🌐 Buka Mini Web Walzy Store', web_app: { url: webappUrl } }
    ],
    [
      { text: '🎁 Daily Check-in', callback_data: 'user_checkin_info' },
      { text: '💬 Hubungi Owner', callback_data: 'contact_owner' }
    ],
    [
      { text: '❓ Pusat Bantuan', callback_data: 'help' }
    ]
  ];

  return { text, opts: { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } } };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(200).send('Bot API Ready');

  const TelegramBot = require('node-telegram-bot-api');
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
        await bot.answerCallbackQuery(qId, { text: '🛠️ Membuka Modul Fix Merah', show_alert: false });
        userState.set(String(uid), { action: 'awaiting_fixmerah_number' });
        await bot.sendMessage(uid, `🛠️ <b>MODULE SINKRONISASI FIX MERAH</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nSilakan kirimkan nomor WhatsApp target yang ingin diproses (Format: <code>+628123456789</code>):`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (data === 'owner_check_pending') {
        await bot.answerCallbackQuery(qId, { text: '📑 Membuka daftar pending...', show_alert: false });
        const allPayments = Object.values(db.payments || {});
        const pending = allPayments.filter(p => p.status === 'waiting_approval' || p.status === 'pending');

        if (pending.length === 0) {
          await bot.sendMessage(uid, `🟢 <b>TIDAK ADA PENDING DEPOSIT</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nSaat ini tidak ada transaksi pembeli yang menunggu verifikasi.`, { parse_mode: 'HTML' });
        } else {
          let listTxt = pending.slice(0, 5).map(p => `• <b>${p.id}</b> | User: <code>${p.userId}</code> | Paket: ${p.days} Hari (${p.amountFormatted})`).join('\n');
          await bot.sendMessage(uid, `📥 <b>DAFTAR PENDING TRANSAKSI (${pending.length})</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n${listTxt}\n\n<i>Buka Mini Web Studio Admin untuk menyetujui / menolak pembayaran.</i>`, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: '🌐 Buka Mini Web Admin', web_app: { url: webappUrl } }]] }
          });
        }
        return res.status(200).send('OK');
      }

      if (data === 'user_checkin_info') {
        await bot.answerCallbackQuery(qId, { text: '🎁 Info Check-in', show_alert: false });
        await bot.sendMessage(uid, `🎁 <b>DAILY CHECK-IN & POINT STORE</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nKumpulkan poin harian gratis di Mini Web!\n• Hari 1: +30 PTS\n• Hari 2: +50 PTS\n• Hari 3: +75 PTS\n• Hari 4: +100 PTS\n• Hari 5: +150 PTS\n• Hari 6: +200 PTS\n• Hari 7: +350 PTS\n\n<i>Poin dapat kamu tukarkan dengan Akses VIP Gratis di Mini Web!</i>`, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🌐 Buka Mini Web Check-in', web_app: { url: webappUrl } }]] }
        });
        return res.status(200).send('OK');
      }

      if (data === 'help') {
        await bot.answerCallbackQuery(qId, { text: '✨ Pusat Bantuan', show_alert: false });
        await bot.sendMessage(uid, `❓ <b>PUSAT BANTUAN & PANDUAN LENGKAP</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nSelamat datang di <b>Walzy Store Platform</b>! Berikut panduan penggunaan bot & WebApp:\n\n📍 <b>1. CARA BELI AKSES VIP:</b>\n• Buka menu <b>Mini Web</b> di bawah.\n• Pilih tab <b>Order VIP</b> untuk melihat katalog.\n• Klik beli pada paket yang diinginkan.\n• Transfer sesuai nominal & unggah foto bukti pembayaran.\n\n🎟️ <b>2. CARA REDEEM VOUCHER PROMO:</b>\n• Buka <b>Mini Web</b> -> Halaman <b>Home</b>.\n• Masukkan kode voucher di kolom "Redeem Kode Voucher".\n\n🎁 <b>3. DAILY CHECK-IN & SPIN WHEEL:</b>\n• Kunjungi tab <b>Check-in</b> untuk klaim poin harian bertingkat.\n• Putar <b>Spin Wheel Keberuntungan</b> di halaman Home.\n\n💬 <b>4. LAYANAN CUSTOMER SERVICE:</b>\n• Tekan <b>Hubungi Owner</b> untuk layanan bantuan cepat.`, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '🌐 Buka Mini Web Walzy Store', web_app: { url: webappUrl } }]]
          }
        });
        return res.status(200).send('OK');
      }

      if (data === 'contact_owner') {
        await bot.answerCallbackQuery(qId, { text: '💬 Mode Support Aktif', show_alert: false });
        userState.set(String(uid), { action: 'awaiting_owner_msg' });
        await bot.sendMessage(uid, `💬 <b>HUBUNGI OWNER / CUSTOMER SERVICE</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nSilakan ketikkan pesan Anda di bawah ini. Pesan akan diteruskan langsung ke Owner.`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (data.startsWith('reply_user_')) {
        await bot.answerCallbackQuery(qId);
        const targetUserId = data.replace('reply_user_', '');
        userState.set(String(uid), { action: 'replying_to_user', targetId: targetUserId });
        await bot.sendMessage(uid, `✏️ <b>BALAS PESAN USER (${targetUserId})</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nSilakan ketik pesan balasan yang ingin dikirimkan ke pengguna.`, { parse_mode: 'HTML' });
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
        let rawNum = text.replace(/[^\d+]/g, '');
        if (!rawNum.startsWith('+')) {
          if (rawNum.startsWith('08')) rawNum = '+62' + rawNum.slice(1);
          else if (rawNum.startsWith('62')) rawNum = '+' + rawNum;
          else rawNum = '+' + rawNum;
        }

        const sessionCode = `CPHX ${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

        const waitMsg = await bot.sendMessage(chatId, `🔄 <b>PROSES SINKRONISASI FIX MERAH...</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n📱 Nomor Target: <code>${rawNum}</code>\n🔑 ID Sesi: <code>${sessionCode}</code>\n<i>Menghubungkan ke server target...</i>`, { parse_mode: 'HTML' });

        const clientHelper = require('../lib/client');
        await clientHelper.sendToTarget(rawNum);

        try { await bot.deleteMessage(chatId, waitMsg.message_id); } catch(e) {}

        const statusRes = await clientHelper.monitorTargetResponse(rawNum, sessionCode, 75000);

        if (statusRes.status === 'SUCCESS') {
          const succReport = `<b>✅ SUCCESS FIXMERAH CPHX</b>\n◈────────────────────◈\n📱 Nomor: <code>${rawNum}</code>\n🆔 ID: <code>${sessionCode}</code>\n📩 Status: <b>SUCCESS</b>\n\n💬 WhatsApp sudah merespon. Silakan coba login/verifikasi akun Anda sekarang!`;
          await bot.sendMessage(chatId, succReport, { parse_mode: 'HTML' });
        } else {
          const failReport = `<b>⚠️ BELUM ADA RESPONS WHATSAPP</b>\n◈────────────────────◈\n📱 Nomor: <code>${rawNum}</code>\n🆔 ID: <code>${sessionCode}</code>\n📩 Status: <b>TIDAK ADA BALASAN</b>\n\n💬 WhatsApp tidak merespon dalam 90 detik.`;
          await bot.sendMessage(chatId, failReport, { parse_mode: 'HTML' });
        }

        return res.status(200).send('OK');
      }

      if (st && st.action === 'awaiting_owner_msg' && text) {
        userState.delete(String(uid));
        for (let ownerId of config.OWNER_IDS) {
          try {
            await bot.sendMessage(ownerId, `📨 <b>PESAN MASUK USER</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n👤 Pengirim: <b>${esc(user.first_name)}</b>\n🆔 User ID: <code>${uid}</code>\n💬 Pesan:\n${esc(text)}`, {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [[{ text: `💬 Balas User (${uid})`, callback_data: `reply_user_${uid}` }]]
              }
            });
          } catch (e) {}
        }
        await bot.sendMessage(chatId, `✅ <b>PESAN BERHASIL TERKIRIM!</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nPesan Anda telah diteruskan ke Owner. Harap menunggu balasan.`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (st && st.action === 'replying_to_user' && text && isOwner(uid)) {
        userState.delete(String(uid));
        try {
          await bot.sendMessage(st.targetId, `💬 <b>BALASAN RESMI OWNER</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n${esc(text)}`, { parse_mode: 'HTML' });
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
                await bot.sendMessage(refId, `🎉 <b>REFERRAL BARU BERGABUNG!</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n<b>${esc(user.first_name)}</b> telah bergabung menggunakan link Anda!\nBonus Saldo: 🪙 <b>+50 PTS</b>`, { parse_mode: 'HTML' });
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
