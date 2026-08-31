const { loadDB, saveDB, UI } = require('../lib/utils');
const config = require('../config');
const TelegramBot = require('node-telegram-bot-api');

function isOwner(id) {
  return config.OWNER_IDS.map(String).includes(String(id));
}

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed' });
    const { owner_id, action, invoice } = req.body || {};
    if (!owner_id || !isOwner(owner_id)) return res.status(403).json({ ok: false, message: 'Bukan owner' });
    if (!action || !invoice) return res.status(400).json({ ok: false, message: 'action dan invoice wajib diisi' });

    const db = await loadDB();
    const pay = db.payments[invoice];
    if (!pay) return res.status(404).json({ ok: false, message: 'Invoice tidak ditemukan' });

    const bot = new TelegramBot(config.BOT_TOKEN);

    if (action === 'approve') {
      pay.status = 'paid';
      const uk = String(pay.userId);
      if (!db.users[uk]) return res.status(404).json({ ok: false, message: 'User tidak ditemukan' });
      db.users[uk].premiumUntil = Math.max(Date.now(), db.users[uk].premiumUntil || 0) + pay.days * 86400000;
      db.users[uk].notifiedExp = false;
      db.stats.revenue = (db.stats.revenue || 0) + pay.amount;
      await saveDB(db);
      try {
        await bot.sendMessage(pay.userId, `${UI.header('𝗣𝗘𝗠𝗕𝗔𝗬𝗔𝗥𝗔𝗡 𝗗𝗜𝗦𝗘𝗧𝗨𝗝𝗨𝗜', '✅')}\n🎉 Deposit <code>${invoice}</code> disetujui! VIP ${pay.days} hari aktif sampai ${new Date(db.users[uk].premiumUntil).toLocaleDateString('id-ID')}${UI.footer()}`, { parse_mode: 'HTML' });
      } catch (e) {}
      return res.json({ ok: true, message: `${invoice} approved` });
    }

    if (action === 'reject') {
      pay.status = 'rejected';
      await saveDB(db);
      try {
        await bot.sendMessage(pay.userId, `${UI.header('𝗗𝗜𝗧𝗢𝗟𝗔𝗞', '❌')}\nDeposit ${invoice} ditolak. Hubungi admin.${UI.footer()}`, { parse_mode: 'HTML' });
      } catch (e) {}
      return res.json({ ok: true, message: `${invoice} rejected` });
    }

    return res.status(400).json({ ok: false, message: 'action tidak valid' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};
