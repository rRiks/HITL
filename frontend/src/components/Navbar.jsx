import React, { useState } from 'react';
import {
  Clock,
  Volume2,
  VolumeX,
  Music,
  Pause,
  Play,
  RotateCcw,
  Activity,
  Zap,
  Share2,
  Check,
  User,
} from 'lucide-react';
import { getPlayerName } from '../services/api';

export default function Navbar({
  roomId = 'table-1',
  stageNumber = 1,
  totalStages = 11,
  stageTitle = '',
  teamName = 'Alpha Devs',
  health = 100,
  timeLeft = 120,
  isTimerRunning = true,
  onToggleTimer,
  onResetGame,
  soundEnabled = true,
  onToggleSound,
  musicEnabled = true,
  onToggleMusic,
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyInvite = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('room', roomId);
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

  // Health color
  const healthGradient =
    health > 60
      ? 'from-emerald-600 to-teal-600 text-emerald-700'
      : health > 30
      ? 'from-amber-600 to-orange-600 text-amber-700'
      : 'from-rose-600 to-red-600 text-rose-700 animate-pulse';

  return (
    <header className="h-[62px] bg-[#fbf9f4]/95 border-b border-[#e2dacf] px-2.5 sm:px-4 flex items-center justify-between gap-2 sm:gap-3 shrink-0 select-none z-30 shadow-xs backdrop-blur-md">
      {/* Left: Branding & 11-Stage Circuit Nodes */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-700 flex items-center justify-center shadow-md shadow-amber-600/20 font-black text-white text-base shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-stone-900 text-xs sm:text-sm tracking-wider">HITL JENGA</span>
              <span className="hidden md:inline text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#eee7d8] text-stone-800 border border-[#ded5c3]">
                SDLC WAR-ROOM
              </span>
              <button
                onClick={handleCopyInvite}
                title="Copy room link for teammates to join this 3D tower"
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-xs"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3 text-amber-700" />}
                <span>{roomId}</span>
                <span className="hidden lg:inline text-[9px] text-amber-700">{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
            <div className="text-[10px] text-stone-500 font-mono flex items-center gap-2">
              <span className="flex items-center gap-1 truncate max-w-[100px] sm:max-w-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>TEAM: <strong className="text-stone-800">{teamName}</strong></span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-100/80 text-amber-900 border border-amber-300 font-bold text-[9px]">
                <User className="w-2.5 h-2.5 text-amber-700" />
                <span>{getPlayerName()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 11-Stage Circuit Progression Pipeline */}
        <div className="hidden xl:flex items-center gap-1 ml-3 pl-3 border-l border-[#e2dacf]">
          {Array.from({ length: totalStages }).map((_, i) => {
            const stgNum = i + 1;
            const isCompleted = stgNum < stageNumber;
            const isCurrent = stgNum === stageNumber;

            return (
              <div
                key={i}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                  isCurrent
                    ? 'bg-amber-100 text-amber-900 border border-amber-400 shadow-sm animate-pulse'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-[#ede6d8] text-stone-500 border border-[#ded5c5]'
                }`}
              >
                <span>{stgNum}</span>
                {isCurrent && <span className="text-[9px] uppercase tracking-wider">ACTIVE</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Center: Real-Time Application Health EKG (Full bar on sm+, compact badge on mobile) */}
      <div className="hidden sm:flex items-center gap-2.5 sm:gap-3 bg-[#f5efe3] border border-[#e0d7c6] rounded-xl px-2.5 sm:px-3.5 py-1 min-w-[140px] sm:min-w-[180px] max-w-[240px] shadow-inner">
        <Activity className={`w-4 h-4 shrink-0 ${health > 30 ? 'text-emerald-600' : 'text-rose-600 animate-bounce'}`} />
        <div className="flex-1">
          <div className="flex justify-between items-center text-[10px] font-mono mb-0.5">
            <span className="text-stone-600 uppercase tracking-wider font-semibold">Health</span>
            <span className={`font-black ${healthGradient}`}>{health}%</span>
          </div>
          <div className="w-full bg-[#e3dcce] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${healthGradient} transition-all duration-500 rounded-full`}
              style={{ width: `${Math.max(0, Math.min(100, health))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mobile Compact Health Badge */}
      <div className="flex sm:hidden items-center gap-1 bg-[#f5efe3] border border-[#e0d7c6] rounded-xl px-2 py-1 shadow-inner">
        <Activity className={`w-3.5 h-3.5 shrink-0 ${health > 30 ? 'text-emerald-600' : 'text-rose-600 animate-bounce'}`} />
        <span className={`font-mono text-xs font-black ${healthGradient}`}>{health}%</span>
      </div>

      {/* Right: Chronometer Timer [02:00] & Cyber Audio Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Prominent Stage Chronometer */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-xl border font-mono transition-all duration-300 ${
            isUrgent
              ? 'bg-rose-100 border-rose-400 text-rose-800 animate-pulse shadow-md shadow-rose-500/20'
              : isZero
              ? 'bg-rose-200 border-rose-500 text-rose-900 animate-bounce'
              : 'bg-white border-[#ded5c5] text-stone-900 shadow-xs'
          }`}
        >
          <Clock className={`w-4 h-4 ${isUrgent ? 'text-rose-600 animate-spin' : 'text-amber-700'}`} />
          <div className="leading-none">
            <span className="text-[9px] uppercase tracking-wider text-stone-500 block font-semibold">
              Time Left
            </span>
            <span className={`text-lg font-black tracking-widest ${isUrgent ? 'text-rose-700' : 'text-stone-900'}`}>
              {formattedTime}
            </span>
          </div>

          <button
            onClick={onToggleTimer}
            title={isTimerRunning ? 'Pause Timer' : 'Resume Timer'}
            className="p-1 hover:bg-stone-100 rounded text-stone-500 hover:text-stone-900 transition-colors cursor-pointer ml-1"
          >
            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
          </button>
        </div>

        {/* Tension Music Toggle */}
        <button
          onClick={onToggleMusic}
          title={musicEnabled ? 'Mute Tension Music' : 'Enable Tension Music'}
          className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1 transition-all cursor-pointer ${
            musicEnabled
              ? 'bg-[#eee7d8] border-[#ded5c5] text-stone-800 shadow-xs'
              : 'bg-white border-[#ded5c5] text-stone-400'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[10px] font-bold">SYNTH</span>
        </button>

        {/* Audio FX Toggle */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute FX' : 'Enable FX'}
          className={`p-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-white border-[#ded5c5] text-stone-800 hover:text-stone-950 shadow-xs'
              : 'bg-white border-[#ded5c5] text-stone-400'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Reset Game */}
        <button
          onClick={onResetGame}
          title="Reset SDLC"
          className="p-2 rounded-xl bg-white border border-[#ded5c5] hover:bg-rose-50 hover:border-rose-300 text-stone-600 hover:text-rose-700 transition-all cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
