const fs = require('fs');
const path = require('path');

const setoPath = path.resolve(__dirname, '../../../frontend/src/components/SetoDashboard.jsx');
const original = fs.readFileSync(setoPath, 'utf8');

// 1. Clean imports
let updated = original.replace(
  /import \{\s*calculateNSFDCLoanStructure,\s*generateNSFDCAmortizationSchedule,\s*calculateEQI,\s*calculateEMI\s*\} from '\.\.\/engine';[\s\S]*?import \{[\s\S]*?\} from 'lucide-react';/,
  `import {
  calculateNSFDCLoanStructure,
  generateNSFDCAmortizationSchedule
} from '../engine';
import {
  AlertTriangle,
  X,
  Download
} from 'lucide-react';`
);

// 2. Add RECENT_SCENARIOS constant after PRESETS
const scenariosConst = `
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
`;

updated = updated.replace('};\n\nexport default function SetoDashboard() {', '};' + scenariosConst + '\nexport default function SetoDashboard() {');

// 3. Add debtMonthsActive state
updated = updated.replace(
  "const [debtRateSenkda, setDebtRateSenkda] = useState(3.0); // 3 senkda = 36% APR",
  `const [debtRateSenkda, setDebtRateSenkda] = useState(3.0); // 3 senkda = 36% APR
  const [debtMonthsActive, setDebtMonthsActive] = useState(36); // State for duration active (1-48 months, default 36)`
);

// 4. Update debtRefinanceData memo
updated = updated.replace(
  /\/\/ Debt Relief Calculations[\s\S]*?\}, \[debtPrincipal, debtRateSenkda\]\);/,
  `// Debt Relief Calculations
  const debtRefinanceData = useMemo(() => {
    const p = debtPrincipal;
    const apr = debtRateSenkda * 12; // 3 senkda = 36% APR
    const monthlyBleed = Math.round(p * (apr / 100 / 12));

    // Concessional 6.5% NSFDC Refinancing (Term Loan structure equivalent)
    // Scales dynamically with debtPrincipal (₹1,140 service for benchmark ₹1.20L)
    const prototypeEmi = Math.round(p * (1140 / 120000));
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
  }, [searchQuery]);`
);

// 5. Add debtMonthsActive slider into Mode B Debt Refinancing Viewport
const oldControls = `<select
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
                </div>`;

const newControls = `<select
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
                </div>`;

updated = updated.replace(oldControls, newControls);

// Also update Damdupat message to include monthsActive and principal
const oldDamdupat = `{debtRefinanceData.damdupatViolated && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-800 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>
                      <strong>Rule of Damdupat Triggered:</strong> Total interest paid ({formatINR(debtRefinanceData.paidToDate)}) exceeds principal. Moneylender barred from demanding further interest under Usurious Loans Act 1918!
                    </span>
                  </div>
                )}`;

const newDamdupat = `{debtRefinanceData.damdupatViolated && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-800 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>
                      <strong>Rule of Damdupat Triggered:</strong> Total interest paid ({formatINR(debtRefinanceData.paidToDate)} over {debtRefinanceData.monthsActive} months) exceeds principal ({formatINR(debtRefinanceData.principal)}). Moneylender barred from demanding further interest under Usurious Loans Act 1918!
                    </span>
                  </div>
                )}`;

updated = updated.replace(oldDamdupat, newDamdupat);

// 6. Replace static scenario list with dynamic filteredScenarios
const oldListRegex = /\{\/\* Recent Scenarios List \*\/\}[\s\S]*?\{\/\* Bottom Button: Create New Simulation \+ \*\/\}/;

const newList = `{/* Recent Scenarios List */}
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
                              <div className="flex -space-x-1">
                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#0E7A53] text-[9px] font-bold flex items-center justify-center">
                                  R
                                </span>
                                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-bold flex items-center justify-center">
                                  B
                                </span>
                              </div>
                            )}

                            {scenario.type === 'd18' && (
                              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[9px] font-bold flex items-center justify-center">
                                S
                              </span>
                            )}

                            {scenario.type === 'debt' && (
                              <span className="text-[10px] text-[#0E7A53] font-bold font-mono-num">
                                {scenario.reliefText}
                              </span>
                            )}

                            <span className="text-[10px] text-[#686D65] font-mono-num">{scenario.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Button: Create New Simulation + */}`;

updated = updated.replace(oldListRegex, newList);

const outPath = path.resolve(__dirname, 'proposed_SetoDashboard.jsx');
fs.writeFileSync(outPath, updated, 'utf8');
console.log('Successfully wrote proposed_SetoDashboard.jsx. Byte length:', updated.length);
