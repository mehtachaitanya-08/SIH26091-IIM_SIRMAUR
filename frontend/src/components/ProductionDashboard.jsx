import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  calculateNSFDCLoan,
  restructureDebt,
  fetchDossiers,
  fetchHealth,
  fetchFeasibility,
  downloadDpr,
  sendChat,
  chatRoute,
  dprPayload,
  fetchMandiPrices,
  fetchDossierCashflow
} from '../services/api';

// Import SSOT Modular Dashboard Components
import DashboardShell from './dashboard/DashboardShell';
import NavRail from './dashboard/NavRail';
import CenterWorkspace from './dashboard/CenterWorkspace';
import ScenariosSidebar from './dashboard/ScenariosSidebar';
import StatutoryVerificationModal from './dashboard/StatutoryVerificationModal';

// Seed scenarios: names and where they open. No figures: every figure comes from the server.
const DEFAULT_PRODUCTION_SCENARIOS = [
  {
    id: 'D20',
    domainCode: 'D20',
    tab: 'feasibility',
    name: 'D20 Metal Smithy',
    subtitle: 'Verified business · feasibility and loan',
    time: 'Start here',
    type: 'custom'
  },
  {
    id: 'D18',
    domainCode: 'D18',
    tab: 'amortizer',
    name: 'D18 Tailoring Workshop',
    subtitle: 'Not yet verified · NSFDC loan only: enter your cost',
    image: '/images/scenario_tailoring.jpg',
    imageAlt: 'Tailoring craftsmanship',
    imageFallback: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    time: 'Template',
    type: 'custom'
  },
  {
    id: 'debt',
    tab: 'restructure',
    name: 'Sahukar Debt Relief',
    subtitle: 'Moneylender senkda debt → bank credit (ASSUMED engine)',
    time: 'Template',
    type: 'custom'
  }
];

// Saved scenarios are stored as {v: 2, list}. Older saves (a bare list) carried invented
// figures (e.g. DSCR badges), so they are not shown again.
const SCENARIOS_KEY = 'graminai_production_scenarios';
function loadScenarios() {
  try {
    const saved = JSON.parse(localStorage.getItem(SCENARIOS_KEY));
    return saved && saved.v === 2 && Array.isArray(saved.list) ? saved.list : DEFAULT_PRODUCTION_SCENARIOS;
  } catch {
    return DEFAULT_PRODUCTION_SCENARIOS;
  }
}

const isPositiveNumber = (v) => v !== '' && v !== null && Number.isFinite(Number(v)) && Number(v) > 0;
const isNonNegativeNumber = (v) => v !== '' && v !== null && Number.isFinite(Number(v)) && Number(v) >= 0;

/**
 * ProductionDashboard — Live Authenticated Production Workspace
 * Every figure comes from the verified server (backend/app.py) through api.js. When the server
 * is offline a red banner says so; only the NSFDC loan is still worked out in the browser
 * (same rules, services/nsfdcLoan.js). Anything not in the verified data shows NOT FOUND.
 */
export default function ProductionDashboard({
  language = 'en',
  currentUser = null,
  onNavigateHome,
  initialTab = 'home'
}) {
  // Navigation & Viewport State
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedDomainCode, setSelectedDomainCode] = useState('D20');
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState(true);

  // The 24 businesses from the server: {code: {code, name, status}}
  const [allDossiers, setAllDossiers] = useState({});
  const [serverOffline, setServerOffline] = useState(false);

  // Loan inputs: all USER INPUT. SC status pre-filled only from the user's own registration answer.
  const [projectCost, setProjectCost] = useState('');
  const [familyIncome, setFamilyIncome] = useState('');
  const registeredSc = typeof currentUser?.category === 'string' && /\(SC\)|^SC$/.test(currentUser.category);
  const [isSc, setIsSc] = useState(registeredSc ? true : null);
  // The session can arrive after the first render: pre-fill once it does, unless the user already chose.
  useEffect(() => {
    if (registeredSc) setIsSc((prev) => (prev === null ? true : prev));
  }, [registeredSc]);
  const [loanResult, setLoanResult] = useState(null);
  const [loanError, setLoanError] = useState(null);
  // Answers the chat collected, kept with the business they belong to: {code, answers}
  const [adviceAnswers, setAdviceAnswers] = useState(null);

  // Mode B Debt Restructuring inputs (USER INPUT) and the server's reply.
  // Nothing is worked out until the user enters their own debt (the sliders start at their old positions).
  const [debtPrincipal, setDebtPrincipal] = useState(120000);
  const [debtRateSenkda, setDebtRateSenkda] = useState(3.0);
  const [debtMonthsActive, setDebtMonthsActive] = useState(36);
  const [debtEntered, setDebtEntered] = useState(false);
  const enterDebt = (setter) => (v) => { setDebtEntered(true); setter(v); };
  const [debtRefinanceData, setDebtRefinanceData] = useState(null);

  // Feasibility report for the selected business
  const [feasibility, setFeasibility] = useState(null);

  // Chat
  const [commandInput, setCommandInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatBusy, setChatBusy] = useState(false);
  const [chatNotice, setChatNotice] = useState(null);

  // UI & Scenario Persistence States
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentChecks, setRecentChecks] = useState({ D20: true, D18: false, debt: false });
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [mandiPriceData, setMandiPriceData] = useState(null);
  const [scenariosList, setScenariosList] = useState(loadScenarios);

  // Every reply updates the banner: it shows while replies are offline and clears once the server answers.
  const noteOffline = useCallback((res) => {
    if (res && typeof res === 'object') setServerOffline(Boolean(res.offline));
    return res;
  }, []);

  // Load the business list and health check on mount
  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchHealth(), fetchDossiers()]).then(([healthRes, dossiersRes]) => {
      if (!isMounted) return;
      setServerOffline(Boolean(healthRes?.offline || dossiersRes?.offline));
      const mapped = {};
      (dossiersRes?.dossiers || []).forEach((d) => {
        mapped[d.code] = { code: d.code, name: d.name || d.code, status: d.status };
      });
      setAllDossiers(mapped);
    }).catch((err) => console.warn('[ProductionDashboard] Initialization warning:', err));
    return () => { isMounted = false; };
  }, []);

  // Selected business: the server's name and status; nothing else is assumed about it.
  const activeDomain = allDossiers[selectedDomainCode] || { code: selectedDomainCode, name: selectedDomainCode, status: 'loading' };

  // Feasibility report for the selected business
  useEffect(() => {
    let isMounted = true;
    setFeasibility(null);
    fetchFeasibility(selectedDomainCode).then((res) => {
      if (isMounted) setFeasibility(noteOffline(res));
    }).catch((err) => { if (isMounted) setFeasibility({ code: selectedDomainCode, error: err.message }); });
    return () => { isMounted = false; };
  }, [selectedDomainCode, noteOffline]);

  // NSFDC loan: only once the user has entered cost, income and SC status
  const loanReady = isPositiveNumber(projectCost) && isNonNegativeNumber(familyIncome) && typeof isSc === 'boolean';
  useEffect(() => {
    let isMounted = true;
    setLoanResult(null);
    setLoanError(null);
    if (!loanReady) return undefined;
    calculateNSFDCLoan(Number(projectCost), Number(familyIncome), { isSc }).then((res) => {
      if (isMounted) setLoanResult(noteOffline(res));
    }).catch((err) => { if (isMounted) setLoanError(err.message); });
    return () => { isMounted = false; };
  }, [projectCost, familyIncome, isSc, loanReady, noteOffline]);

  // Shapes the views read. interestRatePA comes from the server's interestRatePa (p.a. %).
  const loanStructure = loanResult && loanResult.isEligible ? {
    schemeName: loanResult.schemeName,
    loanAmount: loanResult.loanAmount,
    promoterEquity: loanResult.promoterEquity,
    promoterEquityPct: loanResult.promoterEquityPct,
    repaymentQuarters: loanResult.repaymentQuarters,
    moratoriumQuarters: loanResult.moratoriumQuarters,
    interestRatePA: loanResult.interestRatePa,
    totalQuarters: loanResult.totalQuarters,
    tenureYears: loanResult.tenureYears,
    interestAddedDuringPause: loanResult.interestAddedDuringPause,
    totalDebtService: loanResult.totalDebtService,
    tags: loanResult.tags || {},
    offline: Boolean(loanResult.offline)
  } : null;
  const amortizationSchedule = loanStructure ? {
    equatedQuarterlyInstallment: loanResult.equatedQuarterlyInstallment,
    quarters: loanResult.amortizationSchedule || []
  } : null;
  const loanInputs = {
    projectCost, familyIncome, isSc,
    onProjectCostChange: setProjectCost,
    onFamilyIncomeChange: setFamilyIncome,
    onIsScChange: setIsSc,
    ready: loanReady,
    result: loanResult,
    error: loanError
  };

  // Mode B Debt Restructuring: the server's figures only (team's engine, tagged ASSUMED by the server)
  useEffect(() => {
    let isMounted = true;
    if (!debtEntered) { setDebtRefinanceData(null); return undefined; }
    restructureDebt(debtPrincipal, debtRateSenkda, debtMonthsActive).then((res) => {
      if (!isMounted) return;
      noteOffline(res);
      if (res.offline) { setDebtRefinanceData({ offline: true }); return; }
      const debt = (res.auditedDebts || res.audited_debts || [])[0] || {};
      const plan = res.refinancingPlan || res.refinancing_plan || {};
      setDebtRefinanceData({
        principal: debtPrincipal,
        monthlyBleed: res.oldMonthlyInterest,
        newEmi: res.newMonthlyEmi,
        monthlyCashRelief: res.monthlySavings,
        monthsActive: debtMonthsActive,
        paidToDate: debt.total_interest_paid_to_date,
        damdupatViolated: res.damdupatViolated,
        pathwayName: plan.pathway_name,
        formalRatePct: plan.formal_interest_rate_pct,
        tag: res.tags?.source
      });
    }).catch((err) => {
      if (isMounted) setDebtRefinanceData({ error: err.message });
    });
    return () => { isMounted = false; };
  }, [debtPrincipal, debtRateSenkda, debtMonthsActive, debtEntered, noteOffline]);

  // Query Daily Agmarknet Mandi Spot Prices via data.gov.in API
  useEffect(() => {
    let isMounted = true;
    const commodityMap = {
      D08: 'Mustard',
      D07: 'Wheat',
      D04: 'Wheat',
      D01: 'Wheat',
      D02: 'Paddy',
      D05: 'Maize',
      D09: 'Gram',
      D18: 'Cotton',
      D11: 'Paddy',
      D15: 'Mustard'
    };
    // ASSUMED: the teammate's business-to-crop list (not from any source). A business not on the
    // list has no crop, so no mandi price is asked for (it used to fall back to mustard).
    const commodity = commodityMap[selectedDomainCode];
    if (!commodity) {
      setMandiPriceData({ status: 'no_crop', isLive: false, modalPrice: null, records: [],
        reason: 'No crop is linked to this business, so there is no mandi price.' });
      return () => { isMounted = false; };
    }
    setMandiPriceData(null);
    fetchMandiPrices('Uttar Pradesh', commodity).then((data) => {
      if (!isMounted) return;
      setMandiPriceData({ ...data, commodityTag: "ASSUMED: team's business-to-crop list" });
    }).catch((err) => {
      if (isMounted) setMandiPriceData({ status: 'no_live_data', isLive: false, modalPrice: null, records: [], reason: err.message });
    });

    return () => { isMounted = false; };
  }, [selectedDomainCode]);

  // Helper Toast
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Filtered Scenarios List
  const filteredScenarios = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return scenariosList;
    const q = searchQuery.toLowerCase().trim();
    return scenariosList.filter(s =>
      s.name.toLowerCase().includes(q) ||
      (s.subtitle && s.subtitle.toLowerCase().includes(q)) ||
      (s.id && s.id.toLowerCase().includes(q))
    );
  }, [searchQuery, scenariosList]);

  // Save Scenarios to localStorage
  const persistScenarios = (newScenarios) => {
    setScenariosList(newScenarios);
    try {
      localStorage.setItem(SCENARIOS_KEY, JSON.stringify({ v: 2, list: newScenarios }));
    } catch {
      // Ignore localStorage exceptions in restricted sandbox environments
    }
  };

  // Create New Simulation Action: saves the business and the user's own cost, nothing invented
  const handleCreateNewSimulation = () => {
    const newId = `SIM-${Date.now().toString().slice(-4)}`;
    const newScenario = {
      id: newId,
      domainCode: activeDomain.code,
      tab: 'amortizer',
      name: `${activeDomain.code} ${String(activeDomain.name).split(' ')[0]} Sim`,
      subtitle: isPositiveNumber(projectCost) ? `Project cost ${formatINR(Number(projectCost))} (your input)` : 'Project cost not entered yet',
      time: 'Just now',
      type: 'custom'
    };
    persistScenarios([newScenario, ...scenariosList]);
    setActiveTab('amortizer');
    showToast(`Created & Saved Simulation [${newId}]`);
  };

  // Refresh Scenarios Action
  const handleRefreshScenarios = () => {
    setScenariosList(loadScenarios());
    showToast('Refreshed scenario library');
  };

  // Chat: the whole conversation goes to the server each time; the server keeps nothing.
  const handleChatSend = async (overrideText = null) => {
    const text = (overrideText ?? commandInput).trim();
    if (!text || chatBusy) return;
    setCommandInput('');
    const msgs = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(msgs);
    setChatBusy(true);
    setChatNotice(null);
    try {
      const res = await sendChat(msgs);
      if (res.offline) {
        setServerOffline(true);
        setChatMessages(chatMessages); // not answered: keep it out of the conversation, give it back in the box
        setCommandInput(text);
        setChatNotice('Server offline: the assistant is not available. The loan calculator still works.');
        return;
      }
      setServerOffline(false);
      if (res.status !== 'ok') {
        setChatNotice(res.status === 'ai_key_rejected'
          ? 'AI key rejected: the assistant is not available. The loan calculator still works.'
          : 'AI offline: the assistant is not available right now. The loan calculator still works.');
      }
      if (res.reply) setChatMessages([...msgs, { role: 'assistant', content: res.reply }]);
      else { setChatMessages(chatMessages); setCommandInput(text); }
      const route = chatRoute(res.tool_results);
      if (route.code) setSelectedDomainCode(route.code);
      if (route.loanInputs) {
        if (route.loanInputs.projectCost !== undefined) setProjectCost(String(route.loanInputs.projectCost));
        if (route.loanInputs.familyIncome !== undefined) setFamilyIncome(String(route.loanInputs.familyIncome));
        if (typeof route.loanInputs.isSc === 'boolean') setIsSc(route.loanInputs.isSc);
      }
      if (route.answers) setAdviceAnswers({ code: route.code, answers: route.answers });
      if (route.tab) setActiveTab(route.tab);
    } catch (err) {
      setChatMessages(chatMessages);
      setCommandInput(text);
      setChatNotice(`Assistant error: ${err.message}`);
    } finally {
      setChatBusy(false);
    }
  };

  // 1-page DPR PDF, made by the server from verified data
  const handleDownloadDprPdf = async () => {
    if (!loanReady) {
      setActiveTab('amortizer');
      showToast('Enter project cost, family income and SC status first');
      return;
    }
    try {
      const blob = await downloadDpr(dprPayload({
        code: activeDomain.code,
        projectCost: Number(projectCost),
        familyIncome: Number(familyIncome),
        isSc,
        answers: adviceAnswers,
        applicantName: currentUser?.name || null
      }));
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `DPR_${activeDomain.code}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Downloaded DPR for ${activeDomain.code}`);
    } catch (err) {
      if (err.name === 'ServerOfflineError') setServerOffline(true);
      showToast(`DPR not made: ${err.message}`);
    }
  };

  function formatINR(val) {
    if (typeof val !== 'number' || !Number.isFinite(val)) return 'NOT FOUND';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);
  }

  const banner = serverOffline ? (
    <div role="alert" className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 font-sans-ui">
      Server offline. Business data, feasibility, DPR and the assistant need the server. The NSFDC loan is still worked out
      in your browser with the same rules. Start the server with: backend/.venv/bin/uvicorn backend.app:app --port 8000
    </div>
  ) : null;

  return (
    <DashboardShell
      language={language}
      mode="production"
      id="production-dashboard"
      toastMessage={toastMessage}
      showTitle={false}
      banner={banner}
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
        presets={allDossiers}
        isAdvisoryOpen={isAdvisoryOpen}
        onToggleAdvisory={() => setIsAdvisoryOpen(!isAdvisoryOpen)}
        currentUser={currentUser}
        language={language}
        onVerifyClick={() => setUserModalOpen(true)}
        onShowToast={showToast}
        mode="production"
      />

      {/* Column 2: Center Workspace */}
      <CenterWorkspace
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        activeDomain={activeDomain}
        currentUser={currentUser}
        language={language}
        loanStructure={loanStructure}
        amortizationSchedule={amortizationSchedule}
        loanInputs={loanInputs}
        feasibility={feasibility}
        debtPrincipal={debtPrincipal}
        onPrincipalChange={enterDebt(setDebtPrincipal)}
        debtRateSenkda={debtRateSenkda}
        onRateChange={enterDebt(setDebtRateSenkda)}
        debtMonthsActive={debtMonthsActive}
        onMonthsActiveChange={enterDebt(setDebtMonthsActive)}
        debtEntered={debtEntered}
        debtRefinanceData={debtRefinanceData}
        commandInput={commandInput}
        onCommandInputChange={setCommandInput}
        onCommandSubmit={() => handleChatSend()}
        chatMessages={chatMessages}
        chatBusy={chatBusy}
        chatNotice={chatNotice}
        onShowToast={showToast}
        onDownloadPdf={handleDownloadDprPdf}
        formatINR={formatINR}
        mandiPriceData={mandiPriceData}
        mode="production"
      />

      {/* Column 3: Right Sidebar */}
      <ScenariosSidebar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredScenarios={filteredScenarios}
        recentChecks={recentChecks}
        onCheckChange={(id, checked) => setRecentChecks(prev => ({ ...prev, [id]: checked }))}
        onSelectScenario={(scenario) => {
          if (scenario.domainCode) setSelectedDomainCode(scenario.domainCode);
          if (scenario.tab) setActiveTab(scenario.tab);
        }}
        onRefresh={handleRefreshScenarios}
        onCreateSimulation={handleCreateNewSimulation}
        mode="production"
      />
    </DashboardShell>
  );
}
