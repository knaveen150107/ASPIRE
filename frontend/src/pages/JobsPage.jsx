import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Building2,
  Sparkles,
  Award,
  Send,
  SlidersHorizontal,
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
  const [filterEligibleOnly, setFilterEligibleOnly] = useState(false);

  // Selected job for eligibility modal
  const [auditJob, setAuditJob] = useState(null);

  // Apply modal/state
  const [applyingJob, setApplyingJob] = useState(null);
  const [myResumes, setMyResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [applicationNotes, setApplicationNotes] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  // My submitted applications
  const [myAppliedJobIds, setMyAppliedJobIds] = useState(new Set());

  const fetchJobsAndUserData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes, resumesRes] = await Promise.allSettled([
        api.getJobs(),
        user ? api.getMyApplications() : Promise.resolve([]),
        user ? api.getMyResumes() : Promise.resolve([]),
      ]);

      if (jobsRes.status === 'fulfilled' && jobsRes.value) {
        setJobs(jobsRes.value.data || jobsRes.value || []);
      }

      if (appsRes.status === 'fulfilled' && appsRes.value) {
        const ids = new Set((appsRes.value || []).map((a) => a.job_id));
        setMyAppliedJobIds(ids);
      }

      if (resumesRes.status === 'fulfilled' && resumesRes.value) {
        setMyResumes(resumesRes.value || []);
        if (resumesRes.value && resumesRes.value.length > 0) {
          setSelectedResumeId(resumesRes.value[0]._id);
        }
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

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyingJob) return;

    try {
      setIsSubmittingApp(true);
      await api.applyJob(applyingJob._id, selectedResumeId || undefined, applicationNotes);
      toast.success(`Successfully applied to ${applyingJob.title} at ${applyingJob.company_name || 'Company'}!`);
      setMyAppliedJobIds((prev) => new Set([...prev, applyingJob._id]));
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
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.required_skills && job.required_skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesDept = selectedDept === 'All' || 
      !job.eligibility_criteria?.allowed_departments ||
      job.eligibility_criteria.allowed_departments.includes(selectedDept) ||
      job.eligibility_criteria.allowed_departments.length === 0;

    const matchesDegree = selectedDegree === 'All' ||
      !job.eligibility_criteria?.allowed_degrees ||
      job.eligibility_criteria.allowed_degrees.includes(selectedDegree) ||
      job.eligibility_criteria.allowed_degrees.length === 0;

    return matchesSearch && matchesDept && matchesDegree;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Campus & Off-Campus Opportunities
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Placement Drives & Career Board
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Discover opportunities with instant AI academic eligibility audits, required skills breakdown, and 1-click application tracking.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-2xl font-extrabold text-white">{jobs.length}</div>
              <div className="text-[11px] text-slate-400">Total Drives</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-2xl font-extrabold text-emerald-400">{myAppliedJobIds.size}</div>
              <div className="text-[11px] text-slate-400">Applied</div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by job title, company name, tech stack (e.g. React, Python)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Artificial Intelligence & DS">Artificial Intelligence & DS</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
            </select>
          </div>

          <div>
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="All">All Degrees</option>
              <option value="B.Tech">B.Tech</option>
              <option value="B.E.">B.E.</option>
              <option value="M.Tech">M.Tech</option>
              <option value="MCA">MCA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm">Matching opportunities with your academic profile...</p>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No placement drives found</h3>
          <p className="text-slate-400 text-xs mt-1">Try resetting your department or query filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedDept('All'); setSelectedDegree('All'); }}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-600/30 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const hasApplied = myAppliedJobIds.has(job._id);
            const minCgpa = job.eligibility_criteria?.min_cgpa || 0;
            const maxBacklogs = job.eligibility_criteria?.max_backlogs_allowed ?? 0;
            const allowedDepts = job.eligibility_criteria?.allowed_departments || [];

            return (
              <div
                key={job._id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 backdrop-blur-md transition flex flex-col justify-between group shadow-lg hover:shadow-indigo-500/5"
              >
                <div>
                  {/* Top Bar: Company & Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold">
                        {job.company_name ? job.company_name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-slate-400 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          {job.company_name || 'Enterprise Partner'}
                        </h4>
                        <h3 className="font-bold text-base text-white group-hover:text-indigo-400 transition mt-0.5">
                          {job.title}
                        </h3>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {job.job_type || 'Full Time'}
                    </span>
                  </div>

                  {/* Location & Package Details */}
                  <div className="flex flex-wrap items-center gap-3 py-3 border-y border-slate-800/60 text-xs text-slate-300">
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {job.location || 'Remote / Hybrid'}
                    </span>
                    {job.salary_range && (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <DollarSign className="w-3.5 h-3.5" />
                        {job.salary_range}
                      </span>
                    )}
                  </div>

                  {/* Description snippet */}
                  <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {job.description || 'Join our high-growth engineering team to build enterprise grade distributed systems and AI solutions.'}
                  </p>

                  {/* Skills tags */}
                  {job.required_skills && job.required_skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.required_skills.slice(0, 4).map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300"
                        >
                          {sk}
                        </span>
                      ))}
                      {job.required_skills.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-800/60 text-slate-500">
                          +{job.required_skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Academic Criteria Badge */}
                  <div className="mt-4 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-300">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                      Min CGPA: <strong className="text-white">{minCgpa > 0 ? minCgpa : 'No Cutoff'}</strong>
                    </span>
                    <span>Max Backlogs: <strong className="text-white">{maxBacklogs}</strong></span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-2">
                  <button
                    onClick={() => setAuditJob(job)}
                    className="flex-1 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700/60 transition flex items-center justify-center gap-1.5"
                  >
                    <Award className="w-3.5 h-3.5 text-cyan-400" />
                    Audit Eligibility
                  </button>

                  {hasApplied ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1 cursor-default"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => setApplyingJob(job)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition flex items-center gap-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Direct Campus Application</span>
              <h3 className="text-lg font-bold text-white mt-1">Apply to {applyingJob.title}</h3>
              <p className="text-xs text-slate-400">{applyingJob.company_name || 'Enterprise Partner'}</p>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Profile / Resume</label>
                {myResumes.length > 0 ? (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {myResumes.map((res) => (
                      <option key={res._id} value={res._id}>
                        {res.title || 'Master Resume'} (ATS: {res.ats_score || 85}%)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                    Your verified ASPIRE Academic & Skills profile will be submitted.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Candidate Pitch / Notes (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Share any special achievements, hackathon wins, or why you're a great fit..."
                  value={applicationNotes}
                  onChange={(e) => setApplicationNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingApp}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingApp ? 'Submitting...' : 'Confirm & Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
