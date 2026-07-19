import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/login', { username, password });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.card}>
        <h1 style={styles.title}>🔐 Admin Login</h1>
        {error && <div style={styles.error}>{error}</div>}
        <input style={styles.input} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button style={styles.btn} disabled={loading}>{loading ? '...' : 'Login'}</button>
        <a href="/" style={styles.back}>← Back to Portal</a>
      </form>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', padding: '1rem' },
  card: { background: '#111', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 380, border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '1rem' },
  title: { color: '#10b981', textAlign: 'center', fontSize: '1.3rem', margin: 0 },
  error: { background: '#ef444422', color: '#ef4444', padding: '0.6rem', borderRadius: 8, fontSize: '0.85rem', textAlign: 'center' },
  input: { background: '#1a1a1a', border: '1px solid #333', borderRadius: 10, padding: '0.8rem', color: '#fff', fontSize: '0.95rem', outline: 'none' },
  btn: { background: '#10b981', color: '#fff', border: 'none', borderRadius: 10, padding: '0.8rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
  back: { color: '#555', textAlign: 'center', fontSize: '0.8rem', textDecoration: 'none' },
};
