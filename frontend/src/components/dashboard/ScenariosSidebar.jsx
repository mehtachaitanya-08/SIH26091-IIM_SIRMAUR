import React from 'react';

/**
 * ScenariosSidebar — Right Column Scenario History & Search Filter
 * Filters scenario library by enterprise keyword, displays financial health tags,
 * and launches new simulations.
 */
export default function ScenariosSidebar({
  searchQuery = '',
  onSearchChange,
  filteredScenarios = [],
  recentChecks = {},
  onCheckChange,
  onSelectScenario,
  onRefresh,
  onCreateSimulation,
  mode = 'mockup'
}) {
  return (
    <aside className="lg:col-span-3 bg-white p-5 sm:p-6 border-l border-[#E9ECEF] flex flex-col justify-between overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-[#111311] font-sans-ui">
            Recent scenarios
          </h3>
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs text-[#686D65] hover:text-[#111311] font-medium cursor-pointer font-sans-ui"
          >
            Refresh
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search scenarios..."
            className="w-full bg-[#F8F9FA] rounded-xl px-3 py-2 text-xs text-[#111311] placeholder-[#686D65] border border-[#E9ECEF] focus:outline-none focus:border-[#111311] font-sans-ui"
          />
        </div>

        {/* Recent Scenarios List */}
        <div className="space-y-3.5 pt-2 text-xs">
          {filteredScenarios.length === 0 ? (
            <div className="p-4 text-center text-[#686D65] bg-[#F8F9FA] rounded-xl border border-[#E9ECEF]">
              <p className="font-semibold text-xs">No matching scenarios</p>
              <p className="text-[11px] text-[#A0A59D] mt-0.5">
                Try searching "Mustard", "Tailoring", or "Debt"
              </p>
            </div>
          ) : (
            filteredScenarios.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => onSelectScenario && onSelectScenario(scenario)}
                className="p-2.5 rounded-xl hover:bg-[#F8F9FA] transition-all cursor-pointer border border-transparent hover:border-[#E9ECEF]"
              >
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    checked={Boolean(recentChecks[scenario.id])}
                    onChange={(e) => onCheckChange && onCheckChange(scenario.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5 rounded border-gray-300 text-[#111311] focus:ring-0 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-[#111311] font-sans-ui">{scenario.name}</p>
                    <p className="text-[11px] text-[#686D65] mt-0.5 font-sans-ui">{scenario.subtitle}</p>

                    {scenario.image && (
                      <div className="mt-2 rounded-xl overflow-hidden h-20 w-full relative">
                        <img
                          src={scenario.image}
                          alt={scenario.imageAlt || 'Scenario preview'}
                          onError={(e) => {
                            if (scenario.imageFallback) {
                              e.currentTarget.src = scenario.imageFallback;
                            }
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      {scenario.type === 'd08' && (
                        <span className="text-[11px] text-[#0E7A53] font-medium font-mono-num">
                          DSCR 1.62x
                        </span>
                      )}

                      {scenario.type === 'd18' && (
                        <span className="text-[11px] text-[#0E7A53] font-medium font-mono-num">
                          DSCR 2.14x
                        </span>
                      )}

                      {scenario.type === 'debt' && (
                        <span className="text-[11px] text-[#0E7A53] font-bold font-mono-num">
                          {scenario.reliefText || '+₹2,460/mo relief'}
                        </span>
                      )}

                      {scenario.type !== 'd08' && scenario.type !== 'd18' && scenario.type !== 'debt' && scenario.badge && (
                        <span className="text-[11px] text-[#0E7A53] font-medium font-mono-num">
                          {scenario.badge}
                        </span>
                      )}

                      <span className="text-[11px] text-[#686D65] font-mono-num">{scenario.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Button: Create New Simulation + */}
      <button
        type="button"
        onClick={onCreateSimulation}
        className="w-full py-2.5 rounded-xl bg-[#111311] hover:bg-slate-800 text-white font-bold text-xs tracking-tight shadow-sm transition-all mt-4 cursor-pointer font-sans-ui"
      >
        Create new simulation +
      </button>
    </aside>
  );
}
