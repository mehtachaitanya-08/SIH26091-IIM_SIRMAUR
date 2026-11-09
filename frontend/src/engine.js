/**
 * Deterministic Financial Engine (Client-Side JS Core)
 * Strictly conforms to:
 * - RBI Expert Committee on MSMEs (2019)
 * - PMEGP, PMFME, PM Vishwakarma, NLM, KCC, and PMMY MUDRA guidelines
 */

export const ARCHETYPES = [
  {
    id: "archetype_1",
    name: "Agro-Processing & Food Value Addition",
    name_hi: "कृषि प्रसंस्करण एवं खाद्य मूल्य संवर्धन",
    sector: "Manufacturing",
    icon: "Wheat",
    description: "Mini flour/dal mills, 6-bolt mustard/edible oil expellers, spice pulverizers.",
    description_hi: "मिनी दाल/आटा मिल, सरसों तेल स्पेलर, मसाला चक्की।",
    default_capex: 650000,
    default_opex_monthly: 185000,
    default_turnover_monthly: 245000,
    schemes: ["PMFME", "PMEGP_MFG", "AIF"],
    seasonality_weights: [1.4, 1.3, 1.2, 0.8, 0.6, 0.5, 0.5, 0.7, 0.9, 1.3, 1.4, 1.4]
  },
  {
    id: "archetype_2",
    name: "Rural Retail, Kirana & Agri-Input Supply",
    name_hi: "ग्रामीण किराना, खुदरा एवं कृषि-इनपुट व्यापार",
    sector: "Trade",
    icon: "ShoppingBag",
    description: "Modern village grocery, certified seed, bio-fertilizer & cattle feed dealership.",
    description_hi: "गांव की आधुनिक किराना दुकान, खाद, प्रमाणित बीज एवं पशु आहार केंद्र।",
    default_capex: 175000,
    default_opex_monthly: 13430,
    default_turnover_monthly: 273000,
    schemes: ["MUDRA_KISHOR", "MUDRA_TARUN", "PM_SVANIDHI"],
    seasonality_weights: [1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 0.9, 0.8, 0.9, 1.3, 1.4, 1.1]
  },
  {
    id: "archetype_3",
    name: "Rural Technical Services & Machinery Repair",
    name_hi: "ग्रामीण तकनीकी सेवा एवं ट्रैक्टर/मशीनरी रिपेयर",
    sector: "Services",
    icon: "Wrench",
    description: "Tractor/harvester garages, submersible pump rewinding, rural EV workshop.",
    description_hi: "ट्रैक्टर/हार्वेस्टर मरम्मत गैराज, सबमर्सिबल मोटर वाइंडिंग, ई-रिक्शा सर्विस।",
    default_capex: 362000,
    default_opex_monthly: 32800,
    default_turnover_monthly: 94950,
    schemes: ["PMEGP_SERV", "MUDRA_KISHOR"],
    seasonality_weights: [0.8, 0.9, 1.6, 1.7, 1.1, 1.5, 0.6, 0.5, 0.7, 1.2, 1.4, 1.0]
  },
  {
    id: "archetype_4",
    name: "Livestock, Dairy & Allied Micro-Farming",
    name_hi: "पशुपालन, डेयरी एवं सम्बद्ध सूक्ष्म खेती",
    sector: "Allied Agriculture",
    icon: "Milk",
    description: "Semi-intensive goat rearing (20+1), 1000-broiler poultry, mini 5-cattle dairy.",
    description_hi: "व्यावसायिक बकरी पालन (20+1), 1000 ब्रायलर पोल्ट्री, 5 दुधारू पशु डेयरी।",
    default_capex: 258000,
    default_opex_monthly: 4875,
    default_turnover_monthly: 21330,
    schemes: ["NLM", "KCC_LIVESTOCK", "AHIDF"],
    seasonality_weights: [1.0, 1.0, 1.0, 0.9, 0.8, 0.8, 0.9, 1.0, 1.1, 1.3, 1.2, 1.0]
  },
  {
    id: "archetype_5",
    name: "Traditional Artisans & Crafts (PM Vishwakarma)",
    name_hi: "पारंपरिक शिल्पी एवं कारीगर (पीएम विश्वकर्मा)",
    sector: "Artisanal / Vishwakarma",
    icon: "Hammer",
    description: "18 Statutory trades: Carpenters (Suthar), Blacksmiths (Lohar), Tailors (Darzi), Masons.",
    description_hi: "18 पारंपरिक ट्रेड: सुथार/बढ़ई, लोहार, दर्जी, राजमिस्त्री, कुम्हार।",
    default_capex: 100000,
    default_opex_monthly: 6300,
    default_turnover_monthly: 72000,
    schemes: ["PM_VISHWAKARMA_T1", "PM_VISHWAKARMA_T2"],
    seasonality_weights: [0.9, 0.9, 1.0, 1.1, 1.2, 0.8, 0.7, 0.9, 1.2, 1.4, 1.5, 1.0]
  },
  {
    id: "archetype_6",
    name: "Circular Bio-Waste & Rural Green Micro-Units",
    name_hi: "चक्रीय जैव-अपशिष्ट एवं हरित ग्रामीण इकाइयाँ",
    sector: "Green Manufacturing",
    icon: "Recycle",
    description: "HDPE vermicompost beds, stubble/biomass briquetting (bio-coal), solar RO kiosks.",
    description_hi: "केंचुआ खाद (वर्मीकम्पोस्ट), पराली बायोमास ब्रिकेट (बायो-कोल), सौर वाटर एटीएम।",
    default_capex: 121500,
    default_opex_monthly: 8333,
    default_turnover_monthly: 24400,
    schemes: ["PMEGP_MFG", "AIF", "GOBAR_DHAN"],
    seasonality_weights: [1.0, 1.1, 1.3, 1.2, 1.0, 1.0, 1.1, 0.9, 0.9, 1.1, 1.2, 1.1]
  }
];

export const STATES = [
  "Uttar Pradesh", "West Bengal", "Tamil Nadu", "Maharashtra", "Karnataka",
  "Bihar", "Andhra Pradesh", "Gujarat", "Rajasthan", "Madhya Pradesh",
  "Punjab", "Haryana", "Odisha", "Kerala", "Assam"
];

export function calculateEMI(principal, annualRatePct, tenureMonths) {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRatePct <= 0) return Math.round(principal / tenureMonths);
  const r = (annualRatePct / 100) / 12;
  const emi = principal * (r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  return Math.round(emi);
}

export function evaluateIncubation({
  archetypeId,
  state,
  capex,
  promoterCategory,
  locationType,
  customTenure
}) {
  const arch = ARCHETYPES.find(a => a.id === archetypeId) || ARCHETYPES[0];
  const finalCapex = capex || arch.default_capex;
  const monthlyOpex = arch.default_opex_monthly;
  const monthlyRevenue = arch.default_turnover_monthly;

  const workingCapital = Math.round(monthlyOpex * 1.5);
  const preOperative = Math.round(finalCapex * 0.05);
  const totalProjectCost = Math.round(finalCapex + workingCapital + preOperative);

  const isRural = (locationType === "rural");
  const isSpecial = ["special", "sc", "st", "obc", "women"].includes(promoterCategory);

  let schemeName = "PMMY MUDRA (Kishor)";
  let subsidyAmount = 0;
  let subsidyPct = 0;
  let promoterEquity = 0;
  let loanAmount = 0;
  let interestRate = 9.5;
  let tenureMonths = customTenure || 60;
  let statutoryNotes = "";

  if (arch.id === "archetype_5") {
    schemeName = "PM Vishwakarma (Tranche 1)";
    subsidyAmount = 15000; // Toolkit grant
    subsidyPct = 0;
    promoterEquity = 0;
    loanAmount = Math.min(totalProjectCost, 100000);
    interestRate = 5.0;
    tenureMonths = 18;
    statutoryNotes = "Includes ₹15,000 digital e-RUPI toolkit voucher + 100% CGTMSE collateral-free guarantee @ 5% fixed interest.";
  } else if (arch.id === "archetype_4") {
    if (totalProjectCost <= 200000) {
      schemeName = "KCC Animal Husbandry & Livestock";
      promoterEquity = Math.round(totalProjectCost * 0.10);
      loanAmount = Math.round(totalProjectCost * 0.90);
      interestRate = 4.0;
      tenureMonths = 36;
      statutoryNotes = "7% base interest with 3% prompt repayment incentive -> 4% net effective borrowing cost.";
    } else {
      schemeName = "National Livestock Mission (NLM)";
      subsidyPct = 50.0;
      subsidyAmount = Math.min(Math.round(totalProjectCost * 0.50), 2500000);
      promoterEquity = Math.round(totalProjectCost * 0.10);
      loanAmount = Math.round(totalProjectCost - subsidyAmount - promoterEquity);
      interestRate = 9.5;
      statutoryNotes = "50% direct capital subsidy credited into Bank Subsidy Reserve Fund account.";
    }
  } else if (["archetype_1", "archetype_3", "archetype_6"].includes(arch.id)) {
    schemeName = "Prime Minister's Employment Generation Programme (PMEGP)";
    const subRate = (isRural && isSpecial) ? 0.35 : (isRural ? 0.25 : 0.15);
    const ownRate = isSpecial ? 0.05 : 0.10;
    subsidyPct = subRate * 100;
    subsidyAmount = Math.round(totalProjectCost * subRate);
    promoterEquity = Math.round(totalProjectCost * ownRate);
    loanAmount = Math.round(totalProjectCost - subsidyAmount - promoterEquity);
    statutoryNotes = `PMEGP ${subsidyPct}% Margin Money Capital Subsidy for ${locationType} ${promoterCategory} entrepreneur.`;
  } else {
    // Retail & Trade
    schemeName = totalProjectCost <= 50000 ? "PM SVANidhi / MUDRA Shishu" : "PMMY MUDRA (Kishor / Tarun)";
    promoterEquity = Math.round(totalProjectCost * 0.15);
    loanAmount = Math.round(totalProjectCost * 0.85);
    statutoryNotes = "100% collateral-free credit backed by Credit Guarantee Fund for Micro Units (CGFMU).";
  }

  const monthlyEMI = calculateEMI(loanAmount, interestRate, tenureMonths);

  // 12-Month Seasonality & DSCR
  let annualNOCF = 0;
  const monthlyBreakdown = arch.seasonality_weights.map((w, idx) => {
    const rev = Math.round(monthlyRevenue * w);
    const cost = Math.round(monthlyOpex * (0.7 + (0.3 * w)));
    const nocf = rev - cost;
    annualNOCF += nocf;
    const dscr = monthlyEMI > 0 ? parseFloat((nocf / monthlyEMI).toFixed(2)) : 99.9;
    return {
      month: idx + 1,
      factor: w,
      revenue: rev,
      cost,
      nocf,
      dscr
    };
  });

  const avgAnnualDSCR = monthlyEMI > 0 ? parseFloat(((annualNOCF / 12) / monthlyEMI).toFixed(2)) : 99.9;
  const minLeanDSCR = Math.min(...monthlyBreakdown.map(m => m.dscr));

  return {
    archetype: arch,
    state,
    totalProjectCost,
    capex: finalCapex,
    workingCapital,
    preOperative,
    promoterEquity,
    subsidyAmount,
    subsidyPct,
    loanAmount,
    interestRate,
    tenureMonths,
    monthlyEMI,
    schemeName,
    statutoryNotes,
    avgAnnualDSCR,
    minLeanDSCR,
    annualNOCF,
    monthlyBreakdown,
    viabilityStatus: avgAnnualDSCR >= 1.5 ? "HIGH_FEASIBILITY" : (avgAnnualDSCR >= 1.2 ? "MODERATE_FEASIBILITY" : "STRESSED")
  };
}

export function parseVernacularQuote(quoteStr) {
  if (!quoteStr) return 36.0;
  const clean = quoteStr.toString().toLowerCase().trim();
  if (clean.includes("senkda") || clean.includes("saikda") || clean.includes("per 100") || clean.includes("/100")) {
    const match = clean.match(/[\d.]+/);
    if (match) return Math.round(parseFloat(match[0]) * 12 * 10) / 10;
  }
  const match = clean.match(/[\d.]+/);
  if (match) {
    const num = parseFloat(match[0]);
    if (num <= 10.0) return Math.round(num * 12 * 10) / 10;
    return num;
  }
  return 36.0;
}

export function evaluateRestructuring({
  debts,
  householdIncome = 35000,
  pathway = "MUDRA_KISHOR",
  tenureMonths = 36
}) {
  let totalPrincipal = 0;
  let totalMonthlyInterestBleed = 0;
  let weightedAprAcc = 0;

  const auditedDebts = debts.map(d => {
    const p = parseFloat(d.principal) || 0;
    const apr = parseVernacularQuote(d.rateQuote);
    const months = parseInt(d.monthsActive) || 12;
    const monthlyInt = Math.round(p * ((apr / 100) / 12));
    const paidToDate = monthlyInt * months;
    const damdupat = paidToDate >= p;

    totalPrincipal += p;
    totalMonthlyInterestBleed += monthlyInt;
    weightedAprAcc += (p * apr);

    return {
      ...d,
      principal: p,
      annualApr: apr,
      monthlyInterest: monthlyInt,
      paidToDate,
      damdupat
    };
  });

  const weightedApr = totalPrincipal > 0 ? parseFloat((weightedAprAcc / totalPrincipal).toFixed(1)) : 0;

  const pathways = {
    MUDRA_KISHOR: { name: "PMMY MUDRA (Kishor/Tarun)", rate: 9.5 },
    KCC: { name: "KCC Animal Husbandry / Crop (Net 4%)", rate: 4.0 },
    DAY_NRLM_SHG: { name: "DAY-NRLM / SHG Bank Linkage", rate: 7.0 },
    PM_VISHWAKARMA: { name: "PM Vishwakarma Concessional (5%)", rate: 5.0 }
  };

  const selectedPathway = pathways[pathway] || pathways.MUDRA_KISHOR;
  const formalRate = selectedPathway.rate;
  const newEMI = calculateEMI(totalPrincipal, formalRate, tenureMonths);

  const totalFormalOutflow = Math.round(newEMI * tenureMonths);
  const totalFormalInterest = Math.round(totalFormalOutflow - totalPrincipal);

  const informalInterestOverTenure = Math.round(totalMonthlyInterestBleed * tenureMonths);
  const monthlyCashRelief = Math.round(totalMonthlyInterestBleed - newEMI);
  const totalInterestSaved = Math.round(informalInterestOverTenure - totalFormalInterest);
  const cflrPct = householdIncome > 0 ? parseFloat(((monthlyCashRelief / householdIncome) * 100).toFixed(1)) : 0;

  return {
    totalPrincipal,
    weightedApr,
    totalMonthlyInterestBleed,
    auditedDebts,
    selectedPathway,
    formalRate,
    tenureMonths,
    newEMI,
    totalFormalOutflow,
    totalFormalInterest,
    monthlyCashRelief,
    totalInterestSaved,
    cflrPct,
    damdupatViolationsCount: auditedDebts.filter(d => d.damdupat).length
  };
}

