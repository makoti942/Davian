const express = require('express');
const { getDB, saveDB } = require('../db/schema');
const mpesaService = require('../services/mpesa');
const mikrotik = require('../services/mikrotik');
const router = express.Router();

router.post('/stkpush', async (req, res) => {
  const { phone, package_id, mac_address, ip_address } = req.body;
  if (!phone || !package_id || !mac_address) {
    return res.status(400).json({ error: 'Missing required fields: phone, package_id, mac_address' });
  }

  const db = getDB();
  const pkg = db.packages.find(p => p.id === Number(package_id) && p.is_active);
  if (!pkg) return res.status(400).json({ error: 'Invalid or inactive package' });

  const ref = `WIFI${Date.now()}`;
  const tx = {
    id: db.nextTransactionId++,
    phone,
    package_id: pkg.id,
    amount: pkg.price,
    mpesa_code: null,
    status: 'pending',
    mac_address,
    ip_address: ip_address || null,
    expiry_at: null,
    created_at: new Date().toISOString(),
  };
  db.transactions.push(tx);
  saveDB(db);

  const mpesaResult = await mpesaService.stkPush(phone, pkg.price, ref, `${pkg.name} - WiFi`);

  if (mpesaResult.success) {
    tx.mpesa_code = mpesaResult.checkoutRequestId;
    saveDB(db);
    res.json({
      success: true,
      transaction_id: tx.id,
      checkout_request_id: mpesaResult.checkoutRequestId,
      merchant_request_id: mpesaResult.merchantRequestId,
    });
  } else {
    tx.status = 'failed';
    saveDB(db);
    res.json({ success: false, error: mpesaResult.responseDesc || 'STK push failed', transaction_id: tx.id });
  }
});

router.post('/callback', async (req, res) => {
  try {
    const data = req.body;
    console.log('[MPESA CALLBACK]', JSON.stringify(data).slice(0, 500));

    const stkCallback = data.Body?.stkCallback;
    if (!stkCallback) return res.status(200).json({ ResultCode: 1, ResultDesc: 'Invalid callback' });

    const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = stkCallback;

    const db = getDB();
    const tx = db.transactions.find(t => t.mpesa_code === CheckoutRequestID);
    if (!tx) {
      console.log('[MPESA CALLBACK] Unknown transaction:', CheckoutRequestID);
      return res.status(200).json({ ResultCode: 1, ResultDesc: 'Transaction not found' });
    }

    if (ResultCode === 0) {
      let mpesaReceipt = '';
      if (CallbackMetadata?.Item) {
        for (const item of CallbackMetadata.Item) {
          if (item.Name === 'MpesaReceiptNumber') mpesaReceipt = item.Value;
        }
      }

      const pkg = db.packages.find(p => p.id === tx.package_id);
      const expiryAt = new Date(Date.now() + pkg.duration_hours * 60 * 60 * 1000).toISOString();

      tx.status = 'completed';
      tx.mpesa_code = mpesaReceipt || CheckoutRequestID;
      tx.expiry_at = expiryAt;
      saveDB(db);

      await mikrotik.grantAccess(tx.mac_address, tx.phone, pkg, expiryAt);
      console.log(`[MPESA] Payment confirmed: ${tx.phone} - ${pkg.name} - ${mpesaReceipt}`);
    } else {
      tx.status = 'failed';
      saveDB(db);
      console.log(`[MPESA] Payment failed: ${ResultDesc}`);
    }

    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (err) {
    console.error('[MPESA CALLBACK] Error:', err.message);
    res.status(200).json({ ResultCode: 1, ResultDesc: 'Server error' });
  }
});

router.get('/status/:transactionId', (req, res) => {
  const db = getDB();
  const tx = db.transactions.find(t => t.id === Number(req.params.transactionId));
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  const pkg = db.packages.find(p => p.id === tx.package_id);
  res.json({ ...tx, package_name: pkg ? pkg.name : 'Unknown' });
});

module.exports = router;
