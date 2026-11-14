import React from 'react';
import EnginesPanel from './EnginesPanel';

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

      <EnginesPanel />

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
