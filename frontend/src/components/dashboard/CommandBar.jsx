import React from 'react';

/**
 * CommandBar — Floating Bottom Command & Filter Console
 * Allows rapid tab navigation, query dispatch, and dialect configuration.
 */
export default function CommandBar({
  commandInput = '',
  onInputChange,
  onSubmit,
  onSelectChip,
  onShowToast,
  mode = 'mockup'
}) {
  return (
    <div className="bg-[#F8F9FA] rounded-2xl p-3 border border-[#E9ECEF] space-y-2.5">
      <div className="flex items-center space-x-2 text-xs text-[#686D65] px-2">
        <input
          type="text"
          value={commandInput}
          onChange={(e) => onInputChange && onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit && onSubmit()}
          placeholder="Enter command or module keyword (e.g. 'amortizer', 'debt', 'dpr')..."
          className="w-full bg-transparent focus:outline-none text-[#111311] placeholder-[#686D65] text-xs font-medium font-sans-ui"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={() => onSelectChip && onSelectChip('dpr')}
            className="px-2.5 py-1 rounded-lg bg-white text-[#111311] font-semibold text-[11px] border border-[#E9ECEF] hover:bg-slate-50 transition-all shadow-sm cursor-pointer font-sans-ui"
          >
            Lead-Bank DPR
          </button>

          <button
            type="button"
            onClick={() => onSelectChip && onSelectChip('amortizer')}
            className="px-2.5 py-1 rounded-lg bg-white text-[#111311] font-semibold text-[11px] border border-[#E9ECEF] hover:bg-slate-50 transition-all shadow-sm cursor-pointer font-sans-ui"
          >
            Quarterly EQI
          </button>

          <button
            type="button"
            onClick={() => onShowToast && onShowToast('Multilingual Bhashini options active')}
            className="px-2.5 py-1 rounded-lg bg-white text-[#111311] font-semibold text-[11px] border border-[#E9ECEF] hover:bg-slate-50 transition-all shadow-sm cursor-pointer font-sans-ui"
          >
            Dialect Settings
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onSubmit}
            className="px-3 py-1.5 rounded-lg bg-[#111311] text-white hover:bg-slate-800 transition-all text-xs font-bold shadow-sm cursor-pointer font-sans-ui"
          >
            Run
          </button>
        </div>
      </div>
    </div>
  );
}
