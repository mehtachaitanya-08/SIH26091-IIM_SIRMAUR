import React from 'react';
import { ArrowRight, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import DashboardShell from './dashboard/DashboardShell';
import StarBlossom from './dashboard/StarBlossom';

// Presets for the Advisory Tools list: names only. Figures are on the signed-in dashboard (from the server).
export const PRESETS = {
  D08: { code: 'D08', name: 'Mustard & Edible Oil Expeller Mill', nameHi: 'सरसों एवं खाद्य तेल स्पेलर मिल' },
  D18: { code: 'D18', name: 'Village Tailoring & Garments', nameHi: 'ग्रामीण सिलाई एवं वस्त्र निर्माण' },
  D15: { code: 'D15', name: 'Tractor & Farm Equipment Garage', nameHi: 'ट्रैक्टर एवं कृषि उपकरण मरम्मत गैराज' }
};

// Static Preset Scenario Definitions for Right Sidebar Panel
export const RECENT_SCENARIOS = [
  {
    id: 'D08',
    domainCode: 'D08',
    tab: 'simulator',
    name: 'D08 Mustard Oil Mill',
    subtitle: 'NSFDC Term Loan · see dashboard',
    time: '2h ago',
    type: 'd08'
  },
  {
    id: 'D18',
    domainCode: 'D18',
    tab: 'simulator',
    name: 'D18 Tailoring Workshop',
    subtitle: 'PM Vishwakarma credit · see dashboard',
    image: '/images/scenario_tailoring.jpg',
    imageAlt: 'Tailoring craftsmanship',
    imageFallback: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    time: '3h ago',
    type: 'd18'
  },
  {
    id: 'debt',
    tab: 'restructure',
    name: 'Sahukar Debt Relief',
    subtitle: 'Moneylender senkda debt · see dashboard',
    time: '5h ago',
    type: 'debt'
  }
];

/**
 * SetoDashboard — Landing Page Onboarding Glimpse Mockup (Scene 06)
 * Renders an immaculate, non-confusing visual preview of the Entrepreneur Workspace.
 * Decoupled from production live calculation state to eliminate cross-page confusion.
 * Clicking any element routes the user to Login/Register -> Full Production Workspace.
 */
export default function SetoDashboard({
  language = 'en',
  currentUser = null,
  onLaunchWorkspace
}) {
  const isHi = language === 'hi';

  const handleAction = (label) => {
    if (onLaunchWorkspace) {
      onLaunchWorkspace(label);
    }
  };

  return (
    <DashboardShell
      language={language}
      mode="mockup"
      id="dashboard-section"
      showTitle={true}
      className="relative"
    >
      {/* Column 1: Left Navigation Rail (Preview Mode) */}
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
            <span className="ml-auto text-[10px] font-mono-num font-bold px-2 py-0.5 rounded-full bg-slate-200 text-[#686D65] uppercase">
              Preview
            </span>
          </div>

          {/* Nav Tabs List with Active White Pill */}
          <nav className="space-y-1">
            {[
              { id: 'home', label: isHi ? 'होम' : 'Home', active: true },
              { id: 'simulator', label: isHi ? 'एंटरप्राइज स्टूडियो' : 'Enterprise Studio' },
              { id: 'amortizer', label: isHi ? 'एनएसएफडीसी अमोर्टाइज़र' : 'NSFDC Amortizer' },
              { id: 'restructure', label: isHi ? 'कर्ज मुक्ति' : 'Debt Liberation' },
              { id: 'dpr', label: isHi ? '1-पेज डीपीआर' : '1-Page DPR' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleAction(tab.label)}
                className={`w-full flex items-center px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer font-sans-ui text-left ${
                  tab.active
                    ? 'bg-white text-[#111311] shadow-sm border border-[#E9ECEF]'
                    : 'text-[#686D65] hover:text-[#111311] hover:bg-white/60'
                }`}
              >
                <span>{tab.label}</span>
                {!tab.active && <Lock className="w-3 h-3 ml-auto text-slate-400" />}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handleAction('Notifications')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[#686D65] hover:text-[#111311] hover:bg-white/60 font-medium text-xs transition-all cursor-pointer font-sans-ui"
            >
              <span>{isHi ? 'सूचनाएं' : 'Notifications'}</span>
              <span className="w-5 h-5 rounded-full bg-[#111311] text-white text-[11px] flex items-center justify-center font-bold">
                8
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleAction('Settings')}
              className="w-full flex items-center px-4 py-2.5 rounded-xl text-[#686D65] hover:text-[#111311] hover:bg-white/60 font-medium text-xs transition-all cursor-pointer font-sans-ui"
            >
              <span>{isHi ? 'सेटिंग्स' : 'Settings'}</span>
            </button>
          </nav>

          {/* Collapsible Sub-Tree: Advisory Tools */}
          <div className="pt-4 border-t border-[#E9ECEF] px-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#686D65] mb-2 font-sans-ui">
              <span>{isHi ? 'सलाहकार उपकरण' : 'Advisory Tools'}</span>
              <span className="text-[10px] font-mono-num text-[#0E7A53] font-bold">24 Trades</span>
            </div>

            <div className="space-y-1">
              {[
                { name: isHi ? 'सरसों तेल' : 'Mustard', code: 'D08', active: true },
                { name: isHi ? 'सिलाई' : 'Village', code: 'D18' },
                { name: isHi ? 'ट्रैक्टर गैराज' : 'Tractor', code: 'D15' }
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleAction(`${item.code} ${item.name}`)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer font-sans-ui ${
                    item.active
                      ? 'bg-slate-100 font-bold text-[#111311]'
                      : 'text-[#686D65] hover:text-[#111311] hover:bg-slate-50'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="text-[10px] font-mono-num bg-slate-200 text-[#686D65] px-1.5 py-0.5 rounded">
                    {item.code}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Beneficiary Card */}
        <div className="mt-6 pt-4 border-t border-[#E9ECEF]">
          <div 
            onClick={() => handleAction('Beneficiary Verification')}
            className="flex items-center space-x-3 p-2.5 rounded-xl bg-white border border-[#E9ECEF] hover:border-black/20 cursor-pointer transition-all shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-[#111311] text-white flex items-center justify-center font-bold text-xs">
              {currentUser?.name ? currentUser.name.charAt(0) : 'SC'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-xs text-[#111311] truncate font-sans-ui">
                {currentUser?.name || (isHi ? 'लाभार्थी उद्यमी' : 'Beneficiary Entrepreneur')}
              </p>
              <p className="text-[10px] text-[#0E7A53] font-semibold truncate font-sans-ui">
                {currentUser ? 'Active Profile' : 'Sign in to personalize'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Column 2: Center Workspace (Executive Glimpse) */}
      <main className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white overflow-y-auto">
        
        {/* Top Executive Header with StarBlossom Emblem */}
        <div className="border-b border-[#E9ECEF] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <StarBlossom size={36} className="iris-star-svg flex-shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#111311] tracking-tight font-sans-ui">
                  {isHi ? 'उद्यम सलाहकार कंसोल' : 'Enterprise Advisory Console'}
                </h2>
                <p className="text-xs text-[#686D65] mt-0.5 font-sans-ui">
                  <span className="font-semibold text-[#111311]">
                    {currentUser?.name ? `Welcome, ${currentUser.name.split(' ')[0]}!` : (isHi ? 'स्वागत है!' : 'Welcome!')}
                  </span>
                  {' · '}
                  <span>MoSJE / NSFDC Concessional Credit Facility</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-[#0E7A53] font-semibold border border-emerald-200">
                Sitapur District · STATUTORY-VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* 3 Core Interactive Quick Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => handleAction('Simulate Enterprise')}
            className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] hover:border-[#0E7A53] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#111311] font-sans-ui group-hover:text-[#0E7A53] transition-colors">
                {isHi ? 'उद्यम अनुकरण' : 'Simulate enterprise'}
              </h4>
              <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0E7A53] transition-colors" />
            </div>
            <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
              {isHi ? '12 महीने का मौसमी पैटर्न और सबसे कमज़ोर महीने, व्यवसाय के डोज़ियर से।' : "12-month season pattern and leanest months, from the business's dossier."}
            </p>
          </div>

          <div
            onClick={() => handleAction('NSFDC Amortizer')}
            className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] hover:border-[#0E7A53] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#111311] font-sans-ui group-hover:text-[#0E7A53] transition-colors">
                {isHi ? 'अमोर्टाइज़र' : 'NSFDC amortizer'}
              </h4>
              <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0E7A53] transition-colors" />
            </div>
            <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
              {isHi ? '6.5% / 8.0% [S1] पर तिमाही किस्तें (11 या 26 किस्तें ASSUMED: NSFDC कहता है "भीतर")।' : 'Quarterly instalments at 6.5% / 8.0% [S1] (11 or 26 instalments ASSUMED: NSFDC says "within").'}
            </p>
          </div>

          <div
            onClick={() => handleAction('Debt Liberation')}
            className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] hover:border-[#0E7A53] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#111311] font-sans-ui group-hover:text-[#0E7A53] transition-colors">
                {isHi ? 'कर्ज मुक्ति' : 'Debt liberation'}
              </h4>
              <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0E7A53] transition-colors" />
            </div>
            <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
              {isHi ? '3-सेंकड़ा साहुकार कर्ज को संस्थागत बैंक ऋण में बदलें।' : 'Refinance 3-senkda moneylender debt into bank credit.'}
            </p>
          </div>
        </div>

        {/* Central Preview Highlight Card */}
        <div className="p-5 rounded-2xl bg-[#F8F6F0] border border-[#DEE2E6] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono-num text-[#0E7A53] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0E7A53] animate-pulse"></span>
              <span>D08 Mustard Expeller Mill · preview</span>
            </span>
            <span className="text-[11px] font-mono-num font-bold text-[#0E7A53] bg-emerald-100 px-2 py-0.5 rounded-full">
              see dashboard
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-[#E9ECEF]">
              <span className="text-[#686D65] block text-[11px]">Total Project Cost</span>
              <span className="text-base font-bold text-[#111311] font-mono-num">see dashboard</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#E9ECEF]">
              <span className="text-[#686D65] block text-[11px]">NSFDC Loan</span>
              <span className="text-base font-bold text-[#0E7A53] font-mono-num">see dashboard</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#E9ECEF]">
              <span className="text-[#686D65] block text-[11px]">Quarterly EQI</span>
              <span className="text-base font-bold text-[#E86043] font-mono-num">see dashboard</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-[#686D65]">
            <span className="font-sans-ui">
              Includes 2 Quarters Moratorium · 26 Amortizing Quarters · Damdupat Audit
            </span>
            <button
              type="button"
              onClick={() => handleAction('Launch Full DPR')}
              className="font-bold text-[#111311] hover:text-[#0E7A53] underline cursor-pointer"
            >
              Explore Full Breakdown →
            </button>
          </div>
        </div>

        {/* Operational Command Bar (Preview Mode) */}
        <div className="pt-2">
          <div className="relative">
            <input
              type="text"
              readOnly
              value="Try: 'Stress test August cash flow' or 'Download Lead-Bank DPR'"
              onClick={() => handleAction('AI Command Bar')}
              className="w-full bg-[#F8F9FA] rounded-2xl px-4 py-3 text-xs text-[#686D65] border border-[#E9ECEF] cursor-pointer hover:border-[#111311]/40 transition-colors font-sans-ui"
            />
            <button
              type="button"
              onClick={() => handleAction('AI Command Bar')}
              className="absolute right-2 top-2 px-3 py-1.5 rounded-xl bg-[#111311] text-white text-[11px] font-bold font-mono-num cursor-pointer"
            >
              Run →
            </button>
          </div>
        </div>

      </main>

      {/* Column 3: Right Sidebar (Recent Scenarios Preview) */}
      <aside className="lg:col-span-3 bg-white p-6 border-l border-[#E9ECEF] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#111311] font-sans-ui">
              {isHi ? 'हाल के परिदृश्य' : 'Recent scenarios'}
            </h3>
            <button
              type="button"
              onClick={() => handleAction('Refresh Scenarios')}
              className="text-xs text-[#686D65] hover:text-[#111311] font-medium cursor-pointer font-sans-ui"
            >
              Refresh
            </button>
          </div>

          {/* Search Bar Preview */}
          <div className="relative">
            <input
              type="text"
              readOnly
              placeholder="Search scenarios..."
              onClick={() => handleAction('Search Scenarios')}
              className="w-full bg-[#F8F9FA] rounded-xl px-3 py-2 text-xs text-[#111311] placeholder-[#686D65] border border-[#E9ECEF] cursor-pointer font-sans-ui"
            />
          </div>

          {/* Preset Scenario Cards */}
          <div className="space-y-3.5 pt-2 text-xs">
            {RECENT_SCENARIOS.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => handleAction(scenario.name)}
                className="p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-all cursor-pointer border border-transparent hover:border-[#E9ECEF]"
              >
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    defaultChecked={scenario.id === 'D08'}
                    readOnly
                    className="mt-0.5 rounded border-gray-300 text-[#111311] focus:ring-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-[#111311] font-sans-ui">{scenario.name}</p>
                    <p className="text-[11px] text-[#686D65] mt-0.5 font-sans-ui">{scenario.subtitle}</p>

                    {scenario.image && (
                      <div className="mt-2 rounded-xl overflow-hidden h-20 w-full relative">
                        <img
                          src={scenario.image}
                          alt={scenario.imageAlt || 'Scenario preview'}
                          onError={(e) => {
                            if (scenario.imageFallback) e.currentTarget.src = scenario.imageFallback;
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-[#0E7A53] font-medium font-mono-num">
                        {scenario.badge}
                      </span>
                      <span className="text-[11px] text-[#686D65] font-mono-num">{scenario.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Button */}
        <button
          type="button"
          onClick={() => handleAction('Create Simulation')}
          className="w-full py-2.5 rounded-xl bg-[#111311] hover:bg-black text-white font-bold text-xs tracking-tight shadow-sm transition-all mt-4 cursor-pointer font-sans-ui flex items-center justify-center space-x-1"
        >
          <span>{isHi ? 'नया सिमुलेशन बनाएं +' : 'Create new simulation +'}</span>
        </button>
      </aside>

    </DashboardShell>
  );
}
