module.exports = async (req, res) => {
  const { loadDB, saveDB } = require('../lib/utils');
  const config = require('../config');
  const OWNER_PASSWORD = 'SUPER777';
  function isOwner(id){ return config.OWNER_IDS.map(String).includes(String(id)); }
  try{
    const db = await loadDB();
    if(!db.codes) db.codes = {};
    const body = req.body || {};
    const ownerId = String(body.owner_id || '');
    const password = body.password;
    const code = (body.code || '').toUpperCase().trim();
    if(!ownerId || !isOwner(ownerId)) return res.status(403).json({ok:false,message:'Bukan owner'});
    if(password !== OWNER_PASSWORD) return res.status(403).json({ok:false,message:'Password salah'});
    if(!code) return res.json({ok:false,message:'Kode kosong'});
    if(!db.codes[code]) return res.json({ok:false,message:'Kode tidak ditemukan'});
    delete db.codes[code];
    await saveDB(db);
    return res.json({ok:true,message:`Voucher ${code} dihapus`});
  }catch(e){ return res.status(500).json({ok:false,message:e.message}); }
};
