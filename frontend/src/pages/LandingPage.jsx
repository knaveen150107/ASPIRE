import React, { useState } from 'react';
import { 
  Sparkles, 
  Briefcase, 
  Target, 
  Activity, 
  Map, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Award,
  Zap,
  Building2,
  ChevronRight,
  Clock,
  Star,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const LandingPage = ({ setCurrentView, onNavigate, openAuthModal, onOpenAuth }) => {
  const navigate = onNavigate || setCurrentView;
  const triggerAuth = onOpenAuth || openAuthModal;
  // Demo interactive eligibility state
  const [demoCgpa, setDemoCgpa] = useState(8.2);
  const [demoDept, setDemoDept] = useState('Computer Science');
  const [demoTargetCompany, setDemoTargetCompany] = useState('CloudNova');

  // Mini quiz demo state
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const companiesList = [
    { name: 'CloudNova Tech', minCgpa: 7.5, depts: ['Computer Science', 'Information Technology'], package: '₹14.5 LPA' },
    { name: 'Apex Systems', minCgpa: 8.0, depts: ['Computer Science', 'Electronics'], package: '₹18.0 LPA' },
    { name: 'FinTech Global', minCgpa: 7.0, depts: ['Computer Science', 'Information Technology', 'Electrical'], package: '₹11.2 LPA' },
  ];

  const selectedComp = companiesList.find(c => c.name.startsWith(demoTargetCompany)) || companiesList[0];
  const isDemoEligible = demoCgpa >= selectedComp.minCgpa && selectedComp.depts.includes(demoDept);

  const handleQuizSubmit = (opt) => {
    setQuizAnswer(opt);
    setQuizSubmitted(true);
    if (opt === 'B') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 }
      });
    }
  };

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-600/20 via-indigo-500/20 to-purple-500/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
        <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Top Floating Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold shadow-lg shadow-blue-500/10 animate-float">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Placement & Career Intelligence Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Discover Opportunities. <br className="hidden sm:inline" />
              <span className="gradient-text">Identify Skill Gaps.</span> <br />
              Aspire Higher.
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Transform placement preparation from fragmented uncertainty into a continuous, data-driven journey. 
              Evaluate academic eligibility, practice company-specific AI mock tests, and build tailored career roadmaps.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('jobs')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <Briefcase className="w-4 h-4" />
              <span>Explore Opportunities</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('mock-tests')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 font-bold text-sm flex items-center justify-center space-x-2 transition-all"
            >
              <Target className="w-4 h-4 text-blue-400" />
              <span>Practice AI Mock Test</span>
            </button>
          </div>

          {/* Live Placement Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-5 rounded-2xl glass-panel text-center space-y-1">
              <p className="text-3xl font-extrabold text-white tracking-tight">94.2%</p>
              <p className="text-xs text-slate-400 font-medium">Placement Success Rate</p>
            </div>
            <div className="p-5 rounded-2xl glass-panel text-center space-y-1">
              <p className="text-3xl font-extrabold text-blue-400 tracking-tight">500+</p>
              <p className="text-xs text-slate-400 font-medium">Hiring Organizations</p>
            </div>
            <div className="p-5 rounded-2xl glass-panel text-center space-y-1">
              <p className="text-3xl font-extrabold text-purple-400 tracking-tight">₹18.5 LPA</p>
              <p className="text-xs text-slate-400 font-medium">Highest Offered Package</p>
            </div>
            <div className="p-5 rounded-2xl glass-panel text-center space-y-1">
              <p className="text-3xl font-extrabold text-emerald-400 tracking-tight">15,000+</p>
              <p className="text-xs text-slate-400 font-medium">AI Assessments Taken</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. INTERACTIVE ELIGIBILITY AUDIT DEMO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-blue-500/20 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Description */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Deterministic Criteria Engine</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Try the Academic Eligibility Calculator
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Campus placement filters can be strict. ASPIRE never guesses—our engine audits CGPA, degree, department, and graduation year so you know your exact qualification status before applying.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Separates academic criteria from AI skill-matching algorithms</span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Explains exactly why a student qualifies or misses cutoff requirements</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Card */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-950 border border-white/10 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Interactive Test Widget</span>
                <span className="text-xs text-blue-400 font-semibold">{selectedComp.package}</span>
              </div>

              {/* Company Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Opportunity</label>
                <div className="grid grid-cols-3 gap-2">
                  {companiesList.map(comp => (
                    <button
                      key={comp.name}
                      onClick={() => setDemoTargetCompany(comp.name.split(' ')[0])}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        selectedComp.name === comp.name
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/15'
                      }`}
                    >
                      {comp.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* CGPA Slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Your CGPA</span>
                  <span className="text-blue-400 font-bold">{demoCgpa.toFixed(1)} / 10.0</span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="10.0"
                  step="0.1"
                  value={demoCgpa}
                  onChange={(e) => setDemoCgpa(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Your Department</label>
                <select
                  value={demoDept}
                  onChange={(e) => setDemoDept(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Computer Science">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics & Communication</option>
                  <option value="Mechanical">Mechanical Engineering</option>
                </select>
              </div>

              {/* Live Outcome Banner */}
              <div className={`p-4 rounded-xl border flex items-center space-x-3 ${
                isDemoEligible
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}>
                {isDemoEligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Activity className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold">
                    {isDemoEligible ? 'Eligible for Direct Placement Drive!' : 'Cutoff Not Satisfied'}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {isDemoEligible
                      ? `Meets ${selectedComp.minCgpa} CGPA minimum & department criteria.`
                      : `Requires ${selectedComp.minCgpa} CGPA & eligible department.`}
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. SIX CORE PLATFORM PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Six Intelligent Pillars of Career Readiness
          </h2>
          <p className="text-sm text-slate-400">
            From opportunity discovery to customized interview prep, ASPIRE replaces disconnected tools with one intelligent workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div 
            onClick={() => navigate('jobs')}
            className="p-6 rounded-2xl glass-panel-hover cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">1. Job Discovery & Academic Audits</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore opportunities from verified campus recruiters and corporate portals. Strict eligibility validation explains why you match or what criteria is missing.
            </p>
            <div className="flex items-center space-x-1 text-xs font-semibold text-blue-400 pt-2">
              <span>Explore listings</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => navigate('mock-tests')}
            className="p-6 rounded-2xl glass-panel-hover cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">2. AI Role-Specific Mock Tests</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Practice assessments customized for target roles. Test algorithmic logic, SQL queries, system design, and aptitude with instant automated scoring.
            </p>
            <div className="flex items-center space-x-1 text-xs font-semibold text-purple-400 pt-2">
              <span>Start practice session</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => navigate('skill-gaps')}
            className="p-6 rounded-2xl glass-panel-hover cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">3. Skill-Gap Radar Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Turn assessment results into actionable insights. Pinpoint weak technical topics and receive prioritized skill recommendations.
            </p>
            <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 pt-2">
              <span>View gap reports</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => navigate('roadmaps')}
            className="p-6 rounded-2xl glass-panel-hover cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Map className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">4. Career Milestone Roadmaps</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never get stuck wondering what to learn next. Follow sequenced, milestone-based learning curricula with curated learning links.
            </p>
            <div className="flex items-center space-x-1 text-xs font-semibold text-amber-400 pt-2">
              <span>Explore roadmaps</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 5 */}
          <div 
            onClick={() => navigate('resumes')}
            className="p-6 rounded-2xl glass-panel-hover cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-rose-400 transition-colors">5. AI Resume Tailor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Create job-specific resume variants that highlight authentic projects and verified skills without misrepresenting your credentials.
            </p>
            <div className="flex items-center space-x-1 text-xs font-semibold text-rose-400 pt-2">
              <span>Build tailored resume</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 6 */}
          <div 
            onClick={() => navigate('dashboard')}
            className="p-6 rounded-2xl glass-panel-hover cursor-pointer space-y-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">6. Placement Readiness Hub</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unified telemetry tracking upcoming deadlines, mock assessment history, application statuses, and overall placement readiness.
            </p>
            <div className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 pt-2">
              <span>Open dashboard</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

        </div>
      </section>

      {/* 4. LIVE ASSESSMENT MINI-DEMO */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-slate-900 border border-purple-500/30 shadow-2xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-bold text-white">Live Mock Assessment Demo</span>
            </div>
            <span className="text-xs text-slate-400">Question 1 of 1</span>
          </div>

          <div className="space-y-4">
            <p className="text-sm sm:text-base font-semibold text-slate-200">
              Which indexing structure in MongoDB is best suited for accelerating queries filtering array fields like <code>eligible_departments</code>?
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'A', text: 'Text Index' },
                { id: 'B', text: 'Multikey Index (Correct)' },
                { id: 'C', text: 'Geospatial 2dsphere' },
                { id: 'D', text: 'Hashed Index' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleQuizSubmit(opt.id)}
                  disabled={quizSubmitted}
                  className={`p-3.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                    quizSubmitted && opt.id === 'B'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                      : quizSubmitted && quizAnswer === opt.id && opt.id !== 'B'
                      ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                      : 'bg-slate-950 border-white/10 text-slate-300 hover:border-purple-500/50 hover:bg-slate-900'
                  }`}
                >
                  <span className="font-bold mr-2 text-slate-400">{opt.id}.</span>
                  {opt.text}
                </button>
              ))}
            </div>

            {quizSubmitted && (
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 animate-fade-in space-y-1">
                <p className="text-xs font-bold text-emerald-400">
                  {quizAnswer === 'B' ? '✓ Correct Answer!' : 'Explanation:'}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  MongoDB automatically creates a <b>Multikey Index</b> when indexing an array field, enabling high-performance queries across any element in the array.
                </p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 5. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border border-white/10 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready to Accelerate Your Placement Journey?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Join thousands of students discovering opportunities, identifying missing skills, and preparing smarter with ASPIRE.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => triggerAuth('register')}
              className="px-8 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm shadow-xl hover:bg-slate-100 transition-all active:scale-95"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('jobs')}
              className="px-8 py-3.5 rounded-xl bg-slate-900/80 text-white border border-white/15 font-bold text-sm hover:bg-slate-800 transition-all"
            >
              Browse All Jobs
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
