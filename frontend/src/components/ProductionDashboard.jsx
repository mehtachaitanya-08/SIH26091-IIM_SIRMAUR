import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  fetchDossierCashflow,
  fetchDossier
} from '../services/api';
import { tierOptions, costOnBusinessLoad, flowSteps } from '../services/dossierView';
import { CATEGORY_SC, CATEGORY_NOT_SC } from '../data/userDatabase';
import { makeLatest, TYPING_PAUSE_MS } from '../services/latest';

// Import SSOT Modular Dashboard Components
import DashboardShell from './dashboard/DashboardShell';
import NavRail from './dashboard/NavRail';
import CenterWorkspace from './dashboard/CenterWorkspace';
import ChatLauncher from './dashboard/ChatLauncher';
import { chatNotice as noticeText } from '../services/chatText';
import ScenariosSidebar from './dashboard/ScenariosSidebar';

// The sidebar lists only scenarios the user saved. It used to start with three made-up "recent"
// cards ("Start here", "Template", a stock photo), which read as someone's past work
// (teammate review, 11 Nov 2026).
const DEFAULT_PRODUCTION_SCENARIOS = [];

// Saved scenarios are stored as {v: 2, list}. Older saves (a bare list) carried invented
// figures (e.g. DSCR badges), so they are not shown again.
const SCENARIOS_KEY = 'udyamsetuai_production_scenarios';
function loadScenarios() {
  try {
    const saved = JSON.parse(localStorage.getItem(SCENARIOS_KEY));
    return saved && saved.v === 2 && Array.isArray(saved.list) ? saved.list : DEFAULT_PRODUCTION_SCENARIOS;
  } catch {
    return DEFAULT_PRODUCTION_SCENARIOS;
  }
}

// Chat notices now follow the language picked in the chat panel (Stage A, services/chatText.js);
// before a language is picked they are Hindi with English under them (owner's decision, 11 Nov 2026).

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
  initialTab = 'home',
  initialQuestion = null,
  onInitialQuestionUsed
}) {
  // Navigation & Viewport State
  const [activeTab, setActiveTab] = useState(initialTab);
  // Opens on D01 Village FMCG Retail: its dossier has every loan size, the surplus, the DSCR and
  // the season, where D20 had 46 gaps and showed rows of NOT FOUND first (teammate review, 11 Nov 2026).
  // It is only shown as an example: step 1 ticks once the user picks a business themselves.
  const [selectedDomainCode, setSelectedDomainCode] = useState('D01');
  const [businessPicked, setBusinessPicked] = useState(false);
  const [costChosen, setCostChosen] = useState(false);
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState(true);

  // The 24 businesses from the server: {code: {code, name, status}}
  const [allDossiers, setAllDossiers] = useState({});
  const [serverOffline, setServerOffline] = useState(false);

  // Loan inputs: all USER INPUT. SC status pre-filled only from the user's own registration answer.
  const [projectCost, setProjectCost] = useState('');
  const [familyIncome, setFamilyIncome] = useState('');
  // The user's own sign-up answer, either way: a "No" used to be dropped and asked again (review, 11 Nov 2026).
  const registeredSc = currentUser?.category === CATEGORY_SC || currentUser?.category === 'SC';
  const registeredNotSc = currentUser?.category === CATEGORY_NOT_SC;
  const registeredAnswer = registeredSc ? true : registeredNotSc ? false : null;
  const [isSc, setIsSc] = useState(registeredAnswer);
  // The session can arrive after the first render: pre-fill once it does, unless the user already chose.
  useEffect(() => {
    if (registeredAnswer !== null) setIsSc((prev) => (prev === null ? registeredAnswer : prev));
  }, [registeredAnswer]);
  // My account (Stage A): an empty income box is filled from the saved yearly income, the same way.
  const savedIncome = typeof currentUser?.income === 'number' && Number.isFinite(currentUser.income) ? String(currentUser.income) : null;
  useEffect(() => {
    if (savedIncome !== null) setFamilyIncome((prev) => (prev === '' ? savedIncome : prev));
  }, [savedIncome]);
  const [loanResult, setLoanResult] = useState(null);
  const [loanError, setLoanError] = useState(null);
  // Answers the chat collected, kept with the business they belong to: {code, answers}
  const [adviceAnswers, setAdviceAnswers] = useState(null);

  // Mode B Debt Restructuring inputs (USER INPUT) and the server's reply.
  // Nothing is worked out until the user enters their own debt (the sliders start at their old positions).
  const [debtPrincipal, setDebtPrincipal] = useState(120000);
  const [debtRateSenkda, setDebtRateSenkda] = useState(3.0);
  const [debtMonthsActive, setDebtMonthsActive] = useState(36);
  // Household monthly income for the debt tool: blank until the user types it; the server then
  // leaves its "share of income" figures empty instead of assuming 35,000 a month.
  const [debtIncome, setDebtIncome] = useState('');
  const [debtEntered, setDebtEntered] = useState(false);
  const enterDebt = (setter) => (v) => { setDebtEntered(true); setter(v); };
  const [debtRefinanceData, setDebtRefinanceData] = useState(null);

  // Feasibility report for the selected business
  const [feasibility, setFeasibility] = useState(null);

  // Chat
  const [commandInput, setCommandInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatBusy, setChatBusy] = useState(false);
  const [chatNotice, setChatNotice] = useState(null); // {key, detail?}: shown in the chat's language
  // Chat panel (Stage A): closed until the user opens it; language null until picked.
  const [chatOpen, setChatOpen] = useState(false);
  const [chatLanguage, setChatLanguage] = useState(null);

  // UI & Scenario Persistence States
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mandiPriceData, setMandiPriceData] = useState(null);
  const [mandiKeyConfigured, setMandiKeyConfigured] = useState(null); // from the server's health check
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
      setMandiKeyConfigured(typeof healthRes?.mandiKeyConfigured === 'boolean' ? healthRes.mandiKeyConfigured : null);
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

  // The business's dossier figures (sizes, season). The loan tab starts with the first size that has
  // a cost (Micro first), unless the chat has just given a cost for this business.
  const [dossierDetail, setDossierDetail] = useState(null);
  // Who last set the cost box for the current business: null (nobody), 'user' or 'chat'.
  // Reset when the user picks another business; the chat sets 'chat' along with its business.
  const costOrigin = useRef(null);
  const selectBusiness = useCallback((code) => {
    costOrigin.current = null;
    setCostChosen(false);
    setBusinessPicked(true);
    setSelectedDomainCode(code);
  }, []);
  const typeCost = useCallback((v) => {
    costOrigin.current = 'user';
    setCostChosen(true);
    setProjectCost(v);
  }, []);
  useEffect(() => {
    let isMounted = true;
    setDossierDetail(null);
    fetchDossier(selectedDomainCode).then((res) => {
      if (!isMounted) return;
      noteOffline(res);
      const detail = res && !res.offline ? res : null;
      setDossierDetail(detail);
      const next = costOnBusinessLoad({ origin: costOrigin.current, dossier: detail });
      if (next !== null) setProjectCost(next);
    }).catch(() => { if (isMounted) setDossierDetail(null); });
    return () => { isMounted = false; };
  }, [selectedDomainCode, noteOffline]);

  // The dossier's own printed cash-flow cover (DSCR) for the size matching the cost (or the nearest, ASSUMED)
  const [dossierCashflow, setDossierCashflow] = useState(null);
  const [cashflowUpdating, setCashflowUpdating] = useState(false);
  const cashflowLatest = useRef(makeLatest());
  const cashflowCode = useRef(selectedDomainCode);
  useEffect(() => {
    const id = cashflowLatest.current.next();
    // Typing fix (Stage A): the old figures stay on screen while the user types (they used to be
    // cleared on every key, so the page jumped); they go only when the business changes or the
    // cost is gone. The server is asked 0.4 s after the last key.
    if (cashflowCode.current !== selectedDomainCode) { cashflowCode.current = selectedDomainCode; setDossierCashflow(null); }
    if (!isPositiveNumber(projectCost)) { setDossierCashflow(null); setCashflowUpdating(false); return undefined; }
    setCashflowUpdating(true);
    const timer = setTimeout(() => {
      // SC unknown -> not sent, so the server takes it as SC and says so as ASSUMED on screen. The page
      // used to send "true" itself, which hid that assumption (review, 11 Nov 2026).
      fetchDossierCashflow(selectedDomainCode, Number(projectCost),
        isNonNegativeNumber(familyIncome) ? Number(familyIncome) : 0, typeof isSc === 'boolean' ? isSc : undefined)
        .then((res) => { if (cashflowLatest.current.isCurrent(id)) { setDossierCashflow(noteOffline(res)); setCashflowUpdating(false); } })
        .catch((err) => { if (cashflowLatest.current.isCurrent(id)) { setDossierCashflow({ status: 'NOT FOUND', reason: err.message }); setCashflowUpdating(false); } });
    }, TYPING_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [selectedDomainCode, projectCost, familyIncome, isSc, noteOffline]);

  // NSFDC loan: only once the user has entered cost, income and SC status
  const loanReady = isPositiveNumber(projectCost) && isNonNegativeNumber(familyIncome) && typeof isSc === 'boolean';
  const [loanUpdating, setLoanUpdating] = useState(false);
  const loanLatest = useRef(makeLatest());
  useEffect(() => {
    const id = loanLatest.current.next();
    // Typing fix (Stage A): keep the last loan on screen with a one-line "updating…" until the
    // new answer arrives; ask 0.4 s after the last key; a late reply to an older value is ignored.
    if (!loanReady) { setLoanResult(null); setLoanError(null); setLoanUpdating(false); return undefined; }
    setLoanUpdating(true);
    const timer = setTimeout(() => {
      calculateNSFDCLoan(Number(projectCost), Number(familyIncome), { isSc }).then((res) => {
        if (!loanLatest.current.isCurrent(id)) return;
        setLoanError(null); setLoanResult(noteOffline(res)); setLoanUpdating(false);
      }).catch((err) => {
        if (!loanLatest.current.isCurrent(id)) return;
        setLoanError(err.message); setLoanUpdating(false);
      });
    }, TYPING_PAUSE_MS);
    return () => clearTimeout(timer);
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
    onProjectCostChange: typeCost,
    onFamilyIncomeChange: setFamilyIncome,
    onIsScChange: setIsSc,
    ready: loanReady,
    updating: loanUpdating,
    result: loanResult,
    error: loanError,
    tiers: tierOptions(dossierDetail),
    onPickTier: (cost) => typeCost(String(cost))
  };
  const steps = flowSteps({ businessPicked, costChosen, projectCost, familyIncome, isSc, loanReady });

  // Mode B Debt Restructuring: the server's figures only (team's engine, tagged ASSUMED by the server)
  const debtLatest = useRef(makeLatest());
  const [debtUpdating, setDebtUpdating] = useState(false);
  useEffect(() => {
    const id = debtLatest.current.next();
    const isMounted = () => debtLatest.current.isCurrent(id);
    if (!debtEntered) { setDebtRefinanceData(null); setDebtUpdating(false); return undefined; }
    setDebtUpdating(true);
    // Only a positive income is sent: a share of a zero income is not a figure (review, 11 Nov 2026).
    const incomeOption = isPositiveNumber(debtIncome) ? { householdMonthlyIncome: Number(debtIncome) } : {};
    // Typing fix (Stage A): the old figures stay while typing; the server is asked 0.4 s after the last key.
    const timer = setTimeout(() => restructureDebt(debtPrincipal, debtRateSenkda, debtMonthsActive, incomeOption).then((res) => {
      if (!isMounted()) return;
      setDebtUpdating(false);
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
        incomeShareBeforePct: res.liberationMetrics?.debt_service_to_income_before_pct ?? null,
        incomeShareAfterPct: res.liberationMetrics?.debt_service_to_income_after_pct ?? null,
        tag: res.tags?.source
      });
    }).catch((err) => {
      if (isMounted()) { setDebtRefinanceData({ error: err.message }); setDebtUpdating(false); }
    }), TYPING_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [debtPrincipal, debtRateSenkda, debtMonthsActive, debtIncome, debtEntered, noteOffline]);

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
      // The real save date; "Just now" stayed on every card for ever.
      time: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
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
      const res = await sendChat(msgs, chatLanguage);
      if (res.offline) {
        setServerOffline(true);
        setChatMessages(chatMessages); // not answered: keep it out of the conversation, give it back in the box
        setCommandInput(text);
        setChatNotice({ key: 'serverOffline' });
        return;
      }
      setServerOffline(false);
      if (res.status !== 'ok') {
        setChatNotice({ key: res.status === 'ai_key_rejected' ? 'keyRejected' : 'aiOff' });
      }
      if (res.reply) setChatMessages([...msgs, { role: 'assistant', content: res.reply }]);
      else { setChatMessages(chatMessages); setCommandInput(text); }
      const route = chatRoute(res.tool_results);
      if (route.code) {
        costOrigin.current = null;  // a business named by the chat starts untouched, unless the chat also gives a cost
        setCostChosen(false);
        setBusinessPicked(true);    // the chat found it from the user's own words
        setSelectedDomainCode(route.code);
      }
      if (route.loanInputs) {
        if (route.loanInputs.projectCost !== undefined) {
          costOrigin.current = 'chat';
          setCostChosen(true);
          setProjectCost(String(route.loanInputs.projectCost));
        }
        if (route.loanInputs.familyIncome !== undefined) setFamilyIncome(String(route.loanInputs.familyIncome));
        if (typeof route.loanInputs.isSc === 'boolean') setIsSc(route.loanInputs.isSc);
      }
      if (route.answers) setAdviceAnswers({ code: route.code, answers: route.answers });
      if (route.tab) setActiveTab(route.tab);
    } catch (err) {
      setChatMessages(chatMessages);
      setCommandInput(text);
      setChatNotice({ key: 'error', detail: err.message });
    } finally {
      setChatBusy(false);
    }
  };

  // A question typed into the front page's chat bar is sent once, as soon as the dashboard opens.
  const initialSent = useRef(false);
  useEffect(() => {
    if (initialSent.current || !initialQuestion || !initialQuestion.trim()) return;
    initialSent.current = true;
    if (onInitialQuestionUsed) onInitialQuestionUsed();
    setChatOpen(true);  // the user asked on the front page: show the panel with the question in it
    handleChatSend(initialQuestion);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuestion]);

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
      {/* Column 1: Left Navigation Rail */}
      <NavRail
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedDomainCode={selectedDomainCode}
        onSelectDomain={selectBusiness}
        presets={allDossiers}
        isAdvisoryOpen={isAdvisoryOpen}
        onToggleAdvisory={() => setIsAdvisoryOpen(!isAdvisoryOpen)}
        currentUser={currentUser}
        language={language}
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
        dossierDetail={dossierDetail}
        dossierCashflow={dossierCashflow}
        cashflowUpdating={cashflowUpdating}
        flowSteps={steps}
        debtPrincipal={debtPrincipal}
        onPrincipalChange={enterDebt(setDebtPrincipal)}
        debtRateSenkda={debtRateSenkda}
        onRateChange={enterDebt(setDebtRateSenkda)}
        debtMonthsActive={debtMonthsActive}
        onMonthsActiveChange={enterDebt(setDebtMonthsActive)}
        debtIncome={debtIncome}
        onDebtIncomeChange={setDebtIncome}
        debtEntered={debtEntered}
        debtRefinanceData={debtRefinanceData}
        debtUpdating={debtUpdating}
        onShowToast={showToast}
        onDownloadPdf={handleDownloadDprPdf}
        formatINR={formatINR}
        mandiPriceData={mandiPriceData}
        mandiKeyConfigured={mandiKeyConfigured}
        mode="production"
      />

      {/* Column 3: Right Sidebar */}
      <ScenariosSidebar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filteredScenarios={filteredScenarios}
        onSelectScenario={(scenario) => {
          if (scenario.domainCode) selectBusiness(scenario.domainCode);
          if (scenario.tab) setActiveTab(scenario.tab);
        }}
        onRefresh={handleRefreshScenarios}
        onCreateSimulation={handleCreateNewSimulation}
        mode="production"
      />

      {/* Chat (Stage A): a button at the bottom right that opens the chat panel */}
      <ChatLauncher
        open={chatOpen}
        onOpen={() => setChatOpen(true)}
        onClose={() => setChatOpen(false)}
        language={chatLanguage}
        onLanguageChange={setChatLanguage}
        messages={chatMessages}
        busy={chatBusy}
        notice={chatNotice ? `${noticeText(chatNotice.key, chatLanguage)}${chatNotice.detail ? ` (${chatNotice.detail})` : ''}` : null}
        input={commandInput}
        onInputChange={setCommandInput}
        onSend={(text) => handleChatSend(text ?? null)}
      />
    </DashboardShell>
  );
}
