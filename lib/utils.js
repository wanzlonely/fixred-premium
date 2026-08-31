const { Redis } = require('@upstash/redis');
let redis = null;
try{
if(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN){
redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN });
}
}catch(e){ redis = null; }
let memDB = null;
const DEFAULT_DB = { users: {}, payments: {}, codes: {}, stats: { totalFix:0, totalSuccess:0, totalFailed:0, revenue:0, revenueHistory:[], lastReset: Date.now() }, history: {}, pending: {}, supportMap: {} };
function deepClone(o){ return JSON.parse(JSON.stringify(o)); }
async function loadDB(){
if(redis){
try{
let data = await redis.get('walzy:db');
if(data){
if(typeof data === 'string'){ try{ data = JSON.parse(data); }catch(e){ data = null; } }
if(data && data.users) return data;
}
}catch(e){}
}
if(memDB) return deepClone(memDB);
memDB = deepClone(DEFAULT_DB);
return deepClone(memDB);
}
async function saveDB(db){
const clone = deepClone(db);
memDB = clone;
if(redis){
try{ await redis.set('walzy:db', JSON.stringify(clone)); }catch(e){}
}
}
function getTodayString(){
return new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Jakarta'});
}
function genID(){
return Math.random().toString(36).substring(2,10).toUpperCase();
}
function genInvoiceID(){
return 'WALZY-'+Math.random().toString(36).substring(2,8).toUpperCase()+'-'+Date.now().toString().slice(-4);
}
function esc(s){
if(!s) return '';
return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function getRank(count){
if(count>=100) return {name:'SULTAN',icon:'👑'};
if(count>=50) return {name:'DIAMOND',icon:'💎'};
if(count>=20) return {name:'GOLD',icon:'🥇'};
if(count>=10) return {name:'SILVER',icon:'🥈'};
if(count>=5) return {name:'BRONZE',icon:'🥉'};
return {name:'BASIC',icon:'🌱'};
}
function isValidNumber(num){
if(!num) return false;
let s=String(num).replace(/[^0-9]/g,'');
if(s.startsWith('62')) s='0'+s.slice(2);
if(!s.startsWith('0')) return false;
if(s.length<10 || s.length>15) return false;
return true;
}
module.exports = { loadDB, saveDB, getTodayString, genID, genInvoiceID, esc, getRank, isValidNumber };
