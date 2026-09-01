const TelegramBot = require('node-telegram-bot-api');
const { loadDB, saveDB, getTodayString, esc, getRank } = require('../lib/utils');
const config = require('../config');

function isOwner(id) {
  if (!config.OWNER_IDS || !Array.isArray(config.OWNER_IDS)) return false;
  return config.OWNER_IDS.map(String).includes(String(id));
}

function getWebappUrl(req) {
  if (config.PUBLIC_URL && config.PUBLIC_URL.startsWith('http')) {
    return config.PUBLIC_URL.endsWith('/') ? `${config.PUBLIC_URL}webapp` : `${config.PUBLIC_URL}/webapp`;
  }
  const host = req ? (req.headers.host || req.headers['x-forwarded-host'] || 'localhost') : 'localhost';
  const proto = req ? (req.headers['x-forwarded-proto'] || 'https') : 'https';
  return `${proto}://${host}/webapp`;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(200).send('Bot API Ready');

  const bot = new TelegramBot(config.BOT_TOKEN);

  try {
    const update = req.body;
    if (!update) return res.status(200).send('OK');

    const webappUrl = getWebappUrl(req);
    const db = await loadDB();

    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const uid = String(msg.from.id);
      const text = (msg.text || '').trim();

      if (isOwner(uid)) {
        if (text === '⚡ Fix Merah') {
          await bot.sendMessage(chatId, '🛠️ Modul Fix Merah Aktif! Kirim nomor target.');
          return res.status(200).send('OK');
        }

        const pendingCount = (db.orders || []).filter(o => o.status === 'pending' || o.status === 'waiting_approval').length;
        const ownerMenuTxt = `WALZY STORE - OWNER\nHalo ${esc(msg.from.first_name || 'Owner')}!\nPending: ${pendingCount} transaksi menunggu verifikasi.\n\nGunakan menu di bawah:`;

        await bot.sendMessage(chatId, ownerMenuTxt, {
          reply_markup: {
            keyboard: [
              [{ text: '⚡ Fix Merah' }, { text: 'Web Control', web_app: { url: `${webappUrl}?admin=true` } }]
            ],
            resize_keyboard: true
          }
        });
        return res.status(200).send('OK');
      }

      if (text === '⚡ Fix Merah') {
        await bot.sendMessage(chatId, '🛠️ Modul Fix Merah Aktif! Kirim nomor target.');
        return res.status(200).send('OK');
      }

      if (text === 'Buka Toko') {
        await bot.sendMessage(chatId, 'Silakan buka toko melalui link berikut:', {
          reply_markup: {
            inline_keyboard: [[{ text: '🌐 Buka Web Store', web_app: { url: webappUrl } }]]
          }
        });
        return res.status(200).send('OK');
      }

      if (text === 'Hubungi Admin') {
        await bot.sendMessage(chatId, 'Silakan hubungi admin resmi di @AdminSupport');
        return res.status(200).send('OK');
      }

      if (text === 'Panduan') {
        await bot.sendMessage(chatId, 'Panduan Penggunaan Walzy Store:\n1. Klik Buka Toko untuk transaksi.\n2. Klik ⚡ Fix Merah untuk fitur fix.\n3. Hubungi admin jika butuh bantuan.');
        return res.status(200).send('OK');
      }

      const userMenuTxt = `✨ WALZY STORE CYBER PLATFORM ✨\nHalo ${esc(msg.from.first_name || 'User')}! Selamat datang kembali.`;

      await bot.sendMessage(chatId, userMenuTxt, {
        reply_markup: {
          keyboard: [
            [{ text: '⚡ Fix Merah' }, { text: 'Buka Toko' }],
            [{ text: 'Hubungi Admin' }, { text: 'Panduan' }]
          ],
          resize_keyboard: true
        }
      });
      return res.status(200).send('OK');
    }

    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('Internal Error');
  }
};
