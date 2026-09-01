const TelegramBot = require('node-telegram-bot-api');
const { loadDB, saveDB, getTodayString, genInvoiceID, getRank } = require('../lib/utils');
const config = require('../config');
const rateCache = new Map();
function isOwner(id){try{if(config && config.OWNER_IDS) return config.OWNER_IDS.map(String).includes(String(id));}catch(e){}return false;}
function isSuspiciousId(id){if(!id) return true;const s=String(id);const n=Number(id);if(!n || n<=0 || s.startsWith('-') || s.length>20 || s.includes('.')) return true;return false;}
function getUniqueUsers(usersObj){const map=new Map();for(let u of Object.values(usersObj||{})){if(!u || isSuspiciousId(u.id)) continue;const key=String(u.id);if(!map.has(key)) map.set(key,u);}return Array.from(map.values());}
function isPremium(u){return u && u.premiumUntil && u.premiumUntil>Date.now();}
function checkRate(ip){const now=Date.now();const key=ip||'unknown';const entry=rateCache.get(key);if(!entry){rateCache.set(key,{count:1,ts:now});return true;}if(now-entry.ts>60000){rateCache.set(key,{count:1,ts:now});return true;}if(entry.count>150) return false;entry.count++;return true;}
function ensureUserInDB(db, userId, nameData, usernameData){const k=String(userId);if(!db.users[k]){db.users[k]={id:Number(userId)||userId,first_name:nameData||'User',username:usernameData||'',joinedAt:Date.now(),referralCount:0,referrals:[],referredBy:null,totalFix:0,dailyFix:{date:getTodayString(),count:0},premiumUntil:0,lastSpin:null,points:0,checkinStreak:0,lastCheckin:null,weeklyStreak:0};}else{if(nameData && db.users[k].first_name!==nameData) db.users[k].first_name=nameData;if(usernameData!==undefined && db.users[k].username!==usernameData) db.users[k].username=usernameData;}if(Array.isArray(db.users[k].referrals)){db.users[k].referralCount=db.users[k].referrals.length;}const paid=Object.values(db.payments||{}).filter(p=>String(p.userId)===k && (p.status==='paid' || p.status==='approved'));db.users[k].totalFix=paid.length;return db.users[k];}
function getWeeklyPoints(){return [[10,15,20,25,30,50,100],[15,20,25,30,40,60,120],[20,25,30,40,50,70,140],[25,30,40,50,60,80,160]];}
function getWeekIndex(){return Math.floor(Date.now()/(7*24*3600*1000))%4;}
module.exports = async (req, res) => {
res.setHeader('Access-Control-Allow-Origin','*');
res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
res.setHeader('Access-Control-Allow-Headers','Content-Type');
res.setHeader('Content-Type','application/json; charset=utf-8');
res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
if(req.method==='OPTIONS') return res.status(200).json({ok:true});
const clientIp=req.headers['x-forwarded-for']||req.headers['x-real-ip']||'unknown';
if(!checkRate(clientIp)) return res.status(200).json({ok:false,message:'Batas Permintaan Terlampaui'});
const fullUrl=req.url||'';
const queryString=fullUrl.includes('?') ? fullUrl.split('?').slice(1).join('?') : '';
const parsedParams=new URLSearchParams(queryString);
const query={};
for(const [k,v] of parsedParams.entries()) query[k]=v;
if(req.query) Object.assign(query, req.query);
let body=req.body||{};
if(typeof body==='string'){try{body=JSON.parse(body);}catch(e){body={};}}
const endpoint=query.endpoint||body.endpoint||'';
try{
const db=await loadDB();
if(!db.users) db.users={};
if(!db.payments) db.payments={};
if(!db.codes) db.codes={};
if(!db.stats) db.stats={totalFix:0,totalSuccess:0,totalFailed:0,revenue:0,revenueHistory:[],lastReset:Date.now()};
if(endpoint==='health'){return res.status(200).json({ok:true,message:'WALZY API V6 TOTAL ONLINE',timestamp:Date.now(),users:Object.keys(db.users).length,codes:Object.keys(db.codes).length});}
if(endpoint==='user'){
const userId=query.user_id||body.user_id;
const firstName=query.first_name||body.first_name||null;
const userName=query.username||body.username||null;
if(!userId || isSuspiciousId(userId)){
return res.status(200).json({ok:true,user:{id:userId||0,first_name:firstName||'User',username:userName||'',referralCount:0,totalFix:0,points:0,checkinStreak:0,dailyFixRemaining:'5/5',isPremium:false,premiumLeftDays:0,canSpin:true,canCheckin:true,rank:{name:'Pemula',icon:'🌱'},pendingDeposit:null,referralLink:`https://t.me/${config.BOT_USERNAME||'walzystore_bot'}`,isOwner:false,weekIndex:getWeekIndex()},currentInvoice:null,invoices:[],dana:{number:config.DANA_NUMBER||'083124469855',name:config.DANA_NAME||'WALZY STORE'}});
}
let user=ensureUserInDB(db,userId,firstName,userName);
const isPrem=isPremium(user);
const premiumLeft=isPrem ? Math.ceil((user.premiumUntil-Date.now())/86400000) : 0;
if(!user.dailyFix || user.dailyFix.date!==getTodayString()){user.dailyFix={date:getTodayString(),count:0};}
const canSpin=!user.lastSpin || user.lastSpin!==getTodayString();
const canCheckin=!user.lastCheckin || user.lastCheckin!==getTodayString();
const rankInfo=getRank(user.referralCount||0);
const userInvoices=Object.values(db.payments).filter(p=>String(p.userId)===String(userId));
const activeInvoice=userInvoices.find(p=>p.status==='pending' || p.status==='waiting_approval' || p.status==='waiting_payment')||null;
const remainingQuota=isPrem ? 'Unlimited ♾️' : `${Math.max(0,5-(user.dailyFix.count||0))}/5`;
await saveDB(db);
return res.status(200).json({ok:true,user:{id:user.id,first_name:user.first_name||'User',username:user.username||'',referralCount:user.referralCount||0,totalFix:user.totalFix||0,points:user.points||0,checkinStreak:user.checkinStreak||0,dailyFixRemaining:remainingQuota,isPremium:isPrem,premiumLeftDays:premiumLeft,canSpin:canSpin,canCheckin:canCheckin,rank:rankInfo,pendingDeposit:activeInvoice,referralLink:`https://t.me/${config.BOT_USERNAME||'walzystore_bot'}?start=ref_${user.id}`,isOwner:isOwner(userId),weekIndex:getWeekIndex()},currentInvoice:activeInvoice,invoices:userInvoices,dana:{number:config.DANA_NUMBER||'083124469855',name:config.DANA_NAME||'WALZY STORE'},weeklyPoints:getWeeklyPoints()});
}
if(endpoint==='spin'){
const userId=String(body.user_id||query.user_id||'');
const firstName=body.first_name||query.first_name||null;
if(!userId || isSuspiciousId(userId)) return res.status(200).json({ok:false,message:'User ID tidak valid'});
let dbUser=db.users[userId];
if(!dbUser){dbUser=ensureUserInDB(db,userId,firstName,null);}
if(dbUser.lastSpin===getTodayString()) return res.status(200).json({ok:false,message:'Spin harian sudah digunakan hari ini!'});
const prizes=[{label:'+50 PTS',type:'points',value:50,weight:28},{label:'ZONK',type:'zonk',value:0,weight:12},{label:'+25 PTS',type:'points',value:25,weight:24},{label:'+100 PTS',type:'points',value:100,weight:10},{label:'+3 KUOTA',type:'quota',value:3,weight:16},{label:'VIP 1H',type:'vip',value:1,weight:10}];
const totalWeight=prizes.reduce((a,b)=>a+b.weight,0);
let r=Math.random()*totalWeight;
let selected=prizes[0];
let idx=0;
for(let i=0;i<prizes.length;i++){if(r<prizes[i].weight){selected=prizes[i];idx=i;break;}r-=prizes[i].weight;}
dbUser.lastSpin=getTodayString();
if(selected.type==='points'){dbUser.points=(dbUser.points||0)+selected.value;}else if(selected.type==='quota'){if(!dbUser.dailyFix || dbUser.dailyFix.date!==getTodayString()) dbUser.dailyFix={date:getTodayString(),count:0};dbUser.dailyFix.count=Math.max(0,(dbUser.dailyFix.count||0)-selected.value);}else if(selected.type==='vip'){dbUser.premiumUntil=Math.max(Date.now(),dbUser.premiumUntil||0)+86400000*selected.value;}
db.stats.totalFix=(db.stats.totalFix||0)+1;
await saveDB(db);
return res.status(200).json({ok:true,message:`Selamat! Kamu mendapatkan ${selected.label}`,prize:selected,prizeIndex:idx});
}
if(endpoint==='checkin'){
const userId=String(body.user_id||query.user_id||'');
const firstName=body.first_name||query.first_name||null;
if(!userId || isSuspiciousId(userId)) return res.status(200).json({ok:false,message:'User ID tidak valid'});
let user=db.users[userId];
if(!user){user=ensureUserInDB(db,userId,firstName,null);}
if(user.lastCheckin===getTodayString()) return res.status(200).json({ok:false,message:'Kamu sudah check-in hari ini!'});
const today=getTodayString();
const yesterdayJakarta=new Date(Date.now()-86400000).toLocaleString('en-US',{timeZone:'Asia/Jakarta'}).slice(0,10);
const yesterdayISO=new Date(Date.now()-86400000).toISOString().slice(0,10);
if(user.lastCheckin===yesterdayJakarta || user.lastCheckin===yesterdayISO){user.checkinStreak=(user.checkinStreak||0)+1;}else{user.checkinStreak=1;}
if(user.checkinStreak>7) user.checkinStreak=1;
user.lastCheckin=today;
const weekIdx=getWeekIndex();
const weekly=getWeeklyPoints();
const bonus=weekly[weekIdx][user.checkinStreak-1]||10;
user.points=(user.points||0)+bonus;
await saveDB(db);
return res.status(200).json({ok:true,message:`Check-in Day ${user.checkinStreak} Minggu ${weekIdx+1} berhasil! +${bonus} PTS`,bonus:bonus,streak:user.checkinStreak,week:weekIdx+1});
}
if(endpoint==='redeem'){
const userId=String(body.user_id||query.user_id||'');
const option=body.option||query.option;
if(!userId || isSuspiciousId(userId)) return res.status(200).json({ok:false,message:'User tidak valid'});
let user=db.users[userId];
if(!user) user=ensureUserInDB(db,userId,null,null);
if(option==='quota1' || option==='quota'){if((user.points||0)<100) return res.status(200).json({ok:false,message:'Butuh 100 PTS'});user.points-=100;if(!user.dailyFix || user.dailyFix.date!==getTodayString()) user.dailyFix={date:getTodayString(),count:0};user.dailyFix.count=Math.max(0,(user.dailyFix.count||0)-1);await saveDB(db);return res.status(200).json({ok:true,message:'Berhasil +1 Kuota'});}
else if(option==='quota3'){if((user.points||0)<250) return res.status(200).json({ok:false,message:'Butuh 250 PTS'});user.points-=250;if(!user.dailyFix || user.dailyFix.date!==getTodayString()) user.dailyFix={date:getTodayString(),count:0};user.dailyFix.count=Math.max(0,(user.dailyFix.count||0)-3);await saveDB(db);return res.status(200).json({ok:true,message:'Berhasil +3 Kuota'});}
else if(option==='spin'){if((user.points||0)<150) return res.status(200).json({ok:false,message:'Butuh 150 PTS'});user.points-=150;user.lastSpin=null;await saveDB(db);return res.status(200).json({ok:true,message:'Spin direset'});}
else if(option==='vip1'){if((user.points||0)<500) return res.status(200).json({ok:false,message:'Butuh 500 PTS'});user.points-=500;user.premiumUntil=Math.max(Date.now(),user.premiumUntil||0)+86400000*1;await saveDB(db);return res.status(200).json({ok:true,message:'VIP 1 Hari aktif'});}
else if(option==='vip3'){if((user.points||0)<1200) return res.status(200).json({ok:false,message:'Butuh 1200 PTS'});user.points-=1200;user.premiumUntil=Math.max(Date.now(),user.premiumUntil||0)+86400000*3;await saveDB(db);return res.status(200).json({ok:true,message:'VIP 3 Hari aktif'});}
else if(option==='bonus200'){if((user.points||0)<300) return res.status(200).json({ok:false,message:'Butuh 300 PTS'});user.points-=300;user.points+=500;await saveDB(db);return res.status(200).json({ok:true,message:'Berhasil 300->500 (+200)'});}
return res.status(200).json({ok:false,message:'Opsi tidak valid'});
}
if(endpoint==='create_order'){
const userId=String(body.user_id||query.user_id||'');
const days=parseInt(body.days||query.days)||0;
const amount=parseInt(body.amount||query.amount)||0;
if(!userId || isSuspiciousId(userId)) return res.status(200).json({ok:false,message:'User ID tidak valid'});
if(!days || days<=0) return res.status(200).json({ok:false,message:'Durasi tidak valid'});
let user=db.users[userId];
if(!user) user=ensureUserInDB(db,userId,null,null);
const existingPending=Object.values(db.payments||{}).find(p=>String(p.userId)===userId && (p.status==='pending' || p.status==='waiting_approval'));
if(existingPending){return res.status(200).json({ok:false,message:'Masih ada invoice pending: '+existingPending.id});}
const invoiceId=genInvoiceID();
const invoice={id:invoiceId,invoice:invoiceId,userId:userId,days:days,amount:amount,status:'pending',proofImage:null,createdAt:Date.now()};
db.payments[invoiceId]=invoice;
const saved=await saveDB(db);
if(!saved){return res.status(200).json({ok:false,message:'Gagal simpan, coba lagi'});}
return res.status(200).json({ok:true,message:'Invoice dibuat',invoice:invoice});
}
if(endpoint==='cancel_order'){
const userId=String(body.user_id||query.user_id||'');
const invoiceId=String(body.invoice||query.invoice||'');
if(!userId || !invoiceId) return res.status(200).json({ok:false,message:'Data tidak lengkap'});
const pay=db.payments[invoiceId];
if(!pay) return res.status(200).json({ok:false,message:'Invoice tidak ditemukan'});
if(String(pay.userId)!==userId && !isOwner(userId)) return res.status(200).json({ok:false,message:'Akses ditolak'});
if(pay.status==='paid' || pay.status==='approved') return res.status(200).json({ok:false,message:'Sudah lunas'});
delete db.payments[invoiceId];
await saveDB(db);
return res.status(200).json({ok:true,message:'Invoice dibatalkan'});
}
if(endpoint==='upload_proof'){
const userId=String(body.user_id||query.user_id||'');
const invoiceId=String(body.invoice||query.invoice||'');
const imageData=body.image_data||'';
if(!userId || !invoiceId || !imageData) return res.status(200).json({ok:false,message:'Data tidak lengkap'});
const pay=db.payments[invoiceId];
if(!pay) return res.status(200).json({ok:false,message:'Invoice tidak ditemukan'});
if(String(pay.userId)!==userId) return res.status(200).json({ok:false,message:'Akses ditolak'});
pay.proofImage=imageData;
pay.status='waiting_approval';
pay.proofAt=Date.now();
await saveDB(db);
try{
const bot=new TelegramBot(config.BOT_TOKEN);
for(let oid of (config.OWNER_IDS||[])){
try{await bot.sendMessage(oid, `📥 <b>BUKTI MASUK</b>\n\nInvoice: <code>${invoiceId}</code>\nUser: <code>${userId}</code>\nRp ${pay.amount} • ${pay.days}H`, {parse_mode:'HTML'});}catch(e){}
}
}catch(e){}
return res.status(200).json({ok:true,message:'Bukti diupload, menunggu verifikasi'});
}
if(endpoint==='claim_code'){
const userId=String(body.user_id||query.user_id||'');
const rawCode=String(body.code||query.code||'').trim();
const code=rawCode.toUpperCase();
if(!userId || !code) return res.status(200).json({ok:false,message:'Data tidak lengkap'});
let user=db.users[userId];
if(!user){user=ensureUserInDB(db,userId,null,null);}
let vCode=db.codes[code];
let actualKey=code;
if(!vCode){const foundKey=Object.keys(db.codes).find(k=>k.toUpperCase()===code);if(foundKey){vCode=db.codes[foundKey];actualKey=foundKey;}}
if(!vCode) return res.status(200).json({ok:false,message:'Kode Tidak Valid'});
const days=typeof vCode==='object' ? (vCode.days||0) : (typeof vCode==='number' ? vCode : 0);
const quota=typeof vCode==='object' ? (vCode.quota||0) : 0;
const used=typeof vCode==='object' ? (vCode.used||0) : 0;
if(days<=0) return res.status(200).json({ok:false,message:'Voucher tidak valid'});
if(quota>0 && used>=quota){return res.status(200).json({ok:false,message:'Kuota Habis ('+used+'/'+quota+')'});}
user.premiumUntil=Math.max(Date.now(),user.premiumUntil||0)+(days*86400000);
if(typeof vCode==='object'){vCode.used=(vCode.used||0)+1;if(quota>0 && vCode.used>=quota){vCode.expired=true;}}else{delete db.codes[actualKey];}
await saveDB(db);
return res.status(200).json({ok:true,message:`Voucher berhasil +${days} Hari VIP`,days:days});
}
if(endpoint==='stats'){
const userId=query.user_id||body.user_id;
const ownerCheck=userId ? isOwner(userId) : false;
const validUsers=getUniqueUsers(db.users);
const premiumUsers=validUsers.filter(u=>isPremium(u)).length;
const allPayments=Object.values(db.payments||{});
const pending=allPayments.filter(p=>p.status==='waiting_approval' || p.status==='pending');
const paid=allPayments.filter(p=>p.status==='paid' || p.status==='approved');
return res.status(200).json({ok:true,isOwner:ownerCheck,usersValid:validUsers.length,premium:premiumUsers,totalFix:db.stats.totalFix||0,pendingPayments:pending.slice(-50).reverse(),paidPayments:ownerCheck ? paid.slice(-50).reverse() : [],recentUsers:ownerCheck ? validUsers.slice(-50).reverse() : [],codes:ownerCheck ? Object.values(db.codes).slice(-100) : [],revenue:ownerCheck ? (db.stats.revenue||0) : 0});
}
if(endpoint==='owner_action'){
const ownerId=String(body.owner_id||query.owner_id||'');
if(!isOwner(ownerId)) return res.status(200).json({ok:false,message:'Akses Ditolak'});
const invoice=body.invoice;
const action=body.action;
const pay=db.payments[invoice];
if(!pay) return res.status(200).json({ok:false,message:'Invoice Tidak Ditemukan'});
if(action==='approve'){
pay.status='paid';
pay.approvedAt=Date.now();
const u=db.users[String(pay.userId)];
if(u){u.premiumUntil=Math.max(Date.now(),u.premiumUntil||0)+(pay.days*86400000);u.pendingDeposit=null;}
db.stats.revenue=(db.stats.revenue||0)+pay.amount;
db.stats.totalSuccess=(db.stats.totalSuccess||0)+1;
await saveDB(db);
try{const bot=new TelegramBot(config.BOT_TOKEN);await bot.sendMessage(pay.userId, `<b>✅ LUNAS</b>\n\nInvoice: <code>${invoice}</code>\nVIP +${pay.days} Hari Aktif`, {parse_mode:'HTML'});}catch(e){}
return res.status(200).json({ok:true,message:`Invoice ${invoice} Disetujui`});
}else if(action==='reject'){
pay.status='rejected';
pay.rejectedAt=Date.now();
const u=db.users[String(pay.userId)];
if(u) u.pendingDeposit=null;
db.stats.totalFailed=(db.stats.totalFailed||0)+1;
await saveDB(db);
try{const bot=new TelegramBot(config.BOT_TOKEN);await bot.sendMessage(pay.userId, `❌ <b>DITOLAK</b>\n\nInvoice <code>${invoice}</code> ditolak`, {parse_mode:'HTML'});}catch(e){}
return res.status(200).json({ok:true,message:`Invoice ${invoice} Ditolak`});
}
}
if(endpoint==='create_code'){
const ownerId=String(body.owner_id||query.owner_id||'');
if(!isOwner(ownerId)) return res.status(200).json({ok:false,message:'Akses Ditolak'});
const rawCode=String(body.code||'').trim();
const code=rawCode.toUpperCase();
const days=parseInt(body.days);
const quota=parseInt(body.quota)||0;
if(!code || code.length<3) return res.status(200).json({ok:false,message:'Kode minimal 3'});
if(!days || days<=0) return res.status(200).json({ok:false,message:'Durasi tidak valid'});
if(db.codes[code] && !body.force){const existing=db.codes[code];const used=typeof existing==='object' ? (existing.used||0) : 0;const q=typeof existing==='object' ? (existing.quota||0) : 0;if(q===0 || used<q){return res.status(200).json({ok:false,message:'Kode sudah ada aktif ('+used+'/'+(q||'∞')+')'});}}
db.codes[code]={code:code,days:days,quota:quota,used:0,createdAt:Date.now(),createdBy:ownerId};
await saveDB(db);
return res.status(200).json({ok:true,message:`Voucher ${code} dibuat ${days}H Kuota ${quota>0 ? quota : '∞'}`});
}
if(endpoint==='delete_code'){
const ownerId=String(body.owner_id||query.owner_id||'');
if(!isOwner(ownerId)) return res.status(200).json({ok:false,message:'Akses Ditolak'});
const rawCode=String(body.code||'').trim();
const code=rawCode.toUpperCase();
let keyToDelete=code;
if(!db.codes[keyToDelete]){const found=Object.keys(db.codes).find(k=>k.toUpperCase()===code);if(found) keyToDelete=found;}
if(!db.codes[keyToDelete]) return res.status(200).json({ok:false,message:'Tidak Ditemukan'});
delete db.codes[keyToDelete];
await saveDB(db);
return res.status(200).json({ok:true,message:`Voucher ${keyToDelete} dihapus`});
}
if(endpoint==='broadcast'){
const ownerId=String(body.owner_id||query.owner_id||'');
if(!isOwner(ownerId)) return res.status(200).json({ok:false,message:'Akses Ditolak'});
const text=String(body.text||'').trim();
if(!text) return res.status(200).json({ok:false,message:'Pesan kosong'});
const validUsers=getUniqueUsers(db.users);
let sent=0;
let failed=0;
try{
const bot=new TelegramBot(config.BOT_TOKEN);
for(let u of validUsers){
try{await bot.sendMessage(u.id, `📢 <b>WALZY STORE</b>\n\n${text}`, {parse_mode:'HTML'});sent++;}catch(e){failed++;}
await new Promise(r=>setTimeout(r,70));
}
}catch(e){}
return res.status(200).json({ok:true,message:`Broadcast Selesai Berhasil ${sent} Gagal ${failed}`,sent,failed,total:validUsers.length});
}
return res.status(200).json({ok:false,message:'Endpoint Tidak Ditemukan'});
}catch(err){
console.error('API Error:',err);
return res.status(200).json({ok:false,message:'Internal Error',error:err.message});
}
};
