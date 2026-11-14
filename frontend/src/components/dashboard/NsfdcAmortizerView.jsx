import React from 'react';
import HowWeGotThis, { plainTag } from './HowWeGotThis';
import { plainSizes } from '../../services/dossierView';

/**
 * NsfdcAmortizerView — "Your loan and repayments": the NSFDC loan and its schedule (a payment every 3 months).
 * Stage A: plain words on screen; source tags and ASSUMED notes sit under "How we got this".
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
  const tag = (k) => (tags[k] ? <HowWeGotThis tags={[tags[k]]} /> : null);
  const result = loanInputs && loanInputs.result;

  let body;
  if (mode !== 'production' || !loanInputs) {
    body = <p className="text-xs text-[#686D65]">Sign in and open the dashboard to work out your NSFDC loan (see dashboard).</p>;
  } else if (loanInputs.error) {
    body = <p className="text-xs font-semibold text-red-700">Could not work out the loan: {loanInputs.error}</p>;
  } else if (!loanInputs.ready) {
    body = (
      <p className="text-xs text-[#111311]">
        {/* Hindi first, English under it (owner's decision, 11 Nov 2026). */}
        <span className="block">ऊपर लागत, परिवार की सालाना कमाई और SC जानकारी भरें, फिर लोन दिखेगा।</span>
        Loan and repayment schedule: NOT FOUND until you pick a size (or type your project cost) and enter
        your family income and SC status above.
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
        {(result.rejectionReasons || []).map((r, i) => <p key={i}>• {r}</p>)}
        {(result.recommendedAlternatives || []).length > 0 && (
          <p className="text-[11px] text-[#686D65]">
            Other schemes to look at (check each scheme's own rules): {result.recommendedAlternatives.join('; ')}
          </p>
        )}
        <HowWeGotThis tags={['S1']} notes={(result.recommendedAlternatives || []).length > 0 ? ['ASSUMED: the other schemes are not sourced; check each scheme\'s own guidelines.'] : []} />
      </div>
    );
  } else {
    body = (
      <>
        <p className="text-[11px] text-[#686D65]">
          {loanStructure.schemeName} ·{' '}
          {loanStructure.repaymentQuarters} payments, one every 3 months, after a pause of {loanStructure.moratoriumQuarters * 3} months with no payment ·{' '}
          interest {loanStructure.interestRatePA}% a year
          {loanStructure.offline && <span className="ml-1 font-semibold text-red-700">(worked out in your browser: server offline)</span>}
        </p>
        <HowWeGotThis tags={['S1']} working={`NSFDC rules: ${loanStructure.repaymentQuarters} payments of 3 months each after a ${loanStructure.moratoriumQuarters}-quarter pause, ${loanStructure.interestRatePA}% interest a year.`} />
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
            <span className="text-[#686D65]">Payment every 3 months:</span>
            <p className="font-bold text-[#E86043] font-mono-num">{fmt(amortizationSchedule.equatedQuarterlyInstallment)}</p>
            {tag('equatedQuarterlyInstallment')}
          </div>
        </div>
        <p className="text-[11px] text-[#686D65]">
          Interest during the pause, added to the loan: {fmt(loanStructure.interestAddedDuringPause)} ·
          Total paid over the loan: {fmt(loanStructure.totalDebtService)}
        </p>
        <HowWeGotThis tags={[tags.interestAddedDuringPause || 'CALCULATED']} working="Total paid over the loan: CALCULATED (all payments in the schedule below added up)." />
        {(result.warnings || []).map((w) => (
          <div key={w.code} role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-800">
            Warning: {w.text}
            <HowWeGotThis tags={[w.tag]} />
          </div>
        ))}
        {(result.notes || []).map((n, i) => (
          <div key={i} className="text-[11px] text-[#686D65]">Note: {n.text} <HowWeGotThis tags={[n.tag]} /></div>
        ))}

        <div className="max-h-48 overflow-y-auto border border-[#E9ECEF] rounded-xl bg-white text-[11px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F8F9FA] text-[#686D65] sticky top-0 border-b border-[#E9ECEF]">
              <tr>
                <th className="p-2">Every 3 months</th>
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
                  <td className="p-2 font-bold">{q.quarter}</td>
                  <td className="p-2">
                    {q.isMoratorium ? (
                      <span className="text-[11px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">Pause (no payment)</span>
                    ) : (
                      <span className="text-[11px] bg-emerald-100 text-[#0E7A53] px-1.5 py-0.5 rounded font-medium">Paying back</span>
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
        <p className="text-[10px] text-[#686D65]">Advice only, not a loan sanction.</p>
        <HowWeGotThis notes={[
          'ASSUMED: loan rounded down to the rupee.',
          'ASSUMED: interest during the pause is added to the loan (NSFDC does not say how it is handled).',
          `ASSUMED: repaid over exactly ${loanStructure.tenureYears} years (${loanStructure.totalQuarters} periods of 3 months); NSFDC says "within".`
        ]} />
      </>
    );
  }

  return (
    <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-[#E9ECEF] space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
        <div>
          <span className="text-[11px] font-mono-num text-[#686D65] font-semibold uppercase tracking-wider">
            Your loan and repayments
          </span>
          <h4 className="font-bold text-sm text-[#111311] font-sans-ui mt-0.5">Repayment schedule, a payment every 3 months</h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-[#686D65] hover:text-[#111311] font-semibold cursor-pointer font-sans-ui"
        >
          Close
        </button>
      </div>

      {mode === 'production' && loanInputs && (loanInputs.tiers || []).length > 0 && (
        <div className="space-y-1 text-xs">
          <span className="font-semibold text-[#111311]">Sizes in this business's research file (pick one, or type your own cost):</span>
          <div className="flex flex-wrap gap-2">
            {/* Sizes with no cost in the dossier are listed once below, not as greyed NOT FOUND buttons
                (teammate review, 11 Nov 2026). */}
            {loanInputs.tiers.map((t, i) => ({ ...t, plain: plainSizes(loanInputs.tiers)[i].plainLabel })).filter((t) => !t.disabled).map((t) => {
              const picked = !t.disabled && String(t.cost) === String(loanInputs.projectCost);
              return (
                <button
                  key={t.label}
                  type="button"
                  disabled={t.disabled}
                  onClick={() => !t.disabled && loanInputs.onPickTier(t.cost)}
                  title={plainTag(t.tag)}
                  className={`px-3 py-1.5 rounded-xl border text-left font-sans-ui ${
                    t.disabled ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                      : picked ? 'bg-[#111311] text-white border-[#111311] cursor-pointer'
                      : 'bg-white text-[#111311] border-[#E9ECEF] hover:border-[#111311]/40 cursor-pointer'
                  }`}
                >
                  <span className="block font-semibold">{t.plain}</span>
                  <span className="block font-mono-num">{t.disabled ? 'NOT FOUND' : fmt(t.cost)}</span>
                </button>
              );
            })}
          </div>
          <HowWeGotThis
            tags={[...new Set(loanInputs.tiers.filter((t) => t.tag).map((t) => t.tag))]}
            notes={plainSizes(loanInputs.tiers).map((n) => `${n.plainLabel} = "${n.originalLabel}" in the research file`)}
          />
          {loanInputs.tiers.some((t) => t.disabled) && (
            <p className="text-[11px] text-[#686D65] whitespace-pre-line">
              {(() => {
                const names = plainSizes(loanInputs.tiers);
                const gone = names.filter((n, i) => loanInputs.tiers[i].disabled).map((n) => n.plainLabel);
                return `यह जानकारी अभी नहीं है: लागत (${gone.join(', ')})\n`
                  + `${gone.join(', ')}: cost not in research file. Type your own cost instead.`;
              })()}
            </p>
          )}
        </div>
      )}

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

      {/* Typing fix (Stage A): the last loan stays on screen; this one line, in a fixed space,
          says a new one is being worked out. */}
      {mode === 'production' && loanInputs && result && !loanInputs.error && (
        <p className="h-4 text-[11px] text-[#686D65]" aria-live="polite">{loanInputs.updating ? 'Updating…' : ''}</p>
      )}
      {body}

      <div className="flex justify-end items-center pt-1 text-xs">
        <button
          type="button"
          onClick={onNavigateDpr}
          className="px-3 py-1.5 rounded-xl bg-[#111311] text-white font-bold hover:bg-slate-800 transition-all cursor-pointer font-sans-ui"
        >
          Download report (DPR) ↗
        </button>
      </div>
    </div>
  );
}
