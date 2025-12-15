import { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles, Target, BarChart3, Handshake, Rocket, Globe, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SectionCard, FormField, AdminInput, AdminTextarea, AdminSelect, PageHeader, ControlsBar, StickyActionBar, StatusBadge, Toast } from './AdminFormComponents';

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
    }
  }, [lang, headers, handle401]);

  useEffect(() => {
    if (hasToken) void load();
  }, [hasToken, load]);

  const onSave = useCallback(async () => {
    if (!effectiveData || hasErrors) return;
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!hasErrors && hasToken && isDirty && !saving) void onSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasErrors, hasToken, isDirty, saving, onSave]);

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
    </div>
  );
}
