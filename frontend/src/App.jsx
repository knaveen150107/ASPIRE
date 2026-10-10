import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ProtectedView from './components/ProtectedView';
import { AiCopilotWidget } from './components/AiCopilotWidget';

// Pages
import LandingPage from './pages/LandingPage';
import AdminPage from './pages/AdminPage';
import StudentDashboard from './pages/StudentDashboard';
import JobsPage from './pages/JobsPage';
import MockTestsPage from './pages/MockTestsPage';
import SkillGapsPage from './pages/SkillGapsPage';
import RoadmapsPage from './pages/RoadmapsPage';
import ResumesPage from './pages/ResumesPage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import StudentProfilePage from './pages/StudentProfilePage';

function MainApp() {
  const { user, isAuthenticated, role, loading } = useAuth();
  const toast = useToast();
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('aspire_token') ? 'dashboard' : 'landing';
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState('login');

  const openAuthModal = (tab = 'login') => {
    setAuthModalInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Redirect to role home page after login or on reload
  useEffect(() => {
    if (user) {
      if (currentView === 'landing' || (user.role === 'admin' && currentView === 'dashboard') || (user.role === 'recruiter' && currentView === 'dashboard')) {
        if (user.role === 'admin') {
          setCurrentView('admin:overview');
        } else if (user.role === 'recruiter') {
          setCurrentView('recruiter');
        } else {
          setCurrentView('dashboard');
        }
      }
    } else if (!loading && !localStorage.getItem('aspire_token')) {
      if (currentView !== 'landing' && currentView !== 'jobs') {
        setCurrentView('landing');
      }
    }
  }, [user, loading]);

  // View Access Guard Renderer
  const renderCurrentView = () => {
    // 1. Public Landing Page
    if (currentView === 'landing') {
      return (
        <LandingPage
          onNavigate={handleNavigate}
          onOpenAuth={openAuthModal}
        />
      );
    }

    // 2. Admin Portal & Sub-Modules (Protected: Admin Only)
    if (currentView.startsWith('admin')) {
      if (!isAuthenticated) {
        return <ProtectedView requiredRole="authenticated" onOpenAuth={openAuthModal} onNavigate={handleNavigate} />;
      }
      if (role !== 'admin') {
        return <ProtectedView requiredRole="admin" onOpenAuth={openAuthModal} onNavigate={handleNavigate} />;
      }
      const initialTab = currentView.includes(':') ? currentView.split(':')[1] : 'overview';
      return <AdminPage initialTab={initialTab} onNavigate={handleNavigate} />;
    }

    // 3. Recruiter Hub (Protected: Recruiter or Admin)
    if (currentView === 'recruiter') {
      if (!isAuthenticated) {
        return <ProtectedView requiredRole="authenticated" onOpenAuth={openAuthModal} onNavigate={handleNavigate} />;
      }
      if (role !== 'recruiter' && role !== 'admin') {
        return <ProtectedView requiredRole="recruiter" onOpenAuth={openAuthModal} onNavigate={handleNavigate} />;
      }
      return <RecruiterDashboard onNavigate={handleNavigate} />;
    }

    // 4. Student Dashboard / Home View (Role-guarded)
    if (currentView === 'dashboard') {
      if (role === 'admin') {
        return <AdminPage initialTab="overview" onNavigate={handleNavigate} />;
      }
      if (role === 'recruiter') {
        return <RecruiterDashboard onNavigate={handleNavigate} />;
      }
      return (
        <StudentDashboard
          onNavigate={handleNavigate}
          onOpenAuth={openAuthModal}
        />
      );
    }

    // 5. Student Protected Tools (Profile, Mock Tests, Skill Gaps, Roadmaps, Resumes)
    if (['profile', 'mock-tests', 'skill-gaps', 'roadmaps', 'resumes'].includes(currentView)) {
      if (!isAuthenticated) {
        return <ProtectedView requiredRole="authenticated" onOpenAuth={openAuthModal} onNavigate={handleNavigate} />;
      }

      switch (currentView) {
        case 'profile':
          return <StudentProfilePage onNavigate={handleNavigate} />;
        case 'mock-tests':
          return <MockTestsPage onNavigate={handleNavigate} />;
        case 'skill-gaps':
          return <SkillGapsPage onNavigate={handleNavigate} />;
        case 'roadmaps':
          return <RoadmapsPage onNavigate={handleNavigate} />;
        case 'resumes':
          return <ResumesPage onNavigate={handleNavigate} />;
        default:
          return <StudentDashboard onNavigate={handleNavigate} onOpenAuth={openAuthModal} />;
      }
    }

    // 6. Job Discovery Board (Public / Accessible to all)
    if (currentView === 'jobs') {
      return <JobsPage onNavigate={handleNavigate} onOpenAuth={openAuthModal} />;
    }

    return (
      <StudentDashboard
        onNavigate={handleNavigate}
        onOpenAuth={openAuthModal}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white antialiased transition-colors duration-200">
      {/* Global Top Navigation Header (Always Visible) */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={openAuthModal}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {renderCurrentView()}
      </main>

      {/* Interactive AI Career Copilot Widget */}
      <AiCopilotWidget onNavigate={handleNavigate} />

      {/* Global Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          initialTab={authModalInitialTab}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(loggedInUser) => {
            if (loggedInUser.role === 'admin') {
              setCurrentView('admin:overview');
            } else if (loggedInUser.role === 'recruiter') {
              setCurrentView('recruiter');
            } else {
              setCurrentView('dashboard');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
