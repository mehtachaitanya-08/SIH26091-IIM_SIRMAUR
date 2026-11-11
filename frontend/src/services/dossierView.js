/**
 * Turns the server's dossier replies into what the dashboard shows. No figure is made up here:
 * every number is the server's, passed through with its label ("D08 dossier"), or NOT FOUND.
 */

/** One button per dossier size (Micro first, as the dossier lists them). */
export function tierOptions(dossier) {
  return (dossier?.tiers || []).map((t) => {
    const pc = t.project_cost || {};
    const has = typeof pc.value === 'number';
    return { label: t.label, cost: has ? pc.value : null, tag: has ? pc.tag : null, disabled: !has, reason: has ? null : (pc.reason || 'NOT FOUND') };
  });
}

/** The cost the loan tab starts with: the first size that has one (Micro first), or null. */
export function defaultTierCost(dossier) {
  const first = tierOptions(dossier).find((o) => !o.disabled);
  return first ? first.cost : null;
}

/** 12 bars, April first; height relative to the highest month; the 3 leanest months marked. Null if NOT FOUND. */
export function seasonBars(seasonality) {
  const months = seasonality?.months;
  if (!Array.isArray(months) || months.length !== 12) return null;
  const max = Math.max(...months.map((m) => m.value));
  const leanest = new Set([...months].sort((a, b) => a.value - b.value).slice(0, 3).map((m) => m.month));
  return months.map((m) => ({
    month: m.month, value: m.value, tag: m.tag,
    heightPct: Math.round((m.value / max) * 100), lean: leanest.has(m.month)
  }));
}

/** The dossier's own printed DSCR, Year 1-3, from POST /api/dossiers/{code}/cashflow. */
export function dscrRows(reply) {
  if (!reply) return { status: 'waiting', rows: [] };
  if (reply.offline) return { status: 'offline', rows: [] };
  if (reply.status !== 'ok') return { status: 'NOT FOUND', reason: reply.reason || 'NOT FOUND', rows: [] };
  return {
    status: 'ok',
    rows: reply.dscr.years.map((y) => (typeof y.value === 'number'
      ? { year: y.year, text: `${y.value.toFixed(2)}x`, tag: y.tag }
      : { year: y.year, text: 'NOT FOUND', tag: null }))
  };
}

/** The 5 steps of the dashboard flow, with the tab each opens and whether the user has done it. */
export function flowSteps({ code, projectCost, familyIncome, isSc, loanReady }) {
  return [
    { n: 1, label: 'Choose your business', tab: 'feasibility', done: Boolean(code) },
    { n: 2, label: 'Choose a size or type your cost', tab: 'amortizer', done: projectCost !== '' && projectCost != null },
    { n: 3, label: 'Your details (income, SC)', tab: 'amortizer', done: familyIncome !== '' && familyIncome != null && typeof isSc === 'boolean' },
    { n: 4, label: 'See loan, season and cover', tab: 'simulator', done: Boolean(loanReady) },
    { n: 5, label: 'Download the 1-page DPR', tab: 'dpr', done: false }
  ];
}
