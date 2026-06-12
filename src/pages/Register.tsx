import React, { useState } from 'react';
import { BookOpen, User as UserIcon, Mail, Lock, UserCheck } from 'lucide-react';
import { api } from '../services/api';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onToggleLogin: () => void;
}

export default function Register({ onRegisterSuccess, onToggleLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setLoading(true);
    setError(null);

    try {
      await api.register(name, email, password);
      setSuccess(true);
      setTimeout(() => {
        onRegisterSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try again with a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
        
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <UserCheck className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-sans text-2xl font-bold tracking-tight text-slate-900">
            Candidate Application Sign-Up
          </h3>
          <p className="mt-1 font-sans text-xs text-slate-500">
            Register your institutional account to begin admission profiling.
          </p>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 font-sans text-xs text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 font-sans text-xs text-emerald-700">
            Account created successfully! Redirecting to login portal...
          </div>
        )}

        <form onSubmit={handleRegister} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Full Legal Name
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <UserIcon className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                id="inp_register_name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="mt-1 text-[9px] text-slate-400 font-sans">
              Enter your name exactly as it appears in your 12th Board marks memo.
            </p>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Email Address
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                id="inp_register_email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane.doe@gmail.com"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Access Password
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                id="inp_register_password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 font-sans text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            id="btn_register_submit"
            disabled={loading || success}
            className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 font-sans text-xs font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Registering Credentials...' : 'Create Admissions Profile'}
          </button>
        </form>

          <p className="mt-6 text-center font-sans text-xs text-slate-500">
            Already have an applicant account?{' '}
            <button
              onClick={onToggleLogin}
              id="btn_goto_login"
              className="font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
            >
              Sign In
            </button>
          </p>

      </div>
    </div>
  );
}
