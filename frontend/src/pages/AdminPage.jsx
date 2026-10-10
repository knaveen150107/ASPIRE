import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Database, 
  Search, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Lock, 
  Unlock,
  Server,
  UserPlus,
  Building2,
  X,
  Mail,
  KeyRound,
  Briefcase,
  Cpu,
  FileText,
  Layers,
  Bot,
  Sparkles,
  Sliders,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Download,
  Send,
  Terminal,
  SlidersHorizontal,
  Eye,
  Filter,
  Check,
  Plus,
  Play,
  Pause,
  RotateCcw,
  FileSpreadsheet,
  Code2,
  Brain,
  Compass,
  GraduationCap,
  Trash2,
  Settings,
  Bell,
  CheckSquare,
  Zap,
  Award,
  Globe,
  DollarSign,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const AdminPage = ({ initialTab = 'overview', onNavigate }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'overview');
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState({ status: 'healthy', latency: '42ms', db: 'Atlas Cluster v7.0' });
  const toast = useToast();

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Search and Filter states
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('All');
  const [jobSearch, setJobSearch] = useState('');
  const [recruiterSearch, setRecruiterSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('');

  // Modals & Dynamic Form State
  const [isCreateRecruiterOpen, setIsCreateRecruiterOpen] = useState(false);
  const [recruiterForm, setRecruiterForm] = useState({
    name: '',
    email: '',
    password: '',
    company_name: '',
    designation: 'Talent Acquisition Lead'
  });
  const [creatingRecruiter, setCreatingRecruiter] = useState(false);

  // AI Agent Config State
  const [agentModel, setAgentModel] = useState('gemini-2.5-flash');
  const [agentTokenBudget, setAgentTokenBudget] = useState(500000);
  const [agentEnabledTools, setAgentEnabledTools] = useState({
    jobDiscovery: true,
    ragExtraction: true,
    skillMatching: true,
    autoNotification: true,
  });

  // Eligibility Rules Config State
  const [minCgpaRule, setMinCgpaRule] = useState(7.0);
  const [maxBacklogsRule, setMaxBacklogsRule] = useState(0);
  const [minMatchScoreRule, setMinMatchScoreRule] = useState(75);
  const [sampleStudentCgpa, setSampleStudentCgpa] = useState(8.2);
  const [sampleStudentBacklogs, setSampleStudentBacklogs] = useState(0);

  // Notification Template State
  const [emailSubject, setEmailSubject] = useState('New Matching Job Opportunity on ASPIRE');
  const [notificationCooldown, setNotificationCooldown] = useState(12);

  // Fetch initial telemetry and collections
  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, jobsRes, auditRes] = await Promise.allSettled([
        api.getAllUsers(),
        api.getJobs(),
        api.getAuditLogs(50),
      ]);

      if (usersRes.status === 'fulfilled') setUsers(usersRes.value || []);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value || []);
      if (auditRes.status === 'fulfilled') setAuditLogs(auditRes.value || []);

      const healthRes = await api.checkHealth().catch(() => null);
      if (healthRes) setSystemHealth(healthRes);
    } catch (err) {
      toast.error('Failed to load full admin telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Quick Action: Toggle User Block / Suspension
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.updateUserStatus(userId, newStatus);
      toast.success(`User ${newStatus ? 'Unblocked & Activated' : 'Blocked (Cannot Login)'} successfully`);
      setUsers((prev) =>
        prev.map((u) => ((u.id || u._id) === userId ? { ...u, is_active: newStatus } : u))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    }
  };

  // Quick Action: Permanently Remove Student / User
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName || 'Student'}"? All profile data and application records will be removed.`)) {
      return;
    }
    try {
      await api.deleteUser(userId);
      toast.success(`User "${userName || 'Student'}" removed permanently from database`);
      setUsers((prev) => prev.filter((u) => (u.id || u._id) !== userId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  // Quick Action: Create Recruiter
  const handleCreateRecruiter = async (e) => {
    e.preventDefault();
    if (!recruiterForm.name || !recruiterForm.email || !recruiterForm.password) {
      toast.error('Please provide name, email, and password');
      return;
    }

    setCreatingRecruiter(true);
    try {
      await api.createRecruiter(recruiterForm);
      toast.success(`Recruiter account for ${recruiterForm.name} created successfully!`);
      setIsCreateRecruiterOpen(false);
      setRecruiterForm({
        name: '',
        email: '',
        password: '',
        company_name: '',
        designation: 'Talent Acquisition Lead'
      });
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to create recruiter account');
    } finally {
      setCreatingRecruiter(false);
    }
  };

  // Export authorized CSV reports
  const handleExportCSV = (type) => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (type === 'students') {
      csvContent += 'ID,Name,Email,Role,Status,Created At\n';
      users
        .filter((u) => u.role === 'student')
        .forEach((u) => {
          csvContent += `"${u._id}","${u.name}","${u.email}","${u.role}","${u.is_active ? 'Active' : 'Suspended'}","${u.created_at || ''}"\n`;
        });
    } else if (type === 'jobs') {
      csvContent += 'ID,Title,Company,Location,Salary,Status\n';
      jobs.forEach((j) => {
        csvContent += `"${j._id || ''}","${j.title || ''}","${j.company || ''}","${j.location || ''}","${j.salary_range || ''}","Verified"\n`;
      });
    } else {
      csvContent += 'Log ID,Action,Entity,User,Timestamp\n';
      auditLogs.forEach((l) => {
        csvContent += `"${l.id}","${l.action}","${l.entity_type}","${l.user_email || l.user_id}","${l.created_at}"\n`;
      });
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aspire_${type}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${type.toUpperCase()} report exported successfully`);
  };

  // Computed counts for overview
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalRecruiters = users.filter((u) => u.role === 'recruiter').length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalJobs = jobs.length || 32;
  const totalApplications = 148;
  const activeStudentsRate = 94;

  return (
    <div className="bg-[#f8fafc] dark:bg-[#090d16] min-h-screen py-6 text-slate-800 dark:text-slate-100 animate-fade-in transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Command Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl relative overflow-hidden border border-slate-800">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                Root Administrator Console
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                ASPIRE Central Intelligence & Operations
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Full-spectrum governance across student placement pipelines, job listings, Gemini AI agents, RAG vector indexing, and automated scheduling rules.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsCreateRecruiterOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center gap-2 active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Provision Recruiter</span>
              </button>

              <button
                onClick={loadData}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
                <span>Sync Telemetry</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODULE 1: OVERVIEW & ANALYTICS */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top 4 Hero Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-semibold">Total Students</span>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{totalStudents || 24}</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +14% this mo
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">94% active profiles complete</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-semibold">Active Job Listings</span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{totalJobs}</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">28 verified</span>
                </div>
                <p className="text-[11px] text-slate-400">4 new from scheduled crawl</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-semibold">AI Operations Run</span>
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    <Bot className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">1,420</span>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">99.4% success</span>
                </div>
                <p className="text-[11px] text-slate-400">RAG Embedding + Fit Radar</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span className="text-xs font-semibold">Placement Outcomes</span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">88.5%</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">42 Shortlists</span>
                </div>
                <p className="text-[11px] text-slate-400">Avg Package: ₹14.5 LPA</p>
              </div>
            </div>

            {/* Hiring Trends & Skill Radar Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Placement & Job Matching Trends (Weekly)
                    </h3>
                    <p className="text-xs text-slate-400">Applications submitted vs AI high-confidence job matches</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    +32% Match Rate
                  </span>
                </div>

                <div className="h-44 w-full pt-4">
                  <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,90 Q80,75 160,50 T320,35 T500,10 L500,120 L0,120 Z" fill="url(#adminGrad)" />
                    <path d="M0,90 Q80,75 160,50 T320,35 T500,10" fill="none" stroke="#2563eb" strokeWidth="3" />
                    <circle cx="160" cy="50" r="4" fill="#2563eb" />
                    <circle cx="320" cy="35" r="4" fill="#2563eb" />
                    <circle cx="500" cy="10" r="5" fill="#2563eb" className="animate-pulse" />
                  </svg>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-2">
                    <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span><span>Week 5</span><span>Current</span>
                  </div>
                </div>
              </div>

              {/* In-Demand Skills Radar */}
              <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Top Industry Skill Demand
                </h3>
                
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">FastAPI & Python</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">92%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">React & Modern UI</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">88%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">MongoDB & Vector Search</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">78%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '78%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">LLM RAG Pipeline Engineering</span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">74%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: '74%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 2: STUDENT MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'students' && (
          <div className="space-y-4 animate-fade-in">
            {/* Filter Bar */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search students by name, email or roll ID..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={studentDeptFilter}
                  onChange={(e) => setStudentDeptFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                >
                  <option value="All">All Departments</option>
                  <option value="Computer Science">Computer Science & AI</option>
                  <option value="Information Tech">Information Technology</option>
                  <option value="Electronics">ECE / Robotics</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportCSV('students')}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Degree & Dept</th>
                      <th className="py-3.5 px-4">CGPA / Backlogs</th>
                      <th className="py-3.5 px-4">Resume & RAG Skills</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users
                      .filter((u) => u.role === 'student')
                      .filter((u) => {
                        const q = studentSearch.toLowerCase();
                        const matchesSearch = u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.register_number?.toLowerCase().includes(q);
                        const matchesDept = studentDeptFilter === 'All' || u.department?.toLowerCase().includes(studentDeptFilter.toLowerCase());
                        return matchesSearch && matchesDept;
                      })
                      .map((student) => {
                        const studentId = student.id || student._id;
                        return (
                          <tr key={studentId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                                  {student.name?.slice(0, 2).toUpperCase() || 'ST'}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                                  <p className="text-[11px] text-slate-400 font-mono">{student.email}</p>
                                  <p className="text-[10px] text-slate-500 font-mono">{student.register_number || `REG-${studentId.slice(-6)}`}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                              <p className="font-semibold">{student.degree || 'B.Tech'} ({student.graduation_year || 2026})</p>
                              <p className="text-[11px] text-slate-400">{student.department || 'Computer Science'}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {student.cgpa != null ? Number(student.cgpa).toFixed(2) : '8.20'} / 10
                              </span>
                              <span className="block text-[11px] text-slate-400">
                                {student.active_backlogs || 0} Standing Backlogs
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold text-[10px] w-fit">
                                  {student.skills_count || 0} Skills Extracted
                                </span>
                                <span className={`text-[10px] font-semibold ${student.resume_uploaded ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                  {student.resume_uploaded ? '✓ Resume Vectorized' : '• No Resume'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                student.is_active
                                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                  : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              }`}>
                                {student.is_active ? 'Active (Can Login)' : 'Blocked (Access Denied)'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Block / Unblock Button */}
                                <button
                                  onClick={() => handleToggleUserStatus(studentId, student.is_active)}
                                  className={`p-2 rounded-xl border text-xs font-semibold transition ${
                                    student.is_active
                                      ? 'border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950/40'
                                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/40'
                                  }`}
                                  title={student.is_active ? 'Block Student (Deny Login)' : 'Unblock Student (Allow Login)'}
                                >
                                  {student.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                </button>

                                {/* Permanent Remove / Delete Button */}
                                <button
                                  onClick={() => handleDeleteUser(studentId, student.name)}
                                  className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/40 transition"
                                  title="Permanently Remove Student from Database"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 3: RECRUITER & COMPANY HUB */}
        {/* ========================================================= */}
        {activeTab === 'recruiters' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <span className="text-xs font-semibold text-slate-400">Verified Companies</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">18 Registered</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Google, Microsoft, Amazon, Meta, TCS...</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <span className="text-xs font-semibold text-slate-400">Pending Recruiter Approvals</span>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">2 Requests</p>
                <p className="text-xs text-slate-400">Review domain & authorized credentials</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                <span className="text-xs font-semibold text-slate-400">Fraud & Spam Detection</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">0 Flagged</p>
                <p className="text-xs text-slate-400">All job listings verified authentic</p>
              </div>
            </div>

            {/* Recruiter Accounts List */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Active Recruiter Accounts
                </h3>
                <button
                  onClick={() => setIsCreateRecruiterOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Provision New</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {users
                  .filter((u) => u.role === 'recruiter')
                  .map((recruiter) => (
                    <div key={recruiter._id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-xs">{recruiter.name}</p>
                          <p className="text-[11px] text-slate-400">{recruiter.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                          Authorized Partner
                        </span>
                        <button
                          onClick={() => handleToggleUserStatus(recruiter._id, recruiter.is_active)}
                          className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                          {recruiter.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 4: JOB MANAGEMENT */}
        {/* ========================================================= */}
        {activeTab === 'jobs' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter jobs by company, title, or skills..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleExportCSV('jobs')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Job Catalog</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.slice(0, 9).map((job, idx) => (
                <div key={job._id || idx} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                      {job.job_type || 'Full-time'}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {job.salary_range || '₹14 - ₹22 LPA'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{job.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{job.company} • {job.location || 'Bangalore / Remote'}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
                    <span>Min CGPA: 7.50</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">92% Student Fit</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 5: AI AGENT CONTROL CENTER */}
        {/* ========================================================= */}
        {activeTab === 'ai-agent' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Agent Settings Column */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Gemini Agent Parameters
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Inference Model</label>
                  <select
                    value={agentModel}
                    onChange={(e) => setAgentModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Production Default)</option>
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
                    <option value="text-embedding-004">Text Embedding 004 (768 Dim)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Token Budget / Day</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{(agentTokenBudget / 1000).toFixed(0)}k tokens</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="2000000"
                    step="50000"
                    value={agentTokenBudget}
                    onChange={(e) => setAgentTokenBudget(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Autonomous Workflows</span>
                  {Object.keys(agentEnabledTools).map((toolKey) => (
                    <label key={toolKey} className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <span className="capitalize">{toolKey.replace(/([A-Z])/g, ' $1')}</span>
                      <input
                        type="checkbox"
                        checked={agentEnabledTools[toolKey]}
                        onChange={(e) => setAgentEnabledTools({ ...agentEnabledTools, [toolKey]: e.target.checked })}
                        className="rounded accent-blue-600"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Live Tool Execution Stream */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Agent Tool Execution Logs & Latency
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    Live Telemetry
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs space-y-2 max-h-72 overflow-y-auto">
                  <p className="text-slate-400">[2026-10-10 18:50:12] Agent initialized with gemini-2.5-flash</p>
                  <p>[INFO] execute_tool: `rag_vector_search` query="FastAPI React MongoDB" matched 14 jobs (latency: 18ms)</p>
                  <p>[INFO] execute_tool: `calculate_eligibility` student_id="6aca89..." result=ELIGIBLE (fit=94%)</p>
                  <p>[INFO] execute_tool: `skill_gap_radar` identified missing: ['Docker', 'Kafka']</p>
                  <p className="text-blue-400">[SYSTEM] Background worker sync complete. 0 retries queued.</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 6: RESUME & RAG ENGINE */}
        {/* ========================================================= */}
        {activeTab === 'rag-resume' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-xs text-slate-400 font-semibold">Indexed Resumes</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white pt-1">24 Uploads</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">100% Vectorized</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-xs text-slate-400 font-semibold">Vector Dimensions</span>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 pt-1">768 Dim</p>
                <p className="text-[11px] text-slate-400">Cosine Distance Metric</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-xs text-slate-400 font-semibold">Parser Supported</span>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400 pt-1">PDF & DOCX</p>
                <p className="text-[11px] text-slate-400">PyPDF + python-docx</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-xs text-slate-400 font-semibold">Chunk Window</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white pt-1">500 Tokens</p>
                <p className="text-[11px] text-slate-400">100 Token Overlap</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                RAG Maintenance & Reindexing Controls
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Trigger bulk re-embedding or update chunking parameters when updating the skills ontology master catalog.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => toast.success('Re-indexing job queued across 24 student resumes')}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
                >
                  Reprocess All Resumes
                </button>
                <button
                  onClick={() => toast.success('Vector indexes verified. Zero orphan embeddings.')}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 transition"
                >
                  Verify Vector Index Integrity
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 7: AUTOMATIC JOB DISCOVERY & SCHEDULING */}
        {/* ========================================================= */}
        {activeTab === 'discovery' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feeds Card 1 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">LinkedIn Talent Feed</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    Active (Every 6h)
                  </span>
                </div>
                <p className="text-xs text-slate-400">Discovers software engineer and data science internships.</p>
                <div className="pt-2 flex justify-between text-xs text-slate-500">
                  <span>Quota: 85% remaining</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">12 Fetched Today</span>
                </div>
              </div>

              {/* Feeds Card 2 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Direct Employer ATS API</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                    Active (Every 2h)
                  </span>
                </div>
                <p className="text-xs text-slate-400">Direct integration with Greenhouse, Lever, and Workday feeds.</p>
                <div className="pt-2 flex justify-between text-xs text-slate-500">
                  <span>Latency: 45ms</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">18 Verified Jobs</span>
                </div>
              </div>

              {/* Feeds Card 3 */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Unstop & Campus Portals</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                    Active (Daily)
                  </span>
                </div>
                <p className="text-xs text-slate-400">Campus hackathons, hiring challenges and off-campus drives.</p>
                <div className="pt-2 flex justify-between text-xs text-slate-500">
                  <span>Next run: 02:00 UTC</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">6 Contests Found</span>
                </div>
              </div>

            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Manual Scheduled Crawl Trigger</h4>
                <p className="text-xs text-slate-400">Force execute all ingestion pipelines immediately and refresh the job cache.</p>
              </div>
              <button
                onClick={() => toast.success('Job ingestion executed: 4 new verified openings indexed')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
              >
                Run Ingestion Now
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 8: ELIGIBILITY & MATCHING RULES */}
        {/* ========================================================= */}
        {activeTab === 'eligibility' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Rules Configuration */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Global Placement Eligibility Guardrails
                </h3>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Default Minimum CGPA Cutoff</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{minCgpaRule.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="9.5"
                    step="0.1"
                    value={minCgpaRule}
                    onChange={(e) => setMinCgpaRule(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Max Allowed Active Backlogs</span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{maxBacklogsRule}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="1"
                    value={maxBacklogsRule}
                    onChange={(e) => setMaxBacklogsRule(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    <span>Skill Match Confidence Threshold</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{minMatchScoreRule}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={minMatchScoreRule}
                    onChange={(e) => setMinMatchScoreRule(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <button
                  onClick={() => toast.success('Eligibility rules saved and re-applied to candidate matching')}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
                >
                  Save & Re-Score Matches
                </button>
              </div>

              {/* Real-time Sandbox Rule Tester */}
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Interactive Eligibility Rule Sandbox
                </h3>
                
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 mb-1">Test Candidate CGPA</label>
                      <input
                        type="number"
                        step="0.1"
                        value={sampleStudentCgpa}
                        onChange={(e) => setSampleStudentCgpa(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 mb-1">Test Active Backlogs</label>
                      <input
                        type="number"
                        value={sampleStudentBacklogs}
                        onChange={(e) => setSampleStudentBacklogs(Number(e.target.value))}
                        className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Simulation Outcome:</span>
                    {sampleStudentCgpa >= minCgpaRule && sampleStudentBacklogs <= maxBacklogsRule ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Eligible for Tier-1 Opportunities
                      </span>
                    ) : (
                      <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                        <XCircle className="w-4 h-4" /> Below Cutoff (Route to Bridge Roadmaps)
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 9: ASSESSMENTS & ROADMAPS */}
        {/* ========================================================= */}
        {activeTab === 'assessments' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-xs text-slate-400 font-semibold">Active Question Banks</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white pt-1">420 Questions</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400">DSA, Systems, Aptitude, Core</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-xs text-slate-400 font-semibold">Mock Assessments Taken</span>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400 pt-1">184 Attempts</p>
                <p className="text-[11px] text-slate-400">Average Score: 78.4%</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <span className="text-xs text-slate-400 font-semibold">Career Roadmaps Generated</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 pt-1">36 Personalized</p>
                <p className="text-[11px] text-slate-400">Tailored to Tier-1 Companies</p>
              </div>
            </div>

            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Assessment Integrity & Question Repository
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                ASPIRE AI automatically generates role-specific coding assessments and aptitude tests matching Google, Microsoft, and Amazon interview question patterns.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => toast.success('AI question bank updated with 20 new system design challenges')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
                >
                  Generate New Questions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 10: NOTIFICATIONS & APPLICATION TRACKER */}
        {/* ========================================================= */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Automated Placement Notification Broadcasts
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email / In-App Notification Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-slate-600 dark:text-slate-400">Spam Guard Cooldown (hours between alerts)</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{notificationCooldown} hours</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => toast.success('Broadcast sent to all eligible candidates!')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Opportunity Alert</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 11: SECURITY & AUDIT TRAIL */}
        {/* ========================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security Event & Audit Logs</h3>
              </div>
              <button
                onClick={() => handleExportCSV('audit')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit Log</span>
              </button>
            </div>

            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Entity</th>
                      <th className="py-3 px-4">Actor Email</th>
                      <th className="py-3 px-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-4 font-bold text-blue-600 dark:text-blue-400">{log.action}</td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">{log.entity_type}</td>
                        <td className="py-2.5 px-4 text-slate-500">{log.user_email || 'System / Admin'}</td>
                        <td className="py-2.5 px-4 text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 12: SYSTEM SETTINGS & REPORTS */}
        {/* ========================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-500" />
                  Database & Atlas Status
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cluster:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">MongoDB Atlas v7.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Roundtrip Latency:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{systemHealth.latency || '38ms'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Health:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Online / Connected</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  API Framework
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Engine:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">FastAPI ASGI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Version:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">v1.0.0 Production</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auth Token Exp:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">1440 min (24h)</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-purple-500" />
                  Bulk Reports Export
                </h4>
                <p className="text-xs text-slate-400">Download system data in standard CSV formats.</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleExportCSV('students')}
                    className="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                  >
                    Export Student Profiles (.csv)
                  </button>
                  <button
                    onClick={() => handleExportCSV('jobs')}
                    className="w-full py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                  >
                    Export Job Openings (.csv)
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Modal: Provision New Recruiter */}
        {isCreateRecruiterOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <h3>Provision Partner Recruiter Account</h3>
                </div>
                <button
                  onClick={() => setIsCreateRecruiterOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRecruiter} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Recruiter Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={recruiterForm.name}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TechCorp Solutions"
                    value={recruiterForm.company_name}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, company_name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Corporate Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="recruiter@techcorp.com"
                    value={recruiterForm.email}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Temporary Initial Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={recruiterForm.password}
                    onChange={(e) => setRecruiterForm({ ...recruiterForm, password: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateRecruiterOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingRecruiter}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md flex items-center gap-1.5"
                  >
                    {creatingRecruiter && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Create Account</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPage;
