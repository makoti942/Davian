import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await axios.post('/api/auth/logout');
    navigate('/admin');
  };

  return (
    <div style={styles.layout}>
      <nav style={styles.sidebar}>
        <h2 style={styles.logo}>⚙️ Admin</h2>
        <NavLink to="/admin/dashboard" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.active : {}) })}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/admin/packages" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.active : {}) })}>
          📦 Packages
        </NavLink>
        <NavLink to="/admin/transactions" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.active : {}) })}>
          💳 Transactions
        </NavLink>
        <NavLink to="/admin/settings" style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.active : {}) })}>
          ⚙️ Settings
        </NavLink>
        <button onClick={handleLogout} style={styles.logoutBtn}>🚪 Logout</button>
      </nav>
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#0f0f0f', color: '#fff' },
  sidebar: { width: 220, background: '#1a1a1a', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: '1px solid #2a2a2a' },
  logo: { color: '#10b981', fontSize: '1.2rem', marginBottom: '1rem' },
  link: { color: '#aaa', textDecoration: 'none', padding: '0.6rem 1rem', borderRadius: 6, transition: '0.2s', fontSize: '0.95rem' },
  active: { background: '#10b98122', color: '#10b981', borderLeft: '3px solid #10b981' },
  main: { flex: 1, padding: '2rem', overflow: 'auto' },
  logoutBtn: { marginTop: 'auto', background: '#2a2a2a', color: '#ef4444', border: 'none', padding: '0.6rem 1rem', borderRadius: 6, cursor: 'pointer', fontSize: '0.95rem' },
};
