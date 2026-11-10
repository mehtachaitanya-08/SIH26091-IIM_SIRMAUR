import React from 'react';

/**
 * UserCard — Bottom Profile Card with Statutory Verification Trigger
 * Binds dynamically to active Google OAuth user or default beneficiary profile.
 */
export default function UserCard({
  currentUser = null,
  language = 'en',
  onVerifyClick
}) {
  const displayName = currentUser?.name || (language === 'hi' ? 'उद्यमी' : 'Entrepreneur');
  const displayCategory = currentUser?.category ? `${currentUser.category} · Income ≤ ₹5.00L` : 'SC · Income ≤ ₹5.00L';
  const avatarSrc = currentUser?.avatar || '/images/default_avatar.svg';

  return (
    <div className="bg-slate-100 rounded-2xl p-3.5 space-y-3 border border-slate-200 mt-6">
      <div className="flex items-center space-x-3">
        <img
          src={avatarSrc}
          alt={displayName}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80';
          }}
          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
        />
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-[#111311] truncate font-sans-ui">
            {displayName}
          </p>
          <p className="text-[11px] text-[#686D65] font-mono truncate">
            {displayCategory}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onVerifyClick}
        className="w-full py-2 px-3 rounded-xl bg-white text-[#111311] font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm hover:bg-slate-50 transition-all border border-[#E9ECEF] cursor-pointer font-sans-ui"
      >
        <span className="w-2 h-2 rounded-full bg-[#0E7A53]"></span>
        <span>Statutory Verified</span>
      </button>
    </div>
  );
}
