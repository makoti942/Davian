const express = require('express');
const { getDB, saveDB } = require('../db/schema');
const { authenticateToken } = require('../middleware');
const router = express.Router();

router.get('/', (req, res) => {
  const db = getDB();
  const packages = db.packages.filter(p => p.is_active).sort((a, b) => a.price - b.price);
  res.json(packages);
});

router.get('/all', authenticateToken, (req, res) => {
  const db = getDB();
  const packages = db.packages.sort((a, b) => (b.is_active ? 1 : 0) - (a.is_active ? 1 : 0) || a.price - b.price);
  res.json(packages);
});

router.post('/', authenticateToken, (req, res) => {
  const { name, price, duration_hours, mbps, is_active } = req.body;
  if (!name || !price || !duration_hours || !mbps) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const db = getDB();
  const pkg = {
    id: db.nextPackageId++,
    name,
    price: Number(price),
    duration_hours: Number(duration_hours),
    mbps: Number(mbps),
    is_active: is_active !== undefined ? !!is_active : true,
    created_at: new Date().toISOString(),
  };
  db.packages.push(pkg);
  saveDB(db);
  res.json({ success: true, id: pkg.id });
});

router.put('/:id', authenticateToken, (req, res) => {
  const { name, price, duration_hours, mbps, is_active } = req.body;
  const db = getDB();
  const pkg = db.packages.find(p => p.id === Number(req.params.id));
  if (!pkg) return res.status(404).json({ error: 'Not found' });
  if (name !== undefined) pkg.name = name;
  if (price !== undefined) pkg.price = Number(price);
  if (duration_hours !== undefined) pkg.duration_hours = Number(duration_hours);
  if (mbps !== undefined) pkg.mbps = Number(mbps);
  if (is_active !== undefined) pkg.is_active = !!is_active;
  saveDB(db);
  res.json({ success: true });
});

router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDB();
  db.packages = db.packages.filter(p => p.id !== Number(req.params.id));
  saveDB(db);
  res.json({ success: true });
});

module.exports = router;
