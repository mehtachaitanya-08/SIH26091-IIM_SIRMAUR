import React from 'react';

/**
 * NsfdcAmortizerView — NSFDC loan and quarterly repayment schedule
 * Production: the user types project cost, family income and SC status (USER INPUT); the
 * verified server (or, offline, the same rules in the browser) gives the loan and schedule.
 * Nothing is shown until those are entered: NOT FOUND.
 * Mockup (landing page): no figures (see dashboard).
 */
const box = 'w-full bg-white border border-[#E9ECEF] rounded-xl p-2 text-xs font-semibold focus:outline-none font-sans-ui';

export default function NsfdcAmortizerView({
  loanStructure,
  amortizationSchedule,
  loanInputs = null,
  onClose,
  onNavigateDpr,
  formatINR,
  mode = 'mockup'
}) {
  const fmt = (v) => (formatINR ? formatINR(v) : `₹${v}`);
  const tags = (loanStructure && loanStructure.tags) || {};
  const tag = (k) => (tags[k] ? <span className="block text-[10px] font-normal text-[#0E7A53] font-mono-num">{tags[k]}</span> : null);
  const result = loanInputs && loanInputs.result;

  let body;
  if (mode !== 'production' || !loanInputs) {
    body = <p className="text-xs text-[#686D65]">Sign in and open the dashboard to work out your NSFDC loan (see dashboard).</p>;
  } else if (loanInputs.error) {
    body = <p className="text-xs font-semibold text-red-700">Could not work out the loan: {loanInputs.error}</p>;
  } else if (!loanInputs.ready) {
    body = (
      <p className="text-xs text-[#111311]">
        Loan and repayment schedule: NOT FOUND until you enter your project cost, family income and SC status above.
        The business data has no verified project cost, so the loan is worked out from your own figures.
      </p>
    );
  } else if (!result) {
    body = <p className="text-xs text-[#686D65]">Working out the loan…</p>;
  } else if (!result.isEligible) {
    body = (
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
        <p className="font-bold text-[#111311]">
          {result.status === 'not_covered' ? 'Not covered by the NSFDC loan schemes.' : 'Not eligible for NSFDC loans.'}
        </p>
        {(result.rejectionReasons || []).map((r, i) => <p key={i}>• {r} <span className="text-[10px] text-[#0E7A53]">[S1]</span></p>)}
        {(result.recommendedAlternatives || []).length > 0 && (
          <p className="text-[11px] text-[#686D65]">
            Other schemes to look at (ASSUMED: not sourced, check each scheme's own guidelines): {result.recommendedAlternatives.join('; ')}
          </p>
        )}
      </div>
    );
  } else {
    body = (
      <>
        <p className="text-[11px] text-[#686D65]">
          {loanStructure.schemeName} <span className="text-[#0E7A53]">[S1]</span> ·{' '}
          {loanStructure.repaymentQuarters} quarterly instalments after a {loanStructure.moratoriumQuarters}-quarter pause ·{' '}
          {loanStructure.interestRatePA}% p.a. [S1]
          {loanStructure.offline && <span className="ml-1 font-semibold text-red-700">(worked out in your browser: server offline)</span>}
        </p>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-[#E9ECEF]">
            <span className="text-[#686D65]">NSFDC loan:</span>
            <p className="font-bold text-[#111311] font-mono-num">{fmt(loanStructure.loanAmount)}</p>
            {tag('loanAmount')}
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-[#E9ECEF]">
            <span className="text-[#686D65]">Your own money:</span>
            <p className="font-bold text-[#111311] font-mono-num">
              {fmt(loanStructure.promoterEquity)} ({loanStructure.promoterEquityPct}%)
            </p>
            {tag('promoterEquity')}
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-[#E9ECEF]">
            <span className="text-[#686D65]">Quarterly instalment:</span>
            <p className="font-bold text-[#E86043] font-mono-num">{fmt(amortizationSchedule.equatedQuarterlyInstallment)}</p>
            {tag('equatedQuarterlyInstallment')}
          </div>
        </div>
        <p className="text-[11px] text-[#686D65]">
          Pause interest added to the loan: {fmt(loanStructure.interestAddedDuringPause)} ({tags.interestAddedDuringPause || 'CALCULATED'}) ·
          Total paid over the loan: {fmt(loanStructure.totalDebtService)} (CALCULATED)
        </p>
        {(result.warnings || []).map((w) => (
          <p key={w.code} role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-800">
            Warning: {w.text} <span className="font-mono-num text-[10px]">[{w.tag}]</span>
          </p>
        ))}
        {(result.notes || []).map((n, i) => (
          <p key={i} className="text-[11px] text-[#686D65]">Note: {n.text} <span className="font-mono-num text-[10px] text-[#0E7A53]">{n.tag}</span></p>
        ))}

        <div className="max-h-48 overflow-y-auto border border-[#E9ECEF] rounded-xl bg-white text-[11px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8F9FA] text-[#686D65] sticky top-0 border-b border-[#E9ECEF]">
              <tr>
                <th className="p-2">Quarter</th>
                <th className="p-2">Type</th>
                <th className="p-2">Principal</th>
                <th className="p-2">Interest paid</th>
                <th className="p-2">Added to loan</th>
                <th className="p-2">Instalment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9ECEF] font-mono-num">
              {(amortizationSchedule.quarters || []).map((q) => (
                <tr key={q.quarter} className={q.isMoratorium ? 'bg-amber-50/50' : ''}>
                  <td className="p-2 font-bold">Q{q.quarter}</td>
                  <td className="p-2">
                    {q.isMoratorium ? (
                      <span className="text-[11px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">Moratorium</span>
                    ) : (
                      <span className="text-[11px] bg-emerald-100 text-[#0E7A53] px-1.5 py-0.5 rounded font-medium">Amortizing</span>
                    )}
                  </td>
                  <td className="p-2">{fmt(q.principalPayment)}</td>
                  <td className="p-2 text-rose-600">{fmt(q.interestPayment)}</td>
                  <td className="p-2">{fmt(q.interestAddedToLoan || 0)}</td>
                  <td className="p-2 font-bold text-[#111311]">{fmt(q.totalInstallment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-[#686D65]">
          ASSUMED: loan rounded down to the rupee; pause interest added to the loan (NSFDC does not say how it is handled);
          repaid over exactly {loanStructure.tenureYears} years ({loanStructure.totalQuarters} quarters), NSFDC says "within".
          Advisory only, not a loan sanction.
        </p>
      </>
    );
  }

  return (
    <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-[#E9ECEF] space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
        <div>
          <span className="text-[11px] font-mono-num text-[#686D65] font-semibold uppercase tracking-wider">
            NSFDC Statutory Amortizer [S1]
          </span>
          <h4 className="font-bold text-sm text-[#111311] font-sans-ui mt-0.5">Quarterly Repayment Schedule</h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-[#686D65] hover:text-[#111311] font-semibold cursor-pointer font-sans-ui"
        >
          Close
        </button>
      </div>

      {mode === 'production' && loanInputs && (
        <div className="grid grid-cols-3 gap-3 text-xs">
          <label className="space-y-1">
            <span className="font-semibold text-[#111311]">Project cost (rupees)</span>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={loanInputs.projectCost}
              onChange={(e) => loanInputs.onProjectCostChange(e.target.value)}
              placeholder="e.g. total cost of machines and set-up"
              className={box}
            />
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-[#111311]">Annual family income (rupees)</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={loanInputs.familyIncome}
              onChange={(e) => loanInputs.onFamilyIncomeChange(e.target.value)}
              placeholder="whole family, per year"
              className={box}
            />
          </label>
          <label className="space-y-1">
            <span className="font-semibold text-[#111311]">Scheduled Caste? (self-declared)</span>
            <select
              value={loanInputs.isSc === true ? 'yes' : loanInputs.isSc === false ? 'no' : ''}
              onChange={(e) => loanInputs.onIsScChange(e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null)}
              className={box}
            >
              <option value="">Choose</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
        </div>
      )}

      {body}

      <div className="flex justify-end items-center pt-1 text-xs">
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
