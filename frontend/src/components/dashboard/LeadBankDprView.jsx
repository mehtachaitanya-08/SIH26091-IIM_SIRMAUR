import React from 'react';
import { Download } from 'lucide-react';

/**
 * LeadBankDprView — 1-page Detailed Project Report (DPR)
 * The PDF is made by the server (POST /api/dpr) from verified data only, each figure with its tag.
 * It is an advisory document, not a loan sanction.
 */
export default function LeadBankDprView({
  activeDomain,
  loanStructure,
  currentUser = null,
  loanInputs = null,
  language = 'en',
  onClose,
  onDownloadPdf,
  formatINR,
  mode = 'mockup'
}) {
  if (!activeDomain) return null;

  const beneficiaryName = currentUser?.name || (language === 'hi' ? 'लाभार्थी उद्यमी' : 'Beneficiary Entrepreneur');
  // The user's own answer, marked self-declared as the PDF does; nothing when they gave none.
  // It said "SC · Verified" by default, though nobody checks caste (teammate review, 11 Nov 2026).
  const beneficiaryCategory = currentUser?.category ? `${currentUser.category}, self-declared` : null;
  const fmt = (v) => (formatINR ? formatINR(v) : `₹${v}`);
  const isMockup = mode !== 'production';

  return (
    <div className="bg-[#F8F6F0] rounded-2xl p-5 border border-[#E9ECEF] space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
        <div>
          <span className="text-[11px] font-mono-num text-[#0E7A53] font-semibold">
            For the bank / State Channelising Agency
          </span>
          <h4 className="font-bold text-sm text-[#111311] font-sans-ui">
            1-Page Detailed Project Report (DPR)
          </h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-[#686D65] hover:text-[#111311] font-semibold cursor-pointer font-sans-ui"
        >
          Close
        </button>
      </div>

      <div className="p-4 rounded-xl bg-white border border-[#E9ECEF] space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[#686D65]">Business:</span>
          <span className="font-bold text-[#111311] font-sans-ui">{activeDomain.name} ({activeDomain.code})</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#686D65]">Applicant:</span>
          <span className="font-bold text-[#111311] font-sans-ui">
            {beneficiaryName}{beneficiaryCategory ? ` (${beneficiaryCategory})` : ''}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#686D65]">NSFDC loan:</span>
          <span className="font-bold text-[#0E7A53] font-mono-num">
            {isMockup ? 'see dashboard'
              : loanStructure ? `${fmt(loanStructure.loanAmount)} @ ${loanStructure.interestRatePA}% p.a. [S1]`
              : loanInputs?.error ? `Not worked out: ${loanInputs.error}`
              : loanInputs?.result && !loanInputs.result.isEligible
                ? (loanInputs.result.status === 'not_covered' ? 'Not covered by the NSFDC loan schemes [S1]' : 'Not eligible for NSFDC loans [S1]')
              : loanInputs?.ready ? 'Working out the loan…'
              : 'पहले लागत, कमाई और SC जानकारी भरें। / NOT FOUND: enter your project cost, income and SC status in the NSFDC Amortizer'}
          </span>
        </div>
        {!isMockup && loanStructure && (
          <div className="flex justify-between">
            <span className="text-[#686D65]">Your own money:</span>
            <span className="font-bold text-[#111311] font-mono-num">
              {fmt(loanStructure.promoterEquity)} ({loanStructure.promoterEquityPct}%) [CALCULATED]
            </span>
          </div>
        )}
        <p className="text-[11px] text-[#686D65] pt-1">
          Made by the server from verified sources: loan, quarterly summary, your answers to the business questions,
          gaps (NOT FOUND) and sources, each figure tagged. Advisory document only: not a loan sanction.
        </p>
      </div>

      <button
        type="button"
        onClick={onDownloadPdf}
        className="w-full py-2.5 rounded-xl bg-[#111311] text-white font-bold text-xs shadow-md hover:bg-slate-800 transition-all flex items-center justify-center space-x-1.5 cursor-pointer font-sans-ui"
      >
        <Download className="w-4 h-4 text-emerald-400" />
        <span>Download DPR PDF</span>
      </button>
    </div>
  );
}
