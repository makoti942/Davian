import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', duration_hours: '', mbps: '', is_active: true });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => axios.get('/api/packages/all').then(res => setPackages(res.data));

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await axios.put(`/api/packages/${editing}`, form);
      } else {
        await axios.post('/api/packages', form);
      }
      setForm({ name: '', price: '', duration_hours: '', mbps: '', is_active: true });
      setEditing(null);
      load();
    } catch (err) { setError('Error saving package'); }
  };

  const handleEdit = (pkg) => {
    setForm({ name: pkg.name, price: pkg.price, duration_hours: pkg.duration_hours, mbps: pkg.mbps, is_active: !!pkg.is_active });
    setEditing(pkg.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this package?')) return;
    await axios.delete(`/api/packages/${id}`);
    load();
  };

  const handleToggle = async (pkg) => {
    await axios.put(`/api/packages/${pkg.id}`, { ...pkg, is_active: !pkg.is_active });
    load();
  };

  return (
    <AdminLayout>
      <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>📦 Packages</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', background: '#1a1a1a', padding: '1rem', borderRadius: 12 }}>
        <input style={styles.input} placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input style={{ ...styles.input, width: 90 }} type="number" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        <input style={{ ...styles.input, width: 100 }} type="number" placeholder="Hours" value={form.duration_hours} onChange={e => setForm({ ...form, duration_hours: e.target.value })} />
        <input style={{ ...styles.input, width: 90 }} type="number" step="0.1" placeholder="Mbps" value={form.mbps} onChange={e => setForm({ ...form, mbps: e.target.value })} />
        <button type="submit" style={styles.btn}>{editing ? 'Update' : 'Add'}</button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', price: '', duration_hours: '', mbps: '', is_active: true }); }} style={{ ...styles.btn, background: '#555' }}>Cancel</button>}
      </form>
      {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {packages.map(pkg => (
          <div key={pkg.id} style={{ background: '#1a1a1a', borderRadius: 10, padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: pkg.is_active ? 1 : 0.5 }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 600 }}>{pkg.name}</div>
              <div style={{ color: '#888', fontSize: '0.8rem' }}>KES {pkg.price} · {pkg.duration_hours}h · {pkg.mbps} Mbps</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleToggle(pkg)} style={styles.smallBtn}>{pkg.is_active ? 'Disable' : 'Enable'}</button>
              <button onClick={() => handleEdit(pkg)} style={{ ...styles.smallBtn, background: '#3b82f6' }}>Edit</button>
              <button onClick={() => handleDelete(pkg.id)} style={{ ...styles.smallBtn, background: '#ef4444' }}>Delete</button>
            </div>
          </div>
        ))}
        {packages.length === 0 && <p style={{ color: '#666' }}>No packages yet</p>}
      </div>
    </AdminLayout>
  );
}

const styles = {
  input: { background: '#111', border: '1px solid #333', borderRadius: 8, padding: '0.6rem', color: '#fff', outline: 'none', fontSize: '0.9rem' },
  btn: { background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 600 },
  smallBtn: { background: '#333', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '0.8rem' },
};
