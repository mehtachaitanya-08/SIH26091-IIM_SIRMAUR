import React from 'react';
import StarBlossom from './StarBlossom';
import SeasonalitySimulatorView from './SeasonalitySimulatorView';
import NsfdcAmortizerView from './NsfdcAmortizerView';
import DebtLiberationView from './DebtLiberationView';
import LeadBankDprView from './LeadBankDprView';
import FeasibilityView from './FeasibilityView';
import CommandBar from './CommandBar';

/**
 * CenterWorkspace — Central Operational Console
 * Integrates StarBlossom emblem, executive greeting, quick action cards,
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
  debtPrincipal = 120000,
  onPrincipalChange,
  debtRateSenkda = 3.0,
  onRateChange,
  debtMonthsActive = 36,
  onMonthsActiveChange,
  debtRefinanceData,
  debtEntered = true,
  commandInput = '',
  onCommandInputChange,
  onCommandSubmit,
  chatMessages = null,
  chatBusy = false,
  chatNotice = null,
  onShowToast,
  onDownloadPdf,
  formatINR,
  mode = 'mockup'
}) {
  const userGreeting = currentUser?.name 
    ? `Welcome, ${currentUser.name.split(' ')[0]}!` 
    : (language === 'hi' ? 'स्वागत है!' : 'Welcome!');

  const districtBadge = `${currentUser?.district || 'Sitapur District'} · ${currentUser?.id || 'STATUTORY-VERIFIED'}`;

  return (
    <main className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white overflow-y-auto">
      
      {/* Top Clean Executive Header with StarBlossom Emblem */}
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
              {districtBadge}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards (Visible when activeTab === 'home') */}
      {activeTab === 'home' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
          <div
            onClick={() => onSelectTab && onSelectTab('simulator')}
            className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] hover:border-[#111311]/30 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <h4 className="font-bold text-xs text-[#111311] font-sans-ui">Simulate enterprise</h4>
            <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
              Your business's season, market and gaps from verified sources.
            </p>
          </div>

          <div
            onClick={() => onSelectTab && onSelectTab('amortizer')}
            className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] hover:border-[#111311]/30 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <h4 className="font-bold text-xs text-[#111311] font-sans-ui">NSFDC amortizer</h4>
            <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
              NSFDC loan and quarterly repayment schedule for your project cost.
            </p>
          </div>

          <div
            onClick={() => onSelectTab && onSelectTab('restructure')}
            className="bg-[#F8F9FA] rounded-xl p-4 border border-[#E9ECEF] hover:border-[#111311]/30 transition-all cursor-pointer shadow-sm hover:shadow"
          >
            <h4 className="font-bold text-xs text-[#111311] font-sans-ui">Debt liberation</h4>
            <p className="text-[11px] text-[#686D65] mt-1.5 leading-relaxed font-sans-ui">
              Refinance 3-senkda moneylender debt into bank credit.
            </p>
          </div>
        </div>
      )}

      {/* Viewport 1: Simulator */}
      {activeTab === 'simulator' && (
        <SeasonalitySimulatorView
          activeDomain={activeDomain}
          onClose={() => onSelectTab && onSelectTab('home')}
          onNavigateAmortizer={() => onSelectTab && onSelectTab('amortizer')}
          onNavigateFeasibility={() => onSelectTab && onSelectTab('feasibility')}
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
          debtRefinanceData={debtRefinanceData}
          debtEntered={debtEntered}
          onClose={() => onSelectTab && onSelectTab('home')}
          onGenerateLegalPackage={() => onShowToast && onShowToast('Generated Usurious Loans Act Legal Defense Package')}
          formatINR={formatINR}
          mode={mode}
        />
      )}

      {/* Viewport 4: 1-Page DPR */}
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

      {/* Bottom Operational Command Bar */}
      <CommandBar
        commandInput={commandInput}
        onInputChange={onCommandInputChange}
        onSubmit={onCommandSubmit}
        chatMessages={chatMessages}
        chatBusy={chatBusy}
        chatNotice={chatNotice}
        onSelectChip={(tab) => onSelectTab && onSelectTab(tab)}
        onShowToast={onShowToast}
        mode={mode}
      />

    </main>
  );
}
