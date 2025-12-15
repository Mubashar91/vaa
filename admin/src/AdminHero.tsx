import { useCallback, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'de';

interface Hero {
  _id?: string;
  title: string;
  subtitle: string;
  tagline: string;
  image: string;
  ctaPrimary: string;
  urgency: string;
  stats: {
    clients: string;
    costSaved: string;
    rating: string;
  };
}

const API_BASE =
  ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_API_BASE ||
  'http://localhost:5001';

export default function AdminHero() {
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

  const [hero, setHero] = useState<Hero | null>(null);
  const [originalHero, setOriginalHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirtyGuard, setDirtyGuard] = useState(false);
  // Modal-based edit UX
  const [editOpen, setEditOpen] = useState(false);
  const [editingHero, setEditingHero] = useState<Hero | null>(null);

  const validate = useCallback((h: Hero | null) => {
    const errs: Record<string, string> = {};
    if (!h) return errs;
    if (!h.title?.trim()) errs.title = 'Title is required';
    if (!h.subtitle?.trim()) errs.subtitle = 'Subtitle is required';
    if (!h.tagline?.trim()) errs.tagline = 'Tagline is required';
    if (!h.ctaPrimary?.trim()) errs.ctaPrimary = 'CTA is required';
    if (!h.urgency?.trim()) errs.urgency = 'Urgency is required';
    if (!h.image?.trim()) {
      errs.image = 'Image URL is required';
    } else if (!/^https?:\/\//i.test(h.image)) {
      errs.image = 'Image must be a valid URL starting with http(s)';
    }
    if (!h.stats?.clients?.trim()) errs.clients = 'Clients is required';
    if (!h.stats?.costSaved?.trim()) errs.costSaved = 'Cost saved is required';
    if (!h.stats?.rating?.trim()) errs.rating = 'Rating is required';
    return errs;
  }, []);

  const validationErrors = useMemo(() => validate(hero), [hero, validate]);
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
      const res = await fetch(`${API_BASE}/api/admin/hero?lang=${lang}`, { headers: headers() });
      if (!res.ok) {
        if (res.status === 404) {
          setHero(null);
          setOriginalHero(null);
          return;
        }
        throw new Error(`Failed: ${res.status}`);
      }
      const data = await res.json();
      const h: Hero | null = data.hero || null;
      setHero(h);
      setOriginalHero(h ? JSON.parse(JSON.stringify(h)) : null);
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

  const setHeroField = (key: keyof Hero, value: Hero[keyof Hero]) => {
    if (!hero) return;
    setHero({ ...hero, [key]: value });
  };

  // Open modal with a working copy
  const openEditModal = () => {
    setEditingHero(hero ? JSON.parse(JSON.stringify(hero)) as Hero : {
      title: '', subtitle: '', tagline: '', image: '', ctaPrimary: '', urgency: '',
      stats: { clients: '', costSaved: '', rating: '' }
    });
    setEditOpen(true);
  };

  const applyEditModal = () => {
    if (editingHero) {
      setHero(editingHero);
    }
    setEditOpen(false);
  };

  const setStatField = (key: string, value: string) => {
    if (!hero) return;
    setHero({ ...hero, stats: { ...hero.stats, [key]: value } });
  };

  const isDirty = useMemo(() => {
    if (!hero || !originalHero) return !!hero;
    return JSON.stringify(hero) !== JSON.stringify(originalHero);
  }, [hero, originalHero]);

  const onSave = useCallback(async () => {
    if (!hero || !hasToken) return alert('Hero data and token required');
    if (!isValid) return alert('Please fix validation errors before saving');
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/hero`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({ lang, hero }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      await load();
      pushToast('Hero saved successfully');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [hero, hasToken, isValid, headers, lang, load]);

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

  return (
    <div style={{ padding: 20, maxWidth: 980, margin: '0 auto', color: '#e2e8f0' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 50, margin: '-20px -20px 24px -20px', padding: '14px 20px', backdropFilter: 'blur(10px)', background: 'rgba(2,6,23,0.6)', borderBottom: '1px solid rgba(51,65,85,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 6, height: 28, background: 'linear-gradient(to bottom, #22c55e, #3b82f6)', borderRadius: 3, boxShadow: '0 0 18px rgba(34,197,94,0.25)' }} />
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.3, color: '#fff' }}>Hero Section</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#94a3b8', fontSize: 12 }}>
                <span>Manage content per language</span>
                <span style={{ opacity: 0.6 }}>•</span>
                <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(14,165,233,0.15)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.25)', fontWeight: 700 }}>{lang.toUpperCase()}</span>
                {isDirty && (
                  <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(234,179,8,0.15)', color: '#facc15', border: '1px solid rgba(234,179,8,0.25)', fontWeight: 700 }}>Unsaved</span>
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
            <button 
              onClick={openEditModal}
              style={{ ...btnPrimary, background: 'linear-gradient(135deg, #d4af37 0%, #b68c21 100%)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(212, 175, 55, 0.45)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = btnPrimary.boxShadow; }}
            >
              ✎ Edit Hero (Modal)
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, minHeight: 20 }}>
        {loading && <span style={{ color: '#94a3b8' }}>Loading…</span>}
        {error && <span style={{ color: '#f87171' }}>{error}</span>}
      </div>

      {hero ? (
        <div style={{ ...card }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Title</label>
              <input 
                value={hero.title} 
                onChange={e => setHeroField('title', e.target.value)} 
                style={{ ...inputBase }}
                onFocus={(e) => Object.assign(e.target, inputFocus)}
                onBlur={(e) => Object.assign(e.target, inputBase)}
              />
              {validationErrors.title && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors.title}</div>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subtitle</label>
              <textarea 
                value={hero.subtitle} 
                onChange={e => setHeroField('subtitle', e.target.value)} 
                rows={3}
                style={{ ...inputBase, minHeight: 80, resize: 'vertical' }}
                onFocus={(e) => Object.assign(e.target, inputFocus)}
                onBlur={(e) => Object.assign(e.target, inputBase)}
              />
              {validationErrors.subtitle && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors.subtitle}</div>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tagline</label>
              <input 
                value={hero.tagline} 
                onChange={e => setHeroField('tagline', e.target.value)} 
                style={{ ...inputBase }}
                onFocus={(e) => Object.assign(e.target, inputFocus)}
                onBlur={(e) => Object.assign(e.target, inputBase)}
              />
              {validationErrors.tagline && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors.tagline}</div>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Image URL</label>
              <input 
                value={hero.image} 
                onChange={e => setHeroField('image', e.target.value)} 
                style={{ ...inputBase }}
                onFocus={(e) => Object.assign(e.target, inputFocus)}
                onBlur={(e) => Object.assign(e.target, inputBase)}
              />
              {validationErrors.image && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors.image}</div>}
              {!!hero.image?.trim() && /^https?:\/\//i.test(hero.image) && (
                <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(51, 65, 85, 0.6)' }}>
                  <img src={hero.image} alt="Preview" style={{ display: 'block', width: '100%', maxHeight: 220, objectFit: 'cover' }} />
                </div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CTA Primary</label>
                <input 
                  value={hero.ctaPrimary} 
                  onChange={e => setHeroField('ctaPrimary', e.target.value)} 
                  style={{ ...inputBase }}
                  onFocus={(e) => Object.assign(e.target, inputFocus)}
                  onBlur={(e) => Object.assign(e.target, inputBase)}
                />
                {validationErrors.ctaPrimary && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors.ctaPrimary}</div>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Urgency Text</label>
                <input 
                  value={hero.urgency} 
                  onChange={e => setHeroField('urgency', e.target.value)} 
                  style={{ ...inputBase }}
                  onFocus={(e) => Object.assign(e.target, inputFocus)}
                  onBlur={(e) => Object.assign(e.target, inputBase)}
                />
                {validationErrors.urgency && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors.urgency}</div>}
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)', paddingTop: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Statistics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clients</label>
                  <input 
                    value={hero.stats.clients} 
                    onChange={e => setStatField('clients', e.target.value)} 
                    style={{ ...inputBase }}
                    onFocus={(e) => Object.assign(e.target, inputFocus)}
                    onBlur={(e) => Object.assign(e.target, inputBase)}
                  />
                  {validationErrors.clients && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors.clients}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cost Saved</label>
                  <input 
                    value={hero.stats.costSaved} 
                    onChange={e => setStatField('costSaved', e.target.value)} 
                    style={{ ...inputBase }}
                    onFocus={(e) => Object.assign(e.target, inputFocus)}
                    onBlur={(e) => Object.assign(e.target, inputBase)}
                  />
                  {validationErrors.costSaved && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors.costSaved}</div>}
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating</label>
                  <input 
                    value={hero.stats.rating} 
                    onChange={e => setStatField('rating', e.target.value)} 
                    style={{ ...inputBase }}
                    onFocus={(e) => Object.assign(e.target, inputFocus)}
                    onBlur={(e) => Object.assign(e.target, inputBase)}
                  />
                  {validationErrors.rating && <div style={{ color: '#f87171', fontSize: 12, marginTop: 6 }}>{validationErrors.rating}</div>}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setHero(originalHero ? JSON.parse(JSON.stringify(originalHero)) : null)} 
                disabled={!isDirty}
                style={{ ...btnPrimary, opacity: isDirty ? 1 : 0.5, cursor: isDirty ? 'pointer' : 'not-allowed', background: 'rgba(17, 24, 39, 0.6)', border: '1px solid rgba(55, 65, 81, 0.6)' }}
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
          <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 20 }}>No hero content found for {lang}. Create one below.</p>
          <button 
            onClick={() => {
              const defaultHero: Hero = {
                title: lang === 'de' ? 'Ihr Titel hier' : 'Your Title Here',
                subtitle: lang === 'de' ? 'Ihre Untertitel hier' : 'Your subtitle here',
                tagline: lang === 'de' ? 'Ihr Tagline' : 'Your Tagline',
                image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&h=900&fit=crop&q=80',
                ctaPrimary: lang === 'de' ? 'Jetzt starten' : 'Get Started',
                urgency: lang === 'de' ? 'Begrenztes Angebot' : 'Limited Offer',
                stats: {
                  clients: '200+',
                  costSaved: '70%',
                  rating: '4.9/5',
                },
              };
              setHero(defaultHero);
            }}
            style={{ ...btnPrimary }}
          >
            Create Default Hero
          </button>
        </div>
      )}

      {editOpen && editingHero && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100 }} onClick={() => setEditOpen(false)}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} />
          <div style={{ position: 'relative', background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(51,65,85,0.6)', borderRadius: 16, padding: 20, maxWidth: 920, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Edit Hero</h3>
              <button onClick={() => setEditOpen(false)} style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(17,24,39,0.6)', color: '#cbd5e1', border: '1px solid rgba(55,65,81,0.6)' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Title</label>
                <input value={editingHero.title} onChange={e => setEditingHero({ ...editingHero, title: e.target.value })} style={{ ...inputBase }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Subtitle</label>
                <input value={editingHero.subtitle} onChange={e => setEditingHero({ ...editingHero, subtitle: e.target.value })} style={{ ...inputBase }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Tagline</label>
                <input value={editingHero.tagline} onChange={e => setEditingHero({ ...editingHero, tagline: e.target.value })} style={{ ...inputBase }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Image URL</label>
                <input value={editingHero.image} onChange={e => setEditingHero({ ...editingHero, image: e.target.value })} style={{ ...inputBase }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Primary CTA</label>
                <input value={editingHero.ctaPrimary} onChange={e => setEditingHero({ ...editingHero, ctaPrimary: e.target.value })} style={{ ...inputBase }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Urgency</label>
                <input value={editingHero.urgency} onChange={e => setEditingHero({ ...editingHero, urgency: e.target.value })} style={{ ...inputBase }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Stats: Clients</label>
                <input value={editingHero.stats.clients} onChange={e => setEditingHero({ ...editingHero, stats: { ...editingHero.stats, clients: e.target.value } })} style={{ ...inputBase }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Stats: Cost Saved</label>
                <input value={editingHero.stats.costSaved} onChange={e => setEditingHero({ ...editingHero, stats: { ...editingHero.stats, costSaved: e.target.value } })} style={{ ...inputBase }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>Stats: Rating</label>
                <input value={editingHero.stats.rating} onChange={e => setEditingHero({ ...editingHero, stats: { ...editingHero.stats, rating: e.target.value } })} style={{ ...inputBase }} />
              </div>
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditOpen(false)} style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(17,24,39,0.6)', color: '#cbd5e1', fontWeight: 600, border: '1px solid rgba(55,65,81,0.6)' }}>Cancel</button>
              <button onClick={applyEditModal} style={{ ...btnPrimary, background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }}>Apply</button>
            </div>
          </div>
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
              onClick={() => setHero(originalHero ? JSON.parse(JSON.stringify(originalHero)) : null)}
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

