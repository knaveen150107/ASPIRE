import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Building2, 
  Calendar, 
  Award, 
  BookOpen, 
  Briefcase, 
  FileText, 
  Globe, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Camera, 
  Sparkles, 
  Brain, 
  Code, 
  Cpu, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Layers, 
  ShieldCheck, 
  Star, 
  Copy, 
  Eye, 
  Clock,
  Save,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Standard Predefined Skill Categories
const SKILL_CATEGORIES = [
  'Programming Languages',
  'Frontend Development',
  'Backend Development',
  'Databases & Storage',
  'Cloud & DevOps',
  'AI, ML & Data Science',
  'Embedded Systems',
  'Electronics',
  'Tools & Frameworks',
  'Soft Skills'
];

export default function ProfilePage({ onNavigate }) {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  // Core Data States
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form State (for Personal & Academic Information)
  const [formData, setFormData] = useState({
    name: '',
    register_number: '',
    phone: '',
    department: 'Computer Science',
    degree: 'B.Tech',
    college: 'Amrita Vishwa Vidyapeetham',
    current_year: 3,
    current_semester: 6,
    graduation_year: 2026,
    cgpa: 8.5,
    active_backlogs: 0,
    location: '',
    profession: 'Full Stack Software Engineer',
    headline: '',
    profile_summary: '',
    social_links: {
      github: '',
      linkedin: '',
      leetcode: '',
      instagram: '',
      portfolio: ''
    },
    projects: [],
    education: [],
    experience: [],
    certifications: [],
    achievements: []
  });

  // Photo Upload State
  const avatarInputRef = useRef(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Resume Upload & RAG State
  const resumeInputRef = useRef(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isExtractingRAG, setIsExtractingRAG] = useState(false);
  const [ragModalOpen, setRagModalOpen] = useState(false);
  const [ragResult, setRagResult] = useState(null);
  const [selectedRAGSkills, setSelectedRAGSkills] = useState({});

  // Skill Add Modal State
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Programming Languages');
  const [newSkillProficiency, setNewSkillProficiency] = useState('intermediate');
  const [newSkillEvidence, setNewSkillEvidence] = useState('');
  const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);

  // Repeatable Items Modals State (Project, Education, Experience, Certification, Achievement)
  const [activeModal, setActiveModal] = useState(null); // 'project' | 'education' | 'experience' | 'certification' | 'achievement'
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    category: 'Full Stack Web',
    description: '',
    technologies: '',
    role: '',
    start_date: '',
    end_date: '',
    github_url: '',
    demo_url: '',
    image_url: ''
  });
  const [educationForm, setEducationForm] = useState({
    institution: '',
    degree: 'B.Tech',
    field_of_study: 'Computer Science',
    start_year: 2022,
    end_year: 2026,
    grade: ''
  });
  const [experienceForm, setExperienceForm] = useState({
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: ''
  });
  const [certificationForm, setCertificationForm] = useState({
    name: '',
    issuing_organization: '',
    issue_date: '',
    credential_id: '',
    credential_url: ''
  });
  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    date_received: ''
  });

  // Copied Roll No tooltip state
  const [copiedRoll, setCopiedRoll] = useState(false);

  // Active sub-navigation filter for viewing
  const [activeTab, setActiveTab] = useState('all');

  // Load profile and skills
  useEffect(() => {
    loadFullProfile();
  }, [user]);

  const loadFullProfile = async () => {
    try {
      setLoading(true);
      const [profileData, skillsData] = await Promise.all([
        api.getStudentProfile(),
        api.getStudentSkills()
      ]);

      if (profileData) {
        setProfile(profileData);
        syncProfileToFormData(profileData);
      }
      if (skillsData) {
        setSkills(skillsData);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const syncProfileToFormData = (data) => {
    setFormData({
      name: data.name || user?.name || '',
      register_number: data.register_number || 'CB.SC.U4AIE24235',
      phone: data.phone || '',
      department: data.department || 'Computer Science',
      degree: data.degree || 'B.Tech',
      college: data.college || 'Amrita Vishwa Vidyapeetham',
      current_year: data.current_year ?? 3,
      current_semester: data.current_semester ?? 6,
      graduation_year: data.graduation_year ?? 2026,
      cgpa: data.cgpa ?? 8.5,
      active_backlogs: data.active_backlogs ?? 0,
      location: data.location || '',
      profession: data.profession || 'Full Stack Software Engineer',
      headline: data.headline || '',
      profile_summary: data.profile_summary || '',
      social_links: {
        github: data.social_links?.github || '',
        linkedin: data.social_links?.linkedin || '',
        leetcode: data.social_links?.leetcode || '',
        instagram: data.social_links?.instagram || '',
        portfolio: data.social_links?.portfolio || ''
      },
      projects: data.projects || [],
      education: data.education || [],
      experience: data.experience || [],
      certifications: data.certifications || [],
      achievements: data.achievements || []
    });
    setHasUnsavedChanges(false);
  };

  // Calculate Profile Completion Percentage
  const calculateProfileCompletion = () => {
    let score = 0;
    const checks = [
      { weight: 10, pass: !!(profile?.avatar_url || formData.name) },
      { weight: 10, pass: !!(formData.register_number && formData.department && formData.degree) },
      { weight: 10, pass: !!(formData.cgpa > 0 && formData.graduation_year) },
      { weight: 10, pass: !!(formData.phone && formData.location) },
      { weight: 10, pass: !!(formData.headline || formData.profession) },
      { weight: 10, pass: !!(formData.profile_summary && formData.profile_summary.length > 20) },
      { weight: 15, pass: skills.length >= 3 },
      { weight: 10, pass: (formData.projects && formData.projects.length >= 1) },
      { weight: 10, pass: !!(profile?.resume_url) },
      { weight: 5, pass: !!(formData.social_links?.github || formData.social_links?.linkedin) }
    ];

    checks.forEach(c => {
      if (c.pass) score += c.weight;
    });
    return Math.min(100, Math.max(0, score));
  };

  const completionPercentage = calculateProfileCompletion();

  // Handle Form Change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleSocialChange = (network, value) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [network]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Save Complete Profile
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    if (isSaving) return;

    try {
      setIsSaving(true);
      const payload = {
        name: formData.name.trim(),
        register_number: formData.register_number.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        degree: formData.degree.trim(),
        college: formData.college.trim(),
        current_year: parseInt(formData.current_year, 10) || 3,
        current_semester: parseInt(formData.current_semester, 10) || 6,
        graduation_year: parseInt(formData.graduation_year, 10) || 2026,
        cgpa: parseFloat(formData.cgpa) || 0.0,
        active_backlogs: parseInt(formData.active_backlogs, 10) || 0,
        location: formData.location.trim(),
        profession: formData.profession.trim(),
        headline: formData.headline.trim(),
        profile_summary: formData.profile_summary.trim(),
        social_links: {
          github: formData.social_links.github.trim(),
          linkedin: formData.social_links.linkedin.trim(),
          leetcode: formData.social_links.leetcode.trim(),
          instagram: formData.social_links.instagram.trim(),
          portfolio: formData.social_links.portfolio.trim()
        },
        projects: formData.projects,
        education: formData.education,
        experience: formData.experience,
        certifications: formData.certifications,
        achievements: formData.achievements
      };

      const updated = await api.updateStudentProfile(payload);
      if (updated) {
        setProfile(updated);
        syncProfileToFormData(updated);
      }
      if (refreshUser) await refreshUser();
      toast.success('Your profile has been saved successfully!');
      setIsEditMode(false);
      setHasUnsavedChanges(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save profile changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Discard them and return to view mode?')) {
        return;
      }
    }
    if (profile) syncProfileToFormData(profile);
    setIsEditMode(false);
    setHasUnsavedChanges(false);
  };

  // Avatar Upload / Remove
  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      toast.error('Please upload a valid image file (PNG, JPG, JPEG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const res = await api.uploadAvatar(file);
      if (res?.avatar_url) {
        setProfile(prev => ({ ...prev, avatar_url: res.avatar_url }));
        toast.success('Profile avatar updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;
    try {
      setIsUploadingAvatar(true);
      await api.removeAvatar();
      setProfile(prev => ({ ...prev, avatar_url: null }));
      toast.success('Profile photo removed.');
    } catch (err) {
      toast.error(err.message || 'Failed to remove photo');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Resume Upload & RAG
  const handleResumeFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Resume file size must be less than 15MB');
      return;
    }

    try {
      setIsUploadingResume(true);
      const res = await api.uploadResumeFile(file);
      if (res?.resume_url) {
        setProfile(prev => ({
          ...prev,
          resume_url: res.resume_url,
          resume_filename: res.resume_filename,
          resume_updated_at: res.resume_updated_at
        }));
        toast.success(`Resume "${res.resume_filename}" uploaded successfully!`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload resume');
    } finally {
      setIsUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  // Run RAG Extraction from Uploaded Resume
  const handleRunRAGAnalysis = async (fileToExtract = null) => {
    try {
      setIsExtractingRAG(true);
      const file = fileToExtract || resumeInputRef.current?.files?.[0];
      const res = await api.extractSkillsFromResume(file, '');
      setRagResult(res);

      const preSelected = {};
      (res.extracted_skills || []).forEach(sk => {
        preSelected[sk.skill_name] = true;
      });
      setSelectedRAGSkills(preSelected);
      setRagModalOpen(true);
      toast.success(`RAG extracted ${res.total_skills} skills from your resume!`);
    } catch (err) {
      toast.error(err.message || 'Failed to parse resume text with RAG model');
    } finally {
      setIsExtractingRAG(false);
    }
  };

  const handleImportRAGSkillsToArsenal = async () => {
    if (!ragResult?.extracted_skills) return;
    const toImport = ragResult.extracted_skills.filter(sk => selectedRAGSkills[sk.skill_name]);
    if (toImport.length === 0) {
      toast.error('Select at least one skill to import');
      return;
    }

    try {
      const payload = toImport.map(sk => ({
        skill_id: sk.skill_id || null,
        skill_name: sk.skill_name,
        category: sk.category || 'Technical Skills',
        proficiency: sk.proficiency || 'intermediate',
        evidence: sk.evidence || 'Imported via RAG resume analysis'
      }));

      await api.batchAddStudentSkills(payload);
      toast.success(`Successfully added ${payload.length} competencies to your profile!`);
      setRagModalOpen(false);
      const updatedSkills = await api.getStudentSkills();
      setSkills(updatedSkills || []);
    } catch (err) {
      toast.error(err.message || 'Failed to import extracted skills');
    }
  };

  // Skill Management
  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    try {
      setIsSubmittingSkill(true);
      await api.addStudentSkill(
        newSkillName.trim(),
        newSkillProficiency,
        newSkillEvidence.trim() || null,
        newSkillCategory
      );
      toast.success(`Skill "${newSkillName}" added to your verified arsenal!`);
      setNewSkillName('');
      setNewSkillEvidence('');
      setIsSkillModalOpen(false);
      const updated = await api.getStudentSkills();
      setSkills(updated || []);
    } catch (err) {
      toast.error(err.message || 'Failed to add skill');
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillId, skillName) => {
    if (!window.confirm(`Remove skill "${skillName}" from your profile?`)) return;
    try {
      await api.deleteStudentSkill(skillId);
      toast.success(`Skill "${skillName}" removed.`);
      setSkills(prev => prev.filter(s => s.skill_id !== skillId && s.id !== skillId));
    } catch (err) {
      toast.error(err.message || 'Failed to remove skill');
    }
  };

  // Repeatable Item Modals Handlers (Projects, Education, Experience, Certifications, Achievements)
  const openItemModal = (type, index = null) => {
    setActiveModal(type);
    setEditingItemIndex(index);

    if (type === 'project') {
      if (index !== null && formData.projects[index]) {
        const item = formData.projects[index];
        setProjectForm({
          title: item.title || '',
          category: item.category || 'Full Stack Web',
          description: item.description || '',
          technologies: Array.isArray(item.technologies) ? item.technologies.join(', ') : (item.technologies || ''),
          role: item.role || '',
          start_date: item.start_date || '',
          end_date: item.end_date || '',
          github_url: item.github_url || '',
          demo_url: item.demo_url || '',
          image_url: item.image_url || ''
        });
      } else {
        setProjectForm({
          title: '',
          category: 'Full Stack Web',
          description: '',
          technologies: '',
          role: 'Full Stack Developer',
          start_date: '',
          end_date: '',
          github_url: '',
          demo_url: '',
          image_url: ''
        });
      }
    } else if (type === 'education') {
      if (index !== null && formData.education[index]) {
        const item = formData.education[index];
        setEducationForm({
          institution: item.institution || '',
          degree: item.degree || 'B.Tech',
          field_of_study: item.field_of_study || 'Computer Science',
          start_year: item.start_year || 2022,
          end_year: item.end_year || 2026,
          grade: item.grade || ''
        });
      } else {
        setEducationForm({
          institution: 'Amrita Vishwa Vidyapeetham',
          degree: 'B.Tech',
          field_of_study: 'Computer Science & Engineering',
          start_year: 2022,
          end_year: 2026,
          grade: '8.5 CGPA'
        });
      }
    } else if (type === 'experience') {
      if (index !== null && formData.experience[index]) {
        const item = formData.experience[index];
        setExperienceForm({
          title: item.title || '',
          company: item.company || '',
          location: item.location || '',
          start_date: item.start_date || '',
          end_date: item.end_date || '',
          is_current: !!item.is_current,
          description: item.description || ''
        });
      } else {
        setExperienceForm({
          title: 'Software Engineering Intern',
          company: '',
          location: 'Bengaluru, India',
          start_date: '',
          end_date: '',
          is_current: false,
          description: ''
        });
      }
    } else if (type === 'certification') {
      if (index !== null && formData.certifications[index]) {
        const item = formData.certifications[index];
        setCertificationForm({
          name: item.name || '',
          issuing_organization: item.issuing_organization || '',
          issue_date: item.issue_date || '',
          credential_id: item.credential_id || '',
          credential_url: item.credential_url || ''
        });
      } else {
        setCertificationForm({
          name: '',
          issuing_organization: '',
          issue_date: '',
          credential_id: '',
          credential_url: ''
        });
      }
    } else if (type === 'achievement') {
      if (index !== null && formData.achievements[index]) {
        const item = formData.achievements[index];
        setAchievementForm({
          title: item.title || '',
          description: item.description || '',
          date_received: item.date_received || ''
        });
      } else {
        setAchievementForm({
          title: '',
          description: '',
          date_received: ''
        });
      }
    }
  };

  const closeItemModal = () => {
    setActiveModal(null);
    setEditingItemIndex(null);
  };

  const saveItemModal = (e) => {
    e.preventDefault();
    if (!activeModal) return;

    if (activeModal === 'project') {
      if (!projectForm.title.trim()) {
        toast.error('Project title is required');
        return;
      }
      const techList = projectForm.technologies
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const newItem = {
        title: projectForm.title.trim(),
        category: projectForm.category.trim(),
        description: projectForm.description.trim(),
        technologies: techList,
        role: projectForm.role.trim(),
        start_date: projectForm.start_date.trim(),
        end_date: projectForm.end_date.trim(),
        github_url: projectForm.github_url.trim(),
        demo_url: projectForm.demo_url.trim(),
        image_url: projectForm.image_url.trim()
      };

      setFormData(prev => {
        const updated = [...prev.projects];
        if (editingItemIndex !== null) {
          updated[editingItemIndex] = { ...updated[editingItemIndex], ...newItem };
        } else {
          updated.push(newItem);
        }
        return { ...prev, projects: updated };
      });
      setHasUnsavedChanges(true);
      toast.success(editingItemIndex !== null ? 'Project updated' : 'Project added');
    } else if (activeModal === 'education') {
      if (!educationForm.institution.trim()) {
        toast.error('Institution is required');
        return;
      }
      const newItem = {
        institution: educationForm.institution.trim(),
        degree: educationForm.degree.trim(),
        field_of_study: educationForm.field_of_study.trim(),
        start_year: parseInt(educationForm.start_year, 10),
        end_year: parseInt(educationForm.end_year, 10),
        grade: educationForm.grade.trim()
      };
      setFormData(prev => {
        const updated = [...prev.education];
        if (editingItemIndex !== null) {
          updated[editingItemIndex] = { ...updated[editingItemIndex], ...newItem };
        } else {
          updated.push(newItem);
        }
        return { ...prev, education: updated };
      });
      setHasUnsavedChanges(true);
      toast.success(editingItemIndex !== null ? 'Education updated' : 'Education added');
    } else if (activeModal === 'experience') {
      if (!experienceForm.company.trim() || !experienceForm.title.trim()) {
        toast.error('Company and role title are required');
        return;
      }
      const newItem = {
        title: experienceForm.title.trim(),
        company: experienceForm.company.trim(),
        location: experienceForm.location.trim(),
        start_date: experienceForm.start_date.trim(),
        end_date: experienceForm.is_current ? 'Present' : experienceForm.end_date.trim(),
        is_current: experienceForm.is_current,
        description: experienceForm.description.trim()
      };
      setFormData(prev => {
        const updated = [...prev.experience];
        if (editingItemIndex !== null) {
          updated[editingItemIndex] = { ...updated[editingItemIndex], ...newItem };
        } else {
          updated.push(newItem);
        }
        return { ...prev, experience: updated };
      });
      setHasUnsavedChanges(true);
      toast.success(editingItemIndex !== null ? 'Experience updated' : 'Experience added');
    } else if (activeModal === 'certification') {
      if (!certificationForm.name.trim()) {
        toast.error('Certification name is required');
        return;
      }
      const newItem = {
        name: certificationForm.name.trim(),
        issuing_organization: certificationForm.issuing_organization.trim(),
        issue_date: certificationForm.issue_date.trim(),
        credential_id: certificationForm.credential_id.trim(),
        credential_url: certificationForm.credential_url.trim()
      };
      setFormData(prev => {
        const updated = [...prev.certifications];
        if (editingItemIndex !== null) {
          updated[editingItemIndex] = { ...updated[editingItemIndex], ...newItem };
        } else {
          updated.push(newItem);
        }
        return { ...prev, certifications: updated };
      });
      setHasUnsavedChanges(true);
      toast.success(editingItemIndex !== null ? 'Certification updated' : 'Certification added');
    } else if (activeModal === 'achievement') {
      if (!achievementForm.title.trim()) {
        toast.error('Achievement title is required');
        return;
      }
      const newItem = {
        title: achievementForm.title.trim(),
        description: achievementForm.description.trim(),
        date_received: achievementForm.date_received.trim()
      };
      setFormData(prev => {
        const updated = [...prev.achievements];
        if (editingItemIndex !== null) {
          updated[editingItemIndex] = { ...updated[editingItemIndex], ...newItem };
        } else {
          updated.push(newItem);
        }
        return { ...prev, achievements: updated };
      });
      setHasUnsavedChanges(true);
      toast.success(editingItemIndex !== null ? 'Achievement updated' : 'Achievement added');
    }

    closeItemModal();
  };

  const deleteRepeatableItem = (type, index) => {
    if (!window.confirm('Delete this item?')) return;
    setFormData(prev => {
      const updated = [...prev[type]];
      updated.splice(index, 1);
      return { ...prev, [type]: updated };
    });
    setHasUnsavedChanges(true);
    toast.success('Item removed');
  };

  const copyRollNumber = () => {
    const roll = formData.register_number || profile?.register_number || 'CB.SC.U4AIE24235';
    navigator.clipboard.writeText(roll);
    setCopiedRoll(true);
    toast.success('Roll number copied to clipboard');
    setTimeout(() => setCopiedRoll(false), 2000);
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getProficiencyBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'expert':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'advanced':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'intermediate':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-xs">Loading complete student profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16 font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & BREADCRUMB BAR                                            */}
      {/* ========================================================================= */}
      <section className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* Breadcrumb & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-900 font-bold text-sm">Student Profile</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {isEditMode ? 'Edit Mode' : 'View Mode'}
              </span>
            </div>
          </div>

          {/* Action Buttons: Toggle View / Edit & Save */}
          <div className="flex items-center gap-2.5">
            {isEditMode ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/25 transition flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* ========================================================================= */}
        {/* 2. PROFILE HERO & HEADER CARD                                             */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/40 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            {/* Left: Avatar + Core Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              
              {/* Profile Avatar */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-blue-600/20 border-4 border-white">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={formData.name || 'Student Avatar'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(formData.name || user?.name)}</span>
                  )}
                </div>

                {/* Upload / Change overlay button */}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 bg-slate-900/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold gap-1 cursor-pointer"
                  title="Upload / Change Photo"
                >
                  <Camera className="w-5 h-5" />
                  <span>{isUploadingAvatar ? 'Uploading...' : 'Change'}</span>
                </button>

                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarFileSelect}
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                  className="hidden"
                />

                {/* Remove button if avatar exists */}
                {profile?.avatar_url && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-sm hover:bg-rose-600 transition"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Student Identity Information */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {formData.name || user?.name || 'Student Name'}
                  </h1>
                  
                  {/* Roll Number Pill */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold">
                    <span>{formData.register_number || 'CB.SC.U4AIE24235'}</span>
                    <button
                      type="button"
                      onClick={copyRollNumber}
                      title="Copy Roll Number"
                      className="text-slate-400 hover:text-blue-600 transition"
                    >
                      {copiedRoll ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Headline / Profession */}
                <p className="text-sm sm:text-base font-semibold text-blue-600">
                  {formData.headline || formData.profession || 'Full Stack Software Engineer'}
                </p>

                {/* Academic Metadata Pills */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium pt-0.5">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    {formData.degree} in {formData.department}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formData.current_year}th Year (Semester {formData.current_semester})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {formData.college}
                  </span>
                </div>

                {/* Email & Location Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {user?.email || 'student@institution.edu'}
                  </span>
                  {formData.phone && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {formData.phone}
                      </span>
                    </>
                  )}
                  {formData.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {formData.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Profile Readiness Indicator Card */}
            <div className="w-full lg:w-72 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/90 space-y-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Profile Readiness
                </span>
                <span className="text-base font-extrabold text-blue-600">
                  {completionPercentage}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                {completionPercentage >= 90
                  ? 'Excellent! Your profile is verified and 100% ready for placement opportunities.'
                  : 'Add your projects, verified skills, and resume to maximize your placement readiness.'}
              </p>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. MAIN CONTENT: 2-COLUMN LAYOUT                                         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ----------------------------------------------------------------------- */}
          {/* LEFT COLUMN: QUICK STATS, RESUME CARD & SOCIAL LINKS (4 Cols)           */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-36">
            
            {/* Quick Metrics Bar */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Academic Standing
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">Cumulative GPA</p>
                  <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {Number(formData.cgpa).toFixed(2)}
                    <span className="text-xs text-slate-400 font-normal"> / 10</span>
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">Standing Backlogs</p>
                  <p className={`text-xl font-extrabold mt-0.5 ${formData.active_backlogs > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {formData.active_backlogs}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">Verified Skills</p>
                  <p className="text-xl font-extrabold text-blue-600 mt-0.5">
                    {skills.length}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-500 font-medium">Projects Built</p>
                  <p className="text-xl font-extrabold text-indigo-600 mt-0.5">
                    {formData.projects.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Resume Management Card */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Primary Resume
                </h3>
                {profile?.resume_url && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                )}
              </div>

              {profile?.resume_url ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {profile.resume_filename || 'Student_Master_Resume.pdf'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Updated {profile.resume_updated_at ? new Date(profile.resume_updated_at).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={profile.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </a>

                    <button
                      type="button"
                      onClick={() => resumeInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Replace
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => resumeInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-5 text-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/20 space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Upload Your Resume</p>
                    <p className="text-[10px] text-slate-400">PDF, DOCX up to 15MB</p>
                  </div>
                </div>
              )}

              <input
                type="file"
                ref={resumeInputRef}
                onChange={handleResumeFileSelect}
                accept=".pdf,.docx,.txt"
                className="hidden"
              />

              {/* Extract Competencies with RAG Button */}
              {profile?.resume_url && (
                <button
                  type="button"
                  onClick={() => handleRunRAGAnalysis()}
                  disabled={isExtractingRAG}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200/80 text-blue-700 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span>{isExtractingRAG ? 'Analyzing Vector Chunks...' : 'Scan Resume for Skill Gaps'}</span>
                </button>
              )}
            </div>

            {/* Social & Professional Links Card */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Professional Profiles
                </h3>
              </div>

              {isEditMode ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">GitHub Profile</label>
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={formData.social_links.github}
                      onChange={(e) => handleSocialChange('github', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">LinkedIn Profile</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={formData.social_links.linkedin}
                      onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">LeetCode Profile</label>
                    <input
                      type="url"
                      placeholder="https://leetcode.com/u/username"
                      value={formData.social_links.leetcode}
                      onChange={(e) => handleSocialChange('leetcode', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Portfolio / Website</label>
                    <input
                      type="url"
                      placeholder="https://yourportfolio.dev"
                      value={formData.social_links.portfolio}
                      onChange={(e) => handleSocialChange('portfolio', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Instagram Profile</label>
                    <input
                      type="url"
                      placeholder="https://instagram.com/username"
                      value={formData.social_links.instagram}
                      onChange={(e) => handleSocialChange('instagram', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {formData.social_links.github && (
                    <a
                      href={formData.social_links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2 text-slate-800 font-bold">
                        <Code className="w-4 h-4 text-slate-600" />
                        <span>GitHub</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </a>
                  )}

                  {formData.social_links.linkedin && (
                    <a
                      href={formData.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2 text-blue-700 font-bold">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <span>LinkedIn</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </a>
                  )}

                  {formData.social_links.leetcode && (
                    <a
                      href={formData.social_links.leetcode}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2 text-amber-700 font-bold">
                        <Cpu className="w-4 h-4 text-amber-600" />
                        <span>LeetCode</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </a>
                  )}

                  {formData.social_links.portfolio && (
                    <a
                      href={formData.social_links.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2 text-indigo-700 font-bold">
                        <Globe className="w-4 h-4 text-indigo-600" />
                        <span>Portfolio Website</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </a>
                  )}

                  {formData.social_links.instagram && (
                    <a
                      href={formData.social_links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2 text-pink-700 font-bold">
                        <Star className="w-4 h-4 text-pink-600" />
                        <span>Instagram</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                    </a>
                  )}

                  {!formData.social_links.github && !formData.social_links.linkedin && !formData.social_links.leetcode && !formData.social_links.portfolio && (
                    <p className="text-xs text-slate-400 text-center py-3">
                      No social links added yet. Click Edit Profile to add GitHub and LinkedIn.
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* RIGHT COLUMN: CORE SECTIONS (8 Cols)                                    */}
          {/* ----------------------------------------------------------------------- */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* ===================================================================== */}
            {/* SECTION 1: PERSONAL & ACADEMIC DETAILS                                */}
            {/* ===================================================================== */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Personal & Academic Record</h2>
                    <p className="text-xs text-slate-400">Institutional and placement credentials</p>
                  </div>
                </div>

                {!isEditMode && (
                  <button
                    type="button"
                    onClick={() => setIsEditMode(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>

              {isEditMode ? (
                /* Edit Mode: Form Controls */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      placeholder="e.g. Naveen K"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Registration / Roll No</label>
                    <input
                      type="text"
                      value={formData.register_number}
                      onChange={(e) => handleInputChange('register_number', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono focus:outline-none focus:border-blue-600 focus:bg-white"
                      placeholder="CB.SC.U4AIE24235"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Location (City, State)</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      placeholder="Bengaluru, Karnataka"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
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
                    <label className="block font-semibold text-slate-700 mb-1">Degree / Program</label>
                    <select
                      value={formData.degree}
                      onChange={(e) => handleInputChange('degree', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                    >
                      <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                      <option value="B.E.">B.E. (Bachelor of Engineering)</option>
                      <option value="M.Tech">M.Tech (Master of Technology)</option>
                      <option value="MCA">MCA (Master of Computer Applications)</option>
                      <option value="B.Sc">B.Sc Computer Science</option>
                      <option value="M.Sc">M.Sc Data Analytics</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">College / University</label>
                    <input
                      type="text"
                      value={formData.college}
                      onChange={(e) => handleInputChange('college', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      placeholder="Amrita Vishwa Vidyapeetham"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Profession / Role</label>
                    <input
                      type="text"
                      value={formData.profession}
                      onChange={(e) => handleInputChange('profession', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      placeholder="Full Stack Software Engineer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                      <select
                        value={formData.current_year}
                        onChange={(e) => handleInputChange('current_year', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      >
                        <option value={1}>1st Year</option>
                        <option value={2}>2nd Year</option>
                        <option value={3}>3rd Year</option>
                        <option value={4}>4th Year</option>
                        <option value={5}>5th Year</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                      <select
                        value={formData.current_semester}
                        onChange={(e) => handleInputChange('current_semester', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                          <option key={s} value={s}>Sem {s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">CGPA (0 - 10)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={formData.cgpa}
                        onChange={(e) => handleInputChange('cgpa', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-bold text-blue-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Passing Year</label>
                      <input
                        type="number"
                        min="2020"
                        max="2035"
                        value={formData.graduation_year}
                        onChange={(e) => handleInputChange('graduation_year', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Professional Headline</label>
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) => handleInputChange('headline', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                      placeholder="e.g. Aspiring Cloud & AI Engineer | 350+ LeetCode Solved | Amrita CSE"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Career Bio & Objective</label>
                    <textarea
                      rows="3"
                      value={formData.profile_summary}
                      onChange={(e) => handleInputChange('profile_summary', e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white resize-none"
                      placeholder="Describe your technical passions, placement goals, and core strengths..."
                    />
                  </div>
                </div>
              ) : (
                /* View Mode: Clean 2-Column Info Grid */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                      <span className="text-slate-400 font-medium">Department</span>
                      <p className="font-bold text-slate-900 mt-0.5">{formData.department}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                      <span className="text-slate-400 font-medium">Degree Program</span>
                      <p className="font-bold text-slate-900 mt-0.5">{formData.degree}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                      <span className="text-slate-400 font-medium">Institution</span>
                      <p className="font-bold text-slate-900 mt-0.5">{formData.college}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                      <span className="text-slate-400 font-medium">Academic Year</span>
                      <p className="font-bold text-slate-900 mt-0.5">Year {formData.current_year} (Semester {formData.current_semester})</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                      <span className="text-slate-400 font-medium">Graduation Batch</span>
                      <p className="font-bold text-slate-900 mt-0.5">Class of {formData.graduation_year}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                      <span className="text-slate-400 font-medium">Cumulative GPA</span>
                      <p className="font-extrabold text-blue-600 mt-0.5">{Number(formData.cgpa).toFixed(2)} / 10.0</p>
                    </div>
                  </div>

                  {formData.profile_summary && (
                    <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 text-xs">
                      <span className="font-bold text-blue-900 uppercase tracking-wider text-[10px] block mb-1">
                        Career Objective & Summary
                      </span>
                      <p className="text-slate-700 leading-relaxed font-normal">
                        {formData.profile_summary}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ===================================================================== */}
            {/* SECTION 2: VERIFIED SKILLS ARSENAL                                   */}
            {/* ===================================================================== */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Verified Technical Skills ({skills.length})</h2>
                    <p className="text-xs text-slate-400">Competencies validated against recruiter requirements</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Skill
                </button>
              </div>

              {/* Skills Chips / Tag Cloud */}
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {skills.map((s) => {
                    const skillId = s.skill_id || s.id;
                    const name = s.skill_name || s.name || 'Skill';
                    const category = s.category || 'Technical';
                    const proficiency = s.proficiency || 'intermediate';

                    return (
                      <div
                        key={skillId}
                        className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition flex items-center gap-2 text-xs shadow-2xs group"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{name}</span>
                            <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getProficiencyBadge(proficiency)}`}>
                              {proficiency}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">{category}</span>
                        </div>

                        {/* Delete skill icon */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(skillId, name)}
                          className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg ml-1"
                          title="Remove skill"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Award className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">No skills registered yet</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Add your technical competencies or scan your resume with our RAG pipeline to automatically detect them.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSkillModalOpen(true)}
                    className="mt-2 px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Add First Skill
                  </button>
                </div>
              )}
            </div>

            {/* ===================================================================== */}
            {/* SECTION 3: PROJECTS PORTFOLIO                                         */}
            {/* ===================================================================== */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Code className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Projects Portfolio ({formData.projects.length})</h2>
                    <p className="text-xs text-slate-400">Practical applications, architectures, and open source work</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openItemModal('project')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Project
                </button>
              </div>

              {formData.projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.projects.map((proj, idx) => (
                    <div 
                      key={proj.id || idx} 
                      className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-blue-200 transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100/60 text-blue-700 border border-blue-200">
                              {proj.category || 'Web Application'}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 mt-1">
                              {proj.title}
                            </h3>
                          </div>

                          {/* Edit / Delete Project */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openItemModal('project', idx)}
                              className="p-1 text-slate-400 hover:text-blue-600 transition"
                              title="Edit project"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRepeatableItem('projects', idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition"
                              title="Delete project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {proj.description}
                        </p>

                        {/* Technologies Tags */}
                        {proj.technologies && proj.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {proj.technologies.map((t, ti) => (
                              <span 
                                key={ti}
                                className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Project Links Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                        {proj.role && (
                          <span className="text-[11px] text-slate-400 font-medium">
                            Role: {proj.role}
                          </span>
                        )}

                        <div className="flex items-center gap-3 ml-auto">
                          {proj.github_url && (
                            <a 
                              href={proj.github_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-slate-600 hover:text-blue-600 font-semibold flex items-center gap-1"
                            >
                              <Code className="w-3.5 h-3.5" />
                              <span>Code</span>
                            </a>
                          )}
                          {proj.demo_url && (
                            <a 
                              href={proj.demo_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>Live Demo</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Code className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">No projects added yet</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Highlight your engineering skills by showcasing projects you have built.
                  </p>
                  <button
                    type="button"
                    onClick={() => openItemModal('project')}
                    className="mt-2 px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Add First Project
                  </button>
                </div>
              )}
            </div>

            {/* ===================================================================== */}
            {/* SECTION 4: EDUCATION & EXPERIENCE TIMELINE                            */}
            {/* ===================================================================== */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-6">
              
              {/* Education Subsection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Education History</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => openItemModal('education')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Education
                  </button>
                </div>

                {formData.education.length > 0 ? (
                  <div className="space-y-3">
                    {formData.education.map((edu, idx) => (
                      <div key={edu.id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">{edu.institution}</p>
                          <p className="text-slate-600 font-medium">{edu.degree} — {edu.field_of_study}</p>
                          <p className="text-slate-400 text-[11px]">{edu.start_year} - {edu.end_year} • Grade: {edu.grade || 'N/A'}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openItemModal('education', idx)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRepeatableItem('education', idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No previous education added yet.</p>
                )}
              </div>

              {/* Work & Internship Experience Subsection */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">Internships & Professional Experience</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => openItemModal('experience')}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Experience
                  </button>
                </div>

                {formData.experience.length > 0 ? (
                  <div className="space-y-3">
                    {formData.experience.map((exp, idx) => (
                      <div key={exp.id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">{exp.title}</p>
                            <span className="text-slate-400">@</span>
                            <span className="font-semibold text-blue-600">{exp.company}</span>
                          </div>
                          <p className="text-slate-400 text-[11px]">{exp.start_date} - {exp.end_date} • {exp.location}</p>
                          {exp.description && (
                            <p className="text-slate-600 text-xs mt-1 leading-relaxed">{exp.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openItemModal('experience', idx)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRepeatableItem('experience', idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No internships or work experience added yet.</p>
                )}
              </div>

            </div>

            {/* ===================================================================== */}
            {/* SECTION 5: CERTIFICATIONS & ACHIEVEMENTS                             */}
            {/* ===================================================================== */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-7 space-y-6">
              
              {/* Certifications Subsection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Licenses & Certifications</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => openItemModal('certification')}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Certification
                  </button>
                </div>

                {formData.certifications.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formData.certifications.map((cert, idx) => (
                      <div key={cert.id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">{cert.name}</p>
                          <p className="text-slate-600 font-medium">{cert.issuing_organization}</p>
                          {cert.issue_date && <p className="text-slate-400 text-[11px]">Issued: {cert.issue_date}</p>}
                          {cert.credential_url && (
                            <a 
                              href={cert.credential_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-semibold flex items-center gap-1 text-[11px] pt-0.5"
                            >
                              <ExternalLink className="w-3 h-3" /> Verify Credential
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openItemModal('certification', idx)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRepeatableItem('certifications', idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No certifications added yet.</p>
                )}
              </div>

              {/* Honors & Achievements Subsection */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900">Honors & Hackathon Awards</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => openItemModal('achievement')}
                    className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Award
                  </button>
                </div>

                {formData.achievements.length > 0 ? (
                  <div className="space-y-3">
                    {formData.achievements.map((ach, idx) => (
                      <div key={ach.id || idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">{ach.title}</p>
                          {ach.date_received && <p className="text-slate-400 text-[11px]">{ach.date_received}</p>}
                          {ach.description && <p className="text-slate-600 mt-1">{ach.description}</p>}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openItemModal('achievement', idx)}
                            className="p-1 text-slate-400 hover:text-blue-600 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRepeatableItem('achievements', idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No awards or hackathon achievements listed yet.</p>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. MODALS: ADD SKILL MODAL                                               */}
      {/* ========================================================================= */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                Add Skill to Verified Arsenal
              </h3>
              <button
                type="button"
                onClick={() => setIsSkillModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. Python, Docker, React, PyTorch"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {SKILL_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proficiency Level</label>
                <select
                  value={newSkillProficiency}
                  onChange={(e) => setNewSkillProficiency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="beginner">Beginner (Foundational Knowledge)</option>
                  <option value="intermediate">Intermediate (Project Ready)</option>
                  <option value="advanced">Advanced (Production Experience)</option>
                  <option value="expert">Expert (System Architecture / Mastery)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evidence / Certification / Repo (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. GitHub project citation, certificate ID"
                  value={newSkillEvidence}
                  onChange={(e) => setNewSkillEvidence(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSkillModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSkill}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmittingSkill ? 'Saving...' : 'Add Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: REPEATABLE ENTITIES (PROJECT, EDUCATION, EXPERIENCE, ETC.)      */}
      {/* ========================================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 capitalize">
                {editingItemIndex !== null ? 'Edit' : 'Add'} {activeModal}
              </h3>
              <button
                type="button"
                onClick={closeItemModal}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveItemModal} className="space-y-3.5 text-xs">
              
              {/* Project Form Fields */}
              {activeModal === 'project' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Project Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ASPIRE Career Intelligence Platform"
                      value={projectForm.title}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Full Stack Web, AI/ML"
                        value={projectForm.category}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Your Role / Contribution</label>
                      <input
                        type="text"
                        placeholder="e.g. Lead Full Stack Developer"
                        value={projectForm.role}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Technologies & Tools (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="React, FastAPI, Docker, MongoDB, Tailwind"
                      value={projectForm.technologies}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, technologies: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Project Description & Architecture</label>
                    <textarea
                      rows="3"
                      required
                      placeholder="Detail what the project does, key challenges solved, and its impact..."
                      value={projectForm.description}
                      onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">GitHub / Code URL</label>
                      <input
                        type="url"
                        placeholder="https://github.com/..."
                        value={projectForm.github_url}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, github_url: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Live Demo URL</label>
                      <input
                        type="url"
                        placeholder="https://myproject.com"
                        value={projectForm.demo_url}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, demo_url: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Education Form Fields */}
              {activeModal === 'education' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Institution Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amrita Vishwa Vidyapeetham"
                      value={educationForm.institution}
                      onChange={(e) => setEducationForm(prev => ({ ...prev, institution: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Degree</label>
                      <input
                        type="text"
                        placeholder="e.g. B.Tech"
                        value={educationForm.degree}
                        onChange={(e) => setEducationForm(prev => ({ ...prev, degree: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Field of Study</label>
                      <input
                        type="text"
                        placeholder="e.g. Computer Science"
                        value={educationForm.field_of_study}
                        onChange={(e) => setEducationForm(prev => ({ ...prev, field_of_study: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Start Year</label>
                      <input
                        type="number"
                        value={educationForm.start_year}
                        onChange={(e) => setEducationForm(prev => ({ ...prev, start_year: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">End Year</label>
                      <input
                        type="number"
                        value={educationForm.end_year}
                        onChange={(e) => setEducationForm(prev => ({ ...prev, end_year: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">CGPA / Grade</label>
                      <input
                        type="text"
                        placeholder="e.g. 8.5 CGPA"
                        value={educationForm.grade}
                        onChange={(e) => setEducationForm(prev => ({ ...prev, grade: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Experience Form Fields */}
              {activeModal === 'experience' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Role / Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Full Stack Engineering Intern"
                      value={experienceForm.title}
                      onChange={(e) => setExperienceForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Company / Organization</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Google India"
                        value={experienceForm.company}
                        onChange={(e) => setExperienceForm(prev => ({ ...prev, company: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Bengaluru, India (Hybrid)"
                        value={experienceForm.location}
                        onChange={(e) => setExperienceForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                      <input
                        type="text"
                        placeholder="e.g. May 2025"
                        value={experienceForm.start_date}
                        onChange={(e) => setExperienceForm(prev => ({ ...prev, start_date: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                      <input
                        type="text"
                        placeholder="e.g. July 2025"
                        disabled={experienceForm.is_current}
                        value={experienceForm.is_current ? 'Present' : experienceForm.end_date}
                        onChange={(e) => setExperienceForm(prev => ({ ...prev, end_date: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={experienceForm.is_current}
                        onChange={(e) => setExperienceForm(prev => ({ ...prev, is_current: e.target.checked }))}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>I currently work here</span>
                    </label>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Key Responsibilities & Impact</label>
                    <textarea
                      rows="3"
                      placeholder="Developed microservices, improved query performance by 40%..."
                      value={experienceForm.description}
                      onChange={(e) => setExperienceForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
                    />
                  </div>
                </>
              )}

              {/* Certification Form Fields */}
              {activeModal === 'certification' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Certification Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AWS Certified Solutions Architect"
                      value={certificationForm.name}
                      onChange={(e) => setCertificationForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Issuing Organization</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amazon Web Services"
                      value={certificationForm.issuing_organization}
                      onChange={(e) => setCertificationForm(prev => ({ ...prev, issuing_organization: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
                      <input
                        type="text"
                        placeholder="e.g. March 2025"
                        value={certificationForm.issue_date}
                        onChange={(e) => setCertificationForm(prev => ({ ...prev, issue_date: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Credential ID</label>
                      <input
                        type="text"
                        placeholder="e.g. AWS-123456"
                        value={certificationForm.credential_id}
                        onChange={(e) => setCertificationForm(prev => ({ ...prev, credential_id: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Verification URL</label>
                    <input
                      type="url"
                      placeholder="https://credly.com/..."
                      value={certificationForm.credential_url}
                      onChange={(e) => setCertificationForm(prev => ({ ...prev, credential_url: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </>
              )}

              {/* Achievement Form Fields */}
              {activeModal === 'achievement' && (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Award / Honor Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Winner - National Genesis Hackathon 2026"
                      value={achievementForm.title}
                      onChange={(e) => setAchievementForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date Received</label>
                    <input
                      type="text"
                      placeholder="e.g. October 2026"
                      value={achievementForm.date_received}
                      onChange={(e) => setAchievementForm(prev => ({ ...prev, date_received: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Description / Project Scope</label>
                    <textarea
                      rows="3"
                      placeholder="Ranked 1st out of 400+ participating college engineering teams..."
                      value={achievementForm.description}
                      onChange={(e) => setAchievementForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 resize-none"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeItemModal}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Save {activeModal}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: RAG RESUME SKILLS REVIEW & IMPORT MODAL                         */}
      {/* ========================================================================= */}
      {ragModalOpen && ragResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  RAG Resume Extracted Competencies ({ragResult.total_skills})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Extracted via semantic vector retrieval. Select the skills you wish to confirm and import.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRagModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[50vh]">
              {(ragResult.extracted_skills || []).map((sk) => (
                <label 
                  key={sk.skill_name} 
                  className={`p-3 rounded-2xl border flex items-start gap-3 cursor-pointer transition text-xs ${
                    selectedRAGSkills[sk.skill_name] ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!selectedRAGSkills[sk.skill_name]}
                    onChange={() => setSelectedRAGSkills(prev => ({ ...prev, [sk.skill_name]: !prev[sk.skill_name] }))}
                    className="mt-0.5 rounded text-blue-600"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{sk.skill_name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200 uppercase">
                        {sk.proficiency}
                      </span>
                    </div>
                    {sk.evidence && (
                      <p className="text-[11px] text-slate-500 italic bg-white/70 p-1.5 rounded-lg border border-slate-100">
                        "{sk.evidence}"
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">
                {Object.values(selectedRAGSkills).filter(Boolean).length} skills selected
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRagModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportRAGSkillsToArsenal}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Import Confirmed Skills
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
