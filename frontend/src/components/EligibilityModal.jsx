import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Sparkles, Building2, GraduationCap } from 'lucide-react';
import { api } from '../services/api';
import AspireLogo from './AspireLogo';

export const EligibilityModal = ({ job, jobId, jobTitle, companyName, isOpen = true, onClose, onApplyClick, onApplySuccess }) => {
  const actualJobId = jobId || job?._id;
  const actualJobTitle = jobTitle || job?.title || 'Position';
  const actualCompanyName = companyName || job?.company_name || 'Enterprise Partner';
  const isModalOpen = isOpen !== false;

  const [eligibilityData, setEligibilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isModalOpen && actualJobId) {
      setLoading(true);
      setError(null);
      api.checkEligibility(actualJobId)
        .then((res) => {
          setEligibilityData(res);
        })
        .catch((err) => {
          setError(err.message || 'Failed to evaluate academic eligibility.');
        })
        .finally(() => setLoading(false));
    }
  }, [isModalOpen, actualJobId]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldCheck className="w-3 h-3" /> Real-Time Academic Audit
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">{actualJobTitle}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {actualCompanyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-medium">Validating GPA, Department, Degree & Backlog criteria...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        ) : eligibilityData ? (
          <div className="space-y-4">
            
            {/* Status Card */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
              eligibilityData.is_eligible
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                eligibilityData.is_eligible ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                {eligibilityData.is_eligible ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-extrabold text-sm">
                  {eligibilityData.is_eligible ? 'Eligible for Direct Placement Drive' : 'Criteria Requirements Unmet'}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {eligibilityData.is_eligible
                    ? 'Your academic transcripts and active records satisfy all university and recruiter requirements.'
                    : 'Review the itemized audit report below for specific cutoff criteria.'}
                </p>
              </div>
            </div>

            {/* Criteria Breakdown Grid */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <h5 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Criteria Verification Checklist</h5>
              
              <div className="space-y-2 text-xs">
                {/* CGPA */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-600 font-medium">Cumulative GPA (CGPA)</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    eligibilityData.cgpa_eligible ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {eligibilityData.cgpa_eligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {eligibilityData.student_cgpa || '8.2'} / Required: {eligibilityData.min_cgpa || '7.0'}
                  </span>
                </div>

                {/* Backlogs */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-600 font-medium">Standing Backlogs</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    eligibilityData.backlogs_eligible ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {eligibilityData.backlogs_eligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {eligibilityData.student_backlogs ?? 0} Backlogs (Max: {eligibilityData.max_backlogs ?? 0})
                  </span>
                </div>

                {/* Department */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80">
                  <span className="text-slate-600 font-medium">Academic Department</span>
                  <span className={`font-bold flex items-center gap-1 ${
                    eligibilityData.dept_eligible ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {eligibilityData.dept_eligible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {eligibilityData.student_dept || 'Eligible Branch'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                Close Audit
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (onApplyClick) onApplyClick();
                  if (onApplySuccess) onApplySuccess();
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Apply</span>
              </button>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};

export default EligibilityModal;
