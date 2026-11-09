# Interface Specification: WhatsApp Conversational Flow & 1-Page DPR Wireframe

**Project:** AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant  
**Theme:** SIH User Experience & Field Delivery  
**Version:** 1.0.0  

---

## 1. End-to-End WhatsApp Voice Dialogue (4-Turn Conversational Script)

The interface is designed for **"Bharat-First" zero-friction onboarding**. The rural entrepreneur does not fill out forms; they send audio notes in their native language (e.g., Hindi/Bhojpuri/Marathi/Tamil). 

Below is an authentic end-to-end conversation with **Rameshwar Lal**, a 34-year-old resident of Block Chomu, District Jaipur, Rajasthan, seeking to open a cold-press mustard oil expeller unit.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 WHATSAPP INTERACTION                                   │
└────────────────────────────────────────────────────────────────────────────────────────┘

[Turn 1: Business Intent & Discovery]
👤 Rameshwar (Voice Note - 0:14s):
   "राम राम जी, मैं चौमू के पास रहता हूँ। मैं एक छोटी सरसों तेल पेरने की मशीन (oil expeller)
   लगाना चाहता हूँ। मेरे पास ₹30,000 की बचत है। क्या यह धंधा यहाँ चलेगा और कोई सरकारी योजना मिलेगी?"

🤖 AI Assistant (Audio Note in Marwari-inflected Hindi + Text Card):
   "राम राम रामेश्वर जी! सरसों तेल का काम राजस्थान के ग्रामीण इलाकों में काफी मजबूत माना जाता है। 
   आपके इलाके (चौमू) में सरसों की पैदावार अच्छी है। 
   
   यह समझने के लिए कि आपका काम कितना चलेगा, मुझे 2 छोटी बातें बताइए:
   1. आपके गाँव या 3 किलोमीटर के दायरे में ऐसी तेल की मशीनें पहले से कितनी चल रही हैं?
   2. आप कच्ची सरसों कहाँ से खरीदेंगे—अपने खेत से या मंडी से?"

------------------------------------------------------------------------------------------

[Turn 2: Hyper-Local Ground Truth & Supply Chain]
👤 Rameshwar (Voice Note - 0:11s):
   "गाँव में सिर्फ एक पुरानी मशीन है जो अक्सर खराब रहती है। और सरसों हम पास की चौमू मंडी और 
   गाँव के किसानों से सीधे नकद में लेंगे।"

🤖 AI Assistant (Audio Note + Text Card):
   "बहुत बढ़िया! 3 किमी में सिर्फ 1 पुरानी मशीन होने का मतलब है कि आपके इलाके में 'कम कंपटीशन' 
   (Low Market Saturation) है और ग्राहकों को नया विकल्प चाहिए।
   
   एक अच्छी 6-बोल्ट तेल पेरने की मशीन और मोटर की लागत लगभग ₹1,20,000 आती है, और ₹25,000 
   पहले महीने सरसों का स्टॉक रखने के लिए चाहिए। यानी कुल प्रोजेक्ट लगभग ₹1,55,000 का होगा।
   
   आपके पास ₹30,000 बचत है। क्या आप महीने की ₹2,500 की बैंक किश्त आसानी से भर पाएंगे?"

------------------------------------------------------------------------------------------

[Turn 3: Seasonal Stress-Testing & Financial Structuring]
👤 Rameshwar (Voice Note - 0:16s):
   "हाँ, ₹2,500 तो भर देंगे। लेकिन बारिश के दो-तीन महीनों में काम थोड़ा धीमा रहता है। 
   क्या कोई सरकारी सब्सिडी है जिससे लोन कम हो जाए?"

🤖 AI Assistant (Audio Note + Text Card):
   "रामेश्वर जी, आपके लिए सबसे सही योजना PMEGP (प्रधानमंत्री रोजगार सृजन कार्यक्रम) है:
   • चूँकि आप ग्रामीण क्षेत्र (Rural) से हैं और OBC वर्ग में आते हैं, आपको सरकार से 35% की 
     'मार्जिन मनी सब्सिडी' (लगभग ₹54,000 की सीधी छूट) मिल सकती है!
   • आपको अपनी जेब से सिर्फ 5% (₹7,750) लगाना होगा—जबकि आपके पास ₹30,000 हैं, यानी आपकी बची 
     हुई रकम बारिश के महीनों में सुरक्षा बफर का काम करेगी।
   • बैंक लोन सिर्फ ₹93,000 का रहेगा, जिसकी 5 साल की मासिक किश्त लगभग ₹1,950 आएगी।
   
   मैंने आपके लिए 1 पन्ने की 'बैंक-रेडी प्रोजेक्ट रिपोर्ट' (DPR) तैयार कर दी है। क्या मैं भेज दूँ?"

------------------------------------------------------------------------------------------

[Turn 4: Delivery of Bank-Ready DPR & Branch Guidance]
👤 Rameshwar:
   "हाँ भाई, भेज दो।"

🤖 AI Assistant:
   "यह लीजिए आपकी बैंक रिपोर्ट! 📄 [Rameshwar_OilExpeller_DPR.pdf]
   
   👉 इसे अपने नज़दीकी 'बड़ौदा राजस्थान क्षेत्रीय ग्रामीण बैंक' या CSC सेंटर ले जाकर दिखाएँ। 
   इसमें QR कोड लगा है जिसे बैंक मैनेजर स्कैन करके आपकी प्रोजेक्ट लागत और सब्सिडी की पूरी 
   गणित सीधे देख सकते हैं। शुभकामनाएँ!"
```

---

## 2. Bank-Ready 1-Page DPR ("Calculation Passport") Wireframe

The generated PDF is engineered strictly to satisfy the checklist of a **Rural Bank Branch Manager (RRB / SBI / Cooperative Bank)** or a **District Industries Centre (DIC) Officer**. It is bilingual (Hindi & English), tamper-evident via a SHA-256 verification QR code, and fits entirely on a **single A4 sheet**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  PRADHAN MANTRI EMPLOYMENT GENERATION PROGRAMME (PMEGP) - MICRO-PROJECT PROFILE        │
│  सूक्ष्म उद्यम विस्तृत परियोजना रिपोर्ट (Bankable Detailed Project Report - DPR)        │
│  Generated via: Bharat Udyam AI | Reference ID: RAJ-JPR-2026-9041                      │
├───────────────────────────────────────────────────────────────┬────────────────────────┤
│ 1. APPLICANT & LOCATION SUMMARY                               │ QR VERIFICATION CODE   │
│ • Name / आवेदक का नाम: Rameshwar Lal (34 Yrs)                │ ┌────────────────────┐ │
│ • Social Category: OBC (Rural Special Category)               │ │ █▀▀▀█ ▄█ ▀ █▀▀▀█   │ │
│ • Village / Gram Panchayat: Morija, Block Chomu, Jaipur (Raj) │ │ █ █ █ ▄▀█▄ █ █ █   │ │
│ • Proposed Activity: Mustard Seed Cold-Press Expeller Unit    │ │ █▄▄▄█ █▀▀█ █▄▄▄█   │ │
│ • NIC Code: 10402 (Manufacture of edible vegetable oil)       │ │ ▄ ▄▄▄▄▄ ▀▄ ▄▄ ▄▀   │ │
│ • Aadhaar / UAP Linked ID: *******4921                        │ │ Scan to Verify Math│ │
├───────────────────────────────────────────────────────────────┴────────────────────────┤
│ 2. TOTAL CAPITAL EXPENDITURE & PROJECT COST (परियोजना लागत विवरण)                     │
│ ┌──────────────────────────────────────┬───────────────────────┬─────────────────────┐ │
│ │ Component (लागत घटक)                 │ Specification         │ Amount (₹)          │ │
│ ├──────────────────────────────────────┼───────────────────────┼─────────────────────┤ │
│ │ A. Plant & Machinery (मशीनरी)       │ 6-Bolt Expeller + 10HP│ ₹ 1,15,000          │ │
│ │ B. Electrical & Installation         │ 3-Phase Connection    │ ₹   10,000          │ │
│ │ C. Pre-operative / Shed Setup        │ Basic Masonry/Platform│ ₹    5,000          │ │
│ │ D. Working Capital (कार्यशील पूँजी)  │ 45-day Mustard Stock  │ ₹   25,000          │ │
│ ├──────────────────────────────────────┴───────────────────────┼─────────────────────┤ │
│ │ TOTAL PROJECT COST (कुल परियोजना लागत)                       │ ₹ 1,55,000          │ │
│ └──────────────────────────────────────────────────────────────┴─────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. PROPOSED FINANCING STRUCTURE (वित्त पोषण एवं सरकारी सब्सिडी ढाँचा)                  │
│ • Target Scheme: PMEGP (Manufacturing / Agro-Processing Sector)                        │
│ • Beneficiary Own Contribution (5% - आवेदक अंशदान):      ₹   7,750 (Avail: ₹30,000)  │
│ • Government Subsidy / Margin Money (35% - सरकारी अनुदान): ₹  54,250 (Non-repayable)   │
│ • Bank Term Loan Component (60% - बैंक ऋण घटक):           ₹  93,000                    │
│ • Repayment Tenure: 60 Months (5 Years) @ 9.5% p.a.       │ Monthly EMI: ₹ 1,954 / mo  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. VIABILITY & CASH-FLOW STRESS MATRIX (व्यवहार्यता एवं नकदी प्रवाह विश्लेषण)          │
│ • Projected Gross Monthly Revenue (औसत मासिक आय):       ₹ 32,000                       │
│ • Monthly Operating Cost (कच्चा माल, बिजली, मजदूरी):   ₹ 21,500                       │
│ • Net Operating Monthly Surplus (शुद्ध मासिक बचत):      ₹ 10,500                       │
│ • Minimum Lean-Month Surplus (बारिश के महीनों में):     ₹  5,800                       │
│ • Average Debt Service Coverage Ratio (DSCR):           4.42 (Highly Bankable > 1.50)  │
│ • Minimum Seasonal DSCR (Lowest Lean Month):            2.96 (Safe Repayment Buffer)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. HYPER-LOCAL MARKET FEASIBILITY REPORT (स्थानीय बाज़ार व्यवहार्यता रिपोर्ट)          │
│ • Village Demand Index: High (Surplus mustard production in Chomu APMC belt)           │
│ • Competitor Density: 1 Defunct Unit within 3 km radius (Saturation Risk: LOW)         │
│ • Raw Material Distance: Direct farmer procurement within 2 km radius                  │
│ • Risk Mitigant: Applicant holds ₹22,250 emergency surplus after paying own 5% margin │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 6. INSTITUTIONAL ENDORSEMENT & SUBMISSION SLIP (बैंक शाखा हेतु प्रपत्र)               │
│ Recommended Bank: Baroda Rajasthan Kshetriya Gramin Bank (BRKGB), Chomu Branch         │
│ Certified by: Bharat Udyam AI Engine (Rules Audited as per PMEGP Guidelines 2024-25)    │
│ [Signature / Thumb Impression of Applicant]             [Lead Bank Officer Seal / Date]│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Design Choices for Rural Adoption

1. **Dual Verification Mechanism:**
   - The paper printout can be physically stamped by a CSC VLE or Bank Sakhi.
   - The embedded **QR Code** links to a tamper-proof web verification endpoint (`/verify/RAJ-JPR-2026-9041`) displaying the exact algorithmic calculations, preventing forged DPR submissions.
2. **Lean-Month Safety Buffer Explicitly Flagged:**
   - Bank managers frequently decline rural micro-loans fearing monsoon default. By explicitly calculating the **Minimum Seasonal DSCR** (2.96 in the worst month) and proving that the monthly surplus remains well above the ₹1,954 EMI, branch approval rates increase dramatically.
3. **Audio Playback Companion:**
   - Every generated DPR comes with a 45-second synthesized WhatsApp audio note explaining the exact numbers to the illiterate entrepreneur so they can speak with confidence when facing the bank branch manager.

