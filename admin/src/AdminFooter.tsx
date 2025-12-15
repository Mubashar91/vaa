import { useCallback, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'de';

interface Footer {
  _id?: string;
  companyName: string;
  copyright: string;
  links: Array<{ label: string; url: string }>;
  socialLinks: Array<{ platform: string; url: string; icon: string }>;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
}

const API_BASE =
  ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_API_BASE ||
  'http://localhost:5001';

export default function AdminFooter() {
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

  const [footer, setFooter] = useState<Footer | null>(null);
  const [originalFooter, setOriginalFooter] = useState<Footer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingFooter, setEditingFooter] = useState<Footer | null>(null);

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
      const res = await fetch(`${API_BASE}/api/admin/footer?lang=${lang}`, { headers: headers() });
      if (res.status === 401) {
        try { localStorage.removeItem('adminToken'); } catch (e) { void e; }
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) {
        if (res.status === 404) {
          setFooter(null);
          setOriginalFooter(null);
          return;
        }
        throw new Error(`Failed: ${res.status}`);
      }
      const data = await res.json();
      const f: Footer | null = data.footer || null;
      setFooter(f);
      setOriginalFooter(f ? JSON.parse(JSON.stringify(f)) : null);
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

  const setFooterField = (key: keyof Footer, value: Footer[keyof Footer]) => {
    if (!footer) return;
    setFooter({ ...footer, [key]: value });
  };

  const setContactField = (key: string, value: string) => {
    if (!footer) return;
    setFooter({ ...footer, contact: { ...footer.contact, [key]: value } });
  };

  const setLinkField = (idx: number, key: string, value: string) => {
    if (!footer) return;
    const newLinks = [...footer.links];
    newLinks[idx] = { ...newLinks[idx], [key]: value };
    setFooter({ ...footer, links: newLinks });
  };

  const setSocialLinkField = (idx: number, key: string, value: string) => {
    if (!footer) return;
    const newLinks = [...footer.socialLinks];
    newLinks[idx] = { ...newLinks[idx], [key]: value };
    setFooter({ ...footer, socialLinks: newLinks });
  };

  // Modal helpers for working copy editing
  const openEditModal = () => {
    if (!footer) return;
    setEditingFooter(JSON.parse(JSON.stringify(footer)) as Footer);
    setEditOpen(true);
  };
  const applyEditModal = () => {
    if (editingFooter) setFooter(editingFooter);
    setEditOpen(false);
  };
  const addEditingLink = () => {
    if (!editingFooter) return;
    setEditingFooter({ ...editingFooter, links: [...(editingFooter.links || []), { label: '', url: '' }] });
  };
  const setEditingLinkField = (idx: number, key: string, value: string) => {
    if (!editingFooter) return;
    const links = [...(editingFooter.links || [])];
    links[idx] = { ...links[idx], [key]: value };
    setEditingFooter({ ...editingFooter, links });
  };
  const removeEditingLink = (idx: number) => {
    if (!editingFooter) return;
    setEditingFooter({ ...editingFooter, links: editingFooter.links.filter((_, i) => i !== idx) });
  };
  const addEditingSocial = () => {
    if (!editingFooter) return;
    setEditingFooter({ ...editingFooter, socialLinks: [...(editingFooter.socialLinks || []), { platform: '', url: '', icon: '' }] });
  };
  const setEditingSocialField = (idx: number, key: string, value: string) => {
    if (!editingFooter) return;
    const arr = [...(editingFooter.socialLinks || [])];
    arr[idx] = { ...arr[idx], [key]: value };
    setEditingFooter({ ...editingFooter, socialLinks: arr });
  };
  const removeEditingSocial = (idx: number) => {
    if (!editingFooter) return;
    setEditingFooter({ ...editingFooter, socialLinks: editingFooter.socialLinks.filter((_, i) => i !== idx) });
  };

  const addLink = () => {
    if (!footer) return;
    setFooter({ ...footer, links: [...footer.links, { label: '', url: '' }] });
  };

  const removeLink = (idx: number) => {
    if (!footer) return;
    setFooter({ ...footer, links: footer.links.filter((_, i) => i !== idx) });
  };

  const addSocialLink = () => {
    if (!footer) return;
    setFooter({ ...footer, socialLinks: [...footer.socialLinks, { platform: '', url: '', icon: '' }] });
  };

  const removeSocialLink = (idx: number) => {
    if (!footer) return;
    setFooter({ ...footer, socialLinks: footer.socialLinks.filter((_, i) => i !== idx) });
  };

  const isDirty = useMemo(() => {
    if (!footer || !originalFooter) return !!footer;
    return JSON.stringify(footer) !== JSON.stringify(originalFooter);
  }, [footer, originalFooter]);

  const onSave = async () => {
    if (!footer || !hasToken) return alert('Footer data and token required');
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/footer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({ lang, footer }),
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      await load();
      pushToast('Footer saved successfully');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const card = { background: 'rgba(30, 41, 59, 0.4)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: 16, padding: 20, boxShadow: '0 10px 40px rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)' } as const;
  const inputBase = { padding: '10px 14px', border: '1px solid rgba(51, 65, 85, 0.6)', background: 'rgba(15, 23, 42, 0.6)', color: '#e2e8f0', borderRadius: 12, outline: 'none', transition: 'all 0.2s', fontSize: 14, width: '100%' } as const;
  const inputFocus = { border: '1px solid rgba(212, 175, 55, 0.5)', background: 'rgba(15, 23, 42, 0.8)', boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.1)' } as const;
  const btnPrimary = { padding: '10px 16px', borderRadius: 10, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' } as const;
  const btnSecondary = { padding: '10px 16px', borderRadius: 10, background: 'rgba(17, 24, 39, 0.6)', color: '#cbd5e1', fontWeight: 600, fontSize: 14, border: '1px solid rgba(55, 65, 81, 0.6)', cursor: 'pointer', transition: 'all 0.2s' } as const;

  return (
    <div style={{ padding: 0, maxWidth: '100%', margin: '0 auto', color: '#e2e8f0' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 5, height: 40, background: 'linear-gradient(to bottom, #d4af37, #fbbf24, #d4af37)', borderRadius: 3, boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' }}></div>
          <div>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 6, letterSpacing: -0.8, color: '#fff', background: 'linear-gradient(135deg, #fff 0%, #e2e8f0 50%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
              Footer Management
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 16, fontWeight: 500 }}>Manage footer content for English and German languages</p>
          </div>
        </div>
      </div>

      <div style={{ ...card, marginBottom: 20, display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Language
          </label>
          <select 
            value={lang} 
            onChange={e => setLang(e.target.value as Lang)} 
            style={{ ...inputBase, padding: '10px 14px', width: 180, fontWeight: 600, cursor: 'pointer' }}
            onFocus={(e) => Object.assign(e.target, { ...inputFocus, border: '1px solid rgba(212, 175, 55, 0.6)' })}
            onBlur={(e) => Object.assign(e.target, inputBase)}
          >
            <option value="en">🇬🇧 English</option>
            <option value="de">🇩🇪 Deutsch</option>
          </select>
        </div>
        {loading && <span style={{ color: '#94a3b8' }}>Loading…</span>}
        {error && <span style={{ color: '#f87171' }}>{error}</span>}
        <button 
          onClick={() => load()} 
          style={{ ...btnPrimary }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.5)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = btnPrimary.boxShadow; }}
        >
          ↻ Refresh
        </button>
      </div>

      {footer ? (
        <div style={{ ...card }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Company Name</label>
                <input 
                  value={footer.companyName} 
                  onChange={e => setFooterField('companyName', e.target.value)} 
                  style={{ ...inputBase }}
                  onFocus={(e) => Object.assign(e.target, inputFocus)}
                  onBlur={(e) => Object.assign(e.target, inputBase)}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Copyright</label>
                <input 
                  value={footer.copyright} 
                  onChange={e => setFooterField('copyright', e.target.value)} 
                  style={{ ...inputBase }}
                  onFocus={(e) => Object.assign(e.target, inputFocus)}
                  onBlur={(e) => Object.assign(e.target, inputBase)}
                />
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)', paddingTop: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Contact Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                  <input 
                    value={footer.contact.email} 
                    onChange={e => setContactField('email', e.target.value)} 
                    style={{ ...inputBase }}
                    onFocus={(e) => Object.assign(e.target, inputFocus)}
                    onBlur={(e) => Object.assign(e.target, inputBase)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</label>
                  <input 
                    value={footer.contact.phone} 
                    onChange={e => setContactField('phone', e.target.value)} 
                    style={{ ...inputBase }}
                    onFocus={(e) => Object.assign(e.target, inputFocus)}
                    onBlur={(e) => Object.assign(e.target, inputBase)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</label>
                  <input 
                    value={footer.contact.address} 
                    onChange={e => setContactField('address', e.target.value)} 
                    style={{ ...inputBase }}
                    onFocus={(e) => Object.assign(e.target, inputFocus)}
                    onBlur={(e) => Object.assign(e.target, inputBase)}
                  />
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Links ({footer.links.length})</h3>
                <button 
                  onClick={addLink}
                  style={{ ...btnSecondary, fontSize: 12, padding: '8px 12px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(17, 24, 39, 0.8)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = btnSecondary.background; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  + Add Link
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {footer.links.map((link, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input 
                      placeholder="Label" 
                      value={link.label} 
                      onChange={e => setLinkField(idx, 'label', e.target.value)} 
                      style={{ ...inputBase, flex: 1, fontSize: 13 }}
                      onFocus={(e) => Object.assign(e.target, inputFocus)}
                      onBlur={(e) => Object.assign(e.target, inputBase)}
                    />
                    <input 
                      placeholder="URL" 
                      value={link.url} 
                      onChange={e => setLinkField(idx, 'url', e.target.value)} 
                      style={{ ...inputBase, flex: 2, fontSize: 13 }}
                      onFocus={(e) => Object.assign(e.target, inputFocus)}
                      onBlur={(e) => Object.assign(e.target, inputBase)}
                    />
                    <button 
                      onClick={() => removeLink(idx)}
                      style={{ ...btnSecondary, fontSize: 12, padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(51, 65, 85, 0.5)', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Social Links ({footer.socialLinks.length})</h3>
                <button 
                  onClick={addSocialLink}
                  style={{ ...btnSecondary, fontSize: 12, padding: '8px 12px' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(17, 24, 39, 0.8)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = btnSecondary.background; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  + Add Social Link
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {footer.socialLinks.map((social, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input 
                      placeholder="Platform" 
                      value={social.platform} 
                      onChange={e => setSocialLinkField(idx, 'platform', e.target.value)} 
                      style={{ ...inputBase, flex: 1, fontSize: 13 }}
                      onFocus={(e) => Object.assign(e.target, inputFocus)}
                      onBlur={(e) => Object.assign(e.target, inputBase)}
                    />
                    <input 
                      placeholder="Icon (Lucide name)" 
                      value={social.icon} 
                      onChange={e => setSocialLinkField(idx, 'icon', e.target.value)} 
                      style={{ ...inputBase, flex: 1, fontSize: 13 }}
                      onFocus={(e) => Object.assign(e.target, inputFocus)}
                      onBlur={(e) => Object.assign(e.target, inputBase)}
                    />
                    <input 
                      placeholder="URL" 
                      value={social.url} 
                      onChange={e => setSocialLinkField(idx, 'url', e.target.value)} 
                      style={{ ...inputBase, flex: 2, fontSize: 13 }}
                      onFocus={(e) => Object.assign(e.target, inputFocus)}
                      onBlur={(e) => Object.assign(e.target, inputBase)}
                    />
                    <button 
                      onClick={() => removeSocialLink(idx)}
                      style={{ ...btnSecondary, fontSize: 12, padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setFooter(originalFooter ? JSON.parse(JSON.stringify(originalFooter)) : null)} 
                disabled={!isDirty}
                style={{ ...btnSecondary, opacity: isDirty ? 1 : 0.5, cursor: isDirty ? 'pointer' : 'not-allowed' }}
                onMouseEnter={(e) => isDirty && (e.currentTarget.style.background = 'rgba(17, 24, 39, 0.8)')}
                onMouseLeave={(e) => { e.currentTarget.style.background = btnSecondary.background; }}
              >
                Revert
              </button>
              <button 
                onClick={onSave} 
                disabled={!hasToken || !isDirty || saving}
                style={{ ...btnPrimary, opacity: hasToken && isDirty && !saving ? 1 : 0.5, cursor: hasToken && isDirty && !saving ? 'pointer' : 'not-allowed' }}
                onMouseEnter={(e) => {
                  if (hasToken && isDirty && !saving) {
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
        <div style={{ background: card.background, border: card.border, borderRadius: card.borderRadius, padding: 40, boxShadow: card.boxShadow, backdropFilter: card.backdropFilter, textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 20 }}>No footer content found for {lang}. Create one below.</p>
          <button 
            onClick={() => {
              const defaultFooter: Footer = {
                companyName: 'Don Va',
                copyright: lang === 'de' ? '© 2025 Don Va. Alle Rechte vorbehalten.' : '© 2025 Don Va. All rights reserved.',
                links: [
                  { label: 'Privacy', url: '/privacy' },
                  { label: 'Terms', url: '/terms' },
                ],
                socialLinks: [],
                contact: {
                  email: '',
                  phone: '',
                  address: '',
                },
              };
              setFooter(defaultFooter);
            }}
            style={{ ...btnPrimary }}
          >
            Create Default Footer
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
    </div>
  );
}

