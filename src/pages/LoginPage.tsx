import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Ticket, Lock, Mail, ArrowRight, Sparkles, Shield, Building2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, quickSwitchDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/events';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      // Toast handles error display
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = async (role: 'ADMIN' | 'ORGANIZER' | 'ATTENDEE') => {
    await quickSwitchDemoRole(role);
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'ORGANIZER') navigate('/organizer');
    else navigate('/events');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white mx-auto mb-4 shadow-md shadow-indigo-200">
            <Ticket className="w-6 h-6 -rotate-12" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to EventEase</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your bookings, manage organizer events, or administer the platform.
          </p>
        </div>

        {/* 1-Click Demo Accounts */}
        <div className="mb-6 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>1-Click Evaluator Demo Sign-In</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('ATTENDEE')}
              className="py-2 px-2 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-xl text-[11px] font-bold text-indigo-700 transition-colors flex flex-col items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Attendee</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ORGANIZER')}
              className="py-2 px-2 bg-white hover:bg-indigo-100 border border-indigo-200 rounded-xl text-[11px] font-bold text-indigo-700 transition-colors flex flex-col items-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Organizer</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="py-2 px-2 bg-white hover:bg-purple-100 border border-purple-200 rounded-xl text-[11px] font-bold text-purple-700 transition-colors flex flex-col items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-[11px] font-medium uppercase tracking-wider">
            Or Sign In with Email
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
