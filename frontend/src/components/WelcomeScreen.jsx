import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Users,
  Zap,
  User,
  KeyRound,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { getPlayerName, setPlayerName, lookupTableCode } from '../services/api';
import CockpitFieldGuide from './CockpitFieldGuide';

const TEAM_SUGGESTIONS = [
  'Alpha Devs',
  'Byte Busters',
  'Apex SREs',
  'Cloud Titans',
];

const MINECRAFT_SPLASHES = [
  "Don't dig into Governor limits!",
  "Never dig straight down into Prod!",
  "Redstone powered HITL!",
  "Watch out for SOQL in for-loops!",
  "100% Organic Architecture & Jenga!",
  "Creepers hate 100% test coverage!",
  "Consensus > Chaos!",
  "Single-threaded nightmares resolved!",
  "Beware the 10,000 DML row cap!",
  "Test in Sandbox, pray in Prod!",
  "Diamonds are forever, debt is eternal!",
  "AI generates, Humans validate!",
  "Keep tower integrity above 50%!",
  "Crafting asynchronous Apex since 2026!",
  "Mine blocks, merge PRs, don't collapse!",
  "Architected with Coffee & Redstone!",
  "Governor limits are watching you!",
  "Human-in-the-Loop: You are the firewall!",
  "Shift-crouching near production edges!",
  "4 Debts = Instant Fragility!",
  "Have you backed up your metadata today?",
  "C++ was forged in the Nether!",
  "SRE stands for Screaming, Running, Escaping!",
  "May your CI/CD pipelines stay green!",
  "Keep calm and mine the next block!",
  "Stack overflowed into the Void!",
  "Git push --force with closed eyes!",
  "Don't wake the Ender Dragon in DevOps!",
  "Refactor tomorrow, ship today!",
  "Consensus reached: We blame the intern!",
  "Redstone torches prevent merge conflicts!",
  "Netherite pickaxes vs Technical Debt!",
  "Autonomous agents require human wisdom!",
  "Deploying on Friday is an extreme sport!",
];

const DRAGGABLE_SLOTS = [
  {
    id: 'splash-title',
    xPct: 0.58,
    yPct: 0.12,
    rotation: -10,
    star: '★',
    isTitleSplash: true,
  },
  {
    id: 'left-flank',
    xPct: 0.07,
    yPct: 0.38,
    rotation: -5,
    star: '✦',
  },
  {
    id: 'right-flank',
    xPct: 0.76,
    yPct: 0.62,
    rotation: 6,
    star: '⚡',
  },
];

export default function WelcomeScreen({ onStartGame, onJoinLiveTable, defaultRoomId, onOpenGuide, theme = 'dark', onToggleTheme }) {
  // Always default to 'join' tab for players as requested
  const [tabMode, setTabMode] = useState('join');

  // Draggable Quotes State
  const [quoteItems, setQuoteItems] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    return DRAGGABLE_SLOTS.map((slot, i) => ({
      x: Math.round(w * slot.xPct),
      y: Math.round(h * slot.yPct),
      quoteIndex: (i * 5) % MINECRAFT_SPLASHES.length,
      hasMoved: false,
    }));
  });

  const dragInfoRef = useRef(null);
  const [activeDragId, setActiveDragId] = useState(null);

  // Recalculate positions on window resize for quotes that haven't been dragged yet
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setQuoteItems((prev) =>
        prev.map((item, i) => {
          if (item.hasMoved) return item;
          return {
            ...item,
            x: Math.round(w * DRAGGABLE_SLOTS[i].xPct),
            y: Math.round(h * DRAGGABLE_SLOTS[i].yPct),
          };
        })
      );
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePointerDown = (e, index) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch { }

    dragInfoRef.current = {
      index,
      pointerId: e.pointerId,
      target,
      startX: e.clientX,
      startY: e.clientY,
      origX: quoteItems[index]?.x || 0,
      origY: quoteItems[index]?.y || 0,
      moved: false,
    };
    setActiveDragId(index);
  };

  const handlePointerMove = (e) => {
    if (!dragInfoRef.current) return;
    const { index, startX, startY, origX, origY } = dragInfoRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.hypot(dx, dy) > 4) {
      dragInfoRef.current.moved = true;
    }
    if (dragInfoRef.current.moved) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const newX = Math.max(10, Math.min(w - 120, origX + dx));
      const newY = Math.max(10, Math.min(h - 40, origY + dy));
      setQuoteItems((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], x: newX, y: newY, hasMoved: true };
        return next;
      });
    }
  };

  const handlePointerUp = (e) => {
    if (!dragInfoRef.current) return;
    const { index, pointerId, target, moved } = dragInfoRef.current;
    try {
      target.releasePointerCapture(pointerId);
    } catch { }

    if (!moved) {
      // It was a click/tap: roll a new quote!
      setQuoteItems((prev) => {
        const next = [...prev];
        let newIdx = Math.floor(Math.random() * MINECRAFT_SPLASHES.length);
        if (newIdx === next[index].quoteIndex) {
          newIdx = (newIdx + 1) % MINECRAFT_SPLASHES.length;
        }
        next[index] = { ...next[index], quoteIndex: newIdx };
        return next;
      });
    }

    dragInfoRef.current = null;
    setActiveDragId(null);
  };

  const resetQuotePositions = () => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    setQuoteItems((prev) =>
      prev.map((item, i) => ({
        ...item,
        x: Math.round(w * DRAGGABLE_SLOTS[i].xPct),
        y: Math.round(h * DRAGGABLE_SLOTS[i].yPct),
        hasMoved: false,
      }))
    );
  };

  // Create Mode state
  const [teamName, setTeamName] = useState('Alpha Devs');
  const [playerCount, setPlayerCount] = useState(4);
  const [gameMode, setGameMode] = useState('gatekeeper'); // 'gatekeeper' | 'sprint'

  // Join Mode state: strictly do NOT pre-fill cloud-titans or default
  const [joinPin, setJoinPin] = useState(() => {
    if (defaultRoomId && defaultRoomId !== 'cloud-titans' && defaultRoomId !== 'default') {
      return defaultRoomId.toUpperCase();
    }
    return '';
  });
  const [pinLookup, setPinLookup] = useState({ loading: false, found: false, data: null, message: null });

  // Player Gamer Tag (Shared)
  const [playerName, setPlayerNameState] = useState(getPlayerName() || 'Riks');

  // Keep URL strictly as /home on welcome screen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (window.location.pathname !== '/home' || window.location.search) {
          window.history.replaceState({}, '', '/home');
        }
      } catch { }
    }
  }, []);

  // Flow State: 'setup' -> 'walkthrough'
  const [step, setStep] = useState('setup');
  const [pendingLaunch, setPendingLaunch] = useState(null);

  // Debounced lookup when user types 4-character PIN
  useEffect(() => {
    const clean = joinPin.trim().toUpperCase();
    if (clean.length < 3) {
      setPinLookup({ loading: false, found: false, data: null, message: null });
      return;
    }

    let isCurrent = true;
    const timer = setTimeout(async () => {
      setPinLookup((prev) => ({ ...prev, loading: true }));
      try {
        const res = await lookupTableCode(clean);
        if (!isCurrent) return;
        if (res.found) {
          setPinLookup({ loading: false, found: true, data: res, message: null });
        } else {
          setPinLookup({ loading: false, found: false, data: null, message: res.message || 'No active table found' });
        }
      } catch {
        if (isCurrent) {
          setPinLookup({ loading: false, found: false, data: null, message: 'Could not reach server' });
        }
      }
    }, 300);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [joinPin]);

  const handleProceedCreate = () => {
    const finalPlayer = (playerName || '').trim() || 'Riks';
    const finalTeam = (teamName || '').trim() || 'Cloud Titans';
    setPlayerName(finalPlayer);

    const launchData = {
      team: finalTeam,
      count: playerCount,
      room: 'create', // signals backend to generate new unique PIN
      player: finalPlayer,
      isJoin: false,
      gameMode,
    };

    if (onOpenGuide) {
      onOpenGuide(launchData);
    } else {
      setPendingLaunch(launchData);
      setStep('walkthrough');
    }
  };

  const handleProceedJoin = () => {
    const finalPlayer = (playerName || '').trim() || 'Riks';
    const targetRoom = pinLookup.data?.room_id || joinPin.trim().toLowerCase();
    const detectedMode = pinLookup.data?.game_mode || 'gatekeeper';
    setPlayerName(finalPlayer);

    if (onJoinLiveTable) {
      onJoinLiveTable(targetRoom, finalPlayer, detectedMode);
    }
  };

  const handleLaunchGame = () => {
    if (!pendingLaunch) return;
    if (pendingLaunch.isJoin && onJoinLiveTable) {
      onJoinLiveTable(pendingLaunch.room, pendingLaunch.player, pendingLaunch.gameMode);
    } else {
      onStartGame(pendingLaunch.team, pendingLaunch.count, pendingLaunch.room, pendingLaunch.player, pendingLaunch.gameMode);
    }
  };

  if (step === 'walkthrough') {
    return (
      <CockpitFieldGuide
        onClose={() => setStep('setup')}
        onLaunchGame={handleLaunchGame}
        isWalkthrough={true}
        teamName={pendingLaunch?.team || 'Cloud Titans'}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
    );
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-100 dark:bg-[#0b0f17] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(226,232,240,0.6),rgba(241,245,249,1))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,41,59,0.45),rgba(11,15,23,1))] text-slate-900 dark:text-slate-100 flex flex-col justify-between py-2 sm:py-3 px-3 sm:px-6 select-none relative transition-colors duration-200">
      {/* Theme Switcher */}
      {onToggleTheme && (
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          className="absolute top-3 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-slate-850/90 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-700 dark:text-slate-200 transition-all shadow-xs cursor-pointer backdrop-blur-md select-none"
        >
          {theme === 'light' ? (
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
      )}

      {/* Draggable & Clickable Quotes & Splash Texts (Refined Neutral Floating Badges) */}
      {DRAGGABLE_SLOTS.map((slot, idx) => {
        const item = quoteItems[idx];
        if (!item) return null;
        const quoteText = MINECRAFT_SPLASHES[item.quoteIndex % MINECRAFT_SPLASHES.length];
        const isDragging = activeDragId === idx;

        return (
          <div
            key={slot.id}
            onPointerDown={(e) => handlePointerDown(e, idx)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            title="🖐 Drag to place anywhere! Click to roll another quote! 🎲"
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              transform: `rotate(${slot.rotation}deg) scale(${isDragging ? 1.06 : 1})`,
              touchAction: 'none',
            }}
            className={`fixed ${slot.isTitleSplash ? 'flex' : 'hidden sm:flex'
              } items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-md text-[10px] sm:text-xs font-mono font-medium select-none z-30 transition-all ${isDragging
                ? 'cursor-grabbing z-50 scale-105 shadow-md border-slate-400 dark:border-slate-600'
                : 'cursor-grab hover:scale-105 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md'
              }`}
          >
            <span className="text-slate-400 dark:text-slate-500 font-bold">{slot.star}</span>
            <span className="whitespace-nowrap">{quoteText}</span>
          </div>
        );
      })}

      <div className="max-w-lg mx-auto w-full my-auto flex flex-col justify-center">
        {/* Title Header */}
        <div className="text-center mb-2 sm:mb-3 relative shrink-0 pt-3 sm:pt-4">
          <div className="relative inline-block mb-1 sm:mb-2">
            <h1 className="text-2xl sm:text-4xl font-black tracking-wider text-slate-900 dark:text-white font-mono">
              MINECRAFT <span className="text-slate-500 dark:text-slate-400">HITL</span>
            </h1>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-snug mt-1 font-mono">
            Balance sprint velocity, code quality, and the stability of your <strong className="text-slate-800 dark:text-slate-200 font-semibold">3D Voxel Tower</strong> across 11 high-pressure stages.
          </p>
        </div>

        {/* Start Adventure Card */}
        <div className="bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 p-4 sm:p-5 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 border border-slate-200/90 dark:border-slate-800 rounded-2xl backdrop-blur-xl transition-all">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-1.5 mb-3 bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setTabMode('create')}
              className={`py-1.5 px-3 text-xs font-mono font-bold flex items-center justify-center gap-1.5 rounded-lg transition-all cursor-pointer ${tabMode === 'create'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>CREATE TABLE</span>
            </button>

            <button
              type="button"
              onClick={() => setTabMode('join')}
              className={`py-1.5 px-3 text-xs font-mono font-bold flex items-center justify-center gap-1.5 rounded-lg transition-all cursor-pointer ${tabMode === 'join'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>JOIN WITH PIN</span>
            </button>
          </div>

          {/* TAB 1: CREATE NEW TABLE */}
          {tabMode === 'create' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProceedCreate();
              }}
              className="space-y-3"
            >
              {/* Table Name */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                  Table Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Alpha Devs, Cloud Titans, Table 1..."
                  className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-1.5 text-xs sm:text-sm font-mono rounded-xl focus:outline-none focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 dark:focus:ring-slate-500/20 focus:bg-white dark:focus:bg-slate-950 transition-all"
                  required
                />

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Quick Pick:</span>
                  {TEAM_SUGGESTIONS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTeamName(preset)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${teamName === preset
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-white font-bold shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-300 dark:border-slate-700'
                        }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gamer Tag */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Your Name (Gamer Tag)</span>
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerNameState(e.target.value)}
                  placeholder="e.g. Riks, Wayne, Kent..."
                  className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-1.5 text-xs sm:text-sm font-mono rounded-xl focus:outline-none focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 dark:focus:ring-slate-500/20 focus:bg-white dark:focus:bg-slate-950 transition-all"
                  required
                />
              </div>

              {/* Simulation Game Mode */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1 flex items-center justify-between">
                  <span>Simulation Mode</span>
                  <span className="text-[10px] text-slate-500 font-normal">Choose Format</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGameMode('gatekeeper')}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      gameMode === 'gatekeeper'
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-white shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-bold font-mono flex items-center gap-1">
                          <span>🛡️</span>
                          <span>GATEKEEPER</span>
                        </span>
                        <span className={`text-[8.5px] font-mono px-1 py-0.2 rounded font-bold ${
                          gameMode === 'gatekeeper'
                            ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          2m/STAGE
                        </span>
                      </div>
                      <p className={`text-[10px] font-sans leading-tight ${
                        gameMode === 'gatekeeper' ? 'text-slate-200 dark:text-slate-800' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        Tactical per-stage timer & skip.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGameMode('sprint')}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      gameMode === 'sprint'
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-white shadow-md'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-950/60 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-bold font-mono flex items-center gap-1">
                          <span>⚡</span>
                          <span>SPRINT</span>
                        </span>
                        <span className={`text-[8.5px] font-mono px-1 py-0.2 rounded font-bold ${
                          gameMode === 'sprint'
                            ? 'bg-amber-400/30 text-amber-200 dark:text-amber-900'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                        }`}>
                          25m SPRINT
                        </span>
                      </div>
                      <p className={`text-[10px] font-sans leading-tight ${
                        gameMode === 'sprint' ? 'text-slate-200 dark:text-slate-800' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        Master 25m clock, Copilot & override.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Table Size */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1">
                  Team Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setPlayerCount(cnt)}
                      className={`py-1.5 text-[11px] font-mono rounded-xl border transition-all cursor-pointer ${playerCount === cnt
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-white font-bold shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700'
                        }`}
                    >
                      {cnt} Players
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-slate-900/10 dark:shadow-black/30 tracking-wider transition-all active:scale-[0.99]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START ADVENTURE (GET PIN) ➔</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: JOIN WITH PIN (Kahoot Style) */}
          {tabMode === 'join' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProceedJoin();
              }}
              className="space-y-3"
            >
              {/* Game PIN Input */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1.5 text-center">
                  ENTER 4-CHARACTER GAME PIN
                </label>
                <input
                  type="text"
                  value={joinPin}
                  onChange={(e) => setJoinPin(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="TYPE PIN (e.g. 7B2K)"
                  className="w-full bg-slate-50 dark:bg-slate-950/80 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal placeholder:tracking-normal text-center text-lg sm:text-xl font-mono font-bold py-2 tracking-[0.25em] uppercase rounded-xl focus:outline-none focus:border-slate-800 dark:focus:border-slate-400 focus:bg-white dark:focus:bg-slate-950 focus:ring-2 focus:ring-slate-400/20 dark:focus:ring-slate-500/20 transition-all shadow-inner"
                  autoFocus
                  required
                />
              </div>

              {/* Live Table Detection Badge */}
              <div className="min-h-[38px] flex items-center justify-center">
                {pinLookup.loading && (
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 animate-pulse">
                    Connecting to table realm...
                  </span>
                )}

                {!pinLookup.loading && pinLookup.found && pinLookup.data && (
                  <div className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2 truncate">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <strong className="text-slate-900 dark:text-white block truncate">{pinLookup.data.team_name}</strong>
                          <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold ${
                            pinLookup.data.game_mode === 'sprint' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-sky-500/20 text-sky-700 dark:text-sky-300'
                          }`}>
                            {pinLookup.data.game_mode === 'sprint' ? '⚡ SPRINT' : '🛡️ GATEKEEPER'}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Stage {pinLookup.data.current_stage}/11 • {pinLookup.data.active_players} online
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-2 py-0.5 rounded-md">
                      READY
                    </span>
                  </div>
                )}

                {!pinLookup.loading && !pinLookup.found && pinLookup.message && joinPin.trim().length >= 3 && (
                  <div className="w-full p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs font-mono flex items-center gap-2 shadow-xs">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="text-[10px]">
                      {pinLookup.message}. Ask your teammate for their screen PIN.
                    </span>
                  </div>
                )}

                {!pinLookup.loading && !pinLookup.found && joinPin.trim().length < 3 && (
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    💡 Ask your table host for their 4-character screen PIN
                  </span>
                )}
              </div>

              {/* Gamer Tag */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Your Name (Gamer Tag)</span>
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerNameState(e.target.value)}
                  placeholder="e.g. Riks, Wayne, Kent..."
                  className="w-full bg-slate-50 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-1.5 text-xs sm:text-sm font-mono rounded-xl focus:outline-none focus:border-slate-500 dark:focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 dark:focus:ring-slate-500/20 focus:bg-white dark:focus:bg-slate-950 transition-all"
                  required
                />
              </div>

              <div className="pt-1">
                {(() => {
                  const isJoinDisabled = !pinLookup.found || !playerName.trim();
                  return (
                    <button
                      type="submit"
                      disabled={isJoinDisabled}
                      className={`w-full py-2.5 sm:py-3 text-xs sm:text-sm font-mono font-bold rounded-xl flex items-center justify-center gap-2 tracking-wider transition-all select-none ${
                        isJoinDisabled
                          ? 'bg-slate-200 text-slate-500 border border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 cursor-not-allowed shadow-none'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-[0.99]'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>
                        {pinLookup.found
                          ? `JOIN TABLE: ${(pinLookup.data?.team_name || joinPin).toUpperCase()} ➔`
                          : joinPin.trim().length > 0
                          ? 'VERIFYING GAME PIN... ➔'
                          : 'ENTER 4-DIGIT PIN TO JOIN ➔'}
                      </span>
                    </button>
                  );
                })()}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0 py-1.5 flex items-center justify-center gap-2 relative z-10">
        <span>Developer Day Workshop Edition • Real-Time 3D Voxel HITL Simulation</span>
        <span>•</span>
        <button
          type="button"
          onClick={resetQuotePositions}
          title="Reset all quotes back to initial positions"
          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline cursor-pointer transition-colors"
        >
          [Reset Quotes]
        </button>
        <span>•</span>
        <a href="/admin" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white underline transition-colors cursor-pointer">
          [GM Console]
        </a>
      </footer>
    </div>
  );
}
