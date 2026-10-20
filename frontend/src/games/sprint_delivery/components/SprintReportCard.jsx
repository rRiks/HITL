import React from 'react';
import { Trophy, Clock, Heart, Wrench, Shield, AlertTriangle, RotateCcw, Home, CheckCircle2 } from 'lucide-react';

export default function SprintReportCard({
  teamName,
  health,
  totalPulls,
  debt,
  stageRecords = [],
  formattedTimeRemaining,
  isOvertime,
  overtimeSeconds,
  onPlayAgain,
  onExit,
}) {
  const totalSprintTimeSec = stageRecords.reduce((acc, r) => acc + (r.time_spent_seconds || 0), 0);
  const totalMins = Math.floor(totalSprintTimeSec / 60);
  const totalSecs = totalSprintTimeSec % 60;

  const aiCleared = stageRecords.filter((r) => r.method_used !== 'manual_override').length;
  const manualCleared = stageRecords.filter((r) => r.method_used === 'manual_override').length;
  const aiRatio = stageRecords.length > 0 ? Math.round((aiCleared / stageRecords.length) * 100) : 0;

  return (
    <div className="min-h-screen w-full bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col justify-center items-center p-3 sm:p-6 select-none animate-fadeIn">
      <div className="w-full max-w-3xl p-5 sm:p-7 shadow-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl space-y-5 text-[var(--text-primary)]">
        {/* Banner Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/35 rounded-xl flex items-center justify-center shadow-xs">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-[var(--text-primary)] font-theme-heading tracking-tight">
                SPRINT DELIVERY AUDIT
              </h1>
              <span className="text-xs text-[var(--text-secondary)] font-medium block mt-1">
                Squad: <strong className="text-[var(--text-primary)] font-bold">{teamName}</strong> • 11/11 User Stories Deployed
              </span>
            </div>
          </div>

          <div className="text-right">
            {isOvertime ? (
              <span className="px-3 py-1 bg-rose-500/15 border border-rose-500/35 text-rose-700 dark:text-rose-400 text-xs font-bold font-mono rounded-full">
                LATE SPRINT DELIVERY
              </span>
            ) : (
              <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/35 text-emerald-700 dark:text-emerald-400 text-xs font-bold font-mono rounded-full">
                SPRINT DELIVERED ON TIME!
              </span>
            )}
          </div>
        </div>

        {/* Top Telemetry KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 rounded-xl shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-muted)] block mb-1 uppercase tracking-wider font-mono">
              TOTAL SPRINT TIME
            </span>
            <span className="text-base sm:text-xl font-black text-amber-700 dark:text-amber-300 font-mono">
              {totalMins}m {totalSecs}s
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] block mt-0.5 font-medium font-sans">
              {isOvertime ? `Overtime: +${overtimeSeconds}s` : `Remaining: ${formattedTimeRemaining}`}
            </span>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 rounded-xl shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-muted)] block mb-1 uppercase tracking-wider font-mono">
              FINAL STABILITY
            </span>
            <span className="text-base sm:text-xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
              {health}% HP
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] block mt-0.5 font-medium font-sans">
              {totalPulls} Blocks Mined
            </span>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 rounded-xl shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-muted)] block mb-1 uppercase tracking-wider font-mono">
              AI RELIANCE INDEX
            </span>
            <span className="text-base sm:text-xl font-black text-sky-700 dark:text-sky-300 font-mono">
              {aiRatio}% AI
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] block mt-0.5 font-medium font-sans">
              {manualCleared} Manual / {aiCleared} AI
            </span>
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-3 rounded-xl shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-[var(--text-muted)] block mb-1 uppercase tracking-wider font-mono">
              TECHNICAL DEBT
            </span>
            <span className={`text-base sm:text-xl font-black font-mono ${debt > 2 ? 'text-rose-700 dark:text-rose-400' : 'text-amber-700 dark:text-amber-300'}`}>
              {debt} Units
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] block mt-0.5 font-medium font-sans">
              {debt <= 2 ? 'Clean Architecture' : 'Architectural Debt'}
            </span>
          </div>
        </div>

        {/* Stage-by-Stage Burndown Records Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--text-secondary)] px-1">
            <span>STAGE DELIVERY BREAKDOWN & PACING</span>
            <span className="text-[var(--text-muted)]">PACING: ~2m 16s TARGET</span>
          </div>

          <div className="max-h-56 overflow-y-auto border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-elevated)]">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[var(--bg-card)] text-xs font-mono font-bold text-[var(--text-secondary)] border-b border-[var(--border-subtle)] sticky top-0 z-10">
                <tr>
                  <th className="p-2.5">Stage</th>
                  <th className="p-2.5">Title</th>
                  <th className="p-2.5">Pacing</th>
                  <th className="p-2.5">Resolution Method</th>
                  <th className="p-2.5">Tries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {stageRecords.map((r, i) => (
                  <tr key={i} className="hover:bg-[var(--bg-card)] transition-colors">
                    <td className="p-2.5 font-mono text-[var(--text-muted)] font-semibold">#{r.stage_id}</td>
                    <td className="p-2.5 font-medium text-[var(--text-primary)]">{r.stage_title}</td>
                    <td className="p-2.5 font-mono text-amber-700 dark:text-amber-300 font-bold">
                      {Math.floor(r.time_spent_seconds / 60)}m {r.time_spent_seconds % 60}s
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          r.method_used === 'manual_override'
                            ? 'bg-sky-500/15 border-sky-500/35 text-sky-700 dark:text-sky-300'
                            : r.method_used === 'steer_prompt'
                            ? 'bg-amber-500/15 border-amber-500/35 text-amber-800 dark:text-amber-300'
                            : r.method_used === 'guardrail'
                            ? 'bg-indigo-500/15 border-indigo-500/35 text-indigo-700 dark:text-indigo-300'
                            : 'bg-rose-500/15 border-rose-500/35 text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {r.method_used.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-[var(--text-muted)] font-bold">{r.attempts_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onExit}
            className="px-4 py-2.5 rounded-xl text-xs font-bold border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Home className="w-4 h-4 pointer-events-none" />
            <span className="pointer-events-none">Mode Selector</span>
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all"
          >
            <RotateCcw className="w-4 h-4 pointer-events-none" />
            <span className="pointer-events-none">New Sprint Run [25m]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
