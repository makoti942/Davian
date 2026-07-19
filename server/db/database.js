const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function getDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    seed();
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function saveDB(data) {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function seed() {
  const data = {
    packages: [
      { id: 1, name: '1 Hour', price: 10, duration_hours: 1, mbps: 2, is_active: true, created_at: new Date().toISOString() },
      { id: 2, name: '6 Hours', price: 30, duration_hours: 6, mbps: 4, is_active: true, created_at: new Date().toISOString() },
      { id: 3, name: '24 Hours', price: 50, duration_hours: 24, mbps: 8, is_active: true, created_at: new Date().toISOString() },
      { id: 4, name: 'Weekly', price: 200, duration_hours: 168, mbps: 16, is_active: true, created_at: new Date().toISOString() },
      { id: 5, name: 'Monthly', price: 500, duration_hours: 720, mbps: 32, is_active: true, created_at: new Date().toISOString() },
    ],
    transactions: [],
    admins: [{ id: 1, username: 'admin', password: bcrypt.hashSync('admin123', 10) }],
    settings: {
      hotspot_redirect_url: '',
      currency: 'KES',
      session_timeout_mins: '5',
    },
    active_sessions: [],
    nextPackageId: 6,
    nextTransactionId: 1,
  };
  saveDB(data);
}

module.exports = { getDB, saveDB };
