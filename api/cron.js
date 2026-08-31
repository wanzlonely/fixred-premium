const { loadDB, saveDB, extractEntries } = require('../lib/utils');
const { fetchTargetMessages } = require('../lib/client');
const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');

// ==================== JOB: check ====================
async function jobCheck(bot, res) {
  const db = await loadDB();
  const messages = await fetchTargetMessages(15);
  if (messages.length === 0) return res.json({ ok: true, msg: 'no messages' });
  let processed = 0;
  for (let raw of messages) {
    if (!/SUCCESS|BERHASIL|TERKIRIM|GAGAL|FAILED/i.test(raw)) continue;
    const entries = extractEntries(raw);
    if (entries.length === 0) continue;
    for (let e of entries) {
      const last8 = e.nomor.replace(/[^0-9]/g, '').slice(-8);
      for (let pid in db.pending) {
        const p = db.pending[pid];
        if (p.handled) continue;
        const match = p.originalNumbers.some(n => n.includes(last8) || last8.includes(n.slice(-8)));
        if (match) {
          p.handled = true;
          db.stats.totalSuccess = (db.stats.totalSuccess || 0) + 1;
          let icon = (e.type === 'SUCCESS' || e.type === 'SENT') ? 'YES' : 'NO';
          let text = icon + ' HASIL FIXMERAH Nomor: ' + e.nomor + ' Status: ' + e.type + ' Batch: ' + p.batchId;
          try { await bot.sendMessage(p.chatId, text); } catch {}
          processed++;
        }
      }
    }
  }
  await saveDB(db);
  res.json({ ok: true, processed });
}

// ==================== JOB: notify ====================
async function jobNotify(bot, res) {
  const db = await loadDB();
  const now = Date.now();
  for (let uid in db.users) {
    const u = db.users[uid];
    if (!u.premiumUntil) continue;
    const left = u.premiumUntil - now;
    if (left < 172800000 && left > 86400000 && !u.notifiedExp) {
      try { await bot.sendMessage(uid, 'VIP akan habis 2 hari lagi!'); u.notifiedExp = true; } catch {}
    }
    if (left <= 0 && u.notifiedExp) {
      try { await bot.sendMessage(uid, 'VIP habis.'); u.notifiedExp = false; } catch {}
    }
  }
  await saveDB(db);
  res.json({ ok: true });
}

// ==================== HANDLER ====================
module.exports = async (req, res) => {
  const bot = new TelegramBot(config.BOT_TOKEN);
  const job = req.query.job;
  try {
    if (job === 'check') return await jobCheck(bot, res);
    if (job === 'notify') return await jobNotify(bot, res);
    res.status(400).json({ ok: false, error: 'Query ?job= harus diisi: check atau notify' });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
};
