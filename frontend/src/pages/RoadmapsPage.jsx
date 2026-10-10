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

  const completedStepsCount = selectedRoadmap.steps.filter((s) => s.completed).length;
  const totalStepsCount = selectedRoadmap.steps.length;
  const progressPercentage = Math.round((completedStepsCount / totalStepsCount) * 100);

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 text-slate-800 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner */}
        <div className="rounded-3xl p-8 bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5" />
                Structured Milestone Curricula
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Remedial & Career Learning Roadmaps
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm max-w-2xl font-normal">
                Follow curated weekly modules with authoritative documentation, hands-on tasks, and real-time progress checkoffs.
              </p>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
              <div className="text-xl font-extrabold text-blue-700">{roadmaps.length}</div>
              <div className="text-[10px] text-blue-600 font-bold uppercase">Enrolled Paths</div>
            </div>
          </div>

          {/* Roadmap Selector Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            {roadmaps.map((rm) => {
              const isSelected = (rm.id || rm._id) === (selectedRoadmap.id || selectedRoadmap._id);
              return (
                <button
                  key={rm.id || rm._id}
                  onClick={() => setSelectedRoadmap(rm)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  {rm.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Summary & Progress Meter */}
          <div className="card-3d p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Curriculum Overview</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedRoadmap.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {selectedRoadmap.description}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Completion Milestone</span>
                <span className="text-blue-600">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-500">
                {completedStepsCount} of {totalStepsCount} modules completed
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Estimated Duration: <strong className="text-slate-800">{selectedRoadmap.duration_weeks || 4} Weeks</strong>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                Verified Certificate upon module completion
              </div>
            </div>
          </div>

          {/* Right 2 Cols: Step-by-Step Milestones */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Learning Modules & Action Items
            </h3>

            <div className="space-y-3.5">
              {selectedRoadmap.steps.map((step, idx) => (
                <div
                  key={step.id || idx}
                  className={`p-6 rounded-3xl border transition space-y-3 bg-white ${
                    step.completed
                      ? 'border-emerald-200 shadow-xs'
                      : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleStepCompletion(step.id)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 transition"
                        title="Toggle completion status"
                      >
                        {step.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                        )}
                      </button>
                      <div>
                        <h4 className={`text-sm font-bold transition ${
                          step.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}>
                          {step.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                      step.completed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {step.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>

                  {step.resource_url && (
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Curated Reference:</span>
                      <a
                        href={step.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
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
