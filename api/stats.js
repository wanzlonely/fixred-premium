module.exports = async (req, res) => {
  const { loadDB } = require('../lib/utils');
  const config = require('../config');
  function isOwner(id){ return config.OWNER_IDS.map(String).includes(String(id)); }
  function isSuspiciousId(id){ const s=String(id); const n=Number(id); if(!n||n<=0) return true; if(s.startsWith('-')) return true; return false; }
  function getUniqueUsers(usersObj){
    const map=new Map();
    for(let u of Object.values(usersObj)){
      if(isSuspiciousId(u.id)) continue;
      const name=(u.first_name||'').trim();
      if(!name) continue;
      const lower=name.toLowerCase();
      if(lower.includes('exploit') && (u.totalFix||0)===0 && (u.referralCount||0)===0) continue;
      if(!map.has(lower)) map.set(lower,u);
      else{
        const ex=map.get(lower);
        if((u.totalFix||0)+(u.referralCount||0) > (ex.totalFix||0)+(ex.referralCount||0)) map.set(lower,u);
      }
    }
    return Array.from(map.values());
  }
  function isPremium(u){ return u.premiumUntil && u.premiumUntil>Date.now(); }
  try{
    const db = await loadDB();
    if(!db.users) db.users={};
    if(!db.payments) db.payments={};
    if(!db.codes) db.codes={};
    if(!db.stats) db.stats={ totalFix:0, totalSuccess:0, totalFailed:0, revenue:0 };
    const userId = req.query.user_id || (req.body && req.body.user_id);
    if(!userId) return res.status(400).json({ok:false,message:'user_id required'});
    const isOwnerUser = isOwner(userId);
    const unique = getUniqueUsers(db.users);
    const validCount = unique.length;
    const premiumCount = unique.filter(u=>isPremium(u)).length;
    const allPayments = Object.values(db.payments||{});
    const pending = allPayments.filter(p=>p.status==='waiting_approval' && !isSuspiciousId(p.userId));
    const paid = allPayments.filter(p=>p.status==='paid' && !isSuspiciousId(p.userId));
    const todayOrders = allPayments.filter(p=>{
      if(isSuspiciousId(p.userId)) return false;
      const d=new Date(p.createdAt);
      const now=new Date();
      return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
    }).length;
    const codes = Object.values(db.codes||{}).map(c=>{
      if(typeof c==='object' && c.code) return c;
      if(typeof c==='number') return {code:'LEGACY',days:c,quota:0,used:0};
      return {code:c,days:0,quota:0,used:0};
    });
    // Ensure codes have code field for legacy number map
    const codesList = [];
    for(let k of Object.keys(db.codes)){
      const v = db.codes[k];
      if(typeof v==='object' && v.code) codesList.push(v);
      else if(typeof v==='number') codesList.push({code:k,days:v,quota:0,used:0,createdAt:Date.now(),type:'legacy'});
      else if(typeof v==='object') codesList.push({code:k,...v});
    }
    const response = {
      ok:true,
      isOwner:isOwnerUser,
      users:Object.keys(db.users).length,
      usersValid:validCount,
      premium:premiumCount,
      totalFix:db.stats.totalFix||0,
      totalSuccess:db.stats.totalSuccess||0,
      totalFailed:db.stats.totalFailed||0,
      todayOrders,
      paidToday:paid.filter(p=>{
        const d=new Date(p.createdAt);
        const now=new Date();
        return d.getDate()===now.getDate() && d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
      }).length,
      pendingPayments:pending,
      paidPayments:isOwnerUser ? paid.slice(-20).reverse() : [],
      recentUsers:isOwnerUser ? unique.slice(-20).reverse() : [],
      codes:isOwnerUser ? codesList.slice(-20) : [],
      revenue:isOwnerUser ? db.stats.revenue||0 : undefined,
      timestamp:Date.now()
    };
    return res.json(response);
  }catch(e){ return res.status(500).json({ok:false,message:e.message}); }
};
