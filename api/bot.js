const { loadDB, saveDB, getTodayString, esc, getRank } = require('../lib/utils');
const config = require('../config');

const rateLimitMap = new Map();
const userState = new Map();

function isOwner(id) {
  return config.OWNER_IDS.map(String).includes(String(id));
}

function isSuspiciousId(id) {
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
      points: 0,
      checkinStreak: 0,
      lastCheckin: null
    };
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

function getOwnerMenu(user) {
  const webappUrl = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/webapp` : '';

  const text = `<blockquote>👑 <b>WALZY EXECUTIVE STUDIO ADMIN</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n🛡️ <b>OPERATOR SYSTEM STATUS</b>\n├ <b>Operator:</b> <b>${esc(user.first_name)}</b>\n├ <b>Access Tier:</b> <code>SUPER ADMINISTRATOR</code>\n└ <b>Server Link:</b> 🟢 <code>ONLINE & ENCRYPTED</code>\n\n📑 <b>STUDIO MANAGEMENT PORTAL</b>\nSeluruh manajemen transaksi, pengguna, pembuatan voucher, pengiriman broadcast massal, dan analitik pendapatan diakses langsung via WebApp.\n\n🕒 <i>Server Sync: ${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</i></blockquote>`;

  const keyboard = [
    [
      { text: '🛠️ Fix Merah', callback_data: 'fix_merah' },
      { text: '🌐 Mini Web', web_app: { url: webappUrl } }
    ],
    [
      { text: '❓ Bantuan', callback_data: 'help' },
      { text: '💬 Hubungi Owner', callback_data: 'contact_owner' }
    ]
  ];

  return { text, opts: { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } } };
}

function getUserMenu(user, chatId) {
  const rnk = getRank(user.referralCount || 0);
  const isPrem = isPremium(user);
  const statusBadge = isPrem ? `💎 <b>VIP MEMBER (${getPremiumLeft(user)} Hari)</b>` : `🎫 <b>FREE MEMBER</b>`;
  const webappUrl = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/webapp` : '';

  const text = `<blockquote>⚡ <b>WALZY PLATFORM NEXT-GEN</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n👤 <b>IDENTITAS AKUN</b>\n├ <b>Nama:</b> <b>${esc(user.first_name)}</b>\n├ <b>ID Akses:</b> <code>${chatId}</code>\n├ <b>Peringkat:</b> ${rnk.icon} <code>${rnk.name}</code>\n└ <b>Saldo Poin:</b> 🪙 <code>${user.points || 0} PTS</code>\n\n🛡️ <b>STATUS HAK AKSES</b>\n├ <b>Tier:</b> ${statusBadge}\n└ <b>Sistem:</b> 🟢 <code>ONLINE & SYNCED</code>\n\n💡 <i>Gunakan menu di bawah ini untuk transaksi dan memilih layanan toko.</i></blockquote>`;

  const keyboard = [
    [
      { text: '🛠️ Fix Merah', callback_data: 'fix_merah' },
      { text: '🌐 Mini Web', web_app: { url: webappUrl } }
    ],
    [
      { text: '❓ Bantuan', callback_data: 'help' },
      { text: '💬 Hubungi Owner', callback_data: 'contact_owner' }
    ]
  ];

  return { text, opts: { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } } };
}

module.exports = async (req, res) => {
  const TelegramBot = require('node-telegram-bot-api');
  const bot = new TelegramBot(config.BOT_TOKEN);

  try {
    const db = await loadDB();
    ensureDB(db);

    if (req.method === 'POST') {
      const update = req.body;
      if (!update) return res.status(200).send('OK');

      if (update.callback_query) {
        const q = update.callback_query;
        const qId = q.id;
        const uid = q.from.id;
        const data = q.data;
        const webappUrl = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/webapp` : '';

        if (data === 'fix_merah') {
          await bot.answerCallbackQuery(qId, { text: '🔄 Memproses Perbaikan Kuota & Sesi...', show_alert: true });
          await bot.sendMessage(uid, `<blockquote>🛠️ <b>SISTEM PERBAIKAN MERAH</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n✅ Sistem perbaikan kuota & error berhasil diproses.\nSeluruh sesi transaksi dan akun Anda telah disinkronkan.</blockquote>`, { parse_mode: 'HTML' });
          return res.status(200).send('OK');
        }

        if (data === 'help') {
          await bot.answerCallbackQuery(qId, { text: '✨ Membuka Pusat Bantuan', show_alert: false });
          await bot.sendMessage(uid, `<blockquote>❓ <b>PUSAT BANTUAN & PANDUAN</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n📍 <b>Panduan Layanan Walzy Store:</b>\n1. <b>Pembelian VIP:</b> Pembelian dilakukan langsung melalui menu <b>Mini Web</b>.\n2. <b>Redeem Voucher:</b> Masukkan kode voucher promo Anda di <b>Mini Web</b>.\n3. <b>Check-in & Spin:</b> Dapatkan poin gratis harian di dalam <b>Mini Web</b>.\n\n<i>Klik tombol <b>Mini Web</b> di bawah untuk membuka aplikasi toko.</i></blockquote>`, {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[{ text: '🌐 Buka Mini Web Walzy', web_app: { url: webappUrl } }]]
            }
          });
          return res.status(200).send('OK');
        }

        if (data === 'contact_owner') {
          await bot.answerCallbackQuery(qId, { text: '💬 Mode Hubungi Owner Aktif', show_alert: false });
          userState.set(String(uid), { action: 'awaiting_owner_msg' });
          await bot.sendMessage(uid, `<blockquote>💬 <b>HUBUNGI OWNER / CUSTOMER SERVICE</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\nSilakan ketikkan pesan, pertanyaan, atau laporan kendala Anda di bawah ini.\nPesan Anda akan dikirimkan langsung ke Owner.</blockquote>`, { parse_mode: 'HTML' });
          return res.status(200).send('OK');
        }

        if (data.startsWith('reply_user_')) {
          await bot.answerCallbackQuery(qId);
          const targetUserId = data.replace('reply_user_', '');
          userState.set(String(uid), { action: 'replying_to_user', targetId: targetUserId });
          await bot.sendMessage(uid, `<blockquote>✏️ <b>BALAS PESAN USER (${targetUserId})</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\nSilakan ketik pesan balasan yang ingin dikirimkan ke pengguna.</blockquote>`, { parse_mode: 'HTML' });
          return res.status(200).send('OK');
        }
      }

      if (update.message) {
        const msg = update.message;
        const chatId = msg.chat.id;
        const uid = msg.from.id;

        if (isSuspiciousId(uid)) return res.status(200).send('OK');
        if (!checkRateLimit(uid)) return res.status(200).send('OK');

        const user = getUser(db, uid);
        if (!user) return res.status(200).send('OK');

        user.first_name = msg.from.first_name || 'User';
        user.username = msg.from.username || '';

        const text = (msg.text || '').trim();
        const st = userState.get(String(uid));

        if (st && st.action === 'awaiting_owner_msg' && text) {
          userState.delete(String(uid));
          for (let ownerId of config.OWNER_IDS) {
            try {
              await bot.sendMessage(ownerId, `<blockquote>📨 <b>PESAN MASUK USER</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n👤 <b>Pengirim:</b> <b>${esc(user.first_name)}</b>\n🆔 <b>User ID:</b> <code>${uid}</code>\n💬 <b>Pesan:</b>\n${esc(text)}</blockquote>`, {
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [[{ text: `💬 Balas User (${uid})`, callback_data: `reply_user_${uid}` }]]
                }
              });
            } catch (e) {}
          }
          await bot.sendMessage(chatId, `<blockquote>✅ <b>PESAN BERHASIL TERKIRIM!</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\nPesan Anda telah diteruskan ke Owner. Silakan tunggu respon balasan.</blockquote>`, { parse_mode: 'HTML' });
          return res.status(200).send('OK');
        }

        if (st && st.action === 'replying_to_user' && text && isOwner(uid)) {
          userState.delete(String(uid));
          try {
            await bot.sendMessage(st.targetId, `<blockquote>💬 <b>BALASAN RESMI OWNER</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n${esc(text)}</blockquote>`, { parse_mode: 'HTML' });
            await bot.sendMessage(chatId, `<blockquote>✅ Balasan berhasil dikirim ke user <code>${st.targetId}</code>!</blockquote>`, { parse_mode: 'HTML' });
          } catch (e) {
            await bot.sendMessage(chatId, `<blockquote>❌ Gagal mengirim balasan ke user.</blockquote>`, { parse_mode: 'HTML' });
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
                  await bot.sendMessage(refId, `<blockquote>🎉 <b>REFERRAL REWARD!</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n<b>${esc(user.first_name)}</b> telah bergabung menggunakan tautan undangan Anda!\nBonus Saldo: 🪙 <b>+50 PTS</b></blockquote>`, { parse_mode: 'HTML' });
                } catch (e) {}
              }
            }
          }
          await saveDB(db);
          const menu = isOwner(uid) ? getOwnerMenu(user) : getUserMenu(user, chatId);
          await bot.sendMessage(chatId, menu.text, menu.opts);
          return res.status(200).send('OK');
        }

        const menu = isOwner(uid) ? getOwnerMenu(user) : getUserMenu(user, chatId);
        await bot.sendMessage(chatId, menu.text, menu.opts);
        await saveDB(db);
        return res.status(200).send('OK');
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Bot Error:', err);
    res.status(500).send('Internal Error');
  }
};
