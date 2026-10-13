import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, CheckCircle2, RotateCcw, Share2, Shield, Heart, Activity, Rotate3d, Home } from 'lucide-react';

export default function VictoryScreen({
  teamName = 'Alpha Devs',
  health = 85,
  totalPulls = 4,
  history = [],
  restarts = 0,
  debt = 0,
  onPlayAgain,
  onExitToLobby,
}) {
  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 },
      });
      const timeout = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });
      }, 500);
      return () => clearTimeout(timeout);
    } catch {}
  }, []);

  // Composite Architectural Index Calculation
  // Health (40%) + Tower Standing (40%) - Outages/Restarts (25 pts each) - Debt (5 pts each)
  const standingBlocks = Math.max(0, 54 - totalPulls);
  const standingPct = (standingBlocks / 54) * 100;
  const healthPts = Math.round(health * 0.4);
  const towerPts = Math.round(standingPct * 0.4);
  const restartPenalty = restarts * 25;
  const debtPenalty = debt * 5;
  const rawScore = healthPts + towerPts - restartPenalty - debtPenalty;
  const finalScore = Math.max(0, Math.min(100, rawScore));

  // Determine Architectural Rating & Tier
  let rating = 'Senior HITL Architect';
  let ratingColor = 'text-amber-800 border-amber-300 bg-amber-50';
  let badgeTitle = 'Grade: A (Production Hardened)';

  if (restarts === 0 && finalScore >= 75) {
    rating = 'Distinguished Zero-Downtime Fellow';
    ratingColor = 'text-emerald-800 border-emerald-300 bg-emerald-50';
    badgeTitle = 'Grade: S-Tier (Zero Outages • Enterprise Hero)';
  } else if (restarts === 0 && finalScore >= 50) {
    rating = 'Resilient HITL Architect';
    ratingColor = 'text-blue-800 border-blue-300 bg-blue-50';
    badgeTitle = 'Grade: A (Flawless Uptime • High Survival)';
  } else if (restarts > 0) {
    rating = 'Post-Incident Recovery Specialist';
    ratingColor = 'text-amber-900 border-amber-400 bg-amber-100';
    badgeTitle = `Grade: B- (${restarts} Hotfix Restart${restarts > 1 ? 's' : ''} Managed)`;
  } else {
    rating = 'Scrappy Sprint Survivor';
    ratingColor = 'text-amber-900 border-amber-400 bg-amber-100';
    badgeTitle = 'Grade: B (High Technical Debt Incurred)';
  }

  const handleCopySummary = () => {
    const summaryText = `🏆 HITL Jenga Results for Team ${teamName}
- Architectural Index Score: ${finalScore}/100
- Final App Health: ${health}%
- Virtual 3D Components Extracted: ${totalPulls} / 54 (${standingBlocks} Standing)
- Production Outages / Restarts: ${restarts}
- Technical Debt: ${debt}
- Architectural Rating: ${rating} (${badgeTitle})
Completed all 11 Salesforce AIDLC Stages!`;
    navigator.clipboard.writeText(summaryText);
    alert('Summary copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-mc-dirt text-white py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-4xl mx-auto">
        {/* Minecraft Advancement Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#1b1b1b] border-2 border-[#555] shadow-2xl mb-3">
            <span className="text-2xl">🏆</span>
            <div className="text-left">
              <span className="text-[9px] mc-font text-[#ffd700] uppercase block">
                ADVANCEMENT MADE!
              </span>
              <span className="text-xs sm:text-sm text-[#55ff55] mc-font font-bold">
                Master of Voxel AIDLC
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white mc-font tracking-wide mb-2 drop-shadow-[0_4px_0_#2b2b2b]">
            WORLD CONQUERED!
          </h1>
          <p className="text-xs sm:text-sm text-[#ddd] max-w-xl mx-auto mc-font leading-relaxed">
            Party <strong className="text-[#ffd700]">{teamName}</strong> cleared all 11 stages while keeping the <strong>3D Redstone Tower</strong> standing!
          </p>

          {/* Zero Downtime Badge or Outage Notice */}
          {restarts === 0 ? (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[#003b00] border-2 border-[#55ff55] shadow-lg">
              <span className="text-sm">🛡️</span>
              <span className="text-[11px] mc-font text-[#55ff55] font-bold">
                ZERO-DOWNTIME RESILIENCE: Never toppled, zero outages across all 11 stages!
              </span>
            </div>
          ) : (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[#3a1500] border-2 border-[#ffaa00] shadow-lg">
              <span className="text-sm">⚠️</span>
              <span className="text-[11px] mc-font text-[#ffaa00]">
                POST-MORTEM RECORD: {restarts} Hotfix Restart(s) (-{restartPenalty} pts Outage Penalty)
              </span>
            </div>
          )}
        </div>

        {/* Rating Scorecard Banner */}
        <div className="mc-panel-dark p-4 sm:p-6 shadow-2xl mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b-2 border-[#333]">
            <div>
              <span className="text-[9px] mc-font uppercase tracking-wider text-[#aaa] block mb-1">
                Architectural Performance Rating
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#ffd700] mc-font">{rating}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[9px] text-[#aaa] mc-font block">INDEX SCORE</span>
                <span className="text-2xl font-black text-[#55ff55] mc-font">{finalScore}<span className="text-sm text-[#888]">/100</span></span>
              </div>
              <div className={`px-3 py-1.5 border text-xs mc-font font-bold ${ratingColor}`}>
                {badgeTitle}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mc-font text-center">
            <div className="bg-[#1b1b1b] border border-[#444] p-3 shadow-xs">
              <span className="text-[9px] text-[#aaa] block mb-1">Health Score</span>
              <span className="text-xl font-bold text-[#55ff55]">{health}%</span>
              <span className="text-[8px] text-[#888] block mt-1">+{healthPts} pts</span>
            </div>

            <div className="bg-[#1b1b1b] border border-[#444] p-3 shadow-xs">
              <span className="text-[9px] text-[#aaa] block mb-1">Tower Standing</span>
              <span className="text-xl font-bold text-[#ffd700]">{standingBlocks} / 54</span>
              <span className="text-[8px] text-[#888] block mt-1">+{towerPts} pts</span>
            </div>

            <div className="bg-[#1b1b1b] border border-[#444] p-3 shadow-xs">
              <span className="text-[9px] text-[#aaa] block mb-1">Outages / Restarts</span>
              <span className={`text-xl font-bold ${restarts === 0 ? 'text-[#55ff55]' : 'text-[#ff5555]'}`}>
                {restarts}
              </span>
              <span className="text-[8px] text-[#888] block mt-1">
                {restarts === 0 ? '0 penalty' : `-${restartPenalty} pts`}
              </span>
            </div>

            <div className="bg-[#1b1b1b] border border-[#444] p-3 shadow-xs">
              <span className="text-[9px] text-[#aaa] block mb-1">Technical Debt</span>
              <span className={`text-xl font-bold ${debt === 0 ? 'text-[#55ff55]' : 'text-[#ffaa00]'}`}>
                {debt} / 5
              </span>
              <span className="text-[8px] text-[#888] block mt-1">
                {debt === 0 ? '0 penalty' : `-${debtPenalty} pts`}
              </span>
            </div>
          </div>
        </div>

        {/* Full 11-Stage Audit Trail */}
        <div className="mc-panel-dark p-4 shadow-2xl mb-6">
          <h3 className="font-bold text-white text-xs sm:text-sm mb-3 flex items-center gap-2 mc-font">
            <Activity className="w-4 h-4 text-[#ffd700]" />
            <span>AIDLC AUDIT LOG & MINED BLOCKS</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] mc-font">
              <thead>
                <tr className="border-b-2 border-[#333] text-[#aaa]">
                  <th className="py-2 px-2.5">Wave</th>
                  <th className="py-2 px-2.5">Decision</th>
                  <th className="py-2 px-2.5">Heart Impact</th>
                  <th className="py-2 px-2.5">Tower Loss</th>
                  <th className="py-2 px-2.5">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {history.map((rec, idx) => {
                  const isRestart = rec.action_type === 'stage_restart';
                  return (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        isRestart
                          ? 'bg-[#152e22]/60 hover:bg-[#1a3829]/70 border-l-2 border-[#55ff55]'
                          : 'hover:bg-[#252525]'
                      }`}
                    >
                      <td className="py-2.5 px-2.5">
                        <span className="font-bold text-white">Wave {rec.stage_id}</span>
                        <span className="block text-[9px] text-[#aaa] font-sans">{rec.stage_title}</span>
                      </td>
                      <td className={`py-2.5 px-2.5 ${isRestart ? 'text-[#55ffff]' : 'text-[#ffd700]'}`}>
                        <span className="flex items-center gap-1.5">
                          {isRestart && <span>🔧</span>}
                          <span>{rec.action_label}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5">
                        <span
                          className={`font-bold ${
                            rec.health_delta >= 0 ? 'text-[#55ff55]' : 'text-[#ff5555]'
                          }`}
                        >
                          {rec.health_delta >= 0 ? `+${rec.health_delta}%` : `${rec.health_delta}%`}
                        </span>
                      </td>
                      <td className={`py-2.5 px-2.5 ${isRestart ? 'text-[#888]' : 'text-[#ffd700]'}`}>
                        {rec.jenga_pulls > 0 ? `-${rec.jenga_pulls} blocks` : '0 loss'}
                      </td>
                      <td className="py-2.5 px-2.5 font-bold text-white">
                        {rec.health_after}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleCopySummary}
            className="mc-btn w-full sm:w-auto px-5 py-2.5 text-xs mc-font text-white flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Copy Score</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="mc-btn mc-btn-green w-full sm:w-auto px-6 py-2.5 text-xs mc-font text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>

          {onExitToLobby && (
            <button
              onClick={onExitToLobby}
              className="mc-btn w-full sm:w-auto px-5 py-2.5 text-xs mc-font text-white flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4 text-[#ffd700]" />
              <span>Main Menu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
