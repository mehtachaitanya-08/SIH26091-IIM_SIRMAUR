import React from 'react';

/**
 * DashboardShell — Outer Architecture Shell
 * Provides the signature SETO diffused ambient canvas (.diffused-backdrop),
 * soft-shadow elevation, and responsive 3-column container grid.
 */
export default function DashboardShell({
  children,
  language = 'en',
  mode = 'mockup',
  id = 'dashboard-section',
  toastMessage = null,
  showTitle = true,
  className = ''
}) {
  const headline = language === 'hi' ? 'उद्यमी कार्यक्षेत्र.' : 'The Entrepreneur Workspace.';

  return (
    <section id={id} className={`py-16 px-4 sm:px-8 max-w-[1500px] mx-auto font-sans ${className}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          className="fixed bottom-6 right-6 z-50 bg-[#111311] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center space-x-2 animate-fadeIn"
          role="status"
          aria-live="polite"
        >
          <span className="w-2 h-2 rounded-full bg-[#0E7A53]"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Section Header */}
      {showTitle && (
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-editorial font-normal text-[#111311] tracking-tight leading-[1.08]">
            {headline}
          </h2>
        </div>
      )}

      {/* Enterprise Advisory Workspace Enclosure with SETO Diffused Ambient Canvas */}
      <div className="bg-[#E9ECEF] diffused-backdrop rounded-[32px] p-3 sm:p-6 border border-[#DEE2E6] soft-shadow">
        
        {/* Main 3-Column White Shell */}
        <div className="bg-white rounded-[24px] overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 min-h-[760px] border border-[#E9ECEF]">
          {children}
        </div>

      </div>

    </section>
  );
}
