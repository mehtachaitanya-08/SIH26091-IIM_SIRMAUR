import React from 'react';
import { AlertTriangle } from 'lucide-react';

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
  debtRefinanceData,
  onClose,
  onGenerateLegalPackage,
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
            Mode B · Informal Debt Refinancing
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
      </div>

      {!hasFigures ? (
        <p className="p-3 rounded-xl bg-white border border-[#E9ECEF] text-xs text-[#686D65]">
          {isMockup ? 'Sign in and open the dashboard to see the refinancing figures (see dashboard).'
            : !debtEntered ? 'Your moneylender debt: NOT FOUND. Move the sliders or choose the rate to enter your own debt.'
            : d.offline ? 'Server offline: the refinancing figures need the server. NOT FOUND.'
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
            {d.tag && <p className="text-[10px] text-amber-700 pt-1">{d.tag}</p>}
          </div>

          {d.damdupatViolated && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-800 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>
                <strong>Rule of Damdupat Triggered:</strong> Total interest paid ({formatINR ? formatINR(d.paidToDate) : `₹${d.paidToDate}`} over {d.monthsActive} months) exceeds principal ({formatINR ? formatINR(d.principal) : `₹${d.principal}`}). Moneylender barred from demanding further interest under Usurious Loans Act 1918! (ASSUMED: team's engine, not verified; check with legal aid.)
              </span>
            </div>
          )}
        </>
      )}

      <button
        type="button"
        onClick={onGenerateLegalPackage}
        className="w-full py-2.5 rounded-xl bg-[#111311] text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer font-sans-ui"
      >
        Generate Legal Settlement Package ↗
      </button>
    </div>
  );
}
