import React from 'react';

/**
 * SeasonalitySimulatorView — 12-Month Seasonality & August Lean Trough Simulator
 * Visualizes cyclical agro-rural cash flow multipliers and dynamic DSCR solvency.
 */
export default function SeasonalitySimulatorView({
  activeDomain,
  onClose,
  onNavigateAmortizer,
  formatINR
}) {
  if (!activeDomain) return null;

  const seasonality = activeDomain.seasonality || [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  const months = activeDomain.months || ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

  return (
    <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-[#E9ECEF] space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
        <div>
          <span className="text-[11px] font-mono-num text-[#0E7A53] font-semibold">
            Seasonality & Stress Simulator
          </span>
          <h4 className="font-bold text-sm text-[#111311] font-sans-ui">
            {activeDomain.name} ({activeDomain.code})
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

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-white border border-[#E9ECEF]">
          <span className="text-[#686D65]">Total Project Cost:</span>
          <p className="text-base font-bold text-[#111311] font-mono-num">
            {formatINR ? formatINR(activeDomain.cost) : `₹${activeDomain.cost}`}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#E9ECEF]">
          <span className="text-[#686D65]">Annual Cash Flow (NOCF):</span>
          <p className="text-base font-bold text-[#0E7A53] font-mono-num">
            {formatINR ? formatINR(activeDomain.annualNocf) : `₹${activeDomain.annualNocf}`}
          </p>
        </div>
      </div>

      <div className="pt-2">
        <span className="text-[11px] font-semibold text-[#686D65]">
          12-Month Seasonal Multipliers (August Lean Trough Stress):
        </span>
        <div className="grid grid-cols-12 gap-1 h-24 items-end pt-3 pb-1 border-b border-[#E9ECEF]">
          {seasonality.map((m, idx) => (
            <div key={idx} className="h-full flex flex-col justify-end items-center group relative">
              <div
                className={`w-full rounded-t transition-all ${
                  m < 0.8 ? 'bg-orange-400' : 'bg-[#0E7A53]'
                }`}
                style={{ height: `${Math.round(m * 65)}%` }}
                title={`${months[idx]}: ${m}x`}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-12 text-center text-[11px] text-[#686D65] font-mono-num pt-1">
          {months.map((m, idx) => (
            <span key={idx}>{m}</span>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-xs font-bold text-[#0E7A53] font-sans-ui">
          Solvency Rating: SAFE (DSCR {activeDomain.dscr}x)
        </span>
        <button
          type="button"
          onClick={onNavigateAmortizer}
          className="px-3 py-1.5 rounded-xl bg-[#111311] text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer font-sans-ui"
        >
          View Repayment Schedule &rarr;
        </button>
      </div>
    </div>
  );
}
