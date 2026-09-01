const config = require('../config');

const DB_KEY = 'walzy:db';

const EMPTY_DB = {
  users: {},
  payments: {},
  codes: {},
  stats: { totalFix: 0, totalSuccess: 0, totalFailed: 0, revenue: 0, revenueHistory: [], lastReset: Date.now() }
};

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}

async function redisRequest(command) {
  const cfg = getRedisConfig();
  if (!cfg) throw new Error('UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN belum diset di environment variables');

  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Upstash Redis error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.result;
}

async function loadDB() {
  try {
    const raw = await redisRequest(['GET', DB_KEY]);
    if (!raw) return JSON.parse(JSON.stringify(EMPTY_DB));
    const parsed = JSON.parse(raw);
    if (!parsed.users) parsed.users = {};
    if (!parsed.payments) parsed.payments = {};
    if (!parsed.codes) parsed.codes = {};
    if (!parsed.stats) parsed.stats = JSON.parse(JSON.stringify(EMPTY_DB.stats));
    return parsed;
  } catch (e) {
    console.error('loadDB error:', e.message);
    return JSON.parse(JSON.stringify(EMPTY_DB));
  }
}

async function saveDB(db) {
  try {
    await redisRequest(['SET', DB_KEY, JSON.stringify(db)]);
    return true;
  } catch (e) {
    console.error('saveDB error:', e.message);
    return false;
  }
}

function getTodayString() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const RANKS = [
  { min: 0, icon: '🌱', name: 'Pemula' },
  { min: 5, icon: '⭐', name: 'Bronze' },
  { min: 15, icon: '🥈', name: 'Silver' },
  { min: 30, icon: '🥇', name: 'Gold' },
  { min: 60, icon: '💎', name: 'Platinum' },
  { min: 100, icon: '👑', name: 'Legend' }
];

function getRank(referralCount) {
  const count = Number(referralCount) || 0;
  let current = RANKS[0];
  for (const r of RANKS) {
    if (count >= r.min) current = r;
  }
  return current;
}

function genInvoiceID() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${ts}-${rand}`;
}

module.exports = { loadDB, saveDB, getTodayString, esc, getRank, genInvoiceID };
