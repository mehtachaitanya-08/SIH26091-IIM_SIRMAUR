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
 */

const NO_CROP = 'No crop linked to this business';
const SEE_AGMARKNET = 'See prices at agmarknet.gov.in';

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
    live: Boolean(live)
  };

  if (live) {
    t.priceMain = `₹${live.modalPrice.toLocaleString('en-IN')}`;
    t.priceNote = live.arrivalDate ? `Arrival date ${live.arrivalDate} · data.gov.in` : 'data.gov.in (no arrival date given)';
    t.sourceNote = 'Live from data.gov.in';
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
