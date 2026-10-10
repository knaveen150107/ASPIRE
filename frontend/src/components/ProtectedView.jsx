import React from 'react';
import { Lock, ShieldAlert, LogIn, ArrowRight, UserCheck } from 'lucide-react';
import AspireLogo from './AspireLogo';

export const ProtectedView = ({ requiredRole = 'authenticated', onOpenAuth, onNavigate }) => {
  const isRoleMismatch = requiredRole !== 'authenticated';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 animate-fade-in bg-slate-50">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="flex justify-center">
          <AspireLogo size="lg" />
        </div>

        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
          {isRoleMismatch ? <ShieldAlert className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            {isRoleMismatch ? `${requiredRole.toUpperCase()} Privilege Required` : 'Protected Platform Area'}
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900">
            {isRoleMismatch ? 'Restricted Access' : 'Sign In to Continue'}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
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
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            Return to Home Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProtectedView;
