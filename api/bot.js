const TelegramBot = require('node-telegram-bot-api');
const { loadDB, saveDB } = require('../lib/utils');
const { getTodayString, genID, genInvoiceID, esc, getRank, UI, rankLine, isValidNumber } = require('../lib/utils');
const { sendToTarget } = require('../lib/client');
const config = require('../config');

const rateLimitMap = new Map();
const supportRateMap = new Map();

function isOwner(id){
  return config.OWNER_IDS.map(String).includes(String(id));
}
function isSuspiciousId(id){
  const s = String(id);
  const n = Number(id);
  if(!n || n <= 0) return true;
  if(s.startsWith('-')) return true;
  if(s.startsWith('-100')) return true;
  return false;
}
function ensureDB(db){
  if(!db.users) db.users = {};
  if(!db.payments) db.payments = {};
  if(!db.codes) db.codes = {};
  if(!db.stats) db.stats = { totalFix:0, totalSuccess:0, totalFailed:0, revenue:0, revenueHistory:[], lastReset: Date.now() };
  if(!db.history) db.history = {};
  if(!db.pending) db.pending = {};
  if(!db.supportMap) db.supportMap = {};
  if(!db.securityLog) db.securityLog = [];
  if(db.stats.totalFix === undefined) db.stats.totalFix = 0;
  if(db.stats.totalSuccess === undefined) db.stats.totalSuccess = 0;
  if(db.stats.totalFailed === undefined) db.stats.totalFailed = 0;
  if(db.stats.revenue === undefined) db.stats.revenue = 0;
  if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
  if(!db.stats.lastReset) db.stats.lastReset = Date.now();
  if(!Array.isArray(db.securityLog)) db.securityLog = [];
}
function cleanDB(db){
  let removed = 0;
  for(let k of Object.keys(db.users)){
    if(isSuspiciousId(k)){
      delete db.users[k];
      removed++;
    }
  }
  for(let k of Object.keys(db.payments)){
    const p = db.payments[k];
    if(p && isSuspiciousId(p.userId)){
      delete db.payments[k];
      removed++;
    }
  }
  if(removed > 0){
    db.securityLog.push({ date: new Date().toISOString(), action: 'clean_suspicious', removed });
    if(db.securityLog.length > 100) db.securityLog = db.securityLog.slice(-100);
  }
}
function getUniqueUsers(usersObj){
  const map = new Map();
  for(let u of Object.values(usersObj)){
    if(isSuspiciousId(u.id)) continue;
    const name = (u.first_name || '').trim();
    if(!name) continue;
    const lower = name.toLowerCase();
    if(lower.includes('exploit') && (u.totalFix||0)===0 && (u.referralCount||0)===0) continue;
    if(lower.length < 2) continue;
    if(!map.has(lower)){
      map.set(lower, u);
    }else{
      const ex = map.get(lower);
      const exScore = (ex.totalFix||0) + (ex.referralCount||0)*10 + (ex.joinedAt||0)/1000000000;
      const curScore = (u.totalFix||0) + (u.referralCount||0)*10 + (u.joinedAt||0)/1000000000;
      if(curScore > exScore){
        map.set(lower, u);
      }
    }
  }
  return Array.from(map.values());
}
function checkRateLimit(userId){
  const now = Date.now();
  const last = rateLimitMap.get(String(userId)) || 0;
  if(now - last < 800){
    return false;
  }
  rateLimitMap.set(String(userId), now);
  return true;
}
function checkSupportRate(userId){
  const now = Date.now();
  const last = supportRateMap.get(String(userId)) || 0;
  if(now - last < 60000){
    return false;
  }
  supportRateMap.set(String(userId), now);
  return true;
}
function getUser(db, id){
  const k = String(id);
  if(isSuspiciousId(k)) return null;
  if(!db.users[k]){
    db.users[k] = {
      id: Number(id) || id,
      first_name: '',
      username: '',
      joinedAt: Date.now(),
      referralCount: 0,
      referrals: [],
      referredBy: null,
      totalFix: 0,
      dailyFix: { date: getTodayString(), count: 0 },
      premiumUntil: 0,
      lastSpin: null,
      notifiedExp: false,
      notifiedExp2: false,
      awaitingNumber: false,
      awaitingBroadcast: false,
      awaitingSupport: false,
      pendingDeposit: null,
      supportReplyTo: null,
      securityFlags: 0
    };
  }
  if(!db.users[k].dailyFix || db.users[k].dailyFix.date !== getTodayString()){
    db.users[k].dailyFix = { date: getTodayString(), count: 0 };
  }
  if(db.users[k].totalFix === undefined) db.users[k].totalFix = 0;
  if(db.users[k].referralCount === undefined) db.users[k].referralCount = 0;
  if(!Array.isArray(db.users[k].referrals)) db.users[k].referrals = [];
  return db.users[k];
}
function isPremium(user){
  if(!user) return false;
  return user.premiumUntil && user.premiumUntil > Date.now();
}
function getPremiumLeft(user){
  if(!isPremium(user)) return null;
  return Math.ceil((user.premiumUntil - Date.now()) / 86400000);
}
function canUseFix(db, user){
  if(!user) return { allowed:false, remaining:0, isPremium:false };
  if(isOwner(user.id) || isPremium(user)){
    return { allowed:true, remaining:999, isPremium:true };
  }
  if(user.dailyFix.count >= 3){
    return { allowed:false, remaining:0, isPremium:false };
  }
  return { allowed:true, remaining:3 - user.dailyFix.count, isPremium:false };
}
function incrementFixCount(db, user){
  if(!user.dailyFix || user.dailyFix.date !== getTodayString()){
    user.dailyFix = { date: getTodayString(), count: 0 };
  }
  user.dailyFix.count += 1;
  user.totalFix = (user.totalFix || 0) + 1;
  db.stats.totalFix = (db.stats.totalFix || 0) + 1;
  const k = String(user.id);
  if(!db.history[k]) db.history[k] = [];
  db.history[k].unshift({ date: new Date().toISOString(), count: 1 });
  if(db.history[k].length > 100) db.history[k] = db.history[k].slice(0,100);
}
async function checkJoin(bot, uid){
  if(isOwner(uid)) return { joined:true, notJoined:[] };
  let notJoined = [];
  for(let ch of config.FORCE_JOIN){
    try{
      const m = await bot.getChatMember(ch.id, uid);
      if(!['member','administrator','creator'].includes(m.status)) notJoined.push(ch);
    }catch(e){
      notJoined.push(ch);
    }
  }
  return { joined:notJoined.length===0, notJoined };
}
function getDashboardMenu(chatId, db, user){
  const rnk = getRank(user.referralCount || 0);
  const validUsers = getUniqueUsers(db.users);
  if(isOwner(chatId)){
    return {
      text: `WALZY STORE - OWNER PANEL\n[SECURED SUPER777]\n\nSistem Beroperasi Optimal\n\nTotal User Valid : ${validUsers.length}\nPremium Aktif    : ${Object.values(db.users).filter(u => !isSuspiciousId(u.id) && isPremium(u)).length}\nTotal Order      : ${db.stats.totalFix || 0}\nSuccess          : ${db.stats.totalSuccess || 0}\nRevenue          : Rp ${(db.stats.revenue || 0).toLocaleString()}\nLast Reset       : ${new Date(db.stats.lastReset||Date.now()).toLocaleDateString('id-ID')}\nSecurity Clean   : ${db.securityLog.length} logs\n\nHalaman Pembelian Tersedia di WebApp`,
      opts: {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'CONTROL PANEL WEBAPP', web_app: { url: `${process.env.PUBLIC_URL || ''}/webapp` } }],
            [{ text: 'DATABASE VALID', callback_data: 'menu_database' }, { text: 'KLASEMEN', callback_data: 'ref_leaderboard' }],
            [{ text: 'BROADCAST', callback_data: 'menu_broadcast' }, { text: 'STATISTIK REALTIME', callback_data: 'menu_stats' }],
            [{ text: 'PEMBELIAN', callback_data: 'menu_purchases' }, { text: 'RESET REVENUE', callback_data: 'reset_revenue' }]
          ]
        }
      }
    };
  }
  if(isPremium(user)){
    return {
      text: `WALZY STORE - VIP AREA\nSelamat datang, ${esc(user.first_name)}\n\nID Anda   : ${chatId}\nStatus    : VIP (${getPremiumLeft(user)} Hari)\nPangkat   : ${rnk.icon} ${rnk.name}\nReferral  : ${user.referralCount || 0} Pengguna\nTotal Order : ${user.totalFix || 0}\n\nGunakan navigasi untuk akses katalog`,
      opts: {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Katalog Produk', callback_data: 'menu_fix' }, { text: 'Statistik', callback_data: 'menu_stats' }],
            [{ text: 'Mini App Light', web_app: { url: `${process.env.PUBLIC_URL || ''}/webapp` } }, { text: 'Support', callback_data: 'user_contact_owner' }]
          ]
        }
      }
    };
  }
  return {
    text: `WALZY STORE - CENTRAL DASHBOARD\nHalo, ${esc(user.first_name)}\n\nID Anda   : ${chatId}\nStatus    : FREE (${canUseFix(db, user).remaining}/3 Limit)\nPangkat   : ${rnk.icon} ${rnk.name}\nReferral  : ${user.referralCount || 0} Pengguna\nTotal Order : ${user.totalFix || 0}\n\nKirim /redeem [kode] jika memiliki voucher`,
    opts: {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Katalog Produk', callback_data: 'menu_fix' }, { text: 'VIP Premium', callback_data: 'menu_premium' }],
          [{ text: 'Referral', callback_data: 'menu_referral' }, { text: 'Statistik', callback_data: 'menu_stats' }],
          [{ text: 'Mini App Light', web_app: { url: `${process.env.PUBLIC_URL || ''}/webapp` } }, { text: 'Support', callback_data: 'user_contact_owner' }]
        ]
      }
    }
  };
}
async function handleMessage(bot, db, msg){
  ensureDB(db);
  cleanDB(db);
  if(!msg.from) return;
  if(msg.from.is_bot) return;
  if(isSuspiciousId(msg.from.id)) return;
  if(msg.chat && msg.chat.type && msg.chat.type !== 'private'){
    if(isSuspiciousId(msg.chat.id)) return;
  }
  if(!checkRateLimit(msg.from.id)){
    return;
  }
  const chatId = msg.chat.id;
  if(isSuspiciousId(chatId)) return;
  const text = msg.text ? msg.text.trim() : '';
  const user = getUser(db, chatId);
  if(!user) return;
  user.first_name = msg.from.first_name || 'User';
  user.username = msg.from.username || '';

  if(msg.photo && db.users[String(chatId)] && db.users[String(chatId)].pendingDeposit){
    const inv = db.users[String(chatId)].pendingDeposit;
    const pay = db.payments[inv];
    if(pay && (pay.status === 'waiting_proof' || pay.status === 'waiting_payment')){
      const fileId = msg.photo[msg.photo.length - 1].file_id;
      pay.proofFileId = fileId;
      pay.status = 'waiting_approval';
      db.users[String(chatId)].pendingDeposit = null;
      await saveDB(db);
      await bot.sendMessage(chatId, `BUKTI DITERIMA\nBukti transfer untuk ${inv} berhasil diterima\n\nMenunggu konfirmasi admin max 1x24 jam`, { parse_mode:'HTML' });
      for(let oid of config.OWNER_IDS){
        try{
          await bot.sendPhoto(oid, fileId, {
            caption: `DEPOSIT BARU\nInvoice: ${inv}\nUser: ${chatId} @${msg.from.username || '-'}\nPaket: ${pay.days} Hari - Rp ${pay.amount.toLocaleString()}\nTujuan: ${config.DANA_NAME} ${config.DANA_NUMBER}\n\nHalaman pembelian tersedia di webapp owner`,
            parse_mode:'HTML',
            reply_markup: {
              inline_keyboard: [[{ text:'APPROVE', callback_data:`approve_${inv}` }, { text:'REJECT', callback_data:`reject_${inv}` }]]
            }
          });
        }catch(e){}
      }
      return;
    }
  }

  if(isOwner(chatId) && msg.reply_to_message && text){
    const targetUid = db.supportMap && db.supportMap[String(msg.reply_to_message.message_id)];
    if(targetUid){
      if(isSuspiciousId(targetUid)) return;
      try{
        await bot.sendMessage(targetUid, `BALASAN ADMIN\n${esc(text)}\n\nTerima kasih telah menghubungi support Walzy Store`, { parse_mode:'HTML' });
        await bot.sendMessage(chatId, `Balasan terkirim ke user ${targetUid} - Penanganan keluhan selesai`);
        db.securityLog.push({ date: new Date().toISOString(), action: 'support_reply', owner: chatId, target: targetUid });
      }catch(e){
        await bot.sendMessage(chatId, `Gagal kirim balasan: ${e.message}`);
      }
      return;
    }
  }

  if(!isOwner(chatId) && db.users[String(chatId)] && db.users[String(chatId)].awaitingSupport && text){
    if(!checkSupportRate(chatId)){
      return bot.sendMessage(chatId, `Mohon tunggu 1 menit sebelum mengirim keluhan baru - Sistem anti spam aktif`);
    }
    if(text.length > 500){
      return bot.sendMessage(chatId, `Keluhan terlalu panjang - Maks 500 karakter`);
    }
    db.users[String(chatId)].awaitingSupport = false;
    await saveDB(db);
    await bot.sendMessage(chatId, `TIKET TERKIRIM\nKeluhan Anda telah diteruskan ke admin Walzy Store\nID Tiket: ${genID()}\nMohon tunggu balasan - Tim support akan menangani dengan prioritas`, { parse_mode:'HTML' });
    if(!db.supportMap) db.supportMap = {};
    for(let oid of config.OWNER_IDS){
      try{
        const sent = await bot.sendMessage(oid, `TIKET SUPPORT BARU\nUser: ${chatId} @${msg.from.username || '-'}\nWaktu: ${new Date().toLocaleString('id-ID')}\n\nIsi:\n${esc(text)}\n\nBalas pesan ini untuk membalas user - Penanganan keamanan aktif`, { parse_mode:'HTML' });
        db.supportMap[String(sent.message_id)] = String(chatId);
      }catch(e){}
    }
    db.securityLog.push({ date: new Date().toISOString(), action: 'support_ticket', user: chatId, length: text.length });
    await saveDB(db);
    return;
  }

  if(!text) return;

  if(text.startsWith('/gen ')){
    if(!isOwner(chatId)) return;
    const parts = text.split(' ').filter(Boolean);
    if(parts.length < 3) return bot.sendMessage(chatId, `Format salah - Gunakan: /gen KODE HARI`);
    const code = parts[1].toUpperCase();
    const days = parseInt(parts[2]);
    if(!days || days <= 0) return bot.sendMessage(chatId, `Hari tidak valid`);
    db.codes[code] = days;
    await saveDB(db);
    return bot.sendMessage(chatId, `VOUCHER DIBUAT\nKode: ${code}\nDurasi: ${days} Hari`);
  }

  if(text.startsWith('/redeem ')){
    const parts = text.split(' ').filter(Boolean);
    if(parts.length < 2) return bot.sendMessage(chatId, `Format: /redeem KODE`);
    const code = parts[1].toUpperCase();
    if(db.codes[code]){
      const days = db.codes[code];
      user.premiumUntil = Math.max(Date.now(), user.premiumUntil || 0) + days * 86400000;
      user.notifiedExp = false;
      user.notifiedExp2 = false;
      delete db.codes[code];
      await saveDB(db);
      return bot.sendMessage(chatId, `REDEEM BERHASIL\nSelamat VIP ${days} Hari aktif di Walzy Store`);
    }else{
      return bot.sendMessage(chatId, `Kode tidak valid - Periksa kembali`);
    }
  }

  if(text.startsWith('/approve ')){
    if(!isOwner(chatId)) return;
    const inv = text.split(' ')[1].trim();
    const pay = db.payments[inv];
    if(!pay) return bot.sendMessage(chatId, `Invoice ${inv} tidak ditemukan`);
    if(pay.status === 'paid') return bot.sendMessage(chatId, `Invoice ${inv} sudah lunas`);
    pay.status = 'paid';
    const u = getUser(db, pay.userId);
    if(!u) return bot.sendMessage(chatId, `User tidak valid`);
    u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + pay.days * 86400000;
    u.notifiedExp = false;
    u.notifiedExp2 = false;
    u.pendingDeposit = null;
    db.stats.revenue = (db.stats.revenue || 0) + pay.amount;
    if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
    db.stats.revenueHistory.push({ date: new Date().toISOString(), amount: pay.amount, invoice: inv, userId: pay.userId });
    if(db.stats.revenueHistory.length > 200) db.stats.revenueHistory = db.stats.revenueHistory.slice(-200);
    await saveDB(db);
    await bot.sendMessage(chatId, `${inv} approved untuk ${pay.userId} - Notifikasi terkirim ke webapp user`);
    try{
      await bot.sendMessage(pay.userId, `PEMBAYARAN DISETUJUI\nDeposit ${inv} disetujui\nPaket: ${pay.days} Hari VIP\nNominal: Rp ${pay.amount.toLocaleString()}\nAktif sampai: ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}\n\nCek webapp untuk akses premium - Halaman pembelian owner terupdate`, { parse_mode:'HTML' });
    }catch{}
    return;
  }

  if(text.startsWith('/reject ')){
    if(!isOwner(chatId)) return;
    const inv = text.split(' ')[1].trim();
    const pay = db.payments[inv];
    if(!pay) return bot.sendMessage(chatId, `Invoice ${inv} tidak ditemukan`);
    pay.status = 'rejected';
    const u = getUser(db, pay.userId);
    if(u) u.pendingDeposit = null;
    await saveDB(db);
    await bot.sendMessage(chatId, `${inv} rejected - User akan dinotifikasi`);
    try{ await bot.sendMessage(pay.userId, `PEMBAYARAN DITOLAK\nDeposit ${inv} ditolak - Hubungi admin untuk detail`); }catch{}
    return;
  }

  if(text.startsWith('/paydone ')){
    if(!isOwner(chatId)) return;
    const inv = text.split(' ')[1].trim();
    const pay = db.payments[inv];
    if(!pay) return bot.sendMessage(chatId, `Invoice ${inv} tidak ditemukan`);
    if(pay.status === 'paid') return bot.sendMessage(chatId, `Sudah lunas`);
    pay.status = 'paid';
    const u = getUser(db, pay.userId);
    if(!u) return;
    u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + pay.days * 86400000;
    u.notifiedExp = false;
    u.notifiedExp2 = false;
    u.pendingDeposit = null;
    db.stats.revenue = (db.stats.revenue || 0) + pay.amount;
    if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
    db.stats.revenueHistory.push({ date: new Date().toISOString(), amount: pay.amount, invoice: inv, userId: pay.userId });
    await saveDB(db);
    await bot.sendMessage(chatId, `${inv} set LUNAS - Revenue terupdate`);
    try{
      await bot.sendMessage(pay.userId, `PEMBAYARAN BERHASIL\nPembayaran ${inv} berhasil - Premium aktif`);
    }catch{}
    return;
  }

  if(text.startsWith('/resetrevenue') || text.startsWith('/reset_revenue')){
    if(!isOwner(chatId)) return;
    const arg = text.split(' ')[1] || '';
    if(arg !== 'SUPER777'){
      return bot.sendMessage(chatId, `KONFIRMASI RESET\nGunakan: /resetrevenue SUPER777\n\nIni akan reset revenue ke 0 dari awal - Sistem canggih`);
    }
    const old = db.stats.revenue || 0;
    if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
    db.stats.revenueHistory.push({ date: new Date().toISOString(), amount: -old, invoice: 'RESET', userId: 'SYSTEM', note: 'Reset to 0 by owner' });
    db.stats.revenue = 0;
    db.stats.lastReset = Date.now();
    await saveDB(db);
    return bot.sendMessage(chatId, `RESET BERHASIL\nRevenue direset dari Rp ${old.toLocaleString()} ke Rp 0\nHistory tetap tercatat`);
  }

  if(text.startsWith('/clean_db')){
    if(!isOwner(chatId)) return;
    const before = Object.keys(db.users).length;
    cleanDB(db);
    const after = Object.keys(db.users).length;
    await saveDB(db);
    return bot.sendMessage(chatId, `CLEAN DB SELESAI\nSebelum: ${before} user\nSesudah: ${after} user\nDouble akun dan ID negatif dihapus`);
  }

  if(text.startsWith('/start')){
    const p = text.split(' ')[1] ? text.split(' ')[1].trim() : '';
    if(p && !isNaN(p) && !isSuspiciousId(p) && String(p) !== String(chatId) && !user.referredBy && db.users[p] && !isOwner(chatId)){
      if(!isSuspiciousId(p)){
        user.referredBy = String(p);
        db.users[p].referralCount = (db.users[p].referralCount || 0) + 1;
        if(!db.users[p].referrals.includes(String(chatId))) db.users[p].referrals.push(String(chatId));
      }
    }
    await saveDB(db);
    const jc = await checkJoin(bot, chatId);
    if(!jc.joined){
      const txt = `AKSES TERKUNCI\nBergabunglah ke saluran resmi Walzy Store untuk mengakses:\n\n${jc.notJoined.map(c => `${c.id}`).join('\n')}\n\nLakukan verifikasi setelah bergabung`;
      const btns = jc.notJoined.map(c => [{ text:`JOIN ${c.name}`, url:c.link }]);
      btns.push([{ text:'VERIFIKASI', callback_data:'verify_join' }]);
      return bot.sendMessage(chatId, txt, { reply_markup:{ inline_keyboard:btns } });
    }
    const menu = getDashboardMenu(chatId, db, user);
    return bot.sendMessage(chatId, menu.text, { disable_web_page_preview:true, ...menu.opts });
  }

  if(db.users[String(chatId)] && db.users[String(chatId)].awaitingNumber){
    if(text.startsWith('/')){
      db.users[String(chatId)].awaitingNumber = false;
      await saveDB(db);
      const menu = getDashboardMenu(chatId, db, user);
      return bot.sendMessage(chatId, menu.text, { ...menu.opts });
    }
    const rawLines = text.split('\n').map(x => x.trim()).filter(Boolean);
    let lines = rawLines.map(x => x.replace(/[^0-9+]/g, '')).filter(x => isValidNumber(x));
    if(lines.length === 0){
      return bot.sendMessage(chatId, `FORMAT SALAH\nHarap masukkan angka valid 8-15 digit\nContoh: 628123456789`, { reply_markup:{ inline_keyboard:[[{ text:'Batalkan', callback_data:'cancel_action' }]] } });
    }
    if(lines.length > 1 && !isPremium(user) && !isOwner(chatId)){
      return bot.sendMessage(chatId, `AKSES DITOLAK\nFitur Multi-Line eksklusif untuk VIP - Upgrade di katalog`, { reply_markup:{ inline_keyboard:[[{ text:'UPGRADE VIP', callback_data:'menu_premium' }, { text:'Batalkan', callback_data:'cancel_action' }]] } });
    }
    if(lines.length > 5) lines = lines.slice(0,5);
    const batchId = genID();
    const procText = lines.map(l => `${l}`).join('\n');
    incrementFixCount(db, user);
    const pendingId = `${Date.now()}_${chatId}`;
    if(!db.pending) db.pending = {};
    db.pending[pendingId] = { chatId, batchId, originalNumbers: lines, timestamp: Date.now(), handled:false };
    db.users[String(chatId)].awaitingNumber = false;
    await saveDB(db);
    await bot.sendMessage(chatId, `MEMPROSES DATA STORE\nMenyinkronkan ke jaringan Walzy\n\n${procText}\nBatch ID: ${batchId}\nTarget: ${config.TARGET_BOT}`);
    const joinedNumbers = lines.join('\n');
    const resTarget = await sendToTarget(joinedNumbers);
    if(!resTarget.ok){
      await bot.sendMessage(chatId, `ERROR SISTEM\nGagal kirim: ${resTarget.error}`);
    }
    return;
  }

  if(db.users[String(chatId)] && db.users[String(chatId)].awaitingBroadcast && isOwner(chatId)){
    if(text.startsWith('/')){
      db.users[String(chatId)].awaitingBroadcast = false;
      await saveDB(db);
      return;
    }
    const validUsers = getUniqueUsers(db.users);
    const uids = validUsers.map(u => String(u.id));
    let s = 0, f = 0;
    await bot.sendMessage(chatId, `MENGIRIM BROADCAST\nBroadcast ke ${uids.length} user valid (anti double)`);
    for(let uid of uids){
      if(isSuspiciousId(uid)) continue;
      try{ await bot.sendMessage(uid, `BROADCAST WALZY STORE\n\n${text}`); s++; }catch{ f++; }
      await new Promise(r => setTimeout(r, 80));
    }
    db.users[String(chatId)].awaitingBroadcast = false;
    await saveDB(db);
    return bot.sendMessage(chatId, `BROADCAST SELESAI\nSukses: ${s}\nGagal: ${f}\nUser valid: ${validUsers.length}`);
  }
}

async function handleCallback(bot, db, query){
  ensureDB(db);
  cleanDB(db);
  if(!query.from || query.from.is_bot) return;
  if(isSuspiciousId(query.from.id)) return;
  const chatId = query.message.chat.id;
  if(isSuspiciousId(chatId)) return;
  const msgId = query.message.message_id;
  const data = query.data;
  const user = getUser(db, chatId);
  if(!user) return;
  if(!checkRateLimit(chatId)){
    return bot.answerCallbackQuery(query.id, { text:'Terlalu cepat - Tunggu sebentar' });
  }

  if(data === 'verify_join'){
    const jc = await checkJoin(bot, chatId);
    if(jc.joined){
      const menu = getDashboardMenu(chatId, db, user);
      return bot.editMessageText(menu.text, { chat_id:chatId, message_id:msgId, ...menu.opts });
    }else{
      return bot.answerCallbackQuery(query.id, { text:'Belum join semua channel', show_alert:true });
    }
  }

  if(data === 'cancel_action' || data === 'menu_main'){
    db.users[String(chatId)].awaitingNumber = false;
    db.users[String(chatId)].awaitingBroadcast = false;
    db.users[String(chatId)].awaitingSupport = false;
    db.users[String(chatId)].pendingDeposit = null;
    await saveDB(db);
    const menu = getDashboardMenu(chatId, db, user);
    return bot.editMessageText(menu.text, { chat_id:chatId, message_id:msgId, ...menu.opts });
  }

  if(data === 'menu_fix'){
    const c = canUseFix(db, user);
    if(!c.allowed){
      return bot.editMessageText(`LIMIT HABIS\nLimit harian habis 3/3 - Upgrade VIP untuk unlimited di Walzy Store\n\nVIP: Unlimited 5 baris\nFREE: 3x per hari`, { chat_id:chatId, message_id:msgId, reply_markup:{ inline_keyboard:[[{ text:'UPGRADE VIP', callback_data:'menu_premium' }], [{ text:'Kembali', callback_data:'menu_main' }]] } });
    }
    db.users[String(chatId)].awaitingNumber = true;
    await saveDB(db);
    return bot.editMessageText(`KATALOG PRODUK WALZY STORE\nSilakan kirim nomor target untuk order\n\nStatus: ${c.isPremium ? 'VIP Unlimited' : c.remaining + ' kuota tersisa'}\nFormat: 628xxxxxxxxxx\n${c.isPremium ? 'Max 5 nomor per batch' : '1 nomor per batch FREE'}\n\nKetik nomor langsung pisah baris untuk multi - Fokus bot store`, { chat_id:chatId, message_id:msgId, reply_markup:{ inline_keyboard:[[{ text:'Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_premium'){
    return bot.editMessageText(`VIP PREMIUM PASS - WALZY STORE\nKeunggulan VIP:\n- Multi-Line 5 nomor per batch\n- Prioritas antrian\n- Success rate lebih tinggi\n- Unlimited order\n\nHarga Manual:\n1 Hari 2k\n5 Hari 5k Popular\n10 Hari 10k Best Value\n30 Hari 60k Sultan\n\nTransfer: ${config.DANA_NAME} ${config.DANA_NUMBER}\n\nTransfer manual upload bukti tunggu approve owner - Halaman pembelian tersedia di webapp`, { chat_id:chatId, message_id:msgId, reply_markup:{ inline_keyboard:[[{ text:'1 Hari - 2k', callback_data:'buy_1' }, { text:'5 Hari - 5k', callback_data:'buy_5' }], [{ text:'10 Hari - 10k', callback_data:'buy_10' }, { text:'30 Hari - 60k', callback_data:'buy_30' }], [{ text:'Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_referral'){
    const rnk = getRank(user.referralCount || 0);
    return bot.editMessageText(`REFERRAL PROGRAM - WALZY STORE\nTotal: ${user.referralCount || 0}\nRank: ${rnk.icon} ${rnk.name}\nLink: https://t.me/${config.BOT_USERNAME}?start=${chatId}\n\nSistem anti double akun aktif - Referral valid saja yang terhitung`, { chat_id:chatId, message_id:msgId, reply_markup:{ inline_keyboard:[[{ text:'Klasemen', callback_data:'ref_leaderboard' }], [{ text:'Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'ref_leaderboard'){
    const unique = getUniqueUsers(db.users);
    const sort = unique.sort((a,b) => (b.referralCount||0) - (a.referralCount||0)).slice(0,10);
    let t = `TOP 10 AFILIATOR - WALZY STORE\nSistem anti double - Valid user only\n\n`;
    sort.forEach((u,i)=>{
      const medal = i===0 ? '1' : i===1 ? '2' : i===2 ? '3' : `${i+1}`;
      t += `${rankLine(medal, u.first_name, u.referralCount)}\n`;
    });
    t += `\nTotal valid: ${unique.length} user`;
    return bot.editMessageText(t, { chat_id:chatId, message_id:msgId, reply_markup:{ inline_keyboard:[[{ text:'Kembali', callback_data:'menu_main' }]] } });
  }

  if(data.startsWith('buy_')){
    const days = parseInt(data.split('_')[1]);
    const amountMap = { 1:2000, 5:5000, 10:10000, 30:60000 };
    const amount = amountMap[days] || 2000;
    const inv = genInvoiceID();
    db.payments[inv] = { userId: chatId, days, amount, status:'waiting_payment', createdAt: Date.now(), proofFileId: null };
    await saveDB(db);
    return bot.editMessageText(`INVOICE MANUAL - WALZY STORE\nID: ${inv}\nPaket: ${days} Hari VIP\nTotal: Rp ${amount.toLocaleString()}\nTransfer ke: ${config.DANA_NAME}\nNo: ${config.DANA_NUMBER}\n\nSilakan transfer lalu klik Sudah Transfer dan kirim bukti foto - Halaman pembelian owner akan menampilkan invoice ini`, { chat_id:chatId, message_id:msgId, reply_markup:{ inline_keyboard:[[{ text:'Sudah Transfer', callback_data:`confirm_${inv}` }], [{ text:'Kembali', callback_data:'menu_premium' }]] } });
  }

  if(data.startsWith('confirm_')){
    const inv = data.split('confirm_')[1];
    const pay = db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id, { text:'Invoice tidak ditemukan' });
    if(isSuspiciousId(pay.userId)) return bot.answerCallbackQuery(query.id, { text:'User tidak valid' });
    pay.status = 'waiting_proof';
    db.users[String(chatId)].pendingDeposit = inv;
    await saveDB(db);
    return bot.editMessageText(`KONFIRMASI PEMBELIAN\nInvoice ${inv} - Silakan kirim foto bukti transfer sekarang kirim sebagai foto langsung bukan file - Sistem keamanan Walzy Store aktif`, { chat_id:chatId, message_id:msgId });
  }

  if(data.startsWith('approve_')){
    if(!isOwner(chatId)) return bot.answerCallbackQuery(query.id, { text:'Bukan owner' });
    const inv = data.split('approve_')[1];
    const pay = db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id, { text:'Invoice tidak ditemukan' });
    if(pay.status === 'paid') return bot.editMessageText(`${inv} sudah approved sebelumnya - Halaman pembelian terupdate`, { chat_id:chatId, message_id:msgId });
    if(isSuspiciousId(pay.userId)) return bot.editMessageText(`${inv} user tidak valid - Dibuang sistem keamanan`, { chat_id:chatId, message_id:msgId });
    pay.status = 'paid';
    const u = getUser(db, pay.userId);
    if(!u) return bot.editMessageText(`${inv} user tidak ditemukan`, { chat_id:chatId, message_id:msgId });
    u.premiumUntil = Math.max(Date.now(), u.premiumUntil || 0) + pay.days * 86400000;
    u.notifiedExp = false;
    u.notifiedExp2 = false;
    u.pendingDeposit = null;
    db.stats.revenue = (db.stats.revenue || 0) + pay.amount;
    if(!Array.isArray(db.stats.revenueHistory)) db.stats.revenueHistory = [];
    db.stats.revenueHistory.push({ date: new Date().toISOString(), amount: pay.amount, invoice: inv, userId: pay.userId });
    if(db.stats.revenueHistory.length > 200) db.stats.revenueHistory = db.stats.revenueHistory.slice(-200);
    await saveDB(db);
    await bot.editMessageText(`${inv} APPROVED untuk ${pay.userId} - ${pay.days} hari - Notifikasi terkirim ke user dan webapp akan sync realtime - Halaman pembelian owner terupdate`, { chat_id:chatId, message_id:msgId });
    try{
      await bot.sendMessage(pay.userId, `PEMBAYARAN DISETUJUI - WALZY STORE\nDeposit ${inv} disetujui\nVIP ${pay.days} hari aktif sampai ${new Date(u.premiumUntil).toLocaleDateString('id-ID')}\nNominal: Rp ${pay.amount.toLocaleString()}\n\nWebApp akan menampilkan VIP aktif otomatis - Cek Mini App Light`, { parse_mode:'HTML' });
    }catch{}
    return;
  }

  if(data.startsWith('reject_')){
    if(!isOwner(chatId)) return bot.answerCallbackQuery(query.id, { text:'Bukan owner' });
    const inv = data.split('reject_')[1];
    const pay = db.payments[inv];
    if(!pay) return bot.answerCallbackQuery(query.id, { text:'Invoice tidak ditemukan' });
    pay.status = 'rejected';
    const u = getUser(db, pay.userId);
    if(u) u.pendingDeposit = null;
    await saveDB(db);
    await bot.editMessageText(`${inv} REJECTED - User dinotifikasi - Halaman pembelian terupdate`, { chat_id:chatId, message_id:msgId });
    try{ await bot.sendMessage(pay.userId, `PEMBAYARAN DITOLAK\nDeposit ${inv} ditolak - Hubungi admin Walzy Store untuk detail`); }catch{}
    return;
  }

  if(data === 'menu_stats'){
    const validUsers = getUniqueUsers(db.users);
    return bot.editMessageText(`STATISTIK REALTIME - WALZY STORE\nSistem anti double akun aktif\n\nKamu: ${user.totalFix || 0}\nGlobal Valid: ${db.stats.totalFix || 0}\nSuccess: ${db.stats.totalSuccess || 0}\nFailed: ${db.stats.totalFailed || 0}\nUser Valid: ${validUsers.length}\nUser Raw: ${Object.keys(db.users).length}\n${isOwner(chatId) ? `Revenue: Rp ${(db.stats.revenue || 0).toLocaleString()}\nReset: ${new Date(db.stats.lastReset||Date.now()).toLocaleDateString('id-ID')}\nSecurity Logs: ${db.securityLog.length}` : ''}\n\nSemua data realtime bukan simulasi`, { chat_id:chatId, message_id:msgId, reply_markup:{ inline_keyboard:[[{ text:'Dashboard Light', web_app:{ url: `${process.env.PUBLIC_URL || ''}/webapp` } }], [{ text:'Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_database' && isOwner(chatId)){
    const unique = getUniqueUsers(db.users);
    let t = `10 USER VALID TERBARU - ANTI DOUBLE\nTotal valid: ${unique.length} dari ${Object.keys(db.users).length} raw\n\n`;
    unique.slice(-10).reverse().forEach(u=>{
      const icn = isPremium(u) ? 'VIP' : 'FREE';
      const nm = esc((u.first_name || 'User').substring(0,15));
      t += `${icn} ${u.id} | ${nm} | ${u.dailyFix?.count || 0}/3 | Order:${u.totalFix || 0}\n`;
    });
    t += `\nGlobal Fix: ${db.stats.totalFix || 0} | Revenue: ${db.stats.revenue || 0} | Security: ${db.securityLog.length} logs`;
    return bot.editMessageText(t, { chat_id:chatId, message_id:msgId, reply_markup:{ inline_keyboard:[[{ text:'Bersihkan DB', callback_data:'clean_db' }], [{ text:'Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_purchases' && isOwner(chatId)){
    const paid = Object.values(db.payments).filter(p => p.status === 'paid' && !isSuspiciousId(p.userId)).slice(-10).reverse();
    let t = `HALAMAN PEMBELIAN OWNER\n10 Pembelian Terbaru Valid\n\n`;
    if(paid.length === 0){
      t += `Belum ada pembelian valid`;
    }else{
      paid.forEach(p=>{
        t += `${p.invoice} | User ${p.userId} | ${p.days}H | Rp ${p.amount.toLocaleString()} | ${new Date(p.createdAt).toLocaleDateString('id-ID')}\n`;
      });
    }
    t += `\nRevenue: Rp ${(db.stats.revenue||0).toLocaleString()}\nTotal paid: ${Object.values(db.payments).filter(p=>p.status==='paid').length}`;
    return bot.editMessageText(t, { chat_id:chatId, message_id:msgId, reply_markup:{ inline_keyboard:[[{ text:'Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'clean_db' && isOwner(chatId)){
    const before = Object.keys(db.users).length;
    cleanDB(db);
    const after = Object.keys(db.users).length;
    const unique = getUniqueUsers(db.users);
    await saveDB(db);
    return bot.editMessageText(`CLEAN DB BERHASIL\nSebelum: ${before} raw\nSesudah: ${after} raw\nValid unik: ${unique.length}\nDouble akun dan ID negatif dihapus - Sistem keamanan canggih aktif`, { chat_id:chatId, message_id:msgId, reply_markup:{ inline_keyboard:[[{ text:'Kembali', callback_data:'menu_main' }]] } });
  }

  if(data === 'menu_broadcast' && isOwner(chatId)){
    db.users[String(chatId)].awaitingBroadcast = true;
    await saveDB(db);
    return bot.editMessageText(`MASS BROADCAST - WALZY STORE\nKirimkan teks untuk disebarkan ke seluruh database valid anti double\n\nKeamanan: hanya user valid yang menerima`, { chat_id:chatId, message_id:msgId, reply_markup:{ inline_keyboard:[[{ text:'Batalkan', callback_data:'cancel_action' }]] } });
  }

  if(data === 'user_contact_owner'){
    db.users[String(chatId)].awaitingSupport = true;
    await saveDB(db);
    return bot.editMessageText(`HUBUNGI ADMIN - WALZY STORE\nSilakan ketik keluhan atau pertanyaan Anda\nPesan akan diteruskan langsung ke admin dengan sistem penanganan keamanan dan prioritas\n\nMaks 500 karakter - Anti spam 1 menit`, { chat_id:chatId, message_id:msgId, reply_markup:{ inline_keyboard:[[{ text:'Batalkan', callback_data:'cancel_action' }]] } });
  }

  if(data === 'reset_revenue' && isOwner(chatId)){
    return bot.editMessageText(`RESET REVENUE - SISTEM CANGGIH\nYakin reset revenue ke 0 dari awal?\n\nKetik: /resetrevenue SUPER777\n\nHistory tetap tercatat - Last reset akan terupdate`, { chat_id:chatId, message_id:msgId, reply_markup:{ inline_keyboard:[[{ text:'Kembali', callback_data:'menu_main' }]] } });
  }
}

module.exports = async (req, res) => {
  const bot = new (require('node-telegram-bot-api'))(config.BOT_TOKEN);
  try{
    const db = await loadDB();
    ensureDB(db);
    cleanDB(db);
    if(req.method === 'POST'){
      const update = req.body;
      if(update.message) await handleMessage(bot, db, update.message);
      if(update.callback_query){
        await handleCallback(bot, db, update.callback_query);
        try{ await bot.answerCallbackQuery(update.callback_query.id); }catch{}
      }
      await saveDB(db);
    }
    res.status(200).json({ ok:true });
  }catch(e){
    console.error(e);
    res.status(200).json({ ok:false, error:e.message });
  }
};
