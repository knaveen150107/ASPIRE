import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Briefcase, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Target,
  FileText,
  Activity,
  User,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function StudentDashboard({ onNavigate }) {
  const { user } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [allCatalogSkills, setAllCatalogSkills] = useState([]);
  const [applications, setApplications] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal for adding skill
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [newSkillId, setNewSkillId] = useState('');
  const [newProficiency, setNewProficiency] = useState('intermediate');
  const [newEvidence, setNewEvidence] = useState('');
  const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);

  // Edit profile state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editCgpa, setEditCgpa] = useState('');
  const [editBacklogs, setEditBacklogs] = useState(0);
  const [editDegree, setEditDegree] = useState('B.Tech');
  const [editDepartment, setEditDepartment] = useState('Computer Science');
  const [editBatch, setEditBatch] = useState(2025);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profileData, skillsData, appsData, testsData, catalogData] = await Promise.allSettled([
        api.getStudentProfile(),
        api.getStudentSkills(),
        api.getMyApplications(),
        api.getMyMockTests(),
        api.getSkills(),
      ]);

      if (profileData.status === 'fulfilled') {
        setProfile(profileData.value);
        if (profileData.value) {
          setEditCgpa(profileData.value.academic_record?.cgpa || '');
          setEditBacklogs(profileData.value.academic_record?.active_backlogs || 0);
          setEditDegree(profileData.value.academic_record?.degree || 'B.Tech');
          setEditDepartment(profileData.value.academic_record?.department || 'Computer Science');
          setEditBatch(profileData.value.academic_record?.graduation_year || 2025);
        }
      }

      if (skillsData.status === 'fulfilled') setSkills(skillsData.value);
      if (appsData.status === 'fulfilled') setApplications(appsData.value);
      if (testsData.status === 'fulfilled') setMockTests(testsData.value);
      if (catalogData.status === 'fulfilled') setAllCatalogSkills(catalogData.value);
    } catch (err) {
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillId) {
      toast.error('Please select a skill');
      return;
    }
    try {
      setIsSubmittingSkill(true);
      await api.addStudentSkill(newSkillId, newProficiency, newEvidence ? [newEvidence] : []);
      toast.success('Skill added successfully to your profile');
      setIsSkillModalOpen(false);
      setNewSkillId('');
      setNewEvidence('');
      // Reload skills
      const updatedSkills = await api.getStudentSkills();
      setSkills(updatedSkills);
    } catch (err) {
      toast.error(err.message || 'Failed to add skill');
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await api.deleteStudentSkill(skillId);
      toast.success('Skill removed');
      setSkills(skills.filter((s) => s.skill_id !== skillId));
    } catch (err) {
      toast.error(err.message || 'Failed to remove skill');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.updateStudentProfile({
        academic_record: {
          degree: editDegree,
          department: editDepartment,
          graduation_year: Number(editBatch),
          cgpa: Number(editCgpa),
          active_backlogs: Number(editBacklogs),
          history_of_backlogs: false,
        }
      });
      toast.success('Academic profile updated successfully!');
      setIsEditProfileOpen(false);
      loadDashboardData();
    } catch (err) {
      toast.error(err.message || 'Failed to update academic profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Loading your AI career intelligence profile...</p>
        </div>
      </div>
    );
  }

  const cgpa = profile?.academic_record?.cgpa || 0;
  const backlogs = profile?.academic_record?.active_backlogs ?? 0;
  const degree = profile?.academic_record?.degree || 'B.Tech';
  const department = profile?.academic_record?.department || 'Computer Science';
  const batch = profile?.academic_record?.graduation_year || 2025;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome & Quick Overview Banner */}
      <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Student Account • AI Readiness Active
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{user?.name || 'Scholar'}</span> 👋
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Track your real-time campus placement readiness, academic credentials, skill mastery, and automated AI job recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition flex items-center gap-2"
            >
              <User className="w-4 h-4 text-slate-400" />
              Edit Academic Profile
            </button>
            <button
              onClick={() => onNavigate('jobs')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Explore Open Drives
            </button>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Academic CGPA</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{cgpa.toFixed(2)}</span>
            <span className="text-xs text-slate-500">/ 10.0</span>
          </div>
          <p className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${cgpa >= 7.5 ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            {cgpa >= 7.5 ? 'Eligible for 92% of top-tier drives' : 'Focus on CGPA to unlock tier-1 drives'}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Backlogs</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{backlogs}</span>
            <span className="text-xs text-slate-500">standing</span>
          </div>
          <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {backlogs === 0 ? 'Zero Standing Backlogs' : `${backlogs} backlogs pending`}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Skills Verified</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{skills.length}</span>
            <span className="text-xs text-slate-500">competencies</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Across Frontend, Backend & AI
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-indigo-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Applications</span>
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{applications.length}</span>
            <span className="text-xs text-slate-500">submitted</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            {applications.filter(a => a.status === 'shortlisted').length} shortlisted for interviews
          </p>
        </div>
      </div>

      {/* Main Grid: Skills Management & Academic Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Skills & Verified Evidence */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-400" />
                  Verified Skill Arsenal
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Skills matched against company job requirements in real-time
                </p>
              </div>
              <button
                onClick={() => setIsSkillModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            </div>

            {skills.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
                <Award className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-medium">No skills added to your profile yet</p>
                <p className="text-slate-500 text-xs mt-1">Add your technical & soft skills to unlock tailored jobs and skill-gap audits.</p>
                <button
                  onClick={() => setIsSkillModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                >
                  Add Your First Skill
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {skills.map((s, idx) => (
                  <div
                    key={s.skill_id || idx}
                    className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition flex items-start justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-200">{s.name || s.skill_id}</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          s.proficiency === 'expert' ? 'bg-indigo-500/20 text-indigo-400' :
                          s.proficiency === 'advanced' ? 'bg-cyan-500/20 text-cyan-400' :
                          s.proficiency === 'intermediate' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {s.proficiency}
                        </span>
                      </div>
                      {s.evidence && s.evidence.length > 0 && (
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">
                          Evidence: {s.evidence.join(', ')}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteSkill(s.skill_id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100"
                      title="Remove skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Mock Assessments */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Recent Mock Assessments
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  AI-evaluated readiness tests with granular topic breakdowns
                </p>
              </div>
              <button
                onClick={() => onNavigate('mock-tests')}
                className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1 transition"
              >
                View All Tests <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {mockTests.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-800 rounded-2xl">
                <p className="text-slate-400 text-sm">No assessments completed yet.</p>
                <button
                  onClick={() => onNavigate('mock-tests')}
                  className="mt-3 px-4 py-2 rounded-xl bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 text-xs font-semibold transition"
                >
                  Take a Diagnostic Test
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {mockTests.slice(0, 3).map((test, idx) => (
                  <div key={test._id || idx} className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-white">{test.title || 'Technical Assessment'}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Category: <span className="text-slate-300">{test.category}</span> • Questions: {test.total_questions || 10}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-emerald-400">
                        {test.score !== undefined ? `${test.score}%` : 'Completed'}
                      </span>
                      <p className="text-[10px] text-slate-500">Verified Score</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Academic Details & Quick Actions */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              Academic Credentials
            </h3>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Degree</span>
                <span className="text-white font-medium">{degree}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Department</span>
                <span className="text-white font-medium">{department}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Graduation Batch</span>
                <span className="text-white font-medium">{batch}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Cumulative GPA</span>
                <span className="text-emerald-400 font-bold">{cgpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Standing Backlogs</span>
                <span className="text-white font-medium">{backlogs}</span>
              </div>
            </div>

            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              Update Academic Info
            </button>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Career Acceleration Hub
            </h3>

            <button
              onClick={() => onNavigate('skill-gaps')}
              className="w-full p-3.5 rounded-2xl bg-slate-950/40 hover:bg-indigo-500/10 border border-slate-800/80 hover:border-indigo-500/30 transition flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition">Skill-Gap Radar</h4>
                  <p className="text-[11px] text-slate-500">Benchmark against target roles</p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition" />
            </button>

            <button
              onClick={() => onNavigate('roadmaps')}
              className="w-full p-3.5 rounded-2xl bg-slate-950/40 hover:bg-cyan-500/10 border border-slate-800/80 hover:border-cyan-500/30 transition flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition">Learning Roadmaps</h4>
                  <p className="text-[11px] text-slate-500">Milestone courses & tasks</p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
            </button>

            <button
              onClick={() => onNavigate('resumes')}
              className="w-full p-3.5 rounded-2xl bg-slate-950/40 hover:bg-emerald-500/10 border border-slate-800/80 hover:border-emerald-500/30 transition flex items-center justify-between group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">Tailored Resumes</h4>
                  <p className="text-[11px] text-slate-500">ATS optimized versions</p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-white">Add Verified Skill</h3>
            <p className="text-xs text-slate-400">
              Add technical competencies or choose from our global placement taxonomy.
            </p>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Skill</label>
                {allCatalogSkills.length > 0 ? (
                  <select
                    value={newSkillId}
                    onChange={(e) => setNewSkillId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                    required
                  >
                    <option value="">-- Choose from Catalog --</option>
                    {allCatalogSkills.map((sk) => (
                      <option key={sk._id || sk.name} value={sk.name}>
                        {sk.name} ({sk.category})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Python, FastApi, React, PyTorch"
                    value={newSkillId}
                    onChange={(e) => setNewSkillId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Proficiency Level</label>
                <select
                  value={newProficiency}
                  onChange={(e) => setNewProficiency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="beginner">Beginner (Foundational)</option>
                  <option value="intermediate">Intermediate (Project Ready)</option>
                  <option value="advanced">Advanced (Production Experience)</option>
                  <option value="expert">Expert (Architectural Mastery)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project / Cert Evidence (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. GitHub repo link or Certification ID"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSkill}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isSubmittingSkill ? 'Saving...' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <h3 className="text-lg font-bold text-white">Update Academic Record</h3>
            <p className="text-xs text-slate-400">
              Ensure your GPA and backlog records reflect current university transcripts.
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Degree</label>
                  <select
                    value={editDegree}
                    onChange={(e) => setEditDegree(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="B.E.">B.E.</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MCA">MCA</option>
                    <option value="B.Sc">B.Sc Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Department</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Artificial Intelligence & DS">Artificial Intelligence & DS</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Graduation Year</label>
                  <input
                    type="number"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={editCgpa}
                    onChange={(e) => setEditCgpa(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Active Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={editBacklogs}
                    onChange={(e) => setEditBacklogs(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20"
                >
                  Save Academic Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
