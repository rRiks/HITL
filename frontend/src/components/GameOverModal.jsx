import React from 'react';
import { Terminal, Wrench, RotateCcw, Home, AlertOctagon } from 'lucide-react';

export default function GameOverModal({
  reason = 'Catastrophic Outage',
  stageNumber = 1,
  totalStages = 11,
  health = 0,
  totalPulls = 0,
  onRestart,
  onRetryStage,
  onExitToLobby,
}) {
  const isTowerCollapse = reason.toLowerCase().includes('tower');
  const cleanReason = reason.replace(/^BUILD FAILURE:\s*/, '');

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn pointer-events-auto">
      <div className="mc-panel-dark p-4 sm:p-5 shadow-2xl border-4 border-[#ff3333] max-w-lg w-full text-center space-y-3 relative max-h-[88vh] overflow-y-auto">
        {/* Header: Catastrophic Incident Notice */}
        <div className="flex items-center justify-between gap-3 border-b-2 border-[#552222] pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-[#3a0000] border-2 border-[#ff3333] flex items-center justify-center shrink-0 mc-inner-box"
              style={{ borderRadius: 'var(--theme-radius-slot, 0px)' }}
            >
              <span className="text-xl">💀</span>
            </div>
            <div className="text-left">
              <h2 className="text-sm sm:text-base font-bold text-[#ff3333] mc-font uppercase tracking-wide">
                CATASTROPHIC INCIDENT DEBRIEF
              </h2>
              <span className="text-[9.5px] mc-font text-[#ffd700] block mt-0.5">
                FAILED ON STAGE {stageNumber} OF {totalStages} • MINED {totalPulls} BLOCKS
              </span>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span
              className="text-[9px] mc-font px-2 py-0.5 bg-[#250505] text-[#ff5555] border border-[#aa0000] mc-badge-pill"
              style={{ borderRadius: 'var(--theme-radius-badge, 0px)' }}
            >
              TOWER TOPPLED
            </span>
          </div>
        </div>

        {/* Fatal Outage Log */}
        <div
          className="bg-[#0e0c0a] border-2 border-[#442222] p-3 text-left mc-inner-box"
          style={{ borderRadius: 'var(--theme-radius-slot, 0px)' }}
        >
          <div className="flex items-center gap-1.5 text-[9px] mc-font text-[#ff5555] mb-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#ff5555] pointer-events-none" />
            <span>ROOT CAUSE TELEMETRY:</span>
          </div>
          <p className="text-[11px] font-mono text-[#f0e6d2] leading-relaxed">
            {isTowerCollapse
              ? 'Critical structural stress exceeded platform load: tower collapsed under cumulative governor debt.'
              : cleanReason}
          </p>
        </div>

        {/* Workshop Pro-Tip */}
        <p className="text-[9.5px] mc-font text-[#aaa] leading-relaxed text-left">
          PRO-TIP: Use <span className="text-[#ffd700]">Enforce Guardrail Rules</span> or collaborative custom prompts to shield your voxel AIDLC from unexpected limits!
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Option 1: Hotfix & Retry (Workshop Second Chance) */}
          {onRetryStage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRetryStage();
              }}
              className="mc-btn mc-btn-green py-3 px-3 text-[10px] mc-font text-white cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Wrench className="w-3.5 h-3.5 pointer-events-none" />
              <span className="pointer-events-none">Hotfix & Retry</span>
            </button>
          )}

          {/* Option 2: Clean New Run (Stage 1) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRestart();
            }}
            className={`mc-btn py-3 px-3 text-[10px] mc-font text-white cursor-pointer flex items-center justify-center gap-1.5 shadow-lg ${
              !onRetryStage ? 'sm:col-span-2' : ''
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 pointer-events-none" />
            <span className="pointer-events-none">New Run [Stage 1]</span>
          </button>

          {/* Option 3: Title Screen */}
          {onExitToLobby && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onExitToLobby();
              }}
              className="mc-btn py-3 px-3 text-[10px] mc-font text-[#ffd700] hover:text-white cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Home className="w-3.5 h-3.5 text-[#ffd700] pointer-events-none" />
              <span className="pointer-events-none">Title Screen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
