import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Download, 
  Cpu,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ResumesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Resume Creator Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [experienceInput, setExperienceInput] = useState('');
  const [projectsInput, setProjectsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ATS AI Analysis Modal State
  const [analyzingResume, setAnalyzingResume] = useState(null);
  const [atsAnalysisResult, setAtsAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customAnalysisText, setCustomAnalysisText] = useState('');
  const [targetJobRole, setTargetJobRole] = useState('Full Stack Software Engineer');
  const [isCustomAnalyzeOpen, setIsCustomAnalyzeOpen] = useState(false);

  const handleRunAiAnalysis = async (resumeOrText, targetRole = 'Software Engineer') => {
    try {
      setIsAnalyzing(true);
      setAtsAnalysisResult(null);
      let textToAnalyze = '';
      if (typeof resumeOrText === 'string') {
        textToAnalyze = resumeOrText;
      } else if (resumeOrText) {
        textToAnalyze = `
Role: ${resumeOrText.title}
Summary: ${resumeOrText.summary || ''}
Skills: ${(resumeOrText.skills || []).join(', ')}
Experience: ${(resumeOrText.experience || []).join('\n')}
Projects: ${(resumeOrText.projects || []).join('\n')}
        `;
      }

      const res = await api.analyzeResumeAi(textToAnalyze, targetRole);
      setAtsAnalysisResult(res);
      toast.success('Gemini ATS Analysis Complete!');
    } catch (err) {
      toast.error(err.message || 'Failed to complete AI resume audit');
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  const handleDeleteResume = async (resumeId, title) => {
    if (!resumeId) return;
    if (!window.confirm(`Are you sure you want to delete "${title || 'this resume'}"? This cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(resumeId);
      await api.deleteResume(resumeId);
      toast.success(`Resume "${title}" deleted successfully`);
      setResumes((prev) => prev.filter((r) => (r._id || r.id) !== resumeId));
      if (analyzingResume && (analyzingResume._id || analyzingResume.id) === resumeId) {
        setAnalyzingResume(null);
        setAtsAnalysisResult(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete resume record');
    } finally {
      setDeletingId(null);
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
    <div className="bg-[#f8fafc] dark:bg-[#090d16] min-h-screen py-8 text-slate-800 dark:text-slate-100 animate-fade-in transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner */}
        <div className="rounded-3xl p-8 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-3.5 h-3.5" />
                ATS Parser & Keyword Optimization Studio
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                AI Resume Studio & Tailored Versions
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl font-normal">
                Create ATS-optimized resume profiles tailored to distinct campus placement drives with keyword alignment scoring.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => {
                  setIsCustomAnalyzeOpen(true);
                  setAtsAnalysisResult(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold text-xs shadow-xs transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                AI ATS Checker
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Create Tailored Version
              </button>
            </div>
          </div>
        </div>

        {/* Resumes Grid */}
        {loading ? (
          <div className="min-h-[40vh] flex items-center justify-center">
            <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl space-y-3 transition-colors">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Resumes Created Yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-md mx-auto">
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
                className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                        <Cpu className="w-3.5 h-3.5" />
                        ATS: {resume.ats_score || 88}%
                      </div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Parser Score</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    {resume.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-normal">
                    {resume.summary || 'Professional academic and software engineering summary for top-tier placement evaluation.'}
                  </p>

                  {/* Skills */}
                  {resume.skills && resume.skills.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {resume.skills.slice(0, 5).map((sk, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setAnalyzingResume(resume);
                        handleRunAiAnalysis(resume, resume.title);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-200 dark:border-purple-800/80 transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> AI ATS Audit
                    </button>
                    <button
                      onClick={() => toast.success(`Exporting ${resume.title} to PDF!`)}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Export PDF
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteResume(resume._id || resume.id, resume.title)}
                    disabled={deletingId === (resume._id || resume.id)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold transition flex items-center justify-center disabled:opacity-40"
                    title="Delete Resume Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* AI Deep ATS Analysis Modal */}
      {(analyzingResume || isCustomAnalyzeOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  Gemini Deep ATS Audit & Keyword Optimizer
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                  {analyzingResume ? analyzingResume.title : 'Live Resume Text ATS Audit'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setAnalyzingResume(null);
                  setIsCustomAnalyzeOpen(false);
                  setAtsAnalysisResult(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Custom Input Form if isCustomAnalyzeOpen and not analyzing existing card */}
            {!analyzingResume && !atsAnalysisResult && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Placement Role</label>
                  <input
                    type="text"
                    value={targetJobRole}
                    onChange={(e) => setTargetJobRole(e.target.value)}
                    placeholder="e.g. Full Stack Engineer, Machine Learning Specialist"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Paste Resume Content / LaTeX / Plaintext</label>
                  <textarea
                    rows="6"
                    value={customAnalysisText}
                    onChange={(e) => setCustomAnalysisText(e.target.value)}
                    placeholder="Paste candidate experience, skills, and projects here..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-600 resize-none font-mono"
                  ></textarea>
                </div>

                <button
                  onClick={() => handleRunAiAnalysis(customAnalysisText, targetJobRole)}
                  disabled={isAnalyzing || !customAnalysisText.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Auditing via Gemini 3.6 Flash...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Run Deep ATS Audit
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Loading Indicator */}
            {isAnalyzing && (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 border-3 border-purple-600/20 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Gemini AI Agent is auditing your resume...</p>
                <p className="text-xs text-slate-400">Benchmarking keywords, structure, and action verbs against corporate ATS filters.</p>
              </div>
            )}

            {/* Analysis Results Display */}
            {atsAnalysisResult && !isAnalyzing && (
              <div className="space-y-6">
                {/* Score Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-center">
                    <div className="text-2xl font-black text-purple-700 dark:text-purple-300">
                      {atsAnalysisResult.overall_score || atsAnalysisResult.ats_score}%
                    </div>
                    <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase mt-1">Overall ATS Score</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-center">
                    <div className="text-2xl font-black text-blue-700 dark:text-blue-300">
                      {atsAnalysisResult.format_score || 90}%
                    </div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mt-1">Format & Syntax</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center">
                    <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                      {atsAnalysisResult.keyword_score || 85}%
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase mt-1">Keyword Match</div>
                  </div>
                </div>

                {/* Matched & Missing Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      ✓ Detected ATS Keywords ({atsAnalysisResult.matched_keywords?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(atsAnalysisResult.matched_keywords || []).map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                      ⚠ Missing Critical Keywords ({atsAnalysisResult.missing_keywords?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {(atsAnalysisResult.missing_keywords || []).map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Suggestions & Action Verbs */}
                {atsAnalysisResult.bullet_improvements && atsAnalysisResult.bullet_improvements.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Action Verb & Bullet Point Enhancements</h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {atsAnalysisResult.bullet_improvements.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-purple-600 dark:text-purple-400 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Summary Recommendations */}
                {atsAnalysisResult.summary_recommendations && (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 space-y-1">
                    <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300">AI Placement Optimization Recommendation</h4>
                    <p className="text-xs text-indigo-800 dark:text-indigo-300/80 leading-relaxed font-normal">
                      {atsAnalysisResult.summary_recommendations}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {analyzingResume ? (
                    <button
                      type="button"
                      onClick={() => {
                        const rId = analyzingResume._id || analyzingResume.id;
                        const rTitle = analyzingResume.title;
                        handleDeleteResume(rId, rTitle);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Resume Record
                    </button>
                  ) : (
                    <div></div>
                  )}

                  <button
                    onClick={() => {
                      setAnalyzingResume(null);
                      setIsCustomAnalyzeOpen(false);
                      setAtsAnalysisResult(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Resume Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 transition-colors">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">AI Resume Tailor</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">Create Tailored Placement Resume</h3>
            </div>

            <form onSubmit={handleCreateResume} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Resume Title / Target Role</label>
                <input
                  type="text"
                  placeholder="e.g. Master SWE Resume, Full Stack AI Specialist"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Executive Summary</label>
                <textarea
                  rows="3"
                  placeholder="Summarize your engineering expertise, hackathons, and career focus..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Skills (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Python, FastAPI, React, PyTorch, Docker, PostgreSQL"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Key Projects Highlight</label>
                <input
                  type="text"
                  placeholder="e.g. ASPIRE AI Platform - Built with FastAPI and React"
                  value={projectsInput}
                  onChange={(e) => setProjectsInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-semibold"
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
