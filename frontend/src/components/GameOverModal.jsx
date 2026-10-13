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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-3 select-none pointer-events-auto">
      <div className="mc-panel-dark p-4 sm:p-5 shadow-2xl border-2 border-[#ff3333] backdrop-blur-md">
        {/* Header: Catastrophic Incident Notice */}
        <div className="flex items-center justify-between gap-3 mb-3 border-b border-[#443333] pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#3a0000] border-2 border-[#ff3333] flex items-center justify-center shrink-0">
              <span className="text-lg">💀</span>
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#ff3333] mc-font uppercase tracking-wide">
                CATASTROPHIC INCIDENT DEBRIEF
              </h2>
              <span className="text-[9px] mc-font text-[#ffd700] block">
                FAILED ON STAGE {stageNumber} OF {totalStages} • MINED {totalPulls} BLOCKS
              </span>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[9px] mc-font px-2 py-0.5 bg-[#250505] text-[#ff5555] border border-[#aa0000]">
              TOWER TOPPLED
            </span>
          </div>
        </div>

        {/* Fatal Outage Log */}
        <div className="bg-[#0e0c0a] border border-[#442222] p-2.5 mb-3 text-left">
          <div className="flex items-center gap-1.5 text-[9px] mc-font text-[#ff5555] mb-1">
            <Terminal className="w-3.5 h-3.5 text-[#ff5555] pointer-events-none" />
            <span>ROOT CAUSE TELEMETRY:</span>
          </div>
          <p className="text-[11px] font-mono text-[#f0e6d2] leading-snug">
            {isTowerCollapse
              ? 'Critical structural stress exceeded platform load: tower collapsed under cumulative governor debt.'
              : cleanReason}
          </p>
        </div>

        {/* Workshop Pro-Tip */}
        <p className="text-[9px] mc-font text-[#aaa] leading-relaxed mb-4 text-left">
          PRO-TIP: Use <span className="text-[#ffd700]">Enforce Guardrail Rules</span> or collaborative custom prompts to shield your voxel AIDLC from unexpected limits!
        </p>

        {/* Designated Screenplay Options (NO Replay Options) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Option 1: Hotfix & Retry (Workshop Second Chance) */}
          {onRetryStage && (
            <button
              type="button"
              onClick={onRetryStage}
              className="mc-btn mc-btn-green py-2 px-3 text-[10px] mc-font text-white cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            >
              <Wrench className="w-3.5 h-3.5 pointer-events-none" />
              <span className="pointer-events-none">Hotfix & Retry</span>
            </button>
          )}

          {/* Option 2: Clean New Run (Stage 1) */}
          <button
            type="button"
            onClick={onRestart}
            className={`mc-btn py-2 px-3 text-[10px] mc-font text-white cursor-pointer flex items-center justify-center gap-1.5 shadow-md ${
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
              onClick={onExitToLobby}
              className="mc-btn py-2 px-3 text-[10px] mc-font text-[#ccc] cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
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
