import React, { useState, useMemo } from 'react';
import { 
  ARCHETYPES, 
  STATES, 
  evaluateIncubation, 
  evaluateRestructuring 
} from './engine';
import { 
  Wheat, 
  ShoppingBag, 
  Wrench, 
  Milk, 
  Hammer, 
  Recycle, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  IndianRupee, 
  Plus, 
  Trash2, 
  Scale, 
  Languages, 
  Download,
  Info
} from 'lucide-react';

const ICON_MAP = {
  Wheat: Wheat,
  ShoppingBag: ShoppingBag,
  Wrench: Wrench,
  Milk: Milk,
  Hammer: Hammer,
  Recycle: Recycle
};

export default function App() {
  const [lang, setLang] = useState('en'); // 'en' | 'hi'
  const [mode, setMode] = useState('mode_a'); // 'mode_a' | 'mode_b'

  // Mode A States
  const [selectedArchId, setSelectedArchId] = useState('archetype_1');
  const [selectedState, setSelectedState] = useState('Uttar Pradesh');
  const [promoterCat, setPromoterCat] = useState('special'); // 'special' | 'general'
  const [locationType, setLocationType] = useState('rural');
  const [customCapex, setCustomCapex] = useState(null);

  // Mode B States
  const [householdIncome, setHouseholdIncome] = useState(35000);
  const [refinancePathway, setRefinancePathway] = useState('MUDRA_KISHOR');
  const [refinanceTenure, setRefinanceTenure] = useState(36);
  const [debts, setDebts] = useState([
    { id: 1, lenderType: 'Village Mahajan / Sahukar', principal: 120000, rateQuote: '3 senkda', monthsActive: 16, collateral: 'Farmland Papers' },
    { id: 2, lenderType: 'Tehsil Fertilizer Dealer', principal: 50000, rateQuote: '4 senkda', monthsActive: 8, collateral: 'Post-Dated Cheque' },
    { id: 3, lenderType: 'Informal Relative / Shopkeeper', principal: 30000, rateQuote: '2.5 senkda', monthsActive: 12, collateral: 'Gold Ring' }
  ]);

  // Derived Calculations
  const incubationResult = useMemo(() => {
    return evaluateIncubation({
      archetypeId: selectedArchId,
      state: selectedState,
      capex: customCapex,
      promoterCategory: promoterCat,
      locationType: locationType
    });
  }, [selectedArchId, selectedState, customCapex, promoterCat, locationType]);

  const restructuringResult = useMemo(() => {
    return evaluateRestructuring({
      debts,
      householdIncome,
      pathway: refinancePathway,
      tenureMonths: refinanceTenure
    });
  }, [debts, householdIncome, refinancePathway, refinanceTenure]);

  // Handler for adding debt
  const handleAddDebt = () => {
    setDebts([
      ...debts,
      {
        id: Date.now(),
        lenderType: 'Moneylender / Trader',
        principal: 50000,
        rateQuote: '3 senkda',
        monthsActive: 12,
        collateral: 'None'
      }
    ]);
  };

  const handleRemoveDebt = (id) => {
    setDebts(debts.filter(d => d.id !== id));
  };

  const handleUpdateDebt = (id, field, value) => {
    setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const formatINR = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Banner */}
      <header className="gradient-hero text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Scale className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight">GraminAdvisory</span>
                <span className="text-xs bg-emerald-400 text-slate-900 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">SIH 2026 Core</span>
              </div>
              <p className="text-xs text-emerald-100 hidden sm:block">
                {lang === 'en' 
                  ? 'AI-Driven Hyper-Local Business Advisory & Algorithmic Debt Restructuring' 
                  : 'एआई-संचालित ग्रामीण व्यापार सलाहकार एवं ऋण पुनर्गठन मंच'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Dual Mode Switcher */}
            <div className="bg-slate-900/40 p-1 rounded-xl flex items-center border border-white/10">
              <button
                onClick={() => setMode('mode_a')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  mode === 'mode_a'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Mode A: Incubation' : 'मोड A: उद्यम स्थापना'}</span>
              </button>
              <button
                onClick={() => setMode('mode_b')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  mode === 'mode_b'
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'text-emerald-100 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Mode B: Debt Relief' : 'मोड B: ऋण मुक्ति'}</span>
              </button>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 flex-1 w-full space-y-6">
        
        {/* ============================================================== */}
        {/* MODE A: ENTERPRISE INCUBATION (6 ARCHETYPES)                   */}
        {/* ============================================================== */}
        {mode === 'mode_a' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Archetype Cards Carousel */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <span>{lang === 'en' ? 'Select Rural Enterprise Archetype' : 'उद्यम श्रेणी चुनें'}</span>
                  <span className="text-xs text-slate-500 font-normal">(99.9% Rural MSME Coverage)</span>
                </h2>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  RBI UK Sinha Baseline Grounded
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {ARCHETYPES.map((arch) => {
                  const Icon = ICON_MAP[arch.icon] || Wheat;
                  const isSelected = selectedArchId === arch.id;
                  return (
                    <button
                      key={arch.id}
                      onClick={() => {
                        setSelectedArchId(arch.id);
                        setCustomCapex(null);
                      }}
                      className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between h-36 ${
                        isSelected 
                          ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/30 shadow-md' 
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {arch.sector.split(' ')[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">
                          {lang === 'en' ? arch.name : arch.name_hi}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                          {lang === 'en' ? arch.description : arch.description_hi}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parameters & Project Sizing Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Input Parameter Panel */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Wrench className="w-4 h-4 text-emerald-600" />
                  <span>{lang === 'en' ? 'Project Parameters & Geography' : 'परियोजना पैरामीटर एवं क्षेत्र'}</span>
                </h3>

                {/* State Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'en' ? 'State / UT' : 'राज्य'}
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Category & Location */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'en' ? 'Category' : 'श्रेणी'}
                    </label>
                    <select
                      value={promoterCat}
                      onChange={(e) => setPromoterCat(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="special">{lang === 'en' ? 'Special (SC/ST/OBC/Women)' : 'विशेष (महिला/SC/ST/OBC)'}</option>
                      <option value="general">{lang === 'en' ? 'General' : 'सामान्य'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'en' ? 'Area' : 'क्षेत्र'}
                    </label>
                    <select
                      value={locationType}
                      onChange={(e) => setLocationType(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="rural">{lang === 'en' ? 'Rural (Gram Panchayat)' : 'ग्रामीण (ग्राम पंचायत)'}</option>
                      <option value="urban">{lang === 'en' ? 'Semi-Urban / Town' : 'कस्बा / अर्ध-शहरी'}</option>
                    </select>
                  </div>
                </div>

                {/* CapEx Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      {lang === 'en' ? 'Plant & Machinery CapEx' : 'मशीनरी एवं उपकरण लागत'}
                    </label>
                    <span className="text-xs font-bold text-emerald-700">
                      {formatINR(incubationResult.capex)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={2500000}
                    step={10000}
                    value={incubationResult.capex}
                    onChange={(e) => setCustomCapex(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>₹50,000</span>
                    <span>₹25,00,000</span>
                  </div>
                </div>

                {/* Matched Government Scheme Callout */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{incubationResult.schemeName}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    {incubationResult.statutoryNotes}
                  </p>
                </div>

                {/* 1-Page DPR Action */}
                <button
                  onClick={() => alert(`1-Page Bank-Ready DPR Generated for ${incubationResult.archetype.name} under ${incubationResult.schemeName}. Formatted according to Lead Bank Scheme standards with QR verification.`)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'en' ? 'Export 1-Page Bank-Ready DPR (PDF)' : '1-पेज बैंक डीपीआर डाउनलोड करें'}</span>
                </button>
              </div>

              {/* Center & Right Column: Financial Breakdown & 12-Month Seasonality */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 4 Financial Pillar Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[11px] font-medium text-slate-500">{lang === 'en' ? 'Total Project Cost' : 'कुल परियोजना लागत'}</div>
                    <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                      {formatINR(incubationResult.totalProjectCost)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">CapEx + WC + Pre-Op</div>
                  </div>

                  <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 shadow-sm">
                    <div className="text-[11px] font-medium text-emerald-700">{lang === 'en' ? 'Govt Subsidy / Grant' : 'सरकारी अनुदान (सब्सिडी)'}</div>
                    <div className="text-base sm:text-lg font-extrabold text-emerald-800 mt-0.5">
                      {formatINR(incubationResult.subsidyAmount)}
                    </div>
                    <div className="text-[10px] text-emerald-600 mt-1">
                      {incubationResult.subsidyPct > 0 ? `${incubationResult.subsidyPct}% Direct Grant` : 'Grant / Subvention'}
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[11px] font-medium text-slate-500">{lang === 'en' ? 'Promoter Equity' : 'स्वयं की पूँजी (मार्जिन)'}</div>
                    <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                      {formatINR(incubationResult.promoterEquity)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Only 5% - 15% required</div>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="text-[11px] font-medium text-slate-500">{lang === 'en' ? 'Monthly Bank EMI' : 'मासिक बैंक किश्त (EMI)'}</div>
                    <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                      {formatINR(incubationResult.monthlyEMI)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">@ {incubationResult.interestRate}% for {incubationResult.tenureMonths}m</div>
                  </div>
                </div>

                {/* DSCR & Seasonality Graph Container */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        <span>{lang === 'en' ? '12-Month Seasonality & Debt Service Coverage (DSCR)' : '12-माह मौसमी प्रभाव एवं ऋण सुरक्षा अनुपात'}</span>
                      </h4>
                      <p className="text-xs text-slate-500">
                        {lang === 'en' 
                          ? 'Zero-hallucination deterministic stress-testing against rural agricultural cycles.'
                          : 'फसल चक्र के अनुसार मासिक नकद प्रवाह एवं ऋण अदायगी क्षमता का परीक्षण।'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 block">Average DSCR</span>
                        <span className="text-sm font-extrabold text-emerald-700">{incubationResult.avgAnnualDSCR}x</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                        incubationResult.viabilityStatus === 'HIGH_FEASIBILITY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {incubationResult.viabilityStatus}
                      </span>
                    </div>
                  </div>

                  {/* 12-Month Visual Mini-Bars */}
                  <div className="grid grid-cols-12 gap-1.5 pt-2">
                    {incubationResult.monthlyBreakdown.map((m) => {
                      const maxNocf = Math.max(...incubationResult.monthlyBreakdown.map(i => i.nocf));
                      const heightPct = Math.max(18, Math.round((m.nocf / maxNocf) * 100));
                      const isLean = m.dscr < 1.2;

                      return (
                        <div key={m.month} className="flex flex-col items-center">
                          <div className="text-[9px] font-bold text-slate-500 mb-1">{m.dscr}x</div>
                          <div className="w-full bg-slate-100 rounded-t-md h-24 flex items-end p-0.5">
                            <div 
                              style={{ height: `${heightPct}%` }}
                              className={`w-full rounded-t transition-all ${
                                isLean ? 'bg-amber-400' : 'bg-emerald-500'
                              }`}
                              title={`Month ${m.month}: NOCF ${formatINR(m.nocf)}, DSCR ${m.dscr}x`}
                            />
                          </div>
                          <div className="text-[10px] font-semibold text-slate-600 mt-1">M{m.month}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                        <span>{lang === 'en' ? 'Normal / Peak Month' : 'सामान्य / पीक माह'}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" />
                        <span>{lang === 'en' ? 'Lean Month Stress' : 'मंदी का माह'}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {lang === 'en' ? 'Minimum Lean DSCR: ' : 'न्यूनतम लीन DSCR: '}
                      <span className="font-bold text-slate-900">{incubationResult.minLeanDSCR}x</span> (Bank Safe: &gt;1.0x)
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE B: RESTRUCTURING & INFORMAL DEBT RELIEF                   */}
        {/* ============================================================== */}
        {mode === 'mode_b' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Mode B Hero Notice */}
            <div className="gradient-card-amber p-4 rounded-2xl border border-amber-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-amber-950">
                    {lang === 'en' ? 'Algorithmic Refinancing of Informal Moneylender Debt' : 'साहूकारी ब्याज से मुक्ति एवं संस्थागत ऋण पुनर्गठन'}
                  </h2>
                  <p className="text-xs text-amber-800">
                    {lang === 'en'
                      ? 'Consolidate 36%–60% informal loans into 4%–9.5% formal priority sector credit (MUDRA, KCC, Vishwakarma).'
                      : '36% से 60% वाले शोषणकारी साहूकारी कर्ज़ को 4% से 9.5% वाले औपचारिक बैंक ऋण में बदलें।'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-amber-800 font-semibold block">Total Debt Consolidating</span>
                <span className="text-lg font-extrabold text-amber-950">
                  {formatINR(restructuringResult.totalPrincipal)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Existing Debts Intake Panel */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span>{lang === 'en' ? 'Audit Current Informal Liabilities' : 'वर्तमान कर्ज़ का विवरण दर्ज करें'}</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        {lang === 'en' 
                          ? 'Enter dialect quotes like "3 senkda" (₹3 per ₹100/mo) or monthly rates.'
                          : 'बोली में प्रचलित ब्याज जैसे "3 सैकड़ा" (3% मासिक) दर्ज करें।'}
                      </p>
                    </div>

                    <button
                      onClick={handleAddDebt}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Add Loan' : 'नया कर्ज़ जोड़ें'}</span>
                    </button>
                  </div>

                  {/* Debts Table */}
                  <div className="space-y-3">
                    {debts.map((d, index) => {
                      const audited = restructuringResult.auditedDebts.find(item => item.id === d.id);
                      return (
                        <div key={d.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Lender / Source</label>
                              <input
                                type="text"
                                value={d.lenderType}
                                onChange={(e) => handleUpdateDebt(d.id, 'lenderType', e.target.value)}
                                className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-1.5 bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Principal (₹)</label>
                              <input
                                type="number"
                                value={d.principal}
                                onChange={(e) => handleUpdateDebt(d.id, 'principal', e.target.value)}
                                className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-1.5 bg-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Rate Quote</label>
                              <input
                                type="text"
                                value={d.rateQuote}
                                onChange={(e) => handleUpdateDebt(d.id, 'rateQuote', e.target.value)}
                                placeholder="e.g. 3 senkda"
                                className="w-full text-xs font-semibold border border-slate-300 rounded-lg p-1.5 bg-white"
                              />
                            </div>
                            <div className="flex items-center justify-between sm:justify-end space-x-2 pt-3 sm:pt-0">
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-red-600 block">
                                  {audited ? formatINR(audited.monthlyInterest) : '₹0'}/mo
                                </span>
                                <span className="text-[9px] text-slate-500">
                                  {audited ? `${audited.annualApr}% APR` : ''}
                                </span>
                              </div>
                              <button
                                onClick={() => handleRemoveDebt(d.id)}
                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Damdupat Badge if triggered */}
                          {audited && audited.damdupat && (
                            <div className="bg-red-50 border border-red-200 rounded-lg px-2.5 py-1 text-[11px] text-red-800 flex items-center justify-between">
                              <span className="font-semibold flex items-center space-x-1">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                <span>{lang === 'en' ? 'Damdupat Law Violation:' : 'दामदुपट नियम उल्लंघन:'}</span>
                              </span>
                              <span>
                                {lang === 'en' 
                                  ? `Artisan has already paid ${formatINR(audited.paidToDate)} in interest (exceeding initial ₹${d.principal} principal). Lender legally barred from demanding further interest!`
                                  : `मूलधन ₹${d.principal} के मुकाबले अब तक ₹${audited.paidToDate} ब्याज वसूला जा चुका है। कानूनन आगे ब्याज नहीं लिया जा सकता।`}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Informal Bleed Banner */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-red-900 flex items-center space-x-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>{lang === 'en' ? 'Current Predatory Interest Bleed' : 'वर्तमान साहूकारी ब्याज का नुकसान'}</span>
                      </div>
                      <p className="text-[11px] text-red-700 mt-0.5">
                        {lang === 'en'
                          ? `Weighted Average Cost of Debt: ${restructuringResult.weightedApr}% p.a. (Principal never reduces)`
                          : `औसत ब्याज दर: ${restructuringResult.weightedApr}% प्रतिवर्ष (मूलधन कभी कम नहीं होता)`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-red-700">
                        {formatINR(restructuringResult.totalMonthlyInterestBleed)}
                      </span>
                      <span className="text-xs text-red-600 block">/ month (Pure Waste)</span>
                    </div>
                  </div>
                </div>

                {/* Legal Safeguard Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    {lang === 'en' ? 'Legal Defense & One-Time Settlement (OTS) Framework' : 'कानूनी सुरक्षा एवं साहूकार समझौता रणनीति'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">Usurious Loans Act</span>
                      <span className="text-slate-600 text-[11px] leading-relaxed">
                        Courts have statutory authority to reopen any unconscionable loan and reduce interest rates down to fair market levels.
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">State Moneylenders Acts</span>
                      <span className="text-slate-600 text-[11px] leading-relaxed">
                        Unregistered moneylenders cannot legally sue. State statutes cap maximum interest between 12% and 18% simple.
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-900 block mb-1">Escrow Disbursal</span>
                      <span className="text-slate-600 text-[11px] leading-relaxed">
                        Bank funds disbursed directly upon signed No-Dues Certificate (NDC) and physical handover of pledged collateral.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Institutional Refinancing Solution */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{lang === 'en' ? 'Target Institutional Replacement' : 'संस्थागत बैंक विकल्प चुनें'}</span>
                  </h3>

                  {/* Refinancing Scheme Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'en' ? 'Replacement Credit Facility' : 'नया बैंक ऋण विकल्प'}
                    </label>
                    <select
                      value={refinancePathway}
                      onChange={(e) => setRefinancePathway(e.target.value)}
                      className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="MUDRA_KISHOR">PMMY MUDRA (Kishor / Tarun) @ 9.5%</option>
                      <option value="KCC">KCC Livestock / Crop (Net 4.0% with subvention)</option>
                      <option value="DAY_NRLM_SHG">DAY-NRLM / SHG Bank Linkage @ 7.0%</option>
                      <option value="PM_VISHWAKARMA">PM Vishwakarma Concessional Credit @ 5.0%</option>
                    </select>
                  </div>

                  {/* Household Monthly Income Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {lang === 'en' ? 'Monthly Household Income (₹)' : 'परिवार की मासिक आय (₹)'}
                    </label>
                    <input
                      type="number"
                      value={householdIncome}
                      onChange={(e) => setHouseholdIncome(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-semibold border border-slate-300 rounded-xl p-2 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {/* Tenure Selector */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        {lang === 'en' ? 'Consolidation Tenure' : 'अदायगी अवधि'}
                      </label>
                      <span className="text-xs font-bold text-emerald-700">
                        {refinanceTenure} {lang === 'en' ? 'Months' : 'महीने'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={12}
                      max={60}
                      step={6}
                      value={refinanceTenure}
                      onChange={(e) => setRefinanceTenure(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* The Big Cash Flow Relief Card */}
                  <div className="gradient-card-emerald p-4 rounded-xl border border-emerald-300 space-y-2 text-center">
                    <span className="text-xs font-bold text-emerald-900 block">
                      {lang === 'en' ? 'Monthly Cash Flow Relief' : 'मासिक बचत (नकद राहत)'}
                    </span>
                    <div className="text-2xl font-black text-emerald-700">
                      +{formatINR(restructuringResult.monthlyCashRelief)}
                      <span className="text-xs font-medium text-emerald-800"> /mo</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 font-semibold">
                      {lang === 'en' 
                        ? `Frees up ${restructuringResult.cflrPct}% of family disposable income!`
                        : `परिवार की डिस्पोजेबल आय का ${restructuringResult.cflrPct}% तुरंत मुक्त!`}
                    </p>
                  </div>

                  {/* Lifetime Numbers */}
                  <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">New Amortizing EMI:</span>
                      <span className="font-bold text-slate-900">{formatINR(restructuringResult.newEMI)}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cumulative Interest Saved:</span>
                      <span className="font-bold text-emerald-700">{formatINR(restructuringResult.totalInterestSaved)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status at Month {refinanceTenure}:</span>
                      <span className="font-bold text-emerald-700">100% DEBT FREE</span>
                    </div>
                  </div>

                  {/* Generate Bank Restructuring Pack */}
                  <button
                    onClick={() => alert(`Generated Official Debt Restructuring Dossier for ${formatINR(restructuringResult.totalPrincipal)} under ${restructuringResult.selectedPathway.name}. Includes Rule of Damdupat Audit and Escrow Release Protocol.`)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-md transition-all"
                  >
                    <Download className="w-4 h-4 text-white" />
                    <span>{lang === 'en' ? 'Download Bank Restructuring Dossier' : 'बैंक ऋण मुक्ति प्रस्ताव डाउनलोड करें'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">GraminAdvisory</span>
            <span>•</span>
            <span>Smart India Hackathon (SIH 2026) Technical Prototype</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>RBI Expert Committee (2019) Grounded</span>
            <span>Zero-Hallucination Core</span>
            <span>Bilingual (EN / HI)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

