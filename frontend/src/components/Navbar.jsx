import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  LogOut, 
  Menu, 
  X, 
  Moon, 
  Sun,
  Settings,
  Download,
  RefreshCw,
  Copy,
  Check,
  Briefcase,
  FileText,
  Target,
  GraduationCap,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AspireLogo from './AspireLogo';

export const Navbar = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, role, isAuthenticated, logout, refreshUser } = useAuth();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute User Initials (e.g., "Naveen K" -> "NK")
  const getInitials = (name) => {
    if (!name) return 'NK';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const studentRollId = user?.register_number || 'CB.SC.U4AIE24235';

  const handleCopyId = () => {
    navigator.clipboard.writeText(studentRollId);
    setCopiedId(true);
    if (toast?.success) toast.success('Registration ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    if (refreshUser) await refreshUser();
    if (toast?.success) toast.success('Data synced with server');
    setTimeout(() => {
      setIsRefreshing(false);
      setProfileDropdownOpen(false);
    }, 600);
  };

  const handleInstallApp = () => {
    if (toast?.info) {
      toast.info('ASPIRE Progressive Web App is available for desktop installation.');
    }
    setProfileDropdownOpen(false);
  };

  // Student Navigation Items:
  // Home, Profile, Jobs, Mock Test, Resume Checker, Skill Gap
  const studentNavItems = [
    { id: 'dashboard', label: 'Home' },
    { id: 'dashboard', label: 'Profile', isProfileScroll: true },
    { id: 'jobs', label: 'Jobs' },
    { id: 'mock-tests', label: 'Mock Test' },
    { id: 'resumes', label: 'Resume Checker' },
    { id: 'skill-gaps', label: 'Skill Gap' },
  ];

  // Role-specific extensions
  if (role === 'recruiter') {
    studentNavItems.unshift({ id: 'recruiter', label: 'Recruiter Hub' });
  } else if (role === 'admin') {
    studentNavItems.unshift({ id: 'admin', label: 'Admin Portal' });
  }

  const handleItemClick = (item) => {
    if (item.isProfileScroll) {
      onNavigate('dashboard');
      setTimeout(() => {
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }, 100);
    } else {
      onNavigate(item.id);
    }
  };

  const isCurrentActive = (item) => {
    if (item.label === 'Home' && currentView === 'dashboard') return true;
    if (item.label === 'Jobs' && currentView === 'jobs') return true;
    if (item.label === 'Mock Test' && currentView === 'mock-tests') return true;
    if (item.label === 'Resume Checker' && currentView === 'resumes') return true;
    if (item.label === 'Skill Gap' && currentView === 'skill-gaps') return true;
    if (item.label === 'Recruiter Hub' && currentView === 'recruiter') return true;
    if (item.label === 'Admin Portal' && currentView === 'admin') return true;
    return false;
  };

  const isLanding = currentView === 'landing' || !isAuthenticated;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
          >
            <AspireLogo size="md" showTagline={false} />
          </div>

          {/* Center Navigation: ONLY shown when Authenticated on Student Dashboard / App */}
          {!isLanding && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/60">
              {studentNavItems.map((item, idx) => {
                const active = isCurrentActive(item);
                return (
                  <button
                    key={`${item.id}-${item.label}-${idx}`}
                    onClick={() => handleItemClick(item)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap ${
                      active
                        ? 'bg-white text-blue-700 shadow-xs font-bold scale-[1.02]'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            
            {/* Authenticated Controls: Dark Mode + Human Profile Dropdown */}
            {!isLanding ? (
              <>
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200/60"
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
                </button>

                {/* Human Profile Avatar & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-slate-200 hover:border-blue-300 hover:shadow-xs transition bg-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {getInitials(user?.name)}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold text-slate-800">
                      {user?.name?.split(' ')[0] || 'Naveen'}
                    </span>
                  </button>

                  {/* Profile Dropdown Menu matching the design in screenshot */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in text-xs">
                      
                      {/* Top Header Card: Avatar + Name + Registration ID */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 mb-1">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {getInitials(user?.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 truncate text-xs">
                              {user?.name || 'Naveen K'}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono truncate">
                              {studentRollId}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={handleCopyId}
                          title="Copy ID"
                          className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-blue-600 transition shrink-0"
                        >
                          {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Dropdown Action Links */}
                      <div className="py-1 space-y-0.5">
                        
                        {/* Settings */}
                        <button
                          onClick={() => {
                            onNavigate('dashboard');
                            setProfileDropdownOpen(false);
                            setTimeout(() => {
                              window.scrollTo({ top: 350, behavior: 'smooth' });
                            }, 100);
                          }}
                          className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 font-medium transition"
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          <span>Settings</span>
                        </button>

                        {/* Install */}
                        <button
                          onClick={handleInstallApp}
                          className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 font-medium transition"
                        >
                          <Download className="w-4 h-4 text-slate-500" />
                          <span>Install</span>
                        </button>

                        {/* Get latest update */}
                        <button
                          onClick={handleRefreshData}
                          disabled={isRefreshing}
                          className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2.5 font-medium transition"
                        >
                          <RefreshCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
                          <span>Get latest update</span>
                        </button>

                      </div>

                      {/* Log out */}
                      <div className="pt-1 mt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                            onNavigate('landing');
                          }}
                          className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 font-bold transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log out</span>
                        </button>
                      </div>

                    </div>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl text-slate-600 md:hidden hover:bg-slate-100"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              /* Public / Landing Page Right Side: ONLY Sign In and Register buttons */
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition hover:shadow-lg"
                >
                  Register
                </button>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Mobile Drawer (Only when Authenticated) */}
      {mobileMenuOpen && !isLanding && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg animate-fade-in text-xs">
          {studentNavItems.map((item, idx) => (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => {
                handleItemClick(item);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl font-medium ${
                isCurrentActive(item) 
                  ? 'bg-blue-50 font-bold text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => { 
                logout(); 
                setMobileMenuOpen(false); 
                onNavigate('landing'); 
              }}
              className="w-full text-left px-3 py-2.5 text-rose-600 font-bold hover:bg-rose-50 rounded-xl flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
