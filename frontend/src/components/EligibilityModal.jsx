import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../services/api';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Academic Eligibility Audit</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">{jobTitle}</h3>
          <p className="text-xs text-slate-400">{companyName || 'Campus Placement Drive'}</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Analyzing your academic profile against job criteria...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
            <p className="font-semibold mb-1">Notice:</p>
            <p>{error}</p>
          </div>
        ) : eligibilityData ? (
          <div className="space-y-4">
            
            {/* Overall Verdict Banner */}
            <div
              className={`p-4 rounded-xl border flex items-center space-x-3 ${
                eligibilityData.is_eligible
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              {eligibilityData.is_eligible ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <p className="text-sm font-bold">
                  {eligibilityData.is_eligible ? 'You Meet All Mandatory Criteria!' : 'Eligibility Criteria Mismatch'}
                </p>
                <p className="text-xs text-slate-300">
                  {eligibilityData.is_eligible
                    ? 'Your academic degree, CGPA, and batch are eligible for this recruitment drive.'
                    : 'One or more mandatory published requirements were not satisfied.'}
                </p>
              </div>
            </div>

            {/* Criteria Checklist Breakdown */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Criteria Checklist</h4>
              
              {/* CGPA */}
              {eligibilityData.academic_checks?.cgpa && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-white/5 text-xs">
                  <div>
                    <span className="font-semibold text-white">CGPA Requirement:</span>
                    <p className="text-slate-400 text-[11px]">
                      Required: {eligibilityData.academic_checks.cgpa.required || 'Open'} | Your CGPA: {eligibilityData.academic_checks.cgpa.student}
                    </p>
                  </div>
                  {eligibilityData.academic_checks.cgpa.passed ? (
                    <span className="text-emerald-400 font-bold flex items-center space-x-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>Pass</span></span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center space-x-1"><XCircle className="w-3.5 h-3.5" /><span>Fail</span></span>
                  )}
                </div>
              )}

              {/* Department */}
              {eligibilityData.academic_checks?.department && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-white/5 text-xs">
                  <div>
                    <span className="font-semibold text-white">Department:</span>
                    <p className="text-slate-400 text-[11px]">
                      Your Dept: {eligibilityData.academic_checks.department.student || 'Unassigned'}
                    </p>
                  </div>
                  {eligibilityData.academic_checks.department.passed ? (
                    <span className="text-emerald-400 font-bold flex items-center space-x-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>Eligible</span></span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center space-x-1"><XCircle className="w-3.5 h-3.5" /><span>Ineligible</span></span>
                  )}
                </div>
              )}

              {/* Batch Year */}
              {eligibilityData.academic_checks?.graduation_year && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/80 border border-white/5 text-xs">
                  <div>
                    <span className="font-semibold text-white">Graduation Batch:</span>
                    <p className="text-slate-400 text-[11px]">
                      Your Batch: {eligibilityData.academic_checks.graduation_year.student || 'N/A'}
                    </p>
                  </div>
                  {eligibilityData.academic_checks.graduation_year.passed ? (
                    <span className="text-emerald-400 font-bold flex items-center space-x-1"><CheckCircle2 className="w-3.5 h-3.5" /><span>Valid</span></span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center space-x-1"><XCircle className="w-3.5 h-3.5" /><span>Invalid</span></span>
                  )}
                </div>
              )}
            </div>

            {/* Reasons if failed */}
            {eligibilityData.reasons?.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-950/80 border border-white/5 space-y-1">
                <span className="text-[11px] font-bold text-amber-400">Why criteria failed:</span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                  {eligibilityData.reasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex items-center space-x-3">
              <button
                onClick={onClose}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
              >
                Close Audit
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (onApplyClick) onApplyClick();
                }}
                className={`w-1/2 py-2.5 rounded-xl font-semibold text-xs text-white transition-all shadow-lg ${
                  eligibilityData.is_eligible
                    ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                {eligibilityData.is_eligible ? 'Proceed to Apply' : 'Apply Anyway'}
              </button>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};

export default EligibilityModal;
