import React, { useState } from 'react';
import { ShieldCheck, BookOpen, User as UserIcon, Lock, Sparkles, Cpu } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (token: string, user: User) => void;
  onToggleRegister: () => void;
}

export default function Login({ onLoginSuccess, onToggleRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);

    try {
      const data = await api.login(email, password);
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Verification failure. Incorrect password.');
    } finally {
      setLoading(false);
    }
  };

  // Automated credential filler for institutional simulation evaluation
  const fillPreset = (role: 'student' | 'officer' | 'admin') => {
    setError(null);
    if (role === 'student') {
      setEmail('jane@admission.com');
      setPassword('jane123');
    } else if (role === 'officer') {
      setEmail('officer@admission.com');
      setPassword('officer123');
    } else if (role === 'admin') {
      setEmail('admin@admission.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        
        {/* Left Side: Editorial Banner Panel */}
        <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-700 via-indigo-800 to-violet-950 p-10 text-white lg:flex">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-300" />
            <span className="font-sans font-bold tracking-tight text-white">
              AI Admissions Platform
            </span>
          </div>

          <div className="my-auto space-y-4">
            <h2 className="font-sans text-3xl font-bold leading-tight tracking-tight">
              A Complete Modern Admissions Gateway
            </h2>
            <p className="font-sans text-sm leading-relaxed text-indigo-100">
              Leverage custom high-precision **Logistic Regression classifiers** for immediate eligibility prediction, complemented by deep **Google Gemini AI analytical evaluation reports** detailing students' prospective growth index.
            </p>

            {/* Micro feature indicators */}
            <div className="flex flex-col gap-3.5 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Cpu className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-semibold">Native Predictor Network</h4>
                  <p className="font-sans text-[10px] text-indigo-200">Scikit-Learn parameters adapted natively in TypeScript</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-sans text-xs font-semibold">Gemini Evaluation Agent</h4>
                  <p className="font-sans text-[10px] text-indigo-200">Generates instant scholastic evaluation dossiers</p>
                </div>
              </div>
            </div>
          </div>

          <div className="font-mono text-[10px] text-indigo-300 tracking-wider uppercase">
            Institutional Standard | v2.4.0
          </div>
          
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-violet-600 opacity-20 blur-2xl" />
        </div>

        {/* Right Side: Auth Form Panel */}
        <div className="flex w-full flex-col justify-center p-8 sm:p-12 lg:w-1/2">
          <div>
            <h3 className="font-sans text-2xl font-bold tracking-tight text-slate-900">
              Portal Verification
            </h3>
            <p className="mt-1 font-sans text-xs text-slate-500">
              Sign in to manage academic records and track evaluations.
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 font-sans text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  id="inp_login_email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@admission.com"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Security Password
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  id="inp_login_password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn_login_submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 font-sans text-xs font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating Profile...' : 'Unlock Account Portal'}
            </button>
          </form>

          {/* Quick-select Presets (Educational sandbox booster!) */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400">
              sandbox developer quick-login:
            </p>
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <button
                onClick={() => fillPreset('student')}
                id="btn_preset_student"
                type="button"
                className="rounded-xl border border-emerald-100 bg-emerald-50/50 py-1.5 font-sans text-[10px] font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
              >
                Jane Profile (Student)
              </button>
              <button
                onClick={() => fillPreset('officer')}
                id="btn_preset_officer"
                type="button"
                className="rounded-xl border border-amber-100 bg-amber-50/50 py-1.5 font-sans text-[10px] font-bold text-amber-800 transition-colors hover:bg-amber-100"
              >
                Dr. Robert (Officer)
              </button>
              <button
                onClick={() => fillPreset('admin')}
                id="btn_preset_admin"
                type="button"
                className="rounded-xl border border-indigo-100 bg-indigo-50/50 py-1.5 font-sans text-[10px] font-bold text-indigo-800 transition-colors hover:bg-indigo-100"
              >
                Director (Admin)
              </button>
            </div>
          </div>

          <p className="mt-6 text-center font-sans text-xs text-slate-500">
            Don't have an application account?{' '}
            <button
              onClick={onToggleRegister}
              id="btn_goto_register"
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
            >
              Create Account
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
