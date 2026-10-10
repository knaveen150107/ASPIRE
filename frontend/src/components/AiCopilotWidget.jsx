import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Target, 
  Briefcase, 
  GraduationCap, 
  Layers, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  User,
  MessageSquare
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AiCopilotWidget = ({ onNavigate }) => {
  const { user, role, isAuthenticated } = useAuth();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your **ASPIRE AI Career Copilot**. I can help you prepare for company interviews (Google, Amazon, Microsoft), diagnose skill gaps, generate custom roadmaps, and review your resume. How can I assist your career journey today?`,
      suggested_actions: [
        'How to crack Tier-1 DSA technical rounds?',
        'What skills should I learn for AI / ML Engineer?',
        'How to make my resume ATS-proof?',
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      api.getAiStatus()
        .then((res) => setAiStatus(res))
        .catch(() => null);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText = null) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content,
      }));

      const res = await api.chatWithAi(
        textToSend,
        historyPayload,
        'Software Engineer / AI Engineer',
        'Tier-1 Tech Companies'
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          suggested_actions: res.suggested_actions || [],
          model_used: res.model_used,
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Sorry, I encountered a brief issue. You can still access structured roadmaps and mock tests from the navigation bar!\n\n*${err.message || 'Connection error'}*`,
          suggested_actions: ['Try again', 'Explore Mock Tests', 'View Skill Gaps'],
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated && role !== 'admin') {
    return null;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-4 py-3.5 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-2.5 transition-all duration-300 transform active:scale-95 border ${
            isOpen
              ? 'bg-slate-900 text-white border-slate-700 hover:bg-slate-800'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-blue-400/30 hover:scale-105 shadow-blue-600/30'
          }`}
        >
          <div className="relative">
            <Bot className="w-5 h-5 animate-bounce-subtle" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900"></span>
          </div>
          <span className="hidden sm:inline font-black tracking-wide">AI Career Copilot</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/20 uppercase font-black">
            {aiStatus?.gemini_key_configured ? 'Gemini 3.6' : 'AI'}
          </span>
        </button>
      </div>

      {/* Interactive Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[600px] h-[550px] bg-white dark:bg-[#0c121e] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up backdrop-blur-md">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600/90 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight text-white">ASPIRE Copilot</h3>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {aiStatus?.gemini_key_configured ? 'Google Gemini 3.6 Flash Active' : 'Placement Intelligence Engine'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50 dark:bg-[#090d16]/80 text-xs">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl space-y-2 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-md shadow-blue-600/20 font-medium'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs">
                    {msg.content}
                  </div>

                  {/* Suggested Prompts Buttons */}
                  {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Suggested Actions:
                      </p>
                      <div className="flex flex-col gap-1">
                        {msg.suggested_actions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => handleSend(act)}
                            className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-semibold transition flex items-center justify-between group"
                          >
                            <span>{act}</span>
                            <ArrowRight className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                  <span>ASPIRE AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Command Starters */}
          <div className="px-3 py-1.5 bg-slate-100/70 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            <button
              onClick={() => handleSend('Generate a 4-week roadmap for Google Software Engineer')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap hover:text-blue-600 transition"
            >
              🗺️ Roadmap for Google
            </button>
            <button
              onClick={() => handleSend('Give me 5 Amazon mock interview questions')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap hover:text-blue-600 transition"
            >
              🎯 Amazon Mock Test
            </button>
            <button
              onClick={() => handleSend('How can I optimize my resume for ATS parsers?')}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap hover:text-blue-600 transition"
            >
              📄 ATS Resume Tips
            </button>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-[#0c121e] border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about interviews, roadmaps, or skills..."
              disabled={loading}
              className="flex-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold transition shadow-md shadow-blue-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
};
