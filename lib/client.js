const config = require('../config');
let clientInstance = null;
let connecting = false;

async function getClient() {
  if (clientInstance) return clientInstance;
  if (connecting) {
    await new Promise(r => setTimeout(r, 1000));
    return clientInstance;
  }
  connecting = true;
  try {
    const { TelegramClient } = require('telegram');
    const { StringSession } = require('telegram/sessions');
    const apiId = Number(config.API_ID);
    const apiHash = config.API_HASH;
    const sessionStr = config.SESSION_STRING;
    if (!apiId || !apiHash || !sessionStr) {
      console.error('Telegram client config missing');
      connecting = false;
      return null;
    }
    const stringSession = new StringSession(sessionStr);
    const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
    await client.connect();
    clientInstance = client;
    connecting = false;
    return client;
  } catch (e) {
    console.error('getClient error', e.message);
    connecting = false;
    return null;
  }
}

async function sendToTarget(numbers) {
  const joined = String(numbers || '').trim();
  if (!joined) return { ok: false, error: 'Nomor kosong' };
  try {
    const client = await getClient();
    if (!client) {
      // Fallback mock for dev - still count as success to not block bot
      console.log('sendToTarget mock - no client, numbers:', joined.slice(0,50));
      return { ok: true, mock: true };
    }
    const target = config.TARGET_BOT || config.TARGET_BOTS?.[0] || 'cphxfixmerahBot';
    await client.sendMessage(target, { message: joined });
    return { ok: true };
  } catch (e) {
    console.error('sendToTarget error', e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { sendToTarget, getClient };
