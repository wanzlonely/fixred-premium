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

async function monitorTargetResponse(number, targetIdStr, timeoutMs = 75000) {
  try {
    const cli = await getClient();
    if (!cli) return { status: 'TIMEOUT' };
    const target = config.TARGET_BOT || 'cphxfixmerahBot';
    const start = Date.now();
    const numTail = String(number).slice(-6);

    while (Date.now() - start < timeoutMs) {
      await new Promise(r => setTimeout(r, 4000));
      try {
        const msgs = await cli.getMessages(target, { limit: 5 });
        if (msgs && msgs.length) {
          for (let m of msgs) {
            const txt = m.message || '';
            if (txt.includes(numTail)) {
              if (txt.toLowerCase().includes('success') || txt.toLowerCase().includes('berhasil') || txt.toLowerCase().includes('sudah merespon') || txt.toLowerCase().includes('login')) {
                return { status: 'SUCCESS', text: txt };
              }
              if (txt.toLowerCase().includes('gagal') || txt.toLowerCase().includes('tidak ada balasan') || txt.toLowerCase().includes('tidak merespon')) {
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
