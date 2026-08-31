
const { loadDB } = require('../lib/utils');
const { getRank, getTodayString } = require('../lib/utils');

function isPremium(u){ return u.premiumUntil && u.premiumUntil > Date.now(); }

module.exports = async (req, res) => {
  try {
    const db = await loadDB();
    const userId = req.query.user_id || req.query.userId;
    const premiumCount = Object.values(db.users).filter(u=>isPremium(u)).length;
    
    let userData = null;
    if(userId && db.users[String(userId)]){
      const u = db.users[String(userId)];
      const rank = getRank(u.referralCount||0);
      const today = getTodayString();
      const dailyUsed = (u.dailyFix && u.dailyFix.date===today) ? u.dailyFix.count : 0;
      const dailyRemaining = isPremium(u) ? 999 : Math.max(0, 3 - dailyUsed);
      const canSpin = u.lastSpin !== today;
      
      userData = {
        id: String(userId),
        first_name: u.first_name||'User',
        username: u.username||'',
        totalFix: u.totalFix||0,
        dailyFix: { used: dailyUsed, remaining: dailyRemaining, date: today },
        referralCount: u.referralCount||0,
        rank: rank,
        isPremium: isPremium(u),
        premiumUntil: u.premiumUntil||0,
        premiumLeft: isPremium(u) ? Math.ceil((u.premiumUntil - Date.now())/86400000) : 0,
        lastSpin: u.lastSpin||null,
        canSpin: canSpin,
        joinedAt: u.joinedAt||0
      };
    }

    res.json({
      ok: true,
      totalFix: db.stats.totalFix||0,
      totalSuccess: db.stats.totalSuccess||0,
      totalFailed: db.stats.totalFailed||0,
      revenue: db.stats.revenue||0,
      users: Object.keys(db.users).length,
      premium: premiumCount,
      user: userData,
      payments: Object.values(db.payments).slice(-10)
    });
  } catch(e){
    res.status(500).json({ ok:false, error: e.message });
  }
};
