const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, '../db.json');

let inMemoryDB = {
  users: {},
  payments: {},
  codes: {},
  stats: { totalFix: 0, totalSuccess: 0, totalFailed: 0, revenue: 0, revenueHistory: [], lastReset: Date.now() },
  history: {}
};

async function loadDB() {
  try {
    const data = await fs.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(data);
    inMemoryDB = { ...inMemoryDB, ...parsed };
    return inMemoryDB;
  } catch (e) {
    return inMemoryDB;
  }
}

async function saveDB(db) {
  try {
    inMemoryDB = db;
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {}
}

function getTodayString() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function genInvoiceID() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `WALZY-INV-${Date.now().toString().slice(-4)}${rand}`;
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getRank(c) {
  if (c >= 100) return { name: 'EXECUTIVE SULTAN', icon: '👑', color: '#f59e0b' };
  if (c >= 50) return { name: 'DIAMOND ELITE', icon: '💎', color: '#06b6d4' };
  if (c >= 20) return { name: 'GOLD TIER', icon: '🥇', color: '#eab308' };
  if (c >= 10) return { name: 'SILVER TIER', icon: '🥈', color: '#94a3b8' };
  if (c >= 5) return { name: 'BRONZE TIER', icon: '🥉', color: '#d97706' };
  return { name: 'BASIC ACCESS', icon: '🌱', color: '#10b981' };
}

module.exports = {
  loadDB,
  saveDB,
  getTodayString,
  genInvoiceID,
  esc,
  getRank
};
