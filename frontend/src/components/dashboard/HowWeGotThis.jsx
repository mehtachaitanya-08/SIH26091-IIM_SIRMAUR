import React from 'react';

/**
 * HowWeGotThis (Stage A) — a small "How we got this" link under a figure. It opens to show where
 * the figure comes from (its tags), how it was worked out, and notes. Nothing is hidden for good:
 * text that used to sit on screen (source tags, ASSUMED notes, the research file's own labels)
 * moves in here.
 *
 * Plain names for the sources, used across the dashboard.
 */
export const SOURCE_NSFDC = "from a saved copy of the Ministry's test website devmosje.negd.in";
export const sourceResearch = (code) => `team's research estimate, ${code} research file`;

/** A server tag in plain words, keeping the tag itself: "S1" -> the NSFDC source; "D08 dossier" -> research file. */
export function plainTag(tag) {
  if (!tag) return null;
  const t = String(tag);
  if (/\bS1\b/.test(t)) return `${SOURCE_NSFDC} (${t.replace(/[[\]]/g, '')})`;
  const m = t.match(/\b(D(0[1-9]|1\d|2[0-4]))\s+dossier\b/);
  if (m) return `${sourceResearch(m[1])} (${t})`;
  return t;
}

export default function HowWeGotThis({ tags = [], working = null, notes = [], className = '' }) {
  const tagList = (Array.isArray(tags) ? tags : [tags]).filter(Boolean);
  const noteList = (Array.isArray(notes) ? notes : [notes]).filter(Boolean);
  if (!tagList.length && !working && !noteList.length) return null;
  return (
    <details className={`text-[10px] text-[#686D65] font-normal ${className}`}>
      <summary className="cursor-pointer select-none text-[#0E7A53] hover:underline w-fit">How we got this</summary>
      <div className="mt-1 space-y-0.5 pl-2 border-l border-[#E9ECEF]">
        {tagList.map((t, i) => <p key={`t${i}`}>Source: {plainTag(t)}</p>)}
        {working && <p>Working: {working}</p>}
        {noteList.map((n, i) => <p key={`n${i}`}>{n}</p>)}
      </div>
    </details>
  );
}
