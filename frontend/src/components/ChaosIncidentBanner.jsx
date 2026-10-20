import React, { useState, useEffect } from 'react';
import { Siren, Zap, Flame, ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';
import * as api from '../services/api';

export default function ChaosIncidentBanner({
  roomId = 'default',
  incident,
  sound,
  onPurgeSuccess,
}) {
  const [purging, setPurging] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (!incident) {
      setSecondsRemaining(0);
      return;
    }
    const started = incident.started_at || Date.now() / 1000;
    const dur = incident.duration_seconds || 45;
    const updateTime = () => {
      const elapsed = Math.floor(Date.now() / 1000 - started);
      const rem = Math.max(0, dur - elapsed);
      setSecondsRemaining(rem);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [incident]);

  if (!incident || incident.purged || secondsRemaining <= 0) {
    return null;
  }

  const handlePurge = async () => {
    if (purging) return;
    setPurging(true);
    if (sound?.playGlitch) {
      try {
        sound.playGlitch();
      } catch {}
    }
    try {
      await api.purgeHallucination(roomId);
      if (sound?.playSuccess) {
        sound.playSuccess();
      }
      if (onPurgeSuccess) onPurgeSuccess();
    } catch (err) {
      console.error('Purge error:', err);
    } finally {
      setPurging(false);
    }
  };

  const isRogueAI = incident.type === 'rogue_ai';
  const isFriday = incident.type === 'friday_deploy';
  const isLeak = incident.type === 'memory_leak';

  return (
    <>
      {/* Full-Screen Emergency Strobe Border */}
      <div className="fixed inset-0 pointer-events-none z-30 border-4 border-rose-600/70 animate-pulse shadow-[inset_0_0_35px_rgba(225,29,72,0.4)]" />

      {/* Emergency Alert Banner */}
      <div className="relative z-30 bg-rose-950/95 border-y-2 border-rose-500 text-rose-100 py-1.5 px-3 sm:px-4 flex items-center justify-between gap-3 shadow-2xl backdrop-blur-md animate-fadeIn select-none">
        <div className="flex items-center gap-2.5 truncate">
          <div className="p-1 bg-rose-500 text-white rounded-lg animate-bounce">
            <Siren className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-mono font-black text-rose-300 tracking-wider">
                {incident.title}
              </span>
              <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200 border border-rose-400/50 font-bold">
                {secondsRemaining}s REMAINING
              </span>
            </div>
            <p className="text-[10px] font-sans text-rose-200/90 truncate hidden sm:block">
              {incident.description}
            </p>
          </div>
        </div>

        {/* Action Button: Purge for Rogue AI */}
        {isRogueAI && (
          <button
            type="button"
            disabled={purging}
            onClick={handlePurge}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[11px] font-black uppercase flex items-center gap-1.5 shadow-lg shadow-amber-500/30 cursor-pointer active:scale-95 transition-all shrink-0 animate-pulse"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${purging ? 'animate-spin' : ''}`} />
            <span>{purging ? 'SCRUBBING...' : 'PURGE HALLUCINATION'}</span>
          </button>
        )}
      </div>
    </>
  );
}
