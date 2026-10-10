import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  Zap,
  Check,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CAREER_PROFILES = [
  {
    id: 'ai_engineer',
    title: 'AI & Machine Learning Engineer',
    category: 'Artificial Intelligence',
    description: 'Specializes in LLM architectures, fine-tuning, RAG pipelines, PyTorch, and deploying scalable inference microservices.',
    required_skills: [
      { name: 'Python', required_level: 'expert', priority: 'critical' },
      { name: 'PyTorch / TensorFlow', required_level: 'advanced', priority: 'critical' },
      { name: 'RAG & Vector Databases', required_level: 'advanced', priority: 'critical' },
      { name: 'FastAPI / API Design', required_level: 'intermediate', priority: 'high' },
      { name: 'Docker & Kubernetes', required_level: 'intermediate', priority: 'high' },
      { name: 'Data Structures & Algorithms', required_level: 'advanced', priority: 'high' },
      { name: 'System Design', required_level: 'intermediate', priority: 'medium' }
    ]
  },
  {
    id: 'fullstack_engineer',
    title: 'Full Stack Web Architect',
    category: 'Software Engineering',
    description: 'Designs reactive modern frontends, high-throughput microservices, database schemas, and event-driven architectures.',
    required_skills: [
      { name: 'JavaScript / TypeScript', required_level: 'expert', priority: 'critical' },
      { name: 'React.js', required_level: 'advanced', priority: 'critical' },
      { name: 'FastAPI / Node.js', required_level: 'advanced', priority: 'critical' },
      { name: 'MongoDB / PostgreSQL', required_level: 'advanced', priority: 'high' },
      { name: 'Tailwind CSS & UI Systems', required_level: 'intermediate', priority: 'medium' },
      { name: 'Data Structures & Algorithms', required_level: 'advanced', priority: 'high' },
      { name: 'CI/CD & Cloud Deployment', required_level: 'intermediate', priority: 'medium' }
    ]
  },
  {
    id: 'cloud_devops',
    title: 'Cloud Platform & SRE Engineer',
    category: 'Cloud & Infrastructure',
    description: 'Architects fault-tolerant multi-cloud environments, automated terraform scripts, and observability pipelines.',
    required_skills: [
      { name: 'Linux & Bash Scripting', required_level: 'expert', priority: 'critical' },
      { name: 'Kubernetes & Docker', required_level: 'advanced', priority: 'critical' },
      { name: 'Terraform / IaC', required_level: 'advanced', priority: 'critical' },
      { name: 'Google Cloud (GCP) / AWS', required_level: 'advanced', priority: 'high' },
      { name: 'Prometheus & Grafana', required_level: 'intermediate', priority: 'medium' },
      { name: 'Python / Go', required_level: 'intermediate', priority: 'high' }
    ]
  }
];

export default function SkillGapsPage({ onNavigate }) {
  const { user } = useAuth();
  const toast = useToast();
  const [selectedRole, setSelectedRole] = useState(CAREER_PROFILES[0]);
  const [studentSkills, setStudentSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserSkills();
  }, [user]);

  const loadUserSkills = async () => {
    try {
      setLoading(true);
      const skills = await api.getStudentSkills();
      setStudentSkills(skills || []);
    } catch (err) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  // Compute skill gap analysis
  const studentSkillMap = new Map();
  studentSkills.forEach((s) => {
    studentSkillMap.set((s.name || s.skill_id || '').toLowerCase(), s.proficiency);
  });

  const proficiencyWeights = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4
  };

  let acquiredCount = 0;
  let totalRequiredCount = selectedRole.required_skills.length;

  const analyzedSkills = selectedRole.required_skills.map((req) => {
    const userProf = studentSkillMap.get(req.name.toLowerCase());
    const hasSkill = Boolean(userProf);
    
    let isMatched = false;
    let gapStatus = 'missing'; // 'matched', 'needs_upgrade', 'missing'

    if (hasSkill) {
      const userWeight = proficiencyWeights[userProf] || 1;
      const reqWeight = proficiencyWeights[req.required_level] || 2;
      if (userWeight >= reqWeight) {
        isMatched = true;
        gapStatus = 'matched';
        acquiredCount++;
      } else {
        gapStatus = 'needs_upgrade';
        acquiredCount += 0.5;
      }
    }

    return {
      ...req,
      userProficiency: userProf || null,
      gapStatus,
      isMatched
    };
  });

  const matchPercentage = Math.min(100, Math.round((acquiredCount / totalRequiredCount) * 100));

  const missingCritical = analyzedSkills.filter((s) => s.gapStatus === 'missing' && s.priority === 'critical');
  const needsUpgrade = analyzedSkills.filter((s) => s.gapStatus === 'needs_upgrade');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="relative rounded-3xl p-8 overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              AI Competency & Benchmark Radar
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Skill-Gap Intelligence Matrix
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Benchmark your verified skills against top-tier tech roles. Identify missing competencies and generate targeted remedial roadmaps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('roadmaps')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Open Remedial Roadmap
            </button>
          </div>
        </div>

        {/* Role Selector Tabs */}
        <div className="mt-8 flex flex-wrap gap-3">
          {CAREER_PROFILES.map((role) => {
            const isSelected = selectedRole.id === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                <Target className="w-4 h-4" />
                {role.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Role Overview & Match Score Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Overall Match Scorecard */}
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Readiness Score</span>
            <h3 className="text-xl font-bold text-white mt-1">{selectedRole.title}</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {selectedRole.description}
            </p>
          </div>

          <div className="text-center py-6">
            <div className="inline-flex flex-col items-center justify-center p-8 rounded-full bg-slate-950/80 border-4 border-indigo-500/30 shadow-inner">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                {matchPercentage}%
              </span>
              <span className="text-[11px] font-bold uppercase text-slate-400 mt-1">Profile Alignment</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Required Core Competencies</span>
              <strong className="text-white">{totalRequiredCount}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Verified in Profile</span>
              <strong className="text-emerald-400">{studentSkills.length}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Critical Gaps</span>
              <strong className="text-rose-400">{missingCritical.length}</strong>
            </div>
          </div>
        </div>

        {/* Right 2 Cols: Competency Matrix */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-indigo-400" />
              Role Competency Benchmark Matrix
            </h3>

            <div className="space-y-3">
              {analyzedSkills.map((sk, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    sk.gapStatus === 'matched'
                      ? 'bg-slate-950/40 border-emerald-500/20'
                      : sk.gapStatus === 'needs_upgrade'
                      ? 'bg-slate-950/40 border-amber-500/20'
                      : 'bg-slate-950/40 border-rose-500/20'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{sk.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        sk.priority === 'critical' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        sk.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400'
                      }`}>
                        {sk.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Target: <strong className="text-slate-200 capitalize">{sk.required_level}</strong></span>
                      <span>Your Profile: <strong className="text-slate-200 capitalize">{sk.userProficiency || 'Not Added'}</strong></span>
                    </div>
                  </div>

                  <div>
                    {sk.gapStatus === 'matched' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Check className="w-3.5 h-3.5" /> Met
                      </span>
                    ) : sk.gapStatus === 'needs_upgrade' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" /> Upgrade Level
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertCircle className="w-3.5 h-3.5" /> Missing Skill
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remedial Recommendations Action Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-indigo-400" />
                Remedial AI Learning Plan Available
              </h4>
              <p className="text-xs text-slate-400 max-w-lg">
                We've structured step-by-step milestones to bridge your {missingCritical.length} critical gaps in under 4 weeks.
              </p>
            </div>

            <button
              onClick={() => onNavigate('roadmaps')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-1.5 transition whitespace-nowrap"
            >
              View Learning Steps <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
