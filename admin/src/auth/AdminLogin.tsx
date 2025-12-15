import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, User, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { FormField, AdminInput, ActionButton, Toast } from '../AdminFormComponents';

const API_BASE = ((import.meta as unknown) as { env?: Record<string, string> }).env?.VITE_API_BASE || 'http://localhost:5001';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    const mode = url.pathname.endsWith('/signup') || url.searchParams.get('mode') === 'signup' ? 'signup' : 'login';
    setIsLogin(mode !== 'signup');
  }, []);

  const passwordScore = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url = isLogin ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/signup`;
      const body = isLogin ? { email, password } : { email, password, name };

      if (!isLogin) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (passwordScore < 3) {
          throw new Error('Password is too weak. Use at least 8 chars incl. numbers and letters');
        }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        setSuccess(isLogin ? 'Login successful!' : 'Account created successfully!');
        setTimeout(() => {
          navigate(from);
        }, 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-4 w-72 h-72 bg-gold/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-gold/20 to-gold/10 border border-gold/20 mb-4">
              <Lock className="w-8 h-8 text-gold" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Admin Login' : 'Create Account'}
            </h1>
            <p className="text-slate-400 text-sm">
              {isLogin ? 'Sign in to access the admin panel' : 'Create a new admin account'}
            </p>
          </div>

          {error && (
            <Toast type="error" message={error} onClose={() => setError(null)} />
          )}
          {success && (
            <Toast type="success" message={success} onClose={() => setSuccess(null)} />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <FormField label="Full Name" required className="relative">
                <User className="absolute left-4 top-10 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <AdminInput
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="pl-12"
                  placeholder="Enter your full name"
                />
              </FormField>
            )}

            <FormField label="Email Address" required className="relative">
              <Mail className="absolute left-4 top-10 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <AdminInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-12"
                placeholder="admin@example.com"
              />
            </FormField>

            <FormField label="Password" required className="relative">
              <Lock className="absolute left-4 top-10 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <AdminInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-12 pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10 -translate-y-1/2 text-slate-400 hover:text-gold transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {!isLogin && (
                <>
                  <div className="mt-2 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        passwordScore <= 2 ? 'bg-red-500 w-1/3' : passwordScore === 3 ? 'bg-yellow-500 w-2/3' : 'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <p className="text-xs mt-1 text-slate-400">
                    {passwordScore <= 2 ? 'Weak' : passwordScore === 3 ? 'Medium' : 'Strong'} password
                  </p>
                </>
              )}
            </FormField>

            {!isLogin && (
              <FormField label="Confirm Password" required className="relative">
                <Lock className="absolute left-4 top-10 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <AdminInput
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required={!isLogin}
                  className="pl-12 pr-12"
                  placeholder="Re-enter your password"
                />
              </FormField>
            )}

            <ActionButton
              type="submit"
              loading={loading}
              icon={isLogin ? LogIn : UserPlus}
              className="w-full justify-center"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </ActionButton>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setSuccess(null);
              }}
              className="text-slate-400 hover:text-gold transition-colors text-sm font-medium"
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-gold font-semibold">Sign up</span></>
              ) : (
                <>Already have an account? <span className="text-gold font-semibold">Sign in</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

