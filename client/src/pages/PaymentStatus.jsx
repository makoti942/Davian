import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function PaymentStatus() {
  const { transactionId } = useParams();
  const [tx, setTx] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await axios.get(`/api/mpesa/status/${transactionId}`);
        setTx(res.data);
        if (res.data.status === 'completed' || res.data.status === 'failed') {
          clearInterval(poll);
        }
      } catch { setError('Could not load status'); clearInterval(poll); }
    }, 2000);

    return () => clearInterval(poll);
  }, [transactionId]);

  const statusColors = { pending: '#f59e0b', completed: '#10b981', failed: '#ef4444', expired: '#888' };
  const statusIcons = { pending: '⏳', completed: '✅', failed: '❌', expired: '⌛' };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={{ fontSize: '3rem' }}>{tx ? statusIcons[tx.status] || '⏳' : '⏳'}</span>
          <h2 style={styles.title}>Payment {tx ? tx.status : 'Processing'}</h2>
        </div>

        {tx && (
          <div style={styles.details}>
            <div style={styles.row}><span>Package</span><span>{tx.package_name}</span></div>
            <div style={styles.row}><span>Amount</span><span>KES {tx.amount}</span></div>
            <div style={styles.row}><span>Phone</span><span>{tx.phone}</span></div>
            <div style={styles.row}><span>Status</span><span style={{ color: statusColors[tx.status] || '#fff' }}>{tx.status}</span></div>
            {tx.mpesa_code && tx.status === 'completed' && <div style={styles.row}><span>M-Pesa Code</span><span>{tx.mpesa_code}</span></div>}
            {tx.expiry_at && <div style={styles.row}><span>Expires</span><span>{new Date(tx.expiry_at).toLocaleString()}</span></div>}
          </div>
        )}

        {tx?.status === 'completed' && (
          <div style={styles.successMsg}>
            Internet access granted! You can now browse.
          </div>
        )}

        {tx?.status === 'failed' && (
          <Link to="/" style={styles.retry}>← Try Again</Link>
        )}

        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a2a1a 100%)', padding: '1rem' },
  card: { background: '#111', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 400, border: '1px solid #222', textAlign: 'center' },
  header: { marginBottom: '1.5rem' },
  title: { color: '#fff', fontSize: '1.2rem', marginTop: '0.5rem' },
  details: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' },
  row: { display: 'flex', justifyContent: 'space-between', color: '#ccc', fontSize: '0.9rem', padding: '0.4rem 0', borderBottom: '1px solid #222' },
  successMsg: { background: '#10b98122', color: '#10b981', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem' },
  error: { color: '#ef4444', fontSize: '0.85rem', marginTop: '1rem' },
  retry: { display: 'inline-block', color: '#10b981', textDecoration: 'none', fontSize: '0.9rem', marginTop: '1rem' },
};
