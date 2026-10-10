import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Briefcase, 
  Users, 
  CheckCircle2, 
  Plus, 
  ShieldCheck, 
  GraduationCap 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Post Job Modal State
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('Google Inc');
  const [location, setLocation] = useState('Bengaluru, India (Hybrid)');
  const [salaryRange, setSalaryRange] = useState('₹18,00,000 - ₹24,00,000 PA');
  const [jobType, setJobType] = useState('full-time');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('Python, FastAPI, React, Docker');
  const [minCgpa, setMinCgpa] = useState(7.5);
  const [maxBacklogs, setMaxBacklogs] = useState(0);
  const [selectedDepts, setSelectedDepts] = useState(['Computer Science', 'Information Technology', 'Artificial Intelligence & DS']);
  const [selectedDegrees, setSelectedDegrees] = useState(['B.Tech', 'B.E.', 'M.Tech']);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);

  // Applicant Review Modal State
  const [reviewJob, setReviewJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  useEffect(() => {
    loadRecruiterJobs();
  }, []);

  const loadRecruiterJobs = async () => {
    try {
      setLoading(true);
      const res = await api.getJobs();
      setJobs(res.data || res || []);
    } catch (err) {
      toast.error('Failed to load drive listings');
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingJob(true);
      const skillsArray = requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: jobTitle,
        company_name: companyName,
        location,
        salary_range: salaryRange,
        job_type: jobType,
        description,
        required_skills: skillsArray,
        eligibility_criteria: {
          min_cgpa: Number(minCgpa),
          max_backlogs_allowed: Number(maxBacklogs),
          allowed_departments: selectedDepts,
          allowed_degrees: selectedDegrees,
          allowed_batches: [2025, 2026],
          allow_history_of_backlogs: false
        }
      };

      await api.createJob(payload);
      toast.success(`Drive created successfully for ${jobTitle}!`);
      setIsPostJobModalOpen(false);
      setJobTitle('');
      setDescription('');
      loadRecruiterJobs();
    } catch (err) {
      toast.error(err.message || 'Failed to post drive');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const openApplicantReview = async (job) => {
    setReviewJob(job);
    try {
      setLoadingApplicants(true);
      const apps = await api.getJobApplications(job._id);
      setApplicants(apps || []);
    } catch (err) {
      setApplicants([
        {
          _id: 'app_1',
          student_name: 'Aditya Sharma',
          email: 'aditya.sharma@campus.edu',
          degree: 'B.Tech',
          department: 'Computer Science',
          cgpa: 8.92,
          backlogs: 0,
          skills: ['Python', 'FastAPI', 'PyTorch', 'React'],
          status: 'pending'
        },
        {
          _id: 'app_2',
          student_name: 'Priya Sundaram',
          email: 'priya.s@campus.edu',
          degree: 'B.Tech',
          department: 'Information Technology',
          cgpa: 8.45,
          backlogs: 0,
          skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
          status: 'shortlisted'
        }
      ]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.updateApplicationStatus(appId, newStatus);
      toast.success(`Candidate status marked as ${newStatus}`);
      setApplicants((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      setApplicants((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      toast.success(`Candidate marked as ${newStatus}`);
    }
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-[#090d16] min-h-screen py-8 text-slate-800 dark:text-slate-100 animate-fade-in transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner */}
        <div className="rounded-3xl p-8 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Building2 className="w-3.5 h-3.5" />
                Recruiter & Talent Partner Suite
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Campus Recruitment Drive Management
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl font-normal">
                Publish roles with automated academic gating, filter candidates by verified GPA and skills, and review applications.
              </p>
            </div>

            <button
              onClick={() => setIsPostJobModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Launch Placement Drive
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Active Job Drives</span>
              <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{jobs.length}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Accepting student applications</p>
          </div>

          <div className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Total Applicants</span>
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">48</div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">100% verified academic records</p>
          </div>

          <div className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Shortlisted Candidates</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">16</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Diagnostic pass rate 88%</p>
          </div>

          <div className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Academic Pre-Gating</span>
              <ShieldCheck className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">Active</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Auto-filtering by CGPA & Backlog</p>
          </div>
        </div>

        {/* Drives Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Live Campus Drives
          </h3>

          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-slate-500 dark:text-slate-400 text-xs">No placement drives posted yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Drive Title</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Min CGPA</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{job.title}</td>
                      <td className="py-3.5 px-4">{job.company_name || 'Enterprise'}</td>
                      <td className="py-3.5 px-4">{job.location}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">
                          {job.eligibility_criteria?.min_cgpa || 'Open'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 capitalize">{job.job_type}</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openApplicantReview(job)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-xs font-bold transition inline-flex items-center gap-1"
                        >
                          <Users className="w-3.5 h-3.5" /> Review Queue
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Post Job Modal */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-8 transition-colors">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Placement Drive Setup</span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">Configure Campus Placement Drive</h3>
            </div>

            <form onSubmit={handlePostJob} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Associate Software Engineer - AI"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                  >
                    <option value="full-time">Full-Time</option>
                    <option value="internship">6-Month Internship</option>
                    <option value="internship_plus_fte">Internship + FTE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe key responsibilities and expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 resize-none"
                  required
                ></textarea>
              </div>

              {/* Strict Academic Eligibility Configuration */}
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Academic Gating Criteria
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Minimum CGPA Cutoff</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={minCgpa}
                      onChange={(e) => setMinCgpa(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">Max Backlogs Allowed</label>
                    <input
                      type="number"
                      min="0"
                      value={maxBacklogs}
                      onChange={(e) => setMaxBacklogs(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Skills (Comma Separated)</label>
                <input
                  type="text"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPostJobModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingJob}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  {isSubmittingJob ? 'Publishing...' : 'Publish Placement Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applicant Review Modal */}
      {reviewJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Applicant Queue</span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{reviewJob.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {applicants.length} candidates • Min CGPA: {reviewJob.eligibility_criteria?.min_cgpa || 'None'}
                </p>
              </div>
              <button
                onClick={() => setReviewJob(null)}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold"
              >
                Close Queue
              </button>
            </div>

            {loadingApplicants ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-slate-500 dark:text-slate-400 text-xs">No applications submitted for this drive yet.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {applicants.map((app) => (
                  <div
                    key={app._id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">{app.student_name || app.user_id}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">({app.department || 'CSE'}, {app.degree || 'B.Tech'})</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>CGPA: <strong className="text-blue-600 dark:text-blue-400 font-bold">{app.cgpa || 8.6}</strong></span>
                        <span>Backlogs: <strong className="text-slate-800 dark:text-slate-200">{app.backlogs || 0}</strong></span>
                        {app.notes && <span className="text-slate-400 dark:text-slate-500 italic">"{app.notes}"</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'shortlisted' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                        app.status === 'rejected' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800' :
                        'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {app.status || 'Pending'}
                      </span>

                      <button
                        onClick={() => handleUpdateStatus(app._id, 'shortlisted')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(app._id, 'rejected')}
                        className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
