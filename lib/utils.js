const { Redis } = require('@upstash/redis');
const config = require('../config');

const DB_KEY = 'walzy:db';

let redisClient = null;
function getRedis() {
  if (redisClient) return redisClient;
  const url = config.UPSTASH_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = config.UPSTASH_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Kredensial Upstash Redis tidak ditemukan');
  redisClient = new Redis({ url, token });
  return redisClient;
}

function defaultDB() {
  return {
    users: {},
    payments: {},
    codes: {},
    stats: { totalFix: 0, totalSuccess: 0, totalFailed: 0, revenue: 0, revenueHistory: [], lastReset: Date.now() }
  };
}

async function loadDB() {
  try {
    const redis = getRedis();
    const raw = await redis.get(DB_KEY);
    if (!raw) return defaultDB();
    if (typeof raw === 'string') {
      try { return JSON.parse(raw); } catch (e) { return defaultDB(); }
    }
    return raw;
  } catch (e) {
    console.error('loadDB Error:', e.message);
    return defaultDB();
  }
}

async function saveDB(db) {
  try {
    const redis = getRedis();
    await redis.set(DB_KEY, JSON.stringify(db));
    return true;
  } catch (e) {
    console.error('saveDB Error:', e.message);
    return false;
  }
}

function getTodayString() {
  const now = new Date();
  const jakartaOffset = 7 * 60;
  const localMs = now.getTime() + (jakartaOffset - now.getTimezoneOffset()) * 60000;
  const jakartaDate = new Date(localMs);
  const y = jakartaDate.getFullYear();
  const m = String(jakartaDate.getMonth() + 1).padStart(2, '0');
  const d = String(jakartaDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function esc(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const RANK_TIERS = [
  { min: 0, name: 'Pemula', icon: '🌱' },
  { min: 5, name: 'Aktif', icon: '⚡' },
  { min: 15, name: 'Veteran', icon: '🔥' },
  { min: 30, name: 'Elite', icon: '💎' },
  { min: 60, name: 'Legend', icon: '👑' },
  { min: 100, name: 'Mythic', icon: '🏆' }
];

function getRank(referralCount) {
  const count = Number(referralCount) || 0;
  let current = RANK_TIERS[0];
  for (let tier of RANK_TIERS) {
    if (count >= tier.min) current = tier;
  }
  const nextTier = RANK_TIERS.find(t => t.min > current.min) || null;
  return {
    name: current.name,
    icon: current.icon,
    min: current.min,
    nextName: nextTier ? nextTier.name : null,
    nextMin: nextTier ? nextTier.min : null,
    toNext: nextTier ? Math.max(0, nextTier.min - count) : 0
  };
}

function genInvoiceID() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `WLZ-${ts}-${rand}`;
}

module.exports = { loadDB, saveDB, getTodayString, esc, getRank, genInvoiceID, getRedis };
