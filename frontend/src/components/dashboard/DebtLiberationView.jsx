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
  formatINR
}) {
  if (!debtRefinanceData) return null;

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
              {formatINR ? formatINR(debtPrincipal) : `₹${debtPrincipal}`}
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
            value={debtRateSenkda}
            onChange={(e) => onRateChange && onRateChange(parseFloat(e.target.value))}
            className="w-full bg-white border border-[#E9ECEF] rounded-xl p-2 text-xs font-semibold focus:outline-none cursor-pointer font-sans-ui"
          >
            <option value={3.0}>3 senkda (3% per month / 36% APR)</option>
            <option value={4.0}>4 senkda (4% per month / 48% APR)</option>
            <option value={5.0}>5 senkda (5% per month / 60% APR)</option>
            <option value={2.5}>2.5 senkda (2.5% per month / 30% APR)</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between font-semibold text-[#111311] mb-1">
            <span>Debt Active Duration:</span>
            <span className="font-bold text-[#E86043] font-mono-num">{debtMonthsActive} months</span>
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

      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-[#686D65]">Current Predatory Bleed:</span>
          <span className="font-bold text-red-600 font-mono-num">
            {formatINR ? formatINR(debtRefinanceData.monthlyBleed) : `₹${debtRefinanceData.monthlyBleed}`} / mo
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#686D65]">New NSFDC Concessional EMI:</span>
          <span className="font-bold text-[#0E7A53] font-mono-num">
            {formatINR ? formatINR(debtRefinanceData.newEmi) : `₹${debtRefinanceData.newEmi}`} / mo
          </span>
        </div>
        <div className="flex justify-between pt-1 border-t border-emerald-200 font-bold">
          <span className="text-[#111311]">Net Monthly Cash Relief:</span>
          <span className={`font-mono-num ${debtRefinanceData.monthlyCashRelief >= 0 ? 'text-[#0E7A53]' : 'text-amber-600'}`}>
            {debtRefinanceData.monthlyCashRelief >= 0 ? '+' : ''}{formatINR ? formatINR(debtRefinanceData.monthlyCashRelief) : `₹${debtRefinanceData.monthlyCashRelief}`} / month
          </span>
        </div>
      </div>

      {debtRefinanceData.damdupatViolated && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-800 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>
            <strong>Rule of Damdupat Triggered:</strong> Total interest paid ({formatINR ? formatINR(debtRefinanceData.paidToDate) : `₹${debtRefinanceData.paidToDate}`} over {debtRefinanceData.monthsActive} months) exceeds principal ({formatINR ? formatINR(debtRefinanceData.principal) : `₹${debtRefinanceData.principal}`}). Moneylender barred from demanding further interest under Usurious Loans Act 1918!
          </span>
        </div>
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
