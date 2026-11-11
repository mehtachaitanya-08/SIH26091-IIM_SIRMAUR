import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { 
  ArrowRight,
  X,
  LogIn,
  LogOut,
  User,
  Globe,
  Phone,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import SetoDashboard from './components/SetoDashboard';
import ProductionDashboard from './components/ProductionDashboard';
import { 
  getCurrentSession, 
  authenticateByCredentials, 
  authenticateByGoogle, 
  registerUser, 
  clearSession 
} from './data/userDatabase';
import { triggerGoogleLogin } from './services/googleAuth';

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// BILINGUAL STATIC TRANSLATIONS DICTIONARY
// ============================================================================
const TRANSLATIONS = {
  en: {
    // Header
    loginRegister: 'Login / Register',
    workspace: 'Workspace',
    logout: 'Logout',
    // Hero
    heroTitle: ['WHERE', 'OPPORTUNITY', 'TAKES', 'ROOT'],
    scrollExplore: 'SCROLL TO EXPLORE',
    // Thesis
    thesisHeading: 'Statutory credit enables rural producers to fulfill their highest potential.',
    thesisBody: 'To break the cycle of predatory 36% moneylender interest and build intergenerational wealth. Commissioned under the Ministry of Social Justice and Empowerment for Scheduled Caste micro-entrepreneurs across 24 core trade domains.',
    mcfAmount: '≤ ₹1.40 Lakh',
    mcfLabel: 'MCF Concessional @ 6.5%',
    termAmount: 'Up to ₹50 Lakh',
    termLabel: 'Term Loan Facility @ 8.0%',
    dprAmount: 'Lead-Bank Standard',
    dprLabel: 'Statutory 1-Page DPR',
    // Orbit
    orbitTitlePre: 'What does ',
    orbitTitleItalic: 'opportunity',
    orbitTitlePost: ' mean today?',
    orbitBody: 'It means access to 6.5% institutional loans instead of 3-senkda sahukars, 12-month solvency stress testing, and instant bank-sanction DPRs.',
    // Immersion
    riskGaugeLabel: 'LEAN-SEASON RISK',
    immersionHeading: '67% of rural producers',
    immersionBody: 'face catastrophic cash flow collapse during the August lean season without structured statutory amortisation.',
    exploreDashboard: 'EXPLORE ADVISORY DASHBOARD',
    // Pillars
    pillarsHeading: 'The Four Pillars.',
    pillarsBody: 'Translating statutory NSFDC credit guidelines and empirical rural cash flows into a unified advisory platform.',
    card1Title: 'NSFDC Dual-Tier Credit',
    card1Body: 'Statutory micro credit (≤ ₹1.40L @ 6.5% with 11 quarters) and term loans (up to ₹50L @ 8.0% with 26 quarters).',
    card2Title: '12-Month Solvency Model',
    card2Body: 'August monsoon lean-month stress testing across 24 empirical trade domains, preventing default risk.',
    card3Title: 'Mode B Debt Liberation',
    card3Body: 'Consolidating informal 3-senkda (36% APR) sahukar debt into low-cost institutional banking facilities.',
    card4Title: '1-Page Lead-Bank DPR',
    card4Body: 'Single-page bank sanction appraisal conforming to RBI Lead Bank Scheme standards with QR verification.',
    viewDetails: 'View details',
    closeDossier: 'Close Statutory Dossier',
    // Auth Modal
    modalTitleLogin: 'Beneficiary Sign In',
    modalTitleRegister: 'Enterprise Registration',
    modalSubtitle: 'Access your rural advisory & concessional credit workspace',
    tabLogin: 'Sign In',
    tabRegister: 'Register New',
    continueGoogle: 'Continue with Google',
    signUpGoogle: 'Sign up with Google',
    orDivider: 'or continue with mobile',
    phoneLabel: 'Registered Mobile Number',
    phonePlaceholder: 'Enter 10-digit mobile number',
    pinLabel: '4-Digit Security PIN',
    pinPlaceholder: 'Enter 4-digit PIN',
    createPinLabel: 'Create 4-Digit Security PIN',
    nameLabel: 'Entrepreneur Full Name',
    namePlaceholder: 'e.g. Rajesh Singh',
    tradeLabel: 'Enterprise Domain / Trade',
    categoryLabel: 'Beneficiary Social Category',
    submitLogin: 'Sign In & Open Workspace',
    submitRegister: 'Register & Launch Workspace',
    alreadyRegistered: 'Already have an account?',
    needAccount: 'New to GraminAI?',
    signInLink: 'Sign In',
    registerLink: 'Create account'
  },
  hi: {
    // Header
    loginRegister: 'लॉगिन / रजिस्टर',
    workspace: 'कार्यक्षेत्र',
    logout: 'लॉगआउट',
    // Hero
    heroTitle: ['जहाँ', 'अवसर', 'जड़', 'पकड़ता है'],
    scrollExplore: 'आगे देखने के लिए स्क्रॉल करें',
    // Thesis
    thesisHeading: 'सांविधिक ऋण ग्रामीण उत्पादकों को उनकी उच्चतम क्षमता तक पहुँचने में सक्षम बनाता है।',
    thesisBody: 'साहूकारों के 36% शोषणकारी ब्याज चक्र को तोड़कर पीढ़ियों की समृद्धि का निर्माण। 24 मुख्य व्यावसायिक क्षेत्रों में अनुसूचित जाति के सूक्ष्म उद्यमियों हेतु सामाजिक न्याय और अधिकारिता मंत्रालय के तत्वावधान में।',
    mcfAmount: '≤ ₹1.40 लाख',
    mcfLabel: 'एमसीएफ रियायती ऋण @ 6.5%',
    termAmount: '₹50 लाख तक',
    termLabel: 'सावधि ऋण सुविधा @ 8.0%',
    dprAmount: 'अग्रणी बैंक मानक',
    dprLabel: 'सांविधिक 1-पृष्ठीय डीपीआर',
    // Orbit
    orbitTitlePre: 'आज ',
    orbitTitleItalic: 'अवसर',
    orbitTitlePost: ' का क्या अर्थ है?',
    orbitBody: 'इसका अर्थ है 3-सेंकड़ा साहूकार के बजाय 6.5% संस्थागत ऋण, 12 महीने का सॉल्वेंसी स्ट्रेस टेस्ट और तत्काल बैंक स्वीकृति डीपीआर तक सीधी पहुँच।',
    // Immersion
    riskGaugeLabel: 'मंदी-मौसम जोखिम',
    immersionHeading: '67% ग्रामीण उत्पादक',
    immersionBody: 'संरचित सांविधिक ऋण चुकौती के बिना अगस्त के मंदी मौसम में गंभीर नकदी संकट का सामना करते हैं।',
    exploreDashboard: 'सलाहकार डैशबोर्ड देखें',
    // Pillars
    pillarsHeading: 'चार प्रमुख स्तंभ.',
    pillarsBody: 'सांविधिक एनएसएफडीसी ऋण दिशानिर्देशों और ग्रामीण नकदी प्रवाह को एक एकीकृत सलाहकार मंच में परिवर्तित करना।',
    card1Title: 'एनएसएफडीसी द्वि-स्तरीय ऋण',
    card1Body: 'सांविधिक माइक्रो क्रेडिट (≤ ₹1.40 लाख @ 6.5%, 11 तिमाही) एवं सावधि ऋण (₹50 लाख तक @ 8.0%, 26 तिमाही)।',
    card2Title: '12-माह सॉल्वेंसी मॉडल',
    card2Body: '24 वास्तविक व्यापार क्षेत्रों में अगस्त मानसून मंदी के महीनों का तनाव परीक्षण, जिससे डिफ़ॉल्ट जोखिम रुकता है।',
    card3Title: 'मोड बी साहूकारी ऋण मुक्ति',
    card3Body: 'अनौपचारिक 3-सेंकड़ा (36% वार्षिक) साहूकार ऋण को कम ब्याज वाली संस्थागत बैंकिंग सुविधा में बदलना।',
    card4Title: '1-पृष्ठीय लीड-बैंक डीपीआर',
    card4Body: 'आरबीआई लीड बैंक योजना मानकों के अनुरूप क्यूआर सत्यापन युक्त एकल-पृष्ठीय बैंक स्वीकृति प्रस्ताव।',
    viewDetails: 'विवरण देखें',
    closeDossier: 'सांविधिक दस्तावेज बंद करें',
    // Auth Modal
    modalTitleLogin: 'लाभार्थी लॉगिन',
    modalTitleRegister: 'उद्यम पंजीकरण',
    modalSubtitle: 'ग्रामीण सलाहकार एवं रियायती ऋण कार्यक्षेत्र में प्रवेश करें',
    tabLogin: 'लॉगिन',
    tabRegister: 'नया पंजीकरण',
    continueGoogle: 'Google से जारी रखें',
    signUpGoogle: 'Google से रजिस्टर करें',
    orDivider: 'अथवा मोबाइल नंबर द्वारा',
    phoneLabel: 'पंजीकृत मोबाइल नंबर',
    phonePlaceholder: '10 अंकों का मोबाइल नंबर दर्ज करें',
    pinLabel: '4-अंकीय सुरक्षा PIN',
    pinPlaceholder: '4-अंकीय PIN दर्ज करें',
    createPinLabel: '4-अंकीय सुरक्षा PIN बनाएं',
    nameLabel: 'उद्यमी का पूरा नाम',
    namePlaceholder: 'उदा. राजेश सिंह',
    tradeLabel: 'उद्यम क्षेत्र / व्यापार',
    categoryLabel: 'लाभार्थी सामाजिक श्रेणी',
    submitLogin: 'लॉगिन करें एवं कार्यक्षेत्र खोलें',
    submitRegister: 'पंजीकरण करें एवं कार्यक्षेत्र खोलें',
    alreadyRegistered: 'क्या पहले से खाता है?',
    needAccount: 'GraminAI पर नए हैं?',
    signInLink: 'लॉगिन करें',
    registerLink: 'खाता बनाएं'
  }
};

// ============================================================================
// BILINGUAL PILLAR DOSSIERS (MODAL CONTENTS)
// ============================================================================
const PILLAR_DOSSIERS = {
  en: {
    1: {
      number: 'PILLAR 01',
      title: 'NSFDC Dual-Tier Credit Architecture',
      color: '#0E7A53',
      mandate: 'MoSJE Mandate · Concessional Lending Framework',
      summary: 'Direct institutional credit structuring conforming to statutory National Scheduled Castes Finance and Development Corporation guidelines.',
      specifications: [
        { label: 'Micro Credit Facility (MCF)', value: 'Up to ₹1,40,000 @ 6.5% p.a. (11 quarters tenure, 1 moratorium quarter)' },
        { label: 'Term Loan Facility', value: 'Up to ₹50,00,000 @ 8.0% p.a. (26 quarters tenure, 2 moratorium quarters)' },
        { label: 'Beneficiary Eligibility', value: 'Scheduled Caste (SC) micro-entrepreneurs; household income ≤ ₹5,00,000' },
        { label: 'Margin Money Structure', value: 'Up to 90% concessional loan routing with 10% entrepreneur margin contribution' }
      ]
    },
    2: {
      number: 'PILLAR 02',
      title: '12-Month Solvency Stress Simulator',
      color: '#B47228',
      mandate: 'Monsoon Cash-Flow Resilience & DSCR Verification',
      summary: 'Dynamic month-by-month cash flow modeling across 24 empirical trade dossiers to prevent debt distress during seasonal contractions.',
      specifications: [
        { label: 'Lean Season Simulation', value: 'Simulates August monsoon revenue drops (-35% to -45%) across rural trades' },
        { label: 'Solvency Benchmark', value: 'Enforces statutory Debt Service Coverage Ratio (DSCR ≥ 1.50) across all 12 operating cycles' },
        { label: 'Empirical Coverage', value: '24 validated trade dossiers spanning agro-processing, tailoring, retail, and artisanal crafts' },
        { label: 'Stress Buffer Alert', value: 'Calculates operational working capital reserve thresholds before loan sanction' }
      ]
    },
    3: {
      number: 'PILLAR 03',
      title: 'Mode B Debt Liberation (Sahukar Refinance)',
      color: '#E86043',
      mandate: 'Usurious Loans Act & Rule of Damdupat Statutory Relief',
      summary: 'Systematic consolidation of informal high-interest moneylender debt into low-cost institutional banking facilities.',
      specifications: [
        { label: 'Informal Debt Conversion', value: 'Refinances 3-senkda to 5-senkda (36% to 60% APR) compounding debt to 6.5% p.a.' },
        { label: 'Rule of Damdupat Threshold', value: 'Automatically triggers legal violation alerts when total interest paid equals or exceeds principal' },
        { label: 'Statutory Shield', value: 'Leverages Section 3 of the Usurious Loans Act to halt compound interest penalties' },
        { label: 'Household Cash Liberation', value: 'Releases up to ₹4,800/month in predatory servicing charges back into working capital' }
      ]
    },
    4: {
      number: 'PILLAR 04',
      title: 'Statutory 1-Page Lead-Bank DPR',
      color: '#4A6274',
      mandate: 'RBI Lead Bank Scheme Standardized Appraisal Format',
      summary: 'Instant generation of an auditable, single-page bank sanction appraisal conforming to Lead Bank Scheme standards.',
      specifications: [
        { label: 'Appraisal Layout', value: 'Single-page concise lead-bank appraisal with QR code verification hash' },
        { label: 'Statutory Financial Metrics', value: 'Embedded CAPEX, OPEX, Break-Even, Sensitivity, and DSCR amortization tables' },
        { label: 'Branch Approval Routing', value: 'Pre-formatted for Lead District Managers (LDMs) and District Industry Centres (DICs)' },
        { label: 'Scheme Alignment', value: 'Full statutory mapping to NSFDC Term Loan / MCF and PM Vishwakarma craft guidelines' }
      ]
    }
  },
  hi: {
    1: {
      number: 'स्तंभ 01',
      title: 'एनएसएफडीसी द्वि-स्तरीय ऋण संरचना',
      color: '#0E7A53',
      mandate: 'सामाजिक न्याय मंत्रालय शासनादेश · रियायती ऋण ढाँचा',
      summary: 'राष्ट्रीय अनुसूचित जाति वित्त एवं विकास निगम (NSFDC) के सांविधिक दिशानिर्देशों के अनुरूप प्रत्यक्ष संस्थागत ऋण संरचना।',
      specifications: [
        { label: 'माइक्रो क्रेडिट सुविधा (MCF)', value: '₹1,40,000 तक @ 6.5% वार्षिक (11 तिमाही अवधि, 1 मोराटोरियम तिमाही)' },
        { label: 'सावधि ऋण सुविधा (Term Loan)', value: '₹50,00,000 तक @ 8.0% वार्षिक (26 तिमाही अवधि, 2 मोराटोरियम तिमाही)' },
        { label: 'लाभार्थी पात्रता', value: 'अनुसूचित जाति (SC) सूक्ष्म-उद्यमी; वार्षिक पारिवारिक आय ≤ ₹5,00,000' },
        { label: 'मार्जिन मनी संरचना', value: '90% तक रियायती ऋण सुविधा एवं 10% उद्यमी स्वयं का अंशदान' }
      ]
    },
    2: {
      number: 'स्तंभ 02',
      title: '12-माह सॉल्वेंसी स्ट्रेस सिम्युलेटर',
      color: '#B47228',
      mandate: 'मानसून नकदी प्रवाह संवहनीयता एवं डीएससीआर सत्यापन',
      summary: 'मौसमी मंदी के दौरान ऋण संकट रोकने के लिए 24 वास्तविक व्यापार डोज़ियर में माह-दर-माह नकदी प्रवाह मॉडलिंग।',
      specifications: [
        { label: 'मंदी मौसम सिमुलेशन', value: 'अगस्त मानसून में ग्रामीण व्यवसायों में राजस्व में 35% से 45% की गिरावट का अनुकरण' },
        { label: 'सॉल्वेंसी मानक', value: 'सभी 12 परिचालन चक्रों में अनिवार्य ऋण सेवा कवरेज अनुपात (DSCR ≥ 1.50) लागू' },
        { label: 'व्यावहारिक कवरेज', value: 'कृषि-प्रसंस्करण, सिलाई, किराना और हस्तशिल्प में 24 सत्यापित व्यापार प्रोफाइल' },
        { label: 'स्ट्रेस बफर अलर्ट', value: 'ऋण स्वीकृति से पूर्व परिचालन कार्यशील पूंजी आरक्षित सीमा का सटीक निर्धारण' }
      ]
    },
    3: {
      number: 'स्तंभ 03',
      title: 'मोड बी साहूकारी ऋण मुक्ति (साहूकार पुनर्वित्त)',
      color: '#E86043',
      mandate: 'शोषक ऋण अधिनियम एवं दामदुपत नियम के तहत सांविधिक राहत',
      summary: 'अनौपचारिक अत्यधिक ब्याज वाले साहूकारी कर्ज को व्यवस्थित रूप से कम लागत वाले संस्थागत बैंक ऋण में परिवर्तित करना।',
      specifications: [
        { label: 'अनौपचारिक ऋण परिवर्तन', value: '3-सेंकड़ा से 5-सेंकड़ा (36% से 60% वार्षिक) चक्रवृद्धिकारी कर्ज को 6.5% वार्षिक में पुनर्वित्त' },
        { label: 'दामदुपत नियम सीमा', value: 'जब चुकाया गया कुल ब्याज मूलधन के बराबर या उससे अधिक हो जाए तो स्वतः कानूनी चेतावनी' },
        { label: 'सांविधिक सुरक्षा कवच', value: 'चक्रवृद्धि ब्याज दंड को रोकने के लिए शोषक ऋण अधिनियम (धारा 3) का उपयोग' },
        { label: 'मासिक नकदी मुक्ति', value: 'साहूकार को दिए जाने वाले प्रति माह ₹4,800 तक के शोषणकारी ब्याज से राहत' }
      ]
    },
    4: {
      number: 'स्तंभ 04',
      title: 'सांविधिक 1-पृष्ठीय लीड-बैंक डीपीआर',
      color: '#4A6274',
      mandate: 'आरबीआई लीड बैंक योजना मानकीकृत मूल्यांकन प्रारूप',
      summary: 'लीड बैंक योजना के मानकों के अनुसार क्यूआर कोड सत्यापन युक्त एक-पृष्ठीय बैंक स्वीकृति डीपीआर का त्वरित निर्माण।',
      specifications: [
        { label: 'मूल्यांकन प्रारूप', value: 'क्यूआर कोड सत्यापन हैश के साथ एकल-पृष्ठीय संक्षिप्त बैंक स्वीकृति प्रस्ताव' },
        { label: 'सांविधिक वित्तीय मापदंड', value: 'कैपेक्स, ओपेक्स, ब्रेक-ईवन, संवेदनशीलता और डीएससीआर परिशोधन सारणी सम्मिलित' },
        { label: 'शाखा अनुमोदन रूटिंग', value: 'लीड डिस्ट्रिक्ट मैनेजर्स (LDMs) और जिला उद्योग केंद्र (DICs) के लिए पूर्व-प्रारूपित' },
        { label: 'योजना संरेखण', value: 'एनएसएफडीसी सावधि ऋण / एमसीएफ और पीएम विश्वकर्मा शिल्प दिशानिर्देशों के साथ पूर्ण मैपिंग' }
      ]
    }
  }
};

export default function App() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const thesisRef = useRef(null);
  const orbitRef = useRef(null);
  const immersiveRef = useRef(null);
  const cardsRef = useRef(null);
  const lenisRef = useRef(null);
  
  const [activeSection, setActiveSection] = useState(1);
  const [selectedPillarModal, setSelectedPillarModal] = useState(null);

  // Global Language State ('en' | 'hi')
  const [language, setLanguage] = useState('en');
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Top-Level View Routing: 'landing' | 'dashboard'
  const [currentView, setCurrentView] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (p === '/dashboard' || p.startsWith('/dashboard') || h === '#/dashboard' || h === '#dashboard') {
        return 'dashboard';
      }
    }
    return 'landing';
  });

  // Strict Synchronous Reversion of GSAP DOM Modifications & Lenis Smooth Scroll
  const cleanupLandingAnimations = useCallback(() => {
    try {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.getAll().forEach((st) => {
          try {
            st.revert();
            st.kill(true);
          } catch (e) {
            // Ignore individual trigger cleanup warnings
          }
        });
      }
      if (lenisRef.current) {
        try {
          lenisRef.current.destroy();
        } catch (e) {}
        lenisRef.current = null;
      }
      if (typeof document !== 'undefined') {
        if (document.documentElement) {
          document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
          document.documentElement.style.overflow = '';
          document.documentElement.style.height = '';
          document.documentElement.scrollTop = 0;
        }
        if (document.body) {
          document.body.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
          document.body.style.overflow = '';
          document.body.style.height = '';
          document.body.scrollTop = 0;
        }
      }
    } catch (err) {
      console.warn('[GraminAI] Clean up landing animations warning:', err);
    }
  }, []);

  const navigateToDashboard = useCallback(() => {
    cleanupLandingAnimations();
    setCurrentView('dashboard');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/dashboard');
      window.scrollTo(0, 0);
    }
  }, [cleanupLandingAnimations]);

  const navigateToLanding = useCallback(() => {
    cleanupLandingAnimations();
    setCurrentView('landing');
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/');
      window.scrollTo(0, 0);
    }
  }, [cleanupLandingAnimations]);

  useEffect(() => {
    const handleLocationChange = () => {
      const p = window.location.pathname;
      const h = window.location.hash;
      const isDash = p === '/dashboard' || p.startsWith('/dashboard') || h === '#/dashboard' || h === '#dashboard';
      cleanupLandingAnimations();
      setCurrentView(isDash ? 'dashboard' : 'landing');
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [cleanupLandingAnimations]);

  // Ensure scroll reset and clean viewport whenever switching views
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
      }
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped');
        document.body.style.overflow = '';
        document.body.style.height = '';
      }
    }
  }, [currentView]);

  // Authentication State & Modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [currentUser, setCurrentUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Auth Form Fields
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regTrade, setRegTrade] = useState('D20 Metal Smithy');
  const [regCategory, setRegCategory] = useState('Scheduled Caste (SC)');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Restore active session on mount
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setCurrentUser(session);
    }
  }, []);

  // Google Authentication Handler (Both Login & Register)
  const handleGoogleAuth = async () => {
    setAuthError(null);
    setIsAuthenticating(true);
    try {
      const googleProfile = await triggerGoogleLogin();
      const result = authenticateByGoogle(googleProfile);
      if (result.success) {
        setCurrentUser(result.user);
        setIsAuthModalOpen(false);
        navigateToDashboard();
      } else {
        setAuthError(result.error || 'Failed to authenticate Google profile.');
      }
    } catch (err) {
      setAuthError(err.message || 'Google authentication failed.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Custom User Sign In Handler
  const handleCustomLogin = (e) => {
    e.preventDefault();
    setAuthError(null);
    const result = authenticateByCredentials(loginPhone, loginPin);
    if (result.success) {
      setCurrentUser(result.user);
      setIsAuthModalOpen(false);
      navigateToDashboard();
    } else {
      setAuthError(result.error || 'Invalid mobile number or security PIN.');
    }
  };

  // Registration Handler
  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError(null);
    const result = registerUser({
      name: regName,
      phone: regPhone,
      pin: regPin,
      trade: regTrade,
      category: regCategory
    });
    if (result.success) {
      setCurrentUser(result.user);
      setIsAuthModalOpen(false);
      navigateToDashboard();
    } else {
      setAuthError(result.error);
    }
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    navigateToLanding();
  };

  // Initialize Lenis Smooth Scroll + GSAP ScrollTrigger Synchronization (Landing View Only)
  useEffect(() => {
    if (currentView !== 'landing') return;

    let lenis;
    let updateTicker;
    let rafId;
    let refreshTimer;

    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 2.0,
      });

      lenisRef.current = lenis;

      lenis.on('scroll', ScrollTrigger.update);

      function raf(time) {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      }
      rafId = requestAnimationFrame(raf);

      // Refresh ScrollTrigger after DOM & images settle
      refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 250);
    } catch (err) {
      console.warn("Lenis initialization error:", err);
    }

    // GSAP Context with strict cleanup
    const ctx = gsap.context(() => {
      // Pin center card exactly in center before animating
      gsap.set("#hero-center-card", { left: "50%", top: "50%", xPercent: -50, yPercent: -50 });

      // -------------------------------------------------------------
      // SCENE 1: HERO DISPERSION TIMELINE
      // -------------------------------------------------------------
      const tlHero = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=130%",
          pin: true,
          scrub: 1.2,
          anticipatePin: 1
        }
      });

      tlHero
        .to("#hero-center-card", { scale: 0.62, opacity: 0, y: -40, duration: 1 })
        .to("#hero-sat-1", { x: 260, y: -180, scale: 0.35, opacity: 0, duration: 1 }, 0)
        .to("#hero-sat-2", { x: -280, y: 160, scale: 0.35, opacity: 0, duration: 1 }, 0)
        .to("#hero-sat-3", { x: 300, y: 180, scale: 0.35, opacity: 0, duration: 1 }, 0)
        .to("#hero-sat-4", { x: -240, y: -160, scale: 0.35, opacity: 0, duration: 1 }, 0)
        .fromTo("#hero-headline-wrap", { scale: 0.96 }, { scale: 1.04, duration: 1 }, 0)
        .to("#hero-headline-wrap", { opacity: 0.15, y: -60, duration: 0.8 }, 0.6);

      // -------------------------------------------------------------
      // SCENE 2: VERTICAL LINE DROP & THESIS REVEAL
      // -------------------------------------------------------------
      gsap.fromTo("#thesis-line", 
        { scaleY: 0 },
        { 
          scaleY: 1, 
          duration: 1.2, 
          ease: "power2.out",
          scrollTrigger: {
            trigger: thesisRef.current,
            start: "top 65%",
            toggleActions: "play none none reverse"
          }
        }
      );
      gsap.fromTo("#thesis-dot",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          delay: 0.8,
          ease: "back.out(2)",
          scrollTrigger: {
            trigger: thesisRef.current,
            start: "top 65%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // -------------------------------------------------------------
      // SCENE 3: PINNED ORBITAL VORTEX TIMELINE
      // -------------------------------------------------------------
      const tlOrbit = gsap.timeline({
        scrollTrigger: {
          trigger: orbitRef.current,
          start: "top top",
          end: "+=150%",
          pin: "#orbit-pinned-wrap",
          scrub: 1.0
        }
      });

      tlOrbit
        .from(".orbit-tile", {
          scale: 0.3,
          opacity: 0,
          stagger: 0.04,
          duration: 0.8,
          ease: "power2.out"
        })
        .from("#orbit-center-text", {
          opacity: 0,
          scale: 0.92,
          duration: 0.8
        }, 0.15)
        .to("#orbit-ring", {
          rotation: 60,
          duration: 2,
          ease: "none"
        }, 0.3)
        .to(".orbit-tile-inner", {
          rotation: -60,
          duration: 2,
          ease: "none"
        }, 0.3);

      // -------------------------------------------------------------
      // SCENE 4: IMMERSIVE ARC GAUGE (FILLS TO 67%)
      // -------------------------------------------------------------
      gsap.fromTo('#gauge-circle',
        { strokeDashoffset: 283 },
        {
          strokeDashoffset: 93,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: immersiveRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // -------------------------------------------------------------
      // SCENE 5: 4 PILLARS STAGGERED REVEAL
      // -------------------------------------------------------------
      gsap.from(".pillar-card", {
        y: 30,
        stagger: 0.12,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });

      // -------------------------------------------------------------
      // FLOATING CAPSULE SCROLL TRACKER (SCENES 1 TO 6)
      // -------------------------------------------------------------
      const sectionSelectors = [
        { id: '#hero-pinned-scene', idx: 1 },
        { id: '#scene-thesis', idx: 2 },
        { id: '#scene-orbit', idx: 3 },
        { id: '#scene-immersive', idx: 4 },
        { id: '#scene-cards', idx: 5 },
        { id: '#dashboard-section', idx: 6 }
      ];

      sectionSelectors.forEach(({ id, idx }) => {
        ScrollTrigger.create({
          trigger: id,
          start: "top 45%",
          end: "bottom 45%",
          onEnter: () => setActiveSection(idx),
          onEnterBack: () => setActiveSection(idx)
        });
      });

    }, containerRef.current);

    return () => {
      if (updateTicker) {
        gsap.ticker.remove(updateTicker);
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      try {
        ctx.revert();
        ScrollTrigger.getAll().forEach((t) => {
          try {
            t.revert();
            t.kill(true);
          } catch (e) {}
        });
      } catch (e) {}
      if (lenis) {
        try {
          lenis.destroy();
        } catch (e) {}
      }
      lenisRef.current = null;
    };
  }, [currentView]);

  const scrollToTarget = (targetId) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetId, { duration: 1.4 });
    } else {
      const el = document.querySelector(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Shared Auth Modal Renderer
  const renderAuthModal = () => {
    if (!isAuthModalOpen) return null;
    return (
      <div 
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        onClick={() => setIsAuthModalOpen(false)}
      >
        <div 
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-black/10 space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between border-b border-black/5 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#0E7A53]/10 flex items-center justify-center text-[#0E7A53] flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sans-ui font-bold text-lg text-[#111311] leading-tight">
                  {authTab === 'login' ? t.modalTitleLogin : t.modalTitleRegister}
                </h3>
                <p className="text-[11px] text-[#686D65] font-sans-ui mt-0.5 leading-snug">
                  {t.modalSubtitle}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#F4F1EA] rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setAuthTab('login');
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer font-sans-ui ${
                authTab === 'login'
                  ? 'bg-white text-[#111311] shadow-sm'
                  : 'text-[#686D65] hover:text-[#111311]'
              }`}
            >
              {t.tabLogin}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('register');
                setAuthError(null);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer font-sans-ui ${
                authTab === 'register'
                  ? 'bg-white text-[#111311] shadow-sm'
                  : 'text-[#686D65] hover:text-[#111311]'
              }`}
            >
              {t.tabRegister}
            </button>
          </div>

          {/* Google Authentication Option (Present on Both Login & Register) */}
          <button
            type="button"
            disabled={isAuthenticating}
            onClick={handleGoogleAuth}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-[#111311] text-xs font-bold font-sans-ui flex items-center justify-center space-x-3 transition-all shadow-sm hover:shadow hover:border-slate-400 cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {/* Google Official Multi-Color Emblem */}
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>{isAuthenticating ? (language === 'hi' ? 'Google से जुड़ रहे हैं...' : 'Connecting to Google...') : (authTab === 'login' ? t.continueGoogle : t.signUpGoogle)}</span>
          </button>

          {/* Clear Aesthetic Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full"></div>
            <span className="bg-white px-3 text-[10px] font-mono-num uppercase tracking-wider text-[#686D65] absolute">
              {t.orDivider}
            </span>
          </div>

          {/* Error Message Alert */}
          {authError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form Fields: Login */}
          {authTab === 'login' ? (
            <form onSubmit={handleCustomLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#111311] font-sans-ui mb-1.5">
                  {t.phoneLabel}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="tel"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono-num text-[#111311] focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 focus:border-[#0E7A53] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111311] font-sans-ui mb-1.5">
                  {t.pinLabel}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="password"
                    required
                    maxLength={6}
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder={t.pinPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono-num text-[#111311] focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 focus:border-[#0E7A53] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#111311] text-white font-mono-num font-bold text-xs py-3 rounded-xl hover:bg-black transition-all cursor-pointer uppercase tracking-wider shadow-md mt-1"
              >
                {t.submitLogin}
              </button>

              <div className="pt-2 text-center text-xs text-[#686D65] font-sans-ui">
                <span>{t.needAccount} </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setAuthError(null);
                  }}
                  className="font-bold text-[#0E7A53] hover:underline cursor-pointer ml-1"
                >
                  {t.registerLink}
                </button>
              </div>
            </form>
          ) : (
            /* Form Fields: Register */
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#111311] font-sans-ui mb-1">
                  {t.nameLabel}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={t.namePlaceholder}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-[#111311] focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 focus:border-[#0E7A53] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-[#111311] font-sans-ui mb-1">
                    {t.phoneLabel}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono-num text-[#111311] focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 focus:border-[#0E7A53] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111311] font-sans-ui mb-1">
                    {t.createPinLabel}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="password"
                      required
                      maxLength={6}
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value)}
                      placeholder="4 digits"
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-mono-num text-[#111311] focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 focus:border-[#0E7A53] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111311] font-sans-ui mb-1">
                  {t.tradeLabel}
                </label>
                <select
                  value={regTrade}
                  onChange={(e) => setRegTrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-[#111311] bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 focus:border-[#0E7A53] transition-all cursor-pointer"
                >
                  <option value="D20 Metal Smithy">
                    D20 Metal Smithy (lohar): farm hand tools, gates, grills
                  </option>
                  <option value="D08 Mustard & Edible Oil Expeller Mill">
                    {language === 'hi' ? 'D08 सरसों एवं खाद्य तेल स्पेलर मिल' : 'D08 Mustard & Edible Oil Expeller Mill'}
                  </option>
                  <option value="D18 Village Tailoring & Garments">
                    {language === 'hi' ? 'D18 ग्रामीण सिलाई एवं वस्त्र निर्माण' : 'D18 Village Tailoring & Garments'}
                  </option>
                  <option value="D15 Tractor & Farm Equipment Garage">
                    {language === 'hi' ? 'D15 ट्रैक्टर एवं कृषि उपकरण गैराज' : 'D15 Tractor & Farm Equipment Garage'}
                  </option>
                  <option value="D04 Commercial Dairy Unit">
                    {language === 'hi' ? 'D04 ग्रामीण वाणिज्यिक डेयरी यूनिट' : 'D04 Commercial Dairy Unit'}
                  </option>
                  <option value="D01 Kirana & General Provision">
                    {language === 'hi' ? 'D01 ग्रामीण किराना एवं प्रोविजन स्टोर' : 'D01 Kirana & General Provision'}
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111311] font-sans-ui mb-1">
                  {t.categoryLabel}
                </label>
                <select
                  value={regCategory}
                  onChange={(e) => setRegCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs text-[#111311] bg-white focus:outline-none focus:ring-2 focus:ring-[#0E7A53]/30 focus:border-[#0E7A53] transition-all cursor-pointer"
                >
                  <option value="Scheduled Caste (SC)">
                    {language === 'hi' ? 'अनुसूचित जाति (SC) · 100% पात्रता' : 'Scheduled Caste (SC) · Verified Eligibility'}
                  </option>
                  <option value="Scheduled Tribe (ST)">
                    {language === 'hi' ? 'अनुसूचित जनजाति (ST)' : 'Scheduled Tribe (ST)'}
                  </option>
                  <option value="Other Backward Classes (OBC)">
                    {language === 'hi' ? 'अन्य पिछड़ा वर्ग (OBC)' : 'Other Backward Classes (OBC)'}
                  </option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#111311] text-white font-mono-num font-bold text-xs py-3 rounded-xl hover:bg-black transition-all cursor-pointer uppercase tracking-wider shadow-md mt-1"
              >
                {t.submitRegister}
              </button>

              <div className="pt-2 text-center text-xs text-[#686D65] font-sans-ui">
                <span>{t.alreadyRegistered} </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setAuthError(null);
                  }}
                  className="font-bold text-[#0E7A53] hover:underline cursor-pointer ml-1"
                >
                  {t.signInLink}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  };

  // ==========================================================================
  // DEDICATED FULL-PAGE PRODUCTION DASHBOARD VIEW
  // When currentView === 'dashboard', render standalone dashboard (NO landing page)
  // ==========================================================================
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#F4F1EA] text-[#111311] font-sans-ui flex flex-col antialiased selection:bg-[#111311] selection:text-white">
        {/* Dedicated Standalone Dashboard Top Navigation */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/10 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-sm">
          {/* Left: Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={navigateToLanding}
              className="flex items-center space-x-2.5 cursor-pointer group text-left"
              title="Return to GraminAI Landing Page"
            >
              <img
                src="/images/logo.png"
                alt="GraminAI Emblem"
                className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <span className="font-extrabold text-lg sm:text-xl text-[#111311] tracking-tight font-sans-ui">
                GraminAI
              </span>
            </button>
          </div>

          {/* Right: Controls & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* MyGov data.gov.in Live Status */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span className="text-[11px] font-mono-num">data.gov.in connected</span>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(prev => prev === 'en' ? 'hi' : 'en')}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* User Profile / Status */}
            {currentUser ? (
              <div className="flex items-center space-x-1.5">
                <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-100 text-[#111311] text-xs font-medium border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span className="max-w-[120px] sm:max-w-[160px] truncate">{currentUser.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 rounded-lg bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer"
                  title={t.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthError(null);
                  setIsAuthModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#111311] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.loginRegister}</span>
              </button>
            )}

            {/* Back to Landing Page Button */}
            <button
              onClick={navigateToLanding}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-sm transition-colors cursor-pointer"
            >
              <span>{language === 'hi' ? '← मुख्य पृष्ठ' : '← Landing Page'}</span>
            </button>
          </div>
        </header>

        {/* Dedicated Standalone Production Dashboard Container */}
        <main className="flex-1 w-full p-2 sm:p-4 flex flex-col">
          <ProductionDashboard
            language={language}
            currentUser={currentUser}
            onNavigateHome={navigateToLanding}
          />
        </main>

        {/* Global Auth Modal Container */}
        {renderAuthModal()}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-[#F4F1EA] text-[#111311] antialiased selection:bg-[#111311] selection:text-white relative">
      
      {/* ============================================================== */}
      {/* FIXED EDITORIAL HEADER BAR                                     */}
      {/* ============================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-10 flex items-center justify-between pointer-events-none">
        
        {/* Left: Tactile Language Toggle Switch */}
        <div className="pointer-events-auto flex items-center">
          <button
            onClick={() => setLanguage(prev => prev === 'en' ? 'hi' : 'en')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs font-mono-num font-bold text-[#111311] shadow-sm border border-black/10 transition-all hover:scale-105 cursor-pointer backdrop-blur-sm"
            aria-label="Toggle language between English and Hindi"
          >
            <Globe className="w-3.5 h-3.5 text-[#0E7A53]" />
            <span className={language === 'en' ? 'text-[#0E7A53] font-extrabold' : 'text-[#686D65]'}>EN</span>
            <span className="text-black/30 font-normal">|</span>
            <span className={language === 'hi' ? 'text-[#0E7A53] font-extrabold' : 'text-[#686D65]'}>हिन्दी</span>
          </button>
        </div>

        {/* Center: Official Brand Emblem */}
        <div 
          onClick={() => scrollToTarget('#hero-pinned-scene')}
          className="pointer-events-auto flex items-center justify-center cursor-pointer group"
        >
          <img 
            src="/images/logo.png" 
            alt="GraminAI Emblem" 
            className="h-10 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Right: Authentication or Active User Session */}
        <div className="pointer-events-auto flex items-center justify-end">
          {!currentUser ? (
            <button 
              onClick={() => {
                setAuthError(null);
                setIsAuthModalOpen(true);
              }} 
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#111311] text-white hover:bg-black text-xs font-mono-num font-semibold shadow-md transition-all hover:scale-105 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.loginRegister}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button 
                onClick={navigateToDashboard} 
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#0E7A53] hover:bg-[#0c6846] text-white text-xs font-mono-num font-bold shadow-md transition-all hover:scale-105 cursor-pointer"
                title={`${currentUser.name} · Open Dedicated Workspace`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                <span className="max-w-[120px] truncate">{currentUser.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-white" />
              </button>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-red-600 shadow-sm border border-black/10 transition-all cursor-pointer"
                title={t.logout}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ============================================================== */}
      {/* MINIMAL FLOATING GUIDE INDICATOR                               */}
      {/* ============================================================== */}
      <aside className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-4 pointer-events-auto">
        {[
          { idx: 1, label: '01', target: '#hero-pinned-scene' },
          { idx: 2, label: '02', target: '#scene-thesis' },
          { idx: 3, label: '03', target: '#scene-orbit' },
          { idx: 4, label: '04', target: '#scene-immersive' },
          { idx: 5, label: '05', target: '#scene-cards' },
          { idx: 6, label: '06', target: '#dashboard-section' }
        ].map((item) => (
          <button
            key={item.idx}
            onClick={() => scrollToTarget(item.target)}
            aria-label={`Go to section ${item.label}`}
            className="group flex items-center cursor-pointer p-1"
          >
            <span className={`text-[10px] font-mono-num transition-all duration-300 ${
              activeSection === item.idx 
                ? 'text-[#111311] font-bold scale-125' 
                : 'text-[#686D65]/40 hover:text-[#111311]'
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </aside>

      {/* ============================================================== */}
      {/* SCENE 1: PINNED HERO DISPERSION                                */}
      {/* ============================================================== */}
      <div className="hero-pin-outer w-full relative">
        <section 
          id="hero-pinned-scene" 
          ref={heroRef} 
          className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[#F4F1EA]"
        >
        {/* Giant Condensed Serif Typography Behind Imagery */}
        <div id="hero-headline-wrap" className="absolute inset-0 flex flex-col items-center justify-center text-center select-none z-10 pointer-events-none px-4">
          <h1 className="hero-big-title font-editorial font-normal uppercase text-[#111311]">
            {t.heroTitle.map((line, idx) => (
              <div key={idx}>{line}</div>
            ))}
          </h1>
        </div>

        {/* Floating Photo Cluster Dispersing Outward on Scrub */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          
          {/* Central Card: Rural Advisory in Action */}
          <div 
            id="hero-center-card" 
            className="absolute w-[320px] sm:w-[420px] md:w-[480px] h-[220px] sm:h-[280px] md:h-[310px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 pointer-events-auto"
          >
            <img 
              src="/images/hero_center.jpg" 
              onError={(e) => { e.currentTarget.src = "/images/landing/2.jpg"; }}
              alt="Rural producer receiving credit and enterprise advisory" 
              className="w-full h-full object-cover filter brightness-[0.96] contrast-[1.05]"
            />
          </div>

          {/* Satellite 1: Top-Right (Two Tractors Plowing at Sunrise) */}
          <div 
            id="hero-sat-1" 
            className="absolute -top-4 sm:top-14 right-4 sm:right-24 md:right-32 w-28 sm:w-36 md:w-44 h-20 sm:h-26 md:h-32 rounded-xl overflow-hidden shadow-xl border-2 border-white/95 bg-slate-900 pointer-events-auto"
          >
            <img 
              src="/images/hero_sat_1.jpg" 
              onError={(e) => { e.currentTarget.src = "/images/landing/1.jpg"; }}
              alt="Agro-mechanization and farm harvesting" 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Satellite 2: Bottom-Left (Rural Retail Kirana Store) */}
          <div 
            id="hero-sat-2" 
            className="absolute bottom-12 sm:bottom-20 left-4 sm:left-24 md:left-32 w-32 sm:w-44 md:w-52 h-22 sm:h-30 md:h-36 rounded-xl overflow-hidden shadow-xl border-2 border-white/95 bg-slate-900 pointer-events-auto"
          >
            <img 
              src="/images/hero_sat_2.jpg" 
              onError={(e) => { e.currentTarget.src = "/images/landing/3.jpg"; }}
              alt="Rural retail and kirana enterprise" 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Satellite 3: Bottom-Right (Commercial Dairy Producer) */}
          <div 
            id="hero-sat-3" 
            className="absolute bottom-10 sm:bottom-16 right-6 sm:right-28 md:right-36 w-30 sm:w-40 md:w-48 h-22 sm:h-28 md:h-34 rounded-xl overflow-hidden shadow-xl border-2 border-white/95 bg-slate-900 pointer-events-auto"
          >
            <img 
              src="/images/hero_sat_3.jpg" 
              onError={(e) => { e.currentTarget.src = "/images/landing/8.jpg"; }}
              alt="Commercial dairy enterprise" 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Satellite 4: Top-Left (Tailoring Enterprise with Daughter) */}
          <div 
            id="hero-sat-4" 
            className="absolute top-12 sm:top-20 left-6 sm:left-28 md:left-36 w-28 sm:w-38 md:w-44 h-20 sm:h-26 md:h-32 rounded-xl overflow-hidden shadow-xl border-2 border-white/95 bg-slate-900 pointer-events-auto"
          >
            <img 
              src="/images/hero_sat_4.jpg" 
              onError={(e) => { e.currentTarget.src = "/images/landing/5.jpg"; }}
              alt="Village tailoring and apparel craftsmanship" 
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        {/* Bottom Scroll Cue */}
        <div className="absolute bottom-8 z-30 flex flex-col items-center text-[#686D65] text-[11px] font-mono-num tracking-widest uppercase">
          <span>{t.scrollExplore}</span>
          <span className="mt-1 animate-bounce text-sm">↓</span>
        </div>
      </section>
    </div>

      {/* ============================================================== */}
      {/* SCENE 2: THE THESIS & VERTICAL LINE DROP                       */}
      {/* ============================================================== */}
      <section 
        id="scene-thesis" 
        ref={thesisRef} 
        className="min-h-screen py-24 sm:py-32 px-6 sm:px-12 flex flex-col items-center justify-center bg-[#F8F6F0] relative"
      >
        {/* Proportioned Vertical Line Drop with Terminal Dot */}
        <div className="flex flex-col items-center mb-10 sm:mb-12">
          <div id="thesis-line" className="w-[1.5px] h-8 bg-[#111311] relative origin-top">
            <div id="thesis-dot" className="w-2 h-2 rounded-full bg-[#111311] absolute -bottom-1 -left-[3.25px]"></div>
          </div>
        </div>

        {/* Master Thesis Statement */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-editorial text-center text-[#111311] max-w-4xl leading-[1.18] tracking-tight">
          {t.thesisHeading}
        </h2>

        {/* Editorial Sub-Thesis Context */}
        <p className="text-sm sm:text-base text-[#686D65] text-center max-w-2xl mt-8 sm:mt-10 leading-[1.75] font-sans-ui">
          {t.thesisBody}
        </p>

        {/* Architectural 3-Column Ledger */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-16 sm:mt-20 max-w-4xl w-full text-center divide-y sm:divide-y-0 sm:divide-x divide-black/10">
          <div className="px-6 py-4 sm:py-2 flex flex-col items-center justify-center">
            <span className="block text-2xl sm:text-3xl font-editorial text-[#111311] whitespace-nowrap">{t.mcfAmount}</span>
            <span className="text-[11px] font-mono-num uppercase tracking-widest text-[#686D65] mt-3 block">{t.mcfLabel}</span>
          </div>
          <div className="px-6 py-4 sm:py-2 flex flex-col items-center justify-center">
            <span className="block text-2xl sm:text-3xl font-editorial text-[#111311] whitespace-nowrap">{t.termAmount}</span>
            <span className="text-[11px] font-mono-num uppercase tracking-widest text-[#686D65] mt-3 block">{t.termLabel}</span>
          </div>
          <div className="px-6 py-4 sm:py-2 flex flex-col items-center justify-center">
            <span className="block text-2xl sm:text-3xl font-editorial text-[#111311] whitespace-nowrap">{t.dprAmount}</span>
            <span className="text-[11px] font-mono-num uppercase tracking-widest text-[#686D65] mt-3 block">{t.dprLabel}</span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 3: PINNED ORBITAL VORTEX                                 */}
      {/* ============================================================== */}
      <section id="scene-orbit" ref={orbitRef} className="relative w-full h-[180vh] bg-[#F4F1EA]">
        <div className="orbit-pin-outer w-full h-full relative">
          <div id="orbit-pinned-wrap" className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center px-4">
            
            {/* Central Narrative Block */}
            <div id="orbit-center-text" className="text-center max-w-md z-20 pointer-events-none px-4">
              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-editorial text-[#111311] leading-[1.05]">
                {t.orbitTitlePre}<span className="italic font-normal">{t.orbitTitleItalic}</span>{t.orbitTitlePost}
              </h3>
              <p className="text-xs sm:text-sm text-[#686D65] mt-4 max-w-sm mx-auto leading-relaxed font-sans-ui">
                {t.orbitBody}
              </p>
            </div>

            {/* Symmetrical Orbiting Constellation Ring (8 Authentic Beneficiary Photos) */}
            <div id="orbit-ring" className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              {[
                { id: 1, angle: '0deg', x: '0', y: '-1', src: '/images/orbit_1.jpg', fallback: '/images/landing/6.jpg', alt: 'SHG Women Collective Celebration' },
                { id: 2, angle: '45deg', x: '0.7071', y: '-0.7071', src: '/images/orbit_2.jpg', fallback: '/images/landing/11.jpg', alt: 'PM Vishwakarma Artisan Carpentry' },
                { id: 3, angle: '90deg', x: '1', y: '0', src: '/images/orbit_3.jpg', fallback: '/images/landing/3.jpg', alt: 'Rural Kirana General Store' },
                { id: 4, angle: '135deg', x: '0.7071', y: '0.7071', src: '/images/orbit_4.jpg', fallback: '/images/landing/13.jpg', alt: 'Poultry Farm Entrepreneur' },
                { id: 5, angle: '180deg', x: '0', y: '1', src: '/images/orbit_5.jpg', fallback: '/images/landing/7.jpg', alt: 'Village Capacity Building Training Camp' },
                { id: 6, angle: '225deg', x: '-0.7071', y: '0.7071', src: '/images/orbit_6.jpg', fallback: '/images/landing/8.jpg', alt: 'Commercial Dairy Unit' },
                { id: 7, angle: '270deg', x: '-1', y: '0', src: '/images/orbit_7.jpg', fallback: '/images/landing/4.jpg', alt: 'Market Vendor Liquidity and Profit' },
                { id: 8, angle: '315deg', x: '-0.7071', y: '-0.7071', src: '/images/orbit_8.jpg', fallback: '/images/landing/5.jpg', alt: 'Intergenerational Tailoring Workshop' }
              ].map((tile) => (
                <div 
                  key={tile.id}
                  className="orbit-tile w-28 h-20 sm:w-32 sm:h-24 md:w-36 md:h-26 rounded-2xl overflow-hidden shadow-xl border-2 border-white/95 bg-slate-900 pointer-events-auto"
                  style={{
                    '--x-factor': tile.x,
                    '--y-factor': tile.y,
                    '--angle': tile.angle
                  }}
                >
                  <div className="orbit-tile-inner">
                    <img 
                      src={tile.src} 
                      onError={(e) => { e.currentTarget.src = tile.fallback; }} 
                      alt={tile.alt} 
                      className="w-full h-full object-cover filter brightness-[0.94] contrast-[1.05]" 
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 4: FULL-BLEED IMMERSION & RADIAL ARC GAUGE               */}
      {/* ============================================================== */}
      <section 
        id="scene-immersive" 
        ref={immersiveRef} 
        className="relative w-full h-screen overflow-hidden flex flex-col justify-between p-8 sm:p-14 bg-black text-white"
      >
        {/* Full-Bleed Panoramic Agrarian Roots Backdrop */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/harvest_immersion.jpg" 
            onError={(e) => { e.currentTarget.src = "/images/landing/9.jpg"; }}
            alt="Traditional Agrarian Roots in Golden Morning Light" 
            className="w-full h-full object-cover filter brightness-[0.45] contrast-[1.15]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/60"></div>
        </div>

        {/* Top Header Eyebrow Spacer */}
        <div className="relative z-10 h-4"></div>

        {/* Center Circular Radial Arc Gauge */}
        <div className="relative z-10 my-auto flex flex-col items-center justify-center">
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* SVG Arc Ring */}
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
              <circle 
                id="gauge-circle" 
                cx="50" 
                cy="50" 
                r="45" 
                stroke="#FFFFFF" 
                strokeWidth="2.5" 
                fill="none" 
                strokeLinecap="round" 
                className="arc-progress" 
              />
            </svg>

            {/* Center Percentage Display */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl sm:text-5xl font-editorial font-bold text-white tracking-tight">67%</span>
              <span className="text-[10px] font-mono-num uppercase tracking-widest text-[#FACC15] mt-1 font-semibold">{t.riskGaugeLabel}</span>
            </div>

            {/* Dot on Top Arc */}
            <div className="absolute top-2 w-2.5 h-2.5 rounded-full bg-white shadow-lg"></div>
          </div>
        </div>

        {/* Bottom Headline & Action Button */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-3xl sm:text-5xl lg:text-6xl font-editorial font-normal text-[#FACC15] tracking-tight leading-tight">
              {t.immersionHeading}
            </h3>
            <p className="text-base sm:text-xl text-white/90 mt-3 font-editorial italic leading-relaxed">
              {t.immersionBody}
            </p>
          </div>

          <button 
            onClick={() => scrollToTarget('#dashboard-section')} 
            className="px-7 py-4 rounded-xl bg-white text-[#111311] font-bold text-xs uppercase tracking-wider font-mono-num flex items-center space-x-2 shadow-2xl hover:bg-[#F4F1EA] hover:scale-105 transition-all duration-300 cursor-pointer pointer-events-auto"
          >
            <span>{t.exploreDashboard}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SCENE 5: PLATFORM IN 4 PILLARS                                 */}
      {/* ============================================================== */}
      <section id="scene-cards" ref={cardsRef} className="py-24 sm:py-32 px-6 sm:px-12 max-w-7xl mx-auto bg-[#F4F1EA]">
        <div className="max-w-3xl mb-14 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-editorial font-normal text-[#111311] tracking-tight leading-[1.08]">
            {t.pillarsHeading}
          </h2>
          <p className="text-sm sm:text-base text-[#686D65] mt-4 font-sans-ui leading-relaxed">
            {t.pillarsBody}
          </p>
        </div>

        {/* 4 Responsive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1 */}
          <div 
            onClick={() => setSelectedPillarModal(1)}
            className="pillar-card bg-white rounded-3xl p-6 sm:p-7 border-t-4 border-t-[#0E7A53] border border-black/5 shadow-md flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div>
              <h4 className="font-semibold text-lg text-[#111311] font-sans-ui tracking-tight group-hover:text-[#0E7A53] transition-colors">
                {t.card1Title}
              </h4>
              <p className="text-xs sm:text-sm text-[#686D65] mt-3 leading-relaxed font-sans-ui">
                {t.card1Body}
              </p>
            </div>
            <div className="mt-6 pt-3.5 border-t border-black/5 flex items-center justify-between text-xs font-sans-ui text-[#686D65] group-hover:text-[#111311] transition-colors">
              <span>{t.viewDetails}</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => setSelectedPillarModal(2)}
            className="pillar-card bg-white rounded-3xl p-6 sm:p-7 border-t-4 border-t-[#D49B5A] border border-black/5 shadow-md flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div>
              <h4 className="font-semibold text-lg text-[#111311] font-sans-ui tracking-tight group-hover:text-[#B47228] transition-colors">
                {t.card2Title}
              </h4>
              <p className="text-xs sm:text-sm text-[#686D65] mt-3 leading-relaxed font-sans-ui">
                {t.card2Body}
              </p>
            </div>
            <div className="mt-6 pt-3.5 border-t border-black/5 flex items-center justify-between text-xs font-sans-ui text-[#686D65] group-hover:text-[#111311] transition-colors">
              <span>{t.viewDetails}</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => setSelectedPillarModal(3)}
            className="pillar-card bg-white rounded-3xl p-6 sm:p-7 border-t-4 border-t-[#E86043] border border-black/5 shadow-md flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div>
              <h4 className="font-semibold text-lg text-[#111311] font-sans-ui tracking-tight group-hover:text-[#E86043] transition-colors">
                {t.card3Title}
              </h4>
              <p className="text-xs sm:text-sm text-[#686D65] mt-3 leading-relaxed font-sans-ui">
                {t.card3Body}
              </p>
            </div>
            <div className="mt-6 pt-3.5 border-t border-black/5 flex items-center justify-between text-xs font-sans-ui text-[#686D65] group-hover:text-[#111311] transition-colors">
              <span>{t.viewDetails}</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => setSelectedPillarModal(4)}
            className="pillar-card bg-white rounded-3xl p-6 sm:p-7 border-t-4 border-t-[#4A6274] border border-black/5 shadow-md flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-pointer group"
          >
            <div>
              <h4 className="font-semibold text-lg text-[#111311] font-sans-ui tracking-tight group-hover:text-[#4A6274] transition-colors">
                {t.card4Title}
              </h4>
              <p className="text-xs sm:text-sm text-[#686D65] mt-3 leading-relaxed font-sans-ui">
                {t.card4Body}
              </p>
            </div>
            <div className="mt-6 pt-3.5 border-t border-black/5 flex items-center justify-between text-xs font-sans-ui text-[#686D65] group-hover:text-[#111311] transition-colors">
              <span>{t.viewDetails}</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Statutory Pillar Modal Dialog */}
        {selectedPillarModal && PILLAR_DOSSIERS[language] && PILLAR_DOSSIERS[language][selectedPillarModal] && (
          <div 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setSelectedPillarModal(null)}
          >
            <div 
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-black/5 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-black/5 pb-4">
                <div>
                  <span 
                    className="text-[11px] font-mono-num font-bold uppercase tracking-wider block"
                    style={{ color: PILLAR_DOSSIERS[language][selectedPillarModal].color }}
                  >
                    {PILLAR_DOSSIERS[language][selectedPillarModal].number}
                  </span>
                  <h3 className="font-sans-ui font-bold text-xl text-[#111311] mt-1">
                    {PILLAR_DOSSIERS[language][selectedPillarModal].title}
                  </h3>
                  <span className="text-[11px] font-mono-num text-[#686D65] uppercase tracking-wider block mt-1">
                    {PILLAR_DOSSIERS[language][selectedPillarModal].mandate}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedPillarModal(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Narrative Description */}
              <p className="text-xs sm:text-sm text-[#686D65] font-sans-ui leading-relaxed">
                {PILLAR_DOSSIERS[language][selectedPillarModal].summary}
              </p>

              {/* Statutory Specifications List */}
              <div className="space-y-3 bg-[#F8F6F0] p-4 rounded-2xl border border-black/5 text-xs font-sans-ui">
                {PILLAR_DOSSIERS[language][selectedPillarModal].specifications.map((spec, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 border-b border-black/5 last:border-0 pb-2 last:pb-0">
                    <span className="font-bold text-[#111311]">{spec.label}:</span>
                    <span className="text-[#686D65] sm:text-right">{spec.value}</span>
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedPillarModal(null)}
                className="w-full bg-[#111311] text-white font-mono-num font-bold text-xs py-3 rounded-xl hover:bg-black transition-all cursor-pointer uppercase tracking-wider"
              >
                {t.closeDossier}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* SCENE 6: SETO MINIMAL DASHBOARD MOCKUP CONTAINER              */}
      {/* ============================================================== */}
      <div id="dashboard-section" className="relative">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-8 pt-8">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-black/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-3.5 h-3.5 rounded-full bg-[#0E7A53] animate-pulse flex-shrink-0"></div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#111311] font-mono-num uppercase tracking-wider">
                  {language === 'hi' ? 'इंटरैक्टिव पूर्वावलोकन मॉकअप (दृश्य 06)' : 'Interactive Preview Mockup (Scene 06)'}
                </h4>
                <p className="text-[11px] text-[#686D65] mt-0.5 font-sans-ui">
                  {language === 'hi' 
                    ? 'यह मुख्य पृष्ठ पूर्वावलोकन है। वास्तविक लाइव डेटा, 24 ट्रेड डोज़ियर और आधिकारिक लीड-बैंक डीपीआर के लिए अलग प्रोडक्शन कार्यक्षेत्र खोलें।'
                    : 'This is the landing page preview. For live calculations, saved trade dossiers, and official Lead-Bank DPR export, launch the dedicated production page.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (currentUser) {
                  navigateToDashboard();
                } else {
                  setAuthError(null);
                  setIsAuthModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#111311] hover:bg-black text-white text-xs font-mono-num font-bold shadow-md hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>{language === 'hi' ? 'पूर्ण प्रोडक्शन डैशबोर्ड खोलें →' : 'Launch Full Production Dashboard →'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0E7A53]" />
            </button>
          </div>
        </div>
        <SetoDashboard 
          language={language} 
          currentUser={currentUser} 
          onLaunchWorkspace={() => {
            if (currentUser) {
              navigateToDashboard();
            } else {
              setAuthError(null);
              setIsAuthModalOpen(true);
            }
          }}
        />
      </div>

      {/* Global Authentication Modal */}
      {renderAuthModal()}

    </div>
  );
}