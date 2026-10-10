import React, { useState } from 'react';
import { 
  User, 
  LogOut, 
  LogIn, 
  Menu, 
  X, 
  ChevronRight 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AspireLogo from './AspireLogo';

export const Navbar = ({ currentView, setCurrentView, onNavigate, openAuthModal, onOpenAuth }) => {
  const navigate = onNavigate || setCurrentView;
  const triggerAuth = onOpenAuth || openAuthModal;
  const { user, role, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authenticated Portal Navigation Items
  const authenticatedNavItems = [
    { id: 'jobs', label: 'Job Discovery', studentOnly: true },
    { id: 'mock-tests', label: 'Mock Tests', studentOnly: true },
    { id: 'skill-gaps', label: 'Skill Analysis', studentOnly: true },
    { id: 'roadmaps', label: 'Career Roadmaps', studentOnly: true },
    { id: 'resumes', label: 'AI Resumes', studentOnly: true },
    { id: 'dashboard', label: 'Student Portal', studentOnly: true },
    { id: 'recruiter', label: 'Recruiter Hub', recruiterOnly: true },
    { id: 'admin', label: 'Admin Portal', adminOnly: true },
  ];

  const visibleNav = isAuthenticated ? authenticatedNavItems.filter((item) => {
    if (item.studentOnly && role === 'student') return true;
    if (item.recruiterOnly && role === 'recruiter') return true;
    if (item.adminOnly && role === 'admin') return true;
    return false;
  }) : [];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Global Brand Logo */}
          <div 
            className="cursor-pointer"
            onClick={() => navigate('landing')}
          >
            <AspireLogo size="md" />
          </div>

          {/* Center: Authenticated Navigation Links (Only visible when signed in) */}
          {isAuthenticated && visibleNav.length > 0 && (
            <nav className="hidden md:flex items-center space-x-1">
              {visibleNav.map((item) => {
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right: User Controls & Login / Register Buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div 
                  onClick={() => navigate(role === 'admin' ? 'admin' : role === 'recruiter' ? 'recruiter' : 'dashboard')}
                  className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-all"
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
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => triggerAuth('login')}
                  aria-label="Sign in to your account"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95"
                >
                  Sign In
                </button>

                <button
                  onClick={() => triggerAuth('register')}
                  aria-label="Register a new account"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all active:scale-95"
                >
                  Register
                </button>
              </div>
            )}

            {/* Mobile Menu Button when Authenticated */}
            {isAuthenticated && visibleNav.length > 0 && (
              <div className="flex md:hidden items-center">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:text-slate-900"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Drawer (Authenticated) */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1 shadow-xl animate-fade-in">
          {visibleNav.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id);
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

          <div className="pt-4 border-t border-slate-100">
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
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
