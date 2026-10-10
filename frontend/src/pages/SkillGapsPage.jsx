import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Sparkles, 
  Layers, 
  Flame, 
  ArrowRight, 
  BookOpen, 
  Check, 
  AlertTriangle, 
  AlertCircle,
  Building2,
  Briefcase,
  TrendingUp,
  MapPin,
  DollarSign,
  Play,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Standard fallback role benchmarks if no jobs loaded
const DEFAULT_COMPANY_DRIVES = [
  {
    id: 'zoho_corp',
    company_name: 'Zoho Corporation',
    title: 'Software Development Engineer',
    location: 'Chennai / Tenkasi',
    salary_range: '₹8.5 - 12.0 LPA',
    required_skills: ['Data Structures & Algorithms', 'C / C++ or Java', 'Object Oriented Programming', 'DBMS & SQL', 'System Design'],
    prep_focus: 'Zoho heavily evaluates core problem solving without built-in library shortcuts (writing custom data structures), clean code modularity, and advanced OOP design patterns.'
  },
  {
    id: 'swiggy_tech',
    company_name: 'Swiggy',
    title: 'SDE-1 (Backend & Microservices)',
    location: 'Bengaluru (Hybrid)',
    salary_range: '₹18.0 - 24.0 LPA',
    required_skills: ['Python / Go', 'FastAPI / Node.js', 'PostgreSQL', 'Redis Caching', 'Docker & Kubernetes', 'System Design'],
    prep_focus: 'Swiggy tests high-throughput distributed systems, Redis caching strategies, asynchronous message queues, database indexing, and REST microservices.'
  },
  {
    id: 'razorpay_fintech',
    company_name: 'Razorpay',
    title: 'Backend Engineer (Fintech Architecture)',
    location: 'Bengaluru',
    salary_range: '₹20.0 - 26.0 LPA',
    required_skills: ['Python / Go', 'PostgreSQL', 'Distributed Systems', 'Kafka', 'Docker', 'API Security'],
    prep_focus: 'Razorpay focuses on ACID transactions, idempotent payment state machines, high-concurrency database locks, and strict API security.'
  },
  {
    id: 'tcs_digital',
    company_name: 'Tata Consultancy Services (TCS)',
    title: 'Digital Innovator / Systems Engineer',
    location: 'Pan India',
    salary_range: '₹7.5 - 9.0 LPA',
    required_skills: ['Python', 'SQL', 'Data Structures & Algorithms', 'Cloud Fundamentals', 'Quantitative Aptitude'],
    prep_focus: 'TCS Digital emphasizes strong quantitative aptitude, basic algorithmic complexity, SQL querying, and fundamental software engineering principles.'
  },
  {
    id: 'freshworks_saas',
    company_name: 'Freshworks',
    title: 'Product Software Engineer',
    location: 'Chennai / Bengaluru',
    salary_range: '₹14.0 - 18.0 LPA',
    required_skills: ['React.js', 'JavaScript / TypeScript', 'Node.js / Python', 'MongoDB', 'REST APIs', 'Unit Testing'],
    prep_focus: 'Freshworks evaluates full-stack product development, responsive React component design, API latency, and automated test coverage.'
  }
];

export default function SkillGapsPage({ onNavigate }) {
  const { user } = useAuth();
  const toast = useToast();
  
  const [jobDrives, setJobDrives] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [skillsRes, profileRes, jobsRes] = await Promise.allSettled([
        api.getStudentSkills(),
        api.getStudentProfile(),
        api.getJobs(),
      ]);

      // Aggregate skills from student_skills, profile, and user context
      const aggregatedMap = new Map();
      
      const addSkillEntry = (skillObj) => {
        if (!skillObj) return;
        let name = '';
        let proficiency = 'intermediate';
        let category = 'Technical Skills';
        let evidence = null;
        let id = null;

        if (typeof skillObj === 'string') {
          name = skillObj.trim();
        } else if (typeof skillObj === 'object') {
          name = (skillObj.skill_name || skillObj.name || skillObj.skill || skillObj.title || '').trim();
          proficiency = skillObj.proficiency || 'intermediate';
          category = skillObj.category || 'Technical Skills';
          evidence = skillObj.evidence || null;
          id = skillObj.id || skillObj._id || skillObj.skill_id;
        }

        if (name && !/^[0-9a-fA-F]{24}$/.test(name)) {
          const normKey = name.toLowerCase();
          if (!aggregatedMap.has(normKey)) {
            aggregatedMap.set(normKey, {
              id: id || normKey,
              name,
              skill_name: name,
              proficiency,
              category,
              evidence,
            });
          }
        }
      };

      if (skillsRes.status === 'fulfilled' && Array.isArray(skillsRes.value)) {
        skillsRes.value.forEach(addSkillEntry);
      }

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        const p = profileRes.value;
        if (Array.isArray(p.skills)) {
          p.skills.forEach(addSkillEntry);
        }
      }

      if (user?.skills && Array.isArray(user.skills)) {
        user.skills.forEach(addSkillEntry);
      }

      const allStudentSkills = Array.from(aggregatedMap.values());
      setStudentSkills(allStudentSkills);

      let drives = [];
      if (jobsRes.status === 'fulfilled' && jobsRes.value) {
        const rawJobs = jobsRes.value.data || jobsRes.value || [];
        drives = rawJobs.map((j) => ({
          id: j.id || j._id,
          company_name: j.company_name || 'Enterprise Partner',
          title: j.title || 'Software Engineer',
          location: j.location || 'Hybrid / Remote',
          salary_range: (typeof j.package_details === 'string' ? j.package_details : null) || j.salary_range || 'Competitive Package',
          required_skills: (j.required_skills && j.required_skills.length > 0) ? j.required_skills : ['Python', 'Data Structures', 'SQL', 'Git'],
          prep_focus: `Prepare thoroughly for ${j.company_name}'s technical rounds focusing on their tech stack, architectural tradeoffs, and applied problem solving.`,
        }));
      }

      if (drives.length === 0) {
        drives = DEFAULT_COMPANY_DRIVES;
      }

      setJobDrives(drives);
      setSelectedTarget(drives[0]);
    } catch (err) {
      toast.error('Failed to load skill gap intelligence data');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for robust, tokenized fuzzy skill matching
  const cleanStr = (str) => {
    return (str || '')
      .toLowerCase()
      .replace(/\.js\b/gi, 'js')
      .replace(/[^\w+#\s]/g, ' ')
      .trim();
  };

  const SYNONYM_MAP = {
    py: 'python',
    python3: 'python',
    python: 'python',
    fastapi: 'fastapi',
    flask: 'flask',
    django: 'django',
    js: 'javascript',
    javascript: 'javascript',
    ts: 'typescript',
    typescript: 'typescript',
    react: 'react',
    reactjs: 'react',
    node: 'nodejs',
    nodejs: 'nodejs',
    vue: 'vue',
    vuejs: 'vue',
    'c++': 'cpp',
    cpp: 'cpp',
    c: 'c',
    'c#': 'csharp',
    csharp: 'csharp',
    java: 'java',
    golang: 'go',
    go: 'go',
    sql: 'sql',
    mysql: 'sql',
    postgres: 'sql',
    postgresql: 'sql',
    dbms: 'sql',
    rdbms: 'sql',
    mongodb: 'mongodb',
    mongo: 'mongodb',
    redis: 'redis',
    docker: 'docker',
    k8s: 'kubernetes',
    kubernetes: 'kubernetes',
    git: 'git',
    github: 'git',
    dsa: 'dsa',
    'data structures': 'dsa',
    algorithms: 'dsa',
    oop: 'oop',
    oops: 'oop',
    'object oriented programming': 'oop',
    'object oriented': 'oop',
    'system design': 'system design',
    'distributed systems': 'distributed systems',
    ai: 'ai',
    ml: 'ml',
    'machine learning': 'ml',
    'deep learning': 'ml',
    cloud: 'cloud',
    aws: 'aws',
    gcp: 'gcp',
    azure: 'azure',
    rest: 'rest',
    'rest apis': 'rest',
    'rest api': 'rest',
  };

  const getTokens = (skillStr) => {
    if (!skillStr) return [];
    // Split on delimiters like /, or, &, and, +, comma, pipe
    const rawSegments = skillStr
      .split(/\s*(?:\/|\bor\b|\band\b|&|,|\|)\s*/i)
      .map((s) => s.trim())
      .filter(Boolean);

    const tokens = new Set();
    rawSegments.forEach((seg) => {
      const cleaned = cleanStr(seg);
      if (cleaned) {
        tokens.add(cleaned);
        if (SYNONYM_MAP[cleaned]) tokens.add(SYNONYM_MAP[cleaned]);
        
        // Also add individual words if segment has multiple words
        seg.split(/[\s/&,]+/).forEach((word) => {
          const wClean = cleanStr(word);
          if (wClean.length >= 2) {
            tokens.add(wClean);
            if (SYNONYM_MAP[wClean]) tokens.add(SYNONYM_MAP[wClean]);
          }
        });
      }
    });

    return Array.from(tokens);
  };

  const checkMatch = (reqSkill, studentSkill) => {
    const studentName = studentSkill.name || studentSkill.skill_name || '';
    if (!studentName) return false;

    const reqClean = cleanStr(reqSkill);
    const studClean = cleanStr(studentName);

    // 1. Direct or normalized full match
    if (reqClean === studClean) return true;
    if (reqClean.includes(studClean) || studClean.includes(reqClean)) return true;

    // 2. Tokenized intersection & synonym match
    const reqTokens = getTokens(reqSkill);
    const studTokens = getTokens(studentName);

    for (const rTok of reqTokens) {
      for (const sTok of studTokens) {
        if (rTok === sTok) return true;
        if (rTok.length >= 3 && sTok.length >= 3) {
          if (rTok.includes(sTok) || sTok.includes(rTok)) return true;
        }
      }
    }

    return false;
  };

  // Calculate matching & missing skills for any drive
  const computeDriveMatch = (drive) => {
    if (!drive) return { matched: [], missing: [], matchPercent: 0, total: 0 };
    const required = drive.required_skills || [];
    const matched = [];
    const missing = [];

    required.forEach((reqSkill) => {
      let foundStudentSkill = null;
      for (const sObj of studentSkills) {
        if (checkMatch(reqSkill, sObj)) {
          foundStudentSkill = sObj;
          break;
        }
      }

      if (foundStudentSkill) {
        matched.push({
          name: reqSkill,
          matchedWith: foundStudentSkill.name || foundStudentSkill.skill_name,
          proficiency: foundStudentSkill.proficiency || 'intermediate',
          verified: true,
        });
      } else {
        missing.push({
          name: reqSkill,
          urgency: 'high',
        });
      }
    });

    const total = required.length || 1;
    const matchPercent = Math.round((matched.length / total) * 100);

    return { matched, missing, matchPercent, total: required.length };
  };

  const currentAnalysis = selectedTarget ? computeDriveMatch(selectedTarget) : { matched: [], missing: [], matchPercent: 0, total: 0 };

  // Generate Tailored Remedial Roadmap for current company
  const handleGenerateCompanyRoadmap = async () => {
    if (!selectedTarget) return;
    try {
      setGeneratingRoadmap(true);
      toast.info(`Generating personalized ${selectedTarget.company_name} remedial roadmap...`);
      
      const missingSkillNames = currentAnalysis.missing.map((m) => m.name);
      
      await api.generateAiRoadmap(
        selectedTarget.title,
        selectedTarget.company_name,
        missingSkillNames.length > 0 ? missingSkillNames : ['Advanced System Design', 'High Concurrency'],
        6
      );

      toast.success(`Generated 6-week curriculum for ${selectedTarget.company_name}!`);
      if (onNavigate) onNavigate('roadmaps');
    } catch (err) {
      toast.error(err.message || 'Failed to generate remedial roadmap');
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const filteredDrives = jobDrives.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.company_name.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q) ||
      d.required_skills.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-[#f8fafc] dark:bg-[#090d16] min-h-screen py-8 text-slate-800 dark:text-slate-100 animate-fade-in transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner Header */}
        <div className="rounded-3xl p-8 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Live Placement Skill-Gap Intelligence
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Company-by-Company Skill Match & Gap Radar
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl font-normal">
                Compare your verified skills directly against the technical prerequisites of active campus hiring companies. See exact matches, identify missing gaps, and access targeted preparation playbooks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-center">
                <div className="text-xl font-extrabold text-blue-700 dark:text-blue-300">{studentSkills.length}</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">My Verified Skills</div>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">{jobDrives.length}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Active Drives</div>
              </div>
            </div>
          </div>

          {/* Search & Company Selector Bar */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter company (e.g. Zoho, Swiggy, Razorpay)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                />
              </div>

              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Click any company drive below to inspect full skill match & prep playbook:
              </span>
            </div>

            {/* Quick Company Drive Tabs */}
            <div className="flex flex-wrap gap-2">
              {filteredDrives.map((drive) => {
                const isSelected = selectedTarget && (selectedTarget.id === drive.id);
                const { matchPercent } = computeDriveMatch(drive);
                return (
                  <button
                    key={drive.id}
                    onClick={() => setSelectedTarget(drive)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{drive.company_name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : matchPercent >= 70 
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' 
                          : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                    }`}>
                      {matchPercent}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Deep Skill Gap Inspection for Selected Company */}
        {selectedTarget && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Company Match Overview Gauge */}
            <div className="card-3d p-7 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Target Company Placement Drive
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Active Hiring
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedTarget.company_name}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" />
                  {selectedTarget.title}
                </p>

                <div className="flex items-center gap-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {selectedTarget.location}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="w-3.5 h-3.5" />
                    {selectedTarget.salary_range}
                  </span>
                </div>
              </div>

              {/* Match Percentage Circular Gauge */}
              <div className="text-center py-3">
                <div className={`inline-flex flex-col items-center justify-center p-8 rounded-full border-4 shadow-inner ${
                  currentAnalysis.matchPercent >= 75
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                    : currentAnalysis.matchPercent >= 50
                      ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-500/40 text-amber-600 dark:text-amber-400'
                      : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-500/40 text-rose-600 dark:text-rose-400'
                }`}>
                  <span className="text-4xl font-black">{currentAnalysis.matchPercent}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                    Readiness Score
                  </span>
                </div>
              </div>

              {/* Match Stats Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Matched Skills
                  </span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                    {currentAnalysis.matched.length} of {currentAnalysis.total}
                  </strong>
                </div>

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-500" /> Missing / Gap Skills
                  </span>
                  <strong className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                    {currentAnalysis.missing.length}
                  </strong>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleGenerateCompanyRoadmap}
                  disabled={generatingRoadmap}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{generatingRoadmap ? 'Generating AI Roadmap...' : `Generate ${selectedTarget.company_name} Roadmap`}</span>
                </button>

                {onNavigate && (
                  <button
                    onClick={() => onNavigate('mock-tests')}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Take {selectedTarget.company_name} Mock Test</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right 2 Cols: Matched vs Missing Skills Breakdown & Preparation Playbook */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Detailed Breakdown Card */}
              <div className="p-7 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Skills Analysis for {selectedTarget.company_name} ({selectedTarget.title})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Below is the live comparison between your verified skillset and the hiring bar required by {selectedTarget.company_name}:
                  </p>
                </div>

                {/* Grid of Matched vs Missing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Matched Skills Box */}
                  <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Skills You Have Matched ({currentAnalysis.matched.length})
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                        Verified Met
                      </span>
                    </div>

                    {currentAnalysis.matched.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        No direct matches found in your profile yet. Add your verified skills to see them match.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {currentAnalysis.matched.map((sk, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-between text-xs"
                          >
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-white">{sk.name}</span>
                              {sk.matchedWith && sk.matchedWith.toLowerCase() !== sk.name.toLowerCase() && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                  Matched with: {sk.matchedWith}
                                </span>
                              )}
                            </div>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 capitalize border border-emerald-200 dark:border-emerald-800">
                              {sk.proficiency}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Missing Skills Box */}
                  <div className="p-5 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        Skills Missing / Gaps to Close ({currentAnalysis.missing.length})
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                        Action Required
                      </span>
                    </div>

                    {currentAnalysis.missing.length === 0 ? (
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4" /> You meet 100% of the required technical skills!
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {currentAnalysis.missing.map((sk, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-between text-xs"
                          >
                            <span className="font-bold text-slate-900 dark:text-white">{sk.name}</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                              Missing Gap
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Company-Specific Preparation Playbook */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/40 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-purple-950/20 border border-blue-200 dark:border-blue-900/60 space-y-3.5">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-extrabold text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    How to Prepare for {selectedTarget.company_name} (Hiring Strategy)
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {selectedTarget.prep_focus}
                  </p>

                  <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/60 flex flex-wrap gap-2 text-xs">
                    {currentAnalysis.missing.length > 0 ? (
                      <div className="text-slate-600 dark:text-slate-300 text-xs">
                        <strong>Recommended Next Step:</strong> Master <em>{currentAnalysis.missing.map(m => m.name).slice(0, 3).join(', ')}</em> by generating your customized 6-week learning roadmap below.
                      </div>
                    ) : (
                      <div className="text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                        <Award className="w-4 h-4" /> Your profile is in top readiness! Proceed to take the technical mock test.
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

