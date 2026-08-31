module.exports = async (req, res) => {
  const { loadDB, saveDB } = require('../lib/utils');
  const { getTodayString, isValidNumber } = require('../lib/utils');
  const { sendToTarget } = require('../lib/client');
  const config = require('../config');
  function isSuspiciousId(id){ const s=String(id); const n=Number(id); if(!n||n<=0) return true; if(s.startsWith('-')) return true; return false; }
  function getUser(db,id){
    const k=String(id);
    if(!db.users || !db.users[k]) return null;
    return db.users[k];
  }
  function isOwner(id){ return config.OWNER_IDS.map(String).includes(String(id)); }
  function isPremium(u){ return u.premiumUntil && u.premiumUntil>Date.now(); }
  try{
    const db = await loadDB();
    if(!db.stats) db.stats = { totalFix:0, totalSuccess:0, totalFailed:0 };
    if(!db.history) db.history = {};
    const userId = req.query.user_id || (req.body && req.body.user_id);
    const numbersRaw = (req.body && req.body.numbers) || '';
    if(!userId) return res.status(400).json({ok:false,message:'user_id required'});
    if(isSuspiciousId(userId)) return res.json({ok:false,message:'User tidak valid'});
    const user = getUser(db,userId);
    if(!user) return res.json({ok:false,message:'User tidak ditemukan'});
    if(!numbersRaw) return res.json({ok:false,message:'Nomor kosong'});
    const lines = numbersRaw.split('\n').map(x=>x.trim()).filter(Boolean).map(x=>x.replace(/[^0-9+]/g,'')).filter(x=>isValidNumber(x));
    if(lines.length===0) return res.json({ok:false,message:'Format nomor salah'});
    if(lines.length>1 && !isPremium(user) && !isOwner(userId)) return res.json({ok:false,message:'Multi-line khusus VIP'});
    if(lines.length>5) lines.splice(5);
    if(!user.dailyFix || user.dailyFix.date!==getTodayString()) user.dailyFix={date:getTodayString(),count:0};
    if(!isOwner(userId) && !isPremium(user) && user.dailyFix.count>=3) return res.json({ok:false,message:'Limit harian habis'});
    user.dailyFix.count+=1;
    user.totalFix=(user.totalFix||0)+1;
    db.stats.totalFix=(db.stats.totalFix||0)+1;
    if(!db.history[userId]) db.history[userId]=[];
    db.history[userId].unshift({date:new Date().toISOString(),count:1});
    if(db.history[userId].length>100) db.history[userId]=db.history[userId].slice(0,100);
    await saveDB(db);
    const joined = lines.join('\n');
    const resTarget = await sendToTarget(joined);
    if(!resTarget.ok) return res.json({ok:false,message:resTarget.error});
    return res.json({ok:true,message:'Fix Merah diproses - Scraping bot target',processed:lines.length});
  }catch(e){ return res.status(500).json({ok:false,message:e.message}); }
};
