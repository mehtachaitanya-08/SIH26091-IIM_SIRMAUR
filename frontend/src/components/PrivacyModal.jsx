import React from 'react';
import { X, ShieldCheck, Database, Lock, Trash2, AlertCircle } from 'lucide-react';

/**
 * PrivacyModal — Statutory DPDP Act 2023 Compliance & Consent Notice
 * Discloses purpose specification, ephemeral AI processing, local data custody,
 * and provides an immediate one-click "Purge All My Data" right-to-erasure action.
 */
export default function PrivacyModal({
  isOpen,
  onClose,
  language = 'en',
  onPurgeData
}) {
  if (!isOpen) return null;

  const isHi = language === 'hi';

  const handlePurge = () => {
    const confirmMsg = isHi
      ? 'क्या आप सचमुच अपना सभी डेटा, सुरक्षित परिदृश्य और सत्र हटाना चाहते हैं?'
      : 'Are you sure you want to purge all your locally saved data, scenarios, and active session?';
    if (window.confirm(confirmMsg)) {
      if (onPurgeData) onPurgeData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 font-sans-ui">
                {isHi ? 'गोपनीयता नीति एवं डेटा सुरक्षा (DPDP अधिनियम 2023)' : 'Privacy Policy & Data Protection (DPDP Act 2023)'}
              </h3>
              <p className="text-[11px] text-slate-500 font-sans-ui">
                {isHi ? 'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 के तहत वैधानिक अनुपालन' : 'Statutory Compliance Notice under Digital Personal Data Protection Act, 2023'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Clauses */}
        <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed font-sans-ui max-h-[60vh] overflow-y-auto pr-1">
          {/* 1. Purpose Limitation */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isHi ? '1. उद्देश्य सीमांकन (Purpose Limitation)' : '1. Purpose Specification & Strict Limitation'}</span>
            </div>
            <p>
              {isHi
                ? 'आपके द्वारा दर्ज की गई जाति (SC/ST/OBC), वार्षिक पारिवारिक आय, एवं ऋण संबंधी जानकारियाँ केवल भारत सरकार के वैधानिक रियायती ऋण (NSFDC, NSTFDC, PMEGP, PM Vishwakarma) की पात्रता जाँचने एवं विस्तृत परियोजना रिपोर्ट (DPR) तैयार करने हेतु उपयोग की जाती हैं। यह डेटा किसी भी वाणिज्यिक क्रेडिट ब्यूरो या विपणन कंपनी को नहीं बेचा जाता।'
                : 'Sensitive information declared by applicants (including caste category, annual household income, and informal liabilities) is strictly processed to evaluate eligibility for Central/State concessional credit schemes and compile institutional Detailed Project Reports (DPR). Data is never commercialized, sold, or shared with credit rating agencies.'}
            </p>
          </div>

          {/* 2. Local-First Custody */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Database className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isHi ? '2. लोकल-फर्स्ट डेटा भंडारण (Local-First Data Custody)' : '2. Local-First Client Storage'}</span>
            </div>
            <p>
              {isHi
                ? 'आपके सुरक्षित परिदृश्य और प्रोफ़ाइल विवरण आपके स्वयं के ब्राउज़र के लोकल स्टोरेज (localStorage) में सुरक्षित रहते हैं। कोई भी व्यक्तिगत वित्तीय रिकॉर्ड केंद्रीय सर्वर पर स्थायी रूप से संग्रहित नहीं किया जाता।'
                : 'Simulations, intake profiles, and custom scenario records reside directly inside your browser’s local storage. No persistent tracking database retains your confidential financial drafts on central servers.'}
            </p>
          </div>

          {/* 3. Ephemeral AI Inference */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>{isHi ? '3. क्षणिक AI प्रसंस्करण (Ephemeral AI Inference)' : '3. Ephemeral AI Processing'}</span>
            </div>
            <p>
              {isHi
                ? 'UdyamSetuAI का सहायक मॉडल (Groq LLM) केवल वास्तविक समय में प्रतिक्रिया देने के लिए सत्र डेटा को प्रोसेस करता है। यह डेटा सार्वजनिक मॉडल प्रशिक्षण हेतु कभी भी उपयोग में नहीं लाया जाता।'
                : 'Inference queries processed through our Groq-hosted open-weight intelligence layer are purely stateless and ephemeral. Inputs are never retained or harvested for model training.'}
            </p>
          </div>

          {/* 4. Right to Erasure / Purge */}
          <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-red-900">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{isHi ? '4. डेटा मिटाने का अधिकार (Right to Erasure)' : '4. Right to Complete Erasure (One-Click Purge)'}</span>
            </div>
            <p className="text-red-700">
              {isHi
                ? 'DPDP अधिनियम 2023 की धारा 12 के तहत, आपको अपने सभी व्यक्तिगत डेटा को तुरंत मिटाने का पूर्ण अधिकार है। नीचे दिए गए बटन पर क्लिक करके आप अपना सारा डेटा एक क्लिक में पूरी तरह हटा सकते हैं।'
                : 'Under Section 12 of the DPDP Act 2023, you hold the statutory right to erase all personal identifiers, sessions, and saved draft simulations with immediate effect.'}
            </p>
            <button
              type="button"
              onClick={handlePurge}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isHi ? 'मेरा समस्त डेटा तुरंत हटाएं (Purge All Data)' : 'Purge All My Data Immediately'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {isHi ? 'समझ गया / स्वीकार है' : 'Understood & Accept'}
          </button>
        </div>
      </div>
    </div>
  );
}

