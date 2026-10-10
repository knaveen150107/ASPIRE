import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ExternalLink, 
  Layers, 
  Award, 
  Clock 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEFAULT_ROADMAPS = [
  {
    id: 'ai_llm_roadmap',
    title: 'Generative AI & Agentic Systems Mastery',
    category: 'AI / Machine Learning',
    duration_weeks: 6,
    description: 'Master prompt engineering, embeddings, vector indexing, RAG pipelines, and autonomous agent orchestration.',
    steps: [
      {
        id: 's1',
        title: 'Week 1: Vector Embeddings & Similarity Search',
        description: 'Understand high-dimensional math, cosine similarity, and implement Pinecone/ChromaDB indexing.',
        resource_url: 'https://huggingface.co/blog/getting-started-with-embeddings',
        resource_label: 'Hugging Face Guide',
        completed: true
      },
      {
        id: 's2',
        title: 'Week 2: Advanced RAG with Hybrid Search & Reranking',
        description: 'Build production retrieval pipelines combining BM25 keyword matching with cross-encoder neural rerankers.',
        resource_url: 'https://python.langchain.com/docs/use_cases/question_answering/',
        resource_label: 'RAG Architecture Best Practices',
        completed: true
      },
      {
        id: 's3',
        title: 'Week 3: Tool Calling & Autonomous Agent Loops',
        description: 'Implement structured output schemas, JSON function calling, and deterministic tool execution.',
        resource_url: 'https://ai.google.dev/docs/function_calling',
        resource_label: 'Interactions & Function Calling API',
        completed: false
      },
      {
        id: 's4',
        title: 'Week 4: Model Evaluation & Latency Optimization',
        description: 'Benchmark context window costs, implement response caching, and track hallucination rates.',
        resource_url: 'https://github.com',
        resource_label: 'LLM Evaluation Harness',
        completed: false
      }
    ]
  },
  {
    id: 'fullstack_roadmap',
    title: 'Distributed Full Stack & FastAPI Architecture',
    category: 'Software Engineering',
    duration_weeks: 5,
    description: 'Design production-grade React frontends with asynchronous Python backends and MongoDB transactions.',
    steps: [
      {
        id: 'f1',
        title: 'Week 1: Asynchronous FastAPI & Dependency Injection',
        description: 'Master async/await endpoints, custom middleware, and JWT authentication flows.',
        resource_url: 'https://fastapi.tiangolo.com/tutorial/',
        resource_label: 'FastAPI Official Documentation',
        completed: true
      },
      {
        id: 'f2',
        title: 'Week 2: MongoDB Atlas Indexes & Schema Constraints',
        description: 'Implement compound indexes, strict $jsonSchema validators, and atomic ACID operations.',
        resource_url: 'https://www.mongodb.com/docs/manual/core/schema-validation/',
        resource_label: 'MongoDB Schema Design',
        completed: false
      },
      {
        id: 'f3',
        title: 'Week 3: Modern React State, Vite & SaaS Design',
        description: 'Build responsive web apps with Tailwind CSS, custom contexts, and optimistic UI updates.',
        resource_url: 'https://react.dev',
        resource_label: 'React Documentation',
        completed: false
      }
    ]
  }
];

export default function RoadmapsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [roadmaps, setRoadmaps] = useState(DEFAULT_ROADMAPS);
  const [selectedRoadmap, setSelectedRoadmap] = useState(DEFAULT_ROADMAPS[0]);
  const [loading, setLoading] = useState(false);

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [genForm, setGenForm] = useState({
    targetRole: 'AI / Machine Learning Engineer',
    targetCompany: 'Google',
    weeks: 6,
    missingSkills: 'System Design, Vector Databases, Docker, PyTorch'
  });

  useEffect(() => {
    loadUserRoadmaps();
  }, [user]);

  const loadUserRoadmaps = async () => {
    try {
      setLoading(true);
      const res = await api.getMyRoadmaps();
      if (res && res.length > 0) {
        setRoadmaps(res);
        setSelectedRoadmap(res[0]);
      }
    } catch (err) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAiRoadmap = async (e) => {
    e.preventDefault();
    if (!genForm.targetRole.trim()) return;
    setGeneratingRoadmap(true);

    try {
      const skillsArray = genForm.missingSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const aiRes = await api.generateAiRoadmap(
        genForm.targetRole,
        genForm.targetCompany,
        skillsArray,
        Number(genForm.weeks) || 6
      );

      // Convert AI modules into roadmap format
      const formattedSteps = (aiRes.modules || []).map((m, idx) => ({
        id: `gen_step_${idx + 1}`,
        title: m.title || `Week ${m.week_number}`,
        description: (m.topics || []).map((t) => `${t.name}: ${t.description}`).join(' • ') || (m.milestone_project || 'Master core concepts'),
        resource_url: m.topics?.[0]?.resource_links?.[0]?.url || 'https://roadmap.sh',
        resource_label: m.topics?.[0]?.resource_links?.[0]?.title || 'Curated Documentation',
        completed: false,
      }));

      const newRoadmap = {
        id: `ai_rm_${Date.now()}`,
        title: `${aiRes.role_title} (${aiRes.target_company})`,
        category: 'AI Tailored Curriculum',
        duration_weeks: aiRes.estimated_duration_weeks || 6,
        description: aiRes.summary,
        steps: formattedSteps,
      };

      setRoadmaps((prev) => [newRoadmap, ...prev]);
      setSelectedRoadmap(newRoadmap);
      setIsGenerateModalOpen(false);
      toast.success(`AI Roadmap for "${genForm.targetRole}" generated successfully!`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate AI roadmap');
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const toggleStepCompletion = (stepId) => {
    const updatedRoadmaps = roadmaps.map((rm) => {
      if (rm.id === selectedRoadmap.id || rm._id === selectedRoadmap._id) {
        const updatedSteps = rm.steps.map((st) => {
          if (st.id === stepId) {
            return { ...st, completed: !st.completed };
          }
          return st;
        });
        return { ...rm, steps: updatedSteps };
      }
      return rm;
    });

    setRoadmaps(updatedRoadmaps);
    const updatedSelected = updatedRoadmaps.find(
      (r) => r.id === selectedRoadmap.id || r._id === selectedRoadmap._id
    );
    setSelectedRoadmap(updatedSelected);
    toast.success('Roadmap milestone progress saved!');
  };

  const completedStepsCount = (selectedRoadmap?.steps || []).filter((s) => s.completed).length;
  const totalStepsCount = selectedRoadmap?.steps?.length || 1;
  const progressPercentage = Math.round((completedStepsCount / totalStepsCount) * 100);

  return (
    <div className="bg-[#f8fafc] dark:bg-[#090d16] min-h-screen py-8 text-slate-800 dark:text-slate-100 animate-fade-in transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner */}
        <div className="rounded-3xl p-8 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Sparkles className="w-3.5 h-3.5" />
                Structured Milestone Curricula
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Remedial & Career Learning Roadmaps
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl font-normal">
                Follow curated weekly modules with authoritative documentation, hands-on tasks, and real-time progress checkoffs.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsGenerateModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center gap-2 transition transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Custom Roadmap</span>
              </button>

              <div className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-center">
                <div className="text-xl font-extrabold text-blue-700 dark:text-blue-300">{roadmaps.length}</div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">Enrolled Paths</div>
              </div>
            </div>
          </div>

          {/* Roadmap Selector Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            {roadmaps.map((rm) => {
              const isSelected = (rm.id || rm._id) === (selectedRoadmap?.id || selectedRoadmap?._id);
              return (
                <button
                  key={rm.id || rm._id}
                  onClick={() => setSelectedRoadmap(rm)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  {rm.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal: AI Roadmap Generator */}
        {isGenerateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Custom Roadmap Generator</h3>
                    <p className="text-[11px] text-slate-400">Powered by Gemini Multi-Agent Curriculum Engine</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleGenerateAiRoadmap} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Job Role</label>
                  <input
                    type="text"
                    required
                    value={genForm.targetRole}
                    onChange={(e) => setGenForm({ ...genForm, targetRole: e.target.value })}
                    placeholder="e.g. AI / ML Engineer, Full Stack Architect, Quant Trader"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Company (Any Company / Startup)</label>
                  <input
                    type="text"
                    value={genForm.targetCompany}
                    onChange={(e) => setGenForm({ ...genForm, targetCompany: e.target.value })}
                    placeholder="e.g. Zoho, Swiggy, TCS, Razorpay, Startup, or any custom company"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['Zoho', 'Swiggy', 'Razorpay', 'TCS', 'Infosys', 'Freshworks', 'Zerodha', 'Amazon', 'Google', 'Fintech Startup', 'Product Startup'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setGenForm({ ...genForm, targetCompany: c })}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition ${
                          genForm.targetCompany === c
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Duration</label>
                  <select
                    value={genForm.weeks}
                    onChange={(e) => setGenForm({ ...genForm, weeks: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="4">4 Weeks (Intensive Sprint)</option>
                    <option value="6">6 Weeks (Standard Track)</option>
                    <option value="8">8 Weeks (Comprehensive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Skills to Focus On (comma-separated)</label>
                  <input
                    type="text"
                    value={genForm.missingSkills}
                    onChange={(e) => setGenForm({ ...genForm, missingSkills: e.target.value })}
                    placeholder="e.g. Docker, PyTorch, System Design, Graph Algorithms"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsGenerateModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={generatingRoadmap}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${generatingRoadmap ? 'animate-spin' : ''}`} />
                    <span>{generatingRoadmap ? 'Synthesizing Curriculum...' : 'Generate AI Roadmap'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Summary & Progress Meter */}
          <div className="card-3d p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6 transition-colors">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Curriculum Overview</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{selectedRoadmap.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                {selectedRoadmap.description}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">Completion Milestone</span>
                <span className="text-blue-600 dark:text-blue-400">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {completedStepsCount} of {totalStepsCount} modules completed
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Estimated Duration: <strong className="text-slate-800 dark:text-slate-200">{selectedRoadmap.duration_weeks || 4} Weeks</strong>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Verified Certificate upon module completion
              </div>
            </div>
          </div>

          {/* Right 2 Cols: Step-by-Step Milestones */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Learning Modules & Action Items
            </h3>

            <div className="space-y-3.5">
              {selectedRoadmap.steps.map((step, idx) => (
                <div
                  key={step.id || idx}
                  className={`p-6 rounded-3xl border transition space-y-3 bg-white dark:bg-slate-900/90 ${
                    step.completed
                      ? 'border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                      : 'border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleStepCompletion(step.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                        title="Toggle completion status"
                      >
                        {step.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                        )}
                      </button>
                      <div>
                        <h4 className={`text-sm font-bold transition ${
                          step.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                        }`}>
                          {step.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      step.completed
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {step.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>

                  {step.resource_url && (
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">Curated Reference:</span>
                      <a
                        href={step.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition"
                      >
                        {step.resource_label || 'Read Blueprint'} <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
