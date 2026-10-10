import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  BrainCircuit, 
  Sparkles, 
  Zap, 
  BarChart3, 
  Check, 
  X,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Trash2,
  Eye,
  Calendar,
  RotateCcw,
  Target,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SAMPLE_ASSESSMENTS = [
  {
    id: 'dsa_core',
    title: 'Data Structures & Algorithms Diagnostic',
    company_name: 'General Assessment',
    category: 'technical',
    duration_mins: 15,
    difficulty: 'intermediate',
    questions: [
      {
        id: 1,
        question: 'What is the worst-case time complexity of searching in a Balanced Binary Search Tree (AVL / Red-Black)?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correct_answer: 'O(log n)',
        explanation: 'Balanced BSTs maintain a maximum height of O(log n), guaranteeing logarithmic lookup time.',
        topic: 'Data Structures'
      },
      {
        id: 2,
        question: 'Which algorithmic paradigm does Dijkstra’s Single-Source Shortest Path algorithm follow?',
        options: ['Dynamic Programming', 'Greedy Method', 'Divide and Conquer', 'Backtracking'],
        correct_answer: 'Greedy Method',
        explanation: 'Dijkstra greedily chooses the unvisited vertex with the minimum distance at each step.',
        topic: 'Algorithms'
      },
      {
        id: 3,
        question: 'In Python, what is the average time complexity of dictionary lookup?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(k)'],
        correct_answer: 'O(1)',
        explanation: 'Python dictionaries are implemented via hash tables, giving average O(1) key access.',
        topic: 'Python Internals'
      },
      {
        id: 4,
        question: 'What happens when two distinct keys produce the same hash index in a hash map?',
        options: ['Memory Overflow', 'Collision', 'Segmentation Fault', 'Automatic Key Overwrite'],
        correct_answer: 'Collision',
        explanation: 'A collision occurs when hash(k1) == hash(k2). It is resolved by chaining or open addressing.',
        topic: 'Data Structures'
      },
      {
        id: 5,
        question: 'Which of the following sorting algorithms is stable and has O(n log n) worst-case complexity?',
        options: ['QuickSort', 'HeapSort', 'MergeSort', 'SelectionSort'],
        correct_answer: 'MergeSort',
        explanation: 'MergeSort is both stable and guarantees O(n log n) time across best, average, and worst cases.',
        topic: 'Algorithms'
      }
    ]
  },
  {
    id: 'quant_aptitude',
    title: 'Quantitative Aptitude & Placement Logic',
    company_name: 'Campus Aptitude',
    category: 'aptitude',
    duration_mins: 10,
    difficulty: 'standard',
    questions: [
      {
        id: 1,
        question: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
        options: ['65 sec', '89 sec', '72 sec', '100 sec'],
        correct_answer: '89 sec',
        explanation: 'Speed = 240/24 = 10 m/s. Total distance for platform = 240 + 650 = 890 m. Time = 890 / 10 = 89 sec.',
        topic: 'Time & Distance'
      },
      {
        id: 2,
        question: 'If A and B can do a piece of work in 12 days, B and C in 15 days, C and A in 20 days. How long will A take alone?',
        options: ['30 days', '40 days', '20 days', '60 days'],
        correct_answer: '30 days',
        explanation: 'Work rates: 2(A+B+C) = 1/12 + 1/15 + 1/20 = 12/60 = 1/5 => A+B+C = 1/10. A alone = 1/10 - 1/15 = 1/30 (30 days).',
        topic: 'Work & Efficiency'
      },
      {
        id: 3,
        question: 'What is the next number in the series: 4, 18, 48, 100, 180, ?',
        options: ['294', '280', '312', '248'],
        correct_answer: '294',
        explanation: 'Pattern is n^3 - n^2: 2^3-4=4, 3^3-9=18, 4^3-16=48, 5^3-25=100, 6^3-36=180, 7^3-49=294.',
        topic: 'Number Series'
      }
    ]
  },
  {
    id: 'ai_system_design',
    title: 'AI & Distributed Backend Architecture',
    company_name: 'Tech Enterprise',
    category: 'technical',
    duration_mins: 15,
    difficulty: 'advanced',
    questions: [
      {
        id: 1,
        question: 'Which protocol is most appropriate for real-time bidirectional streaming of live LLM voice tokens?',
        options: ['HTTP 1.1 Polling', 'WebSockets', 'SMTP', 'SOAP'],
        correct_answer: 'WebSockets',
        explanation: 'WebSockets provide full-duplex, low-latency persistent streaming channels ideal for bidirectional audio/tokens.',
        topic: 'System Architecture'
      },
      {
        id: 2,
        question: 'In MongoDB, which index type optimizes geospatial proximity queries?',
        options: ['2dsphere', 'Hashed', 'Text', 'Sparse'],
        correct_answer: '2dsphere',
        explanation: '2dsphere indexes support queries that calculate geometries on an earth-like sphere.',
        topic: 'Database Engineering'
      },
      {
        id: 3,
        question: 'What is the primary role of Vector Embeddings in RAG (Retrieval-Augmented Generation)?',
        options: ['Data compression', 'Semantic similarity search', 'Password encryption', 'Schema validation'],
        correct_answer: 'Semantic similarity search',
        explanation: 'Vector embeddings map text to high-dimensional space where cosine similarity captures semantic meaning.',
        topic: 'AI Systems'
      }
    ]
  }
];

export default function MockTestsPage() {
  const { user } = useAuth();
  const toast = useToast();
  
  // Test State
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testResult, setTestResult] = useState(null);
  const [isTestActive, setIsTestActive] = useState(false);

  // Active Job Openings from Jobs section
  const [jobDrives, setJobDrives] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Past test history
  const [pastTests, setPastTests] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedScorecard, setSelectedScorecard] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // AI Dynamic Generator State
  const [isAiGenModalOpen, setIsAiGenModalOpen] = useState(false);
  const [generatingAiTest, setGeneratingAiTest] = useState(false);
  const [aiGenForm, setAiGenForm] = useState({
    companyName: 'Zoho',
    roleTitle: 'Software Development Engineer',
    category: 'DSA & Problem Solving',
    difficulty: 'medium',
    numQuestions: 5,
  });

  useEffect(() => {
    loadTestHistory();
    loadJobDrives();
  }, []);

  const loadJobDrives = async () => {
    try {
      setLoadingJobs(true);
      const res = await api.getJobs();
      const list = res?.data || res || [];
      setJobDrives(list);
    } catch (err) {
      // ignore
    } finally {
      setLoadingJobs(false);
    }
  };

  const openAiGenForJob = (job) => {
    const comp = job.company_name || 'Tech Company';
    const title = job.title || 'Software Engineer';
    const skills = job.required_skills || [];
    
    let suggestedCat = 'DSA & Problem Solving';
    if (skills.some(s => String(s).toLowerCase().includes('design') || String(s).toLowerCase().includes('cloud') || String(s).toLowerCase().includes('system'))) {
      suggestedCat = 'System Design & Cloud Architecture';
    } else if (skills.some(s => String(s).toLowerCase().includes('sql') || String(s).toLowerCase().includes('database') || String(s).toLowerCase().includes('mongo'))) {
      suggestedCat = 'Databases & SQL Mastery';
    } else if (skills.some(s => String(s).toLowerCase().includes('ai') || String(s).toLowerCase().includes('ml') || String(s).toLowerCase().includes('python') || String(s).toLowerCase().includes('nlp'))) {
      suggestedCat = 'AI, ML & Deep Learning';
    }

    setAiGenForm({
      companyName: comp,
      roleTitle: title,
      category: suggestedCat,
      difficulty: 'medium',
      numQuestions: 5,
    });
    setIsAiGenModalOpen(true);
  };

  // Timer Effect
  useEffect(() => {
    let timer;
    if (isTestActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestActive, timeLeft]);

  const loadTestHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.getMyMockTests();
      setPastTests(res || []);
    } catch (err) {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteTest = async (testId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this test performance record?')) return;
    try {
      setDeletingId(testId);
      await api.deleteMockTest(testId);
      setPastTests((prev) => prev.filter((t) => (t.id || t._id) !== testId));
      if (selectedScorecard && (selectedScorecard.id === testId || selectedScorecard._id === testId)) {
        setSelectedScorecard(null);
      }
      toast.success('Test performance record removed.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete test record');
    } finally {
      setDeletingId(null);
    }
  };

  // Performance Aggregate Statistics
  const historyStats = useMemo(() => {
    const validScores = pastTests
      .map((t) => (t.percentage !== undefined && t.percentage !== null ? Number(t.percentage) : Number(t.score)))
      .filter((s) => !isNaN(s));

    const totalTests = pastTests.length;
    if (totalTests === 0 || validScores.length === 0) {
      return { total: 0, avgScore: 0, passCount: 0, passRate: 0, highestScore: 0 };
    }

    const sum = validScores.reduce((acc, s) => acc + s, 0);
    const avgScore = Math.round(sum / validScores.length);
    const passCount = validScores.filter((s) => s >= 70).length;
    const passRate = Math.round((passCount / validScores.length) * 100);
    const highestScore = Math.max(...validScores);

    return { total: totalTests, avgScore, passCount, passRate, highestScore };
  }, [pastTests]);

  const handleGenerateAiTest = async (e) => {
    e.preventDefault();
    setGeneratingAiTest(true);
    try {
      const res = await api.generateAiMockTest(
        aiGenForm.companyName,
        aiGenForm.roleTitle,
        aiGenForm.category,
        aiGenForm.difficulty,
        Number(aiGenForm.numQuestions) || 5
      );

      // Convert generated questions into test format
      const formattedQuestions = (res.questions || []).map((q, idx) => {
        const correctOpt = q.options?.find((o) => o.id === q.correct_option_id);
        return {
          id: idx + 1,
          question: q.question_text,
          options: (q.options || []).map((o) => o.text),
          correct_answer: correctOpt ? correctOpt.text : (q.options?.[0]?.text || ''),
          explanation: q.explanation,
          topic: q.category || aiGenForm.category,
        };
      });

      const dynamicAssessment = {
        id: `ai_gen_${Date.now()}`,
        title: res.title || `${aiGenForm.companyName} Technical Assessment`,
        company_name: aiGenForm.companyName,
        category: aiGenForm.category || 'technical',
        duration_mins: res.duration_minutes || 15,
        difficulty: aiGenForm.difficulty,
        questions: formattedQuestions,
      };

      setIsAiGenModalOpen(false);
      startAssessment(dynamicAssessment);
      toast.success(`Generated ${formattedQuestions.length} questions for ${aiGenForm.companyName}!`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate AI questions');
    } finally {
      setGeneratingAiTest(false);
    }
  };

  const startAssessment = (assessment) => {
    setActiveAssessment(assessment);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setTimeLeft(assessment.duration_mins * 60);
    setTestResult(null);
    setIsTestActive(true);
  };

  const handleSelectOption = (questionId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: option
    }));
  };

  const handleSubmitTest = async () => {
    if (!activeAssessment) return;
    setIsTestActive(false);

    let correctCount = 0;
    const topicBreakdown = {};
    const detailedFeedback = activeAssessment.questions.map((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) correctCount++;

      const t = q.topic || 'General';
      if (!topicBreakdown[t]) {
        topicBreakdown[t] = { correct: 0, total: 0 };
      }
      topicBreakdown[t].total += 1;
      if (isCorrect) topicBreakdown[t].correct += 1;

      return {
        question: q.question,
        topic: q.topic,
        selected_option: selected || 'Not Answered',
        correct_option: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation,
      };
    });

    const totalQuestions = activeAssessment.questions.length;
    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const compName = activeAssessment.company_name || (activeAssessment.title?.includes('Assessment') ? activeAssessment.title.split(' ')[0] : 'General Assessment');

    // Generate diagnostic feedback
    let diagnosticSummary = '';
    if (scorePercentage >= 80) {
      diagnosticSummary = `Exceptional performance! High competency demonstrated across ${activeAssessment.category || 'technical'} interview requirements.`;
    } else if (scorePercentage >= 60) {
      diagnosticSummary = `Good foundational score. Recommended to review weaker topics before technical rounds.`;
    } else {
      diagnosticSummary = `Needs focused revision in ${activeAssessment.category || 'core areas'}. Review question explanations and retake the test.`;
    }

    const resultObj = {
      score: scorePercentage,
      percentage: scorePercentage,
      correct: correctCount,
      correct_count: correctCount,
      total: totalQuestions,
      total_questions: totalQuestions,
      topicBreakdown,
      topic_scores: topicBreakdown,
      detailedFeedback,
      detailed_feedback: detailedFeedback,
      assessmentTitle: activeAssessment.title,
      company_name: compName,
      category: activeAssessment.category,
      difficulty: activeAssessment.difficulty,
      ai_feedback: diagnosticSummary,
      created_at: new Date().toISOString(),
    };

    setTestResult(resultObj);

    try {
      await api.createMockTest({
        title: activeAssessment.title,
        company_name: compName,
        category: activeAssessment.category || 'technical',
        difficulty: activeAssessment.difficulty || 'intermediate',
        total_questions: totalQuestions,
        score: scorePercentage,
        percentage: scorePercentage,
        correct_count: correctCount,
        status: 'completed',
        topic_scores: topicBreakdown,
        detailed_feedback: detailedFeedback,
        ai_feedback: diagnosticSummary,
      });
      loadTestHistory();
      toast.success(`Assessment saved to performance history! Score: ${scorePercentage}%`);
    } catch (err) {
      console.error('Failed to save mock test performance:', err);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#f8fafc] dark:bg-[#090d16] min-h-screen py-8 text-slate-800 dark:text-slate-100 animate-fade-in transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Active Test Taking View */}
        {isTestActive && activeAssessment ? (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Active Test Header Bar */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeAssessment.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Question {currentQuestionIdx + 1} of {activeAssessment.questions.length} • {activeAssessment.company_name || 'Technical'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold">
                  <Clock className="w-4 h-4" />
                  {formatTime(timeLeft)}
                </div>
                <button
                  onClick={handleSubmitTest}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition"
                >
                  Submit Test
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width: `${((currentQuestionIdx + 1) / activeAssessment.questions.length) * 100}%`
                }}
              ></div>
            </div>

            {/* Question Card */}
            {(() => {
              const q = activeAssessment.questions[currentQuestionIdx];
              return (
                <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-lg space-y-6 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Topic: {q.topic}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Single Choice Question</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                    {q.question}
                  </h2>

                  <div className="space-y-3 pt-2">
                    {q.options.map((option, optIdx) => {
                      const isSelected = answers[q.id] === option;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, option)}
                          className={`w-full p-4 rounded-2xl border text-left font-medium text-sm transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-200 shadow-xs'
                              : 'bg-slate-50/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{option}</span>
                          </div>
                          {isSelected && <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation */}
                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                      disabled={currentQuestionIdx === 0}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold disabled:opacity-40 flex items-center gap-1 transition"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    {currentQuestionIdx < activeAssessment.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center gap-1 transition"
                      >
                        Next Question <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitTest}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1 transition"
                      >
                        Complete Assessment <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : testResult ? (
          /* Live Submitted Scorecard Review View */
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-lg text-center space-y-5 transition-colors">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Performance Diagnostic Card • {testResult.company_name || 'Practice Round'}
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{testResult.assessmentTitle}</h2>
                <div className={`mt-4 text-5xl font-black ${
                  testResult.score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : testResult.score >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {testResult.score}%
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2">
                  You scored <strong className="text-slate-800 dark:text-slate-200">{testResult.correct}</strong> out of <strong className="text-slate-800 dark:text-slate-200">{testResult.total}</strong> questions correctly.
                </p>
                {testResult.ai_feedback && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-200 font-medium max-w-xl mx-auto">
                    <span className="font-bold">AI Diagnostic Insight: </span>{testResult.ai_feedback}
                  </div>
                )}
              </div>

              {/* Topic Breakdown */}
              {testResult.topicBreakdown && Object.keys(testResult.topicBreakdown).length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Topic-Wise Competency Breakdown</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(testResult.topicBreakdown).map(([topic, stats]) => {
                      const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                      return (
                        <div key={topic} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-800 dark:text-slate-200">{topic}</span>
                            <span className={pct >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setTestResult(null)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  Back to Assessments & History
                </button>
              </div>
            </div>

            {/* Questions Detailed Breakdown */}
            {testResult.detailedFeedback && testResult.detailedFeedback.length > 0 && (
              <div className="space-y-3.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Itemized Solutions & Explanations</h3>
                {testResult.detailedFeedback.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl border space-y-3 bg-white dark:bg-slate-900/90 transition-colors ${
                      item.is_correct ? 'border-emerald-200 dark:border-emerald-800/80' : 'border-rose-200 dark:border-rose-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {idx + 1}. {item.question}
                      </h4>
                      {item.is_correct ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Correct
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                          <X className="w-3 h-3" /> Incorrect
                        </span>
                      )}
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="text-slate-600 dark:text-slate-300">
                        Your Answer: <strong className={item.is_correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>{item.selected_option}</strong>
                      </p>
                      {!item.is_correct && (
                        <p className="text-slate-600 dark:text-slate-300">
                          Correct Answer: <strong className="text-emerald-700 dark:text-emerald-400">{item.correct_option}</strong>
                        </p>
                      )}
                    </div>

                    {item.explanation && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                        <span className="font-bold text-blue-700 dark:text-blue-400">Explanation: </span>
                        {item.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Catalog & Historical Performance View */
          <>
            {/* Top Banner */}
            <div className="rounded-3xl p-8 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <Sparkles className="w-3.5 h-3.5" />
                    Adaptive Diagnostic Testing Engine
                  </div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Placement Mock Assessments
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-2xl font-normal">
                    Practice company-specific interview tests, track complete performance history, and analyze topic-wise competency scorecards.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAiGenModalOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center gap-2 transition transform active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Generate Test</span>
                  </button>

                  <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white">{SAMPLE_ASSESSMENTS.length}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Standard Tests</div>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-center">
                    <div className="text-xl font-extrabold text-blue-700 dark:text-blue-300">{pastTests.length}</div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">History Logged</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Analytics Overview Cards */}
            {pastTests.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Attempts</p>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{historyStats.total} Tests</h3>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Score</p>
                    <h3 className={`text-xl font-extrabold ${historyStats.avgScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {historyStats.avgScore}%
                    </h3>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pass Rate (≥70%)</p>
                    <h3 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{historyStats.passRate}% ({historyStats.passCount})</h3>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Best Performance</p>
                    <h3 className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{historyStats.highestScore}%</h3>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: AI Mock Test Generator */}
            {isAiGenModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
                <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Dynamic Mock Test Generator</h3>
                        <p className="text-[11px] text-slate-400">Powered by Google Gemini Assessment Engine</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAiGenModalOpen(false)}
                      className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleGenerateAiTest} className="space-y-3.5">
                    {/* Fast Select from Live Placement Drives */}
                    {jobDrives.length > 0 && (
                      <div className="p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 space-y-1.5">
                        <label className="block text-[11px] font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          Choose from Active Campus Job Drives ({jobDrives.length} Open)
                        </label>
                        <select
                          onChange={(e) => {
                            const selected = jobDrives.find((j) => (j.id || j._id) === e.target.value);
                            if (selected) {
                              const comp = selected.company_name || 'Tech Company';
                              const title = selected.title || 'Software Engineer';
                              const skills = selected.required_skills || [];
                              
                              let suggestedCat = 'DSA & Problem Solving';
                              if (skills.some(s => String(s).toLowerCase().includes('design') || String(s).toLowerCase().includes('cloud') || String(s).toLowerCase().includes('system'))) {
                                suggestedCat = 'System Design & Cloud Architecture';
                              } else if (skills.some(s => String(s).toLowerCase().includes('sql') || String(s).toLowerCase().includes('database') || String(s).toLowerCase().includes('mongo'))) {
                                suggestedCat = 'Databases & SQL Mastery';
                              } else if (skills.some(s => String(s).toLowerCase().includes('ai') || String(s).toLowerCase().includes('ml') || String(s).toLowerCase().includes('python') || String(s).toLowerCase().includes('nlp'))) {
                                suggestedCat = 'AI, ML & Deep Learning';
                              }

                              setAiGenForm({
                                ...aiGenForm,
                                companyName: comp,
                                roleTitle: title,
                                category: suggestedCat,
                              });
                            }
                          }}
                          defaultValue=""
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="" disabled>-- Select a live company drive to auto-configure --</option>
                          {jobDrives.map((j) => (
                            <option key={j.id || j._id} value={j.id || j._id}>
                              {j.company_name} — {j.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Company (Any Company / Startup)</label>
                      <input
                        type="text"
                        required
                        value={aiGenForm.companyName}
                        onChange={(e) => setAiGenForm({ ...aiGenForm, companyName: e.target.value })}
                        placeholder="e.g. Zoho, Swiggy, TCS, Razorpay, Startup, or custom company"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {Array.from(new Set([
                          ...jobDrives.map((j) => j.company_name).filter(Boolean),
                          'Zoho', 'Swiggy', 'Razorpay', 'TCS', 'Infosys', 'Freshworks', 'Zerodha', 'Amazon', 'Google'
                        ])).slice(0, 10).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              const match = jobDrives.find((j) => j.company_name === c);
                              setAiGenForm({
                                ...aiGenForm,
                                companyName: c,
                                roleTitle: match ? match.title : aiGenForm.roleTitle,
                              });
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition ${
                              aiGenForm.companyName === c
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
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Role</label>
                      <input
                        type="text"
                        required
                        value={aiGenForm.roleTitle}
                        onChange={(e) => setAiGenForm({ ...aiGenForm, roleTitle: e.target.value })}
                        placeholder="e.g. Full Stack Developer, SDE-1, Data Analyst"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assessment Category</label>
                        <select
                          value={aiGenForm.category}
                          onChange={(e) => setAiGenForm({ ...aiGenForm, category: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="DSA & Problem Solving">DSA & Problem Solving</option>
                          <option value="System Design & Cloud Architecture">System Design & Cloud Architecture</option>
                          <option value="Databases & SQL Mastery">Databases & SQL Mastery</option>
                          <option value="AI, ML & Deep Learning">AI, ML & Deep Learning</option>
                          <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Difficulty Level</label>
                        <select
                          value={aiGenForm.difficulty}
                          onChange={(e) => setAiGenForm({ ...aiGenForm, difficulty: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="easy">Easy (Entry Foundations)</option>
                          <option value="medium">Medium (Standard Hiring Bar)</option>
                          <option value="hard">Hard (Advanced Competitive)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Number of Questions</label>
                      <select
                        value={aiGenForm.numQuestions}
                        onChange={(e) => setAiGenForm({ ...aiGenForm, numQuestions: Number(e.target.value) })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="3">3 Questions (Speed Quiz • 10m)</option>
                        <option value="5">5 Questions (Standard Diagnostic • 20m)</option>
                        <option value="8">8 Questions (Full Assessment • 30m)</option>
                      </select>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAiGenModalOpen(false)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={generatingAiTest}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/30 flex items-center gap-1.5"
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${generatingAiTest ? 'animate-spin' : ''}`} />
                        <span>{generatingAiTest ? 'Generating Live Questions...' : 'Start AI Test Now'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal: Interactive Past Scorecard Review */}
            {selectedScorecard && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
                <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {selectedScorecard.company_name || 'Technical Assessment'}
                      </div>
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                        {selectedScorecard.title}
                      </h2>
                      <p className="text-xs text-slate-400">
                        Attempted on {new Date(selectedScorecard.created_at || selectedScorecard.completed_at || Date.now()).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedScorecard(null)}
                      className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Score Banner */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recorded Score</span>
                      <div className={`text-3xl font-black ${
                        (selectedScorecard.percentage ?? selectedScorecard.score) >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {(selectedScorecard.percentage ?? selectedScorecard.score ?? 0)}%
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {selectedScorecard.correct_count !== undefined && selectedScorecard.total_questions ? (
                          <span>{selectedScorecard.correct_count} of {selectedScorecard.total_questions} questions correct</span>
                        ) : (
                          <span>Completed assessment</span>
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        (selectedScorecard.percentage ?? selectedScorecard.score) >= 70
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {(selectedScorecard.percentage ?? selectedScorecard.score) >= 70 ? 'Passed' : 'Needs Practice'}
                      </span>
                    </div>
                  </div>

                  {/* AI Feedback */}
                  {selectedScorecard.ai_feedback && (
                    <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        AI Diagnostic Insight
                      </span>
                      <p className="leading-relaxed">{selectedScorecard.ai_feedback}</p>
                    </div>
                  )}

                  {/* Topic Scores Breakdown */}
                  {selectedScorecard.topic_scores && typeof selectedScorecard.topic_scores === 'object' && Object.keys(selectedScorecard.topic_scores).length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Topic-Wise Competency</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(selectedScorecard.topic_scores).map(([topic, stats]) => {
                          const pct = typeof stats === 'object' && stats.total > 0
                            ? Math.round((stats.correct / stats.total) * 100)
                            : (typeof stats === 'number' ? stats : 0);
                          return (
                            <div key={topic} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-800 dark:text-slate-200">{topic}</span>
                                <span className={pct >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{pct}%</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${pct >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Detailed Solutions if present */}
                  {selectedScorecard.detailed_feedback && Array.isArray(selectedScorecard.detailed_feedback) && selectedScorecard.detailed_feedback.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Question-by-Question Review</h4>
                      <div className="space-y-3">
                        {selectedScorecard.detailed_feedback.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-xl border text-xs space-y-2 ${
                              item.is_correct ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/20' : 'border-rose-200 dark:border-rose-800/80 bg-rose-50/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {idx + 1}. {item.question}
                              </span>
                              {item.is_correct ? (
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 shrink-0">
                                  <Check className="w-3 h-3" /> Correct
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5 shrink-0">
                                  <X className="w-3 h-3" /> Incorrect
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] space-y-0.5 text-slate-600 dark:text-slate-300">
                              <div>Your Answer: <strong className={item.is_correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>{item.selected_option}</strong></div>
                              {!item.is_correct && <div>Correct Answer: <strong className="text-emerald-700 dark:text-emerald-400">{item.correct_option}</strong></div>}
                            </div>
                            {item.explanation && (
                              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <span className="font-bold text-blue-600 dark:text-blue-400">Explanation: </span>{item.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <button
                      onClick={() => handleDeleteTest(selectedScorecard.id || selectedScorecard._id)}
                      className="px-3.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete This Record
                    </button>
                    <button
                      onClick={() => setSelectedScorecard(null)}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
                    >
                      Close Scorecard
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Performance History Section */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Mock Test Performance History ({pastTests.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    All completed assessments are recorded here with scorecards, topic mastery, and diagnostic review.
                  </p>
                </div>
              </div>

              {pastTests.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">No Mock Tests Recorded Yet</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-0.5">
                      Take your first diagnostic practice assessment or generate a custom AI test for an upcoming campus interview to track your performance history.
                    </p>
                  </div>
                  <button
                    onClick={() => startAssessment(SAMPLE_ASSESSMENTS[0])}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition"
                  >
                    Take Sample Diagnostic Test
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Company / Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Questions</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {pastTests.map((t, idx) => {
                        const testId = t.id || t._id;
                        const scoreVal = t.percentage !== undefined && t.percentage !== null ? t.percentage : (t.score ?? 0);
                        const isPassed = scoreVal >= 70;
                        const dateFormatted = t.created_at || t.completed_at
                          ? new Date(t.created_at || t.completed_at).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })
                          : 'Recent';

                        return (
                          <tr key={testId || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                                  {(t.company_name || 'T').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <span>{t.title}</span>
                                  </div>
                                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{t.company_name || 'General Assessment'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 capitalize">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold">
                                {t.category || 'technical'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {t.correct_count !== undefined ? `${t.correct_count} / ${t.total_questions || t.questions_count || 5}` : `${t.total_questions || t.questions_count || 5} Qs`}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className={`font-extrabold text-sm ${
                                  isPassed ? 'text-emerald-600 dark:text-emerald-400' : scoreVal >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                                }`}>
                                  {scoreVal}%
                                </span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  isPassed
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                }`}>
                                  {isPassed ? 'Pass' : 'Practice'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                              {dateFormatted}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedScorecard(t)}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center gap-1 transition"
                                  title="View full diagnostic scorecard"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Review</span>
                                </button>
                                <button
                                  onClick={(e) => handleDeleteTest(testId, e)}
                                  disabled={deletingId === testId}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition disabled:opacity-50"
                                  title="Delete test attempt"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Active Campus Drives Practice Section */}
            {jobDrives.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Mock Tests for Live Campus Drives ({jobDrives.length})
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Practice with AI-generated technical interview rounds tailored specifically to companies currently hiring on campus.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {jobDrives.slice(0, 8).map((job) => {
                    const compName = job.company_name || 'Enterprise Partner';
                    const salary = (typeof job.package_details === 'string' ? job.package_details : null) || job.salary_range || 'Competitive Package';
                    return (
                      <div
                        key={job.id || job._id}
                        className="card-3d p-4 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition flex flex-col justify-between shadow-xs group"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-extrabold text-xs flex items-center justify-center">
                              {compName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              Active Drive
                            </span>
                          </div>

                          <div>
                            <h4 className="font-semibold text-[11px] text-slate-500 dark:text-slate-400 truncate">{compName}</h4>
                            <h3 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate mt-0.5">
                              {job.title}
                            </h3>
                          </div>

                          {job.required_skills && job.required_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {job.required_skills.slice(0, 2).map((sk, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
                            {salary}
                          </span>

                          <button
                            onClick={() => openAiGenForJob(job)}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Mock Test</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Standard Practice Assessment Cards */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Standard Core Competency Assessments
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fixed benchmark assessments designed to evaluate baseline aptitude, algorithms, and distributed systems.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SAMPLE_ASSESSMENTS.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition flex flex-col justify-between group shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {assessment.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {assessment.duration_mins} mins
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                        {assessment.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                        Evaluate problem solving, complexity analysis, and algorithms with {assessment.questions.length} adaptive multiple-choice questions.
                      </p>

                      <div className="pt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Difficulty: <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{assessment.difficulty}</span>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-4">
                      <button
                        onClick={() => startAssessment(assessment)}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Start Assessment Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
