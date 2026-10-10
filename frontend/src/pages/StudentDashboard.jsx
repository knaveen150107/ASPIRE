import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  TrendingUp, 
  Briefcase, 
  Clock, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Target,
  FileText,
  Activity,
  User,
  ShieldCheck,
  ChevronRight,
  X,
  Sparkles,
  UploadCloud,
  Brain,
  Cpu,
  FileUp,
  Check,
  Layers,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AspireLogo from '../components/AspireLogo';

export default function StudentDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [allCatalogSkills, setAllCatalogSkills] = useState([]);
  const [applications, setApplications] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Add Skill State
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [skillInputMode, setSkillInputMode] = useState('catalog'); // 'catalog' or 'custom'
  const [selectedCatalogSkill, setSelectedCatalogSkill] = useState('');
  const [customSkillName, setCustomSkillName] = useState('');
  const [customCategory, setCustomCategory] = useState('Programming Languages');
  const [newProficiency, setNewProficiency] = useState('intermediate');
  const [newEvidence, setNewEvidence] = useState('');
  const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);

  // RAG Resume Upload & Skill Extraction State
  const fileInputRef = useRef(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeTextPasted, setResumeTextPasted] = useState('');
  const [showPasteText, setShowPasteText] = useState(false);
  const [isExtractingRAG, setIsExtractingRAG] = useState(false);
  const [ragProgressStage, setRagProgressStage] = useState('');
  const [ragResult, setRagResult] = useState(null);
  const [isRAGModalOpen, setIsRAGModalOpen] = useState(false);
  const [selectedRAGSkills, setSelectedRAGSkills] = useState({}); // { [skill_name]: boolean }
  const [editedProficiencies, setEditedProficiencies] = useState({}); // { [skill_name]: proficiency }
  const [isImportingRAG, setIsImportingRAG] = useState(false);

  // Skills search/filter in arsenal
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Edit profile state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editCgpa, setEditCgpa] = useState('');
  const [editBacklogs, setEditBacklogs] = useState(0);
  const [editDegree, setEditDegree] = useState('B.Tech');
  const [editDepartment, setEditDepartment] = useState('Computer Science');
  const [editBatch, setEditBatch] = useState(2026);
  const [editProfession, setEditProfession] = useState('Full Stack Software Engineer');
  const [editRegisterNo, setEditRegisterNo] = useState('CB.SC.U4AIE24235');
  const [editSummary, setEditSummary] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [profileData, skillsData, appsData, testsData, catalogData] = await Promise.allSettled([
        api.getStudentProfile(),
        api.getStudentSkills(),
        api.getMyApplications(),
        api.getMyMockTests(),
        api.getSkills(),
      ]);

      if (profileData.status === 'fulfilled' && profileData.value) {
        const val = profileData.value;
        setProfile(val);
        setEditCgpa(val.cgpa ?? val.academic_record?.cgpa ?? 8.2);
        setEditBacklogs(val.active_backlogs ?? val.academic_record?.active_backlogs ?? 0);
        setEditDegree(val.degree || val.academic_record?.degree || 'B.Tech');
        setEditDepartment(val.department || val.academic_record?.department || 'Computer Science');
        setEditBatch(val.graduation_year || val.academic_record?.graduation_year || 2026);
        setEditProfession(val.profession || val.academic_record?.profession || 'Full Stack Software Engineer');
        setEditRegisterNo(val.register_number || 'CB.SC.U4AIE24235');
        setEditSummary(val.profile_summary || '');
      }

      if (skillsData.status === 'fulfilled') setSkills(skillsData.value || []);
      if (appsData.status === 'fulfilled') setApplications(appsData.value || []);
      if (testsData.status === 'fulfilled') setMockTests(testsData.value || []);
      if (catalogData.status === 'fulfilled') setAllCatalogSkills(catalogData.value || []);
    } catch (err) {
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Manual Add Skill
  const handleAddManualSkill = async (e) => {
    e.preventDefault();
    const finalSkillName = skillInputMode === 'catalog' ? selectedCatalogSkill : customSkillName.trim();
    if (!finalSkillName) {
      toast.error('Please specify a skill name');
      return;
    }

    try {
      setIsSubmittingSkill(true);
      await api.addStudentSkill(
        finalSkillName,
        newProficiency,
        newEvidence ? newEvidence.trim() : null,
        skillInputMode === 'catalog' ? 'Technical Skills' : customCategory
      );
      toast.success(`Skill "${finalSkillName}" added to your profile`);
      setIsSkillModalOpen(false);
      setSelectedCatalogSkill('');
      setCustomSkillName('');
      setNewEvidence('');
      const updatedSkills = await api.getStudentSkills();
      setSkills(updatedSkills || []);
    } catch (err) {
      toast.error(err.message || 'Failed to add skill');
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    try {
      await api.deleteStudentSkill(skillId);
      toast.success('Skill removed');
      setSkills(skills.filter((s) => s.skill_id !== skillId));
    } catch (err) {
      toast.error(err.message || 'Failed to remove skill');
    }
  };

  // Handle File Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setShowPasteText(false);
    }
  };

  // Run RAG Skill Extraction Pipeline
  const handleRunRAGAnalysis = async () => {
    if (!resumeFile && !resumeTextPasted.trim()) {
      toast.error('Please upload a resume file (PDF/DOCX) or paste resume text');
      return;
    }

    try {
      setIsExtractingRAG(true);
      setRagProgressStage('Chunking document passages...');

      const stageTimer1 = setTimeout(() => {
        setRagProgressStage('Computing dense vector embeddings...');
      }, 700);

      const stageTimer2 = setTimeout(() => {
        setRagProgressStage('Running cosine similarity vector retrieval against skills ontology...');
      }, 1600);

      const stageTimer3 = setTimeout(() => {
        setRagProgressStage('Synthesizing evidence citations & proficiency scores...');
      }, 2500);

      const response = await api.extractSkillsFromResume(resumeFile, resumeTextPasted);

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);

      setRagResult(response);

      // Pre-select all extracted skills
      const initialSelection = {};
      const initialProficiencies = {};
      (response.extracted_skills || []).forEach((sk) => {
        initialSelection[sk.skill_name] = true;
        initialProficiencies[sk.skill_name] = sk.proficiency || 'intermediate';
      });
      setSelectedRAGSkills(initialSelection);
      setEditedProficiencies(initialProficiencies);
      setIsRAGModalOpen(true);
      toast.success(`RAG Analysis complete: ${response.total_skills} competencies identified!`);
    } catch (err) {
      toast.error(err.message || 'RAG extraction failed. Please ensure file has readable text.');
    } finally {
      setIsExtractingRAG(false);
      setRagProgressStage('');
    }
  };

  // Import Selected Extracted Skills into Profile
  const handleImportRAGSkills = async () => {
    if (!ragResult?.extracted_skills) return;

    const toImport = ragResult.extracted_skills.filter(
      (sk) => selectedRAGSkills[sk.skill_name]
    );

    if (toImport.length === 0) {
      toast.error('Please select at least one skill to import');
      return;
    }

    try {
      setIsImportingRAG(true);
      const payload = toImport.map((sk) => ({
        skill_id: sk.skill_id || null,
        skill_name: sk.skill_name,
        category: sk.category || 'Technical Skills',
        proficiency: editedProficiencies[sk.skill_name] || sk.proficiency || 'intermediate',
        evidence: sk.evidence || 'Extracted via RAG resume analysis',
      }));

      await api.batchAddStudentSkills(payload);
      toast.success(`Successfully added ${payload.length} skills to your Verified Arsenal!`);
      setIsRAGModalOpen(false);
      setResumeFile(null);
      setResumeTextPasted('');
      const updatedSkills = await api.getStudentSkills();
      setSkills(updatedSkills || []);
    } catch (err) {
      toast.error(err.message || 'Failed to import skills');
    } finally {
      setIsImportingRAG(false);
    }
  };

  const toggleRAGSkillSelection = (skillName) => {
    setSelectedRAGSkills((prev) => ({
      ...prev,
      [skillName]: !prev[skillName],
    }));
  };

  const handleSelectAllRAGSkills = (selectAll) => {
    const updated = {};
    (ragResult?.extracted_skills || []).forEach((sk) => {
      updated[sk.skill_name] = selectAll;
    });
    setSelectedRAGSkills(updated);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const parsedCgpa = parseFloat(editCgpa);
      const parsedBacklogs = parseInt(editBacklogs, 10) || 0;
      const parsedBatch = parseInt(editBatch, 10) || 2026;

      const payload = {
        degree: editDegree,
        department: editDepartment,
        graduation_year: parsedBatch,
        cgpa: parsedCgpa,
        active_backlogs: parsedBacklogs,
        profession: editProfession.trim() || 'Full Stack Software Engineer',
        register_number: editRegisterNo.trim() || 'CB.SC.U4AIE24235',
        profile_summary: editSummary.trim(),
        academic_record: {
          degree: editDegree,
          department: editDepartment,
          graduation_year: parsedBatch,
          cgpa: parsedCgpa,
          active_backlogs: parsedBacklogs,
          profession: editProfession.trim() || 'Full Stack Software Engineer',
          register_number: editRegisterNo.trim() || 'CB.SC.U4AIE24235',
          profile_summary: editSummary.trim(),
        }
      };

      const res = await api.updateStudentProfile(payload);
      if (res) {
        setProfile((prev) => ({ ...prev, ...res }));
      }
      toast.success('Academic & Career profile updated successfully!');
      setIsEditProfileOpen(false);
      await loadDashboardData();
    } catch (err) {
      toast.error(err.message || 'Failed to update academic profile');
    }
  };

  // Filter skills for display in the Arsenal card
  const filteredSkills = skills.filter((s) => {
    const nameMatch = (s.skill_name || s.name || s.skill_id || '').toLowerCase().includes(skillSearchQuery.toLowerCase());
    const categoryMatch = selectedCategoryFilter === 'All' || s.category === selectedCategoryFilter;
    return nameMatch && categoryMatch;
  });

  const uniqueSkillCategories = ['All', ...new Set(skills.map((s) => s.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-xs">Loading career readiness metrics...</p>
        </div>
      </div>
    );
  }

  const cgpa = profile?.cgpa ?? profile?.academic_record?.cgpa ?? 8.2;
  const backlogs = profile?.active_backlogs ?? profile?.academic_record?.active_backlogs ?? 0;
  const degree = profile?.degree || profile?.academic_record?.degree || 'B.Tech';
  const department = profile?.department || profile?.academic_record?.department || 'Computer Science';
  const batch = profile?.graduation_year || profile?.academic_record?.graduation_year || 2026;
  const profession = profile?.profession || profile?.academic_record?.profession || 'Full Stack Software Engineer';
  const registerNo = profile?.register_number || 'CB.SC.U4AIE24235';
  
  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="bg-[#fcfdfd] dark:bg-[#090d16] min-h-screen py-8 text-slate-800 dark:text-slate-100 animate-fade-in font-sans transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Exact Haveloc-Style Clean Home Header */}
        <div className="pt-6 pb-2 space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {getTimeOfDayGreeting()}, {user?.name || 'Naveen K'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">
            Welcome to your placement hub. Use the menu above to browse jobs, companies, and your profile.
          </p>
        </div>

        {/* Top 4 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Cumulative GPA</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{Number(cgpa).toFixed(2)}</span>
              <span className="text-xs text-slate-400">/ 10.0</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {cgpa >= 7.5 ? 'Eligible for 92% of top tier drives' : 'Work on GPA for tier 1 cutoff'}
            </p>
          </div>

          <div className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Standing Backlogs</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{backlogs}</span>
              <span className="text-xs text-slate-400">active</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {backlogs === 0 ? 'Zero Standing Backlogs' : `${backlogs} backlogs pending`}
            </p>
          </div>

          <div className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Verified Skills</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{skills.length}</span>
              <span className="text-xs text-slate-400">competencies</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Extracted via RAG & mapped to drive prerequisites
            </p>
          </div>

          <div 
            onClick={() => onNavigate && onNavigate('jobs')}
            className="card-3d p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors cursor-pointer hover:border-purple-300 dark:hover:border-purple-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Applications</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{applications.length}</span>
              <span className="text-xs text-slate-400">submitted</span>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center justify-between">
              <span>{applications.filter(a => a.status === 'shortlisted').length} shortlisted</span>
              <span className="text-[10px] underline">View All →</span>
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RAG RESUME EMBEDDING ANALYZER & SKILL EXTRACTION HERO CARD               */}
        {/* ========================================================================= */}
        <div className="rounded-3xl p-7 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/40 via-indigo-50/20 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Brain className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  RAG Vector Embedding Engine
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  Resume Vector Analysis & Automatic Skill Extraction
                  <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl font-normal">
                  Upload your resume in PDF/DOCX format. Our dense vector embedding pipeline chunks your resume, executes cosine similarity retrieval against canonical industry skills, and extracts citations with proficiency scoring.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Add Manually
                </button>
              </div>
            </div>

            {/* Upload or Paste Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* File Dropzone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`md:col-span-2 border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition ${
                  resumeFile 
                    ? 'border-blue-400 bg-blue-50/40 dark:bg-blue-950/20' 
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 bg-slate-50/20 dark:bg-slate-800/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {resumeFile ? (
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{resumeFile.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {(resumeFile.size / 1024).toFixed(1)} KB • Ready for RAG embedding extraction
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Change File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Click to select or drag and drop your Resume
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Supports PDF, DOCX, and TXT (Max 15MB)
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      Dense Semantic Embedding Parser
                    </span>
                  </div>
                )}
              </div>

              {/* Action / Paste Side Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      Vector Retrieval
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPasteText(!showPasteText)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold"
                    >
                      {showPasteText ? 'Hide Text Area' : 'Or Paste Text'}
                    </button>
                  </div>

                  {showPasteText ? (
                    <textarea
                      rows="4"
                      value={resumeTextPasted}
                      onChange={(e) => {
                        setResumeTextPasted(e.target.value);
                        if (e.target.value) setResumeFile(null);
                      }}
                      placeholder="Paste raw resume markdown or plain text here..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 resize-none font-mono text-[11px]"
                    />
                  ) : (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Embeddings are indexed into high-dimensional vector space. Skills are cross-referenced with context-aware semantic thresholding.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleRunRAGAnalysis}
                  disabled={isExtractingRAG || (!resumeFile && !resumeTextPasted.trim())}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {isExtractingRAG ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Extracting with RAG...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Extract Skills with RAG</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* RAG Progress Bar while analyzing */}
            {isExtractingRAG && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                    {ragProgressStage || 'Processing document through RAG pipeline...'}
                  </span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Semantic Vector Embedding</span>
                </div>
                <div className="w-full h-1.5 bg-blue-200/80 dark:bg-blue-900/80 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Grid: Skills Arsenal & Academic Records */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left 2 Cols: Verified Skills & Mock History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Skills Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Verified Skill Arsenal ({skills.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Skills verified through RAG analysis or added manually to your candidate profile
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSkillModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Skill
                  </button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              {skills.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between pt-1">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search skills in your profile..."
                      value={skillSearchQuery}
                      onChange={(e) => setSkillSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {uniqueSkillCategories.length > 2 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                      {uniqueSkillCategories.slice(0, 5).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategoryFilter(cat)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                            selectedCategoryFilter === cat
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {skills.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-slate-700 dark:text-slate-300 text-xs font-bold">No skills registered on your profile yet</p>
                    <p className="text-slate-400 dark:text-slate-500 text-[11px] max-w-sm mx-auto">
                      Upload your resume above for automatic RAG extraction, or manually add your key technical proficiencies.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold flex items-center gap-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition"
                    >
                      <FileUp className="w-3.5 h-3.5" />
                      Upload Resume
                    </button>
                    <button
                      onClick={() => setIsSkillModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Skill Manually
                    </button>
                  </div>
                </div>
              ) : filteredSkills.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                  No skills matching "{skillSearchQuery}" in this category.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredSkills.map((s, idx) => (
                    <div
                      key={s.skill_id || s.id || idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-start justify-between group hover:border-blue-300 dark:hover:border-blue-600 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition"
                    >
                      <div className="space-y-1 min-w-0 pr-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {s.skill_name || s.name || s.skill_id}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            s.proficiency === 'expert' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' :
                            s.proficiency === 'advanced' ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' :
                            s.proficiency === 'intermediate' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' :
                            'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}>
                            {s.proficiency}
                          </span>
                        </div>

                        {s.category && (
                          <span className="inline-block text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            {s.category}
                          </span>
                        )}

                        {s.evidence && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic leading-relaxed pt-0.5">
                            "{typeof s.evidence === 'string' ? s.evidence : JSON.stringify(s.evidence)}"
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteSkill(s.skill_id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition opacity-0 group-hover:opacity-100 shrink-0"
                        title="Remove skill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Job Applications Tracker */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    My Submitted Applications ({applications.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Live recruitment and screening status for your active placement applications
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('jobs')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-bold flex items-center gap-1 transition"
                >
                  View All In Jobs <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-slate-500 dark:text-slate-400 text-xs">No job applications submitted yet.</p>
                  <button
                    onClick={() => onNavigate('jobs')}
                    className="mt-2 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold"
                  >
                    Browse Placement Drives
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {applications.slice(0, 4).map((app, idx) => {
                    const statusLabel = app.status === 'offered' ? 'Offer Extended 🏆' :
                                        app.status === 'shortlisted' ? 'Shortlisted' :
                                        app.status === 'in_review' ? 'In Review' :
                                        app.status === 'interview_scheduled' ? 'Interview Scheduled' :
                                        app.status === 'assessment_scheduled' ? 'Assessment Scheduled' :
                                        app.status === 'rejected' ? 'Application Closed' : 'Applied';
                    const statusBg = app.status === 'offered' ? 'bg-emerald-500 text-white' :
                                     app.status === 'shortlisted' ? 'bg-emerald-600 text-white' :
                                     app.status === 'in_review' ? 'bg-amber-500 text-white' :
                                     app.status === 'interview_scheduled' ? 'bg-blue-600 text-white' :
                                     'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800';

                    const appliedDate = app.applied_at 
                      ? new Date(app.applied_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
                      : 'Recently';

                    return (
                      <div key={app.id || app._id || idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold text-sm flex items-center justify-center">
                            {(app.company_name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{app.job_title || 'Software Engineer'}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {app.company_name || 'Enterprise Recruiter'} • Applied {appliedDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusBg}`}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Mock Assessments */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Recent Mock Assessments
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    AI diagnostic test history with topic mastery scorecards
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('mock-tests')}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-bold flex items-center gap-1 transition"
                >
                  View All Tests <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>

              {mockTests.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <p className="text-slate-500 dark:text-slate-400 text-xs">No mock assessments completed yet.</p>
                  <button
                    onClick={() => onNavigate('mock-tests')}
                    className="mt-2 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold"
                  >
                    Take a Practice Test
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {mockTests.slice(0, 3).map((test, idx) => {
                    const scoreVal = test.percentage !== undefined && test.percentage !== null ? test.percentage : (test.score ?? 0);
                    const isPassed = scoreVal >= 70;
                    return (
                      <div key={test.id || test._id || idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                            {(test.company_name || test.title || 'T').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white">{test.title || 'Technical Assessment'}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                              <span className="text-blue-600 dark:text-blue-400 font-medium">{test.company_name || 'General Assessment'}</span>
                              <span>•</span>
                              <span className="capitalize">{test.category || 'technical'}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-extrabold ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {scoreVal}%
                          </span>
                          <span className={`block text-[9px] font-bold uppercase ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {isPassed ? 'Passed' : 'Practice'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* Right 1 Col: Academic Details & Career Navigation */}
          <div className="space-y-6">
            
            {/* Academic & Professional Credentials Card */}
            <div id="profile-section" className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Academic Profile
                </h3>
                <button
                  onClick={() => setIsEditProfileOpen(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold hover:underline"
                >
                  Edit
                </button>
              </div>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Target Profession</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {profession}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Registration ID</span>
                  <span className="text-slate-900 dark:text-white font-mono font-bold">{registerNo}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Department</span>
                  <span className="text-slate-900 dark:text-white font-bold">{department}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Degree</span>
                  <span className="text-slate-900 dark:text-white font-bold">{degree}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Graduation Batch</span>
                  <span className="text-slate-900 dark:text-white font-bold">{batch}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Cumulative GPA</span>
                  <span className="text-blue-600 dark:text-blue-400 font-extrabold">{Number(cgpa).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Arrear / Backlogs</span>
                  <span className={`font-bold ${backlogs > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {backlogs === 0 ? '0 (None)' : `${backlogs} Active`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                Edit Profile & Academic Records
              </button>
            </div>

            {/* Quick Actions Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Career Acceleration Tools
              </h4>

              <button
                onClick={() => onNavigate('skill-gaps')}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">Skill-Gap Radar</h5>
                    <p className="text-[10px] text-slate-400">Benchmark against target roles</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>

              <button
                onClick={() => onNavigate('roadmaps')}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">Learning Roadmaps</h5>
                    <p className="text-[10px] text-slate-400">Curated weekly modules</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>

              <button
                onClick={() => onNavigate('resumes')}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">ATS Resume Tailor</h5>
                    <p className="text-[10px] text-slate-400">Score keyword alignment</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RAG VECTOR SKILL EXTRACTION REVIEW & IMPORT MODAL                         */}
      {/* ========================================================================= */}
      {isRAGModalOpen && ragResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 transition-colors">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Brain className="w-3.5 h-3.5" />
                  RAG Vector Retrieval Results
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Extracted Competencies & Evidence ({ragResult.total_skills})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Review the skills retrieved from indexed vector chunks. Select the ones you want to import into your Verified Arsenal.
                </p>
              </div>

              <button
                onClick={() => setIsRAGModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary & Stats Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200">Executive Technical Summary:</span>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {ragResult.summary}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleSelectAllRAGSkills(true)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectAllRAGSkills(false)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-bold hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* Extracted Skills List */}
            <div className="overflow-y-auto max-h-[48vh] pr-1 space-y-2.5">
              {ragResult.extracted_skills.map((sk, idx) => {
                const isSelected = !!selectedRAGSkills[sk.skill_name];
                const currentProf = editedProficiencies[sk.skill_name] || sk.proficiency || 'intermediate';

                return (
                  <div
                    key={sk.skill_name || idx}
                    className={`p-3.5 rounded-2xl border transition flex items-start gap-3 ${
                      isSelected 
                        ? 'bg-blue-50/40 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700' 
                        : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700 opacity-70'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleRAGSkillSelection(sk.skill_name)}
                      className="mt-0.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 fill-blue-100 dark:fill-blue-950" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{sk.skill_name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {sk.category}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {Math.round(sk.confidence * 100)}% Vector Match
                          </span>
                        </div>

                        {/* Proficiency Dropdown */}
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Proficiency:</label>
                          <select
                            value={currentProf}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditedProficiencies((prev) => ({
                                ...prev,
                                [sk.skill_name]: val,
                              }));
                            }}
                            className="text-xs px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-600 font-semibold"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                          </select>
                        </div>
                      </div>

                      {/* Evidence Quote */}
                      {sk.evidence && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200/60 dark:border-slate-700 leading-relaxed font-normal">
                          <span className="font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] block">Retrieved Vector Citation:</span>
                          "{sk.evidence}"
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {Object.values(selectedRAGSkills).filter(Boolean).length} of {ragResult.total_skills} skills selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsRAGModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportRAGSkills}
                  disabled={isImportingRAG || Object.values(selectedRAGSkills).filter(Boolean).length === 0}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  {isImportingRAG ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Import {Object.values(selectedRAGSkills).filter(Boolean).length} Selected Skills</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANUAL ADD SKILL MODAL                                                    */}
      {/* ========================================================================= */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Skill Manually</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select from canonical placement catalog or add any custom technology.
                </p>
              </div>
              <button
                onClick={() => setIsSkillModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Toggle: Catalog vs Custom */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSkillInputMode('catalog')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  skillInputMode === 'catalog' 
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Choose from Catalog ({allCatalogSkills.length})
              </button>
              <button
                type="button"
                onClick={() => setSkillInputMode('custom')}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  skillInputMode === 'custom' 
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Enter Custom Skill
              </button>
            </div>

            <form onSubmit={handleAddManualSkill} className="space-y-3.5">
              {skillInputMode === 'catalog' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Canonical Skill
                  </label>
                  <select
                    value={selectedCatalogSkill}
                    onChange={(e) => setSelectedCatalogSkill(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600"
                    required
                  >
                    <option value="">-- Choose from Catalog --</option>
                    {allCatalogSkills.map((sk) => (
                      <option key={sk.id || sk._id || sk.name} value={sk.name}>
                        {sk.name} ({sk.category})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Skill / Technology Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LangChain, Solidity, Three.js, Redis, PyTorch"
                      value={customSkillName}
                      onChange={(e) => setCustomSkillName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category Domain
                    </label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600"
                    >
                      <option value="Programming Languages">Programming Languages</option>
                      <option value="Frontend Development">Frontend Development</option>
                      <option value="Backend Development">Backend Development</option>
                      <option value="Databases & Storage">Databases & Storage</option>
                      <option value="Cloud & DevOps">Cloud & DevOps</option>
                      <option value="AI, ML & Data Science">AI, ML & Data Science</option>
                      <option value="Core Computer Science">Core Computer Science</option>
                      <option value="Soft Skills">Soft Skills</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Proficiency Level</label>
                <select
                  value={newProficiency}
                  onChange={(e) => setNewProficiency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="beginner">Beginner (Foundational)</option>
                  <option value="intermediate">Intermediate (Project Ready)</option>
                  <option value="advanced">Advanced (Production Experience)</option>
                  <option value="expert">Expert (Architectural Mastery)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Evidence / Proof (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. GitHub repo link, Certification ID, or project citation"
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSkill}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmittingSkill ? 'Saving...' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 transition-colors">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Edit Student Profile & Credentials
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Update your academic standing, target profession, and verification details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              
              {/* Target Profession & Roll Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Profession / Role
                  </label>
                  <input
                    type="text"
                    value={editProfession}
                    onChange={(e) => setEditProfession(e.target.value)}
                    placeholder="e.g. Full Stack Developer, AI/ML Engineer"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registration / Roll Number
                  </label>
                  <input
                    type="text"
                    value={editRegisterNo}
                    onChange={(e) => setEditRegisterNo(e.target.value)}
                    placeholder="e.g. CB.SC.U4AIE24235"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
                    required
                  />
                </div>
              </div>

              {/* Department & Degree */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <select
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
                  >
                    <option value="Computer Science">Computer Science & Engineering</option>
                    <option value="Artificial Intelligence & DS">Artificial Intelligence & Data Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Electrical Engineering">Electrical & Electronics</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Degree</label>
                  <select
                    value={editDegree}
                    onChange={(e) => setEditDegree(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
                  >
                    <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                    <option value="B.E.">B.E. (Bachelor of Engineering)</option>
                    <option value="M.Tech">M.Tech (Master of Technology)</option>
                    <option value="MCA">MCA (Master of Computer Apps)</option>
                    <option value="B.Sc">B.Sc Computer Science</option>
                    <option value="M.Sc">M.Sc Data Analytics</option>
                  </select>
                </div>
              </div>

              {/* Batch Year, CGPA, Arrears / Backlogs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Graduation Year</label>
                  <input
                    type="number"
                    min="2020"
                    max="2035"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cumulative GPA (0-10)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={editCgpa}
                    onChange={(e) => setEditCgpa(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Arrears / Backlogs</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={editBacklogs}
                    onChange={(e) => setEditBacklogs(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition"
                    required
                  />
                </div>
              </div>

              {/* Career Summary / Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Career Bio & Placement Summary
                </label>
                <textarea
                  rows="2"
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  placeholder="e.g. Passionate full-stack developer with strong foundation in DSA, Python, and cloud architectures..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs focus:outline-none focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition hover:shadow-lg"
                >
                  Save Profile Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
