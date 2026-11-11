import React from 'react';
import { seasonBars, dscrRows } from '../../services/dossierView';

/**
 * SeasonalitySimulatorView — Business season and cash-flow cover, from the business's dossier
 * Season bars: the dossier's 12 monthly multipliers. Surplus and cash-flow cover (DSCR): the dossier's
 * own figures for the size matching the project cost (or the nearest size, ASSUMED). Each figure is
 * labelled "<code> dossier"; what the dossier does not state shows NOT FOUND.
 */
export default function SeasonalitySimulatorView({
  activeDomain,
  onClose,
  onNavigateAmortizer,
  onNavigateFeasibility,
  dossierDetail = null,
  dossierCashflow = null,
  formatINR,
  mode = 'mockup'
}) {
  if (!activeDomain) return null;
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const isMockup = mode !== 'production';
  const bars = seasonBars(dossierDetail?.seasonality);
  const cover = dscrRows(dossierCashflow);
  const tier = dossierCashflow?.tier;
  const surplus = tier?.surplus;
  const tag = `${activeDomain.code} dossier`;
  const fmt = (v) => (formatINR ? formatINR(v) : `₹${v}`);

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
              <span className="text-[#686D65]">
                Surplus{surplus?.basis ? `, ${surplus.basis}` : ''}{tier ? ` (${tier.label})` : ''}:
              </span>
              {surplus && typeof surplus.value === 'number' ? (
                <>
                  <p className="text-base font-bold text-[#111311] font-mono-num">
                    {fmt(surplus.value)} <span className="text-[11px] font-normal">{surplus.period === 'year' ? 'a year (Year 3)' : 'a month'}</span>
                  </p>
                  <p className="text-[10px] text-[#0E7A53]">{surplus.tag}</p>
                </>
              ) : (
                <>
                  <p className="text-base font-bold text-[#111311]">NOT FOUND</p>
                  <p className="text-[10px] text-[#686D65]">{surplus?.reason || dossierCashflow?.reason || 'Enter a project cost in the NSFDC Amortizer.'}</p>
                </>
              )}
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E9ECEF]">
              <span className="text-[#686D65]">Cash-flow cover (DSCR), as printed in the dossier:</span>
              {cover.status === 'ok' ? (
                <ul className="font-mono-num font-bold text-[#111311] text-sm">
                  {cover.rows.map((r) => (
                    <li key={r.year}>Year {r.year}: {r.text}{r.tag && <span className="ml-1 text-[10px] font-normal text-[#0E7A53]">{r.tag}</span>}</li>
                  ))}
                </ul>
              ) : (
                <>
                  <p className="text-base font-bold text-[#111311]">{cover.status === 'waiting' ? '…' : 'NOT FOUND'}</p>
                  <p className="text-[10px] text-[#686D65]">
                    {cover.status === 'offline' ? 'Server offline.' : cover.reason || 'Enter a project cost in the NSFDC Amortizer.'}
                  </p>
                </>
              )}
              {cover.status === 'ok' && (
                <p className="text-[10px] text-[#686D65] pt-1">The dossier's own figure, using its own loan instalment; it can differ from the NSFDC loan tab.</p>
              )}
            </div>
          </div>
          {(dossierCashflow?.assumptions || []).map((a, i) => (
            <p key={i} className="text-[11px] text-amber-800">{a.text} [{a.tag}]</p>
          ))}

          <div className="pt-2">
            <span className="text-[11px] font-semibold text-[#686D65]">
              12-month season pattern {bars ? `(${tag})` : ''}:
            </span>
            {bars ? (
              <>
                <div className="grid grid-cols-12 gap-1 h-24 items-end pt-3 pb-1 border-b border-[#E9ECEF]">
                  {bars.map((b) => (
                    <div key={b.month} className="h-full flex flex-col justify-end items-center">
                      <div
                        className={`w-full rounded-t ${b.lean ? 'bg-orange-400' : 'bg-[#0E7A53]'}`}
                        style={{ height: `${b.heightPct}%` }}
                        title={`${b.month}: ${b.value.toFixed(2)} (${b.tag})`}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-12 text-center text-[10px] text-[#686D65] font-mono-num pt-1">
                  {bars.map((b) => <span key={b.month}>{b.month.slice(0, 3)}<br />{b.value.toFixed(2)}</span>)}
                </div>
                <p className="text-[11px] text-[#686D65] pt-2">
                  Orange: the 3 leanest months. Multipliers as written in the {tag}.
                </p>
              </>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-1 pt-3 pb-1 border-b border-[#E9ECEF] text-center text-[10px] text-[#686D65]">
                  {months.map((m) => (
                    <div key={m} className="space-y-1">
                      <div className="h-10 rounded-t bg-slate-200/70 flex items-end justify-center pb-1">–</div>
                      <span className="font-mono-num">{m}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#686D65] pt-2">
                  Month-by-month multipliers: NOT FOUND in the {tag}. What it says about the season is in the feasibility report.
                </p>
              </>
            )}
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
