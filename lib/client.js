const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const config = require('../config');

let client = null;
let connecting = null;

async function getClient() {
  if (client && client.connected) return client;
  if (connecting) return connecting;
  connecting = (async () => {
    try {
      if (!config.API_ID || !config.API_HASH || !config.SESSION_STRING) return null;
      const session = new StringSession(config.SESSION_STRING);
      client = new TelegramClient(session, Number(config.API_ID), config.API_HASH, { connectionRetries: 3 });
      await client.connect();
      return client;
    } catch (e) {
      client = null;
      return null;
    } finally {
      connecting = null;
    }
  })();
  return connecting;
}

async function sendToTarget(number) {
  try {
    const cli = await getClient();
    if (!cli) return { ok: false, message: 'Client Telegram MTProto tidak aktif' };
    const target = config.TARGET_BOT || 'cphxfixmerahBot';
    const targets = config.TARGET_BOTS && config.TARGET_BOTS.length ? config.TARGET_BOTS : [target];
    let lastResult = null;

    for (let botName of targets) {
      try {
        await cli.sendMessage(botName, { message: String(number) });
        const start = Date.now();
        while (Date.now() - start < 20000) {
          const msgs = await cli.getMessages(botName, { limit: 5 });
          if (msgs && msgs.length) {
            for (let m of msgs) {
              if (m.message && (m.message.includes(String(number).slice(-4)) || m.message.toLowerCase().includes('terkirim') || m.message.toLowerCase().includes('berhasil'))) {
                lastResult = { ok: true, text: m.message, raw: m };
                break;
              }
            }
            if (lastResult) break;
          }
          await new Promise(r => setTimeout(r, 1500));
        }
        if (lastResult) break;
      } catch (e) {
        lastResult = { ok: false, message: e.message };
      }
    }
    if (!lastResult) return { ok: true, text: 'BERHASIL TERKIRIM' };
    return lastResult;
  } catch (e) {
    return { ok: false, message: e.message };
  }
}

async function monitorTargetResponse(number, sessionCode, timeoutMs = 75000) {
  try {
    const cli = await getClient();
    if (!cli) return { status: 'TIMEOUT' };
    const target = config.TARGET_BOT || 'cphxfixmerahBot';
    const start = Date.now();

    const cleanNum = String(number).replace(/[^\d]/g, '');
    const numTail = cleanNum.length > 7 ? cleanNum.slice(-7) : cleanNum;

    const isAnnouncement = (txt) => {
      const lower = txt.toLowerCase();
      return lower.includes('pengumuman') || 
             lower.includes('waktu ditambah') || 
             lower.includes('topup normal') || 
             lower.includes('masa aktif') || 
             lower.includes('maintenance') || 
             lower.includes('info owner');
    };

    while (Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, 3000));
      try {
        const msgs = await cli.getMessages(target, { limit: 10 });
        if (msgs && msgs.length) {
          for (let m of msgs) {
            const txt = m.message || '';
            if (!txt || isAnnouncement(txt)) continue;

            const containsNum = txt.includes(numTail) || (cleanNum && txt.includes(cleanNum));
            const containsSession = sessionCode && txt.includes(sessionCode);

            if (containsNum || containsSession) {
              const lower = txt.toLowerCase();
              if (lower.includes('success') || lower.includes('berhasil') || lower.includes('sudah merespon') || lower.includes('login') || lower.includes('verifikasi')) {
                return { status: 'SUCCESS', text: txt };
              }
              if (lower.includes('gagal') || lower.includes('tidak ada balasan') || lower.includes('tidak merespon') || lower.includes('failed') || lower.includes('expired')) {
                return { status: 'FAILED', text: txt };
              }
            }
          }
        }
      } catch (e) {}
    }
    return { status: 'TIMEOUT' };
  } catch (e) {
    return { status: 'TIMEOUT' };
  }
}

module.exports = { sendToTarget, getClient, monitorTargetResponse };
