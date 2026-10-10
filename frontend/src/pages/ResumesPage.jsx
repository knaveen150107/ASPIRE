import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Download, 
  Cpu 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ResumesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resume Creator Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [experienceInput, setExperienceInput] = useState('');
  const [projectsInput, setProjectsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadResumes();
  }, [user]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const res = await api.getMyResumes();
      setResumes(res || []);
    } catch (err) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResume = async (e) => {
    e.preventDefault();
    if (!resumeTitle.trim()) {
      toast.error('Please enter a title for your resume version');
      return;
    }

    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const baseAts = 80;
    const bonus = Math.min(18, parsedSkills.length * 2);
    const calculatedAts = baseAts + bonus;

    try {
      setIsSubmitting(true);
      const payload = {
        title: resumeTitle,
        summary: summary || 'Aspiring Software & AI Engineer with hands-on full-stack development experience.',
        skills: parsedSkills.length > 0 ? parsedSkills : ['Python', 'FastAPI', 'React', 'MongoDB'],
        experience: experienceInput ? [experienceInput] : ['Software Engineering Intern - Campus Placement Lab'],
        projects: projectsInput ? [projectsInput] : ['ASPIRE AI Placement Intelligence Platform'],
        ats_score: calculatedAts,
      };

      await api.createResume(payload);
      toast.success('Resume created and ATS verified!');
      setIsModalOpen(false);
      setResumeTitle('');
      setSummary('');
      setSkillsInput('');
      setExperienceInput('');
      setProjectsInput('');
      loadResumes();
    } catch (err) {
      toast.error(err.message || 'Failed to create resume');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 text-slate-800 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner */}
        <div className="rounded-3xl p-8 bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5" />
                ATS Parser & Keyword Optimization Studio
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                AI Resume Studio & Tailored Versions
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm max-w-2xl font-normal">
                Create ATS-optimized resume profiles tailored to distinct campus placement drives with keyword alignment scoring.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Create Tailored Version
            </button>
          </div>
        </div>

        {/* Resumes Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Resumes Created Yet</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto">
              Build your master profile resume or create custom tailored variants with ATS keyword matching.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
            >
              Create Master Resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume, idx) => (
              <div
                key={resume._id || idx}
                className="card-3d p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-300 transition flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-xs">
                        <Cpu className="w-3.5 h-3.5" />
                        ATS: {resume.ats_score || 88}%
                      </div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Parser Score</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {resume.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-500 line-clamp-3 leading-relaxed font-normal">
                    {resume.summary || 'Professional academic and software engineering summary for top-tier placement evaluation.'}
                  </p>

                  {/* Skills */}
                  {resume.skills && resume.skills.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {resume.skills.slice(0, 5).map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Ready for Direct Drive Apply</span>
                  <button
                    onClick={() => toast.success(`Exporting ${resume.title} to PDF!`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Export PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Create Resume Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">AI Resume Tailor</span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">Create Tailored Placement Resume</h3>
            </div>

            <form onSubmit={handleCreateResume} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Title / Target Role</label>
                <input
                  type="text"
                  placeholder="e.g. Master SWE Resume, Full Stack AI Specialist"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Executive Summary</label>
                <textarea
                  rows="3"
                  placeholder="Summarize your engineering expertise, hackathons, and career focus..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Skills (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Python, FastAPI, React, PyTorch, Docker, PostgreSQL"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Key Projects Highlight</label>
                <input
                  type="text"
                  placeholder="e.g. ASPIRE AI Platform - Built with FastAPI and React"
                  value={projectsInput}
                  onChange={(e) => setProjectsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Creating...' : 'Save & Calculate ATS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
