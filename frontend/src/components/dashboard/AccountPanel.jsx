import React, { useState } from 'react';
import { updateUser, changePin, CATEGORY_SC, CATEGORY_NOT_SC } from '../../data/userDatabase';

/**
 * AccountPanel — "My account" (Stage A)
 * The user's own answers about themselves (self-declared, checked by nobody): name, SC, yearly
 * family income and district. Change PIN (needs the current PIN; hidden for Google accounts).
 * Sign out. Saved in this browser only (userDatabase.js).
 */
const box = 'w-full bg-white border border-[#E9ECEF] rounded-xl p-2 text-xs font-semibold focus:outline-none font-sans-ui';

const scValue = (category) => (category === CATEGORY_SC || category === 'SC' ? 'yes' : category === CATEGORY_NOT_SC ? 'no' : '');

export default function AccountPanel({ currentUser, onSaved, onSignOut, onClose }) {
  const [name, setName] = useState(currentUser?.name || '');
  const [sc, setSc] = useState(scValue(currentUser?.category));
  const [income, setIncome] = useState(currentUser?.income ?? '');
  const [district, setDistrict] = useState(currentUser?.district || '');
  const [message, setMessage] = useState(null);
  const [pinNow, setPinNow] = useState('');
  const [pinNew, setPinNew] = useState('');
  const [pinMessage, setPinMessage] = useState(null);
  if (!currentUser) return null;
  const hasPin = currentUser.authProvider !== 'google' && Boolean(currentUser.pin);

  const save = (e) => {
    e.preventDefault();
    const category = sc === 'yes' ? CATEGORY_SC : sc === 'no' ? CATEGORY_NOT_SC : null;
    const r = updateUser(currentUser.id, { name, category, income, district });
    if (!r.success) { setMessage({ ok: false, text: r.error }); return; }
    setMessage({ ok: true, text: 'Saved.' });
    onSaved && onSaved(r.user);
  };

  const savePin = (e) => {
    e.preventDefault();
    const r = changePin(currentUser.id, pinNow, pinNew);
    if (!r.success) { setPinMessage({ ok: false, text: r.error }); return; }
    setPinNow(''); setPinNew('');
    setPinMessage({ ok: true, text: 'PIN changed. Use the new PIN next time you sign in.' });
    onSaved && onSaved(r.user);
  };

  const note = (m) => m && (
    <p role={m.ok ? 'status' : 'alert'} className={`text-[11px] font-semibold ${m.ok ? 'text-[#0E7A53]' : 'text-red-700'}`}>{m.text}</p>
  );

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="My account"
        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#F8F9FA] rounded-2xl p-5 border border-[#E9ECEF] space-y-4 font-sans-ui"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
          <h4 className="font-bold text-sm text-[#111311]">My account</h4>
          <button type="button" onClick={onClose} className="text-xs text-[#686D65] hover:text-[#111311] font-semibold cursor-pointer">Close</button>
        </div>

        <form onSubmit={save} className="space-y-3 text-xs">
          <p className="text-[11px] text-[#686D65]">Your own answers (self-declared). Saved in this browser only.</p>
          <label className="block space-y-1">
            <span className="font-semibold text-[#111311]">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={box} />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-[#111311]">Scheduled Caste?</span>
            <select value={sc} onChange={(e) => setSc(e.target.value)} className={box}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="">Not said</option>
            </select>
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-[#111311]">Yearly family income (rupees)</span>
            <input type="number" min="0" inputMode="numeric" value={income} onChange={(e) => setIncome(e.target.value)} className={box} />
          </label>
          <label className="block space-y-1">
            <span className="font-semibold text-[#111311]">District</span>
            <input value={district} onChange={(e) => setDistrict(e.target.value)} className={box} />
          </label>
          {note(message)}
          <button type="submit" className="px-3 py-1.5 rounded-xl bg-[#111311] text-white font-bold hover:bg-slate-800 cursor-pointer">Save</button>
        </form>

        {hasPin && (
          <form onSubmit={savePin} className="space-y-3 text-xs pt-3 border-t border-[#E9ECEF]">
            <span className="block font-bold text-[#111311]">Change PIN</span>
            <label className="block space-y-1">
              <span className="font-semibold text-[#111311]">Current PIN</span>
              <input type="password" inputMode="numeric" maxLength={4} autoComplete="current-password" value={pinNow} onChange={(e) => setPinNow(e.target.value)} className={box} />
            </label>
            <label className="block space-y-1">
              <span className="font-semibold text-[#111311]">New PIN (4 digits)</span>
              <input type="password" inputMode="numeric" maxLength={4} autoComplete="new-password" value={pinNew} onChange={(e) => setPinNew(e.target.value)} className={box} />
            </label>
            {note(pinMessage)}
            <button type="submit" className="px-3 py-1.5 rounded-xl bg-[#111311] text-white font-bold hover:bg-slate-800 cursor-pointer">Change PIN</button>
          </form>
        )}

        <div className="pt-3 border-t border-[#E9ECEF]">
          <button type="button" onClick={onSignOut} className="px-3 py-1.5 rounded-xl border border-red-200 bg-white text-red-700 text-xs font-bold hover:bg-red-50 cursor-pointer">Sign out</button>
        </div>
      </div>
    </div>
  );
}
