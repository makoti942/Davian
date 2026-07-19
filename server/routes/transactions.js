const express = require('express');
const { getDB, saveDB } = require('../db/schema');
const { authenticateToken } = require('../middleware');
const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = getDB();
  let txs = [...db.transactions].reverse();
  const status = req.query.status;
  if (status) txs = txs.filter(t => t.status === status);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const offset = (page - 1) * limit;
  const total = txs.length;
  const transactions = txs.slice(offset, offset + limit);

  // Attach package name
  const result = transactions.map(t => {
    const pkg = db.packages.find(p => p.id === t.package_id);
    return { ...t, package_name: pkg ? pkg.name : 'Unknown' };
  });

  res.json({ transactions: result, total, page, limit });
});

router.get('/recent', (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.status(400).json({ error: 'Phone required' });
  const db = getDB();
  const txs = db.transactions.filter(t => t.phone === phone).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const tx = txs[0] || null;
  if (tx) {
    const pkg = db.packages.find(p => p.id === tx.package_id);
    tx.package_name = pkg ? pkg.name : 'Unknown';
  }
  res.json(tx);
});

router.get('/stats', authenticateToken, (req, res) => {
  const db = getDB();
  const txs = db.transactions;
  const completed = txs.filter(t => t.status === 'completed');
  const today = new Date().toISOString().slice(0, 10);
  const stats = {
    total_transactions: txs.length,
    total_revenue: completed.reduce((sum, t) => sum + t.amount, 0),
    completed: completed.length,
    pending: txs.filter(t => t.status === 'pending').length,
    failed: txs.filter(t => t.status === 'failed').length,
    active_sessions: db.active_sessions.length,
    today_revenue: completed.filter(t => t.created_at && t.created_at.startsWith(today)).reduce((sum, t) => sum + t.amount, 0),
  };
  res.json(stats);
});

module.exports = router;
