module.exports = async (req, res) => {
  const { loadDB, saveDB } = require('../lib/utils');
  const config = require('../config');
  const OWNER_PASSWORD = 'SUPER777';
  function isOwner(id){ return config.OWNER_IDS.map(String).includes(String(id)); }
  function isSuspiciousId(id){ const s=String(id); const n=Number(id); if(!n||n<=0) return true; if(s.startsWith('-')) return true; return false; }
  try{
    const db = await loadDB();
    const body = req.body || {};
    const ownerId = String(body.owner_id || '');
    const password = body.password;
    const text = (body.text || '').trim();
    if(!ownerId || !isOwner(ownerId)) return res.status(403).json({ok:false,message:'Bukan owner'});
    if(password !== OWNER_PASSWORD) return res.status(403).json({ok:false,message:'Password salah'});
    if(!text) return res.json({ok:false,message:'Teks kosong'});
    if(!db.users) db.users = {};
    const unique = Object.values(db.users).filter(u=>!isSuspiciousId(u.id));
    let sent=0, failed=0;
    const bot = new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
    for(let u of unique){
      try{
        await bot.sendMessage(u.id, `📢 <b>Siaran Walzy Store</b>\n\n${text}\n\n🚀 walzy`, {parse_mode:'HTML'});
        sent++;
      }catch{ failed++; }
      await new Promise(r=>setTimeout(r,80));
    }
    return res.json({ok:true,message:`Siaran terkirim ke ${sent} pengguna`,sent,failed});
  }catch(e){ return res.status(500).json({ok:false,message:e.message}); }
};
