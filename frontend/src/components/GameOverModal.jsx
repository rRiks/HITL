import React, { useState } from 'react';
import { Skull, AlertOctagon, RotateCcw, Terminal, Rotate3d, Eye, EyeOff, Sparkles, ChevronDown, ChevronUp, Home } from 'lucide-react';

export default function GameOverModal({
  reason = 'Catastrophic Outage',
  stageNumber = 1,
  totalStages = 11,
  health = 0,
  totalPulls = 0,
  onRestart,
  onReplayCollapse,
  onExitToLobby,
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const isTowerCollapse = reason.toLowerCase().includes('tower');

  // Extract component or exception if formatted
  const cleanReason = reason.replace(/^BUILD FAILURE:\s*/, '');

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-fadeIn select-none">
        <div className="bg-[#faf7f0]/95 border-2 border-rose-500 text-stone-900 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 truncate">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-400 flex items-center justify-center shrink-0">
              <Skull className="w-5 h-5 text-rose-600 animate-pulse" />
            </div>
            <div className="truncate">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 block">
                STAGE {stageNumber} OF {totalStages} FAILED • HEALTH 0%
              </span>
              <p className="text-xs font-black text-stone-900 font-mono truncate">
                {isTowerCollapse ? 'Virtual Architecture Tower Collapsed' : 'Catastrophic Production Outage'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onReplayCollapse && (
              <button
                onClick={onReplayCollapse}
                title="Replay 3D Collapse Animation"
                className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-white hover:bg-stone-100 border border-[#ded5c5] text-amber-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Rotate3d className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Replay</span>
              </button>
            )}

            <button
              onClick={() => setIsMinimized(false)}
              className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Telemetry</span>
            </button>

            <button
              onClick={onRestart}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {onExitToLobby && (
              <button
                onClick={onExitToLobby}
                title="Return to Welcome Screen & Table Lobby"
                className="px-3 py-2 rounded-xl text-xs font-mono font-bold bg-white hover:bg-amber-50 border border-[#ded5c5] text-stone-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Home className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Lobby</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-[#faf7f0] border-2 border-rose-500 rounded-3xl w-full max-w-2xl p-5 sm:p-8 shadow-2xl relative text-stone-900 max-h-[92vh] overflow-y-auto">
        {/* Ambient red hazard glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-36 bg-rose-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Top Control Bar: Inspect 3D Tower button */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-mono font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-300 tracking-widest uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span>CRITICAL ARCHITECTURE COLLAPSE</span>
          </span>

          <button
            onClick={() => setIsMinimized(true)}
            className="text-xs font-mono text-stone-700 hover:text-stone-950 bg-white hover:bg-stone-50 border border-[#ded5c5] px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-amber-700" />
            <span>Inspect 3D Tower Rubble</span>
          </button>
        </div>

        {/* Header Icon & Title */}
        <div className="text-center mb-5">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 bg-rose-100 border border-rose-300 text-rose-600 shadow-md">
            {isTowerCollapse ? (
              <Rotate3d className="w-9 h-9 text-amber-600 animate-spin" style={{ animationDuration: '4s' }} />
            ) : (
              <Skull className="w-9 h-9 text-rose-600 animate-bounce" />
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight font-display">
            {isTowerCollapse ? 'Virtual 3D Architecture Tower Toppled!' : 'Catastrophic Production Outage!'}
          </h2>
          <p className="text-xs text-stone-600 font-mono mt-1">
            Stage {stageNumber} of {totalStages} • Multi-Tenant Stability Breached
          </p>
        </div>

        {/* Incident Summary Card with Exact Failure Reason */}
        <div className="bg-[#f5efe3] border border-rose-300 rounded-2xl p-4 sm:p-5 mb-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-800 mb-2">
            <Terminal className="w-4 h-4 text-rose-600" />
            <span>ROOT CAUSE INCIDENT TELEMETRY:</span>
          </div>

          <div className="p-3 rounded-xl bg-white border border-rose-200 mb-4 shadow-xs">
            <p className="text-xs sm:text-sm text-stone-900 font-mono leading-relaxed font-semibold">
              {cleanReason}
            </p>
          </div>

          {/* Telemetry Stats */}
          <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-mono pt-3 border-t border-[#ded5c5]">
            <div className="bg-white p-2.5 rounded-xl border border-[#ded5c5] shadow-xs">
              <span className="text-[10px] text-stone-500 block mb-0.5">Stage Reached</span>
              <span className="font-black text-stone-900 text-sm">{stageNumber} of {totalStages}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-[#ded5c5] shadow-xs">
              <span className="text-[10px] text-stone-500 block mb-0.5">Final Health</span>
              <span className="font-black text-rose-600 text-sm">{health}%</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-[#ded5c5] shadow-xs">
              <span className="text-[10px] text-stone-500 block mb-0.5">Subsystems Lost</span>
              <span className="font-black text-amber-700 text-sm">{totalPulls} Blocks</span>
            </div>
          </div>
        </div>

        {/* Architectural Retrospective Advice */}
        <div className="p-4 rounded-2xl bg-[#f5efe3] border border-[#e2dacf] text-xs text-stone-700 mb-6 leading-relaxed font-sans shadow-xs">
          <div className="flex items-center gap-1.5 text-amber-800 font-bold font-mono mb-1 text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>WORKSHOP DEBRIEF LESSON:</span>
          </div>
          AI coding velocity without human-in-the-loop architectural verification extracts critical multi-tenant subsystems. Remember to enforce testing guardrails (like <code className="text-amber-800 font-mono font-bold">RunLocalTests</code>, <code className="text-amber-800 font-mono font-bold">SOQL FOR UPDATE</code>, and <code className="text-amber-800 font-mono font-bold">Security.stripInaccessible</code>) and guide the AI with custom prompts before the architecture collapses.
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {onReplayCollapse && (
            <button
              onClick={onReplayCollapse}
              className="py-3.5 px-5 rounded-2xl font-bold text-xs bg-white hover:bg-stone-100 border border-[#ded5c5] hover:border-amber-400 text-amber-800 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 font-display"
            >
              <Rotate3d className="w-4 h-4 animate-spin text-amber-600" style={{ animationDuration: '4s' }} />
              <span>Replay 3D Collapse 💥</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className={`py-3.5 px-6 rounded-2xl font-black text-xs bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-600/20 active:scale-98 font-display ${
              !onReplayCollapse ? 'sm:col-span-2' : ''
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Architecture & Try Again</span>
          </button>

          {onExitToLobby && (
            <button
              onClick={onExitToLobby}
              className="sm:col-span-2 py-3 px-5 rounded-2xl font-bold text-xs bg-white hover:bg-amber-50 border border-[#ded5c5] text-stone-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs font-mono"
            >
              <Home className="w-4 h-4 text-amber-700" />
              <span>Return to Table Lobby / Switch Table</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
