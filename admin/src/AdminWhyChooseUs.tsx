import { useCallback, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'de';

interface WhyChooseUs {
  _id?: string;
  badge: string;
  heading: string;
  description: string;
  items: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

const API_BASE =
  ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_API_BASE ||
  'http://localhost:5001';

export default function AdminWhyChooseUs() {
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
  const headers = useCallback((): Record<string, string> => {
    const tk = token.trim();
    return tk ? { Authorization: `Bearer ${tk}` } : {};
  }, [token]);

  const [whyChooseUs, setWhyChooseUs] = useState<WhyChooseUs | null>(null);
  const [originalWhyChooseUs, setOriginalWhyChooseUs] = useState<WhyChooseUs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirtyGuard, setDirtyGuard] = useState(false);
  // Modal-based edit UX
  const [editOpen, setEditOpen] = useState(false);
  const [editingWCU, setEditingWCU] = useState<WhyChooseUs | null>(null);

  const validate = useCallback((w: WhyChooseUs | null) => {
    const errs: Record<string, string> = {};
    if (!w) return errs;
    if (!w.badge?.trim()) errs.badge = 'Badge is required';
    if (!w.heading?.trim()) errs.heading = 'Heading is required';
    if (!w.description?.trim()) errs.description = 'Description is required';
    (w.items || []).forEach((it, idx) => {
      if (!it.icon?.trim()) errs[`item_${idx}_icon`] = 'Icon is required';
      if (!it.title?.trim()) errs[`item_${idx}_title`] = 'Title is required';
      if (!it.description?.trim()) errs[`item_${idx}_description`] = 'Description is required';
    });
    return errs;
  }, []);

  const validationErrors = useMemo(() => validate(whyChooseUs), [whyChooseUs, validate]);
  const isValid = useMemo(() => Object.keys(validationErrors).length === 0, [validationErrors]);

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
      const res = await fetch(`${API_BASE}/api/admin/why-choose-us?lang=${lang}`, { headers: headers() });
      if (!res.ok) {
        if (res.status === 404) {
          setWhyChooseUs(null);
          setOriginalWhyChooseUs(null);
          return;
        }
        throw new Error(`Failed: ${res.status}`);
      }
      const data = await res.json();
      const w: WhyChooseUs | null = data.whyChooseUs || null;
      setWhyChooseUs(w);
      setOriginalWhyChooseUs(w ? JSON.parse(JSON.stringify(w)) : null);
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

  const setWhyChooseUsField = (key: keyof WhyChooseUs, value: WhyChooseUs[keyof WhyChooseUs]) => {
    if (!whyChooseUs) return;
    setWhyChooseUs({ ...whyChooseUs, [key]: value });
  };

  const setItemField = (idx: number, key: string, value: string) => {
    if (!whyChooseUs) return;
    const newItems = [...whyChooseUs.items];
    newItems[idx] = { ...newItems[idx], [key]: value };
    setWhyChooseUs({ ...whyChooseUs, items: newItems });
  };

  // Modal helpers
  const openEditModal = () => {
    if (!whyChooseUs) return;
    setEditingWCU(JSON.parse(JSON.stringify(whyChooseUs)) as WhyChooseUs);
    setEditOpen(true);
  };
  const applyEditModal = () => {
    if (editingWCU) setWhyChooseUs(editingWCU);
    setEditOpen(false);
  };
  const setEditingItemField = (idx: number, key: string, value: string) => {
    if (!editingWCU) return;
    const items = [...editingWCU.items];
    items[idx] = { ...items[idx], [key]: value };
    setEditingWCU({ ...editingWCU, items });
  };
  const addEditingItem = () => {
    if (!editingWCU) return;
    setEditingWCU({ ...editingWCU, items: [...editingWCU.items, { icon: 'Award', title: '', description: '' }] });
  };
  const removeEditingItem = (idx: number) => {
    if (!editingWCU) return;
    setEditingWCU({ ...editingWCU, items: editingWCU.items.filter((_, i) => i !== idx) });
  };

  const addItem = () => {
    if (!whyChooseUs) return;
    setWhyChooseUs({
      ...whyChooseUs,
      items: [...whyChooseUs.items, { icon: 'Award', title: '', description: '' }],
    });
  };

  const removeItem = (idx: number) => {
    if (!whyChooseUs) return;
    setWhyChooseUs({
      ...whyChooseUs,
      items: whyChooseUs.items.filter((_, i) => i !== idx),
    });
  };

  const isDirty = useMemo(() => {
    if (!whyChooseUs || !originalWhyChooseUs) return !!whyChooseUs;
    return JSON.stringify(whyChooseUs) !== JSON.stringify(originalWhyChooseUs);
  }, [whyChooseUs, originalWhyChooseUs]);

  const onSave = useCallback(async () => {
    if (!whyChooseUs || !hasToken) return alert('WhyChooseUs data and token required');
    if (!isValid) return alert('Please fix validation errors before saving');
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/why-choose-us`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({ lang, whyChooseUs }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      await load();
      pushToast('Why Choose Us saved successfully');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [whyChooseUs, hasToken, isValid, headers, lang, load]);

  useEffect(() => {
    if (isDirty && !dirtyGuard) setDirtyGuard(true);
    if (!isDirty && dirtyGuard) setDirtyGuard(false);
  }, [isDirty, dirtyGuard]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyGuard) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirtyGuard]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (hasToken && isDirty && isValid && !saving) onSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasToken, isDirty, isValid, saving, onSave]);

  const card = { background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: 16, padding: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' } as const;
  const inputBase = { padding: '10px 14px', border: '1px solid rgba(51, 65, 85, 0.6)', background: 'rgba(15, 23, 42, 0.6)', color: '#e2e8f0', borderRadius: 12, outline: 'none', transition: 'all 0.2s', fontSize: 14, width: '100%' } as const;
  const inputFocus = { border: '1px solid rgba(212, 175, 55, 0.5)', background: 'rgba(15, 23, 42, 0.8)', boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.1)' } as const;
  const btnPrimary = { padding: '10px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' } as const;
  const btnSecondary = { padding: '10px 16px', borderRadius: 10, background: 'rgba(17, 24, 39, 0.6)', color: '#cbd5e1', fontWeight: 600, fontSize: 14, border: '1px solid rgba(55, 65, 81, 0.6)', cursor: 'pointer', transition: 'all 0.2s' } as const;

  return (
    <div style={{ padding: 20, maxWidth: 980, margin: '0 auto', color: '#e2e8f0' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, margin: '-20px -20px 24px -20px', padding: '14px 20px', backdropFilter: 'blur(10px)', background: 'rgba(2,6,23,0.6)', borderBottom: '1px solid rgba(51,65,85,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 6, height: 28, background: 'linear-gradient(to bottom, #22c55e, #3b82f6)', borderRadius: 3, boxShadow: '0 0 18px rgba(34,197,94,0.25)' }} />
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.3, color: '#fff' }}>Why Choose Us</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 12 }}>
                <span>Manage section content</span>
                <span style={{ opacity: 0.6 }}>•</span>
                <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(14,165,233,0.15)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.25)', fontWeight: 700 }}>{lang.toUpperCase()}</span>
                {isDirty && (
                  <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(234,179,8,0.15)', color: '#facc15', border: '1px solid rgba(234,179,8,0.25)', fontWeight: 700 }}>Unsaved</span>
                )}

      {editOpen && editingWCU && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 }} onClick={() => setEditOpen(false)}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} />
          <div style={{ position: 'relative', background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(51,65,85,0.6)', borderRadius: 16, padding: 20, maxWidth: 980, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Edit Why Choose Us</h3>
              <button onClick={() => setEditOpen(false)} style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(17,24,39,0.6)', color: '#cbd5e1', border: '1px solid rgba(55,65,81,0.6)' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Badge</label>
                <input value={editingWCU.badge} onChange={e => setEditingWCU({ ...editingWCU, badge: e.target.value })} style={{ ...inputBase }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Heading</label>
                <input value={editingWCU.heading} onChange={e => setEditingWCU({ ...editingWCU, heading: e.target.value })} style={{ ...inputBase }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Description</label>
                <textarea rows={3} value={editingWCU.description} onChange={e => setEditingWCU({ ...editingWCU, description: e.target.value })} style={{ ...inputBase, minHeight: 80 }} />
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h4 style={{ color: '#fff', fontWeight: 800 }}>Items ({editingWCU.items.length})</h4>
                  <button onClick={addEditingItem} style={{ ...btnSecondary, fontSize: 12 }}>+ Add Item</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {editingWCU.items.map((it, idx) => (
                    <div key={idx} style={{ padding: 12, background: 'rgba(15, 23, 42, 0.4)', borderRadius: 12, border: '1px solid rgba(51, 65, 85, 0.5)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ color: '#d4af37', fontWeight: 700 }}>Item {idx + 1}</span>
                        <button onClick={() => removeEditingItem(idx)} style={{ ...btnSecondary, fontSize: 12, background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>Remove</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>Icon</label>
                          <input value={it.icon} onChange={e => setEditingItemField(idx, 'icon', e.target.value)} style={{ ...inputBase }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>Title</label>
                          <input value={it.title} onChange={e => setEditingItemField(idx, 'title', e.target.value)} style={{ ...inputBase }} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', marginBottom: 6, fontSize: 12 }}>Description</label>
                          <textarea rows={2} value={it.description} onChange={e => setEditingItemField(idx, 'description', e.target.value)} style={{ ...inputBase, minHeight: 60 }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditOpen(false)} style={{ ...btnSecondary }}>Cancel</button>
              <button onClick={applyEditModal} style={{ ...btnPrimary, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>Apply</button>
            </div>
          </div>
        </div>
      )}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6 }}>Language</label>
              <select 
                value={lang} 
                onChange={e => setLang(e.target.value as Lang)} 
                style={{ ...inputBase, padding: '10px 14px', width: 160, fontWeight: 700, cursor: 'pointer' }}
                onFocus={(e) => Object.assign(e.target, { ...inputFocus, border: '1px solid rgba(212, 175, 55, 0.6)' })}
                onBlur={(e) => Object.assign(e.target, inputBase)}
              >
                <option value="en">English</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            {!hasToken && (
              <input 
                placeholder="Admin Token" 
                value={token} 
                onChange={e => setToken(e.target.value)} 
                type="password"
                style={{ ...inputBase, width: 220 }}
                onFocus={(e) => Object.assign(e.target, inputFocus)}
                onBlur={(e) => Object.assign(e.target, inputBase)}
              />
            )}
            <button 
              onClick={() => load()} 
              style={{ ...btnPrimary }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = btnPrimary.boxShadow; }}
            >
              ↻ Refresh
            </button>
            {whyChooseUs && (
              <button 
                onClick={openEditModal}
                style={{ ...btnPrimary, background: 'linear-gradient(135deg, #d4af37 0%, #b68c21 100%)' }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.45)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = btnPrimary.boxShadow; }}
              >
                ✎ Edit (Modal)
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, minHeight: 20 }}>
        {loading && <span style={{ color: '#94a3b8' }}>Loading…</span>}
        {error && <span style={{ color: '#f87171' }}>{error}</span>}
      </div>

      {whyChooseUs ? (
        <div style={{ ...card }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Badge</label>
              <input 
                value={whyChooseUs.badge} 
                onChange={e => setWhyChooseUsField('badge', e.target.value)} 
                style={{ ...inputBase }}
                onFocus={(e) => Object.assign(e.target, inputFocus)}
                onBlur={(e) => Object.assign(e.target, inputBase)}
              />
              {validationErrors.badge && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors.badge}</div>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Heading</label>
              <input 
                value={whyChooseUs.heading} 
                onChange={e => setWhyChooseUsField('heading', e.target.value)} 
                style={{ ...inputBase }}
                onFocus={(e) => Object.assign(e.target, inputFocus)}
                onBlur={(e) => Object.assign(e.target, inputBase)}
              />
              {validationErrors.heading && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors.heading}</div>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
              <textarea 
                value={whyChooseUs.description} 
                onChange={e => setWhyChooseUsField('description', e.target.value)} 
                rows={3}
                style={{ ...inputBase, minHeight: 80, resize: 'vertical' }}
                onFocus={(e) => Object.assign(e.target, inputFocus)}
                onBlur={(e) => Object.assign(e.target, inputBase)}
              />
              {validationErrors.description && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors.description}</div>}
            </div>
            <div style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Items ({whyChooseUs.items.length})</h3>
                <button 
                  onClick={addItem}
                  style={{ ...btnSecondary, fontSize: 12, padding: '8px 12px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(17, 24, 39, 0.8)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = btnSecondary.background; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  + Add Item
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {whyChooseUs.items.map((item, idx) => (
                  <div key={idx} style={{ padding: 16, background: 'rgba(15, 23, 42, 0.4)', borderRadius: 12, border: '1px solid rgba(51, 65, 85, 0.5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#d4af37' }}>Item {idx + 1}</span>
                      <button 
                        onClick={() => removeItem(idx)}
                        style={{ ...btnSecondary, fontSize: 12, padding: '6px 10px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                      >
                        Remove
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#94a3b8' }}>Icon (Lucide icon name)</label>
                        <input 
                          value={item.icon} 
                          onChange={e => setItemField(idx, 'icon', e.target.value)} 
                          style={{ ...inputBase, fontSize: 13 }}
                          onFocus={(e) => Object.assign(e.target, inputFocus)}
                          onBlur={(e) => Object.assign(e.target, inputBase)}
                        />
                        {validationErrors[`item_${idx}_icon`] && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors[`item_${idx}_icon`]}</div>}
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#94a3b8' }}>Title</label>
                        <input 
                          value={item.title} 
                          onChange={e => setItemField(idx, 'title', e.target.value)} 
                          style={{ ...inputBase, fontSize: 13 }}
                          onFocus={(e) => Object.assign(e.target, inputFocus)}
                          onBlur={(e) => Object.assign(e.target, inputBase)}
                        />
                        {validationErrors[`item_${idx}_title`] && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors[`item_${idx}_title`]}</div>}
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#94a3b8' }}>Description</label>
                        <textarea 
                          value={item.description} 
                          onChange={e => setItemField(idx, 'description', e.target.value)} 
                          rows={2}
                          style={{ ...inputBase, fontSize: 13, minHeight: 60, resize: 'vertical' }}
                          onFocus={(e) => Object.assign(e.target, inputFocus)}
                          onBlur={(e) => Object.assign(e.target, inputBase)}
                        />
                        {validationErrors[`item_${idx}_description`] && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors[`item_${idx}_description`]}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setWhyChooseUs(originalWhyChooseUs ? JSON.parse(JSON.stringify(originalWhyChooseUs)) : null)} 
                disabled={!isDirty}
                style={{ ...btnSecondary, opacity: isDirty ? 1 : 0.5, cursor: isDirty ? 'pointer' : 'not-allowed' }}
                onMouseEnter={(e) => isDirty && (e.currentTarget.style.background = 'rgba(17, 24, 39, 0.8)')}
                onMouseLeave={(e) => { e.currentTarget.style.background = btnSecondary.background; }}
              >
                Revert
              </button>
              <button 
                onClick={onSave} 
                disabled={!hasToken || !isDirty || saving || !isValid}
                style={{ ...btnPrimary, opacity: hasToken && isDirty && !saving && isValid ? 1 : 0.5, cursor: hasToken && isDirty && !saving && isValid ? 'pointer' : 'not-allowed' }}
                onMouseEnter={(e) => {
                  if (hasToken && isDirty && !saving && isValid) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.5)';
                  }
                }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = btnPrimary.boxShadow; }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ ...card, textAlign: 'center', padding: 40 }}>
          <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 20 }}>No Why Choose Us content found for {lang}. Create one below.</p>
          <button 
            onClick={() => {
              const defaultWhyChooseUs: WhyChooseUs = {
                badge: lang === 'de' ? 'Warum wir' : 'Why Choose Us',
                heading: lang === 'de' ? 'Ihre Überschrift' : 'Your Heading',
                description: lang === 'de' ? 'Ihre Beschreibung' : 'Your description',
                items: [
                  { icon: 'Award', title: 'Item 1', description: 'Description 1' },
                  { icon: 'Target', title: 'Item 2', description: 'Description 2' },
                ],
              };
              setWhyChooseUs(defaultWhyChooseUs);
            }}
            style={{ ...btnPrimary }}
          >
            Create Default Content
          </button>
        </div>
      )}

      {toast && (
        <div style={{ 
          position: 'fixed', 
          right: 20, 
          bottom: 20, 
          background: toast.type==='success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
          color: toast.type==='success' ? '#34d399' : '#f87171', 
          border: `1px solid ${toast.type==='success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, 
          borderRadius: 12, 
          padding: '14px 18px', 
          fontWeight: 600,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 1000
        }}>
          <span style={{ fontSize: 20 }}>{toast.type==='success' ? '✓' : '⚠'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {isDirty && (
        <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, padding: '10px 16px', background: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(51,65,85,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, zIndex: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 13 }}>
            <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(234,179,8,0.15)', color: '#facc15', border: '1px solid rgba(234,179,8,0.25)', fontWeight: 700 }}>Unsaved changes</span>
            {!isValid && (
              <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', fontWeight: 700 }}>
                {Object.keys(validationErrors).length} error(s)
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              onClick={() => setWhyChooseUs(originalWhyChooseUs ? JSON.parse(JSON.stringify(originalWhyChooseUs)) : null)}
              style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(17,24,39,0.6)', color: '#cbd5e1', fontWeight: 600, fontSize: 13, border: '1px solid rgba(55,65,81,0.6)' }}
            >
              Revert
            </button>
            <button 
              onClick={onSave} 
              disabled={!hasToken || saving || !isValid}
              style={{ padding: '10px 16px', borderRadius: 10, background: hasToken && !saving && isValid ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'rgba(17,24,39,0.6)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', opacity: hasToken && !saving && isValid ? 1 : 0.6, cursor: hasToken && !saving && isValid ? 'pointer' : 'not-allowed', boxShadow: hasToken && !saving && isValid ? '0 4px 12px rgba(34,197,94,0.3)' : 'none' }}
            >
              {saving ? 'Saving…' : 'Save' }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

