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
    <div className="min-h-screen w-full bg-[#14161a] text-white flex flex-col justify-center items-center p-3 sm:p-6 select-none animate-fadeIn">
      <div className="mc-panel-dark max-w-3xl w-full p-5 sm:p-7 shadow-2xl border-4 border-[#ffd700] space-y-5">
        {/* Banner Header */}
        <div className="flex items-center justify-between border-b-2 border-[#554411] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#2d2208] border-2 border-[#ffd700] flex items-center justify-center">
              <Trophy className="w-7 h-7 text-[#ffd700]" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-[#ffd700] mc-font uppercase tracking-wide">
                SPRINT DELIVERY AUDIT
              </h1>
              <span className="text-[10px] mc-font text-[#aaa] block mt-0.5">
                Squad: <strong className="text-white">{teamName}</strong> • 11/11 User Stories Deployed
              </span>
            </div>
          </div>

          <div className="text-right">
            {isOvertime ? (
              <span className="px-2.5 py-1 bg-[#4a0808] border border-[#ff3333] text-[#ff5555] text-[9.5px] mc-font">
                LATE SPRINT DELIVERY
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-[#0e2a14] border border-[#55ff55] text-[#55ff55] text-[9.5px] mc-font">
                SPRINT DELIVERED ON TIME!
              </span>
            )}
          </div>
        </div>

        {/* Top Telemetry KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center mc-font">
          <div className="bg-[#181818] border border-[#444] p-3">
            <span className="text-[8px] text-[#aaa] block mb-1">TOTAL SPRINT TIME</span>
            <span className="text-base sm:text-lg font-bold text-[#ffd700]">
              {totalMins}m {totalSecs}s
            </span>
            <span className="text-[8px] text-[#777] block mt-0.5">
              {isOvertime ? `Overtime: +${overtimeSeconds}s` : `Remaining: ${formattedTimeRemaining}`}
            </span>
          </div>

          <div className="bg-[#181818] border border-[#444] p-3">
            <span className="text-[8px] text-[#aaa] block mb-1">FINAL STABILITY</span>
            <span className="text-base sm:text-lg font-bold text-[#55ff55]">
              {health}% HP
            </span>
            <span className="text-[8px] text-[#777] block mt-0.5">
              {totalPulls} Blocks Mined
            </span>
          </div>

          <div className="bg-[#181818] border border-[#444] p-3">
            <span className="text-[8px] text-[#aaa] block mb-1">AI RELIANCE INDEX</span>
            <span className="text-base sm:text-lg font-bold text-[#48d1cc]">
              {aiRatio}% AI
            </span>
            <span className="text-[8px] text-[#777] block mt-0.5">
              {manualCleared} Manual / {aiCleared} AI
            </span>
          </div>

          <div className="bg-[#181818] border border-[#444] p-3">
            <span className="text-[8px] text-[#aaa] block mb-1">TECHNICAL DEBT</span>
            <span className={`text-base sm:text-lg font-bold ${debt > 2 ? 'text-[#ff5555]' : 'text-[#ffd700]'}`}>
              {debt} Units
            </span>
            <span className="text-[8px] text-[#777] block mt-0.5">
              {debt <= 2 ? 'Clean Architecture' : 'Architectural Debt'}
            </span>
          </div>
        </div>

        {/* Stage-by-Stage Burndown Records Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[9px] mc-font text-[#aaa] px-1">
            <span>STAGE DELIVERY BREAKDOWN & PACING</span>
            <span>PACING: ~2m 16s TARGET</span>
          </div>

          <div className="max-h-56 overflow-y-auto border border-[#333] bg-[#101010]">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#1a1a1a] text-[9px] mc-font text-[#ffd700] border-b border-[#333]">
                <tr>
                  <th className="p-2">Stage</th>
                  <th className="p-2">Title</th>
                  <th className="p-2">Pacing</th>
                  <th className="p-2">Resolution Method</th>
                  <th className="p-2">Tries</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {stageRecords.map((r, i) => (
                  <tr key={i} className="hover:bg-[#181818]">
                    <td className="p-2 font-mono text-[#888]">#{r.stage_id}</td>
                    <td className="p-2 font-medium text-white">{r.stage_title}</td>
                    <td className="p-2 font-mono text-[#ffd700]">
                      {Math.floor(r.time_spent_seconds / 60)}m {r.time_spent_seconds % 60}s
                    </td>
                    <td className="p-2">
                      <span
                        className={`text-[8px] mc-font px-1.5 py-0.5 border ${
                          r.method_used === 'manual_override'
                            ? 'bg-[#0d2a2a] border-[#48d1cc] text-[#48d1cc]'
                            : r.method_used === 'steer_prompt'
                            ? 'bg-[#2a2208] border-[#ffaa00] text-[#ffddaa]'
                            : r.method_used === 'guardrail'
                            ? 'bg-[#102030] border-[#38bdf8] text-[#38bdf8]'
                            : 'bg-[#2a1010] border-[#ff5555] text-[#ffaaaa]'
                        }`}
                      >
                        {r.method_used.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2 font-mono text-[#aaa]">{r.attempts_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#333]">
          <button
            type="button"
            onClick={onExit}
            className="mc-btn px-4 py-2.5 text-[10px] mc-font text-[#aaa] hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4 pointer-events-none" />
            <span className="pointer-events-none">Mode Selector</span>
          </button>
          <button
            type="button"
            onClick={onPlayAgain}
            className="mc-btn mc-btn-green px-5 py-2.5 text-[10px] mc-font text-white flex items-center gap-1.5 cursor-pointer shadow-xl"
          >
            <RotateCcw className="w-4 h-4 pointer-events-none" />
            <span className="pointer-events-none">New Sprint Run [25m]</span>
          </button>
        </div>
      </div>
    </div>
  );
}
