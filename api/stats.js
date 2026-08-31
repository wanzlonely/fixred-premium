const { loadDB } = require('../lib/utils');
const { getRank, getTodayString } = require('../lib/utils');
const config = require('../config');

function isPremium(u){ return u.premiumUntil && u.premiumUntil > Date.now(); }
function isOwner(id){ return config.OWNER_IDS.map(String).includes(String(id)); }

module.exports = async (req, res) => {
  try {
    const db = await loadDB();
    const userId = req.query.user_id || req.query.userId;
    const premiumCount = Object.values(db.users).filter(u=>isPremium(u)).length;
    const ownerView = userId && isOwner(userId);
    
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

    const responseBody = {
      ok: true,
      isOwner: !!ownerView,
      totalFix: db.stats.totalFix||0,
      totalSuccess: db.stats.totalSuccess||0,
      totalFailed: db.stats.totalFailed||0,
      revenue: db.stats.revenue||0,
      users: Object.keys(db.users).length,
      premium: premiumCount,
      user: userData,
      payments: Object.values(db.payments).slice(-10)
    };

    if (ownerView) {
      responseBody.pendingPayments = Object.entries(db.payments)
        .filter(([, p]) => p.status !== 'paid' && p.status !== 'rejected')
        .map(([inv, p]) => ({ invoice: inv, ...p }))
        .sort((a, b) => (b.createdAt||0) - (a.createdAt||0))
        .slice(0, 30);
      responseBody.recentUsers = Object.values(db.users)
        .slice(-20).reverse()
        .map(u => ({ id: u.id, first_name: u.first_name, username: u.username, isPremium: isPremium(u), totalFix: u.totalFix||0, dailyUsed: u.dailyFix?.count||0 }));
    }

    res.json(responseBody);
  } catch(e){
    res.status(500).json({ ok:false, error: e.message });
  }
};
