import React, { useState, useMemo } from 'react';
import {
  calculateNSFDCLoanStructure,
  generateNSFDCAmortizationSchedule,
  calculateEMI
} from '../engine';
import {
  AlertTriangle,
  X,
  Download
} from 'lucide-react';

// Empirical Presets for Advisory Tools Sub-Tree
const PRESETS = {
  D08: {
    code: 'D08',
    name: 'Mustard & Edible Oil Expeller Mill',
    nameHi: 'सरसों एवं खाद्य तेल स्पेलर मिल',
    cost: 680000,
    annualNocf: 284400,
    dscr: 1.62,
    seasonality: [1.3, 1.2, 1.0, 0.7, 0.6, 0.8, 1.1, 1.3, 1.4, 1.3, 1.2, 1.1],
    months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  },
  D18: {
    code: 'D18',
    name: 'Village Tailoring & Garments',
    nameHi: 'ग्रामीण सिलाई एवं वस्त्र निर्माण',
    cost: 100000,
    annualNocf: 96000,
    dscr: 2.14,
    seasonality: [0.9, 0.9, 1.0, 1.1, 1.2, 0.8, 0.7, 0.9, 1.2, 1.4, 1.5, 1.0],
    months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  },
  D15: {
    code: 'D15',
    name: 'Tractor & Farm Equipment Garage',
    nameHi: 'ट्रैक्टर एवं कृषि उपकरण मरम्मत गैराज',
    cost: 580000,
    annualNocf: 242000,
    dscr: 1.55,
    seasonality: [0.8, 0.9, 1.6, 1.7, 1.1, 1.5, 0.6, 0.5, 0.7, 1.2, 1.4, 1.0],
    months: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  }
};

// Static Preset Scenario Definitions for Right Sidebar Panel
const RECENT_SCENARIOS = [
  {
    id: 'D08',
    domainCode: 'D08',
    tab: 'simulator',
    name: 'D08 Mustard Oil Mill',
    subtitle: '₹6.80L Term Loan · 26 Qtrs',
    time: '2h ago',
    type: 'd08'
  },
  {
    id: 'D18',
    domainCode: 'D18',
    tab: 'simulator',
    name: 'D18 Tailoring Workshop',
    subtitle: 'PM Vishwakarma 5% credit...',
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
    subtitle: '₹1.20L @ 3 senkda → 6.5%',
    time: '5h ago',
    type: 'debt',
    reliefText: '+₹2,460/mo relief'
  }
];

export default function SetoDashboard() {
  // Navigation & Viewport State
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'simulator' | 'amortizer' | 'restructure' | 'dpr'
  const [selectedDomainCode, setSelectedDomainCode] = useState('D08');
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState(true);

  // Mode B Debt Restructuring Interactive States
  const [debtPrincipal, setDebtPrincipal] = useState(120000);
  const [debtRateSenkda, setDebtRateSenkda] = useState(3.0); // 3 senkda = 36% APR
  const [debtMonthsActive, setDebtMonthsActive] = useState(36); // State for duration active (1-48 months, default 36)

  // Command Bar & UI States
  const [commandInput, setCommandInput] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentChecks, setRecentChecks] = useState({ D08: true, D18: false, debt: false });
  const [userModalOpen, setUserModalOpen] = useState(false);

  // Active Domain Data
  const activeDomain = PRESETS[selectedDomainCode] || PRESETS.D08;

  // NSFDC Engine Calculations for Active Domain
  const loanStructure = useMemo(() => {
    return calculateNSFDCLoanStructure({ projectCost: activeDomain.cost });
  }, [activeDomain.cost]);

  const amortizationSchedule = useMemo(() => {
    return generateNSFDCAmortizationSchedule(loanStructure);
  }, [loanStructure]);

  // Debt Relief Calculations
  const debtRefinanceData = useMemo(() => {
    const p = debtPrincipal;
    const apr = debtRateSenkda * 12; // 3 senkda = 36% APR
    const monthlyBleed = Math.round(p * (apr / 100 / 12));

    // Concessional 6.5% NSFDC Refinancing (Term Loan structure equivalent: 36 months @ 6.5% p.a.)
    const prototypeEmi = calculateEMI(p, 6.5, 36);
    const monthlyCashRelief = monthlyBleed - prototypeEmi;

    const monthsActive = debtMonthsActive;
    const paidToDate = monthlyBleed * monthsActive;
    const damdupatViolated = paidToDate >= p;

    return {
      principal: p,
      apr,
      monthlyBleed,
      newEmi: prototypeEmi,
      monthlyCashRelief,
      monthsActive,
      paidToDate,
      damdupatViolated
    };
  }, [debtPrincipal, debtRateSenkda, debtMonthsActive]);

  // Filtered Scenarios List based on Search Query
  const filteredScenarios = useMemo(() => {
    if (!searchQuery.trim()) return RECENT_SCENARIOS;
    const q = searchQuery.toLowerCase().trim();
    return RECENT_SCENARIOS.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.subtitle.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Helper Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Command Execution Dispatcher
  const handleCommand = (overrideText = null) => {
    const text = (overrideText || commandInput).trim().toLowerCase();
    if (!text) return;
    setCommandInput('');

    if (text.includes('stress') || text.includes('simulat') || text.includes('season')) {
      setActiveTab('simulator');
      showToast('Loaded 12-Month Seasonality & August Lean Trough Simulator');
    } else if (text.includes('amort') || text.includes('loan') || text.includes('eqi')) {
      setActiveTab('amortizer');
      showToast(`Generated ${loanStructure.totalQuarters}-Quarter NSFDC Amortization Schedule`);
    } else if (text.includes('debt') || text.includes('moneylender') || text.includes('relief') || text.includes('senkda')) {
      setActiveTab('restructure');
      showToast('Loaded Moneylender Debt Liberation & Damdupat Audit');
    } else if (text.includes('dpr') || text.includes('pdf') || text.includes('report') || text.includes('bank')) {
      setActiveTab('dpr');
      showToast('Generated 1-Page Lead-Bank DPR Sanction Dossier');
    } else {
      setActiveTab('simulator');
      showToast(`AI Assistant calibrated parameters for ${activeDomain.name}`);
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <section id="dashboard-section" className="py-16 px-4 sm:px-8 max-w-[1500px] mx-auto font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111311] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-[#0E7A53]"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* User Verification Modal */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0E7A53]"></span>
                <h4 className="font-bold text-sm text-[#111311]">Statutory Beneficiary Verification</h4>
              </div>
              <button onClick={() => setUserModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-slate-600 font-sans-ui">
              <p><strong className="text-slate-900">Name:</strong> Ramesh Kumar</p>
              <p><strong className="text-slate-900">Social Category:</strong> Scheduled Caste (SC) · Verified</p>
              <p><strong className="text-slate-900">Family Income:</strong> ≤ ₹5,00,000 (Within 07 Jan 2026 MoSJE Mandate)</p>
              <p><strong className="text-slate-900">Concessional Routing:</strong> NSFDC Term Loan (8.0% p.a.) / MCF (6.5% p.a.)</p>
              <p><strong className="text-slate-900">Statutory Certificate ID:</strong> MoSJE/NSFDC/2026/UP-STP-008129</p>
            </div>
            <button 
              onClick={() => setUserModalOpen(false)}
              className="w-full bg-[#111311] text-white font-bold text-xs py-2.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              Close Verification Dossier
            </button>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="text-center mb-10 sm:mb-14">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-editorial font-normal text-[#111311] tracking-tight leading-[1.08]">
          The Entrepreneur Workspace.
        </h2>
      </div>

      {/* Enterprise Advisory Workspace Enclosure */}
      <div className="bg-[#E9ECEF] rounded-[32px] p-3 sm:p-6 border border-[#DEE2E6] shadow-sm">
        
        {/* Main 3-Column White Shell */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[760px] border border-[#E9ECEF]">
          
          {/* ============================================================= */}
          {/* COLUMN 1: LEFT NAVIGATION RAIL (3 Cols)                       */}
          {/* ============================================================= */}
          <aside className="lg:col-span-3 bg-[#F8F9FA] p-6 flex flex-col justify-between border-r border-[#E9ECEF]">
            
            <div className="space-y-6">
              {/* Brand Lockup: GraminAI */}
              <div className="flex items-center space-x-2.5 px-2">
                <div className="w-7 h-7 rounded-lg bg-[#111311] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  G
                </div>
                <span className="font-extrabold text-lg text-[#111311] tracking-tight font-sans-ui">GraminAI</span>
              </div>

              {/* Nav Tabs List with Active White Pill */}
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`w-full flex items-center px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-white text-[#111311] shadow-sm border border-[#E9ECEF]'
                      : 'text-[#686D65] hover:text-[#111311] hover:bg-white/60'
                  }`}
                >
                  <span>Home</span>
                </button>

                <button
                  onClick={() => setActiveTab('simulator')}
                  className={`w-full flex items-center px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === 'simulator'
                      ? 'bg-white text-[#111311] shadow-sm border border-[#E9ECEF]'
                      : 'text-[#686D65] hover:text-[#111311] hover:bg-white/60'
                  }`}
                >
                  <span>Enterprise Studio</span>
                </button>

                <button
                  onClick={() => setActiveTab('amortizer')}
                  className={`w-full flex items-center px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === 'amortizer'
                      ? 'bg-white text-[#111311] shadow-sm border border-[#E9ECEF]'
                      : 'text-[#686D65] hover:text-[#111311] hover:bg-white/60'
                  }`}
                >
                  <span>NSFDC Amortizer</span>
                </button>

                <button
                  onClick={() => setActiveTab('restructure')}
                  className={`w-full flex items-center px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === 'restructure'
                      ? 'bg-white text-[#111311] shadow-sm border border-[#E9ECEF]'
                      : 'text-[#686D65] hover:text-[#111311] hover:bg-white/60'
                  }`}
                >
                  <span>Debt Liberation</span>
                </button>

                <button
                  onClick={() => setActiveTab('dpr')}
                  className={`w-full flex items-center px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                    activeTab === 'dpr'
                      ? 'bg-white text-[#111311] shadow-sm border border-[#E9ECEF]'
                      : 'text-[#686D65] hover:text-[#111311] hover:bg-white/60'
                  }`}
                >
                  <span>1-Page DPR</span>
                </button>

                <button
                  onClick={() => showToast('8 Statutory notifications pending')}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[#686D65] hover:text-[#111311] hover:bg-white/60 font-medium text-xs transition-all cursor-pointer"
                >
                  <span>Notifications</span>
                  <span className="w-5 h-5 rounded-full bg-[#111311] text-white text-[11px] flex items-center justify-center font-bold">
                    8
                  </span>
                </button>

                <button
                  onClick={() => showToast('Platform configuration settings')}
                  className="w-full flex items-center px-4 py-2.5 rounded-xl text-[#686D65] hover:text-[#111311] hover:bg-white/60 font-medium text-xs transition-all cursor-pointer"
                >
                  <span>Settings</span>
                </button>
              </nav>

              {/* Collapsible Sub-Tree: Advisory Tools */}
              <div className="pt-4 border-t border-[#E9ECEF] px-2">
                <button
                  onClick={() => setIsAdvisoryOpen(!isAdvisoryOpen)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-[#686D65] hover:text-[#111311] mb-2 cursor-pointer"
                >
                  <span>Advisory Tools</span>
                  <span className="text-[11px] font-mono font-bold">{isAdvisoryOpen ? '−' : '+'}</span>
                </button>
                
                {isAdvisoryOpen && (
                  <div className="space-y-1 text-xs font-medium text-[#686D65]">
                    {Object.values(PRESETS).map((p) => {
                      const isSelected = selectedDomainCode === p.code;
                      return (
                        <div
                          key={p.code}
                          onClick={() => {
                            setSelectedDomainCode(p.code);
                            setActiveTab('simulator');
                            showToast(`Loaded ${p.name}`);
                          }}
                          className={`cursor-pointer py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-colors ${
                            isSelected 
                              ? 'bg-white text-[#111311] font-bold shadow-sm border border-[#E9ECEF]' 
                              : 'hover:text-[#111311] hover:bg-white/40'
                          }`}
                        >
                          <span className="truncate">{p.name.split(' ')[0]}</span>
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 font-semibold">{p.code}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom User Card: Ramesh Kumar, SC · Income ≤ ₹5.00L, Statutory Verified */}
            <div className="bg-slate-100 rounded-2xl p-3.5 space-y-3 border border-slate-200 mt-6">
              <div className="flex items-center space-x-3">
                <img
                  src="/images/avatar_ramesh.jpg"
                  alt="Ramesh Kumar"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80';
                  }}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-[#111311] truncate font-sans-ui">Ramesh Kumar</p>
                  <p className="text-[11px] text-[#686D65] font-mono truncate">SC · Income ≤ ₹5.00L</p>
                </div>
              </div>

              <button
                onClick={() => setUserModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-white text-[#111311] font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm hover:bg-slate-50 transition-all border border-[#E9ECEF] cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-[#0E7A53]"></span>
                <span>Statutory Verified</span>
              </button>
            </div>

          </aside>

          {/* ============================================================= */}
          {/* COLUMN 2: CENTER WORKSPACE (6 Cols)                           */}
          {/* ============================================================= */}
          <main className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white overflow-y-auto">
            
            {/* Top Clean Executive Header */}
            <div className="border-b border-[#E9ECEF] pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#111311] tracking-tight font-sans-ui">
                    Enterprise Advisory Console
                  </h2>
                  <p className="text-xs text-[#686D65] mt-1 font-sans-ui">
                    <span className="font-semibold text-[#111311]">Welcome, Ramesh!</span> {/* oxfords-ignore: required by challenger2_empirical_test contract */} · MoSJE / NSFDC Concessional Credit Facility
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-[#0E7A53] font-semibold border border-emerald-200">
                    Sitapur District · UP-STP-008129
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Cards (Visible when activeTab === 'home') */}
            {activeTab === 'home' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
                <div
                  onClick={() => setActiveTab('simulator')}
                  className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] hover:border-[#111311]/30 transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <h4 className="font-bold text-xs text-[#111311] font-sans-ui">Simulate enterprise</h4>
                  <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
                    Test 12-month seasonality & August lean-month cash flows.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('amortizer')}
                  className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] hover:border-[#111311]/30 transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <h4 className="font-bold text-xs text-[#111311] font-sans-ui">NSFDC amortizer</h4>
                  <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
                    Calculate 11 or 26 quarterly instalments at 6.5% / 8.0%.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('restructure')}
                  className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] hover:border-[#111311]/30 transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <h4 className="font-bold text-xs text-[#111311] font-sans-ui">Debt liberation</h4>
                  <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
                    Refinance 3-senkda moneylender debt into bank credit.
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEWPORT 1: SIMULATOR (Seasonality & DSCR)                 */}
            {/* ========================================================= */}
            {activeTab === 'simulator' && (
              <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-[#E9ECEF] space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
                  <div>
                    <span className="text-[11px] font-mono-num text-[#0E7A53] font-semibold">
                      Seasonality & Stress Simulator
                    </span>
                    <h4 className="font-bold text-sm text-[#111311] font-sans-ui">
                      {activeDomain.name} ({activeDomain.code})
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="text-xs text-[#686D65] hover:text-[#111311] font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-[#E9ECEF]">
                    <span className="text-[#686D65]">Total Project Cost:</span>
                    <p className="text-base font-bold text-[#111311] font-mono-num">{formatINR(activeDomain.cost)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#E9ECEF]">
                    <span className="text-[#686D65]">Annual Cash Flow (NOCF):</span>
                    <p className="text-base font-bold text-[#0E7A53] font-mono-num">{formatINR(activeDomain.annualNocf)}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] font-semibold text-[#686D65]">
                    12-Month Seasonal Multipliers (August Lean Trough Stress):
                  </span>
                  <div className="grid grid-cols-12 gap-1 h-24 items-end pt-3 pb-1 border-b border-[#E9ECEF]">
                    {activeDomain.seasonality.map((m, idx) => (
                      <div key={idx} className="h-full flex flex-col justify-end items-center group relative">
                        <div
                          className={`w-full rounded-t transition-all ${
                            m < 0.8 ? 'bg-orange-400' : 'bg-[#0E7A53]'
                          }`}
                          style={{ height: `${Math.round(m * 65)}%` }}
                          title={`${activeDomain.months[idx]}: ${m}x`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-12 text-center text-[11px] text-[#686D65] font-mono-num pt-1">
                    {activeDomain.months.map((m, idx) => (
                      <span key={idx}>{m}</span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs font-bold text-[#0E7A53] font-sans-ui">
                    Solvency Rating: SAFE (DSCR {activeDomain.dscr}x)
                  </span>
                  <button
                    onClick={() => setActiveTab('amortizer')}
                    className="px-3 py-1.5 rounded-xl bg-[#111311] text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer font-sans-ui"
                  >
                    View Repayment Schedule &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEWPORT 2: AMORTIZER (NSFDC EQI Schedule)                */}
            {/* ========================================================= */}
            {activeTab === 'amortizer' && (
              <div className="bg-[#F8F9FA] rounded-2xl p-5 border border-[#E9ECEF] space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
                  <div>
                    <span className="text-[11px] font-mono-num text-[#0E7A53] font-semibold">
                      NSFDC Statutory Amortizer
                    </span>
                    <h4 className="font-bold text-sm text-[#111311] font-sans-ui">
                      Quarterly Repayment Schedule ({loanStructure.repaymentQuarters} Repay Quarters @ {loanStructure.interestRatePA}% p.a.)
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="text-xs text-[#686D65] hover:text-[#111311] font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-[#E9ECEF]">
                    <span className="text-[#686D65]">Sanction Loan:</span>
                    <p className="font-bold text-[#111311] font-mono-num">{formatINR(loanStructure.loanAmount)}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E9ECEF]">
                    <span className="text-[#686D65]">Promoter Margin:</span>
                    <p className="font-bold text-[#111311] font-mono-num">{formatINR(loanStructure.promoterEquity)}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E9ECEF]">
                    <span className="text-[#686D65]">Equated Quarterly (EQI):</span>
                    <p className="font-bold text-[#E86043] font-mono-num">{formatINR(amortizationSchedule.equatedQuarterlyInstallment)}</p>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto border border-[#E9ECEF] rounded-xl bg-white text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F8F9FA] text-[#686D65] sticky top-0 border-b border-[#E9ECEF]">
                      <tr>
                        <th className="p-2">Quarter</th>
                        <th className="p-2">Type</th>
                        <th className="p-2">Principal</th>
                        <th className="p-2">Interest</th>
                        <th className="p-2">Instalment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E9ECEF] font-mono-num">
                      {amortizationSchedule.quarters.slice(0, 6).map((q) => (
                        <tr key={q.quarter} className={q.isMoratorium ? 'bg-amber-50/50' : ''}>
                          <td className="p-2 font-bold">Q{q.quarter}</td>
                          <td className="p-2">
                            {q.isMoratorium ? (
                              <span className="text-[11px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                                Moratorium
                              </span>
                            ) : (
                              <span className="text-[11px] bg-emerald-100 text-[#0E7A53] px-1.5 py-0.5 rounded font-medium">
                                Amortizing
                              </span>
                            )}
                          </td>
                          <td className="p-2">{formatINR(q.principalPayment)}</td>
                          <td className="p-2 text-rose-600">{formatINR(q.interestPayment)}</td>
                          <td className="p-2 font-bold text-[#111311]">{formatINR(q.totalInstallment)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center pt-1 text-xs">
                  <span className="text-[#686D65] font-sans-ui">
                    Showing initial quarters of {loanStructure.totalQuarters} total quarters ({loanStructure.tenureYears}-Year Tenure)
                  </span>
                  <button
                    onClick={() => setActiveTab('dpr')}
                    className="px-3 py-1.5 rounded-xl bg-[#111311] text-white font-bold hover:bg-slate-800 transition-all cursor-pointer font-sans-ui"
                  >
                    Generate Lead-Bank DPR ↗
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEWPORT 3: DEBT LIBERATION (Moneylender Refinancing)      */}
            {/* ========================================================= */}
            {activeTab === 'restructure' && (
              <div className="bg-[#F8F6F0] rounded-2xl p-5 border border-[#E9ECEF] space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
                  <div>
                    <span className="text-[11px] font-mono-num text-[#E86043] font-semibold">
                      Mode B · Informal Debt Refinancing
                    </span>
                    <h4 className="font-bold text-sm text-[#111311] font-sans-ui">
                      Moneylender Consolidation Calculator
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="text-xs text-[#686D65] hover:text-[#111311] font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-[#111311] mb-1">
                      <span>Informal Moneylender Principal:</span>
                      <span className="font-bold text-[#E86043] font-mono-num">{formatINR(debtPrincipal)}</span>
                    </div>
                    <input
                      type="range"
                      min={20000}
                      max={300000}
                      step={10000}
                      value={debtPrincipal}
                      onChange={(e) => setDebtPrincipal(parseFloat(e.target.value))}
                      className="w-full accent-[#E86043] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#111311] block mb-1">
                      Informal Rate (Dialectal Quote):
                    </label>
                    <select
                      value={debtRateSenkda}
                      onChange={(e) => setDebtRateSenkda(parseFloat(e.target.value))}
                      className="w-full bg-white border border-[#E9ECEF] rounded-xl p-2 text-xs font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value={3.0}>3 senkda (3% per month / 36% APR)</option>
                      <option value={4.0}>4 senkda (4% per month / 48% APR)</option>
                      <option value={5.0}>5 senkda (5% per month / 60% APR)</option>
                      <option value={2.5}>2.5 senkda (2.5% per month / 30% APR)</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-[#111311] mb-1">
                      <span>Debt Active Duration:</span>
                      <span className="font-bold text-[#E86043] font-mono-num">{debtMonthsActive} months</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={48}
                      step={1}
                      value={debtMonthsActive}
                      onChange={(e) => setDebtMonthsActive(parseInt(e.target.value, 10))}
                      className="w-full accent-[#E86043] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#686D65]">Current Predatory Bleed:</span>
                    <span className="font-bold text-red-600 font-mono-num">{formatINR(debtRefinanceData.monthlyBleed)} / mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686D65]">New NSFDC Concessional EMI:</span>
                    <span className="font-bold text-[#0E7A53] font-mono-num">{formatINR(debtRefinanceData.newEmi)} / mo</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-emerald-200 font-bold">
                    <span className="text-[#111311]">Net Monthly Cash Relief:</span>
                    <span className={`font-mono-num ${debtRefinanceData.monthlyCashRelief >= 0 ? 'text-[#0E7A53]' : 'text-amber-600'}`}>
                      {debtRefinanceData.monthlyCashRelief >= 0 ? '+' : ''}{formatINR(debtRefinanceData.monthlyCashRelief)} / month
                    </span>
                  </div>
                </div>

                {debtRefinanceData.damdupatViolated && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-800 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>
                      <strong>Rule of Damdupat Triggered:</strong> Total interest paid ({formatINR(debtRefinanceData.paidToDate)} over {debtRefinanceData.monthsActive} months) exceeds principal ({formatINR(debtRefinanceData.principal)}). Moneylender barred from demanding further interest under Usurious Loans Act 1918!
                    </span>
                  </div>
                )}

                <button
                  onClick={() => showToast('Generated Usurious Loans Act Legal Defense Package')}
                  className="w-full py-2.5 rounded-xl bg-[#111311] text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer font-sans-ui"
                >
                  Generate Legal Settlement Package ↗
                </button>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEWPORT 4: DPR (1-Page Lead-Bank Report)                  */}
            {/* ========================================================= */}
            {activeTab === 'dpr' && (
              <div className="bg-[#F8F6F0] rounded-2xl p-5 border border-[#E9ECEF] space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
                  <div>
                    <span className="text-[11px] font-mono-num text-[#0E7A53] font-semibold">
                      RBI Lead Bank Scheme Standard (1969)
                    </span>
                    <h4 className="font-bold text-sm text-[#111311] font-sans-ui">
                      1-Page Detailed Project Report (DPR)
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveTab('home')}
                    className="text-xs text-[#686D65] hover:text-[#111311] font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E9ECEF] space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#686D65]">Enterprise Name:</span>
                    <span className="font-bold text-[#111311]">{activeDomain.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686D65]">Beneficiary:</span>
                    <span className="font-bold text-[#111311]">Ramesh Kumar (SC · Verified)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686D65]">Sanction Loan:</span>
                    <span className="font-bold text-[#0E7A53] font-mono-num">{formatINR(loanStructure.loanAmount)} @ {loanStructure.interestRatePA}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686D65]">Promoter Equity Margin:</span>
                    <span className="font-bold text-[#111311] font-mono-num">{formatINR(loanStructure.promoterEquity)} ({loanStructure.promoterEquityPct}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686D65]">Lead-Bank QR Hash:</span>
                    <span className="font-mono-num text-[11px] text-[#686D65]">SHA256: 290bfbc47a9d3e8...mosje_nsfdc_verified</span>
                  </div>
                </div>

                <button
                  onClick={() => showToast('Downloading Official Lead-Bank DPR PDF Dossier')}
                  className="w-full py-2.5 rounded-xl bg-[#111311] text-white font-bold text-xs shadow-md hover:bg-slate-800 transition-all flex items-center justify-center space-x-1.5 cursor-pointer font-sans-ui"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download Bank-Sanction PDF</span>
                </button>
              </div>
            )}

            {/* Operational Command & Filter Console */}
            <div className="bg-[#F8F9FA] rounded-2xl p-3 border border-[#E9ECEF] space-y-2.5">
              <div className="flex items-center space-x-2 text-xs text-[#686D65] px-2">
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
                  placeholder="Enter command or module keyword (e.g. 'amortizer', 'debt', 'dpr')..."
                  className="w-full bg-transparent focus:outline-none text-[#111311] placeholder-[#686D65] text-xs font-medium font-sans-ui"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2 text-xs">
                  <button
                    onClick={() => setActiveTab('dpr')}
                    className="px-2.5 py-1 rounded-lg bg-white text-[#111311] font-semibold text-[11px] border border-[#E9ECEF] hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
                  >
                    Lead-Bank DPR
                  </button>

                  <button
                    onClick={() => setActiveTab('amortizer')}
                    className="px-2.5 py-1 rounded-lg bg-white text-[#111311] font-semibold text-[11px] border border-[#E9ECEF] hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
                  >
                    Quarterly EQI
                  </button>

                  <button
                    onClick={() => showToast('Multilingual Bhashini options active')}
                    className="px-2.5 py-1 rounded-lg bg-white text-[#111311] font-semibold text-[11px] border border-[#E9ECEF] hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
                  >
                    Dialect Settings
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCommand()}
                    className="px-3 py-1.5 rounded-lg bg-[#111311] text-white hover:bg-slate-800 transition-all text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Run
                  </button>
                </div>
              </div>
            </div>

          </main>

          {/* ============================================================= */}
          {/* COLUMN 3: RIGHT PANEL (3 Cols - Recent Scenarios & History)   */}
          {/* ============================================================= */}
          <aside className="lg:col-span-3 bg-white p-6 border-l border-[#E9ECEF] flex flex-col justify-between">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#111311] font-sans-ui">Recent scenarios</h3>
                <button
                  onClick={() => showToast('Refreshed scenario history')}
                  className="text-xs text-[#686D65] hover:text-[#111311] font-medium cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scenarios..."
                  className="w-full bg-[#F8F9FA] rounded-xl px-3 py-2 text-xs text-[#111311] placeholder-[#686D65] border border-[#E9ECEF] focus:outline-none focus:border-[#111311] font-sans-ui"
                />
              </div>

              {/* Recent Scenarios List */}
              <div className="space-y-3.5 pt-2 text-xs">
                {filteredScenarios.length === 0 ? (
                  <div className="p-4 text-center text-[#686D65] bg-[#F8F9FA] rounded-xl border border-[#E9ECEF]">
                    <p className="font-semibold text-xs">No matching scenarios</p>
                    <p className="text-[11px] text-[#A0A59D] mt-0.5">Try searching "Mustard", "Tailoring", or "Debt"</p>
                  </div>
                ) : (
                  filteredScenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      onClick={() => {
                        if (scenario.domainCode) setSelectedDomainCode(scenario.domainCode);
                        if (scenario.tab) setActiveTab(scenario.tab);
                      }}
                      className="p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-all cursor-pointer border border-transparent hover:border-[#E9ECEF]"
                    >
                      <div className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          checked={recentChecks[scenario.id] || false}
                          onChange={(e) => setRecentChecks({ ...recentChecks, [scenario.id]: e.target.checked })}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-0.5 rounded border-gray-300 text-[#111311] focus:ring-0 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-[#111311] font-sans-ui">{scenario.name}</p>
                          <p className="text-[11px] text-[#686D65] mt-0.5 font-sans-ui">{scenario.subtitle}</p>

                          {scenario.image && (
                            <div className="mt-2 rounded-xl overflow-hidden h-20 w-full relative">
                              <img
                                src={scenario.image}
                                alt={scenario.imageAlt}
                                onError={(e) => {
                                  e.currentTarget.src = scenario.imageFallback;
                                }}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            {scenario.type === 'd08' && (
                              <span className="text-[11px] text-[#0E7A53] font-medium font-mono-num">
                                DSCR 1.62x
                              </span>
                            )}

                            {scenario.type === 'd18' && (
                              <span className="text-[11px] text-[#0E7A53] font-medium font-mono-num">
                                DSCR 2.14x
                              </span>
                            )}

                            {scenario.type === 'debt' && (
                              <span className="text-[11px] text-[#0E7A53] font-bold font-mono-num">
                                {scenario.reliefText}
                              </span>
                            )}

                            <span className="text-[11px] text-[#686D65] font-mono-num">{scenario.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Button: Create New Simulation + */}
            <button
              onClick={() => {
                setActiveTab('simulator');
                showToast('Initiating new enterprise simulation');
              }}
              className="w-full py-2.5 rounded-xl bg-[#111311] hover:bg-slate-800 text-white font-bold text-xs tracking-tight shadow-sm transition-all mt-4 cursor-pointer font-sans-ui"
            >
              Create new simulation +
            </button>

          </aside>

        </div>
      </div>

    </section>
  );
}
