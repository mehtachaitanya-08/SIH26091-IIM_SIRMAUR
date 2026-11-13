/**
 * The applicant's own details for the DPR (Phase 1, Stage 1c; owner's decisions 1-18, 13 Nov 2026).
 *
 * The same fields, limits and checks as the server (backend/dpr.py parse_applicant): a website test
 * reads dpr.py and fails if they drift apart. Typed values live only in the dashboard's memory, are sent
 * with the DPR download and are never saved: this file has no network and no browser storage.
 * Aadhaar is the last 4 digits only (owner's Stage 1b decision 2); the full number never leaves the browser.
 *
 * The Hindi labels are our own wording (no source has them); to be reviewed in Stage 1d.
 */

export const TEXT_CAP = 120;
export const NAME_CAP = 80;
export const MAX_PROMOTERS = 3;

// The FIDF checklist names, exactly as the server takes them.
export const ENCLOSURES = ['Aadhaar or registration', 'land documents', 'cost abstract', 'civil-works estimates',
  'machinery quotations', 'economic viability report', 'layouts', 'bankability'];
export const ENCLOSURES_HI = {
  'Aadhaar or registration': 'आधार या पंजीकरण', 'land documents': 'भूमि दस्तावेज़', 'cost abstract': 'लागत सार',
  'civil-works estimates': 'निर्माण कार्य अनुमान', 'machinery quotations': 'मशीनरी कोटेशन',
  'economic viability report': 'आर्थिक व्यवहार्यता रिपोर्ट', layouts: 'लेआउट', bankability: 'बैंक योग्यता',
};

// kind: text | long (a few lines) | date (picker; sent DD-MM-YYYY) | aadhaar (last 4) | yesno
// sd: printed "self-declared" on the PDF, so said on screen too (decision 11)
export const GROUPS = [
  { id: 'applicant', en: 'Applicant', hi: 'आवेदक' },
  { id: 'addresses', en: 'Addresses', hi: 'पते' },
  { id: 'contact', en: 'Contact', hi: 'संपर्क' },
  { id: 'promoters', en: 'Promoters', hi: 'प्रवर्तक' },
  { id: 'history', en: 'History and banking', hi: 'अनुभव और बैंकिंग' },
  { id: 'project', en: 'Project', hi: 'परियोजना' },
  { id: 'land', en: 'Land', hi: 'भूमि' },
  { id: 'operations', en: 'Operations', hi: 'संचालन' },
  { id: 'enclosures', en: 'Enclosures', hi: 'संलग्नक' },
  { id: 'signing', en: 'Signing', hi: 'हस्ताक्षर' },
];

const f = (key, group, en, hi, kind = 'text', sd = false) => ({ key, group, en, hi, kind, sd });

export const FIELDS = [
  f('name', 'applicant', 'Name of the applicant', 'आवेदक का नाम'),
  f('entityType', 'applicant', 'Entity type', 'इकाई का प्रकार'),
  f('legalStatus', 'applicant', 'Legal status', 'कानूनी स्थिति'),
  f('registrationNo', 'applicant', 'Registration (Udyam / CIN)', 'पंजीकरण (उद्यम / CIN)', 'text', true),
  f('dateOfEstablishment', 'applicant', 'Date of establishment', 'स्थापना की तिथि', 'date'),
  f('gstin', 'applicant', 'GSTIN', 'जीएसटीआईएन', 'text', true),
  f('pan', 'applicant', 'PAN', 'पैन', 'text', true),
  f('aadhaarLast4', 'applicant', 'Aadhaar', 'आधार', 'aadhaar', true),
  f('isWoman', 'applicant', 'Lead promoter is a woman', 'मुख्य प्रवर्तक महिला हैं', 'yesno'),
  f('isMinority', 'applicant', 'Lead promoter is from a minority community', 'मुख्य प्रवर्तक अल्पसंख्यक समुदाय से हैं', 'yesno'),
  f('registeredAddress', 'addresses', 'Registered address', 'पंजीकृत पता', 'long'),
  f('siteAddress', 'addresses', 'Site address', 'साइट का पता', 'long'),
  f('village', 'addresses', 'Village', 'गाँव'),
  f('block', 'addresses', 'Block', 'ब्लॉक'),
  f('district', 'addresses', 'District', 'ज़िला'),
  f('state', 'addresses', 'State', 'राज्य'),
  f('pin', 'addresses', 'PIN code', 'पिन कोड'),
  f('mobile', 'contact', 'Mobile', 'मोबाइल'),
  f('email', 'contact', 'Email', 'ईमेल'),          // the PDF adds its own note: neither bank form asks for it
  f('experience', 'history', 'Relevant experience', 'संबंधित अनुभव', 'long'),
  f('turnoverHistory', 'history', 'Year-wise turnover', 'वर्षवार कारोबार', 'long'),
  f('existingLoans', 'history', 'Existing loans and credit facilities', 'मौजूदा ऋण और ऋण सुविधाएँ', 'long'),
  f('gstReturns', 'history', 'GST returns', 'जीएसटी रिटर्न'),
  f('objective', 'project', 'Objectives of the project', 'परियोजना के उद्देश्य', 'long'),
  f('infrastructureCategory', 'project', 'Category of infrastructure', 'अवसंरचना की श्रेणी'),
  f('processFlow', 'project', 'Process flow', 'प्रक्रिया का क्रम', 'long'),
  f('constructionTimeline', 'project', 'Construction timeline', 'निर्माण की समय-सीमा', 'long'),
  f('startDate', 'project', 'Start date', 'शुरू होने की तिथि', 'date'),
  f('milestones', 'project', 'Milestones', 'मुख्य पड़ाव', 'long'),
  f('layout', 'project', 'Layout', 'लेआउट', 'long'),
  f('landArea', 'land', 'Land area', 'भूमि का क्षेत्रफल'),
  f('landTitle', 'land', 'Title / ownership', 'स्वामित्व'),
  f('leaseDetails', 'land', 'Lease details', 'पट्टे का विवरण'),
  f('coordinates', 'land', 'Coordinates', 'निर्देशांक'),
  f('changeOfLandUse', 'land', 'Change of land use', 'भूमि उपयोग में परिवर्तन'),
  f('distanceStateHighway', 'land', 'Distance to state highway', 'राज्य राजमार्ग से दूरी'),
  f('distanceNationalHighway', 'land', 'Distance to national highway', 'राष्ट्रीय राजमार्ग से दूरी'),
  f('water', 'land', 'Water', 'पानी'),
  f('power', 'land', 'Power', 'बिजली'),
  f('rawMaterial', 'operations', 'Raw material available in the catchment', 'आसपास उपलब्ध कच्चा माल', 'long'),
  f('catchment', 'operations', 'Catchment', 'सेवा क्षेत्र', 'long'),
  f('employment', 'operations', 'Employment (people)', 'रोज़गार (लोग)'),
  f('renewableEnergy', 'operations', 'Renewable energy', 'नवीकरणीय ऊर्जा', 'long'),
  f('suppliers', 'operations', 'Suppliers of plant and machinery', 'संयंत्र और मशीनरी के आपूर्तिकर्ता', 'long'),
  f('place', 'signing', 'Place', 'स्थान'),
  f('date', 'signing', 'Date', 'तिथि', 'date'),
];

export const PROMOTER_FIELDS = [
  f('name', 'promoters', 'Name', 'नाम'),
  f('aadhaarLast4', 'promoters', 'Aadhaar', 'आधार', 'aadhaar', true),
  f('pan', 'promoters', 'PAN', 'पैन', 'text', true),
  f('qualification', 'promoters', 'Qualification', 'योग्यता'),
  f('netWorth', 'promoters', 'Net worth', 'कुल संपत्ति'),
  f('din', 'promoters', 'DIN (company director number)', 'डीआईएन'),
  f('creditRating', 'promoters', 'Credit rating', 'क्रेडिट रेटिंग'),
  f('shareholding', 'promoters', 'Shareholding', 'शेयरधारिता'),
  f('mobile', 'promoters', 'Mobile', 'मोबाइल'),
  f('isWoman', 'promoters', 'Woman', 'महिला', 'yesno'),
  f('isMinority', 'promoters', 'Minority community', 'अल्पसंख्यक समुदाय', 'yesno'),
];

const blank = (fields) => Object.fromEntries(fields.map((x) => [x.key, '']));

export function emptyPromoter() {
  return blank(PROMOTER_FIELDS);
}

/** A fresh form: every box empty, one empty promoter, then the account pre-fill (name, district). */
export function emptyApplicant(prefill = {}) {
  return { ...blank(FIELDS), promoters: [emptyPromoter()], enclosures: [], ...prefill };
}

/** Decision 4: only the account's name and district. */
export function accountPrefill(user) {
  return { name: String(user?.name ?? ''), district: String(user?.district ?? '') };
}

/** Decision 14b: an account change updates the pre-filled boxes the user has not edited. */
export function withAccount(values, prefill, edited) {
  const out = { ...values };
  for (const [k, v] of Object.entries(prefill)) if (!edited.has(k)) out[k] = v;
  return out;
}

export const chars = (s) => [...String(s ?? '').trim()].length;   // counted as the server (Python) counts
export const capOf = (x) => (x.key === 'name' ? NAME_CAP : TEXT_CAP);
const clean = (v) => String(v ?? '').trim();
const AADHAAR = /^[0-9]{4}$/;                     // English digits only, as the server

/** One box's problem, or null: shown under the box as it is typed, and again before sending. */
export function fieldProblem(x, value) {
  const v = clean(value);
  if (!v || x.kind === 'yesno') return null;
  const cap = capOf(x);
  if (chars(v) > cap) {
    return { message: `${x.en}: at most ${cap} characters (now ${chars(v)}).`, hi: `${x.hi}: अधिकतम ${cap} अक्षर (अभी ${chars(v)})।` };
  }
  if (x.kind === 'aadhaar' && !AADHAAR.test(v)) {
    return { message: `${x.en}: only the last 4 digits (0-9), never the full number.`, hi: `${x.hi}: केवल अंतिम 4 अंक (0-9), पूरा नंबर कभी नहीं।` };
  }
  return null;
}

function checkFields(obj, fields, where, out) {
  for (const x of fields) {
    const p = fieldProblem(x, obj[x.key]);
    if (p) out.push({ key: `${where}${x.key}`, ...p });
  }
}

const filledPromoter = (p) => PROMOTER_FIELDS.some((x) => clean(p?.[x.key]));

/** The server's checks, in the browser: [] when all is well, else [{key, message}]. */
export function checkApplicant(values) {
  const out = [];
  checkFields(values, FIELDS, '', out);
  const promoters = (values.promoters || []).filter(filledPromoter);
  if (promoters.length > MAX_PROMOTERS) {
    out.push({ key: 'promoters', message: `At most ${MAX_PROMOTERS} promoters.`, hi: `अधिकतम ${MAX_PROMOTERS} प्रवर्तक।` });
  }
  (values.promoters || []).forEach((p, i) => {
    if (!filledPromoter(p)) return;
    const before = out.length;
    checkFields(p, PROMOTER_FIELDS, `promoters.${i}.`, out);
    for (const x of out.slice(before)) { x.message = `Promoter ${i + 1}, ${x.message}`; x.hi = `प्रवर्तक ${i + 1}, ${x.hi}`; }
  });
  const bad = (values.enclosures || []).filter((e) => !ENCLOSURES.includes(e));
  if (bad.length) out.push({ key: 'enclosures', message: `Unknown enclosure: ${bad.join(', ')}.`, hi: `अज्ञात संलग्नक: ${bad.join(', ')}।` });
  return out;
}

/** Review finding 4: the heading over the problems: the form's own, or the server's. */
export function problemTitle(problems, hi = false) {
  const formProblem = (problems || []).some((p) => p.key !== 'server');
  if (formProblem) return hi ? 'नहीं भेजा गया। कृपया ठीक करें / Not sent. Please fix:' : 'Not sent. Please fix:';
  return hi ? 'सर्वर डीपीआर नहीं बना सका / The server could not make the DPR:' : 'The server could not make the DPR:';
}

const ddmmyyyy = (v) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : v;
};

function pack(obj, fields) {
  const out = {};
  for (const x of fields) {
    const v = clean(obj[x.key]);
    if (x.kind === 'yesno') {
      if (v === 'yes') out[x.key] = true;
      else if (v === 'no') out[x.key] = false;        // "not said" (empty) is not sent
    } else if (v) {
      out[x.key] = x.kind === 'date' ? ddmmyyyy(v) : v;
    }
  }
  return out;
}

/** What is sent: trimmed, empty boxes and empty promoters dropped, dates DD-MM-YYYY. */
export function applicantPayload(values) {
  const out = pack(values, FIELDS);
  const promoters = (values.promoters || []).filter(filledPromoter).map((p) => pack(p, PROMOTER_FIELDS));
  if (promoters.length) out.promoters = promoters;
  const encl = (values.enclosures || []).filter((e) => ENCLOSURES.includes(e));
  if (encl.length) out.enclosures = ENCLOSURES.filter((e) => encl.includes(e));
  return out;
}
