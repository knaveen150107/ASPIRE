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
  Layers
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
    { id: 'landing', label: 'Home', icon: Compass, public: true },
    { id: 'jobs', label: 'Job Discovery', icon: Briefcase, public: true },
    { id: 'mock-tests', label: 'AI Mock Tests', icon: Target, public: true },
    { id: 'skill-gaps', label: 'Skill Gap Radar', icon: Activity, studentOnly: true },
    { id: 'roadmaps', label: 'Career Roadmaps', icon: Map, studentOnly: true },
    { id: 'resumes', label: 'AI Resumes', icon: FileText, studentOnly: true },
    { id: 'recruiter', label: 'Recruiter Hub', icon: Layers, recruiterOnly: true },
    { id: 'admin', label: 'Admin Portal', icon: ShieldCheck, adminOnly: true },
  ];

  const visibleNav = navItems.filter((item) => {
    if (item.public) return true;
    if (item.studentOnly && role === 'student') return true;
    if (item.recruiterOnly && role === 'recruiter') return true;
    if (item.adminOnly && role === 'admin') return true;
    return false;
  });

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setCurrentView('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold tracking-tight text-white">ASPIRE</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  AI Placement
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Controls & Status */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Live DB Indicator */}
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 text-xs">
              <span className={`w-2 h-2 rounded-full ${dbHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
              <span className="text-slate-400">{dbHealthy ? 'Atlas Live' : 'Connecting...'}</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div 
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-blue-500/40 cursor-pointer transition-colors"
                  onClick={() => {
                    if (role === 'student') setCurrentView('student-dashboard');
                    else if (role === 'recruiter') setCurrentView('recruiter');
                    else if (role === 'admin') setCurrentView('admin');
                  }}
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white truncate max-w-[100px]">{user.name}</p>
                    <p className="text-[10px] text-blue-400 capitalize font-medium">{role}</p>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/25 transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Get Started</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-slate-950/95 px-4 pt-2 pb-6 space-y-2">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-blue-600/20 text-blue-400' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 border-t border-white/10">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-rose-950/40 text-rose-300 border border-rose-500/30 text-sm font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user?.email})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  openAuthModal('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-lg"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
