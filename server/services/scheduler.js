const schedule = require('node-schedule');
const { getDB, saveDB } = require('../db/schema');
const mikrotik = require('./mikrotik');

function startScheduler() {
  // Check for expired sessions every minute
  schedule.scheduleJob('* * * * *', async () => {
    try {
      const db = getDB();
      const now = new Date().toISOString();
      const expired = db.active_sessions.filter(s => s.expires_at <= now);

      for (const session of expired) {
        console.log(`[SCHEDULER] Expiring session for ${session.mac_address}`);
        await mikrotik.revokeAccess(session.mac_address);

        // Mark related transaction as expired
        const tx = db.transactions.filter(t => t.phone === session.phone && t.status === 'completed').sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        if (tx) tx.status = 'expired';
      }

      // Check for pending transactions older than 10 minutes (timeout)
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      for (const tx of db.transactions) {
        if (tx.status === 'pending' && tx.created_at < tenMinAgo) tx.status = 'failed';
      }
      saveDB(db);
    } catch (err) {
      console.error('[SCHEDULER] Error:', err.message);
    }
  });

  console.log('[SCHEDULER] Started - checking expired sessions every minute');
}

module.exports = { startScheduler };
