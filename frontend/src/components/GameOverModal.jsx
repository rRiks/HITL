import React from 'react';
import { Terminal, Wrench, RotateCcw, Home } from 'lucide-react';

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
    <div className="fixed inset-0 z-[60] bg-black/75 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn pointer-events-auto">
      <div className="mc-panel-dark p-5 sm:p-6 shadow-2xl border-2 border-rose-500 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-2xl max-w-lg w-full text-center space-y-3.5 relative max-h-[88vh] overflow-y-auto font-sans">
        {/* Header: Catastrophic Incident Notice */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-xl">💀</span>
            </div>
            <div className="text-left">
              <h2 className="text-sm sm:text-base font-bold text-rose-600 dark:text-rose-400 font-theme-heading uppercase tracking-wide">
                CATASTROPHIC INCIDENT DEBRIEF
              </h2>
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 block mt-0.5 font-mono">
                FAILED ON STAGE {stageNumber} OF {totalStages} • MINED {totalPulls} BLOCKS
              </span>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold font-mono px-2.5 py-1 bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/35 rounded-full">
              TOWER TOPPLED
            </span>
          </div>
        </div>

        {/* Fatal Outage Log */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3.5 rounded-xl text-left">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 mb-1.5 font-mono">
            <Terminal className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 pointer-events-none" />
            <span>ROOT CAUSE TELEMETRY:</span>
          </div>
          <p className="text-xs font-mono text-[var(--text-primary)] leading-relaxed select-text">
            {isTowerCollapse
              ? 'Critical structural stress exceeded platform load: tower collapsed under cumulative governor debt.'
              : cleanReason}
          </p>
        </div>

        {/* Workshop Pro-Tip */}
        <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed text-left font-sans">
          PRO-TIP: Use <strong className="text-amber-800 dark:text-amber-300">Enforce Guardrail Rules</strong> or collaborative custom prompts to shield your voxel HITL from unexpected limits!
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
              className="py-3 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all"
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
            className={`py-3 px-3 text-xs font-bold rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card)] cursor-pointer flex items-center justify-center gap-1.5 shadow-sm transition-all ${
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
              className="py-3 px-3 text-xs font-bold rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-amber-700 dark:text-amber-300 hover:text-[var(--text-primary)] cursor-pointer flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Home className="w-3.5 h-3.5 pointer-events-none" />
              <span className="pointer-events-none">Title Screen</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
