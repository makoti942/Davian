import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    axios.get('/api/settings').then(res => setSettings(res.data)).catch(console.error);
  }, []);

  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  const handleSave = async () => {
    await axios.put('/api/settings', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout>
      <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>⚙️ Settings</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 500 }}>
        {Object.entries(settings).map(([key, value]) => (
          <div key={key}>
            <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>{key}</label>
            <input
              style={styles.input}
              value={value || ''}
              onChange={e => update(key, e.target.value)}
            />
          </div>
        ))}

        <div>
          <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>MikroTik Host</label>
          <input style={styles.input} value={settings['mikrotik_host'] || ''} onChange={e => update('mikrotik_host', e.target.value)} placeholder="192.168.88.1" />
        </div>
        <div>
          <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>MikroTik User</label>
          <input style={styles.input} value={settings['mikrotik_user'] || ''} onChange={e => update('mikrotik_user', e.target.value)} />
        </div>
        <div>
          <label style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginBottom: '0.25rem' }}>MikroTik Password</label>
          <input style={styles.input} type="password" value={settings['mikrotik_pass'] || ''} onChange={e => update('mikrotik_pass', e.target.value)} />
        </div>

        {saved && <div style={{ color: '#10b981' }}>Settings saved!</div>}

        <button onClick={handleSave} style={styles.btn}>Save Settings</button>
      </div>
    </AdminLayout>
  );
}

const styles = {
  input: { background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '0.6rem', color: '#fff', width: '100%', outline: 'none', fontSize: '0.9rem' },
  btn: { background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '0.7rem 1.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.95rem', alignSelf: 'flex-start' },
};
