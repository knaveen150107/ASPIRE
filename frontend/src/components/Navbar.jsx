import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Briefcase, 
  FileText, 
  Target, 
  Map, 
  ShieldCheck, 
  User, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  Sparkles,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const Navbar = ({ currentView, setCurrentView, onNavigate, openAuthModal, onOpenAuth }) => {
  const navigate = onNavigate || setCurrentView;
  const triggerAuth = onOpenAuth || openAuthModal;
  const { user, role, isAuthenticated, logout } = useAuth();
  const [dbHealthy, setDbHealthy] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.checkHealth()
      .then((res) => setDbHealthy(res.database_connected))
      .catch(() => setDbHealthy(false));
  }, []);

  const navItems = [
    { id: 'landing', label: 'Home', public: true },
    { id: 'features', label: 'Features', public: true, isAnchor: true },
    { id: 'jobs', label: 'Job Discovery', public: true },
    { id: 'mock-tests', label: 'Mock Tests', public: true },
    { id: 'skill-gaps', label: 'Skill Analysis', studentOnly: true },
    { id: 'roadmaps', label: 'Career Roadmaps', studentOnly: true },
    { id: 'resumes', label: 'AI Resumes', studentOnly: true },
    { id: 'dashboard', label: 'For Students', studentOnly: true },
    { id: 'recruiter', label: 'Recruiter Hub', recruiterOnly: true },
    { id: 'admin', label: 'Admin Portal', adminOnly: true },
  ];

  const visibleNav = navItems.filter((item) => {
    if (item.public) return true;
    if (item.studentOnly && role === 'student') return true;
    if (item.recruiterOnly && role === 'recruiter') return true;
    if (item.adminOnly && role === 'admin') return true;
    return false;
  });

  const handleNavClick = (item) => {
    if (item.isAnchor) {
      if (currentView !== 'landing') {
        navigate('landing');
        setTimeout(() => {
          const el = document.getElementById('features-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.getElementById('features-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(item.id);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group"
            onClick={() => navigate('landing')}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-base shadow-sm group-hover:scale-105 transition-transform">
              ▲
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-tight">
                ASPIRE
              </span>
              <span className="text-[9px] text-slate-400 font-medium block -mt-0.5 tracking-normal">
                Your Career, Our Intelligence
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {visibleNav.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-blue-600 bg-blue-50/80 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User Controls & Status */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Live DB Indicator */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-medium text-slate-500">
              <span className={`w-2 h-2 rounded-full ${dbHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span>{dbHealthy ? 'Atlas Live' : 'Connecting'}</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div 
                  onClick={() => navigate(role === 'admin' ? 'admin' : role === 'recruiter' ? 'recruiter' : 'dashboard')}
                  className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 transition-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 truncate max-w-[90px]">{user?.name}</p>
                    <p className="text-[10px] text-blue-600 capitalize font-medium">{role}</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-slate-200"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => triggerAuth('login')}
                  className="px-3.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 text-xs font-bold transition"
                >
                  Sign In
                </button>

                <button
                  onClick={() => triggerAuth('register')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1 shadow-xl animate-fade-in">
          {visibleNav.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleNavClick(item);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user?.email})</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    triggerAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold text-xs"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    triggerAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
