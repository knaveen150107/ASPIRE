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
  LayoutDashboard,
  ShieldCheck,
  Building2,
  Users,
  Bot,
  Brain,
  SlidersHorizontal,
  BarChart3,
  Globe,
  Terminal,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import AspireLogo from './AspireLogo';

export const Navbar = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, role, isAuthenticated, logout, refreshUser } = useAuth();
  const toast = useToast();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
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
    if (!name) return 'SA';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const studentRollId = user?.register_number || 'CB.SC.U4AIE24235';

  const handleCopyId = () => {
    const textToCopy = role === 'admin' ? 'ADM-SUPER-01' : studentRollId;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(true);
    if (toast?.success) toast.success(`${role === 'admin' ? 'Admin ID' : 'Registration ID'} copied`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    if (refreshUser) await refreshUser();
    if (toast?.success) toast.success('Telemetry synced with server');
    setTimeout(() => {
      setIsRefreshing(false);
      setProfileDropdownOpen(false);
    }, 600);
  };

  // 1. Dedicated Admin Navigation Bar
  const adminNavItems = [
    { id: 'admin:overview', label: 'Overview', icon: BarChart3 },
    { id: 'admin:students', label: 'Students', icon: Users },
    { id: 'admin:recruiters', label: 'Recruiters', icon: Building2 },
    { id: 'admin:jobs', label: 'Job Catalog', icon: Briefcase },
    { id: 'admin:ai-agent', label: 'AI Agent', icon: Bot },
    { id: 'admin:rag-resume', label: 'RAG Engine', icon: Brain },
    { id: 'admin:eligibility', label: 'Rules', icon: SlidersHorizontal },
    { id: 'admin:security', label: 'Audit Trail', icon: ShieldCheck },
    { id: 'admin:settings', label: 'Settings', icon: Settings },
  ];

  // 2. Dedicated Recruiter Navigation Bar
  const recruiterNavItems = [
    { id: 'recruiter', label: 'Recruiter Hub', icon: Building2 },
    { id: 'jobs', label: 'Job Openings', icon: Briefcase },
  ];

  // 3. Dedicated Student Navigation Bar
  const studentNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'profile', label: 'Profile', icon: GraduationCap },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'mock-tests', label: 'Mock Test', icon: Target },
    { id: 'resumes', label: 'Resume Checker', icon: FileText },
    { id: 'skill-gaps', label: 'Skill Gap', icon: Sparkles },
  ];

  // Pick active navigation items based on authentic role
  const currentNavItems = role === 'admin' 
    ? adminNavItems 
    : role === 'recruiter' 
      ? recruiterNavItems 
      : studentNavItems;

  const isCurrentActive = (item) => {
    if (role === 'admin') {
      if (item.id === 'admin:overview' && (currentView === 'admin' || currentView === 'admin:overview')) return true;
      return currentView === item.id;
    }
    return currentView === item.id;
  };

  const isLanding = currentView === 'landing' || !isAuthenticated;

  // Header Logo click destination based on role
  const handleLogoClick = () => {
    if (!isAuthenticated) {
      onNavigate('landing');
    } else if (role === 'admin') {
      onNavigate('admin:overview');
    } else if (role === 'recruiter') {
      onNavigate('recruiter');
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0 mr-4 sm:mr-6">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleLogoClick}
            >
              <AspireLogo size="md" showTagline={false} />
            </div>
          </div>

          {/* Center Navigation: Filtered Strictly by Authenticated Role with generous spacing */}
          {!isLanding && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/80 transition-colors ml-4 xl:ml-8">
              {currentNavItems.map((item, idx) => {
                const active = isCurrentActive(item);
                const Icon = item.icon;
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => onNavigate(item.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
                      active
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs font-bold scale-[1.02]'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-4">
            
            {/* Global Dark Mode Toggle (Restored to Original Position) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200/60 dark:border-slate-700/60"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 animate-fade-in" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 animate-fade-in" />
              )}
            </button>
            
            {/* Authenticated Controls: Role-Specific Profile Dropdown */}
            {!isLanding ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-xs transition bg-white dark:bg-slate-800"
                  >
                    <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-xs ${
                      role === 'admin'
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                        : role === 'recruiter'
                          ? 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                          : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                    }`}>
                      {getInitials(user?.name)}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-slate-200">
                      {role === 'admin' ? 'Admin' : (user?.name?.split(' ')[0] || 'User')}
                    </span>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in text-xs">
                      
                      {/* Top Header Card */}
                      <div className="flex items-center justify-between p-2.5 bg-slate-50/80 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-700 mb-1">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-9 h-9 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm ${
                            role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                          }`}>
                            {getInitials(user?.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 dark:text-white truncate text-xs">
                              {user?.name || (role === 'admin' ? 'System Administrator' : 'Naveen K')}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                              {role === 'admin' ? (user?.email || 'admin@aspire.ai') : studentRollId}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={handleCopyId}
                          title="Copy ID"
                          className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition shrink-0"
                        >
                          {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Dropdown Action Links: ADMIN */}
                      {role === 'admin' ? (
                        <div className="py-1 space-y-0.5">
                          <button
                            onClick={() => {
                              onNavigate('admin:overview');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-700 dark:hover:text-purple-300 rounded-xl flex items-center gap-2.5 font-bold transition"
                          >
                            <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span>12-Module Admin Center</span>
                          </button>

                          <button
                            onClick={() => {
                              onNavigate('admin:security');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 font-medium transition"
                          >
                            <ShieldCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span>Security & Audit Stream</span>
                          </button>

                          <button
                            onClick={() => {
                              onNavigate('admin:settings');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 font-medium transition"
                          >
                            <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span>Atlas & System Telemetry</span>
                          </button>
                        </div>
                      ) : role === 'recruiter' ? (
                        /* Dropdown Action Links: RECRUITER */
                        <div className="py-1 space-y-0.5">
                          <button
                            onClick={() => {
                              onNavigate('recruiter');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-xl flex items-center gap-2.5 font-bold transition"
                          >
                            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Recruiter Workspace</span>
                          </button>

                          <button
                            onClick={() => {
                              onNavigate('jobs');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 font-medium transition"
                          >
                            <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span>Manage Job Postings</span>
                          </button>
                        </div>
                      ) : (
                        /* Dropdown Action Links: STUDENT */
                        <div className="py-1 space-y-0.5">
                          <button
                            onClick={() => {
                              onNavigate('profile');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-blue-400 rounded-xl flex items-center gap-2.5 font-bold transition"
                          >
                            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Academic Profile & CGPA</span>
                          </button>

                          <button
                            onClick={() => {
                              onNavigate('profile');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 font-medium transition"
                          >
                            <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span>Account Settings</span>
                          </button>
                        </div>
                      )}

                      {/* Common Sync Button */}
                      <button
                        onClick={handleRefreshData}
                        disabled={isRefreshing}
                        className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2.5 font-medium transition border-t border-slate-100 dark:border-slate-800 mt-1"
                      >
                        <RefreshCw className={`w-4 h-4 text-slate-500 dark:text-slate-400 ${isRefreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`} />
                        <span>Sync with Server</span>
                      </button>

                      {/* Log out */}
                      <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                            onNavigate('landing');
                          }}
                          className="w-full text-left px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center gap-2.5 font-bold transition"
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
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              /* Public / Landing Page Right Side: Sign In and Register */
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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

      {/* Mobile Drawer (Role-Filtered) */}
      {mobileMenuOpen && !isLanding && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 shadow-lg animate-fade-in text-xs">
          {currentNavItems.map((item, idx) => {
            const active = isCurrentActive(item);
            const Icon = item.icon;
            return (
              <button
                key={`${item.id}-${idx}`}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl font-semibold flex items-center gap-2 transition ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
