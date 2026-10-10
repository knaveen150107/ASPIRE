import React, { useState, useEffect } from 'react';
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
  X 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SAMPLE_ASSESSMENTS = [
  {
    id: 'dsa_core',
    title: 'Data Structures & Algorithms Diagnostic',
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

  // Past test history
  const [pastTests, setPastTests] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // AI Dynamic Generator State
  const [isAiGenModalOpen, setIsAiGenModalOpen] = useState(false);
  const [generatingAiTest, setGeneratingAiTest] = useState(false);
  const [aiGenForm, setAiGenForm] = useState({
    companyName: 'Google',
    roleTitle: 'Software Engineer',
    category: 'DSA & Problem Solving',
    difficulty: 'medium',
    numQuestions: 5,
  });

  useEffect(() => {
    loadTestHistory();
  }, []);

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
        category: 'technical',
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

    const scorePercentage = Math.round((correctCount / activeAssessment.questions.length) * 100);

    const resultObj = {
      score: scorePercentage,
      correct: correctCount,
      total: activeAssessment.questions.length,
      topicBreakdown,
      detailedFeedback,
      assessmentTitle: activeAssessment.title,
    };

    setTestResult(resultObj);

    try {
      await api.createMockTest({
        title: activeAssessment.title,
        category: activeAssessment.category,
        total_questions: activeAssessment.questions.length,
        score: scorePercentage,
        status: 'completed',
        topic_scores: topicBreakdown,
      });
      loadTestHistory();
      toast.success(`Assessment completed! Score: ${scorePercentage}%`);
    } catch (err) {
      // logged
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
                    Question {currentQuestionIdx + 1} of {activeAssessment.questions.length}
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
          /* Scorecard Review View */
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-lg text-center space-y-5 transition-colors">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Assessment Result</span>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{testResult.assessmentTitle}</h2>
                <div className="mt-4 text-5xl font-black text-blue-600 dark:text-blue-400">
                  {testResult.score}%
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-2">
                  You scored <strong className="text-slate-800 dark:text-slate-200">{testResult.correct}</strong> out of <strong className="text-slate-800 dark:text-slate-200">{testResult.total}</strong> questions correctly.
                </p>
              </div>

              {/* Topic Breakdown */}
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Topic-Wise Competency Breakdown</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(testResult.topicBreakdown).map(([topic, stats]) => {
                    const pct = Math.round((stats.correct / stats.total) * 100);
                    return (
                      <div key={topic} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-800 dark:text-slate-200">{topic}</span>
                          <span className={pct >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
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

              <div className="pt-2">
                <button
                  onClick={() => setTestResult(null)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  Back to Assessments Directory
                </button>
              </div>
            </div>

            {/* Questions Detailed Breakdown */}
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

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-blue-700 dark:text-blue-400">Explanation: </span>
                    {item.explanation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Catalog View */
          <>
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
                    Simulate real company hiring assessments for software engineering, product, and quant roles.
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
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">Completed</div>
                  </div>
                </div>
              </div>
            </div>

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
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Company</label>
                        <select
                          value={aiGenForm.companyName}
                          onChange={(e) => setAiGenForm({ ...aiGenForm, companyName: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                        >
                          <option value="Google">Google</option>
                          <option value="Amazon">Amazon</option>
                          <option value="Microsoft">Microsoft</option>
                          <option value="Meta">Meta</option>
                          <option value="Apple">Apple</option>
                          <option value="Netflix">Netflix</option>
                          <option value="Uber">Uber</option>
                          <option value="Goldman Sachs">Goldman Sachs</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Role</label>
                        <input
                          type="text"
                          required
                          value={aiGenForm.roleTitle}
                          onChange={(e) => setAiGenForm({ ...aiGenForm, roleTitle: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                        />
                      </div>
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
                          <option value="medium">Medium (Standard Tier-1)</option>
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

            {/* Assessment Cards */}
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

            {/* Past History Table */}
            {pastTests.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Assessment History & Progress
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 uppercase font-bold text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Test Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Questions</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {pastTests.map((t, idx) => (
                        <tr key={t._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{t.title}</td>
                          <td className="py-3.5 px-4 capitalize">{t.category}</td>
                          <td className="py-3.5 px-4">{t.total_questions || 10}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{t.score}%</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {t.status || 'Completed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
