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

export default function Navbar({
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
    } catch {}
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
    <header className="h-[64px] w-full max-w-full overflow-hidden bg-[#1c1c1c] border-b-4 border-[#101010] px-2 sm:px-3 flex items-center justify-between gap-1.5 sm:gap-2 shrink-0 select-none z-30 shadow-lg text-white">
      {/* Left: Branding & 11-Stage Circuit Nodes */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#3c3c3c] border-2 border-[#555] flex items-center justify-center shadow-md text-base shrink-0">
            ⛏️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[#ffd700] text-xs sm:text-sm tracking-wider mc-font">
                HITL MINECRAFT
              </span>
              <span className="hidden md:inline text-[8px] mc-font px-1.5 py-0.5 bg-[#2a2a2a] text-[#aaa] border border-[#444]">
                WORLD AIDLC
              </span>
              <button
                onClick={handleCopyInvite}
                title="Copy realm link or PIN for teammates"
                className="text-[8px] mc-font px-2 py-0.5 bg-[#2a1d0d] hover:bg-[#3a2812] text-[#ffd700] border-2 border-[#ffd700] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
              >
                {copiedLink ? <Check className="w-3 h-3 text-[#55ff55]" /> : <Share2 className="w-3 h-3 text-[#ffd700]" />}
                <span className="font-bold">PIN: {displayPin}</span>
                <span className="hidden lg:inline text-[8px] text-[#55ff55] font-bold">{copiedLink ? 'COPIED!' : 'SHARE'}</span>
              </button>
            </div>
            <div className="text-[9px] text-[#aaa] mc-font flex items-center gap-2 mt-0.5">
              <span className="flex items-center gap-1 truncate max-w-[100px] sm:max-w-none">
                <span className="w-1.5 h-1.5 bg-[#55ff55] animate-pulse shrink-0 inline-block" />
                <span>REALM: <strong className="text-white">{teamName}</strong></span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 bg-[#2d241e] text-[#ffaa00] border border-[#553311] text-[8px]">
                <User className="w-2.5 h-2.5 text-[#ffd700]" />
                <span>{getPlayerName()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Compact 11-Segment Stage Progression Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-[#15120e] border border-[#ffaa00]/40 shrink-0">
          <span className="text-[9px] mc-font text-[#ffd700] whitespace-nowrap">LV{stageNumber}/{totalStages}</span>
          <div className="hidden sm:flex items-center gap-0.5">
            {Array.from({ length: totalStages }).map((_, i) => {
              const stgNum = i + 1;
              const isCompleted = stgNum < stageNumber;
              const isCurrent = stgNum === stageNumber;

              return (
                <div
                  key={i}
                  title={`Stage ${stgNum}`}
                  className={`w-2 h-3.5 border transition-all ${
                    isCurrent
                      ? 'bg-[#ffd700] border-[#ffffff] shadow-sm animate-pulse'
                      : isCompleted
                      ? 'bg-[#55ff55] border-[#2d5a2d]'
                      : 'bg-[#2a2a2a] border-[#444]'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Center: Authentic 10 Minecraft Hearts Bar */}
      <div className="hidden md:flex items-center gap-2 bg-[#121212] border-2 border-[#333] px-2 sm:px-2.5 py-1 shadow-inner shrink-0">
        <div className="flex items-center gap-0.5">
          {hearts.map((state, idx) => (
            <MinecraftHeart key={idx} state={state} shake={isLowHealth} />
          ))}
        </div>
        <span className={`text-[10px] mc-font font-bold ml-1 ${
          health > 60 ? 'text-[#55ff55]' : health > 30 ? 'text-[#ffaa00]' : 'text-[#ff5555] animate-pulse'
        }`}>
          {health}%
        </span>
      </div>

      {/* Right: Minecraft Timer & Audio / Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
        {/* Minecraft Clock Timer */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1 border-2 mc-font transition-all shrink-0 ${
            isTimerPaused
              ? 'bg-[#332200] border-[#ffd700] text-[#ffd700] animate-pulse shadow-md shadow-amber-900/40'
              : isUrgent
              ? 'bg-[#3a0000] border-[#ff3333] text-[#ff5555] animate-pulse shadow-md shadow-red-900/40'
              : isZero
              ? 'bg-[#550000] border-[#ff0000] text-[#ffffff] animate-bounce'
              : 'bg-[#252525] border-[#444] text-[#ffd700]'
          }`}
          title={isTimerPaused ? 'Game Master paused the countdown timer' : 'Stage countdown timer'}
        >
          <Clock className={`w-3.5 h-3.5 ${isTimerPaused ? 'text-[#ffd700]' : isUrgent ? 'text-[#ff5555] animate-spin' : 'text-[#ffd700]'}`} />
          <div className="leading-none flex items-center gap-1">
            <span className="text-xs sm:text-sm font-bold tracking-wider">
              {formattedTime}
            </span>
            {isTimerPaused && (
              <span className="hidden sm:inline-block text-[8px] bg-[#553300] px-1 py-0.2 border border-[#ffd700] text-[#ffd700] ml-0.5">
                PAUSED
              </span>
            )}
          </div>
        </div>

        {/* Music Synth Toggle */}
        <button
          onClick={onToggleMusic}
          title={musicEnabled ? 'Mute Atmosphere Music' : 'Enable Atmosphere Music'}
          className={`mc-btn p-1.5 text-xs flex items-center gap-1 cursor-pointer shrink-0 ${
            musicEnabled ? 'text-[#55ff55]' : 'text-[#888]'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-[8px] mc-font">NOTE</span>
        </button>

        {/* Sound FX Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          className={`mc-btn p-1.5 text-xs cursor-pointer shrink-0 ${
            soundEnabled ? 'text-white' : 'text-[#666]'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Theme Toggle (Light / Dark Realm) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            title={theme === 'light' ? 'Switch to Dark Realm' : 'Switch to Light Realm'}
            className="mc-btn p-1.5 text-xs flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
          >
            {theme === 'light' ? (
              <Sun className="w-3.5 h-3.5 text-[#d97706]" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-[#38bdf8]" />
            )}
          </button>
        )}

        {/* Reset AIDLC / World (Hidden for Spectators) */}
        {!isSpectator && onResetGame && (
          <button
            onClick={onResetGame}
            title="Respawn / Reset World"
            className="mc-btn p-1.5 text-xs text-[#ffaa00] hover:text-[#ff5555] cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* In-Game Cockpit Field Guide (Manual & Rules) */}
        {onOpenFieldGuide && (
          <button
            onClick={onOpenFieldGuide}
            title="Open Interactive Cockpit Field Guide (Help & Rules Manual)"
            className="mc-btn px-2.5 py-1 text-[8px] sm:text-[9px] mc-font text-[#55ffff] hover:text-white cursor-pointer flex items-center gap-1 shrink-0 bg-[#0c1c28] border-[#38bdf8]"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#55ffff]" />
            <span className="hidden sm:inline">GUIDE</span>
          </button>
        )}

        {/* Exit to Lobby / Return to Admin */}
        {onExitToLobby && (
          <button
            onClick={onExitToLobby}
            title={isSpectator ? "Return to Admin Panel" : "Return to Main Menu"}
            className="mc-btn px-2.5 py-1 text-[8px] sm:text-[9px] mc-font text-[#ffd700] hover:text-white cursor-pointer flex items-center gap-1 shrink-0 bg-[#3a2211] border-[#ffaa00]"
          >
            <Home className="w-3.5 h-3.5 text-[#ffd700]" />
            <span>{isSpectator ? "ADMIN" : "MENU"}</span>
          </button>
        )}
      </div>
    </header>
  );
}
