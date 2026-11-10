import React from 'react';

/**
 * FeasibilityView — Feasibility report from the server (GET /api/feasibility/{code})
 * Market, pricing, season, compliance, SWOT and competition, from the verified business data only.
 * Every line keeps its tag; gaps are listed as NOT FOUND / VENDOR QUOTE NEEDED.
 */
function itemText(it) {
  if (Array.isArray(it.cells)) return it.cells.join(' · ');
  if (typeof it.text === 'string') return it.text.replace(/\*\*/g, '').replace(/`/g, '');
  if (it.status) return `${it.status}: ${it.reason || ''}`;
  return '';
}

export default function FeasibilityView({ activeDomain, feasibility, onClose, mode = 'mockup' }) {
  const code = activeDomain?.code || feasibility?.code || '';
  let body;
  if (mode !== 'production') {
    body = <p className="text-xs text-[#686D65]">Sign in and open the dashboard to see the feasibility report (see dashboard).</p>;
  } else if (!feasibility) {
    body = <p className="text-xs text-[#686D65]">Loading the feasibility report…</p>;
  } else if (feasibility.offline) {
    body = <p className="text-xs font-semibold text-red-700">Server offline: the feasibility report needs the server. NOT FOUND.</p>;
  } else if (feasibility.error) {
    body = <p className="text-xs font-semibold text-red-700">Feasibility report not available: {feasibility.error}</p>;
  } else if (feasibility.status !== 'verified') {
    body = (
      <p className="text-xs text-[#111311]">
        {activeDomain?.name || code} ({code}) is not yet verified, so there is no feasibility report. NOT FOUND.
        The NSFDC loan calculator still works for any business.
      </p>
    );
  } else {
    body = (
      <div className="space-y-3 text-xs">
        {(feasibility.sections || []).map((sec) => (
          <div key={sec.id} className="p-3 rounded-xl bg-white border border-[#E9ECEF]">
            <p className="font-bold text-[#111311] mb-1">{sec.title || sec.id}</p>
            <ul className="space-y-1 text-[#686D65]">
              {(sec.items || []).map((it, i) => (
                <li key={i} className={it.header ? 'font-semibold text-[#111311]' : ''}>
                  {itemText(it)}
                  {it.tag && !it.header && <span className="ml-1 font-mono-num text-[10px] text-[#0E7A53]">{it.tag}</span>}
                  {it.unverified && <span className="ml-1 text-[10px] text-amber-700">(unverified)</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
          <p className="font-bold text-[#111311] mb-1">
            Gaps: {(feasibility.gaps || []).length} items NOT FOUND or VENDOR QUOTE NEEDED in official sources
          </p>
          <ul className="space-y-1 text-[#686D65] max-h-40 overflow-y-auto">
            {(feasibility.gaps || []).map((g, i) => (
              <li key={i}>[{g.section}] {g.status}: {g.reason}</li>
            ))}
          </ul>
        </div>
        {feasibility.method && <p className="text-[10px] text-[#686D65]">{feasibility.method}</p>}
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-[#E9ECEF] space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
        <div>
          <span className="text-[11px] font-mono-num text-[#0E7A53] font-semibold">Verified sources only</span>
          <h4 className="font-bold text-sm text-[#111311] font-sans-ui">
            Feasibility report — {activeDomain?.name || code} ({code})
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
      <div className="max-h-[420px] overflow-y-auto">{body}</div>
    </div>
  );
}
