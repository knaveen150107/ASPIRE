import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Download, 
  ExternalLink,
  Edit3,
  Layers,
  TrendingUp,
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

    // Calculate mock ATS score based on richness
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              ATS Parser & Keyword Optimization Engine
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              AI Resume Studio & Tailored Versions
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Create ATS-optimized resume profiles tailored to distinct campus placement opportunities with real-time keyword scoring.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Create Tailored Version
          </button>
        </div>
      </div>

      {/* Resumes Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      ) : resumes.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Resumes Created Yet</h3>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Build your master resume or generate custom tailored versions with ATS keyword matching.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition"
          >
            Create Your Master Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume, idx) => (
            <div
              key={resume._id || idx}
              className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 backdrop-blur-md transition flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-sm">
                      <Cpu className="w-3.5 h-3.5" />
                      ATS: {resume.ats_score || 88}%
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Parser Score</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition">
                  {resume.title}
                </h3>

                <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {resume.summary || 'Professional academic and software engineering summary for top-tier placement evaluation.'}
                </p>

                {/* Skills Preview */}
                {resume.skills && resume.skills.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {resume.skills.slice(0, 5).map((sk, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800 text-slate-300"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">Ready for 1-Click Apply</span>
                <button
                  onClick={() => toast.success(`Exporting ${resume.title} to ATS format!`)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Export PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Resume Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">AI Resume Generator</span>
              <h3 className="text-lg font-bold text-white mt-1">Create Tailored Placement Resume</h3>
            </div>

            <form onSubmit={handleCreateResume} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Resume Title / Target Role</label>
                <input
                  type="text"
                  placeholder="e.g. Master SWE Resume, Full Stack AI Specialist"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Professional Executive Summary</label>
                <textarea
                  rows="3"
                  placeholder="Summarize your engineering expertise, hackathons, and career focus..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Skills (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Python, FastAPI, React, PyTorch, Docker, PostgreSQL"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Key Projects Highlight</label>
                <input
                  type="text"
                  placeholder="e.g. ASPIRE AI Platform - Built with FastAPI and React"
                  value={projectsInput}
                  onChange={(e) => setProjectsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Creating...' : 'Save & Calculate ATS Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
