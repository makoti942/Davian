import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key) || '';
}

export default function Portal() {
  const [packages, setPackages] = useState([]);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [phone, setPhone] = useState('');
  const [mac, setMac] = useState('');
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/packages').then(res => setPackages(res.data)).catch(console.error);

    // Get MAC/IP from URL (MikroTik passes these as query params)
    setMac(getQueryParam('mac') || getQueryParam('mac-address') || getQueryParam('client_mac') || '');
    setIp(getQueryParam('ip') || getQueryParam('client_ip') || '');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPkg) return setError('Please select a package');
    if (!phone || phone.length < 10) return setError('Enter a valid phone number');

    setLoading(true);
    setError('');

    try {
      const res = await axios.post('/api/mpesa/stkpush', {
        phone,
        package_id: selectedPkg,
        mac_address: mac || 'UNKNOWN',
        ip_address: ip || null,
      });

      if (res.data.success) {
        setSuccess(res.data);
        navigate(`/status/${res.data.transaction_id}`);
      } else {
        setError(res.data.error || 'Payment failed to initiate');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.wifiIcon}>📶</span>
          <h1 style={styles.title}>Davian WiFi</h1>
          <p style={styles.sub}>Select a package to access the internet</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.packages}>
          {packages.map(pkg => (
            <div
              key={pkg.id}
              onClick={() => { setSelectedPkg(pkg.id); setError(''); }}
              style={{
                ...styles.package,
                borderColor: selectedPkg === pkg.id ? '#10b981' : '#333',
                background: selectedPkg === pkg.id ? '#10b98115' : '#1a1a1a',
              }}
            >
              <div style={styles.pkgName}>{pkg.name}</div>
              <div style={styles.pkgPrice}>KES {pkg.price}</div>
              <div style={styles.pkgMeta}>
                <span>⏱ {pkg.duration_hours}h</span>
                <span>⚡ {pkg.mbps} Mbps</span>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="tel"
            placeholder="Phone number (e.g. 0712345678)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={styles.input}
            disabled={loading}
          />
          {mac && <div style={styles.mac}>MAC: {mac}</div>}
          <button type="submit" disabled={loading || !selectedPkg} style={{ ...styles.btn, opacity: loading || !selectedPkg ? 0.6 : 1 }}>
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>

        <div style={styles.footer}>Powered by Davian WiFi Billing</div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0a0a 0%, #1a2a1a 100%)', padding: '1rem' },
  card: { background: '#111', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 420, border: '1px solid #222' },
  header: { textAlign: 'center', marginBottom: '1.5rem' },
  wifiIcon: { fontSize: '3rem', display: 'block' },
  title: { color: '#10b981', fontSize: '1.5rem', margin: '0.5rem 0 0.25rem' },
  sub: { color: '#666', fontSize: '0.85rem', margin: 0 },
  error: { background: '#ef444422', color: '#ef4444', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center' },
  packages: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' },
  package: { border: '2px solid #333', borderRadius: 12, padding: '1rem', cursor: 'pointer', transition: '0.2s' },
  pkgName: { color: '#fff', fontWeight: 600, fontSize: '1.05rem' },
  pkgPrice: { color: '#10b981', fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem' },
  pkgMeta: { display: 'flex', gap: '1rem', color: '#888', fontSize: '0.8rem', marginTop: '0.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input: { background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, padding: '0.85rem', color: '#fff', fontSize: '1rem', outline: 'none' },
  mac: { color: '#555', fontSize: '0.75rem', textAlign: 'center' },
  btn: { background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, padding: '0.85rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
  footer: { textAlign: 'center', color: '#444', fontSize: '0.75rem', marginTop: '1.5rem' },
};
