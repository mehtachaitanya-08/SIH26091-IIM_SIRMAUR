import React from 'react';
import SeasonalitySimulatorView from './SeasonalitySimulatorView';
import NsfdcAmortizerView from './NsfdcAmortizerView';
import DebtLiberationView from './DebtLiberationView';
import LeadBankDprView from './LeadBankDprView';
import FeasibilityView from './FeasibilityView';
import CommandBar from './CommandBar';

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
  flowSteps = null,
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
  mandiPriceData = null,
  mandiKeyConfigured = null,
  mode = 'mockup'
}) {
  const userGreeting = currentUser?.name 
    ? `Welcome, ${currentUser.name.split(' ')[0]}!` 
    : (language === 'hi' ? 'स्वागत है!' : 'Welcome!');

  const districtBadge = `${currentUser?.district || 'Sitapur District'} · ${currentUser?.id || 'STATUTORY-VERIFIED'}`;

  return (
    <main className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white overflow-y-auto">
      
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
          <div className="flex items-center space-x-2 text-xs">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-[#495057] font-mono-num text-[11px] font-medium border border-slate-200">
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

      {/* Live Agmarknet Mandi Intelligence & ML Models (Production Mode Only) */}
      {activeTab === 'home' && mode === 'production' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Live Government Agmarknet Data Bar */}
          <div className="p-4 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E9ECEF] pb-2.5">
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${mandiPriceData?.isLive ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
                <span className="text-xs font-semibold text-[#111311] font-mono-num uppercase tracking-wider">
                  Open Government Data (data.gov.in / Agmarknet API)
                </span>
              </div>
              <span className="text-[11px] font-mono-num font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 self-start sm:self-auto">
                {mandiPriceData?.isLive ? 'Live Mandi Feed' : 'No live data'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-[#E9ECEF]">
                <span className="text-[#686D65] block text-[11px] font-medium">Commodity & Market</span>
                <p className="font-bold text-[#111311] text-xs font-sans-ui mt-0.5">
                  {mandiPriceData?.status === 'no_crop' || !mandiPriceData?.commodity
                    ? 'No crop linked to this business'
                    : `${mandiPriceData.commodity}${mandiPriceData.market ? ` (${mandiPriceData.market})` : ''}`}
                </p>
                <span className="text-[10px] text-[#686D65] font-mono-num">
                  {mandiPriceData?.commodity && mandiPriceData?.status !== 'no_crop'
                    ? `State: ${mandiPriceData.state} · crop link ASSUMED (team's list)` : '—'}
                </span>
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#E9ECEF]">
                <span className="text-[#686D65] block text-[11px] font-medium">Modal Spot Price</span>
                {mandiPriceData?.isLive && typeof mandiPriceData.modalPrice === 'number' ? (
                  <>
                    <p className="font-bold text-[#0E7A53] text-base font-mono-num mt-0.5">
                      ₹{mandiPriceData.modalPrice.toLocaleString('en-IN')} <span className="text-[11px] font-normal text-[#686D65]">/ qtl</span>
                    </p>
                    <span className="text-[10px] text-[#0E7A53] font-semibold">{mandiPriceData.tag}</span>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-[#111311] text-base font-mono-num mt-0.5">NOT FOUND</p>
                    <span className="text-[10px] text-[#686D65]">{mandiPriceData?.reason || 'Loading…'}</span>
                  </>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg border border-[#E9ECEF]">
                <span className="text-[#686D65] block text-[11px] font-medium">API Integration Status</span>
                <p className="font-bold text-[#111311] text-xs font-mono-num mt-0.5 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${mandiKeyConfigured === true ? 'bg-emerald-600' : mandiKeyConfigured === false ? 'bg-red-500' : 'bg-slate-400'}`}></span>
                  <span>DATA_GOV_IN_API_KEY {mandiKeyConfigured === true ? 'set' : mandiKeyConfigured === false ? 'not set' : 'status unknown (server offline)'}</span>
                </p>
                <span className="text-[10px] text-[#686D65] truncate block">Resource: 9ef84268...Agmarknet</span>
              </div>
            </div>
          </div>

          {/* Active ML & Deterministic Financial Models Panel */}
          <div className="p-4 rounded-xl bg-white border border-[#E9ECEF] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#111311] font-sans-ui uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-slate-400 font-mono-num text-[11px]">[03 Engines Active]</span>
                <span>Financial & Solvency Models</span>
              </span>
              <span className="text-[11px] font-mono-num text-slate-500 font-medium">Deterministic Core</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-[#111311] block">1. NSFDC Dual-Tier Amortizer</span>
                <span className="text-[#686D65] mt-0.5 block">Micro & Term loan at 6.5%/8.0% [S1]</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-[#111311] block">2. 12-Mo Seasonality Stress</span>
                <span className="text-[#686D65] mt-0.5 block">Each business's leanest months, from its dossier</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-[#111311] block">3. Rule of Damdupat Audit</span>
                <span className="text-[#686D65] mt-0.5 block">Usurious Loans Act 1918 statutory legal shield</span>
              </div>
            </div>
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
          dossierDetail={dossierDetail}
          dossierCashflow={dossierCashflow}
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
