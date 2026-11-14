import React, { useState, useEffect, useMemo } from 'react';
import { updateUser, registerUser, getCurrentSession } from '../data/userDatabase.js';

export const CATALOG_TRADES = [
  { code: 'D01', nameEn: 'Village FMCG Retail', nameHi: 'ग्रामीण किराना एवं प्रोविजन स्टोर', sectorEn: 'Retail & Trading', sectorHi: 'खुदरा व व्यापार', icon: '🛒', tier: '₹1.3L – ₹5.6L' },
  { code: 'D02', nameEn: 'Periodic Haat Mobile Trade', nameHi: 'साप्ताहिक हाट मोबाइल व्यापार', sectorEn: 'Retail & Trading', sectorHi: 'खुदरा व व्यापार', icon: '🚚', tier: '₹80k – ₹2.5L' },
  { code: 'D03', nameEn: 'Rural Electronics Recharge', nameHi: 'ग्रामीण इलेक्ट्रॉनिक्स व मोबाइल सेवा', sectorEn: 'Retail & Trading', sectorHi: 'खुदरा व व्यापार', icon: '📱', tier: '₹1.0L – ₹3.5L' },
  { code: 'D04', nameEn: 'Seeds Fertiliser', nameHi: 'बीज एवं उर्वरक केंद्र', sectorEn: 'Retail & Trading', sectorHi: 'खुदरा व व्यापार', icon: '🌱', tier: '₹2.0L – ₹8.0L' },
  { code: 'D05', nameEn: 'Animal Feed', nameHi: 'पशु आहार एवं चारा प्रसंस्करण', sectorEn: 'Agro-Processing', sectorHi: 'कृषि प्रसंस्करण', icon: '🌾', tier: '₹1.5L – ₹5.0L' },
  { code: 'D06', nameEn: 'Farm Hardware Drip', nameHi: 'कृषि उपकरण व ड्रिप सिंचाई', sectorEn: 'Retail & Trading', sectorHi: 'खुदरा व व्यापार', icon: '🔧', tier: '₹1.8L – ₹6.0L' },
  { code: 'D07', nameEn: 'Grain Dal Milling', nameHi: 'अनाज एवं दाल प्रसंस्करण मिल', sectorEn: 'Agro-Processing', sectorHi: 'कृषि प्रसंस्करण', icon: '🥣', tier: '₹2.5L – ₹12.0L' },
  { code: 'D08', nameEn: 'Oil Expellers', nameHi: 'सरसों एवं खाद्य तेल स्पेलर मिल', sectorEn: 'Agro-Processing', sectorHi: 'कृषि प्रसंस्करण', icon: '🛢️', tier: '₹3.0L – ₹15.0L' },
  { code: 'D09', nameEn: 'Spice Grinding', nameHi: 'मसाला पिसाई एवं पैकेजिंग इकाई', sectorEn: 'Agro-Processing', sectorHi: 'कृषि प्रसंस्करण', icon: '🌶️', tier: '₹1.5L – ₹6.0L' },
  { code: 'D10', nameEn: 'Horticultural Dehydration', nameHi: 'फल व सब्जी निर्जलीकरण इकाई', sectorEn: 'Agro-Processing', sectorHi: 'कृषि प्रसंस्करण', icon: '🥭', tier: '₹2.0L – ₹8.5L' },
  { code: 'D11', nameEn: 'Commercial Bovine Dairy', nameHi: 'वाणिज्यिक गोवंशीय डेयरी इकाई', sectorEn: 'Livestock & Poultry', sectorHi: 'पशुपालन व पोल्ट्री', icon: '🐄', tier: '₹3.5L – ₹18.0L' },
  { code: 'D12', nameEn: 'Commercial Goat Meat Husbandry', nameHi: 'वाणिज्यिक बकरी पालन इकाई', sectorEn: 'Livestock & Poultry', sectorHi: 'पशुपालन व पोल्ट्री', icon: '🐐', tier: '₹1.2L – ₹5.0L' },
  { code: 'D13', nameEn: 'Commercial Broiler Poultry', nameHi: 'वाणिज्यिक ब्रॉयलर पोल्ट्री फार्म', sectorEn: 'Livestock & Poultry', sectorHi: 'पशुपालन व पोल्ट्री', icon: '🐔', tier: '₹2.0L – ₹10.0L' },
  { code: 'D14', nameEn: 'Inland Freshwater Aquaculture', nameHi: 'मीठे पानी में मत्स्य पालन', sectorEn: 'Livestock & Poultry', sectorHi: 'पशुपालन व पोल्ट्री', icon: '🐟', tier: '₹2.5L – ₹12.0L' },
  { code: 'D15', nameEn: 'Tractor Garage', nameHi: 'ट्रैक्टर एवं कृषि मशीनरी गैराज', sectorEn: 'Machinery & Services', sectorHi: 'मशीनरी व सेवाएं', icon: '🚜', tier: '₹1.5L – ₹6.5L' },
  { code: 'D16', nameEn: 'Motor Rewinding', nameHi: 'इलेक्ट्रिक मोटर व पंप मरम्मत', sectorEn: 'Machinery & Services', sectorHi: 'मशीनरी व सेवाएं', icon: '⚡', tier: '₹1.0L – ₹4.0L' },
  { code: 'D17', nameEn: 'Auto EV Workshop', nameHi: 'ऑटो / ई-रिक्शा वर्कशॉप व चार्जिंग', sectorEn: 'Machinery & Services', sectorHi: 'मशीनरी व सेवाएं', icon: '🔋', tier: '₹1.8L – ₹7.5L' },
  { code: 'D18', nameEn: 'Tailoring', nameHi: 'ग्रामीण सिलाई एवं रेडीमेड गारमेंट्स', sectorEn: 'Crafts & Fabrication', sectorHi: 'शिल्प व कारीगरी', icon: '🧵', tier: '₹80k – ₹3.5L' },
  { code: 'D19', nameEn: 'Carpentry', nameHi: 'काष्ठकला एवं फर्नीचर निर्माण', sectorEn: 'Crafts & Fabrication', sectorHi: 'शिल्प व कारीगरी', icon: '🪚', tier: '₹1.2L – ₹5.0L' },
  { code: 'D20', nameEn: 'Metal Smithy', nameHi: 'लोहार कार्य एवं कृषि उपकरण निर्माण', sectorEn: 'Crafts & Fabrication', sectorHi: 'शिल्प व कारीगरी', icon: '🔨', tier: '₹1.4L – ₹5.5L' },
  { code: 'D21', nameEn: 'Pottery', nameHi: 'पारंपरिक कुम्हारी एवं मिट्टी उत्पाद', sectorEn: 'Crafts & Fabrication', sectorHi: 'शिल्प व कारीगरी', icon: '🏺', tier: '₹60k – ₹2.5L' },
  { code: 'D22', nameEn: 'Fly Ash Bricks', nameHi: 'फ्लाई ऐश ईंट निर्माण इकाई', sectorEn: 'Green & Circular', sectorHi: 'हरित व चक्रीय', icon: '🧱', tier: '₹4.0L – ₹20.0L' },
  { code: 'D23', nameEn: 'Vermicompost', nameHi: 'जैविक केंचुआ खाद इकाई', sectorEn: 'Green & Circular', sectorHi: 'हरित व चक्रीय', icon: '🪱', tier: '₹1.0L – ₹4.5L' },
  { code: 'D24', nameEn: 'Rural Freight Custom Hiring', nameHi: 'ग्रामीण माल ढुलाई व कस्टम हायरिंग', sectorEn: 'Machinery & Services', sectorHi: 'मशीनरी व सेवाएं', icon: '🚛', tier: '₹3.0L – ₹14.0L' },
];

export const CASTE_CATEGORIES = [
  { code: 'SC', labelEn: 'Scheduled Caste (SC)', labelHi: 'अनुसूचित जाति (SC)', descEn: 'Eligible for NSFDC concessional loans and PMEGP special capital subsidy', descHi: 'NSFDC रियायती ऋण व PMEGP विशेष सब्सिडी हेतु पात्र' },
  { code: 'ST', labelEn: 'Scheduled Tribe (ST)', labelHi: 'अनुसूचित जनजाति (ST)', descEn: 'Eligible for NSTFDC concessional loans and PMEGP special capital subsidy', descHi: 'NSTFDC रियायती ऋण व PMEGP विशेष सब्सिडी हेतु पात्र' },
  { code: 'OBC', labelEn: 'Other Backward Classes (OBC)', labelHi: 'अन्य पिछड़ा वर्ग (OBC)', descEn: 'Eligible for NBCFDC term loans and PMEGP special margin money', descHi: 'NBCFDC सावधि ऋण व PMEGP विशेष मार्जिन मनी हेतु पात्र' },
  { code: 'General', labelEn: 'General Category', labelHi: 'सामान्य वर्ग', descEn: 'Eligible for PMEGP, PM MUDRA and PMFME schemes', descHi: 'PMEGP, पीएम मुद्रा एवं PMFME योजनाओं हेतु पात्र' },
  { code: 'EWS', labelEn: 'Economically Weaker Section (EWS)', labelHi: 'आर्थिक रूप से कमजोर वर्ग (EWS)', descEn: 'Eligible for PMEGP, PM MUDRA concessional coverage and priority', descHi: 'PMEGP, पीएम मुद्रा एवं प्राथमिकता ऋण हेतु पात्र' },
  { code: 'Minority', labelEn: 'Minority Community', labelHi: 'अल्पसंख्यक समुदाय', descEn: 'Eligible for NMDFC, PMEGP special subsidy and priority credit', descHi: 'NMDFC, PMEGP विशेष सब्सिडी व प्राथमिक ऋण हेतु पात्र' },
];

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
  'Himachal Pradesh'
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

export default function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  currentUser = null,
  initialLanguage = 'hi'
}) {
  const [lang, setLang] = useState(initialLanguage);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Step 1: Language & Identity
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Socio-Demographics
  const [casteCategory, setCasteCategory] = useState('SC');
  const [isWoman, setIsWoman] = useState(false);
  const [isArtisan, setIsArtisan] = useState(false);
  const [isDivyang, setIsDivyang] = useState(false);
  const [annualIncome, setAnnualIncome] = useState('180000');

  // Step 3: Geography & Scale
  const [stateName, setStateName] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('');
  const [locationType, setLocationType] = useState('rural');
  const [projectCost, setProjectCost] = useState('250000');
  const [promoterEquity, setPromoterEquity] = useState('25000');
  const [hasMoneylenderDebt, setHasMoneylenderDebt] = useState(false);
  const [debtPrincipal, setDebtPrincipal] = useState('50000');
  const [debtRateQuote, setDebtRateQuote] = useState('3 senkda');
  const [debtMonthsActive, setDebtMonthsActive] = useState('12');

  // Step 4: Enterprise Intent
  const [isCustomTrade, setIsCustomTrade] = useState(false);
  const [selectedTradeCode, setSelectedTradeCode] = useState('D01');
  const [customTradeIdea, setCustomTradeIdea] = useState('');
  const [tradeFilter, setTradeFilter] = useState('All');

  // Hydrate from currentUser if provided
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setName(currentUser.name);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.casteCategory) {
        setCasteCategory(currentUser.casteCategory);
      } else if (currentUser.category) {
        if (currentUser.category.includes('SC')) setCasteCategory('SC');
        else if (currentUser.category.includes('ST')) setCasteCategory('ST');
        else if (currentUser.category.includes('OBC')) setCasteCategory('OBC');
        else if (currentUser.category.includes('Minority')) setCasteCategory('Minority');
        else setCasteCategory('General');
      }
      if (currentUser.income) setAnnualIncome(String(currentUser.income));
      else if (currentUser.annualIncome) setAnnualIncome(String(currentUser.annualIncome));
      if (currentUser.district) setDistrict(currentUser.district);
      if (currentUser.state) setStateName(currentUser.state);
      if (currentUser.isWoman !== undefined) setIsWoman(Boolean(currentUser.isWoman));
      if (currentUser.isArtisan !== undefined) setIsArtisan(Boolean(currentUser.isArtisan));
      if (currentUser.isDivyang !== undefined) setIsDivyang(Boolean(currentUser.isDivyang));
      if (currentUser.locationType) setLocationType(currentUser.locationType);
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
      modalTitle: 'उद्यमसेतु मार्गदर्शन प्रवेश (Onboarding Intake)',
      modalSubtitle: 'सरकारी योजनाओं, रियायती ब्याज दर और डीपीआर निर्माण हेतु आपकी प्राथमिक जानकारी',
      step1: '1. पहचान',
      step2: '2. सामाजिक वर्ग',
      step3: '3. स्थान व बजट',
      step4: '4. उद्यम चयन',
      nameLabel: 'आवेदक का पूरा नाम *',
      namePlaceholder: 'उदा. राम कुमार / सुनीता देवी',
      phoneLabel: '10 अंकों का मोबाइल नंबर *',
      phonePlaceholder: '9876543210',
      phoneError: 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें (6-9 से शुरू)',
      nameError: 'कृपया कम से कम 2 अक्षरों का नाम दर्ज करें',
      categoryLabel: 'सामाजिक / जाति वर्ग (Caste Category) *',
      categoryNote: 'संबंधित निगम (NSFDC, NSTFDC, NBCFDC आदि) की रियायती ब्याज दर व PMEGP सब्सिडी निर्धारण हेतु',
      togglesHeading: 'विशेष लाभार्थी श्रेणियां (Special Categories)',
      womanLabel: 'महिला उद्यमी (Woman Entrepreneur)',
      womanSub: 'अतिरिक्त ब्याज छूट और महिला समृद्धि योजना हेतु पात्र',
      artisanLabel: 'पारंपरिक कारीगर / शिल्पकार (PM Vishwakarma)',
      artisanSub: '18 पारंपरिक शिल्पों हेतु 5% रियायती ऋण व ₹15,000 टूलकिट वाउचर',
      divyangLabel: 'दिव्यांगजन (Person with Disability)',
      divyangSub: 'विशेष सहायता एवं प्राथमिकता ऋण आवंटन',
      incomeLabel: 'वार्षिक पारिवारिक आय (Annual Family Income in ₹) *',
      incomeNote: '₹3.00 लाख या ₹5.00 लाख से कम आय पर ब्याज अनुदान व सब्सिडी पात्रता',
      incomeError: 'कृपया वैध वार्षिक आय दर्ज करें (₹0 या अधिक)',
      stateLabel: 'राज्य (State) *',
      districtLabel: 'ज़िला (District) *',
      districtPlaceholder: 'उदा. Varanasi, Lucknow, Agra',
      districtError: 'कृपया अपना ज़िला दर्ज करें',
      locationLabel: 'क्षेत्र का प्रकार (Location Type)',
      rural: 'ग्रामीण (Rural - 35% सब्सिडी हेतु पात्र)',
      urban: 'शहरी (Urban - 25% सब्सिडी हेतु पात्र)',
      costLabel: 'अनुमानित परियोजना लागत (Project Cost in ₹) *',
      costChips: 'त्वरित बजट चयन:',
      costError: 'कृपया वैध परियोजना लागत दर्ज करें (कम से कम ₹10,000)',
      equityLabel: 'अपनी बचत / स्वयं का योगदान (Promoter Equity in ₹)',
      equityNote: 'PMEGP के तहत केवल 5% से 10% स्वयं का अंशदान आवश्यक होता है',
      debtHeading: 'साहूकार / महाजन का पुराना कर्ज (Moneylender Debt)',
      debtCheck: 'क्या आप पर किसी निजी साहूकार या महाजन का पुराना कर्ज है?',
      debtPrincipalLabel: 'बकाया मूलधन (Principal Amount in ₹)',
      debtRateLabel: 'मासिक ब्याज दर (Dialectal Quote)',
      debtRatePlaceholder: 'उदा. 3 senkda (3% प्रति माह) या 36% p.a.',
      debtMonthsLabel: 'कर्ज चुकाते हुए कितने महीने हुए? (Months Active)',
      intentHeading: 'आप कौन सा उद्यम या व्यवसाय शुरू करना चाहते हैं?',
      catalogTab: '24 प्रमाणित ग्रामीण उद्यमों में से चुनें',
      customTab: 'अपना नया व्यावसायिक विचार दर्ज करें (Custom Idea)',
      customPlaceholder: 'उदा. सोलर वाटर पंप मरम्मत एवं माइक्रो इंस्टॉलेशन, मशरूम फार्मिंग व पैकेजिंग...',
      customNote: 'हमारा एआई आपके विचार का विश्लेषण करके स्वतः 8-अनुसूचियों वाली वित्तीय व्यवहार्यता रिपोर्ट तैयार करेगा।',
      back: 'पीछे जाएं',
      next: 'आगे बढ़ें',
      finish: 'प्रोफ़ाइल सहेजें एवं डैशबोर्ड शुरू करें ✨',
      close: 'बंद करें'
    },
    en: {
      modalTitle: 'UdyamSetu Guided Intake & Venture Profile',
      modalSubtitle: 'Direct statutory eligibility routing, concessional credit evaluation & DPR generation',
      step1: '1. Identity',
      step2: '2. Demographics',
      step3: '3. Scale & Geo',
      step4: '4. Enterprise Intent',
      nameLabel: 'Full Legal Name *',
      namePlaceholder: 'e.g. Sunita Devi / Ram Kumar',
      phoneLabel: '10-Digit Mobile Number *',
      phonePlaceholder: '9876543210',
      phoneError: 'Please enter a valid 10-digit Indian mobile number (starting with 6-9)',
      nameError: 'Please enter a valid name (at least 2 characters)',
      categoryLabel: 'Socio-Demographic Caste Category *',
      categoryNote: 'Determines concessional credit from NSFDC, NSTFDC, NBCFDC & PMEGP subsidy slabs',
      togglesHeading: 'Special Beneficiary Affirmations',
      womanLabel: 'Woman Entrepreneur',
      womanSub: 'Eligible for Mahila Samridhi & enhanced PMEGP capital subsidies',
      artisanLabel: 'Traditional Artisan / Craftsman (PM Vishwakarma)',
      artisanSub: '5% concessional credit + ₹15,000 digital toolkit voucher',
      divyangLabel: 'Person with Disability (Divyangjan)',
      divyangSub: 'Special reservation and interest subvention benefits',
      incomeLabel: 'Annual Family Income (₹ per year) *',
      incomeNote: 'Statutory ceiling benchmark for MoSJE concessional interest slabs',
      incomeError: 'Please enter a valid annual income (₹0 or more)',
      stateLabel: 'State / UT *',
      districtLabel: 'District *',
      districtPlaceholder: 'e.g. Varanasi, Lucknow, Agra',
      districtError: 'Please enter your district',
      locationLabel: 'Location Type',
      rural: 'Rural (35% Special PMEGP Subsidy eligible)',
      urban: 'Urban (25% Special PMEGP Subsidy eligible)',
      costLabel: 'Target Project Outlay (₹) *',
      costChips: 'Quick Project Budget Chips:',
      costError: 'Please enter a valid project cost (at least ₹10,000)',
      equityLabel: 'Promoter Equity Available (Your Savings in ₹)',
      equityNote: 'Statutory equity requirement is only 5% for special categories under PMEGP',
      debtHeading: 'Informal Moneylender Debt Liberation',
      debtCheck: 'Do you owe debt to private village sahukars or moneylenders?',
      debtPrincipalLabel: 'Outstanding Principal (₹)',
      debtRateLabel: 'Quoted Interest Rate (Dialectal Quote)',
      debtRatePlaceholder: 'e.g. 3 senkda (3% monthly) or 36% p.a.',
      debtMonthsLabel: 'Months Debt Has Been Serviced',
      intentHeading: 'Which enterprise or trade do you intend to launch?',
      catalogTab: 'Select from 24 Researched Rural Trades',
      customTab: 'Enter a Custom Business Idea',
      customPlaceholder: 'e.g. Solar water pump repair and installation, organic honey processing...',
      customNote: 'Our synthesizer will map your uncatalogued idea to nearest-neighbor archetypes and compute a complete financial feasibility dossier.',
      back: 'Back',
      next: 'Next',
      finish: 'Save Profile & Launch Dashboard ✨',
      close: 'Close'
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
      if (!casteCategory) {
        errs.category = 'Category required';
      }
      const numIncome = Number(annualIncome);
      if (annualIncome !== '' && (!Number.isFinite(numIncome) || numIncome < 0)) {
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
        errs.customTrade = lang === 'hi' ? 'कृपया अपना व्यावसायिक विचार लिखें' : 'Please describe your business idea';
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

    const cleanedIncome = clampIncome(annualIncome);

    const profileData = {
      name: name.trim(),
      phone: sanitizePhone(phone),
      preferredLanguage: lang,
      casteCategory,
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
      promoterEquity: Math.max(0, Number(promoterEquity) || 25000),
      hasMoneylenderDebt: Boolean(hasMoneylenderDebt),
      debtPrincipal: hasMoneylenderDebt ? Math.max(0, Number(debtPrincipal) || 0) : 0,
      debtRateQuote: hasMoneylenderDebt ? debtRateQuote : '',
      debtMonthsActive: hasMoneylenderDebt ? Math.max(0, Number(debtMonthsActive) || 0) : 0,
      tradeCode: finalTradeCode,
      tradeName: finalTradeName,
      customTradeIdea: isCustomTrade ? customTradeIdea.trim() : '',
      isCustomTrade: Boolean(isCustomTrade)
    };

    // 1. Persist to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('udyamsetu_onboarded', 'true');
        window.localStorage.setItem('udyamsetu_onboarding_profile', JSON.stringify(profileData));
      } catch (err) {
        console.warn('OnboardingModal: storage error', err);
      }
    }

    // 2. Update user database if current user exists
    const session = getCurrentSession();
    if (currentUser?.id || session?.id) {
      const activeId = currentUser?.id || session?.id;
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
        preferredLanguage: profileData.preferredLanguage
      });
      if (res && !res.success) {
        console.warn('OnboardingModal: updateUser warning', res.error);
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-[#0E7A53] text-white px-6 py-4 flex items-center justify-between border-b border-[#0B6544] flex-shrink-0">
          <div className="flex items-center space-x-3">
            <span className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg font-bold">
              🧭
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-sans-ui leading-tight">
                {t.modalTitle}
              </h2>
              <p className="text-[11px] text-white/80 hidden sm:block">
                {t.modalSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-white/15 rounded-xl p-0.5 border border-white/20">
              <button
                type="button"
                onClick={() => {
                  if (lang !== 'hi') {
                    setLang('hi');
                    setTradeFilter((prev) => translateSector(prev, 'hi'));
                  }
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  lang === 'hi' ? 'bg-white text-[#0E7A53] shadow-sm' : 'text-white hover:text-white/80'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => {
                  if (lang !== 'en') {
                    setLang('en');
                    setTradeFilter((prev) => translateSector(prev, 'en'));
                  }
                }}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  lang === 'en' ? 'bg-white text-[#0E7A53] shadow-sm' : 'text-white hover:text-white/80'
                }`}
              >
                English
              </button>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label={t.close}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer text-sm font-bold ml-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600 flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-4 w-full">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  if (s < step) setStep(s);
                  else if (s > step && validateCurrentStep()) setStep(s);
                }}
                className={`flex items-center space-x-1.5 transition-all cursor-pointer ${
                  step === s 
                    ? 'text-[#0E7A53] font-bold' 
                    : s < step 
                    ? 'text-slate-700 font-medium' 
                    : 'text-slate-400'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === s 
                    ? 'bg-[#0E7A53] text-white shadow' 
                    : s < step 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {s < step ? '✓' : s}
                </span>
                <span className="hidden sm:inline">
                  {s === 1 ? t.step1 : s === 2 ? t.step2 : s === 3 ? t.step3 : t.step4}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 font-sans-ui">
          
          {/* STEP 1: Language & Identity */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 flex items-start space-x-3">
                <span className="text-xl">👤</span>
                <div>
                  <p className="font-bold text-sm text-[#0E7A53] mb-0.5">
                    {lang === 'hi' ? 'उद्यमी पहचान एवं संपर्क विवरण' : 'Beneficiary Identification & Contact'}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    {lang === 'hi' 
                      ? 'डीपीआर (विस्तृत परियोजना रिपोर्ट) और ऋण आवेदन के लिए आपका नाम और मोबाइल नंबर आवश्यक है।' 
                      : 'Your legal name and verified phone are used for Lead-Bank DPR generation and scheme eligibility.'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                  }}
                  placeholder={t.namePlaceholder}
                  className={`w-full px-4 py-3 rounded-2xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 transition-all ${
                    errors.name ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {t.phoneLabel}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={14}
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: null }));
                    }}
                    placeholder={t.phonePlaceholder}
                    className={`w-full pl-13 pr-4 py-3 rounded-2xl border text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 transition-all ${
                      errors.phone ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">{errors.phone}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Socio-Demographics */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    {t.categoryLabel}
                  </label>
                  <span className="text-[11px] text-[#0E7A53] font-semibold">
                    {t.categoryNote}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CASTE_CATEGORIES.map((c) => {
                    const isSelected = casteCategory === c.code;
                    return (
                      <div
                        key={c.code}
                        onClick={() => setCasteCategory(c.code)}
                        className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected 
                            ? 'border-[#0E7A53] bg-emerald-50/60 shadow-sm' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-900">
                            {lang === 'hi' ? c.labelHi : c.labelEn}
                          </span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            isSelected ? 'bg-[#0E7A53] text-white' : 'border border-slate-300'
                          }`}>
                            {isSelected && '✓'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {lang === 'hi' ? c.descHi : c.descEn}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Toggles */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <p className="text-xs font-bold text-slate-800">
                  {t.togglesHeading}
                </p>

                {/* Woman Entrepreneur */}
                <div 
                  onClick={() => setIsWoman(!isWoman)}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    isWoman ? 'border-purple-300 bg-purple-50/60' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">👩‍💼</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{t.womanLabel}</p>
                      <p className="text-[11px] text-slate-500">{t.womanSub}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isWoman}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                </div>

                {/* Traditional Artisan */}
                <div 
                  onClick={() => setIsArtisan(!isArtisan)}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    isArtisan ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">⚒️</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{t.artisanLabel}</p>
                      <p className="text-[11px] text-slate-500">{t.artisanSub}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isArtisan}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                {/* Divyangjan */}
                <div 
                  onClick={() => setIsDivyang(!isDivyang)}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    isDivyang ? 'border-blue-300 bg-blue-50/60' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">♿</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{t.divyangLabel}</p>
                      <p className="text-[11px] text-slate-500">{t.divyangSub}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isDivyang}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Annual Income */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t.incomeLabel}
                </label>
                <p className="text-[11px] text-slate-500 mb-2">{t.incomeNote}</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={annualIncome}
                    onChange={(e) => {
                      setAnnualIncome(e.target.value);
                      if (errors.annualIncome) setErrors((prev) => ({ ...prev, annualIncome: null }));
                    }}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-2xl border text-sm font-mono font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 ${
                      errors.annualIncome ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.annualIncome && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">{errors.annualIncome}</p>
                )}
                {Number(annualIncome) > 0 && (
                  <p className="text-[11px] font-mono text-[#0E7A53] mt-1 font-semibold">
                    ≈ ₹{(Number(annualIncome) / 100000).toFixed(2)} Lakh / year
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Geography & Scale */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {t.stateLabel}
                  </label>
                  <select
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 cursor-pointer"
                  >
                    {MAJOR_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {t.districtLabel}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      if (errors.district) setErrors((prev) => ({ ...prev, district: null }));
                    }}
                    placeholder={t.districtPlaceholder}
                    className={`w-full px-3 py-2 rounded-2xl border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 ${
                      errors.district ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                  {errors.district && (
                    <p className="text-xs text-red-600 mt-1 font-semibold">{errors.district}</p>
                  )}
                </div>
              </div>

              {/* Location Type (Rural/Urban) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {t.locationLabel}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setLocationType('rural')}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      locationType === 'rural' ? 'border-[#0E7A53] bg-emerald-50/60' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🏡</span>
                      <span className="text-xs font-bold">{t.rural}</span>
                    </div>
                  </div>
                  <div
                    onClick={() => setLocationType('urban')}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      locationType === 'urban' ? 'border-[#0E7A53] bg-emerald-50/60' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🏙️</span>
                      <span className="text-xs font-bold">{t.urban}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Cost & Quick Chips */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t.costLabel}
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 py-1 mr-1">
                    {t.costChips}
                  </span>
                  {COST_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setProjectCost(String(preset.value))}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                        Number(projectCost) === preset.value
                          ? 'bg-[#0E7A53] text-white border-[#0E7A53]'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="10000"
                    step="5000"
                    value={projectCost}
                    onChange={(e) => {
                      setProjectCost(e.target.value);
                      if (errors.projectCost) setErrors((prev) => ({ ...prev, projectCost: null }));
                    }}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-2xl border text-sm font-mono font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 ${
                      errors.projectCost ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                    }`}
                  />
                </div>
                {errors.projectCost && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">{errors.projectCost}</p>
                )}
              </div>

              {/* Promoter Equity */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {t.equityLabel}
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">{t.equityNote}</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={promoterEquity}
                    onChange={(e) => setPromoterEquity(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-300 text-sm font-mono font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30"
                  />
                </div>
              </div>

              {/* Moneylender Debt Toggle & Fields */}
              <div className="pt-2 border-t border-slate-200">
                <div 
                  onClick={() => setHasMoneylenderDebt(!hasMoneylenderDebt)}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    hasMoneylenderDebt ? 'border-rose-400 bg-rose-50/60' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">⛓️</span>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{t.debtCheck}</p>
                      <p className="text-[11px] text-slate-500">{t.debtHeading}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasMoneylenderDebt}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                </div>

                {hasMoneylenderDebt && (
                  <div className="mt-3 p-4 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-3 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        {t.debtPrincipalLabel}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={debtPrincipal}
                          onChange={(e) => setDebtPrincipal(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          {t.debtRateLabel}
                        </label>
                        <input
                          type="text"
                          value={debtRateQuote}
                          onChange={(e) => setDebtRateQuote(e.target.value)}
                          placeholder={t.debtRatePlaceholder}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1">
                          {t.debtMonthsLabel}
                        </label>
                        <input
                          type="number"
                          value={debtMonthsActive}
                          onChange={(e) => setDebtMonthsActive(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Enterprise Intent */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">
                  {t.intentHeading}
                </h3>

                {/* Option Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 mb-4">
                  <button
                    type="button"
                    onClick={() => setIsCustomTrade(false)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      !isCustomTrade ? 'bg-white text-[#0E7A53] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.catalogTab}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCustomTrade(true)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isCustomTrade ? 'bg-white text-[#0E7A53] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    ✨ {t.customTab}
                  </button>
                </div>
              </div>

              {!isCustomTrade ? (
                <div className="space-y-3">
                  {/* Sector Filter Chips */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
                    {sectors.map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setTradeFilter(sec)}
                        className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all cursor-pointer ${
                          tradeFilter === sec
                            ? 'bg-[#0E7A53] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>

                  {/* 24-Trade Catalog Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {filteredTrades.map((trade) => {
                      const isSelected = selectedTradeCode === trade.code;
                      return (
                        <div
                          key={trade.code}
                          onClick={() => setSelectedTradeCode(trade.code)}
                          className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected 
                              ? 'border-[#0E7A53] bg-emerald-50/70 shadow-sm' 
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1.5">
                            <span className="text-xl mr-2">{trade.icon}</span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {trade.code}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-xs text-slate-900 leading-tight mb-0.5">
                              {lang === 'hi' ? trade.nameHi : trade.nameEn}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {lang === 'hi' ? trade.sectorHi : trade.sectorEn}
                            </p>
                          </div>
                          <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                            <span className="font-mono text-emerald-800 font-semibold">{trade.tier}</span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-[#0E7A53] text-white flex items-center justify-center font-bold text-[9px]">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {lang === 'hi' ? 'व्यवसायिक विचार या गतिविधि का नाम' : 'Business Concept / Venture Name'}
                    </label>
                    <textarea
                      rows={3}
                      value={customTradeIdea}
                      onChange={(e) => {
                        setCustomTradeIdea(e.target.value);
                        if (errors.customTrade) setErrors((prev) => ({ ...prev, customTrade: null }));
                      }}
                      placeholder={t.customPlaceholder}
                      className={`w-full p-3 rounded-xl border text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 ${
                        errors.customTrade ? 'border-red-400 bg-red-50/30' : 'border-slate-300'
                      }`}
                    />
                    {errors.customTrade && (
                      <p className="text-xs text-red-600 mt-1 font-semibold">{errors.customTrade}</p>
                    )}
                  </div>
                  <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 text-[11px] text-slate-600 leading-relaxed">
                    💡 {t.customNote}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              ← {t.back}
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#0E7A53] hover:bg-[#0B6544] text-white font-bold text-xs transition-all cursor-pointer shadow-md flex items-center space-x-1.5"
            >
              <span>{t.next}</span>
              <span>→</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-[#0E7A53] hover:bg-[#0B6544] text-white font-bold text-xs transition-all cursor-pointer shadow-lg flex items-center space-x-2"
            >
              <span>{t.finish}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
