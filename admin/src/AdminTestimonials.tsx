import { useCallback, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'de';

interface Testimonial {
  _id?: string;
  order: number;
  content: string;
  name: string;
  role: string;
  company: string;
  rating: number;
}

const API_BASE =
  ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_API_BASE ||
  'http://localhost:5001';

export default function AdminTestimonials() {
  const [lang, setLang] = useState<Lang>('en');
  const [token, setToken] = useState<string>(() => {
    try {
      const ls = localStorage.getItem('adminToken') || '';
      const envTok = ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_ADMIN_TOKEN || '';
      return (ls && ls.trim()) || envTok || '';
    } catch {
      return '';
    }
  });
  const hasToken = useMemo(() => token.trim().length > 0, [token]);
  const envToken = useMemo(() => {
    try {
      return ((((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_ADMIN_TOKEN) || '').trim();
    } catch {
      return '';
    }
  }, []);
  const headers = useCallback((): Record<string, string> => {
    const tk = token.trim();
    return tk ? { Authorization: `Bearer ${tk}` } : {};
  }, [token]);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [originalTestimonials, setOriginalTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);
  const [query, setQuery] = useState('');
  // Modal edit state similar to other admin pages
  const [editTarget, setEditTarget] = useState<Testimonial | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  const isDirty = useCallback((idx: number) => {
    if (!originalTestimonials[idx]) return true;
    return !isEqualTestimonial(testimonials[idx], originalTestimonials[idx]);
  }, [testimonials, originalTestimonials]);

  const pushToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    const u = new URL(window.location.href);
    const t = (u.searchParams.get('token') || '').trim();
    if (t) {
      setToken(t);
      try { localStorage.setItem('adminToken', t); } catch (_err) { void _err; }
      u.searchParams.delete('token');
      window.history.replaceState({}, document.title, u.toString());
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('adminToken', token.trim()); } catch (_err) { void _err; }
  }, [token]);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`${API_BASE}/api/admin/testimonials?lang=${lang}`, { headers: headers() });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      const list: Testimonial[] = Array.isArray(data.testimonials) ? data.testimonials.slice().sort((a: Testimonial, b: Testimonial) => a.order - b.order) : [];
      setTestimonials(list);
      setOriginalTestimonials(JSON.parse(JSON.stringify(list)) as Testimonial[]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [lang, headers]);

  useEffect(() => {
    if (hasToken) load();
  }, [hasToken, lang, load]);

  const setTestimonialField = (idx: number, key: keyof Testimonial, value: Testimonial[keyof Testimonial]) => {
    setTestimonials(prev => prev.map((t, i) => (i === idx ? { ...t, [key]: value } : t)));
  };

  const validateCore = (t: Pick<Testimonial, 'order'|'content'|'name'|'role'|'company'|'rating'>) => {
    if (t.order < 0) return 'Order must be non-negative';
    if (!t.content.trim()) return 'Content is required';
    if (!t.name.trim()) return 'Name is required';
    if (!t.role.trim()) return 'Role is required';
    if (!t.company.trim()) return 'Company is required';
    if (typeof t.rating !== 'number' || isNaN(t.rating)) return 'Rating must be a number';
    if (t.rating < 1 || t.rating > 5) return 'Rating must be between 1 and 5';
    return null;
  };

  const logHttpError = async (res: Response, context: string) => {
    const __ENV = ((import.meta as unknown) as { env?: Record<string, any> }).env || {};
    if (__ENV && __ENV.DEV) {
      let body = '';
      try { body = await res.clone().text(); } catch { /* ignore */ }
      console.error('[AdminTestimonials] request failed', {
        context,
        url: res.url,
        status: res.status,
        statusText: res.statusText,
      });
      if (body) console.error('[AdminTestimonials] response body:', body);
    }
  };

  const onSave = async (t: Testimonial) => {
    const err = validateCore(t);
    if (err) return alert(err);
    if (!hasToken) return alert('Admin token required');
    const updates: Partial<Omit<Testimonial, 'order'>> = {
      content: t.content,
      name: t.name,
      role: t.role,
      company: t.company,
      rating: t.rating,
    };
    const url = `${API_BASE}/api/admin/testimonials/${t.order}`;
    setSavingOrder(t.order);
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, updates }),
    });
    if (!res.ok) { await logHttpError(res, `PUT ${url}`); setSavingOrder(null); return alert('Save failed: ' + res.status); }
    await load();
    pushToast('Testimonial saved');
    setSavingOrder(null);
  };

  const onDelete = async (t: Testimonial) => {
    if (!hasToken) return alert('Admin token required');
    const url = `${API_BASE}/api/admin/testimonials/${t.order}?lang=${lang}`;
    const res = await fetch(url, {
      method: 'DELETE', headers: headers()
    });
    if (!res.ok) { await logHttpError(res, `DELETE ${url}`); return alert('Delete failed: ' + res.status); }
    await load();
    pushToast('Testimonial deleted');
  };

  const [newTestimonial, setNewTestimonial] = useState<Testimonial>({
    order: 0, content: '', name: '', role: '', company: '', rating: 5
  });

  const prefillSample = () => {
    const orderNum = testimonials.length > 0 ? Math.max(...testimonials.map(t => t.order)) + 1 : 0;
    const sample: Testimonial = {
      order: orderNum,
      content: lang === 'de' ? 'Dies ist ein Beispieltestimonial' : 'This is a sample testimonial',
      name: lang === 'de' ? 'Max Mustermann' : 'John Doe',
      role: lang === 'de' ? 'CEO' : 'CEO',
      company: lang === 'de' ? 'Beispiel GmbH' : 'Example Inc',
      rating: 5,
    };
    setNewTestimonial(sample);
  };

  const onAdd = async () => {
    if (!hasToken) return alert('Admin token required');
    if (newTestimonial.order < 0) return alert('Order must be non-negative');
    const existingOrders = new Set(testimonials.map(t => t.order));
    if (existingOrders.has(newTestimonial.order)) return alert(`Order ${newTestimonial.order} already exists for ${lang}.`);
    const err = validateCore(newTestimonial);
    if (err) return alert(err);
    const url = `${API_BASE}/api/admin/testimonials`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, testimonial: newTestimonial }),
    });
    if (!res.ok) {
      if (res.status === 409) {
        return alert('This order already exists for the selected language.');
      }
      await logHttpError(res, `POST ${url}`);
      return alert('Add failed: ' + res.status);
    }
    setNewTestimonial({ order: 0, content: '', name: '', role: '', company: '', rating: 5 });
    await load();
    pushToast('Testimonial added');
    setAddOpen(false);
  };

  const card = { background: '#0b1220', border: '1px solid #1f2937', borderRadius: 14, padding: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.35)' } as const;
  const chip = { color: '#10b981', background: '#062e24', padding: '6px 12px', borderRadius: 999, fontWeight: 700 } as const;
  const inputBase = { padding: 10, border: '1px solid #334155', background: '#0f172a', color: '#e5e7eb', borderRadius: 10, outline: 'none' } as const;
  const btnPrimary = { padding: '8px 12px', borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 14, border: '1px solid #1d4ed8', cursor: 'pointer' } as const;
  const btnSecondary = { padding: '8px 12px', borderRadius: 8, background: '#111827', color: '#e5e7eb', fontWeight: 600, fontSize: 14, border: '1px solid #374151', cursor: 'pointer' } as const;
  const thStyle = { padding: 10, textAlign: 'left' as const, background: '#0b1220', color: '#94a3b8', borderBottom: '1px solid #1f2937', position: 'sticky' as const, top: 0, zIndex: 1, textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.6 };
  const tdStyle = { padding: 10, borderTop: '1px solid #1f2937', verticalAlign: 'top' as const };

  return (
    <div style={{ padding: 0, maxWidth: '100%', margin: '0 auto', color: '#e5e7eb' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: -0.3, color: '#fff' }}>Testimonials Management</h2>
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Manage your testimonials for English and German languages</p>
      </div>

      <div style={{ ...card, display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label>Language
          <select value={lang} onChange={e => setLang(e.target.value as Lang)} style={{ ...inputBase, marginLeft: 8, padding: 8, width: 160 }}>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </select>
          </label>

          {loading && <span style={{ color: '#9ca3af' }}>Loading…</span>}
          {error && <span style={{ color: '#f87171' }}>{error}</span>}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {!hasToken ? (
            <>
              <input placeholder="ADMIN_TOKEN" value={token} onChange={e => setToken(e.target.value)} style={{ ...inputBase, width: 260 }} />
              <button onClick={load} disabled={!hasToken && token.trim().length === 0} style={{ ...btnPrimary, opacity: token.trim() ? 1 : 0.6 }}>Load</button>
              {envToken && (
                <button onClick={() => setToken(envToken)} style={{ ...btnSecondary }}>Use env token</button>
              )}
            </>
          ) : (
            <>
              <span style={chip}>Token loaded</span>
              <button onClick={() => setToken('')} style={btnSecondary}>Change token</button>
            </>
          )}
          <div style={{ display: 'flex', gap: 10, marginLeft: 8 }}>
            <span style={{ color: '#9ca3af', fontSize: 12 }}>API: {API_BASE}</span>
            <span style={{ color: hasToken ? '#10b981' : '#f87171', fontSize: 12 }}>Token: {hasToken ? 'yes' : 'no'}</span>
          </div>
        </div>
      </div>

      <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ color: '#9ca3af', fontSize: 13 }}>Testimonials: {testimonials.length}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="Search testimonials…" value={query} onChange={e => setQuery(e.target.value)} style={{ ...inputBase, width: 260 }} />
          <button onClick={() => load()} style={btnSecondary}>Refresh</button>
          <button onClick={() => setAddOpen(true)} style={btnPrimary}>Add Testimonial</button>
        </div>
      </div>

      <div style={{ ...card, padding: 0, maxHeight: 460, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle }}>Order</th>
              <th style={{ ...thStyle }}>Content</th>
              <th style={{ ...thStyle }}>Name</th>
              <th style={{ ...thStyle }}>Role</th>
              <th style={{ ...thStyle }}>Company</th>
              <th style={{ ...thStyle }}>Rating</th>
              <th style={{ ...thStyle }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((t, idx) => {
              const q = query.trim().toLowerCase();
              const matches = !q || [String(t.order), t.content, t.name, t.role, t.company, String(t.rating ?? '')].join(' ').toLowerCase().includes(q);
              return (
              <tr key={t._id || t.order} onMouseEnter={() => setHoverRow(idx)} onMouseLeave={() => setHoverRow(r => (r===idx?null:r))} onClick={() => { setEditTarget(t); setEditingTestimonial({ ...t }); }} style={{ background: hoverRow === idx ? '#0e1a33' : (idx % 2 ? '#0b1426' : 'transparent'), transition: 'background 120ms ease', display: matches ? undefined : 'none', cursor: 'pointer' }}>
                <td style={tdStyle}>
                  <input type="number" min={0} value={t.order} onChange={e => setTestimonialField(idx, 'order', Number(e.target.value))} style={{ ...inputBase, width: 80, textAlign: 'center' as const }} />
                </td>
                <td style={tdStyle}>
                  <textarea value={t.content} onChange={e => setTestimonialField(idx, 'content', e.target.value)} style={{ ...inputBase, width: '100%', minHeight: 64, resize: 'vertical' }} />
                </td>
                <td style={tdStyle}>
                  <input value={t.name} onChange={e => setTestimonialField(idx, 'name', e.target.value)} style={{ ...inputBase, width: '100%' }} />
                </td>
                <td style={tdStyle}>
                  <input value={t.role} onChange={e => setTestimonialField(idx, 'role', e.target.value)} style={{ ...inputBase, width: '100%' }} />
                </td>
                <td style={tdStyle}>
                  <input value={t.company} onChange={e => setTestimonialField(idx, 'company', e.target.value)} style={{ ...inputBase, width: '100%' }} />
                </td>
                <td style={tdStyle}>
                  <input type="number" min={1} max={5} value={t.rating ?? 5} onChange={e => setTestimonialField(idx, 'rating', Math.max(1, Math.min(5, Number(e.target.value))))} style={{ ...inputBase, width: 100 }} />
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => onSave(t)} disabled={!hasToken || !isDirty(idx)} style={{ ...btnPrimary, opacity: hasToken && isDirty(idx) ? 1 : 0.6 }}>{savingOrder===t.order ? 'Saving…' : 'Save'}</button>
                    <button onClick={() => setTestimonials(prev => prev.map((tt, i) => (i===idx ? { ...originalTestimonials[idx] } : tt)))} disabled={!isDirty(idx)} style={{ ...btnSecondary, opacity: isDirty(idx) ? 1 : 0.6 }}>Revert</button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(t); }} disabled={!hasToken} style={{ ...btnSecondary, opacity: hasToken ? 1 : 0.6 }}>Delete</button>
                  </div>
                </td>
              </tr>
              );
            })}
            {testimonials.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No testimonials yet. Click "Add Testimonial" to create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <details open={addOpen} onToggle={e => setAddOpen((e.target as HTMLDetailsElement).open)} style={{ marginTop: 16 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Add New Testimonial</summary>
        <div style={{ ...card, marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input type="number" placeholder="Order" min={0} value={newTestimonial.order} onChange={e => setNewTestimonial({ ...newTestimonial, order: Number(e.target.value) })} style={{ ...inputBase, width: 140 }} />
            <textarea rows={3} placeholder="Content" value={newTestimonial.content} onChange={e => setNewTestimonial({ ...newTestimonial, content: e.target.value })} style={{ ...inputBase, flex: '1 1 100%', minHeight: 80, resize: 'vertical' }} />
            <input placeholder="Name" value={newTestimonial.name} onChange={e => setNewTestimonial({ ...newTestimonial, name: e.target.value })} style={{ ...inputBase, flex: '1 1 260px' }} />
            <input placeholder="Role" value={newTestimonial.role} onChange={e => setNewTestimonial({ ...newTestimonial, role: e.target.value })} style={{ ...inputBase, flex: '1 1 260px' }} />
            <input placeholder="Company" value={newTestimonial.company} onChange={e => setNewTestimonial({ ...newTestimonial, company: e.target.value })} style={{ ...inputBase, flex: '1 1 260px' }} />
            <input type="number" placeholder="Rating (1-5)" min={1} max={5} value={newTestimonial.rating} onChange={e => setNewTestimonial({ ...newTestimonial, rating: Math.max(1, Math.min(5, Number(e.target.value))) })} style={{ ...inputBase, width: 160 }} />
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={onAdd} disabled={newTestimonial.order < 0 || !hasToken} style={{ ...btnPrimary, opacity: newTestimonial.order >= 0 && hasToken ? 1 : 0.6 }}>Add Testimonial</button>
            <button onClick={prefillSample} style={{ ...btnSecondary, marginLeft: 8 }}>Prefill sample</button>
          </div>
        </div>
      </details>
      {/* Add Testimonial Modal */}
      {addOpen && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }} onClick={() => setAddOpen(false)}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: '#0b1220', border: '1px solid #1f2937', borderRadius: 14, padding: 16, maxWidth: 720, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Add New Testimonial</h3>
              <button onClick={() => setAddOpen(false)} style={{ ...btnSecondary }}>×</button>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input type="number" placeholder="Order" min={0} value={newTestimonial.order} onChange={e => setNewTestimonial({ ...newTestimonial, order: Number((e.target as HTMLInputElement).value) })} style={{ ...inputBase, width: 140 }} />
              <textarea rows={3} placeholder="Content" value={newTestimonial.content} onChange={e => setNewTestimonial({ ...newTestimonial, content: (e.target as HTMLTextAreaElement).value })} style={{ ...inputBase, flex: '1 1 100%', minHeight: 80, resize: 'vertical' }} />
              <input placeholder="Name" value={newTestimonial.name} onChange={e => setNewTestimonial({ ...newTestimonial, name: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 260px' }} />
              <input placeholder="Role" value={newTestimonial.role} onChange={e => setNewTestimonial({ ...newTestimonial, role: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 260px' }} />
              <input placeholder="Company" value={newTestimonial.company} onChange={e => setNewTestimonial({ ...newTestimonial, company: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 260px' }} />
              <input type="number" placeholder="Rating (1-5)" min={1} max={5} value={newTestimonial.rating} onChange={e => setNewTestimonial({ ...newTestimonial, rating: Math.max(1, Math.min(5, Number((e.target as HTMLInputElement).value))) })} style={{ ...inputBase, width: 160 }} />
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={prefillSample} style={{ ...btnSecondary }}>Prefill sample</button>
              <button onClick={onAdd} disabled={newTestimonial.order < 0 || !hasToken} style={{ ...btnPrimary, opacity: newTestimonial.order >= 0 && hasToken ? 1 : 0.6 }}>Add Testimonial</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Testimonial Modal */}
      {editTarget && editingTestimonial && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }} onClick={() => { setEditTarget(null); setEditingTestimonial(null); }}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: '#0b1220', border: '1px solid #1f2937', borderRadius: 14, padding: 16, maxWidth: 720, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Edit Testimonial (Order: {editTarget.order})</h3>
              <button onClick={() => { setEditTarget(null); setEditingTestimonial(null); }} style={{ ...btnSecondary }}>×</button>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input type="number" value={editingTestimonial.order} disabled style={{ ...inputBase, width: 140, color: '#9ca3af' }} />
              <textarea rows={3} placeholder="Content" value={editingTestimonial.content} onChange={e => setEditingTestimonial({ ...editingTestimonial, content: (e.target as HTMLTextAreaElement).value })} style={{ ...inputBase, flex: '1 1 100%', minHeight: 80, resize: 'vertical' }} />
              <input placeholder="Name" value={editingTestimonial.name} onChange={e => setEditingTestimonial({ ...editingTestimonial, name: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 260px' }} />
              <input placeholder="Role" value={editingTestimonial.role} onChange={e => setEditingTestimonial({ ...editingTestimonial, role: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 260px' }} />
              <input placeholder="Company" value={editingTestimonial.company} onChange={e => setEditingTestimonial({ ...editingTestimonial, company: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 260px' }} />
              <input type="number" placeholder="Rating (1-5)" min={1} max={5} value={editingTestimonial.rating} onChange={e => setEditingTestimonial({ ...editingTestimonial, rating: Math.max(1, Math.min(5, Number((e.target as HTMLInputElement).value))) })} style={{ ...inputBase, width: 160 }} />
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setEditTarget(null); setEditingTestimonial(null); }} style={btnSecondary}>Cancel</button>
              <button onClick={() => { if (editingTestimonial) void onSave(editingTestimonial); setEditTarget(null); setEditingTestimonial(null); }} disabled={!hasToken} style={btnPrimary}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div style={{ position: 'fixed', right: 16, bottom: 16, background: toast.type==='success' ? '#062e24' : '#3f1d1d', color: toast.type==='success' ? '#10b981' : '#f87171', border: '1px solid #1f2937', borderRadius: 10, padding: '10px 14px', fontWeight: 600 }}>
          {toast.message}
        </div>
      )}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#0b1220', border: '1px solid #1f2937', borderRadius: 12, padding: 16, minWidth: 340 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Delete testimonial</div>
            <div style={{ color: '#cbd5e1', marginBottom: 12 }}>Are you sure you want to delete testimonial with order {deleteTarget.order}?</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setDeleteTarget(null)} style={btnSecondary}>Cancel</button>
              <button onClick={() => { const t = deleteTarget; setDeleteTarget(null); if (t) void onDelete(t); }} style={btnPrimary}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isEqualTestimonial(a: Testimonial, b: Testimonial) {
  return a.order===b.order && a.content===b.content && a.name===b.name && a.role===b.role && a.company===b.company && a.rating===b.rating;
}

