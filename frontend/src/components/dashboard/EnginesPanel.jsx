import React from 'react';

/**
 * EnginesPanel — the "03 Engines Active" panel: the three calculators in plain words, with NSFDC's
 * verified interest rates [S1]. Shown on Home (owner's decision, 14 Nov 2026: bring the old Home panels
 * back) and in the "How it works" tab. No other figures.
 */
export default function EnginesPanel() {
  return (
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
  );
}
