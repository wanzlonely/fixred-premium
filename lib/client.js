const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
let clientInstance = null;
async function getClient() {
  const sessionStr = process.env.SESSION_STRING || '';
  let stringSession;
  try { stringSession = new StringSession(sessionStr); } catch (e) { stringSession = new StringSession(''); }
  const apiId = Number(process.env.API_ID);
  const apiHash = process.env.API_HASH;
  const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 2 });
  await client.connect();
  return client;
}
async function sendToTarget(text) {
  const target = process.env.TARGET_BOT || 'cphxfixmerahBot';
  let client;
  try {
    client = await getClient();
    await client.sendMessage(target, { message: text });
    const newSession = client.session.save();
    if (newSession && newSession !== process.env.SESSION_STRING) {
      console.log('New session generated, update env manually if needed');
    }
    await client.disconnect();
    return { ok: true };
  } catch (e) {
    try { if (client) await client.disconnect(); } catch {}
    return { ok: false, error: e.message };
  }
}
async function fetchTargetMessages(limit = 20) {
  const target = process.env.TARGET_BOT || 'cphxfixmerahBot';
  let client;
  try {
    client = await getClient();
    const messages = await client.getMessages(target, { limit });
    await client.disconnect();
    return messages.map(m => m.message).filter(Boolean);
  } catch (e) {
    try { if (client) await client.disconnect(); } catch {}
    return [];
  }
}
module.exports = { getClient, sendToTarget, fetchTargetMessages };
