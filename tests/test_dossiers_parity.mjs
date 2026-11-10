/**
 * Empirical Precision Generator: Evaluates all 24 dossiers using frontend/src/engine.js
 * Outputs JSON with detailed results for both MCF and Term Loan tiers for all 24 dossiers.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  calculateNSFDCLoanStructure,
  generateNSFDCAmortizationSchedule,
  checkNSFDCEligibility
} from '../frontend/src/engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../data/dossiers_db.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const dossiers = db.dossiers || {};

const results = {};

for (const [code, d] of Object.entries(dossiers)) {
  const mcfCost = d.capex_financing?.micro_finance_tier?.project_cost || 140000;
  const termCost = d.capex_financing?.term_loan_tier?.project_cost || 500000;

  // MCF tier
  const mcfStruct = calculateNSFDCLoanStructure({ projectCost: mcfCost });
  const mcfSched = generateNSFDCAmortizationSchedule(mcfStruct);

  // Term loan tier
  const termStruct = calculateNSFDCLoanStructure({ projectCost: termCost });
  const termSched = generateNSFDCAmortizationSchedule(termStruct);

  results[code] = {
    code,
    name: d.name,
    mcf: {
      projectCost: mcfCost,
      structure: mcfStruct,
      schedule: mcfSched
    },
    term: {
      projectCost: termCost,
      structure: termStruct,
      schedule: termSched
    }
  };
}

const outPath = path.resolve(__dirname, 'js_dossiers_results.json');
fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
console.log('Successfully wrote', Object.keys(results).length, 'dossiers to', outPath);
