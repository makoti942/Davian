const express = require('express');
const bcrypt = require('bcryptjs');
const { getDB, saveDB } = require('../db/schema');
const { generateToken, authenticateToken } = require('../middleware');
const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });

  const db = getDB();
  const admin = db.admins.find(a => a.username === username);
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, admin.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = generateToken(admin.username);
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 });
  res.json({ success: true, token });
});

// GET /api/auth/check
router.get('/check', authenticateToken, (req, res) => {
  res.json({ authenticated: true, username: req.admin.username });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const db = getDB();
  const admin = db.admins.find(a => a.username === req.admin.username);
  if (!bcrypt.compareSync(currentPassword, admin.password)) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }
  const hash = bcrypt.hashSync(newPassword, 10);
  admin.password = hash;
  saveDB(db);
  res.json({ success: true });
});

module.exports = router;
