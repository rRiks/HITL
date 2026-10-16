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
  "Redstone powered AIDLC!",
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
    rotation: -12,
    color: 'text-[#ffff00]',
    star: '★',
    isTitleSplash: true,
  },
  {
    id: 'left-flank',
    xPct: 0.07,
    yPct: 0.38,
    rotation: -6,
    color: 'text-[#38bdf8]',
    star: '✦',
  },
  {
    id: 'right-flank',
    xPct: 0.76,
    yPct: 0.62,
    rotation: 7,
    color: 'text-[#55ff55]',
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
    setPlayerName(finalPlayer);

    if (onJoinLiveTable) {
      onJoinLiveTable(targetRoom, finalPlayer);
    }
  };

  const handleLaunchGame = () => {
    if (!pendingLaunch) return;
    if (pendingLaunch.isJoin && onJoinLiveTable) {
      onJoinLiveTable(pendingLaunch.room, pendingLaunch.player);
    } else {
      onStartGame(pendingLaunch.team, pendingLaunch.count, pendingLaunch.room, pendingLaunch.player);
    }
  };

  if (step === 'walkthrough') {
    return (
      <CockpitFieldGuide
        onClose={() => setStep('setup')}
        onLaunchGame={handleLaunchGame}
        isWalkthrough={true}
        teamName={pendingLaunch?.team || 'Cloud Titans'}
      />
    );
  }

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-mc-dirt text-white flex flex-col justify-between py-2 sm:py-3 px-3 sm:px-6 select-none relative">
      {/* Premium Theme Switcher */}
      {onToggleTheme && (
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'light' ? 'Switch to Dark Realm' : 'Switch to Light Realm'}
          className="absolute top-3 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-[#1e293b]/85 hover:bg-[#334155] border-2 border-[#475569] text-xs font-mono font-bold text-white transition-colors duration-100 active:scale-95 shadow-md cursor-pointer mc-btn select-none"
        >
          {theme === 'light' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#fbbf24]" />
              <span className="text-[11px] text-[#fbbf24]">LIGHT</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span className="text-[11px] text-[#38bdf8]">DARK</span>
            </>
          )}
        </button>
      )}

      {/* Draggable & Clickable Quotes & Splash Texts (Borderless Authentic Minecraft Style) */}
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
              transform: `rotate(${slot.rotation}deg) scale(${isDragging ? 1.18 : 1})`,
              touchAction: 'none',
            }}
            className={`fixed ${slot.color} ${slot.isTitleSplash ? 'flex' : 'hidden sm:flex'
              } items-center gap-1.5 text-[10px] sm:text-xs font-mono font-bold drop-shadow-[0_2px_0_#000] select-none z-30 transition-transform ${isDragging
                ? 'cursor-grabbing z-50 filter brightness-125'
                : 'cursor-grab animate-pulse hover:scale-115 hover:brightness-125'
              }`}
          >
            <span className="opacity-90">{slot.star}</span>
            <span className="whitespace-nowrap">{quoteText}</span>
          </div>
        );
      })}

      <div className="max-w-lg mx-auto w-full my-auto flex flex-col justify-center">
        {/* Minecraft Title Header */}
        <div className="text-center mb-2 sm:mb-3 relative shrink-0 pt-3 sm:pt-4">
          <div className="relative inline-block mb-1 sm:mb-2">
            <h1 className="text-2xl sm:text-4xl font-black tracking-widest text-[#e0e0e0] mc-font drop-shadow-[0_4px_0_#222]">
              MINECRAFT <span className="text-[#ffd700]">AIDLC</span>
            </h1>
          </div>

          <p className="text-[11px] sm:text-xs text-[#ccc] max-w-lg mx-auto leading-snug mt-1 font-mono">
            Balance sprint velocity, code quality, and the stability of your <strong>3D Voxel Tower</strong> across 11 high-pressure stages.
          </p>
        </div>

        {/* Start Adventure Card */}
        <div className="mc-panel-dark p-4 sm:p-5 shadow-2xl border-4 border-[#333]">
          {/* Kahoot/Jackbox Mode Tabs */}
          <div className="welcome-tab-container grid grid-cols-2 gap-2 mb-3 bg-[#111] p-1 border-2 border-[#444]">
            <button
              type="button"
              onClick={() => setTabMode('create')}
              className={`welcome-tab-btn py-1.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${tabMode === 'create'
                ? 'welcome-tab-create-active bg-[#332200] border-2 border-[#ffd700] text-[#ffd700] shadow-sm'
                : 'text-[#888] hover:text-white'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>CREATE TABLE</span>
            </button>

            <button
              type="button"
              onClick={() => setTabMode('join')}
              className={`welcome-tab-btn py-1.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${tabMode === 'join'
                ? 'welcome-tab-join-active bg-[#002233] border-2 border-[#38bdf8] text-[#55ffff] shadow-sm'
                : 'text-[#888] hover:text-white'
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
                <label className="block text-[11px] font-mono font-bold text-[#ffd700] uppercase mb-1">
                  Table Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Alpha Devs, Cloud Titans, Table 1..."
                  className="w-full bg-[#111] border-2 border-[#555] text-white px-3 py-1.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#ffd700] transition-colors"
                  required
                />

                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[9px] text-[#888] font-mono">Quick Pick:</span>
                  {TEAM_SUGGESTIONS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTeamName(preset)}
                      className={`quick-pick-btn text-[9px] font-mono px-2 py-0.5 border transition-all cursor-pointer ${teamName === preset
                        ? 'quick-pick-active bg-[#332200] border-[#ffd700] text-[#ffd700]'
                        : 'bg-[#222] border-[#444] text-[#ccc] hover:border-[#666]'
                        }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gamer Tag */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-[#ffd700] uppercase mb-1 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-[#ffd700]" />
                  <span>Your Name (Gamer Tag)</span>
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerNameState(e.target.value)}
                  placeholder="e.g. Riks, Wayne, Kent..."
                  className="w-full bg-[#111] border-2 border-[#555] text-white px-3 py-1.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#ffd700] transition-colors"
                  required
                />
              </div>

              {/* Table Size */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-[#ffd700] uppercase mb-1">
                  Team Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setPlayerCount(cnt)}
                      className={`mc-btn py-1 text-[11px] font-mono cursor-pointer ${playerCount === cnt ? 'mc-btn-green text-white font-bold' : ''
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
                  className="mc-btn mc-btn-green w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-xl tracking-wider"
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
                <label className="block text-[11px] font-mono font-bold text-[#55ffff] uppercase mb-1 text-center">
                  ENTER 4-CHARACTER GAME PIN
                </label>
                <input
                  type="text"
                  value={joinPin}
                  onChange={(e) => setJoinPin(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="e.g. 7B2K"
                  className="w-full bg-[#0b1626] border-2 border-[#38bdf8] text-[#ffd700] text-center text-lg sm:text-xl font-mono font-bold py-2 tracking-[0.3em] uppercase focus:outline-none focus:ring-2 focus:ring-[#55ffff] transition-all shadow-inner"
                  autoFocus
                  required
                />
              </div>

              {/* Live Table Detection Badge */}
              <div className="min-h-[38px] flex items-center justify-center">
                {pinLookup.loading && (
                  <span className="text-[10px] font-mono text-[#8e98ad] animate-pulse">
                    Connecting to table realm...
                  </span>
                )}

                {!pinLookup.loading && pinLookup.found && pinLookup.data && (
                  <div className="w-full p-2 bg-[#0c2415] border border-[#22c55e] text-[#86efac] text-xs font-mono flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2 truncate">
                      <ShieldCheck className="w-4 h-4 text-[#22c55e] shrink-0" />
                      <div className="truncate">
                        <strong className="text-white block truncate">{pinLookup.data.team_name}</strong>
                        <span className="text-[10px] text-[#86efac]">
                          Stage {pinLookup.data.current_stage}/11 • {pinLookup.data.active_players} online
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-[#14532d] text-white px-2 py-0.5 border border-[#22c55e]">
                      READY
                    </span>
                  </div>
                )}

                {!pinLookup.loading && !pinLookup.found && pinLookup.message && joinPin.trim().length >= 3 && (
                  <div className="w-full p-2 bg-[#2d0e0e] border border-[#ef4444] text-[#fca5a5] text-xs font-mono flex items-center gap-2 shadow-sm">
                    <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
                    <span className="text-[10px]">
                      {pinLookup.message}. Ask your teammate for their screen PIN.
                    </span>
                  </div>
                )}
              </div>

              {/* Gamer Tag */}
              <div>
                <label className="block text-[11px] font-mono font-bold text-[#ffd700] uppercase mb-1 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-[#ffd700]" />
                  <span>Your Name (Gamer Tag)</span>
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerNameState(e.target.value)}
                  placeholder="e.g. Riks, Wayne, Kent..."
                  className="w-full bg-[#111] border-2 border-[#555] text-white px-3 py-1.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#ffd700] transition-colors"
                  required
                />
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={!pinLookup.found || !playerName.trim()}
                  className="mc-btn mc-btn-green w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-xl tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Users className="w-4 h-4" />
                  <span>ENTER TABLE ({pinLookup.data?.team_name || joinPin || 'SQUAD'}) ➔</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[9px] font-mono text-[#888] shrink-0 py-1 flex items-center justify-center gap-2 relative z-10">
        <span>Developer Day Workshop Edition • Real-Time 3D Voxel AIDLC Simulation</span>
        <span>•</span>
        <button
          type="button"
          onClick={resetQuotePositions}
          title="Reset all quotes back to initial positions"
          className="text-[#ffd700]/70 hover:text-[#ffd700] underline cursor-pointer"
        >
          [Reset Quotes]
        </button>
        <span>•</span>
        <a href="/admin" className="text-[#666] hover:text-[#ffd700] underline transition-colors cursor-pointer">
          [GM Console]
        </a>
      </footer>
    </div>
  );
}
