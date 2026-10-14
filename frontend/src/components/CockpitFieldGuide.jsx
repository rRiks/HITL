import React, { useState, useEffect } from 'react';
import {
  Rotate3d,
  Users,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  X,
  BookOpen,
} from 'lucide-react';

export const GUIDE_SECTIONS = {
  top_hud: {
    id: 'top_hud',
    badge: 'COCKPIT TOP HUD',
    title: 'Hearts, Stage Counter & 2-Minute Timer',
    icon: '❤️',
    color: '#ff5555',
    desc: 'Each AIDLC stage grants your squad a strict 2-minute countdown clock. System stability begins at 100% (10 pixel hearts). If health drops to 0% or the tower topples, a catastrophic outage occurs!',
    tip: 'Pro-Tip: Maintain high stability to prevent structural sway. If the countdown reaches 0:00, an automatic blind deployment executes!',
  },
  ticker: {
    id: 'ticker',
    badge: 'REALM TICKER',
    title: 'Live Cross-Table Rivalry Leaderboard',
    icon: '🏆',
    color: '#ffd700',
    desc: 'Broadcasts real-time stage numbers, health, and mined blocks of competing developer squads across the venue.',
    tip: 'Pro-Tip: Watch competing tables in real-time to balance your speed against risk and quality!',
  },
  quest: {
    id: 'quest',
    badge: 'QUEST BRIEFING & CODE DIFF',
    title: 'AI Commit Proposal & Code Diff Review',
    icon: '📜',
    color: '#55ffff',
    desc: 'The AI coding agent generates rapid pull requests. Inspect the code diff (+ additions, - deletions) to detect governor limit loops, security bypasses, or bad abstractions.',
    tip: 'Pro-Tip: Click [ENLARGE] in the top-right corner anytime to pop out a full side-by-side single-screen inspection console!',
  },
  telemetry: {
    id: 'telemetry',
    badge: 'ARCHITECTURE TELEMETRY',
    title: 'Hidden Risk Scanner & Suspect Patterns',
    icon: '⚠️',
    color: '#ffaa00',
    desc: 'Automated telemetry scans unearth hidden architectural vulnerabilities in the AI code. Expanding it reveals the exact anti-pattern to avoid.',
    tip: 'Pro-Tip: Consult telemetry before voting if you are uncertain whether the proposal is safe to merge.',
  },
  consensus: {
    id: 'consensus',
    badge: 'REALM CONSENSUS',
    title: 'Democratic Multiplayer Voting',
    icon: '👥',
    color: '#55ff55',
    desc: 'Democratic consensus engine. Teammates in the room vote on actions in real-time. As soon as all active teammates cast their votes, or when you click [RESOLVE NOW], the decision executes immediately!',
    tip: 'Pro-Tip: Reach team consensus quickly and click [RESOLVE NOW] to lock in early without waiting for the 2-minute timer!',
  },
  slot_1: {
    id: 'slot_1',
    badge: 'SLOT 1: ACCEPT AS-IS',
    title: 'Raw Speed Blind Deploy 🍏',
    icon: '⚡',
    color: '#ffff55',
    desc: 'Blindly merge the AI code without review. High risk roll! If it succeeds, grants +8% HP and zero block pulls. If it fails, pulls 2 blocks and draws heavy damage.',
    tip: 'Warning: If Technical Debt reaches 5, the Accept as-is success threshold degrades permanently to 15%!',
  },
  slot_2: {
    id: 'slot_2',
    badge: 'SLOT 2: BYPASS & SKIP',
    title: 'Defensive Architectural Skip 🛡️',
    icon: '🛡️',
    color: '#38bdf8',
    desc: 'Reject the commit to safeguard existing architecture. 100% safe from immediate crash, but incurs +1 Technical Debt and pulls 1 block.',
    tip: 'Pro-Tip: Useful when facing extreme catastrophic risk, but avoid accumulating too much debt!',
  },
  slot_3: {
    id: 'slot_3',
    badge: 'SLOT 3: HUMAN GUIDANCE',
    title: 'Book & Quill Collaborative Prompt 🪶',
    icon: '🪶',
    color: '#a855f7',
    desc: 'Write architectural instructions in Book & Quill to steer the AI agent. Drafts appear live for your team. Including stage-specific architectural keywords guarantees +8% HP and zero block pulls!',
    tip: 'Pro-Tip: Vague or empty prompts incur -12% HP damage and +1 Debt. Always write concrete technical terms (e.g., bulkify, map, platform events)!',
  },
  slot_4: {
    id: 'slot_4',
    badge: 'SLOT 4: AI SUGGESTIONS',
    title: '3-Way Technical Solution Review 🤖',
    icon: '🤖',
    color: '#ec4899',
    desc: 'Review 3 AI-proposed architectural fixes. Choose wisely: Optimal (+8% HP, 0 pulls), Patchwork (+4% HP, 1 pull), or Flawed Anti-Pattern (-10% HP, 2 pulls, +1 Debt).',
    tip: 'Pro-Tip: The options are shuffled per stage. Read the technical descriptions carefully to pick the Optimal architectural solution!',
  },
  debt: {
    id: 'debt',
    badge: 'TECHNICAL DEBT (0-5 DEBTS)',
    title: 'Shortcuts, Critical Fragility & System Decay ⚠️',
    icon: '⚠️',
    color: '#ffaa00',
    desc: 'What is Technical Debt? Taking architectural shortcuts (Bypass & Skip, choosing Flawed AI suggestions, or writing vague prompts) accumulates Technical Debt (0 to 5).\n\n• Debts 0-3: Normal base penalties.\n• Debt 4 (Critical Fragility): Any subsequent failure triggers 3 block pulls and at least 25% health drained!\n• Debt 5 (Degraded Velocity): "Accept as-is" success rate drops permanently to 15%!',
    tip: 'Pro-Tip: Keep Debt below 4! At 4+ Debts, a single bad choice will catastrophically topple your 3D tower.',
  },
  tower: {
    id: 'tower',
    badge: '3D ARCHITECTURE TOWER',
    title: '54 Microservices & Structural Integrity',
    icon: '🏛️',
    color: '#ff5555',
    desc: '54 physical blocks (Redstone, Diamond, Emerald). Shortcuts and failures physically mine blocks from the tower, increasing physical tilt and sway.',
    tip: 'Critical: Each block extracted weakens the physics engine. Keep tower integrity high for a top final score!',
  },
};

export default function CockpitFieldGuide({
  onClose,
  onLaunchGame,
  isWalkthrough = false,
  teamName = 'Cloud Titans',
  onGoHome,
}) {
  const [activeGuideKey, setActiveGuideKey] = useState('quest');

  // Hotkey support: Space / Enter to launch (if walkthrough), Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      } else if (isWalkthrough && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        onLaunchGame?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWalkthrough, onClose, onLaunchGame]);

  const activeGuide = GUIDE_SECTIONS[activeGuideKey] || GUIDE_SECTIONS.quest;

  return (
    <div className="cockpit-field-guide-root fixed inset-0 z-50 bg-[#14161a]/95 backdrop-blur-xs text-white flex flex-col justify-between select-none p-2 sm:p-3 overflow-y-auto animate-fadeIn">
      {/* Top Walkthrough Navigation Control Bar */}
      <div className="mc-panel-dark px-3 py-2 mb-2 flex items-center justify-between gap-2 border-2 border-[#ffd700] shadow-xl shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onClose}
            className="mc-btn px-3 py-1.5 text-[9px] mc-font text-white hover:text-[#ffaa00] flex items-center gap-1.5 cursor-pointer"
          >
            {isWalkthrough ? <span>← SQUAD SETUP</span> : <span>✕ CLOSE GUIDE [ESC]</span>}
          </button>
          {onGoHome && !isWalkthrough && (
            <button
              type="button"
              onClick={onGoHome}
              title="Return to Home Screen"
              className="mc-btn px-2.5 py-1.5 text-[9px] mc-font text-[#ffd700] hover:text-white flex items-center gap-1 cursor-pointer bg-[#3a2211] border-[#ffaa00]"
            >
              <span>HOME</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-center">
          <BookOpen className="w-4 h-4 text-[#ffd700]" />
          <div>
            <span className="text-[10px] mc-font text-[#ffd700] uppercase font-bold block">
              COCKPIT FIELD GUIDE • HOVER / TAP ANY COMPONENT TO INSPECT
            </span>
            <span className="text-[9px] text-[#aaa] font-sans">
              {isWalkthrough ? 'Review mechanics before your sprint begins.' : 'Live In-Game Architecture Reference Manual'}
            </span>
          </div>
        </div>

        {isWalkthrough ? (
          <button
            type="button"
            onClick={onLaunchGame}
            className="mc-btn mc-btn-green px-4 py-2 text-[10px] mc-font text-white flex items-center gap-2 cursor-pointer shadow-lg animate-pulse"
          >
            <span>ENTER REALM [SPACE]</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="mc-btn mc-btn-green px-4 py-1.5 text-[10px] mc-font text-white flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>RESUME GAME</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Replica Cockpit Arena Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0 items-stretch mb-2">
        {/* Left Wing (6 cols): Stage Scenario & 4 Action Consoles Replica */}
        <div className="lg:col-span-6 flex flex-col gap-2 min-h-0">
          {/* Top Bar Replica */}
          <div
            onMouseEnter={() => setActiveGuideKey('top_hud')}
            onClick={() => setActiveGuideKey('top_hud')}
            className={`mc-panel-dark px-2.5 py-1.5 flex items-center justify-between gap-2 border cursor-pointer transition-all ${
              activeGuideKey === 'top_hud' ? 'ring-2 ring-[#ffd700] border-[#ffd700] bg-[#221c10]' : 'border-[#444] hover:border-[#888]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[9px] mc-font text-[#ffd700] font-bold">REALM: {teamName}</span>
              <span className="text-[9px] mc-font text-[#55ff55]">LV 1/11</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] mc-font text-[#ff5555]">❤️❤️❤️❤️❤️ 100%</span>
              <span className="text-[9px] mc-font text-[#55ffff] bg-[#111] px-1.5 py-0.5 border border-[#333]">02:00</span>
              <span className="text-[7.5px] mc-font text-[#ffd700] bg-[#332200] px-1 border border-[#664400]">ⓘ TOP HUD</span>
            </div>
          </div>

          {/* Realm Ticker Replica */}
          <div
            onMouseEnter={() => setActiveGuideKey('ticker')}
            onClick={() => setActiveGuideKey('ticker')}
            className={`bg-[#181614] border px-2.5 py-1 flex items-center justify-between gap-2 text-[9px] mc-font cursor-pointer transition-all ${
              activeGuideKey === 'ticker' ? 'ring-2 ring-[#ffd700] border-[#ffd700] bg-[#221c10]' : 'border-[#444] hover:border-[#888]'
            }`}
          >
            <div className="flex items-center gap-2 text-[#ffd700]">
              <span>🏆 REALM TICKER</span>
              <span className="text-[#55ff55]">Table 4: QuantumSREs 94% W7/11</span>
              <span className="text-[#aaa] hidden sm:inline">• Table 2: ByteBusters 82%</span>
            </div>
            <span className="text-[7.5px] mc-font text-[#ffd700] bg-[#332200] px-1 border border-[#664400]">ⓘ TICKER</span>
          </div>

          {/* Quest Briefing & Code Diff Replica */}
          <div
            onMouseEnter={() => setActiveGuideKey('quest')}
            onClick={() => setActiveGuideKey('quest')}
            className={`mc-panel-dark p-2.5 flex flex-col flex-1 min-h-0 border cursor-pointer transition-all ${
              activeGuideKey === 'quest' ? 'ring-2 ring-[#ffd700] border-[#ffd700] bg-[#221c10]' : 'border-[#444] hover:border-[#888]'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 text-[8.5px] mc-font bg-[#3a0000] text-[#ff5555] border border-[#aa0000]">
                  QUEST WAVE 1
                </span>
                <span className="text-[8.5px] mc-font text-[#aaa]">Apex Trigger & Bulkification</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[8px] mc-font text-[#55ffff] border border-[#333] px-1.5 py-0.5">⤢ ENLARGE</span>
                <span className="text-[7.5px] mc-font text-[#ffd700] bg-[#332200] px-1 border border-[#664400]">ⓘ QUEST & DIFF</span>
              </div>
            </div>

            <h3 className="text-xs font-bold text-[#ffff55] mc-font mb-1">The Governor Limit Trap</h3>
            <p className="text-[10px] text-[#ccc] font-sans leading-tight mb-2 line-clamp-2">
              The AI coding agent generated an Account-to-Contact synchronization trigger, placing SOQL inside a for-loop!
            </p>

            {/* Code Diff Box Replica */}
            <div className="border border-[#444] bg-[#0c0d10] p-2 font-mono text-[10px] flex-1 min-h-[75px] flex flex-col justify-center">
              <span className="text-[#ff5555]">- Map&lt;Id, Account&gt; accMap = new Map&lt;Id, Account&gt;(accounts);</span>
              <span className="text-[#55ff55]">+ for (Account a : accounts) &#123; [SELECT Id FROM Contact] &#125;</span>
            </div>

            {/* Telemetry Accordion Replica */}
            <div
              onMouseEnter={(e) => { e.stopPropagation(); setActiveGuideKey('telemetry'); }}
              onClick={(e) => { e.stopPropagation(); setActiveGuideKey('telemetry'); }}
              className={`mt-1.5 p-1.5 border flex items-center justify-between text-[9px] mc-font cursor-pointer ${
                activeGuideKey === 'telemetry' ? 'ring-2 ring-[#ffaa00] border-[#ffaa00] bg-[#331c05]' : 'border-[#aa5500] bg-[#221200]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[#ffaa00]">
                <AlertTriangle className="w-3 h-3" />
                <span>DETECTED ARCHITECTURE TELEMETRY (SOQL IN LOOP)</span>
              </div>
              <span className="text-[7.5px] mc-font text-[#ffd700] bg-[#332200] px-1 border border-[#664400]">ⓘ TELEMETRY</span>
            </div>
          </div>

          {/* Consensus Bar Replica */}
          <div
            onMouseEnter={() => setActiveGuideKey('consensus')}
            onClick={() => setActiveGuideKey('consensus')}
            className={`bg-[#181818] border p-2 flex items-center justify-between text-[9px] mc-font cursor-pointer ${
              activeGuideKey === 'consensus' ? 'ring-2 ring-[#55ff55] border-[#55ff55] bg-[#112611]' : 'border-[#444]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#ffd700]" />
              <span className="text-white">REALM CONSENSUS: 0 / 4 VOTES</span>
              <span className="text-[#888] text-[8px]">(LOCKS AT 100% OR 2MIN)</span>
            </div>
            <span className="text-[7.5px] mc-font text-[#55ff55] bg-[#112611] px-1.5 py-0.5 border border-[#2d5a2d]">
              ⓘ CONSENSUS
            </span>
          </div>

          {/* 4 Action Consoles Replica */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {/* Slot 1 */}
            <div
              onMouseEnter={() => setActiveGuideKey('slot_1')}
              onClick={() => setActiveGuideKey('slot_1')}
              className={`mc-slot-dark p-2 border cursor-pointer transition-all ${
                activeGuideKey === 'slot_1' ? 'ring-2 ring-[#ffd700] border-[#ffd700] bg-[#221c10]' : 'border-[#444] hover:border-[#888]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[7.5px] mc-font text-[#ffd700]">SLOT 1</span>
                <span>🍏</span>
              </div>
              <h4 className="text-[10px] font-bold text-white mc-font">Accept as-is</h4>
              <p className="text-[9px] text-[#aaa] font-sans mt-0.5">Raw speed roll</p>
              <span className="text-[7px] text-[#ffd700] block mt-1">ⓘ HOVER</span>
            </div>

            {/* Slot 2 */}
            <div
              onMouseEnter={() => setActiveGuideKey('slot_2')}
              onClick={() => setActiveGuideKey('slot_2')}
              className={`mc-slot-dark p-2 border cursor-pointer transition-all ${
                activeGuideKey === 'slot_2' ? 'ring-2 ring-[#38bdf8] border-[#38bdf8] bg-[#0c1c28]' : 'border-[#444] hover:border-[#888]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[7.5px] mc-font text-[#aaa]">SLOT 2</span>
                <span>🛡️</span>
              </div>
              <h4 className="text-[10px] font-bold text-white mc-font">Bypass & Skip</h4>
              <p className="text-[9px] text-[#aaa] font-sans mt-0.5">Safe +1 Debt</p>
              <span className="text-[7px] text-[#38bdf8] block mt-1">ⓘ HOVER</span>
            </div>

            {/* Slot 3 */}
            <div
              onMouseEnter={() => setActiveGuideKey('slot_3')}
              onClick={() => setActiveGuideKey('slot_3')}
              className={`mc-slot-dark p-2 border cursor-pointer transition-all ${
                activeGuideKey === 'slot_3' ? 'ring-2 ring-[#a855f7] border-[#a855f7] bg-[#220d30]' : 'border-[#444] hover:border-[#888]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[7.5px] mc-font text-[#a855f7]">SLOT 3</span>
                <span>🪶</span>
              </div>
              <h4 className="text-[10px] font-bold text-white mc-font">Human Guide</h4>
              <p className="text-[9px] text-[#aaa] font-sans mt-0.5">Write prompts</p>
              <span className="text-[7px] text-[#a855f7] block mt-1">ⓘ HOVER</span>
            </div>

            {/* Slot 4 */}
            <div
              onMouseEnter={() => setActiveGuideKey('slot_4')}
              onClick={() => setActiveGuideKey('slot_4')}
              className={`mc-slot-dark p-2 border cursor-pointer transition-all ${
                activeGuideKey === 'slot_4' ? 'ring-2 ring-[#ec4899] border-[#ec4899] bg-[#2d0f20]' : 'border-[#444] hover:border-[#888]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[7.5px] mc-font text-[#ffd700]">SLOT 4</span>
                <span>🤖</span>
              </div>
              <h4 className="text-[10px] font-bold text-white mc-font">AI Suggestion</h4>
              <p className="text-[9px] text-[#aaa] font-sans mt-0.5">Review 3 fixes</p>
              <span className="text-[7px] text-[#ec4899] block mt-1">ⓘ HOVER</span>
            </div>
          </div>
        </div>

        {/* Right Wing (6 cols): 3D Architecture Tower Mockup Replica */}
        <div
          onMouseEnter={() => setActiveGuideKey('tower')}
          onClick={() => setActiveGuideKey('tower')}
          className={`lg:col-span-6 mc-panel-dark p-3 flex flex-col justify-between border cursor-pointer transition-all ${
            activeGuideKey === 'tower' ? 'ring-2 ring-[#ff5555] border-[#ff5555] bg-[#221010]' : 'border-[#444] hover:border-[#888]'
          }`}
        >
          {/* Tower Header */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Rotate3d className="w-4 h-4 text-[#ffd700]" />
                <span className="text-[10px] mc-font text-[#ffd700] uppercase font-bold">
                  3D VOXEL REDSTONE TOWER
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  onMouseEnter={(e) => { e.stopPropagation(); setActiveGuideKey('debt'); }}
                  onClick={(e) => { e.stopPropagation(); setActiveGuideKey('debt'); }}
                  className={`text-[8.5px] mc-font px-2 py-0.5 border cursor-pointer transition-all flex items-center gap-1 ${
                    activeGuideKey === 'debt'
                      ? 'ring-2 ring-[#ffaa00] border-[#ffd700] bg-[#331c00] text-[#ffd700]'
                      : 'bg-[#251505] text-[#ffaa00] border-[#885500] hover:border-[#ffd700]'
                  }`}
                >
                  <span>⚠️ DEBT: 0/5</span>
                  <span className="text-[7px] text-[#ffd700] bg-[#111] px-1 border border-[#553300]">ⓘ DEBT</span>
                </div>
                <span className="text-[8px] mc-font px-1.5 py-0.5 bg-[#002b00] text-[#55ff55] border border-[#00aa00]">
                  STABILITY: 100% SOLID
                </span>
                <span className="text-[7.5px] mc-font text-[#ffd700] bg-[#332200] px-1 border border-[#664400]">
                  ⓘ TOWER
                </span>
              </div>
            </div>

            {/* Boss Stability Bar */}
            <div className="w-full bg-[#111] p-[2px] border border-[#555] mb-2">
              <div className="w-full bg-[#00aa00] h-2" />
            </div>

            {/* Domain badges */}
            <div className="flex flex-wrap gap-1 text-[8px] mc-font">
              <span className="guide-domain-pill px-1.5 py-0.5 bg-[#ff3b30]/30 text-[#ff7777] border border-[#ff3b30]/50">Governors</span>
              <span className="guide-domain-pill px-1.5 py-0.5 bg-[#38bdf8]/30 text-[#88ddff] border border-[#38bdf8]/50">Async Apex</span>
              <span className="guide-domain-pill px-1.5 py-0.5 bg-[#a855f7]/30 text-[#d8a8ff] border border-[#a855f7]/50">Security/FLS</span>
              <span className="guide-domain-pill px-1.5 py-0.5 bg-[#22c55e]/30 text-[#77ff99] border border-[#22c55e]/50">LWC Engine</span>
            </div>
          </div>

          {/* Stylized 3D Jenga Tower Voxel Graphics Mockup */}
          <div className="guide-tower-mockup flex-1 my-3 flex items-center justify-center min-h-[160px] bg-[#111115] border border-[#333] relative overflow-hidden">
            <div className="flex flex-col items-center gap-1">
              <div className="w-24 h-4 bg-[#8b6508] border border-[#ffd700] shadow-md flex items-center justify-center text-[7.5px] mc-font text-white">54 BLOCKS</div>
              <div className="w-24 h-4 bg-[#6b4e06] border border-[#e5c100] shadow-md" />
              <div className="w-24 h-4 bg-[#8b6508] border border-[#ffd700] shadow-md flex items-center justify-center text-[7px] mc-font text-[#ffd700]">STABLE</div>
              <div className="w-24 h-4 bg-[#6b4e06] border border-[#e5c100] shadow-md" />
              <div className="w-24 h-4 bg-[#8b6508] border border-[#ffd700] shadow-md flex items-center justify-center text-[7px] mc-font text-[#55ff55]">FULL UPTIME</div>
              <div className="w-24 h-4 bg-[#553b05] border border-[#b29600] shadow-md" />
            </div>
            <div className="absolute bottom-2 text-center text-[8.5px] mc-font text-[#ffd700] bg-[#1b1500]/90 px-2 py-0.5 border border-[#886600]">
              Every risk mines blocks & destabilizes physics
            </div>
          </div>

          <div
            onMouseEnter={(e) => { e.stopPropagation(); setActiveGuideKey('debt'); }}
            onClick={(e) => { e.stopPropagation(); setActiveGuideKey('debt'); }}
            className={`guide-debt-box p-2 border text-[8.5px] mc-font text-center cursor-pointer transition-all ${
              activeGuideKey === 'debt'
                ? 'ring-2 ring-[#ffaa00] border-[#ffd700] bg-[#331c00] text-[#ffd700]'
                : 'bg-[#221000] border-[#885500] text-[#ffaa00] hover:border-[#ffd700]'
            }`}
          >
            <span>⚠️ TECHNICAL DEBT RULE: Reaching 4+ Debts triggers </span>
            <strong className="text-[#ff5555]">Critical Fragility (3 pulls + 25% damage)</strong>
            <span className="ml-1 text-[7.5px] text-[#ffd700] underline">[Hover for details]</span>
          </div>
        </div>
      </div>

      {/* Docked Interactive Inspector Panel */}
      <div className="mc-panel-dark p-3.5 border-2 border-[#ffd700] shadow-2xl shrink-0 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl p-2 bg-[#1b1b1b] border-2 border-[#555] shrink-0">
              {activeGuide.icon}
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[9px] mc-font px-2 py-0.5 uppercase font-bold border" style={{ color: activeGuide.color, borderColor: activeGuide.color }}>
                  {activeGuide.badge}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-white mc-font">
                  {activeGuide.title}
                </h3>
              </div>
              <p className="text-[11px] text-[#ddd] font-sans leading-relaxed mb-1.5 select-text whitespace-pre-line">
                {activeGuide.desc}
              </p>
              <div className="guide-tip-box text-[10px] text-[#ffd700] font-sans bg-[#251d08] border border-[#664400] px-2.5 py-1">
                <strong>💡 {activeGuide.tip}</strong>
              </div>
            </div>
          </div>

          {/* Quick Component Switcher Pills */}
          <div className="flex flex-wrap gap-1 sm:max-w-xs justify-end shrink-0 pt-1">
            {Object.keys(GUIDE_SECTIONS).map((key) => {
              const item = GUIDE_SECTIONS[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveGuideKey(key)}
                  className={`guide-switcher-pill text-[8px] mc-font px-2 py-1 border transition-colors cursor-pointer ${
                    activeGuideKey === key
                      ? 'bg-[#ffd700] text-black font-bold border-[#ffd700]'
                      : 'bg-[#222] text-[#ccc] border-[#444] hover:border-[#888]'
                  }`}
                >
                  {item.badge.replace('SLOT ', 'S')}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
