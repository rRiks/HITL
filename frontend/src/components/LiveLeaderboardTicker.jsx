import React, { useState, useEffect } from 'react';
import { Trophy, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { fetchLeaderboard } from '../services/api';

export default function LiveLeaderboardTicker({
  currentRoomId = 'table-1',
  currentTeamName = 'Alpha Devs',
  currentHealth = 100,
  currentStage = 1,
  totalStages = 11,
  totalPulls = 0,
}) {
  const [leaderboardRooms, setLeaderboardRooms] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const loadLeaderboard = async () => {
      try {
        const data = await fetchLeaderboard();
        if (isMounted && data && Array.isArray(data.rooms)) {
          // Exclude our own room so we show competitors in ticker
          const others = data.rooms.filter((r) => r.room_id !== currentRoomId);
          setLeaderboardRooms(others);
        }
      } catch (err) {
        // Silently fall back to cached
      }
    };

    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentRoomId]);

  return (
    <div className="bg-[#f0ebe0] border-b border-[#ded7c8] px-3 py-1 flex items-center gap-3 overflow-hidden text-[11px] font-mono select-none">
      {/* Fixed label */}
      <div className="flex items-center gap-1.5 shrink-0 text-stone-800 font-bold bg-[#e3dbcd] px-2 py-0.5 rounded border border-[#cfc5b4] shadow-xs">
        <Trophy className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
        <span className="tracking-wider">WAR-ROOM LIVE RIVALRY</span>
      </div>

      {/* Marquee ticker container */}
      <div className="overflow-hidden flex-1 relative h-5">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          {/* Your team */}
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-amber-100 border border-amber-400 text-stone-900 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
            <span className="font-black text-amber-950">YOU [{currentTeamName} • {currentRoomId}]:</span>
            <span className="text-emerald-800 font-black">{currentHealth}% HP</span>
            <span className="text-stone-400">•</span>
            <span className="text-amber-900 font-bold">Stage {currentStage}/{totalStages}</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-700">{totalPulls} Lost</span>
          </div>

          {/* Competitors across tables */}
          {leaderboardRooms.map((team, idx) => (
            <div key={idx} className="inline-flex items-center gap-1.5 text-stone-700">
              <span className="text-stone-400">|</span>
              <span className="font-bold text-stone-900">{team.team_name}</span>
              <span className="text-[10px] text-stone-500 font-mono">({team.room_id})</span>
              {team.is_game_over || team.status === 'collapsed' ? (
                <span className="text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-300 text-[10px] font-bold flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5" /> COLLAPSED!
                </span>
              ) : team.is_victory || team.status === 'victorious' ? (
                <span className="text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300 text-[10px] font-bold flex items-center gap-1">
                  🏆 SURVIVED!
                </span>
              ) : (
                <>
                  <span className={`font-bold ${team.health > 70 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {team.health}%
                  </span>
                  <span className="text-stone-500 text-[10px]">Stg {team.current_stage}/{team.total_stages}</span>
                  {team.total_pulls > 0 && <span className="text-rose-600 text-[10px]">(-{team.total_pulls})</span>}
                </>
              )}
            </div>
          ))}

          {/* Repeat for continuous seamless loop */}
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-amber-100 border border-amber-400 text-stone-900">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span className="font-black text-amber-950">YOU [{currentTeamName}]:</span>
            <span className="text-emerald-800 font-bold">{currentHealth}% HP</span>
            <span className="text-amber-900 font-bold">Stage {currentStage}/{totalStages}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
