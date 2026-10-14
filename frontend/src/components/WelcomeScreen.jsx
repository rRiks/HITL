import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { getPlayerName, setPlayerName, lookupTableCode } from '../services/api';
import CockpitFieldGuide from './CockpitFieldGuide';

const TEAM_SUGGESTIONS = [
  'Alpha Devs',
  'Byte Busters',
  'Apex SREs',
  'Cloud Titans',
];

export default function WelcomeScreen({ onStartGame, onJoinLiveTable, defaultRoomId, onOpenGuide }) {
  // If defaultRoomId is passed and looks like a code or room id, default to join
  const [tabMode, setTabMode] = useState(() => {
    return defaultRoomId ? 'join' : 'create';
  });

  // Create Mode state
  const [teamName, setTeamName] = useState('Cloud Titans');
  const [playerCount, setPlayerCount] = useState(4);

  // Join Mode state
  const [joinPin, setJoinPin] = useState(() => (defaultRoomId || '').toUpperCase());
  const [pinLookup, setPinLookup] = useState({ loading: false, found: false, data: null, message: null });

  // Player Gamer Tag (Shared)
  const [playerName, setPlayerNameState] = useState(getPlayerName() || 'Dev');

  // Keep URL strictly as /home on welcome screen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (window.location.pathname !== '/home' || window.location.search) {
          window.history.replaceState({}, '', '/home');
        }
      } catch {}
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
    const finalPlayer = (playerName || '').trim() || 'Dev';
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
    const finalPlayer = (playerName || '').trim() || 'Dev';
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
    <div className="h-screen max-h-screen overflow-hidden bg-mc-dirt text-white flex flex-col justify-between py-2 sm:py-3 px-3 sm:px-6 select-none">
      <div className="max-w-lg mx-auto w-full my-auto flex flex-col justify-center">
        {/* Minecraft Title Header & Yellow Splash Text */}
        <div className="text-center mb-2 sm:mb-3 relative shrink-0">
          <div className="relative inline-block mb-1 sm:mb-2">
            <h1 className="text-2xl sm:text-4xl font-black tracking-widest text-[#e0e0e0] mc-font drop-shadow-[0_4px_0_#222]">
              MINECRAFT <span className="text-[#ffd700]">AIDLC</span>
            </h1>
            <div
              className="absolute -bottom-2.5 -right-3 sm:-right-6 text-[10px] sm:text-xs text-[#ffff00] font-mono font-bold drop-shadow-[0_2px_0_#000] rotate-[-12deg] animate-bounce pointer-events-none whitespace-nowrap z-10"
              style={{ animationDuration: '0.9s' }}
            >
              Don't dig into Governor limits!
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-[#ccc] max-w-lg mx-auto leading-snug mt-1 font-mono">
            Balance sprint velocity, code quality, and the stability of your <strong>3D Voxel Tower</strong> across 11 high-pressure stages.
          </p>
        </div>

        {/* Start Adventure Card */}
        <div className="mc-panel-dark p-4 sm:p-5 shadow-2xl border-4 border-[#333]">
          {/* Kahoot/Jackbox Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-3 bg-[#111] p-1 border-2 border-[#444]">
            <button
              type="button"
              onClick={() => setTabMode('create')}
              className={`py-1.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                tabMode === 'create'
                  ? 'bg-[#332200] border-2 border-[#ffd700] text-[#ffd700] shadow-sm'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>CREATE TABLE</span>
            </button>

            <button
              type="button"
              onClick={() => setTabMode('join')}
              className={`py-1.5 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                tabMode === 'join'
                  ? 'bg-[#002233] border-2 border-[#38bdf8] text-[#55ffff] shadow-sm'
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
                      className={`text-[9px] font-mono px-2 py-0.5 border transition-all cursor-pointer ${
                        teamName === preset
                          ? 'bg-[#332200] border-[#ffd700] text-[#ffd700]'
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
                  placeholder="e.g. Dev, Steve, Alex..."
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
                      className={`mc-btn py-1 text-[11px] font-mono cursor-pointer ${
                        playerCount === cnt ? 'mc-btn-green text-white font-bold' : ''
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
                  placeholder="e.g. Dev, Alex, Jordan..."
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
      <footer className="text-center text-[9px] font-mono text-[#888] shrink-0 py-1 flex items-center justify-center gap-2">
        <span>Developer Day Workshop Edition • Real-Time 3D Voxel AIDLC Simulation</span>
        <span>•</span>
        <a href="/admin" className="text-[#666] hover:text-[#ffd700] underline transition-colors cursor-pointer">
          [GM Console]
        </a>
      </footer>
    </div>
  );
}
