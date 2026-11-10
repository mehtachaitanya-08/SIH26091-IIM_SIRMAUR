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
  selectedDomainCode = 'D08',
  onSelectDomain,
  presets = {},
  isAdvisoryOpen = true,
  onToggleAdvisory,
  currentUser = null,
  language = 'en',
  onVerifyClick,
  onShowToast,
  mode = 'mockup'
}) {
  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'simulator', label: 'Enterprise Studio' },
    { id: 'amortizer', label: 'NSFDC Amortizer' },
    { id: 'restructure', label: 'Debt Liberation' },
    { id: 'dpr', label: '1-Page DPR' }
  ];

  const presetList = Object.values(presets);

  return (
    <aside className="lg:col-span-3 bg-[#F8F9FA] p-6 flex flex-col justify-between border-r border-[#E9ECEF]">
      <div className="space-y-6">
        {/* Brand Lockup: GraminAI */}
        <div className="flex items-center space-x-2.5 px-2">
          <img 
            src="/images/logo.png" 
            alt="GraminAI Emblem" 
            className="w-8 h-8 object-contain rounded-md"
          />
          <span className="font-extrabold text-lg text-[#111311] tracking-tight font-sans-ui">
            GraminAI
          </span>
          {mode === 'production' && (
            <span className="ml-auto text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-[#0E7A53] font-bold">
              Live
            </span>
          )}
        </div>

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

          {/* Utility Action Buttons */}
          <button
            type="button"
            onClick={() => onShowToast && onShowToast('8 Statutory notifications pending')}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[#686D65] hover:text-[#111311] hover:bg-white/60 font-medium text-xs transition-all cursor-pointer font-sans-ui"
          >
            <span>Notifications</span>
            <span className="w-5 h-5 rounded-full bg-[#111311] text-white text-[11px] flex items-center justify-center font-bold">
              8
            </span>
          </button>

          <button
            type="button"
            onClick={() => onShowToast && onShowToast('Platform configuration settings')}
            className="w-full flex items-center px-4 py-2.5 rounded-xl text-[#686D65] hover:text-[#111311] hover:bg-white/60 font-medium text-xs transition-all cursor-pointer font-sans-ui"
          >
            <span>Settings</span>
          </button>
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
                    <span className="truncate">{p.name ? p.name.split(' ')[0] : p.code}</span>
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
        onVerifyClick={onVerifyClick}
      />
    </aside>
  );
}
