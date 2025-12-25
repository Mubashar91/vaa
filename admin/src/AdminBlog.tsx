import { useCallback, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'de';

interface Blog {
  _id?: string;
  blogId: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  charts?: any;
  order: number;
  sections?: Section[];
}

type Section = { heading: string; details: string };

const API_BASE =
  ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_API_BASE ||
  'http://localhost:5001';

export default function AdminBlog() {
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

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [originalBlogs, setOriginalBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Blog | null>(null);
  const [query, setQuery] = useState('');
  // Modal edit state similar to other admin pages
  const [editTarget, setEditTarget] = useState<Blog | null>(null);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [editingSections, setEditingSections] = useState<Section[]>([]);

  const isDirty = useCallback((idx: number) => {
    if (!originalBlogs[idx]) return true;
    return !isEqualBlog(blogs[idx], originalBlogs[idx]);
  }, [blogs, originalBlogs]);

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
      const res = await fetch(`${API_BASE}/api/admin/blogs?lang=${lang}`, { headers: headers() });
      if (res.status === 401) {
        try { localStorage.removeItem('adminToken'); } catch (_e) { /* noop */ }
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      const list: Blog[] = Array.isArray(data.blogs) ? data.blogs.slice().sort((a: Blog, b: Blog) => a.blogId - b.blogId) : [];
      setBlogs(list);
      setOriginalBlogs(JSON.parse(JSON.stringify(list)) as Blog[]);
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

  const setBlogField = (idx: number, key: keyof Blog, value: Blog[keyof Blog]) => {
    setBlogs(prev => prev.map((b, i) => (i === idx ? { ...b, [key]: value } : b)));
  };

  const validateCore = (b: Pick<Blog, 'blogId'|'title'|'excerpt'|'content'|'author'|'date'|'readTime'|'category'|'image'>) => {
    if (b.blogId < 1) return 'Blog ID must be at least 1';
    if (!b.title.trim()) return 'Title is required';
    if (!b.excerpt.trim()) return 'Excerpt is required';
    if (!b.content.trim()) return 'Content is required';
    if (!b.author.trim()) return 'Author is required';
    if (!b.date.trim()) return 'Date is required';
    if (!b.readTime.trim()) return 'Read time is required';
    if (!b.category.trim()) return 'Category is required';
    if (!b.image.trim()) return 'Image URL is required';
    return null;
  };

  const logHttpError = async (res: Response, context: string) => {
    const __ENV = ((import.meta as unknown) as { env?: Record<string, any> }).env || {};
    if (__ENV && __ENV.DEV) {
      let body = '';
      try { body = await res.clone().text(); } catch { /* ignore */ }
      console.error('[AdminBlog] request failed', {
        context,
        url: res.url,
        status: res.status,
        statusText: res.statusText,
      });
      if (body) console.error('[AdminBlog] response body:', body);
    }
  };

  const onSave = async (b: Blog, sectionsOverride?: Section[]) => {
    const err = validateCore(b);
    if (err) return alert(err);
    if (!hasToken) return alert('Admin token required');
    const updates: Partial<Omit<Blog, 'blogId'>> = {
      title: b.title,
      excerpt: b.excerpt,
      content: b.content,
      author: b.author,
      date: b.date,
      readTime: b.readTime,
      category: b.category,
      image: b.image,
      charts: b.charts,
      order: b.order,
      sections: sectionsOverride ?? b.sections,
    };
    const url = `${API_BASE}/api/admin/blogs/${b.blogId}`;
    setSavingId(b.blogId);
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, updates }),
    });
    if (!res.ok) { await logHttpError(res, `PUT ${url}`); setSavingId(null); return alert('Save failed: ' + res.status); }
    await load();
    pushToast('Blog saved');
    setSavingId(null);
  };

  const onDelete = async (b: Blog) => {
    if (!hasToken) return alert('Admin token required');
    const url = `${API_BASE}/api/admin/blogs/${b.blogId}?lang=${lang}`;
    const res = await fetch(url, {
      method: 'DELETE', headers: headers()
    });
    if (!res.ok) { await logHttpError(res, `DELETE ${url}`); return alert('Delete failed: ' + res.status); }
    await load();
    pushToast('Blog deleted');
  };

  const [newBlog, setNewBlog] = useState<Blog>({
    blogId: 1, title: '', excerpt: '', content: '', author: '', date: '', readTime: '', category: '', image: '', order: 0
  });
  const [newSections, setNewSections] = useState<Section[]>([]);

  const buildContentFromSections = (sections: Section[]) => {
    const html = sections
      .filter(s => s.heading.trim() || s.details.trim())
      .map(s => {
        const paras = s.details
          .split(/\n\n+/)
          .map(p => p.trim())
          .filter(Boolean)
          .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`) // preserve single newlines
          .join('');
        return `<h2>${s.heading || ''}</h2>${paras}`;
      })
      .join('');
    return html || '';
  };

  const prefillSample = () => {
    const blogIdNum = blogs.length > 0 ? Math.max(...blogs.map(b => b.blogId)) + 1 : 1;
    const sample: Blog = {
      blogId: blogIdNum,
      title: lang === 'de' ? 'Beispiel Blog Titel' : 'Sample Blog Title',
      excerpt: lang === 'de' ? 'Dies ist eine Beispielzusammenfassung' : 'This is a sample excerpt',
      content: lang === 'de' ? '<h2>Überschrift</h2><p>Beispielinhalt Absatz 1</p><p>Absatz 2</p>' : '<h2>Heading</h2><p>Sample content paragraph 1</p><p>Paragraph 2</p>',
      author: 'John Doe',
      date: new Date().toLocaleDateString(),
      readTime: '5 min read',
      category: lang === 'de' ? 'Kategorie' : 'Category',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
      order: 0,
    };
    setNewBlog(sample);
    setNewSections([
      { heading: lang === 'de' ? 'Einführung' : 'Introduction', details: lang === 'de' ? 'Dies ist der erste Abschnitt.\nWeitere Details hier.' : 'This is the first section.\nMore details here.' },
      { heading: lang === 'de' ? 'Details' : 'Details', details: lang === 'de' ? 'Zweiter Abschnitt mit Informationen.' : 'Second section with information.' },
    ]);
  };

  const onAdd = async () => {
    if (!hasToken) return alert('Admin token required');
    if (newBlog.blogId < 1) return alert('Blog ID must be at least 1');
    const existingIds = new Set(blogs.map(b => b.blogId));
    if (existingIds.has(newBlog.blogId)) return alert(`Blog ID ${newBlog.blogId} already exists for ${lang}.`);
    const err = validateCore(newBlog);
    if (err) return alert(err);
    const url = `${API_BASE}/api/admin/blogs`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, blog: { ...newBlog, sections: newSections } }),
    });
    if (!res.ok) {
      if (res.status === 409) {
        return alert('This blog ID already exists for the selected language.');
      }
      await logHttpError(res, `POST ${url}`);
      return alert('Add failed: ' + res.status);
    }
    setNewBlog({ blogId: 1, title: '', excerpt: '', content: '', author: '', date: '', readTime: '', category: '', image: '', order: 0 });
    await load();
    pushToast('Blog added');
    setAddOpen(false);
  };

  const card = { background: '#0b1220', border: '1px solid #1f2937', borderRadius: 14, padding: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.35)' } as const;
  
  const inputBase = { padding: 10, border: '1px solid #334155', background: '#0f172a', color: '#e5e7eb', borderRadius: 10, outline: 'none' } as const;
  const btnPrimary = { padding: '8px 12px', borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 14, border: '1px solid #1d4ed8', cursor: 'pointer' } as const;
  const btnSecondary = { padding: '8px 12px', borderRadius: 8, background: '#111827', color: '#e5e7eb', fontWeight: 600, fontSize: 14, border: '1px solid #374151', cursor: 'pointer' } as const;
  const thStyle = { padding: 10, textAlign: 'left' as const, background: '#0b1220', color: '#94a3b8', borderBottom: '1px solid #1f2937', position: 'sticky' as const, top: 0, zIndex: 1, textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.6 };
  const tdStyle = { padding: 10, borderTop: '1px solid #1f2937', verticalAlign: 'top' as const };

  return (
    <div style={{ padding: 0, maxWidth: '100%', margin: '0 auto', color: '#e5e7eb' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: -0.3, color: '#fff' }}>Blog Management</h2>
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Manage your blog posts for English and German languages</p>
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
          <button onClick={() => load()} style={btnSecondary}>Refresh</button>
          <div style={{ display: 'flex', gap: 10, marginLeft: 8 }}>
            <span style={{ color: '#9ca3af', fontSize: 12 }}>API: {API_BASE}</span>
            <span style={{ color: hasToken ? '#10b981' : '#f87171', fontSize: 12 }}>Auth: {hasToken ? 'ok' : 'missing'}</span>
          </div>
        </div>
      </div>

      <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ color: '#9ca3af', fontSize: 13 }}>Blogs: {blogs.length}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="Search blogs…" value={query} onChange={e => setQuery(e.target.value)} style={{ ...inputBase, width: 260 }} />
          <button onClick={() => load()} style={btnSecondary}>Refresh</button>
          <button onClick={() => setAddOpen(true)} style={btnPrimary}>Add Blog</button>
        </div>
      </div>

      <div style={{ ...card, padding: 0, maxHeight: 600, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle }}>ID</th>
              <th style={{ ...thStyle }}>Title</th>
              <th style={{ ...thStyle }}>Author</th>
              <th style={{ ...thStyle }}>Category</th>
              <th style={{ ...thStyle }}>Date</th>
              <th style={{ ...thStyle }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.map((b, idx) => {
              const q = query.trim().toLowerCase();
              const matches = !q || [String(b.blogId), b.title, b.author, b.category, b.date].join(' ').toLowerCase().includes(q);
              return (
              <tr key={b._id || b.blogId} onMouseEnter={() => setHoverRow(idx)} onMouseLeave={() => setHoverRow(r => (r===idx?null:r))} onClick={() => { setEditTarget(b); setEditingBlog({ ...b }); setEditingSections(b.sections || []); }} style={{ background: hoverRow === idx ? '#0e1a33' : (idx % 2 ? '#0b1426' : 'transparent'), transition: 'background 120ms ease', display: matches ? undefined : 'none', cursor: 'pointer' }}>
                <td style={tdStyle}>
                  <input type="number" min={1} value={b.blogId} onChange={e => setBlogField(idx, 'blogId', Number(e.target.value))} style={{ ...inputBase, width: 80, textAlign: 'center' as const }} />
                </td>
                <td style={tdStyle}>
                  <input value={b.title} onChange={e => setBlogField(idx, 'title', e.target.value)} style={{ ...inputBase, width: '100%' }} />
                </td>
                <td style={tdStyle}>
                  <input value={b.author} onChange={e => setBlogField(idx, 'author', e.target.value)} style={{ ...inputBase, width: 150 }} />
                </td>
                <td style={tdStyle}>
                  <input value={b.category} onChange={e => setBlogField(idx, 'category', e.target.value)} style={{ ...inputBase, width: 150 }} />
                </td>
                <td style={tdStyle}>
                  <input value={b.date} onChange={e => setBlogField(idx, 'date', e.target.value)} style={{ ...inputBase, width: 150 }} />
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => onSave(b)} disabled={!hasToken || !isDirty(idx)} style={{ ...btnPrimary, opacity: hasToken && isDirty(idx) ? 1 : 0.6 }}> {savingId===b.blogId ? 'Saving…' : 'Save'}</button>
                    <button onClick={() => setBlogs(prev => prev.map((bb, i) => (i===idx ? { ...originalBlogs[idx] } : bb)))} disabled={!isDirty(idx)} style={{ ...btnSecondary, opacity: isDirty(idx) ? 1 : 0.6 }}>Revert</button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(b); }} disabled={!hasToken} style={{ ...btnSecondary, opacity: hasToken ? 1 : 0.6 }}>Delete</button>
                  </div>
                </td>
              </tr>
              );
            })}
            {blogs.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No blogs yet. Click "Add Blog" to create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Expanded view for editing full blog */}
      {blogs.map((b, idx) => {
        if (hoverRow !== idx) return null;
        return (
          <details key={b._id || b.blogId} style={{ marginTop: 8, ...card }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700, marginBottom: 8 }}>Edit Full Details: {b.title}</summary>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Excerpt</label>
                <textarea value={b.excerpt} onChange={e => setBlogField(idx, 'excerpt', e.target.value)} style={{ ...inputBase, width: '100%', minHeight: 60 }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Content (HTML)</label>
                <textarea value={b.content} onChange={e => setBlogField(idx, 'content', e.target.value)} style={{ ...inputBase, width: '100%', minHeight: 200, fontFamily: 'monospace' }} />
              </div>
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ display: 'block', fontSize: 12 }}>Structured Sections (optional)</label>
                  <button onClick={() => setEditingSections(prev => { const next = [...prev, { heading: '', details: '' }]; setBlogField(idx, 'sections', next as unknown as Blog[keyof Blog]); return next; })} style={btnSecondary}>Add Section</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {editingSections.map((s, sIdx) => (
                    <div key={sIdx} style={{ border: '1px solid #1f2937', borderRadius: 10, padding: 10 }}>
                      <input placeholder={`Heading ${sIdx + 1}`} value={s.heading} onChange={e => setEditingSections(arr => { const next = arr.map((it, i) => i === sIdx ? { ...it, heading: (e.target as HTMLInputElement).value } : it); setBlogField(idx, 'sections', next as unknown as Blog[keyof Blog]); return next; })} style={{ ...inputBase, width: '100%', marginBottom: 6 }} />
                      <textarea placeholder="Details (supports new lines)" value={s.details} onChange={e => setEditingSections(arr => { const next = arr.map((it, i) => i === sIdx ? { ...it, details: (e.target as HTMLTextAreaElement).value } : it); setBlogField(idx, 'sections', next as unknown as Blog[keyof Blog]); return next; })} style={{ ...inputBase, width: '100%', minHeight: 100 }} />
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                        <button onClick={() => setEditingSections(arr => { const next = arr.filter((_, i) => i !== sIdx); setBlogField(idx, 'sections', next as unknown as Blog[keyof Blog]); return next; })} style={btnSecondary}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setBlogField(idx, 'content', buildContentFromSections(editingSections))} style={btnPrimary}>Build Content from Sections</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Read Time</label>
                  <input value={b.readTime} onChange={e => setBlogField(idx, 'readTime', e.target.value)} style={{ ...inputBase, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Image URL</label>
                  <input value={b.image} onChange={e => setBlogField(idx, 'image', e.target.value)} style={{ ...inputBase, width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Order</label>
                  <input type="number" value={b.order} onChange={e => setBlogField(idx, 'order', Number(e.target.value))} style={{ ...inputBase, width: '100%' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontSize: 12 }}>Charts (JSON, optional)</label>
                <textarea value={JSON.stringify(b.charts || null, null, 2)} onChange={e => {
                  try {
                    const parsed = e.target.value.trim() ? JSON.parse(e.target.value) : null;
                    setBlogField(idx, 'charts', parsed);
                  } catch {
                    // Invalid JSON, don't update
                  }
                }} style={{ ...inputBase, width: '100%', minHeight: 100, fontFamily: 'monospace' }} />
              </div>
            </div>
          </details>
        );
      })}

      {/* Add Blog Modal */}
      {addOpen && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }} onClick={() => setAddOpen(false)}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: '#0b1220', border: '1px solid #1f2937', borderRadius: 14, padding: 16, maxWidth: 900, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Add New Blog</h3>
              <button onClick={() => setAddOpen(false)} style={{ ...btnSecondary }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input type="number" placeholder="Blog ID" min={1} value={newBlog.blogId} onChange={e => setNewBlog({ ...newBlog, blogId: Number(e.target.value) })} style={{ ...inputBase, width: 140 }} />
                <input placeholder="Title" value={newBlog.title} onChange={e => setNewBlog({ ...newBlog, title: e.target.value })} style={{ ...inputBase, flex: '1 1 260px' }} />
                <input placeholder="Author" value={newBlog.author} onChange={e => setNewBlog({ ...newBlog, author: e.target.value })} style={{ ...inputBase, flex: '1 1 200px' }} />
                <input placeholder="Category" value={newBlog.category} onChange={e => setNewBlog({ ...newBlog, category: e.target.value })} style={{ ...inputBase, flex: '1 1 200px' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input placeholder="Date" value={newBlog.date} onChange={e => setNewBlog({ ...newBlog, date: e.target.value })} style={{ ...inputBase, flex: '1 1 200px' }} />
                <input placeholder="Read Time" value={newBlog.readTime} onChange={e => setNewBlog({ ...newBlog, readTime: e.target.value })} style={{ ...inputBase, flex: '1 1 200px' }} />
                <input placeholder="Image URL" value={newBlog.image} onChange={e => setNewBlog({ ...newBlog, image: e.target.value })} style={{ ...inputBase, flex: '1 1 300px' }} />
                <input type="number" placeholder="Order" value={newBlog.order} onChange={e => setNewBlog({ ...newBlog, order: Number(e.target.value) })} style={{ ...inputBase, width: 120 }} />
              </div>
              <textarea rows={2} placeholder="Excerpt" value={newBlog.excerpt} onChange={e => setNewBlog({ ...newBlog, excerpt: e.target.value })} style={{ ...inputBase, width: '100%', minHeight: 60 }} />
              <textarea rows={8} placeholder="Content (HTML)" value={newBlog.content} onChange={e => setNewBlog({ ...newBlog, content: e.target.value })} style={{ ...inputBase, width: '100%', minHeight: 200, fontFamily: 'monospace' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ display: 'block', fontSize: 12 }}>Structured Sections (optional)</label>
                  <button onClick={() => setNewSections(prev => [...prev, { heading: '', details: '' }])} style={btnSecondary}>Add Section</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {newSections.map((s, idx) => (
                    <div key={idx} style={{ border: '1px solid #1f2937', borderRadius: 10, padding: 10 }}>
                      <input placeholder={`Heading ${idx + 1}`} value={s.heading} onChange={e => setNewSections(arr => arr.map((it, i) => i === idx ? { ...it, heading: (e.target as HTMLInputElement).value } : it))} style={{ ...inputBase, width: '100%', marginBottom: 6 }} />
                      <textarea placeholder="Details (supports new lines)" value={s.details} onChange={e => setNewSections(arr => arr.map((it, i) => i === idx ? { ...it, details: (e.target as HTMLTextAreaElement).value } : it))} style={{ ...inputBase, width: '100%', minHeight: 100 }} />
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                        <button onClick={() => setNewSections(arr => arr.filter((_, i) => i !== idx))} style={btnSecondary}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setNewBlog(b => ({ ...b, content: buildContentFromSections(newSections) }))} style={btnPrimary}>Build Content from Sections</button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={prefillSample} style={{ ...btnSecondary }}>Prefill sample</button>
              <button onClick={onAdd} disabled={newBlog.blogId < 1 || !hasToken} style={{ ...btnPrimary, opacity: newBlog.blogId >= 1 && hasToken ? 1 : 0.6 }}>Add Blog</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Blog Modal */}
      {editTarget && editingBlog && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 50 }} onClick={() => { setEditTarget(null); setEditingBlog(null); }}>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'relative', background: '#0b1220', border: '1px solid #1f2937', borderRadius: 14, padding: 16, maxWidth: 900, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Edit Blog (ID: {editTarget.blogId})</h3>
              <button onClick={() => { setEditTarget(null); setEditingBlog(null); }} style={{ ...btnSecondary }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input type="number" value={editingBlog.blogId} disabled style={{ ...inputBase, width: 140, color: '#9ca3af' }} />
                <input placeholder="Title" value={editingBlog.title} onChange={e => setEditingBlog({ ...editingBlog, title: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 260px' }} />
                <input placeholder="Author" value={editingBlog.author} onChange={e => setEditingBlog({ ...editingBlog, author: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 200px' }} />
                <input placeholder="Category" value={editingBlog.category} onChange={e => setEditingBlog({ ...editingBlog, category: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 200px' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input placeholder="Date" value={editingBlog.date} onChange={e => setEditingBlog({ ...editingBlog, date: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 200px' }} />
                <input placeholder="Read Time" value={editingBlog.readTime} onChange={e => setEditingBlog({ ...editingBlog, readTime: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 200px' }} />
                <input placeholder="Image URL" value={editingBlog.image} onChange={e => setEditingBlog({ ...editingBlog, image: (e.target as HTMLInputElement).value })} style={{ ...inputBase, flex: '1 1 300px' }} />
                <input type="number" placeholder="Order" value={editingBlog.order} onChange={e => setEditingBlog({ ...editingBlog, order: Number((e.target as HTMLInputElement).value) })} style={{ ...inputBase, width: 120 }} />
              </div>
              <textarea rows={2} placeholder="Excerpt" value={editingBlog.excerpt} onChange={e => setEditingBlog({ ...editingBlog, excerpt: (e.target as HTMLTextAreaElement).value })} style={{ ...inputBase, width: '100%', minHeight: 60 }} />
              <textarea rows={8} placeholder="Content (HTML)" value={editingBlog.content} onChange={e => setEditingBlog({ ...editingBlog, content: (e.target as HTMLTextAreaElement).value })} style={{ ...inputBase, width: '100%', minHeight: 200, fontFamily: 'monospace' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ display: 'block', fontSize: 12 }}>Structured Sections (optional)</label>
                  <button onClick={() => setEditingSections(prev => [...prev, { heading: '', details: '' }])} style={btnSecondary}>Add Section</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {editingSections.map((s, idx) => (
                    <div key={idx} style={{ border: '1px solid #1f2937', borderRadius: 10, padding: 10 }}>
                      <input placeholder={`Heading ${idx + 1}`} value={s.heading} onChange={e => setEditingSections(arr => arr.map((it, i) => i === idx ? { ...it, heading: (e.target as HTMLInputElement).value } : it))} style={{ ...inputBase, width: '100%', marginBottom: 6 }} />
                      <textarea placeholder="Details (supports new lines)" value={s.details} onChange={e => setEditingSections(arr => arr.map((it, i) => i === idx ? { ...it, details: (e.target as HTMLTextAreaElement).value } : it))} style={{ ...inputBase, width: '100%', minHeight: 100 }} />
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 6 }}>
                        <button onClick={() => setEditingSections(arr => arr.filter((_, i) => i !== idx))} style={btnSecondary}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setEditingBlog(b => (b ? { ...b, content: buildContentFromSections(editingSections) } : b))} style={btnPrimary}>Build Content from Sections</button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => { setEditTarget(null); setEditingBlog(null); }} style={btnSecondary}>Cancel</button>
              <button onClick={() => { if (editingBlog) void onSave(editingBlog, editingSections); setEditTarget(null); setEditingBlog(null); }} disabled={!hasToken} style={btnPrimary}>Save Changes</button>
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
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Delete blog</div>
            <div style={{ color: '#cbd5e1', marginBottom: 12 }}>Are you sure you want to delete blog ID {deleteTarget.blogId}?</div>
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

function isEqualBlog(a: Blog, b: Blog) {
  return a.blogId===b.blogId && a.title===b.title && a.excerpt===b.excerpt && a.content===b.content && a.author===b.author && a.date===b.date && a.readTime===b.readTime && a.category===b.category && a.image===b.image && JSON.stringify(a.charts || null)===JSON.stringify(b.charts || null) && a.order===b.order && JSON.stringify(a.sections || null)===JSON.stringify(b.sections || null);
}

