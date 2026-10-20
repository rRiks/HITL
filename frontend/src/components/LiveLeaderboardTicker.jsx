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
    <div className="bg-[#151515] border-b-2 border-[#252525] px-3 py-1 flex items-center gap-3 overflow-hidden text-[10px] sm:text-xs font-mono select-none text-white">
      {/* Fixed label */}
      <div className="flex items-center gap-1.5 shrink-0 text-[#ffd700] bg-[#222] px-2 py-0.5 border border-[#444] rounded shadow-xs font-bold">
        <Trophy className="w-3 h-3 text-[#ffd700]" />
        <span className="tracking-wider">REALM TICKER</span>
      </div>

      {/* Marquee ticker container */}
      <div className="overflow-hidden flex-1 relative h-5">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          {/* Your team */}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#252010] border border-[#ffaa00] text-white shadow-xs">
            <span className="w-1.5 h-1.5 bg-[#55ff55] animate-ping inline-block" />
            <span className="font-bold text-[#ffd700]">YOU [{currentTeamName} • {currentRoomId}]:</span>
            <span className="text-[#55ff55] font-bold">{currentHealth}% HP</span>
            <span className="text-[#666]">•</span>
            <span className="text-[#e0e0e0]">Wave {currentStage}/{totalStages}</span>
            <span className="text-[#666]">•</span>
            <span className="text-[#ff5555]">{totalPulls} Mined</span>
          </div>

          {/* Competitors across tables */}
          {leaderboardRooms.map((team, idx) => (
            <div key={idx} className="inline-flex items-center gap-1.5 text-[#ccc]">
              <span className="text-[#555]">|</span>
              <span className="font-bold text-white">{team.team_name}</span>
              <span className="text-[8px] text-[#888]">({team.room_id})</span>
              {team.is_game_over || team.status === 'collapsed' ? (
                <span className="text-[#ff5555] bg-[#3a0000] px-1.5 py-0.2 border border-[#aa0000] text-[8px] font-bold flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5" /> DIED!
                </span>
              ) : team.is_victory || team.status === 'victorious' ? (
                <span className="text-[#55ff55] bg-[#002b00] px-1.5 py-0.2 border border-[#00aa00] text-[8px] font-bold flex items-center gap-1">
                  🏆 WON!
                </span>
              ) : (
                <>
                  <span className={`font-bold ${team.health > 70 ? 'text-[#55ff55]' : 'text-[#ffaa00]'}`}>
                    {team.health}%
                  </span>
                  <span className="text-[#888] text-[8px]">W{team.current_stage}/{team.total_stages}</span>
                  {team.total_pulls > 0 && <span className="text-[#ff5555] text-[8px]">(-{team.total_pulls})</span>}
                </>
              )}
            </div>
          ))}

          {/* Repeat for continuous seamless loop */}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#252010] border border-[#ffaa00] text-white">
            <span className="w-1.5 h-1.5 bg-[#55ff55] inline-block" />
            <span className="font-bold text-[#ffd700]">YOU [{currentTeamName}]:</span>
            <span className="text-[#55ff55] font-bold">{currentHealth}% HP</span>
            <span className="text-[#e0e0e0]">Wave {currentStage}/{totalStages}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
