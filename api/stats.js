module.exports = async (req, res) => {
  const { loadDB } = require('../lib/utils');
  const config = require('../config');
  function isOwner(id){
    return config.OWNER_IDS.map(String).includes(String(id));
  }
  function isSuspiciousId(id){
    const s = String(id);
    const n = Number(id);
    if(!n || n <= 0) return true;
    if(s.startsWith('-')) return true;
    return false;
  }
  function getUniqueUsers(usersObj){
    const map = new Map();
    for(let u of Object.values(usersObj)){
      if(isSuspiciousId(u.id)) continue;
      const name = (u.first_name || '').trim();
      if(!name) continue;
      const lower = name.toLowerCase();
      if(lower.includes('exploit') && (u.totalFix||0)===0 && (u.referralCount||0)===0) continue;
      if(!map.has(lower)){
        map.set(lower, u);
      }else{
        const ex = map.get(lower);
        const exScore = (ex.totalFix||0) + (ex.referralCount||0)*10;
        const curScore = (u.totalFix||0) + (u.referralCount||0)*10;
        if(curScore > exScore) map.set(lower, u);
      }
    }
    return Array.from(map.values());
  }
  function isPremium(user){
    return user.premiumUntil && user.premiumUntil > Date.now();
  }
  try{
    const db = await loadDB();
    if(!db.users) db.users = {};
    if(!db.payments) db.payments = {};
    if(!db.stats) db.stats = { totalFix:0, totalSuccess:0, totalFailed:0, revenue:0, revenueHistory:[], lastReset: Date.now() };
    const userId = req.query.user_id || (req.body && req.body.user_id);
    if(!userId){
      return res.status(400).json({ ok:false, message:'user_id required' });
    }
    const isOwnerUser = isOwner(userId);
    const unique = getUniqueUsers(db.users);
    const validCount = unique.length;
    const premiumCount = unique.filter(u => isPremium(u)).length;
    const allPayments = Object.values(db.payments || {});
    const pending = allPayments.filter(p => p.status === 'waiting_approval' && !isSuspiciousId(p.userId));
    const paid = allPayments.filter(p => p.status === 'paid' && !isSuspiciousId(p.userId));
    const recentRaw = Object.values(db.users).slice(-20).reverse();
    const recentFiltered = getUniqueUsers({ ...Object.fromEntries(recentRaw.map(u=>[u.id,u])) }).slice(0,10);
    const response = {
      ok:true,
      isOwner: isOwnerUser,
      users: Object.keys(db.users).length,
      usersValid: validCount,
      premium: premiumCount,
      totalFix: db.stats.totalFix || 0,
      totalSuccess: db.stats.totalSuccess || 0,
      totalFailed: db.stats.totalFailed || 0,
      revenue: isOwnerUser ? (db.stats.revenue || 0) : undefined,
      pendingPayments: pending,
      paidPayments: isOwnerUser ? paid.slice(-20).reverse() : [],
      recentUsers: isOwnerUser ? recentFiltered : [],
      revenueHistory: isOwnerUser ? (db.stats.revenueHistory || []).slice(-20) : [],
      lastReset: db.stats.lastReset || Date.now(),
      securityLogs: isOwnerUser ? (db.securityLog || []).slice(-10) : [],
      timestamp: Date.now()
    };
    return res.json(response);
  }catch(e){
    return res.status(500).json({ ok:false, message:e.message });
  }
};
