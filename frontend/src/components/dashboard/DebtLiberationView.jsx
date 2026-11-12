import React from 'react';
import { AlertTriangle } from 'lucide-react';
import HowWeGotThis from './HowWeGotThis';

/**
 * DebtLiberationView — Mode B Informal Moneylender Debt Refinancing
 * Interactive sliders for predatory debt consolidation, dialectal rate quotes,
 * and Rule of Damdupat statutory defense under the Usurious Loans Act 1918.
 */
export default function DebtLiberationView({
  debtPrincipal = 120000,
  onPrincipalChange,
  debtRateSenkda = 3.0,
  onRateChange,
  debtMonthsActive = 36,
  onMonthsActiveChange,
  debtIncome = '',
  onDebtIncomeChange,
  debtRefinanceData,
  debtUpdating = false,
  onClose,
  formatINR,
  debtEntered = true,
  mode = 'mockup'
}) {
  const isMockup = mode !== 'production';
  const d = debtRefinanceData || {};
  const hasFigures = !isMockup && typeof d.monthlyBleed === 'number';

  return (
    <div className="bg-[#F8F6F0] rounded-2xl p-5 border border-[#E9ECEF] space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
        <div>
          <span className="text-[11px] font-mono-num text-[#E86043] font-semibold">
            Pay off a moneylender loan
          </span>
          <h4 className="font-bold text-sm text-[#111311] font-sans-ui">
            Moneylender Consolidation Calculator
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

      <div className="space-y-3 text-xs">
        <div>
          <div className="flex justify-between font-semibold text-[#111311] mb-1">
            <span>Informal Moneylender Principal:</span>
            <span className="font-bold text-[#E86043] font-mono-num">
              {debtEntered ? (formatINR ? formatINR(debtPrincipal) : `₹${debtPrincipal}`) : 'not entered: move the slider'}
            </span>
          </div>
          <input
            type="range"
            min={20000}
            max={300000}
            step={10000}
            value={debtPrincipal}
            onChange={(e) => onPrincipalChange && onPrincipalChange(parseFloat(e.target.value))}
            className="w-full accent-[#E86043] cursor-pointer"
          />
        </div>

        <div>
          <label className="font-semibold text-[#111311] block mb-1">
            Informal Rate (Dialectal Quote):
          </label>
          <select
            value={debtEntered ? debtRateSenkda : ''}
            onChange={(e) => e.target.value !== '' && onRateChange && onRateChange(parseFloat(e.target.value))}
            className="w-full bg-white border border-[#E9ECEF] rounded-xl p-2 text-xs font-semibold focus:outline-none cursor-pointer font-sans-ui"
          >
            {!debtEntered && <option value="">Choose the moneylender's rate</option>}
            <option value={3.0}>3 senkda (3% per month / 36% APR)</option>
            <option value={4.0}>4 senkda (4% per month / 48% APR)</option>
            <option value={5.0}>5 senkda (5% per month / 60% APR)</option>
            <option value={2.5}>2.5 senkda (2.5% per month / 30% APR)</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between font-semibold text-[#111311] mb-1">
            <span>Debt Active Duration:</span>
            <span className="font-bold text-[#E86043] font-mono-num">{debtEntered ? `${debtMonthsActive} months` : 'not entered'}</span>
          </div>
          <input
            type="range"
            min={1}
            max={48}
            step={1}
            value={debtMonthsActive}
            onChange={(e) => onMonthsActiveChange && onMonthsActiveChange(parseInt(e.target.value, 10))}
            className="w-full accent-[#E86043] cursor-pointer"
          />
        </div>

        {/* Household income: typed by the user, never assumed. The server used to assume
            35,000 a month for everyone (teammate review, 11 Nov 2026). */}
        {!isMockup && (
          <div>
            <label className="font-semibold text-[#111311] block mb-1" htmlFor="debt-income">
              परिवार की मासिक कमाई / Household income per month (rupees):
            </label>
            <input
              id="debt-income"
              type="number"
              min={0}
              inputMode="numeric"
              value={debtIncome}
              onChange={(e) => onDebtIncomeChange && onDebtIncomeChange(e.target.value)}
              placeholder="e.g. 12000"
              className="w-full bg-white border border-[#E9ECEF] rounded-xl p-2 text-xs font-semibold focus:outline-none font-sans-ui"
            />
          </div>
        )}
      </div>

      {/* Typing fix (Stage A): one line in a fixed space while new figures are worked out. */}
      {hasFigures && (
        <p className="h-4 text-[11px] text-[#686D65]" aria-live="polite">{debtUpdating ? 'Updating…' : ''}</p>
      )}
      {!hasFigures ? (
        <p className="p-3 rounded-xl bg-white border border-[#E9ECEF] text-xs text-[#686D65] whitespace-pre-line">
          {isMockup ? 'Sign in and open the dashboard to see the refinancing figures (see dashboard).'
            : !debtEntered ? 'आपका साहूकारी कर्ज़ अभी नहीं भरा गया।\nYour moneylender debt: NOT FOUND. Move the sliders or choose the rate to enter your own debt.'
            : d.offline ? 'सर्वर बंद है।\nServer offline: the refinancing figures need the server. NOT FOUND.'
            : d.error ? `Refinancing figures not available: ${d.error}`
            : 'Working out the refinancing figures…'}
        </p>
      ) : (
        <>
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#686D65]">Current moneylender interest:</span>
              <span className="font-bold text-red-600 font-mono-num">
                {formatINR ? formatINR(d.monthlyBleed) : `₹${d.monthlyBleed}`} / mo
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#686D65]">
                New EMI{d.pathwayName ? ` (${d.pathwayName}${typeof d.formalRatePct === 'number' ? `, ${d.formalRatePct}%` : ''})` : ''}:
              </span>
              <span className="font-bold text-[#0E7A53] font-mono-num">
                {formatINR ? formatINR(d.newEmi) : `₹${d.newEmi}`} / mo
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-emerald-200 font-bold">
              <span className="text-[#111311]">Net monthly cash relief:</span>
              <span className={`font-mono-num ${d.monthlyCashRelief >= 0 ? 'text-[#0E7A53]' : 'text-amber-600'}`}>
                {d.monthlyCashRelief >= 0 ? '+' : ''}{formatINR ? formatINR(d.monthlyCashRelief) : `₹${d.monthlyCashRelief}`} / month
              </span>
            </div>
            {typeof d.incomeShareBeforePct === 'number' && typeof d.incomeShareAfterPct === 'number' ? (
              <div className="flex justify-between">
                <span className="text-[#686D65]">Share of your income going to the debt:</span>
                <span className="font-bold font-mono-num text-[#111311]">
                  {d.incomeShareBeforePct}% now → {d.incomeShareAfterPct}% after
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-[#686D65] whitespace-pre-line">
                {'यह जानकारी अभी नहीं है: कमाई का हिस्सा (1)\nWe don\'t have this yet: share of your income (1). Enter your household income above.'}
              </p>
            )}
            <HowWeGotThis tags={[d.tag]} />
          </div>

          {d.damdupatViolated && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-800 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>
                Interest already paid is more than the loan. Under an old law, the moneylender may not be able to ask for more interest. Check with free legal aid.
                <HowWeGotThis
                  tags={[d.tag]}
                  working={`Interest paid so far: ${formatINR ? formatINR(d.paidToDate) : `₹${d.paidToDate}`} over ${d.monthsActive} months; loan: ${formatINR ? formatINR(d.principal) : `₹${d.principal}`}.`}
                  notes={[
                    'Rule of Damdupat (Usurious Loans Act 1918): interest charged may not be more than the loan itself.',
                    'The team\'s engine shows this note when interest paid is equal to or more than the loan (paid ≥ loan).',
                    'ASSUMED: team\'s engine, not verified; check with legal aid.'
                  ]}
                />
              </span>
            </div>
          )}
        </>
      )}

      {/* The "Generate Legal Settlement Package" button made nothing; removed (Stage A). */}
    </div>
  );
}
