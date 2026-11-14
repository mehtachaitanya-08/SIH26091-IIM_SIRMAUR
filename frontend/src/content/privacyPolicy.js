/**
 * UdyamSetuAI Privacy Policy: the one source for the policy text (PrivacyModal renders it; the
 * registration and onboarding consent boxes record POLICY_VERSION).
 *
 * Every statement about what the platform does with data was checked against the code on
 * 14 Nov 2026: accounts and onboarding answers live in the browser's localStorage
 * (src/data/userDatabase.js); the DPR form is sent to the server only to make the PDF and is
 * never stored or logged (backend/dpr.py); chat messages and custom business ideas go to Groq
 * (backend/chat.py, backend/custom_trade.py); mandi prices ask data.gov.in by crop and state only
 * (backend/mandi.py); the rate limiter keeps IP addresses in memory only (backend/ratelimit.py).
 * If any of that changes, change this text and raise POLICY_VERSION.
 *
 * CONTACT holds the details only the team can supply (who answers grievances, where, and which
 * courts). Fill them in before the site is opened to the public.
 */

export const POLICY_VERSION = '1.0';
export const POLICY_EFFECTIVE_DATE = '14 November 2026';

export const CONTACT = {
  operator: 'Team UdyamSetuAI (Smart India Hackathon 2026, problem statement SIH26091)',
  grievanceOfficer: 'Grievance Officer, Team UdyamSetuAI',
  // TODO(team): add a monitored email address and a postal address before public launch.
  email: '[grievance email to be published]',
  address: '[postal address to be published]',
  // TODO(team): confirm the city whose courts will have jurisdiction.
  jurisdictionCity: '[city to be confirmed]'
};

/**
 * Each section: { id, title, blocks: [{ p: '...' } | { list: ['...'] }] }.
 * Plain words where possible; the legal names of Acts are kept exact.
 */
export const POLICY_SECTIONS_EN = [
  {
    id: 'about',
    title: '1. About this policy',
    blocks: [
      { p: `UdyamSetuAI ("UdyamSetuAI", "we", "us") is an advisory website for rural micro-entrepreneurs. It helps you check which government credit schemes may fit your business, estimate loan repayments, compare moneylender debt with bank credit, and prepare an advisory Detailed Project Report (DPR). It is operated by ${CONTACT.operator}.` },
      { p: 'This policy explains what personal data the platform handles, why, where it is kept, who else receives it, and the rights you have. It applies to the website, the dashboard, the chat assistant and the DPR download. For the purposes of the Digital Personal Data Protection Act, 2023, UdyamSetuAI is the Data Fiduciary for personal data it decides to process, and you are the Data Principal.' },
      { p: 'Please read this policy before you register or enter details about yourself. By ticking the consent box, or by continuing to use the platform after reading it, you agree to the processing described here. If you do not agree, please do not use the platform.' }
    ]
  },
  {
    id: 'what-we-are-not',
    title: '2. What UdyamSetuAI is not',
    blocks: [
      { list: [
        'We are not a bank, a non-banking financial company, a lender, a loan agent, or a credit information company. We do not sanction, disburse, guarantee or recommend any loan to a lender.',
        'We are not a government department or agency, and we are not affiliated with, endorsed by or acting for NSFDC, NSTFDC, NBCFDC, KVIC, the Ministry of Social Justice and Empowerment, or any other ministry, corporation or bank, unless such a tie-up is stated in writing on the platform.',
        'We do not verify caste, income, disability or any other detail you give. Everything you enter is self-declared.',
        'Results, figures and reports from the platform are advisory estimates for information only. They are not financial, legal, tax or investment advice, and they are not a promise that you will receive any loan, subsidy or benefit.'
      ] }
    ]
  },
  {
    id: 'laws',
    title: '3. Laws this policy follows',
    blocks: [
      { p: 'We handle personal data in line with the following Indian laws, to the extent each applies to us and as and when each provision comes into force:' },
      { list: [
        'The Digital Personal Data Protection Act, 2023 (the "DPDP Act") and the Digital Personal Data Protection Rules, 2025.',
        'The Information Technology Act, 2000, including Sections 43A, 72A and 79, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, for as long as they continue to apply.',
        'The Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, to the extent the platform is an intermediary for any content.',
        'The directions of CERT-In dated 28 April 2022 under Section 70B of the Information Technology Act, 2000, on reporting cyber security incidents and keeping logs.',
        'The Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016 and its regulations: we never ask for, collect or store a full Aadhaar number (see section 4).',
        'The Consumer Protection Act, 2019 and the Indian Contract Act, 1872, to the extent they apply to free advisory services.',
        'The Scheduled Castes and the Scheduled Tribes (Prevention of Atrocities) Act, 1989 and the Rights of Persons with Disabilities Act, 2016: caste and disability details are used only to show schemes you may qualify for, never to exclude, rank or treat anyone less favourably.'
      ] },
      { p: 'Where this policy and a law differ, the law prevails.' }
    ]
  },
  {
    id: 'data',
    title: '4. What personal data we handle, and where it goes',
    blocks: [
      { p: 'Account details. Your name, 10-digit mobile number, a 4-digit PIN, your trade, and your answer to whether you belong to a Scheduled Caste. These are saved only in the storage of the browser on your own device (localStorage). They are not sent to or stored on our server.' },
      { p: 'Onboarding profile. Your social category (SC, ST, OBC, General, EWS or Minority), whether you are a woman entrepreneur, a traditional artisan or a person with disability, your yearly family income, state, district, rural or urban location, planned project cost, your own savings for the project, any moneylender debt (amount, interest rate and how long it has run), and the business you want to start. These are saved only in your browser, under your account.' },
      { p: 'Calculator inputs. When you use the loan, cash-flow, scheme, feasibility or debt tools, the figures you enter (such as project cost, income and SC status) are sent to our server so it can calculate the answer. The server sends the answer back and does not save the inputs.' },
      { p: 'DPR form. To make a DPR, you may enter business and promoter details: names, business type and registration number, PAN, GSTIN, the last 4 digits of an Aadhaar number (never the full number), addresses, mobile number, qualifications, net worth, credit rating and shareholding. These are sent to our server only to build the PDF, are not stored or written to logs, and are kept in the open page only until you reload, close the page or sign out.' },
      { p: 'Chat messages and custom business ideas. What you type into the chat assistant, and a business idea you describe in your own words, are sent to our server and then to our AI provider (section 7) to produce a reply. Please do not type your PIN, PAN, bank details, Aadhaar number or other identity numbers into the chat.' },
      { p: 'Technical data. Like any website, our server receives your IP address with each request. We use it, in memory only, to limit how many chat questions one visitor can ask, and it is dropped when the server restarts. Server error logs record the type of error, not what you typed.' },
      { p: 'Cookies. We do not use advertising or tracking cookies or analytics tools. The site uses your browser\'s local storage for the account and profile described above. Fonts and some page styling are loaded from Google Fonts and the Tailwind CSS content delivery network, so your browser contacts those services, which can see your IP address under their own privacy policies.' },
      { p: 'Sensitive details. Caste, disability, income and debt details are sensitive. Giving them is your choice. If you leave them out, the platform still works, but it cannot show the schemes that depend on them.' }
    ]
  },
  {
    id: 'purposes',
    title: '5. Why we use it, and on what legal basis',
    blocks: [
      { p: 'We use personal data only for these purposes:' },
      { list: [
        'to let you sign in on your device and keep your profile and saved scenarios;',
        'to check which government credit schemes may fit your answers and to calculate loans, repayments, subsidies and cash flow;',
        'to answer your questions in the chat assistant;',
        'to prepare the advisory DPR you ask for;',
        'to keep the service secure and working, prevent misuse, and limit excessive use; and',
        'to comply with law, court orders and lawful requests of government authorities.'
      ] },
      { p: 'Our legal basis is your consent under Section 6 of the DPDP Act, and the legitimate uses in Section 7 of the DPDP Act where they apply (for example, data you give voluntarily for a specified purpose, or compliance with a law or court order).' },
      { p: 'We do not sell, rent or trade personal data. We do not use it for advertising, and we do not use it to make automated decisions that have a legal effect on you. We do not share it with credit bureaus, lenders or marketers.' }
    ]
  },
  {
    id: 'consent',
    title: '6. Your consent, and how to withdraw it',
    blocks: [
      { p: 'You give consent by ticking the consent box when you register, and again before you save sensitive onboarding details. Consent is given for the purposes in section 5 only.' },
      { p: 'You can withdraw consent at any time, as easily as you gave it: use "Erase my data on this device" in this policy or in My account, or contact the Grievance Officer. Withdrawal does not affect processing that happened before it. After withdrawal, features that need the data (such as scheme matching and the DPR) will not work until you enter it again.' }
    ]
  },
  {
    id: 'processors',
    title: '7. Who else receives data',
    blocks: [
      { list: [
        'AI provider: chat messages and custom business ideas are processed by Groq, Inc. on servers that may be outside India, to generate replies. Groq processes them under its own terms and privacy policy. Transfers outside India are made only to countries not restricted by the Central Government under Section 16 of the DPDP Act.',
        'Open Government Data Platform (data.gov.in): for mandi prices we send only the crop and state, never anything about you.',
        'Hosting and infrastructure providers that run the server, bound to protect the data.',
        'Courts, police, regulators and government authorities, when the law requires us to share data or a valid legal order directs us to.'
      ] },
      { p: 'We are not responsible for how third-party services, websites or government portals that the platform links to handle your data. Their own privacy policies apply.' }
    ]
  },
  {
    id: 'retention',
    title: '8. How long data is kept',
    blocks: [
      { list: [
        'Account, profile and saved scenarios: on your device until you erase them, sign in on a different browser, or clear your browser data.',
        'Calculator inputs and DPR details: only for the time the server takes to answer the request.',
        'IP addresses used for rate limiting: in server memory only, cleared on restart.',
        'Security and incident logs, if and when the platform keeps them: only for the period required by law, including the CERT-In directions and the DPDP Rules.'
      ] },
      { p: 'Personal data is erased once its purpose is served or consent is withdrawn, unless a law requires us to keep it longer.' }
    ]
  },
  {
    id: 'rights',
    title: '9. Your rights',
    blocks: [
      { p: 'Under Sections 11 to 14 of the DPDP Act you have the right to:' },
      { list: [
        'get a summary of the personal data we process about you and how we process it, and the identities of those we have shared it with;',
        'have your data corrected, completed, updated or erased;',
        'have a grievance addressed by us; and',
        'nominate another person to use these rights for you in case of your death or incapacity.'
      ] },
      { p: 'Because your account and profile are kept on your own device, you can see, change and erase most of it yourself in My account at any time. For anything else, contact the Grievance Officer (section 14).' },
      { p: 'Your duties. Under Section 15 of the DPDP Act you must not impersonate another person, must not hide important information when giving details, must not give false information for an identity document or proof, and must not file false or frivolous complaints. Breaching these duties can attract a penalty of up to ₹10,000 under the DPDP Act. Information you give must be true to the best of your knowledge.' }
    ]
  },
  {
    id: 'children',
    title: '10. Children',
    blocks: [
      { p: 'The platform is meant for people aged 18 or above. We do not knowingly process personal data of children without verifiable consent of a parent or lawful guardian as required by Section 9 of the DPDP Act. If you are under 18, please use the platform only with a parent or guardian. If we learn that a child\'s data was given without such consent, we will erase it.' }
    ]
  },
  {
    id: 'security',
    title: '11. Security',
    blocks: [
      { p: 'We take reasonable security safeguards, as required by Section 8(5) of the DPDP Act, including encrypted connections where the platform is served over HTTPS, keeping DPR details out of storage and logs, refusing full Aadhaar numbers, and limiting which websites may call our server.' },
      { p: 'Your device. Data saved in your browser is protected by your device, not by our server. The 4-digit PIN is a simple lock on this browser, not a strong password: anyone who can use your device or browser may be able to read the saved data. On a shared or public device, use "Erase my data on this device" when you finish, and keep your device locked.' },
      { p: 'No method of sending or storing data over the internet is completely secure, and we cannot guarantee absolute security. If a personal data breach happens, we will inform the Data Protection Board of India and the affected users, and report cyber security incidents to CERT-In, within the timelines set by law.' }
    ]
  },
  {
    id: 'disclaimer',
    title: '12. Advisory information only',
    blocks: [
      { list: [
        'Scheme rules, interest rates, subsidy rates, limits and eligibility are taken from public guidelines and the team\'s research files. Governments, corporations and banks can change them at any time, and they may apply them differently. Always confirm with the bank, the State Channelising Agency or the scheme\'s official portal before you act.',
        'Final decisions on eligibility, loans and subsidies are made only by the lending bank or the agency concerned. A DPR from UdyamSetuAI is an advisory draft, not a loan sanction or approval.',
        'Business figures (costs, income, good and bad months) come from research files and your own inputs. Your actual results may be different.',
        'The chat assistant uses artificial intelligence and can be wrong. Check any important answer with the figures on the dashboard and with an official source.',
        'Information about the Usurious Loans Act, 1918 or other laws is general information, not legal advice. Please consult free legal aid (for example your District Legal Services Authority) about your own case.'
      ] }
    ]
  },
  {
    id: 'liability',
    title: '13. Limits of our responsibility',
    blocks: [
      { p: 'The platform is provided free of charge, "as is" and "as available". To the maximum extent permitted by applicable law:' },
      { list: [
        'we make no warranty, express or implied, that the platform or its results will be accurate, complete, current, uninterrupted, error-free or fit for any particular purpose;',
        'we are not liable for any loss or damage, whether direct, indirect, incidental, special or consequential (including loss of money, profit, business, opportunity, loan or subsidy), arising from your use of, or reliance on, the platform, its calculations, the chat assistant or any DPR;',
        'we are not liable for data lost or exposed on your own device or browser, for information you choose to share with others, or for the acts of banks, government agencies, third-party services or other users;',
        'we are not liable for any delay or failure caused by events beyond our reasonable control, such as power or network outages, failure of third-party services, natural disasters or government action; and',
        'you agree to indemnify and hold harmless the team behind UdyamSetuAI against claims arising from false information you provide, from misuse of the platform, or from your breach of this policy or of any law.'
      ] },
      { p: 'Nothing in this policy excludes or limits any right you have, or any duty we have, that cannot be excluded or limited under Indian law, including under the DPDP Act and the Consumer Protection Act, 2019. If any part of this policy is held unenforceable, the rest of it continues to apply.' }
    ]
  },
  {
    id: 'grievance',
    title: '14. Grievance Officer and complaints',
    blocks: [
      { p: `For any question, request or complaint about your personal data, contact: ${CONTACT.grievanceOfficer}. Email: ${CONTACT.email}. Address: ${CONTACT.address}.` },
      { p: 'Please give your registered mobile number and describe the request; never send your PIN. We will acknowledge your request promptly and respond within the time limits set by the DPDP Rules and other applicable law.' },
      { p: 'If you are not satisfied with our response, you may complain to the Data Protection Board of India under Section 13(3) of the DPDP Act, after first using our grievance process.' }
    ]
  },
  {
    id: 'changes',
    title: '15. Changes to this policy',
    blocks: [
      { p: 'We may update this policy when the platform or the law changes. The version and effective date at the top will change, and if the change affects how we use your data, we will ask for your consent again before we use it in the new way.' }
    ]
  },
  {
    id: 'law',
    title: '16. Governing law',
    blocks: [
      { p: `This policy is governed by the laws of India. Subject to your right to approach the Data Protection Board of India or a consumer commission, courts at ${CONTACT.jurisdictionCity} have jurisdiction over disputes arising from it.` },
      { p: 'This policy is written in English. A Hindi summary is shown alongside it; if the two differ, the English version applies. You may ask the Grievance Officer for this policy in any language listed in the Eighth Schedule to the Constitution of India.' }
    ]
  }
];

/** A plain Hindi summary of every section (the English text is the full policy). */
export const POLICY_SUMMARY_HI = [
  'UdyamSetuAI ग्रामीण उद्यमियों के लिए एक सलाह देने वाली वेबसाइट है। हम बैंक, ऋणदाता या सरकारी विभाग नहीं हैं, और किसी ऋण या सब्सिडी का वादा नहीं करते।',
  'आपका खाता (नाम, मोबाइल, PIN) और प्रोफ़ाइल (जाति वर्ग, आय, ज़िला, कर्ज़ आदि) केवल आपके अपने फ़ोन/कंप्यूटर के ब्राउज़र में रहते हैं, हमारे सर्वर पर नहीं।',
  'लोन, योजना और DPR की गणना के लिए आपके आँकड़े सर्वर पर भेजे जाते हैं, पर वहाँ सहेजे नहीं जाते। हम पूरा आधार नंबर कभी नहीं लेते, केवल आख़िरी 4 अंक।',
  'चैट में लिखे संदेश जवाब बनाने के लिए AI सेवा (Groq) को भेजे जाते हैं। चैट में अपना PIN, PAN, आधार या बैंक विवरण न लिखें।',
  'हम आपका डेटा बेचते नहीं, विज्ञापन के लिए उपयोग नहीं करते, और क्रेडिट ब्यूरो या ऋणदाताओं को नहीं देते।',
  'जाति, दिव्यांगता और आय जैसी जानकारी देना आपकी मर्ज़ी है; इसका उपयोग केवल योग्य योजनाएँ दिखाने के लिए होता है, किसी भेदभाव के लिए नहीं।',
  'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 के तहत आप अपने डेटा का सार, सुधार और मिटाने की माँग कर सकते हैं, शिकायत कर सकते हैं, और किसी को नामित कर सकते हैं। "इस डिवाइस से मेरा डेटा मिटाएँ" बटन से आप कभी भी सब मिटा सकते हैं।',
  'आपकी दी गई जानकारी सही होनी चाहिए। झूठी जानकारी या झूठी शिकायत पर अधिनियम के तहत ₹10,000 तक जुर्माना लग सकता है।',
  '18 वर्ष से कम उम्र के लोग केवल माता-पिता या अभिभावक के साथ इसका उपयोग करें।',
  'साझा फ़ोन पर उपयोग के बाद अपना डेटा मिटा दें: 4-अंकों का PIN केवल एक साधारण ताला है।',
  'सभी आँकड़े और DPR केवल सलाह हैं। अंतिम निर्णय बैंक या संबंधित एजेंसी ही लेती है। AI चैट गलत भी हो सकता है; आधिकारिक स्रोत से जाँच लें।',
  'कानून की अनुमति की अधिकतम सीमा तक, इस प्लेटफ़ॉर्म के उपयोग से होने वाले किसी नुकसान के लिए टीम ज़िम्मेदार नहीं है; पर कानून द्वारा दिए गए आपके अधिकार इससे कम नहीं होते।',
  'शिकायत के लिए शिकायत अधिकारी से संपर्क करें; संतुष्ट न होने पर आप भारतीय डेटा संरक्षण बोर्ड से शिकायत कर सकते हैं। पूरी नीति अंग्रेज़ी में है; दोनों में अंतर हो तो अंग्रेज़ी संस्करण लागू होगा।'
];
