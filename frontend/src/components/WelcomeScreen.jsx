import React, { useState, useEffect } from 'react';
import { Play, Shield, Users, Clock, Rotate3d, Layers, Zap, User, Sparkles } from 'lucide-react';
import { getRoomId, fetchGameState, getPlayerName, setPlayerName } from '../services/api';

const TEAM_SUGGESTIONS = [
  'Alpha Devs',
  'Byte Busters',
  'Apex SREs',
  'Cloud Titans',
];

function slugifyTeam(name) {
  const clean = (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean || 'alpha-devs';
}

export default function WelcomeScreen({ onStartGame, onJoinLiveTable, defaultRoomId }) {
  const [teamName, setTeamName] = useState('Alpha Devs');
  const [playerName, setPlayerNameState] = useState(getPlayerName() || 'Steve');
  const [playerCount, setPlayerCount] = useState(4);
  const [tableStatus, setTableStatus] = useState(null);

  const derivedRoomId = slugifyTeam(teamName);

  useEffect(() => {
    let isCurrent = true;
    const checkTable = async () => {
      try {
        const state = await fetchGameState(derivedRoomId);
        if (!isCurrent) return;
        if (state && (state.has_started || state.current_stage_index > 0 || state.health < 100 || state.total_jenga_pulls > 0)) {
          setTableStatus({
            isLive: true,
            teamName: state.team_name,
            stage: state.current_stage_index + 1,
            health: state.health,
            totalStages: state.total_stages,
          });
        } else {
          setTableStatus({ isLive: false });
        }
      } catch {
        if (isCurrent) setTableStatus({ isLive: false });
      }
    };

    checkTable();
    const interval = setInterval(checkTable, 3000);
    return () => {
      isCurrent = false;
      clearInterval(interval);
    };
  }, [derivedRoomId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalPlayer = (playerName || '').trim() || 'Steve';
    const finalTeam = (teamName || '').trim() || 'Alpha Devs';
    setPlayerName(finalPlayer);
    onStartGame(finalTeam, playerCount, derivedRoomId, finalPlayer);
  };

  const handleJoin = () => {
    const finalPlayer = (playerName || '').trim() || 'Steve';
    const finalTeam = (teamName || '').trim() || 'Alpha Devs';
    setPlayerName(finalPlayer);
    if (onJoinLiveTable) {
      onJoinLiveTable(derivedRoomId, finalPlayer);
    } else {
      onStartGame(finalTeam, playerCount, derivedRoomId, finalPlayer);
    }
  };

  return (
    <div className="min-h-screen bg-mc-dirt text-white flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 select-none">
      <div className="max-w-3xl mx-auto w-full">
        {/* Minecraft Title Header & Yellow Splash Text */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1a110a] border-2 border-[#553311] text-[#ffd700] text-[10px] font-mono font-bold uppercase tracking-wider mb-3 shadow-lg">
            <Zap className="w-3.5 h-3.5 text-[#ffd700]" />
            <span>45-MINUTE SDLC VOXEL WORKSHOP</span>
          </div>

          <div className="relative inline-block mb-3">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-widest text-[#e0e0e0] mc-font drop-shadow-[0_5px_0_#222]">
              MINECRAFT <span className="text-[#ffd700]">SDLC</span>
            </h1>
            {/* Bouncing Classic Minecraft Yellow Splash Text */}
            <div
              className="absolute -bottom-3 -right-4 sm:-right-8 text-xs sm:text-sm text-[#ffff00] font-mono font-bold drop-shadow-[0_2px_0_#000] rotate-[-12deg] animate-bounce pointer-events-none whitespace-nowrap z-10"
              style={{ animationDuration: '0.9s' }}
            >
              Don't dig into Governor limits!
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#ccc] max-w-xl mx-auto leading-relaxed mt-2 font-mono">
            Balance sprint velocity, code quality, and the stability of your <strong>3D Voxel Tower</strong> across 11 high-pressure stages.
          </p>
        </div>

        {/* 4 Core Pillars Grid (Clean dark voxel cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="mc-panel-dark p-3.5 shadow-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <Clock className="w-4 h-4 text-[#ffd700]" />
              <h3 className="text-xs font-bold text-[#ffd700] font-mono">2-Minute Stage Clock</h3>
            </div>
            <p className="text-[11px] text-[#bbb] leading-relaxed font-mono">
              Strict 02:00 countdown per stage. If timer hits zero, timeout triggers automatic blind deploy!
            </p>
          </div>

          <div className="mc-panel-dark p-3.5 shadow-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <Rotate3d className="w-4 h-4 text-[#ffd700]" />
              <h3 className="text-xs font-bold text-[#ffd700] font-mono">3D Voxel Tower</h3>
            </div>
            <p className="text-[11px] text-[#bbb] leading-relaxed font-mono">
              54 physical blocks (Redstone, Diamond, Emerald, TNT). Risky merges extract blocks and destabilize the structure!
            </p>
          </div>

          <div className="mc-panel-dark p-3.5 shadow-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield className="w-4 h-4 text-[#55ff55]" />
              <h3 className="text-xs font-bold text-[#55ff55] font-mono">10 Pixel Hearts Health</h3>
            </div>
            <p className="text-[11px] text-[#bbb] leading-relaxed font-mono">
              Health starts at 10 hearts (100%). Tower instability and sway directly scale as health drops.
            </p>
          </div>

          <div className="mc-panel-dark p-3.5 shadow-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <Layers className="w-4 h-4 text-[#ffd700]" />
              <h3 className="text-xs font-bold text-[#ffd700] font-mono">Democratic Voting</h3>
            </div>
            <p className="text-[11px] text-[#bbb] leading-relaxed font-mono">
              All teammates vote on 4 actions. Locks as soon as everyone votes or timer ends.
            </p>
          </div>
        </div>

        {/* Streamlined Setup Form (Clean Minecraft Dark Panel with NO overlapping text) */}
        <div className="mc-panel-dark p-5 sm:p-7 shadow-2xl max-w-lg mx-auto">
          <div className="text-center mb-5 pb-3 border-b border-[#333]">
            <h2 className="text-sm sm:text-base font-bold text-[#ffd700] mc-font">
              START YOUR ADVENTURE
            </h2>
            <p className="text-[11px] text-[#aaa] font-mono mt-1">
              Enter your team name to begin or join your squad
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Team Name Input with Quick Chips */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#ffd700] uppercase mb-1.5">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Alpha Devs, Byte Busters..."
                className="w-full bg-[#111] border-2 border-[#555] text-white p-2.5 text-sm font-mono focus:outline-none focus:border-[#ffd700] transition-colors"
                required
              />

              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-[#888] font-mono">Quick Pick:</span>
                {TEAM_SUGGESTIONS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTeamName(preset)}
                    className={`text-[10px] font-mono px-2 py-0.5 border transition-all cursor-pointer ${
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

            {/* Player Name */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#ffd700] uppercase mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#ffd700]" />
                <span>Your Name (Gamer Tag)</span>
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerNameState(e.target.value)}
                placeholder="e.g. Steve, Alex, Dev..."
                className="w-full bg-[#111] border-2 border-[#555] text-white p-2.5 text-sm font-mono focus:outline-none focus:border-[#ffd700] transition-colors"
                required
              />
            </div>

            {/* Team Size */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#ffd700] uppercase mb-1.5">
                Team Size
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setPlayerCount(cnt)}
                    className={`mc-btn py-2 text-xs font-mono cursor-pointer ${
                      playerCount === cnt ? 'mc-btn-green text-white' : ''
                    }`}
                  >
                    {cnt} Players
                  </button>
                ))}
              </div>
            </div>

            {/* Live Session Status / Actions */}
            <div className="pt-3">
              {tableStatus?.isLive ? (
                <div className="space-y-3">
                  <div className="p-3 bg-[#132813] border-2 border-[#2d5a2d] text-white flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 bg-[#55ff55] animate-ping shrink-0 inline-block" />
                      <div>
                        <span className="text-[10px] font-mono text-[#55ff55] uppercase font-bold block">
                          SESSION ACTIVE • GAME IN PROGRESS
                        </span>
                        <p className="text-xs text-white font-mono font-bold">
                          {tableStatus.teamName} • Stage {tableStatus.stage}/{tableStatus.totalStages} • {tableStatus.health}% HP
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-[#55ff55] bg-[#111] px-2 py-0.5 border border-[#2d5a2d]">
                      LIVE
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleJoin}
                    className="mc-btn mc-btn-green w-full py-3.5 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Users className="w-4 h-4" />
                    <span>JOIN ACTIVE SQUAD ➔</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="submit"
                      className="text-[11px] font-mono text-[#888] hover:text-[#ff5555] underline cursor-pointer"
                    >
                      Or reset and start fresh game for this team
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  className="mc-btn mc-btn-green w-full py-3.5 text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-xl tracking-wider"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START GAME: STAGE 1 ➔</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[10px] font-mono text-[#888] mt-8">
        Developer Day Workshop Edition • Real-Time 3D Voxel SDLC Simulation
      </footer>
    </div>
  );
}
