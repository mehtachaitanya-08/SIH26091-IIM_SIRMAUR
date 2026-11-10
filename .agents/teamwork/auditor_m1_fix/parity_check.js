import fs from 'node:fs';
import {
  checkNSFDCEligibility,
  calculateEQI,
  calculateEMI,
  calculateNSFDCLoanStructure,
  generateNSFDCAmortizationSchedule,
  checkArtisanSchemeFit,
  parseVernacularQuote
} from '../../../frontend/src/engine.js';

const testCosts = [50000, 100000, 140000, 150000, 680000, 2500000, 5000000];

const results = {
  loanStructures: {},
  amortizationSchedules: {},
  eqiValues: {},
  eligibility: {},
  artisanFit: {},
  vernacularQuotes: {}
};

for (const cost of testCosts) {
  const structure = calculateNSFDCLoanStructure({ projectCost: cost });
  results.loanStructures[cost] = structure;

  const schedule = generateNSFDCAmortizationSchedule(structure);
  results.amortizationSchedules[cost] = {
    eqi: schedule.equatedQuarterlyInstallment,
    totalQuarters: schedule.quarters.length,
    moratoriumQuartersCount: schedule.quarters.filter(q => q.isMoratorium).length,
    firstQuarterInterest: schedule.quarters[0].interestPayment,
    firstAmortQuarterPrincipal: schedule.quarters[structure.moratoriumQuarters].principalPayment,
    finalClosingBalance: schedule.quarters[schedule.quarters.length - 1].closingBalance,
    totalPrincipalPaid: schedule.totalPrincipalPaid,
    totalInterestPaid: schedule.totalInterestPaid,
    totalDebtService: schedule.totalDebtService
  };
}

const eligibilityCases = [
  { isSC: true, annualFamilyIncome: 300000, projectCost: 140000 },
  { isSC: false, annualFamilyIncome: 300000, projectCost: 140000 },
  { isSC: true, annualFamilyIncome: 550000, projectCost: 140000 },
  { isSC: true, annualFamilyIncome: 300000, projectCost: 6000000 }
];

results.eligibility = eligibilityCases.map(c => checkNSFDCEligibility(c));

const trades = ['D18', 'D19', 'D20', 'D21', 'D08', 'D15'];
for (const t of trades) {
  results.artisanFit[t] = {
    withoutPMEGP: checkArtisanSchemeFit(t, false),
    withPMEGP: checkArtisanSchemeFit(t, true)
  };
}

const quotes = ['3 senkda', '2.5 senkda', '4 senkda', '5 senkda', '3 saikda', '3 per 100'];
for (const q of quotes) {
  results.vernacularQuotes[q] = parseVernacularQuote(q);
}

fs.writeFileSync('.agents/teamwork/auditor_m1_fix/js_engine_results.json', JSON.stringify(results, null, 2));
console.log('JS engine results exported.');
