import React, { useState, useEffect, useRef } from 'react';
import { Flame, Skull, Bomb, Rocket, Siren, Sparkles, Volume2, VolumeX } from 'lucide-react';
import * as api from '../services/api';

const MEME_REACTIONS = [
  { id: 'fire', emoji: '🔥', label: 'THIS IS FINE', sound: 'playAmbientPulse' },
  { id: 'skull', emoji: '💀', label: 'RIP PROD', sound: 'playBuzzer' },
  { id: 'clown', emoji: '🤡', label: 'WHO WROTE THIS?', sound: 'playWarning' },
  { id: 'bomb', emoji: '💣', label: 'SRE PANIC', sound: 'playCreeper' },
  { id: 'rocket', emoji: '🚀', label: 'YOLO MERGE', sound: 'playAirhorn' },
  { id: 'siren', emoji: '🚨', label: 'EMERGENCY', sound: 'playSiren' },
  { id: 'glitch', emoji: '👾', label: 'GLITCH', sound: 'playGlitch' },
];

export default function SoundboardReactions({
  roomId = 'default',
  sound,
  recentReactions = [],
  slapEvents = [],
  activeIncident = null,
}) {
  const [particles, setParticles] = useState([]);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState(false);
  const seenReactionsRef = useRef(new Set());
  const seenSlapsRef = useRef(new Set());

  // Trigger incoming teammate reactions
  useEffect(() => {
    if (!recentReactions || recentReactions.length === 0) return;
    recentReactions.forEach((r) => {
      if (!seenReactionsRef.current.has(r.id)) {
        seenReactionsRef.current.add(r.id);
        spawnFloatingParticle(r.emoji, r.label, r.player_name);
        
        // Play corresponding sound for teammate reaction
        const match = MEME_REACTIONS.find((m) => m.emoji === r.emoji);
        if (match && sound && sound[match.sound]) {
          try {
            sound[match.sound]();
          } catch {}
        }
      }
    });
  }, [recentReactions, sound]);

  // Trigger incoming slap events
  useEffect(() => {
    if (!slapEvents || slapEvents.length === 0) return;
    slapEvents.forEach((s) => {
      if (!seenSlapsRef.current.has(s.id)) {
        seenSlapsRef.current.add(s.id);
        spawnFloatingParticle('👋', `SLAP! ${s.slapper_name} slapped ${s.target_name}`, s.slapper_name);
        if (sound?.playSlap) {
          try {
            sound.playSlap();
          } catch {}
        }
      }
    });
  }, [slapEvents, sound]);

  const spawnFloatingParticle = (emoji, label, senderName) => {
    const id = `${Date.now()}_${Math.random()}`;
    const x = Math.floor(Math.random() * 60) + 20; // 20% to 80% screen width
    const rotation = Math.floor(Math.random() * 40) - 20; // -20deg to +20deg
    const newParticle = { id, emoji, label, senderName, x, rotation };
    
    setParticles((prev) => [...prev.slice(-12), newParticle]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 2800);
  };

  const handleSendReaction = async (reaction) => {
    // 1. Play sound instantly
    if (sound && sound[reaction.sound]) {
      try {
        sound[reaction.sound]();
      } catch {}
    }

    // 2. Spawn local particle
    spawnFloatingParticle(reaction.emoji, reaction.label, api.getPlayerName());

    // 3. Broadcast to backend
    try {
      await api.broadcastReaction(roomId, reaction.emoji, reaction.label);
    } catch {}
  };

  return (
    <>
      {/* 1. Flying Floating Emoji Particles */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              left: `${p.x}%`,
              transform: `rotate(${p.rotation}deg)`,
            }}
            className="absolute bottom-16 animate-float-up-fade flex flex-col items-center pointer-events-none drop-shadow-2xl"
          >
            <span className="text-4xl sm:text-5xl filter drop-shadow-lg select-none">{p.emoji}</span>
            <div className="bg-slate-900/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-slate-700/80 shadow-md backdrop-blur-sm whitespace-nowrap mt-1">
              <span className="text-amber-400 mr-1">{p.senderName}:</span>
              <span>{p.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Floating Soundboard Launcher Pill */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 select-none">
        {isSoundboardOpen && (
          <div className="p-2 bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl backdrop-blur-xl animate-fadeIn flex flex-col gap-1.5 w-60">
            <div className="flex items-center justify-between px-2 py-1 border-b border-[var(--border-subtle)]">
              <span className="text-[10px] font-mono font-bold text-amber-500 flex items-center gap-1 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>WAR-ROOM SOUNDBOARD</span>
              </span>
              <button
                type="button"
                onClick={() => setIsSoundboardOpen(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {MEME_REACTIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleSendReaction(r)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-elevated)] hover:bg-slate-700/30 border border-[var(--border-subtle)] text-left cursor-pointer transition-all active:scale-95 group shadow-xs"
                >
                  <span className="text-lg group-hover:scale-125 transition-transform">{r.emoji}</span>
                  <span className="text-[9.5px] font-mono font-bold leading-tight truncate text-[var(--text-primary)]">
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsSoundboardOpen((prev) => !prev)}
          title="Open Meme Soundboard & Reactions"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-900/90 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-mono text-xs font-bold shadow-lg border border-slate-700 dark:border-white cursor-pointer backdrop-blur-md active:scale-95 transition-all"
        >
          <span className="text-base">📢</span>
          <span className="text-[11px] hidden sm:inline">SOUNDBOARD</span>
        </button>
      </div>
    </>
  );
}
