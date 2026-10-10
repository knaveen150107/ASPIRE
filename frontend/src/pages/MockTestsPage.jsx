import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  RotateCcw, 
  BrainCircuit, 
  TrendingUp, 
  Sparkles,
  Zap,
  BarChart3,
  Check,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Default practice questions for diagnostic engine
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

    // Calculate score
    let correctCount = 0;
    const topicBreakdown = {};
    const detailedFeedback = activeAssessment.questions.map((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) correctCount++;

      // topic breakdown
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

    // Persist to backend
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
      // logged locally
    }
  };

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Test Active Engine View */}
      {isTestActive && activeAssessment ? (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Active Test Header */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 backdrop-blur-xl shadow-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{activeAssessment.title}</h3>
                <p className="text-xs text-slate-400">
                  Question {currentQuestionIdx + 1} of {activeAssessment.questions.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-sm font-bold">
                <Clock className="w-4 h-4 text-cyan-400" />
                {formatTime(timeLeft)}
              </div>
              <button
                onClick={handleSubmitTest}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition"
              >
                Submit Test
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-300"
              style={{
                width: `${((currentQuestionIdx + 1) / activeAssessment.questions.length) * 100}%`
              }}
            ></div>
          </div>

          {/* Question Card */}
          {(() => {
            const q = activeAssessment.questions[currentQuestionIdx];
            return (
              <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Topic: {q.topic}
                  </span>
                  <span className="text-xs text-slate-400">Single Choice Question</span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                  {q.question}
                </h2>

                <div className="space-y-3 pt-2">
                  {q.options.map((option, optIdx) => {
                    const isSelected = answers[q.id] === option;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(q.id, option)}
                        className={`w-full p-4 rounded-2xl border text-left font-medium text-sm transition flex items-center justify-between group ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                            : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{option}</span>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-indigo-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentQuestionIdx((p) => Math.max(0, p - 1))}
                    disabled={currentQuestionIdx === 0}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold disabled:opacity-30 disabled:hover:bg-slate-800 flex items-center gap-1.5 transition"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  {currentQuestionIdx < activeAssessment.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIdx((p) => p + 1)}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition"
                    >
                      Next Question <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitTest}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition"
                    >
                      Submit Assessment <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      ) : testResult ? (
        /* Scorecard & Detailed Review View */
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Diagnostic Assessment Result</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">{testResult.assessmentTitle}</h2>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  {testResult.score}%
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-2">
                You correctly answered <strong className="text-white">{testResult.correct}</strong> out of <strong className="text-white">{testResult.total}</strong> questions.
              </p>
            </div>

            {/* Topic Breakdown */}
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-left space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Topic-Wise Competency Analysis</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(testResult.topicBreakdown).map(([topic, stats]) => {
                  const pct = Math.round((stats.correct / stats.total) * 100);
                  return (
                    <div key={topic} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                      <div className="flex justify-between text-xs font-semibold mb-1.5">
                        <span className="text-white">{topic}</span>
                        <span className={pct >= 70 ? 'text-emerald-400' : 'text-amber-400'}>{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pct >= 70 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setTestResult(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                Back to Tests Directory
              </button>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Itemized Question Analysis & Explanations</h3>
            {testResult.detailedFeedback.map((item, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border backdrop-blur-md space-y-3 ${
                  item.is_correct
                    ? 'bg-slate-900/60 border-emerald-500/30'
                    : 'bg-slate-900/60 border-rose-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-semibold text-white text-sm">
                    {idx + 1}. {item.question}
                  </h4>
                  {item.is_correct ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Correct
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                      <X className="w-3 h-3" /> Incorrect
                    </span>
                  )}
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-slate-400">
                    Your Answer: <strong className={item.is_correct ? 'text-emerald-400' : 'text-rose-400'}>{item.selected_option}</strong>
                  </p>
                  {!item.is_correct && (
                    <p className="text-slate-400">
                      Correct Answer: <strong className="text-emerald-400">{item.correct_option}</strong>
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300">
                  <span className="font-semibold text-indigo-400">AI Explanation: </span>
                  {item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Test Catalog / Directory View */
        <>
          {/* Header Banner */}
          <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Adaptive AI Diagnostic Engine
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Placement Mock Assessments
                </h1>
                <p className="text-slate-400 text-sm max-w-2xl">
                  Simulate live hiring tests for top software engineering, product, and quantitative placement rounds.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                  <div className="text-2xl font-extrabold text-white">{SAMPLE_ASSESSMENTS.length}</div>
                  <div className="text-[11px] text-slate-400">Standard Tests</div>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
                  <div className="text-2xl font-extrabold text-indigo-400">{pastTests.length}</div>
                  <div className="text-[11px] text-slate-400">Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Test Catalog Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAMPLE_ASSESSMENTS.map((assessment) => (
              <div
                key={assessment.id}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 backdrop-blur-md transition flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {assessment.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {assessment.duration_mins} mins
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">
                    {assessment.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                    Test your problem solving, complexity analysis, and core placement aptitude with {assessment.questions.length} adaptive questions.
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Difficulty: <span className="text-white capitalize">{assessment.difficulty}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60">
                  <button
                    onClick={() => startAssessment(assessment)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Start Assessment Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Past Performance Record Table */}
          {pastTests.length > 0 && (
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Assessment History & Progress
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 border-b border-slate-800 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Test Title</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Questions</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {pastTests.map((t, idx) => (
                      <tr key={t._id || idx} className="hover:bg-slate-950/40 transition">
                        <td className="py-3.5 px-4 font-medium text-white">{t.title}</td>
                        <td className="py-3.5 px-4 capitalize">{t.category}</td>
                        <td className="py-3.5 px-4">{t.total_questions || 10}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-emerald-400">{t.score}%</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
  );
}
