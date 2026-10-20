import React from 'react';
import { Clock, Heart, Shield, Volume2, VolumeX, Music, Home, AlertTriangle, Flame } from 'lucide-react';

export default function SprintNavbarHUD({
  roomCode,
  teamName,
  stageNumber,
  totalStages,
  health,
  formattedClock,
  urgency,
  seniorDevTokens,
  soundEnabled,
  onToggleSound,
  musicEnabled,
  onToggleMusic,
  onExit,
}) {
  const getUrgencyBadge = () => {
    switch (urgency) {
      case 'overtime':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#4a0808] border border-[#ff3333] text-[#ff5555] text-[9px] mc-font animate-pulse">
            <Flame className="w-3 h-3 text-[#ff3333]" />
            <span>OVERTIME FATIGUE (-5% HP/30s)</span>
          </span>
        );
      case 'zero_hour':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#3a0808] border border-[#ffaa00] text-[#ff5555] text-[9px] mc-font animate-pulse">
            <AlertTriangle className="w-3 h-3 text-[#ff5555]" />
            <span>ZERO HOUR</span>
          </span>
        );
      case 'crunch':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#251f05] border border-[#ffd700] text-[#ffd700] text-[9px] mc-font">
            <span>SPRINT CRUNCH</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0e2a14] border border-[#55ff55] text-[#55ff55] text-[9px] mc-font">
            <span>ON TRACK</span>
          </span>
        );
    }
  };

  const getClockColor = () => {
    switch (urgency) {
      case 'overtime':
      case 'zero_hour':
        return 'text-[#ff3333] animate-pulse';
      case 'crunch':
        return 'text-[#ffd700]';
      default:
        return 'text-[#55ff55]';
    }
  };

  return (
    <header className="mc-panel-dark px-3 py-2 border-b-2 border-[#333] flex flex-wrap items-center justify-between gap-3 text-white select-none z-30">
      {/* Left: Squad & Stage */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="mc-btn px-2.5 py-1 text-[9px] mc-font text-[#aaa] hover:text-white flex items-center gap-1 cursor-pointer"
          title="Exit to Mode Selection"
        >
          <Home className="w-3.5 h-3.5 pointer-events-none" />
          <span className="hidden sm:inline pointer-events-none">Lobby</span>
        </button>

        <div className="border-l border-[#444] pl-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-[#ffd700] mc-font">
              {teamName || 'Sprint Squad'}
            </span>
            <span className="text-[9px] text-[#888] font-mono">[{roomCode}]</span>
          </div>
          <span className="text-[9px] mc-font text-[#aaa] block">
            STAGE {stageNumber} OF {totalStages}
          </span>
        </div>
      </div>

      {/* Center: 25-Minute Master Sprint Clock */}
      <div className="flex items-center gap-2.5 mx-auto bg-[#111] px-3.5 py-1 border-2 border-[#444] shadow-inner">
        <Clock className={`w-4 h-4 ${getClockColor()}`} />
        <div className="text-center">
          <div className={`text-base sm:text-lg font-bold mc-font tracking-wider ${getClockColor()}`}>
            {formattedClock}
          </div>
          <div className="text-[8px] mc-font text-[#777] uppercase tracking-wider">
            SPRINT DEADLINE
          </div>
        </div>
        <div className="hidden sm:block ml-1">{getUrgencyBadge()}</div>
      </div>

      {/* Right: Health, Senior Dev Tokens, Sound */}
      <div className="flex items-center gap-3">
        {/* Senior Dev Override Tokens */}
        <div
          className="px-2.5 py-1 bg-[#1a1c24] border border-[#48d1cc] text-[#48d1cc] text-[9.5px] mc-font flex items-center gap-1.5 shadow-sm"
          title="Senior Dev Manual Override Tokens remaining"
        >
          <span>👨‍💻 TOKENS:</span>
          <span className="font-bold text-white text-xs">{seniorDevTokens}/2</span>
        </div>

        {/* Health */}
        <div className="flex items-center gap-1.5 bg-[#1a0e0e] border border-[#ff5555] px-2.5 py-1">
          <Heart className="w-3.5 h-3.5 text-[#ff5555] fill-[#ff3333]" />
          <span className="text-[10px] mc-font font-bold text-white">{health}%</span>
        </div>

        {/* Audio Toggles */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleSound}
            className="mc-btn p-1.5 text-[#aaa] hover:text-white cursor-pointer"
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-[#ff5555]" />}
          </button>
          <button
            type="button"
            onClick={onToggleMusic}
            className="mc-btn p-1.5 text-[#aaa] hover:text-white cursor-pointer"
            title={musicEnabled ? 'Mute Music' : 'Enable Music'}
          >
            <Music className={`w-3.5 h-3.5 ${musicEnabled ? 'text-[#55ff55]' : 'text-[#888]'}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
