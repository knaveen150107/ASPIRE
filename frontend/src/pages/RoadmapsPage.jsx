import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ExternalLink, 
  Play, 
  Layers, 
  Award, 
  Clock, 
  ChevronRight, 
  TrendingUp,
  Plus
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
        title: 'Week 3: Modern React State, Vite & Glassmorphic Design',
        description: 'Build responsive web apps with Tailwind CSS, custom contexts, and optimistic UI updates.',
        resource_url: 'https://react.dev',
        resource_label: 'React 19 Documentation',
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

  const toggleStepCompletion = async (stepId) => {
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

  const completedStepsCount = selectedRoadmap.steps.filter((s) => s.completed).length;
  const totalStepsCount = selectedRoadmap.steps.length;
  const progressPercentage = Math.round((completedStepsCount / totalStepsCount) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Structured Milestone Roadmaps
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Remedial & Career Learning Paths
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Follow curated weekly modules with authoritative documentation, hands-on tasks, and real-time progress checkoffs.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
              <div className="text-2xl font-extrabold text-white">{roadmaps.length}</div>
              <div className="text-[11px] text-slate-400">Enrolled Paths</div>
            </div>
          </div>
        </div>

        {/* Roadmap Selector Tabs */}
        <div className="mt-8 flex flex-wrap gap-3">
          {roadmaps.map((rm) => {
            const isSelected = (rm.id || rm._id) === (selectedRoadmap.id || selectedRoadmap._id);
            return (
              <button
                key={rm.id || rm._id}
                onClick={() => setSelectedRoadmap(rm)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                <Layers className="w-4 h-4" />
                {rm.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Roadmap Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Summary & Progress Meter */}
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Curriculum Overview</span>
            <h3 className="text-xl font-bold text-white mt-1">{selectedRoadmap.title}</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {selectedRoadmap.description}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300">Completion Milestone</span>
              <span className="text-indigo-400">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400">
              {completedStepsCount} of {totalStepsCount} modules completed
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Estimated Duration: <strong className="text-white">{selectedRoadmap.duration_weeks || 4} Weeks</strong>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              Verified Certificate upon completion
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Step-by-Step Milestones */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Learning Modules & Action Items
          </h3>

          <div className="space-y-4">
            {selectedRoadmap.steps.map((step, idx) => (
              <div
                key={step.id || idx}
                className={`p-6 rounded-3xl border backdrop-blur-md transition space-y-4 ${
                  step.completed
                    ? 'bg-slate-900/40 border-emerald-500/30'
                    : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStepCompletion(step.id)}
                      className="mt-0.5 text-slate-500 hover:text-emerald-400 transition"
                      title="Toggle completion status"
                    >
                      {step.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>
                    <div>
                      <h4 className={`text-base font-bold transition ${
                        step.completed ? 'line-through text-slate-400' : 'text-white'
                      }`}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    step.completed
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {step.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>

                {step.resource_url && (
                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">Curated Reference Blueprint:</span>
                    <a
                      href={step.resource_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
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
  );
}
