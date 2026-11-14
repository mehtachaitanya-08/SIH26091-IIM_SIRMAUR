import React, { useState, useEffect, useMemo } from 'react';
import { Check } from 'lucide-react';
import { updateUser, getCurrentSession, saveOnboardingProfile, consentRecord } from '../data/userDatabase.js';
import { POLICY_VERSION } from '../content/privacyPolicy.js';

export const CATALOG_TRADES = [
  { code: 'D01', nameEn: 'Village FMCG Retail', nameHi: 'ग्रामीण किराना एवं प्रोविजन स्टोर', sectorEn: 'Retail & Trading', sectorHi: 'खुदरा व व्यापार', icon: '', tier: '₹1.3L – ₹5.6L' },
  { code: 'D02', nameEn: 'Periodic Haat Mobile Trade', nameHi: 'साप्ताहिक हाट मोबाइल व्यापार', sectorEn: 'Retail & Trading', sectorHi: 'खुदरा व व्यापार', icon: '', tier: '₹80k – ₹2.5L' },
  { code: 'D03', nameEn: 'Rural Electronics Recharge', nameHi: 'ग्रामीण इलेक्ट्रॉनिक्स व मोबाइल सेवा', sectorEn: 'Retail & Trading', sectorHi: 'खुदरा व व्यापार', icon: '', tier: '₹1.0L – ₹3.5L' },
  { code: 'D04', nameEn: 'Seeds Fertiliser', nameHi: 'बीज एवं उर्वरक केंद्र', sectorEn: 'Retail & Trading', sectorHi: 'खुदरा व व्यापार', icon: '', tier: '₹2.0L – ₹8.0L' },
  { code: 'D05', nameEn: 'Animal Feed', nameHi: 'पशु आहार एवं चारा प्रसंस्करण', sectorEn: 'Agro-Processing', sectorHi: 'कृषि प्रसंस्करण', icon: '', tier: '₹1.5L – ₹5.0L' },
  { code: 'D06', nameEn: 'Farm Hardware Drip', nameHi: 'कृषि उपकरण व ड्रिप सिंचाई', sectorEn: 'Retail & Trading', sectorHi: 'खुदरा व व्यापार', icon: '', tier: '₹1.8L – ₹6.0L' },
  { code: 'D07', nameEn: 'Grain Dal Milling', nameHi: 'अनाज एवं दाल प्रसंस्करण मिल', sectorEn: 'Agro-Processing', sectorHi: 'कृषि प्रसंस्करण', icon: '', tier: '₹2.5L – ₹12.0L' },
  { code: 'D08', nameEn: 'Oil Expellers', nameHi: 'सरसों एवं खाद्य तेल स्पेलर मिल', sectorEn: 'Agro-Processing', sectorHi: 'कृषि प्रसंस्करण', icon: '', tier: '₹3.0L – ₹15.0L' },
  { code: 'D09', nameEn: 'Spice Grinding', nameHi: 'मसाला पिसाई एवं पैकेजिंग इकाई', sectorEn: 'Agro-Processing', sectorHi: 'कृषि प्रसंस्करण', icon: '', tier: '₹1.5L – ₹6.0L' },
  { code: 'D10', nameEn: 'Horticultural Dehydration', nameHi: 'फल व सब्जी निर्जलीकरण इकाई', sectorEn: 'Agro-Processing', sectorHi: 'कृषि प्रसंस्करण', icon: '', tier: '₹2.0L – ₹8.5L' },
  { code: 'D11', nameEn: 'Commercial Bovine Dairy', nameHi: 'वाणिज्यिक गोवंशीय डेयरी इकाई', sectorEn: 'Livestock & Poultry', sectorHi: 'पशुपालन व पोल्ट्री', icon: '', tier: '₹3.5L – ₹18.0L' },
  { code: 'D12', nameEn: 'Commercial Goat Meat Husbandry', nameHi: 'वाणिज्यिक बकरी पालन इकाई', sectorEn: 'Livestock & Poultry', sectorHi: 'पशुपालन व पोल्ट्री', icon: '', tier: '₹1.2L – ₹5.0L' },
  { code: 'D13', nameEn: 'Commercial Broiler Poultry', nameHi: 'वाणिज्यिक ब्रॉयलर पोल्ट्री फार्म', sectorEn: 'Livestock & Poultry', sectorHi: 'पशुपालन व पोल्ट्री', icon: '', tier: '₹2.0L – ₹10.0L' },
  { code: 'D14', nameEn: 'Inland Freshwater Aquaculture', nameHi: 'मीठे पानी में मत्स्य पालन', sectorEn: 'Livestock & Poultry', sectorHi: 'पशुपालन व पोल्ट्री', icon: '', tier: '₹2.5L – ₹12.0L' },
  { code: 'D15', nameEn: 'Tractor Garage', nameHi: 'ट्रैक्टर एवं कृषि मशीनरी गैराज', sectorEn: 'Machinery & Services', sectorHi: 'मशीनरी व सेवाएं', icon: '', tier: '₹1.5L – ₹6.5L' },
  { code: 'D16', nameEn: 'Motor Rewinding', nameHi: 'इलेक्ट्रिक मोटर व पंप मरम्मत', sectorEn: 'Machinery & Services', sectorHi: 'मशीनरी व सेवाएं', icon: '', tier: '₹1.0L – ₹4.0L' },
  { code: 'D17', nameEn: 'Auto EV Workshop', nameHi: 'ऑटो / ई-रिक्शा वर्कशॉप व चार्जिंग', sectorEn: 'Machinery & Services', sectorHi: 'मशीनरी व सेवाएं', icon: '', tier: '₹1.8L – ₹7.5L' },
  { code: 'D18', nameEn: 'Tailoring', nameHi: 'ग्रामीण सिलाई एवं रेडीमेड गारमेंट्स', sectorEn: 'Crafts & Fabrication', sectorHi: 'शिल्प व कारीगरी', icon: '', tier: '₹80k – ₹3.5L' },
  { code: 'D19', nameEn: 'Carpentry', nameHi: 'काष्ठकला एवं फर्नीचर निर्माण', sectorEn: 'Crafts & Fabrication', sectorHi: 'शिल्प व कारीगरी', icon: '', tier: '₹1.2L – ₹5.0L' },
  { code: 'D20', nameEn: 'Metal Smithy', nameHi: 'लोहार कार्य एवं कृषि उपकरण निर्माण', sectorEn: 'Crafts & Fabrication', sectorHi: 'शिल्प व कारीगरी', icon: '', tier: '₹1.4L – ₹5.5L' },
  { code: 'D21', nameEn: 'Pottery', nameHi: 'पारंपरिक कुम्हारी एवं मिट्टी उत्पाद', sectorEn: 'Crafts & Fabrication', sectorHi: 'शिल्प व कारीगरी', icon: '', tier: '₹60k – ₹2.5L' },
  { code: 'D22', nameEn: 'Fly Ash Bricks', nameHi: 'फ्लाई ऐश ईंट निर्माण इकाई', sectorEn: 'Green & Circular', sectorHi: 'हरित व चक्रीय', icon: '', tier: '₹4.0L – ₹20.0L' },
  { code: 'D23', nameEn: 'Vermicompost', nameHi: 'जैविक केंचुआ खाद इकाई', sectorEn: 'Green & Circular', sectorHi: 'हरित व चक्रीय', icon: '', tier: '₹1.0L – ₹4.5L' },
  { code: 'D24', nameEn: 'Rural Freight Custom Hiring', nameHi: 'ग्रामीण माल ढुलाई व कस्टम हायरिंग', sectorEn: 'Machinery & Services', sectorHi: 'मशीनरी व सेवाएं', icon: '', tier: '₹3.0L – ₹14.0L' },
];

export const CASTE_CATEGORIES = [
  { code: 'SC', labelEn: 'Scheduled Caste (SC)', labelHi: 'अनुसूचित जाति (SC)', descEn: 'NSFDC concessional loans; PMEGP special category', descHi: 'NSFDC रियायती ऋण; PMEGP विशेष श्रेणी' },
  { code: 'ST', labelEn: 'Scheduled Tribe (ST)', labelHi: 'अनुसूचित जनजाति (ST)', descEn: 'NSTFDC concessional loans; PMEGP special category', descHi: 'NSTFDC रियायती ऋण; PMEGP विशेष श्रेणी' },
  { code: 'OBC', labelEn: 'Other Backward Classes (OBC)', labelHi: 'अन्य पिछड़ा वर्ग (OBC)', descEn: 'NBCFDC loans; PMEGP special category', descHi: 'NBCFDC ऋण; PMEGP विशेष श्रेणी' },
  { code: 'General', labelEn: 'General Category', labelHi: 'सामान्य वर्ग', descEn: 'PMEGP, PM MUDRA and PMFME', descHi: 'PMEGP, पीएम मुद्रा एवं PMFME' },
  { code: 'EWS', labelEn: 'Economically Weaker Section (EWS)', labelHi: 'आर्थिक रूप से कमजोर वर्ग (EWS)', descEn: 'PMEGP and PM MUDRA', descHi: 'PMEGP एवं पीएम मुद्रा' },
  { code: 'Minority', labelEn: 'Minority Community', labelHi: 'अल्पसंख्यक समुदाय', descEn: 'NMDFC loans; PMEGP special category', descHi: 'NMDFC ऋण; PMEGP विशेष श्रेणी' },
];

// All 28 states and 8 Union Territories (it listed 20 states, so applicants from Delhi, Goa,
// the North-East or J&K could not pick their own; review, 14 Nov 2026).
export const MAJOR_STATES = [
  'Uttar Pradesh',
  'Bihar',
  'Madhya Pradesh',
  'Rajasthan',
  'Maharashtra',
  'West Bengal',
  'Odisha',
  'Jharkhand',
  'Chhattisgarh',
  'Gujarat',
  'Haryana',
  'Punjab',
  'Karnataka',
  'Tamil Nadu',
  'Andhra Pradesh',
  'Telangana',
  'Kerala',
  'Assam',
  'Uttarakhand',
  'Himachal Pradesh',
  'Arunachal Pradesh',
  'Goa',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

export const COST_PRESETS = [
  { label: '₹1.0L', value: 100000 },
  { label: '₹1.4L', value: 140000 },
  { label: '₹2.5L', value: 250000 },
  { label: '₹5.0L', value: 500000 },
  { label: '₹10.0L', value: 1000000 },
  { label: '₹20.0L', value: 2000000 }
];

export function sanitizePhone(input) {
  let cleaned = String(input || '').replace(/\D/g, '');
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
}

export function validatePhone(phone) {
  const cleaned = sanitizePhone(phone);
  return /^[6-9]\d{9}$/.test(cleaned);
}

export function translateSector(sector, targetLang) {
  if (!sector || sector === 'All') return 'All';
  const found = CATALOG_TRADES.find((t) => t.sectorEn === sector || t.sectorHi === sector);
  if (!found) return 'All';
  return targetLang === 'hi' ? found.sectorHi : found.sectorEn;
}

export function getFilteredTrades(trades = CATALOG_TRADES, filter = 'All', lang = 'hi') {
  if (!filter || filter === 'All') return trades;
  const matches = trades.filter((t) => {
    const activeSec = lang === 'hi' ? t.sectorHi : t.sectorEn;
    return activeSec === filter || t.sectorHi === filter || t.sectorEn === filter;
  });
  return matches.length > 0 ? matches : trades;
}

export function validateIncome(income) {
  if (income === '' || income === null || income === undefined) return true;
  const num = Number(income);
  return Number.isFinite(num) && num >= 0;
}

export function clampIncome(income) {
  const num = Number(income);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.max(0, num);
}

// ---------------------------------------------------------------------------
// Shared styles: the landing page's look (cream ground, ink, Instrument Serif headings,
// Space Grotesk labels, green only for focus and links).
// ---------------------------------------------------------------------------
const inputCls = (hasError) => `w-full px-4 py-2.5 rounded-xl border text-sm text-[#111311] bg-white placeholder:text-[#686D65]/60 focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 focus:border-[#0E7A53] transition-colors ${
  hasError ? 'border-red-400' : 'border-black/15'
}`;
const labelCls = 'block text-xs font-semibold text-[#111311] mb-1.5';
const hintCls = 'text-[11px] text-[#686D65] leading-snug';
const eyebrowCls = 'text-[10px] font-mono-num uppercase tracking-widest text-[#686D65]';
const choiceCls = (selected) => `w-full text-left p-3 rounded-2xl border transition-colors cursor-pointer ${
  selected ? 'border-[#111311] bg-[#F8F6F0]' : 'border-black/10 bg-white hover:border-black/30'
}`;

function Mark({ on }) {
  return (
    <span
      aria-hidden="true"
      className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
        on ? 'bg-[#111311] border-[#111311] text-white' : 'border-black/25 bg-white'
      }`}
    >
      {on && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
    </span>
  );
}

function ToggleRow({ checked, onChange, label, sub }) {
  return (
    <label className={`${choiceCls(checked)} flex items-center justify-between gap-3`}>
      <span>
        <span className="block text-xs font-semibold text-[#111311]">{label}</span>
        {sub && <span className={`block ${hintCls} mt-0.5`}>{sub}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-[#111311] flex-shrink-0 cursor-pointer"
      />
    </label>
  );
}

function FieldError({ text }) {
  return text ? <p role="alert" className="text-xs text-red-700 mt-1 font-semibold">{text}</p> : null;
}

export default function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  currentUser = null,
  initialLanguage = 'hi',
  onOpenPrivacy,
  onUserUpdated
}) {
  const [lang, setLang] = useState(initialLanguage);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Step 1: Identity
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: About you. Nothing is pre-chosen: caste and income are sensitive and optional
  // (DPDP Act; they used to start as "SC" and ₹1.8 lakh, which read as the user's own answers).
  const [casteCategory, setCasteCategory] = useState('');
  const [isWoman, setIsWoman] = useState(false);
  const [isArtisan, setIsArtisan] = useState(false);
  const [isDivyang, setIsDivyang] = useState(false);
  const [annualIncome, setAnnualIncome] = useState('');

  // Step 3: Place and budget
  const [stateName, setStateName] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('');
  const [locationType, setLocationType] = useState('rural');
  const [projectCost, setProjectCost] = useState('250000');
  const [promoterEquity, setPromoterEquity] = useState('25000');
  const [hasMoneylenderDebt, setHasMoneylenderDebt] = useState(false);
  const [debtPrincipal, setDebtPrincipal] = useState('50000');
  const [debtRateQuote, setDebtRateQuote] = useState('3 senkda');
  const [debtMonthsActive, setDebtMonthsActive] = useState('12');

  // Step 4: Business
  const [isCustomTrade, setIsCustomTrade] = useState(false);
  const [selectedTradeCode, setSelectedTradeCode] = useState('D01');
  const [customTradeIdea, setCustomTradeIdea] = useState('');
  const [tradeFilter, setTradeFilter] = useState('All');
  const [consent, setConsent] = useState(false);

  // Hydrate from currentUser if provided
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setName(currentUser.name);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.casteCategory) {
        setCasteCategory(currentUser.casteCategory);
      } else if (currentUser.category) {
        // "Not SC" says only what the person is not, so it pre-selects nothing (it used to match
        // "SC" and pre-select Scheduled Caste).
        const c = currentUser.category;
        if (c.startsWith('Not')) setCasteCategory('');
        else if (c.includes('(SC)') || c === 'SC') setCasteCategory('SC');
        else if (c.includes('(ST)') || c === 'ST') setCasteCategory('ST');
        else if (c.includes('OBC')) setCasteCategory('OBC');
        else if (c.includes('Minority')) setCasteCategory('Minority');
        else if (c.includes('EWS')) setCasteCategory('EWS');
        else if (c.includes('General')) setCasteCategory('General');
      }
      if (currentUser.income !== null && currentUser.income !== undefined) setAnnualIncome(String(currentUser.income));
      else if (currentUser.annualIncome !== null && currentUser.annualIncome !== undefined) setAnnualIncome(String(currentUser.annualIncome));
      if (currentUser.district) setDistrict(currentUser.district);
      if (currentUser.state) setStateName(currentUser.state);
      if (currentUser.isWoman !== undefined) setIsWoman(Boolean(currentUser.isWoman));
      if (currentUser.isArtisan !== undefined) setIsArtisan(Boolean(currentUser.isArtisan));
      if (currentUser.isDivyang !== undefined) setIsDivyang(Boolean(currentUser.isDivyang));
      if (currentUser.locationType) setLocationType(currentUser.locationType);
      if (currentUser.sensitiveDataConsent) setConsent(true);
      if (currentUser.trade) {
        const match = currentUser.trade.match(/^D\d{2}/i);
        if (match) setSelectedTradeCode(match[0].toUpperCase());
      }
    }
  }, [currentUser]);

  // Synchronize tradeFilter whenever language changes
  useEffect(() => {
    setTradeFilter((prev) => translateSector(prev, lang));
  }, [lang]);

  const sectors = useMemo(() => {
    const list = ['All'];
    CATALOG_TRADES.forEach((t) => {
      const sec = lang === 'hi' ? t.sectorHi : t.sectorEn;
      if (!list.includes(sec)) list.push(sec);
    });
    return list;
  }, [lang]);

  const filteredTrades = useMemo(() => {
    return getFilteredTrades(CATALOG_TRADES, tradeFilter, lang);
  }, [tradeFilter, lang]);

  if (!isOpen) return null;

  const t = {
    hi: {
      modalTitle: 'अपनी प्रोफ़ाइल बनाएँ',
      modalSubtitle: 'चार छोटे चरण। इससे हम आपके लिए योजनाएँ, ऋण और DPR तैयार करते हैं। सब कुछ केवल इसी डिवाइस पर सहेजा जाता है।',
      stepOf: (n) => `चरण ${n} / 4`,
      step1: '1. पहचान',
      step2: '2. आपके बारे में',
      step3: '3. स्थान व बजट',
      step4: '4. व्यवसाय',
      nameLabel: 'आवेदक का पूरा नाम',
      namePlaceholder: 'उदा. राम कुमार / सुनीता देवी',
      phoneLabel: '10 अंकों का मोबाइल नंबर',
      phonePlaceholder: '9876543210',
      phoneError: 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू)',
      nameError: 'कृपया कम से कम 2 अक्षरों का नाम दर्ज करें',
      identityNote: 'आपका नाम और मोबाइल नंबर DPR (विस्तृत परियोजना रिपोर्ट) पर छपते हैं।',
      categoryLabel: 'सामाजिक वर्ग',
      categoryNote: 'वैकल्पिक। केवल यह दिखाने के लिए कि कौन-सी योजनाएँ आप पर लागू हो सकती हैं। हम इसकी जाँच नहीं करते।',
      preferNot: 'नहीं बताना चाहते',
      preferNotSub: 'वर्ग पर निर्भर योजनाएँ नहीं दिखेंगी',
      togglesHeading: 'जो आप पर लागू हो (वैकल्पिक)',
      womanLabel: 'महिला उद्यमी',
      womanSub: 'महिलाओं के लिए विशेष योजनाएँ और PMEGP विशेष श्रेणी',
      artisanLabel: 'पारंपरिक कारीगर / शिल्पकार',
      artisanSub: 'पीएम विश्वकर्मा के 18 पारंपरिक शिल्प',
      divyangLabel: 'दिव्यांगजन',
      divyangSub: 'PMEGP विशेष श्रेणी',
      incomeLabel: 'वार्षिक पारिवारिक आय (₹)',
      incomeNote: 'वैकल्पिक। कई योजनाओं की आय सीमा होती है (जैसे NSFDC ₹5 लाख तक)।',
      incomeError: 'कृपया वैध वार्षिक आय दर्ज करें (₹0 या अधिक)',
      perYear: 'लाख प्रति वर्ष',
      stateLabel: 'राज्य / केंद्र शासित प्रदेश',
      districtLabel: 'ज़िला',
      districtPlaceholder: 'उदा. वाराणसी',
      districtError: 'कृपया अपना ज़िला दर्ज करें',
      locationLabel: 'क्षेत्र',
      rural: 'ग्रामीण',
      ruralSub: 'PMEGP में अधिक सब्सिडी (25% / विशेष श्रेणी 35%)',
      urban: 'शहरी',
      urbanSub: 'PMEGP सब्सिडी 15% / विशेष श्रेणी 25%',
      costLabel: 'अनुमानित परियोजना लागत (₹)',
      costChips: 'जल्दी चुनें',
      costError: 'कृपया वैध परियोजना लागत दर्ज करें (कम से कम ₹10,000)',
      equityLabel: 'आपकी अपनी बचत जो आप लगा सकते हैं (₹)',
      equityNote: 'PMEGP में विशेष श्रेणी के लिए 5% और सामान्य के लिए 10% अपना हिस्सा।',
      debtCheck: 'क्या आप पर किसी साहूकार या महाजन का कर्ज़ है?',
      debtHeading: 'हम दिखाएँगे कि बैंक ऋण से यह कितना सस्ता पड़ सकता है',
      debtPrincipalLabel: 'बकाया मूलधन (₹)',
      debtRateLabel: 'ब्याज दर, जैसे साहूकार बताता है',
      debtRatePlaceholder: 'उदा. 3 सेंकड़ा (3% प्रति माह) या 36% सालाना',
      debtMonthsLabel: 'कितने महीनों से चल रहा है',
      intentHeading: 'आप कौन-सा व्यवसाय शुरू करना चाहते हैं?',
      catalogTab: 'हमारे 24 व्यवसायों में से',
      customTab: 'अपना विचार लिखें',
      allSectors: 'सभी',
      customLabel: 'व्यवसाय का विचार',
      customPlaceholder: 'उदा. सोलर पंप मरम्मत, मशरूम की खेती और पैकिंग...',
      customNote: 'नए विचार के आँकड़े हमारे सबसे मिलते-जुलते शोधित व्यवसायों से अनुमानित होते हैं, इसलिए इन्हें मोटा अनुमान मानें।',
      customError: 'कृपया अपना व्यावसायिक विचार लिखें',
      consentA: 'मैंने ',
      consentLink: 'गोपनीयता नीति',
      consentB: ' पढ़ ली है और योजनाएँ व ऋण दिखाने के लिए ऊपर दी गई जानकारी (वर्ग, दिव्यांगता, आय और कर्ज़ सहित) के उपयोग की सहमति देता/देती हूँ।',
      consentError: 'सहेजने के लिए कृपया सहमति दें।',
      back: 'पीछे',
      next: 'आगे',
      finish: 'सहेजें और डैशबोर्ड खोलें'
    },
    en: {
      modalTitle: 'Set up your profile',
      modalSubtitle: 'Four short steps. We use them to match schemes, size your loan and fill in your DPR. Everything is saved on this device only.',
      stepOf: (n) => `Step ${n} of 4`,
      step1: '1. Identity',
      step2: '2. About you',
      step3: '3. Place & budget',
      step4: '4. Business',
      nameLabel: 'Full Legal Name',
      namePlaceholder: 'e.g. Sunita Devi / Ram Kumar',
      phoneLabel: '10-Digit Mobile Number',
      phonePlaceholder: '9876543210',
      phoneError: 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)',
      nameError: 'Please enter a valid name (at least 2 characters)',
      identityNote: 'Your name and mobile number appear on your DPR (Detailed Project Report).',
      categoryLabel: 'Social category',
      categoryNote: 'Optional. Used only to show which schemes may apply to you. We do not verify it.',
      preferNot: 'Prefer not to say',
      preferNotSub: 'Category-based schemes will not be shown',
      togglesHeading: 'Anything that applies to you (optional)',
      womanLabel: 'Woman entrepreneur',
      womanSub: 'Schemes for women and the PMEGP special category',
      artisanLabel: 'Traditional artisan or craftsperson',
      artisanSub: 'The 18 traditional crafts under PM Vishwakarma',
      divyangLabel: 'Person with disability (Divyangjan)',
      divyangSub: 'PMEGP special category',
      incomeLabel: 'Yearly family income (₹)',
      incomeNote: 'Optional. Many schemes have an income limit (for example NSFDC, up to ₹5 lakh).',
      incomeError: 'Please enter a valid annual income (₹0 or more)',
      perYear: 'lakh a year',
      stateLabel: 'State / Union Territory',
      districtLabel: 'District',
      districtPlaceholder: 'e.g. Varanasi',
      districtError: 'Please enter your district',
      locationLabel: 'Location',
      rural: 'Rural',
      ruralSub: 'Higher PMEGP subsidy (25%, special category 35%)',
      urban: 'Urban',
      urbanSub: 'PMEGP subsidy 15%, special category 25%',
      costLabel: 'Planned project cost (₹)',
      costChips: 'Quick pick',
      costError: 'Please enter a valid project cost (at least ₹10,000)',
      equityLabel: 'Your own savings you can put in (₹)',
      equityNote: 'Under PMEGP your share is 5% in a special category and 10% otherwise.',
      debtCheck: 'Do you owe money to a village moneylender (sahukar)?',
      debtHeading: 'We will show how much a bank loan could save you',
      debtPrincipalLabel: 'Amount still owed (₹)',
      debtRateLabel: 'Interest rate, as the moneylender says it',
      debtRatePlaceholder: 'e.g. 3 senkda (3% a month) or 36% a year',
      debtMonthsLabel: 'Months it has been running',
      intentHeading: 'Which business do you want to start?',
      catalogTab: 'Pick from our 24 businesses',
      customTab: 'Describe your own idea',
      allSectors: 'All',
      customLabel: 'Your business idea',
      customPlaceholder: 'e.g. Solar pump repair, organic honey processing...',
      customNote: 'Figures for a new idea are estimated from the closest of our researched businesses, so treat them as a rough guide.',
      customError: 'Please describe your business idea',
      consentA: 'I have read the ',
      consentLink: 'Privacy Policy',
      consentB: ' and consent to the details above (including category, disability, income and debt) being used to show me schemes and loans.',
      consentError: 'Please tick the consent box to save.',
      back: 'Back',
      next: 'Next',
      finish: 'Save and open dashboard'
    }
  }[lang];

  const validateCurrentStep = () => {
    const errs = {};
    if (step === 1) {
      if (!name || name.trim().length < 2) {
        errs.name = t.nameError;
      }
      if (!validatePhone(phone)) {
        errs.phone = t.phoneError;
      }
    } else if (step === 2) {
      if (!validateIncome(annualIncome)) {
        errs.annualIncome = t.incomeError;
      }
    } else if (step === 3) {
      if (!district || district.trim().length < 2) {
        errs.district = t.districtError;
      }
      const numCost = Number(projectCost);
      if (!Number.isFinite(numCost) || numCost < 10000) {
        errs.projectCost = t.costError;
      }
    } else if (step === 4) {
      if (isCustomTrade && (!customTradeIdea || customTradeIdea.trim().length < 3)) {
        errs.customTrade = t.customError;
      }
      if (!consent) {
        errs.consent = t.consentError;
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinish = () => {
    if (!validateCurrentStep()) return;

    const selectedTrade = CATALOG_TRADES.find((x) => x.code === selectedTradeCode);
    const finalTradeCode = isCustomTrade ? 'D99' : (selectedTrade?.code || 'D01');
    const finalTradeName = isCustomTrade
      ? (customTradeIdea.trim() || 'Custom Enterprise')
      : (lang === 'hi' ? selectedTrade?.nameHi : selectedTrade?.nameEn) || 'Village FMCG Retail';

    // An empty income box stays "not given" (null); it used to be saved as ₹0.
    const cleanedIncome = String(annualIncome).trim() === '' ? null : clampIncome(annualIncome);
    const consentGiven = consentRecord(POLICY_VERSION);

    const profileData = {
      name: name.trim(),
      phone: sanitizePhone(phone),
      preferredLanguage: lang,
      casteCategory: casteCategory || null,
      isWoman: Boolean(isWoman),
      isArtisan: Boolean(isArtisan),
      isDivyang: Boolean(isDivyang),
      annualIncome: cleanedIncome,
      income: cleanedIncome,
      state: stateName,
      district: district.trim(),
      locationType,
      isRural: locationType === 'rural',
      projectCost: Math.max(10000, Number(projectCost) || 250000),
      promoterEquity: Math.max(0, Number(promoterEquity) || 0),
      hasMoneylenderDebt: Boolean(hasMoneylenderDebt),
      debtPrincipal: hasMoneylenderDebt ? Math.max(0, Number(debtPrincipal) || 0) : 0,
      debtRateQuote: hasMoneylenderDebt ? debtRateQuote : '',
      debtMonthsActive: hasMoneylenderDebt ? Math.max(0, Number(debtMonthsActive) || 0) : 0,
      tradeCode: finalTradeCode,
      tradeName: finalTradeName,
      customTradeIdea: isCustomTrade ? customTradeIdea.trim() : '',
      isCustomTrade: Boolean(isCustomTrade),
      sensitiveDataConsent: consentGiven
    };

    // 1. Save on this device, under this account (userDatabase.js keeps one profile per account).
    const session = getCurrentSession();
    const activeId = currentUser?.id || session?.id || null;
    saveOnboardingProfile(profileData, activeId);

    // 2. Update the signed-in account
    if (activeId) {
      const res = updateUser(activeId, {
        name: profileData.name,
        casteCategory: profileData.casteCategory,
        income: profileData.annualIncome,
        annualIncome: profileData.annualIncome,
        district: profileData.district,
        state: profileData.state,
        trade: `${profileData.tradeCode} ${profileData.tradeName}`,
        isWoman: profileData.isWoman,
        isArtisan: profileData.isArtisan,
        isDivyang: profileData.isDivyang,
        locationType: profileData.locationType,
        isRural: profileData.isRural,
        projectCost: profileData.projectCost,
        promoterEquity: profileData.promoterEquity,
        hasMoneylenderDebt: profileData.hasMoneylenderDebt,
        debtPrincipal: profileData.debtPrincipal,
        debtRateQuote: profileData.debtRateQuote,
        debtMonthsActive: profileData.debtMonthsActive,
        customTradeIdea: profileData.customTradeIdea,
        preferredLanguage: profileData.preferredLanguage,
        sensitiveDataConsent: consentGiven
      });
      if (res && !res.success) {
        console.warn('OnboardingModal: updateUser warning', res.error);
      } else if (res && onUserUpdated) {
        onUserUpdated(res.user);
      }
    }

    // 3. Callback
    if (onComplete) {
      onComplete(profileData);
    }
    if (onClose) {
      onClose();
    }
  };

  const stepLabels = [t.step1, t.step2, t.step3, t.step4];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn font-sans-ui">

        {/* Header */}
        <div className="bg-[#F8F6F0] px-6 sm:px-8 pt-6 pb-4 border-b border-black/10 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={eyebrowCls}>{t.stepOf(step)}</p>
              <h2 id="onboarding-title" className="font-editorial text-3xl sm:text-4xl text-[#111311] leading-tight mt-1">
                {t.modalTitle}
              </h2>
              <p className="text-xs text-[#686D65] mt-1 max-w-xl leading-relaxed hidden sm:block">
                {t.modalSubtitle}
              </p>
            </div>
            <div className="flex items-center rounded-full border border-black/10 bg-white p-0.5 text-[11px] font-mono-num font-bold flex-shrink-0">
              <button
                type="button"
                onClick={() => { if (lang !== 'hi') { setLang('hi'); setTradeFilter((prev) => translateSector(prev, 'hi')); } }}
                className={`px-2.5 py-1 rounded-full cursor-pointer ${lang === 'hi' ? 'bg-[#111311] text-white' : 'text-[#686D65] hover:text-[#111311]'}`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => { if (lang !== 'en') { setLang('en'); setTradeFilter((prev) => translateSector(prev, 'en')); } }}
                className={`px-2.5 py-1 rounded-full cursor-pointer ${lang === 'en' ? 'bg-[#111311] text-white' : 'text-[#686D65] hover:text-[#111311]'}`}
              >
                English
              </button>
            </div>
          </div>

          {/* Steps */}
          <ol className="mt-5 grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => {
                    if (s < step) setStep(s);
                    else if (s === step + 1 && validateCurrentStep()) setStep(s);
                  }}
                  aria-current={step === s ? 'step' : undefined}
                  className="w-full text-left cursor-pointer group"
                >
                  <span className={`block h-[2px] rounded-full mb-2 transition-colors ${s <= step ? 'bg-[#111311]' : 'bg-black/10'}`} />
                  <span className={`block text-[10px] sm:text-[11px] font-mono-num uppercase tracking-wider truncate ${
                    step === s ? 'text-[#111311] font-bold' : s < step ? 'text-[#111311]' : 'text-[#686D65]/70'
                  }`}>
                    {stepLabels[s - 1]}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 py-6 overflow-y-auto space-y-6 flex-1 text-[#111311]" data-lenis-prevent>

          {/* STEP 1: Identity */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <p className={hintCls}>{t.identityNote}</p>

              <div>
                <label htmlFor="ob-name" className={labelCls}>{t.nameLabel}</label>
                <input
                  id="ob-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                  }}
                  placeholder={t.namePlaceholder}
                  className={inputCls(errors.name)}
                />
                <FieldError text={errors.name} />
              </div>

              <div>
                <label htmlFor="ob-phone" className={labelCls}>{t.phoneLabel}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono-num text-[#686D65]">+91</span>
                  <input
                    id="ob-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={14}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                    }}
                    placeholder={t.phonePlaceholder}
                    style={{ paddingLeft: '3.5rem' }}
                    className={`${inputCls(errors.phone)} font-mono-num`}
                  />
                </div>
                <FieldError text={errors.phone} />
              </div>
            </div>
          )}

          {/* STEP 2: About you */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <p className={labelCls}>{t.categoryLabel}</p>
                <p className={`${hintCls} mb-2.5`}>{t.categoryNote}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label={t.categoryLabel}>
                  {CASTE_CATEGORIES.map((c) => {
                    const isSelected = casteCategory === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setCasteCategory(c.code)}
                        className={choiceCls(isSelected)}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-xs text-[#111311]">{lang === 'hi' ? c.labelHi : c.labelEn}</span>
                          <Mark on={isSelected} />
                        </span>
                        <span className={`block ${hintCls} mt-1`}>{lang === 'hi' ? c.descHi : c.descEn}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={casteCategory === ''}
                    onClick={() => setCasteCategory('')}
                    className={`${choiceCls(casteCategory === '')} sm:col-span-2`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-[#111311]">{t.preferNot}</span>
                      <Mark on={casteCategory === ''} />
                    </span>
                    <span className={`block ${hintCls} mt-1`}>{t.preferNotSub}</span>
                  </button>
                </div>
              </div>

              <div className="pt-5 border-t border-black/10 space-y-2">
                <p className={labelCls}>{t.togglesHeading}</p>
                <ToggleRow checked={isWoman} onChange={setIsWoman} label={t.womanLabel} sub={t.womanSub} />
                <ToggleRow checked={isArtisan} onChange={setIsArtisan} label={t.artisanLabel} sub={t.artisanSub} />
                <ToggleRow checked={isDivyang} onChange={setIsDivyang} label={t.divyangLabel} sub={t.divyangSub} />
              </div>

              <div className="pt-5 border-t border-black/10">
                <label htmlFor="ob-income" className={labelCls}>{t.incomeLabel}</label>
                <p className={`${hintCls} mb-2`}>{t.incomeNote}</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#686D65]">₹</span>
                  <input
                    id="ob-income"
                    type="number"
                    min="0"
                    step="10000"
                    inputMode="numeric"
                    value={annualIncome}
                    onChange={(e) => {
                      setAnnualIncome(e.target.value);
                      if (errors.annualIncome) setErrors((prev) => ({ ...prev, annualIncome: null }));
                    }}
                    style={{ paddingLeft: '2.25rem' }}
                    className={`${inputCls(errors.annualIncome)} font-mono-num`}
                  />
                </div>
                <FieldError text={errors.annualIncome} />
                {Number(annualIncome) > 0 && (
                  <p className="text-[11px] font-mono-num text-[#686D65] mt-1">
                    ≈ ₹{(Number(annualIncome) / 100000).toFixed(2)} {t.perYear}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Place and budget */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ob-state" className={labelCls}>{t.stateLabel}</label>
                  <select
                    id="ob-state"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className={`${inputCls(false)} cursor-pointer`}
                  >
                    {MAJOR_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="ob-district" className={labelCls}>{t.districtLabel}</label>
                  <input
                    id="ob-district"
                    type="text"
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      if (errors.district) setErrors((prev) => ({ ...prev, district: null }));
                    }}
                    placeholder={t.districtPlaceholder}
                    className={inputCls(errors.district)}
                  />
                  <FieldError text={errors.district} />
                </div>
              </div>

              <div>
                <p className={labelCls}>{t.locationLabel}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label={t.locationLabel}>
                  {[
                    { v: 'rural', label: t.rural, sub: t.ruralSub },
                    { v: 'urban', label: t.urban, sub: t.urbanSub }
                  ].map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      role="radio"
                      aria-checked={locationType === o.v}
                      onClick={() => setLocationType(o.v)}
                      className={choiceCls(locationType === o.v)}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#111311]">{o.label}</span>
                        <Mark on={locationType === o.v} />
                      </span>
                      <span className={`block ${hintCls} mt-1`}>{o.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t border-black/10">
                <label htmlFor="ob-cost" className={labelCls}>{t.costLabel}</label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                  <span className={`${eyebrowCls} mr-1`}>{t.costChips}</span>
                  {COST_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setProjectCost(String(preset.value))}
                      className={`px-2.5 py-1 text-xs font-mono-num rounded-full border transition-colors cursor-pointer ${
                        Number(projectCost) === preset.value
                          ? 'bg-[#111311] text-white border-[#111311]'
                          : 'bg-white text-[#111311] border-black/15 hover:border-black/40'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#686D65]">₹</span>
                  <input
                    id="ob-cost"
                    type="number"
                    min="10000"
                    step="5000"
                    inputMode="numeric"
                    value={projectCost}
                    onChange={(e) => {
                      setProjectCost(e.target.value);
                      if (errors.projectCost) setErrors((prev) => ({ ...prev, projectCost: null }));
                    }}
                    style={{ paddingLeft: '2.25rem' }}
                    className={`${inputCls(errors.projectCost)} font-mono-num`}
                  />
                </div>
                <FieldError text={errors.projectCost} />
              </div>

              <div>
                <label htmlFor="ob-equity" className={labelCls}>{t.equityLabel}</label>
                <p className={`${hintCls} mb-2`}>{t.equityNote}</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#686D65]">₹</span>
                  <input
                    id="ob-equity"
                    type="number"
                    min="0"
                    step="5000"
                    inputMode="numeric"
                    value={promoterEquity}
                    onChange={(e) => setPromoterEquity(e.target.value)}
                    style={{ paddingLeft: '2.25rem' }}
                    className={`${inputCls(false)} font-mono-num`}
                  />
                </div>
              </div>

              <div className="pt-5 border-t border-black/10 space-y-3">
                <ToggleRow checked={hasMoneylenderDebt} onChange={setHasMoneylenderDebt} label={t.debtCheck} sub={t.debtHeading} />

                {hasMoneylenderDebt && (
                  <div className="p-4 bg-[#F8F6F0] rounded-2xl border border-black/5 space-y-3 animate-fadeIn">
                    <div>
                      <label htmlFor="ob-debt" className={labelCls}>{t.debtPrincipalLabel}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#686D65]">₹</span>
                        <input
                          id="ob-debt"
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={debtPrincipal}
                          onChange={(e) => setDebtPrincipal(e.target.value)}
                          style={{ paddingLeft: '2.25rem' }}
                          className={`${inputCls(false)} font-mono-num`}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="ob-rate" className={labelCls}>{t.debtRateLabel}</label>
                        <input
                          id="ob-rate"
                          type="text"
                          value={debtRateQuote}
                          onChange={(e) => setDebtRateQuote(e.target.value)}
                          placeholder={t.debtRatePlaceholder}
                          className={inputCls(false)}
                        />
                      </div>
                      <div>
                        <label htmlFor="ob-months" className={labelCls}>{t.debtMonthsLabel}</label>
                        <input
                          id="ob-months"
                          type="number"
                          min="0"
                          inputMode="numeric"
                          value={debtMonthsActive}
                          onChange={(e) => setDebtMonthsActive(e.target.value)}
                          className={`${inputCls(false)} font-mono-num`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Business */}
          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <h3 className="font-editorial text-2xl text-[#111311] mb-3">{t.intentHeading}</h3>
                <div className="grid grid-cols-2 gap-1 p-1 bg-[#F4F1EA] rounded-2xl">
                  {[{ v: false, label: t.catalogTab }, { v: true, label: t.customTab }].map((o) => (
                    <button
                      key={String(o.v)}
                      type="button"
                      onClick={() => setIsCustomTrade(o.v)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                        isCustomTrade === o.v ? 'bg-white text-[#111311] shadow-sm' : 'text-[#686D65] hover:text-[#111311]'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {!isCustomTrade ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {sectors.map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setTradeFilter(sec)}
                        className={`px-3 py-1 rounded-full whitespace-nowrap text-xs border transition-colors cursor-pointer ${
                          tradeFilter === sec
                            ? 'bg-[#111311] text-white border-[#111311]'
                            : 'bg-white text-[#686D65] border-black/10 hover:text-[#111311] hover:border-black/30'
                        }`}
                      >
                        {sec === 'All' ? t.allSectors : sec}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1" role="radiogroup" aria-label={t.intentHeading}>
                    {filteredTrades.map((trade) => {
                      const isSelected = selectedTradeCode === trade.code;
                      return (
                        <button
                          key={trade.code}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedTradeCode(trade.code)}
                          className={`${choiceCls(isSelected)} flex flex-col justify-between`}
                        >
                          <span className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-[11px] font-mono-num font-bold text-[#111311]">{trade.code}</span>
                            <Mark on={isSelected} />
                          </span>
                          <span className="block font-semibold text-xs text-[#111311] leading-tight">
                            {lang === 'hi' ? trade.nameHi : trade.nameEn}
                          </span>
                          <span className="mt-2 pt-1.5 border-t border-black/5 flex items-center justify-between gap-2 text-[10px]">
                            <span className="text-[#686D65] uppercase tracking-wider truncate">{lang === 'hi' ? trade.sectorHi : trade.sectorEn}</span>
                            <span className="font-mono-num text-[#111311] whitespace-nowrap">{trade.tier}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="ob-idea" className={labelCls}>{t.customLabel}</label>
                  <textarea
                    id="ob-idea"
                    rows={3}
                    value={customTradeIdea}
                    onChange={(e) => {
                      setCustomTradeIdea(e.target.value);
                      if (errors.customTrade) setErrors((prev) => ({ ...prev, customTrade: null }));
                    }}
                    placeholder={t.customPlaceholder}
                    className={inputCls(errors.customTrade)}
                  />
                  <FieldError text={errors.customTrade} />
                  <p className={hintCls}>{t.customNote}</p>
                </div>
              )}

              {/* DPDP Act s.6: consent before sensitive details are saved */}
              <div className="pt-5 border-t border-black/10">
                <label className={`flex items-start gap-2.5 p-3 rounded-2xl border cursor-pointer ${errors.consent ? 'border-red-400 bg-red-50/40' : 'border-black/10 bg-[#F8F6F0]'}`}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (errors.consent) setErrors((prev) => ({ ...prev, consent: null }));
                    }}
                    className="mt-0.5 w-4 h-4 accent-[#111311] flex-shrink-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-[#111311] leading-snug">
                    {t.consentA}
                    {onOpenPrivacy ? (
                      <button type="button" onClick={onOpenPrivacy} className="font-semibold text-[#0E7A53] hover:underline cursor-pointer">
                        {t.consentLink}
                      </button>
                    ) : t.consentLink}
                    {t.consentB}
                  </span>
                </label>
                <FieldError text={errors.consent} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-black/10 bg-white flex items-center justify-between flex-shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-black/15 hover:border-black/40 text-[#111311] font-mono-num font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              {t.back}
            </button>
          ) : (
            <span />
          )}

          <button
            type="button"
            onClick={step < 4 ? handleNext : handleFinish}
            className="px-6 py-2.5 rounded-xl bg-[#111311] hover:bg-black text-white font-mono-num font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
          >
            {step < 4 ? t.next : t.finish}
          </button>
        </div>
      </div>
    </div>
  );
}
