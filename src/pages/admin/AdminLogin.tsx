import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft, KeyRound, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import {
  checkAdminLoginThrottle,
  recordFailedAdminLogin,
  resetAdminLoginThrottle,
} from '../../utils/security';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);

  const { signIn, isBackendConnected } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/admin';

  // Countdown timer for brute-force lock
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Check brute-force throttling
    const throttleCheck = checkAdminLoginThrottle();
    if (!throttleCheck.allowed) {
      setLockoutSeconds(throttleCheck.remainingLockSeconds || 60);
      setErrorMessage(`Too many failed login attempts. Security lockout active for ${throttleCheck.remainingLockSeconds} seconds.`);
      return;
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email address and password.');
      return;
    }

    setSubmitting(true);
    const result = await signIn(email.trim(), password);
    setSubmitting(false);

    if (result.success) {
      resetAdminLoginThrottle();
      navigate(from, { replace: true });
    } else {
      const failure = recordFailedAdminLogin();
      if (failure.locked) {
        setLockoutSeconds(failure.remainingLockSeconds || 60);
        setErrorMessage(`Security lockout: 5 failed attempts detected. Please wait ${failure.remainingLockSeconds} seconds.`);
      } else {
        setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Bar */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between pb-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Return to Storefront</span>
        </Link>
        <span className="text-[11px] font-mono text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
          ADMIN SECURITY GATEWAY
        </span>
      </div>

      {/* Main Card Container */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0b0e17] border border-white/[0.08] shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-500/10 to-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Icon & Title */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-white font-display">
              GameVault Administrator
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 max-w-xs">
              Secure authentication gateway. Only authorized administrators with records in{' '}
              <code className="text-cyan-400 font-mono">admin_users</code> may access this portal.
            </p>
          </div>

          {/* Backend Connection Notice */}
          {!isBackendConnected && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">Supabase Connection Pending</span>
                <span className="text-[11px] text-amber-200/80 block leading-relaxed">
                  Configure <code className="text-amber-100 font-mono">VITE_SUPABASE_URL</code> and{' '}
                  <code className="text-amber-100 font-mono">VITE_SUPABASE_ANON_KEY</code> in your environment file to authenticate.
                </span>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="admin@gamevault.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={submitting}
              className="w-full mt-6 font-bold"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              {submitting ? 'AUTHENTICATING...' : 'AUTHENTICATE SESSION'}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 text-center leading-relaxed">
            All administrative logins and actions are recorded in the PostgreSQL{' '}
            <span className="text-cyan-400 font-mono">admin_audit_logs</span> database table with strict Row Level Security.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto w-full text-center text-xs text-slate-400 font-mono pt-4">
        GameVault Digital Catalog • Secure RBAC Administration System
      </div>
    </div>
  );
};
