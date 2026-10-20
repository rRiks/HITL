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
    <header className="px-3 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] backdrop-blur flex flex-wrap items-center justify-between gap-3 text-[var(--text-primary)] select-none z-30 transition-colors">
      {/* Left: Squad & Stage */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="px-2.5 py-1 text-xs font-bold font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
          title="Exit to Mode Selection"
        >
          <Home className="w-3.5 h-3.5 pointer-events-none" />
          <span className="hidden sm:inline pointer-events-none">Lobby</span>
        </button>

        <div className="border-l border-[var(--border-subtle)] pl-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-300 font-theme-heading">
              {teamName || 'Sprint Squad'}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">[{roomCode}]</span>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-secondary)] block font-semibold">
            STAGE {stageNumber} OF {totalStages}
          </span>
        </div>
      </div>

      {/* Center: 25-Minute Master Sprint Clock */}
      <div className="flex items-center gap-2.5 mx-auto bg-[var(--bg-elevated)] px-3.5 py-1 border border-[var(--border-subtle)] rounded-full shadow-inner">
        <Clock className={`w-4 h-4 ${getClockColor()}`} />
        <div className="text-center">
          <div className={`text-base sm:text-lg font-bold font-mono tracking-wider ${getClockColor()}`}>
            {formattedClock}
          </div>
          <div className="text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider">
            SPRINT DEADLINE
          </div>
        </div>
        <div className="hidden sm:block ml-1">{getUrgencyBadge()}</div>
      </div>

      {/* Right: Health, Senior Dev Tokens, Sound */}
      <div className="flex items-center gap-3">
        {/* Senior Dev Override Tokens */}
        <div
          className="px-2.5 py-1 bg-sky-500/15 border border-sky-500/35 text-sky-700 dark:text-sky-300 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
          title="Senior Dev Manual Override Tokens remaining"
        >
          <span>👨‍💻 TOKENS:</span>
          <span className="font-bold text-[var(--text-primary)]">{seniorDevTokens}/2</span>
        </div>

        {/* Health */}
        <div className="flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/35 px-2.5 py-1 rounded-lg">
          <Heart className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 fill-rose-500" />
          <span className="text-xs font-mono font-bold text-[var(--text-primary)]">{health}%</span>
        </div>

        {/* Audio Toggles */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleSound}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg cursor-pointer transition-colors"
            title={soundEnabled ? 'Mute SFX' : 'Enable SFX'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-500" />}
          </button>
          <button
            type="button"
            onClick={onToggleMusic}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg cursor-pointer transition-colors"
            title={musicEnabled ? 'Mute Music' : 'Enable Music'}
          >
            <Music className={`w-3.5 h-3.5 ${musicEnabled ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
