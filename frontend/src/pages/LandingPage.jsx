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
  BookOpen, 
  Search, 
  Check, 
  HelpCircle, 
  BarChart3, 
  Layers, 
  GraduationCap, 
  SlidersHorizontal, 
  Lightbulb, 
  Compass, 
  Send, 
  Globe 
} from 'lucide-react';
import studentImg from '../assets/student_thinking.jpg';
import AspireLogo from '../components/AspireLogo';
import { 
  GoogleLogo, 
  MicrosoftLogo, 
  AmazonLogo, 
  MetaLogo, 
  AppleLogo, 
  NetflixLogo 
} from '../components/CompanyLogos';

export const LandingPage = ({ onNavigate, onOpenAuth }) => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput) {
      setSubscribed(true);
    }
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased transition-colors">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-16 pb-20 overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-slate-50/50 dark:from-blue-950/30 dark:via-[#090d16] dark:to-[#090d16] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                Your Career.<br />
                Your Potential.<br />
                Your <span className="text-blue-600 dark:text-blue-400">Next Move.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-normal">
                ASPIRE helps you discover the right opportunities, prepare for company-specific assessments, identify skill gaps, and build a placement-ready profile with the power of AI.
              </p>

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('jobs')}
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all active:scale-95 flex items-center gap-2"
                >
                  <span>Build My Career Path</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('features-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
                >
                  Explore Features
                </button>
              </div>

              {/* 3 Value Pillars under Hero */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-2.5 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                    Discover Diverse Opportunities
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-2.5 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                    Practice & Improve
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-2.5 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                    Build Job-Ready Resume
                  </span>
                </div>
              </div>
            </div>

            {/* Right Dashboard Mockup Column */}
            <div className="lg:col-span-6 relative pt-6 sm:pt-8">
              {/* Handwritten note at top right */}
              <div className="absolute -top-3 right-4 hidden sm:flex items-center gap-2 transform rotate-2 z-10 pointer-events-none">
                <span className="font-['Caveat'] text-2xl font-bold text-slate-600 dark:text-slate-400 tracking-wide">
                  From Learning To Earning
                </span>
                <svg className="w-8 h-8 text-blue-500 transform -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>

              {/* Floating 3D/Animated Mockup Card */}
              <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden animate-welcome-card animate-glow-card transition-all duration-300 hover:shadow-blue-500/20">
                {/* Top Floating AI Pill */}
                <div className="absolute top-3 right-4 z-10 px-2.5 py-0.5 rounded-full bg-blue-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Live AI Engine
                </div>

                {/* Browser Header Bar */}
                <div className="px-4 py-2.5 bg-slate-100/80 dark:bg-slate-800/90 border-b border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="px-6 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    aspire.ai/student/dashboard
                  </div>
                  <div className="w-8"></div>
                </div>

                {/* Dashboard Inner UI */}
                <div className="p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/60 transition-colors">
                  {/* Greeting & Top Stats */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        Welcome back, Alex 👋
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Keep going! You're <span className="text-blue-600 dark:text-blue-400 font-bold">85% ready</span> for your target roles.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-md shadow-blue-600/30">
                      A
                    </div>
                  </div>

                  {/* 4 Top Metric Cards */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100/80 dark:border-blue-900/50 text-left hover:scale-105 transition-transform">
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">Matching Jobs</span>
                      <span className="text-lg font-bold text-blue-700 dark:text-blue-300">32</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100/80 dark:border-purple-900/50 text-left hover:scale-105 transition-transform">
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">Mock Tests</span>
                      <span className="text-lg font-bold text-purple-700 dark:text-purple-300">12</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100/80 dark:border-amber-900/50 text-left hover:scale-105 transition-transform">
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">Avg. Score</span>
                      <span className="text-lg font-bold text-amber-600 dark:text-amber-400">78%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100/80 dark:border-emerald-900/50 text-left hover:scale-105 transition-transform">
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">Resume Readiness</span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">85%</span>
                    </div>
                  </div>

                  {/* Skill Progress Graph Card */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Your Skill Progress
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
                        +28% this month ⚡
                      </span>
                    </div>
                    {/* SVG Chart */}
                    <div className="h-16 w-full">
                      <svg className="w-full h-full" viewBox="0 0 300 70" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,50 Q40,45 80,35 T160,28 T240,15 T300,8 L300,70 L0,70 Z" fill="url(#chartGrad)" />
                        <path d="M0,50 Q40,45 80,35 T160,28 T240,15 T300,8" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                        <circle cx="80" cy="35" r="3" fill="#2563eb" />
                        <circle cx="160" cy="28" r="3" fill="#2563eb" />
                        <circle cx="240" cy="15" r="3" fill="#2563eb" />
                        <circle cx="300" cy="8" r="4.5" fill="#2563eb" className="animate-pulse" />
                      </svg>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-medium px-1">
                      <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                    </div>
                  </div>

                  {/* Recommended for You List */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Recommended for You</span>
                    
                    {/* Job Item 1: Google */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0">
                          <GoogleLogo className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Google • SWE Intern</h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">₹1.2L - ₹2.5L/mo</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          95% Match
                        </span>
                        <button
                          onClick={() => onNavigate('jobs')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition shadow-xs"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>

                    {/* Job Item 2: Microsoft */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0">
                          <MicrosoftLogo className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Microsoft • SDE I</h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">₹18 - ₹25 LPA</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          91% Match
                        </span>
                        <button
                          onClick={() => onNavigate('jobs')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition shadow-xs"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>

                    {/* Job Item 3: Amazon */}
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0">
                          <AmazonLogo className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">Amazon • Software Dev Engineer</h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">₹16 - ₹22 LPA</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          88% Match
                        </span>
                        <button
                          onClick={() => onNavigate('jobs')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition shadow-xs"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. COMPANY LOGO / TRUST BAR WITH REAL VECTOR LOGOS */}
      <section className="py-12 bg-white dark:bg-slate-900/90 border-y border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Prepare for opportunities at top global technology companies
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16">
            
            {/* Google */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 cursor-default group">
              <GoogleLogo className="h-6 w-6" />
              <span className="text-base font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white tracking-tight">Google</span>
            </div>

            {/* Microsoft */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 cursor-default group">
              <MicrosoftLogo className="h-5 w-5" />
              <span className="text-base font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white tracking-tight">Microsoft</span>
            </div>

            {/* Amazon */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 cursor-default group">
              <AmazonLogo className="h-6 w-6" />
              <span className="text-lg font-black text-slate-800 dark:text-slate-200 tracking-tight lowercase">amazon</span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 cursor-default group">
              <MetaLogo className="h-5 w-5" />
              <span className="text-base font-bold text-blue-600 dark:text-blue-400 tracking-tight">Meta</span>
            </div>

            {/* Apple */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 cursor-default group">
              <AppleLogo className="h-5 w-5" />
              <span className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight">Apple</span>
            </div>

            {/* Netflix */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all hover:scale-105 cursor-default group">
              <NetflixLogo className="h-5 w-5" />
              <span className="text-base font-black text-red-600 tracking-wider">NETFLIX</span>
            </div>

          </div>
        </div>
      </section>

      {/* 3. THE PROBLEM SECTION */}
      <section className="py-20 bg-slate-50/60 dark:bg-[#090d16] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Problem Text & Question Cards */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider">
                THE PROBLEM
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Many talented students <span className="text-blue-600 dark:text-blue-400">miss opportunities.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Placement portals often focus only on eligibility criteria. Students who don't meet a specific cutoff are left without guidance on what to do next, which skills to improve, or which other opportunities to explore.
              </p>

              {/* 5 Thought Questions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <div className="card-3d p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Which companies can I apply for?
                  </span>
                </div>

                <div className="card-3d p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    What skills do I need to improve?
                  </span>
                </div>

                <div className="card-3d p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    How do I prepare for their tests?
                  </span>
                </div>

                <div className="card-3d p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    How can I make my resume better?
                  </span>
                </div>

                <div className="card-3d p-3.5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3 sm:col-span-2 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    What are my real career options?
                  </span>
                </div>
              </div>
            </div>

            {/* Right Student Photography with Doodled Thoughts */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 max-w-md transition-colors">
                <img
                  src={studentImg}
                  alt="Student contemplating career path"
                  className="w-full h-auto object-cover rounded-2xl"
                />

                {/* Hand-Drawn Thought Callouts */}
                <div className="absolute top-6 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 transform -rotate-6 transition-colors">
                  <span className="font-['Caveat'] text-base font-bold text-slate-800 dark:text-slate-200">
                    Am I eligible? 🤔
                  </span>
                </div>

                <div className="absolute top-10 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 transform rotate-6 transition-colors">
                  <span className="font-['Caveat'] text-base font-bold text-blue-700 dark:text-blue-400">
                    Which skills? 💡
                  </span>
                </div>

                <div className="absolute bottom-12 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 transform rotate-3 transition-colors">
                  <span className="font-['Caveat'] text-base font-bold text-purple-700 dark:text-purple-400">
                    How do I prepare? 📝
                  </span>
                </div>

                <div className="absolute bottom-8 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 transform -rotate-3 transition-colors">
                  <span className="font-['Caveat'] text-base font-bold text-emerald-700 dark:text-emerald-400">
                    What next? 🚀
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. HOW ASPIRE WORKS SECTION */}
      <section className="py-20 bg-white dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider">
              HOW ASPIRE WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              A Complete Placement <span className="text-blue-600 dark:text-blue-400">Preparation Journey</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Everything you need, in one platform — powered by AI and built for students.
            </p>
          </div>

          {/* 5-Step Horizontal Flow with 3D Hover */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            
            {/* Step 1 */}
            <div className="card-3d p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-xs flex flex-col items-center text-center space-y-3 relative group transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-110">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">1. Build Your Profile</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Add your academic details, skills, projects and career preferences.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-3d p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-xs flex flex-col items-center text-center space-y-3 relative group transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-110">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">2. Discover Opportunities</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Find relevant jobs based on eligibility, skills and your interests.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-3d p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-xs flex flex-col items-center text-center space-y-3 relative group transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-110">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">3. Prepare & Practice</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Take company-specific mock tests and track your performance.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card-3d p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-xs flex flex-col items-center text-center space-y-3 relative group transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-110">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">4. Improve with Insights</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Get skill-gap reports and personalized learning roadmaps.
              </p>
            </div>

            {/* Step 5 */}
            <div className="card-3d p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-xs flex flex-col items-center text-center space-y-3 relative group transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-110">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">5. Get Placement Ready</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Create tailored resumes and track your applications.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. KEY FEATURES SECTION */}
      <section id="features-section" className="py-20 bg-slate-50/60 dark:bg-[#090d16] border-t border-slate-200/70 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider">
              KEY FEATURES
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Everything You Need to <span className="text-blue-600 dark:text-blue-400">Aspire Higher</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Powerful tools to help you prepare, improve and achieve your career goals.
            </p>
          </div>

          {/* 6 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            
            {/* Feature 1 */}
            <div 
              onClick={() => onNavigate('jobs')}
              className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xs cursor-pointer space-y-4 group relative overflow-hidden transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white shadow-xs">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Intelligent Job Discovery
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Find jobs and internships based on your eligibility, skills, location and salary expectations with AI matching.
              </p>
              <div className="pt-1 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                <span>Explore Jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div 
              onClick={() => onNavigate('mock-tests')}
              className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xs cursor-pointer space-y-4 group relative overflow-hidden transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Company-Specific Mock Tests
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Practise with AI-generated tests tailored to real company patterns and role requirements.
              </p>
              <div className="pt-1 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                <span>Start Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div 
              onClick={() => onNavigate('skill-gaps')}
              className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xs cursor-pointer space-y-4 group relative overflow-hidden transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white shadow-xs">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Skill Gap Analysis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Understand your strengths and weaknesses with detailed performance reports and improvement suggestions.
              </p>
              <div className="pt-1 flex items-center text-xs font-bold text-amber-600 dark:text-amber-400 gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                <span>Analyze Gaps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4 */}
            <div 
              onClick={() => onNavigate('resumes')}
              className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xs cursor-pointer space-y-4 group relative overflow-hidden transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                AI-Assisted Resume Builder
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Create professional, job-specific resumes that highlight your relevant skills, projects and achievements.
              </p>
              <div className="pt-1 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                <span>Build Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 5 */}
            <div 
              onClick={() => onNavigate('roadmaps')}
              className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xs cursor-pointer space-y-4 group relative overflow-hidden transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Personalized Career Roadmap
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Get a structured learning plan with curated resources to bridge your skill gaps.
              </p>
              <div className="pt-1 flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                <span>View Roadmaps</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 6 */}
            <div 
              onClick={() => onNavigate('jobs')}
              className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-xs cursor-pointer space-y-4 group relative overflow-hidden transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-cyan-600 group-hover:text-white shadow-xs">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                Application Tracking
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Manage your applications, track progress and stay updated on deadlines and opportunities.
              </p>
              <div className="pt-1 flex items-center text-xs font-bold text-cyan-600 dark:text-cyan-400 gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                <span>Track Status</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. WHY ASPIRE? / MORE THAN A JOB PORTAL */}
      <section className="py-20 bg-white dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-[11px] font-bold uppercase tracking-wider">
              WHY ASPIRE?
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              More Than a Job Portal
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              We empower every student with clarity, preparation and real opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Card 1 */}
            <div className="card-3d p-7 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3 group transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Guidance for Every Student
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Even if you're not eligible for a particular drive, we help you find alternative opportunities and a clear path forward.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card-3d p-7 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3 group transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Actionable Insights
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Get practical feedback, not just scores. Understand what to improve and how to do it.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card-3d p-7 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 shadow-xs space-y-3 group transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Student-Centered Approach
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Designed to help you make informed decisions and continuously improve at your own pace.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA BANNER (DEEP BLUE GRADIENT) */}
      <section className="py-16 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 text-white relative overflow-hidden">
        {/* Background glow & curved doodle arrow */}
        <div className="absolute right-12 bottom-6 opacity-30 pointer-events-none hidden sm:block">
          <svg className="w-28 h-28 text-blue-400" viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <path d="M10,80 Q50,10 90,40" strokeWidth="2.5" strokeDasharray="4 4" />
            <path d="M80,30 L90,40 L78,48" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            Your Goals. Our Intelligence.
          </p>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Start Your Placement Preparation Today
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Join ASPIRE and take the next step towards a successful career.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onOpenAuth('register')}
              className="px-7 py-3.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm shadow-xl transition-all active:scale-95 flex items-center gap-2"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('features-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-7 py-3.5 rounded-full bg-transparent hover:bg-white/10 text-white font-semibold text-sm border border-white/25 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-white dark:bg-[#060911] border-t border-slate-200 dark:border-slate-800/80 py-12 text-slate-600 dark:text-slate-400 text-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-200 dark:border-slate-800">
            
            {/* Logo & Description */}
            <div className="md:col-span-4 space-y-3">
              <div 
                className="cursor-pointer inline-block"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <AspireLogo size="md" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
                An AI-powered placement and career intelligence platform to help students discover, prepare and achieve their career goals.
              </p>
            </div>

            {/* Col 1: Quick Links */}
            <div className="md:col-span-2 space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">Quick Links</h4>
              <ul className="space-y-2">
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-blue-600 dark:hover:text-blue-400 transition">Home</button></li>
                <li><button onClick={() => { const el = document.getElementById('features-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} className="hover:text-blue-600 dark:hover:text-blue-400 transition">Features</button></li>
                <li><button onClick={() => onNavigate('jobs')} className="hover:text-blue-600 dark:hover:text-blue-400 transition">How It Works</button></li>
                <li><button onClick={() => onNavigate('dashboard')} className="hover:text-blue-600 dark:hover:text-blue-400 transition">For Students</button></li>
                <li><button onClick={() => onNavigate('jobs')} className="hover:text-blue-600 dark:hover:text-blue-400 transition">About</button></li>
              </ul>
            </div>

            {/* Col 2: Resources */}
            <div className="md:col-span-2 space-y-2.5">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Help Center</a></li>
                <li><a href="/docs" target="_blank" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Contact Us</a></li>
              </ul>
            </div>

            {/* Col 3: Stay Updated */}
            <div className="md:col-span-4 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">Stay Updated</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Subscribe to get the latest updates and new opportunities.
              </p>

              {subscribed ? (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Thanks for subscribing to ASPIRE updates!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email your email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition"
                    required
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

              <div className="flex items-center space-x-3 pt-2 text-slate-400 dark:text-slate-500">
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition" title="LinkedIn">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                </a>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition" title="GitHub">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
                </a>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition" title="Globe">
                  <Globe className="w-4 h-4" />
                </a>
                <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition" title="X / Twitter">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              </div>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 dark:text-slate-500 text-[11px] gap-2">
            <p>© {new Date().getFullYear()} ASPIRE. All rights reserved.</p>
            <p>Built for students. Powered by possibilities.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
