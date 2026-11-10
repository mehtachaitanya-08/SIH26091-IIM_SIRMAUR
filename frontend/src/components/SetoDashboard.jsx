import React, { useState, useMemo } from 'react';
import { calculateEMI } from '../engine';
import { AlertTriangle, X, Download } from 'lucide-react';

// Import SSOT Modular Dashboard Subcomponents
import DashboardShell from './dashboard/DashboardShell';
import NavRail from './dashboard/NavRail';
import StarBlossom from './dashboard/StarBlossom';
import SeasonalitySimulatorView from './dashboard/SeasonalitySimulatorView';
import NsfdcAmortizerView from './dashboard/NsfdcAmortizerView';
import DebtLiberationView from './dashboard/DebtLiberationView';
import LeadBankDprView from './dashboard/LeadBankDprView';
import CommandBar from './dashboard/CommandBar';
import ScenariosSidebar from './dashboard/ScenariosSidebar';
import StatutoryVerificationModal from './dashboard/StatutoryVerificationModal';

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
 * SetoDashboard — Master Synchronized Facade (Landing Page Scene 6 Mockup)
 * Orchestrates SSOT subcomponents in mode="mockup" with zero network calls.
 * Preserves all statutory tokens and bounds required by empirical test contracts.
 */
export default function SetoDashboard({ language = 'en', currentUser = null }) {
  // Navigation & Viewport State
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'simulator' | 'amortizer' | 'restructure' | 'dpr'
  const [selectedDomainCode, setSelectedDomainCode] = useState('D08');
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState(true);

  // Mode B Debt Restructuring Interactive States (Preserves empirical slider token contracts)
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

  // No loan figures in the mock-up: the signed-in dashboard gets them from the server.
  const loanStructure = null;
  const amortizationSchedule = null;

  // Debt Relief Calculations
  const debtRefinanceData = useMemo(() => {
    const p = debtPrincipal;
    const apr = debtRateSenkda * 12; // 3 senkda = 36% APR
    const monthlyBleed = Math.round(p * (apr / 100 / 12));

    // Concessional 6.5% NSFDC Refinancing (Term Loan structure equivalent: 36 months @ 6.5% p.a.)
    const calculatedEmi = calculateEMI(p, 6.5, 36);
    const monthlyCashRelief = monthlyBleed - calculatedEmi;

    const monthsActive = debtMonthsActive;
    const paidToDate = monthlyBleed * monthsActive;
    const damdupatViolated = paidToDate >= p;

    return {
      principal: p,
      apr,
      monthlyBleed,
      newEmi: calculatedEmi,
      monthlyCashRelief,
      monthsActive,
      paidToDate,
      damdupatViolated
    };
  }, [debtPrincipal, debtRateSenkda, debtMonthsActive]);

  // Filtered Scenarios List based on Search Query
  const filteredScenarios = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return RECENT_SCENARIOS;
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
      showToast('Opened the NSFDC Amortizer (figures on the dashboard)');
    } else if (text.includes('debt') || text.includes('moneylender') || text.includes('relief') || text.includes('senkda')) {
      setActiveTab('restructure');
      showToast('Loaded Moneylender Debt Liberation & Damdupat Audit');
    } else if (text.includes('dpr') || text.includes('pdf') || text.includes('report') || text.includes('bank')) {
      setActiveTab('dpr');
      showToast('Opened the 1-Page DPR (download on the dashboard)');
    } else {
      setActiveTab('simulator');
      showToast(`AI Assistant calibrated parameters for ${activeDomain.name}`);
    }
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const userGreeting = currentUser?.name 
    ? `Welcome, ${currentUser.name.split(' ')[0]}!` 
    : (language === 'hi' ? 'स्वागत है!' : 'Welcome!');

  return (
    <DashboardShell
      language={language}
      mode="mockup"
      id="dashboard-section"
      toastMessage={toastMessage}
    >
      {/* Statutory Beneficiary Verification Modal */}
      <StatutoryVerificationModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        currentUser={currentUser}
        language={language}
      />

      {/* Column 1: Left Navigation Rail */}
      <NavRail
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedDomainCode={selectedDomainCode}
        onSelectDomain={setSelectedDomainCode}
        presets={PRESETS}
        isAdvisoryOpen={isAdvisoryOpen}
        onToggleAdvisory={() => setIsAdvisoryOpen(!isAdvisoryOpen)}
        currentUser={currentUser}
        language={language}
        onVerifyClick={() => setUserModalOpen(true)}
        onShowToast={showToast}
        mode="mockup"
      />

      {/* Column 2: Center Workspace */}
      <main className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white overflow-y-auto">
        
        {/* Executive Header with StarBlossom */}
        <div className="border-b border-[#E9ECEF] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <StarBlossom size={36} className="iris-star-svg flex-shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#111311] tracking-tight font-sans-ui">
                  Enterprise Advisory Console
                </h2>
                <p className="text-xs text-[#686D65] mt-0.5 font-sans-ui">
                  <span className="font-semibold text-[#111311]">{userGreeting}</span> · MoSJE / NSFDC Concessional Credit Facility
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-[#0E7A53] font-semibold border border-emerald-200">
                {currentUser?.district || 'Sitapur District'} · {currentUser?.id || 'STATUTORY-VERIFIED'}
              </span>
            </div>
          </div>
        </div>

        {/* Viewport: Home Quick Action Cards */}
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

        {/* Viewport: Seasonality Simulator */}
        {activeTab === 'simulator' && (
          <SeasonalitySimulatorView
            activeDomain={activeDomain}
            onClose={() => setActiveTab('home')}
            onNavigateAmortizer={() => setActiveTab('amortizer')}
            formatINR={formatINR}
          />
        )}

        {/* Viewport: NSFDC Amortizer */}
        {activeTab === 'amortizer' && (
          <NsfdcAmortizerView
            loanStructure={loanStructure}
            amortizationSchedule={amortizationSchedule}
            onClose={() => setActiveTab('home')}
            onNavigateDpr={() => setActiveTab('dpr')}
            formatINR={formatINR}
          />
        )}

        {/* Viewport: Debt Liberation & Damdupat Defense */}
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
                type="button"
                onClick={() => setActiveTab('home')}
                className="text-xs text-[#686D65] hover:text-[#111311] font-semibold cursor-pointer font-sans-ui"
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
                  className="w-full bg-white border border-[#E9ECEF] rounded-xl p-2 text-xs font-semibold focus:outline-none cursor-pointer font-sans-ui"
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
              type="button"
              onClick={() => showToast('Generated Usurious Loans Act Legal Defense Package')}
              className="w-full py-2.5 rounded-xl bg-[#111311] text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer font-sans-ui"
            >
              Generate Legal Settlement Package ↗
            </button>
          </div>
        )}

        {/* Viewport: 1-Page Lead-Bank DPR */}
        {activeTab === 'dpr' && (
          <LeadBankDprView
            activeDomain={activeDomain}
            loanStructure={loanStructure}
            currentUser={currentUser}
            language={language}
            onClose={() => setActiveTab('home')}
            onDownloadPdf={() => showToast('Sign in to download the DPR PDF from the dashboard')}
            formatINR={formatINR}
            mode="mockup"
          />
        )}

        {/* Bottom Command Bar */}
        <CommandBar
          commandInput={commandInput}
          onInputChange={setCommandInput}
          onSubmit={handleCommand}
          onSelectChip={(tab) => setActiveTab(tab)}
          onShowToast={showToast}
          mode="mockup"
        />

      </main>

      {/* Column 3: Right Sidebar */}
      <aside className="lg:col-span-3 bg-white p-6 border-l border-[#E9ECEF] flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#111311] font-sans-ui">Recent scenarios</h3>
            <button
              type="button"
              onClick={() => showToast('Refreshed scenario history')}
              className="text-xs text-[#686D65] hover:text-[#111311] font-medium cursor-pointer font-sans-ui"
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
                <p className="text-[11px] text-[#A0A59D] mt-0.5">
                  Try searching "Mustard", "Tailoring", or "Debt"
                </p>
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
                      checked={Boolean(recentChecks[scenario.id])}
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
                            alt={scenario.imageAlt || 'Scenario preview'}
                            onError={(e) => {
                              if (scenario.imageFallback) e.currentTarget.src = scenario.imageFallback;
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-[#0E7A53] font-medium font-sans-ui">
                          see dashboard
                        </span>

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
          type="button"
          onClick={() => {
            setActiveTab('simulator');
            showToast('Initiating new enterprise simulation');
          }}
          className="w-full py-2.5 rounded-xl bg-[#111311] hover:bg-slate-800 text-white font-bold text-xs tracking-tight shadow-sm transition-all mt-4 cursor-pointer font-sans-ui"
        >
          Create new simulation +
        </button>
      </aside>

    </DashboardShell>
  );
}
