const { loadDB, saveDB } = require('../lib/utils');
const { getTodayString, genInvoiceID } = require('../lib/utils');
const config = require('../config');

const OWNER_PASSWORD = 'SUPER777';
const rateCache = new Map();
let dbCache = null;
let dbCacheTime = 0;
const CACHE_TTL = 3000;

async function getDB(){
const now=Date.now();
if(dbCache && (now-dbCacheTime)<CACHE_TTL) return dbCache;
const db=await loadDB();
dbCache=db;
dbCacheTime=now;
return db;
}
function clearCache(){ dbCache=null; dbCacheTime=0; }
function isOwner(id){
try{
if(config && config.OWNER_IDS) return config.OWNER_IDS.map(String).includes(String(id));
}catch(e){}
return false;
}
function isSuspiciousId(id){
if(!id) return true;
const s=String(id);
const n=Number(id);
if(!n||n<=0) return true;
if(s.startsWith('-')) return true;
if(s.length>20) return true;
if(s.includes('.')) return true;
return false;
}
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
function isPremium(u){ return u && u.premiumUntil && u.premiumUntil>Date.now(); }
function getRank(c){
if(c>=100) return {name:'SULTAN',icon:'👑'};
if(c>=50) return {name:'DIAMOND',icon:'💎'};
if(c>=20) return {name:'GOLD',icon:'🥇'};
if(c>=10) return {name:'SILVER',icon:'🥈'};
if(c>=5) return {name:'BRONZE',icon:'🥉'};
return {name:'BASIC',icon:'🌱'};
}
function checkRate(ip){
const now=Date.now();
const key=ip||'unknown';
const entry=rateCache.get(key);
if(!entry){ rateCache.set(key,{count:1,ts:now}); return true; }
if(now-entry.ts>60000){ rateCache.set(key,{count:1,ts:now}); return true; }
if(entry.count>60) return false;
entry.count++;
return true;
}

module.exports = async (req, res) => {
res.setHeader('Access-Control-Allow-Origin','*');
res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
res.setHeader('Access-Control-Allow-Headers','Content-Type');
res.setHeader('Content-Type','application/json; charset=utf-8');
res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
if(req.method==='OPTIONS') return res.status(200).json({ok:true});

const clientIp=req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
if(!checkRate(clientIp)) return res.status(429).json({ok:false,message:'Terlalu banyak request, tunggu 1 menit'});

const fullUrl=req.url||'';
const pathOnly=fullUrl.split('?')[0];
const query=req.query||{};
const body=req.body||{};

try{
const db=await getDB();
if(!db.users) db.users={};
if(!db.payments) db.payments={};
if(!db.codes) db.codes={};
if(!db.stats) db.stats={ totalFix:0, totalSuccess:0, totalFailed:0, revenue:0, revenueHistory:[], lastReset:Date.now() };
if(!db.history) db.history={};

if(Date.now()-dbCacheTime<100){
for(let k of Object.keys(db.users)){ if(isSuspiciousId(k)) delete db.users[k]; }
for(let k of Object.keys(db.payments)){ const p=db.payments[k]; if(p && isSuspiciousId(p.userId)) delete db.payments[k]; }
}

if(pathOnly.endsWith('/api/user')){
const userId=query.user_id || body.user_id;
if(!userId) return res.status(400).json({ok:false,message:'user_id diperlukan'});
if(isSuspiciousId(userId)) return res.json({ok:false,message:'User tidak valid'});
let user=db.users[String(userId)];
if(!user) return res.json({ok:false,message:'User tidak ditemukan, buka bot dan /start dulu'});
const isPremiumUser=isPremium(user);
const premiumLeft=isPremiumUser ? Math.ceil((user.premiumUntil-Date.now())/86400000) : null;
if(!user.dailyFix || user.dailyFix.date!==getTodayString()) user.dailyFix={date:getTodayString(),count:0};
const canSpin=!user.lastSpin || user.lastSpin!==getTodayString();
const userInvoices=[];
let currentInvoice=null;
for(let p of Object.values(db.payments)){
if(String(p.userId)===String(userId)){
userInvoices.push(p);
if(!currentInvoice && (p.status==='waiting_payment' || p.status==='waiting_proof' || p.status==='waiting_approval')) currentInvoice=p;
}
}
userInvoices.sort((a,b)=>b.createdAt-a.createdAt);
if(!currentInvoice) currentInvoice=userInvoices.find(p=>p.status==='waiting_payment' || p.status==='waiting_proof' || p.status==='waiting_approval')||null;
const global={ totalFix:db.stats.totalFix||0, totalSuccess:db.stats.totalSuccess||0, totalFailed:db.stats.totalFailed||0 };
const rank=getRank(user.referralCount||0);
const userData={ id:user.id, first_name:user.first_name, username:user.username, joinedAt:user.joinedAt, referralCount:user.referralCount||0, totalFix:user.totalFix||0, dailyFix:{ used:user.dailyFix.count, remaining: isPremiumUser ? 999 : Math.max(0,3-user.dailyFix.count), date:user.dailyFix.date, count:user.dailyFix.count }, isPremium:isPremiumUser, premiumLeft, rank, canSpin, lastSpin:user.lastSpin||null, history:(db.history[String(userId)]||[]).slice(0,20) };
return res.json({ok:true,user:userData,global,currentInvoice,hasProof: currentInvoice && currentInvoice.status==='waiting_approval',invoices:userInvoices.slice(0,20),pendingInvoice:currentInvoice,ts:Date.now()});
}

if(pathOnly.endsWith('/api/stats')){
const userId=query.user_id || body.user_id;
if(!userId) return res.status(400).json({ok:false,message:'user_id required'});
let ownerCheck=isOwner(userId);
if(!ownerCheck){
try{
if(db.users[String(userId)] && db.users[String(userId)].isOwner) ownerCheck=true;
}catch(e){}
}
const unique=getUniqueUsers(db.users);
const premiumCount=unique.filter(u=>isPremium(u)).length;
const allPayments=Object.values(db.payments||{});
const pending=allPayments.filter(p=>p.status==='waiting_approval' && !isSuspiciousId(p.userId));
const paid=allPayments.filter(p=>p.status==='paid' && !isSuspiciousId(p.userId));
const now=new Date();
const todayOrders=allPayments.filter(p=>{
if(isSuspiciousId(p.userId)) return false;
const d=new Date(p.createdAt);
return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
}).length;
const codesList=[];
for(let k of Object.keys(db.codes)){
const v=db.codes[k];
if(typeof v==='object' && v.code) codesList.push(v);
else if(typeof v==='number') codesList.push({code:k,days:v,quota:0,used:0,createdAt:Date.now(),type:'legacy'});
else codesList.push({code:k,days:v.days||0,quota:v.quota||0,used:v.used||0,createdAt:v.createdAt||Date.now(),type:v.type||'public'});
}
return res.json({ok:true,isOwner:ownerCheck,users:Object.keys(db.users).length,usersValid:unique.length,premium:premiumCount,totalFix:db.stats.totalFix||0,totalSuccess:db.stats.totalSuccess||0,totalFailed:db.stats.totalFailed||0,todayOrders,paidToday:paid.filter(p=>{ const d=new Date(p.createdAt); return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear(); }).length,pendingPayments:pending.slice(-30).reverse(),paidPayments:ownerCheck ? paid.slice(-30).reverse() : [],recentUsers:ownerCheck ? unique.slice(-30).reverse() : [],codes:ownerCheck ? codesList.slice(-40) : [],revenue:ownerCheck ? db.stats.revenue||0 : undefined,timestamp:Date.now()});
}

if(pathOnly.endsWith('/api/deposit')){
const userId=query.user_id || body.user_id;
const days=parseInt(query.days || body.days);
if(!userId) return res.status(400).json({ok:false,message:'user_id required'});
if(isSuspiciousId(userId)) return res.json({ok:false,message:'User tidak valid'});
if(!days || isNaN(days) || days<=0 || days>365) return res.json({ok:false,message:'Durasi 1-365 hari'});
const user=db.users[String(userId)];
if(!user) return res.json({ok:false,message:'User tidak ditemukan'});
const active=Object.values(db.payments).find(p=>String(p.userId)===String(userId) && (p.status==='waiting_payment' || p.status==='waiting_proof' || p.status==='waiting_approval'));
if(active) return res.json({ok:false,message:'Masih ada invoice aktif '+active.id});
const prices={7:15000,30:45000,90:99000};
const amount=prices[days] || days*2000;
const invoiceId=genInvoiceID();
const invoice={ id:invoiceId, userId:String(userId), days, amount, amountFormatted:'Rp '+amount.toLocaleString('id-ID'), status:'waiting_payment', createdAt:Date.now(), proofPhoto:null };
db.payments[invoiceId]=invoice;
user.pendingDeposit=invoiceId;
await saveDB(db);
clearCache();
return res.json({ok:true,message:'Invoice dibuat',invoice});
}

if(pathOnly.endsWith('/api/upload_proof')){
const userId=body.user_id;
const invoiceId=body.invoice;
const imageBase64=body.image_base64;
if(!userId || !invoiceId) return res.status(400).json({ok:false,message:'user_id dan invoice diperlukan'});
if(isSuspiciousId(userId)) return res.json({ok:false,message:'User tidak valid'});
if(!imageBase64 || imageBase64.length<100) return res.json({ok:false,message:'Gambar tidak valid'});
if(imageBase64.length>8*1024*1024) return res.json({ok:false,message:'Gambar terlalu besar max 5MB'});
const pay=db.payments[invoiceId];
if(!pay) return res.json({ok:false,message:'Invoice tidak ditemukan'});
if(String(pay.userId)!==String(userId)) return res.status(403).json({ok:false,message:'Bukan invoice kamu'});
if(pay.status==='paid') return res.json({ok:false,message:'Sudah lunas'});
if(pay.status==='waiting_approval') return res.json({ok:false,message:'Sudah dikirim, tunggu ACC'});
pay.status='waiting_approval';
pay.proofAt=Date.now();
await saveDB(db);
clearCache();
setImmediate(async ()=>{
try{
const bot=new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
for(let ownerId of config.OWNER_IDS){
try{ await bot.sendMessage(ownerId, `📤 <b>Bukti Baru</b>\nInvoice: <code>${invoiceId}</code>\nUser: <code>${userId}</code>\nPaket: ${pay.days}H • Rp ${pay.amount}\n\nCek WebApp Owner`, {parse_mode:'HTML'}); }catch(e){}
}
}catch(e){}
});
return res.json({ok:true,message:'Bukti terkirim, menunggu ACC'});
}

if(pathOnly.endsWith('/api/spin')){
const userId=query.user_id || body.user_id;
if(!userId) return res.status(400).json({ok:false,message:'user_id required'});
if(isSuspiciousId(userId)) return res.json({ok:false,message:'User tidak valid'});
const user=db.users[String(userId)];
if(!user) return res.json({ok:false,message:'User tidak ditemukan'});
const today=getTodayString();
if(user.lastSpin===today) return res.json({ok:false,message:'Sudah spin hari ini, besok lagi',alreadySpun:true});
const rewards=[{label:'Bonus 1 Pesanan',desc:'+1 batas hari ini',type:'fix'},{label:'VIP 1 Hari Gratis',desc:'Gratis VIP 1 hari',type:'vip'},{label:'5 Poin Referral',desc:'Bonus referral',type:'ref'},{label:'Bonus 2 Pesanan',desc:'+2 batas hari ini',type:'fix2'}];
const reward=rewards[Math.floor(Math.random()*rewards.length)];
user.lastSpin=today;
if(reward.type==='vip'){ user.premiumUntil=Math.max(Date.now(),user.premiumUntil||0)+86400000; }
else if(reward.type==='fix'){ if(user.dailyFix.date!==today) user.dailyFix={date:today,count:0}; user.dailyFix.count=Math.max(0,user.dailyFix.count-1); }
else if(reward.type==='fix2'){ if(user.dailyFix.date!==today) user.dailyFix={date:today,count:0}; user.dailyFix.count=Math.max(0,user.dailyFix.count-2); }
else if(reward.type==='ref'){ user.referralCount=(user.referralCount||0)+5; }
await saveDB(db);
clearCache();
return res.json({ok:true,message:'Spin berhasil',reward});
}

if(pathOnly.endsWith('/api/redeem')){
const userId=query.user_id || body.user_id;
const code=(query.code || body.code || '').toUpperCase().trim();
if(!userId) return res.status(400).json({ok:false,message:'user_id required'});
if(!code) return res.json({ok:false,message:'Kode kosong'});
if(code.length<3) return res.json({ok:false,message:'Kode minimal 3 karakter'});
if(isSuspiciousId(userId)) return res.json({ok:false,message:'User tidak valid'});
const c=db.codes[code];
if(!c) return res.json({ok:false,message:'Kode '+code+' tidak valid'});
const days=typeof c==='object' ? c.days : c;
const quota=typeof c==='object' ? (c.quota||0) : 0;
const used=typeof c==='object' ? (c.used||0) : 0;
if(quota>0 && used>=quota) return res.json({ok:false,message:'Kode habis '+used+'/'+quota});
const user=db.users[String(userId)];
if(!user) return res.json({ok:false,message:'User tidak ditemukan'});
user.premiumUntil=Math.max(Date.now(),user.premiumUntil||0)+days*86400000;
if(typeof c==='object'){ c.used=(c.used||0)+1; if(c.type==='private' && (quota===1 || c.quota===1)) delete db.codes[code]; }else delete db.codes[code];
await saveDB(db);
clearCache();
return res.json({ok:true,message:'VIP '+days+' Hari aktif sampai '+new Date(user.premiumUntil).toLocaleDateString('id-ID')});
}

if(pathOnly.endsWith('/api/create_code')){
const ownerId=String(body.owner_id||'');
const password=body.password;
const code=(body.code||'').toUpperCase().trim();
const days=parseInt(body.days);
const quota=parseInt(body.quota)||0;
const type=body.type||'public';
const isOwnerByPass=password===OWNER_PASSWORD;
const isOwnerById=isOwner(ownerId);
if(!isOwnerById && !isOwnerByPass) return res.status(403).json({ok:false,message:'Bukan owner, password salah'});
if(!code || code.length<3) return res.json({ok:false,message:'Kode minimal 3 karakter'});
if(!days || days<=0 || days>365) return res.json({ok:false,message:'Hari 1-365'});
if(db.codes[code]) return res.json({ok:false,message:'Kode '+code+' sudah ada'});
if(!/^[A-Z0-9]+$/.test(code)) return res.json({ok:false,message:'Kode hanya huruf angka'});
db.codes[code]={code,days,quota,used:0,createdAt:Date.now(),type,createdBy:ownerId};
await saveDB(db);
clearCache();
return res.json({ok:true,message:'Voucher '+code+' dibuat'});
}

if(pathOnly.endsWith('/api/delete_code')){
const ownerId=String(body.owner_id||'');
const password=body.password;
const code=(body.code||'').toUpperCase().trim();
const isOwnerByPass=password===OWNER_PASSWORD;
const isOwnerById=isOwner(ownerId);
if(!isOwnerById && !isOwnerByPass) return res.status(403).json({ok:false,message:'Bukan owner'});
if(!db.codes[code]) return res.json({ok:false,message:'Voucher '+code+' tidak ada'});
delete db.codes[code];
await saveDB(db);
clearCache();
return res.json({ok:true,message:'Voucher '+code+' dihapus'});
}

if(pathOnly.endsWith('/api/broadcast')){
const ownerId=String(body.owner_id||'');
const password=body.password;
const text=(body.text||'').trim();
const isOwnerByPass=password===OWNER_PASSWORD;
const isOwnerById=isOwner(ownerId);
if(!isOwnerById && !isOwnerByPass) return res.status(403).json({ok:false,message:'Bukan owner'});
if(!text) return res.json({ok:false,message:'Teks kosong'});
if(text.length>1000) return res.json({ok:false,message:'Maks 1000 karakter'});
const unique=getUniqueUsers(db.users);
res.json({ok:true,sent:unique.length,failed:0,message:'Broadcast mulai ke '+unique.length+' user'});
setImmediate(async ()=>{
let sent=0, failed=0;
try{
const bot=new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
for(let i=0;i<unique.length;i++){
const u=unique[i];
try{ await bot.sendMessage(u.id, `📢 <b>Walzy Store</b>\n\n${text}\n\n🚀 walzy`, {parse_mode:'HTML'}); sent++; }catch(e){ failed++; }
await new Promise(r=>setTimeout(r,80));
if(i%20===0 && i>0){
try{ await bot.sendMessage(ownerId, `📢 Progress ${i}/${unique.length} ✅${sent} ❌${failed}`, {parse_mode:'HTML'}); }catch(e){}
}
}
try{
const bot2=new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
await bot2.sendMessage(ownerId, `✅ Broadcast selesai\nTotal: ${unique.length}\nKirim: ${sent}\nGagal: ${failed}`, {parse_mode:'HTML'});
}catch(e){}
}catch(e){}
});
return;
}

if(pathOnly.endsWith('/api/owner_action')){
const ownerId=String(body.owner_id||'');
const password=body.password;
const action=body.action;
const invoice=body.invoice;
const isOwnerByPass=password===OWNER_PASSWORD;
const isOwnerById=isOwner(ownerId);
if(!isOwnerById && !isOwnerByPass) return res.status(403).json({ok:false,message:'Bukan owner'});
if(!invoice) return res.json({ok:false,message:'Invoice diperlukan'});
const pay=db.payments[invoice];
if(!pay) return res.json({ok:false,message:'Invoice '+invoice+' tidak ada'});
if(action==='approve'){
if(pay.status==='paid') return res.json({ok:false,message:'Sudah lunas'});
pay.status='paid';
const u=db.users[String(pay.userId)];
if(!u) return res.json({ok:false,message:'User tidak ada'});
u.premiumUntil=Math.max(Date.now(),u.premiumUntil||0)+pay.days*86400000;
u.pendingDeposit=null;
db.stats.revenue=(db.stats.revenue||0)+pay.amount;
if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory=[];
db.stats.revenueHistory.push({date:new Date().toISOString(),amount:pay.amount,invoice,userId:pay.userId});
await saveDB(db);
clearCache();
try{
const bot=new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
await bot.sendMessage(pay.userId, `✅ <b>LUNAS!</b>\nInvoice ${invoice} disetujui\nPaket ${pay.days} Hari sampai ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}\n\n🚀 walzy`, {parse_mode:'HTML'});
}catch(e){}
return res.json({ok:true,message:invoice+' disetujui'});
}else if(action==='reject'){
pay.status='rejected';
const u=db.users[String(pay.userId)];
if(u) u.pendingDeposit=null;
await saveDB(db);
clearCache();
try{
const bot=new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
await bot.sendMessage(pay.userId, `❌ <b>Ditolak</b>\nInvoice ${invoice} ditolak\n\n🚀 walzy`, {parse_mode:'HTML'});
}catch(e){}
return res.json({ok:true,message:invoice+' ditolak'});
}else return res.json({ok:false,message:'Action approve/reject'});
}

if(pathOnly.endsWith('/api/health')){
return res.json({ok:true,message:'Walzy API Active',ts:Date.now()});
}

return res.status(404).json({ok:false,message:'Endpoint tidak ditemukan: '+pathOnly});
}catch(e){
console.error(e);
return res.status(500).json({ok:false,message:e.message});
}
};
