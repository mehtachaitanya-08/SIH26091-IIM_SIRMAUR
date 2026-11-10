import React from 'react';
import { Download } from 'lucide-react';

/**
 * LeadBankDprView — 1-Page Lead-Bank Detailed Project Report Appraisal
 * Implements RBI Lead Bank Scheme standard (1969) credit appraisal summary
 * with bank-sanction PDF export capability.
 */
export default function LeadBankDprView({
  activeDomain,
  loanStructure,
  currentUser = null,
  language = 'en',
  onClose,
  onDownloadPdf,
  formatINR,
  mode = 'mockup'
}) {
  if (!activeDomain || !loanStructure) return null;

  const beneficiaryName = currentUser?.name || (language === 'hi' ? 'लाभार्थी उद्यमी' : 'Beneficiary Entrepreneur');
  const beneficiaryCategory = currentUser?.category ? `${currentUser.category} · Verified` : 'SC · Verified';

  return (
    <div className="bg-[#F8F6F0] rounded-2xl p-5 border border-[#E9ECEF] space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
        <div>
          <span className="text-[11px] font-mono-num text-[#0E7A53] font-semibold">
            RBI Lead Bank Scheme Standard (1969)
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
          <span className="text-[#686D65]">Enterprise Name:</span>
          <span className="font-bold text-[#111311] font-sans-ui">{activeDomain.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#686D65]">Beneficiary:</span>
          <span className="font-bold text-[#111311] font-sans-ui">
            {beneficiaryName} ({beneficiaryCategory})
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#686D65]">Sanction Loan:</span>
          <span className="font-bold text-[#0E7A53] font-mono-num">
            {formatINR ? formatINR(loanStructure.loanAmount) : `₹${loanStructure.loanAmount}`} @ {loanStructure.interestRatePA}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#686D65]">Promoter Equity Margin:</span>
          <span className="font-bold text-[#111311] font-mono-num">
            {formatINR ? formatINR(loanStructure.promoterEquity) : `₹${loanStructure.promoterEquity}`} ({loanStructure.promoterEquityPct}%)
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#686D65]">Lead-Bank QR Hash:</span>
          <span className="font-mono-num text-[11px] text-[#686D65]">
            SHA256: 290bfbc47a9d3e8...mosje_nsfdc_verified
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onDownloadPdf}
        className="w-full py-2.5 rounded-xl bg-[#111311] text-white font-bold text-xs shadow-md hover:bg-slate-800 transition-all flex items-center justify-center space-x-1.5 cursor-pointer font-sans-ui"
      >
        <Download className="w-4 h-4 text-emerald-400" />
        <span>Download Bank-Sanction PDF</span>
      </button>
    </div>
  );
}
