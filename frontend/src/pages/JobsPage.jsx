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
    <div className="bg-[#f8fafc] min-h-screen py-8 text-slate-800 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner */}
        <div className="rounded-3xl p-8 bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5" />
                Verified Campus Placement Opportunities
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Placement Drives & Career Board
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm max-w-2xl font-normal">
                Discover job drives with instant AI academic eligibility audits, required skills breakdown, and 1-click applications.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-xl font-extrabold text-slate-900">{jobs.length}</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Total Drives</div>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <div className="text-xl font-extrabold text-blue-700">{myAppliedJobIds.size}</div>
                <div className="text-[10px] text-blue-600 font-bold uppercase">Applied</div>
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-blue-600 focus:bg-white transition"
              />
            </div>

            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-blue-600 transition font-medium"
              >
                <option value="All">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Artificial Intelligence & DS">Artificial Intelligence & DS</option>
              </select>
            </div>

            <div>
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs focus:outline-none focus:border-blue-600 transition font-medium"
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
              <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-500 text-xs">Matching opportunities with your profile...</p>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl space-y-3">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No placement drives found</h3>
            <p className="text-slate-500 text-xs">Try resetting your department or query filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedDept('All'); setSelectedDegree('All'); }}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition"
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

              return (
                <div
                  key={job._id}
                  className="p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between group shadow-xs"
                >
                  <div>
                    {/* Top Bar: Company & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                          {job.company_name ? job.company_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {job.company_name || 'Enterprise Partner'}
                          </h4>
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition mt-0.5">
                            {job.title}
                          </h3>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                        {job.job_type || 'Full Time'}
                      </span>
                    </div>

                    {/* Location & Package Details */}
                    <div className="flex flex-wrap items-center gap-3 py-2.5 border-y border-slate-100 text-xs text-slate-600">
                      <span className="flex items-center gap-1 text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location || 'Remote / Hybrid'}
                      </span>
                      {job.salary_range && (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <DollarSign className="w-3.5 h-3.5" />
                          {job.salary_range}
                        </span>
                      )}
                    </div>

                    {/* Description snippet */}
                    <p className="mt-2.5 text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                      {job.description || 'Join our high-growth engineering team to build enterprise grade distributed systems and AI solutions.'}
                    </p>

                    {/* Skills tags */}
                    {job.required_skills && job.required_skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {job.required_skills.slice(0, 4).map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Academic Criteria Badge */}
                    <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                        Min CGPA: <strong className="text-slate-800">{minCgpa > 0 ? minCgpa : 'No Cutoff'}</strong>
                      </span>
                      <span>Max Backlogs: <strong className="text-slate-800">{maxBacklogs}</strong></span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setAuditJob(job)}
                      className="flex-1 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-blue-600" />
                      Audit Eligibility
                    </button>

                    {hasApplied ? (
                      <button
                        disabled
                        className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-default"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Direct Campus Application</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Apply to {applyingJob.title}</h3>
              <p className="text-xs text-slate-500">{applyingJob.company_name || 'Enterprise Partner'}</p>
            </div>

            <form onSubmit={handleApply} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Profile / Resume</label>
                {myResumes.length > 0 ? (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  >
                    {myResumes.map((res) => (
                      <option key={res._id} value={res._id}>
                        {res.title || 'Master Resume'} (ATS: {res.ats_score || 85}%)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                    Your verified ASPIRE Academic & Skills profile will be submitted.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate Pitch / Notes (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Share any special achievements, hackathon wins, or why you're a great fit..."
                  value={applicationNotes}
                  onChange={(e) => setApplicationNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold"
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
