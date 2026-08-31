const { Redis } = require('@upstash/redis');

let redis = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    });
  } else {
    redis = Redis.fromEnv();
  }
} catch (e) {
  redis = null;
}

const DEFAULT_DB = {
  users: {},
  payments: {},
  codes: {},
  stats: { totalFix: 0, totalSuccess: 0, totalFailed: 0, revenue: 0, revenueHistory: [], lastReset: Date.now() },
  history: {},
  pending: {},
  supportMap: {},
  securityLog: []
};

async function loadDB() {
  try {
    if (redis) {
      const data = await redis.get('walzy:db');
      if (data) {
        if (typeof data === 'string') {
          try { return JSON.parse(data); } catch { return data; }
        }
        return data;
      }
      return JSON.parse(JSON.stringify(DEFAULT_DB));
    }
  } catch (e) {
    console.error('loadDB redis error', e.message);
  }
  return JSON.parse(JSON.stringify(DEFAULT_DB));
}

async function saveDB(db) {
  try {
    if (redis) {
      await redis.set('walzy:db', JSON.stringify(db));
    }
  } catch (e) {
    console.error('saveDB redis error', e.message);
  }
}

function getTodayString() {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function genID() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function genInvoiceID() {
  return 'WALZY-' + Date.now().toString().slice(-6) + '-' + Math.random().toString(36).substring(2, 5).toUpperCase();
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getRank(count) {
  const c = Number(count) || 0;
  if (c >= 100) return { name: 'SULTAN', icon: '👑' };
  if (c >= 50) return { name: 'DIAMOND', icon: '💎' };
  if (c >= 20) return { name: 'GOLD', icon: '🥇' };
  if (c >= 10) return { name: 'SILVER', icon: '🥈' };
  if (c >= 5) return { name: 'BRONZE', icon: '🥉' };
  return { name: 'BASIC', icon: '🌱' };
}

function isValidNumber(num) {
  const s = String(num).replace(/[^0-9]/g, '');
  if (s.length < 8 || s.length > 15) return false;
  return true;
}

const UI = {
  header: (title, icon) => `${icon || '⚡️'} <b>${title}</b>\n━━━━━━━━━━━━━━━━━━━━━━━`,
  footer: () => `━━━━━━━━━━━━━━━━━━━━━━━\n🚀 <b>WALZY STORE</b> | ${new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`
};

function rankLine(user) {
  const r = getRank(user.referralCount || 0);
  return `${r.icon} ${r.name}`;
}

module.exports = {
  loadDB,
  saveDB,
  getTodayString,
  genID,
  genInvoiceID,
  esc,
  getRank,
  isValidNumber,
  UI,
  rankLine
};
