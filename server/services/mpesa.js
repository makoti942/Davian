const axios = require('axios');
const { getDB } = require('../db/schema');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.passkey = process.env.MPESA_PASSKEY;
    this.shortcode = process.env.MPESA_SHORTCODE || '174379';
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    this.baseUrl = 'https://sandbox.safaricom.co.ke';
    this.token = null;
    this.tokenExpiry = null;
  }

  async getToken() {
    if (this.token && this.tokenExpiry > Date.now()) return this.token;
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      const res = await axios.get(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: { Authorization: `Basic ${auth}` }
      });
      this.token = res.data.access_token;
      this.tokenExpiry = Date.now() + (res.data.expires_in - 60) * 1000;
      return this.token;
    } catch (err) {
      console.error('[MPESA] Token error:', err.message);
      throw err;
    }
  }

  generateTimestamp() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    return `${y}${m}${d}${h}${min}${s}`;
  }

  generatePassword() {
    const timestamp = this.generateTimestamp();
    const str = `${this.shortcode}${this.passkey}${timestamp}`;
    return Buffer.from(str).toString('base64');
  }

  // Initiate STK Push
  async stkPush(phone, amount, transactionRef, description = 'WiFi Package') {
    try {
      const token = await this.getToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword();

      // Format phone: 254XXXXXXXXX
      let formattedPhone = phone.replace(/[^0-9]/g, '');
      if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1);
      if (!formattedPhone.startsWith('254')) formattedPhone = '254' + formattedPhone;

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: this.shortcode,
        PhoneNumber: formattedPhone,
        CallBackURL: `${this.callbackUrl}?ref=${transactionRef}`,
        AccountReference: transactionRef,
        TransactionDesc: description
      };

      const res = await axios.post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('[MPESA] STK Push response:', res.data);
      return {
        success: res.data.ResponseCode === '0',
        merchantRequestId: res.data.MerchantRequestID,
        checkoutRequestId: res.data.CheckoutRequestID,
        responseCode: res.data.ResponseCode,
        responseDesc: res.data.ResponseDescription,
        raw: res.data
      };
    } catch (err) {
      console.error('[MPESA] STK Push error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Query STK push status
  async queryStatus(checkoutRequestId) {
    try {
      const token = await this.getToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword();

      const payload = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId
      };

      const res = await axios.post(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return {
        success: res.data.ResponseCode === '0',
        resultCode: res.data.ResultCode,
        resultDesc: res.data.ResultDesc,
        raw: res.data
      };
    } catch (err) {
      console.error('[MPESA] Query error:', err.message);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new MpesaService();
