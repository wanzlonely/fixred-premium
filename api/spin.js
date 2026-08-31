
const { loadDB, saveDB } = require('../lib/utils');
const { getTodayString } = require('../lib/utils');

module.exports = async (req, res) => {
  try {
    const db = await loadDB();
    const userId = req.query.user_id || req.body?.user_id;
    if(!userId) return res.status(400).json({ ok:false, message:'user_id required' });
    
    const k = String(userId);
    if(!db.users[k]) return res.status(404).json({ ok:false, message:'User tidak ditemukan, buka bot dulu /start' });
    
    const user = db.users[k];
    const today = getTodayString();
    
    // REAL check - no simulation
    if(user.lastSpin === today){
      return res.json({ ok:false, message:'Spin hari ini sudah dipakai! Kembali besok.', alreadySpun:true, lastSpin: user.lastSpin });
    }

    // REAL rewards with weighted random but REAL DB update
    const rewards = [
      { id:'quota1', label:'+1 Kuota Fix', desc:'Kuota harian +1', weight:40, apply: (u)=>{ u.dailyFix.count = Math.max(0, (u.dailyFix.count||0)-1); } },
      { id:'vip1', label:'VIP 1 Hari', desc:'Gratis VIP 1 hari', weight:10, apply: (u)=>{ u.premiumUntil = Math.max(Date.now(), u.premiumUntil||0) + 86400000; u.notifiedExp=false; } },
      { id:'ref2', label:'+2 Referral Poin', desc:'Poin referral +2', weight:25, apply: (u)=>{ u.referralCount = (u.referralCount||0)+2; } },
      { id:'quota3', label:'+3 Kuota Fix', desc:'Kuota harian +3', weight:15, apply: (u)=>{ u.dailyFix.count = Math.max(0, (u.dailyFix.count||0)-3); } },
      { id:'zonk', label:'Zonk', desc:'Coba lagi besok', weight:10, apply: ()=>{} }
    ];
    
    const totalWeight = rewards.reduce((a,b)=>a+b.weight,0);
    let r = Math.random()*totalWeight;
    let chosen = rewards[0];
    for(let rw of rewards){
      if(r < rw.weight){ chosen = rw; break; }
      r -= rw.weight;
    }
    
    // REAL apply to DB
    chosen.apply(user);
    user.lastSpin = today;
    await saveDB(db);
    
    return res.json({
      ok:true,
      message:`Selamat! Kamu dapat: ${chosen.label}`,
      reward: { id: chosen.id, label: chosen.label, desc: chosen.desc },
      user: {
        dailyRemaining: Math.max(0, 3 - (user.dailyFix.count||0)),
        referralCount: user.referralCount||0,
        isPremium: !!(user.premiumUntil && user.premiumUntil>Date.now()),
        lastSpin: today
      }
    });
  } catch(e){
    res.status(500).json({ ok:false, error: e.message });
  }
};
