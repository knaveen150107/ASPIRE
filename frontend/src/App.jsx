import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ProtectedView from './components/ProtectedView';

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
import ProfilePage from './pages/ProfilePage';

function MainApp() {
  const { user, isAuthenticated, role, loading } = useAuth();
  const toast = useToast();
  const [currentView, setCurrentView] = useState(() => {
    const path = window.location.pathname.replace(/^\//, '');
    if (['profile', 'jobs', 'mock-tests', 'skill-gaps', 'roadmaps', 'resumes', 'admin', 'recruiter', 'dashboard'].includes(path)) {
      return path;
    }
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
    const newPath = view === 'landing' ? '/' : `/${view}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Browser back/forward navigation support
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      if (path && ['profile', 'jobs', 'mock-tests', 'skill-gaps', 'roadmaps', 'resumes', 'admin', 'recruiter', 'dashboard', 'landing'].includes(path)) {
        setCurrentView(path);
      } else if (!path) {
        setCurrentView(localStorage.getItem('aspire_token') ? 'dashboard' : 'landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Redirect to appropriate role dashboard after initial login
  useEffect(() => {
    if (user) {
      if (currentView === 'landing') {
        if (user.role === 'admin') {
          setCurrentView('admin');
        } else if (user.role === 'recruiter') {
          setCurrentView('recruiter');
        } else {
          setCurrentView('dashboard');
        }
      }
    } else if (!loading && !localStorage.getItem('aspire_token')) {
      if (currentView === 'dashboard') {
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

    // 2. Admin Portal (Protected: Admin Only)
    if (currentView === 'admin') {
      if (!isAuthenticated) {
        return <ProtectedView requiredRole="authenticated" onOpenAuth={openAuthModal} onNavigate={handleNavigate} />;
      }
      if (role !== 'admin') {
        return <ProtectedView requiredRole="admin" onOpenAuth={openAuthModal} onNavigate={handleNavigate} />;
      }
      return <AdminPage onNavigate={handleNavigate} />;
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

    // 4. Student Dashboard / Home View (Always Accessible)
    if (currentView === 'dashboard') {
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
          return <ProfilePage onNavigate={handleNavigate} />;
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white antialiased">
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

      {/* Global Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          initialTab={authModalInitialTab}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(loggedInUser) => {
            if (loggedInUser.role === 'admin') setCurrentView('admin');
            else if (loggedInUser.role === 'recruiter') setCurrentView('recruiter');
            else setCurrentView('dashboard');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
