const TelegramBot = require('node-telegram-bot-api');
const { loadDB, saveDB, getTodayString } = require('../lib/utils');
const config = require('../config');

const OWNER_IDS = config.OWNER_IDS || ['123456789'];
const DANA_NUMBER = config.DANA_NUMBER || '081234567890';

function getJakartaISO() {
  const d = new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  return new Date(utc + (3600000 * 7)).toISOString().split('T')[0];
}

function getWeekOfMonth() {
  const date = new Date();
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const day = new Date(utc + (3600000 * 7)).getDate();
  if (day <= 7) return 1;
  if (day <= 14) return 2;
  if (day <= 21) return 3;
  return 4;
}

function getUserRank(points) {
  if (points >= 1000) return 'Legend';
  if (points >= 500) return 'Pro';
  if (points >= 200) return 'Advanced';
  return 'Beginner';
}

function getPremiumLeft(untilTimestamp) {
  if (!untilTimestamp) return 'Non-Aktif';
  const diff = untilTimestamp - Date.now();
  if (diff <= 0) return 'Expired';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days} Hari ${hours} Jam`;
  return `${hours} Jam`;
}

function ensureUserInDB(db, userId, name = '') {
  const today = getJakartaISO();
  if (!db.users) db.users = {};
  if (!db.users[userId]) {
    db.users[userId] = {
      id: String(userId),
      name: name || `User_${userId}`,
      quota: 5,
      totalFix: 0,
      points: 0,
      referrals: 0,
      streak: 0,
      lastCheckin: '',
      lastDailyReset: today,
      lastSpinDate: '',
      premiumUntil: 0,
      referredBy: ''
    };
  }
  const u = db.users[userId];
  if (name && u.name !== name) u.name = name;
  if (u.lastDailyReset !== today) {
    u.quota = 5;
    u.lastDailyReset = today;
  }
  return u;
}

const PRODUCTS = {
  trial: { days: 3, price: 7000, name: 'Trial 3H' },
  hemat: { days: 5, price: 10000, name: 'Hemat 5H' },
  starter: { days: 7, price: 15000, name: 'Starter 7H' },
  pro: { days: 14, price: 25000, name: 'Pro 14H' },
  sultan: { days: 30, price: 40000, name: 'Sultan 30H' }
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') return res.status(200).json({ status: true });

  const url = new URL(req.url, `http://${req.headers.host}`);
  const endpoint = url.searchParams.get('endpoint') || req.body?.endpoint || '';
  const query = Object.fromEntries(url.searchParams.entries());
  const body = req.body || {};

  try {
    const db = await loadDB();
    if (!db.users) db.users = {};
    if (!db.orders) db.orders = [];
    if (!db.codes) db.codes = [];
    if (!db.stats) db.stats = { revenue: 0, totalFix: 0 };

    if (endpoint === 'user') {
      const userId = query.user_id || body.user_id;
      const name = query.name || body.name || '';
      if (!userId) return res.status(400).json({ status: false, message: 'Missing user_id' });

      const user = ensureUserInDB(db, userId, name);
      await saveDB(db);

      const isVip = user.premiumUntil > Date.now();
      const rank = getUserRank(user.points);
      const premiumLeft = getPremiumLeft(user.premiumUntil);
      const userOrders = db.orders.filter(o => o.userId === String(userId));
      const isOwner = OWNER_IDS.map(String).includes(String(userId));

      return res.json({
        status: true,
        data: {
          ...user,
          isVip,
          rank,
          premiumLeft,
          referralLink: `https://t.me/${config.BOT_USERNAME || 'walzystore_bot'}?start=${userId}`,
          dana: DANA_NUMBER,
          orders: userOrders,
          isOwner
        }
      });
    }

    if (endpoint === 'create_order') {
      const userId = body.user_id || query.user_id;
      const planId = body.plan_id || query.plan_id;

      if (!userId || !planId || !PRODUCTS[planId]) {
        return res.status(400).json({ status: false, message: 'Invalid data' });
      }

      ensureUserInDB(db, userId);
      const existing = db.orders.find(o => o.userId === String(userId) && o.status === 'pending');
      if (existing) {
        return res.json({ status: true, invoice: existing });
      }

      const prod = PRODUCTS[planId];
      const invoiceId = 'INV' + Date.now().toString().slice(-6);
      const newOrder = {
        invoiceId,
        userId: String(userId),
        planId,
        planName: prod.name,
        days: prod.days,
        amount: prod.price,
        status: 'pending',
        proof: '',
        createdAt: new Date().toISOString()
      };

      db.orders.push(newOrder);
      await saveDB(db);
      return res.json({ status: true, invoice: newOrder });
    }

    if (endpoint === 'cancel_order') {
      const userId = body.user_id || query.user_id;
      const invoiceId = body.invoice_id || query.invoice_id;

      const idx = db.orders.findIndex(o => o.invoiceId === invoiceId && o.userId === String(userId) && o.status === 'pending');
      if (idx === -1) return res.status(404).json({ status: false, message: 'Invoice not found' });

      db.orders.splice(idx, 1);
      await saveDB(db);
      return res.json({ status: true, message: 'Invoice dibatalkan' });
    }

    if (endpoint === 'upload_proof') {
      const userId = body.user_id || query.user_id;
      const invoiceId = body.invoice_id || query.invoice_id;
      const imageBase64 = body.image_base64;

      if (!imageBase64 || imageBase64.length > 8000000) {
        return res.status(400).json({ status: false, message: 'Bukti maksimal 6MB' });
      }

      const order = db.orders.find(o => o.invoiceId === invoiceId && o.userId === String(userId));
      if (!order) return res.status(404).json({ status: false, message: 'Order tidak ditemukan' });

      order.proof = imageBase64;
      order.status = 'waiting_approval';
      await saveDB(db);

      try {
        const bot = new TelegramBot(config.BOT_TOKEN);
        for (let ownerId of OWNER_IDS) {
          await bot.sendMessage(ownerId, `📥 <b>BUKTI DEPOSIT BARU</b>\nInvoice: <code>${invoiceId}</code>\nUser: <code>${userId}</code>`);
        }
      } catch (e) {}

      return res.json({ status: true, message: 'Bukti terkirim, menunggu verifikasi' });
    }

    if (endpoint === 'claim_code') {
      const userId = body.user_id || query.user_id;
      const code = body.code || query.code;

      if (!code) return res.status(400).json({ status: false, message: 'Kode kosong' });

      const u = ensureUserInDB(db, userId);
      const cIndex = db.codes.findIndex(c => c.code.toLowerCase() === code.trim().toLowerCase());
      if (cIndex === -1) return res.status(404).json({ status: false, message: 'Kode voucher salah' });

      const v = db.codes[cIndex];
      if (v.quota !== 0 && v.used >= v.quota) {
        return res.status(400).json({ status: false, message: 'Kuota voucher habis' });
      }

      v.used += 1;
      const curr = u.premiumUntil > Date.now() ? u.premiumUntil : Date.now();
      u.premiumUntil = curr + (v.days * 86400000);
      await saveDB(db);

      return res.json({ status: true, message: `Voucher sukses! +${v.days} Hari VIP` });
    }

    if (endpoint === 'spin') {
      const userId = body.user_id || query.user_id;
      const u = ensureUserInDB(db, userId);
      const today = getJakartaISO();

      if (u.lastSpinDate === today) {
        return res.status(400).json({ status: false, message: 'Spin harian sudah dipakai' });
      }

      const prizes = [
        { label: '+50 Poin', type: 'points', value: 50, weight: 25 },
        { label: 'ZONK', type: 'none', value: 0, weight: 20 },
        { label: '+25 Poin', type: 'points', value: 25, weight: 30 },
        { label: '+100 Poin', type: 'points', value: 100, weight: 10 },
        { label: '+3 Kuota', type: 'quota', value: 3, weight: 10 },
        { label: 'VIP 1H', type: 'vip', value: 1, weight: 5 }
      ];

      let totalWeight = prizes.reduce((a, b) => a + b.weight, 0);
      let rnd = Math.floor(Math.random() * totalWeight);
      let prizeIndex = 0;

      for (let i = 0; i < prizes.length; i++) {
        if (rnd < prizes[i].weight) {
          prizeIndex = i;
          break;
        }
        rnd -= prizes[i].weight;
      }

      const prize = prizes[prizeIndex];
      u.lastSpinDate = today;

      if (prize.type === 'points') u.points += prize.value;
      if (prize.type === 'quota') u.quota += prize.value;
      if (prize.type === 'vip') {
        const base = u.premiumUntil > Date.now() ? u.premiumUntil : Date.now();
        u.premiumUntil = base + 86400000;
      }

      await saveDB(db);
      return res.json({ status: true, prizeIndex, prize });
    }

    if (endpoint === 'checkin') {
      const userId = body.user_id || query.user_id;
      const u = ensureUserInDB(db, userId);
      const today = getJakartaISO();

      if (u.lastCheckin === today) {
        return res.status(400).json({ status: false, message: 'Hari ini sudah check-in' });
      }

      const yesterday = new Date(Date.now() + (7 * 3600000) - 86400000).toISOString().split('T')[0];
      if (u.lastCheckin === yesterday) {
        u.streak = u.streak >= 7 ? 1 : u.streak + 1;
      } else {
        u.streak = 1;
      }

      u.lastCheckin = today;
      const weekRewards = {
        1: [10, 15, 20, 25, 30, 50, 100],
        2: [15, 20, 25, 30, 40, 60, 120],
        3: [20, 25, 30, 40, 50, 70, 140],
        4: [25, 30, 40, 50, 60, 80, 160]
      };

      const week = getWeekOfMonth();
      const earned = weekRewards[week][u.streak - 1];
      u.points += earned;
      await saveDB(db);

      return res.json({ status: true, message: `Check-in Berhasil! +${earned} PTS`, streak: u.streak, points: u.points });
    }

    if (endpoint === 'redeem') {
      const userId = body.user_id || query.user_id;
      const itemKey = body.item_key || query.item_key;

      const u = ensureUserInDB(db, userId);
      const store = {
        quota1: { cost: 100, act: () => { u.quota += 1; } },
        quota3: { cost: 250, act: () => { u.quota += 3; } },
        spin: { cost: 150, act: () => { u.lastSpinDate = ''; } },
        vip1: { cost: 500, act: () => { u.premiumUntil = (u.premiumUntil > Date.now() ? u.premiumUntil : Date.now()) + 86400000; } },
        vip3: { cost: 1200, act: () => { u.premiumUntil = (u.premiumUntil > Date.now() ? u.premiumUntil : Date.now()) + (3 * 86400000); } },
        bonus200: { cost: 300, act: () => { u.points += 200; } }
      };

      const target = store[itemKey];
      if (!target) return res.status(400).json({ status: false, message: 'Item tidak valid' });
      if (u.points < target.cost) return res.status(400).json({ status: false, message: 'Poin tidak cukup' });

      u.points -= target.cost;
      target.act();
      await saveDB(db);
      return res.json({ status: true, message: 'Redeem Sukses!' });
    }

    if (endpoint === 'stats') {
      const usersArr = Object.values(db.users);
      const now = Date.now();
      const pendingOrders = db.orders.filter(o => o.status === 'waiting_approval' || o.status === 'pending');
      const paidOrders = db.orders.filter(o => o.status === 'paid');

      return res.json({
        status: true,
        data: {
          revenue: db.stats.revenue || 0,
          totalUsers: usersArr.length,
          pendingCount: pendingOrders.length,
          vipCount: usersArr.filter(u => u.premiumUntil > now).length,
          totalFix: db.stats.totalFix || 0,
          voucherCount: db.codes.length,
          recentUsers: usersArr.slice(-30).reverse(),
          pendingOrders,
          paidOrders,
          codes: db.codes
        }
      });
    }

    if (endpoint === 'owner_action') {
      const ownerId = String(body.owner_id || query.owner_id || '');
      if (!OWNER_IDS.map(String).includes(ownerId)) {
        return res.status(403).json({ status: false, message: 'Access denied' });
      }

      const invoiceId = body.invoice_id || query.invoice_id;
      const action = body.action || query.action;

      const order = db.orders.find(o => o.invoiceId === invoiceId);
      if (!order) return res.status(404).json({ status: false, message: 'Invoice not found' });

      if (action === 'approve') {
        order.status = 'paid';
        const u = ensureUserInDB(db, order.userId);
        const base = u.premiumUntil > Date.now() ? u.premiumUntil : Date.now();
        u.premiumUntil = base + (order.days * 86400000);
        db.stats.revenue = (db.stats.revenue || 0) + order.amount;

        try {
          const bot = new TelegramBot(config.BOT_TOKEN);
          await bot.sendMessage(order.userId, `🟢 <b>PEMBAYARAN DISETUJUI!</b>\nVIP +${order.days} Hari Aktif.`);
        } catch (e) {}
      } else if (action === 'reject') {
        order.status = 'rejected';
        try {
          const bot = new TelegramBot(config.BOT_TOKEN);
          await bot.sendMessage(order.userId, `❌ <b>PEMBAYARAN DITOLAK!</b>\nInvoice: ${invoiceId}`);
        } catch (e) {}
      }

      await saveDB(db);
      return res.json({ status: true, message: `Order ${action}d` });
    }

    if (endpoint === 'create_code') {
      const ownerId = String(body.owner_id || query.owner_id || '');
      if (!OWNER_IDS.map(String).includes(ownerId)) return res.status(403).json({ status: false, message: 'Forbidden' });

      const code = body.code;
      const days = Number(body.days);
      const quota = Number(body.quota || 0);

      db.codes.push({ code: code.trim(), days, quota, used: 0 });
      await saveDB(db);
      return res.json({ status: true, message: 'Voucher dibuat' });
    }

    if (endpoint === 'delete_code') {
      const ownerId = String(body.owner_id || query.owner_id || '');
      if (!OWNER_IDS.map(String).includes(ownerId)) return res.status(403).json({ status: false, message: 'Forbidden' });

      const code = body.code;
      db.codes = db.codes.filter(c => c.code.toLowerCase() !== code.toLowerCase());
      await saveDB(db);
      return res.json({ status: true, message: 'Voucher dihapus' });
    }

    if (endpoint === 'broadcast') {
      const ownerId = String(body.owner_id || query.owner_id || '');
      if (!OWNER_IDS.map(String).includes(ownerId)) return res.status(403).json({ status: false, message: 'Forbidden' });

      const message = body.message;
      const usersArr = Object.values(db.users);

      try {
        const bot = new TelegramBot(config.BOT_TOKEN);
        for (let u of usersArr) {
          try {
            await bot.sendMessage(u.id, `📢 <b>BROADCAST</b>\n\n${message}`);
          } catch (e) {}
        }
      } catch (e) {}

      return res.json({ status: true, message: 'Broadcast berhasil dikirim' });
    }

    return res.status(404).json({ status: false, message: 'Endpoint not found' });
  } catch (err) {
    return res.status(500).json({ status: false, message: err.message });
  }
};
