import React from 'react';

/**
 * MandiPanel — the government market-price panel on Home (data.gov.in Agmarknet), back as it was before
 * 12 Nov (owner's decision, 14 Nov 2026), with honest wording only:
 *  - a price is shown only when data.gov.in really gave one (the server's live reply, with its tag);
 *  - otherwise "NOT FOUND" and the server's reason;
 *  - the key status says set / not set / unknown, never "connected" when it is not.
 * The dataset ID is not printed (a teammate once read it as the API key). Until a data.gov.in key is set
 * on the server this panel can only say "not set": the owner's teammate is to add it.
 */
export default function MandiPanel({ mandiPriceData = null, mandiKeyConfigured = null }) {
  const loading = mandiPriceData === null;           // asked for, not answered yet (review, 14 Nov 2026)
  const live = mandiPriceData?.isLive && typeof mandiPriceData.modalPrice === 'number' ? mandiPriceData : null;
  const noCrop = !loading && (mandiPriceData.status === 'no_crop' || !mandiPriceData.commodity);
  const keyText = mandiKeyConfigured === true ? 'set' : mandiKeyConfigured === false ? 'not set' : 'status unknown (server offline)';
  const keyDot = mandiKeyConfigured === true ? 'bg-emerald-600' : mandiKeyConfigured === false ? 'bg-red-500' : 'bg-slate-400';
  return (
    <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] space-y-3 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E9ECEF] pb-2.5">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${live ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
          <span className="text-xs font-semibold text-[#111311] font-mono-num uppercase tracking-wider">
            Open Government Data (data.gov.in / Agmarknet API)
          </span>
        </div>
        <span className="text-[11px] font-mono-num font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 self-start sm:self-auto">
          {live ? 'Live mandi price' : 'No live data'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-3 rounded-lg border border-[#E9ECEF]">
          <span className="text-[#686D65] block text-[11px] font-medium">Commodity &amp; Market</span>
          <p className="font-bold text-[#111311] text-xs font-sans-ui mt-0.5">
            {loading ? 'Loading…' : noCrop ? 'No crop linked to this business'
              : `${mandiPriceData.commodity}${mandiPriceData.market ? ` (${mandiPriceData.market})` : ''}`}
          </p>
          <span className="text-[10px] text-[#686D65] font-mono-num">
            {loading || noCrop ? '—' : `State: ${mandiPriceData.state || '—'} (ASSUMED: the server asks for Uttar Pradesh) · crop link ASSUMED (team's list)`}
          </span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#E9ECEF]">
          <span className="text-[#686D65] block text-[11px] font-medium">Modal Spot Price</span>
          {live ? (
            <>
              <p className="font-bold text-[#0E7A53] text-base font-mono-num mt-0.5">
                ₹{live.modalPrice.toLocaleString('en-IN')} <span className="text-[11px] font-normal text-[#686D65]">/ qtl</span>
              </p>
              <span className="text-[10px] text-[#0E7A53] font-semibold">{live.tag}</span>
            </>
          ) : (
            <>
              <p className="font-bold text-[#111311] text-base font-mono-num mt-0.5">{loading ? 'Loading…' : 'NOT FOUND'}</p>
              <span className="text-[10px] text-[#686D65]">{loading ? '' : mandiPriceData.reason || 'No live price from data.gov.in yet.'}</span>
            </>
          )}
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#E9ECEF]">
          <span className="text-[#686D65] block text-[11px] font-medium">API Integration Status</span>
          <p className="font-bold text-[#111311] text-xs font-mono-num mt-0.5 flex items-start gap-1.5 min-w-0">
            <span className={`w-1.5 h-1.5 mt-1 shrink-0 rounded-full ${keyDot}`}></span>
            <span className="break-all min-w-0">DATA_GOV_IN_API_KEY {keyText}</span>
          </p>
          <span className="text-[10px] text-[#686D65] block">Resource: Agmarknet (data.gov.in)</span>
        </div>
      </div>
    </div>
  );
}
