import { useCallback, useEffect, useMemo, useState } from 'react';
import { HelpCircle, Plus, Search, RefreshCw, Save, RotateCcw, Trash2, Globe, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AddFormCard, FormField, AdminInput, AdminTextarea, AdminSelect, PageHeader, ControlsBar, StatusBadge, ActionButton, Toast } from './AdminFormComponents';

type Lang = 'en' | 'de';

interface FAQItem {
  _id?: string;
  order?: number;
  question: string;
  answer: string;
}

const API_BASE =
  ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_API_BASE ||
  'http://localhost:5001';

export default function AdminFAQ() {
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

  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [originalFaqs, setOriginalFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FAQItem | null>(null);
  const [query, setQuery] = useState('');
  // Modal edit state similar to Pricing/How It Works
  const [editTarget, setEditTarget] = useState<FAQItem | null>(null);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);

  const isDirty = useCallback((idx: number) => {
    if (!originalFaqs[idx]) return true;
    return !isEqualFAQ(faqs[idx], originalFaqs[idx]);
  }, [faqs, originalFaqs]);

  const pushToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 3000);
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
      const res = await fetch(`${API_BASE}/api/admin/faq?lang=${lang}`, { headers: headers() });
      if (res.status === 401) {
        try { localStorage.removeItem('adminToken'); } catch (e) { void e; }
        window.location.href = '/admin/login';
        return;
      }
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      const list: FAQItem[] = Array.isArray(data.faqs) ? data.faqs.slice().sort((a: FAQItem, b: FAQItem) => (a.order ?? 0) - (b.order ?? 0)) : [];
      setFaqs(list);
      setOriginalFaqs(JSON.parse(JSON.stringify(list)) as FAQItem[]);
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

  const setFAQField = (idx: number, key: keyof FAQItem, value: FAQItem[keyof FAQItem]) => {
    setFaqs(prev => prev.map((f, i) => (i === idx ? { ...f, [key]: value } : f)));
  };

  const validateCore = (f: Pick<FAQItem, 'order'|'question'|'answer'>) => {
    if ((f.order ?? 0) < 0) return 'Order must be non-negative';
    if (!f.question.trim()) return 'Question is required';
    if (!f.answer.trim()) return 'Answer is required';
    return null;
  };

  const logHttpError = async (res: Response, context: string) => {
    if (import.meta.env.DEV) {
      let body = '';
      try { body = await res.clone().text(); } catch { /* ignore */ }
      console.error('[AdminFAQ] request failed', {
        context,
        url: res.url,
        status: res.status,
        statusText: res.statusText,
      });
      if (body) console.error('[AdminFAQ] response body:', body);
    }
  };

  const onSave = async (f: FAQItem) => {
    const err = validateCore(f);
    if (err) return pushToast(err, 'error');
    if (!hasToken) return pushToast('Admin token required', 'error');
    if (!f._id) return pushToast('FAQ ID is required', 'error');
    const updates: Partial<Omit<FAQItem, '_id'>> = {
      question: f.question,
      answer: f.answer,
    };
    const url = `${API_BASE}/api/admin/faq/${f._id}`;
    setSavingOrder(f.order ?? 0);
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({ lang, updates }),
      });
      if (!res.ok) { 
        await logHttpError(res, `PUT ${url}`); 
        pushToast(`Save failed: ${res.status}`, 'error');
        return;
      }
      await load();
      pushToast('FAQ saved successfully');
    } finally {
      setSavingOrder(null);
    }
  };

  const onDelete = async (f: FAQItem) => {
    if (!hasToken) return pushToast('Admin token required', 'error');
    if (!f._id) return pushToast('FAQ ID is required', 'error');
    const url = `${API_BASE}/api/admin/faq/${f._id}?lang=${lang}`;
    const res = await fetch(url, {
      method: 'DELETE', headers: headers()
    });
    if (!res.ok) { 
      await logHttpError(res, `DELETE ${url}`); 
      pushToast(`Delete failed: ${res.status}`, 'error');
      return;
    }
    await load();
    pushToast('FAQ deleted successfully');
  };

  const [newFAQ, setNewFAQ] = useState<FAQItem>({
    order: 0, question: '', answer: ''
  });

  const prefillSample = () => {
    const orderNum = faqs.length > 0 ? Math.max(...faqs.map(f => f.order ?? 0)) + 1 : 0;
    const sample: FAQItem = {
      order: orderNum,
      question: lang === 'de' ? 'Beispiel Frage?' : 'Sample Question?',
      answer: lang === 'de' ? 'Dies ist eine Beispielantwort.' : 'This is a sample answer.',
    };
    setNewFAQ(sample);
  };

  const onAdd = async () => {
    if (!hasToken) {
      pushToast('Admin token required', 'error');
      return;
    }
    if ((newFAQ.order ?? 0) < 0) {
      pushToast('Order must be non-negative', 'error');
      return;
    }
    const existingOrders = new Set(faqs.map(f => f.order ?? 0));
    if (existingOrders.has(newFAQ.order ?? 0)) {
      pushToast(`Order ${newFAQ.order ?? 0} already exists for ${lang}`, 'error');
      return;
    }
    const err = validateCore(newFAQ);
    if (err) {
      pushToast(err, 'error');
      return;
    }
    setAdding(true);
    const url = `${API_BASE}/api/admin/faq`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers() },
        body: JSON.stringify({ lang, faq: newFAQ }),
      });
      if (!res.ok) {
        if (res.status === 409) {
          pushToast('This order already exists for the selected language.', 'error');
          return;
        }
        await logHttpError(res, `POST ${url}`);
        pushToast(`Add failed: ${res.status}`, 'error');
        return;
      }
      setNewFAQ({ order: 0, question: '', answer: '' });
      await load();
      pushToast('FAQ added successfully!');
      setAddOpen(false);
    } finally {
      setAdding(false);
    }
  };

  if (loading && faqs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-lg flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading FAQs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-4 w-72 h-72 bg-gold/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="FAQ Management"
          description="Manage frequently asked questions for English and German languages"
          icon={HelpCircle}
          status={
            <div className="flex items-center gap-3">
              {error && <StatusBadge type="error" icon={AlertCircle}>{error}</StatusBadge>}
              <StatusBadge type={hasToken ? 'success' : 'error'}>
                {hasToken ? 'Authenticated' : 'Not Authenticated'}
              </StatusBadge>
            </div>
          }
        />

        <ControlsBar>
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 max-w-xs">
              <FormField label="Language">
                <AdminSelect
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Lang)}
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="de">🇩🇪 Deutsch</option>
                </AdminSelect>
              </FormField>
            </div>
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <AdminInput
                  type="text"
                  placeholder="Search FAQs..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ActionButton
                variant="secondary"
                onClick={load}
                disabled={loading}
                icon={RefreshCw}
                loading={loading}
              >
                Refresh
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={() => setAddOpen(true)}
                icon={Plus}
              >
                Add FAQ
              </ActionButton>
            </div>
          </div>
        </ControlsBar>

        {/* Stats Bar */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-4 mb-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total FAQs</div>
                <div className="text-2xl font-bold text-white">{faqs.length}</div>
              </div>
              <div className="h-8 w-px bg-slate-700/60"></div>
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Language</div>
                <div className="text-lg font-semibold text-gold">{lang === 'en' ? 'English' : 'Deutsch'}</div>
              </div>
            </div>
            {faqs.length > 0 && (
              <div className="text-sm text-slate-400">
                Showing {faqs.filter((f, idx) => {
                  const q = query.trim().toLowerCase();
                  return !q || [String(f.order ?? 0), f.question, f.answer].join(' ').toLowerCase().includes(q);
                }).length} of {faqs.length}
              </div>
            )}
          </div>
        </div>

        {/* FAQs Table */}
        {faqs.length > 0 ? (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/60 bg-slate-900/40">
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Question</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Answer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {faqs.map((f, idx) => {
                    const q = query.trim().toLowerCase();
                    const matches = !q || [String(f.order ?? 0), f.question, f.answer].join(' ').toLowerCase().includes(q);
                    if (!matches) return null;
                    const dirty = isDirty(idx);
                    return (
                      <tr
                        key={f._id || (f.order ?? 0)}
                        onMouseEnter={() => setHoverRow(idx)}
                        onMouseLeave={() => setHoverRow(null)}
                        onClick={() => { setEditTarget(f); setEditingFAQ({ ...f }); }}
                        className={`transition-colors ${
                          hoverRow === idx
                            ? 'bg-slate-800/50'
                            : idx % 2
                            ? 'bg-slate-900/20'
                            : 'bg-transparent'
                        } cursor-pointer`}
                      >
                        <td className="px-4 py-4">
                          <AdminInput
                            type="number"
                            min={0}
                            value={f.order}
                            onChange={(e) => setFAQField(idx, 'order', Number(e.target.value))}
                            className="w-20 text-center"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <AdminInput
                            type="text"
                            value={f.question}
                            onChange={(e) => setFAQField(idx, 'question', e.target.value)}
                            className="w-full"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <AdminTextarea
                            value={f.answer}
                            onChange={(e) => setFAQField(idx, 'answer', e.target.value)}
                            className="w-full min-h-[80px]"
                            rows={3}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <ActionButton
                              variant="primary"
                              size="sm"
                              onClick={() => onSave(f)}
                              disabled={!hasToken || !dirty}
                              loading={savingOrder === (f.order ?? 0)}
                              icon={Save}
                            >
                              Save
                            </ActionButton>
                            <ActionButton
                              variant="secondary"
                              size="sm"
                              onClick={() => setFaqs(prev => prev.map((ff, i) => (i === idx ? { ...originalFaqs[idx] } : ff)))}
                              disabled={!dirty}
                              icon={RotateCcw}
                            >
                              Revert
                            </ActionButton>
                            <ActionButton
                              variant="danger"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(f); }}
                              disabled={!hasToken}
                              icon={Trash2}
                            >
                              Delete
                            </ActionButton>
                            <ActionButton
                              variant="secondary"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); setEditTarget(f); setEditingFAQ({ ...f }); }}
                            >
                              Edit
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-12 shadow-xl text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center">
                <HelpCircle className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">No FAQs yet</h3>
                <p className="text-slate-400 text-sm">Get started by adding your first frequently asked question</p>
              </div>
              <ActionButton
                variant="primary"
                onClick={() => setAddOpen(true)}
                icon={Plus}
              >
                Add Your First FAQ
              </ActionButton>
            </div>
          </div>
        )}

        {/* Add Form */}
        <div className="mt-6">
          <AddFormCard
            title="Add New FAQ"
            isOpen={addOpen}
            onToggle={() => setAddOpen(!addOpen)}
            icon={HelpCircle}
            description="Create a new frequently asked question"
            onAdd={onAdd}
            onPrefill={prefillSample}
            canAdd={newFAQ.order >= 0 && hasToken && !!newFAQ.question.trim() && !!newFAQ.answer.trim()}
            adding={adding}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Order" required helpText="Display order (must be unique)">
                <AdminInput
                  type="number"
                  min={0}
                  value={newFAQ.order}
                  onChange={(e) => setNewFAQ({ ...newFAQ, order: Number(e.target.value) })}
                  placeholder="0"
                  error={newFAQ.order < 0}
                />
              </FormField>
              <FormField label="Question" required className="md:col-span-2">
                <AdminInput
                  type="text"
                  value={newFAQ.question}
                  onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                  placeholder="e.g., How does it work?"
                />
              </FormField>
            </div>
            <FormField label="Answer" required helpText="Detailed answer to the question">
              <AdminTextarea
                value={newFAQ.answer}
                onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                placeholder="Provide a detailed answer..."
                rows={4}
              />
            </FormField>
          </AddFormCard>
        </div>
      </div>

      {/* Add FAQ Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setAddOpen(false)}>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 shadow-2xl max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/20 rounded-lg border border-gold/30">
                  <HelpCircle className="w-5 h-5 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-white">Add New FAQ</h3>
              </div>
              <button onClick={() => setAddOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg" aria-label="Close">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Order" required>
                <AdminInput type="number" min={0} value={newFAQ.order} onChange={(e) => setNewFAQ({ ...newFAQ, order: Number(e.target.value) })} />
              </FormField>
              <FormField label="Question" required className="md:col-span-2">
                <AdminInput type="text" value={newFAQ.question} onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })} />
              </FormField>
              <FormField label="Answer" required className="md:col-span-3">
                <AdminTextarea rows={4} value={newFAQ.answer} onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })} />
              </FormField>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <ActionButton variant="secondary" onClick={prefillSample}>Prefill Sample</ActionButton>
              <ActionButton variant="primary" onClick={onAdd} disabled={!hasToken || newFAQ.order < 0 || !newFAQ.question.trim() || !newFAQ.answer.trim()} loading={adding}>Add FAQ</ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Edit FAQ Modal */}
      {editTarget && editingFAQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setEditTarget(null); setEditingFAQ(null); }}>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 shadow-2xl max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/20 rounded-lg border border-gold/30">
                  <HelpCircle className="w-5 h-5 text-gold" />
                </div>
                <h3 className="text-xl font-bold text-white">Edit FAQ (Order: {editTarget.order})</h3>
              </div>
              <button onClick={() => { setEditTarget(null); setEditingFAQ(null); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg" aria-label="Close">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Order">
                <AdminInput type="number" value={editingFAQ.order} disabled className="font-mono" />
              </FormField>
              <FormField label="Question" className="md:col-span-2">
                <AdminInput type="text" value={editingFAQ.question} onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })} />
              </FormField>
              <FormField label="Answer" className="md:col-span-3">
                <AdminTextarea rows={4} value={editingFAQ.answer} onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })} />
              </FormField>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <ActionButton variant="secondary" onClick={() => { setEditTarget(null); setEditingFAQ(null); }}>Cancel</ActionButton>
              <ActionButton variant="primary" onClick={() => { if (editingFAQ) void onSave(editingFAQ); setEditTarget(null); setEditingFAQ(null); }} disabled={!hasToken} loading={savingOrder === editTarget.order}>Save Changes</ActionButton>
            </div>
          </div>
        </div>
      )}
      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 shadow-2xl max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Delete FAQ</h3>
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Are you sure you want to delete the FAQ with order <span className="font-semibold text-red-400">{deleteTarget.order}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <ActionButton
                variant="secondary"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </ActionButton>
              <ActionButton
                variant="danger"
                onClick={() => {
                  const t = deleteTarget;
                  setDeleteTarget(null);
                  if (t) void onDelete(t);
                }}
                icon={Trash2}
              >
                Delete FAQ
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isEqualFAQ(a: FAQItem, b: FAQItem) {
  return a.order === b.order && a.question === b.question && a.answer === b.answer;
}
