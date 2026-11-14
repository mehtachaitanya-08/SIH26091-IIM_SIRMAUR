import React from 'react';
import SeasonalitySimulatorView from './SeasonalitySimulatorView';
import NsfdcAmortizerView from './NsfdcAmortizerView';
import DebtLiberationView from './DebtLiberationView';
import LeadBankDprView from './LeadBankDprView';
import FeasibilityView from './FeasibilityView';
import HowItWorksView from './HowItWorksView';
import EnginesPanel from './EnginesPanel';
import MandiPanel from './MandiPanel';

/**
 * CenterWorkspace — Central Operational Console
 * Executive greeting, quick action cards,
 * dynamic viewports (Simulator, Amortizer, Debt, DPR), and command bar.
 */
export default function CenterWorkspace({
  activeTab = 'home',
  onSelectTab,
  activeDomain,
  currentUser = null,
  language = 'en',
  loanStructure,
  amortizationSchedule,
  loanInputs = null,
  feasibility = null,
  dossierDetail = null,
  dossierCashflow = null,
  cashflowUpdating = false,
  flowSteps = null,
  debtPrincipal = 120000,
  onPrincipalChange,
  debtRateSenkda = 3.0,
  onRateChange,
  debtMonthsActive = 36,
  onMonthsActiveChange,
  debtIncome = '',
  onDebtIncomeChange,
  debtRefinanceData,
  debtUpdating = false,
  debtEntered = true,
  onShowToast,
  onDownloadPdf,
  applicant = null,
  onApplicantChange,
  onApplicantClear,
  dprProblems = null,
  formatINR,
  mandiPriceData = null,
  mandiKeyConfigured = null,
  mode = 'mockup'
}) {
  const userGreeting = currentUser?.name 
    ? `Welcome, ${currentUser.name.split(' ')[0]}!` 
    : (language === 'hi' ? 'स्वागत है!' : 'Welcome!');

  // Only the user's own district, if they gave one. It used to fall back to "Sitapur District ·
  // STATUTORY-VERIFIED" for everyone (teammate review, 11 Nov 2026).
  const districtBadge = currentUser?.district || null;


  return (
    <main className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-start space-y-6 bg-white">
      {/* No overflow on this column: the page scrolls, so the chat bar can stay pinned to the
          bottom of the screen (an overflow here stopped the pinning; review, 11 Nov 2026).
          Blocks stack at the top (justify-start): "space-between" spread them out and left two empty
          gaps of 194 px on Home (owner's Windows check, 14 Nov 2026). */}
      
      {/* Top Clean Executive Header */}
      <div className="border-b border-[#E9ECEF] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111311] tracking-tight font-sans-ui">
              Enterprise Advisory Console
            </h2>
            <p className="text-xs text-[#686D65] mt-0.5 font-sans-ui">
              <span className="font-semibold text-[#111311]">{userGreeting}</span> · MoSJE / NSFDC Concessional Credit Facility
            </p>
          </div>
          {districtBadge && (
            <div className="flex items-center space-x-2 text-xs">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-[#495057] font-mono-num text-[11px] font-medium border border-slate-200">
                {`${districtBadge} (self-declared)`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Cards (Visible when activeTab === 'home') */}
      {activeTab === 'home' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
          <div
            onClick={() => onSelectTab && onSelectTab('simulator')}
            className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] hover:border-[#111311]/30 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <h4 className="font-bold text-xs text-[#111311] font-sans-ui">Good and bad months</h4>
            <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
              Which months earn more or less in your business, and money left each year.
            </p>
          </div>

          <div
            onClick={() => onSelectTab && onSelectTab('amortizer')}
            className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] hover:border-[#111311]/30 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <h4 className="font-bold text-xs text-[#111311] font-sans-ui">Your loan and repayments</h4>
            <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
              Your NSFDC loan and a payment every 3 months, for your project cost.
            </p>
          </div>

          <div
            onClick={() => onSelectTab && onSelectTab('restructure')}
            className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] hover:border-[#111311]/30 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <h4 className="font-bold text-xs text-[#111311] font-sans-ui">Pay off a moneylender loan</h4>
            <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
              Swap a costly moneylender loan for a cheaper bank loan.
            </p>
          </div>
        </div>
      )}

      {/* Step-by-step flow (production): business -> size -> details -> results -> DPR */}
      {activeTab === 'home' && mode === 'production' && Array.isArray(flowSteps) && (
        <ol className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] font-sans-ui" aria-label="Steps">
          {flowSteps.map((st) => (
            <li key={st.n}>
              <button
                type="button"
                onClick={() => onSelectTab && onSelectTab(st.tab)}
                className={`w-full h-full text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                  st.done ? 'bg-emerald-50 border-emerald-200 text-[#0E7A53]' : 'bg-white border-[#E9ECEF] text-[#111311] hover:border-[#111311]/30'
                }`}
              >
                <span className="font-mono-num font-bold">{st.done ? '✓' : st.n}</span>{' '}
                <span className="font-semibold">{st.label}</span>
              </button>
            </li>
          ))}
        </ol>
      )}

      {/* The old Home panels, back on the owner's decision (14 Nov 2026), with honest wording only:
          the government market-price panel (a price only when data.gov.in gave one) and the three
          calculators with NSFDC's verified rates. */}
      {activeTab === 'home' && mode === 'production' && (
        <MandiPanel mandiPriceData={mandiPriceData} mandiKeyConfigured={mandiKeyConfigured} />
      )}
      {activeTab === 'home' && mode === 'production' && <EnginesPanel />}

      {/* Viewport 1: Simulator */}
      {activeTab === 'simulator' && (
        <SeasonalitySimulatorView
          activeDomain={activeDomain}
          onClose={() => onSelectTab && onSelectTab('home')}
          onNavigateAmortizer={() => onSelectTab && onSelectTab('amortizer')}
          onNavigateFeasibility={() => onSelectTab && onSelectTab('feasibility')}
          dossierDetail={dossierDetail}
          dossierCashflow={dossierCashflow}
          cashflowUpdating={cashflowUpdating}
          costEntered={Number(loanInputs?.projectCost) > 0}
          formatINR={formatINR}
          mode={mode}
        />
      )}

      {/* Viewport 2: Amortizer */}
      {activeTab === 'amortizer' && (
        <NsfdcAmortizerView
          loanStructure={loanStructure}
          amortizationSchedule={amortizationSchedule}
          loanInputs={loanInputs}
          onClose={() => onSelectTab && onSelectTab('home')}
          onNavigateDpr={() => onSelectTab && onSelectTab('dpr')}
          formatINR={formatINR}
          mode={mode}
        />
      )}

      {/* Viewport 3: Debt Liberation */}
      {activeTab === 'restructure' && (
        <DebtLiberationView
          debtPrincipal={debtPrincipal}
          onPrincipalChange={onPrincipalChange}
          debtRateSenkda={debtRateSenkda}
          onRateChange={onRateChange}
          debtMonthsActive={debtMonthsActive}
          onMonthsActiveChange={onMonthsActiveChange}
          debtIncome={debtIncome}
          onDebtIncomeChange={onDebtIncomeChange}
          debtRefinanceData={debtRefinanceData}
          debtUpdating={debtUpdating}
          debtEntered={debtEntered}
          onClose={() => onSelectTab && onSelectTab('home')}
          formatINR={formatINR}
          mode={mode}
        />
      )}

      {/* Viewport 4: DPR */}
      {activeTab === 'dpr' && (
        <LeadBankDprView
          activeDomain={activeDomain}
          loanStructure={loanStructure}
          loanInputs={loanInputs}
          currentUser={currentUser}
          language={language}
          onClose={() => onSelectTab && onSelectTab('home')}
          onDownloadPdf={onDownloadPdf}
          formatINR={formatINR}
          mode={mode}
          applicant={applicant}
          onApplicantChange={onApplicantChange}
          onApplicantClear={onApplicantClear}
          dprProblems={dprProblems}
        />
      )}

      {/* Viewport 5: Feasibility report (server, verified data only) */}
      {activeTab === 'feasibility' && (
        <FeasibilityView
          activeDomain={activeDomain}
          feasibility={feasibility}
          onClose={() => onSelectTab && onSelectTab('home')}
          mode={mode}
        />
      )}

      {/* Viewport 6: How it works (judge-facing panels, moved off Home) */}
      {activeTab === 'howitworks' && (
        <HowItWorksView
          mandiKeyConfigured={mandiKeyConfigured}
          onClose={() => onSelectTab && onSelectTab('home')}
        />
      )}

      {/* The chat is now a panel opened from the bottom-right button (ChatLauncher, Stage A).
          CommandBar.jsx is kept in the repo but no longer shown. */}

    </main>
  );
}
