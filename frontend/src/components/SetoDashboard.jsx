import React, { useState } from 'react';
import { ArrowRight, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import DashboardShell from './dashboard/DashboardShell';
import StarBlossom from './dashboard/StarBlossom';

// Presets for the Advisory Tools list: names only. Figures are on the signed-in dashboard (from the server).
export const PRESETS = {
  D08: { code: 'D08', name: 'Mustard & Edible Oil Expeller Mill', nameHi: 'सरसों एवं खाद्य तेल स्पेलर मिल' },
  D18: { code: 'D18', name: 'Village Tailoring & Garments', nameHi: 'ग्रामीण सिलाई एवं वस्त्र निर्माण' },
  D15: { code: 'D15', name: 'Tractor & Farm Equipment Garage', nameHi: 'ट्रैक्टर एवं कृषि उपकरण मरम्मत गैराज' }
};

// The preview's right column. It showed three made-up "recent" scenarios saved "2h/3h/5h ago",
// with a tick box set; nobody saved them, so the preview now shows the real empty state a new
// user sees (teammate review, 11 Nov 2026).
export const RECENT_SCENARIOS = [];

/**
 * SetoDashboard — Landing Page Onboarding Glimpse Mockup (Scene 06)
 * Renders an immaculate, non-confusing visual preview of the Entrepreneur Workspace.
 * Decoupled from production live calculation state to eliminate cross-page confusion.
 * Clicking any element routes the user to Login/Register -> Full Production Workspace.
 */
export default function SetoDashboard({
  language = 'en',
  currentUser = null,
  onLaunchWorkspace,
  onAskQuestion
}) {
  const isHi = language === 'hi';
  // The preview's chat bar was read-only text that only opened sign-in; a teammate typed into it
  // and got nothing (teammate review, 11 Nov 2026). Now the question is carried into the dashboard.
  const [question, setQuestion] = useState('');

  const handleAction = (label) => {
    if (onLaunchWorkspace) {
      onLaunchWorkspace(label);
    }
  };

  const askQuestion = () => {
    const q = question.trim();
    if (q && onAskQuestion) onAskQuestion(q);
    else handleAction('AI Command Bar');
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
          {/* Brand Lockup: UdyamSetuAI */}
          <div className="flex items-center space-x-2.5 px-2">
            <img 
              src="/images/logo.png" 
              alt="UdyamSetuAI Emblem" 
              className="w-8 h-8 object-contain rounded-md"
            />
            <span className="font-extrabold text-lg text-[#111311] tracking-tight font-sans-ui">
              UdyamSetuAI
            </span>
            <span className="ml-auto text-[10px] font-mono-num font-bold px-2 py-0.5 rounded-full bg-slate-200 text-[#686D65] uppercase">
              Preview
            </span>
          </div>

          {/* Nav Tabs List with Active White Pill */}
          <nav className="space-y-1">
            {[
              { id: 'home', label: isHi ? 'होम' : 'Home', active: true },
              { id: 'simulator', label: isHi ? 'एंटरप्राइज स्टूडियो' : 'Good and bad months' },
              { id: 'amortizer', label: isHi ? 'एनएसएफडीसी अमोर्टाइज़र' : 'Your loan and repayments' },
              { id: 'restructure', label: isHi ? 'कर्ज मुक्ति' : 'Pay off a moneylender loan' },
              { id: 'dpr', label: isHi ? '1-पेज डीपीआर' : 'Download report (DPR)' }
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
          </nav>

          {/* Collapsible Sub-Tree: Advisory Tools */}
          <div className="pt-4 border-t border-[#E9ECEF] px-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#686D65] mb-2 font-sans-ui">
              <span>{isHi ? 'सलाहकार उपकरण' : 'Advisory Tools'}</span>
              {/* Source: the 24 business research files, research_dossiers/D01-D24 */}
              <span className="text-[10px] font-mono-num text-[#0E7A53] font-bold" title="Source: the 24 business research files (D01 to D24)">24 Trades</span>
            </div>

            <div className="space-y-1">
              {/* Full names: "Village" stood for Tailoring and "Mustard" for an oil mill. */}
              {Object.values(PRESETS).map((p, i) => ({ name: isHi ? p.nameHi : p.name, code: p.code, active: i === 0 })).map((item) => (
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
                  <span className="truncate text-left">{item.name}</span>
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
            onClick={() => handleAction('Profile')}
            className="flex items-center space-x-3 p-2.5 rounded-xl bg-white border border-[#E9ECEF] hover:border-black/20 cursor-pointer transition-all shadow-sm"
          >
            {/* The user's initial; it said "SC" for everyone before sign-in. */}
            <div className="w-8 h-8 rounded-full bg-[#111311] text-white flex items-center justify-center font-bold text-xs">
              {currentUser?.name ? Array.from(currentUser.name.trim())[0] : '?'}
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
                {isHi ? 'उद्यम अनुकरण' : 'Good and bad months'}
              </h4>
              <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0E7A53] transition-colors" />
            </div>
            <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
              {isHi ? '12 महीने का मौसमी पैटर्न और सबसे कमज़ोर महीने, व्यवसाय के डोज़ियर से।' : "Which months earn more or less, from the business's research file."}
            </p>
          </div>

          <div
            onClick={() => handleAction('NSFDC Amortizer')}
            className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] hover:border-[#0E7A53] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#111311] font-sans-ui group-hover:text-[#0E7A53] transition-colors">
                {isHi ? 'अमोर्टाइज़र' : 'Your loan and repayments'}
              </h4>
              <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0E7A53] transition-colors" />
            </div>
            <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
              {isHi ? '6.5% / 8.0% [S1] पर तिमाही किस्तें (11 या 26 किस्तें ASSUMED: NSFDC कहता है "भीतर")।' : 'A payment every 3 months, interest 6.5% or 8.0% a year (NSFDC rules).'}
            </p>
          </div>

          <div
            onClick={() => handleAction('Debt Liberation')}
            className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] hover:border-[#0E7A53] hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-[#111311] font-sans-ui group-hover:text-[#0E7A53] transition-colors">
                {isHi ? 'कर्ज मुक्ति' : 'Pay off a moneylender loan'}
              </h4>
              <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0E7A53] transition-colors" />
            </div>
            <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
              {isHi ? '3-सेंकड़ा साहुकार कर्ज को संस्थागत बैंक ऋण में बदलें।' : 'Swap a costly moneylender loan for a cheaper bank loan.'}
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
              <span className="text-[#686D65] block text-[11px]">Payment every 3 months</span>
              <span className="text-base font-bold text-[#E86043] font-mono-num">see dashboard</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-[#686D65]">
            <span className="font-sans-ui">
              Includes a pause with no payment · payments every 3 months · moneylender interest check
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
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
              placeholder={isHi
                ? "UdyamSetuAI से पूछें (जैसे 'मैं यूपी में लोहार हूँ, क्या मुझे लोन मिल सकता है?')"
                : "Ask UdyamSetuAI (e.g. 'I am a blacksmith in UP, can I get a loan?')"}
              aria-label="Ask UdyamSetuAI"
              className="w-full bg-[#F8F9FA] rounded-2xl pl-4 pr-20 py-3 text-xs text-[#111311] placeholder-[#686D65] border border-[#E9ECEF] hover:border-[#111311]/40 focus:outline-none focus:border-[#111311] transition-colors font-sans-ui"
            />
            <button
              type="button"
              onClick={askQuestion}
              className="absolute right-2 top-2 px-3 py-1.5 rounded-xl bg-[#111311] text-white text-[11px] font-bold font-mono-num cursor-pointer"
            >
              {isHi ? 'पूछें →' : 'Ask →'}
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

          {/* Saved scenarios: empty until the user saves one */}
          <div className="space-y-3.5 pt-2 text-xs">
            {RECENT_SCENARIOS.length === 0 && (
              <div className="p-4 text-center text-[#686D65] bg-[#F8F9FA] rounded-xl border border-[#E9ECEF]">
                <p className="font-semibold text-xs">{isHi ? 'अभी कोई परिदृश्य सहेजा नहीं गया' : 'No saved scenarios yet'}</p>
              </div>
            )}
            {RECENT_SCENARIOS.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => handleAction(scenario.name)}
                className="p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-all cursor-pointer border border-transparent hover:border-[#E9ECEF]"
              >
                <div className="flex items-start space-x-2">
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
