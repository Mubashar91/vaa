import { useCallback, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'de';

interface CaseStudy {
  _id?: string;
  caseStudyId: number;
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: Array<{ metric: string; value: string; description: string }>;
  testimonial: string;
  testimonialAuthor: string;
  testimonialRole: string;
  image: string;
  stats: { costSaved: string; timeframe: string; vaCount: string };
  order: number;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

const API_BASE =
  ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_API_BASE ||
  'http://localhost:5001';

export default function AdminCaseStudy() {
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

  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [originalCaseStudies, setOriginalCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CaseStudy | null>(null);
  const [query, setQuery] = useState('');
  // Modal edit state similar to other admin pages
  const [editTarget, setEditTarget] = useState<CaseStudy | null>(null);
  const [editingCaseStudy, setEditingCaseStudy] = useState<CaseStudy | null>(null);

  const isDirty = useCallback((idx: number) => {
    if (!originalCaseStudies[idx]) return true;
    return !isEqualCaseStudy(caseStudies[idx], originalCaseStudies[idx]);
  }, [caseStudies, originalCaseStudies]);

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
      const res = await fetch(`${API_BASE}/api/admin/case-studies?lang=${lang}`, { headers: headers() });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      const list: CaseStudy[] = Array.isArray(data.caseStudies) ? data.caseStudies.slice().sort((a: CaseStudy, b: CaseStudy) => a.caseStudyId - b.caseStudyId) : [];
      setCaseStudies(list);
      setOriginalCaseStudies(JSON.parse(JSON.stringify(list)) as CaseStudy[]);
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

  const setCaseStudyField = (idx: number, key: keyof CaseStudy, value: CaseStudy[keyof CaseStudy]) => {
    setCaseStudies(prev => prev.map((c, i) => (i === idx ? { ...c, [key]: value } : c)));
  };

  const setCaseStudyResult = (idx: number, resultIdx: number, key: string, value: string) => {
    setCaseStudies(prev => prev.map((c, i) => {
      if (i !== idx) return c;
      const newResults = [...(c.results || [])];
      newResults[resultIdx] = { ...newResults[resultIdx], [key]: value };
      return { ...c, results: newResults };
    }));
  };

  const setCaseStudyStat = (idx: number, key: string, value: string) => {
    setCaseStudies(prev => prev.map((c, i) => {
      if (i !== idx) return c;
      return { ...c, stats: { ...c.stats, [key]: value } };
    }));
  };

  const validateCore = (c: Pick<CaseStudy, 'caseStudyId'|'title'|'company'|'industry'|'challenge'|'solution'|'testimonial'|'testimonialAuthor'|'testimonialRole'|'image'>) => {
    if (c.caseStudyId < 1) return 'Case Study ID must be at least 1';
    if (!c.title.trim()) return 'Title is required';
    if (!c.company.trim()) return 'Company is required';
    if (!c.industry.trim()) return 'Industry is required';
    if (!c.challenge.trim()) return 'Challenge is required';
    if (!c.solution.trim()) return 'Solution is required';
    if (!c.testimonial.trim()) return 'Testimonial is required';
    if (!c.testimonialAuthor.trim()) return 'Testimonial author is required';
    if (!c.testimonialRole.trim()) return 'Testimonial role is required';
    if (!c.image.trim()) return 'Image URL is required';
    return null;
  };

  const logHttpError = async (res: Response, context: string) => {
    const __ENV = ((import.meta as unknown) as { env?: Record<string, any> }).env || {};
    if (__ENV && __ENV.DEV) {
      let body = '';
      try { body = await res.clone().text(); } catch { /* ignore */ }
      console.error('[AdminCaseStudy] request failed', {
        context,
        url: res.url,
        status: res.status,
        statusText: res.statusText,
      });
      if (body) console.error('[AdminCaseStudy] response body:', body);
    }
  };

  const onSave = async (c: CaseStudy) => {
    const err = validateCore(c);
    if (err) return alert(err);
    if (!hasToken) return alert('Admin token required');
    const updates: Partial<Omit<CaseStudy, 'caseStudyId'>> = {
      title: c.title,
      company: c.company,
      industry: c.industry,
      challenge: c.challenge,
      solution: c.solution,
      results: c.results,
      testimonial: c.testimonial,
      testimonialAuthor: c.testimonialAuthor,
      testimonialRole: c.testimonialRole,
      image: c.image,
      stats: c.stats,
      order: c.order,
      metaTitle: c.metaTitle,
      metaDescription: c.metaDescription,
      metaKeywords: c.metaKeywords,
    };
    const url = `${API_BASE}/api/admin/case-studies/${c.caseStudyId}`;
    setSavingId(c.caseStudyId);
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, updates }),
    });
    if (!res.ok) { await logHttpError(res, `PUT ${url}`); setSavingId(null); return alert('Save failed: ' + res.status); }
    await load();
    pushToast('Case study saved');
    setSavingId(null);
  };

  const onDelete = async (c: CaseStudy) => {
    if (!hasToken) return alert('Admin token required');
    const url = `${API_BASE}/api/admin/case-studies/${c.caseStudyId}?lang=${lang}`;
    const res = await fetch(url, {
      method: 'DELETE', headers: headers()
    });
    if (!res.ok) { await logHttpError(res, `DELETE ${url}`); return alert('Delete failed: ' + res.status); }
    await load();
    pushToast('Case study deleted');
  };

  const [newCaseStudy, setNewCaseStudy] = useState<CaseStudy>({
    caseStudyId: 1, title: '', company: '', industry: '', challenge: '', solution: '', results: [], testimonial: '', testimonialAuthor: '', testimonialRole: '', image: '', stats: { costSaved: '', timeframe: '', vaCount: '' }, order: 0, metaTitle: '', metaDescription: '', metaKeywords: ''
  });

  const prefillSample = () => {
    const caseStudyIdNum = caseStudies.length > 0 ? Math.max(...caseStudies.map(c => c.caseStudyId)) + 1 : 1;
    const sample: CaseStudy = {
      caseStudyId: caseStudyIdNum,
      title: lang === 'de' ? 'Beispiel Erfolgsgeschichte' : 'Sample Success Story',
      company: 'Example Inc',
      industry: lang === 'de' ? 'E-Commerce' : 'E-Commerce',
      challenge: lang === 'de' ? 'Beispiel Herausforderung' : 'Sample challenge',
      solution: lang === 'de' ? 'Beispiel Lösung' : 'Sample solution',
      results: [
        { metric: 'Metric 1', value: 'Value 1', description: 'Description 1' }
      ],
      testimonial: lang === 'de' ? 'Beispiel Testimonial' : 'Sample testimonial',
      testimonialAuthor: 'John Doe',
      testimonialRole: 'CEO',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop',
      stats: { costSaved: '€100K/year', timeframe: '3 months', vaCount: '3 VAs' },
      order: 0,
    };
    setNewCaseStudy(sample);
  };

  const onAdd = async () => {
    if (!hasToken) return alert('Admin token required');
    if (newCaseStudy.caseStudyId < 1) return alert('Case Study ID must be at least 1');
    const existingIds = new Set(caseStudies.map(c => c.caseStudyId));
    if (existingIds.has(newCaseStudy.caseStudyId)) return alert(`Case Study ID ${newCaseStudy.caseStudyId} already exists for ${lang}.`);
    const err = validateCore(newCaseStudy);
    if (err) return alert(err);
    const url = `${API_BASE}/api/admin/case-studies`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, caseStudy: newCaseStudy }),
    });
    if (!res.ok) {
      if (res.status === 409) {
        return alert('This case study ID already exists for the selected language.');
      }
      await logHttpError(res, `POST ${url}`);
      return alert('Add failed: ' + res.status);
    }
    setNewCaseStudy({ caseStudyId: 1, title: '', company: '', industry: '', challenge: '', solution: '', results: [], testimonial: '', testimonialAuthor: '', testimonialRole: '', image: '', stats: { costSaved: '', timeframe: '', vaCount: '' }, order: 0 });
    await load();
    pushToast('Case study added');
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
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: -0.3, color: '#fff' }}>Case Studies Management</h2>
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Manage your success stories for English and German languages</p>
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
        <div style={{ color: '#9ca3af', fontSize: 13 }}>Case Studies: {caseStudies.length}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="Search case studies…" value={query} onChange={e => setQuery(e.target.value)} style={{ ...inputBase, width: 260 }} />
          <button onClick={() => load()} style={btnSecondary}>Refresh</button>
          <button onClick={() => setAddOpen(true)} style={btnPrimary}>Add Case Study</button>
        </div>
      </div>

      <div style={{ ...card, padding: 0, maxHeight: 600, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle }}>ID</th>
              <th style={{ ...thStyle }}>Title</th>
              <th style={{ ...thStyle }}>Company</th>
              <th style={{ ...thStyle }}>Industry</th>
              <th style={{ ...thStyle }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {caseStudies.map((c, idx) => {
              const q = query.trim().toLowerCase();
              const matches = !q || [String(c.caseStudyId), c.title, c.company, c.industry].join(' ').toLowerCase().includes(q);
              return (
              <tr key={c._id || c.caseStudyId} onMouseEnter={() => setHoverRow(idx)} onMouseLeave={() => setHoverRow(r => (r===idx?null:r))} onClick={() => { setEditTarget(c); setEditingCaseStudy({ ...c }); }} style={{ background: hoverRow === idx ? '#0e1a33' : (idx % 2 ? '#0b1426' : 'transparent'), transition: 'background 120ms ease', display: matches ? undefined : 'none', cursor: 'pointer' }}>
                <td style={tdStyle}>
                  <input type="number" min={1} value={c.caseStudyId} onChange={e => setCaseStudyField(idx, 'caseStudyId', Number(e.target.value))} style={{ ...inputBase, width: 80, textAlign: 'center' as const }} />
                </td>
                <td style={tdStyle}>
                  <input value={c.title} onChange={e => setCaseStudyField(idx, 'title', e.target.value)} style={{ ...inputBase, width: '100%' }} />
                </td>
                <td style={tdStyle}>
                  <input value={c.company} onChange={e => setCaseStudyField(idx, 'company', e.target.value)} style={{ ...inputBase, width: 150 }} />
                </td>
                <td style={tdStyle}>
                  <input value={c.industry} onChange={e => setCaseStudyField(idx, 'industry', e.target.value)} style={{ ...inputBase, width: 150 }} />
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => onSave(c)} disabled={!hasToken || !isDirty(idx)} style={{ ...btnPrimary, opacity: hasToken && isDirty(idx) ? 1 : 0.6 }}>{savingId===c.caseStudyId ? 'Saving…' : 'Save'}</button>
                    <button onClick={() => setCaseStudies(prev => prev.map((cc, i) => (i===idx ? { ...originalCaseStudies[idx] } : cc)))} disabled={!isDirty(idx)} style={{ ...btnSecondary, opacity: isDirty(idx) ? 1 : 0.6 }}>Revert</button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(c); }} disabled={!hasToken} style={{ ...btnSecondary, opacity: hasToken ? 1 : 0.6 }}>Delete</button>
                  </div>
                </td>
              </tr>
              );
            })}
            {caseStudies.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No case studies yet. Click "Add Case Study" to create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Expanded view for editing full case study */}
      {caseStudies.map((c, idx) => {
        if (hoverRow !== idx) return null;
        return (
          <details key={c._id || c.caseStudyId} style={{ marginTop: 8, ...card }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700, marginBottom: 8 }}>Edit Full Details: {c.title}</summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Challenge</label>
                <textarea value={c.challenge} onChange={e => setCaseStudyField(idx, 'challenge', e.target.value)} style={{ ...inputBase, width: '100%', minHeight: 60 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Solution</label>
                <textarea value={c.solution} onChange={e => setCaseStudyField(idx, 'solution', e.target.value)} style={{ ...inputBase, width: '100%', minHeight: 60 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Testimonial</label>
                <textarea value={c.testimonial} onChange={e => setCaseStudyField(idx, 'testimonial', e.target.value)} style={{ ...inputBase, width: '100%', minHeight: 60 }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Testimonial Author</label>
                  <input value={c.testimonialAuthor} onChange={e => setCaseStudyField(idx, 'testimonialAuthor', e.target.value)} style={{ ...inputBase, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Testimonial Role</label>
                  <input value={c.testimonialRole} onChange={e => setCaseStudyField(idx, 'testimonialRole', e.target.value)} style={{ ...inputBase, width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Image URL</label>
                <input value={c.image} onChange={e => setCaseStudyField(idx, 'image', e.target.value)} style={{ ...inputBase, width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Stats</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input placeholder="Cost Saved" value={c.stats.costSaved} onChange={e => setCaseStudyStat(idx, 'costSaved', e.target.value)} style={{ ...inputBase, flex: 1 }} />
                  <input placeholder="Timeframe" value={c.stats.timeframe} onChange={e => setCaseStudyStat(idx, 'timeframe', e.target.value)} style={{ ...inputBase, flex: 1 }} />
                  <input placeholder="VA Count" value={c.stats.vaCount} onChange={e => setCaseStudyStat(idx, 'vaCount', e.target.value)} style={{ ...inputBase, flex: 1 }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Results (JSON array)</label>
                <textarea value={JSON.stringify(c.results || [], null, 2)} onChange={e => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setCaseStudyField(idx, 'results', parsed);
                  } catch {
                    // Invalid JSON, don't update
                  }
                }} style={{ ...inputBase, width: '100%', minHeight: 150, fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Order</label>
                <input type="number" value={c.order} onChange={e => setCaseStudyField(idx, 'order', Number(e.target.value))} style={{ ...inputBase, width: 120 }} />
              </div>
            </div>
          </details>
        );
      })}

      {/* Add Case Study Modal */}
      {addOpen && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }} onClick={() => setAddOpen(false)}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: '#0b1220', border: '1px solid #1f2937', borderRadius: 14, padding: 16, maxWidth: 900, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Add New Case Study</h3>
              <button onClick={() => setAddOpen(false)} style={{ ...btnSecondary }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input type="number" placeholder="Case Study ID" min={1} value={newCaseStudy.caseStudyId} onChange={e => setNewCaseStudy({ ...newCaseStudy, caseStudyId: Number((e.target as HTMLInputElement).value) })} style={{ ...inputBase, width: 140 }} />
                <input placeholder="Title" value={newCaseStudy.title} onChange={e => setNewCaseStudy({ ...newCaseStudy, title: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 260px' }} />
                <input placeholder="Company" value={newCaseStudy.company} onChange={e => setNewCaseStudy({ ...newCaseStudy, company: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 200px' }} />
                <input placeholder="Industry" value={newCaseStudy.industry} onChange={e => setNewCaseStudy({ ...newCaseStudy, industry: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 200px' }} />
              </div>
              <textarea rows={2} placeholder="Challenge" value={newCaseStudy.challenge} onChange={e => setNewCaseStudy({ ...newCaseStudy, challenge: (e.target as HTMLTextAreaElement).value })} style={{ ...inputBase, width: '100%', minHeight: 60 }} />
              <textarea rows={2} placeholder="Solution" value={newCaseStudy.solution} onChange={e => setNewCaseStudy({ ...newCaseStudy, solution: (e.target as HTMLTextAreaElement).value })} style={{ ...inputBase, width: '100%', minHeight: 60 }} />
              <textarea rows={2} placeholder="Testimonial" value={newCaseStudy.testimonial} onChange={e => setNewCaseStudy({ ...newCaseStudy, testimonial: (e.target as HTMLTextAreaElement).value })} style={{ ...inputBase, width: '100%', minHeight: 60 }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <input placeholder="Testimonial Author" value={newCaseStudy.testimonialAuthor} onChange={e => setNewCaseStudy({ ...newCaseStudy, testimonialAuthor: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: 1 }} />
                <input placeholder="Testimonial Role" value={newCaseStudy.testimonialRole} onChange={e => setNewCaseStudy({ ...newCaseStudy, testimonialRole: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: 1 }} />
              </div>
              <input placeholder="Image URL" value={newCaseStudy.image} onChange={e => setNewCaseStudy({ ...newCaseStudy, image: (e.target as HTMLInputElement).value })} style={{ ...inputBase, width: '100%' }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <input placeholder="Cost Saved" value={newCaseStudy.stats.costSaved} onChange={e => setNewCaseStudy({ ...newCaseStudy, stats: { ...newCaseStudy.stats, costSaved: (e.target as HTMLInputElement).value } })} style={{ ...inputBase, flex: 1 }} />
                <input placeholder="Timeframe" value={newCaseStudy.stats.timeframe} onChange={e => setNewCaseStudy({ ...newCaseStudy, stats: { ...newCaseStudy.stats, timeframe: (e.target as HTMLInputElement).value } })} style={{ ...inputBase, flex: 1 }} />
                <input placeholder="VA Count" value={newCaseStudy.stats.vaCount} onChange={e => setNewCaseStudy({ ...newCaseStudy, stats: { ...newCaseStudy.stats, vaCount: (e.target as HTMLInputElement).value } })} style={{ ...inputBase, flex: 1 }} />
                <input type="number" placeholder="Order" value={newCaseStudy.order} onChange={e => setNewCaseStudy({ ...newCaseStudy, order: Number((e.target as HTMLInputElement).value) })} style={{ ...inputBase, width: 120 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Results (JSON array)</label>
                <textarea value={JSON.stringify(newCaseStudy.results || [], null, 2)} onChange={e => {
                  try {
                    const parsed = JSON.parse((e.target as HTMLTextAreaElement).value);
                    setNewCaseStudy({ ...newCaseStudy, results: parsed });
                  } catch {
                    // Invalid JSON, don't update
                  }
                }} style={{ ...inputBase, width: '100%', minHeight: 150, fontFamily: 'monospace' }} />
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={prefillSample} style={{ ...btnSecondary }}>Prefill sample</button>
              <button onClick={onAdd} disabled={newCaseStudy.caseStudyId < 1 || !hasToken} style={{ ...btnPrimary, opacity: newCaseStudy.caseStudyId >= 1 && hasToken ? 1 : 0.6 }}>Add Case Study</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Case Study Modal */}
      {editTarget && editingCaseStudy && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }} onClick={() => { setEditTarget(null); setEditingCaseStudy(null); }}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: '#0b1220', border: '1px solid #1f2937', borderRadius: 14, padding: 16, maxWidth: 900, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Edit Case Study (ID: {editTarget.caseStudyId})</h3>
              <button onClick={() => { setEditTarget(null); setEditingCaseStudy(null); }} style={{ ...btnSecondary }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input type="number" value={editingCaseStudy.caseStudyId} disabled style={{ ...inputBase, width: 140, color: '#9ca3af' }} />
                <input placeholder="Title" value={editingCaseStudy.title} onChange={e => setEditingCaseStudy({ ...editingCaseStudy, title: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 260px' }} />
                <input placeholder="Company" value={editingCaseStudy.company} onChange={e => setEditingCaseStudy({ ...editingCaseStudy, company: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 200px' }} />
                <input placeholder="Industry" value={editingCaseStudy.industry} onChange={e => setEditingCaseStudy({ ...editingCaseStudy, industry: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 200px' }} />
              </div>
              <textarea rows={2} placeholder="Challenge" value={editingCaseStudy.challenge} onChange={e => setEditingCaseStudy({ ...editingCaseStudy, challenge: (e.target as HTMLTextAreaElement).value })} style={{ ...inputBase, width: '100%', minHeight: 60 }} />
              <textarea rows={2} placeholder="Solution" value={editingCaseStudy.solution} onChange={e => setEditingCaseStudy({ ...editingCaseStudy, solution: (e.target as HTMLTextAreaElement).value })} style={{ ...inputBase, width: '100%', minHeight: 60 }} />
              <textarea rows={2} placeholder="Testimonial" value={editingCaseStudy.testimonial} onChange={e => setEditingCaseStudy({ ...editingCaseStudy, testimonial: (e.target as HTMLTextAreaElement).value })} style={{ ...inputBase, width: '100%', minHeight: 60 }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <input placeholder="Testimonial Author" value={editingCaseStudy.testimonialAuthor} onChange={e => setEditingCaseStudy({ ...editingCaseStudy, testimonialAuthor: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: 1 }} />
                <input placeholder="Testimonial Role" value={editingCaseStudy.testimonialRole} onChange={e => setEditingCaseStudy({ ...editingCaseStudy, testimonialRole: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: 1 }} />
              </div>
              <input placeholder="Image URL" value={editingCaseStudy.image} onChange={e => setEditingCaseStudy({ ...editingCaseStudy, image: (e.target as HTMLInputElement).value })} style={{ ...inputBase, width: '100%' }} />
              <div style={{ display: 'flex', gap: 10 }}>
                <input placeholder="Cost Saved" value={editingCaseStudy.stats.costSaved} onChange={e => setEditingCaseStudy({ ...editingCaseStudy, stats: { ...editingCaseStudy.stats, costSaved: (e.target as HTMLInputElement).value } })} style={{ ...inputBase, flex: 1 }} />
                <input placeholder="Timeframe" value={editingCaseStudy.stats.timeframe} onChange={e => setEditingCaseStudy({ ...editingCaseStudy, stats: { ...editingCaseStudy.stats, timeframe: (e.target as HTMLInputElement).value } })} style={{ ...inputBase, flex: 1 }} />
                <input placeholder="VA Count" value={editingCaseStudy.stats.vaCount} onChange={e => setEditingCaseStudy({ ...editingCaseStudy, stats: { ...editingCaseStudy.stats, vaCount: (e.target as HTMLInputElement).value } })} style={{ ...inputBase, flex: 1 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Results (JSON array)</label>
                <textarea value={JSON.stringify(editingCaseStudy.results || [], null, 2)} onChange={e => {
                  try {
                    const parsed = JSON.parse((e.target as HTMLTextAreaElement).value);
                    setEditingCaseStudy({ ...editingCaseStudy, results: parsed });
                  } catch {
                    // Invalid JSON, don't update
                  }
                }} style={{ ...inputBase, width: '100%', minHeight: 150, fontFamily: 'monospace' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Order</label>
                <input type="number" value={editingCaseStudy.order} onChange={e => setEditingCaseStudy({ ...editingCaseStudy, order: Number((e.target as HTMLInputElement).value) })} style={{ ...inputBase, width: 120 }} />
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setEditTarget(null); setEditingCaseStudy(null); }} style={btnSecondary}>Cancel</button>
              <button onClick={() => { if (editingCaseStudy) void onSave(editingCaseStudy); setEditTarget(null); setEditingCaseStudy(null); }} disabled={!hasToken} style={btnPrimary}>Save Changes</button>
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
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Delete case study</div>
            <div style={{ color: '#cbd5e1', marginBottom: 12 }}>Are you sure you want to delete case study ID {deleteTarget.caseStudyId}?</div>
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

function isEqualCaseStudy(a: CaseStudy, b: CaseStudy) {
  return a.caseStudyId===b.caseStudyId && a.title===b.title && a.company===b.company && a.industry===b.industry && a.challenge===b.challenge && a.solution===b.solution && JSON.stringify(a.results || [])===JSON.stringify(b.results || []) && a.testimonial===b.testimonial && a.testimonialAuthor===b.testimonialAuthor && a.testimonialRole===b.testimonialRole && a.image===b.image && JSON.stringify(a.stats || {})===JSON.stringify(b.stats || {}) && a.order===b.order && a.metaTitle===b.metaTitle && a.metaDescription===b.metaDescription && a.metaKeywords===b.metaKeywords;
}

