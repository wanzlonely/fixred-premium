const { loadDB, saveDB } = require('../lib/utils');
const { getTodayString, genInvoiceID } = require('../lib/utils');
const config = require('../config');

const OWNER_PASSWORD = 'SUPER777';
const rateCache = new Map();
let dbCache = null;
let dbCacheTime = 0;
const CACHE_TTL = 3000;

async function getDB() {
  const now = Date.now();
  if (dbCache && (now - dbCacheTime) < CACHE_TTL) return dbCache;
  const db = await loadDB();
  dbCache = db;
  dbCacheTime = now;
  return db;
}

function clearCache() {
  dbCache = null;
  dbCacheTime = 0;
}

function isOwner(id) {
  try {
    if (config && config.OWNER_IDS) return config.OWNER_IDS.map(String).includes(String(id));
  } catch (e) {}
  return false;
}

function isSuspiciousId(id) {
  if (!id) return true;
  const s = String(id);
  const n = Number(id);
  if (!n || n <= 0 || s.startsWith('-') || s.length > 20 || s.includes('.')) return true;
  return false;
}

function getUniqueUsers(usersObj) {
  const map = new Map();
  for (let u of Object.values(usersObj || {})) {
    if (!u || isSuspiciousId(u.id)) continue;
    const key = String(u.id);
    const name = (u.first_name || '').trim().toLowerCase();
    if (!name) continue;
    if (name.includes('exploit') && (u.totalFix || 0) === 0 && (u.referralCount || 0) === 0) continue;
    if (!map.has(key)) map.set(key, u);
  }
  return Array.from(map.values());
}

function isPremium(u) {
  return u && u.premiumUntil && u.premiumUntil > Date.now();
}

function getRank(c) {
  if (c >= 100) return { name: 'SULTAN', icon: '👑', color: '#f59e0b' };
  if (c >= 50) return { name: 'DIAMOND', icon: '💎', color: '#06b6d4' };
  if (c >= 20) return { name: 'GOLD', icon: '🥇', color: '#eab308' };
  if (c >= 10) return { name: 'SILVER', icon: '🥈', color: '#94a3b8' };
  if (c >= 5) return { name: 'BRONZE', icon: '🥉', color: '#d97706' };
  return { name: 'BASIC', icon: '🌱', color: '#10b981' };
}

function checkRate(ip) {
  const now = Date.now();
  const key = ip || 'unknown';
  const entry = rateCache.get(key);
  if (!entry) {
    rateCache.set(key, { count: 1, ts: now });
    return true;
  }
  if (now - entry.ts > 60000) {
    rateCache.set(key, { count: 1, ts: now });
    return true;
  }
  if (entry.count > 60) return false;
  entry.count++;
  return true;
}

function mustBeOwnerAndPassword(ownerId, password) {
  if (password !== OWNER_PASSWORD) return { ok: false, code: 403, msg: 'Password salah' };
  if (!isOwner(ownerId)) return { ok: false, code: 403, msg: 'Akses ditolak, bukan owner' };
  return { ok: true };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });

  const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  if (!checkRate(clientIp)) return res.status(429).json({ ok: false, message: 'Terlalu banyak permintaan' });

  const fullUrl = req.url || '';
  const pathOnly = fullUrl.split('?')[0];
  const query = req.query || {};
  const body = req.body || {};

  try {
    const db = await getDB();
    if (!db.users) db.users = {};
    if (!db.payments) db.payments = {};
    if (!db.codes) db.codes = {};
    if (!db.stats) db.stats = { totalFix: 0, totalSuccess: 0, totalFailed: 0, revenue: 0, revenueHistory: [], lastReset: Date.now() };
    if (!db.history) db.history = {};

    for (let k of Object.keys(db.users)) { if (isSuspiciousId(k)) delete db.users[k]; }
    for (let k of Object.keys(db.payments)) { const p = db.payments[k]; if (p && isSuspiciousId(p.userId)) delete db.payments[k]; }

    if (pathOnly.endsWith('/api/verify_owner')) {
      const ownerId = String(body.owner_id || query.owner_id || '');
      const password = String(body.password || '').trim();
      const check = mustBeOwnerAndPassword(ownerId, password);
      if (!check.ok) return res.status(check.code).json({ ok: false, message: check.msg });
      return res.json({ ok: true, message: 'Verified', isOwner: true });
    }

    if (pathOnly.endsWith('/api/user')) {
      const userId = query.user_id || body.user_id;
      if (!userId) return res.status(400).json({ ok: false, message: 'user_id diperlukan' });
      if (isSuspiciousId(userId)) return res.json({ ok: false, message: 'User ID tidak valid' });

      let user = db.users[String(userId)];
      if (!user) return res.json({ ok: false, message: 'User tidak ditemukan. Jalankan /start di bot terlebih dahulu.' });

      if (user.points === undefined) user.points = 0;
      if (user.checkinStreak === undefined) user.checkinStreak = 0;
      if (user.lastCheckin === undefined) user.lastCheckin = null;

      const isPrem = isPremium(user);
      const premiumLeft = isPrem ? Math.ceil((user.premiumUntil - Date.now()) / 86400000) : 0;

      if (!user.dailyFix || user.dailyFix.date !== getTodayString()) {
        user.dailyFix = { date: getTodayString(), count: 0 };
      }

      const canSpin = !user.lastSpin || user.lastSpin !== getTodayString();
      const canCheckin = !user.lastCheckin || user.lastCheckin !== getTodayString();
      const rankInfo = getRank(user.referralCount || 0);
      const userInvoices = Object.values(db.payments).filter(p => String(p.userId) === String(userId));
      const activeInvoice = userInvoices.find(p => p.status === 'pending' || p.status === 'waiting_approval' || p.status === 'waiting_payment') || null;

      return res.json({
        ok: true,
        user: {
          id: user.id,
          first_name: user.first_name || 'User',
          username: user.username || '',
          referralCount: user.referralCount || 0,
          totalFix: user.totalFix || 0,
          points: user.points || 0,
          checkinStreak: user.checkinStreak || 0,
          dailyFixRemaining: isPrem ? 999 : Math.max(0, 3 - (user.dailyFix.count || 0)),
          isPremium: isPrem,
          premiumLeftDays: premiumLeft,
          canSpin,
          canCheckin,
          rank: rankInfo,
          pendingDeposit: user.pendingDeposit || null,
          referralLink: `https://t.me/${config.BOT_USERNAME || 'walzystore_bot'}?start=ref_${user.id}`
        },
        currentInvoice: activeInvoice,
        invoices: userInvoices.slice(0, 20)
      });
    }

    if (pathOnly.endsWith('/api/spin')) {
      const userId = body.user_id || query.user_id;
      if (!userId || isSuspiciousId(userId)) return res.status(400).json({ ok: false, message: 'User ID tidak valid' });

      let user = db.users[String(userId)];
      if (!user) return res.status(404).json({ ok: false, message: 'User tidak ditemukan' });

      if (user.lastSpin === getTodayString()) {
        return res.json({ ok: false, message: 'Anda sudah memutar spin hari ini!' });
      }

      user.lastSpin = getTodayString();
      const prizes = [
        { type: 'points', value: 50, label: '+50 Poin Bonus' },
        { type: 'vip', value: 1, label: '+1 Hari VIP' },
        { type: 'points', value: 100, label: '+100 Poin Bonus' },
        { type: 'fix', value: 3, label: '+3 Kuota Fix Merah' },
        { type: 'vip', value: 3, label: '+3 Hari VIP Sultan' }
      ];

      const prize = prizes[Math.floor(Math.random() * prizes.length)];

      if (prize.type === 'vip') {
        user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + (prize.value * 86400000);
      } else if (prize.type === 'points') {
        user.points = (user.points || 0) + prize.value;
      } else if (prize.type === 'fix') {
        user.dailyFix.count = Math.max(0, (user.dailyFix.count || 0) - prize.value);
      }

      await saveDB(db);
      clearCache();

      return res.json({ ok: true, message: `Selamat! Anda mendapatkan ${prize.label}`, prize });
    }

    if (pathOnly.endsWith('/api/checkin')) {
      const userId = body.user_id || query.user_id;
      if (!userId || isSuspiciousId(userId)) return res.status(400).json({ ok: false, message: 'User ID tidak valid' });

      let user = db.users[String(userId)];
      if (!user) return res.status(404).json({ ok: false, message: 'User tidak ditemukan' });

      const today = getTodayString();
      if (user.lastCheckin === today) {
        return res.json({ ok: false, message: 'Anda sudah melakukan Daily Check-in hari ini!' });
      }

      user.lastCheckin = today;
      user.checkinStreak = ((user.checkinStreak || 0) % 7) + 1;

      const streakRewards = { 1: 20, 2: 30, 3: 40, 4: 50, 5: 75, 6: 100, 7: 200 };
      const rewardPoints = streakRewards[user.checkinStreak] || 20;

      user.points = (user.points || 0) + rewardPoints;
      let rewardMessage = `Check-in Hari ke-${user.checkinStreak} Berhasil! +${rewardPoints} Poin`;

      if (user.checkinStreak === 7) {
        user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + 86400000;
        rewardMessage += ' & +1 Hari VIP Gratis!';
      }

      await saveDB(db);
      clearCache();

      return res.json({ ok: true, message: rewardMessage, streak: user.checkinStreak, pointsEarned: rewardPoints, totalPoints: user.points });
    }

    if (pathOnly.endsWith('/api/redeem_points')) {
      const userId = body.user_id || query.user_id;
      const option = Number(body.option || query.option);

      if (!userId || isSuspiciousId(userId) || !option) return res.status(400).json({ ok: false, message: 'Parameter tidak valid' });

      let user = db.users[String(userId)];
      if (!user) return res.status(404).json({ ok: false, message: 'User tidak ditemukan' });

      const options = {
        1: { cost: 100, days: 1, label: '1 Hari VIP' },
        2: { cost: 250, days: 3, label: '3 Hari VIP' },
        3: { cost: 500, days: 7, label: '7 Hari VIP' }
      };

      const sel = options[option];
      if (!sel) return res.json({ ok: false, message: 'Pilihan penukaran tidak valid' });

      if ((user.points || 0) < sel.cost) {
        return res.json({ ok: false, message: `Poin tidak cukup! Butuh ${sel.cost} Poin` });
      }

      user.points -= sel.cost;
      user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + (sel.days * 86400000);

      await saveDB(db);
      clearCache();

      return res.json({ ok: true, message: `Berhasil menukarkan ${sel.cost} Poin dengan Paket ${sel.label}!`, points: user.points });
    }

    if (pathOnly.endsWith('/api/order') || pathOnly.endsWith('/api/deposit')) {
      const userId = body.user_id || query.user_id;
      const days = Number(body.days || query.days);

      if (!userId || isSuspiciousId(userId) || !days || isNaN(days)) {
        return res.status(400).json({ ok: false, message: 'Parameter order tidak lengkap' });
      }

      const user = db.users[String(userId)];
      if (!user) return res.status(404).json({ ok: false, message: 'User tidak ditemukan' });

      const prices = { 3: 7000, 5: 10000, 7: 15000, 14: 25000, 30: 45000 };
      const amount = Number(body.amount || query.amount) || prices[days] || days * 2500;

      const invoice = genInvoiceID();
      const payData = {
        id: invoice,
        invoice,
        userId: String(userId),
        days,
        amount,
        amountFormatted: 'Rp ' + amount.toLocaleString('id-ID'),
        status: 'pending',
        createdAt: Date.now()
      };

      db.payments[invoice] = payData;
      user.pendingDeposit = invoice;

      await saveDB(db);
      clearCache();

      return res.json({ ok: true, message: 'Invoice berhasil dibuat', invoice: payData });
    }

    if (pathOnly.endsWith('/api/redeem')) {
      const userId = body.user_id || query.user_id;
      const code = String(body.code || query.code || '').trim().toUpperCase();

      if (!userId || !code) return res.status(400).json({ ok: false, message: 'Kode voucher & User ID wajib diisi' });

      const user = db.users[String(userId)];
      if (!user) return res.status(404).json({ ok: false, message: 'User tidak ditemukan' });

      const vCode = db.codes[code];
      if (!vCode) return res.json({ ok: false, message: 'Kode voucher tidak valid' });

      const days = typeof vCode === 'object' ? vCode.days : vCode;
      const quota = typeof vCode === 'object' ? (vCode.quota || 0) : 0;
      const used = typeof vCode === 'object' ? (vCode.used || 0) : 0;

      if (quota > 0 && used >= quota) {
        return res.json({ ok: false, message: 'Kode voucher sudah habis' });
      }

      user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + (days * 86400000);

      if (typeof vCode === 'object') {
        vCode.used = (vCode.used || 0) + 1;
        if (vCode.type === 'private' && (quota === 1 || vCode.quota === 1)) delete db.codes[code];
      } else {
        delete db.codes[code];
      }

      await saveDB(db);
      clearCache();

      return res.json({ ok: true, message: `Voucher Berhasil! Ditambahkan +${days} Hari VIP` });
    }

    if (pathOnly.endsWith('/api/stats')) {
      const userId = query.user_id || body.user_id;
      const ownerCheck = userId ? isOwner(userId) : false;
      const validUsers = getUniqueUsers(db.users);
      const premiumUsers = validUsers.filter(u => isPremium(u)).length;
      const allPayments = Object.values(db.payments || {});
      const pending = allPayments.filter(p => p.status === 'waiting_approval' || p.status === 'pending');
      const paid = allPayments.filter(p => p.status === 'paid' || p.status === 'approved');

      return res.json({
        ok: true,
        isOwner: ownerCheck,
        usersValid: validUsers.length,
        premium: premiumUsers,
        totalFix: db.stats.totalFix || 0,
        totalSuccess: db.stats.totalSuccess || 0,
        pendingPayments: pending.slice(-30).reverse(),
        paidPayments: ownerCheck ? paid.slice(-30).reverse() : [],
        recentUsers: ownerCheck ? validUsers.slice(-50).reverse() : [],
        codes: ownerCheck ? Object.values(db.codes).slice(-50) : [],
        revenue: ownerCheck ? (db.stats.revenue || 0) : 0
      });
    }

    if (pathOnly.endsWith('/api/owner_action') || pathOnly.endsWith('/api/owner/approve_deposit')) {
      const ownerId = String(body.owner_id || '');
      const password = String(body.password || '').trim();
      const check = mustBeOwnerAndPassword(ownerId, password);
      if (!check.ok) return res.status(check.code).json({ ok: false, message: check.msg });

      const invoice = body.invoice;
      const action = body.action;
      const pay = db.payments[invoice];
      if (!pay) return res.status(404).json({ ok: false, message: 'Invoice tidak ditemukan' });

      if (action === 'approve') {
        pay.status = 'paid';
        const u = db.users[String(pay.userId)];
        if (u) {
          u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + (pay.days * 86400000);
          u.pendingDeposit = null;
        }
        db.stats.revenue = (db.stats.revenue || 0) + pay.amount;
        if (!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
        db.stats.revenueHistory.push({ date: new Date().toISOString(), amount: pay.amount, invoice, userId: pay.userId });

        await saveDB(db);
        clearCache();

        try {
          const TelegramBot = require('node-telegram-bot-api');
          const bot = new TelegramBot(config.BOT_TOKEN);
          await bot.sendMessage(pay.userId, `✅ <b>PEMBAYARAN DITERIMA!</b>\n\nInvoice <code>${invoice}</code> disetujui.\nPaket VIP +${pay.days} Hari aktif!`, { parse_mode: 'HTML' });
        } catch (e) {}

        return res.json({ ok: true, message: `Invoice ${invoice} disetujui!` });
      } else if (action === 'reject') {
        pay.status = 'rejected';
        const u = db.users[String(pay.userId)];
        if (u) u.pendingDeposit = null;

        await saveDB(db);
        clearCache();

        try {
          const TelegramBot = require('node-telegram-bot-api');
          const bot = new TelegramBot(config.BOT_TOKEN);
          await bot.sendMessage(pay.userId, `❌ <b>PEMBAYARAN DITOLAK</b>\n\nInvoice <code>${invoice}</code> ditolak oleh Admin.`, { parse_mode: 'HTML' });
        } catch (e) {}

        return res.json({ ok: true, message: `Invoice ${invoice} ditolak.` });
      }
    }

    if (pathOnly.endsWith('/api/create_code')) {
      const ownerId = String(body.owner_id || '');
      const password = String(body.password || '').trim();
      const check = mustBeOwnerAndPassword(ownerId, password);
      if (!check.ok) return res.status(check.code).json({ ok: false, message: check.msg });

      const code = String(body.code || '').toUpperCase().trim();
      const days = parseInt(body.days);
      const quota = parseInt(body.quota) || 0;
      const type = body.type || 'public';

      if (!code || code.length < 3) return res.json({ ok: false, message: 'Kode minimal 3 karakter' });
      if (!days || days <= 0) return res.json({ ok: false, message: 'Durasi hari tidak valid' });

      db.codes[code] = { code, days, quota, used: 0, createdAt: Date.now(), type, createdBy: ownerId };
      await saveDB(db);
      clearCache();
      return res.json({ ok: true, message: `Voucher ${code} berhasil dibuat!` });
    }

    if (pathOnly.endsWith('/api/delete_code')) {
      const ownerId = String(body.owner_id || '');
      const password = String(body.password || '').trim();
      const check = mustBeOwnerAndPassword(ownerId, password);
      if (!check.ok) return res.status(check.code).json({ ok: false, message: check.msg });

      const code = String(body.code || '').toUpperCase().trim();
      if (!db.codes[code]) return res.json({ ok: false, message: 'Voucher tidak ada' });

      delete db.codes[code];
      await saveDB(db);
      clearCache();
      return res.json({ ok: true, message: `Voucher ${code} berhasil dihapus` });
    }

    if (pathOnly.endsWith('/api/broadcast')) {
      const ownerId = String(body.owner_id || '');
      const password = String(body.password || '').trim();
      const check = mustBeOwnerAndPassword(ownerId, password);
      if (!check.ok) return res.status(check.code).json({ ok: false, message: check.msg });

      const text = String(body.text || '').trim();
      if (!text) return res.json({ ok: false, message: 'Pesan broadcast tidak boleh kosong' });

      const validUsers = getUniqueUsers(db.users);
      let sent = 0;
      try {
        const TelegramBot = require('node-telegram-bot-api');
        const bot = new TelegramBot(config.BOT_TOKEN);
        for (let u of validUsers) {
          try {
            await bot.sendMessage(u.id, `📢 <b>WALZY ANNOUNCEMENT</b>\n\n${text}\n\n🚀 <b>walzy store</b>`, { parse_mode: 'HTML' });
            sent++;
          } catch (e) {}
        }
      } catch (e) {}

      return res.json({ ok: true, message: `Broadcast terkirim ke ${sent} pengguna!`, sent });
    }

    if (pathOnly.endsWith('/api/health')) {
      return res.json({ ok: true, message: 'Walzy Store API Active', ts: Date.now() });
    }

    return res.status(404).json({ ok: false, message: 'Endpoint tidak ditemukan: ' + pathOnly });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ ok: false, message: 'Internal Server Error', error: err.message });
  }
};
