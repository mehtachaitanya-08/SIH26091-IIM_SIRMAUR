/**
 * Chat panel words (Stage A): starter questions, notices and panel labels in Hindi and English,
 * and the safe way to draw the AI's **bold**. No HTML is ever built from the AI's text: it is split
 * into plain pieces that React draws as text.
 */

/** 'a **b** c' -> [{text:'a ', bold:false}, {text:'b', bold:true}, {text:' c', bold:false}]. Stray ** are dropped. */
export function boldParts(text) {
  if (!text) return [];
  const out = [];
  const re = /\*\*([^*]+?)\*\*/g;
  let last = 0;
  let m;
  const plain = (s) => { const t = s.replace(/\*\*/g, ''); if (t) out.push({ text: t, bold: false }); };
  while ((m = re.exec(text)) !== null) {
    plain(text.slice(last, m.index));
    out.push({ text: m[1], bold: true });
    last = m.index + m[0].length;
  }
  plain(text.slice(last));
  return out;
}

/** Three starter questions per language, with no numbers in them. */
export const STARTERS = {
  hi: [
    'मैं किन व्यवसायों के लिए लोन ले सकता हूँ?',
    'मेरे व्यवसाय के लिए कितना लोन मिल सकता है?',
    'DPR रिपोर्ट क्या है और कैसे मिलेगी?'
  ],
  en: [
    'Which businesses can I get a loan for?',
    'How much loan can I get for my business?',
    'What is the DPR report and how do I get it?'
  ]
};

const NOTICES = {
  aiOff: {
    hi: 'चैट अभी बंद है: इस सर्वर पर AI की चाबी नहीं है। लोन कैलकुलेटर फिर भी चलता है।',
    en: 'Chat is off right now: this server has no AI key. The loan calculator still works.'
  },
  keyRejected: {
    hi: 'चैट अभी बंद है: AI की चाबी नहीं मानी गई। लोन कैलकुलेटर फिर भी चलता है।',
    en: 'Chat is off right now: the AI key was rejected. The loan calculator still works.'
  },
  serverOffline: {
    hi: 'सर्वर बंद है, इसलिए चैट जवाब नहीं दे सकती। लोन कैलकुलेटर फिर भी चलता है।',
    en: 'The server is off, so the chat cannot answer. The loan calculator still works.'
  },
  error: {
    hi: 'कुछ गड़बड़ हुई।',
    en: 'Something went wrong with the chat.'
  }
};

/** A notice in the chosen language; before a language is chosen, Hindi with English under it. */
export function chatNotice(key, language) {
  const n = NOTICES[key];
  if (!n) return null;
  if (language === 'hi' || language === 'en') return n[language];
  return `${n.hi}\n${n.en}`;
}

/** Panel labels. */
export const CHAT_UI = {
  hi: { placeholder: 'अपना सवाल लिखें…', send: 'भेजें', close: 'बंद करें', starters: 'इनमें से कोई सवाल पूछें:', thinking: 'सोच रहा है' },
  en: { placeholder: 'Type your question…', send: 'Send', close: 'Close', starters: 'Try one of these:', thinking: 'Thinking' }
};

/**
 * The language of a question asked on the front page, before anyone picks हि/EN in the chat panel:
 * Hindi letters (Devanagari) -> 'hi', anything else -> 'en'. Owner's decision, 12 Nov 2026: English
 * letters get English whatever the site language (Hinglish typed in English letters included).
 */
export function questionLanguage(text) {
  return /[\u0900-\u097F]/.test(String(text ?? '')) ? 'hi' : 'en';
}
