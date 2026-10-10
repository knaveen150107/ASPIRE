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

      if (skillsData.status === 'fulfilled') setSkills(skillsData.value || []);
      if (appsData.status === 'fulfilled') setApplications(appsData.value || []);
      if (testsData.status === 'fulfilled') setMockTests(testsData.value || []);
      if (catalogData.status === 'fulfilled') setAllCatalogSkills(catalogData.value || []);
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
      const updatedSkills = await api.getStudentSkills();
      setSkills(updatedSkills || []);
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
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-xs">Loading career readiness metrics...</p>
        </div>
      </div>
    );
  }

  const cgpa = profile?.academic_record?.cgpa || 8.2;
  const backlogs = profile?.academic_record?.active_backlogs ?? 0;
  const degree = profile?.academic_record?.degree || 'B.Tech';
  const department = profile?.academic_record?.department || 'Computer Science';
  const batch = profile?.academic_record?.graduation_year || 2025;

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 text-slate-800 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Student Account • Active Placement Season
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'Scholar'} 👋
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm max-w-2xl font-normal">
              Track your real-time campus placement readiness, academic record verification, and AI test scores.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-md transition flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Edit Academic Profile
            </button>
            <button
              onClick={() => onNavigate('jobs')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-blue-700 font-bold text-xs shadow-lg transition flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Explore Open Drives
            </button>
          </div>
        </div>

        {/* Top 4 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Cumulative GPA</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900">{Number(cgpa).toFixed(2)}</span>
              <span className="text-xs text-slate-400">/ 10.0</span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {cgpa >= 7.5 ? 'Eligible for 92% of top tier drives' : 'Work on GPA for tier 1 cutoff'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Standing Backlogs</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900">{backlogs}</span>
              <span className="text-xs text-slate-400">active</span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {backlogs === 0 ? 'Zero Standing Backlogs' : `${backlogs} backlogs pending`}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Verified Skills</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900">{skills.length}</span>
              <span className="text-xs text-slate-400">competencies</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Mapped against company requirements
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Applications</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900">{applications.length}</span>
              <span className="text-xs text-slate-400">submitted</span>
            </div>
            <p className="text-xs text-blue-600 font-semibold">
              {applications.filter(a => a.status === 'shortlisted').length} shortlisted for rounds
            </p>
          </div>
        </div>

        {/* Main Grid: Skills & Academic Records */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Verified Skills & Mock History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Skills Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Verified Skill Arsenal
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Skills evaluated against company placement prerequisites
                  </p>
                </div>
                <button
                  onClick={() => setIsSkillModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Skill
                </button>
              </div>

              {skills.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl space-y-2">
                  <Award className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-slate-600 text-xs font-semibold">No skills added to your profile yet</p>
                  <button
                    onClick={() => setIsSkillModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    Add First Skill
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {skills.map((s, idx) => (
                    <div
                      key={s.skill_id || idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between group hover:border-slate-300 transition"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{s.name || s.skill_id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            s.proficiency === 'expert' ? 'bg-blue-100 text-blue-700' :
                            s.proficiency === 'advanced' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {s.proficiency}
                          </span>
                        </div>
                        {s.evidence && s.evidence.length > 0 && (
                          <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {s.evidence.join(', ')}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteSkill(s.skill_id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition opacity-0 group-hover:opacity-100"
                        title="Remove skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Mock Assessments */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Recent Mock Assessments
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    AI diagnostic test history with topic mastery scorecards
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('mock-tests')}
                  className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1 transition"
                >
                  View All Tests <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {mockTests.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl">
                  <p className="text-slate-500 text-xs">No mock assessments completed yet.</p>
                  <button
                    onClick={() => onNavigate('mock-tests')}
                    className="mt-2 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold"
                  >
                    Take a Practice Test
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {mockTests.slice(0, 3).map((test, idx) => (
                    <div key={test._id || idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{test.title || 'Technical Assessment'}</h4>
                        <p className="text-[11px] text-slate-500">
                          Category: <span className="text-slate-700 font-medium">{test.category}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-extrabold text-emerald-600">{test.score}%</span>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right 1 Col: Academic Details & Career Navigation */}
          <div className="space-y-6">
            
            {/* Academic Credentials Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Academic Credentials
              </h3>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Degree</span>
                  <span className="text-slate-900 font-bold">{degree}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Department</span>
                  <span className="text-slate-900 font-bold">{department}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Graduation Batch</span>
                  <span className="text-slate-900 font-bold">{batch}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Cumulative GPA</span>
                  <span className="text-blue-600 font-extrabold">{Number(cgpa).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Standing Backlogs</span>
                  <span className="text-slate-900 font-bold">{backlogs}</span>
                </div>
              </div>

              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition"
              >
                Update Academic Info
              </button>
            </div>

            {/* Quick Actions Card */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Career Acceleration Tools
              </h4>

              <button
                onClick={() => onNavigate('skill-gaps')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Skill-Gap Radar</h5>
                    <p className="text-[10px] text-slate-400">Benchmark against target roles</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={() => onNavigate('roadmaps')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">Learning Roadmaps</h5>
                    <p className="text-[10px] text-slate-400">Curated weekly modules</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={() => onNavigate('resumes')}
                className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">ATS Resume Tailor</h5>
                    <p className="text-[10px] text-slate-400">Score keyword alignment</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Add Skill Modal */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Verified Skill</h3>
            <p className="text-xs text-slate-500">
              Add technical competencies to unlock tailored job matching and eligibility audits.
            </p>

            <form onSubmit={handleAddSkill} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Skill</label>
                {allCatalogSkills.length > 0 ? (
                  <select
                    value={newSkillId}
                    onChange={(e) => setNewSkillId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
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
                    placeholder="e.g. Python, FastAPI, React, PyTorch"
                    value={newSkillId}
                    onChange={(e) => setNewSkillId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proficiency Level</label>
                <select
                  value={newProficiency}
                  onChange={(e) => setNewProficiency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                >
                  <option value="beginner">Beginner (Foundational)</option>
                  <option value="intermediate">Intermediate (Project Ready)</option>
                  <option value="advanced">Advanced (Production Experience)</option>
                  <option value="expert">Expert (Architectural Mastery)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Evidence (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. GitHub repo link or Certification ID"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSkill}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Update Academic Record</h3>
            <p className="text-xs text-slate-500">
              Ensure your GPA and backlog records match verified college transcripts.
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Degree</label>
                  <select
                    value={editDegree}
                    onChange={(e) => setEditDegree(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  >
                    <option value="B.Tech">B.Tech</option>
                    <option value="B.E.">B.E.</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="MCA">MCA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Artificial Intelligence & DS">Artificial Intelligence & DS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Batch Year</label>
                  <input
                    type="number"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={editCgpa}
                    onChange={(e) => setEditCgpa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    value={editBacklogs}
                    onChange={(e) => setEditBacklogs(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
