import React from 'react';

/**
 * SeasonalitySimulatorView — Business season and cash-flow cover
 * The verified business data has no month-by-month multipliers, no annual cash flow and no
 * cover ratio (DSCR) for any business, so all three show NOT FOUND instead of a made-up curve.
 * What the sources do say about the season is in the feasibility report (season section).
 */
export default function SeasonalitySimulatorView({
  activeDomain,
  onClose,
  onNavigateAmortizer,
  onNavigateFeasibility,
  formatINR,
  mode = 'mockup'
}) {
  if (!activeDomain) return null;
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const isMockup = mode !== 'production';

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

      {isMockup ? (
        <p className="text-xs text-[#686D65]">Sign in and open the dashboard for your business's season and cash flow (see dashboard).</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-[#E9ECEF]">
              <span className="text-[#686D65]">Annual cash flow (NOCF):</span>
              <p className="text-base font-bold text-[#111311]">NOT FOUND</p>
              <p className="text-[10px] text-[#686D65]">No verified figure for this business.</p>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E9ECEF]">
              <span className="text-[#686D65]">Cash-flow cover (DSCR):</span>
              <p className="text-base font-bold text-[#111311]">NOT FOUND</p>
              <p className="text-[10px] text-[#686D65]">Needs your own cash-flow figures; no rating is shown.</p>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-[11px] font-semibold text-[#686D65]">
              12-month season pattern:
            </span>
            <div className="grid grid-cols-12 gap-1 pt-3 pb-1 border-b border-[#E9ECEF] text-center text-[10px] text-[#686D65]">
              {months.map((m) => (
                <div key={m} className="space-y-1">
                  <div className="h-10 rounded-t bg-slate-200/70 flex items-end justify-center pb-1">–</div>
                  <span className="font-mono-num">{m}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#686D65] pt-2">
              Month-by-month multipliers: NOT FOUND in official sources. What the sources say about the season is in the
              feasibility report.
            </p>
          </div>
        </>
      )}

      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={onNavigateFeasibility}
          className="text-xs font-bold text-[#0E7A53] hover:underline cursor-pointer font-sans-ui"
        >
          Open feasibility report
        </button>
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
