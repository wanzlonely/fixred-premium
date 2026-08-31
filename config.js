require('dotenv').config();
module.exports={
BOT_TOKEN: process.env.BOT_TOKEN ? process.env.BOT_TOKEN.replace(/['"]/g, '').trim() : '',
API_ID: Number(process.env.API_ID),
API_HASH: process.env.API_HASH ? process.env.API_HASH.replace(/['"]/g, '').trim() : '',
SESSION_STRING: process.env.SESSION_STRING ? process.env.SESSION_STRING.replace(/['"]/g, '').trim() : '',
TARGET_BOT: process.env.TARGET_BOT ? process.env.TARGET_BOT.replace(/['"]/g, '').trim() : 'cphxfixmerahBot',
TARGET_BOTS: process.env.TARGET_BOTS ? process.env.TARGET_BOTS.split(',').map(s=>s.trim()).filter(Boolean) : [process.env.TARGET_BOT || 'cphxfixmerahBot'],
OWNER_IDS: process.env.OWNER_IDS ? process.env.OWNER_IDS.replace(/['"]/g, '').split(',').map(id=>id.trim()).filter(Boolean) : [],
BOT_USERNAME: process.env.BOT_USERNAME ? process.env.BOT_USERNAME.replace(/['"]/g, '').trim() : '',
PUBLIC_URL: process.env.PUBLIC_URL ? process.env.PUBLIC_URL.replace(/['"]/g, '').trim() : '',
FORCE_JOIN:[
{id:'@infowalzy',title:'INFO WALZY',url:'https://t.me/infowalzy'},
{id:'@historyfixred',title:'HISTORY FIXRED',url:'https://t.me/historyfixred'}
],
DANA_NUMBER: process.env.DANA_NUMBER ? process.env.DANA_NUMBER.replace(/['"]/g, '').trim() : '083124469855',
DANA_NAME: process.env.DANA_NAME ? process.env.DANA_NAME.replace(/['"]/g, '').trim() : 'WALZY STORE'
};
