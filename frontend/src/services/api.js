/**
 * GraminAI API Client Service
 * Asynchronous service communicating with Python HTTP backend on /api
 * with graceful offline fallback to frontend/src/engine.js and local dossiers database.
 * 
 * Statutory Mandate: MoSJE / NSFDC (SIH26091)
 */

import {
  calculateNSFDCLoanStructure,
  generateNSFDCAmortizationSchedule,
  checkNSFDCEligibility,
  evaluateIncubation,
  evaluateRestructuring,
  NSFDC_CONSTANTS,
  ARCHETYPES
} from '../engine.js';

import dossiersData from '../data/dossiers_db.json' with { type: 'json' };

/**
 * Check backend service health status.
 * @returns {Promise<Object>} Service health and active calculation engine metadata.
 */
export async function fetchHealth() {
  try {
    const res = await fetch('/api/health', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[GraminAI API] Backend unavailable, using client-side health fallback:', err?.message || err);
    return {
      status: 'ok',
      version: '1.0.0',
      clientOnly: true,
      mode: 'client-offline-fallback',
      timestamp: new Date().toISOString(),
      engines: {
        nsfdc_calculator: '2.0.0 (client-fallback)',
        multi_archetype_financial_engine: '2.0.0 (client-fallback)',
        dossiers_db: '2.0.0 (local-bundle)',
        total_dossiers: Object.keys(dossiersData.dossiers || {}).length
      }
    };
  }
}

/**
 * Calculate statutory NSFDC dual-tier credit financing & amortization table.
 * @param {number} projectCost - Total project cost in INR.
 * @param {number} familyIncome - Annual family income in INR.
 * @param {Object} [options] - Additional parameters { isSc, promoterEquityOffered, casteCategory }.
 * @returns {Promise<Object>} Loan structure, eligibility, and quarterly amortization schedule.
 */
export async function calculateNSFDCLoan(projectCost, familyIncome = 0, options = {}) {
  const payload = {
    projectCost: Number(projectCost),
    familyIncome: Number(familyIncome),
    isSc: options.isSc !== undefined ? options.isSc : true,
    promoterEquityOffered: options.promoterEquityOffered !== undefined ? options.promoterEquityOffered : null,
    ...options
  };

  try {
    const res = await fetch('/api/engine/nsfdc/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[GraminAI API] Backend calculateNSFDCLoan request failed, falling back to engine.js:', err?.message || err);

    const cost = Number(projectCost);
    const income = Number(familyIncome);
    const eligibility = checkNSFDCEligibility({
      isSC: payload.isSc,
      casteCategory: options.casteCategory || (payload.isSc ? 'SC' : 'GENERAL'),
      annualFamilyIncome: income,
      projectCost: cost
    });

    if (!eligibility.isEligible) {
      return {
        isEligible: false,
        is_eligible: false,
        rejectionReasons: eligibility.rejectionReasons,
        rejection_reasons: eligibility.rejectionReasons,
        recommendedAlternatives: eligibility.recommendedAlternatives,
        recommended_alternatives: eligibility.recommendedAlternatives,
        projectCost: cost,
        familyIncome: income,
        _fallback: true
      };
    }

    const structure = calculateNSFDCLoanStructure({
      projectCost: cost,
      promoterEquityOffered: payload.promoterEquityOffered
    });

    const amortizationScheduleResult = generateNSFDCAmortizationSchedule(structure);

    return {
      isEligible: true,
      is_eligible: true,
      tier: structure.tier,
      schemeName: structure.schemeName,
      scheme_name: structure.schemeName,
      projectCost: structure.projectCost,
      project_cost: structure.projectCost,
      maxLoanAmount: structure.loanAmount,
      loanAmount: structure.loanAmount,
      loan_amount: structure.loanAmount,
      promoterContribution: structure.promoterEquity,
      promoterEquity: structure.promoterEquity,
      promoter_equity: structure.promoterEquity,
      promoterEquityPct: structure.promoterEquityPct,
      promoter_equity_pct: structure.promoterEquityPct,
      interestRatePa: structure.interestRatePA,
      interest_rate_pa: structure.interestRatePA,
      quarterlyInterestRate: structure.quarterlyInterestRate,
      quarterly_interest_rate: structure.quarterlyInterestRate,
      termYears: structure.tenureYears,
      tenureYears: structure.tenureYears,
      tenure_years: structure.tenureYears,
      totalQuarters: structure.totalQuarters,
      total_quarters: structure.totalQuarters,
      moratoriumQuarters: structure.moratoriumQuarters,
      moratorium_quarters: structure.moratoriumQuarters,
      repaymentQuarters: structure.repaymentQuarters,
      repayment_quarters: structure.repaymentQuarters,
      equatedQuarterlyInstallment: amortizationScheduleResult.equatedQuarterlyInstallment,
      equated_quarterly_installment: amortizationScheduleResult.equatedQuarterlyInstallment,
      totalPrincipalPaid: amortizationScheduleResult.totalPrincipalPaid,
      total_principal_paid: amortizationScheduleResult.totalPrincipalPaid,
      totalInterestPaid: amortizationScheduleResult.totalInterestPaid,
      total_interest_paid: amortizationScheduleResult.totalInterestPaid,
      totalDebtService: amortizationScheduleResult.totalDebtService,
      total_debt_service: amortizationScheduleResult.totalDebtService,
      amortizationSchedule: amortizationScheduleResult.quarters,
      amortization_schedule: amortizationScheduleResult.quarters,
      _fallback: true
    };
  }
}

/**
 * Evaluate Mode A enterprise incubation project feasibility across archetypes.
 * @param {string} [archetypeKey='archetype_1'] - Key of the archetype (archetype_1 to archetype_6).
 * @param {number} [scale=1.0] - Scale multiplier.
 * @param {Object} [options] - Additional parameters { state, capexOverride, monthlyOpexOverride, etc. }.
 * @returns {Promise<Object>} Feasibility appraisal, CapEx, OpEx, seasonal DSCR array, and subsidies.
 */
export async function evaluateModeA(archetypeKey = 'archetype_1', scale = 1.0, options = {}) {
  const payload = {
    archetypeKey,
    scale: Number(scale) || 1.0,
    ...options
  };

  try {
    const res = await fetch('/api/engine/mode-a/evaluate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[GraminAI API] Backend evaluateModeA request failed, falling back to engine.js:', err?.message || err);

    const clientResult = evaluateIncubation({
      archetypeId: archetypeKey,
      state: options.state || 'Uttar Pradesh',
      scale: payload.scale,
      capexOverride: options.capexOverride,
      workingCapitalOverride: options.workingCapitalOverride,
      monthlyRevenueOverride: options.monthlyRevenueOverride,
      monthlyOpexOverride: options.monthlyOpexOverride,
      promoterCategory: options.promoterCategory || 'special',
      locationType: options.locationType || 'rural',
      customLoanTenureMonths: options.customLoanTenureMonths || 60,
      baseInterestRatePct: options.baseInterestRatePct || 9.5
    });

    const seasonalDscr = (clientResult.monthlyBreakdown || []).map(m => m.dscr || 0);

    return {
      capex: clientResult.capex,
      totalProjectCost: clientResult.totalProjectCost,
      monthlyOpex: clientResult.monthlyBreakdown?.[0]?.opex || 0,
      revenue: clientResult.monthlyBreakdown?.[0]?.revenue || 0,
      seasonalDscr,
      grantSubsidy: clientResult.subsidyAmount,
      promoterEquity: clientResult.promoterEquity,
      bankLoanPrincipal: clientResult.loanAmount,
      monthlyEmi: clientResult.monthlyEMI,
      archetypeId: archetypeKey,
      archetypeName: clientResult.archetype?.name,
      state: clientResult.state,
      rawResult: clientResult,
      _fallback: true
    };
  }
}

/**
 * Restructure informal moneylender debt into formal credit with Damdupat legal audit.
 * @param {number} principal - Principal debt amount in INR.
 * @param {number} [monthlyRatePct=3.0] - Monthly interest rate percentage (e.g. 3% per month).
 * @param {number} [durationMonths=36] - Months debt has been active.
 * @param {Object} [options] - Additional parameters { debts, householdIncome, pathway, tenureMonths }.
 * @returns {Promise<Object>} Restructuring plan, Damdupat violation flag, and monthly savings.
 */
export async function restructureDebt(principal, monthlyRatePct = 3.0, durationMonths = 36, options = {}) {
  const payload = {
    principal: Number(principal),
    monthlyRatePct: Number(monthlyRatePct),
    durationMonths: Number(durationMonths),
    ...options
  };

  try {
    const res = await fetch('/api/engine/mode-b/restructure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      throw new Error(errJson?.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[GraminAI API] Backend restructureDebt request failed, falling back to engine.js:', err?.message || err);

    const clientResult = evaluateRestructuring({
      debts: options.debts || [
        {
          principal: payload.principal,
          rateQuote: options.rateQuote || `${payload.monthlyRatePct} senkda`,
          monthsActive: payload.durationMonths,
          lenderType: options.lenderType || 'Village Moneylender'
        }
      ],
      householdIncome: options.householdIncome || 35000,
      pathway: options.refinancingPathway || options.pathway || 'MUDRA_KISHOR',
      tenureMonths: options.refinanceTenureMonths || options.tenureMonths || payload.durationMonths
    });

    const oldMonthlyInterest = clientResult.totalMonthlyInterestBleed;
    const newMonthlyEmi = clientResult.newEMI;
    const monthlySavings = clientResult.monthlyCashRelief;
    const damdupatViolated = clientResult.damdupatViolationsCount > 0;

    return {
      oldMonthlyInterest,
      old_monthly_interest: oldMonthlyInterest,
      newMonthlyEmi,
      new_monthly_emi: newMonthlyEmi,
      monthlySavings,
      monthly_savings: monthlySavings,
      damdupatViolated,
      damdupat_violated: damdupatViolated,
      totalDebtConsolidated: clientResult.totalPrincipal,
      weightedInformalAprPct: clientResult.weightedApr,
      auditedDebts: clientResult.auditedDebts,
      liberationMetrics: {
        monthly_cash_flow_relief: monthlySavings,
        cumulative_interest_saved: clientResult.totalInterestSaved,
        cash_flow_liberation_ratio_pct: clientResult.cflrPct
      },
      rawResult: clientResult,
      _fallback: true
    };
  }
}

/**
 * Fetch all 24 empirical rural micro-enterprise dossiers.
 * @returns {Promise<Object>} List of dossiers and metadata.
 */
export async function fetchDossiers() {
  try {
    const res = await fetch('/api/dossiers', {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[GraminAI API] Backend fetchDossiers request failed, falling back to local dataset:', err?.message || err);
    const dossiersList = Object.values(dossiersData.dossiers || {});
    return {
      count: dossiersList.length,
      dossiers: dossiersList,
      metadata: dossiersData.metadata || {},
      _fallback: true
    };
  }
}

/**
 * Fetch a specific empirical dossier by its code (e.g. 'D01', 'D08', 'D18').
 * @param {string} code - Dossier code.
 * @returns {Promise<Object|null>} Dossier details or null if not found.
 */
export async function fetchDossier(code) {
  if (!code) throw new Error('Dossier code is required');
  const upperCode = code.toString().trim().toUpperCase();

  try {
    const res = await fetch(`/api/dossiers/${encodeURIComponent(upperCode)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[GraminAI API] Backend fetchDossier(${upperCode}) failed, falling back to local dataset:`, err?.message || err);
    const dossier = dossiersData.dossiers?.[upperCode];
    if (!dossier) return null;

    const mcfTier = dossier.capex_financing?.micro_finance_tier || {};
    const termTier = dossier.capex_financing?.term_loan_tier || {};
    const capexVal = mcfTier.project_cost || termTier.project_cost || 0;
    const opexVal = dossier.opex_and_working_capital?.monthly_cash_opex || 0;

    return {
      ...dossier,
      title: dossier.name,
      capex: capexVal,
      opex: opexVal,
      _fallback: true
    };
  }
}

export default {
  fetchHealth,
  calculateNSFDCLoan,
  evaluateModeA,
  restructureDebt,
  fetchDossiers,
  fetchDossier
};
