import { useCallback, useEffect, useMemo, useState } from 'react';
import { Rocket } from 'lucide-react';
import {
  PageHeader,
  ControlsBar,
  FormField,
  AdminInput,
  AdminTextarea,
  AdminSelect,
  StatusBadge,
  ActionButton,
  Toast,
  SectionCard,
  AddFormCard,
} from './AdminFormComponents';

type Lang = 'en' | 'de';

interface Step {
  _id?: string;
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
  stepLabel?: string;
}

const API_BASE =
  ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_API_BASE ||
  'http://localhost:5001';

const AVAILABLE_ICONS = ['Calendar', 'UserCheck', 'Rocket', 'LineChart', 'CheckCircle', 'ArrowRight', 'Star', 'Sparkles'];

export default function AdminHowItWorks() {
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

  const [steps, setSteps] = useState<Step[]>([]);
  const [originalSteps, setOriginalSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [savingStep, setSavingStep] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Step | null>(null);
  const [query, setQuery] = useState('');
  const [tableOpen, setTableOpen] = useState(true);

  // Modal edit state (mirror Pricing admin UX)
  const [editTarget, setEditTarget] = useState<Step | null>(null);
  const [editingStep, setEditingStep] = useState<Step | null>(null);

  const isDirty = useCallback((idx: number) => {
    if (!originalSteps[idx]) return true;
    return !isEqualStep(steps[idx], originalSteps[idx]);
  }, [steps, originalSteps]);

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
      const res = await fetch(`${API_BASE}/api/admin/how-it-works?lang=${lang}`, { headers: headers() });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      const list: Step[] = Array.isArray(data.steps) ? data.steps.slice().sort((a: Step, b: Step) => a.stepNumber - b.stepNumber) : [];
      setSteps(list);
      setOriginalSteps(JSON.parse(JSON.stringify(list)) as Step[]);
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

  const setStepField = (idx: number, key: keyof Step, value: Step[keyof Step]) => {
    setSteps(prev => prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s)));
  };

  const validateCore = (s: Pick<Step, 'stepNumber'|'title'|'description'>) => {
    if (s.stepNumber < 1 || s.stepNumber > 10) return 'Step number must be between 1 and 10';
    if (!s.title.trim()) return 'Title is required';
    if (!s.description.trim()) return 'Description is required';
    return null;
  };

  const logHttpError = async (res: Response, context: string) => {
    if (import.meta.env.DEV) {
      let body = '';
      try { body = await res.clone().text(); } catch { /* ignore */ }
      console.error('[AdminHowItWorks] request failed', {
        context,
        url: res.url,
        status: res.status,
        statusText: res.statusText,
      });
      if (body) console.error('[AdminHowItWorks] response body:', body);
    }
  };

  const onSave = async (s: Step) => {
    const err = validateCore(s);
    if (err) return alert(err);
    if (!hasToken) return alert('Admin token required');
    const updates: Partial<Omit<Step, 'stepNumber'>> = {
      title: s.title,
      description: s.description,
      icon: s.icon,
      stepLabel: s.stepLabel,
    };
    const url = `${API_BASE}/api/admin/how-it-works/${s.stepNumber}`;
    setSavingStep(s.stepNumber);
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, updates }),
    });
    if (!res.ok) { await logHttpError(res, `PUT ${url}`); setSavingStep(null); return alert('Save failed: ' + res.status); }
    await load();
    pushToast('Step saved');
    setSavingStep(null);
  };

  const onDelete = async (s: Step) => {
    if (!hasToken) return alert('Admin token required');
    const url = `${API_BASE}/api/admin/how-it-works/${s.stepNumber}?lang=${lang}`;
    const res = await fetch(url, {
      method: 'DELETE', headers: headers()
    });
    if (!res.ok) { await logHttpError(res, `DELETE ${url}`); return alert('Delete failed: ' + res.status); }
    await load();
    pushToast('Step deleted');
  };

  const [newStep, setNewStep] = useState<Step>({
    stepNumber: 1, title: '', description: '', icon: 'Calendar', stepLabel: ''
  });

  const prefillSample = () => {
    const stepNum = steps.length > 0 ? Math.max(...steps.map(s => s.stepNumber)) + 1 : 1;
    const sample: Step = {
      stepNumber: stepNum,
      title: lang === 'de' ? 'Beispiel Schritt' : 'Sample Step',
      description: lang === 'de' ? 'Dies ist eine Beispielbeschreibung' : 'This is a sample description',
      icon: 'CheckCircle',
      stepLabel: lang === 'de' ? `Schritt ${stepNum}` : `Step ${stepNum}`,
    };
    setNewStep(sample);
  };

  const onAdd = async () => {
    if (!hasToken) return alert('Admin token required');
    if (!newStep.stepNumber || newStep.stepNumber < 1) return alert('Step number must be at least 1');
    const existingNumbers = new Set(steps.map(s => s.stepNumber));
    if (existingNumbers.has(newStep.stepNumber)) return alert(`Step number ${newStep.stepNumber} already exists for ${lang}.`);
    const err = validateCore(newStep);
    if (err) return alert(err);
    const url = `${API_BASE}/api/admin/how-it-works`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers() },
      body: JSON.stringify({ lang, step: newStep }),
    });
    if (!res.ok) {
      if (res.status === 409) {
        return alert('This step number already exists for the selected language.');
      }
      await logHttpError(res, `POST ${url}`);
      return alert('Add failed: ' + res.status);
    }
    setNewStep({ stepNumber: 1, title: '', description: '', icon: 'Calendar', stepLabel: '' });
    await load();
    pushToast('Step added');
    setAddOpen(false);
  };

  // UI now uses shared Tailwind components

  return (
    <div className="text-slate-200">
      <PageHeader
        title="How It Works"
        description="Manage workflow steps for English and German languages"
        icon={Rocket}
        status={(
          <div className="flex items-center gap-3">
            <StatusBadge type="info">API: {API_BASE}</StatusBadge>
            <StatusBadge type={hasToken ? 'success' : 'error'}>{hasToken ? 'Token Active' : 'Token Missing'}</StatusBadge>
          </div>
        )}
      />

      <ControlsBar>
        <div className="flex items-center gap-3 flex-wrap">
          <FormField label="Language">
            <AdminSelect value={lang} onChange={e => setLang(e.target.value as Lang)} className="w-40">
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </AdminSelect>
          </FormField>
          {loading && <span className="text-slate-400 text-sm">Loading…</span>}
          {error && <span className="text-red-400 text-sm">{error}</span>}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {!hasToken ? (
            <>
              <AdminInput placeholder="ADMIN_TOKEN" value={token} onChange={e => setToken(e.target.value)} className="w-64" />
              <ActionButton onClick={load} disabled={!hasToken && token.trim().length === 0}>Load</ActionButton>
              {envToken && (
                <ActionButton variant="secondary" onClick={() => setToken(envToken)}>Use env token</ActionButton>
              )}
            </>
          ) : (
            <>
              <StatusBadge type="success">Token loaded</StatusBadge>
              <ActionButton variant="secondary" onClick={() => setToken('')}>Change token</ActionButton>
            </>
          )}
        </div>
      </ControlsBar>

      <ControlsBar>
        <div className="text-slate-400 text-sm">Steps: {steps.length}</div>
        <div className="flex items-center gap-3">
          <AdminInput placeholder="Search steps…" value={query} onChange={e => setQuery(e.target.value)} className="w-64" />
          <ActionButton variant="secondary" onClick={() => load()}>Refresh</ActionButton>
          <ActionButton onClick={() => setAddOpen(true)}>Add Step</ActionButton>
        </div>
      </ControlsBar>

      <SectionCard title="Steps Table" isOpen={tableOpen} onToggle={() => setTableOpen(v => !v)} description="Edit, save or delete existing steps">
        <div className="overflow-auto rounded-xl border border-slate-700/60">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/60 sticky top-0 z-10">
              <tr className="text-slate-400 uppercase text-xs tracking-wide">
                <th className="p-3 text-left">Step #</th>
                <th className="p-3 text-left">Icon</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Step Label</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s, idx) => {
                const q = query.trim().toLowerCase();
                const matches = !q || [String(s.stepNumber), s.title, s.description, s.icon, s.stepLabel || ''].join(' ').toLowerCase().includes(q);
                return (
                  <tr
                    key={s._id || s.stepNumber}
                    onMouseEnter={() => setHoverRow(idx)}
                    onMouseLeave={() => setHoverRow(r => (r===idx?null:r))}
                    onClick={() => { setEditTarget(s); setEditingStep({ ...s }); }}
                    className={`${hoverRow===idx ? 'bg-slate-800/40' : idx % 2 ? 'bg-slate-800/20' : ''} transition-colors ${matches ? '' : 'hidden'}`}
                  >
                    <td className="p-3 align-top">
                      <AdminInput type="number" min={1} max={10} value={s.stepNumber} onChange={e => setStepField(idx, 'stepNumber', Number((e.target as HTMLInputElement).value))} className="w-20 text-center" />
                    </td>
                    <td className="p-3 align-top">
                      <AdminSelect value={s.icon} onChange={e => setStepField(idx, 'icon', (e.target as HTMLSelectElement).value)} className="w-40">
                        {AVAILABLE_ICONS.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </AdminSelect>
                    </td>
                    <td className="p-3 align-top">
                      <AdminInput value={s.title} onChange={e => setStepField(idx, 'title', (e.target as HTMLInputElement).value)} />
                    </td>
                    <td className="p-3 align-top">
                      <AdminTextarea value={s.description} onChange={e => setStepField(idx, 'description', (e.target as HTMLTextAreaElement).value)} />
                    </td>
                    <td className="p-3 align-top">
                      <AdminInput value={s.stepLabel || ''} onChange={e => setStepField(idx, 'stepLabel', (e.target as HTMLInputElement).value)} placeholder="e.g., Step 1" />
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex items-center gap-2">
                        <ActionButton onClick={() => onSave(s)} disabled={!hasToken || !isDirty(idx)} loading={savingStep===s.stepNumber}>Save</ActionButton>
                        <ActionButton variant="secondary" onClick={() => setSteps(prev => prev.map((ss, i) => (i===idx ? { ...originalSteps[idx] } : ss)))} disabled={!isDirty(idx)}>Revert</ActionButton>
                        <ActionButton variant="danger" onClick={(e) => { e.stopPropagation(); setDeleteTarget(s); }} disabled={!hasToken}>Delete</ActionButton>
                        <ActionButton variant="secondary" onClick={(e) => { e.stopPropagation(); setEditTarget(s); setEditingStep({ ...s }); }}>Edit</ActionButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {steps.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">No steps yet. Click "Add Step" to create one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <AddFormCard
        title="Add New Step"
        isOpen={addOpen}
        onToggle={() => setAddOpen(v => !v)}
        onAdd={onAdd}
        onPrefill={prefillSample}
        canAdd={Boolean(newStep.stepNumber) && hasToken}
      >
        <div className="flex flex-wrap gap-3">
          <FormField label="Step Number" className="w-36">
            <AdminInput type="number" min={1} max={10} placeholder="Step Number" value={newStep.stepNumber} onChange={e => setNewStep({ ...newStep, stepNumber: Number((e.target as HTMLInputElement).value) })} />
          </FormField>
          <FormField label="Icon" className="w-40">
            <AdminSelect value={newStep.icon} onChange={e => setNewStep({ ...newStep, icon: (e.target as HTMLSelectElement).value })}>
              {AVAILABLE_ICONS.map(icon => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </AdminSelect>
          </FormField>
          <FormField label="Title" className="flex-1 min-w-[260px]">
            <AdminInput placeholder="Title" value={newStep.title} onChange={e => setNewStep({ ...newStep, title: (e.target as HTMLInputElement).value })} />
          </FormField>
          <FormField label="Step Label (optional)" className="flex-1 min-w-[200px]">
            <AdminInput placeholder="Step Label (optional)" value={newStep.stepLabel || ''} onChange={e => setNewStep({ ...newStep, stepLabel: (e.target as HTMLInputElement).value })} />
          </FormField>
          <FormField label="Description" className="w-full">
            <AdminTextarea rows={3} placeholder="Description" value={newStep.description} onChange={e => setNewStep({ ...newStep, description: (e.target as HTMLTextAreaElement).value })} />
          </FormField>
        </div>
      </AddFormCard>

      {/* Add Step Modal - mirrors Pricing Add modal */}
      {addOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200" onClick={() => setAddOpen(false)}>
          <div role="dialog" aria-modal="true" aria-labelledby="add-step-modal-title" className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-transform duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/20 rounded-lg border border-gold/30">
                  <Rocket className="w-5 h-5 text-gold" />
                </div>
                <h3 id="add-step-modal-title" className="text-xl font-bold text-white">Add New Step</h3>
              </div>
              <button onClick={() => setAddOpen(false)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all" aria-label="Close">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Step Number">
                <AdminInput type="number" min={1} max={10} placeholder="Step Number" value={newStep.stepNumber} onChange={e => setNewStep({ ...newStep, stepNumber: Number((e.target as HTMLInputElement).value) })} />
              </FormField>
              <FormField label="Icon">
                <AdminSelect value={newStep.icon} onChange={e => setNewStep({ ...newStep, icon: (e.target as HTMLSelectElement).value })}>
                  {AVAILABLE_ICONS.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </AdminSelect>
              </FormField>
              <FormField label="Title" className="md:col-span-2">
                <AdminInput placeholder="Title" value={newStep.title} onChange={e => setNewStep({ ...newStep, title: (e.target as HTMLInputElement).value })} />
              </FormField>
              <FormField label="Step Label (optional)" className="md:col-span-2">
                <AdminInput placeholder="Step Label (optional)" value={newStep.stepLabel || ''} onChange={e => setNewStep({ ...newStep, stepLabel: (e.target as HTMLInputElement).value })} />
              </FormField>
              <FormField label="Description" className="md:col-span-2">
                <AdminTextarea rows={4} placeholder="Description" value={newStep.description} onChange={e => setNewStep({ ...newStep, description: (e.target as HTMLTextAreaElement).value })} />
              </FormField>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <ActionButton variant="primary" onClick={onAdd} disabled={!hasToken || !newStep.stepNumber}>Add Step</ActionButton>
              <ActionButton variant="secondary" onClick={prefillSample}>Prefill Sample</ActionButton>
              <ActionButton variant="ghost" onClick={() => setAddOpen(false)}>Close</ActionButton>
            </div>
          </div>
        </div>
      )}

      {/* Edit Step Modal - mirrors Pricing Edit modal */}
      {editTarget && editingStep && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200" onClick={() => { setEditTarget(null); setEditingStep(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="edit-step-modal-title" className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-transform duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold/20 rounded-lg border border-gold/30">
                  <Rocket className="w-5 h-5 text-gold" />
                </div>
                <h3 id="edit-step-modal-title" className="text-xl font-bold text-white">Edit Step: {editTarget.stepNumber}</h3>
              </div>
              <button onClick={() => { setEditTarget(null); setEditingStep(null); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all" aria-label="Close">×</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Step Number">
                <AdminInput type="number" value={editingStep.stepNumber} disabled className="font-mono text-slate-400" />
              </FormField>
              <FormField label="Icon">
                <AdminSelect value={editingStep.icon} onChange={e => setEditingStep({ ...editingStep, icon: (e.target as HTMLSelectElement).value })}>
                  {AVAILABLE_ICONS.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </AdminSelect>
              </FormField>
              <FormField label="Title" className="md:col-span-2">
                <AdminInput value={editingStep.title} onChange={e => setEditingStep({ ...editingStep, title: (e.target as HTMLInputElement).value })} />
              </FormField>
              <FormField label="Step Label (optional)" className="md:col-span-2">
                <AdminInput value={editingStep.stepLabel || ''} onChange={e => setEditingStep({ ...editingStep, stepLabel: (e.target as HTMLInputElement).value })} />
              </FormField>
              <FormField label="Description" className="md:col-span-2">
                <AdminTextarea rows={4} value={editingStep.description} onChange={e => setEditingStep({ ...editingStep, description: (e.target as HTMLTextAreaElement).value })} />
              </FormField>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <ActionButton variant="secondary" onClick={() => { setEditTarget(null); setEditingStep(null); }}>Cancel</ActionButton>
              <ActionButton
                variant="primary"
                onClick={() => { if (editingStep) void onSave(editingStep); setEditTarget(null); setEditingStep(null); }}
                disabled={!hasToken}
                loading={savingStep === editTarget.stepNumber}
              >
                Save Changes
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-6 min-w-[340px] shadow-2xl">
            <div className="font-bold text-white mb-2">Delete step</div>
            <div className="text-slate-300 mb-4">Are you sure you want to delete step {deleteTarget.stepNumber}?</div>
            <div className="flex justify-end gap-3">
              <ActionButton variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</ActionButton>
              <ActionButton onClick={() => { const t = deleteTarget; setDeleteTarget(null); if (t) void onDelete(t); }}>Delete</ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function isEqualStep(a: Step, b: Step) {
  return a.stepNumber===b.stepNumber && a.title===b.title && a.description===b.description && (a.icon||'')===(b.icon||'') && (a.stepLabel||'')===(b.stepLabel||'');
}

