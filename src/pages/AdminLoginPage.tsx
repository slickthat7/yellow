import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Sparkles, Building2, UserCheck } from 'lucide-react';
import { AuthSessionUser } from '../types/index.js';
import { Yellow360Logo } from '../components/Yellow360Logo.js';

interface AdminLoginPageProps {
  onLoginSuccess: (user: AuthSessionUser) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text.slice(0, 100) || `Server error (${res.status})`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      onLoginSuccess(data.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FEFCE8] flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link to="/">
            <Yellow360Logo size="lg" variant="purple" />
          </Link>
          <p className="text-xs font-black uppercase tracking-wider text-[#5B00FF]">
            Review Control Portal & Client Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border-2 border-slate-900 rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(91,0,255,1)]">
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 mb-2">Sign in to your account</h2>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-[#5B00FF] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-slate-200 text-slate-900 text-xs rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-[#5B00FF] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#5B00FF] hover:bg-[#4C00C8] text-white font-black text-xs uppercase tracking-wider rounded-xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(30,27,75,1)] transition-all flex items-center justify-center space-x-2 active:translate-x-[1px] active:translate-y-[1px]"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In To Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-6 pt-5 border-t-2 border-slate-100 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#5B00FF] block">
              ⚡ Quick Demo Account Switcher
            </span>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('superadmin@reviewflow.com')}
                className="w-full text-left p-2.5 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-xl transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-purple-900 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#5B00FF]" /> Superadmin Account
                  </p>
                  <p className="text-[10px] text-purple-700 font-mono">superadmin@reviewflow.com</p>
                </div>
                <span className="text-[10px] font-black text-[#5B00FF] group-hover:underline">Autofill</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemoAccount('admin@apexdental.com')}
                className="w-full text-left p-2.5 bg-yellow-50 hover:bg-yellow-100/80 border border-yellow-200 rounded-xl transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-xs font-bold text-yellow-950 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" /> Apex Dental Brand Admin
                  </p>
                  <p className="text-[10px] text-yellow-800 font-mono">admin@apexdental.com</p>
                </div>
                <span className="text-[10px] font-black text-amber-700 group-hover:underline">Autofill</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
