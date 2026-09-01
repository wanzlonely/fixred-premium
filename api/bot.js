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

  const text = `👑 <b>WALZY EXECUTIVE DASHBOARD</b>
━━━━━━━━━━━━━━━━━━━━━━━

Selamat datang kembali, <b>${dispName}</b>! 🎯

<blockquote>📊 <b>METRIK UTAMA SISTEM</b>
├ Total Pendapatan: <code>Rp ${totalRev.toLocaleString('id-ID')}</code>
├ Pengguna Terdaftar: <code>${validUsersCount} User</code>
└ Pending Deposit: <code>${pendingCount} Transaksi</code></blockquote>

<i>Kelola sistem bisnis Anda dengan mudah di WebApp Admin.</i>`;

  const keyboard = [
    [
      { text: '🛠️ Fix Merah', callback_data: 'fix_merah' }
    ],
    [
      { text: '🌐 Buka WebApp Admin Studio', web_app: { url: webappUrl } }
    ],
    [
      { text: `📥 Pending (${pendingCount})`, callback_data: 'owner_check_pending' },
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

  const text = `⚡ <b>WALZY STORE - PLATFORM OFFICIAL</b>
━━━━━━━━━━━━━━━━━━━━━━━

Halo <b>${dispName}</b>! 👋

<blockquote>👤 <b>RINGKASAN AKUN ANDA</b>
├ ID Telegram: <code>${chatId}</code>
├ Peringkat: ${rnk.icon} <code>${rnk.name}</code>
├ Saldo Poin: 🪙 <code>${user.points || 0} PTS</code>
├ Kuota Harian: ⚡ <b>${remainingQuota}</b>
└ Status Layanan: <b>${statusBadge}</b></blockquote>

💡 <i>Klik tombol <b>Fix Merah</b> untuk memulai atau buka Mini Web untuk akses penuh!</i>`;

  const keyboard = [
    [
      { text: '🛠️ Fix Merah', callback_data: 'fix_merah' }
    ],
    [
      { text: '🌐 Mini Web Walzy Store', web_app: { url: webappUrl } }
    ],
    [
      { text: '🎁 Daily Rewards', callback_data: 'user_checkin_info' },
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
        await bot.sendMessage(uid, `🛠️ <b>MODUL SINKRONISASI FIX MERAH WALZY</b>
━━━━━━━━━━━━━━━━━━━━━━━

Silakan kirimkan nomor WhatsApp target yang ingin diproses.
Contoh: <code>+628123456789</code>`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (data === 'owner_check_pending') {
        await bot.answerCallbackQuery(qId, { text: '📑 Membuka daftar pending...', show_alert: false });
        const allPayments = Object.values(db.payments || {});
        const pending = allPayments.filter(p => p.status === 'waiting_approval' || p.status === 'pending');
        
        if (pending.length > 0) {
          var pendingText = `📋 <b>PENDING DEPOSIT (${pending.length})</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
          pending.slice(0, 5).forEach(p => {
            pendingText += `💰 <b>Rp ${(p.amount || 0).toLocaleString('id-ID')}</b> | User: ${p.userId}\n<i>${new Date(p.createdAt).toLocaleString('id-ID')}</i>\n\n`;
          });
          await bot.sendMessage(uid, pendingText, {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: '🌐 Buka WebApp Admin', web_app: { url: webappUrl } }]] }
          });
        } else {
          await bot.sendMessage(uid, '✅ <b>TIDAK ADA PENDING</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n\nSemua transaksi sudah diproses!', {
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [[{ text: '🌐 Buka WebApp Admin', web_app: { url: webappUrl } }]] }
          });
        }
        return res.status(200).send('OK');
      }

      if (data === 'user_checkin_info') {
        await bot.answerCallbackQuery(qId, { text: '🎁 Info Daily Rewards', show_alert: false });
        await bot.sendMessage(uid, `🎁 <b>DAILY CHECK-IN VAULT</b>
━━━━━━━━━━━━━━━━━━━━━━━

Klaim poin harian melalui WebApp:

<blockquote>• Hari 1: +30 PTS
• Hari 2: +50 PTS
• Hari 3: +75 PTS
• Hari 4: +100 PTS
• Hari 5: +150 PTS
• Hari 6: +200 PTS
• Hari 7: +350 PTS</blockquote>

<i>💡 Poin dapat ditukar dengan Akses VIP Gratis!</i>`, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🌐 Claim Poin di WebApp', web_app: { url: webappUrl } }]] }
        });
        return res.status(200).send('OK');
      }

      if (data === 'help') {
        await bot.answerCallbackQuery(qId, { text: '✨ Bantuan', show_alert: false });
        const isOwnerUser = isOwner(uid);
        const helpText = isOwnerUser ? 
          `❓ <b>PANDUAN OWNER WALZY STORE</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>📊 Dashboard Owner:</b>
1. Kelola semua order dan pembayaran
2. Monitor statistik revenue
3. Buat & kelola voucher promo
4. Broadcast pesan ke semua user

<b>🎯 Fitur Utama:</b>
• Approve/Reject pembayaran pending
• Lihat data pengguna & aktivitas
• Analisis performa bisnis
• Kirim notifikasi massal` :
          `❓ <b>PANDUAN PENGGUNAAN WALZY STORE</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>🛠️ Cara Menggunakan:</b>
1. Klik <b>Fix Merah</b> untuk proses nomor
2. Tunggu respons dari sistem
3. Buka Mini Web untuk akses penuh

<b>💎 Tingkat VIP:</b>
• Kuota unlimited untuk Fix Merah
• Daily bonus points lebih besar
• Priority support

<b>🪙 Poin & Reward:</b>
• Check-in harian → bonus poin
• Referral → bonus poin
• Tukar poin dengan VIP gratis`;

        await bot.sendMessage(uid, helpText, {
          parse_mode: 'HTML',
          reply_markup: { inline_keyboard: [[{ text: '🌐 Buka Mini Web', web_app: { url: webappUrl } }]] }
        });
        return res.status(200).send('OK');
      }

      if (data === 'contact_owner') {
        await bot.answerCallbackQuery(qId, { text: '💬 Support Mode Aktif', show_alert: false });
        userState.set(String(uid), { action: 'awaiting_owner_msg' });
        await bot.sendMessage(uid, `💬 <b>HUBUNGI CUSTOMER SUPPORT</b>
━━━━━━━━━━━━━━━━━━━━━━━

Tuliskan pertanyaan atau keluhan Anda. Pesan akan langsung diteruskan ke Operator Walzy.`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (data.startsWith('reply_user_')) {
        await bot.answerCallbackQuery(qId);
        const targetUserId = data.replace('reply_user_', '');
        userState.set(String(uid), { action: 'replying_to_user', targetId: targetUserId });
        await bot.sendMessage(uid, `✏️ <b>BALAS USER (${targetUserId})</b>
━━━━━━━━━━━━━━━━━━━━━━━

Ketik pesan balasan resmi Anda:`, { parse_mode: 'HTML' });
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
          await bot.sendMessage(chatId, `❌ <b>Format nomor tidak valid!</b>\n\nSilakan masukkan angka nomor telepon yang benar.`, { parse_mode: 'HTML' });
          return res.status(200).send('OK');
        }

        const isPrem = isPremium(user);
        if (!isPrem) {
          if (!user.dailyFix || user.dailyFix.date !== getTodayString()) {
            user.dailyFix = { date: getTodayString(), count: 0 };
          }
          if (user.dailyFix.count >= 5) {
            await bot.sendMessage(chatId, `⚠️ <b>KUOTA HARIAN HABIS</b>
━━━━━━━━━━━━━━━━━━━━━━━

Kuota gratis Fix Merah Anda hari ini sudah mencapai batas maksimum <b>(5/5)</b>.

💡 <i>Tingkatkan akun Anda ke <b>VIP Member</b> di Mini Web untuk kuota Tanpa Batas (Unlimited)!</i>`, {
              parse_mode: 'HTML',
              reply_markup: { inline_keyboard: [[{ text: '💎 Upgrade VIP Unlimited', web_app: { url: webappUrl } }]] }
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

        const initialMsgTxt = `🛠️ <b>HASIL PROSES FIXMERAH</b>
◈────────────────────◈
<blockquote>✅ <b>BERHASIL ( 1 )</b>
📱 <code>${displayNum}</code>
🆔 <code>${sessionCode}</code>
📩 TERKIRIM</blockquote>

⏳ Menunggu respons sistem...`;

        await bot.sendMessage(chatId, initialMsgTxt, { parse_mode: 'HTML' });

        const statusRes = await clientHelper.monitorTargetResponse(displayNum, sessionCode, 6000);

        if (statusRes.status === 'SUCCESS') {
          const succReport = `✅ <b>SUCCESS FIXMERAH CPHX</b>
◈────────────────────◈
<blockquote>📱 Nomor: <code>${displayNum}</code>
🆔 ID: <code>${sessionCode}</code>
📩 Status: <b>SUCCESS</b></blockquote>

🎉 <i>WhatsApp sudah merespon. Silakan coba login/verifikasi akun Anda sekarang!</i>`;
          await bot.sendMessage(chatId, succReport, { parse_mode: 'HTML' });
        } else {
          const failReport = `⚠️ <b>BELUM ADA RESPONS WHATSAPP</b>
◈────────────────────◈
<blockquote>📱 Nomor: <code>${displayNum}</code>
🆔 ID: <code>${sessionCode}</code>
📩 Status: <b>TIDAK ADA BALASAN</b></blockquote>

💬 <i>WhatsApp belum merespon. Silakan periksa berkala atau hubungi support.</i>`;
          await bot.sendMessage(chatId, failReport, { parse_mode: 'HTML' });
        }

        return res.status(200).send('OK');
      }

      if (st && st.action === 'awaiting_owner_msg' && text) {
        userState.delete(String(uid));
        for (let ownerId of (config.OWNER_IDS || [])) {
          try {
            await bot.sendMessage(ownerId, `📨 <b>PESAN MASUK USER</b>
━━━━━━━━━━━━━━━━━━━━━━━

👤 Pengirim: <b>${esc(user.first_name)}</b>
🆔 User ID: <code>${uid}</code>
💬 Pesan:
${esc(text)}`, {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [[{ text: `💬 Balas User (${uid})`, callback_data: `reply_user_${uid}` }]]
              }
            });
          } catch (e) {}
        }
        await bot.sendMessage(chatId, `✅ <b>PESAN BERHASIL TERKIRIM!</b>
━━━━━━━━━━━━━━━━━━━━━━━

Pesan Anda telah diteruskan ke Customer Service. Harap menunggu balasan.`, { parse_mode: 'HTML' });
        return res.status(200).send('OK');
      }

      if (st && st.action === 'replying_to_user' && text && isOwner(uid)) {
        userState.delete(String(uid));
        try {
          await bot.sendMessage(st.targetId, `💬 <b>BALASAN OPERATOR WALZY</b>
━━━━━━━━━━━━━━━━━━━━━━━

${esc(text)}`, { parse_mode: 'HTML' });
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
                await bot.sendMessage(refId, `🎉 <b>REFERRAL BARU!</b>
━━━━━━━━━━━━━━━━━━━━━━━

<b>${esc(user.first_name)}</b> bergabung melalui link Anda! 🥳
Bonus Poin: 🪙 <b>+50 PTS</b>`, { parse_mode: 'HTML' });
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
