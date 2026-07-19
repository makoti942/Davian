import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

export default function ProtectedRoute({ children }) {
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    axios.get('/api/auth/check')
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#0a0a0a', color:'#10b981' }}>Loading...</div>;
  }

  if (!authed) return <Navigate to="/admin" replace />;
  return children;
}
