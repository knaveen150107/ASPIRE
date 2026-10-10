import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Sparkles, 
  Layers, 
  Flame, 
  ArrowRight, 
  BookOpen, 
  Check, 
  AlertTriangle, 
  AlertCircle 
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
    let gapStatus = 'missing';

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

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8 text-slate-800 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner */}
        <div className="rounded-3xl p-8 bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5" />
                AI Role Benchmark Radar
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Skill-Gap Intelligence Matrix
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm max-w-2xl font-normal">
                Benchmark verified competencies against target engineering roles and identify critical skill gaps.
              </p>
            </div>

            <button
              onClick={() => onNavigate('roadmaps')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Open Remedial Roadmap
            </button>
          </div>

          {/* Role Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            {CAREER_PROFILES.map((role) => {
              const isSelected = selectedRole.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  {role.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Overall Score Card */}
          <div className="card-3d p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Target Role Readiness</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedRole.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {selectedRole.description}
              </p>
            </div>

            <div className="text-center py-4">
              <div className="inline-flex flex-col items-center justify-center p-8 rounded-full bg-blue-50/60 border-4 border-blue-600/20 shadow-inner">
                <span className="text-4xl font-black text-blue-600">{matchPercentage}%</span>
                <span className="text-[10px] font-bold uppercase text-slate-500 mt-1">Profile Alignment</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Required Competencies</span>
                <strong className="text-slate-900">{totalRequiredCount}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Verified in Profile</span>
                <strong className="text-emerald-600">{studentSkills.length}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Critical Gaps</span>
                <strong className="text-rose-600">{missingCritical.length}</strong>
              </div>
            </div>
          </div>

          {/* Right 2 Cols: Competency Matrix */}
          <div className="lg:col-span-2 space-y-5">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Role Competency Benchmark Matrix
              </h3>

              <div className="space-y-2.5">
                {analyzedSkills.map((sk, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      sk.gapStatus === 'matched'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : sk.gapStatus === 'needs_upgrade'
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{sk.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          sk.priority === 'critical' ? 'bg-rose-100 text-rose-700' :
                          sk.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {sk.priority}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>Required: <strong className="text-slate-700 capitalize">{sk.required_level}</strong></span>
                        <span>Profile: <strong className="text-slate-700 capitalize">{sk.userProficiency || 'Not Added'}</strong></span>
                      </div>
                    </div>

                    <div>
                      {sk.gapStatus === 'matched' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <Check className="w-3.5 h-3.5" /> Met
                        </span>
                      ) : sk.gapStatus === 'needs_upgrade' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3.5 h-3.5" /> Upgrade Level
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-100 text-rose-800">
                          <AlertCircle className="w-3.5 h-3.5" /> Missing Skill
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Remedial Learning CTA */}
            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-blue-600" />
                  Targeted Remedial Learning Path
                </h4>
                <p className="text-xs text-blue-700 max-w-md font-normal">
                  Bridge your {missingCritical.length} critical competency gaps with step-by-step weekly milestone modules.
                </p>
              </div>

              <button
                onClick={() => onNavigate('roadmaps')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition whitespace-nowrap"
              >
                View Roadmaps <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
