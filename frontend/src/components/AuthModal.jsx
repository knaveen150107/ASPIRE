import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, GraduationCap, Building2, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import AspireLogo from './AspireLogo';

export const AuthModal = ({ isOpen = true, onClose, initialMode = 'login', initialTab, onSuccess }) => {
  const [mode, setMode] = useState(initialTab || initialMode || 'login'); // 'login' | 'register'
  const [role, setRole] = useState('student'); // 'student' | 'recruiter' | 'admin'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [justRegisteredMsg, setJustRegisteredMsg] = useState(null);

  const { login } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (initialTab || initialMode) {
      setMode(initialTab || initialMode);
      setJustRegisteredMsg(null);
    }
  }, [initialTab, initialMode, isOpen]);

  if (isOpen === false) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setJustRegisteredMsg(null);

    try {
      if (mode === 'login') {
        const userData = await login(email, password);
        toast.success(`Welcome back, ${userData?.name || 'Scholar'}!`);
        if (onSuccess) onSuccess(userData || { role });
        if (onClose) onClose();
      } else {
        // Register account
        await api.register(name, email, password, role);
        toast.success(`Account created successfully as ${role}! Please sign in.`);
        setJustRegisteredMsg(`Your ${role} account has been created. Please enter your password to sign in.`);
        setMode('login');
        setPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 transition-colors">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <AspireLogo size="md" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {mode === 'login' ? 'Sign in to ASPIRE' : 'Create your account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {mode === 'login' 
              ? 'Access your placement analytics, tests, and job applications' 
              : 'Join ASPIRE to unlock AI placement readiness and roadmaps'}
          </p>
        </div>

        {/* Login / Register Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Registration Success Banner */}
        {justRegisteredMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{justRegisteredMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <>
              {/* Role Selection Tabs */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Select Your Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      role === 'student'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('recruiter')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border transition-all ${
                      role === 'recruiter'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 dark:border-blue-500 text-blue-700 dark:text-blue-300 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Recruiter</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Account' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === 'login' ? "Don't have an account yet?" : 'Already registered?'}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="ml-1.5 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
          >
            {mode === 'login' ? 'Create Account' : 'Sign In'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthModal;
