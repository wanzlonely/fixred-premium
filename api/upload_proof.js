const { loadDB, saveDB, UI } = require('../lib/utils');
const config = require('../config');
const TelegramBot = require('node-telegram-bot-api');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, message: 'Method not allowed' });
    const { user_id, invoice, image_base64 } = req.body || {};
    if (!user_id || !invoice || !image_base64) return res.status(400).json({ ok: false, message: 'user_id, invoice, image_base64 wajib diisi' });

    const db = await loadDB();
    const k = String(user_id);
    const pay = db.payments[invoice];
    if (!pay) return res.status(404).json({ ok: false, message: 'Invoice tidak ditemukan' });
    if (String(pay.userId) !== k) return res.status(403).json({ ok: false, message: 'Invoice bukan milik user ini' });

    const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    pay.status = 'waiting_approval';
    if (db.users[k]) db.users[k].pendingDeposit = null;
    await saveDB(db);

    const bot = new TelegramBot(config.BOT_TOKEN);
    const u = db.users[k] || {};
    for (let oid of config.OWNER_IDS) {
      try {
        await bot.sendPhoto(oid, buffer, {
          caption: `📩 <b>DEPOSIT MANUAL BARU (WEBAPP)</b>\n━━━━━━━━━━━━━━\n🧾 Invoice: <code>${invoice}</code>\n👤 User: <code>${k}</code> @${u.username || '-'}\n💎 Paket: ${pay.days} Hari - Rp ${pay.amount.toLocaleString()}\n🏦 Tujuan: ${config.DANA_NAME} ${config.DANA_NUMBER}`,
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '✅ APPROVE', callback_data: `approve_${invoice}` }, { text: '❌ REJECT', callback_data: `reject_${invoice}` }]]
          }
        }, { filename: 'proof.jpg', contentType: 'image/jpeg' });
      } catch (e) {}
    }

    try {
      await bot.sendMessage(k, `${UI.header('𝗕𝗨𝗞𝗧𝗜 𝗗𝗜𝗧𝗘𝗥𝗜𝗠𝗔', '✅')}\nBukti transfer untuk <code>${invoice}</code> berhasil diterima via WebApp.\n\n⏳ <i>Menunggu konfirmasi admin max 1x24 jam.</i>${UI.footer()}`, { parse_mode: 'HTML' });
    } catch (e) {}

    return res.json({ ok: true, message: 'Bukti transfer berhasil diunggah dan diteruskan ke admin' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
};
