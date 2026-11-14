import React from 'react';
import { mandiPanelText } from '../../services/mandiText';

/**
 * MandiPanel — the government market-price panel on Home (data.gov.in Agmarknet), back as it was before
 * 12 Nov (owner's decision, 14 Nov 2026). Its words come from mandiPanelText (services/mandiText.js):
 * plain words since the owner's hand test on 14 Nov 2026 (evening), when it showed an all-caps
 * "not found" and a server setting name. The honesty rules stay: a price only when data.gov.in really gave one, "Coming
 * soon" until the teammate adds the data.gov.in key, never "connected" when it is not. The dataset ID
 * is not printed (a teammate once read it as the API key).
 */
export default function MandiPanel({ mandiPriceData = null, mandiKeyConfigured = null }) {
  const t = mandiPanelText(mandiPriceData, mandiKeyConfigured);
  return (
    <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] space-y-3 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E9ECEF] pb-2.5">
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${t.live ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
          <span className="text-sm font-semibold text-[#111311] font-sans-ui">{t.title}</span>
        </div>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border self-start sm:self-auto ${
          t.live ? 'text-[#0E7A53] bg-emerald-50 border-emerald-200' : 'text-slate-600 bg-white border-slate-200'
        }`}
        >
          {t.badge}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-white p-3 rounded-lg border border-[#E9ECEF]">
          <span className="text-[#686D65] block text-[11px] font-medium">{t.commodityLabel}</span>
          <p className="font-bold text-[#111311] text-sm font-sans-ui mt-0.5">{t.commodity}</p>
          <span className="text-[10px] text-[#686D65]">{t.commodityNote}</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#E9ECEF]">
          <span className="text-[#686D65] block text-[11px] font-medium">{t.priceLabel}</span>
          <p className={`font-bold mt-0.5 font-sans-ui ${t.live ? 'text-[#0E7A53] text-base font-mono-num' : 'text-[#111311] text-sm'}`}>
            {t.priceMain}
          </p>
          {t.priceNote && <span className={`text-[10px] ${t.live ? 'text-[#0E7A53] font-semibold' : 'text-[#686D65]'}`}>{t.priceNote}</span>}
        </div>

        <div className="bg-white p-3 rounded-lg border border-[#E9ECEF]">
          <span className="text-[#686D65] block text-[11px] font-medium">{t.sourceLabel}</span>
          <p className="font-bold text-[#111311] text-sm font-sans-ui mt-0.5">{t.sourceMain}</p>
          <span className="text-[10px] text-[#686D65] flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${t.live ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
            {t.sourceNote}
          </span>
        </div>
      </div>
    </div>
  );
}
