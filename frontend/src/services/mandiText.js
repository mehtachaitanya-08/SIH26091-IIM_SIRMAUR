/**
 * The words on Home's market-price panel (MandiPanel), kept here so every case can be tested
 * without a browser.
 *
 * WHY PLAIN WORDS: owner's hand test, 14 Nov 2026 (evening). The panel showed "NOT FOUND" and
 * "DATA_GOV_IN_API_KEY not set (environment or .env)", a server setting name in front of a farmer.
 *
 * THE HONESTY RULES STAY: a price only when data.gov.in really gave one; the state and the crop
 * link marked as assumed; nothing called "connected" or "linked" unless data.gov.in answered.
 *
 * WHAT THE SAME EVENING'S REVIEW CHANGED: the server's "reasonCode" decides the words, because
 * with the key set a failed call and an empty answer looked alike, and a wrong key would have
 * been shown as "no price reported" (finding 2). The live note is built from the arrival date,
 * never from the server's tag, which could end in "NOT FOUND" (finding 1). "Latest", not
 * "Today's": data.gov.in's first record can be days old (finding 3). An unknown key status says
 * "Checking…": every first paint used to say the server was off while it was fine (finding 4).
 *
 * SAVED PRICES (14 Nov 2026): when the server answers status "saved" (data.gov.in refuses Render, so the site shows the
 * latest price saved from the owner's laptop) the panel says so plainly: badge "Saved price", the market and the price's
 * own arrival date beside the price, the saved-on date, "not today's price", Hindi alongside, never Live, never green.
 */

/**
 * The header badge shown when the server has a data.gov.in key (App.jsx). It used to say "data.gov.in
 * connected", which was false while data.gov.in did not answer: on 14 Nov 2026, with the key saved,
 * the badge showed "connected" while every price lookup timed out. A key being added is all it knows.
 */
export const MANDI_KEY_BADGE = 'data.gov.in key added';

const NO_CROP = 'No crop linked to this business';
const SEE_AGMARKNET = 'See prices at agmarknet.gov.in';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '13/11/2026' (data.gov.in's dd/mm/yyyy, as the server sends it) as '13 Nov 2026'; null when it cannot be read. */
function dmyText(s) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(s ?? '').trim());
  if (!m || Number(m[2]) < 1 || Number(m[2]) > 12 || Number(m[1]) < 1 || Number(m[1]) > 31) return null;
  return `${Number(m[1])} ${MONTHS[Number(m[2]) - 1]} ${m[3]}`;
}

/** Every string the panel shows, for one price reply and the health check's key status (true / false / null). */
export function mandiPanelText(mandiPriceData = null, mandiKeyConfigured = null) {
  const loading = mandiPriceData === null;
  const d = mandiPriceData || {};
  const live = !loading && d.isLive && typeof d.modalPrice === 'number' ? d : null;
  const noCrop = !loading && (d.status === 'no_crop' || !d.commodity);
  const offline = !loading && (d.offline === true || d.reasonCode === 'offline');
  // The price reply knows the key status too; it can arrive before the health check does (finding 4).
  const keySet = typeof d.apiKeyConfigured === 'boolean' ? d.apiKeyConfigured : mandiKeyConfigured;

  const t = {
    title: 'Latest mandi price · ताज़ा मंडी भाव',
    badge: live ? 'Live' : loading ? 'Loading…' : 'Coming soon',
    commodityLabel: 'Crop & market',
    commodity: loading ? 'Loading…' : noCrop ? NO_CROP : `${d.commodity}${d.market ? ` (${d.market})` : ''}`,
    // 'Uttar Pradesh' mirrors the state ProductionDashboard asks for (fetchMandiPrices('Uttar Pradesh', ...)).
    commodityNote: loading || noCrop ? '—'
      : `${d.state || 'Uttar Pradesh'} (assumed) · crop picked from the team's list (assumed)`,
    priceLabel: 'Price per quintal',
    priceMain: '',
    priceNote: '',
    sourceLabel: 'Source',
    sourceMain: 'Agmarknet, Government of India',
    sourceNote: '',
    live: Boolean(live),
    saved: false
  };

  if (live) {
    t.priceMain = `₹${live.modalPrice.toLocaleString('en-IN')}`;
    t.priceNote = live.arrivalDate ? `Arrival date ${live.arrivalDate} · data.gov.in` : 'data.gov.in (no arrival date given)';
    t.sourceNote = 'Live from data.gov.in';
    return t;
  }

  // A SAVED price (backend/mandi_snapshot.py, 14 Nov 2026): the live call could not be made, and the server has the
  // latest price saved from a connection where data.gov.in answers. Checked BEFORE the loading, no-crop, offline and
  // key-status branches below, so it wins over "not connected yet" and "could not be fetched", which is what the same
  // situation used to show. It is never "Live" and never green. A reply that is incomplete (no price, or no arrival
  // date that can be read) shows nothing claimed: it falls through to the gap wording below.
  const arrivalText = dmyText(d.arrivalDate);
  if (!loading && d.status === 'saved' && d.isLive !== true && typeof d.modalPrice === 'number' && d.modalPrice > 0 && arrivalText) {
    const savedOnText = dmyText(d.savedOn);
    t.saved = true;
    t.badge = 'Saved price · सहेजा हुआ भाव';
    t.commodity = d.commodity;                       // the market is on the price line: not repeated here
    t.priceMain = `₹${d.modalPrice.toLocaleString('en-IN')}`;
    t.priceNote = `${d.market || 'Market not named'} · price of ${arrivalText}`;
    t.sourceNote = `Saved copy${savedOnText ? ` from ${savedOnText}` : ''} · not today's price · सहेजी हुई कॉपी, आज का भाव नहीं`;
    return t;
  }
  if (loading) {
    t.priceMain = 'Loading…';
    t.sourceNote = keySet === false ? 'Coming soon' : 'Checking…';
    return t;
  }
  if (noCrop) {
    t.priceMain = '—';
    t.priceNote = 'No crop is linked to this business, so there is no mandi price.';
    t.sourceNote = keySet === false ? 'Coming soon' : keySet === true ? 'Ready' : 'Checking…';
    return t;
  }
  if (offline) {
    t.priceMain = 'Price not available right now';
    t.priceNote = SEE_AGMARKNET;
    t.sourceNote = 'Not available right now';
    return t;
  }
  if (d.reasonCode === 'key_rejected') {
    // data.gov.in answered but did not accept the key (HTTP 401/403): never a saved price (the owner must notice a dead
    // key), and no technical words for a farmer: the plain "not available" wording.
    t.priceMain = 'Price not available right now';
    t.priceNote = SEE_AGMARKNET;
    t.sourceNote = 'Not available right now';
    return t;
  }
  if (keySet === false || d.reasonCode === 'no_key') {
    t.priceMain = 'Live price not connected yet';
    t.priceNote = SEE_AGMARKNET;
    t.sourceNote = 'Coming soon';
    return t;
  }
  if (d.reasonCode === 'no_records' || d.reasonCode === 'no_price') {
    // data.gov.in answered, with no usable price: only here is "no price reported" true.
    t.priceMain = 'No price reported';
    t.priceNote = SEE_AGMARKNET;
    t.sourceNote = 'Linked to data.gov.in';
    return t;
  }
  // call_failed, or a reason this page does not know: never blame the market (finding 2).
  t.priceMain = 'Price could not be fetched right now';
  t.priceNote = SEE_AGMARKNET;
  t.sourceNote = keySet === true ? 'Could not reach data.gov.in just now' : 'Checking…';
  return t;
}
