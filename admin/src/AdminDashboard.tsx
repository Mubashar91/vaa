import { Link, useLocation, Outlet } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { DollarSign, Workflow, Settings, LogOut, HelpCircle, Briefcase, MessageSquare, FileText, Trophy, Menu, X } from 'lucide-react';

const API_BASE =
  ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_API_BASE ||
  'http://localhost:5001';

const ENV = ((import.meta as unknown) as { env?: Record<string, any> }).env || {};
const IS_DEV = !!ENV.DEV;

export default function AdminDashboard() {
  const location = useLocation();
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
  const [mobileOpen, setMobileOpen] = useState(false);
  

  useEffect(() => {
    const u = new URL(window.location.href);
    const t = (u.searchParams.get('token') || '').trim();
    if (t) {
      setTimeout(() => setToken(t), 0);
      try { localStorage.setItem('adminToken', t); } catch (_err) { void _err; }
      u.searchParams.delete('token');
      window.history.replaceState({}, document.title, u.toString());
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem('adminToken', token.trim()); } catch (_err) { void _err; }
  }, [token]);

  const handleLogout = () => {
    setToken('');
    try { localStorage.removeItem('adminToken'); } catch (_err) { void _err; }
    window.location.href = '/login';
  };

  const navItems = [
    {
      path: '/pricing',
      label: 'Pricing',
      icon: DollarSign,
      description: 'Manage pricing plans'
    },
    {
      path: '/how-it-works',
      label: 'How It Works',
      icon: Workflow,
      description: 'Manage workflow steps'
    },
    {
      path: '/faq',
      label: 'FAQ',
      icon: HelpCircle,
      description: 'Manage FAQ items'
    },
    {
      path: '/services',
      label: 'Services',
      icon: Briefcase,
      description: 'Manage services'
    },
    {
      path: '/testimonials',
      label: 'Testimonials',
      icon: MessageSquare,
      description: 'Manage testimonials'
    },
    {
      path: '/blogs',
      label: 'Blogs',
      icon: FileText,
      description: 'Manage blog posts'
    },
    {
      path: '/case-studies',
      label: 'Case Studies',
      icon: Trophy,
      description: 'Manage success stories'
    },
    {
      path: '/hero',
      label: 'Hero Section',
      icon: FileText,
      description: 'Manage hero section'
    },
    {
      path: '/why-choose-us',
      label: 'Why Choose Us',
      icon: Briefcase,
      description: 'Manage why choose us section'
    },
    {
      path: '/footer',
      label: 'Footer',
      icon: Settings,
      description: 'Manage footer content'
    },
    {
      path: '/final-cta',
      label: 'Final CTA',
      icon: FileText,
      description: 'Manage final call-to-action section'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-4 w-72 h-72 bg-gold/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {/* Mobile sidebar toggle */}
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700/60"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="p-2 bg-gradient-to-br from-gold/20 to-gold/10 rounded-lg border border-gold/20">
                <Settings className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-xs text-slate-400">Content Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <span className="text-green-300 text-sm font-semibold">Authenticated</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-300 rounded-xl transition-all text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-slate-900/95 border-r border-slate-800/70 p-5 shadow-2xl animate-in slide-in-from-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-gold/20 to-gold/10 rounded-lg border border-gold/20">
                  <Settings className="w-5 h-5 text-gold" />
                </div>
                <span className="text-white font-semibold">Menu</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700/60"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-gold/25 via-gold/20 to-gold/15 border border-gold/50 text-gold shadow-lg shadow-gold/20'
                        : 'text-slate-300 hover:bg-slate-700/60 hover:text-white border border-transparent hover:border-slate-600/60 hover:shadow-md'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold to-yellow-500 rounded-r-full"></div>
                    )}
                    <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-gold/20 scale-110' 
                        : 'bg-slate-700/30 group-hover:bg-gold/10 group-hover:scale-110'
                    }`}>
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-gold' : 'text-slate-400 group-hover:text-gold'}`} />
                    </div>
                    <span className={`font-semibold text-sm flex-1 ${isActive ? 'text-gold' : ''} transition-colors`}>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-800/70">
              <button
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-300 rounded-xl transition-all text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="relative w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Navigation Cards */}
        {location.pathname === '/' || location.pathname === '' ? (
          <div className="mb-8">
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                    <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                      Admin Dashboard
                    </span>
                  </h2>
                  <p className="text-slate-400 text-lg">Centralized content management system</p>
                </div>
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="text-sm text-slate-300 font-medium">System Operational</span>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:border-gold/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Sections</p>
                      <p className="text-2xl font-bold text-white">{navItems.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center">
                      <Settings className="w-6 h-6 text-gold" />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 hover:border-blue-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-300 uppercase tracking-wider mb-1">API Status</p>
                      <p className="text-2xl font-bold text-white">Online</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 hover:border-green-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-300 uppercase tracking-wider mb-1">Auth Status</p>
                      <p className="text-2xl font-bold text-white">{hasToken ? 'Active' : 'Pending'}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                      {hasToken ? (
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      ) : (
                        <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-purple-300 uppercase tracking-wider mb-1">Environment</p>
                      <p className="text-2xl font-bold text-white">{IS_DEV ? 'Dev' : 'Prod'}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-6 hover:border-gold/60 hover:from-slate-800/70 hover:to-slate-900/70 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-gold/20 overflow-hidden"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-gold/0 to-gold/0 group-hover:from-gold/8 group-hover:via-gold/12 group-hover:to-gold/8 transition-all duration-500"></div>
                    
                    {/* Professional shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] ease-in-out"></div>
                    </div>

                    {/* Subtle pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-500" style={{
                      backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                      backgroundSize: '20px 20px'
                    }}></div>

                    <div className="relative flex items-start gap-5">
                      <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-gold/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                        <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-gold/25 to-gold/15 group-hover:from-gold/35 group-hover:to-gold/25 border border-gold/30 group-hover:border-gold/50 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-xl shadow-gold/20">
                          <Icon className="w-8 h-8 text-gold drop-shadow-lg" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gold transition-colors duration-300 tracking-tight">
                          {item.label}
                        </h3>
                        <p className="text-slate-400 text-sm leading-relaxed font-medium">{item.description}</p>
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 group-hover:text-gold/70 transition-colors">
                          <span>Manage</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Corner accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gold/0 to-gold/0 group-hover:from-gold/10 group-hover:to-transparent rounded-bl-full transition-all duration-500"></div>
                  </Link>
                );
              })}
            </div>

            {/* Enhanced Status Panel */}
            <div className="mt-10 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-gold via-yellow-500 to-gold rounded-full shadow-lg shadow-gold/50"></div>
                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">System Status</h3>
                    <p className="text-sm text-slate-400 mt-0.5">Real-time system information</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="text-xs font-semibold text-green-300 uppercase tracking-wider">All Systems Operational</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="group relative p-5 bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl border border-slate-700/60 hover:border-gold/40 transition-all duration-300 hover:shadow-lg hover:shadow-gold/10 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl ${hasToken ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center border ${hasToken ? 'border-green-500/30' : 'border-red-500/30'}`}>
                        <div className={`w-4 h-4 rounded-full ${hasToken ? 'bg-green-400' : 'bg-red-400'} shadow-lg ${hasToken ? 'shadow-green-400/50' : 'shadow-red-400/50'} animate-pulse`}></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Authentication</p>
                      <p className="text-lg font-bold text-white">{hasToken ? 'Active' : 'Required'}</p>
                      <p className="text-xs text-slate-500 mt-1">{hasToken ? 'Token validated' : 'Please authenticate'}</p>
                    </div>
                  </div>
                </div>
                <div className="group relative p-5 bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl border border-slate-700/60 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <div className="w-4 h-4 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">API Endpoint</p>
                      <p className="text-sm font-bold text-white truncate font-mono">{API_BASE}</p>
                      <p className="text-xs text-slate-500 mt-1">Connection established</p>
                    </div>
                  </div>
                </div>
                <div className="group relative p-5 bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl border border-slate-700/60 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                        <div className="w-4 h-4 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">Environment</p>
                      <p className="text-lg font-bold text-white">{IS_DEV ? 'Development' : 'Production'}</p>
                      <p className="text-xs text-slate-500 mt-1">{IS_DEV ? 'Debug mode enabled' : 'Production ready'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm">
              <Link
                to="/"
                className="text-slate-400 hover:text-gold transition-colors font-medium"
              >
                Dashboard
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-white font-semibold">
                {navItems.find(item => item.path === location.pathname)?.label || 'Admin'}
              </span>
            </nav>

            {/* Back to Dashboard Button */}
            <div className="mb-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 hover:border-gold/50 text-white rounded-xl transition-all text-sm font-medium backdrop-blur-sm hover:shadow-lg hover:shadow-gold/10"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Dashboard
              </Link>
            </div>

            {/* Sidebar Navigation */}
            <div className="flex gap-6">
              <aside className="hidden lg:block w-72 flex-shrink-0">
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-5 sticky top-24 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-700/60">
                    <div className="w-1.5 h-6 bg-gradient-to-b from-gold via-yellow-500 to-gold rounded-full shadow-lg shadow-gold/50"></div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                        Navigation
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Quick access menu</p>
                    </div>
                  </div>
                  <nav className="space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-r from-gold/25 via-gold/20 to-gold/15 border border-gold/50 text-gold shadow-lg shadow-gold/20'
                              : 'text-slate-300 hover:bg-slate-700/60 hover:text-white border border-transparent hover:border-slate-600/60 hover:shadow-md'
                          }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold to-yellow-500 rounded-r-full"></div>
                          )}
                          <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                            isActive 
                              ? 'bg-gold/20 scale-110' 
                              : 'bg-slate-700/30 group-hover:bg-gold/10 group-hover:scale-110'
                          }`}>
                            <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-gold' : 'text-slate-400 group-hover:text-gold'}`} />
                          </div>
                          <span className={`font-semibold text-sm flex-1 ${isActive ? 'text-gold' : ''} transition-colors`}>{item.label}</span>
                          {isActive && (
                            <div className="w-2 h-2 bg-gold rounded-full shadow-lg shadow-gold/50"></div>
                          )}
                          {!isActive && (
                            <svg className="w-4 h-4 text-slate-500 group-hover:text-gold opacity-0 group-hover:opacity-100 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                  <div className="mt-4 pt-4 border-t border-slate-700/60">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-300 rounded-xl transition-all text-sm font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <main className="flex-1 min-w-0">
                <Outlet />
              </main>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

