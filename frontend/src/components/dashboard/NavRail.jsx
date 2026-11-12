import React from 'react';
import UserCard from './UserCard';

/**
 * NavRail — Left Column Navigation Rail
 * Brand lockup, active white pill tabs, collapsible advisory tools sub-tree,
 * and bottom dynamic beneficiary card.
 */
export default function NavRail({
  activeTab = 'home',
  onSelectTab,
  selectedDomainCode = 'D01',
  onSelectDomain,
  presets = {},
  isAdvisoryOpen = true,
  onToggleAdvisory,
  currentUser = null,
  language = 'en',
  onShowToast,
  mode = 'mockup'
}) {
  // "How it works" holds the judge-facing engine and data-connection panels, moved off Home so a
  // first-time user sees their own business first (teammate review, 11 Nov 2026).
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'simulator', label: 'Good and bad months' },
    { id: 'amortizer', label: 'Your loan and repayments' },
    { id: 'restructure', label: 'Pay off a moneylender loan' },
    { id: 'dpr', label: 'Download report (DPR)' },
    { id: 'feasibility', label: 'Feasibility' },
    { id: 'howitworks', label: 'How it works' }
  ];

  const presetList = Object.values(presets);

  return (
    <aside className="lg:col-span-3 bg-[#F8F9FA] p-5 sm:p-6 flex flex-col justify-between border-r border-[#E9ECEF] overflow-y-auto">
      <div className="space-y-6">
        {/* Brand Lockup: Only on mockup/landing preview where no global top bar exists */}
        {mode !== 'production' ? (
          <div className="flex items-center space-x-2.5 px-2">
            <img 
              src="/images/logo.png" 
              alt="UdyamSetuAI Emblem" 
              className="w-8 h-8 object-contain rounded-md"
            />
            <span className="font-extrabold text-lg text-[#111311] tracking-tight font-sans-ui">
              UdyamSetuAI
            </span>
            <span className="ml-auto text-[10px] font-mono-num font-bold px-2 py-0.5 rounded-md bg-slate-200 text-[#686D65] uppercase">
              Preview
            </span>
          </div>
        ) : (
          <div className="px-3 pt-1 pb-1 flex items-center justify-between border-b border-[#E9ECEF]">
            <span className="text-[11px] font-semibold text-[#686D65] uppercase tracking-wider font-sans-ui">
              Navigation
            </span>
            {currentUser?.district && (
              <span className="text-[11px] font-mono-num text-[#0E7A53] font-medium">
                {currentUser.district}
              </span>
            )}
          </div>
        )}

        {/* Nav Tabs List with Active White Pill */}
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab && onSelectTab(tab.id)}
                className={`w-full flex items-center px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer font-sans-ui ${
                  isActive
                    ? 'bg-white text-[#111311] shadow-sm border border-[#E9ECEF]'
                    : 'text-[#686D65] hover:text-[#111311] hover:bg-white/60'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Collapsible Sub-Tree: Advisory Tools */}
        <div className="pt-4 border-t border-[#E9ECEF] px-2">
          <button
            type="button"
            onClick={onToggleAdvisory}
            className="w-full flex items-center justify-between text-xs font-semibold text-[#686D65] hover:text-[#111311] mb-2 cursor-pointer font-sans-ui"
          >
            <span>Advisory Tools</span>
            <span className="text-[11px] font-mono font-bold">{isAdvisoryOpen ? '−' : '+'}</span>
          </button>
          
          {isAdvisoryOpen && (
            <div className="space-y-1 text-xs font-medium text-[#686D65] max-h-56 overflow-y-auto">
              {presetList.map((p) => {
                const isSelected = selectedDomainCode === p.code;
                return (
                  <div
                    key={p.code}
                    onClick={() => {
                      if (onSelectDomain) onSelectDomain(p.code);
                      if (onSelectTab) onSelectTab('simulator');
                      if (onShowToast) onShowToast(`Loaded ${p.name}`);
                    }}
                    className={`cursor-pointer py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                      isSelected 
                        ? 'bg-white text-[#111311] font-bold shadow-sm border border-[#E9ECEF]' 
                        : 'hover:text-[#111311] hover:bg-white/40'
                    }`}
                  >
                    {/* Full name: the first word alone gave "Commercial" three times and "Rural" twice. */}
                    <span className="truncate" title={p.name || p.code}>{p.name || p.code}</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-semibold">{p.code}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom User Card */}
      <UserCard
        currentUser={currentUser}
        language={language}
      />
    </aside>
  );
}
