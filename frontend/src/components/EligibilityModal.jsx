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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 transition-colors">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <ShieldCheck className="w-3 h-3" /> Real-Time Academic Audit
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{actualJobTitle}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {actualCompanyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Validating GPA, Department, Degree & Backlog criteria...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
            {error}
          </div>
        ) : eligibilityData ? (
          <div className="space-y-4">
            
            {/* Status Card */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
              eligibilityData.is_eligible
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                eligibilityData.is_eligible ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
              }`}>
                {eligibilityData.is_eligible ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  {eligibilityData.is_eligible ? 'You Are Eligible to Apply!' : 'Eligibility Requirements Not Met'}
                </h4>
                <p className="text-xs opacity-90">
                  {eligibilityData.is_eligible 
                    ? 'Your academic scores, department, and active backlog count meet all company parameters.' 
                    : 'Your current academic profile does not satisfy one or more cutoff criteria.'}
                </p>
              </div>
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-2 pt-2">
              <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Criteria Breakdown</h5>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {eligibilityData.details?.map((detail, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl border flex items-start justify-between gap-2 ${
                      detail.passed 
                        ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200' 
                        : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block text-[11px] text-slate-500 dark:text-slate-400">{detail.parameter}</span>
                      <span className="font-bold text-xs">{detail.your_value || 'N/A'}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Req: {detail.required_value}</span>
                    </div>
                    {detail.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Reasons / Insights */}
            {eligibilityData.reasons && eligibilityData.reasons.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Notes & Recommendations:
                </span>
                <ul className="list-disc list-inside text-xs text-amber-700 dark:text-amber-400 space-y-0.5">
                  {eligibilityData.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
              {eligibilityData.is_eligible && onApplyClick && (
                <button
                  onClick={() => {
                    onClose();
                    onApplyClick(job);
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition"
                >
                  Proceed to Apply
                </button>
              )}
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
};

export default EligibilityModal;
