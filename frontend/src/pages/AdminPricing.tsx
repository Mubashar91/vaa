import { useCallback, useEffect, useMemo, useState } from 'react';

type Lang = 'en' | 'de';

interface Plan {
  planKey: string;
  name: string;
  hours: string;
  price: number;
  setupFee: number;
  badge?: string;
  features: string[];
  highlighted: boolean;
}

const API_BASE =
  ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_API_BASE ||
  'https://api.don-va.com';

export default function AdminPricing() {
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

  const [plans, setPlans] = useState<Plan[]>([]);
  const [originalPlans, setOriginalPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createJson, setCreateJson] = useState<string | null>(null);
  const [importJson, setImportJson] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [query, setQuery] = useState('');
  const isDirty = useCallback((idx: number) => {
    if (!originalPlans[idx]) return true;
    return !isEqualPlan(plans[idx], originalPlans[idx]);
  }, [plans, originalPlans]);

  const pushToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2500);
  };

  // Accept token from URL once (?token=...)
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

  // Persist token
  useEffect(() => {
    try { localStorage.setItem('adminToken', token.trim()); } catch (_err) { void _err; }
  }, [token]);

  const load = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(`${API_BASE}/api/admin/pricing?lang=${lang}`, { headers: headers() });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      const order = ['starter','professional','enterprise'];
      const list: Plan[] = Array.isArray(data.plans) ? data.plans.slice().sort((a: Plan,b: Plan)=> order.indexOf(a.planKey)-order.indexOf(b.planKey)) : [];
      // Only update plans if they actually changed to prevent form resets
      setPlans(prevPlans => {
        const plansChanged = JSON.stringify(prevPlans) !== JSON.stringify(list);
        return plansChanged ? list : prevPlans;
      });
      setOriginalPlans(JSON.parse(JSON.stringify(list)) as Plan[]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [lang, headers]);

  useEffect(() => {
    if (hasToken) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken, lang]); // Removed 'load' from dependencies to prevent unnecessary re-renders

  // Edit helpers
  const setPlanField = (idx: number, key: keyof Plan, value: Plan[keyof Plan]) => {
    setPlans(prev => prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p)));
  };

  const importFromJson = () => {
    try {
      const parsed = JSON.parse(importJson || '{}');
      const p = parsed.plan || parsed;
      const l = parsed.lang as Lang | undefined;
      if (l === 'en' || l === 'de') setLang(l);
      if (!p || typeof p !== 'object') throw new Error('Invalid payload: missing plan');
      const next: Plan = {
        planKey: String(p.planKey || '').trim(),
        name: String(p.name || ''),
        hours: String(p.hours || ''),
        price: typeof p.price === 'number' ? p.price : Number(p.price || 0),
        setupFee: typeof p.setupFee === 'number' ? p.setupFee : Number(p.setupFee || 0),
        badge: p.badge ? String(p.badge) : '',
        features: Array.isArray(p.features) ? p.features.map((x: unknown) => String(x)) : [],
        highlighted: Boolean(p.highlighted),
      };
      setNewPlan(next);
    } catch {
      alert('Invalid JSON. Please check the structure.');
    }
  };

  const validateCore = (p: Pick<Plan, 'name'|'hours'|'price'|'setupFee'>) => {
    if (!p.name.trim()) return 'Name is required';
    if (!p.hours.trim()) return 'Hours is required';
    if (isNaN(p.price) || p.price < 0) return 'Price must be non-negative';
    if (isNaN(p.setupFee) || p.setupFee < 0) return 'Setup fee must be non-negative';
    return null;
  };

  const logHttpError = async (res: Response, context: string) => {
    let body = '';
    try { body = await res.clone().text(); } catch { /* ignore */ }
    console.error('[AdminPricing] request failed', {
      context,
      url: res.url,
      status: res.status,
      statusText: res.statusText,
    });
    if (body) console.error('[AdminPricing] response body:', body);
  };

  const onSave = async (p: Plan) => {
    const err = validateCore(p);
    if (err) return alert(err);
    if (!hasToken) return alert('Admin token required');
    const updates: Partial<Omit<Plan, 'planKey'>> = {
      name: p.name,
      hours: p.hours,
      price: p.price,
      setupFee: p.setupFee,
      badge: p.badge,
      features: p.features,
      highlighted: p.highlighted,
    };
    const url = `${API_BASE}/api/admin/pricing/${p.planKey}`;
    setSavingKey(p.planKey);
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, updates }),
    });
    if (!res.ok) { await logHttpError(res, `PUT ${url}`); setSavingKey(null); return alert('Save failed: ' + res.status); }
    await load();
    pushToast('Plan saved');
    setSavingKey(null);
  };

  const onDelete = async (p: Plan) => {
    if (!hasToken) return alert('Admin token required');
    const url = `${API_BASE}/api/admin/pricing/${p.planKey}?lang=${lang}`;
    const res = await fetch(url, {
      method: 'DELETE', headers: headers()
    });
    if (!res.ok) { await logHttpError(res, `DELETE ${url}`); return alert('Delete failed: ' + res.status); }
    await load();
    pushToast('Plan deleted');
  };

  // New plan
  const [newPlan, setNewPlan] = useState<Plan>({
    planKey: '', name: '', hours: '', price: 0, setupFee: 0, badge: '', features: [], highlighted: false
  });

  const prefillSample = () => {
    const sample: Plan = {
      planKey: 'starter',
      name: 'Starter',
      hours: lang === 'de' ? 'Mo-Fr 9-17 Uhr' : 'Mon-Fri 9am-5pm',
      price: 9.99,
      setupFee: 0,
      badge: lang === 'de' ? 'Günstig' : 'Best Value',
      features: lang === 'de' ? ['E-Mail-Support', 'Basis-Analytics'] : ['Email support', 'Basic analytics'],
      highlighted: false,
    };
    setNewPlan(sample);
  };

  const onAdd = async () => {
    if (!hasToken) return alert('Admin token required');
    if (!newPlan.planKey) return alert('planKey required');
    const allowed = ['starter','professional','enterprise'];
    if (!allowed.includes(newPlan.planKey)) return alert('planKey must be: ' + allowed.join(', '));
    const existingKeys = new Set(plans.map(p => p.planKey));
    if (existingKeys.has(newPlan.planKey)) return alert(`Plan with key "${newPlan.planKey}" already exists for ${lang}.`);
    const err = validateCore(newPlan);
    if (err) return alert(err);
    const url = `${API_BASE}/api/admin/pricing`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, plan: newPlan }),
    });
    if (!res.ok) {
      if (res.status === 409) {
        return alert('This plan already exists for the selected language.');
      }
      await logHttpError(res, `POST ${url}`);
      return alert('Add failed: ' + res.status);
    }
    try { const data = await res.json(); setCreateJson(JSON.stringify(data, null, 2)); } catch { setCreateJson(null); }
    setNewPlan({ planKey: '', name: '', hours: '', price: 0, setupFee: 0, badge: '', features: [], highlighted: false });
    await load();
    pushToast('Plan added');
    setAddOpen(false);
  };

  const card = { background: '#0b1220', border: '1px solid #1f2937', borderRadius: 14, padding: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.35)' } as const;
  const chip = { color: '#10b981', background: '#062e24', padding: '6px 12px', borderRadius: 999, fontWeight: 700 } as const;
  const inputBase = { padding: 10, border: '1px solid #334155', background: '#0f172a', color: '#e5e7eb', borderRadius: 10, outline: 'none' } as const;
  const btnPrimary = { padding: '8px 12px', borderRadius: 8, background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 14, border: '1px solid #1d4ed8', cursor: 'pointer' } as const;
  const btnSecondary = { padding: '8px 12px', borderRadius: 8, background: '#111827', color: '#e5e7eb', fontWeight: 600, fontSize: 14, border: '1px solid #374151', cursor: 'pointer' } as const;
  const thStyle = { padding: 10, textAlign: 'left' as const, background: '#0b1220', color: '#94a3b8', borderBottom: '1px solid #1f2937', position: 'sticky' as const, top: 0, zIndex: 1, textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.6 };
  const tdStyle = { padding: 10, borderTop: '1px solid #1f2937', verticalAlign: 'top' as const };
  const numCell = { textAlign: 'right' as const, width: 120, minWidth: 100 };
  const featuresCell = { minWidth: 260 } as const;

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto', color: '#e5e7eb' }}>
      <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 16, letterSpacing: -0.3 }}>Admin Pricing</h2>

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
        <div style={{ color: '#9ca3af', fontSize: 13 }}>Plans: {plans.length}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input placeholder="Search plans…" value={query} onChange={e => setQuery(e.target.value)} style={{ ...inputBase, width: 260 }} />
          <button onClick={() => load()} style={btnSecondary}>Refresh</button>
          <button onClick={() => setAddOpen(v => !v)} style={btnPrimary}>{addOpen ? 'Hide Add' : 'Add Plan'}</button>
        </div>
      </div>

      <div style={{ ...card, padding: 0, maxHeight: 460, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle }}>planKey</th>
              <th style={{ ...thStyle }}>name</th>
              <th style={{ ...thStyle }}>hours</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>price</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>setupFee</th>
              <th style={{ ...thStyle }}>badge</th>
              <th style={{ ...thStyle }}>features</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>highlighted</th>
              <th style={{ ...thStyle }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p, idx) => {
              const q = query.trim().toLowerCase();
              const matches = !q || [p.planKey, p.name, p.hours, String(p.price), String(p.setupFee), p.badge || '', ...(p.features||[])].join(' ').toLowerCase().includes(q);
              return (
              <tr key={p.planKey} onMouseEnter={() => setHoverRow(idx)} onMouseLeave={() => setHoverRow(r => (r===idx?null:r))} style={{ background: hoverRow === idx ? '#0e1a33' : (idx % 2 ? '#0b1426' : 'transparent'), transition: 'background 120ms ease', display: matches ? undefined : 'none' }}>
                <td style={tdStyle}>{p.planKey}</td>
                <td style={tdStyle}>
                  <input 
                    key={`${p.planKey}-name-${lang}`}
                    value={p.name} 
                    onChange={e => setPlanField(idx, 'name', e.target.value)} 
                    style={{ ...inputBase, width: '100%' }} 
                  />
                </td>
                <td style={tdStyle}>
                  <input 
                    key={`${p.planKey}-hours-${lang}`}
                    value={p.hours} 
                    onChange={e => setPlanField(idx, 'hours', e.target.value)} 
                    style={{ ...inputBase, width: '100%' }} 
                  />
                </td>
                <td style={{ ...tdStyle, ...numCell }}>
                  <input 
                    key={`${p.planKey}-price-${lang}`}
                    type="number" 
                    min={0} 
                    step={0.01} 
                    value={p.price} 
                    onChange={e => setPlanField(idx, 'price', Number(e.target.value))} 
                    style={{ ...inputBase, width: '100%', textAlign: 'right' as const }} 
                  />
                </td>
                <td style={{ ...tdStyle, ...numCell }}>
                  <input 
                    key={`${p.planKey}-setupFee-${lang}`}
                    type="number" 
                    min={0} 
                    step={0.01} 
                    value={p.setupFee} 
                    onChange={e => setPlanField(idx, 'setupFee', Number(e.target.value))} 
                    style={{ ...inputBase, width: '100%', textAlign: 'right' as const }} 
                  />
                </td>
                <td style={tdStyle}>
                  <input 
                    key={`${p.planKey}-badge-${lang}`}
                    value={p.badge || ''} 
                    onChange={e => setPlanField(idx, 'badge', e.target.value)} 
                    style={{ ...inputBase, width: '100%' }} 
                  />
                </td>
                <td style={{ ...tdStyle, ...featuresCell }}>
                  <textarea 
                    key={`${p.planKey}-features-${lang}`}
                    value={(p.features||[]).join('\n')} 
                    onChange={e => setPlanField(idx, 'features', e.target.value.split('\n').map(s=>s.trim()).filter(Boolean))} 
                    style={{ ...inputBase, width: '100%', minHeight: 64, resize: 'vertical' }} 
                  />
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <input type="checkbox" checked={p.highlighted} onChange={e => setPlanField(idx, 'highlighted', e.target.checked)} />
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button onClick={() => onSave(p)} disabled={!hasToken || !isDirty(idx)} style={{ ...btnPrimary, opacity: hasToken && isDirty(idx) ? 1 : 0.6 }}>{savingKey===p.planKey ? 'Saving…' : 'Save'}</button>
                    <button onClick={() => setPlans(prev => prev.map((pp, i) => (i===idx ? { ...originalPlans[idx] } : pp)))} disabled={!isDirty(idx)} style={{ ...btnSecondary, opacity: isDirty(idx) ? 1 : 0.6 }}>Revert</button>
                    <button onClick={() => setDeleteTarget(p)} disabled={!hasToken} style={{ ...btnSecondary, opacity: hasToken ? 1 : 0.6 }}>Delete</button>
                  </div>
                </td>
              </tr>
              );
            })}
            {plans.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>No plans yet. Click "Add Plan" to create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add new plan */}
      <details open={addOpen} onToggle={e => setAddOpen((e.target as HTMLDetailsElement).open)} style={{ marginTop: 16 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Add New Plan</summary>
        <div style={{ ...card, marginTop: 10 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <select 
              key="new-plan-planKey"
              value={newPlan.planKey} 
              onChange={e => setNewPlan(prev => ({ ...prev, planKey: e.target.value }))} 
              style={{ ...inputBase, flex: '1 1 260px' }}
            >
              <option value="">Select planKey</option>
              {['starter','professional','enterprise'].map(k => (
                <option key={k} value={k} disabled={plans.some(p => p.planKey === k)}>
                  {k}{plans.some(p => p.planKey === k) ? ' (added)' : ''}
                </option>
              ))}
            </select>
            <input 
              key="new-plan-name"
              placeholder="name" 
              value={newPlan.name} 
              onChange={e => setNewPlan(prev => ({ ...prev, name: e.target.value }))} 
              style={{ ...inputBase, flex: '1 1 260px' }} 
            />
            <input 
              key="new-plan-hours"
              placeholder="hours e.g. 10h/week" 
              value={newPlan.hours} 
              onChange={e => setNewPlan(prev => ({ ...prev, hours: e.target.value }))} 
              style={{ ...inputBase, flex: '1 1 220px' }} 
            />
            <input 
              key="new-plan-price"
              type="number" 
              placeholder="price" 
              min={0} 
              step={0.01} 
              value={newPlan.price} 
              onChange={e => setNewPlan(prev => ({ ...prev, price: Number(e.target.value) }))} 
              style={{ ...inputBase, width: 160, textAlign: 'right' as const }} 
            />
            <input 
              key="new-plan-setupFee"
              type="number" 
              placeholder="setupFee" 
              min={0} 
              step={0.01} 
              value={newPlan.setupFee} 
              onChange={e => setNewPlan(prev => ({ ...prev, setupFee: Number(e.target.value) }))} 
              style={{ ...inputBase, width: 160, textAlign: 'right' as const }} 
            />
            <input 
              key="new-plan-badge"
              placeholder="badge (optional)" 
              value={newPlan.badge || ''} 
              onChange={e => setNewPlan(prev => ({ ...prev, badge: e.target.value }))} 
              style={{ ...inputBase, flex: '1 1 220px' }} 
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>highlighted
              <input 
                key="new-plan-highlighted"
                type="checkbox" 
                checked={newPlan.highlighted} 
                onChange={e => setNewPlan(prev => ({ ...prev, highlighted: e.target.checked }))} 
              />
            </label>
            <textarea 
              key="new-plan-features"
              rows={4} 
              placeholder="features (one per line)" 
              value={(newPlan.features||[]).join('\n')} 
              onChange={e => setNewPlan(prev => ({ ...prev, features: e.target.value.split('\n').map(s=>s.trim()).filter(Boolean) }))} 
              style={{ ...inputBase, flex: '1 1 100%', minHeight: 110, resize: 'vertical' }} 
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <button onClick={onAdd} disabled={!newPlan.planKey || !hasToken} style={{ ...btnPrimary, opacity: newPlan.planKey && hasToken ? 1 : 0.6 }}>Add Plan</button>
            <button onClick={prefillSample} style={{ ...btnSecondary, marginLeft: 8 }}>Prefill sample</button>
            <button onClick={importFromJson} style={{ ...btnSecondary, marginLeft: 8 }}>Import JSON</button>
          </div>
          <div style={{ marginTop: 10 }}>
            <textarea
              placeholder='Paste JSON body here (optionally { "lang": "en", "plan": { ... } })'
              value={importJson}
              onChange={e => setImportJson(e.target.value)}
              style={{ ...inputBase, width: '100%', minHeight: 120 }}
            />
          </div>
          {createJson && (
            <div style={{ marginTop: 12, padding: 12, background: '#0b1220', border: '1px solid #1f2937', borderRadius: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Server response</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{createJson}</pre>
            </div>
          )}
        </div>
      </details>
      {toast && (
        <div style={{ position: 'fixed', right: 16, bottom: 16, background: toast.type==='success' ? '#062e24' : '#3f1d1d', color: toast.type==='success' ? '#10b981' : '#f87171', border: '1px solid #1f2937', borderRadius: 10, padding: '10px 14px', fontWeight: 600 }}>
          {toast.message}
        </div>
      )}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#0b1220', border: '1px solid #1f2937', borderRadius: 12, padding: 16, minWidth: 340 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Delete plan</div>
            <div style={{ color: '#cbd5e1', marginBottom: 12 }}>Are you sure you want to delete "{deleteTarget.planKey}"?</div>
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

function isEqualPlan(a: Plan, b: Plan) {
  return a.name===b.name && a.hours===b.hours && a.price===b.price && a.setupFee===b.setupFee && (a.badge||'')===(b.badge||'') && JSON.stringify(a.features||[])===JSON.stringify(b.features||[]) && !!a.highlighted===!!b.highlighted;
}

 

