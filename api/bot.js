const TelegramBot = require('node-telegram-bot-api');
const { loadDB, saveDB, getTodayString, esc, getRank } = require('../lib/utils');
const config = require('../config');
const rateLimitMap = new Map();
function isOwner(id){if(!config.OWNER_IDS || !Array.isArray(config.OWNER_IDS)) return false;return config.OWNER_IDS.map(String).includes(String(id));}
function isSuspiciousId(id){if(!id) return true;const s=String(id);const n=Number(id);if(!n || n<=0 || s.startsWith('-')) return true;return false;}
function ensureDB(db){if(!db.users) db.users={};if(!db.payments) db.payments={};if(!db.codes) db.codes={};if(!db.stats) db.stats={totalFix:0,totalSuccess:0,totalFailed:0,revenue:0,revenueHistory:[],lastReset:Date.now()};}
function checkRateLimit(id){const now=Date.now();const last=rateLimitMap.get(String(id))||0;if(now-last<500) return false;rateLimitMap.set(String(id),now);return true;}
function getUser(db, id, msgFrom){const k=String(id);if(isSuspiciousId(k)) return null;const firstName=msgFrom && msgFrom.first_name ? msgFrom.first_name : 'User';const username=msgFrom && msgFrom.username ? msgFrom.username : '';if(!db.users[k]){db.users[k]={id:Number(id)||id,first_name:firstName,username:username,joinedAt:Date.now(),referralCount:0,referrals:[],referredBy:null,totalFix:0,dailyFix:{date:getTodayString(),count:0},premiumUntil:0,lastSpin:null,points:0,checkinStreak:0,lastCheckin:null,state:null};}else{if(firstName && db.users[k].first_name!==firstName) db.users[k].first_name=firstName;if(username!==undefined && db.users[k].username!==username) db.users[k].username=username;}return db.users[k];}
function isPremium(u){return u && u.premiumUntil && u.premiumUntil>Date.now();}
function getPremiumLeft(u){if(!isPremium(u)) return null;return Math.ceil((u.premiumUntil-Date.now())/86400000);}
function getWebappUrl(req){if(config.PUBLIC_URL && config.PUBLIC_URL.startsWith('http')){return config.PUBLIC_URL.endsWith('/') ? `${config.PUBLIC_URL}webapp` : `${config.PUBLIC_URL}/webapp`;}const host=req.headers.host||req.headers['x-forwarded-host']||'localhost';const proto=req.headers['x-forwarded-proto']||'https';return `${proto}://${host}/webapp`;}
function getOwnerMenu(user, chatId, db, webappUrl){
const pendingCount=Object.values(db.payments||{}).filter(p=>p.status==='waiting_approval' || p.status==='pending').length;
const usersCount=Object.keys(db.users||{}).length;
const revenue=db.stats && db.stats.revenue ? db.stats.revenue : 0;
const dispName=esc(user.first_name||'Owner');
const text=`<b>WALZY OWNER</b>\n\nHalo <b>${dispName}</b>\n\n👥 ${usersCount} Users • 💰 Rp ${revenue.toLocaleString('id-ID')} • 📥 ${pendingCount} Pending\n\nKelola di dashboard:`;
const keyboard=[[{text:'⚡ Fix Merah', callback_data:'fix_merah'}],[{text:'Buka Dashboard', callback_data:'open_dashboard'}],[{text:'Web Control', web_app:{url:webappUrl}}]];
return {text, opts:{parse_mode:'HTML', reply_markup:{inline_keyboard:keyboard}}};
}
function getUserMenu(user, chatId, webappUrl){
const rnk=getRank(user.referralCount||0);
const isPrem=isPremium(user);
if(!user.dailyFix || user.dailyFix.date!==getTodayString()){user.dailyFix={date:getTodayString(),count:0};}
const quota=isPrem ? 'Unlimited' : `${Math.max(0,5-(user.dailyFix.count||0))}/5`;
const dispName=esc(user.first_name||'User');
const status=isPrem ? `VIP ${getPremiumLeft(user)}H` : 'Free';
const text=`<b>WALZY STORE</b>\n\nHalo <b>${dispName}</b> • ${rnk.icon} ${rnk.name}\n${status} • Kuota ${quota} • ${user.points||0} Poin\n\nBuka toko untuk produk, daily, dan spin:`;
const keyboard=[[{text:'⚡ Fix Merah', callback_data:'fix_merah'}],[{text:'Buka Toko', web_app:{url:webappUrl}}],[{text:'Hubungi Admin', callback_data:'contact_owner'}, {text:'Panduan', callback_data:'help'}]];
return {text, opts:{parse_mode:'HTML', reply_markup:{inline_keyboard:keyboard}}};
}
module.exports = async (req, res) => {
if(req.method!=='POST') return res.status(200).send('WALZY BOT V6 TOTAL ONLINE');
const bot=new TelegramBot(config.BOT_TOKEN);
try{
const db=await loadDB();
ensureDB(db);
const update=req.body;
if(!update) return res.status(200).send('OK');
const webappUrl=getWebappUrl(req);
if(update.callback_query){
const q=update.callback_query;
const qId=q.id;
const uid=q.from.id;
const data=q.data;
if(!checkRateLimit(uid)){try{await bot.answerCallbackQuery(qId,{text:'Tunggu'});}catch(e){}return res.status(200).send('OK');}
const user=getUser(db, uid, q.from);
if(!user) return res.status(200).send('OK');
if(data==='fix_merah'){
await bot.answerCallbackQuery(qId,{text:'Fix Merah'});
user.state={action:'awaiting_fixmerah_number'};
await saveDB(db);
await bot.sendMessage(uid, `<b>Fix Merah</b>\n\nKirim nomor WA:\n<code>08123456789</code>`, {parse_mode:'HTML'});
return res.status(200).send('OK');
}
if(data==='open_dashboard'){
await bot.answerCallbackQuery(qId,{text:'Dashboard'});
await bot.sendMessage(uid, `<b>Dashboard Owner</b>\n\nBuka Web Control untuk kelola Users, Deposit, Voucher, Broadcast.`, {parse_mode:'HTML', reply_markup:{inline_keyboard:[[{text:'Web Control', web_app:{url:webappUrl}}]]}});
return res.status(200).send('OK');
}
if(data==='contact_owner'){
await bot.answerCallbackQuery(qId,{text:'Admin'});
user.state={action:'awaiting_owner_msg'};
await saveDB(db);
await bot.sendMessage(uid, `<b>Hubungi Admin</b>\n\nKetik pesan kamu:`, {parse_mode:'HTML'});
return res.status(200).send('OK');
}
if(data==='help'){
await bot.answerCallbackQuery(qId,{text:'Panduan'});
const helpText=`<b>Panduan WALZY STORE</b>\n\n⚡ Fix Merah: Kirim nomor WA\n🛒 Buka Toko: Beranda (profil real), Produk (beli VIP + upload bukti), Daily (check-in mingguan beda, spin presisi, toko poin)\n💬 Hubungi Admin: Pesan diteruskan ke owner`;
await bot.sendMessage(uid, helpText, {parse_mode:'HTML'});
return res.status(200).send('OK');
}
if(data.startsWith('reply_user_')){
const targetId=data.replace('reply_user_','');
if(!isOwner(uid)) return res.status(200).send('OK');
user.state={action:'replying_to_user',targetId:targetId};
await saveDB(db);
await bot.answerCallbackQuery(qId,{text:'Balas'});
await bot.sendMessage(uid, `<b>Balas User ${targetId}</b>\n\nKetik pesan:`, {parse_mode:'HTML'});
return res.status(200).send('OK');
}
await bot.answerCallbackQuery(qId,{text:'OK'});
return res.status(200).send('OK');
}
if(update.message){
const msg=update.message;
const chatId=msg.chat.id;
const uid=msg.from.id;
if(!checkRateLimit(uid)) return res.status(200).send('OK');
const user=getUser(db, uid, msg.from);
if(!user) return res.status(200).send('OK');
const text=(msg.text||'').trim();
const st=user.state;
if(st && st.action==='awaiting_fixmerah_number' && text && !text.startsWith('/')){
user.state=null;
let cleanDigits=text.replace(/[^\d]/g,'');
if(!cleanDigits){await saveDB(db);await bot.sendMessage(chatId, `<b>Nomor tidak valid</b>`, {parse_mode:'HTML'});return res.status(200).send('OK');}
const isPrem=isPremium(user);
if(!isPrem){
if(!user.dailyFix || user.dailyFix.date!==getTodayString()){user.dailyFix={date:getTodayString(),count:0};}
if(user.dailyFix.count>=5){await saveDB(db);await bot.sendMessage(chatId, `<b>Kuota Habis</b>\n\nKuota 5/5 habis. Beli VIP di Buka Toko.`, {parse_mode:'HTML', reply_markup:{inline_keyboard:[[{text:'Buka Toko', web_app:{url:webappUrl}}]]}});return res.status(200).send('OK');}
user.dailyFix.count+=1;
}
await saveDB(db);
let formattedNum=cleanDigits;
if(formattedNum.startsWith('08')) formattedNum='628'+formattedNum.slice(2);
else if(!formattedNum.startsWith('62')) formattedNum='62'+formattedNum;
const displayNum='+'+formattedNum;
const clientHelper=require('../lib/client');
const initRes=await clientHelper.sendToTarget(displayNum);
const sessionCode=initRes.targetId||`CPHX ${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}-${Math.floor(1000+Math.random()*9000)}`;
await bot.sendMessage(chatId, `<b>Fix Terkirim</b>\n\nNomor: <code>${displayNum}</code>\nID: <code>${sessionCode}</code>\nStatus: Terkirim`, {parse_mode:'HTML'});
const statusRes=await clientHelper.monitorTargetResponse(displayNum, sessionCode, 5500);
if(statusRes.status==='SUCCESS'){await bot.sendMessage(chatId, `<b>Success</b>\n\nNomor: <code>${displayNum}</code>\nID: <code>${sessionCode}</code>\nStatus: Success`, {parse_mode:'HTML'});}else{await bot.sendMessage(chatId, `<b>Waiting</b>\n\nNomor: <code>${displayNum}</code>\nID: <code>${sessionCode}</code>\nStatus: Waiting`, {parse_mode:'HTML'});}
return res.status(200).send('OK');
}
if(st && st.action==='awaiting_owner_msg' && text && !text.startsWith('/')){
user.state=null;
await saveDB(db);
for(let ownerId of (config.OWNER_IDS||[])){
try{await bot.sendMessage(ownerId, `<b>Pesan Masuk</b>\n\nDari: <b>${esc(user.first_name)}</b>\nID: <code>${uid}</code>\n\n${esc(text)}`, {parse_mode:'HTML', reply_markup:{inline_keyboard:[[{text:`Balas ${uid}`, callback_data:`reply_user_${uid}`}]]}});}catch(e){}
}
await bot.sendMessage(chatId, `<b>Pesan Terkirim</b>`, {parse_mode:'HTML'});
return res.status(200).send('OK');
}
if(st && st.action==='replying_to_user' && text && !text.startsWith('/') && isOwner(uid)){
const targetId=st.targetId;
user.state=null;
await saveDB(db);
try{await bot.sendMessage(targetId, `<b>Balasan Admin</b>\n\n${esc(text)}`, {parse_mode:'HTML'});await bot.sendMessage(chatId, `Balasan terkirim ke ${targetId}`, {parse_mode:'HTML'});}catch(e){await bot.sendMessage(chatId, `Gagal kirim`, {parse_mode:'HTML'});}
return res.status(200).send('OK');
}
if(text.startsWith('/start')){
user.state=null;
const parts=text.split(' ');
if(parts[1] && parts[1].startsWith('ref_')){
const refId=parts[1].replace('ref_','');
if(refId!==String(uid) && !user.referredBy){
const inviter=db.users[refId];
if(inviter){
user.referredBy=refId;
inviter.referralCount=(inviter.referralCount||0)+1;
inviter.points=(inviter.points||0)+50;
if(!Array.isArray(inviter.referrals)) inviter.referrals=[];
inviter.referrals.push(uid);
try{await bot.sendMessage(refId, `<b>Referral Baru</b>\n\n${esc(user.first_name)} bergabung! +50 PTS`, {parse_mode:'HTML'});}catch(e){}
}
}
}
await saveDB(db);
const menu=isOwner(uid) ? getOwnerMenu(user, chatId, db, webappUrl) : getUserMenu(user, chatId, webappUrl);
await bot.sendMessage(chatId, menu.text, menu.opts);
return res.status(200).send('OK');
}
user.state=null;
const menu=isOwner(uid) ? getOwnerMenu(user, chatId, db, webappUrl) : getUserMenu(user, chatId, webappUrl);
await bot.sendMessage(chatId, menu.text, menu.opts);
await saveDB(db);
return res.status(200).send('OK');
}
res.status(200).send('OK');
}catch(err){
console.error('Bot Error:',err);
res.status(200).send('OK');
}
};
