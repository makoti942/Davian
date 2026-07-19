import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState('');

  const load = () => {
    const url = filter ? `/api/transactions?page=${page}&limit=50&status=${filter}` : `/api/transactions?page=${page}&limit=50`;
    axios.get(url).then(res => { setTransactions(res.data.transactions); setTotal(res.data.total); }).catch(console.error);
  };

  useEffect(() => { load(); }, [page, filter]);

  const statusColors = { pending: '#f59e0b', completed: '#10b981', failed: '#ef4444', expired: '#888' };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: '#fff', margin: 0 }}>💳 Transactions</h2>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} style={styles.select}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Package</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>M-Pesa Code</th>
              <th style={styles.th}>MAC</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Expires</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td style={styles.td}>{tx.id}</td>
                <td style={styles.td}>{tx.phone}</td>
                <td style={styles.td}>{tx.package_name}</td>
                <td style={styles.td}>KES {tx.amount}</td>
                <td style={{ ...styles.td, color: statusColors[tx.status] || '#fff' }}>{tx.status}</td>
                <td style={styles.td}>{tx.mpesa_code || '-'}</td>
                <td style={{ ...styles.td, fontSize: '0.75rem' }}>{tx.mac_address}</td>
                <td style={{ ...styles.td, fontSize: '0.75rem' }}>{new Date(tx.created_at).toLocaleString()}</td>
                <td style={{ ...styles.td, fontSize: '0.75rem' }}>{tx.expiry_at ? new Date(tx.expiry_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
            {transactions.length === 0 && <tr><td colSpan={9} style={{ ...styles.td, textAlign: 'center', color: '#666' }}>No transactions</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={styles.pageBtn}>← Prev</button>
        <span style={{ color: '#888', alignSelf: 'center' }}>Page {page} of {Math.ceil(total / 50)}</span>
        <button disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)} style={styles.pageBtn}>Next →</button>
      </div>
    </AdminLayout>
  );
}

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' },
  th: { textAlign: 'left', padding: '0.6rem 0.75rem', color: '#888', borderBottom: '1px solid #222', whiteSpace: 'nowrap' },
  td: { padding: '0.6rem 0.75rem', color: '#ccc', borderBottom: '1px solid #1a1a1a', whiteSpace: 'nowrap' },
  select: { background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '0.5rem', color: '#fff', outline: 'none' },
  pageBtn: { background: '#1a1a1a', color: '#fff', border: '1px solid #333', borderRadius: 8, padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.85rem' },
};
