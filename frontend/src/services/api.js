/**
 * UdyamSetuAI API Client Service
 * Talks to the verified server (backend/app.py) on /api.
 *
 * When the server is offline, nothing is filled in from a bundled file. Each call says so
 * with `offline: true`, and the dashboard shows a red "server offline" banner. The one exception
 * is the NSFDC loan: it is worked out in the browser with the same rules as the server
 * (./nsfdcLoan.js, checked against the server's own answers in test/stage3_website.test.js).
 *
 * Statutory Mandate: MoSJE / NSFDC (SIH26091)
 */

import { offlineNsfdcLoan } from './nsfdcLoan.js';

/** The 24 business codes, D01 to D24. */
const CODE = /^D(0[1-9]|1\d|2[0-4])$/;

/** The server could not be reached (or the dev proxy found nothing on port 8000). */
export class ServerOfflineError extends Error {
  constructor(cause) {
    super('The UdyamSetuAI server is offline. Start it with: backend/.venv/bin/uvicorn backend.app:app --port 8000');
    this.name = 'ServerOfflineError';
    this.cause = cause;
  }
}

/** The server answered with an error of its own ({error, status}). */
export class ServerError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = 'ServerError';
    this.status = status;
    this.details = details;
  }
}

async function call(path, { method = 'GET', body, accept = 'application/json' } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: body === undefined ? { Accept: accept } : { 'Content-Type': 'application/json', Accept: accept },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
  } catch (err) {
    throw new ServerOfflineError(err);
  }
  if (res.ok) return res;
  const text = await res.text().catch(() => '');
  // Offline: a gateway error, or the Vite dev proxy's empty 500 when nothing listens on port 8000.
  if ([502, 503, 504].includes(res.status) || (res.status === 500 && text.trim() === '')) {
    throw new ServerOfflineError(new Error(`HTTP ${res.status}`));
  }
  let data = null;
  try { data = JSON.parse(text); } catch { /* not JSON: a crash page */ }
  if (data && (data.error || data.detail)) {
    const msg = typeof data.error === 'string' ? data.error
      : typeof data.detail === 'string' ? data.detail
      : JSON.stringify(data.detail || data.error);
    throw new ServerError(msg, res.status, data.details);
  }
  // The server answered but crashed: report it, never hide it behind browser maths.
  throw new ServerError(`Server error (HTTP ${res.status}): ${text.trim().slice(0, 200) || 'no message'}`, res.status);
}

const getJson = async (path, opts) => (await call(path, opts)).json();

/**
 * Check backend service health status.
 * @returns {Promise<Object>} the server's {status, version}, or {status:'offline', offline:true}
 */
export async function fetchHealth() {
  try {
    return await getJson('/api/health');
  } catch (err) {
    if (err instanceof ServerOfflineError) return { status: 'offline', offline: true };
    throw err;
  }
}

/**
 * NSFDC loan and quarterly schedule.
 * @param {number} projectCost - Total project cost in INR (USER INPUT).
 * @param {number} familyIncome - Annual family income in INR (USER INPUT).
 * @param {Object} options - { isSc } (USER INPUT, self-declared).
 * @returns {Promise<Object>} the server reply; offline: the same rules in the browser, with offline: true.
 */
export async function calculateNSFDCLoan(projectCost, familyIncome = 0, options = {}) {
  const payload = { projectCost: Number(projectCost), familyIncome: Number(familyIncome), isSc: options.isSc };
  try {
    return await getJson('/api/engine/nsfdc/calculate', { method: 'POST', body: payload });
  } catch (err) {
    if (err instanceof ServerOfflineError) return offlineNsfdcLoan(payload);
    throw err;
  }
}

const OFFLINE_NO_FIGURES = { offline: true, status: 'server_offline', error: 'Server offline: no figures shown.' };

/**
 * Mode A (team's archetype engine; every reply is tagged ASSUMED by the server).
 * Offline: no figures.
 */
export async function evaluateModeA(archetypeKey = 'archetype_1', scale = 1.0, options = {}) {
  try {
    return await getJson('/api/engine/mode-a/evaluate', {
      method: 'POST', body: { archetypeKey, scale: Number(scale) || 1.0, ...options }
    });
  } catch (err) {
    if (err instanceof ServerOfflineError) return { ...OFFLINE_NO_FIGURES };
    throw err;
  }
}

/**
 * Mode B moneylender debt restructuring (team's engine; tagged ASSUMED by the server).
 * Offline: no figures.
 */
export async function restructureDebt(principal, monthlyRatePct = 3.0, durationMonths = 36, options = {}) {
  try {
    return await getJson('/api/engine/mode-b/restructure', {
      method: 'POST',
      body: { principal: Number(principal), monthlyRatePct: Number(monthlyRatePct), durationMonths: Number(durationMonths), ...options }
    });
  } catch (err) {
    if (err instanceof ServerOfflineError) return { ...OFFLINE_NO_FIGURES };
    throw err;
  }
}

/**
 * The 24 businesses (code, name, verification status).
 * @returns {Promise<Object>} {count, dossiers}; offline: {count:0, dossiers:[], offline:true}
 */
export async function fetchDossiers() {
  try {
    return await getJson('/api/dossiers');
  } catch (err) {
    if (err instanceof ServerOfflineError) return { count: 0, dossiers: [], offline: true };
    throw err;
  }
}

/**
 * One business by code (e.g. 'D20').
 * @returns {Promise<Object|null>} verified data, {code, status:'not_yet_verified'}, null if unknown,
 *   or {code, status:'server_offline', offline:true}
 */
export async function fetchDossier(code) {
  if (!code) throw new Error('Dossier code is required');
  const upperCode = code.toString().trim().toUpperCase();
  if (!CODE.test(upperCode)) return null; // only D01-D24 exist; the server would answer 404
  try {
    return await getJson(`/api/dossiers/${encodeURIComponent(upperCode)}`);
  } catch (err) {
    if (err instanceof ServerOfflineError) return { code: upperCode, status: 'server_offline', offline: true };
    if (err instanceof ServerError && err.status === 404) return null;
    throw err;
  }
}

/**
 * Feasibility report (market, pricing, season, compliance, SWOT + gaps) for a business.
 */
export async function fetchFeasibility(code) {
  const upperCode = String(code || '').trim().toUpperCase();
  try {
    return await getJson(`/api/feasibility/${encodeURIComponent(upperCode)}`);
  } catch (err) {
    if (err instanceof ServerOfflineError) return { code: upperCode, status: 'server_offline', offline: true };
    throw err;
  }
}

/**
 * 1-page DPR PDF made by the server.
 * @param {{code, projectCost, familyIncome, isSc, answers?, applicantName?}} payload
 * @returns {Promise<Blob>} the PDF. Throws ServerOfflineError or ServerError (the server's message).
 */
export async function downloadDpr(payload) {
  const res = await call('/api/dpr', { method: 'POST', body: payload, accept: 'application/pdf' });
  return res.blob();
}

/**
 * Chat with the UdyamSetuAI assistant. The whole conversation is sent each time; the server keeps nothing.
 * @param {Array<{role:'user'|'assistant', content:string}>} messages
 * @returns {Promise<Object>} {status, reply, tool_results, guard, model}; offline: {status:'server_offline', reply:null, offline:true}
 */
export const CHAT_MAX_MESSAGES = 30; // backend/chat.py MAX_TURNS

export async function sendChat(messages) {
  try {
    return await getJson('/api/chat', { method: 'POST', body: { messages: messages.slice(-CHAT_MAX_MESSAGES) } });
  } catch (err) {
    if (err instanceof ServerOfflineError) return { status: 'server_offline', reply: null, offline: true };
    throw err;
  }
}

/**
 * What the dashboard should do after a chat reply, from the server's tool results:
 * select the business the assistant found, open the matching tab, and fill the loan boxes.
 * Only fields the tools returned are used; nothing is guessed.
 * @returns {{code?, tab?, loanInputs?, answers?}}
 */
export function chatRoute(toolResults) {
  const out = {};
  for (const item of Array.isArray(toolResults) ? toolResults : []) {
    const r = item && item.result;
    if (!r || typeof r !== 'object' || r.error) continue;
    if (typeof r.code === 'string' && CODE.test(r.code)) out.code = r.code;
    if (item.tool === 'calculate_loan' && typeof r.projectCost === 'number') {
      out.tab = 'amortizer';
      out.loanInputs = { projectCost: r.projectCost };
      if (typeof r.familyIncome === 'number') out.loanInputs.familyIncome = r.familyIncome;
      if (typeof r.isSc === 'boolean') out.loanInputs.isSc = r.isSc;
    } else if (item.tool === 'feasibility' && out.code) {
      out.tab = 'feasibility';
    } else if (item.tool === 'dpr_link' && r.action === 'download_dpr' && r.body && CODE.test(r.body.code)) {
      const b = r.body;
      out.code = b.code;
      out.tab = 'dpr';
      out.loanInputs = { projectCost: b.projectCost, familyIncome: b.familyIncome, isSc: b.isSc };
      if (b.answers && typeof b.answers === 'object') out.answers = b.answers;
    }
  }
  return out;
}

/**
 * Body for POST /api/dpr. Answers collected by the chat are kept with the business they belong to
 * ({code, answers}) and sent only for that business: another business's question ids are rejected.
 */
export function dprPayload({ code, projectCost, familyIncome, isSc, answers = null, applicantName = null }) {
  const out = { code, projectCost, familyIncome, isSc, answers: answers && answers.code === code ? { ...answers.answers } : {} };
  if (applicantName) out.applicantName = applicantName;
  return out;
}

/**
 * Mandi spot prices (data.gov.in / Agmarknet), from the server's GET /api/mandi-prices.
 * Teammate's feature. Only live data is shown: with no live answer (no DATA_GOV_IN_API_KEY,
 * the call failed, or the server is offline) the reply says so and carries no price.
 * (His version showed 7 fixed prices labelled "Verified Daily Mandi Rate" in that case.)
 * @param {string} [state='Uttar Pradesh']
 * @param {string} [commodity='Mustard']
 */
export async function fetchMandiPrices(state = 'Uttar Pradesh', commodity = 'Mustard') {
  try {
    return await getJson(`/api/mandi-prices?state=${encodeURIComponent(state)}&commodity=${encodeURIComponent(commodity)}`);
  } catch (err) {
    if (err instanceof ServerOfflineError) {
      return { status: 'no_live_data', isLive: false, state, commodity, modalPrice: null, records: [], offline: true,
        reason: 'Server offline: no live mandi price. NOT FOUND.' };
    }
    throw err;
  }
}

/**
 * A business's dossier figures for a project cost: the matching size (or the nearest, ASSUMED)
 * with the dossier's own printed cash-flow cover (DSCR). POST /api/dossiers/{code}/cashflow.
 */
export async function fetchDossierCashflow(code, projectCost, familyIncome, isSc) {
  const upperCode = String(code || '').trim().toUpperCase();
  try {
    return await getJson(`/api/dossiers/${encodeURIComponent(upperCode)}/cashflow`, {
      method: 'POST', body: { projectCost: Number(projectCost), familyIncome: Number(familyIncome), isSc }
    });
  } catch (err) {
    if (err instanceof ServerOfflineError) return { code: upperCode, status: 'server_offline', offline: true };
    throw err;
  }
}

export default {
  chatRoute,
  dprPayload,
  fetchHealth,
  calculateNSFDCLoan,
  evaluateModeA,
  restructureDebt,
  fetchDossiers,
  fetchDossier,
  fetchFeasibility,
  downloadDpr,
  sendChat,
  fetchMandiPrices,
  fetchDossierCashflow
};
