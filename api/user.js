
const { loadDB } = require('../lib/utils');
const { getRank, getTodayString } = require('../lib/utils');

function isPremium(u){ return u.premiumUntil && u.premiumUntil > Date.now(); }

module.exports = async (req, res) => {
  try {
    const db = await loadDB();
    const userId = req.query.user_id;
    if(!userId) return res.status(400).json({ ok:false, message:'user_id required' });
    
    const k = String(userId);
    const u = db.users[k];
    if(!u) return res.status(404).json({ ok:false, message:'User tidak ditemukan. Silakan /start di bot dulu' });
    
    const rank = getRank(u.referralCount||0);
    const today = getTodayString();
    const dailyUsed = (u.dailyFix && u.dailyFix.date===today) ? u.dailyFix.count : 0;
    
    res.json({
      ok:true,
      user: {
        id: k,
        first_name: u.first_name,
        username: u.username,
        totalFix: u.totalFix||0,
        dailyFix: {
          date: today,
          used: dailyUsed,
          remaining: isPremium(u) ? 999 : Math.max(0, 3-dailyUsed),
          limit: isPremium(u) ? 'Unlimited' : '3/hari'
        },
        referralCount: u.referralCount||0,
        rank: rank,
        isPremium: isPremium(u),
        premiumUntil: u.premiumUntil||0,
        premiumLeft: isPremium(u) ? Math.ceil((u.premiumUntil-Date.now())/86400000) : 0,
        lastSpin: u.lastSpin,
        canSpin: u.lastSpin !== today,
        joinedAt: u.joinedAt,
        history: (db.history[k]||[]).slice(0,10)
      },
      global: {
        totalFix: db.stats.totalFix||0,
        totalSuccess: db.stats.totalSuccess||0,
        totalFailed: db.stats.totalFailed||0,
        totalUsers: Object.keys(db.users).length,
        premiumUsers: Object.values(db.users).filter(x=>isPremium(x)).length,
        revenue: db.stats.revenue||0
      }
    });
  } catch(e){
    res.status(500).json({ ok:false, error: e.message });
  }
};
