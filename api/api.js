const TelegramBot = require('node-telegram-bot-api');
const { loadDB, saveDB, getTodayString, genInvoiceID, getRank } = require('../lib/utils');
const config = require('../config');

const rateCache = new Map();
let dbCache = null;
let dbCacheTime = 0;
const CACHE_TTL = 300;

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
    if (!map.has(key)) map.set(key, u);
  }
  return Array.from(map.values());
}

function isPremium(u) {
  return u && u.premiumUntil && u.premiumUntil > Date.now();
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
  if (entry.count > 120) return false;
  entry.count++;
  return true;
}

function ensureUserInDB(db, userId, nameData, usernameData) {
  const k = String(userId);
  if (!db.users[k]) {
    db.users[k] = {
      id: Number(userId) || userId,
      first_name: nameData || 'User',
      username: usernameData || '',
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
    if (nameData && db.users[k].first_name !== nameData) db.users[k].first_name = nameData;
    if (usernameData !== undefined && db.users[k].username !== usernameData) db.users[k].username = usernameData;
  }

  if (Array.isArray(db.users[k].referrals)) {
    db.users[k].referralCount = db.users[k].referrals.length;
  }
  
  const userPaidInvoices = Object.values(db.payments || {}).filter(p => String(p.userId) === k && (p.status === 'paid' || p.status === 'approved'));
  db.users[k].totalFix = userPaidInvoices.length;

  return db.users[k];
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method === 'OPTIONS') return res.status(200).json({ ok: true });

  const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  if (!checkRate(clientIp)) return res.status(429).json({ ok: false, message: 'Batas Permintaan Terlampaui' });

  const fullUrl = req.url || '';
  const pathOnly = fullUrl.split('?')[0];
  const query = req.query || {};
  let body = req.body || {};
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }

  const endpoint = query.endpoint || body.endpoint || (pathOnly.includes('/api/') ? pathOnly.split('/api/')[1] : '');

  try {
    const db = await getDB();
    if (!db.users) db.users = {};
    if (!db.payments) db.payments = {};
    if (!db.codes) db.codes = {};
    if (!db.stats) db.stats = { totalFix: 0, totalSuccess: 0, totalFailed: 0, revenue: 0, revenueHistory: [], lastReset: Date.now() };

    if (endpoint === 'user') {
      const userId = query.user_id || body.user_id;
      const firstName = query.first_name || body.first_name || null;
      const userName = query.username || body.username || null;

      if (!userId) return res.status(400).json({ ok: false, message: 'Parameter user_id diperlukan' });
      if (isSuspiciousId(userId)) return res.json({ ok: false, message: 'User ID Tidak Valid' });

      let user = ensureUserInDB(db, userId, firstName, userName);
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

      const remainingQuota = isPrem ? 'Unlimited' : `${Math.max(0, 5 - (user.dailyFix.count || 0))}/5`;

      await saveDB(db);

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
          dailyFixRemaining: remainingQuota,
          isPremium: isPrem,
          premiumLeftDays: premiumLeft,
          canSpin,
          canCheckin,
          rank: rankInfo,
          pendingDeposit: user.pendingDeposit || null,
          referralLink: `https://t.me/${config.BOT_USERNAME || 'walzystore_bot'}?start=ref_${user.id}`,
          isOwner: isOwner(userId)
        },
        currentInvoice: activeInvoice,
        invoices: userInvoices.slice(0, 20)
      });
    }

    if (endpoint === 'spin') {
      const userId = body.user_id || query.user_id;
      if (!userId || isSuspiciousId(userId)) return res.status(400).json({ ok: false, message: 'User ID tidak valid' });

      let user = ensureUserInDB(db, userId);
      if (user.lastSpin === getTodayString()) {
        return res.json({ ok: false, message: 'Anda telah memutar Spin Harian hari ini!' });
      }

      const prizePool = [
        { index: 0, type: 'zonk', value: 0, label: 'ZONK ❌ (Coba Lagi)', weight: 40 },
        { index: 1, type: 'points', value: 30, label: '+30 Poin Vault 🪙', weight: 30 },
        { index: 2, type: 'points', value: 50, label: '+50 Poin Vault 🪙', weight: 15 },
        { index: 3, type: 'points', value: 100, label: '+100 Poin Vault 🪙', weight: 8 },
        { index: 4, type: 'fix', value: 3, label: '+3 Fast-Track ⚡', weight: 5 },
        { index: 5, type: 'vip', value: 1, label: '+1 Hari Akses VIP 💎', weight: 2 }
      ];

      const totalWeight = prizePool.reduce((acc, item) => acc + item.weight, 0);
      let randomNum = Math.random() * totalWeight;
      let selectedPrize = prizePool[0];

      for (let item of prizePool) {
        if (randomNum < item.weight) {
          selectedPrize = item;
          break;
        }
        randomNum -= item.weight;
      }

      user.lastSpin = getTodayString();

      if (selectedPrize.type === 'vip') {
        user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + (selectedPrize.value * 86400000);
      } else if (selectedPrize.type === 'points') {
        user.points = (user.points || 0) + selectedPrize.value;
      } else if (selectedPrize.type === 'fix') {
        user.dailyFix.count = Math.max(0, (user.dailyFix.count || 0) - selectedPrize.value);
      }

      await saveDB(db);
      clearCache();

      return res.json({
        ok: true,
        message: selectedPrize.type === 'zonk' ? 'Apes! Anda mendapatkan Zonk ❌. Coba keberuntungan besok!' : `Selamat! Anda mendapatkan ${selectedPrize.label}`,
        prizeIndex: selectedPrize.index,
        prize: selectedPrize,
        points: user.points
      });
    }

    if (endpoint === 'checkin') {
      const userId = body.user_id || query.user_id;
      if (!userId || isSuspiciousId(userId)) return res.status(400).json({ ok: false, message: 'User ID tidak valid' });

      let user = ensureUserInDB(db, userId);
      const today = getTodayString();

      if (user.lastCheckin === today) {
        return res.json({ ok: false, message: 'Check-in Harian Sudah Diklaim Hari Ini!' });
      }

      user.lastCheckin = today;
      user.checkinStreak = ((user.checkinStreak || 0) % 7) + 1;

      const streakRewards = { 1: 30, 2: 50, 3: 75, 4: 100, 5: 150, 6: 200, 7: 350 };
      const rewardPoints = streakRewards[user.checkinStreak] || 30;

      user.points = (user.points || 0) + rewardPoints;

      await saveDB(db);
      clearCache();

      return res.json({
        ok: true,
        message: `Streak Hari ke-${user.checkinStreak} Sukses! +${rewardPoints} Poin Ditambahkan.`,
        streak: user.checkinStreak,
        pointsEarned: rewardPoints,
        totalPoints: user.points
      });
    }

    if (endpoint === 'redeem_points') {
      const userId = body.user_id || query.user_id;
      const option = Number(body.option || query.option);

      if (!userId || isSuspiciousId(userId) || !option) return res.status(400).json({ ok: false, message: 'Pilihan Item Tidak Valid' });

      let user = ensureUserInDB(db, userId);
      const options = {
        1: { cost: 100, days: 1, label: '1 Hari VIP' },
        2: { cost: 250, days: 3, label: '3 Hari VIP' },
        3: { cost: 500, days: 7, label: '7 Hari VIP' },
        4: { cost: 900, days: 14, label: '14 Hari VIP' },
        5: { cost: 1600, days: 30, label: '30 Hari VIP Sultan' }
      };

      const sel = options[option];
      if (!sel) return res.json({ ok: false, message: 'Item Point Store Tidak Ditemukan' });

      if ((user.points || 0) < sel.cost) {
        return res.json({ ok: false, message: `Saldo Poin Kurang. Dibutuhkan ${sel.cost} PTS` });
      }

      user.points -= sel.cost;
      user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + (sel.days * 86400000);

      await saveDB(db);
      clearCache();

      return res.json({ ok: true, message: `Penukaran Berhasil! Paket ${sel.label} Telah Aktif.`, points: user.points });
    }

    if (endpoint === 'order' || endpoint === 'deposit') {
      const userId = body.user_id || query.user_id;
      const days = Number(body.days || query.days);

      if (!userId || isSuspiciousId(userId) || !days || isNaN(days)) {
        return res.status(400).json({ ok: false, message: 'Parameter Pemesanan Tidak Lengkap' });
      }

      let user = ensureUserInDB(db, userId);

      const userInvoices = Object.values(db.payments).filter(p => String(p.userId) === String(userId));
      const hasActive = userInvoices.some(p => p.status === 'pending' || p.status === 'waiting_approval' || p.status === 'waiting_payment');

      if (hasActive) {
        return res.json({ ok: false, message: 'Anda masih memiliki transaksi invoice yang aktif! Batalkan atau selesaikan terlebih dahulu.' });
      }

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
        proofImage: null,
        createdAt: Date.now()
      };

      db.payments[invoice] = payData;
      user.pendingDeposit = invoice;

      await saveDB(db);
      clearCache();

      return res.json({
        ok: true,
        message: 'Invoice Pesanan Berhasil Dibuat',
        invoice: payData
      });
    }

    if (endpoint === 'cancel_order') {
      const userId = body.user_id || query.user_id;
      const invoiceId = body.invoice || query.invoice;

      if (!userId || !invoiceId) return res.status(400).json({ ok: false, message: 'Parameter Tidak Lengkap' });

      let user = ensureUserInDB(db, userId);
      const pay = db.payments[invoiceId];

      if (pay) pay.status = 'cancelled';
      user.pendingDeposit = null;

      await saveDB(db);
      clearCache();

      return res.json({ ok: true, message: 'Pembelian Invoice Berhasil Dibatalkan' });
    }

    if (endpoint === 'upload_proof') {
      const userId = body.user_id || query.user_id;
      const invoiceId = body.invoice || query.invoice;
      const imageData = body.image_data;

      if (!userId || !invoiceId || !imageData) return res.status(400).json({ ok: false, message: 'Bukti Foto Tidak Ditemukan' });

      const pay = db.payments[invoiceId];
      if (!pay) return res.status(404).json({ ok: false, message: 'Invoice Tidak Ditemukan' });

      pay.proofImage = imageData;
      pay.status = 'waiting_approval';

      await saveDB(db);
      clearCache();

      return res.json({ ok: true, message: 'Bukti pembayaran berhasil diunggah! Menunggu konfirmasi owner.' });
    }

    if (endpoint === 'redeem') {
      const userId = body.user_id || query.user_id;
      const code = String(body.code || query.code || '').trim().toUpperCase();

      if (!userId || !code) return res.status(400).json({ ok: false, message: 'Kode Voucher & User ID Wajib Diisi' });

      let user = ensureUserInDB(db, userId);
      const vCode = db.codes[code];

      if (!vCode) return res.json({ ok: false, message: 'Kode Voucher Tidak Valid' });

      const days = typeof vCode === 'object' ? vCode.days : vCode;
      const quota = typeof vCode === 'object' ? (vCode.quota || 0) : 0;
      const used = typeof vCode === 'object' ? (vCode.used || 0) : 0;

      if (quota > 0 && used >= quota) {
        return res.json({ ok: false, message: 'Kuota Voucher Telah Habis' });
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

      return res.json({ ok: true, message: `Voucher Diklaim: +${days} Hari Akses VIP` });
    }

    if (endpoint === 'stats') {
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
        pendingPayments: pending.slice(-30).reverse(),
        paidPayments: ownerCheck ? paid.slice(-30).reverse() : [],
        recentUsers: ownerCheck ? validUsers.slice(-50).reverse() : [],
        codes: ownerCheck ? Object.values(db.codes).slice(-50) : [],
        revenue: ownerCheck ? (db.stats.revenue || 0) : 0
      });
    }

    if (endpoint === 'owner_action') {
      const ownerId = String(body.owner_id || query.owner_id || '');
      if (!isOwner(ownerId)) return res.status(403).json({ ok: false, message: 'Akses Ditolak: Bukan Owner' });

      const invoice = body.invoice;
      const action = body.action;
      const pay = db.payments[invoice];
      if (!pay) return res.status(404).json({ ok: false, message: 'Invoice Tidak Ditemukan' });

      if (action === 'approve') {
        pay.status = 'paid';
        const u = db.users[String(pay.userId)];
        if (u) {
          u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + (pay.days * 86400000);
          u.pendingDeposit = null;
        }
        db.stats.revenue = (db.stats.revenue || 0) + pay.amount;

        await saveDB(db);
        clearCache();

        try {
          const bot = new TelegramBot(config.BOT_TOKEN);
          await bot.sendMessage(pay.userId, `<b>VERIFIKASI TRANSAKSI LUNAS</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n<b>ID Invoice:</b> <code>${invoice}</code>\n<b>Status:</b> 🟢 <b>APPROVED</b>\n<b>Paket:</b> VIP +${pay.days} Hari Berhasil Diaktifkan!\n\n🚀 <i>Terima kasih telah berlangganan di Walzy Store.</i>`, { parse_mode: 'HTML' });
        } catch (e) {}

        return res.json({ ok: true, message: `Invoice ${invoice} Berhasil Disetujui!` });
      } else if (action === 'reject') {
        pay.status = 'rejected';
        const u = db.users[String(pay.userId)];
        if (u) u.pendingDeposit = null;

        await saveDB(db);
        clearCache();

        try {
          const bot = new TelegramBot(config.BOT_TOKEN);
          await bot.sendMessage(pay.userId, `❌ <b>VERIFIKASI DITOLAK</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\nInvoice <code>${invoice}</code> ditolak oleh Operator Admin. Hubungi Customer Support jika ada pertanyaan.`, { parse_mode: 'HTML' });
        } catch (e) {}

        return res.json({ ok: true, message: `Invoice ${invoice} Ditolak!` });
      }
    }

    if (endpoint === 'create_code') {
      const ownerId = String(body.owner_id || query.owner_id || '');
      if (!isOwner(ownerId)) return res.status(403).json({ ok: false, message: 'Akses Ditolak: Bukan Owner' });

      const code = String(body.code || '').toUpperCase().trim();
      const days = parseInt(body.days);
      const quota = parseInt(body.quota) || 0;

      if (!code || code.length < 3) return res.json({ ok: false, message: 'Kode minimal 3 karakter' });
      if (!days || days <= 0) return res.json({ ok: false, message: 'Durasi hari tidak valid' });

      db.codes[code] = { code, days, quota, used: 0, createdAt: Date.now() };
      await saveDB(db);
      clearCache();
      return res.json({ ok: true, message: `Voucher ${code} Berhasil Dibuat` });
    }

    if (endpoint === 'delete_code') {
      const ownerId = String(body.owner_id || query.owner_id || '');
      if (!isOwner(ownerId)) return res.status(403).json({ ok: false, message: 'Akses Ditolak: Bukan Owner' });

      const code = String(body.code || '').toUpperCase().trim();
      if (!db.codes[code]) return res.json({ ok: false, message: 'Voucher Tidak Ditemukan' });

      delete db.codes[code];
      await saveDB(db);
      clearCache();
      return res.json({ ok: true, message: `Voucher ${code} Dihapus` });
    }

    if (endpoint === 'broadcast') {
      const ownerId = String(body.owner_id || query.owner_id || '');
      if (!isOwner(ownerId)) return res.status(403).json({ ok: false, message: 'Akses Ditolak: Bukan Owner' });

      const text = String(body.text || '').trim();
      if (!text) return res.json({ ok: false, message: 'Pesan Broadcast Kosong' });

      const validUsers = getUniqueUsers(db.users);
      let sent = 0;
      let failed = 0;

      try {
        const bot = new TelegramBot(config.BOT_TOKEN);
        for (let u of validUsers) {
          try {
            await bot.sendMessage(u.id, `📢 <b>WALZY ANNOUNCEMENT</b>\n━━━━━━━━━━━━━━━━━━━━━━\n\n${text}\n\n⚡ <i>Walzy Store Official Broadcast</i>`, { parse_mode: 'HTML' });
            sent++;
          } catch (e) {
            failed++;
          }
        }
      } catch (e) {}

      return res.json({ ok: true, message: `Broadcast Selesai! Berhasil: ${sent}, Gagal: ${failed}`, sent, failed, total: validUsers.length });
    }

    return res.status(404).json({ ok: false, message: 'Endpoint Tidak Ditemukan' });
  } catch (err) {
    console.error('API Error:', err);
    return res.status(500).json({ ok: false, message: 'Internal Error Server', error: err.message });
  }
};
