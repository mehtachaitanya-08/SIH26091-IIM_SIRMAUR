import React from 'react';

/**
 * HowItWorksView — "How it works" tab
 * The judge-facing explanation of the three calculators and the live-data connection. It used to
 * sit on Home, where a first-time user met "[03 Engines Active]", "Deterministic Core" and an API
 * key status before their own business (teammate review, 11 Nov 2026). The data.gov.in dataset ID
 * is no longer printed: it is public, but a teammate read it as the API key.
 */
export default function HowItWorksView({ mandiKeyConfigured = null, onClose }) {
  const connection = mandiKeyConfigured === true
    ? { dot: 'bg-emerald-600', hi: 'जुड़ा हुआ है', en: 'Connected: a data.gov.in key is set on this server.' }
    : mandiKeyConfigured === false
      ? { dot: 'bg-red-500', hi: 'जुड़ा नहीं है', en: 'Not connected: this server has no data.gov.in key, so no live mandi prices are shown.' }
      : { dot: 'bg-slate-400', hi: 'पता नहीं', en: 'Unknown: the server is not answering.' };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#111311] font-sans-ui">How it works</h3>
        {onClose && (
          <button type="button" onClick={onClose}
            className="text-[11px] text-[#686D65] hover:text-[#111311] cursor-pointer font-sans-ui">
            ← Home
          </button>
        )}
      </div>

      <div className="p-4 rounded-xl bg-white border border-[#E9ECEF] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111311] font-sans-ui uppercase tracking-wider flex items-center gap-1.5">
            <span className="text-slate-400 font-mono-num text-[11px]">[03 Engines Active]</span>
            <span>Financial & Solvency Models</span>
          </span>
          <span className="text-[11px] font-mono-num text-slate-500 font-medium">Deterministic Core</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-[#111311] block">1. Your loan and repayments</span>
            <span className="text-[#686D65] mt-0.5 block">Micro & Term loan at 6.5%/8.0% [S1]</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-[#111311] block">2. Good and bad months</span>
            <span className="text-[#686D65] mt-0.5 block">Each business's weakest months, from its research file</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-[#111311] block">3. Pay off a moneylender loan</span>
            <span className="text-[#686D65] mt-0.5 block">Interest already paid is more than the loan? Under an old law, the moneylender may not be able to ask for more interest. Check with free legal aid.</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] space-y-1.5">
        <span className="text-xs font-semibold text-[#111311] font-sans-ui">
          Live mandi prices (data.gov.in Agmarknet)
        </span>
        <p className="text-xs text-[#111311] font-sans-ui flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${connection.dot}`}></span>
          <span>{connection.hi}</span>
        </p>
        <p className="text-[11px] text-[#686D65] font-sans-ui">{connection.en}</p>
      </div>
    </div>
  );
}
