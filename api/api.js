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
  if (!n || n <= 0) return true;
  if (s.startsWith('-') || s.length > 20 || s.includes('.')) return true;
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

    // Auto Clean suspicious data
    for (let k of Object.keys(db.users)) { if (isSuspiciousId(k)) delete db.users[k]; }
    for (let k of Object.keys(db.payments)) { const p = db.payments[k]; if (p && isSuspiciousId(p.userId)) delete db.payments[k]; }

    // VERIFY OWNER
    if (pathOnly.endsWith('/api/verify_owner')) {
      const ownerId = String(body.owner_id || query.owner_id || '');
      const password = String(body.password || '').trim();
      const check = mustBeOwnerAndPassword(ownerId, password);
      if (!check.ok) return res.status(check.code).json({ ok: false, message: check.msg });
      return res.json({ ok: true, message: 'Owner Terverifikasi', isOwner: true });
    }

    // GET USER PROFILE
    if (pathOnly.endsWith('/api/user')) {
      const userId = query.user_id || body.user_id;
      if (!userId) return res.status(400).json({ ok: false, message: 'user_id diperlukan' });
      if (isSuspiciousId(userId)) return res.json({ ok: false, message: 'User ID tidak valid' });

      let user = db.users[String(userId)];
      if (!user) return res.json({ ok: false, message: 'User tidak ditemukan. Jalankan /start di bot lebih dulu.' });

      const isPrem = isPremium(user);
      const premiumLeft = isPrem ? Math.ceil((user.premiumUntil - Date.now()) / 86400000) : 0;
      
      if (!user.dailyFix || user.dailyFix.date !== getTodayString()) {
        user.dailyFix = { date: getTodayString(), count: 0 };
      }
      
      const canSpin = !user.lastSpin || user.lastSpin !== getTodayString();
      const rankInfo = getRank(user.referralCount || 0);

      const userInvoices = Object.values(db.payments).filter(p => String(p.userId) === String(userId));

      return res.json({
        ok: true,
        user: {
          id: user.id,
          first_name: user.first_name || 'User',
          username: user.username || '',
          referralCount: user.referralCount || 0,
          totalFix: user.totalFix || 0,
          dailyFixRemaining: isPrem ? 999 : Math.max(0, 3 - (user.dailyFix.count || 0)),
          isPremium: isPrem,
          premiumLeftDays: premiumLeft,
          canSpin,
          rank: rankInfo,
          pendingDeposit: user.pendingDeposit || null,
          referralLink: `https://t.me/${config.BOT_USERNAME || 'bot'}?start=ref_${user.id}`
        },
        invoices: userInvoices
      });
    }

    // DAILY SPIN
    if (pathOnly.endsWith('/api/spin')) {
      const userId = body.user_id || query.user_id;
      if (!userId || isSuspiciousId(userId)) return res.status(400).json({ ok: false, message: 'User ID tidak valid' });

      let user = db.users[String(userId)];
      if (!user) return res.status(404).json({ ok: false, message: 'User tidak ditemukan' });

      if (user.lastSpin === getTodayString()) {
        return res.json({ ok: false, message: 'Anda sudah melakukan spin hari ini!' });
      }

      user.lastSpin = getTodayString();
      const prizes = [
        { type: 'vip', value: 1, label: '+1 Hari VIP' },
        { type: 'fix', value: 3, label: '+3 Kuota Fix' },
        { type: 'try_again', value: 0, label: 'Coba Lagi Besok' },
        { type: 'vip', value: 3, label: '+3 Hari VIP SULTAN' }
      ];
      
      const prize = prizes[Math.floor(Math.random() * prizes.length)];

      if (prize.type === 'vip') {
        user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + (prize.value * 86400000);
      } else if (prize.type === 'fix') {
        user.dailyFix.count = Math.max(0, (user.dailyFix.count || 0) - prize.value);
      }

      await saveDB(db);
      clearCache();

      return res.json({ ok: true, message: `Selamat! Anda mendapatkan ${prize.label}`, prize });
    }

    // CREATE ORDER
    if (pathOnly.endsWith('/api/order')) {
      const userId = body.user_id;
      const days = Number(body.days);
      const amount = Number(body.amount);

      if (!userId || isSuspiciousId(userId) || !days || !amount) {
        return res.status(400).json({ ok: false, message: 'Parameter order tidak lengkap' });
      }

      const user = db.users[String(userId)];
      if (!user) return res.status(404).json({ ok: false, message: 'User tidak ditemukan' });

      const invoice = genInvoiceID();
      const payData = {
        invoice,
        userId: String(userId),
        days,
        amount,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      db.payments[invoice] = payData;
      user.pendingDeposit = invoice;

      await saveDB(db);
      clearCache();

      return res.json({ ok: true, message: 'Invoice berhasil dibuat', invoice: payData, qrisUrl: config.QRIS_URL || '' });
    }

    // REDEEM VOUCHER
    if (pathOnly.endsWith('/api/redeem')) {
      const userId = body.user_id;
      const code = String(body.code || '').trim().toUpperCase();

      if (!userId || !code) return res.status(400).json({ ok: false, message: 'Kode voucher & User ID wajib diisi' });

      const user = db.users[String(userId)];
      if (!user) return res.status(404).json({ ok: false, message: 'User tidak ditemukan' });

      const vCode = db.codes[code];
      if (!vCode || vCode.used >= vCode.maxUse) {
        return res.json({ ok: false, message: 'Kode voucher tidak valid atau sudah habis' });
      }

      if (Array.isArray(vCode.usedBy) && vCode.usedBy.includes(String(userId))) {
        return res.json({ ok: false, message: 'Anda sudah pernah mengklaim voucher ini' });
      }

      vCode.used = (vCode.used || 0) + 1;
      if (!Array.isArray(vCode.usedBy)) vCode.usedBy = [];
      vCode.usedBy.push(String(userId));

      user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + (vCode.days * 86400000);

      await saveDB(db);
      clearCache();

      return res.json({ ok: true, message: `Voucher Berhasil! Ditambahkan +${vCode.days} Hari VIP` });
    }

    // STATS ENDPOINT
    if (pathOnly.endsWith('/api/stats')) {
      const validUsers = getUniqueUsers(db.users);
      const premiumUsers = validUsers.filter(u => isPremium(u)).length;

      return res.json({
        ok: true,
        stats: {
          totalUsers: validUsers.length,
          totalVIP: premiumUsers,
          totalOrders: db.stats.totalFix || 0,
          totalSuccess: db.stats.totalSuccess || 0,
          revenue: db.stats.revenue || 0
        }
      });
    }

    // OWNER: APPROVE / REJECT DEPOSIT
    if (pathOnly.endsWith('/api/owner/approve_deposit')) {
      const { owner_id, password, invoice, action } = body;
      const check = mustBeOwnerAndPassword(owner_id, password);
      if (!check.ok) return res.status(check.code).json({ ok: false, message: check.msg });

      const pay = db.payments[invoice];
      if (!pay) return res.status(404).json({ ok: false, message: 'Invoice tidak ditemukan' });

      if (action === 'approve') {
        pay.status = 'approved';
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
          await bot.sendMessage(pay.userId, `✅ <b>PEMBAYARAN DITERIMA!</b>\n\nInvoice <code>${invoice}</code> telah disetujui.\nPaket VIP +${pay.days} Hari telah aktif!`, { parse_mode: 'HTML' });
        } catch (e) {}

        return res.json({ ok: true, message: `Invoice ${invoice} telah disetujui!` });
      } else if (action === 'reject') {
        pay.status = 'rejected';
        const u = db.users[String(pay.userId)];
        if (u) u.pendingDeposit = null;

        await saveDB(db);
        clearCache();

        try {
          const TelegramBot = require('node-telegram-bot-api');
          const bot = new TelegramBot(config.BOT_TOKEN);
          await bot.sendMessage(pay.userId, `❌ <b>PEMBAYARAN DITOLAK</b>\n\nInvoice <code>${invoice}</code> telah ditolak oleh Admin.`, { parse_mode: 'HTML' });
        } catch (e) {}

        return res.json({ ok: true, message: `Invoice ${invoice} ditolak.` });
      }
    }

    // OWNER: CREATE VOUCHER
    if (pathOnly.endsWith('/api/owner/vouchers')) {
      if (req.method === 'POST') {
        const { owner_id, password, code, days, maxUse } = body;
        const check = mustBeOwnerAndPassword(owner_id, password);
        if (!check.ok) return res.status(check.code).json({ ok: false, message: check.msg });

        const upperCode = String(code).trim().toUpperCase();
        db.codes[upperCode] = {
          code: upperCode,
          days: Number(days) || 1,
          maxUse: Number(maxUse) || 10,
          used: 0,
          usedBy: [],
          createdAt: new Date().toISOString()
        };

        await saveDB(db);
        clearCache();
        return res.json({ ok: true, message: `Voucher ${upperCode} berhasil dibuat!` });
      }
      return res.json({ ok: true, codes: db.codes });
    }

    return res.status(404).json({ ok: false, message: 'Endpoint API tidak ditemukan' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ ok: false, message: 'Internal Server Error', error: err.message });
  }
};
