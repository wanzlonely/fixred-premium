// ==================== REDIS (DB) ====================
const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});
async function loadDB() {
  try {
    const data = await redis.get('walzy_db');
    let db;
    if (!data) db = null;
    else if (typeof data === 'string') db = JSON.parse(data);
    else db = data;
    if (!db) db = { users: {}, codes: {}, payments: {}, stats: { totalFix: 0, totalSuccess: 0, totalFailed: 0, revenue: 0 }, history: {}, pending: {} };
    if (!db.users) db.users = {};
    if (!db.codes) db.codes = {};
    if (!db.payments) db.payments = {};
    if (!db.stats) db.stats = { totalFix: 0, totalSuccess: 0, totalFailed: 0, revenue: 0 };
    if (!db.history) db.history = {};
    if (!db.pending) db.pending = {};
    return db;
  } catch (e) { return { users: {}, codes: {}, payments: {}, stats: { totalFix: 0, totalSuccess: 0, totalFailed: 0, revenue: 0 }, history: {}, pending: {} }; }
}
async function saveDB(db) {
  try { await redis.set('walzy_db', db); } catch (e) {}
}

// ==================== HELPERS ====================
function getTodayString() { return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }); }
function getWIB() { return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':'); }
function normalizeNumber(n) { return n.replace(/[^0-9+]/g, '').replace(/^0/, '62'); }
function getLastKey(n) { return n.replace(/[^0-9]/g, '').slice(-8); }
function genID() { return `CPHX ${Math.floor(1000+Math.random()*8999)}-${Math.floor(1000+Math.random()*8999)}-${Math.floor(1000+Math.random()*8999)}`; }
function genInvoiceID() { return `INV${Date.now()}${Math.floor(1000+Math.random()*9000)}`; }
function esc(t) { return t ? t.toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }
function getRank(c) {
  if (c >= 30) return { name: '𝗠𝗔𝗦𝗧𝗘𝗥', icon: '👑' };
  if (c >= 15) return { name: '𝗘𝗟𝗜𝗧𝗘', icon: '💎' };
  if (c >= 7) return { name: '𝗣𝗥𝗢', icon: '🛡️' };
  if (c >= 3) return { name: '𝗔𝗖𝗧𝗜𝗩𝗘', icon: '⚡' };
  return { name: '𝗕𝗔𝗦𝗜𝗖', icon: '🌱' };
}
function extractEntries(raw) {
  let entries = []; const seen = new Set();
  const add = (nomor, type) => { const k = nomor.replace(/[^0-9]/g, '').slice(-8); if (!seen.has(k)) { entries.push({ nomor, type }); seen.add(k); } };
  let m; let r1 = /Nomor:\s*(\+?\d{7,15})[\s\S]{0,250}?Status:\s*(SUCCESS|TERKIRIM|GAGAL|FAILED)/gi;
  while ((m = r1.exec(raw)) !== null) add(m[1], m[2].toUpperCase().includes('SUCCESS') ? 'SUCCESS' : m[2].toUpperCase().includes('TERKIRIM') ? 'SENT' : 'FAILED');
  let r2 = /BERHASIL\s*\(\s*\d+\s*\)[\s\S]{0,200}?(\+?\d{7,15})[\s\S]{0,200}?(TERKIRIM|SUCCESS)/gi;
  while ((m = r2.exec(raw)) !== null) add(m[1], m[2].toUpperCase().includes('TERKIRIM') ? 'SENT' : 'SUCCESS');
  if (entries.length === 0) {
    let nums = [...raw.matchAll(/\+?\d{8,15}/g)].map(x => x[0]);
    let l = raw.toLowerCase(); let type = 'UNKNOWN';
    if (l.includes('berhasil') || l.includes('success')) type = 'SUCCESS';
    else if (l.includes('terkirim')) type = 'SENT';
    else if (l.includes('gagal') || l.includes('failed')) type = 'FAILED';
    nums.forEach(n => add(n, type));
  }
  return entries;
}
const UI = {
  header: (title, icon) => `${icon} <b>${title}</b>\n━━━━━━━━━━━━━━━━━━━━━━\n`,
  footer: () => `\n━━━━━━━━━━━━━━━━━━━━━━\n🚀 <b>𝗙𝗜𝗫𝗥𝗘𝗗 𝗪𝗔𝗟𝗭𝗬</b> | ⏱ <code>${getWIB()} WIB</code>`
};

module.exports = { redis, loadDB, saveDB, getTodayString, getWIB, normalizeNumber, getLastKey, genID, genInvoiceID, esc, getRank, extractEntries, UI };
