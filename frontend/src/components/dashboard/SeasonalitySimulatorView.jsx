import React from 'react';
import { seasonBars, dscrRows, seasonPercent, repayLine } from '../../services/dossierView';
import HowWeGotThis from './HowWeGotThis';

/**
 * SeasonalitySimulatorView — "Good and bad months": the business's season and cash-flow cover, from its dossier.
 * Stage A: plain words on screen (whole percent against an average month; "can the business repay?");
 * the research file's own numbers and tags sit under "How we got this".
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
  cashflowUpdating = false,
  costEntered = false,
  formatINR,
  mode = 'mockup'
}) {
  if (!activeDomain) return null;
  const isMockup = mode !== 'production';
  const bars = seasonBars(dossierDetail?.seasonality);
  const cover = dscrRows(dossierCashflow);
  const tier = dossierCashflow?.tier;
  const surplus = tier?.surplus;
  const fmt = (v) => (formatINR ? formatINR(v) : `₹${v}`);

  // Figures the dossier does not state are listed once, in one line, instead of a NOT FOUND box
  // each: for D20 the tab was mostly NOT FOUND boxes (teammate review, 11 Nov 2026). "No cost
  // entered yet" is not missing data, so it gets its own prompt instead.
  // No cost yet -> ask for one; a cost entered but no reply yet -> "working it out", not a prompt
  // to enter what the user already entered (review, 11 Nov 2026).
  const waitingForCost = !costEntered;
  const loadingFigures = costEntered && !dossierCashflow;
  const hasSurplus = surplus && typeof surplus.value === 'number';
  const hasCover = cover.status === 'ok';
  const missing = [];
  const cashflowAnswered = !waitingForCost && !loadingFigures;
  if (cashflowAnswered && !hasSurplus && !dossierCashflow?.offline) missing.push({ hi: 'बचत', en: 'money left each year' });
  if (cashflowAnswered && !hasCover && cover.status !== 'offline') missing.push({ hi: 'कर्ज़ चुकाने की क्षमता', en: 'whether the business can repay' });
  if (dossierDetail && !bars) missing.push({ hi: 'मौसम', en: 'good and bad months' });

  return (
    <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-[#E9ECEF] space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
        <div>
          <span className="text-[11px] font-mono-num text-[#0E7A53] font-semibold">
            Good and bad months
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
          {waitingForCost && (
            <p className="p-3 rounded-xl bg-white border border-[#E9ECEF] text-xs text-[#686D65] whitespace-pre-line">
              {'पहले प्रोजेक्ट की लागत डालें।\nEnter a project cost in "Your loan and repayments" to see the money left each year and whether the business can repay.'}
            </p>
          )}
          {/* Typing fix (Stage A): one line in a fixed space while new figures are worked out. */}
          {!loadingFigures && !waitingForCost && (
            <p className="h-4 text-[11px] text-[#686D65]" aria-live="polite">{cashflowUpdating ? 'Updating…' : ''}</p>
          )}
          {loadingFigures && (
            <p className="p-3 rounded-xl bg-white border border-[#E9ECEF] text-xs text-[#686D65]">Working out the figures…</p>
          )}
          {(dossierCashflow?.offline || cover.status === 'offline') && (
            <p className="p-3 rounded-xl bg-white border border-[#E9ECEF] text-xs text-[#686D65]">Server offline: these figures need the server.</p>
          )}
          {(hasSurplus || hasCover) && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              {hasSurplus && (
                <div className="p-3 rounded-xl bg-white border border-[#E9ECEF]">
                  <span className="text-[#686D65]">
                    {surplus.period === 'year' ? 'Money left each year after running costs, before loan payments:' : 'Money left each month after running costs, before loan payments:'}
                  </span>
                  <p className="text-base font-bold text-[#111311] font-mono-num">
                    {fmt(surplus.value)} <span className="text-[11px] font-normal">{surplus.period === 'year' ? 'a year (Year 3)' : 'a month'}</span>
                  </p>
                  <HowWeGotThis
                    tags={[surplus.tag]}
                    working={`Surplus${surplus?.basis ? `, ${surplus.basis}` : ''}${surplus.period === 'year' ? ', Year 3' : ''}.`}
                    notes={tier ? [`Size: "${tier.label}" in the research file.`] : []}
                  />
                </div>
              )}
              {hasCover && (
                <div className="p-3 rounded-xl bg-white border border-[#E9ECEF]">
                  <span className="text-[#686D65]">Can the business repay?</span>
                  <ul className="font-bold text-[#111311] text-xs space-y-0.5">
                    {cover.rows.map((r) => {
                      const y = (dossierCashflow?.dscr?.years || []).find((x) => x.year === r.year);
                      return <li key={r.year}>{repayLine(r, y?.value)}</li>;
                    })}
                  </ul>
                  <HowWeGotThis
                    tags={[...new Set(cover.rows.map((r) => r.tag).filter(Boolean))]}
                    working={`Cash-flow cover (DSCR) as printed in the research file: ${cover.rows.map((r) => `Year ${r.year} ${r.text}`).join(', ')}.`}
                    notes={["Uses the research file's own loan payment, so it can differ from \"Your loan and repayments\"."]}
                  />
                </div>
              )}
            </div>
          )}
          {(dossierCashflow?.assumptions || []).map((a, i) => (
            <div key={i} className="text-[11px] text-amber-800">{a.text} <HowWeGotThis tags={[a.tag]} /></div>
          ))}

          {bars && (
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-[#686D65]">
              Each month against an average month:
            </span>
              <>
                <div className="grid grid-cols-12 gap-1 h-24 items-end pt-3 pb-1 border-b border-[#E9ECEF]">
                  {bars.map((b) => (
                    <div key={b.month} className="h-full flex flex-col justify-end items-center">
                      <div
                        className={`w-full rounded-t ${b.lean ? 'bg-orange-400' : 'bg-[#0E7A53]'}`}
                        style={{ height: `${b.heightPct}%` }}
                        title={`${b.month}: ${seasonPercent(b.value)} vs an average month`}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-12 text-center text-[10px] text-[#686D65] font-mono-num pt-1">
                  {bars.map((b) => <span key={b.month}>{b.month.slice(0, 3)}<br />{seasonPercent(b.value)}</span>)}
                </div>
                <p className="text-[11px] text-[#686D65] pt-2">
                  Orange: the 3 weakest months. +10% means 10% more than an average month.
                </p>
                <HowWeGotThis
                  tags={[...new Set(bars.map((b) => b.tag).filter(Boolean))]}
                  working={`The research file gives each month a number; 1.00 is an average month. ${bars.map((b) => `${b.month.slice(0, 3)} ${b.value.toFixed(2)}`).join(', ')}.`}
                />
              </>
          </div>
          )}

          {missing.length > 0 && (
            <p className="p-3 rounded-xl bg-white border border-dashed border-[#DEE2E6] text-[11px] text-[#686D65] whitespace-pre-line">
              {`यह जानकारी अभी नहीं है: ${missing.map((m) => m.hi).join(', ')} (${missing.length})\n`
                + `We don't have this yet: ${missing.map((m) => m.en).join(', ')} (${missing.length}). `
                + `It is not in the ${activeDomain.code} research file; the feasibility report has what the file does say.`}
              {(surplus?.reason || dossierCashflow?.reason) && (
                <span className="block pt-1 text-[10px]">{surplus?.reason || dossierCashflow?.reason}</span>
              )}
            </p>
          )}
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
