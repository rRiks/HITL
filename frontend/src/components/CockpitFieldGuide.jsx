import React, { useState, useEffect } from 'react';
import {
  Rotate3d,
  Users,
  AlertTriangle,
  ArrowRight,
  X,
  BookOpen,
  Sun,
  Moon,
  Trophy,
  Maximize2,
} from 'lucide-react';
import themeEngine from '../themes/themeEngine';

export const GUIDE_SECTIONS = {
  top_hud: {
    id: 'top_hud',
    badge: 'COCKPIT TOP HUD',
    title: 'Hearts, Stage Counter & 2-Minute Timer',
    icon: '❤️',
    color: '#ef4444',
    desc: 'Each AIDLC stage grants your squad a strict 2-minute countdown clock. System stability begins at 100% (10 pixel hearts). If health drops to 0% or the tower topples, a catastrophic outage occurs!',
    tip: 'Pro-Tip: Maintain high stability to prevent structural sway. If the countdown reaches 0:00, an automatic blind deployment executes!',
  },
  ticker: {
    id: 'ticker',
    badge: 'REALM TICKER',
    title: 'Live Cross-Table Rivalry Leaderboard',
    icon: '🏆',
    color: '#eab308',
    desc: 'Broadcasts real-time stage numbers, health, and mined blocks of competing developer squads across the venue.',
    tip: 'Pro-Tip: Watch competing tables in real-time to balance your speed against risk and quality!',
  },
  quest: {
    id: 'quest',
    badge: 'QUEST BRIEFING & CODE DIFF',
    title: 'AI Commit Proposal & Code Diff Review',
    icon: '📜',
    color: '#06b6d4',
    desc: 'The AI coding agent generates rapid pull requests. Inspect the code diff (+ additions, - deletions) to detect governor limit loops, security bypasses, or bad abstractions.',
    tip: 'Pro-Tip: Click [ENLARGE] in the top-right corner anytime to pop out a full side-by-side single-screen inspection console!',
  },
  telemetry: {
    id: 'telemetry',
    badge: 'ARCHITECTURE TELEMETRY',
    title: 'Hidden Risk Scanner & Suspect Patterns',
    icon: '⚠️',
    color: '#f97316',
    desc: 'Automated telemetry scans unearth hidden architectural vulnerabilities in the AI code. Expanding it reveals the exact anti-pattern to avoid.',
    tip: 'Pro-Tip: Consult telemetry before voting if you are uncertain whether the proposal is safe to merge.',
  },
  consensus: {
    id: 'consensus',
    badge: 'REALM CONSENSUS',
    title: 'Democratic Multiplayer Voting',
    icon: '👥',
    color: '#10b981',
    desc: 'Democratic consensus engine. Teammates in the room vote on actions in real-time. As soon as all active teammates cast their votes, or when you click [RESOLVE NOW], the decision executes immediately!',
    tip: 'Pro-Tip: Reach team consensus quickly to lock in decisions early without waiting for the 2-minute timer!',
  },
  slot_1: {
    id: 'slot_1',
    badge: 'SLOT 1: ACCEPT AS-IS [1]',
    title: 'Raw Speed Blind Deploy 🍏',
    icon: '⚡',
    color: '#22c55e',
    desc: 'Blindly merge the AI code without review. High risk roll! If it succeeds, grants +8% HP and zero block pulls. If it fails, pulls 2 blocks and draws heavy damage.',
    tip: 'Warning: If Technical Debt reaches 5, the Accept as-is success threshold degrades permanently to 15%!',
  },
  slot_2: {
    id: 'slot_2',
    badge: 'SLOT 2: BYPASS & SKIP [2]',
    title: 'Defensive Architectural Skip 🛡️',
    icon: '🛡️',
    color: '#0ea5e9',
    desc: 'Reject the commit to safeguard existing architecture. 100% safe from immediate crash, but incurs +1 Technical Debt and pulls 1 block.',
    tip: 'Pro-Tip: Useful when facing extreme catastrophic risk, but avoid accumulating too much debt!',
  },
  slot_3: {
    id: 'slot_3',
    badge: 'SLOT 3: HUMAN GUIDANCE [3]',
    title: 'Book & Quill Collaborative Prompt 🪶',
    icon: '🪶',
    color: '#8b5cf6',
    desc: 'Write architectural instructions in Book & Quill to steer the AI agent. Drafts appear live for your team. Including stage-specific architectural keywords guarantees +8% HP and zero block pulls!',
    tip: 'Pro-Tip: Vague or empty prompts incur -12% HP damage and +1 Debt. Always write concrete technical terms (e.g., bulkify, map, platform events)!',
  },
  slot_4: {
    id: 'slot_4',
    badge: 'SLOT 4: AI SUGGESTIONS [4]',
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
    color: '#f59e0b',
    desc: 'What is Technical Debt? Taking architectural shortcuts (Bypass & Skip, choosing Flawed AI suggestions, or writing vague prompts) accumulates Technical Debt (0 to 5).\n\n• Debts 0-3: Normal base penalties.\n• Debt 4 (Critical Fragility): Any subsequent failure triggers 3 block pulls and at least 25% health drained!\n• Debt 5 (Degraded Velocity): "Accept as-is" success rate drops permanently to 15%!',
    tip: 'Pro-Tip: Keep Debt below 4! At 4+ Debts, a single bad choice will catastrophically topple your 3D tower.',
  },
  tower: {
    id: 'tower',
    badge: '3D ARCHITECTURE TOWER',
    title: '54 Microservices & Structural Stability',
    icon: '🏛️',
    color: '#ef4444',
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
  isAdminView = false,
  theme: propTheme,
  onToggleTheme: propToggleTheme,
}) {
  const [activeGuideKey, setActiveGuideKey] = useState('quest');

  // Reactive theme engine integration (syncs with global theme state & parents)
  const [internalMode, setInternalMode] = useState(() => {
    try {
      const cur = themeEngine.init();
      return cur?.mode || 'dark';
    } catch {
      return 'dark';
    }
  });

  const currentMode = propTheme || internalMode;

  useEffect(() => {
    const unsubscribe = themeEngine.subscribe((state) => {
      setInternalMode(state.mode);
    });
    return () => unsubscribe();
  }, []);

  const handleToggleTheme = () => {
    if (propToggleTheme) {
      propToggleTheme();
    } else {
      themeEngine.toggleMode();
    }
  };

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
    <div className="cockpit-field-guide-root fixed inset-0 z-50 bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col justify-between select-none p-2 sm:p-3 overflow-y-auto animate-fadeIn transition-colors duration-200">
      {/* Top Walkthrough Navigation Control Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-2 sm:py-2.5 mb-2 rounded-xl flex items-center justify-between gap-3 shadow-md shrink-0 transition-colors">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1.5"
          >
            {isAdminView ? (
              <span>← ADMIN CONSOLE [ESC]</span>
            ) : isWalkthrough ? (
              <span>← SQUAD SETUP</span>
            ) : (
              <span>✕ CLOSE GUIDE [ESC]</span>
            )}
          </button>
          {onGoHome && !isWalkthrough && !isAdminView && (
            <button
              type="button"
              onClick={onGoHome}
              title="Return to Home Screen"
              className="px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1"
            >
              <span>HOME</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-center">
          <BookOpen className="w-4 h-4 text-sky-500 shrink-0" />
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wide block text-[var(--text-primary)]">
              COCKPIT FIELD GUIDE • HOVER / TAP ANY COMPONENT TO INSPECT
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-sans hidden sm:block">
              {isAdminView
                ? 'Facilitator Reference • Architecture & Decision Mechanics Guide'
                : isWalkthrough
                ? 'Review mechanics before your sprint begins.'
                : 'Live In-Game Architecture Reference Manual'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Universal Theme Switcher */}
          <button
            type="button"
            onClick={handleToggleTheme}
            title={currentMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-mono font-bold cursor-pointer select-none bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 shadow-xs"
          >
            {currentMode === 'light' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] text-slate-700">LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[11px] text-slate-200">DARK</span>
              </>
            )}
          </button>

          {isAdminView ? (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-[0.99]"
            >
              <span>RETURN TO CONSOLE</span>
              <X className="w-3.5 h-3.5" />
            </button>
          ) : isWalkthrough ? (
            <button
              type="button"
              onClick={onLaunchGame}
              className="px-4 py-1.5 text-xs font-mono font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 cursor-pointer shadow-lg animate-pulse transition-all active:scale-[0.99]"
            >
              <span>ENTER REALM [SPACE]</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-[0.99]"
            >
              <span>RESUME GAME</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Replica Cockpit Arena Container: 7-Col Scenario (Left) & 5-Col Tower + Decision Matrix (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0 items-stretch mb-2">
        {/* Left Wing (7 cols): Scenario, Diff Workspace, Telemetry & Consensus */}
        <div className="lg:col-span-7 flex flex-col gap-2 min-h-0">
          {/* Top Bar Replica */}
          <div
            onMouseEnter={() => setActiveGuideKey('top_hud')}
            onClick={() => setActiveGuideKey('top_hud')}
            className={`px-3 py-1.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
              activeGuideKey === 'top_hud'
                ? 'ring-2 ring-sky-500 border-sky-500 bg-sky-500/10'
                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-[var(--text-primary)]">REALM: {teamName}</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                STAGE 1/11
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-rose-500 font-bold">❤️❤️❤️❤️❤️ 100%</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                02:00
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-500/30">
                ⓘ TOP HUD
              </span>
            </div>
          </div>

          {/* Realm Ticker Replica */}
          <div
            onMouseEnter={() => setActiveGuideKey('ticker')}
            onClick={() => setActiveGuideKey('ticker')}
            className={`px-3 py-1 rounded-xl border flex items-center justify-between gap-2 text-[10px] font-mono cursor-pointer transition-all ${
              activeGuideKey === 'ticker'
                ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-500/10'
                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 truncate">
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold">REALM TICKER:</span>
              <span className="text-emerald-600 dark:text-emerald-400">Table 4: QuantumSREs 94% W7/11</span>
              <span className="text-[var(--text-muted)] hidden sm:inline">• Table 2: ByteBusters 82%</span>
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 shrink-0">
              ⓘ TICKER
            </span>
          </div>

          {/* Quest Briefing & Code Diff Replica */}
          <div
            onMouseEnter={() => setActiveGuideKey('quest')}
            onClick={() => setActiveGuideKey('quest')}
            className={`p-3 rounded-xl flex flex-col flex-1 min-h-0 border cursor-pointer transition-all ${
              activeGuideKey === 'quest'
                ? 'ring-2 ring-cyan-500 border-cyan-500 bg-cyan-500/5'
                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                  QUEST WAVE 1
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">Apex Trigger & Bulkification</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center gap-1">
                  <Maximize2 className="w-3 h-3" /> ENLARGE
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                  ⓘ QUEST & DIFF
                </span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1 font-mono">
              CSC-101: Account-to-Contact Phone Sync
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-sans leading-tight mb-2 line-clamp-2">
              When an Account phone number is updated, synchronize the new phone number to all related child Contact records.
            </p>

            {/* AI Golem Proposal Callout matching real game */}
            <div className="mb-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 block mb-0.5">
                🤖 AIGOLEM PROPOSAL
              </span>
              <span className="text-[10.5px] text-[var(--text-secondary)] italic">
                "Implemented Contact to Account phone synchronization in AccountTriggerHandler.cls using direct query lookups inside account iteration."
              </span>
            </div>

            {/* Realistic Multi-line Code Diff Box */}
            <div className="border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-code,#070b14)] p-2.5 font-mono text-[10.5px] flex-1 min-h-[135px] flex flex-col justify-start space-y-0.5 overflow-hidden">
              <div className="text-[10px] text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-1 mb-1 flex items-center justify-between">
                <span>force-app/main/default/classes/AccountTriggerHandler.cls (git diff)</span>
                <span className="text-[9px] text-sky-500 font-bold">FULL DIFF ➔</span>
              </div>
              <div className="text-[var(--text-muted)] opacity-60">1  public with sharing class AccountTriggerHandler &#123;</div>
              <div className="text-[var(--text-muted)] opacity-60">2    public static void syncContacts(List&lt;Account&gt; accounts) &#123;</div>
              <div className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 font-semibold">
                3  -     // TODO: Bulkified map lookup
              </div>
              <div className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 font-semibold">
                4  -     Map&lt;Id, Account&gt; accMap = new Map&lt;Id, Account&gt;(accounts);
              </div>
              <div className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
                5  +     for (Account acc : accounts) &#123;
              </div>
              <div className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
                6  +       List&lt;Contact&gt; cons = [SELECT Id FROM Contact WHERE AccountId = :acc.Id];
              </div>
              <div className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
                7  +       update cons; // Anti-pattern: DML inside loop!
              </div>
              <div className="text-[var(--text-muted)] opacity-60">8    &#125;</div>
              <div className="text-[var(--text-muted)] opacity-60">9  &#125;</div>
            </div>

            {/* Telemetry Accordion Replica */}
            <div
              onMouseEnter={(e) => { e.stopPropagation(); setActiveGuideKey('telemetry'); }}
              onClick={(e) => { e.stopPropagation(); setActiveGuideKey('telemetry'); }}
              className={`mt-2 p-2 rounded-lg border flex items-center justify-between text-xs font-mono cursor-pointer transition-all ${
                activeGuideKey === 'telemetry'
                  ? 'ring-2 ring-orange-500 border-orange-500 bg-orange-500/15'
                  : 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="font-bold">DETECTED ARCHITECTURE TELEMETRY: SOQL IN FOR-LOOP</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/40">
                ⓘ TELEMETRY
              </span>
            </div>
          </div>

          {/* Consensus Bar Replica */}
          <div
            onMouseEnter={() => setActiveGuideKey('consensus')}
            onClick={() => setActiveGuideKey('consensus')}
            className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs font-mono cursor-pointer transition-all ${
              activeGuideKey === 'consensus'
                ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/10'
                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <span className="text-[var(--text-primary)] font-bold">REALM CONSENSUS: 0 / 4 VOTES</span>
              <span className="text-[var(--text-muted)] text-[10px]">(LOCKS AT 100% OR 2-MIN TIMER)</span>
            </div>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30">
              ⓘ CONSENSUS
            </span>
          </div>
        </div>

        {/* Right Wing (5 cols): 3D Architecture Tower Stability Twin + 2x2 Decision Matrix */}
        <div className="lg:col-span-5 flex flex-col gap-2 min-h-0">
          {/* Top: 3D Tower Replica Viewport */}
          <div
            onMouseEnter={() => setActiveGuideKey('tower')}
            onClick={() => setActiveGuideKey('tower')}
            className={`p-3 rounded-xl flex flex-col justify-between border cursor-pointer transition-all ${
              activeGuideKey === 'tower' || activeGuideKey === 'debt'
                ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-500/5'
                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            {/* Tower Header */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Rotate3d className="w-4 h-4 text-sky-500" />
                  <span className="text-xs font-mono uppercase font-bold text-[var(--text-primary)]">
                    3D VOXEL TOWER
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Real-time Tech Debt outcome badge as per latest app */}
                  <div
                    onMouseEnter={(e) => { e.stopPropagation(); setActiveGuideKey('debt'); }}
                    onClick={(e) => { e.stopPropagation(); setActiveGuideKey('debt'); }}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md border cursor-pointer transition-all flex items-center gap-1.5 ${
                      activeGuideKey === 'debt'
                        ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30'
                    }`}
                  >
                    <span>⚠️ TECH DEBT: 0/5</span>
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40">
                      STABLE
                    </span>
                  </div>

                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                    100% SOLID
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30">
                    ⓘ TOWER
                  </span>
                </div>
              </div>

              {/* Stability Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                <div className="w-full bg-emerald-500 h-1.5 rounded-full" />
              </div>

              {/* Domain badges */}
              <div className="flex flex-wrap gap-1 text-[9px] font-mono">
                <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">Governors</span>
                <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">Async Apex</span>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">Security/FLS</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">LWC Engine</span>
              </div>
            </div>

            {/* Stylized 3D Jenga Tower Voxel Graphics Mockup */}
            <div className="my-2.5 rounded-xl flex items-center justify-center min-h-[140px] bg-[var(--bg-code,#070b14)] border border-[var(--border-subtle)] relative overflow-hidden">
              <div className="flex flex-col items-center gap-1.5 py-3">
                <div className="w-28 h-5 rounded bg-amber-600/80 border border-amber-400 shadow-sm flex items-center justify-center text-[9px] font-mono font-bold text-white">54 BLOCKS</div>
                <div className="w-28 h-5 rounded bg-amber-700/80 border border-amber-500 shadow-sm" />
                <div className="w-28 h-5 rounded bg-amber-600/80 border border-amber-400 shadow-sm flex items-center justify-center text-[9px] font-mono font-bold text-emerald-200">STABLE</div>
                <div className="w-28 h-5 rounded bg-amber-700/80 border border-amber-500 shadow-sm" />
                <div className="w-28 h-5 rounded bg-amber-600/80 border border-amber-400 shadow-sm flex items-center justify-center text-[9px] font-mono font-bold text-emerald-300">FULL UPTIME</div>
              </div>
              <div className="absolute bottom-2 text-center text-[9px] font-mono text-amber-600 dark:text-amber-300 bg-amber-500/15 px-2.5 py-0.5 rounded-md border border-amber-500/30 font-semibold backdrop-blur-xs">
                Every risk mines blocks & destabilizes physics
              </div>
            </div>

            <div
              onMouseEnter={(e) => { e.stopPropagation(); setActiveGuideKey('debt'); }}
              onClick={(e) => { e.stopPropagation(); setActiveGuideKey('debt'); }}
              className={`p-2 rounded-lg border text-[10px] font-mono text-center cursor-pointer transition-all ${
                activeGuideKey === 'debt'
                  ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:border-amber-500'
              }`}
            >
              <span>⚠️ TECHNICAL DEBT RULE: Reaching 4+ Debts triggers </span>
              <strong className="text-rose-600 dark:text-rose-400">Critical Fragility (3 pulls + 25% damage)</strong>
              <span className="ml-1 text-[9px] text-amber-600 dark:text-amber-400 underline">[Hover for details]</span>
            </div>
          </div>

          {/* Bottom: 2x2 Decision Matrix Replica matching exact live game layout */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Slot 1 */}
            <div
              onMouseEnter={() => setActiveGuideKey('slot_1')}
              onClick={() => setActiveGuideKey('slot_1')}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeGuideKey === 'slot_1'
                  ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/15'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400">[1]</span>
                  <span>🍏</span>
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] font-mono">Accept as-is</h4>
                <p className="text-[10px] text-[var(--text-muted)] font-sans mt-0.5">Rapid merge, zero review. High risk!</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--border-subtle)]/60">
                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-mono">
                  RAW SPEED
                </span>
                <span className="text-[8px] text-emerald-600 dark:text-emerald-400 font-mono">ⓘ HOVER</span>
              </div>
            </div>

            {/* Slot 2 */}
            <div
              onMouseEnter={() => setActiveGuideKey('slot_2')}
              onClick={() => setActiveGuideKey('slot_2')}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeGuideKey === 'slot_2'
                  ? 'ring-2 ring-sky-500 border-sky-500 bg-sky-500/15'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold text-sky-600 dark:text-sky-400">[2]</span>
                  <span>🛡️</span>
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] font-mono">Bypass & Skip</h4>
                <p className="text-[10px] text-[var(--text-muted)] font-sans mt-0.5">Reject commit to safeguard health.</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--border-subtle)]/60">
                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-300 font-mono">
                  SAFE SKIP
                </span>
                <span className="text-[8px] text-sky-600 dark:text-sky-400 font-mono">ⓘ HOVER</span>
              </div>
            </div>

            {/* Slot 3 */}
            <div
              onMouseEnter={() => setActiveGuideKey('slot_3')}
              onClick={() => setActiveGuideKey('slot_3')}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeGuideKey === 'slot_3'
                  ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-500/15'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold text-purple-600 dark:text-purple-400">[3]</span>
                  <span>🪶</span>
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] font-mono">Human Guidance</h4>
                <p className="text-[10px] text-[var(--text-muted)] font-sans mt-0.5">Draft steering prompt in Book & Quill.</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--border-subtle)]/60">
                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-600 dark:text-purple-300 font-mono">
                  COLLAB
                </span>
                <span className="text-[8px] text-purple-600 dark:text-purple-400 font-mono">ⓘ HOVER</span>
              </div>
            </div>

            {/* Slot 4 */}
            <div
              onMouseEnter={() => setActiveGuideKey('slot_4')}
              onClick={() => setActiveGuideKey('slot_4')}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                activeGuideKey === 'slot_4'
                  ? 'ring-2 ring-pink-500 border-pink-500 bg-pink-500/15'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold text-pink-600 dark:text-pink-400">[4]</span>
                  <span>🤖</span>
                </div>
                <h4 className="text-xs font-bold text-[var(--text-primary)] font-mono">AI Suggestions</h4>
                <p className="text-[10px] text-[var(--text-muted)] font-sans mt-0.5">Review 3 AI-proposed technical fixes.</p>
              </div>
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--border-subtle)]/60">
                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-pink-500/15 text-pink-600 dark:text-pink-300 font-mono">
                  PROPOSALS
                </span>
                <span className="text-[8px] text-pink-600 dark:text-pink-400 font-mono">ⓘ HOVER</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Docked Interactive Inspector Panel */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-3 sm:p-4 rounded-xl shadow-xl shrink-0 animate-fadeIn transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shrink-0">
              {activeGuide.icon}
            </span>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-bold border"
                  style={{ color: activeGuide.color, borderColor: activeGuide.color, backgroundColor: `${activeGuide.color}15` }}
                >
                  {activeGuide.badge}
                </span>
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono">
                  {activeGuide.title}
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-sans leading-relaxed mb-2 select-text whitespace-pre-line">
                {activeGuide.desc}
              </p>
              <div className="text-[11px] font-sans rounded-lg px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200">
                <strong>💡 {activeGuide.tip}</strong>
              </div>
            </div>
          </div>

          {/* Quick Component Switcher Pills */}
          <div className="flex flex-wrap gap-1 sm:max-w-xs justify-end shrink-0 pt-1">
            {Object.keys(GUIDE_SECTIONS).map((key) => {
              const item = GUIDE_SECTIONS[key];
              const isActive = activeGuideKey === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveGuideKey(key)}
                  className={`text-[9px] font-mono px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  {item.badge.split(':')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
