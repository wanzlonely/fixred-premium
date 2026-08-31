const { loadDB, saveDB } = require('../lib/utils');
const { getTodayString, genID, genInvoiceID, esc, getRank, isValidNumber } = require('../lib/utils');
const { sendToTarget } = require('../lib/client');
const config = require('../config');
const rateLimitMap = new Map();
const supportRateMap = new Map();
const joinCache = new Map();
function isOwner(id){ return config.OWNER_IDS.map(String).includes(String(id)); }
function isSuspiciousId(id){ const s=String(id); const n=Number(id); if(!n||n<=0) return true; if(s.startsWith('-')) return true; if(s.length>20) return true; if(s.includes('.')) return true; return false; }
function ensureDB(db){ if(!db.users) db.users={}; if(!db.payments) db.payments={}; if(!db.codes) db.codes={}; if(!db.stats) db.stats={ totalFix:0, totalSuccess:0, totalFailed:0, revenue:0, revenueHistory:[], lastReset:Date.now() }; if(!db.history) db.history={}; if(!db.pending) db.pending={}; if(!db.supportMap) db.supportMap={}; }
function cleanDB(db){ for(let k of Object.keys(db.users)){ if(isSuspiciousId(k)) delete db.users[k]; } for(let k of Object.keys(db.payments)){ const p=db.payments[k]; if(p && isSuspiciousId(p.userId)) delete db.payments[k]; } }
function getUniqueUsers(usersObj){ const map=new Map(); for(let u of Object.values(usersObj||{})){ if(!u || isSuspiciousId(u.id)) continue; const key=String(u.id); const name=(u.first_name||'').trim().toLowerCase(); if(!name) continue; if(name.includes('exploit') && (u.totalFix||0)===0 && (u.referralCount||0)===0) continue; if(!map.has(key)) map.set(key,u); } return Array.from(map.values()); }
function checkRateLimit(id){ const now=Date.now(); const key=String(id); const last=rateLimitMap.get(key)||0; if(now-last<1000) return false; rateLimitMap.set(key,now); if(rateLimitMap.size>1000){ const first=rateLimitMap.keys().next().value; rateLimitMap.delete(first); } return true; }
function checkSupportRate(id){ const now=Date.now(); const key=String(id); const last=supportRateMap.get(key)||0; if(now-last<60000) return false; supportRateMap.set(key,now); return true; }
function getUser(db,id){ const k=String(id); if(isSuspiciousId(k)) return null; if(!db.users[k]){ db.users[k]={ id:Number(id)||id, first_name:'', username:'', joinedAt:Date.now(), referralCount:0, referrals:[], referredBy:null, totalFix:0, dailyFix:{date:getTodayString(),count:0}, premiumUntil:0, lastSpin:null, awaitingNumber:false, awaitingBroadcast:false, awaitingSupport:false, pendingDeposit:null }; } if(!db.users[k].dailyFix || db.users[k].dailyFix.date!==getTodayString()) db.users[k].dailyFix={date:getTodayString(),count:0}; if(db.users[k].totalFix===undefined) db.users[k].totalFix=0; if(db.users[k].referralCount===undefined) db.users[k].referralCount=0; if(!Array.isArray(db.users[k].referrals)) db.users[k].referrals=[]; return db.users[k]; }
function isPremium(u){ return u && u.premiumUntil && u.premiumUntil>Date.now(); }
function getPremiumLeft(u){ if(!isPremium(u)) return null; return Math.ceil((u.premiumUntil-Date.now())/86400000); }
function canUseFix(db,u){ if(!u) return {allowed:false,remaining:0,isPremium:false}; if(isOwner(u.id) || isPremium(u)) return {allowed:true,remaining:999,isPremium:true}; if(u.dailyFix.count>=3) return {allowed:false,remaining:0,isPremium:false}; return {allowed:true,remaining:3-u.dailyFix.count,isPremium:false}; }
function incrementFixCount(db,u){ if(!u.dailyFix || u.dailyFix.date!==getTodayString()) u.dailyFix={date:getTodayString(),count:0}; u.dailyFix.count+=1; u.totalFix=(u.totalFix||0)+1; db.stats.totalFix=(db.stats.totalFix||0)+1; const k=String(u.id); if(!db.history[k]) db.history[k]=[]; db.history[k].unshift({date:new Date().toISOString(),count:1}); if(db.history[k].length>100) db.history[k]=db.history[k].slice(0,100); }
async function checkJoin(bot,uid){ if(isOwner(uid)) return {joined:true,notJoined:[]}; const cacheKey=String(uid); const cached=joinCache.get(cacheKey); if(cached && Date.now()-cached.ts<300000) return cached.data; let notJoined=[]; for(let ch of config.FORCE_JOIN){ try{ const m=await bot.getChatMember(ch.id,uid); if(!['member','administrator','creator'].includes(m.status)) notJoined.push(ch); }catch(e){ notJoined.push(ch); } } const result={joined:notJoined.length===0,notJoined}; joinCache.set(cacheKey,{ts:Date.now(),data:result}); return result; }
function bq(t){ const clean=t.trim().replace(/\n{3,}/g,'\n\n'); return `<blockquote>${clean}</blockquote>`; }
function fmtMoney(n){ return 'Rp '+(n||0).toLocaleString('id-ID'); }
function getOwnerMenu(chatId, db, user){
const validUsers=getUniqueUsers(db.users);
const premiumCount=validUsers.filter(u=>isPremium(u)).length;
const now=new Date();
const todayOrders=Object.values(db.payments||{}).filter(p=>{ if(isSuspiciousId(p.userId)) return false; const d=new Date(p.createdAt); return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); }).length;
const pendingOrders=Object.values(db.payments||{}).filter(p=>p.status==='waiting_approval').length;
const successRate=db.stats.totalFix ? Math.round((db.stats.totalSuccess/db.stats.totalFix)*100) : 0;
const revenue=db.stats.revenue||0;
const text=`⚡️ <b>WALZY OWNER STUDIO</b>
<i>Panel Premium Realtime</i>

${bq(`👑 <b>Owner</b>
├ Nama: <b>${esc(user.first_name)}</b>
├ ID: <code>${chatId}</code>
└ Status: <code>ACTIVE</code>

📊 <b>Statistik</b>
├ Valid: <code>${validUsers.length}</code>
├ VIP: <code>${premiumCount}</code>
├ Hari Ini: <code>${todayOrders}</code>
├ Pending: <code>${pendingOrders}</code>
└ Sukses: <code>${successRate}%</code>

💰 <b>Bisnis</b>
├ Order: <code>${db.stats.totalFix||0}</code>
├ Revenue: <code>${fmtMoney(revenue)}</code>
└ Sukses: <code>${db.stats.totalSuccess||0}</code>

⏰ ${now.toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta'})} WIB`)}

<i>Tap menu di bawah • 🚀 walzy</i>`;
return {
text,
opts:{
parse_mode:'HTML',
reply_markup:{
inline_keyboard:[
[{ text:'🎨 Buka WebApp', web_app:{ url:`${process.env.PUBLIC_URL || ''}/webapp` } }],
[{ text:'📦 Pending ('+pendingOrders+')', callback_data:'menu_order' }, { text:'👥 Users ('+validUsers.length+')', callback_data:'owner_users' }],
[{ text:'🎟️ Voucher', callback_data:'owner_voucher' }, { text:'📊 Statistik', callback_data:'menu_stats' }],
[{ text:'📢 Broadcast', callback_data:'menu_broadcast' }, { text:'🔧 Fix Merah', callback_data:'menu_fix' }]
]
}
}
};
}
function getUserMenu(chatId, db, user){
const rnk=getRank(user.referralCount||0);
const can=canUseFix(db,user);
const status=isPremium(user) ? `VIP Aktif • ${getPremiumLeft(user)} hari` : `Gratis • Sisa ${can.remaining}/3`;
const text=`👋 <b>Halo, ${esc(user.first_name)}!</b>
<i>Walzy Store Premium</i>

${bq(`💎 <b>Akun</b>
├ ${status}
├ Rank: <b>${rnk.name}</b> ${rnk.icon}
├ Ref: <code>${user.referralCount||0}</code> orang
└ ID: <code>${user.id}</code>

📈 <b>Statistik</b>
├ Order: <code>${user.totalFix||0}</code>
├ Hari Ini: <code>${user.dailyFix.count||0}/3</code>
└ Gabung: <code>${new Date(user.joinedAt).toLocaleDateString('id-ID')}</code>

🎯 <b>Cara Pakai</b>
├ 1. Pilih paket
├ 2. Bayar ke ${config.DANA_NUMBER}
├ 3. Upload bukti
└ 4. Tunggu ACC 5 menit`)}

<i>Pilih menu di bawah • 🚀 walzy</i>`;
return {
text,
opts:{
parse_mode:'HTML',
reply_markup:{
inline_keyboard:[
[{ text:'🎨 Buka Store', web_app:{ url:`${process.env.PUBLIC_URL || ''}/webapp` } }],
[{ text:'💎 Paket', callback_data:'menu_packages' }, { text:'🎰 Spin', callback_data:'menu_spin' }],
[{ text:'👤 Profil', callback_data:'menu_profile' }, { text:'🔗 Referral', callback_data:'menu_referral' }],
[{ text:'💬 Bantuan', callback_data:'user_contact_owner' }]
]
}
}
};
}
async function handleMessage(bot, db, msg){
const chatId=msg.chat.id;
const text=(msg.text||'').trim();
const user=getUser(db, chatId);
if(!user) return;
user.first_name=msg.from.first_name||user.first_name;
user.username=msg.from.username||user.username;
if(!checkRateLimit(chatId)){ return bot.sendMessage(chatId, `⏳ <b>Tunggu</b>\n${bq('Jangan spam\nTunggu 1 detik')}`, {parse_mode:'HTML'}); }
const joinCheck=await checkJoin(bot, chatId);
if(!joinCheck.joined){
const joinButtons=joinCheck.notJoined.map(ch=>[{text:'📢 Join '+ch.title, url:ch.url}]);
joinButtons.push([{text:'✅ Sudah Join', callback_data:'check_join'}]);
return bot.sendMessage(chatId, `🔒 <b>Join Dulu</b>\n${bq(`Wajib join channel:\n${joinCheck.notJoined.map(c=>`• ${c.title}`).join('\n')}\n\nKlik Sudah Join setelah join`)}`, {parse_mode:'HTML', reply_markup:{inline_keyboard:joinButtons}});
}
if(user.awaitingBroadcast && isOwner(chatId)){
if(text.toLowerCase()==='batal'){ user.awaitingBroadcast=false; await saveDB(db); const m=getOwnerMenu(chatId,db,user); return bot.sendMessage(chatId,m.text,m.opts); }
if(text.length<5) return bot.sendMessage(chatId, `❌ <b>Pendek</b>\n${bq('Min 5 karakter')}`, {parse_mode:'HTML'});
if(text.length>1000) return bot.sendMessage(chatId, `❌ <b>Panjang</b>\n${bq('Max 1000\nSekarang '+text.length)}`, {parse_mode:'HTML'});
const unique=getUniqueUsers(db.users);
let sent=0, failed=0;
const statusMsg=await bot.sendMessage(chatId, `📢 <b>Mulai</b>\n${bq(`Ke ${unique.length} user`)}`, {parse_mode:'HTML'});
for(let i=0;i<unique.length;i++){
const u=unique[i];
try{ await bot.sendMessage(u.id, `📢 <b>Walzy Siaran</b>\n${bq(esc(text))}\n\n<i>🚀 walzy</i>`, {parse_mode:'HTML'}); sent++; }catch(e){ failed++; }
if(i%10===0){ try{ await bot.editMessageText(`📢 <b>Jalan</b>\n${bq(`${i}/${unique.length}\n✅ ${sent} ❌ ${failed}`)}`, {chat_id:chatId,message_id:statusMsg.message_id,parse_mode:'HTML'}); }catch(e){} await new Promise(r=>setTimeout(r,300)); }else{ await new Promise(r=>setTimeout(r,70)); }
}
user.awaitingBroadcast=false;
await saveDB(db);
return bot.editMessageText(`✅ <b>Selesai</b>\n${bq(`Total ${unique.length}\n✅ ${sent} ❌ ${failed}\n\n${esc(text.substring(0,200))}`)}`, {chat_id:chatId,message_id:statusMsg.message_id,parse_mode:'HTML'});
}
if(user.awaitingSupport){
if(text.toLowerCase()==='batal'){ user.awaitingSupport=false; await saveDB(db); const m=getUserMenu(chatId,db,user); return bot.sendMessage(chatId,m.text,m.opts); }
if(!checkSupportRate(chatId)){ return bot.sendMessage(chatId, `⏳ <b>Tunggu 1 Menit</b>\n${bq('Baru kirim keluhan')}`, {parse_mode:'HTML'}); }
if(text.length<10) return bot.sendMessage(chatId, `❌ <b>Pendek</b>\n${bq('Min 10 karakter')}`, {parse_mode:'HTML'});
if(text.length>500) return bot.sendMessage(chatId, `❌ <b>Panjang</b>\n${bq('Max 500')}`, {parse_mode:'HTML'});
user.awaitingSupport=false;
await saveDB(db);
for(let ownerId of config.OWNER_IDS){ try{ await bot.sendMessage(ownerId, `💬 <b>Keluhan</b>\n${bq(`👤 ${esc(user.first_name)} (<code>${chatId}</code>)\n📝 ${esc(text)}\n⏰ ${new Date().toLocaleString('id-ID',{timeZone:'Asia/Jakarta'})}`)}`, {parse_mode:'HTML'}); }catch(e){} }
return bot.sendMessage(chatId, `✅ <b>Terkirim</b>\n${bq(`Makasih ${esc(user.first_name)}\nOwner balas segera`)}`, {parse_mode:'HTML'});
}
if(user.awaitingNumber){
if(text.toLowerCase()==='batal'){ user.awaitingNumber=false; await saveDB(db); const m=getUserMenu(chatId,db,user); return bot.sendMessage(chatId,m.text,m.opts); }
if(!isValidNumber(text)){ return bot.sendMessage(chatId, `❌ <b>Nomor Salah</b>\n${bq(`Format harus 08xxxx atau 62xxxx\nContoh: 08123456789\n\nKetik batal untuk batal`)}`, {parse_mode:'HTML'}); }
const can=canUseFix(db,user);
if(!can.allowed){ user.awaitingNumber=false; await saveDB(db); return bot.sendMessage(chatId, `⏳ <b>Limit Habis</b>\n${bq(`Sudah 3x hari ini\nTunggu 00:00 WIB\nAtau upgrade VIP\n\nVIP mulai Rp 15K`)}`, {parse_mode:'HTML', reply_markup:{inline_keyboard:[[{text:'💎 Upgrade',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}]]}}); }
const procMsg=await bot.sendMessage(chatId, `⏳ <b>Proses Fix</b>\n${bq(`Nomor: <code>${esc(text)}</code>\n\nSedang proses ke target bot\n${config.TARGET_BOT}\nTunggu 10-25 detik`)}`, {parse_mode:'HTML'});
try{
const result=await sendToTarget(text);
if(result.ok){
incrementFixCount(db,user);
db.stats.totalSuccess=(db.stats.totalSuccess||0)+1;
await saveDB(db);
await bot.editMessageText(`✅ <b>Fix Berhasil</b>\n${bq(`Nomor: <code>${esc(text)}</code>\nSisa: ${can.remaining-1}/3\n\nHasil:\n${esc(result.text||'Berhasil').substring(0,800)}`)}`, {chat_id:chatId,message_id:procMsg.message_id,parse_mode:'HTML', reply_markup:{inline_keyboard:[[{text:'🔧 Fix Lagi',callback_data:'menu_fix'},{text:'◁ Menu',callback_data:'menu_main'}]]}});
}else{
db.stats.totalFailed=(db.stats.totalFailed||0)+1;
await saveDB(db);
await bot.editMessageText(`❌ <b>Fix Gagal</b>\n${bq(`Nomor: ${esc(text)}\n\nAlasan: ${esc(result.message||'Target tidak merespon')}\n\nCoba lagi atau hubungi owner`)}`, {chat_id:chatId,message_id:procMsg.message_id,parse_mode:'HTML', reply_markup:{inline_keyboard:[[{text:'🔁 Coba Lagi',callback_data:'menu_fix'},{text:'💬 Owner',callback_data:'user_contact_owner'}]]}});
}
}catch(e){
await bot.editMessageText(`❌ <b>Error</b>\n${bq(esc(e.message))}`, {chat_id:chatId,message_id:procMsg.message_id,parse_mode:'HTML'});
}
user.awaitingNumber=false;
await saveDB(db);
return;
}
if(msg.photo && user.pendingDeposit){
const pay=db.payments[user.pendingDeposit];
if(!pay){ user.pendingDeposit=null; await saveDB(db); return; }
pay.status='waiting_approval';
pay.proofPhoto=msg.photo[msg.photo.length-1].file_id;
pay.proofAt=Date.now();
await saveDB(db);
for(let ownerId of config.OWNER_IDS){ try{ await bot.sendPhoto(ownerId, pay.proofPhoto, { caption:`📤 <b>Bukti Masuk</b>\n${bq(`Invoice: <code>${pay.id}</code>\nUser: ${esc(user.first_name)} (<code>${chatId}</code>)\nPaket: ${pay.days}H\nJumlah: ${fmtMoney(pay.amount)}\nDANA: ${config.DANA_NUMBER}`)}`, parse_mode:'HTML', reply_markup:{inline_keyboard:[[{text:'✅ ACC',callback_data:'approve_'+pay.id},{text:'❌ Tolak',callback_data:'reject_'+pay.id}]]} }); }catch(e){} }
return bot.sendMessage(chatId, `✅ <b>Bukti Diterima</b>\n${bq(`Invoice: <code>${pay.id}</code>\nMenunggu ACC owner\nMax 5-10 menit`)}`, {parse_mode:'HTML'});
}
if(text.startsWith('/start')){
const refMatch=text.match(/\/start\s+(\d+)/);
if(refMatch){
const refId=refMatch[1];
if(refId!==String(chatId) && !isSuspiciousId(refId) && db.users[refId] && !user.referredBy){
user.referredBy=refId;
const refUser=db.users[refId];
if(refUser){ refUser.referralCount=(refUser.referralCount||0)+1; if(!refUser.referrals.includes(String(chatId))) refUser.referrals.push(String(chatId)); try{ await bot.sendMessage(refId, `🎉 <b>Referral Baru</b>\n${bq(`${esc(user.first_name)} join\nTotal: ${refUser.referralCount}`)}`, {parse_mode:'HTML'}); }catch(e){} }
}
}
const m=isOwner(chatId) ? getOwnerMenu(chatId,db,user) : getUserMenu(chatId,db,user);
return bot.sendMessage(chatId,m.text,m.opts);
}
if(text.startsWith('/gen') && isOwner(chatId)){
const parts=text.split(/\s+/);
if(parts.length<3) return bot.sendMessage(chatId, `❌ <b>Format Salah</b>\n${bq(`Pakai:\n/gen KODE HARI [KUOTA]\nContoh:\n/gen WALZY30 30`)}`, {parse_mode:'HTML'});
const code=parts[1].toUpperCase();
const days=parseInt(parts[2]);
const quota=parseInt(parts[3])||0;
if(!code || !days || days<=0) return bot.sendMessage(chatId, `❌ <b>Salah</b>\n${bq('Kode & hari wajib')}`, {parse_mode:'HTML'});
if(db.codes[code]) return bot.sendMessage(chatId, `❌ <b>Ada</b>\n${bq(code+' sudah ada')}`, {parse_mode:'HTML'});
db.codes[code]={code,days,quota,used:0,createdAt:Date.now(),type:quota===1?'private':'public',createdBy:String(chatId)};
await saveDB(db);
return bot.sendMessage(chatId, `✅ <b>Jadi</b>\n${bq(`🎫 <code>${code}</code>\n⏰ ${days}H\n👥 ${quota||'∞'}`)}`, {parse_mode:'HTML'});
}
if(text.startsWith('/redeem')){
const code=text.split(/\s+/)[1];
if(!code) return bot.sendMessage(chatId, `❌ <b>Kosong</b>\n${bq('/redeem KODE')}`, {parse_mode:'HTML'});
const c=db.codes[code.toUpperCase()];
if(!c) return bot.sendMessage(chatId, `❌ <b>Tidak Ada</b>\n${bq(code.toUpperCase()+' tidak ada')}`, {parse_mode:'HTML'});
const days=typeof c==='object' ? c.days : c;
const quota=typeof c==='object' ? (c.quota||0) : 0;
const used=typeof c==='object' ? (c.used||0) : 0;
if(quota>0 && used>=quota) return bot.sendMessage(chatId, `❌ <b>Habis</b>\n${bq('Habis '+used+'/'+quota)}`, {parse_mode:'HTML'});
user.premiumUntil=Math.max(Date.now(),user.premiumUntil||0)+days*86400000;
if(typeof c==='object'){ c.used=(c.used||0)+1; if(c.type==='private' && quota===1) delete db.codes[code.toUpperCase()]; }else delete db.codes[code.toUpperCase()];
await saveDB(db);
return bot.sendMessage(chatId, `✅ <b>Berhasil</b>\n${bq(`🎫 ${code.toUpperCase()}\n💎 ${days}H\n📅 Sampai ${new Date(user.premiumUntil).toLocaleDateString('id-ID')}`)}`, {parse_mode:'HTML'});
}
if(isValidNumber(text)){
user.awaitingNumber=true;
await saveDB(db);
const can=canUseFix(db,user);
if(!can.allowed){ user.awaitingNumber=false; await saveDB(db); return bot.sendMessage(chatId, `⏳ <b>Limit Habis</b>\n${bq(`Sudah 3x\nTunggu besok\nAtau VIP`)}`, {parse_mode:'HTML', reply_markup:{inline_keyboard:[[{text:'💎 VIP',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}]]}}); }
return bot.sendMessage(chatId, `🔧 <b>Konfirmasi Fix</b>\n${bq(`Nomor: <code>${esc(text)}</code>\nSisa: ${can.remaining}/3\n\nKetik YA untuk lanjut\nKetik batal untuk batal`)}`, {parse_mode:'HTML'});
}
if(text.toLowerCase()==='ya' && user.awaitingNumber){
const lastNum=msg.reply_to_message ? '' : '';
}
const m=isOwner(chatId) ? getOwnerMenu(chatId,db,user) : getUserMenu(chatId,db,user);
return bot.sendMessage(chatId,m.text,m.opts);
}
async function handleCallback(bot, db, query){
const chatId=query.message.chat.id;
const msgId=query.message.message_id;
const data=query.data;
const user=getUser(db, chatId);
if(!user) return;
if(data==='check_join'){
joinCache.delete(String(chatId));
const joinCheck=await checkJoin(bot, chatId);
if(joinCheck.joined){ const m=isOwner(chatId) ? getOwnerMenu(chatId,db,user) : getUserMenu(chatId,db,user); await bot.editMessageText(m.text, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:m.opts.reply_markup}); }else{ await bot.answerCallbackQuery(query.id,{text:'Belum join'}); }
return;
}
if(data==='menu_main'){ const m=isOwner(chatId) ? getOwnerMenu(chatId,db,user) : getUserMenu(chatId,db,user); return bot.editMessageText(m.text, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:m.opts.reply_markup}); }
if(data==='menu_fix'){
const can=canUseFix(db,user);
if(!can.allowed){ return bot.editMessageText(`⏳ <b>Limit Habis</b>\n${bq(`Pakai 3x hari ini habis\n\n💡 <b>Solusi</b>\n├ Tunggu 00:00 WIB\n├ Upgrade VIP unlimited\n└ VIP Rp 15K\n\nUpgrade di WebApp`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'💎 Upgrade VIP',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}}); }
user.awaitingNumber=true;
await saveDB(db);
return bot.editMessageText(`🔧 <b>Fix Merah</b>\n${bq(`📌 <b>Akun</b>\n├ Sisa: <code>${can.remaining}/3</code>\n├ Status: ${can.isPremium?'💎 VIP Unlimited':'🎫 Gratis'}\n└ Reset: <code>00:00 WIB</code>\n\n🎯 <b>Cara</b>\n├ Kirim nomor 08xxxx\n├ Contoh: 08123456789\n└ Ketik batal untuk batal`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Batal',callback_data:'cancel_action'}]]}});
}
if(data==='menu_order'){
const payments=Object.values(db.payments||{}).filter(p=>p.status==='waiting_approval').slice(-8);
if(payments.length===0){ return bot.editMessageText(`📦 <b>Pending Kosong</b>\n${bq('Semua sudah ACC')}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_main'}]]}}); }
let t=`📦 <b>Pending</b>\n\n`;
payments.forEach(p=>{ t+=`${bq(`🧾 <code>${p.id}</code>\n├ ${p.userId} • ${p.days}H • ${fmtMoney(p.amount)}\n└ ${new Date(p.createdAt).toLocaleString('id-ID')}`)}\n`; });
const kb=payments.slice(0,4).map(p=>[{text:`✅ ${p.id.slice(-6)}`,callback_data:'approve_'+p.id},{text:`❌`,callback_data:'reject_'+p.id}]);
kb.push([{text:'◁ Kembali',callback_data:'menu_main'}]);
return bot.editMessageText(t,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:kb}});
}
if(data.startsWith('confirm_')){
const inv=data.split('confirm_')[1];
const pay=db.payments[inv];
if(!pay) return bot.answerCallbackQuery(query.id,{text:'Tidak ada'});
pay.status='waiting_proof';
db.users[String(chatId)].pendingDeposit=inv;
await saveDB(db);
return bot.editMessageText(`📤 <b>Konfirmasi</b>\n${bq(`Invoice <code>${inv}</code>\nJumlah ${fmtMoney(pay.amount)}\n\n📸 Kirim foto bukti`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
}
if(data.startsWith('approve_')){
if(!isOwner(chatId)) return bot.answerCallbackQuery(query.id,{text:'Bukan owner'});
const inv=data.split('approve_')[1];
const pay=db.payments[inv];
if(!pay) return bot.answerCallbackQuery(query.id,{text:'Tidak ada'});
if(pay.status==='paid') return bot.editMessageText(`✅ <b>Sudah ACC</b>\n${bq(inv)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
if(isSuspiciousId(pay.userId)) return bot.editMessageText(`⚠️ <b>Tidak Valid</b>\n${bq(inv)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
pay.status='paid';
const u=getUser(db,pay.userId);
if(!u) return;
u.premiumUntil=Math.max(Date.now(),u.premiumUntil||0)+pay.days*86400000;
u.pendingDeposit=null;
db.stats.revenue=(db.stats.revenue||0)+pay.amount;
if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory=[];
db.stats.revenueHistory.push({date:new Date().toISOString(),amount:pay.amount,invoice:inv,userId:pay.userId});
await saveDB(db);
await bot.editMessageText(`✅ <b>ACC</b>\n${bq(inv+' ACC')}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
try{ await bot.sendMessage(pay.userId, `✅ <b>LUNAS</b>\n${bq(`Invoice ${inv}\nPaket ${pay.days}H\nSampai ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}`)}`, {parse_mode:'HTML'}); }catch{}
return;
}
if(data.startsWith('reject_')){
if(!isOwner(chatId)) return;
const inv=data.split('reject_')[1];
const pay=db.payments[inv];
if(!pay) return bot.answerCallbackQuery(query.id,{text:'Tidak ada'});
pay.status='rejected';
const u=getUser(db,pay.userId);
if(u) u.pendingDeposit=null;
await saveDB(db);
await bot.editMessageText(`❌ <b>Tolak</b>\n${bq(inv)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
try{ await bot.sendMessage(pay.userId, `❌ <b>Tolak</b>\n${bq(inv+' ditolak')}`, {parse_mode:'HTML'}); }catch{}
return;
}
if(data==='owner_users' && isOwner(chatId)){
const unique=getUniqueUsers(db.users);
let t=`👥 <b>Pengguna Real</b>\n${bq(`Total ${unique.length}`)}\n\n`;
unique.slice(-10).reverse().forEach(u=>{
const st=isPremium(u) ? `VIP ${getPremiumLeft(u)}H` : `Free ${u.dailyFix?.count||0}/3`;
t+=`${bq(`👤 ${esc((u.first_name||'User').substring(0,14))}\n├ ID <code>${u.id}</code>\n├ ${u.totalFix||0} order • ${st}\n└ Ref ${u.referralCount||0}`)}\n`;
});
return bot.editMessageText(t,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎨 WebApp',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='owner_voucher' && isOwner(chatId)){
const codes=Object.values(db.codes||{}).slice(-10);
let t=`🎟️ <b>Voucher</b>\n${bq(`Buat:\n/gen KODE HARI [KUOTA]`)} \n\n`;
if(codes.length>0){
codes.reverse().forEach(c=>{
const code=typeof c==='object' ? c.code : 'CODE';
const days=typeof c==='object' ? c.days : c;
const quota=typeof c==='object' ? (c.quota||0) : 0;
const used=typeof c==='object' ? (c.used||0) : 0;
t+=`${bq(`🎫 <code>${code}</code> ${days}H\n├ ${quota||'∞'} kuota • ${used} pakai\n└ ${quota>0&&used>=quota?'❌ Habis':'✅ Aktif'}`)}\n`;
});
}else t+=`${bq('Belum ada')}\n`;
return bot.editMessageText(t,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎨 WebApp',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='menu_stats'){
const validUsers=getUniqueUsers(db.users);
const now=new Date();
const todayOrders=Object.values(db.payments||{}).filter(p=>{ if(isSuspiciousId(p.userId)) return false; const d=new Date(p.createdAt); return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); }).length;
const pending=Object.values(db.payments||{}).filter(p=>p.status==='waiting_approval').length;
const revenue=db.stats.revenue||0;
const txt=`📊 <b>Statistik</b>\n${bq(`👥 Valid ${validUsers.length}\nVIP ${validUsers.filter(u=>isPremium(u)).length}\n\n📦 Total ${db.stats.totalFix||0}\nHari Ini ${todayOrders}\nPending ${pending}\nSukses ${db.stats.totalSuccess||0}\n\n💰 ${fmtMoney(revenue)}\nRate ${db.stats.totalFix ? Math.round((db.stats.totalSuccess/db.stats.totalFix)*100) : 0}%`)}`;
return bot.editMessageText(txt,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎨 WebApp',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='menu_broadcast' && isOwner(chatId)){
db.users[String(chatId)].awaitingBroadcast=true;
await saveDB(db);
return bot.editMessageText(`📢 <b>Broadcast</b>\n${bq('Ketik pesan\nMax 1000\nKetik batal untuk batal')}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'❌ Batal',callback_data:'cancel_action'}]]}});
}
if(data==='menu_packages'){
return bot.editMessageText(`💎 <b>Paket</b>\n${bq(`🔥 Starter 7H Rp 15K\nUnlimited fix\n\n⭐ Pro 30H Rp 45K Best\nHemat 40%\nBonus spin\n\n👑 Sultan 90H Rp 99K\nPower user\nPrioritas`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎨 Buka Store',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='menu_profile'){
const rnk=getRank(user.referralCount||0);
const can=canUseFix(db,user);
return bot.editMessageText(`👤 <b>Profil</b>\n${bq(`Nama ${esc(user.first_name)}\nID <code>${user.id}</code>\n@${esc(user.username||'-')}\n\n💎 ${isPremium(user)?`VIP ${getPremiumLeft(user)}H`:`Free ${can.remaining}/3`}\n🏆 ${rnk.name} ${rnk.icon}\n👥 Ref ${user.referralCount||0}\n📦 Order ${user.totalFix||0}\n📅 ${new Date(user.joinedAt).toLocaleDateString('id-ID')}`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='menu_spin'){
const canSpin=!user.lastSpin || user.lastSpin!==getTodayString();
return bot.editMessageText(`🎰 <b>Spin</b>\n${bq(`${canSpin?'Bisa spin hari ini':'Sudah spin'}\n\nHadiah\nBonus pesanan\nVIP 1H\nPoin ref\nReset 00:00`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:canSpin?'🎰 Spin di WebApp':'✅ Sudah',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='menu_referral'){
const botU=(await bot.getMe()).username;
const link=`https://t.me/${botU}?start=${chatId}`;
return bot.editMessageText(`🔗 <b>Referral</b>\n${bq(`Link:\n${link}\n\nTotal ${user.referralCount||0}\nRank ${getRank(user.referralCount||0).name}`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='user_contact_owner'){
db.users[String(chatId)].awaitingSupport=true;
await saveDB(db);
return bot.editMessageText(`💬 <b>Owner</b>\n${bq('Tulis keluhan\nMax 500\nKetik batal untuk batal')}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'❌ Batal',callback_data:'cancel_action'}]]}});
}
if(data==='cancel_action'){
user.awaitingBroadcast=false;
user.awaitingSupport=false;
user.awaitingNumber=false;
await saveDB(db);
const m=isOwner(chatId) ? getOwnerMenu(chatId,db,user) : getUserMenu(chatId,db,user);
return bot.editMessageText(m.text,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:m.opts.reply_markup});
}
}
module.exports = async (req,res)=>{
const bot=new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
try{
const db=await loadDB();
ensureDB(db); cleanDB(db);
if(req.method==='POST'){
const update=req.body;
if(update.message) await handleMessage(bot,db,update.message);
if(update.callback_query){
await handleCallback(bot,db,update.callback_query);
try{ await bot.answerCallbackQuery(update.callback_query.id); }catch{}
}
await saveDB(db);
}
res.status(200).json({ok:true,ts:Date.now()});
}catch(e){
console.error(e);
res.status(200).json({ok:false,error:e.message});
}
};
