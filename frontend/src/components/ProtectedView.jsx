import React from 'react';
import { Lock, ShieldAlert, LogIn, ArrowRight, UserCheck } from 'lucide-react';
import AspireLogo from './AspireLogo';

export const ProtectedView = ({ requiredRole = 'authenticated', onOpenAuth, onNavigate }) => {
  const isRoleMismatch = requiredRole !== 'authenticated';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 animate-fade-in bg-slate-50 dark:bg-[#090d16] transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6 transition-colors">
        <div className="flex justify-center">
          <AspireLogo size="lg" />
        </div>

        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
          {isRoleMismatch ? <ShieldAlert className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {isRoleMismatch ? `${requiredRole.toUpperCase()} Privilege Required` : 'Protected Platform Area'}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isRoleMismatch ? 'Restricted Access' : 'Sign In to Continue'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            {isRoleMismatch 
              ? `This section requires verified ${requiredRole} credentials. Please switch accounts or log in with proper permissions.`
              : 'Access your verified academic credentials, personalized career roadmaps, and company placement tests.'}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <button
            onClick={() => onOpenAuth('login')}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all active:scale-98 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Your Account</span>
          </button>

          <button
            onClick={() => onNavigate('landing')}
            className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
          >
            Return to Home Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProtectedView;
