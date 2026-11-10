/**
 * NSFDC loan maths for when the server is offline: a line-by-line copy of the verified
 * server logic (backend/loan.py, which wraps engine/nsfdc_calculator.py), giving the same
 * reply as POST /api/engine/nsfdc/calculate (backend/compat.py): same figures, tags, quotes,
 * warnings, notes, other schemes and error messages, plus offline: true.
 *
 * test/stage3_website.test.js checks it against answers produced by the real server
 * (test/fixtures/nsfdc_server_answers.json). If the server rules change, rebuild that
 * file (test/fixtures/make_nsfdc_server_answers.py) and this copy must still match.
 *
 * Rules [S1] = NSFDC scheme page: SC applicant, family income up to ₹5,00,000, loan 90% of
 * project cost. Micro Finance Scheme up to ₹1,40,000 cost: loan cap ₹1,25,000, 6.5% p.a., 3 years,
 * 3-month pause. Term Loan up to ₹50,00,000: cap ₹45,00,000, 8% p.a., 7 years, 6-month pause.
 * ASSUMED (same as the server): loan rounded down to the rupee; pause interest added to the loan.
 */

const S1_URL = 'https://devmosje.negd.in/?p=15629';
const S1 = '[S1]';
// Word for word from backend/sources.py (the saved NSFDC FAQ page).
const QUOTES = {
  community: 'Community Requirement: Must belong to the Scheduled Caste (SC) community and possess a valid Caste Certificate issued by the competent authority.',
  income: 'Income Ceiling: Annual family income from all sources must not exceed ₹5.00 Lakhs (applicable to both rural and urban areas, effective January 7, 2026).',
  ninety_pct: 'In all schemes, NSFDC provides up to 90% of the project cost.',
  micro_finance: 'Micro Finance Scheme (MFS): Provides micro-credit for small business activities for units costing up to ₹1.40 lakh. The maximum loan limit is ₹1.25 lakh at an interest rate of 6.5% p.a. for the beneficiary. Repayment is in quarterly installments within 3 years (including a 3-month moratorium).',
  term_loan: 'Term Loan: Designed for larger income-generating projects costing more than ₹1.40 lakh and up to ₹50.00 lakh. The maximum loan limit is up to ₹45.00 lakh at an interest rate of 8% p.a. for the beneficiary. Repayment is within 7 years (including a 6-month moratorium, which is extended to 12 months for plantation and construction activities).'
};
const cite = (key) => ({ tag: S1, quote: QUOTES[key], url: S1_URL });
const SOURCES = {
  '[S1]': {
    tag: S1,
    document: 'NSFDC — Frequently Asked Questions (MoSJE portal)',
    url: S1_URL,
    note: 'Dev-site copy of the MoSJE/NSFDC FAQ page; saved copy in research_dossiers/sources/_shared/NSFDC_devmosje_p15629.html'
  }
};
const ALTERNATIVES_TAG = "ASSUMED: not sourced — suggestion text from the team's calculator (engine/nsfdc_calculator.py); check the scheme's own guidelines";
// engine/nsfdc_calculator.py check_eligibility: suggestion texts per failed gate (team's text, ASSUMED)
const ALT_NOT_SC = [
  'Pradhan Mantri Mudra Yojana (PMMY) - Shishu/Kishore/Tarun for non-SC micro-enterprises.',
  'PMEGP (Prime Minister Employment Generation Programme) - 15% to 35% margin money subsidy.',
  'PM SVANidhi for urban/peri-urban micro-vendors.'
];
const ALT_INCOME = [
  'PMEGP - No upper income ceiling for eligible individuals.',
  'PMMY (Mudra Scheme) - Commercial bank credit up to ₹10 Lakh without income ceiling.',
  'Commercial Bank MSME Loan / Stand-Up India.'
];
const ALT_COST = ['NABARD / SIDBI MSME Term Loan or Stand-Up India Scheme (₹10L–₹100L).'];
const MAX_RUPEES = 10 ** 9; // backend/schemas.py input-sanity limit, not an NSFDC rule
const CALC = 'CALCULATED';
const INCOME_CEILING = 500000;
const MAX_PROJECT_COST = 5000000;

const TIERS = {
  MCF: { costCap: 140000, loanCap: 125000, ratePa: 6.5, years: 3, pause: 1, scheme: 'Micro Finance Scheme (MFS)', rule: 'micro_finance' },
  TERM_LOAN: { costCap: MAX_PROJECT_COST, loanCap: 4500000, ratePa: 8.0, years: 7, pause: 2, scheme: 'Term Loan', rule: 'term_loan' }
};

/** Python's round(x, 2): the exact binary value rounded to 2 decimals, ties to even. */
export function round2(x) {
  if (!Number.isFinite(x)) return x;
  const neg = x < 0;
  const [whole, frac] = Math.abs(x).toFixed(60).split('.');
  const keep = frac.slice(0, 2);
  const rest = frac.slice(2);
  let up;
  if (rest[0] > '5') up = true;
  else if (rest[0] < '5') up = false;
  else up = /[1-9]/.test(rest.slice(1)) || Number(keep[1]) % 2 === 1;
  let v = Number(`${whole}.${keep}`);
  if (up) v = (Math.round(v * 100) + 1) / 100;
  return neg && v !== 0 ? -v : v;
}

/** engine/nsfdc_calculator.py generate_amortization_schedule, for a schedule with no pause. */
function repaymentRows(P, r, n) {
  let eqi = 0;
  if (P > 0 && r > 0 && n > 0) {
    const factor = Math.pow(1 + r, n);
    eqi = round2((P * (r * factor)) / (factor - 1));
  }
  const rows = [];
  let balance = P;
  for (let q = 1; q <= n; q += 1) {
    const opening = balance;
    const interest = round2(opening * r);
    let principal;
    let closing;
    if (q === n) {
      principal = opening;
      closing = 0;
    } else {
      principal = round2(eqi - interest);
      if (principal > opening) principal = opening;
      closing = round2(opening - principal);
    }
    rows.push({ quarter: q, opening, interest, principal, payment: round2(principal + interest), closing });
    balance = closing;
  }
  return { eqi, rows };
}

/** backend/compat.py _whole_rupees: paise rounded down (ASSUMED note); non-numbers and huge values rejected. */
function wholeRupees(value, name, notes) {
  if (typeof value === 'boolean') throw new Error(`'${name}' must be a number`);
  const x = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof x !== 'number' || Number.isNaN(x)) throw new Error(`'${name}' must be a number`);
  if (!Number.isFinite(x)) throw new Error(`'${name}' must be a finite number`);
  if (Math.abs(x) > 10 ** 12) throw new Error(`'${name}' is too large`);
  const whole = Math.floor(x);
  if (whole !== x) notes.push({ tag: 'ASSUMED', text: `${name} ${x} was rounded down to the whole rupee (${whole}).` });
  return whole;
}

/** backend/compat.py _is_sc: missing -> SC (ASSUMED note); true/false or the text "true"/"false". */
function scAnswer(isSc, notes) {
  if (isSc === undefined || isSc === null) {
    notes.push({ tag: 'ASSUMED', text: "isSc was not sent, so the applicant is taken as Scheduled Caste (as in the website's default)." });
    return true;
  }
  if (typeof isSc === 'boolean') return isSc;
  if (typeof isSc === 'string' && ['true', 'false'].includes(isSc.trim().toLowerCase())) return isSc.trim().toLowerCase() === 'true';
  throw new Error("'isSc' must be true or false");
}

/** backend/schemas.py limits, with the server's message wording (field order: cost, then income). */
function checkLimits(cost, income) {
  const problems = [];
  if (cost <= 0) problems.push("'projectCost': Input should be greater than 0");
  else if (cost > MAX_RUPEES) problems.push(`'projectCost': Input should be less than or equal to ${MAX_RUPEES}`);
  if (income < 0) problems.push("'familyIncome': Input should be greater than or equal to 0");
  else if (income > MAX_RUPEES) problems.push(`'familyIncome': Input should be less than or equal to ${MAX_RUPEES}`);
  if (problems.length) throw new Error(problems.join('; '));
}

function both(obj, camel, snake, value) {
  obj[camel] = value;
  obj[snake] = value;
}

const snake = (k) => k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

/**
 * @param {{projectCost:number, familyIncome:number, isSc?:boolean|string}} input
 * @returns {Object} the same reply as the server, plus offline: true. Throws Error(server message) on bad input.
 */
export function offlineNsfdcLoan({ projectCost, familyIncome = 0, isSc }) {
  const notes = [];
  if (projectCost === undefined || projectCost === null) throw new Error("Missing required parameter: 'projectCost'");
  const cost = wholeRupees(projectCost, 'projectCost', notes);
  const income = wholeRupees(familyIncome, 'familyIncome', notes);
  const sc = scAnswer(isSc, notes);
  checkLimits(cost, income);

  // backend/loan.py assess: reasons with NSFDC's own words
  const reasonQuotes = [];
  let personOk = true;
  if (!sc) { personOk = false; reasonQuotes.push({ ...cite('community'), text: 'Applicant is not from a Scheduled Caste.' }); }
  if (income > INCOME_CEILING) { personOk = false; reasonQuotes.push({ ...cite('income'), text: 'Annual family income is above ₹5,00,000.' }); }
  if (cost > MAX_PROJECT_COST) reasonQuotes.push({ ...cite('term_loan'), text: 'Project cost is above ₹50,00,000, the Term Loan limit.' });

  if (reasonQuotes.length) {
    const reasons = reasonQuotes.map((r) => r.text || r.quote);
    const alts = [...new Set([...(sc ? [] : ALT_NOT_SC), ...(income > INCOME_CEILING ? ALT_INCOME : []),
      ...(cost > MAX_PROJECT_COST ? ALT_COST : [])])];
    return {
      isEligible: false, is_eligible: false,
      status: personOk ? 'not_covered' : 'not_eligible',
      rejectionReasons: reasons, rejection_reasons: reasons,
      recommendedAlternatives: alts, recommended_alternatives: alts,
      projectCost: cost, familyIncome: income,
      reasonQuotes,
      assumptions: notes,
      tags: { projectCost: 'USER INPUT', familyIncome: 'USER INPUT', recommendedAlternatives: ALTERNATIVES_TAG },
      offline: true
    };
  }

  const tierKey = cost <= TIERS.MCF.costCap ? 'MCF' : 'TERM_LOAN';
  const t = TIERS[tierKey];
  const loan = Math.min(Math.floor((cost * 9) / 10), t.loanCap); // whole-rupee maths, rounded DOWN
  const own = cost - loan;
  const r = t.ratePa / 400;
  const totalQuarters = t.years * 4;
  const repayQuarters = totalQuarters - t.pause;

  // Pause quarters: interest added to the loan, compounding (ASSUMED, same as the server).
  const rows = [];
  let balance = loan;
  let added = 0;
  for (let q = 1; q <= t.pause; q += 1) {
    const interest = round2(balance * r);
    const closing = round2(balance + interest);
    const row = { quarter: q };
    both(row, 'isMoratorium', 'is_moratorium', true);
    both(row, 'openingBalance', 'opening_balance', round2(balance));
    both(row, 'interestPayment', 'interest_payment', 0);
    both(row, 'interestAddedToLoan', 'interest_added_to_loan', interest);
    both(row, 'principalPayment', 'principal_payment', 0);
    both(row, 'totalInstallment', 'total_installment', 0);
    both(row, 'closingBalance', 'closing_balance', closing);
    rows.push(row);
    added += interest;
    balance = closing;
  }
  const balanceAfterPause = balance;
  const repay = repaymentRows(balance, r, repayQuarters);
  for (const x of repay.rows) {
    const row = { quarter: x.quarter + t.pause };
    both(row, 'isMoratorium', 'is_moratorium', false);
    both(row, 'openingBalance', 'opening_balance', round2(x.opening));
    both(row, 'interestPayment', 'interest_payment', round2(x.interest));
    both(row, 'interestAddedToLoan', 'interest_added_to_loan', 0);
    both(row, 'principalPayment', 'principal_payment', x.principal);
    both(row, 'totalInstallment', 'total_installment', x.payment);
    both(row, 'closingBalance', 'closing_balance', x.closing);
    rows.push(row);
  }

  let totalPaid = 0;
  for (const row of rows) totalPaid += row.totalInstallment;
  totalPaid = round2(totalPaid);

  const loanTag = `${CALC}: lower of 90% of project cost and the cap ${S1}, rounded down (ASSUMED)`;
  const res = { isEligible: true, is_eligible: true, tier: tierKey };
  both(res, 'schemeName', 'scheme_name', t.scheme);
  both(res, 'projectCost', 'project_cost', cost);
  res.maxLoanAmount = loan;
  both(res, 'loanAmount', 'loan_amount', loan);
  res.promoterContribution = own;
  both(res, 'promoterEquity', 'promoter_equity', own);
  both(res, 'promoterEquityPct', 'promoter_equity_pct', round2((own * 100) / cost));
  both(res, 'interestRatePa', 'interest_rate_pa', t.ratePa);
  both(res, 'quarterlyInterestRate', 'quarterly_interest_rate', r);
  res.termYears = t.years;
  both(res, 'tenureYears', 'tenure_years', t.years);
  both(res, 'totalQuarters', 'total_quarters', totalQuarters);
  both(res, 'moratoriumQuarters', 'moratorium_quarters', t.pause);
  both(res, 'repaymentQuarters', 'repayment_quarters', repayQuarters);
  both(res, 'equatedQuarterlyInstallment', 'equated_quarterly_installment', repay.eqi);
  both(res, 'interestAddedDuringPause', 'interest_added_during_pause', round2(added));
  both(res, 'totalPrincipalPaid', 'total_principal_paid', loan);
  both(res, 'totalInterestPaid', 'total_interest_paid', round2(totalPaid - loan));
  both(res, 'totalDebtService', 'total_debt_service', totalPaid);
  both(res, 'amortizationSchedule', 'amortization_schedule', rows);

  const tenureTag = "ASSUMED: NSFDC says 'within' this many years";
  const tags = {
    projectCost: 'USER INPUT',
    maxLoanAmount: loanTag, loanAmount: loanTag,
    promoterContribution: `${CALC}: project cost minus loan`, promoterEquity: `${CALC}: project cost minus loan`,
    promoterEquityPct: CALC,
    interestRatePa: S1, quarterlyInterestRate: `${CALC}: interestRatePa / 400`,
    termYears: tenureTag, tenureYears: tenureTag,
    totalQuarters: 'ASSUMED: tenure x 4', moratoriumQuarters: `${CALC}: ${t.pause * 3}-month pause ${S1} ÷ 3`,
    repaymentQuarters: CALC,
    equatedQuarterlyInstallment: CALC, interestAddedDuringPause: 'CALCULATED (pause handling ASSUMED)',
    totalPrincipalPaid: CALC, totalInterestPaid: CALC, totalDebtService: CALC, amortizationSchedule: CALC
  };
  for (const k of Object.keys(tags)) if (snake(k) in res && snake(k) !== k) tags[snake(k)] = tags[k];
  res.tags = tags;
  res.rule = cite(t.rule);
  res.ninetyPctRule = cite('ninety_pct');

  // backend/loan.py build_loan warnings
  const warnings = [];
  if (loan === 0) {
    warnings.push({ code: 'loan_is_zero', tag: 'CALCULATED', text: 'At this project cost, 90% rounded down to the rupee is ₹0: there is nothing to borrow.' });
  }
  if (balanceAfterPause > t.loanCap) {
    warnings.push({
      code: 'balance_over_cap_after_pause', tag: 'ASSUMED',
      text: "With pause interest added, the balance owed is above the scheme's maximum loan. Confirm with your State Channelising Agency (SCA) how pause interest is handled."
    });
  }
  res.warnings = warnings;

  // backend/loan.py _assumptions (accrue mode)
  const assumed = [
    'Loan rounded down to the whole rupee.',
    "Repaid over exactly 3 years (Micro Finance) or 7 years (Term Loan); NSFDC says 'within'.",
    'Each instalment is equal (equated quarterly instalment), with the last one settling the exact balance.'
  ];
  if (tierKey === 'TERM_LOAN') assumed.push("Term Loan repaid in quarterly instalments; the NSFDC page states 'quarterly' only for Micro Finance.");
  assumed.push('Interest during the pause is added to the loan, compounding each quarter. The NSFDC page does not say how pause interest is handled (NOT FOUND).');
  res.assumptions = notes.concat(assumed.map((text) => ({ text, tag: 'ASSUMED' })));
  res.notes = tierKey === 'TERM_LOAN'
    ? [{ ...cite('term_loan'), text: 'For plantation and construction activities the pause is 12 months, not 6. Not applied here; ask your SCA if your activity counts.' }]
    : [];
  res.sources = SOURCES;
  res.offline = true;
  return res;
}
