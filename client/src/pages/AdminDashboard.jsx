import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get('/api/transactions/stats').then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return <AdminLayout><p style={{ color: '#666' }}>Loading...</p></AdminLayout>;

  const cards = [
    { label: 'Total Revenue', value: `KES ${stats.total_revenue?.toLocaleString() || 0}`, color: '#10b981' },
    { label: 'Active Sessions', value: stats.active_sessions || 0, color: '#3b82f6' },
    { label: 'Today Revenue', value: `KES ${stats.today_revenue?.toLocaleString() || 0}`, color: '#f59e0b' },
    { label: 'Completed', value: stats.completed || 0, color: '#10b981' },
    { label: 'Pending', value: stats.pending || 0, color: '#f59e0b' },
    { label: 'Failed', value: stats.failed || 0, color: '#ef4444' },
  ];

  return (
    <AdminLayout>
      <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>📊 Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {cards.map((c, i) => (
          <div key={i} style={{ background: '#1a1a1a', borderRadius: 12, padding: '1.25rem', border: `1px solid ${c.color}22` }}>
            <div style={{ color: '#888', fontSize: '0.8rem' }}>{c.label}</div>
            <div style={{ color: c.color, fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{c.value}</div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
