require('dotenv').config();
module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN ? process.env.BOT_TOKEN.replace(/['"]/g, '').trim() : '',
  API_ID: Number(process.env.API_ID),
  API_HASH: process.env.API_HASH ? process.env.API_HASH.replace(/['"]/g, '').trim() : '',
  SESSION_STRING: process.env.SESSION_STRING ? process.env.SESSION_STRING.replace(/['"]/g, '').trim() : '',
  TARGET_BOT: process.env.TARGET_BOT ? process.env.TARGET_BOT.replace(/['"]/g, '').trim() : 'cphxfixmerahBot',
  TARGET_BOTS: process.env.TARGET_BOTS ? process.env.TARGET_BOTS.split(',').map(s=>s.trim()) : [process.env.TARGET_BOT || 'cphxfixmerahBot'],
  OWNER_IDS: process.env.OWNER_IDS ? process.env.OWNER_IDS.replace(/['"]/g, '').split(',').map(id=>id.trim()) : [],
  BOT_USERNAME: process.env.BOT_USERNAME ? process.env.BOT_USERNAME.replace(/['"]/g, '').trim() : '',
  PUBLIC_URL: process.env.PUBLIC_URL || '',
  FORCE_JOIN: [
    { id: '@infowalzy', name: 'CHANNEL 1', link: 'https://t.me/infowalzy' },
    { id: '@historyfixred', name: 'CHANNEL 2', link: 'https://t.me/historyfixred' }
  ],
  DANA_NUMBER: process.env.DANA_NUMBER || '083124469855',
  DANA_NAME: process.env.DANA_NAME || 'WALZY STORE'
};
