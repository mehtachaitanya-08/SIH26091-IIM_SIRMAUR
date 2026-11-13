import React from 'react';
import {
  GROUPS, FIELDS, PROMOTER_FIELDS, ENCLOSURES, ENCLOSURES_HI, MAX_PROMOTERS, emptyPromoter, chars, capOf, fieldProblem
} from '../../services/applicantForm';

/**
 * DprApplicantForm — the applicant's own rows for the DPR (Phase 1, Stage 1c).
 * Holds no state: the values live in the dashboard's memory and are sent with the download.
 * Nothing is saved, and autoComplete is off so the browser does not keep them either.
 * Hindi labels (shown with the English in Hindi mode) are our own wording, to review in Stage 1d.
 */
const box = 'w-full bg-white border border-[#E9ECEF] rounded-lg p-2 text-xs focus:outline-none font-sans-ui';

export default function DprApplicantForm({ values, onChange, onClear, language = 'en' }) {
  const hi = language === 'hi';
  const label = (x) => (hi ? `${x.hi} / ${x.en}` : x.en);
  const both = (h, e) => (hi ? `${h} / ${e}` : e);
  const set = (key, v) => onChange({ ...values, [key]: v }, key);
  const setPromoter = (i, key, v) => {
    const promoters = values.promoters.map((p, j) => (j === i ? { ...p, [key]: v } : p));
    onChange({ ...values, promoters }, `promoters.${i}.${key}`);
  };
  const addPromoter = () => onChange({ ...values, promoters: [...values.promoters, emptyPromoter()] }, 'promoters');
  const removePromoter = (i) => onChange({ ...values, promoters: values.promoters.filter((_, j) => j !== i) }, 'promoters');
  const toggleEnclosure = (e) => {
    const has = values.enclosures.includes(e);
    onChange({ ...values, enclosures: has ? values.enclosures.filter((x) => x !== e) : [...values.enclosures, e] }, 'enclosures');
  };

  const input = (x, value, onValue, id) => {
    const common = { 'data-applicant': id, autoComplete: 'off', value: value ?? '', className: box };
    if (x.kind === 'yesno') {
      return (
        <select {...common} onChange={(e) => onValue(e.target.value)}>
          <option value="">{hi ? 'नहीं बताया / Not said' : 'Not said'}</option>
          <option value="yes">{hi ? 'हाँ / Yes' : 'Yes'}</option>
          <option value="no">{hi ? 'नहीं / No' : 'No'}</option>
        </select>
      );
    }
    // No hidden cut-off on text (review findings 2-3): a live count and a message instead.
    if (x.kind === 'long') return <textarea {...common} rows={2} onChange={(e) => onValue(e.target.value)} />;
    if (x.kind === 'date') return <input {...common} type="date" onChange={(e) => onValue(e.target.value)} />;
    if (x.kind === 'aadhaar') {
      // 14 characters, so a full number typed or pasted is seen and refused, not cut to its first 4 (finding 1)
      return <input {...common} type="text" inputMode="numeric" maxLength={14} onChange={(e) => onValue(e.target.value)} />;
    }
    return <input {...common} type="text" onChange={(e) => onValue(e.target.value)} />;
  };

  const counted = (x) => x.kind === 'text' || x.kind === 'long';

  const field = (x, value, onValue, id) => {
    const problem = fieldProblem(x, value);
    return (
      <label key={id} className="block space-y-1">
        <span className="font-semibold text-[#111311]">
          {label(x)}
          {x.kind === 'aadhaar' && (
            <span className="font-normal text-[#686D65]"> ({both('केवल अंतिम 4 अंक, पूरा नंबर कभी नहीं', 'last 4 digits only, never the full number')})</span>
          )}
          {x.sd && <span className="font-normal text-[#686D65]"> · {both('स्व-घोषित', 'self-declared')}</span>}
        </span>
        {input(x, value, onValue, id)}
        {counted(x) && (
          <span className={`block text-right text-[10px] ${problem ? 'text-red-700 font-semibold' : 'text-[#686D65]'}`}>
            {`${chars(value)} / ${capOf(x)}`}
          </span>
        )}
        {problem && <span className="block text-[11px] font-semibold text-red-700">{hi ? `${problem.hi} / ${problem.message}` : problem.message}</span>}
      </label>
    );
  };

  const section = (g, body) => (
    <details key={g.id} data-applicant-section={g.id} open={g.id === 'applicant'} className="rounded-xl border border-[#E9ECEF] bg-white">
      <summary className="cursor-pointer px-3 py-2 text-xs font-bold text-[#111311]">{hi ? `${g.hi} / ${g.en}` : g.en}</summary>
      <div className="px-3 pb-3 space-y-2 text-xs">{body}</div>
    </details>
  );

  return (
    <div className="space-y-2 text-xs font-sans-ui">
      <p className="text-[11px] text-[#686D65]">
        {hi && 'रिपोर्ट के लिए आपका अपना विवरण (वैकल्पिक)। यह PDF पर छपता है और कभी सहेजा नहीं जाता: पेज बंद करने या दोबारा खोलने पर मिट जाता है। खाली छोड़ने पर हाथ से भरने के लिए खाली पंक्ति छपेगी। / '}
        Your own details for the report (optional). They are printed on the PDF and never saved: closing or
        reloading the page clears them. Leave a box empty to get a blank line to fill in by hand.
      </p>
      {GROUPS.map((g) => {
        if (g.id === 'promoters') {
          return section(g, (
            <>
              {values.promoters.map((p, i) => (
                <div key={i} className="space-y-2 border-b border-[#E9ECEF] pb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{hi ? `प्रवर्तक ${i + 1} / Promoter ${i + 1}` : `Promoter ${i + 1}`}</span>
                    <button type="button" onClick={() => removePromoter(i)} className="text-[11px] text-red-700 font-semibold cursor-pointer">
                      {both('हटाएँ', 'Remove')}
                    </button>
                  </div>
                  {PROMOTER_FIELDS.map((x) => field(x, p[x.key], (v) => setPromoter(i, x.key, v), `promoters.${i}.${x.key}`))}
                </div>
              ))}
              {values.promoters.length < MAX_PROMOTERS && (
                <button type="button" onClick={addPromoter} className="px-2 py-1 rounded-lg border border-[#E9ECEF] font-semibold cursor-pointer">
                  {both(`प्रवर्तक जोड़ें (अधिकतम ${MAX_PROMOTERS})`, `Add a promoter (up to ${MAX_PROMOTERS})`)}
                </button>
              )}
            </>
          ));
        }
        if (g.id === 'enclosures') {
          return section(g, ENCLOSURES.map((e) => (
            <label key={e} className="flex items-center gap-2">
              <input type="checkbox" data-applicant="enclosures" value={e} autoComplete="off"
                checked={values.enclosures.includes(e)} onChange={() => toggleEnclosure(e)} />
              <span>{hi ? `${ENCLOSURES_HI[e]} / ${e}` : e}</span>
            </label>
          )));
        }
        return section(g, FIELDS.filter((x) => x.group === g.id).map((x) => field(x, values[x.key], (v) => set(x.key, v), x.key)));
      })}
      <button type="button" onClick={onClear} className="px-3 py-1.5 rounded-lg border border-[#E9ECEF] bg-white font-bold cursor-pointer">
        {both('साफ़ करें', 'Clear form')}
      </button>
    </div>
  );
}
