import { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  DollarSign, Search, RefreshCw, Plus, X, Save, Trash2, 
  CheckCircle2, AlertCircle, Loader2, Globe, Shield, FileText
} from 'lucide-react';
import { Toast, StatusBadge, ActionButton, PageHeader, ControlsBar, AdminInput, AdminSelect, FormField, AddFormCard } from './AdminFormComponents';

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
  'http://localhost:5001';

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
  
  const headers = useCallback((): Record<string, string> => {
    const tk = token.trim();
    return tk ? { Authorization: `Bearer ${tk}` } : {};
  }, [token]);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Add-form feature input
  const [featureInput, setFeatureInput] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  // Removed inline AddFormCard; using modal-only flow
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [editTarget, setEditTarget] = useState<Plan | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  // Edit modal feature input
  const [editFeatureInput, setEditFeatureInput] = useState<string>('');
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Quick price edit modal state
  const [quickEditTarget, setQuickEditTarget] = useState<Plan | null>(null);
  const [quickPriceValue, setQuickPriceValue] = useState<string>('');
  const [quickSaving, setQuickSaving] = useState(false);

  const openQuickPriceEdit = (p: Plan) => {
    setQuickEditTarget(p);
    setQuickPriceValue(String(p.price.toFixed(2)));
  };

  const saveQuickPrice = async () => {
    if (!quickEditTarget) return;
    const v = Number(quickPriceValue);
    if (isNaN(v) || v < 0) { pushToast('Price must be a non-negative number', 'error'); return; }
    if (!hasToken) { pushToast('Admin token required', 'error'); return; }
    const url = `${API_BASE}/api/admin/pricing/${quickEditTarget.planKey}`;
    setQuickSaving(true);
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, updates: { price: v } }),
    });
    if (!res.ok) { await logHttpError(res, `PUT ${url}`); setQuickSaving(false); return pushToast('Save failed: ' + res.status, 'error'); }
    await load();
    pushToast('Price updated');
    setQuickSaving(false);
    setQuickEditTarget(null);
  };

  const pushToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3000);
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
      if (res.status === 401) {
        try { localStorage.removeItem('adminToken'); } catch (e) { void e; }
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      const order = ['starter','professional','enterprise'];
      const list: Plan[] = Array.isArray(data.plans) ? data.plans.slice().sort((a: Plan,b: Plan)=> order.indexOf(a.planKey)-order.indexOf(b.planKey)) : [];
      setPlans(list);
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

  // Close modals on ESC for better accessibility
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (addModalOpen) setAddModalOpen(false);
        if (editTarget) handleCancelEdit();
        if (deleteTarget) setDeleteTarget(null);
        if (quickEditTarget) setQuickEditTarget(null);
      }
    };
    if (addModalOpen || editTarget) {
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
  }, [addModalOpen, editTarget]);

  // Edit helpers
  const handleEditClick = (plan: Plan) => {
    setEditTarget(plan);
    setEditingPlan(structuredClone(plan));
  };

  const handleEditField = (key: keyof Plan, value: Plan[keyof Plan]) => {
    if (!editingPlan) return;
    setEditingPlan({ ...editingPlan, [key]: value });
  };

  const handleSaveEdit = async () => {
    if (!editingPlan || !editTarget) return;
    const err = validateCore(editingPlan);
    if (err) return pushToast(err, 'error');
    if (!hasToken) return pushToast('Admin token required', 'error');
    
    const updates: Partial<Omit<Plan, 'planKey'>> = {
      name: editingPlan.name,
      hours: editingPlan.hours,
      price: editingPlan.price,
      setupFee: editingPlan.setupFee,
      badge: editingPlan.badge,
      features: editingPlan.features,
      highlighted: editingPlan.highlighted,
    };
    const url = `${API_BASE}/api/admin/pricing/${editTarget.planKey}`;
    setSavingKey(editTarget.planKey);
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, updates }),
    });
    if (!res.ok) { await logHttpError(res, `PUT ${url}`); setSavingKey(null); return pushToast('Save failed: ' + res.status, 'error'); }
    await load();
    pushToast('Plan saved successfully');
    setSavingKey(null);
    setEditTarget(null);
    setEditingPlan(null);
  };

  const handleCancelEdit = () => {
    setEditTarget(null);
    setEditingPlan(null);
  };

  // Feature chip helpers (Add Form)
  const addFeature = () => {
    const v = featureInput.trim();
    if (!v) return;
    const current = newPlan.features || [];
    if (current.includes(v)) { setFeatureInput(''); return; }
    setNewPlan({ ...newPlan, features: [...current, v] });
    setFeatureInput('');
  };

  const removeFeature = (idx: number) => {
    const arr = (newPlan.features || []).slice();
    arr.splice(idx, 1);
    setNewPlan({ ...newPlan, features: arr });
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
    const __ENV = ((import.meta as unknown) as { env?: Record<string, any> }).env || {};
    if (__ENV && __ENV.DEV) {
      console.error('[AdminPricing] request failed', {
        context,
        url: res.url,
        status: res.status,
        statusText: res.statusText,
      });
      if (body) console.error('[AdminPricing] response body:', body);
    }
  };


  const onDelete = async (p: Plan) => {
    if (!hasToken) return pushToast('Admin token required', 'error');
    const url = `${API_BASE}/api/admin/pricing/${p.planKey}?lang=${lang}`;
    const res = await fetch(url, {
      method: 'DELETE', headers: headers()
    });
    if (!res.ok) { await logHttpError(res, `DELETE ${url}`); return pushToast('Delete failed: ' + res.status, 'error'); }
    await load();
    pushToast('Plan deleted successfully');
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
    pushToast('Sample data prefilled');
  };

  const onAdd = async () => {
    if (!hasToken) return pushToast('Admin token required', 'error');
    if (!newPlan.planKey) return pushToast('planKey required', 'error');
    const allowed = ['starter','professional','enterprise'];
    if (!allowed.includes(newPlan.planKey)) return pushToast('planKey must be: ' + allowed.join(', '), 'error');
    const existingKeys = new Set(plans.map(p => p.planKey));
    if (existingKeys.has(newPlan.planKey)) return pushToast(`Plan with key "${newPlan.planKey}" already exists for ${lang}.`, 'error');
    const err = validateCore(newPlan);
    if (err) return pushToast(err, 'error');
    const url = `${API_BASE}/api/admin/pricing`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, plan: newPlan }),
    });
    if (!res.ok) {
      if (res.status === 409) {
        return pushToast('This plan already exists for the selected language.', 'error');
      }
      await logHttpError(res, `POST ${url}`);
      return pushToast('Add failed: ' + res.status, 'error');
    }
    // Response body not shown; simplifying UI
    setNewPlan({ planKey: '', name: '', hours: '', price: 0, setupFee: 0, badge: '', features: [], highlighted: false });
    await load();
    pushToast('Plan added successfully');
    setAddModalOpen(false);
  };

  // Debounce search input to reduce re-renders
  useEffect(() => {
    const h = window.setTimeout(() => {
      setSearchTerm(query.trim().toLowerCase());
    }, 200);
    return () => window.clearTimeout(h);
  }, [query]);

  const filteredPlans = useMemo(() => {
    const q = searchTerm;
    if (!q) return plans;
    return plans.filter(p => 
      [p.planKey, p.name, p.hours, String(p.price), String(p.setupFee), p.badge || '', ...(p.features||[])]
        .join(' ').toLowerCase().includes(q)
    );
  }, [plans, searchTerm]);

  // Currency formatter helper for previews
  const fmtCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number.isFinite(n) ? n : 0);

  // Shared Add Form fields renderer (used in card and modal)
  const renderAddFormFields = (options?: { autoFocus?: boolean }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FormField label="Plan Key" required>
        <AdminSelect
          value={newPlan.planKey}
          onChange={e => setNewPlan({ ...newPlan, planKey: (e.target as HTMLSelectElement).value })}
        >
          <option value="">Select planKey</option>
          {['starter','professional','enterprise'].map(k => (
            <option key={k} value={k} disabled={plans.some(p => p.planKey === k)}>
              {k}{plans.some(p => p.planKey === k) ? ' (added)' : ''}
            </option>
          ))}
        </AdminSelect>
      </FormField>
      <FormField label="Name" required>
        <AdminInput
          type="text"
          placeholder="Plan name"
          value={newPlan.name}
          onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
          autoFocus={Boolean(options?.autoFocus)}
        />
      </FormField>
      <FormField label="Hours" required>
        <AdminInput
          type="text"
          placeholder="e.g. 10h/week"
          value={newPlan.hours}
          onChange={e => setNewPlan({ ...newPlan, hours: e.target.value })}
        />
      </FormField>
      <FormField label="Price" required>
        <AdminInput
          type="number"
          placeholder="0.00"
          min={0}
          step={0.01}
          value={newPlan.price}
          onChange={e => setNewPlan({ ...newPlan, price: Number((e.target as HTMLInputElement).value) })}
          className="font-mono"
        />
        <div className="text-xs text-slate-400 mt-1">{fmtCurrency(newPlan.price || 0)}</div>
      </FormField>
      <FormField label="Setup Fee" required>
        <AdminInput
          type="number"
          placeholder="0.00"
          min={0}
          step={0.01}
          value={newPlan.setupFee}
          onChange={e => setNewPlan({ ...newPlan, setupFee: Number((e.target as HTMLInputElement).value) })}
          className="font-mono"
        />
        <div className="text-xs text-slate-400 mt-1">{fmtCurrency(newPlan.setupFee || 0)}</div>
      </FormField>
      <FormField label="Badge (Optional)">
        <AdminInput
          type="text"
          placeholder="e.g. Best Value"
          value={newPlan.badge || ''}
          onChange={e => setNewPlan({ ...newPlan, badge: e.target.value })}
        />
      </FormField>
      <div className="md:col-span-2 lg:col-span-3">
        <FormField label="Features" required>
          <div className="flex items-center gap-3">
            <AdminInput
              type="text"
              placeholder="Type a feature and press Enter"
              value={featureInput}
              onChange={e => setFeatureInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
              className="text-sm"
            />
            <ActionButton variant="secondary" onClick={addFeature} icon={Plus}>
              Add
            </ActionButton>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(newPlan.features || []).map((f, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-600/60 bg-slate-700/40 text-slate-200 text-sm max-w-[220px]">
                <span className="truncate">{f}</span>
                <button type="button" onClick={() => removeFeature(i)} className="hover:text-red-300 transition-colors" title="Remove feature">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </FormField>
      </div>
      <FormField label="Highlighted">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={newPlan.highlighted}
            onChange={e => setNewPlan({ ...newPlan, highlighted: e.target.checked })}
            className="w-5 h-5 rounded border-slate-700/60 bg-slate-900/60 text-gold focus:ring-2 focus:ring-gold/50 cursor-pointer"
          />
          <span className="text-sm font-semibold text-slate-300">Highlighted</span>
        </label>
      </FormField>
    </div>
  );

  return (
    <div className="w-full py-6">
      <PageHeader
        title="Pricing Plans Management"
        description="Manage your pricing plans for English and German languages"
        icon={DollarSign}
        status={
          <StatusBadge type="success" icon={CheckCircle2}>
            Synced
          </StatusBadge>
        }
      />
      <ControlsBar>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
          <div className="flex items-center gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Language</span>
              <AdminSelect
                value={lang}
                onChange={e => setLang((e.target as HTMLSelectElement).value as Lang)}
                className="font-semibold cursor-pointer"
              >
                <option value="en">🇬🇧 English</option>
                <option value="de">🇩🇪 Deutsch</option>
              </AdminSelect>
            </label>
            {loading && (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 text-red-400 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 sm:ml-auto">
            <ActionButton variant="secondary" onClick={load} icon={RefreshCw}>
              Refresh
            </ActionButton>
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/40 rounded-lg border border-slate-700/50">
              <Globe className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-400 font-mono">{API_BASE}</span>
              <div className="w-px h-4 bg-slate-700/50" />
              <Shield className={`w-3 h-3 ${hasToken ? 'text-green-400' : 'text-red-400'}`} />
              <span className={`text-xs font-semibold ${hasToken ? 'text-green-300' : 'text-red-300'}`}>
                {hasToken ? 'Auth' : 'No Auth'}
              </span>
            </div>
          </div>
        </div>
      </ControlsBar>

      {/* Inline AddFormCard removed; use modal via actions bar */}

      {/* Stats and Actions Bar */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="px-5 py-3 bg-gradient-to-br from-gold/20 to-yellow-500/10 rounded-xl border border-gold/30 shadow-lg shadow-gold/10">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gold" />
                <div>
                  <div className="text-xs font-bold text-gold/80 uppercase tracking-wider">Total Plans</div>
                  <div className="text-2xl font-extrabold text-white">{plans.length}</div>
                </div>
              </div>
            </div>
            {plans.length > 0 && (
              <StatusBadge type="success" icon={CheckCircle2}>
                Active
              </StatusBadge>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <AdminInput
                type="text"
                placeholder="Search plans…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="pl-11 w-64"
              />
            </div>
            <ActionButton
              variant="secondary"
              onClick={load}
              icon={RefreshCw}
            >
              Refresh
            </ActionButton>
            <ActionButton
              variant="secondary"
              onClick={() => setAddModalOpen(true)}
              icon={Plus}
            >
              Open Add Plan Modal
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-900/60 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-gradient-to-b from-gold to-yellow-500 rounded-full" />
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Pricing Plans Table</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-700/50 to-transparent" />
            <span className="text-xs text-slate-500 font-semibold">{filteredPlans.length} {filteredPlans.length === 1 ? 'plan' : 'plans'}</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900/80 sticky top-0 z-10">
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b-2 border-r border-slate-700/60">Plan Key</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b-2 border-r border-slate-700/60">Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b-2 border-r border-slate-700/60">Hours</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider border-b-2 border-r border-slate-700/60">Price</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider border-b-2 border-r border-slate-700/60">Setup Fee</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b-2 border-r border-slate-700/60">Badge</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b-2 border-r border-slate-700/60 min-w-[260px]">Features</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b-2 border-r border-slate-700/60">Highlighted</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b-2 border-slate-700/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlans.map((p, idx) => {
                return (
                  <tr
                    key={p.planKey}
                    onClick={() => handleEditClick(p)}
                    onMouseEnter={() => setHoverRow(idx)}
                    onMouseLeave={() => setHoverRow(null)}
                    className={`transition-all duration-200 cursor-pointer ${
                      hoverRow === idx
                        ? 'bg-gold/10 border-l-4 border-gold'
                        : idx % 2
                        ? 'bg-slate-900/20'
                        : 'bg-transparent'
                    } hover:bg-gold/10 hover:border-l-4 hover:border-gold`}
                  >
                    <td className="px-4 py-3 border-t border-slate-700/30">
                      <span className="font-mono text-sm font-semibold text-slate-300">{p.planKey}</span>
                    </td>
                    <td className="px-4 py-3 border-t border-slate-700/30">
                      <span className="text-sm text-white">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 border-t border-slate-700/30">
                      <span className="text-sm text-slate-300">{p.hours}</span>
                    </td>
                    <td className="px-4 py-3 border-t border-slate-700/30 text-right">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openQuickPriceEdit(p); }}
                        className="text-sm text-white font-mono underline decoration-dotted hover:text-gold"
                        title="Click to quick edit price"
                      >
                        {fmtCurrency(p.price)}
                      </button>
                    </td>
                    <td className="px-4 py-3 border-t border-slate-700/30 text-right">
                      <span className="text-sm text-white font-mono">{fmtCurrency(p.setupFee)}</span>
                    </td>
                    <td className="px-4 py-3 border-t border-slate-700/30">
                      <span className="text-sm text-slate-300">{p.badge || '-'}</span>
                    </td>
                    <td className="px-4 py-3 border-t border-slate-700/30 min-w-[260px]">
                      <div className="flex flex-wrap gap-1">
                        {(p.features || []).map((f, i) => (
                          <span key={i} title={f} className="px-2 py-0.5 rounded-full border border-slate-600/60 bg-slate-700/40 text-slate-200 text-xs max-w-[200px]">
                            <span className="truncate inline-block align-middle">{f}</span>
                          </span>
                        ))}
                        {(!p.features || p.features.length === 0) && (
                          <span className="text-slate-500 text-sm">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-t border-slate-700/30 text-center">
                      {p.highlighted ? (
                        <CheckCircle2 className="w-5 h-5 text-gold mx-auto" />
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-t border-slate-700/30">
                      <div className="flex items-center gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          disabled={!hasToken}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Delete plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPlans.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold mb-1">No plans found</p>
                        <p className="text-sm text-slate-500">
                          {query ? 'Try adjusting your search' : 'Click "Add New Plan" to create one'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>



      {/* Edit Plan Modal */}
      {editTarget && editingPlan && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200" onClick={handleCancelEdit}>
          <div role="dialog" aria-modal="true" aria-labelledby="edit-plan-modal-title" className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-transform duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/20 rounded-lg border border-gold/30">
                  <DollarSign className="w-5 h-5 text-gold" />
                </div>
                <h3 id="edit-plan-modal-title" className="text-xl font-bold text-white">Edit Plan: {editTarget.planKey}</h3>
              </div>
              <button
                onClick={handleCancelEdit}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Plan Key</label>
                <AdminInput
                  type="text"
                  value={editTarget.planKey}
                  disabled
                  className="text-slate-500 cursor-not-allowed font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Name *</label>
                <AdminInput
                  type="text"
                  placeholder="Plan name"
                  value={editingPlan.name}
                  onChange={e => handleEditField('name', (e.target as HTMLInputElement).value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Hours *</label>
                <AdminInput
                  type="text"
                  placeholder="e.g. 10h/week"
                  value={editingPlan.hours}
                  onChange={e => handleEditField('hours', (e.target as HTMLInputElement).value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Price *</label>
                <AdminInput
                  type="number"
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  value={editingPlan.price}
                  onChange={e => handleEditField('price', Number((e.target as HTMLInputElement).value))}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Setup Fee *</label>
                <AdminInput
                  type="number"
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  value={editingPlan.setupFee}
                  onChange={e => handleEditField('setupFee', Number((e.target as HTMLInputElement).value))}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Badge (Optional)</label>
                <AdminInput
                  type="text"
                  placeholder="e.g. Best Value"
                  value={editingPlan.badge || ''}
                  onChange={e => handleEditField('badge', (e.target as HTMLInputElement).value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-300 mb-2">Features *</label>
                <div className="flex items-center gap-3">
                  <AdminInput
                    type="text"
                    placeholder="Type a feature and press Enter"
                    value={editFeatureInput}
                    onChange={e => setEditFeatureInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEditFeature(); } }}
                    className="text-sm"
                  />
                  <ActionButton variant="secondary" onClick={addEditFeature} icon={Plus}>
                    Add
                  </ActionButton>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(editingPlan.features || []).map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-600/60 bg-slate-700/40 text-slate-200 text-sm max-w-[220px]">
                      <span className="truncate">{f}</span>
                      <button type="button" onClick={() => removeEditFeature(i)} className="hover:text-red-300 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.highlighted}
                    onChange={e => handleEditField('highlighted', e.target.checked)}
                    className="w-5 h-5 rounded border-slate-700/60 bg-slate-900/60 text-gold focus:ring-2 focus:ring-gold/50 cursor-pointer"
                  />
                  <span className="text-sm font-semibold text-slate-300">Highlighted</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/60">
              <ActionButton
                variant="secondary"
                onClick={handleCancelEdit}
                icon={X}
              >
                Cancel
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={handleSaveEdit}
                loading={savingKey === editTarget.planKey}
                disabled={!hasToken}
                icon={Save}
              >
                Save Changes
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Quick Price Edit Modal */}
      {quickEditTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200" onClick={() => setQuickEditTarget(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="quick-price-modal-title" className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 max-w-md w-full shadow-2xl transition-transform duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/20 rounded-lg border border-gold/30">
                  <DollarSign className="w-5 h-5 text-gold" />
                </div>
                <h3 id="quick-price-modal-title" className="text-lg font-bold text-white">Quick Edit Price: {quickEditTarget.planKey}</h3>
              </div>
              <button
                onClick={() => setQuickEditTarget(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block text-sm font-semibold text-slate-300 mb-2">New Price *</label>
            <AdminInput
              type="number"
              placeholder="0.00"
              min={0}
              step={0.01}
              value={quickPriceValue}
              onChange={e => setQuickPriceValue((e.target as HTMLInputElement).value)}
              className="font-mono"
            />
            <div className="text-xs text-slate-400 mt-1">{fmtCurrency(Number(quickPriceValue) || 0)}</div>

            <div className="flex justify-end gap-3 pt-4">
              <ActionButton variant="secondary" onClick={() => setQuickEditTarget(null)} icon={X}>
                Cancel
              </ActionButton>
              <ActionButton variant="primary" onClick={saveQuickPrice} loading={quickSaving} icon={Save}>
                Save Price
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Add Plan Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200" onClick={() => setAddModalOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="add-plan-modal-title" className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-transform duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/20 rounded-lg border border-gold/30">
                  <Plus className="w-5 h-5 text-gold" />
                </div>
                <h3 id="add-plan-modal-title" className="text-xl font-bold text-white">Create New Pricing Plan</h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderAddFormFields({ autoFocus: true })}

            <div className="flex items-center gap-3 pt-6">
              <ActionButton
                variant="primary"
                onClick={onAdd}
                disabled={!newPlan.planKey || !hasToken}
                icon={CheckCircle2}
              >
                Add Plan
              </ActionButton>
              <ActionButton variant="secondary" onClick={prefillSample} icon={FileText}>
                Prefill Sample
              </ActionButton>
              <ActionButton variant="ghost" onClick={() => setAddModalOpen(false)}>
                Close
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200" onClick={() => setDeleteTarget(null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-plan-modal-title" className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 max-w-md w-full shadow-2xl transition-transform duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 id="delete-plan-modal-title" className="text-xl font-bold text-white">Delete Plan</h3>
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to delete plan <strong className="text-red-400">"{deleteTarget.planKey}"</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <ActionButton
                variant="secondary"
                onClick={() => setDeleteTarget(null)}
                icon={X}
              >
                Cancel
              </ActionButton>
              <ActionButton
                variant="danger"
                onClick={() => { const t = deleteTarget; setDeleteTarget(null); if (t) void onDelete(t); }}
                icon={Trash2}
              >
                Delete
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

