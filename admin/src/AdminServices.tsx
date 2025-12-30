import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageHeader, ControlsBar, FormField, AdminInput, AdminTextarea, AdminSelect, StatusBadge, ActionButton, Toast } from './AdminFormComponents';

type Lang = 'en' | 'de';

interface Service {
  _id?: string;
  order?: number;
  title: string;
  description: string;
  benefit: string;
  icon: string;
}

const API_BASE =
  ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_API_BASE ||
  'http://localhost:5001';

const AVAILABLE_ICONS = ['Instagram', 'HeadphonesIcon', 'FolderKanban', 'TrendingUp', 'Zap', 'Shield', 'Star', 'Rocket'];

export default function AdminServices() {
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

  const [services, setServices] = useState<Service[]>([]);
  const [originalServices, setOriginalServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [query, setQuery] = useState('');
  // Modal edit state similar to Pricing/How It Works
  const [editTarget, setEditTarget] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const isDirty = useCallback((idx: number) => {
    if (!originalServices[idx]) return true;
    return !isEqualService(services[idx], originalServices[idx]);
  }, [services, originalServices]);

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
      const res = await fetch(`${API_BASE}/api/admin/services?lang=${lang}`, { headers: headers() });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      const list: Service[] = Array.isArray(data.services) ? data.services.slice().sort((a: Service, b: Service) => (a.order ?? 0) - (b.order ?? 0)) : [];
      setServices(list);
      setOriginalServices(JSON.parse(JSON.stringify(list)) as Service[]);
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

  const setServiceField = (idx: number, key: keyof Service, value: Service[keyof Service]) => {
    setServices(prev => prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s)));
  };

  const validateCore = (s: Pick<Service, 'order'|'title'|'description'|'benefit'|'icon'>) => {
    if ((s.order ?? 0) < 0) return 'Order must be non-negative';
    if (!s.title.trim()) return 'Title is required';
    if (!s.description.trim()) return 'Description is required';
    if (!s.benefit.trim()) return 'Benefit is required';
    if (!s.icon.trim()) return 'Icon is required';
    return null;
  };

  const logHttpError = async (res: Response, context: string) => {
    const __ENV = ((import.meta as unknown) as { env?: Record<string, any> }).env || {};
    if (__ENV && __ENV.DEV) {
      let body = '';
      try { body = await res.clone().text(); } catch { /* ignore */ }
      console.error('[AdminServices] request failed', {
        context,
        url: res.url,
        status: res.status,
        statusText: res.statusText,
      });
      if (body) console.error('[AdminServices] response body:', body);
    }
  };

  const onSave = async (s: Service) => {
    const err = validateCore(s);
    if (err) return alert(err);
    if (!hasToken) return alert('Admin token required');
    if (!s._id) return alert('Service ID is required');
    const updates: Partial<Omit<Service, '_id'>> = {
      title: s.title,
      description: s.description,
      benefit: s.benefit,
      icon: s.icon,
    };
    const url = `${API_BASE}/api/admin/services/${s._id}`;
    setSavingOrder(s.order || 0);
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, updates }),
    });
    if (!res.ok) { await logHttpError(res, `PUT ${url}`); setSavingOrder(null); return alert('Save failed: ' + res.status); }
    await load();
    pushToast('Service saved');
    setSavingOrder(null);
  };

  const onDelete = async (s: Service) => {
    if (!hasToken) return alert('Admin token required');
    if (!s._id) return alert('Service ID is required');
    const url = `${API_BASE}/api/admin/services/${s._id}?lang=${lang}`;
    const res = await fetch(url, {
      method: 'DELETE', headers: headers()
    });
    if (!res.ok) { await logHttpError(res, `DELETE ${url}`); return alert('Delete failed: ' + res.status); }
    await load();
    pushToast('Service deleted');
  };

  const [newService, setNewService] = useState<Service>({
    order: 0, title: '', description: '', benefit: '', icon: 'Instagram'
  } as Service);

  const prefillSample = () => {
    const orderNum = services.length > 0 ? Math.max(...services.map(s => s.order ?? 0)) + 1 : 0;
    const sample: Service = {
      order: orderNum,
      title: lang === 'de' ? 'Beispiel Service' : 'Sample Service',
      description: lang === 'de' ? 'Dies ist eine Beispielbeschreibung' : 'This is a sample description',
      benefit: lang === 'de' ? 'Beispiel Vorteil' : 'Sample Benefit',
      icon: 'Instagram',
    };
    setNewService(sample);
  };

  const onAdd = async () => {
    if (!hasToken) return alert('Admin token required');
    if ((newService.order ?? 0) < 0) return alert('Order must be non-negative');
    const existingOrders = new Set(services.map(s => s.order ?? 0).filter(o => o !== undefined));
    if (existingOrders.has(newService.order ?? 0)) return alert(`Order ${newService.order ?? 0} already exists for ${lang}.`);
    const err = validateCore(newService);
    if (err) return alert(err);
    const url = `${API_BASE}/api/admin/services`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, service: newService }),
    });
    if (!res.ok) {
      if (res.status === 409) {
        return alert('This order already exists for the selected language.');
      }
      await logHttpError(res, `POST ${url}`);
      return alert('Add failed: ' + res.status);
    }
    setNewService({ order: 0, title: '', description: '', benefit: '', icon: 'Instagram' });
    await load();
    pushToast('Service added');
    setAddOpen(false);
  };

  const card = { background: '#0b1220', border: '1px solid #1f2937', borderRadius: 14, padding: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.35)' } as const;
  const inputBase = { padding: 10, border: '1px solid #334155', background: '#0f172a', color: '#e5e7eb', borderRadius: 10, outline: 'none' } as const;
  const btnPrimary = { padding: '8px 12px', borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 14, border: '1px solid #1d4ed8', cursor: 'pointer' } as const;
  const btnSecondary = { padding: '8px 12px', borderRadius: 8, background: '#111827', color: '#e5e7eb', fontWeight: 600, fontSize: 14, border: '1px solid #374151', cursor: 'pointer' } as const;
  const thStyle = { padding: 10, textAlign: 'left' as const, background: '#0b1220', color: '#94a3b8', borderBottom: '1px solid #1f2937', position: 'sticky' as const, top: 0, zIndex: 1, textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.6 };
  const tdStyle = { padding: 10, borderTop: '1px solid #1f2937', verticalAlign: 'top' as const };

  return (
    <div className="text-foreground">
      <PageHeader
        title="Services Management"
        description="Manage your services for English and German languages"
      />

      <ControlsBar>
        <div className="flex items-center gap-4 flex-wrap">
          <FormField label="Language">
            <AdminSelect value={lang} onChange={e => setLang(e.target.value as Lang)} className="max-w-xs">
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </AdminSelect>
          </FormField>
          {loading && (
            <StatusBadge type="info">Loading…</StatusBadge>
          )}
          {error && (
            <StatusBadge type="error">{error}</StatusBadge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!hasToken ? (
            <>
              <AdminInput placeholder="ADMIN_TOKEN" value={token} onChange={e => setToken(e.target.value)} className="w-64" />
              <ActionButton onClick={load} disabled={!hasToken && token.trim().length === 0}>
                Load
              </ActionButton>
              {envToken && (
                <ActionButton variant="secondary" onClick={() => setToken(envToken)}>
                  Use env token
                </ActionButton>
              )}
            </>
          ) : (
            <>
              <StatusBadge type="success">Token loaded</StatusBadge>
              <ActionButton variant="secondary" onClick={() => setToken('')}>
                Change token
              </ActionButton>
            </>
          )}
          <div className="flex items-center gap-3 ml-2 text-xs text-slate-400">
            <span>API: {API_BASE}</span>
            <span className={hasToken ? 'text-green-300' : 'text-red-300'}>Token: {hasToken ? 'yes' : 'no'}</span>
          </div>
        </div>
      </ControlsBar>

      <ControlsBar>
        <div className="text-slate-400 text-sm">Services: {services.length}</div>
        <div className="flex items-center gap-3">
          <AdminInput placeholder="Search services…" value={query} onChange={e => setQuery(e.target.value)} className="w-64" />
          <ActionButton variant="secondary" onClick={() => load()}>Refresh</ActionButton>
          <ActionButton onClick={() => setAddOpen(true)}>Add Service</ActionButton>
        </div>
      </ControlsBar>

      <div style={{ ...card, padding: 0, maxHeight: 460, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle }}>Order</th>
              <th style={{ ...thStyle }}>Icon</th>
              <th style={{ ...thStyle }}>Title</th>
              <th style={{ ...thStyle }}>Description</th>
              <th style={{ ...thStyle }}>Benefit</th>
              <th style={{ ...thStyle }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s, idx) => {
              const q = query.trim().toLowerCase();
              const matches = !q || [String(s.order), s.title, s.description, s.benefit, s.icon].join(' ').toLowerCase().includes(q);
              return (
              <tr key={s._id || s.order} onMouseEnter={() => setHoverRow(idx)} onMouseLeave={() => setHoverRow(r => (r===idx?null:r))} onClick={() => { setEditTarget(s); setEditingService({ ...s }); }} style={{ background: hoverRow === idx ? '#0e1a33' : (idx % 2 ? '#0b1426' : 'transparent'), transition: 'background 120ms ease', display: matches ? undefined : 'none', cursor: 'pointer' }}>
                <td style={tdStyle}>
                  <input type="number" min={0} value={s.order} onChange={e => setServiceField(idx, 'order', Number(e.target.value))} style={{ ...inputBase, width: 80, textAlign: 'center' as const }} />
                </td>
                <td style={tdStyle}>
                  <select value={s.icon} onChange={e => setServiceField(idx, 'icon', e.target.value)} style={{ ...inputBase, width: 140 }}>
                    {AVAILABLE_ICONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </td>
                <td style={tdStyle}>
                  <input value={s.title} onChange={e => setServiceField(idx, 'title', e.target.value)} style={{ ...inputBase, width: '100%' }} />
                </td>
                <td style={tdStyle}>
                  <textarea value={s.description} onChange={e => setServiceField(idx, 'description', e.target.value)} style={{ ...inputBase, width: '100%', minHeight: 64, resize: 'vertical' }} />
                </td>
                <td style={tdStyle}>
                  <input value={s.benefit} onChange={e => setServiceField(idx, 'benefit', e.target.value)} style={{ ...inputBase, width: '100%' }} />
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => onSave(s)} disabled={!hasToken || !isDirty(idx)} style={{ ...btnPrimary, opacity: hasToken && isDirty(idx) ? 1 : 0.6 }}>{savingOrder===s.order ? 'Saving…' : 'Save'}</button>
                    <button onClick={() => setServices(prev => prev.map((ss, i) => (i===idx ? { ...originalServices[idx] } : ss)))} disabled={!isDirty(idx)} style={{ ...btnSecondary, opacity: isDirty(idx) ? 1 : 0.6 }}>Revert</button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(s); }} disabled={!hasToken} style={{ ...btnSecondary, opacity: hasToken ? 1 : 0.6 }}>Delete</button>
                    <button onClick={(e) => { e.stopPropagation(); setEditTarget(s); setEditingService({ ...s }); }} style={btnSecondary}>Edit</button>
                  </div>
                </td>
              </tr>
              );
            })}
            {services.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No services yet. Click "Add Service" to create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <details open={addOpen} onToggle={e => setAddOpen((e.target as HTMLDetailsElement).open)} className="mt-4">
        <summary className="cursor-pointer font-bold text-white">Add New Service</summary>
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-4 mt-2">
          <div className="flex gap-3 flex-wrap">
            <AdminInput type="number" placeholder="Order" min={0} value={newService.order} onChange={e => setNewService({ ...newService, order: Number(e.target.value) })} className="w-36" />
            <AdminSelect value={newService.icon} onChange={e => setNewService({ ...newService, icon: e.target.value })} className="w-40">
              {AVAILABLE_ICONS.map(icon => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </AdminSelect>
            <AdminInput placeholder="Title" value={newService.title} onChange={e => setNewService({ ...newService, title: e.target.value })} className="flex-1 min-w-[260px]" />
            <AdminTextarea placeholder="Description" value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} className="flex-[1_1_100%] min-h-[80px]" />
            <AdminInput placeholder="Benefit" value={newService.benefit} onChange={e => setNewService({ ...newService, benefit: e.target.value })} className="flex-1 min-w-[260px]" />
          </div>
          <div className="mt-3 flex items-center gap-3">
            <ActionButton onClick={onAdd} disabled={(newService.order ?? 0) < 0 || !hasToken}>Add Service</ActionButton>
            <ActionButton variant="secondary" onClick={prefillSample}>Prefill sample</ActionButton>
          </div>
        </div>
      </details>
      {toast && (
        <Toast type={toast.type === 'success' ? 'success' : 'error'} message={toast.message} onClose={() => setToast(null)} />
      )}
      {/* Add Service Modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setAddOpen(false)}>
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Add New Service</h3>
              <button onClick={() => setAddOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Order">
                <AdminInput type="number" min={0} value={newService.order} onChange={e => setNewService({ ...newService, order: Number((e.target as HTMLInputElement).value) })} />
              </FormField>
              <FormField label="Icon">
                <AdminSelect value={newService.icon} onChange={e => setNewService({ ...newService, icon: (e.target as HTMLSelectElement).value })}>
                  {AVAILABLE_ICONS.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </AdminSelect>
              </FormField>
              <FormField label="Title" className="md:col-span-2">
                <AdminInput value={newService.title} onChange={e => setNewService({ ...newService, title: (e.target as HTMLInputElement).value })} />
              </FormField>
              <FormField label="Benefit" className="md:col-span-2">
                <AdminInput value={newService.benefit} onChange={e => setNewService({ ...newService, benefit: (e.target as HTMLInputElement).value })} />
              </FormField>
              <FormField label="Description" className="md:col-span-2">
                <AdminTextarea rows={4} value={newService.description} onChange={e => setNewService({ ...newService, description: (e.target as HTMLTextAreaElement).value })} />
              </FormField>
            </div>
            <div className="flex items-center gap-3 justify-end pt-4">
              <ActionButton variant="secondary" onClick={prefillSample}>Prefill Sample</ActionButton>
              <ActionButton variant="primary" onClick={onAdd} disabled={!hasToken || (newService.order ?? 0) < 0}>Add Service</ActionButton>
            </div>
          </div>
        </div>
      )}
      {/* Edit Service Modal */}
      {editTarget && editingService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setEditTarget(null); setEditingService(null); }}>
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Edit Service (Order: {editTarget.order})</h3>
              <button onClick={() => { setEditTarget(null); setEditingService(null); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Order">
                <AdminInput type="number" value={editingService.order} onChange={e => setEditingService({ ...editingService, order: Number((e.target as HTMLInputElement).value) })} />
              </FormField>
              <FormField label="Icon">
                <AdminSelect value={editingService.icon} onChange={e => setEditingService({ ...editingService, icon: (e.target as HTMLSelectElement).value })}>
                  {AVAILABLE_ICONS.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </AdminSelect>
              </FormField>
              <FormField label="Title" className="md:col-span-2">
                <AdminInput value={editingService.title} onChange={e => setEditingService({ ...editingService, title: (e.target as HTMLInputElement).value })} />
              </FormField>
              <FormField label="Benefit" className="md:col-span-2">
                <AdminInput value={editingService.benefit} onChange={e => setEditingService({ ...editingService, benefit: (e.target as HTMLInputElement).value })} />
              </FormField>
              <FormField label="Description" className="md:col-span-2">
                <AdminTextarea rows={4} value={editingService.description} onChange={e => setEditingService({ ...editingService, description: (e.target as HTMLTextAreaElement).value })} />
              </FormField>
            </div>
            <div className="flex items-center gap-3 justify-end pt-4">
              <ActionButton variant="secondary" onClick={() => { setEditTarget(null); setEditingService(null); }}>Cancel</ActionButton>
              <ActionButton variant="primary" onClick={() => { if (editingService) void onSave(editingService); setEditTarget(null); setEditingService(null); }} disabled={!hasToken}>Save Changes</ActionButton>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#0b1220', border: '1px solid #1f2937', borderRadius: 12, padding: 16, minWidth: 340 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Delete service</div>
            <div style={{ color: '#cbd5e1', marginBottom: 12 }}>Are you sure you want to delete service with order {deleteTarget.order}?</div>
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

function isEqualService(a: Service, b: Service) {
  return (a.order ?? 0)===(b.order ?? 0) && a.title===b.title && a.description===b.description && a.benefit===b.benefit && (a.icon||'')===(b.icon||'');
}

