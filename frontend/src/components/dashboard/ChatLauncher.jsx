import React, { useEffect, useRef, useState } from 'react';
import { boldParts, STARTERS, CHAT_UI, CHAT_HINT } from '../../services/chatText';

/**
 * ChatLauncher (Stage A) — the chat as a button at the bottom right ("मदद / Ask AI") that opens a
 * panel (about 380×600; full screen below 640 px wide). It never opens by itself, except when the
 * user asked a question on the front page. First open: pick हिन्दी or English, then 3 starter
 * questions. The header switch changes the language at any time. The conversation is kept while
 * the panel is closed (not after a page reload). Safe to render on the server (no window use).
 * A "Ready to help" tip sits beside the closed button (owner, 14 Nov 2026: the chat was not
 * found). It goes once the chat is opened or its x is pressed, and shows only while the server
 * is up, because the chat cannot answer without it.
 */
function Bubble({ role, content }) {
  const mine = role === 'user';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <p className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-line break-words ${
        mine ? 'bg-[#111311] text-white rounded-br-sm' : 'bg-white border border-[#E9ECEF] text-[#111311] rounded-bl-sm'
      }`}
      >
        {boldParts(content).map((p, i) => (p.bold ? <strong key={i}>{p.text}</strong> : <React.Fragment key={i}>{p.text}</React.Fragment>))}
      </p>
    </div>
  );
}

function TypingDots({ label }) {
  return (
    <div className="flex justify-start" aria-label={label} role="status">
      <span className="inline-flex gap-1 rounded-2xl rounded-bl-sm bg-white border border-[#E9ECEF] px-3 py-2.5">
        {[0, 150, 300].map((d) => (
          <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#686D65] animate-bounce" style={{ animationDelay: `${d}ms` }} />
        ))}
      </span>
    </div>
  );
}

export default function ChatLauncher({
  open = false,
  onOpen,
  onClose,
  language = null,
  onLanguageChange,
  messages = [],
  busy = false,
  notice = null,
  input = '',
  onInputChange,
  onSend,
  online = true
}) {
  const endRef = useRef(null);
  const [hint, setHint] = useState(true);
  useEffect(() => {
    if (open) setHint(false);
  }, [open]);
  useEffect(() => {
    if (open && endRef.current && endRef.current.scrollIntoView) endRef.current.scrollIntoView({ block: 'end' });
  }, [open, messages.length, busy, notice]);

  if (!open) {
    return (
      <div className="fixed bottom-4 right-4 z-[90] flex flex-col items-end gap-2 font-sans-ui">
        {hint && online && (
          <div className="relative max-w-[240px] rounded-2xl rounded-br-sm bg-white border border-[#E9ECEF] shadow-lg pl-3 pr-7 py-2">
            <button
              type="button"
              onClick={onOpen}
              className="text-left text-xs text-[#111311] cursor-pointer"
            >
              <span aria-hidden="true">👋 </span>
              <span className="font-bold">{CHAT_HINT.hi}</span>
              <br />
              {CHAT_HINT.en}
            </button>
            <button
              type="button"
              onClick={() => setHint(false)}
              aria-label="Hide this tip"
              className="absolute top-1 right-1.5 px-1 text-xs text-[#686D65] hover:text-[#111311] cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-2 rounded-full bg-[#0E7A53] hover:bg-[#0c6846] px-4 py-3 text-sm font-bold text-white shadow-lg cursor-pointer"
        >
          <span aria-hidden="true" className="w-2 h-2 rounded-full bg-emerald-300" />
          मदद / Ask AI
        </button>
      </div>
    );
  }

  const ui = CHAT_UI[language] || CHAT_UI.en;
  const choosing = !language && messages.length === 0;
  const send = (text) => { if (onSend) onSend(text); };

  return (
    <section
      role="dialog"
      aria-label="UdyamSetuAI chat"
      className="fixed z-[90] inset-0 sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[380px] sm:h-[600px] sm:max-h-[calc(100vh-2rem)] flex flex-col bg-[#F8F9FA] sm:rounded-2xl border border-[#E9ECEF] shadow-2xl font-sans-ui"
    >
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E9ECEF] sm:rounded-t-2xl">
        <span className="font-bold text-sm text-[#111311]">UdyamSetuAI</span>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-[#E9ECEF] overflow-hidden text-xs font-semibold" role="group" aria-label="Language">
            {[['hi', 'हि'], ['en', 'EN']].map(([code, label]) => (
              <button
                key={code}
                type="button"
                aria-pressed={language === code}
                onClick={() => onLanguageChange && onLanguageChange(code)}
                className={`px-2.5 py-1 cursor-pointer ${language === code ? 'bg-[#111311] text-white' : 'bg-white text-[#111311] hover:bg-slate-50'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} aria-label={ui.close} className="px-2 py-1 text-xs font-semibold text-[#686D65] hover:text-[#111311] cursor-pointer">
            ✕
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {choosing ? (
          <div className="space-y-3 pt-6 text-center">
            <p className="text-sm font-semibold text-[#111311]">अपनी भाषा चुनें<br />Choose your language</p>
            <div className="flex justify-center gap-3">
              <button type="button" onClick={() => onLanguageChange && onLanguageChange('hi')} className="px-5 py-2.5 rounded-xl bg-white border border-[#E9ECEF] hover:border-[#111311]/40 text-sm font-bold cursor-pointer">हिन्दी</button>
              <button type="button" onClick={() => onLanguageChange && onLanguageChange('en')} className="px-5 py-2.5 rounded-xl bg-white border border-[#E9ECEF] hover:border-[#111311]/40 text-sm font-bold cursor-pointer">English</button>
            </div>
          </div>
        ) : (
          <>
            {messages.length === 0 && language && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-[#686D65]">{ui.starters}</p>
                {STARTERS[language].map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={busy}
                    onClick={() => send(q)}
                    className="block w-full text-left px-3 py-2 rounded-xl bg-white border border-[#E9ECEF] hover:border-[#0E7A53] text-xs text-[#111311] cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => <Bubble key={i} role={m.role} content={m.content} />)}
            {busy && <TypingDots label={ui.thinking} />}
          </>
        )}
        {notice && (
          <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-800 whitespace-pre-line">{notice}</p>
        )}
        <div ref={endRef} />
      </div>

      {!choosing && (
        <form
          className="flex items-center gap-2 px-3 py-3 bg-white border-t border-[#E9ECEF] sm:rounded-b-2xl"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <input
            value={input}
            onChange={(e) => onInputChange && onInputChange(e.target.value)}
            placeholder={ui.placeholder}
            aria-label={ui.placeholder}
            className="flex-1 min-w-0 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-3 py-2 text-xs focus:outline-none"
          />
          <button type="submit" disabled={busy || !input.trim()} className="px-3 py-2 rounded-xl bg-[#111311] text-white text-xs font-bold disabled:opacity-40 cursor-pointer">
            {ui.send}
          </button>
        </form>
      )}
    </section>
  );
}
