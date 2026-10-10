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

function MainApp() {
  const { user, isAuthenticated, role, loading } = useAuth();
  const toast = useToast();
  const [currentView, setCurrentView] = useState('landing');
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

  // Redirect to appropriate dashboard after initial login from landing page
  useEffect(() => {
    if (user && currentView === 'landing') {
      if (user.role === 'admin') {
        setCurrentView('admin');
      } else if (user.role === 'recruiter') {
        setCurrentView('recruiter');
      } else {
        setCurrentView('dashboard');
      }
    }
  }, [user]);

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

    // 4. Student Protected Tools (Protected: Authentication Required)
    if (['dashboard', 'mock-tests', 'skill-gaps', 'roadmaps', 'resumes'].includes(currentView)) {
      if (!isAuthenticated) {
        return <ProtectedView requiredRole="authenticated" onOpenAuth={openAuthModal} onNavigate={handleNavigate} />;
      }

      switch (currentView) {
        case 'dashboard':
          return <StudentDashboard onNavigate={handleNavigate} />;
        case 'mock-tests':
          return <MockTestsPage onNavigate={handleNavigate} />;
        case 'skill-gaps':
          return <SkillGapsPage onNavigate={handleNavigate} />;
        case 'roadmaps':
          return <RoadmapsPage onNavigate={handleNavigate} />;
        case 'resumes':
          return <ResumesPage onNavigate={handleNavigate} />;
        default:
          return <StudentDashboard onNavigate={handleNavigate} />;
      }
    }

    // 5. Job Discovery Board (Public / Accessible to all, with login prompts on apply)
    if (currentView === 'jobs') {
      return <JobsPage onNavigate={handleNavigate} onOpenAuth={openAuthModal} />;
    }

    return (
      <LandingPage
        onNavigate={handleNavigate}
        onOpenAuth={openAuthModal}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white antialiased">
      {/* Navigation Header */}
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
