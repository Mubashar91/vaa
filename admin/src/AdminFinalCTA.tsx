<<<<<<< HEAD
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, Target, BarChart3, Handshake, Rocket, Globe, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SectionCard, FormField, AdminInput, AdminTextarea, AdminSelect, PageHeader, ControlsBar, StickyActionBar, StatusBadge, Toast } from './AdminFormComponents';
=======
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
>>>>>>> 52db72a9ddcf09cff259f0de5b5886ccb951fe0f

type Lang = 'en' | 'de';

interface FinalCTAData {
  badge: string;
  headlineLine1: string;
  headlineLine2: string;
  subheading: string;
  benefits: string[];
  stats: {
    activeClients: string;
    avgRoi: string;
    satisfaction: string;
    fastStart: string;
  };
  trust: {
    consultationTime: string;
    consultationLabel: string;
    responseTime: string;
    responseLabel: string;
    noCommitment: string;
    noCommitmentLabel: string;
    footer: string;
  };
  ctas: {
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
  whatsAppNumber: string;
}

const API_BASE = ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_API_BASE || 'http://localhost:5001';

export default function AdminFinalCTA() {
  const [lang, setLang] = useState<Lang>('en');
  const [token] = useState<string>(() => {
    try {
      return (localStorage.getItem('adminToken') || '').trim();
    } catch {
      return '';
    }
  });
  const hasToken = useMemo(() => token.trim().length > 0, [token]);
  const headers = useCallback((): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(token.trim() ? { Authorization: `Bearer ${token.trim()}` } : {}),
  }), [token]);

  const [data, setData] = useState<FinalCTAData | null>(null);
  const [original, setOriginal] = useState<FinalCTAData | null>(null);
<<<<<<< HEAD
  const [benefitsText, setBenefitsText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState({ hero: true, benefits: true, stats: true, trust: true, ctas: true });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const effectiveData = useMemo(() => {
    if (!data) return null;
    const parsedBenefits = benefitsText.split('\n').map(s => s.trim()).filter(Boolean);
    return { ...data, benefits: parsedBenefits };
  }, [data, benefitsText]);

  const isDirty = useMemo(
    () => effectiveData && original && JSON.stringify(effectiveData) !== JSON.stringify(original),
    [effectiveData, original]
  );

  const isValidHref = useCallback((s: string) => {
    const v = s.trim();
    return !v || v.startsWith('/') || /^https?:\/\//i.test(v);
  }, []);

  const isValidWhats = useCallback((s: string) => {
    const v = s.trim();
    return !v || /^\d{6,15}$/.test(v);
  }, []);

  const errors = useMemo(() => {
    if (!effectiveData) return {};
    return {
      primaryLabel: !effectiveData.ctas.primaryLabel.trim(),
      primaryHref: !isValidHref(effectiveData.ctas.primaryHref),
      secondaryHref: !!effectiveData.ctas.secondaryHref.trim() && !isValidHref(effectiveData.ctas.secondaryHref),
      whatsAppNumber: !isValidWhats(effectiveData.whatsAppNumber),
    };
  }, [effectiveData, isValidHref, isValidWhats]);

  const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  const handle401 = useCallback(() => {
    try { localStorage.removeItem('adminToken'); } catch {}
    window.location.href = '/admin/login';
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/final-cta?lang=${lang}`, { headers: headers() });
      if (res.status === 401) return handle401();
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      const d: FinalCTAData | null = json.finalCta || null;
      const loadedData = d || {
        badge: '', headlineLine1: '', headlineLine2: '', subheading: '', benefits: [],
        stats: { activeClients: '', avgRoi: '', satisfaction: '', fastStart: '' },
        trust: { consultationTime: '', consultationLabel: '', responseTime: '', responseLabel: '', noCommitment: '', noCommitmentLabel: '', footer: '' },
        ctas: { primaryLabel: '', primaryHref: '/book-meeting', secondaryLabel: '', secondaryHref: '' },
        whatsAppNumber: ''
      };
      setData(structuredClone(loadedData));
      setOriginal(structuredClone(loadedData));
      setBenefitsText(loadedData.benefits.join('\n'));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
=======
  const [editingBenefits, setEditingBenefits] = useState<string>(''); // Raw for stable typing
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null); // For dynamic focus styles

  // Effective data for isDirty/save (parses editingBenefits)
  const effectiveData = useMemo(() => {
    if (!data) return null;
    const parsedBenefits = editingBenefits
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    return { ...data, benefits: parsedBenefits };
  }, [data, editingBenefits]);

  const isDirty = useMemo(
    () => effectiveData && original && JSON.stringify(effectiveData) !== JSON.stringify(original),
    [effectiveData, original]
  );

  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState({ hero: true, benefits: true, stats: true, trust: true, ctas: true });
  const [isWide, setIsWide] = useState<boolean>(() => typeof window !== 'undefined' ? window.innerWidth >= 1100 : true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Refs for focus management
  const lastFocusRef = useRef<{ id: string; position: number } | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement>>({});

  // Stable ref callbacks
  const refCallbacks = useMemo(() => {
    const callbacks: Record<string, (el: HTMLInputElement | HTMLTextAreaElement | null) => void> = {};
    const fieldIds = [
      'badge', 'headline1', 'headline2', 'subheading', 'benefits',
      'stats-activeClients', 'stats-avgRoi', 'stats-satisfaction', 'stats-fastStart',
      'trust-consultationTime', 'trust-consultationLabel', 'trust-responseTime',
      'trust-responseLabel', 'trust-noCommitment', 'trust-noCommitmentLabel', 'trust-footer',
      'primaryLabel', 'primaryHref', 'secondaryLabel', 'secondaryHref', 'whatsAppNumber'
    ];
    fieldIds.forEach((id) => {
      callbacks[id] = (el) => {
        if (el) inputRefs.current[id] = el;
        else delete inputRefs.current[id];
      };
    });
    return callbacks;
  }, []);

  // Store/restore focus
  const storeFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
    if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
      const id = activeElement.id || activeElement.name || '';
      if (id) {
        lastFocusRef.current = { id, position: activeElement.selectionStart || 0 };
      }
>>>>>>> 52db72a9ddcf09cff259f0de5b5886ccb951fe0f
    }
  }, []);

<<<<<<< HEAD
  useEffect(() => {
    if (hasToken) void load();
  }, [hasToken, load]);
=======
  const restoreFocus = useCallback(() => {
    if (lastFocusRef.current) {
      const { id, position } = lastFocusRef.current;
      const element = inputRefs.current[id];
      if (element) {
        requestAnimationFrame(() => {
          element.focus();
          element.setSelectionRange?.(position, position);
        });
      }
      lastFocusRef.current = null;
    }
  }, []);

  // UI styles (removed invalid &:focus; dynamic via focusedField)
  const ui = {
    page: { width: '100%', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' },
    container: {
      maxWidth: 1300,
      margin: '0 auto',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backdropFilter: 'blur(10px)',
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '24px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
      padding: '32px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    h1: {
      fontSize: '28px',
      fontWeight: 800,
      margin: 0,
      color: '#111827',
      background: 'linear-gradient(90deg, #667eea, #764ba2)',
      WebkitBackgroundClip: 'text' as const,
      WebkitTextFillColor: 'transparent'
    },
    sub: { marginTop: '12px', fontSize: '14px', color: '#6b7280', lineHeight: 1.5 },
    status: { marginTop: '12px', fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' },
    row: { display: 'flex', gap: '16px', flexWrap: 'wrap' as const, alignItems: 'center' },
    card: {
      background: 'white',
      border: '1px solid rgba(226, 232, 240, 0.6)',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      padding: '24px',
      marginTop: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: '12px',
      borderBottom: '1px solid #f1f5f9',
      marginBottom: '20px',
      cursor: 'pointer'
    },
    sectionTitle: {
      fontWeight: 700,
      color: '#111827',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: 600,
      color: '#374151',
      marginBottom: '8px'
    },
    inputBase: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      background: '#fff',
      fontSize: '15px',
      outline: 'none' as const,
      transition: 'all 0.2s ease'
    } as React.CSSProperties,
    input: (isFocused: boolean, hasError: boolean) => ({
      ...ui.inputBase,
      border: `2px solid ${hasError ? '#ef4444' : isFocused ? '#667eea' : '#e5e7eb'}`,
      background: hasError ? '#fef2f2' : isFocused ? '#fff7ed' : '#fff',
      boxShadow: isFocused ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
    }),
    textarea: (isFocused: boolean, hasError: boolean) => ({
      ...ui.inputBase,
      border: `2px solid ${hasError ? '#ef4444' : isFocused ? '#667eea' : '#e5e7eb'}`,
      background: hasError ? '#fef2f2' : isFocused ? '#fff7ed' : '#fff',
      minHeight: '120px',
      resize: 'vertical' as const,
      boxShadow: isFocused ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'
    }),
    help: { fontSize: '13px', color: '#6b7280', marginTop: '8px', display: 'flex', justifyContent: 'space-between' },
    error: { fontSize: '13px', color: '#ef4444', marginTop: '8px', fontWeight: 500 },
    btnRow: { display: 'flex', gap: '12px', flexWrap: 'wrap' as const, alignItems: 'center' },
    btn: {
      padding: '10px 20px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      background: 'white',
      color: '#374151',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px'
    } as React.CSSProperties,
    btnPrimary: {
      padding: '12px 24px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontWeight: 700,
      cursor: 'pointer',
      border: 'none',
      fontSize: '15px',
      transition: 'all 0.2s ease'
    } as React.CSSProperties,
    grid: { display: 'grid', gap: '24px' } as React.CSSProperties,
    asideGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '24px' } as React.CSSProperties,
    previewBadge: {
      display: 'inline-block',
      padding: '6px 16px',
      borderRadius: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontSize: '13px',
      color: 'white',
      marginBottom: '16px',
      fontWeight: 600
    },
    previewCtaPrimary: {
      display: 'inline-block',
      textDecoration: 'none',
      padding: '14px 28px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '12px',
      fontWeight: 700,
      textAlign: 'center' as const,
      transition: 'all 0.2s ease'
    },
    previewCtaSecondary: {
      display: 'inline-block',
      textDecoration: 'none',
      padding: '14px 28px',
      border: '2px solid #e5e7eb',
      color: '#374151',
      borderRadius: '12px',
      fontWeight: 600,
      textAlign: 'center' as const,
      transition: 'all 0.2s ease'
    },
    toast: {
      position: 'fixed' as const,
      right: '24px',
      bottom: '24px',
      background: 'white',
      color: '#111827',
      padding: '16px 20px',
      borderRadius: '16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      borderLeft: '4px solid #10b981',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    statCard: {
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center' as const,
      border: '1px solid rgba(226, 232, 240, 0.6)'
    }
  };

  // Keyframes
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      .loading-pulse { animation: pulse 1.5s ease-in-out infinite; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Char count helper
  const charCount = useCallback((value: string, max: number) => {
    const length = value.length;
    const percentage = Math.min((length / max) * 100, 100);
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ width: '60px', height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${percentage}%`,
              height: '100%',
              background: length > max * 0.9 ? '#ef4444' : length > max * 0.75 ? '#f59e0b' : '#10b981',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
        <span style={{ fontSize: '12px', color: length > max ? '#ef4444' : '#6b7280' }}>{length}/{max}</span>
      </div>
    );
  }, []);

  // Validators
  const isValidHref = useCallback((s: string) => {
    const v = s.trim();
    return !v || v.startsWith('/') || /^https?:\/\//i.test(v);
  }, []);

  const isValidWhats = useCallback((s: string) => {
    const v = s.trim();
    return !v || /^\d{6,15}$/.test(v);
  }, []);

  const errors = useMemo(() => {
    if (!effectiveData) return {} as Record<string, boolean>;
    return {
      primaryLabel: !effectiveData.ctas.primaryLabel.trim(),
      primaryHref: !isValidHref(effectiveData.ctas.primaryHref),
      secondaryHref: !!effectiveData.ctas.secondaryHref.trim() && !isValidHref(effectiveData.ctas.secondaryHref),
      whatsAppNumber: !isValidWhats(effectiveData.whatsAppNumber),
    } as const;
  }, [effectiveData, isValidHref, isValidWhats]);

  const hasErrors = useMemo(() => Object.values(errors).some(Boolean), [errors]);

  // Persist token/open
  useEffect(() => {
    try { localStorage.setItem('adminToken', token); } catch {}
  }, [token]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin_finalcta_open');
      if (raw) setOpen(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('admin_finalcta_open', JSON.stringify(open)); } catch {} 
  }, [open]);

  useEffect(() => {
    const onResize = () => setIsWide(window.innerWidth >= 1100);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
>>>>>>> 52db72a9ddcf09cff259f0de5b5886ccb951fe0f

  // Handle 401
  const handle401 = useCallback(() => {
    try { localStorage.removeItem('adminToken'); } catch {}
    window.location.href = '/admin/login';
  }, []);

  // Load data
  const load = useCallback(async () => {
    storeFocus();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/final-cta?lang=${lang}`, { headers: headers() });
      if (res.status === 401) return handle401();
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const json = await res.json();
      const d: FinalCTAData | null = json.finalCta || null;
      const loadedData = d || {
        badge: '', headlineLine1: '', headlineLine2: '', subheading: '', benefits: [],
        stats: { activeClients: '', avgRoi: '', satisfaction: '', fastStart: '' },
        trust: { consultationTime: '', consultationLabel: '', responseTime: '', responseLabel: '', noCommitment: '', noCommitmentLabel: '', footer: '' },
        ctas: { primaryLabel: '', primaryHref: '/book-meeting', secondaryLabel: '', secondaryHref: '' },
        whatsAppNumber: ''
      };
      setData(structuredClone(loadedData));
      setOriginal(structuredClone(loadedData));
      setEditingBenefits(loadedData.benefits.join('\n'));
      // Auto-focus first field after load
      setTimeout(() => inputRefs.current['badge']?.focus(), 100);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
      restoreFocus();
    }
  }, [lang, headers, handle401, storeFocus, restoreFocus]);

  useEffect(() => {
    if (hasToken) void load();
  }, [hasToken, load]);

  // Save
  const onSave = useCallback(async () => {
    if (!effectiveData || hasErrors) return;
<<<<<<< HEAD
=======
    storeFocus();
>>>>>>> 52db72a9ddcf09cff259f0de5b5886ccb951fe0f
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/final-cta`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ lang, finalCta: effectiveData })
      });
      if (res.status === 401) return handle401();
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      await load();
      setSaved(true);
<<<<<<< HEAD
      setToast({ type: 'success', message: 'Changes saved successfully!' });
      setTimeout(() => setSaved(false), 3000);
      setTimeout(() => setToast(null), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
      setToast({ type: 'error', message: e instanceof Error ? e.message : 'Save failed' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setSaving(false);
    }
  }, [effectiveData, hasErrors, headers, lang, handle401, load]);

  const onRevert = useCallback(() => {
    if (original) {
      setData(structuredClone(original));
      setBenefitsText(original.benefits.join('\n'));
    }
  }, [original]);
=======
      setToast({ type: 'success', message: '✅ Changes saved successfully!' });
      setTimeout(() => {
        setSaved(false);
        restoreFocus();
      }, 2000);
      setTimeout(() => setToast(null), 3000);
    } catch (e: unknown) {
      setToast({ type: 'error', message: `❌ ${e instanceof Error ? e.message : 'Save failed'}` });
      setTimeout(() => {
        setToast(null);
        restoreFocus();
      }, 4000);
    } finally {
      setSaving(false);
    }
  }, [effectiveData, hasErrors, headers, lang, handle401, load, storeFocus, restoreFocus]);
>>>>>>> 52db72a9ddcf09cff259f0de5b5886ccb951fe0f

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
<<<<<<< HEAD
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
=======
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === 's') {
>>>>>>> 52db72a9ddcf09cff259f0de5b5886ccb951fe0f
        e.preventDefault();
        if (!hasErrors && hasToken && isDirty && !saving) void onSave();
      }
      if (e.key === 'Escape' && toast) setToast(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasErrors, hasToken, isDirty, saving, onSave, toast]);

<<<<<<< HEAD
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-4 w-72 h-72 bg-gold/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Final CTA Management"
          description="Manage hero, benefits, stats, trust indicators, and call-to-action buttons"
          icon={Rocket}
          status={
            <div className="flex items-center gap-3">
              {isDirty && <StatusBadge type="warning" icon={AlertCircle}>Unsaved changes</StatusBadge>}
              {saved && <StatusBadge type="success" icon={CheckCircle2}>Saved!</StatusBadge>}
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
            <div className="flex items-center gap-3">
              {loading && (
                <div className="flex items-center gap-2 text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              )}
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/60 hover:border-slate-500/60 text-slate-300 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
=======
  // Before unload warning
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  // Deferred preview data for perf
  const deferredData = useDeferredValue(effectiveData);

  // Revert
  const onRevert = useCallback(() => {
    storeFocus();
    if (original) {
      setData(structuredClone(original));
      setEditingBenefits(original.benefits.join('\n'));
    }
    restoreFocus();
  }, [original, storeFocus, restoreFocus]);

  // Lang change wrapper
  const onLangChange = useCallback((newLang: Lang) => {
    storeFocus();
    setLang(newLang);
    restoreFocus();
  }, [storeFocus, restoreFocus]);

  // SectionCard component
  const SectionCard = useCallback(({ title, isOpen, onToggle, children, icon }: {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    icon?: string;
  }) => (
    <div style={ui.card}>
      <div style={ui.sectionHeader} onClick={onToggle} role="button" tabIndex={0} aria-expanded={isOpen}>
        <div style={ui.sectionTitle}>
          {icon && <span style={{ fontSize: '20px' }}>{icon}</span>}
          {title}
        </div>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onToggle}
          style={{
            ...ui.btn,
            background: isOpen ? '#f8fafc' : 'white',
            borderColor: isOpen ? '#cbd5e1' : '#e5e7eb'
          }}
          aria-label={isOpen ? 'Collapse section' : 'Expand section'}
        >
          {isOpen ? '▲ Collapse' : '▼ Expand'}
        </button>
      </div>
      {isOpen && <div style={{ animation: 'slideIn 0.3s ease-out' }}>{children}</div>}
    </div>
  ), [ui]);

  // FormField component
  const FormField = useCallback(({ label, required, error, helpText, children, id }: {
    label: string;
    required?: boolean;
    error?: string;
    helpText?: string;
    children: React.ReactNode;
    id?: string;
  }) => (
    <div style={{ marginBottom: '20px' }}>
      <label style={ui.label} htmlFor={id}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <div>{children}</div>
      {error && <div style={ui.error}>⚠️ {error}</div>}
      {helpText && !error && <div style={ui.help}>{helpText}</div>}
    </div>
  ), [ui]);

  // Prevent enter on non-textarea inputs
  const preventEnterCapture = useCallback((e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type !== 'textarea') {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }, []);

  if (loading && !data) {
    return (
      <div style={ui.page}>
        <div style={ui.container}>
          <div style={ui.card}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{
                    background: '#f1f5f9',
                    borderRadius: '8px',
                    height: '60px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    opacity: 0.6
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={ui.page} onKeyDown={preventEnterCapture}>
      <div style={ui.container}>
        {/* Header */}
        <div style={ui.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={ui.h1}>Final CTA Management</h1>
              <p style={ui.sub}>
                Manage hero, benefits, stats, trust indicators, and call-to-action buttons.
                Press <kbd style={{ padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}>Ctrl/Cmd + S</kbd> to save quickly.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isDirty && (
                <div style={{
                  padding: '6px 12px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '8px',
                  color: '#92400e',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%' }} />
                  Unsaved changes
                </div>
              )}
              {!isDirty && !loading && (
                <div style={{
                  padding: '6px 12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px',
                  color: '#065f46',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }} />
                  All saved
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={ui.card}>
          <div style={ui.row}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <FormField label="Language" id="language-select">
                <select
                  id="language-select"
                  value={lang}
                  onChange={(e) => onLangChange(e.target.value as Lang)}
                  style={{
                    ...ui.inputBase,
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                    appearance: 'none' as const,
                    border: '2px solid #e5e7eb'
                  }}
                  aria-label="Select language"
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="de">🇩🇪 Deutsch</option>
                </select>
              </FormField>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#667eea' }}>
                  <span className="loading-pulse">⟳</span>
                  <span>Loading...</span>
                </div>
              )}
              {error && (
                <div style={{
                  padding: '8px 12px',
                  background: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#b91c1c',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span>⚠️</span>
                  {error}
                </div>
              )}
            </div>
          </div>
          <div style={ui.btnRow}>
            <button type="button" onClick={load} style={ui.btn} disabled={loading}>
              🔄 Refresh
            </button>
            <div style={{
              fontSize: '13px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: hasToken ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: hasToken ? '#065f46' : '#991b1b',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {hasToken ? '🔐 Authenticated' : '⚠️ Not Authenticated'}
            </div>
>>>>>>> 52db72a9ddcf09cff259f0de5b5886ccb951fe0f
          </div>
        </ControlsBar>

        <div className="space-y-6">
          {/* Hero Section */}
          <SectionCard
            title="Hero Section"
            isOpen={open.hero}
            onToggle={() => setOpen(prev => ({ ...prev, hero: !prev.hero }))}
            icon={Sparkles}
            description="Main headline and subheading content"
          >
            <FormField label="Badge" helpText="Small badge above headline (e.g., 'New: Free Setup')">
              <AdminInput
                type="text"
                value={data.badge}
                onChange={(e) => setData(prev => ({ ...prev!, badge: e.target.value }))}
                placeholder="e.g., New: Free Setup"
                maxLength={50}
              />
            </FormField>
            <FormField label="Headline Line 1" helpText="First headline line">
              <AdminInput
                type="text"
                value={data.headlineLine1}
                onChange={(e) => setData(prev => ({ ...prev!, headlineLine1: e.target.value }))}
                placeholder="e.g., Ready to Grow Your Business?"
                maxLength={90}
              />
            </FormField>
            <FormField label="Headline Line 2" helpText="Second headline line">
              <AdminInput
                type="text"
                value={data.headlineLine2}
                onChange={(e) => setData(prev => ({ ...prev!, headlineLine2: e.target.value }))}
                placeholder="e.g., Let's Get Started Today"
                maxLength={90}
              />
            </FormField>
            <FormField label="Subheading" helpText="Text below headline">
              <AdminTextarea
                value={data.subheading}
                onChange={(e) => setData(prev => ({ ...prev!, subheading: e.target.value }))}
                placeholder="e.g., Join hundreds of businesses that trust us..."
                maxLength={220}
                rows={3}
              />
            </FormField>
          </SectionCard>

          {/* Benefits */}
          <SectionCard
            title="Benefits"
            isOpen={open.benefits}
            onToggle={() => setOpen(prev => ({ ...prev, benefits: !prev.benefits }))}
            icon={Target}
            description="List of key benefits (one per line)"
          >
            <FormField label="Benefits" helpText="One per line. 3-6 recommended.">
              <AdminTextarea
                value={benefitsText}
                onChange={(e) => setBenefitsText(e.target.value)}
                placeholder="No Setup Fees\nFree Trial\nNative Managers\n24/7 Support"
                rows={6}
              />
              <div className="mt-2 text-xs text-slate-500">
                {effectiveData?.benefits.length || 0} benefit{effectiveData?.benefits.length !== 1 ? 's' : ''}
              </div>
            </FormField>
          </SectionCard>

          {/* Statistics */}
          <SectionCard
            title="Statistics"
            isOpen={open.stats}
            onToggle={() => setOpen(prev => ({ ...prev, stats: !prev.stats }))}
            icon={BarChart3}
            description="Key performance metrics"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Active Clients" helpText="e.g., 200+">
                <AdminInput
                  type="text"
                  value={data.stats.activeClients}
                  onChange={(e) => setData(prev => ({ ...prev!, stats: { ...prev!.stats, activeClients: e.target.value } }))}
                  placeholder="e.g., 200+"
                  maxLength={20}
                />
              </FormField>
              <FormField label="Average ROI" helpText="e.g., 3.5x">
                <AdminInput
                  type="text"
                  value={data.stats.avgRoi}
                  onChange={(e) => setData(prev => ({ ...prev!, stats: { ...prev!.stats, avgRoi: e.target.value } }))}
                  placeholder="e.g., 3.5x"
                  maxLength={20}
                />
              </FormField>
              <FormField label="Satisfaction Rate" helpText="e.g., 98%">
                <AdminInput
                  type="text"
                  value={data.stats.satisfaction}
                  onChange={(e) => setData(prev => ({ ...prev!, stats: { ...prev!.stats, satisfaction: e.target.value } }))}
                  placeholder="e.g., 98%"
                  maxLength={20}
                />
              </FormField>
              <FormField label="Fast Start" helpText="e.g., 48h">
                <AdminInput
                  type="text"
                  value={data.stats.fastStart}
                  onChange={(e) => setData(prev => ({ ...prev!, stats: { ...prev!.stats, fastStart: e.target.value } }))}
                  placeholder="e.g., 48h"
                  maxLength={20}
                />
              </FormField>
            </div>
          </SectionCard>

          {/* Trust Indicators */}
          <SectionCard
            title="Trust Indicators"
            isOpen={open.trust}
            onToggle={() => setOpen(prev => ({ ...prev, trust: !prev.trust }))}
            icon={Handshake}
            description="Trust and reassurance elements"
          >
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-slate-300 mb-3">Consultation Indicator</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Time/Value" helpText="e.g., 30 min">
                    <AdminInput
                      type="text"
                      value={data.trust.consultationTime}
                      onChange={(e) => setData(prev => ({ ...prev!, trust: { ...prev!.trust, consultationTime: e.target.value } }))}
                      placeholder="e.g., 30 min"
                      maxLength={20}
                    />
                  </FormField>
                  <FormField label="Label" helpText="e.g., Free Consultation">
                    <AdminInput
                      type="text"
                      value={data.trust.consultationLabel}
                      onChange={(e) => setData(prev => ({ ...prev!, trust: { ...prev!.trust, consultationLabel: e.target.value } }))}
                      placeholder="e.g., Free Consultation"
                      maxLength={50}
                    />
                  </FormField>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-300 mb-3">Response Time Indicator</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Time/Value" helpText="e.g., 24/7">
                    <AdminInput
                      type="text"
                      value={data.trust.responseTime}
                      onChange={(e) => setData(prev => ({ ...prev!, trust: { ...prev!.trust, responseTime: e.target.value } }))}
                      placeholder="e.g., 24/7"
                      maxLength={20}
                    />
                  </FormField>
                  <FormField label="Label" helpText="e.g., Quick Response">
                    <AdminInput
                      type="text"
                      value={data.trust.responseLabel}
                      onChange={(e) => setData(prev => ({ ...prev!, trust: { ...prev!.trust, responseLabel: e.target.value } }))}
                      placeholder="e.g., Quick Response"
                      maxLength={50}
                    />
                  </FormField>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-300 mb-3">No Commitment Indicator</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Value" helpText="e.g., No Commitment">
                    <AdminInput
                      type="text"
                      value={data.trust.noCommitment}
                      onChange={(e) => setData(prev => ({ ...prev!, trust: { ...prev!.trust, noCommitment: e.target.value } }))}
                      placeholder="e.g., No Commitment"
                      maxLength={50}
                    />
                  </FormField>
                  <FormField label="Label" helpText="e.g., Cancel Anytime">
                    <AdminInput
                      type="text"
                      value={data.trust.noCommitmentLabel}
                      onChange={(e) => setData(prev => ({ ...prev!, trust: { ...prev!.trust, noCommitmentLabel: e.target.value } }))}
                      placeholder="e.g., Cancel Anytime"
                      maxLength={50}
                    />
                  </FormField>
                </div>
              </div>
              <FormField label="Footer Text" helpText="Bottom reassurance text">
                <AdminTextarea
                  value={data.trust.footer}
                  onChange={(e) => setData(prev => ({ ...prev!, trust: { ...prev!.trust, footer: e.target.value } }))}
                  placeholder="e.g., Trusted by businesses worldwide"
                  maxLength={200}
                  rows={3}
                />
              </FormField>
            </div>
          </SectionCard>

          {/* CTA Buttons */}
          <SectionCard
            title="Call-to-Action Buttons"
            isOpen={open.ctas}
            onToggle={() => setOpen(prev => ({ ...prev, ctas: !prev.ctas }))}
            icon={Rocket}
            description="Primary and secondary action buttons"
          >
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold text-slate-300 mb-3">Primary CTA Button</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Button Label" required error={errors.primaryLabel ? 'Required' : undefined}>
                    <AdminInput
                      type="text"
                      value={data.ctas.primaryLabel}
                      onChange={(e) => setData(prev => ({ ...prev!, ctas: { ...prev!.ctas, primaryLabel: e.target.value } }))}
                      placeholder="e.g., Book a Free Consultation"
                      maxLength={50}
                      error={!!errors.primaryLabel}
                    />
                  </FormField>
                  <FormField label="Button Link" required error={errors.primaryHref ? 'Required. Use /relative or http(s) URL' : undefined}>
                    <AdminInput
                      type="text"
                      value={data.ctas.primaryHref}
                      onChange={(e) => setData(prev => ({ ...prev!, ctas: { ...prev!.ctas, primaryHref: e.target.value } }))}
                      placeholder="e.g., /book-meeting"
                      maxLength={200}
                      error={!!errors.primaryHref}
                    />
                  </FormField>
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-300 mb-3">Secondary CTA Button</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Button Label" helpText="Secondary button text (optional)">
                    <AdminInput
                      type="text"
                      value={data.ctas.secondaryLabel}
                      onChange={(e) => setData(prev => ({ ...prev!, ctas: { ...prev!.ctas, secondaryLabel: e.target.value } }))}
                      placeholder="e.g., Chat on WhatsApp"
                      maxLength={50}
                    />
                  </FormField>
                  <FormField label="Button Link" error={errors.secondaryHref ? 'Invalid URL' : undefined} helpText="Leave blank for auto-WhatsApp link">
                    <AdminInput
                      type="text"
                      value={data.ctas.secondaryHref}
                      onChange={(e) => setData(prev => ({ ...prev!, ctas: { ...prev!.ctas, secondaryHref: e.target.value } }))}
                      placeholder="e.g., https://wa.me/1234567890 or leave blank"
                      maxLength={200}
                      error={!!errors.secondaryHref}
                    />
                  </FormField>
                </div>
              </div>
              <FormField label="WhatsApp Number" error={errors.whatsAppNumber ? 'Digits only, 6-15 length' : undefined} helpText={!errors.whatsAppNumber ? 'For auto-WhatsApp link (e.g., 15551234567)' : undefined}>
                <AdminInput
                  type="text"
                  value={data.whatsAppNumber}
                  onChange={(e) => setData(prev => ({ ...prev!, whatsAppNumber: e.target.value }))}
                  placeholder="Digits only, e.g., 15551234567"
                  maxLength={15}
                  error={!!errors.whatsAppNumber}
                />
              </FormField>
            </div>
          </SectionCard>
        </div>
<<<<<<< HEAD

        <StickyActionBar
          isDirty={!!isDirty}
          onRevert={onRevert}
          onSave={onSave}
          saving={saving}
          hasToken={hasToken}
          hasErrors={hasErrors}
          canSave={!hasErrors}
        />
      </div>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
=======

        {/* Success Message */}
        {saved && (
          <div style={{
            ...ui.card,
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            borderColor: '#10b981',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                ✓
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#065f46' }}>Changes saved successfully!</div>
                <div style={{ fontSize: '13px', color: '#047857', marginTop: '4px' }}>
                  The Final CTA has been updated and is now live.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        {data && (
          <div style={{ ...ui.grid, gridTemplateColumns: isWide ? '2fr 1fr' : '1fr' }}>
            {/* Form Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
              <SectionCard title="Hero Section" icon="🌟" isOpen={open.hero} onToggle={() => setOpen((prev) => ({ ...prev, hero: !prev.hero }))}>
                <FormField label="Badge" helpText="Small badge above headline (e.g., 'New: Free Setup')" id="badge">
                  <input
                    id="badge"
                    type="text"
                    placeholder="e.g., New: Free Setup"
                    value={data.badge}
                    onChange={(e) => setData((prev) => ({ ...prev!, badge: e.target.value }))}
                    onFocus={() => setFocusedField('badge')}
                    onBlur={() => setFocusedField(null)}
                    style={ui.input(focusedField === 'badge', false)}
                    ref={refCallbacks.badge}
                    maxLength={50}
                    aria-describedby="badge-help"
                  />
                  {charCount(data.badge, 50)}
                </FormField>
                <FormField label="Headline Line 1" helpText="First headline line" id="headline1">
                  <input
                    id="headline1"
                    type="text"
                    placeholder="e.g., Ready to Grow Your Business?"
                    value={data.headlineLine1}
                    onChange={(e) => setData((prev) => ({ ...prev!, headlineLine1: e.target.value }))}
                    onFocus={() => setFocusedField('headline1')}
                    onBlur={() => setFocusedField(null)}
                    style={ui.input(focusedField === 'headline1', false)}
                    ref={refCallbacks.headline1}
                    maxLength={90}
                  />
                  <div style={ui.help}>{charCount(data.headlineLine1, 90)}</div>
                </FormField>
                <FormField label="Headline Line 2" helpText="Second headline line" id="headline2">
                  <input
                    id="headline2"
                    type="text"
                    placeholder="e.g., Let's Get Started Today"
                    value={data.headlineLine2}
                    onChange={(e) => setData((prev) => ({ ...prev!, headlineLine2: e.target.value }))}
                    onFocus={() => setFocusedField('headline2')}
                    onBlur={() => setFocusedField(null)}
                    style={ui.input(focusedField === 'headline2', false)}
                    ref={refCallbacks.headline2}
                    maxLength={90}
                  />
                  <div style={ui.help}>{charCount(data.headlineLine2, 90)}</div>
                </FormField>
                <FormField label="Subheading" helpText="Text below headline" id="subheading">
                  <textarea
                    id="subheading"
                    placeholder="e.g., Join hundreds of businesses that trust us..."
                    value={data.subheading}
                    onChange={(e) => setData((prev) => ({ ...prev!, subheading: e.target.value }))}
                    onFocus={() => setFocusedField('subheading')}
                    onBlur={() => setFocusedField(null)}
                    rows={3}
                    style={ui.textarea(focusedField === 'subheading', false)}
                    ref={refCallbacks.subheading}
                    maxLength={220}
                  />
                  <div style={ui.help}>{charCount(data.subheading, 220)}</div>
                </FormField>
              </SectionCard>

              <SectionCard title="Benefits" icon="🎯" isOpen={open.benefits} onToggle={() => setOpen((prev) => ({ ...prev, benefits: !prev.benefits }))}>
                <FormField
                  label="Benefits"
                  helpText="One per line. 3-6 recommended."
                  id="benefits"
                >
                  <textarea
                    id="benefits"
                    value={editingBenefits}
                    onChange={(e) => setEditingBenefits(e.target.value)} // Raw: no parse during typing
                    onBlur={(e) => {
                      const parsed = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean);
                      setData((prev) => ({ ...prev!, benefits: parsed }));
                      setEditingBenefits(parsed.join('\n'));
                      setFocusedField(null);
                    }}
                    onFocus={() => setFocusedField('benefits')}
                    rows={6}
                    placeholder="No Setup Fees\nFree Trial\nNative Managers\n24/7 Support"
                    style={ui.textarea(focusedField === 'benefits', false)}
                    ref={refCallbacks.benefits}
                  />
                  <div style={{ ...ui.help, marginTop: '8px' }}>
                    <span>{effectiveData?.benefits.length || 0} benefit{ effectiveData?.benefits.length !== 1 ? 's' : ''}</span>
                  </div>
                </FormField>
              </SectionCard>

              <SectionCard title="Statistics" icon="📊" isOpen={open.stats} onToggle={() => setOpen((prev) => ({ ...prev, stats: !prev.stats }))}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <FormField label="Active Clients" helpText="e.g., 200+" id="stats-activeClients">
                    <input
                      id="stats-activeClients"
                      type="text"
                      placeholder="e.g., 200+"
                      value={data.stats.activeClients}
                      onChange={(e) => setData((prev) => ({
                        ...prev!,
                        stats: { ...prev!.stats, activeClients: e.target.value }
                      }))}
                      onFocus={() => setFocusedField('stats-activeClients')}
                      onBlur={() => setFocusedField(null)}
                      style={ui.input(focusedField === 'stats-activeClients', false)}
                      ref={refCallbacks['stats-activeClients']}
                      maxLength={20}
                    />
                  </FormField>
                  <FormField label="Average ROI" helpText="e.g., 3.5x" id="stats-avgRoi">
                    <input
                      id="stats-avgRoi"
                      type="text"
                      placeholder="e.g., 3.5x"
                      value={data.stats.avgRoi}
                      onChange={(e) => setData((prev) => ({
                        ...prev!,
                        stats: { ...prev!.stats, avgRoi: e.target.value }
                      }))}
                      onFocus={() => setFocusedField('stats-avgRoi')}
                      onBlur={() => setFocusedField(null)}
                      style={ui.input(focusedField === 'stats-avgRoi', false)}
                      ref={refCallbacks['stats-avgRoi']}
                      maxLength={20}
                    />
                  </FormField>
                  <FormField label="Satisfaction Rate" helpText="e.g., 98%" id="stats-satisfaction">
                    <input
                      id="stats-satisfaction"
                      type="text"
                      placeholder="e.g., 98%"
                      value={data.stats.satisfaction}
                      onChange={(e) => setData((prev) => ({
                        ...prev!,
                        stats: { ...prev!.stats, satisfaction: e.target.value }
                      }))}
                      onFocus={() => setFocusedField('stats-satisfaction')}
                      onBlur={() => setFocusedField(null)}
                      style={ui.input(focusedField === 'stats-satisfaction', false)}
                      ref={refCallbacks['stats-satisfaction']}
                      maxLength={20}
                    />
                  </FormField>
                  <FormField label="Fast Start" helpText="e.g., 48h" id="stats-fastStart">
                    <input
                      id="stats-fastStart"
                      type="text"
                      placeholder="e.g., 48h"
                      value={data.stats.fastStart}
                      onChange={(e) => setData((prev) => ({
                        ...prev!,
                        stats: { ...prev!.stats, fastStart: e.target.value }
                      }))}
                      onFocus={() => setFocusedField('stats-fastStart')}
                      onBlur={() => setFocusedField(null)}
                      style={ui.input(focusedField === 'stats-fastStart', false)}
                      ref={refCallbacks['stats-fastStart']}
                      maxLength={20}
                    />
                  </FormField>
                </div>
              </SectionCard>

              <SectionCard title="Trust Indicators" icon="🤝" isOpen={open.trust} onToggle={() => setOpen((prev) => ({ ...prev, trust: !prev.trust }))}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Consultation Indicator</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <FormField label="Time/Value" helpText="e.g., 30 min" id="trust-consultationTime">
                      <input
                        id="trust-consultationTime"
                        type="text"
                        placeholder="e.g., 30 min"
                        value={data.trust.consultationTime}
                        onChange={(e) => setData((prev) => ({
                          ...prev!,
                          trust: { ...prev!.trust, consultationTime: e.target.value }
                        }))}
                        onFocus={() => setFocusedField('trust-consultationTime')}
                        onBlur={() => setFocusedField(null)}
                        style={ui.input(focusedField === 'trust-consultationTime', false)}
                        ref={refCallbacks['trust-consultationTime']}
                        maxLength={20}
                      />
                    </FormField>
                    <FormField label="Label" helpText="e.g., Free Consultation" id="trust-consultationLabel">
                      <input
                        id="trust-consultationLabel"
                        type="text"
                        placeholder="e.g., Free Consultation"
                        value={data.trust.consultationLabel}
                        onChange={(e) => setData((prev) => ({
                          ...prev!,
                          trust: { ...prev!.trust, consultationLabel: e.target.value }
                        }))}
                        onFocus={() => setFocusedField('trust-consultationLabel')}
                        onBlur={() => setFocusedField(null)}
                        style={ui.input(focusedField === 'trust-consultationLabel', false)}
                        ref={refCallbacks['trust-consultationLabel']}
                        maxLength={50}
                      />
                    </FormField>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Response Time Indicator</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <FormField label="Time/Value" helpText="e.g., 24/7" id="trust-responseTime">
                      <input
                        id="trust-responseTime"
                        type="text"
                        placeholder="e.g., 24/7"
                        value={data.trust.responseTime}
                        onChange={(e) => setData((prev) => ({
                          ...prev!,
                          trust: { ...prev!.trust, responseTime: e.target.value }
                        }))}
                        onFocus={() => setFocusedField('trust-responseTime')}
                        onBlur={() => setFocusedField(null)}
                        style={ui.input(focusedField === 'trust-responseTime', false)}
                        ref={refCallbacks['trust-responseTime']}
                        maxLength={20}
                      />
                    </FormField>
                    <FormField label="Label" helpText="e.g., Quick Response" id="trust-responseLabel">
                      <input
                        id="trust-responseLabel"
                        type="text"
                        placeholder="e.g., Quick Response"
                        value={data.trust.responseLabel}
                        onChange={(e) => setData((prev) => ({
                          ...prev!,
                          trust: { ...prev!.trust, responseLabel: e.target.value }
                        }))}
                        onFocus={() => setFocusedField('trust-responseLabel')}
                        onBlur={() => setFocusedField(null)}
                        style={ui.input(focusedField === 'trust-responseLabel', false)}
                        ref={refCallbacks['trust-responseLabel']}
                        maxLength={50}
                      />
                    </FormField>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>No Commitment Indicator</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <FormField label="Value" helpText="e.g., No Commitment" id="trust-noCommitment">
                      <input
                        id="trust-noCommitment"
                        type="text"
                        placeholder="e.g., No Commitment"
                        value={data.trust.noCommitment}
                        onChange={(e) => setData((prev) => ({
                          ...prev!,
                          trust: { ...prev!.trust, noCommitment: e.target.value }
                        }))}
                        onFocus={() => setFocusedField('trust-noCommitment')}
                        onBlur={() => setFocusedField(null)}
                        style={ui.input(focusedField === 'trust-noCommitment', false)}
                        ref={refCallbacks['trust-noCommitment']}
                        maxLength={50}
                      />
                    </FormField>
                    <FormField label="Label" helpText="e.g., Cancel Anytime" id="trust-noCommitmentLabel">
                      <input
                        id="trust-noCommitmentLabel"
                        type="text"
                        placeholder="e.g., Cancel Anytime"
                        value={data.trust.noCommitmentLabel}
                        onChange={(e) => setData((prev) => ({
                          ...prev!,
                          trust: { ...prev!.trust, noCommitmentLabel: e.target.value }
                        }))}
                        onFocus={() => setFocusedField('trust-noCommitmentLabel')}
                        onBlur={() => setFocusedField(null)}
                        style={ui.input(focusedField === 'trust-noCommitmentLabel', false)}
                        ref={refCallbacks['trust-noCommitmentLabel']}
                        maxLength={50}
                      />
                    </FormField>
                  </div>
                </div>
                <FormField label="Footer Text" helpText="Bottom reassurance text" id="trust-footer">
                  <textarea
                    id="trust-footer"
                    placeholder="e.g., Trusted by businesses worldwide"
                    value={data.trust.footer}
                    onChange={(e) => setData((prev) => ({ ...prev!, trust: { ...prev!.trust, footer: e.target.value } }))}
                    onFocus={() => setFocusedField('trust-footer')}
                    onBlur={() => setFocusedField(null)}
                    rows={3}
                    style={ui.textarea(focusedField === 'trust-footer', false)}
                    ref={refCallbacks['trust-footer']}
                    maxLength={200}
                  />
                </FormField>
              </SectionCard>

              <SectionCard title="Call-to-Action Buttons" icon="🚀" isOpen={open.ctas} onToggle={() => setOpen((prev) => ({ ...prev, ctas: !prev.ctas }))}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Primary CTA Button</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <FormField
                      label="Button Label"
                      required
                      error={errors.primaryLabel ? 'Required' : undefined}
                      helpText="Primary button text"
                      id="primaryLabel"
                    >
                      <input
                        id="primaryLabel"
                        type="text"
                        placeholder="e.g., Book a Free Consultation"
                        value={data.ctas.primaryLabel}
                        onChange={(e) => setData((prev) => ({ ...prev!, ctas: { ...prev!.ctas, primaryLabel: e.target.value } }))}
                        onFocus={() => setFocusedField('primaryLabel')}
                        onBlur={() => setFocusedField(null)}
                        style={ui.input(focusedField === 'primaryLabel', !!errors.primaryLabel)}
                        ref={refCallbacks.primaryLabel}
                        maxLength={50}
                      />
                    </FormField>
                    <FormField
                      label="Button Link"
                      required
                      error={!errors.primaryHref ? undefined : 'Required. Use /relative or http(s) URL'}
                      helpText="URL or relative path"
                      id="primaryHref"
                    >
                      <input
                        id="primaryHref"
                        type="text"
                        placeholder="e.g., /book-meeting"
                        value={data.ctas.primaryHref}
                        onChange={(e) => setData((prev) => ({ ...prev!, ctas: { ...prev!.ctas, primaryHref: e.target.value } }))}
                        onFocus={() => setFocusedField('primaryHref')}
                        onBlur={() => setFocusedField(null)}
                        style={ui.input(focusedField === 'primaryHref', !!errors.primaryHref)}
                        ref={refCallbacks.primaryHref}
                        maxLength={200}
                      />
                    </FormField>
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>Secondary CTA Button</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <FormField label="Button Label" helpText="Secondary button text (optional)" id="secondaryLabel">
                      <input
                        id="secondaryLabel"
                        type="text"
                        placeholder="e.g., Chat on WhatsApp"
                        value={data.ctas.secondaryLabel}
                        onChange={(e) => setData((prev) => ({ ...prev!, ctas: { ...prev!.ctas, secondaryLabel: e.target.value } }))}
                        onFocus={() => setFocusedField('secondaryLabel')}
                        onBlur={() => setFocusedField(null)}
                        style={ui.input(focusedField === 'secondaryLabel', false)}
                        ref={refCallbacks.secondaryLabel}
                        maxLength={50}
                      />
                    </FormField>
                    <FormField
                      label="Button Link"
                      error={errors.secondaryHref ? 'Invalid URL' : undefined}
                      helpText="Leave blank for auto-WhatsApp link"
                      id="secondaryHref"
                    >
                      <input
                        id="secondaryHref"
                        type="text"
                        placeholder="e.g., https://wa.me/1234567890 or leave blank"
                        value={data.ctas.secondaryHref}
                        onChange={(e) => setData((prev) => ({ ...prev!, ctas: { ...prev!.ctas, secondaryHref: e.target.value } }))}
                        onFocus={() => setFocusedField('secondaryHref')}
                        onBlur={() => setFocusedField(null)}
                        style={ui.input(focusedField === 'secondaryHref', !!errors.secondaryHref)}
                        ref={refCallbacks['secondaryHref']}
                        maxLength={200}
                      />
                    </FormField>
                  </div>
                </div>
                <FormField
                  label="WhatsApp Number"
                  error={errors.whatsAppNumber ? 'Digits only, 6-15 length' : undefined}
                  helpText={!errors.whatsAppNumber ? 'For auto-WhatsApp link (e.g., 15551234567)' : undefined}
                  id="whatsAppNumber"
                >
                  <input
                    id="whatsAppNumber"
                    type="text"
                    placeholder="Digits only, e.g., 15551234567"
                    value={data.whatsAppNumber}
                    onChange={(e) => setData((prev) => ({ ...prev!, whatsAppNumber: e.target.value }))}
                    onFocus={() => setFocusedField('whatsAppNumber')}
                    onBlur={() => setFocusedField(null)}
                    style={ui.input(focusedField === 'whatsAppNumber', !!errors.whatsAppNumber)}
                    ref={refCallbacks.whatsAppNumber}
                    maxLength={15}
                  />
                </FormField>
              </SectionCard>
            </div>

            {/* Live Preview (deferred for perf) */}
            {isWide && deferredData && (
              <div style={ui.asideGrid}>
                <div style={ui.card}>
                  <div style={{ ...ui.sectionHeader, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
                    <div style={ui.sectionTitle}>🎯 Live Preview</div>
                  </div>
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Match page theme
                    borderRadius: '16px',
                    padding: '24px',
                    marginTop: '16px',
                    color: 'white'
                  }}>
                    {deferredData.badge.trim() && (
                      <div style={ui.previewBadge}>{deferredData.badge.trim()}</div>
                    )}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{
                        fontSize: '28px',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        marginBottom: '8px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {deferredData.headlineLine1.trim() || 'Headline Line 1'}
                      </div>
                      <div style={{
                        fontSize: '28px',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        marginBottom: '12px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {deferredData.headlineLine2.trim() || 'Headline Line 2'}
                      </div>
                      {deferredData.subheading.trim() && (
                        <div style={{
                          fontSize: '16px',
                          opacity: 0.95,
                          lineHeight: 1.5,
                          fontWeight: 600
                        }}>
                          {deferredData.subheading.trim()}
                        </div>
                      )}
                    </div>
                    {deferredData.benefits.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                        {deferredData.benefits.slice(0, 4).map((b, i) => (
                          <div key={i} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'rgba(255, 255, 255, 0.15)',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            fontSize: '13px',
                            fontWeight: 600
                          }}>
                            <span>✓</span>
                            {b}
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                      <a
                        href={deferredData.ctas.primaryHref || '#'}
                        style={ui.previewCtaPrimary}
                        aria-label="Primary CTA Preview"
                      >
                        {deferredData.ctas.primaryLabel || 'Primary CTA'}
                      </a>
                      <a
                        href={
                          deferredData.ctas.secondaryHref ||
                          (deferredData.whatsAppNumber ? `https://wa.me/${deferredData.whatsAppNumber}` : '#')
                        }
                        style={{
                          ...ui.previewCtaSecondary,
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          color: 'white'
                        }}
                        aria-label="Secondary CTA Preview"
                      >
                        {deferredData.ctas.secondaryLabel || 'Secondary CTA'}
                      </a>
                    </div>
                    {/* Stats */}
                    {(deferredData.stats.activeClients || deferredData.stats.avgRoi || deferredData.stats.satisfaction || deferredData.stats.fastStart) && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        marginBottom: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        {deferredData.stats.activeClients && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: 700 }}>{deferredData.stats.activeClients}</div>
                            <div style={{ fontSize: '11px', opacity: 0.9 }}>Active Clients</div>
                          </div>
                        )}
                        {deferredData.stats.avgRoi && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: 700 }}>{deferredData.stats.avgRoi}</div>
                            <div style={{ fontSize: '11px', opacity: 0.9 }}>Avg ROI</div>
                          </div>
                        )}
                        {deferredData.stats.satisfaction && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: 700 }}>{deferredData.stats.satisfaction}</div>
                            <div style={{ fontSize: '11px', opacity: 0.9 }}>Satisfaction</div>
                          </div>
                        )}
                        {deferredData.stats.fastStart && (
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: 700 }}>{deferredData.stats.fastStart}</div>
                            <div style={{ fontSize: '11px', opacity: 0.9 }}>Fast Start</div>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Trust */}
                    {(
                      deferredData.trust.consultationTime ||
                      deferredData.trust.responseTime ||
                      deferredData.trust.noCommitment ||
                      deferredData.trust.footer
                    ) && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        paddingTop: '16px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                      }}>
                        {deferredData.trust.consultationTime && (
                          <div style={{ fontSize: '13px' }}>
                            <span style={{ fontWeight: 700 }}>{deferredData.trust.consultationTime}</span>
                            {deferredData.trust.consultationLabel && <span style={{ opacity: 0.9 }}> - {deferredData.trust.consultationLabel}</span>}
                          </div>
                        )}
                        {deferredData.trust.responseTime && (
                          <div style={{ fontSize: '13px' }}>
                            <span style={{ fontWeight: 700 }}>{deferredData.trust.responseTime}</span>
                            {deferredData.trust.responseLabel && <span style={{ opacity: 0.9 }}> - {deferredData.trust.responseLabel}</span>}
                          </div>
                        )}
                        {deferredData.trust.noCommitment && (
                          <div style={{ fontSize: '13px' }}>
                            <span style={{ fontWeight: 700 }}>{deferredData.trust.noCommitment}</span>
                            {deferredData.trust.noCommitmentLabel && <span style={{ opacity: 0.9 }}> - {deferredData.trust.noCommitmentLabel}</span>}
                          </div>
                        )}
                        {deferredData.trust.footer && (
                          <div style={{ opacity: 0.9, fontSize: '12px', marginTop: '8px', fontStyle: 'italic' }}>
                            {deferredData.trust.footer}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Bar */}
        {data && (
          <div style={{ ...ui.card, marginTop: '24px', position: 'sticky', bottom: '24px', zIndex: 100 }}>
            {isDirty && (
              <div style={{
                marginBottom: '12px',
                fontSize: '14px',
                color: '#92400e',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%' }} />
                You have unsaved changes
              </div>
            )}
            {hasErrors && (
              <div style={{
                marginBottom: '12px',
                fontSize: '14px',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }} />
                Fix errors before saving
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={ui.btnRow}>
                <button
                  type="button"
                  onClick={onRevert}
                  disabled={!isDirty}
                  style={{
                    ...ui.btn,
                    opacity: isDirty ? 1 : 0.5,
                    cursor: isDirty ? 'pointer' : 'not-allowed'
                  }}
                >
                  ↩️ Revert
                </button>
              </div>
              <button
                type="button"
                onClick={onSave}
                disabled={!hasToken || !isDirty || saving || hasErrors}
                style={{
                  ...ui.btnPrimary,
                  opacity: (!hasToken || !isDirty || saving || hasErrors) ? 0.5 : 1,
                  cursor: (!hasToken || !isDirty || saving || hasErrors) ? 'not-allowed' : 'pointer'
                }}
                aria-label="Save changes"
              >
                {saving ? '💾 Saving...' : '💾 Save Changes'}
                {!saving && isDirty && !hasErrors && ' (Ctrl/Cmd + S)'}
              </button>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div style={{ ...ui.toast, borderLeftColor: toast.type === 'error' ? '#ef4444' : '#10b981' }}>
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              style={{
                background: 'transparent',
                color: '#6b7280',
                border: 0,
                cursor: 'pointer',
                fontSize: '20px',
                padding: 0,
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              aria-label="Close toast"
            >
              ×
            </button>
          </div>
        )}
      </div>
>>>>>>> 52db72a9ddcf09cff259f0de5b5886ccb951fe0f
    </div>
  );
}