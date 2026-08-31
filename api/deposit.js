
const { loadDB, saveDB } = require('../lib/utils');

function genInvoiceID(){ return `INV${Date.now()}${Math.floor(1000+Math.random()*9000)}`; }

module.exports = async (req, res) => {
  try {
    const db = await loadDB();
    const userId = req.query.user_id || req.body?.user_id;
    const days = parseInt(req.query.days || req.body?.days || 0);
    
    if(!userId) return res.status(400).json({ ok:false, message:'user_id required' });
    if(![1,5,10,30].includes(days)) return res.status(400).json({ ok:false, message:'Paket tidak valid. Pilih 1,5,10,30 hari' });
    
    const k = String(userId);
    if(!db.users[k]) return res.status(404).json({ ok:false, message:'User tidak ditemukan' });
    
    const amountMap = {1:2000,5:5000,10:10000,30:60000};
    const amount = amountMap[days];
    const inv = genInvoiceID();
    
    // REAL invoice creation in DB
    db.payments[inv] = {
      invoice: inv,
      userId: k,
      days,
      amount,
      status: 'waiting_payment',
      createdAt: Date.now(),
      danaNumber: process.env.DANA_NUMBER || '0838xxxx',
      danaName: process.env.DANA_NAME || 'WALZY STORE'
    };
    
    await saveDB(db);
    
    return res.json({
      ok:true,
      message:'Invoice manual berhasil dibuat',
      invoice: {
        id: inv,
        days,
        amount,
        amountFormatted: `Rp ${amount.toLocaleString('id-ID')}`,
        status: 'waiting_payment',
        transferTo: {
          bank: process.env.DANA_NAME || 'WALZY STORE',
          number: process.env.DANA_NUMBER || '0838xxxx'
        },
        nextStep: 'Transfer sesuai nominal, lalu klik Sudah Transfer dan upload bukti foto di bot'
      }
    });
  } catch(e){
    res.status(500).json({ ok:false, error: e.message });
  }
};
