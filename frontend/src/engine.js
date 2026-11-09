/**
 * Deterministic Financial Engine (Client-Side JS Core v2.0)
 * Strictly conforms to:
 * - MoSJE / NSFDC Dual-Tier Credit Mandate (SIH26091)
 *   * Micro Credit Finance (MCF / MSY): <= ₹1.40L project cost, loan cap ₹1.25L @ 6.5%, 11 quarterly instalments
 *   * Term Loan Scheme: > ₹1.40L up to ₹50.00L, 90% loan cap @ 8.0%, 26 quarterly instalments
 * - PM Vishwakarma Statutory Guidelines (₹15,000 toolkit voucher + 5% concessional credit)
 * - PMEGP, PMFME, NLM, KCC, and PMMY MUDRA guidelines
 */

// ==============================================================================
// 1. STATUTORY CONSTANTS & ARCHETYPE TAXONOMY
// ==============================================================================

export const NSFDC_CONSTANTS = {
  INCOME_CEILING_INR: 500000.0,       // ₹5.00 Lakh family income ceiling (effective 07 Jan 2026)
  MAX_PROJECT_COST_INR: 5000000.0,    // ₹50.00 Lakh upper project cost ceiling

  // Tier 1: Micro Credit Finance (MCF / MSY)
  MCF_COST_CAP_INR: 140000.0,         // ₹1.40 Lakh
  MCF_LOAN_CAP_INR: 125000.0,         // ₹1.25 Lakh hard cap
  MCF_EQUITY_AT_CAP_INR: 15000.0,     // ₹15,000 (10.71% equity at cap)
  MCF_INTEREST_RATE_PA: 6.5,          // 6.5% p.a.
  MCF_TENURE_YEARS: 3,                // 3 years (12 quarters)
  MCF_MORATORIUM_QUARTERS: 1,         // 3-month moratorium (1 quarter)
  MCF_REPAYMENT_QUARTERS: 11,         // 11 quarterly instalments

  // Tier 2: Term Loan Scheme
  TERM_LOAN_LOAN_CAP_INR: 4500000.0,  // ₹45.00 Lakh (90% of ₹50.00L)
  TERM_LOAN_INTEREST_RATE_PA: 8.0,    // 8.0% p.a.
  TERM_LOAN_TENURE_YEARS: 7,          // 7 years (28 quarters)
  TERM_LOAN_MORATORIUM_QUARTERS: 2,   // 6-month moratorium (2 quarters)
  TERM_LOAN_REPAYMENT_QUARTERS: 26,   // 26 quarterly instalments

  MAX_LOAN_SHARE_PCT: 0.90,
  MIN_PROMOTER_EQUITY_PCT: 0.10
};

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
    schemes: ["NSFDC_TERM_LOAN", "PMFME", "PMEGP_MFG", "AIF"],
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
    default_capex: 140000,
    default_opex_monthly: 13430,
    default_turnover_monthly: 273000,
    schemes: ["NSFDC_MCF", "MUDRA_KISHOR", "MUDRA_TARUN", "PM_SVANIDHI"],
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
    schemes: ["NSFDC_TERM_LOAN", "PMEGP_SERV", "MUDRA_KISHOR"],
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
    schemes: ["NSFDC_TERM_LOAN", "NLM", "KCC_LIVESTOCK", "AHIDF"],
    seasonality_weights: [1.0, 1.0, 1.0, 0.9, 0.8, 0.8, 0.9, 1.0, 1.1, 1.3, 1.2, 1.0]
  },
  {
    id: "archetype_5",
    name: "Traditional Artisans & Crafts (PM Vishwakarma)",
    name_hi: "पारंपरिक शिल्पी एवं कारीगर (पीएम विश्वकर्मा)",
    sector: "Artisanal / Vishwakarma",
    icon: "Hammer",
    description: "18 Statutory trades: Carpenters (Suthar), Blacksmiths (Lohar), Tailors (Darzi), Potters (Kumhar).",
    description_hi: "18 पारंपरिक ट्रेड: सुथार/बढ़ई, लोहार, दर्जी, राजमिस्त्री, कुम्हार।",
    default_capex: 100000,
    default_opex_monthly: 6300,
    default_turnover_monthly: 72000,
    schemes: ["NSFDC_MCF", "PM_VISHWAKARMA_T1", "PM_VISHWAKARMA_T2"],
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
    schemes: ["NSFDC_MCF", "PMEGP_MFG", "AIF"],
    seasonality_weights: [1.0, 1.1, 1.3, 1.2, 1.0, 1.0, 1.1, 0.9, 0.9, 1.1, 1.2, 1.1]
  }
];

export const STATES = [
  "Uttar Pradesh", "West Bengal", "Tamil Nadu", "Maharashtra", "Karnataka",
  "Bihar", "Andhra Pradesh", "Gujarat", "Rajasthan", "Madhya Pradesh",
  "Punjab", "Haryana", "Odisha", "Kerala", "Assam"
];

// ==============================================================================
// 2. NSFDC STATUTORY CREDIT CALCULATOR & QUARTERLY AMORTIZATION
// ==============================================================================

/**
 * Check statutory eligibility under MoSJE / NSFDC mandate.
 */
export function checkNSFDCEligibility({
  isSC = true,
  casteCategory = null,
  annualFamilyIncome = 0,
  projectCost = 0
}) {
  const rejectionReasons = [];
  const recommendedAlternatives = [];

  let isSCMember = Boolean(isSC);
  if (casteCategory && !["SC", "SCHEDULED CASTE"].includes(casteCategory.trim().toUpperCase())) {
    isSCMember = false;
  }

  if (!isSCMember) {
    rejectionReasons.push("Beneficiary must belong to Scheduled Caste (SC) community with valid caste certificate under MoSJE / NSFDC guidelines.");
    recommendedAlternatives.push("Pradhan Mantri Mudra Yojana (PMMY) - Shishu/Kishore/Tarun for non-SC micro-enterprises.");
    recommendedAlternatives.push("PMEGP (Prime Minister Employment Generation Programme) - 15% to 35% margin money subsidy.");
    recommendedAlternatives.push("PM SVANidhi for urban/peri-urban micro-vendors.");
  }

  if (annualFamilyIncome > NSFDC_CONSTANTS.INCOME_CEILING_INR) {
    rejectionReasons.push(`Annual family income (₹${annualFamilyIncome.toLocaleString('en-IN')}) exceeds NSFDC statutory ceiling of ₹5,00,000 (effective 07 Jan 2026).`);
    recommendedAlternatives.push("PMEGP - No upper income ceiling for eligible individuals.");
    recommendedAlternatives.push("PMMY (Mudra Scheme) - Commercial bank credit up to ₹10 Lakh without family income cap.");
  }

  if (projectCost <= 0) {
    rejectionReasons.push("Project cost must be greater than ₹0.");
  } else if (projectCost > NSFDC_CONSTANTS.MAX_PROJECT_COST_INR) {
    rejectionReasons.push(`Project cost (₹${projectCost.toLocaleString('en-IN')}) exceeds maximum NSFDC scheme limit of ₹50,00,000.`);
    recommendedAlternatives.push("NABARD / SIDBI MSME Term Loan or Stand-Up India Scheme (₹10L–₹100L).");
  }

  const isEligible = rejectionReasons.length === 0;
  let applicableTier = null;
  if (isEligible) {
    applicableTier = projectCost <= NSFDC_CONSTANTS.MCF_COST_CAP_INR ? "MCF" : "TERM_LOAN";
  }

  return {
    isEligible,
    rejectionReasons,
    recommendedAlternatives: Array.from(new Set(recommendedAlternatives)),
    applicableTier
  };
}

/**
 * Calculate Equated Quarterly Instalment (EQI).
 * Formula: EQI = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
 */
export function calculateEQI(principal, annualRatePct, repaymentQuarters) {
  if (principal <= 0 || repaymentQuarters <= 0) return 0;
  if (annualRatePct <= 0) return parseFloat((principal / repaymentQuarters).toFixed(2));

  const r = (annualRatePct / 100) / 4; // Quarterly interest rate
  const factor = Math.pow(1 + r, repaymentQuarters);
  const eqi = principal * (r * factor) / (factor - 1);
  return parseFloat(eqi.toFixed(2));
}

/**
 * Standard Monthly EMI calculator.
 */
export function calculateEMI(principal, annualRatePct, tenureMonths) {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRatePct <= 0) return Math.round(principal / tenureMonths);
  const r = (annualRatePct / 100) / 12;
  const emi = principal * (r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1);
  return Math.round(emi);
}

/**
 * Structure loan and promoter equity strictly following NSFDC dual-tier rules:
 * - At ₹1,40,000 project cost, loan is capped at ₹1,25,000 and equity is ₹15,000 (10.71%).
 * - Above ₹1,40,000, 90% loan up to ₹45.00 Lakh at 8.0% p.a.
 */
export function calculateNSFDCLoanStructure({
  projectCost,
  promoterEquityOffered = null
}) {
  const cost = parseFloat(projectCost) || 0;
  if (cost <= 0) throw new Error("Project cost must be greater than zero.");
  if (cost > NSFDC_CONSTANTS.MAX_PROJECT_COST_INR) {
    throw new Error(`Project cost ₹${cost.toLocaleString('en-IN')} exceeds NSFDC limit of ₹50,00,000.`);
  }

  let tier, schemeName, ratePA, tenureYears, moratoriumQuarters, totalQuarters, repaymentQuarters, maxLoan;

  if (cost <= NSFDC_CONSTANTS.MCF_COST_CAP_INR) {
    tier = "MCF";
    schemeName = "NSFDC Micro Credit Finance (MCF / Mahila Samriddhi Yojana)";
    ratePA = NSFDC_CONSTANTS.MCF_INTEREST_RATE_PA;
    tenureYears = NSFDC_CONSTANTS.MCF_TENURE_YEARS;
    moratoriumQuarters = NSFDC_CONSTANTS.MCF_MORATORIUM_QUARTERS;
    totalQuarters = tenureYears * 4; // 12
    repaymentQuarters = totalQuarters - moratoriumQuarters; // 11
    maxLoan = Math.min(parseFloat((cost * NSFDC_CONSTANTS.MAX_LOAN_SHARE_PCT).toFixed(2)), NSFDC_CONSTANTS.MCF_LOAN_CAP_INR);
  } else {
    tier = "TERM_LOAN";
    schemeName = "NSFDC Term Loan Scheme";
    ratePA = NSFDC_CONSTANTS.TERM_LOAN_INTEREST_RATE_PA;
    tenureYears = NSFDC_CONSTANTS.TERM_LOAN_TENURE_YEARS;
    moratoriumQuarters = NSFDC_CONSTANTS.TERM_LOAN_MORATORIUM_QUARTERS;
    totalQuarters = tenureYears * 4; // 28
    repaymentQuarters = totalQuarters - moratoriumQuarters; // 26
    maxLoan = Math.min(parseFloat((cost * NSFDC_CONSTANTS.MAX_LOAN_SHARE_PCT).toFixed(2)), NSFDC_CONSTANTS.TERM_LOAN_LOAN_CAP_INR);
  }

  let loan, equity;
  if (promoterEquityOffered !== null && promoterEquityOffered !== undefined) {
    const userEquity = parseFloat(promoterEquityOffered) || 0;
    const minRequiredEquity = parseFloat((cost - maxLoan).toFixed(2));
    equity = Math.max(userEquity, minRequiredEquity);
    if (equity >= cost) {
      equity = cost;
      loan = 0.0;
    } else {
      loan = parseFloat((cost - equity).toFixed(2));
    }
  } else {
    loan = maxLoan;
    equity = parseFloat((cost - loan).toFixed(2));
  }

  const equityPct = parseFloat(((equity / cost) * 100).toFixed(2));
  const quarterlyRate = (ratePA / 100) / 4;

  return {
    tier,
    schemeName,
    projectCost: cost,
    loanAmount: loan,
    promoterEquity: equity,
    promoterEquityPct: equityPct,
    interestRatePA: ratePA,
    quarterlyInterestRate: quarterlyRate,
    tenureYears,
    totalQuarters,
    moratoriumQuarters,
    repaymentQuarters
  };
}

/**
 * Generate quarterly amortization schedule with moratorium interest and EQI.
 */
export function generateNSFDCAmortizationSchedule(structure) {
  const P = structure.loanAmount;
  const r = structure.quarterlyInterestRate;
  const n = structure.repaymentQuarters;

  const eqi = calculateEQI(P, structure.interestRatePA, n);

  const quarters = [];
  let balance = P;
  let totalInterest = 0;
  let totalPrincipal = 0;

  for (let q = 1; q <= structure.totalQuarters; q++) {
    const opening = balance;
    let isMoratorium = false;
    let interest = 0;
    let principal = 0;
    let installment = 0;
    let closing = 0;

    if (q <= structure.moratoriumQuarters) {
      isMoratorium = true;
      interest = parseFloat((opening * r).toFixed(2));
      principal = 0;
      closing = opening;
      installment = interest;
    } else {
      isMoratorium = false;
      interest = parseFloat((opening * r).toFixed(2));

      if (q === structure.totalQuarters) {
        principal = opening;
        closing = 0;
        installment = parseFloat((principal + interest).toFixed(2));
      } else {
        principal = parseFloat((eqi - interest).toFixed(2));
        if (principal > opening) principal = opening;
        closing = parseFloat((opening - principal).toFixed(2));
        installment = parseFloat((principal + interest).toFixed(2));
      }
    }

    totalInterest += interest;
    totalPrincipal += principal;
    balance = closing;

    quarters.push({
      quarter: q,
      isMoratorium,
      openingBalance: opening,
      interestPayment: interest,
      principalPayment: principal,
      totalInstallment: installment,
      closingBalance: closing
    });
  }

  return {
    structure,
    quarters,
    equatedQuarterlyInstallment: eqi,
    totalPrincipalPaid: parseFloat(totalPrincipal.toFixed(2)),
    totalInterestPaid: parseFloat(totalInterest.toFixed(2)),
    totalDebtService: parseFloat((totalPrincipal + totalInterest).toFixed(2))
  };
}

/**
 * Check PM Vishwakarma traditional artisan fit.
 */
export function checkArtisanSchemeFit(domainCode, hasPMEGPPast5Years = false) {
  const artisanTrades = {
    D18: "Tailor (Darzi) - Trade 17",
    D19: "Carpenter (Suthar) - Trade 1",
    D20: "Blacksmith (Lohar) - Trade 3",
    D21: "Potter (Kumhar) - Trade 5"
  };

  const code = (domainCode || "").trim().toUpperCase();
  if (artisanTrades[code]) {
    if (hasPMEGPPast5Years) {
      return {
        isEligible: false,
        trade: artisanTrades[code],
        exclusionReason: "Statutory exclusion: Beneficiary or family member availed PMEGP credit/subsidy within the past 5 years.",
        toolkitVoucher: 0,
        concessionalRate: 0
      };
    }
    return {
      isEligible: true,
      trade: artisanTrades[code],
      exclusionReason: null,
      toolkitVoucher: 15000,
      stipendPerDay: 500,
      concessionalRate: 5.0,
      tranche1Limit: 100000,
      tranche2Limit: 200000
    };
  }

  return {
    isEligible: false,
    trade: "Not an artisanal trade",
    exclusionReason: "Domain is outside designated 18 PM Vishwakarma craft trades.",
    toolkitVoucher: 0,
    concessionalRate: 0
  };
}

// ==============================================================================
// 3. COMPLETE INCUBATION & SEASONALITY EVALUATOR
// ==============================================================================

export function evaluateIncubation({
  archetypeId,
  state,
  capex,
  promoterCategory = "sc",
  locationType = "rural",
  customTenure = null,
  annualFamilyIncome = 250000
}) {
  const arch = ARCHETYPES.find(a => a.id === archetypeId) || ARCHETYPES[0];
  const finalCapex = capex || arch.default_capex;
  const monthlyOpex = arch.default_opex_monthly;
  const monthlyRevenue = arch.default_turnover_monthly;

  const workingCapital = Math.round(monthlyOpex * 1.5);
  const preOperative = Math.round(finalCapex * 0.05);
  const totalProjectCost = Math.round(finalCapex + workingCapital + preOperative);

  const isRural = (locationType === "rural");
  const normCat = (promoterCategory || "").toLowerCase().trim();
  const isSC = (normCat === "sc" || normCat === "scheduled caste" || normCat === "special");

  // Statutory eligibility check under MoSJE / NSFDC mandate
  const nsfdcEligibility = checkNSFDCEligibility({
    isSC: normCat === "sc" || normCat === "scheduled caste",
    casteCategory: normCat.toUpperCase(),
    annualFamilyIncome,
    projectCost: totalProjectCost
  });

  let schemeName = "PMMY MUDRA (Kishor)";
  let subsidyAmount = 0;
  let subsidyPct = 0;
  let promoterEquity = 0;
  let loanAmount = 0;
  let interestRate = 8.0;
  let tenureMonths = customTenure || 84;
  let statutoryNotes = "";
  let nsfdcDetails = null;

  // Primary routing: NSFDC for SC micro-entrepreneurs with income <= ₹5L
  if (nsfdcEligibility.isEligible) {
    const structure = calculateNSFDCLoanStructure({ projectCost: totalProjectCost });
    const schedule = generateNSFDCAmortizationSchedule(structure);

    schemeName = structure.schemeName;
    loanAmount = structure.loanAmount;
    promoterEquity = structure.promoterEquity;
    interestRate = structure.interestRatePA;
    tenureMonths = structure.tenureYears * 12;

    if (structure.tier === "MCF") {
      statutoryNotes = `NSFDC Micro Credit Finance: ₹1,25,000 statutory loan cap @ 6.5% p.a. (Promoter Equity ₹${promoterEquity.toLocaleString('en-IN')}, 3-month moratorium, 11 quarterly instalments).`;
    } else {
      statutoryNotes = `NSFDC Term Loan Scheme: 90% concessional credit @ 8.0% p.a. (Promoter Equity ₹${promoterEquity.toLocaleString('en-IN')} / 10%, 6-month moratorium, 26 quarterly instalments).`;
    }

    nsfdcDetails = {
      isEligible: true,
      tier: structure.tier,
      schemeName: structure.schemeName,
      equatedQuarterlyInstallment: schedule.equatedQuarterlyInstallment,
      moratoriumInterestPerQuarter: schedule.quarters[0].interestPayment,
      moratoriumQuarters: structure.moratoriumQuarters,
      repaymentQuarters: structure.repaymentQuarters,
      totalQuarters: structure.totalQuarters,
      promoterEquityPct: structure.promoterEquityPct,
      totalDebtService: schedule.totalDebtService,
      totalInterestPaid: schedule.totalInterestPaid,
      quarters: schedule.quarters
    };

  } else {
    // Retain NSFDC rejection details for UI transparency
    nsfdcDetails = {
      isEligible: false,
      rejectionReasons: nsfdcEligibility.rejectionReasons,
      recommendedAlternatives: nsfdcEligibility.recommendedAlternatives
    };

    if (arch.id === "archetype_5") {
      schemeName = "PM Vishwakarma (Tranche 1)";
      subsidyAmount = 15000;
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
      const isSpecialCat = ["sc", "st", "obc", "special"].includes(normCat);
      const subRate = (isRural && isSpecialCat) ? 0.35 : (isRural ? 0.25 : 0.15);
      const ownRate = isSpecialCat ? 0.05 : 0.10;
      subsidyPct = subRate * 100;
      subsidyAmount = Math.round(totalProjectCost * subRate);
      promoterEquity = Math.round(totalProjectCost * ownRate);
      loanAmount = Math.round(totalProjectCost - subsidyAmount - promoterEquity);
      statutoryNotes = `PMEGP ${subsidyPct}% Margin Money Capital Subsidy for ${locationType} ${promoterCategory} entrepreneur.`;
    } else {
      schemeName = totalProjectCost <= 50000 ? "PM SVANidhi / MUDRA Shishu" : "PMMY MUDRA (Kishor / Tarun)";
      promoterEquity = Math.round(totalProjectCost * 0.15);
      loanAmount = Math.round(totalProjectCost * 0.85);
      statutoryNotes = "100% collateral-free credit backed by Credit Guarantee Fund for Micro Units (CGFMU).";
    }
  }

  // Monthly debt service equivalent
  const monthlyEMI = nsfdcDetails.isEligible 
    ? Math.round(nsfdcDetails.equatedQuarterlyInstallment / 3) 
    : calculateEMI(loanAmount, interestRate, tenureMonths);

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
    nsfdcDetails,
    nsfdcEligibility,
    viabilityStatus: avgAnnualDSCR >= 1.5 ? "HIGH_FEASIBILITY" : (avgAnnualDSCR >= 1.2 ? "MODERATE_FEASIBILITY" : "STRESSED")
  };
}

// ==============================================================================
// 4. MODE B: INFORMAL DEBT RESTRUCTURING & REFINANCING
// ==============================================================================

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
    NSFDC_REFINANCE: { name: "NSFDC Micro-Credit / Term Loan (6.5% - 8.0%)", rate: 6.5 },
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
