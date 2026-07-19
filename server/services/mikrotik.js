const axios = require('axios');
const { getDB, saveDB } = require('../db/schema');

class MikroTikService {
  constructor() {
    this.host = process.env.MIKROTIK_HOST || '192.168.88.1';
    this.user = process.env.MIKROTIK_USER || 'admin';
    this.pass = process.env.MIKROTIK_PASS || '';
    this.baseUrl = `http://${this.host}/rest`;
    this.auth = Buffer.from(`${this.user}:${this.pass}`).toString('base64');
    this.headers = { Authorization: `Basic ${this.auth}`, 'Content-Type': 'application/json' };
  }

  async _call(method, path, data = null) {
    try {
      const config = { method, url: `${this.baseUrl}${path}`, headers: this.headers };
      if (data) config.data = data;
      const res = await axios(config);
      return res.data;
    } catch (err) {
      console.error('[MIKROTIK] Error:', err.message);
      return null;
    }
  }

  // Add MAC to hotspot allow list (skip auth for this MAC)
  async allowMac(macAddress, comment = '') {
    return this._call('PUT', '/ip/hotspot/ip-binding', {
      mac_address: macAddress,
      type: 'bypassed',
      comment: comment
    });
  }

  // Remove MAC from allow list
  async removeMac(macAddress) {
    const list = await this._call('GET', `/ip/hotspot/ip-binding?mac-address=${macAddress}`);
    if (list && list.length > 0) {
      return this._call('DELETE', `/ip/hotspot/ip-binding/${list[0]['.id']}`);
    }
    return false;
  }

  // Add user to hotspot user list
  async addHotspotUser(username, password, profile = 'default', limitUptime = null) {
    const data = {
      name: username,
      password: password,
      profile: profile
    };
    if (limitUptime) data['limit-uptime'] = limitUptime;
    return this._call('PUT', '/ip/hotspot/user', data);
  }

  // Remove hotspot user
  async removeHotspotUser(username) {
    const users = await this._call('GET', `/ip/hotspot/user?name=${username}`);
    if (users && users.length > 0) {
      return this._call('DELETE', `/ip/hotspot/user/${users[0]['.id']}`);
    }
    return false;
  }

  // Limit bandwidth for a specific IP or MAC (via simple queue)
  async limitBandwidth(macAddress, mbps, comment = '') {
    const bitsPerSecond = Math.floor(mbps * 1000000);
    const data = {
      name: `wifi-${macAddress.replace(/:/g, '')}`,
      target: `/${macAddress}`,
      maxlimit: `${bitsPerSecond}/${bitsPerSecond}`,
      comment: comment
    };
    return this._call('PUT', '/queue/simple', data);
  }

  // Remove bandwidth limit
  async removeBandwidthLimit(macAddress) {
    const name = `wifi-${macAddress.replace(/:/g, '')}`;
    const queues = await this._call('GET', `/queue/simple?name=${name}`);
    if (queues && queues.length > 0) {
      return this._call('DELETE', `/queue/simple/${queues[0]['.id']}`);
    }
    return false;
  }

  // Disconnect a hotspot user (force logout)
  async disconnectUser(macAddress) {
    const sessions = await this._call('GET', `/ip/hotspot/active?mac-address=${macAddress}`);
    if (sessions && sessions.length > 0) {
      return this._call('DELETE', `/ip/hotspot/active/${sessions[0]['.id']}`);
    }
    return false;
  }

  // Check if user has an active hotspot session
  async isUserActive(macAddress) {
    const sessions = await this._call('GET', `/ip/hotspot/active?mac-address=${macAddress}`);
    return sessions && sessions.length > 0;
  }

  // Grant internet access: add hotspot user + bandwidth limit
  async grantAccess(macAddress, phone, packageData, expiryAt) {
    try {
      const username = `user_${macAddress.replace(/:/g, '')}`;
      const password = Math.random().toString(36).slice(2, 8);

      // Add hotspot user with time limit
      const duration = packageData.duration_hours;
      const limitUptime = `${duration}h`;
      await this.addHotspotUser(username, password, process.env.MIKROTIK_HOTSPOT_PROFILE || 'default', limitUptime);

      // Set bandwidth limit
      await this.limitBandwidth(macAddress, packageData.mbps, `${phone} - ${packageData.name}`);

      // Bypass hotspot auth for this MAC
      await this.allowMac(macAddress, `${phone} - ${packageData.name}`);

      // Save active session to DB
      const db = getDB();
      db.active_sessions = db.active_sessions.filter(s => s.mac_address !== macAddress);
      db.active_sessions.push({ mac_address: macAddress, phone, package_id: packageData.id, expires_at: expiryAt });
      saveDB(db);

      return { success: true, username, password };
    } catch (err) {
      console.error('[MIKROTIK] Grant access error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Revoke access for a MAC
  async revokeAccess(macAddress) {
    try {
      await this.removeHotspotUser(`user_${macAddress.replace(/:/g, '')}`);
      await this.removeBandwidthLimit(macAddress);
      await this.removeMac(macAddress);
      await this.disconnectUser(macAddress);

      const db = getDB();
      db.active_sessions = db.active_sessions.filter(s => s.mac_address !== macAddress);
      saveDB(db);
      return true;
    } catch (err) {
      console.error('[MIKROTIK] Revoke access error:', err.message);
      return false;
    }
  }
}

module.exports = new MikroTikService();
