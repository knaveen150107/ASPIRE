import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Briefcase, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Save,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function StudentProfilePage({ onNavigate }) {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [skills, setSkills] = useState([]);

  const [formData, setFormData] = useState({
    register_number: '',
    department: 'Computer Science and Engineering',
    degree: 'B.Tech',
    graduation_year: 2026,
    cgpa: 8.75,
    active_backlogs: 0,
    profession: 'Full Stack Software Engineer',
    profile_summary: '',
  });

  // Fetch Student Profile & Skills
  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileRes, skillsRes] = await Promise.all([
        api.getStudentProfile().catch(() => null),
        api.getStudentSkills().catch(() => []),
      ]);

      if (profileRes) {
        const loaded = {
          register_number: profileRes.register_number || user?.register_number || '',
          department: profileRes.department || 'Computer Science and Engineering',
          degree: profileRes.degree || 'B.Tech',
          graduation_year: profileRes.graduation_year || 2026,
          cgpa: profileRes.cgpa !== undefined ? profileRes.cgpa : 8.75,
          active_backlogs: profileRes.active_backlogs !== undefined ? profileRes.active_backlogs : 0,
          profession: profileRes.profession || 'Full Stack Software Engineer',
          profile_summary: profileRes.profile_summary || '',
        };
        setFormData(loaded);
        setInitialData(loaded);
      }
      setSkills(skillsRes || []);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name === 'cgpa') {
      if (value === '') {
        setFormData((prev) => ({ ...prev, cgpa: '' }));
        return;
      }
      const num = parseFloat(value);
      if (isNaN(num)) return;
      if (num < 0) {
        setFormData((prev) => ({ ...prev, cgpa: 0 }));
      } else if (num > 10) {
        setFormData((prev) => ({ ...prev, cgpa: 10 }));
      } else {
        setFormData((prev) => ({ ...prev, cgpa: value }));
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      toast.info('Form reset to saved profile data.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const cgpaVal = parseFloat(formData.cgpa);
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
      toast.error('CGPA must be a valid number between 0.0 and 10.0');
      return;
    }

    const backlogsVal = parseInt(formData.active_backlogs, 10);
    if (isNaN(backlogsVal) || backlogsVal < 0) {
      toast.error('Active backlogs cannot be negative.');
      return;
    }

    if (!formData.register_number.trim()) {
      toast.error('Register / Roll Number is required.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        register_number: formData.register_number.trim().toUpperCase(),
        department: formData.department.trim(),
        degree: formData.degree.trim(),
        graduation_year: parseInt(formData.graduation_year, 10),
        cgpa: cgpaVal,
        active_backlogs: backlogsVal,
        profession: formData.profession?.trim() || 'Full Stack Software Engineer',
        profile_summary: formData.profile_summary?.trim() || '',
        academic_record: {
          department: formData.department.trim(),
          degree: formData.degree.trim(),
          graduation_year: parseInt(formData.graduation_year, 10),
          cgpa: cgpaVal,
          active_backlogs: backlogsVal,
          profession: formData.profession?.trim() || 'Full Stack Software Engineer',
        }
      };

      const updated = await api.updateStudentProfile(payload);
      toast.success('Academic profile & CGPA updated successfully!');

      if (refreshUser) {
        await refreshUser();
      }

      if (updated) {
        const syncData = {
          register_number: updated.register_number || payload.register_number,
          department: updated.department || payload.department,
          degree: updated.degree || payload.degree,
          graduation_year: updated.graduation_year || payload.graduation_year,
          cgpa: updated.cgpa !== undefined ? updated.cgpa : payload.cgpa,
          active_backlogs: updated.active_backlogs !== undefined ? updated.active_backlogs : payload.active_backlogs,
          profession: updated.profession || payload.profession,
          profile_summary: updated.profile_summary || payload.profile_summary,
        };
        setFormData(syncData);
        setInitialData(syncData);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update academic profile.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  // CGPA Grade Tier Calculator
  const getCgpaTier = (cgpa) => {
    const val = parseFloat(cgpa);
    if (isNaN(val)) return { label: 'Invalid', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700' };
    if (val >= 9.0) return { label: 'Outstanding (9.0+)', color: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
    if (val >= 8.0) return { label: 'First Class with Distinction (8.0+)', color: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
    if (val >= 7.0) return { label: 'First Class (7.0+)', color: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
    if (val >= 6.0) return { label: 'Second Class (6.0+)', color: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
    return { label: 'Below Standard (<6.0)', color: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' };
  };

  const cgpaTier = getCgpaTier(formData.cgpa);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading your student academic profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950/70 pb-20 pt-6 animate-fade-in transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            
            {/* Student Identity */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
                {(user?.name || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    {user?.name || 'Student Profile'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Student
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {user?.email} • Roll ID: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formData.register_number || 'Not Set'}</span>
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold pt-0.5">
                  {formData.degree} in {formData.department} • Batch of {formData.graduation_year}
                </p>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 px-4 border border-slate-200/80 dark:border-slate-700 text-center min-w-[100px] transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">CGPA</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{Number(formData.cgpa || 0).toFixed(2)}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 px-4 border border-slate-200/80 dark:border-slate-700 text-center min-w-[100px] transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Backlogs</span>
                <span className={`text-xl font-black ${Number(formData.active_backlogs) === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formData.active_backlogs}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3 px-4 border border-slate-200/80 dark:border-slate-700 text-center min-w-[100px] transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Skills</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">{skills.length}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Main Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Academic Credentials (2 cols wide) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Card 1: Academic Scores & Records */}
              <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">Academic Records & CGPA</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Official academic standing used for campus placement eligibility</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${cgpaTier.color}`}>
                    {cgpaTier.label}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* CGPA */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Cumulative GPA (CGPA) *</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">Scale: 0.0 - 10.0</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        name="cgpa"
                        value={formData.cgpa}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                            e.preventDefault();
                          }
                        }}
                        required
                        className="w-full pl-3.5 pr-20 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="e.g. 8.75"
                      />
                      <div className="absolute right-2.5 px-2 py-0.5 bg-slate-200/80 dark:bg-slate-700 border border-slate-300/60 dark:border-slate-600 rounded-md text-[11px] font-black text-slate-600 dark:text-slate-300 pointer-events-none select-none tracking-tight">
                        / 10.0
                      </div>
                    </div>
                  </div>

                  {/* Active Backlogs */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Active Backlogs / Standing Arrears *</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">0 for all tier-1 jobs</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      name="active_backlogs"
                      value={formData.active_backlogs}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                      placeholder="0"
                    />
                  </div>

                  {/* Register Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      University Register / Roll Number *
                    </label>
                    <input
                      type="text"
                      name="register_number"
                      value={formData.register_number}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition uppercase"
                      placeholder="e.g. CB.EN.U4CSE22001"
                    />
                  </div>

                  {/* Graduation Year */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Graduation Year (Batch) *
                    </label>
                    <select
                      name="graduation_year"
                      value={formData.graduation_year}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    >
                      {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((yr) => (
                        <option key={yr} value={yr}>
                          {yr} ({yr === 2026 ? 'Current Batch' : `Class of ${yr}`})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Department */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Department / Specialization *
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                      placeholder="e.g. Computer Science & Engineering"
                    />
                  </div>

                  {/* Degree Program */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Degree Program *
                    </label>
                    <select
                      name="degree"
                      value={formData.degree}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    >
                      <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                      <option value="B.E.">B.E. (Bachelor of Engineering)</option>
                      <option value="M.Tech">M.Tech (Master of Technology)</option>
                      <option value="MCA">MCA (Master of Computer Applications)</option>
                      <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                      <option value="M.Sc">M.Sc (Master of Science)</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* Card 2: Professional Persona & Bio */}
              <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
                
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Career Objective & Bio</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Highlighted to recruiters and used for AI placement matching</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Target Profession */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Target Role / Professional Title
                    </label>
                    <input
                      type="text"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                      placeholder="e.g. Full Stack Developer / AI & ML Engineer"
                    />
                  </div>

                  {/* Profile Summary */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Executive Summary / Bio</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">Auto-generated or custom</span>
                    </label>
                    <textarea
                      name="profile_summary"
                      rows={4}
                      value={formData.profile_summary}
                      onChange={handleChange}
                      className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                      placeholder="Write a concise overview of your technical background, major projects, and career aspirations..."
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Status Summary & Actions (1 col wide) */}
            <div className="space-y-6">
              
              {/* Placement Eligibility Health Card */}
              <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Placement Eligibility Health</h3>
                </div>

                <div className="space-y-3">
                  {/* CGPA Check */}
                  <div className="flex items-start gap-2.5 text-xs">
                    {Number(formData.cgpa) >= 7.5 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : Number(formData.cgpa) >= 6.0 ? (
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        CGPA: {Number(formData.cgpa || 0).toFixed(2)}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {Number(formData.cgpa) >= 8.0 
                          ? 'Eligible for Super Dream & Tier-1 companies (8.0+)'
                          : Number(formData.cgpa) >= 7.0 
                            ? 'Eligible for Dream & Standard corporate drives (7.0+)'
                            : 'May be restricted for high-cutoff companies'}
                      </p>
                    </div>
                  </div>

                  {/* Backlogs Check */}
                  <div className="flex items-start gap-2.5 text-xs">
                    {Number(formData.active_backlogs) === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Active Backlogs: {formData.active_backlogs}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {Number(formData.active_backlogs) === 0 
                          ? 'Zero backlogs verified. Maximum job eligibility!'
                          : 'Clear active backlogs to unlock tier-1 drives.'}
                      </p>
                    </div>
                  </div>

                  {/* Skills Check */}
                  <div className="flex items-start gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        Verified Skills: {skills.length} Added
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Add more skills via RAG resume extraction on dashboard.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 font-bold text-xs border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Manage Skills on Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
                <button
                  type="submit"
                  disabled={saving || !hasChanges}
                  className={`w-full py-3 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                    hasChanges
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 active:scale-98'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                  <span>{saving ? 'Saving Profile...' : hasChanges ? 'Save Changes' : 'All Changes Saved'}</span>
                </button>

                {hasChanges && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full py-2.5 rounded-2xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Discard Changes</span>
                  </button>
                )}
              </div>

            </div>

          </div>

        </form>

      </div>
    </div>
  );
}
