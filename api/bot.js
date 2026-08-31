const { loadDB, saveDB } = require('../lib/utils');
const { getTodayString, genID, genInvoiceID, esc, getRank, isValidNumber } = require('../lib/utils');
const { sendToTarget } = require('../lib/client');
const config = require('../config');

const rateLimitMap = new Map();
const supportRateMap = new Map();
const joinCache = new Map();

function isOwner(id){ return config.OWNER_IDS.map(String).includes(String(id)); }
function isSuspiciousId(id){ const s=String(id); const n=Number(id); if(!n||n<=0) return true; if(s.startsWith('-')) return true; if(s.length>20) return true; if(s.includes('.')) return true; return false; }
function ensureDB(db){ if(!db.users) db.users={}; if(!db.payments) db.payments={}; if(!db.codes) db.codes={}; if(!db.stats) db.stats={ totalFix:0, totalSuccess:0, totalFailed:0, revenue:0, revenueHistory:[], lastReset: Date.now() }; if(!db.history) db.history={}; if(!db.pending) db.pending={}; if(!db.supportMap) db.supportMap={}; }
function cleanDB(db){ for(let k of Object.keys(db.users)){ if(isSuspiciousId(k)) delete db.users[k]; } for(let k of Object.keys(db.payments)){ const p=db.payments[k]; if(p && isSuspiciousId(p.userId)) delete db.payments[k]; } }
function getUniqueUsers(usersObj){
const map=new Map();
for(let u of Object.values(usersObj||{})){
if(!u || isSuspiciousId(u.id)) continue;
const key=String(u.id);
const name=(u.first_name||'').trim().toLowerCase();
if(!name) continue;
if(name.includes('exploit') && (u.totalFix||0)===0 && (u.referralCount||0)===0) continue;
if(!map.has(key)) map.set(key,u);
}
return Array.from(map.values());
}
function checkRateLimit(id){ const now=Date.now(); const key=String(id); const last=rateLimitMap.get(key)||0; if(now-last<1000) return false; rateLimitMap.set(key,now); if(rateLimitMap.size>1000){ const first=rateLimitMap.keys().next().value; rateLimitMap.delete(first); } return true; }
function checkSupportRate(id){ const now=Date.now(); const key=String(id); const last=supportRateMap.get(key)||0; if(now-last<60000) return false; supportRateMap.set(key,now); return true; }
function getUser(db,id){
const k=String(id);
if(isSuspiciousId(k)) return null;
if(!db.users[k]){ db.users[k]={ id:Number(id)||id, first_name:'', username:'', joinedAt:Date.now(), referralCount:0, referrals:[], referredBy:null, totalFix:0, dailyFix:{date:getTodayString(),count:0}, premiumUntil:0, lastSpin:null, awaitingNumber:false, awaitingBroadcast:false, awaitingSupport:false, pendingDeposit:null }; }
if(!db.users[k].dailyFix || db.users[k].dailyFix.date!==getTodayString()) db.users[k].dailyFix={date:getTodayString(),count:0};
if(db.users[k].totalFix===undefined) db.users[k].totalFix=0;
if(db.users[k].referralCount===undefined) db.users[k].referralCount=0;
if(!Array.isArray(db.users[k].referrals)) db.users[k].referrals=[];
return db.users[k];
}
function isPremium(u){ return u && u.premiumUntil && u.premiumUntil>Date.now(); }
function getPremiumLeft(u){ if(!isPremium(u)) return null; return Math.ceil((u.premiumUntil-Date.now())/86400000); }
function canUseFix(db,u){ if(!u) return {allowed:false,remaining:0,isPremium:false}; if(isOwner(u.id) || isPremium(u)) return {allowed:true,remaining:999,isPremium:true}; if(u.dailyFix.count>=3) return {allowed:false,remaining:0,isPremium:false}; return {allowed:true,remaining:3-u.dailyFix.count,isPremium:false}; }
function incrementFixCount(db,u){ if(!u.dailyFix || u.dailyFix.date!==getTodayString()) u.dailyFix={date:getTodayString(),count:0}; u.dailyFix.count+=1; u.totalFix=(u.totalFix||0)+1; db.stats.totalFix=(db.stats.totalFix||0)+1; const k=String(u.id); if(!db.history[k]) db.history[k]=[]; db.history[k].unshift({date:new Date().toISOString(),count:1}); if(db.history[k].length>100) db.history[k]=db.history[k].slice(0,100); }
async function checkJoin(bot,uid){
if(isOwner(uid)) return {joined:true,notJoined:[]};
const cacheKey=String(uid);
const cached=joinCache.get(cacheKey);
if(cached && Date.now()-cached.ts<300000) return cached.data;
let notJoined=[];
for(let ch of config.FORCE_JOIN){ try{ const m=await bot.getChatMember(ch.id,uid); if(!['member','administrator','creator'].includes(m.status)) notJoined.push(ch); }catch(e){ notJoined.push(ch); } }
const result={joined:notJoined.length===0,notJoined};
joinCache.set(cacheKey,{ts:Date.now(),data:result});
return result;
}
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
<i>Panel Kontrol Premium • Realtime</i>

${bq(`👑 <b>Owner</b>
├ Nama: <b>${esc(user.first_name)}</b>
├ ID: <code>${chatId}</code>
└ Status: <code>ACTIVE • DARK PRO</code>

📊 <b>Statistik Real</b>
├ Pengguna Valid: <code>${validUsers.length}</code>
├ VIP Member: <code>${premiumCount}</code>
├ Order Hari Ini: <code>${todayOrders}</code>
├ Pending ACC: <code>${pendingOrders}</code>
└ Rasio Sukses: <code>${successRate}%</code>

💰 <b>Performa</b>
├ Total Order: <code>${db.stats.totalFix||0}</code>
├ Revenue: <code>${fmtMoney(revenue)}</code>
├ Sukses: <code>${db.stats.totalSuccess||0}</code>
└ Gagal: <code>${db.stats.totalFailed||0}</code>

⏰ <b>Waktu</b>: ${now.toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta'})} WIB
✨ <b>Sistem</b>: Super cepat • Anti lag • Cache`)}

<i>Tap menu di bawah untuk kelola • 🚀 walzy</i>`;
return {
text,
opts:{
parse_mode:'HTML',
reply_markup:{
inline_keyboard:[
[{ text:'🎨 Buka WebApp Owner', web_app:{ url:`${process.env.PUBLIC_URL || ''}/webapp` } }],
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
const status=isPremium(user) ? `VIP Aktif • ${getPremiumLeft(user)} hari lagi` : `Gratis • Sisa ${can.remaining}/3 hari ini`;
const text=`👋 <b>Halo, ${esc(user.first_name)}!</b>
<i>Selamat datang di Walzy Store</i>

${bq(`💎 <b>Status Akun</b>
├ ${status}
├ Rank: <b>${rnk.name}</b> ${rnk.icon}
├ Referral: <code>${user.referralCount||0}</code> orang
└ ID: <code>${user.id}</code>

📈 <b>Statistik Kamu</b>
├ Total Order: <code>${user.totalFix||0}</code>
├ Hari Ini: <code>${user.dailyFix.count||0}/3</code>
└ Gabung: <code>${new Date(user.joinedAt).toLocaleDateString('id-ID')}</code>

🎯 <b>Cara Pakai Walzy</b>
├ 1. Pilih paket premium
├ 2. Bayar & upload bukti
├ 3. Tunggu ACC owner 5-10 menit
└ 4. Langsung pakai bot unlimited!`)}

<i>Pilih menu di bawah 👇 • 🚀 walzy</i>`;
return {
text,
opts:{
parse_mode:'HTML',
reply_markup:{
inline_keyboard:[
[{ text:'🎨 Buka Walzy Store', web_app:{ url:`${process.env.PUBLIC_URL || ''}/webapp` } }],
[{ text:'💎 Paket Premium', callback_data:'menu_packages' }, { text:'🎰 Spin Harian', callback_data:'menu_spin' }],
[{ text:'👤 Profil Lengkap', callback_data:'menu_profile' }, { text:'🔗 Referral', callback_data:'menu_referral' }],
[{ text:'💬 Bantuan Owner', callback_data:'user_contact_owner' }]
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
if(!checkRateLimit(chatId)){ return bot.sendMessage(chatId, `⏳ <b>Tunggu Sebentar</b>\n${bq(`Jangan spam ya\nTunggu 1 detik dulu\nSistem anti spam aktif`)}`, {parse_mode:'HTML'}); }
const joinCheck=await checkJoin(bot, chatId);
if(!joinCheck.joined){
const joinButtons=joinCheck.notJoined.map(ch=>[{text:'📢 Join '+ch.title, url:ch.url}]);
joinButtons.push([{text:'✅ Sudah Join', callback_data:'check_join'}]);
return bot.sendMessage(chatId, `🔒 <b>Akses Terkunci</b>\n${bq(`Kamu harus join channel dulu\n\nChannel wajib:\n${joinCheck.notJoined.map(c=>`• ${c.title}`).join('\n')}\n\nSetelah join klik Sudah Join`)}`, {parse_mode:'HTML', reply_markup:{inline_keyboard:joinButtons}});
}
if(user.awaitingBroadcast && isOwner(chatId)){
if(text.toLowerCase()==='batal'){ user.awaitingBroadcast=false; await saveDB(db); const m=getOwnerMenu(chatId,db,user); return bot.sendMessage(chatId,m.text,m.opts); }
if(text.length<5) return bot.sendMessage(chatId, `❌ <b>Pesan Pendek</b>\n${bq('Minimal 5 karakter')}`, {parse_mode:'HTML'});
if(text.length>1000) return bot.sendMessage(chatId, `❌ <b>Kepanjangan</b>\n${bq('Maks 1000 karakter\nSekarang: '+text.length)}`, {parse_mode:'HTML'});
const unique=getUniqueUsers(db.users);
let sent=0, failed=0;
const statusMsg=await bot.sendMessage(chatId, `📢 <b>Broadcast Mulai</b>\n${bq(`Kirim ke ${unique.length} user\n0/${unique.length}`)}`, {parse_mode:'HTML'});
for(let i=0;i<unique.length;i++){
const u=unique[i];
try{ await bot.sendMessage(u.id, `📢 <b>Walzy Store • Siaran</b>\n${bq(esc(text))}\n\n<i>🚀 walzy</i>`, {parse_mode:'HTML'}); sent++; }catch(e){ failed++; }
if(i%10===0){ try{ await bot.editMessageText(`📢 <b>Broadcast Jalan</b>\n${bq(`${i}/${unique.length}\n✅ ${sent} • ❌ ${failed}`)}`, {chat_id:chatId,message_id:statusMsg.message_id,parse_mode:'HTML'}); }catch(e){} await new Promise(r=>setTimeout(r,300)); }else{ await new Promise(r=>setTimeout(r,70)); }
}
user.awaitingBroadcast=false;
await saveDB(db);
return bot.editMessageText(`✅ <b>Broadcast Selesai</b>\n${bq(`Total: ${unique.length}\n✅ Kirim: ${sent}\n❌ Gagal: ${failed}\n\nPesan:\n${esc(text.substring(0,200))}`)}`, {chat_id:chatId,message_id:statusMsg.message_id,parse_mode:'HTML'});
}
if(user.awaitingSupport){
if(text.toLowerCase()==='batal'){ user.awaitingSupport=false; await saveDB(db); const m=getUserMenu(chatId,db,user); return bot.sendMessage(chatId,m.text,m.opts); }
if(!checkSupportRate(chatId)){ return bot.sendMessage(chatId, `⏳ <b>Tunggu 1 Menit</b>\n${bq('Baru kirim keluhan\nTunggu dulu')}`, {parse_mode:'HTML'}); }
if(text.length<10) return bot.sendMessage(chatId, `❌ <b>Terlalu Pendek</b>\n${bq('Minimal 10 karakter')}`, {parse_mode:'HTML'});
if(text.length>500) return bot.sendMessage(chatId, `❌ <b>Terlalu Panjang</b>\n${bq('Maks 500 karakter')}`, {parse_mode:'HTML'});
user.awaitingSupport=false;
await saveDB(db);
for(let ownerId of config.OWNER_IDS){ try{ await bot.sendMessage(ownerId, `💬 <b>Keluhan Baru</b>\n${bq(`👤 ${esc(user.first_name)} (<code>${chatId}</code>)\n📝 ${esc(text)}\n⏰ ${new Date().toLocaleString('id-ID',{timeZone:'Asia/Jakarta'})}`)}`, {parse_mode:'HTML'}); }catch(e){} }
return bot.sendMessage(chatId, `✅ <b>Terkirim ke Owner</b>\n${bq(`Makasih ${esc(user.first_name)}\nOwner akan balas segera\n\nRingkasan:\n${esc(text.substring(0,100))}`)}`, {parse_mode:'HTML'});
}
if(msg.photo && user.pendingDeposit){
const pay=db.payments[user.pendingDeposit];
if(!pay){ user.pendingDeposit=null; await saveDB(db); return; }
pay.status='waiting_approval';
pay.proofPhoto=msg.photo[msg.photo.length-1].file_id;
pay.proofAt=Date.now();
await saveDB(db);
for(let ownerId of config.OWNER_IDS){ try{ await bot.sendPhoto(ownerId, pay.proofPhoto, { caption:`📤 <b>Bukti Masuk</b>\n${bq(`Invoice: <code>${pay.id}</code>\nUser: ${esc(user.first_name)} (<code>${chatId}</code>)\nPaket: ${pay.days}H\nJumlah: ${fmtMoney(pay.amount)}`)}`, parse_mode:'HTML', reply_markup:{inline_keyboard:[[{text:'✅ ACC',callback_data:'approve_'+pay.id},{text:'❌ Tolak',callback_data:'reject_'+pay.id}]]} }); }catch(e){} }
return bot.sendMessage(chatId, `✅ <b>Bukti Diterima</b>\n${bq(`Invoice: <code>${pay.id}</code>\nStatus: Menunggu ACC\n\nSudah diteruskan ke owner\nMaks 5-10 menit di ACC\nKamu akan dapat notif`)}`, {parse_mode:'HTML'});
}
if(text.startsWith('/start')){
const refMatch=text.match(/\/start\s+(\d+)/);
if(refMatch){
const refId=refMatch[1];
if(refId!==String(chatId) && !isSuspiciousId(refId) && db.users[refId] && !user.referredBy){
user.referredBy=refId;
const refUser=db.users[refId];
if(refUser){ refUser.referralCount=(refUser.referralCount||0)+1; if(!refUser.referrals.includes(String(chatId))) refUser.referrals.push(String(chatId)); try{ await bot.sendMessage(refId, `🎉 <b>Referral Baru!</b>\n${bq(`${esc(user.first_name)} join via link kamu\nTotal: ${refUser.referralCount}`)}`, {parse_mode:'HTML'}); }catch(e){} }
}
}
const m=isOwner(chatId) ? getOwnerMenu(chatId,db,user) : getUserMenu(chatId,db,user);
return bot.sendMessage(chatId,m.text,m.opts);
}
if(text.startsWith('/gen') && isOwner(chatId)){
const parts=text.split(/\s+/);
if(parts.length<3) return bot.sendMessage(chatId, `❌ <b>Format Salah</b>\n${bq(`Pakai:\n/gen KODE HARI [KUOTA]\n\nContoh:\n/gen WALZY30 30\n/gen VIP7 7 10`)}`, {parse_mode:'HTML'});
const code=parts[1].toUpperCase();
const days=parseInt(parts[2]);
const quota=parseInt(parts[3])||0;
if(!code || !days || days<=0) return bot.sendMessage(chatId, `❌ <b>Data Salah</b>\n${bq('Kode & hari wajib benar')}`, {parse_mode:'HTML'});
if(db.codes[code]) return bot.sendMessage(chatId, `❌ <b>Sudah Ada</b>\n${bq(code+' sudah ada')}`, {parse_mode:'HTML'});
db.codes[code]={code,days,quota,used:0,createdAt:Date.now(),type:quota===1?'private':'public',createdBy:String(chatId)};
await saveDB(db);
return bot.sendMessage(chatId, `✅ <b>Voucher Jadi</b>\n${bq(`🎫 Kode: <code>${code}</code>\n⏰ ${days} Hari\n👥 Kuota: ${quota||'∞'}`)}`, {parse_mode:'HTML'});
}
if(text.startsWith('/redeem')){
const code=text.split(/\s+/)[1];
if(!code) return bot.sendMessage(chatId, `❌ <b>Kode Kosong</b>\n${bq('Ketik: /redeem KODE')}`, {parse_mode:'HTML'});
const c=db.codes[code.toUpperCase()];
if(!c) return bot.sendMessage(chatId, `❌ <b>Tidak Valid</b>\n${bq(code.toUpperCase()+' tidak ada')}`, {parse_mode:'HTML'});
const days=typeof c==='object' ? c.days : c;
const quota=typeof c==='object' ? (c.quota||0) : 0;
const used=typeof c==='object' ? (c.used||0) : 0;
if(quota>0 && used>=quota) return bot.sendMessage(chatId, `❌ <b>Habis</b>\n${bq(code.toUpperCase()+' habis '+used+'/'+quota)}`, {parse_mode:'HTML'});
user.premiumUntil=Math.max(Date.now(),user.premiumUntil||0)+days*86400000;
if(typeof c==='object'){ c.used=(c.used||0)+1; if(c.type==='private' && quota===1) delete db.codes[code.toUpperCase()]; }else delete db.codes[code.toUpperCase()];
await saveDB(db);
return bot.sendMessage(chatId, `✅ <b>Berhasil!</b>\n${bq(`🎫 ${code.toUpperCase()}\n💎 VIP ${days} Hari\n📅 Sampai ${new Date(user.premiumUntil).toLocaleDateString('id-ID')}`)}`, {parse_mode:'HTML'});
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
if(joinCheck.joined){ const m=isOwner(chatId) ? getOwnerMenu(chatId,db,user) : getUserMenu(chatId,db,user); await bot.editMessageText(m.text, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:m.opts.reply_markup}); }else{ await bot.answerCallbackQuery(query.id,{text:'Belum join semua!'}); }
return;
}
if(data==='menu_main'){ const m=isOwner(chatId) ? getOwnerMenu(chatId,db,user) : getUserMenu(chatId,db,user); return bot.editMessageText(m.text, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:m.opts.reply_markup}); }
if(data==='menu_fix'){
const can=canUseFix(db,user);
if(!can.allowed){ return bot.editMessageText(`⏳ <b>Batas Habis</b>\n${bq(`Kamu sudah pakai 3x hari ini\n\n💡 <b>Solusi</b>\n├ Tunggu reset 00:00 WIB\n├ Upgrade VIP unlimited\n└ VIP mulai Rp 15K\n\nTap Upgrade di bawah`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'💎 Upgrade VIP',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}}); }
return bot.editMessageText(`🔧 <b>Fix Merah</b>\n${bq(`📌 <b>Info Akun</b>\n├ Sisa: <code>${can.remaining} / 3</code> hari ini\n├ Status: ${can.isPremium?'💎 <b>VIP Unlimited</b>':'🎫 Gratis'}\n└ Reset: <code>00:00 WIB</code>\n\n🎯 <b>Cara Fix</b>\n├ Kirim nomor target\n├ Format: 08xxxx / 62xxxx\n└ Contoh: 08123456789\n\n⚠️ <b>Catatan</b>\n└ Pastikan nomor valid & aktif`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='menu_order'){
const payments=Object.values(db.payments||{}).filter(p=>p.status==='waiting_approval').slice(-8);
if(payments.length===0){ return bot.editMessageText(`📦 <b>Pending Kosong</b>\n${bq(`✅ Semua sudah di ACC\nTidak ada yang menunggu`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_main'}]]}}); }
let t=`📦 <b>Order Pending</b>\n<i>Butuh ACC cepat</i>\n\n`;
payments.forEach(p=>{ t+=`${bq(`🧾 <code>${p.id}</code>\n├ User: <code>${p.userId}</code>\n├ Paket: ${p.days}H • ${fmtMoney(p.amount)}\n└ ${new Date(p.createdAt).toLocaleString('id-ID')}`)}\n`; });
const kb=payments.slice(0,4).map(p=>[{text:`✅ ${p.id.slice(-6)}`,callback_data:'approve_'+p.id},{text:`❌ Tolak`,callback_data:'reject_'+p.id}]);
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
return bot.editMessageText(`📤 <b>Konfirmasi Bayar</b>\n${bq(`Invoice: <code>${inv}</code>\nJumlah: ${fmtMoney(pay.amount)}\nPaket: ${pay.days} Hari\n\n📸 Kirim foto bukti transfer\nPastikan jelas`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
}
if(data.startsWith('approve_')){
if(!isOwner(chatId)) return bot.answerCallbackQuery(query.id,{text:'Bukan owner'});
const inv=data.split('approve_')[1];
const pay=db.payments[inv];
if(!pay) return bot.answerCallbackQuery(query.id,{text:'Tidak ada'});
if(pay.status==='paid') return bot.editMessageText(`✅ <b>Sudah ACC</b>\n${bq(inv+' sudah ACC')}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
if(isSuspiciousId(pay.userId)) return bot.editMessageText(`⚠️ <b>User Tidak Valid</b>\n${bq(inv)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
pay.status='paid';
const u=getUser(db,pay.userId);
if(!u) return;
u.premiumUntil=Math.max(Date.now(),u.premiumUntil||0)+pay.days*86400000;
u.pendingDeposit=null;
db.stats.revenue=(db.stats.revenue||0)+pay.amount;
if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory=[];
db.stats.revenueHistory.push({date:new Date().toISOString(),amount:pay.amount,invoice:inv,userId:pay.userId});
await saveDB(db);
await bot.editMessageText(`✅ <b>ACC Berhasil</b>\n${bq(`Invoice: ${inv}\nUser: ${pay.userId}\nPaket: ${pay.days} Hari`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
try{ await bot.sendMessage(pay.userId, `✅ <b>LUNAS!</b>\n${bq(`Invoice: ${inv}\nPaket: ${pay.days} Hari\nSampai: ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}\n\nMakasih udah langganan ✨`)}`, {parse_mode:'HTML'}); }catch{}
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
await bot.editMessageText(`❌ <b>Ditolak</b>\n${bq(inv+' ditolak')}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML'});
try{ await bot.sendMessage(pay.userId, `❌ <b>Ditolak</b>\n${bq(inv+' ditolak\nHubungi owner')}`, {parse_mode:'HTML'}); }catch{}
return;
}
if(data==='owner_users' && isOwner(chatId)){
const unique=getUniqueUsers(db.users);
let t=`👥 <b>Pengguna Real</b>\n${bq(`Total valid: ${unique.length}`)}\n\n`;
unique.slice(-10).reverse().forEach(u=>{
const st=isPremium(u) ? `VIP ${getPremiumLeft(u)}H` : `Free ${u.dailyFix?.count||0}/3`;
t+=`${bq(`👤 ${esc((u.first_name||'User').substring(0,14))}\n├ ID: <code>${u.id}</code>\n├ Order: ${u.totalFix||0} • ${st}\n└ Ref: ${u.referralCount||0}`)}\n`;
});
return bot.editMessageText(t,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎨 WebApp',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='owner_voucher' && isOwner(chatId)){
const codes=Object.values(db.codes||{}).slice(-10);
let t=`🎟️ <b>Voucher Manager</b>\n${bq(`Buat kode:\n/gen KODE HARI [KUOTA]\n\nContoh:\n/gen WALZY30 30\n/gen VIP7 7 1`)}\n\n`;
if(codes.length>0){
codes.reverse().forEach(c=>{
const code=typeof c==='object' ? c.code : 'CODE';
const days=typeof c==='object' ? c.days : c;
const quota=typeof c==='object' ? (c.quota||0) : 0;
const used=typeof c==='object' ? (c.used||0) : 0;
const type=typeof c==='object' ? (c.type||'public') : 'legacy';
t+=`${bq(`🎫 <code>${code}</code>\n├ ${days}H • ${type}\n├ Kuota: ${quota||'∞'} • Pakai: ${used}\n└ ${quota>0&&used>=quota?'❌ Habis':'✅ Aktif'}`)}\n`;
});
}else t+=`${bq('Belum ada voucher')}\n`;
return bot.editMessageText(t,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎨 Buat di WebApp',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='menu_stats'){
const validUsers=getUniqueUsers(db.users);
const now=new Date();
const todayOrders=Object.values(db.payments||{}).filter(p=>{ if(isSuspiciousId(p.userId)) return false; const d=new Date(p.createdAt); return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); }).length;
const pending=Object.values(db.payments||{}).filter(p=>p.status==='waiting_approval').length;
const revenue=db.stats.revenue||0;
const txt=`📊 <b>Statistik Walzy</b>\n${bq(`👥 <b>Pengguna</b>\n├ Valid: <code>${validUsers.length}</code>\n├ VIP: <code>${validUsers.filter(u=>isPremium(u)).length}</code>\n└ Free: <code>${validUsers.length-validUsers.filter(u=>isPremium(u)).length}</code>\n\n📦 <b>Order</b>\n├ Total: <code>${db.stats.totalFix||0}</code>\n├ Hari Ini: <code>${todayOrders}</code>\n├ Pending: <code>${pending}</code>\n├ Sukses: <code>${db.stats.totalSuccess||0}</code>\n└ Gagal: <code>${db.stats.totalFailed||0}</code>\n\n💰 <b>Revenue</b>\n├ Total: <code>${fmtMoney(revenue)}</code>\n└ Sukses Rate: <code>${db.stats.totalFix ? Math.round((db.stats.totalSuccess/db.stats.totalFix)*100) : 0}%</code>`)}`;
return bot.editMessageText(txt,{chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎨 WebApp',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='menu_broadcast' && isOwner(chatId)){
db.users[String(chatId)].awaitingBroadcast=true;
await saveDB(db);
return bot.editMessageText(`📢 <b>Broadcast</b>\n${bq(`Ketik pesan siaran\nMaks 1000 karakter\n\nKetik batal untuk batal`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'❌ Batal',callback_data:'cancel_action'}]]}});
}
if(data==='menu_packages'){
return bot.editMessageText(`💎 <b>Paket Walzy</b>\n${bq(`🔥 <b>Starter 7H - Rp 15K</b>\n├ Pemula\n├ Unlimited fix\n└ Support\n\n⭐ <b>Pro 30H - Rp 45K (Best)</b>\n├ Terlaris hemat 40%\n├ Unlimited + bonus\n└ Spin harian\n\n👑 <b>Sultan 90H - Rp 99K</b>\n├ Power user\n├ Semua fitur\n└ Prioritas tertinggi`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'🎨 Buka Store',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='menu_profile'){
const rnk=getRank(user.referralCount||0);
const can=canUseFix(db,user);
return bot.editMessageText(`👤 <b>Profil Kamu</b>\n${bq(`Nama: <b>${esc(user.first_name)}</b>\nID: <code>${user.id}</code>\nUsername: @${esc(user.username||'-')}\n\n💎 Status: ${isPremium(user)?`VIP ${getPremiumLeft(user)} Hari`:`Free ${can.remaining}/3`}\n🏆 Rank: ${rnk.name} ${rnk.icon}\n👥 Referral: ${user.referralCount||0}\n📦 Order: ${user.totalFix||0}\n📅 Gabung: ${new Date(user.joinedAt).toLocaleDateString('id-ID')}\n\nHari Ini: ${user.dailyFix.count}/3`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='menu_spin'){
const canSpin=!user.lastSpin || user.lastSpin!==getTodayString();
return bot.editMessageText(`🎰 <b>Spin Harian</b>\n${bq(`${canSpin?'🎉 Bisa spin hari ini!':'⏳ Sudah spin, besok lagi'}\n\n🎁 <b>Hadiah</b>\n├ Bonus 1-2 pesanan\n├ VIP 1 hari gratis\n└ 5 poin referral\n\nReset 00:00 WIB`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:canSpin?'🎰 Putar di WebApp': '✅ Sudah Klaim',web_app:{url:`${process.env.PUBLIC_URL || ''}/webapp`}}],[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='menu_referral'){
const botU=(await bot.getMe()).username;
const link=`https://t.me/${botU}?start=${chatId}`;
return bot.editMessageText(`🔗 <b>Referral Kamu</b>\n${bq(`Ajak teman pakai Walzy\n\nLink:\n${link}\n\n👥 Total: ${user.referralCount||0}\n🏆 Rank: ${getRank(user.referralCount||0).name}\n\n💡 Keuntungan\n├ Naik rank cepat\n├ Bonus VIP\n└ Prioritas`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'◁ Kembali',callback_data:'menu_main'}]]}});
}
if(data==='user_contact_owner'){
db.users[String(chatId)].awaitingSupport=true;
await saveDB(db);
return bot.editMessageText(`💬 <b>Hubungi Owner</b>\n${bq(`Tulis keluhan / pertanyaan\nMaks 500 karakter\n\nContoh:\n"Sudah transfer belum ACC"\n"Error fix 08xxx"\n\nKetik batal untuk batal`)}`, {chat_id:chatId,message_id:msgId,parse_mode:'HTML',reply_markup:{inline_keyboard:[[{text:'❌ Batal',callback_data:'cancel_action'}]]}});
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
