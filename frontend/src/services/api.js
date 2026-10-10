/**
 * Unified API Client for ASPIRE FastAPI Backend
 */

const API_BASE = '/api/v1';

class ApiClient {
  getToken() {
    return localStorage.getItem('aspire_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('aspire_token', token);
    } else {
      localStorage.removeItem('aspire_token');
    }
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // --- Auth Endpoints ---
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.data?.access_token) {
      this.setToken(res.data.access_token);
    }
    return res.data;
  }

  async register(name, email, password, role = 'student') {
    const res = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    if (res.data?.access_token) {
      this.setToken(res.data.access_token);
    }
    return res.data;
  }

  async getMe() {
    const res = await this.request('/auth/me');
    return res.data;
  }

  // --- Student Endpoints ---
  async getStudentProfile() {
    const res = await this.request('/students/me/profile');
    return res.data;
  }

  async updateStudentProfile(profileData) {
    const res = await this.request('/students/me/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return res.data;
  }

  async getStudentSkills() {
    const res = await this.request('/students/me/skills');
    return res.data || [];
  }

  async addStudentSkill(skillIdOrName, proficiency = 'intermediate', evidence = null, category = 'Technical Skills') {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(skillIdOrName);
    const body = isObjectId
      ? { skill_id: skillIdOrName, proficiency, evidence }
      : { skill_name: skillIdOrName, category, proficiency, evidence };
    const res = await this.request('/students/me/skills', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return res.data;
  }

  async batchAddStudentSkills(skills) {
    const res = await this.request('/students/me/skills/batch', {
      method: 'POST',
      body: JSON.stringify({ skills }),
    });
    return res.data || [];
  }

  async extractSkillsFromResume(file, resumeText = '') {
    const formData = new FormData();
    if (file instanceof File) {
      formData.append('file', file);
    }
    if (resumeText) {
      formData.append('resume_text', resumeText);
    }
    const res = await this.request('/students/me/resume/extract-skills', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  }

  async deleteStudentSkill(skillId) {
    const res = await this.request(`/students/me/skills/${skillId}`, {
      method: 'DELETE',
    });
    return res.data;
  }

  async getStudentDashboard() {
    const res = await this.request('/students/me/dashboard');
    return res.data;
  }

  // --- Recruiter & Company Endpoints ---
  async getRecruiterProfile() {
    const res = await this.request('/recruiters/me/profile');
    return res.data;
  }

  async getCompanies(industry) {
    const query = industry ? `?industry=${encodeURIComponent(industry)}` : '';
    const res = await this.request(`/companies${query}`);
    return res.data || [];
  }

  async createCompany(companyData) {
    const res = await this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
    return res.data;
  }

  // --- Jobs & Eligibility ---
  async getJobs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await this.request(`/jobs${query ? `?${query}` : ''}`);
    return res;
  }

  async getJobDetails(jobId) {
    const res = await this.request(`/jobs/${jobId}`);
    return res.data;
  }

  async checkEligibility(jobId) {
    const res = await this.request(`/jobs/${jobId}/eligibility`);
    return res.data;
  }

  async createJob(jobData) {
    const res = await this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
    return res.data;
  }

  // --- Skills ---
  async getSkills(category, search) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const res = await this.request(`/skills${params.toString() ? `?${params.toString()}` : ''}`);
    return res.data || [];
  }

  // --- Applications ---
  async applyJob(jobId, resumeId, notes) {
    const res = await this.request('/applications', {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, resume_id: resumeId, notes }),
    });
    return res.data;
  }

  async getMyApplications() {
    const res = await this.request('/applications/me');
    return res.data || [];
  }

  async getJobApplications(jobId) {
    const res = await this.request(`/applications/job/${jobId}`);
    return res.data || [];
  }

  async updateApplicationStatus(appId, status, notes) {
    const res = await this.request(`/applications/${appId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    });
    return res.data;
  }

  // --- Mock Tests ---
  async createMockTest(testData) {
    const res = await this.request('/mock-tests', {
      method: 'POST',
      body: JSON.stringify(testData),
    });
    return res.data;
  }

  async getMyMockTests() {
    const res = await this.request('/mock-tests/me');
    return res.data || [];
  }

  async getMockTestQuestions(testId) {
    const res = await this.request(`/mock-tests/${testId}/questions`);
    return res.data || [];
  }

  async submitMockTest(testId, responses) {
    const res = await this.request(`/mock-tests/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ responses }),
    });
    return res.data;
  }

  async getMockTestResult(testId) {
    const res = await this.request(`/mock-tests/${testId}/result`);
    return res.data;
  }

  // --- Skill Gaps ---
  async createSkillGapReport(reportData) {
    const res = await this.request('/skill-gaps', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
    return res.data;
  }

  async getMySkillGapReports() {
    const res = await this.request('/skill-gaps/me');
    return res.data || [];
  }

  // --- Roadmaps ---
  async createRoadmap(roadmapData) {
    const res = await this.request('/roadmaps', {
      method: 'POST',
      body: JSON.stringify(roadmapData),
    });
    return res.data;
  }

  async getMyRoadmaps() {
    const res = await this.request('/roadmaps/me');
    return res.data || [];
  }

  async updateRoadmapStep(stepId, updateData) {
    const res = await this.request(`/roadmaps/steps/${stepId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return res.data;
  }

  // --- Resumes ---
  async createResume(resumeData) {
    const res = await this.request('/resumes', {
      method: 'POST',
      body: JSON.stringify(resumeData),
    });
    return res.data;
  }

  async getMyResumes() {
    const res = await this.request('/resumes/me');
    return res.data || [];
  }

  async createResumeVersion(resumeId, versionData) {
    const res = await this.request(`/resumes/${resumeId}/versions`, {
      method: 'POST',
      body: JSON.stringify(versionData),
    });
    return res.data;
  }

  async getResumeVersions(resumeId) {
    const res = await this.request(`/resumes/${resumeId}/versions`);
    return res.data || [];
  }

  // --- Performance & Notifications ---
  async getMyPerformanceRecords() {
    const res = await this.request('/performance/me');
    return res.data || [];
  }

  async getMyNotifications() {
    const res = await this.request('/notifications/me');
    return res.data || [];
  }

  async markNotificationRead(id) {
    const res = await this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
    return res.data;
  }

  // --- Admin Endpoints ---
  async getAllUsers(role) {
    const query = role ? `?role=${role}` : '';
    const res = await this.request(`/users${query}`);
    return res.data || [];
  }

  async createRecruiter(recruiterData) {
    const res = await this.request('/users/recruiters', {
      method: 'POST',
      body: JSON.stringify(recruiterData),
    });
    return res.data;
  }

  async updateUserStatus(userId, isActive) {
    const res = await this.request(`/users/${userId}/status?is_active=${isActive}`, {
      method: 'PUT',
    });
    return res.data;
  }

  async getAuditLogs(limit = 50) {
    const res = await this.request(`/audit?limit=${limit}`);
    return res.data || [];
  }

  async checkHealth() {
    const res = await fetch('/health');
    return await res.json();
  }
}

export const api = new ApiClient();
