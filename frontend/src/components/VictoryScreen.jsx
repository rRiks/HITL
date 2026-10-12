import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, CheckCircle2, RotateCcw, Share2, Shield, Heart, Activity, Rotate3d } from 'lucide-react';

export default function VictoryScreen({
  teamName = 'Alpha Devs',
  health = 85,
  totalPulls = 4,
  history = [],
  onPlayAgain,
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

  // Determine Architecture Rating
  let rating = 'Senior HITL Architect';
  let ratingColor = 'text-amber-800 border-amber-300 bg-amber-50';
  let badgeTitle = 'Grade: A+ (Production Ready)';
  if (health >= 85 && totalPulls <= 3) {
    rating = 'Distinguished HITL Fellow';
    ratingColor = 'text-emerald-800 border-emerald-300 bg-emerald-50';
    badgeTitle = 'Grade: S-Tier (Zero-Downtime Mastery)';
  } else if (health < 50 || totalPulls >= 8) {
    rating = 'Scrappy Sprint Survivor';
    ratingColor = 'text-amber-900 border-amber-400 bg-amber-100';
    badgeTitle = 'Grade: B- (High Tech Debt Managed)';
  }

  const handleCopySummary = () => {
    const summaryText = `🏆 HITL Jenga Results for Team ${teamName}
- Final App Health: ${health}%
- Virtual 3D Components Extracted: ${totalPulls} / 54
- Architectural Rating: ${rating} (${badgeTitle})
Completed all 11 Salesforce SDLC Stages with 3D Virtual Tower Standing!`;
    navigator.clipboard.writeText(summaryText);
    alert('Summary copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-stone-900 py-10 px-4 sm:px-6 lg:px-8 bg-mesh-radial select-none">
      <div className="max-w-4xl mx-auto">
        {/* Header Banner */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 bg-gradient-to-tr from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/30 font-black">
            <Trophy className="w-9 h-9" />
          </div>

          <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold block mb-1">
            RELEASE CERTIFIED & AUDIT SIGNED
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mb-3 font-display">
            SDLC Release Triumph!
          </h1>
          <p className="text-stone-600 text-sm max-w-xl mx-auto font-sans leading-relaxed">
            Team <strong className="text-stone-900">{teamName}</strong> successfully completed all 11 high-pressure AI development stages while keeping the <strong>3D Virtual Architecture Tower</strong> standing upright!
          </p>
        </div>

        {/* Rating Scorecard Banner */}
        <div className="bg-[#faf7f0] border border-[#ded5c5] rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#ded5c5]">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-stone-500 block mb-1">
                Final Architectural Evaluation
              </span>
              <h2 className="text-2xl font-black text-stone-900 font-display">{rating}</h2>
            </div>
            <div className={`px-4 py-2 rounded-xl border font-mono font-bold text-sm ${ratingColor}`}>
              {badgeTitle}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 font-mono text-center">
            <div className="bg-white border border-[#ded5c5] p-4 rounded-2xl shadow-xs">
              <span className="text-xs text-stone-500 block mb-1">Final Application Health</span>
              <span className="text-3xl font-black text-emerald-700">{health}%</span>
              <span className="text-[11px] text-stone-500 block mt-1">High Availability Maintained</span>
            </div>

            <div className="bg-white border border-[#ded5c5] p-4 rounded-2xl shadow-xs">
              <span className="text-xs text-stone-500 block mb-1">3D Tower Integrity</span>
              <span className="text-3xl font-black text-amber-800">{54 - totalPulls} / 54</span>
              <span className="text-[11px] text-stone-500 block mt-1">Components Resilient</span>
            </div>

            <div className="bg-white border border-[#ded5c5] p-4 rounded-2xl shadow-xs">
              <span className="text-xs text-stone-500 block mb-1">Stages Cleared</span>
              <span className="text-3xl font-black text-stone-900">11 / 11</span>
              <span className="text-[11px] text-stone-500 block mt-1">Full SDLC Lifecycle</span>
            </div>
          </div>
        </div>

        {/* Full 11-Stage Audit Trail */}
        <div className="bg-[#faf7f0] border border-[#ded5c5] rounded-3xl p-6 shadow-xl mb-8">
          <h3 className="font-bold text-stone-900 text-base mb-4 flex items-center gap-2 font-display">
            <Activity className="w-4 h-4 text-amber-700" />
            <span>Complete SDLC Audit Log & Decisions</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#ded5c5] text-stone-500">
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Decision</th>
                  <th className="py-2.5 px-3">Health Impact</th>
                  <th className="py-2.5 px-3">3D Tower Loss</th>
                  <th className="py-2.5 px-3">Final Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ded5c5]">
                {history.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-stone-900">Stage {rec.stage_id}</span>
                      <span className="block text-[11px] text-stone-600 font-sans">{rec.stage_title}</span>
                    </td>
                    <td className="py-3 px-3 text-stone-700">
                      <span className="font-semibold text-stone-800">{rec.action_label}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-bold ${
                          rec.health_delta >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {rec.health_delta >= 0 ? `+${rec.health_delta}%` : `${rec.health_delta}%`}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-800">
                      {rec.jenga_pulls > 0 ? `-${rec.jenga_pulls} blocks` : '0 loss'}
                    </td>
                    <td className="py-3 px-3 font-bold text-stone-900">
                      {rec.health_after}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleCopySummary}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold bg-white hover:bg-stone-50 border border-[#ded5c5] text-stone-800 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Copy Debrief Summary</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-600/25"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again with New Team</span>
          </button>
        </div>
      </div>
    </div>
  );
}
