import { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';

const API_BASE = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_BASE || 'http://localhost:5001';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [status, setStatus] = useState<'checking' | 'ok' | 'redirect'>('checking');

  useEffect(() => {
    const token = (() => {
      try { return localStorage.getItem('adminToken') || ''; } catch { return ''; }
    })().trim();

    if (!token) {
      setStatus('redirect');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/verify`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
        if (!cancelled) {
          if (res.ok) setStatus('ok');
          else {
            try { localStorage.removeItem('adminToken'); } catch {}
            setStatus('redirect');
          }
        }
      } catch {
        if (!cancelled) setStatus('redirect');
      }
    })();

    return () => { cancelled = true; };
  }, []);

  if (status === 'checking') return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div></div>;
  if (status === 'redirect') return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

