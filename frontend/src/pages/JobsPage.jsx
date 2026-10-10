import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Building2,
  Sparkles,
  Award,
  Send,
  GraduationCap
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EligibilityModal from '../components/EligibilityModal';

export default function JobsPage({ onNavigate }) {
  const { user } = useAuth();
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedDegree, setSelectedDegree] = useState('All');

  // Selected job for eligibility modal
  const [auditJob, setAuditJob] = useState(null);

  // Selected job for AI fit modal
  const [aiFitJob, setAiFitJob] = useState(null);
  const [aiFitResult, setAiFitResult] = useState(null);
  const [loadingAiFit, setLoadingAiFit] = useState(false);

  const handleExplainAiFit = async (job) => {
    try {
      setAiFitJob(job);
      setAiFitResult(null);
      setLoadingAiFit(true);
      const res = await api.explainJobFitAi(job._id);
      setAiFitResult(res);
    } catch (err) {
      toast.error(err.message || 'Failed to analyze job fit with AI');
    } finally {
      setLoadingAiFit(false);
    }
  };

  // Apply modal/state
  const [applyingJob, setApplyingJob] = useState(null);
  const [myResumes, setMyResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [applicationNotes, setApplicationNotes] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  // Student Profile & CGPA
  const [studentProfile, setStudentProfile] = useState(null);
  const [onlyEligibleCgpa, setOnlyEligibleCgpa] = useState(true);

  // My submitted applications
  const [myAppliedJobIds, setMyAppliedJobIds] = useState(new Set());

  const fetchJobsAndUserData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes, resumesRes, profileRes] = await Promise.allSettled([
        api.getJobs(),
        user ? api.getMyApplications() : Promise.resolve([]),
        user ? api.getMyResumes() : Promise.resolve([]),
        user ? api.getStudentProfile() : Promise.resolve(null),
      ]);

      if (jobsRes.status === 'fulfilled' && jobsRes.value) {
        setJobs(jobsRes.value.data || jobsRes.value || []);
      }

      if (appsRes.status === 'fulfilled' && appsRes.value) {
        const ids = new Set((appsRes.value || []).map((a) => a.job_id || a.id));
        setMyAppliedJobIds(ids);
      }

      if (resumesRes.status === 'fulfilled' && resumesRes.value) {
        setMyResumes(resumesRes.value || []);
        if (resumesRes.value && resumesRes.value.length > 0) {
          setSelectedResumeId(resumesRes.value[0].id || resumesRes.value[0]._id);
        }
      }

      if (profileRes.status === 'fulfilled' && profileRes.value) {
        setStudentProfile(profileRes.value);
      }
    } catch (err) {
      toast.error('Failed to load job listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsAndUserData();
  }, [user]);

  const studentCgpa = studentProfile?.cgpa ?? user?.cgpa ?? 8.75;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyingJob) return;

    const targetJobId = applyingJob.id || applyingJob._id;
    if (!targetJobId) {
      toast.error('Invalid job ID');
      return;
    }

    try {
      setIsSubmittingApp(true);
      await api.applyJob(targetJobId, selectedResumeId || undefined, applicationNotes);
      toast.success(`Successfully applied to ${applyingJob.title} at ${applyingJob.company_name || 'Company'}!`);
      setMyAppliedJobIds((prev) => new Set([...prev, targetJobId]));
      setApplyingJob(null);
      setApplicationNotes('');
    } catch (err) {
      toast.error(err.message || 'Failed to submit application');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    const title = job.title || '';
    const company = job.company_name || '';
    const desc = job.description || '';
    const skills = job.required_skills || [];

    const matchesSearch = 
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skills.some(s => String(s).toLowerCase().includes(searchQuery.toLowerCase()));

    const depts = job.eligible_departments || job.eligibility_criteria?.allowed_departments || [];
    const matchesDept = 
      selectedDept === 'All' || 
      depts.length === 0 ||
      depts.some(d => d.toLowerCase().includes(selectedDept.toLowerCase()) || selectedDept.toLowerCase().includes(d.toLowerCase()));

    const degrees = job.eligible_degrees || job.eligibility_criteria?.allowed_degrees || [];
    const matchesDegree = 
      selectedDegree === 'All' || 
      degrees.length === 0 ||
      degrees.some(d => d.toLowerCase() === selectedDegree.toLowerCase());

    const minJobCgpa = job.min_cgpa ?? job.eligibility_criteria?.min_cgpa ?? 0;
    const matchesCgpa = !onlyEligibleCgpa || minJobCgpa <= studentCgpa;

    return matchesSearch && matchesDept && matchesDegree && matchesCgpa;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950/70 py-8 text-slate-800 dark:text-slate-100 animate-fade-in transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header and Filter Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Live Campus Recruitment Drives
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Verified Placement Openings
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl font-normal">
                Discover job drives with instant AI academic eligibility audits, required skills breakdown, and 1-click applications.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">{jobs.length}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Total Drives</div>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-center">
                <div className="text-xl font-extrabold text-blue-700 dark:text-blue-300">{myAppliedJobIds.size}</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">Applied</div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by job title, company name, skill (e.g. React, Python)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
              />
            </div>

            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:border-blue-600 transition font-medium"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics">Electronics</option>
                <option value="Artificial Intelligence">AI & Data Science</option>
              </select>
            </div>

            <div>
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:border-blue-600 transition font-medium"
              >
                <option value="All">All Degrees</option>
                <option value="B.Tech">B.Tech</option>
                <option value="B.E.">B.E.</option>
                <option value="M.Tech">M.Tech</option>
                <option value="MCA">MCA</option>
              </select>
            </div>
          </div>

          {/* CGPA Eligibility Quick Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">Your Verified Academic CGPA:</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-extrabold text-xs">
                {studentCgpa}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOnlyEligibleCgpa(!onlyEligibleCgpa)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                  onlyEligibleCgpa
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {onlyEligibleCgpa ? '✓ Showing Drives for My CGPA (Cutoff ≤ ' + studentCgpa + ')' : 'Showing All Cutoffs'}
              </button>
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Matching opportunities with your profile...</p>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-3">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No placement drives found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Try resetting your department or query filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedDept('All'); setSelectedDegree('All'); }}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const jobId = job.id || job._id;
              const hasApplied = myAppliedJobIds.has(jobId);
              const minCgpa = job.min_cgpa ?? job.eligibility_criteria?.min_cgpa ?? 0;
              const maxBacklogs = job.max_backlogs ?? job.eligibility_criteria?.max_backlogs_allowed ?? 0;
              const salaryDisplay = (typeof job.package_details === 'string' ? job.package_details : null) || job.salary_range || 'Competitive Package';
              const jobTypeDisplay = (job.employment_type ? job.employment_type.replace('_', ' ') : null) || job.job_type || 'Full Time';

              return (
                <div
                  key={jobId}
                  className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between group shadow-xs"
                >
                  <div>
                    {/* Top Bar: Company & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm">
                          {job.company_name ? job.company_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {job.company_name || 'Enterprise Partner'}
                          </h4>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition mt-0.5">
                            {job.title}
                          </h3>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 capitalize">
                        {jobTypeDisplay}
                      </span>
                    </div>

                    {/* Location & Package Details */}
                    <div className="flex flex-wrap items-center gap-3 py-2.5 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location || 'Remote / Hybrid'}
                      </span>
                      {salaryDisplay && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <DollarSign className="w-3.5 h-3.5" />
                          {salaryDisplay}
                        </span>
                      )}
                    </div>

                    {/* Description snippet */}
                    <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                      {job.description || 'Join our high-growth engineering team to build enterprise grade distributed systems and AI solutions.'}
                    </p>

                    {/* Skills tags */}
                    {job.required_skills && job.required_skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.required_skills.slice(0, 4).map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Academic Criteria Badge */}
                    <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        Min CGPA: <strong className="text-slate-800 dark:text-slate-200">{minCgpa > 0 ? minCgpa : 'No Cutoff'}</strong>
                      </span>
                      <span>Max Backlogs: <strong className="text-slate-800 dark:text-slate-200">{maxBacklogs}</strong></span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleExplainAiFit(job)}
                      className="py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800/80 transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      AI Fit
                    </button>

                    <button
                      onClick={() => setAuditJob(job)}
                      className="flex-1 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Audit
                    </button>

                    {hasApplied ? (
                      <button
                        disabled
                        className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1 cursor-default"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Applied
                      </button>
                    ) : (
                      <button
                        onClick={() => setApplyingJob(job)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* AI Fit Explainer Modal */}
      {aiFitJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Gemini Candidate-Job Fit Analysis
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                  {aiFitJob.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{aiFitJob.company_name || 'Enterprise Recruiter'}</p>
              </div>
              <button
                onClick={() => {
                  setAiFitJob(null);
                  setAiFitResult(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {loadingAiFit && (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 border-3 border-purple-600/20 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Analyzing job fit with Gemini 3.6 Flash...</p>
                <p className="text-xs text-slate-400">Comparing your skills, academic profile, and projects against job requirements.</p>
              </div>
            )}

            {aiFitResult && !loadingAiFit && (
              <div className="space-y-5">
                {/* Fit Score Gauge */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-indigo-500/10 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-purple-800 dark:text-purple-300">Candidate Match Score</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Calculated by AI Placement Agent</div>
                  </div>
                  <div className="text-3xl font-black text-purple-700 dark:text-purple-300">
                    {aiFitResult.fit_score}%
                  </div>
                </div>

                {/* Match Summary */}
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {aiFitResult.fit_summary}
                </p>

                {/* Strengths & Missing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1.5">
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      ✓ Profile Strengths
                    </div>
                    <ul className="text-[11px] text-emerald-900 dark:text-emerald-200/90 space-y-1">
                      {(aiFitResult.strengths || []).map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">• <span>{s}</span></li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-1.5">
                    <div className="text-xs font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
                      ⚠ Gaps to Address
                    </div>
                    <ul className="text-[11px] text-rose-900 dark:text-rose-200/90 space-y-1">
                      {(aiFitResult.missing_skills || []).map((m, i) => (
                        <li key={i} className="flex items-start gap-1.5">• <span>{m}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Interview Prep Tips */}
                {aiFitResult.interview_prep_tips && aiFitResult.interview_prep_tips.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-1.5">
                    <div className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1">
                      💡 Recommended Interview Prep Focus
                    </div>
                    <ul className="text-[11px] text-blue-800 dark:text-blue-200 space-y-1">
                      {aiFitResult.interview_prep_tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">→ <span>{tip}</span></li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setAiFitJob(null);
                      setAiFitResult(null);
                    }}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const jobToApply = aiFitJob;
                      setAiFitJob(null);
                      setAiFitResult(null);
                      setApplyingJob(jobToApply);
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                  >
                    Proceed to Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-Time Academic Eligibility Modal */}
      {auditJob && (
        <EligibilityModal
          job={auditJob}
          onClose={() => setAuditJob(null)}
          onApplySuccess={() => {
            setMyAppliedJobIds((prev) => new Set([...prev, auditJob._id]));
          }}
        />
      )}

      {/* Apply Job Modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 transition-colors">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Direct Campus Application</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">Apply to {applyingJob.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{applyingJob.company_name || 'Enterprise Partner'}</p>
            </div>

            <form onSubmit={handleApply} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Profile / Resume</label>
                {myResumes.length > 0 ? (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600"
                  >
                    {myResumes.map((res) => (
                      <option key={res._id} value={res._id}>
                        {res.title || 'Master Resume'} (ATS: {res.ats_score || 85}%)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                    Your verified ASPIRE Academic & Skills profile will be submitted.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Candidate Pitch / Notes (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Share any special achievements, hackathon wins, or why you're a great fit..."
                  value={applicationNotes}
                  onChange={(e) => setApplicationNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-600 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApp}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingApp ? 'Submitting...' : 'Confirm Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
