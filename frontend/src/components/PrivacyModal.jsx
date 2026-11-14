import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  POLICY_VERSION,
  POLICY_EFFECTIVE_DATE,
  POLICY_SECTIONS_EN,
  POLICY_SUMMARY_HI
} from '../content/privacyPolicy';

/**
 * PrivacyModal: the full Privacy Policy (content/privacyPolicy.js), in the landing page's style.
 * Opened from the landing footer, the sign-in box, the dashboard header, My account and the
 * onboarding consent box. It sits above all of them (z-[300]). "Erase my data on this device"
 * calls onPurgeData after a confirmation.
 */
export default function PrivacyModal({ isOpen, onClose, language = 'en', onPurgeData }) {
  const [view, setView] = useState(language === 'hi' ? 'hi' : 'en');

  useEffect(() => {
    if (isOpen) setView(language === 'hi' ? 'hi' : 'en');
  }, [isOpen, language]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const isHi = view === 'hi';

  const handlePurge = () => {
    const msg = isHi
      ? 'इस डिवाइस पर सहेजा आपका सारा डेटा (खाते, प्रोफ़ाइल, सहेजे परिदृश्य और सत्र) हमेशा के लिए मिट जाएगा। आगे बढ़ें?'
      : 'This permanently erases everything saved on this device: accounts, profiles, saved scenarios and your session. Continue?';
    if (window.confirm(msg)) {
      if (onPurgeData) onPurgeData();
      if (onClose) onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 animate-fadeIn"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
        className="bg-[#F8F6F0] rounded-3xl shadow-2xl border border-black/10 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-black/10 flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <p className="text-[10px] font-mono-num uppercase tracking-widest text-[#686D65]">
              {isHi ? 'संस्करण' : 'Version'} {POLICY_VERSION} · {isHi ? 'प्रभावी' : 'Effective'} {POLICY_EFFECTIVE_DATE}
            </p>
            <h2 id="privacy-title" className="font-editorial text-3xl sm:text-4xl text-[#111311] leading-tight mt-1">
              {isHi ? 'गोपनीयता नीति' : 'Privacy Policy'}
            </h2>
            <p className="text-xs text-[#686D65] font-sans-ui mt-1 max-w-xl leading-relaxed">
              {isHi
                ? 'डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 और अन्य भारतीय कानूनों के अनुसार।'
                : 'Under the Digital Personal Data Protection Act, 2023 and other applicable Indian law.'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center rounded-full border border-black/10 bg-white p-0.5 text-[11px] font-mono-num font-bold">
              <button
                type="button"
                onClick={() => setView('en')}
                className={`px-2.5 py-1 rounded-full cursor-pointer ${!isHi ? 'bg-[#111311] text-white' : 'text-[#686D65] hover:text-[#111311]'}`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setView('hi')}
                className={`px-2.5 py-1 rounded-full cursor-pointer ${isHi ? 'bg-[#111311] text-white' : 'text-[#686D65] hover:text-[#111311]'}`}
              >
                हिन्दी
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={isHi ? 'बंद करें' : 'Close'}
              className="p-1.5 rounded-full text-[#686D65] hover:text-[#111311] hover:bg-black/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 py-5 overflow-y-auto flex-1 font-sans-ui text-[13px] leading-relaxed text-[#2A2D29] space-y-6" data-lenis-prevent>
          {isHi ? (
            <section className="space-y-3">
              <h3 className="text-[11px] font-mono-num uppercase tracking-widest text-[#686D65]">सार</h3>
              <ol className="space-y-2.5 list-decimal pl-5 marker:text-[#686D65]">
                {POLICY_SUMMARY_HI.map((line, i) => <li key={i}>{line}</li>)}
              </ol>
              <button
                type="button"
                onClick={() => setView('en')}
                className="text-xs font-semibold text-[#0E7A53] hover:underline cursor-pointer"
              >
                पूरी नीति अंग्रेज़ी में पढ़ें →
              </button>
            </section>
          ) : (
            <>
              <nav aria-label="Sections" className="rounded-2xl bg-white border border-black/5 p-4">
                <p className="text-[10px] font-mono-num uppercase tracking-widest text-[#686D65] mb-2">Contents</p>
                <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                  {POLICY_SECTIONS_EN.map((s) => (
                    <li key={s.id}>
                      {/* A button, not an <a href="#...">: App.jsx treats any hash change as navigation
                          and would leave the dashboard. */}
                      <button
                        type="button"
                        onClick={() => document.getElementById(`policy-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        className="text-left text-[#111311] hover:text-[#0E7A53] hover:underline cursor-pointer"
                      >
                        {s.title}
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>
              {POLICY_SECTIONS_EN.map((s) => (
                <section key={s.id} id={`policy-${s.id}`} className="space-y-2 scroll-mt-4">
                  <h3 className="font-editorial text-xl text-[#111311]">{s.title}</h3>
                  {s.blocks.map((b, i) => (b.list ? (
                    <ul key={i} className="list-disc pl-5 space-y-1.5 marker:text-[#686D65]">
                      {b.list.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                  ) : (
                    <p key={i}>{b.p}</p>
                  )))}
                </section>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-black/10 bg-white/60 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0">
          {onPurgeData ? (
            <button
              type="button"
              onClick={handlePurge}
              className="text-xs font-semibold text-[#B42318] hover:underline cursor-pointer text-left"
            >
              {isHi ? 'इस डिवाइस से मेरा डेटा मिटाएँ' : 'Erase my data on this device'}
            </button>
          ) : <span />}
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#111311] hover:bg-black text-white font-mono-num font-bold text-xs uppercase tracking-wider cursor-pointer"
          >
            {isHi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
