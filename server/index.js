require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { getDB, saveDB } = require('./db/schema');
const { startScheduler } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize DB
getDB();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/packages', require('./routes/packages'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/mpesa', require('./routes/mpesa'));

// Settings endpoint
app.get('/api/settings', (req, res) => {
  const db = getDB();
  res.json(db.settings);
});

app.put('/api/settings', require('./middleware').authenticateToken, (req, res) => {
  const db = getDB();
  Object.assign(db.settings, req.body);
  saveDB(db);
  res.json({ success: true });
});

// Serve static frontend in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(clientDist, 'index.html'));
});

// Start scheduler
startScheduler();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`WiFi Billing System running on port ${PORT}`);
});
