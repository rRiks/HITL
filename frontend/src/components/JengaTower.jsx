import React from 'react';
import { AlertTriangle, ShieldAlert, Sparkles, CheckCircle2, Flame } from 'lucide-react';

export default function JengaTower({
  totalPulls = 0,
  pendingPulls = 0,
  instabilityPct = 0,
  onAcknowledgePull,
  onTowerToppled,
}) {
  // 18 levels of Jenga. Each level has 3 blocks.
  // Pre-seed which blocks are pulled based on pull index (reproducible pattern)
  const pulledBlockIndices = React.useMemo(() => {
    // Strategic blocks to pull from different layers for visual drama
    const pullSequence = [
      4, 10, 16, 22, 28, 34, 7, 13, 19, 25, 31, 37, 2, 8, 14, 20, 26, 32,
    ];
    return new Set(pullSequence.slice(0, totalPulls));
  }, [totalPulls]);

  // Wobble class depending on instability
  const wobbleClass =
    instabilityPct >= 70
      ? 'animate-tower-shake-hard'
      : instabilityPct >= 40
      ? 'animate-tower-wobble'
      : '';

  // Tension color
  const tensionColor =
    instabilityPct >= 75
      ? 'text-rose-400 border-rose-500/50 bg-rose-500/10'
      : instabilityPct >= 45
      ? 'text-amber-400 border-amber-500/50 bg-amber-500/10'
      : 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';

  return (
    <div className="bg-[#111622] border border-[#1e2638] rounded-2xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
          instabilityPct >= 70 ? 'bg-rose-500' : instabilityPct >= 40 ? 'bg-amber-500' : 'bg-cyan-500'
        }`}
      />

      {/* Header & Instability Gauge */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪵</span>
            <h3 className="font-bold text-white text-base tracking-wide">Jenga Physical Stability</h3>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-mono font-semibold ${tensionColor}`}>
            {instabilityPct}% Instability
          </span>
        </div>

        {/* Instability progress bar */}
        <div className="w-full bg-[#0d111a] rounded-full h-2.5 overflow-hidden border border-[#232d42] mb-4">
          <div
            className={`h-full transition-all duration-700 rounded-full ${
              instabilityPct >= 75
                ? 'bg-gradient-to-r from-amber-500 to-rose-600'
                : instabilityPct >= 45
                ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
            }`}
            style={{ width: `${Math.max(4, instabilityPct)}%` }}
          />
        </div>

        {/* Quick status counters */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-mono">
          <div className="bg-[#0b0e17] border border-[#1f2638] rounded-lg p-2 flex flex-col">
            <span className="text-slate-400">Total Pulled</span>
            <span className="text-lg font-bold text-white">{totalPulls} <span className="text-xs text-slate-500">blocks</span></span>
          </div>
          <div className="bg-[#0b0e17] border border-[#1f2638] rounded-lg p-2 flex flex-col">
            <span className="text-slate-400">Status</span>
            <span className={`text-sm font-semibold truncate ${instabilityPct >= 75 ? 'text-rose-400' : instabilityPct >= 40 ? 'text-amber-300' : 'text-emerald-400'}`}>
              {instabilityPct >= 75 ? 'Critical Leaning' : instabilityPct >= 40 ? 'Moderate Shift' : 'Stable Base'}
            </span>
          </div>
        </div>
      </div>

      {/* Pending Pull Action Callout if pending pulls > 0 */}
      {pendingPulls > 0 && (
        <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-br from-rose-950/80 to-amber-950/60 border border-rose-500/60 shadow-lg animate-pulse-danger">
          <div className="flex items-center gap-2 mb-1.5 text-rose-300 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>TABLE ACTION REQUIRED!</span>
          </div>
          <p className="text-xs text-rose-100 font-medium mb-3 leading-relaxed">
            Your team must physically remove <strong className="text-amber-300 underline font-extrabold text-sm">{pendingPulls} {pendingPulls === 1 ? 'block' : 'blocks'}</strong> from your physical table tower now!
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onAcknowledgePull(false)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tower Standing</span>
            </button>
            <button
              onClick={() => onAcknowledgePull(true)}
              className="bg-rose-700/80 hover:bg-rose-600 active:scale-95 text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Tower Collapsed!</span>
            </button>
          </div>
        </div>
      )}

      {/* SVG Isometric Jenga Tower Visualizer */}
      <div className="relative flex flex-col items-center justify-center py-2 bg-[#090c13] rounded-xl border border-[#1a2133] overflow-hidden min-h-[260px]">
        {/* Table top graphic */}
        <div className="absolute bottom-2 w-44 h-3 bg-[#1e2538] rounded-full border-t border-slate-600/40" />

        <div className={`relative transition-transform duration-500 ${wobbleClass}`} style={{ transformOrigin: 'bottom center' }}>
          <svg width="170" height="230" viewBox="0 0 170 230" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="woodFront" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="woodTop" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="woodStressed" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#b91c1c" />
              </linearGradient>
            </defs>

            {/* Render 14 visible stacked layers from bottom up */}
            {Array.from({ length: 14 }).map((_, layerIdx) => {
              const yPos = 200 - layerIdx * 13;
              const isEven = layerIdx % 2 === 0;

              return (
                <g key={layerIdx} className="transition-opacity duration-300">
                  {isEven ? (
                    // Horizontal orientation: 3 blocks side by side
                    <>
                      {[0, 1, 2].map(blockIdx => {
                        const globalBlockNum = layerIdx * 3 + blockIdx;
                        const isPulled = pulledBlockIndices.has(globalBlockNum);
                        const xOffset = 38 + blockIdx * 32;

                        if (isPulled) {
                          // Render dashed outline for pulled block slot
                          return (
                            <rect
                              key={blockIdx}
                              x={xOffset}
                              y={yPos}
                              width="28"
                              height="10"
                              rx="1.5"
                              fill="#0e1320"
                              stroke="#334155"
                              strokeDasharray="2 2"
                              opacity="0.4"
                            />
                          );
                        }

                        return (
                          <g key={blockIdx}>
                            <rect
                              x={xOffset}
                              y={yPos}
                              width="28"
                              height="10"
                              rx="1.5"
                              fill={instabilityPct >= 70 && layerIdx > 4 ? 'url(#woodStressed)' : 'url(#woodFront)'}
                              stroke="#78350f"
                              strokeWidth="0.8"
                            />
                            {/* Wooden grain highlight */}
                            <line
                              x1={xOffset + 2}
                              y1={yPos + 3}
                              x2={xOffset + 26}
                              y2={yPos + 3}
                              stroke="#fef08a"
                              strokeWidth="0.5"
                              opacity="0.4"
                            />
                          </g>
                        );
                      })}
                    </>
                  ) : (
                    // Alternating orientation: wide center cross layer
                    <>
                      {[0, 1, 2].map(blockIdx => {
                        const globalBlockNum = layerIdx * 3 + blockIdx;
                        const isPulled = pulledBlockIndices.has(globalBlockNum);
                        const xOffset = 42 + blockIdx * 30;

                        if (isPulled) {
                          return (
                            <rect
                              key={blockIdx}
                              x={xOffset}
                              y={yPos}
                              width="26"
                              height="10"
                              rx="1.5"
                              fill="#0e1320"
                              stroke="#334155"
                              strokeDasharray="2 2"
                              opacity="0.3"
                            />
                          );
                        }

                        return (
                          <g key={blockIdx}>
                            <rect
                              x={xOffset}
                              y={yPos}
                              width="26"
                              height="10"
                              rx="1.5"
                              fill={instabilityPct >= 70 && layerIdx > 4 ? 'url(#woodStressed)' : 'url(#woodTop)'}
                              stroke="#92400e"
                              strokeWidth="0.8"
                            />
                            <line
                              x1={xOffset + 3}
                              y1={yPos + 5}
                              x2={xOffset + 23}
                              y2={yPos + 5}
                              stroke="#fef08a"
                              strokeWidth="0.5"
                              opacity="0.3"
                            />
                          </g>
                        );
                      })}
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Instability Indicator Subtitle */}
        <span className="text-[11px] font-mono text-slate-400 mt-1">
          {totalPulls === 0 ? 'Tower Pristine' : `${totalPulls} Blocks Removed`}
        </span>
      </div>

      {/* Manual Table Collapse Reporter for Facilitator or Team */}
      <div className="mt-3 text-center">
        <button
          onClick={onTowerToppled}
          className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors underline cursor-pointer"
        >
          Tower toppled on table? Click here to report collapse
        </button>
      </div>
    </div>
  );
}
