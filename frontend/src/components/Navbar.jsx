import React, { useState } from 'react';
import {
  Clock,
  Volume2,
  VolumeX,
  Music,
  Sun,
  Moon,
  RotateCcw,
  Share2,
  Check,
  User,
  Home,
  BookOpen,
} from 'lucide-react';
import { getPlayerName } from '../services/api';

/**
 * Pixel-perfect 9x9 Minecraft Heart
 */
function MinecraftHeart({ state = 'full', shake = false }) {
  return (
    <svg
      viewBox="0 0 9 8"
      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${shake ? 'animate-bounce' : ''}`}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
    >
      {/* Black Outline */}
      <rect x="1" y="0" width="2" height="1" fill="#000" />
      <rect x="5" y="0" width="2" height="1" fill="#000" />
      <rect x="0" y="1" width="1" height="2" fill="#000" />
      <rect x="3" y="1" width="2" height="1" fill="#000" />
      <rect x="7" y="1" width="1" height="2" fill="#000" />
      <rect x="0" y="3" width="1" height="1" fill="#000" />
      <rect x="7" y="3" width="1" height="1" fill="#000" />
      <rect x="1" y="4" width="1" height="1" fill="#000" />
      <rect x="6" y="4" width="1" height="1" fill="#000" />
      <rect x="2" y="5" width="1" height="1" fill="#000" />
      <rect x="5" y="5" width="1" height="1" fill="#000" />
      <rect x="3" y="6" width="2" height="1" fill="#000" />
      <rect x="3" y="7" width="2" height="1" fill="#000" />

      {/* Background / Inner Fill */}
      {state === 'empty' && (
        <>
          <rect x="1" y="1" width="2" height="3" fill="#3a1010" />
          <rect x="5" y="1" width="2" height="3" fill="#3a1010" />
          <rect x="3" y="2" width="2" height="2" fill="#3a1010" />
          <rect x="2" y="4" width="4" height="1" fill="#3a1010" />
          <rect x="3" y="5" width="2" height="1" fill="#3a1010" />
        </>
      )}

      {state === 'half' && (
        <>
          {/* Left half: Red */}
          <rect x="1" y="1" width="2" height="3" fill="#e52521" />
          <rect x="3" y="2" width="1" height="2" fill="#e52521" />
          <rect x="2" y="4" width="2" height="1" fill="#e52521" />
          <rect x="3" y="5" width="1" height="1" fill="#e52521" />
          {/* White glint */}
          <rect x="1" y="1" width="1" height="1" fill="#ffffff" />
          {/* Right half: Dark empty */}
          <rect x="5" y="1" width="2" height="3" fill="#3a1010" />
          <rect x="4" y="2" width="1" height="2" fill="#3a1010" />
          <rect x="4" y="4" width="2" height="1" fill="#3a1010" />
          <rect x="4" y="5" width="1" height="1" fill="#3a1010" />
        </>
      )}

      {state === 'full' && (
        <>
          {/* Full Red */}
          <rect x="1" y="1" width="2" height="3" fill="#e52521" />
          <rect x="5" y="1" width="2" height="3" fill="#e52521" />
          <rect x="3" y="2" width="2" height="2" fill="#e52521" />
          <rect x="2" y="4" width="4" height="1" fill="#e52521" />
          <rect x="3" y="5" width="2" height="1" fill="#e52521" />
          {/* White highlight dot */}
          <rect x="1" y="1" width="1" height="1" fill="#ffffff" />
          {/* Dark shade bottom right */}
          <rect x="5" y="3" width="1" height="1" fill="#990000" />
          <rect x="4" y="4" width="1" height="1" fill="#990000" />
        </>
      )}
    </svg>
  );
}

function Navbar({
  roomId = 'table-1',
  roomCode = null,
  stageNumber = 1,
  totalStages = 11,
  stageTitle = '',
  teamName = 'Alpha Devs',
  health = 100,
  timeLeft = 120,
  isTimerRunning = true,
  onResetGame,
  onExitToLobby,
  soundEnabled = true,
  onToggleSound,
  musicEnabled = true,
  onToggleMusic,
  onOpenFieldGuide,
  isSpectator = false,
  theme = 'dark',
  onToggleTheme,
  isTimerPaused = false,
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  const displayPin = (roomCode || roomId || '').toUpperCase();

  const handleCopyInvite = () => {
    try {
      const code = roomCode || roomId;
      const url = new URL(window.location.origin + '/');
      url.searchParams.set('code', code);
      navigator.clipboard.writeText(url.toString());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch { }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = timeLeft <= 30 && timeLeft > 0;
  const isZero = timeLeft === 0;

  // 10 Minecraft Hearts calculation
  // Each heart represents 10% health
  const hearts = Array.from({ length: 10 }).map((_, i) => {
    const heartVal = (i + 1) * 10;
    if (health >= heartVal) return 'full';
    if (health >= heartVal - 5) return 'half';
    return 'empty';
  });

  const isLowHealth = health <= 25;

  return (
    <header className="h-[48px] sm:h-[52px] md:h-[56px] w-full overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] backdrop-blur px-3 lg:px-5 shrink-0 select-none z-30 shadow-sm text-[var(--text-primary)] transition-colors duration-200">
      <div className="w-full h-full flex items-center justify-between gap-1.5 sm:gap-3">
        {/* 1. Left Cluster: Session Identity */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center text-xs sm:text-sm shadow-xs shrink-0">
              ⛏️
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-bold text-[var(--text-primary)] text-[11px] sm:text-xs tracking-wider font-mono shrink-0">
                HITL MINECRAFT
              </span>
              <span className="hidden md:inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                {teamName}
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                <User className="w-2.5 h-2.5 text-amber-500 dark:text-amber-400" />
                <span>{getPlayerName()}</span>
              </span>
              <button
                type="button"
                onClick={handleCopyInvite}
                title="Copy realm link or PIN for teammates"
                className="text-[10px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-800 dark:text-amber-300 border border-amber-500/40 flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-all shadow-xs"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-700 dark:text-emerald-400 font-bold" /> : <Share2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-700 dark:text-amber-400" />}
                <span className="hidden xs:inline">PIN: </span><span>{displayPin}</span>
                {copiedLink && <span className="text-[9px] text-emerald-800 dark:text-emerald-400 font-bold hidden sm:inline">COPIED</span>}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Center Cluster: Unified Stakes & Urgency (Wave + Health + Timer) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-inner shrink-0 text-[var(--text-primary)]">
          {/* Wave Progress */}
          <div className="flex items-center gap-1 font-mono text-[11px] sm:text-xs font-bold text-amber-800 dark:text-amber-300">
            <span className="text-[var(--text-secondary)] font-sans text-[10px] sm:text-[11px] uppercase tracking-wider font-bold hidden xs:inline">Wave</span>
            <span>{stageNumber}/{totalStages}</span>
          </div>

          <div className="w-px h-3 sm:h-3.5 bg-[var(--border-subtle)] shrink-0" />

          {/* Health & Stability */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* On mobile screens show 5 representative hearts or compact indicator; on sm+ show all 10 */}
            <div className="hidden sm:flex items-center gap-0.5">
              {hearts.map((state, idx) => (
                <MinecraftHeart key={idx} state={state} shake={isLowHealth} />
              ))}
            </div>
            <div className="flex sm:hidden items-center gap-0.5">
              {hearts.slice(0, 5).map((state, idx) => (
                <MinecraftHeart key={idx} state={state} shake={isLowHealth} />
              ))}
            </div>
            <span className={`text-[11px] sm:text-xs font-mono font-bold ${health > 60 ? 'text-emerald-800 dark:text-emerald-400' : health > 30 ? 'text-amber-800 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400 animate-pulse'
              }`}>
              {health}%
            </span>
          </div>

          <div className="w-px h-3 sm:h-3.5 bg-[var(--border-subtle)] shrink-0" />

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-1 sm:gap-1.5 font-mono text-[11px] sm:text-xs font-bold transition-colors ${isTimerPaused
                ? 'text-amber-600 dark:text-amber-400 animate-pulse'
                : isUrgent
                  ? 'text-rose-600 dark:text-rose-400 animate-pulse font-black'
                  : isZero
                    ? 'text-rose-700 dark:text-rose-500 animate-bounce'
                    : 'text-[var(--text-primary)]'
              }`}
            title={isTimerPaused ? 'Game Master paused the countdown timer' : 'Stage countdown timer'}
          >
            <Clock className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${isTimerPaused ? 'text-amber-600 dark:text-amber-400' : isUrgent ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-[var(--text-secondary)]'}`} />
            <span>{formattedTime}</span>
            {isTimerPaused && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40 hidden xs:inline font-bold">
                PAUSED
              </span>
            )}
          </div>
        </div>

        {/* 3. Right Cluster: Utilities Toolbar */}
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {/* Music Synth Toggle */}
          <button
            type="button"
            onClick={onToggleMusic}
            title={musicEnabled ? 'Mute Atmosphere Music' : 'Enable Atmosphere Music'}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md p-1 sm:p-1.5 transition-colors cursor-pointer"
          >
            <Music className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${musicEnabled ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-[var(--text-secondary)]'}`} />
          </button>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md p-1 sm:p-1.5 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-secondary)]" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-muted)]" />}
          </button>

          {/* Theme Toggle (Light / Dark Realm) */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={theme === 'light' ? 'Switch to Dark Realm' : 'Switch to Light Realm'}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-md p-1 sm:p-1.5 transition-colors cursor-pointer"
            >
              {theme === 'light' ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
              )}
            </button>
          )}

          {/* Reset HITL / World (Hidden for Spectators) */}
          {!isSpectator && onResetGame && (
            <button
              type="button"
              onClick={onResetGame}
              title="Respawn / Reset World"
              className="text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-md p-1 sm:p-1.5 transition-colors cursor-pointer hidden xs:inline-flex"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          {/* In-Game Cockpit Field Guide (Manual & Rules) */}
          {onOpenFieldGuide && (
            <button
              type="button"
              onClick={onOpenFieldGuide}
              title="Open Interactive Cockpit Field Guide (Help & Rules Manual)"
              className="text-[var(--text-muted)] hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-cyan-500/10 rounded-md p-1 sm:p-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

          {/* Exit to Lobby / Return to Admin */}
          {onExitToLobby && (
            <button
              type="button"
              onClick={onExitToLobby}
              title={isSpectator ? "Return to Admin Panel" : "Return to Main Menu"}
              className="text-[var(--text-muted)] hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-500/10 rounded-md p-1 sm:p-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default React.memo(Navbar);
