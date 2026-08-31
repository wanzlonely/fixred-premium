const { loadDB, saveDB, getTodayString, esc, getRank } = require('../lib/utils');
const config = require('../config');

const rateLimitMap = new Map();

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
  if (!db.history) db.history = {};
}

function cleanDB(db) {
  for (let k of Object.keys(db.users)) { if (isSuspiciousId(k)) delete db.users[k]; }
  for (let k of Object.keys(db.payments)) { const p = db.payments[k]; if (p && isSuspiciousId(p.userId)) delete db.payments[k]; }
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

function bq(t) { return `<blockquote>${t}</blockquote>`; }

function getOwnerMenu(user) {
  const webappUrl = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/webapp` : '';

  const text = `⚡️ <b>WALZY OWNER STUDIO PRO</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n${bq(`👑 <b>Owner:</b> ${esc(user.first_name)}\n🛡️ <b>Akses:</b> Administrator Full Studio\n\nSemua fitur utama (Fix Merah, Katalog Order, Kelola User, Generator Voucher, Broadcast Pesan, Analitik Bot) dapat diakses langsung melalui WebApp Studio Owner.`)}\n━━━━━━━━━━━━━━━━━━━━━━━\n🕒 <i>${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</i>`;

  const keyboard = [
    [{ text: '🎨 Buka Studio Owner (WebApp)', web_app: { url: webappUrl } }]
  ];

  return { text, opts: { parse_mode: 'HTML', reply_markup: { inline_keyboard: keyboard } } };
}

function getUserMenu(user, chatId) {
  const rnk = getRank(user.referralCount || 0);
  const status = isPremium(user) ? `💎 <b>VIP (${getPremiumLeft(user)} Hari)</b>` : `🎫 <b>Akses Gratis</b>`;
  const webappUrl = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/webapp` : '';

  const text = `✨ <b>WALZY STORE OFFICIAL</b>\n━━━━━━━━━━━━━━━━━━━━━━━\n${bq(`Halo, <b>${esc(user.first_name)}</b>! 👋\n\n🆔 <b>ID Anda:</b> <code>${chatId}</code>\n⭐ <b>Status:</b> ${status}\n🏅 <b>Level:</b> ${rnk.icon} ${rnk.name}\n🪙 <b>Poin:</b> <code>${user.points || 0} PTS</code>`)}\n━━━━━━━━━━━━━━━━━━━━━━━\n💡 <i>Gunakan WebApp resmi kami untuk mengakses seluruh layanan toko, spin harian, daily check-in, dan pembelian VIP!</i>`;

  const keyboard = [
    [{ text: '🛍️ Buka WebApp Walzy Store', web_app: { url: webappUrl } }]
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
                  await bot.sendMessage(refId, `🎉 <b>REFERRAL BARU!</b>\n<b>${esc(user.first_name)}</b> bergabung via link Anda! Anda mendapatkan <b>+50 Poin</b>.`, { parse_mode: 'HTML' });
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
