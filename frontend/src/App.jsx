import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';

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
  const { user, loading } = useAuth();
  const toast = useToast();
  const [currentView, setCurrentView] = useState('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalInitialTab, setAuthModalInitialTab] = useState('login');

  const openAuthModal = (tab = 'login') => {
    setAuthModalInitialTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleNavigate = (view) => {
    // Role protection
    if (view === 'admin' && user?.role !== 'admin') {
      toast.error('Admin privileges required. Please log in as Admin.');
      openAuthModal('login');
      return;
    }

    if (view === 'recruiter' && user?.role !== 'recruiter' && user?.role !== 'admin') {
      toast.error('Recruiter credentials required. Please log in as a Recruiter.');
      openAuthModal('login');
      return;
    }

    if (['dashboard', 'mock-tests', 'skill-gaps', 'roadmaps', 'resumes'].includes(view) && !user) {
      toast.info('Please log in to access your student portal and telemetry.');
      openAuthModal('login');
      return;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Redirect to appropriate dashboard after login if on landing page
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Header */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={openAuthModal}
      />

      {/* Main Page Container */}
      <main className="flex-1 relative z-10">
        {currentView === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onOpenAuth={openAuthModal}
          />
        )}

        {currentView === 'admin' && (
          <AdminPage onNavigate={handleNavigate} />
        )}

        {currentView === 'dashboard' && (
          <StudentDashboard onNavigate={handleNavigate} />
        )}

        {currentView === 'jobs' && (
          <JobsPage onNavigate={handleNavigate} />
        )}

        {currentView === 'mock-tests' && (
          <MockTestsPage onNavigate={handleNavigate} />
        )}

        {currentView === 'skill-gaps' && (
          <SkillGapsPage onNavigate={handleNavigate} />
        )}

        {currentView === 'roadmaps' && (
          <RoadmapsPage onNavigate={handleNavigate} />
        )}

        {currentView === 'resumes' && (
          <ResumesPage onNavigate={handleNavigate} />
        )}

        {currentView === 'recruiter' && (
          <RecruiterDashboard onNavigate={handleNavigate} />
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

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
