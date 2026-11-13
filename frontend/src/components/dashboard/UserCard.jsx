import React from 'react';

/**
 * UserCard — Bottom Profile Card
 * Shows only what the signed-in user told us, marked self-declared. Nothing on it is checked
 * by anyone, so it carries no "verified" badge: the old statutory "profile verified" button and
 * the fixed "Income ≤ ₹5.00L" line showed every user as checked (teammate review, 11 Nov 2026).
 */

// "Asha Devi" -> "AD"; one name -> its first letter. Works for Devanagari too.
function initialsOf(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = Array.from(parts[0])[0] || '';
  const last = parts.length > 1 ? Array.from(parts[parts.length - 1])[0] || '' : '';
  return (first + last).toUpperCase();
}

export default function UserCard({
  currentUser = null,
  language = 'en'
}) {
  const displayName = currentUser?.name || (language === 'hi' ? 'उद्यमी' : 'Entrepreneur');
  const selfDeclared = language === 'hi' ? 'स्वयं घोषित' : 'self-declared';
  // Saved income is a number (My account, Stage A); shown as "₹1,20,000". 0 is a real answer.
  const income = currentUser?.income;
  const incomeText = typeof income === 'number' && Number.isFinite(income)
    ? `Income ₹${income.toLocaleString('en-IN')}`
    : income ? `Income ${income}` : null;
  const details = [currentUser?.category, incomeText]
    .filter(Boolean);
  const detailLine = details.length ? `${details.join(' · ')} (${selfDeclared})` : '';

  return (
    <div className="bg-slate-100/80 rounded-xl p-3.5 border border-slate-200 mt-6">
      <div className="flex items-center space-x-3">
        {currentUser?.avatar ? (
          <img
            src={currentUser.avatar}
            alt={displayName}
            className="w-9 h-9 rounded-full object-cover border border-white shadow-sm flex-shrink-0"
          />
        ) : (
          <span
            aria-hidden="true"
            className="w-9 h-9 rounded-full bg-[#0E7A53] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 font-sans-ui"
          >
            {initialsOf(displayName)}
          </span>
        )}
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-[#111311] truncate font-sans-ui">
            {displayName}
          </p>
          {detailLine && (
            <p className="text-[11px] text-[#686D65] font-mono break-words">
              {detailLine}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
