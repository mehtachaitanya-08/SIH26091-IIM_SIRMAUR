import React, { useEffect, useRef } from 'react';

/**
 * CommandBar — Chat Console
 * Production: the UdyamSetuAI assistant (POST /api/chat). It finds the user's business, asks its
 * questions and works out the loan; every number in its replies comes from server tools.
 * Mockup (landing page): the same look, no network calls.
 *
 * WHY IT IS PINNED. The answer used to appear in a short strip at the foot of a long column,
 * below the judge panels, so a teammate asked the chat a question and thought nothing came back
 * (teammate review, 11 Nov 2026). The bar now sticks to the bottom of the column, the answer
 * area is taller, and it scrolls itself to the newest message.
 */
export default function CommandBar({
  commandInput = '',
  onInputChange,
  onSubmit,
  onSelectChip,
  chatMessages = null,
  chatBusy = false,
  chatNotice = null,
  mode = 'mockup'
}) {
  const isChat = mode === 'production' && Array.isArray(chatMessages);
  const showThread = isChat && (chatMessages.length > 0 || chatNotice || chatBusy);
  const thread = useRef(null);

  // Keep the newest message in view inside the answer box (the page itself does not jump).
  useEffect(() => {
    if (showThread && thread.current) thread.current.scrollTop = thread.current.scrollHeight;
  }, [showThread, chatMessages, chatBusy, chatNotice]);

  return (
    <div className={`bg-[#F8F9FA] rounded-2xl p-3 border border-[#E9ECEF] space-y-2.5 ${
      isChat ? 'sticky bottom-0 z-10 shadow-[0_-8px_24px_rgba(17,19,17,0.06)]' : ''
    }`}>
      {showThread && (
        <div ref={thread} className="max-h-[45vh] overflow-y-auto space-y-2 px-2 pt-1 text-xs font-sans-ui" aria-live="polite">
          {chatMessages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <span
                className={`inline-block max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-left ${
                  m.role === 'user' ? 'bg-[#111311] text-white' : 'bg-white text-[#111311] border border-[#E9ECEF]'
                }`}
              >
                {m.content}
              </span>
            </div>
          ))}
          {chatBusy && (
            <p className="text-[#686D65] italic whitespace-pre-line">
              {'सोच रहा है… 30 सेकंड तक लग सकते हैं।\nThinking… this can take up to 30 seconds.'}
            </p>
          )}
          {chatNotice && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-red-700 font-semibold whitespace-pre-line">
              {chatNotice}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center space-x-2 text-xs text-[#686D65] px-2">
        <input
          type="text"
          value={commandInput}
          onChange={(e) => onInputChange && onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit && onSubmit()}
          placeholder={isChat
            ? "Ask UdyamSetuAI (e.g. 'I am a blacksmith in UP, can I get a loan?')..."
            : "Enter command or module keyword (e.g. 'amortizer', 'debt', 'dpr')..."}
          aria-label={isChat ? 'Ask UdyamSetuAI' : 'Command'}
          disabled={isChat && chatBusy}
          className="w-full bg-transparent focus:outline-none text-[#111311] placeholder-[#686D65] text-xs font-medium font-sans-ui"
        />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-2 text-xs">
          <button
            type="button"
            onClick={() => onSelectChip && onSelectChip('dpr')}
            className="px-2.5 py-1 rounded-lg bg-white text-[#111311] font-semibold text-[11px] border border-[#E9ECEF] hover:bg-slate-50 transition-all shadow-sm cursor-pointer font-sans-ui"
          >
            Lead-Bank DPR
          </button>

          <button
            type="button"
            onClick={() => onSelectChip && onSelectChip('amortizer')}
            className="px-2.5 py-1 rounded-lg bg-white text-[#111311] font-semibold text-[11px] border border-[#E9ECEF] hover:bg-slate-50 transition-all shadow-sm cursor-pointer font-sans-ui"
          >
            Quarterly EQI
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onSubmit && onSubmit()}
            disabled={isChat && chatBusy}
            className="px-3 py-1.5 rounded-lg bg-[#111311] text-white hover:bg-slate-800 transition-all text-xs font-bold shadow-sm cursor-pointer font-sans-ui"
          >
            {isChat ? 'Send' : 'Run'}
          </button>
        </div>
      </div>
    </div>
  );
}
