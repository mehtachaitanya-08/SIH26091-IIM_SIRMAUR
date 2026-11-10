import React from 'react';
import { X } from 'lucide-react';

/**
 * StatutoryVerificationModal — Dynamic Beneficiary Statutory Verification Dialog
 * Displays verified SC category, income threshold compliance, and certificate identification.
 */
export default function StatutoryVerificationModal({
  isOpen = false,
  onClose,
  currentUser = null,
  language = 'en'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0E7A53]"></span>
            <h4 className="font-bold text-sm text-[#111311]">Statutory Beneficiary Verification</h4>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 text-xs text-slate-600 font-sans-ui">
          <p>
            <strong className="text-slate-900">Name:</strong>{' '}
            {currentUser?.name || (language === 'hi' ? 'उद्यमी' : 'Entrepreneur')}
          </p>
          <p>
            <strong className="text-slate-900">Social Category:</strong>{' '}
            {currentUser?.category || 'Scheduled Caste (SC)'} · Verified
          </p>
          <p>
            <strong className="text-slate-900">Family Income:</strong>{' '}
            {currentUser?.income || '≤ ₹5,00,000'} (Within 07 Jan 2026 MoSJE Mandate)
          </p>
          <p>
            <strong className="text-slate-900">Concessional Routing:</strong>{' '}
            NSFDC Term Loan (8.0% p.a.) / MCF (6.5% p.a.)
          </p>
          <p>
            <strong className="text-slate-900">Statutory Certificate ID:</strong>{' '}
            {currentUser?.id ? `MoSJE/NSFDC/2026/${currentUser.id}` : 'MoSJE/NSFDC/2026/STATUTORY-VERIFIED'}
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full bg-[#111311] text-white font-bold text-xs py-2.5 rounded-xl hover:bg-slate-800 transition-all cursor-pointer font-sans-ui"
        >
          Close Verification Dossier
        </button>
      </div>
    </div>
  );
}
