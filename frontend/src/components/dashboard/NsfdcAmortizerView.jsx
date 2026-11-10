import React from 'react';

/**
 * NsfdcAmortizerView — NSFDC Statutory Amortizer
 * Displays equated quarterly repayment schedule (EQI), moratorium quarters,
 * and promoter margin breakdown.
 */
export default function NsfdcAmortizerView({
  loanStructure,
  amortizationSchedule,
  onClose,
  onNavigateDpr,
  formatINR
}) {
  if (!loanStructure || !amortizationSchedule) return null;

  return (
    <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-[#E9ECEF] space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
        <div>
          <span className="text-[11px] font-mono-num text-[#686D65] font-semibold uppercase tracking-wider">
            NSFDC Statutory Amortizer
          </span>
          <h4 className="font-bold text-sm text-[#111311] font-sans-ui mt-0.5">
            Quarterly Repayment Schedule ({loanStructure.repaymentQuarters} Repay Quarters @ {loanStructure.interestRatePA}% p.a.)
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

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-white border border-[#E9ECEF]">
          <span className="text-[#686D65] block text-[11px]">Sanction Loan</span>
          <p className="font-bold text-[#111311] font-mono-num text-sm mt-0.5">
            {formatINR ? formatINR(loanStructure.loanAmount) : `₹${loanStructure.loanAmount}`}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#E9ECEF]">
          <span className="text-[#686D65] block text-[11px]">Promoter Margin</span>
          <p className="font-bold text-[#111311] font-mono-num text-sm mt-0.5">
            {formatINR ? formatINR(loanStructure.promoterEquity) : `₹${loanStructure.promoterEquity}`}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#E9ECEF]">
          <span className="text-[#686D65] block text-[11px]">Equated Quarterly (EQI)</span>
          <p className="font-bold text-[#111311] font-mono-num text-sm mt-0.5">
            {formatINR ? formatINR(amortizationSchedule.equatedQuarterlyInstallment) : `₹${amortizationSchedule.equatedQuarterlyInstallment}`}
          </p>
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto border border-[#E9ECEF] rounded-xl bg-white text-[11px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F8F9FA] text-[#686D65] sticky top-0 border-b border-[#E9ECEF]">
            <tr>
              <th className="p-2.5 font-semibold text-left">Quarter</th>
              <th className="p-2.5 font-semibold text-left">Type</th>
              <th className="p-2.5 font-semibold text-right">Principal</th>
              <th className="p-2.5 font-semibold text-right">Interest</th>
              <th className="p-2.5 font-semibold text-right">Instalment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E9ECEF] font-mono-num">
            {(amortizationSchedule.quarters || []).slice(0, 6).map((q) => (
              <tr key={q.quarter} className={q.isMoratorium ? 'bg-amber-50/40' : ''}>
                <td className="p-2.5 font-bold text-[#111311]">Q{q.quarter}</td>
                <td className="p-2.5">
                  {q.isMoratorium ? (
                    <span className="text-[11px] font-semibold text-amber-800">
                      Moratorium
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#686D65]">
                      Amortizing
                    </span>
                  )}
                </td>
                <td className="p-2.5 text-right">{formatINR ? formatINR(q.principalPayment) : `₹${q.principalPayment}`}</td>
                <td className="p-2.5 text-right text-slate-600">{formatINR ? formatINR(q.interestPayment) : `₹${q.interestPayment}`}</td>
                <td className="p-2.5 text-right font-bold text-[#111311]">{formatINR ? formatINR(q.totalInstallment) : `₹${q.totalInstallment}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-1 text-xs">
        <span className="text-[#686D65] font-sans-ui">
          Showing initial quarters of {loanStructure.totalQuarters} total quarters ({loanStructure.tenureYears}-Year Tenure)
        </span>
        <button
          type="button"
          onClick={onNavigateDpr}
          className="px-3 py-1.5 rounded-xl bg-[#111311] text-white font-bold hover:bg-slate-800 transition-all cursor-pointer font-sans-ui"
        >
          Generate Lead-Bank DPR ↗
        </button>
      </div>
    </div>
  );
}
